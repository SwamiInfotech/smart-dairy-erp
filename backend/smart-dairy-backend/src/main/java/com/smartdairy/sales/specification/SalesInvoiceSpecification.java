package com.smartdairy.sales.specification;

import com.smartdairy.sales.dto.SalesInvoiceSearchRequest;
import com.smartdairy.sales.entity.SalesInvoice;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class SalesInvoiceSpecification {

    private SalesInvoiceSpecification() {
    }

    public static Specification<SalesInvoice> search(
            SalesInvoiceSearchRequest request) {

        return (root, query, cb) -> {

            List<Predicate> predicates =
                    new ArrayList<>();

            if (request.getInvoiceNo() != null &&
                    !request.getInvoiceNo().isBlank()) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("invoiceNo")),
                                "%" + request.getInvoiceNo().toLowerCase() + "%"));
            }

            if (request.getCustomerName() != null &&
                    !request.getCustomerName().isBlank()) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("customerName")),
                                "%" + request.getCustomerName().toLowerCase() + "%"));
            }

            if (request.getPaymentMode() != null) {

                predicates.add(
                        cb.equal(
                                root.get("paymentMode"),
                                request.getPaymentMode()));
            }

            if (request.getStatus() != null) {

                predicates.add(
                        cb.equal(
                                root.get("status"),
                                request.getStatus()));
            }

            if (request.getFromDate() != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("invoiceDate"),
                                request.getFromDate()));
            }

            if (request.getToDate() != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("invoiceDate"),
                                request.getToDate()));
            }

            query.orderBy(
                    cb.desc(root.get("invoiceDate")),
                    cb.desc(root.get("id")));

            return cb.and(
                    predicates.toArray(new Predicate[0]));

        };

    }

}