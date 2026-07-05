-- D1 Seed: Admin account
-- Run after 0000_init.sql

-- Admin account (ID: 11000, email: admin@example.com, password: admin123456)
INSERT INTO users (id, username, email, password_hash, role, status, failed_login_attempts, display_name, email_verified_at, created_at, updated_at)
VALUES (11000, 'admin', 'admin@example.com', '$2b$12$dgCg9Q7USgIiICX4nAvDFuvgfj.AnDXZ.ZVhhdrrLi1.Rx8BkHqhO', 'admin', 'active', 0, 'System Administrator', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);

-- Admin user settings
INSERT INTO user_settings (user_id, theme, locale, two_factor_enabled, email_notifications, updated_at)
VALUES (11000, 'system', 'en', 0, 1, strftime('%s', 'now') * 1000);

-- Update ID sequence to start after admin
UPDATE id_sequence SET current_value = 11999 WHERE name = 'user_id';
