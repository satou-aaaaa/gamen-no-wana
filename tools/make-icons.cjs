// アプリのアイコン（icon-192.png・icon-512.png・icon-512-maskable.png）を作る。maskable は絵を中心から0.75倍にして、丸く切られても欠けないようにする（安全な範囲は中心の直径80%）。紺の地に、スマホの画面と虫めがね。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
let pw; try { pw = require(path.join(__dirname, "..", "qa", "node_modules", "playwright")); } catch (e) { pw = require("playwright"); }
(async () => {
  const b = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const [s, name, k] of [[192, "icon-192.png", 1], [512, "icon-512.png", 1], [512, "icon-512-maskable.png", 0.75]]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#151a2e"/><g transform="translate(50 50) scale(${k}) translate(-50 -50)">
      <rect x="22" y="12" width="44" height="74" rx="8" fill="#fbfaf6" stroke="#3a4266" stroke-width="4"/>
      <rect x="29" y="24" width="30" height="9" rx="2" fill="#fde2d6"/><rect x="29" y="38" width="30" height="5" rx="2" fill="#c9c4b4"/>
      <rect x="29" y="48" width="22" height="5" rx="2" fill="#c9c4b4"/><rect x="29" y="66" width="30" height="10" rx="3" fill="#c2410c"/>
      <circle cx="64" cy="56" r="15" fill="#ffc85733" stroke="#ffc857" stroke-width="5"/><line x1="75" y1="67" x2="86" y2="78" stroke="#ffc857" stroke-width="7" stroke-linecap="round"/></g></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", name), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
