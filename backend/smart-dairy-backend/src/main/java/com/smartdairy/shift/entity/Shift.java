package com.smartdairy.shift.entity;

import com.smartdairy.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "shift",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_shift_tenant_code",
                        columnNames = {"tenant_uuid", "code"}
                )
        }
)
public class Shift extends BaseEntity {

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(nullable = false)
    private Boolean active = true;

}