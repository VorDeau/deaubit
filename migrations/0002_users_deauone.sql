-- Remove standalone auth fields from users table
-- Users are now managed by DeauOne; DeauBit only stores a shadow reference

ALTER TABLE users DROP COLUMN password;
ALTER TABLE users DROP COLUMN verified_at;
ALTER TABLE users DROP COLUMN otp_secret;
ALTER TABLE users DROP COLUMN otp_expires_at;
ALTER TABLE users DROP COLUMN reset_token;
ALTER TABLE users DROP COLUMN reset_token_expiry;
