package controllers

import (
	"encoding/json"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/models"
	"net/http"
	"strconv"

	ctx "github.com/gorilla/context"
	"github.com/gorilla/mux"
)

//API_Users_Id Get & Update User
func API_Users_Id(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		log.Error(err.Error())
		JSONResponse(w, models.User{}, http.StatusInternalServerError)
		return
	}
	u, err := models.GetUser(id)
	if err != nil {
		log.Error(err.Error())
		JSONResponse(w, u, http.StatusInternalServerError)
		return
	}

	switch {
	case r.Method == "GET":
		JSONResponse(w, u, http.StatusOK)

	}
}

//API_User_Preference Get & Set User's Preference
func API_User_Preference(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	requestUser := ctx.Get(r, "user").(models.User)

	switch {

	case r.Method == "GET":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"Preference": models.PreferenceDTO{}}}, http.StatusInternalServerError)
		}
		preference, err := user.GetPreference()
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"Preference": models.PreferenceDTO{}}}, http.StatusInternalServerError)
		}
		JSONResponse(w, models.Response{ReturnStatus: true, IsAuthenticated: true, Data: map[string]interface{}{"Preference": preference}}, http.StatusOK)

	case r.Method == "POST": //update preference to user
		preference := models.PreferenceDTO{}
		err := json.NewDecoder(r.Body).Decode(&preference)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"Preference": models.PreferenceDTO{}}}, http.StatusInternalServerError)
		}
		err = requestUser.SetPreference(preference)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"Preference": preference}}, http.StatusInternalServerError)
		}
		JSONResponse(w, models.Response{ReturnStatus: true, IsAuthenticated: true, Data: map[string]interface{}{"Preference": preference}}, http.StatusOK)
	}

}
