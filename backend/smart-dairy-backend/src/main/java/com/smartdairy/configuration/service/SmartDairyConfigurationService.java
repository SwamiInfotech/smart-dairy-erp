package com.smartdairy.configuration.service;

import com.smartdairy.configuration.dto.CreateSmartDairyConfigurationRequest;
import com.smartdairy.configuration.dto.SmartDairyConfigurationResponse;
import com.smartdairy.configuration.dto.UpdateSmartDairyConfigurationRequest;

import java.util.UUID;

public interface SmartDairyConfigurationService {

    SmartDairyConfigurationResponse create(CreateSmartDairyConfigurationRequest request);

    SmartDairyConfigurationResponse getByUuid(UUID uuid);

    SmartDairyConfigurationResponse getCurrentTenantConfiguration();

    SmartDairyConfigurationResponse update(UUID uuid, UpdateSmartDairyConfigurationRequest request);

    void delete(UUID uuid);

    void deleteByTenantUuid(UUID tenantUuid);
}
