-- ============================================================================
-- Version      : V16
-- Description  : Create Shift Table
-- Author       : Dipak Thakare
-- ============================================================================

CREATE TABLE shift
(
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID NOT NULL UNIQUE,

    code                VARCHAR(20) NOT NULL UNIQUE,
    name                VARCHAR(50) NOT NULL,
    description         VARCHAR(255),

    display_order       INTEGER NOT NULL DEFAULT 1,

    active              BOOLEAN NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL,

    version             BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_shift_uuid
ON shift(uuid);

CREATE INDEX idx_shift_code
ON shift(code);