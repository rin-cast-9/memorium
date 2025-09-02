package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/service"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
)

type FolderHandler struct {
	folderService *service.FolderService
}

func NewFolderHandler(folderService *service.FolderService) *FolderHandler {
	return &FolderHandler{folderService: folderService}
}

func (h *FolderHandler) CreateFolder(c *gin.Context) {
	userID := c.GetInt("userID")

	var req struct {
		DisplayName string `json:"display_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	folder, err := h.folderService.Create(userID, req.DisplayName)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Folder created", zap.Int("userID", userID), zap.Int("folderID", folder.ID))
	c.JSON(http.StatusCreated, folder)
}

func (h *FolderHandler) DeleteFolder(c *gin.Context) {
	userID := c.GetInt("userID")

	folderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid folder id"))
		return
	}

	err = h.folderService.Delete(userID, folderID)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Folder deleted", zap.Int("userID", userID), zap.Int("folderID", folderID))
	c.Status(http.StatusNoContent)
}

func (h *FolderHandler) RenameFolder(c *gin.Context) {
	userID := c.GetInt("userID")

	folderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid folder id"))
		return
	}

	var req struct {
		NewDisplayName string `json:"new_display_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	folder, err := h.folderService.Rename(userID, folderID, req.NewDisplayName)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Folder renamed", zap.Int("userID", userID), zap.Int("folderID", folderID))
	c.JSON(http.StatusOK, folder)
}

func (h *FolderHandler) GetFolder(c *gin.Context) {
	userID := c.GetInt("userID")

	folderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid folder id"))
		return
	}

	folder, err := h.folderService.Get(userID, folderID)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Folder retrieved", zap.Int("userID", userID), zap.Int("folderID", folderID))
	c.JSON(http.StatusOK, folder)
}

func (h *FolderHandler) ListFolders(c *gin.Context) {
	userID := c.GetInt("userID")

	folders, err := h.folderService.List(userID)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Folders retrieved", zap.Int("userID", userID))
	c.JSON(http.StatusOK, folders)
}

func (h *FolderHandler) ListModulesByFolder(c *gin.Context) {
	userID := c.GetInt("userID")

	folderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid folder id"))
		return
	}

	modules, err := h.folderService.GetModulesByFolder(userID, folderID)
	if err != nil {
		handleError(c, err)
		return
	}

	ids := make([]int, len(modules))
	for i, m := range modules {
		ids[i] = m.ID
	}

	c.JSON(http.StatusOK, ids)
}

func (h *FolderHandler) UpdateFolderModules(c *gin.Context) {
	userID := c.GetInt("userID")

	folderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid folder id"))
		return
	}

	var req struct {
		ModuleMap map[int]bool `json:"module_map" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	err = h.folderService.UpdateFolderModules(userID, folderID, req.ModuleMap)
	if err != nil {
		handleError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}
