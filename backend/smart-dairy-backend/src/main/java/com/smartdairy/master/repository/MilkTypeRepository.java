package com.smartdairy.master.repository;

import com.smartdairy.master.entity.MilkType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MilkTypeRepository extends JpaRepository<MilkType, Long> {

    Optional<MilkType> findByUuid(UUID uuid);

    Optional<MilkType> findByCode(String code);

}