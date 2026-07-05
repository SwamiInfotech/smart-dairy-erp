package com.smartdairy.branch.mapper;

import com.smartdairy.branch.dto.BranchResponse;
import com.smartdairy.branch.dto.CreateBranchRequest;
import com.smartdairy.branch.entity.Branch;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BranchMapper {

    Branch toEntity(CreateBranchRequest request);

    BranchResponse toResponse(Branch branch);

}