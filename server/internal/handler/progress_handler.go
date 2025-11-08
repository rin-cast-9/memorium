package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/service"
	"github.com/rin-cast-9/memorium/server/internal/util"
)

type ProgressHandler struct {
	progressService *service.ProgressService
}

func NewProgressHandler(progressService *service.ProgressService) *ProgressHandler {
	return &ProgressHandler{progressService: progressService}
}

func (h *ProgressHandler) GetProgress(c *gin.Context) {
	userID := c.GetInt("userID")
	moduleID, err := strconv.Atoi(c.Param("module_id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid module id"))
		return
	}

	progress, err := h.progressService.Categorize(userID, moduleID)
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, progress)
}
