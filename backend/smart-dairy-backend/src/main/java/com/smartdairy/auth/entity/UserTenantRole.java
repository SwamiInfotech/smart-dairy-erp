package com.smartdairy.auth.entity;

public enum UserTenantRole {
    OWNER("Owner", "Can manage company settings and users"),
    ADMIN("Administrator", "Full access to all features"),
    MANAGER("Manager", "Can manage team and operations"),
    OPERATOR("Operator", "Can perform operations"),
    VIEWER("Viewer", "Read-only access");

    private final String displayName;
    private final String description;

    UserTenantRole(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
