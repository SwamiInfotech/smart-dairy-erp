package com.smartdairy.milkcollection.validator;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.milkcollection.dto.CreateMilkCollectionRequest;
import com.smartdairy.milkcollection.dto.UpdateMilkCollectionRequest;
import org.springframework.stereotype.Component;

@Component
public class MilkCollectionValidator {

    public void validate(CreateMilkCollectionRequest request) {

        if (request.loan() != null && request.loan().signum() < 0) {
            throw new BusinessException("Loan cannot be negative.");
        }

        if (request.advance() != null && request.advance().signum() < 0) {
            throw new BusinessException("Advance cannot be negative.");
        }

        boolean fatCollection = request.fat() != null;

        boolean mavaCollection =
                request.mava() != null;

        if (fatCollection && mavaCollection) {
            throw new BusinessException(
                    "Either FAT or MAVA should be provided, not both.");
        }

        if (!fatCollection && !mavaCollection) {
            throw new BusinessException(
                    "Either FAT or MAVA is mandatory.");
        }

        if (fatCollection) {

            if (request.fat() == null) {
                throw new BusinessException("FAT is mandatory.");
            }
        }
    }

    public void validate(UpdateMilkCollectionRequest request) {

        if (request.loan() != null && request.loan().signum() < 0) {
            throw new BusinessException("Loan cannot be negative.");
        }

        if (request.advance() != null && request.advance().signum() < 0) {
            throw new BusinessException("Advance cannot be negative.");
        }

        boolean fatCollection = request.fat() != null;

        boolean mavaCollection =
                request.mava() != null;

        if (fatCollection && mavaCollection) {
            throw new BusinessException(
                    "Either FAT or MAVA should be provided, not both.");
        }

        if (!fatCollection && !mavaCollection) {
            throw new BusinessException(
                    "Either FAT or MAVA is mandatory.");
        }

        if (fatCollection) {

            if (request.fat() == null) {
                throw new BusinessException("FAT is mandatory.");
            }
        }
    }


    public boolean isFatCollection(CreateMilkCollectionRequest request) {
        return request.fat() != null;
    }

    public boolean isFatCollection(UpdateMilkCollectionRequest request) {
        return request.fat() != null;
    }
}
