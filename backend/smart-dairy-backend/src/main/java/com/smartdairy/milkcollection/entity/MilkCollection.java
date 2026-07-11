package com.smartdairy.milkcollection.entity;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.collectionmethod.entity.CollectionMethod;
import com.smartdairy.common.entity.BaseEntity;
import com.smartdairy.common.enums.EntrySource;
import com.smartdairy.common.enums.EntryType;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmerconfiguration.entity.FarmerConfiguration;
import com.smartdairy.master.entity.MilkType;
import com.smartdairy.milkrate.entity.MilkRateChart;
import com.smartdairy.shift.entity.Shift;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(
        name = "milk_collection",
        indexes = {
                @Index(name = "idx_mc_farmer_date", columnList = "farmer_id, collection_date"),
                @Index(name = "idx_mc_collection_no", columnList = "collection_no")
        }
)
public class MilkCollection extends BaseEntity {

    @Column(name = "collection_no", nullable = false, unique = true, length = 30)
    private String collectionNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_configuration_id", nullable = false)
    private FarmerConfiguration farmerConfiguration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milk_rate_chart_id", nullable = false)
    private MilkRateChart milkRateChart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milk_type_id", nullable = false)
    private MilkType milkType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_method_id", nullable = false)
    private CollectionMethod collectionMethod;

    @Column(name = "collection_date", nullable = false)
    private LocalDate collectionDate;

    @Column(name = "collection_time", nullable = false)
    private LocalTime collectionTime;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(precision = 4, scale = 2)
    private BigDecimal fat;

    @Column(precision = 4, scale = 2)
    private BigDecimal snf;

    @Column(precision = 6, scale = 2)
    private BigDecimal mava;

    @Column(name = "calculated_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal calculatedRate;

    @Column(name = "gross_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false, length = 20)
    private EntryType entryType;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_source", nullable = false, length = 20)
    private EntrySource entrySource;

    @Column(nullable = false)
    private Boolean locked = false;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "active", nullable = false)
    private Boolean active = Boolean.TRUE;

}