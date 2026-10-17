"""BOT (headless, KHÔNG chơi thử bằng tay): chạy thật vòng lặp game ở nét 2 / 3 / 4 trên bản web, xem ảnh nét cao quái / trùm có được dùng
và có lỗi JS không. Mỗi vùng: (1) vào ải 1 như thường, Cu Tí bất tử đứng giữa phòng 10 giây cho quái ra đánh; (2) phòng trùm vùng (AU.room),
trùm bị trừ máu đều đặn tới chết qua đủ 3 pha (đổi pha, gục). Đếm lần vẽ thân quái bằng ảnh nét cao / ảnh thường.
  python3 bot_netcao.py <url trang web (không ?)> [nét, vd 2,3,4] → in bảng + ra/bot.json"""
import json, os, sys
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..', 'game'))
URL = sys.argv[1]
NETS = [int(x) for x in (sys.argv[2] if len(sys.argv) > 2 else '2,3,4').split(',')]

HOOK = r"""() => {
  const SC = G.spriteCustom, v0 = SC.veKhung;
  window.__dem = {};
  SC.veKhung = function (c, sp, ten, i, face, o) {
    if (sp && sp.ma) { const h = sp['_n' + G.NET], k = sp.ma + (h && h.ready ? ' cao' : ' thuong'); window.__dem[k] = (window.__dem[k] || 0) + 1; }
    return v0.apply(this, arguments);
  };
}"""

THUONG = r"""(r) => {
  clearInterval(window.__giu);
  const { W, P } = AU.room({ region: r, stage: 1, lvl: 30, tier: 2 }); AU.live(true);
  const vai = ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky', 'elite', 'elite'];
  vai.forEach((v, i) => { const g = (i / vai.length) * Math.PI * 2; G.spawnEnemy(v, P.x + Math.cos(g) * 90, P.y + Math.sin(g) * 50, {}); });
  window.__giu = setInterval(() => { const P2 = G.getRun() && G.getRun().P; if (P2) { P2.inv = 9; P2.hp = P2.maxhp; } }, 100);
}"""

TRUM = r"""(r) => {
  clearInterval(window.__giu);
  const { W, P } = AU.room({ region: r, stage: 4, big: true, keepBoss: true, lvl: 30, tier: 2 });
  const b = W.boss; AU.live(true); P.x = b.x - 80; P.y = b.y + 30;
  window.__trum = { pha: [b.phase + 1], chet: false };
  window.__giu = setInterval(() => {
    const W2 = G.getWorld(), b2 = W2 && W2.boss, P2 = G.getRun().P; P2.inv = 9; P2.hp = P2.maxhp;
    if (!b2) { window.__trum.chet = true; return; }
    if (!(b2.invuln > 0) && b2.dying == null) G.damage(b2, b2.maxhp * 0.05, {});
    const ph = b2.phase + 1; if (window.__trum.pha[window.__trum.pha.length - 1] !== ph) window.__trum.pha.push(ph);
    if (b2.dead || b2.dying != null) window.__trum.chet = true;
  }, 500);
}"""


def main():
    out = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for N in NETS:
            pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=3)
            errs = []
            pg.on('pageerror', lambda e, errs=errs: errs.append(str(e)))
            pg.goto(URL + '?cloud=0' + ('&netcao=%d' % N if N != 2 else ''))
            pg.wait_for_function('window.G && G.scene && G.spriteCustom', timeout=60000)
            pg.wait_for_function("G.spriteCustom.sau ? G.spriteCustom.sau.tt === 'xong' : true", timeout=240000)
            for f in ('setup.js', 'au_lib.js'):
                pg.add_script_tag(path=os.path.join(GAME, 'tests', f))
            pg.evaluate(HOOK)
            kq = {'net': pg.evaluate('G.NET'), 'vung': []}
            for r in range(3):
                pg.evaluate("(r) => { const SC = G.spriteCustom; if (SC.taiVung) SC.taiVung(r); }", r)  # ảnh vùng tải lười: chờ về rồi mới vào ải (như game)
                pg.wait_for_function("(r) => { const SC = G.spriteCustom; return !SC.vungTien || SC.vungTien(r, true).san; }", arg=r, timeout=240000)
                pg.evaluate(THUONG, r); pg.wait_for_timeout(10000)
                pg.evaluate(TRUM, r)
                for _ in range(40):
                    pg.wait_for_timeout(1500)
                    if pg.evaluate('window.__trum.chet'):
                        break
                pg.wait_for_timeout(2500)
                kq['vung'].append(pg.evaluate("() => ({ trum: window.__trum, net: G.NET })"))
            pg.evaluate('clearInterval(window.__giu)')
            dem = pg.evaluate('window.__dem')
            kq['ve'] = dem; kq['loi'] = errs
            kq['so_cao'] = sum(v for k, v in dem.items() if k.endswith(' cao')); kq['so_thuong'] = sum(v for k, v in dem.items() if k.endswith(' thuong'))
            kq['ma_cao'] = sorted({k[:-4] for k in dem if k.endswith(' cao')}); kq['ma_thuong'] = sorted({k[:-7] for k in dem if k.endswith(' thuong')})
            out['n%d' % N] = kq
            print('nét %d (G.NET %s): lỗi JS %d | vẽ thân ảnh nét cao %d lần (%d con), ảnh thường %d lần (%d con) | trùm: %s' % (
                N, kq['net'], len(errs), kq['so_cao'], len(kq['ma_cao']), kq['so_thuong'], len(kq['ma_thuong']), [v['trum'] for v in kq['vung']]), flush=True)
            if errs:
                print('  ', errs[:5])
            pg.close()
        b.close()
    os.makedirs(os.path.join(HERE, 'ra'), exist_ok=True)
    json.dump(out, open(os.path.join(HERE, 'ra', 'bot.json'), 'w'), ensure_ascii=False, indent=1)


main()
