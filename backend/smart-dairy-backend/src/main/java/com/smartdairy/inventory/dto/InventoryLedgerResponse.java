package com.smartdairy.inventory.dto;

import com.smartdairy.inventory.enums.InventoryTransactionType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record InventoryLedgerResponse(

        UUID uuid,

        OffsetDateTime transactionDate,

        InventoryTransactionType transactionType,

        UUID referenceUuid,

        BigDecimal quantityIn,

        BigDecimal quantityOut,

        String remarks

) {
}