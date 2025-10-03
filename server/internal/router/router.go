package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/handler"
	"github.com/rin-cast-9/memorium/server/internal/middleware"
	"github.com/rin-cast-9/memorium/server/internal/repo"
	"github.com/rin-cast-9/memorium/server/internal/service"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	util.Logger.Info("CORS middleware configured")

	userRepo := repo.NewUserRepo(db)
	authService := service.NewAuthService(userRepo)
	authHandler := handler.NewAuthHandler(authService)

	folderRepo := repo.NewFolderRepo(db)
	moduleRepo := repo.NewModuleRepo(db)
	cardRepo := repo.NewCardRepo(db)

	folderService := service.NewFolderService(folderRepo, moduleRepo)
	moduleService := service.NewModuleService(moduleRepo, folderRepo)
	cardService := service.NewCardService(cardRepo, moduleRepo)

	folderHandler := handler.NewFolderHandler(folderService)
	moduleHandler := handler.NewModuleHandler(moduleService)
	cardHandler := handler.NewCardHandler(cardService)

	router.GET("/ping", middleware.JWTAuthMiddleware(), handler.PingHandler(db))
	router.POST("/register", authHandler.Register)
	router.POST("/login", authHandler.Login)

	folderRoutes := router.Group("/folders", middleware.JWTAuthMiddleware())
	{
		folderRoutes.GET("", folderHandler.ListFolders)
		folderRoutes.GET("/:id", folderHandler.GetFolder)
		folderRoutes.GET("/:id/modules", folderHandler.ListModulesByFolder)
		folderRoutes.POST("", folderHandler.CreateFolder)
		folderRoutes.PUT("/:id/modules", folderHandler.UpdateFolderModules)
		folderRoutes.PUT("/:id", folderHandler.RenameFolder)
		folderRoutes.DELETE("/:id", folderHandler.DeleteFolder)
	}

	moduleRoutes := router.Group("/modules", middleware.JWTAuthMiddleware())
	{
		moduleRoutes.GET("", moduleHandler.ListModules)
		moduleRoutes.GET("/:id", moduleHandler.GetModule)
		moduleRoutes.GET("/:id/folders", moduleHandler.ListFoldersByModule)
		moduleRoutes.POST("", moduleHandler.CreateModule)
		moduleRoutes.PUT("/:id/folders", moduleHandler.UpdateModuleFolders)
		moduleRoutes.PUT("/:id", moduleHandler.RenameModule)
		moduleRoutes.DELETE("/:id", moduleHandler.DeleteModule)
	}

	cardRoutes := router.Group("/cards", middleware.JWTAuthMiddleware())
	{
		cardRoutes.GET("/:id", cardHandler.GetCard)
		cardRoutes.GET("/module/:moduleID", cardHandler.ListCards)
		cardRoutes.POST("", cardHandler.CreateCard)
		cardRoutes.PUT("/:id", cardHandler.EditCard)
		cardRoutes.DELETE("/:id", cardHandler.DeleteCard)
	}

	util.Logger.Info("Routes registered")

	return router
}
