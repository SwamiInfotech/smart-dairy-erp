package com.smartdairy.farmer.service;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.dto.CreateFarmerRequest;
import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.mapper.FarmerMapper;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.paymentcycle.entity.PaymentCycle;
import com.smartdairy.paymentcycle.repository.PaymentCycleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UpdateFarmerService {

    private static final Pattern EVERY_DAYS_PATTERN = Pattern.compile("EVERY[_\\s-]?(\\d{1,2})[_\\s-]?DAYS?", Pattern.CASE_INSENSITIVE);

    private final FarmerRepository farmerRepository;
    private final BranchRepository branchRepository;
    private final FarmerMapper farmerMapper;
    private final PaymentCycleRepository paymentCycleRepository;
    private final FarmerConfigurationUpsertService farmerConfigurationUpsertService;
    private final FarmerResponseFactory farmerResponseFactory;

    public FarmerResponse update(UUID uuid, CreateFarmerRequest request) {
        log.info("Updating farmer with uuid={}.", uuid);

        Farmer farmer = farmerRepository.findByUuidAndActiveTrue(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));

        Branch branch = branchRepository.findByUuid(request.branchUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found."));

        if (farmerRepository.existsByBranchIdAndFarmerCodeAndUuidNot(branch.getId(), request.farmerCode(), uuid)) {
            throw new BusinessException("Farmer code already exists.");
        }

        farmerMapper.updateEntity(request, farmer);
        farmer.setBranch(branch);
        farmer.setBillingCycle(resolveBillingCycle(request));

        Farmer saved = farmerRepository.saveAndFlush(farmer);
        farmerConfigurationUpsertService.upsert(saved, request);

        return farmerResponseFactory.toResponse(saved);
    }

    private com.smartdairy.paymentcycle.enums.PaymentCycle resolveBillingCycle(CreateFarmerRequest request) {
        com.smartdairy.paymentcycle.enums.PaymentCycle fromPayload = parseBillingCycle(
                request.farmerConfiguration() != null
                        ? request.farmerConfiguration().billingCycle()
                        : request.billingCycle()
        );
        if (fromPayload != null) {
            return fromPayload;
        }

        UUID paymentCycleUuid = request.farmerConfiguration() != null
                && request.farmerConfiguration().paymentCycleUuid() != null
                ? request.farmerConfiguration().paymentCycleUuid()
                : request.paymentCycleUuid();

        if (paymentCycleUuid == null) {
            throw new BusinessException("Payment Cycle UUID is required.");
        }

        PaymentCycle paymentCycle = paymentCycleRepository.findByUuid(paymentCycleUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Payment Cycle not found."));

        com.smartdairy.paymentcycle.enums.PaymentCycle fromMasterCode = parseBillingCycle(paymentCycle.getCode());
        if (fromMasterCode != null) {
            return fromMasterCode;
        }

        com.smartdairy.paymentcycle.enums.PaymentCycle fromMasterName = parseBillingCycle(paymentCycle.getName());
        if (fromMasterName != null) {
            return fromMasterName;
        }

            throw new BusinessException("Payment Cycle code is not mapped to billing cycle enum: " + paymentCycle.getCode());
    }

    private com.smartdairy.paymentcycle.enums.PaymentCycle parseBillingCycle(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return null;
        }

        String normalized = raw.trim().toUpperCase().replace('-', '_').replace(' ', '_');
        Matcher matcher = EVERY_DAYS_PATTERN.matcher(normalized);
        if (matcher.find()) {
            int days = Integer.parseInt(matcher.group(1));
            if (days >= 2 && days <= 30) {
                normalized = "EVERY_" + days + "_DAYS";
            }
        }

        if ("DAILY".equals(normalized) || "WEEKLY".equals(normalized) || "MONTHLY".equals(normalized)) {
            return com.smartdairy.paymentcycle.enums.PaymentCycle.valueOf(normalized);
        }

        if (normalized.matches("EVERY_\\d{1,2}_DAYS")) {
            try {
                return com.smartdairy.paymentcycle.enums.PaymentCycle.valueOf(normalized);
            } catch (IllegalArgumentException ignored) {
                return null;
            }
        }

        return null;
    }
}
