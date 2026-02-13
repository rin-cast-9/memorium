package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
)

func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("access_token")
		if err != nil || tokenStr == "" {
			util.Logger.Warn("missing access token cookie")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing access token"})
			return
		}

		claims, err := util.ParseToken(tokenStr)
		if err != nil {
			util.Logger.Warn("Invalid or expired token", zap.Error(err))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		util.Logger.Debug("Token valid", zap.Uint("userID", claims.UserID))
		c.Set("userID", int(claims.UserID))

		c.Next()
	}
}
