package com.smartdairy.shift.repository;

import com.smartdairy.shift.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ShiftRepository extends JpaRepository<Shift, Long> {

    Optional<Shift> findByUuid(UUID uuid);

    Optional<Shift> findByCode(String code);

}