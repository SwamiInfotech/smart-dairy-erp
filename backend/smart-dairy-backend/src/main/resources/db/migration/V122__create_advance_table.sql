CREATE TABLE advance
(
    id                  BIGSERIAL PRIMARY KEY,

    uuid                UUID NOT NULL UNIQUE,

    branch_id           BIGINT NOT NULL,

    farmer_id           BIGINT NOT NULL,

    advance_no          VARCHAR(30) NOT NULL UNIQUE,

    advance_date        DATE NOT NULL,

    advance_amount      NUMERIC(12,2) NOT NULL,

    status              VARCHAR(20) NOT NULL,

    remarks             TEXT,

    active              BOOLEAN NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version             BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_advance_branch
        FOREIGN KEY (branch_id)
        REFERENCES branch(id),

    CONSTRAINT fk_advance_farmer
        FOREIGN KEY (farmer_id)
        REFERENCES farmer(id)
);

CREATE INDEX idx_advance_farmer
ON advance(farmer_id);

CREATE INDEX idx_advance_status
ON advance(status);