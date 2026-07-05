INSERT INTO payment_cycle
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
    'WEEKLY',
    'Weekly',
    'Weekly Payment',
    1,
    TRUE,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'MONTHLY',
    'Monthly',
    'Monthly Payment',
    2,
    TRUE,
    NOW(),
    NOW()
);