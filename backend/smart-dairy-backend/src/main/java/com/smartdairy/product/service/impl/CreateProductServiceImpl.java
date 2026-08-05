package com.smartdairy.product.service.impl;

import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.inventory.dto.InventoryMovement;
import com.smartdairy.inventory.enums.InventoryTransactionType;
import com.smartdairy.inventory.enums.ReferenceType;
import com.smartdairy.inventory.service.InventoryTransactionManager;
import com.smartdairy.product.dto.CreateProductRequest;
import com.smartdairy.product.dto.ProductResponse;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.mapper.ProductMapper;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.product.service.CreateProductService;
import com.smartdairy.tenant.context.TenantContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateProductServiceImpl implements CreateProductService {

    private final ProductRepository repository;
    private final ProductMapper mapper;
    private final BranchRepository branchRepository;
    private final InventoryTransactionManager inventoryTransactionManager;

    @Override
    @CacheEvict(cacheNames = "products", key = "T(com.smartdairy.config.CacheKeys).tenantKey()")
    public ProductResponse create(CreateProductRequest request) {
        UUID tenantUuid = TenantContextHolder.getTenantUuidOrFallback();

        Optional<Product> productByCode = repository.findByProductCodeAndTenantUuid(
                request.getProductCode(),
                tenantUuid);
        Optional<Product> productByName = repository.findByProductNameIgnoreCaseAndTenantUuid(
                request.getProductName(),
                tenantUuid);

        if (productByCode.isPresent() && Boolean.TRUE.equals(productByCode.get().getActive())) {
            throw new BusinessException("Product code already exists.");
        }

        if (productByName.isPresent() && Boolean.TRUE.equals(productByName.get().getActive())) {
            throw new BusinessException("Product name already exists.");
        }

        if (productByCode.isPresent() && productByName.isPresent()
                && !productByCode.get().getUuid().equals(productByName.get().getUuid())) {
            throw new BusinessException("Inactive product code and name are linked to different records. Please change product code or name.");
        }

        Product reactivatedProduct = productByCode.or(() -> productByName).orElse(null);
        if (reactivatedProduct != null) {
            reactivatedProduct.setProductCode(request.getProductCode());
            reactivatedProduct.setProductName(request.getProductName());
            reactivatedProduct.setProductType(request.getProductType());
            reactivatedProduct.setUnitType(request.getUnitType());
            reactivatedProduct.setDescription(request.getDescription());
            reactivatedProduct.setPurchasePrice(request.getPurchasePrice());
            reactivatedProduct.setSellingPrice(request.getSellingPrice());
            reactivatedProduct.setMinimumStock(request.getMinimumStock());
            reactivatedProduct.setActive(true);

            Product savedProduct = repository.save(reactivatedProduct);
            initializeOpeningStock(tenantUuid, savedProduct, request.getMinimumStock(),
                    "Opening stock initialized from product reactivation.");

            return mapper.toResponse(savedProduct);
        }

        Product product = mapper.toEntity(request);
        product.setActive(true);
        Product savedProduct = repository.save(product);

        initializeOpeningStock(tenantUuid, savedProduct, request.getMinimumStock(),
            "Opening stock initialized from product minimum stock");

        return mapper.toResponse(savedProduct);
        }

        private void initializeOpeningStock(
            UUID tenantUuid,
            Product product,
            BigDecimal quantity,
            String remarks) {

        UUID branchUuid = branchRepository
                .findFirstByTenantUuidAndActiveTrueOrderByCreatedAtAsc(tenantUuid)
                .orElseThrow(() -> new BusinessException(
                        "Cannot initialize inventory. No active branch found for tenant."))
                .getUuid();

        inventoryTransactionManager.createMovement(
                new InventoryMovement(
                        branchUuid,
                        product.getUuid(),
                        InventoryTransactionType.OPENING_STOCK,
                        ReferenceType.ADJUSTMENT,
                        product.getUuid(),
                        quantity,
                        BigDecimal.ZERO,
                        remarks));
    }
}