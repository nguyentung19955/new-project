"""Chụp ảnh cổng dịch chuyển sau khi thắng (lúc mọc lên, lúc đã mọc, đứng gần cổng có nút "Vào cổng", bản đồ to) vào docs/sua-gop-y-1/.
Chạy từ thư mục game:  python3 tests/cong_shots.py   (cần Pillow)"""
import io, os
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'sua-gop-y-1')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

SETUP = r"""(o) => {
  G.MOVE_TIPS = {};
  G.testSave({ hero: 'hunter', lvl: 10, tier: 2 });
  G.startStage(o.r, o.i, 0);
  const S = G.getRun(); G.gotoRoom(S.map.boss);
  const W = G.getWorld(), b = W.boss, sc = G.scene;
  window.SC = sc;
  G.scene = { update() {}, draw() { sc.draw(); }, hide() {} };
  G.botInput = () => ({ mx: 0, my: 0 });
  S.fade = 0;
  b.invuln = 0; b.hp = 1; G.damage(b, 99, { w: G.curW(S.P), el: 'ice' });
  return true;
}"""
STEP = "(n) => { for (let k = 0; k < n; k++) { G.time += 1 / 60; window.SC.update(1 / 60); } return G.getRun().mode; }"


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1170, 'height': 540}, device_scale_factor=1)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(500)
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        shots = []

        def grab(cap):
            pg.wait_for_timeout(120)
            shots.append((Image.open(io.BytesIO(pg.screenshot())).convert('RGB'), cap))

        pg.evaluate(SETUP, {'r': 0, 'i': 2})
        pg.evaluate(STEP, 72 + 18); grab('1. Vừa hạ trùm: cổng mọc lên, đồ rơi văng ra')
        pg.evaluate(STEP, 120); grab('2. Dòng báo thắng, đồ rơi nằm trên sàn')
        pg.evaluate("(() => { const S = G.getRun(), pt = S.W.props.find((q) => q.type === 'portal'); S.P.x = pt.x + 9; S.P.y = pt.y + 2; })()")
        pg.evaluate(STEP, 30); grab('3. Đứng gần cổng: nút Đánh thành "Vào cổng"')
        pg.evaluate("(() => { G.getRun().mode = 'map'; })()"); grab('4. Bản đồ to: phòng trùm có biểu tượng cổng')
        pg.evaluate(SETUP, {'r': 2, 'i': 4})
        pg.evaluate(STEP, 200); grab('5. Phòng trùm vùng 3 sau khi thắng')
        pg.evaluate("(() => { G.getRun().mode = 'paused'; })()"); grab('6. Tạm dừng sau khi thắng: có nút Rời ải')
        f1, f2 = ImageFont.truetype(FONT, 30), ImageFont.truetype(FONT, 22)
        w, h = 760, round(760 * 540 / 1170)
        out = Image.new('RGB', (2 * w + 3 * 20, 70 + 3 * (h + 50)), '#140f10')
        d = ImageDraw.Draw(out)
        d.text((out.size[0] / 2, 36), 'Cổng dịch chuyển sau khi thắng', font=f1, fill='#ffd27a', anchor='mm')
        for k, (im, cap) in enumerate(shots):
            x, y = 20 + (k % 2) * (w + 20), 70 + (k // 2) * (h + 50)
            out.paste(im.resize((w, h), Image.LANCZOS), (x, y))
            d.text((x + w / 2, y + h + 22), cap, font=f2, fill='#f1ead9', anchor='mm')
        out.save(os.path.join(OUT, 'cong-dich-chuyen.png'))
        print('đã ghi cong-dich-chuyen.png', errs[:3])
        b.close()


main()
