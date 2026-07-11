package com.smartdairy.sales.service;

import java.time.LocalDate;

public abstract class SalesInvoiceNumberGenerator {
    public abstract String generate(LocalDate invoiceDate);
}
