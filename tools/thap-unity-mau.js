// UNITY B5 (12/11): "ĐỀ THI MẪU" cho lõi luật C# — chạy trận bot THẬT của web (như tools/thap-bot-tran.js, không vẽ), mỗi khi sang wave mới
// chụp TRẠNG THÁI LUẬT dạng chuỗi chuẩn + băm FNV-1a 32 bit. Lõi C# chạy cùng bộ bài + hạt phải ra đúng chuỗi đó từng wave; lệch ở wave nào = lỗi dịch ở đó.
//
// Chuỗi chuẩn mỗi wave (lõi C# phải dựng y hệt):
//   w<wave>|t<G.t làm tròn 0,001>|q<số quái sống>:<tổng máu làm tròn>|b<i>:<tim>:<mana làm tròn>:<giá triệu hồi>:<power-up theo deck, vd 01200>:<ụ "ô.id.sao" theo ô, cách nhau ','>|…
// Math.random (chỉ còn dùng cho hạt lửa/khói/âm thanh — luật dùng rngLuat/rngHat có hạt) chạy theo luồng riêng --rnd (mặc định 0).
//   KIỂM ĐỘC LẬP: chạy 2 lần cùng hạt, khác --rnd → mọi chuỗi phải trùng. Không trùng = luật còn dính Math.random → phải sửa trước khi dùng làm mẫu.
//
// Chạy (gốc repo web): python -m http.server 8765 --bind 127.0.0.1   rồi
//   node tools/thap-unity-mau.js --kiem 1                       (kiểm độc lập: 2 bộ × 2 luồng rnd)
//   node tools/thap-unity-mau.js --song 4 --max 60 --hat 1,2,3  (cả lô: mọi ụ có mặt ít nhất 1 lần) → <Unity>/Assets/Tests/Data/mau-tran.json
// Cần playwright (PW=<đường dẫn>) và Chrome (CHROME=<exe>).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium } = require(process.env.PW || 'playwright');
const A = {}; { const v = process.argv.slice(2); for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) A[v[i].slice(2)] = v[i + 1] && !v[i + 1].startsWith('--') ? v[++i] : '1'; }
const GOC = path.resolve(__dirname, '..');
const BASE = process.env.BASE || 'http://127.0.0.1:8765/thap/';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const RA = path.resolve(A.ra || 'D:/Unity/AstralArsenalUnity/Assets/Tests/Data/mau-tran.json');

function trongTrang(c) {
  const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0'); };
  const S = window.__S = { buoc: 0, loi: '', mau: [], wv: -1, c };
  if (c.max) LUAT.waveMax = c.max;
  G.debug.auto = true; G.debug.seed = 1000 + c.hat; G.tocDo = 1;
  if (c.deck2) G.debug.deck2 = c.deck2;
  if (c.cap) { G.debug.cap0 = {}; for (const id of c.deck) G.debug.cap0[id] = c.cap; } // cấp thẻ trên cấp đầu (bot sống lâu hơn → mẫu phủ nhiều wave)
  REN.ve = () => { }; UI.capNhat = () => { }; try { for (const k in SND) if (typeof SND[k] === 'function') SND[k] = () => { }; } catch (e) { }
  S.chup = () => {
    let n = 0, hp = 0; for (const E of G.quai) if (!E.chet) { n++; hp += E.hp; }
    const ban = G.ban.map((B, i) => 'b' + i + ':' + B.tim + ':' + Math.round(B.mana) + ':' + B.gia + ':' + B.deck.map(id => (B.lv[id] | 0) - 1).join('') + ':'
      + B.t.map((T, o) => T ? o + '.' + T.id + '.' + T.sao : '').filter(Boolean).join(','));
    const s = 'w' + G.wave + '|t' + G.t.toFixed(3) + '|q' + n + ':' + Math.round(hp) + '|' + ban.join('|');
    S.mau.push({ w: G.wave, s, h: fnv(s) });
  };
  // 2 LUỒNG: Math.random gọi từ chỗ LUẬT (thành phần wave khi chơi đơn, giờ ra quái, hồi chiêu đầu / góc ụ mới, AI dùng chỉ huy…) → luồng LUẬT
  //   (hạt theo trận, lõi C# phải bốc đúng các điểm này theo đúng thứ tự); gọi từ chỗ HÌNH/ÂM → luồng HÌNH (hạt + --rnd, không ảnh hưởng luật).
  //   Phân loại theo khung gọi đầu tiên (bỏ qua rnd/rint/pick ở game.js:23–25): file hình, hoặc dòng nguồn có FX./SND./… = HÌNH (c.dongHinh từ Node).
  const ruleR = mb(777 + c.hat * 104729), hinhR = mb(99 + c.hat * 31337 + (c.rnd | 0) * 7777777), HINH_F = new RegExp(c.fileHinh), dongHinh = new Set(c.dongHinh), diem = S.diem = {};
  Error.stackTraceLimit = 14;
  S.gr = function () {
    const st = new Error().stack.split('\n'); let k = null, hinh = false;
    for (let i = 2; i < st.length; i++) {
      const m = st[i].match(/js\/([\w\-\/]+\.js)[^:]*:(\d+)/); if (!m) continue;
      const f = m[1], l = m[2];
      if (f === 'ghepfx.js' && l === '448') { hinh = true; break; } // dựng ụ tạm để nạp sẵn hình
      if (!k) { if (f === 'game.js' && (l === '23' || l === '24' || l === '25')) continue; k = f + ':' + l; hinh = HINH_F.test(f) || dongHinh.has(k); }
    }
    if (hinh) return hinhR();
    diem[k] = (diem[k] || 0) + 1; const v = ruleR();
    if (S.vet && c.vetTu != null && G.t >= c.vetTu && G.t <= c.vetDen) S.vet.push(G.t.toFixed(3) + ' R ' + k + ' ' + v.toFixed(6));
    return v;
  };
  if (c.vet) { // --vet 1: ghi VẾT sự kiện luật (so từng bước với lõi C#) — bọc ngoài cùng
    S.vet = []; const bv = (ten) => { const f = window[ten]; window[ten] = function (B) { const m0 = B && B.mana, g0 = B && B.gia; const r = f.apply(this, arguments);
      if (r) S.vet.push(G.t.toFixed(3) + ' ' + ten + ' ' + Math.round(m0) + '>' + Math.round(B.mana) + ' gia' + g0 + (r && r.o != null ? ' o' + r.o + ' ' + r.id + r.sao : '')); return r; }; };
    for (const ten of ['trieu', 'dungMV', 'ghep', 'nangCap']) bv(ten);
    if (c.vetTu != null) { const ai = window.aiBan; window.aiBan = function (B, dt) { if (G.t >= c.vetTu && G.t <= c.vetDen && B.aiT - dt <= 0) S.vet.push(G.t.toFixed(3) + ' AI mana' + Math.round(B.mana) + ' gia' + B.gia + ' ch=' + CH.trangThai(B) + ' cd' + B.mv.cd.toFixed(3) + ' mvgia' + B.mv.gia); return ai.apply(this, arguments); }; }
  }
  const r0 = Math.random; Math.random = S.gr;
  try { UI.chon = c.deck.slice(); UI.mv = c.mv || 'hero'; UI.che = c.che; batDau(c.che, UI.chon, UI.mv); } finally { Math.random = r0; }
  S.dau = { hat: G.hat, deck: G.ban.map(B => B.deck.join(',')), mv: G.ban.map(B => B.mv && (B.mv.id || B.mv) || '') };
  // CHẶN VÒNG LẶP CỦA TRANG (ui.js: requestAnimationFrame → capNhat theo đồng hồ thật) chen giữa các lượt bot → trận lệch theo tốc độ máy.
  //   capNhat toàn cục chỉ chạy khi bot gọi (S.trong) — mọi bước trận đều là bước 1/60 s của bot.
  const cn = capNhat; S.trong = 0; capNhat = function () { if (S.trong) return cn.apply(this, arguments); };
  window.__tiep = (n) => {
    const r = Math.random; Math.random = S.gr; S.trong = 1;
    try {
      for (let i = 0; i < n && !G.ketThuc; i++) {
        G.dung = false; // màn giới thiệu vào trận (vaotran.js) đặt G.dung = true tới khi người chơi đóng → CH.trangThai 'dung', AI không dùng chỉ huy. Người chơi thật đã đóng.
        cn(1 / 60); S.buoc++;
        if (G.wave !== S.wv) { S.wv = G.wave; S.chup(); }
        if (S.vet && c.vetTu != null && G.t >= c.vetTu && G.t <= c.vetDen && S.buoc % 6 === 0) S.vet.push(G.t.toFixed(3) + ' Q ' + G.quai.filter(E => !E.chet).map(E => E.id + ':' + E.hp.toFixed(2) + '@' + E.s.toFixed(2)).join(' ') + ' | U ' + G.ban[0].t.map(T => T ? T.o + T.id + ':' + T.cd.toFixed(3) + '/' + T.goc.toFixed(3) : '').filter(Boolean).join(' '));
        if (S.buoc % 30 === 0) { try { FX.capNhat(0.5); } catch (e) { } try { if (VX.ds && VX.ds.length > 200) VX.reset(); } catch (e) { } }
      }
    } catch (e) { S.loi = String(e && e.stack || e).slice(0, 600); return true; } finally { Math.random = r; S.trong = 0; }
    if (G.ketThuc) S.chup();
    return !!G.ketThuc;
  };
  window.__kq = () => ({ dau: S.dau, mau: S.mau, diem: S.diem, vet: S.vet, buoc: S.buoc, loi: S.loi, ket: G.ketThuc ? { wave: G.wave, thang: !!(G.ketThuc && G.ketThuc.thang) } : null });
}

async function chayMot(ctx, c) {
  for (let lan = 0; ; lan++) {
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
    const t0 = Date.now();
    try {
      await p.goto(BASE + 'index.html?notut=1&net=0', { waitUntil: 'load' });
      await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && G.rosterMap && typeof CD !== 'undefined' && typeof UI !== 'undefined' && typeof FX !== 'undefined' && typeof capNhat === 'function', null, { timeout: 90000 });
      await p.waitForTimeout(300);
      await p.evaluate(trongTrang, c);
      let xong = false, n = 0;
      while (!xong && n < 600) { xong = await p.evaluate(() => window.__tiep(3000)); n++; }
      const r = await p.evaluate(() => window.__kq());
      r.giay = +((Date.now() - t0) / 1000).toFixed(1); if (errs.length) r.errs = errs.slice(0, 3);
      if (lan < 3 && (!r.mau.length || !r.dau.deck.length)) continue; // trang dọn G.ban lúc nạp → chạy lại
      return r;
    } catch (e) { if (lan >= 3) throw e; } // nạp trang chậm / lỗi nạp → chạy lại
    finally { await p.close(); }
  }
}

// file HÌNH/ÂM (mọi Math.random trong đó không ảnh hưởng luật) + dòng hình trong file luật (dòng gọi ngẫu nhiên có FX./SND./… hoặc pha/khung/bob/seed hình)
const FILE_HINH = String.raw`^(fx|camgiac|tiervfx|growfx|vfx\w*|hieuung|sigfx|dosig|vangsig|ghepfx|fxu(-meta)?|render|quaianim|trumvfx|bangfx|buffvfx|motvong|comoi|anim|sound|nhac|hud\w*|ui|ui-anime|corehud|glyph|chugl|gl/glr|skilldemo|unitpage|khung|chandung|ttgon|thatso|napsan)\.js$`;
function dongHinh() {
  const JS = path.join(GOC, 'thap', 'js'), re = new RegExp(FILE_HINH), out = [];
  const HINH = /FX\.|SND\.|VX\.|GLR\.|REN\.|(seed|khung|bob)\s*:\s*(Math\.random|rnd)/;
  for (const f of fs.readdirSync(JS).filter(f => f.endsWith('.js') && !re.test(f))) {
    fs.readFileSync(path.join(JS, f), 'utf8').split('\n').forEach((d, i) => { if (/Math\.random|\brnd\(|\brint\(|\bpick\(/.test(d) && HINH.test(d)) out.push(f + ':' + (i + 1)); });
  }
  return out;
}
const DONG_HINH = dongHinh();

// bộ bài phủ MỌI ụ: chia danh sách ụ (theo bậc) thành các bộ 5, cộng các bộ trong thap-bot-lo.json
function boBai(ids) {
  const ds = []; for (let i = 0; i < ids.length; i += 5) { const d = ids.slice(i, i + 5); while (d.length < 5) d.push(ids[d.length * 7 % ids.length]); ds.push(d); }
  try { for (const c of JSON.parse(fs.readFileSync(path.join(__dirname, 'thap-bot-lo.json'), 'utf8'))) { const k = c.deck.join(','); if (!ds.some(d => d.join(',') === k)) ds.push(c.deck); } } catch (e) { }
  return ds;
}

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--disable-gpu'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/\.(png|jpg|jpeg|webp|mp3|ogg|wav|m4a|mp4|webm)(\?.*)?$/i, r => r.abort());
  // danh sách ụ hợp lệ của bộ bài (G.roster) lấy từ trang
  const p0 = await ctx.newPage(); await p0.goto(BASE + 'index.html?notut=1&net=0'); await p0.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length, null, { timeout: 30000 });
  const roster = await p0.evaluate(() => G.roster.map(r => r.id)); await p0.close();
  const max = +(A.max || 60), che = A.che || 'solo';
  let viec = [];
  if (A.kiem) {
    const bb = boBai(roster), ds = [bb[0], bb[3], bb[8], bb[14]];
    for (const d of ds) for (const rnd of [0, 1]) viec.push({ che, deck: d, hat: 1, rnd, cap: +(A.cap || 0), max: +(A.max || 25) });
  } else {
    const hats = (A.hat || '1,2,3').split(',').map(Number), ds = A.deck ? [A.deck.split(',')] : boBai(roster);
    for (const d of ds) for (const h of hats) viec.push({ che, deck: d, hat: h, rnd: +(A.rnd || 0), cap: +(A.cap || 0), max, vet: +(A.vet || 0), vetTu: A.vetTu != null ? +A.vetTu : null, vetDen: +(A.vetDen || 1e9) });
    if (A.n) viec = viec.slice(0, +A.n);
  }
  for (const c of viec) { c.fileHinh = FILE_HINH; c.dongHinh = DONG_HINH; }
  const ra = []; let i = 0, xong = 0; const t0 = Date.now();
  const tho = async () => { while (i < viec.length) { const c = viec[i++]; let r; try { r = await chayMot(ctx, c); } catch (e) { r = { mau: [], loi: String(e).slice(0, 300) }; }
    xong++; const cuoi = r.mau[r.mau.length - 1];
    console.log(`[${xong}/${viec.length}] ${c.deck.join(',')} hạt ${c.hat} rnd ${c.rnd} → ${r.mau.length} mốc, tới w${cuoi ? cuoi.w : '?'}${r.ket ? (r.ket.thang ? ' THẮNG' : ' thua') : ''} · ${r.giay}s${r.loi ? ' · LỖI ' + r.loi.slice(0, 120) : ''}`);
    ra.push({ ca: c, ...r }); } };
  await Promise.all(Array.from({ length: Math.min(+(A.song || 2), viec.length) }, tho));
  await b.close();

  if (A.kiem) { // so 2 luồng rnd
    let tot = true;
    for (let k = 0; k < ra.length; k++) for (let j = k + 1; j < ra.length; j++) {
      const x = ra[k], y = ra[j]; if (x.ca.deck.join() !== y.ca.deck.join() || x.ca.hat !== y.ca.hat) continue;
      const n = Math.min(x.mau.length, y.mau.length); let lech = -1;
      for (let m = 0; m < n; m++) if (x.mau[m].s !== y.mau[m].s) { lech = m; break; }
      if (lech < 0 && x.mau.length === y.mau.length) console.log('TRÙNG ', x.ca.deck.join(','), n + ' mốc');
      else { tot = false; console.log('LỆCH  ', x.ca.deck.join(','), 'ở mốc', lech, '\n  rnd0:', x.mau[lech] && x.mau[lech].s, '\n  rnd1:', y.mau[lech] && y.mau[lech].s); }
    }
    console.log(tot ? 'KẾT LUẬN: luật KHÔNG phụ thuộc Math.random → dùng làm mẫu được.' : 'KẾT LUẬN: luật còn dính Math.random.');
    if (A.ra) fs.writeFileSync(RA, JSON.stringify(ra));
    return;
  }
  let commit = ''; try { commit = cp.execSync('git rev-parse HEAD', { cwd: GOC }).toString().trim(); } catch (e) { }
  fs.mkdirSync(path.dirname(RA), { recursive: true });
  fs.writeFileSync(RA, JSON.stringify({ commit, luc: new Date().toISOString(), che, max, chuoi: 'w|t|q:n:hp|b<i>:tim:mana:gia:pu:o.id.sao,…', tran: ra.map(r => ({ ca: { che: r.ca.che, deck: r.ca.deck, hat: r.ca.hat, cap: r.ca.cap, max: r.ca.max }, diem: r.diem, vet: r.vet, dau: r.dau, ket: r.ket, buoc: r.buoc, loi: r.loi || undefined, mau: r.mau })) }));
  console.log('→', RA, '·', ra.length, 'trận ·', Math.round((Date.now() - t0) / 1000) + 's');
})().catch(e => { console.error(e); process.exit(1); });
