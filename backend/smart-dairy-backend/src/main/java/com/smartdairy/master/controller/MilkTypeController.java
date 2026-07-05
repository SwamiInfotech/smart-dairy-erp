package com.smartdairy.master.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.master.dto.MilkTypeResponse;
import com.smartdairy.master.service.GetMilkTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/master/milk-types")
public class MilkTypeController {

    private final GetMilkTypeService service;

    @GetMapping
    public ApiResponse<List<MilkTypeResponse>> getAll() {

        return new ApiResponse<>(
                true,
                "Milk Types fetched successfully.",
                service.getAll()
        );
    }
}