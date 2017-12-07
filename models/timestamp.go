package models

import (
	"fmt"
	"strconv"
	"time"
	"database/sql/driver"
)

//https://gist.github.com/bsphere/8369aca6dde3e7b4392c
type Timestamp struct {
	time.Time
}

func (t *Timestamp) MarshalJSON() ([]byte, error) {
	ts := t.Time.Unix()
	stamp := fmt.Sprint(ts)

	return []byte(stamp), nil
}

func (t *Timestamp) UnmarshalJSON(b []byte) error {
	ts, err := strconv.Atoi(string(b))
	if err != nil {
		return err
	}

	t.Time = time.Unix(int64(ts), 0)

	return nil
}

func (t *Timestamp) String() string {
	return t.Time.String()
}

// Scan implements the Scanner interface.
func (t *Timestamp) Scan(value interface{}) error {
    t.Time = value.(time.Time)
    return nil
}

// Value implements the driver Valuer interface.
func (t Timestamp) Value() (driver.Value, error) {
    return t.Time, nil
}
