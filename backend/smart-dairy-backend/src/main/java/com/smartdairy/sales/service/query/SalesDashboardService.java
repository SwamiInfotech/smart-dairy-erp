package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.SalesDashboardResponse;

import java.time.LocalDate;

public interface SalesDashboardService {

    SalesDashboardResponse dashboard(LocalDate fromDate, LocalDate toDate);

}