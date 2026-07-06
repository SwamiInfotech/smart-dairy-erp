package com.smartdairy.milkcollection.repository;

import com.smartdairy.milkcollection.entity.MilkCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MilkCollectionRepository extends JpaRepository<MilkCollection, Long> {

    Optional<MilkCollection> findByUuid(UUID uuid);

    Optional<MilkCollection> findByCollectionNo(String collectionNo);

}