package config

import (
	"os"

	"github.com/gin-gonic/gin"
)

func Init() {
	mode := os.Getenv("GIN_MODE")

	if mode == "" {
		mode = gin.DebugMode
	}
	gin.SetMode(mode)
}
