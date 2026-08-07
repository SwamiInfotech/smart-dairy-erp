package com.smartdairy.configuration.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSmartDairyConfigurationRequest {

    // Milk Collection Settings
    private Boolean collectionFat;
    private Boolean collectionMava;

    @Min(value = 1, message = "Morning collection limit must be at least 1")
    private Integer morningCollectionLimit;

    @Min(value = 1, message = "Evening collection limit must be at least 1")
    private Integer eveningCollectionLimit;

    private Boolean allowMultipleCollection;

    // Farmer Finance Settings
    private Boolean allowLoan;
    private Boolean allowAdvance;
    private Boolean allowLoanAndAdvanceTogether;

    // Payment Settings
    private Boolean dailyPayment;
    private Boolean weeklyPayment;
    private Boolean monthlyPayment;

    // Backdated Collection Settings
    private Boolean allowBackdatedEntry;

    @Min(value = 1, message = "Maximum backdated days must be at least 1")
    private Integer maxBackdatedDays;

    // Collection Lock Settings
    private Boolean autoLock;
}
