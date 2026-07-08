package com.smartdairy.loan.service.advance;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.loan.dto.AdvanceResponse;
import com.smartdairy.loan.dto.CreateAdvanceRequest;
import com.smartdairy.loan.dto.CreateLoanRequest;
import com.smartdairy.loan.dto.LoanResponse;
import com.smartdairy.loan.entity.Advance;
import com.smartdairy.loan.entity.Loan;
import com.smartdairy.loan.mapper.AdvanceMapper;
import com.smartdairy.loan.mapper.LoanMapper;
import com.smartdairy.loan.repository.AdvanceRepository;
import com.smartdairy.loan.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateAdvanceService {

    private final AdvanceRepository repository;
    private final FarmerRepository farmerRepository;
    private final AdvanceMapper mapper;

    public AdvanceResponse create(CreateAdvanceRequest request){

        Farmer farmer = farmerRepository.findByUuid(request.farmerUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Farmer not found."));

        Advance entity = mapper.toEntity(request);

        entity.setAdvanceNo(generateAdvanceNo());

        entity.setBranch(farmer.getBranch());

        entity.setFarmer(farmer);

        Advance saved = repository.save(entity);

        return mapper.toResponse(saved);
    }

    private String generateAdvanceNo(){

        return "ADV"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + ThreadLocalRandom.current().nextInt(1000,9999);
    }
}