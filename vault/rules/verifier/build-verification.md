# verifier ルール：検証コマンドを自分で実行して判定する

## 目的
工程タスクを、creator の申告ではなく verifier 自身が実行した検証の結果と docs を根拠に判定できるようにする。

## ルール
- 工程タスクの判定では毎回自分で次を実行し、それぞれの終了コードと結果（backend は末尾の `BUILD SUCCESS`／`BUILD FAILURE`）を note に書く。creator の進捗や報告を根拠にしない
  - `cd backend && ./mvnw clean verify -DskipITs -Djacoco.haltOnFailure=false`
  - `cd frontend && pnpm lint && pnpm format:check && pnpm type-check && pnpm test:coverage`
- `-DskipITs` の結果では web-sample のカバレッジを判定しない（`Coverage checks have not been met` の WARNING だけを FAIL の根拠にしない）
- 受け入れ基準に `./mvnw clean verify` や `pnpm test:e2e` があるタスクでは、それも実行する
- Docker が使えず（`docker info` が失敗）実行できない時は PASS にせず FAIL とし、reasons に「Docker が使えず結合テスト（E2E）を実行できない」と書く
- 失敗した時は、原因を `docs/development-guide.md` §5.1 の表にあるレポートの場所で読み、note に要点を書く
- 差分に `docs/development-guide.md` §5.4 の反則（閾値の変更・除外設定の追加・テストの削除や無効化・適用済み Flyway ファイルの書き換え・生成コードの手修正）が見つかった時は、受け入れ基準が §5.4 を参照していれば FAIL の根拠にし、参照していなければ reasons に記録する
- 方針の根拠は `docs/architecture.md` §11 テスト方針。本文はここに写さず、パスと節番号で参照する

## 確認方法
- verdict の note に、実行したコマンドと結果が書かれていること
- 参照した節番号が実在することを `grep -n '^#' docs/development-guide.md docs/architecture.md` で確かめる
