package models

import (
	"database/sql/driver"
	"strconv"
)

// IdType is type of column_id in table
type IdType struct {
	int64
}

func (t *IdType) MarshalJSON() ([]byte, error) {
	_value := strconv.FormatInt(t.int64, 10)

	return []byte(_value), nil
}

func (t *IdType) UnmarshalJSON(b []byte) error {
	_value, err := strconv.ParseInt(string(b), 64, 10)
	if err != nil {
		return err
	}

	t.int64 = _value

	return nil
}

func (t *IdType) String() string {
	return strconv.FormatInt(t.int64, 10)
}

// Scan implements the Scanner interface.
func (t *IdType) Scan(value interface{}) error {
	t.int64 = value.(int64)
	return nil
}

// Value implements the driver Valuer interface.
func (t IdType) Value() (driver.Value, error) {
	return t.int64, nil
}
