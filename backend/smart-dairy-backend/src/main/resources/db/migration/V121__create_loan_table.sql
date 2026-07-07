CREATE TABLE loan
(
    id                      BIGSERIAL PRIMARY KEY,

    uuid                    UUID NOT NULL UNIQUE,

    branch_id               BIGINT NOT NULL,

    farmer_id               BIGINT NOT NULL,

    loan_no                 VARCHAR(30) NOT NULL UNIQUE,

    loan_type               VARCHAR(30) NOT NULL,

    status                  VARCHAR(30) NOT NULL,

    loan_date               DATE NOT NULL,

    sanctioned_amount       NUMERIC(12,2) NOT NULL,

    interest_rate           NUMERIC(5,2),

    tenure_months           INTEGER,

    installment_amount      NUMERIC(12,2),

    remarks                 TEXT,

    active                  BOOLEAN NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version                 BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_loan_branch
        FOREIGN KEY (branch_id)
        REFERENCES branch(id),

    CONSTRAINT fk_loan_farmer
        FOREIGN KEY (farmer_id)
        REFERENCES farmer(id)
);

CREATE INDEX idx_loan_farmer
ON loan(farmer_id);

CREATE INDEX idx_loan_branch
ON loan(branch_id);

CREATE INDEX idx_loan_status
ON loan(status);