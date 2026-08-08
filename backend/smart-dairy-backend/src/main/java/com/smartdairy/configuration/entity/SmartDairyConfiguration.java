package com.smartdairy.configuration.entity;

import com.smartdairy.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "smart_dairy_configuration")
public class SmartDairyConfiguration extends BaseEntity {

    // Milk Collection Settings
    @Column(name = "collection_fat", nullable = false)
    private Boolean collectionFat = true;

    @Column(name = "collection_snf", nullable = false)
    private Boolean collectionSnf = false;

    @Column(name = "collection_mava", nullable = false)
    private Boolean collectionMava = true;

    @Column(name = "morning_collection_limit", nullable = false)
    private Integer morningCollectionLimit = 1;

    @Column(name = "evening_collection_limit", nullable = false)
    private Integer eveningCollectionLimit = 1;

    @Column(name = "allow_multiple_collection", nullable = false)
    private Boolean allowMultipleCollection = false;

    // Farmer Finance Settings
    @Column(name = "allow_loan", nullable = false)
    private Boolean allowLoan = true;

    @Column(name = "allow_advance", nullable = false)
    private Boolean allowAdvance = true;

    @Column(name = "allow_loan_and_advance_together", nullable = false)
    private Boolean allowLoanAndAdvanceTogether = false;

    // Payment Settings
    @Column(name = "daily_payment", nullable = false)
    private Boolean dailyPayment = true;

    @Column(name = "weekly_payment", nullable = false)
    private Boolean weeklyPayment = true;

    @Column(name = "monthly_payment", nullable = false)
    private Boolean monthlyPayment = true;

    // Backdated Collection Settings
    @Column(name = "allow_backdated_entry", nullable = false)
    private Boolean allowBackdatedEntry = true;

    @Column(name = "max_backdated_days", nullable = false)
    private Integer maxBackdatedDays = 7;

    // Collection Lock Settings
    @Column(name = "auto_lock", nullable = false)
    private Boolean autoLock = false;
}
