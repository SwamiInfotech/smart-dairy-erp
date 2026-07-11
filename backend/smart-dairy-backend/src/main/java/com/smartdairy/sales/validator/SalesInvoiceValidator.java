package com.smartdairy.sales.validator;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.enums.ProductType;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.sales.dto.CreateSalesInvoiceItemRequest;
import com.smartdairy.sales.dto.CreateSalesInvoiceRequest;
import com.smartdairy.sales.dto.UpdateSalesInvoiceRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class SalesInvoiceValidator {

    private final ProductRepository productRepository;

    public void validate(CreateSalesInvoiceRequest request) {

        validateItems(request.items());

    }

    public void validateForUpdate(UpdateSalesInvoiceRequest request) {

        validateItems(request.items());

    }

    private void validateItems(
            Iterable<CreateSalesInvoiceItemRequest> items) {

        Set<String> products = new HashSet<>();

        for (CreateSalesInvoiceItemRequest item : items) {

            validateQuantity(item);

            validatePrice(item);

            Product product = productRepository
                    .findByUuid(item.productUuid())
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Product not found."));

            if (!Boolean.TRUE.equals(product.getActive())) {

                throw new BusinessException(
                        "Inactive product : "
                                + product.getProductName());

            }

            if (product.getProductType()
                    != ProductType.FINISHED_PRODUCT) {

                throw new BusinessException(
                        "Only finished products can be sold.");

            }

            if (!products.add(product.getUuid().toString())) {

                throw new BusinessException(
                        "Duplicate product found : "
                                + product.getProductCode());

            }

        }

    }

    private void validateQuantity(
            CreateSalesInvoiceItemRequest item) {

        if (item.quantity()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new BusinessException(
                    "Quantity should be greater than zero.");

        }

    }

    private void validatePrice(
            CreateSalesInvoiceItemRequest item) {

        if (item.unitPrice()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new BusinessException(
                    "Unit Price should be greater than zero.");

        }

    }

}