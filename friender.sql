\echo 'Delete and recreate friender db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE friender;
CREATE DATABASE friender;
\connect friender

\i friender-schema.sql
\i friender-seed.sql

-- \echo 'Delete and recreate jobly_test db?'
-- \prompt 'Return for yes or control-C to cancel > ' foo

-- DROP DATABASE jobly_test;
-- CREATE DATABASE jobly_test;
-- \connect jobly_test

-- \i jobly-schema.sql