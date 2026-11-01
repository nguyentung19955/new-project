'use strict';
/* bao-don.js – LUỒNG D: BÁO ĐÒN rõ hơn cho quái Vùng 1 (vẽ chồng lên khung đã vẽ, KHÔNG sửa ve.js).
   • Vọng Tàn ('tan'): dấu ĐỎ GẠCH gạch đứt trên mặt đất, lan 2 phía tới tầm sóng, từ lúc giơ chuông tới khi đập (~0,88 s).
   • Màn Tang ('tang'): dây vải treo từ trần (luôn thấy) – lúc chuẩn bị vồ (~0,6 s) dây RUNG + BỤI rơi từ trần.
   • Khuyết Cẩu / Kèn Câm / Hồn Vải: tụ năng lượng ở nòng đã do ve.js (luồng C) vẽ – ở đây không vẽ lại.
   Màu ấm (hổ phách, đồng, đỏ gạch) – không dùng cyan (cyan chỉ cho người chơi).
   Đồng thời cập nhật DongCoMN.khungNhin = khung camera để quái không bắn khi chưa hiện trên màn hình.
   Nạp SAU ve.js trong index.html. */
(() => {
  const V1 = window.V1, E = DongCoMN, G = V1.G, T = 48, W = 960, H = 540, PX = 3;
  const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  const KN = {x:0, y:0, w:W, h:H};
  const BUI = [];   // hạt bụi rơi (toạ độ thế giới)

  // khung camera cho engine (gọi mỗi bước 60 Hz từ the-gioi.js, và ngay sau khi vẽ)
  V1.capNhatKhungNhin = function(){
    if (!V1.CAM || !G.phong){ E.khungNhin = null; return; }
    KN.x = V1.CAM.x; KN.y = V1.CAM.y; E.khungNhin = KN;
  };

  const o = (x, y, w, h, m) => { ctx.fillStyle = m; ctx.fillRect(Math.round(x / PX) * PX, Math.round(y / PX) * PX, w, h); };
  function tranTren(x, y){   // mép dưới trần ngay trên điểm (x, y)
    let yy = y; for (let i = 0; i < 40 && yy > 0 && !E.solidPt(x, yy - 2); i++) yy -= 12;
    return Math.max(0, yy);
  }

  /* --- Vọng Tàn: dấu mặt đất trước sóng --- */
  function veVongTan(q){
    const d = q.def, ch = d.chieu || {}, kNo = ch.chan_dong || 5;
    if (q.st !== 'danh' || q._gia || q.kDanh >= kNo) return;
    const fx = q.x + q.w / 2, fy = q.y + q.h, tam = ch.tam || 420;
    const nhip = (E.S.frame >> 2) % 2, a = 0.55 + 0.45 * nhip;
    ctx.globalAlpha = a;
    for (const dir of [-1, 1]){
      for (let s = 18; s <= tam; s += 24){
        const x = fx + dir * s;
        if (!E.datPt(x, fy + 6) || E.solidPt(x, fy - 12)) break;   // sóng dừng ở mép vực / tường → dấu cũng dừng
        o(x - 7, fy - 6, 15, 6, '#B84C43');
        o(x - 4, fy - 6, 9, 3, '#F08B73');
      }
    }
    // vòng đỏ dưới chân
    o(fx - 33, fy - 3, 66, 3, '#F08B73');
    ctx.globalAlpha = 1;
  }

  /* --- Màn Tang: dây vải treo hai bên thân (luôn thấy) – rung + bụi rơi khi sắp vồ --- */
  function veManTang(q){
    if (q.st === 'chet') return;
    const fx = q.x + q.w / 2, tran = tranTren(fx, q.y + 4) - 12, day = q.y + q.h * 0.75;
    const bao = q.st === 'danh' && q.baoTruoc;
    for (const lx of [-30, 24]){
      for (let y = tran; y < day; y += PX){
        const lech = bao ? Math.round(Math.sin((y - tran) / 10 + E.S.frame * 1.1 + lx) * 4) : Math.round(Math.sin((y - tran) / 30 + E.S.frame * 0.03) * 1);
        o(fx + lx + lech, y, 3, 3, '#4a2c1c');
        if (((y - tran) / PX) % 3 === 0) o(fx + lx + lech + 3, y, 3, 3, bao ? '#F0A060' : '#9a5a36');
      }
      // núm vải cuối dây
      o(fx + lx - 3, day, 9, 6, bao ? '#F0A060' : '#7a4630');
    }
    if (bao){
      // bụi + vụn đá rơi từ trần quanh chỗ treo
      for (let i = 0; i < 2; i++) BUI.push({x:fx + (Math.random() - 0.5) * 96, y:tran + 3, vy:0.8 + Math.random() * 1.6, t:36 + (Math.random() * 24 | 0), to:Math.random() < 0.25});
    }
  }

  function buocBui(){
    for (let i = BUI.length - 1; i >= 0; i--){
      const b = BUI[i]; b.y += b.vy; b.vy = Math.min(b.vy + 0.08, 3);
      if (--b.t <= 0 || E.solidPt(b.x, b.y)) BUI.splice(i, 1);
    }
  }

  const veGoc = V1.ve;
  V1.ve = function(mo){
    veGoc(mo);
    V1.capNhatKhungNhin();
    if (!G.phong || G.trang !== 'choi' || G.chuyen || (mo || 0) > 0.05) return;
    const M = cv.width / W, cam = Math.round(V1.CAM.x / PX) * PX, camY = Math.round(V1.CAM.y / PX) * PX;
    ctx.save(); ctx.setTransform(M, 0, 0, M, 0, 0); ctx.imageSmoothingEnabled = false; ctx.translate(-cam, -camY);
    for (const q of E.QUAI){
      if (q.dead || q.laTrum) continue;
      const id = q.def.id;
      if (id === 'tan') veVongTan(q);
      else if (id === 'tang') veManTang(q);
    }
    buocBui();
    for (const b of BUI){ ctx.globalAlpha = Math.min(1, b.t / 20); o(b.x, b.y, b.to ? 6 : 3, b.to ? 6 : 3, b.to ? '#8a6a4a' : '#d8b98a'); }
    ctx.globalAlpha = 1;
    ctx.restore();
  };
})();
