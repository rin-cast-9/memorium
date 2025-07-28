package db

import (
	"os"

	"github.com/rin-cast-9/memorium/server/internal/util"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		util.Logger.Fatal("DATABASE_URL not set")
	}

	util.Logger.Info("Connecting to database...")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	util.Logger.Info("Database connection established")
	return db, nil
}

func Init() (*gorm.DB, error) {
	db, err := Connect()
	if err != nil {
		return nil, err
	}

	if err := Migrate(db); err != nil {
		return nil, err
	}

	return db, nil
}
