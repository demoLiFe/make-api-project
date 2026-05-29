package openaicompat

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/QuantumNous/make-api-private/common"
	"github.com/QuantumNous/make-api-private/dto"
	"github.com/samber/lo"
)

func ResponsesRequestToChatCompletionsRequest(req *dto.OpenAIResponsesRequest) (*dto.GeneralOpenAIRequest, error) {
	if req == nil {
		return nil, errors.New("request is nil")
	}
	if req.Model == "" {
		return nil, errors.New("model is required")
	}

	messages, err := responsesInputToChatMessages(req.Input)
	if err != nil {
		return nil, err
	}
	if len(req.Instructions) > 0 {
		var instructions string
		if err := common.Unmarshal(req.Instructions, &instructions); err == nil && strings.TrimSpace(instructions) != "" {
			messages = append([]dto.Message{{Role: "system", Content: instructions}}, messages...)
		}
	}

	tools, err := responsesToolsToChatTools(req.Tools)
	if err != nil {
		return nil, err
	}
	toolChoice, err := responsesToolChoiceToChatToolChoice(req.ToolChoice)
	if err != nil {
		return nil, err
	}
	responseFormat, err := responsesTextToChatResponseFormat(req.Text)
	if err != nil {
		return nil, err
	}

	out := &dto.GeneralOpenAIRequest{
		Model:            req.Model,
		Messages:         messages,
		Stream:           req.Stream,
		StreamOptions:    req.StreamOptions,
		MaxTokens:        req.MaxOutputTokens,
		Temperature:      req.Temperature,
		TopP:             req.TopP,
		Tools:            tools,
		ToolChoice:       toolChoice,
		ResponseFormat:   responseFormat,
		User:             req.User,
		Metadata:         req.Metadata,
		Store:            req.Store,
		ServiceTier:      rawMessageOrNil(req.ServiceTier),
		TopLogProbs:      req.TopLogProbs,
		ParallelTooCalls: rawBoolPtr(req.ParallelToolCalls),
	}
	if req.Reasoning != nil {
		out.ReasoningEffort = req.Reasoning.Effort
	}
	return out, nil
}

func rawMessageOrNil(s string) json.RawMessage {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	b, _ := common.Marshal(s)
	return b
}

func rawBoolPtr(raw json.RawMessage) *bool {
	if len(raw) == 0 {
		return nil
	}
	var b bool
	if err := common.Unmarshal(raw, &b); err != nil {
		return nil
	}
	return &b
}

func responsesInputToChatMessages(raw json.RawMessage) ([]dto.Message, error) {
	if len(raw) == 0 {
		return nil, nil
	}
	switch common.GetJsonType(raw) {
	case "string":
		var text string
		if err := common.Unmarshal(raw, &text); err != nil {
			return nil, err
		}
		return []dto.Message{{Role: "user", Content: text}}, nil
	case "array":
		var items []map[string]any
		if err := common.Unmarshal(raw, &items); err != nil {
			return nil, err
		}
		messages := make([]dto.Message, 0, len(items))
		for _, item := range items {
			msgs, err := responsesInputItemToChatMessages(item)
			if err != nil {
				return nil, err
			}
			messages = append(messages, msgs...)
		}
		return messages, nil
	case "object":
		var item map[string]any
		if err := common.Unmarshal(raw, &item); err != nil {
			return nil, err
		}
		return responsesInputItemToChatMessages(item)
	default:
		return nil, fmt.Errorf("unsupported responses input type: %s", common.GetJsonType(raw))
	}
}

func responsesInputItemToChatMessages(item map[string]any) ([]dto.Message, error) {
	itemType := common.Interface2String(item["type"])
	switch itemType {
	case "function_call_output":
		callID := strings.TrimSpace(common.Interface2String(item["call_id"]))
		output := item["output"]
		if output == nil {
			output = ""
		}
		return []dto.Message{{
			Role:       "tool",
			ToolCallId: callID,
			Content:    stringifyContent(output),
		}}, nil
	case "function_call":
		callID := strings.TrimSpace(common.Interface2String(item["call_id"]))
		if callID == "" {
			callID = strings.TrimSpace(common.Interface2String(item["id"]))
		}
		name := strings.TrimSpace(common.Interface2String(item["name"]))
		args := common.JsonRawMessageToString(mustMarshalRaw(item["arguments"]))
		msg := dto.Message{Role: "assistant", Content: nil}
		msg.SetToolCalls([]dto.ToolCallRequest{{
			ID:   callID,
			Type: "function",
			Function: dto.FunctionRequest{
				Name:      name,
				Arguments: args,
			},
		}})
		return []dto.Message{msg}, nil
	case "message", "":
		role := strings.TrimSpace(common.Interface2String(item["role"]))
		if role == "" {
			role = "user"
		}
		content, err := responsesContentToChatContent(item["content"], role)
		if err != nil {
			return nil, err
		}
		return []dto.Message{{Role: role, Content: content}}, nil
	default:
		return []dto.Message{{Role: "user", Content: stringifyContent(item)}}, nil
	}
}

func responsesContentToChatContent(content any, role string) (any, error) {
	if content == nil {
		return "", nil
	}
	switch v := content.(type) {
	case string:
		return v, nil
	case []any:
		parts := make([]dto.MediaContent, 0, len(v))
		for _, partAny := range v {
			part, ok := partAny.(map[string]any)
			if !ok {
				continue
			}
			partType := common.Interface2String(part["type"])
			switch partType {
			case "input_text", "output_text":
				parts = append(parts, dto.MediaContent{Type: dto.ContentTypeText, Text: common.Interface2String(part["text"])})
			case "input_image":
				parts = append(parts, dto.MediaContent{Type: dto.ContentTypeImageURL, ImageUrl: part["image_url"]})
			case "input_audio":
				parts = append(parts, dto.MediaContent{Type: dto.ContentTypeInputAudio, InputAudio: part["input_audio"]})
			case "input_file":
				parts = append(parts, dto.MediaContent{Type: dto.ContentTypeFile, File: part["file"]})
			default:
				if text := common.Interface2String(part["text"]); text != "" {
					parts = append(parts, dto.MediaContent{Type: dto.ContentTypeText, Text: text})
				}
			}
		}
		if len(parts) == 1 && parts[0].Type == dto.ContentTypeText {
			return parts[0].Text, nil
		}
		return parts, nil
	default:
		return stringifyContent(content), nil
	}
}

func stringifyContent(v any) string {
	switch value := v.(type) {
	case string:
		return value
	case json.RawMessage:
		return common.JsonRawMessageToString(value)
	default:
		b, err := common.Marshal(value)
		if err != nil {
			return fmt.Sprintf("%v", value)
		}
		return string(b)
	}
}

func mustMarshalRaw(v any) json.RawMessage {
	switch vv := v.(type) {
	case nil:
		return nil
	case json.RawMessage:
		return vv
	case string:
		return json.RawMessage(vv)
	default:
		b, _ := common.Marshal(vv)
		return b
	}
}

func responsesToolsToChatTools(raw json.RawMessage) ([]dto.ToolCallRequest, error) {
	if len(raw) == 0 {
		return nil, nil
	}
	var tools []map[string]any
	if err := common.Unmarshal(raw, &tools); err != nil {
		return nil, err
	}
	out := make([]dto.ToolCallRequest, 0, len(tools))
	for _, tool := range tools {
		toolType := common.Interface2String(tool["type"])
		if toolType != "function" {
			continue
		}
		out = append(out, dto.ToolCallRequest{
			Type: "function",
			Function: dto.FunctionRequest{
				Name:        common.Interface2String(tool["name"]),
				Description: common.Interface2String(tool["description"]),
				Parameters:  tool["parameters"],
			},
		})
	}
	return out, nil
}

func responsesToolChoiceToChatToolChoice(raw json.RawMessage) (any, error) {
	if len(raw) == 0 {
		return nil, nil
	}
	var s string
	if err := common.Unmarshal(raw, &s); err == nil {
		return s, nil
	}
	var m map[string]any
	if err := common.Unmarshal(raw, &m); err != nil {
		return nil, err
	}
	if common.Interface2String(m["type"]) == "function" {
		if name := common.Interface2String(m["name"]); name != "" {
			return map[string]any{
				"type": "function",
				"function": map[string]any{
					"name": name,
				},
			}, nil
		}
	}
	return m, nil
}

func responsesTextToChatResponseFormat(raw json.RawMessage) (*dto.ResponseFormat, error) {
	if len(raw) == 0 {
		return nil, nil
	}
	var text map[string]any
	if err := common.Unmarshal(raw, &text); err != nil {
		return nil, err
	}
	format, ok := text["format"].(map[string]any)
	if !ok {
		return nil, nil
	}
	formatType := common.Interface2String(format["type"])
	if strings.TrimSpace(formatType) == "" {
		return nil, nil
	}
	out := &dto.ResponseFormat{Type: formatType}
	if formatType == "json_schema" {
		schema := make(map[string]any, len(format))
		for k, v := range format {
			if k == "type" {
				continue
			}
			schema[k] = v
		}
		if len(schema) > 0 {
			out.JsonSchema, _ = common.Marshal(schema)
		}
	}
	return out, nil
}

func ResponsesResponseToChatCompletionsResponse(resp *dto.OpenAIResponsesResponse, id string) (*dto.OpenAITextResponse, *dto.Usage, error) {
	if resp == nil {
		return nil, nil, errors.New("response is nil")
	}

	text := ExtractOutputTextFromResponses(resp)

	usage := &dto.Usage{}
	if resp.Usage != nil {
		if resp.Usage.InputTokens != 0 {
			usage.PromptTokens = resp.Usage.InputTokens
			usage.InputTokens = resp.Usage.InputTokens
		}
		if resp.Usage.OutputTokens != 0 {
			usage.CompletionTokens = resp.Usage.OutputTokens
			usage.OutputTokens = resp.Usage.OutputTokens
		}
		if resp.Usage.TotalTokens != 0 {
			usage.TotalTokens = resp.Usage.TotalTokens
		} else {
			usage.TotalTokens = usage.PromptTokens + usage.CompletionTokens
		}
		if resp.Usage.InputTokensDetails != nil {
			usage.PromptTokensDetails.CachedTokens = resp.Usage.InputTokensDetails.CachedTokens
			usage.PromptTokensDetails.ImageTokens = resp.Usage.InputTokensDetails.ImageTokens
			usage.PromptTokensDetails.AudioTokens = resp.Usage.InputTokensDetails.AudioTokens
		}
		if resp.Usage.CompletionTokenDetails.ReasoningTokens != 0 {
			usage.CompletionTokenDetails.ReasoningTokens = resp.Usage.CompletionTokenDetails.ReasoningTokens
		}
	}

	created := resp.CreatedAt

	var toolCalls []dto.ToolCallResponse
	if text == "" && len(resp.Output) > 0 {
		for _, out := range resp.Output {
			if out.Type != "function_call" {
				continue
			}
			name := strings.TrimSpace(out.Name)
			if name == "" {
				continue
			}
			callId := strings.TrimSpace(out.CallId)
			if callId == "" {
				callId = strings.TrimSpace(out.ID)
			}
			toolCalls = append(toolCalls, dto.ToolCallResponse{
				ID:   callId,
				Type: "function",
				Function: dto.FunctionResponse{
					Name:      name,
					Arguments: out.ArgumentsString(),
				},
			})
		}
	}

	finishReason := "stop"
	if len(toolCalls) > 0 {
		finishReason = "tool_calls"
	}

	msg := dto.Message{
		Role:    "assistant",
		Content: text,
	}
	if len(toolCalls) > 0 {
		msg.SetToolCalls(toolCalls)
		msg.Content = ""
	}

	out := &dto.OpenAITextResponse{
		Id:      id,
		Object:  "chat.completion",
		Created: created,
		Model:   resp.Model,
		Choices: []dto.OpenAITextResponseChoice{
			{
				Index:        0,
				Message:      msg,
				FinishReason: finishReason,
			},
		},
		Usage: *usage,
	}

	return out, usage, nil
}

func ExtractOutputTextFromResponses(resp *dto.OpenAIResponsesResponse) string {
	if resp == nil || len(resp.Output) == 0 {
		return ""
	}

	var sb strings.Builder

	// Prefer assistant message outputs.
	for _, out := range resp.Output {
		if out.Type != "message" {
			continue
		}
		if out.Role != "" && out.Role != "assistant" {
			continue
		}
		for _, c := range out.Content {
			if c.Type == "output_text" && c.Text != "" {
				sb.WriteString(c.Text)
			}
		}
	}
	if sb.Len() > 0 {
		return sb.String()
	}
	for _, out := range resp.Output {
		for _, c := range out.Content {
			if c.Text != "" {
				sb.WriteString(c.Text)
			}
		}
	}
	return sb.String()
}

func ChatCompletionsResponseToResponsesResponse(resp *dto.OpenAITextResponse, id string) (*dto.OpenAIResponsesResponse, *dto.Usage, error) {
	if resp == nil {
		return nil, nil, errors.New("response is nil")
	}
	if oaiError := resp.GetOpenAIError(); oaiError != nil && oaiError.Type != "" {
		return &dto.OpenAIResponsesResponse{ID: id, Object: "response", Model: resp.Model, Error: oaiError}, nil, nil
	}
	createdAt := 0
	switch v := resp.Created.(type) {
	case int:
		createdAt = v
	case int64:
		createdAt = int(v)
	case float64:
		createdAt = int(v)
	case json.Number:
		if i, err := v.Int64(); err == nil {
			createdAt = int(i)
		}
	}
	output := make([]dto.ResponsesOutput, 0)
	for _, choice := range resp.Choices {
		msg := choice.Message
		for _, tc := range msg.ParseToolCalls() {
			if tc.Type != "" && tc.Type != "function" {
				continue
			}
			output = append(output, dto.ResponsesOutput{
				Type:      "function_call",
				ID:        tc.ID,
				Status:    "completed",
				CallId:    tc.ID,
				Name:      tc.Function.Name,
				Arguments: json.RawMessage(tc.Function.Arguments),
			})
		}
		text := msg.StringContent()
		if text == "" && msg.Content != nil {
			text = stringifyContent(msg.Content)
		}
		if text != "" {
			output = append(output, dto.ResponsesOutput{
				Type:   "message",
				ID:     fmt.Sprintf("msg_%s_%d", id, choice.Index),
				Status: "completed",
				Role:   lo.Ternary(msg.Role != "", msg.Role, "assistant"),
				Content: []dto.ResponsesOutputContent{
					{Type: "output_text", Text: text},
				},
			})
		}
	}
	status, _ := common.Marshal("completed")
	out := &dto.OpenAIResponsesResponse{
		ID:                id,
		Object:            "response",
		CreatedAt:         createdAt,
		Status:            status,
		Model:             resp.Model,
		Output:            output,
		ParallelToolCalls: true,
		Usage:             &resp.Usage,
	}
	return out, &resp.Usage, nil
}
