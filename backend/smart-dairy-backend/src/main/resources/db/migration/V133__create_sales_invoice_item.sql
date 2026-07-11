CREATE TABLE sales_invoice_item
(
    id                  BIGSERIAL PRIMARY KEY,

    sales_invoice_id    BIGINT NOT NULL,

    product_id          BIGINT NOT NULL,

    quantity            NUMERIC(14,3) NOT NULL,

    unit_price          NUMERIC(12,2) NOT NULL,

    line_total          NUMERIC(12,2) NOT NULL,

    CONSTRAINT fk_sales_item_invoice
        FOREIGN KEY (sales_invoice_id)
        REFERENCES sales_invoice(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sales_item_product
        FOREIGN KEY (product_id)
        REFERENCES product(id)
);

CREATE INDEX idx_sales_item_invoice
    ON sales_invoice_item(sales_invoice_id);

CREATE INDEX idx_sales_item_product
    ON sales_invoice_item(product_id);