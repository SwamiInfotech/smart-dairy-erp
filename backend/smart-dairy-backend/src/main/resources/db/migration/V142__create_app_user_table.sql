CREATE TABLE IF NOT EXISTS app_user
(
    id            BIGSERIAL PRIMARY KEY,
    uuid          UUID NOT NULL UNIQUE,
    username      VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(150) NOT NULL,
    role          VARCHAR(30) NOT NULL,
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version       BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_app_user_username UNIQUE (username),
    CONSTRAINT chk_app_user_role CHECK (role IN ('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'))
);

ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS uuid UUID,
    ADD COLUMN IF NOT EXISTS username VARCHAR(100),
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS role VARCHAR(30),
    ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_app_user_username'
    ) THEN
        ALTER TABLE app_user
            ADD CONSTRAINT uk_app_user_username UNIQUE (username);
    END IF;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_app_user_role'
    ) THEN
        ALTER TABLE app_user
            ADD CONSTRAINT chk_app_user_role
                CHECK (role IN ('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'));
    END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_username_lower
ON app_user ((LOWER(username)));
