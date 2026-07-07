package com.smartdairy.loan.specification;

import com.smartdairy.loan.dto.LoanSearchRequest;
import com.smartdairy.loan.entity.Loan;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class LoanSpecification {

    public static Specification<Loan> search(
            LoanSearchRequest request){

        return (root, query, cb)->{

            List<Predicate> predicates = new ArrayList<>();

            if(request.getFarmerUuid()!=null){

                predicates.add(cb.equal(
                        root.get("farmer").get("uuid"),
                        request.getFarmerUuid()));
            }

            if(request.getBranchUuid()!=null){

                predicates.add(cb.equal(
                        root.get("branch").get("uuid"),
                        request.getBranchUuid()));
            }

            if(request.getStatus()!=null){

                predicates.add(cb.equal(
                        root.get("status"),
                        request.getStatus()));
            }

            if(request.getLoanType()!=null){

                predicates.add(cb.equal(
                        root.get("loanType"),
                        request.getLoanType()));
            }

            if(request.getFromDate()!=null){

                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("loanDate"),
                        request.getFromDate()));
            }

            if(request.getToDate()!=null){

                predicates.add(cb.lessThanOrEqualTo(
                        root.get("loanDate"),
                        request.getToDate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}