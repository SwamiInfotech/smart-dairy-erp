package com.smartdairy.loan.service;

import com.smartdairy.loan.dto.LoanResponse;
import com.smartdairy.loan.dto.LoanSearchRequest;
import com.smartdairy.loan.mapper.LoanMapper;
import com.smartdairy.loan.repository.LoanRepository;
import com.smartdairy.loan.specification.LoanSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetAllLoanService {

    private final LoanRepository repository;
    private final LoanMapper mapper;

    public Page<LoanResponse> search(
            LoanSearchRequest request,
            Pageable pageable){

        return repository.findAll(
                        LoanSpecification.search(request),
                        pageable)
                .map(mapper::toResponse);
    }

}