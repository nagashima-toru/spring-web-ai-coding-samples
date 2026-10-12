---
id: D-20261013-dependabot-ai-merge
---
# ゴール
Dependabot が作る依存更新 PR について、GitHub Actions 上の AI（claude-code-action）が影響を確認して結果を PR にコメントし、patch・minor で影響なしと判断したものは GitHub の auto-merge でマージされるようにする。CI が失敗した PR は AI が原因を分析してコメントし、人に引き渡す。

## 決定事項
人に聞いて確定した回答。以降のフェーズはこれを前提にする。1件1行。

| 決めたこと | なぜ |
|---|---|
| GitHub Actions（`anthropics/claude-code-action`）で、Dependabot PR を契機に無人で実行する | 毎週月曜に PR が来るため、人の起動を待たずに処理したい |
| AI がマージしてよいのは semver の patch・minor だけ。major は影響分析をコメントするだけで、マージは人が行う | major は破壊的変更を含みうるので、人の判断を残す |
| CI が失敗した Dependabot PR は、AI が原因と修正案をコメントし、ラベルを付けて人に引き渡す。AI はコードを変更・push しない | 修正をコードに入れるのは人の判断で行う。AI が書いたコードを AI がマージする経路を作らない |
| マージは GitHub の auto-merge（squash）で行う。必須チェック（`backend`・`frontend`・`e2e`）は main のブランチ保護で人が設定する | CI が通った時だけ GitHub がマージするので、チェック漏れでマージされない |
| マージの可否は AI ではなくワークフローの決定的なステップが判定する（Dependabot の PR であること・更新種別が patch/minor・AI の判定が「影響なし」の3条件をすべて満たす時だけ auto-merge を有効化） | AI の出力だけでマージ権限を行使させない。条件をコードで確かめられるようにする |
| ワークフローは `pull_request` で起動し、`pull_request_target` は使わない | `pull_request_target` で PR のコードを扱うと、書き込み権限とシークレットが外部コードに渡る危険がある |
| `ANTHROPIC_API_KEY` は Actions secrets と Dependabot secrets の両方に登録する（人が設定する） | Dependabot が起動したワークフローからは Dependabot secrets しか読めない |

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3 の順に直列で進める
- フェーズ2・3 はどちらもフェーズ1 のワークフローを前提にする。フェーズ3 は最終フェーズ（決定事項の docs への移し替えと設計文書の削除を含む）なので、フェーズ2 の後に置く

---

## フェーズ1 Dependabot PR の AI 影響確認（コメントとラベルのみ）

### ゴール文
Dependabot が作った PR を契機に GitHub Actions で claude-code-action を起動し、更新内容（更新種別・リリースノート・変更履歴・リポジトリ内での使用箇所）から影響を確認して結果を PR にコメントし、判定に応じたラベルを付けるワークフロー `.github/workflows/dependabot-review.yml` を追加する。このフェーズではマージは行わない。

### 受け入れ基準の候補
- `.github/workflows/dependabot-review.yml` があり、`on: pull_request`（types: opened, synchronize, reopened）で起動し、ジョブの `if` で `github.event.pull_request.user.login == 'dependabot[bot]'` に限定している（`grep -n "dependabot\[bot\]" .github/workflows/dependabot-review.yml`）
- `pull_request_target` を使っていない（`! grep -n pull_request_target .github/workflows/dependabot-review.yml`）
- `dependabot/fetch-metadata` で更新種別（`update-type`）・エコシステム・依存名を取得し、AI へのプロンプトに渡している
- AI の判定は「影響なし（safe）」「要確認（needs-human）」のどちらかで、判定と根拠（使用箇所・破壊的変更の有無・リリースノートの要点）が PR にコメントされる
- 判定に応じて `ai-review:safe` または `ai-review:needs-human` のラベルが付き、major の更新は AI の判定に関係なく `ai-review:needs-human` になる
- ワークフローの YAML が構文として正しい（`actionlint .github/workflows/dependabot-review.yml`。actionlint が無い環境では `python3 -c "import yaml,sys;yaml.safe_load(open(sys.argv[1]))" .github/workflows/dependabot-review.yml`）
- 既存の CI（`.github/workflows/ci.yml`）を変更していない

### 決定済み
- AI 実行は `anthropics/claude-code-action` の v1 系をメジャーバージョンで固定して使う（`@v1`）。モデルは指定せず action の既定値を使う
- API キーは `secrets.ANTHROPIC_API_KEY` から渡す。シークレットの登録は人が行うため、このフェーズでは登録手順を書かなくてよい（フェーズ2 で docs に書く）
- `permissions` はジョブに最小限で書く：`contents: read`・`pull-requests: write`・`issues: write`（ラベル付与用）。`contents: write` は付けない
- AI の判定はワークフローの後続ステップで機械的に読める形で受け取る。claude-code-action の structured output（`claude_args` の `--json-schema`、出力 `structured_output`）を使い、スキーマは `{"verdict": "safe" | "needs-human", "summary": string}` とする。structured output が使えない場合は、AI にプロンプトで `$RUNNER_TEMP/verdict.json` へ同じ形の JSON を書かせ、後続ステップで `jq` で読む
- AI に許可するツールは読み取り系（Read・Grep・Glob、`gh pr view`・`gh pr diff`）とコメント投稿に限る。ファイル編集・`git push`・`gh pr merge` は許可しない
- ラベルが無ければワークフロー内で `gh label create --force` で作る（色は任意）
- 更新種別の判定は `dependabot/fetch-metadata` の `update-type`（`version-update:semver-patch` / `-minor` / `-major`）を使う。グループ更新（複数依存の一括更新）は含まれる最大の更新種別で扱う（fetch-metadata の出力どおり）
- コメントは日本語で書かせる。同じ PR に再実行した時は、前回のコメントを更新するか新規に追加するかは問わない
- 動作確認は、実際の Dependabot PR（既存の #11 など）で動くことまでは求めない（main へのマージ後でないと起動しないため）。YAML の検証と内容のレビューで受け入れる

### 依存
-

---

## フェーズ2 patch/minor の auto-merge 有効化と運用ドキュメント

### ゴール文
フェーズ1 の `dependabot-review.yml` に、Dependabot の PR であること・更新種別が patch または minor・AI の判定が safe の3条件をすべて満たす時だけ `gh pr merge --auto --squash` で auto-merge を有効化するステップを追加する。あわせて、依存更新 PR の扱い（AI による確認と自動マージの条件、人が行う設定：シークレット登録・ブランチ保護・auto-merge の許可）を `docs/development-guide.md` に追記する。

### 受け入れ基準の候補
- auto-merge を有効化するステップは、AI のステップとは別の、条件が `if` で明示されたステップである（AI 自身に `gh pr merge` を実行させていない）
- ステップの `if` が、`github.event.pull_request.user.login == 'dependabot[bot]'`・更新種別が `version-update:semver-patch` または `version-update:semver-minor`・AI の判定が `safe` の3条件をすべて含む（`grep -n "semver-major" .github/workflows/dependabot-review.yml` で major を通す条件が無いことを確認）
- マージ方法が squash の auto-merge（`gh pr merge --auto --squash`）である
- auto-merge のステップのジョブだけに `contents: write` を付け、AI を実行するジョブには付けていない
- `docs/development-guide.md` §3 に「依存更新 PR（Dependabot）」の節があり、自動マージの条件・major と CI 失敗時の扱い・人が行う設定（`ANTHROPIC_API_KEY` を Actions secrets と Dependabot secrets に登録、main のブランチ保護で必須チェック `backend`・`frontend`・`e2e` を設定、リポジトリ設定で auto-merge を許可）が書かれている
- ワークフローの YAML が構文として正しい（フェーズ1 と同じ確認コマンド）

### 決定済み
- 権限を分けるため、AI の確認ジョブ（`contents: read`）と auto-merge ジョブ（`contents: write`・`pull-requests: write`）を別ジョブにし、AI の判定はジョブの `outputs` で渡す
- auto-merge は「有効化」するだけで、必須チェックが通った時点で GitHub がマージする。ワークフローは CI の完了を待たない
- ブランチ保護・auto-merge の許可・シークレット登録は人がリポジトリ設定で行う。ワークフローや API から設定しない
- 必須チェックが設定されていない状態で auto-merge を有効化すると即時マージされうる。この注意を docs の手順に書く（ブランチ保護の設定を auto-merge 許可より先に行う、と順序を明記する）
- `docs/development-guide.md` §3 の表「上記以外（…依存更新）」の行はそのまま残し、新しい節から参照する形でよい

### 依存
フェーズ1

---

## フェーズ3 CI 失敗時の原因分析コメント

### ゴール文
Dependabot の PR で CI（`.github/workflows/ci.yml`）が失敗した時に、`workflow_run` を契機に claude-code-action を起動し、失敗したジョブのログから原因と修正案を分析して PR にコメントし、`ai-review:needs-human` ラベルを付けるワークフロー `.github/workflows/dependabot-ci-failure.yml` を追加する。AI はコードを変更しない。あわせて、設計の決定事項を docs に残し、この設計文書を削除する。

### 受け入れ基準の候補
- `.github/workflows/dependabot-ci-failure.yml` があり、`on: workflow_run`（workflows: CI、types: completed）で起動し、`conclusion == 'failure'` かつ head ブランチが `dependabot/` で始まる時だけ動く
- 失敗ジョブのログ（`gh run view --log-failed` 等）を AI に渡し、原因・修正案・人がやるべきことを日本語で PR にコメントする
- 対象 PR に `ai-review:needs-human` ラベルを付け、`ai-review:safe` が付いていれば外す
- AI のジョブは PR のコードをチェックアウトして実行しない（ログとリポジトリの main の内容だけを読む）。`contents: write` を付けず、ファイル編集・`git push`・`gh pr merge` を許可しない
- ワークフローの YAML が構文として正しい（フェーズ1 と同じ確認コマンド）
- 決定事項のうち docs に無いものを `docs/decisions.md` に追記し、設計文書を削除する

### 決定済み
- `workflow_run` は main のワークフロー定義で動き、Actions secrets を読める（Dependabot secrets ではない）。PR のコードはチェックアウトしない
- 対象 PR 番号は `github.event.workflow_run.pull_requests[0].number` から取る。空の場合は head ブランチ名から `gh pr list --head` で引く
- CI 失敗時は auto-merge が進まない（必須チェックが失敗するため）ので、auto-merge の解除は行わなくてよい
- `docs/decisions.md` はまだ無いので新規作成する。1件1行で「決めたこと・なぜ」を書く。`docs/development-guide.md` にフェーズ2 で書いた内容と重複するものは、`docs/decisions.md` には書かずにそちらを参照させる
- 設計文書の削除は creator がタスクの成果物として行う（成果物に `vault/designs/` を宣言する。差分ゲートの禁止対象ではない）。このタスクは、設計文書を読む他のタスクの後に `after` で依存させて置く

### 依存
フェーズ2

---

## 今回やらないこと
- 既存の open な Dependabot PR（#8・#9・#11・#12）の個別対応。#9 は frontend の CI が失敗しているが、原因の調査と修正はこの設計の範囲外
- major の更新を AI がマージすること、AI が修正コードを push すること
- Renovate など Dependabot 以外の更新ツールへの対応（ワークフローの条件は `dependabot[bot]` に限る）
- `.github/dependabot.yml` の更新対象・頻度・グループの見直し
- ブランチ保護・シークレット・auto-merge 許可を API やコードで設定すること（人がリポジトリ設定で行う）
