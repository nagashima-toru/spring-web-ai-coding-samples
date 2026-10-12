-- ローカル開発・E2E テスト用の初期データ（local プロファイルでだけ適用する。本番には入れない）
-- admin / admin123（ADMIN）、viewer / viewer123（VIEWER）
INSERT INTO app.users (username, password_hash, role)
VALUES ('admin', '$2a$10$NeHSilgOVD86F1R95wMG9.5ayWUxfhx/Lom0ckgLTHpvxEQxV7IHG', 'ADMIN'),
       ('viewer', '$2a$10$Sq1TO1BxDitGHiDEJ2wn7OwTrPfq5f2d12ZZ7lM0Tu8jG43noKnte', 'VIEWER')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;

INSERT INTO app.messages (code, content, created_at, updated_at)
VALUES ('hello', 'Hello, World!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
