package perfmetrics

import (
	"math"
	"sort"
	"time"

	"github.com/QuantumNous/make-api-private/model"
)

const (
	StatusOperational = "operational"
	StatusDegraded    = "degraded"
	StatusIncident    = "incident"
)

type AvailabilityPoint struct {
	Ts          int64   `json:"ts"`
	SuccessRate float64 `json:"success_rate"`
	HasData     bool    `json:"has_data"`
}

type AvailabilityModel struct {
	ModelName    string              `json:"model_name"`
	Availability float64             `json:"availability"`
	AvgLatencyMs int64               `json:"avg_latency_ms"`
	AvgTps       float64             `json:"avg_tps"`
	Status       string              `json:"status"`
	Recent       []AvailabilityPoint `json:"recent"`
}

type AvailabilityResult struct {
	Models    []AvailabilityModel `json:"models"`
	UpdatedAt int64               `json:"updated_at"`
}

type availabilitySample struct {
	modelName      string
	bucketTs       int64
	requestCount   int64
	successCount   int64
	totalLatencyMs int64
	outputTokens   int64
	generationMs   int64
}

func QueryAvailability(days int) (AvailabilityResult, error) {
	return queryAvailabilityAt(days, time.Now())
}

func queryAvailabilityAt(days int, now time.Time) (AvailabilityResult, error) {
	days = normalizeAvailabilityDays(days)
	slotSeconds := availabilitySlotSeconds(days)
	endTs := now.Unix() - now.Unix()%slotSeconds
	startTs := endTs - int64(days)*24*3600

	rows, err := model.GetPerfMetricsAll(startTs, endTs)
	if err != nil {
		return AvailabilityResult{}, err
	}

	samples := make([]availabilitySample, 0, len(rows))
	for _, row := range rows {
		samples = append(samples, availabilitySample{
			modelName:      row.ModelName,
			bucketTs:       row.BucketTs,
			requestCount:   row.RequestCount,
			successCount:   row.SuccessCount,
			totalLatencyMs: row.TotalLatencyMs,
			outputTokens:   row.OutputTokens,
			generationMs:   row.GenerationMs,
		})
	}

	hotBuckets.Range(func(key, value any) bool {
		k := key.(bucketKey)
		if k.bucketTs < startTs || k.bucketTs >= endTs {
			return true
		}
		snapshot := value.(*atomicBucket).snapshot()
		if snapshot.requestCount == 0 {
			return true
		}
		samples = append(samples, availabilitySample{
			modelName:      k.model,
			bucketTs:       k.bucketTs,
			requestCount:   snapshot.requestCount,
			successCount:   snapshot.successCount,
			totalLatencyMs: snapshot.totalLatencyMs,
			outputTokens:   snapshot.outputTokens,
			generationMs:   snapshot.generationMs,
		})
		return true
	})

	return buildAvailabilityResult(days, now.Unix(), samples), nil
}

func buildAvailabilityResult(days int, updatedAt int64, samples []availabilitySample) AvailabilityResult {
	days = normalizeAvailabilityDays(days)
	slotSeconds := availabilitySlotSeconds(days)
	endTs := updatedAt - updatedAt%slotSeconds
	startTs := endTs - int64(days)*24*3600
	slotCount := int((endTs - startTs) / slotSeconds)

	type modelAggregate struct {
		total counters
		slots []counters
	}

	aggregates := make(map[string]*modelAggregate)
	for _, sample := range samples {
		if sample.modelName == "" || sample.requestCount <= 0 || sample.bucketTs < startTs || sample.bucketTs >= endTs {
			continue
		}

		aggregate, ok := aggregates[sample.modelName]
		if !ok {
			aggregate = &modelAggregate{slots: make([]counters, slotCount)}
			aggregates[sample.modelName] = aggregate
		}

		value := counters{
			requestCount:   sample.requestCount,
			successCount:   sample.successCount,
			totalLatencyMs: sample.totalLatencyMs,
			outputTokens:   sample.outputTokens,
			generationMs:   sample.generationMs,
		}
		mergeCounterValue(&aggregate.total, value)
		slotIndex := int((sample.bucketTs - startTs) / slotSeconds)
		if slotIndex >= 0 && slotIndex < slotCount {
			mergeCounterValue(&aggregate.slots[slotIndex], value)
		}
	}

	models := make([]AvailabilityModel, 0, len(aggregates))
	for modelName, aggregate := range aggregates {
		recent := make([]AvailabilityPoint, slotCount)
		for i, slot := range aggregate.slots {
			recent[i] = AvailabilityPoint{
				Ts:          startTs + int64(i)*slotSeconds,
				SuccessRate: roundTwoDecimals(successRate(slot)),
				HasData:     slot.requestCount > 0,
			}
		}

		availability := roundTwoDecimals(successRate(aggregate.total))
		models = append(models, AvailabilityModel{
			ModelName:    modelName,
			Availability: availability,
			AvgLatencyMs: avg(aggregate.total.totalLatencyMs, aggregate.total.requestCount),
			AvgTps:       roundTwoDecimals(avgTps(aggregate.total)),
			Status:       availabilityStatus(availability),
			Recent:       recent,
		})
	}

	sort.Slice(models, func(i, j int) bool {
		return models[i].ModelName < models[j].ModelName
	})

	return AvailabilityResult{Models: models, UpdatedAt: updatedAt}
}

func normalizeAvailabilityDays(days int) int {
	switch days {
	case 1, 7, 15, 30:
		return days
	default:
		return 1
	}
}

func availabilitySlotSeconds(days int) int64 {
	switch days {
	case 7:
		return 3 * 3600
	case 15:
		return 6 * 3600
	case 30:
		return 12 * 3600
	default:
		return 3600
	}
}

func availabilityStatus(availability float64) string {
	if availability >= 95 {
		return StatusOperational
	}
	if availability >= 80 {
		return StatusDegraded
	}
	return StatusIncident
}

func mergeCounterValue(target *counters, value counters) {
	target.requestCount += value.requestCount
	target.successCount += value.successCount
	target.totalLatencyMs += value.totalLatencyMs
	target.outputTokens += value.outputTokens
	target.generationMs += value.generationMs
}

func roundTwoDecimals(value float64) float64 {
	return math.Round(value*100) / 100
}
