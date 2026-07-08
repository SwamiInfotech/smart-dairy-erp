CREATE TABLE payment
(
    id                  BIGSERIAL PRIMARY KEY,

    uuid                UUID NOT NULL UNIQUE,

    branch_id           BIGINT NOT NULL,

    farmer_id           BIGINT NOT NULL,

    settlement_id       BIGINT NOT NULL UNIQUE,

    payment_no          VARCHAR(30) NOT NULL UNIQUE,

    payment_date        DATE NOT NULL,

    paid_amount         NUMERIC(12,2) NOT NULL,

    payment_mode        VARCHAR(20) NOT NULL,

    remarks             TEXT,

    active              BOOLEAN NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version             BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_payment_branch
        FOREIGN KEY(branch_id)
        REFERENCES branch(id),

    CONSTRAINT fk_payment_farmer
        FOREIGN KEY(farmer_id)
        REFERENCES farmer(id),

    CONSTRAINT fk_payment_settlement
        FOREIGN KEY(settlement_id)
        REFERENCES settlement(id)
);

CREATE INDEX idx_payment_farmer
ON payment(farmer_id);

CREATE INDEX idx_payment_date
ON payment(payment_date);