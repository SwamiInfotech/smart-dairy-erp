package com.smartdairy.sales.entity;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.common.entity.BaseEntity;
import com.smartdairy.common.enums.PaymentMode;
import com.smartdairy.sales.enums.SalesStatus;
import com.smartdairy.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "sales_invoice")
public class SalesInvoice extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "invoice_no", nullable = false, unique = true, length = 30)
    private String invoiceNo;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_mobile", length = 15)
    private String customerMobile;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 30)
    private PaymentMode paymentMode;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "net_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal netAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private SalesStatus status;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "locked", nullable = false)
    private Boolean locked = Boolean.FALSE;

    @OneToMany(
            mappedBy = "salesInvoice",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<SalesInvoiceItem> items = new ArrayList<>();

}