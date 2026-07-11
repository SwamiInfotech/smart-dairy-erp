package com.smartdairy.customer.service.command;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.customer.dto.CreateCustomerRequest;
import com.smartdairy.customer.dto.CustomerResponse;
import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.enums.CustomerLedgerReferenceType;
import com.smartdairy.customer.mapper.CustomerMapper;
import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.customer.service.CustomerCodeGenerator;
import com.smartdairy.customer.service.CustomerLedgerService;
import com.smartdairy.customer.validator.CustomerValidator;
import com.smartdairy.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateCustomerServiceImpl
        implements CreateCustomerService {

    private final CustomerRepository repository;
    private final BranchRepository branchRepository;
    private final CustomerValidator validator;
    private final CustomerMapper mapper;
    private final CustomerCodeGenerator codeGenerator;
    private final CustomerLedgerService customerLedgerService;

    @Override
    public CustomerResponse create(CreateCustomerRequest request) {

        validator.validate(request);

        Branch branch = branchRepository.findByUuid(request.branchUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Branch not found."));

        Customer customer = new Customer();

        customer.setBranch(branch);

        customer.setCustomerCode(
                codeGenerator.generate());

        customer.setCustomerName(
                request.customerName());

        customer.setMobileNo(
                request.mobileNo());

        customer.setAlternateMobileNo(
                request.alternateMobileNo());

        customer.setEmail(
                request.email());

        customer.setAddress(
                request.address());

        customer.setCity(
                request.city());

        customer.setState(
                request.state());

        customer.setPincode(
                request.pincode());

        customer.setGstNo(
                request.gstNo());

        customer.setCreditLimit(
                request.creditLimit());

        customer.setOpeningBalance(
                request.openingBalance());

        customer.setCurrentBalance(
                request.openingBalance());

        Customer saved = repository.save(customer);

        if (saved.getOpeningBalance().compareTo(BigDecimal.ZERO) > 0) {

            customerLedgerService.debit(
                    saved,
                    java.time.LocalDate.now(),
                    CustomerLedgerReferenceType.OPENING_BALANCE,
                    saved.getUuid(),
                    saved.getCustomerCode(),
                    saved.getOpeningBalance(),
                    "Opening Balance");

        }

        return mapper.toResponse(saved);

    }

}