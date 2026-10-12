// GHÉP LỚP (Zed modular): vẽ Zed bằng cách chồng thân + áo/quần/giáp + mũ + đồ lưng/cánh + vũ khí theo số liệu .lop.json.
// Quy cách: docs/review/ke-hoach-cai-thien/zed-asset/LINH_KHI_MODULAR_SPRITE_SPEC.md (mục 6, 7, 10).
//
// CỜ G.GHEP_LOP — TẮT mặc định. Bật bằng ?ghep=1. Tắt → tệp này không bọc gì, game y hệt trước.
// Bật mà thiếu ảnh/số liệu cho động tác đang vẽ (thân chưa có hàng đó, vũ khí trong tay chưa đo neo ở khung đó…)
// → gọi lại cách vẽ cũ (thân Cu Tí + vũ khí code) cho khung đó. Không đụng gameplay: chỉ ĐỌC đồng hồ đòn (atkT, dodgeT…).
// Dữ liệu: G.lopGhepData (build.py nhúng từ game/art/lop/*.lop.json). Chỉ dùng tệp trạng thái VALIDATED hoặc INTEGRATED;
// GENERATED và MẪU THỬ bị bỏ qua.
(function () {
  const G = window.G;
  let bat = false;
  try { bat = typeof location !== 'undefined' && /[?&]ghep=1(&|$)/.test(location.search || ''); } catch (e) { bat = false; }
  G.GHEP_LOP = bat;
  const GL = (G.ghepLop = { than: [], lop: [], loi: [] });
  if (!G.GHEP_LOP) return;

  const KHUNG = 48, GOC = [24, 45];
  const DUNG = { VALIDATED: 1, INTEGRATED: 1 };
  // Lớp vẽ theo slot (SPEC mục 2). Lớp ghi trong tệp thắng.
  const LOP = { canh: 10, lung_sau: 20, than: 40, chan: 50, quan: 55, ao: 60, giap_than: 60, dai: 65, vai: 70, tay: 75, lung_truoc: 80, mu: 85, vu_khi: 90 };
  // Ô trang phục của game (js/outfit.js, G.tinhLinh.outfitOf) → slot của hệ ghép lớp
  const O_GAME = { hat: ['mu'], robe: ['ao', 'giap_than'], back: ['lung_sau', 'lung_truoc'], wing: ['canh'] };
  const VK = { sword: 'kiem', spear: 'thuong', hammer: 'bua', bow: 'phitieu' };

  // ---------- nạp ----------
  function nap() {
    for (const m of G.lopGhepData || []) {
      try {
        if (!m || m.loai !== 'linh-khi-lop' || m.mau_thu || !DUNG[m.trang_thai] || !m.tam) continue;
        const a = { m, img: new Image(), ok: false, lop: m.lop != null ? m.lop : LOP[m.slot] || 60 };
        a.img.onload = () => { a.ok = true; };
        a.img.src = m.tam;
        if (m.slot === 'than') GL.than.push(a); else GL.lop.push(a);
      } catch (e) { GL.loi.push(String(e)); }
    }
  }
  nap();
  if (!GL.than.length) return; // chưa có thân nào đạt chuẩn: không bọc gì (game y hệt)

  // ---------- chọn động tác + khung (theo cùng thứ tự ưu tiên như SC.chonEmBe ở js/sprite_custom.js) ----------
  const kep = (v, a, b) => (v < a ? a : v > b ? b : v);
  function chon(o) {
    const p = o.p, t = (o.t != null ? o.t : G.time) || 0, tc = o.tc != null && isFinite(o.tc) ? o.tc : t;
    const wt = o.weapon && o.weapon.type, v = VK[wt];
    const mot = (ten, u) => ({ ten, u: kep(u, 0, 1) }), lap = (ten, tt) => ({ ten, t: tt });
    if (p && p.dead) return mot('chet', (p.deadT || 0) / 0.6);
    if (o.dodge >= 0) return mot('lon', o.dodge);
    if (p && p.dashT > 0) return wt === 'spear' ? mot('thuong_xoc', 0.5) : wt === 'sword' ? mot('kiem_1', 0.5) : lap('chay', t * 2);
    if (p && p.specT > 0) return wt === 'bow' ? mot('phitieu_tung', 1 - p.specT / 0.35) : mot('chuong', 1 - p.specT / 0.35);
    if (p && p.castT > 0) return mot('chuong', 1 - p.castT / 0.3); // castT đặt 0,3 (js/chuong.js): chia đúng 0,3
    if (p && p.mv && p.mv.holding && !(o.atk >= 0)) {
      const ch = p.mv.charge || 0;
      if (wt === 'bow') return { ten: 'phitieu_giu', i: Math.min(2, Math.floor(kep(ch, 0, 1) * 3)) };
      if (wt === 'spear' || wt === 'hammer') return { ten: v + '_giu', i: ch >= 0.4 ? 1 : 0 };
      if (wt === 'sword') return { ten: 'kiem_3', i: 1 };
    }
    if (o.atk >= 0) {
      const ci = p ? p.comboI | 0 : 0;
      if (wt === 'sword') return mot('kiem_' + ((ci % 3 + 3) % 3 + 1), o.atk);
      if (wt === 'spear') return mot('thuong_' + ((ci % 4 + 4) % 4 + 1), o.atk);
      if (wt === 'hammer') return mot('bua', o.atk);
      if (wt === 'bow') return mot('phitieu', o.atk);
      return null; // tay không đánh (giáo đang bay): để cách vẽ cũ lo
    }
    if ((p && p.hurtT > 0) || (!p && o.flash)) return mot('trung', p ? 1 - p.hurtT / 0.2 : 0.3);
    if (o.move) return p && p.mv && p.mv.holding ? lap('di', tc) : lap('chay', tc);
    return lap('dung', t);
  }
  const DU_PHONG = { di: 'chay', thuong_xoc: 'thuong_1', phitieu_tung: 'chuong' };
  function khungCua(d, s) {
    if (s.i != null) return Math.min(d.so - 1, s.i);
    if (s.t != null) return Math.floor(Math.max(0, s.t) / (d.giay || 1) * d.so) % d.so;
    if (d.moc) { let i = 0; while (i < d.so - 1 && d.moc[i + 1] != null && s.u >= d.moc[i + 1]) i++; return i; }
    return Math.min(d.so - 1, Math.floor(s.u * d.so));
  }
  // Bộ thân: các tệp thân cùng "bo"; lấy bộ của tệp thân đầu tiên (một nhân vật Zed)
  const BO = GL.than[0].m.bo || GL.than[0].m.id;
  function thanCo(ten) { for (const a of GL.than) if (a.ok && (a.m.bo || a.m.id) === BO && a.m.dong_tac && a.m.dong_tac[ten]) return a; return null; }

  // ---------- đồ đang mặc → lớp ----------
  function lopDangMac(o) {
    let of = null;
    try { of = G.tinhLinh && G.tinhLinh.outfitOf ? G.tinhLinh.outfitOf('smith', o) : null; } catch (e) { of = null; }
    of = of || {};
    const ma = {}; // slot game → mã món
    if (of.hat) ma.hat = of.hat;
    if (of.robe) ma.robe = of.robe;
    if (of.back) ma.back = of.back;
    if (of.wing && of.wing.kind) ma.wing = 'canh_' + of.wing.kind;
    const ds = [], chiemBoi = new Set();
    for (const k in ma) {
      for (const a of GL.lop) {
        if (!a.ok || !O_GAME[k].includes(a.m.slot) || !(a.m.mon || []).some((x) => x === ma[k] || (k === 'wing' && x === of.wing.kind))) continue;
        ds.push(a);
        for (const s of a.m.chiem || [a.m.slot]) chiemBoi.add(s);
      }
    }
    // đồ mặc định (mac_dinh: true) cho slot chưa có món nào chiếm
    for (const a of GL.lop) if (a.ok && a.m.mac_dinh && !(a.m.chiem || [a.m.slot]).some((s) => chiemBoi.has(s))) ds.push(a);
    return ds;
  }
  // Tệp của cùng món có động tác ten (món có nhiều tệp: cơ bản, kiếm, thương…)
  function tepCua(a, ten) {
    if (a.m.kieu !== 'khung' || (a.m.dong_tac && a.m.dong_tac[ten])) return a;
    const k = (a.m.mon || []).join() + '|' + a.m.slot + '|' + !!a.m.mac_dinh;
    for (const b of GL.lop) if (b.ok && b.m.dong_tac && b.m.dong_tac[ten] && (b.m.mon || []).join() + '|' + b.m.slot + '|' + !!b.m.mac_dinh === k) return b;
    return null;
  }

  // ---------- vẽ ----------
  function veGan(c, a, P, gocDo, vo) {
    const m = a.m, s = m.ti_le || 0.25, d = m.diem_gan || [a.img.width / 2, a.img.height / 2];
    let sx = 0, sw = a.img.width;
    if (m.lap && m.lap.so > 1) { sw = a.img.width / m.lap.so; sx = (vo % m.lap.so) * sw; }
    c.save(); c.translate(P[0], P[1]); c.rotate((gocDo || 0) * Math.PI / 180); c.scale(s, s);
    c.drawImage(a.img, sx, 0, sw, a.img.height, -d[0], -d[1], sw, a.img.height);
    c.restore();
  }
  let tam = null; // canvas phụ để ẩn tóc dưới mũ
  // Trả về false nếu thiếu thứ gì → nơi gọi dùng cách vẽ cũ.
  function veGhep(c, o) {
    const s = chon(o);
    if (!s) return false;
    let ten = s.ten, than = thanCo(ten);
    if (!than && DU_PHONG[ten]) { ten = DU_PHONG[ten]; than = thanCo(ten); }
    if (!than) return false;
    const d = than.m.dong_tac[ten], i = khungCua(d, s), N = (than.m.neo && than.m.neo[ten] && than.m.neo[ten][i]) || {};
    const t = (o.t != null ? o.t : G.time) || 0, n = than.m.net || 2, O = KHUNG * n;
    const ve = [{ lop: 40, f: (q) => q.drawImage(than.img, i * O, d.hang * O, O, O, -GOC[0], -GOC[1], KHUNG, KHUNG) }];
    // vũ khí trong tay: phải có neo vk đo thật ở khung này (phi tiêu: tay không lúc đứng/chạy là hợp lệ khi tệp ghi vk null)
    const w = o.weapon || {}, wt = w.type;
    if (wt && VK[wt] && !(wt === 'bow' && !N.vk && /^(dung|di|chay|trung|lon)$/.test(ten))) {
      if (!N.vk) return false;
      const v = N.vk, P = [v.x - GOC[0], v.y - GOC[1]];
      const anh = GL.lop.find((a) => a.ok && a.m.slot === 'vu_khi' && a.m.kieu === 'gan' && (a.m.mon || []).includes(wt));
      if (anh) ve.push({ lop: v.lop === 'sau' ? 30 : 90, f: (q) => veGan(q, anh, P, v.goc - (anh.m.goc_anh || 0)) });
      else if (G.weaponArt && G.weaponArt.draw && G.weaponArt.fromWeapon) {
        ve.push({ lop: v.lop === 'sau' ? 30 : 90, f: (q) => G.weaponArt.draw(q, G.weaponArt.fromWeapon(w, { mood: 'attack', t }), P[0], P[1], v.goc, 0) });
      } else return false;
    }
    let anToc = null;
    for (const a0 of lopDangMac(o)) {
      const a = tepCua(a0, ten);
      if (!a) continue; // món chưa có ảnh cho động tác này: bỏ món đó (thân vẫn đủ)
      const m = a.m;
      if (m.kieu === 'khung') {
        const dd = m.dong_tac[ten], l = (m.lech && m.lech[ten] && m.lech[ten][i]) || [0, 0], nn = m.net || 2, OO = KHUNG * nn;
        ve.push({ lop: a.lop, f: (q) => q.drawImage(a.img, i * OO, dd.hang * OO, OO, OO, -GOC[0] + l[0], -GOC[1] + l[1], KHUNG, KHUNG) });
        continue;
      }
      const neo = m.slot === 'mu' ? N.dau : N.lung;
      if (!neo) continue; // chưa đo neo: không vẽ món gắn (không bịa vị trí)
      const vo = m.lap ? Math.floor(t / (m.lap.giay || 0.8) * m.lap.so * (o.move ? 1.6 : 1)) : 0;
      ve.push({ lop: a.lop, f: (q) => veGan(q, a, [neo[0] - GOC[0], neo[1] - GOC[1]], neo[2] || 0, vo) });
      if (m.slot === 'mu' && m.an_toc && m.an_toc.vung) { const v = m.an_toc.vung; anToc = [neo[0] - GOC[0] + v[0], neo[1] - GOC[1] + v[1], v[2], v[3]]; }
    }
    ve.sort((x, y) => x.lop - y.lop);
    const x = Math.round(o.x), y = Math.round(o.y), f = o.face < 0 ? -1 : 1;
    c.save();
    if (o.alpha != null) c.globalAlpha = c.globalAlpha * o.alpha;
    c.imageSmoothingEnabled = false;
    if (!o.noShadow) {
      if (G.art && G.art.ellipse) G.art.ellipse(c, x, y, 9, 4, 'rgba(0,0,0,0.3)');
      else { c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x - 8, y - 1, 16, 3); }
    }
    c.translate(x + (f < 0 ? 1 : 0), y);
    c.scale(f, 1);
    for (const l of ve) {
      if (l.lop === 40 && anToc) {
        const k = 4;
        tam = tam || document.createElement('canvas');
        tam.width = KHUNG * k; tam.height = KHUNG * k;
        const q = tam.getContext('2d');
        q.imageSmoothingEnabled = false; q.setTransform(k, 0, 0, k, GOC[0] * k, GOC[1] * k);
        l.f(q);
        q.globalCompositeOperation = 'destination-out'; q.fillRect(anToc[0], anToc[1], anToc[2], anToc[3]); q.globalCompositeOperation = 'source-over';
        c.drawImage(tam, -GOC[0], -GOC[1], KHUNG, KHUNG);
      } else l.f(c);
    }
    c.restore();
    return true;
  }

  // ---------- bọc G.art.hero (ngoài cùng; sprite_custom.js có thể bọc sau khi ảnh nạp xong, nên kiểm lại mỗi khung) ----------
  let dangGoiCu = false;
  function boc() {
    const A = G.art;
    if (!A || typeof A.hero !== 'function' || A.hero._ghepLop) return;
    const cu = A.hero;
    const moi = function (c, o) {
      if (!dangGoiCu && o && (o.key === 'smith' || !o.key) && G.ZED !== false) {
        try { if (veGhep(c, o)) return; } catch (e) { if (GL.loi.length < 5) GL.loi.push(String(e)); }
      }
      // cách vẽ cũ (cũng là đường khi lớp bên trong là bọc cũ của chính tệp này)
      const truoc = dangGoiCu; dangGoiCu = true;
      try { return cu.call(this, c, o); } finally { dangGoiCu = truoc; }
    };
    moi._ghepLop = true;
    A.hero = moi;
  }
  function giu() { try { boc(); } catch (e) { /* bỏ qua */ } if (typeof requestAnimationFrame === 'function') requestAnimationFrame(giu); }
  giu();
})();
