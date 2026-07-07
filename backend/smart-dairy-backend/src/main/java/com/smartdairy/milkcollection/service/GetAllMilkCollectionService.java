package com.smartdairy.milkcollection.service;

import com.smartdairy.milkcollection.dto.MilkCollectionResponse;
import com.smartdairy.milkcollection.dto.MilkCollectionSearchRequest;
import com.smartdairy.milkcollection.mapper.MilkCollectionMapper;
import com.smartdairy.milkcollection.repository.MilkCollectionRepository;
import com.smartdairy.milkcollection.specification.MilkCollectionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetAllMilkCollectionService {

    private final MilkCollectionRepository repository;
    private final MilkCollectionMapper mapper;

    public Page<MilkCollectionResponse> search(
            MilkCollectionSearchRequest request,
            Pageable pageable) {

        return repository
                .findAll(
                        MilkCollectionSpecification.search(request),
                        pageable)
                .map(mapper::toResponse);
    }
}