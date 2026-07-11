package com.smartdairy.sales.service;

import com.smartdairy.sales.entity.SalesInvoice;

public interface SalesCalculationService {

    void calculate(SalesInvoice invoice);

}