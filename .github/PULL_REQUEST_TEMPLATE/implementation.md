<!-- 実装 PR 用テンプレート（API 定義・コード・テスト・E2E 記録を含む PR）。
     設計書だけの PR は design.md、それ以外は既定の汎用テンプレート（.github/pull_request_template.md）を使う。
     使い分けは docs/development-guide.md §3 -->

## 概要

（何の案件・機能の実装か。なぜ必要か。Closes #issue番号）

## 設計書（SSoT）

| 工程 | ファイル | 版・ステータス |
|---|---|---|
| 基本設計 | docs/projects/{案件}/basic-design.md | {版}・承認済み |
| 詳細設計 | docs/projects/{案件}/detail-design/{機能ID}.md | {版}・レビュー済み |

※ 実装の入力は main にマージ済みの設計書であること。実装中に設計を変える必要が出た場合は、
コードより先に設計書を改訂し、設計 PR 用テンプレートの観点で設計レビューを通すこと

## セルフチェック

- [ ] 入力の詳細設計書がレビュー済みで main にマージ済みである
- [ ] 実装が詳細設計書どおりである（API 定義・クラス構成・画面・エラー処理）
- [ ] API は openapi.yaml を先に変更し、frontend の生成コード（`pnpm generate:api`）を更新してコミットした
- [ ] backend `./mvnw clean verify` がローカルで成功する（単体＋結合＋静的解析＋カバレッジ）
- [ ] frontend `pnpm lint && pnpm format:check && pnpm type-check && pnpm test:coverage && pnpm build` が成功する
- [ ] `/review-code` を **[Must]・[Should] の指摘が 0 件になるまで繰り返し実行した**（下記レビュー実施記録）
- [ ] 基盤部品（web-core・frontend core）で実現できる処理を独自実装していない（基盤を拡張した場合はテストを追加した）
- [ ] 全 API に認可（`@PreAuthorize`）がある
- [ ] 詳細設計書のテスト観点を単体・結合・E2E で網羅した
- [ ] Flyway は新規ファイル追加のみ（適用済みファイルを変更していない）
- [ ] E2E のシナリオと実施記録を残した（`/e2e-test`）

## レビュー実施記録

（`/review-code` の回ごとの指摘件数と対応。最終回は Must・Should とも 0 件であること）

| 対象 | 回 | Must | Should | Ask | 対応 |
|---|---|---|---|---|---|
| {機能ID} の実装 | 1 | | | | |

## テスト結果

（単体・結合テストの件数とカバレッジ、E2E の実施結果）

## 未対応事項・後続作業
