package com.smartdairy.tenant.context;

import lombok.Getter;

@Getter
public class TenantResolutionException extends RuntimeException {

    private final int status;
    private final String error;

    public TenantResolutionException(int status, String error, String message) {
        super(message);
        this.status = status;
        this.error = error;
    }
}
