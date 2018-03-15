package controllers

import (
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/models"

	"net/http"

	"github.com/gorilla/context"
)

func API_eInvoicesAdj(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
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

		einvoice, tranInfor := models.GetEInvoicesAdj(user.OrganizationID, r.URL.Query().Get("SearchNumberForm"), r.URL.Query().Get("SearchSymbol"), r.URL.Query().Get("SearchFromDate"), r.URL.Query().Get("SearchToDate"), r.URL.Query().Get("SearchCustomer"), r.URL.Query().Get("SearchCustomerVatNumber"), r.URL.Query().Get("SearchStatus"), infiniteScrollingInformation)
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoices": []models.EInvoice{}, "NumberForms": []string{}, "Symbols": []string{}}}, http.StatusBadRequest)
			return
		}
		numberForms, tranInfor := models.GetEInvoiceNumberForms(user.OrganizationID)
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoices": []models.EInvoice{}, "NumberForms": []string{}, "Symbols": []string{}}}, http.StatusBadRequest)
			return
		}
		symbols, tranInfor := models.GetEInvoiceSymbols(user.OrganizationID)
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoices": []models.EInvoice{}, "NumberForms": []string{}, "Symbols": []string{}}}, http.StatusBadRequest)
			return
		}

		JSONResponse(w, models.Response{ReturnStatus: true, TotalRows: len(einvoice), Data: map[string]interface{}{"eInvoices": einvoice, "NumberForms": numberForms, "Symbols": symbols}, IsAuthenticated: true}, http.StatusOK)
	}
}
