package com.smartdairy.farmer.service;

import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmerconfiguration.entity.FarmerConfiguration;
import com.smartdairy.farmerconfiguration.repository.FarmerConfigurationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FarmerResponseFactory {

    private final FarmerConfigurationRepository farmerConfigurationRepository;

    public FarmerResponse toResponse(Farmer farmer) {
        FarmerConfiguration activeConfiguration = farmerConfigurationRepository
                .findByFarmerIdAndActiveTrue(farmer.getId())
                .orElse(null);

        return new FarmerResponse(
                farmer.getUuid(),
                farmer.getBranch().getUuid(),
                farmer.getMilkRateChart() != null ? farmer.getMilkRateChart().getUuid() : null,
                farmer.getFarmerCode(),
                farmer.getFarmerName(),
                farmer.getMobileNo(),
                farmer.getAlternateMobileNo(),
                farmer.getEmail(),
                farmer.getAddress(),
                farmer.getVillage(),
                farmer.getTaluka(),
                farmer.getDistrict(),
                farmer.getState(),
                farmer.getPincode(),
                farmer.getAadharNo(),
                farmer.getPanNo(),
                farmer.getPhotoUrl(),
                farmer.getRemarks(),
                activeConfiguration != null && activeConfiguration.getMilkType() != null
                        ? activeConfiguration.getMilkType().getUuid()
                        : null,
                activeConfiguration != null && activeConfiguration.getCollectionMethod() != null
                        ? activeConfiguration.getCollectionMethod().getUuid()
                        : null,
                activeConfiguration != null && activeConfiguration.getPaymentCycle() != null
                        ? activeConfiguration.getPaymentCycle().getUuid()
                        : null,
                activeConfiguration != null && activeConfiguration.getRateCategory() != null
                        ? activeConfiguration.getRateCategory().getUuid()
                        : null,
                activeConfiguration != null ? activeConfiguration.getEffectiveFrom() : null,
                farmer.getActive()
        );
    }
}
