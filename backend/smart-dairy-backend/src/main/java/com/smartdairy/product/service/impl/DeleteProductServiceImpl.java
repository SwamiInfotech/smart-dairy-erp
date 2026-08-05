package com.smartdairy.product.service.impl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.product.service.DeleteProductService;
import com.smartdairy.product.service.ProductUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DeleteProductServiceImpl implements DeleteProductService {

        private static final String CORE_PRODUCT_CODE_1 = "PRD001";
        private static final String CORE_PRODUCT_CODE_2 = "PRD002";

    private final ProductRepository repository;
    private final ProductUsageService productUsageService;

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = "products", key = "T(com.smartdairy.config.CacheKeys).tenantKey()"),
            @CacheEvict(cacheNames = "products", key = "T(com.smartdairy.config.CacheKeys).tenantRecordKey(#uuid)")
    })
    public void delete(UUID uuid) {

        Product product = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found."));

        if (isCoreProduct(product.getProductCode())) {
            throw new BusinessException("Core products PRD001 and PRD002 cannot be deleted.");
        }

        productUsageService.validateProductCanBeModified(
                product.getUuid());

        product.setActive(false);

        repository.save(product);
    }

        private boolean isCoreProduct(String productCode) {

                if (productCode == null) {
                        return false;
                }

                String normalizedCode = productCode.trim().toUpperCase();
                return CORE_PRODUCT_CODE_1.equals(normalizedCode)
                                || CORE_PRODUCT_CODE_2.equals(normalizedCode);
        }
}