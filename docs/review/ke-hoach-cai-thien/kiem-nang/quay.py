"""KIẾM NẶNG — quay headless combo kiếm 1 → 2 → 3 (17/10). KHÔNG chơi thử bằng tay: bot bấm J theo kịch bản cố định (như
kiem-bot-cung/quay.py), nhịp logic 60/giây (G.tick), Cu Tí đứng yên quay phải. Mỗi nhịp lấy:
  - hình Cu Tí riêng (hàm vẽ thật G.art.hero, ×3, nền trong) → GIF TRƯỚC/SAU sạch;
  - một khung cắt từ CANVAS THẾ GIỚI quanh Cu Tí (có vệt chém / hiệu ứng thật đang vẽ trong trận) → GIF combo có vệt.
Chạy từ gốc repo sau khi build:
  python3 docs/review/ke-hoach-cai-thien/kiem-nang/quay.py <trang html> <tệp ra .npz> [cờ url, vd '&kiemnang=0'] [--mot-cap]
Ra .npz: a<cấp> (Cu Tí riêng), m<cấp> (khung màn), so (json từng nhịp: hàng, khung, u, góc, mũi so với đất, lỗi trang).
"""
import base64, io, json, os, sys
import numpy as np
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'kiem-bot-cung'))
TRANG = os.path.abspath(sys.argv[1])
RA = os.path.abspath(sys.argv[2])
CO = sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].startswith('--') else ''
CAP = (0,) if '--mot-cap' in sys.argv else (0, 3)
URL = 'file://' + TRANG + '?cloud=0' + CO
KB = [(10, 0)] + [(1, 1), (23, 0)] * 2 + [(1, 1), (40, 0)] + [(12, 0)]  # (số nhịp, bấm J ở nhịp đầu): nhát 3 dài 0,46 s
src = open(os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'kiem-bot-cung', 'quay.py'), encoding='utf-8').read()
DUNG = src.split("DUNG = r'''", 1)[1].split("'''", 1)[0]
NHIP = r'''
([bam]) => {
  const S = G.getRun(), W = S.W, P = W.P;
  G.keys = {}; G.pointers.clear(); G.keyP = {};
  if (bam) { G.keys.KeyJ = true; G.keyP.KeyJ = true; }
  if (W.ents) W.ents.length = 0; if (W.mobs) W.mobs.length = 0;
  const keyP = G.keyP; G.tick(); G.keyP = keyP; G.keys = {};
  const a = G.heroArgs(P), D = G.spriteCustom.zed['zed-moi'];
  let s = null; try { s = G.zedMoi.chon(Object.assign({}, a), D.tep); } catch (e) { s = null; }
  G.scene.draw();
  const q = G.tinhLinh && G.tinhLinh.tip ? G.tinhLinh.tip(G.heroArgs(P)) : null;
  // khung màn quanh Cu Tí (canvas thế giới ×2): 140 × 90 điểm game, chân ở (50, 72)
  const wc = document.getElementById('world'), cam = W.cam || 0, k = wc.width / G.W;
  const mc = window.__mc || (window.__mc = document.createElement('canvas'));
  mc.width = 140 * k; mc.height = 90 * k;
  const m = mc.getContext('2d'); m.imageSmoothingEnabled = false; m.clearRect(0, 0, mc.width, mc.height);
  m.drawImage(wc, Math.round((P.x - cam - 50) * k), Math.round((P.y - 72) * k), mc.width, mc.height, 0, 0, mc.width, mc.height);
  const cv = window.__cv || (window.__cv = document.createElement('canvas'));
  const sc = 3; cv.width = 120 * sc; cv.height = 90 * sc;
  const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  c.setTransform(sc, 0, 0, sc, 0, 0); c.imageSmoothingEnabled = false;
  G.art.hero(c, Object.assign({}, a, { x: 50, y: 70, noShadow: true, alpha: null, flash: false, to: 1 }));
  let goc = null, mui = null;
  if (q && q.anim === 'atk') { goc = Math.atan2(q.dy, q.dx) * 180 / Math.PI; const l = q.L * Math.hypot(q.dx, q.dy); mui = (q.gy + q.dy / Math.hypot(q.dx, q.dy) * l) - P.y; }
  const kn = G.zedMoi.kiemNang ? G.zedMoi.kiemNang(P) : null;
  return { ten: s && s.ten, i: s && s.i, u: a.atk, combo: P.comboI, goc, mui, kn, png: cv.toDataURL('image/png'), man: mc.toDataURL('image/png') };
}
'''


def png(s):
    return np.array(Image.open(io.BytesIO(base64.b64decode(s.split(',')[1]))).convert('RGBA'))


def main():
    errs, so, anh, man = [], {}, {}, {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_timeout(800)
        pg.add_script_tag(path=os.path.join(GOC, 'game', 'tests', 'setup.js'))
        pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return false; for (const k of ['zed-moi','zed-vk']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (!q || !q.ready) return false; } return true; }", timeout=90000)
        pg.wait_for_function("() => !G.fxAnh || ['hu-chem-kiem','hu-chem-kiem-nang-1','hu-chem-kiem-nang-2','hu-chem-kiem-nang-3','hu-chem-kiem-nang-4'].every(m => !G.fxAnh.ds[m] || G.fxAnh.co(m))", timeout=60000)
        for cap in CAP:
            pg.evaluate("() => { let x = 12345; Math.random = () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }; }")  # cố định ngẫu nhiên (so TRƯỚC / ?kiemnang=0)
            st = pg.evaluate(DUNG, [cap])
            for _ in range(30):  # bản to Cu Tí tải lười: vẽ vài lần cho tải xong
                pg.evaluate(NHIP, [0]); pg.wait_for_timeout(30)
            ds, im, mn = [], [], []
            for n, bam in KB:
                for j in range(n):
                    r = pg.evaluate(NHIP, [bam if j == 0 else 0])
                    im.append(png(r.pop('png'))); mn.append(png(r.pop('man')))
                    ds.append(r)
            so[cap] = {'stage': st, 'nhip': ds}
            anh[cap] = np.array(im); man[cap] = np.array(mn)
            print('cấp', cap + 1, 'stage', st, len(ds), 'nhịp', flush=True)
        loi = pg.evaluate('() => (G.zedMoi && G.zedMoi.loi) || []')
        b.close()
    kw = {}
    for cap in CAP:
        kw['a%d' % cap] = anh[cap]; kw['m%d' % cap] = man[cap]
    np.savez_compressed(RA, so=json.dumps({'so': so, 'loi_trang': errs, 'loi_zed': loi, 'co': CO}), **kw)
    print('lỗi trang:', errs[:3], 'lỗi zedMoi:', loi)


if __name__ == '__main__':
    main()
