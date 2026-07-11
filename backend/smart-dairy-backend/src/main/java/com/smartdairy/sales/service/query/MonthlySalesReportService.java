package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.MonthlySalesReportResponse;

import java.util.List;

public interface MonthlySalesReportService {

    List<MonthlySalesReportResponse> report();

}