package com.smartdairy.loan.repository;

import com.smartdairy.loan.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface LoanRepository extends JpaRepository<Loan, Long>, JpaSpecificationExecutor<Loan> {
    Optional<Loan> findByUuid(UUID uuid);
    boolean existsByLoanNo(String loanNo);
}