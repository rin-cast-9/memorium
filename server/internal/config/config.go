package config

import (
	"os"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/shared"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
)

var once sync.Once

func Init() {
	mode := os.Getenv("GIN_MODE")
	if mode == "" {
		mode = gin.DebugMode
	}
	gin.SetMode(mode)

	util.Logger.Info("Gin mode set", zap.String("mode", mode))

	once.Do(func() {
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			util.Logger.Fatal("JWT_SECRET env var not set")
		}

		shared.JWTSecret = secret
		util.Logger.Info("JWT_SECRET loaded (value not shown)")
	})
}
