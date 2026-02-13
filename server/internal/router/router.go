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
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Refresh"},
		AllowCredentials: true,
	}))

	util.Logger.Info("CORS middleware configured")

	userRepo := repo.NewUserRepo(db)
	authRepo := repo.NewAuthRepo(db)
	authService := service.NewAuthService(userRepo, authRepo)
	authHandler := handler.NewAuthHandler(authService)

	folderRepo := repo.NewFolderRepo(db)
	moduleRepo := repo.NewModuleRepo(db)
	cardRepo := repo.NewCardRepo(db)
	progressRepo := repo.NewProgressRepo(db)
	questionRepo := repo.NewQuestionRepo(db)
	testRepo := repo.NewTestRepo(db)

	folderService := service.NewFolderService(folderRepo, moduleRepo)
	moduleService := service.NewModuleService(moduleRepo, folderRepo, cardRepo)
	cardService := service.NewCardService(cardRepo, moduleRepo)
	progressService := service.NewProgressService(db, progressRepo, cardRepo)
	var progressCategorizer service.ProgressCategorizer = progressService
	var progressUpdater service.ProgressUpdater = progressService
	questionService := service.NewQuestionService(questionRepo, testRepo, progressCategorizer, progressUpdater, db)
	var questionAnswerer service.QuestionAnswerer = questionService
	var progressToucher service.ProgressToucher = progressService
	testService := service.NewTestService(testRepo, questionRepo, cardRepo, questionAnswerer, progressRepo, progressToucher)

	folderHandler := handler.NewFolderHandler(folderService)
	moduleHandler := handler.NewModuleHandler(moduleService)
	cardHandler := handler.NewCardHandler(cardService)
	progressHandler := handler.NewProgressHandler(progressService)
	testHandler := handler.NewTestHandler(testService, questionService, cardService)

	router.GET("/ping", middleware.JWTAuthMiddleware(), handler.PingHandler(db))
	router.POST("/register", authHandler.Register)
	router.POST("/login", authHandler.Login)
	router.POST("/refresh", authHandler.Refresh)
	router.POST("/logout", authHandler.Logout)

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
		moduleRoutes.GET("/:id/count", moduleHandler.CountCardsInModule)
	}

	cardRoutes := router.Group("/cards", middleware.JWTAuthMiddleware())
	{
		cardRoutes.GET("/:id", cardHandler.GetCard)
		cardRoutes.GET("/module/:moduleID", cardHandler.ListCards)
		cardRoutes.POST("", cardHandler.CreateCard)
		cardRoutes.PUT("/:id", cardHandler.EditCard)
		cardRoutes.DELETE("/:id", cardHandler.DeleteCard)
	}

	progressRoutes := router.Group("/progress", middleware.JWTAuthMiddleware())
	{
		progressRoutes.GET("/:module_id", progressHandler.GetProgress)
	}

	testRoutes := router.Group("/test", middleware.JWTAuthMiddleware())
	{
		testRoutes.POST("/start", testHandler.StartTest)
		testRoutes.POST("/:id/finish", testHandler.FinishTest)
	}

	reviewRoutes := router.Group("/review", middleware.JWTAuthMiddleware())
	{
		reviewRoutes.POST("/start", testHandler.StartReview)
		reviewRoutes.POST("/:id/finish", testHandler.FinishReview)
	}

	util.Logger.Info("Routes registered")

	return router
}
