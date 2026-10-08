"""Đo thời gian một khung hình (cập nhật + vẽ) trong cảnh đông quái, vũ khí ở mốc Thức tỉnh của từng hệ.
Dùng để so trước và sau khi thêm hiệu ứng: chạy trên hai bản mã rồi so số.
Chạy: python3 tests/perf.py [thư mục game] [số khung]      (mặc định: thư mục game chứa tệp này, 600 khung)
      python3 tests/perf.py --so <thư mục game cũ>          (đo cả hai bản, in tỉ lệ; thoát mã 1 nếu chậm hơn quá 20%)"""
import os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""
([wtype, el, frames, seed]) => {
  G.testSave({ hero: 'smith', melee: wtype === 'bow' ? 'sword' : wtype, lvl: 12, tier: 1, sharpen: 3, branch: el || undefined, marks: el ? 300 : 0 });
  G.rnd = G.srand(seed);
  G.startStage(1, 2, 0);
  const S = G.getRun(), W = G.getWorld(), P = S.P;
  W.waves = []; W.props = [];
  Object.assign(G.botCfg, { prefer: wtype, explore: false, props: false });
  if (G.curW(P).type !== wtype) P.cur = 1 - P.cur;
  const roles = ['rusher', 'swarm', 'shield', 'rusher', 'nimble', 'swarm', 'archer'];
  for (let i = 0; i < 14; i++) { const e = G.spawnEnemy(roles[i % roles.length], 120 + i * 22, 160 + (i * 37) % 70, { hpMult: 1e5 }); e.inside = true; }
  const frame = () => { G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; if (!W.over) { P.hp = P.maxhp; P.mana = Math.max(P.mana, 30); } };
  for (let i = 0; i < 90; i++) frame();
  const t0 = performance.now();
  let maxP = 0;
  for (let i = 0; i < frames; i++) { frame(); const st = G.fx.stats(); if (st && st.parts > maxP) maxP = st.parts; }
  const ms = (performance.now() - t0) / frames;
  G.rnd = Math.random;
  return { ms, maxP, errs: G.fx.errs, mode: S.mode };
}
"""

def measure(root, frames, reps=3):
    out = {}
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + root + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(300)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        pg.add_script_tag(path=os.path.join(root, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(root, 'tests', 'setup.js'))
        only = os.environ.get('PERF_ONLY')  # ví dụ PERF_ONLY=spear,fire để đo một trường hợp
        for wt in ['sword', 'bow', 'spear', 'hammer']:
            for el in [None, 'fire', 'poison', 'ice']:
                if only and only != wt + ',' + str(el): continue
                if os.environ.get('PERF_PRE'): pg.evaluate(os.environ['PERF_PRE'])  # đoạn JS tắt thử từng phần hiệu ứng
                best = None
                for r in range(reps):
                    res = pg.evaluate(JS, [wt, el, frames, 4242])
                    if errs or res['errs'] or res['mode'] != 'play':
                        print('LỖI', wt, el, errs[:2], res); sys.exit(1)
                    if best is None or res['ms'] < best['ms']:
                        best = res
                out[(wt, el)] = best
        b.close()
    return out

def show(tab, title):
    print(title)
    for wt in ['sword', 'bow', 'spear', 'hammer']:
        print('  %-7s' % wt + '  '.join('%s %.2f ms (hạt %3d)' % (el or 'không', tab[(wt, el)]['ms'], tab[(wt, el)]['maxP']) for el in [None, 'fire', 'poison', 'ice']))
    avg = sum(v['ms'] for v in tab.values()) / len(tab)
    print('  trung bình %.2f ms mỗi khung' % avg)
    return avg

def main():
    args = sys.argv[1:]
    if args and args[0] == '--so':
        old = os.path.abspath(args[1]); frames = int(args[2]) if len(args) > 2 else 600
        a = measure(old, frames); b = measure(HERE, frames)
        av = show(a, 'Bản cũ: ' + old); bv = show(b, 'Bản mới: ' + HERE)
        worst = max(b[k]['ms'] / a[k]['ms'] for k in a)
        wk = max(a, key=lambda k: b[k]['ms'] / a[k]['ms'])
        print('Trung bình: bản mới bằng %.0f%% bản cũ. Trường hợp chậm nhất: %s %s bằng %.0f%%.' % (bv / av * 100, wk[0], wk[1] or 'không', worst * 100))
        sys.exit(1 if bv / av > 1.2 else 0)
    root = os.path.abspath(args[0]) if args else HERE
    frames = int(args[1]) if len(args) > 1 else 600
    tab = measure(root, frames)
    if os.environ.get('PERF_ONLY'):
        for k, v in tab.items(): print(k, '%.2f ms' % v['ms'], 'hạt', v['maxP'])
    else: show(tab, root)

main()
