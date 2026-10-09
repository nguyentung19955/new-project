// BÁN ĐỒ LẤY VÀNG (vàng trong game) ở Bà Hàng Xén và ở bảng Hành trang khi đang ở làng.
//   - Giá bán: vũ khí giữ giá cũ của bà; trang phục theo bậc màu (và cấp cánh), chỉ bằng khoảng 20-30% công mua, may, nâng.
//   - Khoá đồ: món khoá (it.lock / w.lock = 1 trong bản lưu) không bán được, không bị "Bán hết" quét. Bản lưu cũ: không khoá.
//   - Không bán được: vũ khí đang mang, trang phục đang mặc, món đã khoá.
//   - Bán một món, chọn nhiều món, "Bán hết đồ Thường/Lam"; bán món Tím trở lên hoặc từ 5 món trở lên thì hỏi lại bằng bảng
//     riêng (không dùng hộp thoại trình duyệt).
// Chỉ đọc ngón tay qua G.click (các nút của G.theme). Bán xong: cộng vàng, G.persist() (lưu máy và đẩy mây), báo một câu.
(function () {
  const G = window.G, ui = G.ui, T = G.theme;
  if (!T) return;
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';
  const S = (G.banDo = { multi: false, kind: null, ids: new Set(), ask: null });

  // ---------- giá ----------
  // Vũ khí: giá cũ của Bà Hàng Xén (Thường 20, Lam 60, Tím 150, Vàng 400, mỗi cấp mài thêm 15).
  S.W_PRICE = [20, 60, 150, 400];
  S.W_SHARP = 15;
  // Trang phục: cùng bậc giá với vũ khí. Đồ thường bà bán (60-140 vàng) thì bà mua lại tối đa 1/4 giá.
  // Cánh: thêm 1/4 vàng đã bỏ ra mở cấp (cấp 2: +75, cấp 3: +275).
  S.O_PRICE = [20, 60, 150, 400];
  S.O_WING = [0, 0, 75, 275];
  S.wPrice = (w) => S.W_PRICE[G.clamp(G.wRar(w), 0, 3)] + (w.sharpen | 0) * S.W_SHARP;
  S.oPrice = function (it) {
    const O = G.outfit, Ti = O && O.ITEMS[it.k];
    if (!Ti) return 0;
    const r = G.clamp(it.r | 0, 0, 3);
    let p = S.O_PRICE[r];
    if (r === 0 && Ti.price) p = Math.min(p, Math.round(Ti.price / 4));
    if (Ti.slot === 'wing') p += S.O_WING[G.clamp(it.lv | 0, 1, 3)];
    return p;
  };
  S.price = (kind, x) => (kind === 'w' ? S.wPrice(x) : S.oPrice(x));
  S.rar = (kind, x) => (kind === 'w' ? G.wRar(x) : x.r | 0);
  S.name = (kind, x) => (kind === 'w' ? G.wName(x) : G.outfit.name(x));
  S.list = (sv, kind) => (kind === 'w' ? sv.weapons : sv.outfit ? sv.outfit.items : []);
  S.find = (sv, kind, id) => S.list(sv, kind).find((x) => x.id === id) || null;
  const worn = (sv, it) => { const Ti = G.outfit.ITEMS[it.k]; return !!Ti && sv.outfit.wear[Ti.slot] === it.id; };
  // Lý do không bán được (null là bán được)
  S.why = function (sv, kind, x) {
    if (!x) return 'không có';
    if (kind === 'w' && sv.carry.includes(x.id)) return 'đang mang';
    if (kind === 'o' && worn(sv, x)) return 'đang mặc';
    if (x.lock) return 'đã khoá';
    return null;
  };

  // ---------- khoá ----------
  S.toggleLock = function (x) {
    if (!x) return;
    if (x.lock) delete x.lock; else x.lock = 1;
    if (S.ids.has(x.id) && x.lock) S.ids.delete(x.id);
    G.persist();
    if (G.sfx) G.sfx('ui');
  };

  // ---------- bán ----------
  // Bán các món (kind 'w' vũ khí, 'o' trang phục) có mã trong ids; món không bán được thì bỏ qua. Trả về { n, gold }.
  S.sell = function (sv, kind, ids) {
    const want = new Set(ids);
    let n = 0, gold = 0;
    const keep = (x) => {
      if (!want.has(x.id) || S.why(sv, kind, x)) return true;
      n++; gold += S.price(kind, x);
      return false;
    };
    if (kind === 'w') sv.weapons = sv.weapons.filter(keep);
    else if (sv.outfit) sv.outfit.items = sv.outfit.items.filter(keep);
    sv.gold += gold;
    return { n, gold };
  };
  // Các món bán được, cùng bậc rar (nút "Bán hết đồ Thường/Lam")
  S.quickIds = (sv, kind, rar) => S.list(sv, kind).filter((x) => S.rar(kind, x) === rar && !S.why(sv, kind, x)).map((x) => x.id);
  // Tổng của một nhóm món bán được: { n, gold, top: bậc cao nhất, hi: số món từ Tím trở lên, items }
  S.total = function (sv, kind, ids) {
    const items = [...ids].map((id) => S.find(sv, kind, id)).filter((x) => x && !S.why(sv, kind, x));
    let gold = 0, top = -1, hi = 0;
    for (const x of items) { gold += S.price(kind, x); const r = S.rar(kind, x); if (r > top) top = r; if (r >= 2) hi++; }
    return { n: items.length, gold, top, hi, items };
  };
  // Có phải hỏi lại không: có món Tím trở lên, hoặc từ 5 món trở lên.
  S.needAsk = (t) => t.top >= 2 || t.n >= 5;
  // Xin bán (từ nút): cần hỏi lại thì mở bảng xác nhận, không thì bán luôn. done(res) gọi sau khi bán xong.
  S.request = function (sv, kind, ids, done) {
    const t = S.total(sv, kind, ids);
    if (!t.n) { S.tell('Không có món nào bán được (món đang mang, đang mặc hoặc đã khoá thì giữ lại).'); return false; }
    if (S.needAsk(t)) { S.ask = { kind, ids: t.items.map((x) => x.id), t, done }; if (G.sfx) G.sfx('ui'); return false; }
    S.doSell(sv, kind, t.items.map((x) => x.id), done);
    return true;
  };
  S.doSell = function (sv, kind, ids, done) {
    const res = S.sell(sv, kind, ids);
    if (!res.n) return res;
    for (const id of ids) S.ids.delete(id);
    if (S.multi && !S.ids.size) S.multi = false;
    G.persist();
    if (G.sfx) G.sfx('pick');
    if (G.villageScene && G.villageScene.checkNews) G.villageScene.checkNews();
    S.tell(res.n === 1 ? 'Đã bán 1 món, +' + res.gold + ' vàng.' : 'Đã bán ' + res.n + ' món, +' + res.gold + ' vàng.');
    S.lastSold = res;
    if (done) done(res);
    return res;
  };
  S.tell = (s) => { if (G.villageApi) G.villageApi.say(s); };

  // ---------- chọn nhiều ----------
  S.reset = function () { S.multi = false; S.kind = null; S.ids.clear(); S.ask = null; };
  S.setMulti = function (on, kind) { S.multi = !!on; S.kind = kind; S.ids.clear(); };
  S.picked = (id) => S.multi && S.ids.has(id);
  // Chạm một món khi đang chọn nhiều: đánh dấu hoặc bỏ. Món không bán được thì báo lý do.
  S.togglePick = function (sv, kind, x) {
    const why = S.why(sv, kind, x);
    if (why) { S.tell(S.name(kind, x) + ' ' + why + ', không bán được.'); return; }
    if (S.ids.has(x.id)) S.ids.delete(x.id); else S.ids.add(x.id);
    if (G.sfx) G.sfx('ui');
  };

  // ---------- hình vẽ nhỏ ----------
  // Ổ khoá pixel, góc trên trái (x, y), rộng 7 cao 9 (s: phóng). on: đang khoá (vàng), không thì ổ mở màu nhạt.
  const LOCK = ['..kkk..', '.k...k.', '.k...k.', 'kkkkkkk', 'kaaaaak', 'kaakaak', 'kaakaak', 'kaaaaak', 'kkkkkkk'];
  const OPEN = ['....kkk', '...k...', '...k...', 'kkkkkkk', 'kaaaaak', 'kaakaak', 'kaakaak', 'kaaaaak', 'kkkkkkk'];
  S.lockIcon = function (x, y, on, s) {
    s = s || 1;
    const c = G.ux, rows = on ? LOCK : OPEN, pal = on ? { k: '#2a1408', a: '#ffd24a' } : { k: '#203432', a: '#6f8a84' };
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < 7; i++) {
      const ch = rows[j][i], col = pal[ch];
      if (!col) continue;
      c.fillStyle = ch === 'k' && j < 3 && on ? '#e8c060' : ch === 'k' && j < 3 ? '#6f8a84' : col;
      c.fillRect(x + i * s, y + j * s, s, s);
    }
  };
  // Nút ổ khoá chạm được (vùng chạm rộng hơn hình). Trả về true khi vừa bấm.
  S.lockBtn = function (x, y, w, h, on) {
    S.lockIcon(Math.round(x + w / 2 - 3.5), Math.round(y + h / 2 - 4.5), on);
    return T.hit(x - 2, y - 2, w + 4, h + 4);
  };
  // Dấu đã chọn (ô vuông xanh có dấu tích) góc trên trái (x, y), cạnh 8
  S.tick = function (x, y) {
    const c = G.ux;
    c.fillStyle = '#16301e'; c.fillRect(x, y, 9, 9);
    c.fillStyle = GOOD; c.fillRect(x + 1, y + 1, 7, 7);
    c.fillStyle = '#10301a';
    for (const q of [[2, 4], [3, 5], [4, 6], [5, 5], [6, 4], [7, 3], [3, 4], [4, 5]]) c.fillRect(x + q[0], y + q[1], 1, 1);
  };

  // ---------- nút dùng chung ----------
  const RN = () => G.RARITY;
  // Ba nút trên một hàng, canh phải tại xr: "Bán hết Thường", "Bán hết Lam", "Chọn nhiều" (đang chọn thì "Thôi chọn").
  S.quickBar = function (sv, kind, xr, y, h) {
    h = h || 13;
    const labs = ['Bán hết ' + RN()[0].name, 'Bán hết ' + RN()[1].name, S.multi && S.kind === kind ? 'Thôi chọn' : 'Chọn nhiều'];
    ui.font(7, true);
    const ws = labs.map((s) => Math.ceil(G.ux.measureText(s).width) + 10);
    let x = xr - ws.reduce((a, b) => a + b + 3, -3);
    const x0 = x;
    for (let i = 0; i < 3; i++) {
      const on = i === 2 && S.multi && S.kind === kind;
      if (T.sbtn(x, y, ws[i], h, labs[i], { size: 7, pad: 1, danger: i < 2, sel: on })) {
        if (i < 2) {
          const ids = S.quickIds(sv, kind, i);
          if (!ids.length) S.tell('Không có đồ ' + RN()[i].name + ' nào bán được (món đang mang, đang mặc, đã khoá thì giữ lại).');
          else S.request(sv, kind, ids);
        } else S.setMulti(!on, kind);
      }
      x += ws[i] + 3;
    }
    return x0;
  };
  // Nút "Bán N món · X vàng" khi đang chọn nhiều
  S.sellBtn = function (sv, kind, x, y, w, h) {
    const t = S.total(sv, kind, S.ids);
    const lab = t.n ? 'Bán ' + t.n + ' món · ' + t.gold + ' vàng' : 'Chạm các món để chọn';
    if (T.sbtn(x, y, w, h, lab, { size: 7.5, pad: 2, danger: t.n > 0, disabled: !t.n })) S.request(sv, kind, S.ids);
    return t;
  };

  // ---------- bảng hỏi lại ----------
  // Gọi S.guard() TRƯỚC khi vẽ bảng bên dưới (để lần chạm không lọt xuống), và S.modal(g) SAU khi vẽ xong.
  S.guard = function () {
    if (!S.ask) return undefined;
    const c = G.click; G.click = null;
    return c;
  };
  S.modal = function (saved, mx) {
    const A = S.ask;
    if (!A) return false;
    G.click = saved || null;
    const sv = G.save, t = S.total(sv, A.kind, A.ids);
    if (!t.n) { S.ask = null; G.click = null; return true; }
    T.dim(0.6);
    const w = 260, h = 124, x = mx == null ? 182 : mx, y = 74;
    T.panel(x, y, w, h, 'Bán thật không?', { plain: true });
    ui.text('Bán ' + t.n + ' món, nhận ' + t.gold + ' vàng.', x + w / 2, y + 40, { size: 9.5, bold: true, align: 'center', color: GOLD });
    let yy = y + 54;
    if (t.hi) {
      const cnt = [0, 0, 0, 0];
      for (const q of t.items) cnt[S.rar(A.kind, q)]++;
      const parts = [2, 3].filter((r) => cnt[r]).map((r) => cnt[r] + ' món ' + G.RARITY[r].name);
      ui.text('Trong đó có ' + parts.join(' và ') + ' (đồ quý).', x + w / 2, yy, { size: 7.5, bold: true, align: 'center', color: WARN });
      yy += 11;
    }
    // vài tên món đầu tiên
    const names = t.items.slice(0, 3).map((q) => S.name(A.kind, q)).join(', ') + (t.n > 3 ? ', …' : '');
    ui.text(fit(names, w - 20, 7), x + w / 2, yy, { size: 7, align: 'center', color: TXT });
    ui.text('Bán rồi thì không lấy lại được.', x + w / 2, yy + 11, { size: 7, align: 'center', color: SOFT });
    if (T.btn(x + 14, y + h - 32, 110, 24, 'Thôi, giữ lại', { size: 9 }) || G.keyP.Escape) { S.ask = null; G.keyP.Escape = false; }
    else if (T.btn(x + w - 124, y + h - 32, 110, 24, 'Bán', { size: 10, danger: true })) { S.ask = null; S.doSell(sv, A.kind, A.ids, A.done); }
    G.click = null;
    return true;
  };
  function fit(s, w, size) {
    ui.font(size);
    const c = G.ux;
    if (c.measureText(s).width <= w) return s;
    let lo = 0, hi = s.length;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (c.measureText(s.slice(0, m) + '…').width <= w) lo = m; else hi = m - 1; }
    return s.slice(0, lo).trimEnd() + '…';
  }
  S.fit = fit;
})();
