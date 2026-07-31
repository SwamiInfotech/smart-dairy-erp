package com.smartdairy.rateprofile.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.rateprofile.dto.CreateRateCategoryRequest;
import com.smartdairy.rateprofile.dto.RateCategoryResponse;
import com.smartdairy.rateprofile.entity.RateCategory;
import com.smartdairy.rateprofile.mapper.RateCategoryMapper;
import com.smartdairy.rateprofile.repository.RateCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CreateRateCategoryService {

    private final RateCategoryRepository repository;
    private final RateCategoryMapper mapper;

    public RateCategoryResponse create(CreateRateCategoryRequest request) {
        log.info("Creating rate category with code={}", request.getCode());

        if (repository.existsByCodeIgnoreCase(request.getCode())) {
            log.warn("Rate category creation failed because code={} already exists.", request.getCode());
            throw new BusinessException("Rate category code already exists.");
        }

        RateCategory entity = mapper.toEntity(request);
        entity.setActive(true);

        RateCategory saved = repository.save(entity);
        log.info("Rate category created successfully with uuid={}", saved.getUuid());
        return mapper.toResponse(saved);
    }
}
