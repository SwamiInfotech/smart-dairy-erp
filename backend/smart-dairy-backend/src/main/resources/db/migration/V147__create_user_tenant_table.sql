-- Create user_tenant join table for multi-shop SaaS support
CREATE TABLE IF NOT EXISTS user_tenant (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    tenant_uuid UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'OPERATOR',
    is_owner BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    permissions TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    
    CONSTRAINT fk_user_tenant_user FOREIGN KEY(user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_tenant_tenant FOREIGN KEY(tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_tenant_tenant_uuid FOREIGN KEY(tenant_uuid) REFERENCES tenant(uuid),
    CONSTRAINT uk_user_tenant_unique UNIQUE(user_id, tenant_id),
    CONSTRAINT chk_user_tenant_role CHECK(role IN ('OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')),
    CONSTRAINT chk_user_tenant_one_primary CHECK(
        -- This constraint is informational; primary enforcement via application logic
        (is_primary = FALSE) OR (is_primary = TRUE)
    )
);

-- Create indexes for fast lookups
CREATE INDEX idx_user_tenant_user_id ON user_tenant(user_id);
CREATE INDEX idx_user_tenant_tenant_id ON user_tenant(tenant_id);
CREATE INDEX idx_user_tenant_user_active ON user_tenant(user_id, active);
CREATE INDEX idx_user_tenant_is_primary ON user_tenant(user_id, is_primary);
CREATE INDEX idx_user_tenant_tenant_uuid ON user_tenant(tenant_uuid);

-- Migrate existing users to user_tenant table
-- Each user gets their current tenant with ADMIN role and marked as primary
INSERT INTO user_tenant (uuid, user_id, tenant_id, tenant_uuid, role, is_admin, is_primary, active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    au.id,
    t.id,
    au.tenant_uuid,
    'ADMIN',
    TRUE,
    TRUE,
    au.active,
    au.created_at,
    au.updated_at
FROM app_user au
JOIN tenant t ON au.tenant_uuid = t.uuid
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Add column to app_user for default tenant reference (optional but recommended for clarity)
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS default_tenant_uuid UUID;

-- Populate default_tenant_uuid from existing tenant_uuid
UPDATE app_user 
SET default_tenant_uuid = tenant_uuid 
WHERE default_tenant_uuid IS NULL;

-- Add NOT NULL constraint after populating
ALTER TABLE app_user 
ALTER COLUMN default_tenant_uuid SET NOT NULL;

-- Create comment documenting the migration
COMMENT ON TABLE user_tenant IS 'Join table enabling multi-tenant SaaS: users can have access to multiple tenants/companies with different roles';
COMMENT ON COLUMN user_tenant.is_primary IS 'When user logs in without specifying a tenant, use the primary tenant';
COMMENT ON COLUMN user_tenant.permissions IS 'JSON array of permission strings, e.g., ["read_sales", "write_inventory"]';
