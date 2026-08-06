package com.smartdairy.milkcollection.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateMilkCollectionBulkRequest(

        @NotEmpty
        List<@Valid CreateMilkCollectionRequest> entries

) {
}
