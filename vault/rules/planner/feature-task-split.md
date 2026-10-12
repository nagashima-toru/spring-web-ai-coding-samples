# 機能1つを工程タスクに分けて after でつなぐ

## 目的
詳細設計がレビュー済みの機能1つを受け取った時に、implementation 以降の工程タスクに分けて `after` で順につなぎ、全タスクの受け入れ基準に検証コマンドの成功を入れられるようにする。

## ルール
- 計画の前提は、詳細設計書がレビュー済みであること。`/review-design` を通った `docs/projects/{案件}/detail-design/{機能ID}.md` を指す
- ゴール文や設計書からレビュー済みと確かめられない時は、タスクを起こさず計画票末尾の `## 人への質問` に書く
- 1計画で扱う機能は1つにする。複数機能は計画を分ける
- 機能1つは implementation → unit-test → integration-test → review-code → e2e-test の順の5タスクに分ける
- 各タスクは `after` に直前の工程のタスク ID を書く。直列につなぎ、並行させない（先頭の implementation だけ `after` は空）
- 各タスクの「成果物」のパスは、対応する工程の `.claude/skills/{工程}/SKILL.md` の「入力と出力」節と `docs/architecture.md` §2 に従って宣言する。パスの一覧はここに書き写さない
- 全タスクの受け入れ基準に次の2つの成功を入れる
  - backend: `cd backend && ./mvnw clean verify -DskipITs -Djacoco.haltOnFailure=false`（Checkstyle・SpotBugs・単体テスト。カバレッジ不足では止めない）
  - frontend: `cd frontend && pnpm lint && pnpm format:check && pnpm type-check && pnpm test:coverage`
- 成果物に `*IT.java` を含むタスク（integration-test）と review-code には `cd backend && ./mvnw clean verify`（結合テスト・web-sample のカバレッジ80%）の成功も入れる
- e2e-test のタスクには `pnpm test:e2e` の成功を入れる（backend を local プロファイルで起動してから）
- backend の確認コマンドは、`2>&1 | grep -c '^\[INFO\] BUILD SUCCESS$'` をつないだ出力が `1` になる形で書く
- 要件定義〜設計レビューはハーネスのタスクにしない
- 設計書と異なる実装が必要になりそうな点はタスクにせず `## 人への質問` に書く（`docs/development-guide.md` §5.5）

## 確認方法
- 計画票のタスク表が5行で、`after` が上記の順に1本の鎖になっている
- 各タスク票の受け入れ基準に backend・frontend の検証コマンドがあり、integration-test・review-code にだけ `./mvnw clean verify`、e2e-test にだけ `pnpm test:e2e` がある
- 参照した節番号が `grep -n '^#' docs/development-guide.md docs/architecture.md` に見出しとして実在する
