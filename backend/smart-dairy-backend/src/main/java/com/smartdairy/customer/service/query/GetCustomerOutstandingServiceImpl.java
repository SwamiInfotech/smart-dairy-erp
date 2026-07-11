package com.smartdairy.customer.service.query;

import com.smartdairy.customer.dto.CustomerOutstandingResponse;
import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetCustomerOutstandingServiceImpl
        implements GetCustomerOutstandingService {

    private final CustomerRepository repository;

    @Override
    public List<CustomerOutstandingResponse> getOutstanding() {

        return repository.findByActiveTrue()
                .stream()
                .map(this::map)
                .toList();

    }

    private CustomerOutstandingResponse map(Customer customer) {

        return new CustomerOutstandingResponse(
                customer.getUuid(),
                customer.getCustomerCode(),
                customer.getCustomerName(),
                customer.getCurrentBalance());

    }

}