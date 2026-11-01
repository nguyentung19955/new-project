'use strict';
/* bao-don.js – LUỒNG D: BÁO ĐÒN rõ hơn cho quái Vùng 1 (vẽ chồng lên khung đã vẽ, KHÔNG sửa ve.js).
   • Vọng Tàn ('tan'): dấu ĐỎ GẠCH gạch đứt trên mặt đất, lan 2 phía tới tầm sóng, từ lúc giơ chuông tới khi đập (~0,88 s).
   • Màn Tang ('tang'): dây vải treo từ trần (luôn thấy) – lúc chuẩn bị vồ (~0,6 s) dây RUNG + BỤI rơi từ trần.
   • Khuyết Cẩu / Kèn Câm / Hồn Vải (chiêu bắn): đốm tụ năng lượng hổ phách/đồng ở nòng, to dần trong lúc báo trước.
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

  /* --- Màn Tang: dây rung + bụi rơi --- */
  function veManTang(q){
    if (q.st === 'chet' && q.alpha < 0.5) return;
    const fx = q.x + q.w / 2, top = q.y + 6, tran = tranTren(fx, q.y);
    const bao = q.st === 'danh' && q.baoTruoc;
    const rung = bao ? ((E.S.frame >> 1) % 2 ? 3 : -3) : 0;
    // 2 sợi dây vải treo (đồng sẫm + viền sáng ấm)
    for (const lx of [-9, 6]){
      for (let y = tran; y < top; y += PX){
        const lech = bao ? Math.round(Math.sin((y - tran) / 14 + E.S.frame * 0.9) * 3) + rung : 0;
        o(fx + lx + lech, y, 3, 3, '#5a3622');
        if ((y / PX) % 4 === 0) o(fx + lx + lech + 3, y, 3, 3, '#D67B49');
      }
    }
    if (bao){
      // bụi rơi từ trần quanh chỗ treo
      if (E.S.frame % 3 === 0) for (let i = 0; i < 2; i++) BUI.push({x:fx + (Math.random() - 0.5) * 70, y:tran + 2, vy:1 + Math.random() * 1.5, t:40 + (Math.random() * 20 | 0)});
      // mảng tối rung trên trần
      o(fx - 24 + rung, tran, 48, 3, '#b39161');
    }
  }

  /* --- Quái bắn: tụ năng lượng ở nòng --- */
  function veTuNong(q){
    const d = q.def, ch = d.chieu;
    if (!ch || ch.kieu !== 'dan' || q.st !== 'danh' || !q.baoTruoc) return;
    const fx = q.x + q.w / 2, fy = q.y + q.h, n = ch.nong || [0, -40], TL = E.TL;
    const x = fx + n[0] * TL * -q.face, y = fy + n[1] * TL;
    const k = Math.min(1, (q.kDanh + 1) / ((d.khung_bao_truoc || 3) + 1));
    const r = Math.round((4 + 8 * k) / PX) * PX, nhip = (E.S.frame >> 2) % 2;
    ctx.globalAlpha = 0.35 + 0.25 * nhip; o(x - r - 3, y - r - 3, (r + 3) * 2, (r + 3) * 2, ch.toi || '#E5A13B');
    ctx.globalAlpha = 0.9; o(x - r, y - r, r * 2, r * 2, ch.mau || '#FFD17A');
    ctx.globalAlpha = 1;
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
      veTuNong(q);
    }
    buocBui();
    for (const b of BUI){ ctx.globalAlpha = Math.min(1, b.t / 20); o(b.x, b.y, 3, 3, '#c9a77a'); }
    ctx.globalAlpha = 1;
    ctx.restore();
  };
})();
