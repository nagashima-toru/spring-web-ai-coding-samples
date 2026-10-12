# 正本 docs の案内

## 目的
どの正本 docs のどの節を読めばよいかを1か所で分かるようにする。docs の本文はここに写さず、パスと節番号で案内する。

## ルール
- `docs/architecture.md` 方式設計書（SSoT）の §2 モジュール構成・§3 API 設計方針・§4 認証・認可・§5 エラー処理方針・§7 データベース方針・§11 テスト方針・§12 実装上の注意：設計と実装が従う方針を確かめるため — 読む役割: planner・creator・verifier
- `docs/coding-standards.md` コーディング規約の §4.2 部品の利用・§6 frontend 実装規約・§8 テストコード規約・§10 禁止事項まとめ：実装とテストの書き方、基盤部品を使う範囲を確かめるため — 読む役割: creator・verifier
- `docs/development-guide.md` の §2.1 工程フロー・§2.2 各工程の入出力（planner・creator）、§5 検証ループ（creator・verifier）：工程の入出力と検証の進め方を確かめるため — 読む役割: planner・creator・verifier
- `CLAUDE.md` の「禁止事項」：やってはいけないことを確かめるため — 読む役割: planner・creator・verifier
- docs と食い違ったら docs が正とする（このルールは案内だけ）
- docs の本文はここに写さない

## 確認方法
- 参照した節番号が実在することを `grep -n '^#' docs/architecture.md docs/coding-standards.md docs/development-guide.md` で確かめる
- `CLAUDE.md` は `grep -n '^## ' CLAUDE.md` で見出し名を確かめる
