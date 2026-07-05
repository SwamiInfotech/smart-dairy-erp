CREATE TABLE company
(
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID NOT NULL UNIQUE,

    company_code    VARCHAR(20)  NOT NULL UNIQUE,
    company_name    VARCHAR(150) NOT NULL,

    owner_name      VARCHAR(150),
    mobile_no       VARCHAR(20),
    email           VARCHAR(100),
    gst_no          VARCHAR(30),

    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100),
    pincode         VARCHAR(10),

    logo            VARCHAR(255),

    active          BOOLEAN NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,

    version         BIGINT NOT NULL DEFAULT 0
);