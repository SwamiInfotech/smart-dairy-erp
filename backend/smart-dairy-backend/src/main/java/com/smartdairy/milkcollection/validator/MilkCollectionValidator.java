package com.smartdairy.milkcollection.validator;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.milkcollection.dto.CreateMilkCollectionRequest;
import com.smartdairy.milkcollection.dto.UpdateMilkCollectionRequest;
import org.springframework.stereotype.Component;

@Component
public class MilkCollectionValidator {

    public void validate(CreateMilkCollectionRequest request) {

        boolean fatCollection =
                request.fat() != null || request.snf() != null;

        boolean mavaCollection =
                request.mava() != null;

        if (fatCollection && mavaCollection) {
            throw new BusinessException(
                    "Either FAT/SNF or MAVA should be provided, not both.");
        }

        if (!fatCollection && !mavaCollection) {
            throw new BusinessException(
                    "Either FAT/SNF or MAVA is mandatory.");
        }

        if (fatCollection) {

            if (request.fat() == null) {
                throw new BusinessException("FAT is mandatory.");
            }

            if (request.snf() == null) {
                throw new BusinessException("SNF is mandatory.");
            }
        }
    }

    public void validate(UpdateMilkCollectionRequest request) {

        boolean fatCollection =
                request.fat() != null || request.snf() != null;

        boolean mavaCollection =
                request.mava() != null;

        if (fatCollection && mavaCollection) {
            throw new BusinessException(
                    "Either FAT/SNF or MAVA should be provided, not both.");
        }

        if (!fatCollection && !mavaCollection) {
            throw new BusinessException(
                    "Either FAT/SNF or MAVA is mandatory.");
        }

        if (fatCollection) {

            if (request.fat() == null) {
                throw new BusinessException("FAT is mandatory.");
            }

            if (request.snf() == null) {
                throw new BusinessException("SNF is mandatory.");
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
