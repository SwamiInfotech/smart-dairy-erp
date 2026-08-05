ALTER TABLE milk_collection
    ADD COLUMN IF NOT EXISTS entry_mode VARCHAR(20);

UPDATE milk_collection
SET entry_mode = COALESCE(entry_mode, 'SINGLE');

ALTER TABLE milk_collection
    ALTER COLUMN entry_mode SET NOT NULL;

ALTER TABLE milk_collection
    ALTER COLUMN entry_mode SET DEFAULT 'SINGLE';

ALTER TABLE milk_collection
    DROP CONSTRAINT IF EXISTS chk_mc_entry_mode;

ALTER TABLE milk_collection
    ADD CONSTRAINT chk_mc_entry_mode
        CHECK (entry_mode IN ('SINGLE', 'MULTI'));