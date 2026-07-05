package com.smartdairy.farmer.entity;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "farmer")
public class Farmer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "farmer_code", nullable = false, length = 20)
    private String farmerCode;

    @Column(name = "farmer_name", nullable = false, length = 150)
    private String farmerName;

    @Column(name = "mobile_no", length = 20)
    private String mobileNo;

    @Column(name = "alternate_mobile_no", length = 20)
    private String alternateMobileNo;

    @Column(length = 100)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 100)
    private String village;

    @Column(length = 100)
    private String taluka;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String state;

    @Column(length = 10)
    private String pincode;

    @Column(name = "aadhar_no", length = 20)
    private String aadharNo;

    @Column(name = "pan_no", length = 20)
    private String panNo;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(nullable = false)
    private Boolean active = true;
}