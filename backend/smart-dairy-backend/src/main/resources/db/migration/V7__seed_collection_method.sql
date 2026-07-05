INSERT INTO collection_method
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
    'FAT',
    'FAT',
    'Milk collection based on Fat and SNF',
    1,
    TRUE,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'MAVA',
    'MAVA',
    'Milk collection based on Mava',
    2,
    TRUE,
    NOW(),
    NOW()
);