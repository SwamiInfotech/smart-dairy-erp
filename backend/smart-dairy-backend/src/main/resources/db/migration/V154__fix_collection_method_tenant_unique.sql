-- V154: Make collection_method code unique per tenant

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'collection_method_code_key') THEN
        ALTER TABLE collection_method DROP CONSTRAINT collection_method_code_key;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_collection_method_code') THEN
        ALTER TABLE collection_method DROP CONSTRAINT uk_collection_method_code;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_collection_method_tenant_code') THEN
        ALTER TABLE collection_method
            ADD CONSTRAINT uk_collection_method_tenant_code UNIQUE (tenant_uuid, code);
    END IF;
END $$;
