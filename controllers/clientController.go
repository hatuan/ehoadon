package controllers

import (
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/models"
	"net/http"

	ctx "github.com/gorilla/context"
)

func API_Client(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	requestUser := ctx.Get(r, "user").(models.User)

	switch {
	case r.Method == "GET":
		client := new(models.Client)
		err := client.Get(requestUser.ClientID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, Data: map[string]interface{}{"Client": models.Client{}}, IsAuthenticated: true}, http.StatusInternalServerError)

		}
		JSONResponse(w, models.Response{ReturnStatus: true, Data: map[string]interface{}{"Client": client}, IsAuthenticated: true}, http.StatusOK)

	case r.Method == "POST": //update client
		client := new(models.Client)
		_ = client.Get(requestUser.ClientID)
		JSONResponse(w, models.Response{ReturnStatus: true, IsAuthenticated: true, Data: map[string]interface{}{"Client": client}}, http.StatusOK)

	}
}
