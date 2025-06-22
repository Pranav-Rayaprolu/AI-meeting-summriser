-- Enable uuid extension for deterministic UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Convert user_id column to UUID using uuid_generate_v5
ALTER TABLE meetings
ALTER COLUMN user_id TYPE UUID
USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', user_id::text); 