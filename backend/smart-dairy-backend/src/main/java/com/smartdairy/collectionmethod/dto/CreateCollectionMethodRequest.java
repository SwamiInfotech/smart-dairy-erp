package com.smartdairy.collectionmethod.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCollectionMethodRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String name;

    private String description;

    private Integer displayOrder;
}
