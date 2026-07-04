package com.smartdairy.common.response;

import java.time.OffsetDateTime;
import java.util.List;

public record ErrorResponse(

        OffsetDateTime timestamp,

        int status,

        String error,

        String message,

        String path,

        List<String> validationErrors

) {
}