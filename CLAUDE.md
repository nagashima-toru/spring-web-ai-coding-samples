# Spring Web AI開発雛形プロジェクト

AI駆動開発（Claude Code）を前提とした Spring Boot + Next.js Web アプリのリファレンス実装。
複数チーム・複数案件で再利用される雛形であり、**SDD（仕様駆動開発）・SSoT
（`docs/` 配下の設計ドキュメントが唯一の正。コードは設計から生成する）** で開発する。

## モジュール・ディレクトリ構成

| パス | 役割 |
|---|---|
| `backend/web-core/` | Web 基盤部品（JWT 認証・Security 設定・例外階層と共通エラー応答・ページング）。**全機能はここの部品を利用する** |
| `backend/web-sample/` | サンプル業務（`auth` 認証・`message` CRUD）。API 定義は `src/main/resources/api/openapi.yaml`（SSoT） |
| `frontend/src/core/` | フロント基盤（API クライアント（Orval 生成）・認証・i18n・共通 UI）。**全画面はここの部品を利用する** |
| `frontend/src/features/messages/` | サンプル業務の画面部品・フック・入力検証 |
| `docs/architecture.md` | **方式設計書（SSoT）**。全設計・実装はこれに準拠する |
| `docs/development-guide.md` | 開発手順（Skills を使った工程フロー・検証ループ・PR作成まで） |
| `docs/coding-standards.md` | コーディング規約（Java・TypeScript） |
| `docs/projects/{案件}/` | 案件別の要件定義書・設計書の格納先（Skills が生成） |
| `.claude/skills/` | 工程別 Skills とハーネス Skills |
| `config/` | 静的解析設定（Checkstyle / SpotBugs） |
| `docker/compose.yaml` | ローカル用 PostgreSQL 16 |

## 技術スタック（固定バージョン）

- Backend: Java 25 (Temurin) / Spring Boot 4.1 / Maven（`./mvnw`）/ MyBatis / Flyway / PostgreSQL 16 / Testcontainers 2系
- Frontend: Node.js 24 / pnpm / Next.js 16 / TypeScript / shadcn/ui / TanStack Query / Orval
- 実行基盤: AWS ECS Fargate

## ビルド・実行コマンド

```bash
cd backend
./mvnw clean verify   # 全体（コード生成＋単体＋結合(要Docker)＋静的解析＋カバレッジ80%）
./mvnw clean verify -DskipITs -Djacoco.haltOnFailure=false   # 結合テスト除外（カバレッジ不足では止めない）
docker compose -f ../docker/compose.yaml up -d   # ローカルDB起動
java -jar web-sample/target/web-sample-*.jar --spring.profiles.active=local   # admin/admin123・viewer/viewer123

cd frontend
pnpm generate:api                 # openapi.yaml から API クライアントを再生成（API 定義を変えたら必須）
pnpm lint && pnpm format:check && pnpm type-check && pnpm test:coverage && pnpm build
pnpm test:e2e                     # backend を local プロファイルで起動してから実行
```

## Skills（開発工程）

要件定義から順に、前工程の成果物が次工程の入力になる（詳細は docs/development-guide.md）。

| Skill | 工程 | 出力 |
|---|---|---|
| `/requirements` | 要件定義 | `docs/projects/{案件}/requirements.md` |
| `/basic-design` | 基本設計 | `docs/projects/{案件}/basic-design.md`（機能・画面・API・テーブル・権限） |
| `/detail-design` | 詳細設計 | `docs/projects/{案件}/detail-design/{機能ID}.md` |
| `/review-design` | 設計レビュー | 指摘一覧（チェックリスト準拠） |
| `/implementation` | 実装 | openapi.yaml → backend → frontend（基盤部品を必ず利用） |
| `/unit-test` | 単体テスト | backend `*Test.java`・frontend の単体/コンポーネントテスト |
| `/integration-test` | 結合テスト | backend `*ApiIT.java`（MockMvc＋Testcontainers） |
| `/review-code` | コードレビュー | 指摘一覧（チェックリスト準拠） |
| `/e2e-test` | E2E テスト | `frontend/tests/e2e/*.spec.ts`・実施記録 |

`/sdd-pipeline` は `basic-design`〜`e2e-test` と PR 作成までを一気通貫で実行する。確定済みの requirements.md がある案件に使う。
詳細設計がレビュー済みの機能の `implementation`〜`e2e-test` はハーネス（`/plan`・`/run`）でも進められる（docs/development-guide.md §2.4）。

## 禁止事項

- **基盤部品（web-core）で実現できる処理の独自実装禁止**（認証・エラー応答・ページング・ログ無害化）
- **API 定義（openapi.yaml）を経ない API の追加・変更禁止**（Controller は生成インタフェースを実装する）
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
