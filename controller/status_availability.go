package controller

import (
	"net/http"
	"strconv"

	perfmetrics "github.com/QuantumNous/make-api-private/pkg/perf_metrics"

	"github.com/gin-gonic/gin"
)

func GetStatusAvailability(c *gin.Context) {
	days := 1
	if rawDays := c.Query("days"); rawDays != "" {
		parsed, err := strconv.Atoi(rawDays)
		if err != nil || (parsed != 1 && parsed != 7 && parsed != 15 && parsed != 30) {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "days must be one of 1, 7, 15, or 30",
			})
			return
		}
		days = parsed
	}

	result, err := perfmetrics.QueryAvailability(days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}
