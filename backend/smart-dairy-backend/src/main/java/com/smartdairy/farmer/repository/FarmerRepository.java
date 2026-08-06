package com.smartdairy.farmer.repository;

import com.smartdairy.farmer.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {

    Optional<Farmer> findByUuid(UUID uuid);

    Optional<Farmer> findByUuidAndActiveTrue(UUID uuid);

    List<Farmer> findByActiveTrue();

    boolean existsByBranchIdAndFarmerCode(Long branchId, String farmerCode);

    boolean existsByBranchIdAndFarmerCodeAndUuidNot(Long branchId, String farmerCode, UUID uuid);

}