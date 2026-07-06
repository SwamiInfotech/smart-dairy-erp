package com.smartdairy.branch.create;

import com.smartdairy.branch.dto.BranchResponse;
import com.smartdairy.branch.dto.CreateBranchRequest;
import com.smartdairy.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
public class CreateBranchController {

    private final CreateBranchService service;

    @PostMapping
    public ResponseEntity<ApiResponse<BranchResponse>> create(
            @Valid @RequestBody CreateBranchRequest request) {

        BranchResponse response = service.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Branch created successfully.",
                        response,
                        LocalDateTime.now()));
    }
}