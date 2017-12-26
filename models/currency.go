package models

type Currency struct {
	ID                *int64     `db:"id" json:",string"`
	Code              string     `db:"code"`
	Description       string     `db:"description"`
	RecCreatedByID    int64      `db:"rec_created_by_id" json:",string"`
	RecCreatedByUser  string     `db:"rec_created_by_user"`
	RecCreated        *Timestamp `db:"rec_created"`
	RecModifiedByID   int64      `db:"rec_modified_by_id" json:",string"`
	RecModifiedByUser string     `db:"rec_modified_by_user"`
	RecModified       *Timestamp `db:"rec_modified"`
	Status            int8       `db:"status"`
	Version           int16      `db:"version"`
	ClientID          int64      `db:"client_id" json:",string"`
	OrganizationID    int64      `db:"organization_id" json:",string"`
	Organization      string     `db:"organization"`
}
