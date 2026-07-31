package com.smartdairy.collectionmethod.dto;

import java.util.UUID;

public record CollectionMethodResponse(
        UUID uuid,
        String code,
        String name,
        String description,
        Integer displayOrder,
        Boolean active
) {
}
