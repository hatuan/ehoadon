package routers

import (
	"erpvietnam/ehoadon/controllers"
	"erpvietnam/ehoadon/middleware"
	"net/http"

	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"
)

// InitRoutes creates the routes for handling requests.
// This function returns an *mux.Router.
func InitRoutes() *mux.Router {
	router := mux.NewRouter()

	//API router
	api := router.PathPrefix("/api").Subrouter()
	api = api.StrictSlash(true)
	//token auth login
	api.Handle("/token-auth",
		negroni.New(
			negroni.HandlerFunc(controllers.TokenAuth),
		)).Methods("POST")
	api.Handle("/token-auth",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.TokenAuth),
		)).Methods("GET")

	api.Handle("/token-refresh",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.TokenRefresh),
		)).Methods("GET")

	//main api
	api.HandleFunc("/main/initializeApplication", controllers.InitializeApplication).Methods("GET")

	//user api
	api.Handle("/user/{id:^[a-z0-9]{8}-[a-z0-9]{4}-[1-5][a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{12}$}",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.API_Users_Id),
		))
	api.Handle("/user/preference",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.API_User_Preference),
		))

	//organization api
	api.Handle("/organizations/GetOrganizations",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.API_Organizations),
		))

	//other api
	api.Handle("/check-unique",
		negroni.New(
			negroni.HandlerFunc(controllers.API_Check_Unique),
		))
	api.Handle("/sqlparse",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.API_SQLParse),
		))
	api.Handle("/autocomplete",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.AutoComplete),
		))

	//numbersequence api
	api.Handle("/numbersequences",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.API_NumberSequences),
		))

	api.Handle("/numbersequence",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.API_NumberSequence_Id),
		))

	//eInvoiceCustomer api
	api.Handle("/einvoicecustomers",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.API_eInvoiceCustomers),
		))

	api.Handle("/einvoicecustomer",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.API_eInvoiceCustomer_Id),
		))

	//eInvoiceItemUom api
	api.Handle("/einvoiceitemuoms",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.API_eInvoiceItemUoms),
		))

	api.Handle("/einvoiceitemuom",
		negroni.New(
			negroni.HandlerFunc(middleware.RequireTokenAuthentication),
			negroni.HandlerFunc(controllers.API_eInvoiceItemUom_Id),
		))

	// Setup static file serving
	router.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./static/"))))

	return router
}
