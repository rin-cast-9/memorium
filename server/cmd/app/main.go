package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/config"
	"github.com/rin-cast-9/memorium/server/internal/db"
	"github.com/rin-cast-9/memorium/server/internal/handler"
)

func main() {

	config.Init()

	if err := db.Init(); err != nil {
		log.Fatal(err)
	}

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	router.GET("/ping", handler.PingHandler(db.DB))

	router.Run(":8080")

}
