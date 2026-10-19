---
id: P-20261019-dependabot-review
status: approved
---
# ゴール
Dependabot が作った PR を契機に GitHub Actions で claude-code-action を起動し、更新内容（更新種別・リリースノート・変更履歴・リポジトリ内での使用箇所）から影響を確認して結果を PR にコメントし、判定に応じたラベルを付けるワークフロー `.github/workflows/dependabot-review.yml` を追加する。このフェーズではマージは行わない。

（設計文書 `vault/designs/D-20261013-dependabot-ai-merge.md` のフェーズ1。決定事項はその「決定事項」表とフェーズ1の「決定済み」を正とする）

## 分割方針
- 成果物はワークフロー1ファイルで、受け入れ基準が7行に収まるため1タスクにする。トリガ・権限・AI ステップ・判定・ラベル付与は同じファイルの中で相互に参照し合うので、分けると後のタスクが前のタスクの step id や出力名に縛られるだけになる
- `vault/rules/planner/feature-task-split.md`（詳細設計済みの機能を工程5タスクに分ける）は、業務機能の実装ではなく CI ワークフローの追加なので適用しない。backend・frontend の検証コマンドは、このタスクがそれらのコードを変えないため受け入れ基準に入れない
- 実際の Dependabot PR での動作確認は求めない（ワークフローは main にマージされた後でないと起動しない）。YAML の構造の検査と、判定ステップの run スクリプトを手元の bash で実行する検査で受け入れる
- 設計文書はフェーズ2・3でも読むため、この計画では変更も削除もしない（成果物にしない）

## タスク表（状態の正本）
| id | status | attempt | after | title | question |
|---|---|---|---|---|---|
| T-01 | review | 1 | - | Dependabot PR の AI 影響確認ワークフロー dependabot-review.yml を追加する | |

## 計画の受け入れ基準
- 各タスクに成果物と受け入れ基準が1つずつある
- 依存に循環がない
- 1タスクが1コンテキストで終わる粒度である

## 次フェーズの候補
- 設計文書のフェーズ2（patch/minor の auto-merge 有効化と `docs/development-guide.md` への運用ドキュメント追記）。この計画が main にマージされた後に別計画で起こす
- 設計文書のフェーズ3（CI 失敗時の原因分析コメント `.github/workflows/dependabot-ci-failure.yml`、決定事項の `docs/decisions.md` への移し替えと設計文書の削除）。フェーズ2 の後
