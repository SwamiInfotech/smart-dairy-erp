package com.smartdairy.settlement.entity;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.common.entity.BaseEntity;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.settlement.enums.SettlementStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(
        name = "settlement",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_settlement_tenant_no", columnNames = {"tenant_uuid", "settlement_no"})
        },
        indexes = {
                @Index(name = "idx_settlement_farmer", columnList = "farmer_id"),
                @Index(name = "idx_settlement_period", columnList = "from_date,to_date")
        }
)
public class Settlement extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(name = "settlement_no", nullable = false, length = 30)
    private String settlementNo;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(name = "milk_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal milkAmount = BigDecimal.ZERO;

    @Column(name = "bonus_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal bonusAmount = BigDecimal.ZERO;

    @Column(name = "loan_recovery", nullable = false, precision = 12, scale = 2)
    private BigDecimal loanRecovery = BigDecimal.ZERO;

    @Column(name = "advance_recovery", nullable = false, precision = 12, scale = 2)
    private BigDecimal advanceRecovery = BigDecimal.ZERO;

    @Column(name = "other_deduction", nullable = false, precision = 12, scale = 2)
    private BigDecimal otherDeduction = BigDecimal.ZERO;

    @Column(name = "net_payable", nullable = false, precision = 12, scale = 2)
    private BigDecimal netPayable = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SettlementStatus status;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}