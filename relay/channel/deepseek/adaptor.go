package deepseek

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/QuantumNous/make-api-private/common"
	"github.com/QuantumNous/make-api-private/dto"
	"github.com/QuantumNous/make-api-private/logger"
	"github.com/QuantumNous/make-api-private/relay/channel"
	"github.com/QuantumNous/make-api-private/relay/channel/claude"
	"github.com/QuantumNous/make-api-private/relay/channel/openai"
	relaycommon "github.com/QuantumNous/make-api-private/relay/common"
	"github.com/QuantumNous/make-api-private/relay/constant"
	"github.com/QuantumNous/make-api-private/relay/helper"
	"github.com/QuantumNous/make-api-private/service"
	"github.com/QuantumNous/make-api-private/setting/reasoning"
	"github.com/QuantumNous/make-api-private/types"
	"github.com/gin-gonic/gin"
)

type Adaptor struct {
}

func (a *Adaptor) ConvertGeminiRequest(*gin.Context, *relaycommon.RelayInfo, *dto.GeminiChatRequest) (any, error) {
	//TODO implement me
	return nil, errors.New("not implemented")
}

func (a *Adaptor) ConvertClaudeRequest(c *gin.Context, info *relaycommon.RelayInfo, req *dto.ClaudeRequest) (any, error) {
	adaptor := claude.Adaptor{}
	convertedRequest, err := adaptor.ConvertClaudeRequest(c, info, req)
	if err != nil {
		return nil, err
	}
	claudeRequest, ok := convertedRequest.(*dto.ClaudeRequest)
	if !ok {
		return convertedRequest, nil
	}
	if err := applyDeepSeekV4ClaudeThinkingSuffix(info, claudeRequest); err != nil {
		return nil, err
	}
	return claudeRequest, nil
}

func (a *Adaptor) ConvertAudioRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.AudioRequest) (io.Reader, error) {
	//TODO implement me
	return nil, errors.New("not implemented")
}

func (a *Adaptor) ConvertImageRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.ImageRequest) (any, error) {
	//TODO implement me
	return nil, errors.New("not implemented")
}

func (a *Adaptor) Init(info *relaycommon.RelayInfo) {
}

func (a *Adaptor) GetRequestURL(info *relaycommon.RelayInfo) (string, error) {
	fimBaseUrl := info.ChannelBaseUrl
	switch info.RelayFormat {
	case types.RelayFormatClaude:
		return fmt.Sprintf("%s/anthropic/v1/messages", info.ChannelBaseUrl), nil
	default:
		if !strings.HasSuffix(info.ChannelBaseUrl, "/beta") {
			fimBaseUrl += "/beta"
		}
		switch info.RelayMode {
		case constant.RelayModeCompletions:
			return fmt.Sprintf("%s/completions", fimBaseUrl), nil
		default:
			return fmt.Sprintf("%s/v1/chat/completions", info.ChannelBaseUrl), nil
		}
	}
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Header, info *relaycommon.RelayInfo) error {
	channel.SetupApiRequestHeader(info, c, req)
	req.Set("Authorization", "Bearer "+info.ApiKey)
	return nil
}

func (a *Adaptor) ConvertOpenAIRequest(c *gin.Context, info *relaycommon.RelayInfo, request *dto.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	if err := applyDeepSeekV4OpenAIThinkingSuffix(info, request); err != nil {
		return nil, err
	}

	return request, nil
}

func applyDeepSeekV4OpenAIThinkingSuffix(info *relaycommon.RelayInfo, request *dto.GeneralOpenAIRequest) error {
	modelName := request.Model
	if info != nil && info.ChannelMeta != nil && info.UpstreamModelName != "" {
		modelName = info.UpstreamModelName
	}
	baseModel, thinkingType, effort, ok := reasoning.ParseDeepSeekV4ThinkingSuffix(modelName)
	if !ok {
		return nil
	}
	thinking, err := common.Marshal(map[string]string{
		"type": thinkingType,
	})
	if err != nil {
		return fmt.Errorf("error marshalling thinking: %w", err)
	}
	request.Model = baseModel
	request.THINKING = thinking
	request.ReasoningEffort = effort
	if info != nil {
		if info.ChannelMeta != nil {
			info.UpstreamModelName = baseModel
		}
		info.ReasoningEffort = effort
	}
	return nil
}

func applyDeepSeekV4ClaudeThinkingSuffix(info *relaycommon.RelayInfo, request *dto.ClaudeRequest) error {
	modelName := request.Model
	if info != nil && info.ChannelMeta != nil && info.UpstreamModelName != "" {
		modelName = info.UpstreamModelName
	}
	baseModel, thinkingType, effort, ok := reasoning.ParseDeepSeekV4ThinkingSuffix(modelName)
	if !ok {
		return nil
	}
	request.Model = baseModel
	request.Thinking = &dto.Thinking{Type: thinkingType}
	if effort == "" {
		request.OutputConfig = nil
	} else {
		outputConfig, err := common.Marshal(map[string]string{
			"effort": effort,
		})
		if err != nil {
			return fmt.Errorf("error marshalling output_config: %w", err)
		}
		request.OutputConfig = outputConfig
	}
	if info != nil {
		if info.ChannelMeta != nil {
			info.UpstreamModelName = baseModel
		}
		info.ReasoningEffort = effort
	}
	return nil
}

func (a *Adaptor) ConvertRerankRequest(c *gin.Context, relayMode int, request dto.RerankRequest) (any, error) {
	return nil, nil
}

func (a *Adaptor) ConvertEmbeddingRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.EmbeddingRequest) (any, error) {
	//TODO implement me
	return nil, errors.New("not implemented")
}

func (a *Adaptor) ConvertOpenAIResponsesRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.OpenAIResponsesRequest) (any, error) {
	chatReq, err := service.ResponsesRequestToChatCompletionsRequest(&request)
	if err != nil {
		return nil, err
	}
	if err := applyDeepSeekV4OpenAIThinkingSuffix(info, chatReq); err != nil {
		return nil, err
	}
	if info != nil {
		info.FinalRequestRelayFormat = types.RelayFormatOpenAI
	}
	return chatReq, nil
}

func (a *Adaptor) DoRequest(c *gin.Context, info *relaycommon.RelayInfo, requestBody io.Reader) (any, error) {
	return channel.DoApiRequest(a, c, info, requestBody)
}

func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, info *relaycommon.RelayInfo) (usage any, err *types.NewAPIError) {
	if info != nil && info.RelayMode == constant.RelayModeResponses {
		if info.IsStream {
			return deepseekChatToResponsesStreamHandler(c, info, resp)
		}
		return deepseekChatToResponsesHandler(c, info, resp)
	}
	switch info.RelayFormat {
	case types.RelayFormatClaude:
		adaptor := claude.Adaptor{}
		return adaptor.DoResponse(c, resp, info)
	default:
		adaptor := openai.Adaptor{}
		return adaptor.DoResponse(c, resp, info)
	}
}

func (a *Adaptor) GetModelList() []string {
	return ModelList
}

func (a *Adaptor) GetChannelName() string {
	return ChannelName
}

func deepseekChatToResponsesHandler(c *gin.Context, info *relaycommon.RelayInfo, resp *http.Response) (*dto.Usage, *types.NewAPIError) {
	if resp == nil || resp.Body == nil {
		return nil, types.NewOpenAIError(fmt.Errorf("invalid response"), types.ErrorCodeBadResponse, http.StatusInternalServerError)
	}
	defer service.CloseResponseBodyGracefully(resp)

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeReadResponseBodyFailed, http.StatusInternalServerError)
	}

	var chatResp dto.OpenAITextResponse
	if err := common.Unmarshal(body, &chatResp); err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeBadResponseBody, http.StatusInternalServerError)
	}
	if oaiError := chatResp.GetOpenAIError(); oaiError != nil && oaiError.Type != "" {
		return nil, types.WithOpenAIError(*oaiError, resp.StatusCode)
	}

	responseID := fmt.Sprintf("resp_%s", helper.GetResponseID(c))
	responsesResp, usage, err := service.ChatCompletionsResponseToResponsesResponse(&chatResp, responseID)
	if err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeBadResponseBody, http.StatusInternalServerError)
	}
	if usage == nil || usage.TotalTokens == 0 {
		var textBuilder strings.Builder
		for _, choice := range chatResp.Choices {
			textBuilder.WriteString(choice.Message.StringContent())
			textBuilder.WriteString(choice.Message.GetReasoningContent())
		}
		usage = service.ResponseText2Usage(c, textBuilder.String(), info.UpstreamModelName, info.GetEstimatePromptTokens())
		responsesResp.Usage = usage
	}

	responseBody, err := common.Marshal(responsesResp)
	if err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeJsonMarshalFailed, http.StatusInternalServerError)
	}
	service.IOCopyBytesGracefully(c, resp, responseBody)
	return usage, nil
}

func deepseekChatToResponsesStreamHandler(c *gin.Context, info *relaycommon.RelayInfo, resp *http.Response) (*dto.Usage, *types.NewAPIError) {
	if resp == nil || resp.Body == nil {
		return nil, types.NewOpenAIError(fmt.Errorf("invalid response"), types.ErrorCodeBadResponse, http.StatusInternalServerError)
	}
	defer service.CloseResponseBodyGracefully(resp)

	responseID := fmt.Sprintf("resp_%s", helper.GetResponseID(c))
	model := info.UpstreamModelName
	createdAt := 0
	outputIndex := 0
	sentCreated := false
	sentMessageAdded := false
	sentCompleted := false
	var outputText strings.Builder
	var usageText strings.Builder
	usage := &dto.Usage{}
	var streamErr *types.NewAPIError
	toolCallIndexByID := make(map[string]int)
	toolCallIDByIndex := make(map[int]string)
	toolCallNameByID := make(map[string]string)
	toolCallArgsByID := make(map[string]string)

	sendResponsesEvent := func(event dto.ResponsesStreamResponse) bool {
		data, err := common.Marshal(event)
		if err != nil {
			streamErr = types.NewOpenAIError(err, types.ErrorCodeJsonMarshalFailed, http.StatusInternalServerError)
			return false
		}
		helper.ResponseChunkData(c, event, string(data))
		return true
	}

	sendCreatedIfNeeded := func() bool {
		if sentCreated {
			return true
		}
		status, _ := common.Marshal("in_progress")
		if !sendResponsesEvent(dto.ResponsesStreamResponse{
			Type: "response.created",
			Response: &dto.OpenAIResponsesResponse{
				ID:        responseID,
				Object:    "response",
				CreatedAt: createdAt,
				Status:    status,
				Model:     model,
			},
		}) {
			return false
		}
		sentCreated = true
		return true
	}

	sendMessageAddedIfNeeded := func() bool {
		if sentMessageAdded {
			return true
		}
		if !sendCreatedIfNeeded() {
			return false
		}
		if !sendResponsesEvent(dto.ResponsesStreamResponse{
			Type:        "response.output_item.added",
			OutputIndex: &outputIndex,
			Item: &dto.ResponsesOutput{
				Type:   "message",
				ID:     fmt.Sprintf("msg_%s_0", responseID),
				Status: "in_progress",
				Role:   "assistant",
			},
		}) {
			return false
		}
		sentMessageAdded = true
		return true
	}

	helper.StreamScannerHandler(c, resp, info, func(data string, sr *helper.StreamResult) {
		if streamErr != nil {
			sr.Stop(streamErr)
			return
		}
		var chunk dto.ChatCompletionsStreamResponse
		if err := common.UnmarshalJsonStr(data, &chunk); err != nil {
			logger.LogError(c, "failed to unmarshal chat stream response: "+err.Error())
			sr.Error(err)
			return
		}
		if chunk.Model != "" {
			model = chunk.Model
		}
		if chunk.Created != 0 {
			createdAt = int(chunk.Created)
		}
		if chunk.Usage != nil {
			usage = chunk.Usage
		}
		if !sendCreatedIfNeeded() {
			sr.Stop(streamErr)
			return
		}
		for _, choice := range chunk.Choices {
			if delta := choice.Delta.GetReasoningContent(); delta != "" {
				usageText.WriteString(delta)
			}
			if content := choice.Delta.GetContentString(); content != "" {
				if !sendMessageAddedIfNeeded() {
					sr.Stop(streamErr)
					return
				}
				outputText.WriteString(content)
				usageText.WriteString(content)
				if !sendResponsesEvent(dto.ResponsesStreamResponse{
					Type:         "response.output_text.delta",
					Delta:        content,
					OutputIndex:  &outputIndex,
					ContentIndex: common.GetPointer(0),
					ItemID:       fmt.Sprintf("msg_%s_0", responseID),
				}) {
					sr.Stop(streamErr)
					return
				}
			}
			for _, tool := range choice.Delta.ToolCalls {
				idx := 0
				if tool.Index != nil {
					idx = *tool.Index
				}
				callID := strings.TrimSpace(tool.ID)
				if callID == "" {
					callID = toolCallIDByIndex[idx]
				}
				if callID == "" {
					continue
				}
				toolCallIDByIndex[idx] = callID
				if _, ok := toolCallIndexByID[callID]; !ok {
					toolCallIndexByID[callID] = outputIndex
				}
				if tool.Function.Name != "" {
					toolCallNameByID[callID] = tool.Function.Name
				}
				if tool.Function.Arguments != "" {
					toolCallArgsByID[callID] += tool.Function.Arguments
				}
				usageText.WriteString(tool.Function.Name)
				usageText.WriteString(tool.Function.Arguments)
			}
			if choice.FinishReason != nil && *choice.FinishReason != "" {
				for callID, idx := range toolCallIndexByID {
					args := toolCallArgsByID[callID]
					name := toolCallNameByID[callID]
					if args == "" && name == "" {
						continue
					}
					rawArgs := common.StringToByteSlice(args)
					if strings.TrimSpace(args) == "" {
						rawArgs = common.StringToByteSlice("{}")
					}
					if !sendResponsesEvent(dto.ResponsesStreamResponse{
						Type:        "response.output_item.done",
						OutputIndex: &idx,
						Item: &dto.ResponsesOutput{
							Type:      "function_call",
							ID:        callID,
							Status:    "completed",
							CallId:    callID,
							Name:      name,
							Arguments: rawArgs,
						},
					}) {
						sr.Stop(streamErr)
						return
					}
					if idx >= outputIndex {
						outputIndex = idx + 1
					}
				}
				if sentMessageAdded {
					text := outputText.String()
					if !sendResponsesEvent(dto.ResponsesStreamResponse{
						Type:        "response.output_item.done",
						OutputIndex: &outputIndex,
						Item: &dto.ResponsesOutput{
							Type:    "message",
							ID:      fmt.Sprintf("msg_%s_0", responseID),
							Status:  "completed",
							Role:    "assistant",
							Content: []dto.ResponsesOutputContent{{Type: "output_text", Text: text}},
						},
					}) {
						sr.Stop(streamErr)
						return
					}
				}
				sentCompleted = true
			}
		}
	})

	if streamErr != nil {
		return nil, streamErr
	}
	if usage.TotalTokens == 0 {
		usage = service.ResponseText2Usage(c, usageText.String(), info.UpstreamModelName, info.GetEstimatePromptTokens())
	}
	if !sentCreated {
		if !sendCreatedIfNeeded() {
			return nil, streamErr
		}
	}
	if !sentCompleted {
		if sentMessageAdded {
			text := outputText.String()
			if !sendResponsesEvent(dto.ResponsesStreamResponse{
				Type:        "response.output_item.done",
				OutputIndex: &outputIndex,
				Item: &dto.ResponsesOutput{
					Type:    "message",
					ID:      fmt.Sprintf("msg_%s_0", responseID),
					Status:  "completed",
					Role:    "assistant",
					Content: []dto.ResponsesOutputContent{{Type: "output_text", Text: text}},
				},
			}) {
				return nil, streamErr
			}
		}
	}
	status, _ := common.Marshal("completed")
	finalOutput := make([]dto.ResponsesOutput, 0, len(toolCallIndexByID)+1)
	for callID := range toolCallIndexByID {
		args := toolCallArgsByID[callID]
		rawArgs := common.StringToByteSlice(args)
		if strings.TrimSpace(args) == "" {
			rawArgs = common.StringToByteSlice("{}")
		}
		finalOutput = append(finalOutput, dto.ResponsesOutput{
			Type:      "function_call",
			ID:        callID,
			Status:    "completed",
			CallId:    callID,
			Name:      toolCallNameByID[callID],
			Arguments: rawArgs,
		})
	}
	if outputText.Len() > 0 || len(finalOutput) == 0 {
		finalOutput = append(finalOutput, dto.ResponsesOutput{
			Type:    "message",
			ID:      fmt.Sprintf("msg_%s_0", responseID),
			Status:  "completed",
			Role:    "assistant",
			Content: []dto.ResponsesOutputContent{{Type: "output_text", Text: outputText.String()}},
		})
	}
	if !sendResponsesEvent(dto.ResponsesStreamResponse{
		Type: "response.completed",
		Response: &dto.OpenAIResponsesResponse{
			ID:        responseID,
			Object:    "response",
			CreatedAt: createdAt,
			Status:    status,
			Model:     model,
			Output:    finalOutput,
			Usage:     usage,
		},
	}) {
		return nil, streamErr
	}
	helper.Done(c)
	return usage, nil
}
