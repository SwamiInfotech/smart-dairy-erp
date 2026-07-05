-- ============================================================================
-- Version      : V15
-- Description  : Create Milk Rate Chart Detail Table
-- Author       : Dipak Thakare
-- ============================================================================

CREATE TABLE milk_rate_chart_detail
(
    id                      BIGSERIAL PRIMARY KEY,

    uuid                    UUID NOT NULL UNIQUE,

    milk_rate_chart_id      BIGINT NOT NULL,

    fat                     NUMERIC(4,2),

    snf                     NUMERIC(4,2),

    mava                    NUMERIC(6,2),

    rate                    NUMERIC(10,2) NOT NULL,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL,

    version                 BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_mrc_detail
        FOREIGN KEY (milk_rate_chart_id)
        REFERENCES milk_rate_chart(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_mrc_detail_chart
ON milk_rate_chart_detail(milk_rate_chart_id);