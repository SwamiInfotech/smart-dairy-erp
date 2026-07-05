INSERT INTO milk_type
(uuid, code, name, description, display_order, active, created_at, updated_at)
VALUES

(gen_random_uuid(),'COW','Cow Milk','Cow Milk',1,true,NOW(),NOW()),

(gen_random_uuid(),'BUFFALO','Buffalo Milk','Buffalo Milk',2,true,NOW(),NOW());