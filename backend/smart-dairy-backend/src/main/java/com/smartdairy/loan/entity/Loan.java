package com.smartdairy.loan.entity;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.common.entity.BaseEntity;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.loan.enums.LoanStatus;
import com.smartdairy.loan.enums.LoanType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "loan")
public class Loan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(name = "loan_no", nullable = false, unique = true, length = 30)
    private String loanNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "loan_type", nullable = false, length = 30)
    private LoanType loanType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LoanStatus status;

    @Column(name = "loan_date", nullable = false)
    private LocalDate loanDate;

    @Column(name = "sanctioned_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal sanctionedAmount;

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "tenure_months")
    private Integer tenureMonths;

    @Column(name = "installment_amount", precision = 12, scale = 2)
    private BigDecimal installmentAmount;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(nullable = false)
    private Boolean active = true;
}