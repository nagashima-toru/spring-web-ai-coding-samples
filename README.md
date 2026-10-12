# Spring Web AI開発雛形プロジェクト

AI駆動開発（Claude Code）を前提とした Spring Boot + Next.js の Web アプリのリファレンス実装・プロジェクト雛形です。
SDD（仕様駆動開発）・SSoT（設計ドキュメントを唯一の正とする）の開発スタイルと、
基盤部品・サンプル業務・工程別 Skills を提供します。

## 技術スタック

- **backend**: Java 25 / Spring Boot 4.1 / Spring Security（JWT）/ MyBatis / Flyway / PostgreSQL 16 / Testcontainers / OpenAPI Generator
- **frontend**: Next.js 16 / TypeScript / shadcn/ui / TanStack Query / Orval / next-intl / Vitest / Storybook / Playwright
- **基盤**: ECS Fargate（AWS）/ GitHub Actions

## クイックスタート

```bash
# 前提: JDK 25 (Temurin), Node.js 24 + pnpm 9, Docker
git clone https://github.com/nagashima-toru/spring-web-ai-coding-samples.git
cd spring-web-ai-coding-samples

docker compose -f docker/compose.yaml up -d      # ローカル DB（PostgreSQL 16）
cd backend && ./mvnw clean verify                # ビルド＋全テスト＋静的解析＋カバレッジ
java -jar web-sample/target/web-sample-*.jar --spring.profiles.active=local   # API（:8080）

# 別ターミナル
cd frontend && pnpm install && pnpm dev          # 画面（http://localhost:3000）
```

`admin` / `admin123`（全操作）または `viewer` / `viewer123`（参照のみ）でログインできます（`local` プロファイルの初期データ）。

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [docs/architecture.md](docs/architecture.md) | 方式設計書（SSoT）: 構成・API 設計・認証/認可・エラー処理・DB・命名・テスト方針 |
| [docs/development-guide.md](docs/development-guide.md) | 開発手順: 環境構築〜Skills を使った工程フロー〜PR |
| [docs/coding-standards.md](docs/coding-standards.md) | コーディング規約（Java・TypeScript） |
| [CLAUDE.md](CLAUDE.md) | Claude Code 向けプロジェクトガイド（規約・禁止事項） |

## 構成

```
├── backend/
│   ├── web-core/      # 基盤部品（JWT 認証・Security 設定・例外階層と共通エラー応答・ページング）
│   └── web-sample/    # サンプル業務（auth 認証・message CRUD）＋ API 定義 openapi.yaml
├── frontend/
│   └── src/
│       ├── core/      # フロント基盤（API クライアント・認証・i18n・共通 UI）
│       └── features/  # 業務機能（messages）
├── docs/              # 方式設計・開発ガイド・コーディング規約（SSoT）
├── .claude/skills/    # 工程別 Skills（要件定義→設計→実装→テスト→レビュー→E2E）
├── vault/             # AI 協働ハーネスの作業領域（計画票・タスク票）
├── .github/workflows/ # CI（backend・frontend・E2E）
└── docker/            # ローカル用 PostgreSQL
```

## 案件で使うとき

1. このリポジトリをテンプレートとして新規リポジトリを作成
2. `docs/architecture.md` の前提（実行基盤・ロール・命名）を案件に合わせて改訂
3. `web-sample` の `message` と `frontend/src/features/messages` を参考に業務機能を作成（サンプルは削除してよい。`auth`・基盤部品・docs は残す）
4. Claude Code で `/requirements` から工程を開始（[開発ガイド](docs/development-guide.md) 参照）

## ライセンス

[MIT License](LICENSE) の下で公開しています。Copyright (c) 2026 Toru Nagashima

## 注意事項

- ローカル用の DB パスワード・JWT 署名鍵（`docker/compose.yaml`・`application-local.yml`）はローカル専用の固定値です。本番は Secrets Manager / SSM から環境変数で注入してください
- リフレッシュトークンの保管庫は既定でメモリ保持です。複数タスクで運用する場合は DB/Redis 実装に差し替えてください
- 本リポジトリは学習・雛形用のサンプルで、無保証です（LICENSE のとおり）
