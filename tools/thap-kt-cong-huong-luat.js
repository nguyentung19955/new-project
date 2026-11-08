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
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7', 'jackpot', 'growfx', 'trum'];
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
        const thuong = !khoaA && !khoaB && s < 7 && ((S === X && S !== 'loren' && S !== 'canon') || X === 'mimic'); // Twin Anvil + Twin Anvil: chỉ ghép đặc biệt cùng dạng (08/11) · Pháo La Bàn + Pháo La Bàn: chỉ gộp hướng (08/11 tổ hợp hướng)
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
            // 08/11 người dùng: bản sao = lần xuất hiện MỚI → dạng quay lúc sinh (vàng / thức tỉnh) QUAY LẠI, không chép gốc (phân bố: tools/thap-kt-ngau-nhien-sinh.js)
            if (b0.id === 'vughep' && typeof kq.m.vang !== 'boolean') sai('Copycat: bản sao Merge King phải có dạng vàng/thường (quay mới)');
            if (b0.id === 'soi' && typeof kq.m.thuc !== 'boolean') sai('Copycat: bản sao Sói phải có dạng thức tỉnh/thường (quay mới)'); }
          if (!kq.n || !kq.n.cung) sai('Copycat: ụ gốc phải giữ nguyên'); }
        if (S === 'epxung' && !dao) { if (!R(`!!SKILLS['${X}'].dmg`)) sai('Overclock lên ụ KHÔNG bắn (thẻ: "same-star shooting turret")'); else if (!kq.n || !kq.n.cung || !(kq.n.ep > b0.ep)) sai('Overclock: đích phải +tốc cùng thân'); }
        // Twin Anvil (08/11): lên Anvil cùng dạng → ụ kéo mất, đích giữ thân, cộng dồn không giảm · lên ụ khác → Anvil mất, đích giữ thân + có buff (anv)
        if (S === 'loren' && !dao) { const anv = R('!!(B.t[8] && B.t[8].anv)'); if (kq.m) sai('Anvil: ụ kéo phải mất'); if (!kq.n || !kq.n.cung) sai('Anvil: đích phải giữ thân'); else if (b0.id !== 'loren' && !anv) sai('Anvil: đích phải có buff'); if (b0.da) sai('Anvil lên ô đá'); }
        // Blood Circuit (08/11): chỉ ĐÁNH DẤU — 2 ụ giữ nguyên chỗ/thân; không đánh dấu 7★ / Trứng / Anvil / Lõi Khởi Sinh / Hỗ trợ / đá
        if (S === 'mauhut') { if (!kq.n || !kq.n.cung || !kq.m) sai('Blood Circuit: 2 ụ phải giữ nguyên'); else if (!R('a.mh && a.mh.o === 8')) sai('Blood Circuit: phải đánh dấu đích'); if (b0.sao >= 7 || b0.da) sai('Blood Circuit đánh dấu 7★ / đá'); }
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
      // Scrap Forge ≤3★ + Mimic: GHÉP THƯỜNG (người dùng chốt CAN-HOI #1 = B: Mimic thắng, Forge chỉ ăn ụ khác Mimic)
      const mong = n;
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
  // (08/11: Blood Circuit không còn nổ khi hiến — làm lại thành đánh dấu / nuốt / Blood Rite)
}

// =====================================================================================================
// 5 · BỘ ĐẾM (stack) × ghép / mất sao / kỹ năng "không phải ghép"
//   Luật dự án (conghuong2/BANG.md): Teleporter / Copycat / Overclock / Scrap Forge KHÔNG phải ghép (Star Breaker chỉ bùng khi ghép thật) →
//   Fusion Archive "every merge you make +1" cũng chỉ đếm ghép thật (thường, Mimic, Merge King, Blood Circuit, Pháo La Bàn)
// =====================================================================================================
if (nhom('5 · bộ đếm × ghép / mất sao')) {
  const kieu = [
    ['ghép thường', `dat(0,'lien',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 1],
    ['Merge King nâng sao', `dat(0,'vughep',2,'thuong'); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 0], // 08/11 người dùng: tăng sao KHÔNG phải ghép
    ['Blood Circuit đánh dấu', `dat(0,'mauhut',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 0],
    ['Twin Anvil + Twin Anvil', `dat(0,'loren',2); dat(1,'loren',3); B.t[0].dang = B.t[1].dang = 'dmg'; ghep(B, B.t[0], B.t[1]);`, 1],
    ['Teleporter đổi chỗ', `dat(0,'dichchuyen',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 0],
    ['Copycat chép', `dat(0,'saochep',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 0],
    ['Overclock', `dat(0,'epxung',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 0],
    ['Twin Anvil buff', `dat(0,'loren',2); dat(1,'lien',2); ghep(B, B.t[0], B.t[1]);`, 0],
  ];
  for (const [ten, js, n] of kieu) {
    tran(['luutru', 'lien', 'vughep', 'dichchuyen', 'saochep']);
    R(`B.deck = ['lien']; var K = dat(14, 'luutru', 3); K.kho = 5; var N0 = B.ghepN || 0;`); R(js);
    const d = R('K.kho - 5');
    ca('Fusion Archive × ' + ten, n ? '+1 điểm (ghép thật)' : 'không đổi (không phải ghép — luật Star Breaker)', '+' + d, d === n);
  }
  // Teleporter qua lại 20 lần không được nuôi Archive vô hạn
  tran(['luutru', 'dichchuyen', 'lien', 'canon', 'tia']);
  R(`var K = dat(14, 'luutru', 3); K.kho = 0; var t1 = dat(0, 'dichchuyen', 2), l1 = dat(1, 'lien', 2); for (let i = 0; i < 20; i++) ghep(B, t1, B.t[t1.o === 0 ? 1 : 0]);`);
  ca('Teleporter đổi chỗ qua lại 20 lần × Fusion Archive', '0 điểm (không có ghép nào)', R('K.kho'), R('K.kho') === 0);
  // giữ bộ đếm lớn nhất khi ghép cùng loại ra cùng loại (GIU_CONG_DON + hook riêng)
  for (const [id, k, v] of [['hopbi', 'tuoi', 20], ['tienhoa', 'egg', 9], ['cuuvi', 'duoi', 5], ['lualien', 'lc', 4]]) { // (Twin Anvil: ghép đặc biệt riêng — tools/thap-kt-vang-g2.js)
    tran([id]);
    R(`B.deck = ['${id}']; var a = dat(0, '${id}', 2), b = dat(1, '${id}', 2); a.${k} = ${v}; b.${k} = 1; var r = ghep(B, a, b); var N = B.t[1];`);
    const got = R(`N && N.id === '${id}' ? N.${k} || 0 : -1`);
    ca(id + ' + ' + id + ' → ' + id + ': giữ ' + k, 'giữ max (' + v + ')', got, got >= v);
  }
  // Evolver: thẻ "losing a star restarts the countdown" × trùm hạ sao
  tran(['tienhoa', 'lien']); R(`var T = dat(3, 'tienhoa', 4); T.egg = 15; capNhatBan(B, 1/30); haSao(B, T); capNhatBan(B, 1/30);`);
  ca('Evolver × trùm −1★', 'đếm ngược lại từ đầu (egg ≈ 0)', R('T.egg.toFixed(2)'), R('T.egg') < 0.5);
  // Merge King nâng sao Evolver: thẻ "higher stars take longer" nhưng tăng sao giữ thời gian đã chờ
  tran(['tienhoa', 'vughep']); R(`var T = dat(3, 'tienhoa', 3); T.egg = 10; capNhatBan(B, 1/30); var t0 = T.egg; var M = dat(4, 'vughep', 3, 'thuong'); ghep(B, M, T); capNhatBan(B, 1/30);`);
  ca('Evolver × Merge King +1★', 'giữ thời gian đã chờ', R('T.egg.toFixed(2)'), R('T.egg >= t0 - 0.1'));
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
    // khiên 1 lần trên ụ bị nhắm chặn cả phần +mana triệu hồi của Signal Jammer (người dùng chốt CAN-HOI #3 = B)
    const bo = (s) => s;
    const t1 = bo(anhD().replace(/N/g, ''));
    ca((che === 'eve' ? 'Holy Shield' : 'khiên 1 lần') + ' × ' + id + ' (PVP)', 'bàn đối thủ + giá triệu hồi không đổi', t1, t1 === bo(t0.replace(/N/g, '')));
  }
}

// =====================================================================================================
// 8 · CA TỪ ChatGPT (docs/demo-hop-tuong/tuvan/cong-huong/CHATGPT.md) — số [GPT#n] = số ca trong file đó
// =====================================================================================================
const trumMoi = (id, uids) => R(`(() => { const E = { trum: '${id}', ban: B.i, x: 10, y: 10, uid: 88888, kho: 0, knT: 99, d: { co: 40 } }; E.rng = (() => { let s = 3; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })(); E.bao0 = ${JSON.stringify(uids)}.length > 0; E.bao = { t: 1.39, song: 1.4, muc: ${JSON.stringify(uids)} }; capNhatTrum(E, 0.05); return E; })()`);
if (nhom('8 · ca từ ChatGPT')) {
  // GPT#2: 2 Twin Maker ghép → đúng 1 ụ thêm
  tran(['sinhdoi', 'lien', 'canon', 'tia', 'set']); R(`dat(0, 'sinhdoi', 3); dat(1, 'sinhdoi', 3); ghep(B, B.t[0], B.t[1]);`);
  ca('[GPT#2] Twin Maker + Twin Maker', 'đúng 1 ụ thêm (bàn còn 2 ụ)', R('B.t.filter(Boolean).length'), R('B.t.filter(Boolean).length') === 2);
  // GPT#4: MK → 7★ bị từ chối, MK còn; MK vàng → 6★ = 7★
  tran(['vughep', 'lien']); R(`var M = dat(0, 'vughep', 7, 'thuong'), X = dat(1, 'lien', 7);`);
  ca('[GPT#4] Merge King → ụ 7★', 'từ chối, MK còn nguyên', 'hopLe=' + R('hl(M, X)') + ' ghep=' + R('!!ghep(B, M, X)') + ' MK=' + R('!!B.t[0]'), !R('hl(M, X)') && R('B.t[0] === M'));
  tran(['vughep', 'lien']); R(`var M = dat(0, 'vughep', 6, 'vang'), X = dat(1, 'lien', 6); ghep(B, M, X);`);
  ca('[GPT#4] Merge King VÀNG → ụ 6★', '7★ (không 8★)', R('X.sao'), R('X.sao') === 7);
  // GPT#5 / #13: ụ CÂM (Static Jammer) không ghép — kể cả Teleporter / Merge King kéo lên nó, và nó kéo đi
  for (const [ten, js] of [['Teleporter → ụ câm', `var a = dat(0, 'dichchuyen', 3), b = dat(1, 'lien', 3); b.st.kep = 6; b.st.cam = 6;`], ['Merge King → ụ câm', `var a = dat(0, 'vughep', 3, 'thuong'), b = dat(1, 'lien', 3); b.st.kep = 6; b.st.cam = 6;`],
    ['Merge King câm kéo đi', `var a = dat(0, 'vughep', 3, 'thuong'), b = dat(1, 'lien', 3); a.st.kep = 6; a.st.cam = 6;`], ['Twin Anvil câm buff', `var a = dat(0, 'loren', 3), b = dat(1, 'lien', 2); b.sao = 3; a.st.kep = 6; a.st.cam = 6;`], ['ghép thường với ụ câm', `var a = dat(0, 'lien', 3), b = dat(1, 'lien', 3); b.st.kep = 6; b.st.cam = 6;`]]) {
    tran(['vughep', 'dichchuyen', 'loren', 'lien', 'canon']); R(js); const t0 = anh(); const h = R('hl(a, b)'); R('ghep(B, a, b)');
    ca('[GPT#13] ' + ten, 'không ghép, không tốn gì ("no merge")', 'hopLe=' + h + ' · ' + (anh() === t0 ? 'bàn không đổi' : 'bàn đổi'), !h && anh() === t0);
  }
  // GPT#8: Forge ăn Combo Core → không COMBO; ăn Mimic → không ghép
  tran(['loren', 'combo', 'mimic', 'luutru', 'lien']); R(`B.combo = 0; var K = dat(14, 'luutru', 3); K.kho = 0; var F = dat(0, 'loren', 3); var C = dat(1, 'combo', 2); ghep(B, F, C);`);
  ca('[GPT#8] Twin Anvil buff lên Combo Core (08/11)', 'Combo nhận buff, COMBO 0, Archive 0', 'anv=' + R('!!C.anv') + ' combo=' + R('B.combo') + ' kho=' + R('K.kho'), R('!!C.anv') && R('B.combo') === 0 && R('K.kho') === 0);
  // GPT#11: ụ hỗ trợ bị băng → buff ụ kề tắt; tan băng → bật lại
  tran(['radar', 'lien']); R(`var S = dat(7, 'radar', 3), X = dat(8, 'lien', 3); capNhatBan(B, 1/30); var b1 = X.buf.toc; S.st.bang = 0.05; capNhatBan(B, 1/30); var b2 = X.buf.toc; S.st.bang = 0; capNhatBan(B, 1/30); var b3 = X.buf.toc;`);
  ca('[GPT#11] Radar bị băng rồi tan', 'buff tắt khi băng, bật lại đúng 1 lần', [R('b1'), R('b2'), R('b3')].map(x => x.toFixed(2)).join(' → '), R('b1') > 0 && R('b2') < R('b1') && Math.abs(R('b3') - R('b1')) < 1e-9);
  // GPT#12 / CAN-HOI #10 = B: ô BĂNG không nhận buff hỗ trợ (không icon buff giả)
  tran(['radar', 'lien']); R(`var S = dat(7, 'radar', 3), X = dat(8, 'lien', 3, 'bang'), X0 = dat(14, 'lien', 3, 'bang'); capNhatBan(B, 1/30);`);
  ca('[GPT#12] ụ BĂNG cạnh Radar', 'không nhận buff Radar (bằng ụ băng ở xa)', R('X.buf.toc') + ' vs ' + R('X0.buf.toc'), Math.abs(R('X.buf.toc') - R('X0.buf.toc')) < 1e-9 && !R('X.ht'));
  // GPT#14: Eve chặn trước — không tiêu khiên ụ, không tiêu Mirror
  tran(['lien', 'guongcong']); R(`var X = dat(0, 'lien', 3), M = dat(1, 'guongcong', 3); M.nap = 1; X.khien = 1; B.khien = 8;`); chieu('janus', R('[X.uid]'));
  ca('[GPT#14] Eve + Mirror sạc + khiên ụ × Janus', 'Eve chặn; khiên ụ = 1, Mirror còn sạc', 'đá=' + R('X.st.da') + ' khien=' + R('X.khien') + ' nap=' + R('M.nap'), !R('X.st.da') && R('X.khien') === 1 && R('M.nap') === 1);
  // GPT#24: Combo + Mimic → COMBO +1 đúng 1 lần; Combo + Combo +1
  for (const [ten, js] of [['Combo + Mimic', `dat(0, 'combo', 3); dat(1, 'mimic', 3);`], ['Mimic + Combo', `dat(0, 'mimic', 3); dat(1, 'combo', 3);`], ['Combo + Combo', `dat(0, 'combo', 3); dat(1, 'combo', 3);`]]) {
    tran(['combo', 'mimic', 'lien']); R(`B.combo = 0; ${js} ghep(B, B.t[0], B.t[1]);`);
    ca('[GPT#24] ' + ten, 'COMBO +1', R('B.combo'), R('B.combo') === 1);
  }
  // GPT#26: Star Cannon — mốc động tắt khi mất sao
  tran(['ngoisao', 'lien']); R(`var S = dat(0, 'ngoisao', 4); dat(1, 'lien', 3); dat(2, 'lien', 3); capNhatBan(B, 1/30); var t1 = S.buf.toc; haSao(B, B.t[1]); capNhatBan(B, 1/30); var t2 = S.buf.toc;`);
  ca('[GPT#26] Star Cannon đúng mốc 10★ rồi −1★', 'mốc tốc tắt (buff giảm)', R('t1.toFixed(2)') + ' → ' + R('t2.toFixed(2)'), R('t2') < R('t1'));
  // GPT#29: trùm nhắm ụ (uid), ụ bị Teleporter dời trong lúc báo → đá vào đúng ụ ở ô mới
  tran(['dichchuyen', 'lien']); R(`var X = dat(0, 'lien', 3), T = dat(5, 'dichchuyen', 3); var uid = X.uid; ghep(B, T, X);`); chieu('janus', R('[uid]'));
  ca('[GPT#29] Janus nhắm ụ, ụ bị Teleporter dời', 'ụ (ô mới) hoá đá, Teleporter không', 'ụ@' + R('X.o') + ' đá=' + R('X.st.da') + ' tele đá=' + R('T.st.da'), R('X.st.da') && !R('T.st.da'));
  // GPT#30: Joker — bạn cùng sao duy nhất đang khoá → hụt, ụ giữ nguyên
  tran(['lien', 'canon']); R(`var X = dat(0, 'lien', 3), Y = dat(1, 'canon', 3, 'bang');`); const j0 = anh(); chieu('joker_king', R('[X.uid]'));
  ca('[GPT#30] Joker King, bạn cùng sao duy nhất đang băng', 'hụt, không mất ụ', anh(), anh() === j0);
  // GPT#31: Star Leech — khiên chặn; Leech chỉ lấy từ 2★; Eve chặn
  for (const [ten, js, mong] of [['khiên 1 lần', 'X.khien = 1;', 3], ['Holy Shield', 'B.khien = 8;', 3], ['không phòng thủ', '', 2]]) {
    tran(['lien']); R(`var X = dat(0, 'lien', 3); ${js}`); const E = trumMoi('leech', R('[X.uid]'));
    ca('[GPT#31] Star Leech × ' + ten, 'ụ 3★ → ' + mong + '★', R('X.sao') + '★ (leech giữ ' + (E.kho || 0) + ')', R('X.sao') === mong);
  }
  tran(['lien']); R(`var X = dat(0, 'lien', 1);`); const lc = R(`TRUM_KN.leech.chon({ trum: 'leech', uid: 5 }, B, B.t.filter(Boolean))`);
  ca('[GPT#31] Star Leech, bàn chỉ có ụ 1★', 'không nhắm (không về 0★)', JSON.stringify(lc), lc === null || (Array.isArray(lc) && !lc.length));
  // GPT#32: Static Jammer ưu tiên hỗ trợ CÒN hoạt động (bỏ ụ đá)
  tran(['radar', 'lien', 'chimang']); R(`var S1 = dat(0, 'radar', 3, 'da'), S2 = dat(1, 'chimang', 3), A1 = dat(2, 'lien', 5), A2 = dat(3, 'lien', 4);`);
  const jm = R(`TRUM_KN.jammer.chon({ trum: 'jammer', uid: 7 }, B, B.t.filter(T => T && !T.st.da)).map(T => T.id + T.sao)`);
  ca('[GPT#32] Static Jammer chọn mục tiêu', 'hỗ trợ còn chạy trước (chimang3), rồi ụ sao cao (lien5); bỏ ô đá', jm.join(','), jm[0] === 'chimang3' && jm[1] === 'lien5');
  // GPT#38: bàn đầy — Twin / Cloner không đè ô, REINFORCE +1★ ụ yếu nhất
  tran(['sinhdoi', 'nhanban', 'lien', 'canon', 'tia']); R(`for (let o = 0; o < 15; o++) dat(o, 'lien', 2); B.t[0] = null; B.t[1] = null; dat(0, 'sinhdoi', 3); dat(1, 'sinhdoi', 3); var u0 = B.t.filter(Boolean).map(T => T.uid).join(); ghep(B, B.t[0], B.t[1]);`);
  ca('[GPT#38] bàn gần đầy (13 ụ + 2 Twin) ghép Twin', 'ụ cũ giữ nguyên, ≤15 ụ, bàn nhất quán', R('B.t.filter(Boolean).length') + ' ụ ' + R('chk()'), R('chk()') === '' && R('B.t.filter(Boolean).length') <= 15);
  tran(['lien']); R(`for (let o = 0; o < 15; o++) dat(o, 'lien', o === 4 ? 1 : 3); B.mana = 999; B.mv.cd = 0; var g0 = B.mv.gia; var r = CH.dung(B);`);
  ca('[GPT#38] REINFORCE bàn đầy', '+1★ cho 2 ụ yếu nhất, không sinh đè', 'ô4=' + R('B.t[4].sao') + '★ ' + R('chk()'), R('B.t[4].sao') === 2 && R('chk()') === '');
  // GPT#39: REINFORCE không có đích (bàn đầy, mọi ụ 7★ hoặc đá) → không trừ mana, không hồi chiêu
  tran(['lien']); R(`for (let o = 0; o < 15; o++) dat(o, 'lien', o < 3 ? 2 : 7, o < 3 ? 'da' : ''); B.mana = 999; B.mv.cd = 0; var r = CH.dung(B);`);
  ca('[GPT#39] REINFORCE: bàn đầy, chỉ còn ụ 7★ / đá', 'không dùng được, không trừ mana', 'ok=' + R('r.ok') + ' mana=' + R('B.mana'), !R('r.ok') && R('B.mana') === 999);
}

// =====================================================================================================
// 9 · LUẬT NGƯỜI DÙNG CHỐT 07/11 (CAN-HOI.md #1 #3 #6 #7 #8 #10 = B)
// =====================================================================================================
if (nhom('9 · luật người dùng chốt')) {
  // #1 Mimic + Twin Anvil = ghép thường (2 chiều) — Anvil không buff lên Mimic (08/11 giữ luật cũ)
  for (const [ten, js] of [['Mimic kéo lên Anvil', `var a = dat(0, 'mimic', 2), b = dat(1, 'loren', 2);`], ['Anvil kéo lên Mimic', `var a = dat(0, 'loren', 2), b = dat(1, 'mimic', 2);`]]) {
    tran(['loren', 'mimic', 'lien', 'canon', 'tia']); R(js + ' var r = ghep(B, a, b);');
    ca('[#1] ' + ten, 'ghép thường: ra ụ mới 3★ ở ô đích', R('B.t[1] && B.t[1].id + B.t[1].sao') + ' ô0=' + R('!!B.t[0]'), R('B.t[1] && B.t[1].sao') === 3 && !R('B.t[0]'));
  }
  tran(['loren', 'lien']); R(`var F = dat(0, 'loren', 3); dat(1, 'lien', 3); var h = hl(B.t[1], F);`);
  ca('[#1] ụ thường kéo lên Anvil (08/11)', 'không ghép được (chỉ Anvil kéo đi)', R('h'), !R('h'));
  // #6 Mirror phản Kẹp → ụ đối thủ có khiên / Holy Shield bị chặn; không phản dây chuyền
  for (const [ten, js, mongKep] of [['đối thủ không phòng thủ', '', true], ['ụ đối thủ có khiên', 'R0.khien = 1;', false], ['đối thủ Holy Shield', 'D.khien = 8;', false], ['đối thủ cũng có Mirror sạc', 'const M2 = dat(14, "guongcong", 3, "", D); M2.nap = 1;', true]]) {
    tran(['kepha', 'guongcong', 'lien', 'canon', 'tia'], 'pvp');
    R(`var M = dat(14, 'guongcong', 3); M.nap = 1; dat(0, 'lien', 5); var R0 = dat(0, 'lien', 6, '', D); ${js} { const a = dat(5, 'kepha', 3, '', D), b = dat(6, 'kepha', 3, '', D); ghep(D, a, b); }`);
    const kep = R('R0.st.kep > 0'), m2 = R('(D.t[14] && D.t[14].id === "guongcong") ? D.t[14].nap : -1');
    ca('[#6] Mirror phản Kẹp × ' + ten, (mongKep ? 'ụ mạnh nhất đối thủ bị Kẹp' : 'phản bị chặn, không Kẹp') + (m2 >= 0 ? ', Mirror bên kia KHÔNG bị dùng (không dây chuyền)' : ''), 'kep=' + kep + ' khien=' + R('R0.khien') + (m2 >= 0 ? ' mirror2=' + m2 : ''), kep === mongKep && (m2 < 0 || m2 === 1));
  }
  // #7 ụ khoá không nhận trạng thái xấu mới
  tran(['lien', 'canon']); R(`var X = dat(0, 'lien', 3, 'bang'), Y = dat(1, 'lien', 3);`); chieu('octopus', R('[X.uid, Y.uid]'));
  ca('[#7] Octopus × ụ băng', 'ụ băng không cháy, ụ thường cháy', 'băng cháy=' + R('X.st.lua > 0') + ' thường cháy=' + R('Y.st.lua > 0'), !R('X.st.lua > 0') && R('Y.st.lua > 0'));
  tran(['lien']); R(`var X = dat(0, 'lien', 3, 'bang');`); chieu('janus', R('[X.uid]'));
  ca('[#7] Janus × ụ băng', 'không hoá đá', R('X.st.da'), !R('X.st.da'));
  tran(['lien', 'radar']); R(`var X = dat(0, 'radar', 3, 'bang'), Y = dat(1, 'lien', 3);`); const jm = R(`TRUM_KN.jammer.chon({ trum: 'jammer', uid: 7 }, B, B.t.filter(T => T && !T.st.da)).map(T => T.id)`);
  ca('[#7] Static Jammer × ụ hỗ trợ băng', 'bỏ ụ băng, câm ụ khác', jm.join(','), !jm.includes('radar'));
  tran(['kepha', 'lien'], 'pvp'); R(`var X = dat(0, 'lien', 6, 'bang', D), Y = dat(1, 'lien', 2, '', D); { const a = dat(5, 'kepha', 3), b = dat(6, 'kepha', 3); ghep(B, a, b); }`);
  ca('[#7] Clamp PVP × ụ đối thủ đang băng', 'ụ băng không bị Kẹp, Kẹp sang ụ khác', 'băng=' + R('X.st.kep > 0') + ' khác=' + R('Y.st.kep > 0'), !R('X.st.kep > 0') && R('Y.st.kep > 0'));
  // #7 (làm rõ 13:31): ụ ĐÁ / BĂNG không nhận trạng thái xấu MỚI, nhưng HẠ SAO vẫn trúng
  for (const k of ['da', 'bang']) {
    const ten = k === 'da' ? 'đá' : 'băng';
    tran(['lien']); R(`var X = dat(0, 'lien', 3, '${k}');`); chieu('octopus', R('[X.uid]'));
    ca('[#7] Octopus cháy × ụ ' + ten, 'bỏ qua (không cháy)', R('X.st.lua'), !(R('X.st.lua') > 0));
    tran(['lien']); R(`var X = dat(0, 'lien', 3, '${k}');`); chieu('nightmare', R('[X.uid]'));
    ca('[#7] Nightmare −1★ × ụ ' + ten, 'vẫn mất 1★ (3 → 2), giữ khoá', R('X.sao') + '★ khoá=' + R('biKhoa(X)'), R('X.sao') === 2 && R('biKhoa(X)'));
    tran(['lien']); R(`var X = dat(0, 'lien', 3, '${k}');`); trumMoi('leech', R('[X.uid]'));
    ca('[#7] Star Leech lấy 1★ × ụ ' + ten, 'vẫn mất 1★', R('X.sao') + '★', R('X.sao') === 2);
    tran(['lien']); R(`var X = dat(0, 'lien', 3, '${k}'); haSao(B, X);`);
    ca('[#7] haSao trực tiếp × ụ ' + ten, 'vẫn mất 1★', R('X.sao') + '★', R('X.sao') === 2);
  }
  tran(['nguyenrua', 'lien'], 'pvp'); R(`var X = dat(0, 'lien', 3, 'bang', D); G.hu.push({ k: 'hexBay', t: 0, song: 0.01, B, x0: 0, y0: 0, D, uid: X.uid, o: X.o, cuoc: true, kieu: 'pvp' });`); buoc(0.2);
  ca('[#7] Hex PVP −1★ × ụ đối thủ băng', 'vẫn mất 1★', R('X.sao') + '★', R('X.sao') === 2);
  tran(['nguyenrua', 'lien'], 'pvp'); R(`var X = dat(0, 'lien', 1, 'bang', D); G.hu.push({ k: 'hexBay', t: 0, song: 0.01, B, x0: 0, y0: 0, D, uid: X.uid, o: X.o, cuoc: true, kieu: 'pvp' });`); buoc(0.2);
  ca('[#7] Hex PVP tê liệt (ụ 1★) × ụ băng', 'không tê (trạng thái xấu mới)', R('X.hexT || 0'), !(R('X.hexT') > 0));
  // #8 REINFORCE bàn đầy bỏ ụ băng
  tran(['lien']); R(`for (let o = 0; o < 15; o++) dat(o, 'lien', o === 4 ? 1 : 3, o === 4 ? 'bang' : ''); B.t[5].sao = 2; B.mana = 999; B.mv.cd = 0; CH.dung(B);`);
  ca('[#8] REINFORCE bàn đầy, ụ yếu nhất đang băng', 'bỏ ụ băng (vẫn 1★), nâng ụ thường yếu kế', 'băng=' + R('B.t[4].sao') + '★ ô5=' + R('B.t[5].sao') + '★', R('B.t[4].sao') === 1 && R('B.t[5].sao') === 3);
}

// =====================================================================================================
// 10 · JACKPOT CŨ ĐÃ BỎ (08/11 người dùng: jackpot chỉ còn là cơ chế của Lucky Slot — tools/thap-kt-co-bac.js):
//      Orbital Cascade / Chain Reactor / True North / Six Seals→Royal Vault / Loaded Dice / Perfect Frequency không còn kích · Six Seals (túi xáo) giữ · cộng gộp
// =====================================================================================================
if (nhom('10 · jackpot')) {
  const coJP = (x) => R(`!!(${x} && ${x}.jp && Object.keys(${x}.jp).length)`);
  const nap = () => R(`var deckX = (BB) => { (BB || B).deck = ['lien', 'canon', 'tia', 'set', 'bao']; };`);
  ca('[JP] khung jackpot cũ', 'không còn JP', R("typeof JP"), R("typeof JP === 'undefined'"));
  tran(['orbital', 'lien', 'canon', 'tia', 'set']); nap(); R('deckX()');
  R(`var jO = dat(5, 'orbital', 3); ghep(B, dat(0, 'orbital', 2), dat(1, 'orbital', 2)); ghep(B, dat(2, 'orbital', 2), dat(3, 'orbital', 2));`); buoc(0.05);
  ca('[JP] ORBITAL CASCADE đã bỏ: 2 ghép trong 1 lần thức tỉnh', 'không có jackpot', coJP('jO'), !coJP('jO'));
  tran(['lienket', 'lien', 'canon', 'tia', 'set']); nap();
  R(`var jL = []; for (let i = 0; i < 4; i++) jL.push(dat(i, 'lienket', 3)); var jE1 = sinhQuai('bo', G.duong.findIndex(p => p.ban === 0), 50); jE1.vao = 1; jE1.hp = jE1.max = 1e9;
    for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) trung(jE1, 1, { B, T: jL[i], crit: false });`); buoc(0.05);
  ca('[JP] CHAIN REACTOR đã bỏ: nhóm 4 × 3 đòn', 'không có jackpot', R('jL.some(X => X.jp)'), !R('jL.some(X => X.jp)'));
  const tn = (ds) => { tran(['canon', 'lien', 'tia', 'set', 'bao']); nap(); R('var jK = dat(14, "canon", 3); jK.hb = 1;');
    ds.forEach(([ha, hb], i) => { R(`{ const a = dat(${i * 2}, 'canon', 1), b = dat(${i * 2 + 1}, 'canon', 1); a.hb = ${ha}; b.hb = ${hb}; ghep(B, a, b); }`); }); buoc(0.05); };
  tn([[1, 4], [1, 2], [3, 12]]); ca('[JP] TRUE NORTH đã bỏ: 3 ghép, lần 3 ra NSWE', 'không có jackpot nào trên Pháo La Bàn', R('JSON.stringify(jK.jp || {})'), !coJP('jK'));
  const ss = (hat) => { tran(['pandora', 'lien', 'canon', 'tia', 'set']); nap(); R('deckX()'); R(`G.hat = ${hat}; var jA = dat(14, 'lien', 5); var mo = [];`);
    for (let i = 0; i < 6; i++) { R(`B.mana = 0; ghep(B, dat(0, 'pandora', 1), dat(1, 'pandora', 1)); mo.push(B._pd.slice());`); buoc(1); } };
  ss(11); const ss1 = R('mo.map(x => x.join("+")).join(" ")');
  ca('[JP] SIX SEALS 6 lần mở (ROYAL VAULT đã bỏ)', 'đủ 6 phép không lặp, không có dấu 6, ụ Tấn công không nhận jackpot', ss1 + ' jp=' + coJP('jA'),
    new Set(R('mo.map(x => x[0])')).size === 6 && !R('mo.some(x => x.includes(6))') && !coJP('jA'));
  ss(11); ca('[JP] SIX SEALS tất định (cùng hạt → cùng thứ tự)', 'giống lần trước', R('mo.map(x => x.join("+")).join(" ")'), R('mo.map(x => x.join("+")).join(" ")') === ss1);
  tran(['xucxac', 'lien']); nap(); R('var X = dat(0, "xucxac", 3); var Ex = sinhQuai("bo", G.duong.findIndex(p => p.ban === 0), 50); Ex.vao = 1; Ex.hp = Ex.max = 1e9; Ex.d = Object.assign({}, Ex.d, { v: 0 });'); buoc(20);
  ca('[JP] LOADED DICE đã bỏ: Pháo May Rủi bắn 20 s', 'không có jackpot', coJP('X'), !coJP('X') && !R('/LOADED/.test(SKILLS.xucxac.mo())'));
  tran(['radar', 'lien', 'canon', 'tia', 'set']); nap(); R(`var jRD = dat(7, 'radar', 3); var jK4 = ['lien', 'canon', 'tia', 'lien'].map((id, i) => dat([2, 6, 8, 12][i], id, 3));`); buoc(9);
  ca('[JP] PERFECT FREQUENCY đã bỏ: 4 ụ Tấn công 3 loại giữ 9 s', 'không có jackpot', R('jK4.some(X => X.jp)'), !R('jK4.some(X => X.jp)'));
  // 9 ĐỘT PHÁ theo độ khó (08/11: Choir / Forge bỏ đột phá — Harmony / Twin Anvil làm lại)
  { const b = R('JSON.stringify(DOTPHA.thuong(4, "lualien"))'), c = R('JSON.stringify(DOTPHA.thuong(4, "cuuvi"))');
    ca('[JP] ĐỘT PHÁ IV theo độ khó', 'Ember (3) < Nine-Tail (4)', b + ' ' + c, R('DOTPHA.thuong(4,"lualien").cdmg < DOTPHA.thuong(4,"cuuvi").cdmg && DOTPHA.thuong(4,"lualien").cdmg === 0.8')); }
  // CỘNG DỒN DO HÀNH ĐỘNG = RIÊNG TỪNG Ụ (người dùng 18:57): Leviathan nuốt → chỉ ụ đó +ABYSS; ụ mới 0; ghép 2 Leviathan ra Leviathan giữ số lớn hơn
  tran(['leviathan', 'lien']); nap(); R(`var LA = dat(0, 'leviathan', 3), LB = dat(1, 'leviathan', 3); LA.vuc = 10; var EQ = sinhQuai('bo', G.duong.findIndex(p => p.ban === 0), 50); EQ.vao = 1;
    HU.xoay.cap(G, { E: EQ, T: LA, B, t: 9, song: 1, da: false }, 0);`); buoc(0.05);
  ca('[ABYSS riêng] Leviathan A nuốt', 'chỉ A +1 (11), B vẫn 0', R('LA.vuc') + '/' + R('LB.vuc'), R('LA.vuc') === 11 && R('LB.vuc') === 0);
  R('var LC = dat(2, "leviathan", 1);'); buoc(0.05); ca('[ABYSS riêng] Leviathan mới triệu hồi', 'bắt đầu 0', R('LC.vuc'), R('LC.vuc') === 0);
  R('B.deck = ["leviathan"]; LB.vuc = 4; var LR = ghep(B, LA, LB);'); buoc(0.05); ca('[ABYSS riêng] ghép 2 Leviathan ra Leviathan', 'giữ số LỚN HƠN (11), không cộng', R('LR.id') + ' ' + R('LR.vuc'), R('LR.id') === 'leviathan' && R('LR.vuc') === 11);
  R('B.deck = ["lien"]; var LD = dat(3, "leviathan", 2); LD.vuc = 30; var LE = dat(4, "leviathan", 2); LE.vuc = 5; var LF = ghep(B, LD, LE); var LG = dat(5, "leviathan", 1);'); buoc(0.05);
  ca('[ABYSS riêng] ghép Leviathan ra ụ khác rồi triệu hồi Leviathan mới', 'điểm mất, Leviathan mới 0', R('LF.id') + ' / mới ' + R('LG.vuc'), R('LF.id') !== 'leviathan' && R('LG.vuc') === 0);
  // CỘNG GỘP: ngăn quả Lucky Slot vào CHUNG nhóm với buff khác (không nhân riêng)
  tran(['cobac', 'radar']); nap(); R('var X = dat(0, "cobac", 3); X.cbS = 3; X.cbQuay = 0;'); buoc(0.05);
  { const d0 = R('dmgU(X)'), b0 = R('X.buf.dmg'); R('X.aurora = 8; B.cb = [80, 0, 0];'); buoc(1 / 30);
    const d1 = R('dmgU(X)'), mi = R('knThe(B, "mimic") / 100'), b = R('X.buf.dmg');
    ca('[JP] cộng gộp: Mimic + ngăn quả Lucky Slot + buff khác cùng nhóm sát thương', 'dmg = gốc × (1 + tổng)', (d1 / d0).toFixed(3) + ' vs ' + ((1 + b + mi) / (1 + b0)).toFixed(3), b - b0 > 2.3 && Math.abs(d1 / d0 - (1 + b + mi) / (1 + b0)) < 0.01); }
}

// ===== jKẾT =====
const sai = KQ.filter(k => !k.ok);
if (process.env.JSON_OUT) fs.writeFileSync(process.env.JSON_OUT, JSON.stringify(KQ, null, 1));
console.log(sai.length ? '✗ thap-kt-cong-huong-luat: ' + sai.length + '/' + KQ.length + ' cặp lệch luật' : '✓ thap-kt-cong-huong-luat: đạt (' + KQ.length + ' cặp)');
process.exit(sai.length ? 1 : 0);
