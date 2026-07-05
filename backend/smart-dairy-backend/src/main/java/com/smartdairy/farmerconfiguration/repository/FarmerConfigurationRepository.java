package com.smartdairy.farmerconfiguration.repository;

import com.smartdairy.farmerconfiguration.entity.FarmerConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

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

}