-- ============================================================================
-- Version      : V8
-- Description  : Create Farmer Table
-- Author       : Dipak Thakare
-- ============================================================================

CREATE TABLE farmer
(
    id                      BIGSERIAL PRIMARY KEY,
    uuid                    UUID NOT NULL UNIQUE,

    branch_id               BIGINT NOT NULL,

    farmer_code             VARCHAR(20) NOT NULL,
    farmer_name             VARCHAR(150) NOT NULL,

    mobile_no               VARCHAR(20),
    alternate_mobile_no     VARCHAR(20),
    email                   VARCHAR(100),

    address                 TEXT,
    village                 VARCHAR(100) NOT NULL,
    taluka                  VARCHAR(100),
    district                VARCHAR(100),
    state                   VARCHAR(100),
    pincode                 VARCHAR(10),

    aadhar_no               VARCHAR(20),
    pan_no                  VARCHAR(20),

    photo_url               VARCHAR(500),
    remarks                 TEXT,

    active                  BOOLEAN NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL,

    version                 BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_farmer_branch
        FOREIGN KEY (branch_id)
        REFERENCES branch(id),

    CONSTRAINT uk_farmer_branch_code
        UNIQUE (branch_id, farmer_code)
);

CREATE INDEX idx_farmer_uuid
    ON farmer(uuid);

CREATE INDEX idx_farmer_branch
    ON farmer(branch_id);

CREATE INDEX idx_farmer_code
    ON farmer(farmer_code);

CREATE INDEX idx_farmer_name
    ON farmer(farmer_name);

CREATE INDEX idx_farmer_mobile
    ON farmer(mobile_no);

CREATE INDEX idx_farmer_village
    ON farmer(village);