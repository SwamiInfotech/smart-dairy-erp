CREATE TABLE IF NOT EXISTS customer_payment
(
    id              BIGSERIAL PRIMARY KEY,

    uuid            UUID NOT NULL UNIQUE,

    customer_id     BIGINT NOT NULL,

    payment_no      VARCHAR(30) NOT NULL UNIQUE,

    payment_date    DATE NOT NULL,

    payment_mode    VARCHAR(30) NOT NULL,

    amount          NUMERIC(12,2) NOT NULL,

    reference_no    VARCHAR(100),

    remarks         VARCHAR(500),

    active          BOOLEAN NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version         BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_customer_payment_customer
        FOREIGN KEY(customer_id)
        REFERENCES customer(id)
);

CREATE INDEX IF NOT EXISTS idx_customer_payment_customer
    ON customer_payment(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_payment_payment_date
    ON customer_payment(payment_date);
