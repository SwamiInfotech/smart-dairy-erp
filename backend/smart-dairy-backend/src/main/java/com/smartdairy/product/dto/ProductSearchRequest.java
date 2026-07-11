package com.smartdairy.product.dto;

import com.smartdairy.product.enums.ProductType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSearchRequest {

    private String productCode;

    private String productName;

    private ProductType productType;

    private Boolean active;

}