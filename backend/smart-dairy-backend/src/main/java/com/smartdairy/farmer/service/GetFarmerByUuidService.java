package com.smartdairy.farmer.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GetFarmerByUuidService {

    private final FarmerRepository farmerRepository;
    private final FarmerResponseFactory farmerResponseFactory;

    public FarmerResponse get(UUID uuid) {
        log.info("Fetching farmer with uuid={}.", uuid);

        Farmer farmer = farmerRepository.findByUuidAndActiveTrue(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));

        return farmerResponseFactory.toResponse(farmer);
    }
}
