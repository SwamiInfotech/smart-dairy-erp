package com.smartdairy.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantDTO {
    private UUID uuid;
    private String code;
    private String name;
    private String role;
    private Boolean isPrimary;
    private Boolean isOwner;
    private Boolean isAdmin;
    private Boolean active;
    private LocalDateTime createdAt;
}
