package com.smartdairy.loan.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.loan.dto.LoanResponse;
import com.smartdairy.loan.entity.Loan;
import com.smartdairy.loan.enums.LoanStatus;
import com.smartdairy.loan.mapper.LoanMapper;
import com.smartdairy.loan.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ApproveLoanService {

    private final LoanRepository repository;
    private final LoanMapper mapper;

    public LoanResponse approve(UUID uuid){

        Loan loan = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not found."));

        if(loan.getStatus()!=LoanStatus.PENDING){
            throw new BusinessException(
                    "Loan is already processed.");
        }

        loan.setStatus(LoanStatus.APPROVED);

        return mapper.toResponse(
                repository.save(loan));
    }

}