// BẢN THỬ 5 PHÚT ĐẦU — TALESWORN (phiên A, 05/11/2026; docs/tu-van-toan-cau/chatgpt-05-11/tu-van-chatgpt.txt mục 3.2, 3.5, roadmap 01).
// Ải 1-1 lần đầu (người mới, chưa qua ải 1) thành chuỗi 4 phòng Thornwood:
//   0 Bắt đầu   0:20–1:00  3 quái nhỏ, dạy đi + đánh
//   1 Tinh anh  1:00–1:45  một con Heo Nanh báo đòn rõ (vạch đỏ, húc thẳng): dạy Né rồi chém trả
//   2 Đánh quái 1:45–2:30  FIRE INK: trang sách đỏ bay tới, chạm vào → kiếm thành kiếm Lửa cấp Mầm (ảnh kiếm vuông hệ Lửa có sẵn)
//                          TẠM THỜI tới hết ải (bản sao vũ khí trong trận, bản lưu không đổi: Luyện Lv1–15 giữ nguyên, mốc Lv3 vẫn như cũ)
//   3 Trùm      2:30–3:50  TOADSTOOL KING (hình Nấm Chúa) THÍCH NGHI: 4 đòn Lửa → dựng FIRE GUARD 7 giây (giảm 30% sát thương Lửa,
//                          không miễn), hiện vòng phép Lửa dưới chân + biểu tượng hệ Lửa trên đầu + thẻ "Kháng Lửa / Yếu Băng" ở thanh máu.
//                          THƯƠNG BĂNG (cấp Mầm, chỉ trong ải này) nằm ngay trên đường từ cửa tới trùm: đi qua là nhặt.
//                          3 đòn Băng khi đang Guard → vỡ Guard, trùm choáng 2,5 giây (lộ điểm yếu). Chỉ dùng Lửa + né vẫn thắng được.
//              3:50–5:00  hạ trùm: kiếm lớn lên (ảnh Thành hình hệ Lửa tới hết ải) + "Kiếm nhớ N đòn Lửa", nhận PAGE SCRAP (save.trangSach),
//                          về làng: dòng báo Forge (lò rèn) đã mở.
// Nút ĐỔI (SWAP) to, một nút, hiện khi đã có 2 vũ khí (ảnh nút vuông gd-nut-vuong + ảnh vũ khí kế tiếp), phím Q / Tab.
// Màn chào: người mới chạm "Chơi" là vào thẳng ải 1-1 (không bắt đăng nhập, không chiếu truyện mở đầu trước trận); mời đăng nhập Google
// vẫn như cũ sau khi qua ải 1 (js/village.js inviteWant).
// Cờ quay lui: ?slice=0 (G.SLICE_BAT = false) → ải 1-1 và màn chào y như trước. Bản lưu cũ đã qua 1-1 không bao giờ vào bản thử.
// ẢNH THẬT (phiên D, 05/11 — docs/review/ke-hoach-cai-thien/talesworn-d-gan-anh/bao-cao.md): trang Mực Lửa hu-trang-muc-lua, khiên
// hu-fire-guard (1–4 lặp, 5–6 vỡ), biểu tượng gd-bt-fire-guard, Page Scrap gd-page-scrap (vật rơi + màn kết quả), mặt nút gd-nut-doi,
// Thương Băng nằm đất hu-thuong-bang-dat (cắt bằng docs/anh-goc/talesworn-d/cat-anh-slice.py). Ảnh chưa về thì vẽ ảnh mượn như cũ.
// Cờ ?slicecu=1 (G.SLICE_ANH_CU): luôn dùng ảnh mượn cũ (phiên A).
// Chữ: js/slice_chu.js (G.SLICE_CHU, dịch qua G.ngonNgu). Móc trong js/stage.js: dòng có chữ "G.slice".
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.startStage) return;
  const coUrl = (re) => { try { return typeof location !== 'undefined' && re.test(location.search || ''); } catch (e) { return false; } };
  if (G.SLICE_BAT === undefined) G.SLICE_BAT = !coUrl(/[?&]slice=0(&|$)/);
  if (G.SLICE_ANH_CU === undefined) G.SLICE_ANH_CU = coUrl(/[?&]slicecu=1(&|$)/);
  const C = G.SLICE_CHU || {};
  const SL = (G.slice = {});
  // Số liệu (chỉnh ở đây)
  const SO = {
    nguong: 4,    // số đòn Lửa (không tính cháy âm ỉ) để trùm dựng Fire Guard
    nguong2: 5,   // các lần sau
    guardT: 7,    // giây Guard đứng
    guardPct: 0.3, // giảm 30% sát thương Lửa
    bangVo: 3,    // số đòn Băng phá Guard
    bangTru: 1.5, // mỗi đòn Băng bớt thời gian Guard
    choang: 2.5,  // trùm choáng khi vỡ Guard
    nghi: 3,      // giây nghỉ trước khi học lại
    trangToc: 70, // tốc độ trang mực bay
  };
  SL.SO = SO;
  SL.bat = () => G.SLICE_BAT !== false;
  const obj = (v) => !!(v && typeof v === 'object' && !Array.isArray(v));
  // Người mới: chưa xong ải hướng dẫn, chưa có sao ải 1-1
  SL.moi = (sv) => { sv = sv || G.save; return !!sv && !(obj(sv.tut) && sv.tut.done) && !(obj(sv.stars) && sv.stars['0-0'] > 0); };
  const tv = (s) => (G.tv ? G.tv(s) : s);

  // ---------- bản đồ cố định: 4 phòng một hàng ----------
  SL.map = function (seed) {
    const R = (id, type, doors) => ({ id, x: id, y: 0, type, main: true, doors });
    return {
      kind: 'S', seed: seed || 1610, start: 0, fountain: -1, boss: 3, gate: null, w: 4, h: 1,
      rooms: [R(0, 'start', { right: 1 }), R(1, 'elite', { left: 0, right: 2 }), R(2, 'fight', { left: 1, right: 3 }), R(3, 'boss', { left: 2 })],
    };
  };

  // ---------- vũ khí tạm trong trận ----------
  // Bản sao nông của vũ khí trong bản lưu, mang hệ el ở cấp hình thái st (1 Mầm, 2 Thành hình). Bản lưu không bị đụng tới.
  function sao(w, el, st) {
    const c = Object.assign({}, w);
    c.marks = { fire: 0, poison: 0, ice: 0 };
    c.branch = el;
    c.marks[el] = G.MARKS[Math.max(0, Math.min(2, (st || 1) - 1))];
    c.sliceTam = 1;
    return c;
  }
  function datLai(P) { P.atkT = 0; P.hitDone = true; P.cdT = Math.min(P.cdT || 0, 0.1); if (P.mv) P.mv.cur = null; P.comboI = -1; P.firstHit = true; }

  // Gọi từ G.startStage (js/stage.js) khi ải hướng dẫn chạy bản thử
  SL.batDau = function (S) {
    const P = S.P, ws = P.weapons || [];
    const kiem = ws.find((w) => w && w.type === 'sword') || ws[0];
    const thuong = ws.find((w) => w && w.type === 'spear') || ws.find((w) => w && w !== kiem) || kiem;
    S.slice = { lua: false, bang: false, xong: false, trang: null, nhat: null, guard: null, dem: 0, lan: 0, nghi: 0, fireN: 0, goc: { kiem, thuong }, t0: G.time || 0 };
    if (kiem) { P.weapons = [kiem]; P.cur = 0; }
  };
  function sl() { const S = G.getRun && G.getRun(); return S && S.slice ? S : null; }

  // ---------- dựng phòng (js/stage.js buildRoom gọi sau phần dựng sẵn) ----------
  SL.dungPhong = function (S, W, id) {
    W.props = W.props.filter((p) => !p.env); // bỏ chậu than / nấm / tinh thể ngẫu nhiên: phòng gọn cho người mới
    if (id === 0) W.waves = [['rusher'], ['rusher', 'rusher']];
    else if (id === 1) W.waves = [['elite']];
    else if (id === 2) W.waves = [['swarm', 'swarm'], ['rusher', 'swarm']];
    else if (id === 3 && W.boss) {
      W.boss.name = C.trum || 'Toadstool King';
      W.banner = { s: C.trumRa || 'Toadstool King xuất hiện ở Thornwood!', col: '#ff6a5a', t: 3.5 };
    }
  };
  // Vào phòng (sau js/stage.js enterRoom): lời chỉ dẫn + sự kiện của phòng
  SL.vaoPhong = function (S, W, id, first) {
    const L = S.slice;
    if (id === 0) S.hint = C.hStart;
    else if (id === 1) S.hint = C.hNe;
    else if (id === 2) {
      if (!L.lua && first) { // trang mực bay vào từ mép phải trên
        L.trang = { x: (W.px1 != null ? W.px1 : W.x1) - 6, y: W.y0 + 6, t: 0 };
        W.waveT = 99;
      }
      S.hint = L.lua ? C.hLua : C.hTrang;
    } else if (id === 3) {
      S.hint = L.bang ? C.hSwap : C.hTrum;
      if (!L.bang && first) {
        const P = S.P, bx = W.boss ? W.boss.x : P.x + 140;
        L.nhat = { x: G.clamp(P.x + Math.max(48, (bx - P.x) * 0.38), W.x0 + 20, W.x1 - 20), y: G.clamp(P.y, W.y0 + 14, W.y1 - 8), t: 0 };
      }
    }
  };

  function capLua(S) {
    const L = S.slice, P = S.P, W = S.W;
    if (L.lua) return;
    L.lua = true; L.trang = null;
    const k = L.goc.kiem;
    if (k) {
      const i = Math.max(0, P.weapons.findIndex((w) => w && (w === k || w.id === k.id)));
      P.weapons[i] = sao(k, 'fire', 1);
      if (P.cur === i) datLai(P);
    }
    if (G.sfx) G.sfx('evolve');
    if (G.fx && G.fx.evolve) { try { G.fx.evolve('fire', 1); } catch (e) { /* chỉ là hình */ } }
    if (W) { W.banner = { s: C.bLua, col: G.EL.fire.col, t: 3.5 }; if (W.room === 2 && !W.cleared) W.waveT = Math.min(W.waveT, 1.4); }
    if (S.idx === 2) S.hint = C.hLua;
  }
  function capBang(S) {
    const L = S.slice, P = S.P, W = S.W;
    if (L.bang) return;
    L.bang = true; L.nhat = null;
    const t = L.goc.thuong;
    if (t && P.weapons.length < 2) P.weapons.push(sao(t, 'ice', 1));
    if (G.sfx) G.sfx('pick', 1.2);
    if (G.fx && G.fx.anh) G.fx.anh('hu-no-nho-ice', P.x, P.y - 10, {});
    if (W) W.banner = { s: C.bBang, col: G.EL.ice.col, t: 3 };
    S.hint = C.hSwap;
  }

  // ---------- Fire Guard ----------
  function dungGuard(S, b) {
    const L = S.slice, W = S.W;
    const lop = { type: 'resist', el: 'fire', pct: SO.guardPct, slice: 1 };
    L.guard = { t: SO.guardT, ice: 0, lop, weak: b.weak.slice(), t0: G.time || 0 };
    b.layers = (b.layers || []).concat([lop]);
    if (!b.weak.includes('ice')) b.weak = b.weak.concat(['ice']);
    b.flash = 0.25; b.busy = Math.max(b.busy || 0, 0.45);
    L.lan++; L.dem = 0;
    if (G.sfx) G.sfx('gong', 1.3);
    if (G.fx && G.fx.anh) G.fx.anh('hu-trum-no-fire', b.x, b.y - (b.h || 50) * 0.4, { sc: 0.6 });
    if (W) W.banner = { s: C.bGuard, col: G.EL.fire.col, t: 3 };
  }
  function boGuard(S, b, vo) {
    const L = S.slice, g = L.guard, W = S.W;
    if (!g) return;
    L.guard = null; L.dem = 0; L.nghi = SO.nghi;
    if (b) {
      b.layers = (b.layers || []).filter((l) => l !== g.lop);
      b.weak = g.weak;
      if (vo && !b.dead) {
        b.exposed = Math.max(b.exposed || 0, SO.choang); b.tired = Math.max(b.tired || 0, SO.choang); b.busy = Math.max(b.busy || 0, SO.choang);
        if (b.st) b.st.stun = Math.max(b.st.stun || 0, SO.choang);
        if (anhMoi('hu-fire-guard')) L.vo = { t0: G.time || 0, x: b.x, y: b.y }; // khung 5–6 của khiên: vỡ thành mảnh băng
        else if (G.fx && G.fx.anh) G.fx.anh('hu-bang-vo', b.x, b.y - (b.h || 50) * 0.4, {});
        if (G.sfx) G.sfx('boom', 1.4);
      }
    }
    if (W && !(b && b.dead)) W.banner = { s: vo ? C.bVo : C.bTan, col: vo ? G.EL.ice.col : '#d9cdb8', t: vo ? 2.5 : 1.8 };
  }
  // Mọi đòn vào trùm đi qua đây (bọc G.damage): đếm đòn Lửa, đòn Băng phá Guard. Phần giảm sát thương do lớp 'resist' của G.damage tự làm.
  const gocDamage = G.damage;
  if (typeof gocDamage === 'function' && !gocDamage.sliceBoc) {
    G.damage = function (t, amt, o) {
      try {
        const S = t && t.isBoss ? sl() : null;
        if (S && S.W && t === S.W.boss && amt > 0 && !t.dead && !t.hidden && !(t.invuln > 0) && o && o.fromPlayer !== false && !o.ch && o.src !== 'dot') {
          const L = S.slice;
          if (o.el === 'fire') {
            L.fireN++;
            if (!L.guard && !(L.nghi > 0)) { L.dem++; if (L.dem >= (L.lan ? SO.nguong2 : SO.nguong)) dungGuard(S, t); }
          } else if (o.el === 'ice' && L.guard) {
            L.guard.ice++; L.guard.t -= SO.bangTru;
            if (G.fx && G.fx.anh) G.fx.anh('hu-no-nho-ice', t.x, t.y - (t.h || 50) * 0.5, {});
            if (L.guard.ice >= SO.bangVo) boGuard(S, t, true);
          }
        }
      } catch (e) { /* đếm hỏng không được làm hỏng đòn đánh */ }
      return gocDamage.apply(this, arguments);
    };
    G.damage.sliceBoc = true;
  }

  // ---------- mỗi khung (js/stage.js gọi sau G.updateWorld) ----------
  SL.tick = function (S, dt) {
    const L = S.slice, P = S.P, W = S.W;
    if (!L || !W || !P) return;
    if (!(P.cur >= 0 && P.cur < P.weapons.length)) P.cur = 0; // lượt chơi khôi phục (js/luu_luot.js) có thể mang số món cũ
    // chơi tiếp lượt dở (khôi phục): đã qua phòng Fire Ink thì có kiếm Lửa luôn
    if (!L.lua && (S.cleared[2] || S.idx === 3)) capLua(S);
    // phòng dạy Né: tinh anh luôn là Heo Nanh (húc thẳng theo vạch đỏ — báo đòn rõ nhất ở Thornwood)
    if (W.room === 1 && W.spawns) for (const s of W.spawns) if (s.role === 'elite' && !s.opt) s.opt = { art: 'heoNanh' };
    // trang mực bay tới em bé (lượn nhẹ), chạm là nhận
    const T = L.trang;
    if (T && !L.lua) {
      T.t += dt;
      const dx = P.x - T.x, dy = P.y - 10 - T.y, d = Math.hypot(dx, dy);
      if (T.t > 0.8) { const v = SO.trangToc * Math.min(1, (T.t - 0.8) / 0.6) * dt; if (d > 0.5) { T.x += (dx / d) * Math.min(v, d); T.y += (dy / d) * Math.min(v, d); } }
      T.y += Math.sin(T.t * 3.1) * 12 * dt;
      if (d < 12 || T.t > 9) capLua(S);
    }
    // Thương Băng trên sàn phòng trùm
    const N = L.nhat;
    if (N && !L.bang) { N.t += dt; if (Math.hypot(P.x - N.x, (P.y - N.y) * 1.3) < 15) capBang(S); }
    if (L.manh) { L.manh.t += dt; if (L.manh.t > 2.4) L.manh = null; }
    // Fire Guard đếm giờ
    const b = W.boss;
    if (b) { L.bx = b.x; L.by = b.y; } // chỗ trùm (để mảnh trang rơi đúng chỗ kể cả khi trùm đã bị gỡ)
    if (L.nghi > 0) L.nghi -= dt;
    if (L.guard) { L.guard.t -= dt; if (L.guard.t <= 0 || !b || b.dead) boGuard(S, b, false); }
    // hạ trùm: kiếm lớn lên + Page Scrap (một lần)
    if (W.type === 'boss' && S.loot && S.loot.bossDown && !L.xong) {
      L.xong = true;
      if (L.guard) boGuard(S, b, false);
      const i = P.weapons.findIndex((w) => w && w.type === 'sword' && w.sliceTam);
      if (i >= 0) { P.weapons[i] = sao(L.goc.kiem, 'fire', 2); P.cur = i; datLai(P); P.swapAt = G.time; } // cầm lại kiếm cho thấy kiếm vừa lớn
      if (G.fx && G.fx.evolve) { try { G.fx.evolve('fire', 2); } catch (e) { /* bỏ qua */ } }
      if (G.sfx) G.sfx('evolve', 1.2);
      W.banner = { s: G.t(C.bLon, Math.max(1, L.fireN)), col: G.EL.fire.col, t: 4.5 };
      const sv = G.save;
      if (sv) {
        const dau = !(sv.trangSach > 0);
        sv.trangSach = Math.max(0, Math.floor(+sv.trangSach || 0)) + 1;
        if (S.got) S.got.push(G.t(C.trang, 1));
        const bx = b ? b.x : L.bx, by = b ? b.y : L.by;
        if (bx != null) L.manh = { x: bx, y: by - 8, t: 0 }; // chỉ là hình: mảnh trang rơi ra rồi bay vào em bé (phần thưởng đã cộng ở trên)
        if (dau) SL.choLang = true;
      }
    }
  };

  // ---------- điều khiển: nút ĐỔI ----------
  const coMD = (f) => !G.moDan || G.moDan.co(f);
  function nutDoi() { // [x tâm, y tâm, nửa cạnh] — chỗ nút Đặc biệt (chưa mở ở ải đầu), không thì chỗ nút Chưởng, không thì bên trái nút Né
    const U = G.stageUi;
    if (!U || !U.btnPos) return [384, 196, 20];
    let b;
    if (!coMD('dacBiet')) b = U.btnPos('special');
    else if (!coMD('chuong')) b = U.btnPos('skill');
    else { const d = U.btnPos('dodge'); b = [d[0] - d[2] - 30, d[1] - 10, 18]; }
    return [b[0], b[1], Math.max(19, Math.round(b[2] * 1.15))];
  }
  SL.nutDoi = nutDoi;
  const coDoi = (S) => !!(S && S.slice && !S.slice.xong && S.P && S.P.weapons.length > 1 && S.mode === 'play');
  // trong vòng lặp ngón chạm của readInput: ngón rơi vào nút ĐỔI thì nhận, không thành cần điều khiển / nút khác
  SL.cham = function (S, d) {
    if (!coDoi(S)) return false;
    const n = nutDoi();
    if (Math.hypot(d.x - n[0], d.y - n[1]) > n[2] + 7) return false;
    d.role = 'ui'; S.slice.doiNgay = true;
    return true;
  };
  // cuối readInput: mở dần chặn đổi vũ khí ở ải đầu → bản thử mở lại khi bấm nút ĐỔI hoặc Q / Tab
  SL.input = function (S, inp) {
    const L = S.slice;
    if (!L) return;
    const kp = G.keyP || {};
    if (coDoi(S) && (L.doiNgay || kp.KeyQ || kp.Tab)) { inp.swapP = true; inp.swapTo = (S.P.cur + 1) % S.P.weapons.length; }
    L.doiNgay = false;
  };

  // ---------- vẽ (chỉ ảnh có sẵn) ----------
  const SCx = () => G.spriteCustom;
  const FA = () => G.fxAnh;
  // ảnh thật phiên D: có ảnh (đã về) và không bật ?slicecu=1
  function anhMoi(ma) {
    if (G.SLICE_ANH_CU) return null;
    if (/^hu-/.test(ma)) { const F = FA(); return F && F.co(ma) ? F : null; }
    const S0 = SCx();
    return S0 && S0.gdSan ? S0.gdSan(ma) : null;
  }
  SL.anhMoi = anhMoi;
  const coGuard = (b) => G.clamp(((b && b.h) || 50) * 1.45 / 64, 0.9, 2.2); // cỡ khiên theo chiều cao trùm
  let trangDo = null; // ảnh trang sổ nhuộm đỏ (một lần)
  function anhTrang() {
    const S0 = SCx(), g = S0 && S0.gdSan ? S0.gdSan('gd-so-trang') : null;
    if (!g || !g.img || typeof document === 'undefined') return null;
    if (trangDo && trangDo.src === g.img) return trangDo.cv;
    try {
      const cv = document.createElement('canvas'); cv.width = g.img.width; cv.height = g.img.height;
      const q = cv.getContext('2d'); q.drawImage(g.img, 0, 0);
      q.globalCompositeOperation = 'source-atop'; q.globalAlpha = 0.5; q.fillStyle = '#c8402a'; q.fillRect(0, 0, cv.width, cv.height);
      trangDo = { src: g.img, cv };
      return cv;
    } catch (e) { return null; }
  }
  function anhVk(w) { const VM = G.vkMoi; return VM && VM.anhO ? VM.anhO(w) : null; }
  function veVk(c, w, x, y, size, mo) {
    const a = anhVk(w);
    if (!a || !a.img) return false;
    const k = (size * 1.35) / (a.w + a.h);
    c.save();
    if (mo != null) c.globalAlpha *= mo;
    c.imageSmoothingEnabled = k < 1;
    c.translate(Math.round(x), Math.round(y));
    if (w.type !== 'bow') c.rotate(-Math.PI / 4);
    c.drawImage(a.img, a.x, a.y, a.w, a.h, (-a.w * k) / 2, (-a.h * k) / 2, a.w * k, a.h * k);
    c.restore();
    return true;
  }
  // Lớp thế giới (G.wx), gọi ngay sau G.drawWorld
  SL.veTheGioi = function (S) {
    const L = S && S.slice, W = S && S.W;
    if (!L || !W || S.trans) return;
    const c = G.wx, cam = G.camVe ? G.camVe(W) : Math.round(W.cam || 0), t = G.time || 0, F = FA();
    G.wxDat(c, -cam, 0);
    try {
      const T = L.trang;
      const Fm = T && !L.lua ? anhMoi('hu-trang-muc-lua') : null;
      if (Fm) Fm.ve(c, 'hu-trang-muc-lua', T.x, T.y, T.t, 0, 1, false, 1); // trang Mực Lửa bay (6 khung lặp)
      else if (T && !L.lua) { // trang mực đỏ lượn + lửa cháy trên trang
        const im = anhTrang();
        c.save(); c.translate(Math.round(T.x), Math.round(T.y)); c.rotate(Math.sin(t * 4) * 0.35);
        if (F) F.ve(c, 'hu-bam-lua', 0, 9, t, 0, 0.7, false, 0.9); // lửa liếm mép dưới trang
        if (im) { c.imageSmoothingEnabled = true; c.drawImage(im, -12, -12, 23, 24); }
        c.restore();
      }
      const N = L.nhat;
      const Fb = N && !L.bang ? anhMoi('hu-thuong-bang-dat') : null;
      if (Fb) Fb.ve(c, 'hu-thuong-bang-dat', N.x, N.y - 7 - Math.sin(N.t * 3) * 1.2, N.t, 0, 1, false, 1); // Thương Băng nằm đất, vòng sáng
      else if (N && !L.bang && L.goc.thuong) { // Thương Băng nằm trên sàn, nhấp nhô, lấp lánh
        const w = sao(L.goc.thuong, 'ice', 1), y = N.y - 6 - Math.sin(N.t * 3) * 1.5;
        if (F) F.veK(c, 'hu-vong-phep', N.x, N.y + 1, Math.floor(t * 4) % 3, 0, 0.42, false, 0.8, G.EL.ice.col);
        veVk(c, w, N.x, y - 6, 58);
        if (F) F.ve(c, 'hu-lap-lanh', N.x + 6, y - 8, t % 1.2, 0, 0.8, false, 0.9);
      }
      const b = W.boss, g = L.guard;
      const Fg = anhMoi('hu-fire-guard');
      if (Fg && g && b && !b.dead) { // Fire Guard: khiên lửa trong mờ bao quanh trùm (khung 1–4 lặp), mờ dần lúc sắp tan
        const mo = g.t < 1 ? Math.max(0.2, g.t) : 1, vao = Math.min(1, ((G.time || 0) - g.t0) / 0.25);
        Fg.veK(c, 'hu-fire-guard', b.x, b.y - (b.h || 50) * 0.45, Math.floor(((G.time || 0) - g.t0) * 5) % 4, 0, coGuard(b) * (0.7 + 0.3 * vao), false, 0.9 * mo);
      } else if (g && b && !b.dead) { // Fire Guard: vòng phép Lửa dưới chân trùm
        const mo = g.t < 1 ? Math.max(0.25, g.t) : 1, fr = Math.min(2, Math.floor((t - g.t0) * 8)) + (g.t < 1 ? 3 : 0);
        if (F) F.veK(c, 'hu-vong-phep', b.x, b.y + 2, Math.min(7, fr), 0, 0.85, false, 0.9 * mo, G.EL.fire.col);
      }
      const V = L.vo;
      if (V) { // khiên vỡ: khung 5 rồi 6 (0,2 giây mỗi khung), mảnh băng mờ dần
        const q = ((G.time || 0) - V.t0) / 0.2;
        if (q >= 2.5 || !Fg) L.vo = null;
        else Fg.veK(c, 'hu-fire-guard', b ? b.x : V.x, (b ? b.y : V.y) - ((b && b.h) || 50) * 0.45, q < 1 ? 4 : 5, 0, coGuard(b) * (1 + 0.08 * q), false, q < 2 ? 1 : Math.max(0, 1 - (q - 2) * 2));
      }
      const M = L.manh, gm = M ? anhMoi('gd-page-scrap') : null;
      if (M && gm) { // Page Scrap rơi ra từ trùm, nảy, rồi bay vào em bé
        const P = S.P, len = M.t < 0.6 ? Math.sin((M.t / 0.6) * Math.PI) * 30 : 0;
        let x = M.x - Math.min(1, M.t / 0.6) * 56, y = M.y - len - Math.sin(M.t * 5) * 1.2;
        if (M.t > 1.4 && P) { const k = Math.min(1, (M.t - 1.4) / 0.6); x += (P.x - x) * k; y += (P.y - 14 - y) * k; }
        const ga = c.globalAlpha; c.globalAlpha = ga * (M.t > 2 ? Math.max(0, 1 - (M.t - 2) / 0.4) : 1);
        SCx().veGd(c, gm, Math.round(x - 5), Math.round(y - 5), 10, 10);
        c.globalAlpha = ga;
      }
    } catch (e) { /* hình hỏng không được làm hỏng trận */ }
    G.wxDat(c, 0, 0);
  };
  // Lớp giao diện (G.ux), gọi sau drawHud
  SL.veHud = function (S) {
    const L = S && S.slice, W = S && S.W, u = G.ux, ui = G.ui, S0 = SCx();
    if (!L || !W || S.mode !== 'play' || S.trans) return;
    const cam = G.camVe ? G.camVe(W) : Math.round(W.cam || 0), t = G.time || 0;
    // biểu tượng thích nghi trên đầu trùm: Guard đứng → hệ Lửa to + khiên; chưa → các chấm Lửa đã học (mờ = chưa)
    const b = W.boss;
    if (b && !b.dead && !b.hidden && S0 && S0.gdSan) {
      const he = S0.gdSan('gd-he-fire'), x = b.x - cam, y = b.y - (b.h || 50) - 12;
      if (he) {
        const bt = L.guard ? anhMoi('gd-bt-fire-guard') : null;
        if (bt) { // biểu tượng Fire Guard (khiên lửa + bút lông) 16×16, phập phồng
          const k = 1 + 0.1 * Math.sin(t * 8);
          S0.veGd(u, bt, Math.round(x - 8 * k), Math.round(y - 8 * k), 16 * k, 16 * k);
        } else if (L.guard) {
          const k = 1 + 0.12 * Math.sin(t * 8);
          if (G.fxAnh) G.fxAnh.veK(u, 'hu-khien-nuoc', x, y + 1, Math.floor(t * 5) % 4, 0, 0.95, false, 0.8);
          S0.veGd(u, he, Math.round(x - 8 * k), Math.round(y - 8 * k), 16 * k, 16 * k);
        } else if (L.dem > 0 && !(L.nghi > 0)) {
          const n = L.lan ? SO.nguong2 : SO.nguong, w0 = n * 8 - 2;
          for (let i = 0; i < n; i++) { const ga = u.globalAlpha; u.globalAlpha = ga * (i < L.dem ? 1 : 0.3); S0.veGd(u, he, Math.round(x - w0 / 2 + i * 8), Math.round(y - 3), 6, 6); u.globalAlpha = ga; }
        }
      }
    }
    // nút ĐỔI
    if (coDoi(S)) {
      const n = nutDoi(), P = S.P, ke = P.weapons[(P.cur + 1) % P.weapons.length], s = n[2] * 2;
      const nut = S0 && S0.gdSan ? S0.gdSan('gd-nut-vuong') : null, cd = P.swapCd > 0 ? 0.55 : 1;
      const ga = u.globalAlpha; u.globalAlpha = ga * cd;
      const mat = anhMoi('gd-nut-doi');
      if (mat) { // mặt nút ĐỔI (gỗ, góc đồng, 2 mũi tên vòng); vũ khí kế tiếp đã có ở ô vũ khí góc trên
        S0.veGd(u, mat, Math.round(n[0] - s / 2), Math.round(n[1] - s / 2), s, s);
      } else {
        if (nut) S0.veGd(u, nut, Math.round(n[0] - s / 2), Math.round(n[1] - s / 2), s, s);
        veVk(u, ke, n[0], n[1] - 3, s * 0.62);
      }
      u.globalAlpha = ga;
      if (ui) ui.text(tv(C.nut || 'ĐỔI'), n[0], n[1] + s / 2 - 3, { size: 7.5, bold: true, align: 'center', color: ke && ke.branch && G.EL[ke.branch] ? G.EL[ke.branch].col : '#f6dc92' });
    }
  };

  // Màn kết quả (js/stage.js gọi sau khi vẽ các dòng chữ): biểu tượng Page Scrap 17×18 ngay sau dòng "Page Scrap ×1".
  SL.veKetQua = function (S, ds, x, y, buoc) {
    const g = S && S.slice && S.slice.xong ? anhMoi('gd-page-scrap') : null, u = G.ux, ui = G.ui;
    if (!g || !u || !ds) return;
    const mau = String(G.t(C.trang, 1)).split('×')[0].trim();
    const i = ds.findIndex((l) => typeof l === 'string' && mau && l.indexOf(mau) >= 0);
    if (i < 0) return;
    if (ui && ui.font) ui.font(7.5, false);
    const w = u.measureText(ds[i]).width;
    SCx().veGd(u, g, Math.round(x + w + 3), Math.round(y + i * buoc - 12), 17, 18);
  };

  // ---------- màn chào → vào thẳng ải 1-1 (người mới) ----------
  if (G.setScene && !G.setScene.sliceBoc) {
    const gocSet = G.setScene;
    let dang = false;
    G.setScene = function (s) {
      if (!dang && SL.bat() && G.Title && G.Village && s === G.Village && G.scene === G.Title && SL.moi(G.save) && !G.botInput) {
        dang = true;
        try { G.startStage(0, 0, 0); return; } catch (e) { if (typeof console !== 'undefined') console.warn('slice: không vào thẳng ải được', e); } finally { dang = false; }
      }
      const r = gocSet.apply(this, arguments);
      if (s === G.Village && SL.choLang) { SL.choLang = false; SL.langT = (G.time || 0) + 5.5; }
      return r;
    };
    G.setScene.sliceBoc = true;
  }
  // về làng sau lần đầu hạ Toadstool King: dòng báo Forge đã mở (sau dòng báo mở dần của js/mo_dan.js)
  if (G.Village && G.Village.update && !G.Village.update.sliceBoc) {
    const gocU = G.Village.update;
    G.Village.update = function () {
      const r = gocU.apply(this, arguments);
      if (SL.langT && (G.time || 0) >= SL.langT && G.scene === G.Village) {
        SL.langT = 0;
        try { if (G.villageScene && G.villageScene.say) G.villageScene.say(tv(C.lang), 6); if (G.sfx) G.sfx('evolve', 1.1); } catch (e) { /* bỏ qua */ }
      }
      return r;
    };
    G.Village.update.sliceBoc = true;
  }
})();
