CREATE TABLE sales_invoice
(
    id                  BIGSERIAL PRIMARY KEY,

    uuid                UUID NOT NULL UNIQUE,

    branch_id           BIGINT NOT NULL,

    invoice_no          VARCHAR(30) NOT NULL UNIQUE,

    invoice_date        DATE NOT NULL,

    customer_name       VARCHAR(150) NOT NULL,

    customer_mobile     VARCHAR(15),

    payment_mode        VARCHAR(30) NOT NULL,

    total_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,

    discount_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,

    net_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,

    status              VARCHAR(30) NOT NULL,

    remarks             VARCHAR(500),

    active              BOOLEAN NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version             BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_sales_invoice_branch
        FOREIGN KEY (branch_id)
        REFERENCES branch(id)
);

CREATE INDEX idx_sales_invoice_invoice_no
    ON sales_invoice(invoice_no);

CREATE INDEX idx_sales_invoice_date
    ON sales_invoice(invoice_date);

CREATE INDEX idx_sales_invoice_branch
    ON sales_invoice(branch_id);

CREATE INDEX idx_sales_invoice_status
    ON sales_invoice(status);