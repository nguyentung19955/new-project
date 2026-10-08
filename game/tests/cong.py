"""Cổng dịch chuyển sau khi thắng (sửa góp ý 2): hạ trùm thì không hiện bảng kết quả ngay; thưởng tính và lưu ngay;
dòng báo thắng, đồ rơi, cổng dịch chuyển; đi lại tự do; tới gần cổng nút Đánh thành "Vào cổng"; vào cổng mới hiện bảng kết quả;
bảng tạm dừng có nút "Rời ải"; thua vẫn hiện bảng thua. Phần đầu chạy luật trong trang, phần sau bấm thật trên màn hình điện thoại.
Chạy: python3 tests/cong.py   (thoát mã 1 nếu có mục sai)"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import Game, Checker, ROOT
from playwright.sync_api import sync_playwright

KILL = """(o) => {
  G.testSave({ hero: 'smith', lvl: 10, tier: 1 });
  G.save.gold = 100;
  G.startStage(o.r, o.i, 0);
  const S = G.getRun();
  G.gotoRoom(S.map.boss);
  const W = G.getWorld(), b = W.boss;
  b.hp = 1; G.damage(b, 99, { w: G.curW(S.P), el: 'fire' });
  return true;
}"""

LOGIC = r"""
() => {
  const out = [];
  const ok = (name, cond, detail) => out.push([name, !!cond, detail === undefined ? '' : String(detail)]);
  let inp = {};
  const hold0 = G.botInput;
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  const run = (n, i) => { if (i) inp = i; for (let k = 0; k < n; k++) { G.sim(1); for (const q of ['atkP', 'pauseP']) delete inp[q]; } };
  try {
    for (const [r, i] of [[0, 2], [0, 4], [1, 4]]) {
      const tag = 'Ải ' + (r + 1) + '-' + (i + 1) + ': ';
      G.testSave({ hero: 'smith', lvl: 10, tier: 1 }); G.save.gold = 100; G.persist();
      G.startStage(r, i, 0);
      const S = G.getRun(); G.gotoRoom(S.map.boss);
      let W = G.getWorld(); const b = W.boss, P = S.P;
      b.hp = 1; G.damage(b, 99, { w: G.curW(P), el: 'fire' });
      run(150, {});
      const saved = JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => localStorage.getItem(k).indexOf('"gold"') >= 0)));
      ok(tag + 'hạ trùm xong không hiện bảng kết quả, vẫn chơi tiếp', S.mode === 'play' && S.won, S.mode);
      ok(tag + 'phần thưởng tính ngay lúc thắng và đã lưu', S.result && S.result.win && G.save.gold > 100 && saved && saved.gold === G.save.gold, G.save.gold + ' / ' + (saved && saved.gold));
      const gold1 = G.save.gold, lv1 = G.save.heroes.smith.lvl, xp1 = G.save.heroes.smith.xp;
      const portal = W.props.find((p) => p.type === 'portal'), loot = W.props.filter((p) => p.type === 'loot');
      ok(tag + 'cổng dịch chuyển mọc lên trong phòng trùm, trong sàn', portal && portal.x > W.x0 && portal.x < W.x1 && portal.y >= W.y0 && portal.y <= W.y1);
      ok(tag + 'có dòng báo thắng', W.banner && /Thắng/.test(W.banner.s), W.banner && W.banner.s);
      ok(tag + 'đồ rơi nằm lại trên sàn (mỗi phần thưởng một món)', loot.length >= 4 && loot.every((p) => p.x >= W.x0 && p.x <= W.x1), loot.length);
      ok(tag + 'bản đồ nhỏ biết phòng có cổng', S.portal && S.portal.room === S.idx);
      ok(tag + 'cửa phòng trùm mở để quay lại các phòng đã qua', W.doors.length > 0 && W.doors.every((d) => d.open));
      // nhặt đồ rơi
      P.x = loot[0].x; P.y = loot[0].y; run(3, {});
      ok(tag + 'đi ngang qua đồ rơi là nhặt', !!loot[0].got);
      run(70, {});
      ok(tag + 'nhặt đồ rơi không cộng thưởng lần hai', G.save.gold === gold1);
      // đi sang phòng khác rồi quay lại
      const back = W.doors[0].to;
      G.gotoRoom(back); run(10, {});
      const W2 = G.getWorld();
      ok(tag + 'sang phòng khác vẫn đang chơi, không có bảng', S.mode === 'play' && S.idx === back);
      ok(tag + 'đã thắng thì không còn mất máu khi đi dạo', G.hurtPlayer(50, null, null, false) === false && !P.dead);
      G.gotoRoom(S.map.boss); run(5, {}); W = G.getWorld();
      const pt = W.props.find((p) => p.type === 'portal');
      ok(tag + 'quay lại phòng trùm thì cổng vẫn còn', !!pt);
      P.x = pt.x + 30; P.y = pt.y; run(2, {});
      ok(tag + 'đứng xa cổng thì chưa tương tác được', !(S.near && S.near.act === 'portal'));
      P.x = pt.x + 8; P.y = pt.y; run(2, {});
      ok(tag + 'đứng gần cổng thì cổng là vật tương tác', S.near && S.near.act === 'portal');
      run(1, { atk: true, atkP: true }); run(2, {});
      ok(tag + 'bấm Đánh khi đứng gần cổng thì hiện bảng kết quả thắng', S.mode === 'result' && S.result.win);
      ok(tag + 'vào cổng không tính thưởng lần hai', G.save.gold === gold1 && G.save.heroes.smith.lvl === lv1 && G.save.heroes.smith.xp === xp1, G.save.gold + ' / ' + gold1);
    }
    // bảng tạm dừng sau khi thắng có Rời ải; trước khi thắng thì vẫn là Bỏ ải
    {
      G.testSave({ hero: 'smith', lvl: 10, tier: 1 });
      G.startStage(0, 1, 0);
      const S = G.getRun(); G.gotoRoom(S.map.boss);
      const W = G.getWorld(); W.boss.hp = 1; G.damage(W.boss, 99, { w: G.curW(S.P) });
      run(150, {});
      const P = S.P, txt = [], real = G.ui.btn;
      G.ui.btn = function (x, y, w, h, label) { txt.push(label); return real.apply(this, arguments); };
      run(1, { pauseP: true }); G.ui.begin(); G.scene.draw();
      G.ui.btn = real;
      ok('Bảng tạm dừng sau khi thắng có nút Rời ải, không có Bỏ ải', S.mode === 'paused' && txt.includes('Rời ải') && !txt.includes('Bỏ ải, về làng'), txt.join('|'));
      G.click = { x: 240, y: 168 }; G.ui.begin(); G.scene.draw(); G.click = null;
      ok('Bấm Rời ải thì hiện bảng kết quả thắng', S.mode === 'result' && S.result.win, S.mode);
    }
    // thua vẫn hiện bảng thua
    {
      G.testSave({ hero: 'smith', lvl: 1, tier: 0 });
      G.startStage(0, 0, 0);
      const S = G.getRun(), P = S.P;
      P.hp = 0; P.dead = true; S.W.over = 'dead'; run(90, {});
      ok('Thua vẫn hiện bảng thua như cũ', S.mode === 'dead' && !S.result.win);
    }
    // bot tự đi vào cổng
    {
      G.testSave({ hero: 'smith', lvl: 10, tier: 1 });
      G.startStage(0, 1, 0);
      const S = G.getRun(); G.gotoRoom(S.map.boss);
      const W = G.getWorld(); W.boss.hp = 1; G.damage(W.boss, 99, { w: G.curW(S.P) });
      G.botInput = hold0;
      const r = G.botRun(30);
      ok('Bot tự đi tới cổng và vào cổng', r.win === true && S.mode === 'result', JSON.stringify({ win: r.win, t: r.t }));
    }
  } catch (err) { ok('không ném lỗi', false, String(err && err.stack || err)); }
  G.botInput = hold0;
  G.setScene(G.Village);
  return out;
}
"""


def main():
    c = Checker('cổng dịch chuyển')
    with sync_playwright() as p:
        # ---- luật, chạy trong trang
        g = Game(p, 'desk')
        g.pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        g.pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        for name, good, detail in g.ev(LOGIC):
            c.ok(good, name + (('  -> ' + detail) if detail else ''))
        g.close()
        # ---- bấm thật trên màn hình điện thoại (cầm ngang và cầm dọc)
        for size in ['phone', 'port']:
            g = Game(p, size)
            g.pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
            mode = lambda: g.ev("G.getRun() ? G.getRun().mode : 'none'")
            g.ev(KILL, {'r': 0, 'i': 2}); g.wait(2600)
            c.ok(mode() == 'play' and g.ev("G.getRun().won"), f'[{size}] hạ trùm xong vẫn đang chơi, chưa có bảng ({mode()})')
            labels = g.ev("""(() => { const out = []; const real = G.theme.round; G.theme.round = function (x, y, r, kind, o) { out.push(o && o.label); return real.apply(this, arguments); };
              const S = G.getRun(), pt = S.W.props.find((q) => q.type === 'portal'); S.P.x = pt.x + 8; S.P.y = pt.y; window.__lab = out; window.__real = real; return true; })()""")
            g.wait(400)
            got = g.ev("(() => { G.theme.round = window.__real; return window.__lab.slice(-3); })()")
            c.ok('Vào cổng' in got, f'[{size}] đứng gần cổng thì nút Đánh hiện chữ "Vào cổng" ({got})')
            ax, ay, _ = g.ev("G.stageUi.btnPos('atk')")
            g.tap(ax, ay, 700)
            c.ok(mode() == 'result', f'[{size}] chạm nút "Vào cổng" thì hiện bảng kết quả ({mode()})')
            si = g.ev("G.getRun().i")
            g.tap(342, 229, 500)
            c.ok(mode() == 'play' and g.ev("G.getRun().i") == si + 1, f'[{size}] bảng kết quả vẫn có nút Ải tiếp theo')
            # tạm dừng sau khi thắng -> Rời ải
            g.ev(KILL, {'r': 0, 'i': 2}); g.wait(2600)
            pau = g.ev("G.stageUi.PAU")
            g.tap(pau[0] + pau[2] / 2, pau[1] + pau[3] / 2, 400)
            c.ok(mode() == 'paused', f'[{size}] chạm Dừng sau khi thắng thì hiện bảng tạm dừng ({mode()})')
            g.tap(240, 168, 700)
            c.ok(mode() == 'result' and g.ev("G.getRun().result.win"), f'[{size}] chạm Rời ải thì hiện bảng kết quả thắng ({mode()})')
            g.tap(156, 229, 400)
            c.ok(g.ev("G.scene === G.Village"), f'[{size}] Về làng từ bảng kết quả')
            c.done(g) if False else None
            if g.errs:
                c.ok(False, 'lỗi trang: ' + '; '.join(g.errs[:3]))
            g.close()
    sys.exit(0 if c.done() else 1)


main()
