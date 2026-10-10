// BẢNG VÀNG (xếp hạng): thẻ "Bảng vàng" ở Cụ Đồ (gốc đa), vẽ theo giao diện trống đồng.
//  - Mỗi người một dòng trên Firestore linhkhi_scores/{uid}: tên, Sức mạnh cao nhất, tổng sao, ải xa nhất, hero, thời gian hạ nhanh nhất
//    từng trùm vùng (b_moc, b_ngu, b_ho, tính bằng giây). Chỉ ghi khi có số tốt hơn (luật Firestore cũng chặn ghi lùi).
//  - Kỷ lục riêng của mình nằm trong bản lưu (G.save.rec) nên đi theo tài khoản; lập kỷ lục mới thì báo ở màn kết quả.
//  - Các thẻ: Sức mạnh / Sao / từng trùm vùng; mỗi lần tải 8 dòng, tối đa 50; dòng của mình luôn hiện ở dưới.
(function () {
  const G = window.G, C = G.cloud, ui = G.ui, T = G.theme;
  const PER = 8, MAX = 50;
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a';
  const B = (G.bangVang = { cat: 'power', page: 0, data: {}, t: 0 });

  // ---------- tên ----------
  function cleanName(s) {
    s = String(s || '').normalize('NFC').replace(/[^\p{L}\p{M}\p{N} _-]/gu, '').replace(/\s+/g, ' ').trim();
    return s.length >= 2 && s.length <= 16 ? s : '';
  }
  function guestName() {
    const id = (C.user && C.user.uid) || 'khach';
    let h = 7; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000;
    return 'Khách ' + String(h % 10000).padStart(4, '0');
  }
  function name() {
    const sv = G.save;
    const own = sv && cleanName(sv.lbName);
    if (own) return own;
    return cleanName(String(C.gName() || '').slice(0, 16)) || guestName();
  }
  B.cleanName = cleanName; B.name = name;

  // ---------- kỷ lục riêng (trong bản lưu) ----------
  function rec() {
    const sv = G.save;
    const r = sv.rec && typeof sv.rec === 'object' && !Array.isArray(sv.rec) ? sv.rec : {};
    r.power = typeof r.power === 'number' && isFinite(r.power) && r.power > 0 ? Math.floor(r.power) : 0;
    const b = r.b && typeof r.b === 'object' ? r.b : {};
    r.b = {};
    for (const k of C.BOSSES) if (typeof b[k] === 'number' && b[k] > 0 && isFinite(b[k])) r.b[k] = b[k];
    sv.rec = r;
    return r;
  }
  function powerNow() { try { return G.power ? Math.round(G.power()) : 0; } catch (e) { return 0; } }
  // ghi nhận Sức mạnh hiện tại; trả về true nếu là kỷ lục mới
  function notePower() { const r = rec(), p = powerNow(); if (p > r.power) { const first = !r.power; r.power = p; return first ? 'first' : true; } return false; }
  function entry() {
    const sv = G.save, r = rec();
    return { name: name(), power: r.power, stars: C.starSum(sv), far: C.far(sv), hero: sv.hero, b: Object.assign({}, r.b) };
  }
  B.entry = entry; B.rec = rec;
  const secs = (t) => (Math.round(t * 10) / 10).toFixed(1).replace('.', ',') + ' giây';

  // Gọi từ settle() trong js/stage.js lúc tính thưởng (trước khi lưu): ghi kỷ lục, thêm dòng báo vào màn kết quả.
  G.onStageEnd = function (S, R) {
    if (!R || !R.win) return;
    const r = rec(), reg = G.REGIONS[S.r];
    if (S.i === 4 && reg && reg.boss) {
      // thời gian đánh trùm: từ lúc vào phòng trùm tới lúc trùm gục (không tính lúc tạm dừng và cảnh trùm ngã)
      const t = Math.max(5, (S.roomT || 0) - (S.endT || 0));
      const old = r.b[reg.boss];
      if (!old || t < old) {
        r.b[reg.boss] = Math.round(t * 10) / 10;
        R.lines.push((old ? '★ Kỷ lục mới: ' : '★ Kỷ lục đầu: ') + reg.bossName + ' ' + secs(t)); // ngắn cho vừa cột phải màn kết quả
        R.record = true;
      }
    }
    const p = notePower();
    if (p === true) { R.lines.push('★ Kỷ lục mới: Sức mạnh ' + r.power); R.record = true; }
    B.sync();
  };

  // đẩy dòng của mình lên bảng (gộp trong 2 giây)
  let syncT = null;
  B.sync = function (now) {
    if (!G.save) return;
    notePower();
    if (!C.online() || !C.far(G.save)) return; // chưa qua ải nào thì chưa lên bảng (đỡ lượt ghi)
    clearTimeout(syncT);
    syncT = setTimeout(() => { C.submitScore(entry()).then((w) => { if (w) B.t = 0; }); }, now ? 0 : 2000);
  };

  // ---------- tải bảng theo trang ----------
  // V57: thời gian hạ trùm (đo kỹ năng) đứng TRƯỚC Sức mạnh (đo cày). Chủ dự án từng chọn chỉ MỘT bảng (Sức mạnh) nên mặc định
  // vẫn một bảng; đổi B.TRUM_TRUOC = true thì có thêm các thẻ thời gian hạ từng trùm, đặt trước thẻ Sức mạnh.
  B.TRUM_TRUOC = false;
  function cats() {
    if (B.TRUM_TRUOC) return G.REGIONS.map((R) => ['b_' + R.boss, R.bossName]).filter((q) => C.BOSSES.includes(q[0].slice(2))).concat([['power', 'Sức mạnh']]);
    return [['power', 'Sức mạnh']];
  }
  function cur() { return (B.data[B.cat] = B.data[B.cat] || { items: [], cursor: null, more: true, loading: false, err: '' }); }
  async function loadMore() {
    const D = cur(), cat = B.cat;
    if (D.loading || !D.more || !C.online()) return;
    D.loading = true; D.err = '';
    try {
      const r = await C.topScores(cat, D.cursor, PER);
      if (!r) throw new Error('offline');
      D.items = D.items.concat(r.items).slice(0, MAX); D.cursor = r.cursor; D.more = r.more && D.items.length < MAX;
    } catch (e) { D.err = e && e.code === 'permission-denied' ? 'Máy chủ chưa có luật Bảng vàng' : 'Không tải được bảng, thử lại sau'; }
    D.loading = false;
  }
  B.reload = function () { B.data = {}; B.page = 0; C.myScore = null; B.t = G.time; };
  B.loadMore = loadMore;
  function fmt(cat, x) {
    if (cat === 'power') return x.power ? String(x.power) : '-';
    if (cat === 'stars') return '★ ' + (x.stars || 0);
    const v = x[cat];
    return v ? secs(v) : '-';
  }
  // Huy chương nhỏ (điểm ảnh) cho hạng 1, 2, 3; số hạng nằm giữa.
  function medal(cx, cy, n) {
    const c = G.ux, col = ['#ffd24a', '#d6d2c8', '#e09a5a'][n - 1], dk = ['#8a5a14', '#6b655c', '#7a3a14'][n - 1];
    c.fillStyle = '#1a120a'; c.fillRect(Math.round(cx) - 4, Math.round(cy) - 5, 9, 10); c.fillRect(Math.round(cx) - 5, Math.round(cy) - 4, 11, 8);
    c.fillStyle = col; c.fillRect(Math.round(cx) - 3, Math.round(cy) - 4, 7, 8); c.fillRect(Math.round(cx) - 4, Math.round(cy) - 3, 9, 6);
    c.fillStyle = dk; c.fillRect(Math.round(cx) - 3, Math.round(cy) + 3, 7, 1);
    ui.text(String(n), cx + 0.5, cy + 2.6, { size: 6.5, bold: true, align: 'center', color: '#1a120a', shadow: false });
  }
  // Cắt chữ cho vừa bề rộng (thêm dấu …)
  function cutTo(s, wd, sz) { ui.font(sz, true); if (G.ux.measureText(s).width <= wd) return s; while (s.length > 1 && G.ux.measureText(s + '…').width > wd) s = s.slice(0, -1); return s + '…'; }
  function heroName(k) { return G.HEROES[k] ? G.HEROES[k].name : ''; }

  // ---------- bảng vẽ (Cụ Đồ, thẻ Bảng vàng). CX, CW: vùng nội dung của bảng làng ----------
  B.panel = function (CX, CW) {
    const A = G.villageApi;
    const list = cats();
    const w = Math.floor((CW - (list.length - 1) * 3) / list.length);
    if (!list.some((q) => q[0] === B.cat)) B.cat = list[0][0];
    if (list.length > 1) list.forEach(([k, n], i) => { if (T.sbtn(CX + i * (w + 3), 95, w, 18, n, { size: 7.5, pad: 2, sel: B.cat === k })) { B.cat = k; B.page = 0; } });
    else ui.text('Xếp hạng theo Sức mạnh', CX + 2, 108, { size: 9, bold: true, color: GOLD });
    if (!C.online()) {
      // Không có mạng: chỉ hiện kỷ lục trên máy, xếp thành ba ô số + một hàng thời gian hạ trùm (Giai đoạn 4: căn thẳng hàng, chữ đều cỡ)
      const r = rec(), sv = G.save;
      T.inset(CX, 116, CW, 104, false);
      ui.para('Bảng vàng cần mạng. ' + C.label() + '.', CX + 7, 129, CW - 14, { size: 7.5, color: SOFT });
      // V57: hàng thời gian hạ trùm (kỹ năng) lên trước, ba ô Sức mạnh / sao / xa nhất xuống sau
      ui.text('Kỷ lục của con: hạ trùm nhanh nhất', CX + 7, 150, { size: 8, bold: true, color: GOLD });
      const tw = Math.floor((CW - 14) / 3);
      G.REGIONS.forEach((R, i) => ui.text(R.bossName + '  ' + (r.b[R.boss] ? secs(r.b[R.boss]) : '–'), CX + 7 + i * tw, 163, { size: 7.5, color: r.b[R.boss] ? TXT : SOFT }));
      const boxes = [['Sức mạnh', String(r.power || powerNow())], ['Tổng sao', '★ ' + C.starSum(sv)], ['Xa nhất', C.farText(C.far(sv))]];
      const bw = Math.floor((CW - 14 - 2 * 4) / 3);
      boxes.forEach((q, i) => {
        const bx = CX + 7 + i * (bw + 4);
        T.inset(bx, 176, bw, 28, false, { fill: 'rgba(0,0,0,0.22)' });
        ui.text(q[0], bx + bw / 2, 186, { size: 6.5, align: 'center', color: SOFT });
        ui.text(cutTo(q[1], bw - 6, 8.5), bx + bw / 2, 198.5, { size: 8.5, bold: true, align: 'center', color: TXT });
      });
      return 'Bảng vàng treo ở đình, phải có mạng mới xem được, con ạ.';
    }
    if (B.t && G.time - B.t > 120) B.reload(); // để lâu thì tải lại
    if (!B.t) B.t = G.time;
    if (C.myScore === null && !B.mineLoading) { B.mineLoading = true; C.getMyScore().then(() => { B.mineLoading = false; }); }
    const D = cur(), pages = Math.max(1, Math.ceil(D.items.length / PER) + (D.more ? 1 : 0));
    B.page = G.clamp(B.page, 0, pages - 1);
    if (D.items.length < (B.page + 1) * PER && D.more && !D.loading && !D.err) loadMore();
    // tiêu đề cột
    const cx = { rank: CX + 4, name: CX + 24, val: CX + 168, extra: CX + 214 };
    const colName = B.cat === 'power' ? 'Sức mạnh' : B.cat === 'stars' ? 'Tổng sao' : 'Thời gian';
    // hàng tiêu đề cột: dải tối mảnh có gạch đồng bên dưới
    ui.rect(CX, 117, CW, 11, 'rgba(0,0,0,0.3)'); ui.rect(CX, 127, CW, 1, 'rgba(168,117,47,0.75)');
    ui.text('#', cx.rank + 3, 125, { size: 7, bold: true, color: SOFT, align: 'center' }); ui.text('Tên', cx.name, 125, { size: 7, bold: true, color: SOFT });
    ui.text(colName, cx.val + 38, 125, { size: 7, bold: true, color: SOFT, align: 'right' }); ui.text('Em bé · xa nhất', cx.extra, 125, { size: 7, bold: true, color: SOFT });
    const me = C.user && C.user.uid;
    const rows = D.items.slice(B.page * PER, B.page * PER + PER);
    const cut = (s, wd, sz) => { const a = ui.wrap(s, wd, sz, true); return a.length > 1 ? a[0] + '…' : a[0] || ''; };
    rows.forEach((x, j) => {
      const y = 129 + j * 11.5, n = B.page * PER + j + 1, mine = x.uid === me;
      if (mine) ui.rect(CX, y, CW, 11, 'rgba(246,220,146,0.16)');
      else if (j % 2 === 0) ui.rect(CX, y, CW, 11, 'rgba(0,0,0,0.16)');
      const col = n === 1 ? '#ffd24a' : n === 2 ? '#d6d2c8' : n === 3 ? '#e09a5a' : TXT;
      if (n <= 3) medal(cx.rank + 3, y + 5.5, n); // ba người đầu: huy chương vàng, bạc, đồng
      else ui.text(String(n), cx.rank + 3, y + 8.5, { size: 7.5, align: 'center', color: col });
      ui.text(cut(x.name || 'Khách', 140, 7.5), cx.name, y + 8.5, { size: 7.5, bold: mine, color: mine ? GOLD : TXT });
      ui.text(fmt(B.cat, x), cx.val + 38, y + 8.5, { size: 7.5, bold: true, align: 'right', color: col });
      ui.text(cut(heroName(x.hero) + ' · ' + C.farText(x.far || 0), CW - 218, 7), cx.extra, y + 8.5, { size: 7, color: SOFT });
    });
    if (!rows.length) ui.text(D.loading ? 'Đang tải bảng…' : D.err || 'Chưa có ai trên bảng này. Con lên đầu tiên đi!', CX + CW / 2, 170, { size: 8, align: 'center', color: D.err ? '#ff9a5a' : SOFT });
    // dòng của mình (luôn hiện)
    const mine = Object.assign({}, entry(), C.myScore || {});
    const E = entry();
    mine.power = Math.max(mine.power || 0, E.power); mine.stars = Math.max(mine.stars || 0, E.stars); mine.far = Math.max(mine.far || 0, E.far);
    for (const k of C.BOSSES) { const a = mine['b_' + k], b = E.b[k]; mine['b_' + k] = a && b ? Math.min(a, b) : a || b; }
    mine.name = E.name; mine.hero = mine.hero || E.hero;
    const at = D.items.findIndex((x) => x.uid === me);
    T.inset(CX, 224, CW, 15, true);
    ui.text(at >= 0 ? String(at + 1) : '-', cx.rank + 3, 234.5, { size: 7.5, bold: true, align: 'center', color: GOLD });
    ui.text(cut('Con: ' + mine.name, 140, 7.5), cx.name, 234.5, { size: 7.5, bold: true, color: GOLD });
    ui.text(fmt(B.cat, mine), cx.val + 38, 234.5, { size: 7.5, bold: true, align: 'right', color: GOLD });
    ui.text(at >= 0 ? 'hạng ' + (at + 1) : D.more ? 'ngoài ' + D.items.length + ' dòng đã tải' : 'ngoài ' + MAX + ' người đầu', cx.extra, 234.5, { size: 7, color: SOFT });
    // hàng nút dưới cùng
    if (pages > 1) {
      if (T.sbtn(CX, 243, 24, 18, '‹', { size: 10, pad: 3, disabled: B.page === 0 })) B.page--;
      ui.text('Trang ' + (B.page + 1) + (D.more ? '' : '/' + pages), CX + 50, 255, { size: 7.5, align: 'center', color: SOFT });
      if (T.sbtn(CX + 76, 243, 24, 18, '›', { size: 10, pad: 3, disabled: B.page >= pages - 1 || (D.loading && B.page * PER + PER >= D.items.length) })) B.page++;
    }
    if (T.sbtn(CX + 150, 243, 72, 18, 'Đổi tên', { size: 7.5, pad: 2 }) && G.cloudUI) {
      G.cloudUI.rename(mine.name, cleanName).then((v) => { if (v) { G.save.lbName = v; G.persist(); B.sync(true); B.reload(); A.say('Đổi tên thành ' + v + '.'); } });
    }
    if (T.sbtn(CX + 228, 243, 76, 18, 'Tải lại', { size: 7.5, pad: 2 })) B.reload();
    return 'Bảng vàng của làng: ai mạnh nhất, nhiều sao nhất, hạ trùm nhanh nhất đều được ghi tên.';
  };
  if (G.villageApi && G.villageApi.PANELS) {
    G.villageApi.PANELS.rank = function () { G.villageApi.frame('Gốc đa: bảng vàng'); G.villageApi.doTabs(); return B.panel(160, 304); };
  }
  // về làng: ghi nhận Sức mạnh mới và đẩy bảng (nếu có gì tốt hơn)
  if (G.Village) {
    const baseEnter = G.Village.enter;
    G.Village.enter = function () { const r = baseEnter.apply(this, arguments); try { B.sync(); } catch (e) { /* bỏ qua */ } return r; };
  }
})();
