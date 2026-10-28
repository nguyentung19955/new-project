/* ======================= LAM MỚI THỬ 2 – khối thêm vào trang game/thu-lam-moi-2/index.html =======================
   Theo docs/gameplay/PHAN-HOI-11 + PHAN-HOI-12 ("Gửi Claude"). Trang sinh bằng cong-cu/tao-thu-lam-moi-2.py từ game/thu-p0a/am-dao.html
   (KHÔNG sửa am-dao.html, P0-B, P0-C, demo.html). Gameplay giữ NGUYÊN: startup / hộp / tốc độ / miễn sát thương không đổi – chỉ đổi HÌNH Lam.

   Sheet: art/huong-moi/lam-tu-the-2/sprite/lam-moi2-chay-2x (8 tư thế) + lam-moi2-chem1-2x (A/B/C/D). Ô chung, neo chân, vẽ ½ cỡ nguồn.
   Làm nét 28/10: thêm bản 3x (lam-moi2-*-3x, thu thẳng từ ảnh gen). Chọn theo BK (bộ đệm/logic): BK ≤ 2 → 2x, lớn hơn → 3x
   (iPhone @3x ngang BK 2,17: thu 3x xuống thay vì phóng 2x lên → hết nhoè). Vẽ bằng drawImage, imageSmoothingQuality 'high';
   góc đặt hình làm tròn theo điểm ảnh thật (lệch < ½ px thật). Bản tô bóng (ngọc / đen) chỉ tạo khi cần lần đầu.
   CHẠY : khung = floor(pha × 8); pha là biến pha CÓ SẴN của game (cộng |dx thực| / 132 mỗi bước chạy trên đất) → 16,5 px / ô, theo QUÃNG ĐƯỜNG.
   CHÉM 1: chọn hình theo CHÍNH điều kiện hộp đòn của game: atkT < su → A ; su ≤ atkT < su+4 → B ; < su+ac → C ; còn lại → D.
           Với su 7 / ac 8 / re 8: A tick 1–7, B 8–11, C 12–15 (hộp bật đúng 8–15), D 16–23. Huỷ nối nhát 2 trong recovery: code cũ, không đổi.
   KHÔNG crossfade: mỗi bước vẽ đúng MỘT hình.
   TẠM (chưa có tư thế – ghi rõ trong GHI-CHU): đứng / tiếp đất / rút dao / bị đánh / bám tường / chết / chém 2, 3, hất, nảy, trên không,
           chém vang, tụ Dư Âm → hình D (hồi); nhảy, nhảy tường, lướt → ô chạy 4 (bay); rơi → ô chạy 8 (bay).
   Cờ: ?lam=cu Lam cũ (rig-v4 Âm Đao) để so · ?vfx=0 tắt vệt chém + âm nhận (duyệt tạo dáng) · ?bong=1 Lam bóng đen
       ?hitbox=1 hộp đòn (có sẵn) · ?cham=4 chậm 4 lần (1–8). Đổi được trong game: ⚙ → các nút "Lam mới 2".
*/
const LM2 = (() => {
  const Q = P0_Q;
  const ST = {moi: Q.get('lam') !== 'cu', vfx: Q.get('vfx') !== '0', bong: Q.get('bong') === '1',
    cham: Math.max(1, Math.min(8, +(Q.get('cham') || 1) || 1))};
  const DUONG = '../../art/huong-moi/lam-tu-the-2/sprite/';
  const SH = {}, SH3 = {};   // chay / chem: {meta, img, E (tô ngọc cho bóng Vọng), D (bóng đen)} – SH bản 2x, SH3 bản 3x
  const D_CHEM = 3, TAM = {jump: ['chay', 3], walljump: ['chay', 3], dash: ['chay', 3], fall: ['chay', 7]};
  function to(img, mau, a) { const c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = a; g.fillStyle = mau; g.fillRect(0, 0, c.width, c.height); return c; }
  // bản tô bóng tạo khi cần lần đầu (đỡ RAM: 3x chạy + chém ≈ 6,6 MB mỗi bản)
  const goi = (img, meta) => { const o = {meta, img, _E: null, _D: null};
    Object.defineProperty(o, 'E', {get() { return this._E || (this._E = to(img, '#CEF0D6', 0.8)); }});
    Object.defineProperty(o, 'D', {get() { return this._D || (this._D = to(img, '#000000', 1)); }}); return o; };
  async function nap1(ten) {
    const meta = await (await fetch(DUONG + ten + '.json')).json();
    const img = new Image(); img.src = DUONG + meta.anh; await img.decode();
    if (img.naturalWidth !== meta.co_sheet[0] || img.naturalHeight !== meta.co_sheet[1]) throw new Error(meta.anh + ': cỡ ảnh khác co_sheet trong JSON');
    return goi(img, meta);
  }
  async function nap() {
    for (const [k, ten] of [['chay', 'lam-moi2-chay'], ['chem', 'lam-moi2-chem1']]) {
      SH[k] = await nap1(ten + '-2x');
      try { SH3[k] = await nap1(ten + '-3x'); } catch (e) { console.warn('LM2: không nạp được ' + ten + '-3x → dùng 2x', e); }
    }
    // kiểm lịch chém theo ATK của trang (không sửa ATK): A 7 / B 4 / C 4 / D 8
    const a = ATK[1]; if (a.su !== 7 || a.ac !== 8 || a.re !== 8) console.warn('LM2: ATK[1] = ' + a.su + '/' + a.ac + '/' + a.re + ' – lịch A/B/C/D tính theo hộp thật, số tick mỗi hình sẽ khác 7/4/4/8');
    dungNut();
  }
  // hình của một trạng thái (pl hoặc bản ghi bóng / vệt lướt)
  function chon(s) {
    const la = s === pl, a2 = s.a2, n = la ? pl.atkN : s.n, at = la ? pl.atkT : s.at, pha = la ? pl.pha : s.p2;
    if (a2 === 'run') return ['chay', Math.min(7, Math.floor((pha || 0) * 8)), false];
    if (n === 1 && a2 === 'atk1') { const A = ATK[1]; return ['chem', at < A.su ? 0 : at < A.su + 4 ? 1 : at < A.su + A.ac ? 2 : 3, false]; }
    const t = TAM[a2]; if (t) return [t[0], t[1], true];
    return ['chem', D_CHEM, true];   // mọi trạng thái khác (kể cả đứng): D (tạm)
  }
  // thay phần thân của drawLam (móc ở đầu hàm gốc): true = đã vẽ Lam mới
  function ve(bo, s, x, y) {
    if (!ST.moi || !SH.chem || !s.a2) return false;
    const [k, i] = chon(s), S2 = (BK > 2 && SH3[k]) ? SH3[k] : SH[k], M = S2.meta, f = M.frames[i];
    const img = bo === LAM.E ? S2.E : ST.bong ? S2.D : S2.img, sc = 1 / M.ty_le.px_nguon_moi_px_logic;
    const X = snap(x - ox + pl.w / 2), Y = snap(y - oy + pl.h), ax = M.diem_neo.x, ay = M.diem_neo.y;
    const dx = Math.round(-ax * sc * BK) / BK, dy = Math.round(-ay * sc * BK) / BK;   // 3x ở BK 3: đúng 1 điểm sheet = 1 điểm màn
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.save(); ctx.translate(X, Y); if (s.l2) ctx.scale(-1, 1);
    ctx.drawImage(img, f.x, f.y, f.w, f.h, dx, dy, f.w * sc, f.h * sc);
    ctx.restore();
    if (s === pl && bo === LAM) { LM2.dang = k + ':' + i; LM2.bo = M.ty_le.px_nguon_moi_px_logic + 'x'; }
    return true;
  }
  // nút trong ⚙
  function dungNut() {
    const box = document.querySelector('#set .box'), ok = document.getElementById('btn-set-ok'); if (!box || !ok) return;
    const h = document.createElement('p'); h.className = 'big'; h.textContent = 'Lam mới 2 (thử chạy + chém 1)'; box.insertBefore(h, ok);
    const nut = (ten, lay, doi) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'alt';
      const cap = () => { b.textContent = ten + ': ' + lay(); }; cap();
      b.addEventListener('click', e => { e.preventDefault(); doi(); cap(); }); box.insertBefore(b, ok); };
    nut('Lam', () => ST.moi ? 'MỚI' : 'cũ', () => { ST.moi = !ST.moi; });
    nut('Vệt chém + âm nhận', () => ST.vfx ? 'bật' : 'TẮT', () => { ST.vfx = !ST.vfx; });
    nut('Bóng đen', () => ST.bong ? 'BẬT' : 'tắt', () => { ST.bong = !ST.bong; });
    nut('Tốc độ', () => ST.cham > 1 ? 'chậm ×' + ST.cham : 'thường', () => { ST.cham = ST.cham > 1 ? 1 : 4; });
    nut('Hộp đòn', () => HBO.on ? 'BẬT' : 'tắt', () => hbSet(!HBO.on));
  }
  return {ST, nap, ve, chon, SH, SH3, dang: '', bo: ''};
})();
// ?vfx=0: tắt vệt chém (ảnh vet-chem) của Lam + bóng, và âm nhận (dải sáng theo hộp). Hộp + sát thương KHÔNG đổi.
{ const _hv = huVet; huVet = function (n, ox, oy, face, al) { if (!LM2.ST.vfx) return; _hv(n, ox, oy, face, al); }; }
{ const _an = AD.veAmNhan; AD.veAmNhan = function (...a) { if (!LM2.ST.vfx) return; return _an(...a); }; }
window.TVLM2 = LM2;
