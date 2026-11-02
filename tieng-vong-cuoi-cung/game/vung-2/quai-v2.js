'use strict';
/* quai-v2.js – Vùng 2: chiêu riêng của 4 quái thường + AI tinh anh The Nursery Warden (số khung đúng kế hoạch ChatGPT
   docs/vung-2/ke-hoach-chatgpt.txt mục 4–5). Engine (dong-co-mn.js) lo đi/đuổi/báo đòn/cắn/lao chung; ở đây thêm:
   • Spore Bell – Spore Volley: 3 đạn bào tử chậm (2 ô/s, sống 120 khung), cách 12 khung, bay về phía người chơi.
   • Husk Leaper – Leap Slash: cung nhảy 28 khung (vẽ lệch cao), chém 9 khung cuối khi đáp.
   • Root Siphon – Root Snare: gân rễ báo 42 khung tại chỗ người chơi (≤ 4 ô phía trước) → rễ trồi 12 khung (1 mặt nạ) → giữ chân 24 khung.
   • Rot Gnawer: hiệu ứng cắn.
   • The Nursery Warden (R211): Root Cleave / Bell Stomp / Rot Command, pha 2 ≤ 110 máu (chuyển 90 khung, nhanh hơn 15%), choáng sau 4 đòn liền.
   Mọi hình là ảnh ChatGPT (art/quai-vung-2/fx, fx-warden). Nạp SAU nap.js, TRƯỚC index. */
(() => {
  const V1 = window.V1, E = DongCoMN, pl = E.pl, G = V1.G, T = 48;
  const NG = V1.NG2 = [];   // vật nguy hiểm / hiệu ứng đang chạy (xoá khi đổi phòng)
  let idCu = '';
  V1.khoaChan = 0;

  const napGoc = V1.nap;
  V1.nap = async function(){
    await napGoc();
    const W = V1.QJ && V1.QJ.loai && V1.QJ.loai.warden;
    if (W){ W.ai = aiWarden; W.trung = trungWarden; }
  };

  const hb = () => E.hurtBox();
  const trungNV = (r, dir, dmg) => { if (!pl.dead && pl.iframes <= 0 && E.overlap(hb(), r)){ E.hurt(dir, dmg || 1); return true; } return false; };
  // khung hình theo các đoạn [[kTừ, kĐến, số khung 60 Hz], …] – giữ khung báo đòn cho đúng thời lượng ChatGPT
  function kSeq(t, segs){
    let t0 = 0;
    for (const [a, b, n] of segs){ if (t < t0 + n) return Math.min(b, a + Math.floor((t - t0) / n * (b - a + 1))); t0 += n; }
    return segs[segs.length - 1][1];
  }
  const tong = segs => segs.reduce((s, x) => s + x[2], 0);

  /* ---------------- QUÁI THƯỜNG: thêm sau mỗi bước engine ---------------- */
  V1.buocQuai2 = function(){
    if (G.id !== idCu){ idCu = G.id; NG.length = 0; V1.khoaChan = 0; }
    for (const q of E.QUAI){
      if (q.dead || q.laTrum) continue;
      const id = q.def.id, dangDanh = q.st === 'danh';
      const bat = dangDanh && !q._danh; q._danh = dangDanh;
      const cx = q.x + q.w / 2, fy = q.y + q.h;
      if (q.st === 'chet'){ q.volley = 0; q.veDy = 0; continue; }
      if (id === 'spore_bell'){
        if (bat){ q.volley = 3; q.volT = 36; }
        if (q.volley > 0 && --q.volT <= 0){
          const sx = cx + q.face * 8, sy = q.y + q.h * 0.35, tx = pl.x + pl.w / 2, ty = pl.y + pl.h * 0.5, d = Math.hypot(tx - sx, ty - sy) || 1, v = 1.6;
          NG.push({loai:'dan', x:sx, y:sy, vx:(tx - sx) / d * v, vy:(ty - sy) / d * v, t:0, song:120});
          q.volley--; q.volT = 12;
        }
      } else if (id === 'husk_leaper'){
        if (dangDanh && (q.kDanh ?? 0) >= 2){ q.leapT = (q.leapT || 0) + 1; q.veDy = -Math.sin(Math.min(1, q.leapT / 27) * Math.PI) * 72; }
        else { q.leapT = 0; q.veDy = 0; }
        if (dangDanh && q.kDanh === 6 && !q._chem){ q._chem = true; NG.push({loai:'fx', fx:'chem', x:cx + q.face * 30, y:fy, lat:q.face > 0, t:0, k:2}); }
        if (!dangDanh) q._chem = false;
      } else if (id === 'gnawer'){
        if (dangDanh && q.kDanh === 2 && !q._can){ q._can = true; NG.push({loai:'fx', fx:'can', x:cx + q.face * 34, y:fy - 4, lat:q.face > 0, t:0, k:2}); }
        if (!dangDanh) q._can = false;
      } else if (id === 'root_siphon'){
        if (bat){
          const dx = pl.x + pl.w / 2 - cx, f = dx >= 0 ? 1 : -1, d = Math.max(T, Math.min(4 * T, Math.abs(dx)));
          NG.push({loai:'bay', x:cx + f * d, y:fy, t:0, q});
        }
      }
    }
    // bước các vật nguy hiểm
    for (let i = NG.length - 1; i >= 0; i--){
      const n = NG[i]; n.t++;
      if (n.loai === 'dan'){
        n.x += n.vx; n.y += n.vy;
        if (n.t > n.song || E.solidPt(n.x, n.y)){ NG.splice(i, 1); NG.push({loai:'fx', fx:'dan_trung', x:n.x, y:n.y + 32, t:0, k:2}); continue; }
        if (trungNV({x:n.x - 10, y:n.y - 10, w:20, h:20}, Math.sign(n.vx) || 1)){ NG.splice(i, 1); NG.push({loai:'fx', fx:'dan_trung', x:n.x, y:n.y + 32, t:0, k:2}); }
      } else if (n.loai === 'bay'){   // Root Snare: báo 42 → trồi 12 (sát thương) → còn 24 (giữ chân), tổng 78
        if (n.t > 42 && n.t <= 54 && !n.trung && trungNV({x:n.x - 40, y:n.y - 96, w:80, h:96}, 0)){ n.trung = true; V1.khoaChan = 24; }
        if (n.t >= 78) NG.splice(i, 1);
      } else if (n.loai === 'song_w'){   // sóng dậm Warden: lan 2 ô trong 24 khung, chỉ trúng khi đứng đất
        n.x += n.dir * 4;
        if (pl.onGround && !n.trung && trungNV({x:n.x - 24, y:n.y - 40, w:48, h:40}, n.dir)) n.trung = true;
        if (n.t >= 24) NG.splice(i, 1);
      } else if (n.loai === 'fx'){
        const C = (V1.FXQ || {})[n.fx]; if (!C || n.t > (C.tong || 30)) NG.splice(i, 1);
      } else if (n.loai === 'dau_muc'){ if (n.t >= n.song) NG.splice(i, 1); }
      else if (n.buoc && n.buoc(n) === false) NG.splice(i, 1);
    }
    if (V1.khoaChan > 0) V1.khoaChan--;
  };
  // Root Snare giữ chân: xoá input di chuyển/nhảy/lướt sau khi đọc phím
  V1.sauDocVao = function(){
    if (V1.khoaChan > 0){ const I = E.IN; I.l = I.r = I.j = I.s = false; I.bamJ = I.bamS = false; pl.vx = 0; }
  };

  /* ---------------- VẼ ---------------- */
  V1.veNguy2 = function(c){
    const FQ = V1.FXQ || {}, f = E.S.frame;
    for (const n of NG){
      if (n.loai === 'dan'){ const C = FQ.dan; if (C && C.ok) SpriteMN.ve(c, C, SpriteMN.khungTheoBuoc(C, n.t), n.x, n.y + 16, false, 2); }
      else if (n.loai === 'fx'){ const C = FQ[n.fx]; if (C && C.ok) SpriteMN.ve(c, C, SpriteMN.khungTheoBuoc(C, n.t), n.x, n.y, !!n.lat, n.k || 2); }
      else if (n.loai === 'bay'){
        const C = FQ.re_troi; if (!(C && C.ok)) continue;
        let k; if (n.t <= 42) k = (f >> 3) & 1; else k = Math.min(7, 2 + Math.floor((n.t - 42) / 6));
        SpriteMN.ve(c, C, k, n.x, n.y + 2, false, 2, n.t <= 42 ? 0.65 + 0.35 * ((f >> 2) & 1) : 1);
      } else if (n.loai === 'song_w'){ const C = FQ.w_song; if (C && C.ok) SpriteMN.ve(c, C, Math.min(7, n.t / 3 | 0), n.x, n.y + 2, n.dir > 0, 2); }
      else if (n.loai === 'cung'){ const C = FQ.w_cung; if (C && C.ok) SpriteMN.ve(c, C, Math.min(5, n.t / 2 | 0), n.x, n.y, n.lat, 2); }
      else if (n.loai === 'dau_muc'){ const C = FQ.w_dau_muc; if (C && C.ok) SpriteMN.ve(c, C, SpriteMN.khungTheoBuoc(C, n.t), n.x, n.y, false, n.k || 2, 0.6 + 0.4 * ((f >> 3) & 1)); }
      else if (n.ve) n.ve(c, n);
    }
  };
  V1.denQuai2 = function(){
    const ds = [];
    for (const n of NG){
      if (n.loai === 'dan') ds.push([n.x, n.y, 26, 0.6]);
      else if (n.loai === 'bay') ds.push([n.x, n.y - 30, 44, 0.6]);
      else if (n.loai === 'song_w' || n.loai === 'dau_muc') ds.push([n.x, n.y - 16, 40, 0.55]);
      else if (n.den) ds.push(...n.den(n));
    }
    return ds;
  };

  /* ---------------- THE NURSERY WARDEN ---------------- */
  const SEQ = {
    chem:   [[0, 2, 30], [3, 4, 12], [5, 8, 36]],
    dam:    [[0, 3, 42], [4, 5, 12], [6, 8, 48]],
    ra_lenh:[[0, 4, 54], [5, 7, 60]],
    choang: [[0, 4, 48]],
    chuyen: [[0, 4, 90]]
  };
  const CD = {chem:100, dam:150, ra_lenh:180};
  function anim(q, ten, k){ if (q.anim.ten !== ten){ q.anim.ten = ten; q.anim.t = 0; } else q.anim.t++; q.anim.k = k; }
  function cumCanh(q){   // cụm gỗ mục ở cánh gần người chơi (không phải dưới chân Warden)
    const dm = V1.DH && V1.DH.dm; if (!dm) return null;
    const px = pl.x + pl.w / 2, wx = q.x + q.w / 2;
    let tot = null, best = 1e9;
    for (const k of dm.cum){
      if (k.tt !== 'CHAC') continue;
      const kx = (k.o[0].c + k.o.length / 2) * T;
      if (Math.abs(kx - wx) < 3 * T) continue;
      const d = Math.abs(kx - px); if (d < best){ best = d; tot = k; }
    }
    return tot;
  }
  function aiWarden(q){
    const d = q.def; q.t++;
    q.vy = Math.min((q.vy || 0) + 0.6, 10); if (E.moveY(q, q.vy) !== 0) q.vy = 0;
    const cx = q.x + q.w / 2, fy = q.y + q.h, dx = pl.x + pl.w / 2 - cx, nhanh = q.pha2 ? 0.85 : 1;
    if (q.chuoiT > 0 && --q.chuoiT === 0) q.chuoi = 0;
    q.baoTruoc = false; q.khongGay = true;
    switch (q.st){
      case 'tuan_tra': case 'cho':
        anim(q, 'dung');
        if (G.dongCua){ q.st = 'di'; q.t = 0; q.cd = 40; }
        break;
      case 'di': {
        if (Math.abs(dx) > 8) q.face = dx > 0 ? 1 : -1;
        const xa = Math.abs(dx) > 110;
        if (xa){ const bi = E.moveX(q, q.face * (d.toc_do || 0.9) * (q.pha2 ? 1.15 : 1), false); anim(q, bi ? 'dung' : 'di'); } else anim(q, 'dung');
        if (q.canChuyen){ q.canChuyen = false; q.st = 'chuyen'; q.t = 0; q.batTu = true; V1.thongBao('The Warden\'s bell cracks wider – it quickens'); E.S.sht = 12; E.S.shm = 2; E.S.shx = 1; E.S.shy = 1; break; }
        if (--q.cd > 0) break;
        const now = E.S.frame, gan = Math.abs(dx) < 150;
        const sanDam = now - (q.tDam || -999) >= CD.dam * nhanh, sanLenh = now - (q.tLenh || -999) >= CD.ra_lenh * nhanh;
        const xaNhau = (a, b) => now - (b || -999) >= 60;   // không ghép dậm + ra lệnh trong cùng 60 khung
        let chon = 'chem';
        if (!gan && sanLenh && xaNhau(0, q.tDam) && cumCanh(q)) chon = 'ra_lenh';
        else if (sanDam && xaNhau(0, q.tLenh) && (Math.abs(dx) < 260) && (q.lan++ % 2 === 1 || !gan)) chon = 'dam';
        else if (!gan){ q.cd = 10; break; }
        q.st = chon; q.t = 0; q.daDanh = false; q.face = dx >= 0 ? 1 : -1;
        if (chon === 'dam') q.tDam = now; if (chon === 'ra_lenh'){ q.tLenh = now; q.cumLenh = cumCanh(q); }
        break; }
      case 'chem': {
        const S = SEQ.chem; anim(q, 'chem', kSeq(q.t, S)); q.baoTruoc = q.t < 30;
        if (q.t >= 30 && q.t < 42){
          if (q.t === 30) NG.push({loai:'cung', x:cx + q.face * 56, y:fy, lat:q.face > 0, t:0});
          if (!q.daDanh){ const r = {x:q.face > 0 ? cx : cx - 130, y:fy - 110, w:130, h:110}; if (trungNV(r, q.face)) q.daDanh = true; }
        }
        if (q.t >= tong(S) * (q.t >= 42 ? 1 : 1) - (q.pha2 ? 6 : 0)){ q.st = 'di'; q.t = 0; q.cd = Math.round(30 * nhanh); }
        break; }
      case 'dam': {
        const S = SEQ.dam; anim(q, 'dam', kSeq(q.t, S)); q.baoTruoc = q.t < 42;
        if (q.t === 42){ for (const dir of [-1, 1]) NG.push({loai:'song_w', x:cx + dir * 40, y:fy, dir, t:0}); E.S.sht = 10; E.S.shm = 3; E.S.shx = 0.5; E.S.shy = 1; }
        if (q.t >= tong(S) - (q.pha2 ? 7 : 0)){ q.st = 'di'; q.t = 0; q.cd = Math.round(30 * nhanh); }
        break; }
      case 'ra_lenh': {
        const S = SEQ.ra_lenh; anim(q, 'ra_lenh', kSeq(q.t, S)); q.baoTruoc = q.t < 54;
        const k = q.cumLenh;
        if (q.t === 1 && k){ const x0 = k.o[0].c * T, x1 = (k.o[k.o.length - 1].c + 1) * T; NG.push({loai:'dau_muc', x:(x0 + x1) / 2, y:k.o[0].r * T + 12, t:0, song:54, k:Math.max(1, (x1 - x0) / 144)}); }
        if (q.t === 54 && k && k.tt === 'CHAC'){   // chỉ 1 cụm cánh 3 ô → cảnh báo 72 khung (luật Gỗ Mục nhanh)
          const cu = k.loai; k.loai = 'Q'; V1.dhKichHoat(k.o.map(o => [o.c, o.r]));
          NG.push({loai:'tra', t:0, buoc:n => { if (n.t >= 72 + 12 + 210 + 18 + 30 || k.tt === 'CHAC' && n.t > 80){ k.loai = cu; return false; } }});
          // làm nhiễu nút neo gần nhất 60 khung (báo rõ)
          V1.thongBao('Rot Command – the flank rotwood quickens');
        }
        if (q.t >= tong(S) - (q.pha2 ? 9 : 0)){ q.st = 'di'; q.t = 0; q.cd = Math.round(30 * nhanh); }
        break; }
      case 'choang':
        anim(q, 'choang', kSeq(q.t, SEQ.choang));
        if (q.t >= 48){ q.st = 'di'; q.t = 0; q.cd = 20; }
        break;
      case 'chuyen':
        anim(q, 'choang', kSeq(q.t, SEQ.chuyen));
        if (q.t % 20 === 1) E.shake(q.t % 40 ? 1 : -1, 0.5, 3);
        if (q.t >= 90){ q.batTu = false; q.pha2 = true; q.st = 'di'; q.t = 0; q.cd = 20; }
        break;
      case 'chet': {
        const C = d._clip.chet, n = C && C.tong || 60; anim(q, 'chet');
        q.alpha = q.t <= n ? 1 : Math.max(0, 1 - (q.t - n) / 30);
        if (q.t >= n + 30){ q.dead = true; }
        break; }
    }
  }
  function trungWarden(q, dmg, face){
    if (q.st === 'chet' || q.batTu) return;
    q.hp -= dmg; q.flash = 6;
    if (q.hp <= 0){ q.hp = 0; q.st = 'chet'; q.t = 0; q.batTu = true; E.SUKIEN.push({k:'quai-chet', q}); return; }
    q.chuoi = (q.chuoi || 0) + 1; q.chuoiT = 70;
    if (!q.pha2 && q.hp <= ((q.def.pha_2 || {}).mau_duoi || 110)){ if (q.st === 'di') { q.st = 'chuyen'; q.t = 0; q.batTu = true; V1.thongBao('The Warden\'s bell cracks wider – it quickens'); } else q.canChuyen = true; q.chuoi = 0; return; }
    if (q.chuoi >= 4 && (q.st === 'di' || q.st === 'chem')){ q.chuoi = 0; q.st = 'choang'; q.t = 0; V1.thongBao('Staggered!'); }
  }
  V1.khiHaTinhAnh = function(q){
    V1.thongBao('The Nursery Warden falls – its Warden Knot remains'); G.tbT = 200;
  };
})();
