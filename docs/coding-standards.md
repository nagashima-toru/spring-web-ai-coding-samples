# コーディング規約

本規約は `implementation` / `review-code` Skill から参照される。
機械チェック可能なルールは Checkstyle（`config/checkstyle/`）・SpotBugs・ArchUnit・ESLint・Prettier で強制し、本書はその背景と、機械チェックできない設計判断の規約を定める。

## 1. 一般規約（Java）

- **Java 25 の標準機能を使う**: 値オブジェクト・DTO は `record`、不変コレクションは `List.of()` / `List.copyOf()`、`switch` 式・パターンマッチを使う
- インデントはスペース4、1行120文字以内、ファイルは UTF-8 / LF
- `var` はローカル変数で右辺から型が自明な場合のみ使用可
- null を返さない。「無い」は `Optional` / 空コレクションで表現する
- フィールドインジェクション禁止。**コンストラクタインジェクション**のみ（`@Autowired` 省略）
- Lombok は使わない（record とコンストラクタで足りる）
- ユーティリティクラスは `final` ＋ private コンストラクタ
- 現在時刻は `Clock` Bean から取る（`LocalDateTime.now()` を直接呼ばない。テストで固定するため）
- マジックナンバー・リテラル直書き禁止。定数または `@ConfigurationProperties` へ外部化する

## 2. コメント・Javadoc

- ドキュメント・コメントは**日本語**で書く
- 公開クラス・公開メソッドには Javadoc を書く。基盤部品（web-core）は「**用途・使い方・拡張ポイント**」を必ず記載する
- コメントは「なぜ」を書く。「何をしているか」はコードで表現する（直訳コメント禁止）

## 3. 例外処理（Java）

- 業務エラーは web-core の例外（`ResourceNotFoundException` / `ResourceConflictException` / `InvalidInputException`）のサブクラスを定義して送出する。`RuntimeException` を直接送出しない（方式設計 §5.1）
- 例外の握りつぶし禁止。catch したら「回復する・変換して再送出する」のいずれかを行う
- 変換する時は必ず cause を渡す（`initCause` または cause 付きコンストラクタ）
- Controller・ユースケースでエラー応答を組み立てない（`GlobalExceptionHandler` に任せる）

## 4. backend 実装規約

### 4.1 レイヤ・パッケージ

- 機能パッケージの下に `presentation` / `application` / `domain` / `infrastructure` を置く（方式設計 §2.1。ArchUnit で検査）
- **Controller** は生成インタフェース（`{タグ}Api`）を実装し、生成モデル↔ドメインの変換と `@PreAuthorize` だけを行う。業務ロジックを書かない
- **ユースケース** は1操作1クラス（`{動詞}{対象}UseCase#execute`）。トランザクション境界（`@Transactional`）をここに置く
- **ドメインモデル** は record。生成・変更はファクトリ／メソッド（`create`・`update`）を通し、不変条件をそこで検証する
- **リポジトリ** はドメイン層にインタフェース、インフラ層に MyBatis 実装を置く

### 4.2 部品の利用（最重要）

- **web-core にある機能の独自実装禁止**。以下は必ず基盤部品を使う:

| やりたいこと | 使う部品 |
|---|---|
| 認証・トークン発行/検証 | `TokenProvider` / `RefreshTokenStore`（JWT を自前で扱わない） |
| 認証必須・公開パスの設定 | `app.security.public-paths`（`SecurityFilterChain` を業務側で定義しない） |
| エラー応答 | 業務例外の送出のみ（`ProblemResponse` を業務コードで組み立てない） |
| ページング | `PageQuery` / `PageResult` |
| ログへの利用者入力の出力 | `LogSanitizer.sanitize()` |
| 現在時刻 | `Clock` Bean |

- 基盤部品で実現できない要件が出た場合は、業務側に書かず web-core への機能追加を検討する

### 4.3 API 定義

- API の追加・変更は `openapi.yaml` を先に変更する。生成コード（`generated`）を手で直さない
- 単項目チェックは OpenAPI の制約（`required`・`minLength`・`maxLength`・`pattern`・`minimum`・`maximum`）で書く

## 5. MyBatis 規約

- SQL は Mapper XML に書く。`@Select` 等のアノテーション SQL 禁止
- テーブルは必ずスキーマ修飾する（`app.messages`）。`SELECT *` 禁止（カラムを明示する）
- `${}` による文字列埋め込み禁止（`#{}` のバインド変数を使う。SQL インジェクション対策）
- 一覧は必ずページングし、ソート順を一意にする。ループ内での1件ずつの Mapper 呼出禁止

## 6. frontend 実装規約（TypeScript / React）

### 6.1 一般

- `any` 禁止。`unknown` ＋型ガード、または適切な型定義を使う
- **named export のみ**（default export は Next.js のページ・設定ファイルなど必要な所だけ。ESLint で強制）
- コンポーネントは PascalCase のファイル名、Props は `interface` で明示する
- 表示文言は `messages/{ja,en}.json` に置き、`useTranslations` で参照する（直書き禁止）
- `dangerouslySetInnerHTML` 禁止（XSS 対策。方式設計 §4）

### 6.2 データ取得・状態

- API は **Orval の生成フック／関数だけで呼ぶ**（axios の手動呼出禁止）。機能固有の処理は `features/{機能}/hooks` で生成フックをラップする
- クエリキーは `features/{機能}/query-keys.ts` で一元管理する
- フォームは React Hook Form ＋ zod。検証スキーマは `features/{機能}/validations.ts` に置き、API 定義と同じ制約にする
- Context の型は `| undefined` を含め、Provider 外での使用は例外にする

### 6.3 ディレクトリ

- `features` どうしで import しない。共通化は `core` へ移す（方式設計 §2.2）
- 生成コード（`core/api/generated`）を手で直さない

## 7. 設定・リソース

- 環境差分は `application-{profile}.yml` へ。コード内の環境分岐禁止
- 機密情報（パスワード・署名鍵・アカウント ID）のハードコード禁止。環境変数参照とする
- 設定値は `@ConfigurationProperties`（record）で受け、`@Value` の散在を避ける

## 8. テストコード規約

### 8.1 backend

- テストクラス名: 単体 `{対象}Test`、結合 `{機能}ApiIT`
- テストメソッド名は日本語で「条件＿期待結果」（例: `使用済みのコード_DuplicateMessageCodeExceptionで登録しない`）
- AAA（Arrange-Act-Assert）を空行で区切る。1テスト1検証観点。アサーションは AssertJ
- 単体テストで Spring コンテキストを起動しない（Mockito で依存を差し替える）
- 結合テストは `AbstractIntegrationTest` を継承し、MockMvc で API を呼んでステータス・本文・DB を検証する
- スリープによる同期待ち禁止

### 8.2 frontend

- テストは `tests/unit`（フック・関数）と `tests/component`（コンポーネント）に置き、ファイル名は `{対象}.test.ts(x)`
- API は MSW でモックする。TanStack Query を使うフックは `QueryClientProvider` で包む
- `next/navigation` などの Next.js フックは `vi.mock` する
- 新しいコンポーネントには `*.stories.tsx` を作る
- E2E のロケーターは `getByTestId` / `getByRole` / `getByLabel` を使い、表示文言でアサートしない（ESLint で強制）

## 9. コミット・PR

- コミットメッセージは日本語。1行目に要約（50字程度）、本文に「なぜ」を書く
- 1 コミット 1 論理変更。フォーマット変更と機能変更を混ぜない
- PR には設計書リンクとレビュー Skill の実施記録を含める（テンプレート準拠）

## 10. 禁止事項まとめ

| 禁止 | 理由 / 代替 |
|---|---|
| Spring Boot 3 以前のサンプルの流用 | Boot 4 で変更あり（方式設計 §12） |
| 基盤部品と同等機能の独自実装 | web-core / frontend core を利用・拡張する |
| API 定義を経ない API の追加・変更、生成コードの手修正 | openapi.yaml を変更して再生成する |
| フィールドインジェクション・Lombok | コンストラクタインジェクション・record |
| アノテーション SQL・`${}` 埋め込み | Mapper XML・`#{}` |
| frontend での axios 手動呼出・`any`・default export | 生成フック・型定義・named export |
| 機密情報・環境依存値のハードコード | 環境変数・設定ファイル |
| `System.out.println` / `printStackTrace` / `console.log` の残置 | SLF4J ロガー / 開発時のみの出力 |
| Flyway 適用済みマイグレーションファイルの変更 | 新しいバージョン番号のファイルを追加 |
