package com.smartdairy.configuration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmartDairyConfigurationResponse {

    private String uuid;

    // Milk Collection Settings
    private Boolean collectionFat;
    private Boolean collectionSnf;
    private Boolean collectionMava;
    private Integer morningCollectionLimit;
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
    private Integer maxBackdatedDays;

    // Collection Lock Settings
    private Boolean autoLock;

    // Common Fields
    private Boolean active;
    private String createdAt;
    private String updatedAt;
}
