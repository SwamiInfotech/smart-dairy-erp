package com.smartdairy.loan.service.advance;

import com.smartdairy.loan.dto.AdvanceResponse;
import com.smartdairy.loan.dto.AdvanceSearchRequest;
import com.smartdairy.loan.dto.LoanResponse;
import com.smartdairy.loan.dto.LoanSearchRequest;
import com.smartdairy.loan.mapper.AdvanceMapper;
import com.smartdairy.loan.mapper.LoanMapper;
import com.smartdairy.loan.repository.AdvanceRepository;
import com.smartdairy.loan.repository.LoanRepository;
import com.smartdairy.loan.specification.AdvanceSpecification;
import com.smartdairy.loan.specification.LoanSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetAllAdvanceService {

    private final AdvanceRepository repository;
    private final AdvanceMapper mapper;

    public Page<AdvanceResponse> search(
            AdvanceSearchRequest request,
            Pageable pageable){

        return repository.findAll(
                        AdvanceSpecification.search(request),
                        pageable)
                .map(mapper::toResponse);
    }

}