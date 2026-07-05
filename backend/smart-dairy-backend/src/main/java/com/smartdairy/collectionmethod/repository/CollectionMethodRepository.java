package com.smartdairy.collectionmethod.repository;

import com.smartdairy.collectionmethod.entity.CollectionMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CollectionMethodRepository extends JpaRepository<CollectionMethod, Long> {

    Optional<CollectionMethod> findByUuid(UUID uuid);

    Optional<CollectionMethod> findByCode(String code);

}