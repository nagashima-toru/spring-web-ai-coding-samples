---
id: P-20261020-dependabot-automerge
status: approved
---
# ゴール
設計文書 `vault/designs/D-20261013-dependabot-ai-merge.md` のフェーズ2「patch/minor の auto-merge 有効化と運用ドキュメント」を実装する。フェーズ1 の `.github/workflows/dependabot-review.yml` に、Dependabot の PR であること・更新種別が patch または minor・AI の判定が safe の3条件をすべて満たす時だけ `gh pr merge --auto --squash` で auto-merge を有効化するジョブを追加する。あわせて、依存更新 PR の扱い（AI による確認と自動マージの条件、人が行う設定：シークレット登録・ブランチ保護・auto-merge の許可）を `docs/development-guide.md` に追記する。

## 分割方針
- 成果物が2ファイル（ワークフローと docs）なので、1ファイル1タスクの2タスクに分ける
- T-01 はワークフローに auto-merge ジョブ（`contents: write`・`pull-requests: write`）を AI 確認ジョブ（`contents: read`）とは別に足し、判定をジョブの `outputs` で渡す
- T-02 は docs にワークフローのファイル名・判定の出力名・ラベル名を書くので、T-01 の実ファイルを見てから書けるように `after: T-01` にする
- 設計文書は両タスクとも読むだけで変更しない（フェーズ3 で docs への移し替えと削除を行う）

## タスク表（状態の正本）
| id | status | attempt | after | title | question |
|---|---|---|---|---|---|
| T-01 | done | 1 | - | dependabot-review.yml に patch/minor かつ safe の時だけ auto-merge を有効化するジョブを追加する | |
| T-02 | review | 1 | T-01 | development-guide.md §3 に依存更新 PR（Dependabot）の節を追記する | |

## 計画の受け入れ基準
- 各タスクに成果物と受け入れ基準が1つずつある
- 依存に循環がない
- 1タスクが1コンテキストで終わる粒度である

## 次フェーズの候補
- 設計文書のフェーズ3「CI 失敗時の原因分析コメント」（`.github/workflows/dependabot-ci-failure.yml` の追加、決定事項の docs への移し替え、設計文書の削除）。この計画の完了後に別計画で起こす
