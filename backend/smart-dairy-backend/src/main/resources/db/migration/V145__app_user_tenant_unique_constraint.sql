DO
$$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_app_user_username'
    ) THEN
        ALTER TABLE app_user DROP CONSTRAINT uk_app_user_username;
    END IF;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_app_user_tenant_username'
    ) THEN
        ALTER TABLE app_user
            ADD CONSTRAINT uk_app_user_tenant_username UNIQUE (tenant_uuid, username);
    END IF;
END
$$;

DROP INDEX IF EXISTS idx_app_user_username_lower;
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_tenant_username_lower
ON app_user (tenant_uuid, LOWER(username));
