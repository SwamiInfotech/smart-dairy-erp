-- V155: Make payment_cycle code unique per tenant

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_cycle_code_key') THEN
        ALTER TABLE payment_cycle DROP CONSTRAINT payment_cycle_code_key;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_payment_cycle_code') THEN
        ALTER TABLE payment_cycle DROP CONSTRAINT uk_payment_cycle_code;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_payment_cycle_tenant_code') THEN
        ALTER TABLE payment_cycle
            ADD CONSTRAINT uk_payment_cycle_tenant_code UNIQUE (tenant_uuid, code);
    END IF;
END $$;
