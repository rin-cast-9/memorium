package config

import (
	"log"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
)

var (
	jwtSecret string
	once      sync.Once
)

func Init() {
	mode := os.Getenv("GIN_MODE")

	if mode == "" {
		mode = gin.DebugMode
	}
	gin.SetMode(mode)

	once.Do(func() {
		jwtSecret = os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			log.Fatal("JWT_SECRET env var not set")
		}
	})
}

func GetJWTSecret() string {
	return jwtSecret
}
