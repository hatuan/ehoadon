package models

import (
	"database/sql"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/settings"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/jmoiron/sqlx"
)

type NumberSequence struct {
	ID                *int64     `db:"id"  json:",string"`
	Code              string     `db:"code"`
	Description       string     `db:"description"`
	CurrentNo         int        `db:"current_no"`
	StartingNo        int        `db:"starting_no"`
	EndingNo          int        `db:"ending_no"`
	FormatNo          string     `db:"format_no"`
	IsDefault         bool       `db:"is_default"`
	Manual            bool       `db:"manual"`
	NoSequenceName    string     `db:"no_seq_name"`
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

// ErrNumberSequenceNotFound indicates there was no NumberSequence
var ErrNumberSequenceNotFound = errors.New("NumberSequence not found")

// ErrNumberSequenceDescriptionNotSpecified indicates there was no name given by the user
var ErrNumberSequenceDescriptionNotSpecified = errors.New("NumberSequence's description not specified")

// ErrNumberSequenceCodeNotSpecified indicates there was no code given by the user
var ErrNumberSequenceCodeNotSpecified = errors.New("NumberSequence's code not specified")

// ErrNumberSequenceCodeDuplicate indicates there was duplicate of code given by the user
var ErrNumberSequenceCodeDuplicate = errors.New("NumberSequence's code is duplicate")

// ErrNumberSequenceFatal indicates there was fatal error
var ErrNumberSequenceFatal = errors.New("NumberSequence has fatal error")

// ErrNumberSequenceValidate indicates there was validate error
var ErrNumberSequenceValidate = errors.New("NumberSequence has validate error")

// ErrNumberSequenceLen indicates if len of numberSequence is more than 15
var ErrNumberSequenceLen = errors.New("NumberSequence cannot be extended to more than 15 characters")

// Validate checks to make sure there are no invalid fields in a submitted
func (c *NumberSequence) Validate() map[string]InterfaceArray {
	validationErrors := make(map[string]InterfaceArray)

	if c.Code == "" {
		validationErrors["Code"] = append(validationErrors["Code"], ErrNumberSequenceCodeNotSpecified.Error())
	}
	if c.Description == "" {
		validationErrors["Description"] = append(validationErrors["Description"], ErrNumberSequenceDescriptionNotSpecified.Error())
	}
	if c.Code != "" {
		db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
		if err != nil {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrNumberSequenceFatal.Error())
		}
		defer db.Close()
		var otherID string
		ID := int64(0)
		if c.ID != nil {
			ID = *c.ID
		}
		err = db.Get(&otherID, "SELECT id FROM number_sequence WHERE code = $1 AND id != $2 AND client_id = $3", c.Code, ID, c.ClientID)
		if err != nil && err != sql.ErrNoRows {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrNumberSequenceFatal.Error())
		}
		if otherID != "" && err != sql.ErrNoRows {
			validationErrors["Code"] = append(validationErrors["Code"], ErrNumberSequenceCodeDuplicate.Error())
		}
	}
	return validationErrors
}

// NextNo return string with format of noID
func (c *NumberSequence) NextNo() (string, error) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return "", err
	}
	defer db.Close()

	sqlString := "WITH UPDATED AS (UPDATE number_sequence SET current_no = current_no + 1 WHERE id = $1 RETURNING current_no)" +
		" SELECT current_no FROM UPDATED"

	err = db.Get(c.CurrentNo, sqlString, c.ID)
	if err != nil {
		log.Error(err)
		return "", err
	}
	startPos, endPos := c.getIntegerPos(c.FormatNo)

	return c.replaceNoText(c.FormatNo, c.CurrentNo, 0, startPos, endPos)
}

func (c *NumberSequence) getIntegerPos(no string) (startPos, endPos int) {
	isDigit := false
	startPos = 0
	endPos = 0
	if no != "" {
		i := utf8.RuneCountInString(no) - 1
		for i >= 0 && !(startPos != 0 && !isDigit) {
			if currentRune, _ := utf8.DecodeRuneInString(no[i:]); currentRune == '0' {
				isDigit = true
			} else {
				isDigit = false
			}
			if isDigit {
				if endPos == 0 {
					endPos = i
				}
				startPos = i
			}
			i--
		}
	}

	return startPos, endPos
}

func (c *NumberSequence) replaceNoText(no string, newNo int, fixedLength int, startPos int, endPos int) (string, error) {
	startNo := ""
	endNo := ""
	zeroNo := ""
	var newLength, oldLength int
	if startPos > 0 {
		startNo = no[:startPos]
	}
	if endPos < utf8.RuneCountInString(no)-1 {
		endNo = no[endPos:]
	}
	newLength = len(strconv.Itoa(newNo))
	oldLength = endPos - startPos
	if fixedLength > oldLength {
		oldLength = fixedLength
	}
	if oldLength > newLength {
		zeroNobytes := make([]byte, oldLength-newLength+1)
		for i := range zeroNobytes {
			zeroNobytes[i] = '0'
		}

		zeroNo = string(zeroNobytes)
	}
	if utf8.RuneCountInString(startNo)+utf8.RuneCountInString(zeroNo)+newLength+utf8.RuneCountInString(endNo) > 15 {
		return "", ErrNumberSequenceLen
	}

	return startNo + zeroNo + strconv.Itoa(newNo) + endNo, nil
}

func GetNumberSequences(orgID int64, searchCondition string, infiniteScrollingInformation InfiniteScrollingInformation) ([]NumberSequence, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT number_sequence.*, user_created.name as rec_created_by_user, " +
		" user_modified.name as rec_modified_by_user, organization.name as organization" +
		" FROM number_sequence " +
		" INNER JOIN user_profile as user_created ON number_sequence.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_modified ON number_sequence.rec_modified_by = user_modified.id " +
		" INNER JOIN organization as organization ON number_sequence.organization_id = organization.id "

	sqlWhere := " WHERE number_sequence.organization_id = $1"
	if len(searchCondition) > 0 {
		sqlWhere += fmt.Sprintf(" AND %s", searchCondition)
	}

	var sqlOrder string
	if len(infiniteScrollingInformation.SortDirection) == 0 || infiniteScrollingInformation.SortDirection == "ASC" {
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s ASC", "number_sequence."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	} else { //sort DESC
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s DESC", "number_sequence."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	}
	sqlLimit := ""
	if len(infiniteScrollingInformation.FetchSize) > 0 {
		sqlLimit += fmt.Sprintf(" LIMIT %s ", infiniteScrollingInformation.FetchSize)
	}
	sqlString += sqlWhere + sqlOrder + sqlLimit
	log.Debug(sqlString)

	numberSequences := []NumberSequence{}
	err = db.Select(&numberSequences, sqlString, orgID)

	if err != nil {
		log.Error(err)
		return numberSequences, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return numberSequences, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(numberSequences)) + " records found"}}
}

func PostNumberSequence(numberSequence NumberSequence) (NumberSequence, TransactionalInformation) {
	if validateErrs := numberSequence.Validate(); len(validateErrs) != 0 {
		return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrNumberSequenceValidate.Error()}, ValidationErrors: validateErrs}
	}

	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	if numberSequence.ID == nil {
		numberSequence.Version = 1
		stmt, _ := db.PrepareNamed("INSERT INTO number_sequence(code, description, current_no, starting_no, ending_no, format_no, is_default, manual, rec_created_by, rec_created_at, rec_modified_by, rec_modified_at, status, version, client_id, organization_id)" +
			" VALUES (:code, :description, 0, :starting_no, :ending_no, :format_no, :is_default, :manual, :rec_created_by, :rec_created_at, :rec_modified_by, :rec_modified_at, :status, :version, :client_id, :organization_id) RETURNING id")
		id := int64(0)
		err := stmt.Get(&id, numberSequence)
		if err != nil {
			log.Error(err)
			return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		} else {
			numberSequence.ID = &id
		}

	} else {
		stmt, _ := db.PrepareNamed("UPDATE number_sequence SET " +
			"code = :code," +
			"description = :description," +
			"starting_no = :starting_no, " +
			"ending_no = :ending_no, " +
			"format_no = :format_no, " +
			"is_default = :is_default, " +
			"manual = :manual," +
			"status = :status," +
			"version = :version + 1," +
			"rec_modified_by = :rec_modified_by, rec_modified_at = :rec_modified_at WHERE id = :id AND version = :version")

		result, err := stmt.Exec(numberSequence)
		if err != nil {
			log.Error(err)
			return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		changes, err := result.RowsAffected()
		if err != nil {
			log.Error(err)
			return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		if changes == 0 {
			return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrNumberSequenceNotFound.Error()}}
		}
	}
	numberSequence, _ = GetNumberSequenceByID(*numberSequence.ID)
	return numberSequence, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Updated/Created successfully"}}
}

// GetNumberSequenceByID returns the NumberSequence that the given id corresponds to. If no NumberSequence is found, an
// error is thrown.
func GetNumberSequenceByID(id int64) (NumberSequence, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	numberSequence := NumberSequence{}
	err = db.Get(&numberSequence, "SELECT number_sequence.*,"+
		"user_created.name as rec_created_by_user,"+
		"user_modified.name as rec_modified_by_user,"+
		"organization.name as organization"+
		"	FROM number_sequence "+
		"		INNER JOIN user_profile as user_created ON number_sequence.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON number_sequence.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON number_sequence.organization_id = organization.id "+
		"	WHERE number_sequence.id=$1", id)
	if err != nil && err == sql.ErrNoRows {
		return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrNumberSequenceNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return numberSequence, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

// GetNumberSequenceByCode returns the NumberSequence that the given id corresponds to.
// If no NumberSequence is found, an error is thrown.
func GetNumberSequenceByCode(code string, orgID int64) (NumberSequence, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	org, _ := GetOrganizationByID(orgID)

	numberSequence := NumberSequence{}
	err = db.Get(&numberSequence, "SELECT number_sequence.*,"+
		"user_created.name as rec_created_by_user,"+
		"user_modified.name as rec_modified_by_user,"+
		"organization.name as organization"+
		"	FROM number_sequence "+
		"		INNER JOIN user_profile as user_created ON number_sequence.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON number_sequence.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON number_sequence.organization_id = organization.id "+
		"	WHERE number_sequence.code=$1 and number_sequence.client_id=$2", code, org.ClientID)

	if err != nil && err == sql.ErrNoRows {
		return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrNumberSequenceNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return NumberSequence{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return numberSequence, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

func DeleteNumberSequenceById(orgID int64, ids []string) TransactionalInformation {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	query, args, err := sqlx.In("DELETE FROM number_sequence "+
		" WHERE number_sequence.id IN (?) and number_sequence.organization_id=?", ids, orgID)

	query = sqlx.Rebind(sqlx.DOLLAR, query)

	_, err = db.Exec(query, args...)

	if err != nil && err == sql.ErrNoRows {
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrNumberSequenceNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}
