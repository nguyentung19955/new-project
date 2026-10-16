"""VỪA ĐI / CHẠY VỪA RA ĐÒN — quay headless + đo từng nhịp (17/10, chan-di-danh/bao-cao.md).
KHÔNG chơi thử bằng tay: bấm phím giả theo kịch bản cố định, nhịp logic 60/giây (G.tick), vẽ Cu Tí riêng trên nền trong.
Chạy từ gốc repo sau khi build:
  python3 docs/review/ke-hoach-cai-thien/chan-di-danh/quay.py <thư mục ra> [cờ url, vd '&chandon=0']
Ra: so-lieu.json (mỗi tổ hợp: từng nhịp hàng ảnh, khung, chân, điểm eo) + <tổ hợp>.npz (trong = ảnh không vũ khí ×1 để đo, do.py;
    gif = ảnh có vũ khí ×3 để ghép GIF, gif.py).
Tổ hợp = (di | chay) × (thuong | kiem | bua | phitieu) × (phai | trai); mỗi kịch bản vũ khí chạy đủ mọi đòn:
  thương: 1 → 2 → 3 → quét → giữ → xốc → đặc biệt;  kiếm: 1 → 2 → 3 → đặc biệt;  búa: nện → giữ → nện đất → đặc biệt;
  phi tiêu: ném → ném → giữ ngắm → chùm → đặc biệt.
Số đo (đo trên hình KHÔNG vũ khí, cỡ ×1 = 2 điểm ảnh canvas / điểm ảnh game; xem do() dưới):
  chan  : tỉ lệ cao/rộng khối chân (từ đường ghép xuống bàn chân, chỉ phần nối với bàn chân) so với chính khung chân gốc trong tấm ảnh → % lệch
  eo    : lệch mép trái / phải giữa hàng ngay trên và ngay dưới đường ghép (điểm ảnh game), trừ phần lệch tự nhiên của khung gốc
  hoi   : số hàng trống giữa đầu và bàn chân (hở)
  doan  : số đoạn chân nhiều nhất trên một hàng (> 2 = hai bộ chân / mảnh lạ)
  dau   : đỉnh đầu (điểm ảnh game, tính từ chân) → bước nhảy giữa hai nhịp
  ban   : các bàn chân chạm đất, x thế giới (điểm ảnh game, ×cỡ hiển thị) → trượt chân
"""
import base64, io, json, os, sys
import numpy as np
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
GAME = os.path.join(GOC, 'game')
OUT = os.path.abspath(sys.argv[1])
CO = sys.argv[2] if len(sys.argv) > 2 else ''
CHI = set(sys.argv[3].split(',')) if len(sys.argv) > 3 and sys.argv[3] else None
URL = 'file://' + GAME + '/dist/linh-khi.html?cloud=0&modan=0' + CO  # modan=0: mở sẵn đòn đặc biệt cho kịch bản (chỉ trong lúc quay)

# (số nhịp, giữ J, bấm J, thêm) — hướng đi giữ suốt kịch bản
KB = {
    'thuong': ('spear', [(10, 0, 0, '')] + [(6, 1, 1, ''), (30, 0, 0, '')] * 4 + [(10, 0, 0, ''), (50, 1, 1, ''), (40, 0, 0, ''), (1, 0, 0, 'Lc'), (40, 0, 0, '')]),
    'kiem': ('sword', [(10, 0, 0, '')] + [(6, 1, 1, ''), (24, 0, 0, '')] * 3 + [(20, 0, 0, ''), (1, 0, 0, 'Lc'), (40, 0, 0, '')]),
    'bua': ('hammer', [(10, 0, 0, ''), (6, 1, 1, ''), (60, 0, 0, ''), (60, 1, 1, ''), (60, 0, 0, ''), (1, 0, 0, 'Lc'), (40, 0, 0, '')]),
    'phitieu': ('bow', [(10, 0, 0, '')] + [(6, 1, 1, ''), (30, 0, 0, '')] * 2 + [(55, 1, 1, ''), (45, 0, 0, ''), (1, 0, 0, 'Lc'), (40, 0, 0, '')]),
}

DUNG = r'''
([loai]) => {
  if (!window.__Q) { window.__Q = 1; window.requestAnimationFrame = () => 0; }
  G.testSave({ lvl: 12 }); G.save.sound = false;
  G.startStage(0, 0, 0, { kind: 'A', seed: 7 });
  const S = G.getRun(), W = S.W, P = W.P;
  S.fade = 0; S.mode = 'play';
  if (W.ents) W.ents.length = 0; if (W.mobs) W.mobs.length = 0; if (W.projs) W.projs.length = 0;
  W.boss = null;
  for (const w of P.weapons) { w.marks = { fire: 0, poison: 0, ice: 0 }; w.branch = null; }
  P.cur = 0; P.weapons[0].type = loai;
  P.atkT = 0; P.cdT = 0; P.face = 1; P.inv = 0; P.hurtT = 0; P.dodgeT = 0; P.dashT = 0; P.specT = 0; P.castT = 0; P.dead = false;
  P.hp = P.maxhp; P.mana = 999; P.specCd = 0; P.moving = false;
  if (P.mv) { P.mv.holding = false; P.mv.name = ''; P.mv.kind = ''; }
  window.__X0 = (W.x0 + (W.px1 != null ? W.px1 : W.x1)) / 2; window.__Y0 = (W.y0 + W.y1) / 2 + 10;
  P.x = window.__X0; P.y = window.__Y0;
  G.keys = {}; G.keyP = {}; G.pointers.clear();
  for (let i = 0; i < 30; i++) G.tick();
  return [W.x0, W.x1, W.px1];
}
'''

NHIP = r'''
([che, huong, giuJ, bamJ, them]) => {
  const S = G.getRun(), W = S.W, P = W.P;
  G.keys = {}; G.pointers.clear(); G.keyP = {};
  if (che === 'chay') G.keys[huong > 0 ? 'ArrowRight' : 'ArrowLeft'] = true;
  else G.pointers.set(999, { id: 999, role: 'joy', sx: 80, sy: 200, x: 80 + huong * 24 * 0.45, y: 200, stale: false });
  if (giuJ) G.keys.KeyJ = true;
  if (bamJ) G.keyP.KeyJ = true;
  if (them === 'Lc') { P.mana = 999; P.specCd = 0; G.keyP.KeyL = true; }
  // giữ Tí trong phòng: lúc rảnh tay mà sắp chạm tường thì đưa về giữa (không trong lúc đánh)
  const idle = !(P.atkT > 0) && !(P.specT > 0) && !(P.dashT > 0) && !(P.mv && P.mv.holding);
  if (idle && Math.abs(P.x - window.__X0) > 110) { P.x = window.__X0 - huong * 100; }
  if (W.ents) W.ents.length = 0; if (W.mobs) W.mobs.length = 0;
  const keyP = G.keyP;
  G.tick();
  G.keyP = keyP;
  const a = G.heroArgs(P);
  const D = G.spriteCustom.zed['zed-moi'];
  let s = null, E = null;
  try { s = G.zedMoi.chon(Object.assign({}, a), D.tep); } catch (e) { s = null; }
  try { if (s && s.eo) E = G.zedMoi.eoTinh(D, s, Object.assign({}, a)); } catch (e) { E = null; }
  const K = G.cotiTo ? G.cotiTo() : 1;
  const cv = window.__cv || (window.__cv = document.createElement('canvas'));
  const ve = (to, sc, vk) => {
    cv.width = 100 * sc; cv.height = 90 * sc;
    const q = cv.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, cv.width, cv.height);
    q.setTransform(sc, 0, 0, sc, 0, 0); q.imageSmoothingEnabled = false;
    const V = G.spriteCustom.zed['zed-vk'], r0 = V.ready;
    if (!vk) V.ready = false;
    try { G.art.hero(q, Object.assign({}, a, { x: 50, y: 74, noShadow: true, alpha: null, flash: false, to })); } finally { V.ready = r0; }
    return cv.toDataURL('image/png');
  };
  G.scene.draw(); // vẽ thật (đẩy nhịp bước / trạng thái vẽ như trong game)
  const out = { x: P.x, y: P.y, face: P.face, ten: s && s.ten, i: s && s.i, eo: s && s.eo ? s.eo : null, K,
    E: E ? { eA: E.eA, eR: E.eR, yA: E.yA, yR: E.yR, ox: E.ox, oy: E.oy, moi: !!E.moi, dai: !!E.dai, K: !!E.K } : null,
    atk: a.atk, move: !!a.move, mv: P.mv ? P.mv.kind : '', hold: !!(P.mv && P.mv.holding) };
  out.trong = ve(1, 2, false);   // không vũ khí, ×1 (đo)
  out.gif = ve(1, 3, true);      // có vũ khí, ×3 (GIF)
  return out;
}
'''


def anh(d):
    return np.array(Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA'))


def main():
    os.makedirs(OUT, exist_ok=True)
    errs, so = [], {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_timeout(800)
        pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
        pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return false; for (const k of ['zed-moi','zed-vk']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (!q || !q.ready) return false; } return true; }", timeout=60000)
        pg.evaluate(DUNG, ['sword'])
        pg.wait_for_timeout(1000)
        for vk, (loai, ds) in KB.items():
            for che in ('di', 'chay'):
                for huong, hn in ((1, 'phai'), (-1, 'trai')):
                    ten = '%s-%s-%s' % (che, vk, hn)
                    if CHI and ten not in CHI and vk not in CHI:
                        continue
                    pg.evaluate(DUNG, [loai])
                    sl, trong, gif = [], [], []
                    for nhip, giu, bam, them in ds:
                        for j in range(nhip):
                            r = pg.evaluate(NHIP, [che, huong, giu, bam if j == 0 else 0, them if j == 0 else ''])
                            trong.append(anh(r.pop('trong')))
                            gif.append(anh(r.pop('gif')))
                            sl.append(r)
                    so[ten] = sl
                    np.savez_compressed(os.path.join(OUT, ten + '.npz'), trong=np.array(trong), gif=np.array(gif))
                    print(ten, len(sl), 'nhịp', flush=True)
        loi = pg.evaluate('() => G.zedMoi.loi')
        b.close()
    with open(os.path.join(OUT, 'so-lieu.json'), 'w') as f:
        json.dump({'so': so, 'loi_js': errs, 'loi_zed': loi, 'co': CO}, f, ensure_ascii=False)
    print('lỗi trang:', errs[:3], 'lỗi zedMoi:', loi)


if __name__ == '__main__':
    main()
