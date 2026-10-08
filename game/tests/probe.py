"""Chơi thử một ải nhiều lần với bản lưu dựng sẵn, in thời gian từng phòng và nguồn sát thương.
Ví dụ: python3 tests/probe.py '{"save":{"hero":"smith","lvl":20,"tier":2,"sharpen":6,"armor":"a_r2"},"r":2,"i":3,"n":4,"bot":{"prefer":"sword"}}'
Thêm "map":{"kind":"A","seed":1} để lần nào cũng chơi đúng một bản đồ."""
import sys, json
from playwright.sync_api import sync_playwright

def main():
    cfg = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file:///home/claude/new-project/game/index.html')
        pg.wait_for_timeout(1500)
        pg.add_script_tag(path='tests/bot.js')
        pg.add_script_tag(path='tests/setup.js')
        wins = 0
        for k in range(cfg.get('n', 3)):
            pg.evaluate("([s, c, pre]) => { G.testSave(s); Object.assign(G.botCfg, c); if (pre) eval(pre); }", [cfg.get('save', {}), cfg.get('bot', {}), cfg.get('pre')])
            pg.evaluate("([r, i, d, m]) => G.startStage(r, i, d, m)", [cfg.get('r', 0), cfg.get('i', 0), cfg.get('diff', 0), cfg.get('map')])
            if cfg.get('post'):
                pg.evaluate(cfg['post'])
            res = pg.evaluate("G.probeRun(900)")
            wins += 1 if res.get('win') else 0
            print(('THẮNG' if res.get('win') else 'thua ' if 'win' in res else 'KẸT  '), f"{res['t']}s máu {res.get('hp')}/{res.get('maxhp')} bình {res.get('potions')} trùm còn {res.get('bossHp')}% dấu ấn {res.get('marks')} hạ {res.get('kills')} né {res.get('dodges')} {res.get('layers')}")
            print('   phòng:', ' '.join(f"{a}:{t}" for a, t in res['rooms']))
            print('   đau:', res['hurt'], res['bad'] or '')
            sys.stdout.flush()
            if errs:
                print('LỖI:', errs[:5]); break
        print('thắng', wins, '/', cfg.get('n', 3))
        b.close()

main()
