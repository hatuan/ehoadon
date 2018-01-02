package controllers

import (
	"encoding/json"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/models"
	"net/http"
	"time"

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

		einvoiceClient, tranInfor := models.GetEInvoiceClientByClientID(requestUser.ClientID)
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"Client": models.Client{}, "eInvoiceClient": models.EInvoiceClient{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: true, Data: map[string]interface{}{"Client": client, "eInvoiceClient": einvoiceClient}, IsAuthenticated: true}, http.StatusOK)

	case r.Method == "POST": //update client
		type PostData struct {
			Client         models.Client         `json:"Client"`
			EInvoiceClient models.EInvoiceClient `json:"eInvoiceClient"`
		}
		postData := PostData{}
		err := json.NewDecoder(r.Body).Decode(&postData)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"Client": models.Client{}}}, http.StatusBadRequest)
			return
		}

		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"Client": []models.Client{}}}, http.StatusBadRequest)
			return
		}

		client := postData.Client
		if client.ClientID == nil {
			client.RecCreatedByID = *user.ID
			client.RecModifiedByID = *user.ID
			client.RecCreated = &models.Timestamp{time.Now()}
			client.RecModified = &models.Timestamp{time.Now()}
			client.Version = 1
		} else {
			client.RecModifiedByID = *user.ID
			client.RecModified = &models.Timestamp{time.Now()}
		}

		tranInfor := client.Update()
		if tranInfor.ReturnStatus == false && len(tranInfor.ValidationErrors) > 0 {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, ValidationErrors: tranInfor.ValidationErrors, IsAuthenticated: true, Data: map[string]interface{}{"Client": client}}, http.StatusBadRequest)
			return
		} else if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"Client": client}}, http.StatusBadRequest)
			return
		}

		if postData.EInvoiceClient.ID == nil {
			postData.EInvoiceClient.ClientID = requestUser.ClientID
		}
		einvoiceClient, tranInfor := models.PostEInvoiceClient(postData.EInvoiceClient)
		if tranInfor.ReturnStatus == false && len(tranInfor.ValidationErrors) > 0 {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, ValidationErrors: tranInfor.ValidationErrors, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceClient": einvoiceClient}}, http.StatusBadRequest)
			return
		} else if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceClient": einvoiceClient}}, http.StatusBadRequest)
			return
		}

		JSONResponse(w, models.Response{ReturnStatus: true, IsAuthenticated: true, Data: map[string]interface{}{"Client": client, "eInvoiceClient": einvoiceClient}}, http.StatusOK)
	}
}
