package com.smartdairy.branch.repository;

import com.smartdairy.branch.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BranchRepository extends JpaRepository<Branch, Long> {

    Optional<Branch> findByUuid(UUID uuid);

    boolean existsByBranchCode(String branchCode);

    List<Branch> findByCompanyId(Long companyId);
}