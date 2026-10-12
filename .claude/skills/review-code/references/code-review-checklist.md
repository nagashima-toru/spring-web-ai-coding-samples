# コードレビュー チェックリスト

## 設計との一致

- [ ] openapi.yaml の変更が詳細設計 §2.2 と一致している
- [ ] クラス構成・処理フロー・エラー処理が詳細設計どおり

## backend

- [ ] Controller は生成インタフェースを実装し、変換と `@PreAuthorize` だけを行っている
- [ ] 全 API に認可がある。公開 API は `app.security.public-paths` に追加されている
- [ ] ユースケースが1操作1クラスで、`@Transactional`（参照系は readOnly）がある
- [ ] ドメインモデルが record で、生成・更新時に不変条件を検証している
- [ ] 業務例外が web-core の例外のサブクラスで、`RuntimeException` を直接送出していない
- [ ] 例外を握りつぶしていない。変換時に cause を渡している
- [ ] 現在時刻を `Clock` から取っている
- [ ] SQL が Mapper XML・スキーマ修飾・`#{}`・カラム明示・ページング・一意な並び順になっている
- [ ] 一意制約違反を業務例外に変換している
- [ ] Flyway は新規ファイルの追加だけ
- [ ] ログに利用者入力を出す所で `LogSanitizer` を使い、個人情報・トークンを出していない
- [ ] Javadoc（日本語）がある。コメントは「なぜ」を書いている

## frontend

- [ ] API 呼出が生成フック経由（axios の手動呼出がない）。生成コードが最新でコミット済み
- [ ] `features` どうしの import がない。共通処理は `core` にある
- [ ] named export・Props の型定義・`any` なし
- [ ] 文言が `messages/{ja,en}.json` にあり、両言語がそろっている
- [ ] 入力検証（zod）が API の制約と一致している
- [ ] ロールによる表示制御が API の認可と一致している
- [ ] `data-testid` が詳細設計どおり。`dangerouslySetInnerHTML` を使っていない
- [ ] 新しいコンポーネントに `*.stories.tsx` がある

## テスト

- [ ] 単体: 観点表（unit-test Skill）に沿い、メソッド名が日本語「条件＿期待結果」
- [ ] 結合: 正常・入力エラー・業務エラー・401・403・一覧の観点がある
- [ ] E2E: 主要シナリオとロールの違いがある（文言でアサートしていない）
- [ ] テストの削除・無効化・閾値の変更による回避がない

## 検証結果

- [ ] backend `./mvnw clean verify` 成功（Checkstyle・SpotBugs・カバレッジ80%）
- [ ] frontend lint・format・type-check・test:coverage・build 成功
