
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE TABLE IF NOT EXISTS report
(
    report_id character varying NOT NULL,
    report_no character varying NOT NULL,
    report_text character varying NOT NULL,
    report_text2  character varying NOT NULL,
    report_title  character varying NOT NULL,
    report_title2  character varying NOT NULL,
    report_file character varying NOT NULL, 
    report_blob character varying NOT NULL, 
    status smallint NOT NULL,
    CONSTRAINT pk_report PRIMARY KEY (report_id, report_no)
);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE IF EXISTS report;
