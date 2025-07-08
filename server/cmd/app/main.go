package main

import (
	"log"

	"github.com/rin-cast-9/memorium/server/internal/config"
	"github.com/rin-cast-9/memorium/server/internal/db"
	"github.com/rin-cast-9/memorium/server/internal/router"
)

func main() {

	config.Init()

	gormDB, err := db.Init()
	if err != nil {
		log.Fatal("DB init failed: %w", err)
	}

	router := router.SetupRouter(gormDB)

	router.Run(":8080")

}
