// TURRET MERGE — vẽ QUÁI/TRÙM mượt (ghi đè REN.veQuai).
// Khung ảnh đã "đăng ký" theo thân (docs/demo-hop-tuong/thap-art/dangky_khung.py) → thân đứng yên giữa các khung.
// Lớp code phủ thêm (theo THỜI GIAN THỰC, không theo bước mô phỏng → 2×/3× vẫn êm, không chớp nháy):
//  · nhịp khung theo tốc độ đi, có trần nhịp ở 2×/3×; hoà (cross-fade) 2 khung liền nhau
//  · nhún/nén nhẹ theo bước chân (≤3%), lắc lư nhẹ khi rẽ, cánh rung có vệt mờ cho quái bay
//  · trúng đòn: chớp trắng + giật lùi nhỏ có dịu; chết: nổ "pop" (phóng to + trắng + mờ dần) độc lập thời gian thực
//  · bóng mềm dưới mỗi quái (quái bay: bóng nhỏ/nhạt theo độ cao)
'use strict';

// quái có dải 8 khung mới (quai_<id>_8.png / trum_<id>_8.png) — thêm id khi ảnh có trong assets/
const QUAI8 = new Set(['bo', 'bay', 'bay_bang', 'khong_lo', 'tach', 'que_tach']);
// hệ số cỡ vẽ để thân bản 8 khung to bằng bản 4 khung cũ (đo: trung bình nhân tỉ lệ lõi thân & khung bao)
// 07/11 ảnh "không tay chân" (tools/thap-cat-trum2.py tính): cạnh lớn thân hiển thị = cỡ cũ ×~1.05 (trùm: 80 đơn vị cho cả 12)
const K8 = { bo: 0.708, bay: 0.776, bay_bang: 0.86, khong_lo: 1.175, tach: 0.86, que_tach: 1.108,
  mad_crown: 1.161, freezer: 1.21, janus: 0.993, joker_king: 1.147, nightmare: 1.038, octopus: 1.018,
  hive: 0.993, jammer: 1.024, prism: 1.035, twin_core: 1.008, patcher: 1.039, leech: 1.115 }; // trùm: id = E.id
const TRUM8 = new Set(['freezer', 'mad_crown', 'nightmare', 'octopus', 'janus', 'joker_king']);
// HƯỚNG NHÌN (Pass 5): dải 8 khung NGANG (đi sang phải; trái = lật) / SAU (đi lên) đã có trong assets/ — tools/thap-huong-quai.py tự cập nhật dòng dưới
const HUONG8 = new Set([]); // vd 'quai_bo_side', 'trum_octopus_back'
// vật thể KHÔNG tay chân (ảnh 07/11): mọi hướng (ngang/sau/trái) dùng chính dải đi trước — không lật mặt, không xoay
const HUONG_CHUNG = new Set(['quai_bo', 'quai_bay', 'quai_bay_bang', 'quai_khong_lo', 'quai_tach', 'quai_que_tach',
  'trum_mad_crown', 'trum_freezer', 'trum_janus', 'trum_joker_king', 'trum_nightmare', 'trum_octopus',
  'trum_hive', 'trum_jammer', 'trum_prism', 'trum_twin_core', 'trum_patcher', 'trum_leech']);
// dải TUNG CHIÊU trum_<id>_atk_16.png: 8 khung (1-2 lấy đà, 3-5 tung, 6-7 hồi, 8 trung tính), ô = ô dải đi × ATK_K (hiệu ứng tràn ngoài thân)
const ATK_K = 1.5;
const ATK_SEQ = [0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 6, 7]; // tiến độ chiêu (16 nấc) → khung; dải 16 khung cũ: phát thẳng
const HUONG_NGHIENG = 0.139; // dải chưa có: dùng dải TRƯỚC nghiêng ≤ 8° về phía đi
const HUONG_HOA = 0.12;      // hoà 120 ms khi đổi hướng nhìn ở khúc rẽ
// ---- TRÙM HOẠT ẢNH BẰNG CODE (thử 08/11, tuvan/trum-anim-code) ----
// Dải đi gen từng khung → hoa văn/ngọc đổi hình giữa các khung ("sôi"). Ở đây vẽ 1 ẢNH GỐC trum_<id>_m.png (cắt từ 1 khung dải đi,
// tools/thap-trum-master.py) và chỉ biến đổi nó: hoa văn không thể trôi. Có cấu hình + ảnh gốc đã nạp → dùng; không → dải khung như cũ.
//  kieu 'lan'  quả cầu LĂN: góc = quãng đường / bán kính (r = bán kính / cạnh ô); bóng sáng/tối cố định không xoay (PNG fx_cham_trang, cắt theo thân)
//  kieu 'bay'  LƠ LỬNG: nhấp nhô sin, nghiêng theo hướng đi, giãn/nén khi rẽ, thở; bóng đất nhỏ lại khi lên cao
//  kieu 'nhay' NHẢY (thạch; deo = hệ số nén–giãn, mặc định 1): nhịp = nhip (lần/giây) + quãng đường / (buoc × cạnh ô), nén–giãn neo ở đáy; vương miện rời (vm = điểm neo) trễ nhịp
//  sang: lớp sáng trum_<id>_m_sang.png nhấp nháy ('lighter'), bùng lên lúc lấy đà chiêu. day = đáy thân / cạnh ô (neo nén–giãn).
// Chiêu: lấy đà (nén, ngả ra sau, lõi sáng dần, rung) → tung lúc chiêu nổ (giãn + chớp + lao về bàn rồi lò xo về) → lắng. Trúng đòn: chớp trắng + nén.
// Mọi thứ theo THỜI GIAN THỰC / QUÃNG ĐƯỜNG (không đếm khung) → 30/60 FPS, 1×/3× như nhau. Chỉ hình — mô phỏng không đổi.
const TRUM_ANIM_CODE = {
  // 08/11 đợt 2 (trum-anim-code): hive lăn 3D (trục lăn ⟂ hướng đi → đi dọc hoa văn lăn dọc) + 3 ong tách lớp bay vòng (không lăn theo)
  //  cau: [tâm x, y, bán trục x, y] thân cầu/elip trên ảnh gốc — vẽ lại từng điểm ảnh bằng phép quay 3D (mặt sau = soi gương mặt trước)
  //  truc: thân giữ nguyên, chỉ VÀNH GAI ngoài elip quay (jammer: lăn 3D làm xoắn vòm) · tamQ: tâm quay phẳng (bánh răng)
  //  napL: ảnh _m_nap KHÔNG lăn (ăng-ten / giá + cờ lê), [x, y] = điểm neo lắc; lac = biên độ lắc trễ · ong: tâm từng ong trên dải _m_ong
  //  kieu 'bo' (leech): sâu đo/thạch — giãn DỌC đường đi, co ngang (giữ thể tích), đầu vươn trước đuôi bắt kịp; lớp sáng đập theo nhịp bò
  hive: { kieu: 'lan', r: 0.445, day: 0.445, sang: 1, cau: [0.5, 0.5, 0.445, 0.445], ong: [[0.475, 0.1], [0.85, 0.37], [0.155, 0.575]], ongR: 0.085 },
  //  kieu 'vanh' (jammer, gen lại 08/11 — tools/thap-trum-master-jammer.py): 3 lớp riêng. Thân _m đứng thẳng, nhún nhẹ; VÀNH GAI _m_vanh (ảnh nhìn
  //  thẳng từ trên, tròn đều) quay THUẬN KIM ĐỒNG HỒ mãi (quãng đường / r + quay chậm lúc đứng; không đổi chiều theo hướng đi) rồi nén dọc
  //  vanh = [tâm x, y, bán kính ngoài, nén dọc] (tỉ lệ ô): nửa sau vẽ trước thân, nửa trước vẽ sau thân · quay = rad/s lúc đứng
  //  lấy đà chiêu: vành quay nhanh dần · tung: vành phồng + chớp (xung) rồi quay chậm dần về · ăng-ten _m_nap lắc trễ quanh napL (lỗ đỉnh vòm)
  jammer: { kieu: 'vanh', r: 0.46, day: 0.36, sang: 1, vanh: [0.5, 0.58, 0.46, 0.6], quay: 0.9, napL: [0.499, 0.45], lac: 1 },
  patcher: { kieu: 'lan', r: 0.41, day: 0.39, sang: 1, tamQ: [0.494, 0.556], napL: [0.494, 0.556], lac: 0 },
  leech: { kieu: 'bo', day: 0.4, sang: 1, buoc: 0.5 },
  prism: { kieu: 'bay', day: 0, sang: 1, bob: 0.085, nga: [0.065, 0.22], chop: 1.5 }, // bob = biên độ nhấp nhô (×C) · nga = [hệ số nghiêng theo tốc độ rẽ, nghiêng tối đa] · chop = độ chớp lúc tung chiêu
  mad_crown: { kieu: 'nhay', day: 0.41, buoc: 0.6, nhip: 0.8, vm: [0.607, 0.431], vmK: 2.6, sang: 1, loang: 1 }, // vmK = độ lắc vương miện · loang = vệt thạch loang + rung thạch lúc chạm đất
  // freezer: khối băng nặng, nhảy chậm hơn; lõi bông tuyết sáng theo nhịp + bùng lúc chạm đất; khoi = 2 cụm sương _m_khoi toả ra ở đất lúc chạm (tools/thap-trum-master-nhay2.py)
  freezer: { kieu: 'nhay', day: 0.467, buoc: 0.66, nhip: 0.7, sang: 1, khoi: 1, deo: 0.6 },
  // joker_king: hộp + NẮP rời _m_nap (neo = đáy giữa nắp) — nắp lạch cạch khi chạm đất, lấy đà chiêu nắp rung hé, tung chiêu nắp bật mở (lộ lò xo trong hộp) rồi sập về
  joker_king: { kieu: 'nhay', day: 0.47, buoc: 0.6, nhip: 0.8, nap: [0.5, 0.68] },
  // lơ lửng như prism + PHẦN RỜI (phan, tools/thap-trum-master-bay.py): 'doi' 2 vòng lõi _m_p0/_m_p1 trước khối nối _m, tia _m_p2 kéo giãn (tam = giữa tia, kc = khoảng 2 tâm) · 'manh' mảnh bay _m_p0 (hop = hộp từng mảnh, tam = tâm khối) · 'lua' hoa lửa _m_p0 uốn trên chậu _m (cat = đường cắt)
  nightmare: { kieu: 'bay', day: 0, sang: 1 },
  twin_core: { kieu: 'bay', day: 0, sang: 1, phan: 'doi', np: 3, tam: [0.497, 0.623], kc: 0.456 },
  janus: { kieu: 'bay', day: 0, sang: 1, phan: 'manh', np: 1, tam: [0.505, 0.496], kim: [1, 0, 0, 1, 1, 0, 0, 1],
    hop: [[0.429, 0.026, 0.588, 0.191], [0.115, 0.144, 0.391, 0.388], [0.609, 0.147, 0.879, 0.385], [0.053, 0.418, 0.215, 0.603], [0.791, 0.418, 0.953, 0.603], [0.112, 0.638, 0.353, 0.876], [0.65, 0.644, 0.891, 0.879], [0.426, 0.815, 0.585, 0.976]] },
  octopus: { kieu: 'bay', day: 0, sang: 1, phan: 'lua', np: 1, cat: 0.736 },
};
const TRUM_ANIM_BAT = (() => { try { return new URLSearchParams(location.search).get('trumanim') !== '0'; } catch (e) { return true; } })(); // ?trumanim=0 → dải khung cũ (so sánh)
const eoBack = (u) => { const c = 1.70158; u -= 1; return 1 + (c + 1) * u * u * u + c * u * u; };
const eoIO = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// nhịp nhảy thạch: u ∈ [0,1) → [độ cao 0..1, nén (+) / giãn (−)]
const nhipNhay = (u) => {
  if (u < 0.2) return [0, Math.sin(Math.PI * u / 0.2) * 0.13];
  if (u < 0.85) { const v = (u - 0.2) / 0.65; return [Math.sin(Math.PI * v), -0.075 * Math.abs(Math.cos(Math.PI * v))]; }
  return [0, Math.sin(Math.PI * (u - 0.85) / 0.15) * 0.2];
};
// lăn 3D: camera nhìn xiên CAU_PHI so với mặt đất → đi ngang: phần lớn quay phẳng (như bản thử đã duyệt) + chút lật; đi dọc: lật trước/sau
const CAU_PHI = 35 * Math.PI / 180, CAU_S = Math.sin(CAU_PHI), CAU_C = Math.cos(CAU_PHI);
// lấy hoa văn: bán kính thân ≤ CAU_R0 giữ nguyên, ngoài đó nén êm về CAU_K → không bao giờ lấy vùng mép tối + viền đen của ảnh gốc
// (mặt sau = soi gương mặt trước: lấy mép thì lăn tới đâu hiện dải tối giữa thân tới đó); viền vẽ lại theo bóng
const CAU_R0 = 0.55, CAU_K = 0.8;
const maTranQuay = (ax, ay, az, a) => { const c = Math.cos(a), s = Math.sin(a), t = 1 - c; return [t * ax * ax + c, t * ax * ay - s * az, t * ax * az + s * ay, t * ax * ay + s * az, t * ay * ay + c, t * ay * az - s * ax, t * ax * az - s * ay, t * ay * az + s * ax, t * az * az + c]; };
const nhanMT = (A, B) => { const o = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]; return o; };
const chuanMT = (Q) => { // trực chuẩn lại (Gram–Schmidt theo cột) — chống trôi số sau nhiều phép nhân
  let [a, b, c, d, e, f] = [Q[0], Q[3], Q[6], Q[1], Q[4], Q[7]]; let l = Math.hypot(a, b, c); a /= l; b /= l; c /= l;
  const k = a * d + b * e + c * f; d -= k * a; e -= k * b; f -= k * c; l = Math.hypot(d, e, f); d /= l; e /= l; f /= l;
  return [a, d, b * f - c * e, b, e, c * d - a * f, c, f, a * e - b * d];
};
// nhịp bò sâu đo: u ∈ [0,1) → độ duỗi 0..1 (duỗi nhanh 40% đầu, co chậm 60% sau)
const nhipBo = (u) => (u < 0.4 ? 0.5 - 0.5 * Math.cos(Math.PI * u / 0.4) : 0.5 + 0.5 * Math.cos(Math.PI * (u - 0.4) / 0.6));

Object.assign(REN, {
  _xac: [],
  _nut: [], // trùm đang phát dải ĐÁNH tại chỗ chết (TWIN CORE nứt lõi → tách đôi), thời gian thực
  NUT_S: 0.75,
  nutTrum(E) {
    const g = 'trum_' + E.trum + '_atk_16'; if (!this.img(g)) return false;
    E._pop = 1; // thay cho "xác nổ" thường
    this._nut.push({ x: E.x, y: E.y, co: E.d.co * (K8[E.d.anh || E.trum] || 1) * ATK_K, g, t: 0 });
    return true;
  },
  // bóng mềm = ảnh fx_cham_trang tô đen (PNG, không còn gradient vẽ code); chưa nạp → không vẽ bóng
  bong1() { return PX.mau('fx_cham_trang', '#000000'); },
  // tên dải ảnh dùng cho quái: ưu tiên bản 8 khung nếu đã nạp được
  tenQuai(E) {
    const goc = E.trum ? 'trum_' + E.trum : 'quai_' + (E.d.anh || E.id);
    const co8 = E.trum ? TRUM8.has(E.trum) : QUAI8.has(E.d.anh || E.id);
    // trùm mới chỉ có dải 8 hướng (không có trum_<id>.png cũ): chưa nạp xong vẫn trả tên _8 (vẽ bỏ qua 1 khung) — trước đây rơi về tên cũ → tải 404 lặp lại (QA ngâm)
    if (co8) { const a = this.img(goc + '_8'); if (a || (E.trum && typeof TRUM_ANH !== 'undefined' && TRUM_ANH.has(E.trum))) return goc + '_8'; }
    return goc;
  },
  // ảnh hướng nhìn cần nạp trước (ui.js chuẩn bị trận)
  dsHuong() {
    const ds = []; for (const k of HUONG8) ds.push(k + '_8');
    // dải đánh trum_<id>_atk_16 KHÔNG nạp hết ở đây (12 dải lớn → tốn bộ nhớ iPhone): nongskill.js làm nóng trùm sắp tới; chưa nạp → vẽ dải đi
    if (typeof TRUM_FX !== 'undefined') for (const id of TRUM_FX) ds.push('fx_trum_' + id); // hiệu ứng chiêu rời (tải nền cùng ảnh trùm)
    return ds;
  },
  // khung dải chiêu theo tiến độ u (0..1)
  khungDanh(u, nf) { const i = Math.min(15, Math.max(0, Math.floor(u * 16))); return nf === 8 ? ATK_SEQ[i] : Math.min(nf - 1, Math.floor(clamp(u, 0, 1) * nf)); },
  // dải ĐÁNH của trùm (thân tung chiêu, nhìn về BÀN ụ) — chỉ phát trong lúc báo chiêu; chưa có → null
  tenDanh(E) {
    if (!E.trum || typeof TRUM_ATK === 'undefined' || !TRUM_ATK.has(E.trum)) return null;
    const g = 'trum_' + E.trum + '_atk_16'; return this.img(g) ? g : null;
  },
  // chọn hướng nhìn từ hướng đi trên đoạn đường: 'f' trước (xuống) · 's' ngang (lat ±1) · 'b' sau (lên)
  // trễ (hysteresis): chỉ đổi khi một trục trội rõ (×1.25) và đã giữ hướng cũ ≥ 150 ms → không chớp ở góc
  huongQuai(E, t) {
    const dx = Math.cos(E.goc), dy = Math.sin(E.goc), ax = Math.abs(dx), ay = Math.abs(dy);
    let v = E._hv || 'f', l = E._hl || 1;
    if (ax > ay * 1.25) { v = 's'; l = dx < 0 ? -1 : 1; } else if (ay > ax * 1.25) v = dy > 0 ? 'f' : 'b';
    if (E.trum) { if (E._t0 == null) E._t0 = t; if (t - E._t0 < 0.9 || E.bao) v = 'f'; } // trùm: vừa vào / tung chiêu → nhìn ra màn hình
    if (!E._hv) { E._hv = v; E._hl = l; E._hvT = -9; return; }
    if ((v !== E._hv || (v === 's' && l !== E._hl)) && t - E._hvT > 0.15) {
      E._hvCu = E._hv; E._hlCu = E._hl; E._hvT = t; E._hv = v; E._hl = l;
    }
  },
  // dải của hướng v cho quái (ten = dải trước): có ảnh hướng đó → tên dải đó, không → null (dùng dải trước + nghiêng)
  tenHuong(ten, v) {
    if (v === 'f' || !ten.endsWith('_8')) return null;
    if (HUONG_CHUNG.has(ten.slice(0, -2))) return ten; // không tay chân: dải trước cho mọi hướng
    if (!HUONG8.size) return null;
    const g = ten.slice(0, -2) + (v === 's' ? '_side' : '_back');
    return HUONG8.has(g) && this.img(g + '_8') ? g + '_8' : null;
  },
  // dải NGANG quay TRÁI thật (ChatGPT vẽ riêng, cho quái/trùm không đối xứng) — có thì dùng thay vì lật dải phải
  tenTrai(ten) {
    if (!ten.endsWith('_8')) return null; if (HUONG_CHUNG.has(ten.slice(0, -2))) return ten; // không lật (mặt/chữ không bị soi gương)
    const g = ten.slice(0, -2) + '_left';
    return HUONG8.has(g) && this.img(g + '_8') ? g + '_8' : null;
  },
  // vẽ thân 1 hướng nhìn tại gốc toạ độ hiện tại: cánh mờ (quái bay), khung + hoà khung kế, chớp trắng; al = độ mờ chung
  veThan(ctx, daiV, wTen, fV, f1, fr, C, bay, dong, fl, al, chiDai) {
    if (bay && !dong) { ctx.globalAlpha = 0.22 * al; this.khung0(ctx, daiV, fV + 1, C * 1.035); }
    ctx.globalAlpha = al; this.khung0(ctx, daiV, fV, C);
    if (chiDai && f1 >= 0 && fr > 0.01) { ctx.globalAlpha = fr * al; this.khung0(ctx, daiV, f1, C); }
    if (chiDai && fl > 0.02) { const w = this.coDai(wTen.ten, wTen.px, 'trang'); if (w) { ctx.globalAlpha = fl * al; this.khung0(ctx, w, fr > 0.5 && f1 >= 0 ? f1 : fV, C); } }
  },
  // vẽ khung f của dải (đã thu nhỏ sẵn) tại gốc toạ độ hiện tại, cỡ co
  khung0(ctx, dai, f, co) {
    const n = dai.nf, fw = dai.fm, st = dai.fm + dai.gap;
    f = ((f % n) + n) % n;
    ctx.drawImage(dai, f * st, 0, fw, dai.height, -co / 2, -co / 2, co, co);
  },

  // ---- trùm code có PHẦN RỜI (twin_core 2 lõi tách–khép · janus mảnh bay quanh · octopus hoa lửa uốn lắc) ----
  // Phần rời = ảnh cùng cỡ ô cắt từ khung dải đi; biến đổi theo thời gian thực (tích phân dt) → 30/60 FPS, 1×/3× như nhau. Chỉ hình.
  cdPhanSan(g, cf) { for (let i = 0; i < cf.np; i++) if (!this.img(g + '_p' + i)) return false; return true; },
  cdPhanTinh(E, cf, R, t, dt) {
    const u0 = E.uid || 0;
    const w = E.bao ? eoIO(Math.min(1, clamp(E.bao.t / (E.bao.song || 1.4), 0, 1) / 0.9)) : 0; // lấy đà 0..1
    const r = E._cdRel != null ? t - E._cdRel : 9;                                                // giây sau lúc tung
    const bung = r < 0.9 ? Math.sin(Math.min(1, r / 0.08) * Math.PI / 2) * Math.exp(-5 * r) * Math.cos(Math.max(0, r - 0.08) * 9) : 0; // bật ra → lò xo
    const hg = Math.sign(Math.cos(E._cdGb != null ? E._cdGb : Math.PI / 2)) || 1;                  // phía bàn (trái/phải)
    if (cf.phan === 'doi') { // 2 lõi: khép–tách nhịp thở + quỹ đạo ngược pha; lấy đà khép chặt, tung bật xa rồi về
      const ph = t * 2.1 + u0, s0 = 0.03 + 0.026 * Math.sin(ph), dy0 = 0.022 * Math.cos(ph);
      const s = clamp(s0 * (1 - w) - 0.008 * w + 0.06 * bung, -0.01, 0.085), dy = dy0 * (1 - w);
      R.pt = [[-s, dy], [s, -dy]];
    } else if (cf.phan === 'manh') { // mảnh bay quanh khối: quay đều (tích phân → mượt mọi FPS), lấy đà co vào + quay nhanh, tung văng ra
      E._cdOrb = (E._cdOrb || 0) + dt * (0.5 + 3.2 * w + 4 * Math.max(0, bung));
      R.orb = E._cdOrb; R.k = 1 - 0.16 * w + 0.32 * bung; R.ph = t * 2.4 + u0;
    } else if (cf.phan === 'lua') { // hoa lửa: uốn (lệch ∝ độ cao²) + vươn/co, neo ở mép chậu; lấy đà ngả khỏi bàn + co, tung bùng cao về phía bàn
      R.un = 0.045 * Math.sin(t * 1.7 + u0) + 0.018 * Math.sin(t * 3.1 + u0 * 2) - E._cdL * 0.25 - hg * 0.09 * w + hg * 0.07 * bung;
      R.vu = 1 + 0.03 * Math.sin(t * 2.3 + u0) - 0.07 * w + 0.16 * bung;
    }
  },
  cdPhanVe(ctx, E, cf, R, M, x, y) {
    const C = R.C, Cb = R.Cb, g = R.g, b = cf.day * C;
    const than = this.co(g, Cb), sang = cf.sang && this.co(g + '_sang', Cb); if (!than) return;
    const p = [], pw = [], fl = R.fl > 0.02 ? R.fl : 0;
    for (let i = 0; i < cf.np; i++) { p.push(this.co(g + '_p' + i, Cb)); pw.push(fl ? this.co(g + '_p' + i, Cb, 'trang') : null); }
    if (p.some(q => !q)) return;
    const tw = fl ? this.co(g, Cb, 'trang') : null;
    ctx.setTransform(M); ctx.translate(x + R.ox, y + R.oy + b); ctx.rotate(R.rot); ctx.scale(R.sx, R.sy); ctx.translate(0, -b);
    const ve = (a, aw, dx, dy) => { ctx.globalAlpha = 1; ctx.drawImage(a, -C / 2 + dx * C, -C / 2 + dy * C, C, C); if (aw) { ctx.globalAlpha = fl; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(aw, -C / 2 + dx * C, -C / 2 + dy * C, C, C); ctx.globalCompositeOperation = 'source-over'; } };
    const veSang = (fn) => { if (!sang || R.sang <= 0.01) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, R.sang); fn(sang, 1); if (R.sang > 1) { ctx.globalAlpha = R.sang - 1; fn(sang, 1.1); } ctx.restore(); };
    if (cf.phan === 'doi') {
      ve(than, tw, 0, 0);                                                              // khối nối phía sau
      ve(p[0], pw[0], R.pt[0][0], R.pt[0][1]); ve(p[1], pw[1], R.pt[1][0], R.pt[1][1]); // 2 vòng lõi đủ tròn
      // tia + quầng sáng: kéo giãn/xoay quanh giữa tia để 2 đầu luôn ở đúng tâm 2 lõi đang tách/khép
      const vx = cf.kc + R.pt[1][0] - R.pt[0][0], vy = R.pt[1][1] - R.pt[0][1], mx = (cf.tam[0] - 0.5) * C, my = (cf.tam[1] - 0.5) * C;
      const keo = (fn) => { ctx.save(); ctx.translate(mx, my); ctx.rotate(Math.atan2(vy, vx)); ctx.scale(Math.hypot(vx, vy) / cf.kc, 1); ctx.translate(-mx, -my); fn(); ctx.restore(); };
      keo(() => ve(p[2], pw[2], 0, 0));
      veSang((a, k) => keo(() => ctx.drawImage(a, -C * k / 2, -C * k / 2, C * k, C * k)));
    } else if (cf.phan === 'manh') {
      ve(than, tw, 0, 0);
      veSang((a, k) => ctx.drawImage(a, -C * k / 2, -C * k / 2, C * k, C * k));
      const n = p[0].width, cx = (cf.tam[0] - 0.5) * C, cy = (cf.tam[1] - 0.5) * C;
      for (let i = 0; i < cf.hop.length; i++) {
        const h = cf.hop[i], mx = (h[0] + h[2]) / 2 - cf.tam[0], my = (h[1] + h[3]) / 2 - cf.tam[1];
        const a0 = Math.atan2(my, mx), rr = Math.hypot(mx, my) * C * (R.k + 0.035 * Math.sin(R.ph + i * 1.7)), a = a0 + R.orb;
        const ww = (h[2] - h[0]) * C, hh = (h[3] - h[1]) * C;
        ctx.save(); ctx.translate(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        ctx.rotate(cf.kim[i] ? Math.sin(R.ph * 1.3 + i) * 0.12 : R.orb + Math.sin(R.ph + i) * 0.1); // kim cương vàng giữ thẳng, mảnh đá xoay theo quỹ đạo
        for (const [q, al] of [[p[0], 1], [pw[0], fl]]) if (q && al) { ctx.globalAlpha = al; ctx.globalCompositeOperation = q === p[0] ? 'source-over' : 'lighter'; ctx.drawImage(q, h[0] * n, h[1] * n, (h[2] - h[0]) * n, (h[3] - h[1]) * n, -ww / 2, -hh / 2, ww, hh); }
        ctx.restore();
      }
    } else if (cf.phan === 'lua') {
      ve(than, tw, 0, 0); // chậu đứng yên
      const yc = (cf.cat - 0.5) * C, N = 24, PX = 0.25, PY = 0.3;
      const o = this._cdU || (this._cdU = [0, 1, 2].map(() => document.createElement('canvas')));
      const uon = (k, a) => { // vào canvas tạm (1 lần ghép → không vạch nối khi chớp): dải ngang lệch x ∝ (độ cao trên mép chậu)², vươn dọc neo ở mép chậu
        const n = a.width, c = o[k], w = Math.round(n * (1 + 2 * PX)), h = Math.round(n * (1 + PY));
        if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
        const x2 = c.getContext('2d'); x2.setTransform(1, 0, 0, 1, 0, 0); x2.globalAlpha = 1; x2.clearRect(0, 0, w, h);
        for (let j = 0; j < N; j++) {
          const s0 = cf.cat * j / N, s1 = cf.cat * (j + 1) / N, hm = 1 - (s0 + s1) / 2 / cf.cat;
          x2.drawImage(a, 0, s0 * n, n, (s1 - s0) * n, (PX + R.un * hm * hm) * n, (PY + cf.cat - (cf.cat - s0) * R.vu) * n, n, (s1 - s0) * n * R.vu + (j < N - 1 ? 1 : 0));
        }
        return c;
      };
      const veU = (c) => ctx.drawImage(c, -C / 2 - PX * C, -C / 2 - PY * C, C * (1 + 2 * PX), C * (1 + PY));
      ctx.globalAlpha = 1; veU(uon(0, p[0])); if (pw[0]) { ctx.globalAlpha = fl; ctx.globalCompositeOperation = 'lighter'; veU(uon(1, pw[0])); ctx.globalCompositeOperation = 'source-over'; }
      veSang((a) => { // lõi lửa uốn theo hoa, rune chậu đứng yên
        ctx.save(); ctx.beginPath(); ctx.rect(-C, -C, 2 * C, yc + C); ctx.clip(); veU(uon(2, a)); ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.rect(-C, yc, 2 * C, C); ctx.clip(); ctx.drawImage(a, -C / 2, -C / 2, C, C); ctx.restore();
      });
    }
    ctx.setTransform(M); ctx.globalAlpha = 1;
  },
  cdPhanChup(E, cf, Cb) { // "xác nổ" lúc chết: ghép các phần ở tư thế nghỉ (= khung gốc)
    const g = 'trum_' + E.trum + '_m', than = this.co(g, Cb); if (!than) return null;
    const n = than.width, c = document.createElement('canvas'); c.width = n; c.height = n;
    const x2 = c.getContext('2d'), ps = [];
    for (let i = 0; i < cf.np; i++) { const q = this.co(g + '_p' + i, Cb); if (q) ps.push(q); }
    x2.drawImage(than, 0, 0, n, n); for (const q of ps) x2.drawImage(q, 0, 0, n, n);
    c.nf = 1; c.fm = n; c.gap = 0;
    return c;
  },

  // ---- trùm hoạt ảnh bằng code: tính trạng thái (trước khi vẽ bóng) — null nếu không áp dụng / ảnh gốc chưa nạp ----
  cdTinh(E, cf, co, kc, sc, he, t, dt, x, y) {
    const g = 'trum_' + E.trum + '_m';
    if (!this.img(g) || (cf.sang && !this.img(g + '_sang')) || (cf.vm && !this.img(g + '_vm')) || (cf.nap && !this.img(g + '_nap')) || (cf.khoi && !this.img(g + '_khoi'))) return null;
    if (cf.phan && !this.cdPhanSan(g, cf)) return null;
    if ((cf.napL && !this.img(g + '_nap')) || (cf.ong && !this.img(g + '_ong')) || (cf.vanh && !this.img(g + '_vanh'))) return null;
    const Cb = co * kc, C = Cb * sc;
    // quãng đường thật (vị trí nội suy) + chiều lăn
    if (E._cdX == null) { E._cdX = x; E._cdY = y; E._cdQ = 0; E._cdA = 0; E._cdSg = 1; E._cdW = 0; E._cdG = E.gv != null ? E.gv : E.goc; E._cdL = 0; E._cdT = 0; }
    let dx = x - E._cdX, dy = y - E._cdY, d = Math.hypot(dx, dy); E._cdX = x; E._cdY = y;
    if (d > Cb) d = dx = dy = 0; // nhảy vị trí (kéo lùi / đổi bàn): không quay vọt
    if (Math.abs(dx) > 0.05) E._cdSg = dx > 0 ? 1 : -1;
    E._cdQ += d;
    if (cf.kieu === 'lan') E._cdA += (dx + (d - Math.abs(dx)) * E._cdSg) / (cf.r * Cb);
    if (cf.cau) this.cdQuay3(E, cf, dx, dy, d, Cb);
    // tốc độ rẽ (rad/s, làm mượt) → giãn/nén + nghiêng vào cua
    const gv = E.gv != null ? E.gv : E.goc, kd = 1 - Math.exp(-dt * 10);
    if (dt > 0) E._cdW += (clamp(gocLech(E._cdG, gv) / dt, -6, 6) - E._cdW) * kd;
    E._cdG = gv;
    const R = { g, C, Cb, ox: 0, oy: 0, rot: 0, sx: 1, sy: 1, sang: 0.3, fl: he * he * 0.3, bs: 1, cao: 0 };
    let nen = 0.06 * he, wA = 0, rA = -1; // trúng đòn: nén · wA lấy đà 0..1 · rA giây từ lúc tung (−1: không)
    // ---- chiêu: lấy đà → tung (lúc chiêu nổ = E.bao vừa hết) → lắng ----
    const B = G.ban[E.ban], c = B && B.o && B.o[7], gb = c ? Math.atan2(c.y - y, c.x - x) : Math.PI / 2;
    if (E.bao) {
      const u = clamp(E.bao.t / (E.bao.song || 1.4), 0, 1), w = eoIO(Math.min(1, u / 0.9));
      E._cdBao = 1; E._cdGb = gb; wA = w;
      nen += 0.13 * w; R.sang += 0.9 * w;
      R.ox -= Math.cos(gb) * C * 0.05 * w; R.oy -= Math.sin(gb) * C * 0.05 * w; // lùi lấy đà
      R.rot -= Math.sign(Math.cos(gb) || 1) * 0.1 * w;                          // ngả ra sau
      if (u > 0.7) { const z = (u - 0.7) / 0.3; R.ox += Math.sin(t * 95) * C * 0.008 * z; R.oy += Math.cos(t * 83) * C * 0.006 * z; } // rung trước khi tung
    } else if (E._cdBao) { E._cdBao = 0; E._cdRel = t; }
    if (E._cdRel != null) {
      const r = t - E._cdRel;
      if (r < 0.6) {
        rA = r;
        const lx = Math.exp(-7 * r) * Math.cos(17 * r), gb2 = E._cdGb != null ? E._cdGb : gb;
        nen -= 0.17 * lx;                                  // giãn bật ra rồi lò xo về
        const lao = Math.sin(Math.min(1, r / 0.09) * Math.PI / 2) * (1 - eoBack(Math.min(1, r / 0.6))) + Math.exp(-10 * r) * 0.6;
        R.ox += Math.cos(gb2) * C * 0.07 * lao; R.oy += Math.sin(gb2) * C * 0.07 * lao; // lao về bàn rồi giật về
        const K = cf.chop || 1;
        // chớp tung chiêu: lớp trắng CỘNG SÁNG ('lighter') ~40–50% trong ~0,12 s — thân vẫn thấy rõ (trước: phủ trắng đặc 75–95% → khối trắng/hồng 1 khung)
        R.fl = Math.max(R.fl, Math.min(0.5, 0.42 * K) * Math.pow(Math.max(0, 1 - r / 0.12), 1.5)); R.sang += 0.3 * K * Math.exp(-12 * r);
      } else E._cdRel = null;
    }
    const st = clamp(Math.abs(E._cdW) * 0.025, 0, 0.07); // rẽ: giãn ngang
    if (cf.kieu === 'bay') {
      const h = 0.5 + 0.5 * Math.sin(t * 2.3 + E.uid);
      const bob = cf.bob || 0.05, [kN, mN] = cf.nga || [0.03, 0.14];
      R.cao = h; R.oy -= C * (0.03 + bob * h); R.bs = 1 - 0.18 * h * bob / 0.05;
      E._cdL += (clamp(Math.cos(gv) * 0.09 + E._cdW * kN, -mN, mN) - E._cdL) * (1 - Math.exp(-dt * (cf.nga ? 7 : 5)));
      R.rot += E._cdL + Math.sin(t * 1.3 + E.uid) * 0.02;
      const tho = 0.018 * Math.sin(t * 1.7 + E.uid);
      R.sx = (1 + tho + st) * (1 + nen * 0.8); R.sy = (1 + tho - st) * (1 - nen);
      R.sang += 0.25 + 0.25 * Math.sin(t * 3.3 + E.uid);
    } else if (cf.kieu === 'nhay') {
      const P0 = E._cdP || 0;
      E._cdP = P0 + (E.bao ? 0.15 : 1) * (dt * (cf.nhip || 0) + d / (cf.buoc * Cb)); // nhịp = nền theo giờ + theo quãng (3× nhảy dồn hơn); lấy đà chiêu: gần như đứng
      const kL = Math.floor(E._cdP - 0.85); // chạm đất ở pha k+0.85: nội suy đúng thời điểm trong khung → 30/60 FPS như nhau
      if (kL > Math.floor(P0 - 0.85) && E._cdP > P0) E._cdLand = t - dt * (E._cdP - (kL + 0.85)) / (E._cdP - P0);
      const rL = E._cdLand != null ? t - E._cdLand : 9;
      const u = E._cdP - Math.floor(E._cdP);
      const D = cf.deo || 1; // độ dẻo: khối băng cứng hơn thạch → nén/giãn ít hơn
      let [h, q] = nhipNhay(u), [, qL] = nhipNhay((u - 0.08 + 1) % 1); q *= D; qL *= D; nen *= D;
      R.cao = h; R.hop = h * C * 0.14; R.oy -= R.hop; R.bs = 1 - 0.35 * h;
      R.sx = 1 + (q + nen) * 0.85 + st; R.sy = 1 - q - nen;
      R.sxL = 1 + (qL + nen) * 0.85; R.syL = 1 - qL - nen; // vương miện theo nhịp trễ 8% → lắc theo quán tính
      R.vmRot = (qL - q) * (cf.vmK || 1.6) + Math.sin(t * 2.1 + E.uid) * 0.03;
      if (cf.loang) { // thạch: rung ngang–dọc tắt dần sau chạm đất; vương miện bị hất lắc theo
        const j = 0.07 * Math.exp(-7 * rL) * Math.sin(19 * rL);
        R.sx += j; R.sy -= j * 0.9; R.sxL += j * 0.5; R.syL -= j * 0.45;
        R.vmRot += 0.11 * Math.exp(-6 * rL) * Math.sin(15 * rL + 0.6);
        R.loang = rL;
      }
      R.rot += clamp(E._cdW * 0.03, -0.08, 0.08);
      R.sang += 0.2 + 0.2 * Math.sin(t * 2.6 + E.uid);
      if (cf.khoi) { R.khoi = rL; R.sang += 0.55 * Math.exp(-6 * rL) - 0.12; } // lõi băng: bùng lạnh lúc chạm đất, dịu khi bay
      if (cf.nap) { // nắp rời: lạch cạch sau chạm đất · lấy đà: rung hé dần · tung: bật mở (lò xo) rồi sập về
        let n = 0.045 * Math.exp(-9 * rL) * Math.abs(Math.sin(rL * 22));
        n += wA * (0.02 + 0.025 * Math.abs(Math.sin(t * 31)));
        if (rA >= 0) n += 0.11 * Math.sin(Math.min(1, rA / 0.08) * Math.PI / 2) * Math.exp(-4.5 * rA) * (1 + 0.25 * Math.cos(16 * rA));
        R.nap = n; R.napRot = -Math.sign(Math.cos(gb) || 1) * n * 1.4;
      }
    } else if (cf.kieu === 'bo') {
      // hướng bò làm mượt (vector đơn vị) → trục giãn xoay êm qua khúc cua; nhịp theo QUÃNG ĐƯỜNG (đứng yên = không bò)
      if (E._cdUx == null) { E._cdUx = Math.cos(gv); E._cdUy = Math.sin(gv); E._cdP = 0; }
      if (d > 1e-4) { const kh = 1 - Math.exp(-dt * 9); E._cdUx += (dx / d - E._cdUx) * kh; E._cdUy += (dy / d - E._cdUy) * kh; }
      const lu = Math.hypot(E._cdUx, E._cdUy) || 1, ux = E._cdUx / lu, uy = E._cdUy / lu;
      E._cdP += (E.bao ? 0.2 : 1) * d / (cf.buoc * Cb);
      const u = E._cdP - Math.floor(E._cdP), e = nhipBo(u), lao = E.dashT > 0 ? 1.45 : 1;
      const a = 0.15 * lao * e;                                   // duỗi dọc đường
      R.bo = { th: Math.atan2(uy, ux), sp: 1 + a, sq: 1 - a * 0.55 };
      R.ox += ux * C * a * 0.22; R.oy += uy * C * a * 0.22;       // đầu vươn trước, đuôi bắt kịp (tâm lệch nhẹ về trước khi duỗi)
      R.sx = 1 + nen * 0.85 + st * 0.5; R.sy = 1 - nen;
      R.rot += clamp(E._cdW * 0.025, -0.07, 0.07);
      R.sang += 0.18 + 0.45 * e + 0.08 * Math.sin(t * 3.1 + E.uid); // sáng đập theo nhịp bò
    } else if (cf.kieu === 'vanh') {
      // vành gai: góc chỉ TĂNG (thuận kim đồng hồ) — quay chậm theo giờ + theo quãng đường; lấy đà: nhanh dần ×6; tung: vọt rồi chậm dần về
      const dtV = Math.min(dt, 0.1), du = rA >= 0 ? Math.exp(-4 * rA) : 0;
      E._cdV = (E._cdV || 0) + dtV * (cf.quay || 0) * (1 + 5 * wA * wA) + d / (cf.r * Cb) + dtV * 9 * du;
      R.vanhA = E._cdV;
      R.vanhK = 1 + (rA >= 0 ? 0.09 * Math.sin(Math.min(1, rA / 0.12) * Math.PI / 2) * Math.exp(-5 * rA) : 0) - 0.02 * wA; // xung lúc tung (phồng rồi về), co nhẹ lúc lấy đà
      R.oy -= C * 0.012 * (0.5 + 0.5 * Math.sin(t * 2.6 + E.uid)); // nhún nhẹ (thân đứng thẳng, không lăn)
      R.sx = 1 + nen * 0.85 + st * 0.5; R.sy = 1 - nen;
      R.sang += 0.15 + 0.15 * Math.sin(t * 2.4 + E.uid) + 0.5 * wA;
    } else { // lan
      R.sx = 1 + nen * 0.85 + st * 0.5; R.sy = 1 - nen;
      R.sang += 0.15 + 0.15 * Math.sin(t * 2.4 + E.uid);
    }
    if (cf.napL) { // nắp không lăn: lắc trễ theo cua / lúc tung chiêu (biên độ lac)
      const rl = E._cdRel != null ? t - E._cdRel : 9;
      R.napRot = (cf.lac || 0) * (clamp(-E._cdW * 0.04, -0.12, 0.12) + Math.sin(t * 2.2 + E.uid) * 0.035 + (rl < 0.6 ? -0.16 * Math.exp(-6 * rl) * Math.sin(16 * rl) : 0));
    }
    if (cf.ong) { E._cdOng = (E._cdOng || 0) + dt * (E.bao ? 1.6 : 0.45); R.ongA = E._cdOng; } // ong bay vòng theo GIỜ THẬT (không theo lăn); lấy đà chiêu: bay nhanh
    if (cf.phan) this.cdPhanTinh(E, cf, R, t, dt);
    R.sang = clamp(R.sang, 0, 1.6);
    return R;
  },
  // vẽ trùm code tại (x,y): neo nén–giãn ở đáy thân
  cdVe(ctx, E, cf, R, M, x, y) {
    if (cf.phan) return this.cdPhanVe(ctx, E, cf, R, M, x, y);
    const C = R.C, Cb = R.Cb, g = R.g, b = cf.day * C;
    const than = this.co(g, Cb), sang = cf.sang && this.co(g + '_sang', Cb); if (!than) return;
    const dat = (rot2, sx, sy) => { ctx.setTransform(M); ctx.translate(x + R.ox, y + R.oy + b); ctx.rotate(R.rot + (rot2 || 0)); ctx.scale(sx, sy); ctx.translate(0, -b); };
    let anh = than, sangV = sang, trang = null, xoayV = null;
    if (cf.cau || cf.tamQ) { // 08/11 đợt 2: lăn 3D (cau) / quay quanh tâm lệch (tam) — thân + lớp sáng vẽ sẵn vào canvas tạm cùng phép quay
      const L = this.cdLanAnh(E, cf, than, sang); anh = L.anh; sangV = L.sang; trang = L; xoayV = 0;
    } else if (cf.kieu === 'lan') { // thân quay theo quãng đường trong canvas tạm, phủ bóng sáng/tối CỐ ĐỊNH (cắt theo thân)
      const n = than.width, o = this._cdO || (this._cdO = document.createElement('canvas'));
      if (o.width !== n) { o.width = n; o.height = n; }
      const x2 = o.getContext('2d'); x2.setTransform(1, 0, 0, 1, 0, 0); x2.globalCompositeOperation = 'source-over'; x2.globalAlpha = 1; x2.clearRect(0, 0, n, n);
      x2.translate(n / 2, n / 2); x2.rotate(E._cdA); x2.drawImage(than, -n / 2, -n / 2); x2.setTransform(1, 0, 0, 1, 0, 0);
      x2.globalCompositeOperation = 'source-atop';
      x2.globalAlpha = 0.55; x2.drawImage(this.bong1(), n * 0.12, n * 0.18, n * 1.15, n * 1.15);          // tối dưới-phải
      x2.globalAlpha = 0.3; x2.drawImage(this.cham1('#fff3cf'), n * 0.06, n * 0.02, n * 0.55, n * 0.55);   // bóng sáng trên-trái
      x2.globalCompositeOperation = 'source-over'; x2.globalAlpha = 1;
      anh = o;
    }
    if (cf.loang && R.loang < 0.5) { // vệt thạch loang dưới thân lúc chạm đất: vũng hồng mềm ở ĐẤT, toả rộng rồi mờ (tâm trên đường)
      const e = R.loang / 0.5, w = Math.min(C * (0.8 + 0.45 * e), 2 * Math.max(4, Math.min(x + R.ox - 2, W - 2 - x - R.ox))); // sát mép canvas: vũng hẹp lại, không bị cắt
      ctx.setTransform(M); ctx.translate(x + R.ox, y + R.oy + (R.hop || 0) + b - C * 0.02);
      ctx.globalAlpha = 0.75 * Math.pow(1 - e, 1.5); ctx.drawImage(this.cham1('#ff4fae'), -w / 2, -w * 0.13, w, w * 0.26);
      ctx.globalAlpha *= 0.6; ctx.drawImage(this.cham1('#ffd0ea'), -w * 0.3, -w * 0.07, w * 0.6, w * 0.12);
    }
    const xoay = xoayV != null ? xoayV : cf.kieu === 'lan' ? E._cdA : 0;
    if (R.bo) { ctx.setTransform(M); ctx.translate(x + R.ox, y + R.oy); ctx.rotate(R.bo.th); ctx.scale(R.bo.sp, R.bo.sq); ctx.rotate(-R.bo.th); ctx.translate(0, b); ctx.rotate(R.rot); ctx.scale(R.sx, R.sy); ctx.translate(0, -b); } // bò: giãn dọc đường đi
    else dat(0, R.sx, R.sy);
    if (cf.ong) this.cdOng(ctx, E, cf, R, C, Cb, g, -1); // ong đang ở nửa sau (bị thân che)
    if (cf.vanh) this.cdVanh(ctx, cf, R, C, Cb, g, -1); // nửa sau vành gai (thân che)
    ctx.globalAlpha = 1; ctx.drawImage(anh, -C / 2, -C / 2, C, C);
    const sang2 = sangV;
    if (sang2 && R.sang > 0.01) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, R.sang);
      if (xoay) ctx.rotate(xoay); ctx.drawImage(sang2, -C / 2, -C / 2, C, C);
      if (R.sang > 1) { ctx.globalAlpha = R.sang - 1; ctx.drawImage(sang2, -C * 0.55, -C * 0.55, C * 1.1, C * 1.1); }
      ctx.restore();
    }
    if (R.fl > 0.02) { const w = trang ? this.cdTrang(anh) : this.co(g, Cb, 'trang'); if (w) { ctx.globalAlpha = R.fl; ctx.globalCompositeOperation = 'lighter'; if (xoay) ctx.rotate(xoay); ctx.drawImage(w, -C / 2, -C / 2, C, C); ctx.globalCompositeOperation = 'source-over'; } }
    if (cf.vanh) { dat(0, R.sx, R.sy); this.cdVanh(ctx, cf, R, C, Cb, g, 1); } // nửa trước vành gai (che đáy thân)
    if (cf.khoi && R.khoi < 0.55) { // sương chạm đất: 2 cụm toả ra 2 bên, neo ở ĐẤT (không theo độ nảy), tâm = tâm thân trên đường
      const k = this.co(g + '_khoi', Cb);
      if (k) {
        const e = 1 - Math.pow(1 - R.khoi / 0.55, 2);
        const kx = Math.min(0.85 + 0.45 * e, Math.max(0.2, Math.min(x + R.ox - 2, W - 2 - x - R.ox) / (C * 0.5))); // sát mép canvas: sương toả hẹp lại
        ctx.setTransform(M); ctx.translate(x + R.ox, y + R.oy + (R.hop || 0) + b); ctx.scale(kx, 0.8 + 0.3 * e);
        ctx.globalAlpha = 0.9 * Math.pow(1 - R.khoi / 0.55, 1.5); ctx.drawImage(k, -C / 2, -C / 2 - b, C, C);
      }
    }
    if (cf.nap) { // nắp rời: neo đáy giữa nắp theo nhịp TRỄ (như vương miện), nhấc lên R.nap × C và ngả về sau
      const np = this.co(g + '_nap', Cb);
      if (np) {
        const px = (cf.nap[0] - 0.5) * C, py = (cf.nap[1] - 0.5) * C;
        dat(0, 1, 1); ctx.translate(px * R.sxL, b + (py - b) * R.syL - (R.nap || 0) * C); ctx.rotate(R.vmRot * 0.5 + (R.napRot || 0));
        ctx.globalAlpha = 1; ctx.drawImage(np, -C / 2 - px, -C / 2 - py, C, C);
        if (R.fl > 0.02) { const w = this.co(g + '_nap', Cb, 'trang'); if (w) { ctx.globalAlpha = R.fl; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(w, -C / 2 - px, -C / 2 - py, C, C); ctx.globalCompositeOperation = 'source-over'; } }
      }
    }
    if (cf.napL) { // nắp không lăn (ăng-ten / giá + cờ lê): cùng nén–giãn với thân, lắc quanh điểm neo
      const nap = this.co(g + '_nap', Cb);
      if (nap) {
        const px = (cf.napL[0] - 0.5) * C, py = (cf.napL[1] - 0.5) * C;
        dat(0, R.sx, R.sy); ctx.translate(px, py); ctx.rotate(R.napRot || 0); ctx.translate(-px, -py);
        ctx.globalAlpha = 1; ctx.drawImage(nap, -C / 2, -C / 2, C, C);
        if (R.fl > 0.02) { const w = this.co(g + '_nap', Cb, 'trang'); if (w) { ctx.globalAlpha = R.fl; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(w, -C / 2, -C / 2, C, C); ctx.globalCompositeOperation = 'source-over'; } }
      }
    }
    if (cf.ong) { dat(0, R.sx, R.sy); this.cdOng(ctx, E, cf, R, C, Cb, g, 1); }
    if (cf.vm) { // vương miện rời: đặt ở điểm neo đã biến đổi theo nhịp TRỄ, không nén (vật cứng)
      const vm = this.co(g + '_vm', Cb);
      if (vm) {
        const px = (cf.vm[0] - 0.5) * C, py = (cf.vm[1] - 0.5) * C;
        dat(0, 1, 1); ctx.translate(px * R.sxL, b + (py - b) * R.syL); ctx.rotate(R.vmRot);
        ctx.globalAlpha = 1; ctx.drawImage(vm, -C / 2 - px, -C / 2 - py, C, C);
        if (R.fl > 0.02) { const w = this.co(g + '_vm', Cb, 'trang'); if (w) { ctx.globalAlpha = R.fl; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(w, -C / 2 - px, -C / 2 - py, C, C); ctx.globalCompositeOperation = 'source-over'; } }
      }
    }
    ctx.setTransform(M); ctx.globalAlpha = 1;
  },
  // ảnh chụp thân hiện tại (cho "xác nổ" lúc chết): 1 khung, cùng định dạng dải
  cdChup(E, cf, co, kc) {
    const g = 'trum_' + E.trum + '_m', than = this.co(g, co * kc); if (!than) return null;
    if (cf.phan) return this.cdPhanChup(E, cf, co * kc);
    const n = than.width, c = document.createElement('canvas'); c.width = n; c.height = n;
    const x2 = c.getContext('2d');
    if (cf.vanh) { // vành gai (đúng góc đang quay) + thân + ăng-ten
      x2.setTransform(1, 0, 0, 1, n / 2, n / 2); const R0 = { vanhA: E._cdV || 0, vanhK: 1, fl: 0 };
      this.cdVanh(x2, cf, R0, n, co * kc, g, -1); x2.drawImage(than, -n / 2, -n / 2, n, n); this.cdVanh(x2, cf, R0, n, co * kc, g, 1);
      const nap = cf.napL && this.co(g + '_nap', co * kc); if (nap) x2.drawImage(nap, -n / 2, -n / 2, n, n);
      x2.setTransform(1, 0, 0, 1, 0, 0); c.nf = 1; c.fm = n; c.gap = 0;
      return c;
    }
    if (cf.cau || cf.tamQ) { // lăn 3D / quay tâm lệch: chụp đúng ảnh đang thấy + nắp + ong
      x2.drawImage(this.cdLanAnh(E, cf, than, null).anh, 0, 0);
      const nap = cf.napL && this.co(g + '_nap', co * kc); if (nap) x2.drawImage(nap, 0, 0, n, n);
      if (cf.ong) { x2.setTransform(n, 0, 0, n, n / 2, n / 2); this.cdOng(x2, E, cf, { ongA: E._cdOng || 0 }, 1, co * kc, g, 0); x2.setTransform(1, 0, 0, 1, 0, 0); }
      c.nf = 1; c.fm = n; c.gap = 0;
      return c;
    }
    x2.translate(n / 2, n / 2); if (cf.kieu === 'lan') x2.rotate(E._cdA || 0);
    x2.drawImage(than, -n / 2, -n / 2); x2.setTransform(1, 0, 0, 1, 0, 0);
    const vm = cf.vm && this.co(g + '_vm', co * kc); if (vm) x2.drawImage(vm, 0, 0, n, n);
    const np = cf.nap && this.co(g + '_nap', co * kc); if (np) x2.drawImage(np, 0, 0, n, n);
    c.nf = 1; c.fm = n; c.gap = 0;
    return c;
  },
  // vành gai jammer: ảnh nhìn từ trên quay thuận kim đồng hồ (R.vanhA) rồi nén dọc theo phối cảnh; mat −1 nửa sau (trên tâm), 1 nửa trước
  //  (gốc toạ độ ctx = tâm ô thân, C = cạnh ô). Cắt nửa theo đường ngang qua tâm vành TRƯỚC khi quay → chỗ nối không đổi khi vành quay.
  cdVanh(ctx, cf, R, C, Cb, g, mat) {
    const [vx, vy, vr, ky] = cf.vanh, D = 2 * vr * C * (R.vanhK || 1), im = this.co(g + '_vanh', 2 * vr * Cb); if (!im) return;
    ctx.save(); ctx.translate((vx - 0.5) * C, (vy - 0.5) * C);
    ctx.beginPath(); ctx.rect(-D, mat < 0 ? -D : 0, 2 * D, D); ctx.clip();
    ctx.scale(1, ky); ctx.rotate(R.vanhA || 0);
    ctx.globalAlpha = 1; ctx.drawImage(im, -D / 2, -D / 2, D, D);
    if (R.fl > 0.02) { const w = this.co(g + '_vanh', 2 * vr * Cb, 'trang'); if (w) { ctx.globalAlpha = R.fl; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(w, -D / 2, -D / 2, D, D); ctx.globalCompositeOperation = 'source-over'; } }
    ctx.restore();
  },
  // ---- lăn 3D: Q (thân → nhìn; x phải, y xuống, z vào màn) quay theo quãng đường. Lăn: trục = pháp tuyến đất × hướng đi
  //  (đi ngang: (0,−s,c) · đi dọc: (1,0,0)); truc: quay quanh trục cố định (con quay) theo chiều đi ngang gần nhất ----
  cdQuay3(E, cf, dx, dy, d, Cb) {
    if (!E._cdQ3) { E._cdQ3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]; E._cdPsi = 0; E._cdN3 = 0; }
    if (!(d > 1e-4)) return;
    let ax, ay, az, a = d / (cf.r * Cb);
    if (cf.truc) { E._cdPsi += a * E._cdSg; return; } // vành gai quay quanh thân (thân giữ nguyên ảnh gốc: vòm + trục không xoắn)
    else { const ux = dx / d, uy = dy / d; ax = uy; ay = -CAU_S * ux; az = CAU_C * ux; }
    const l = Math.hypot(ax, ay, az) || 1; ax /= l; ay /= l; az /= l;
    E._cdQ3 = nhanMT(maTranQuay(ax, ay, az, a), E._cdQ3);
    if (++E._cdN3 % 16 === 0) E._cdQ3 = chuanMT(E._cdQ3);
    E._cdPsi += a * (cf.truc ? Math.sign(az) : az); // phần nhô ngoài thân (gai): quay phẳng theo thành phần quay trong mặt phẳng nhìn
  },
  // bảng điểm ảnh theo cỡ (đệm theo canvas ảnh gốc): toạ độ chuẩn hoá trên elip thân, z mặt trước, viền
  cdBang(than, cf) {
    const n = than.width, k = 'cau|' + n + '|' + cf.cau.join(',');
    const M = this._cdBang || (this._cdBang = {}); if (M[k]) return M[k];
    const [cx, cy, rx, ry] = cf.cau, N = n * n, X = new Float32Array(N), Y = new Float32Array(N), Z = new Float32Array(N), V = new Float32Array(N);
    const src = than.getContext('2d').getImageData(0, 0, n, n).data;
    let vr = 0, vg = 0, vb = 0, vn = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const p = j * n + i, x = ((i + 0.5) / n - cx) / rx, y = ((j + 0.5) / n - cy) / ry, q = x * x + y * y;
      X[p] = x; Y[p] = y; Z[p] = q < 1 ? -Math.sqrt(1 - q) : 0; V[p] = Math.sqrt(q);
      if (q > 0.9 && q < 1 && src[p * 4 + 3] > 200) { vr += src[p * 4]; vg += src[p * 4 + 1]; vb += src[p * 4 + 2]; vn++; } // màu viền ảnh gốc
    }
    const w = 1.6 / (Math.min(rx, ry) * n); // bề dày viền vẽ lại (≈ 1,6 px)
    return (M[k] = { n, X, Y, Z, V, src, vien: vn ? [vr / vn, vg / vn, vb / vn] : [20, 12, 14], w, cx, cy, rx, ry, rong: [] });
  },
  // vẽ thân (và lớp sáng) đã lăn vào canvas tạm; quay tâm lệch (tam): drawImage quay; trả { anh, sang }
  cdLanAnh(E, cf, than, sang) {
    const n = than.width, mk = (k) => { const c = this[k] || (this[k] = document.createElement('canvas')); if (c.width !== n) { c.width = n; c.height = n; } return c; };
    const o = mk('_cdO'), o2 = sang ? mk('_cdO2') : null;
    if (cf.tamQ) {
      const px = cf.tamQ[0] * n, py = cf.tamQ[1] * n;
      for (const [cv, im] of [[o, than], [o2, sang]]) {
        if (!cv) continue;
        const x2 = cv.getContext('2d'); x2.setTransform(1, 0, 0, 1, 0, 0); x2.globalCompositeOperation = 'source-over'; x2.globalAlpha = 1; x2.clearRect(0, 0, n, n);
        x2.translate(px, py); x2.rotate(E._cdA || 0); x2.translate(-px, -py); x2.drawImage(im, 0, 0, n, n); x2.setTransform(1, 0, 0, 1, 0, 0);
      }
    } else {
      const T = this.cdBang(than, cf), sd = sang ? (sang._cdD || (sang._cdD = sang.getContext('2d').getImageData(0, 0, sang.width, sang.height).data)) : null;
      const Q = E._cdQ3 || [1, 0, 0, 0, 1, 0, 0, 0, 1], ps = E._cdPsi || 0, cs = Math.cos(ps), sn = Math.sin(ps);
      const x1 = o.getContext('2d'), id = this._cdId && this._cdId.width === n ? this._cdId : (this._cdId = x1.createImageData(n, n)), dd = id.data;
      const id2 = sd ? (this._cdId2 && this._cdId2.width === n ? this._cdId2 : (this._cdId2 = x1.createImageData(n, n))) : null, d2 = id2 && id2.data;
      const { X, Y, Z, V, src, vien, w, cx, cy, rx, ry } = T, kx = rx * n, ky = ry * n, ox = cx * n - 0.5, oy = cy * n - 0.5;
      const tam = [0, 0, 0, 0], tam2 = [0, 0, 0, 0], mot = [0, 0, 0, 0];
      const lay = (S, D, sx, sy, o4, al) => { // lấy mẫu song tuyến
        const x0 = Math.floor(sx), y0 = Math.floor(sy), fx = sx - x0, fy = sy - y0;
        if (x0 < 0 || y0 < 0 || x0 >= n - 1 || y0 >= n - 1) { D[o4] = D[o4 + 1] = D[o4 + 2] = D[o4 + 3] = 0; return; }
        const i0 = (y0 * n + x0) * 4, i1 = i0 + 4, i2 = i0 + n * 4, i3 = i2 + 4;
        const w0 = (1 - fx) * (1 - fy), w1 = fx * (1 - fy), w2 = (1 - fx) * fy, w3 = fx * fy;
        for (let c = 0; c < 4; c++) D[o4 + c] = S[i0 + c] * w0 + S[i1 + c] * w1 + S[i2 + c] * w2 + S[i3 + c] * w3;
        D[o4 + 3] *= al;
      };
      const mau = (u, w2, k) => { // cộng mẫu tại toạ độ thân chuẩn hoá (u, w2) với trọng số k
        const r = Math.sqrt(u * u + w2 * w2); if (r > CAU_R0) { const q = Math.min(1, (r - CAU_R0) / (1 - CAU_R0)), m = (CAU_R0 + (CAU_K - CAU_R0) * (1 - (1 - q) * (1 - q))) / r; u *= m; w2 *= m; }
        lay(src, mot, ox + u * kx, oy + w2 * ky, 0, 1); for (let c = 0; c < 4; c++) tam[c] += mot[c] * k;
        if (d2) { lay(sd, mot, ox + u * kx, oy + w2 * ky, 0, 1); for (let c = 0; c < 4; c++) tam2[c] += mot[c] * k; }
      };
      for (let p = 0, N = n * n; p < N; p++) {
        const o4 = p * 4, v = V[p];
        if (v < 1 && cf.truc) { for (let c = 0; c < 4; c++) dd[o4 + c] = src[o4 + c]; if (d2) for (let c = 0; c < 4; c++) d2[o4 + c] = sd[o4 + c]; }
        else if (v < 1) { // mặt cầu: điểm nhìn → điểm thân (Qᵀ); mặt sau soi gương mặt trước
          const x = X[p], y = Y[p], z = Z[p];
          const bx = Q[0] * x + Q[3] * y + Q[6] * z, by = Q[1] * x + Q[4] * y + Q[7] * z, bz = Q[2] * x + Q[5] * y + Q[8] * z;
          const al = Math.min(1, (1 - v) / w * 0.9 + 0.1), vv = clamp((v - (1 - w * 1.6)) / (w * 1.2), 0, 1); // mép mềm · viền tối vẽ lại
          // dải xích đạo (|bz| nhỏ): ảnh gốc ở đó bị nén sát mép → trộn sang "ba mặt chiếu" (triplanar) lấy vùng giữa ảnh gốc
          const wt = 1 - clamp((Math.abs(bz) - 0.28) / 0.3, 0, 1);
          for (let c = 0; c < 4; c++) { tam[c] = 0; tam2[c] = 0; }
          if (wt < 1) mau(bx, by, 1 - wt);
          if (wt > 0) {
            const ax = bx * bx * bx * bx, ay = by * by * by * by, az = bz * bz * bz * bz, sw = wt / (ax + ay + az || 1);
            if (az * sw > 0.01) mau(bx * 0.75, by * 0.75, az * sw);
            if (ax * sw > 0.01) mau(bz * 0.75 * Math.sign(bx), by * 0.75, ax * sw);
            if (ay * sw > 0.01) mau(bx * 0.75, bz * 0.75 * Math.sign(by), ay * sw);
          }
          for (let c = 0; c < 4; c++) dd[o4 + c] = tam[c];
          if (vv > 0) { for (let c = 0; c < 3; c++) dd[o4 + c] += (vien[c] - dd[o4 + c]) * vv; dd[o4 + 3] = Math.max(dd[o4 + 3], 255 * vv); }
          dd[o4 + 3] *= al;
          if (d2) { for (let c = 0; c < 4; c++) d2[o4 + c] = tam2[c]; d2[o4 + 3] *= 1 - vv; }
        } else if (v < 1.7) { // nhô ra ngoài thân (gai): quay phẳng ψ trong toạ độ elip
          const x = X[p] * cs + Y[p] * sn, y = -X[p] * sn + Y[p] * cs;
          lay(src, dd, ox + x * rx * n, oy + y * ry * n, o4, 1);
          if (d2) d2[o4 + 3] = 0;
        } else { dd[o4 + 3] = 0; if (d2) d2[o4 + 3] = 0; }
      }
      x1.putImageData(id, 0, 0);
      if (o2) o2.getContext('2d').putImageData(id2, 0, 0);
    }
    // bóng sáng/tối CỐ ĐỊNH (như bản thử) — không xoay theo thân
    const x2 = o.getContext('2d'); x2.setTransform(1, 0, 0, 1, 0, 0); x2.globalCompositeOperation = 'source-atop';
    x2.globalAlpha = 0.5; x2.drawImage(this.bong1(), n * 0.12, n * 0.18, n * 1.15, n * 1.15);
    x2.globalAlpha = 0.25; x2.drawImage(this.cham1('#fff3cf'), n * 0.06, n * 0.02, n * 0.55, n * 0.55);
    x2.globalCompositeOperation = 'source-over'; x2.globalAlpha = 1;
    return { anh: o, sang: o2 };
  },
  // bản trắng (chớp trúng đòn) của canvas tạm — canvas riêng, dựng lại mỗi lần cần
  cdTrang(c) {
    const w = this._cdW3 || (this._cdW3 = document.createElement('canvas')); if (w.width !== c.width) { w.width = c.width; w.height = c.height; }
    const x = w.getContext('2d'); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w.width, w.height); x.drawImage(c, 0, 0);
    x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, w.width, w.height); x.globalCompositeOperation = 'source-over'; // vetay-ok: png (bản trắng thân trùm)
    return w;
  },
  // 3 ong tách lớp: bay vòng quanh tổ theo giờ thật (ellipse nghiêng nhẹ), nhấp nhô + rung cánh; mat: −1 nửa sau, 1 nửa trước, 0 tất cả
  cdOng(ctx, E, cf, R, C, Cb, g, mat) {
    const dai = this.co(g + '_ong', Cb * cf.ongR * 2 * cf.ong.length); if (!dai) return;
    const O = dai.height, sz = C * cf.ongR * 2, a0 = R.ongA || 0, t = REN.t || 0;
    cf.ong.forEach(([ox, oy], i) => {
      const r = Math.hypot(ox - 0.5, oy - 0.5), g0 = Math.atan2(oy - 0.5, ox - 0.5), a = g0 + a0;
      const sau = Math.sin(a + 0.6) < -0.55; // gần đỉnh sau (trên-trái): lùi sau thân một chút
      if (mat && (mat < 0) !== sau) return;
      const px = Math.cos(a) * r * C, py = Math.sin(a) * r * C * 0.92 - Math.sin(t * 5.3 + i * 2.1) * C * 0.015;
      const rung = 1 + 0.05 * Math.sin(t * 31 + i);
      ctx.save(); ctx.translate(px, py); ctx.scale(rung, 2 - rung);
      ctx.globalAlpha = sau ? 0.85 : 1; ctx.drawImage(dai, i * O, 0, O, O, -sz / 2, -sz / 2, sz, sz);
      if (R.fl > 0.02) { ctx.globalAlpha = R.fl; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(this.cdTrangOng(dai), i * O, 0, O, O, -sz / 2, -sz / 2, sz, sz); ctx.globalCompositeOperation = 'source-over'; }
      ctx.restore();
    });
  },
  // trùm sát mép canvas: độ lệch ngang (px logic) để cả thân nằm trong vùng thấy được — tính từ khung chữ nhật thật (alpha) của ảnh gốc + phần rời
  trumLech(E, cf, cd, C, x, co) {
    let lo = -0.45, hi = 0.45, k = 1.04;
    if (cd && cf) { const r = this.cdRong(E.trum, cf, cd.g); if (r) { lo = r[0]; hi = r[1]; } k = cf.kieu === 'nhay' ? 1.2 : cf.kieu === 'bo' ? 1.12 : 1.06; } // biên nén–giãn / bò duỗi
    const st = E.cham > 0 || E.docT > 0 || E.chayT > 0 || E.cvT > 0 || E.cvPT > 0 || E.giapT > 0 || E.yeu > 0 || E.chan > 0 ? 0.57 * co : 0; // lớp trạng thái phủ thân (veStV2, ≈ co × 1.1)
    const m = 2, L = Math.min(x + lo * C * k, x - st), P = Math.max(x + hi * C * k, x + st);
    return L < m ? m - L : P > W - m ? W - m - P : 0;
  },
  cdRong(id, cf, g) { // [trái, phải] của phần có hình so với tâm ô (tỉ lệ cạnh ô), gộp thân + phần rời; tính 1 lần / trùm
    const M = this._cdRongC || (this._cdRongC = {}); if (M[id]) return M[id];
    const ds = [g]; for (let i = 0; i < (cf.np || 0); i++) ds.push(g + '_p' + i);
    if (cf.nap || cf.napL) ds.push(g + '_nap'); if (cf.vm) ds.push(g + '_vm');
    const n = 96, c = document.createElement('canvas'); c.width = c.height = n; const x2 = c.getContext('2d');
    for (const t of ds) { const im = this.img(t); if (!im) return null; x2.drawImage(im, 0, 0, n, n); }
    const d = x2.getImageData(0, 0, n, n).data; let l = n, r = -1;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (d[(j * n + i) * 4 + 3] > 24) { if (i < l) l = i; if (i > r) r = i; }
    if (r < 0) return null;
    let lo = l / n - 0.5, hi = (r + 1) / n - 0.5;
    if (cf.vanh) { lo = Math.min(lo, cf.vanh[0] - cf.vanh[2] - 0.5); hi = Math.max(hi, cf.vanh[0] + cf.vanh[2] - 0.5); }
    if (cf.ong) for (const [ox, oy] of cf.ong) { const q = Math.hypot(ox - 0.5, oy - 0.5) + cf.ongR; lo = Math.min(lo, -q); hi = Math.max(hi, q); } // ong bay vòng
    if (cf.phan === 'manh') { let q = 0; for (const h of cf.hop) q = Math.max(q, Math.hypot((h[0] + h[2]) / 2 - cf.tam[0], (h[1] + h[3]) / 2 - cf.tam[1]) + Math.hypot(h[2] - h[0], h[3] - h[1]) / 2); q *= 1.1; lo = Math.min(lo, cf.tam[0] - 0.5 - q); hi = Math.max(hi, cf.tam[0] - 0.5 + q); } // mảnh bay quanh: bán kính quỹ đạo lớn nhất
    if (cf.phan === 'lua') { lo -= 0.06; hi += 0.06; } // hoa lửa uốn
    if (cf.phan === 'doi') { lo -= 0.06; hi += 0.06; } // 2 lõi tách
    return (M[id] = [lo, hi]);
  },
  cdTrangOng(d) { return d._tr || (d._tr = this.toBien(d, 'trang')); },
  // trạng thái trên quái bằng ảnh tờ ST (fx_st_*): danh sách cần vẽ cho quái E
  stV2(E, lanh) {
    const c = (k) => typeof FXU !== 'undefined' && FXU.co('fx_st_' + k) && this.img('fx_st_' + k);
    const s = { n: 0 };
    if (E.chan > 0) { if (lanh && c('dong')) s.dong = 1; else if (c('choang')) s.choang = 1; }
    if (lanh && !s.dong && c('cham')) s.cham = 1;
    if (E.docT > 0 && c('doc')) s.doc = 1;
    if (E.chayT > 0 && c('chay')) s.chay = 1;
    if ((E.cvT > 0 || E.cvPT > 0) && c('cauvong')) s.yeu = 'cauvong'; else if (E.giapT > 0 && c('khienvang')) s.yeu = 'khienvang'; else if (E.yeu > 0 && c('yeu')) s.yeu = 'yeu';
    // VFX P0 (REVIEW-VFX-93 II.I): tối đa 2 dấu trạng thái mỗi quái — ưu tiên khống chế cứng > sát thương theo thời gian > dấu suy yếu > chậm
    //  (mỗi trạng thái 1 hình riêng: đóng băng = khối tinh thể · choáng = sao vàng quay · cháy = lửa · độc = bọt xanh · lộ/dấu = vòng tím nứt / cầu vồng / khiên vàng · chậm = vòng gió lạnh)
    let n = 0;
    for (const k of ['dong', 'choang', 'chay', 'doc', 'yeu', 'cham']) { if (!s[k]) continue; if (n >= 2) s[k] = 0; else n++; }
    s.n = n;
    return s;
  },
  // vẽ: cỡ = co × 1.1, alpha 0.85, thở ±6% 2 Hz; choáng xoay 120°/s trên đầu; đóng băng phủ lên thân
  veStV2(ctx, E, s, x, y, co, t) {
    const tho = 1 + 0.06 * Math.sin(t * 12.6 + E.uid), C = co * 1.02 * tho;
    if (s.cham) this.anhGiua(ctx, 'fx_st_cham', x, y, C, t * 0.4, 0.85);
    if (s.doc) this.anhGiua(ctx, 'fx_st_doc', x, y, C, 0, 0.85);
    if (s.chay) this.anhGiua(ctx, 'fx_st_chay', x, y - co * 0.05, C, 0, 0.85);
    if (s.yeu) this.anhGiua(ctx, 'fx_st_' + s.yeu, x, y, C * 1.05, s.yeu === 'cauvong' ? t * 1.2 : 0, s.yeu === 'khienvang' ? 0.55 : 0.6);
    if (s.dong) this.anhGiua(ctx, 'fx_st_dong', x, y, co * 1.05, 0, 0.8);
    if (s.choang) this.anhGiua(ctx, 'fx_st_choang', x, y - co * 0.42, co * 0.75, 0.12 * Math.sin(t * 6), 0.95);
    ctx.globalAlpha = 1;
  },
  veQuai(ctx) {
    const dt = this.dt || 0, k = G.tocDo || 1, t = this.t;
    // xác đang nổ (thời gian thực) — vẽ dưới quái sống
    for (let i = this._xac.length - 1; i >= 0; i--) {
      const X = this._xac[i]; X.t += dt;
      if (X.t >= 0.3) { this._xac.splice(i, 1); continue; }
      const u = X.t / 0.3, e = 1 - (1 - u) * (1 - u) * (1 - u);
      const sc = 1 + 0.32 * e, al = (1 - u) * (1 - u);
      ctx.save(); ctx.translate(X.x, X.y); if (X.goc) ctx.rotate(X.goc); if (X.lat < 0) ctx.scale(-1, 1);
      ctx.globalAlpha = al; this.khung0(ctx, X.dai, X.f, X.co * sc);
      if (X.w) { ctx.globalAlpha = al * (0.9 - 0.6 * u); this.khung0(ctx, X.w, X.f, X.co * sc); }
      ctx.restore();
      if (X.t - dt <= 0) FX.vong1(X.x, X.y, X.co * 0.2, X.co * 0.9, '#ffffff', 0.25, 3);
    }
    for (let i = this._nut.length - 1; i >= 0; i--) { // dải đánh tại chỗ chết: khung theo tiến độ, mờ 25% cuối
      const N = this._nut[i]; N.t += dt; const u = N.t / this.NUT_S;
      if (u >= 1) { this._nut.splice(i, 1); continue; }
      const d = this.coDai(N.g, N.co); if (!d) continue;
      ctx.save(); ctx.translate(N.x, N.y); ctx.globalAlpha = u < 0.75 ? 1 : 1 - (u - 0.75) / 0.25;
      this.khung0(ctx, d, this.khungDanh(u, d.nf), N.co * (1 + 0.08 * u)); ctx.restore();
    }
    ctx.globalAlpha = 1;
    const bong = this.bong1(), dong = G.quai.length > 30, M = ctx.getTransform();
    for (const E of G.quai) {
      const co = E.d.co, bay = E.d.bay, ten = this.tenQuai(E);
      const kc = ten.endsWith('_8') ? K8[E.d.anh || E.id] || 1 : 1; // bản 8 khung: chỉnh cỡ cho bằng bản cũ
      const dai = this.coDai(ten, co * kc);
      // ---- chết: chuyển thành "xác nổ" chạy theo thời gian thực (lọt cổng thì biến mất luôn) ----
      if (E.chet) {
        if (!E._pop && E.tChet < 0.25 && dai) {
          E._pop = 1;
          // nổ đúng hướng nhìn + đúng dải đang vẽ: chết giữa lúc tung chiêu → dải chiêu ở cỡ ×ATK_K (trước đây vẽ dải chiêu ở cỡ dải đi → trùm co lại 1/1.5 khi chết)
          const cfX = E._cdOn && TRUM_ANIM_CODE[E.trum], sX = cfX && this.cdChup(E, cfX, co, kc); // trùm vẽ bằng code: nổ đúng ảnh đang thấy
          if (sX) { this._xac.push({ x: E.x + (E._cdOx || 0), y: E.y + (E._cdOy || 0), goc: E._gv || 0, lat: 1, co: co * kc * (E._sc || 1), f: 0, t: 0, dai: sX, w: this.toBien(sX, 'trang') }); continue; }
          const kX = E._kHv || 1, tX = E._tHv || ten, dX = this.coDai(tX, co * kc * kX) || dai;
          this._xac.push({ x: E.x + (E._lechX || 0), y: E.y + (E._oy || 0), goc: E._gv || 0, lat: E._lat || 1, co: co * kc * kX * (E._sc || 1), f: E._f || 0, t: 0, dai: dX, w: this.coDai(tX, co * kc * kX, 'trang') });
        }
        continue;
      }
      // ---- nhịp khung (thời gian thực): theo tốc độ đi, có trần ở 2×/3× ----
      const n = dai ? dai.nf : 4;
      let v = E.d.v * (1 - (E.d.khangCham ? 0 : E.cham)); if (E.chan > 0) v = E.trum ? v * 0.5 : 0;
      const nhip = (2 + v / 10) / 4; // vòng/giây ở 1× (như cũ: 4 khung)
      const tran = bay ? 3.2 : 2.4;  // trần vòng/giây ở tốc độ cao → không chớp nháy
      if (E._ph == null) E._ph = Math.random();
      E._ph += dt * Math.min(nhip * k, Math.max(nhip, tran));
      // ---- trúng đòn: phát hiện cú đánh mới (flash vừa được đặt lại) ----
      if (E.flash > (E._fl || 0) + 1e-4) E._hitT = t;
      E._fl = E.flash;
      const hk = E._hitT != null ? Math.max(0, 1 - (t - E._hitT) / 0.16) : 0, he = hk * hk;
      // ---- hướng & vị trí ----
      // hướng nhìn theo hướng đi trên đường (DCDW): trước/ngang/sau — KHÔNG xoay cả hình nữa; dải hướng chưa có → dải trước nghiêng ≤ 8°
      this.huongQuai(E, t);
      const ngD = E._hv === 's' ? E._hl * (this.tenHuong(ten, 's') ? 0.035 : HUONG_NGHIENG) : 0;
      E._ng = E._ng == null ? ngD : E._ng + (ngD - E._ng) * Math.min(1, dt * 12);
      const gv = E._ng;
      // độ rẽ (để lắc lư nhẹ vào khúc cua)
      const r = E.trum ? 0 : clamp(gocLech(E.gv != null ? E.gv : E.goc, E.goc), -0.8, 0.8);
      const buoc = Math.sin(E._ph * Math.PI * 2 * 2); // 2 bước / vòng khung
      const hover = bay ? -6 + Math.sin(t * 3.1 + E.uid) * 2.2 : 0;
      const kb = he * Math.min(3, co * 0.06); // giật lùi
      const hx = Math.cos(E.goc), hy = Math.sin(E.goc);
      let x = E.x - (E.trum ? 0 : hx * kb), y = E.y + hover - (E.trum ? kb * 0.4 : hy * kb);
      let sc = 0.6 + 0.4 * (E.vao * E.vao * (3 - 2 * E.vao)); // xuất hiện êm
      sc *= 1 - 0.035 * he; // nén nhẹ khi trúng đòn
      const cf = E.trum && TRUM_ANIM_BAT ? TRUM_ANIM_CODE[E.trum] : null, cd = cf ? this.cdTinh(E, cf, co, kc, sc, he, t, dt, x, y) : null;
      // trùm ở làn sát mép (làn trái x≈27 / làn phải x≈404): mép canvas cắt mất thân → vẽ LÙI VÀO trong (chỉ hình; vị trí gameplay giữ nguyên)
      let lech = 0;
      if (E.trum) { // mượt: lùi vào nhanh (k 20/s), trả về chậm (k 8/s) → không giật khi trạng thái bật/tắt; gặp lần đầu / dt = 0: lấy luôn
        const mt = this.trumLech(E, cf, cd, cd ? cd.C : co * kc * sc, x, co), c0 = E._lechX;
        lech = c0 == null || !(dt > 0) ? mt : c0 + (mt - c0) * (1 - Math.exp(-dt * (Math.abs(mt) > Math.abs(c0) ? 20 : 8)));
      }
      x += lech; E._lechX = lech;
      E._cdOn = !!cd; if (cd) { E._cdOx = cd.ox + lech; E._cdOy = cd.oy; }
      // ---- bóng ----
      const bco = co * (bay ? 0.62 : 0.78) * sc * (bay ? 1 - (hover + 6) * 0.02 : 1) * (cd ? cd.bs : 1); // trùm code: bóng nhỏ lại khi nảy/bay lên
      ctx.globalAlpha = (bay ? 0.32 : 0.5) * (cd ? 0.6 + 0.4 * cd.bs : 1);
      if (bong) ctx.drawImage(REN.mip(bong, bco * REN.s * REN.dpr), E.x + lech + 2 - bco / 2, E.y + 4 + (bay ? 8 : 0) - bco * 0.42, bco, bco * 0.84);
      ctx.globalAlpha = 1;
      // ---- quầng báo chiêu của trùm ----
      if (E.bao) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        PX.cham(ctx, x, y, co * 1.8, TRUM[E.trum].mau, 0.6 + 0.4 * Math.sin(t * 20)); ctx.restore(); // quầng = fx_cham_trang tô màu trùm
        ctx.globalAlpha = 1;
      }
      const lanh = E.cham > 0 && !E.d.khangCham;
      const st = this.stV2(E, lanh); // trạng thái v2 (ảnh ChatGPT tờ ST) → vẽ sau thân, bỏ quầng/hạt code
      if (lanh) {
        if (!E._lanhT) { E._lanhT = t; FX.no('bang_vo', x, y, co * 0.8, 0.19); }
        if (!st.cham) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.2;
          this.anhGiua(ctx, this.cham1('#78D9F5'), x, y, co * 0.75); ctx.restore(); ctx.globalAlpha = 1; }
      } else E._lanhT = 0;
      if ((E.yeu > 0 || E.cvT > 0 || E.cvPT > 0 || E.giapT > 0) && !st.yeu) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28;
        const mm = E.cvT > 0 || E.cvPT > 0 ? ['#ff4b8a', '#ffd23f', '#4bff9a', '#4fb8ff', '#c77dff'][Math.floor(t * 6 + E.uid) % 5] : E.giapT > 0 ? '#ffd23f' : '#c77dff';
        this.anhGiua(ctx, this.cham1(mm), x, y, co * 1.15); ctx.restore(); ctx.globalAlpha = 1;
      }
      // ---- thân ----
      let f0, f1 = -1, fr = 0;
      if (E.trum && n === 4) { // trùm 4 khung: đi 0-1-2-1 (khung 3 = tung chiêu)
        if (E.bao) f0 = 3;
        else {
          const seq = [0, 1, 2, 1], p = E._ph * 4, i = Math.floor(p), q = p - i;
          f0 = seq[i % 4]; f1 = seq[(i + 1) % 4]; fr = q;
        }
      } else {
        const p = E._ph * n, i = Math.floor(p); f0 = i % n; f1 = (i + 1) % n; fr = p - i;
        // 08/11: bỏ dự phòng "khung 3 dải 4 khung cũ" lúc tung chiêu (cắt theo tâm dải đi, cỡ không K8 → thân nhảy lệch + phình/co khi
        //  dải chiêu chưa nạp); nay dải chiêu chưa nạp thì cứ phát dải đi
      }
      // hoà: 4 khung hoà ở 55% cuối, 8 khung hoà ở 45% cuối (đỡ bóng ma), smoothstep
      const nguong = dong ? 0.65 : n >= 8 ? 0.55 : 0.45;
      fr = fr <= nguong ? 0 : (fr - nguong) / (1 - nguong); fr = fr * fr * (3 - 2 * fr);
      if (E.trum) fr = 0; // 08/11: trùm KHÔNG hoà khung — dải trùm đổi hình lớn giữa 2 khung (nảy dẹt mad_crown, xoay janus/twin_core) → hoà ra 2 vương miện/2 thân chồng nhau
      E._f = fr > 0.5 && f1 >= 0 ? f1 : f0; E._gv = gv; E._oy = hover; E._sc = sc;
      if (cd) { this.cdVe(ctx, E, cf, cd, M, x, y); E._tHv = null; E._kHv = 1; E._gv = cd.rot; }
      else if (!dai) { /* ảnh quái chưa nạp: không vẽ chấm thay thế */ }
      else {
        // nhún/nén theo bước (≤3%): dọc hướng đi giãn thì ngang co, gần như giữ diện tích
        const am = E.trum ? 0.018 : (E.d.tach || E.id === 'nho' ? 0.03 : bay ? 0.012 : 0.022);
        const sy = 1 + am * buoc, sx = 1 - am * 0.6 * buoc;
        const lac = E.trum ? Math.sin(E._ph * Math.PI * 2) * 0.025 : r * 0.12 + buoc * 0.015; // lắc lư nhẹ
        const C = co * sc * kc, fl = he * he * (E.trum ? 0.4 : 0.7); // chớp trắng ngắn — trùm bị bắn liên tục không trắng xoá
        const rot = clamp(gv + lac, -HUONG_NGHIENG, HUONG_NGHIENG);
        // trùm có dải ĐÁNH riêng: trong lúc báo chiêu quay về BÀN ụ (nhìn ra màn hình) và phát dải đánh theo tiến độ chiêu
        const tD = E.bao ? this.tenDanh(E) : null, dD = tD && this.coDai(tD, co * kc * ATK_K);
        const lop = (v, l, al) => { // 1 lớp hướng nhìn v (đi sang trái: dải trái thật nếu có, không thì lật dải phải)
          if (dD) {
            const fD = this.khungDanh(E.bao.t / (E.bao.song || 1.4), dD.nf);
            ctx.setTransform(M); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy); // cùng góc lắc với dải đi → không giật góc khi đổi dải
            this.veThan(ctx, dD, { ten: tD, px: co * kc * ATK_K }, fD, -1, 0, C * ATK_K, bay, dong, fl, al, true);
            E._tHv = tD; E._lat = 1; E._kHv = ATK_K; E._f = fD; return;
          }
          const tL = v === 's' && l < 0 ? this.tenTrai(ten) : null;
          const tS = tL || this.tenHuong(ten, v), d = tS ? this.coDai(tS, co * kc) : dai; if (!d) return;
          const lat = tS && !tL && v === 's' && l < 0 ? -1 : 1;
          ctx.setTransform(M); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(lat * sx, sy);
          this.veThan(ctx, d, { ten: tS || ten, px: co * kc }, f0, f1, fr, C, bay, dong, fl, al, true);
          E._tHv = tS || ten; E._lat = lat; E._kHv = 1;
        };
        const u = (t - E._hvT) / HUONG_HOA;
        lop(E._hv, E._hl, 1);
        if (u < 1 && E._hvCu && !dD && !HUONG_CHUNG.has(ten.replace(/_8$/, ''))) { const tN = E._tHv, lN = E._lat; lop(E._hvCu, E._hlCu, 1 - u * u * (3 - 2 * u)); E._tHv = tN; E._lat = lN; } // hướng cũ mờ dần 120 ms
        E._gv = rot;
        ctx.setTransform(M); ctx.globalAlpha = 1;
      }
      if (st.n) this.veStV2(ctx, E, st, x, y, co, t);
      if (E.docT > 0 && !st.doc && Math.random() < 0.06) FX.hat1('lua', x + rnd(-8, 8), y, 0, -20, 0.5, 6, '#9dff5a');
      // ---- thanh máu (không lắc theo nhún để dễ đọc) ----
      const yb = E.y + hover;
      if (E.hp < E.max && !E.trum) {
        const w = Math.max(18, co * 0.55), yy = yb - co * 0.42;
        PX.thanh(ctx, E.x - w / 2, yy, w, 3, E.hp / E.max, E.docT > 0 ? '#7cff4a' : (lanh ? '#6fd8ff' : '#ff4a4a'));
      }
      // (bỏ bông tuyết cạnh thanh máu — người dùng 08/11; bị chậm vẫn thấy: thanh máu xanh băng + vòng gió lạnh / băng trên thân)
      if (E.trum) {
        const w = 70, yy = yb - co * 0.6; // 0.55 → 0.6: đỉnh nảy của mad_crown/freezer/joker_king chạm thanh máu
        PX.thanh(ctx, clamp(E.x + lech, w / 2 + 2, W - w / 2 - 2) - w / 2, yy, w, 4, E.hp / E.max, TRUM[E.trum].mau);
        if (E.bao) { // dây báo chiêu tới ụ bị nhắm: tia PNG tô màu trùm, lặp + trượt (thay nét đứt vẽ code)
          const B = G.ban[E.ban];
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (const T of B.t) if (T && E.bao.muc.includes(T.uid)) { const c = B.o[T.o]; PX.tia(ctx, x, y, c.x, c.y, 2, TRUM[E.trum].mau, 0.7, t * 60); }
          ctx.restore(); ctx.globalAlpha = 1;
        }
      }
    }
  },
});
