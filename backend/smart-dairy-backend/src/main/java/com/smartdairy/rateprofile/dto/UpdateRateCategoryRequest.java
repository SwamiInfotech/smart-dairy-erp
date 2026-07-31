package com.smartdairy.rateprofile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateRateCategoryRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String name;

    private String description;

    private Integer displayOrder;
}
