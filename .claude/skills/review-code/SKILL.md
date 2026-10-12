---
name: review-code
description: 実装コードを規約準拠・基盤部品利用・セキュリティ・性能の観点でレビューする。「コードレビューして」「この実装を見て」「PR を出す前にレビューして」のような発話や、実装・テスト完了後の PR 作成前に発動する。backend・frontend の実装品質確認の依頼全般で積極的に使用する。
---

# コードレビュー Skill

実装コードを規約・チェックリストと突き合わせてレビューし、指摘一覧を作成する。

## 入力と出力（工程連鎖）

| | 内容 |
|---|---|
| 入力 | 実装コード＋テストコード（対象機能／差分）と詳細設計書 |
| 基準 | `docs/coding-standards.md`、`docs/architecture.md`、`references/code-review-checklist.md` |
| 出力 | レビュー指摘一覧（会話で提示）。反映後、PR 本文に実施記録を残す（`.github/PULL_REQUEST_TEMPLATE/implementation.md` のレビュー実施記録） |
| 次工程 | 指摘反映 → `/e2e-test` → PR 作成（`docs/development-guide.md` §3） |

## 進め方

1. 詳細設計書を読み、**設計と実装の一致**を最初に確認する（差異があれば Must 指摘）
2. `references/code-review-checklist.md` の全項目を確認する
3. 検証結果を確認する: backend `./mvnw clean verify`、frontend `pnpm lint && pnpm format:check && pnpm type-check && pnpm test:coverage && pnpm build`
4. 指摘一覧を提示する（形式は下表。修正はユーザー了承後）

| # | 区分 | ファイル:行 | 指摘 | 根拠 |
|---|---|---|---|---|

- **[Must]** 規約違反・基盤部品の独自実装・バグ・セキュリティ欠陥・データ破損リスク（修正必須）
- **[Should]** 性能・保守性・テスト不足（原則修正）
- **[Ask]** 実装意図の確認

**例外（パイプライン実行時）**: 呼出元（`sdd-pipeline` Skill）から自己修正を指示された場合は、
[Must]/[Should] を了承取得なしでその場で修正し、修正後に手順3の検証が通ることを確認したうえで、
指摘一覧と修正内容を完了報告に含める。[Ask] は修正せず「確認事項」として呼出元へ返す。

## 最重要観点（順に確認する）

1. **設計との一致**: API 定義・クラス構成・入力チェック・エラー処理・画面が詳細設計書どおりか
2. **基盤部品の利用**: implementation Skill の部品対応表と突き合わせ、独自実装がないか
3. **セキュリティ**: 認可漏れ（`@PreAuthorize`）、SQL の `${}`、ログへの利用者入力・機密情報、XSS（`dangerouslySetInnerHTML`）
4. **レイヤと依存**: ArchUnit の規則、Controller に業務ロジックがないか、features どうしの import
5. **トランザクション・データ**: ユースケースの `@Transactional`、一意制約違反の変換、ページング・一意な並び順
6. **API 定義との一致**: 生成コードの手修正がないか、frontend の生成コードが最新か
7. **テスト**: 観点表準拠、正常/入力エラー/業務エラー/認証/認可の結合テストの有無
