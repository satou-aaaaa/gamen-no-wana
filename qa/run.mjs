// 画面のワナの検査。ワナの種類と画面の作り方（全部の形×正直/ワナ×300の種）・名前の札・今日の5画面と上級の組み方（3年分）・とことんの並び（500回）・
// 通しで遊ぶ（まちがい・ヒント・ワナは無い）・続きから・上級・とことん（並びを使い切っても続く・降りる）・あとから・カレンダー・実績・図鑑・Ko-fi・シェア・古いタブ・
// 記録の読み合わせ・スマホ幅・押せる大きさ・外へ通信しない・好きなだけ遊べる・PWA・引き継ぎ・見やすさ。
// 使い方: node qa/run.mjs   失敗があれば終了コード 1。結果は qa-report/report.md。
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { checkTransfer } from "./transfer-check.mjs";
import { checkSwStall } from "./sw-check.mjs";
import { checkDepth } from "./depth-check.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = pathToFileURL(path.join(root, "index.html")).href;
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });
const firstClose = async (q) => { if (await q.locator("#howto[open]").count()) await q.click("#howto-ok"); if (await q.locator("#core-coach").count()) { await q.evaluate(() => Core.coach.leave()); await q.waitForTimeout(100); } }; // はじめての練習の吹き出しをやめてホームへ（sync-template の migrateFirstQa が足した）
createRequire(import.meta.url)(path.join(root, "gen.js"));
const W = globalThis.WANA;
const html = readFileSync(path.join(root, "index.html"), "utf8"), gen = readFileSync(path.join(root, "gen.js"), "utf8");
const KEY = "gamen-no-wana-v1"; // gitleaks:allow 記録の名前（鍵ではない）

// 1. ワナの種類と画面（ブラウザを使わない）
{
  const CATS = ["行為の強制", "インターフェイス干渉", "執拗な繰り返し", "妨害", "こっそり", "社会的証明", "緊急性"];
  check("ワナの種類は18で、名前は重ならない", W.TYPES.length === 18 && new Set(W.TYPES.map((t) => t.name)).size === 18);
  check("どの種類も消費者庁の9つの仲間（カテゴリー）のどれかに入る", W.TYPES.every((t) => CATS.includes(t.cat)), W.TYPES.filter((t) => !CATS.includes(t.cat)).map((t) => t.id).join(","));
  const longT = W.TYPES.flatMap((t) => ["def", "tip", "look"].filter((k) => !t[k] || t[k].length > 40).map((k) => t.id + "." + k));
  check("どの種類にも説明・身を守るコツ・ヒントがあり、40字以内", longT.length === 0, longT.join(","));
  check("どの種類にも画面の形が4つずつある", W.TYPES.every((t) => (W.FORMS[t.id] || []).length === 4));
  { const nd = []; for (let t = 0; t < W.TYPES.length; t++) for (let v = 0; v < W.FORMN[t]; v++) for (let s = 0; s < 50; s++) { const it = { t, v, s: W.seedOf(`hd:${t}:${v}:${s}`), h: 0 }, a = W.make(it), b = W.make(Object.assign({}, it, { h: 1 })), tx = (p) => (p.on ? "☑" : "") + p.x + (p.s || ""); if (!b.parts.some((p) => !a.parts.map(tx).includes(tx(p)))) nd.push(W.TYPES[t].id + "/" + v); }
    check("どのワナの画面も、同じ種の「ワナの無い画面」と書き方がちがう（くらべて見せられる）", nd.length === 0, [...new Set(nd)].join(",")); }
  const bad = [], keys = new Set(), trapKeys = new Set();
  for (let t = 0; t < W.TYPES.length; t++) for (let v = 0; v < W.FORMN[t]; v++) for (const h of [0, 1]) for (let s = 0; s < 300; s++) {
    const it = { t, v, s: W.seedOf(`qa:${t}:${v}:${h}:${s}`), h }, sc = W.make(it), sc2 = W.make(it);
    const id = `${W.TYPES[t].id}/${v}/${h}`;
    if (W.keyOf(sc) !== W.keyOf(sc2)) bad.push(id + ":同じ種で別の画面");
    if (h ? sc.traps.length !== 0 : sc.traps.length < 1 || sc.traps.length > 2) bad.push(id + ":ワナの数");
    if (sc.parts.length < 3 || sc.parts.length > 6) bad.push(id + ":部品の数");
    if (!sc.scene || sc.scene.length > 45) bad.push(id + ":場面の文");
    for (const p of sc.parts) { const tx = p.x + (p.s || ""); if (!p.x || tx.length > 48 || /undefined|NaN|\$\{/.test(tx)) bad.push(id + ":部品 " + tx); }
    if (/undefined|NaN|\$\{/.test(sc.scene + sc.bar)) bad.push(id + ":場面に値が入っていない");
    keys.add(W.keyOf(sc)); if (!h) trapKeys.add(W.keyOf(sc));
  }
  check("全部の形×正直/ワナ×300の種で、画面がいつも同じに作れ、ワナはワナの画面にだけ1〜2つ、部品は3〜6・文は短い（48字・場面45字）", bad.length === 0, [...new Set(bad)].slice(0, 5).join(" / "));
  check("ちがう画面が300以上ある（好きなだけ遊んでも同じ画面が続かない。game-dev.md F6）", keys.size >= 300 && trapKeys.size >= 300, `全部 ${keys.size}・ワナあり ${trapKeys.size}`);
  const cb = [];
  for (let s = 0; s < 2000; s++) for (const n of [3, 4]) { const it = { t: s % 18, v: 0, s: W.seedOf("c" + s), h: 0 }, c = W.choices(it, n), c2 = W.choices(it, n); if (c.length !== n || new Set(c).size !== n || !c.includes(it.t) || c.join() !== c2.join() || c.some((x) => !(x >= 0 && x < 18))) cb.push(s); }
  check("名前の札：正しい名前を含み、重ならず、同じ画面ならいつも同じ（3枚・上級4枚、2000回）", cb.length === 0, cb.slice(0, 5).join(","));
  const pos = [0, 0, 0, 0]; for (let s = 0; s < 4000; s++) { const it = { t: s % 18, v: 0, s: W.seedOf("p" + s), h: 0 }; pos[W.choices(it, 4).indexOf(it.t)]++; }
  check("正しい名前の札の位置がかたよらない（4000回で各位置18〜32%）", pos.every((n) => n / 4000 > 0.18 && n / 4000 < 0.32), pos.join(","));
  const allText = gen;
  const REAL = ["Amazon", "アマゾン", "楽天", "メルカリ", "Yahoo", "ヤフー", "ZOZO", "ユニクロ", "ニトリ", "Netflix", "Spotify", "YouTube", "ドコモ", "ソフトバンク", "au ", "Apple", "Google"];
  check("店・アプリは架空（実在の会社名を使わない）", !REAL.some((w) => allText.includes(w)), REAL.filter((w) => allText.includes(w)).join(","));
  const FUNNY = ["（うそ）", "爆笑", "ツッコミ", "草生え", "ｗｗ"];
  check("お笑いの言葉を入れない（本物っぽさ優先）", !FUNNY.some((w) => (allText + html).includes(w)));
  check("gen.js は Math.random を使わない（同じ日はだれでも同じ画面）", !/Math\.random/.test(gen));
  check("index.html の Math.random はとことんの並び・回の名札だけ（4か所）", (html.match(/Math\.random/g) || []).length === 4, String((html.match(/Math\.random/g) || []).length));
  // 比較の関数の引数（(a, b)）を読み飛ばしてから、同じ文の中の乱数を探す（[^)]* だと最初の ) で止まり、ふつうの書き方を見逃した。2026-11-07 CodeRabbit）
  const sortRand = (html + gen).match(/\.sort\(\s*(?:function\s*)?\([^)]*\)\s*(?:=>)?[^;]{0,200}?(Math\.random|\bR\(\)|\brng\(|\br\(\))/g) || [];
  check("乱数を sort の比較の中で引かない", sortRand.length === 0, sortRand.slice(0, 3).join(" / "));
  check("sort の乱数の検査は、ふつうの書き方を見つける", [".sort(() => Math.random() - 0.5)", ".sort((a, b) => R() - .5)", ".sort(function (a, b) { return rng() - 0.5; })"].every((t) => /\.sort\(\s*(?:function\s*)?\([^)]*\)\s*(?:=>)?[^;]{0,200}?(Math\.random|\bR\(\)|\brng\(|\br\(\))/.test(t)));
  check("画面の文字に ${ が出る書き方をしていない（'…' の中の ${）", !/'[^'\n]*\$\{[^'\n]*'/.test(html.replace(/`[^`]*`/gs, "")));
}

// 2. PWA・好きなだけ遊べる・外へ通信しない（ファイルを読む）
{
  const sw = readFileSync(path.join(root, "sw.js"), "utf8"), man = JSON.parse(readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
  const shell = JSON.parse(sw.match(/const SHELL = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  check("sw.js の SHELL のファイルが全部ある（transfer.js・depth.js も入っている）", shell.every((f) => f === "./" || existsSync(path.join(root, f))) && shell.includes("./transfer.js") && shell.includes("./depth.js") && shell.includes("./gen.js"));
  check("sw.js は取り直して保存する（cache: reload。game-dev.md の PWA）", /cache: "reload"/.test(sw));
  { const st = await checkSwStall(sw); check("PWA：本文の途中で通信が止まっても4秒で保存したものを返す・ふつうはネットの返事", st.ok, JSON.stringify(st)); }
  check("manifest のアイコンが全部ある", man.icons.every((i) => existsSync(path.join(root, i.src))) && existsSync(path.join(root, "og.png")));
  check("チケット・回数制限・🔒で開くモードを入れない（game-dev.md F1・F2）", !/🎫|すると開く|チケット|スタミナ|ライフ/.test(html));
  check("CSP の connect-src は 'self' のまま", /connect-src 'self';/.test(html));
  check("見やすさの設定は shared-workflows template/a11y/a11y.html の写し（a11y:begin〜end）", /<!-- a11y:begin[\s\S]*<!-- a11y:end -->/.test(html));
  check("引き継ぎの部品を読む（data-keys は記録と復習の記録のキーだけ）", /<script src="transfer.js" data-game="gamen-no-wana" data-keys="gamen-no-wana-v1,gamen-no-wana-depth"><\/script>/.test(html)); // gitleaks:allow 記録の名前（鍵ではない）
  check("深さの部品 depth.js を transfer.js の次に読む（復習の記録は gamen-no-wana-depth）", /<script src="depth.js" data-game="gamen-no-wana" data-key="gamen-no-wana-depth"><\/script>/.test(html)); // gitleaks:allow 記録の名前（鍵ではない）
  { const e = await checkDepth(readFileSync(path.join(root, "depth.js"), "utf8")); check("depth.js（自信をかける・復習）の動き", e.length === 0, e.join(" / ")); }
}

// 3. ブラウザで遊ぶ
let browser = null;
const errors = [], outside = [];
const newPage = async (w = 390, h = 800, init) => {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await p.route(/^https?:/, (r) => { const u = r.request().url(); if (!/fonts\.(googleapis|gstatic)\.com/.test(u)) outside.push(u); r.abort(); });
  if (init) await p.addInitScript(init);
  await p.goto(url);
  return p;
};
const closeHow = (p) => p.evaluate(() => { const d = document.getElementById("howto"); if (d.open) document.getElementById("howto-ok").click(); if (window.Core && Core.coach && Core.coach.active()) Core.coach.leave(); });
const curOf = (p) => p.evaluate(() => { const c = window.__gw.cur(); return { h: c.sc.h, traps: c.sc.traps, t: c.sc.t, n: c.sc.parts.length, ph: c.ph, m: c.m, hints: c.hints, names: c.names, mode: c.mode, i: c.i }; });
async function answer(p) { const c = await curOf(p); if (c.h) await p.click("#nowana"); else { await p.click(`[data-j="${c.traps[0]}"]`); await p.click(`.names [data-t="${c.t}"]`); } return c; }
const setDate = (d) => `(() => { const real = Date.now; const off = Date.parse("${d}T03:00:00Z") - real(); Date.now = () => real() + off; })();`;
try {
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  { // 今日の5画面と上級の組み方（3年分）・とことんの並び
    const p = await newPage();
    const r = await p.evaluate(() => {
      const g = window.__gw, bad = [], N = 18; let honest = 0, d = Date.parse("2026-11-07");
      for (let i = 0; i < 1096; i++, d += 864e5) {
        const k = new Date(d).toISOString().slice(0, 10), a = g.dailyList(k), b = g.dailyList(k), h = g.hardList(k);
        if (JSON.stringify(a) !== JSON.stringify(b)) bad.push(k + ":同じ日で変わる");
        if (a.length !== 5 || new Set(a.map((x) => x.t)).size !== 5) bad.push(k + ":今日の5画面");
        if (h.length !== 3 || new Set(h.map((x) => x.t)).size !== 3 || h.some((x) => a.some((y) => y.t === x.t))) bad.push(k + ":上級");
        if (a.filter((x) => x.h).length > 1 || h.filter((x) => x.h).length > 1) bad.push(k + ":正直な画面が2つ以上");
        if (a.some((x) => x.h)) honest++;
        for (const x of [...a, ...h]) { const sc = g.scOf(x); if (!sc || (!x.h && !sc.traps.length)) bad.push(k + ":画面"); }
      }
      const eb = []; let first = 0;
      for (let n = 0; n < 500; n++) {
        const last = n % N, L = g.endlessList(last), ids = L.map((x) => x.t + ":" + x.v);
        if (new Set(ids).size !== ids.length || ids.length !== window.WANA.FORMN.reduce((a, b) => a + b, 0)) eb.push("重なり");
        for (let i = 1; i < L.length; i++) if (L[i].t === L[i - 1].t) eb.push("続けて同じ種類");
        if (L[0].t === last) first++;
      }
      return { bad: bad.slice(0, 5), honest, eb: [...new Set(eb)], first };
    });
    check("今日の5画面・上級の3画面（3年分）：同じ日はいつも同じ・種類は重ならない・上級は今日と別の種類・正直な画面は1つまで", r.bad.length === 0, r.bad.join(" / "));
    check("正直な画面（ワナが無い）が出る日は3〜5割", r.honest / 1096 > 0.3 && r.honest / 1096 < 0.5, String(r.honest));
    check("とことんの並び（500回）：1つの並びの中で同じ種類×形は出ず、続けて同じ種類も出さず、前の並びの最後の種類から始めない", r.eb.length === 0 && r.first === 0, r.eb.join(",") + " 始め:" + r.first);
    await p.close();
  }
  { // 通しで遊ぶ：今日の5画面
    const p = await newPage(390, 800, setDate("2026-11-10"));
    check("はじめて開くと、遊び方の窓でなく吹き出しが出る", await p.evaluate(() => !document.getElementById("howto").open && !!document.querySelector("#core-coach:not([hidden])")));
    await closeHow(p);
    check("はじめての人も、今日・とことん・上級・図鑑・実績・カレンダーを全部押せる（鍵なし）", await p.evaluate(() => ["go-d", "go-e", "go-h", "go-dex", "go-ach", "go-cal"].every((id) => { const b = document.getElementById(id); return b && !b.disabled; })));
    await p.click("#go-d");
    let c = await curOf(p);
    check("場面の文と、押せる部品のスマホ画面が出る", (await p.locator(".scene").count()) === 1 && (await p.locator(".phone .pt").count()) === c.n);
    // 1画面目：まちがい1回・ヒント2回
    const wrong = [...Array(c.n).keys()].find((j) => !c.traps.includes(j));
    await p.click(`[data-j="${wrong}"]`); await p.waitForTimeout(100);
    check("ワナでない所を押すと ✕ と破線になり、知らせが出る（色だけにしない）", await p.evaluate((j) => { const b = document.querySelector(`[data-j="${j}"]`); return b.classList.contains("bad") && getComputedStyle(b, "::before").content.includes("✕") && getComputedStyle(b).borderStyle === "dashed"; }, wrong) && /✕/.test(await p.textContent("#live")));
    await p.click("#hint");
    check("ヒント1回目は「見るところ」だけ（答えの名前を言わない）", (await p.locator(".tipbox").count()) === 1 && !(await p.textContent(".tipbox")).includes((await p.evaluate((t) => window.WANA.TYPES[t].name, c.t))));
    await p.click("#hint");
    c = await curOf(p);
    const left = await p.evaluate(() => document.querySelectorAll(".phone .pt:not(.out):not(.bad)").length);
    check("ヒント2回目はワナでない所を外し、残りを少なくする", c.hints === 2 && left <= 2 && (await p.locator("#hint").isDisabled()));
    if (c.h) { await p.click("#nowana"); }
    else {
      await p.click(`[data-j="${c.traps[0]}"]`);
      check("ワナを押すと ✓ が付き、名前の札が3枚出る", (await p.locator(".names button").count()) === 3 && await p.evaluate((j) => document.querySelector(`[data-j="${j}"]`).classList.contains("hit"), c.traps[0]));
      await p.reload(); await closeHow(p); await p.click("#go-d");
      check("名前を選ぶ途中で開き直しても、ワナの部品に ✓ が残り、名前の札が出る", (await p.locator(".names button").count()) === 3 && await p.evaluate((j) => document.querySelector(`[data-j="${j}"]`).classList.contains("hit"), c.traps[0]));
      const wn = c.names.find((t) => t !== c.t); await p.click(`.names [data-t="${wn}"]`);
      check("まちがえた札は ✕ と破線で残り、押せなくなる", await p.evaluate((t) => { const b = document.querySelector(`.names [data-t="${t}"]`); return b.disabled && b.classList.contains("bad"); }, wn));
      await p.click(`.names [data-t="${c.t}"]`);
    }
    check("見抜くと、名前・どんなワナ・身を守るコツ（ワナの無い画面は説明）が出る", (await p.locator("#verdict").count()) === 1 && (c.h || ((await p.textContent("#verdict")).includes("身を守るコツ"))));
    if (!c.h) check("見抜いたあと「ワナの無い画面なら」に、正直な書き方を出す（くらべて覚える）", (await p.locator("#verdict .honest span").count()) >= 1);
    await p.click("#next");
    // 2画面目：「ワナは無い」をまちがえる（ワナがあるときだけ）、そのあと答える。2画面目を終えたら読み直して続きから
    c = await curOf(p);
    if (!c.h) { await p.click("#nowana"); check("ワナがある画面で「ワナは無い」を押すと ✕ になり、まちがいに数える", (await curOf(p)).m === 1 && await p.locator("#nowana").isDisabled()); }
    await answer(p); await p.click("#next");
    c = await curOf(p);
    if (!c.h) { const w2 = [...Array(c.n).keys()].find((j) => !c.traps.includes(j)); await p.click(`[data-j="${w2}"]`); }
    await p.reload(); await closeHow(p);
    check("途中で閉じても、ホームに「続きから（3画面目）」が出る", (await p.textContent("#go-d")).includes("3画面目"));
    await p.click("#go-d");
    const c3 = await curOf(p);
    check("続きからは同じ画面・押したまちがいのまま", c3.i === 2 && c3.m === (c.h ? 0 : 1) && (c.h || (await p.locator(".pt.bad").count()) === 1));
    for (let i = 2; i < 5; i++) { await answer(p); await p.click("#next"); }
    const s = await p.evaluate(() => window.__gw.load());
    const rec = s.days["2026-11-10"];
    check("5画面を終えると今日の記録が残り、★はまちがい＋ヒントで決まる（1画面目は★1）", rec && rec.r.length === 5 && rec.r[0].m + rec.r[0].h >= 2 && (await p.locator(".res > div").count()) === 5);
    const share = await p.textContent("#share");
    check("シェアの文に答え（ワナの名前）を出さない", !/[ぁ-んァ-ヶ一-龠]{3,}/.test(share.replace("画面のワナ", "").replace("上級", "")) && /#4/.test(share), share);
    check("結果の画面に「続けて遊ぶ：とことん」の大きなボタン", (await p.locator("#go-e.main").count()) === 1);
    check("まちがい・ヒントがあった日は Ko-fi の1行を出さない", (await p.locator('.note a[href*="ko-fi"]').count()) === 0);
    check("図鑑に見抜いたワナが載る", (s.total === 5) && Object.keys(s.dex).length + s.hon >= 4);
    await p.click("#home");
    check("ホームの Ko-fi は下の1行（フッター）だけ", (await p.locator('a[href*="ko-fi"]').count()) === 1 && (await p.locator('footer a[href*="ko-fi"]').count()) === 1);
    check("終えた日はホームに今日の結果（四角）が出る", (await p.textContent(".share")).includes("今日の結果"));
    // 上級
    await p.click("#go-h");
    check("上級はヒントのボタンが無く、札は4枚", (await p.locator("#hint").count()) === 0);
    for (let i = 0; i < 3; i++) { const cc = await curOf(p); if (!cc.h) { await p.click(`[data-j="${cc.traps[0]}"]`); if (i === 0) check("上級の札は4枚", (await p.locator(".names button").count()) === 4); await p.click(`.names [data-t="${cc.t}"]`); } else await p.click("#nowana"); await p.click("#next"); }
    const s2 = await p.evaluate(() => window.__gw.load());
    check("上級を全部★3で終えると記録が残り、Ko-fi の1行が結果の画面に出る（初めてのときだけ）", s2.hdays["2026-11-10"] && (await p.locator('.note a[href*="ko-fi"]').count()) === 1);
    check("上級の結果に新しい実績（🏅）が出る", (await p.locator(".newach").count()) === 1);
    await p.click("#home"); await p.click("#go-h");
    check("もう一度開いても Ko-fi の1行は出さない", (await p.locator('.note a[href*="ko-fi"]').count()) === 0);
    await p.close();
  }
  { // とことん：並びを使い切っても続く・まちがえても続く・降りると結果
    const p = await newPage(390, 800, setDate("2026-11-10"));
    await closeHow(p); await p.click("#go-e");
    const seen = [];
    for (let i = 0; i < 40; i++) {
      const c = await curOf(p); seen.push(c.t);
      if (i === 1 && !c.h) { const w = [...Array(c.n).keys()].find((j) => !c.traps.includes(j)); await p.click(`[data-j="${w}"]`); }
      await answer(p); await p.click("#next");
    }
    const r = await p.evaluate(() => window.__gw.load().runs.e);
    check("とことんは並び（36画面）を使い切っても次の並びを足して続き、まちがえても終わらない", r && r.res.length === 40 && r.list.length >= 72);
    check("とことんで続けて同じ種類が出ない（つなぎ目も）", seen.every((t, i) => i === 0 || t !== seen[i - 1]));
    await p.reload(); await closeHow(p);
    check("とことんは閉じても続きから", (await p.textContent("#go-e")).includes("続きから（40画面）"));
    await p.click("#go-e"); await p.click("#quit");
    const s = await p.evaluate(() => window.__gw.load());
    check("「ここで降りる」で結果が出て、一度で見抜いた数が自己ベストに残る", (await p.textContent("body")).includes("40画面を見きわめた") && s.ebest === r.res.filter((x) => !x.m && !x.h).length && s.ebest >= 39 && !s.runs.e);
    check("とことんは今日の記録・連続には数えない", Object.keys(s.days).length === 0);
    await p.close();
  }
  { // あとから・カレンダー・実績
    const p = await newPage(390, 800, setDate("2026-11-12"));
    await p.evaluate((K) => { localStorage.setItem(K, JSON.stringify({ v: 1, tut: true, days: { "2026-11-07": { r: [{ m: 0, h: 0, t: 1, hon: 0 }] }, "2026-11-11": { r: [{ m: 0, h: 0, t: 2, hon: 0 }] } }, hdays: {}, adays: {}, dex: { 1: 1, 2: 1 }, hon: 0, total: 2, ebest: 0, runs: {}, kofi: {}, ach: {}, t: 1 })); }, KEY);
    await p.reload();
    check("ホームに「あとから遊べる日」の数が出る（11/8〜11/10の3日）", (await p.textContent("#go-cal")).includes("あとから遊べる日 3"));
    check("連続の日は1以上のときだけ出す（1日続けて）", (await p.textContent("body")).includes("1日続けて"));
    await p.click("#go-cal");
    check("カレンダー：遊んだ日は★、あとから遊べる日は▶のボタン（点線）、EPOCH より前の月へは戻れない", (await p.locator("[data-late]").count()) === 3 && (await p.locator(".cal .d i", { hasText: "★" }).count()) === 2 && (await p.locator("#pm").isDisabled()));
    await p.click('[data-late="2026-11-09"]');
    const want = await p.evaluate(() => JSON.stringify(window.__gw.dailyList("2026-11-09")));
    check("あとからは、その日の今日の5画面と同じ画面", (await p.evaluate(() => JSON.stringify(window.__gw.load().runs["a:2026-11-09"].list))) === want);
    for (let i = 0; i < 5; i++) { await answer(p); await p.click("#next"); }
    const s = await p.evaluate(() => window.__gw.load());
    check("あとから遊んだ日は adays に入り、今日の記録（days）・シェア・Ko-fi には入らない", s.adays["2026-11-09"] && !s.days["2026-11-09"] && (await p.locator("#share").count()) === 0 && (await p.locator('.note a[href*="ko-fi"]').count()) === 0);
    await p.click("#home"); await p.click("#go-cal");
    check("あとから遊んだ日は ↺ になり、もう ▶ にならない", (await p.locator("[data-late]").count()) === 2 && (await p.locator(".cal .d i", { hasText: "↺" }).count()) === 1);
    await p.click("#back"); await p.click("#go-ach");
    const n = await p.locator(".achs > div").count();
    check("実績は10〜15個で、まだのものは「いま/目標」を出す", n >= 10 && n <= 15 && (await p.textContent(".achs")).includes("いま "));
    await p.click("#back"); await p.click("#go-dex");
    check("ワナ図鑑：まだの種類は名前を出さず「？？？」", (await p.locator(".dex .no").count()) > 0 && (await p.textContent(".dex .no")).includes("？？？"));
    await p.close();
  }
  { // 古いタブ・記録の読み合わせ
    const p = await newPage(390, 800, setDate("2026-11-10"));
    await closeHow(p); await p.click("#go-d");
    await p.evaluate((K) => { const s = JSON.parse(localStorage.getItem(K)); s.runs.d.id = "other-tab"; s.runs.d.res = [{ m: 0, h: 0, t: 0, hon: 0 }]; localStorage.setItem(K, JSON.stringify(s)); }, KEY);
    { const c = await curOf(p); if (c.h) await p.click("#nowana"); else await p.click(`[data-j="${c.traps[0]}"]`); await p.waitForTimeout(100); }
    const s = await p.evaluate(() => window.__gw.load());
    check("別のタブで回が変わっていたら、古いタブの答えで書き込まない（二重に数えない）", s.runs.d.id === "other-tab" && s.runs.d.res.length === 1 && s.total === 0);
    const m = await p.evaluate(() => { const g = window.__gw, f = g.fresh(); const a = Object.assign(f, { t: 5, days: { "2026-11-01": { r: [] } }, dex: { 3: 4 }, total: 9 }); const b = Object.assign(g.fresh(), { t: 9, days: { "2026-11-02": { r: [] } }, dex: { 3: 1, 5: 2 }, total: 3, ebest: 4 }); return g.merge(a, b); });
    check("2つの記録を合わせると、日ごとの記録は両方・図鑑と数は多いほうを残す", m.days["2026-11-01"] && m.days["2026-11-02"] && m.dex[3] === 4 && m.dex[5] === 2 && m.total === 9 && m.ebest === 4);
    const m2 = await p.evaluate(() => { const g = window.__gw, base = { mode: "d", date: "2026-11-10", id: "x", list: [1, 2, 3, 4, 5] }; const a = Object.assign(g.fresh(), { t: 9, runs: { d: Object.assign({}, base, { res: [] }) } }), b = Object.assign(g.fresh(), { t: 5, runs: { d: Object.assign({}, base, { res: [{ m: 0, h: 0 }, { m: 1, h: 0 }] }) } }); return g.merge(a, b).runs.d.res.length; });
    check("同じ回の途中経過は、新しく保存したほうでなく進んだほうを残す", m2 === 2);
    const m3 = await p.evaluate(() => { const g = window.__gw, base = { mode: "d", id: "x", list: [1, 2, 3, 4, 5], res: [1, 2, 3, 4, 5].map(() => ({ m: 0, h: 0, t: 0, hon: 0 })) }; const a = Object.assign(g.fresh(), { t: 9, runs: { d: Object.assign({}, base, { date: "2026-11-11", res: [] }) } }), b = Object.assign(g.fresh(), { t: 5, runs: { d: Object.assign({}, base, { date: "2026-11-10" }) } }); const r = g.merge(a, b); return !!r.days["2026-11-10"] && r.runs.d.date === "2026-11-11"; });
    check("結果を見る前に別のタブが次の日を始めても、終えた日の記録を残す", m3);
    await p.evaluate((K) => localStorage.setItem(K, JSON.stringify({ v: 1, tut: true, days: "x", dex: { 0: "a" }, total: "zz", runs: [] })), KEY);
    await p.reload();
    check("壊れた記録（形のちがう値）でも画面が出る", (await p.locator("#go-d").count()) === 1);
    await p.close();
  }
  // 1問を深くする（shared-workflows routines/game-dev.md「1問を深くする」）：自信をかける・復習。2つ目の判断は、もとからある「このワナの名前は？」なので2段目は足さない
  {
    const DK = "gamen-no-wana-depth"; // gitleaks:allow 記録の名前（鍵ではない）
    const q = await newPage(390, 800, setDate("2026-11-10")); await closeHow(q);
    const items = [{ t: 0, v: 0, s: 11, h: 0 }, { t: 1, v: 1, s: 12, h: 0 }, { t: 2, v: 0, s: 13, h: 1 }];
    const tags = await q.evaluate((L) => L.map((it) => window.__gw.tagOf(it)), items);
    check("復習の鍵は「種類|形|種|正直か」で、鍵だけで同じ画面を作り直せる・形の合わない鍵は作らない", await q.evaluate(([T, L]) => { const g = window.__gw; return T.every((t, i) => JSON.stringify(g.itOf(t)) === JSON.stringify(L[i])) && ["nai|0|1|0", "timer|99|1|0", "timer|0|x|0", "timer|0|1|2", "timer|0|1", "constructor", "timer|0|1|0|9"].every((t) => !g.itOf(t)); }, [tags, items]));
    await q.evaluate(([K, L]) => { const s = window.__gw.load(); s.runs.e = { mode: "e", date: "2026-11-10", list: L, res: [], cur: null, id: "dp" }; localStorage.setItem(K, JSON.stringify(s)); }, [KEY, items]);
    await q.click("#go-e");
    const sb = await q.$eval("#dp-sure", (b) => [Math.round(b.getBoundingClientRect().height), b.getAttribute("aria-pressed")]);
    check("自信のボタン：高さ44px以上・はじめは押していない", sb[0] >= 44 && sb[1] === "false", sb.join(","));
    await q.click("#dp-sure");
    check("自信のボタンを押すと ✓ が出る（色だけで分けない）", (await q.getAttribute("#dp-sure", "aria-pressed")) === "true" && (await q.textContent("#dp-sure")).includes("✓"));
    { const c = await curOf(q); const wrong = [...Array(c.n).keys()].find((j) => !c.traps.includes(j)); await q.click(`[data-j="${wrong}"]`); }
    check("自信ありでまちがえると、ボタンは押せなくなる（1画面に1回）", await q.$eval("#dp-sure", (b) => b.disabled));
    check("まちがえたその時に復習へ入る（見きわめずにやめても残る）", await q.evaluate(([K, t]) => { const d = JSON.parse(localStorage.getItem(K) || "{}"); return !!(d.rv && d.rv[t]); }, [DK, tags[0]]));
    await answer(q);
    check("自信ありでまちがえた画面は、見きわめたあと「自信ありでまちがえた」と出る", (await q.textContent(".verdict")).includes("自信ありでまちがえた"));
    await q.click("#next");
    await q.click("#dp-sure"); await q.click("#hint");
    check("ヒントで描き直しても、押した「たしか」は消えない", (await q.getAttribute("#dp-sure", "aria-pressed")) === "true");
    { const c = await curOf(q); await q.click(`[data-j="${c.traps[0]}"]`);
      check("ワナを当てて名前を選ぶ段になったら、自信のボタンは隠れる（名前は2つ目の判断）", await q.locator("#surerow:not([hidden])").count() === 0);
      await q.click(`.names [data-t="${c.t}"]`); }
    check("自信ありで当てると「自信ありで当てた」と出る", (await q.textContent(".verdict")).includes("自信ありで当てた"));
    await q.click("#next"); await answer(q);
    const dp = await q.evaluate((K) => JSON.parse(localStorage.getItem(K) || "{}"), DK);
    check("まちがい・ヒントのあった画面だけ復習に入る（★3は入らない）", Object.keys(dp.rv || {}).sort().join() === [tags[0], tags[1]].sort().join(), Object.keys(dp.rv || {}).join(","));
    const n = await q.evaluate(() => { const g = window.__gw; g.sureCount(true); g.sureCount(true); return g.load().runs.e.ds; });
    check("「自信あり」の数は1画面につき1回だけ（2つのタブで同じ画面を当てても2回足さない）", n && n.n === 2 && n.ok === 1, JSON.stringify(n));
    await q.click("#quit");
    await q.evaluate(([K, t]) => { const d = JSON.parse(localStorage.getItem(K)); d.rv = { [t]: Object.assign(d.rv[t], { due: "2026-01-01" }) }; localStorage.setItem(K, JSON.stringify(d)); }, [DK, tags[0]]);
    await q.goto(url); await q.waitForTimeout(150);
    check("日の来た復習があると、ホームに「復習 1画面」", (await q.textContent("#go-r")).includes("復習 1画面"));
    const before = await q.evaluate(() => window.__gw.load());
    await q.click("#go-r");
    check("復習の画面は「復習」と出る・同じ画面", (await q.textContent("header")).includes("復習") && await q.evaluate(() => { const c = window.__gw.cur(); return window.__gw.tagOf(c.it); }) === tags[0]);
    await q.click("#dp-sure"); await answer(q); await q.click("#next"); await q.waitForTimeout(150);
    const after = await q.evaluate(() => window.__gw.load()), dp2 = await q.evaluate((K) => JSON.parse(localStorage.getItem(K)), DK);
    check("復習を終えると結果は「復習の結果」・自信ありの当たり 1/1", (await q.textContent("h1")).includes("復習の結果") && (await q.textContent("#surestat")).includes("1/1"));
    check("復習は今日の記録・あとから・連続に入らず、シェアと Ko-fi は出ない", JSON.stringify(after.days) === JSON.stringify(before.days) && JSON.stringify(after.hdays) === JSON.stringify(before.hdays) && JSON.stringify(after.adays) === JSON.stringify(before.adays) && JSON.stringify(after.kofi) === JSON.stringify(before.kofi) && await q.locator("#share").count() === 0 && await q.locator('#app p.note a[href*="ko-fi"]').count() === 0); // フッターの応援リンクは別（いつも出る）
    check("復習で★3になると、次は3日後へ進む", Object.values(dp2.rv).every((x) => x.s === 1 && x.due > "2026-11-10"), JSON.stringify(dp2.rv));
    await q.goto(url); await q.waitForTimeout(150);
    check("復習を終えたら、ホームの「復習」は消える", await q.locator("#go-r").count() === 0);
    await q.evaluate((K) => { const d = JSON.parse(localStorage.getItem(K)); d.rv["nai|0|1|0"] = { s: 0, due: "2026-01-01", t: 1 }; d.rv["constructor"] = { s: 0, due: "2026-01-01", t: 2 }; localStorage.setItem(K, JSON.stringify(d)); }, DK);
    await q.goto(url); await q.waitForTimeout(150);
    check("作り直せない鍵（無い種類・constructor）は復習に数えず、ホームも出る", await q.locator("#go-d").count() === 1 && await q.locator("#go-r").count() === 0);
    // 復習の途中で閉じて、日が替わっても、ホームの「復習の続きから」で戻れる（まちがいの数もそのまま）
    await q.evaluate(([K, t]) => { const d = JSON.parse(localStorage.getItem(K)); d.rv = { [t]: { s: 0, due: "2026-01-01", t: 3 } }; localStorage.setItem(K, JSON.stringify(d)); }, [DK, tags[0]]);
    await q.goto(url); await q.waitForTimeout(150); await q.click("#go-r");
    { const c = await curOf(q); const wrong = [...Array(c.n).keys()].find((j) => !c.traps.includes(j)); await q.click(`[data-j="${wrong}"]`); }
    await q.evaluate((K) => { const s = JSON.parse(localStorage.getItem(K)); s.runs.r.date = "2026-11-01"; localStorage.setItem(K, JSON.stringify(s)); }, KEY);
    await q.goto(url); await q.waitForTimeout(150);
    check("復習の途中で閉じて日が替わっても、ホームの「復習の続きから」で戻れる", ((await q.locator("#go-r").count()) ? await q.textContent("#go-r") : "").includes("続きから"));
    if (await q.locator("#go-r").count()) { await q.click("#go-r"); const c = await curOf(q); check("復習の続きは同じ画面・まちがいの数もそのまま", c.m === 1 && c.mode === "r"); }
    { const a = await q.evaluate((K) => { const d = JSON.parse(localStorage.getItem(K)); d.sure = 12; d.sureOk = 10; d.learned = 5; localStorage.setItem(K, JSON.stringify(d)); return window.__gw.achList(window.__gw.load()).filter((x) => x.done).map((x) => x.name); }, DK);
      check("実績「たしかの目」（自信ありで10回当てる）・「覚えなおし」（復習で5画面覚えた）が取れる", a.includes("たしかの目") && a.includes("覚えなおし"), a.join(",")); }
    await q.close();
  }

  { // スマホ幅・押せる大きさ
    const p = await newPage(320, 640, setDate("2026-11-10"));
    await closeHow(p);
    const wide = async (name) => { const r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, small: [...document.querySelectorAll("button, a")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && Math.round(r.height) < 44 && !b.closest(".a11y-dlg") && !b.closest("dialog:not([open])"); }).map((b) => b.textContent.trim().slice(0, 12)) })); check(`幅320px・${name}：横にはみ出さず、押せる所は高さ44px以上`, r.sw <= 320 && r.small.length === 0, `${r.sw} ${r.small.join(",")}`); };
    await wide("ホーム");
    await p.click("#go-d"); await wide("遊ぶ画面");
    const c = await curOf(p); if (!c.h) { await p.click(`[data-j="${c.traps[0]}"]`); await wide("名前を選ぶ画面"); }
    await p.goto(url); await closeHow(p); await p.click("#go-cal"); await wide("カレンダー");
    await p.close();
  }
  { // 引き継ぎコード（shared-workflows template/qa/transfer-check.mjs）
    const sample = { [KEY]: JSON.stringify({ v: 1, tut: true, days: { "2026-11-07": { r: [{ m: 0, h: 0, t: 3, hon: 0 }] } }, hdays: {}, adays: {}, dex: { 3: 1 }, hon: 0, total: 1, ebest: 2, runs: {}, kofi: {}, ach: {}, t: 1 }), "gamen-no-wana-depth": JSON.stringify({ v: 1, rv: { "timer|0|1|0": { s: 1, due: "2026-11-20", t: 5 } } }) }; // gitleaks:allow 記録の名前（鍵ではない）。復習の記録も引き継ぐかを見る
    await checkTransfer({ browser, url, game: "gamen-no-wana", sample, check, open: async (page) => { await page.evaluate(() => { const d = document.getElementById("howto"); if (d.open) d.close(); if (window.Core && Core.coach && Core.coach.active()) Core.coach.leave(); }); } });
  }
} catch (e) {
  check("QA の操作が最後まで完了する", false, e.message.split("\n")[0]);
} finally {
  try { // 保存できないとき：帯 #savewarn で知らせ、2秒たっても残し、保存できるようになったら消す（黙っていると開き直したとき記録が消える。shared-workflows incidents/2026-11-07-save-failure-silent.md）
    const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await c.addInitScript(() => { window.__origSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new Error("QuotaExceededError"); }; });
    const q = await c.newPage(); await q.goto(url); await q.waitForTimeout(300);
    if (!(await q.locator("#howto[open]").count())) await firstClose(q).then(() => q.click("#f-how"));
    await firstClose(q); await q.waitForTimeout(100);
    const n1 = await q.locator("#savewarn").count(); await q.waitForTimeout(2000); const n2 = await q.locator("#savewarn").count();
    await q.evaluate(() => { Storage.prototype.setItem = window.__origSetItem; });
    await firstClose(q).then(() => q.click("#f-how")); await firstClose(q); await q.waitForTimeout(100);
    const n3 = await q.locator("#savewarn").count();
    check("保存できないときは帯（#savewarn）を1つ出し、2秒たっても残る。保存できるようになると消える", n1 === 1 && n2 === 1 && n3 === 0, [n1, n2, n3].join(","));
    await c.close();
  } catch (e) { check("保存できないときは帯（#savewarn）を1つ出し、2秒たっても残る。保存できるようになると消える", false, e.message.split("\n")[0]); }
  try { // 知らせ（.toast）が出ているあいだも、その下のボタンを押せる（pointer-events:none。2026-11-17 全ゲームの点検）
    const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const q = await c.newPage(); await q.goto(url); await q.waitForTimeout(300);
    await q.evaluate(() => { const d = document.getElementById("howto"); if (d && d.open) d.close(); toast("知らせの検査"); });
    const t = await q.evaluate(() => { const e = document.querySelector(".toast"); if (!e) return "知らせが出ない"; const r = e.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return [getComputedStyle(e).pointerEvents, hit && (hit === e || e.contains(hit)) ? "知らせが受ける" : "下が受ける"].join(","); });
    check("知らせ（.toast）が出ているあいだも、その下を押せる（pointer-events が none）", t === "none,下が受ける", t);
    await c.close();
  } catch (e) { check("知らせ（.toast）が出ているあいだも、その下を押せる（pointer-events が none）", false, e.message.split("\n")[0]); }
  if (browser) await browser.close();
}
check("画面のエラーが無い", errors.length === 0, errors.slice(0, 3).join(" | "));
check("外へ通信しない（Google Fonts の文字だけ）", outside.length === 0, outside.slice(0, 3).join(" "));
{ // 見やすさ・読みやすさ・偏り（shared-workflows template/qa/a11y.mjs の写し。routines/game-dev.md「だれでも遊べるように」）
  const a = spawnSync(process.execPath, [path.join(root, "qa", "a11y.mjs")], { encoding: "utf8", env: process.env });
  check("見やすさ・読みやすさの検査（qa/a11y.mjs。中身は qa-report/a11y.md）", a.status === 0, (a.stdout.match(/^- ❌.*$/gm) || []).join(" / ") || (a.status ? a.stderr.slice(-300) : ""));
}

const ng = results.filter((r) => !r.ok);
const md = `# 画面のワナ QA\n\n${results.map((r) => `- ${r.ok ? "✅" : "❌"} ${r.name}${r.detail ? `（${r.detail}）` : ""}`).join("\n")}\n\n${ng.length ? `❌ ${ng.length}件` : `✅ ${results.length}項目すべて通過`}\n`;
mkdirSync(path.join(root, "qa-report"), { recursive: true });
writeFileSync(path.join(root, "qa-report/report.md"), md);
console.log(md);
process.exit(ng.length ? 1 : 0);
