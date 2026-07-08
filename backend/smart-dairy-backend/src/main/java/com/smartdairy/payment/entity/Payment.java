package com.smartdairy.payment.entity;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.common.entity.BaseEntity;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.payment.enums.PaymentMode;
import com.smartdairy.settlement.entity.Settlement;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "payment")
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settlement_id", nullable = false, unique = true)
    private Settlement settlement;

    @Column(name = "payment_no", nullable = false, unique = true, length = 30)
    private String paymentNo;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paidAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 20)
    private PaymentMode paymentMode;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(nullable = false)
    private Boolean active = true;
}