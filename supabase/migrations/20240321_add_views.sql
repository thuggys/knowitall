-- Drop functions if they exist
DROP FUNCTION IF EXISTS increment_view(UUID);
DROP FUNCTION IF EXISTS get_view_count(UUID);

-- Drop table if it exists
DROP TABLE IF EXISTS views; 