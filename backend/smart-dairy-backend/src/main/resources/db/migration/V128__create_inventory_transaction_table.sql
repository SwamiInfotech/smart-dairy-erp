CREATE TABLE inventory_transaction
(
    id                          BIGSERIAL PRIMARY KEY,

    uuid                        UUID NOT NULL UNIQUE,

    branch_id                   BIGINT NOT NULL,

    product_id                  BIGINT NOT NULL,

    transaction_type            VARCHAR(50) NOT NULL,

    reference_uuid              UUID,

    transaction_date            TIMESTAMP WITH TIME ZONE NOT NULL,

    quantity_in                 NUMERIC(14,3) NOT NULL DEFAULT 0,

    quantity_out                NUMERIC(14,3) NOT NULL DEFAULT 0,

    remarks                     TEXT,

    active                      BOOLEAN NOT NULL DEFAULT TRUE,

    created_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version                     BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_inventory_branch
        FOREIGN KEY (branch_id)
        REFERENCES branch(id),

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES product(id)
);

CREATE INDEX idx_inventory_product
ON inventory_transaction(product_id);

CREATE INDEX idx_inventory_date
ON inventory_transaction(transaction_date);

CREATE INDEX idx_inventory_reference
ON inventory_transaction(reference_uuid);