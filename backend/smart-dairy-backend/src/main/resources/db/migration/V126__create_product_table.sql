CREATE TABLE product
(
    id                  BIGSERIAL PRIMARY KEY,

    uuid                UUID NOT NULL UNIQUE,

    product_code        VARCHAR(30) NOT NULL UNIQUE,

    product_name        VARCHAR(150) NOT NULL,

    product_type        VARCHAR(30) NOT NULL,

    unit_type           VARCHAR(20) NOT NULL,

    active              BOOLEAN NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version             BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_name
ON product(product_name);