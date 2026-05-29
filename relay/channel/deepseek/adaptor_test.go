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
