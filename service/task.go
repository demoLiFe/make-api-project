package service

import (
	"strings"

	"github.com/QuantumNous/make-api-private/constant"
)

func CoverTaskActionToModelName(platform constant.TaskPlatform, action string) string {
	return strings.ToLower(string(platform)) + "_" + strings.ToLower(action)
}

