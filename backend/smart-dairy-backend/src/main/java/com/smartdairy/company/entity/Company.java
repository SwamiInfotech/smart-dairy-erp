package com.smartdairy.company.entity;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(
        name = "company",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_company_tenant_code", columnNames = {"tenant_uuid", "company_code"})
        }
)
public class Company extends BaseEntity {

    @Column(name = "company_code", nullable = false, length = 20)
    private String companyCode;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "owner_name", length = 150)
    private String ownerName;

    @Column(name = "mobile_no", length = 20)
    private String mobileNo;

    @Column(length = 100)
    private String email;

    @Column(name = "gst_no", length = 30)
    private String gstNo;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String country;

    @Column(length = 10)
    private String pincode;

    @Column(length = 255)
    private String logo;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(
            mappedBy = "company",
            cascade = CascadeType.ALL,
            orphanRemoval = false
    )
    private List<Branch> branches = new ArrayList<>();
}