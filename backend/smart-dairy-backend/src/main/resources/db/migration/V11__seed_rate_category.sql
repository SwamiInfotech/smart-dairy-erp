INSERT INTO rate_category
(
    uuid,
    code,
    name,
    description,
    display_order,
    active,
    created_at,
    updated_at
)
VALUES
(
    gen_random_uuid(),
    'STANDARD',
    'Standard',
    'Standard Rate',
    1,
    TRUE,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'PREMIUM',
    'Premium',
    'Premium Rate',
    2,
    TRUE,
    NOW(),
    NOW()
);