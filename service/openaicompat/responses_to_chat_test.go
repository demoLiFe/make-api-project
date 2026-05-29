package openaicompat

import (
	"testing"

	"github.com/QuantumNous/make-api-private/common"
	"github.com/QuantumNous/make-api-private/dto"
)

func TestResponsesRequestToChatCompletionsRequestStringInput(t *testing.T) {
	stream := true
	req := &dto.OpenAIResponsesRequest{
		Model:  "deepseek-chat",
		Input:  common.StringToByteSlice(`"hello"`),
		Stream: &stream,
	}

	got, err := ResponsesRequestToChatCompletionsRequest(req)
	if err != nil {
		t.Fatal(err)
	}
	if got.Model != "deepseek-chat" {
		t.Fatalf("model = %q", got.Model)
	}
	if got.Stream == nil || !*got.Stream {
		t.Fatalf("stream not preserved")
	}
	if len(got.Messages) != 1 || got.Messages[0].Role != "user" || got.Messages[0].StringContent() != "hello" {
		t.Fatalf("unexpected messages: %#v", got.Messages)
	}
}

func TestResponsesRequestToChatCompletionsRequestToolsAndOutputs(t *testing.T) {
	req := &dto.OpenAIResponsesRequest{
		Model:        "deepseek-chat",
		Instructions: common.StringToByteSlice(`"be concise"`),
		Input: common.StringToByteSlice(`[
			{"role":"user","content":[{"type":"input_text","text":"weather?"}]},
			{"type":"function_call_output","call_id":"call_1","output":"sunny"}
		]`),
		Tools: common.StringToByteSlice(`[
			{"type":"function","name":"get_weather","description":"Get weather","parameters":{"type":"object"}}
		]`),
		ToolChoice: common.StringToByteSlice(`{"type":"function","name":"get_weather"}`),
	}

	got, err := ResponsesRequestToChatCompletionsRequest(req)
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Messages) != 3 {
		t.Fatalf("messages len = %d", len(got.Messages))
	}
	if got.Messages[0].Role != "system" || got.Messages[0].StringContent() != "be concise" {
		t.Fatalf("instructions not mapped: %#v", got.Messages[0])
	}
	if got.Messages[1].Role != "user" || got.Messages[1].StringContent() != "weather?" {
		t.Fatalf("user message not mapped: %#v", got.Messages[1])
	}
	if got.Messages[2].Role != "tool" || got.Messages[2].ToolCallId != "call_1" || got.Messages[2].StringContent() != "sunny" {
		t.Fatalf("tool output not mapped: %#v", got.Messages[2])
	}
	if len(got.Tools) != 1 || got.Tools[0].Function.Name != "get_weather" {
		t.Fatalf("tools not mapped: %#v", got.Tools)
	}
	choice, ok := got.ToolChoice.(map[string]any)
	if !ok || choice["type"] != "function" {
		t.Fatalf("tool choice not mapped: %#v", got.ToolChoice)
	}
}

func TestChatCompletionsResponseToResponsesResponse(t *testing.T) {
	resp := &dto.OpenAITextResponse{
		Id:      "chatcmpl_test",
		Object:  "chat.completion",
		Created: float64(123),
		Model:   "deepseek-chat",
		Choices: []dto.OpenAITextResponseChoice{
			{
				Index: 0,
				Message: dto.Message{
					Role:    "assistant",
					Content: "done",
				},
				FinishReason: "stop",
			},
		},
		Usage: dto.Usage{PromptTokens: 1, CompletionTokens: 2, TotalTokens: 3},
	}

	got, usage, err := ChatCompletionsResponseToResponsesResponse(resp, "resp_test")
	if err != nil {
		t.Fatal(err)
	}
	if usage == nil || usage.TotalTokens != 3 {
		t.Fatalf("usage not mapped: %#v", usage)
	}
	if got.ID != "resp_test" || got.Object != "response" || got.CreatedAt != 123 {
		t.Fatalf("basic fields not mapped: %#v", got)
	}
	if len(got.Output) != 1 || got.Output[0].Type != "message" || got.Output[0].Content[0].Text != "done" {
		t.Fatalf("output not mapped: %#v", got.Output)
	}
}
