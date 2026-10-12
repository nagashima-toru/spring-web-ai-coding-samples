# Spring Web AI開発雛形プロジェクト

AI駆動開発（Claude Code）を前提とした Spring Boot + Next.js Web アプリのリファレンス実装。
複数チーム・複数案件で再利用される雛形であり、**SDD（仕様駆動開発）・SSoT
（`docs/` 配下の設計ドキュメントが唯一の正。コードは設計から生成する）** で開発する。

## モジュール・ディレクトリ構成

| パス | 役割 |
|---|---|
| `backend/` | Spring Boot API（Maven マルチモジュール） |
| `frontend/` | Next.js アプリ |
| `docs/` | 設計ドキュメント（SSoT） |
| `docs/projects/{案件}/` | 案件別の要件定義書・設計書の格納先（Skills が生成） |
| `.claude/skills/` | 工程別 Skills とハーネス Skills |
| `config/` | 静的解析設定（Checkstyle / SpotBugs） |
| `docker/compose.yaml` | ローカル用 PostgreSQL 16 |

## 技術スタック（固定バージョン）

- Backend: Java 25 (Temurin) / Spring Boot 4.1 / Maven（`./mvnw`）/ MyBatis / Flyway / PostgreSQL 16 / Testcontainers 2系
- Frontend: Node.js 24 / pnpm / Next.js 16 / TypeScript / shadcn/ui / TanStack Query / Orval
- 実行基盤: AWS ECS Fargate

## 禁止事項

- 機密情報のコード直書き禁止（Secrets Manager / SSM から環境変数注入）
- 依存バージョンの各モジュール個別指定禁止（親POMで一元管理）
- Flyway 適用済みマイグレーションファイルの変更禁止（新規Vファイル追加）
- 設計書と異なる実装（先に設計書を改訂してから実装する）

## 規約サマリ

- ドキュメント・コミットメッセージは日本語。テストメソッド名は日本語（条件＿期待結果）
- ブランチ: GitHub Flow（main + feature、PR必須。テンプレートのチェック欄を埋める）

<!-- ai-harness:begin v1 -->
# AI協働ハーネス 共通ルール
@.claude/ai-harness.md
<!-- ai-harness:end -->
