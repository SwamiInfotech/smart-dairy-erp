package com.smartdairy.shift.service.impl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.shift.dto.CreateShiftRequest;
import com.smartdairy.shift.dto.ShiftResponse;
import com.smartdairy.shift.entity.Shift;
import com.smartdairy.shift.mapper.ShiftMapper;
import com.smartdairy.shift.repository.ShiftRepository;
import com.smartdairy.shift.service.CreateShiftService;
import com.smartdairy.tenant.context.TenantContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateShiftServiceImpl implements CreateShiftService {

    private final ShiftRepository repository;
    private final ShiftMapper mapper;

    @Override
    public ShiftResponse create(CreateShiftRequest request) {
        UUID tenantUuid = TenantContextHolder.getTenantUuidOrFallback();

        if (repository.existsByCodeAndTenantUuid(request.getCode(), tenantUuid)) {
            throw new BusinessException("Shift code already exists.");
        }

        Shift shift = new Shift();
        shift.setTenantUuid(tenantUuid);
        shift.setCode(request.getCode());
        shift.setName(request.getName());
        shift.setDescription(request.getDescription());
        shift.setDisplayOrder(request.getDisplayOrder());
        shift.setActive(Boolean.TRUE);

        return mapper.toResponse(repository.save(shift));
    }
}
