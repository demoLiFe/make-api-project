package perfmetrics

import "testing"

func TestBuildAvailabilityResultAggregatesModelsAndGroups(t *testing.T) {
	const endTs int64 = 3_600_000
	result := buildAvailabilityResult(1, endTs+120, []availabilitySample{
		{
			modelName:      "gpt-test",
			bucketTs:       endTs - 3600,
			requestCount:   8,
			successCount:   7,
			totalLatencyMs: 8000,
			outputTokens:   600,
			generationMs:   6000,
		},
		{
			modelName:      "gpt-test",
			bucketTs:       endTs - 3600,
			requestCount:   2,
			successCount:   2,
			totalLatencyMs: 4000,
			outputTokens:   500,
			generationMs:   5000,
		},
		{
			modelName:      "gpt-test",
			bucketTs:       endTs - 7200,
			requestCount:   100,
			successCount:   100,
			totalLatencyMs: 100000,
		},
		{
			modelName:    "bad-model",
			bucketTs:     endTs - 3600,
			requestCount: 10,
			successCount: 7,
		},
		{
			modelName:    "ignored-current-window",
			bucketTs:     endTs,
			requestCount: 10,
			successCount: 10,
		},
	})

	if len(result.Models) != 2 {
		t.Fatalf("expected 2 models, got %d", len(result.Models))
	}
	if result.Models[0].ModelName != "bad-model" || result.Models[0].Status != StatusIncident {
		t.Fatalf("unexpected first model: %+v", result.Models[0])
	}

	model := result.Models[1]
	if model.ModelName != "gpt-test" {
		t.Fatalf("expected sorted gpt-test model, got %q", model.ModelName)
	}
	if model.Availability != 99.09 {
		t.Fatalf("expected 99.09 availability, got %v", model.Availability)
	}
	if model.AvgLatencyMs != 1018 {
		t.Fatalf("expected 1018ms latency, got %d", model.AvgLatencyMs)
	}
	if model.AvgTps != 100 {
		t.Fatalf("expected 100 TPS, got %v", model.AvgTps)
	}
	if model.Status != StatusOperational {
		t.Fatalf("expected operational status, got %q", model.Status)
	}
	if len(model.Recent) != 24 {
		t.Fatalf("expected 24 hourly points, got %d", len(model.Recent))
	}
	if point := model.Recent[23]; !point.HasData || point.SuccessRate != 90 {
		t.Fatalf("unexpected merged latest point: %+v", point)
	}
	if model.Recent[0].HasData {
		t.Fatal("expected empty windows to be marked as no data")
	}
}

func TestBuildAvailabilityResultUsesExpectedWindowCounts(t *testing.T) {
	tests := []struct {
		days int
		want int
	}{
		{days: 1, want: 24},
		{days: 7, want: 56},
		{days: 15, want: 60},
		{days: 30, want: 60},
	}

	for _, test := range tests {
		result := buildAvailabilityResult(test.days, 3_600_120, []availabilitySample{{
			modelName:    "test",
			bucketTs:     3_600_000 - availabilitySlotSeconds(test.days),
			requestCount: 1,
			successCount: 1,
		}})
		if len(result.Models) != 1 {
			t.Fatalf("days=%d: expected one model", test.days)
		}
		if got := len(result.Models[0].Recent); got != test.want {
			t.Fatalf("days=%d: expected %d points, got %d", test.days, test.want, got)
		}
	}
}
