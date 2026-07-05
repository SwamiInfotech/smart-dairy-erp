CREATE TABLE branch
(
    id BIGSERIAL PRIMARY KEY,

    uuid UUID NOT NULL UNIQUE,

    company_id BIGINT NOT NULL,

    branch_code VARCHAR(20) NOT NULL,

    branch_name VARCHAR(150) NOT NULL,

    manager_name VARCHAR(150),

    mobile_no VARCHAR(20),

    email VARCHAR(100),

    address TEXT,

    city VARCHAR(100),

    state VARCHAR(100),

    country VARCHAR(100),

    pincode VARCHAR(10),

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_branch_company
        FOREIGN KEY(company_id)
        REFERENCES company(id)
);

CREATE INDEX idx_branch_company
ON branch(company_id);

CREATE INDEX idx_branch_uuid
ON branch(uuid);

CREATE INDEX idx_branch_code
ON branch(branch_code);