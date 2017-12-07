package models

type UserInRole struct {
	RoleID int64 `db:"role_id" json:",string"`
	Role   Role  `db:"-"`
	UserID int64 `db:"user_id" json:",string"`
	User   User  `db:"-"`
}
