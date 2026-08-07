package com.smartdairy.configuration.service.impl;

import com.smartdairy.configuration.dto.CreateSmartDairyConfigurationRequest;
import com.smartdairy.configuration.dto.SmartDairyConfigurationResponse;
import com.smartdairy.configuration.dto.UpdateSmartDairyConfigurationRequest;
import com.smartdairy.configuration.entity.SmartDairyConfiguration;
import com.smartdairy.configuration.mapper.SmartDairyConfigurationMapper;
import com.smartdairy.configuration.repository.SmartDairyConfigurationRepository;
import com.smartdairy.configuration.service.SmartDairyConfigurationService;
import com.smartdairy.tenant.context.TenantContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class SmartDairyConfigurationServiceImpl implements SmartDairyConfigurationService {

    private final SmartDairyConfigurationRepository repository;
    private final SmartDairyConfigurationMapper mapper;

    @Override
    public SmartDairyConfigurationResponse create(CreateSmartDairyConfigurationRequest request) {
        log.info("Creating Smart Dairy Configuration");

        // Check if configuration already exists for this tenant
        UUID tenantUuid = TenantContextHolder.getTenantUuid();
        if (repository.findByTenantUuidAndActive(tenantUuid).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Configuration already exists for this tenant");
        }

        SmartDairyConfiguration configuration = new SmartDairyConfiguration();
        configuration.setCollectionFat(request.getCollectionFat());
        configuration.setCollectionMava(request.getCollectionMava());
        configuration.setMorningCollectionLimit(request.getMorningCollectionLimit());
        configuration.setEveningCollectionLimit(request.getEveningCollectionLimit());
        configuration.setAllowMultipleCollection(request.getAllowMultipleCollection());
        configuration.setAllowLoan(request.getAllowLoan());
        configuration.setAllowAdvance(request.getAllowAdvance());
        configuration.setAllowLoanAndAdvanceTogether(request.getAllowLoanAndAdvanceTogether());
        configuration.setDailyPayment(request.getDailyPayment());
        configuration.setWeeklyPayment(request.getWeeklyPayment());
        configuration.setMonthlyPayment(request.getMonthlyPayment());
        configuration.setAllowBackdatedEntry(request.getAllowBackdatedEntry());
        configuration.setMaxBackdatedDays(request.getMaxBackdatedDays());
        configuration.setAutoLock(request.getAutoLock());
        configuration.setActive(true);

        SmartDairyConfiguration saved = repository.save(configuration);
        log.info("Smart Dairy Configuration created with UUID: {}", saved.getUuid());

        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SmartDairyConfigurationResponse getByUuid(UUID uuid) {
        log.info("Fetching Smart Dairy Configuration by UUID: {}", uuid);

        SmartDairyConfiguration configuration = repository.findByUuidAndActive(uuid)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Configuration not found"));

        return mapper.toResponse(configuration);
    }

    @Override
    @Transactional(readOnly = true)
    public SmartDairyConfigurationResponse getCurrentTenantConfiguration() {
        log.info("Fetching Smart Dairy Configuration for current tenant");

        UUID tenantUuid = TenantContextHolder.getTenantUuid();
        SmartDairyConfiguration configuration = repository.findByTenantUuidAndActive(tenantUuid)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Configuration not found for current tenant"));

        return mapper.toResponse(configuration);
    }

    @Override
    public SmartDairyConfigurationResponse update(UUID uuid, UpdateSmartDairyConfigurationRequest request) {
        log.info("Updating Smart Dairy Configuration with UUID: {}", uuid);

        SmartDairyConfiguration configuration = repository.findByUuidAndActive(uuid)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Configuration not found"));

        if (request.getCollectionFat() != null) {
            configuration.setCollectionFat(request.getCollectionFat());
        }
        if (request.getCollectionMava() != null) {
            configuration.setCollectionMava(request.getCollectionMava());
        }
        if (request.getMorningCollectionLimit() != null) {
            configuration.setMorningCollectionLimit(request.getMorningCollectionLimit());
        }
        if (request.getEveningCollectionLimit() != null) {
            configuration.setEveningCollectionLimit(request.getEveningCollectionLimit());
        }
        if (request.getAllowMultipleCollection() != null) {
            configuration.setAllowMultipleCollection(request.getAllowMultipleCollection());
        }
        if (request.getAllowLoan() != null) {
            configuration.setAllowLoan(request.getAllowLoan());
        }
        if (request.getAllowAdvance() != null) {
            configuration.setAllowAdvance(request.getAllowAdvance());
        }
        if (request.getAllowLoanAndAdvanceTogether() != null) {
            configuration.setAllowLoanAndAdvanceTogether(request.getAllowLoanAndAdvanceTogether());
        }
        if (request.getDailyPayment() != null) {
            configuration.setDailyPayment(request.getDailyPayment());
        }
        if (request.getWeeklyPayment() != null) {
            configuration.setWeeklyPayment(request.getWeeklyPayment());
        }
        if (request.getMonthlyPayment() != null) {
            configuration.setMonthlyPayment(request.getMonthlyPayment());
        }
        if (request.getAllowBackdatedEntry() != null) {
            configuration.setAllowBackdatedEntry(request.getAllowBackdatedEntry());
        }
        if (request.getMaxBackdatedDays() != null) {
            configuration.setMaxBackdatedDays(request.getMaxBackdatedDays());
        }
        if (request.getAutoLock() != null) {
            configuration.setAutoLock(request.getAutoLock());
        }

        SmartDairyConfiguration updated = repository.save(configuration);
        log.info("Smart Dairy Configuration updated with UUID: {}", uuid);

        return mapper.toResponse(updated);
    }

    @Override
    public void delete(UUID uuid) {
        log.info("Deleting Smart Dairy Configuration with UUID: {}", uuid);

        SmartDairyConfiguration configuration = repository.findByUuid(uuid)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Configuration not found"));

        configuration.setActive(false);
        repository.save(configuration);

        log.info("Smart Dairy Configuration deleted with UUID: {}", uuid);
    }

    @Override
    public void deleteByTenantUuid(UUID tenantUuid) {
        log.info("Deleting Smart Dairy Configuration for tenant: {}", tenantUuid);

        repository.findByTenantUuid(tenantUuid).ifPresent(config -> {
            config.setActive(false);
            repository.save(config);
        });

        log.info("Smart Dairy Configuration deleted for tenant: {}", tenantUuid);
    }
}
