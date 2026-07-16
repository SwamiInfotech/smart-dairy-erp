-- Create tenant_invitation table for tenant onboarding workflow
CREATE TABLE IF NOT EXISTS tenant_invitation (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    tenant_uuid UUID NOT NULL,
    tenant_id BIGINT NOT NULL,
    invited_by_user_id BIGINT NOT NULL,
    accepted_by_user_id BIGINT,
    invitation_token UUID NOT NULL UNIQUE,
    invited_username VARCHAR(100) NOT NULL,
    invited_full_name VARCHAR(150),
    role VARCHAR(50) NOT NULL,
    permissions TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMP,
    responded_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_tenant_invitation_tenant FOREIGN KEY(tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_invitation_tenant_uuid FOREIGN KEY(tenant_uuid) REFERENCES tenant(uuid),
    CONSTRAINT fk_tenant_invitation_invited_by FOREIGN KEY(invited_by_user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_invitation_accepted_by FOREIGN KEY(accepted_by_user_id) REFERENCES app_user(id) ON DELETE SET NULL,
    CONSTRAINT chk_tenant_invitation_status CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED')),
    CONSTRAINT chk_tenant_invitation_role CHECK(role IN ('OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'))
);

CREATE INDEX idx_tenant_invitation_tenant_uuid ON tenant_invitation(tenant_uuid);
CREATE INDEX idx_tenant_invitation_invited_username ON tenant_invitation(invited_username);
CREATE INDEX idx_tenant_invitation_status ON tenant_invitation(status);
CREATE INDEX idx_tenant_invitation_token ON tenant_invitation(invitation_token);
CREATE INDEX idx_tenant_invitation_invited_by_user_id ON tenant_invitation(invited_by_user_id);

COMMENT ON TABLE tenant_invitation IS 'Tenant invitation workflow for adding existing users to a shop with role-based access';
