package controllers

import (
	"erpvietnam/ehoadon/models"

	"net/http"
)

func API_Reports(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	switch {
	case r.Method == "GET":
		reports, tranInfor := models.GetReports(r.URL.Query().Get("Search"))
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"Reports": []models.Report{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: true, TotalRows: len(reports), Data: map[string]interface{}{"Reports": reports}, IsAuthenticated: true}, http.StatusOK)
	}
}

func API_Report_Code(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	switch {
	case r.Method == "GET":
		reportID := r.URL.Query().Get("ReportID")
		if reportID == "" {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{ErrIDParameterNotFound.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"Report": models.Report{}}}, http.StatusBadRequest)
			return
		}

		reportNo := r.URL.Query().Get("ReportNo")
		if reportNo == "" {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{ErrIDParameterNotFound.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"Report": models.Report{}}}, http.StatusBadRequest)
			return
		}

		getData, tranInfo := models.GetReportByCode(reportID, reportNo)
		if !tranInfo.ReturnStatus {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"Report": models.Report{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, Data: map[string]interface{}{"Report": getData}, IsAuthenticated: true}, http.StatusOK)
	}
}
