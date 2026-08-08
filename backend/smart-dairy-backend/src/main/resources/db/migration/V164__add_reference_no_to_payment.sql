ALTER TABLE payment
    ADD COLUMN IF NOT EXISTS reference_no VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_payment_reference_no
    ON payment(reference_no);
