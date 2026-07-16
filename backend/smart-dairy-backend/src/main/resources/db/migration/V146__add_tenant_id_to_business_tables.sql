CREATE OR REPLACE FUNCTION set_tenant_id_from_uuid()
RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.tenant_uuid IS NULL THEN
        RAISE EXCEPTION 'tenant_uuid must not be null for table %', TG_TABLE_NAME;
    END IF;

    SELECT id
      INTO NEW.tenant_id
      FROM tenant
     WHERE uuid = NEW.tenant_uuid;

    IF NEW.tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenant.id found for tenant_uuid % in table %', NEW.tenant_uuid, TG_TABLE_NAME;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO
$$
DECLARE
    row RECORD;
    idx_name TEXT;
    fk_name TEXT;
    trg_name TEXT;
BEGIN
    FOR row IN
        SELECT c.table_name
          FROM information_schema.columns c
         WHERE c.table_schema = 'public'
           AND c.column_name = 'tenant_uuid'
           AND c.table_name NOT IN ('flyway_schema_history', 'tenant')
    LOOP
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS tenant_id BIGINT', row.table_name);

        EXECUTE format(
            'UPDATE %I t
                SET tenant_id = tn.id
               FROM tenant tn
              WHERE t.tenant_uuid = tn.uuid
                AND t.tenant_id IS NULL',
            row.table_name
        );

        EXECUTE format('ALTER TABLE %I ALTER COLUMN tenant_id SET NOT NULL', row.table_name);

        idx_name := 'idx_' || row.table_name || '_tenant_id';
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (tenant_id)', idx_name, row.table_name);

        fk_name := 'fk_' || row.table_name || '_tenant_id';
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = fk_name) THEN
            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (tenant_id) REFERENCES tenant(id)',
                row.table_name,
                fk_name
            );
        END IF;

        trg_name := 'trg_' || row.table_name || '_tenant_id_sync';
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trg_name, row.table_name);
        EXECUTE format(
            'CREATE TRIGGER %I
                BEFORE INSERT OR UPDATE OF tenant_uuid
                ON %I
                FOR EACH ROW
                EXECUTE FUNCTION set_tenant_id_from_uuid()',
            trg_name,
            row.table_name
        );
    END LOOP;
END
$$;