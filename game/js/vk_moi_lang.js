// HỆ THỐNG MỚI ĐỢT 1 — phần ở làng (docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-1-VU-KHI.md).
//   - Cô Thợ May: không may / bán quần áo kiểu cũ nữa (đợt 3: khung nâng bộ hiện thêm 3 skill của bộ đang mặc). Bảng của cô có khung nâng cấp
//     bộ trang phục Zed (cùng khung ở Hành trang › Nhân vật, js/vk_moi.js VM.boPanel) và lời giải thích; đổi bộ ở Hành trang.
//   - 15/10 (docs/review/ke-hoach-cai-thien/bo-do-mua): thêm thẻ "Mua" cạnh thẻ "Nâng cấp": bộ vùng phải MUA BẰNG VÀNG (giá G.BO_MUA,
//     js/data.js); hạ trùm vùng mới mở bán. Ô từng bộ: hình Cu Tí mặc bộ đó, giá, khoá + "Hạ <trùm> để mở bán", nút Mua bấm 2 lần.
//     ?bocu=1 (G.BO_MUA_BAT = false): không có thẻ Mua, bảng như cũ.
// Luật, số liệu, bản lưu: js/vk_moi.js. Đợt 2: bảng cũ js/tailor.js và cờ ?hethongcu=1 đã xoá, đây là bảng duy nhất của Cô Thợ May.
(function () {
  const G = window.G, ui = G.ui, T = G.theme, VA = G.villageApi, VM = G.vkMoi;
  if (!VA || !VM || !T) return;
  const TXT = '#f1e6c6', SOFT = '#a9c2b4', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';
  const CX = 160, CW = 304, PY = 46; // vùng nội dung bên phải (như js/village.js)
  const V = VA.V;
  const so = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, G.LANG === 'en' ? ',' : '.'); // 1.500 / 1,500
  const chu = (s, x, y, w, h, o) => T.chuTrongKhung(s, x, y, w, h, Object.assign({ vien: [1, 1, 1, 1], dem: 1, size: 7, min: 6, bold: false, color: TXT, dong: 1, gian: 1.5 }, o || {}));

  // ---------- thẻ Nâng cấp (khung nâng bộ đang mặc) ----------
  function nangThe(y0, coMua) {
    let y = y0;
    if (!coMua) y = ui.para('Quần áo cũ đã đổi ra vàng và linh khí. Cu Tí có 4 bộ, hạ trùm vùng để mở bộ, đổi bộ ở Hành trang › Nhân vật.', CX + 2, y0, CW - 4, { size: 7, color: TXT }); // đợt 3: câu ngắn lại để đủ chỗ cho 3 dòng skill bộ
    y = VM.boPanel(CX + 2, y + 2, CW - 6, false, VA.say, { boQuaDs: coMua });
    if (G.hanhTrang && T.sbtn(CX + 2, Math.min(y + 6, 240), 150, 17, 'Mở Hành trang › Nhân vật', { size: 7, pad: 2 })) {
      G.hanhTrang.openVillage(); G.hanhTrang.tab = 'hero';
      return null;
    }
    return VM.boDuoc(G.save, G.zedBo ? G.zedBo() : 'ninja') === '' ? 'Đủ linh khí và vàng rồi, cô nâng bộ cho cháu nhé!' : 'Bộ nào cũng nâng được 3 cấp, mỗi cấp mở thêm một skill riêng. Gom linh khí và vàng rồi quay lại nhé.';
  }

  // ---------- thẻ Mua: 3 ô bộ vùng (Ninja có sẵn) ----------
  const BAN = ['rung', 'bien', 'lau'];
  function hinhBo(k, x, y, w, h, mo) { // Cu Tí mặc bộ k (js/zed_moi.js chọn tấm theo G.zedBo → mượn cờ thử G.ZED_BO_THU lúc vẽ)
    const c = G.ux, thu = G.ZED_BO_THU;
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    if (!mo) c.globalAlpha *= 0.35;
    c.translate(x + w / 2 + 3, y + h - 2); c.scale(2.1, 2.1);
    G.ZED_BO_THU = k;
    try { G.art.hero(c, { x: 0, y: 0, face: 1, key: 'smith', t: G.time, move: false, atk: -1, dodge: -1, weapon: null, noShadow: true }); } catch (e) { /* thiếu hình thì bỏ qua */ } finally { G.ZED_BO_THU = thu; }
    c.restore();
  }
  function khoa(x, y) { // ổ khoá nhỏ (vẽ code) trên hình bộ chưa mở bán
    const c = G.ux;
    c.strokeStyle = '#d8c9a0'; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y - 2, 4, Math.PI, 0); c.stroke();
    c.fillStyle = '#d8c9a0'; c.fillRect(x - 6, y - 2, 12, 9);
    c.fillStyle = '#3a2a1a'; c.fillRect(x - 1, y + 1, 2, 4);
  }
  function muaThe(y0) {
    const sv = G.save;
    if (VM.daXemBan(sv)) { G.persist(); if (G.villageScene && G.villageScene.checkNews) G.villageScene.checkNews(); }
    const vang = Math.floor(sv.gold || 0);
    chu(G.t('Vàng: {0}', so(vang)), CX + 2, y0, 96, 13, { size: 8, bold: true, color: GOLD, align: 'left' });
    chu('Hạ trùm vùng thì cô bày bán bộ của vùng đó. Ninja có sẵn.', CX + 100, y0, CW - 102, 13, { size: 6.5, color: SOFT, align: 'right' });
    const top = y0 + 15, cw = 100, ch = 128;
    let line = 'Hạ trùm vùng thì cô may bộ của vùng đó. Gom vàng rồi ghé mua nhé!';
    BAN.forEach((k, i) => {
      const x = CX + i * (cw + 2), y = top, B = G.ZED_BO[k], co = G.zedBoMo(k, sv), ban = G.zedBoBan(k, sv), gia = G.zedBoGia(k);
      const why = VM.boMuaDuoc(sv, k), xn = V.xnBo === k;
      T.inset(x, y, cw, ch, xn);
      chu(G.tv(B.ten), x + 2, y + 2, cw - 4, 22, { size: 7.5, bold: true, dong: 2, color: co ? GOOD : ban ? GOLD : SOFT });
      hinhBo(k, x + 4, y + 25, cw - 8, 52, ban);
      if (!ban) khoa(x + cw / 2, y + 50);
      if (co) {
        chu('Đã có', x + 2, y + 80, cw - 4, 14, { size: 8, bold: true, color: GOOD });
        chu(G.t('cấp {0}/{1}', VM.boCap(sv, k), G.BO_MOI.max), x + 2, y + 95, cw - 4, 13, { size: 7, color: TXT });
        chu('Nâng ở thẻ Nâng cấp', x + 2, y + 109, cw - 4, 14, { size: 6.5, color: SOFT });
        return;
      }
      chu(G.t('{0} vàng', so(gia)), x + 2, y + 80, cw - 4, 14, { size: 8, bold: true, color: !ban ? SOFT : vang < gia ? WARN : GOLD });
      if (!ban) {
        const r = G.REGIONS[G.zedBoVung(k)];
        chu(G.t('Hạ {0} để mở bán', r ? r.bossName : '?'), x + 3, y + 96, cw - 6, 28, { size: 7, dong: 2, color: SOFT });
        return;
      }
      if (why === 'Thiếu vàng') chu(G.t('Thiếu {0} vàng', so(gia - vang)), x + 2, y + 95, cw - 4, 12, { size: 6.5, color: WARN });
      else chu(xn ? 'Bấm lần nữa để mua' : 'Đủ vàng rồi!', x + 2, y + 95, cw - 4, 12, { size: 6.5, color: xn ? GOLD : GOOD });
      if (T.sbtn(x + 8, y + 108, cw - 16, 17, xn ? 'Chắc chắn mua' : 'Mua', { size: 7.5, pad: 1, primary: why === '', disabled: why !== '' })) {
        if (!xn) { V.xnBo = k; G.sfx && G.sfx('ui'); }
        else if (VM.muaBo(sv, k)) {
          V.xnBo = null; G.persist(); G.sfx && G.sfx('evolve');
          VA.say(G.t('Đã mua {0}! Đổi bộ ở Hành trang › Nhân vật.', G.tv(B.ten)));
          if (G.villageScene && G.villageScene.checkNews) G.villageScene.checkNews();
        } else V.xnBo = null;
      }
      if (why === '') line = G.t('Bộ {0} may xong rồi, {1} vàng thôi cháu!', G.tv(B.ten), so(gia));
    });
    chu('Mua xong thì nâng ở thẻ Nâng cấp, đổi bộ ở Hành trang › Nhân vật.', CX + 2, top + ch + 3, CW - 4, 22, { size: 6.5, dong: 2, color: SOFT, align: 'left' });
    return line;
  }

  function boPanel() {
    VA.frame('Thợ may');
    const coMua = G.BO_MUA_BAT !== false;
    if (!coMua) { V.mtab = 'nang'; return nangThe(80, false); }
    if (V.mtab !== 'mua' && V.mtab !== 'nang') V.mtab = VM.coTheMuaBo(G.save) ? 'mua' : 'nang';
    const tabs = [['nang', 'Nâng cấp'], ['mua', 'Mua']], cham = VM.coTheMuaBo(G.save);
    tabs.forEach((t, i) => {
      if (T.tab(CX + i * 102, PY + 23, 98, 22, t[1], V.mtab === t[0], { pad: 2, dot: t[0] === 'mua' && cham && V.mtab !== 'mua' })) { V.mtab = t[0]; V.xnBo = null; }
    });
    if (V.mtab !== 'mua') V.xnBo = null;
    return V.mtab === 'mua' ? muaThe(PY + 49) : nangThe(PY + 49, true);
  }
  // mở bảng Cô Thợ May: chọn lại thẻ (có bộ đang bán chưa mua thì mở thẻ Mua), bỏ lần bấm Mua đang chờ
  const moCu = VA.open;
  if (moCu && !moCu.boMua) {
    const mo = function (k) { if (k === 'may') { V.mtab = null; V.xnBo = null; } return moCu.apply(this, arguments); };
    mo.boMua = true;
    VA.open = mo;
    if (G.villageScene && G.villageScene.onTalk === moCu) G.villageScene.onTalk = mo;
  }
  VA.PANELS.outfit = boPanel;
})();
