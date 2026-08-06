package com.smartdairy.farmer.service;

import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.repository.FarmerRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GetAllFarmerList {

    private final FarmerRepository farmerRepository;
    private final FarmerResponseFactory farmerResponseFactory;

    public List<FarmerResponse> getAllFarmers() {
        log.info("Fetching active farmers.");
        return farmerRepository.findByActiveTrue().stream()
                .map(farmerResponseFactory::toResponse)
                .toList();
    }

}
