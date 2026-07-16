-- V150: Fix all global unique constraints to be tenant-scoped
-- Affects: company, milk_collection, loan, advance, settlement, payment,
--          production_batch, sales_invoice, customer, customer_payment
-- Pattern: DROP global constraint → ADD UNIQUE(tenant_uuid, column)

DO $$
BEGIN

    -- =========================================================
    -- company: company_code
    -- =========================================================
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'company_company_code_key') THEN
        ALTER TABLE company DROP CONSTRAINT company_company_code_key;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_company_tenant_code') THEN
        ALTER TABLE company ADD CONSTRAINT uk_company_tenant_code UNIQUE (tenant_uuid, company_code);
    END IF;

    -- =========================================================
    -- milk_collection: collection_no
    -- =========================================================
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'milk_collection_collection_no_key') THEN
        ALTER TABLE milk_collection DROP CONSTRAINT milk_collection_collection_no_key;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_milk_collection_tenant_no') THEN
        ALTER TABLE milk_collection ADD CONSTRAINT uk_milk_collection_tenant_no UNIQUE (tenant_uuid, collection_no);
    END IF;

    -- =========================================================
    -- loan: loan_no
    -- =========================================================
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'loan_loan_no_key') THEN
        ALTER TABLE loan DROP CONSTRAINT loan_loan_no_key;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_loan_tenant_no') THEN
        ALTER TABLE loan ADD CONSTRAINT uk_loan_tenant_no UNIQUE (tenant_uuid, loan_no);
    END IF;

    -- =========================================================
    -- advance: advance_no
    -- =========================================================
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'advance_advance_no_key') THEN
        ALTER TABLE advance DROP CONSTRAINT advance_advance_no_key;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_advance_tenant_no') THEN
        ALTER TABLE advance ADD CONSTRAINT uk_advance_tenant_no UNIQUE (tenant_uuid, advance_no);
    END IF;

    -- =========================================================
    -- settlement: settlement_no
    -- =========================================================
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'settlement_settlement_no_key') THEN
        ALTER TABLE settlement DROP CONSTRAINT settlement_settlement_no_key;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_settlement_tenant_no') THEN
        ALTER TABLE settlement ADD CONSTRAINT uk_settlement_tenant_no UNIQUE (tenant_uuid, settlement_no);
    END IF;

    -- =========================================================
    -- payment: payment_no
    -- (settlement_id unique left as-is: 1:1 FK, globally unique PK already)
    -- =========================================================
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_payment_no_key') THEN
        ALTER TABLE payment DROP CONSTRAINT payment_payment_no_key;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_payment_tenant_no') THEN
        ALTER TABLE payment ADD CONSTRAINT uk_payment_tenant_no UNIQUE (tenant_uuid, payment_no);
    END IF;

    -- =========================================================
    -- production_batch: batch_no
    -- =========================================================
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'production_batch_batch_no_key') THEN
        ALTER TABLE production_batch DROP CONSTRAINT production_batch_batch_no_key;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_production_batch_tenant_no') THEN
        ALTER TABLE production_batch ADD CONSTRAINT uk_production_batch_tenant_no UNIQUE (tenant_uuid, batch_no);
    END IF;

    -- =========================================================
    -- sales_invoice: invoice_no
    -- =========================================================
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_invoice_invoice_no_key') THEN
        ALTER TABLE sales_invoice DROP CONSTRAINT sales_invoice_invoice_no_key;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_sales_invoice_tenant_no') THEN
        ALTER TABLE sales_invoice ADD CONSTRAINT uk_sales_invoice_tenant_no UNIQUE (tenant_uuid, invoice_no);
    END IF;

    -- =========================================================
    -- customer: customer_code (was named uk_customer_code)
    -- =========================================================
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_customer_code') THEN
        ALTER TABLE customer DROP CONSTRAINT uk_customer_code;
    END IF;
    -- also drop auto-named variant if created by inline UNIQUE
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_customer_code_key') THEN
        ALTER TABLE customer DROP CONSTRAINT customer_customer_code_key;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_customer_tenant_code') THEN
        ALTER TABLE customer ADD CONSTRAINT uk_customer_tenant_code UNIQUE (tenant_uuid, customer_code);
    END IF;

    -- =========================================================
    -- customer_payment: payment_no
    -- =========================================================
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_payment_payment_no_key') THEN
        ALTER TABLE customer_payment DROP CONSTRAINT customer_payment_payment_no_key;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_customer_payment_tenant_no') THEN
        ALTER TABLE customer_payment ADD CONSTRAINT uk_customer_payment_tenant_no UNIQUE (tenant_uuid, payment_no);
    END IF;

END $$;
