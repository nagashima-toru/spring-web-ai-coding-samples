---
name: implementation
description: 詳細設計書を入力に機能を実装する（API 定義→backend→frontend）。「ORDER-001 を実装して」「詳細設計書どおりにコードを書いて」「この API と画面を実装して」のような発話や、設計レビュー完了後の次工程として発動する。API・ユースケース・Mapper・画面部品の新規実装や修正の依頼全般で積極的に使用する。
---

# 実装 Skill

詳細設計書を入力に、基盤部品（web-core・frontend core）を利用して機能を実装する。

## 入力と出力（工程連鎖）

| | 内容 |
|---|---|
| 入力 | `docs/projects/{案件名}/detail-design/{機能ID}.md`（レビュー済みであること） |
| 参照 | `docs/coding-standards.md`、`docs/architecture.md`、サンプル（`message` 機能） |
| 出力 | 下表の成果物一式 |
| 次工程 | `/unit-test` → `/integration-test` → `/review-code` |

### 出力ファイルの格納先

| 成果物 | 場所 |
|---|---|
| API 定義 | `backend/web-sample/src/main/resources/api/openapi.yaml`（追加・変更） |
| Controller | `backend/web-sample/src/main/java/.../{機能}/presentation/{機能}Controller.java` |
| ユースケース | `.../{機能}/application/{動詞}{対象}UseCase.java` |
| ドメイン（モデル・リポジトリ IF・業務例外） | `.../{機能}/domain/` |
| リポジトリ実装・Mapper | `.../{機能}/infrastructure/` ＋ `src/main/resources/mapper/{エンティティ}Mapper.xml` |
| Flyway | `src/main/resources/db/migration/V{次番}__{内容}.sql`（既存ファイル変更禁止） |
| frontend 生成コード | `frontend/src/core/api/generated/`（`pnpm generate:api` で生成。手で書かない） |
| 画面部品・フック・検証 | `frontend/src/features/{機能}/components/`・`hooks/`・`validations.ts`・`query-keys.ts` |
| ページ | `frontend/src/app/{パス}/page.tsx`（features の部品を組み立てるだけ） |
| 文言 | `frontend/messages/{ja,en}.json` |

## 進め方

1. 詳細設計書を読み、レビュー済みか確認する（未レビューならユーザーへ確認）
2. **API 定義**: 詳細設計 §2.2 の追加分を openapi.yaml に反映する
3. **backend**: `cd backend && ./mvnw -q compile` でインタフェースを生成し、domain → infrastructure → application → presentation の順に実装する。Flyway を追加する
4. **frontend**: `cd frontend && pnpm generate:api` で生成し、features に画面部品・フックを実装する。文言を ja/en 両方に追加する
5. **設計との差異が必要になったら、コードを書く前に設計書の改訂を提案する**（SSoT）
6. **検証ループ（backend）**: `./mvnw clean verify -DskipITs -Djacoco.haltOnFailure=false` を実行する。失敗したら
   レポート（`docs/development-guide.md` §5.1）を読んで修正し再実行する（最大3ラウンド）
7. **検証ループ（frontend）**: `pnpm lint && pnpm type-check && pnpm test --run` を実行する。失敗したら修正し再実行する（最大3ラウンド）

ループの共通ルール（上限・早期エスカレーション・検証を弱める反則の禁止）は `docs/development-guide.md` §5 に従う。

## 最重要ルール: 基盤部品を使わず独自実装してはならない

| やりたいこと | 使う部品 |
|---|---|
| 認証・トークン | web-core `TokenProvider` / `RefreshTokenStore`（auth 機能を流用する） |
| 公開 API（認証不要）の追加 | `app.security.public-paths` に追加（`SecurityFilterChain` を定義しない） |
| 認可 | Controller の `@PreAuthorize("hasRole('ADMIN')")` |
| エラー応答 | `ResourceNotFoundException` / `ResourceConflictException` / `InvalidInputException` のサブクラスを送出 |
| ページング | `PageQuery` / `PageResult` |
| 現在時刻 | `Clock` Bean |
| ログに利用者入力を出す | `LogSanitizer.sanitize()` |
| API 呼出（frontend） | Orval 生成フック（`core/api/generated`）。axios を直接呼ばない |
| ロールによる表示制御（frontend） | `core/auth` の `RoleBasedComponent` / `usePermission` |
| エラー表示（frontend） | `core/hooks/useApiError`・`core/components/ErrorMessage` |
| 共通 UI（frontend） | `core/components/ui`（shadcn/ui）・`Pagination`・`Loading` |

基盤部品で実現できない場合は、業務側に書かず **基盤への機能追加を提案**する。

## 全機能共通の必須実装

- API ごとの `@PreAuthorize`（認可ロールは詳細設計どおり）
- 更新系ユースケースの `@Transactional`、参照系の `@Transactional(readOnly = true)`
- 一意制約違反（`DuplicateKeyException`）の業務例外への変換（リポジトリ実装）
- SQL は Mapper XML・スキーマ修飾（`app.xxx`）・`#{}` バインド・一意な並び順
- 画面の入力チェック（zod）を API の制約と一致させる。`data-testid` を詳細設計どおりに付ける
