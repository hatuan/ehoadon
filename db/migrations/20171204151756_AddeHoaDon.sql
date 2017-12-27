
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE TABLE IF NOT EXISTS ehd_customer
(
    id bigint NOT NULL DEFAULT id_generator(),
    code character varying NOT NULL,
    description character varying NOT NULL,
    address character varying NOT NULL,
    address_transition character varying NOT NULL,
    vat_number character varying NOT NULL,
    mobile character varying NOT NULL,
    fax character varying NOT NULL,
    telephone character varying NOT NULL,
    representative_name character varying NOT NULL,
    representative_position  character varying NOT NULL,
    contact_name character varying NOT NULL,
    e_mail character varying NOT NULL,
    bank_account character varying NOT NULL,
    bank_name character varying NOT NULL,
    comment character varying NOT NULL,
    organization_id bigint NOT NULL,
    client_id bigint NOT NULL,
    version bigint NOT NULL,
    status smallint NOT NULL,
    rec_modified_by bigint NOT NULL,
    rec_created_by bigint NOT NULL,
    rec_created_at timestamp with time zone NOT NULL,
    rec_modified_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_ehd_customer PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ehd_customer_no ON ehd_customer USING btree (client_id, code);

CREATE TABLE IF NOT EXISTS ehd_warehouse
(
    id bigint NOT NULL DEFAULT id_generator(),
    code character varying NOT NULL,
    description character varying NOT NULL,
    address character varying NOT NULL,
    organization_id bigint NOT NULL,
    client_id bigint NOT NULL,
    version bigint NOT NULL,
    status smallint NOT NULL,
    rec_modified_by bigint NOT NULL,
    rec_created_by bigint NOT NULL,
    rec_created_at timestamp with time zone NOT NULL,
    rec_modified_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_ehd_warehouse PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ehd_warehouse_code ON ehd_warehouse USING btree (client_id, code);

CREATE TABLE IF NOT EXISTS ehd_item_uom
(
    id bigint NOT NULL DEFAULT id_generator(),
    code character varying NOT NULL,
    description character varying NOT NULL,
    organization_id bigint NOT NULL,
    client_id bigint NOT NULL,
    version bigint NOT NULL,
    status smallint NOT NULL,
    rec_modified_by bigint NOT NULL,
    rec_created_by bigint NOT NULL,
    rec_created_at timestamp with time zone NOT NULL,
    rec_modified_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_ehd_item_uom PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ehd_item_uom_code ON ehd_item_uom USING btree (client_id, code);

CREATE TABLE IF NOT EXISTS ehd_item_group
(
    id bigint NOT NULL DEFAULT id_generator(),
    code character varying NOT NULL,
    description character varying NOT NULL,
    organization_id bigint NOT NULL,
    client_id bigint NOT NULL,
    version bigint NOT NULL,
    status smallint NOT NULL,
    rec_modified_by bigint NOT NULL,
    rec_created_by bigint NOT NULL,
    rec_created_at timestamp with time zone NOT NULL,
    rec_modified_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_ehd_item_group PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ehd_item_group_code ON ehd_item_group USING btree (client_id, code);

CREATE TABLE IF NOT EXISTS ehd_item
(
    id bigint NOT NULL DEFAULT id_generator(),
    code character varying NOT NULL,
    description character varying NOT NULL,
    item_group_id bigint,
    item_uom_id bigint,
    vat smallint NOT NULL, /* -1 : Khong thue, 0 - Thue 0%, 5 - Thue 5%, 10 - Thue 10% */
    discount smallint NOT NULL,
    unit_price numeric(38, 20) NOT NULL,
    quantity numeric(38, 20) NOT NULL,
    organization_id bigint NOT NULL,
    client_id bigint NOT NULL,
    version bigint NOT NULL,
    status smallint NOT NULL,
    rec_modified_by bigint NOT NULL,
    rec_created_by bigint NOT NULL,
    rec_created_at timestamp with time zone NOT NULL,
    rec_modified_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_ehd_item PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ehd_item_code ON ehd_item USING btree (client_id, code);

CREATE TABLE IF NOT EXISTS ehd_tax_authorities
(
    id bigint NOT NULL DEFAULT id_generator(),
    code character varying NOT NULL,
    description character varying NOT NULL,
    province_code character varying NOT NULL,
    managing_code character varying NOT NULL,
    organization_id bigint NOT NULL,
    client_id bigint NOT NULL,
    version bigint NOT NULL,
    status smallint NOT NULL,
    rec_modified_by bigint NOT NULL,
    rec_created_by bigint NOT NULL,
    rec_created_at timestamp with time zone NOT NULL,
    rec_modified_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_ehd_tax_authorities PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ehd_tax_authorities_code ON ehd_tax_authorities USING btree (client_id, code);

/***** Dinh nghia cac mau hoa don *****/
CREATE TABLE IF NOT EXISTS ehd_form_type
(
    id bigint NOT NULL DEFAULT id_generator(),
    invoice_type character varying NOT NULL, /* Loai hoa don : '01GTKT' : Hóa đơn giá trị gia tăng, '02GTTT' : Hóa đơn bán hàng */
    number_form  character varying NOT NULL, /* Mau so 01GTKT0/001 */
    invoice_form character varying NOT NULL, /* Hinh thuc hoa don : '' : Tat Ca, 'E': Hoa don dien tu (TT32) */
    symbol character varying NOT NULL, /* Ky hieu : EY/17E (E : invoice_form) */
    form_file_name character varying NOT NULL,
    form_file character varying NOT NULL,
    client_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    version bigint NOT NULL,
    status smallint NOT NULL,
    rec_modified_by bigint NOT NULL,
    rec_created_by bigint NOT NULL,
    rec_modified_at timestamp with time zone NOT NULL,
    rec_created_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_ehd_form_type PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ehd_form_type_number_form ON ehd_form_type USING btree (client_id, number_form);

/***** Phat hanh hoa don *****/
CREATE TABLE IF NOT EXISTS ehd_form_release
(
    id bigint NOT NULL DEFAULT id_generator(),
    form_type_id bigint NOT NULL,
    release_total int NOT NULL,
    release_from int NOT NULL, /* tu dong tinh tu total va cac form_type da nhap tu truoc */
    release_to int NOT NULL, /* tu dong tinh tu total va cac form_type da nhap tu truoc */
    release_used int NOT NULL, /* tu dong cap nhat khi in hoa don  */
    release_date date NOT NULL,
    start_date date NOT NULL, /* ngay bat dau su dung phai cach ngay thong bao phat hanh 2 ngay */
    tax_authorities_status smallint NOT NULL, /* 0 : Cho phat hanh, 1 : Da phat hanh */
    client_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    version bigint NOT NULL,
    status smallint NOT NULL,
    rec_modified_by bigint NOT NULL,
    rec_created_by bigint NOT NULL,
    rec_modified_at timestamp with time zone NOT NULL,
    rec_created_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_ehd_form_release PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS ehd_invoice
(
    id bigint NOT NULL DEFAULT id_generator(),
    form_release_id bigint NOT NULL,
    original_invoice_id bigint,
    invoice_date date,
    invoice_no character varying NOT NULL,
    pay_type character varying NOT NULL, 
    currency_id bigint,
    exchange_rate_amount numeric(38, 20) NOT NULL DEFAULT 1,
    relational_exch_rate_amount numeric(38, 20) NOT NULL DEFAULT 1,
    customer_id bigint,
    customer_vat_number character varying NOT NULL,
    customer_name character varying NOT NULL,
    customer_address character varying NOT NULL,
    customer_contact_name character varying NOT NULL,
    customer_contact_mobile character varying NOT NULL,
    customer_contact_email character varying NOT NULL,
    customer_bank_account character varying NOT NULL,
    customer_bank_name character varying NOT NULL,
    process_invoice_status smallint NOT NULL DEFAULT 0, /* 0 : Hoa don goc, 1 : Hoa don bi dieu chinh, 2 : Hoa don dieu chinh  */
    process_adjusted_form smallint NOT NULL DEFAULT 0, /* Hinh thuc dieu chinh 0: khong dieu chinh, 1: Dieu chinh tang, 2: Dieu chinh giam, 3: Dieu chinh khong thay doi tien, 4: Dieu chinh khac */
    process_adjusted_type smallint NOT NULL DEFAULT 0, /* Loai dieu chinh 0: khong dieu chinh; Neu process_adjusted_form = 1,2 => 1: Hang hoa dich vu; process_adjusted_form = 3 => 2: Ma so thue, 3: Tien chu, 4: Ten khach, Dia chi; Neu process_adjusted_form = 4 => 5: Khac*/
    total_amount numeric(38, 20) NOT NULL,
    total_amount_no_vat numeric(38, 20) NOT NULL,
    total_amount_vat0 numeric(38, 20) NOT NULL,
    total_amount_vat5 numeric(38, 20) NOT NULL,
    total_amount_vat10 numeric(38, 20) NOT NULL,
    total_discount numeric(38, 20) NOT NULL,
    total_vat5 numeric(38, 20) NOT NULL,
    total_vat10 numeric(38, 20) NOT NULL,
    total_vat numeric(38, 20) NOT NULL,
    total_other numeric(38, 20) NOT NULL,
    total_payment numeric(38, 20) NOT NULL,
    total_payment_words character varying NOT NULL,
    client_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    version bigint NOT NULL,
    status smallint NOT NULL,
    rec_modified_by bigint NOT NULL,
    rec_created_by bigint NOT NULL,
    rec_modified_at timestamp with time zone NOT NULL,
    rec_created_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_ehd_invoice PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_ehd_invoice_no ON ehd_invoice USING btree (invoice_no, client_id);
CREATE INDEX IF NOT EXISTS idx_ehd_invoice_form_release_id ON ehd_invoice USING btree (form_release_id, client_id);

CREATE TABLE IF NOT EXISTS ehd_invoice_line
(
    id bigint NOT NULL DEFAULT id_generator(),
    invoice_id bigint NOT NULL,
    item_id bigint,
    uom_id bigint,
    description character varying NOT NULL,
    quantity numeric(38, 20) NOT NULL,
    unit_price numeric(38, 20) NOT NULL,
    amount numeric(38, 20) NOT NULL,
    vat smallint NOT NULL, /* -1 : Khong thue, 0 - Thue 0%, 5 - Thue 5%, 10 - Thue 10% */
    amount_vat numeric(38, 20) NOT NULL,
    discount smallint NOT NULL,
    amount_discount numeric(38, 20) NOT NULL,
    amount_payment numeric(38, 20) NOT NULL,
    client_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    line_no bigint NOT NULL,
    version bigint NOT NULL,
    status smallint NOT NULL,
    rec_modified_by bigint NOT NULL,
    rec_created_by bigint NOT NULL,
    rec_modified_at timestamp with time zone NOT NULL,
    rec_created_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_ehd_invoice_line PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_ehd_invoice_line_invoice_id ON ehd_invoice_line USING btree (invoice_id);

CREATE TABLE IF NOT EXISTS ehd_process_log
(
    id bigint NOT NULL DEFAULT id_generator(),
    invoice_id bigint NOT NULL,
    modified_by bigint NOT NULL,
    modified_at timestamp with time zone NOT NULL,
    description character varying NOT NULL,
    modified_user character varying NOT NULL,
    CONSTRAINT pk_ehd_process_log PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_ehd_process_log_invoice_id ON ehd_process_log USING btree (invoice_id);
CREATE INDEX IF NOT EXISTS idx_ehd_process_log_modified_at ON ehd_process_log USING btree (modified_at);
CREATE INDEX IF NOT EXISTS idx_ehd_process_log_modified_user ON ehd_process_log USING btree (modified_user);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE ehd_customer;
DROP TABLE ehd_warehouse;
DROP TABLE ehd_item_uom;
DROP TABLE ehd_item_group;
DROP TABLE ehd_item;
DROP TABLE ehd_form_type;
DROP TABLE ehd_form_release;
DROP TABLE ehd_invoice;
DROP TABLE ehd_invoice_line;
DROP TABLE ehd_tax_authorities;
DROP TABLE ehd_process_log;