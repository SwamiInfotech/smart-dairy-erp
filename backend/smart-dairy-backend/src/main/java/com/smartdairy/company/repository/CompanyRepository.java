package com.smartdairy.company.repository;

import com.smartdairy.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByUuid(UUID uuid);

    boolean existsByCompanyCode(String companyCode);

}