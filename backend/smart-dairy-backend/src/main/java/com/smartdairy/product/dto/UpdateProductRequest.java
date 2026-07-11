package com.smartdairy.product.dto;

import com.smartdairy.product.enums.ProductType;
import com.smartdairy.product.enums.UnitType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateProductRequest {

    @NotBlank
    private String productCode;

    @NotBlank
    private String productName;

    @NotNull
    private ProductType productType;

    @NotNull
    private UnitType unitType;

    private String description;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal purchasePrice;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal sellingPrice;

    @NotNull
    @DecimalMin("0.000")
    private BigDecimal minimumStock;

}