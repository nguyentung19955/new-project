// TURRET MERGE — CƠ CHẾ MỚI ĐỢT 1 (docs/demo-hop-tuong/tuvan/co-che-moi/DE-XUAT.md, người dùng chốt 07/11): phần HIỂN THỊ
//   A. Pháo La Bàn (canon): huy hiệu MŨI TÊN + SỐ ở đáy ô (tấm đếm DEMKN — chung mọi bàn: SOLO, CO-OP cả bàn đồng đội, PVP cả bàn đối thủ,
//      ONLINE, Test range, hướng dẫn); lúc kéo Pháo lên Pháo: tấm của ô đích hiện SỐ SẼ RA (chữ vàng) — không chữ nổi, không vòng mới.
//      Sóng nổ bù (ghép ngược hướng) chạy dọc làn · vệt xuyên của đạn.
//   B. Lửa Thập Tự (lualien): vệt lửa chạy dọc HÀNG / CỘT từ ô ghép tới từng Relay nhận lửa (tờ p2_ember; tờ riêng cm_vetlua khi về).
//   N. Drone Kéo Xa (drone): dây kéo nối ô kéo ↔ ô đích lúc ghép; lúc kéo Drone lên Drone: tấm ô đích hiện số drone sẽ phóng.
//  Logic (luật, sát thương, online) nằm ở skills.js / skills2.js / vangmoi1.js — file này CHỈ vẽ (không Math.random → online lockstep an toàn).
//  Ảnh: chỉ PNG ChatGPT (QUY-TAC-HINH): tờ mới cm_* (tools/thap-cat-cm.py từ docs/demo-hop-tuong/thap-art/raw_cm_*.png, CAN-VE.json);
//  chưa về → mượn ảnh có sẵn (mui_tiep xoay, p2_ember, p3_canon, fx_cham_trang tô màu).
'use strict';

const CM = {
  M: typeof CM_META !== 'undefined' ? CM_META : {}, // [số khung, rộng, cao] của tờ cm_* (cm-meta.js)
  co(ten) { return this.M[ten] ? REN.img(ten) : null; },
  // icon mũi tên cho tấm đếm: ảnh riêng 4 hướng (cm_mui_<h>) hoặc mui_tiep (chỉ sang phải) xoay
  mui(h) { return this.M.cm_mui ? { ic: 'cm_mui_' + h, xoay: 0 } : { ic: 'mui_tiep', xoay: (h - 1) * Math.PI / 2 }; },
  // vẽ khung f của tờ dải `ten` KÉO GIÃN giữa (x0,y0) → (x1,y1), dày h
  dai(ctx, ten, f, x0, y0, x1, y1, h, al) {
    const a = this.co(ten); if (!a || !(a.complete === undefined || a.naturalWidth || a._cv)) return false;
    const m = this.M[ten], n = m[0], fw = (a.naturalWidth || a.width) / n, fh = a.naturalHeight || a.height, i = Math.max(0, Math.min(n - 1, Math.floor(f)));
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return true;
    const g0 = ctx.globalAlpha;
    ctx.save(); ctx.translate((x0 + x1) / 2, (y0 + y1) / 2); ctx.rotate(Math.atan2(y1 - y0, x1 - x0)); ctx.globalAlpha = g0 * al;
    ctx.drawImage(a, i * fw, 0, fw, fh, -L / 2, -h / 2, L, h);
    ctx.restore(); ctx.globalAlpha = g0; return true;
  },
  // chuỗi chấm PNG (fx_cham_trang tô màu) dọc đoạn thẳng — dự phòng khi tờ chưa về
  cham(ctx, R, x0, y0, x1, y1, mau, co, buoc, al) {
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.floor(L / buoc)), im = R.cham1(mau);
    for (let i = 0; i <= n; i++) { const u = i / n; R.anhGiua(ctx, im, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, co, 0, al * (0.45 + 0.55 * u)); }
  },
  ANH: ['mui_tiep', 'p2_ember', 'p3_canon', 'ic_bom'],
};

// ===================================================== A. PHÁO LA BÀN — huy hiệu mũi tên + số =====================================================
if (typeof DEMKN !== 'undefined') Object.assign(DEMKN.DS, {
  canon(T, B) {
    const S = SKILLS.canon, src = typeof KG !== 'undefined' && KG.nguon ? KG.nguon() : null;
    if (src && src !== T && src.id === 'canon' && src.ban === T.ban && KG.dich() === T && hopLeGhep(src, T)) { // đang kéo Pháo lên ô này: số sẽ ra
      const kq = S.ketQua(src, T), m = CM.mui(S.huong(T));
      return { m: [{ ic: m.ic, xoay: m.xoay, s: kq.so + '' }], sang: true, mau: kq.kieu === 'tru' ? '#ff8a5a' : null };
    }
    const m = CM.mui(S.huong(T));
    return { m: [{ ic: m.ic, xoay: m.xoay, s: S.so(T) + '' }], sang: S.so(T) >= 10 };
  },
  drone(T, B) { // chỉ khi đang kéo Drone lên Drone: số drone sẽ phóng (theo quãng kéo)
    const src = typeof KG !== 'undefined' && KG.nguon ? KG.nguon() : null;
    if (!src || src === T || KG.dich() !== T || !hopLeGhep(src, T) || (src.id !== 'drone' && src.id !== 'mimic')) return null;
    return { m: [{ ic: 'ic_bom', s: '×' + SKILLS.drone.so(src.sao, SKILLS.drone.quang(src.o, T.o)) }], sang: true };
  },
});
if (typeof MV !== 'undefined' && MV.TAG) MV.TAG.canon = ['arrow and number (merge power)', 'mũi tên và số (sức ghép)'];

// sóng nổ bù: dải sóng chạy dọc làn từ lõi về cổng (tờ cm_songno; chưa có → tờ nổ p3_canon trượt theo đường)
HU.cmSong = {
  ve(ctx, o, R) {
    const p = G.duong[o.p]; if (!p) return;
    const u = Math.min(1, o.t / o.song), s = p.len * (1 - u), [x, y, g] = viTri(p, s), al = 1 - Math.max(0, u - 0.75) * 4, w = 70 + 6 * Math.min(8, o.n);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (CM.co('cm_songno')) { const [x2, y2] = viTri(p, Math.min(p.len, s + w)); CM.dai(ctx, 'cm_songno', (u * 16) % 16, x2, y2, x, y, w * 0.8, al); }
    else if (REN.img('p3_canon')) REN.khungMuot(ctx, 'p3_canon', 3 + (u * 40) % 9, x, y, w, g, al * 0.9);
    ctx.restore(); ctx.globalAlpha = 1;
  },
};
// vệt xuyên của đạn Pháo La Bàn (tia ngắn từ nòng tới tâm nổ)
HU.cmXuyen = {
  ve(ctx, o, R) {
    const al = 1 - o.t / o.song; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (!CM.dai(ctx, 'cm_songno', 6 + (o.t / o.song) * 8, o.x0, o.y0, o.x1, o.y1, 14, al * 0.8)) CM.cham(ctx, R, o.x0, o.y0, o.x1, o.y1, '#ffb35a', 7, 12, al * 0.7);
    ctx.restore(); ctx.globalAlpha = 1;
  },
};

// ===================================================== B. LỬA THẬP TỰ — vệt lửa dọc hàng / cột =====================================================
if (HU.vm1Tia) HU.vm1Tia.ve = function (ctx, o) {
  const p = Math.min(1, o.t / o.song), hx = o.x0 + (o.x1 - o.x0) * p, hy = o.y0 + (o.y1 - o.y0) * p, g = Math.atan2(o.y1 - o.y0, o.x1 - o.x0);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (!CM.dai(ctx, 'cm_vetlua', 4 + p * 8, o.x0, o.y0, hx, hy, 26, 1 - p * 0.25)) {
    const L = Math.hypot(hx - o.x0, hy - o.y0), n = Math.floor(L / 16);
    for (let i = 0; i <= n; i++) { // vệt: ngọn lửa 16 khung đặt dọc đường, đuôi mờ dần (tờ p2_ember)
      const u = n ? i / n : 1, x = o.x0 + (hx - o.x0) * u, y = o.y0 + (hy - o.y0) * u;
      if (!(typeof P2 !== 'undefined' && P2.k(ctx, 'p2_ember', (o.t * 24 + i * 3) % 16, x, y, 16 + 8 * u, 0.35 + 0.6 * u, g, true))) {
        const im = REN.img('fx_cuuvi_dan'); if (im) PX.ve(ctx, im, x, y, 12 + 8 * u, 12 + 8 * u, g, 0.3 + 0.6 * u);
      }
    }
  }
  ctx.restore(); ctx.globalAlpha = 1;
};

// ===================================================== N. DRONE KÉO XA — dây kéo nối 2 ô =====================================================
HU.dayKeo = {
  ve(ctx, o, R) {
    const u = o.t / o.song, al = u < 0.15 ? u / 0.15 : 1 - Math.max(0, u - 0.6) / 0.4;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (!CM.dai(ctx, 'cm_daykeo', u * 15.99, o.x0, o.y0, o.x1, o.y1, 22, al)) CM.cham(ctx, R, o.x0, o.y0, o.x1, o.y1, '#7fdcff', 9, 11, al * 0.85);
    ctx.restore(); ctx.globalAlpha = 1;
  },
};

// tải sẵn ảnh lúc vào trận khi bộ bài có ụ liên quan
if (typeof batDau === 'function') {
  const bd = batDau;
  batDau = function () {
    const r = bd.apply(this, arguments);
    try {
      if (typeof REN !== 'undefined' && REN.img) {
        const co = new Set(); for (const B of G.ban) for (const id of B.deck || []) co.add(id);
        if (co.has('canon')) { REN.img('mui_tiep'); for (const t of ['cm_songno', 'cm_mui_0', 'cm_mui_1', 'cm_mui_2', 'cm_mui_3']) if (CM.M[t] || CM.M.cm_mui) REN.img(t); }
        if (co.has('lualien') && CM.M.cm_vetlua) REN.img('cm_vetlua');
        if (co.has('drone')) { REN.img('ic_bom'); if (CM.M.cm_daykeo) REN.img('cm_daykeo'); }
      }
    } catch (e) { }
    return r;
  };
}
window.CM = CM;
