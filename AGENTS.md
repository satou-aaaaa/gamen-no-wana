# AGENTS.md

画面のワナ：架空の通販・アプリの画面から、ダークパターン（だます画面の仕掛け）を押して見つけ、その名前を当てる1日5画面の学習ゲーム。`index.html` と `gen.js`（ワナの種類・画面の作り方）を GitHub Pages で公開する。

## 準備（最初に一度）

```bash
bash scripts/setup.sh   # Node.js（版は .nvmrc）を確かめ、検査の依存とブラウザを入れる。何度実行してもよい
```

## push する前の確認

```bash
node qa/run.mjs   # 種類と画面の作り方（全部の形×300の種）・名前の札・今日の5画面と上級（3年分）・とことんの並び（500回）・通しで遊ぶ・続きから・とことん・あとから・カレンダー・実績・古いタブ・スマホ幅・外へ通信しない・PWA・引き継ぎ・見やすさ（CI の QA と同じ）
```

## このリポジトリの決まり

- ワナの種類（`gen.js` の `TYPES`、18）は、消費者庁「いわゆるダークパターン」リサーチ・ディスカッション・ペーパー（2025年4月、33種類・9カテゴリー）の名前と仲間（`cat`）に合わせる。種類を足すときは一次資料（消費者庁・deceptive.design・FTC の報告）で定義を確かめ、`def`・`tip`・`look` を40字以内で書く。法律の相談にしない。要点は共有フォルダ games/dark-pattern-research.md。
- 画面（`FORMS`）は種類ごとに4つの形（2026-11-07 に2つから増やした）。ワナの画面と正直な画面は、ワナの部品の書き方が必ずちがう（見抜いたあと「ワナの無い画面なら」でくらべて見せる。QA が見る）。`make(item)` は `{ t, v, s, h }` から、いつも同じ画面を作る。`h:1` はワナの無い正直な画面で、ワナの部品を正直な部品に替え、場面の文にもワナの手がかりを書かない。ワナの部品は `trap:true`（1〜2個。2個は「どちらを押しても正解」）。
- 店・アプリ・商品・人はすべて架空（`SHOPS`・`GOODS`・`APPS`）。実在の会社名・ロゴ・画面をまねない（QA が見る）。お笑いの言葉は入れない（本物っぽさ優先）。ほかの作品の名前・キャラは使わない。
- `SHOPS`・`GOODS`・`APPS`・`TYPES`・`FORMS` の並びや中身を変えると、過去の日の画面も変わる。足すのは最後に。変えた PR に一言書く。
- 今日の5画面（種類を重ねない・4割の日は1つが正直な画面）・上級（今日と別の3種類・札4枚・ヒントなし）は日本時間の日付の種（`seedOf`・`rng`）で決まり、だれでも同じ。`Math.random()` はとことんの並びと回の名札だけ（QA が数を見る）。乱数を sort の比較の中で引かない。
- ★はまちがい＋ヒントの数（0で★3・1で★2・2以上で★1）。ヒントは2段（1回目は `look`、2回目はワナでない部品を外す。名前の札ではまちがいの札を1枚へらす）。時間制限は付けない。見抜いたら必ず「どんなワナ」「身を守るコツ」を出す。
- 好きなだけ遊べる：チケット・回数制限・🔒で開くモードを入れない。とことん（`runs.e`）は全部の種類×形を毎回ちがう並びで出し（1つの並びで同じものを出さず、続けて同じ種類を出さない。使い切ったら並びを足す）、まちがえても終わらず「ここで降りる」まで続く。自己ベスト `ebest` は一度で見抜いた数。今日の記録・連続・Ko-fi・シェアには数えない（図鑑・実績には入る）。
- 記録 `gamen-no-wana-v1`：`days`・`hdays`・`adays`（あとから）・`dex`（種類ごとの数）・`hon`（正直な画面）・`total`・`ebest`・`runs`（`d`・`h`・`e`・`a:日付`）・`ach`・`kofi`。保存の前に読み直し（`save`）、2つの記録は `merge` で合わせる（日ごとは両方、数は大きいほう、同じ回の途中は進んだほう）。答えを書く前に、保存した回の id と画面が同じか確かめる（`same`。古いタブで二重に数えない）。引き継ぎで入った記録は `clean` で形をそろえる。
- 実績（`achList`、13個）は記録から毎回数える。続けるは合計の日数（`playedDays`）、連続の日は1以上のときだけ出す。取りこぼした日（きのう〜7日前・`EPOCH` から）はカレンダーから「あとから」遊べる（その日の今日の5画面と同じ）。
- 共有は遊ぶ人が押したときに開くリンク（X・LINE・Web Share・コピー）だけ。シェアの文は四角だけで、ワナの名前を出さない。
- 応援は Ko-fi（https://ko-fi.com/satouaaaaa）へのただのリンクだけ。今日の5画面・上級を初めて全部★3で終えたときだけ、結果の画面に1行（共有フォルダ kofi/app-guide.md）。
- 感想は `.github/ISSUE_TEMPLATE/feedback.yml`（shared-workflows `template/` の写し）を開くただのリンク。名前・メールは聞かない。
- 外へ通信しない。外から読むのは Google Fonts の文字だけ（CSP の `connect-src 'self'` を広げない）。記録は遊ぶ人のブラウザ（localStorage）だけ。
- 見やすさ：`</head>` の前の見やすさの設定（`<!-- a11y:begin -->`〜`end`）は shared-workflows `template/a11y/a11y.html` の写し、`qa/a11y.mjs` も `template/qa/a11y.mjs` の写しで、ここでは直さない。色だけで分けない（ワナ＝✓と太い枠、ちがう＝✕と破線、ヒントで外した＝点線と「ここではない」、取れない星は ☆、カレンダーは ★ ↺ ▲ ▶）。部品は全部ボタンで、読み上げ用の名前（チェックの有無・「広告」の小さな字）を持つ。知らせは `#live`（role=status）。
- 引き継ぎコード：`transfer.js`・`qa/transfer-check.mjs` は shared-workflows `template/` の写し（ここで直さない）。`data-keys` は `gamen-no-wana-v1`。記録の形を変えたら `qa/run.mjs` の引き継ぎの `sample` も合わせる。
- PWA（`manifest.webmanifest`・`sw.js`・`icon-*.png`）：画面のファイルを足したら `sw.js` の `SHELL` にも足し、中身を大きく変えたら `CACHE` の版を上げる。アイコンは `node tools/make-icons.cjs`、SNS 用の絵 `og.png` は `node tools/make-og.cjs`（今日の画面を入れない）。
- 押せる所は高さ44px以上・幅320pxではみ出さない（QA が見る）。機能を足す・直すたびに `qa/run.mjs` に検査を足す。乱数で組む部分は何百回・何年分も作って確かめる（shared-workflows `incidents/2026-10-31-roppo-empty-village.md`）。少し遅れて動く処理は、画面が替わっていたら何もしない（`VIEW`）。
- 公開リポジトリなので、個人情報・鍵を入れない。

## 公開

- GitHub Pages は `main` のルート（`/`）を公開する。PR の QA と Secret scan が ✅ になると `automerge.yml` が自動でマージする。止めたいときは下書きにするか、ラベル「自動マージしない」を付ける。
- `sw.js`・`manifest.webmanifest` を変える PR は自動ではマージされない（`hold_paths`）。CodeRabbit のレビューを待ち、手でマージする直前に今の head へのレビューを読み直す（shared-workflows `incidents/2026-11-01-roppo-merged-before-review.md`）。CodeRabbit は PR に `@coderabbitai review` とコメントして頼む。

## 共通のきまり

- PR の作り方・マージの仕方は satou-aaaaa/shared-workflows の `routines/pr.md`、全体のきまりは `routines/common.md` に従う。
- CI の部品は shared-workflows の共通部品を呼ぶ。リポジトリ側の .github/workflows には呼び出しと設定値だけを書く。
- Claude 以外の AI・人が作業するときは、shared-workflows の `routines/tool-map.md` と `routines/without-claude.md` を読む。
