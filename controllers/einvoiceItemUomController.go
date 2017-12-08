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

func API_eInvoiceItemUoms(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	requestUser := context.Get(r, "user").(models.User)

	switch {
	case r.Method == "GET":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceItemUoms": []models.EInvoiceItemUom{}}}, http.StatusBadRequest)
			return
		}

		infiniteScrollingInformation := models.InfiniteScrollingInformation{
			After:          r.URL.Query().Get("After"),
			FetchSize:      r.URL.Query().Get("FetchSize"),
			SortDirection:  r.URL.Query().Get("SortDirection"),
			SortExpression: r.URL.Query().Get("SortExpression")}

		einvoiceItemUom, tranInfor := models.GetEInvoiceItemUoms(user.OrganizationID, r.URL.Query().Get("Search"), infiniteScrollingInformation)
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceItemUoms": []models.EInvoiceItemUom{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: true, TotalRows: len(einvoiceItemUom), Data: map[string]interface{}{"eInvoiceItemUoms": einvoiceItemUom}, IsAuthenticated: true}, http.StatusOK)

	case r.Method == "POST":
		einvoiceItemUom := models.EInvoiceItemUom{}
		err := json.NewDecoder(r.Body).Decode(&einvoiceItemUom)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceItemUom": models.EInvoiceItemUom{}}}, http.StatusBadRequest)
			return
		}
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceItemUom": []models.EInvoiceItemUom{}}}, http.StatusBadRequest)
			return
		}
		if einvoiceItemUom.ID == nil {
			einvoiceItemUom.RecCreatedByID = *user.ID
			einvoiceItemUom.RecModifiedByID = *user.ID
			einvoiceItemUom.RecCreated = &models.Timestamp{time.Now()}
			einvoiceItemUom.RecModified = &models.Timestamp{time.Now()}
			einvoiceItemUom.ClientID = user.ClientID
			einvoiceItemUom.OrganizationID = user.OrganizationID
		} else {
			einvoiceItemUom.RecModifiedByID = *user.ID
			einvoiceItemUom.RecModified = &models.Timestamp{time.Now()}
		}

		einvoiceItemUom, tranInfor := models.PostEInvoiceItemUom(einvoiceItemUom)
		if tranInfor.ReturnStatus == false && len(tranInfor.ValidationErrors) > 0 {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, ValidationErrors: tranInfor.ValidationErrors, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceItemUom": einvoiceItemUom}}, http.StatusBadRequest)
			return
		} else if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceItemUom": einvoiceItemUom}}, http.StatusBadRequest)
			return
		}

		JSONResponse(w, models.Response{ReturnStatus: true, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceItemUom": einvoiceItemUom}}, http.StatusOK)

	case r.Method == "DELETE":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		ids := strings.Split(r.URL.Query().Get("ID"), ",")
		tranInfo := models.DeleteEInvoiceItemUomById(user.OrganizationID, ids)
		if tranInfo.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true}, http.StatusOK)
	}
}

func API_eInvoiceItemUom_Id(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	switch {
	case r.Method == "GET":
		ID, err := strconv.ParseInt(r.URL.Query().Get("ID"), 10, 64)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{ErrIDParameterNotFound.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceItemUom": models.EInvoiceItemUom{}}}, http.StatusBadRequest)
			return
		}
		getData, tranInfo := models.GetEInvoiceItemUomByID(ID)
		if !tranInfo.ReturnStatus {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceItemUom": models.EInvoiceItemUom{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, Data: map[string]interface{}{"eInvoiceItemUom": getData}, IsAuthenticated: true}, http.StatusOK)
	}
}
