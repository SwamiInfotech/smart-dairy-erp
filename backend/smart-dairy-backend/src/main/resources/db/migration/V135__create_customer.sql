CREATE TABLE customer
(
    id                      BIGSERIAL PRIMARY KEY,

    uuid                    UUID NOT NULL UNIQUE,

    branch_id               BIGINT NOT NULL,

    customer_code           VARCHAR(30) NOT NULL UNIQUE,

    customer_name           VARCHAR(150) NOT NULL,

    mobile_no               VARCHAR(15) NOT NULL,

    alternate_mobile_no     VARCHAR(15),

    email                   VARCHAR(150),

    address                 VARCHAR(500),

    city                    VARCHAR(100),

    state                   VARCHAR(100),

    pincode                 VARCHAR(10),

    gst_no                  VARCHAR(30),

    credit_limit            NUMERIC(12,2) NOT NULL DEFAULT 0,

    opening_balance         NUMERIC(12,2) NOT NULL DEFAULT 0,

    current_balance         NUMERIC(12,2) NOT NULL DEFAULT 0,

    active                  BOOLEAN NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version                 BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_customer_branch
        FOREIGN KEY (branch_id)
        REFERENCES branch(id)
);

CREATE INDEX idx_customer_code
ON customer(customer_code);

CREATE INDEX idx_customer_name
ON customer(customer_name);

CREATE INDEX idx_customer_mobile
ON customer(mobile_no);

CREATE INDEX idx_customer_branch
ON customer(branch_id);