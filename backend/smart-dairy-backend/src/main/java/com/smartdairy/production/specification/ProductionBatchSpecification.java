package com.smartdairy.production.specification;

import com.smartdairy.production.dto.ProductionBatchSearchRequest;
import com.smartdairy.production.entity.ProductionBatch;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class ProductionBatchSpecification {

    private ProductionBatchSpecification() {
    }

    public static Specification<ProductionBatch> search(
            ProductionBatchSearchRequest request) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (request.getBatchNo() != null &&
                    !request.getBatchNo().isBlank()) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("batchNo")),
                                "%" + request.getBatchNo().toLowerCase() + "%"
                        )
                );

            }

            if (request.getFromDate() != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("productionDate"),
                                request.getFromDate())
                );

            }

            if (request.getToDate() != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("productionDate"),
                                request.getToDate())
                );

            }

            if (request.getStatus() != null) {

                predicates.add(
                        cb.equal(
                                root.get("status"),
                                request.getStatus())
                );

            }

            query.orderBy(
                    cb.desc(root.get("productionDate")),
                    cb.desc(root.get("id")));

            return cb.and(predicates.toArray(new Predicate[0]));

        };

    }

}