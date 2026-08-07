package com.smartdairy.settlement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class SettlementPrintRow {

    private String date;

    private String morningCollectionNo;

    private java.math.BigDecimal morningQty;

    private java.math.BigDecimal morningRate;

    private java.math.BigDecimal morningAmount;

    private String eveningCollectionNo;

    private java.math.BigDecimal eveningQty;

    private java.math.BigDecimal eveningRate;

    private java.math.BigDecimal eveningAmount;

    private java.math.BigDecimal totalMilk;

    private java.math.BigDecimal totalForDay;
}
