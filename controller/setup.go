package controller

import (
	"time"

	"github.com/QuantumNous/make-api-private/common"
	"github.com/QuantumNous/make-api-private/constant"
	"github.com/QuantumNous/make-api-private/model"
	"github.com/QuantumNous/make-api-private/setting/operation_setting"
	"github.com/gin-gonic/gin"
)

type Setup struct {
	Status       bool   `json:"status"`
	RootInit     bool   `json:"root_init"`
	DatabaseType string `json:"database_type"`
}

type SetupRequest struct {
	Username        string `json:"username"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
	DemoSiteEnabled bool   `json:"DemoSiteEnabled"`
}

func GetSetup(c *gin.Context) {
	setup := Setup{
		Status: constant.Setup,
	}
	if constant.Setup {
		c.JSON(200, gin.H{
			"success": true,
			"data":    setup,
		})
		return
	}
	setup.RootInit = model.RootUserExists()
	if common.UsingMySQL {
		setup.DatabaseType = "mysql"
	}
	if common.UsingPostgreSQL {
		setup.DatabaseType = "postgres"
	}
	if common.UsingSQLite {
		setup.DatabaseType = "sqlite"
	}
	c.JSON(200, gin.H{
		"success": true,
		"data":    setup,
	})
}

func PostSetup(c *gin.Context) {
	if constant.Setup {
		c.JSON(200, gin.H{
			"success": false,
			"message": "system has already been initialized",
		})
		return
	}

	rootExists := model.RootUserExists()

	var req SetupRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(200, gin.H{
			"success": false,
			"message": "invalid request parameters",
		})
		return
	}

	if !rootExists {
		if len(req.Username) > 12 {
			c.JSON(200, gin.H{
				"success": false,
				"message": "username cannot exceed 12 characters",
			})
			return
		}
		if req.Password != req.ConfirmPassword {
			c.JSON(200, gin.H{
				"success": false,
				"message": "passwords do not match",
			})
			return
		}
		if len(req.Password) < 8 {
			c.JSON(200, gin.H{
				"success": false,
				"message": "password must be at least 8 characters long",
			})
			return
		}

		hashedPassword, err := common.Password2Hash(req.Password)
		if err != nil {
			c.JSON(200, gin.H{
				"success": false,
				"message": "system error: " + err.Error(),
			})
			return
		}
		rootUser := model.User{
			Username:    req.Username,
			Password:    hashedPassword,
			Role:        common.RoleRootUser,
			Status:      common.UserStatusEnabled,
			DisplayName: "Root User",
			AccessToken: nil,
			Quota:       100000000,
		}
		err = model.DB.Create(&rootUser).Error
		if err != nil {
			c.JSON(200, gin.H{
				"success": false,
				"message": "failed to create administrator account: " + err.Error(),
			})
			return
		}
	}

	operation_setting.DemoSiteEnabled = req.DemoSiteEnabled
	err = model.UpdateOption("DemoSiteEnabled", boolToString(req.DemoSiteEnabled))
	if err != nil {
		c.JSON(200, gin.H{
			"success": false,
			"message": "failed to save demo mode setting: " + err.Error(),
		})
		return
	}

	constant.Setup = true

	setup := model.Setup{
		Version:       common.Version,
		InitializedAt: time.Now().Unix(),
	}
	err = model.DB.Create(&setup).Error
	if err != nil {
		c.JSON(200, gin.H{
			"success": false,
			"message": "system initialization failed: " + err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"message": "system initialized successfully",
	})
}

func boolToString(b bool) string {
	if b {
		return "true"
	}
	return "false"
}

