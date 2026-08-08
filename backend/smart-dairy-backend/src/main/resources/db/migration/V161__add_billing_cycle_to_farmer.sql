-- ============================================================================
-- Version      : V161
-- Description  : Add billing_cycle column to farmer table
-- ============================================================================

ALTER TABLE farmer
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_farmer_billing_cycle
    ON farmer (billing_cycle);
