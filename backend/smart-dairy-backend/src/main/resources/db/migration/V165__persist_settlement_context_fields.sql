ALTER TABLE settlement
    ADD COLUMN IF NOT EXISTS outstanding_loan_before NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS outstanding_advance_before NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS calculated_loan_recovery NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS calculated_advance_recovery NUMERIC(12,2) NOT NULL DEFAULT 0;

UPDATE settlement
SET
    outstanding_loan_before = COALESCE(outstanding_loan_before, 0),
    outstanding_advance_before = COALESCE(outstanding_advance_before, 0),
    calculated_loan_recovery = COALESCE(calculated_loan_recovery, loan_recovery, 0),
    calculated_advance_recovery = COALESCE(calculated_advance_recovery, advance_recovery, 0)
WHERE
    outstanding_loan_before IS NULL
    OR outstanding_advance_before IS NULL
    OR calculated_loan_recovery IS NULL
    OR calculated_advance_recovery IS NULL;
