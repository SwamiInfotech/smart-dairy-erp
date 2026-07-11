package com.smartdairy.inventory.dto;

import com.smartdairy.inventory.enums.InventoryTransactionType;
import com.smartdairy.inventory.enums.ReferenceType;

import java.math.BigDecimal;
import java.util.UUID;

public record InventoryMovement(

        UUID branchUuid,

        UUID productUuid,

        InventoryTransactionType transactionType,

        ReferenceType referenceType,

        UUID referenceUuid,

        BigDecimal quantityIn,

        BigDecimal quantityOut,

        String remarks

) {
}