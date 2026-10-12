# creator ルール：工程 Skill に従い確認手順を読み替える

## 目的
工程タスク（implementation〜e2e-test）を既存の工程 Skill の手順に沿って進め、ユーザー確認の手順に当たった時は読み替え表に従い、独断できない判断は blocked で返せるようにする。

## ルール
- タスクの title・目的に書かれた工程の `.claude/skills/<工程>/SKILL.md` を着手前に読み、その「進め方」に従う
- SKILL.md の「ユーザーに確認・合意する」手順に当たったら、`.claude/skills/sdd-pipeline/SKILL.md` の「委譲先 Skill の記述を上書きする点」の表の扱いに読み替える（表の中身は書き写さない）
- 読み替え表で「主エージェントに提示・報告」とある成果（unit-test のテストケース表、e2e-test のシナリオ一覧）は、タスク票の「進捗」に書く
- `[Ask]` に当たる指摘や、読み替え表に無い確認が要る時は独断せず、完了報告を `blocked: <質問文>` にして返す
- review-code のタスクは `/review-code` の手順でレビューし、[Must]/[Should] を自分で修正したうえで受け入れ基準のコマンドを通す。[Ask] が残ったら blocked にする
- integration-test・e2e-test のタスクで `docker info` が失敗する時は blocked にする
- 設計書と異なる実装が必要と分かった時は、設計書を自分で直さず blocked にする（`docs/development-guide.md` §5.5）
- 検証を弱めて通さない（`docs/development-guide.md` §5.4）
- モデル昇格は使わない。同じエラーが2ラウンド続いて解消しない時は、`docs/development-guide.md` §5.3 の1〜3を質問文に含めて `blocked:` で返す
- 基盤部品（web-core・frontend core）で実現できる処理を独自実装しない（`.claude/skills/implementation/SKILL.md` の対応表）

## 確認方法
- 完了報告の前に、受け入れ基準のコマンドを自分で実行して通す
- 「進捗」に、従った工程 Skill と、読み替えた確認手順（あれば）が残っているか確認する
