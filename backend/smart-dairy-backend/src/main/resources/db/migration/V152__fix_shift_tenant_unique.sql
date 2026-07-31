-- V152: Make shift code unique per tenant

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shift_code_key') THEN
        ALTER TABLE shift DROP CONSTRAINT shift_code_key;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_shift_code') THEN
        ALTER TABLE shift DROP CONSTRAINT uk_shift_code;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_shift_tenant_code') THEN
        ALTER TABLE shift
            ADD CONSTRAINT uk_shift_tenant_code UNIQUE (tenant_uuid, code);
    END IF;
END $$;
