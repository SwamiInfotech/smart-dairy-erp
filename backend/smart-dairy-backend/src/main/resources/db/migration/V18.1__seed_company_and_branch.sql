-- Seed default company
INSERT INTO company (
    uuid, company_code, company_name, owner_name, mobile_no, email,
    address, city, state, country, pincode,
    active, created_at, updated_at, version
)
VALUES (
    gen_random_uuid(), 'CMP001', 'Smart Dairy Pvt Ltd', 'Owner Name', '9999999999', 'admin@smartdairy.com',
    'Head Office Address', 'City', 'State', 'India', '000000',
    TRUE, now(), now(), 0
);

-- Seed default branch, linked to the company just created
INSERT INTO branch (
    uuid, company_id, branch_code, branch_name, manager_name, mobile_no, email,
    address, city, state, country, pincode,
    active, created_at, updated_at, version
)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM company WHERE company_code = 'CMP001'),
    'BR001', 'Main Branch', 'Manager Name', '9999999999', 'branch@smartdairy.com',
    'Branch Address', 'City', 'State', 'India', '000000',
    TRUE, now(), now(), 0
);