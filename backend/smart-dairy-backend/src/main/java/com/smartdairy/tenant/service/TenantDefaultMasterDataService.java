package com.smartdairy.tenant.service;

import com.smartdairy.collectionmethod.entity.CollectionMethod;
import com.smartdairy.collectionmethod.repository.CollectionMethodRepository;
import com.smartdairy.paymentcycle.entity.PaymentCycle;
import com.smartdairy.paymentcycle.repository.PaymentCycleRepository;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.enums.ProductType;
import com.smartdairy.product.enums.UnitType;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.rateprofile.entity.RateCategory;
import com.smartdairy.rateprofile.repository.RateCategoryRepository;
import com.smartdairy.shift.entity.Shift;
import com.smartdairy.shift.repository.ShiftRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class TenantDefaultMasterDataService {

    private final RateCategoryRepository rateCategoryRepository;
    private final CollectionMethodRepository collectionMethodRepository;
    private final PaymentCycleRepository paymentCycleRepository;
    private final ShiftRepository shiftRepository;
    private final ProductRepository productRepository;

    public void createDefaultMasters(UUID tenantUuid) {
        log.info("Creating default master data for tenant={}.", tenantUuid);
        createDefaultRateCategories(tenantUuid);
        createDefaultCollectionMethods(tenantUuid);
        createDefaultPaymentCycles(tenantUuid);
        createDefaultShifts(tenantUuid);
        createDefaultProducts(tenantUuid);
    }

    private void createDefaultRateCategories(UUID tenantUuid) {
        saveRateCategoryIfMissing(tenantUuid, "STANDARD", "Standard", "Standard Rate", 1);
        saveRateCategoryIfMissing(tenantUuid, "PREMIUM", "Premium", "Premium Rate", 2);
    }

    private void saveRateCategoryIfMissing(UUID tenantUuid, String code, String name, String description, int displayOrder) {
        if (rateCategoryRepository.existsByCodeAndTenantUuid(code, tenantUuid)) {
            return;
        }

        RateCategory rateCategory = new RateCategory();
        rateCategory.setTenantUuid(tenantUuid);
        rateCategory.setCode(code);
        rateCategory.setName(name);
        rateCategory.setDescription(description);
        rateCategory.setDisplayOrder(displayOrder);
        rateCategory.setActive(Boolean.TRUE);
        rateCategoryRepository.save(rateCategory);
    }

    private void createDefaultCollectionMethods(UUID tenantUuid) {
        saveCollectionMethodIfMissing(tenantUuid, "FAT", "FAT", "Milk collection based on Fat and SNF", 1);
        saveCollectionMethodIfMissing(tenantUuid, "MAVA", "MAVA", "Milk collection based on Mava", 2);
    }

    private void saveCollectionMethodIfMissing(UUID tenantUuid, String code, String name, String description, int displayOrder) {
        if (collectionMethodRepository.existsByCodeAndTenantUuid(code, tenantUuid)) {
            return;
        }

        CollectionMethod collectionMethod = new CollectionMethod();
        collectionMethod.setTenantUuid(tenantUuid);
        collectionMethod.setCode(code);
        collectionMethod.setName(name);
        collectionMethod.setDescription(description);
        collectionMethod.setDisplayOrder(displayOrder);
        collectionMethod.setActive(Boolean.TRUE);
        collectionMethodRepository.save(collectionMethod);
    }

    private void createDefaultPaymentCycles(UUID tenantUuid) {
        savePaymentCycleIfMissing(tenantUuid, "WEEKLY", "Weekly", "Weekly Payment", 1);
        savePaymentCycleIfMissing(tenantUuid, "MONTHLY", "Monthly", "Monthly Payment", 2);
    }

    private void savePaymentCycleIfMissing(UUID tenantUuid, String code, String name, String description, int displayOrder) {
        if (paymentCycleRepository.existsByCodeAndTenantUuid(code, tenantUuid)) {
            return;
        }

        PaymentCycle paymentCycle = new PaymentCycle();
        paymentCycle.setTenantUuid(tenantUuid);
        paymentCycle.setCode(code);
        paymentCycle.setName(name);
        paymentCycle.setDescription(description);
        paymentCycle.setDisplayOrder(displayOrder);
        paymentCycle.setActive(Boolean.TRUE);
        paymentCycleRepository.save(paymentCycle);
    }

    private void createDefaultShifts(UUID tenantUuid) {
        saveShiftIfMissing(tenantUuid, "MORNING", "Morning", "Morning Milk Collection", 1);
        saveShiftIfMissing(tenantUuid, "EVENING", "Evening", "Evening Milk Collection", 2);
    }

    private void saveShiftIfMissing(UUID tenantUuid, String code, String name, String description, int displayOrder) {
        if (shiftRepository.existsByCodeAndTenantUuid(code, tenantUuid)) {
            return;
        }

        Shift shift = new Shift();
        shift.setTenantUuid(tenantUuid);
        shift.setCode(code);
        shift.setName(name);
        shift.setDescription(description);
        shift.setDisplayOrder(displayOrder);
        shift.setActive(Boolean.TRUE);
        shiftRepository.save(shift);
    }

    private void createDefaultProducts(UUID tenantUuid) {
        saveProductIfMissing(tenantUuid, "PRD001", "Buffalo Milk");
        saveProductIfMissing(tenantUuid, "PRD002", "Cow Milk");
    }

    private void saveProductIfMissing(UUID tenantUuid, String code, String name) {
        if (productRepository.existsByProductCodeAndTenantUuid(code, tenantUuid)
                || productRepository.existsByProductNameIgnoreCaseAndTenantUuid(name, tenantUuid)) {
            return;
        }

        Product product = new Product();
        product.setTenantUuid(tenantUuid);
        product.setProductCode(code);
        product.setProductName(name);
        product.setProductType(ProductType.RAW_MILK);
        product.setUnitType(UnitType.LITER);
        product.setPurchasePrice(BigDecimal.ZERO);
        product.setSellingPrice(BigDecimal.ZERO);
        product.setMinimumStock(BigDecimal.ZERO);
        product.setActive(Boolean.TRUE);
        productRepository.save(product);
    }
}
