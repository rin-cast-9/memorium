package db

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to db: %w", err)
	}

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
