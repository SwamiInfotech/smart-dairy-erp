package com.smartdairy.branch.entity;

import com.smartdairy.common.entity.BaseEntity;
import com.smartdairy.company.entity.Company;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "branch")
@Getter
@Setter
public class Branch extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 20)
    private String branchCode;

    @Column(nullable = false, length = 150)
    private String branchName;

    private String managerName;

    private String mobileNo;

    private String email;

    private String address;

    private String city;

    private String state;

    private String country;

    private String pincode;

    @Column(nullable = false)
    private Boolean active = true;
}