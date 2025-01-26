package logger

import (
	"log/slog"
	"os"
)

var (
	defaultLogger *slog.Logger
)

func init() {
	// Default structured logging configuration
	opts := &slog.HandlerOptions{
		Level:     slog.LevelDebug,
		AddSource: true,
	}

	defaultLogger = slog.New(slog.NewTextHandler(os.Stdout, opts))
	slog.SetDefault(defaultLogger)
}

// Helper functions for different log levels
func Debug(msg string, args ...any) {
	defaultLogger.Debug(msg, args...)
}

func Info(msg string, args ...any) {
	defaultLogger.Info(msg, args...)
}

func Warn(msg string, args ...any) {
	defaultLogger.Warn(msg, args...)
}

func Error(msg string, args ...any) {
	defaultLogger.Error(msg, args...)
}
