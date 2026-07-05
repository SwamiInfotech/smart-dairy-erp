CREATE TABLE milk_type
(
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID NOT NULL UNIQUE,

    code            VARCHAR(30) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),

    display_order   INTEGER,

    active          BOOLEAN NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,

    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_milk_type_uuid
ON milk_type(uuid);

CREATE INDEX idx_milk_type_code
ON milk_type(code);