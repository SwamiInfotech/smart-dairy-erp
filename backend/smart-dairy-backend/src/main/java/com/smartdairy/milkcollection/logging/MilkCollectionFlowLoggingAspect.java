package com.smartdairy.milkcollection.logging;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.time.temporal.Temporal;
import java.util.Arrays;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Aspect
@Component
@Slf4j
public class MilkCollectionFlowLoggingAspect {

    @Around(
            "execution(* com.smartdairy.milkcollection.controller..*(..))"
                    + " || execution(* com.smartdairy.milkcollection.service..*(..))"
                    + " || execution(* com.smartdairy.milkcollection.repository..*(..))")
    public Object logMilkCollectionFlow(ProceedingJoinPoint joinPoint) throws Throwable {
        long startedAt = System.nanoTime();
        String method = joinPoint.getSignature().toShortString();
        String arguments = formatArguments(joinPoint.getArgs());

        log.info("MilkCollection flow started: method={}, args={}", method, arguments);

        try {
            Object result = joinPoint.proceed();
            long elapsedMs = (System.nanoTime() - startedAt) / 1_000_000;
            log.info(
                    "MilkCollection flow completed: method={}, elapsedMs={}, result={}",
                    method,
                    elapsedMs,
                    formatResult(result));
            return result;
        } catch (Throwable ex) {
            long elapsedMs = (System.nanoTime() - startedAt) / 1_000_000;
            log.warn(
                    "MilkCollection flow failed: method={}, elapsedMs={}, errorType={}, message={}",
                    method,
                    elapsedMs,
                    ex.getClass().getSimpleName(),
                    ex.getMessage());
            throw ex;
        }
    }

    private String formatArguments(Object[] args) {
        if (args == null || args.length == 0) {
            return "[]";
        }

        return Arrays.stream(args)
                .map(this::summarizeValue)
                .collect(Collectors.joining(", ", "[", "]"));
    }

    private String formatResult(Object result) {
        if (result == null) {
            return "null";
        }

        if (result instanceof Page<?> page) {
            return "Page(contentSize=" + page.getNumberOfElements()
                    + ", totalElements=" + page.getTotalElements()
                    + ", page=" + page.getNumber()
                    + ", size=" + page.getSize()
                    + ")";
        }

        if (result instanceof Collection<?> collection) {
            return "Collection(size=" + collection.size() + ")";
        }

        return summarizeValue(result);
    }

    private String summarizeValue(Object value) {
        if (value == null) {
            return "null";
        }

        if (value instanceof UUID
                || value instanceof Number
                || value instanceof Boolean
                || value instanceof Enum<?>
                || value instanceof Temporal
                || value instanceof CharSequence) {
            return String.valueOf(value);
        }

        if (value instanceof Pageable pageable) {
            return "Pageable(page=" + pageable.getPageNumber()
                    + ", size=" + pageable.getPageSize()
                    + ", sort=" + pageable.getSort()
                    + ")";
        }

        if (value instanceof Collection<?> collection) {
            return "Collection(size=" + collection.size() + ")";
        }

        if (value instanceof Map<?, ?> map) {
            return "Map(size=" + map.size() + ")";
        }

        Method uuidGetter = findNoArgMethod(value.getClass(), "getUuid");
        if (uuidGetter != null) {
            try {
                Object uuid = uuidGetter.invoke(value);
                return value.getClass().getSimpleName() + "(uuid=" + uuid + ")";
            } catch (ReflectiveOperationException ignored) {
                return value.getClass().getSimpleName();
            }
        }

        if (value.getClass().isRecord()) {
            return String.valueOf(value);
        }

        return value.getClass().getSimpleName();
    }

    private Method findNoArgMethod(Class<?> type, String methodName) {
        try {
            return type.getMethod(methodName);
        } catch (NoSuchMethodException ex) {
            return null;
        }
    }
}
