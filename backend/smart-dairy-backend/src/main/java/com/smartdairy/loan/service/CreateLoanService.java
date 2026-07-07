package com.smartdairy.loan.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.loan.dto.CreateLoanRequest;
import com.smartdairy.loan.dto.LoanResponse;
import com.smartdairy.loan.entity.Loan;
import com.smartdairy.loan.mapper.LoanMapper;
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
public class CreateLoanService {

    private final LoanRepository repository;
    private final FarmerRepository farmerRepository;
    private final LoanMapper mapper;

    public LoanResponse create(CreateLoanRequest request){

        Farmer farmer = farmerRepository.findByUuid(request.farmerUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Farmer not found."));

        Loan entity = mapper.toEntity(request);

        entity.setLoanNo(generateLoanNo());

        entity.setBranch(farmer.getBranch());

        entity.setFarmer(farmer);

        Loan saved = repository.save(entity);

        return mapper.toResponse(saved);
    }

    private String generateLoanNo(){

        return "LN"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + ThreadLocalRandom.current().nextInt(1000,9999);
    }
}