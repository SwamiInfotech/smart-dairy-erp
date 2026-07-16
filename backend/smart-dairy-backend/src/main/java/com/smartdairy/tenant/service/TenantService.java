package com.smartdairy.tenant.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.tenant.dto.CreateTenantRequest;
import com.smartdairy.tenant.dto.TenantResponse;
import com.smartdairy.tenant.entity.Tenant;
import com.smartdairy.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    @Transactional
    public TenantResponse create(CreateTenantRequest request) {
        String code = request.code().trim();
        String name = request.name().trim();

        if (tenantRepository.existsByCodeIgnoreCase(code)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tenant code already exists: " + code);
        }

        Tenant tenant = new Tenant();
        tenant.setCode(code);
        tenant.setName(name);
        tenant.setActive(Boolean.TRUE);

        return toResponse(tenantRepository.save(tenant));
    }

    @Transactional(readOnly = true)
    public List<TenantResponse> getAll() {
        return tenantRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TenantResponse getByUuid(UUID uuid) {
        Tenant tenant = tenantRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + uuid));
        return toResponse(tenant);
    }

    private TenantResponse toResponse(Tenant tenant) {
        return new TenantResponse(
                tenant.getUuid(),
                tenant.getCode(),
                tenant.getName(),
                Boolean.TRUE.equals(tenant.getActive()),
                tenant.getCreatedAt(),
                tenant.getUpdatedAt()
        );
    }
}
