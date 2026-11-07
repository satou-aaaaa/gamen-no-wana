# 画面のワナ

通販やアプリの画面にひそむ「ダークパターン」（人をだましたり、思っていない選択をさせたりする画面の仕掛け）を見つけて、その名前を当てる学習ゲーム。だれでも同じ1日5画面。

- 遊ぶ: <https://satou-aaaaa.github.io/gamen-no-wana/>
- 架空のお店・アプリの画面が出ます。だまそうとしている所（ワナ）を押し、そのワナの名前を札から選びます。ワナの無い正直な画面もあります。
- 見抜くと「どんなワナか」「身を守るコツ」が出て、ワナ図鑑に集まります（18種類）。
- ★はまちがい＋ヒントの数で決まります（0で★3）。時間の制限はありません。
- 今日の5画面と上級（3画面・ヒントなし・札4枚）は1日1回。とことんは何度でも、「ここで降りる」まで続きます。遊べなかった日は7日前まで、カレンダーから「あとから」遊べます。
- ワナの名前と分け方は、消費者庁「いわゆるダークパターン」の調査（2025年4月、33種類・9つの仲間）から18種類を選んで使っています。ほかに Deceptive Patterns（Harry Brignull）と米国 FTC の報告（2022）を参考にしました。
  - <https://www.caa.go.jp/policies/future/icprc/research_002/>
  - <https://deceptive.design/types>
  - <https://www.ftc.gov/reports/bringing-dark-patterns-light>
- お店・アプリ・商品・人はすべて作り話です。法律の相談にはなりません。困ったときは消費者ホットライン「188」へ。
- 記録は遊ぶ人のブラウザにだけ残り、ゲームから自動で外へ送ることはありません。例外は2つ：文字（Google Fonts）を読み込むとき、Google に IP アドレスが届きます。「X」「LINE」「コピー」を押したときだけ、結果の四角が選んだ先に渡ります（答えは入りません）。

## 開発

```bash
bash scripts/setup.sh   # 最初に一度
node qa/run.mjs         # 検査（CI と同じ）
node tools/make-icons.cjs && node tools/make-og.cjs   # アイコンと SNS 用の絵を作り直すとき
```

感想は [Issue のフォーム](https://github.com/satou-aaaaa/gamen-no-wana/issues/new?template=feedback.yml) からどうぞ。
