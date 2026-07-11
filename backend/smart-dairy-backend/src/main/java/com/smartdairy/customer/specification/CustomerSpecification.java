package com.smartdairy.customer.specification;

import com.smartdairy.customer.dto.CustomerSearchRequest;
import com.smartdairy.customer.entity.Customer;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class CustomerSpecification {

    private CustomerSpecification() {
    }

    public static Specification<Customer> search(
            CustomerSearchRequest request) {

        return (root, query, cb) -> {

            List<Predicate> predicates =
                    new ArrayList<>();

            if (request.getCustomerCode() != null &&
                    !request.getCustomerCode().isBlank()) {

                predicates.add(cb.like(
                        cb.lower(root.get("customerCode")),
                        "%" + request.getCustomerCode().toLowerCase() + "%"));
            }

            if (request.getCustomerName() != null &&
                    !request.getCustomerName().isBlank()) {

                predicates.add(cb.like(
                        cb.lower(root.get("customerName")),
                        "%" + request.getCustomerName().toLowerCase() + "%"));
            }

            if (request.getMobileNo() != null &&
                    !request.getMobileNo().isBlank()) {

                predicates.add(cb.like(
                        root.get("mobileNo"),
                        "%" + request.getMobileNo() + "%"));
            }

            if (request.getCity() != null &&
                    !request.getCity().isBlank()) {

                predicates.add(cb.equal(
                        cb.lower(root.get("city")),
                        request.getCity().toLowerCase()));
            }

            if (request.getActive() != null) {

                predicates.add(cb.equal(
                        root.get("active"),
                        request.getActive()));
            }

            query.orderBy(
                    cb.asc(root.get("customerName")));

            return cb.and(
                    predicates.toArray(new Predicate[0]));

        };

    }

}