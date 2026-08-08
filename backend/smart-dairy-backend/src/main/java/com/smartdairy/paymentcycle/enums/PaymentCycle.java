package com.smartdairy.paymentcycle.enums;

public enum PaymentCycle {
    DAILY,
    WEEKLY,
    MONTHLY,
    EVERY_2_DAYS(2),
    EVERY_3_DAYS(3),
    EVERY_4_DAYS(4),
    EVERY_5_DAYS(5),
    EVERY_6_DAYS(6),
    EVERY_7_DAYS(7),
    EVERY_8_DAYS(8),
    EVERY_9_DAYS(9),
    EVERY_10_DAYS(10),
    EVERY_11_DAYS(11),
    EVERY_12_DAYS(12),
    EVERY_13_DAYS(13),
    EVERY_14_DAYS(14),
    EVERY_15_DAYS(15),
    EVERY_16_DAYS(16),
    EVERY_17_DAYS(17),
    EVERY_18_DAYS(18),
    EVERY_19_DAYS(19),
    EVERY_20_DAYS(20),
    EVERY_21_DAYS(21),
    EVERY_22_DAYS(22),
    EVERY_23_DAYS(23),
    EVERY_24_DAYS(24),
    EVERY_25_DAYS(25),
    EVERY_26_DAYS(26),
    EVERY_27_DAYS(27),
    EVERY_28_DAYS(28),
    EVERY_29_DAYS(29),
    EVERY_30_DAYS(30);

    private final Integer days;

    PaymentCycle() {
        this.days = null;
    }

    PaymentCycle(Integer days) {
        this.days = days;
    }

    public Integer getDays() {
        return days;
    }
}
