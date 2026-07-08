package com.smartdairy.loan.service.advance;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.loan.entity.Advance;
import com.smartdairy.loan.enums.AdvanceStatus;
import com.smartdairy.loan.repository.AdvanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DeleteAdvanceService {

    private final AdvanceRepository repository;

    public void delete(UUID uuid) {

        Advance advance = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Advance not found."));

        if (advance.getStatus() != AdvanceStatus.PENDING) {
            throw new BusinessException(
                    "Only pending advance can be deleted.");
        }

        repository.delete(advance);

    }

}