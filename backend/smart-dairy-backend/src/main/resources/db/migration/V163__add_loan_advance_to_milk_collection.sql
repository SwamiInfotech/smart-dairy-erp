-- ============================================================================
-- Version      : V163
-- Description  : Add loan and advance fields to milk_collection
-- ============================================================================

ALTER TABLE milk_collection
    ADD COLUMN IF NOT EXISTS loan NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS advance NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE milk_collection
    DROP CONSTRAINT IF EXISTS chk_mc_loan,
    DROP CONSTRAINT IF EXISTS chk_mc_advance;

ALTER TABLE milk_collection
    ADD CONSTRAINT chk_mc_loan CHECK (loan >= 0),
    ADD CONSTRAINT chk_mc_advance CHECK (advance >= 0);