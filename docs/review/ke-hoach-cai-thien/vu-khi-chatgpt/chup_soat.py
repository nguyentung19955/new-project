"""Ảnh soát bao-cao-A (16/10): vũ khí trên tay Cu Tí ở ĐÚNG cỡ trong trận + khung ô theo bậc ép đồ. KHÔNG chơi thử: chỉ dựng cảnh tĩnh.
Chạy từ thư mục game sau khi build:  python3 ../docs/review/ke-hoach-cai-thien/vu-khi-chatgpt/chup_soat.py [cờ url, vd '&vienvk=1']
Ra: anh-soat/vk-tran-x1.png (cỡ thật: 1 điểm ảnh game = 1 điểm ảnh), vk-tran-x3.png, hud-o.png, o-bac.png. In lỗi JS nếu có."""
import base64, io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'anh-soat')
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
URL = 'file://' + GAME + '/dist/linh-khi.html?cloud=0' + (sys.argv[1] if len(sys.argv) > 1 else '')
LOAI = ['sword', 'spear', 'hammer', 'bow']
TEN = {'sword': 'Kiem', 'spear': 'Thuong', 'hammer': 'Bua', 'bow': 'Phi tieu'}
CAP = ['Trang', 'Mam', 'Thanh hinh', 'Thuc tinh']

DUNG = r'''
([loai, cap, he, bac, an]) => {
  if (!window.__T) {
    G.testSave({ lvl: 10 }); G.save.sound = false;
    G.startStage(0, 0, 0, { kind: 'A', seed: 7 });
    const S = G.getRun(); S.fade = 0;
    window.__T = { sc: G.scene };
    G.scene = { update() {}, draw() { window.__T.sc.draw(); }, hide() {} };
  }
  const S = G.getRun(), P = S.P;
  if (S.mobs) S.mobs.length = 0;
  if (S.projs) S.projs.length = 0;
  const w = P.weapons[P.cur];
  w.type = loai; w.branch = cap ? he : null; w.marks = { fire: 0, poison: 0, ice: 0 };
  if (cap) w.marks[he] = [0, 60, 400, 900][cap];
  w.sharpen = 0; w.ep = { b: bac, d: [], may: {} };
  if (P.weapons[1]) { const w2 = P.weapons[(P.cur + 1) % P.weapons.length]; w2.ep = { b: Math.min(6, bac + 3), d: [], may: {} }; }
  P.atkT = 0; P.face = 1; P.vx = 0; P.vy = 0; P.inv = 0; P.hurtT = 0;
  if (an) P.x = an[0], P.y = an[1];
  G.time = 1.25;
  return [P.x, P.y, G.wStage(w), document.getElementById('world').width];
}
'''


def chup(pg, cid):
    d = pg.evaluate("(id) => document.getElementById(id).toDataURL('image/png')", cid)
    return Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')


def main():
    os.makedirs(OUT, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 480, 'height': 270})  # 480×270 = đúng lưới điểm ảnh game (1:1)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
        pg.goto(URL)
        pg.wait_for_function('window.G && G.scene && G.testSave === undefined || true')
        pg.wait_for_timeout(600)
        pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
        pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return false; for (const k of ['zed-moi','zed-vk']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (!q || !q.ready) return false; } return true; }", timeout=60000)
        info = pg.evaluate(DUNG, ['sword', 0, 'fire', 0, None])
        pg.wait_for_timeout(1500)  # ảnh phòng Rừng già, tải sau
        print('player/canvas', info, pg.evaluate("() => ({ vien: G.VIEN_VK, khung: G.KHUNG_BAC, he: !!(G.vkHe), scale: G.SCALE })"))
        # 1) 16 ô: vũ khí trên tay Cu Tí ở cỡ thật (đứng, mặt phải), nền phòng Rừng già
        CW, CH = 64, 52
        tam = None
        grid = Image.new('RGBA', (4 * CW, 4 * CH), (0, 0, 0, 255))
        for r, L in enumerate(LOAI):
            for k in range(4):
                v = pg.evaluate(DUNG, [L, k, 'fire', 0, None])
                pg.evaluate("() => { G.scene.draw(); }")
                pg.wait_for_timeout(30)
                im = chup(pg, 'world')
                sx = im.width / 480
                if tam is None:
                    tam = (v[0], v[1])
                # cắt quanh Cu Tí (toạ độ game → điểm ảnh canvas)
                cam = pg.evaluate("() => { const S = G.getRun(); return [S.cam ? S.cam.x : 0, S.cam ? S.cam.y : 0]; }")
                px, py = (v[0] - cam[0]), (v[1] - cam[1])
                box = [int((px - CW / 2) * sx), int((py - CH + 12) * sx), int((px + CW / 2) * sx), int((py + 12) * sx)]
                cr = im.crop(box).resize((CW, CH), Image.NEAREST)
                grid.paste(cr, (k * CW, r * CH))
        lab = Image.new('RGBA', (4 * CW * 3 + 90, 4 * CH * 3 + 30), (24, 22, 28, 255))
        lab.paste(grid.resize((grid.width * 3, grid.height * 3), Image.NEAREST), (90, 30))
        dr = ImageDraw.Draw(lab)
        for k in range(4):
            dr.text((90 + k * CW * 3 + 6, 8), CAP[k], fill=(240, 230, 200, 255))
        for r, L in enumerate(LOAI):
            dr.text((6, 30 + r * CH * 3 + CH * 3 // 2), TEN[L], fill=(240, 230, 200, 255))
        grid.save(os.path.join(OUT, 'vk-tran-x1.png'))
        lab.save(os.path.join(OUT, 'vk-tran-x3.png'))
        # 2) HUD ô vũ khí trong trận: ô đang cầm (bậc 0..6) — cắt góc trên phải, ×3
        hud = []
        for bac in [0, 2, 3, 5, 6]:
            pg.evaluate(DUNG, ['sword', 2, 'ice', bac, None])
            pg.evaluate("() => { G.scene.draw(); }")
            pg.wait_for_timeout(30)
            im = chup(pg, 'ui')
            sx = im.width / 464 if im.width < 900 else im.width / 464
            hud.append(im)
        W0 = hud[0].width
        crops = [h.crop((int(W0 * 0.73), 0, W0, int(hud[0].height * 0.16))) for h in hud]
        cw, ch = crops[0].size
        hh = Image.new('RGBA', (cw * 3, ch * 3 * len(crops)), (0, 0, 0, 255))
        for i, cimg in enumerate(crops):
            hh.paste(cimg.resize((cw * 3, ch * 3), Image.NEAREST), (0, i * ch * 3))
        hh.save(os.path.join(OUT, 'hud-o.png'))
        # 3) ô vũ khí 7 bậc ở các cỡ dùng trong game (20, 26/32, 13 tự vẽ ô) — vẽ bằng chính G.oBacVk + G.art.weaponIcon
        d = pg.evaluate(r'''() => {
          const S = 4, cv = document.createElement('canvas'); cv.width = 7 * 40 * S + 60 * S; cv.height = 3 * 44 * S; const c = cv.getContext('2d');
          c.imageSmoothingEnabled = false; c.fillStyle = '#1b1f27'; c.fillRect(0, 0, cv.width, cv.height); c.setTransform(S, 0, 0, S, 0, 0);
          const ux = G.ux; G.ux = c; G.time = 2.5;
          const vk = (type, b, cap) => ({ id: 900 + b, type, branch: cap ? 'poison' : null, marks: { fire: 0, poison: [0, 60, 400, 900][cap], ice: 0 }, sharpen: 0, ep: { b, d: [], may: {} } });
          try {
            for (let b = 0; b < 7; b++) {
              const x = 60 + b * 40;
              G.oBacVk(x, 4, 20, vk('sword', b, 1)); G.art.weaponIcon(c, vk('sword', b, 1), x + 10, 14, 17);
              G.oBacVk(x, 44, 32, vk('hammer', b, 3)); G.art.weaponIcon(c, vk('hammer', b, 3), x + 16, 60, 26);
              G.time += 0.0001; G.art.weaponIcon(c, vk('bow', b, 2), x + 10, 100, 13);
            }
          } finally { G.ux = ux; }
          c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#ddd'; c.font = 'bold 26px sans-serif';
          c.fillText('o 20', 8, 60); c.fillText('o 32', 8, 240); c.fillText('tu ve', 8, 410);
          return cv.toDataURL('image/png'); }''')
        Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).save(os.path.join(OUT, 'o-bac.png'))
        b.close()
    print('errors', errs[:10])
    return 1 if errs else 0


if __name__ == '__main__':
    sys.exit(main())
