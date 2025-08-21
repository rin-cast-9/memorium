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
	userId := c.GetInt("userID")

	folders, err := h.folderService.List(userId)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Folders retrieved", zap.Int("userID", userId))
	c.JSON(http.StatusOK, folders)
}
