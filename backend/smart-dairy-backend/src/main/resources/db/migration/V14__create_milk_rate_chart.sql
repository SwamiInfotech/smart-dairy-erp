-- ============================================================================
-- Version      : V14
-- Description  : Create Milk Rate Chart Table
-- Author       : Dipak Thakare
-- ============================================================================

CREATE TABLE milk_rate_chart
(
    id                      BIGSERIAL PRIMARY KEY,
    uuid                    UUID NOT NULL UNIQUE,

    branch_id               BIGINT NOT NULL,

    rate_category_id        BIGINT NOT NULL,

    collection_method_id    BIGINT NOT NULL,

    chart_name              VARCHAR(150) NOT NULL,

    effective_from          DATE NOT NULL,

    effective_to            DATE,

    remarks                 TEXT,

    active                  BOOLEAN NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL,

    version                 BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_mrc_branch
        FOREIGN KEY(branch_id)
        REFERENCES branch(id),

    CONSTRAINT fk_mrc_rate_category
        FOREIGN KEY(rate_category_id)
        REFERENCES rate_category(id),

    CONSTRAINT fk_mrc_collection_method
        FOREIGN KEY(collection_method_id)
        REFERENCES collection_method(id)
);

CREATE INDEX idx_mrc_branch
ON milk_rate_chart(branch_id);

CREATE INDEX idx_mrc_rate_category
ON milk_rate_chart(rate_category_id);

CREATE INDEX idx_mrc_collection_method
ON milk_rate_chart(collection_method_id);

CREATE INDEX idx_mrc_effective_from
ON milk_rate_chart(effective_from);