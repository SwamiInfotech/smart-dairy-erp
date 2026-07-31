package com.smartdairy.shift.service;

import com.smartdairy.shift.dto.CreateShiftRequest;
import com.smartdairy.shift.dto.ShiftResponse;

public interface CreateShiftService {

    ShiftResponse create(CreateShiftRequest request);

}
