"""Soát Cu Tí to hơn: không che HUD, chân không rời bóng, sát tường / cửa vẫn hợp lý. KHÔNG chơi thử: đặt Cu Tí đứng yên ở các góc phòng rồi chụp
cả màn (canvas thế giới + lớp giao diện #ui) ở cỡ điện thoại ngang 844×390.
Chạy từ thư mục game sau khi build:  python3 ../docs/review/ke-hoach-cai-thien/cu-ti-to-muot/chup_hud.py <thư mục ra> [cờ url]"""
import os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, 'anh')
CO = sys.argv[2] if len(sys.argv) > 2 else ''
URL = 'file://' + GAME + '/dist/linh-khi.html?cloud=0' + CO
CHO = [  # (tên, vị trí theo phòng: 'tl' trên trái, 'tr' trên phải, 'bl' dưới trái, 'br' dưới phải, 'cua' sát cửa trên, 'giua'), vũ khí, mặt
    ('tren-trai', 'tl', 'spear', 1), ('tren-phai', 'tr', 'hammer', -1), ('duoi-trai', 'bl', 'sword', 1), ('duoi-phai', 'br', 'sword', 1),
    ('sat-cua', 'cua', 'sword', 1), ('giua-bua', 'giua', 'hammer', 1),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_timeout(800)
        pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
        pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return false; for (const k of ['zed-moi','zed-vk']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (!q || !q.ready) return false; } return true; }", timeout=60000)
        pg.evaluate("() => { G.testSave({ lvl: 12 }); G.save.sound = false; G.startStage(0, 0, 0, { kind: 'A', seed: 7 }); }")
        pg.wait_for_timeout(2500)
        for ten, cho, loai, mat in CHO:
            info = pg.evaluate("""([cho, loai, mat]) => {
              const S = G.getRun(), W = S.W, P = W.P; S.fade = 0;
              if (W.ents) for (const e of W.ents) e.hidden = false;
              P.weapons[P.cur].type = loai; P.face = mat; P.atkT = 0; P.hurtT = 0; P.inv = 0;
              const x1 = W.px1 != null ? W.px1 : W.x1;
              const X = { tl: W.x0, bl: W.x0, tr: x1, br: x1, cua: (W.x0 + x1) / 2 + 8, giua: (W.x0 + x1) / 2 }[cho];
              const Y = { tl: W.y0, tr: W.y0, bl: W.y1, br: W.y1, cua: W.y0, giua: (W.y0 + W.y1) / 2 }[cho];
              P.x = X; P.y = Y; G.keys = {};
              return [P.x, P.y, W.x0, x1, W.y0, W.y1, G.COTI_TO];
            }""", [cho, loai, mat])
            pg.wait_for_timeout(500)
            pg.screenshot(path=os.path.join(OUT, 'hud-' + ten + '.png'))
            print(ten, info)
        b.close()
    print('LỖI JS:', errs[:5] if errs else 'không')


if __name__ == '__main__':
    main()
