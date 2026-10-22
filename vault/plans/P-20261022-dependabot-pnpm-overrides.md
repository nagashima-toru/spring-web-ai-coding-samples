---
id: P-20261022-dependabot-pnpm-overrides
status: done
---
# ゴール

GitHub Issue #38「Dependabot が pnpm-lock.yaml の overrides を落とし、frontend の frozen install が失敗する」に対処する。
(a) Dependabot が overrides を落とさない構成（`frontend/package.json` の `packageManager` で pnpm 9 に固定）、(b) それでも落ちた時に Dependabot PR の lockfile を CI 上で pnpm 9 で再生成して push する workflow、(c) 手作業での再生成手順の docs への明文化、の3つを入れる。

## 分割方針

- 調査の結果（planner が scratch で再現）：
  - Dependabot のコミット 2006658 で `frontend/pnpm-lock.yaml` のトップレベル `overrides:` が消え、9033aab（pnpm 9 で再生成）で元に戻っている。patchedDependencies は package.json にも lockfile にも無く、今回の対象外
  - pnpm 12 は `The "pnpm" field in package.json is no longer read by pnpm` と警告し、`pnpm.overrides` を読まない。`packageManager` が無い時、Dependabot は lockfileVersion '9.0' から新しい pnpm を選んで再生成していると推定する（Dependabot 側の版は確認できない）
  - `frontend/package.json` に `"packageManager": "pnpm@9.15.9"` を足すと、pnpm 12・pnpm 10 とも pnpm 9.15.9 に切り替えて動き、`--frozen-lockfile` が通る。lockfile は変わらない
  - overrides を落とした lockfile は pnpm 9 で `pnpm install --frozen-lockfile --lockfile-only --ignore-scripts` が `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` で失敗し、`pnpm install --lockfile-only --ignore-scripts` で元の lockfile と一致する内容に戻る
- T-01（構成の固定）と T-02（自動補正の workflow）は互いに独立。T-03（docs）は両方の実ファイルを見て書くので両方に依存させる
- 検証の限界：GitHub Actions 上の実行と Dependabot の実際の挙動はこの環境では確かめられない。T-02 は workflow の構造（YAML の解析結果）と、補正コマンドの手元での再現の記録で確かめ、実地の確認はマージ後に人が行う（末尾の「マージ後に人が行う作業」）
- `pnpm-workspace.yaml` への overrides の移行（pnpm 10 以降の機能）は、CI が pnpm 9 固定のため行わない。`docs/architecture.md` は依存更新の運用を扱っていないので変えない
- コードを変更するタスク（T-01 の `frontend/package.json`、T-02 の `.github/workflows/dependabot-lockfile.yml`）があるため、計画単位のレビュータスク T-04 を足す

## タスク表（状態の正本）
| id | status | attempt | after | title | question |
|---|---|---|---|---|---|
| T-01 | done | 1 | - | frontend/package.json の packageManager で pnpm を 9.15.9 に固定する | |
| T-02 | done | 1 | - | Dependabot PR の lockfile を pnpm 9 で補正して push する workflow を追加する | |
| T-03 | done | 1 | T-01,T-02 | 開発ガイドに lockfile の overrides の補正の仕組みと手作業の手順を書く | |
| T-04 | done | 1 | T-01,T-02,T-03 | 計画の差分が `/code-review` を通過する | |

## 計画の受け入れ基準
- 各タスクに成果物と受け入れ基準が1つずつある
- 依存に循環がない
- 1タスクが1コンテキストで終わる粒度である

## マージ後に人が行う作業
- 次の frontend の Dependabot PR で、lockfile のトップレベル `overrides:` が残っているか（T-01 の効果）を確かめる
- 落ちていた場合、`Dependabot lockfile 補正` の workflow が補正のコミットを push し、`gh workflow run` で起動した CI の `backend`・`frontend`・`e2e` が PR の必須チェックとして扱われるかを確かめる。扱われない場合は PR を閉じて開き直して CI を起動し、PAT か GitHub App のトークンへの切り替えを別の計画で検討する
- リポジトリの Settings > Actions > General の「Workflow permissions」が workflow の `permissions` での書き込み権限の付与を許しているかを確かめる

## 次フェーズの候補
- CI の pnpm を 10 以降に上げ、overrides を `pnpm-workspace.yaml` に移す（`packageManager` の固定と自動補正の workflow を外せるか検討する）
