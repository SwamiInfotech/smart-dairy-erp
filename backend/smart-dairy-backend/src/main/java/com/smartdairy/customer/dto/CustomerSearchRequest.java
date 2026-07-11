package com.smartdairy.customer.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerSearchRequest {

    private String customerCode;

    private String customerName;

    private String mobileNo;

    private String city;

    private Boolean active;

}