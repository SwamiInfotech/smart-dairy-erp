package com.smartdairy.inventory.service.impl;

import com.smartdairy.inventory.dto.InventoryMovement;
import com.smartdairy.inventory.dto.InventoryTransactionRequest;
import com.smartdairy.inventory.entity.InventoryTransaction;
import com.smartdairy.inventory.repository.InventoryTransactionRepository;
import com.smartdairy.inventory.service.InventoryService;
import com.smartdairy.inventory.service.InventoryTransactionManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryTransactionManagerImpl
        implements InventoryTransactionManager {

    private final InventoryService inventoryService;

    private final InventoryTransactionRepository repository;

    @Override
    public void createMovement(
            InventoryMovement movement) {

        InventoryTransactionRequest request =
                new InventoryTransactionRequest(

                        movement.branchUuid(),

                        movement.productUuid(),

                        movement.transactionType(),

                        movement.referenceType(),

                        movement.referenceUuid(),

                        OffsetDateTime.now(),

                        movement.quantityIn(),

                        movement.quantityOut(),

                        movement.remarks()

                );

        inventoryService.createTransaction(request);

    }

    @Override
    public void reverseMovement(
            UUID referenceUuid) {

        List<InventoryTransaction> transactions =
                repository.findByReferenceUuidOrderById(referenceUuid);

        repository.deleteAll(transactions);

    }

}