CREATE TABLE settlement
(
    id                      BIGSERIAL PRIMARY KEY,

    uuid                    UUID NOT NULL UNIQUE,

    branch_id               BIGINT NOT NULL,

    farmer_id               BIGINT NOT NULL,

    settlement_no           VARCHAR(30) NOT NULL UNIQUE,

    from_date               DATE NOT NULL,

    to_date                 DATE NOT NULL,

    milk_amount             NUMERIC(12,2) NOT NULL DEFAULT 0,

    bonus_amount            NUMERIC(12,2) NOT NULL DEFAULT 0,

    loan_recovery           NUMERIC(12,2) NOT NULL DEFAULT 0,

    advance_recovery        NUMERIC(12,2) NOT NULL DEFAULT 0,

    other_deduction         NUMERIC(12,2) NOT NULL DEFAULT 0,

    net_payable             NUMERIC(12,2) NOT NULL DEFAULT 0,

    status                  VARCHAR(20) NOT NULL,

    remarks                 TEXT,

    active                  BOOLEAN NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version                 BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_settlement_branch
        FOREIGN KEY (branch_id)
        REFERENCES branch(id),

    CONSTRAINT fk_settlement_farmer
        FOREIGN KEY (farmer_id)
        REFERENCES farmer(id)
);

CREATE INDEX idx_settlement_farmer
ON settlement(farmer_id);

CREATE INDEX idx_settlement_period
ON settlement(from_date,to_date);