-- ============================================================================
-- Version      : V160
-- Description  : Backfill and enforce tenant_id sync for smart_dairy_configuration
-- ============================================================================

UPDATE smart_dairy_configuration sdc
SET tenant_id = t.id
FROM tenant t
WHERE sdc.tenant_uuid = t.uuid
  AND sdc.tenant_id IS NULL;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_sdc_tenant_id'
    ) THEN
        ALTER TABLE smart_dairy_configuration
            ADD CONSTRAINT fk_sdc_tenant_id
            FOREIGN KEY (tenant_id)
            REFERENCES tenant(id);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_sdc_tenant_id
    ON smart_dairy_configuration (tenant_id);

DROP TRIGGER IF EXISTS trg_smart_dairy_configuration_tenant_id_sync
    ON smart_dairy_configuration;

CREATE TRIGGER trg_smart_dairy_configuration_tenant_id_sync
    BEFORE INSERT OR UPDATE OF tenant_uuid
    ON smart_dairy_configuration
    FOR EACH ROW
    EXECUTE FUNCTION set_tenant_id_from_uuid();
