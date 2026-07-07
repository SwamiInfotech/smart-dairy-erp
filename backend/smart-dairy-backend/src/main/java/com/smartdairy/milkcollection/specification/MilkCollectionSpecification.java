package com.smartdairy.milkcollection.specification;

import com.smartdairy.milkcollection.dto.MilkCollectionSearchRequest;
import com.smartdairy.milkcollection.entity.MilkCollection;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class MilkCollectionSpecification {

    private MilkCollectionSpecification() {
        /* This utility class should not be instantiated */
    }


    public static Specification<MilkCollection> search(
            MilkCollectionSearchRequest request) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (request.getFarmerUuid() != null) {
                predicates.add(cb.equal(
                        root.get("farmer").get("uuid"),
                        request.getFarmerUuid()));
            }

            if (request.getBranchUuid() != null) {

                predicates.add(cb.equal(
                        root.get("branch").get("uuid"),
                        request.getBranchUuid()));
            }

            if (request.getCollectionMethodUuid() != null) {

                predicates.add(cb.equal(
                        root.get("collectionMethod").get("uuid"),
                        request.getCollectionMethodUuid()));
            }

            if (request.getShiftUuid() != null) {
                predicates.add(cb.equal(
                        root.get("shift").get("uuid"),
                        request.getShiftUuid()));
            }

            if (request.getMilkTypeUuid() != null) {
                predicates.add(cb.equal(
                        root.get("milkType").get("uuid"),
                        request.getMilkTypeUuid()));
            }

            if (request.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("collectionDate"),
                        request.getFromDate()));
            }

            if (request.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("collectionDate"),
                        request.getToDate()));
            }

            if (request.getLocked() != null) {

                predicates.add(cb.equal(
                        root.get("locked"),
                        request.getLocked()));
            }

            if (request.getMinQuantity() != null) {

                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("quantity"),
                        request.getMinQuantity()));
            }

            if (request.getMaxQuantity() != null) {

                predicates.add(cb.lessThanOrEqualTo(
                        root.get("quantity"),
                        request.getMaxQuantity()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

}