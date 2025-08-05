package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
)

func handleError(c *gin.Context, err error) {
	appErr, ok := err.(*util.AppError)
	if ok && appErr.IsPublic {
		util.Logger.Warn("Public error", zap.String("code", appErr.Code), zap.String("message", appErr.Message))
		c.JSON(http.StatusBadRequest, gin.H{"error": appErr.Code})
		return
	}

	util.Logger.Error("Internal error", zap.Error(err))
	c.JSON(http.StatusInternalServerError, gin.H{"error": util.ErrCodeInternalServerError})
}
