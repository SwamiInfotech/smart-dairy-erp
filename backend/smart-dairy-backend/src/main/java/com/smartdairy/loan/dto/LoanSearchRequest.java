package com.smartdairy.loan.dto;

import com.smartdairy.loan.enums.LoanStatus;
import com.smartdairy.loan.enums.LoanType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class LoanSearchRequest {
    private UUID farmerUuid;
    private UUID branchUuid;
    private LoanStatus status;
    private LoanType loanType;
    private LocalDate fromDate;
    private LocalDate toDate;
}