package com.smartdairy.farmer.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.farmerconfiguration.repository.FarmerConfigurationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DeleteFarmerService {

    private final FarmerRepository farmerRepository;
    private final FarmerConfigurationRepository farmerConfigurationRepository;

    public void delete(UUID uuid) {
        log.info("Deleting farmer with uuid={}.", uuid);

        Farmer farmer = farmerRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));

        if (!Boolean.TRUE.equals(farmer.getActive())) {
            throw new BusinessException("Farmer is already deleted.");
        }

        farmerConfigurationRepository.findByFarmerIdAndActiveTrue(farmer.getId())
                .ifPresent(configuration -> {
                    configuration.setActive(false);
                    if (configuration.getEffectiveTo() == null) {
                        configuration.setEffectiveTo(LocalDate.now());
                    }
                    farmerConfigurationRepository.save(configuration);
                });

        farmer.setActive(false);
        farmerRepository.save(farmer);
    }
}
