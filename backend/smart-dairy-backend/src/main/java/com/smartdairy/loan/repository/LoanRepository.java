package com.smartdairy.loan.repository;

import com.smartdairy.loan.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface LoanRepository extends JpaRepository<Loan, Long>, JpaSpecificationExecutor<Loan> {
    Optional<Loan> findByUuid(UUID uuid);

    boolean existsByLoanNo(String loanNo);

    @Query("""
            SELECT COALESCE(SUM(l.loanAmount), 0)
            FROM Loan l
            WHERE l.farmer.uuid = :farmerUuid
            AND l.status = com.smartdairy.loan.enums.LoanStatus.APPROVED
            """)
    BigDecimal getApprovedLoanAmount(UUID farmerUuid);
}