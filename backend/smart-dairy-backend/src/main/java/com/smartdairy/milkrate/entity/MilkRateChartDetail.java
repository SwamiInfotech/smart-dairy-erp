package com.smartdairy.milkrate.entity;

import com.smartdairy.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "milk_rate_chart_detail")
public class MilkRateChartDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milk_rate_chart_id")
    private MilkRateChart milkRateChart;

    @Column(name = "fat_from", precision = 4, scale = 2)
    private BigDecimal fatFrom;

    @Column(name = "fat_to", precision = 4, scale = 2)
    private BigDecimal fatTo;

    @Column(name = "snf_from", precision = 4, scale = 2)
    private BigDecimal snfFrom;

    @Column(name = "snf_to", precision = 4, scale = 2)
    private BigDecimal snfTo;

    @Column(name = "mava_from", precision = 6, scale = 2)
    private BigDecimal mavaFrom;

    @Column(name = "mava_to", precision = 6, scale = 2)
    private BigDecimal mavaTo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rate;

    @Column(name = "active", nullable = false)
    private Boolean active = Boolean.TRUE;

}