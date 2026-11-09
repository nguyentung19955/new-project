// TURRET MERGE — ỤNG MỚI ĐỢT 3 · 4 ụ ĐỎ (docs/demo-hop-tuong/TUONG-MOI-20.md §4 R2–R5):
//   Hive Queen (chuato) · Leviathan (leviathan) · Genesis Core (khoisinh) · Wyrm Engine (ronglua)
// Luật chung Đỏ: tối đa 1 Đỏ / bộ bài (game.js deckNgauNhien + UI), kỹ năng CHỦ ĐỘNG mở ở 3★ (chạm ụ khi nạp đầy, AI tự dùng),
// 3 giai đoạn lớn lên 1–3★ / 4–6★ / 7★ (GROW, vòng 3 cung quanh đầu — growfx.js). Nạp SAU skills4.js.
'use strict';

const sao7r = (T, ds) => ds[clamp(T.sao, 1, 7) - 1];
const gdSao = (T) => (T.sao >= 7 ? 3 : T.sao >= 4 ? 2 : 1);
// nạp kỹ năng chủ động (từ 3★) — ụ tự kích (game.js TU_KICH) nổ chiêu ngay khi đầy & đáng; 2 ụ bấm tay chờ chạm
function napChuDong(G, B, T, dt, cd, sk) {
  if (T.sao < 3) { T.nap = 0; return; }
  T.nap = Math.min(1, T.nap + dt / cd);
  if (T.nap >= 1) { T.napDay = (T.napDay || 0) + dt; if (!B.ai && T.napDay > 6 && laTuKich(T.id) && sk.aiNen(G, B, T)) sk.chuDong(G, B, T); } else T.napDay = 0; // ụ bấm tay (Arcane Cascade): không tự dùng · ụ tự kích: game.js tuKichBan đã kích ngay khi đầy
}

// =====================================================================================================
// R2 · HIVE QUEEN (chuato) — Đỏ TC (người dùng duyệt 08/11 — CHATGPT-SPEC §13): drone BAY VÒNG quanh tổ, tối đa = số sao.
//      Nạp: chu kỳ hồi C = 2×sao / [1 + 0.15×(số drone lần thả trước − 1)] / [1 + 0.02×(cấp thẻ − 9)] giây cho cả bầy
//      (mỗi drone C/sao giây; lần đầu tính như thả đủ bầy). Đủ bầy + có quái → THẢ HẾT vào s quái gần tổ nhất (trùng được):
//      mỗi drone (0.70 + 0.15×sao)D, cả loạt +8% mỗi drone thêm (7★ đủ 7: 7 × 1.75D × 1.48 ≈ 18.1D). Không tự bắn ngòi chích nữa.
//      CHỦ ĐỘNG "SWARM" (3★+, hồi 25 s, không tốn mana): thả NGAY mọi drone đang có (≥1) +35% sát thương; lần nạp kế 1.5 s/drone.
//      Vẽ tối đa 4 drone + số "×N" (mô phỏng đủ N). Tất định (không Math.random trong luật).
// =====================================================================================================
SKILLS.chuato = {
  vai: 'tc', dmg: 80, toc: 1, nham: 'dau', napMau: '#ff4a1a',
  cd: 25,
  moiCon: (T) => 0.70 + 0.15 * T.sao,
  chuKy: (T, tha) => 2 * T.sao / (1 + 0.15 * (Math.max(1, tha || T.sao) - 1)) / (1 + 0.02 * capThe9(G.ban[T.ban], 'chuato')),
  mo: (T) => (T.bay ? T.bay.length : 0) + '/' + T.sao + ' drones circling · full brood every ' + SKILLS.chuato.chuKy(T, T.thaN).toFixed(2) + 's, then all fly out: ' + Math.round(SKILLS.chuato.moiCon(T) * 100) + '% damage each, +8% per extra drone · ' + (T.sao >= 3 ? 'TAP (cooldown 25s): SWARM — release all drones now +35%, next brood 1.5s per drone' : 'SWARM unlocks at 3★'),
  sinh(G, T) { T.bay = []; T.de = 0; T.thaN = 0; T.nhanh = 0; },
  capNhat(G, B, T, dt) {
    if (!T.bay) this.sinh(G, T);
    const E = quaiDau(B); xoayDau(T, E, dt);
    if (T.bay.length > T.sao) T.bay.length = T.sao; // mất sao: bớt drone
    if (T.bay.length < T.sao) {
      const moi = T.nhanh > 0 ? 1.5 : this.chuKy(T, T.thaN) / T.sao;
      T.de += dt * nhipU(T);
      if (T.de >= moi) {
        T.de -= moi; const c = tamU(T), i = T.bay.length;
        T.bay.push({ x: c.x, y: c.y, g: i * 1.7, ra: 0 });
        if (T.nhanh > 0) T.nhanh--;
        if (!B.ai || G.che === 'pvp') SND.gOng();
      }
    } else T.de = 0;
    if (T.bay.length >= T.sao && T.bay.length && dsMucTieu(B).some(Q => !Q.chet)) this.tha(G, B, T, 1);
    if (!G.hu.some(o => o.k === 'toOng' && o.T === T)) G.hu.push({ k: 'toOng', t: 0, song: 1e9, T, B });
    napChuDong(G, B, T, dt, this.cd, this);
    return true;
  },
  // thả cả bầy: drone thứ i → quái gần tổ thứ (i mod số quái); sát thương chốt LÚC THẢ (tất định)
  tha(G, B, T, he, swarm) {
    const c = tamU(T), ds = dsMucTieu(B).filter(Q => !Q.chet).sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y));
    if (!ds.length || !T.bay.length) return false;
    const n = T.bay.length, dmg = dmgU(T) * this.moiCon(T) * (1 + 0.08 * (n - 1)) * he;
    T.bay.forEach((d, i) => G.hu.push({ k: swarm ? 'ongLao' : 'hiveLao', t: 0, song: 1.4, x: d.x, y: d.y, E: ds[i % ds.length], ds, B, T, dmg, vang: false, vet: [], t0: 0, toi: HU.ongLao.TOI }));
    T.thaN = n; T.bay.length = 0; T.de = 0; T.banLan++; giat(T, 0.8);
    return true;
  },
  aiNen: (G, B, T) => T.bay && T.bay.length >= Math.max(1, Math.min(3, T.sao - 1)) && dsMucTieu(B).filter(E => !E.chet).length >= 3,
  chuDong(G, B, T) {
    if (T.nap < 1 || T.sao < 3 || !T.bay || !T.bay.length) return false;
    if (!this.tha(G, B, T, 1.35, true)) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1; giat(T, 1.6); T.nhanh = T.sao; // lần nạp kế: 1.5 s/drone
    T._tvh = T._tvw = G.t + HU.ongLao.TOI;
    nhanU(T, 'SWARM!', '#ff6a2a', true); SND.gSwarm();
    const c = tamU(T); FX.vong1(c.x, c.y, 10, 50, '#ff6a2a', 0.35, 3);
    return true;
  },
  sangDau: (T) => (T.gd === 3 ? 0.17 : T.gd === 2 ? 0.08 : 0), // VFX P3
};
HU.toOng = { // bầy drone của 1 tổ: bay VÒNG quanh tổ (chỉ hình — vị trí drone không ảnh hưởng luật); vẽ tối đa 4 + số ×N
  cap(G, o, dt) {
    const T = o.T; if (!conTren(T) || T.id !== 'chuato') return true;
    const c = tamU(T), n = T.bay.length;
    T.bay.forEach((d, i) => {
      d.ra = Math.min(1, d.ra + dt * 3);
      d.g += dt * 1.8; const a = d.g + i * Math.PI * 2 / Math.max(1, Math.min(4, n)), r = 26;
      const tx = c.x + Math.cos(a) * r, ty = c.y + Math.sin(a) * r * 0.8;
      d.x += (tx - d.x) * Math.min(1, dt * 8); d.y += (ty - d.y) * Math.min(1, dt * 8);
    });
    return false;
  },
  ve(ctx, o, R) {
    const T = o.T; if (!T.bay || !T.bay.length) return;
    const n = T.bay.length;
    for (let i = 0; i < Math.min(4, n); i++) { const d = T.bay[i]; veDrone(ctx, R, d.x, d.y, 1, false, 0, d.ra); }
    if (n > 4) { const c = tamU(T); ctx.font = '900 11px ' + FONT.display; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.globalAlpha = 1; ctx.strokeText('×' + n, c.x + 20, c.y - 20); ctx.fillStyle = '#ffd23f'; ctx.fillText('×' + n, c.x + 20, c.y - 20); ctx.textAlign = 'left'; }
  },
};
function veDrone(ctx, R, x, y, k, vang, pha, al) { // drone bay vòng = ảnh ChatGPT raw_gc_chuato_drone (fx_hive_drone); chưa tải → ong máy cũ
  const ten = REN.img('fx_hive_drone') ? 'fx_hive_drone' : vang ? (typeof FXU !== 'undefined' && FXU.co('fx_chuato_dan3') ? 'fx_chuato_dan3' : REN.img('fx_chuato_hieu') ? 'fx_chuato_hieu' : 'fx_chuato_dan') : 'fx_chuato_dan';
  R.anhGiua(ctx, ten, x, y, 20 * k * (vang ? 1.15 : 1), 0, al == null ? 1 : al);
}
HU.chich = { ve(ctx, o, R) { const u = o.t / o.song; ctx.globalCompositeOperation = 'lighter'; PX.tia(ctx, o.x0, o.y0, o.x1, o.y1, o.vang ? 2.4 : 1.6, o.vang ? '#ffe680' : '#ff9a50', 1 - u); ctx.globalAlpha = 1 - u; R.anhGiua(ctx, R.cham1(o.vang ? '#ffd23f' : '#ff6a2a'), o.x1, o.y1, 12 * (1 - u)); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } };
HU.ongLao = { // SWARM: từng drone lao thành vệt sáng vào chỗ đông → nổ 35 px
  TOI: 0.5, // giây: mọi drone của 1 lần SWARM tới mục tiêu cùng bước mô phỏng (xa thì bay nhanh hơn) — tất định, không phụ thuộc khung hình
  cap(G, o, dt) {
    if (o.t < 0) return false;
    // mục tiêu chết giữa đường (ụ khác / drone khác nổ trúng nó): bám quái SỐNG GẦN CHỖ ĐÓ NHẤT. Sát thương mỗi drone giữ nguyên;
    // chọn theo khoảng cách, hoà → thứ tự ds (tất định).
    let doi = false;
    if (o.E.chet) {
      const ds = dsMucTieu(o.B).filter(E => !E.chet); if (!ds.length) return true;
      const x0 = o.E.x, y0 = o.E.y; let best = ds[0], bd = Infinity;
      for (const E of ds) { const d = (E.x - x0) * (E.x - x0) + (E.y - y0) * (E.y - y0); if (d < bd) { bd = d; best = E; } }
      o.E = best; doi = true;
    }
    if (o.toi == null) { o.t0 = o.t - dt; o.toi = o.t0 + this.TOI; } // HU cũ (không qua chuDong)
    const dx = o.E.x - o.x, dy = o.E.y - o.y, L = Math.hypot(dx, dy) || 1;
    o.vet.push(o.x, o.y); if (o.vet.length > 12) o.vet.splice(0, 2);
    // tới nơi đúng lúc o.toi; mục tiêu vừa chết ngay lúc tới (drone cùng bầy nổ trước trong cùng bước) mà quái mới ở xa → bay nối 0.15 s
    if (o.t >= o.toi - 1e-9 && doi && L > 60) { o.t0 = o.t - dt; o.toi = o.t + 0.15; }
    if (o.t >= o.toi - 1e-9) {
      G.dangBan = o.T; noLan(o.E.x, o.E.y, 35, o.dmg, o.B, { phu: true, mau: o.vang ? '#ffd23f' : '#ff8a4a' });
      FX.no('no_phao', o.E.x, o.E.y, 56, 0.3); FX.vong1(o.E.x, o.E.y, 4, 35, o.vang ? '#ffd23f' : '#ff6a2a', 0.25, 3); FX.tiaLua(o.E.x, o.E.y, 4, '#ffc23a', 160, 7);
      SND.no(0.35); if (TVX.duocLac(0.5)) FX.lac(2);
      return true;
    }
    // quãng còn lại theo đường cong tăng tốc s(u) = u(0.4 + 0.6u): còn lại r(u) = 1 − s(u) → tiến L·(1 − r(u1)/r(u0)) mỗi bước, bám mục tiêu đang đi
    const D = o.toi - o.t0, u0 = Math.max(0, (o.t - dt - o.t0) / D), u1 = Math.min(1, (o.t - o.t0) / D), r = (u) => 1 - u * (0.4 + 0.6 * u);
    const k = 1 - r(u1) / Math.max(1e-6, r(u0));
    o.x += dx * k; o.y += dy * k;
    return false;
  },
  ve(ctx, o, R) {
    if (o.t < 0) return;
    ctx.globalCompositeOperation = 'lighter';
    const pts = []; for (let i = 0; i + 1 < o.vet.length; i += 2) pts.push([o.vet[i], o.vet[i + 1]]); pts.push([o.x, o.y]);
    PX.duong(ctx, pts, 2.4, o.vang ? '#ffdc5a' : '#ff6e32', 0.8); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; // vệt = các đoạn tia PNG
    veDrone(ctx, R, o.x, o.y, 1.15, o.vang, G.t * 60, 1);
  },
};
// drone thả theo chu kỳ (không phải SWARM): cùng đường bay tất định của ongLao, trúng ĐÚNG 1 quái (không nổ lan); ảnh mới raw_gc_chuato_drone:
//   drone lao (fx_hive_lao, mũi hướng LÊN ảnh → xoay theo hướng bay) + vệt (fx_hive_vet) + nổ tổ ong (fx_hive_no). Chưa tải → hình ongLao cũ.
HU.hiveLao = {
  cap(G, o, dt) {
    if (o.t < 0) return false;
    if (o.E.chet) { const ds = dsMucTieu(o.B).filter(E => !E.chet); if (!ds.length) return true; const x0 = o.E.x, y0 = o.E.y; let best = ds[0], bd = Infinity; for (const E of ds) { const d = (E.x - x0) * (E.x - x0) + (E.y - y0) * (E.y - y0); if (d < bd) { bd = d; best = E; } } o.E = best; }
    if (o.t >= o.toi - 1e-9) {
      G.dangBan = o.T; trung(o.E, o.dmg, { B: o.B, mau: '#ffb070' });
      G.hu.push({ k: 'hiveNo', t: 0, song: 0.35, x: o.E.x, y: o.E.y });
      return true;
    }
    const dx = o.E.x - o.x, dy = o.E.y - o.y, D = o.toi - o.t0, u0 = Math.max(0, (o.t - dt - o.t0) / D), u1 = Math.min(1, (o.t - o.t0) / D), r = (u) => 1 - u * (0.4 + 0.6 * u);
    const k = 1 - r(u1) / Math.max(1e-6, r(u0));
    o.g = Math.atan2(dy, dx); o.x += dx * k; o.y += dy * k;
    return false;
  },
  ve(ctx, o, R) {
    if (o.t < 0) return;
    const lao = REN.img('fx_hive_lao'); if (!lao) return HU.ongLao.ve.call(this, ctx, o, R);
    const g = (o.g || 0) + Math.PI / 2, vet = REN.img('fx_hive_vet');
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(g);
    if (vet) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.7; ctx.drawImage(vet, -5, 6, 10, 30); ctx.globalCompositeOperation = 'source-over'; } // vệt phía sau (dưới ảnh = phía sau)
    ctx.globalAlpha = 1; ctx.drawImage(lao, -9, -14, 18, 18 * lao.height / lao.width);
    ctx.restore();
  },
};
HU.hiveNo = { ve(ctx, o, R) { const u = o.t / o.song, im = REN.img('fx_hive_no'); if (!im) return; PX.ve(ctx, im, o.x, o.y, 34 * (0.7 + 0.5 * u), 34 * (0.7 + 0.5 * u) * im.height / im.width, 0, 1 - u * u); ctx.globalAlpha = 1; } }; // nổ tổ ong nhỏ (chỉ hình)

// =====================================================================================================
// R3 · LEVIATHAN (leviathan) — Đỏ TC: bắn bọt nước nổ 30 px. Mỗi e s NUỐT 1 quái thường (không to, không trùm, GĐ1–2 không nuốt quái bay)
//      trong 120 px → +1 VỰC SÂU (mỗi cộng dồn +4% sát thương, KHÔNG trần — như Kalaratri DCDW). 4★+: nuốt được quái to (×3 cộng dồn).
//      CHỦ ĐỘNG "TIDAL BREATH" (3★+, hồi 35 s): tia nước quét DỌC cả đường 1.4 s, mỗi quái trúng 1 lần dmg×(4+0.1×cộng dồn), đẩy lùi 20 px.
//      PVP: như solo (không còn luật gửi quái).
// =====================================================================================================
SKILLS.leviathan = {
  vai: 'tc', dmg: 24, toc: 0.9, nham: 'dau', napMau: '#1fb6d9',
  e: (T) => sao7r(T, [9, 8.5, 8, 7, 6, 5.5, 5]),
  cd: 35,
  // dòng bảng ụ: 'ABYSS 56 · +224% damage' (VI: '+224% sát thương') = đúng số trên tấm đếm xoáy vực ở đáy ô (demkn.js)
  mo: (T) => 'ABYSS ' + (T.vuc || 0) + ' · +' + 4 * (T.vuc || 0) + '% damage · this turret only (a new one starts at 0) · its kills: elite +3, boss +10 · devours a small enemy every ' + SKILLS.leviathan.e(T) + 's (' + SKILLS.leviathan.TAM + ' px' + (T.sao >= 4 ? ', big ones ×3' : '') + (T.sao >= 7 ? ', flyers too' : '') + ') · bubble splash 30 px · ' + (T.sao >= 3 ? 'TAP when full: TIDAL BREATH ×' + (4 + 0.1 * (T.vuc || 0)).toFixed(1) + ' — water orbs shoot up from the turret and rain down along the whole path' : 'TIDAL BREATH unlocks at 3★'),
  TAM: 160, // tầm nuốt 120 → 160 px: mọi ô hàng giữa với tới đường (BAO-CAO gioi-han §4 mục 7)
  // VỰC SÂU RIÊNG TỪNG Ụ (người dùng 07/11 18:57): chỉ Leviathan NUỐT mới được điểm; ụ mới = 0; ụ bị biến/đổi/thay (ghép ra ụ khác, Mad Crown, Hộp…) mất điểm;
  //   ghép 2 Leviathan ra Leviathan = ụ MỚI → 0 (09/11 người dùng Q1 = A, bỏ GIU_CONG_DON)
  sinh(G, T) { T.vuc = T.vuc || 0; T.nuot = 0; },
  // (người dùng duyệt 08/11) đòn của CHÍNH ụ này hạ TINH ANH (quái to) +3 ABYSS, hạ TRÙM +10 ABYSS (quái thường: nuốt +1 như cũ)
  khiGiet(G, T, E) {
    if (!T || T.id !== 'leviathan' || !conTren(T)) return;
    const n = E.trum ? 10 : E.d && E.d.to ? 3 : 0; if (!n) return;
    T.vuc = (T.vuc || 0) + n; nhanU(T, '+' + n + ' ABYSS', '#7fdcff');
  },
  capNhat(G, B, T, dt) {
    T.buf.dmg += 0.04 * (T.vuc || 0);
    T.nuot = (T.nuot || 0) + dt * nhipU(T); // 09/11: nhịp nuốt theo nhipU (gồm cấp thẻ tốc)
    if (T.nuot >= this.e(T) && !G.hu.some(o => o.k === 'xoay' && o.T === T)) {
      const c = tamU(T);
      const ds = dsMucTieu(B).filter(E => !E.chet && !E.trum && !E.nuotHu && (T.sao >= 4 || !E.d.to) && (T.sao >= 7 || !E.d.bay) && Math.hypot(E.x - c.x, E.y - c.y) < this.TAM + E.d.co * 0.3);
      if (ds.length) {
        ds.sort((a, b) => b.hp - a.hp);
        const E = ds[0]; T.nuot = 0; E.nuotHu = true; E.chan = Math.max(E.chan || 0, 0.6);
        G.hu.push({ k: 'xoay', t: 0, song: 0.6, E, T, B, x: E.x, y: E.y });
        SND.gNuot();
      } else T.nuot = this.e(T);
    }
    napChuDong(G, B, T, dt, this.cd, this);
    return false;
  },
  ban(G, B, T, E) { // bọt nước: quả cầu xanh biển, nổ 30 px
    giat(T, 0.8); chopNong(T, 22); SND.doc();
    const dmg = dmgU(T), gd = T.gd || 1;
    danThang(B, T, E, gd === 3 ? 'g_bot_lon' : 'g_bot', 460, gd === 3 ? 22 : 17, (G, d, M) => {
      if (M) trung(M, dmg, { B, mau: '#9fe8ff' });
      noLan(d.x, d.y, 30, dmg * 0.5, B, { phu: true, mau: '#9fe8ff' });
      FX.vong1(d.x, d.y, 4, gd >= 2 ? 30 : 22, '#7fdcff', 0.25, 2); FX.tiaLua(d.x, d.y, 4, '#dff8ff', 120, 6);
    });
  },
  aiNen: (G, B, T) => dsMucTieu(B).filter(E => !E.chet).length >= 6 || G.quai.some(E => E.trum && !E.chet && banDuocQuai(B, E)),
  chuDong(G, B, T) {
    if (T.nap < 1 || T.sao < 3) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1; giat(T, 2.4);
    const p = G.duong.find(q => q.ban === B.i) || G.duong[0];
    G.hu.push({ k: 'thoThuy', t: 0, song: 1.4, T, B, p, tick: 0, dmg: dmgU(T) * (4 + 0.1 * (T.vuc || 0)), da: new Map() });
    nhanU(T, 'TIDAL BREATH!', '#7fdcff', true); SND.gSongTho(); FX.sang(0.12, '#7fdcff');
    return true;
  },
  sangDau: (T) => (T.gd === 3 ? 0.16 + 0.06 * Math.sin(G.t * 5) : T.gd === 2 ? 0.08 : 0) + Math.min(0.15, (T.vuc || 0) / 600),
  veThem(ctx, T, S, al, R) { // vây gai theo cộng dồn VỰC SÂU 0/40/80 (vạch vàng mảnh trên vòng tròn) + số
    const n = T.vuc || 0, vay = n >= 80 ? 12 : n >= 40 ? 8 : 4;
    ctx.globalCompositeOperation = 'lighter'; // vây = lấp lánh PNG tô vàng trên vòng (thay vạch lineTo vẽ code)
    for (let i = 0; i < vay; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / vay + R.t * 0.2; PX.sao(ctx, Math.cos(a) * S * 0.385, Math.sin(a) * S * 0.385, 7, '#ffd23f', al * 0.55, a); }
    ctx.globalCompositeOperation = 'source-over';
    // số VỰC SÂU: tấm đếm chung ở đáy ô (demkn.js)
  },
};
HU.xoay = { // nuốt: xoáy nước (vòng tròn đồng tâm xoay) hút quái 0.6 s → biến mất, vệt nước bay về Leviathan
  cap(G, o) {
    const E = o.E;
    if (E.chet) { if (E.nuotHu) E.nuotHu = false; return true; }
    o.x = E.x; o.y = E.y; E.chan = Math.max(E.chan || 0, 0.1);
    if (o.t >= o.song * 0.85 && !o.da) {
      o.da = true; const T = o.T, B = o.B;
      const lon = E.d.to ? 3 : 1;
      T.vuc = (T.vuc || 0) + lon; // riêng ụ đã nuốt
      E.hp = 0; chet(E, B);
      if (conTren(T)) { const c = tamU(T); G.hu.push({ k: 'tiaPhep', t: 0, song: 0.4, x0: o.x, y0: o.y, x1: c.x, y1: c.y, mau: '#7fdcff' }); nhanU(T, '+' + lon + ' ABYSS', '#7fdcff'); }
      FX.tiaLua(o.x, o.y, 6, '#bff4ff', 140, 7);
      return true;
    }
    return false;
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, r = 26 * (1 - u * 0.5);
    ctx.save(); ctx.translate(o.x, o.y); ctx.globalCompositeOperation = 'lighter';
    const xo = REN.img('fx_leviathan_hieu'); // xoáy nước ChatGPT: code chỉ xoay + thu nhỏ (thay 3 cung arc vẽ code)
    if (xo) PX.ve(ctx, xo, 0, 0, r * 2.4, r * 2.4 * xo.height / xo.width, -o.t * 9, 0.85 * (u < 0.8 ? 1 : (1 - u) / 0.2));
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.thoThuy = { // TIDAL BREATH: điểm cuối tia chạy dọc đường từ lõi về cổng trong 1.4 s (tới hết đường); mỗi 0.1 s đánh quái ≤70 px quanh nó — MỖI QUÁI TRÚNG ĐÚNG 1 LẦN ×(4+0.1×cộng dồn)
  // (QA vàng-đỏ: bản cũ nhịp 0.25 s cách nhau ~173 px > tầm 2×82 → có quái lọt khe; tia hết 1.5 s trước khi tới ~80 px cuối đường → quái gần cổng không bị trúng)
  cap(G, o, dt) {
    if (!conTren(o.T)) return true;
    o.tick -= dt;
    const s = o.p.len * (1 - Math.min(1, o.t / o.song)); [o.x, o.y] = viTri(o.p, s);
    if (o.tick <= 0) {
      o.tick += 0.1; G.dangBan = o.T;
      for (const E of dsMucTieu(o.B)) {
        if (E.chet || o.da.has(E) || Math.hypot(E.x - o.x, E.y - o.y) > 70 + E.d.co * 0.3) continue;
        o.da.set(E, 1);
        trung(E, o.dmg, { B: o.B, mau: '#bff4ff' }); E.s = Math.max(0, E.s - (E.trum ? 7 : 20));
      }
      FX.tiaLua(o.x, o.y, 4, '#dff8ff', 160, 8); FX.vong1(o.x, o.y, 8, 40, '#7fdcff', 0.22, 2);
      if (TVX.duocLac(0.5)) FX.lac(2);
    }
    return false;
  },
  ve(ctx, o, R) {
    if (!conTren(o.T) || o.x == null) return;
    const [x0, y0] = dauNong(o.T), u = o.t / o.song, a = u < 0.1 ? u / 0.1 : u > 0.85 ? (1 - u) / 0.15 : 1, w = 18 + 4 * Math.sin(R.t * 30);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    R.tia(ctx, 'tia_laser', x0, y0, o.x, o.y, w * 0.6, R.t * 500);
    PX.tia(ctx, x0, y0, o.x, o.y, w * 0.5, '#1fb6d9', a * 0.7); ctx.globalAlpha = a; // quầng = tia PNG tô màu
    R.anhGiua(ctx, R.cham1('#7fdcff'), o.x, o.y, 90); R.anhGiua(ctx, R.cham1('#ffffff'), o.x, o.y, 34);
    for (let i = 0; i < 3; i++) VX.vong(ctx, o.x, o.y, 18 + ((R.t * 120 + i * 20) % 60), 2.5, '#dff8ff', 0.5 * a);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// =====================================================================================================
// R4 · GENESIS CORE (khoisinh) — Đỏ ĐB, không bắn (người dùng duyệt 08/11 — CHATGPT-SPEC §16):
//      Mỗi 12 s (÷(1 + 0.03×(cấp thẻ − 9)) → LV17 9.68 s; power-up trong trận −3%/bước) +1★ TẠI CHỖ cho ụ kề 4 hướng (dấu cộng)
//      SAO THẤP NHẤT (<7★, không đá / băng / Lõi Khởi Sinh; hoà → ô số nhỏ hơn). Không biến hình, KHÔNG tính là ghép.
//      LƯỢT = sao lúc sinh; mỗi lần nâng −1 lượt; hết lượt → TỰ HUỶ (ô trống). Không có ô hợp lệ → chờ, không mất lượt.
//      Lõi bị hạ sao → lượt = min(lượt, sao); lõi được tăng sao KHÔNG hồi lượt. Băng/đá: đồng hồ dừng (capNhatU không chạy).
//      4★+: 4 ô kề +15% sát thương (giữ). CHỦ ĐỘNG "GENESIS" (3★+, 30 mana, hồi 45 s): gọi 1 ụ 1★ (ngẫu nhiên trong bộ, hạt giống)
//      vào ô TRỐNG kề có số nhỏ nhất; không có ô trống kề → không dùng, không trừ mana.
//      Online: bàn con rối (B.net) không tự nâng/gọi — chờ ảnh chụp bàn của máy bạn.
// =====================================================================================================
const KE_CONG = (o) => { const c = o % 5, h = (o / 5) | 0, ds = []; if (h > 0) ds.push(o - 5); if (c > 0) ds.push(o - 1); if (c < 4) ds.push(o + 1); if (h < 2) ds.push(o + 5); return ds.sort((a, b) => a - b); }; // ô kề dấu cộng (tăng dần)
SKILLS.khoisinh = {
  vai: 'db', dmg: 0, toc: 0, napMau: '#ff3a6a',
  GIA: 30,
  g: (T) => { const B = G.ban[T.ban]; return Math.round(12 / (1 + 0.03 * capThe9(B, 'khoisinh')) * (1 - 0.03 * knPU(B, 'khoisinh')) * 100) / 100; },
  cd: 45,
  mo: (T) => '+1★ to the lowest-star N/E/S/W neighbour every ' + SKILLS.khoisinh.g(T) + 's (next in ' + Math.max(0, SKILLS.khoisinh.g(T) - (T.sinhT || 0)).toFixed(0) + 's) · gifts left ' + Math.min(T.luot == null ? T.sao : T.luot, T.sao) + ' (= its stars when it appeared; at 0 it breaks) · waits if no neighbour can take a star' + (T.sao >= 4 ? ' · neighbours +15% damage' : '') + ' · ' + (T.sao >= 3 ? 'TAP (30 mana, cooldown 45s): GENESIS summons a 1★ into an empty neighbour cell' : 'GENESIS unlocks at 3★'),
  sinh(G, T) { if (T.luot == null) T.luot = T.sao; T.sinhT = 0; },
  gocDau: (T, t) => t * (0.25 + 0.5 * (T.sinhT || 0) / SKILLS.khoisinh.g(T)),
  hoTro(G, T, N, ra) { if (T.sao >= 4) { if (ra) ra.dmg = 0.15; else N.buf.dmg += 0.15; } }, // ra: vào trần sát thương chung (HOTRO.apDung — BAO-CAO §3)
  dich(B, T) { // ụ kề thấp sao nhất; hoà → ô số nhỏ hơn
    let M = null;
    for (const o of KE_CONG(T.o)) { const N = B.t[o]; if (!N || N.sao >= LUAT.saoMax || N.st.da || N.st.bang > 0 || N.id === 'khoisinh') continue; if (!M || N.sao < M.sao) M = N; }
    return M;
  },
  capNhat(G, B, T, dt) {
    if (T.luot == null) T.luot = T.sao;
    if (T.luot > T.sao) T.luot = T.sao; // bị hạ sao → lượt = min(lượt, sao)
    T.nap = T.sao < 3 ? 0 : Math.min(1, T.nap + dt / this.cd); // chiêu TỐN MANA: không tự phát cho người chơi (AI bàn máy vẫn dùng — game.js)
    if (B.net && typeof ONS !== 'undefined' && ONS.on) return true; // bàn con rối: chờ ảnh chụp bàn
    const g = this.g(T);
    T.sinhT = Math.min(g, (T.sinhT || 0) + dt * (1 + T.buf.toc));
    if (T.sinhT >= g && T.luot > 0) {
      const N = this.dich(B, T);
      if (N) {
        T.sinhT = 0; T.sang = 1; T.luot--;
        const c = tamU(T), n = B.o[N.o];
        G.hu.push({ k: 'cungSang', t: 0, song: 0.55, x0: c.x, y0: c.y, x1: n.x, y1: n.y });
        nangSao(B, N, 1, 'GENESIS +1★'); // tại chỗ, ngay lúc chọn (tất định)
        if (!B.ai || G.che === 'pvp') SND.gHop(0);
        if (T.luot <= 0) { // hết lượt: tự huỷ, để trống ô
          B.t[T.o] = null; FX.no('no_phao', c.x, c.y, 60, 0.45); FX.vong1(c.x, c.y, 8, 50, '#ff8ab0', 0.4, 4); FX.chu1(c.x, c.y - 20, 'GENESIS SPENT', '#ff8ab0', 14, 'to');
        }
      } // không có ô hợp lệ: giữ đồng hồ đầy, không mất lượt
    }
    return true;
  },
  aiNen: (G, B, T) => KE_CONG(T.o).some(o => !B.t[o]),
  chuDong(G, B, T) {
    if (T.nap < 1 || T.sao < 3) return false;
    const o = KE_CONG(T.o).find(q => !B.t[q]); if (o == null) return false;
    if (!traMana(B, T, this.GIA)) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1; T.genN = (T.genN || 0) + 1;
    const c = tamU(T);
    if (!(B.net && typeof ONS !== 'undefined' && ONS.on)) { // bàn con rối online: ụ mới tới theo ảnh chụp bàn
      const ds = deckTru(B, ['khoisinh']), r = rngHat(((typeof ONS !== 'undefined' && ONS.on ? ONS.seed : G.hat) || 1) * 7919 + T.uid * 131 + T.genN * 977 + o * 17);
      const N = sinhR(taoU(B, ds[Math.floor(r() * ds.length)], 1, o), r);
      B.t[o] = N; VX.trieu(N);
      const q = B.o[o]; G.hu.push({ k: 'cungSang', t: 0, song: 0.55, x0: c.x, y0: c.y, x1: q.x, y1: q.y });
    }
    nhanU(T, 'GENESIS!', '#ff8ab0', true); SND.gHop(1); FX.vong1(c.x, c.y, 10, 60, '#ff8ab0', 0.4, 4);
    return true;
  },
  sangDau: (T) => (T.gd === 3 ? 0.2 + 0.08 * Math.sin(G.t * 4) : T.gd === 2 ? 0.1 : 0) + T.sang * 0.3,
  veThem(ctx, T, S, al, R) { // GĐ1: 3 vành vàng quay · GĐ2: + 8 cánh sen thép · GĐ3: + ngôi sao trắng ở lõi · chấm hồng = số lượt còn lại
    const gd = T.gd || 1, p = (T.sinhT || 0) / SKILLS.khoisinh.g(T);
    ctx.globalCompositeOperation = 'lighter';
    if (!MOT_VONG) for (let i = 0; i < 3; i++) { const rr = S * (0.3 + i * 0.045), vp = PX.mau('fx_vong_trieu', i === 2 ? '#ff8ab0' : '#ffd23f'); if (vp) PX.ve(ctx, vp, 0, 0, rr * 2.3, rr * 2.3, (i % 2 ? -1 : 1) * R.t * (0.4 + 0.2 * i), al * (0.35 + 0.15 * i)); } // vành = vòng phù văn PNG
    if (gd >= 2) for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + R.t * 0.3; PX.sao(ctx, Math.cos(a) * S * 0.34, Math.sin(a) * S * 0.34, S * 0.12, '#ffd23f', al * 0.5, a); } // cánh sen = lấp lánh PNG
    if (gd === 3) { ctx.globalAlpha = al * (0.5 + 0.2 * Math.sin(R.t * 4)); R.anhGiua(ctx, R.cham1('#ff8ab0'), 0, 0, S * 0.7); ctx.globalAlpha = al; vePandora(ctx, 'sao', S * 0.09, '#ffffff'); }
    if (p > 0.9) { ctx.globalAlpha = al * (p - 0.9) * 6 * (0.6 + 0.4 * Math.sin(R.t * 20)); R.anhGiua(ctx, R.cham1('#ffd23f'), 0, 0, S * 0.8); }
    const n = Math.min(T.luot == null ? T.sao : T.luot, T.sao); // lượt còn lại: n chấm dưới lõi
    for (let i = 0; i < n; i++) R.anhGiua(ctx, R.cham1('#ff8ab0'), (i - (n - 1) / 2) * S * 0.09, S * 0.3, 7, 0, al * 0.95);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al;
  },
};
HU.cungSang = { // tia sáng CONG từ lõi sang ụ đích (đầu sáng chạy dọc cung) + hạt sao
  ve(ctx, o, R) {
    if (o.t < 0) return;
    const u = Math.min(1, o.t / o.song), e = 1 - (1 - u) * (1 - u), mx = (o.x0 + o.x1) / 2, my = (o.y0 + o.y1) / 2 - 40;
    const P = (s) => [(1 - s) * (1 - s) * o.x0 + 2 * (1 - s) * s * mx + s * s * o.x1, (1 - s) * (1 - s) * o.y0 + 2 * (1 - s) * s * my + s * s * o.y1];
    ctx.globalCompositeOperation = 'lighter';
    const s0 = Math.max(0, e - 0.45), pts = []; for (let i = 0; i <= 12; i++) pts.push(P(s0 + (e - s0) * i / 12));
    PX.duong(ctx, pts, 3, '#ffd23f', 0.7); // cung sáng = các đoạn tia PNG
    const [hx, hy] = P(e); ctx.globalAlpha = 1 - u * 0.5; R.anhGiua(ctx, R.cham1('#ff8ab0'), hx, hy, 26); R.anhGiua(ctx, R.cham1('#ffffff'), hx, hy, 10);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// =====================================================================================================
// R5 · WYRM ENGINE (ronglua) — Đỏ TC. LÀM LẠI 08/11 "LÒ PHẢN ỨNG" (INFERNAL REACTOR — docs/demo-hop-tuong/tuvan/rong-may/THIET-KE.md):
//   · TIA LỬA 5 nhịp/s (08/11 user "lửa khạc để là tia, bỏ lửa rộng"): 1 tia THẲNG từ miệng tới quái ĐẦU, XUYÊN mọi quái nằm trên
//     đường tia (nửa bề ngang rong(T) + 0.3 × cỡ quái) tới hết tầm: mỗi quái K×D + CHÁY 3 s (0.15D × 1.5 × sao, nguồn mạnh nhất, làm mới thời gian).
//   · LÕI TIM (từ 3★, gộp tia tim lò cũ vào CHÍNH tia này): tia dài TIA_TAM × tầm, lõi trắng dày hơn; quái ĐẦU trên tia
//     (dạng 4: 2 quái đầu) nhận thêm J×D (J = 1.0 / 1.4 / 1.4 theo dạng 2/3/4).
//   · NHIỆT (không trần): +1 mỗi nhịp phun trúng; GHÉP THẬT có ô kết quả cùng HÀNG hoặc cùng CỘT với Rồng: +5 × sao ụ ra.
//     Lò NGUỘI 2%/giây nhiệt đang có → phun liên tục cân bằng ~250 (300+ khi quá nhiệt); ghép hàng/cột đẩy vượt mức đó.
//     Mỗi nhiệt +0.2% ST (cùng nhóm sát thương) · ≥100 QUÁ NHIỆT +25% tốc phun · ≥250 NÓNG CHẢY +100% ST chí mạng.
//   · DRAGON DIVE (3★+, hồi 32 s, chạm): ĐỐT HẾT NHIỆT — mỗi quái trên đường 25D × (1 + nhiệt/100) (+5% máu tối đa trùm), vệt cháy × (1 + nhiệt/200).
//     Nhiệt về 0 → mất thưởng nhiệt: QUYẾT ĐỊNH lao sớm cứu đường hay giữ lò nóng cho cú lao lớn. Người chơi để đầy: chỉ tự lao khi có TRÙM.
//   · 4 DẠNG theo sao (đổi HÌNH thật): 1–2★ HATCHLING · 3–4★ WINGED WYRM (+tia tim, Dive) · 5–6★ ARMORED (lửa XANH +30% quái to/trùm) · 7★ INFERNO (lửa TRẮNG, nón dài +15%, vệt 4 s, tia xuyên 2).
//   Tất định: không Math.random trong luật; nhiệt đi theo cờ ô 'H' (dongbo.js); Dive = gói 'cd'.
// =====================================================================================================
const RONG_MAU = [null, { a: '#ff3b1a', b: '#ffb43a', c: '#fff0b0' }, { a: '#1a5cff', b: '#3aa0ff', c: '#bfe8ff' }, { a: '#2a7aff', b: '#9fd8ff', c: '#ffffff' }];
// VỆT CHÁY / THAN trên đường + quầng DRAGON DIVE: LUÔN màu lửa (than hồng cam/đỏ) ở MỌI dạng — lửa xanh/trắng chỉ là màu NÓN phun
// (06/11 lỗi iPhone: rồng lửa đỏ bổ nhào để lại vệt XANH DA TRỜI vì vetChay/rongBo lấy RONG_MAU[gd] = bảng màu nón xanh)
const RONG_THAN = [null, { a: '#ff3b1a', b: '#ffb43a' }, { a: '#ff4a12', b: '#ffc040' }, { a: '#ff5a1a', b: '#ffd870' }];
const dangRong = (T) => (T.sao >= 7 ? 4 : T.sao >= 5 ? 3 : T.sao >= 3 ? 2 : 1); // 4 DẠNG theo sao
const mauRong = (T) => [1, 1, 1, 2, 3][dangRong(T)]; // màu lửa: cam (dạng 1–2) · XANH (dạng 3) · TRẮNG (dạng 4)
const RONG_TEN = ['HATCHLING ENGINE', 'WINGED WYRM', 'ARMORED DRAGON', 'INFERNO DRAGON'];
SKILLS.ronglua = {
  vai: 'tc', dmg: 8.5, toc: 5,
  tam: (T) => sao7r(T, [130, 135, 140, 145, 150, 155, 165]) * (T.sao >= 7 ? 1.15 : 1),
  cd: 32,
  K: 1.0, TIA_TAM: 1.6, J: [0, 0, 1.0, 1.4, 1.4], // K: tia lửa × D mỗi quái trên tia mỗi nhịp · J: lõi tim thêm vào quái đầu theo dạng (× D mỗi nhịp)
  rong: (T) => 10 + 2 * dangRong(T), // nửa bề ngang tia trúng (px, cộng 0.3 × cỡ quái) — = nửa bề ngang lửa vẽ
  tamTia(T) { return this.tam(T) * (this.J[dangRong(T)] ? this.TIA_TAM : 1); }, // 3★+: lõi tim kéo tia dài như tia tim lò cũ
  NHIET_ST: 0.002, MOC1: 100, MOC2: 250, MOC1_TOC: 0.25, MOC2_CDMG: 1.0, GHEP: 5, NGUOI: 0.02, // nguội 2%/giây nhiệt đang có (không trần: phun đều cân bằng ~250, ghép hàng/cột đẩy cao hơn)
  // THIÊU: tổng 1 lần thiêu 3 s = 0.15D × 1.5 × sao → ST/giây chayD = 0.075 × sao × D (HU.chay: mỗi nhịp chayD × 0.5). Không cộng dồn: nguồn mạnh nhất.
  chayD: (T, D) => 0.075 * T.sao * D,
  dang: dangRong,
  tenDang: (T) => RONG_TEN[dangRong(T) - 1],
  nhiet: (T) => Math.max(0, T.nhiet || 0),
  thuong(n) { return { dmg: n * this.NHIET_ST, toc: n >= this.MOC1 ? this.MOC1_TOC : 0, cdmg: n >= this.MOC2 ? this.MOC2_CDMG : 0 }; }, // thuần — test
  heDive: (n) => 1 + n / 100,
  mo(T) {
    const d = dangRong(T), n = Math.floor(this.nhiet(T)), J = this.J[d];
    return RONG_TEN[d - 1] + ' · Heat ' + n + ' → +' + Math.round(n * this.NHIET_ST * 100) + '% damage' + (n >= this.MOC1 ? ', OVERHEAT +25% breath speed' : '') + (n >= this.MOC2 ? ', MELTDOWN +100% crit damage' : '') +
      ' · FIRE BEAM to the front enemy, pierces every enemy on the line (' + Math.round(this.tamTia(T)) + ' px): ' + Math.round(this.K * 100) + '% damage each, 5 ticks/s, burns 3s for ' + Math.round(22.5 * T.sao) + '% (strongest burn wins)' +
      (J ? ' · HEART CORE +' + Math.round(J * 100) + '% per tick on the front enemy' + (d >= 4 ? ' of each beam · TWIN BEAMS: the second aims at the next front enemy off the first beam' : ' on the beam') : ' · HEART CORE at 3★ (longer, thicker beam)') +
      (d >= 3 ? ' · ' + (d >= 4 ? 'WHITE' : 'BLUE') + ' flame +30% vs big' : '') +
      ' · Heat: +1 per beam tick that hits, +5 × ★ for every real merge in its ROW or COLUMN (no cap) · 100: +25% breath speed · 250: +100% crit damage · ' +
      (T.sao >= 3 ? 'TAP when full: DRAGON DIVE burns ALL heat: 25× damage × (1 + heat/100) to every enemy on the path' : 'DRAGON DIVE unlocks at 3★');
  },
  sinh(G, T) { if (T.nhiet == null) T.nhiet = 0; },
  capNhat(G, B, T, dt) {
    const c = tamU(T), d = dangRong(T), n = this.nhiet(T), th = this.thuong(n), J = this.J[d], Lb = this.tamTia(T);
    const E = quaiDauTam(B, T, Lb); // tia nhắm quái ĐẦU trong tầm tia
    T.buf.dmg += th.dmg; T.buf.toc += th.toc; if (th.cdmg) T.buf.cdmg = (T.buf.cdmg || 0) + th.cdmg;
    if (n > 0) T.nhiet = n * (1 - this.NGUOI * dt); // lò nguội dần (tất định theo bước cố định)
    xoayDau(T, E, dt);
    T.phun = Math.max(0, (T.phun || 0) - dt);
    T.tick = (T.tick || 0) - dt * nhipU(T) * (this.toc / 5); // 09/11: nhipU (gồm cấp thẻ tốc, Ép Xung) thay 1 + buf.toc
    if (E && T.tick <= 0) {
      T.tick = Math.max(0, T.tick + 0.2); T.phun = 0.3; T.banLan++; // cộng dồn: đúng 5 nhịp/s ở mọi tốc độ khung hình
      const gd = mauRong(T), dmg = dmgU(T), to = (Q) => d >= 3 && (Q.d.to || Q.trum) ? 1.3 : 1, mau = gd === 3 ? '#e8f6ff' : gd === 2 ? '#9fd0ff' : '#ffb070';
      // 1 tia (7★: 2 tia — tia 2 nhắm quái đầu CHƯA nằm trên tia 1); mỗi quái trúng tối đa 1 lần / nhịp; LÕI TIM vào quái đầu của mỗi tia
      const W = this.rong(T), da = new Set(), ve = [], ds = quaiTrongTam(B, T, Lb).filter(Q => !Q.chet).sort((p, q) => (G.duong[p.p].len - p.s) - (G.duong[q.p].len - q.s) || (p.uid || 0) - (q.uid || 0));
      let k = 0;
      for (let i = 0, D0 = E; i < (d >= 4 ? 2 : 1) && D0; i++, D0 = ds.find(Q => !da.has(Q) && !Q.chet)) {
        const g = Math.atan2(D0.y - c.y, D0.x - c.x), ux = Math.cos(g), uy = Math.sin(g), tren = [];
        for (const Q of dsMucTieu(B)) { // quái nằm trên đường tia (hình chữ nhật dài Lb, nửa ngang W + 0.3 cỡ quái)
          if (Q.chet || da.has(Q)) continue;
          const dx = Q.x - c.x, dy = Q.y - c.y, p = dx * ux + dy * uy, k0 = Q.d.co * 0.3;
          if (Q !== D0 && (p < -k0 || p > Lb + k0 || Math.abs(dx * uy - dy * ux) > W + k0)) continue;
          tren.push(Q);
        }
        // thứ tự tất định: quãng còn lại, rồi uid → lõi tim vào quái đầu trên tia
        tren.sort((p, q) => (G.duong[p.p].len - p.s) - (G.duong[q.p].len - q.s) || (p.uid || 0) - (q.uid || 0));
        let xa = 0, dau = true;
        for (const Q of tren) {
          da.add(Q); if (Q.chet) continue;
          xa = Math.max(xa, (Q.x - c.x) * ux + (Q.y - c.y) * uy + Q.d.co * 0.3);
          const loi = J && dau; dau = false;
          trung(Q, dmg * (this.K + (loi ? J : 0)) * to(Q), { B, mau: loi ? '#fff2c0' : mau, im: !loi && (T.banLan + k) % 5 > 1 }); k++; // im: chỉ bớt số nổi (không ngẫu nhiên)
          if (!Q.chet) { Q.chayT = Math.max(Q.chayT || 0, 3); Q.chayD = Math.max(Q.chayD || 0, this.chayD(T, dmg)); Q.chayB = B; if (!G.hu.some(o => o.k === 'chay' && o.E === Q)) G.hu.push({ k: 'chay', t: 0, song: 30, E: Q, T }); }
        }
        ve.push({ g, L: Math.min(Lb, Math.max(24, xa + 12)), ex: D0.x, ey: D0.y });
      }
      if (k) T.nhiet = this.nhiet(T) + 1; // +1 mỗi nhịp tia trúng (như nón cũ, 2 tia vẫn +1) → tích nhiệt giữ nhịp
      RONG_TIA.set(T, { ds: ve, t: G.t }); // CHỈ để vẽ (WeakMap, không vào đồng bộ)
      // vệt cháy trên đường dưới mục tiêu (≤1 vệt / 0.45 s / ụ)
      if (G.t - (T.vetT || -9) > 0.45) { T.vetT = G.t; G.hu.push({ k: 'vetChay', t: 0, song: d >= 4 ? 4 : 2, x: E.x, y: E.y, B, T, dmg: dmg * 0.3, tick: 0, gd }); }
      if (typeof GFX === 'undefined' || GFX.coDOM) { // tàn lửa bắn ra ở điểm trúng (chỉ hình — tất định theo banLan, không số ngẫu nhiên)
        const m = RONG_MAU[gd];
        for (let i = 0; i < 2; i++) { const f = ((T.banLan * 7 + i * 13) % 17) / 16, h = ve[0].g + Math.PI + (f - 0.5) * 1.6, v = 60 + 50 * f; FX.hat1('lua', E.x, E.y, Math.cos(h) * v, Math.sin(h) * v, 0.28, 7, i ? m.b : m.c); }
      }
      if (!B.ai || G.che === 'pvp') SND.gLua(gd);
    }
    if (!G.hu.some(o => o.k === 'nonLua' && o.T === T)) G.hu.push({ k: 'nonLua', t: 0, song: 1e9, T });
    napChuDong(G, B, T, dt, this.cd, this);
    return true;
  },
  // AI: lao khi có trùm, khi lò ≥ 200, hoặc đông quái và lò ≥ 100 · người chơi để đầy: chỉ tự lao khi có TRÙM (giữ lò là quyết định của người chơi)
  aiNen(G, B, T) {
    if (G.quai.some(E => E.trum && !E.chet && banDuocQuai(B, E))) return true;
    const n = this.nhiet(T); // 09/11: tự kích cho mọi bàn (trước: người chơi chỉ tự phát khi có trùm) return n >= 200 || (n >= 100 && dsMucTieu(B).filter(E => !E.chet).length >= 6);
  },
  chuDong(G, B, T) {
    if (T.nap < 1 || T.sao < 3) return false;
    const n = this.nhiet(T), h = this.heDive(n);
    T.nap = 0; T.napDay = 0; T.sang = 1; giat(T, 2.6); T.nhiet = 0;
    const p = G.duong.find(q => q.ban === B.i) || G.duong[0];
    G.hu.push({ k: 'rongBo', t: 0, song: 1.3, T, B, p, dmg: dmgU(T) * 25 * h, hv: 1 + n / 200, n, da: new Set(), vetT: 0 });
    nhanU(T, n >= 1 ? 'DRAGON DIVE! ×' + h.toFixed(1) : 'DRAGON DIVE!', '#ff5a1a', true); SND.gRong(); FX.lac(3);
    return true;
  },
  // GHÉP THẬT có ô kết quả cùng hàng / cột: +5 × sao ụ ra (Rồng chính là nguyên liệu: không tính) — gọi từ móc ghep bên dưới
  ghepHangCot(B, o, sao, a, b) {
    const c = o % 5, h = (o / 5) | 0;
    for (let i = 0; i < 15; i++) {
      const X = B.t[i]; if (!X || X.id !== 'ronglua' || biKhoa(X) || X === a || X === b || i === o) continue;
      if (i % 5 !== c && ((i / 5) | 0) !== h) continue;
      const them = this.GHEP * sao; X.nhiet = this.nhiet(X) + them; X.sang = 1; // tăng 1 lần: chỉ chớp
      if (typeof G !== 'undefined' && G.hu) { const p = B.o[o], q = B.o[i]; G.hu.push({ k: 'rongNap', t: 0, song: 0.35 + 0.06 * (Math.abs(i % 5 - c) + Math.abs(((i / 5) | 0) - h)), x0: p.x, y0: p.y, x1: q.x, y1: q.y, n: them }); }
    }
  },
  sangDau: (T) => (T.phun > 0 ? 0.2 : 0) + (dangRong(T) >= 4 ? 0.12 : 0) + Math.min(0.15, (T.nhiet || 0) / 1600),
};
// ---- HÌNH 4 DẠNG (tools/thap-cat-rong-may.py → artscale.js RONG_DANG): đầu ronglua_f<n>_nong + 2 cánh ronglua_f<n>_canh vỗ quanh gốc + bệ ronglua_f<n>_de.
//      Chỉ hình: nhịp vỗ cánh / giật / chuyển dạng theo thời gian vẽ (REN.t) + WeakMap — không đụng luật, không vào đồng bộ. Ảnh chưa tải → đầu cũ ronglua_nong.
const RONG_VE = new WeakMap(); // T → { f: dạng đang vẽ, cu: dạng cũ, t0: lúc đổi dạng }
const RONG_VO = [0, { tan: 11, bien: 0.32 }, { tan: 6.5, bien: 0.22 }, { tan: 4.2, bien: 0.14 }, { tan: 3.4, bien: 0.2 }]; // nhịp vỗ (rad/s) + biên độ (rad) mỗi dạng
Object.assign(SKILLS.ronglua, {
  deAnh(T) { const M = window.RONG_DANG && RONG_DANG['f' + dangRong(T)]; return M ? ['ronglua_f' + dangRong(T) + '_de', M.DE] : null; },
  // 1 dạng: 2 cánh (dưới) + đầu; sc = phóng đều, bien = '' | 'trang' (bóng trắng lúc đổi dạng)
  veDang(ctx, T, f, C, al, sc, da, R, bien) {
    const M = window.RONG_DANG && RONG_DANG['f' + f], ten = 'ronglua_f' + f + '_nong'; if (!M || !R.img(ten)) return false;
    const kieu = bien || (da ? 'xam' : ''), D = C * M.K * sc, t = R.t + (T.pha || 0);
    const V = RONG_VO[f], phun = T.phun > 0 ? Math.min(1, T.phun / 0.3) : 0;
    // vỗ cánh: sóng sin + lúc phun dang rộng ra (ép cánh về sau theo nhịp giật), dạng 4 bay lơ lửng (nhấp nhô)
    const vo = V.bien * Math.sin(t * V.tan) + 0.18 * phun, noi = f === 4 ? Math.sin(t * 2.2) * C * 0.012 : 0;
    const lui = -(T.rx || 0) * 0.6 - phun * C * 0.025; // giật lùi khi phun
    const [cx, cy, co, gx, gy] = M.canh, cw = R.img('ronglua_f' + f + '_canh') && R.co('ronglua_f' + f + '_canh', co * C * sc, kieu);
    ctx.save(); ctx.globalAlpha = al; ctx.rotate(T.goc); ctx.translate(lui, noi);
    if (cw) for (const lat of [1, -1]) {
      ctx.save(); ctx.translate(gx * C * sc, lat * gy * C * sc); ctx.rotate(-lat * vo); ctx.scale(1, lat * (1 - 0.06 * Math.abs(Math.sin(t * V.tan))));
      const w = co * C * sc; ctx.drawImage(cw, (cx - gx) * C * sc - w / 2, (cy - gy) * C * sc - w / 2, w, w); ctx.restore();
    }
    const h = R.co(ten, D, kieu); if (h) { const p = 1 + 0.035 * phun; ctx.drawImage(h, -D * p / 2, -D * p / 2, D * p, D * p); }
    // miệng sáng khi phun / tim lò nóng (cộng sáng chính ảnh đầu, không vẽ hình code)
    const nong = Math.min(0.35, (T.nhiet || 0) / 900) + 0.25 * phun + (T.chop > 0 ? Math.min(0.4, T.chop * 3) : 0);
    if (h && !da && !bien && nong > 0.01) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * nong; ctx.drawImage(h, -D / 2, -D / 2, D, D); ctx.globalCompositeOperation = 'source-over'; }
    ctx.restore(); ctx.globalAlpha = 1;
    return true;
  },
  veDau(ctx, T, S, al, R, da) {
    const f = dangRong(T), C = S / 0.98; let v = RONG_VE.get(T);
    if (!v) { v = { f, cu: f, t0: -9 }; RONG_VE.set(T, v); }
    if (v.f !== f) { v.cu = v.f; v.f = f; v.t0 = R.t; }
    const u = (R.t - v.t0) / 0.65;
    if (u >= 0 && u < 1 && v.cu !== f) { // ĐỔI DẠNG 0,65 s: dạng cũ co + trắng dần → chớp → dạng mới bung 0.85 → 1.1 → 1
      const e = (x) => 1 - (1 - x) * (1 - x);
      if (u < 0.45) { const k = u / 0.45; this.veDang(ctx, T, v.cu, C, al * (1 - k * 0.6), 1 - 0.12 * e(k), da, R) || 0; this.veDang(ctx, T, v.cu, C, al * k, 1 - 0.12 * e(k), da, R, 'trang'); }
      if (u >= 0.35) { const k = (u - 0.35) / 0.65, sc = k < 0.5 ? 0.85 + 0.25 * e(k * 2) : 1.1 - 0.1 * e((k - 0.5) * 2); if (!this.veDang(ctx, T, f, C, al * Math.min(1, k * 2), sc, da, R)) return false; if (k < 0.3) this.veDang(ctx, T, f, C, al * (1 - k / 0.3), sc, da, R, 'trang'); }
      return true;
    }
    return this.veDang(ctx, T, f, C, al, 1, da, R);
  },
});
// (09/11 Q1 = A: bỏ GIU_CONG_DON.ronglua — Rồng + Rồng ra Rồng = ụ mới, nhiệt về 0)
{
  const _ghepRong = ghep;
  ghep = function (B, a, b, ep) {
    const that = laGhepThat(a, b, ep), B2 = b && G.ban[b.ban], o = b && b.o;
    const r = _ghepRong.apply(this, arguments);
    if (r && that && B2 && B2.t.some(X => X && X.id === 'ronglua')) { const ra = B2.t[o]; if (ra) SKILLS.ronglua.ghepHangCot(B2, o, ra.sao, a, b); }
    return r;
  };
}
HU.rongNap = { // nhiệt bay từ ô ghép tới Rồng cùng hàng/cột: 1 đốm lửa nhỏ PNG trượt thẳng (không vòng)
  cap(G, o, dt) { o.t += dt; return o.t >= o.song; },
  ve(ctx, o, R) {
    const p = Math.min(1, o.t / o.song), e = 1 - (1 - p) * (1 - p), im = R.img('lua_t1') || R.img('fx_cuuvi_dan'); if (!im) return;
    PX.ve(ctx, im, o.x0 + (o.x1 - o.x0) * e, o.y0 + (o.y1 - o.y0) * e - Math.sin(p * Math.PI) * 10, 14, 18, 0, 1 - p * 0.3);
  },
};
// lửa trước mũi rồng DRAGON DIVE = ảnh PNG fx_ronglua_dan (ChatGPT) — dạng 2/3 tô màu lửa xanh
function anhNon(gd) { if (gd > 1 && typeof FXU !== 'undefined' && FXU.co('fx_ronglua_dan' + gd)) return REN.img('fx_ronglua_dan' + gd); return gd > 1 ? PX.mau('fx_ronglua_dan', RONG_MAU[gd].b) : REN.img('fx_ronglua_dan'); }
// TIA LỬA (08/11 thay nón lửa rộng + tia tim lò riêng; 7★: 2 tia): mỗi tia thẳng từ MIỆNG rồng tới hết đoạn trúng (quái xa nhất trên tia + 12 px, ≤ tầm tia).
//   Lớp (toàn PNG): mép lửa = dải fx_wyrm_lua2 (khung chảy 3–5, lập loè) kéo mảnh — bề ngang lửa ở 70% = bề ngang trúng 2 × rong(T)
//   → quầng fx_laser_tia tô màu lửa → LÕI sáng fx_laser_tia (3★+ lõi tim dày + lõi trắng) → loé miệng + loé điểm trúng. Chỉ hình.
const RONG_TIA = new WeakMap(); // T → { ds: [{ g: hướng tia, L: dài từ tâm ụ, ex/ey: quái đầu }], t } — CHỈ để vẽ (không nằm trên T, không vào đồng bộ online)
HU.nonLua = { // (giữ khoá 'nonLua' cũ) = TIA LỬA
  cap(G, o) { return !conTren(o.T) || o.T.id !== 'ronglua'; },
  ve(ctx, o, R) {
    const T = o.T, V = RONG_TIA.get(T); if (!(T.phun > 0) || !V || G.t - V.t > 0.35) return;
    for (const v of V.ds) veTia(ctx, T, v, R);
  },
};
function veTia(ctx, T, v, R) { // 1 tia lửa
  const S = SKILLS.ronglua, c = tamU(T), [x, y] = dauNong(T), gd = mauRong(T), m = RONG_MAU[gd], d = dangRong(T), loi = !!S.J[d], W = S.rong(T);
  const x1 = c.x + Math.cos(v.g) * v.L, y1 = c.y + Math.sin(v.g) * v.L, L = Math.hypot(x1 - x, y1 - y); if (L < 6) return;
  const g = Math.atan2(y1 - y, x1 - x), a = Math.min(1, T.phun / 0.1), t = R.t + (T.pha || 0) + v.g;
  const nh = 0.8 + 0.2 * Math.sin(t * 47) * Math.sin(t * 23 + 1), ph = 1 + 0.12 * Math.sin(t * 38 + 2); // lập loè (theo thời gian vẽ)
  ctx.save();
  // 1) mép lửa
  const M2 = typeof SIG_META !== 'undefined' && SIG_META.fx_wyrm_lua2, f = 3 + Math.floor(t * 14) % 3;
  if (M2 && typeof SIG !== 'undefined' && REN.img('fx_wyrm_lua2')) {
    const X2 = VUNG_ANH.wyrm2X || 0.98, Wd = L / (X2 - 0.02), hh = 2 * W * ph / (VUNG_ANH.wyrm2Y || 0.75);
    const ten = gd > 1 && REN.img('fx_wyrm_lua2_' + gd) ? 'fx_wyrm_lua2_' + gd : 'fx_wyrm_lua2';
    if (gd === 1 || ten !== 'fx_wyrm_lua2') SIG.k(ctx, ten, f, x, y, Wd, { g, ax: 0.02, h: hh, a: 0.95 * a });
    else { const im = PX.mau('fx_wyrm_lua2', m.b); if (im) { ctx.save(); ctx.translate(x, y); ctx.rotate(g); ctx.globalAlpha = 0.95 * a; ctx.drawImage(im, f * M2[1], 0, M2[1], M2[2], -Wd * 0.02, -hh / 2, Wd, hh); ctx.restore(); } }
  }
  ctx.globalCompositeOperation = 'lighter';
  // 2) quầng + 3) lõi
  PX.tia(ctx, x, y, x1, y1, W * 0.6 * ph, m.a, 0.5 * a * nh);
  PX.tia(ctx, x, y, x1, y1, (loi ? 1.6 + 0.35 * d : 1.3) * ph, m.b, 0.9 * a);
  PX.tia(ctx, x, y, x1, y1, (loi ? 0.9 + 0.2 * d : 0.6) * ph, loi ? '#ffffff' : m.c, a * nh);
  // 4) loé miệng + loé trúng (quái đầu)
  ctx.globalAlpha = 0.8 * a * nh; R.anhGiua(ctx, R.cham1(m.b), x, y, (16 + 3 * d) * ph); ctx.globalAlpha = a; R.anhGiua(ctx, R.cham1(m.c), x, y, 8 + 2 * d);
  ctx.globalAlpha = 0.85 * a * nh; R.anhGiua(ctx, R.cham1(m.c), v.ex, v.ey, (18 + 4 * d) * ph); ctx.globalAlpha = 0.55 * a; R.anhGiua(ctx, R.cham1(m.b), v.ex, v.ey, 34 + 4 * d);
  ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
HU.vetChay = { // vệt cháy trên đường (vòng tròn than hồng mờ, nằm dưới quái): quái đi qua bị cháy
  duoi: true,
  cap(G, o, dt) {
    o.tick -= dt; if (o.tick > 0) return false; o.tick = 0.5;
    for (const E of dsMucTieu(o.B)) if (!E.chet && Math.hypot(E.x - o.x, E.y - o.y) < 18 + E.d.co * 0.25) {
      E.chayT = Math.max(E.chayT || 0, 1.5); E.chayD = Math.max(E.chayD || 0, o.dmg); E.chayB = o.B;
      if (!G.hu.some(q => q.k === 'chay' && q.E === E)) G.hu.push({ k: 'chay', t: 0, song: 30, E, T: o.T });
    }
    return false;
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, a = (u < 0.1 ? u / 0.1 : 1 - Math.max(0, (u - 0.6) / 0.4)) * 0.55, m = RONG_THAN[o.gd || 1];
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    R.anhGiua(ctx, R.cham1(m.a), o.x, o.y, 40); ctx.globalAlpha = a * 0.6; R.anhGiua(ctx, R.cham1(m.b), o.x, o.y, 20 + 3 * Math.sin(R.t * 9 + o.x));
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.rongBo = { // DRAGON DIVE: bóng rồng bay dọc đường (lõi → cổng), đốt mọi quái nó lướt qua 1 lần, rải vệt cháy
  cap(G, o, dt) {
    const u = Math.min(1, o.t / o.song), s = o.p.len * (1 - u);
    const [x, y, g] = viTri(o.p, s); o.x = x; o.y = y; o.g = g + Math.PI;
    G.dangBan = o.T;
    for (const E of dsMucTieu(o.B)) if (!E.chet && !o.da.has(E) && Math.hypot(E.x - x, E.y - y) < 44 + E.d.co * 0.3) {
      o.da.add(E); trung(E, o.dmg + (E.trum ? E.max * 0.05 : 0), { B: o.B, mau: '#ffb070' });
      FX.no('no_phao', E.x, E.y, 60, 0.3); FX.tiaLua(E.x, E.y, 4, '#ffc070', 160, 8);
    }
    o.vetT -= dt; if (o.vetT <= 0) { o.vetT = 0.08; G.hu.push({ k: 'vetChay', t: 0, song: 3, x, y, B: o.B, T: o.T, dmg: dmgU(o.T) * 0.3 * (o.hv || 1), tick: 0, gd: mauRong(o.T) }); }
    if (TVX.duocLac(0.35)) FX.lac(2);
    return false;
  },
  ve(ctx, o, R) {
    if (o.x == null) return;
    const u = o.t / o.song, a = u < 0.08 ? u / 0.08 : u > 0.9 ? (1 - u) / 0.1 : 1, gd = mauRong(o.T), m = RONG_THAN[gd];
    ctx.save(); ctx.translate(o.x, o.y);
    PX.bong(ctx, 6, 10, 60, 60, 0.35 * a); // bóng đổ = PNG tô đen
    ctx.rotate(o.g);
    ctx.globalCompositeOperation = 'lighter'; PX.cham(ctx, 0, 0, 150, m.a, 0.7 * a);
    // thân rồng = ảnh PNG fx_ronglua_no (đầu rồng phun lửa, ChatGPT) — dạng 2/3 tô lửa xanh; vỗ cánh = nhịp phóng
    // (bỏ cánh/đốt thân/đầu/mắt vẽ bằng lineTo + arc). Chờ ảnh thân rồng bay từ trên xuống: raw_p4_fx_1 ô 'rong_bay'.
    const rd = typeof FXU !== 'undefined' && FXU.co('fx_ronglua_dacbiet') && REN.img('fx_ronglua_dacbiet'); // rồng bổ nhào nhìn từ trên (tờ G4, đầu hướng xuống ảnh → xoay −90°)
    const ro = rd || REN.img('fx_ronglua_no'), vo = 1 + 0.06 * Math.sin(R.t * 18);
    ctx.globalCompositeOperation = 'source-over';
    if (ro) PX.ve(ctx, ro, 0, 0, 84 * vo, 84 * vo * ro.height / ro.width, rd ? -Math.PI / 2 : 0, a);
    const non = anhNon(1); ctx.globalCompositeOperation = 'lighter'; // rồng bổ nhào thân ĐỎ → lửa phía trước CAM (không lấy nón xanh dạng 2/3)
    if (non) PX.ve(ctx, non, 50, 0, 60, 60 * non.height / non.width, 0, 0.8 * a);
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// =====================================================================================================
// đăng ký: họ kỹ năng, mốc sao riêng, grow-up 3 giai đoạn, nhịp hiển thị
// =====================================================================================================
themHo('summon', 4, 'chuato', 'drones circle the hive, then fly out together + SWARM (active)');
themHo('heavy', 4, 'leviathan', 'devours enemies for damage stacks (no cap) + TIDAL BREATH (active)');
themHo('star', 4, 'khoisinh', 'raises the weakest neighbour (limited gifts) + GENESIS (active)');
themHo('blast', 4, 'ronglua', 'heat reactor: piercing fire beam builds heat (row/column merges too), DRAGON DIVE burns it all (active)');

Object.assign(MOC_RIENG, {
  blackhole: { 3: ['SINGULARITY', 'Unlocks the active skill (tap, 30 mana): the next hole is bigger and crushes harder'] },
  chuato: { 3: ['SWARM', 'Unlocks the active skill (tap when full; auto-fires if left full)'], 7: ['FULL BROOD', '7 drones: a 7-drone volley gets +48% damage'] },
  leviathan: { 3: ['TIDAL BREATH', 'Unlocks the active skill (tap when full; auto-fires if left full)'], 5: ['DEEP MAW', 'Devours big enemies (×3 stacks) — starts at 4★'], 7: ['ABYSS LORD', 'Devours every 5s, flyers too'] },
  khoisinh: { 3: ['GENESIS', 'Unlocks the active skill (tap, 30 mana): summons a 1★ next to it'], 5: ['BLOOM', 'Neighbours +15% damage (starts at 4★)'] },
  ronglua: { 3: ['WINGED WYRM', 'New form: HEART CORE — longer, thicker beam, +100% on the front enemy + DRAGON DIVE (tap when full, burns all heat)'], 5: ['ARMORED DRAGON', 'New form: BLUE flame +30% vs big enemies and bosses, core +140%'], 7: ['INFERNO DRAGON', 'New form: WHITE flame, TWIN BEAMS (each with a +140% core), trail 4s'] },
});
Object.assign(GROW, {
  chuato: { mau: '#ff6a2a', khongAnh: true, ten: ['NEST', 'HIVE', 'ROYAL HIVE'], dk: 'Drones circling = stars (1–7) · all fly out when the brood is full',
    gd: (T) => ({ s: gdSao(T), p: (T.sao - 1) / 6, v: [0.5] }) },
  leviathan: { mau: '#1fb6d9', khongAnh: true, ten: ['HATCHLING', 'DEEP ONE', 'ABYSS LORD'], dk: '1–3★ / 4–6★ (devours big ones) / 7★ ABYSS LORD (devours flyers, every 5s)',
    gd: (T) => ({ s: gdSao(T), p: (T.sao - 1) / 6, v: [0.5] }) },
  khoisinh: { mau: '#ff8ab0', khongAnh: true, ten: ['SEED', 'BLOSSOM', 'LOTUS OF LIFE'], dk: '1–3★ / 4–6★ (neighbours +15% dmg) / 7★ · gifts = its stars when it appeared',
    gd: (T) => ({ s: gdSao(T), p: (T.sao - 1) / 6, v: [0.5] }) },
  ronglua: { mau: '#ff5a1a', ten: ['HATCHLING', 'WYRM', 'INFERNO'], dk: '4 forms: 1–2★ Hatchling Engine · 3–4★ Winged Wyrm (heart core) · 5–6★ Armored Dragon (BLUE flame +30% vs big) · 7★ Inferno Dragon (WHITE flame, twin beams)',
    gd: (T) => ({ s: [1, 1, 2, 2, 3][dangRong(T)], p: (T.sao - 1) / 6, v: [0.5] }),
    hinh: [ // trang ụ: 4 dạng HÌNH thật (icon tools/thap-cat-rong-may.py)
      { sao: '1–2★', ten: 'Hatchling Engine', anh: 'nho/ronglua_f1', mo: 'Thin orange fire beam' },
      { sao: '3–4★', ten: 'Winged Wyrm', anh: 'nho/ronglua_f2', mo: 'Thicker HEART CORE beam, DRAGON DIVE' },
      { sao: '5–6★', ten: 'Armored Dragon', anh: 'nho/ronglua_f3', mo: 'BLUE flame +30% vs big', mau: '#4aa8ff' },
      { sao: '7★', ten: 'Inferno Dragon', anh: 'nho/ronglua_f4', mo: 'WHITE twin beams', mau: '#ffd870' },
    ] },
});
Object.assign(NHIP, {
  chuato: (T) => 'brood ' + SKILLS.chuato.chuKy(T, T.thaN).toFixed(1) + 's',
  ronglua: (T) => 'beam ' + (5 * (T && (T.nhiet || 0) >= 100 ? 1.25 : 1)) + ' ticks/s', khoisinh: (T) => '+1★ to a neighbour every ' + SKILLS.khoisinh.g(T) + 's',
});
