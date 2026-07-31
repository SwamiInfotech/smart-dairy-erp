package com.smartdairy.collectionmethod.entity;

import com.smartdairy.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "collection_method",
        uniqueConstraints = {
                @jakarta.persistence.UniqueConstraint(
                        name = "uk_collection_method_tenant_code",
                        columnNames = {"tenant_uuid", "code"}
                )
        }
)
public class CollectionMethod extends BaseEntity {
    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(nullable = false)
    private Boolean active = true;
}