package com.smartdairy.farmerconfiguration.repository;

import com.smartdairy.farmerconfiguration.entity.FarmerConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface FarmerConfigurationRepository extends JpaRepository<FarmerConfiguration, Long> {

    Optional<FarmerConfiguration> findByUuid(UUID uuid);

    Optional<FarmerConfiguration> findByFarmerIdAndActiveTrue(Long farmerId);

    Optional<FarmerConfiguration> findByFarmerIdAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqual(
            Long farmerId,
            LocalDate from,
            LocalDate to);

    @Query("""
            SELECT fc
            FROM FarmerConfiguration fc
            WHERE fc.farmer.id = :farmerId
            AND :collectionDate >= fc.effectiveFrom
            AND (
                    fc.effectiveTo IS NULL
                    OR :collectionDate <= fc.effectiveTo
                )
            """)
    Optional<FarmerConfiguration> findApplicableConfiguration(Long farmerId, LocalDate collectionDate);

}