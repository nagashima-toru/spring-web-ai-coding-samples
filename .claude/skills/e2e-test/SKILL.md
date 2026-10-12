---
name: e2e-test
description: 画面からの業務シナリオを Playwright で検証する E2E テストを設計・実装・実施する。「E2E テストを書いて」「画面の通しテストをして」「ロールごとの画面操作を確認して」「リリース前のシナリオテストをして」のような発話や、コードレビュー完了後・PR 作成前の工程として発動する。
---

# E2E テスト Skill

実 backend（`local` プロファイル）と frontend を起動し、利用者の操作の流れ（ログイン → 一覧 → 登録・更新・削除 → 権限の違い）を Playwright で検証する。
単体・結合テストが「部品・API が仕様どおり動くこと」を保証するのに対し、E2E は「画面から業務が通しで行えること」を確認する。

## 入力と出力（工程連鎖）

| | 内容 |
|---|---|
| 入力 | `docs/projects/{案件名}/basic-design.md`（画面一覧・遷移・権限）、詳細設計書（画面詳細・`data-testid`・E2E のテスト観点） |
| 参照 | 既存 E2E（`frontend/tests/e2e/`。`helpers.ts` のログイン・待機ヘルパー） |
| 出力 | `frontend/tests/e2e/{機能}-*.spec.ts`、シナリオと実施記録 `docs/projects/{案件名}/e2e-test/scenarios.md`（テンプレート: `templates/e2e-scenario-template.md`） |
| 次工程 | PR 作成（`docs/development-guide.md` §3） |

## シナリオ設計の観点

| 観点 | 確認内容 |
|---|---|
| 業務の流れ | 主要ユースケースを画面遷移どおりに通す（登録した内容が一覧・詳細に反映される） |
| 権限 | ロールごとに操作部品の表示・非表示、操作できない場合の表示（ADMIN / VIEWER） |
| エラー | 重複登録・存在しないデータなど、利用者が遭遇する業務エラーの表示 |
| 認証 | 未ログインでの保護画面へのアクセス、ログアウト |
| 多言語 | 言語切替で画面が崩れない（文言でなく `data-testid` で確認） |

項目チェックの網羅は単体・結合テストで行い、E2E では代表例だけにする（実行時間を抑えるため）。

## 進め方

1. 画面一覧・権限表・詳細設計の E2E 観点からシナリオ一覧を作り、ユーザーと合意する
2. シナリオごとに 事前条件 / 手順 / 期待結果 をテンプレートに書く
3. 既存 spec の型（`helpers.ts` の `login`、`getByTestId` 中心のロケーター）で実装する。テストデータは各テストで作成し、他テストのデータに依存しない（並列実行されるため一意なコードを使う）
4. **検証ループ**: backend を起動してから実行する

   ```bash
   docker compose -f docker/compose.yaml up -d
   (cd backend && ./mvnw -q package -DskipTests && java -jar web-sample/target/web-sample-*.jar --spring.profiles.active=local &)
   cd frontend && pnpm test:e2e
   ```

   失敗したら `frontend/playwright-report/` のトレース・スクリーンショットで原因（テスト / 実装 / データ）を判定して修正し再実行する（最大3ラウンド）
5. 実施結果（件数・所要時間・失敗と対処）を実施記録に書く。不具合は Issue 化し、修正は `/implementation` 以降の工程を再度通す

ループの共通ルールは `docs/development-guide.md` §5 に従う。

## 規約

- ロケーターは `getByTestId` / `getByRole` / `getByLabel`。表示文言でアサートしない（ESLint で強制）
- 固定時間の待機（`waitForTimeout`）を新たに増やさない。`expect(...).toBeVisible()` などの条件待ちを使う
