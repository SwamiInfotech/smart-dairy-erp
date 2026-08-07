package com.smartdairy.settlement.service;

import java.util.UUID;

public interface GenerateSettlementPdfService {

    byte[] generatePdf(UUID settlementUuid);
}
