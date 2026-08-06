package com.smartdairy.milkcollection.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.common.enums.CollectionEntryMode;
import com.smartdairy.common.enums.EntryType;
import com.smartdairy.common.enums.EntrySource;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.inventory.service.MilkInventoryService;
import com.smartdairy.master.entity.MilkType;
import com.smartdairy.master.repository.MilkTypeRepository;
import com.smartdairy.milkcollection.dto.CreateMilkCollectionRequest;
import com.smartdairy.milkcollection.dto.MilkCollectionResponse;
import com.smartdairy.milkcollection.entity.MilkCollection;
import com.smartdairy.milkcollection.mapper.MilkCollectionMapper;
import com.smartdairy.milkcollection.repository.MilkCollectionRepository;
import com.smartdairy.milkcollection.validator.MilkCollectionValidator;
import com.smartdairy.pricing.dto.RateCalculationResult;
import com.smartdairy.pricing.service.RateResolverService;
import com.smartdairy.shift.entity.Shift;
import com.smartdairy.shift.repository.ShiftRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CreateMilkCollectionService {

    private final MilkCollectionRepository repository;
    private final FarmerRepository farmerRepository;
    private final ShiftRepository shiftRepository;
    private final MilkTypeRepository milkTypeRepository;
    private final MilkCollectionMapper mapper;
    private final MilkCollectionValidator validator;
    private final RateResolverService rateResolverService;
    private final MilkInventoryService milkInventoryService;

    public MilkCollectionResponse create(CreateMilkCollectionRequest request) {
        return createBulk(List.of(request)).get(0);
    }

    public List<MilkCollectionResponse> createBulk(List<CreateMilkCollectionRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new BusinessException("At least one milk collection entry is required.");
        }

        registerRollbackLogger(requests.size());
        log.info("Creating {} milk collection entries in bulk.", requests.size());

        List<PreparedMilkCollection> preparedRows = prepareRows(requests);
        List<MilkCollection> entities = buildEntities(preparedRows);

        List<MilkCollection> saved = repository.saveAll(entities);
        log.info("Saved {} milk collection entries. Starting inventory stock-in.", saved.size());

        for (MilkCollection item : saved) {
            log.info(
                    "Creating inventory stock-in for collection uuid={}, collectionNo={}.",
                    item.getUuid(),
                    item.getCollectionNo());
            milkInventoryService.stockIn(item);
        }

        log.info("Bulk milk collection + inventory save completed for {} entries.", saved.size());
        return saved.stream().map(mapper::toResponse).toList();
    }

    private void registerRollbackLogger(int requestedEntries) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == TransactionSynchronization.STATUS_ROLLED_BACK) {
                    log.warn(
                            "Milk collection bulk transaction rolled back. requestedEntries={}.",
                            requestedEntries);
                }
            }
        });
    }

    private List<PreparedMilkCollection> prepareRows(List<CreateMilkCollectionRequest> requests) {
        Map<UUID, Farmer> farmerCache = new HashMap<>();
        Map<UUID, Shift> shiftCache = new HashMap<>();
        Map<UUID, MilkType> milkTypeCache = new HashMap<>();
        List<PreparedMilkCollection> preparedRows = new ArrayList<>(requests.size());

        for (int index = 0; index < requests.size(); index++) {
            CreateMilkCollectionRequest request = requests.get(index);
            int rowNumber = index + 1;
            try {
                validator.validate(request);

                Farmer farmer = farmerCache.computeIfAbsent(request.farmerUuid(), this::findFarmer);
                Shift shift = shiftCache.computeIfAbsent(request.shiftUuid(), this::findShift);
                MilkType milkType = milkTypeCache.computeIfAbsent(request.milkTypeUuid(), this::findMilkType);
                RateCalculationResult result = resolveRate(request, farmer);

                preparedRows.add(new PreparedMilkCollection(request, farmer, shift, milkType, result));
            } catch (BusinessException ex) {
                log.warn(
                        "Bulk milk collection failed at row={} for farmerUuid={}, collectionDate={}: {}",
                        rowNumber,
                        request.farmerUuid(),
                        request.collectionDate(),
                        ex.getMessage());
                throw new BusinessException("Row " + rowNumber + ": " + ex.getMessage());
            } catch (ResourceNotFoundException ex) {
                log.warn(
                        "Bulk milk collection failed at row={} for farmerUuid={}, collectionDate={}: {}",
                        rowNumber,
                        request.farmerUuid(),
                        request.collectionDate(),
                        ex.getMessage());
                throw new ResourceNotFoundException("Row " + rowNumber + ": " + ex.getMessage());
            }
        }

        return preparedRows;
    }

    private List<MilkCollection> buildEntities(List<PreparedMilkCollection> preparedRows) {
        Set<String> reservedCollectionNos = new HashSet<>();
        List<MilkCollection> entities = new ArrayList<>(preparedRows.size());

        for (PreparedMilkCollection row : preparedRows) {
            CreateMilkCollectionRequest request = row.request();
            MilkCollection entity = mapper.toEntity(request);

            entity.setCollectionNo(generateUniqueCollectionNo(reservedCollectionNos));
            entity.setBranch(row.farmer().getBranch());
            entity.setFarmer(row.farmer());
            entity.setFarmerConfiguration(row.result().farmerConfiguration());
            entity.setMilkRateChart(row.result().milkRateChart());
            entity.setShift(row.shift());
            entity.setMilkType(row.milkType());
            entity.setCollectionMethod(row.result().farmerConfiguration().getCollectionMethod());
            entity.setCalculatedRate(row.result().calculatedRate());
            entity.setGrossAmount(row.result().grossAmount());
            entity.setEntryMode(request.entryMode() == null ? CollectionEntryMode.SINGLE : request.entryMode());
            entity.setEntryType(EntryType.REGULAR);
            entity.setEntrySource(EntrySource.WEB);

            entities.add(entity);
        }

        return entities;
    }

    private MilkType findMilkType(UUID uuid) {

        return milkTypeRepository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Milk Type not found."));
    }

    private Shift findShift(UUID uuid) {

        return shiftRepository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Shift not found."));
    }

    private Farmer findFarmer(UUID uuid) {

        return farmerRepository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Farmer not found."));
    }

    private RateCalculationResult resolveRate(
            CreateMilkCollectionRequest request,
            Farmer farmer) {

        if (validator.isFatCollection(request)) {

            return rateResolverService.calculateFatRate(
                    farmer,
                    request.collectionDate(),
                    request.quantity(),
                    request.fat(),
                    request.snf());
        }

        return rateResolverService.calculateMavaRate(
                farmer,
                request.collectionDate(),
                request.quantity(),
                request.mava());
    }

    private String generateUniqueCollectionNo(Set<String> reservedCollectionNos) {
        for (int attempt = 0; attempt < 50; attempt++) {
            String candidate = generateCollectionNoCandidate();
            if (reservedCollectionNos.contains(candidate)) {
                continue;
            }

            if (repository.findByCollectionNo(candidate).isPresent()) {
                continue;
            }

            reservedCollectionNos.add(candidate);
            return candidate;
        }

        throw new BusinessException("Unable to generate unique collection number. Please retry.");
    }

    private String generateCollectionNoCandidate() {
        String entropy = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "MC"
            + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
            + entropy;
    }

    private record PreparedMilkCollection(
            CreateMilkCollectionRequest request,
            Farmer farmer,
            Shift shift,
            MilkType milkType,
            RateCalculationResult result
    ) {
    }
}