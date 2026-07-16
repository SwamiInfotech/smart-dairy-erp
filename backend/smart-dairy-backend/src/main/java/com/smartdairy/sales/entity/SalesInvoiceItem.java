package com.smartdairy.sales.entity;

import com.smartdairy.product.entity.Product;
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
@Table(name = "sales_invoice_item")
@Filter(name = "tenantFilter", condition = "tenant_uuid = :tenantUuid")
public class SalesInvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sales_invoice_id", nullable = false)
    private SalesInvoice salesInvoice;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false, precision = 14, scale = 3)
    private BigDecimal quantity;

    @Column(name = "unit_price", nullable = false, precision = 14, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "line_total", nullable = false, precision = 14, scale = 2)
    private BigDecimal lineTotal;

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