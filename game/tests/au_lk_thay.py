"""Phiên linh-khi-theo-thay: linh khí cộng theo hiệu ứng ĐANG THẤY trên quái lúc chết.
Chạy (từ thư mục game):  python3 tests/au_lk_thay.py [url]
Không có url: mở index.html (bản nhiều tệp). Có url (vd http://127.0.0.1:8765/linh-khi-nhe.html?cloud=0): bản hai tệp như web.
Vũ khí chính Độc, bùa Lửa (lửa không do chưởng). Mỗi ca: dựng hiệu ứng trên quái, kết liễu, đọc dấu ấn cộng vào vũ khí nào, hệ nào.
"""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = sys.argv[1] if len(sys.argv) > 1 else None

JS = r"""
([ca, thay]) => {
  G.LK_THEO_THAY = thay;
  G.testSave({ hero: 'smith', melee: 'sword', lvl: 10, tier: 1, branch: 'poison', marks: 40 });
  G.rnd = G.srand(7);
  G.startStage(0, 2, 0, { kind: 'A', seed: 3 });
  const S = G.getRun(), W = G.getWorld(), P = S.P;
  W.waves = []; W.spawns = []; W.props = []; W.zones = []; W.banner = null;
  for (const x of W.ents) x.dead = true;
  P.markMult = 1; W.marksMult = 1;
  const w = G.curW(P);
  const got = [];
  const add0 = G.addMarks;
  G.addMarks = function (ww, el, n, quiet) { got.push({ w2: ww !== w, el, n: Math.round(n * 100) / 100, quiet: !!quiet }); return add0(ww, el, n, quiet); };
  const e = G.spawnEnemy(ca.role || 'rusher', P.x + 30, P.y, {});
  e.inside = true; e.spawnT = 0;
  const st = e.st;
  st.comboCd = 99; // không cho Nổ khói / Sốc nhiệt tiêu hiệu ứng: dựng đúng trạng thái cần kiểm
  const bua = () => G.applyStatus(e, 'fire', 20, 1);              // bùa Lửa: G.chSrc tắt → lửa của vũ khí/bùa
  const vk = (n) => G.applyStatus(e, 'poison', 20, n || 1);       // vũ khí Độc
  const ch = (el) => { const was = G.chSrc; G.chSrc = true; try { G.applyStatus(e, el, 20, 1); } finally { G.chSrc = was; } };
  for (const b of ca.steps) {
    if (b === 'bua') bua(); else if (b === 'vk') vk(1); else if (b === 'vk5') vk(5);
    else if (b === 'chFire') ch('fire');
    else if (b === 'iceS2') G.applyStatus(e, 'ice', 20, 2);
    else if (b === 'frz') { st.frozen = 1.2; st.iceT = 3; }
    else if (b.startsWith('fireT=')) st.fire = +b.slice(6);
    else if (b.startsWith('poisonT=')) st.poisonT = +b.slice(8);
  }
  const markEl = G.lk && G.lk.markEl ? G.lk.markEl(e) : null;
  const o = ca.killCh ? { el: 'fire', src: 'chuong', ch: true } : { el: 'poison', src: 'hit', w };
  G.damage(e, e.hp + 9999, o);
  G.addMarks = add0;
  const main = got.filter((g) => !g.w2), sub = got.filter((g) => g.w2);
  return { dead: e.dead, markEl, main: main.map((g) => g.el + ':' + g.n).join(','), sub: sub.map((g) => g.el + ':' + g.n + (g.quiet ? '(lặng)' : '')).join(','), pend: null };
}
"""

CAS = [
    ('A. quái đang cháy (bùa) + vết độc vũ khí, kết liễu', {'steps': ['vk', 'bua', 'vk']}, 'fire', 'poison'),
    ('B. chỉ dính độc', {'steps': ['vk', 'vk']}, 'poison', 'poison'),
    ('C. dính cả hai, cháy còn lâu hơn', {'steps': ['bua', 'vk5', 'fireT=2.5', 'poisonT=0.5']}, 'fire', 'poison'),
    ('C2. dính cả hai, lửa sắp tắt', {'steps': ['bua', 'vk5', 'fireT=0.1']}, 'fire', 'poison'),
    ('D. chưởng Lửa đốt + vũ khí Độc, vũ khí kết liễu', {'steps': ['chFire', 'vk']}, 'poison', 'poison'),
    ('E. chưởng Lửa kết liễu quái thường (độc vũ khí)', {'steps': ['vk'], 'killCh': True}, '', ''),
    ('F. chưởng Lửa kết liễu tinh anh (độc vũ khí, lửa chưởng)', {'steps': ['vk', 'chFire'], 'killCh': True, 'role': 'elite'}, 'poison', 'poison'),
    ('G. đóng băng + độc', {'steps': ['vk', 'frz']}, 'ice', 'poison'),
    ('H. băng chậm 2 tầng + độc 5 tầng', {'steps': ['iceS2', 'vk5']}, 'poison', 'poison'),
]


def main():
    errs = []
    bad = 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL or ('file://' + ROOT + '/index.html'))
        pg.wait_for_function('!!(window.G && G.scene && G.startStage)', timeout=60000)
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        for name, ca, want, want_old in CAS:
            r = pg.evaluate(JS, [ca, True])
            r0 = pg.evaluate(JS, [ca, False])
            el = r['main'].split(':')[0] if r['main'] else ''
            el0 = r0['main'].split(':')[0] if r0['main'] else ''
            ok = el == want and el0 == want_old and r['dead'] and (not r['sub'] or '(lặng)' in r['sub'])
            if el and r['markEl'] != el and not ca.get('killCh'): ok = False
            bad += 0 if ok else 1
            print('%s %-55s mới: %-14s cũ: %-14s phụ: %-18s dấu trên đầu: %s' % ('OK ' if ok else 'SAI', name, r['main'] or '(không)', r0['main'] or '(không)', r['sub'] or '-', r['markEl']))
        b.close()
    if errs:
        print('pageerror:', errs[:5]); sys.exit(1)
    print('0 pageerror' if not bad else '%d ca SAI' % bad)
    sys.exit(1 if bad else 0)


main()
