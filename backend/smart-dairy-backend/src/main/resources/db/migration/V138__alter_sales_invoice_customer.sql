ALTER TABLE sales_invoice
ADD COLUMN customer_id BIGINT;

ALTER TABLE sales_invoice
ADD CONSTRAINT fk_sales_invoice_customer
FOREIGN KEY (customer_id)
REFERENCES customer(id);

CREATE INDEX idx_sales_invoice_customer
ON sales_invoice(customer_id);