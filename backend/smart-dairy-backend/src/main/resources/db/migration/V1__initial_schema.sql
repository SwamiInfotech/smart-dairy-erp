-- ======================================================================
-- Smart Dairy ERP
-- Flyway Migration : V1
-- Description      : Initial Database Setup
-- Author           : Dipak Thakare
-- ======================================================================

-- Enable UUID generation support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================================================
-- Future Extensions (Enable only when required)
-- ======================================================================

-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "citext";
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ======================================================================
-- End of Migration
-- ======================================================================