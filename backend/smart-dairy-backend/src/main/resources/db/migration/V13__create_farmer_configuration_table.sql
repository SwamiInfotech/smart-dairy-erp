-- ============================================================================
-- Version      : V13
-- Description  : Create Farmer Configuration Table
-- ============================================================================

CREATE TABLE farmer_configuration
(
    id                          BIGSERIAL PRIMARY KEY,
    uuid                        UUID NOT NULL UNIQUE,

    farmer_id                   BIGINT NOT NULL,

    milk_type_id                BIGINT NOT NULL,
    collection_method_id        BIGINT NOT NULL,
    payment_cycle_id            BIGINT NOT NULL,
    rate_category_id             BIGINT NOT NULL,

    effective_from              DATE NOT NULL,
    effective_to                DATE,

    active                      BOOLEAN NOT NULL DEFAULT TRUE,

    created_at                  TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at                  TIMESTAMP WITH TIME ZONE NOT NULL,

    version                     BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_fc_farmer
        FOREIGN KEY (farmer_id)
        REFERENCES farmer(id),

    CONSTRAINT fk_fc_milk_type
        FOREIGN KEY (milk_type_id)
        REFERENCES milk_type(id),

    CONSTRAINT fk_fc_collection_method
        FOREIGN KEY (collection_method_id)
        REFERENCES collection_method(id),

    CONSTRAINT fk_fc_payment_cycle
        FOREIGN KEY (payment_cycle_id)
        REFERENCES payment_cycle(id),

    CONSTRAINT fk_fc_rate_category
        FOREIGN KEY (rate_category_id)
        REFERENCES rate_category(id)
);

CREATE INDEX idx_fc_farmer
ON farmer_configuration(farmer_id);

CREATE INDEX idx_fc_effective_from
ON farmer_configuration(effective_from);

CREATE INDEX idx_fc_active
ON farmer_configuration(active);