package com.smartdairy.product.specification;

import com.smartdairy.product.dto.ProductSearchRequest;
import com.smartdairy.product.entity.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class ProductSpecification {

    private ProductSpecification() {
    }

    public static Specification<Product> search(ProductSearchRequest request) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (request.getProductCode() != null && !request.getProductCode().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("productCode")),
                        "%" + request.getProductCode().toLowerCase() + "%"));
            }

            if (request.getProductName() != null && !request.getProductName().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("productName")),
                        "%" + request.getProductName().toLowerCase() + "%"));
            }

            if (request.getProductType() != null) {
                predicates.add(cb.equal(root.get("productType"), request.getProductType()));
            }

            if (request.getActive() != null) {
                predicates.add(cb.equal(root.get("active"), request.getActive()));
            }

            query.orderBy(cb.asc(root.get("productName")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}