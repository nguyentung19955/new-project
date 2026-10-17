// Làng: cảnh làng có người (js/village_scene.js). Mỗi chức năng là một người đứng cạnh công trình của mình:
//   Chú Lái Đò: tranh bản đồ vùng, chọn ải, độ khó, nút "Lên đò"      Ông Thợ Rèn: lò rèn (Mài, Linh khí — nâng 4 vũ khí, Nâng lò)
//   Bà Hàng Xén: đổi vàng lấy nguyên liệu vùng đã qua
//   Cô Thợ May: bán (thẻ Mua, vàng) và nâng cấp bộ trang phục Zed (bảng ở js/vk_moi_lang.js)
//   Cụ Đồ: cây kỹ năng, đặt lại điểm, hướng dẫn                         Ông Từ: xem chỉ số Zed, nét ba bạn đã dạy
//   Anh Mõ: cài đặt                                                     Chạm vũ khí sống đang bay theo: xem vũ khí
//   Nút túi vải góc trên bên phải: Hành trang (js/hanh_trang.js), gom nhân vật, vũ khí, kỹ năng, tài nguyên
// Đợt 2 (YEU-CAU-2-DON-CU.md): bỏ Nâng bậc, Tôi lại, Rèn đồ, rương vũ khí, mua / bán đồ, chọn em bé (luật cũ, cờ ?hethongcu=1, ?zed=0).
// Bảng nằm bên phải, người đứng bên trái và nói một câu. Hình vẽ theo chủ đề trống đồng (js/ui_theme.js).
(function () {
  const G = window.G, ui = G.ui, T = G.theme, VS = G.villageScene;
  const V = { tab: 'hub', who: null, sel: null, ftab: 'sharpen', node: null, page: 0, confirm: false, diff: 0, msg: null, msgT: 0, wid: null, back: 'hub', dtab: 'skill' };
  const TAB_OF = { lai: 'map', ren: 'forge', xen: 'gear', may: 'outfit', do: 'skill', tu: 'hero', mo: 'settings' };
  const WHO_OF = { map: 'lai', forge: 'ren', gear: 'xen', outfit: 'may', skill: 'do', chuong: 'do', help: 'do', rank: 'do', hero: 'tu', settings: 'mo',
    so: 'tu', thanhTuu: 'tu', viecNgay: 'mo' }; // Bước 2 (Phiên 0): thẻ Sổ yêu quái, Thành tựu (Ông Từ), Việc hôm nay (Anh Mõ)
  // Khung bảng bên phải và vùng nội dung bên trong
  const PX = 152, PY = 46, PW = 320, PH = 220, CX = 160, CW = 304;
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';

  function say(s) { V.msg = s; V.msgT = 2.5; }
  // Dấu thập phân trong con số hiển thị: tiếng Việt dùng dấu phẩy (x1,15), tiếng Anh dùng dấu chấm (x1.15)
  const dp = () => (G.LANG === 'en' ? '.' : ',');
  // V25 (chữ to hơn): đoạn chữ trong khung cố định — vượt quá maxLines dòng thì vẽ cỡ nhỏ cũ để không lọt khỏi khung
  function fitPara(str, x, y, w, o, maxLines) { return ui.para(str, x, y, w, Object.assign({}, o, { tiny: ui.wrap(str, w, o.size, o.bold).length > maxLines })); }
  function canPay(c) {
    const sv = G.save;
    if (!c) return true;
    if (c.gold && sv.gold < c.gold) return false;
    if (c.ore && sv.ore < c.ore) return false;
    if (c.stones && sv.stones < c.stones) return false;
    if (c.mat) for (let i = 0; i < 3; i++) if (sv.mats[i] < (c.mat[i] || 0)) return false;
    if (c.shard) for (let i = 0; i < 3; i++) if (sv.shards[i] < (c.shard[i] || 0)) return false;
    return true;
  }
  function pay(c) {
    const sv = G.save;
    sv.gold -= c.gold || 0; sv.ore -= c.ore || 0; sv.stones -= c.stones || 0;
    if (c.mat) for (let i = 0; i < 3; i++) sv.mats[i] -= c.mat[i] || 0;
    if (c.shard) for (let i = 0; i < 3; i++) sv.shards[i] -= c.shard[i] || 0;
  }
  function costText(c) {
    const a = [];
    if (c.gold) a.push(G.t('{0} vàng', c.gold));
    if (c.ore) a.push(G.t('{0} quặng', c.ore));
    if (c.stones) a.push(G.t('{0} đá tôi', c.stones));
    if (c.mat) c.mat.forEach((n, i) => { if (n) a.push(G.t('{0} {1}', n, G.REGIONS[i].mat.toLowerCase())); });
    if (c.shard) c.shard.forEach((n, i) => { if (n) a.push(G.t('{0} mảnh {1}', n, G.REGIONS[i].bossName)); });
    return a.join(', ');
  }
  // Mở bảng của một người (k: lai, ren, xen, may, do, tu, mo)
  function open(k) {
    V.who = k; V.tab = TAB_OF[k]; V.sel = null; V.page = 0; V.confirm = false; V.node = null; V.msgT = 0; V.cd2 = false;
    if (k === 'do') {
      V.tab = V.dtab === 'help' || (V.dtab === 'chuong' && chuongOpen()) || (V.dtab === 'rank' && PANELS.rank && theMoDan('rank')) ? V.dtab : 'skill';
      if (V.tab === 'skill' && !theMoDan('skill')) V.tab = 'help'; // mở dần (js/mo_dan.js): người mới chỉ có thẻ Hướng dẫn
      // V29 (O7): thẻ Cây kỹ năng hết điểm mà còn điểm chưởng thì mở thẳng thẻ Cây chưởng, khỏi thấy "Còn 0 điểm"
      if (V.tab === 'skill' && chuongOpen() && G.chuong) {
        const sv = G.save, hs = sv.heroes[sv.hero];
        if (Math.floor(hs.lvl / 3) - (hs.sk.atk + hs.sk.def + hs.sk.elem) <= 0 && G.chuong.pts(hs, sv.hero).left > 0) V.tab = 'chuong';
      }
    }
    if (k === 'lai') pickNext();
    if (k === 'tu') V.tab = V.ttab && theMo(V.ttab) ? V.ttab : 'hero'; // Bước 2: nhớ thẻ vừa xem ở Ông Từ
    if (k === 'mo') V.tab = theMo('viecNgay') ? 'viecNgay' : 'settings'; // Bước 2: Việc hôm nay là thẻ đầu của Anh Mõ (có thì mở trước)
  }
  // V53: thẻ Cây chưởng chỉ hiện sau khi qua ải đầu tiên (người mới làm quen Cây kỹ năng trước)
  function chuongOpen() { return Object.keys(G.save.stars || {}).length >= 1 && theMoDan('chuong'); }
  // Tư vấn 16/10: thẻ / bảng đã tới mốc mở chưa (js/mo_dan.js; ?modan=0 hay bản lưu cũ: luôn mở)
  function theMoDan(tab) { return !G.moDan || G.moDan.the(tab); }
  function goHub() {
    const was = V.tab;
    V.tab = 'hub'; V.who = null; V.sel = null; V.node = null; V.confirm = false; V.page = 0;
    if (was !== 'hub' && was !== 'title' && was !== 'weapon') VS.closeTalk();
    VS.state.talk = null;
  }
  G.villageApi = { canPay, pay, V, open, goHub, TAB_OF };

  // ---------- BƯỚC 2 (Phiên 0): hàng thẻ của Ông Từ (Cu Tí | Sổ | Thành tựu) và Anh Mõ (Việc hôm nay | Cài đặt) ----------
  // Thẻ nằm trên băng tiêu đề của bảng (như Bà Hàng Xén), bên trái nút "✕ Xong". Hàm vẽ từng thẻ ở PANELS (so, thanhTuu, viecNgay);
  // Phiên 0 để hàm RỖNG (cờ .rong = true → thẻ không hiện). Phiên A / C / B chỉ cần gán đè hàm của mình:
  //   PANELS.so = function () { VA.khungThe('tu', 'Sân đình: sổ yêu quái'); …vẽ trong CX..CX+CW, y 68..262…; return 'câu ông Từ nói'; };
  //   PANELS.so.mo = (sv) => true/false   (thẻ mở chưa — tuỳ chọn)       PANELS.so.cham = (sv) => true/false   (chấm đỏ: có thưởng chờ nhận)
  // Cờ ?sukien=0 (G.SU_KIEN_BAT = false) hay thiếu js/su_kien.js: mọi thẻ Bước 2 ẩn, Ông Từ / Anh Mõ y như cũ.
  const THE_NGUOI = {
    tu: [['hero', () => G.HEROES.smith.name], ['so', 'Sổ'], ['thanhTuu', 'Thành tựu']],
    mo: [['viecNgay', 'Việc hôm nay'], ['settings', 'Cài đặt']],
  };
  const THE_B2 = { so: 1, thanhTuu: 1, viecNgay: 1 };
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({ 'Sân đình': 'Village Yard', 'Cổng làng': 'Village Gate', 'Sổ': 'Book', 'Thành tựu': 'Achievements', 'Việc hôm nay': "Today's jobs", 'Đang soạn…': 'Coming soon…' });
  function theMo(k) {
    if (!THE_B2[k]) return true;
    if (!theMoDan(k)) return false; // mở dần: Sổ, Thành tựu, Việc hôm nay mở sau Hang biển 1 (js/mo_dan.js)
    const fn = PANELS[k];
    if (!fn || fn.rong || !(G.suKien && G.suKien.bat && G.suKien.bat())) return false;
    try { return typeof fn.mo !== 'function' || !!fn.mo(G.save); } catch (e) { return false; }
  }
  const theCua = (who) => (THE_NGUOI[who] || []).filter((t) => theMo(t[0]));
  // Vẽ khung bảng + hàng thẻ. dai: tiêu đề khi KHÔNG có hàng thẻ (giữ y như cũ); có thẻ thì tiêu đề ngắn cho đủ chỗ.
  function khungThe(who, dai) {
    const tabs = theCua(who);
    if (tabs.length < 2) { frame(dai); return false; }
    const tit = who === 'tu' ? 'Sân đình' : 'Cổng làng';
    frame(tit);
    const sv = G.save, ten = tabs.map((t) => G.tv(typeof t[1] === 'function' ? t[1]() : t[1]));
    ui.font(11, true);
    const conCho = PW - 70 - (Math.ceil(G.ux.measureText(G.tv(tit)).width) + 22) - (tabs.length - 1) * 2;
    ui.font(7.5, true);
    const muon = ten.map((s) => Math.ceil(G.ux.measureText(s).width) + 22);
    const tong = muon.reduce((a, b) => a + b, 0), k = tong > conCho ? conCho / tong : 1;
    const rong = muon.map((w) => Math.max(26, Math.floor(w * k)));
    let x = PX + PW - 70 - rong.reduce((a, w) => a + w + 2, 0);
    tabs.forEach((t, i) => {
      const fn = PANELS[t[0]];
      let dot = false;
      try { dot = THE_B2[t[0]] && !!(fn && typeof fn.cham === 'function' && fn.cham(sv)); } catch (e) { dot = false; }
      if (T.sbtn(x, PY + 3, rong[i], 17, ten[i], { size: 7, pad: 2, sel: V.tab === t[0], dot }) && V.tab !== t[0]) {
        V.tab = t[0]; if (who === 'tu') V.ttab = t[0];
        V.page = 0; V.sel = null; V.confirm = false; V.cd2 = false; G.sfx('ui');
      }
      x += rong[i] + 2;
    });
    return true;
  }
  // Hàm rỗng giữ chỗ cho Phiên A (so), C (thanhTuu), B (viecNgay): cờ .rong → thẻ không hiện
  function theRong(who, dai) {
    const f = function () { khungThe(who, dai); ui.para('Đang soạn…', CX + 4, 96, CW - 8, { size: 8, color: SOFT }); return ''; };
    f.rong = true;
    return f;
  }
  Object.assign(G.villageApi, { THE_NGUOI, theMo, theCua, khungThe });
  VS.onTalk = open;
  VS.onWeapon = (id) => viewWeapon(id, 'hub');

  function frame(title) {
    T.panel(PX, PY, PW, PH, title, { rightPad: 74, noBand: true });
    if (T.sbtn(PX + PW - 66, PY + 3, 60, 17, '✕ Xong', { size: 8, pad: 5 })) goHub();
  }
  // Nút lật trang: ‹ Trang 1/3 ›. Trả về số trang.
  function pager(n, per, x, y) {
    const pages = Math.max(1, Math.ceil(n / per));
    V.page = G.clamp(V.page, 0, pages - 1);
    if (pages > 1) {
      const r = 2; // chu-lech-khung: nút ảnh rộng 26 thì hai đinh góc trong dồn vào giữa, đè lên mũi tên → rộng 30 (cùng tâm)
      if (T.sbtn(x - r, y - 1, 26 + r * 2, 18, '‹', { size: 10, pad: 4 })) V.page = (V.page + pages - 1) % pages;
      ui.text(G.t('Trang {0}/{1}', V.page + 1, pages), x + 50, y + 11.5, { size: 7.5, align: 'center', color: SOFT });
      if (T.sbtn(x + 74 - r, y - 1, 26 + r * 2, 18, '›', { size: 10, pad: 4 })) V.page = (V.page + 1) % pages;
    }
    return pages;
  }
  // Người đứng bên trái bảng và nói một câu (lời nhắn tạm thời thì nói thay câu thường)
  function npcSide(text) {
    const k = V.who || WHO_OF[V.tab];
    if (!k) return;
    const N = VS.NPCS[k];
    VS.bigNpc(G.ux, k, 78, 262, 3, Math.floor(G.time * 2) % 3);
    T.dialog(8, 64, 138, N.ten, V.msgT > 0 && V.msg ? V.msg : text || N.chao, { tail: 58 });
  }

  // ---------- bản đồ vùng dạng tranh vẽ (Chú Lái Đò) ----------
  function unlocked(r, i, diff) {
    const map = diff ? G.save.stars2 : G.save.stars;
    if (diff && Object.keys(G.save.stars).length < 15) return false;
    if (diff && r >= 3 && !G.save.stars[r + '-4']) return false; // vùng 4 (Q8 = A): độ khó 2 mở khi đã hạ trùm vùng đó (Độ khó 2 ba vùng đầu như cũ)
    if (r === 0 && i === 0) return true;
    const pr = i === 0 ? r - 1 : r, pi = i === 0 ? 4 : i - 1;
    return !!map[pr + '-' + pi];
  }
  // Chọn sẵn ải đang tới: ải đã mở đầu tiên chưa có sao
  function pickNext() {
    const map = V.diff ? G.save.stars2 : G.save.stars;
    V.sel = null;
    for (let r = 0; r < G.REGIONS.length && !V.sel; r++) for (let i = 0; i < 5; i++) if (unlocked(r, i, V.diff) && !map[r + '-' + i]) { V.sel = [r, i]; break; }
    if (!V.sel) V.sel = [0, 0];
    V.mapTrang = trangCua(V.sel[0]);
  }
  // Bản đồ hai trang (bước 3 phiên 1, G.VUNG4): trang 0 = tranh 3 vùng đầu như cũ, trang 1 = tranh Sông sâu (VS.MAP2 / VS.mapArt2, js/vung4.js).
  // ?vung4=0 hoặc chưa có VS.MAP2: chỉ một trang, y như cũ.
  const coTrang2 = () => !!(G.VUNG4 && G.REGIONS.length > 3 && VS.MAP2 && VS.mapArt2);
  const trangCua = (r) => (coTrang2() && r >= 3 ? 1 : 0);
  const vungTrang = (tr) => (tr === 1 ? [3] : [0, 1, 2]);
  function inkText(s, x, y, size, col, halo) { // chữ trên giấy: viền sáng quanh chữ
    const c = G.ux;
    ui.font(size, true); c.textAlign = 'center'; c.lineJoin = 'round'; c.lineWidth = size / 3.2; c.strokeStyle = halo || 'rgba(240,230,200,0.9)';
    c.strokeText(s, x, y);
    ui.text(s, x, y, { size, bold: true, align: 'center', color: col, shadow: false });
  }
  function mapScreen() {
    const tr2 = coTrang2() && V.mapTrang === 1 ? 1 : 0, DSV = vungTrang(tr2);
    const sv = G.save, c = G.wx, M = tr2 ? VS.MAP2 : VS.MAP, night = !!V.diff;
    const all = Object.keys(sv.stars).length >= 15;
    if (!all) V.diff = 0;
    const map = V.diff ? sv.stars2 : sv.stars;
    G.wxDat(c, 0, 0); c.globalAlpha = 1;
    c.drawImage(tr2 ? VS.mapArt2(night) : VS.mapArt(night), 0, 0);
    // đường nét đứt nối các ải theo thứ tự; chưa mở thì nhạt
    const ink = night ? '#3a2a4a' : '#7a4a30', faint = night ? '#6a6488' : '#b8a880';
    for (const r of DSV) {
      const n = M.nodes[r];
      VS.mapDash(c, M.from[r], n[0], unlocked(r, 0, V.diff) ? ink : faint, !unlocked(r, 0, V.diff));
      if (r === 2) VS.mapDash(c, M.nodes[1][4], n[0], unlocked(2, 0, V.diff) ? ink : faint, !unlocked(2, 0, V.diff));
      for (let i = 0; i < 4; i++) VS.mapDash(c, n[i], n[i + 1], unlocked(r, i + 1, V.diff) ? ink : faint, !unlocked(r, i + 1, V.diff));
    }
    for (const d of tr2 ? [] : M.soonDash || []) VS.mapDash(c, M.nodes[d[0]][d[1]], d[2], faint, true);
    VS.putNpc(c, 'lai', 32, 264, Math.floor(G.time * 2) % 3, { look: 1, noShadow: true }, 2);
    // tên vùng, tên trùm, vùng sắp có
    const halo = night ? 'rgba(20,16,40,0.85)' : null;
    inkText('Làng', M.lang ? M.lang[0] : 36, M.lang ? M.lang[1] : 110, 8, night ? '#e8dcc0' : '#4a3626', halo);
    for (const r of DSV) {
      const q = M.names[r], R = G.REGIONS[r], b = M.nodes[r][4];
      inkText(R.name, q[0], q[1], 10, night ? '#f1e6c6' : q[2], halo);
      const bl = M.bossLab ? M.bossLab[r] : [r === 2 ? 40 : 38, r === 2 ? -6 : 3];
      inkText(R.bossName, b[0] + bl[0], b[1] + bl[1], 6.5, night ? '#e8dcc0' : '#4a3626', halo);
    }
    for (const q of M.soon || []) {
      inkText(q[0], q[1], q[2], 8, night ? '#8a86a8' : '#8a7a58', halo);
      const px = q[3] || q[1], py = q[4] || q[2] + 12;
      ui.font(6.5, true);
      { // chu-lech-khung: tấm gỗ rộng theo chữ (32 quá hẹp cho "sắp có" / "coming soon"), chữ trong lòng tấm
        const nhan = G.tc('bản đồ', 'sắp có'), tw = G.ux.measureText(nhan).width, ww = Math.max(32, Math.ceil(tw + 14));
        const go = T.theSapCo && T.theSapCo(px - ww / 2, py - 7, ww, 10);
        if (!go) ui.rect(px - ww / 2, py - 7, ww, 10, 'rgba(74,54,38,0.85)');
        T.chuTrongKhung(nhan, px - ww / 2, py - 7, ww, 10, { khung: go ? 'gd-the-sap-co' : null, vien: [1, 2, 1, 2], size: 6.5, bold: true, color: '#f0e6c8', shadow: go ? undefined : false });
      }
    }
    // 15 thẻ ải mặt trống; ải chưa qua ghi sức mạnh khuyên dùng, tô màu so với sức mạnh của bé (xanh đủ, vàng sát nút, đỏ thiếu)
    const pw = G.power();
    let hit = null, hd = 19;
    for (const r of DSV) for (let i = 0; i < 5; i++) {
      const q = M.nodes[r][i], st = map[r + '-' + i] || 0, ok = unlocked(r, i, V.diff), boss = i === 4, rad = boss ? 12 : 10;
      const selc = V.sel && V.sel[0] === r && V.sel[1] === i;
      T.stageCard(q[0] - 20, q[1] - rad - 4, 40, 36, i + 1, !ok ? 'lock' : selc ? 'sel' : st ? 'done' : 'open', st, { r: rad, boss, noClick: true, noStars: true });
      const duoi = T.theDuoi ? T.theDuoi(boss) : null, ty = q[1] + (duoi != null ? duoi + 5 : rad + 8.5); // 14/10: thẻ bia đá ảnh cao hơn trống cũ
      if (ok && st) inkText('★'.repeat(st) + '☆'.repeat(3 - st), q[0], ty, 6.5, '#ffd23f', 'rgba(74,54,38,0.95)');
      else if (ok && !selc) { const need = G.stageRec(r, i, V.diff); inkText('⚔' + need, q[0], ty, 6.5, G.powerCol(pw, need), 'rgba(40,28,20,0.92)'); }
      if (ok && G.click) { const d = Math.hypot(G.click.x - q[0], G.click.y - q[1]); if (d < hd) { hd = d; hit = [r, i]; } }
    }
    if (hit && !(G.click.x > 246 && G.click.y > 206)) { V.sel = hit; G.click = null; G.sfx('ui'); }
    // em bé đứng ở ải đang chọn
    if (V.sel && trangCua(V.sel[0]) === tr2) {
      const q = M.nodes[V.sel[0]][V.sel[1]], rad = V.sel[1] === 4 ? 12 : 10;
      G.art.hero(G.ux, { x: q[0], y: q[1] - rad + 1, face: 1, key: sv.hero, move: false, t: G.time, atk: -1, dodge: -1, weapon: null, noShadow: true });
      VS.bubble(V.sel[1] === 4 ? G.t('Trùm {0}', G.REGIONS[V.sel[0]].bossName) : G.t('Ải {0}', V.sel[1] + 1), q[0], q[1] - rad - 26, { bg: '#ffe9a8', size: 7.5 });
    }
    VS.bubble(V.msgT > 0 && V.msg ? V.msg : V.sel ? 'Lên đò đi cháu, nước đang êm.' : 'Đi đâu hả cháu?', 40, 198, { maxW: 76, size: 7.5 });
    if (T.sbtn(404, 7, 68, 18, '✕ Về làng', { size: 8, pad: 4 })) { goHub(); return; }
    // vùng 4: nút sang trang bản đồ Sông sâu / về trang ba vùng đầu (chấm đỏ khi vùng 4 vừa mở mà chưa qua ải nào)
    if (coTrang2()) {
      const moi = !tr2 && unlocked(3, 0, 0) && !sv.stars['3-0'];
      if (T.sbtn(404, 53, 68, 18, tr2 ? '‹ Ba vùng đầu' : G.t('{0} ›', G.REGIONS[3].name), { size: 7.5, pad: 3, dot: moi })) { V.mapTrang = tr2 ? 0 : 1; G.sfx('ui'); return; }
    }
    // Đợt 6: cổng Ải ngày (js/ai_ngay.js) — mở sau khi hạ trùm vùng 1; chấm đỏ khi hôm nay còn lượt
    if (G.aiNgay && G.aiNgay.bat() && G.aiNgay.mo(sv) && T.sbtn(404, 30, 68, 18, 'Ải ngày', { size: 8, pad: 4, dot: G.aiNgay.coLuot(sv) })) { V.tab = 'aingay'; G.sfx('ui'); return; }
    if (all) {
      const dk = M.doKho || [330, 182];
      if (T.sbtn(dk[0], dk[1], 142, 19, V.diff ? 'Độ khó 2 (chạm để đổi)' : 'Độ khó thường (chạm để đổi)', { size: 7.5, pad: 3, sel: !!V.diff })) { V.diff = V.diff ? 0 : 1; pickNext(); }
    }
    // thẻ thông tin ải và nút Lên đò
    T.panel(248, 206, 226, 60, null, { plain: true, noBand: true });
    if (V.sel) {
      const r = V.sel[0], i = V.sel[1], R = G.REGIONS[r], b = G.stageStats(r, i, V.diff);
      ui.text(G.t(V.diff ? '{0} · {1} · khó 2' : '{0} · {1}', R.name, i === 4 ? 'Ải trùm' : G.t('Ải {0}', i + 1)), 256, 220, { size: 9.5, bold: true, color: GOLD }); // chu-lech-khung: +1 cho dấu chữ không chạm viền trên
      const l2 = G.t('{0} · 8 phòng · ', i === 4 ? G.t('Trùm {0}', R.bossName) : G.t('Trùm nhỏ {0}', R.mini));
      // 15/10 sua-lang-npc: dòng dài (tiếng Anh "Mini-boss … · Poison") lấn vào dưới nút Lên đò (x 404) → giữ cỡ nhỏ cũ 6,5 cho vừa
      const l3 = G.t('hệ {0}', G.EL[R.el].name);
      //   (cỡ 6,5 vẫn dài hơn chỗ trống thì ép ngang vừa đúng chỗ, không cắt chữ)
      const rong2 = (tn) => { ui.font(7, false, tn); return G.ux.measureText(l2).width + G.ux.measureText(l3).width; }, cho2 = 404 - 8 - 256;
      const nho = rong2(false) > cho2, ep = nho ? Math.min(1, cho2 / rong2(true)) : 1, cx2 = G.ux;
      cx2.save(); cx2.translate(256, 0); cx2.scale(ep, 1);
      ui.text(l2, 0, 230, { size: 7, color: TXT, tiny: nho });
      ui.font(7, false, nho); ui.text(l3, G.ux.measureText(l2).width, 230, { size: 7, color: G.EL[R.el].col, tiny: nho });
      cx2.restore();
      // Sức mạnh khuyên dùng so với sức mạnh hiện tại của bé (G.power): xanh đủ, vàng sát nút, đỏ thiếu
      const need = G.stageRec(r, i, V.diff), col = G.powerCol(pw, need);
      ui.text(G.t('Sức mạnh khuyên dùng {0} · bé {1}', need, pw), 256, 240, { size: 7.5, bold: true, color: col });
      // V25: chữ to hơn; dòng thưởng dài quá 2 dòng (ải trùm) thì giữ cỡ nhỏ cũ để không lọt khỏi khung
      const matTen = (G.matAi ? G.REGIONS[G.matAi(r, i)] : R).mat.toLowerCase(); // vùng 4: nguyên liệu của một vùng cũ theo ải
      const rw = i === 4 ? G.t('Thưởng: {0} kinh nghiệm, ~{1} vàng, {2} {3}, {4} mảnh {5}, linh khí', b.xp, b.gold, 5 + i, matTen, V.diff ? 4 : 3, R.bossName) : G.t('Thưởng: {0} kinh nghiệm, ~{1} vàng, {2} {3}', b.xp, b.gold, 5 + i, matTen);
      ui.para(rw, 256, 250.5, 144, { size: 6.5, color: SOFT, tiny: ui.wrap(rw, 144, 6.5).length > 2 });
      // 14/10 (bước 1, mục 1): chọn ải là bắt đầu tải ảnh riêng của vùng đó (js/sprite_custom.js SC.taiVung). Chưa đủ ảnh: nút ghi "Đang tải…"
      // và thanh tiến độ dưới nút; bấm vẫn được (vào màn chờ, đủ ảnh thì tự vào ải).
      const SCv = G.spriteCustom, tv = SCv && SCv.vungTien ? (SCv.taiVung(r), SCv.vungTien(r, i === 4)) : null, choTai = !!(tv && !tv.san);
      if (choTai) { ui.rect(404, 258, 64, 4, 'rgba(0,0,0,0.55)'); ui.rect(404, 258, Math.round(64 * tv.xong / Math.max(1, tv.tong)), 4, '#ffd27a'); }
      if (T.btn(404, 217, 64, 38, choTai ? 'Đang tải…' : 'Lên đò', { size: choTai ? 8.5 : 11, primary: true, trongVien: true })) G.startStage(r, i, V.diff);
    } else ui.text('Chạm một ải trên tranh để xem.', 256, 238, { size: 8, color: SOFT });
  }

  // ---------- xem một vũ khí: bậc, dòng phụ, đặc trưng hệ đã mở và sắp mở ----------
  function viewWeapon(id, back) { V.wid = id; V.back = back || 'hub'; V.tab = 'weapon'; G.sfx('ui'); }
  function weaponView() {
    const sv = G.save, w = G.weaponById(V.wid);
    T.panel(8, 26, 464, 240, 'Xem vũ khí', { rightPad: 90, noBand: true });
    if (T.sbtn(396, 29, 70, 17, '← Quay lại', { size: 8, pad: 4 }) || !w) { V.tab = V.back; if (V.tab === 'hub') goHub(); return; }
    const st = G.wStage(w), rar = { col: G.bacMauVk(w), maxStage: 3 }; // 14/10: màu tên theo bậc ép đồ (bỏ bậc màu cũ G.RARITY)
    // ô hình lớn (bộ zed-vk, js/vk_moi.js), khung theo bậc ép đồ; không còn bậc màu, dòng vũ khí, dòng phụ (đợt 1–2)
    G.oBacVk(18, 56, 70, w);
    G.art.weaponIcon(G.ux, w, 53, 91, 54, 'idle');
    if (G.LANG === 'vi') ui.text(G.wName(w), 96, 68, { size: 10.5, bold: true, color: rar.col });
    else { const q = T.vua(G.wName(w), 150, 10.5, true); ui.text(q[0], 96, 68 + (q[1] - 10.5) * 0.36, { size: q[1], bold: true, color: rar.col }); } // tên tiếng Anh dài: thu cỡ chữ cho khỏi lấn cột bên phải
    ui.text(G.t('{0} · {1}', G.WTYPES[w.type].name, G.STAGE_NAMES[st]), 96, 80, { size: 7.5, color: SOFT });
    const LY = !!(G.luyen && G.luyen.bat()); // 16/10 Luyện (js/luyen.js)
    ui.text(LY ? G.t('Sát thương mỗi đòn {0} · Luyện {1}/{2}', G.wBase(w, sv.heroes[sv.hero].lvl).toFixed(1).replace('.', dp()), G.luyen.cap(w), G.luyen.MAX) : G.t('Sát thương mỗi đòn {0} · mài +{1}', G.wBase(w, sv.heroes[sv.hero].lvl).toFixed(1).replace('.', dp()), w.sharpen | 0), 96, 102, { size: 7.5 });
    const mi = G.markInfo(w);
    ui.text(mi.txt, 96, 113, { size: 7.5, color: mi.col });
    ui.bar(96, 117, 146, 4, mi.frac, mi.col);
    if (LY) { // Luyện: cấp kế mở gì
      const mk = G.luyen.mocKe(w);
      ui.text(G.t('Linh khí đang có: {0}', Math.floor(G.vkMoi ? G.vkMoi.lk(sv) : 0)), 18, 140, { size: 8, bold: true, color: GOLD });
      ui.para(mk ? G.t('Cấp {0} mở: {1}', mk, G.luyen.moGi(w, mk)) : G.tv('Đã tối đa (cấp 15)'), 18, 152, 224, { size: 7, color: TXT });
    } else if (G.vkMoi) { // túi linh khí chung, nâng ở Ông Thợ Rèn
      const c = G.vkMoi.gia(st);
      ui.text(G.t('Linh khí đang có: {0}', Math.floor(G.vkMoi.lk(sv))), 18, 140, { size: 8, bold: true, color: GOLD });
      ui.para(c == null ? 'Vũ khí đã Thức tỉnh, mở đủ hai đặc trưng hệ.' : G.t('{0}. Cần {1} linh khí, nâng ở Ông Thợ Rèn, thẻ Linh khí.', G.vkMoi.moTiep(w), c), 18, 152, 224, { size: 7, color: TXT });
    }
    // đặc trưng hệ theo cấp
    const x0 = 250;
    T.head('Đặc trưng hệ theo cấp', x0, 68);
    const el = w.branch, E = el ? G.EL[el] : null;
    if (!el) ui.para(LY ? G.tv('Chưa có hệ. Luyện lên cấp 3 (Mầm) ở Ông Thợ Rèn và chọn Lửa, Độc hoặc Băng.') : G.t('Chưa có hệ. Lên Mầm bằng {0} linh khí ở Ông Thợ Rèn và chọn Lửa, Độc hoặc Băng.', G.VK_MOI.gia[0]), x0, 80, 212, { size: 7, color: SOFT });
    const rows = [
      ['Trắng', 'Chưa mang hệ. Hạ tinh anh, trùm hoặc nhặt viên linh khí quái thường rơi để có linh khí, rồi lên Mầm ở Ông Thợ Rèn.'],
      ['Mầm', G.t('Chỉ số tăng. {0}% mỗi đòn gây {1}, vệt chém nhuốm màu hệ. Chưa có luật hệ.', Math.round(G.PROC[1] * 100), el ? (el === 'fire' ? 'cháy' : el === 'poison' ? 'độc' : 'chậm') : 'hiệu ứng hệ')],
      ['Thành hình', null, 0],
      ['Thức tỉnh', null, 1],
    ];
    let ry = el ? 78 : 110;
    rows.forEach((q, i) => {
      const got = st >= i, locked = i > rar.maxStage;
      const h = i < 2 ? (el ? (i ? 34 : 23) : 0) : (el ? 44 : 38);
      if (!h) return;
      T.inset(x0, ry, 214, h - 2, false, { fill: got ? '#24484a' : '#17302f', col: got && E ? E.dark : T.C.brD });
      const trangThai = locked ? 'Chưa mở' : got ? 'Đã mở' : LY ? G.t('Luyện cấp {0}', [1, G.LUYEN.hinhThai[0], G.LUYEN.hinhThai[1], G.LUYEN.hinhThai[2]][i]) : i === st + 1 && G.vkMoi ? G.t('Sắp mở: {0} linh khí', G.vkMoi.gia(st)) : 'Chưa mở';
      { // chu-lech-khung: tên cấp (trái) và trạng thái (phải) trong dải trên của lòng ô, tránh núm góc
        T.chuO(q[0], x0, ry, 214, h - 2, { align: 'left', vung: [x0, ry, 60, 14], size: 8, min: 7, bold: true, color: got && E ? E.col : SOFT });
        T.chuO(trangThai, x0, ry, 214, h - 2, { align: 'right', vung: [x0 + 120, ry, 94, 14], size: 6.5, bold: got, color: locked ? WARN : got ? GOOD : SOFT });
      }
      if (q[1]) fitPara(q[1], x0 + 5, ry + 19, 204, { size: 6.5, color: TXT }, 2);
      else if (el) {
        const f = G.HE_FEATURES[el][q[2]];
        ui.text(G.t('Đặc trưng {0}: {1}', q[2] + 1, f.name), x0 + 62, ry + 10, { size: 7.5, bold: true, color: got ? E.col2 : TXT });
        fitPara(f.desc, x0 + 5, ry + 20, 204, { size: 6.5, color: TXT }, 2);
      } else {
        ui.text(q[2] ? 'Đặc trưng 2: phản ứng dây chuyền' : 'Đặc trưng 1: thứ để lại trên sân', x0 + 5, ry + 21, { size: 7, color: TXT });
        ui.text(G.ELS.map((e) => G.t('{0}: {1}', G.EL[e].name, G.HE_FEATURES[e][q[2]].name)).join(' · '), x0 + 5, ry + 31, { size: 7, color: TXT, tiny: ui.wrap(G.ELS.map((e) => G.t('{0}: {1}', G.EL[e].name, G.HE_FEATURES[e][q[2]].name)).join(' · '), 204, 7).length > 1 });
      }
      ry += h;
    });
  }

  // ---------- lò rèn (Ông Thợ Rèn) ----------
  const ROWS = 4, PITCH = 23.5, LIST_Y = 94, DET_Y = 208;
  function weaponList(filter) {
    // vũ khí đang mang lên đầu, rồi tới bậc cao
    const carry = G.save.carry;
    const list = G.save.weapons.filter(filter || (() => true)).sort((a, b) => (carry.includes(b.id) - carry.includes(a.id)) || (G.wRar(b) - G.wRar(a)) || (a.id - b.id));
    pager(list.length, ROWS, CX + CW - 100, 189);
    list.slice(V.page * ROWS, V.page * ROWS + ROWS).forEach((w, k) => {
      const y = LIST_Y + k * PITCH;
      if (G.weaponLine(w, CX, y, CW, V.sel === w.id, carry.includes(w.id) ? 48 : 0)) { V.sel = w.id; G.click = null; G.sfx('ui'); }
      if (carry.includes(w.id)) T.chuO('đang mang', CX, y, CW, 22, { sel: V.sel === w.id, align: 'right', vung: [CX + CW - 50, y, 50, 12], size: 6.5, bold: false, color: GOOD });
    });
    ui.text(G.t('{0} vũ khí', list.length), CX + 2, 200.5, { size: 7, color: SOFT });
    // xem bảng linh khí (dấu ấn hệ) và đặc trưng của món đang chọn
    const sw = V.sel != null && G.weaponById(V.sel);
    if (sw && list.includes(sw) && T.sbtn(CX + 52, 190, 88, 16, 'Xem linh khí', { size: 7.5, pad: 3 })) viewWeapon(sw.id, 'forge');
    return list;
  }
  const actBtn = (label, o) => T.btn(CX + CW - 92, DET_Y + 9, 86, 34, label, Object.assign({ size: 11, primary: true, trongVien: true }, o));
  function forge() {
    const sv = G.save;
    let line = null; // câu ông thợ rèn nói
    const LY = !!(G.luyen && G.luyen.bat()); // 16/10 Luyện (js/luyen.js): một thẻ Luyện thay Mài / Linh khí / Ép đồ / Nâng lò
    frame(LY ? G.tv('Lò rèn') : G.t('Lò rèn cấp {0}', sv.forge));
    // Thẻ Linh khí nâng cấp 4 vũ khí (chọn hệ, đổi hệ; js/vk_moi.js). Đợt 2: bỏ hẳn Nâng bậc, Tôi lại, Rèn đồ của luật cũ.
    // Đợt 6: thêm thẻ "Ép đồ" (bậc vũ khí, js/ep_do.js); ?epdo=0 thì ẩn
    const coEp = !!(G.epDo && G.epDo.bat());
    // Tư vấn 16/10 (js/mo_dan.js): thẻ chưa tới mốc thì ẩn (Mài sau Rừng già 1, Linh khí sau Rừng già 3, Ép đồ + Nâng lò sau Mộc Tinh)
    const md = (t) => !G.moDan || G.moDan.ftab(t[0]);
    const tabs = (LY ? [['luyen', 'Luyện']] : coEp ? [['sharpen', 'Mài'], ['vk', 'Linh khí'], ['ep', 'Ép đồ'], ['up', 'Nâng lò']] : [['sharpen', 'Mài'], ['vk', 'Linh khí'], ['up', 'Nâng lò']]).filter(md);
    if (!tabs.length) tabs.push(LY ? ['luyen', 'Luyện'] : ['sharpen', 'Mài']);
    if (!tabs.some((t) => t[0] === V.ftab)) V.ftab = tabs.some((t) => t[0] === 'vk') ? 'vk' : tabs[0][0];
    const tp = tabs.length === 4 ? 76 : tabs.length === 3 ? 102 : Math.floor((CW + 3) / tabs.length), tw = tp - (tabs.length === 4 ? 3 : 4);
    // can-chu-khung (16/10): chữ thẻ dài (tiếng Anh "Upgrade forge") không vừa thẻ đều nhau → chia bề rộng theo chữ (tổng bề rộng hàng giữ nguyên)
    let tws = tabs.map(() => tw);
    if (T.canMoi && T.canMoi() && tabs.length > 1) {
      ui.font(8, true);
      const can = tabs.map((t) => Math.ceil(G.ux.measureText(G.tv(t[1])).width) + 30), gap = tp - tw, tong = tabs.length * tw;
      if (can.some((q) => q > tw)) { const sc = can.reduce((a, b) => a + b, 0), du = tong - sc; tws = can.map((q) => Math.floor(du >= 0 ? q + du / tabs.length : (q * tong) / sc)); tws[tws.length - 1] = tong - tws.slice(0, -1).reduce((a, b) => a + b, 0); }
      let xx = CX;
      tabs.forEach((t, i) => { if (T.tab(xx, PY + 23, tws[i], 22, t[1], V.ftab === t[0], { pad: 2 })) { V.ftab = t[0]; V.sel = null; V.page = 0; } xx += tws[i] + gap; });
    } else tabs.forEach((t, i) => {
      if (T.tab(CX + i * tp, PY + 23, tw, 22, t[1], V.ftab === t[0], { pad: 2 })) { V.ftab = t[0]; V.sel = null; V.page = 0; }
    });
    if (V.ftab !== 'up' && V.ftab !== 'vk' && V.ftab !== 'ep' && V.ftab !== 'luyen') T.inset(CX, DET_Y, CW, 52, false);
    if (V.ftab === 'luyen' && LY) {
      if (V.sel != null && sv.weapons.some((w) => w.id === V.sel)) { G.luyen.ui.sel = V.sel; V.sel = null; } // đi từ gợi ý nâng cấp (go.sel)
      G.luyen.panel(CX, LIST_Y - 1, CW, { h: 170, say });
      line = G.luyen.coTheLuyen(sv) ? 'Đủ đồ rồi! Chọn vũ khí rồi bấm Luyện, lần nào cũng thành công.' : 'Luyện vũ khí cần vàng, linh khí, nguyên liệu rèn và nguyên liệu vùng. Qua ải, Ải Rèn và trùm để gom.';
    } else if (V.ftab === 'ep' && coEp) {
      G.epDo.panel(CX, LIST_Y - 1, CW, { h: 170, say });
      line = G.epDo.coTheEp(sv) ? (G.TUT_BAC === false ? 'Đủ đá rồi! Ép lên bậc cao thì có thể hỏng, hỏng chỉ mất đá, không tụt bậc.' : 'Đủ đá rồi! Ép lên bậc cao thì có thể hỏng, từ Vàng trở lên hỏng là tụt bậc.') : 'Đá nâng bậc rơi từ trùm và Ải Đá Bậc. Từ bậc Tím vũ khí có dòng hiệu ứng.';
    } else if (V.ftab === 'vk' && G.vkMoi) {
      G.vkMoi.vkPanel(CX, LIST_Y - 1, CW, { rowH: 39, say, lo: true }); // lo: bảng hình thái (js/hinh_thai.js; ?hinhthai=0 → bảng cũ)
      line = G.vkMoi.coTheNang(sv) ? 'Đủ linh khí rồi! Chọn vũ khí để nâng cấp, lên Mầm thì chọn hệ.' : 'Linh khí nâng vũ khí: Trắng, Mầm, Thành hình, Thức tỉnh. Hạ tinh anh và trùm để gom linh khí.';
    } else if (V.ftab === 'sharpen') {
      weaponList();
      const w = G.weaponById(V.sel);
      line = 'Chọn một vũ khí để mài. Mỗi cấp mài tăng 8% sát thương gốc.';
      if (!w) ui.text('Chạm một vũ khí ở trên để chọn.', CX + 8, DET_Y + 30, { size: 8.5, color: SOFT });
      else {
        const cap = G.FORGE_CAP[sv.forge];
        const cost = G.sharpenFull(w.sharpen);
        ui.text(G.wName(w), CX + 8, DET_Y + 14, { size: 8.5, bold: true, color: G.bacMauVk(w) });
        // V26: số trước → sau khi mài (mài thử trên chính món rồi trả lại ngay, không lưu)
        const lvl = sv.heroes[sv.hero].lvl, f1 = (v) => v.toFixed(1).replace('.', dp()), dNow = G.wBase(w, lvl);
        let dAfter = null;
        if (w.sharpen < Math.min(cap, G.MAX_SHARPEN)) { w.sharpen++; try { dAfter = G.wBase(w, lvl); } finally { w.sharpen--; } }
        ui.text(dAfter != null ? G.t('Sát thương mỗi đòn {0} → {1} sau khi mài', f1(dNow), f1(dAfter)) : G.t('Sát thương mỗi đòn {0}', f1(dNow)), CX + 8, DET_Y + 26, { size: 7.5 });
        if (w.sharpen >= G.MAX_SHARPEN) { ui.text('Đã mài tối đa.', CX + 8, DET_Y + 40, { size: 8, color: GOOD }); line = 'Lưỡi này bén hết cỡ rồi cháu ạ.'; }
        else if (w.sharpen >= cap) { ui.para(G.t('Lò cấp {0} chỉ mài tới +{1}. Hãy nâng lò.', sv.forge, cap), CX + 8, DET_Y + 38, 290, { size: 7.5, color: WARN }); line = 'Lò còn yếu, phải nâng lò mới mài tiếp được.'; }
        else {
          ui.para(G.t('Lên +{0} tốn: {1}', w.sharpen + 1, costText(cost)), CX + 8, DET_Y + 38, 198, { size: 7.5, color: canPay(cost) ? TXT : WARN });
          if (!canPay(cost)) line = 'Chưa đủ nguyên liệu. Vào ải kiếm thêm rồi quay lại nhé.';
          // V21: mài món đang mang thì Sức mạnh tăng bao nhiêu (món trong rương không tính vào Sức mạnh)
          const gain = G.upg && G.upg.gainOf ? G.upg.gainOf('sh' + w.id + '-' + w.sharpen + '-' + sv.hero + '-' + lvl, (s) => { const x = s.weapons.find((q) => q.id === w.id); if (x) x.sharpen++; }) : 0;
          if (actBtn('Mài', { disabled: !canPay(cost), sub: gain > 0 ? G.upg.gainText(gain) : '', subSize: 7.5 })) { pay(cost); w.sharpen++; G.persist(); G.sfx('evolve'); say(G.t('Đã mài {0} lên +{1}!', G.wName(w), w.sharpen)); }
        }
      }
    } else {
      ui.para(G.t('Lò rèn cấp {0} mài được vũ khí tới +{1}.', sv.forge, G.FORGE_CAP[sv.forge]), CX + 4, 112, 296, { size: 9.5 });
      const up = G.FORGE_UP[sv.forge];
      if (!up) { ui.text('Lò rèn đã ở cấp cao nhất.', CX + 4, 134, { size: 9.5, color: GOOD }); line = 'Lò của ông giờ nóng nhất vùng rồi!'; }
      else {
        const y2 = ui.para(G.t('Nâng lên cấp {0} để mài tới +{1}.', sv.forge + 1, G.FORGE_CAP[sv.forge + 1]), CX + 4, 134, 296, { size: 9 });
        ui.para(G.t('Tốn: {0}', costText(up)), CX + 4, y2 + 4, 296, { size: 9, color: canPay(up) ? TXT : WARN });
        line = canPay(up) ? 'Đủ đồ rồi đấy, nâng lò thôi cháu!' : 'Gom đủ nguyên liệu rồi ông nâng lò cho.';
        if (T.btn(CX + 4, y2 + 24, 130, 34, 'Nâng lò', { size: 11, primary: true, trongVien: true, disabled: !canPay(up) })) { pay(up); sv.forge++; G.persist(); G.sfx('evolve'); say(G.t('Lò rèn đã lên cấp {0}!', sv.forge)); }
      }
    }
    return line;
  }

  // ---------- Bà Hàng Xén: chỉ còn thẻ Nguyên liệu (đợt 1 bỏ rương vũ khí, mua / bán đồ; đợt 2 xoá hẳn mã cũ và js/ban_do.js) ----------
  function xenTabs() {
    // Phiên cân bằng (mục 3): thẻ Nguyên liệu (đổi vàng lấy nguyên liệu vùng đã qua, js/upgrade.js U.doi) trên băng tiêu đề.
    const tabs = [['nl', 'Nguyên liệu', 48]];
    if (G.BAN_QUANG && G.BAN_QUANG_BAT !== false && G.upg && G.upg.bqMua) tabs.push(['quang', G.luyen && G.luyen.bat() ? 'NLR' : 'Quặng', 34]); // 14/10 (bước 1, mục 4); Luyện: bán nguyên liệu rèn
    // Rà soát C: thẻ rộng theo chữ (phông thật trên iPhone rộng hơn, "Nguyên liệu" chạm viền thẻ) nếu băng tiêu đề còn chỗ
    if (G.RSC !== false) {
      ui.font(7.5, true);
      const rong = tabs.map((t) => Math.max(t[2], Math.ceil(G.ux.measureText(G.tv ? G.tv(t[1]) : t[1]).width) + 22)); // chu-lech-khung: nút ảnh có mây + đinh góc ~9 điểm mỗi bên
      ui.font(11, true);
      const tit = Math.ceil(G.ux.measureText(G.tv ? G.tv('Hàng xén') : 'Hàng xén').width) + 16;
      const du = PW - 70 - tit - tabs.reduce((a, t) => a + t[2] + 2, 0), thieu = rong.map((w, i) => w - tabs[i][2]), tong = thieu.reduce((a, b) => a + b, 0);
      if (du > 0 && tong > 0) { const k = Math.min(1, du / tong); tabs.forEach((t, i) => { t[2] = Math.floor(t[2] + thieu[i] * k); }); } // thiếu chỗ thì chia phần còn trống theo độ thiếu
    }
    let x = PX + PW - 70 - tabs.reduce((a, t) => a + t[2] + 2, 0);
    if (V.gtab !== 'quang' || tabs.length < 2) V.gtab = 'nl';
    for (const t of tabs) {
      if (T.sbtn(x, PY + 3, t[2], 17, t[1], { size: 7, pad: 2, sel: V.gtab === t[0] }) && V.gtab !== t[0]) { V.gtab = t[0]; G.sfx('ui'); }
      x += t[2] + 2;
    }
    return false;
  }
  function gear() { return V.gtab === 'quang' ? banQuang() : nguyenLieu(); }

  // ---------- Bà Hàng Xén bán quặng (14/10, bước 1 làm chắc mục 4; js/upgrade.js U.bqMua, số G.BAN_QUANG) ----------
  function banQuang() {
    const sv = G.save, U = G.upg, D = G.BAN_QUANG;
    frame('Hàng xén');
    if (xenTabs()) return null;
    if (V.gtab !== 'quang') return nguyenLieu();
    const con = U.bqCon(sv), why = U.bqDuoc(sv), LY = !!(G.luyen && G.luyen.bat());
    if (LY) ui.para(G.t('{0} vàng một nguyên liệu rèn. Mỗi ngày bà bán tối đa {1}; hôm nay còn {2}.', D.gia, D.moiNgay, con), CX + 2, 78, CW - 4, { size: 7, color: SOFT });
    else ui.para(G.t('{0} vàng một quặng. Mỗi ngày bà bán tối đa {1} quặng; hôm nay còn {2}.', D.gia, D.moiNgay, con), CX + 2, 78, CW - 4, { size: 7, color: SOFT });
    const y = 100;
    T.inset(CX, y, CW, 40, false);
    ui.text(G.tv(LY ? 'Nguyên liệu rèn' : 'Quặng'), CX + 8, y + 15, { size: 9, bold: true, color: TXT });
    ui.text(LY ? G.t('Đang có {0} · dùng để luyện vũ khí', sv.nlr | 0) : G.t('Đang có {0} · dùng để mài vũ khí, nâng lò', sv.ore | 0), CX + 8, y + 29, { size: 7, color: SOFT });
    if (T.sbtn(CX + CW - 168, y + 10, 76, 20, why || G.t('Mua 1 ({0})', D.gia), { size: 7.5, pad: 2, disabled: !!why })) {
      if (U.bqMua(sv, 1)) { G.persist(); G.sfx('pick'); say(G.t(LY ? 'Của cháu đây, {0} nguyên liệu rèn.' : 'Của cháu đây, {0} quặng.', 1)); }
    }
    const k5 = Math.max(1, Math.min(5, con));
    if (T.sbtn(CX + CW - 86, y + 10, 80, 20, G.t('Mua {0} ({1})', k5, k5 * D.gia), { size: 7.5, pad: 2, disabled: !!why || k5 < 2 || sv.gold < k5 * D.gia })) {
      const got = U.bqMua(sv, k5);
      if (got) { G.persist(); G.sfx('pick'); say(G.t(LY ? 'Của cháu đây, {0} nguyên liệu rèn.' : 'Của cháu đây, {0} quặng.', got)); }
    }
    // 17/10 (tư vấn 17/10 mục 5): Luyện bật thì nói "nguyên liệu rèn / luyện" thay cho "quặng / mài" (cờ ?luyen=0 giữ câu cũ)
    if (LY) {
      ui.para('Nguyên liệu rèn vẫn rơi nhiều nhất khi thắng ải; bà chỉ bán thêm chút ít cho cháu khỏi thiếu lúc luyện.', CX + 2, y + 50, CW - 4, { size: 7, color: SOFT });
      return con > 0 ? 'Thiếu nguyên liệu rèn để luyện vũ khí thì mua của bà, mỗi ngày bà có ít hàng thôi.' : 'Hôm nay bà bán hết nguyên liệu rèn rồi, mai cháu quay lại nhé.';
    }
    ui.para('Quặng vẫn rơi nhiều nhất khi thắng ải; bà chỉ bán thêm chút ít cho cháu khỏi thiếu lúc mài.', CX + 2, y + 50, CW - 4, { size: 7, color: SOFT });
    return con > 0 ? 'Thiếu quặng mài vũ khí thì mua của bà, mỗi ngày bà có ít hàng thôi.' : 'Hôm nay bà bán hết quặng rồi, mai cháu quay lại nhé.';
  }

  // ---------- đổi vàng lấy nguyên liệu vùng đã qua (Bà Hàng Xén, phiên cân bằng mục 3) ----------
  function nguyenLieu() {
    const sv = G.save, U = G.upg, D = G.DOI_NL;
    frame('Hàng xén');
    if (xenTabs()) return null;
    if (!U || !D) return null;
    const n = sv.doiNL | 0;
    ui.para(G.t('{0} vàng đổi 1 nguyên liệu của vùng đã hạ trùm. Còn {1}/{2} lượt đổi; mỗi ải thắng thêm {3} lượt.', D.gia, n, D.max, D.them), CX + 2, 78, CW - 4, { size: 7, color: SOFT });
    let line = n > 0 ? 'Thiếu gỗ, vảy hay đá của vùng cháu đã qua thì bà đổi cho, khỏi phải quay lại cày.' : 'Hết hàng rồi cháu ạ. Thắng thêm ải là bà lại có hàng về.';
    for (let r = 0; r < 3; r++) {
      const y = 100 + r * 44, reg = G.REGIONS[r], why = U.doiDuoc(sv, r);
      T.inset(CX, y, CW, 40, false);
      ui.text(G.tv(reg.mat), CX + 8, y + 15, { size: 9, bold: true, color: U.daQua(sv, r) ? TXT : SOFT });
      ui.text(G.t('Đang có {0} · vùng {1}', sv.mats[r], G.tv(reg.name)), CX + 8, y + 29, { size: 7, color: SOFT });
      const nY = y + 6, nH = 28; // chu-lech-khung: nút 76×20 không đủ lòng cho "Hạ Ngư Tinh để mở" → cao 28, chữ xuống hai dòng
      if (T.sbtn(CX + CW - 168, nY, 76, nH, why || G.t('Đổi 1 ({0})', D.gia), { size: 7.5, pad: 2, disabled: !!why })) {
        if (U.doi(sv, r, 1)) { G.persist(); G.sfx('pick'); say(G.t('Của cháu đây, 1 {0}.', G.tv(reg.mat.toLowerCase()))); }
      }
      const k5 = Math.min(5, n);
      if (T.sbtn(CX + CW - 86, nY, 80, nH, G.t('Đổi {0} ({1})', Math.max(1, k5), Math.max(1, k5) * D.gia), { size: 7.5, pad: 2, disabled: !!why || k5 < 2 || sv.gold < k5 * D.gia })) {
        const got = U.doi(sv, r, k5);
        if (got) { G.persist(); G.sfx('pick'); say(G.t('Của cháu đây, {0} {1}.', got, G.tv(reg.mat.toLowerCase()))); }
      }
    }
    return line;
  }

  // ---------- Cô Thợ May: bảng nâng bộ trang phục Zed nằm ở js/vk_moi_lang.js (gắn đè PANELS.outfit); đây chỉ là bảng dự phòng ----------
  function outfit() { frame('Thợ may'); return 'Khung cửi đang sửa, cháu quay lại sau nhé.'; }

  // ---------- Ông Từ: bảng xem chỉ số Zed và các nét ba bạn đã dạy (đợt 2 bỏ bảng chọn em bé của cờ ?zed=0) ----------
  function hero() {
    const sv = G.save, k = 'smith', H = G.HEROES[k], hs = sv.heroes[k];
    khungThe('tu', 'Sân đình: chỉ số Cu Tí'); // Bước 2: có thẻ Sổ / Thành tựu thì hiện hàng thẻ trên băng tiêu đề
    // chân dung Zed (bộ trang phục đang mặc, js/zed_moi.js)
    const c = G.ux, px = CX, py = 68, pwd = 64, ph = 72;
    T.inset(px, py, pwd, ph, false, { fill: '#173030' });
    c.save(); c.beginPath(); c.rect(px + 1, py + 1, pwd - 2, ph - 2); c.clip();
    c.translate(px + pwd / 2 + 4, py + ph - 6); c.scale(1.8, 1.8);
    try { G.art.hero(c, { x: 0, y: 0, face: 1, key: k, t: G.time, move: true, atk: -1, dodge: -1, weapon: null, noShadow: true }); } catch (e) { /* thiếu hình thì bỏ qua */ }
    c.restore();
    const x = CX + 72, w = CW - 72;
    ui.text(G.t('{0} · cấp {1}', H.name, hs.lvl), x, 80, { size: 10, bold: true, color: GOLD });
    T.bar(x + 92, 73, w - 92, 'xp', hs.lvl >= G.MAX_LEVEL ? 1 : hs.xp / G.xpNeed(hs.lvl), null, { h: 7 });
    const pw = G.power();
    let y = 94;
    ui.text(G.t('Sức mạnh {0}', pw), x, y, { size: 8.5, bold: true, color: GOLD });
    ui.font(8.5, true); const sx = x + G.ux.measureText(G.t('Sức mạnh {0}', pw)).width + 6;
    ui.text(G.t('Máu gốc {0} · Mana {1} · Tốc độ {2}%', H.hp, H.mana, Math.round(H.speed * 100)), sx, y, { size: 7 });
    if (G.lucChienUI && G.lucChienUI.on()) { y += 10; ui.text(G.lucChienUI.chu(G.lucChien(sv, k)), x, y, { size: 7.5, bold: true, color: '#ffe9a8' }); }
    y = ui.para(G.t('Sở trường: {0} (+10% sát thương)', G.favOf(k).map((f) => G.tv(G.WTYPES[f].name)).join(', ')), x, y + 10, w, { size: 7 });
    y = ui.para(G.t('Nội tại: {0}', H.passive), x, y, w, { size: 7, color: SOFT });
    ui.para(G.t('Chưởng ({0} mana). {1}', G.CHUONG ? G.CHUONG.cost : 30, H.skillDesc), x, y, w, { size: 7, color: SOFT });
    // ba bạn: đã cứu thì đã dạy Zed (nội tại + nét chưởng + sở trường), chưa thì ghi trùm nào đang giữ bạn ấy
    T.head('Ba bạn dạy Cu Tí', CX, 150);
    let left = 0;
    G.ZED_DAY_KEYS.forEach((q, i) => {
      const D = G.ZED_DAY[q], Hq = G.HEROES[q], hoc = G.zedHoc(q), ry = 154 + i * 36;
      if (!hoc) left++;
      T.inset(CX, ry, CW, 34, false);
      c.save(); c.beginPath(); c.rect(CX + 2, ry + 2, 30, 30); c.clip();
      try { G.art.hero(c, { x: CX + 17, y: ry + 32, face: 1, key: q, move: false, t: G.time, atk: -1, dodge: -1, weapon: null, noShadow: true, alpha: hoc ? null : 0.4 }); } catch (e) { /* thiếu hình thì bỏ qua */ }
      c.restore();
      ui.text(Hq.name, CX + 36, ry + 11, { size: 8.5, bold: true, color: hoc ? '#fff0c4' : '#8fa49e' });
      ui.font(8.5, true); const nx = CX + 36 + G.ux.measureText(G.tv(Hq.name)).width + 6;
      ui.text(hoc ? 'đã dạy Cu Tí' : G.t('còn bị {0} bắt', D.boss), nx, ry + 11, { size: 7, color: hoc ? GOOD : SOFT });
      // dòng ngắn (ngan) cho vừa thẻ; đủ chữ ở Hành trang > Nhân vật
      const txt = hoc ? G.tv(D.ngan[0]) + '; ' + G.tv(D.ngan[1]) : G.t('Hạ {0} để cứu bạn ấy. Bạn ấy sẽ dạy Cu Tí: {1}', D.boss, G.tv(D.ngan[0]));
      T.chuO(txt, CX, ry, CW, 34, { align: 'left', vung: [CX + 34, ry + 12.5, CW - 34, 21.5], dong: 2, gian: 1.5, size: 6.5, bold: false, color: hoc ? TXT : SOFT }); // chu-lech-khung: hai dòng gọn trong lòng ô
    });
    return left ? G.t('Khẽ thôi, các bé đang chơi trong sân. Còn {0} bạn bị yêu tinh bắt: hạ trùm vùng để cứu, bạn ấy sẽ dạy cháu.', left)
      : 'Ba bạn về đủ cả rồi. Ngón nghề của các bạn, cháu học hết rồi đấy.';
  }
  // ---------- cây kỹ năng và hướng dẫn (Cụ Đồ) ----------
  function doTabs() {
    // thẻ Bảng vàng (js/bang_vang.js) chỉ có khi tệp đó được nạp
    const tabs = (theMoDan('skill') ? [['skill', 'Cây kỹ năng']] : []).concat(chuongOpen() ? [['chuong', 'Cây chưởng']] : [], [['help', 'Hướng dẫn']], PANELS.rank && theMoDan('rank') ? [['rank', 'Bảng vàng']] : []);
    const w = Math.floor((CW - (tabs.length - 1) * 4) / tabs.length);
    tabs.forEach((t, i) => {
      const dot = t[0] === 'chuong' && G.chuong && G.chuong.pts(G.save.heroes[G.save.hero], G.save.hero).left > 0;
      if (T.tab(CX + i * (w + 4), PY + 23, w, 22, t[1], V.tab === t[0], { pad: 2, size: tabs.length > 3 ? 7.5 : 8, dot })) { V.tab = t[0]; V.dtab = t[0]; V.page = 0; }
    });
  }
  function skill() {
    const sv = G.save, k = sv.hero, H = G.HEROES[k], hs = sv.heroes[k];
    frame(G.t('Gốc đa: {0}', H.name));
    doTabs();
    const spent = hs.sk.atk + hs.sk.def + hs.sk.elem;
    const pts = Math.floor(hs.lvl / 3) - spent;
    ui.text(G.t('Còn {0} điểm (mỗi 3 cấp nhận 1 điểm)', pts), CX + 2, 104, { size: 8, bold: true, color: pts > 0 ? GOOD : SOFT });
    G.SKEYS.forEach((b, r) => {
      const y0 = 109 + r * 42, n = hs.sk[b], Bk = G.SKILLS[b];
      T.inset(CX, y0, CW, 39, false);
      ui.text(Bk.name, CX + 6, y0 + 12, { size: 9, bold: true, color: GOLD });
      for (let j = 0; j < 5; j++) { // 16/10 (ve-tay-8-gop-giao-dien): ô điểm bằng ảnh gd-o-diem / gd-o-diem-trong (9×9 quanh ô code 9×8)
        const SCg = G.spriteCustom, od = SCg && SCg.gdThay ? SCg.gdThay(j < n ? 'gd-o-diem' : 'gd-o-diem-trong') : null;
        if (od) SCg.veGd(G.ux, od, CX + 46 + j * 12, y0 + 4.5, 9, 9); else ui.rect(CX + 46 + j * 12, y0 + 5, 9, 8, j < n ? '#ffd23f' : '#0d1716', j < n ? '#fff0a8' : T.C.brD);
      }
      if (n < 5) {
        ui.para(G.t('Tiếp: {0}', Bk.nodes[n]), CX + 6, y0 + 24, 236, { size: 7, color: TXT });
        // V21: học thêm một điểm nhánh này thì Sức mạnh tăng bao nhiêu (nút như hồi máu mỗi phòng không đổi con số thì không ghi)
        const gain = G.upg && G.upg.gainOf ? G.upg.gainOf('sk' + k + '-' + b + '-' + n + '-' + hs.lvl, (s) => { s.heroes[s.hero].sk[b]++; }) : 0;
        if (gain > 0) ui.text(G.upg.gainText(gain), CX + CW - 60, y0 + 15, { size: 7.5, bold: true, align: 'right', color: GOOD });
        if (T.sbtn(CX + CW - 54, y0 + 8, 48, 24, 'Học', { size: 9, pad: 4, primary: pts > 0, disabled: pts <= 0 })) { hs.sk[b]++; G.persist(); G.sfx('evolve'); VS.checkNews(); }
      } else ui.text('Đã học hết nhánh này.', CX + 6, y0 + 28, { size: 7.5, color: GOOD });
    });
    if (spent > 0 && T.sbtn(CX, 240, 170, 20, 'Đặt lại điểm (100 vàng)', { size: 8, pad: 3, disabled: sv.gold < 100 })) {
      sv.gold -= 100; hs.sk = { atk: 0, def: 0, elem: 0 }; G.persist(); VS.checkNews(); say('Lão xoá hết rồi, con học lại từ đầu nhé.');
    }
    return pts > 0 ? G.t('Ngồi xuống đây, lão chỉ cho một chiêu. Con còn {0} điểm chưa dùng đấy.', pts) : 'Lên thêm cấp rồi quay lại, lão dạy tiếp. Cứ 3 cấp con được 1 điểm.';
  }
  // ---------- cây chưởng (Cụ Đồ): bảng vẽ ở js/chuong_ui.js ----------
  function chuong() {
    const sv = G.save, H = G.HEROES[sv.hero];
    frame(G.t('Gốc đa: chưởng của {0}', H.name));
    doTabs();
    if (!sv.tut.chTip) { sv.tut.chTip = 1; G.persist(); } // đã xem thẻ Cây chưởng: thôi nhắc ở làng
    if (!G.chuongUI) return null;
    return G.chuongUI.tree(CX, 96, CW, 166, {});
  }
  const HELP = () => [
    ['Đi lại trong làng', 'Kéo ở nửa trái màn hình để đi, hoặc chạm vào một người để em bé tự chạy tới. Dải khuôn mặt ở mép trên là lối tắt. Ai có việc mới thì có dấu chấm than vàng.'],
    ['Di chuyển và đánh', 'Cảm ứng: đặt ngón ở nửa trái màn hình rồi kéo để đi. Bên phải có các nút tròn: giữ Đánh để ra đòn liên tục, Né để lăn tránh, Đặc biệt để tung đòn mạnh (tốn mana), nút trên cùng là Chưởng.'],
    ['Chưởng', G.t('Nút Chưởng bắn một luồng chưởng linh khí (tốn {0} mana), tự ngắm quái gần nhất theo tám hướng. Hệ của chưởng theo cây chưởng đang dùng. Chưởng của Cu Tí đẩy lùi quái mạnh; mỗi bạn được cứu dạy cậu thêm một nét: Cu Tèo bay xa và nhanh, Cái Bống trúng thì hồi chút máu, Cu Lì chưởng to và mạnh. Chưởng không cho linh khí cho vũ khí (linh khí chỉ đến từ vũ khí) và không kết hợp hệ với vũ khí.', G.CHUONG ? G.CHUONG.cost : 30)],
    ['Ba cây chưởng', 'Hỏa chưởng: cầu lửa nổ lan, vệt cháy, giữ nút để tích lực. Độc chưởng: mây độc, lây độc, ăn mòn giáp, tách 3 luồng. Băng chưởng: mũi băng xuyên nhiều quái, làm chậm, đóng băng, băng vỡ. Mỗi cấp nhận 1 điểm chưởng (riêng với điểm kỹ năng). Mỗi lúc dùng một cây; ở làng đổi cây miễn phí ở Cụ Đồ (thẻ Cây chưởng) hoặc Hành trang, điểm đã học được trả lại hết.'],
    ['Đánh tám hướng', 'Mọi đòn tự quay về quái gần nhất trong tầm, theo cả tám hướng (lên, xuống, chéo). Không có quái gần thì đánh theo hướng đang kéo cần, hoặc hướng vừa đi.'],
    ['Chiêu Đặc biệt', 'Mỗi loại vũ khí một chiêu (tốn mana). Kiếm, Trảm Nguyệt: phóng vệt chém trăng khuyết bay xuyên mọi quái. Thương, Phi Thương: ném thương xuyên một hàng quái, ghim con cuối, thương tự bay về tay (lúc thương chưa về thì nút Đánh là cú đấm tay). Búa, Địa Chấn: nện ra vệt nứt đất hất tung quái, kèm vòng chấn quanh người. Phi tiêu, Mưa Phi Tiêu: mưa phi tiêu rơi vào cụm quái gần nhất.'],
    ['Các ô ở mép trên', 'Chạm ô vũ khí ở góc trên bên phải để đổi sang vũ khí kế tiếp (xoay vòng 4 món). Chạm ô Bình máu để hồi máu. Chạm Dừng để tạm nghỉ.'],
    ['Mở rương, qua cửa', 'Lại gần rương, suối hay thương nhân rồi bấm Đánh. Hết quái thì cửa mở: đi vào cửa có mũi tên để sang phòng kề. Chạm bản đồ nhỏ để xem cả ải.'],
    ['Bàn phím', 'Mũi tên hoặc WASD để đi, J đánh (ở làng: nói chuyện), K né, L đặc biệt, I chưởng (giữ để tích lực), Q đổi vũ khí, E uống bình máu, M xem bản đồ, Esc tạm dừng hoặc đóng bảng.'],
    ['Ba sao', 'Sao 1: qua ải. Sao 2: không dùng bình máu. Sao 3: ra đòn kết liễu trùm bằng hệ khắc chế nó.'],
    // 14/10 (bước 1, mục 6): bỏ trang vẽ hình "dấu ấn hệ của vũ khí" (js/linhkhi.js LK.guide, luật cũ: mỗi vũ khí tích dấu ấn ba hệ)
    ['Linh khí', G.t('{0} {1}', G.HINTS[0], G.HINTS[1])],
    ['Ba hệ', G.t('{0} {1}', G.HINTS[4], G.HINTS[5])],
    ['Trùm học theo bạn', G.t('{0} {1}', G.HINTS[2], G.HINTS[3])],
    ['Đọc đòn quái', 'Vùng đỏ trên sàn là chỗ đòn sắp rơi xuống, đầy dần rồi nổ: đi ra ngoài hoặc lộn qua. Quái đánh được mọi hướng, kể cả trên dưới và chéo. Vòng đỏ chỗ trống là quái sắp mọc lên.'],
    ['Các loại quái', 'Mỗi vùng quái con đánh một kiểu riêng. Rừng già: húc thẳng, lăn cầu đất, mưa bào tử, lẩn bóng sau lưng, nổ mây độc. Hang biển: lướt ngang kẹp, rút vỏ để vệt nhớt làm chậm, hút lại gần, vũng điện, gai xoáy ốc. Lâu đài cổ: chớp chém, phân thân, lửa ma đuổi, bùa tam giác, gai lửa trồi. Đòn nào cũng có vạch hay vòng đỏ báo trước: thấy là né. Quái giáp vẫn che phía trước và hồi máu cho bạn, quái bắn xa vẫn gọi thêm bầy.'] // 24 quái con đánh riêng theo vùng (js/ky_nang_quai.js)
    ['Tinh anh và trùm', 'Tinh anh có chiêu riêng và một dấu hiệu trên đầu: tia chớp là nhanh, khiên là bọc giáp, quả bom là nổ khi chết, giọt máu là hút máu. Trùm nhỏ có hai chiêu riêng. Trùm vùng có ba pha, đổi ở 2/3 và 1/3 máu, pha sau thêm chiêu và nhanh hơn; sau chiêu lớn trùm choáng một lúc, đó là lúc đánh mạnh nhất.'],
    ['Vật trong phòng', 'Chậu than, nấm độc và tinh thể băng phát nổ khi bị đánh, gây hiệu ứng lên quái đứng gần. Đây là cách gây hệ khi vũ khí còn trắng.'],
    // 17/10 (tư vấn 17/10 mục 5): Luyện bật thì hai trang "Bốn vũ khí", "Xem vũ khí" nói theo Luyện 1–15 (cờ ?luyen=0 giữ câu cũ)
    G.luyen && G.luyen.bat() ? ['Bốn vũ khí', 'Cu Tí luôn mang đủ 4 vũ khí: Kiếm, Thương, Búa, Phi tiêu; nút đổi vũ khí xoay vòng. Luyện từng món ở Ông Thợ Rèn từ cấp 1 lên 15 bằng vàng, linh khí, nguyên liệu rèn và nguyên liệu vùng: cấp 3 thành Mầm (chọn hệ Lửa, Độc hoặc Băng), cấp 6 Thành hình, cấp 12 Thức tỉnh. Luyện lần nào cũng thành công, không tụt cấp. Quái, rương, trùm không rơi vũ khí hay quần áo nữa mà cho vàng, linh khí và nguyên liệu.'] :
    ['Bốn vũ khí', G.t('Cu Tí luôn mang đủ 4 vũ khí: Kiếm, Thương, Búa, Phi tiêu; nút đổi vũ khí xoay vòng. Nâng vũ khí bằng linh khí ở Ông Thợ Rèn: Trắng, Mầm (chọn hệ Lửa, Độc hoặc Băng), Thành hình, Thức tỉnh ({0}, {1}, {2} linh khí). Quái, rương, trùm không rơi vũ khí hay quần áo nữa mà cho vàng và linh khí.', G.VK_MOI.gia[0], G.VK_MOI.gia[1], G.VK_MOI.gia[2])],
    ['Đặc trưng hệ theo cấp', G.t('Trắng: chưa có hệ. Linh khí (túi chung) có từ: hạ tinh anh ({0}), trùm nhỏ ({1}), trùm vùng ({2}); quái thường {3}% rơi viên linh khí ({4}), đi lại gần để nhặt; kết liễu quái đang dính hệ (+1). Mầm: chọn hệ Lửa, Độc hoặc Băng; có tỉ lệ gây cháy, độc, chậm nhưng chưa có luật hệ. Thành hình: mở đặc trưng 1, thứ để lại trên sân (vệt cháy, vũng độc, gai băng). Thức tỉnh: mở đặc trưng 2, phản ứng dây chuyền (nổ lan, lây độc, băng vỡ).', G.LINHKHI.elite, G.LINHKHI.mini, G.LINHKHI.boss, Math.round(G.LINHKHI.drop * 100), G.LINHKHI.orb)],
    G.luyen && G.luyen.bat() ? ['Xem vũ khí', 'Ở Ông Thợ Rèn (thẻ Luyện) hoặc Hành trang › Vũ khí xem cấp Luyện, hình thái và các đặc trưng hệ đã mở, sắp mở của từng vũ khí.']
      : ['Xem vũ khí', 'Ở Ông Thợ Rèn (thẻ Linh khí, nút Xem linh khí) xem cấp, bậc ép đồ và các đặc trưng hệ đã mở, sắp mở của từng vũ khí.'],
    // 15/10 (bo-do-mua): bộ vùng mua bằng vàng ở Cô Thợ May; ?bocu=1 thì câu cũ (hạ trùm là có bộ)
    G.BO_MUA_BAT !== false
      ? ['Bộ trang phục', G.t('Cu Tí có sẵn bộ Ninja. Hạ trùm vùng thì Cô Thợ May bày bán bộ của vùng đó (thẻ Mua): Rừng {0}, Biển {1}, Lâu đài {2} vàng. Mua xong mới mặc và nâng cấp được (thẻ Nâng cấp: linh khí, vàng, mảnh trùm); đổi bộ ở Hành trang › Nhân vật.', G.zedBoGia('rung'), G.zedBoGia('bien'), G.zedBoGia('lau'))]
      : ['Bộ trang phục', 'Cu Tí có sẵn bộ Ninja. Hạ trùm vùng thì mở bộ của vùng đó. Cô Thợ May nâng bộ bằng linh khí, vàng, mảnh trùm; đổi bộ ở Hành trang › Nhân vật.'],
  ];
  function help() {
    frame('Gốc đa: hướng dẫn');
    doTabs();
    // xếp các mục vào từng trang cho vừa bảng
    const secs = HELP().filter(Boolean), pages = [[]], top = 106, bottom = 236;
    let y = top;
    for (const s of secs) {
      const h = s[2] ? bottom - top : 11 + ui.wrap(s[1], 298, 7.5).length * 10.5 + 5; // trang vẽ hình (Linh khí) đứng riêng một trang
      if (y + h > bottom && pages[pages.length - 1].length) { pages.push([]); y = top; }
      pages[pages.length - 1].push(s); y += h;
    }
    V.page = G.clamp(V.page, 0, pages.length - 1);
    y = top;
    for (const l of pages[V.page]) {
      if (l[2]) { l[2].draw(CX + 2, y, 298); y += l[2].h; continue; }
      T.head(l[0], CX + 2, y);
      y = ui.para(l[1], CX + 2, y + 11, 298, { size: 7.5, color: TXT }) + 5 + 2.5;
    }
    pager(pages.length, 1, CX + CW - 100, 242);
    return 'Lão chép cả ra đây, con đọc thong thả. Bấm mũi tên để lật trang.';
  }

  // ---------- cài đặt (Anh Mõ) ----------
  // Lưu mây, đăng nhập Google, góp ý: js/cloud.js, js/cloud_ui.js (không có thì bảng chỉ còn phần cũ)
  // Phiên Cốt truyện + Âm thanh: mọi nút của bảng cao 32 (khoảng 46 điểm trên iPhone cầm ngang, tối thiểu 44). Trang 2 (V.cd2):
  // thanh Nhạc, thanh Tiếng (0..100, G.save.nhac / G.save.tieng, js/engine.js G.amThanh), bật/tắt âm thanh, Tiết kiệm pin (G.save.pin), Xem lại truyện,
  // Rung màn (G.save.rungTat = true: tắt rung màn hình, soát mượt Phiên 2).
  const CDH = 32;
  function settings() {
    const sv = G.save, CL = G.cloud, CU = G.cloudUI;
    if (V.cd2) return settings2();
    khungThe('mo', 'Cổng làng: cài đặt'); // Bước 2: có thẻ Việc hôm nay thì hiện hàng thẻ trên băng tiêu đề
    // can-chu-khung (16/10): nút đầu có hai dòng (chữ + dòng phụ) mà dòng trên nằm ở hàng có mây góc: rộng 96 → 116, hai nút sau 96 → 86 (?canchucu=1 như cũ)
    const cdW = T.canMoi && T.canMoi() ? [116, 86, 86] : [96, 96, 96], cdX = [CX + 4, CX + 8 + cdW[0], CX + 12 + cdW[0] + cdW[1]];
    if (T.btn(cdX[0], 68, cdW[0], CDH, 'Âm thanh, điều khiển ›', { size: 8.5, sub: sv.sound ? 'Nhạc · Truyện' : 'Đang tắt', subSize: 7 })) { V.cd2 = true; V.confirm = false; G.audioStart(); }
    // Độ nét hình (js/engine.js G.NET): Cao = canvas thế giới gấp đôi điểm ảnh (ảnh AI rõ hơn), Thường = như cũ (nhẹ máy yếu)
    if (T.btn(cdX[1], 68, cdW[1], CDH, sv.net === 'thuong' ? 'Độ nét: Thường' : 'Độ nét: Cao', { size: 8.5 })) {
      if (sv.net === 'thuong') delete sv.net; else sv.net = 'thuong';
      G.persist(); say(sv.net === 'thuong' ? 'Độ nét Thường: nhẹ máy hơn, hình AI kém rõ hơn.' : 'Độ nét Cao: hình AI rõ gấp đôi.');
    }
    if (T.btn(cdX[2], 68, cdW[2], CDH, 'Toàn màn hình', { size: 8.5 })) {
      try { const el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen().catch(() => say('Thiết bị này không cho bật toàn màn hình.')); } catch (e) { say('Thiết bị này không cho bật toàn màn hình.'); }
    }
    T.head('Lưu tiến trình', CX + 4, 113);
    if (!V.moi && inviteWant('mo')) V.moi = { where: 'mo' }; // Đợt 1: lần trước bấm "Để sau" → Anh Mõ nhắc lại đúng một lần
    if (CL) {
      const on = CL.online();
      ui.text(CL.label(), CX + 4, 125, { size: 7.5, color: on && !CL.dirty ? GOOD : SOFT });
      ui.text(on ? (CL.isGuest() ? 'Tài khoản: Khách. Đăng nhập Google để giữ tiến trình khi đổi máy.' : G.t('Tài khoản Google: {0}', G.kd(CL.who()))) : 'Tiến trình luôn được lưu trong trình duyệt này.', CX + 4, 136, { size: 7, color: SOFT });
      if (on && CL.isGuest()) {
        G.syncTaps.push({ x: CX + 4, y: 142, w: 146, h: CDH, fn: () => titleLogin(CL) });
        if (T.btn(CX + 4, 142, 146, CDH, 'Đăng nhập Google', { size: 8.5, primary: true }) && !V.gBusy) {
          V.gBusy = true; say('Đang mở cửa sổ đăng nhập Google…');
          const snap = guestSnap();
          CL.google().then((r) => { guestKeep(snap, r); return r; }).then((r) => say(r === 'redirect' ? 'Đang chuyển sang trang Google…' : r === 'linked' ? 'Đã nối tài khoản Google. Tiến trình được giữ nguyên.' : 'Đã đăng nhập Google.'), (e) => say(G.t('Chưa đăng nhập được: {0}', e.message))).then(() => { V.gBusy = false; });
        }
      } else T.btn(CX + 4, 142, 146, CDH, on ? 'Đã đăng nhập Google' : 'Đăng nhập Google', { size: 8.5, disabled: true });
    } else ui.para('Tiến trình được lưu trong trình duyệt này. Đổi máy hoặc xoá dữ liệu trình duyệt sẽ mất tiến trình.', CX + 4, 125, 292, { size: 7.5, color: SOFT });
    if (CU && T.btn(CX + 154, 142, 146, CDH, '✉ Góp ý', { size: 8.5 })) CU.feedback({});
    if (CL && CU && CL.isAdmin()) {
      const n = CL.adminNew;
      if (T.btn(CX + 4, 178, 296, 22, n ? G.t('📥 Góp ý nhận được ({0} mới)', n) : '📥 Góp ý nhận được', { size: 8.5, gold: true, dot: !!n })) CU.inbox();
    }
    if (!V.confirm) {
      if (T.btn(CX + 4, 208, 200, CDH, 'Xoá tiến trình, chơi lại từ đầu', { size: 8, danger: true })) V.confirm = true;
      // Ngôn ngữ (js/ngon_ngu.js): bấm là đổi ngay Tiếng Việt <-> English, nhớ theo máy và ghi vào bản lưu (trường lang)
      if (G.ngonNgu && T.btn(CX + 208, 208, 92, CDH, 'Ngôn ngữ', { size: 8, sub: G.LANG === 'en' ? 'English' : 'Tiếng Việt' })) {
        G.ngonNgu.doi(); say(G.LANG === 'en' ? 'Language: English.' : 'Ngôn ngữ: Tiếng Việt.');
      }
    } else {
      ui.text('Chắc chắn xoá hết? Không khôi phục được.', CX + 4, 205, { size: 8, color: WARN, bold: true });
      // "Thôi" nằm đúng chỗ nút xoá vừa bấm, để bấm đúp nhầm cũng không mất tiến trình
      if (T.btn(CX + 4, 208, 120, CDH, 'Thôi')) V.confirm = false;
      else if (T.btn(CX + 132, 208, 120, CDH, 'Xoá hết', { danger: true })) { G.resetSave(); V.confirm = false; goHub(); VS.enter({}); VS.say('Đã xoá tiến trình.'); return null; }
    }
    if (G.VERSION) { // chu-lech-khung: góc dưới phải khung bảng có núm tròn: chữ phiên bản đặt trong lòng, tránh núm
      T.chuTrongKhung(G.t('Phiên bản {0}', G.VERSION), PX - 3, PY - 3, PW + 6, PH + 6, { khung: 'gd-khung-bang', kKhung: T.kBang(PW, PH), vien: [7, 7, 7, 7], vung: [CX, 249, CW, 12], align: 'right', size: 6.5, bold: false, color: SOFT });
    }
    return V.confirm ? 'Ấy ấy! Xoá là mất hết đấy, nghĩ kỹ chưa?' : 'Cốc cốc cốc! Làng nước nghe đây! Cần chỉnh gì cứ bảo anh.';
  }
  // Trang 2: Nhạc, Tiếng, bật/tắt âm thanh, Tiết kiệm pin, Xem lại truyện
  function settings2() {
    const sv = G.save, AM = G.amThanh;
    frame('Âm thanh, pin, điều khiển');
    thanhAm('Nhạc', 'nhac', 66);
    thanhAm('Tiếng', 'tieng', 104);
    if (T.btn(CX + 4, 146, 96, CDH, sv.sound ? 'Âm thanh: bật' : 'Âm thanh: tắt', { size: 8.5, sel: !!sv.sound })) {
      sv.sound = !sv.sound; G.persist(); G.audioStart(); if (AM) AM.capNhat();
      say(sv.sound ? 'Bật cả nhạc lẫn tiếng.' : 'Tắt hết nhạc và tiếng.');
    }
    if (T.btn(CX + 104, 146, 96, CDH, sv.pin ? 'Tiết kiệm pin: bật' : 'Tiết kiệm pin: tắt', { size: 8.5, sub: '30 khung/giây', subSize: 7, sel: !!sv.pin })) {
      if (sv.pin) delete sv.pin; else sv.pin = true;
      G.persist(); say(sv.pin ? 'Tiết kiệm pin: hình vẽ 30 khung mỗi giây, máy đỡ nóng.' : 'Vẽ đủ khung hình, mượt nhất.');
    }
    // Tư vấn 16/10 (mục 4): Khoá mục tiêu (G.save.khoaMT, mặc định tắt; js/moves.js aimM) — đánh trúng con nào thì cứ nhắm con đó tới khi nó gục / ra khỏi tầm
    if (T.btn(CX + 204, 146, 96, CDH, sv.khoaMT ? 'Khoá mục tiêu: bật' : 'Khoá mục tiêu: tắt', { size: 8.5, sub: 'Tự ngắm', subSize: 7, sel: !!sv.khoaMT })) {
      if (sv.khoaMT) delete sv.khoaMT; else sv.khoaMT = true;
      G.persist(); say(sv.khoaMT ? 'Khoá mục tiêu: nhắm mãi một con tới khi nó gục hay chạy khỏi tầm đánh.' : 'Tự ngắm: ưu tiên quái theo hướng cần gạt, không có thì quái gần nhất.');
    }
    if (T.btn(CX + 4, 186, 96, CDH, 'Xem lại truyện', { size: 8.5, disabled: !G.truyen })) { V.confirm = false; G.truyen.xemLai(); }
    // Soát mượt Phiên 2 (mục 5): tắt rung màn hình (G.save.rungTat, js/fx.js trauma / kick). Khựng hình, tiếng, chớp vẫn giữ.
    if (T.btn(CX + 104, 186, 96, CDH, sv.rungTat ? 'Rung màn: tắt' : 'Rung màn: bật', { size: 8.5, sel: !sv.rungTat })) {
      if (sv.rungTat) delete sv.rungTat; else sv.rungTat = true;
      G.persist(); say(sv.rungTat ? 'Đã tắt rung màn hình.' : 'Bật rung màn hình khi đánh trúng.');
    }
    if (T.btn(CX + 204, 186, 96, CDH, '‹ Trở lại', { size: 8.5 })) V.cd2 = false;
    // 17/10 (nut-danh-to): Cỡ nút trong ải — Nhỏ / Vừa / To (G.save.coNut: 'nho' | 'to', không có = Vừa). js/stage.js boCucTo đọc trường này.
    //   Hàng này thế chỗ dòng giải thích cũ (Tiết kiệm pin đã ghi "30 khung/giây" trên nút).
    ui.text('Cỡ nút', CX + 4, 226 + 20, { size: 9, bold: true, color: TXT });
    const coN = sv.coNut === 'nho' || sv.coNut === 'to' ? sv.coNut : 'vua';
    [['nho', 'Nhỏ'], ['vua', 'Vừa'], ['to', 'To']].forEach(([k, nhan], i) => {
      if (T.btn(CX + 56 + i * 82, 226, 78, CDH, nhan, { size: 8.5, sel: coN === k }) && coN !== k) {
        if (k === 'vua') delete sv.coNut; else sv.coNut = k;
        G.persist(); say(k === 'nho' ? 'Nút trong ải: nhỏ.' : k === 'to' ? 'Nút trong ải: to, nút Đánh to nhất.' : 'Nút trong ải: vừa.');
      }
    });
    return 'Nhạc làng có sáo trúc với đàn bầu đấy. Nghe hay thì để to lên!';
  }
  // Một thanh âm lượng: nút − và + (mỗi lần 10), kéo hoặc chạm trên thanh (mỗi nấc 5). Nhả tay mới lưu.
  function thanhAm(nhan, k, y) {
    const AM = G.amThanh, sv = G.save;
    if (!AM) return;
    const cu = AM.so(k), x0 = CX + 94, x1 = CX + 222;
    let v = cu;
    ui.text(nhan, CX + 4, y + 20, { size: 9, bold: true, color: TXT });
    if (T.btn(CX + 52, y, 36, CDH, '−', { size: 12 })) v = Math.max(0, v - 10);
    if (T.btn(CX + 228, y, 36, CDH, '+', { size: 12 })) v = Math.min(100, v + 10);
    const theo = (px) => Math.round(G.clamp((px - x0) / (x1 - x0), 0, 1) * 20) * 5;
    for (const p of G.pointers.values()) if (!p.stale && p.sx >= x0 - 6 && p.sx <= x1 + 6 && p.sy >= y - 2 && p.sy <= y + CDH + 2) { v = theo(p.x); p.role = 'ui'; }
    if (G.click && G.inRect(G.click, x0 - 6, y - 2, x1 - x0 + 12, CDH + 4)) { v = theo(G.click.x); G.click = null; }
    const kx = x0 + ((x1 - x0) * v) / 100;
    ui.rect(x0, y + 14, x1 - x0, 5, '#14201e', '#3a5a52');
    if (v > 0) ui.rect(x0, y + 14, kx - x0, 5, GOLD);
    ui.rect(Math.round(kx - 4), y + 7, 8, 19, '#f3e8c8', '#2a1a14');
    ui.text(v ? String(v) : G.t('Tắt'), CX + 300, y + 20, { size: 9, bold: true, align: 'right', color: v ? GOLD : SOFT });
    if (v !== cu) { sv[k] = v; AM.capNhat(); V.cdLuu = k; }
    if (V.cdLuu && !G.pointers.size) { const kk = V.cdLuu; V.cdLuu = null; G.persist(); if (kk === 'tieng') G.sfx('pick'); }
  }

  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({ // 17/10: câu theo Luyện (tư vấn 17/10 mục 5)
    'Nguyên liệu rèn vẫn rơi nhiều nhất khi thắng ải; bà chỉ bán thêm chút ít cho cháu khỏi thiếu lúc luyện.': 'Forge materials still drop most from winning stages; I only sell a little so you never run short when tempering.',
    'Thiếu nguyên liệu rèn để luyện vũ khí thì mua của bà, mỗi ngày bà có ít hàng thôi.': 'Short on forge materials for tempering? Buy from me, I only have a little each day.',
    'Hôm nay bà bán hết nguyên liệu rèn rồi, mai cháu quay lại nhé.': 'I sold all my forge materials today, come back tomorrow.',
    'Cu Tí luôn mang đủ 4 vũ khí: Kiếm, Thương, Búa, Phi tiêu; nút đổi vũ khí xoay vòng. Luyện từng món ở Ông Thợ Rèn từ cấp 1 lên 15 bằng vàng, linh khí, nguyên liệu rèn và nguyên liệu vùng: cấp 3 thành Mầm (chọn hệ Lửa, Độc hoặc Băng), cấp 6 Thành hình, cấp 12 Thức tỉnh. Luyện lần nào cũng thành công, không tụt cấp. Quái, rương, trùm không rơi vũ khí hay quần áo nữa mà cho vàng, linh khí và nguyên liệu.':
      'Cu Tí always carries all 4 weapons: Sword, Spear, Hammer, Shuriken; the swap button cycles them. Temper each at the Smith from Lv 1 to 15 with gold, spirit, forge materials and region materials: Lv 3 Sprout (pick Fire, Poison or Ice), Lv 6 Formed, Lv 12 Awakened. Tempering always succeeds and never drops a level. Monsters, chests and bosses no longer drop weapons or clothes; they give gold, spirit and materials.',
    'Ở Ông Thợ Rèn (thẻ Luyện) hoặc Hành trang › Vũ khí xem cấp Luyện, hình thái và các đặc trưng hệ đã mở, sắp mở của từng vũ khí.': 'At the Smith (Temper tab) or Bag › Weapons, see each weapon\'s Temper level, form and the element traits it has or will unlock.',
  });
  const PANELS = { forge, gear, outfit, hero, skill, chuong, help, settings,
    so: theRong('tu', 'Sân đình: sổ yêu quái'), thanhTuu: theRong('tu', 'Sân đình: thành tựu'), viecNgay: theRong('mo', 'Cổng làng: việc hôm nay') }; // Bước 2: Phiên A / C / B điền
  Object.assign(G.villageApi, { PANELS, pager, say, costText, frame, npcSide, viewWeapon, weaponView, doTabs });
  G.Village = {
    enter() {
      goHub(); VS.enter({}); G.persist();
      if (G.goiY1) G.goiY1.baoLang(); // 17/10: một việc nên làm tiếp sau lượt chơi (js/goi_y_1.js); dòng "Mở mới" dưới đây có thì đè lên
      if (G.moDan) G.moDan.baoLang(); // tư vấn 16/10: vừa tới mốc mở thì một dòng báo ngắn ở làng (js/mo_dan.js)
      // Bấm một gợi ý ở bảng thua (G.upgradeTips): về làng là mở luôn bảng của người làng tương ứng, chọn sẵn món cần nâng.
      const g = G.villageGo; G.villageGo = null;
      if (!g) return;
      if (g.weapon != null && G.weaponById(g.weapon)) { viewWeapon(g.weapon, 'hub'); return; }
      if (!g.who || !TAB_OF[g.who]) return;
      if (VS.shown && !VS.shown(g.who)) return; // người chưa ra mặt (mở dần)
      open(g.who);
      if (g.ftab && (!G.moDan || G.moDan.ftab(g.ftab))) V.ftab = g.ftab;
      if (g.otab) V.otab = g.otab;
      if (g.oslot) V.oslot = g.oslot;
      if (g.who === 'xen') V.gtab = g.gtab || 'weapon';
      if (g.who === 'do') { V.tab = g.tab === 'chuong' && chuongOpen() ? 'chuong' : 'skill'; V.dtab = V.tab; }
      if (g.sel != null) V.sel = g.sel;
      if (g.page != null) V.page = g.page;
      if (g.stage) { V.diff = 0; V.sel = g.stage; }
    },
    hide() { /* không có gì phải dừng */ },
    update(dt) {
      if (V.msgT > 0) V.msgT -= dt;
      VS.update(dt, V.tab !== 'hub' || !!V.moi);
      if (V.moi) { if (G.keyP.Escape && !V.gBusy) { inviteLater(); G.keyP.Escape = false; } return; } // đang hỏi liên kết Google: Esc = Để sau
      // Esc: huỷ câu hỏi xoá, hoặc đóng bảng quay về làng
      if (G.keyP.Escape) { if (V.confirm) V.confirm = false; else if (V.tab === 'weapon' && V.back !== 'hub') V.tab = V.back; else if (V.tab !== 'hub') goHub(); }
    },
    // Đợt 1 (Q4): vẽ làng như cũ (_draw), rồi nếu đang mời liên kết Google thì vẽ hộp mời đè lên trên.
    draw() {
      G.syncTaps = [];
      const moi = V.moi, c = moi ? G.click : null;
      if (moi) G.click = null; // lần chạm không lọt xuống bảng bên dưới
      this._draw();
      if (moi && V.moi === moi) inviteDraw(c);
      else if (!V.moi && V.tab === 'hub' && inviteWant('hub')) V.moi = { where: 'hub' };
    },
    _draw() {
      if (V.tab === 'title') V.tab = 'hub';
      if (V.tab === 'map') { mapScreen(); return; }
      if (V.tab === 'aingay') { if (G.aiNgay) G.aiNgay.screen(); else V.tab = 'map'; return; } // đợt 6: ải theo ngày
      VS.drawWorld(V.tab === 'hub' ? null : { dim: 0.62, hideHero: true });
      if (V.tab === 'hub') {
        VS.drawHud();
        if (G.hanhTrang) G.hanhTrang.hubButton(); // nút Hành trang (túi vải) góc trên bên phải, js/hanh_trang.js
        const S = VS.state;
        if (!Object.keys(G.save.stars).length && S.hintT <= 0 && !S.near && !S.path && S.msgT <= 0) T.toastFit(240, 244, 'Tới bến đò bên phải, gặp Chú Lái Đò để vào ải', { size: 7.5 });
        // mẹo lần đầu có điểm chưởng: tới Cụ Đồ, thẻ Cây chưởng (tắt khi đã mở thẻ đó)
        else if (G.chuong && !G.save.tut.chTip && Object.keys(G.save.stars).length && S.hintT <= 0 && !S.near && S.msgT <= 0 && G.chuong.pts(G.save.heroes[G.save.hero], G.save.hero).left > 0) T.toastFit(240, 244, 'Có điểm chưởng! Gặp Cụ Đồ ở gốc đa, thẻ Cây chưởng để học', { size: 7.5 });
        return;
      }
      VS.drawTop();
      if (V.tab === 'weapon') { weaponView(); return; }
      const hit = VS.drawStrip(V.who || WHO_OF[V.tab], true, true);
      if (hit && VS.shown && !VS.shown(hit)) say(G.moDan ? G.moDan.loiChuaMo(hit) : 'Cô Thợ May đi chợ xa. Qua ải Rừng già 2 rồi cô về may đồ cho bé.'); // V53 + mở dần
      else if (hit) { VS.goNpc(hit, true); return; }
      if (THE_B2[V.tab] && !theMo(V.tab)) V.tab = WHO_OF[V.tab] === 'tu' ? 'hero' : 'settings'; // thẻ Bước 2 bị tắt / chưa mở: về thẻ cũ
      if ((V.tab === 'skill' || V.tab === 'rank') && !theMoDan(V.tab)) V.tab = 'help'; // mở dần: Cụ Đồ chỉ còn thẻ Hướng dẫn
      if (V.tab === 'chuong' && !chuongOpen()) V.tab = theMoDan('skill') ? 'skill' : 'help';
      const fn = PANELS[V.tab] || settings;
      const tab = V.tab, line = fn();
      if (fn.full) return; // bảng tự vẽ người nói (Cô Thợ May)
      if (V.tab === tab || (WHO_OF[V.tab] && WHO_OF[V.tab] === WHO_OF[tab])) npcSide(line);
    },
  };

  // ---------- Đợt 1 (Q4): mời liên kết Google sau khi xong ải 1 ----------
  // Chỉ mời người đang chơi bằng tài khoản khách (ẩn danh) đã qua ải 1 (stars['0-0']) và đang nối được mây.
  // G.save.moiGoogle là trường MỚI, tuỳ chọn (bản lưu cũ không có): không có = chưa mời; 1 = đã bấm "Để sau" một lần;
  // 2 = đã bấm "Để sau" cả ở lần Anh Mõ nhắc lại → không tự mời nữa (nút Đăng nhập Google ở Anh Mõ vẫn luôn còn).
  // V.moiPhien: đã trả lời trong phiên chơi này → không hỏi lại cho tới lần mở game sau.
  function inviteWant(where) {
    const CL = G.cloud, sv = G.save;
    if (V.moiPhien || V.gBusy || !CL || !CL.online() || !CL.isGuest() || !sv || !sv.stars || !sv.stars['0-0']) return false;
    const n = sv.moiGoogle | 0;
    return where === 'hub' ? n === 0 : n === 1;
  }
  // Cất bản lưu của khách trước khi đăng nhập / liên kết Google. Nếu Google chuyển sang một tài khoản ĐÃ CÓ tiến trình ('switched'),
  // js/cloud.js có thể tự dùng bản trên mây mà không hỏi (khi bản của khách không hơn rõ rệt). Luồng đó giữ nguyên, không sửa ở đây;
  // chỉ chép nguyên văn bản của khách sang khoá dự phòng linhkhi_save_v1_khach (đã có bản khác thì ghi vào ..._khach2) để còn cứu lại được.
  function guestSnap() {
    try { const CL = G.cloud; return CL && CL.isGuest() && Object.keys(G.save.stars || {}).length ? JSON.stringify(G.save) : null; } catch (e) { return null; }
  }
  function guestKeep(snap, r) {
    if (!snap || r !== 'switched') return;
    try { const ls = window.localStorage, K = 'linhkhi_save_v1_khach', old = ls.getItem(K); ls.setItem(old === null || old === snap ? K : K + '2', snap); } catch (e) { /* bộ nhớ đầy: bỏ qua */ }
  }
  function inviteLater() {
    const M = V.moi;
    if (!M) return;
    V.moi = null; V.moiPhien = true;
    G.save.moiGoogle = M.where === 'hub' ? 1 : 2; G.persist();
    const m = 'Lúc nào muốn liên kết, gặp Anh Mõ ở cổng làng.';
    if (V.tab === 'hub') VS.say(m); else say(m);
  }
  // Liên kết thất bại (đóng cửa sổ, bị chặn, mất mạng…): chỉ báo lỗi trong hộp, KHÔNG đụng tới bản lưu trên máy hay trên mây.
  function inviteLink() {
    const CL = G.cloud, M = V.moi;
    if (!M || V.gBusy || !CL) return;
    V.gBusy = true; M.err = '';
    const snap = guestSnap();
    CL.google().then((r) => {
      guestKeep(snap, r);
      V.moi = null; V.moiPhien = true;
      const m = r === 'redirect' ? 'Đang chuyển sang trang Google…' : r === 'linked' ? 'Đã liên kết Google. Tiến trình được giữ nguyên.' : 'Đã đăng nhập Google.';
      if (V.tab === 'hub') VS.say(m); else say(m);
    }, (e) => { M.err = (e && e.message) || 'Lỗi'; }).then(() => { V.gBusy = false; });
  }
  function inviteDraw(click) {
    const CL = G.cloud, M = V.moi;
    // đã liên kết xong ở chỗ khác, hoặc mất kết nối giữa chừng: đóng hộp, không ghi gì
    if (!CL || !CL.isGuest() || (!CL.online() && !V.gBusy)) { V.moi = null; return; }
    const w = 284, h = 132, x = 98, y = 66, busy = !!V.gBusy;
    const bL = [x + 14, y + h - 34, 96, 24], bG = [x + w - 158, y + h - 34, 144, 24];
    G.syncTaps = busy ? [] : [{ x: bG[0], y: bG[1], w: bG[2], h: bG[3], fn: inviteLink }]; // chạy ngay trong lúc chạm để Safari không chặn cửa sổ Google
    G.click = click || null;
    T.dim(0.6);
    T.panel(x, y, w, h, 'Giữ tiến trình', { plain: true });
    ui.text('Liên kết Google để giữ tiến trình trên mọi máy', x + w / 2, y + 40, { size: 9, bold: true, align: 'center', color: GOLD });
    let yy = y + 54;
    if (M.err) {
      ui.wrap(G.t('Chưa liên kết được: {0}', M.err), w - 28, 7.5, true).slice(0, 2).forEach((l) => { ui.text(l, x + w / 2, yy, { size: 7.5, bold: true, align: 'center', color: WARN }); yy += 10; });
      ui.text('Tiến trình của bạn vẫn còn nguyên. Có thể thử lại hoặc để sau.', x + w / 2, yy + 1, { size: 7, align: 'center', color: TXT });
    } else {
      const body = busy ? 'Đang mở cửa sổ đăng nhập Google…' : 'Tiến trình đang chơi được giữ nguyên. Đổi máy hoặc xoá dữ liệu trình duyệt vẫn chơi tiếp được.';
      ui.wrap(body, w - 36, 7.5).slice(0, 3).forEach((l) => { ui.text(l, x + w / 2, yy, { size: 7.5, align: 'center', color: TXT }); yy += 10; });
    }
    if (T.btn(bL[0], bL[1], bL[2], bL[3], 'Để sau', { size: 9, disabled: busy })) inviteLater();
    else {
      if (T.btn(bG[0], bG[1], bG[2], bG[3], busy ? 'Đang mở Google…' : M.err ? 'Thử lại' : 'Liên kết Google', { size: 9, primary: !busy, disabled: busy })) inviteLink();
      if (!busy) googleMark(bG[0] + 15, bG[1] + bG[3] / 2);
    }
    G.click = null;
  }

  // Màn mở đầu (Đợt 1, quyết định Q4). Khi lưu mây dùng được (spiritblade.web.app): KHÔNG bắt đăng nhập nữa.
  //   - "Chơi ngay": vào luôn bằng tài khoản khách (ẩn danh Firebase, js/cloud.js tự đăng nhập và tự lưu mây). Mây chưa kịp nối
  //     thì vẫn vào, chơi lưu trên máy; nối được là js/cloud.js tự đồng bộ như cũ.
  //   - "Đăng nhập Google": cho người đã có tài khoản (chơi tiếp tiến trình cũ). Đã đăng nhập Google rồi thì nút chính là "Vào game".
  // Không có mây (bản xem trước trong Claude, mở tệp trên máy, mất mạng, ?cloud=0): chạm để chơi như cũ, chỉ lưu trên máy.
  function titleGate() {
    const CL = G.cloud;
    const need = !!(CL && !CL.why);
    const ok = !need || (CL.online() && !CL.isGuest());
    return { CL, need, ok };
  }
  // Tiếng Anh: thông báo đăng nhập hỏng của js/cloud.js có thể đã được dịch sẵn, nên so thêm với bản dịch (tiếng Việt không đi qua đây)
  function gMsgFail(m) { m = String(m); return m.indexOf(G.t('Chưa đăng nhập được: {0}', '')) === 0 || m === G.t('Google chưa trả kết quả đăng nhập về [no-redirect-result]'); }
  function titleLogin(CL) {
    if (V.gBusy) return;
    V.gBusy = true; V.tMsg = 'Đang mở trang đăng nhập Google…'; V.tMsgT = 30;
    // V1: đăng nhập thất bại (cửa sổ bị chặn, bị đóng, mở trong Zalo/Messenger/Facebook) → bật cờ V.loginFail để màn chào hiện dòng gợi ý mở bằng trình duyệt thật
    const snap = guestSnap();
    CL.google().then((r) => { guestKeep(snap, r); V.loginFail = false; V.tMsg = r === 'redirect' ? 'Đang chuyển sang trang Google…' : r === 'linked' ? 'Đã nối tài khoản Google, giữ nguyên tiến trình.' : 'Đã đăng nhập Google.'; }, (e) => { V.loginFail = true; V.tMsg = G.t('Chưa đăng nhập được: {0}', e.message); })
      .then(() => { V.gBusy = false; V.tMsgT = 8; say(V.tMsg); });
  }
  // Bố cục màn chào (toạ độ 480x270), Giai đoạn 4 yêu cầu 2: logo > nút chính > nút phụ > dòng thông tin.
  // Nút nào chạy ngay trong lúc chạm (G.syncTaps) thì dùng đúng ô của nút vẽ.
  // gg, bv (Đợt 1): hàng nút dưới "Chơi ngay" khi chưa đăng nhập Google: Đăng nhập Google | Bảng vàng. (guest: ô nút "Chơi tạm" cũ, nay không vẽ nữa.)
  // bia-moi 15/10 — bố cục trên ảnh bìa (js/bia.js): logo lên vùng trời tối phía trên giữa; nút xuống dải tối mờ dưới (y ≥ 176),
  // thấp hơn trống đồng ở bìa 1 (ảnh: tâm ≈ 120,145, bán kính ≈ 22) và lệch phải nó. Cỡ nút giữ nguyên (vùng chạm như cũ).
  // trong: mặt trống nhỏ trên chữ [x, y, bán kính]. logo: ô của ảnh gd-logo. (15/10 don-tep B: bỏ bố cục cũ TL_CU cùng cờ ?biacu=1.)
  const TL_BIA = { main: [140, 176, 200, 30], play: [160, 176, 160, 30], guest: [180, 213, 120, 20], row: [[128, 213, 108, 22], [244, 213, 108, 22]], gg: [112, 212, 150, 24], bv: [268, 212, 100, 24], info: 254, lang: [430, 5, 44, 16], logo: [140, 30, 200, 40], trong: [240, 15, 13] };
  const TL = {};
  function datBoCuc() { const M = TL_BIA; for (const k in M) TL[k] = JSON.parse(JSON.stringify(M[k])); }
  datBoCuc();
  G.titleLayout = TL; // để bài kiểm tra biết nút nằm ở đâu
  // Tiêu đề: chữ LINH KHÍ có viền tối dày + bóng đổ lệch xuống, dòng phụ SPIRITBLADE giãn chữ (tên miền spiritblade.web.app).
  function titleLogo() {
    const u = G.ux, dy = TL.logo[1] - 52, bia = !!(G.bia && G.bia.n); // dy: bố cục bìa dời cả khối logo lên trên (TL_BIA)
    T.drum(TL.trong[0], TL.trong[1], TL.trong[2], 0.85); // mặt trống đồng nhỏ làm biểu tượng, nằm trên chữ (không còn nằm sau chữ)
    // Phiên C3: có tệp gd-logo (ảnh AI 200×40, chữ LINH KHÍ khắc gỗ; trang tools/tach-giao-dien, lô "Logo") thì vẽ ảnh vào đúng chỗ của chữ;
    // không có thì vẽ chữ phông y như cũ. Dòng phụ và câu giới thiệu bên dưới vẫn là chữ của game.
    const SC = G.spriteCustom, logo = SC && SC.gdSan && SC.veGd ? SC.gdSan('gd-logo') : null;
    if (logo) SC.veGd(u, logo, TL.logo[0], TL.logo[1], TL.logo[2], TL.logo[3]);
    else {
      ui.font(38, true); u.textAlign = 'center'; u.lineJoin = 'round';
      u.fillStyle = 'rgba(0,0,0,0.55)'; u.fillText('LINH KHÍ', 240, 89 + dy);
      u.lineWidth = 5; u.strokeStyle = '#1a120a'; u.strokeText('LINH KHÍ', 240, 86 + dy);
      ui.text('LINH KHÍ', 240, 86 + dy, { size: 38, bold: true, align: 'center', color: GOLD, shadow: false });
      // vệt sáng mảnh trên nửa trên mặt chữ (ánh kim loại), chỉ một dải, không phát sáng
      u.save(); u.beginPath(); u.rect(120, 58 + dy, 240, 12); u.clip();
      ui.text('LINH KHÍ', 240, 86 + dy, { size: 38, bold: true, align: 'center', color: '#fff6d8', shadow: false }); u.restore();
    }
    // dòng phụ: chữ giãn rộng, hai gạch đồng hai bên
    ui.font(9, true);
    const sub = 'S P I R I T B L A D E', sw = u.measureText(sub).width;
    const gach = SC && SC.gdThay ? SC.gdThay('gd-bia-gach') : null; // 16/10 (ve-tay-8-gop-giao-dien): gạch đồng ảnh, núm thoi ở đầu trong (gạch trái lật ngang)
    if (gach) {
      const xp = Math.round(240 + sw / 2 + 8), xt = Math.round(240 - sw / 2 - 8);
      SC.veGd(u, gach, xp, 97.5 + dy, 18, 2);
      u.save(); u.translate(xt, 0); u.scale(-1, 1); SC.veGd(u, gach, 0, 97.5 + dy, 18, 2); u.restore();
    } else { u.fillStyle = '#a8752f'; u.fillRect(Math.round(240 - sw / 2 - 26), 98 + dy, 18, 1); u.fillRect(Math.round(240 + sw / 2 + 8), 98 + dy, 18, 1); }
    ui.text(sub, 240, 101.5 + dy, { size: 9, bold: true, align: 'center', color: '#d9a441' });
    // câu giới thiệu: trên ảnh bìa đặt trong ô cố định bằng hàm chung T.chuTrongKhung (tiếng Anh dài hơn thì tự thu cỡ, không tràn)
    if (bia && T.chuTrongKhung) T.chuTrongKhung('Vũ khí lớn lên theo bạn. Yêu tinh học theo bạn.', 90, 106 + dy, 300, 14, { vien: [0, 0, 0, 0], size: 8, min: 6.5, bold: false, color: TXT, shadow: true });
    else ui.text('Vũ khí lớn lên theo bạn. Yêu tinh học theo bạn.', 240, 116, { size: 8, align: 'center', color: TXT });
  }
  G.Title = {
    enter() { VS.enter({ from: 'keep' }); VS.state.x = 470; VS.state.cam = 230; datBoCuc(); },
    update(dt) {
      VS.update(dt, true);
      const g = titleGate();
      if (V.tRank) { if (G.keyP.Escape) V.tRank = false; return; } // đang xem Bảng vàng
      if (g.need) { if (G.keyP.Enter || G.keyP.Space) G.setScene(G.Village); return; } // vào bằng nút "Chơi ngay" / "Vào game"
      // không có mây: chạm chỗ trống để vào; chạm dải nút phụ thì không
      const r = TL.row, onBtns = G.downs.some((d) => d.y > r[0][1] - 4 && d.y < r[0][1] + r[0][3] + 4 && d.x > r[0][0] - 4 && d.x < r[1][0] + r[1][2] + 4);
      const L = TL.lang, onLang = G.downs.some((d) => d.x > L[0] - 6 - 8 && d.y < L[1] + L[3] + 6); // nút EN / VI ở góc trên phải
      if ((G.downs.length && !onBtns && !onLang) || G.keyP.Enter || G.keyP.Space || G.keyP.KeyJ) G.setScene(G.Village);
    },
    draw() {
      const c = G.wx;
      V.tab = 'title';
      // bia-moi 15/10: có bìa (js/bia.js) thì nền là ảnh bìa, BỎ hình Cu Tí đứng góc. Ảnh chưa về: cảnh làng như cũ (không Cu Tí), về thì hiện dần.
      const BIA = G.bia && G.bia.n ? G.bia : null, ha = BIA ? BIA.hien() : 0;
      if (ha < 1) VS.drawWorld({ dim: 0.42, hideHero: true }); // cảnh làng sống (đèn lồng chập chờn, khói lò rèn, đom đóm) dùng lại của village_scene.js
      if (BIA) {
        BIA.ve(c, ha, G.time);
        BIA.veMan(G.ux); // vùng tối sau logo + dải tối dưới cho nút
      }
      G.syncTaps = [];
      // Bảng vàng mở ngay trên màn mở đầu (không vào làng), có nút đóng
      if (!(V.tRank && G.bangVang)) titleLogo();
      else {
        const px = 80; // giữa màn hình
        T.dim(0.45);
        const py = PY + 28; // không có hàng thẻ như ở làng: khung thấp xuống, nội dung bảng vàng nằm ngay dưới tiêu đề
        T.panel(px, py, PW, PH - 28, 'Bảng vàng', { rightPad: 74, noBand: true });
        if (T.sbtn(px + PW - 66, py + 3, 60, 17, '✕ Đóng', { size: 8, pad: 5 })) V.tRank = false;
        G.bangVang.panel(px + (CX - PX), CW);
        return;
      }
      const { CL, need, ok } = titleGate();
      const M = TL.main, R0 = TL.row[0], R1 = TL.row[1];
      if (CL && CL.online() && CL.isGuest()) { // nút Đăng nhập chạy ngay trong lúc chạm để Safari không chặn cửa sổ Google
        if (need && !ok) G.syncTaps.push({ x: TL.gg[0], y: TL.gg[1], w: TL.gg[2], h: TL.gg[3], fn: () => titleLogin(CL) });
        if (!need || ok) G.syncTaps.push({ x: R0[0], y: R0[1], w: R0[2], h: R0[3], fn: () => titleLogin(CL) });
      }
      if (!need) {
        // không có mây: chạm đâu cũng vào. Dải chữ sáng lên tối đi nhẹ nhàng (không chớp tắt).
        const ga = G.ux.globalAlpha; G.ux.globalAlpha = ga * (0.62 + 0.38 * (0.5 + 0.5 * Math.sin(G.time * 3.2)));
        T.toastFit(240, M[1] + 7, 'Chạm để bắt đầu', { size: 11 });
        G.ux.globalAlpha = ga;
      } else if (ok) {
        const P = TL.play;
        if (T.btn(P[0], P[1], P[2], P[3], 'Vào game ▶', { size: 12, primary: true })) G.setScene(G.Village);
      } else {
        // Đợt 1 (Q4): hai nút rõ. "Chơi ngay" luôn bấm được (kể cả khi mây chưa kịp nối); "Đăng nhập Google" cho người đã có tài khoản.
        const loading = !CL.online(), busy = !!V.gBusy, Gg = TL.gg, Bv = TL.bv;
        if (T.btn(M[0], M[1], M[2], M[3], 'Chơi ngay ▶', { size: 12, primary: true })) G.setScene(G.Village);
        if (T.btn(Gg[0], Gg[1], Gg[2], Gg[3], loading ? (CL.status === 'error' ? 'Chưa kết nối được mây' : 'Đang kết nối…') : busy ? 'Đang mở Google…' : 'Đăng nhập Google', { size: 8.5, disabled: loading || busy })) titleLogin(CL);
        if (!loading && !busy) googleMark(Gg[0] + 15, Gg[1] + Gg[3] / 2);
        if (T.btn(Bv[0], Bv[1], Bv[2], Bv[3], '🏆 Bảng vàng', { size: 8, disabled: !G.bangVang })) { V.tRank = true; G.bangVang.reload && G.bangVang.reload(); }
        // V1: đăng nhập Google vừa thất bại → dòng gợi ý mở bằng trình duyệt thật (vẫn chơi được bằng "Chơi ngay")
        if (V.loginFail && !busy) ui.text('Mở bằng Chrome/Safari để đăng nhập Google', 240, Gg[1] + Gg[3] + 10, { size: 7, align: 'center', color: '#e8d7b0' });
      }
      if (CL) {
        const on = CL.online(), guest = CL.isGuest();
        if (!need || ok) {
          if (T.btn(R0[0], R0[1], R0[2], R0[3], on && !guest ? G.kd('✓ ' + String(CL.who()).slice(0, 14)) : 'Đăng nhập Google', { size: 8, primary: on && guest, disabled: !on || !guest })) titleLogin(CL);
          if (T.btn(R1[0], R1[1], R1[2], R1[3], '🏆 Bảng vàng', { size: 8, disabled: !G.bangVang })) { V.tRank = true; G.bangVang.reload && G.bangVang.reload(); }
        }
        if (CL.gMsg) { if (/^Chưa đăng nhập|chưa trả kết quả/.test(CL.gMsg) || (G.LANG !== 'vi' && gMsgFail(CL.gMsg))) V.loginFail = true; V.tMsg = CL.gMsg; V.tMsgT = 8; CL.gMsg = ''; }
        if (V.tMsgT > 0) V.tMsgT -= 1 / 60;
        const line = V.tMsgT > 0 && V.tMsg ? V.tMsg : need && !ok ? G.t('Đã có tài khoản? Bấm Đăng nhập Google để chơi tiếp tiến trình cũ. {0}', CL.label()) : CL.label();
        const mau = V.tMsgT > 0 && V.tMsg ? GOLD : '#c9bfa8';
        if (G.bia && G.bia.n && T.chuTrongKhung) { // bìa: hai dòng trong ô cố định trên dải tối (hàm chung đo cả tiếng Anh, dài thì thu cỡ / cắt "…")
          T.chuTrongKhung(line, 100, TL.info - 7, 280, 18, { vien: [0, 0, 0, 0], dem: 0, dong: 2, gian: 2, size: 7, min: 6, bold: false, color: mau, shadow: true });
        } else {
          const lines = ui.wrap(line, 260, 7); // hẹp để không chạm hình em bé bên trái
          lines.slice(0, 2).forEach((l, i) => ui.text(l, 240, TL.info + i * 9, { size: 7, align: 'center', color: mau }));
        }
      }
      // nút nhỏ đổi ngôn ngữ ngay ở màn mở đầu (chữ đang dùng sáng hơn); nhớ theo máy nên lần sau mở lại vẫn đúng
      const nr = 8; // chu-lech-khung: nút ảnh 44 rộng chỉ có lòng ~26 điểm cho "EN / VI" → rộng 52 (mép phải giữ nguyên)
      if (G.ngonNgu && T.sbtn(TL.lang[0] - nr, TL.lang[1], TL.lang[2] + nr, TL.lang[3], 'EN / VI', { size: 7.5, sel: G.LANG === 'en' })) G.ngonNgu.doi();
      // thông tin phụ: nhỏ, góc dưới bên phải, không tranh chỗ với nút
      ui.text(G.t('Phiên bản {0}', G.VERSION || '?'), 474, 264, { size: 7, align: 'right', color: 'rgba(232,222,196,0.85)', shadow: true });
    },
  };
  // Chữ G bốn màu nhỏ đầu nút Đăng nhập Google (vẽ điểm ảnh, không tải hình ngoài)
  function googleMark(x, cy) {
    const u = G.ux, k = 1, cols = ['#4285f4', '#ea4335', '#fbbc05', '#34a853'];
    const R = [
      '..rrrr..', '.rr..rr.', 'rr......', 'yy......', 'yy..bbbb', 'gg....bb', '.gg..bb.', '..gggg..'];
    u.save();
    u.fillStyle = '#fff6e8'; u.beginPath(); u.arc(x, cy, 6.5, 0, 7); u.fill();
    const m = { r: cols[1], y: cols[2], g: cols[3], b: cols[0] };
    R.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (m[row[i]]) { u.fillStyle = m[row[i]]; u.fillRect(x - 4 + i * k, cy - 4 + j * k, k, k); } });
    u.restore();
  }
})();
