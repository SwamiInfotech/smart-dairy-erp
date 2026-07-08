package com.smartdairy.loan.service.advance;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.loan.dto.AdvanceResponse;
import com.smartdairy.loan.entity.Advance;
import com.smartdairy.loan.mapper.AdvanceMapper;
import com.smartdairy.loan.repository.AdvanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetAdvanceService {

    private final AdvanceRepository repository;
    private final AdvanceMapper mapper;

    public AdvanceResponse getByUuid(UUID uuid){

        Advance advance = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Advance not found."));

        return mapper.toResponse(advance);
    }
}