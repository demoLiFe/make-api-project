package service

import (
	"github.com/QuantumNous/make-api-private/setting/operation_setting"
	"github.com/QuantumNous/make-api-private/setting/system_setting"
)

func GetCallbackAddress() string {
	if operation_setting.CustomCallbackAddress == "" {
		return system_setting.ServerAddress
	}
	return operation_setting.CustomCallbackAddress
}

