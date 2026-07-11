package com.smartdairy.inventory.mapper;

import com.smartdairy.inventory.dto.InventoryLedgerResponse;
import com.smartdairy.inventory.entity.InventoryTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(target = "uuid", source = "uuid")
    InventoryLedgerResponse toLedgerResponse(
            InventoryTransaction entity);

}