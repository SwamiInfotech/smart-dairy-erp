package com.smartdairy.sales.dto;

import com.smartdairy.common.enums.PaymentMode;
import com.smartdairy.sales.enums.SalesStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class SalesInvoiceSearchRequest {

    private String invoiceNo;

    private String customerName;

    private PaymentMode paymentMode;

    private SalesStatus status;

    private LocalDate fromDate;

    private LocalDate toDate;

    private BigDecimal minimumAmount;

    private BigDecimal maximumAmount;

}