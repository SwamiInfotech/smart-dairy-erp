package com.smartdairy.milkcollection.repository;

import com.smartdairy.milkcollection.dto.DailyMilkCollectionSummaryResponse;
import com.smartdairy.milkcollection.entity.MilkCollection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface MilkCollectionRepository extends JpaRepository<MilkCollection, Long>, JpaSpecificationExecutor<MilkCollection> {

    Optional<MilkCollection> findByUuid(UUID uuid);

    Optional<MilkCollection> findByCollectionNo(String collectionNo);

    @Query("""
            SELECT new com.smartdairy.milkcollection.dto.DailyMilkCollectionSummaryResponse(
            
                m.collectionDate,
            
                COUNT(m),
            
                COALESCE(SUM(m.quantity),0),
            
                COALESCE(SUM(m.grossAmount),0),
            
                COALESCE(AVG(m.fat),0),
            
                COALESCE(AVG(m.snf),0),
            
                COALESCE(AVG(m.mava),0)
            
            )
            FROM MilkCollection m
            WHERE m.collectionDate = :collectionDate
            GROUP BY m.collectionDate
            """)
    Optional<DailyMilkCollectionSummaryResponse> getDailySummary(LocalDate collectionDate);

}