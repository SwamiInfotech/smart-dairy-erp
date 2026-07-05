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
    @JoinColumn(name = "milk_rate_chart_id", nullable = false)
    private MilkRateChart milkRateChart;

    @Column(precision = 4, scale = 2)
    private BigDecimal fat;

    @Column(precision = 4, scale = 2)
    private BigDecimal snf;

    @Column(precision = 6, scale = 2)
    private BigDecimal mava;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rate;
}