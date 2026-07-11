package com.smartdairy.production.validator;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.production.dto.CreateProductionBatchRequest;
import com.smartdairy.production.enums.ProductionItemType;
import org.springframework.stereotype.Component;

@Component
public class ProductionBatchValidator {

    public void validate(CreateProductionBatchRequest request) {

        boolean inputFound = request.items()
                .stream()
                .anyMatch(item -> item.itemType() == ProductionItemType.CONSUME);

        if (!inputFound) {
            throw new BusinessException(
                    "At least one input product is required.");
        }

        boolean outputFound = request.items()
                .stream()
                .anyMatch(item -> item.itemType() == ProductionItemType.PRODUCE);

        if (!outputFound) {
            throw new BusinessException(
                    "At least one output product is required.");
        }

        request.items().forEach(item -> {

            if (item.quantity().signum() <= 0) {
                throw new BusinessException(
                        "Quantity must be greater than zero.");
            }

        });
    }
}