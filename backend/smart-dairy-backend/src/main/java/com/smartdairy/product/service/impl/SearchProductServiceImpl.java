package com.smartdairy.product.service.impl;

import com.smartdairy.product.dto.ProductCodeDebugResponse;
import com.smartdairy.product.dto.ProductResponse;
import com.smartdairy.product.dto.ProductSearchRequest;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.mapper.ProductMapper;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.product.service.SearchProductService;
import com.smartdairy.product.specification.ProductSpecification;
import com.smartdairy.tenant.context.TenantContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SearchProductServiceImpl implements SearchProductService {

    private static final Pattern CODE_PATTERN = Pattern.compile("^(.*?)(\\d+)$");

    private final ProductRepository repository;
    private final ProductMapper mapper;

    private record NextCodeComputation(String maxDetectedProductCode, String nextProductCode) {
    }

    @Override
    public Page<ProductResponse> search(
            ProductSearchRequest request,
            Pageable pageable) {

        return repository.findAll(
                        ProductSpecification.search(request),
                        pageable)
                .map(mapper::toResponse);
    }

    @Override
    public String getNextProductCode() {
        return computeNextCode(repository.findAll()).nextProductCode();
    }

    @Override
    public ProductCodeDebugResponse getNextProductCodeDebug() {
        List<Product> products = repository.findAll();
        NextCodeComputation computation = computeNextCode(products);

        return new ProductCodeDebugResponse(
                TenantContextHolder.getTenantUuidOrFallback(),
                products.size(),
                computation.maxDetectedProductCode(),
                computation.nextProductCode());
    }

    private NextCodeComputation computeNextCode(List<Product> products) {
        int highestNumber = 0;
        String selectedPrefix = "PRD";
        int selectedWidth = 3;
        String maxCode = "";

        for (Product product : products) {
            String code = product.getProductCode();
            if (code == null || code.isBlank()) {
                continue;
            }

            Matcher matcher = CODE_PATTERN.matcher(code.trim());
            if (!matcher.matches()) {
                continue;
            }

            String prefix = matcher.group(1);
            String numberPart = matcher.group(2);
            int parsedNumber;
            try {
                parsedNumber = Integer.parseInt(numberPart);
            } catch (NumberFormatException exception) {
                continue;
            }

            if (parsedNumber > highestNumber) {
                highestNumber = parsedNumber;
                selectedPrefix = (prefix == null || prefix.isBlank()) ? "PRD" : prefix;
                selectedWidth = numberPart.length();
                maxCode = code.trim();
            }
        }

        int nextNumber = highestNumber + 1;
        return new NextCodeComputation(
                maxCode,
                selectedPrefix + String.format("%0" + selectedWidth + "d", nextNumber));
    }
}