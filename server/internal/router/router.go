package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/handler"
	"github.com/rin-cast-9/memorium/server/internal/middleware"
	"github.com/rin-cast-9/memorium/server/internal/repo"
	"github.com/rin-cast-9/memorium/server/internal/service"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
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

	router.GET("/ping", middleware.JWTAuthMiddleware(), handler.PingHandler(db))
	router.POST("/register", authHandler.Register)
	router.POST("/login", authHandler.Login)

	util.Logger.Info("Routes registered", zap.Int("count", 3))

	return router
}
