-- V151: Make milk_type code unique per tenant

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'milk_type_code_key') THEN
        ALTER TABLE milk_type DROP CONSTRAINT milk_type_code_key;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_milk_type_code') THEN
        ALTER TABLE milk_type DROP CONSTRAINT uk_milk_type_code;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_milk_type_tenant_code') THEN
        ALTER TABLE milk_type
            ADD CONSTRAINT uk_milk_type_tenant_code UNIQUE (tenant_uuid, code);
    END IF;
END $$;
