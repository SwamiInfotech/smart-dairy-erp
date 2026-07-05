-- ============================================================================
-- Version      : V17
-- Description  : Seed Shift Master
-- Author       : Dipak Thakare
-- ============================================================================

INSERT INTO shift
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
    'MORNING',
    'Morning',
    'Morning Milk Collection',
    1,
    TRUE,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'EVENING',
    'Evening',
    'Evening Milk Collection',
    2,
    TRUE,
    NOW(),
    NOW()
);