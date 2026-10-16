// BƯỚC 2 — PHIÊN A: SỔ YÊU QUÁI (docs/ke-hoach/buoc-2/KE-HOACH.md mục 1.1, mục 2, mục 4 "Phiên A"; báo cáo: bao-cao-phien-A.md)
// Ông Từ (sân đình), thẻ "Sổ": 3 mục vùng, mỗi vùng một lưới ô quái; chạm ô → trang chi tiết bên phải. Ô chưa gặp: bóng đen + "?".
// Mỗi trang 4 nấc: Đã gặp · ★ Đã hạ · ★★ Tìm ra điểm yếu (hạ bằng hệ khắc chế; trùm vùng: đạt sao thứ ba) · ★★★ Thuần thục (hạ đủ số con).
// Thưởng mỗi nấc và thưởng vùng: bấm "Nhận" (bảng số: G.SO_YQ ở cuối js/data.js). Bản lưu: G.save.so (dựng / sửa ở js/su_kien.js):
//   so = { v: 1, q: { <mã quái>: { g: đã gặp, h: số lần hạ, k: tìm ra điểm yếu, n: bit đã nhận nấc 1/2/4, l: bit lớp thích nghi (trùm vùng) } },
//          vung: { <0..2>: bit đã nhận thưởng vùng 1 (★★ đủ) / 2 (★★★ đủ) }, bu: 1 (đã bù từ bản lưu cũ) }
// Chỉ NGHE sự kiện của js/su_kien.js (gapQuai, haQuai, hetAi, vaoAi, vaoPhong): không sửa combat.js / stage.js, không gọi G.rnd, không đổi sát thương.
// Nạp sau js/village.js (cần G.villageApi.PANELS), trước js/cloud.js (bọc G.fixSave trước khi mây nạp).
// Cờ quay lui ?soyq=0 (G.SO_YQ_BAT = false): không nghe, không bù, thẻ "Sổ" ẩn; dữ liệu so trong bản lưu giữ nguyên. ?sukien=0 cũng tắt.
// Ảnh (Phiên D: gd-so-trang, gd-so-o-0/1/2, gd-so-dau-fire/poison/ice, gd-so-sao-0..3): chưa có thì vẽ code tạm (veKhungTrang, veO, veDau, veSao).
//
// API cho Phiên B / C / E:
//   G.soYQ.bat() · G.soYQ.BANG[mã] → { ma, vung, loai, he } · G.soYQ.trangVung(r) · G.soYQ.nac(sv, mã) → bit 1/2/4 đã đạt
//   G.soYQ.dem(sv) → { tong, gap, sao1, sao2, sao3 } (Thành tựu "Chép sổ", "Sổ đủ trang"; Việc hôm nay "Hạ 8 con <tên>", "Tìm ra điểm yếu")
//   G.soYQ.vung(sv, r) → { tong, sao2, sao3, du2, du3, nhan, cho } · G.soYQ.coCho(sv) · G.soYQ.nhan(sv, mã) · G.soYQ.nhanVung(sv, r) · G.soYQ.nhanHet(sv)
//   G.soYQ.danhHieu(sv) → [{ ma: 'thoSan0'…'bacThay2', ten }] danh hiệu đã nhận từ sổ (Phiên C gộp vào danh sách danh hiệu) · G.soYQ.tenDanhHieu(ma)
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.SO_YQ) return;
  if (G.SO_YQ_BAT === undefined) { let tat = false; try { tat = /[?&]soyq=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.SO_YQ_BAT = !tat; }
  const CF = G.SO_YQ, ui = G.ui;
  const Y = (G.soYQ = {});
  const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  Y.bat = () => G.SO_YQ_BAT !== false && !!(G.suKien && G.suKien.bat && G.suKien.bat());

  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Sân đình: sổ yêu quái': 'Village Yard: monster book',
    'Quái thường': 'Monster', 'Trùm nhỏ': 'Mini boss', 'Trùm vùng': 'Region boss',
    '{0} · {1}': '{0} · {1}', 'Hạ {0}/{1}': 'Beaten {0}/{1}', 'Điểm yếu: {0}': 'Weak to: {0}', 'Điểm yếu: ?': 'Weak to: ?',
    'Điểm yếu: sao thứ ba': 'Weak spot: third star', 'Chưa gặp': 'Not met yet', '???': '???',
    'Sổ yêu quái: {0} — trang mới!': 'Monster book: {0} — new page!', 'Sổ yêu quái: {0} — tìm ra điểm yếu!': 'Monster book: {0} — weak spot found!',
    'Sổ yêu quái: {0} trang mới': 'Monster book: {0} new pages', 'Sổ yêu quái: {0} — thuần thục!': 'Monster book: {0} — mastered!',
    'Chưa gặp con này. Đi các ải vùng {0} để tìm nó.': 'Not met yet. Play the {0} stages to find it.',
    'Hạ nó lần đầu để ông chép mẹo đánh vào sổ.': 'Beat it once and I will write its fighting tip in the book.',
    'Tinh anh khoẻ gấp năm lần quái thường và mang một dấu hiệu trên đầu (Nhanh, Bọc giáp, Nổ khi chết, Hút máu): đọc dấu hiệu, giữ khoảng cách, né vạch đỏ rồi đánh.':
      'Elites are five times as tough and carry a sign on their head (Fast, Armored, Explodes, Life steal): read the sign, keep your distance, dodge the red lines, then strike.',
    'Trùm nhỏ báo trước mọi đòn mạnh bằng vạch đỏ: né ra khỏi vạch, đánh ngay lúc nó vừa ra đòn xong.':
      'Mini bosses warn every big attack with red lines: step out of the line, then hit right after the attack ends.',
    'Lớp thích nghi đã gặp: {0}': 'Adaptations seen: {0}', 'Lớp thích nghi đã gặp: chưa có': 'Adaptations seen: none yet',
    'Vết sẹo: {0}': 'Scar: {0}', 'Vết sẹo: chưa có': 'Scar: none', 'Hạ nhanh nhất: {0}': 'Fastest win: {0}', 'Hạ nhanh nhất: —': 'Fastest win: —',
    'Sao cao nhất ở ải trùm: {0}/3': 'Best stars at the boss stage: {0}/3', 'Kháng {0}': 'Resists {0}', 'Bắt bài lăn né': 'Reads your rolls',
    'Hạ trùm mà đạt sao thứ ba (đánh bằng hệ khắc chế lúc nó kháng) là tìm ra điểm yếu.': 'Beat the boss with the third star (hit it with the counter element while it resists) to find its weak spot.',
    'Quà: {0}': 'Reward: {0}', 'Nấc sau: {0}': 'Next step: {0}', 'Đã nhận đủ quà trang này.': 'All rewards of this page taken.',
    '★ {0} vàng': '★ {0} gold', '★★ {0} linh khí': '★★ {0} spirit', '★★★ {0} đá nâng bậc': '★★★ {0} tier stones', '★★★ viền vàng': '★★★ gold frame',
    '{0} giây': '{0} s', 'Nhận': 'Claim', 'Hoàn thành vùng': 'Region complete',
    '★★ {0}/{1} · ★★★ {2}/{1}': '★★ {0}/{1} · ★★★ {2}/{1}',
    'Đủ {0} trang ★★: {1} đá nâng bậc + danh hiệu "{2}"': 'All {0} pages ★★: {1} tier stones + title "{2}"',
    'Đủ {0} trang ★★★: danh hiệu "{1}"': 'All {0} pages ★★★: title "{1}"', 'Đã xong cả vùng!': 'Region done!',
    'Thợ săn {0}': '{0} Hunter', 'Bậc thầy {0}': '{0} Master',
    '{0} linh khí': '{0} spirit', '{0} đá nâng bậc': '{0} tier stones', '+{0} vàng': '+{0} gold', '+{0} linh khí': '+{0} spirit', '+{0} đá nâng bậc': '+{0} tier stones', 'Danh hiệu mới: {0}': 'New title: {0}',
    'Có trang sổ chép xong rồi, cháu bấm Nhận để lấy quà nhé.': 'Some pages are done. Tap Claim to take your reward.',
    'Hoá ra nó sợ {0}!': 'So it fears {0}!', 'Né vạch đỏ báo trước, đánh ngay lúc nó vừa ra đòn xong.': 'Dodge the red warning lines, then strike right after its attack.',
    'Trùm kháng hệ nào thì sợ hệ khắc chế hệ đó. Cháu tìm ra rồi!': 'Whatever a boss resists, it fears the counter element. You found it!',
    'Gặp con nào ông chép con đó vào sổ. Đánh bằng hệ khắc chế để tìm ra điểm yếu của nó.': 'I write down every monster you meet. Beat one with its counter element to find its weak spot.',
    'Con này cháu chưa gặp. Bóng đen thôi, ông cũng chịu.': 'You have not met this one. Just a shadow, I cannot tell either.',
    'Cả vùng đã tìm ra điểm yếu. Cháu giỏi lắm!': 'Every weak spot in this region found. Well done!',
  });

  // ---------- bảng ----------
  const BANG = {};
  CF.trang.forEach((t, i) => { BANG[t[0]] = { ma: t[0], vung: t[1], loai: t[2], he: t[3] || null, i }; });
  Y.BANG = BANG;
  let SO_VUNG = 0;
  for (const t of CF.trang) SO_VUNG = Math.max(SO_VUNG, t[1] + 1);
  Y.soVung = () => SO_VUNG;
  Y.trangVung = (r) => CF.trang.filter((t) => t[1] === r).map((t) => BANG[t[0]]);
  const ten = (ma) => { const d = G.monsterArt && G.monsterArt._defs && G.monsterArt._defs[ma]; return (d && d.ten) || ma; };
  Y.ten = ten;
  const tenVung = (r) => (G.REGIONS[r] ? G.REGIONS[r].name : '?');
  const theo = (a, r) => (Array.isArray(a) ? num(a[Math.min(r, a.length - 1)], 0) : num(a, 0));
  const canHa = (D) => Math.max(1, num(CF.can[D.loai], 30));
  const BIT_LOP = { fire: 1, poison: 2, ice: 4, antiRanged: 8, antiMelee: 16, antiDodge: 32 };

  // ---------- đọc / ghi bản lưu ----------
  const viet = (sv) => { const o = sv && sv.so; return obj(o) && obj(o.q) && o.v === 1 ? o : null; }; // v > 1 (bản game mới hơn): chỉ đọc, không ghi
  const doc = (sv) => { const o = sv && sv.so; return obj(o) && obj(o.q) ? o : null; };
  // Bản lưu chưa qua G.fixSave (vd. "Xoá hết" ở Anh Mõ: G.resetSave = G.newSave, không có so) → dựng phần so bằng hàm sửa của js/su_kien.js.
  function dam(sv) {
    if (!obj(sv) || obj(sv.so) || !Y.bat() || !(G.suKien && G.suKien.suaBanLuu)) return;
    try { G.suKien.suaBanLuu(sv); suaRieng(sv); Y.bu(sv); } catch (e) { /* bỏ qua: không ghi được thì thôi */ }
  }
  function ghi(sv, ma) {
    dam(sv);
    const o = viet(sv);
    if (!o) return null;
    let t = o.q[ma];
    if (!obj(t)) t = o.q[ma] = { g: 0, h: 0, k: 0, n: 0 };
    return t;
  }
  // nấc đã đạt: bit 1 = ★ đã hạ, 2 = ★★ tìm ra điểm yếu, 4 = ★★★ thuần thục
  function nacT(t, D) {
    if (!t || !D) return 0;
    const h = num(t.h, 0);
    let m = 0;
    if (h >= 1) m |= 1;
    if (h >= 1 && t.k) m |= 2;
    if (h >= canHa(D)) m |= 4;
    return m;
  }
  Y.nac = (sv, ma) => { const o = doc(sv || G.save); return o ? nacT(o.q[ma], BANG[ma]) : 0; };
  const choT = (t, D) => (t ? nacT(t, D) & ~num(t.n, 0) & 7 : 0);
  Y.cho = (sv, ma) => { const o = doc(sv || G.save); return o ? choT(o.q[ma], BANG[ma]) : 0; };
  Y.thuongNac = function (D, bit) {
    const q = { vang: 0, lk: 0, da: 0 };
    if (bit & 1) q.vang += theo(CF.vang[D.loai], D.vung);
    if (bit & 2) q.lk += num(CF.lk[D.loai], 0);
    if (bit & 4) q.da += num(CF.da[D.loai], 0);
    return q;
  };
  Y.dem = function (sv) {
    const o = doc(sv || G.save), r = { tong: CF.trang.length, gap: 0, sao1: 0, sao2: 0, sao3: 0 };
    if (!o) return r;
    for (const t of CF.trang) {
      const q = o.q[t[0]], m = nacT(q, BANG[t[0]]);
      if (q && (q.g || m)) r.gap++;
      if (m & 1) r.sao1++;
      if (m & 2) r.sao2++;
      if (m & 4) r.sao3++;
    }
    return r;
  };
  Y.vung = function (sv, r) {
    const o = doc(sv || G.save), ds = Y.trangVung(r), kq = { tong: ds.length, sao2: 0, sao3: 0, du2: false, du3: false, nhan: 0, cho: 0 };
    if (!o) return kq;
    for (const D of ds) { const m = nacT(o.q[D.ma], D); if (m & 2) kq.sao2++; if (m & 4) kq.sao3++; }
    kq.du2 = ds.length > 0 && kq.sao2 === ds.length;
    kq.du3 = ds.length > 0 && kq.sao3 === ds.length;
    kq.nhan = num(obj(o.vung) ? o.vung[r] : 0, 0) & 3;
    kq.cho = ((kq.du2 ? 1 : 0) | (kq.du3 ? 2 : 0)) & ~kq.nhan;
    return kq;
  };
  Y.coChoVung = function (sv, r) {
    const o = doc(sv || G.save);
    if (!o) return false;
    if (Y.vung(sv, r).cho) return true;
    return Y.trangVung(r).some((D) => choT(o.q[D.ma], D));
  };
  Y.coCho = function (sv) {
    sv = sv || G.save;
    if (!Y.bat() || !doc(sv)) return false;
    for (let r = 0; r < SO_VUNG; r++) if (Y.coChoVung(sv, r)) return true;
    return false;
  };
  Y.tenDanhHieu = function (ma) {
    const m = /^(thoSan|bacThay)(\d+)$/.exec(String(ma || ''));
    if (!m) return '';
    return G.t(m[1] === 'thoSan' ? 'Thợ săn {0}' : 'Bậc thầy {0}', tenVung(+m[2]));
  };
  Y.danhHieu = function (sv) {
    const o = doc(sv || G.save), ds = [];
    if (!o || !obj(o.vung)) return ds;
    for (let r = 0; r < SO_VUNG; r++) {
      const b = num(o.vung[r], 0);
      if (b & 1) ds.push({ ma: 'thoSan' + r, ten: Y.tenDanhHieu('thoSan' + r) });
      if (b & 2) ds.push({ ma: 'bacThay' + r, ten: Y.tenDanhHieu('bacThay' + r) });
    }
    return ds;
  };

  // ---------- thưởng (bấm Nhận) ----------
  function trao(sv, q) {
    if (q.vang > 0) sv.gold = Math.max(0, num(sv.gold, 0)) + q.vang;
    if (q.lk > 0) { if (G.vkMoi && G.vkMoi.themLk) G.vkMoi.themLk(sv, q.lk); else sv.linhKhi = Math.max(0, num(sv.linhKhi, 0)) + q.lk; }
    if (q.da > 0) { if (G.epDo && G.epDo.themDa) G.epDo.themDa(sv, q.da); else sv.daBac = Math.max(0, num(sv.daBac, 0)) + q.da; }
  }
  // Nhận mọi nấc đã đạt mà chưa nhận của một trang. Trả về { vang, lk, da } hoặc null. Không lưu (nơi gọi G.persist()).
  Y.nhan = function (sv, ma) {
    sv = sv || G.save;
    dam(sv);
    const D = BANG[ma], o = viet(sv);
    if (!D || !o || !Y.bat()) return null;
    const t = o.q[ma], cho = choT(t, D);
    if (!cho) return null;
    const q = Y.thuongNac(D, cho);
    t.n = (num(t.n, 0) | cho) & 7;
    trao(sv, q);
    return q;
  };
  // Thưởng vùng: bit 1 (mọi trang ★★) = đá nâng bậc + danh hiệu "Thợ săn", bit 2 (mọi trang ★★★) = danh hiệu "Bậc thầy".
  Y.nhanVung = function (sv, r) {
    sv = sv || G.save;
    dam(sv);
    const o = viet(sv);
    if (!o || !Y.bat()) return null;
    const v = Y.vung(sv, r);
    if (!v.cho) return null;
    const q = { vang: 0, lk: 0, da: v.cho & 1 ? theo(CF.vungDa, r) : 0, dh: [] };
    if (v.cho & 1) q.dh.push('thoSan' + r);
    if (v.cho & 2) q.dh.push('bacThay' + r);
    if (!obj(o.vung)) o.vung = {};
    o.vung[r] = (num(o.vung[r], 0) | v.cho) & 3;
    trao(sv, q);
    return q;
  };
  // Nhận hết (cho bot đo cân bằng: tests/cay.py --pre; và nếu sau này cần nút "Nhận hết")
  Y.nhanHet = function (sv) {
    sv = sv || G.save;
    const tong = { vang: 0, lk: 0, da: 0, dh: [] };
    for (const t of CF.trang) { const q = Y.nhan(sv, t[0]); if (q) { tong.vang += q.vang; tong.lk += q.lk; tong.da += q.da; } }
    for (let r = 0; r < SO_VUNG; r++) { const q = Y.nhanVung(sv, r); if (q) { tong.da += q.da; tong.dh = tong.dh.concat(q.dh); } }
    return tong;
  };

  // ---------- bù bản lưu cũ (một lần, cờ so.bu) ----------
  // Vùng đã qua ải: quái thường + tinh anh "Đã gặp"; qua ải 1-4 của vùng: trùm nhỏ "Đã gặp"; có sao ải 5: trùm vùng "Đã hạ"; sao ải 5 = 3: "Tìm ra điểm yếu".
  // Phần còn lại bé tự điền (game cũ chưa đếm từng con). Thưởng các nấc này vẫn phải bấm Nhận.
  Y.bu = function (sv) {
    const o = viet(sv);
    if (!o || o.bu) return false;
    const sao = (k) => Math.max(num(sv.stars && sv.stars[k], 0), num(sv.stars2 && sv.stars2[k], 0));
    for (let r = 0; r < SO_VUNG; r++) {
      const qua = (i) => sao(r + '-' + i);
      const coAi = [0, 1, 2, 3, 4].some((i) => qua(i) > 0), coNho = [0, 1, 2, 3].some((i) => qua(i) > 0);
      for (const D of Y.trangVung(r)) {
        if (D.loai === 'thuong' || D.loai === 'tinhanh') { if (coAi) ghi(sv, D.ma).g = 1; }
        else if (D.loai === 'trumnho') { if (coNho) ghi(sv, D.ma).g = 1; }
        else if (D.loai === 'trum' && qua(4) > 0) {
          const t = ghi(sv, D.ma);
          t.g = 1; t.h = Math.max(num(t.h, 0), 1);
          if (qua(4) >= 3) t.k = 1;
        }
      }
    }
    o.bu = 1;
    return true;
  };
  // sửa phần riêng của sổ (trường l của trùm vùng) — js/su_kien.js đã sửa g / h / k / n
  function suaRieng(sv) {
    const o = viet(sv);
    if (!o) return;
    for (const m of Object.keys(o.q)) { const t = o.q[m]; if (obj(t) && 'l' in t) { const l = Math.floor(num(t.l, 0)); if (l > 0) t.l = l & 63; else delete t.l; } }
  }

  if (!Y.bat()) return; // ?soyq=0 / ?sukien=0: không bọc, không nghe, thẻ "Sổ" ẩn (hàm rỗng của Phiên 0 giữ nguyên)

  if (G.fixSave && !G.fixSave.soYqBoc) {
    const goc = G.fixSave;
    G.fixSave = function () {
      const r = goc.apply(this, arguments);
      try { if (obj(r)) { suaRieng(r); Y.bu(r); } } catch (e) { console.error('Linh Khí: lỗi khi bù sổ yêu quái (bỏ qua)', e); }
      return r;
    };
    Object.assign(G.fixSave, goc); // giữ các cờ "đã bọc" của lớp trong (suKienBoc, aiNgayBoc…) để không bị bọc lại
    G.fixSave.soYqBoc = true;
  }
  try { if (obj(G.save)) { suaRieng(G.save); Y.bu(G.save); } } catch (e) { /* bỏ qua */ }

  // ---------- nghe sự kiện trong ải ----------
  // Dòng báo nhỏ (W.banner) chỉ khi không có dòng báo khác (không đè mẹo lần đầu gặp, tên trùm…); bot (G.noRender) không có dòng báo.
  const hang = [];
  function baoNgay() {
    if (!hang.length) return;
    const W = G.getWorld ? G.getWorld() : null;
    if (!W || W.banner || W.over) return;
    W.banner = { s: hang.shift(), col: '#f6dc92', t: 2.2 };
  }
  function bao(s) { if (G.noRender || (G.moDan && !G.moDan.co('so'))) return; // sổ chưa mở (mở dần): vẫn ghi, không báo
    hang.push(s); if (hang.length > 4) hang.shift(); baoNgay(); }
  let luot = { moi: 0, trumHa: false, dong: [] };
  const K = G.suKien;
  K.on('vaoAi', () => { luot = { moi: 0, trumHa: false, dong: [] }; hang.length = 0; });
  K.on('vaoPhong', baoNgay);
  K.on('gapQuai', (d) => {
    const D = BANG[d.ma];
    if (!D) { baoNgay(); return; }
    const t = ghi(G.save, d.ma);
    if (t && !t.g) { t.g = 1; luot.moi++; bao(G.t('Sổ yêu quái: {0} — trang mới!', ten(d.ma))); } else baoNgay();
  });
  K.on('haQuai', (d) => {
    const D = BANG[d.ma];
    if (!D) { baoNgay(); return; }
    const t = ghi(G.save, d.ma);
    if (!t) return;
    if (!t.g) { t.g = 1; luot.moi++; }
    const truoc = nacT(t, D);
    t.h = Math.min(1e9, num(t.h, 0) + 1);
    if (D.loai === 'trum') luot.trumHa = true;
    // ★★: đòn kết liễu mang hệ khắc chế, hoặc quái đang dính hiệu ứng hệ đó do vũ khí gây (trùm vùng: tính ở hetAi bằng sao thứ ba)
    else if (!t.k && D.he && (d.el === D.he || (d.he && d.he[D.he]))) { t.k = 1; bao(G.t('Sổ yêu quái: {0} — tìm ra điểm yếu!', ten(d.ma))); }
    const sau = nacT(t, D);
    if ((sau & 4) && !(truoc & 4)) bao(G.t('Sổ yêu quái: {0} — thuần thục!', ten(d.ma)));
    baoNgay();
  });
  K.on('hetAi', (d) => {
    try {
      if (d.trumVung && d.win && !d.aiNgay && G.REGIONS[d.r]) {
        const ma = G.MOB_ART && G.MOB_ART.boss ? G.MOB_ART.boss[G.REGIONS[d.r].boss] : null, D = BANG[ma], t = D ? ghi(G.save, ma) : null;
        if (t) {
          if (!t.g) { t.g = 1; luot.moi++; }
          if (!luot.trumHa) t.h = Math.min(1e9, num(t.h, 0) + 1); // trùm gục ngoài G.kill (phòng hờ): vẫn đếm một lần hạ
          const S = d.S || {};
          let l = num(t.l, 0);
          for (const x of S.layers || []) { const b = x.type === 'resist' ? BIT_LOP[x.el] : BIT_LOP[x.type]; if (b) l |= b; }
          if (l) t.l = l & 63;
          if (d.khacChe && !t.k) { t.k = 1; luot.dong.push(G.t('Sổ yêu quái: {0} — tìm ra điểm yếu!', ten(ma))); }
        }
      }
      const R = d.R;
      if (R && Array.isArray(R.lines)) {
        if (luot.moi > 0) R.lines.push(G.t('Sổ yêu quái: {0} trang mới', luot.moi));
        for (const s of luot.dong) R.lines.push(s);
      }
    } finally { luot = { moi: 0, trumHa: false, dong: [] }; hang.length = 0; }
  });

  // ---------- giao diện: thẻ "Sổ" của Ông Từ ----------
  const VA = G.villageApi, T = G.theme;
  if (!VA || !VA.PANELS || !T) return;
  const CX = 160, CW = 304;
  const MUC = '#3a2414', MUC2 = '#6a4a2a', DO = '#b8281e', GOLD = '#f6dc92', TXT = '#f1e6c6', SOFT = '#a9c2b4', GOOD = '#9be07a';
  // Phiên D: ảnh docs/anh-goc/buoc-2 (cat_buoc_2.py) — gd-so-trang, gd-so-o-*, gd-so-dau-*, gd-so-sao-*, hu-nhan-thuong, hu-dong-dau.
  // ?khunganh=0 (G.KHUNG_ANH = false): bỏ ảnh, vẽ code như trước Phiên D.
  const gd = (ma) => { const s = G.spriteCustom; return G.KHUNG_ANH !== false && s && s.gdSan ? s.gdSan(ma) : null; };
  const veGd = (ma, x, y, w, h) => { const g = gd(ma); return !!(g && G.spriteCustom.veGd(G.ux, g, x, y, w, h)); };
  // hiệu ứng ảnh trên bảng (bấm Nhận / đóng dấu): { ma, x, y, t0, co } — vẽ mỗi khung trong panel(), hết thì bỏ
  const FXB = { ds: [] };
  const coHu = (ma) => G.KHUNG_ANH !== false && G.HU_MO !== false && !!(G.fxAnh && G.fxAnh.co && G.fxAnh.co(ma));
  function phatHu(ma, x, y, co) { if (coHu(ma)) FXB.ds.push({ ma, x, y, co: co || 1, t0: G.time || 0 }); }
  function veHu() {
    const FA = G.fxAnh;
    FXB.ds = FXB.ds.filter((f) => {
      const gy = FA && FA.giay ? FA.giay(f.ma) || 0.8 : 0, t = (G.time || 0) - f.t0;
      if (!FA || t < 0 || t >= gy) return false;
      FA.ve(G.ux, f.ma, f.x, f.y, t, 0, f.co, false, t > gy * 0.75 ? Math.max(0, 1 - (t - gy * 0.75) / (gy * 0.25)) : 1);
      return true;
    });
  }
  const chu = (s, x, y, w, h, o) => T.chuTrongKhung(s, x, y, w, h, Object.assign({ vien: [0, 0, 0, 0], dem: 1, align: 'left', size: 7, min: 6.5, bold: false, color: MUC, shadow: false }, o || {}));
  const tenLoai = (D) => (D.loai === 'thuong' ? 'Quái thường' : D.loai === 'tinhanh' ? 'Tinh anh' : D.loai === 'trumnho' ? 'Trùm nhỏ' : 'Trùm vùng');
  function vaiCua(D) {
    if (D.loai !== 'thuong' || !G.MOB_ART) return '';
    for (const k in G.ROLES) { const a = G.MOB_ART[k]; if (Array.isArray(a) && a[D.vung] === D.ma && G.ROLES[k]) return G.ROLES[k].name; }
    return '';
  }
  const meoCua = (D) => {
    const m = G.knQuai && G.knQuai.meo ? G.knQuai.meo(D.ma) : null;
    if (m && m[1]) return m[1];
    if (D.loai === 'tinhanh') return 'Tinh anh khoẻ gấp năm lần quái thường và mang một dấu hiệu trên đầu (Nhanh, Bọc giáp, Nổ khi chết, Hút máu): đọc dấu hiệu, giữ khoảng cách, né vạch đỏ rồi đánh.';
    if (D.loai === 'trumnho') return 'Trùm nhỏ báo trước mọi đòn mạnh bằng vạch đỏ: né ra khỏi vạch, đánh ngay lúc nó vừa ra đòn xong.';
    return 'Né vạch đỏ báo trước, đánh ngay lúc nó vừa ra đòn xong.';
  };
  function chuQua(q) {
    const a = [];
    if (q.vang) a.push(G.t('{0} vàng', q.vang));
    if (q.lk) a.push(G.t('{0} linh khí', q.lk));
    if (q.da) a.push(G.luyen && G.luyen.bat() ? G.t('{0} nguyên liệu rèn', q.da * G.QUY_DOI.da) : G.t('{0} đá nâng bậc', q.da)); // Luyện: đá → NLR
    return a.join(' · ');
  }

  // hình quái (ảnh AI qua js/sprite_custom.js nếu có) thu cho vừa ô; den = bóng đen (ô chưa gặp)
  let cvBong = null;
  function veQuai(ma, x, y, w, h, den) {
    const MA = G.monsterArt;
    if (!MA || !MA._defs || !MA._defs[ma]) return;
    const cao = Math.max(12, num(MA.cao ? MA.cao(ma) : 0, 24)), s = Math.min(1.1, (h - 5) / cao, (w - 2) / Math.max(cao * 0.9, 16));
    const o = { anim: 'idle', t: den ? 0 : G.time || 0, face: 1, dir: 0, phase: 1, bao: false, fx: false };
    const c = G.ux;
    if (!den) {
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      c.translate(x + w / 2, y + h - 3); c.scale(s, s);
      try { MA.draw(c, ma, 0, 0, o); } catch (e) { /* thiếu hình: bỏ */ }
      c.restore();
      return;
    }
    // bóng đen: vẽ vào tấm phụ rồi phủ đen theo hình (giữ dáng, không lộ màu)
    if (typeof document === 'undefined' || !document.createElement) return;
    const k = Math.max(1, Math.ceil(G.uiScale || 1)), W = Math.ceil(w * k), H = Math.ceil(h * k);
    if (!cvBong) cvBong = document.createElement('canvas');
    if (cvBong.width !== W || cvBong.height !== H) { cvBong.width = W; cvBong.height = H; }
    const b = cvBong.getContext && cvBong.getContext('2d');
    if (!b) return;
    b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, W, H); b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1;
    b.save(); b.scale(k, k); b.translate(w / 2, h - 3); b.scale(s, s);
    try { MA.draw(b, ma, 0, 0, o); } catch (e) { /* bỏ */ }
    b.restore();
    b.globalCompositeOperation = 'source-in'; b.fillStyle = '#07080c'; b.fillRect(0, 0, W, H); b.globalCompositeOperation = 'source-over';
    c.save(); c.globalAlpha = 0.92; c.drawImage(cvBong, x, y, w, h); c.restore();
  }
  // sao nấc: kind 0 trống · 1 đồng · 2 bạc · 3 vàng
  const MAU_SAO = [['#2a221c', '#6a5a48'], ['#c47a3a', '#ffd0a0'], ['#b8c4cc', '#ffffff'], ['#f0b82a', '#fff6b0']];
  function veSao(x, y, s, kind) {
    if (veGd('gd-so-sao-' + kind, x, y, s, s)) return;
    const c = G.ux, cx = x + s / 2, cy = y + s / 2 + 0.3, R = s / 2, r = R * 0.45;
    c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r : R; c.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); }
    c.closePath();
    c.fillStyle = MAU_SAO[kind][0]; c.fill();
    c.lineWidth = 0.8; c.strokeStyle = kind ? '#14182e' : MAU_SAO[0][1]; c.stroke();
    if (kind) { c.fillStyle = MAU_SAO[kind][1]; c.fillRect(Math.round(cx - 1), Math.round(cy - R * 0.45), 1, 1); }
  }
  // dấu đỏ "đã tìm điểm yếu" có hình hệ bên trong
  function veDau(cx, cy, r, he) {
    if (veGd('gd-so-dau-' + he, cx - r, cy - r, r * 2, r * 2)) return;
    const c = G.ux;
    c.save(); c.globalAlpha = 0.88;
    c.beginPath(); c.arc(cx, cy, r, 0, 7); c.lineWidth = 1.6; c.strokeStyle = DO; c.stroke();
    c.beginPath(); c.arc(cx, cy, r - 2.4, 0, 7); c.lineWidth = 0.7; c.stroke();
    c.fillStyle = DO; c.strokeStyle = DO; c.lineWidth = 1.2;
    const u = r * 0.5;
    if (he === 'fire') { c.beginPath(); c.moveTo(cx, cy - u * 1.2); c.quadraticCurveTo(cx + u, cy, cx, cy + u); c.quadraticCurveTo(cx - u, cy, cx, cy - u * 1.2); c.fill(); }
    else if (he === 'poison') { c.beginPath(); c.moveTo(cx, cy - u * 1.1); c.quadraticCurveTo(cx + u * 0.9, cy + u * 0.2, cx, cy + u); c.quadraticCurveTo(cx - u * 0.9, cy + u * 0.2, cx, cy - u * 1.1); c.fill(); }
    else if (he === 'ice') { for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; c.beginPath(); c.moveTo(cx - Math.cos(a) * u, cy - Math.sin(a) * u); c.lineTo(cx + Math.cos(a) * u, cy + Math.sin(a) * u); c.stroke(); } }
    else { c.beginPath(); c.arc(cx, cy, u * 0.6, 0, 7); c.fill(); }
    c.restore();
  }
  // khung trang sổ (giấy cũ, nẹp đồng) — chờ ảnh gd-so-trang
  function veKhungTrang(x, y, w, h, vang) {
    const g = gd('gd-so-trang');
    if (g && G.spriteCustom.veGd(G.ux, g, x, y, w, h)) {
      if (vang) { const v = g.vien || [3, 3, 3, 3], c = G.ux; c.lineWidth = 1; c.strokeStyle = '#ffd23f'; c.strokeRect(x + v[3] - 0.5, y + v[0] - 0.5, w - v[1] - v[3] + 1, h - v[0] - v[2] + 1); } // ★★★: viền vàng sát mép giấy
      return;
    }
    const c = G.ux;
    ui.rect(x, y, w, h, '#4a2a18');
    ui.rect(x + 1, y + 1, w - 2, h - 2, vang ? '#e0a82a' : '#a8743a');
    ui.rect(x + 3, y + 3, w - 6, h - 6, '#d9c49a');
    c.fillStyle = 'rgba(120,80,40,0.12)'; for (let i = 0; i < 6; i++) c.fillRect(x + 4 + ((i * 37) % (w - 12)), y + 6 + ((i * 53) % (h - 14)), 5, 3);
    for (const q of [[x + 1, y + 1], [x + w - 4, y + 1], [x + 1, y + h - 4], [x + w - 4, y + h - 4]]) ui.rect(q[0], q[1], 3, 3, vang ? '#fff0a8' : '#f6dc92');
  }
  // ô quái trong lưới — chờ ảnh gd-so-o-0 (chưa gặp) / -1 (đã gặp) / -2 (thuần thục)
  function veO(D, x, y, s, t, chon) {
    const m = nacT(t, D), gap = !!(t && (t.g || m)), cho = choT(t, D);
    const loai = !gap ? 0 : m & 4 ? 2 : 1;
    const anh = veGd('gd-so-o-' + loai, x, y, s, s);
    if (!anh) {
      ui.rect(x, y, s, s, '#14182e');
      ui.rect(x + 1, y + 1, s - 2, s - 2, loai === 0 ? '#3a3a3e' : loai === 2 ? '#e0a82a' : '#a8743a');
      ui.rect(x + 2, y + 2, s - 4, s - 4, loai === 0 ? '#121214' : '#241611');
    }
    // ảnh ô: viền đồng dày ~4 điểm → hình quái vẽ trong lòng ô (dấu "?" của ảnh bị bóng đen che nên vẫn vẽ "?" bằng chữ)
    if (anh) veQuai(D.ma, x + 4, y + 3, s - 8, s - 6, !gap); else veQuai(D.ma, x + 2, y + 1, s - 4, s - 5, !gap);
    if (!gap) T.chuTrongKhung('?', x, y, s, s - 6, { vien: anh ? [4, 4, 0, 4] : [2, 2, 2, 2], size: 11, bold: true, color: '#c8b48a' });
    if (gap) for (let j = 0; j < 3; j++) veSao(x + 2 + j * 7, y + s - 8, 6.5, m & (1 << j) ? j + 1 : 0);
    if (gap && t && t.k && D.he) veDau(x + 6, y + 6, 4, D.he);
    if (cho) { const c = G.ux; c.beginPath(); c.arc(x + s - 3, y + 3, 2.6, 0, 7); c.fillStyle = '#ff5a3a'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = '#14182e'; c.stroke(); }
    if (chon) { const c = G.ux; c.lineWidth = 1; c.strokeStyle = '#fff0a8'; c.strokeRect(x - 0.5, y - 0.5, s + 1, s + 1); }
  }

  function vungMacDinh(sv) {
    const o = doc(sv);
    let r0 = 0;
    for (let r = 0; r < SO_VUNG; r++) {
      if (Y.coChoVung(sv, r)) return r;
      if (o && Y.trangVung(r).some((D) => o.q[D.ma] && o.q[D.ma].g)) r0 = r;
    }
    return r0;
  }
  function chonMacDinh(sv, r) {
    const o = doc(sv), ds = Y.trangVung(r);
    if (!ds.length) return null;
    const a = o ? ds.find((D) => choT(o.q[D.ma], D)) : null;
    return (a || ds[0]).ma;
  }

  function panel() {
    const V = VA.V, sv = G.save;
    VA.khungThe('tu', 'Sân đình: sổ yêu quái');
    const o = doc(sv) || { q: {}, vung: {} };
    if (!(V.soVung >= 0 && V.soVung < SO_VUNG)) { V.soVung = vungMacDinh(sv); V.soSel = null; }
    // thẻ vùng
    const tw = Math.floor((CW - (SO_VUNG - 1) * 3) / SO_VUNG);
    for (let r = 0; r < SO_VUNG; r++) {
      if (T.sbtn(CX + r * (tw + 3), 68, tw, 16, tenVung(r), { size: 7.5, pad: 2, sel: V.soVung === r, dot: Y.coChoVung(sv, r) }) && V.soVung !== r) { V.soVung = r; V.soSel = null; }
    }
    const ds = Y.trangVung(V.soVung);
    if (!V.soSel || !BANG[V.soSel] || BANG[V.soSel].vung !== V.soVung) V.soSel = chonMacDinh(sv, V.soVung);
    // lưới ô (4 cột)
    const O = 31, GAP = 3, GX = CX, GY = 89;
    ds.forEach((D, i) => {
      const x = GX + (i % 4) * (O + GAP), y = GY + Math.floor(i / 4) * (O + GAP);
      veO(D, x, y, O, o.q[D.ma], V.soSel === D.ma);
      if (T.hit(x, y, O, O)) V.soSel = D.ma;
    });
    // hoàn thành vùng
    const vg = Y.vung(sv, V.soVung), bx = CX, by = GY + 3 * (O + GAP) + 1, bw = 4 * O + 3 * GAP, bh = 262 - by;
    T.inset(bx, by, bw, bh, false);
    chu('Hoàn thành vùng', bx + 3, by + 2, bw - 6, 11, { size: 7.5, bold: true, color: GOLD, shadow: undefined });
    chu(G.t('★★ {0}/{1} · ★★★ {2}/{1}', vg.sao2, vg.tong, vg.sao3), bx + 3, by + 13, bw - 6, 10, { size: 7, color: TXT, shadow: undefined });
    let mo = '';
    if (!(vg.nhan & 1) && !(vg.cho & 1)) mo = G.t('Đủ {0} trang ★★: {1} đá nâng bậc + danh hiệu "{2}"', vg.tong, theo(CF.vungDa, V.soVung), Y.tenDanhHieu('thoSan' + V.soVung));
    else if (!(vg.nhan & 2) && !(vg.cho & 2)) mo = G.t('Đủ {0} trang ★★★: danh hiệu "{1}"', vg.tong, Y.tenDanhHieu('bacThay' + V.soVung));
    else if (!vg.cho) mo = 'Đã xong cả vùng!';
    const coNut = !!vg.cho;
    if (mo) chu(mo, bx + 3, by + 24, bw - 6, 27, { size: 6.5, dong: 3, gian: 1.5, color: SOFT, shadow: undefined });
    if (coNut && T.sbtn(bx + bw - 54, by + bh - 19, 50, 16, 'Nhận', { size: 8, pad: 2, primary: true })) {
      const q = Y.nhanVung(sv, V.soVung);
      if (q) {
        phatHu('hu-nhan-thuong', bx + bw - 29, by + bh - 4, 0.7);
        G.persist(); if (G.sfx) G.sfx('evolve');
        const a = []; if (q.da) a.push(G.t('+{0} đá nâng bậc', q.da)); for (const d of q.dh) a.push(G.t('Danh hiệu mới: {0}', Y.tenDanhHieu(d)));
        V.msg = a.join(' · '); V.msgT = 3;
        if (G.villageScene && G.villageScene.checkNews) G.villageScene.checkNews();
      }
    }
    // trang chi tiết
    const D = BANG[V.soSel];
    if (D) { const cau = trang(D, o.q[D.ma], sv, V); veHu(); return cau; }
    veHu();
    return 'Gặp con nào ông chép con đó vào sổ. Đánh bằng hệ khắc chế để tìm ra điểm yếu của nó.';
  }

  function trang(D, t, sv, V) {
    const x = CX + 4 * 31 + 3 * 3 + 5, y = 89, w = CX + CW - x, h = 262 - y; // 298..464 × 89..262
    const m = nacT(t, D), gap = !!(t && (t.g || m)), ha = !!(m & 1), cho = choT(t, D);
    veKhungTrang(x, y, w, h, !!(m & 4));
    // lòng trang: ảnh gd-so-trang có "vien" = độ dày viền gỗ + nẹp đồng (cat_buoc_2.py đo) → mọi chữ / hình đặt trong lòng, không đè viền
    const gT = gd('gd-so-trang'), vT = gT && gT.vien ? gT.vien : [5, 5, 5, 5];
    const ix = x + vT[3], iw = w - vT[1] - vT[3], iy = y + vT[0], ir = x + w - vT[1];
    // chân dung (ảnh ô sổ to, như ô trong lưới)
    const px = ix, py = iy, ps = gT ? 41 : 46, loaiO = !gap ? 0 : m & 4 ? 2 : 1;
    const oAnh = veGd('gd-so-o-' + loaiO, px, py, ps, ps);
    if (!oAnh) { ui.rect(px, py, ps, ps, '#14182e'); ui.rect(px + 1, py + 1, ps - 2, ps - 2, m & 4 ? '#e0a82a' : '#8a5a2a'); ui.rect(px + 2, py + 2, ps - 4, ps - 4, '#2a1d14'); }
    if (oAnh) veQuai(D.ma, px + 6, py + 5, ps - 12, ps - 10, !gap); else veQuai(D.ma, px + 2, py + 2, ps - 4, ps - 4, !gap);
    if (!gap) T.chuTrongKhung('?', px, py, ps, ps, { vien: oAnh ? [6, 6, 6, 6] : [2, 2, 2, 2], size: 16, bold: true, color: '#c8b48a' });
    // tên, loại, sao, số lần hạ, điểm yếu
    const tx = px + ps + (gT ? 3 : 5), tw = ir - tx;
    chu(gap ? ten(D.ma) : '???', tx, py, tw, 13, { size: 8.5, bold: true, color: MUC });
    const vai = vaiCua(D);
    chu(gap ? (vai ? G.t('{0} · {1}', G.tv(tenLoai(D)), G.tv(vai)) : G.tv(tenLoai(D))) : 'Chưa gặp', tx, py + 13, tw, 10, { size: 6.5, color: MUC2 });
    for (let j = 0; j < 3; j++) veSao(tx + j * 10, py + 25, 9, m & (1 << j) ? j + 1 : 0);
    if (gap) chu(G.t('Hạ {0}/{1}', Math.min(num(t && t.h, 0), canHa(D)), canHa(D)), tx + 32, py + 24, tw - 32, 11, { size: 6.5, color: MUC2 });
    if (D.loai === 'trum') chu(t && t.k ? 'Điểm yếu: sao thứ ba' : 'Điểm yếu: ?', tx, py + 36, tw, 10, { size: 6.5, bold: !!(t && t.k), color: t && t.k ? DO : MUC2 });
    else chu(t && t.k ? G.t('Điểm yếu: {0}', G.EL[D.he].name) : 'Điểm yếu: ?', tx, py + 36, tw, 10, { size: 6.5, bold: !!(t && t.k), color: t && t.k ? G.EL[D.he].dark : MUC2 });
    if (t && t.k) veDau(px + ps - 9, py + ps - 9, 9, D.he || 'sao');
    // thân trang: mẹo đánh (trùm vùng: lớp thích nghi, vết sẹo, kỷ lục)
    const by = py + 46 + 5, bh = gT ? 52 : 44; // ảnh trang: lòng hẹp hơn (trừ viền) nhưng còn chỗ dưới → cho mẹo đánh thêm một dòng
    ui.rect(ix, by - 2, iw, 1, 'rgba(90,60,30,0.45)');
    if (!gap) chu(G.t('Chưa gặp con này. Đi các ải vùng {0} để tìm nó.', tenVung(D.vung)), ix, by, iw, bh, { size: 6.5, dong: 4, gian: 1.5, color: MUC2 });
    else if (!ha) chu('Hạ nó lần đầu để ông chép mẹo đánh vào sổ.', ix, by, iw, bh, { size: 6.5, dong: 4, gian: 1.5, color: MUC2 });
    else if (D.loai === 'trum') {
      const reg = G.REGIONS[D.vung], l = num(t.l, 0), lop = [];
      for (const e of G.ELS) if (l & BIT_LOP[e]) lop.push(G.t('Kháng {0}', G.EL[e].name));
      if (l & 8) lop.push(G.t('Chống đánh xa')); if (l & 16) lop.push(G.t('Chống áp sát')); if (l & 32) lop.push(G.t('Bắt bài lăn né'));
      const seo = reg && sv.scars ? sv.scars[reg.boss] : null, kl = reg && sv.rec && sv.rec.b ? num(sv.rec.b[reg.boss], 0) : 0;
      const sao = reg ? Math.max(num(sv.stars && sv.stars[D.vung + '-4'], 0), num(sv.stars2 && sv.stars2[D.vung + '-4'], 0)) : 0;
      const n = (kl > 0 ? (Math.round(kl * 10) / 10).toFixed(1) : '');
      const dong = [
        lop.length ? G.t('Lớp thích nghi đã gặp: {0}', lop.join(', ')) : G.t('Lớp thích nghi đã gặp: chưa có'),
        seo && G.EL[seo] ? G.t('Vết sẹo: {0}', G.EL[seo].name) : G.t('Vết sẹo: chưa có'),
        kl > 0 ? G.t('Hạ nhanh nhất: {0}', G.t('{0} giây', G.LANG === 'en' ? n : n.replace('.', ','))) : G.t('Hạ nhanh nhất: —'),
        G.t('Sao cao nhất ở ải trùm: {0}/3', sao),
      ];
      chu(dong[0], ix, by, iw, 17, { size: 6.5, dong: 2, gian: 1, color: MUC });
      for (let i = 1; i < 4; i++) chu(dong[i], ix, by + 17 + (i - 1) * 9, iw, 9, { size: 6.5, color: MUC });
    } else chu(meoCua(D), ix, by, iw, bh, { size: 6.5, dong: gT ? 6 : 5, gian: 1, color: MUC });
    // thưởng
    const qy = by + bh + 3;
    ui.rect(ix, qy - 2, iw, 1, 'rgba(90,60,30,0.45)');
    const nho = num(t && t.n, 0);
    let dongQua = '';
    if (cho) dongQua = G.t('Quà: {0}', chuQua(Y.thuongNac(D, cho)));
    else {
      const ke = [1, 2, 4].find((b) => !(nho & b) && !(m & b));
      if (ke) {
        const q = Y.thuongNac(D, ke);
        const s = ke === 1 ? G.t('★ {0} vàng', q.vang) : ke === 2 ? G.t('★★ {0} linh khí', q.lk) : q.da ? G.t('★★★ {0} đá nâng bậc', q.da) : G.t('★★★ viền vàng');
        dongQua = G.t('Nấc sau: {0}', s);
      } else dongQua = 'Đã nhận đủ quà trang này.';
    }
    chu(dongQua, ix, qy, cho ? iw - 52 : iw, 22, { size: 6.5, dong: 2, gian: 1, bold: !!cho, color: cho ? '#2f6b1a' : MUC2 });
    if (cho && T.sbtn(ir - 48, qy + 2, 48, 18, 'Nhận', { size: 8, pad: 2, primary: true })) {
      const q = Y.nhan(sv, D.ma);
      if (q) {
        if (cho & 2 && t && t.k && D.he) phatHu('hu-dong-dau', px + ps - 9, py + ps - 3, 0.9); // nấc ★★ (tìm ra điểm yếu): con dấu đóng xuống
        else phatHu('hu-nhan-thuong', ir - 24, qy + 18, 0.7);
        G.persist(); if (G.sfx) G.sfx('evolve');
        const a = []; if (q.vang) a.push(G.t('+{0} vàng', q.vang)); if (q.lk) a.push(G.t('+{0} linh khí', q.lk)); if (q.da) a.push(G.t('+{0} đá nâng bậc', q.da));
        V.msg = a.join(' · '); V.msgT = 2.5;
        if (G.villageScene && G.villageScene.checkNews) G.villageScene.checkNews();
      }
    }
    // câu Ông Từ nói
    if (Y.coCho(sv)) return 'Có trang sổ chép xong rồi, cháu bấm Nhận để lấy quà nhé.';
    if (!gap) return 'Con này cháu chưa gặp. Bóng đen thôi, ông cũng chịu.';
    if (t && t.k) return D.he ? G.t('Hoá ra nó sợ {0}!', G.EL[D.he].name) : 'Trùm kháng hệ nào thì sợ hệ khắc chế hệ đó. Cháu tìm ra rồi!';
    if (D.loai === 'trum' && ha) return 'Hạ trùm mà đạt sao thứ ba (đánh bằng hệ khắc chế lúc nó kháng) là tìm ra điểm yếu.';
    if (Y.vung(sv, D.vung).du2) return 'Cả vùng đã tìm ra điểm yếu. Cháu giỏi lắm!';
    return 'Gặp con nào ông chép con đó vào sổ. Đánh bằng hệ khắc chế để tìm ra điểm yếu của nó.';
  }
  panel.mo = (sv) => !G.moDan || G.moDan.co('so', sv); // ghi sổ ngay từ đầu (cả ải hướng dẫn) — KE-HOACH.md mục 1.0; thẻ hiện theo mốc mở dần (js/mo_dan.js)
  panel.cham = (sv) => Y.coCho(sv);
  VA.PANELS.so = panel;
})();
