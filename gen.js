// 画面のワナ：架空の通販・アプリの画面と、そこに仕込まれた「ダークパターン」（だます画面の仕掛け）。
// 種類の名前は消費者庁「いわゆるダークパターン」リサーチ・ディスカッション・ペーパー（2025年4月、33種類・9カテゴリー）の呼び方に合わせる。
// make(item) が { t: 種類, v: 画面の形, s: 種, h: 1 ならワナの無い正直な画面 } から画面を作る。同じ item からは、いつでも同じ画面になる。
// 店・アプリ・商品・人はすべて架空。実在の会社名・ロゴは使わない。
(function (root) {
  "use strict";
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function seedOf(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  const pick = (R, a) => a[Math.floor(R() * a.length)];
  const yen = (n) => "¥" + Math.round(n).toLocaleString("ja-JP");
  const r10 = (n) => Math.round(n / 10) * 10;

  // ---- 架空の店・商品・アプリ（足すときは最後に足す。並びを変えると過去の日の画面が変わる）----
  const SHOPS = ["ひだまりストア", "まちかど通販", "あおぞらマーケット", "こもれびショップ", "ほしぞら雑貨店", "みなとモール", "そよかぜ百貨", "くるみ商店"];
  const GOODS = [
    ["ステンレス水筒", "🥤", 2480], ["保温マグ", "☕", 1680], ["折りたたみ傘", "☂️", 1980], ["ワイヤレスイヤホン", "🎧", 5980], ["スニーカー", "👟", 6980],
    ["リュック", "🎒", 4980], ["腕時計", "⌚", 8980], ["フライパン", "🍳", 2980], ["ノート5冊", "📒", 680], ["色えんぴつ24色", "🖍️", 1280],
    ["マフラー", "🧣", 2980], ["手袋", "🧤", 1580], ["帽子", "🧢", 1980], ["サングラス", "🕶️", 2480], ["卓上ライト", "💡", 3280],
    ["目覚まし時計", "⏰", 1880], ["ジグソーパズル", "🧩", 2280], ["植木鉢セット", "🪴", 1980], ["お米5kg", "🍚", 2980], ["りんご3kg", "🍎", 2680],
    ["はちみつ", "🍯", 1580], ["紅茶セット", "🍵", 1980], ["バスタオル", "🛁", 1280], ["ハンドクリーム", "🧴", 880], ["モバイル電池", "🔋", 2980],
    ["充電ケーブル", "🔌", 980], ["キーボード", "⌨️", 4980], ["マウス", "🖱️", 2480], ["スピーカー", "🔊", 3980], ["ぬいぐるみ", "🧸", 1980],
    ["絵本", "📚", 1430], ["ボールペン10本", "🖊️", 880],
  ];
  const APPS = [
    ["そよかぜ音楽", "🎵", "音楽"], ["こもれび動画", "🎬", "動画"], ["まめ天気", "⛅", "天気"], ["くらし家計簿", "📊", "家計簿"], ["ほしぞら書店", "📖", "電子書籍"],
    ["はねるパズル", "🧩", "ゲーム"], ["てくてく歩数計", "👣", "歩数計"], ["らくらく写真", "📷", "写真"], ["もぐもぐレシピ", "🍲", "レシピ"], ["ひらめき英会話", "💬", "英会話"],
  ];
  const TEIKI = [["スキンケアセット", "🧴"], ["健康茶", "🍵"], ["プロテイン", "🥛"], ["シャンプー", "🫧"], ["ドッグフード", "🐶"], ["コーヒー豆", "☕"]];
  const PREFS = ["北海道", "宮城県", "東京都", "愛知県", "大阪府", "広島県", "香川県", "福岡県", "沖縄県", "新潟県"];

  // ---- ワナの種類（18）。def：どんなワナか・tip：身を守るコツ・look：ヒント（答えは言わない）。どれも40字以内 ----
  const TYPES = [
    { id: "timer", name: "カウントダウン", cat: "緊急性", def: "本当は期限が無いのに、残り時間を見せて急がせる。", tip: "急がされたら一度とめる。開き直して時間が戻れば作り話。", look: "時間の表示と、場面の文を見くらべよう。" },
    { id: "zaiko", name: "在庫わずか", cat: "緊急性", def: "本当は品切れしないのに「残りわずか」と見せて急がせる。", tip: "「残り○点」は日をおいて見る。ずっと同じなら疑う。", look: "数の表示は、いつ見ても同じでは？" },
    { id: "katsudo", name: "アクティビティメッセージ", cat: "社会的証明", def: "だれかが買った・見ているという、確かめられない知らせを出す。", tip: "他の人の動きの知らせは、買う理由にしない。", look: "画面の上に、ふわっと出てくる知らせは？" },
    { id: "kanjo", name: "感情のゆさぶり", cat: "インターフェイス干渉", def: "断る言葉を「損をしたい」のようにして、断りにくくする。", tip: "断るボタンの言葉は気にしない。いらなければ押してよい。", look: "断るほうのボタンの言葉を読もう。" },
    { id: "jizen", name: "事前選択", cat: "インターフェイス干渉", def: "お店に都合のよい選択肢が、はじめから選ばれている。", tip: "申し込む前に、チェックと選ばれた所を全部見直す。", look: "自分で選んでいないのに、選ばれている所は？" },
    { id: "kago", name: "こっそり追加", cat: "こっそり", def: "頼んでいない商品やサービスが、かごに入っている。", tip: "かごの中は、入れたものだけか1行ずつ見る。", look: "かごの中身を、自分が入れた物とくらべよう。" },
    { id: "cost", name: "隠れたコスト", cat: "こっそり", def: "最後の画面になってから、手数料などが足される。", tip: "最初の値段でなく、払う直前の合計で決める。", look: "前の画面の値段と、合計を見くらべよう。" },
    { id: "teiki", name: "隠れ定期購入", cat: "こっそり", def: "1回だけに見せて、実は定期の契約になっている。", tip: "「初回だけ安い」は、2回目からと回数の条件を読む。", look: "小さな字に、何が書いてある？" },
    { id: "kaiyaku", name: "キャンセル困難", cat: "妨害", def: "申し込みは簡単なのに、やめる手続きがとても大変。", tip: "申し込む前に、やめ方と窓口を確かめておく。", look: "やめたい人は、どこを押せばいい？" },
    { id: "hikkake", name: "ひっかけ質問", cat: "インターフェイス干渉", def: "二重の否定などで、何を選んだのか分かりにくくする。", tip: "チェックの文は最後まで読み、意味を言い直してみる。", look: "チェックの文を、ゆっくり声に出して読もう。" },
    { id: "kaiso", name: "偽りの階層表示", cat: "インターフェイス干渉", def: "お店が選ばせたい物だけ大きく目立たせ、ほかを見えにくくする。", tip: "大きなボタンの前に、小さな字の選択肢をさがす。", look: "目立つ物と、目立たない物の差は？" },
    { id: "kokoku", name: "偽装広告", cat: "インターフェイス干渉", def: "広告なのに、記事や本物のボタンのように見せる。", tip: "「広告」「PR」の小さな字をさがし、押す前に確かめる。", look: "本物のボタンは、どれだろう？" },
    { id: "shitsuyo", name: "執拗な繰り返し", cat: "執拗な繰り返し", def: "断っても、同じお願いを何度も出してくる。", tip: "「もう表示しない」を探す。無ければ設定で止める。", look: "「いいえ」と答える方法はある？" },
    { id: "kaiji", name: "強制的情報開示", cat: "行為の強制", def: "使うのに要らない個人情報や許可を、出さないと使わせない。", tip: "その機能に本当に要る許可か考える。要らなければ断る。", look: "このアプリに、その許可は本当に要る？" },
    { id: "hikaku", name: "価格比較妨害", cat: "妨害", def: "値段の書き方をばらばらにして、くらべにくくする。", tip: "全部を「1か月いくら（税込）」に直してくらべる。", look: "値段の単位は、そろっている？" },
    { id: "nijuu", name: "不当参照価格", cat: "インターフェイス干渉", def: "売ったことのない「通常価格」と並べ、大きく値引きに見せる。", tip: "「通常価格」がいつの値段か確かめる。ほかの店とくらべる。", look: "消された高い値段は、本当の値段？" },
    { id: "tsuka", name: "中間通貨", cat: "妨害", def: "コインなどに置きかえて、本当は何円なのか分かりにくくする。", tip: "コインの値段を円に直す。余るコインの分も数える。", look: "それは、何円になる？" },
    { id: "no1", name: "No.1表示", cat: "社会的証明", def: "根拠のうすい調べ方で「No.1」「満足度○%」と見せる。", tip: "※の小さな字で、だれに・どう聞いたかを確かめる。", look: "※の小さな字を読もう。" },
  ];

  // 画面の部品：k は見た目の種類、x は文字、s は小さな添え字、on はチェック。trap:true がワナの部品（ワナの無い画面では無し）
  // 部品の k：img 商品の絵と名前／price 値段／text 文／small 小さな文／btn 大きなボタン／btn2 ふつうのボタン／link 小さな文字のボタン／check チェック／radio 選択／banner 目立つ帯／pop 浮かぶ知らせ／row 左右に分かれた行／total 合計
  const P = (k, x, o) => Object.assign({ k, x }, o || {});
  const shop = (R) => "🛒 " + pick(R, SHOPS);
  const good = (R) => { const g = pick(R, GOODS); return { name: g[0], em: g[1], p: g[2] }; };
  const app = (R) => { const a = pick(R, APPS); return { name: a[0], em: a[1], kind: a[2] }; };
  const days = (R) => 2 + Math.floor(R() * 4);

  // 種類ごとの画面の形（4つずつ）。h が真ならワナを正直な部品に替える（場面の文も、ワナの手がかりを書かない）
  const FORMS = {
    timer: [
      (R, h) => { const g = good(R), m = 3 + Math.floor(R() * 7); return { bar: shop(R), scene: h ? `${g.name}のセールのお知らせを見て、ページを開いた。` : `ページを開き直したら、残り時間がまた${m}:00から始まった。`, parts: [P("img", g.name, { s: g.em }), P("price", yen(g.p * 0.8), { s: "セール価格（税込）" }), h ? P("banner", "セールは11月30日 23:59まで", { s: "終わる日がはっきり書いてある" }) : P("banner", `⏰ この値段は あと 0${m - 1}:59`, { trap: true }), P("text", `お届け：${days(R)}日後`), P("btn", "カートに入れる")] }; },
      (R, h) => { const n = 10 + Math.floor(R() * 3) * 5, p = r10(6800 + R() * 6000); return { bar: "🏨 たびの宿さがし", scene: h ? "週末の宿をさがしている。" : `次の日に見ても、同じ「${n}分以内」の表示が出た。`, parts: [P("img", "海の見える宿・1泊", { s: "🌊" }), P("price", yen(p), { s: "1人あたり（税込）" }), h ? P("small", "キャンセル料：前日から50%") : P("banner", `${n}分以内に予約しないと、この値段は消えます`, { trap: true }), P("text", "朝食つき・駅から歩いて5分"), P("btn", "予約に進む")] }; },
      (R, h) => { const m = 3 + Math.floor(R() * 6), off = pick(R, [300, 500]); return { bar: "🛵 もぐもぐデリバリー", scene: h ? "夕ごはんを、配達で頼もうとしている。" : "時間が0になったら、クーポンがまた同じ時間から始まった。", parts: [P("img", "ラーメンと餃子のセット", { s: "🍜" }), P("price", yen(1580), { s: "税込" }), h ? P("banner", `${yen(off)}引きクーポン：11月30日まで使えます`) : P("banner", `🎟 ${yen(off)}引きクーポン あと 0${m}:00`, { trap: true }), P("btn", "クーポンを使って注文")] }; },
      (R, h) => { const p = r10(9800 + R() * 5000); return { bar: "🎓 ひらめきオンライン講座", scene: h ? "パソコンの講座を申し込むか考えている。" : "1か月前に見たときも、同じ「残り2時間」と出ていた。", parts: [P("img", "はじめての表計算 全6回", { s: "💻" }), P("price", yen(p), { s: "特別価格（税込）" }), h ? P("text", "申し込み：12月10日まで（定員30人）") : P("banner", "特別価格の受付は あと 1:59:48", { trap: true }), P("btn", "申し込む")] }; },
    ],
    zaiko: [
      (R, h) => { const g = good(R); return { bar: shop(R), scene: h ? `${g.name}を買おうか考えている。` : "1週間前も、きのうも「残り1点」と出ていた。", parts: [P("img", g.name, { s: g.em }), P("price", yen(g.p), { s: "税込" }), h ? P("text", `在庫あり（ご注文から${days(R)}日でお届け）`) : P("banner", "🔥 残り1点！ お急ぎください", { trap: true }), P("text", "送料：全国 ¥500"), P("btn", "カートに入れる")] }; },
      (R, h) => { const n = 2 + Math.floor(R() * 3); return { bar: "🎫 イベントチケット", scene: h ? "コンサートのチケットを見ている。" : `何度開き直しても「残り${n}席」のまま変わらない。`, parts: [P("img", "秋のピアノ演奏会", { s: "🎹" }), P("price", yen(r10(3500 + R() * 2000)), { s: "1枚（税込）" }), P("text", "12月14日（日）18:00 開演"), h ? P("text", "S席・A席とも、まだ選べます") : P("banner", `残り${n}席！ 今すぐ決めないと売り切れます`, { trap: true }), P("btn", "席を選ぶ")] }; },
      (R, h) => { const p = r10(8800 + R() * 6000); return { bar: "✈️ そらの旅チケット", scene: h ? "年末に帰る飛行機をさがしている。" : "日付や便を変えても、どれも「残り2席」と出る。", parts: [P("text", "12月29日　東京 → 福岡"), P("price", yen(p), { s: "片道（税込）" }), h ? P("text", "空席：あり") : P("banner", "この値段の席は 残り2席！", { trap: true }), P("btn", "この便を選ぶ")] }; },
      (R, h) => { const p = r10(2980 + R() * 3000); return { bar: shop(R), scene: h ? "セーターを買おうとしている。" : "どの色・どのサイズを選んでも「残りわずか」になる。", parts: [P("img", "ウールのセーター", { s: "🧶" }), P("price", yen(p), { s: "税込" }), P("text", "色：紺　サイズ：M"), h ? P("text", "在庫あり（3日でお届け）") : P("banner", "⚠ このサイズは残りわずか", { trap: true }), P("btn", "カートに入れる")] }; },
    ],
    katsudo: [
      (R, h) => { const g = good(R), pr = pick(R, PREFS); return { bar: shop(R), scene: h ? `${g.name}のページを見ている。` : "同じような知らせが、数秒ごとに名前と県を変えて出る。", parts: [h ? P("text", "レビュー 32件（買った人だけが書けます）") : P("pop", `🛍 たった今、${pr}の方が購入しました`, { trap: true }), P("img", g.name, { s: g.em }), P("price", yen(g.p), { s: "税込" }), P("text", `お届け：${days(R)}日後`), P("btn", "カートに入れる")] }; },
      (R, h) => { const n = 12 + Math.floor(R() * 40); return { bar: "🏨 たびの宿さがし", scene: h ? "温泉の宿をさがしている。" : "どの宿を開いても、同じ人数の知らせが出る。", parts: [P("img", "山あいの温泉宿", { s: "♨️" }), h ? P("small", "空室：12月の土曜はあと少しです（宿の発表）") : P("pop", `👀 いま ${n}人がこの宿を見ています`, { trap: true }), P("price", yen(r10(9800 + R() * 5000)), { s: "1人あたり（税込）" }), P("text", "夕食・朝食つき"), P("btn", "予約に進む")] }; },
      (R, h) => { const n = 30 + Math.floor(R() * 60); return { bar: "🛵 もぐもぐデリバリー", scene: h ? "お昼ごはんの店を選んでいる。" : "どの店を開いても、同じ「この1時間で○人」が出る。", parts: [P("img", "からあげ弁当", { s: "🍱" }), h ? P("small", "レビュー ★4.2（注文した人 340件）") : P("pop", `🔥 この1時間で ${n}人が注文しました`, { trap: true }), P("price", yen(890), { s: "税込" }), P("btn", "注文に進む")] }; },
      (R, h) => { const a = app(R), pr = pick(R, PREFS); return { bar: `${a.em} ${a.name}`, scene: h ? `${a.kind}のアプリの、有料プランの案内。` : "アプリを開くたびに、同じ知らせが県名を変えて出る。", parts: [P("text", "プレミアムプラン　月額 ¥680"), h ? P("small", "いつでも解約できます（設定から）") : P("pop", `✉️ ${pr}の方が、いま申し込みました`, { trap: true }), P("text", "広告なし・使える機能がふえます"), P("btn", "申し込む")] }; },
    ],
    kanjo: [
      (R, h) => { const off = pick(R, [10, 15, 20]); return { bar: shop(R), scene: "買い物の途中で、お知らせのまどが出た。", parts: [P("text", "メールマガジンに登録しませんか？"), P("small", `登録すると次の買い物が${off}%オフ`), P("btn", "登録する"), h ? P("btn2", "登録しない") : P("btn2", "いいえ、損をしてもかまいません", { trap: true })] }; },
      (R, h) => { const g = good(R), p = r10(g.p * 0.15 + 200); return { bar: shop(R), scene: `${g.name}をかごに入れたら、まどが出た。`, parts: [P("img", g.name, { s: g.em }), P("text", `こわれたときの保証を付けますか？（${yen(p)}）`), P("btn", "保証を付ける"), h ? P("btn2", "付けない") : P("btn2", "付けない。こわれても自分でなんとかします", { trap: true })] }; },
      (R, h) => { const a = app(R); return { bar: `${a.em} ${a.name}・解約`, scene: "アプリをやめる手続きの、最後の画面。", parts: [P("text", "解約すると、保存したデータは消えます"), P("btn", "やめずに続ける"), h ? P("btn2", "解約する") : P("btn2", "解約して、思い出を全部捨てる", { trap: true }), P("small", "データは解約の前に書き出せます")] }; },
      (R, h) => ({ bar: "📰 くらしのニュース", scene: "記事を読んでいたら、まどが出た。", parts: [P("text", "月額 ¥300 で、広告なしで読めます"), P("btn", "申し込む"), h ? P("btn2", "今はしない") : P("btn2", "いいえ、広告だらけでかまいません", { trap: true }), P("small", "無料のまま読み続けられます")] }),
    ],
    jizen: [
      (R, h) => { const g = good(R), p = pick(R, [330, 440, 550]); return { bar: shop(R) + "・ご注文の確認", scene: `${g.name}を1つ買う、最後の画面。`, parts: [P("row", g.name, { s: yen(g.p) }), P("row", "送料", { s: "¥0" }), h ? P("check", `あんしん保証に入る（月額${yen(p)}）`, { on: false }) : P("check", `あんしん保証に入る（月額${yen(p)}）`, { on: true, trap: true }), P("total", "合計", { s: yen(g.p) }), P("btn", "注文を確定する")] }; },
      (R, h) => { const a = app(R), lo = pick(R, [480, 580, 680]), hi = lo * 3; return { bar: `${a.em} ${a.name}`, scene: "プランを選んで、申し込む画面。", parts: [P("text", "プランを選んでください"), P("radio", `ふつう（月額 ${yen(lo)}）`, { on: h }), h ? P("radio", `プレミアム（月額 ${yen(hi)}）`, { on: false }) : P("radio", `プレミアム（月額 ${yen(hi)}）`, { on: true, trap: true }), P("small", "どちらも、いつでも解約できます"), P("btn", "このプランで申し込む")] }; },
      (R, h) => { const p = r10(8800 + R() * 6000); return { bar: "✈️ そらの旅チケット・お支払い", scene: "航空券を買う、最後の画面。座席の指定と運賃だけを選んだ。", parts: [P("row", "運賃（片道）", { s: yen(p) }), P("row", "座席の指定", { s: "¥0" }), h ? P("check", "旅行の保険に入る（¥800）", { on: false }) : P("check", "旅行の保険に入る（¥800）", { on: true, trap: true }), P("btn", "支払う")] }; },
      (R, h) => { const a = app(R); return { bar: `${a.em} ${a.name}・登録`, scene: "アプリの会員登録の画面。", parts: [P("text", "メールアドレス：（入力ずみ）"), h ? P("check", "提携する会社にメールアドレスを渡す", { on: false }) : P("check", "提携する会社にメールアドレスを渡す", { on: true, trap: true }), P("small", "提携する会社：12社（一覧）"), P("btn", "登録する")] }; },
    ],
    kago: [
      (R, h) => { const g = good(R), x = pick(R, [["梱包おまかせパック", 390], ["あんしん配送オプション", 300], ["お試し雑誌1冊", 550]]); return { bar: shop(R) + "・かご", scene: `かごには${g.name}を1つだけ入れた。`, parts: [P("row", `${g.em} ${g.name} ×1`, { s: yen(g.p) }), h ? P("row", "送料", { s: "¥0" }) : P("row", `${x[0]} ×1`, { s: yen(x[1]), trap: true }), P("small", "数は、レジに進む前に変えられます"), P("total", "合計", { s: yen(g.p + (h ? 0 : x[1])) }), P("btn", "レジに進む")] }; },
      (R, h) => { const g = good(R), g2 = good(R); return { bar: shop(R) + "・かご", scene: `かごには${g.name}を1つだけ入れた。`, parts: [P("row", `${g.em} ${g.name} ×1`, { s: yen(g.p) }), h ? P("small", "おすすめ：この商品を見た人は、ほかの物も見ています（かごには入っていません）") : P("row", `${g2.em} ${g2.name}（ご一緒にどうぞ） ×1`, { s: yen(g2.p), trap: true }), P("row", "送料", { s: "¥0" }), P("total", "合計", { s: yen(g.p + (h ? 0 : g2.p)) }), P("btn", "レジに進む")] }; },
      (R, h) => ({ bar: "🛵 もぐもぐデリバリー・かご", scene: "ラーメンを1杯だけ選んで、かごを開いた。", parts: [P("row", "🍜 しょうゆラーメン ×1", { s: yen(900) }), h ? P("row", "配達料", { s: "¥0" }) : P("row", "🥤 おすすめドリンク ×1", { s: yen(250), trap: true }), P("total", "合計", { s: yen(h ? 900 : 1150) }), P("btn", "注文する")] }),
      (R, h) => { const p = r10(7800 + R() * 4000); return { bar: "🏨 たびの宿さがし・予約の確認", scene: "素泊まり（食事なし）の部屋を、2人で予約している。", parts: [P("row", "素泊まり 2名", { s: yen(p * 2) }), h ? P("row", "入湯税", { s: "¥300" }) : P("row", "朝食（2名分）", { s: yen(3000), trap: true }), P("total", "合計", { s: yen(p * 2 + (h ? 300 : 3000)) }), P("btn", "予約する")] }; },
    ],
    cost: [
      (R, h) => { const g = good(R), f = pick(R, [330, 440, 550, 660]); return { bar: shop(R) + "・お支払い", scene: h ? `商品ページで「${g.name} ${yen(g.p)}・送料 ${yen(f)}」と見ていた。` : `商品ページでは「${g.name} ${yen(g.p)}」とだけ書いてあった。`, parts: [P("row", g.name, { s: yen(g.p) }), h ? P("row", "送料", { s: yen(f) }) : P("row", "サービス利用料", { s: yen(f), trap: true }), P("row", "お届け", { s: `${days(R)}日後` }), P("total", "合計", { s: yen(g.p + f) }), P("btn", "支払う")] }; },
      (R, h) => { const p = r10(3000 + R() * 3000), f = r10(p * 0.12); return { bar: "🎫 イベントチケット・お支払い", scene: h ? `案内に「チケット ${yen(p)}＋発券手数料 ${yen(f)}」と書いてあった。` : `案内には「チケット ${yen(p)}」とだけ書いてあった。`, parts: [P("row", "チケット ×1", { s: yen(p) }), h ? P("row", "発券手数料（案内どおり）", { s: yen(f) }) : P("row", "システム手数料", { s: yen(f), trap: true }), P("row", "受け取り", { s: "スマホに表示" }), P("total", "合計", { s: yen(p + f) }), P("btn", "支払う")] }; },
      (R, h) => { const p = r10(7800 + R() * 4000), f = pick(R, [1500, 2000, 2500]); return { bar: "🏨 たびの宿さがし・お支払い", scene: h ? `一覧に「1泊 ${yen(p)}＋清掃料 ${yen(f)}」と出ていた。` : `一覧では「1泊 ${yen(p)}」とだけ出ていた。`, parts: [P("row", "1泊（1部屋）", { s: yen(p) }), h ? P("row", "清掃料（一覧どおり）", { s: yen(f) }) : P("row", "清掃料", { s: yen(f), trap: true }), P("total", "合計", { s: yen(p + f) }), P("btn", "支払う")] }; },
      (R, h) => ({ bar: "🛵 もぐもぐデリバリー・お支払い", scene: h ? "店の一覧に「配達料¥0・サービス料10%」と出ていた。" : "店の一覧では「配達料 ¥0」とだけ出ていた。", parts: [P("row", "🍛 カレーライス ×1", { s: yen(1000) }), P("row", "配達料", { s: "¥0" }), h ? P("row", "サービス料 10%（一覧どおり）", { s: yen(100) }) : P("row", "サービス料", { s: yen(100), trap: true }), P("total", "合計", { s: yen(1100) }), P("btn", "注文する")] }),
    ],
    teiki: [
      (R, h) => { const t = pick(R, TEIKI), p = r10(3980 + R() * 2000), n = pick(R, [3, 4, 5]); return { bar: shop(R), scene: `${t[0]}の広告から、このページに来た。`, parts: [P("img", t[0], { s: t[1] }), P("banner", "初回 ¥500（税込）"), h ? P("text", `定期便です：2回目から毎月 ${yen(p)}・いつでも休めます`) : P("small", `※2回目から毎月 ${yen(p)}。${n}回の受け取りが条件です。`, { trap: true, tiny: true }), P("text", "送料無料"), P("btn", "申し込む")] }; },
      (R, h) => { const a = app(R), p = pick(R, [980, 1280, 1480]); return { bar: `${a.em} ${a.name}`, scene: `${a.kind}のアプリを入れたら、この画面が出た。`, parts: [P("banner", "7日間 無料でお試し"), P("text", `${a.kind}が全部使えます`), h ? P("text", `8日目から月額 ${yen(p)}。7日以内に解約すれば0円。解約は設定から`) : P("small", `※8日目から自動で月額 ${yen(p)}の契約になります`, { trap: true, tiny: true }), P("btn", "無料で始める"), P("btn2", "今はしない")] }; },
      (R, h) => { const t = pick(R, TEIKI), p = r10(2980 + R() * 2000); return { bar: shop(R), scene: `${t[0]}の「お試し」の広告から来た。`, parts: [P("img", t[0] + " お試し1袋", { s: t[1] }), P("banner", "¥0（送料だけ）"), h ? P("text", `1回だけのお試しです。続けるときは、自分で申し込みます`) : P("small", `※翌月から毎月 ${yen(p)}でお届けする定期コースです`, { trap: true, tiny: true }), P("btn", "お試しを申し込む")] }; },
      (R, h) => { const p = r10(3980 + R() * 2000); return { bar: "🍱 らくらく宅食", scene: "冷凍のおかずの、お試しセットを見ている。", parts: [P("img", "おかずお試し 4食", { s: "🍱" }), P("price", yen(1980), { s: "送料込み" }), h ? P("text", `お試しは1回だけ。続けるなら、1週間ごと ${yen(p)}`) : P("small", `※そのあとも1週間ごと自動でお届け（${yen(p)}）`, { trap: true, tiny: true }), P("btn", "お試しを注文")] }; },
    ],
    kaiyaku: [
      (R, h) => { const a = app(R), p = pick(R, [980, 1280]); return { bar: `${a.em} ${a.name}・設定`, scene: "申し込みはアプリから1分でできた。いま、やめたい。", parts: [P("row", "いまのプラン", { s: `月額 ${yen(p)}` }), P("row", "次の支払い", { s: "12月1日" }), P("btn", "プランを続ける"), h ? P("btn2", "解約する（この画面ですぐできます）") : P("small", "解約は電話のみ（平日10時〜16時）", { trap: true })] }; },
      (R, h) => { const a = app(R); return { bar: `${a.em} ${a.name}・解約`, scene: h ? "やめるボタンを押したら、この画面になった。" : "やめるボタンを押したら、この画面になった（もう3つ目の画面）。", parts: [P("text", "やめる前に、アンケートにお答えください"), P("small", h ? "答えなくても解約できます" : "全部の質問（20問）に答えると、次へ進めます", h ? {} : { trap: true }), P("btn", "やっぱり続ける"), P("btn2", h ? "答えずに解約する" : "アンケートに答える")] }; },
      (R, h) => { const p = r10(6800 + R() * 3000); return { bar: "🏋️ まちなかジム・会員ページ", scene: "入会はスマホで3分だった。いま、やめたい。", parts: [P("row", "月会費", { s: yen(p) }), P("row", "次の引き落とし", { s: "12月27日" }), h ? P("btn2", "退会する（このページでできます）") : P("small", "退会は店に来て、書類で（毎月10日まで）", { trap: true }), P("btn", "会員を続ける")] }; },
      (R, h) => { const a = app(R); return { bar: `${a.em} ${a.name}・設定`, scene: "スマホのアプリから申し込んだ。アプリでやめたい。", parts: [P("text", "契約中：有料プラン"), h ? P("btn2", "このアプリで解約する") : P("small", "解約は、パソコンのサイトからだけできます", { trap: true }), P("btn", "プランを見る"), P("small", "解約の後も、月末まで使えます")] }; },
    ],
    hikkake: [
      (R, h) => ({ bar: shop(R) + "・会員登録", scene: "会員登録の、最後の画面。", parts: [P("text", "メールアドレス：（入力ずみ）"), h ? P("check", "お知らせメールを受け取る", { on: false }) : P("check", "お知らせメールを受け取らない場合は、チェックを入れないでください", { on: false, trap: true }), P("small", "パスワードは自分だけが知るものにしましょう"), P("btn", "登録する")] }),
      (R, h) => { const a = app(R); return { bar: `${a.em} ${a.name}`, scene: "アプリをやめる手続きの画面。", parts: [P("text", "本当に解約しますか？"), h ? P("btn", "解約する") : P("btn", "解約をやめない", { trap: true }), h ? P("btn2", "続ける（解約しない）") : P("btn2", "キャンセル"), P("small", "解約しても、月末までは使えます")] }; },
      (R, h) => ({ bar: "🏨 たびの宿さがし・予約", scene: "予約を取り消したくて、取り消しのボタンを押した。", parts: [h ? P("text", "予約を取り消しますか？") : P("text", "予約を取り消さないで、よろしいですか？", { trap: true }), P("btn", "はい"), P("btn2", "いいえ"), P("small", "取り消し料：無料（前日まで）")] }),
      (R, h) => ({ bar: shop(R) + "・設定", scene: "お知らせのメールを止めたい。", parts: [P("text", "メールの設定"), h ? P("check", "広告のメールを受け取る", { on: true }) : P("check", "広告のメールを止めないことに同意する", { on: true, trap: true }), P("small", "注文のお知らせは、いつも届きます"), P("btn", "保存する")] }),
    ],
    kaiso: [
      (R, h) => { const a = app(R), m = pick(R, [480, 580]), y = m * 11; return { bar: `${a.em} ${a.name}`, scene: "プランを選ぶ画面。月ごとに払いたい。", parts: [P("text", "プランを選んでください"), P("btn", `年額プラン ${yen(y)}（1年分を先に払う）`, h ? {} : { trap: true }), h ? P("btn", `月額プラン ${yen(m)}`) : P("link", `月額プラン ${yen(m)}はこちら`, { trap: true }), P("small", "どちらも中身は同じです")] }; },
      (R, h) => ({ bar: "🍪 このサイトについて", scene: "ニュースのサイトを開いたら、まどが出た。", parts: [P("text", "閲覧の記録（クッキー）を広告に使います"), P("btn", "すべて許可する", h ? {} : { trap: true }), h ? P("btn", "許可しない") : P("link", "必要なものだけにする", { trap: true }), P("small", "あとから設定で変えられます")] }),
      (R, h) => { const g = good(R); return { bar: shop(R) + "・お届け方法", scene: `${g.name}を、急がずに受け取りたい。`, parts: [P("text", "お届け方法を選んでください"), P("btn", "お急ぎ便（¥700・あすお届け）", h ? {} : { trap: true }), h ? P("btn", "ふつう便（無料・3日後）") : P("link", "ふつう便（無料）はこちら", { trap: true }), P("small", "どちらも追跡できます")] }; },
      (R, h) => ({ bar: "📱 ほしぞらモバイル・保証の更新", scene: "スマホの保証の更新。いまのプランのままでいい。", parts: [P("text", "保証プランの更新"), P("btn", "フル保証にする（月額 ¥980）", h ? {} : { trap: true }), h ? P("btn", "いまのプランのまま（月額 ¥380）") : P("link", "いまのプランのまま", { trap: true }), P("small", "あとから変えられます")] }),
    ],
    kokoku: [
      (R, h) => { const n = pick(R, ["かんたんメモ帳", "すっきり画像ビューア", "ことば辞書"]); return { bar: "💾 ソフトの置き場", scene: `「${n}」をダウンロードしに来た。`, parts: [P("img", `${n} 2.1版`, { s: "🗒️" }), h ? P("small", "広告：おすすめの家計簿アプリ（このソフトとは別です）") : P("btn", "⬇ 今すぐダウンロード", { trap: true, ad: true }), P("btn2", "ダウンロード（本体 2.1MB）"), P("small", "対応：Windows・Mac")] }; },
      (R, h) => { const g = good(R); return { bar: "📰 くらしのニュース", scene: "ニュースの一覧を読んでいる。", parts: [P("text", "▶ 来週は気温が下がる見込み"), h ? P("small", "広告　" + g.name + "のセール（ひだまりストア）") : P("text", `▶ 話題の${g.name}、いま半額に`, { trap: true, ad: true }), P("text", "▶ 駅前の図書館、日曜も開館へ"), P("text", "▶ 秋の交通安全週間はじまる")] }; },
      (R, h) => ({ bar: "🎬 こもれび動画", scene: "動画を見に来た。再生ボタンらしい物が2つある。", parts: [P("img", "週末の料理 30分レシピ", { s: "🎥" }), h ? P("small", "広告：キッチン用品のセール（この動画とは別です）") : P("btn", "▶ 再生する（高画質）", { trap: true, ad: true }), P("btn2", "▶ 再生"), P("small", "再生時間 12:34")] }),
      (R, h) => ({ bar: "📰 くらしのニュース", scene: "記事を読んでいたら、知らせのような四角が出た。", parts: [h ? P("small", "広告　新しいメッセージアプリのご案内") : P("pop", "📩 新しいメッセージが1件あります", { trap: true, ad: true }), P("text", "▶ 来月から、ごみの出し方が変わります"), P("text", "▶ 市民マラソンの参加者を募集"), P("text", "▶ 駅前に新しい公園")] }),
    ],
    shitsuyo: [
      (R, h) => { const a = app(R), n = 4 + Math.floor(R() * 4); return { bar: `${a.em} ${a.name}`, scene: h ? "はじめてアプリを開いた。" : `この画面は、今日だけで${n}回目。毎回「あとで」を押している。`, parts: [P("text", "通知をオンにしませんか？"), P("small", "新しいお知らせを、すぐにお届けします"), P("btn", "オンにする"), h ? P("btn2", "オンにしない（もう聞きません）") : P("btn2", "あとで", { trap: true })] }; },
      (R, h) => { const a = app(R); return { bar: `${a.em} ${a.name}`, scene: h ? "アプリを使い始めて10日目。" : "ページをめくるたびに、このまどが出て、続きが読めない。", parts: [P("text", "このアプリを★5で応援してください"), P("btn", "★5をつける"), h ? P("btn2", "今はしない（もう出しません）") : P("btn2", "あとで聞いて", { trap: true }), P("small", "いつもありがとうございます")] }; },
      (R, h) => { const a = app(R), n = 5 + Math.floor(R() * 5); return { bar: `${a.em} ${a.name}`, scene: h ? "アプリをはじめて開いた。" : `「許可しない」を選んでも、開くたびに出る（${n}回目）。`, parts: [P("text", "位置情報の使用を許可してください"), P("small", "近くのおすすめをお知らせします"), P("btn", "許可する"), h ? P("btn2", "許可しない（もう聞きません）") : P("btn2", "今回は許可しない", { trap: true })] }; },
      (R, h) => { const off = pick(R, [5, 10]); return { bar: shop(R), scene: h ? "お店のサイトに、はじめて来た。" : "ページを移るたびに、このまどが出て、閉じても戻ってくる。", parts: [P("text", "メールマガジンに登録しませんか？"), P("small", `登録で${off}%オフのクーポン`), P("btn", "登録する"), h ? P("btn2", "閉じる（もう表示しない）") : P("btn2", "閉じる", { trap: true })] }; },
    ],
    kaiji: [
      (R, h) => ({ bar: "🔦 らくらくライト", scene: "スマホを懐中電灯にするアプリを入れた。", parts: [P("img", "ライト", { s: "🔦" }), h ? P("small", "このアプリは、ほかの許可を使いません") : P("text", "連絡先と位置情報を許可してください（しないと使えません）", { trap: true }), P("btn", "ライトをつける"), P("small", "明るさは3段階")] }),
      (R, h) => { const a = app(R); return { bar: `${a.em} ${a.name}`, scene: `${a.kind}のアプリを使い始めるところ。`, parts: [P("text", "かんたん設定"), h ? P("small", "生年月日：入れなくても使えます（あとで入れられます）") : P("text", "電話番号・生年月日・家族の人数を入れないと先に進めません", { trap: true }), P("btn", "はじめる"), P("small", "設定はあとで変えられます")] }; },
      (R, h) => ({ bar: "🎟 まちのクーポン", scene: "お店のクーポンを使うアプリを入れた。", parts: [P("img", "コーヒー 50円引き", { s: "☕" }), h ? P("small", "クーポンは会員登録なしで使えます") : P("text", "年収と勤め先を入れないと、クーポンは使えません", { trap: true }), P("btn", "クーポンを使う")] }),
      (R, h) => ({ bar: "🧮 かんたん電卓", scene: "計算をするだけのアプリを入れた。", parts: [P("img", "電卓", { s: "🧮" }), h ? P("small", "このアプリは、ほかの許可を使いません") : P("text", "カメラとマイクを許可してください（しないと使えません）", { trap: true }), P("btn", "計算をはじめる")] }),
    ],
    hikaku: [
      (R, h) => { const b = pick(R, [980, 1080]); return { bar: "📱 ほしぞらモバイル", scene: "3つのプランから、安いものを選びたい。", parts: [P("text", "料金プラン"), P("row", "Aプラン", { s: `月額 ${yen(b)}（税込）` }), h ? P("row", "Bプラン", { s: `月額 ${yen(b + 100)}（税込）` }) : P("row", "Bプラン", { s: "1日あたり ¥33（1年契約）", trap: true }), h ? P("row", "Cプラン", { s: `月額 ${yen(b - 80)}（年払い・税込）` }) : P("row", "Cプラン", { s: "年額 ¥10,800（税抜）", trap: true }), P("btn", "申し込む")] }; },
      (R, h) => { const g = good(R); return { bar: shop(R), scene: `${g.name}の大きさちがいを、くらべたい。`, parts: [P("img", g.name, { s: g.em }), P("row", "小さいサイズ", { s: `${yen(g.p)}（1個）` }), h ? P("row", "大きいサイズ", { s: `${yen(g.p * 1.6)}（1個）` }) : P("row", "大きいサイズ", { s: "3個セットで1個あたり 2割お得", trap: true }), P("btn", "かごに入れる")] }; },
      (R, h) => { const p = pick(R, [6600, 7700]); return { bar: "🏋️ ジムくらべ", scene: "近くのジム3つから、安いところを選びたい。", parts: [P("row", "Aジム", { s: `月額 ${yen(p)}（税込）` }), h ? P("row", "Bジム", { s: `月額 ${yen(p + 550)}（税込）` }) : P("row", "Bジム", { s: "1回あたり ¥550（週3回通えば）", trap: true }), h ? P("row", "Cジム", { s: `月額 ${yen(p - 330)}（税込）` }) : P("row", "Cジム", { s: "年額 ¥79,200（税抜）", trap: true }), P("btn", "見学を申し込む")] }; },
      (R, h) => { const p = r10(1980 + R() * 800); return { bar: shop(R), scene: "お米を、重さあたりで安いほうを選びたい。", parts: [P("img", "お米", { s: "🍚" }), P("row", "5kg入り", { s: yen(p) }), h ? P("row", "2kg入り", { s: yen(r10(p * 0.45)) }) : P("row", "2kg入り", { s: "1合あたり ¥45", trap: true }), P("btn", "かごに入れる")] }; },
    ],
    nijuu: [
      (R, h) => { const g = good(R), x = r10(g.p * pick(R, [3, 4])), y = r10(g.p * 1.25); return { bar: shop(R), scene: h ? `このお店は、先月まで${yen(y)}で売っていた。` : "このお店は、半年ずっとこの値段で売っている。", parts: [P("img", g.name, { s: g.em }), h ? P("price", yen(g.p), { s: `10月31日まで ${yen(y)} で販売` }) : P("price", yen(g.p), { s: `通常価格 ${yen(x)} → 今だけ${Math.round((1 - g.p / x) * 100)}%オフ`, trap: true }), P("text", `お届け：${days(R)}日後`), P("btn", "カートに入れる")] }; },
      (R, h) => { const g = good(R), x = r10(g.p * 3); return { bar: "📺 テレビショップ", scene: h ? "放送で、ふだんの値段と今日の値段を見くらべた。" : "「メーカー希望小売価格」が決まっていない商品だと、あとで知った。", parts: [P("img", g.name, { s: g.em }), h ? P("price", yen(g.p), { s: "当店のふだんの値段：" + yen(r10(g.p * 1.2)) }) : P("price", yen(g.p), { s: `希望小売価格 ${yen(x)} の品が`, trap: true }), P("text", "送料無料・30日以内なら返品できます"), P("btn", "電話で注文する")] }; },
      (R, h) => { const g = good(R), x = r10(g.p * 2.5); return { bar: shop(R), scene: h ? `${g.name}は、先月まで別の値段で売っていた。` : "セールの前の2日間だけ、値段を上げていたと分かった。", parts: [P("img", g.name, { s: g.em }), h ? P("price", yen(g.p), { s: `10月の値段 ${yen(r10(g.p * 1.2))}` }) : P("price", yen(g.p), { s: `セール前価格 ${yen(x)} → 大幅値下げ`, trap: true }), P("text", "送料：全国 ¥500"), P("btn", "カートに入れる")] }; },
      (R, h) => { const p = r10(19800 + R() * 10000), x = r10(p / 0.3); return { bar: "🛋 くつろぎ家具", scene: h ? "ソファを買い替えたい。" : "「通常価格」で売ったのは、開店前の3日間だけだった。", parts: [P("img", "2人がけのソファ", { s: "🛋" }), h ? P("price", yen(p), { s: "開店からずっとこの値段" }) : P("price", yen(p), { s: `通常価格 ${yen(x)} → 70%オフ`, trap: true }), P("text", "組み立て・設置つき"), P("btn", "カートに入れる")] }; },
    ],
    tsuka: [
      (R, h) => { const p = pick(R, [350, 380, 420]); return { bar: "🎮 はねるパズル・お店", scene: "ゲームの中で、限定の衣装を買いたい。", parts: [P("text", "ジェムを買う：120個 ¥980／550個 ¥4,400"), h ? P("row", "限定衣装", { s: yen(Math.round(p * 8)) + "（円で買えます）" }) : P("row", "限定衣装", { s: `💎 ${p}`, trap: true }), P("small", "買ったジェムは返金できません"), P("btn", "買う")] }; },
      (R, h) => { const p = pick(R, [3, 5, 7]); return { bar: "📖 ほしぞら書店", scene: "電子書籍のマンガを1話読みたい。", parts: [P("text", `第2話：${h ? "¥" + p * 22 : "🪙 " + (p * 20) + " コイン"}`, h ? {} : { trap: true }), P("small", "コインは 500枚 ¥550 から買えます"), P("btn", "読む"), P("small", "第1話は無料です")] }; },
      (R, h) => ({ bar: "🎮 はねるパズル・ガチャ", scene: "ゲームの中で、10回のくじを引くか考えている。", parts: [P("text", "ジェムを買う：250個 ¥2,500／1,300個 ¥10,800"), h ? P("row", "10回引く", { s: "¥2,500（円で払えます）" }) : P("row", "10回引く", { s: "💎 3,000", trap: true }), P("small", "買ったジェムは返金できません"), P("btn", "引く")] }),
      (R, h) => ({ bar: "🎬 こもれび動画・レンタル", scene: "新作の映画を1本、借りて見たい。", parts: [P("img", "新作映画（48時間）", { s: "🎞" }), h ? P("row", "レンタル", { s: "¥400" }) : P("row", "レンタル", { s: "🎟 3枚", trap: true }), P("small", "チケットは 5枚 ¥600 から"), P("btn", "借りる")] }),
    ],
    no1: [
      (R, h) => { const g = good(R), n = pick(R, [10, 12, 15]); return { bar: shop(R), scene: `${g.name}を、どの店で買うか考えている。`, parts: h ? [P("img", g.name, { s: g.em }), P("text", "レビュー 平均★4.1（購入した人 210件）"), P("price", yen(g.p), { s: "税込" }), P("btn", "カートに入れる")] : [P("img", g.name, { s: g.em }), P("banner", "🏆 満足度 No.1", { trap: true }), P("small", `※当社の社員${n}人に聞いたイメージ調査`, { trap: true, tiny: true }), P("price", yen(g.p), { s: "税込" }), P("btn", "カートに入れる")] }; },
      (R, h) => { const t = pick(R, TEIKI), n = pick(R, [92, 95, 98]); return { bar: shop(R), scene: `${t[0]}の広告を見ている。`, parts: h ? [P("img", t[0], { s: t[1] }), P("text", "使った人の声：合う人も合わない人もいます"), P("small", "返品：届いてから30日以内"), P("btn", "1回だけ買う")] : [P("img", t[0], { s: t[1] }), P("banner", `使った人の ${n}% が満足！`, { trap: true }), P("small", "※モニター20人のうち、使い続けた人に聞きました", { trap: true, tiny: true }), P("btn", "1回だけ買う")] }; },
      (R, h) => ({ bar: "📚 ひらめき学習塾", scene: "子どもの塾を、どこにするか考えている。", parts: h ? [P("img", "ひらめき学習塾", { s: "✏️" }), P("text", "昨年の合格者：48人（全3教室）"), P("small", "体験授業：1回無料"), P("btn", "体験を申し込む")] : [P("img", "ひらめき学習塾", { s: "✏️" }), P("banner", "🏆 合格者数 No.1", { trap: true }), P("small", "※当社の教室どうしでくらべた数", { trap: true, tiny: true }), P("btn", "体験を申し込む")] }),
      (R, h) => { const a = app(R); return { bar: `${a.em} ${a.name}`, scene: `${a.kind}のアプリを、どれにするか考えている。`, parts: h ? [P("img", a.name, { s: a.em }), P("text", "★4.0（2,100件の評価）"), P("small", "無料・アプリ内課金あり"), P("btn", "入手する")] : [P("img", a.name, { s: a.em }), P("banner", "📈 ダウンロード数 No.1", { trap: true }), P("small", "※当社調べ・2019年3月の1週間", { trap: true, tiny: true }), P("btn", "入手する")] }; },
    ],
  };
  // 正直な画面のときの説明（どの形でも使える一言）
  const HONEST = "この画面にワナは無い。値段・条件・断り方が、はっきり書いてある。";

  // item から画面を作る。返すのは { t, v, h, bar, scene, parts, traps:[部品の番号] }
  function make(item) {
    const T = TYPES[item.t], f = FORMS[T.id][item.v];
    const R = rng(item.s), out = f(R, !!item.h);
    const traps = [];
    out.parts.forEach((p, i) => { if (p.trap) traps.push(i); });
    return Object.assign({ t: item.t, v: item.v, h: item.h ? 1 : 0 }, out, { traps });
  }
  // 名前を当てる札：正しい名前と、ほかの種類 n-1 枚（item の種から決める。同じ画面ならいつも同じ札）
  function choices(item, n) {
    const R = rng(item.s ^ 0x9e3779b9), others = TYPES.map((_, i) => i).filter((i) => i !== item.t);
    const o = []; while (o.length < n - 1) { const k = Math.floor(R() * others.length); o.push(others.splice(k, 1)[0]); }
    const all = [item.t, ...o];
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    return all;
  }
  // 同じ画面かどうか（種類・形・正直か・場面と部品の文字）
  const keyOf = (sc) => JSON.stringify([sc.t, sc.v, sc.h, sc.scene, sc.parts.map((p) => [p.k, p.x, p.s || ""])]);
  const FORMN = TYPES.map((T) => FORMS[T.id].length);
  root.WANA = { rng, seedOf, TYPES, FORMS, FORMN, make, choices, keyOf, HONEST, SHOPS, GOODS, APPS };
})(typeof window !== "undefined" ? window : globalThis);
