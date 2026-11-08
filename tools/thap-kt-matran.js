// TURRET MERGE — MA TRẬN TƯƠNG TÁC (trạng thái ụ × sự kiện biến/thay/nhân/dời/sinh ụ) — kiểm TỰ ĐỘNG từng cặp
//  Luật: docs/demo-hop-tuong/tuvan/tuong-tac/MA-TRAN.md (bảng trong file đó do chính tool này sinh: GHI_MD=1)
//  Cách kiểm 1 cặp (trạng thái S × sự kiện E): dựng bàn không đầu (RNG gieo hạt), chạy E 2 lần cùng hạt — ĐỐI CHỨNG (ụ không có S) và THẬT (ụ có S):
//    giu  = sau E, ụ kết quả CÓ S            · mat = ụ kết quả giống hệt đối chứng về S (S không mang sang)
//    chan = E KHÔNG xảy ra (ụ đứng yên)       · na  = cặp không thể có trong trận (ghi lý do)
//  Đối chứng phải xảy ra E (nếu không: cặp bị bỏ là "không áp dụng" — đếm riêng, không tính là đạt).
//  Ụ kết quả là BẢN SAO → còn kiểm: sát thương = ụ thật cùng loại/sao × % sao chép, dải xem nhanh có dấu Copycat + %.
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-matran.js   (GHI_MD=1: ghi lại bảng MA-TRAN.md)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const MD = path.join(__dirname, '..', 'docs/demo-hop-tuong/tuvan/tuong-tac/MA-TRAN.md');

// ---------------------------------------------------------------- TRẠNG THÁI (A) — đọc từ code (game.js taoU + skills*.js + vangmoi1.js + trum.js)
const TT = [
  ['banSao', 'Bản sao Copycat (−% sức mạnh, quầng tím + dấu Copycat)', 'T.banSao'],
  ['da', 'Hoá đá (Janus Cube)', 'T.st.da'],
  ['bang', 'Đóng băng (Freezer / Frost)', 'T.st.bang'],
  ['vang', 'Merge King VÀNG (+2★)', 'T.vang'],
  ['thuc', 'Werewolf THỨC TỈNH', 'T.thuc'],
  ['orbThuc', 'Orbital đang thức tỉnh (đếm giây)', 'T.thucT'],
  ['epxung', 'Overclock (+% tốc vĩnh viễn)', 'T.epxung'],
  ['aurora', 'Buff Mimic sau ghép (8 s)', 'T.aurora'],
  ['khien', 'Khiên 1 lần (Shield Gen / Sanctum / Pandora)', 'T.khien'],
  ['tocT', 'Bùng tốc tạm (Jammer co-op, Ember Relay, Pandora, Star Breaker…)', 'T.tocT'],
  ['giam', 'Giảm tốc tạm (Star Breaker PVP)', 'T.giamT'],
  ['kep', 'Kẹp/xích (Jammer PVP, trùm Jammer)', 'T.st.kep'],
  ['lua', 'Cháy (trùm Octopus: hết giờ −1★)', 'T.st.lua'],
  ['hex', 'Tê liệt Hex Saboteur', 'T.hexT'],
  ['lo', 'Lò Scrap Forge (điểm ăn)', 'T.lo'],
  ['lc', 'Lửa Ember Relay', 'T.lc'],
  ['kho', 'Điểm lưu Fusion Archive', 'T.kho'],
  ['cmSo', 'Tổ hợp hướng + stack Pháo La Bàn (08/11)', 'T.hb + T.cmC'],
];
// ---------------------------------------------------------------- SỰ KIỆN (B)
const SK = [
  ['ghepKeo', 'Ghép thường — ụ có trạng thái là ụ KÉO'],
  ['ghepDich', 'Ghép thường — ụ có trạng thái là ụ ĐÍCH'],
  ['ghepMimic', 'Ghép với Mimic'],
  ['twin', 'Twin Maker: ụ sinh đôi khi ghép'],
  ['cloner', 'Cloner: ụ tặng khi ghép'],
  ['mkLen', 'Merge King kéo LÊN ụ (+★)'],
  ['mkKeo', 'Merge King có trạng thái bị kéo đi (+★ cho ụ khác)'],
  ['teleLen', 'Teleporter kéo lên ụ (đổi chỗ)'],
  ['teleKeo', 'Teleporter có trạng thái tự đổi chỗ'],
  ['copyLen', 'Copycat chép ụ có trạng thái'],
  ['copyKeo', 'Copycat có trạng thái đi chép ụ khác'],
  ['ocLen', 'Overclock lên ụ'],
  ['mauhut', 'Blood Circuit hiến ụ (2 ụ → 1 ụ ngẫu nhiên)'],
  ['forge', 'Scrap Forge ăn ụ'],
  ['hopMo', 'Mystery Box hết giờ → ụ ngẫu nhiên'],
  ['tienHoa', 'Evolver hết giờ → ụ ngẫu nhiên +★'],
  ['xaoTron', 'Scrambler SOLO (biến ụ lẻ của mình thành cặp)'],
  ['xaoCoop', 'Scrambler CO-OP (biến ụ lẻ của đồng đội)'],
  ['xaoPVP', 'Scrambler PVP (biến ụ đối thủ)'],
  ['madCrown', 'Trùm Mad Crown biến ụ'],
  ['joker', 'Trùm Joker King ném Mimic + ép ghép'],
  ['janus', 'Trùm Janus hoá đá'],
  ['freezer', 'Trùm Freezer đóng băng'],
  ['nightmare', 'Trùm Nightmare −1★'],
  ['leech', 'Trùm Star Leech lấy 1★'],
  ['nangSao', '+1★ bằng kỹ năng (REINFORCE / Pandora / Genesis / Star Lift — cùng hàm nangSao)'],
  ['eve', 'Chỉ huy Eve HOLY SHIELD (tẩy)'],
  ['sanctum', 'Sanctum xuất hiện cạnh ụ (tẩy + khiên)'],
  ['cleanser', 'Cleanser tẩy ụ kề'],
  ['onlCung', 'ONLINE: ảnh chụp bàn sửa cờ ô (cùng loại)'],
  ['onlKhac', 'ONLINE: con rối nhận ụ khác loại (vd. Hộp Bí Ẩn mở bên máy bạn)'],
];
const KHOA = new Set(['da', 'bang']);
const TAM = new Set(['epxung', 'aurora', 'tocT', 'giam', 'kep', 'lua', 'hex', 'orbThuc', 'lo', 'lc', 'kho', 'cmSo']);
const DONG_BO = new Set(['banSao', 'da', 'vang', 'thuc', 'epxung', 'lo', 'lc', 'kho', 'cmSo']); // cờ đi qua mạng (dongbo.js oTT/datO)
// ---------------------------------------------------------------- LUẬT (mặc định DCDW-lean; chú thích ngắn = lý do)
function luat(s, e, r) {
  const L = (k, ly) => ({ k, ly: ly || '' });
  // khoá (đá / băng)
  if (KHOA.has(s)) {
    if (['mkLen', 'teleLen', 'nangSao'].includes(e)) return L('giu', 'chỉ đổi sao/chỗ, khoá giữ nguyên');
    if (['janus', 'freezer', 'nightmare', 'leech'].includes(e)) return s === 'da' ? L('na', 'trùm không nhắm ô đá') : e === 'freezer' ? L('na', 'đã băng') : e === 'janus' ? L('chan', 'ụ khoá không nhận trạng thái xấu mới (người dùng chốt 07/11)') : L('giu', 'hạ sao vẫn trúng ụ đang băng');
    if (['eve', 'sanctum', 'cleanser'].includes(e)) return L('mat', 'được tẩy');
    if (['onlCung', 'onlKhac'].includes(e)) return s === 'da' ? L('giu', 'cờ S') : L('na', 'băng do trùm chạy y hệt 2 máy');
    if (e === 'copyLen') return s === 'da' ? L('chan', 'Copycat KHÔNG chép ô đá (luật 08/11); ô băng vẫn chép được') : L('mat', 'Copycat chép được ô băng → bản sao THƯỜNG đúng loại thật, ô gốc giữ khoá (9d79bd2, copycat-da/DCDW.md)');
    if (e === 'forge' || e === 'mauhut') return L('chan', 'ô khoá không bị kéo lên');
    return L('chan', 'khoá chặn kỹ năng, ghép, biến hình');
  }
  if (s === 'khien') {
    if (['madCrown', 'joker', 'janus', 'freezer', 'nightmare'].includes(e)) return L('chan', 'khiên chặn chiêu trùm (khiên mất)');
    if (['ghepKeo', 'ghepDich', 'ghepMimic', 'twin', 'cloner', 'mauhut', 'forge', 'joker', 'copyLen', 'xaoPVP'].includes(e)) return e === 'xaoPVP' ? L('chan', 'khiên chặn phá của đối thủ') : L('mat', e === 'copyLen' ? 'bản sao lấy khiên của thân Copycat' : e === 'forge' ? 'ụ bị ăn' : 'ụ mới');
    if (['onlCung', 'onlKhac'].includes(e)) return L('na', 'khiên chạy y hệt 2 máy');
    if (e === 'mkKeo') return L('mat', 'Merge King biến mất');
    return L('giu', ['hopMo', 'tienHoa', 'xaoTron', 'xaoCoop'].includes(e) ? 'biến tại chỗ giữ khiên' : 'cùng thân');
  }
  if (s === 'vang' && (e === 'ghepKeo' || e === 'ghepDich')) return L('giu', 'Merge King + Merge King = 1 Merge King +1★, giữ vàng');
  if (s === 'cmSo') { // Pháo La Bàn: ghép Pháo vào Pháo = ụ ĐÍCH +1★ giữ mũi tên của đích; số theo cùng/vuông/ngược hướng
    if (e === 'ghepDich') return L('giu', 'ụ đích giữ mũi tên (ngược hướng: số trừ, tối thiểu 1 + sóng nổ)');
    if (e === 'ghepKeo') return L('mat', 'ụ kéo mất; đích giữ mũi tên của đích');
    if (e === 'copyLen') return L('ngau', 'bản sao = lần xuất hiện mới: 1 hướng ngẫu nhiên, 0 stack (08/11)');
  }
  // ghép 2 ụ CÙNG LOẠI ra đúng loại đó: giữ max cộng dồn Overclock (BAO-CAO gioi-han §4 mục 6, game.js GIU_CONG_DON)
  if (s === 'epxung' && (e === 'ghepKeo' || e === 'ghepDich') && r && r.id === (LOAI_TT[s] || 'lien')) return L('giu', 'ghép cùng loại ra cùng loại: giữ Ép Xung lớn nhất');
  // ghép = ụ MỚI; Blood Circuit / Forge / Twin / Cloner cũng là ụ mới
  if (['ghepKeo', 'ghepDich', 'ghepMimic', 'twin', 'cloner', 'mauhut', 'forge', 'joker'].includes(e)) return L('mat', e === 'forge' ? 'ụ bị ăn' : e === 'joker' ? 'bị ép GHÉP → ụ mới' : 'ghép ra ụ mới');
  if (e === 'mkKeo') return L('mat', 'Merge King biến mất, ụ đích không nhận gì');
  if (['onlCung', 'onlKhac'].includes(e)) {
    if (DONG_BO.has(s)) { if (e === 'onlKhac' && ['vang', 'thuc', 'lo', 'lc', 'kho', 'cmSo'].includes(s)) return L('na', 'cờ riêng của loại đó'); return L('giu', 'cờ ô qua mạng'); }
    return L('na', 'tạm, chạy y hệt 2 máy');
  }
  if (s === 'banSao') {
    if (['hopMo', 'tienHoa', 'xaoTron', 'xaoCoop', 'xaoPVP', 'madCrown'].includes(e)) return L('giu', 'BIẾN tại chỗ: bản sao vẫn là bản sao (lỗi cũ: mất −%)');
    return L('giu', 'cùng thân');
  }
  if (s === 'vang' || s === 'thuc') {
    if (['hopMo', 'tienHoa'].includes(e)) return L('na', 'ụ là Hộp/Evolver');
    if (['xaoTron', 'xaoCoop', 'xaoPVP', 'madCrown'].includes(e)) return L('mat', 'thành loại khác');
    if (e === 'copyLen') return L('ngau', 'bản sao QUAY LẠI dạng ngẫu nhiên lúc sinh (người dùng 08/11) — có thể trùng hoặc khác gốc');
    if (e === 'copyKeo') return L('na', 'Copycat không có dạng này');
    return L('giu', 'cùng thân');
  }
  // buff/debuff tạm + bộ đếm riêng
  if (s === 'hex' && (e === 'hopMo' || e === 'tienHoa')) return L('chan', 'tê liệt: đồng hồ dừng (như băng) tới khi hết 2.5 s');
  if (e === 'copyLen') return L('mat', 'thân mới: không chép buff/bộ đếm của ụ gốc');
  if (e === 'copyKeo') return ['aurora', 'epxung'].includes(s) ? L('giu', 'buff trên thân Copycat đi theo bản sao (DCDW)') : L('mat', 'thân mới');
  if (['hopMo', 'tienHoa', 'xaoTron', 'xaoCoop', 'xaoPVP', 'madCrown'].includes(e)) return L('mat', 'biến hình: buff/đếm của thân cũ hết');
  if (e === 'eve') return s === 'lua' ? L('mat', 'được tẩy') : L('giu', 'không phải hiệu ứng xấu Eve tẩy');
  if (e === 'sanctum') return ['kep', 'lua', 'giam', 'hex'].includes(s) ? L('mat', 'được tẩy') : L('giu', 'không xấu');
  if (e === 'cleanser') return ['kep', 'lua', 'giam'].includes(s) ? L('mat', 'được tẩy') : L('giu', 'không xấu');
  if (e === 'ocLen' && s === 'epxung') return L('giu', 'cộng dồn');
  return L('giu', 'cùng thân');
}
const LOAI_TT = { vang: 'vughep', thuc: 'soi', orbThuc: 'orbital', lo: 'loren', lc: 'lualien', kho: 'luutru', cmSo: 'canon' };
const LOAI_SK = { mkKeo: 'vughep', teleKeo: 'dichchuyen', copyKeo: 'saochep', hopMo: 'hopbi', tienHoa: 'tienhoa', twin: 'sinhdoi', cloner: 'nhanban' };

// ---------------------------------------------------------------- chạy trong trang
function trongTrang(arg) {
  const { TT, SK, LOAI_TT, LOAI_SK } = arg;
  const B = G.ban[0], D = G.ban[1];
  const r0 = Math.random;
  const DAT = {
    banSao: T => { T.banSao = true; }, da: T => { T.st.da = true; }, bang: T => { T.st.bang = 999; },
    vang: T => { T.vang = true; }, thuc: T => { T.thuc = true; }, orbThuc: T => { T.thucT = 20; },
    epxung: T => { T.epxung = 0.65; }, aurora: T => { T.aurora = 8; }, khien: T => { T.khien = 1; },
    tocT: T => { T.tocT = 6; T.tocV = 0.2; }, giam: T => { T.giamT = 6; T.giamV = 0.08; }, kep: T => { T.st.kep = 5; },
    lua: T => { T.st.lua = 5; }, hex: T => { T.hexT = 2; }, lo: T => { T.lo = 5; }, lc: T => { T.lc = 3; }, kho: T => { T.kho = 33; }, cmSo: T => { T.hb = 15; T.cmC = 4; },
  };
  const CO = {
    banSao: T => !!T.banSao, da: T => !!T.st.da, bang: T => T.st.bang > 0, vang: T => !!T.vang, thuc: T => !!T.thuc, orbThuc: T => T.thucT > 0,
    epxung: T => T.epxung > 0.6, aurora: T => T.aurora > 0, khien: T => T.khien > 0, tocT: T => T.tocT > 0 && T.tocV >= 0.2, giam: T => T.giamT > 0,
    kep: T => T.st.kep > 0, lua: T => T.st.lua > 0, hex: T => T.hexT > 0, lo: T => T.lo >= 5, lc: T => T.lc >= 3, kho: T => T.kho >= 33, cmSo: T => T.id === 'canon' && T.hb === 15 && T.cmC >= 4,
  };
  const xoa = () => { for (const X of G.ban) for (let i = 0; i < 15; i++) X.t[i] = null; G.quai = []; B.khien = 0; if (D) D.khien = 0; B.hero = []; G.bay.length = 0; };
  const dat = (X, o, id, sao) => { const T = sinhU(taoU(X, id, sao, o)); T.vxA = null; if (T.id === 'vughep') T.vang = false; if (T.id === 'soi') T.thuc = false; if (T.id === 'canon') { T.hb = 1; T.cmC = 0; } X.t[o] = T; return T; }; // Pháo La Bàn: mũi tên ↑ số 1 cố định (đối chứng tất định)
  const fakeE = (trum, T) => ({ trum, x: 200, y: 200, kho: 0, d: { v: 1, co: 40 }, v0: 1, bao: { muc: [T.uid], muc2: [] }, rng: rngHat(77) });
  // mỗi sự kiện: (X = ụ có/không trạng thái, ở ô 7 bàn B — xaoPVP: bàn D) → { kq: ụ kết quả hoặc null, xay: có xảy ra }
  const EV = {
    ghepKeo(X) { const P = dat(B, 8, X.id, X.sao); const r = ghep(B, X, P); return { kq: B.t[8], xay: !!r }; },
    ghepDich(X) { const P = dat(B, 8, X.id, X.sao); const r = ghep(B, P, X); return { kq: B.t[7], xay: !!r }; },
    ghepMimic(X) { const P = dat(B, 8, 'mimic', X.sao); const r = ghep(B, X, P); return { kq: B.t[8], xay: !!r }; },
    twin(X) { const P = dat(B, 8, 'sinhdoi', X.sao); B._tw = null; const r = ghep(B, X, P); const tw = B._tw; return { kq: tw ? B.t[tw.o] : null, xay: !!(r && tw) }; },
    cloner(X) { const P = dat(B, 8, 'nhanban', X.sao); const truoc = B.t.map(Boolean); const r = ghep(B, X, P); const o = B.t.findIndex((T, i) => T && !truoc[i] && i !== 8); return { kq: o >= 0 ? B.t[o] : null, xay: !!(r && o >= 0) }; },
    mkLen(X) { const M = dat(B, 8, 'vughep', X.sao); const s0 = X.sao; ghep(B, M, X); return { kq: B.t[7], xay: !!B.t[7] && B.t[7].sao === s0 + 1 }; },
    mkKeo(X) { const P = dat(B, 8, 'canon', X.sao); ghep(B, X, P); return { kq: B.t[8], xay: !B.t[7] && B.t[8].sao > X.sao }; },
    teleLen(X) { const P = dat(B, 8, 'dichchuyen', X.sao); ghep(B, P, X); return { kq: B.t[8], xay: B.t[8] === X }; },
    teleKeo(X) { dat(B, 8, 'canon', X.sao); ghep(B, X, B.t[8]); return { kq: B.t[8], xay: B.t[8] === X }; },
    copyLen(X) { const C = dat(B, 8, 'saochep', X.sao); ghep(B, C, X); const k = B.t[8]; return { kq: k, xay: !!k && k !== C && k.id === X.id }; },
    copyKeo(X) { dat(B, 8, 'canon', X.sao); ghep(B, X, B.t[8]); const k = B.t[7]; return { kq: k, xay: !!k && k.id === 'canon' }; },
    ocLen(X) { const O = dat(B, 8, 'epxung', X.sao); const e0 = X.epxung; ghep(B, O, X); return { kq: B.t[7], xay: B.t[7] === X && X.epxung > e0 }; },
    mauhut(X) { const M = dat(B, 8, 'mauhut', X.sao); ghep(B, M, X); return { kq: B.t[7], xay: B.t[7] !== X && !B.t[8] }; },
    forge(X) { const F = dat(B, 8, 'loren', 3); ghep(B, F, X); return { kq: B.t[7], xay: !B.t[7] }; },
    hopMo(X) { X.tuoi = 999; capNhatU(B, X, 0.02); return { kq: B.t[7], xay: !!B.t[7] && B.t[7] !== X }; },
    tienHoa(X) { X.tuoi = 999; capNhatU(B, X, 0.02); return { kq: B.t[7], xay: !!B.t[7] && B.t[7] !== X }; },
    xaoTron(X) { const che = G.che, gb = G.ban; G.che = 'solo'; G.ban = [B]; const Y = dat(B, 8, X.id === 'lien' ? 'canon' : 'lien', X.sao); const ra = taoU(B, 'xaotron', 2, 14); const id0 = X.id;
      try { SKILLS.xaotron.ghep(G, B, ra, ra, ra); } finally { G.che = che; G.ban = gb; } const k = B.t[7]; return { kq: k, xay: !!k && k !== X && k.id === Y.id && id0 !== Y.id }; },
    xaoCoop(X) { const che = G.che; G.che = 'coop'; const Y = dat(D, 8, X.id === 'lien' ? 'canon' : 'lien', X.sao); const ra = taoU(B, 'xaotron', 2, 14);
      try { SKILLS.xaotron.ghep(G, B, ra, ra, ra); } finally { G.che = che; } const k = D.t[7]; return { kq: k, xay: !!k && k !== X && k.id === Y.id }; },
    xaoPVP(X) { const che = G.che; G.che = 'pvp'; const ra = taoU(B, 'xaotron', 2, 14); const id0 = X.id; B.deck = B.deck.slice();
      try { SKILLS.xaotron.ghep(G, B, ra, ra, ra); } finally { G.che = che; } const k = D.t[7]; return { kq: k, xay: !!k && k !== X }; },
    madCrown(X) { thucHienChieu(fakeE('mad_crown', X), B); const k = B.t[7]; return { kq: k, xay: !!k && k !== X }; },
    joker(X) { dat(B, 8, X.id === 'lien' ? 'canon' : 'lien', X.sao); thucHienChieu(fakeE('joker_king', X), B); return { kq: B.t[8], xay: B.t[7] !== X }; },
    janus(X) { thucHienChieu(fakeE('janus', X), B); return { kq: B.t[7], xay: !!X.st.da }; },
    freezer(X) { thucHienChieu(fakeE('freezer', X), B); return { kq: B.t[7], xay: X.st.bang > 0 }; },
    nightmare(X) { const s0 = X.sao; thucHienChieu(fakeE('nightmare', X), B); return { kq: B.t[7], xay: !!B.t[7] && B.t[7].sao === s0 - 1 }; },
    leech(X) { const s0 = X.sao; TRUM_KN.leech.lam(fakeE('leech', X), B, [X]); return { kq: B.t[7], xay: X.sao === s0 - 1 }; },
    nangSao(X) { const s0 = X.sao; nangSao(B, X, 1, 'TEST'); return { kq: B.t[7], xay: X.sao === s0 + 1 }; },
    eve(X) { const mv = B.mv, mana = B.mana, d = G.dung; B.mv = { id: 'eve', gia: 0, cd: 0, lv: 1 }; B.mana = 1e6; G.dung = false; let ok = false;
      try { ok = CH.dung(B).ok; } finally { B.mv = mv; B.mana = mana; G.dung = d; } return { kq: B.t[7], xay: ok }; },
    sanctum(X) { const S = dat(B, 8, 'thanhdia', 2); capNhatU(B, S, 0.02); return { kq: B.t[7], xay: !S.moiDen }; },
    cleanser(X) { const S = dat(B, 8, 'taylo', 2); S.nap = 1; capNhatU(B, S, 0.02); return { kq: B.t[7], xay: S.nap === 0 }; },
    onlCung(X) { const s = ONS.oTT(X); B.t[7] = taoU(B, X.id, X.sao, 7); ONS.datO(B, 7, s); return { kq: B.t[7], xay: true }; },
    onlKhac(X) { const s = ONS.oTT(X); const id = X.id === 'lien' ? 'canon' : 'lien'; ONS.datO(B, 7, [id, X.sao, s[2]]); return { kq: B.t[7], xay: B.t[7].id === id }; },
  };
  const ra = [];
  const deck0 = B.deck.slice(), deckD = D ? D.deck.slice() : null;
  for (const [e] of SK) for (const [s] of TT) {
    const loai = LOAI_SK[e] && LOAI_TT[s] && LOAI_SK[e] !== LOAI_TT[s] ? null : (LOAI_SK[e] || LOAI_TT[s] || 'lien'); // ụ trơn mặc định: Gatling (Pháo La Bàn + Pháo La Bàn giờ là ghép giữ loại)
    if (!loai) { ra.push({ s, e, kq: 'na', ly: 'loại ụ không khớp' }); continue; }
    const sao = e === 'forge' ? 2 : (e === 'tienHoa' ? 2 : 3);
    const chay = (co) => {
      xoa(); B.deck = deck0.filter(id => id !== 'hopbi' && id !== 'tienhoa'); if (D) D.deck = deckD.slice();
      const BX = e === 'xaoPVP' || e === 'xaoCoop' ? D : B;
      const X = dat(BX, 7, loai, sao); X.tuoi = 0.5;
      if (co) DAT[s](X);
      const snap = { id: X.id, sao: X.sao };
      Math.random = rngHat(4242);
      let r; try { r = EV[e](X); } catch (err) { r = { loi: String(err && err.message || err) }; } finally { Math.random = r0; }
      r.X = X; r.snap = snap; return r;
    };
    const dc = chay(false), th = chay(true);
    if (dc.loi || th.loi) { ra.push({ s, e, kq: 'loi', ly: dc.loi || th.loi }); continue; }
    if (!dc.xay) { ra.push({ s, e, kq: 'kad', ly: 'đối chứng không xảy ra (' + loai + ')' }); continue; }
    let kq;
    if (!th.xay) kq = 'chan';
    else { const a = !!(th.kq && CO[s](th.kq)), b = !!(dc.kq && CO[s](dc.kq)); kq = !a ? 'mat' : !b ? 'giu' : 'ca2'; } // ca2: cả đối chứng cũng có (vd. ghép Mimic luôn cho buff) → không phân biệt được giữ/mất
    const o = { s, e, kq, id: th.kq ? th.kq.id : null };
    // bản sao: sức mạnh + dấu
    const K = th.kq;
    if (K && K.banSao && SKILLS[K.id]) {
      const F = taoU(G.ban[K.ban], K.id, K.sao, K.o), sv = [K.aurora, K.buf.dmg, K.vang, K.thuc]; K.aurora = 0; K.buf.dmg = 0; F.vang = K.vang; F.thuc = K.thuc;
      const d1 = SKILLS[K.id].dmg ? dmgU(K) / dmgU(F) : heSaoChep(G.ban[K.ban]);
      K.aurora = sv[0]; K.buf.dmg = sv[1];
      o.tile = Math.round(d1 * 1000) / 1000; o.tileDung = Math.round(heSaoChep(G.ban[K.ban]) * 1000) / 1000;
      o.dau = /hb-bs/.test(HB.soNgan(K.id, K) || '') && /\d+%/.test(HB.soNgan(K.id, K));
    }
    ra.push(o);
  }
  B.deck = deck0; if (D) D.deck = deckD; xoa();
  // bất biến thêm: bom Orbital của bản sao theo % sao chép; cấp thẻ/nâng cấp trận theo LOẠI kết quả
  const them = {};
  { xoa(); const T = dat(B, 7, 'orbital', 3), b1 = SKILLS.orbital.bomDmg(B, T); T.banSao = true; them.orbital = Math.round(SKILLS.orbital.bomDmg(B, T) / b1 * 1000) / 1000; }
  { xoa(); const lv0 = Object.assign({}, B.lv); B.deck = ['lien']; B.lv.hopbi = 5; B.lv.lien = 1; const X = dat(B, 7, 'hopbi', 3); X.banSao = true; X.tuoi = 999; Math.random = rngHat(9); try { capNhatU(B, X, 0.02); } finally { Math.random = r0; }
    const K = B.t[7], F = taoU(B, 'lien', K.sao, 7); them.capLoai = K.id === 'lien' && Math.abs(dmgU(K) / dmgU(F) - heSaoChep(B)) < 1e-6; B.lv = lv0; B.deck = deck0; xoa(); }
  them.heso = heSaoChep(B);
  // Evolver MẤT SAO (KIEM.md mục IX 'Đã quyết' #3): mọi lần mất sao → đếm ngược lại TỪ ĐẦU (dưới 7★ như ca 7★ xịt c8d9e2e); tăng sao giữ thời gian đã chờ
  { const evo = (sao, f) => { xoa(); const X = dat(B, 7, 'tienhoa', sao); capNhatU(B, X, 0.02); X.egg = 12; f(X); capNhatU(B, X, 0.02); const r = { id: X.id, sao: X.sao, egg: X.egg, xit: !!X.xit }; /* 08/11: trứng đếm bằng T.egg (không còn T.tuoi) */ xoa(); return r; };
    const h5 = evo(5, X => haSao(B, X, 'kt')), h7 = evo(7, X => haSao(B, X, 'kt')), len = evo(3, X => { X.sao = 4; });
    them.evo = { h5, h7, len, ok: h5.id === 'tienhoa' && h5.sao === 4 && h5.egg < 0.05 && h7.sao === 6 && !h7.xit && h7.egg < 0.05 && len.sao === 4 && len.egg > 11 }; }
  // co-che-moi: Pháo La Bàn (cùng / vuông / ngược hướng), Lửa Thập Tự (cả hàng + cột, giữ lửa qua ghép), Drone Kéo Xa (quãng kéo)
  { xoa(); const P = (o, hb, n, s) => { const T = dat(B, o, 'canon', s || 2); T.hb = hb; T.cmC = n || 0; return T; }; // 08/11 tổ hợp hướng: hợp hướng, sao = trung bình làm tròn lên
    let a = P(0, 1, 0, 2), b = P(1, 4, 0, 3); ghep(B, a, b); const c1 = [B.t[1] === b, b.sao, b.hb, b.cmC, !B.t[0]];
    a = P(2, 1, 0, 5); const c2 = [hopLeGhep(a, b)]; a = P(2, 10, 0, 4); ghep(B, a, b); c2.push(b.sao, b.hb);
    a = P(3, 15, 2, 1); ghep(B, a, b); const c3 = [b.sao, b.hb, b.cmC];
    const C = dat(B, 9, 'saochep', 3); ghep(B, C, b); const k = B.t[9]; const c4 = [k && k.id, k && k.banSao, k && [1, 2, 4, 8].includes(k.hb), k && k.cmC]; // 08/11: bản sao = 1 hướng ngẫu nhiên MỚI, 0 stack
    them.cm = JSON.stringify([c1, c2, c3, c4]); G.quai = []; xoa(); }
  { xoa(); B.deck = ['lualien']; const R = (o, n) => { const T = dat(B, o, 'lualien', 3); T.lc = n; return T; };
    const r0 = R(0, 0), r4 = R(4, 0), r12 = R(12, 0), r10 = R(10, 0), a = R(6, 5), b = R(2, 2); ghep(B, a, b);
    them.lc = JSON.stringify([B.t[2] && B.t[2].lc, r0.lc, r4.lc, r12.lc, r10.lc]); B.deck = deck0; xoa(); }
  { xoa(); const a = dat(B, 10, 'drone', 3), b = dat(B, 4, 'drone', 3), n0 = G.hu.filter(h => h.k === 'drone').length; ghep(B, a, b);
    const n1 = G.hu.filter(h => h.k === 'drone').length - n0; const c = dat(B, 6, 'drone', 3), d = dat(B, 7, 'drone', 3); ghep(B, c, d);
    them.dr = JSON.stringify([n1, G.hu.filter(h => h.k === 'drone').length - n0 - n1]); G.hu = G.hu.filter(h => h.k !== 'drone'); xoa(); }
  return { ra, them };
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e.message));
  await p.goto(BASE + '?mode=pvp&deck=canon,lien,saochep,hopbi,tienhoa&wave=1&mana=0&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length > 1 && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 45000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 });
  await p.evaluate(() => { G.dung = true; G.cho = 999; });
  const { ra, them } = await p.evaluate(trongTrang, { TT, SK, LOAI_TT, LOAI_SK });
  await b.close();
  const LOI = [], tenT = Object.fromEntries(TT.map(x => [x[0], x[1]])), tenS = Object.fromEntries(SK.map(x => [x[0], x[1]]));
  let kiem = 0, dat = 0, kad = 0, na = 0;
  const bang = {};
  for (const r of ra) {
    const L = luat(r.s, r.e, r);
    let ok, ghi;
    if (r.kq === 'na' || L.k === 'na') { na++; ghi = { k: 'na', ly: L.k === 'na' ? L.ly : r.ly }; bang[r.s + '|' + r.e] = ghi; continue; }
    if (r.kq === 'kad') { kad++; bang[r.s + '|' + r.e] = { k: 'kad', ly: r.ly }; continue; }
    kiem++;
    ok = r.kq === L.k || (r.kq === 'ca2' && (L.k === 'giu' || L.k === 'mat')) || (L.k === 'ngau' && (r.kq === 'giu' || r.kq === 'mat' || r.kq === 'ca2'));
    const loiThem = [];
    if (r.tile != null && Math.abs(r.tile - r.tileDung) > 0.002) loiThem.push('sức mạnh bản sao ×' + r.tile + ' ≠ ×' + r.tileDung);
    if (r.tile != null && !r.dau) loiThem.push('dải xem nhanh thiếu dấu Copycat + %');
    if (ok && !loiThem.length) dat++;
    else LOI.push('✗ [' + r.s + ' × ' + r.e + '] luật ' + L.k + ' — thực tế ' + r.kq + (r.ly ? ' (' + r.ly + ')' : '') + (loiThem.length ? ' · ' + loiThem.join(' · ') : ''));
    bang[r.s + '|' + r.e] = { k: L.k, ly: L.ly, ok: ok && !loiThem.length };
  }
  if (Math.abs(them.orbital - them.heso) > 0.002) LOI.push('✗ bom Orbital của bản sao ×' + them.orbital + ' ≠ ×' + them.heso);
  if (!them.evo.ok) LOI.push('✗ Evolver mất sao phải đếm lại từ đầu (5★→4★, 7★ xịt→6★), lên sao giữ thời gian: ' + JSON.stringify(them.evo));
  if (them.cm !== JSON.stringify([[true, 3, 5, 0, true], [false, 4, 15], [3, 15, 3], ['canon', true, true, 0]])) LOI.push('✗ Pháo La Bàn: luật ghép sai ' + them.cm + ' (cần N2★+S3★ = NS 3★ · NS+N không ghép · NS+WE 4★ = NSWE 4★ · NSWE(2)+NSWE 1★ → 3★ stack 3 · Copycat chép = 1 hướng ngẫu nhiên mới, 0 stack)');
  if (them.lc !== JSON.stringify([7, 7, 7, 7, 0])) LOI.push('✗ Lửa Thập Tự: ' + them.lc + ' (luật 08/11: ghép 2 Ember → lửa cả 2 truyền theo hàng/cột Ô GHÉP — ghép ô 6 (5) vào ô 2 (2): ụ ra = 5 + 2 = 7; ô 0, 4 (hàng ô 2), ô 12 (cột ô 2) +7; ô 10 không chung đường = 0)');
  if (them.dr !== JSON.stringify([7, 2])) LOI.push('✗ Drone Kéo Xa: ' + them.dr + ' (cần góc → góc 6 ô + 3★/3 = 7 drone; kề 1 ô = 2)');
  if (!them.capLoai) LOI.push('✗ Hộp Bí Ẩn (bản sao) mở ra: sức mạnh không theo cấp của LOẠI kết quả × % sao chép');
  for (const e of errs) LOI.push('✗ ' + e);
  console.log('— MA TRẬN: ' + ra.length + ' cặp · kiểm ' + kiem + ' · đạt ' + dat + ' · không thể có ' + na + ' · đối chứng không chạy ' + kad);
  for (const l of LOI) console.log('  ' + l);
  if (process.env.GHI_MD) ghiMD(bang, { tong: ra.length, kiem, dat, na, kad }, tenT, tenS);
  console.log(LOI.length ? 'TRƯỢT ma trận: ' + LOI.length + ' lỗi' : 'XANH ma trận tương tác');
  process.exit(LOI.length ? 1 : 0);
})().catch(e => { console.log('✗ ' + (e.stack || e)); process.exit(1); });

function ghiMD(bang, so, tenT, tenS) {
  const KY = { giu: 'GIỮ', ngau: 'QUAY MỚI', mat: 'mất', chan: 'CHẶN', na: '—', kad: '·' };
  let t = '<!-- BẢNG SINH TỰ ĐỘNG: GHI_MD=1 node tools/thap-kt-matran.js -->\n';
  t += '| Sự kiện \\ Trạng thái | ' + TT.map(x => x[0]).join(' | ') + ' |\n|---|' + TT.map(() => '---').join('|') + '|\n';
  for (const [e] of SK) t += '| **' + e + '** ' + tenS[e] + ' | ' + TT.map(([s]) => { const c = bang[s + '|' + e]; return c ? KY[c.k] + (c.ok === false ? ' ✗' : '') : '?'; }).join(' | ') + ' |\n';
  t += '\nKý hiệu: **GIỮ** = ụ kết quả còn trạng thái · **mất** = không mang sang (ụ mới / hết) · **CHẶN** = sự kiện không xảy ra · **—** = không thể có trong trận · **·** = không áp dụng (vd. Overclock không lên ụ không bắn). Tổng ' + so.tong + ' cặp: kiểm ' + so.kiem + ', đạt ' + so.dat + ', không thể có ' + so.na + ', không áp dụng ' + so.kad + '.\n';
  t += '\n### Lý do từng cặp (rút gọn)\n';
  for (const [e] of SK) { const ds = TT.map(([s]) => [s, bang[s + '|' + e]]).filter(([, c]) => c && c.ly && c.k !== 'kad'); const g = {}; for (const [s, c] of ds) (g[KY[c.k] + ': ' + c.ly] = g[KY[c.k] + ': ' + c.ly] || []).push(s); t += '- **' + e + '** — ' + Object.entries(g).map(([k, v]) => k + ' (' + v.join(', ') + ')').join(' · ') + '\n'; }
  let md = fs.existsSync(MD) ? fs.readFileSync(MD, 'utf8') : '';
  const A = '<!-- BANG-BAT-DAU -->', Z = '<!-- BANG-KET-THUC -->';
  if (md.includes(A)) md = md.slice(0, md.indexOf(A) + A.length) + '\n' + t + md.slice(md.indexOf(Z)); else md += '\n' + A + '\n' + t + Z + '\n';
  fs.mkdirSync(path.dirname(MD), { recursive: true }); fs.writeFileSync(MD, md);
  console.log('  (đã ghi ' + MD + ')');
}
