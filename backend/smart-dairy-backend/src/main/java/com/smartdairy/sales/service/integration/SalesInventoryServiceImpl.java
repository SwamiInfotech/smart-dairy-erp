package com.smartdairy.sales.service.integration;

import com.smartdairy.inventory.dto.InventoryTransactionRequest;
import com.smartdairy.inventory.enums.InventoryTransactionType;
import com.smartdairy.inventory.enums.ReferenceType;
import com.smartdairy.inventory.repository.InventoryTransactionRepository;
import com.smartdairy.inventory.service.GetCurrentStockService;
import com.smartdairy.inventory.service.InventoryService;
import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.entity.SalesInvoiceItem;
import com.smartdairy.sales.validator.SalesInventoryValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class SalesInventoryServiceImpl
        implements SalesInventoryService {

    private final InventoryService inventoryService;
    private final GetCurrentStockService getCurrentStockService;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final SalesInventoryValidator validator;

    @Override
    public void deductInventory(SalesInvoice invoice) {

        validator.validate(invoice);

        for (SalesInvoiceItem item : invoice.getItems()) {

            InventoryTransactionRequest request =
                    new InventoryTransactionRequest(

                            invoice.getBranch().getUuid(),

                            item.getProduct().getUuid(),

                            InventoryTransactionType.SALES,

                            ReferenceType.SALES,

                            invoice.getUuid(),

                            OffsetDateTime.now(),

                            BigDecimal.ZERO,

                            item.getQuantity(),

                            "Sales Invoice : " + invoice.getInvoiceNo()

                    );

            inventoryService.createTransaction(request);

        }

    }

    @Override
    public void reverseInventory(SalesInvoice invoice) {

        inventoryTransactionRepository
                .findByReferenceUuidOrderById(invoice.getUuid())
                .forEach(inventoryTransactionRepository::delete);

    }

    @Override
    public void updateInventory(
            SalesInvoice oldInvoice,
            SalesInvoice newInvoice) {

        reverseInventory(oldInvoice);

        deductInventory(newInvoice);

    }
}