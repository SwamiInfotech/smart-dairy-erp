package com.smartdairy.farmerconfiguration.entity;

import com.smartdairy.collectionmethod.entity.CollectionMethod;
import com.smartdairy.common.entity.BaseEntity;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.master.entity.MilkType;
import com.smartdairy.paymentcycle.entity.PaymentCycle;
import com.smartdairy.rateprofile.entity.RateCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "farmer_configuration")
public class FarmerConfiguration extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private Farmer farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milk_type_id")
    private MilkType milkType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_method_id")
    private CollectionMethod collectionMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_cycle_id")
    private PaymentCycle paymentCycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rate_category_id")
    private RateCategory rateCategory;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(nullable = false)
    private Boolean active = true;

}