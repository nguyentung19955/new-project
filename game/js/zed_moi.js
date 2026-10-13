// BỘ ZED MỚI (13/10/2026) — docs/review/ke-hoach-cai-thien/zed-tich-hop/YEU-CAU.md
// Vẽ Zed bằng bộ ảnh mới: thân (game/art/custom/zed-moi.sprite.json, mỗi động tác 1 hàng, khung 48×48 game, net 2, chân [24,45])
// + vũ khí 4 loại × 4 cấp (zed-vk.sprite.json) gắn theo NEO từng khung (điểm cầm + góc; dựng bằng docs/anh-goc/zed/dung-zed-game.py,
// cách ghép = docs/anh-goc/zed/gan-vk/ghep-thu-vk.py đã duyệt): vẽ người → vũ khí xoay quanh điểm cầm (vũ khí SAU người khi neo ghi sau=1)
// → vẽ lại nắm tay (hàng "hang_tay" của tấm) đè lên cán. Quay trái: lật cả người lẫn vũ khí. Hình vũ khí theo cấp G.wStage (Trắng..Thức tỉnh),
// nhuộm nhẹ màu hệ khi vũ khí đang mang hệ.
// Chỉ ĐỌC đồng hồ đòn (atkT, hitAt, castT, specT, dodgeT, hurtT, mv.kind…): nhịp đánh, thời lượng, combo trong moves.js / combat.js giữ nguyên.
// Khung ★ (tư thế chạm) của mỗi đòn rơi đúng lúc u = hitAt (bảng MOC dưới đây). Sửa hai lỗi chọn khung cũ: chưởng chia đúng castT 0,3
// (L3, trước chia 0,4), búa nện ★ ở 0,35 (L1, trước 0,45).
// Phi tiêu (thay cung): ném tay không; viên phi tiêu bay là ảnh vk-phi-tieu cấp hiện tại, xoay khi bay.
// Trang phục (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-rung, zed-bo-bien, zed-bo-lau): tấm thân chọn theo G.zedBo() — 'ninja' = zed-moi,
// 'rung' = zed-rung, 'bien' = zed-bien, 'lau' = zed-lau (cùng chuẩn, neo dùng lại của bộ ninja); thử nhanh: ?zedbo=rung, ?zedbo=bien, ?zedbo=lau.
// Tắt: ?zedmoi=0 (G.ZED_MOI, js/data.js) → hình Zed cũ; ?zed=0 → game như bản trước. Ảnh chưa tải xong → vẽ hình cũ cho tới khi có.
(function () {
  const G = window.G;
  const SC = G.spriteCustom;
  if (!SC) return;
  const bat = () => G.ZED !== false && G.ZED_MOI !== false;
  const laZed = (o) => !!o && (o.key === 'smith' || !o.key);
  const lay = (ma) => {
    const z = SC.zed && SC.zed[ma];
    if (!z) return null;
    if (!z.ready && SC.canAnh) SC.canAnh(ma);
    return z.ready && z.img ? z : null;
  };
  // Tấm thân theo trang phục đang mặc (js/data.js G.zedBo: 'ninja' → zed-moi, 'rung' → zed-rung, 'bien' → zed-bien, 'lau' → zed-lau).
  // Tấm bộ khác chưa tải xong (zed-rung, zed-bien, zed-lau là ảnh tải sau) thì vẽ tạm bằng bộ ninja. Vũ khí (zed-vk), nhịp, neo, cách ghép y như nhau ở mọi bộ.
  const layThan = () => {
    let ma = 'zed-moi';
    try { const b = G.zedBo ? G.zedBo() : 'ninja'; if (G.ZED_BO && G.ZED_BO[b]) ma = G.ZED_BO[b].tam; } catch (e) { ma = 'zed-moi'; }
    return (ma !== 'zed-moi' && lay(ma)) || lay('zed-moi');
  };
  const kep = (v, a, b) => (v < a ? a : v > b ? b : v);
  const VK_LOAI = { sword: 'kiem', spear: 'thuong', hammer: 'bua', bow: 'phitieu' };
  // Mốc tiến độ u bắt đầu từng khung. ★ = khung đứng ở mốc hitAt (đánh dấu trong chú thích).
  const MOC = {
    kiem_1: [0, 0.22, 0.45, 0.65, 0.82], // ★ khung 3 ở 0,45 (0,30 s)
    kiem_2: [0, 0.22, 0.45, 0.65, 0.82], // ★ khung 3 ở 0,45 (0,30 s)
    kiem_3: [0, 0.2, 0.45, 0.6, 0.75, 0.88], // ★ khung 3 ở 0,45 (0,46 s)
    thuong_1: [0, 0.22, 0.45, 0.55, 0.7, 0.85], // ★ khung 3 ở 0,45
    thuong_2: [0, 0.22, 0.45, 0.55, 0.7, 0.85],
    thuong_3: [0, 0.22, 0.45, 0.55, 0.7, 0.85],
    thuong_quet: [0, 0.22, 0.45, 0.55, 0.7, 0.85], // ★ khung 3 ở 0,45 (0,52 s)
    bua_nen: [0, 0.15, 0.35, 0.5, 0.62, 0.74, 0.85, 0.93], // ★ khung 3 ở 0,35 = hitAt búa (sửa L1)
    bua_nen_dat: [0, 0.2, 0.45, 0.6, 0.75, 0.88], // vào từ u 0,36 (khung 2 giáng xuống), ★ khung 3 ở 0,45
    phitieu: [0, 0.22, 0.45, 0.6, 0.75, 0.88], // ★ khung 3 ở 0,45 (đạn sinh lúc chạm), 0,38 / 0,45 s như cung
    phitieu_chum: [0, 0.45, 0.6, 0.72, 0.84, 0.94], // thả: vào từ u 0,45, phi tiêu bay ngay → khung ném (2) hiện ngay lúc thả
    chuong: [0, 0.12, 0.25, 0.4, 0.6, 0.8], // castT 0,3 (sửa L3), đạn sinh ngay khi bấm
    db_kiem: [0, 0.12, 0.25, 0.4, 0.6, 0.8], // specT 0,35, hiệu ứng sinh ngay khi bấm
    db_thuong: [0, 0.12, 0.25, 0.4, 0.6, 0.8],
    db_bua: [0, 0.12, 0.25, 0.4, 0.6, 0.8],
    db_phitieu: [0, 0.12, 0.25, 0.4, 0.6, 0.8],
    dam: [0, 0.22, 0.45, 0.65, 0.82], // ★ khung 3 ở 0,45 (0,30 s)
  };
  const DB = { sword: 'db_kiem', spear: 'db_thuong', hammer: 'db_bua', bow: 'db_phitieu' };
  const GIU = { spear: 'thuong_giu', hammer: 'bua_giu', bow: 'phitieu_ngam' };
  const DI_BO = 0.6; // đi chậm hơn 60% tốc độ chạy đầy (đẩy cần nhẹ, bị làm chậm) → hàng ĐI BỘ

  function khungMot(D, ten, u) {
    const a = D.dong_tac[ten], m = MOC[ten];
    u = kep(u || 0, 0, 1);
    if (m && m.length === a.so) { let i = 0; while (i < a.so - 1 && u + 1e-6 >= m[i + 1]) i++; return i; }
    return Math.min(a.so - 1, Math.floor(u * a.so));
  }
  function khungLap(D, ten, t) { const a = D.dong_tac[ten]; return Math.floor(Math.max(0, t) / (a.giay || 1) * a.so) % a.so; }

  // Chọn động tác + khung (cùng thứ tự ưu tiên như SC.chonEmBe ở js/sprite_custom.js). Trả { ten, i, theo? }: theo = động tác đánh mà
  // vũ khí đi theo khi thân đang ở hàng chạy (chạy mà đánh, G.CHAY_DANH).
  function chon(o, D) {
    const p = o.p, t = (o.t != null ? o.t : G.time) || 0, tc = o.tc != null && isFinite(o.tc) ? o.tc : t;
    const mv = p && p.mv, wt = o.weapon && o.weapon.type;
    let goc = wt; // loại vũ khí thật (giáo đang bay thì o.weapon là 'fist' nhưng chiêu đặc biệt vẫn là của giáo)
    try { if (p && G.curW) { const w = G.curW(p); if (w && w.type) goc = w.type; } } catch (e) { goc = wt; }
    const mot = (ten, u) => ({ ten, i: khungMot(D, ten, u) });
    const lap = (ten, tt) => ({ ten, i: khungLap(D, ten, tt) });
    if (p && p.dead) return mot('chet', (p.deadT || 0) / 0.6);
    if (o.dodge >= 0) return mot('lon', o.dodge);
    if (p && p.dashT > 0) {
      if (mv && mv.kind === 'xoc') return mot('thuong_xoc', mv.dashDur > 0 ? 1 - p.dashT / mv.dashDur : 0.5);
      return lap('chay', t * 2); // Nhát lướt kiếm sau lộn: như cũ, hàng chạy nhanh gấp đôi
    }
    if (p && p.specT > 0 && DB[goc]) return mot(DB[goc], 1 - p.specT / 0.35);
    if (p && p.castT > 0) return mot('chuong', 1 - p.castT / 0.3);
    if (mv && mv.holding && !(o.atk >= 0)) { const k = GIU[wt]; return k ? lap(k, t) : lap('dung', t); }
    if (o.atk >= 0) {
      const ci = p ? p.comboI | 0 : Math.floor(t / 1.6), u = o.atk;
      let r = null;
      if (!wt || wt === 'fist') r = mot('dam', u);
      else if (wt === 'sword') r = mot('kiem_' + (((ci % 3) + 3) % 3 + 1), u);
      else if (wt === 'spear') r = (mv && mv.kind === 'quet') || ci === 3 ? mot('thuong_quet', u) : mot('thuong_' + (kep(ci, 0, 2) + 1), u);
      else if (wt === 'hammer') r = mot(mv && mv.kind === 'nenDat' ? 'bua_nen_dat' : 'bua_nen', u);
      else if (wt === 'bow') r = mot(mv && mv.kind === 'banManh' ? 'phitieu_chum' : 'phitieu', u);
      if (r) {
        const cd = G.CHAY_DANH; // chạy mà đánh: thân giữ hàng chạy (chân bước), chỉ vũ khí vung theo neo của khung đòn đánh
        if (o.move && (cd === 'than' || (cd === 'lai' && !(u >= 0.2 && u < 0.65)))) return { ten: 'chay', i: khungLap(D, 'chay', tc), theo: r };
        return r;
      }
    }
    if ((p && p.hurtT > 0) || (!p && o.flash)) return mot('trung', p ? 1 - p.hurtT / 0.2 : 0.3);
    if (o.move) return lap(p && p.diTL != null && p.diTL < DI_BO ? 'di' : 'chay', tc);
    return lap('dung', t);
  }

  // Cấp hình vũ khí (0 Trắng .. 3 Thức tỉnh = G.STAGE_NAMES) và hệ đang mang.
  function capVk(w) { let c = 0; try { c = G.wStage ? G.wStage(w) : w.stage || 0; } catch (e) { c = 0; } return kep(c | 0, 0, 3); }
  function heVk(w) {
    if (!w) return null;
    if (w.coat && G.EL && G.EL[w.coat]) return w.coat;
    return w.branch && capVk(w) > 0 && G.EL && G.EL[w.branch] ? w.branch : null;
  }
  // Ảnh một vũ khí (loại, cấp) — nhuộm nhẹ theo hệ (nhớ lại, mỗi tổ hợp vẽ một lần). Trả { img, x, y, w, h }.
  const NHUOM = new Map();
  function anhVk(V, loai, cap, he) {
    const r = V.tep.vk[loai][cap];
    if (!he || typeof document === 'undefined') return { img: V.img, x: r[0], y: r[1], w: r[2], h: r[3] };
    const k = loai + cap + he;
    let cv = NHUOM.get(k);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = r[2]; cv.height = r[3];
      const q = cv.getContext('2d'); q.imageSmoothingEnabled = false;
      q.drawImage(V.img, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
      q.globalCompositeOperation = 'source-atop'; q.globalAlpha = 0.3; q.fillStyle = G.EL[he].col; q.fillRect(0, 0, r[2], r[3]);
      NHUOM.set(k, cv);
    }
    return { img: cv, x: 0, y: 0, w: r[2], h: r[3] };
  }
  // Vũ khí đặt ở khung này: { da (động tác của neo), n (neo), cap, loai } hoặc null.
  function vkCua(o, D, s) {
    const w = o.weapon;
    if (!w || !w.type) return null;
    const wa = s.theo || s, da = D.dong_tac[wa.ten];
    if (!da || !da.vk || !da.neo) return null;
    const n = da.neo[wa.i];
    if (!n) return null; // khung null: không vũ khí (Phi Thương khung 3–6: giáo đã ném đi)
    if (w.type === 'fist' && !/^db_/.test(wa.ten)) return null; // tay không (giáo đang bay)
    if (w.type !== 'fist' && VK_LOAI[w.type] !== da.vk) return null;
    return { da, n, wa, cap: capVk(w), he: heVk(w) };
  }
  function veVk(c, V, v) {
    const da = v.da, n = v.n, a = anhVk(V, da.vk, v.cap, v.he), g = da.vk_cam[v.cap], F = da.vk_tl;
    c.save();
    c.translate(n[0] / 2 - 24, n[1] / 2 - 45); // he_neo "nguon-96": chia 2 ra điểm ảnh game, trừ goc (24,45) → tính từ chân
    c.rotate((n[2] * Math.PI) / 180); // góc độ: 0 mũi chỉ sang phải, dương chúc xuống
    c.scale(F, F);
    c.drawImage(a.img, a.x, a.y, a.w, a.h, -g[0], -g[1], a.w, a.h);
    c.restore();
  }

  let tam = null; // canvas phụ khi phải nhuộm cả hình (trúng đòn, băng, độc)
  function ve(c, o) {
    const T = layThan();
    if (!T) return false;
    const D = T.tep, s = chon(o, D), a = D.dong_tac[s.ten];
    if (!a) return false;
    const V = lay('zed-vk'), v = V ? vkCua(o, D, s) : null;
    const lop = (q) => {
      if (v && v.n[3]) veVk(q, V, v);
      q.drawImage(T.img, s.i * 96, a.hang * 96, 96, 96, -24, -45, 48, 48);
      if (v && !v.n[3]) veVk(q, V, v);
      if (v && !s.theo && v.da.hang_tay != null) q.drawImage(T.img, v.wa.i * 96, v.da.hang_tay * 96, 96, 96, -24, -45, 48, 48); // nắm tay đè lên cán
    };
    const x = Math.round(o.x), y = Math.round(o.y), f = o.face < 0 ? -1 : 1, t = (o.t != null ? o.t : G.time) || 0;
    const p = o.p, chet = !!(p && p.dead);
    c.save();
    if (o.alpha != null) c.globalAlpha = c.globalAlpha * o.alpha;
    c.imageSmoothingEnabled = false;
    if (!o.noShadow) {
      const sw = chet ? 12 : 8, sx = chet ? x - f * 6 : x;
      if (o.roundShadow && G.art && G.art.ellipse) G.art.ellipse(c, sx, y, sw + 1, Math.max(2, Math.round((sw + 1) * 0.45)), 'rgba(0,0,0,0.3)');
      else { c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(sx - sw + 2, y - 1, sw * 2 - 4, 1); c.fillRect(sx - sw, y, sw * 2, 1); c.fillRect(sx - sw + 2, y + 1, sw * 2 - 4, 1); }
    }
    c.translate(x + (f < 0 ? 1 : 0), y);
    c.scale(f, 1);
    const tint = SC.emBeTint ? SC.emBeTint(o) : null;
    if (tint && typeof document !== 'undefined') {
      // vùng 160×160 điểm ảnh game quanh chân (vũ khí dài vẫn lọt), nét ×2
      tam = tam || document.createElement('canvas');
      if (tam.width !== 320) { tam.width = 320; tam.height = 320; }
      const q = tam.getContext('2d');
      q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1; q.clearRect(0, 0, 320, 320);
      q.imageSmoothingEnabled = false; q.setTransform(2, 0, 0, 2, 160, 220);
      lop(q);
      q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-atop'; q.globalAlpha = tint[1]; q.fillStyle = tint[0]; q.fillRect(0, 0, 320, 320);
      q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1;
      c.drawImage(tam, -80, -110, 160, 160);
    } else lop(c);
    if (o.gong) { // hào quang lúc Gồng (như js/hero_tinhlinh.js)
      for (let i = 0; i < 6; i++) {
        const ph = (t * 1.6 + i * 0.37) % 1, sx = Math.round(-10 + i * 4) + (i % 2), sy = Math.round(-4 - ph * 30);
        c.fillStyle = i % 2 ? '#fff3b0' : '#ffd27a';
        c.globalAlpha = (o.alpha != null ? o.alpha : 1) * (1 - ph) * 0.9;
        c.fillRect(sx, sy, 1, 4 + (i % 3));
      }
    }
    c.restore();
    return true;
  }

  // Mũi vũ khí cho vệt chém (js/fx.js đọc G.tinhLinh.tip): giữ nhịp / cửa sổ vệt của bản cũ, chỉ dời điểm cầm, hướng, độ dài theo neo mới.
  function doiTip(q, o) {
    const T = layThan(), V = lay('zed-vk');
    if (!T || !V) return;
    const D = T.tep, s = chon(o, D), v = vkCua(o, D, s);
    if (!v) return;
    const f = o.face < 0 ? -1 : 1, X0 = Math.round(o.x) + (f < 0 ? 1 : 0), Y0 = Math.round(o.y), r = (v.n[2] * Math.PI) / 180;
    const R = V.tep.vk[v.da.vk][v.cap], g = v.da.vk_cam[v.cap];
    q.gx = X0 + f * (v.n[0] / 2 - 24); q.gy = Y0 + (v.n[1] / 2 - 45);
    q.dx = f * Math.cos(r); q.dy = Math.sin(r);
    q.L = Math.max(4, (R[2] - g[0]) * v.da.vk_tl);
    q.front = !v.n[3];
  }

  // Phi tiêu bay (đạn 'arrow' của người chơi): ảnh vk-phi-tieu theo cấp vũ khí đã ném, xoay khi bay.
  function vePhiTieu(c, o) {
    const V = lay('zed-vk');
    if (!V || !V.tep.vk.phitieu) return false;
    const cap = o.w ? capVk(o.w) : 0, a = anhVk(V, 'phitieu', cap, o.he && o.he.el && G.EL && G.EL[o.he.el] ? o.he.el : null), r0 = V.tep.vk.phitieu[0];
    const F = (o.big ? 11 : 8) / Math.max(r0[2], r0[3]); // cấp 1 rộng 8 điểm ảnh (ném chùm 11), cấp cao to dần theo ảnh
    const x = Math.round(o.x), y = Math.round(o.y - (o.z || 10));
    c.save();
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x - 3, Math.round(o.y), 6, 1);
    c.imageSmoothingEnabled = false;
    c.translate(x, y); c.rotate(((G.time || 0) * 18 + (o.x + o.y) * 0.05) % (Math.PI * 2)); c.scale(F, F);
    c.drawImage(a.img, a.x, a.y, a.w, a.h, -a.w / 2, -a.h / 2, a.w, a.h);
    c.restore();
    return true;
  }

  // ---------- bọc G.art.hero, G.art.proj, G.tinhLinh.tip (ngoài cùng; lớp khác có thể bọc lại sau khi ảnh nạp nên kiểm mỗi khung) ----------
  G.zedMoi = { chon, MOC, loi: [] };
  let dangGoiCu = false;
  const ghiLoi = (e) => { if (G.zedMoi.loi.length < 5) G.zedMoi.loi.push(String((e && e.message) || e)); };
  function boc() {
    const A = G.art;
    if (A && typeof A.hero === 'function' && !A.hero._zedMoi) {
      const cu = A.hero;
      const moi = function (c, o) {
        if (!dangGoiCu && laZed(o) && bat()) { try { if (ve(c, o)) return; } catch (e) { ghiLoi(e); } }
        const truoc = dangGoiCu; dangGoiCu = true;
        try { return cu.call(this, c, o); } finally { dangGoiCu = truoc; }
      };
      moi._zedMoi = true; if (cu._ghepLop) moi._ghepLop = true; // js/ghep_lop.js cũng bọc lại mỗi khung: giữ dấu của nó để hai bên không bọc chồng mãi
      A.hero = moi;
    }
    if (A && typeof A.proj === 'function' && !A.proj._zedMoi) {
      const cu = A.proj;
      const moi = function (c, o) {
        if (o && o.team === 'player' && o.kind === 'arrow' && !G.noRender && bat()) { try { if (vePhiTieu(c, o)) return; } catch (e) { ghiLoi(e); } }
        return cu.apply(this, arguments);
      };
      moi._zedMoi = true; A.proj = moi;
    }
    const TL = G.tinhLinh;
    if (TL && typeof TL.tip === 'function' && !TL.tip._zedMoi) {
      const cu = TL.tip;
      const moi = function (o) {
        const q = cu.apply(this, arguments);
        if (q && laZed(o) && bat()) { try { doiTip(q, o); } catch (e) { ghiLoi(e); } }
        return q;
      };
      moi._zedMoi = true; TL.tip = moi;
    }
  }
  function giu() { try { boc(); } catch (e) { /* bỏ qua */ } if (typeof requestAnimationFrame === 'function') requestAnimationFrame(giu); }
  giu();
})();
