package log

import (
	"os"

	"github.com/Gurpartap/logrus-stack"
	// "github.com/onrik/logrus/filename"
	//"github.com/onrik/logrus/sentry"
	log "github.com/sirupsen/logrus"
)

var logger *log.Logger

type Fields map[string]interface{}

func init() {
	logger = log.New()
	logger.Formatter = &log.JSONFormatter{}
	logger.Out = os.Stderr
	logger.AddHook(logrus_stack.StandardHook())
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
