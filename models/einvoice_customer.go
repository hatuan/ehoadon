package models

import (
	"database/sql"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/settings"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/jmoiron/sqlx"
)

type EInvoiceCustomer struct {
	ID                     *int64     `db:"id" json:",string"`
	Code                   string     `db:"code"`
	Description            string     `db:"description"`
	Address                string     `db:"address"`
	AddressTransition      string     `db:"address_transition"`
	VatCode                string     `db:"vat_code"`
	Mobile                 string     `db:"mobile"`
	Fax                    string     `db:"fax"`
	Telephone              string     `db:"telephone"`
	RepresentativeName     string     `db:"representative_name"`
	RepresentativePosition string     `db:"representative_position"`
	ContactName            string     `db:"contact_name"`
	EMail                  string     `db:"e_mail"`
	BankAccount            string     `db:"bank_account"`
	BankName               string     `db:"bank_name"`
	Comment                string     `db:"comment"`
	RecCreatedByID         int64      `db:"rec_created_by" json:",string"`
	RecCreatedByUser       string     `db:"rec_created_by_user"`
	RecCreated             *Timestamp `db:"rec_created_at"`
	RecModifiedByID        int64      `db:"rec_modified_by" json:",string"`
	RecModifiedByUser      string     `db:"rec_modified_by_user"`
	RecModified            *Timestamp `db:"rec_modified_at"`
	Status                 int8       `db:"status"`
	Version                int16      `db:"version"`
	ClientID               int64      `db:"client_id" json:",string"`
	OrganizationID         int64      `db:"organization_id" json:",string"`
	Organization           string     `db:"organization"`
}

// ErrEInvoiceCustomerNotFound indicates there was no EInvoiceCustomer
var ErrEInvoiceCustomerNotFound = errors.New("EInvoiceCustomer not found")

// ErrEInvoiceCustomerDescriptionNotSpecified indicates there was no name given by the user
var ErrEInvoiceCustomerDescriptionNotSpecified = errors.New("EInvoiceCustomer's description not specified")

// ErrEInvoiceCustomerCodeNotSpecified indicates there was no code given by the user
var ErrEInvoiceCustomerCodeNotSpecified = errors.New("EInvoiceCustomer's code not specified")

// ErrEInvoiceCustomerCodeDuplicate indicates there was duplicate of code given by the user
var ErrEInvoiceCustomerCodeDuplicate = errors.New("EInvoiceCustomer's code is duplicate")

// ErrEInvoiceCustomerFatal indicates there was fatal error
var ErrEInvoiceCustomerFatal = errors.New("EInvoiceCustomer has fatal error")

// ErrEInvoiceCustomerValidate indicates there was validate error
var ErrEInvoiceCustomerValidate = errors.New("EInvoiceCustomer has validate error")

// Validate checks to make sure there are no invalid fields in a submitted
func (c *EInvoiceCustomer) Validate() map[string]InterfaceArray {
	validationErrors := make(map[string]InterfaceArray)

	if c.Code == "" {
		validationErrors["Code"] = append(validationErrors["Code"], ErrEInvoiceCustomerCodeNotSpecified.Error())
	}
	if c.Description == "" {
		validationErrors["Description"] = append(validationErrors["Description"], ErrEInvoiceCustomerDescriptionNotSpecified.Error())
	}
	if c.Code != "" {
		db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
		if err != nil {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrEInvoiceCustomerFatal.Error())
		}
		defer db.Close()
		var otherID string
		ID := int64(0)
		if c.ID != nil {
			ID = *c.ID
		}
		err = db.Get(&otherID, "SELECT id FROM ehd_customer WHERE code = $1 AND id != $2 AND client_id = $3", c.Code, ID, c.ClientID)
		if err != nil && err != sql.ErrNoRows {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrEInvoiceCustomerFatal.Error())
		}
		if otherID != "" && err != sql.ErrNoRows {
			validationErrors["Code"] = append(validationErrors["Code"], ErrEInvoiceCustomerCodeDuplicate.Error())
		}
	}
	return validationErrors
}

func GetEInvoiceCustomers(orgID int64, searchCondition string, infiniteScrollingInformation InfiniteScrollingInformation) ([]EInvoiceCustomer, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT ehd_customer.*, user_created.name as rec_created_by_user, " +
		" user_modified.name as rec_modified_by_user, organization.name as organization" +
		" FROM ehd_customer " +
		" INNER JOIN user_profile as user_created ON ehd_customer.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_modified ON ehd_customer.rec_modified_by = user_modified.id " +
		" INNER JOIN organization as organization ON ehd_customer.organization_id = organization.id "

	sqlWhere := " WHERE ehd_customer.organization_id = $1"
	if len(searchCondition) > 0 {
		sqlWhere += fmt.Sprintf(" AND %s", searchCondition)
	}

	var sqlOrder string
	if len(infiniteScrollingInformation.SortDirection) == 0 || infiniteScrollingInformation.SortDirection == "ASC" {
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortExpression) > 0 {
		///	sqlWhere += fmt.Sprintf(" AND %s > $2", "ehd_customer."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s ASC", "ehd_customer."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	} else { //sort DESC
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortDirection) > 0 {
		//	sqlWhere += fmt.Sprintf(" AND %s < $2", "ehd_customer."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s DESC", "ehd_customer."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	}
	sqlLimit := ""
	if len(infiniteScrollingInformation.FetchSize) > 0 {
		sqlLimit += fmt.Sprintf(" LIMIT %s ", infiniteScrollingInformation.FetchSize)
	}
	sqlString += sqlWhere + sqlOrder + sqlLimit
	log.Debug(sqlString)

	getDatas := []EInvoiceCustomer{}
	err = db.Select(&getDatas, sqlString, orgID)

	if err != nil {
		log.Error(err)
		return getDatas, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return getDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(getDatas)) + " records found"}}
}

func PostEInvoiceCustomer(postData EInvoiceCustomer) (EInvoiceCustomer, TransactionalInformation) {
	if validateErrs := postData.Validate(); len(validateErrs) != 0 {
		return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceCustomerValidate.Error()}, ValidationErrors: validateErrs}
	}

	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	if postData.ID == nil {
		postData.Version = 1
		stmt, _ := db.PrepareNamed("INSERT INTO ehd_customer(code," +
			"description, " +
			"address," +
			"address_transition," +
			"vat_code," +
			"mobile," +
			"fax," +
			"telephone," +
			"representative_name," +
			"representative_position," +
			"contact_name," +
			"e_mail," +
			"bank_account," +
			"bank_name," +
			"comment," +
			"rec_created_by," +
			"rec_created_at," +
			"rec_modified_by," +
			"rec_modified_at," +
			"status," +
			"version," +
			"client_id," +
			"organization_id)" +
			" VALUES (:code, " +
			":description, " +
			":address," +
			":address_transition," +
			":vat_code," +
			":mobile," +
			":fax," +
			":telephone," +
			":representative_name," +
			":representative_position," +
			":contact_name," +
			":e_mail," +
			":bank_account," +
			":bank_name," +
			":comment," +
			":rec_created_by," +
			":rec_created_at," +
			":rec_modified_by," +
			":rec_modified_at," +
			":status," +
			":version," +
			":client_id," +
			":organization_id) RETURNING id")
		id := int64(0)
		err := stmt.Get(&id, postData)
		if err != nil {
			log.Error(err)
			return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		postData.ID = &id
	} else {
		stmt, _ := db.PrepareNamed("UPDATE ehd_customer SET " +
			"code = :code," +
			"description = :description," +
			"address = :address," +
			"address_transition = :address_transition," +
			"vat_code = :vat_code," +
			"mobile = :mobile," +
			"fax = :fax," +
			"telephone = :telephone," +
			"representative_name = :representative_name," +
			"representative_position = :representative_position," +
			"contact_name = :contact_name," +
			"e_mail = :e_mail," +
			"bank_account = :bank_account," +
			"bank_name = :bank_name," +
			"comment = :comment," +
			"status = :status," +
			"version = :version + 1," +
			"rec_modified_by = :rec_modified_by, rec_modified_at = :rec_modified_at WHERE id = :id AND version = :version")

		result, err := stmt.Exec(postData)
		if err != nil {
			log.Error(err)
			return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		changes, err := result.RowsAffected()
		if err != nil {
			log.Error(err)
			return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		if changes == 0 {
			return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceCustomerNotFound.Error()}}
		}
	}
	postData, _ = GetEInvoiceCustomerByID(*postData.ID)
	return postData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Updated/Created successfully"}}
}

// GetEInvoiceCustomerByID returns the EInvoiceCustomer that the given id corresponds to. If no EInvoiceCustomer is found, an
// error is thrown.
func GetEInvoiceCustomerByID(id int64) (EInvoiceCustomer, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	getData := EInvoiceCustomer{}
	err = db.Get(&getData, "SELECT ehd_customer.*,"+
		"user_created.name as rec_created_by_user,"+
		"user_modified.name as rec_modified_by_user,"+
		"organization.name as organization"+
		"	FROM ehd_customer "+
		"		INNER JOIN user_profile as user_created ON ehd_customer.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_customer.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_customer.organization_id = organization.id "+
		"	WHERE ehd_customer.id=$1", id)
	if err != nil && err == sql.ErrNoRows {
		return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceCustomerNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

// GetEInvoiceCustomerByCode returns the EInvoiceCustomer that the given id corresponds to.
// If no EInvoiceCustomer is found, an error is thrown.
func GetEInvoiceCustomerByCode(code string, orgID int64) (EInvoiceCustomer, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	org, _ := GetOrganizationByID(orgID)

	getData := EInvoiceCustomer{}
	err = db.Get(&getData, "SELECT ehd_customer.*,"+
		"user_created.name as rec_created_by_user,"+
		"user_modified.name as rec_modified_by_user,"+
		"organization.name as organization"+
		"	FROM ehd_customer "+
		"		INNER JOIN user_profile as user_created ON ehd_customer.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_customer.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_customer.organization_id = organization.id "+
		"	WHERE ehd_customer.code=$1 and ehd_customer.client_id=$2", code, org.ClientID)

	if err != nil && err == sql.ErrNoRows {
		return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceCustomerNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceCustomer{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

func DeleteEInvoiceCustomerById(orgID int64, ids []string) TransactionalInformation {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	query, args, err := sqlx.In("DELETE FROM ehd_customer "+
		" WHERE ehd_customer.id IN (?) and ehd_customer.organization_id=?", ids, orgID)

	query = sqlx.Rebind(sqlx.DOLLAR, query)

	_, err = db.Exec(query, args...)

	if err != nil && err == sql.ErrNoRows {
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceCustomerNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}
