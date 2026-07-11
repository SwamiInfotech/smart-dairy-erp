CREATE TABLE production_batch_item
(
    id                      BIGSERIAL PRIMARY KEY,

    production_batch_id     BIGINT NOT NULL,

    product_id              BIGINT NOT NULL,

    item_type               VARCHAR(20) NOT NULL,

    quantity                NUMERIC(14,3) NOT NULL,

    remarks                 TEXT,

    CONSTRAINT fk_production_batch_item_batch
        FOREIGN KEY (production_batch_id)
        REFERENCES production_batch(id),

    CONSTRAINT fk_production_batch_item_product
        FOREIGN KEY (product_id)
        REFERENCES product(id)
);

CREATE INDEX idx_production_item_batch
ON production_batch_item(production_batch_id);

CREATE INDEX idx_production_item_product
ON production_batch_item(product_id);