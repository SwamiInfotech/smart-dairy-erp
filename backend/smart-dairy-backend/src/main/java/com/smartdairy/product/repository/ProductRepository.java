package com.smartdairy.product.repository;

import com.smartdairy.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByUuid(UUID uuid);

    Optional<Product> findByProductNameIgnoreCase(String productName);

    boolean existsByProductCode(String productCode);

    boolean existsByProductNameIgnoreCase(String productName);

}