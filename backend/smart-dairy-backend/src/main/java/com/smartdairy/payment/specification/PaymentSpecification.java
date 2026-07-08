package com.smartdairy.payment.specification;

import com.smartdairy.payment.dto.PaymentSearchRequest;
import com.smartdairy.payment.entity.Payment;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class PaymentSpecification {

    private PaymentSpecification() {
    }

    public static Specification<Payment> search(PaymentSearchRequest request) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (request.getFarmerUuid() != null) {
                predicates.add(cb.equal(root.get("farmer").get("uuid"), request.getFarmerUuid()));
            }

            if (request.getSettlementUuid() != null) {
                predicates.add(cb.equal(root.get("settlement").get("uuid"), request.getSettlementUuid()));
            }

            if (request.getPaymentMode() != null) {
                predicates.add(cb.equal(root.get("paymentMode"), request.getPaymentMode()));
            }

            if (request.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("paymentDate"),
                        request.getFromDate()));
            }

            if (request.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("paymentDate"),
                        request.getToDate()));
            }

            query.orderBy(cb.desc(root.get("paymentDate")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}