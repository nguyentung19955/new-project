"""ĐO TƯƠNG PHẢN Cu Tí / quái với nền ở 480×270 (tư vấn 17/10 mục 2.1). KHÔNG chơi thử: dựng cảnh bằng lệnh (bot), chụp canvas thế giới.
Mỗi vùng (Rừng già, Hang biển, Lâu đài cổ, Sông sâu): ải 1, phòng đầu, Cu Tí giữa phòng, 5 quái thường của vùng (5 vai) mọc quanh.
Chụp 3 lần cùng khung hình: đủ cả / chỉ nền (giấu Cu Tí và quái) → điểm ảnh khác nhau = hình nhân vật. Thu về 480×270 (1 điểm game = 1 điểm).
Số đo mỗi nhân vật (độ sáng L = 0,299R + 0,587G + 0,114B):
  dL   = |L trung bình thân − L trung bình nền ngay sau thân| (cùng chỗ, ảnh chỉ nền)
  vien = % điểm viền ngoài thân có |L thân − L nền kề| ≥ 30 (viền dễ đọc)
  nenSd = độ lệch chuẩn L của nền trong hộp quanh nhân vật (nền càng rối càng cao)
Chạy từ gốc repo:  python3 docs/review/ke-hoach-cai-thien/tu-van-17-10-nen-song/cong-cu/do-tuong-phan.py <trang html> <thư mục ra> [cờ, vd '&sanmoi=0']
Ra: <thư mục ra>/vung-<r>.png (480×270), <thư mục ra>/do.json
"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
TRANG = os.path.abspath(sys.argv[1]); RA = os.path.abspath(sys.argv[2]); CO = sys.argv[3] if len(sys.argv) > 3 else ''
os.makedirs(RA, exist_ok=True)
TEN = ['Rừng già', 'Hang biển', 'Lâu đài cổ', 'Sông sâu']

DUNG = r'''
([r]) => {
  if (!window.__Q) { window.__Q = 1; window.requestAnimationFrame = () => 0; }
  G.testSave({ lvl: 12 }); G.save.sound = false;
  G.startStage(r, 0, 0, { kind: 'A', seed: 7 });
  const S = G.getRun(), W = S.W, P = W.P;
  S.fade = 0; S.mode = 'play';
  if (W.ents) W.ents.length = 0; if (W.mobs) W.mobs.length = 0; if (W.projs) W.projs.length = 0; W.spawns.length = 0;
  W.boss = null;
  P.face = 1; P.hp = P.maxhp; P.inv = 0; P.moving = false;
  const cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2 + 6;
  P.x = cx; P.y = cy;
  const roles = ['rusher', 'shield', 'archer', 'nimble', 'spiky'];
  const vt = [[-70, -22], [70, -22], [-92, 26], [92, 26], [0, -48]];
  roles.forEach((role, j) => W.spawns.push({ role, x: cx + vt[j][0], y: cy + vt[j][1], t: 0.01, t0: 0.01, big: false }));
  G.keys = {}; G.keyP = {}; G.pointers.clear();
  for (let i = 0; i < 70; i++) G.tick();
  const ds = [];
  W.ents.forEach((e, j) => { if (j < vt.length) { e.x = cx + vt[j][0]; e.y = cy + vt[j][1]; } e.vx = 0; e.vy = 0; e.wind = 0; e.atkT = 0; ds.push({ art: e.art || e.role, x: e.x, y: e.y }); });
  P.x = cx; P.y = cy; P.hurtT = 0; P.dodgeT = 0; P.atkT = 0;
  window.__ents = W.ents.slice(); window.__P = { x: P.x, y: P.y };
  return ds;
}
'''
CHUP = r'''
([an]) => {
  const S = G.getRun(), W = S.W, P = W.P;
  if (W.spawns) W.spawns.length = 0;
  W.ents.length = 0; if (!an) for (const e of window.__ents) W.ents.push(e);
  P.x = an ? -9999 : window.__P.x; P.y = an ? -9999 : window.__P.y; P.inv = 0; P.hurtT = 0; P.dodgeT = 0; if (P.blink) P.blink = 0;
  G.scene.draw();
  const wc = document.getElementById('world');
  const c = document.createElement('canvas'); c.width = 480; c.height = 270;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const k = wc.width / G.W, cam = (W.cam || 0);
  x.drawImage(wc, 0, 0, wc.width, wc.height, 0, 0, Math.round(wc.width / k), Math.round(wc.height / k));
  return { url: c.toDataURL('image/png'), cam, k };
}
'''

def anh(u):
    return np.asarray(Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB')).astype(float)

def L(a):
    return 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]

def nhan(mask):
    """Tách các mảng điểm (4 hướng) — trả danh sách mảng (y, x)."""
    from collections import deque
    h, w = mask.shape; seen = np.zeros_like(mask); out = []
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = 1; pts = []
                while q:
                    a, b = q.popleft(); pts.append((a, b))
                    for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        c, d = a + da, b + db
                        if 0 <= c < h and 0 <= d < w and mask[c, d] and not seen[c, d]:
                            seen[c, d] = 1; q.append((c, d))
                out.append(pts)
    return out

errs = []
ket = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 960, 'height': 540})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    pg.goto('file://' + TRANG + '?cloud=0' + CO)
    pg.wait_for_timeout(2500)
    pg.add_script_tag(path=os.path.join(GOC, 'game', 'tests', 'setup.js'))
    for r in range(4):
        ds = pg.evaluate(DUNG, [r])
        pg.wait_for_timeout(1500)  # ảnh vùng tải sau
        ds = pg.evaluate(DUNG, [r])
        du = pg.evaluate(CHUP, [False]); nen = pg.evaluate(CHUP, [True])
        A, N = anh(du['url']), anh(nen['url'])
        Image.fromarray(A.astype(np.uint8)).save(os.path.join(RA, 'vung-%d.png' % r))
        Image.fromarray(N.astype(np.uint8)).save(os.path.join(RA, 'vung-%d-nen.png' % r))
        LA, LN = L(A), L(N)
        khac = np.abs(A - N).sum(-1) > 24
        # bỏ dải HUD trên / dưới (thế giới vẽ không có HUD — vẫn chặn 0..8 cho chắc)
        manh = [m for m in nhan(khac) if len(m) >= 40]
        do = []
        for m in manh:
            ys = np.array([q[0] for q in m]); xs = np.array([q[1] for q in m])
            mm = np.zeros_like(khac); mm[ys, xs] = True
            dl = abs(LA[mm].mean() - LN[mm].mean())
            # viền ngoài: điểm của thân có ít nhất một hàng xóm không thuộc thân
            pad = np.pad(mm, 1)
            trong = pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]
            vien = mm & ~trong
            vy, vx = np.nonzero(vien)
            ok = 0
            for y, x in zip(vy, vx):
                lan = [LN[y + a, x + c] for a, c in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= y + a < 270 and 0 <= x + c < 480 and not mm[y + a, x + c]]
                if lan and abs(LA[y, x] - np.mean(lan)) >= 30: ok += 1
            y0, y1, x0, x1 = max(0, ys.min() - 8), min(270, ys.max() + 9), max(0, xs.min() - 8), min(480, xs.max() + 9)
            hop = LN[y0:y1, x0:x1]
            do.append({'x': int(xs.mean()), 'y': int(ys.mean()), 'n': len(m), 'Lthan': round(float(LA[mm].mean()), 1), 'Lnen': round(float(LN[mm].mean()), 1),
                       'dL': round(float(dl), 1), 'vien': round(100.0 * ok / max(1, len(vy)), 1), 'nenSd': round(float(hop.std()), 1)})
        # Cu Tí = mảng gần chỗ P nhất (toạ độ màn = thế giới − cam)
        ket[TEN[r]] = {'quai': ds, 'manh': sorted(do, key=lambda d: d['x']), 'nenSdPhong': round(float(LN[30:240, 40:440].std()), 1)}
    b.close()
json.dump({'co': CO, 'loi': errs[:20], 'ket': ket}, open(os.path.join(RA, 'do.json'), 'w'), ensure_ascii=False, indent=1)
print('lỗi JS:', len(errs), errs[:3])
for k, v in ket.items():
    print(k, 'nền sd', v['nenSdPhong'], [(d['x'], d['y'], d['dL'], d['vien']) for d in v['manh']])
