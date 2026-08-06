package com.smartdairy.milkcollection.controller;

import com.smartdairy.common.enums.CollectionEntryMode;
import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.milkcollection.dto.CreateMilkCollectionBulkRequest;
import com.smartdairy.milkcollection.dto.CreateMilkCollectionRequest;
import com.smartdairy.milkcollection.dto.MilkCollectionResponse;
import com.smartdairy.milkcollection.service.CreateMilkCollectionService;
import com.smartdairy.milkcollection.service.DailyMilkCollectionSummaryService;
import com.smartdairy.milkcollection.service.DeleteMilkCollectionService;
import com.smartdairy.milkcollection.service.GetAllMilkCollectionService;
import com.smartdairy.milkcollection.service.LockMilkCollectionService;
import com.smartdairy.milkcollection.service.UpdateMilkCollectionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MilkCollectionControllerTest {

    @Mock
    private CreateMilkCollectionService service;

    @Mock
    private GetAllMilkCollectionService getAllMilkCollectionService;

    @Mock
    private UpdateMilkCollectionService updateMilkCollectionService;

    @Mock
    private LockMilkCollectionService lockMilkCollectionService;

    @Mock
    private DeleteMilkCollectionService deleteMilkCollectionService;

    @Mock
    private DailyMilkCollectionSummaryService dailyMilkCollectionSummaryService;

    @InjectMocks
    private MilkCollectionController controller;

    @Test
    void createBulk_returnsCreatedWithExpectedMessageAndPayload() {
        CreateMilkCollectionRequest first = createEntry(BigDecimal.valueOf(10.25), "First");
        CreateMilkCollectionRequest second = createEntry(BigDecimal.valueOf(12.75), "Second");
        CreateMilkCollectionBulkRequest request = new CreateMilkCollectionBulkRequest(List.of(first, second));

        MilkCollectionResponse firstResponse = createResponse(first, "MC-001");
        MilkCollectionResponse secondResponse = createResponse(second, "MC-002");
        List<MilkCollectionResponse> expected = List.of(firstResponse, secondResponse);

        when(service.createBulk(request.entries())).thenReturn(expected);

        ResponseEntity<ApiResponse<List<MilkCollectionResponse>>> response = controller.createBulk(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().success());
        assertEquals("Milk collections saved successfully.", response.getBody().message());
        assertEquals(expected, response.getBody().data());

        verify(service).createBulk(request.entries());
    }

    @Test
    void createBulk_passesAllEntriesToServiceWithoutMutation() {
        CreateMilkCollectionRequest first = createEntry(BigDecimal.valueOf(5.50), "A");
        CreateMilkCollectionRequest second = createEntry(BigDecimal.valueOf(7.75), "B");
        CreateMilkCollectionBulkRequest request = new CreateMilkCollectionBulkRequest(List.of(first, second));

        when(service.createBulk(request.entries())).thenReturn(List.of());

        controller.createBulk(request);

        ArgumentCaptor<List<CreateMilkCollectionRequest>> captor = ArgumentCaptor.forClass(List.class);
        verify(service).createBulk(captor.capture());
        assertEquals(request.entries(), captor.getValue());
    }

    @Test
    void createBulk_returnsCreatedWithEmptyDataWhenServiceReturnsEmptyList() {
        CreateMilkCollectionBulkRequest request = new CreateMilkCollectionBulkRequest(List.of(createEntry(BigDecimal.valueOf(3.25), "Only")));

        when(service.createBulk(request.entries())).thenReturn(List.of());

        ResponseEntity<ApiResponse<List<MilkCollectionResponse>>> response = controller.createBulk(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().success());
        assertEquals("Milk collections saved successfully.", response.getBody().message());
        assertEquals(List.of(), response.getBody().data());
    }

    private CreateMilkCollectionRequest createEntry(BigDecimal quantity, String remarks) {
        return new CreateMilkCollectionRequest(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                LocalDate.of(2026, 8, 6),
                LocalTime.of(7, 30),
                quantity,
                BigDecimal.valueOf(4.20),
                BigDecimal.valueOf(8.60),
                BigDecimal.valueOf(2.10),
                CollectionEntryMode.MULTI,
                remarks
        );
    }

    private MilkCollectionResponse createResponse(CreateMilkCollectionRequest request, String collectionNo) {
        return new MilkCollectionResponse(
                UUID.randomUUID(),
                collectionNo,
                request.farmerUuid(),
                "F001",
                "Ramesh",
                request.shiftUuid(),
                "Morning",
                request.milkTypeUuid(),
                "Cow",
                request.collectionDate(),
                request.collectionTime(),
                request.quantity(),
                request.fat(),
                request.snf(),
                request.mava(),
                BigDecimal.valueOf(35.50),
                CollectionEntryMode.MULTI,
                BigDecimal.valueOf(363.88)
        );
    }
}
