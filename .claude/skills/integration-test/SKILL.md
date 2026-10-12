---
name: integration-test
description: API 単位の結合テスト（Spring Boot Test + MockMvc + Testcontainers）を作成する。「結合テストを書いて」「API の IT を作って」「Testcontainers で API を検証して」のような発話や、単体テスト完了後の次工程として発動する。
---

# 結合テスト Skill

実 DB（Testcontainers の PostgreSQL 16、Flyway 適用済み）に対して API を実際に呼び、
ステータス・応答本文・DB の結果を検証する結合テストを作成する。認証・認可・エラー応答も通しで確かめる。

## 入力と出力（工程連鎖）

| | 内容 |
|---|---|
| 入力 | 実装コード＋詳細設計書（API 詳細・エラー処理設計・テスト観点） |
| 参照 | `backend/web-sample/src/test/java/.../AbstractIntegrationTest.java`（基底クラス）、既存 IT（`MessageApiIT`・`AuthApiIT`） |
| 出力 | `backend/web-sample/src/test/java/.../{機能}/{機能}ApiIT.java`（Failsafe が `*IT` を実行） |
| 次工程 | `/review-code` |

## 進め方

1. `docker info` で Docker が起動していることを確認する（未起動ならユーザーに起動を依頼）
2. 詳細設計書の API 詳細・エラー処理設計から、下表の観点ごとにテストケースを洗い出す
3. 既存 IT の型（下記「テストの構成」）に従って実装する
4. **検証ループ**: `cd backend && ./mvnw clean verify` を実行する（web-sample のカバレッジ80%はここで判定する）。
   失敗したら `target/failsafe-reports/` を読み、原因が**テストコード / 実装 / テストデータ・コンテナ設定**のどれかを判定してから修正し再実行する（最大3ラウンド）
   - `Could not find a valid Docker environment` は修正ループの対象外。即ユーザーに Docker の起動を依頼する

ループの共通ルールは `docs/development-guide.md` §5 に従う。

## テストの構成（必ず既存の型に従う）

- `AbstractIntegrationTest` を継承する（PostgreSQL コンテナ共有・`test` プロファイル・テストデータ初期化・`bearer(username, role)` を提供）
- 機能のテーブルを使う場合は、基底クラスの `TRUNCATE` 対象に追加するか、`@BeforeEach` で初期化する
- テストデータは各テストが `JdbcTemplate` で自前で投入する（ローカル用初期データに依存しない）
- 認証は `bearer("admin", "ADMIN")` 等でアクセストークンを作って付ける

## 必須の検証観点（API ごとに全て検討する）

| 観点 | 検証内容 |
|---|---|
| 正常系 | ステータス（200/201/204）・応答本文の値・`Location`・DB の結果 |
| 入力エラー | 項目チェック違反で 400 `validation-error` と `errors[].field` |
| 業務エラー | 存在しない（404）・重複（409）など、詳細設計のエラー処理設計どおりの type |
| 認証 | トークンなしで 401 |
| 認可 | 権限のないロールで 403 |
| 一覧 | 並び順・ページ情報（`totalElements`・`totalPages`）・`size` 上限超過 |

## 注意

- アサーションは件数だけでなく代表レコードの**値**まで検証する
- `Thread.sleep` を使わない（MockMvc は同期実行）
- Docker なしで確かめる時は `./mvnw clean verify -DskipITs -Djacoco.haltOnFailure=false`（この時 web-sample のカバレッジは判定しない）
