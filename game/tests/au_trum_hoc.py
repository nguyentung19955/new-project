"""AUDIT chiến đấu — "trùm học theo bạn" làm gì thật (góp ý ChatGPT mục 3.7).
  cd game && python3 tests/au_trum_hoc.py [số lượt=2]
Bot chơi trọn ải 2-5 (trùm vùng Ngư Tinh, không phải lần đầu nên học tối đa 2 lớp, kháng 50%) và ải 1-2 (trùm nhỏ, 1 lớp)
với bốn cách chơi: kiếm không hệ, cung không hệ, búa Lửa (Thức tỉnh), cung Băng. In số liệu cách chơi (S.stats) lúc vào phòng trùm
và các lớp thích nghi trùm đã chọn (G.computeLayers trong js/boss.js). Không sửa game."""
import os, sys, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N = int(sys.argv[1]) if len(sys.argv) > 1 else 2

STYLES = [
    ('kiếm, không hệ', {'melee': 'sword'}, 'sword'),
    ('cung, không hệ', {'melee': 'sword'}, 'bow'),
    ('búa Lửa Thức tỉnh', {'melee': 'hammer', 'branch': 'fire', 'marks': 300}, 'hammer'),
    ('cung Băng Thức tỉnh', {'melee': 'sword', 'branch': 'ice', 'marks': 300}, 'bow'),
]


def main():
    errs = []
    out = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        for f in ['bot.js', 'setup.js']:
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        # ghi lại số liệu cách chơi lúc trùm được dựng
        pg.evaluate("""() => { const mk = G.makeBoss; G.makeBoss = function (k, o) { const S = G.getRun(); window.__st = JSON.parse(JSON.stringify(S.stats)); window.__ly = (o.layers || []).map(G.layerText); return mk(k, o); }; }""")
        for (r, i, label) in [(1, 4, 'ải 2-5 trùm vùng'), (0, 1, 'ải 1-2 trùm nhỏ')]:
            print('==', label)
            for name, sv, prefer in STYLES:
                for k in range(N):
                    save = dict(hero='smith', lvl=22 if r else 8, tier=2 if r else 1, sharpen=5 if r else 2, **sv)
                    pg.evaluate("([s, c]) => { G.testSave(s); Object.assign(G.botCfg, c); G.rnd = G.srand(c.seed); window.__st = null; window.__ly = null; }", [save, {'prefer': prefer, 'swapOnResist': False, 'seed': 11 + k}])
                    pg.evaluate("([r, i]) => G.startStage(r, i, 0, { kind: 'A', seed: 5 })", [r, i])
                    res = pg.evaluate("G.probeRun(900)")
                    st = pg.evaluate("window.__st") or {}
                    ly = pg.evaluate("window.__ly")
                    el = st.get('el', {})
                    tot = sum(el.values()) or 1
                    rm = (st.get('ranged', 0) + st.get('melee', 0)) or 1
                    row = {'stage': label, 'style': name, 'win': res.get('win'), 'layers': ly, 'dodges': st.get('dodges'), 'rangedPct': round(100 * st.get('ranged', 0) / rm), 'el': {kk: round(100 * v / tot) for kk, v in el.items()}, 'bossT': res.get('bossT'), 'hp': res.get('hp')}
                    out.append(row)
                    print('  %-20s %s | trùm học: %-45s | né %s lần, đánh xa %d%%, hệ %s | trùm gục sau %ss' % (
                        name, 'THẮNG' if res.get('win') else 'thua ', ' · '.join(ly or []) or '(không gì)', row['dodges'], row['rangedPct'], row['el'], res.get('bossT')))
                    sys.stdout.flush()
        b.close()
    if errs:
        print('LỖI JS:', errs[:5])
    json.dump(out, open('/tmp/au_trum_hoc.json', 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
