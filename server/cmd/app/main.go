package main

import (
	"github.com/rin-cast-9/memorium/server/internal/config"
	"github.com/rin-cast-9/memorium/server/internal/db"
	"github.com/rin-cast-9/memorium/server/internal/router"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
)

func main() {

	util.InitLogger(false)
	defer util.Logger.Sync()

	util.Logger.Info("Server starting...",
		zap.String("port", ":8080"),
	)

	config.Init()
	util.Logger.Info("Config initialized")

	gormDB, err := db.Init()
	if err != nil {
		util.Logger.Fatal("DB init failed", zap.Error(err))
	}
	util.Logger.Info("Database connected")

	router := router.SetupRouter(gormDB)
	util.Logger.Info("Router setup complete")

	if err := router.Run(":8080"); err != nil {
		util.Logger.Fatal("Server failed to run", zap.Error(err))
	}

}
