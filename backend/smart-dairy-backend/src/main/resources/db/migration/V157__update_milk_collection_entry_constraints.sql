-- V157: Align milk_collection entry_type and entry_source constraints with new enums

ALTER TABLE milk_collection
    ALTER COLUMN entry_type SET DEFAULT 'REGULAR';

ALTER TABLE milk_collection
    ALTER COLUMN entry_source SET DEFAULT 'WEB';

ALTER TABLE milk_collection
    DROP CONSTRAINT IF EXISTS chk_mc_entry_type;

ALTER TABLE milk_collection
    ADD CONSTRAINT chk_mc_entry_type
        CHECK (entry_type IN ('REGULAR', 'BACKDATED', 'CORRECTION', 'ADJUSTMENT', 'IMPORT'));

ALTER TABLE milk_collection
    DROP CONSTRAINT IF EXISTS chk_mc_entry_source;

ALTER TABLE milk_collection
    ADD CONSTRAINT chk_mc_entry_source
        CHECK (entry_source IN ('WEB', 'MOBILE', 'API', 'EXCEL_IMPORT', 'DEVICE', 'SYSTEM'));
