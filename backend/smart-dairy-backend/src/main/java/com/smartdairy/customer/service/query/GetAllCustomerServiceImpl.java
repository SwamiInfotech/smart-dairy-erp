package com.smartdairy.customer.service.query;

import com.smartdairy.customer.dto.CustomerResponse;
import com.smartdairy.customer.dto.CustomerSearchRequest;
import com.smartdairy.customer.mapper.CustomerMapper;
import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.customer.specification.CustomerSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetAllCustomerServiceImpl
        implements GetAllCustomerService {

    private final CustomerRepository repository;
    private final CustomerMapper mapper;

    @Override
    public Page<CustomerResponse> search(
            CustomerSearchRequest request,
            Pageable pageable) {

        return repository.findAll(
                        CustomerSpecification.search(request),
                        pageable)
                .map(mapper::toResponse);

    }

}