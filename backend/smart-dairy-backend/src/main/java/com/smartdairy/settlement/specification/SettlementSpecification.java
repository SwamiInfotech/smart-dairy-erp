package com.smartdairy.settlement.specification;

import com.smartdairy.settlement.dto.SettlementSearchRequest;
import com.smartdairy.settlement.entity.Settlement;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class SettlementSpecification {

    private SettlementSpecification() {
    }

    public static Specification<Settlement> search(SettlementSearchRequest request) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("active")));

            if (request.getFarmerUuid() != null) {
                predicates.add(cb.equal(root.get("farmer").get("uuid"), request.getFarmerUuid()));
            }

            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }

            if (request.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fromDate"), request.getFromDate()));
            }

            if (request.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("toDate"), request.getToDate()));
            }

            query.orderBy(cb.desc(root.get("toDate")), cb.desc(root.get("createdAt")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

}