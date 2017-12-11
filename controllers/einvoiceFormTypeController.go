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

func API_eInvoiceFormTypes(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	requestUser := context.Get(r, "user").(models.User)

	switch {
	case r.Method == "GET":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormTypes": []models.EInvoiceFormType{}}}, http.StatusBadRequest)
			return
		}

		infiniteScrollingInformation := models.InfiniteScrollingInformation{
			After:          r.URL.Query().Get("After"),
			FetchSize:      r.URL.Query().Get("FetchSize"),
			SortDirection:  r.URL.Query().Get("SortDirection"),
			SortExpression: r.URL.Query().Get("SortExpression")}

		einvoiceFormType, tranInfor := models.GetEInvoiceFormTypes(user.OrganizationID, r.URL.Query().Get("Search"), infiniteScrollingInformation)
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormTypes": []models.EInvoiceFormType{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: true, TotalRows: len(einvoiceFormType), Data: map[string]interface{}{"eInvoiceFormTypes": einvoiceFormType}, IsAuthenticated: true}, http.StatusOK)

	case r.Method == "POST":
		einvoiceFormType := models.EInvoiceFormType{}
		err := json.NewDecoder(r.Body).Decode(&einvoiceFormType)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormType": models.EInvoiceFormType{}}}, http.StatusBadRequest)
			return
		}
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormType": []models.EInvoiceFormType{}}}, http.StatusBadRequest)
			return
		}
		if einvoiceFormType.ID == nil {
			einvoiceFormType.RecCreatedByID = *user.ID
			einvoiceFormType.RecModifiedByID = *user.ID
			einvoiceFormType.RecCreated = &models.Timestamp{time.Now()}
			einvoiceFormType.RecModified = &models.Timestamp{time.Now()}
			einvoiceFormType.ClientID = user.ClientID
			einvoiceFormType.OrganizationID = user.OrganizationID
		} else {
			einvoiceFormType.RecModifiedByID = *user.ID
			einvoiceFormType.RecModified = &models.Timestamp{time.Now()}
		}

		einvoiceFormType, tranInfor := models.PostEInvoiceFormType(einvoiceFormType)
		if tranInfor.ReturnStatus == false && len(tranInfor.ValidationErrors) > 0 {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, ValidationErrors: tranInfor.ValidationErrors, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormType": einvoiceFormType}}, http.StatusBadRequest)
			return
		} else if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormType": einvoiceFormType}}, http.StatusBadRequest)
			return
		}

		JSONResponse(w, models.Response{ReturnStatus: true, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormType": einvoiceFormType}}, http.StatusOK)

	case r.Method == "DELETE":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		ids := strings.Split(r.URL.Query().Get("ID"), ",")
		tranInfo := models.DeleteEInvoiceFormTypeById(user.OrganizationID, ids)
		if tranInfo.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true}, http.StatusOK)
	}
}

func API_eInvoiceFormType_Id(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	switch {
	case r.Method == "GET":
		ID, err := strconv.ParseInt(r.URL.Query().Get("ID"), 10, 64)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{ErrIDParameterNotFound.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormType": models.EInvoiceFormType{}}}, http.StatusBadRequest)
			return
		}
		getData, tranInfo := models.GetEInvoiceFormTypeByID(ID)
		if !tranInfo.ReturnStatus {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormType": models.EInvoiceFormType{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, Data: map[string]interface{}{"eInvoiceFormType": getData}, IsAuthenticated: true}, http.StatusOK)
	}
}

