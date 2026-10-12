---
name: unit-test
description: 実装コードの単体テストを作成する（backend は JUnit 5 + Mockito、frontend は Vitest + Testing Library）。「単体テストを書いて」「このユースケースのテストを作って」「このコンポーネントのテストを書いて」「テストケースを洗い出して」のような発話や、実装完了後の次工程として発動する。
---

# 単体テスト Skill

実装コードの単体テストを作成する。backend は Spring コンテキストを使わず、frontend は API を MSW でモックする。

## 入力と出力（工程連鎖）

| | 内容 |
|---|---|
| 入力 | 実装コード＋詳細設計書（入力チェック・エラー処理設計・テスト観点） |
| 参照 | `references/test-perspectives.md`（観点表）、既存テスト（`backend/*/src/test`・`frontend/tests`） |
| 出力 | backend `src/test/java/...{同パッケージ}/{対象}Test.java`、frontend `tests/unit/**`・`tests/component/**` |
| 次工程 | `/integration-test`（API 全体の検証はそちらの責務） |

## 対象と非対象

| 単体テストの対象 | 対象外 |
|---|---|
| ドメインモデル（不変条件）・ユースケース（分岐）・部品 | Controller〜DB を通した API の動作（結合テスト） |
| frontend のフック・入力検証・コンポーネント（表示・操作・ロール表示制御） | 実 backend を使う画面操作（E2E） |

## 進め方

1. 詳細設計書の「入力チェック」「エラー処理設計」「テスト観点」からテストケース表を作る
2. `references/test-perspectives.md` の観点表と突き合わせ、漏れを補完する
3. テストケース表をユーザーに提示してから実装する（観点の合意を先に取る）
4. **検証ループ（テスト成功）**:
   - backend: `cd backend && ./mvnw test -pl web-sample`。失敗したら `target/surefire-reports/` を読む
   - frontend: `cd frontend && pnpm test --run`
   - **テストの誤りか実装のバグかを先に判定**してから修正し再実行する（最大3ラウンド）。原因が設計書と実装の不一致にある場合は中断して設計書の改訂を提案する
5. **検証ループ（カバレッジ）**:
   - backend: `./mvnw clean verify -DskipITs -Djacoco.haltOnFailure=false` を実行し、`web-sample/target/site/jacoco/` で対象クラスの未到達箇所を確かめる（モジュールのカバレッジ80%は `/integration-test` の `./mvnw clean verify` で判定する）
   - frontend: `pnpm test:coverage`（閾値はここで判定する）
   - 未達なら観点表に基づく意味のあるケースを追加して再実行する（最大2ラウンド）

ループの共通ルールは `docs/development-guide.md` §5 に従う。

## テストコード規約（coding-standards.md §8 抜粋）

- backend: クラス名 `{対象}Test`、メソッド名は日本語「条件＿期待結果」、AAA、AssertJ、Mockito（Spring コンテキスト・実 DB を使わない）、時刻は `Clock.fixed`
- 例外検証は型とメッセージの要点まで（`.isInstanceOf(...).hasMessageContaining(...)`）
- frontend: TanStack Query を使うフックは `QueryClientProvider` で包む、API は MSW、`next/navigation` は `vi.mock`、文言は `messages/*.json` を読み込んで検証する
- 数値合わせのためのテストは書かない。閾値の変更による回避は禁止
