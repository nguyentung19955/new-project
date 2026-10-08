"""Kiểm tra các mục của đợt ghép 2 (hero mới và lối đánh mới trong phòng vuông), ngay trong trang thật:
  A. bộ nút mới đặt đúng hai lề, không đè sàn (màn dài và màn 16:9, phòng thường và phòng trùm)
  B. bóng tròn của em bé, thứ tự vẽ theo chiều sâu, lớp phủ trước của phòng không che vũ khí
  C. lối đánh trong phòng hẹp: đường lao, tầm tên, sóng búa không ra ngoài tường, không kẹt cửa
  D. bản đồ nhỏ và bản đồ to chỉ dùng một màu ô, một màu biểu tượng
  E. né đúng tám hướng, mũi tên nút Né chỉ đúng hướng
  F. rương, tinh anh, trùm rơi vũ khí theo bốn bậc trong hệ phòng mới
  G. suối ở Kiểu B chỉ dùng được khi đã dọn đủ 3 phòng quái
  H. hoạt ảnh trùm khớp vùng cảnh báo
Chạy: python3 tests/ghep2.py [-v]   (thoát mã 1 nếu có mục sai)"""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.dirname(os.path.abspath(__file__))

COMMON = r"""
window.T2 = (function () {
  const out = [];
  const ok = (name, cond, detail) => out.push([name, !!cond, detail === undefined ? '' : String(detail)]);
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  const X = { out, ok, near, inp: {}, W: null, P: null, S: null };
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, X.inp);
  X.step = (n, i) => { for (let k = 0; k < n; k++) { X.inp = Object.assign({}, i || {}); if (k > 0) for (const q of ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP']) delete X.inp[q]; G.sim(1); } X.inp = {}; };
  X.sec = (s, i) => X.step(Math.round(s * 60), i);
  // Vào một ải thử rồi dọn sạch phòng đầu để thử từng thứ. o: như G.testSave, thêm r, i, kind, seed, big (vào thẳng phòng trùm).
  X.room = function (o) {
    o = o || {};
    G.testSave(Object.assign({ hero: 'smith', lvl: 10 }, o));
    for (const k of G.HKEYS) G.HEROES[k].fav = [];
    G.startStage(o.r || 0, o.i == null ? 2 : o.i, 0, { kind: o.kind || 'A', seed: o.seed || 3 });
    X.S = G.getRun();
    if (o.big) G.gotoRoom(X.S.map.boss);
    X.W = G.getWorld(); X.P = X.S.P;
    const W = X.W, P = X.P;
    if (!o.keep) { W.waves = []; W.spawns = []; W.props = W.props.filter((p) => p.type === 'roomFore'); W.banner = null; if (W.boss) { W.boss.dead = true; W.boss = null; } W.zones = []; }
    X.step(6);
    P.x = W.geo.cx; P.y = W.geo.cy; P.face = 1; P.inv = 0; P.mana = P.maxmana;
    if (o.bow) P.cur = 1;
    return P.weapons[P.cur];
  };
  X.dummy = function (x, y, hp, role) {
    const e = G.spawnEnemy(role || 'rusher', x, y, { hpMult: hp || 1e6 });
    e.st.stun = 1e9; e.inside = true;
    return e;
  };
  X.lost = (e) => e.maxhp - e.hp;
  X.paint = () => { G.ui.begin(); G.scene.draw(); G.click = null; };
  return X;
})();
"""

# ---------------------------------------------------------------- A
JS_A = r"""
(tag) => {
  const { ok, room, paint } = T2;
  const realBtn = G.btnArt.draw, realStick = G.btnArt.stick;
  let btns = [], stick = null;
  G.btnArt.draw = function (c, kind, x, y, r, st) { btns.push({ kind, x, y, r }); return realBtn.apply(this, arguments); };
  G.btnArt.stick = function (c, x, y, r) { stick = { x, y, r }; return realStick.apply(this, arguments); };
  const wide = G.cx >= 20;
  for (const big of [false, true]) {
    room({ big, r: 0, i: 4, kind: 'C' });
    const W = T2.W, g = W.geo, where = (big ? 'phòng trùm' : 'phòng thường') + ', ' + tag;
    btns = []; stick = null; paint();
    const round = btns.filter((b) => ['atk', 'dodge', 'special', 'skill'].includes(b.kind));
    ok('A: đủ bốn nút tròn vẽ bằng G.btnArt (' + where + ')', round.length === 4, round.map((b) => b.kind).join());
    // nút vẽ đúng chỗ vùng chạm
    ok('A: hình nút nằm đúng tâm vùng chạm (' + where + ')', round.every((b) => { const q = G.stageUi.btnPos(b.kind); return Math.abs(q[0] - b.x) < 0.01 && Math.abs(q[1] - b.y) < 0.01 && Math.abs(q[2] + 1 - b.r) < 0.01; }));
    // không đè sàn: mép trái của nút so với mép phải của sàn
    const over = Math.max(0, ...round.map((b) => g.fx1 - (b.x - b.r)));
    ok('A: nút tròn không đè lên sàn quá 3 điểm ảnh (' + where + ')', over <= 3, 'đè ' + over.toFixed(1));
    if (!big || wide) ok('A: màn hình có lề hoặc phòng thường thì nút không chạm sàn (' + where + ')', over <= 0, 'đè ' + over.toFixed(1));
    // nút không đè nhau và không ra khỏi màn hình
    let clash = '';
    for (let i = 0; i < round.length; i++) for (let j = i + 1; j < round.length; j++) {
      const a = round[i], b = round[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r - 2) clash += a.kind + '/' + b.kind + ' ';
    }
    ok('A: các nút tròn không đè lên nhau (' + where + ')', !clash, clash);
    const edgeR = G.W + G.mx, edgeB = G.H + G.my;
    ok('A: nút nằm trọn trong màn hình (' + where + ')', round.every((b) => b.x + b.r <= edgeR + 0.5 && b.y + b.r <= edgeB + 0.5 && b.y - b.r >= 40), JSON.stringify(round.map((b) => [b.kind, Math.round(b.x + b.r), Math.round(b.y + b.r)])) + ' mép ' + edgeR.toFixed(0) + ',' + edgeB.toFixed(0));
    ok('A: nút đủ to để bấm (bán kính nút nhỏ từ 17, nút Đánh từ 26) (' + where + ')', round.every((b) => b.r >= (b.kind === 'atk' ? 26 : 17)));
    // cần điều khiển lúc chưa chạm
    ok('A: cần điều khiển không đè sàn (' + where + ')', stick && stick.x + stick.r <= g.fx0 + 3 && stick.x - stick.r >= -G.mx, stick && (stick.x + stick.r) + ' so với sàn ' + g.fx0);
    // bản đồ nhỏ và ô vũ khí không đè nút, không đè sàn
    const mm = G.minimap.rect(T2.S);
    const hitMm = round.some((b) => b.x + b.r > mm[0] && b.x - b.r < mm[0] + mm[2] && b.y + b.r > mm[1] && b.y - b.r < mm[1] + mm[3]);
    ok('A: bản đồ nhỏ không đè nút bấm (' + where + ')', !hitMm, mm.join());
    ok('A: bản đồ nhỏ không đè sàn và ô vũ khí (' + where + ')', mm[1] >= 38 && (mm[0] >= g.fx1 || mm[1] + mm[3] <= g.fy0), mm.join());
    ok('A: bình máu và nút Dừng ở lề trái, không đè sàn (' + where + ')', G.stageUi.POT[1] + G.stageUi.POT[3] <= g.fy0 && G.stageUi.PAU[1] + G.stageUi.PAU[3] <= g.fy0);
    // chạm vào tâm từng nút thì đúng nút đó nhận
    G.botInput = null;
    const P = T2.P;
    P.mana = P.maxmana; P.dodgeCd = 0; P.specCd = 0; P.skillCd = 0; P.cdT = 0;
    const q = G.stageUi.btnPos('dodge');
    const ptr = { x: q[0], y: q[1], sx: q[0], sy: q[1], id: 91 };
    G.pointers.set(91, ptr); G.downs.push(ptr);
    const d0 = T2.S.stats.dodges;
    G.sim(1);
    G.pointers.delete(91);
    ok('A: chạm tâm nút Né thì lăn né (' + where + ')', T2.S.stats.dodges === d0 + 1 && ptr.role === 'dodge', ptr.role);
    G.botInput = () => Object.assign({ mx: 0, my: 0 }, T2.inp);
  }
  // 16:9: phòng trùm dùng bộ nút thu nhỏ; màn dài: giữ bộ nút thường
  room({ big: true, r: 0, i: 4, kind: 'C' });
  const a = G.stageUi.btnPos('atk');
  if (wide) ok('A: màn hình dài thì phòng trùm vẫn dùng nút cỡ thường (' + tag + ')', a[2] === 28, a[2]);
  else ok('A: màn 16:9 thì phòng trùm dùng nút thu nhỏ sát mép phải (' + tag + ')', a[2] < 28 && a[0] > 440, a.join());
  G.btnArt.draw = realBtn; G.btnArt.stick = realStick;
  return T2.out.splice(0);
}
"""

# ---------------------------------------------------------------- B, E (và các mục thêm dần ở dưới)
JS_B = r"""
() => {
  const { ok, near, room, paint, step, sec, dummy } = T2;
  // ---------- B. bóng tròn, chiều sâu, lớp phủ ----------
  room({ melee: 'hammer' });
  let P = T2.P, W = T2.W;
  const A = G.art, realEll = A.ellipse, realHero = A.hero, realEnemy = A.enemy;
  let ells = [], inHero = false, order = [];
  A.ellipse = function (c, x, y, rx, ry) { if (inHero) ells.push([x, y, rx, ry]); return realEll.apply(this, arguments); };
  A.hero = function (c, o) { order.push('hero'); inHero = true; try { return realHero.apply(this, arguments); } finally { inHero = false; } };
  A.enemy = function (c, e) { order.push(e.tag || 'quái'); return realEnemy.apply(this, arguments); };
  ok('B: trong phòng vuông, hero được vẽ với bóng tròn', G.heroArgs(P).roundShadow === true);
  paint();
  const sh = ells.find((e) => near(e[0], Math.round(P.x), 14) && near(e[1], Math.round(P.y), 1));
  ok('B: bóng của em bé là hình bầu dục, cao ít nhất 3 điểm ảnh mỗi nửa (không còn là vệt dẹt)', sh && sh[3] >= 3 && sh[3] / sh[2] >= 0.4, JSON.stringify(sh));
  const up = dummy(P.x - 20, P.y - 30), down = dummy(P.x + 20, P.y + 30);
  up.tag = 'trên'; down.tag = 'dưới';
  order = []; paint();
  ok('B: quái đứng cao hơn trên màn hình vẽ trước hero, quái đứng thấp hơn vẽ sau', order.join() === 'trên,hero,dưới', order.join());
  P.y = down.y + 4; order = []; paint();
  ok('B: hero đi xuống thấp hơn quái thì được vẽ sau cùng', order.join() === 'trên,dưới,hero', order.join());
  A.ellipse = realEll; A.hero = realHero; A.enemy = realEnemy;
  // lớp phủ trước của phòng chỉ nằm ở dải sát tường dưới: không che người và vũ khí ở phần còn lại của sàn
  for (const r of [0, 1, 2]) for (const big of [false, true]) {
    room({ r, i: 4, kind: 'C', big });
    W = T2.W; W.cleared = true;
    const g = W.geo, fore = G.roomArt.get(W).fore, d = fore.getContext('2d').getImageData(0, 0, fore.width, fore.height).data;
    let n = 0, top = 999;
    for (let y = g.fy0 - 30; y < g.fy1; y++) for (let x = g.fx0 + 2; x < g.fx1 - 2; x++) if (d[(y * fore.width + x) * 4 + 3] > 40) { n++; if (y < top) top = y; }
    ok('B: lớp phủ trước chỉ ở dải 20 điểm ảnh sát tường dưới (vùng ' + (r + 1) + (big ? ', phòng trùm' : '') + ')', top >= g.fy1 - 20, 'cao nhất y=' + top + ', ' + n + ' điểm');
    const props = W.props.filter((p) => p.type === 'roomFore');
    ok('B: lớp phủ trước vẽ sau mọi nhân vật (vùng ' + (r + 1) + (big ? ', phòng trùm' : '') + ')', props.length === 1 && props[0].y > g.fy1 + 100);
  }
  // vũ khí to sát tường vẫn vẽ ra (không bị cắt): đếm lần gọi vẽ vũ khí sống khi hero đứng ở bốn mép sàn
  const realW = G.weaponArt.draw; let wd = 0;
  G.weaponArt.draw = function () { wd++; return realW.apply(this, arguments); };
  room({ melee: 'spear' }); P = T2.P; W = T2.W;
  let all = true;
  for (const q of [[W.x0, W.geo.cy, -1], [W.x1, W.geo.cy, 1], [W.geo.cx, W.y0, 1], [W.geo.cx, W.y1, 1]]) { P.x = q[0]; P.y = q[1]; P.face = q[2]; wd = 0; paint(); if (wd < 1) all = false; }
  ok('B: đứng sát cả bốn tường, vũ khí sống vẫn được vẽ đủ (vẽ đè lên tường bên, không bị tường che)', all);
  G.weaponArt.draw = realW;

  // ---------- E. né tám hướng ----------
  const DK = G.DODGE.ky, realBtn = G.btnArt.draw;
  let ddir = null;
  G.btnArt.draw = function (c, kind, x, y, r, st) { if (kind === 'dodge') ddir = st.dir; return realBtn.apply(this, arguments); };
  const dirs = [[1, 0, 'phải'], [1, 1, 'chéo phải xuống'], [0, 1, 'xuống'], [-1, 1, 'chéo trái xuống'], [-1, 0, 'trái'], [-1, -1, 'chéo trái lên'], [0, -1, 'lên'], [1, -1, 'chéo phải lên']];
  const angDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
  for (const mode of ['nhớ hướng', 'đang đẩy cần']) {
    let bad = '', badArrow = '', badLen = '';
    for (const [mx, my, nm] of dirs) {
      room({}); P = T2.P; W = T2.W;
      sec(0.2, { mx, my }); step(3);
      P.x = W.geo.cx; P.y = W.geo.cy; P.face = mx < 0 ? 1 : -1; // quay mặt ngược lại để chắc là không lộn theo hướng mặt
      const hold = mode === 'đang đẩy cần' ? { mx, my } : {};
      T2.inp = hold; ddir = null; paint();
      const arrow = ddir;
      const x0 = P.x, y0 = P.y;
      step(1, Object.assign({ dodgeP: true }, hold));
      let n = 0; while (P.dodgeT > 0 && n++ < 60) step(1, hold);
      const dx = P.x - x0, dy = P.y - y0, l = Math.hypot(mx, my);
      const wantX = (mx / l) * G.DODGE.vx * 0.27, wantY = (my / l) * G.DODGE.vx * DK * 0.27;
      // (lúc đang đẩy cần, vài khung cuối có thêm bước đi bộ nên cho lệch rộng hơn)
      const tol = mode === 'đang đẩy cần' ? 9 : 4;
      if (Math.sign(Math.round(dx / 4)) !== Math.sign(mx) || Math.sign(Math.round(dy / 4)) !== Math.sign(my)) bad += nm + ' (' + dx.toFixed(0) + ',' + dy.toFixed(0) + ') ';
      if (Math.abs(dx - wantX) > tol || Math.abs(dy - wantY) > tol) badLen += nm + ' (' + dx.toFixed(0) + ',' + dy.toFixed(0) + ' cần ' + wantX.toFixed(0) + ',' + wantY.toFixed(0) + ') ';
      if (arrow == null || angDiff(arrow, Math.atan2(wantY, wantX)) > 0.02) badArrow += nm + ' ' + (arrow == null ? '?' : arrow.toFixed(2)) + ' ';
    }
    ok('E: né đúng cả tám hướng (' + mode + ')', !bad, bad);
    ok('E: quãng lộn đúng theo từng hướng, lộn dọc bằng 0,75 lộn ngang (' + mode + ')', !badLen, badLen);
    ok('E: mũi tên trên nút Né chỉ đúng góc sẽ lộn ở cả tám hướng (' + mode + ')', !badArrow, badArrow);
  }
  // đẩy cần nhẹ vẫn lộn đủ quãng
  room({}); P = T2.P; W = T2.W;
  let x0 = P.x; step(1, { dodgeP: true, mx: 0.3 }); sec(0.3);
  ok('E: đẩy cần nhẹ thì quãng lộn vẫn đủ dài', P.x - x0 > 45, (P.x - x0).toFixed(0));
  // lộn vào bốn góc phòng: không ra ngoài sàn
  let inside = true;
  for (const [mx, my] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) {
    room({}); P = T2.P; W = T2.W;
    P.x = mx > 0 ? W.x1 - 6 : W.x0 + 6; P.y = my > 0 ? W.y1 - 4 : W.y0 + 4;
    step(1, { dodgeP: true, mx, my }); sec(0.4, { mx, my });
    if (P.x < W.x0 - 0.01 || P.x > W.x1 + 0.01 || P.y < W.y0 - 0.01 || P.y > W.y1 + 0.01) inside = false;
  }
  ok('E: lộn vào bốn góc phòng thì dừng ở mép sàn, không ra ngoài', inside);
  // lộn vào cửa đang mở thì sang phòng kề; lộn vào cửa khóa thì không
  room({ kind: 'A', seed: 3 }); P = T2.P; W = T2.W;
  W.cleared = true; T2.S.cleared[T2.S.idx] = true; G.gotoRoom(T2.S.idx);
  W = T2.W = G.getWorld(); P = T2.P;
  const d = W.doors.find((q) => q.open);
  if (d) {
    const q = G.roomArt.doorPos(W.geo, d.dir), v = G.mapgen.DIRS[d.dir], id0 = T2.S.idx;
    P.x = q.x - v[0] * 24; P.y = q.y - v[1] * 24;
    sec(0.5); // hết thời gian chờ ở cửa
    sec(0.12, { mx: v[0], my: v[1] }); step(3);
    step(1, { dodgeP: true }); sec(1.2);
    ok('E: lộn theo hướng vừa đi vào cửa đang mở thì sang phòng kề', T2.S.idx === d.to && T2.S.idx !== id0, id0 + ' -> ' + T2.S.idx);
  } else ok('E: có cửa mở để thử', false);
  G.btnArt.draw = realBtn;
  return T2.out.splice(0);
}
"""

PARTS = []  # (tên, mã JS, tham số) cho các mục chạy ở màn hình dài; thêm dần ở cuối tệp


def run_page(p, size, parts):
    errs, res = [], []
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': size[0], 'height': size[1]})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + ROOT + '/index.html')
    pg.wait_for_function('window.G && G.scene')
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
    pg.evaluate(COMMON)
    for js, arg in parts:
        try:
            res += pg.evaluate(js, arg) if arg is not None else pg.evaluate(js)
        except Exception as e:  # lỗi trong lúc chạy một mục: ghi lại rồi chạy mục kế
            res.append(['mục kiểm tra chạy hết không lỗi', False, str(e)[:400]])
            pg.evaluate("T2.out.splice(0)")
    b.close()
    return res, errs


def main():
    only = [a for a in sys.argv[1:] if not a.startswith('-')]
    want = lambda k: not only or k in only
    res, errs = [], []
    with sync_playwright() as p:
        if want('A'):
            for tag, size in (('màn dài 844x390', (844, 390)), ('màn 16:9 667x375', (667, 375)), ('máy tính 1280x720', (1280, 720))):
                r, e = run_page(p, size, [(JS_A, tag)])
                res += r; errs += e
        parts = [(js, arg) for key, js, arg in PARTS if want(key)]
        if parts:
            r, e = run_page(p, (844, 390), parts)
            res += r; errs += e
    bad = 0
    for name, good, detail in res:
        if not good:
            bad += 1
        if not good or '-v' in sys.argv:
            print(('ĐẠT ' if good else 'SAI ') + name + (('  -> ' + detail) if detail else ''))
    print(f'{len(res) - bad}/{len(res)} mục đạt' + (', lỗi trang: ' + '; '.join(errs[:3]) if errs else ''))
    sys.exit(1 if bad or errs else 0)


PARTS.append(('BE', JS_B, None))

# Các mục C, D, F, G, H nằm ở tệp riêng cho dễ đọc; nạp vào đây nếu có.
for _name in ('ghep2_c.js', 'ghep2_d.js', 'ghep2_fgh.js'):
    _p = os.path.join(HERE, _name)
    if os.path.exists(_p):
        PARTS.append((_name[6:-3].upper(), open(_p, encoding='utf-8').read(), None))

if __name__ == '__main__':
    main()
