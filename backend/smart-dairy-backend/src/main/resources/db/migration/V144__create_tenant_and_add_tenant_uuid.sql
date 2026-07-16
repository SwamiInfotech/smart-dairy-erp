CREATE TABLE IF NOT EXISTS tenant
(
    id         BIGSERIAL PRIMARY KEY,
    uuid       UUID NOT NULL UNIQUE,
    code       VARCHAR(50) NOT NULL UNIQUE,
    name       VARCHAR(150) NOT NULL,
    active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version    BIGINT NOT NULL DEFAULT 0
);

INSERT INTO tenant (uuid, code, name, active, created_at, updated_at, version)
SELECT '00000000-0000-0000-0000-000000000001'::uuid, 'DEFAULT', 'Default Tenant', TRUE, NOW(), NOW(), 0
WHERE NOT EXISTS (
    SELECT 1 FROM tenant WHERE uuid = '00000000-0000-0000-0000-000000000001'::uuid
);

DO
$$
DECLARE
    row RECORD;
    default_tenant_uuid UUID := '00000000-0000-0000-0000-000000000001'::UUID;
    idx_name TEXT;
BEGIN
    FOR row IN
        SELECT t.table_name
        FROM information_schema.tables t
        WHERE t.table_schema = 'public'
          AND t.table_type = 'BASE TABLE'
          AND t.table_name NOT IN ('flyway_schema_history', 'tenant')
    LOOP
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS tenant_uuid UUID', row.table_name);
        EXECUTE format('UPDATE %I SET tenant_uuid = %L WHERE tenant_uuid IS NULL', row.table_name, default_tenant_uuid);
        EXECUTE format('ALTER TABLE %I ALTER COLUMN tenant_uuid SET NOT NULL', row.table_name);

        idx_name := 'idx_' || row.table_name || '_tenant_uuid';
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (tenant_uuid)', idx_name, row.table_name);
    END LOOP;
END
$$;
