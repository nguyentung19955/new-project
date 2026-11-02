'use strict';
/* trum.js – Vùng 2: trùm MOLD MOTHER (R213) theo kế hoạch ChatGPT docs/vung-2/ke-hoach-chatgpt.txt mục 5 + game/vung-2/trum.json.
   720 máu, 3 pha (≤480: chuyển 120 khung · ≤240: chuyển 150 khung, nhanh hơn 10%). Đòn (khung 60 Hz):
     Pha 1: Tendril Sweep (báo 36 · trúng 14 · hồi 40) · Spore Rain (báo 48 · rơi 48 · 3 làn, luôn có làn an toàn) · Bell Wail (báo 54 · vòng sàn 24)
     Pha 2: + Rot Bloom (báo 60, kích hoạt 3 cụm gỗ mục giữa) · Tendril Grab (báo 42, vòng đích bám theo tới 12 khung trước khi khoá, trúng 12)
     Pha 3: + Heartbreak Slam (báo 72, dưới lõi 2 mặt nạ, 2 sóng cách 24 khung 1 mặt nạ; 6 ô sát mép luôn an toàn)
   Không chồng khung gây sát thương; ≥ 50 khung giữa 2 lần ra đòn. Chạm thân KHÔNG mất máu – chỉ đòn có báo trước.
   Hình: art/trum-vung-2/<động tác>/fNN.png (ve.js veTrum vẽ theo q.clip) + hiệu ứng art/trum-vung-2/fx (V1.FXT). */
(() => {
  const V1 = window.V1, E = DongCoMN, pl = E.pl, T = 48, G = V1.G;
  const DEF = {id:'mold_mother', ten:'Mold Mother', mau:720, than:[96, 90], sat_thuong:1, bay:false, ai:aiTrum, trung:trungTrum, _clip:{}};
  V1.TRUM_DEF = DEF;
  const SEQ = {
    quet:[[0, 3, 36], [4, 6, 14], [7, 9, 40]], mua:[[0, 4, 48], [5, 7, 48], [8, 9, 42]], gao:[[0, 6, 54], [7, 9, 24], [10, 11, 54]],
    no_muc:[[0, 6, 60], [7, 9, 36]], vo:[[0, 4, 42], [5, 6, 12], [7, 9, 48]], dap:[[0, 8, 72], [9, 10, 12], [11, 13, 72]],
    chuyen_pha_2:[[0, 11, 120]], chuyen_pha_3:[[0, 11, 150]], chet:[[0, 15, 110]]
  };
  const CD = {quet:110, mua:150, gao:180, no_muc:210, vo:160, dap:240};
  function kSeq(t, segs){ let t0 = 0; for (const [a, b, n] of segs){ if (t < t0 + n) return Math.min(b, a + Math.floor((t - t0) / n * (b - a + 1))); t0 += n; } return segs[segs.length - 1][1]; }
  const tong = s => s.reduce((a, x) => a + x[2], 0);
  const NG = () => V1.NG2;
  const trungNV = (r, dir, dmg) => { if (!pl.dead && pl.iframes <= 0 && E.overlap(E.hurtBox(), r)){ E.hurt(dir, dmg || 1); return true; } return false; };
  const FT = n => (V1.FXT || {})[n];
  const veFx = (c, n, t, x, y, lat, s, a) => { const C = FT(n); if (C && C.ok) SpriteMN.ve(c, C, typeof t === 'number' && t < 0 ? -t - 1 : SpriteMN.khungTheoBuoc(C, t), x, y, !!lat, s || 2, a); };
  const veK = (c, n, k, x, y, lat, s, a) => { const C = FT(n); if (C && C.ok) SpriteMN.ve(c, C, k, x, y, !!lat, s || 2, a); };

  V1.taoTrum = function(p){
    const TR = V1.TRUMJ || {};
    if (TR.than) DEF.than = TR.than; if (TR.mau) DEF.mau = TR.mau; if (TR.ten) DEF.ten = TR.ten;
    const o = p.trum_o || {cot:Math.floor(p.luoi[0].length / 2), hang:p.luoi.length - 4};
    // chân trùm đặt trên mặt sàn đấu trường (hàng đất đầu tiên dưới trum_o) – trùm mọc từ rễ, KHÔNG rơi khi gỗ mục sập
    let r = o.hang; while (r < p.luoi.length - 1 && p.luoi[r][o.cot] === '.') r++;
    const q = E.taoQuai(DEF, {cot:o.cot, tu:1, den:p.luoi[0].length - 2}, r * T);
    q.st = 'cho'; q.t = 0; q.pha = 1; q.lan = 0; q.cd = 60; q.clip = 'dung'; q.clipT = 0; q.laTrum = true; q.tCuoi = -999;
    q.minA = 1.5 * T; q.maxA = 50 * T;   // đấu trường chơi được (cột 1–50)
    return q;
  };
  function doi(q, st){ q.st = st; q.t = 0; }
  function chon(q, dx){
    const p = q.pha, now = E.S.frame, san = id => now - (q['t_' + id] || -9999) >= CD[id] * (p >= 3 ? 0.9 : 1);
    const ds = [];
    if (Math.abs(dx) < 6 * T && san('quet')) ds.push('quet', 'quet');
    if (san('gao')) ds.push('gao'); if (p >= 3 && san('gao')) ds.push('gao');
    if (san('mua')) ds.push('mua');
    if (p >= 2 && san('no_muc')) ds.push('no_muc');
    if (p >= 2 && san('vo')) ds.push('vo');
    if (p >= 3 && san('dap')) ds.push('dap');
    if (!ds.length) return null;
    let c = ds[(q.lan * 7 + 3) % ds.length]; if (c === q.cu && ds.length > 1) c = ds[(q.lan * 7 + 4) % ds.length];
    q.cu = c; q['t_' + c] = now; return c;
  }
  function aiTrum(q){
    q.t++; q.clipT++; q.clipK = undefined;
    if (G.dongCua) G.dongT = (G.dongT || 0) + 1; else G.dongT = 0;
    const cx = q.x + q.w / 2, fy = q.y + q.h, px = pl.x + pl.w / 2, dx = px - cx, nhanh = q.pha >= 3 ? 0.9 : 1, rut = q.pha >= 2 ? 0.8 : 1;
    let clip = 'dung';
    q.baoTruoc = false;
    const hetDon = S => q.t >= tong(S.slice(0, -1)) + S[S.length - 1][2] * rut;   // pha 2+: rút ngắn HỒI (không rút báo đòn)
    switch (q.st){
      case 'cho':
        clip = 'tho';
        if (G.dongCua){ doi(q, 'gam'); E.shake(0, 1, 4); }
        break;
      case 'gam': clip = 'tho'; if (q.t >= 70){ doi(q, 'dung'); q.cd = 30; } break;
      case 'dung': {
        clip = (q.t >> 6) & 1 ? 'tho' : 'dung';
        if (Math.abs(dx) > 8) q.face = dx > 0 ? 1 : -1;
        if (q.chuyen){ const n = q.chuyen; q.chuyen = 0; doi(q, 'chuyen_pha_' + n); q.batTu = true; break; }
        if (--q.cd > 0 || E.S.frame - q.tCuoi < 50) break;
        const c = chon(q, dx); if (!c){ q.cd = 12; break; }
        q.lan++; q.tCuoi = E.S.frame; q.daDanh = false; q.face = dx >= 0 ? 1 : -1; doi(q, c);
        if (c === 'mua') datMua(q); if (c === 'no_muc') datNo(q); if (c === 'vo') q.dichX = px;
        break; }
      case 'quet': {   // Tendril Sweep: vệt quét sát sàn 6 ô phía người chơi, cao 70 → nhảy qua
        clip = 'quet'; const S = SEQ.quet; q.clipK = kSeq(q.t, S); q.baoTruoc = q.t < 36;
        if (q.t === 36) NG().push(vetQuet(cx, fy, q.face));
        if (q.t >= 36 && q.t < 50 && !q.daDanh){ const r = {x:q.face > 0 ? cx : cx - 6 * T, y:fy - 70, w:6 * T, h:70}; if (trungNV(r, q.face)) q.daDanh = true; }
        if (hetDon(S)){ doi(q, 'dung'); q.cd = 20 * nhanh; }
        break; }
      case 'mua': {    // Spore Rain: 3 làn, rơi 48 khung, tối đa 1 mặt nạ / lượt
        clip = 'mua'; const S = SEQ.mua; q.clipK = kSeq(q.t, S); q.baoTruoc = q.t < 48;
        if (q.t >= 84 && q.t < 96 && !q.daDanh) for (const x of q.lan3) if (trungNV({x:x - 40, y:fy - 140, w:80, h:140}, 0)){ q.daDanh = true; break; }
        if (hetDon(S)){ doi(q, 'dung'); q.cd = 20 * nhanh; }
        break; }
      case 'gao': {    // Bell Wail: vòng sàn lan ra 2 phía trong 24 khung → nhảy / lướt xuyên
        clip = 'gao'; const S = SEQ.gao; q.clipK = kSeq(q.t, S); q.baoTruoc = q.t < 54;
        if (q.t === 54){ NG().push(vongGao(cx, fy)); E.S.sht = 8; E.S.shm = 2; E.S.shx = 0.5; E.S.shy = 1; }
        if (hetDon(S)){ doi(q, 'dung'); q.cd = 20 * nhanh; }
        break; }
      case 'no_muc': { // Rot Bloom: 3 cụm gỗ mục giữa sáng → kích hoạt cảnh báo cùng lúc (không đụng 2 đảo chắc)
        clip = 'no_muc'; const S = SEQ.no_muc; q.clipK = kSeq(q.t, S); q.baoTruoc = q.t < 60;
        if (q.t === 60 && q.cumNo) V1.dhKichHoat(q.cumNo.flatMap(k => k.o.map(o => [o.c, o.r])));
        if (hetDon(S)){ doi(q, 'dung'); q.cd = 20 * nhanh; }
        break; }
      case 'vo': {     // Tendril Grab: vòng đích bám người chơi tới khung 30, khoá 12 khung rồi đập
        clip = 'vo'; const S = SEQ.vo; q.clipK = kSeq(q.t, S); q.baoTruoc = q.t < 42;
        if (q.t < 30) q.dichX += Math.max(-6, Math.min(6, px - q.dichX));
        if (q.t === 1) NG().push(dichVo(q, fy));
        if (q.t >= 42 && q.t < 54 && !q.daDanh && trungNV({x:q.dichX - 44, y:fy - 120, w:88, h:120}, Math.sign(px - cx) || 1)) q.daDanh = true;
        if (hetDon(S)){ doi(q, 'dung'); q.cd = 20 * nhanh; }
        break; }
      case 'dap': {    // Heartbreak Slam
        clip = 'dap'; const S = SEQ.dap; q.clipK = kSeq(q.t, S); q.baoTruoc = q.t < 72;
        if (q.t === 72 || q.t === 96){ for (const d of [-1, 1]) NG().push(songDap(cx, fy, d, q)); E.S.sht = 12; E.S.shm = 4; E.S.shx = 1; E.S.shy = 1; }
        if (q.t >= 72 && q.t < 84 && !q.daDanh && trungNV({x:cx - 90, y:fy - 180, w:180, h:180}, Math.sign(px - cx) || 1, 2)){ q.daDanh = true; pl.iframes = Math.max(pl.iframes, 90); }
        if (q.t >= 72 + 12 + 72 * rut){ doi(q, 'dung'); q.cd = 30 * nhanh; }
        break; }
      case 'chuyen_pha_2': case 'chuyen_pha_3': {
        clip = q.st; const n = q.st === 'chuyen_pha_2' ? 120 : 150; q.clipK = kSeq(q.t, SEQ[q.st]);
        if (q.t % 24 === 1) E.shake(q.t % 48 ? 1 : -1, 0.6, 3);
        if (q.t >= n){ q.pha = q.st === 'chuyen_pha_2' ? 2 : 3; q.batTu = false; doi(q, 'dung'); q.cd = 40;
          V1.thongBao(q.pha === 2 ? 'The Mold Mother uproots her heart-stalk' : 'The bell-core blazes – she is desperate'); }
        break; }
      case 'chet':
        clip = 'chet'; q.batTu = true; q.clipK = kSeq(q.t, SEQ.chet);
        if (q.t === 100) NG().push({loai:'trum_fx', t:0, ve:(c, n) => veFx(c, 'tan_ra', n.t, cx, fy, false, 2), buoc:n => n.t < 70});
        q.alpha = Math.max(0, 1 - Math.max(0, q.t - 130) / 40);
        if (!pl.dead) pl.iframes = Math.max(pl.iframes, 2);
        if (q.t >= 170){ q.dead = true; if (!pl.dead && V1.thangTrum) V1.thangTrum(); }
        break;
    }
    if (q.flash > 2 && (clip === 'dung' || clip === 'tho')) clip = 'trung';
    if (clip !== q.clip){ q.clip = clip; q.clipT = 0; }
  }
  function trungTrum(q, dmg){
    if (q.st === 'chet' || q.st === 'cho' || q.st === 'gam' || q.batTu) return;
    q.hp -= dmg; q.flash = 6;
    if (q.hp <= 0){ q.hp = 0; doi(q, 'chet'); q.batTu = true; G.luu.kho.verdant_ruin_core = 1; E.SUKIEN.push({k:'trum-chet'}); V1.thongBao('The Mold Mother withers…'); return; }
    if (q.pha === 1 && q.hp <= 480 && !q.chuyen) q.chuyen = 2;
    else if (q.pha === 2 && q.hp <= 240 && !q.chuyen) q.chuyen = 3;
  }

  /* ---------------- VẬT NGUY HIỂM CỦA TRÙM (vẽ bằng hình ChatGPT) ---------------- */
  function vetQuet(cx, fy, dir){   // vệt quét 128×64 ×2 → dài ~256 px; vẽ 2 đoạn liền cho đủ 6 ô
    return {loai:'trum_fx', t:0, buoc:n => n.t < 18,
      ve:(c, n) => { for (let i = 0; i < 2; i++) veFx(c, 'vet', n.t, cx + dir * (64 + i * 144), fy + 4, dir > 0, 2.25); },
      den:n => [[cx + dir * 3 * T, fy - 30, 80, 0.55]]};
  }
  function datMua(q){
    const px = pl.x + pl.w / 2, cl = x => Math.max(q.minA + T, Math.min(q.maxA - T, x));
    q.lan3 = [cl(px), cl(px - 4 * T), cl(px + 4 * T)];
    const fy = q.y + q.h, top = 2 * T;
    for (const x of q.lan3) NG().push({loai:'trum_fx', t:0, buoc:n => n.t < 96,
      ve:(c, n) => {
        if (n.t < 96) veFx(c, 'dau_mua', n.t, x, fy + 2, false, 2, n.t < 48 ? 0.6 + 0.4 * ((E.S.frame >> 3) & 1) : 1);   // dấu làn
        if (n.t >= 48){ const p = (n.t - 48) / 48, y = top + (fy - top) * p; for (const o of [-24, 0, 24]) veFx(c, 'bao_tu_roi', n.t + o, x + o, y - Math.abs(o), false, 2); }
      },
      den:n => [[x, fy - 20, 40, 0.6]].concat(n.t >= 48 ? [[x, top + (fy - top) * (n.t - 48) / 48, 36, 0.6]] : [])});
  }
  function datNo(q){
    const dm = V1.DH && V1.DH.dm; q.cumNo = null; if (!dm) return;
    const cx = q.x + q.w / 2;
    q.cumNo = dm.cum.filter(k => Math.abs((k.o[0].c + k.o.length / 2) * T - cx) < 9 * T).slice(0, 3);
    for (const k of q.cumNo){
      const x = (k.o[0].c + k.o.length / 2) * T, y = k.o[0].r * T + 8;
      NG().push({loai:'trum_fx', t:0, buoc:n => n.t < 96, ve:(c, n) => veFx(c, 'no_muc', n.t, x, y, false, 1, n.t < 60 ? 0.7 + 0.3 * ((E.S.frame >> 2) & 1) : 1), den:() => [[x, y, 50, 0.6]]});
    }
  }
  function vongGao(cx, fy){
    const n0 = {loai:'trum_fx', t:0, trung:false, r:90, buoc:n => {
      n.r = 90 + n.t * 26;
      if (!n.trung && pl.onGround && !pl.dead){ const d = Math.abs(pl.x + pl.w / 2 - cx); if (d > n.r - 34 && d < n.r + 8 && pl.iframes <= 0){ E.hurt(Math.sign(pl.x - cx) || 1, 1); n.trung = true; } }
      return n.t < 24; },
      ve:(c, n) => { for (const d of [-1, 1]) veFx(c, 'vong_gao', n.t, cx + d * n.r, fy + 4, d < 0, 1); },
      den:n => [[cx - n.r, fy - 16, 40, 0.6], [cx + n.r, fy - 16, 40, 0.6]]};
    return n0;
  }
  function dichVo(q, fy){
    return {loai:'trum_fx', t:0, buoc:n => n.t < 54 && q.st === 'vo',
      ve:(c, n) => veFx(c, 'dich_vo', n.t < 30 ? n.t : -4, q.dichX, fy + 2, false, 2, n.t < 30 ? 0.75 : 1),
      den:() => [[q.dichX, fy - 20, 44, 0.65]]};
  }
  function songDap(cx, fy, dir, q){
    return {loai:'trum_fx', t:0, x:cx + dir * 100, trung:false, buoc:n => {
      n.x += dir * 8;
      if (!n.trung && pl.onGround && E.overlap(E.hurtBox(), {x:n.x - 60, y:fy - 46, w:120, h:46}) && pl.iframes <= 0){ E.hurt(dir, 1); n.trung = true; }
      return n.x > 7 * T && n.x < 44 * T && n.t < 80; },   // 6 ô sát hai mép luôn an toàn
      ve:(c, n) => veFx(c, 'song_dap', n.t, n.x, fy + 4, dir < 0, 1),
      den:n => [[n.x, fy - 20, 48, 0.6]]};
  }
  /* LỚP TÁCH RIÊNG (ChatGPT, art/trum-vung-2/lop): lõi chuông sáng dần lúc báo Bell Wail / Heartbreak Slam / chuyển pha;
     xúc tu vươn ra lúc Tendril Grab (gốc phía trùm, ngọn về vòng đích) và Tendril Sweep. ve.js veTrum gọi sau khi vẽ thân. */
  V1.veTrumLop = function(c, q, fx, fy){
    if (q.dead || q.st === 'chet') return;
    const sang = (q.st === 'gao' && q.t < 54) || (q.st === 'dap' && q.t < 72) || q.st.startsWith('chuyen_pha');
    if (sang){ const C = FT('loi'), n = C && C.ok ? C.hinh.length : 7, tl = q.st === 'gao' ? q.t / 54 : q.st === 'dap' ? q.t / 72 : (E.S.frame % 60) / 60;
      veK(c, 'loi', Math.min(n - 1, Math.floor(tl * n)), fx + (q.face > 0 ? 2 : -2), fy - 66 + 32, q.face > 0, 1.5, q.st === 'dap' ? 0.7 + 0.3 * ((E.S.frame >> 3) & 1) : 0.9); }
    if (q.st === 'vo' && q.t >= 30 && q.t < 66){ const phai = q.dichX > fx, k = Math.min(7, Math.floor((q.t - 30) / 4));
      const x = (fx + q.dichX) / 2; veK(c, 'xuc_tu', k, x, fy + 6, phai, Math.max(1, Math.abs(q.dichX - fx) / 192), 1); }
    if (q.st === 'quet' && q.t >= 30 && q.t < 60){ const k = Math.min(7, Math.floor((q.t - 30) / 4)); veK(c, 'xuc_tu', k, fx + q.face * 150, fy + 6, q.face > 0, 2, 1); }
  };
  // bước + vẽ: dùng chung danh sách V1.NG2 (quai-v2.js) – mục loai 'trum_fx' tự có buoc/ve/den
})();
