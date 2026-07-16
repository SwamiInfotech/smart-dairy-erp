package com.smartdairy.customer.entity;

import com.smartdairy.common.entity.BaseEntity;

import com.smartdairy.common.enums.PaymentMode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(
        name = "customer_payment",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_customer_payment_tenant_no", columnNames = {"tenant_uuid", "payment_no"})
        }
)
public class CustomerPayment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "payment_no", nullable = false)
    private String paymentNo;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 30)
    private PaymentMode paymentMode;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "reference_no")
    private String referenceNo;

    @Column(name = "remarks")
    private String remarks;

}