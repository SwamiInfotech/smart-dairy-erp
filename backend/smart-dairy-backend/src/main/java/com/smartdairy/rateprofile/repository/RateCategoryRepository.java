package com.smartdairy.rateprofile.repository;

import com.smartdairy.rateprofile.entity.RateCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RateCategoryRepository extends JpaRepository<RateCategory, Long> {

    Optional<RateCategory> findByUuid(UUID uuid);

    Optional<RateCategory> findByCode(String code);

}