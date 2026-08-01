-- V156: Add milk_rate_chart_id to farmer and farmer_configuration

ALTER TABLE farmer
    ADD COLUMN IF NOT EXISTS milk_rate_chart_id BIGINT;

ALTER TABLE farmer_configuration
    ADD COLUMN IF NOT EXISTS milk_rate_chart_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_farmer_milk_rate_chart') THEN
        ALTER TABLE farmer
            ADD CONSTRAINT fk_farmer_milk_rate_chart
                FOREIGN KEY (milk_rate_chart_id)
                    REFERENCES milk_rate_chart(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_fc_milk_rate_chart') THEN
        ALTER TABLE farmer_configuration
            ADD CONSTRAINT fk_fc_milk_rate_chart
                FOREIGN KEY (milk_rate_chart_id)
                    REFERENCES milk_rate_chart(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_farmer_milk_rate_chart
    ON farmer(milk_rate_chart_id);

CREATE INDEX IF NOT EXISTS idx_fc_milk_rate_chart
    ON farmer_configuration(milk_rate_chart_id);
