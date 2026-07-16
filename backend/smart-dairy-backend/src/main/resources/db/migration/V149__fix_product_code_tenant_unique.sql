-- Drop global unique constraint and index on product_code
ALTER TABLE product DROP CONSTRAINT IF EXISTS product_product_code_key;
DROP INDEX IF EXISTS product_product_code_key;

-- Add tenant-scoped unique constraint: same product_code allowed across different tenants
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_product_tenant_code'
    ) THEN
        ALTER TABLE product
            ADD CONSTRAINT uk_product_tenant_code UNIQUE (tenant_uuid, product_code);
    END IF;
END
$$;

-- Drop global unique constraint on product_name if any, make it tenant-scoped too
ALTER TABLE product DROP CONSTRAINT IF EXISTS product_product_name_key;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_product_tenant_name'
    ) THEN
        ALTER TABLE product
            ADD CONSTRAINT uk_product_tenant_name UNIQUE (tenant_uuid, product_name);
    END IF;
END
$$;
