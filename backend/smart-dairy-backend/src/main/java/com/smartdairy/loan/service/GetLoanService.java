package com.smartdairy.loan.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.loan.dto.LoanResponse;
import com.smartdairy.loan.entity.Loan;
import com.smartdairy.loan.mapper.LoanMapper;
import com.smartdairy.loan.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetLoanService {

    private final LoanRepository repository;
    private final LoanMapper mapper;

    public LoanResponse getByUuid(UUID uuid){

        Loan loan = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not found."));

        return mapper.toResponse(loan);
    }
}