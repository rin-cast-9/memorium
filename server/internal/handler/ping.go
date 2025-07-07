package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func PingHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sqlDB, err := db.DB()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "pong NOT YAY 🥀"})
			return
		}

		if err := sqlDB.Ping(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "pong NOT YAY 🥀"})
			return
		}

		var currentDB string
		row := sqlDB.QueryRow("SELECT current_database();")
		if err := row.Scan(&currentDB); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "pong NOT YAY 🥀"})
			return
		}

		fmt.Println(currentDB)

		c.JSON(http.StatusOK, gin.H{"message": "pong YAY 🥳", "database": currentDB})
	}
}
