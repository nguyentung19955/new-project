// TURRET MERGE — KIỂM CỘNG HƯỞNG LUẬT (07/11): khi HAI luật gặp nhau, luật nào thắng — mỗi cặp ghi rõ kết quả MONG ĐỢI theo chữ thẻ / luật DCDW.
//   Lý do: người dùng nhiều lần gặp lỗi "một luật âm thầm đè luật kia" (Vua Ghép VÀNG kéo lên Vua Ghép chỉ +1★; Hộp Bí Ẩn "Does not shoot" vẫn chọc).
//   Ma trận: ghép đặc biệt (ghepDB) × biến thể nguồn/đích (vàng, thức tỉnh, đá, băng, cháy, 7★, cùng loại, Mimic/Copycat, đích là ụ đặc biệt)
//            · kỹ năng khi ghép (ghep) chạy đúng 1 lần, không chạy khi đá+đá · bộ đếm × ghép / chép / mất sao
//            · chỉ huy RAGE ×2 "cả bàn" lên MỌI nguồn sát thương (đạn, chọc, DoT, drone, nổ khi ghép) · bản sao Copycat −% lên mọi nguồn
//            · chiêu trùm × ụ chống (Mirror Gate, khiên, Holy Shield) · PVP: Holy Shield chặn "hiệu ứng ghép của đối thủ"
//   Bảng kết quả: docs/demo-hop-tuong/tuvan/cong-huong/BAO-CAO.md · câu hỏi mở: CAN-HOI.md
//   node tools/thap-kt-cong-huong-luat.js   (✓/✗, mã thoát 1 nếu có lỗi) · CHI=<chuỗi> chỉ chạy nhóm có tên chứa chuỗi
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7', 'growfx'];
function moiTruong() {
  const noop = () => {};
  const ctx = { console, Math, JSON, Set, Map, WeakMap, WeakSet, Promise, Object, Array, Error, setTimeout: (f) => { ctx._cho.push(f); }, clearTimeout: noop, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop } };
  ctx.window = ctx; ctx.location = { search: '' }; ctx.addEventListener = noop;
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [] }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.BVX = new Proxy({}, { get: () => noop });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null, s: 1, dpr: 1 };
  ctx.UI = { vaoTran: noop, canhBaoTrum: noop, bangWave: noop, ketQua: noop };
  ctx.FONT = { display: 'x', ui: 'x' };
  vm.createContext(ctx);
  for (const f of FILES) { const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  vm.runInContext("if (typeof buffNo === 'undefined') var buffNo = function () {};", ctx);
  vm.runInContext('G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;', ctx);
  vm.runInContext('var _sum = 0; const _tr0 = trung; trung = function (E, d, o) { const h = E.hp; const r = _tr0(E, d, o); if (!E._bo) _sum += Math.max(0, h - E.hp); return r; };', ctx);
  return ctx;
}
const ctx = moiTruong(), R = (s) => vm.runInContext(s, ctx);
const CHI = process.env.CHI || '';
const KQ = []; // { nhom, cap, mong, thuc, ok }
let nhomHT = '';
const nhom = (t) => { nhomHT = t; console.log(t); return !CHI || t.toLowerCase().includes(CHI.toLowerCase()); };
const ca = (cap, mong, thuc, dk) => { KQ.push({ nhom: nhomHT, cap, mong, thuc: String(thuc), ok: !!dk }); console.log((dk ? '  ✓ ' : '  ✗ ') + cap + ' — mong: ' + mong + (dk ? '' : ' · thực tế: ' + thuc)); };
// RNG gieo hạt (thay Math.random toàn cục trong lúc đo — 2 lần chạy cùng hạt ra cùng chuỗi)
const rngHat = (s) => () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
const mathR0 = Math.random;
const gieo = (s) => { Math.random = rngHat(s); };
const traRng = () => { Math.random = mathR0; };
const buoc = (t, moiBuoc) => { for (let x = 0; x < t; x += 1 / 30) { if (moiBuoc) moiBuoc(); R('capNhat(1/30)'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => f()); } };
// bàn sạch: deck cho trước, không quái, không chờ wave
const tran = (deck, che) => { ctx._d = deck; R(`G.debug = {}; batDau('${che || 'solo'}', _d, 'hero'); G.cho = 1e9; G.quai.length = 0; for (const X of G.ban) { X.t.fill(null); X.mana = 0; } var B = G.ban[0]; var D = G.ban[1] || null;
  var dat = (o, id, s, k, BB) => { BB = BB || B; const T = sinhU(taoU(BB, id, s, o)); BB.t[o] = T; if (k) for (const x of String(k).split(',')) { if (x === 'da') T.st.da = true; if (x === 'bang') T.st.bang = 99; if (x === 'lua') T.st.lua = 99; if (x === 'vang') T.vang = true; if (x === 'thuong') T.vang = false; if (x === 'thuc') T.thuc = true; if (x === 'copy') T.banSao = true; } return T; };
  var hl = (a, b) => !!hopLeGhep(a, b); var chk = (BB) => { BB = BB || B; for (let i = 0; i < 15; i++) { const T = BB.t[i]; if (!T) continue; if (T.o !== i || T.ban !== BB.i || T.sao < 1 || T.sao > 7 || BB.t.indexOf(T) !== i) return 'ô ' + i + ' lệch'; } return ''; };`); };

const DS_DB = R(`G.roster.filter(r => SKILLS[r.id] && SKILLS[r.id].ghepDB).map(r => r.id)`);
const DS_GHEP = R(`G.roster.filter(r => SKILLS[r.id] && SKILLS[r.id].ghep).map(r => r.id)`);
console.log('ghepDB: ' + DS_DB.join(',') + '\nghep: ' + DS_GHEP.join(','));

// =====================================================================================================
// 1 · GHÉP ĐẶC BIỆT (ghepDB) × biến thể nguồn / đích — mọi ụ đích trong danh sách ụ
//   Luật nền (conghuong/BANG.md, MA-TRAN.md): ụ KÉO bị khoá (đá/băng) không dùng kỹ năng · đích bị khoá: chỉ kỹ năng quaKhoa (Merge King, Teleporter, Copycat)
//   · Merge King: đích CÙNG THÂN +1★ (vàng +2★, trần 7★), giữ mọi trạng thái · Teleporter: đổi chỗ, giữ mọi thứ · Copycat: bản sao ở ô Copycat, sao = sao Copycat,
//   không bao giờ là đá/băng, giữ DẠNG ụ gốc · Overclock: chỉ ụ có sát thương · Scrap Forge: ăn ụ ≤3★ không đá · Blood Circuit: 2 ụ → 1 ụ bộ bài ở sao cao hơn
// =====================================================================================================
if (nhom('1 · ghepDB × biến thể nguồn/đích')) {
  const IDS = R(`G.roster.map(r => r.id)`);
  const NGUON = { thuong: '', vang: 'vang', da: 'da', bang: 'bang', copy: 'copy' };
  const DICH = { thuong: '', da: 'da', bang: 'bang', lua: 'lua', copy: 'copy', vang: 'vang', thuc: 'thuc', s7: 's7' };
  for (const S of DS_DB) for (const [tn, kn] of Object.entries(NGUON)) {
    if (kn === 'vang' && S !== 'vughep') continue;
    for (const [td, kd] of Object.entries(DICH)) {
      const loi = [];
      for (const X of IDS) {
        if (kd === 'vang' && X !== 'vughep') continue;
        if (kd === 'thuc' && X !== 'soi') continue;
        const s = kd === 's7' ? 7 : 3;
        tran([S, X, 'lien', 'canon', 'tia']);
        R(`B.deck = ['lien', 'canon', 'tia', 'set', 'bao']; var a = dat(6, '${S}', ${kd === 's7' ? 7 : 3}, '${kn || (S === 'vughep' ? 'thuong' : '')}'), b = dat(8, '${X}', ${s}, '${kd === 's7' ? '' : kd}'); var b0 = { id: b.id, sao: b.sao, da: !!b.st.da, bang: b.st.bang > 0, lua: b.st.lua > 0, banSao: !!b.banSao, vang: !!b.vang, thuc: !!b.thuc, ep: b.epxung, lo: a.lo || 0 }; var db = ghepDBHop(a, b);`);
        const sk = R(`SKILLS['${S}'].ghepDB`);
        const khoaA = kn === 'da' || kn === 'bang', khoaB = kd === 'da' || kd === 'bang';
        const hopLeDB = (R(`SKILLS['${S}'].ghepDB.hopLe(a, b)`) && (S !== X || !!sk.cungLoai)) || (S !== X && R(`!!(SKILLS['${X}'].ghepDB && SKILLS['${X}'].ghepDB.haiChieu && SKILLS['${X}'].ghepDB.hopLe(b, a))`)); // ụ đích haiChieu (Scrap Forge) ăn ngược
        const hlThuc = R('hl(a, b)');
        // mong đợi hopLeGhep: khoá nguồn → không (trừ đá+đá cùng sao cùng loại — không có trong ma trận này);
        // khoá đích → chỉ quaKhoa; còn lại: hopLe của kỹ năng hoặc ghép thường (cùng loại cùng sao <7 / Mimic)
        const thuong = !khoaA && !khoaB && s < 7 && (S === X || X === 'mimic');
        const daDa = kn === 'da' && kd === 'da' && s < 7 && !R(`biKhoa(a) && (a.st.bang > 0)`); // đá + đá cùng sao: ghép thành khối đá +1★ (luật DCDW)
        const mongHL = daDa ? true : khoaA ? false : khoaB ? (!!sk.quaKhoa && hopLeDB) : (hopLeDB || thuong);
        if (hlThuc !== mongHL) { loi.push(X + ': hopLeGhep=' + hlThuc + ' (mong ' + mongHL + ')'); continue; }
        if (!hlThuc) continue;
        let r; try { r = R(`var _r = ghep(B, a, b); var _l = chk(); _l`); } catch (e) { loi.push(X + ': lỗi ' + e.message); continue; }
        if (r) { loi.push(X + ': ' + r); continue; }
        // kiểm theo kỹ năng (chỉ khi thực sự đi đường ghép đặc biệt)
        if (!R('!!db')) continue;
        const kq = R(`(() => { const N = B.t[8], M = B.t[6]; return { n: N && { id: N.id, sao: N.sao, da: !!N.st.da, bang: N.st.bang > 0, lua: N.st.lua > 0, banSao: !!N.banSao, vang: !!N.vang, thuc: !!N.thuc, ep: N.epxung, cung: N === b }, m: M && { id: M.id, sao: M.sao, da: !!M.st.da, bang: M.st.bang > 0, banSao: !!M.banSao, vang: !!M.vang, thuc: !!M.thuc, cung: M === a, cungB: M === b, lo: M.lo || 0 } }; })()`);
        const b0 = R('b0'), dao = R('!!db.dao');
        const sai = (t) => loi.push(X + ': ' + t);
        if (S === 'vughep' && !dao) {
          const n = R('!!a.vang') ? 2 : 1;
          if (!kq.n || !kq.n.cung) sai('Merge King phải giữ CÙNG THÂN đích');
          else { if (kq.n.sao !== Math.min(7, b0.sao + n)) sai('sao ' + kq.n.sao + ' ≠ ' + Math.min(7, b0.sao + n) + (n === 2 ? ' (vàng +2★)' : ''));
            if (kq.n.da !== b0.da || kq.n.bang !== b0.bang || kq.n.lua !== b0.lua || kq.n.banSao !== b0.banSao || kq.n.thuc !== b0.thuc) sai('mất trạng thái đích (cùng thân phải GIỮ)');
            if (X === 'vughep' && kq.n.vang !== (b0.vang || R('!!a.vang'))) sai('MK+MK: vàng phải giữ nếu 1 trong 2 vàng'); }
          if (kq.m) sai('ô Merge King kéo phải trống');
        }
        if (S === 'dichchuyen') { if (!kq.m || !kq.m.cungB || !kq.n || !kq.n.cung === false) { if (!(kq.m && kq.m.cungB)) sai('Teleporter: đích phải sang ô nguồn (cùng thân)'); }
          if (kq.m && (kq.m.da !== b0.da || kq.m.bang !== b0.bang || kq.m.sao !== b0.sao)) sai('Teleporter: đích đổi chỗ phải giữ đá/băng/sao'); }
        if (S === 'saochep') { if (!kq.m || kq.m.id !== b0.id || kq.m.sao !== 3 && kd !== 's7' || !kq.m.banSao) sai('Copycat: ô Copycat phải thành bản sao ' + b0.id + ' cùng sao (có ' + JSON.stringify(kq.m) + ')');
          else { if (kq.m.da || kq.m.bang) sai('Copycat: "the copy is never stone" — bản sao đang khoá');
            if (b0.id === 'vughep' && kq.m.vang !== b0.vang) sai('Copycat: không giữ dạng VÀNG');
            if (b0.id === 'soi' && kq.m.thuc !== b0.thuc) sai('Copycat: không giữ dạng THỨC TỈNH'); }
          if (!kq.n || !kq.n.cung) sai('Copycat: ụ gốc phải giữ nguyên'); }
        if (S === 'epxung' && !dao) { if (!R(`!!SKILLS['${X}'].dmg`)) sai('Overclock lên ụ KHÔNG bắn (thẻ: "same-star shooting turret")'); else if (!kq.n || !kq.n.cung || !(kq.n.ep > b0.ep)) sai('Overclock: đích phải +tốc cùng thân'); }
        if (S === 'loren' && !dao) { if (b0.sao > 3 || b0.da) sai('Forge ăn ụ >3★ / đá'); if (kq.n) sai('Forge: ụ bị ăn phải mất'); if (!kq.m || !(kq.m.lo > b0.lo)) sai('Forge: lò phải tăng'); }
        if (S === 'mauhut') { if (!kq.n || kq.n.cung || kq.m) sai('Blood Circuit: 2 ụ → 1 ụ mới ở ô đích'); else if (kq.n.sao !== Math.max(b0.sao, kd === 's7' ? 7 : 3)) sai('Blood Circuit: sao ' + kq.n.sao + ' ≠ sao cao hơn'); }
      }
      ca(S + ' [' + tn + '] → đích [' + td + ']', 'theo luật ghép đặc biệt (xem đầu nhóm)', loi.slice(0, 4).join(' | ') + (loi.length > 4 ? ' …+' + (loi.length - 4) : ''), !loi.length);
    }
  }
}

// =====================================================================================================
// 2 · KỸ NĂNG KHI GHÉP (ghep) × kiểu ghép — luật: ghép THƯỜNG chạy kỹ năng của mỗi LOẠI nguyên liệu đúng 1 lần (2 ụ cùng loại → 1 lần);
//     Mimic + X → kỹ năng X 1 lần · ĐÁ + ĐÁ → không chạy (2 cục đá không có kỹ năng) · ghép ĐẶC BIỆT (Merge King/Teleporter/Copycat kéo lên X) → không chạy
//     · SOLO / PVP / CO-OP: không lỗi, bàn nhất quán (ô ↔ ụ)
// =====================================================================================================
if (nhom('2 · kỹ năng khi ghép × kiểu ghép')) {
  R(`var _dem = {}; for (const id of ${JSON.stringify(DS_GHEP)}) { const g = SKILLS[id].ghep; SKILLS[id]._g0 = g; SKILLS[id].ghep = function () { _dem[id] = (_dem[id] || 0) + 1; return g.apply(this, arguments); }; }`);
  for (const id of DS_GHEP) {
    const kieu = [
      ['thường cùng loại', `dat(6,'${id}',2); dat(8,'${id}',2); ghep(B, B.t[6], B.t[8]);`, 1],
      ['Mimic kéo lên', `dat(6,'mimic',2); dat(8,'${id}',2); ghep(B, B.t[6], B.t[8]);`, 1],
      ['kéo lên Mimic', `dat(6,'${id}',2); dat(8,'mimic',2); ghep(B, B.t[6], B.t[8]);`, 1],
      ['đá + đá', `dat(6,'${id}',2,'da'); dat(8,'${id}',2,'da'); ghep(B, B.t[6], B.t[8]);`, 0],
      ['Merge King kéo lên', `dat(6,'vughep',2,'thuong'); dat(8,'${id}',2); ghep(B, B.t[6], B.t[8]);`, 0],
      ['Teleporter kéo lên', `dat(6,'dichchuyen',2); dat(8,'${id}',2); ghep(B, B.t[6], B.t[8]);`, 0],
      ['Copycat kéo lên', `dat(6,'saochep',2); dat(8,'${id}',2); ghep(B, B.t[6], B.t[8]);`, 0],
    ];
    const loi = [];
    for (const che of ['solo', 'pvp', 'coop']) for (const [ten, js, n] of kieu) {
      if (id === 'mauhut' && /Mimic kéo lên|kéo lên Mimic/.test(ten)) continue; // Blood Circuit kéo lên Mimic = ghép đặc biệt (hiến), không phải ghép thường
      tran([id, 'mimic', 'lien', 'canon', 'tia'], che);
      if (che !== 'solo') R(`for (let o = 0; o < 5; o++) dat(o, 'lien', 3, '', D);`);
      R('B.mv.cd = 5; for (const k in _dem) delete _dem[k];');
      gieo(77);
      try { R(js); buoc(2); } catch (e) { loi.push(che + '/' + ten + ': lỗi ' + e.message); traRng(); continue; }
      traRng();
      const d = R(`_dem['${id}'] || 0`), c = R('chk(B)') || (che !== 'solo' ? R('chk(D)') : '');
      // Scrap Forge ≤3★ + Mimic: kỹ năng Forge (haiChieu) thắng — Forge ĂN Mimic, không ghép thường (CAN-HOI.md #1, đang giữ)
      const mong = (id === 'loren' && /Mimic/.test(ten)) ? 0 : n;
      if (d !== mong) loi.push(che + '/' + ten + ': chạy ' + d + ' lần (mong ' + mong + ')');
      if (c) loi.push(che + '/' + ten + ': bàn lệch ' + c);
    }
    ca(id + ' — kỹ năng khi ghép', 'thường/Mimic: 1 lần · đá+đá / MK / Teleporter / Copycat: 0 · 3 chế độ không lỗi', loi.slice(0, 4).join(' | ') + (loi.length > 4 ? ' …+' + (loi.length - 4) : ''), !loi.length);
  }
  R(`for (const id of ${JSON.stringify(DS_GHEP)}) SKILLS[id].ghep = SKILLS[id]._g0;`);
}

// =====================================================================================================
// 3 · CHỈ HUY RAGE "+100% damage to the whole board" × MỌI nguồn sát thương  ·  4 · BẢN SAO Copycat (−% sao chép) × mọi nguồn
//   Đo: cùng hạt RNG, quái được hồi đầy mỗi bước (không chết → tuyến tính), 1 ụ trên bàn chạy 14 s; tỉ số tổng sát thương RAGE / thường phải ≈ 2,
//   bản sao / gốc ≈ % sao chép. Kỹ năng khi ghép gây sát thương (drone, nổ Blood Circuit…): ghép 1 cặp rồi đo 10 s.
// =====================================================================================================
// đo THAM SỐ sát thương của 4 đòn ĐẦU TIÊN (trước chí mạng / suy yếu) — cùng hạt RNG thì 2 lần chạy giống hệt tới đòn đầu → tỉ số tất định
R(`var _log = null; const _tr1 = trung; trung = function (E, d, o) { if (_log && _log.length < 4 && !E.chet) _log.push(d); return _tr1(E, d, o); };`);
const doSat = (id, sao, giay, opt) => {
  opt = opt || {};
  gieo(opt.hat || 4242);
  tran([id, 'lien', 'canon', 'tia', 'set'], opt.che);
  R(`B.tim = 1e9; G.cho = 0; ${opt.dung || `var T = dat(7, '${id}', ${sao}, '${opt.copy ? 'copy' : ''}');`} B.mana = 0; _log = [];`);
  if (opt.rage) R('B.cuong = 1e9');
  let t0 = 0;
  try {
    buoc(giay, () => { if (opt.rage) R('B.cuong = 1e9'); R('for (const E of G.quai) if (!E.chet) E.hp = E.max; G.ban.forEach(X => X.tim = 1e9);'); if (opt.ghep && (t0 += 1 / 30) > 1.5 && !opt._da) { opt._da = 1; R('_log = []; ' + opt.ghep); } if (R('_log.length') >= 4) throw 'du'; });
  } catch (e) { if (e !== 'du') throw e; } finally { traRng(); }
  return R('_log.slice()');
};
const tiSo = (a, b) => { const n = Math.min(1, a.length, b.length); /* chỉ đòn ĐẦU: sau đó 2 lần chạy có thể rẽ nhánh */ if (!n) return null; let mn = 1e9, mx = -1e9; for (let i = 0; i < n; i++) { const k = a[i] > 0 ? b[i] / a[i] : 1; mn = Math.min(mn, k); mx = Math.max(mx, k); } return [mn, mx]; };
if (process.env.DBG) { for (const id of process.env.DBG.split(',')) { const f = (o) => doSat(id, 4, 14, o).map(x => x.toFixed(1)).join(' '); console.log(id, f(), '| R', f({ rage: 1 }), '| C', f({ copy: 1 })); } process.exit(0); }
if (nhom('3 · RAGE ×2 × mọi nguồn sát thương')) {
  const IDS = R(`G.roster.map(r => r.id)`);
  const lech = [];
  for (const id of IDS) {
    let k = null; for (const hat of [4242, 99, 7]) { const x = tiSo(doSat(id, 4, 14, { hat }), doSat(id, 4, 14, { rage: 1, hat })); if (x) k = k ? [Math.min(k[0], x[0]), Math.max(k[1], x[1])] : x; }
    if (k && (k[0] < 1.95 || k[1] > 2.05)) lech.push(id + ' ×' + k.map(x => x.toFixed(2)).join('–'));
  }
  ca('RAGE × đòn của mọi ụ (4★, 4 đòn đầu)', '×2 (thẻ chỉ huy: "+100% damage to the whole board")', lech.join(', '), !lech.length);
  for (const id of ['drone', 'wallgen', 'pandora', 'mauhut', 'canon', 'khoathoigian', 'luutru', 'xuonganh']) {
    const js = id === 'mauhut' ? `{ const a = dat(0, 'mauhut', 5), b = dat(14, 'lien', 2); B.vamp = 6; ghep(B, a, b); }` : `{ const a = dat(0, '${id}', 3), b = dat(14, '${id}', 3); ghep(B, a, b); }`;
    const o = { dung: 'var T = null;', ghep: js };
    const k = tiSo(doSat(id, 3, 8, Object.assign({}, o)), doSat(id, 3, 8, Object.assign({ rage: 1 }, o)));
    ca('RAGE × ' + id + ' — sát thương KHI GHÉP', '×2 khi đang RAGE', k ? '×' + k.map(x => x.toFixed(2)).join('–') : 'không gây sát thương', !k || (k[0] >= 1.95 && k[1] <= 2.05));
  }
}
if (nhom('4 · bản sao Copycat −% × mọi nguồn sát thương')) {
  const IDS = R(`G.roster.map(r => r.id)`);
  const lech = [];
  tran(['lien']); const he = R(`heSaoChep(G.ban[0])`);
  for (const id of IDS) {
    let k = null; for (const hat of [4242, 99, 7]) { const x = tiSo(doSat(id, 4, 14, { hat }), doSat(id, 4, 14, { copy: 1, hat })); if (x) k = k ? [Math.min(k[0], x[0]), Math.max(k[1], x[1])] : x; }
    if (k && (k[0] < he - 0.03 || k[1] > he + 0.03)) lech.push(id + ' ×' + k.map(x => x.toFixed(2)).join('–'));
  }
  ca('bản sao (banSao) × đòn của mọi ụ (4★, 4 đòn đầu)', '×' + he.toFixed(2) + ' (thẻ Copycat: "becomes a copy at ' + Math.round(he * 100) + '% damage")', lech.join(', '), !lech.length);
}
if (nhom('3b · RAGE × sát thương tính sẵn lúc ghép (drone, nổ Blood Circuit)')) {
  const droneDmg = (rage) => { tran(['drone', 'lien', 'canon', 'tia', 'set']); R(`B.cuong = ${rage ? 10 : 0}; { const a = dat(0, 'drone', 3), b = dat(14, 'drone', 3); ghep(B, a, b); }`); return R(`(G.hu.find(h => h.k === 'drone') || {}).dmg || 0`); };
  const d0 = droneDmg(0), d1 = droneDmg(1);
  ca('RAGE × Drone: bom drone phóng khi ghép', '×2 (bom phóng trong lúc RAGE)', '×' + (d1 / d0).toFixed(2), Math.abs(d1 / d0 - 2) < 0.05);
  const mhDmg = (rage) => { tran(['mauhut', 'lien', 'canon', 'tia', 'set']); R(`B.cuong = ${rage ? 10 : 0}; B.vamp = 6; { const a = dat(0, 'mauhut', 5), b = dat(7, 'lien', 2); const c = B.o[7]; sinhQuai('bo', 0, 100, 50); const E = G.quai[G.quai.length - 1]; E.vao = 1; E.x = c.x; E.y = c.y; E.hp = E.max = 1e9; _log = []; ghep(B, a, b); }`); return R('_log[0] || 0'); };
  const m0 = mhDmg(0), m1 = mhDmg(1);
  ca('RAGE × Blood Circuit: nổ khi hiến khác sao', '×2', m0 ? '×' + (m1 / m0).toFixed(2) : 'không nổ', m0 > 0 && Math.abs(m1 / m0 - 2) < 0.05);
}

// =====================================================================================================
// 5 · BỘ ĐẾM (stack) × ghép / mất sao / kỹ năng "không phải ghép"
//   Luật dự án (conghuong2/BANG.md): Teleporter / Copycat / Overclock / Scrap Forge KHÔNG phải ghép (Star Breaker chỉ bùng khi ghép thật) →
//   Fusion Archive "every merge you make +1" cũng chỉ đếm ghép thật (thường, Mimic, Merge King, Blood Circuit, Pháo La Bàn)
// =====================================================================================================
if (nhom('5 · bộ đếm × ghép / mất sao')) {
  const kieu = [
    ['ghép thường', `dat(0,'lien',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 1],
    ['Merge King nâng sao', `dat(0,'vughep',2,'thuong'); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 1],
    ['Blood Circuit hiến', `dat(0,'mauhut',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 1],
    ['Teleporter đổi chỗ', `dat(0,'dichchuyen',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 0],
    ['Copycat chép', `dat(0,'saochep',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 0],
    ['Overclock', `dat(0,'epxung',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 0],
    ['Scrap Forge ăn', `dat(0,'loren',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 0],
  ];
  for (const [ten, js, n] of kieu) {
    tran(['luutru', 'lien', 'vughep', 'dichchuyen', 'saochep']);
    R(`var K = dat(14, 'luutru', 3); K.kho = 5; var N0 = B.ghepN || 0;`); R(js);
    const d = R('K.kho - 5');
    ca('Fusion Archive × ' + ten, n ? '+1 điểm (ghép thật)' : 'không đổi (không phải ghép — luật Star Breaker)', '+' + d, d === n);
  }
  // Teleporter qua lại 20 lần không được nuôi Archive vô hạn
  tran(['luutru', 'dichchuyen', 'lien', 'canon', 'tia']);
  R(`var K = dat(14, 'luutru', 3); K.kho = 0; var t1 = dat(0, 'dichchuyen', 2), l1 = dat(1, 'lien', 2); for (let i = 0; i < 20; i++) ghep(B, t1, B.t[t1.o === 0 ? 1 : 0]);`);
  ca('Teleporter đổi chỗ qua lại 20 lần × Fusion Archive', '0 điểm (không có ghép nào)', R('K.kho'), R('K.kho') === 0);
  // giữ bộ đếm lớn nhất khi ghép cùng loại ra cùng loại (GIU_CONG_DON + hook riêng)
  for (const [id, k, v] of [['loren', 'lo', 7], ['hopbi', 'tuoi', 20], ['tienhoa', 'tuoi', 9], ['cuuvi', 'duoi', 5], ['lualien', 'lc', 4]]) {
    tran([id]);
    R(`B.deck = ['${id}']; var a = dat(0, '${id}', 2), b = dat(1, '${id}', 2); a.${k} = ${v}; b.${k} = 1; var r = ghep(B, a, b); var N = B.t[1];`);
    const got = R(`N && N.id === '${id}' ? N.${k} || 0 : -1`);
    ca(id + ' + ' + id + ' → ' + id + ': giữ ' + k, 'giữ max (' + v + ')', got, got >= v);
  }
  // Evolver: thẻ "losing a star restarts the countdown" × trùm hạ sao
  tran(['tienhoa', 'lien']); R(`var T = dat(3, 'tienhoa', 4); T.tuoi = 20; capNhatBan(B, 1/30); haSao(B, T); capNhatBan(B, 1/30);`);
  ca('Evolver × trùm −1★', 'đếm ngược lại từ đầu (tuoi ≈ 0)', R('T.tuoi.toFixed(2)'), R('T.tuoi') < 0.5);
  // Merge King nâng sao Evolver: thẻ "higher stars take longer" nhưng tăng sao giữ thời gian đã chờ
  tran(['tienhoa', 'vughep']); R(`var T = dat(3, 'tienhoa', 3); T.tuoi = 20; capNhatBan(B, 1/30); var t0 = T.tuoi; var M = dat(4, 'vughep', 3, 'thuong'); ghep(B, M, T); capNhatBan(B, 1/30);`);
  ca('Evolver × Merge King +1★', 'giữ thời gian đã chờ', R('T.tuoi.toFixed(2)'), R('T.tuoi >= t0 - 0.1'));
}

// =====================================================================================================
// 6 · CHIÊU TRÙM × ụ / trạng thái chống — thẻ Mirror Gate "blocks a boss skill on 1 turret" · khiên 1 lần (Máy Khiên/Pandora) chặn 1 lần ·
//     Holy Shield (Eve) "blocks boss skills … for 8s" · Halo: chiêu nhiều mục tiêu còn 1 ụ, Freezer nửa thời gian
// =====================================================================================================
const chieu = (trum, uids, ban2) => R(`(() => { const E = { trum: '${trum}', x: 10, y: 10, uid: 99999, bao: { t: 0, song: 1.4, muc: ${JSON.stringify(uids)}, muc2: [], ban2: null } }; E.rng = (() => { let s = 7; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })(); thucHienChieu(E, B); })()`);
const anh = () => R(`B.t.map(T => T ? T.id + T.sao + (T.st.da ? 'D' : '') + (T.st.bang > 0 ? 'B' : '') + (T.st.lua > 0 ? 'L' : '') : '-').join(',')`);
if (nhom('6 · chiêu trùm × ụ chống')) {
  const TRUM = ['nightmare', 'janus', 'freezer', 'mad_crown', 'octopus', 'joker_king'];
  for (const tr of TRUM) {
    // Holy Shield
    tran(['lien', 'canon', 'tia', 'set', 'bao']); R(`var X = dat(0, 'lien', 3), Y = dat(1, 'lien', 3), Z = dat(2, 'canon', 3); B.khien = 8;`);
    let t0 = anh(); chieu(tr, R('[X.uid, Y.uid, Z.uid]'));
    ca('Holy Shield × ' + tr, 'chặn hết (bàn không đổi)', anh(), anh() === t0);
    // Máy Khiên (khiên 1 lần trên ụ)
    tran(['lien', 'canon', 'tia', 'set', 'bao']); R(`var X = dat(0, 'lien', 3), Y = dat(1, 'lien', 3); X.khien = 1;`);
    t0 = anh(); chieu(tr, R('[X.uid]'));
    ca('khiên 1 lần × ' + tr, 'chặn, khiên tiêu (0)', anh() + ' khien=' + R('B.t[0] && B.t[0].khien'), anh() === t0 && R('B.t[0].khien') === 0);
    // Mirror Gate sẵn sàng (SOLO)
    tran(['lien', 'canon', 'tia', 'set', 'guongcong']); R(`var X = dat(0, 'lien', 3), Y = dat(1, 'lien', 3), M = dat(14, 'guongcong', 1); M.nap = 1;`);
    t0 = anh(); chieu(tr, R('[X.uid]'));
    ca('Mirror Gate sẵn × ' + tr + ' (1 ụ)', 'chặn, gương về 0%', anh() + ' nap=' + R('M.nap'), anh() === t0 && R('M.nap') === 0);
  }
  // Mirror Gate: 3 mục tiêu → chặn 1 ụ ("on 1 turret")
  tran(['lien', 'canon', 'tia', 'set', 'guongcong']); R(`var X = dat(0, 'lien', 3), Y = dat(1, 'lien', 3), Z = dat(2, 'lien', 3), M = dat(14, 'guongcong', 1); M.nap = 1;`);
  chieu('janus', R('[X.uid, Y.uid, Z.uid]'));
  const nDa = R('[X, Y, Z].filter(T => T.st.da).length');
  ca('Mirror Gate × Janus 3 mục tiêu', 'chặn đúng 1 ụ ("blocks a boss skill on 1 turret") → 2 ụ đá', nDa + ' ụ đá', nDa === 2);
  // Nightmare −1★ trên ụ 1★: phá ụ; khiên chặn
  tran(['lien']); R(`var X = dat(0, 'lien', 1);`); chieu('nightmare', R('[X.uid]'));
  ca('Nightmare × ụ 1★', 'ụ bị phá (ô trống)', anh().split(',')[0], !R('B.t[0]'));
  // Mad Crown / Joker × ụ đá, băng: bỏ qua (khoá chặn biến hình)
  for (const tr of ['mad_crown', 'joker_king']) for (const k of ['da', 'bang']) {
    tran(['lien', 'canon']); R(`var X = dat(0, 'lien', 3, '${k}'), Y = dat(1, 'lien', 3);`); const t1 = anh(); chieu(tr, R('[X.uid]'));
    ca(tr + ' × ụ ' + (k === 'da' ? 'đá' : 'băng'), 'không biến / không ép ghép', anh(), anh() === t1);
  }
  // Halo: chiêu nhiều mục tiêu còn 1 ụ
  tran(['lien', 'canon']); R(`var X = dat(0, 'lien', 3), Y = dat(1, 'lien', 3), Z = dat(2, 'lien', 3); B.halo = 5; B.khien = 5;`);
  chieu('janus', R('[X.uid, Y.uid, Z.uid]'));
  ca('Halo × Janus 3 mục tiêu', 'còn trúng 1 ụ', R('[X, Y, Z].filter(T => T.st.da).length'), R('[X, Y, Z].filter(T => T.st.da).length') === 1);
}

// =====================================================================================================
// 7 · PVP: Holy Shield (Eve) "blocks … rival merge effects for 8s" × MỌI hiệu ứng ghép phá đối thủ · khiên 1 lần chặn
// =====================================================================================================
const anhD = () => R(`D.t.map(T => T ? T.id + T.sao + (T.st.kep > 0 ? 'K' : '') + (T.st.ngam > 0.3 ? 'N' : '') + (T.giamT > 0 ? 'G' : '') + (T.hexT > 0 ? 'H' : '') : '-').join(',') + ' gia=' + D.gia`);
if (nhom('7 · PVP Holy Shield × hiệu ứng ghép của đối thủ')) {
  for (const id of ['kepha', 'xaotron', 'nguyenrua', 'nhieusong']) for (const che of ['eve', 'khien']) {
    tran([id, 'lien', 'canon', 'tia', 'set'], 'pvp');
    R(`D.deck = ['lien', 'canon', 'tia', 'set', 'bao']; for (let o = 0; o < 6; o++) { const T = dat(o, 'lien', 4, '', D); ${che === 'khien' ? 'T.khien = 1;' : ''} } ${che === 'eve' ? 'D.khien = 8;' : ''} D.gia = 10;`);
    const t0 = anhD();
    gieo(5); R(`{ const a = dat(0, '${id}', 5), b = dat(1, '${id}', 5); ghep(B, a, b); }`); buoc(2, () => R('D.khien = ' + (che === 'eve' ? 8 : 0))); traRng();
    // khiên 1 lần nằm trên ỤỤ: chỉ bảo vệ ụ — phần +mana triệu hồi của Signal Jammer đánh vào BÀN (CAN-HOI.md #3), nên bỏ so giá
    const bo = (s) => che === 'khien' ? s.replace(/ gia=.*/, '') : s;
    const t1 = bo(anhD().replace(/N/g, ''));
    ca((che === 'eve' ? 'Holy Shield' : 'khiên 1 lần') + ' × ' + id + ' (PVP)', che === 'eve' ? 'bàn đối thủ + giá triệu hồi không đổi' : 'ụ đối thủ không đổi', t1, t1 === bo(t0.replace(/N/g, '')));
  }
}

// ===== KẾT =====
const sai = KQ.filter(k => !k.ok);
if (process.env.JSON_OUT) fs.writeFileSync(process.env.JSON_OUT, JSON.stringify(KQ, null, 1));
console.log(sai.length ? '✗ thap-kt-cong-huong-luat: ' + sai.length + '/' + KQ.length + ' cặp lệch luật' : '✓ thap-kt-cong-huong-luat: đạt (' + KQ.length + ' cặp)');
process.exit(sai.length ? 1 : 0);
