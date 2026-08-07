-- ============================================================================
-- Version      : V159
-- Description  : Create Smart Dairy Configuration Table
-- ============================================================================

CREATE TABLE smart_dairy_configuration
(
    id                              BIGSERIAL PRIMARY KEY,
    uuid                            UUID NOT NULL UNIQUE,
    tenant_uuid                     UUID NOT NULL,
    tenant_id                       BIGINT NOT NULL,

    -- Milk Collection Settings
    collection_fat                  BOOLEAN NOT NULL DEFAULT TRUE,
    collection_mava                 BOOLEAN NOT NULL DEFAULT TRUE,
    morning_collection_limit        INTEGER NOT NULL DEFAULT 1,
    evening_collection_limit        INTEGER NOT NULL DEFAULT 1,
    allow_multiple_collection       BOOLEAN NOT NULL DEFAULT FALSE,

    -- Farmer Finance Settings
    allow_loan                       BOOLEAN NOT NULL DEFAULT TRUE,
    allow_advance                    BOOLEAN NOT NULL DEFAULT TRUE,
    allow_loan_and_advance_together  BOOLEAN NOT NULL DEFAULT FALSE,

    -- Payment Settings
    daily_payment                    BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_payment                   BOOLEAN NOT NULL DEFAULT TRUE,
    monthly_payment                  BOOLEAN NOT NULL DEFAULT TRUE,

    -- Backdated Collection Settings
    allow_backdated_entry            BOOLEAN NOT NULL DEFAULT TRUE,
    max_backdated_days               INTEGER NOT NULL DEFAULT 7,

    -- Collection Lock Settings
    auto_lock                        BOOLEAN NOT NULL DEFAULT FALSE,

    created_at                       TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at                       TIMESTAMP WITH TIME ZONE NOT NULL,
    version                          BIGINT NOT NULL DEFAULT 0,
    active                           BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_sdc_tenant_uuid
        FOREIGN KEY (tenant_uuid)
        REFERENCES tenant(uuid)
);

CREATE INDEX idx_sdc_tenant_uuid
ON smart_dairy_configuration(tenant_uuid);

CREATE INDEX idx_sdc_active
ON smart_dairy_configuration(active);

CREATE UNIQUE INDEX idx_sdc_tenant_unique
ON smart_dairy_configuration(tenant_uuid)
WHERE active = TRUE;
