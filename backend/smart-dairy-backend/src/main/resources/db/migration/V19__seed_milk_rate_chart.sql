INSERT INTO milk_rate_chart
(
    uuid,
    branch_id,
    rate_category_id,
    collection_method_id,
    chart_name,
    effective_from,
    effective_to,
    active,
    remarks,
    created_at,
    updated_at,
    version
)
VALUES
(
    gen_random_uuid(),
    1,          -- Dhule Branch
    1,          -- STANDARD
    1,          -- FAT
    'Standard FAT Rate',
    DATE '2025-01-01',
    NULL,
    TRUE,
    'Standard FAT Rate',
    NOW(),
    NOW(),
    0
);