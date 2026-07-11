CREATE TABLE milk_rate_chart_detail
(
    id                      BIGSERIAL PRIMARY KEY,

    uuid                    UUID NOT NULL UNIQUE,

    milk_rate_chart_id      BIGINT NOT NULL,

    fat_from                NUMERIC(4,2),

    fat_to                  NUMERIC(4,2),

    snf_from                NUMERIC(4,2),

    snf_to                  NUMERIC(4,2),

    mava_from               NUMERIC(6,2),

    mava_to                 NUMERIC(6,2),

    rate                    NUMERIC(10,2) NOT NULL,

    active                  BOOLEAN NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL,

    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL,

    version                 BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_mrc_detail
        FOREIGN KEY (milk_rate_chart_id)
        REFERENCES milk_rate_chart(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_fat_range
        CHECK (
            fat_from IS NULL
            OR fat_to IS NULL
            OR fat_from <= fat_to
        ),

    CONSTRAINT chk_snf_range
        CHECK (
            snf_from IS NULL
            OR snf_to IS NULL
            OR snf_from <= snf_to
        ),

    CONSTRAINT chk_mava_range
        CHECK (
            mava_from IS NULL
            OR mava_to IS NULL
            OR mava_from <= mava_to
        )
);

CREATE INDEX idx_mrc_detail_chart
ON milk_rate_chart_detail(milk_rate_chart_id);