package log

import (
	"os"

	"github.com/Gurpartap/logrus-stack"
	log "github.com/sirupsen/logrus"
)

var logger = log.New()

type Fields map[string]interface{}

func init() {
	// Log as JSON instead of the default ASCII formatter.
	logger.Formatter = &log.JSONFormatter{}

	// Output to stderr instead of stdout, could also be a file.
	logger.Out = os.Stderr

	// Add the stack hook.
	log.AddHook(logrus_stack.StandardHook())

	// Only log the warning severity or above.
	logger.Level = log.DebugLevel
}

func Info(args ...interface{}) {
	logger.Info(args...)
}

func Debug(args ...interface{}) {
	logger.Debug(args...)
}

func Warning(args ...interface{}) {
	logger.Warn(args...)
}

func Error(args ...interface{}) {
	logger.Error(args...)
}

// Calls os.Exit(1) after logging
func Fatal(args ...interface{}) {
	logger.Fatal(args...)
}

// Calls panic() after logging
func Panic(args ...interface{}) {
	logger.Panic(args...)
}

func WithFields(fields Fields) *log.Entry {
	return logger.WithFields(log.Fields(fields))
}

func WithField(key string, value interface{}) *log.Entry {
	return logger.WithField(key, value)
}
