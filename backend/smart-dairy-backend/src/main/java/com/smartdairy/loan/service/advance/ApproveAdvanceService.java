package com.smartdairy.loan.service.advance;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.loan.dto.AdvanceResponse;
import com.smartdairy.loan.entity.Advance;
import com.smartdairy.loan.enums.AdvanceStatus;
import com.smartdairy.loan.mapper.AdvanceMapper;
import com.smartdairy.loan.repository.AdvanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ApproveAdvanceService {

    private final AdvanceRepository repository;
    private final AdvanceMapper mapper;

    public AdvanceResponse approve(UUID uuid){

        Advance advance = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Advance not found."));

        if(advance.getStatus()!=AdvanceStatus.PENDING){
            throw new BusinessException(
                    "Advance is already processed.");
        }

        advance.setStatus(AdvanceStatus.APPROVED);

        return mapper.toResponse(
                repository.save(advance));
    }

}