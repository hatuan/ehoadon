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
	"github.com/shopspring/decimal"
)

type EInvoiceItem struct {
	ID                *int64          `db:"id" json:",string"`
	Code              string          `db:"code"`
	Description       string          `db:"description"`
	GroupID           *int64          `db:"item_group_id" json:",string"`
	GroupCode         string          `db:"item_group_code"`
	UomID             *int64          `db:"item_uom_id" json:",string"`
	UomCode           string          `db:"item_uom_code"`
	Vat               int8            `db:"vat"`
	Discount          int8            `db:"discount"`
	Quantity          decimal.Decimal `db:"quantity"`
	UnitPrice         decimal.Decimal `db:"unit_price"`
	RecCreatedByID    int64           `db:"rec_created_by" json:",string"`
	RecCreatedByUser  string          `db:"rec_created_by_user"`
	RecCreated        *Timestamp      `db:"rec_created_at"`
	RecModifiedByID   int64           `db:"rec_modified_by" json:",string"`
	RecModifiedByUser string          `db:"rec_modified_by_user"`
	RecModified       *Timestamp      `db:"rec_modified_at"`
	Status            int8            `db:"status"`
	Version           int16           `db:"version"`
	ClientID          int64           `db:"client_id" json:",string"`
	OrganizationID    int64           `db:"organization_id" json:",string"`
	Organization      string          `db:"organization"`
}

// ErrEInvoiceItemNotFound indicates there was no EInvoiceItem
var ErrEInvoiceItemNotFound = errors.New("EInvoiceItem not found")

// ErrEInvoiceItemDescriptionNotSpecified indicates there was no name given by the user
var ErrEInvoiceItemDescriptionNotSpecified = errors.New("EInvoiceItem's description not specified")

// ErrEInvoiceItemCodeNotSpecified indicates there was no code given by the user
var ErrEInvoiceItemCodeNotSpecified = errors.New("EInvoiceItem's code not specified")

// ErrEInvoiceItemCodeDuplicate indicates there was duplicate of code given by the user
var ErrEInvoiceItemCodeDuplicate = errors.New("EInvoiceItem's code is duplicate")

// ErrEInvoiceItemFatal indicates there was fatal error
var ErrEInvoiceItemFatal = errors.New("EInvoiceItem has fatal error")

// ErrEInvoiceItemValidate indicates there was validate error
var ErrEInvoiceItemValidate = errors.New("EInvoiceItem has validate error")

// Validate checks to make sure there are no invalid fields in a submitted
func (c *EInvoiceItem) Validate() map[string]InterfaceArray {
	validationErrors := make(map[string]InterfaceArray)

	if c.Code == "" {
		validationErrors["Code"] = append(validationErrors["Code"], ErrEInvoiceItemCodeNotSpecified.Error())
	}
	if c.Description == "" {
		validationErrors["Description"] = append(validationErrors["Description"], ErrEInvoiceItemDescriptionNotSpecified.Error())
	}
	if c.Code != "" {
		db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
		if err != nil {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrEInvoiceItemFatal.Error())
		}
		defer db.Close()
		var otherID string
		ID := int64(0)
		if c.ID != nil {
			ID = *c.ID
		}
		err = db.Get(&otherID, "SELECT id FROM ehd_item WHERE code = $1 AND id != $2 AND client_id = $3", c.Code, ID, c.ClientID)
		if err != nil && err != sql.ErrNoRows {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrEInvoiceItemFatal.Error())
		}
		if otherID != "" && err != sql.ErrNoRows {
			validationErrors["Code"] = append(validationErrors["Code"], ErrEInvoiceItemCodeDuplicate.Error())
		}
	}
	return validationErrors
}

func GetEInvoiceItems(orgID int64, searchItem string, infiniteScrollingInformation InfiniteScrollingInformation) ([]EInvoiceItem, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT ehd_item.*, " +
		" user_created.name as rec_created_by_user, " +
		" user_modified.name as rec_modified_by_user, " +
		" organization.description as organization, " +
		" COALESCE(ehd_item_uom.code, '') as item_uom_code, " +
		" COALESCE(ehd_item_group.code, '') as item_group_code " +
		" FROM ehd_item " +
		" INNER JOIN user_profile as user_created ON ehd_item.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_modified ON ehd_item.rec_modified_by = user_modified.id " +
		" INNER JOIN organization as organization ON ehd_item.organization_id = organization.id " +
		" LEFT JOIN ehd_item_group as ehd_item_group ON ehd_item.item_group_id = ehd_item_group.id " +
		" LEFT JOIN ehd_item_uom as ehd_item_uom ON ehd_item.item_uom_id = ehd_item_uom.id "

	sqlWhere := " WHERE ehd_item.organization_id = $1"
	if len(searchItem) > 0 {
		sqlWhere += fmt.Sprintf(" AND (1=0")
		_searchItem := ""
		for _, _word := range strings.Fields(searchItem) {
			_searchItem = _searchItem + fmt.Sprintf(" %s:* &", strings.ToLower(_word))
		}
		_searchItem = _searchItem[:len(_searchItem)-1]
		sqlWhere += fmt.Sprintf(" OR ehd_item.id IN (SELECT id FROM textsearch WHERE textsearch_object='ehd_item' AND organization_id = $1 AND textsearch_value @@ tsquery('%s'))", _searchItem)
		sqlWhere += fmt.Sprintf(" )")
	}

	var sqlOrder string
	if len(infiniteScrollingInformation.SortDirection) == 0 || infiniteScrollingInformation.SortDirection == "ASC" {
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortExpression) > 0 {
		///	sqlWhere += fmt.Sprintf(" AND %s > $2", "ehd_item."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s ASC", "ehd_item."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	} else { //sort DESC
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortDirection) > 0 {
		//	sqlWhere += fmt.Sprintf(" AND %s < $2", "ehd_item."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s DESC", "ehd_item."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	}
	sqlLimit := ""
	if len(infiniteScrollingInformation.FetchSize) > 0 {
		sqlLimit += fmt.Sprintf(" LIMIT %s ", infiniteScrollingInformation.FetchSize)
	}
	sqlString += sqlWhere + sqlOrder + sqlLimit
	log.Debug(sqlString)

	getDatas := []EInvoiceItem{}
	err = db.Select(&getDatas, sqlString, orgID)

	if err != nil {
		log.Error(err)
		return getDatas, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return getDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(getDatas)) + " records found"}}
}

func PostEInvoiceItem(postData EInvoiceItem) (EInvoiceItem, TransactionalInformation) {
	if validateErrs := postData.Validate(); len(validateErrs) != 0 {
		return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceItemValidate.Error()}, ValidationErrors: validateErrs}
	}

	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	if postData.ID == nil {
		postData.Version = 1
		stmt, _ := db.PrepareNamed("INSERT INTO ehd_item(code," +
			"description, " +
			"item_group_id, " +
			"item_uom_id, " +
			"vat, " +
			"discount, " +
			"unit_price, " +
			"quantity, " +
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
			":item_group_id, " +
			":item_uom_id, " +
			":vat, " +
			":discount, " +
			":unit_price, " +
			":quantity, " +
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
			return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		postData.ID = &id
	} else {
		stmt, _ := db.PrepareNamed("UPDATE ehd_item SET " +
			" code			= :code," +
			" description	= :description," +
			" item_group_id	= :item_group_id, " +
			" item_uom_id	= :item_uom_id, " +
			" vat			= :vat, " +
			" discount		= :discount, " +
			" unit_price	= :unit_price, " +
			" quantity		= :quantity, " +
			" status		= :status," +
			" version		= :version + 1," +
			" rec_modified_by	= :rec_modified_by, " +
			" rec_modified_at	= :rec_modified_at " +
			" WHERE id = :id AND version = :version")

		result, err := stmt.Exec(postData)
		if err != nil {
			log.Error(err)
			return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		changes, err := result.RowsAffected()
		if err != nil {
			log.Error(err)
			return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		if changes == 0 {
			return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceItemNotFound.Error()}}
		}
	}
	postData, _ = GetEInvoiceItemByID(*postData.ID)
	return postData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Updated/Created successfully"}}
}

// GetEInvoiceItemByID returns the EInvoiceItem that the given id corresponds to. If no EInvoiceItem is found, an
// error is thrown.
func GetEInvoiceItemByID(id int64) (EInvoiceItem, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	getData := EInvoiceItem{}
	err = db.Get(&getData, "SELECT ehd_item.*, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.description as organization, "+
		" COALESCE(ehd_item_uom.code, '') as item_uom_code, "+
		" COALESCE(ehd_item_group.code, '') as item_group_code "+
		"	FROM ehd_item "+
		"		INNER JOIN user_profile as user_created ON ehd_item.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_item.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_item.organization_id = organization.id "+
		"		LEFT JOIN ehd_item_group as ehd_item_group ON ehd_item.item_group_id = ehd_item_group.id "+
		"		LEFT JOIN ehd_item_uom as ehd_item_uom ON ehd_item.item_uom_id = ehd_item_uom.id "+
		"	WHERE ehd_item.id=$1", id)
	if err != nil && err == sql.ErrNoRows {
		return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceItemNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

// GetEInvoiceItemByCode returns the EInvoiceItem that the given id corresponds to.
// If no EInvoiceItem is found, an error is thrown.
func GetEInvoiceItemByCode(code string, orgID int64) (EInvoiceItem, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	org, _ := GetOrganizationByID(orgID)

	getData := EInvoiceItem{}
	err = db.Get(&getData, "SELECT ehd_item.*, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.description as organization, "+
		" COALESCE(ehd_item_uom.code, '') as item_uom_code, "+
		" COALESCE(ehd_item_group.code, '') as item_group_code "+
		"	FROM ehd_item "+
		"		INNER JOIN user_profile as user_created ON ehd_item.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_item.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_item.organization_id = organization.id "+
		"		LEFT JOIN ehd_item_group as ehd_item_group ON ehd_item.item_group_id = ehd_item_group.id "+
		"		LEFT JOIN ehd_item_uom as ehd_item_uom ON ehd_item.item_uom_id = ehd_item_uom.id "+
		"	WHERE ehd_item.code=$1 and ehd_item.client_id=$2", code, org.ClientID)

	if err != nil && err == sql.ErrNoRows {
		return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceItemNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceItem{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

func DeleteEInvoiceItemById(orgID int64, ids []string) TransactionalInformation {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	query, args, err := sqlx.In("DELETE FROM ehd_item "+
		" WHERE ehd_item.id IN (?) and ehd_item.organization_id=?", ids, orgID)

	query = sqlx.Rebind(sqlx.DOLLAR, query)

	_, err = db.Exec(query, args...)

	if err != nil && err == sql.ErrNoRows {
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceItemNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}
