package controllers

import (
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/models"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/context"
)

func API_Check_Unique(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	switch {
	case r.Method == "POST":
		//Print r.Body
		//body, err := ioutil.ReadAll(r.Body)
		//if err != nil {
		//	panic(err)
		//}
		//log.Info(string(body))

		err := r.ParseForm()
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, err.Error(), http.StatusOK)
			return
		}
		userID, err := strconv.ParseInt(r.Form.Get("UserID"), 10, 64)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, err.Error(), http.StatusOK)
			return
		}

		code := r.Form.Get("Code")
		table := r.Form.Get("Table")
		recID, err := strconv.ParseInt(r.Form.Get("RecID"), 10, 64)
		if err != nil {
			recID = int64(0)
		}

		user, err := models.GetUser(userID)

		valid, err := models.CheckUnique(table, recID, code, user.OrganizationID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, err.Error(), http.StatusOK)
			return
		}

		if valid {
			JSONResponse(w, "true", http.StatusOK)
		} else {
			JSONResponse(w, nil, http.StatusOK)
		}
	}
}

func AutoComplete(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	requestUser := context.Get(r, "user").(models.User)

	switch {
	case r.Method == "GET":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, err.Error(), http.StatusBadRequest)
			return
		}

		object := r.URL.Query().Get("object")
		term := r.URL.Query().Get("term")

		autoCompleteDTOs, err := models.AutoComplete(object, term, user.OrganizationID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, err.Error(), http.StatusBadRequest)
			return
		}

		JSONResponse(w, autoCompleteDTOs, http.StatusOK)
	}
}

// formatRequest generates ascii representation of a request
func formatRequest(r *http.Request) string {
	// Create return string
	var request []string
	// Add the request string
	url := fmt.Sprintf("%v %v %v", r.Method, r.URL, r.Proto)
	request = append(request, url)
	// Add the host
	request = append(request, fmt.Sprintf("Host: %v", r.Host))
	// Loop through headers
	for name, headers := range r.Header {
		name = strings.ToLower(name)
		for _, h := range headers {
			request = append(request, fmt.Sprintf("%v: %v", name, h))
		}
	}

	// If this is a POST, add post data
	if r.Method == "POST" {
		r.ParseForm()
		request = append(request, "\n")
		request = append(request, r.Form.Encode())
	}
	// Return the request as a string
	return strings.Join(request, "\n")
}
