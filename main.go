package main

import (
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/routers"
	"erpvietnam/ehoadon/settings"
	"net/http"

	"erpvietnam/ehoadon/middleware"

	"github.com/codegangsta/negroni"
)

func main() {
	router := routers.InitRoutes()
	n := negroni.New(negroni.NewRecovery(), negroni.NewLogger(), middleware.NewContext(), negroni.Wrap(router))
	log.WithFields(log.Fields{"http address": settings.Settings.ListenHTTP, "https address": settings.Settings.ListenHTTPS}).Info("Running on address")

	go func() {
		err := http.ListenAndServe(settings.Settings.ListenHTTP, n)
		if err != nil {
			log.Panic(err.Error())
		}
	}()

	err := http.ListenAndServeTLS(settings.Settings.ListenHTTPS, settings.Settings.CertKeyPath, settings.Settings.PrivateKeyPath, n)
	if err != nil {
		log.Panic(err.Error())
	}
}
