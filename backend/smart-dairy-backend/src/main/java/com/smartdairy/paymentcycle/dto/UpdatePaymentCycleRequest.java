package com.smartdairy.paymentcycle.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdatePaymentCycleRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String name;

    private String description;

    private Integer displayOrder;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
