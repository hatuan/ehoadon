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

type EInvoiceItemUom struct {
	ID                *int64     `db:"id" json:",string"`
	Code              string     `db:"code"`
	Description       string     `db:"description"`
	RecCreatedByID    int64      `db:"rec_created_by" json:",string"`
	RecCreatedByUser  string     `db:"rec_created_by_user"`
	RecCreated        *Timestamp `db:"rec_created_at"`
	RecModifiedByID   int64      `db:"rec_modified_by" json:",string"`
	RecModifiedByUser string     `db:"rec_modified_by_user"`
	RecModified       *Timestamp `db:"rec_modified_at"`
	Status            int8       `db:"status"`
	Version           int16      `db:"version"`
	ClientID          int64      `db:"client_id" json:",string"`
	OrganizationID    int64      `db:"organization_id" json:",string"`
	Organization      string     `db:"organization"`
}

// ErrEInvoiceItemUomNotFound indicates there was no EInvoiceItemUom
var ErrEInvoiceItemUomNotFound = errors.New("EInvoiceItemUom not found")

// ErrEInvoiceItemUomDescriptionNotSpecified indicates there was no name given by the user
var ErrEInvoiceItemUomDescriptionNotSpecified = errors.New("EInvoiceItemUom's description not specified")

// ErrEInvoiceItemUomCodeNotSpecified indicates there was no code given by the user
var ErrEInvoiceItemUomCodeNotSpecified = errors.New("EInvoiceItemUom's code not specified")

// ErrEInvoiceItemUomCodeDuplicate indicates there was duplicate of code given by the user
var ErrEInvoiceItemUomCodeDuplicate = errors.New("EInvoiceItemUom's code is duplicate")

// ErrEInvoiceItemUomFatal indicates there was fatal error
var ErrEInvoiceItemUomFatal = errors.New("EInvoiceItemUom has fatal error")

// ErrEInvoiceItemUomValidate indicates there was validate error
var ErrEInvoiceItemUomValidate = errors.New("EInvoiceItemUom has validate error")

// Validate checks to make sure there are no invalid fields in a submitted
func (c *EInvoiceItemUom) Validate() map[string]InterfaceArray {
	validationErrors := make(map[string]InterfaceArray)

	if c.Code == "" {
		validationErrors["Code"] = append(validationErrors["Code"], ErrEInvoiceItemUomCodeNotSpecified.Error())
	}
	if c.Description == "" {
		validationErrors["Description"] = append(validationErrors["Description"], ErrEInvoiceItemUomDescriptionNotSpecified.Error())
	}
	if c.Code != "" {
		db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
		if err != nil {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrEInvoiceItemUomFatal.Error())
		}
		defer db.Close()
		var otherID string
		ID := int64(0)
		if c.ID != nil {
			ID = *c.ID
		}
		err = db.Get(&otherID, "SELECT id FROM ehd_item_uom WHERE code = $1 AND id != $2 AND client_id = $3", c.Code, ID, c.ClientID)
		if err != nil && err != sql.ErrNoRows {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrEInvoiceItemUomFatal.Error())
		}
		if otherID != "" && err != sql.ErrNoRows {
			validationErrors["Code"] = append(validationErrors["Code"], ErrEInvoiceItemUomCodeDuplicate.Error())
		}
	}
	return validationErrors
}

func GetEInvoiceItemUoms(orgID int64, searchCondition string, infiniteScrollingInformation InfiniteScrollingInformation) ([]EInvoiceItemUom, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT ehd_item_uom.*, user_created.name as rec_created_by_user, " +
		" user_modified.name as rec_modified_by_user, organization.description as organization" +
		" FROM ehd_item_uom " +
		" INNER JOIN user_profile as user_created ON ehd_item_uom.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_modified ON ehd_item_uom.rec_modified_by = user_modified.id " +
		" INNER JOIN organization as organization ON ehd_item_uom.organization_id = organization.id "

	sqlWhere := " WHERE ehd_item_uom.organization_id = $1"
	if len(searchCondition) > 0 {
		sqlWhere += fmt.Sprintf(" AND %s", searchCondition)
	}

	var sqlOrder string
	if len(infiniteScrollingInformation.SortDirection) == 0 || infiniteScrollingInformation.SortDirection == "ASC" {
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortExpression) > 0 {
		///	sqlWhere += fmt.Sprintf(" AND %s > $2", "ehd_item_uom."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s ASC", "ehd_item_uom."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	} else { //sort DESC
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortDirection) > 0 {
		//	sqlWhere += fmt.Sprintf(" AND %s < $2", "ehd_item_uom."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s DESC", "ehd_item_uom."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	}
	sqlLimit := ""
	if len(infiniteScrollingInformation.FetchSize) > 0 {
		sqlLimit += fmt.Sprintf(" LIMIT %s ", infiniteScrollingInformation.FetchSize)
	}
	sqlString += sqlWhere + sqlOrder + sqlLimit
	log.Debug(sqlString)

	getDatas := []EInvoiceItemUom{}
	err = db.Select(&getDatas, sqlString, orgID)

	if err != nil {
		log.Error(err)
		return getDatas, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return getDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(getDatas)) + " records found"}}
}

func PostEInvoiceItemUom(postData EInvoiceItemUom) (EInvoiceItemUom, TransactionalInformation) {
	if validateErrs := postData.Validate(); len(validateErrs) != 0 {
		return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceItemUomValidate.Error()}, ValidationErrors: validateErrs}
	}

	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	if postData.ID == nil {
		postData.Version = 1
		stmt, _ := db.PrepareNamed("INSERT INTO ehd_item_uom(code," +
			"description, " +
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
			return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		postData.ID = &id
	} else {
		stmt, _ := db.PrepareNamed("UPDATE ehd_item_uom SET " +
			"code = :code," +
			"description = :description," +
			"status = :status," +
			"version = :version + 1," +
			"rec_modified_by = :rec_modified_by, rec_modified_at = :rec_modified_at WHERE id = :id AND version = :version")

		result, err := stmt.Exec(postData)
		if err != nil {
			log.Error(err)
			return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		changes, err := result.RowsAffected()
		if err != nil {
			log.Error(err)
			return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		if changes == 0 {
			return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceItemUomNotFound.Error()}}
		}
	}
	postData, _ = GetEInvoiceItemUomByID(*postData.ID)
	return postData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Updated/Created successfully"}}
}

// GetEInvoiceItemUomByID returns the EInvoiceItemUom that the given id corresponds to. If no EInvoiceItemUom is found, an
// error is thrown.
func GetEInvoiceItemUomByID(id int64) (EInvoiceItemUom, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	getData := EInvoiceItemUom{}
	err = db.Get(&getData, "SELECT ehd_item_uom.*,"+
		"user_created.name as rec_created_by_user,"+
		"user_modified.name as rec_modified_by_user,"+
		"organization.description as organization"+
		"	FROM ehd_item_uom "+
		"		INNER JOIN user_profile as user_created ON ehd_item_uom.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_item_uom.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_item_uom.organization_id = organization.id "+
		"	WHERE ehd_item_uom.id=$1", id)
	if err != nil && err == sql.ErrNoRows {
		return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceItemUomNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

// GetEInvoiceItemUomByCode returns the EInvoiceItemUom that the given id corresponds to.
// If no EInvoiceItemUom is found, an error is thrown.
func GetEInvoiceItemUomByCode(code string, orgID int64) (EInvoiceItemUom, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	org, _ := GetOrganizationByID(orgID)

	getData := EInvoiceItemUom{}
	err = db.Get(&getData, "SELECT ehd_item_uom.*,"+
		"user_created.name as rec_created_by_user,"+
		"user_modified.name as rec_modified_by_user,"+
		"organization.description as organization"+
		"	FROM ehd_item_uom "+
		"		INNER JOIN user_profile as user_created ON ehd_item_uom.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_item_uom.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_item_uom.organization_id = organization.id "+
		"	WHERE ehd_item_uom.code=$1 and ehd_item_uom.client_id=$2", code, org.ClientID)

	if err != nil && err == sql.ErrNoRows {
		return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceItemUomNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceItemUom{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

func DeleteEInvoiceItemUomById(orgID int64, ids []string) TransactionalInformation {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	query, args, err := sqlx.In("DELETE FROM ehd_item_uom "+
		" WHERE ehd_item_uom.id IN (?) and ehd_item_uom.organization_id=?", ids, orgID)

	query = sqlx.Rebind(sqlx.DOLLAR, query)

	_, err = db.Exec(query, args...)

	if err != nil && err == sql.ErrNoRows {
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceItemUomNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}
