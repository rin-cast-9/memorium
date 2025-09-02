package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/service"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
)

type ModuleHandler struct {
	moduleService *service.ModuleService
}

func NewModuleHandler(moduleService *service.ModuleService) *ModuleHandler {
	return &ModuleHandler{moduleService: moduleService}
}

func (h *ModuleHandler) CreateModule(c *gin.Context) {
	userID := c.GetInt("userID")

	var req struct {
		DisplayName string `json:"display_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	module, err := h.moduleService.Create(userID, req.DisplayName)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Module created", zap.Int("userID", userID), zap.Int("moduleID", module.ID))
	c.JSON(http.StatusCreated, module)
}

func (h *ModuleHandler) DeleteModule(c *gin.Context) {
	userID := c.GetInt("userID")

	moduleID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid module id"))
		return
	}

	err = h.moduleService.Delete(userID, moduleID)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Module deleted", zap.Int("userID", userID), zap.Int("moduleID", moduleID))
	c.Status(http.StatusNoContent)
}

func (h *ModuleHandler) RenameModule(c *gin.Context) {
	userID := c.GetInt("userID")

	moduleID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid module id"))
		return
	}

	var req struct {
		NewDisplayName string `json:"new_display_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	module, err := h.moduleService.Rename(userID, moduleID, req.NewDisplayName)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Module renamed", zap.Int("userID", userID), zap.Int("moduleID", moduleID))
	c.JSON(http.StatusOK, module)
}

func (h *ModuleHandler) GetModule(c *gin.Context) {
	userID := c.GetInt("userID")

	moduleID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid module id"))
		return
	}

	module, err := h.moduleService.Get(userID, moduleID)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Module retrieved", zap.Int("userID", userID), zap.Int("moduleID", moduleID))
	c.JSON(http.StatusOK, module)
}

func (h *ModuleHandler) ListModules(c *gin.Context) {
	userID := c.GetInt("userID")

	modules, err := h.moduleService.List(userID)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Modules retrieved", zap.Int("userID", userID))
	c.JSON(http.StatusOK, modules)
}

func (h *ModuleHandler) ListFoldersByModule(c *gin.Context) {
	userID := c.GetInt("userID")

	moduleID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid module id"))
		return
	}

	folders, err := h.moduleService.GetFoldersByModule(userID, moduleID)
	if err != nil {
		handleError(c, err)
		return
	}

	ids := make([]int, len(folders))
	for i, f := range folders {
		ids[i] = f.ID
	}

	c.JSON(http.StatusOK, ids)
}

func (h *ModuleHandler) UpdateModuleFolders(c *gin.Context) {
	userID := c.GetInt("userID")

	moduleID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid module id"))
		return
	}

	var req struct {
		FolderMap map[int]bool `json:"folder_map" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	err = h.moduleService.UpdateModuleFolders(userID, moduleID, req.FolderMap)
	if err != nil {
		handleError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}
