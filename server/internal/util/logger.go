package util

import "go.uber.org/zap"

var Logger *zap.Logger

func InitLogger(isProduction bool) {
	var err error

	if isProduction {
		Logger, err = zap.NewProduction()
	} else {
		Logger, err = zap.NewDevelopment()
	}

	if err != nil {
		panic(err)
	}
}
