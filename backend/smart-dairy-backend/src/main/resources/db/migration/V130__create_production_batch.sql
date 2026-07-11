CREATE TABLE production_batch
(
    id                  BIGSERIAL PRIMARY KEY,

    uuid                UUID NOT NULL UNIQUE,

    branch_id           BIGINT NOT NULL,

    batch_no            VARCHAR(30) NOT NULL UNIQUE,

    production_date     DATE NOT NULL,

    status              VARCHAR(20) NOT NULL,

    remarks             TEXT,

    active              BOOLEAN NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version             BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_production_batch_branch
        FOREIGN KEY (branch_id)
        REFERENCES branch(id)
);

CREATE INDEX idx_production_batch_date
ON production_batch(production_date);

CREATE INDEX idx_production_batch_status
ON production_batch(status);