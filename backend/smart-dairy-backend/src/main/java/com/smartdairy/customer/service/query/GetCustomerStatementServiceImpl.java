package com.smartdairy.customer.service.query;

import com.smartdairy.customer.dto.CustomerStatementResponse;
import com.smartdairy.customer.mapper.CustomerLedgerMapper;
import com.smartdairy.customer.repository.CustomerLedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetCustomerStatementServiceImpl
        implements GetCustomerStatementService {

    private final CustomerLedgerRepository repository;

    private final CustomerLedgerMapper mapper;

    @Override
    public List<CustomerStatementResponse> getStatement(
            UUID customerUuid) {

        return repository
                .findByCustomerUuidOrderByTransactionDateAscIdAsc(customerUuid)
                .stream()
                .map(mapper::toStatement)
                .toList();

    }

}