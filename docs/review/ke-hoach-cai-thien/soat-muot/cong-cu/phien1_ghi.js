// Phiên 1 "Quái động mượt": ghi lại khung ảnh mà CODE GAME THẬT chọn để vẽ quái, từng lượt tính (60 lượt/giây), không mở trình duyệt.
// Chạy trong vm của game/tests/node_trang.js (gửi qua stdin, xem xem_phien_1.py). Hai hàm:
//   nap(teps)  : nạp tệp .sprite.json vào js/sprite_custom.js, coi như ảnh đã tải xong (ảnh giả, chỉ để nhận ra lệnh vẽ)
//   chay(o)    : dựng một cảnh nhỏ (một con quái + em bé đứng yên), chạy o.giay giây với bộ cờ o.co, mỗi lượt gọi G.art.enemy với bút GHI,
//                trả về [{ b: [mã tệp, hàng, cột, dx, dy, alpha], ov: [[màu phủ, độ đậm]], an, mat }] — đúng khung hàm vẽ của game đã chọn.
// Cảnh dùng hạt ngẫu nhiên cố định; phần vẽ chạy với bộ ngẫu nhiên riêng nên cảnh cờ cũ / cờ mới đi y hệt nhau (luật không đổi).
({
  nap(teps) {
    const SC = G.spriteCustom, out = [];
    for (const tep of teps) {
      if (!SC.ds[tep.ma]) SC.add(tep);
      const sp = SC.ds[tep.ma];
      if (!sp) { out.push(tep.ma + ':lỗi'); continue; }
      sp.img = sp.img || { __ma: tep.ma }; sp.ready = true; out.push(tep.ma);
    }
    return out.join(',');
  },
  chay(o) {
    const SC = G.spriteCustom;
    const CO = ['DON_DU', 'CHOANG_YEN', 'DI_DUNG_EM', 'BAO_DEU', 'XI_HOI', 'BUOC_TOC', 'TRUNG_DU'];
    for (const k of CO) G[k] = !!o.moi;
    G.KHUNG_TRANG_SUA = true; G.TRANG_THAI_TREN_THAN = false;
    G.resetSave(); G.save.sound = false;
    G.rnd = G.srand(o.hat || 3); Math.random = G.srand(9);
    G.noRender = true;
    G.startStage(o.r || 0, 0, 0);
    const S = G.getRun(), w = G.getWorld(), P = w.P;
    if (S) S.mode = 'play';
    const hp0 = G.hurtPlayer, dm0 = G.damage; G.hurtPlayer = () => false; // em bé không chết, không lùi vì trúng đòn (cùng cho hai bản)
    G.damage = () => 0; // em bé tự đánh trúng quái thì bỏ: cảnh chỉ có đòn "trúng" do kịch bản gọi (G.mobOnHit)
    w.ents.length = 0; w.zones.length = 0; w.projs.length = 0; w.spawns = [];
    P.x = (w.x0 + w.x1) / 2; P.y = (w.y0 + w.y1) / 2;
    const e = G.spawnEnemy(o.role, P.x + (o.cach || 60), P.y + (o.lech || 0), { art: o.ma });
    e.cd = o.cd0 != null ? o.cd0 : 0.6;
    const ghi = [], N = Math.round((o.giay || 3) * 60);
    // lớp nhuộm (viền chớp '#fff6e0', phủ trắng '#ffffff', đỏ nhẹ '#ff4a3a'): tấm nhuộm vẽ bằng fillRect màu đó trên canvas giả → đọc lại fillStyle
    const mauCua = (img) => { try { const x = img && img.getContext ? img.getContext('2d') : null; return x && typeof x.fillStyle === 'string' && x.fillStyle !== '#000' ? x.fillStyle : null; } catch (er) { return null; } };
    const spCua = (img) => { for (const ma in SC.ds) if (SC.ds[ma].img === img) return SC.ds[ma]; return null; };
    try {
      for (let k = 0; k < N; k++) {
        const t = k / 60;
        for (const s of o.su || []) {
          if (s.k === 'choang' && Math.abs(t - s.luc) < 1e-6) e.st.stun = s.giay;
          if (s.k === 'trung' && Math.abs(t - s.luc) < 1e-6) { e.flash = 0.12; G.mobOnHit(e, 1, {}); }
          if (s.k === 'cham' && t >= s.tu && t < s.den) { e.st.iceN = s.n; e.st.iceT = 2; } else if (s.k === 'cham' && t >= s.den) { e.st.iceN = 0; e.st.iceT = 0; }
          if (s.k === 'diP' && t >= s.tu && t < s.den) { P.x += s.vx / 60; P.y += (s.vy || 0) / 60; }
          if (s.k === 'khoaCd') e.cd = Math.max(e.cd, 1); // không cho ra đòn (xem đi / đứng)
        }
        P.frozenT = 9; // em bé đứng im, không tự đánh (cùng cho hai bản)
        G.tick(); G.click = null;
        w.ents = w.ents.filter((x) => x === e); w.spawns = [];
        if (e.dead) break;
        if (e.spawnT > 0) continue; // chưa ghi lúc quái mới trồi lên
        // vẽ: bộ ngẫu nhiên riêng, không làm lệch cảnh
        const r0 = G.rnd, m0 = Math.random; G.rnd = G.srand(100 + k); Math.random = G.srand(200 + k);
        const ds = [], st = { globalAlpha: 1 };
        const but = new Proxy(st, {
          get(t2, key) {
            if (key === 'drawImage') return (img, sx, sy, sw, sh, dx, dy) => { ds.push([img, sx, sy, dx, dy, t2.globalAlpha]); };
            if (key === 'getTransform') return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
            if (key === 'canvas') return { width: 844, height: 390 };
            if (key in t2) return t2[key];
            return () => {};
          },
          set(t2, key, v) { t2[key] = v; return true; },
        });
        G.noRender = false;
        try { G.art.enemy(but, e); } finally { G.noRender = true; G.rnd = r0; Math.random = m0; }
        let b = null; const ov = [];
        for (const [img, sx, sy, dx, dy, a] of ds) {
          const sp = spCua(img);
          if (sp && !b) {
            const n = sp.net || 1, hang = Math.round(sy / (sp.fh * n)), cot = Math.round(sx / (sp.fw * n));
            const ten = Object.keys(sp.dt).find((x) => sp.dt[x].hang === hang) || '?';
            b = [sp.ma, ten, cot, dx, dy, Math.round(a * 100) / 100];
          } else { const c = mauCua(img); if (c) ov.push([c, Math.round(a * 100) / 100]); }
        }
        ghi.push({ b, ov, an: e.an ? e.an.n : null, mat: e.face, x: Math.round(e.x * 10) / 10, act: e.act ? (e.act.fired ? 'ra' : 'bao') : '' });
      }
    } finally { G.hurtPlayer = hp0; G.damage = dm0; }
    return ghi;
  },
})
