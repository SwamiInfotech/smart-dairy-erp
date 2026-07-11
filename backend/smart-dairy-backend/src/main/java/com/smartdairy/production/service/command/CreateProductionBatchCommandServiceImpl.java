package com.smartdairy.production.service.command;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.inventory.service.GetCurrentStockService;
import com.smartdairy.inventory.service.InventoryService;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.production.dto.CreateProductionBatchItemRequest;
import com.smartdairy.production.dto.CreateProductionBatchRequest;
import com.smartdairy.production.dto.ProductionBatchResponse;
import com.smartdairy.production.entity.ProductionBatch;
import com.smartdairy.production.entity.ProductionBatchItem;
import com.smartdairy.production.enums.ProductionItemType;
import com.smartdairy.production.enums.ProductionStatus;
import com.smartdairy.production.mapper.ProductionBatchMapper;
import com.smartdairy.production.repository.ProductionBatchRepository;
import com.smartdairy.production.service.ProductionBatchNumberGenerator;
import com.smartdairy.production.service.integration.ProductionInventoryIntegrationService;
import com.smartdairy.production.validator.ProductionBatchValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateProductionBatchCommandServiceImpl implements CreateProductionBatchCommandService {

    private final ProductionBatchRepository productionBatchRepository;

    private final BranchRepository branchRepository;

    private final ProductRepository productRepository;

    private final ProductionBatchMapper mapper;

    private final ProductionBatchValidator validator;

    private final ProductionInventoryIntegrationService productionInventoryIntegrationService;

    private final GetCurrentStockService getCurrentStockService;

    private final ProductionBatchNumberGenerator batchNumberGenerator;



    @Override
    public ProductionBatchResponse create(CreateProductionBatchRequest request) {

        validator.validate(request);

        Branch branch = branchRepository.findByUuid(request.branchUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Branch not found."));

        validateInventory(request);

        ProductionBatch batch = new ProductionBatch();

        batch.setBranch(branch);

        batch.setBatchNo(batchNumberGenerator.generate());

        batch.setProductionDate(request.productionDate());

        batch.setRemarks(request.remarks());

        batch.setStatus(ProductionStatus.COMPLETED);

        batch.setActive(Boolean.TRUE);

        request.items().forEach(item ->
                batch.getItems().add(createItem(batch, item)));

        ProductionBatch saved = productionBatchRepository.save(batch);

        productionInventoryIntegrationService.processInventory(saved);

        return mapper.toResponse(saved);
    }

    private ProductionBatchItem createItem(
            ProductionBatch batch,
            CreateProductionBatchItemRequest request) {

        Product product = productRepository.findByUuid(request.productUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found."));

        ProductionBatchItem item = new ProductionBatchItem();

        item.setProductionBatch(batch);

        item.setProduct(product);

        item.setItemType(request.itemType());

        item.setQuantity(request.quantity());

        item.setRemarks(request.remarks());

        return item;
    }

    private void validateInventory(CreateProductionBatchRequest request) {

        request.items()
                .stream()
                .filter(item -> item.itemType() == ProductionItemType.CONSUME)
                .forEach(item -> {

                    BigDecimal stock = getCurrentStockService.getCurrentStock(item.productUuid()).currentStock();


                    if (stock.compareTo(item.quantity()) < 0) {

                        throw new BusinessException(
                                "Insufficient stock for product : "
                                        + item.productUuid());
                    }

                });
    }

    /**
     * Temporary implementation.
     * We will replace this with a proper sequence generator later.
     */
    private String generateBatchNumber() {

        return "PB-" + System.currentTimeMillis();
    }


}