package deepseek

import (
	"testing"

	"github.com/QuantumNous/make-api-private/common"
	"github.com/QuantumNous/make-api-private/dto"
)

func TestConvertOpenAIRequestNormalizesDeveloperRole(t *testing.T) {
	req := &dto.GeneralOpenAIRequest{
		Model: "deepseek-chat",
		Messages: []dto.Message{
			{Role: "developer", Content: "rules"},
			{Role: "user", Content: "hello"},
		},
	}

	converted, err := (&Adaptor{}).ConvertOpenAIRequest(nil, nil, req)
	if err != nil {
		t.Fatal(err)
	}
	got := converted.(*dto.GeneralOpenAIRequest)
	if got.Messages[0].Role != "system" {
		t.Fatalf("role = %q, want system", got.Messages[0].Role)
	}
}

func TestConvertOpenAIResponsesRequestNormalizesDeveloperRole(t *testing.T) {
	req := dto.OpenAIResponsesRequest{
		Model: "deepseek-chat",
		Input: common.StringToByteSlice(`[
			{"role":"developer","content":"rules"},
			{"role":"user","content":"hello"}
		]`),
	}

	converted, err := (&Adaptor{}).ConvertOpenAIResponsesRequest(nil, nil, req)
	if err != nil {
		t.Fatal(err)
	}
	got := converted.(*dto.GeneralOpenAIRequest)
	if got.Messages[0].Role != "system" {
		t.Fatalf("role = %q, want system", got.Messages[0].Role)
	}
	if got.Messages[1].Role != "user" {
		t.Fatalf("role = %q, want user", got.Messages[1].Role)
	}
}

func TestConvertOpenAIRequestDropsIncompleteToolCalls(t *testing.T) {
	assistant := dto.Message{Role: "assistant", Content: nil}
	assistant.SetToolCalls([]dto.ToolCallRequest{
		{
			ID:   "call_1",
			Type: "function",
			Function: dto.FunctionRequest{
				Name:      "read_file",
				Arguments: "{}",
			},
		},
	})
	req := &dto.GeneralOpenAIRequest{
		Model: "deepseek-chat",
		Messages: []dto.Message{
			{Role: "user", Content: "inspect"},
			assistant,
			{Role: "user", Content: "continue"},
		},
	}

	converted, err := (&Adaptor{}).ConvertOpenAIRequest(nil, nil, req)
	if err != nil {
		t.Fatal(err)
	}
	got := converted.(*dto.GeneralOpenAIRequest)
	if len(got.Messages[1].ParseToolCalls()) != 0 {
		t.Fatalf("tool calls were not dropped: %#v", got.Messages[1].ParseToolCalls())
	}
	if got.Messages[1].StringContent() == "" {
		t.Fatalf("assistant content should be populated when dropping incomplete tool calls")
	}
}

func TestConvertOpenAIRequestKeepsCompleteToolCalls(t *testing.T) {
	assistant := dto.Message{Role: "assistant", Content: nil}
	assistant.SetToolCalls([]dto.ToolCallRequest{
		{
			ID:   "call_1",
			Type: "function",
			Function: dto.FunctionRequest{
				Name:      "read_file",
				Arguments: "{}",
			},
		},
	})
	req := &dto.GeneralOpenAIRequest{
		Model: "deepseek-chat",
		Messages: []dto.Message{
			{Role: "user", Content: "inspect"},
			assistant,
			{Role: "tool", ToolCallId: "call_1", Content: "ok"},
			{Role: "user", Content: "continue"},
		},
	}

	converted, err := (&Adaptor{}).ConvertOpenAIRequest(nil, nil, req)
	if err != nil {
		t.Fatal(err)
	}
	got := converted.(*dto.GeneralOpenAIRequest)
	if len(got.Messages[1].ParseToolCalls()) != 1 {
		t.Fatalf("tool calls were dropped: %#v", got.Messages[1].ParseToolCalls())
	}
}

func TestConvertOpenAIRequestDropsOrphanToolMessages(t *testing.T) {
	req := &dto.GeneralOpenAIRequest{
		Model: "deepseek-chat",
		Messages: []dto.Message{
			{Role: "user", Content: "inspect"},
			{Role: "tool", ToolCallId: "missing_call", Content: "orphan"},
			{Role: "assistant", Content: nil},
			{Role: "user", Content: "continue"},
		},
	}

	converted, err := (&Adaptor{}).ConvertOpenAIRequest(nil, nil, req)
	if err != nil {
		t.Fatal(err)
	}
	got := converted.(*dto.GeneralOpenAIRequest)
	for _, msg := range got.Messages {
		if msg.Role == "tool" {
			t.Fatalf("orphan tool message was not dropped: %#v", got.Messages)
		}
		if msg.Role == "assistant" && msg.Content == nil && len(msg.ParseToolCalls()) == 0 {
			t.Fatalf("empty assistant message was not populated: %#v", got.Messages)
		}
	}
}
