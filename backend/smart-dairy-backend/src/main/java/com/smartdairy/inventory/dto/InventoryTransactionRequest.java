package com.smartdairy.inventory.dto;

import com.smartdairy.inventory.enums.InventoryTransactionType;
import com.smartdairy.inventory.enums.ReferenceType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record InventoryTransactionRequest(

        UUID branchUuid,

        UUID productUuid,

        InventoryTransactionType transactionType,

        ReferenceType referenceType,

        UUID referenceUuid,

        OffsetDateTime transactionDate,

        BigDecimal quantityIn,

        BigDecimal quantityOut,

        String remarks
) {
}