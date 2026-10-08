"""Kiểm tra lớp hiệu ứng (js/fx.js) khi CÓ vẽ: không lỗi, không vượt trần số hạt, khựng hình không nuốt nút bấm,
chạy không vẽ thì không sinh hiệu ứng và không đụng tới bộ sinh số ngẫu nhiên của luật chơi.
Chạy: python3 tests/fx_check.py [số khung mỗi phòng]   (thoát mã 1 nếu có lỗi)"""
import os, re, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FUZZ = r"""
([hero, wtype, frames]) => {
  const bad = [];
  const el = G.pick(G.ELS);
  G.testSave({ hero, melee: wtype === 'bow' ? 'sword' : wtype, lvl: 20, tier: 2, sharpen: 5, branch: el, marks: G.pick([10, 119, 150, 299, 400]),
    armor: G.pick(Object.keys(G.GEAR.armor)), helm: G.pick(Object.keys(G.GEAR.helm)), charm: G.pick(Object.keys(G.GEAR.charm)) });
  G.botCfg.explore = true; G.botCfg.prefer = wtype;
  const base = G.botInput;
  G.botInput = function (S) {
    const inp = base(S), q = Math.random;
    if (q() < 0.15) { inp.mx = q() * 2 - 1; inp.my = q() * 2 - 1; }
    if (q() < 0.05) inp.specialP = true;
    if (q() < 0.05) inp.skillP = true;
    if (q() < 0.01) inp.swapP = true;
    if (q() < 0.04) inp.dodgeP = true;
    if (q() < 0.3) inp.atk = true;
    return inp;
  };
  let maxP = 0, maxE = 0, maxN = 0, drawn = 0;
  try {
    G.startStage(Math.floor(Math.random() * 3), Math.floor(Math.random() * 5), 0);
    const n = G.getRun().rooms.length;
    for (let room = 0; room < n; room++) {
      let S = G.getRun();
      if (!S || S.mode === 'result' || S.mode === 'dead') break;
      if (S.idx !== room) G.gotoRoom(room); // bot đi theo cửa nên không theo thứ tự số phòng: nhảy tới để phòng nào cũng được vẽ
      if (Math.random() < 0.4) G.addCoat(G.pick(G.ELS), 30);
      for (let f = 0; f < frames; f++) {
        S = G.getRun();
        if (!S || S.mode === 'result' || S.mode === 'dead' || (S.idx !== room && !S.trans)) break; // bot đã qua cửa sang phòng khác (chờ vẽ xong cảnh trượt)
        if (S.mode !== 'play') { G.botRun(1); continue; }
        const W = S.W, P = S.P;
        if (!W.over) { P.hp = Math.max(P.hp, P.maxhp * (f % 200 < 100 ? 0.2 : 0.6)); P.mana = Math.max(P.mana, 60); }
        if (W.boss && !W.boss.dead && f === frames - 90) G.damage(W.boss, 1e12, { el });
        G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; drawn++;
        const st = G.fx.stats();
        if (st) { maxP = Math.max(maxP, st.parts); maxE = Math.max(maxE, st.fx); maxN = Math.max(maxN, st.nums); }
        for (const k of ['hp', 'x', 'y', 'mana']) if (!isFinite(P[k])) bad.push('người chơi ' + k + ' hỏng');
        const m = G.wx.getTransform();
        if (m.a !== 1 || m.d !== 1 || m.e !== 0 || m.f !== 0) bad.push('phép biến đổi canvas không được trả về như cũ');
        if (G.wx.globalAlpha !== 1 || G.ux.globalAlpha !== 1) bad.push('globalAlpha bị bỏ quên');
        if (bad.length > 3) break;
      }
      if (bad.length > 3) break;
    }
  } finally { G.botInput = base; }
  if (G.fx.errs) bad.push('fx báo lỗi: ' + G.fx.lastErr);
  if (maxP > 400) bad.push('quá trần hạt: ' + maxP);
  if (maxE > 72) bad.push('quá trần hiệu ứng: ' + maxE);
  return { bad, maxP, maxE, maxN, drawn };
}
"""

UNIT = r"""
() => {
  const out = [];
  const ok = (name, cond, detail) => out.push([name, !!cond, detail === undefined ? '' : String(detail)]);
  let inp = {};
  const hold = G.botInput;
  G.botInput = () => { const i = Object.assign({ mx: 0, my: 0 }, inp); inp = {}; return i; };
  const frame = () => { G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; };
  const room = (o) => {
    G.testSave(Object.assign({ hero: 'smith', lvl: 10 }, o || {}));
    G.startStage(0, 2, 0);
    const W = G.getWorld(); W.waves = []; W.props = [];
    G.sim(6); W.P.x = 200; W.P.y = 195; W.P.face = 1; W.P.inv = 0; W.P.mana = W.P.maxmana;
    return W;
  };
  const dummy = (x, hp) => { const e = G.spawnEnemy('rusher', x, 195, { hpMult: hp || 1e4 }); e.st.stun = 1e9; e.inside = true; return e; };
  try {
    // 1. Chạy không vẽ: không sinh hạt, không sinh chữ, không khựng hình
    let W = room(); dummy(232); frame();
    const before = JSON.stringify(G.fx.stats());
    G.noRender = true;
    try { inp = { atkP: true }; for (let i = 0; i < 60; i++) { inp.atk = true; G.tick(); } G.applyStatus(W.ents[0], 'poison', 5); G.applyStatus(W.ents[0], 'fire', 5); } finally { G.noRender = false; }
    ok('chạy không vẽ không sinh hiệu ứng', JSON.stringify(G.fx.stats()) === before && W.texts.length === 0 && W.parts.length === 0, JSON.stringify(G.fx.stats()));
    ok('chạy không vẽ không khựng hình', G.fx.state().stop <= 0);

    // 2. Đòn trúng thì khựng hình, và nút lăn né bấm đúng lúc khựng vẫn được nhận
    W = room(); dummy(232);
    inp = { atkP: true, atk: true };
    let froze = 0, pressed = false, d0 = W.stats.dodges;
    for (let i = 0; i < 40; i++) {
      const st = G.fx.state();
      if (st && st.stop > 0.02 && !pressed) { inp = { dodgeP: true }; pressed = true; }
      frame();
      if (G.fx.state().stop > 0) froze++;
    }
    ok('đòn kiếm trúng làm khựng 2-5 khung', froze >= 2 && froze <= 5, froze);
    ok('nút lăn né bấm lúc khựng không bị mất', pressed && W.stats.dodges === d0 + 1, W.stats.dodges - d0);

    // 3. Khựng hình có trần: đánh liên tục vào cả đám vẫn chạy được phần lớn thời gian
    W = room({ melee: 'hammer' }); for (let i = 0; i < 6; i++) dummy(226 + i * 3);
    froze = 0;
    for (let i = 0; i < 300; i++) { inp = { atk: true }; frame(); if (G.fx.state().stop > 0) froze++; }
    ok('khựng hình không quá 30% thời gian khi đánh cả đám', froze / 300 < 0.3, (froze / 3).toFixed(1) + '%');

    // 4. Rung màn hình có trần và tắt dần
    W = room();
    for (let i = 0; i < 20; i++) G.fx.shake(1, 5, 5);
    frame();
    let o = G.fx.shakeOffset();
    ok('rung có trần', Math.abs(o.x) <= 8 && Math.abs(o.y) <= 6, o.x + ',' + o.y);
    for (let i = 0; i < 60; i++) frame();
    o = G.fx.shakeOffset();
    ok('rung tắt hẳn sau 1 giây', o.x === 0 && o.y === 0, o.x + ',' + o.y);

    // 5. Số sát thương ra cùng lúc được xếp lệch nhau
    W = room(); const e5 = dummy(260);
    for (let i = 0; i < 4; i++) G.damage(e5, 10, {});
    const ys = G.fx.state().N.map((n) => Math.round(n.y));
    ok('bốn số cùng lúc nằm ở bốn độ cao khác nhau', new Set(ys).size === 4, ys.join(','));

    // 6. Quái chết: có xác tan dần rồi biến mất, không còn trong danh sách quái
    W = room(); const e6 = dummy(260, 1); G.applyStatus(e6, 'fire', 1);
    G.damage(e6, 1e9, {}); frame();
    ok('quái chết để lại xác đang tan', G.fx.state().dying.length === 1 && G.fx.state().dying[0].e !== e6);
    for (let i = 0; i < 40; i++) frame();
    ok('xác tan hết sau dưới 0,6 giây', G.fx.state().dying.length === 0);
    ok('dấu ấn vẫn được cộng', W.marksGained > 0, W.marksGained);

    // 7. Sang phòng mới thì hiệu ứng phòng cũ không theo sang
    W = room(); const e7 = dummy(240); G.fx.burst(240, 195, '#ff7a2a', 20, 80); G.damage(e7, 5, {}); frame();
    const had = G.fx.stats().parts;
    G.gotoRoom(1); frame();
    ok('đổi phòng thì xoá hiệu ứng cũ', had > 0 && G.fx.stats().parts < had && G.fx.state().W === G.getWorld(), had + ' -> ' + G.fx.stats().parts);

    // 8. Hiệu ứng lỗi không làm sập game
    W = room(); dummy(232);
    const real = G.art.hero;
    const errs0 = G.fx.errs;
    G.fx.hit(null, {}); G.fx.death(undefined); G.fx.zoneFire(null); G.fx.entity(G.wx, { st: null }); G.fx.dmg(null, 1);
    for (let i = 0; i < 5; i++) frame();
    ok('gọi sai tham số chỉ bị đếm lỗi, không ném ra ngoài', G.fx.errs > errs0, G.fx.errs - errs0);
    G.fx.errs = 0;
    ok('luật vẫn chạy sau lỗi hiệu ứng', isFinite(W.P.x) && G.getRun().mode === 'play');
    G.art.hero = real;
  } catch (err) { ok('không ném lỗi', false, String(err && err.stack || err)); }
  G.botInput = hold;
  return out;
}
"""

def main():
    frames = int(sys.argv[1]) if len(sys.argv) > 1 else 420
    nbad = 0
    for name in ['fx.js', 'fx_he.js']:
        src = open(os.path.join(ROOT, 'js', name), encoding='utf-8').read()
        code = re.sub(r'//.*', '', src)
        for word in ['G.rnd', 'G.rr(', 'G.ri(', 'G.pick(']:
            if word in code:
                print('SAI:', name, 'dùng', word, '(bộ ngẫu nhiên của luật chơi)'); nbad += 1
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') and 'fx:' in m.text else None)
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(300)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.wait_for_timeout(100)
        for name, good, detail in pg.evaluate(UNIT):
            print('đạt ' if good else 'SAI ', name, ('[' + detail + ']') if detail else '')
            nbad += 0 if good else 1
        errs.clear()
        for hero in ['smith', 'hunter', 'healer', 'wrestler']:
            for wt in ['sword', 'bow', 'spear', 'hammer']:
                try:
                    res = pg.evaluate(FUZZ, [hero, wt, frames])
                except Exception as ex:
                    res = {'bad': ['SẬP: ' + str(ex)[:400]]}
                nbad += len(res['bad']) + len(errs)
                print(hero, wt, 'ổn' if not res['bad'] and not errs else res['bad'] + errs[:3],
                      f"khung {res.get('drawn')} hạt tối đa {res.get('maxP')} hiệu ứng {res.get('maxE')} số {res.get('maxN')}")
                errs.clear()
                sys.stdout.flush()
        b.close()
    print('tổng số lỗi:', nbad)
    sys.exit(1 if nbad else 0)

main()
