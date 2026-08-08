-- ============================================================================
-- Version      : V162
-- Description  : Align smart_dairy_configuration schema defaults with frontend
--                (SNF support, backdated-days non-negative, multi-collection default)
-- ============================================================================

ALTER TABLE smart_dairy_configuration
    ADD COLUMN IF NOT EXISTS collection_snf BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE smart_dairy_configuration
    ALTER COLUMN allow_multiple_collection SET DEFAULT TRUE;

UPDATE smart_dairy_configuration
SET max_backdated_days = 0
WHERE max_backdated_days < 0;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_sdc_max_backdated_days_non_negative'
    ) THEN
        ALTER TABLE smart_dairy_configuration
            ADD CONSTRAINT chk_sdc_max_backdated_days_non_negative
                CHECK (max_backdated_days >= 0);
    END IF;
END
$$;
