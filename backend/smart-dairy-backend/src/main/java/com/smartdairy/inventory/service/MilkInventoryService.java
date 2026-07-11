package com.smartdairy.inventory.service;

import com.smartdairy.milkcollection.entity.MilkCollection;

public interface MilkInventoryService {

    void stockIn(MilkCollection milkCollection);

    void updateStock(MilkCollection oldCollection,
                     MilkCollection updatedCollection);

    void reverseStock(MilkCollection milkCollection);

}