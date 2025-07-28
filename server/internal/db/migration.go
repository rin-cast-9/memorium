package db

import (
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		util.Logger.Error("Failed to get sql.DB from GORM", zap.Error(err))
		return err
	}

	driver, err := postgres.WithInstance(sqlDB, &postgres.Config{})
	if err != nil {
		util.Logger.Error("Failed to create migrate driver", zap.Error(err))
		return err
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file:///app/migrations",
		"postgres",
		driver,
	)
	if err != nil {
		util.Logger.Error("Failed to initialize migrator", zap.Error(err))
		return err
	}

	err = m.Up()
	if err != nil && err != migrate.ErrNoChange {
		util.Logger.Error("Migration failed", zap.Error(err))
		return err
	}

	util.Logger.Info("Database migrations applied successfully")
	return nil
}
