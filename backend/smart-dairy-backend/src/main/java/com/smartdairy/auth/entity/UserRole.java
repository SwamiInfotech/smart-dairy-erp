package com.smartdairy.auth.entity;

public enum UserRole {
    ADMIN,
    MANAGER,
    OPERATOR,
    VIEWER;

    public String authority() {
        return "ROLE_" + name();
    }
}
