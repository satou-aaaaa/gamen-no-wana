// SNS で貼られたときの絵（og.png 1200×630）を作る。今日の画面（答え）は入れず、見本の架空の画面だけ。
// 使い方: node tools/make-og.cjs（qa/ の playwright を使う）
const path = require("path");
let pw; try { pw = require(path.join(__dirname, "..", "qa", "node_modules", "playwright")); } catch (e) { pw = require("playwright"); }
(async () => {
  const b = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(`<body style="margin:0;font-family:'Noto Sans CJK JP','IPAPGothic',sans-serif">
  <div style="width:1200px;height:630px;box-sizing:border-box;padding:70px 80px;background:#151a2e;color:#f3f4f8;position:relative;overflow:hidden">
    <div style="position:absolute;right:90px;top:60px;width:330px;background:#fbfaf6;color:#1d2230;border:10px solid #3a4266;border-radius:36px;overflow:hidden">
      <div style="background:#eceae2;padding:16px 20px;font-size:24px;font-weight:700">🛒 架空のお店</div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:12px;font-size:24px">
        <div style="background:#fde2d6;color:#8a2408;font-weight:800;text-align:center;padding:12px;border-radius:12px">⏰ あと 04:59</div>
        <div>☑ あんしん保証に入る<br><span style="font-size:20px;color:#454b5c">（月額¥330）</span></div>
        <div style="font-size:16px;color:#454b5c">※2回目から毎月¥4,980</div>
        <div style="background:#c2410c;color:#fff;font-weight:800;text-align:center;padding:14px;border-radius:12px">申し込む</div>
      </div></div>
    <div style="position:relative;font-size:34px;color:#ffc857;letter-spacing:.1em">ダークパターンを見抜く・1日5画面</div>
    <div style="position:relative;font-size:110px;font-weight:900;margin-top:18px;letter-spacing:.06em;text-shadow:0 0 30px #ffc85755">画面の<br>ワナ</div>
    <div style="position:relative;font-size:38px;margin-top:18px;line-height:1.5">この画面、どこで<br>だまそうとしている？</div>
  </div></body>`);
  await p.screenshot({ path: path.join(__dirname, "..", "og.png") });
  await b.close();
})();
