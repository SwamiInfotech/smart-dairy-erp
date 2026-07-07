package com.smartdairy.loan.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.loan.entity.Loan;
import com.smartdairy.loan.enums.LoanStatus;
import com.smartdairy.loan.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DeleteLoanService {

    private final LoanRepository repository;

    public void delete(UUID uuid) {

        Loan loan = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not found."));

        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new BusinessException(
                    "Only pending loan can be deleted.");
        }

        repository.delete(loan);

    }

}