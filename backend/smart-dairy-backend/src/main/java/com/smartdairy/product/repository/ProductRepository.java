package com.smartdairy.product.repository;

import com.smartdairy.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByUuid(UUID uuid);

    Optional<Product> findByProductNameIgnoreCase(String productName);

    boolean existsByProductCodeAndTenantUuid(String productCode, UUID tenantUuid);

    boolean existsByProductNameIgnoreCaseAndTenantUuid(String productName, UUID tenantUuid);

    // kept for backward compatibility
    boolean existsByProductCode(String productCode);

    boolean existsByProductNameIgnoreCase(String productName);

    @Query("""
            SELECT new com.smartdairy.inventory.dto.CurrentStockResponse(
                p.uuid,
                p.productCode,
                p.productName,
                COALESCE(SUM(i.quantityIn), 0) - COALESCE(SUM(i.quantityOut), 0)
            )
            FROM Product p
            LEFT JOIN com.smartdairy.inventory.entity.InventoryTransaction i
                ON i.product.id = p.id
            GROUP BY p.uuid, p.productCode, p.productName
            ORDER BY p.productName
            """)
    List<com.smartdairy.inventory.dto.CurrentStockResponse> getCurrentStockForAllProducts();

}