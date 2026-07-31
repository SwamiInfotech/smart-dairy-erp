-- V153: Make rate_category code unique per tenant

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rate_category_code_key') THEN
        ALTER TABLE rate_category DROP CONSTRAINT rate_category_code_key;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_rate_category_code') THEN
        ALTER TABLE rate_category DROP CONSTRAINT uk_rate_category_code;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_rate_category_tenant_code') THEN
        ALTER TABLE rate_category
            ADD CONSTRAINT uk_rate_category_tenant_code UNIQUE (tenant_uuid, code);
    END IF;
END $$;
