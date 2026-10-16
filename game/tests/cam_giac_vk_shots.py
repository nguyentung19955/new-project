"""bao-cao-B (16/10): chụp headless để soát bằng mắt (KHÔNG chơi tay):
  1. búa báo trước — dải khung nhát Nện từ lúc bấm tới lúc chạm, bản mới (khung búa giơ cao giữ ~0,24 giây) và bản ?camgiac=0 (cũ);
  2. đòn nối — kiếm trúng quái rồi đổi vũ khí trong 0,18 giây: phi tiêu tự ném một phát, ô vũ khí nháy 0,08 giây.
Chạy (từ thư mục game):  python3 tests/cam_giac_vk_shots.py [thư mục ra]  -> docs/review/ke-hoach-cai-thien/vu-khi-chatgpt/anh-B/*.png
Chụp trên dist/linh-khi.html (chạy python3 build.py trước). Dùng bộ khung tests/au_phan_hoi_shots.py (tự chạy G.tick + vẽ từng khung, không requestAnimationFrame)."""
import io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import au_phan_hoi_shots as AP

HERE = AP.HERE
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(HERE), 'docs', 'review', 'ke-hoach-cai-thien', 'vu-khi-chatgpt', 'anh-B')
BUA = [("T.run({ atkP: true, atk: true }, 1)", 'bấm (u 0,02)'), ("T.run({}, 3)", 'u 0,08'), ("T.run({}, 5)", 'u 0,19'),
       ("T.run({}, 5)", 'u 0,29'), ("T.run({}, 3)", 'u 0,35 chạm'), ("T.run({}, 4)", 'sau chạm')]


def dai(pg, F, title, setup, steps, path, hud=False):
    cx, cy = pg.evaluate(setup)
    ims = []
    for js, cap in steps:
        pg.evaluate('() => { ' + js + ' }')
        box = pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / 480, G.getWorld().cam]; })()")
        if hud:  # ô vũ khí (góc trên phải, toạ độ giao diện 368..480 x 0..40) + Tí
            clip = {'x': box[0] + 300 * box[2], 'y': box[1], 'width': 180 * box[2], 'height': 120 * box[2]}
        else:
            hw, hh = 60, 46
            clip = {'x': box[0] + (cx - box[3] - hw) * box[2], 'y': box[1] + (cy - hh) * box[2], 'width': 2 * hw * box[2], 'height': 2 * hh * box[2]}
        im = Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB')
        ims.append((im, cap))
    w, h = ims[0][0].size
    cols = min(len(ims), 6 if not hud else 4)
    rows = (len(ims) + cols - 1) // cols
    out = Image.new('RGB', (cols * (w + 8) + 8, 40 + rows * (h + 28)), '#140f10')
    d = ImageDraw.Draw(out)
    d.text((10, 10), title, font=F, fill='#ffd27a')
    for i, (im, cap) in enumerate(ims):
        x, y = 8 + (i % cols) * (w + 8), 36 + (i // cols) * (h + 28)
        out.paste(im, (x, y))
        d.text((x + 4, y + h + 4), str(i + 1) + '. ' + cap, font=F, fill='#f1ead9')
    out.save(path)
    print('đã lưu', path)


def main():
    os.makedirs(OUT, exist_ok=True)
    errs = []
    F = ImageFont.truetype(AP.FONT, 15)
    with sync_playwright() as p:
        b = p.chromium.launch()
        for q, tag in [('', 'moi'), ('?camgiac=0', 'cu')]:
            pg = b.new_page(viewport={'width': 960, 'height': 540})
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
            pg.goto('file://' + HERE + '/dist/linh-khi.html' + (q or '?') + '&cloud=0')  # bản dựng một tệp (có ảnh Tí), như tests/zed_chay_danh.py
            pg.wait_for_function('window.G && G.scene', timeout=60000)
            pg.wait_for_function("() => G.spriteCustom.zed && G.spriteCustom.zed['zed-moi'].ready && G.spriteCustom.zed['zed-vk'].ready", timeout=60000)
            pg.wait_for_timeout(1500)
            pg.evaluate("window.requestAnimationFrame = () => 0")
            pg.add_script_tag(path=os.path.join(HERE, 'tests', 'bot.js'))
            pg.add_script_tag(path=os.path.join(HERE, 'tests', 'setup.js'))
            pg.evaluate(AP.LIB)
            dai(pg, F, 'Búa: nhát Nện từ lúc bấm tới lúc chạm (' + ('mới: khung giơ búa giữ lâu' if tag == 'moi' else 'cũ, ?camgiac=0') + ')',
                "() => T.room({ melee: 'hammer', dum: [[26, 0]], shift: 14 })", BUA, os.path.join(OUT, 'bua-bao-truoc-' + tag + '.png'))
            if tag == 'moi':
                dai(pg, F, 'Đòn nối: kiếm trúng rồi đổi trong 0,18 giây → phi tiêu tự ném, ô vũ khí nháy 0,08 giây',
                    "() => T.room({ dum: [[24, 0]], shift: 20 })",
                    [("T.run({ atkP: true, atk: true }, 1); T.run({}, 9)", 'kiếm chạm'), ("T.run({ swapP: true }, 1)", 'đổi (khung 1)'),
                     ("T.run({}, 3)", '+3 khung (0,05 giây)'), ("T.run({}, 6)", '+9 khung')], os.path.join(OUT, 'don-noi.png'), hud=True)
                dai(pg, F, 'Đòn nối trong trận: kiếm chạm → đổi → phi tiêu ném ngay (khung ảnh có sẵn của đòn Ném, từ lúc chạm)',
                    "() => T.room({ dum: [[24, 0]], shift: 14 })",
                    [("T.run({ atkP: true, atk: true }, 1); T.run({}, 9)", 'kiếm chạm'), ("T.run({ swapP: true }, 1)", 'đổi: đòn nối'),
                     ("T.run({}, 2)", '+2 khung'), ("T.run({}, 4)", '+6 khung')], os.path.join(OUT, 'don-noi-tran.png'))
                n = pg.evaluate("G.getWorld().stats.donNoi | 0")
                print('số đòn nối trong cảnh:', n)
                if n < 1: errs.append('cảnh đòn nối không ra đòn nối (%d)' % n)
            errs += pg.evaluate('T.errs')
            pg.close()
        b.close()
    if errs:
        print('LỖI JS:', *errs[:10], sep='\n  ')
        sys.exit(1)
    print('không có lỗi JS')


if __name__ == '__main__':
    main()
