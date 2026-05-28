package controller

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/QuantumNous/make-api-private/common"
	"github.com/QuantumNous/make-api-private/model"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type Setup2FARequest struct {
	Code string `json:"code" binding:"required"`
}

type Verify2FARequest struct {
	Code string `json:"code" binding:"required"`
}

type Setup2FAResponse struct {
	Secret      string   `json:"secret"`
	QRCodeData  string   `json:"qr_code_data"`
	BackupCodes []string `json:"backup_codes"`
}

func Setup2FA(c *gin.Context) {
	userId := c.GetInt("id")

	existing, err := model.GetTwoFAByUserId(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if existing != nil && existing.IsEnabled {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户已启用 2FA，请先禁用后再重新设置",
		})
		return
	}

	if existing != nil && !existing.IsEnabled {
		if err := existing.Delete(); err != nil {
			common.ApiError(c, err)
			return
		}
		existing = nil
	}

	user, err := model.GetUserById(userId, false)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	key, err := common.GenerateTOTPSecret(user.Username)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "生成 2FA 密钥失败",
		})
		common.SysLog("生成 TOTP 密钥失败: " + err.Error())
		return
	}

	backupCodes, err := common.GenerateBackupCodes()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "生成备用码失败",
		})
		common.SysLog("生成备用码失败: " + err.Error())
		return
	}

	qrCodeData := common.GenerateQRCodeData(key.Secret(), user.Username)

	twoFA := &model.TwoFA{
		UserId:    userId,
		Secret:    key.Secret(),
		IsEnabled: false,
	}

	if existing != nil {
		twoFA.Id = existing.Id
		err = twoFA.Update()
	} else {
		err = twoFA.Create()
	}
	if err != nil {
		common.ApiError(c, err)
		return
	}

	if err := model.CreateBackupCodes(userId, backupCodes); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "保存备用码失败",
		})
		common.SysLog("保存备用码失败: " + err.Error())
		return
	}

	model.RecordLog(userId, model.LogTypeSystem, "开始设置两步验证")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "2FA 设置初始化成功，请使用验证器扫描二维码并输入验证码完成设置",
		"data": Setup2FAResponse{
			Secret:      key.Secret(),
			QRCodeData:  qrCodeData,
			BackupCodes: backupCodes,
		},
	})
}

func Enable2FA(c *gin.Context) {
	var req Setup2FARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误",
		})
		return
	}

	userId := c.GetInt("id")
	twoFA, err := model.GetTwoFAByUserId(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if twoFA == nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "请先完成 2FA 初始化设置",
		})
		return
	}
	if twoFA.IsEnabled {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "2FA 已启用",
		})
		return
	}

	cleanCode, err := common.ValidateNumericCode(req.Code)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	if !common.ValidateTOTPCode(twoFA.Secret, cleanCode) {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "验证码或备用码错误，请重试",
		})
		return
	}

	if err := twoFA.Enable(); err != nil {
		common.ApiError(c, err)
		return
	}

	model.RecordLog(userId, model.LogTypeSystem, "成功启用两步验证")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "两步验证启用成功",
	})
}

func Disable2FA(c *gin.Context) {
	var req Verify2FARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误",
		})
		return
	}

	userId := c.GetInt("id")
	twoFA, err := model.GetTwoFAByUserId(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if twoFA == nil || !twoFA.IsEnabled {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户未启用 2FA",
		})
		return
	}

	cleanCode, err := common.ValidateNumericCode(req.Code)
	isValidTOTP := false
	isValidBackup := false
	if err == nil {
		isValidTOTP, _ = twoFA.ValidateTOTPAndUpdateUsage(cleanCode)
	}
	if !isValidTOTP {
		isValidBackup, err = twoFA.ValidateBackupCodeAndUpdateUsage(req.Code)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}
	}
	if !isValidTOTP && !isValidBackup {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "验证码或备用码错误，请重试",
		})
		return
	}

	if err := model.DisableTwoFA(userId); err != nil {
		common.ApiError(c, err)
		return
	}

	model.RecordLog(userId, model.LogTypeSystem, "禁用两步验证")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "两步验证已禁用",
	})
}

func Get2FAStatus(c *gin.Context) {
	userId := c.GetInt("id")

	twoFA, err := model.GetTwoFAByUserId(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	status := map[string]interface{}{
		"enabled": false,
		"locked":  false,
	}
	if twoFA != nil {
		status["enabled"] = twoFA.IsEnabled
		status["locked"] = twoFA.IsLocked()
		if twoFA.IsEnabled {
			backupCount, err := model.GetUnusedBackupCodeCount(userId)
			if err != nil {
				common.SysLog("获取备用码数量失败: " + err.Error())
			} else {
				status["backup_codes_remaining"] = backupCount
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    status,
	})
}

func RegenerateBackupCodes(c *gin.Context) {
	var req Verify2FARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误",
		})
		return
	}

	userId := c.GetInt("id")
	twoFA, err := model.GetTwoFAByUserId(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if twoFA == nil || !twoFA.IsEnabled {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户未启用 2FA",
		})
		return
	}

	cleanCode, err := common.ValidateNumericCode(req.Code)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	valid, err := twoFA.ValidateTOTPAndUpdateUsage(cleanCode)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	if !valid {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "验证码或备用码错误，请重试",
		})
		return
	}

	backupCodes, err := common.GenerateBackupCodes()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "生成备用码失败",
		})
		common.SysLog("生成备用码失败: " + err.Error())
		return
	}

	if err := model.CreateBackupCodes(userId, backupCodes); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "保存备用码失败",
		})
		common.SysLog("保存备用码失败: " + err.Error())
		return
	}

	model.RecordLog(userId, model.LogTypeSystem, "重新生成两步验证备用码")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "备用码重新生成成功",
		"data": map[string]interface{}{
			"backup_codes": backupCodes,
		},
	})
}

func Verify2FALogin(c *gin.Context) {
	var req Verify2FARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误",
		})
		return
	}

	session := sessions.Default(c)
	pendingUserId := session.Get("pending_user_id")
	if pendingUserId == nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "会话已过期，请重新登录",
		})
		return
	}

	userId, ok := pendingUserId.(int)
	if !ok {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "会话数据无效，请重新登录",
		})
		return
	}

	user, err := model.GetUserById(userId, false)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户不存在",
		})
		return
	}

	twoFA, err := model.GetTwoFAByUserId(user.Id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if twoFA == nil || !twoFA.IsEnabled {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户未启用 2FA",
		})
		return
	}

	cleanCode, err := common.ValidateNumericCode(req.Code)
	isValidTOTP := false
	isValidBackup := false
	if err == nil {
		isValidTOTP, _ = twoFA.ValidateTOTPAndUpdateUsage(cleanCode)
	}
	if !isValidTOTP {
		isValidBackup, err = twoFA.ValidateBackupCodeAndUpdateUsage(req.Code)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}
	}
	if !isValidTOTP && !isValidBackup {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "验证码或备用码错误，请重试",
		})
		return
	}

	session.Delete("pending_username")
	session.Delete("pending_user_id")
	_ = session.Save()

	setupLogin(user, c)
}

func Admin2FAStats(c *gin.Context) {
	stats, err := model.GetTwoFAStats()
	if err != nil {
		common.ApiError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    stats,
	})
}

func AdminDisable2FA(c *gin.Context) {
	userIdStr := c.Param("id")
	userId, err := strconv.Atoi(userIdStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户 ID 格式错误",
		})
		return
	}

	targetUser, err := model.GetUserById(userId, false)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	myRole := c.GetInt("role")
	if myRole <= targetUser.Role && myRole != common.RoleRootUser {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权操作同级或更高级用户的 2FA 设置",
		})
		return
	}

	if err := model.DisableTwoFA(userId); err != nil {
		if errors.Is(err, model.ErrTwoFANotEnabled) {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "用户未启用 2FA",
			})
			return
		}
		common.ApiError(c, err)
		return
	}

	adminId := c.GetInt("id")
	adminName := c.GetString("username")
	adminInfo := map[string]interface{}{
		"admin_id":       adminId,
		"admin_username": adminName,
	}
	model.RecordLogWithAdminInfo(userId, model.LogTypeManage, "管理员强制禁用了用户的两步验证", adminInfo)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "用户 2FA 已被强制禁用",
	})
}
