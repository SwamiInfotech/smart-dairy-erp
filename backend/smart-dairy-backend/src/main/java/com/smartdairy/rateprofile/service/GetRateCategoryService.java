package com.smartdairy.rateprofile.service;

import com.smartdairy.rateprofile.dto.RateCategoryResponse;
import com.smartdairy.rateprofile.mapper.RateCategoryMapper;
import com.smartdairy.rateprofile.repository.RateCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class GetRateCategoryService {

    private final RateCategoryRepository repository;
    private final RateCategoryMapper mapper;

    public List<RateCategoryResponse> getAll() {
        log.info("Fetching all rate categories.");
        List<RateCategoryResponse> response = repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
        log.info("Fetched {} rate categories.", response.size());
        return response;
    }
}
