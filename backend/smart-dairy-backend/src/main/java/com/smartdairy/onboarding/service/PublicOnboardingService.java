package com.smartdairy.onboarding.service;

import com.smartdairy.auth.entity.AppUser;
import com.smartdairy.auth.entity.UserRole;
import com.smartdairy.auth.entity.UserTenant;
import com.smartdairy.auth.entity.UserTenantRole;
import com.smartdairy.auth.repository.AppUserRepository;
import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.company.entity.Company;
import com.smartdairy.company.repository.CompanyRepository;
import com.smartdairy.onboarding.dto.PublicOnboardingRequest;
import com.smartdairy.onboarding.dto.PublicOnboardingResponse;
import com.smartdairy.tenant.entity.Tenant;
import com.smartdairy.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PublicOnboardingService {

    private static final String LOGIN_ENDPOINT = "/api/v1/auth/login";
    private static final int TRIAL_DAYS = 30;

    private final TenantRepository tenantRepository;
    private final CompanyRepository companyRepository;
    private final BranchRepository branchRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public PublicOnboardingResponse onboard(PublicOnboardingRequest request) {
        String tenantCode = request.tenantCode().trim();
        String tenantName = request.tenantName().trim();
        String companyCode = request.companyCode().trim();
        String companyName = request.companyName().trim();
        String adminUsername = request.adminUsername().trim();
        String adminFullName = request.adminFullName().trim();

        if (tenantRepository.existsByCodeIgnoreCase(tenantCode)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tenant code already exists: " + tenantCode);
        }

        try {
            Tenant tenant = new Tenant();
            tenant.setCode(tenantCode);
            tenant.setName(tenantName);
            tenant.setActive(Boolean.TRUE);
            Tenant savedTenant = tenantRepository.save(tenant);

            Company company = new Company();
            company.setTenantUuid(savedTenant.getUuid());
            company.setCompanyCode(companyCode);
            company.setCompanyName(companyName);
            company.setOwnerName(trimToNull(request.ownerName()));
            company.setMobileNo(trimToNull(request.mobileNo()));
            company.setEmail(trimToNull(request.email()));
            company.setGstNo(trimToNull(request.gstNo()));
            company.setAddress(trimToNull(request.address()));
            company.setCity(trimToNull(request.city()));
            company.setState(trimToNull(request.state()));
            company.setCountry(trimToNull(request.country()));
            company.setPincode(trimToNull(request.pincode()));
            company.setActive(Boolean.TRUE);

            Branch branch = new Branch();
            branch.setTenantUuid(savedTenant.getUuid());
            branch.setCompany(company);
            branch.setBranchCode(resolveBranchCode(request, companyCode));
            branch.setBranchName(resolveBranchName(request, companyName));
            branch.setManagerName(trimToNull(request.branchManagerName()));
            branch.setMobileNo(trimToNull(request.branchMobileNo()));
            branch.setEmail(trimToNull(request.branchEmail()));
            branch.setAddress(trimToNull(request.branchAddress()));
            branch.setCity(trimToNull(request.branchCity()));
            branch.setState(trimToNull(request.branchState()));
            branch.setCountry(trimToNull(request.branchCountry()));
            branch.setPincode(trimToNull(request.branchPincode()));
            branch.setActive(Boolean.TRUE);

            AppUser adminUser = new AppUser();
            adminUser.setTenantUuid(savedTenant.getUuid());
            adminUser.setUsername(adminUsername);
            adminUser.setPasswordHash(passwordEncoder.encode(request.adminPassword()));
            adminUser.setFullName(adminFullName);
            adminUser.setRole(UserRole.ADMIN);
            adminUser.setDefaultTenantUuid(savedTenant.getUuid());
            adminUser.setActive(Boolean.TRUE);

            UserTenant userTenant = new UserTenant();
            userTenant.setAppUser(adminUser);
            userTenant.setTenant(savedTenant);
            userTenant.setTenantUuid(savedTenant.getUuid());
            userTenant.setRole(UserTenantRole.OWNER);
            userTenant.setIsOwner(Boolean.TRUE);
            userTenant.setIsAdmin(Boolean.TRUE);
            userTenant.setIsPrimary(Boolean.TRUE);
            userTenant.setActive(Boolean.TRUE);
            adminUser.getUserTenants().add(userTenant);

            Company savedCompany = companyRepository.save(company);
            Branch savedBranch = branchRepository.save(branch);
            AppUser savedAdminUser = appUserRepository.save(adminUser);
            LocalDate trialStart = LocalDate.now();

            return new PublicOnboardingResponse(
                    savedTenant.getUuid(),
                    savedTenant.getCode(),
                    savedTenant.getName(),
                    savedCompany.getUuid(),
                    savedCompany.getCompanyCode(),
                    savedCompany.getCompanyName(),
                    savedBranch.getUuid(),
                    savedBranch.getBranchCode(),
                    savedBranch.getBranchName(),
                    savedAdminUser.getUuid(),
                    savedAdminUser.getUsername(),
                    UserTenantRole.OWNER.name(),
                    trialStart,
                    trialStart.plusDays(TRIAL_DAYS),
                    LOGIN_ENDPOINT,
                    LocalDateTime.now()
            );
        } catch (DataIntegrityViolationException ex) {
            throw mapDataIntegrityViolation(ex);
        }
    }

    private ResponseStatusException mapDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();

        if (message != null && (message.contains("uk_tenant_code") || message.contains("tenant_code_key"))) {
            return new ResponseStatusException(HttpStatus.CONFLICT, "Tenant code already exists.");
        }
        if (message != null && (message.contains("company_company_code_key") || message.contains("uk_company_code"))) {
            return new ResponseStatusException(HttpStatus.CONFLICT, "Company code already exists.");
        }
        if (message != null && message.contains("branch_branch_code_key")) {
            return new ResponseStatusException(HttpStatus.CONFLICT, "Branch code already exists.");
        }
        if (message != null && (message.contains("uk_app_user_tenant_username")
                || message.contains("idx_app_user_tenant_username_lower"))) {
            return new ResponseStatusException(HttpStatus.CONFLICT, "Admin username already exists in this tenant.");
        }
        return new ResponseStatusException(HttpStatus.CONFLICT, "Unable to complete onboarding due to duplicate data.");
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String resolveBranchCode(PublicOnboardingRequest request, String companyCode) {
        String requestedCode = trimToNull(request.branchCode());
        if (requestedCode != null) {
            if (branchRepository.existsByBranchCode(requestedCode)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Branch code already exists: " + requestedCode);
            }
            return requestedCode;
        }

        String baseCode = trimToLength(companyCode + "-BR1", 20);
        if (!branchRepository.existsByBranchCode(baseCode)) {
            return baseCode;
        }

        for (int i = 2; i <= 99; i++) {
            String candidate = trimToLength(companyCode + "-BR" + i, 20);
            if (!branchRepository.existsByBranchCode(candidate)) {
                return candidate;
            }
        }

        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Unable to generate unique branch code automatically. Please provide branchCode."
        );
    }

    private String resolveBranchName(PublicOnboardingRequest request, String companyName) {
        String requestedName = trimToNull(request.branchName());
        if (requestedName != null) {
            return requestedName;
        }
        return trimToLength(companyName + " Main Branch", 150);
    }

    private String trimToLength(String value, int maxLength) {
        String trimmed = value.trim();
        if (trimmed.length() <= maxLength) {
            return trimmed;
        }
        return trimmed.substring(0, maxLength);
    }
}
