package com.smartdairy.inventory.service.impl;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.inventory.dto.InventoryTransactionRequest;
import com.smartdairy.inventory.entity.InventoryTransaction;
import com.smartdairy.inventory.repository.InventoryTransactionRepository;
import com.smartdairy.inventory.service.InventoryService;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryTransactionRepository repository;
    private final BranchRepository branchRepository;
    private final ProductRepository productRepository;

    @Override
    public void createTransaction(InventoryTransactionRequest request) {

        Branch branch = branchRepository.findByUuid(request.branchUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Branch not found."));

        Product product = productRepository.findByUuid(request.productUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found."));

        InventoryTransaction transaction = new InventoryTransaction();

        transaction.setBranch(branch);
        transaction.setProduct(product);
        transaction.setTransactionType(request.transactionType());
        transaction.setReferenceType(request.referenceType());
        transaction.setReferenceUuid(request.referenceUuid());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setQuantityIn(request.quantityIn());
        transaction.setQuantityOut(request.quantityOut());
        transaction.setRemarks(request.remarks());
        transaction.setActive(true);

        repository.save(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getCurrentStock(UUID productUuid) {

        BigDecimal stock = repository.getCurrentStock(productUuid);

        return stock == null ? BigDecimal.ZERO : stock;
    }
}