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
  function cats() {
    const a = [['power', 'Sức mạnh'], ['stars', 'Sao']];
    for (const R of G.REGIONS) a.push(['b_' + R.boss, R.bossName]);
    return a;
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
  function heroName(k) { return G.HEROES[k] ? G.HEROES[k].name : ''; }

  // ---------- bảng vẽ (Cụ Đồ, thẻ Bảng vàng). CX, CW: vùng nội dung của bảng làng ----------
  B.panel = function (CX, CW) {
    const A = G.villageApi;
    const list = cats();
    const w = Math.floor((CW - (list.length - 1) * 3) / list.length);
    list.forEach(([k, n], i) => { if (T.sbtn(CX + i * (w + 3), 95, w, 18, n, { size: 7.5, pad: 2, sel: B.cat === k })) { B.cat = k; B.page = 0; } });
    if (!C.online()) {
      const r = rec(), sv = G.save;
      T.inset(CX, 120, CW, 92, false);
      ui.para('Bảng vàng cần mạng. ' + C.label() + '.', CX + 6, 134, CW - 12, { size: 8, color: TXT });
      ui.text('Kỷ lục của con (trên máy):', CX + 6, 162, { size: 8, bold: true, color: GOLD });
      ui.text('Sức mạnh ' + (r.power || powerNow()) + ' · ' + C.starSum(sv) + ' sao · xa nhất ' + C.farText(C.far(sv)), CX + 6, 175, { size: 7.5, color: TXT });
      ui.text(G.REGIONS.map((R) => R.bossName + ' ' + (r.b[R.boss] ? secs(r.b[R.boss]) : '-')).join(' · '), CX + 6, 188, { size: 7.5, color: TXT });
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
    ui.text('#', cx.rank, 125, { size: 7, color: SOFT }); ui.text('Tên', cx.name, 125, { size: 7, color: SOFT });
    ui.text(colName, cx.val + 38, 125, { size: 7, color: SOFT, align: 'right' }); ui.text('Hero · xa nhất', cx.extra, 125, { size: 7, color: SOFT });
    const me = C.user && C.user.uid;
    const rows = D.items.slice(B.page * PER, B.page * PER + PER);
    const cut = (s, wd, sz) => { const a = ui.wrap(s, wd, sz, true); return a.length > 1 ? a[0] + '…' : a[0] || ''; };
    rows.forEach((x, j) => {
      const y = 129 + j * 11.5, n = B.page * PER + j + 1, mine = x.uid === me;
      if (mine) ui.rect(CX, y, CW, 11, 'rgba(246,220,146,0.16)');
      else if (j % 2 === 0) ui.rect(CX, y, CW, 11, 'rgba(0,0,0,0.16)');
      const col = n === 1 ? '#ffd24a' : n === 2 ? '#d6d2c8' : n === 3 ? '#e09a5a' : TXT;
      ui.text(String(n), cx.rank, y + 8.5, { size: 7.5, bold: n <= 3, color: col });
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
    ui.text(at >= 0 ? String(at + 1) : '-', cx.rank, 234.5, { size: 7.5, bold: true, color: GOLD });
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
