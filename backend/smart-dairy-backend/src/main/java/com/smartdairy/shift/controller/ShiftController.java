package com.smartdairy.shift.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.shift.dto.CreateShiftRequest;
import com.smartdairy.shift.dto.ShiftResponse;
import com.smartdairy.shift.service.CreateShiftService;
import com.smartdairy.shift.service.GetShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/master/shifts")
public class ShiftController {

    private final CreateShiftService createService;
    private final GetShiftService service;

    @PostMapping
    public ApiResponse<ShiftResponse> create(@Valid @RequestBody CreateShiftRequest request) {
        return new ApiResponse<>(
                true,
                "Shift created successfully.",
                createService.create(request),
                LocalDateTime.now()
        );
    }

    @GetMapping
    public ApiResponse<List<ShiftResponse>> getAll() {
        return new ApiResponse<>(
                true,
                "Shifts fetched successfully.",
                service.getAll(),
                LocalDateTime.now()
        );
    }
}
