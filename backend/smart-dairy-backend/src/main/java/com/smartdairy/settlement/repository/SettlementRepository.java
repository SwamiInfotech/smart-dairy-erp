package com.smartdairy.settlement.repository;

import com.smartdairy.settlement.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface SettlementRepository extends JpaRepository<Settlement, Long>,
        JpaSpecificationExecutor<Settlement> {

    Optional<Settlement> findByUuid(UUID uuid);

    boolean existsBySettlementNo(String settlementNo);

    @Query("""
            SELECT COALESCE(SUM(s.loanRecovery),0)
            FROM Settlement s
            WHERE s.farmer.uuid = :farmerUuid
            AND s.status IN (com.smartdairy.settlement.enums.SettlementStatus.GENERATED,
            com.smartdairy.settlement.enums.SettlementStatus.PAID )
            """)
    BigDecimal getRecoveredLoanAmount(UUID farmerUuid);

    @Query("""
            SELECT COALESCE(SUM(s.advanceRecovery),0)
            FROM Settlement s
            WHERE s.farmer.uuid = :farmerUuid
            AND s.status IN (com.smartdairy.settlement.enums.SettlementStatus.GENERATED,
            com.smartdairy.settlement.enums.SettlementStatus.PAID )
            """)
    BigDecimal getRecoveredAdvanceAmount(UUID farmerUuid);
}