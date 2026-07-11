CREATE TABLE customer_ledger
(
    id                  BIGSERIAL PRIMARY KEY,

    uuid                UUID NOT NULL UNIQUE,

    customer_id         BIGINT NOT NULL,

    transaction_date    DATE NOT NULL,

    reference_type      VARCHAR(30) NOT NULL,

    reference_uuid      UUID NOT NULL,

    reference_number    VARCHAR(50) NOT NULL,

    debit_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,

    credit_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,

    balance             NUMERIC(12,2) NOT NULL DEFAULT 0,

    remarks             VARCHAR(500),

    active              BOOLEAN NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version             BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_customer_ledger_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(id)
);

CREATE INDEX idx_customer_ledger_customer
ON customer_ledger(customer_id);

CREATE INDEX idx_customer_ledger_reference
ON customer_ledger(reference_uuid);

CREATE INDEX idx_customer_ledger_date
ON customer_ledger(transaction_date);