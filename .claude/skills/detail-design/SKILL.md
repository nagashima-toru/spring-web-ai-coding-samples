---
name: detail-design
description: 基本設計書を入力に機能単位の詳細設計書（API 詳細・画面詳細・処理フロー・エラー処理・テスト観点）を作成する。「ORDER-001 の詳細設計をして」「詳細設計書を書いて」「API の詳細を詰めて」のような発話や、基本設計の承認後の次工程として発動する。
---

# 詳細設計 Skill

基本設計書の機能1つを入力に、実装可能な粒度の詳細設計書を作成する。

## 入力と出力（工程連鎖）

| | 内容 |
|---|---|
| 入力 | `docs/projects/{案件名}/basic-design.md`（対象機能 ID の行と関連する画面・API・テーブル） |
| 参照 | `docs/architecture.md`、`docs/coding-standards.md`、web-core の Javadoc、サンプル（`message` 機能） |
| 出力 | `docs/projects/{案件名}/detail-design/{機能ID}.md`（テンプレート: `templates/detail-design-template.md`） |
| 次工程 | `/review-design` でレビュー後、`/implementation` がこの成果物を入力とする |

## 進め方

1. 基本設計書の対象機能の画面・API・テーブル定義を把握する
2. サンプル（`backend/web-sample/.../message`・`frontend/src/features/messages`）を確認し、構成の参考にする
3. **API 詳細**: openapi.yaml に追加する paths・schemas を、項目ごとの型・必須・制約（長さ・形式・範囲）まで確定させる。応答ステータスとエラー type（`docs/architecture.md` §5.2）を列挙する
4. **backend 設計**: パッケージ・クラス（Controller・ユースケース・ドメインモデル・リポジトリ・Mapper）・トランザクション・SQL 方針を決める。使う web-core 部品をクラス名まで特定する
5. **画面詳細**: コンポーネント構成・表示項目・入力チェック（zod）・`data-testid`・表示文言キー・ロールによる表示制御
6. **エラー処理設計**: エラー事象ごとに 発生箇所・例外・HTTP ステータス・画面での表示 を表にする
7. **テスト観点**: 単体・結合・E2E それぞれで確かめる観点を列挙する（後工程の入力になる）

## 設計粒度の基準

- 実装者（または implementation Skill）が**設計書だけを見て実装できる**こと
- クラス名・パス・operationId・テーブル名は命名規約（architecture.md §10）どおりに確定させる
- 入力チェックは「項目 × チェック内容 × 実現場所 × エラー時の扱い」の表で網羅する
- コード断片は書かない（コードは実装工程の成果物）。ただし OpenAPI の追加分は YAML で書いてよい（API 定義が実装の入力になるため）

## 禁止事項

- 基本設計と矛盾する設計（矛盾に気付いた場合は基本設計書の改訂を先に提案する）
- 基盤部品にある機能の独自実装を前提とした設計
- 認可ロールの決まっていない API
