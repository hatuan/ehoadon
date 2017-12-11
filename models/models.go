package models

import (
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/settings"
	"fmt"
	"strconv"
	"strings"
	"text/template"

	"database/sql"
	"database/sql/driver"

	"github.com/jmoiron/sqlx"
)

type Flash struct {
	Type    string
	Message string
}

type Response struct {
	ReturnStatus     bool
	ReturnMessage    []string
	ValidationErrors map[string]InterfaceArray
	TotalPages       int
	TotalRows        int
	PageSize         int
	IsAuthenticated  bool
	Data             map[string]interface{}
}

type Token struct {
	TransactionalInformation
	Token string //`json:"token"` //must use lowercase
}

type LoginDTO struct {
	UserName string `json:"username"`
	Password string `json:"password"`
}

type TransactionalInformation struct {
	ReturnStatus     bool
	ReturnMessage    []string
	ValidationErrors map[string]InterfaceArray
	TotalPages       int
	TotalRows        int
	PageSize         int
	IsAuthenticated  bool
}

type InquiryInformationDTO struct {
	CurrentPageNumber int
	PageSize          int
	SearchCondition   string
	SortDirection     string
	SortExpression    string
}

type InfiniteScrollingInformation struct {
	After          string
	FetchSize      string
	SortDirection  string
	SortExpression string
}

type ApplicationMenuDTO struct {
	MenuID                 string `json:"menu_id"`
	Description            string `json:"description"`
	Route                  string `json:"route"`
	Module                 string `json:"module"`
	MenuOrder              int    `json:"menu_order"`
	RequiresAuthentication bool   `json:"requires_authentication"`
}

//ApplicationModelDTO user for return from  controllers.InitializeApplication
type ApplicationModelDTO struct {
	TransactionalInformation
	MenuItems []ApplicationMenuDTO `json:"menu_items"`
}

const EmptyUUID = "00000000-0000-0000-0000-000000000000"

// CheckUnique check unique of Code on each client
func CheckUnique(table string, ID int64, code string, orgID int64) (bool, error) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	org, _ := GetOrganizationByID(orgID)

	table = template.HTMLEscapeString(table)
	strSQL := fmt.Sprintf("SELECT id FROM %s WHERE code = $1 AND id != $2 AND client_id = $3", table)

	log.Debug(strSQL)

	var otherID string
	err = db.Get(&otherID, strSQL, code, ID, org.ClientID)

	if err != nil && err == sql.ErrNoRows {
		return true, nil
	} else if err != nil {
		log.Error(err)
		return true, err
	}
	return false, nil
}

// InterfaceArray is a type implementing the sql/driver/value interface
// This is due to the native driver not supporting arrays...
type InterfaceArray []interface{}

// Value returns the driver compatible value
func (a InterfaceArray) Value() (driver.Value, error) {
	var strs []string
	for _, i := range a {
		if str, ok := i.(string); ok {
			strs = append(strs, q(str))
		} else {
			strs = append(strs, "''")
		}
	}
	return "{" + strings.Join(strs, ",") + "}", nil
}

// Int64Array is a type implementing the sql/driver/value interface
// This is due to the native driver not supporting arrays...
type Int64Array []int64

// Value returns the driver compatible value
func (a Int64Array) Value() (driver.Value, error) {
	var strs []string
	for _, i := range a {
		strs = append(strs, strconv.FormatInt(i, 10))
	}
	return "{" + strings.Join(strs, ",") + "}", nil
}

// StringArray is a type implementing the sql/driver/value interface
// This is due to the native driver not supporting arrays...
type StringArray []string

// Value returns the driver compatible value
func (a StringArray) Value() (driver.Value, error) {
	var strs []string
	for _, i := range a {
		strs = append(strs, q(i))
	}
	return "{" + strings.Join(strs, ",") + "}", nil
}

// q
func q(s string) string {
	re := strings.NewReplacer("'", "''")
	return "'" + re.Replace(s) + "'"
}

type ErrorCollector []error

func (c *ErrorCollector) Collect(e error) { *c = append(*c, e) }

func (c *ErrorCollector) Error() (errs []string) {

	for _, e := range *c {
		errs = append(errs, e.Error())
	}

	return errs
}

type AutoCompleteDTO struct {
	ID          string `db:"id"`
	Code        string `db:"code"`
	Description string `db:"description"`
}

func AutoComplete(object, term string, orgID int64) ([]AutoCompleteDTO, error) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	autoCompleteDTOs := []AutoCompleteDTO{}

	orgs, err := GetOrgAndRootByID(orgID)
	if err != nil && err == sql.ErrNoRows {
		return []AutoCompleteDTO{}, nil
	} else if err != nil {
		log.Error(err)
		return []AutoCompleteDTO{}, err
	}

	object = template.HTMLEscapeString(object)
	term = term + ":*"
	orgIDs := []int64{}

	for _, org := range orgs {
		orgIDs = append(orgIDs, *org.ID)
	}
	strSQL := fmt.Sprintf("SELECT id, code, description FROM %s WHERE id IN (SELECT id FROM textsearch WHERE textsearch_object=? AND organization_id IN (?)  AND client_id = ? AND textsearch_value @@ to_tsquery('simple', ?))", object)

	query, args, err := sqlx.In(strSQL, object, orgIDs, orgs[0].ClientID, term)

	query = sqlx.Rebind(sqlx.DOLLAR, query)
	err = db.Select(&autoCompleteDTOs, query, args...)

	if err != nil && err == sql.ErrNoRows {
		return []AutoCompleteDTO{}, nil
	} else if err != nil {
		log.Error(err)
		return []AutoCompleteDTO{}, err
	}
	return autoCompleteDTOs, nil
}

func IDGenerator() (int64, error) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	var id int64
	err = db.Get(&id, "SELECT id_generator()")
	if err != nil {
		return 0, err
	}

	return id, nil
}
