-- ============================================================================
-- Version      : V18
-- Description  : Create Milk Collection Table
-- Author       : Dipak Thakare
-- ============================================================================

CREATE TABLE milk_collection
(
    id                              BIGSERIAL PRIMARY KEY,

    uuid                            UUID NOT NULL UNIQUE,

    collection_no                   VARCHAR(30) NOT NULL UNIQUE,

    branch_id                       BIGINT NOT NULL,

    farmer_id                       BIGINT NOT NULL,

    farmer_configuration_id         BIGINT NOT NULL,

    milk_rate_chart_id              BIGINT NOT NULL,

    shift_id                        BIGINT NOT NULL,

    milk_type_id                    BIGINT NOT NULL,

    collection_method_id            BIGINT NOT NULL,

    collection_date                 DATE NOT NULL,

    collection_time                 TIME NOT NULL,

    quantity                        NUMERIC(10,2) NOT NULL,

    fat                             NUMERIC(4,2),

    snf                             NUMERIC(4,2),

    mava                            NUMERIC(6,2),

    calculated_rate                 NUMERIC(10,2) NOT NULL,

    gross_amount                    NUMERIC(12,2) NOT NULL,

    entry_type                      VARCHAR(20) NOT NULL DEFAULT 'LIVE',

    entry_source                    VARCHAR(20) NOT NULL DEFAULT 'WEB',

    locked                          BOOLEAN NOT NULL DEFAULT FALSE,

    remarks                         TEXT,

    active                  BOOLEAN NOT NULL DEFAULT TRUE,

    created_at                      TIMESTAMP WITH TIME ZONE NOT NULL,

    updated_at                      TIMESTAMP WITH TIME ZONE NOT NULL,

    version                         BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_mc_branch
        FOREIGN KEY (branch_id)
        REFERENCES branch(id),

    CONSTRAINT fk_mc_farmer
        FOREIGN KEY (farmer_id)
        REFERENCES farmer(id),

    CONSTRAINT fk_mc_farmer_configuration
        FOREIGN KEY (farmer_configuration_id)
        REFERENCES farmer_configuration(id),

    CONSTRAINT fk_mc_rate_chart
        FOREIGN KEY (milk_rate_chart_id)
        REFERENCES milk_rate_chart(id),

    CONSTRAINT fk_mc_shift
        FOREIGN KEY (shift_id)
        REFERENCES shift(id),

    CONSTRAINT fk_mc_milk_type
        FOREIGN KEY (milk_type_id)
        REFERENCES milk_type(id),

    CONSTRAINT fk_mc_collection_method
        FOREIGN KEY (collection_method_id)
        REFERENCES collection_method(id),

    CONSTRAINT chk_mc_entry_type
        CHECK (entry_type IN ('LIVE', 'BACKDATED', 'IMPORT')),

    CONSTRAINT chk_mc_entry_source
        CHECK (entry_source IN ('WEB', 'MOBILE', 'IMPORT', 'API')),

    CONSTRAINT chk_mc_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_mc_fat
        CHECK (fat IS NULL OR fat >= 0),

    CONSTRAINT chk_mc_snf
        CHECK (snf IS NULL OR snf >= 0),

    CONSTRAINT chk_mc_mava
        CHECK (mava IS NULL OR mava >= 0),

    CONSTRAINT chk_mc_rate
        CHECK (calculated_rate >= 0),

    CONSTRAINT chk_mc_gross_amount
        CHECK (gross_amount >= 0)
);

CREATE INDEX idx_mc_collection_no
    ON milk_collection(collection_no);

CREATE INDEX idx_mc_branch
    ON milk_collection(branch_id);

CREATE INDEX idx_mc_farmer
    ON milk_collection(farmer_id);

CREATE INDEX idx_mc_collection_date
    ON milk_collection(collection_date);

CREATE INDEX idx_mc_shift
    ON milk_collection(shift_id);

CREATE INDEX idx_mc_farmer_date
    ON milk_collection(farmer_id, collection_date);

CREATE INDEX idx_mc_rate_chart
    ON milk_collection(milk_rate_chart_id);

CREATE INDEX idx_mc_farmer_configuration
    ON milk_collection(farmer_configuration_id);

CREATE INDEX idx_mc_collection_method
    ON milk_collection(collection_method_id);

CREATE INDEX idx_mc_milk_type
    ON milk_collection(milk_type_id);

CREATE INDEX idx_mc_locked
    ON milk_collection(locked);