package com.smartdairy.farmer.repository;

import com.smartdairy.farmer.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {

    Optional<Farmer> findByUuid(UUID uuid);

    boolean existsByBranchIdAndFarmerCode(Long branchId, String farmerCode);

}