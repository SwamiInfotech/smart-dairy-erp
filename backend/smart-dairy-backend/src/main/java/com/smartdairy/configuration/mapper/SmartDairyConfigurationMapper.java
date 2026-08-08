package com.smartdairy.configuration.mapper;

import com.smartdairy.configuration.dto.SmartDairyConfigurationResponse;
import com.smartdairy.configuration.entity.SmartDairyConfiguration;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class SmartDairyConfigurationMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public SmartDairyConfigurationResponse toResponse(SmartDairyConfiguration entity) {
        if (entity == null) {
            return null;
        }

        return SmartDairyConfigurationResponse.builder()
                .uuid(entity.getUuid().toString())
                .collectionFat(entity.getCollectionFat())
                .collectionSnf(entity.getCollectionSnf())
                .collectionMava(entity.getCollectionMava())
                .morningCollectionLimit(entity.getMorningCollectionLimit())
                .eveningCollectionLimit(entity.getEveningCollectionLimit())
                .allowMultipleCollection(entity.getAllowMultipleCollection())
                .allowLoan(entity.getAllowLoan())
                .allowAdvance(entity.getAllowAdvance())
                .allowLoanAndAdvanceTogether(entity.getAllowLoanAndAdvanceTogether())
                .dailyPayment(entity.getDailyPayment())
                .weeklyPayment(entity.getWeeklyPayment())
                .monthlyPayment(entity.getMonthlyPayment())
                .allowBackdatedEntry(entity.getAllowBackdatedEntry())
                .maxBackdatedDays(entity.getMaxBackdatedDays())
                .autoLock(entity.getAutoLock())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt().format(FORMATTER))
                .updatedAt(entity.getUpdatedAt().format(FORMATTER))
                .build();
    }
}
