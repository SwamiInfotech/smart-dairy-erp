package com.smartdairy.inventory.service;

import com.smartdairy.inventory.dto.InventoryMovement;

public interface InventoryTransactionManager {

    void createMovement(InventoryMovement movement);

    void reverseMovement(
            java.util.UUID referenceUuid);

}