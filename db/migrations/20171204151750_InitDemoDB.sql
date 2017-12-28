
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
INSERT INTO "user_profile"("password_question", "password_answer", "password", "salt", "organization_id", "name", "last_modified_date", "last_login_ip", "last_login_date", "last_locked_out_reason", "last_locked_out_date", "is_locked_out", "is_activated", "id", "full_name", "email", "created_date", "comment", "client_id", "culture_ui_id") VALUES ('', '', 'aOyDnGG22ebqGmMvY7zQwdT+UKF6hUUmAt2Uc0jj2io=', '47687', 1426586362538099723, 'DEMO', '2014-04-25 10:22:39.007887+07', '0.0.0.0', '2014-04-25 10:22:39.007887+07', '', '2000-01-01 10:22:38.855785+07', 'f', 't', 1426580016128328709, 'Demo User', 'demo@myerp.com', '2014-04-25 10:22:39.007887+07', 'pass : 123456', 1426583637398127622, 'vi-VN');
INSERT INTO "user_profile"("password_question", "password_answer", "password", "salt", "organization_id", "name", "last_modified_date", "last_login_ip", "last_login_date", "last_locked_out_reason", "last_locked_out_date", "is_locked_out", "is_activated", "id", "full_name", "email", "created_date", "comment", "client_id", "culture_ui_id") VALUES ('', '', 'xn9cgSDNlwFuCSYDSoi8EcWcPs+p3PcvK8rd0M+lMQY=', '53563', 1426585254931465224, 'ADMIN', '2014-04-25 10:22:38.855785+07', '0.0.0.0', '2014-04-25 10:22:38.855785+07', '', '2000-01-01 10:22:38.855785+07', 'f', 't', 1426578744876729347, 'Administrator', 'admin@myerp.com', '2014-04-25 10:22:38.853784+07', 'pass : 123456', 1426583637398127622, 'vi-VN');

INSERT INTO "client"("version", 
    "rec_created_by", 
    "description", 
    "is_activated", 
    "id", 
    "culture_id", 
    "amount_decimal_places", 
    "amount_rounding_precision", 
    "unit-amount_decimal_places", 
    "unit-amount_rounding_precision", 
    "currency_lcy_id",
    "vat_number",
    "group_unit_code",
    "vat_method_code",
    "province_code",
    "districts_code",
    "address",
    "address_transition",
    "telephone",
    "email",
    "fax",
    "website",
    "representative_name",
    "representative_position",
    "contact_name",
    "mobile",
    "bank_account",
    "bank_name",
    "tax_authorities_id", 
    "rec_modified_by", "rec_created_at", "rec_modified_at") 
VALUES (29, 
    1426578744876729347, 
    'Demo Company', 
    't', 
    1426583637398127622, 
    'vi-VN', 
    3, 
    0.001, 
    3, 
    0.001, 
    1426587193538774028, 
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    0,
    1426578744876729347, 
    '2016-05-29 21:27:45.774848+07', 
    '2016-05-29 21:27:45.774848+07');

INSERT INTO "organization"("version", "status", "rec_modified_by", "rec_created_by", "description", "id", "code", "client_id", "rec_created_at", "rec_modified_at") VALUES (1, 1, 1426578744876729347, 1426578744876729347, 'All Organization', 1426585254931465224, '*', 1426583637398127622, '2016-05-29 21:27:45.815398+07', '2016-05-29 21:27:45.815398+07');
INSERT INTO "organization"("version", "status", "rec_modified_by", "rec_created_by", "description", "id", "code", "client_id", "rec_created_at", "rec_modified_at") VALUES (1, 1, 1426578744876729347, 1426578744876729347, 'HQ Organization', 1426585783514432521, 'HQ', 1426583637398127622, '2016-05-29 21:27:46.439969+07', '2016-05-29 21:27:46.439969+07');
INSERT INTO "organization"("version", "status", "rec_modified_by", "rec_created_by", "description", "id", "code", "client_id", "rec_created_at", "rec_modified_at") VALUES (1, 1, 1426578744876729347, 1426578744876729347, 'Hồ Chí Minh', 1426586106576503818, 'HCM', 1426583637398127622, '2016-05-29 21:27:45.815398+07', '2016-05-29 21:27:45.815398+07');
INSERT INTO "organization"("version", "status", "rec_modified_by", "rec_created_by", "description", "id", "code", "client_id", "rec_created_at", "rec_modified_at") VALUES (1, 1, 1426578744876729347, 1426578744876729347, 'Hà Nội', 1426586362538099723, 'HNO', 1426583637398127622, '2016-05-29 21:27:45.815398+07', '2016-05-29 21:27:45.815398+07');

INSERT INTO "currency"("version", "status", "rec_modified_by", "rec_created_by", "organization_id", "description", "id", "code", "client_id", "rec_created_at", "rec_modified_at") VALUES (1, 1, 1426578744876729347, 1426578744876729347, 1426585254931465224, 'Đồng Việt Nam', 1426587193538774028, 'VND', 1426583637398127622, '2016-05-29 21:27:45.815398+07', '2016-05-29 21:27:45.815398+07');
INSERT INTO "currency"("version", "status", "rec_modified_by", "rec_created_by", "organization_id", "description", "id", "code", "client_id", "rec_created_at", "rec_modified_at") VALUES (1, 1, 1426578744876729347, 1426578744876729347, 1426585254931465224, 'Đồng Yên', 1426587855290893325, 'JPY', 1426583637398127622, '2016-05-29 21:27:45.815398+07', '2016-05-29 21:27:45.815398+07');
INSERT INTO "currency"("version", "status", "rec_modified_by", "rec_created_by", "organization_id", "description", "id", "code", "client_id", "rec_created_at", "rec_modified_at") VALUES (1, 1, 1426578744876729347, 1426578744876729347, 1426585254931465224, 'Đồng Đôla Mỹ', 1426588150997713934, 'USD', 1426583637398127622, '2016-05-29 21:27:45.815398+07', '2016-05-29 21:27:45.815398+07');
INSERT INTO "currency"("version", "status", "rec_modified_by", "rec_created_by", "organization_id", "description", "id", "code", "client_id", "rec_created_at", "rec_modified_at") VALUES (1, 1, 1426578744876729347, 1426578744876729347, 1426585254931465224, 'Đồng Bảng Anh', 1426588586391634959, 'GBP', 1426583637398127622, '2016-05-29 21:27:45.815398+07', '2016-05-29 21:27:45.815398+07');
INSERT INTO "currency"("version", "status", "rec_modified_by", "rec_created_by", "organization_id", "description", "id", "code", "client_id", "rec_created_at", "rec_modified_at") VALUES (1, 1, 1426578744876729347, 1426578744876729347, 1426585254931465224, 'Đồng Nhân dân tệ', 1426588887928538128, 'CYN', 1426583637398127622, '2016-05-29 21:27:45.815398+07', '2016-05-29 21:27:45.815398+07');
INSERT INTO "currency"("version", "status", "rec_modified_by", "rec_created_by", "organization_id", "description", "id", "code", "client_id", "rec_created_at", "rec_modified_at") VALUES (1, 1, 1426578744876729347, 1426578744876729347, 1426585254931465224, 'Đồng EURO', 1426589178795131921, 'EUR', 1426583637398127622, '2016-05-29 21:27:45.815398+07', '2016-05-29 21:27:45.815398+07');

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DELETE FROM "organization";
DELETE FROM "client";
DELETE FROM "user_profile";
DELETE FROM "currency";