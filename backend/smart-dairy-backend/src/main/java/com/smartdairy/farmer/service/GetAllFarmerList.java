package com.smartdairy.farmer.service;

import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class GetAllFarmerList {

    private final FarmerRepository farmerRepository;

    public List<FarmerResponse> getAllFarmers() {

        List<Farmer> allFarmers = farmerRepository.findAll();
        return allFarmers.stream()
                .map(farmer -> new FarmerResponse(farmer.getUuid(), farmer.getBranch().getUuid(), farmer.getFarmerCode(), farmer.getFarmerName(), farmer.getMobileNo(), farmer.getVillage(), farmer.getActive()))
                .toList();
    }

}
