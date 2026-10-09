// Mục F, G, H của tests/ghep2.py. Tệp này là một hàm chạy trong trang (T2 do ghep2.py dựng sẵn).
() => {
  const { ok, near, room, step, sec, dummy, paint } = T2;
  let P, W, S;
  const go = (o) => { const w = room(o); P = T2.P; W = T2.W; S = T2.S; return w; };
  const fix = (v) => { G.rnd = () => v; };
  const idOf = (type) => S.map.rooms.find((r) => r.type === type).id;
  // chạy tới khi hiện bảng kết quả
  const toResult = () => { let n = 0; while (S.mode === 'play' && n++ < 600) { step(1); if (S.won) G.usePortal(); } }; // sửa góp ý 2: thắng xong phải vào cổng mới hiện bảng

  // ================= F. VŨ KHÍ RƠI THEO BỐN BẬC TRONG HỆ PHÒNG MỚI =================
  // trùm vùng: ải cuối luôn là Kiểu C, lần đầu hạ chắc chắn rơi Vàng của vùng đó
  for (const r of [0, 1, 2]) {
    G.testSave({ hero: 'smith', lvl: 12 + r * 6, tier: 1 });
    const n0 = G.save.weapons.length;
    G.startStage(r, 4, 0);
    S = G.getRun();
    ok('F: ải trùm vùng ' + (r + 1) + ' dùng bản đồ Kiểu C', S.map.kind === 'C', S.map.kind);
    G.gotoRoom(S.map.boss);
    W = G.getWorld(); P = S.P;
    G.botInput = () => ({ mx: 0, my: 0 });
    const b = W.boss;
    ok('F: phòng trùm của ải cuối vùng ' + (r + 1) + ' có đúng trùm vùng', b && b.kind === G.REGIONS[r].boss, b && b.kind);
    P.inv = 99; b.invuln = 0; b.hp = 1; G.damage(b, 99, { w: G.curW(P), el: 'fire' }); // bỏ qua màn ra mắt của trùm
    for (let k = 0; k < 400 && S.mode === 'play' && !S.won; k++) { P.inv = 99; G.sim(1); }
    G.usePortal(); // sửa góp ý 2: hạ trùm thì cổng dịch chuyển mọc lên, vào cổng mới hiện bảng kết quả
    const R = S.result, line = R && R.lines.find((l) => l.w && l.s.indexOf('rơi') >= 0);
    ok('F: hạ trùm vùng ' + (r + 1) + ' lần đầu thì bảng kết quả có dòng trùm rơi vũ khí Vàng', S.mode === 'result' && line && G.wRar(line.w) === 3 && line.w.gold === r && line.s.indexOf('(Vàng)') > 0, line ? line.s : S.mode);
    ok('F: món Vàng nằm trong rương đồ và bản lưu ghi đã nhận', G.save.weapons.length === n0 + 1 && G.save.weapons.includes(line && line.w) && G.save.bossGold[G.REGIONS[r].boss] === true);
    // bảng kết quả vẽ được: hình vũ khí và tên mang màu bậc
    const realIcon = G.art.weaponIcon, realText = G.ui.text; let icons = 0, goldText = false;
    G.art.weaponIcon = function (c, w) { if (w === line.w) icons++; return realIcon.apply(this, arguments); };
    // màn kết quả mới: mỗi vũ khí là một thẻ viền màu bậc, tên món (không kèm lời dẫn) mang màu bậc
    G.ui.text = function (s2, x, y, o) { if (line && (s2 === line.s || s2 === G.wName(line.w)) && o && o.color === G.RARITY[3].col) goldText = true; return realText.apply(this, arguments); };
    S.modeT = -9; paint();
    G.art.weaponIcon = realIcon; G.ui.text = realText;
    ok('F: bảng kết quả vẽ hình món Vàng và tên màu Vàng (vùng ' + (r + 1) + ')', icons === 1 && goldText, icons + '/' + goldText);
    // đánh lại: Tím hoặc Vàng
    let rar = new Set();
    for (const v of [0.05, 0.9]) { fix(v); const w = G.bossDrop(r); rar.add(G.wRar(w)); G.rnd = Math.random; }
    ok('F: đánh lại trùm vùng ' + (r + 1) + ' thì rơi Tím, đôi khi Vàng', rar.has(2) && rar.has(3) && rar.size === 2, [...rar].join());
  }
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, T2.inp);
  // trùm nhỏ (ải thường): không rơi Vàng
  {
    let maxR = 0, n = 0;
    for (let k = 0; k < 12; k++) {
      go({ r: 2, i: 1, kind: 'B', seed: 20 + k, big: true, keep: true });
      G.save.weapons.length = 2; // còn chỗ trong rương
      fix(0.01 + k * 0.03);
      G.finishStage(true);
      G.rnd = Math.random;
      for (const l of S.result.lines) if (l.w) { n++; maxR = Math.max(maxR, G.wRar(l.w)); }
    }
    ok('F: qua ải thường (trùm nhỏ) nhận vũ khí bậc ngẫu nhiên, không bao giờ Vàng', n >= 3 && maxR <= 2, n + ' món, bậc cao nhất ' + maxR);
  }
  // rương báu trong phòng Rương của bản đồ mới
  {
    const seen = new Set(); let gold = 0, okFlow = true, detail = '';
    for (let k = 0; k < 40; k++) {
      go({ r: 2, i: 1, kind: ['A', 'B', 'C'][k % 3], seed: 5 + k, keep: true });
      G.gotoRoom(idOf('chest')); W = G.getWorld(); P = S.P;
      const chest = W.props.find((p) => p.act === 'chest');
      P.x = chest.x; P.y = chest.y + 8;
      step(1, { atkP: true, atk: true });
      if (S.mode !== 'chest' || !S.opts || S.opts[0].kind !== 'weapon') { okFlow = false; detail = 'không mở được rương ở lượt ' + k + ': ' + S.mode; break; }
      const o = S.opts[0]; seen.add(o.tier); if (o.tier > 2) gold++;
      if (k < 3) {
        const n0 = G.save.weapons.length;
        paint(); // khung đầu sau khi bảng mở sẽ bỏ lần chạm (chống bấm nhầm)
        G.click = { x: 72 + 54, y: 134 }; G.ui.begin(); G.scene.draw(); G.click = null;
        const got = S.got[S.got.length - 1];
        if (S.mode !== 'play' || G.save.weapons.length !== n0 + 1 || !got || !got.w || G.wRar(got.w) !== o.tier || got.w.family !== o.family || !chest.used) { okFlow = false; detail = 'chọn vũ khí trong rương không vào kho đúng bậc, lượt ' + k; break; }
        G.gotoRoom(S.map.boss); G.finishStage(true); // tới phòng trùm rồi kết thúc ải để xem bảng kết quả
        if (!S.result.lines.some((l) => l.w === got.w && l.s.indexOf('Trong ải') === 0)) { okFlow = false; detail = 'bảng kết quả thiếu dòng Trong ải'; break; }
      } else S.mode = 'play';
    }
    ok('F: mở rương trong phòng Rương báu, chọn vũ khí thì vào kho đúng bậc, đúng dòng và hiện ở bảng kết quả', okFlow, detail);
    ok('F: rương ra đủ Thường, Lam, Tím và không bao giờ Vàng', seen.has(0) && seen.has(1) && seen.has(2) && gold === 0, [...seen].sort().join());
  }
  // tinh anh trong phòng Tinh anh
  {
    go({ r: 1, i: 2, kind: 'A', seed: 7, keep: true });
    G.gotoRoom(idOf('elite')); W = G.getWorld(); P = S.P;
    let n = 0; while (!W.ents.some((e) => e.role === 'elite') && n++ < 2400) { P.inv = 99; for (const e of W.ents) if (e.role !== 'elite') G.damage(e, 1e9, { w: G.curW(P) }); step(1); }
    const el = W.ents.find((e) => e.role === 'elite');
    ok('F: phòng Tinh anh của bản đồ mới có quái tinh anh ở đợt cuối', !!el);
    if (el) {
      const n0 = G.save.weapons.length;
      fix(0.01); el.hp = 1; G.damage(el, 99, { w: G.curW(P) }); G.rnd = Math.random;
      const got = S.got.find((g) => g.w);
      ok('F: hạ tinh anh thì có thể rơi vũ khí: vào kho, có dòng báo màu bậc, không phải Vàng', G.save.weapons.length === n0 + 1 && got && G.wRar(got.w) <= 2 && W.banner && W.banner.s.indexOf('Tinh anh rơi') === 0 && W.banner.col === G.RARITY[G.wRar(got.w)].col, W.banner && W.banner.s);
      step(30);
      G.gotoRoom(S.map.boss); G.finishStage(true);
      ok('F: vũ khí tinh anh rơi hiện ở bảng kết quả (dòng Trong ải)', S.result.lines.some((l) => l.w === (got && got.w)));
    }
    // tỉ lệ bậc theo vùng: vùng 3 tốt hơn vùng 1
    const cnt = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const rnd = G.srand(77); G.rnd = rnd;
    for (const r of [0, 2]) for (let k = 0; k < 3000; k++) cnt[r][G.rollRarity(r)]++;
    G.rnd = Math.random;
    ok('F: bậc vũ khí rơi theo vùng: vùng 3 ra Lam và Tím nhiều hơn vùng 1', cnt[2][2] > cnt[0][2] * 2 && cnt[2][1] > cnt[0][1] && cnt[0][0] > cnt[2][0], JSON.stringify([cnt[0], cnt[2]]));
  }
  // rương đồ đầy: món thường đổi thành vàng, món Vàng của trùm vẫn giữ
  {
    G.testSave({ lvl: 10 });
    while (G.save.weapons.length < 12) G.newWeapon(G.save, 'sword', 0);
    const g0 = G.save.gold, w1 = G.giveWeapon('spear', 1);
    G.startStage(0, 4, 0); S = G.getRun();
    const w2 = G.bossDrop(0);
    ok('F: rương đồ đầy thì món thường đổi thành vàng, món Vàng của trùm vẫn được giữ', w1 === null && G.save.gold > g0 && w2 && G.wRar(w2) === 3 && G.save.weapons.length === 13);
  }
  // bảng kết quả nhiều dòng (hai cột) vẽ không lỗi và có hình cho từng vũ khí
  {
    go({ r: 1, i: 4, kind: 'C', seed: 3, big: true, keep: true });
    for (let k = 0; k < 4; k++) { const w = G.newWeapon(G.save, G.WKEYS[k], k % 3); S.got.push({ s: G.wName(w), w }); }
    S.loot.finalEl = 'fire';
    G.finishStage(true);
    const realIcon = G.art.weaponIcon; let icons = 0;
    G.art.weaponIcon = function () { icons++; return realIcon.apply(this, arguments); };
    S.modeT = -9; S.fade = 0; let err = '';
    try { paint(); } catch (e) { err = String(e); }
    G.art.weaponIcon = realIcon;
    const nw = S.result.lines.filter((l) => l.w).length;
    ok('F: bảng kết quả nhiều dòng (' + S.result.lines.length + ' dòng, ' + nw + ' vũ khí) vẽ không lỗi, mỗi vũ khí có hình', !err && nw >= 5 && icons >= nw + 2 && S.result.lines.length <= 16, err || icons);
  }

  // ================= G. SUỐI CHỈ DÙNG ĐƯỢC KHI ĐÃ DỌN ĐỦ 3 PHÒNG QUÁI =================
  {
    go({ kind: 'B', seed: 9, keep: true });
    const fid = idOf('fountain');
    G.gotoRoom(fid); W = G.getWorld(); P = S.P;
    // gotoRoom coi như đã dọn đủ; bỏ đi để dựng cảnh ghé suối sớm
    for (const r of S.map.rooms) if (r.type === 'fight' || r.type === 'elite') delete S.cleared[r.id];
    const hpF = W.props.find((p) => p.type === 'fountain' && p.kind === 'hp'), mnF = W.props.find((p) => p.type === 'fountain' && p.kind === 'mana');
    ok('G: (chuẩn bị) phòng Suối hồi có hai suối, chưa dọn phòng quái nào', hpF && mnF && G.fountainLocked() === true);
    P.hp = P.maxhp * 0.3; P.mana = 0; P.x = hpF.x; P.y = hpF.y + 8;
    step(2);
    ok('G: ghé suối sớm thì suối không phải vật bấm được', S.near !== hpF && S.near !== mnF, S.near && S.near.act);
    const hp0 = P.hp;
    step(1, { atkP: true, atk: true }); step(20);
    ok('G: bấm Đánh cạnh suối còn khóa thì không hồi máu, suối chưa bị dùng', P.hp <= hp0 + 0.01 && !hpF.used && !mnF.used, (P.hp - hp0).toFixed(1));
    const realText = G.ui.text, realProp = G.art.prop; let texts = [], alphas = [];
    G.ui.text = function (s2, x, y, o) { texts.push([String(s2), o && o.color]); return realText.apply(this, arguments); };
    S.fade = 0; paint();
    ok('G: suối còn khóa hiện dòng "Dọn hết quái rồi quay lại" và số phòng đã dọn', texts.some((t) => t[0] === 'Dọn hết quái rồi quay lại') && texts.some((t) => t[0] === 'Đã dọn 0/3 phòng quái'), texts.map((t) => t[0]).filter((t) => t.indexOf('ọn') > 0).join(' | '));
    ok('G: suối còn khóa không hiện nhãn "Hồi máu", "Hồi mana" hay "Bấm Đánh"', !texts.some((t) => t[0] === 'Hồi máu' || t[0] === 'Hồi mana' || t[0] === 'Bấm Đánh'));
    ok('G: suối còn khóa được vẽ mờ', hpF.dim === true && mnF.dim === true);
    // vẽ mờ thật: độ đậm lúc vẽ suối nhỏ hơn 0,5
    const c = G.wx, oldDraw = c.drawImage, oldFill = c.fillRect; let aMax = 0, calls = 0, inF = false;
    const wrapProp = G.art.prop;
    G.art.prop = function (cx, o) { inF = o.type === 'fountain'; try { return wrapProp.apply(this, arguments); } finally { inF = false; } };
    c.drawImage = function () { if (inF) { calls++; aMax = Math.max(aMax, c.globalAlpha); } return oldDraw.apply(c, arguments); };
    c.fillRect = function () { if (inF) { calls++; aMax = Math.max(aMax, c.globalAlpha); } return oldFill.apply(c, arguments); };
    paint();
    c.drawImage = oldDraw; c.fillRect = oldFill; G.art.prop = wrapProp;
    ok('G: hình suối còn khóa vẽ với độ đậm dưới một nửa', calls > 0 && aMax < 0.5, calls + ' lệnh vẽ, đậm nhất ' + aMax.toFixed(2));
    // dọn 2 phòng: vẫn khóa; đủ 3: mở
    const fights = S.map.rooms.filter((r) => r.type === 'fight' || r.type === 'elite');
    S.cleared[fights[0].id] = true; S.cleared[fights[1].id] = true;
    step(1, { atkP: true, atk: true }); step(5);
    texts = []; paint();
    ok('G: dọn 2/3 phòng quái thì suối vẫn khóa và ghi đúng 2/3', !hpF.used && G.fountainLocked() && texts.some((t) => t[0] === 'Đã dọn 2/3 phòng quái'));
    S.cleared[fights[2].id] = true;
    step(2); texts = []; paint();
    ok('G: dọn đủ 3 phòng quái thì suối sáng lại, hiện nhãn và bấm được', !G.fountainLocked() && hpF.dim === false && S.near === hpF && texts.some((t) => t[0] === 'Bấm Đánh') && !texts.some((t) => t[0] === 'Dọn hết quái rồi quay lại'));
    const h1 = P.hp;
    step(1, { atkP: true, atk: true }); step(3);
    ok('G: lúc đó bấm Đánh thì hồi nửa máu, và cả hai suối đã dùng (chỉ một lần mỗi ải)', P.hp > h1 + P.maxhp * 0.4 && hpF.used && mnF.used, (P.hp - h1).toFixed(0));
    G.ui.text = realText;
    // Kiểu A và C: tới suối theo đường thật thì luôn đã đủ 3 phòng
    let allOpen = true, why = '';
    for (const kind of ['A', 'C']) for (const seed of [2, 3, 5, 8, 13]) {
      const map = G.mapgen.make(kind, seed), M = G.mapgen;
      const f = map.rooms.find((r) => r.type === 'fountain');
      // đường ngắn nhất tới suối mà chỉ qua phòng đã dọn: đếm số phòng quái buộc phải dọn
      const cleared = {};
      for (const r of map.rooms) if (r.type !== 'fight' && r.type !== 'elite' && r.type !== 'challenge' && r.type !== 'boss') cleared[r.id] = true;
      // dọn dần: mỗi lượt dọn thêm các phòng quái tới được; dừng khi tới được suối
      let reach = false, guard = 0, need = 0;
      const canPass = (a, b2) => !M.isGate(map, a, b2) || M.gateOpen(map, cleared);
      const reachable = () => { const seenR = { [map.start]: true }, q = [map.start]; while (q.length) { const a = q.shift(); if (!cleared[a] && a !== map.start) continue; for (const d of M.DKEYS) { const b2 = map.rooms[a].doors[d]; if (b2 == null || seenR[b2] || !canPass(a, b2)) continue; seenR[b2] = true; q.push(b2); } } return seenR; };
      cleared[map.start] = true;
      while (!reach && guard++ < 10) {
        const R = reachable();
        if (R[f.id]) { reach = true; break; }
        const next = map.rooms.find((r) => R[r.id] && !cleared[r.id] && (r.type === 'fight' || r.type === 'elite'));
        if (!next) break;
        cleared[next.id] = true; need++;
      }
      if (!reach || need < 3) { allOpen = false; why += kind + seed + ':' + need + ' '; }
    }
    ok('G: ở Kiểu A và C, muốn tới Suối hồi thì đã phải dọn đủ 3 phòng quái (suối luôn dùng được ngay)', allOpen, why);
  }

  // ================= H. HOẠT ẢNH TRÙM KHỚP VÙNG CẢNH BÁO =================
  {
    const ZK = G.ZK;
    // Đợt quái mới: trùm dùng hình và cử động của js/monster_art.js; vùng cảnh báo do luật chơi vẽ (vòng tròn và vành khăn
    // cùng độ dẹt G.ZK), hình trùm không vẽ thêm vùng báo riêng nữa. Các mục dưới thay cho bài cũ về vòng gai, vòng nứt đất.
    // Ngư Tinh: chiêu xoáy nước (c5): vòng tròn quanh thân rồi vành sóng bên ngoài
    go({ r: 1, i: 4, kind: 'C', seed: 3, big: true, keep: true, lvl: 20 });
    G.botInput = () => ({ mx: 0, my: 0 });
    let b = W.boss; P.inv = 1e9; b.invuln = 0; b.busy = 0; b.hp = b.maxhp * 0.3;
    ok('H: (chuẩn bị) phòng trùm vùng 2 có Ngư Tinh', b && b.kind === 'ngu', b && b.kind);
    let zone = null, ring = null, an0 = null;
    for (let k = 0; k < 900 && !(zone && ring); k++) {
      if (!(b.an && b.an.n === 'c5') && b.busy <= 0 && k % 20 === 0) G.bossDebug('c5');
      P.inv = 1e9; P.hp = P.maxhp; G.sim(1);
      const z = W.zones.find((q) => q.src === b && q.shape === 'circle' && q.t > 0), d = W.zones.find((q) => q.src === b && q.shape === 'donut' && q.t > 0);
      if (z && d && b.an && b.an.n === 'c5') { zone = { x: z.x, y: z.y, r: z.r }; ring = { x: d.x, y: d.y, r0: d.r0, r1: d.r1 }; an0 = { x: b.x, y: b.y }; }
    }
    ok('H: Ngư Tinh ra được đòn xoáy nước và có vùng cảnh báo tròn', !!zone && !!ring, zone ? JSON.stringify(zone) : 'không thấy vùng');
    if (zone && ring) {
      ok('H: vòng xoáy của Ngư Tinh cùng tâm với chỗ trùm đứng', near(an0.x, zone.x, 1) && near(an0.y, zone.y, 1));
      ok('H: vành sóng ngoài cùng tâm với vòng xoáy, mép trong khớp mép ngoài vòng xoáy', near(ring.x, zone.x, 0.01) && near(ring.y, zone.y, 0.01) && near(ring.r0, zone.r, 0.01));
      ok('H: vành sóng rộng ra ngoài vòng xoáy một khoảng vừa phải (còn chỗ đứng trong phòng)', ring.r1 > ring.r0 + 30 && ring.r1 < 140, ring.r0 + '..' + ring.r1);
    }
    // Vùng cảnh báo tròn và vành khăn tròn theo độ dẹt G.ZK (so điểm ảnh có và không có vùng)
    go({ r: 0, i: 4, kind: 'C', seed: 3, big: true, keep: true, lvl: 12 });
    G.botInput = () => ({ mx: 0, my: 0 });
    b = W.boss; P.inv = 1e9;
    const cw = G.wx.canvas.width, chh = G.wx.canvas.height;
    // vùng báo trước giờ vẽ mịn ở lớp giao diện (js/bao_truoc.js): ghép lớp #world và phần khung game của lớp #ui rồi mới so
    const mix = document.createElement('canvas'); mix.width = cw; mix.height = chh; const c = mix.getContext('2d', { willReadFrequently: true });
    const shot = () => { G.ui.begin(); G.scene.draw(); c.clearRect(0, 0, cw, chh); c.drawImage(G.wx.canvas, 0, 0); c.drawImage(G.ux.canvas, G.ox * G.dpr, G.oy * G.dpr, G.W * G.uiScale, G.H * G.uiScale, 0, 0, cw, chh); return c.getImageData(0, 0, cw, chh).data; };
    const diffBox = (A0, B0) => { let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1; for (let y = 0; y < chh; y++) for (let x = 0; x < cw; x++) { const i = (y * cw + x) * 4; if (A0[i] !== B0[i] || A0[i + 1] !== B0[i + 1] || A0[i + 2] !== B0[i + 2]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } } return [x0, y0, x1, y1]; };
    const freeze = G.time;
    b.x = W.geo.cx + 90; b.y = W.y0 + 10; // dời trùm ra góc cho khỏi đè lên vùng đang đo
    for (const [kind, r, name] of [['donut', 64, 'vành gai rễ của Mộc Tinh'], ['circle', 40, 'vòng nứt đất của trùm nhỏ']]) {
      W.zones = []; W.parts = []; W.texts = []; W.shake = 0; S.fade = 0; W.banner = null;
      const zx = W.geo.cx - 40, zy = W.geo.cy + 10;
      G.time = freeze; const base = shot();
      W.zones = [kind === 'donut' ? { shape: 'donut', x: zx, y: zy, r0: 30, r1: r, t: 0.5, t0: 1, dmg: 1 } : { shape: 'circle', x: zx, y: zy, r, t: 0.5, t0: 1, dmg: 1 }];
      G.time = freeze; const withFx = shot();
      W.zones = [];
      const bx = diffBox(base, withFx);
      const down = bx[3] - zy, half = (bx[2] - bx[0]) / 2;
      ok('H: ' + name + ' tròn theo vùng cảnh báo: mép dưới xuống tới khoảng ' + Math.round(r * ZK) + ' điểm ảnh (trước chỉ ' + Math.round(r * 0.6) + ')', bx[3] > 0 && down >= r * ZK * 0.72 && down <= r * ZK * 1.15 && half <= r * 1.2, 'xuống ' + down + ', rộng nửa ' + half.toFixed(0));
    }
    G.botInput = () => Object.assign({ mx: 0, my: 0 }, T2.inp);
  }
  G.rnd = Math.random;
  return T2.out.splice(0);
}
