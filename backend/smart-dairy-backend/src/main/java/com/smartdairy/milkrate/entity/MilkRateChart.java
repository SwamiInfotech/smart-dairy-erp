package com.smartdairy.milkrate.entity;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.collectionmethod.entity.CollectionMethod;
import com.smartdairy.common.entity.BaseEntity;
import com.smartdairy.rateprofile.entity.RateCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "milk_rate_chart")
public class MilkRateChart extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rate_category_id", nullable = false)
    private RateCategory rateCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_method_id", nullable = false)
    private CollectionMethod collectionMethod;

    @Column(name = "chart_name", nullable = false)
    private String chartName;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "milkRateChart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MilkRateChartDetail> details = new ArrayList<>();

}