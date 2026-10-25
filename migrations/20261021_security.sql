-- Review and run once with a migration/owner connection, before deploying the app.
-- Application traffic must never have CREATE/ALTER privileges.
BEGIN;
CREATE TABLE IF NOT EXISTS security_rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  count integer NOT NULL CHECK (count > 0)
);
CREATE TABLE IF NOT EXISTS review_reactions (
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  actor text NOT NULL,
  type text NOT NULL CHECK (type IN ('helpful', 'funny')),
  PRIMARY KEY (review_id, actor, type)
);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count integer NOT NULL DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS funny_count integer NOT NULL DEFAULT 0;
-- NOT VALID preserves historical rows while enforcing constraints on new writes.
ALTER TABLE reviews ADD CONSTRAINT reviews_rating_valid CHECK (rating BETWEEN 1 AND 5) NOT VALID;
ALTER TABLE reviews ADD CONSTRAINT reviews_text_bounded CHECK
  (char_length(comment) <= 4000 AND char_length(name) <= 100 AND char_length(image_url) <= 2048) NOT VALID;
-- No browser Data API is used. Deny accidental PUBLIC grants.
REVOKE ALL ON TABLE hospitals, reviews, security_rate_limits, review_reactions FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
DO $security$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'food_runtime') THEN
    CREATE ROLE food_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END
$security$;
GRANT USAGE ON SCHEMA public TO food_runtime;
GRANT SELECT ON hospitals, reviews TO food_runtime;
GRANT INSERT (name, location) ON hospitals TO food_runtime;
GRANT INSERT (hospital_id, rating, comment, name, image_url) ON reviews TO food_runtime;
GRANT UPDATE (helpful_count, funny_count) ON reviews TO food_runtime;
GRANT SELECT, INSERT, UPDATE ON security_rate_limits TO food_runtime;
GRANT SELECT, INSERT, DELETE ON review_reactions TO food_runtime;
COMMIT;
-- Create a separate LOGIN via your database provider and grant food_runtime to
-- that login. Set only that login's pooled URL in Vercel POSTGRES_URL.
-- Keep the owner connection exclusively for reviewed migrations.
-- Schedule this maintenance through an admin connection, e.g. daily:
-- DELETE FROM security_rate_limits WHERE window_start < now() - interval '2 days';
