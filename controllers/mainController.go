package controllers

import (
	"encoding/json"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/models"
	"erpvietnam/sql-parser/dynamic-where"
	"errors"
	"fmt"
	"net/http"
	"strings"
)

//InitializeApplication run init menu ... before login
func InitializeApplication(w http.ResponseWriter, r *http.Request) {
	applicationModel := new(models.ApplicationModelDTO)

	//TODO: Implement InitializeApplication here

	JSONResponse(w, applicationModel, http.StatusOK)
}

// JSONResponse attempts to set the status code, c, and marshal the given interface, d, into a response that
// is written to the given ResponseWriter.
func JSONResponse(w http.ResponseWriter, d interface{}, c int) {
	dj, err := json.MarshalIndent(d, "", "  ")
	if err != nil {
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		log.Error(err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(c)
	fmt.Fprintf(w, "%s", dj)
}

type SQLParseDTO struct {
	ID    string
	Value string
}

// API_SQLParse attempts parse conditions and return sql where string
func API_SQLParse(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	switch {
	case r.Method == "POST":
		sqlParses := []SQLParseDTO{}
		err := json.NewDecoder(r.Body).Decode(&sqlParses)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusInternalServerError)
			return
		}
		errReturns := []string{}
		stmtReturns := []string{}
		hasError := false
		for _, value := range sqlParses {
			sqlParse := value
			stmt, err := where.NewParser(strings.NewReader(sqlParse.Value)).Parse()
			if err != nil {
				errReturns = append(errReturns, err.Error())
				stmtReturns = append(stmtReturns, "")
				hasError = true
			} else {
				errReturns = append(errReturns, "")
				stmtReturns = append(stmtReturns, strings.Replace(strings.Join(stmt.Parts, " "), "{id}", sqlParse.ID, -1))
			}
		}
		if hasError {
			JSONResponse(w, models.Response{ReturnStatus: false, IsAuthenticated: true, Data: map[string]interface{}{"Stmts": stmtReturns, "Errs": errReturns}}, http.StatusBadRequest)
		} else {
			JSONResponse(w, models.Response{ReturnStatus: true, IsAuthenticated: true, Data: map[string]interface{}{"Stmts": stmtReturns, "Errs": errReturns}}, http.StatusOK)
		}
	}
}

// ErrIDParameterNotFound is thrown when do not found ID in request
var ErrIDParameterNotFound = errors.New("ID Parameter Not Found")
