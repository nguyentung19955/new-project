"""Ảnh soát tư vấn 4 — phúc lành giữa ải (16/10). KHÔNG chơi thử: dựng cảnh tĩnh (headless) rồi chụp; cảnh trong trận để bot có sẵn
(tests/bot.js) tự đánh vài giây với một phúc lành ép sẵn.
Chạy: python3 docs/review/ke-hoach-cai-thien/tu-van-4-phuc-lanh/chup_soat.py [đường trang, mặc định game/dist/linh-khi.html]
Ra (anh-soat/): bang-ai1.png (lần đầu, Ải 1), bang-ai.png (ải sau, có hệ), bang-en.png, tam-dung.png, tran-ghep.png (4 cảnh: Gươm Hồ Gươm, Ngựa sắt, Rìu Thạch Sanh, Nỏ thần); kiểm ?phuclanh=0 tắt hẳn."""
import os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'anh-soat')
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
TRANG = sys.argv[1] if len(sys.argv) > 1 else os.path.join(GAME, 'dist', 'linh-khi.html')

MO_BANG = r'''
([r, i, lvl, el, lang]) => {
  G.testSave({ lvl, branch: el, marksMoi: el ? 2000 : 0, tier: el ? 2 : 0 }); G.save.sound = false;
  if (r === 0) G.save.tut.phucLanh = 0; else G.save.tut.phucLanh = 1;
  G.LANG = lang || 'vi';
  G.startStage(r, i, 0);
  const S = G.getRun();
  for (const e of S.W.ents) e.dead = true; S.W.ents = []; S.W.waves = []; S.W.cleared = true;
  S.pl.opts = G.phucLanh.moi(S); S.pl.xong = true; S.mode = 'phuclanh';
  return S.pl.opts;
}
'''


def mo(p, q=''):
    pg = p.chromium.launch().new_page(viewport={'width': 960, 'height': 540}, is_mobile=True, has_touch=True)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
    pg.goto('file://' + TRANG + '?cloud=0' + q)
    pg.wait_for_function('window.G && G.scene')
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.wait_for_timeout(1500)
    return pg, errs


def tran(pg, k, giay=3.5):
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'bot.js'))
    pg.evaluate('''(k) => { G.testSave({ lvl: 8, melee: k === 'tre' ? 'spear' : k === 'riu' ? 'hammer' : 'sword' }); G.save.sound = false; G.save.tut.phucLanh = 1;
      G.startStage(0, 2, 0); const S = G.getRun(); G.gotoRoom(S.map.rooms.find((o) => o.type === 'fight').id); S.pl.k = k; S.pl.xong = true; S.P.plSac = 1;
      if (k === 'no') S.P.cur = 1; }''', k)
    # chụp khi hiệu ứng của phúc lành đang hiện trên sân (bot tự đánh; tối đa giay x 4)
    thay = {'guom': "(G.getWorld().mvSp || []).some((q) => q.pl)", 'ngua': "G.getWorld().zones.some((z) => z.pl)",
            'riu': "(G.getWorld().mvWaves || []).some((z) => z.pl)", 'no': "G.getWorld().projs.some((o) => o.plNay)"}.get(k, 'false')
    co = False
    for _ in range(int(giay * 4 * 10)):
        pg.wait_for_timeout(100)
        if pg.evaluate('() => ' + thay): co = True; break
    pg.screenshot(path=os.path.join(OUT, 'tran-' + k + '.png'))
    print('trận', k, 'thấy hiệu ứng' if co else 'chưa thấy hiệu ứng (chụp lúc hết giờ)')


def main():
    os.makedirs(OUT, exist_ok=True)
    allerr = []
    with sync_playwright() as p:
        pg, errs = mo(p)
        print('ải 1:', pg.evaluate(MO_BANG, [0, 0, 1, None, 'vi'])); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(OUT, 'bang-ai1.png'))
        print('ải 2-3:', pg.evaluate(MO_BANG, [1, 2, 12, 'poison', 'vi'])); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(OUT, 'bang-ai.png'))
        print('en:', pg.evaluate(MO_BANG, [2, 1, 18, 'ice', 'en'])); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(OUT, 'bang-en.png'))
        # chọn thẻ giữa bằng một lần chạm thật lên thẻ (toạ độ màn hình), rồi mở Tạm dừng
        pg.evaluate("() => { G.LANG = 'vi'; }")
        pg.wait_for_timeout(500)
        x, y, w, h = pg.evaluate("() => { const PL = G.phucLanh; return [PL.theX(1), PL.theY(), PL.CW, PL.CH]; }")
        box = pg.evaluate("() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width, r.height, G.W, G.H, G.mx || 0, G.my || 0]; }")
        print('canvas', box)
        da = pg.evaluate("() => { const PL = G.phucLanh, S = G.getRun(); PL.chon(1); S.mode = 'paused'; return S.pl.k; }")
        print('đã chọn', da); pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(OUT, 'tam-dung.png'))
        allerr += errs
        for k in ['guom', 'ngua', 'riu', 'no']:
            pg, errs = mo(p)
            tran(pg, k)
            allerr += errs
        try:  # ghép 4 ảnh trận thành một (tran-ghep.png)
            from PIL import Image
            ims = [Image.open(os.path.join(OUT, 'tran-' + k + '.png')) for k in ['guom', 'ngua', 'riu', 'no']]
            w, h = ims[0].size; o = Image.new('RGB', (w * 2, h * 2))
            for j, im in enumerate(ims): o.paste(im, ((j % 2) * w, (j // 2) * h))
            o.resize((w, h)).save(os.path.join(OUT, 'tran-ghep.png'))
            for k in ['guom', 'ngua', 'riu', 'no']: os.remove(os.path.join(OUT, 'tran-' + k + '.png'))
        except Exception as e:
            print('không ghép được ảnh trận:', e)
        pg, errs = mo(p, '&phuclanh=0')
        print('tắt:', pg.evaluate("() => [G.PHUC_LANH_BAT, !!(G.phucLanh && G.phucLanh.DS)]"))
        allerr += errs
    print('LỖI JS:', allerr[:5] if allerr else 'không')


main()
