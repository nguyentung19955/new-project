"""AUDIT hình ảnh (phiên au-van-hanh-ui, mục 2.1–2.4 bản góp ý). CHỈ CHỤP, không sửa game.
Mỗi vùng (Rừng già, Hang biển, Lâu đài cổ): dựng một phòng đánh quái thật, đặt đủ 8 vai quái + tinh anh của vùng đó và 4 nhân vật,
lấy lớp điểm ảnh 480x270 rồi lưu:
  hinh-<vùng>-x3.png    phóng 3 lần (soi chi tiết)
  hinh-<vùng>-that.png  cỡ thật trên iPhone ngang 844x390 (1 điểm ảnh = 1,444 CSS px)
  hinh-<vùng>-50.png    thu nhỏ 50% của cỡ thật (giả lập nhìn lướt / màn nhỏ)
  hinh-<vùng>-xam.png   ảnh xám cỡ x2 (so độ sáng nhân vật/quái với sàn, bỏ qua màu)
Chạy từ thư mục game:  python3 tests/au_hinh.py [thư mục ảnh]   (mặc định ../docs/review/anh)
In số đo độ sáng (luminance) trung bình của sàn và của từng con để xem có tách khỏi nền không."""
import os, sys, io, base64, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import ROOT, URL
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh')
os.makedirs(OUT, exist_ok=True)
VUNG = ['rung', 'bien', 'lau-dai']
JS = r"""
(r) => {
  G.botInput = null;
  const rnd = G.srand(77 + r); Math.random = rnd; G.rnd = rnd;
  G.testSave({ lvl: 8 + r * 7, tier: 1, branch: 'fire', marks: 140 });
  G.startStage(r, 1, 0, { kind: 'A', seed: 11 + r });
  const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null;
  G.testGoto('fight');
  const W = S.W, P = S.P;
  W.waves = []; W.spawns = []; W.ents.length = 0; P.inv = 999;
  const roles = ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky', 'elite'];
  // 9 con xếp lưới 3x3 cách đều trên sàn (không chồng lên nhau), 4 nhân vật một hàng sát mép dưới
  const out = [];
  roles.forEach((role, i) => {
    const cx = W.x0 + (W.x1 - W.x0) * (0.2 + 0.3 * (i % 3)), cy = W.y0 + (W.y1 - W.y0) * (0.3 + 0.22 * Math.floor(i / 3));
    const e = G.spawnEnemy(role, cx, cy, {}); e.speed = 0; e.cd = 99; e.inside = true;
    out.push({ role, art: e.art || e.skin || '', x: e.x, y: e.y });
  });
  P.x = W.x0 + (W.x1 - W.x0) * 0.2; P.y = W.y1 - 6;
  // ba nhân vật còn lại vẽ thêm cạnh bé đang chơi (cùng hàm vẽ của game)
  const others = G.HKEYS.filter((k) => k !== G.save.hero);
  const draw0 = G.drawWorld;
  G.drawWorld = function (reg) {
    draw0(reg);
    const c = G.wx; c.setTransform(1, 0, 0, 1, -Math.round(W.cam || 0), 0);
    others.forEach((k, i) => { try { G.art.hero(c, { x: P.x + (i + 1) * (W.x1 - W.x0) * 0.2, y: P.y, face: 1, key: k, move: false, t: G.time, atk: -1, dodge: -1,
      weapon: { type: ['bow', 'spear', 'hammer'][i], family: 0, rarity: 1, marks: { fire: 0, poison: 0, ice: 0 }, branch: null, sharpen: 0 } }); } catch (er) { window.__heroErr = String(er); } });
    c.setTransform(1, 0, 0, 1, 0, 0);
  };
  for (let k = 0; k < 150; k++) { G.sim(1); P.hp = P.maxhp; }
  G.ui.begin(); G.scene.draw();
  const png = document.getElementById('world').toDataURL('image/png');
  G.drawWorld = draw0;
  return { png, err: window.__heroErr || null, ents: out, floor: [W.x0, W.y0, W.x1, W.y1], cam: Math.round(W.cam || 0), hero: [P.x, P.y] };
}
"""


def lum(px):
    r, g, b = px[:3]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def region_mean(im, box):
    x0, y0, x1, y1 = [int(v) for v in box]
    vals = [lum(im.getpixel((x, y))) for x in range(max(0, x0), min(im.width, x1)) for y in range(max(0, y0), min(im.height, y1))]
    return sum(vals) / max(1, len(vals))


def main():
    rep = {}
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.wait_for_timeout(300)
        for r, v in enumerate(VUNG):
            info = pg.evaluate(JS, r)
            data = info['png']
            if info['err']: errs.append(info['err'])
            im = Image.open(io.BytesIO(base64.b64decode(data.split(',')[1]))).convert('RGB')
            im.resize((im.width * 3, im.height * 3), Image.NEAREST).save(os.path.join(OUT, f'hinh-{v}-x3.png'))
            real = im.resize((round(im.width * 1.444), round(im.height * 1.444)), Image.NEAREST)
            real.save(os.path.join(OUT, f'hinh-{v}-that.png'))
            real.resize((real.width // 2, real.height // 2), Image.BOX).save(os.path.join(OUT, f'hinh-{v}-50.png'))
            ImageOps.grayscale(im).resize((im.width * 2, im.height * 2), Image.NEAREST).save(os.path.join(OUT, f'hinh-{v}-xam.png'))
            # độ sáng: sàn = dải ngang giữa hai hàng quái; mỗi con = ô 12x16 quanh thân (trên chân)
            cam = info['cam']; f = info['floor']
            floor = region_mean(im, (f[0] - cam + 4, (f[1] + f[3]) / 2 + 4, f[2] - cam - 4, (f[1] + f[3]) / 2 + 12))
            ents = []
            for e in info['ents']:
                x, y = e['x'] - cam, e['y']
                # lấy 25% điểm ảnh tương phản nhất với sàn trong ô quanh thân (bỏ phần sàn lọt vào ô)
                vals = sorted((abs(lum(im.getpixel((xx, yy))) - floor), lum(im.getpixel((xx, yy))))
                              for xx in range(int(x - 6), int(x + 6)) for yy in range(int(y - 16), int(y)) if 0 <= xx < im.width and 0 <= yy < im.height)
                top = vals[-max(1, len(vals) // 4):]
                ents.append((e['role'], round(sum(t[1] for t in top) / len(top)), round(sum(t[0] for t in top) / len(top))))
            rep[v] = {'san': round(floor), 'quai': ents}
            print(v, 'sàn', round(floor), '| (vai, độ sáng thân, chênh với sàn):', ents)
        b.close()
    with open(os.path.join(OUT, 'au_hinh_do_sang.json'), 'w', encoding='utf-8') as fo:
        json.dump(rep, fo, ensure_ascii=False, indent=1)
    print('lỗi JS:', errs or 'không có')
    return 1 if errs else 0


if __name__ == '__main__':
    sys.exit(main())
