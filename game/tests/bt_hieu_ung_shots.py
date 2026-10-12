"""Rà soát toàn bộ — phần B: chụp ảnh các hiệu ứng chiến đấu để xem bằng mắt (lệch phong cách, che mặt, sai chỗ, sai lúc).
Bản HAI TỆP như web (sau LK_HAI_TEP=1 python3 game/build.py --hai-tep), iPhone ngang 844×390 tỉ lệ 3:
    python3 game/tests/bt_hieu_ung_shots.py <thư mục ảnh> [tiền tố] [đuôi địa chỉ thêm]
Cảnh: trạng thái trên thân quái (cháy, độc, băng, đóng băng, choáng), trạng thái trên em bé, nổ bom ba hệ (cỡ vùng thật kẻ vàng),
đòn đặc biệt bốn vũ khí và chưởng ba hệ (vài khung), em bé trúng đòn. Ghi số pageerror và lỗi vẽ (G.fx.errs, G.baoTruoc.errs)."""
import os, sys, subprocess, time, socket
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(ROOT)
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/bt_hu'
PRE = sys.argv[2] if len(sys.argv) > 2 else 'sau'
EXTRA = sys.argv[3] if len(sys.argv) > 3 else ''
SRV = os.environ.get('LK_SRV', os.path.join(REPO, 'docs', 'review', 'kiem-thu-12-10', 'srv.py'))
os.makedirs(OUT, exist_ok=True)

SETUP = r"""
([r, melee, branch]) => {
  const o = AU.room({ region: r, stage: 0, lvl: 30, tier: 3, sharpen: 5, melee, branch, marks: branch ? 300 : 0, seed: 5 });
  o.P.mana = o.P.maxmana; o.P.inv = 0;
  G.hurtPlayer0 = G.hurtPlayer0 || G.hurtPlayer;
  G.hurtPlayer = () => false; AU.run(50, true); // chờ hết màn tối lúc vào phòng
  return { x: o.P.x, y: o.P.y };
}
"""

OVL = r'''
// Viền vàng kiểm tra (KHÔNG phải hình trong game): vẽ trên một tấm canvas HTML riêng phủ lên game, để vòng vẽ của game không xoá mất.
window.__ovl = function (list) {
  let cv = document.getElementById('__ovl');
  if (!cv) { cv = document.createElement('canvas'); cv.id = '__ovl'; cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:99999'; document.body.appendChild(cv); }
  const d = window.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
  if (!list || !list.length) return;
  const W = G.getWorld(), cam = Math.round(W.cam), k = (G.uiScale || 1) / (G.dpr || 1), rect = G.ux.canvas.getBoundingClientRect();
  c.setTransform(d, 0, 0, d, 0, 0); c.strokeStyle = '#ffff00'; c.lineWidth = 1;
  for (const z of list) { c.beginPath(); c.ellipse(rect.left + G.ox + (z.x - cam) * k, rect.top + G.oy + z.y * k, z.r * k, z.r * (G.ZK || 0.6) * k, 0, 0, Math.PI * 2); c.stroke(); }
};
'''


def port_free():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


def main():
    port = port_free()
    srv = subprocess.Popen([sys.executable, SRV, os.path.join(ROOT, 'dist'), str(port)], stderr=subprocess.DEVNULL)
    time.sleep(1)
    errs = []
    try:
        with sync_playwright() as p:
            br = p.chromium.launch()
            ctx = br.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (port, EXTRA))
            pg.wait_for_function('window.G && G.scene && G.spriteCustom', timeout=120000)
            try: pg.wait_for_function("G.spriteCustom.sau.tt === 'xong'", timeout=180000)
            except Exception: print('ảnh tải sau chưa xong, chụp tiếp')
            pg.wait_for_timeout(800)
            for f in ['bot.js', 'setup.js', 'au_lib.js']: pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
            pg.add_script_tag(content=OVL)
            draw = "() => { G.ui.begin(); G.scene.draw(); }"

            def shot(name):
                pg.evaluate(draw); pg.wait_for_timeout(40)
                pg.screenshot(path=os.path.join(OUT, '%s-%s.png' % (PRE, name)))

            # 1. trạng thái trên thân quái, ba vùng
            for r in [0, 1, 2]:
                pg.evaluate(SETUP, [r, 'sword', None])
                pg.evaluate("""() => { const W = G.getWorld(), P = W.P; G.hurtPlayer = () => false;
                  const L = [['fire', 1], ['poison', 4], ['ice', 2], ['frozen', 0], ['stun', 0]];
                  L.forEach(([el, n], i) => { const e = G.spawnEnemy(i % 2 ? 'rusher' : 'shield', P.x + 40 + i * 34, P.y + (i % 2 ? -14 : 14), {}); e.inside = true; e.cd = 99; e.spawnT = 0;
                    if (el === 'frozen') { e.st.frozen = 3; e.st.iceN = 3; } else if (el === 'stun') e.st.stun = 3; else for (let k = 0; k < n; k++) G.applyStatus(e, el, 20, 1); });
                  AU.run(40, true, () => { for (const e of W.ents) e.cd = 99; }); }""")
                shot('trang-thai-quai-%d' % r)
            # 2. trạng thái trên em bé: trúng độc, cháy, đóng băng
            pg.evaluate(SETUP, [0, 'sword', None])
            pg.evaluate("""() => { const W = G.getWorld(), P = W.P; G.hurtPlayer = G.hurtPlayer0; P.maxhp = 1e6; P.hp = 1e6;
              P.inv = 0; G.hurtPlayer(1, 'poison', null, false); P.inv = 0; P.frozenT = 1.5; AU.run(12, true, () => { P.hp = P.maxhp; }); }""")
            shot('trang-thai-be')
            # 3. nổ bom ba hệ: viền vàng = vùng gây sát thương thật của quả bom (bán kính 26)
            for r in [0, 1, 2]:
                pg.evaluate(SETUP, [r, 'sword', None])
                pg.evaluate("""() => { const W = G.getWorld(), P = W.P; G.hurtPlayer = () => false; const e = G.spawnEnemy('bomber', P.x + 150, P.y, {}); e.cd = 99;
                  AU.run(70, true, () => { e.cd = 99; }); // chờ hết màn tối lúc vào phòng
                  const z = G.mobBomb(e, P.x + 70, P.y, 0, 0.05, 26); window.__bz = { x: z.x, y: z.y, r: z.r }; AU.run(7, true, () => { e.cd = 99; }); }""")
                pg.evaluate(draw)
                pg.evaluate("() => window.__ovl([window.__bz])")
                pg.wait_for_timeout(40)
                pg.screenshot(path=os.path.join(OUT, '%s-no-bom-%d.png' % (PRE, r)))
                pg.evaluate("() => window.__ovl([])")
            # 4. đòn đặc biệt bốn vũ khí, chưởng ba hệ; quái đứng trước mặt
            for melee, br_ in [('sword', 'fire'), ('spear', 'ice'), ('hammer', 'poison'), ('bow', 'fire')]:
                pg.evaluate(SETUP, [2 if br_ == 'fire' else 1 if br_ == 'ice' else 0, melee, br_])
                pg.evaluate("""([melee]) => { const W = G.getWorld(), P = W.P; G.hurtPlayer = () => false; AU.want(P, melee);
                  for (let i = 0; i < 3; i++) { const e = G.spawnEnemy('rusher', P.x + 46 + i * 22, P.y + (i - 1) * 12, { hpMult: 50 }); e.inside = true; e.cd = 99; e.spawnT = 0; }
                  AU.run(30, true, () => { for (const e of W.ents) e.cd = 99; }); P.mana = P.maxmana; AU.press({ specialP: true }); }""", [melee])
                for k, n in [(1, 8), (2, 10)]:
                    pg.evaluate("([n]) => { const W = G.getWorld(); AU.run(n, true, () => { for (const e of W.ents) e.cd = 99; W.P.mana = W.P.maxmana; }); }", [n])
                    shot('dac-biet-%s-%d' % (melee, k))
            for r, el in [(0, 'poison'), (1, 'ice'), (2, 'fire')]:
                pg.evaluate(SETUP, [r, 'sword', None])
                pg.evaluate("""() => { const W = G.getWorld(), P = W.P; G.hurtPlayer = () => false;
                  for (let i = 0; i < 3; i++) { const e = G.spawnEnemy('rusher', P.x + 70 + i * 26, P.y + (i - 1) * 14, { hpMult: 50 }); e.inside = true; e.cd = 99; e.spawnT = 0; }
                  AU.run(30, true, () => { for (const e of W.ents) e.cd = 99; }); P.mana = P.maxmana; AU.press({ skillP: true }); }""")
                for k, n in [(1, 10), (2, 14)]:
                    pg.evaluate("([n]) => { const W = G.getWorld(); AU.run(n, true, () => { for (const e of W.ents) e.cd = 99; }); }", [n])
                    shot('chuong-%d-%d' % (r, k))
            # 5. em bé trúng đòn (chớp, số máu, ảnh hu-be-trung)
            pg.evaluate(SETUP, [1, 'sword', None])
            pg.evaluate("""() => { const W = G.getWorld(), P = W.P; G.hurtPlayer = G.hurtPlayer0; P.maxhp = 1e6; P.hp = 1e6; P.inv = 0;
              G.hurtPlayer(30, 'ice', null, true); AU.run(4, true, () => { P.hp = P.maxhp; }); }""")
            shot('be-trung-don')
            print('lỗi vẽ:', pg.evaluate("() => ({ fx: G.fx.errs || 0, bt: G.baoTruoc.errs })"))
            br.close()
    finally:
        srv.terminate()
    print('pageerror:', errs or 0)


main()
