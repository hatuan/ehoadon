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

func API_eInvoiceFormReleases(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	requestUser := context.Get(r, "user").(models.User)

	switch {
	case r.Method == "GET":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormReleases": []models.EInvoiceFormRelease{}}}, http.StatusBadRequest)
			return
		}

		infiniteScrollingInformation := models.InfiniteScrollingInformation{
			After:          r.URL.Query().Get("After"),
			FetchSize:      r.URL.Query().Get("FetchSize"),
			SortDirection:  r.URL.Query().Get("SortDirection"),
			SortExpression: r.URL.Query().Get("SortExpression")}

		einvoiceFormRelease, tranInfor := models.GetEInvoiceFormReleases(user.OrganizationID, r.URL.Query().Get("Search"), infiniteScrollingInformation)
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormReleases": []models.EInvoiceFormRelease{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: true, TotalRows: len(einvoiceFormRelease), Data: map[string]interface{}{"eInvoiceFormReleases": einvoiceFormRelease}, IsAuthenticated: true}, http.StatusOK)

	case r.Method == "POST":
		einvoiceFormRelease := models.EInvoiceFormRelease{}
		err := json.NewDecoder(r.Body).Decode(&einvoiceFormRelease)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormRelease": models.EInvoiceFormRelease{}}}, http.StatusBadRequest)
			return
		}
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormRelease": []models.EInvoiceFormRelease{}}}, http.StatusBadRequest)
			return
		}
		if einvoiceFormRelease.ID == nil {
			einvoiceFormRelease.RecCreatedByID = *user.ID
			einvoiceFormRelease.RecModifiedByID = *user.ID
			einvoiceFormRelease.RecCreated = &models.Timestamp{time.Now()}
			einvoiceFormRelease.RecModified = &models.Timestamp{time.Now()}
			einvoiceFormRelease.ClientID = user.ClientID
			einvoiceFormRelease.OrganizationID = user.OrganizationID
		} else {
			einvoiceFormRelease.RecModifiedByID = *user.ID
			einvoiceFormRelease.RecModified = &models.Timestamp{time.Now()}
		}

		einvoiceFormRelease, tranInfor := models.PostEInvoiceFormRelease(einvoiceFormRelease)
		if tranInfor.ReturnStatus == false && len(tranInfor.ValidationErrors) > 0 {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, ValidationErrors: tranInfor.ValidationErrors, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormRelease": einvoiceFormRelease}}, http.StatusBadRequest)
			return
		} else if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormRelease": einvoiceFormRelease}}, http.StatusBadRequest)
			return
		}

		JSONResponse(w, models.Response{ReturnStatus: true, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormRelease": einvoiceFormRelease}}, http.StatusOK)

	case r.Method == "DELETE":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		ids := strings.Split(r.URL.Query().Get("ID"), ",")
		tranInfo := models.DeleteEInvoiceFormReleaseById(user.OrganizationID, ids)
		if tranInfo.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true}, http.StatusOK)
	}
}

func API_eInvoiceFormRelease_Id(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	switch {
	case r.Method == "GET":
		ID, err := strconv.ParseInt(r.URL.Query().Get("ID"), 10, 64)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{ErrIDParameterNotFound.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormRelease": models.EInvoiceFormRelease{}}}, http.StatusBadRequest)
			return
		}
		getData, tranInfo := models.GetEInvoiceFormReleaseByID(ID)
		if !tranInfo.ReturnStatus {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoiceFormRelease": models.EInvoiceFormRelease{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, Data: map[string]interface{}{"eInvoiceFormRelease": getData}, IsAuthenticated: true}, http.StatusOK)
	}
}
