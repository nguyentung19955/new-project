// HỆ THỐNG MỚI ĐỢT 3 (13/10/2026) — SKILL RIÊNG CỦA 4 BỘ TRANG PHỤC ZED. docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-3-SKILL-BO.md
//   - Bảng số (một chỗ duy nhất): G.SKILL_BO trong js/data.js. Cờ tắt: ?skillbo=0 (G.SKILL_BO_BAT = false).
//   - G.boSkill(bo, cap) (móc đợt 1 trong js/vk_moi.js, tệp này thay ruột): trả về skill đã mở của bộ ĐANG MẶC ở cấp cap, hoặc null.
//     js/vk_moi.js gắn vào người chơi lúc dựng trận (P.bo, P.boCap, P.boSkill). Skill chỉ có tác dụng khi đang mặc bộ đó.
//   - Luật trong trận: G.boSk — các móc nhỏ gọi từ js/combat.js (hurtPlayer, playerHit, updatePlayer, lộn), js/moves.js (đánh dấu đòn
//     giữ rồi thả: opt.manh) và js/mobs.js (quái nhắm vào bóng phân thân, chậm của Thuỷ triều). Không sửa js/zed_moi.js:
//     bóng phân thân vẽ bằng chính G.art.hero (hình Zed đang có) với độ mờ, giống bóng mờ khi lộn của js/fx.js.
//   - Hiệu ứng: vẽ bằng code / tái dùng FX sẵn có (chữ bay, sparkle, burst, hiệu ứng độc). Ảnh cần gen sau: bao-cao-3.md.
// Cờ ?skillbo=0: G.boSkill trả null → mọi móc dưới đây đứng yên (cờ ?hethongcu=1 đã bỏ ở đợt 2).
(function () {
  const G = window.G;
  const K = (G.boSk = {});
  const W_ = () => (G.getWorld ? G.getWorld() : null);
  const FX = (n, a, b, c, d, e) => { if (!G.noRender && G.fx && G.fx[n]) G.fx[n](a, b, c, d, e); };
  const ZK = () => G.ZK || 0.85;
  const bat = () => !!(G.SKILL_BO_BAT !== false && G.SKILL_BO);
  const so = (v) => { const s = String(Math.round(v * 100) / 100); return G.LANG === 'en' ? s : s.replace('.', ','); };
  const pt = (v) => Math.round(v * 100);
  // Ảnh hiệu ứng đợt 3 (docs/review/ke-hoach-cai-thien/hieu-ung-dot-3, cờ tắt ?hudot3=0): có ảnh thì vẽ ảnh, không thì hình code như cũ.
  const d3 = (ma) => !G.noRender && !!(G.huDot3 && G.huDot3(ma));
  const ANH = (ma, x, y, o) => { const k = G.fx && G.fx.kit; return !!(k && k.anh && d3(ma) && k.anh(ma, x, y, o)); };
  const veK = (c, ma, x, y, f, co, lat, mo, mau) => G.fxAnh.veK(c, ma, x, y, f, 0, co, lat, mo, mau);

  // ---------- skill đã mở ----------
  G.boSkill = function (bo, cap) {
    if (!bat()) return null;
    const ds = G.SKILL_BO[bo];
    cap = Math.max(0, Math.min(ds ? ds.length : 0, cap | 0));
    if (!ds || cap <= 0) return null;
    const co = {};
    for (let i = 0; i < cap; i++) co[ds[i].ma] = ds[i];
    return { bo, cap, ds: ds.slice(0, cap), co };
  };
  const co = (P, ma) => (P && P.boSkill && P.boSkill.co ? P.boSkill.co[ma] || null : null);
  K.co = co;

  // Mô tả 1 dòng (ghép từ số của G.SKILL_BO, gọi lúc vẽ để đổi ngôn ngữ được).
  K.moTa = function (sk) {
    if (!sk) return '';
    switch (sk.ma) {
      case 'bongLuot': return G.t('Lộn xong, đòn đầu tiên trong {0} giây +{1}% sát thương', so(sk.cuaSo), pt(sk.them));
      case 'phanThan': return sk.hoi ? G.t('Lộn để lại bóng mờ {0} giây, quái nhắm vào bóng; hồi {1} giây', so(sk.giay), so(sk.hoi)) : G.t('Lộn để lại bóng mờ đứng tại chỗ {0} giây, quái nhắm vào bóng', so(sk.giay));
      case 'amSat': return G.t('Đánh trúng sau lưng quái chắc chắn chí mạng, hồi {0} giây', so(sk.hoi));
      case 'nhuaRung': return G.t('Đứng yên từ {0} giây: hồi {1}% máu tối đa mỗi giây', so(sk.dung), so(sk.hoi * 100));
      case 'gaiDoc': return G.t('Quái đánh trúng Cu Tí bị nhiễm độc nhẹ');
      case 'bayDayLeo': return G.t('Đòn giữ rồi thả trói chân quái trúng đòn {0} giây', so(sk.giay));
      case 'khienNuoc': return sk.toiDa ? G.t('Mỗi {0} giây có 1 lớp khiên chặn 1 đòn (tối đa {1}% máu)', so(sk.hoi), pt(sk.toiDa)) : G.t('Mỗi {0} giây có 1 lớp khiên chặn trọn 1 đòn', so(sk.hoi));
      case 'songDoi': return G.t('Lộn đẩy lùi quái ở gần (bán kính {0})', sk.banKinh);
      case 'thuyTrieu': return G.t('Khiên vỡ thì làm chậm quái gần đó {0} giây', so(sk.giay));
      case 'giapBac': return G.t('Giảm {0}% sát thương nhận', pt(sk.giam));
      case 'phanDon': return G.t('Lộn trong {0} giây trước khi đòn quái trúng: phản lại {1}% sát thương', so(sk.cuaSo), pt(sk.phan));
      case 'khiThe': return G.t('Máu dưới {0}%: +{1}% sát thương tới hết ải, mỗi ải 1 lần', pt(sk.mau), pt(sk.them));
      default: return '';
    }
  };

  // ---------- dựng người chơi: trạng thái skill ----------
  if (G.buildPlayer && !G.buildPlayer.boSkBoc) {
    const goc = G.buildPlayer;
    G.buildPlayer = function () {
      const P = goc.apply(this, arguments);
      if (P) {
        P.boKhien = co(P, 'khienNuoc') ? 1 : 0; P.boKhienT = 0;
        P.boLuotT = 0; P.boLuotHet = false; P.boAmSatCd = 0; P.boBongCd = 0; P.boDungT = 0; P.boHoiFx = 0;
        P.boSauLon = 99; P.boPhanDa = [];
        P.boKhiThe = false; P.boKhiTheDa = false;
      }
      return P;
    };
    G.buildPlayer.boSkBoc = true;
  }

  // ---------- mỗi khung (combat.js G.updatePlayer) ----------
  K.tick = function (P, dt) {
    if (!P || !P.boSkill) return;
    const W = W_(); if (!W) return;
    if (P.boLuotHet) { P.boLuotHet = false; P.boLuotT = 0; }
    if (P.boLuotT > 0) P.boLuotT -= dt;
    if (P.boAmSatCd > 0) P.boAmSatCd -= dt;
    if (P.boBongCd > 0) P.boBongCd -= dt;
    P.boSauLon += dt;
    // bóng phân thân
    const B = W.boBong;
    if (B) { B.t -= dt; if (B.t <= 0) { W.boBong = null; if (!ANH('hu-phan-than', B.x, B.y + 1)) { FX('burst', B.x, B.y - 12, '#3a2a3e', 10, 40); FX('burst', B.x, B.y - 12, '#8a3040', 4, 30); } } }
    if (P.boVoT > 0) P.boVoT -= dt; // khiên nước vừa vỡ (ảnh khung 5–6)
    // vệt sóng, vòng nước (chỉ để vẽ)
    if (W.boVe) { for (const v of W.boVe) v.t -= dt; W.boVe = W.boVe.filter((v) => v.t > 0); }
    // chậm (Thuỷ triều), trói (Bẫy dây leo) trên quái: chỉ đếm thời gian
    for (const e of W.ents) { if (e.boChamT > 0) e.boChamT -= dt; if (e.boTroiT > 0) e.boTroiT -= dt; }
    if (W.boss) { if (W.boss.boChamT > 0) W.boss.boChamT -= dt; if (W.boss.boTroiT > 0) W.boss.boTroiT -= dt; }
    if (W.over || P.dead) return;
    // Khiên nước: vỡ thì đếm lại
    const kn = co(P, 'khienNuoc');
    if (kn && P.boKhien < 1) {
      P.boKhienT -= dt;
      if (P.boKhienT <= 0) { P.boKhien = 1; P.boKhienT = 0; FX('sparkle', P.x, P.y - 12, '#bff4ff', 8); }
    }
    // Nhựa rừng: đứng yên (không chạy, không đánh, không lộn) đủ lâu thì hồi máu
    const nr = co(P, 'nhuaRung');
    P.boHoiDang = false;
    if (nr) {
      const yen = !P.moving && !(P.atkT > 0) && !(P.dodgeT > 0) && !(P.dashT > 0) && !P.chHold;
      P.boDungT = yen ? P.boDungT + dt : 0;
      if (P.boDungT >= nr.dung && P.hp < P.maxhp && !W.safe) {
        P.hp = Math.min(P.maxhp, P.hp + P.maxhp * nr.hoi * dt);
        P.boHoiFx -= dt;
        P.boHoiDang = true; // đang hồi: ảnh hu-nhua-rung lặp dưới chân (vẽ ở G.fx.sorted)
        if (P.boHoiFx <= 0 && !d3('hu-nhua-rung')) { P.boHoiFx = 0.7; FX('sparkle', P.x + G.clamp((G.rnd() - 0.5) * 14, -7, 7), P.y - 10, '#9be26a', 3); }
      }
    }
  };

  // ---------- lộn ----------
  // Lúc bắt đầu lộn (combat.js, ngay sau khi đặt P.dodgeT).
  K.lon = function (P) {
    if (!P || !P.boSkill) return;
    const W = W_(); if (!W || W.over) return;
    P.boSauLon = 0; P.boPhanDa = [];
    const pt2 = co(P, 'phanThan');
    if (pt2 && !(P.boBongCd > 0)) { // đợt 4: có hồi (pt2.hoi giây)
      P.boBongCd = pt2.hoi || 0;
      W.boBong = { x: P.x, y: P.y, face: P.face, t: pt2.giay, t0: pt2.giay };
      FX('burst', P.x, P.y - 10, '#2a1e2e', 6, 30);
    }
    const sd = co(P, 'songDoi');
    if (sd) {
      let n = 0;
      for (const e of G.targets()) {
        if (e.isBoss || e.dead) continue;
        const dx = e.x - P.x, dy = (e.y - P.y) / ZK(), d = Math.hypot(dx, dy);
        if (d > sd.banKinh + (e.r || 0)) continue;
        const ux = d > 0.5 ? dx / d : (e.x >= P.x ? 1 : -1), uy = d > 0.5 ? dy / d : 0;
        e.x = G.clamp(e.x + ux * sd.day, W.x0, W.x1);
        e.y = G.clamp(e.y + uy * sd.day * ZK(), W.y0, W.y1);
        n++;
      }
      (W.boVe || (W.boVe = [])).push({ k: 'song', x: P.x, y: P.y, r: sd.banKinh, t: 0.35, t0: 0.35 });
      if (n) G.sfx('hit', 0.7);
    }
  };
  // Lộn xong (combat.js, lúc hết lộn).
  K.lonXong = function (P) {
    const bl = co(P, 'bongLuot');
    if (bl) { P.boLuotT = bl.cuaSo; P.boLuotHet = false; }
  };

  // ---------- quái nhắm vào bóng phân thân ----------
  // js/mobs.js (G.mob.update) và js/combat.js (quái kiểu cũ) hỏi: trả về chỗ quái nên nhắm (x, y, face) thay cho em bé, hoặc null.
  // Chỉ đổi chỗ quái đi tới / ngắm đòn; đòn trúng hay không vẫn đo trên người thật của Zed. Trùm (W.boss) không bị lừa.
  K.dich = function (e) {
    const W = W_();
    const B = W && W.boBong;
    if (!B || B.t <= 0 || !e || e.isBoss || e === W.boss) return null;
    return B;
  };
  // Hệ số tốc độ của quái (Thuỷ triều).
  K.cham = function (e) {
    return e && e.boChamT > 0 && e.boCham > 0 ? e.boCham : 1;
  };

  // ---------- Zed ra đòn (combat.js playerHit) ----------
  // Trước khi gây sát thương: trả về { k: hệ số, crit: ép chí mạng } hoặc null.
  K.danh = function (P, e, o, crit) {
    if (!P || !P.boSkill) return null;
    let k = 1, ep = false;
    if (P.boLuotT > 0 && co(P, 'bongLuot')) { k *= 1 + co(P, 'bongLuot').them; P.boLuotHet = true; }
    if (P.boKhiThe && co(P, 'khiThe')) k *= 1 + co(P, 'khiThe').them;
    const as = co(P, 'amSat');
    if (as && !crit && !(P.boAmSatCd > 0) && e && !e.dead && (e.face === 1 || e.face === -1)) {
      const dir = (o && o.dir) || (e.x >= P.x ? 1 : -1);
      if (dir === e.face) { // đòn đi cùng chiều quái đang nhìn = đánh vào lưng
        ep = true; P.boAmSatCd = as.hoi;
        ANH('hu-am-sat', e.x, e.y - Math.min(16, (e.h || 16) * 0.5), { f: dir < 0 ? -1 : 1 });
        FX('text', e.x, e.y - (e.h || 16) - 12, 'Ám sát!', '#ff5a6a', 8);
      }
    }
    return k !== 1 || ep ? { k, crit: ep } : null;
  };
  // Sau khi đòn đã trúng (combat.js playerHit): Bẫy dây leo với đòn giữ rồi thả (o.manh).
  K.trung = function (P, e, o) {
    if (!P || !P.boSkill || !e || e.dead || !o || !o.manh) return;
    const bd = co(P, 'bayDayLeo');
    if (!bd || !e.st) return;
    const t = bd.giay * (e.isBoss ? bd.trum : 1);
    e.st.root = Math.max(e.st.root || 0, t);
    e.boTroiT = Math.max(e.boTroiT || 0, t); e.boTroiT0 = e.boTroiT;
    FX('burst', e.x, e.y - 2, '#5fae3a', 6, 30);
  };

  // ---------- Zed trúng đòn (combat.js hurtPlayer) ----------
  // Gọi TRƯỚC kiểm tra bất tử: vừa lộn trong cửa sổ Phản đòn thì phản sát thương về quái (mỗi quái một lần mỗi cú lộn).
  K.phanDon = function (P, amt, src) {
    const pd = co(P, 'phanDon');
    if (!pd || !(P.boSauLon <= pd.cuaSo) || !src || src === P || src.dead || !src.st || !(amt > 0)) return;
    if (P.boPhanDa.indexOf(src) >= 0) return;
    P.boPhanDa.push(src);
    G.damage(src, amt * pd.phan, { src: 'reflect', fromPlayer: false });
    FX('text', P.x, P.y - 40, 'Phản đòn!', '#ffd27a', 8);
    if (!ANH('hu-phan-don', P.x + P.face * 4, P.y - 14, { f: P.face < 0 ? -1 : 1 })) FX('sparkle', P.x + P.face * 6, P.y - 14, '#e8e8f0', 8);
    G.sfx('hit', 1.5);
  };
  // Khiên nước chặn đòn. Trả về true nếu đã chặn trọn; đợt 4: đòn lớn hơn toiDa x máu tối đa thì khiên vỡ, trả về phần sát thương
  // còn lại (số) cho js/combat.js trừ tiếp; false nếu không có khiên.
  K.chan = function (P, amt) {
    const kn = co(P, 'khienNuoc');
    if (!kn || !(P.boKhien > 0)) return false;
    P.boKhien--; P.boKhienT = kn.hoi;
    const toiDa = kn.toiDa > 0 ? kn.toiDa * (P.maxhp || 100) : Infinity;
    const du = typeof amt === 'number' && amt > toiDa ? amt - toiDa : 0;
    if (!du) P.inv = Math.max(P.inv, 0.35);
    FX('text', P.x, P.y - 32, du ? 'Khiên vỡ!' : 'Chặn!', '#bff4ff', 9);
    if (d3('hu-khien-nuoc')) P.boVoT = 0.3; // ảnh khiên vỡ (khung 5–6) vẽ ở G.fx.sorted
    else FX('burst', P.x, P.y - 12, '#7fd4ff', 12, 70);
    G.sfx('pick', 1.6);
    const tt = co(P, 'thuyTrieu'), W = W_();
    if (tt && W) {
      for (const e of G.targets()) {
        if (Math.hypot(e.x - P.x, (e.y - P.y) / ZK()) > tt.banKinh + (e.r || 0)) continue;
        e.boChamT = Math.max(e.boChamT || 0, tt.giay); e.boCham = tt.cham;
      }
      (W.boVe || (W.boVe = [])).push({ k: 'trieu', x: P.x, y: P.y, r: tt.banKinh, t: 0.5, t0: 0.5 });
    }
    return du ? du : true;
  };
  // Hệ số sát thương nhận (Giáp bạc).
  K.nhan = function (P) {
    const gb = co(P, 'giapBac');
    return gb ? 1 - gb.giam : 1;
  };
  // Sau khi đã trúng đòn: Gai độc, Khí thế.
  K.biDanh = function (P, src) {
    if (!P || !P.boSkill) return;
    const gd = co(P, 'gaiDoc');
    if (gd && src && src !== P && !src.dead && src.st && !src.isPlayer && G.applyStatus) {
      const w = G.curW ? G.curW(P) : null;
      const goc = w && G.pDamage ? G.pDamage(P, w) : 10;
      G.applyStatus(src, 'poison', goc * gd.satThuong, gd.chong);
    }
    const kt = co(P, 'khiThe');
    if (kt && !P.boKhiTheDa && !P.dead && P.hp > 0 && P.hp < P.maxhp * kt.mau) {
      P.boKhiTheDa = true; P.boKhiThe = true;
      FX('text', P.x, P.y - 44, 'Khí thế!', '#ff6a3a', 10);
      FX('burst', P.x, P.y - 14, '#ff6a3a', 16, 80);
      G.sfx('evolve');
    }
  };

  // ---------- vẽ ----------
  function px(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function vong(c, x, y, r, col, n, a0) {
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * Math.PI * 2;
      px(c, x + Math.cos(a) * r, y + Math.sin(a) * r * ZK(), 1, 1, col);
    }
  }
  // Bóng phân thân: hình Zed (G.art.hero, cùng cách js/fx.js vẽ bóng mờ khi lộn) đứng yên, mờ, nhấp nháy lúc sắp tan.
  function veBong(c, P, B) {
    if (!G.art || !G.art.hero || !G.heroArgs) return;
    const a = G.heroArgs(P), pp = Object.create(P);
    pp.atkT = 0; pp.dodgeT = 0; pp.hurtT = 0; pp.castT = 0; pp.specT = 0; pp.dashT = 0; pp.chHold = false; pp.moving = false;
    pp.oShield = 0; pp.oShieldT = 0; pp.x = B.x; pp.y = B.y; pp.face = B.face;
    a.p = pp; a.x = B.x; a.y = B.y; a.face = B.face; a.move = false; a.atk = -1; a.dodge = -1; a.flash = false; a.mdx = 0;
    const sap = B.t < 0.35 && Math.floor(G.time * 16) % 2;
    a.alpha = sap ? 0.2 : 0.42;
    try { G.art.hero(c, a); } finally { c.globalAlpha = 1; }
    // ánh đỏ nhẹ dưới chân
    c.globalAlpha = 0.5; vong(c, B.x, B.y, 7, '#8a3040', 10, G.time * 2); c.globalAlpha = 1;
  }
  // Khiên nước: vòng chấm xanh ngọc gợn quanh Zed.
  function veKhien(c, P) {
    if (d3('hu-khien-nuoc')) { veK(c, 'hu-khien-nuoc', P.x, P.y - 13, Math.floor(G.time * 5) % 4, 1, false, 0.8); return; }
    const n = 24, t = G.time;
    for (let i = 0; i < n; i++) {
      const an = (i / n) * Math.PI * 2, r = 12 + Math.sin(t * 6 + i) * 0.6;
      c.globalAlpha = 0.45 + 0.25 * Math.sin(t * 5 + i * 0.7);
      px(c, P.x + Math.cos(an) * r, P.y - 13 + Math.sin(an) * 15, 1, 1, i % 4 ? '#7fe0d8' : '#ffffff');
    }
    c.globalAlpha = 1;
  }
  // Khí thế: vài đốm lửa đỏ cam bốc lên quanh Zed.
  function veKhiThe(c, P) {
    if (d3('hu-khi-the')) { veK(c, 'hu-khi-the', P.x, P.y + 1, Math.floor(G.time * 10) % 6, 1, false, 0.85); return; }
    const t = G.time;
    for (let i = 0; i < 6; i++) {
      const q = (t * 1.4 + i / 6) % 1, x = P.x + Math.sin(i * 2.3 + t * 2) * 9, y = P.y - 2 - q * 28;
      c.globalAlpha = 0.8 * (1 - q);
      px(c, x, y, 1, i % 2 ? 2 : 1, q < 0.4 ? '#ffd24a' : '#ff5a2a');
    }
    c.globalAlpha = 0.35; vong(c, P.x, P.y, 10, '#ff6a3a', 14, t); c.globalAlpha = 1;
  }
  function veSan(c, W) {
    // dây leo trói chân
    const ds = W.ents.slice(); if (W.boss && !W.boss.dead) ds.push(W.boss);
    for (const e of ds) {
      if (e.dead || e.hidden) continue;
      if (e.boTroiT > 0 && e.st && e.st.root > 0 && d3('hu-day-leo')) {
        // ảnh hu-day-leo: mầm nhú → dây vươn (khung 1–4) trong 0,32 giây đầu, giữ (khung 4–5 xen nhau), 0,25 giây cuối héo rụng (khung 6)
        const T0 = e.boTroiT0 || e.boTroiT, qua = T0 - e.boTroiT;
        const f = qua < 0.32 ? Math.floor(qua / 0.08) : e.boTroiT < 0.25 ? 5 : 3 + (Math.floor(G.time * 4) % 2);
        veK(c, 'hu-day-leo', e.x, e.y + 1, f, Math.max(0.7, Math.min(1.8, ((e.r || 8) * 2 + 10) / 28)), (e.fxId || 0) % 2 === 1, 1);
      } else if (e.boTroiT > 0 && e.st && e.st.root > 0) {
        const r = (e.r || 8) + 2, n = 10;
        c.globalAlpha = Math.min(1, e.boTroiT / 0.3);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + i * 0.3;
          px(c, e.x + Math.cos(a) * r, e.y + Math.sin(a) * r * ZK(), 2, 1, i % 3 ? '#4f9a2e' : '#8a5a2a');
          if (i % 2) px(c, e.x + Math.cos(a) * r, e.y + Math.sin(a) * r * ZK() - 2 - (i % 3), 1, 2, '#7cc84a');
        }
        c.globalAlpha = 1;
      }
      if (e.boChamT > 0) { c.globalAlpha = 0.5; vong(c, e.x, e.y, (e.r || 8) + 1, '#7fd4ff', 8, G.time * 3); c.globalAlpha = 1; }
    }
    // vòng sóng (Sóng dội), vòng thuỷ triều (Thuỷ triều)
    for (const v of W.boVe || []) {
      const q = 1 - v.t / v.t0, r = v.r * (0.35 + 0.65 * q);
      if (d3('hu-song-doi')) { // ảnh vòng sóng (khung theo thời gian vòng), cỡ = bán kính tác dụng; Thuỷ triều nhuộm lam đậm
        veK(c, 'hu-song-doi', v.x, v.y, Math.min(4, Math.floor(q * 5)), (2 * v.r) / 60, false, 0.9, v.k === 'song' ? null : '#3fa8d8');
        continue;
      }
      c.globalAlpha = 0.8 * (1 - q);
      vong(c, v.x, v.y, r, v.k === 'song' ? '#9fe8ff' : '#3fa8d8', 28, 0);
      vong(c, v.x, v.y, r - 2, '#ffffff', 14, q);
      c.globalAlpha = 1;
    }
  }
  if (G.fx) {
    const sorted0 = G.fx.sorted;
    G.fx.sorted = function (list, c) {
      if (sorted0) sorted0(list, c);
      if (G.noRender) return;
      const W = W_(), P = W && W.P;
      if (!W || !P || !P.boSkill) return;
      try {
        const B = W.boBong;
        if (B && B.t > 0) list.push({ y: B.y - 0.25, f: () => { try { veBong(c, P, B); } catch (e) { /* bỏ qua hình */ } } });
        if (!P.dead && P.boKhien > 0 && co(P, 'khienNuoc')) list.push({ y: P.y + 0.2, f: () => veKhien(c, P) });
        // khiên vừa vỡ: khung 5 rồi 6 của ảnh hu-khien-nuoc
        if (P.boVoT > 0 && d3('hu-khien-nuoc')) list.push({ y: P.y + 0.2, f: () => veK(c, 'hu-khien-nuoc', P.x, P.y - 13, P.boVoT > 0.15 ? 4 : 5, 1, false, 0.9) });
        // khí thế bằng ảnh: hào quang ở lớp SAU người (y nhỏ hơn Zed); hình code cũ vẫn ở trước
        if (!P.dead && P.boKhiThe) list.push({ y: d3('hu-khi-the') ? P.y - 0.3 : P.y + 0.3, f: () => veKhiThe(c, P) });
        // nhựa rừng: giọt nhựa xanh lặp dưới chân khi đang hồi (sau người)
        if (!P.dead && P.boHoiDang && d3('hu-nhua-rung')) list.push({ y: P.y - 0.2, f: () => veK(c, 'hu-nhua-rung', P.x, P.y + 1, Math.floor(G.time / 0.175) % 4, 1, false, 0.85) });
      } catch (e) { /* bỏ qua hình */ }
    };
    const ground0 = G.fx.drawGround;
    G.fx.drawGround = function (c) {
      if (ground0) ground0(c);
      if (G.noRender) return;
      const W = W_();
      if (!W || !W.P || !W.P.boSkill) return;
      try { veSan(c, W); } catch (e) { c.globalAlpha = 1; }
    };
  }
})();
