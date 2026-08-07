package com.smartdairy.settlement.service.impl;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.milkcollection.entity.MilkCollection;
import com.smartdairy.milkcollection.repository.MilkCollectionRepository;
import com.smartdairy.settlement.dto.SettlementPrintRow;
import com.smartdairy.settlement.entity.Settlement;
import com.smartdairy.settlement.repository.SettlementRepository;
import com.smartdairy.settlement.service.GenerateSettlementPdfService;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GenerateSettlementPdfServiceImpl implements GenerateSettlementPdfService {

    private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter DISPLAY_DATE_TIME = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    private final SettlementRepository settlementRepository;
    private final MilkCollectionRepository milkCollectionRepository;
    private final ResourceLoader resourceLoader;

    @Override
    public byte[] generatePdf(java.util.UUID settlementUuid) {
        Settlement settlement = settlementRepository.findByUuidAndActiveTrue(settlementUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found."));

        List<MilkCollection> collections = milkCollectionRepository.findForSettlementPrint(
                settlement.getFarmer().getUuid(),
                settlement.getFromDate(),
                settlement.getToDate());

        List<SettlementPrintRow> rows = buildDualRows(collections);

        BigDecimal morningQtyTotal = rows.stream().map(SettlementPrintRow::getMorningQty).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal morningAmountTotal = rows.stream().map(SettlementPrintRow::getMorningAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal eveningQtyTotal = rows.stream().map(SettlementPrintRow::getEveningQty).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal eveningAmountTotal = rows.stream().map(SettlementPrintRow::getEveningAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal grandQtyTotal = rows.stream().map(SettlementPrintRow::getTotalMilk).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal grandAmountTotal = rows.stream().map(SettlementPrintRow::getTotalForDay).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("billNo", settlement.getSettlementNo());
        parameters.put("farmerName", settlement.getFarmer().getFarmerName());
        parameters.put("farmerCode", settlement.getFarmer().getFarmerCode());
        parameters.put("branchName", settlement.getBranch().getBranchName());
        parameters.put("milkType", "All Milk Types");
        parameters.put("fromDate", DISPLAY_DATE.format(settlement.getFromDate()));
        parameters.put("toDate", DISPLAY_DATE.format(settlement.getToDate()));
        parameters.put("generatedAt", DISPLAY_DATE_TIME.format(LocalDateTime.now()));
        parameters.put("collectionsFound", collections.size());
        parameters.put("morningQtyTotal", morningQtyTotal);
        parameters.put("morningRateAvg", averageRate(morningAmountTotal, morningQtyTotal));
        parameters.put("morningAmountTotal", morningAmountTotal);
        parameters.put("eveningQtyTotal", eveningQtyTotal);
        parameters.put("eveningRateAvg", averageRate(eveningAmountTotal, eveningQtyTotal));
        parameters.put("eveningAmountTotal", eveningAmountTotal);
        parameters.put("totalQty", grandQtyTotal);
        parameters.put("totalAmount", grandAmountTotal);
        parameters.put("netPayable", normalize(settlement.getNetPayable()));
        parameters.put("status", settlement.getStatus() == null ? "GENERATED" : settlement.getStatus().name());

        Resource template = resourceLoader.getResource("classpath:reports/settlement-bill.jrxml");

        try (InputStream inputStream = template.getInputStream()) {
            JasperReport report = JasperCompileManager.compileReport(inputStream);
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(rows);
            JasperPrint jasperPrint = JasperFillManager.fillReport(report, parameters, dataSource);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        } catch (IOException | JRException exception) {
            throw new IllegalStateException("Unable to generate settlement PDF.", exception);
        }
    }

    private List<SettlementPrintRow> buildDualRows(List<MilkCollection> collections) {
        Map<LocalDate, List<MilkCollection>> morningByDate = new HashMap<>();
        Map<LocalDate, List<MilkCollection>> eveningByDate = new HashMap<>();

        for (MilkCollection item : collections) {
            LocalDate dateKey = item.getCollectionDate();
            if (isMorningShift(item)) {
                morningByDate.computeIfAbsent(dateKey, ignored -> new ArrayList<>()).add(item);
            } else {
                eveningByDate.computeIfAbsent(dateKey, ignored -> new ArrayList<>()).add(item);
            }
        }

        Set<LocalDate> allDates = new TreeSet<>();
        allDates.addAll(morningByDate.keySet());
        allDates.addAll(eveningByDate.keySet());

        List<SettlementPrintRow> rows = new ArrayList<>();

        for (LocalDate date : allDates) {
            List<MilkCollection> morningRows = morningByDate.getOrDefault(date, List.of());
            List<MilkCollection> eveningRows = eveningByDate.getOrDefault(date, List.of());
            int rowCount = Math.max(morningRows.size(), eveningRows.size());

            for (int index = 0; index < rowCount; index += 1) {
                MilkCollection morning = index < morningRows.size() ? morningRows.get(index) : null;
                MilkCollection evening = index < eveningRows.size() ? eveningRows.get(index) : null;

                BigDecimal morningQty = normalize(morning == null ? null : morning.getQuantity());
                BigDecimal morningAmount = normalize(morning == null ? null : morning.getGrossAmount());
                BigDecimal eveningQty = normalize(evening == null ? null : evening.getQuantity());
                BigDecimal eveningAmount = normalize(evening == null ? null : evening.getGrossAmount());

                rows.add(new SettlementPrintRow(
                        DISPLAY_DATE.format(date),
                        morning == null ? "-" : safeText(morning.getCollectionNo()),
                        morningQty,
                        averageRate(morningAmount, morningQty),
                        morningAmount,
                        evening == null ? "-" : safeText(evening.getCollectionNo()),
                        eveningQty,
                        averageRate(eveningAmount, eveningQty),
                        eveningAmount,
                        morningQty.add(eveningQty),
                        morningAmount.add(eveningAmount)
                ));
            }
        }

        return rows;
    }

    private boolean isMorningShift(MilkCollection item) {
        String shiftName = "";
        String shiftCode = "";

        if (item.getShift() != null) {
            shiftName = safeText(item.getShift().getName()).toLowerCase();
            shiftCode = safeText(item.getShift().getCode()).toLowerCase();
        }

        if (shiftName.contains("morning") || "m".equals(shiftCode)) {
            return true;
        }

        if (item.getCollectionTime() != null) {
            return item.getCollectionTime().getHour() < 12;
        }

        return false;
    }

    private BigDecimal averageRate(BigDecimal amount, BigDecimal qty) {
        BigDecimal safeQty = normalize(qty);
        if (safeQty.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return normalize(amount).divide(safeQty, 2, RoundingMode.HALF_UP);
    }

    private String safeText(String value) {
        if (value == null || value.isBlank()) {
            return "-";
        }
        return value;
    }

    private BigDecimal normalize(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
