package com.smartdairy.configuration.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSmartDairyConfigurationRequest {

    // Milk Collection Settings
    @NotNull(message = "Collection FAT flag is required")
    private Boolean collectionFat;

    @NotNull(message = "Collection MAVA flag is required")
    private Boolean collectionMava;

    @NotNull(message = "Morning collection limit is required")
    @Min(value = 1, message = "Morning collection limit must be at least 1")
    private Integer morningCollectionLimit;

    @NotNull(message = "Evening collection limit is required")
    @Min(value = 1, message = "Evening collection limit must be at least 1")
    private Integer eveningCollectionLimit;

    @NotNull(message = "Allow multiple collection flag is required")
    private Boolean allowMultipleCollection;

    // Farmer Finance Settings
    @NotNull(message = "Allow loan flag is required")
    private Boolean allowLoan;

    @NotNull(message = "Allow advance flag is required")
    private Boolean allowAdvance;

    @NotNull(message = "Allow loan and advance together flag is required")
    private Boolean allowLoanAndAdvanceTogether;

    // Payment Settings
    @NotNull(message = "Daily payment flag is required")
    private Boolean dailyPayment;

    @NotNull(message = "Weekly payment flag is required")
    private Boolean weeklyPayment;

    @NotNull(message = "Monthly payment flag is required")
    private Boolean monthlyPayment;

    // Backdated Collection Settings
    @NotNull(message = "Allow backdated entry flag is required")
    private Boolean allowBackdatedEntry;

    @NotNull(message = "Maximum backdated days is required")
    @Min(value = 1, message = "Maximum backdated days must be at least 1")
    private Integer maxBackdatedDays;

    // Collection Lock Settings
    @NotNull(message = "Auto lock flag is required")
    private Boolean autoLock;
}
