'use strict';
/* trum.js – Đòn đặc biệt Vùng 1:
   • Tinh anh Vọng Tàn ('tan'): đập chuông → SÓNG ĐẤT chạy dọc sàn 2 phía (nhảy né). Dưới 50% máu: NHỊP GIẢ (giơ chuông, vòng xám, không sóng) rồi NHỊP THẬT ngay sau.
   • Trùm "Mẫu Chuông Rỗng" (P12 / phòng "trum": true): Gõ Không Tiếng (vòng sóng câm sát sàn – nhảy né) + Mưa Mặt Nạ (mặt nạ rơi, nảy 1 lần).
     Chuyển pha ở 50% máu. Mọi đòn báo trước ≥ 0.45 s (27 bước 60 Hz).
   • (luồng E) Quét Chuông Ngang: khi người chơi đứng gần (≤ 4.5 ô), trùm giơ chuông báo 0.6 s rồi quét ngang sát sàn ra phía trước ~4 ô
     (cao 80 px → nhảy qua hoặc lùi ra xa). Pha 2 quét xa hơn.
   • (luồng F) BA VÙNG TÁCH RIÊNG của trùm:
       – THÂN CHẮN (V1.thanTrum): khối chuông/bụng 100×170 px ở giữa chân – KHÔNG gồm tay rễ, dây, gai. Người chơi không đi/lướt
         xuyên qua được: chồng lấn thì bị đẩy NGANG MỀM vài px/khung (không dịch chuyển tức thời); nhảy lên đầu thì trượt xuống một bên;
         bị kẹp giữa trùm và tường thì đẩy TRÙM lùi ra (phía có chỗ), kẹt hẳn thì cho đi xuyên. Chỉ đẩy ngang → không bao giờ lọt nền.
       – VÙNG NHẬN ĐÒN (hộp q.x/y/w/h, 176×190 px ≈ khớp hình): chém trúng chỗ nào trên hình thì tính trúng.
       – VÙNG GÂY SÁT THƯƠNG: CHỈ các đòn có báo trước (sóng Gõ Không Tiếng, vệt Quét Chuông, mặt nạ rơi). Chạm thân KHÔNG mất máu
         (trước đây chạm thân trừ máu cả lúc gầm / chuyển pha → "trúng mà không báo trước").
     Báo đòn: gầm = rung vỏ + nứt đỏ (không sát thương) · Gõ = giơ chuông 0,5 s + vạch đỏ hai bên chân · Quét = KÉO NGƯỢC 0,45 s,
     vẽ sẵn vùng nguy hiểm đúng bằng tầm quét · Mưa Mặt Nạ = dấu hổ phách + bóng trên sàn 0,5 s+ · chuyển pha = rung + nứt, không sát thương.
   • (luồng G) PHA 2 – RỄ MÓC MỘ: trùm giơ chuông, 3 VẾT NỨT ĐỎ lần lượt toác dưới sàn (dưới chân người chơi, rồi lùi dần ra xa
     trùm, cách nhau ~2,2 ô, so le 0,27 s); mỗi vết nứt báo ≥ 0,6 s rồi rễ đen–đỏ gạch có móc trồi lên cao 92 px (thấp hơn tầm nhảy
     thường) trong ~0,45 s rồi rút. Đứng yên = trúng rễ 1; chạy thẳng ra xa = gặp rễ 2/3 → phải NHẢY qua hoặc ĐỔI CHỖ vào gần trùm.
     Pha 2 xoay vòng: Mưa Mặt Nạ → Rễ Móc Mộ → (Quét / Gõ) → … (đổi nhịp, không chỉ tăng sát thương).
   Hình trùm: art/vung-1/trum/nghi.png, gio-chuong.png, vo-mat-na.png (ve.js veTrumAnh); nếu trum.json có clip thật thì ưu tiên clip;  trong trum.json (dung / go / tha_mat_na / chuyen_pha / trung / chet); chưa có → ve.js vẽ hình tạm. */
(() => {
  const V1 = window.V1, E = DongCoMN, pl = E.pl, T = 48, G = V1.G;
  const BAO = 30;   // 0.5 s báo trước (≥ 0.45 s)
  const KEO_QUET = 27;   // Quét Chuông: kéo ngược 0,45 s (yêu cầu 0,35–0,5 s)
  const BAO_RE = 36, CACH_RE = 16, RE_CAO = 92, RE_RONG = 36, RE_GIU = 27;   // Rễ Móc Mộ: báo 0,6 s · so le 0,27 s · cao 92 px · gây sát thương 0,45 s
  V1.RE = {BAO_RE, CACH_RE, RE_CAO, RE_RONG, RE_GIU};
  // ô trống để thả mặt nạ: cột x có ít nhất 2 ô trống liền trên mặt đất (trong khung camera); không có thì dò sang 2 bên
  function timCotTrong(x){
    for (const d of [0, T, -T, 2 * T, -2 * T, 3 * T, -3 * T]){
      const xx = x + d; if (xx < T || xx > E.BD.COT * T - T) continue;
      let y = Math.max(T, (V1.CAM ? V1.CAM.y : 0) + 8), trong = 0;
      for (; y < E.BD.HANG * T; y += T / 2){ if (E.solidPt(xx, y)) trong = 0; else if (++trong >= 4) return xx; }
    }
    return null;
  }
  // chọn chiêu: không lặp lại chiêu vừa dùng; người chơi đứng gần thì hay Quét; Mưa Mặt Nạ chắc chắn ra ít nhất 1 lần mỗi 3 chiêu
  function chonChieu(q, dx){
    const ls = q.lichSu || (q.lichSu = []), cuoi = ls[ls.length - 1], gan = Math.abs(dx) < T * 4.5;
    let chon;
    if (ls.length >= 2 && !ls.slice(-2).includes('tha')) chon = 'tha';
    else if (q.pha >= 2 && !ls.slice(-2).includes('re')) chon = 're';   // (luồng G) pha 2: Rễ Móc Mộ mỗi 3 chiêu
    else if (gan && cuoi !== 'quet' && Math.random() < 0.55) chon = 'quet';
    else chon = cuoi === 'go' ? 'tha' : cuoi === 'tha' ? 'go' : (Math.random() < 0.5 ? 'go' : 'tha');
    ls.push(chon); if (ls.length > 6) ls.shift();
    return chon;
  }

  /* ---------------- NGUY HIỂM DÙNG CHUNG ---------------- */
  function quet(x, y, dir, dai){ G.nguy.push({loai:'quet', x, y, dir, dai, h:80, t:0, gay:1}); }
  function songDat(x, yDat, dir, v, cao){ G.nguy.push({loai:'song', x, y:yDat, dir, v, w:30, h:cao || 40, t:0, gay:1}); }
  function vong(x, y, gia, mau){ G.nguy.push({loai:'vong', x, y, r:10, t:0, gia:!!gia, mau}); }
  function matNa(x, tre){
    // điểm xuất phát: ô trống đầu tiên dưới trần (trong khung camera); điểm rơi: mặt sàn bên dưới (để vẽ dấu báo)
    let r = Math.max(0, Math.floor((V1.CAM ? V1.CAM.y : 0) / T));
    while (r < E.BD.HANG - 1 && E.solidPt(x, r * T + 4)) r++;
    let yd = r * T; while (yd < E.BD.HANG * T && !E.datPt(x, yd + 2)) yd += 8;
    G.nguy.push({loai:'mat_na', x:x - 15, y:r * T + 2, yTren:r * T + 2, yDat:yd, xDich:x, vx:0, vy:0, w:30, h:30, bao:BAO + (tre || 0), nay:0, t:0, gay:1, xoay:0});
  }
  // (luồng G) Rễ Móc Mộ: vết nứt báo trước rồi rễ trồi tại x (trên mặt sàn dưới yTu)
  function reMoc(x, yTu, tre){
    let yd = yTu; while (yd < E.BD.HANG * T && !E.datPt(x, yd + 2)) yd += 4;
    if (yd >= E.BD.HANG * T || E.solidPt(x, yd - 24)) return false;
    yd = Math.floor((yd + 2) / T) * T;
    G.nguy.push({loai:'re', x, y:yd, bao:BAO_RE + (tre || 0), baoTong:BAO_RE + (tre || 0), tr:0, h:0, w:RE_RONG, t:0, gay:1});
    return true;
  }
  V1.buocNguy = function(){
    const hb = E.hurtBox(), Wp = E.BD.COT * T;
    for (let i = G.nguy.length - 1; i >= 0; i--){
      const n = G.nguy[i]; n.t++;
      if (n.loai === 'quet'){   // vệt quét chuông: gây sát thương 12 bước đầu, sau đó chỉ còn vệt mờ
        if (n.t > 26){ G.nguy.splice(i, 1); continue; }
        const k = Math.min(1, n.t / 6), x0 = n.dir > 0 ? n.x : n.x - n.dai * k;
        if (n.t <= 12 && !pl.dead && E.overlap(hb, {x:x0, y:n.y - n.h, w:n.dai * k, h:n.h})) E.hurt(n.dir, n.gay);
        continue;
      }
      if (n.loai === 'vong'){ n.r += n.gia ? 5 : 7; if (n.t > 40) G.nguy.splice(i, 1); continue; }
      if (n.loai === 're'){   // báo (nứt) → trồi 5 khung → giữ → rút
        if (n.bao > 0){ n.bao--; if (n.bao === 0) E.shake(0, 0.6, 2); continue; }
        n.tr++;
        n.h = n.tr <= 5 ? RE_CAO * n.tr / 5 : n.tr <= RE_GIU ? RE_CAO : Math.max(0, RE_CAO * (1 - (n.tr - RE_GIU) / 12));
        if (n.tr > RE_GIU + 12){ G.nguy.splice(i, 1); continue; }
        if (n.tr <= RE_GIU && n.h > 24 && !pl.dead && E.overlap(hb, {x:n.x - n.w / 2, y:n.y - n.h, w:n.w, h:n.h})) E.hurt(n.x < pl.x + pl.w / 2 ? 1 : -1, n.gay);
        continue;
      }
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
  const DEF = {id:'trum', ten:'Mẫu Chuông Rỗng', mau:640, than:[88, 95], sat_thuong:1, bay:false, mau_khoi:'#6f5a4a', ai:aiTrum, trung:trungTrum, _clip:{}};
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
    // (luồng F) chạm thân KHÔNG gây sát thương nữa – thân chỉ CHẮN (V1.buocThanTrum). Sát thương chỉ đến từ đòn có báo trước.
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
          const chon = chonChieu(q, dx);
          if (chon === 'quet') q.face = dx > 0 ? 1 : -1;
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
      case 'quet': {   // Quét Chuông Ngang: KÉO NGƯỢC 0,45 s (lùi + ngả chuông ra sau, vùng nguy hiểm hiện sẵn) rồi quét
        clip = 'go';
        const BQ = KEO_QUET;
        q.quetDai = pha2 ? 230 : 190;
        q.dangQuet = q.t >= BQ && q.t < BQ + 16;
        if (q.t < BQ) E.moveX(q, -q.face * 0.7, false);   // kéo ngược: lùi ~19 px
        if (q.t === BQ){
          const fy = q.y + q.h;
          quet(cx + q.face * 24, fy, q.face, q.quetDai); E.shake(q.face, 0.5, 3);
        }
        if (q.t >= BQ && q.t < BQ + 8) E.moveX(q, q.face * 1.5, false);   // nhoài người theo cú quét
        if (q.t >= BQ + 44){ q.dangQuet = false; doiTrangThai(q, 'dung'); q.cd = pha2 ? 50 : 80; }
        break; }
      case 'tha': {   // Mưa Mặt Nạ
        clip = 'tha_mat_na';
        if (q.t === 1){
          const Wp = E.BD.COT * T, n = pha2 ? 6 : 4, px = pl.x + pl.w / 2;
          const xs = [px];
          for (let i = 1; i < n; i++) xs.push(px + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (T * 2.6) + (Math.random() - 0.5) * 30);
          // (luồng F) chỉ thả ở cột có khoảng trống thật (không thả trong tường dày ở mép phòng → trước đây có lần "không ra")
          let ra = 0;
          xs.forEach(x => { const xo = timCotTrong(Math.max(T, Math.min(Wp - T, x))); if (xo !== null){ matNa(xo, ra * 9); ra++; } });
          q.matNaRa = (q.matNaRa || 0) + ra;
        }
        if (q.t >= BAO + (pha2 ? 70 : 55)){ doiTrangThai(q, 'dung'); q.cd = pha2 ? 55 : 90; }
        break; }
      case 're': {   // (luồng G) Rễ Móc Mộ – chỉ pha 2
        clip = 'go';
        if (q.t === 1){
          const Wp = E.BD.COT * T, px = pl.x + pl.w / 2, buoc = T * 2.2;
          let dir = px >= cx ? 1 : -1;                                   // lùi dần ra XA trùm
          if (px + dir * buoc * 2 > Wp - T * 1.5 || px + dir * buoc * 2 < T * 1.5) dir = -dir;   // sát tường thì đổi phía
          let ra = 0;
          for (let i = 0; i < 3; i++){ const x = px + dir * buoc * i; if (x > T && x < Wp - T && reMoc(x, q.y + q.h - 60, i * CACH_RE)) ra++; }
          q.reRa = (q.reRa || 0) + ra;
        }
        if (q.t >= BAO_RE + 2 * CACH_RE + RE_GIU + 14){ doiTrangThai(q, 'dung'); q.cd = 50; }
        break; }
      case 'chuyen_pha':
        clip = 'chuyen_pha'; q.batTu = true;
        if (q.t % 20 === 1) E.shake((q.t % 40) ? 1 : -1, 0.5, 3);
        if (q.t >= 100){ q.batTu = false; q.pha = 2; doiTrangThai(q, 'dung'); q.cd = 30; V1.thongBao('Mặt nạ vỡ – Mẫu Chuông Rỗng nổi giận'); }
        break;
      case 'chet':
        clip = 'chet'; q.batTu = true; q.alpha = Math.max(0, 1 - Math.max(0, q.t - 90) / 60);
        if (q.t % 15 === 1) E.shake(0, 1, 2);
        if (!pl.dead) pl.iframes = Math.max(pl.iframes, 2);   // trùm đã gục: không còn gì gây sát thương
        if (q.t >= 150){ q.dead = true; if (!pl.dead && V1.thangTrum) V1.thangTrum(); }   // người chơi đã ngã cùng lúc → khiChet lo màn "Hết Vùng 1"
        break;
    }
    if (q.flash > 2 && clip === 'dung') clip = 'trung';
    if (clip !== q.clip){ q.clip = clip; q.clipT = 0; }
    q.baoTruoc = ((q.st === 'go' || q.st === 'tha') && q.t < BAO) || (q.st === 'quet' && q.t < KEO_QUET) || (q.st === 're' && q.t < BAO_RE) ||
      (q.st === 'go' && pha2 && q.t >= BAO + 10 && q.t < BAO + 34);   // pha 2: nhịp gõ thứ hai cũng báo lại 0,4 s
    q.keoQuet = q.st === 'quet' && q.t < KEO_QUET ? q.t / KEO_QUET : 0;   // 0→1 trong lúc kéo ngược (ve.js vẽ vùng nguy hiểm)
    if (q.st !== 'quet') q.dangQuet = false;
  }
  /* ---------------- THÂN CHẮN (luồng F) ----------------
     Khối chuông/bụng: rộng THAN_W, cao THAN_H, giữa chân trùm. Gọi V1.buocThanTrum() mỗi bước 60 Hz SAU engine (index.html).
     • Đi/chạy/lướt vào: bị chặn như tường mềm – cho lấn tối đa MEM px, phần lấn thêm trong khung bị trả lại (≤ 14 px/khung),
       rồi đẩy ra từ từ 2,5 px/khung → không xuyên được, không giật.
     • Rơi/nhảy lên đầu (khung trước chân còn ở trên nóc thân): KHÔNG làm sàn – đẩy ngang 5 px/khung về phía gần → trượt xuống một bên.
     • Bị kẹp (phía bị đẩy là tường): đẩy TRÙM lùi ra phía có chỗ; nếu trùm cũng kẹt thì cho người chơi đi xuyên (quaTrum) tới khi hết chồng.
     • Chỉ đẩy NGANG bằng E.moveX (có va chạm ô) → không bao giờ đẩy lọt nền / vào tường.
     • Tắt khi trùm đang chết (mờ dần) hoặc người chơi đã chết. */
  const THAN_W = 100, THAN_H = 170, MEM = 10, CAP = 14, DAY_MEM = 2.5, DAY_TREN = 5;
  const TH = {x:0, y:0, w:THAN_W, h:THAN_H}, PB = {x:0, y:0, w:0, h:0};
  function thanTrum(q){ TH.x = q.x + q.w / 2 - THAN_W / 2; TH.y = q.y + q.h - THAN_H; TH.w = THAN_W; TH.h = THAN_H; return TH; }
  V1.thanTrum = thanTrum;
  const TT = V1.TT = {pen:0, ben:0, tren:false, day0:null, kep:0, qua:false, lanDay:0, lanKep:0, lanQua:0};
  V1.buocThanTrum = function(){
    const q = G.trum, day0 = TT.day0; TT.day0 = pl.y + pl.h;
    if (!q || q.dead || q.st === 'chet' || pl.dead){ TT.pen = 0; TT.qua = false; TT.ben = 0; return; }
    const B = thanTrum(q); PB.x = pl.x; PB.y = pl.y; PB.w = pl.w; PB.h = pl.h;
    if (!E.overlap(PB, B)){ TT.pen = 0; TT.qua = false; TT.ben = 0; TT.tren = false; TT.kep = 0; return; }
    if (TT.qua) return;   // đang cho đi xuyên (bị kẹt) – tới khi hết chồng
    const pc = pl.x + pl.w / 2, bc = B.x + B.w / 2;
    if (!TT.ben){   // vừa bắt đầu chồng: chọn phía đẩy + xem có phải từ trên rơi xuống
      TT.ben = pc > bc + 0.5 ? 1 : pc < bc - 0.5 ? -1 : (pl.vx ? -Math.sign(pl.vx) : -q.face);
      TT.tren = day0 !== null && day0 <= B.y + 6;
      TT.pen = -1;   // khung đầu: không trả lại phần lấn (chồng lớn sẵn – vd rơi giữa đầu – chỉ đẩy mềm, không giật)
    }
    if (TT.tren && pl.y + pl.h > B.y + 40 && !E.overlap(PB, {x:B.x + 4, y:B.y, w:B.w - 8, h:B.h})) TT.tren = false;
    const ben = TT.ben, pen = ben > 0 ? (B.x + B.w) - pl.x : (pl.x + pl.w) - B.x;   // quãng phải đi để ra khỏi thân về phía `ben`
    const pen0 = TT.pen < 0 ? pen : TT.pen;
    let day;
    // trượt từ đầu xuống: đẩy 5 px/khung + trả lại phần người chơi tự ép thêm vào (giữ phím hướng vào thân)
    if (TT.tren) day = Math.min(pen, DAY_TREN + Math.min(CAP, Math.max(0, pen - pen0)));
    else { const cung = Math.min(CAP, Math.max(0, pen - Math.max(pen0, MEM))); day = Math.min(pen, cung + DAY_MEM); }
    const x0 = pl.x; E.moveX(pl, ben * day, false); const di = Math.abs(pl.x - x0);
    TT.lanDay++;
    if (day - di > 0.01){   // bị kẹp: phía `ben` là tường → đẩy trùm lùi ra
      TT.kep++; TT.lanKep++;
      const q0 = q.x; E.moveX(q, -ben * (day - di), false);
      if (Math.abs(q.x - q0) < 0.01 && TT.kep > 6){ TT.qua = true; TT.lanQua++; }   // kẹt cả hai: cho đi xuyên
    } else TT.kep = 0;
    PB.x = pl.x; TT.pen = ben > 0 ? (B.x + B.w) - pl.x : (pl.x + pl.w) - B.x;
    if (TT.pen <= 0) TT.pen = 0;
  };

  function trungTrum(q, dmg, face){
    if (q.st === 'chet') return;
    if (q.st === 'cho'){ doiTrangThai(q, 'gam'); }
    if (q.hp <= 0){
      q.hp = 0; doiTrangThai(q, 'chet'); G.nguy.length = 0; E.SUKIEN.push({k:'trum-chet', q});
      // (luồng F) ghi nhận hạ trùm NGAY (không chờ hết 2,5 s mờ dần) → chết cùng lúc / tải lại giữa chừng không mất tiến độ
      if (G.luu && !G.luu.trumHa){ G.luu.trumHa = true; V1.ghiLuu && V1.ghiLuu(); }
      return;
    }
    if (q.pha === 1 && q.hp <= q.def.mau * 0.5){ doiTrangThai(q, 'chuyen_pha'); G.nguy.length = 0; }
  }
})();
