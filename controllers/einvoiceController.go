package controllers

import (
	"encoding/json"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/models"
	"strconv"

	"net/http"
	"strings"
	"time"

	"github.com/gorilla/context"
)

func API_eInvoices(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	requestUser := context.Get(r, "user").(models.User)

	switch {
	case r.Method == "GET":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoices": []models.EInvoice{}}}, http.StatusBadRequest)
			return
		}

		infiniteScrollingInformation := models.InfiniteScrollingInformation{
			After:          r.URL.Query().Get("After"),
			FetchSize:      r.URL.Query().Get("FetchSize"),
			SortDirection:  r.URL.Query().Get("SortDirection"),
			SortExpression: r.URL.Query().Get("SortExpression")}

		einvoice, tranInfor := models.GetEInvoices(user.OrganizationID, r.URL.Query().Get("Search"), infiniteScrollingInformation)
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoices": []models.EInvoice{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: true, TotalRows: len(einvoice), Data: map[string]interface{}{"eInvoices": einvoice}, IsAuthenticated: true}, http.StatusOK)

	case r.Method == "POST":
		einvoice := models.EInvoice{}
		err := json.NewDecoder(r.Body).Decode(&einvoice)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusBadRequest)
			return
		}
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": []models.EInvoice{}}}, http.StatusBadRequest)
			return
		}
		if einvoice.ID == nil {
			einvoice.RecCreatedByID = *user.ID
			einvoice.RecModifiedByID = *user.ID
			einvoice.RecCreated = &models.Timestamp{time.Now()}
			einvoice.RecModified = &models.Timestamp{time.Now()}
			einvoice.Version = 1
			einvoice.ClientID = user.ClientID
			einvoice.OrganizationID = user.OrganizationID
		} else {
			einvoice.RecModifiedByID = *user.ID
			einvoice.RecModified = &models.Timestamp{time.Now()}
		}

		einvoice, tranInfor := models.PostEInvoice(einvoice)
		if tranInfor.ReturnStatus == false && len(tranInfor.ValidationErrors) > 0 {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, ValidationErrors: tranInfor.ValidationErrors, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": einvoice}}, http.StatusBadRequest)
			return
		} else if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": einvoice}}, http.StatusBadRequest)
			return
		}

		JSONResponse(w, models.Response{ReturnStatus: true, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": einvoice}}, http.StatusOK)

	case r.Method == "DELETE":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		ids := strings.Split(r.URL.Query().Get("ID"), ",")
		tranInfo := models.DeleteEInvoiceById(user.OrganizationID, ids)
		if tranInfo.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true}, http.StatusOK)
	}
}

func API_eInvoice_Id(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	switch {
	case r.Method == "GET":
		ID, err := strconv.ParseInt(r.URL.Query().Get("ID"), 10, 64)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{ErrIDParameterNotFound.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusBadRequest)
			return
		}
		getData, tranInfo := models.GetEInvoiceByID(ID)
		if !tranInfo.ReturnStatus {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, Data: map[string]interface{}{"eInvoice": getData}, IsAuthenticated: true}, http.StatusOK)
	}
}
