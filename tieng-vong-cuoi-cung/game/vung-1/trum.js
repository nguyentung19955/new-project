'use strict';
/* trum.js – Đòn đặc biệt Vùng 1:
   • Tinh anh Vọng Tàn ('tan'): đập chuông → SÓNG ĐẤT chạy dọc sàn 2 phía (nhảy né). Dưới 50% máu: NHỊP GIẢ (giơ chuông, vòng xám, không sóng) rồi NHỊP THẬT ngay sau.
   • Trùm "Mẫu Chuông Rỗng" (P12 / phòng "trum": true): Gõ Không Tiếng (vòng sóng câm sát sàn – nhảy né) + Mưa Mặt Nạ (mặt nạ rơi, nảy 1 lần).
     Chuyển pha ở 50% máu. Mọi đòn báo trước ≥ 0.45 s (27 bước 60 Hz).
   Hình trùm: lấy theo ID clip trong trum.json (dung / go / tha_mat_na / chuyen_pha / trung / chet); chưa có → ve.js vẽ hình tạm. */
(() => {
  const V1 = window.V1, E = DongCoMN, pl = E.pl, T = 48, G = V1.G;
  const BAO = 30;   // 0.5 s báo trước (≥ 0.45 s)

  /* ---------------- NGUY HIỂM DÙNG CHUNG ---------------- */
  function songDat(x, yDat, dir, v, cao){ G.nguy.push({loai:'song', x, y:yDat, dir, v, w:30, h:cao || 40, t:0, gay:1}); }
  function vong(x, y, gia, mau){ G.nguy.push({loai:'vong', x, y, r:10, t:0, gia:!!gia, mau}); }
  function matNa(x, tre){
    // điểm xuất phát: ô trống đầu tiên dưới trần (trong khung camera); điểm rơi: mặt sàn bên dưới (để vẽ dấu báo)
    let r = Math.max(0, Math.floor((V1.CAM ? V1.CAM.y : 0) / T));
    while (r < E.BD.HANG - 1 && E.solidPt(x, r * T + 4)) r++;
    let yd = r * T; while (yd < E.BD.HANG * T && !E.datPt(x, yd + 2)) yd += 8;
    G.nguy.push({loai:'mat_na', x:x - 15, y:r * T + 2, yTren:r * T + 2, yDat:yd, xDich:x, vx:0, vy:0, w:30, h:30, bao:BAO + (tre || 0), nay:0, t:0, gay:1, xoay:0});
  }
  V1.buocNguy = function(){
    const hb = E.hurtBox(), Wp = E.BD.COT * T;
    for (let i = G.nguy.length - 1; i >= 0; i--){
      const n = G.nguy[i]; n.t++;
      if (n.loai === 'vong'){ n.r += n.gia ? 5 : 7; if (n.t > 40) G.nguy.splice(i, 1); continue; }
      if (n.loai === 'song'){
        n.x += n.dir * n.v;
        const truoc = n.x + n.dir * 16;
        if (!E.datPt(truoc, n.y + 6) || E.solidPt(truoc, n.y - 12) || n.x < 0 || n.x > Wp || n.t > 300){ G.nguy.splice(i, 1); continue; }
        if (!pl.dead && E.overlap(hb, {x:n.x - n.w / 2, y:n.y - n.h, w:n.w, h:n.h})) E.hurt(n.dir, n.gay);
        continue;
      }
      if (n.loai === 'mat_na'){
        if (n.bao > 0){ n.bao--; if (n.bao === 0){ n.x = n.xDich - n.w / 2; n.y = n.yTren; n.vy = 4; } continue; }
        n.vy = Math.min(n.vy + 0.55, 13); n.xoay += n.vx * 0.05;
        if (n.vx){ if (E.moveX(n, n.vx, false)) n.vx = -n.vx; }
        const r = E.moveY(n, n.vy);
        if (r === 1){
          if (n.nay === 0){ n.nay = 1; n.vy = -7.5; n.vx = (n.x + n.w / 2 < pl.x + pl.w / 2 ? 1 : -1) * 2.4; E.shake(0, 1, 1.2); }
          else { V1.hieuUng && V1.hieuUng('vo_mat_na', n.x + n.w / 2, n.y + n.h); G.nguy.splice(i, 1); continue; }
        }
        if (n.y > E.BD.HANG * T + 100){ G.nguy.splice(i, 1); continue; }
        if (!pl.dead && E.overlap(hb, n)) E.hurt(n.x + n.w / 2 < pl.x + pl.w / 2 ? 1 : -1, n.gay);
      }
    }
  };

  /* ---------------- VỌNG TÀN ---------------- */
  V1.buocVongTan = function(){
    for (const q of E.QUAI){
      if (q.def.id !== 'tan' || q.dead) continue;
      const d = q.def;
      if (q.st === 'danh' && q._st !== 'danh'){
        const yeu = q.hp < (d.mau || 150) * 0.5;
        q._gia = yeu && !q._vuaGia; q.khongGay = q._gia; q._song = false;
      }
      if (q.st === 'danh' && !q._song && (d.khung_trung || []).includes(q.kDanh)){
        q._song = true;
        const fx = q.x + q.w / 2 + q.face * 30, fy = q.y + q.h;
        if (q._gia){ vong(fx, fy - 30, true); E.shake(0, 0.5, 1); }
        else { songDat(fx, fy, -1, 5); songDat(fx, fy, 1, 5); vong(fx, fy - 30, false, '#ffbe50'); E.shake(0, 1, 3); }
      }
      if (q._st === 'danh' && q.st !== 'danh'){
        if (q._gia){ q._vuaGia = true; if (q.st === 'hoi'){ q.st = 'duoi'; q.t = 0; } q.cd = 6; }
        else q._vuaGia = false;
        q.khongGay = false;
      }
      q._st = q.st;
    }
  };

  /* ---------------- TRÙM: MẪU CHUÔNG RỖNG ---------------- */
  const DEF = {id:'trum', ten:'Mẫu Chuông Rỗng', mau:300, than:[45, 120], sat_thuong:1, bay:false, mau_khoi:'#6f5a4a', ai:aiTrum, trung:trungTrum, _clip:{}};
  V1.TRUM_DEF = DEF;
  V1.taoTrum = function(p){
    const TR = V1.TRUMJ || {};
    if (TR.than) DEF.than = TR.than;
    const o = p.trum_o || {cot:Math.floor(p.luoi[0].length * 0.65), hang:p.luoi.length - 2};
    const q = E.taoQuai(DEF, {cot:o.cot, tu:1, den:p.luoi[0].length - 2}, V1.chanO(o.cot, o.hang));
    q.st = 'cho'; q.t = 0; q.pha = 1; q.lan = 0; q.cd = 60; q.clip = 'dung'; q.clipT = 0; q.laTrum = true;
    return q;
  };
  function doiTrangThai(q, st){ q.st = st; q.t = 0; }
  function aiTrum(q){
    q.t++; q.clipT++;
    q.vy = Math.min((q.vy || 0) + 0.6, 10); if (E.moveY(q, q.vy) !== 0) q.vy = 0;
    const cx = q.x + q.w / 2, dx = pl.x + pl.w / 2 - cx, pha2 = q.pha >= 2;
    // chạm thân gây sát thương (trừ lúc chết / chờ)
    if (q.st !== 'chet' && q.st !== 'cho' && !pl.dead && E.overlap(E.hurtBox(), {x:q.x + 8, y:q.y + 30, w:q.w - 16, h:q.h - 30})) E.hurt(dx > 0 ? 1 : -1, 1);
    let clip = 'dung';
    switch (q.st){
      case 'cho':
        if (G.dongCua){ doiTrangThai(q, 'gam'); E.shake(0, 1, 4); V1.thongBao('Mẫu Chuông Rỗng'); }
        break;
      case 'gam': clip = 'go'; if (q.t >= 70){ doiTrangThai(q, 'dung'); q.cd = 40; } break;
      case 'dung': {
        if (Math.abs(dx) > 8) q.face = dx > 0 ? 1 : -1;
        if (Math.abs(dx) > 200){ const bi = E.moveX(q, q.face * (pha2 ? 0.9 : 0.6), false); q.dangDi = !bi; }
        if (--q.cd <= 0){
          q.lan++;
          const chon = (q.lan % 2 === 1) !== (Math.random() < 0.25) ? 'go' : 'tha';
          doiTrangThai(q, chon);
        }
        break; }
      case 'go': {   // Gõ Không Tiếng
        clip = 'go';
        if (q.t === BAO){
          const fy = q.y + q.h, v = pha2 ? 6.5 : 5.2;
          songDat(cx - 40, fy, -1, v, 44); songDat(cx + 40, fy, 1, v, 44); vong(cx, fy - 40, false, '#cfd8e6'); E.shake(0, 1, 4);
        }
        if (pha2 && q.t === BAO + 34){ const fy = q.y + q.h; songDat(cx - 40, fy, -1, 6.5, 44); songDat(cx + 40, fy, 1, 6.5, 44); vong(cx, fy - 40, false, '#cfd8e6'); E.shake(0, 1, 3); }
        if (q.t >= BAO + (pha2 ? 64 : 40)){ doiTrangThai(q, 'dung'); q.cd = pha2 ? 60 : 95; }
        break; }
      case 'tha': {   // Mưa Mặt Nạ
        clip = 'tha_mat_na';
        if (q.t === 1){
          const Wp = E.BD.COT * T, n = pha2 ? 6 : 4, px = pl.x + pl.w / 2;
          const xs = [px];
          for (let i = 1; i < n; i++) xs.push(Math.max(T * 1.5, Math.min(Wp - T * 1.5, px + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (T * 2.6) + (Math.random() - 0.5) * 30)));
          xs.forEach((x, i) => matNa(x, i * 9));
        }
        if (q.t >= BAO + (pha2 ? 70 : 55)){ doiTrangThai(q, 'dung'); q.cd = pha2 ? 55 : 90; }
        break; }
      case 'chuyen_pha':
        clip = 'chuyen_pha'; q.batTu = true;
        if (q.t % 20 === 1) E.shake((q.t % 40) ? 1 : -1, 0.5, 3);
        if (q.t >= 100){ q.batTu = false; q.pha = 2; doiTrangThai(q, 'dung'); q.cd = 30; V1.thongBao('Mặt nạ vỡ – Mẫu Chuông Rỗng nổi giận'); }
        break;
      case 'chet':
        clip = 'chet'; q.batTu = true; q.alpha = Math.max(0, 1 - Math.max(0, q.t - 90) / 60);
        if (q.t % 15 === 1) E.shake(0, 1, 2);
        if (q.t >= 150){ q.dead = true; V1.thangTrum && V1.thangTrum(); }
        break;
    }
    if (q.flash > 2 && clip === 'dung') clip = 'trung';
    if (clip !== q.clip){ q.clip = clip; q.clipT = 0; }
    q.baoTruoc = (q.st === 'go' || q.st === 'tha') && q.t < BAO;
  }
  function trungTrum(q, dmg, face){
    if (q.st === 'chet') return;
    if (q.st === 'cho'){ doiTrangThai(q, 'gam'); }
    if (q.hp <= 0){ q.hp = 0; doiTrangThai(q, 'chet'); G.nguy.length = 0; E.SUKIEN.push({k:'trum-chet', q}); return; }
    if (q.pha === 1 && q.hp <= q.def.mau * 0.5){ doiTrangThai(q, 'chuyen_pha'); G.nguy.length = 0; }
  }
})();
