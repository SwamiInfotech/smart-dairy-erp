package com.smartdairy.production.entity;

import com.smartdairy.product.entity.Product;
import com.smartdairy.production.enums.ProductionItemType;
import com.smartdairy.tenant.context.TenantContextHolder;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "production_batch_item")
@Filter(name = "tenantFilter", condition = "tenant_uuid = :tenantUuid")
public class ProductionBatchItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_batch_id", nullable = false)
    private ProductionBatch productionBatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private ProductionItemType itemType;

    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal quantity;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "tenant_uuid", nullable = false)
    private UUID tenantUuid;

    @Column(name = "tenant_id", nullable = false, updatable = false, insertable = false)
    private Long tenantId;

    @PrePersist
    protected void onCreate() {
        assignTenantIfMissing();
    }

    @PreUpdate
    protected void onUpdate() {
        assignTenantIfMissing();
    }

    private void assignTenantIfMissing() {
        if (this.tenantUuid == null) {
            this.tenantUuid = TenantContextHolder.getTenantUuidOrFallback();
        }
    }

}