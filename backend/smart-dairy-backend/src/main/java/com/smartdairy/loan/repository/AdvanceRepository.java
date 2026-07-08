package com.smartdairy.loan.repository;

import com.smartdairy.loan.enums.AdvanceStatus;
import com.smartdairy.loan.entity.Advance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface AdvanceRepository extends JpaRepository<Advance, Long>, JpaSpecificationExecutor<Advance> {
    Optional<Advance> findByUuid(UUID uuid);

    boolean existsByAdvanceNo(String advanceNo);

    @Query("""
            SELECT COALESCE(SUM(a.advanceAmount), 0)
            FROM Advance a
            WHERE a.farmer.uuid = :farmerUuid
            AND a.status = :status
            """)
    BigDecimal getApprovedAdvanceAmount(UUID farmerUuid, AdvanceStatus status);

    default BigDecimal getApprovedAdvanceAmount(UUID farmerUuid) {
        return getApprovedAdvanceAmount(farmerUuid, AdvanceStatus.APPROVED);
    }
}