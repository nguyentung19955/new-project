"""Còn vẽ tay 8: kiểm kê MỌI hình vẽ code người chơi thấy (lớp trận #world VÀ lớp giao diện #ui), bản game một tệp
game/dist/linh-khi.html, cờ mặc định (đang chặn vẽ code). Headless, bot tự đánh, KHÔNG chơi thử bằng tay.
    python3 kiemke8.py <thư mục ra> [nhóm,nhóm...]     nhóm: lang, vung0, vung1, vung2, vung3 (mặc định: tất cả)
Ra: <ra>/kk-<nhóm>.json  (dem: {khoá: {n, f, nhan, ex}}, snaps: {khoá: {png, bb, nhan}}, loi: [...])
Khoá = '<lớp W|U> <lệnh> | <hàm chủ>@<dòng dist> [⇐ hàm đã vẽ lên canvas phụ được dán]'."""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../../../../../game'))
sys.path.insert(0, os.path.join(ROOT, 'tests'))
from quai_lib import sync_playwright, LIB

od = sys.argv[1]; os.makedirs(od, exist_ok=True)
NHOM = sys.argv[2].split(',') if len(sys.argv) > 2 else ['lang', 'vung0', 'vung1', 'vung2', 'vung3']
URL = 'file://' + ROOT + '/dist/linh-khi.html?cloud=0' + os.environ.get('THEM', '')  # THEM='&vecode=1': bản vẽ code cũ (lấy hình mẫu cho chỗ đã tắt)

RUN = r"""
(() => {
  T.chay = (nhan, n, every, inp, sau) => {
    console.log('CANH ' + nhan + ' ' + Math.round(performance.now() / 1000));
    for (let k = 0; k < n; k++) {
      const bat = k % every === 0; window.__nhan = nhan;
      if (bat) window.__khung();
      window.__bat = bat;
      try { T.frame(1, inp ? inp(k) : null); if (G.theme && G.theme.endFrame) G.theme.endFrame(); } finally { window.__bat = false; }
      if (bat) window.__snap();
      if (sau) sau(k);
    }
  };
  T.vao = (r) => { G.startStage(r, 2, 0); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; };
  T.boss0 = T.boss; T.boss = (r, big, o) => { const x = T.boss0(r, big, o); x.S.fade = 0; return x; };
  T.song = (keep) => { const S = G.getRun(); if (!S || !S.P) return; const P = S.P; if (P.hp < P.maxhp * (keep || 0.4)) P.hp = P.maxhp; P.mana = P.maxmana || P.mana; P.dead = false; if (S.W && S.W.over === 'dead') S.W.over = null; };
  T.save = (o) => G.testSave(Object.assign({ lvl: 30, gold: 99999, melee: 'sword', branch: 'fire', marksMoi: G.MARKS[1] + 30 }, o || {}));
  T.giau = () => { const sv = G.save; sv.stars = sv.stars || {}; for (let i = 0; i < 12; i++) sv.stars['r' + (i >> 2) + 's' + (i % 4)] = 3; sv.ore = 999; sv.gems = 999; };
})();
"""

# ---------- làng ----------
LANG = r"""() => {
  T.save(); T.giau();
  G.setScene(G.Title); T.chay('Màn chào', 24, 3);
  G.setScene(G.Village); const VA = G.villageApi, V = VA.V;
  T.chay('Làng (giữa làng)', 60, 4);
  const VS = G.villageScene;
  // đi lại trong làng (cần điều khiển: lấy theo bàn phím ảo)
  T.chay('Làng (đi lại)', 60, 4, (k) => ({ mx: k < 30 ? 1 : -1, my: 0 }));
  const THE = [['lai', 'map'], ['ren', 'forge', 'sharpen'], ['ren', 'forge', 'vk'], ['ren', 'forge', 'up'], ['ren', 'forge', 'ep'], ['xen', 'gear'], ['may', 'outfit'],
    ['do', 'skill'], ['do', 'chuong'], ['do', 'help'], ['do', 'rank'], ['tu', 'hero'], ['tu', 'so'], ['tu', 'thanhTuu'], ['mo', 'settings'], ['mo', 'viecNgay']];
  for (const [who, tab, ft] of THE) {
    try { VA.goHub(); VA.open(who); V.tab = tab; if (ft) V.ftab = ft; T.chay('Làng › ' + who + ' › ' + tab + (ft ? ' › ' + ft : ''), 14, 3); } catch (e) { T.errs.push('the ' + tab + ': ' + e); }
  }
  for (const t of ['hero', 'weapon', 'skill', 'res']) { try { VA.goHub(); G.hanhTrang.openVillage(); G.hanhTrang.tab = t; T.chay('Làng › Hành trang › ' + t, 14, 3); } catch (e) { T.errs.push('bag ' + t + ': ' + e); } }
  try { VA.goHub(); VA.viewWeapon(G.save.carry[0], 'hub'); T.chay('Làng › Xem vũ khí', 14, 3); } catch (e) { T.errs.push('xemvk ' + e); }
  try { VA.goHub(); V.tab = 'aingay'; T.chay('Làng › Ải ngày', 14, 3); } catch (e) { T.errs.push('aingay ' + e); }
  // ăn mừng nâng cấp ở lò rèn
  try {
    VA.goHub(); VA.open('ren'); V.tab = 'forge'; V.ftab = 'vk';
    const w = G.save.weapons.find((x) => x.id === G.save.carry[0]); w.marks.fire = G.MARKS[2] + 10;
    if (G.vkMoi && G.vkMoi.nang) G.vkMoi.nang(G.save, w, 'fire');
    T.chay('Làng › Ăn mừng nâng cấp', 90, 3);
  } catch (e) { T.errs.push('anmung ' + e); }
  VA.goHub();
}"""

# ---------- một vùng ----------
VUNG = r"""([r, combos, N, NB]) => {
  const vn = ['Rừng già', 'Hang biển', 'Lâu đài cổ', 'Sông sâu'][r];
  const giu = () => T.song(0.35);
  // phòng bắt đầu
  T.save({ melee: combos[0][0], branch: combos[0][1] }); G.rnd = G.srand(31 + r); T.vao(r);
  { const W = G.getWorld(); for (const d of W.doors || []) d.open = true; }
  T.chay(vn + ' › phòng bắt đầu', 40, 4, null, giu);
  // phòng quái: 4 vũ khí × hệ, bot tự đánh (chém, lộn, chiêu, chưởng, đổi vũ khí)
  for (const [m, el, bac, cung] of combos) {
    try {
      G.pointers.clear();
      T.save({ melee: m, branch: el, marksMoi: el ? (bac ? G.MARKS[2] + 50 : G.MARKS[0] + 20) : 0 }); T.giau();
      G.rnd = G.srand(11 + r);
      T.vao(r);
      const S = G.getRun(); const id = S.map.rooms.findIndex((x) => x.type === 'fight'); if (id >= 0) G.gotoRoom(id);
      const W2 = G.getWorld(); W2.waveT = 0.01;
      W2.waves = [['rusher', 'swarm', 'archer', 'shield', 'bomber', 'spiky', 'kami', 'nimble'], ['elite', 'rusher', 'archer', 'bomber'], ['spiky', 'kami', 'swarm', 'shield']];
      if (cung) S.P.cur = 1;
      T.useBot(true);
      const ten = vn + ' › phòng quái › ' + (cung ? 'phi tiêu' : m) + ' ' + (el || 'không hệ') + (bac ? ' (Thức tỉnh)' : '');
      T.chay(ten, N, 5, null, (k) => { giu(); const P = G.getRun() && G.getRun().P; if (!P) return;
        if (k % 47 === 20) T.inp.dodgeP = true; if (k % 61 === 30) T.inp.skillP = true; if (k % 53 === 10) T.inp.specialP = true; if (!cung && k % 97 === 50) T.inp.swapP = true; });
      T.useBot(false);
    } catch (e) { T.errs.push('phong ' + r + ' ' + m + ' ' + el + ': ' + e); T.useBot(false); }
  }
  // tinh anh, thử thách, lời nguyền (đánh)
  for (const ty of ['elite', 'challenge']) {
    try {
      T.save({ melee: combos[1][0], branch: combos[1][1] }); G.rnd = G.srand(51 + r); T.vao(r); G.testGoto(ty);
      T.useBot(true); T.chay(vn + ' › phòng ' + ty, 220, 5, null, giu); T.useBot(false);
      // bàn thờ lời nguyền / bảng
      const S = G.getRun(), W = G.getWorld();
      const pr = (W.props || []).find((p) => p.act === 'altar');
      if (pr) { S.mode = 'play'; W.enemies = []; W.waves = []; S.P.x = pr.x; S.P.y = pr.y + 6; T.chay(vn + ' › bàn thờ', 10, 3); T.frame(1, { atkP: true }); T.chay(vn + ' › bảng lời nguyền', 14, 3); S.mode = 'play'; }
    } catch (e) { T.errs.push(ty + ' ' + r + ': ' + e); T.useBot(false); }
  }
  // rương, suối, thương nhân: tới gần, bấm
  for (const ty of ['chest', 'fountain', 'merchant', 'curse']) {
    try {
      T.save({ melee: combos[2][0], branch: combos[2][1] }); G.rnd = G.srand(61 + r); T.vao(r); G.testGoto(ty);
      const S = G.getRun(), W = G.getWorld(); W.waves = []; W.spawns = [];
      T.chay(vn + ' › phòng ' + ty, 40, 4, null, giu);
      const pr = (W.props || []).find((p) => p.act === (ty === 'curse' ? 'altar' : ty));
      if (pr) { S.P.x = pr.x; S.P.y = pr.y + 8; T.chay(vn + ' › ' + ty + ' (đứng gần)', 12, 3); T.frame(1, { atkP: true }); T.chay(vn + ' › ' + ty + ' (bảng)', 20, 3); S.mode = 'play'; }
    } catch (e) { T.errs.push(ty + ' ' + r + ': ' + e); }
  }
  // các bảng trong ải
  try {
    T.save(); G.rnd = G.srand(71 + r); T.vao(r); const S = G.getRun();
    for (const md of ['paused', 'map', 'bag']) { S.mode = md; T.chay(vn + ' › bảng ' + md, 12, 3); }
    S.mode = 'play';
  } catch (e) { T.errs.push('bang ' + r + ': ' + e); }
  // trùm nhỏ
  try {
    const [m, el] = combos[3];
    T.boss(r, false, { seed: 3 + r, save: { lvl: 30, melee: m, branch: el, marksMoi: G.MARKS[2] + 50 } });
    T.useBot(true); T.chay(vn + ' › trùm nhỏ', NB, 5, null, (k) => { giu(); const b = G.getWorld().boss; if (b && b.hp < b.maxhp * 0.2 && k < NB * 0.8) b.hp = b.maxhp * 0.5; }); T.useBot(false);
  } catch (e) { T.errs.push('trumnho ' + r + ': ' + e); T.useBot(false); }
  // trùm vùng 3 pha
  for (const [ph, frac] of [[1, 1.0], [2, 0.6], [3, 0.3]]) {
    try {
      const [m, el] = combos[ph % 4];
      const { W, P, b } = T.boss(r, true, { seed: 3 + r, save: { lvl: 30, melee: m, branch: el, marksMoi: G.MARKS[2] + 50 } });
      if (b) b.hp = b.maxhp * frac;
      T.useBot(true);
      T.chay(vn + ' › trùm vùng pha ' + ph, NB, 5, null, (k) => { giu(); const bb = G.getWorld().boss; if (bb && bb.hp < bb.maxhp * (frac - 0.25) && k < NB * 0.9) bb.hp = bb.maxhp * (frac - 0.05); });
      T.useBot(false);
    } catch (e) { T.errs.push('trum ' + r + ' pha ' + ph + ': ' + e); T.useBot(false); }
  }
  // trúng đòn rồi chết
  try {
    T.save(); G.rnd = G.srand(81 + r); T.vao(r); G.testGoto('fight');
    const W = G.getWorld(); W.waveT = 0.01; W.waves = [['rusher', 'rusher', 'archer', 'bomber', 'spiky']];
    T.chay(vn + ' › trúng đòn', 120, 4, null, (k) => { const P = G.getRun().P; P.inv = 0; if (P.hp < P.maxhp * 0.15) P.hp = P.maxhp * 0.5; });
    const P = G.getRun().P; P.hp = 1; P.inv = 0;
    T.chay(vn + ' › chết', 200, 4, null, (k) => { const S = G.getRun(); if (S && S.P && !S.P.dead && S.W && k > 30) { S.P.hp = 0; } });
    T.chay(vn + ' › bảng thua', 20, 3);
  } catch (e) { T.errs.push('chet ' + r + ': ' + e); }
  // màn kết quả (thắng)
  try {
    T.save(); G.rnd = G.srand(91 + r); T.vao(r); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.gotoRoom(S.map.boss); S.got.push('3 quặng'); G.finishStage(true); S.modeT = -9;
    T.chay(vn + ' › màn kết quả', 60, 3);
  } catch (e) { T.errs.push('ketqua ' + r + ': ' + e); }
}"""

RIENG = r"""() => {
  // nước dâng trận Ngư Tinh (Hang biển): đặt W.shrink như lúc trùm dâng nước (chỉ để chụp hình, không đổi luật)
  const { W, P, b } = T.boss(1, true, { seed: 4, save: { lvl: 30 } });
  const g = W; const y0 = (W.y0 || 60) + 40, y1 = (W.y1 || 230) - 40;
  W.shrink = { y0, y1, x0: (W.x0 || 40) + 50 };
  T.chay('Hang biển › nước dâng Ngư Tinh', 30, 3, null, () => T.song(0.5));
  W.shrink = null;
}"""

SONG = r"""() => {
  // Sông sâu: dòng chảy, cầu tre, vũng sâu, lục bình, đèn dầu, vũng độc lục bình / vệt dầu cháy (bấm vật)
  for (let i = 0; i < 6; i++) {
    T.save(); G.rnd = G.srand(200 + i); T.vao(3); const S = G.getRun();
    const ids = S.map.rooms.map((x, k) => [x.type, k]).filter((x) => x[0] === 'fight' || x[0] === 'elite');
    const id = ids[i % ids.length]; if (id) G.gotoRoom(id[1]);
    const W = G.getWorld(); W.waves = []; W.spawns = []; W.enemies = [];
    T.chay('Sông sâu › địa hình ' + i, 20, 2, null, () => T.song(0.5));
    const props = (W.props || []).filter((p) => p.type === 'lucbinh' || p.type === 'dendau');
    for (const pr of props.slice(0, 2)) { try { G.triggerProp(pr); } catch (e) { T.errs.push('prop ' + e); } }
    if (props.length) T.chay('Sông sâu › vũng lục bình / dầu cháy ' + i, 24, 2, null, () => T.song(0.5));
  }
}"""

# 4 vũ khí × 4 (3 hệ + không hệ), chia đều 4 vùng: (melee, hệ, Thức tỉnh?, cầm phi tiêu?)
COMBOS = [
    [('sword', 'poison', 0, 0), ('spear', 'fire', 1, 0), ('hammer', 'ice', 0, 0), ('sword', None, 0, 1)],
    [('sword', 'fire', 1, 0), ('spear', 'ice', 0, 0), ('hammer', 'poison', 1, 0), ('spear', 'fire', 0, 1)],
    [('sword', 'ice', 0, 0), ('spear', 'poison', 1, 0), ('hammer', 'fire', 0, 0), ('hammer', 'ice', 1, 1)],
    [('sword', None, 0, 0), ('spear', None, 0, 0), ('hammer', None, 1, 0), ('sword', 'poison', 1, 1)],
]

HOOK = open(os.path.join(HERE, 'hook.js'), encoding='utf-8').read()
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for nh in NHOM:
        t0 = time.time()
        pg = b.new_page(viewport={'width': 992, 'height': 540})
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:300]))
        pg.on('console', lambda m: print(m.text, flush=True) if m.text.startswith('CANH') else None)
        pg.add_init_script(HOOK)
        pg.goto(URL)
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(1500)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.evaluate(LIB)
        pg.evaluate(RUN)
        pg.wait_for_timeout(500)
        try:
            if nh == 'lang':
                pg.evaluate(LANG)
            elif nh == 'song':
                pg.evaluate(SONG)
            elif nh == 'rieng':
                pg.evaluate(RIENG)
            else:
                r = int(nh[-1])
                N = int(os.environ.get('N', '260'))
                NB = int(os.environ.get('NB', '300' if r < 3 else '36'))
                pg.evaluate(VUNG, [r, COMBOS[r], N, NB])
        except Exception as e:
            errs.append('EVAL %s: %s' % (nh, str(e)[:400]))
        R = pg.evaluate("() => ({ dem: Object.fromEntries(Object.entries(window.__kk.o).map(([k, o]) => [k, { n: o.n, f: o.f, nhan: o.nhan, ex: o.ex }])), snaps: window.__kk.snaps, loi: T.errs, fx: (G.fxAnh && G.fxAnh.loi) || [] })")
        R['loi'] = errs + R['loi']
        json.dump(R, open(os.path.join(od, 'kk-%s.json' % nh), 'w'), ensure_ascii=False)
        print(nh, 'xong', round(time.time() - t0), 'giây,', len(R['dem']), 'khoá,', len(R['snaps']), 'ảnh, lỗi', R['loi'][:6], flush=True)
        pg.close()
    b.close()
