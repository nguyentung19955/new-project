"""Đòn kiếm nặng Cu Tí (17/10) — ĐO khựng hình + rung bằng bot headless (KHÔNG chơi tay).
Một quái đứng yên (máu rất nhiều, không đánh) trước mặt; bot bấm J đủ 3 nhát; mỗi nhịp G.tick() (1/60 giây) ghi:
đang khựng không (đồng hồ đòn P.atkT đứng yên), độ dời rung (G.fx.shakeOffset), nhát đang ra.
Chạy từ thư mục game:  python3 ../docs/review/ke-hoach-cai-thien/tu-van-17-10-don-kiem/do_dung.py dist/linh-khi.html [cờ url]
"""
import json, os, sys
from playwright.sync_api import sync_playwright
TRANG = os.path.abspath(sys.argv[1]); CO = sys.argv[2] if len(sys.argv) > 2 else ''
URL = 'file://' + TRANG + '?cloud=0' + CO
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..'))
DUNG = r'''
() => {
  if (!window.__Q) { window.__Q = 1; window.requestAnimationFrame = () => 0; }
  G.testSave({ lvl: 12 }); G.save.sound = false;
  G.startStage(0, 0, 0, { kind: 'A', seed: 7 });
  const S = G.getRun(), W = S.W, P = W.P;
  S.fade = 0; S.mode = 'play';
  W.ents.length = 0; if (W.projs) W.projs.length = 0; W.waves = []; W.spawns = []; W.boss = null;
  P.cur = 0; P.weapons[0].type = 'sword'; P.crit = 0;
  P.atkT = 0; P.cdT = 0; P.face = 1; P.inv = 0; P.hp = P.maxhp; P.mana = 999; P.moving = false;
  P.x = (W.x0 + W.x1) / 2 - 20; P.y = (W.y0 + W.y1) / 2 + 10;
  G.keys = {}; G.keyP = {}; G.pointers.clear();
  for (let i = 0; i < 40; i++) G.tick();
  const e = G.spawnEnemy('rusher', P.x + 22, P.y);
  e.inside = true; e.speed = 0; e.cd = 99; e.hp = e.maxhp = 1e7; e.armor = 0; e.spawnT = 0;
  window.__e = e;
  return { kn: G.zedMoi.kiemNang(P) };
}
'''
NHIP = r'''
([bam]) => {
  const S = G.getRun(), W = S.W, P = W.P, e = window.__e;
  G.keys = {}; G.pointers.clear(); G.keyP = {};
  if (bam) { G.keys.KeyJ = true; G.keyP.KeyJ = true; }
  e.speed = 0; e.cd = 99; e.wind = 0; e.x = P.x + 22; e.y = P.y; e.hp = e.maxhp; P.crit = 0;
  const a0 = P.atkT, hp0 = e.hp;
  const keyP = G.keyP; G.tick(); G.keyP = keyP; G.keys = {};
  const o = G.fx.shakeOffset();
  return { a0, a1: P.atkT, buoc: P.mv && P.mv.step, ten: P.mv && P.mv.name, trung: e.hp < hp0, sx: o.x, sy: o.y };
}
'''
KB = [(1, 1), (23, 0)] * 2 + [(1, 1), (45, 0)]
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 960, 'height': 540})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(800)
    pg.add_script_tag(path=os.path.join(GOC, 'game', 'tests', 'setup.js'))
    pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return false; const q = z['zed-moi']; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh('zed-moi'); return q && q.ready; }", timeout=90000)
    st = pg.evaluate(DUNG)
    ds = []
    for n, bam in KB:
        for j in range(n):
            ds.append(pg.evaluate(NHIP, [bam if j == 0 else 0]))
    b.close()
# khựng = nhịp đồng hồ đòn không chạy khi đang đánh
kq = []; i = 0
while i < len(ds):
    d = ds[i]
    if d['a0'] > 0 and abs(d['a1'] - d['a0']) < 1e-9:
        j = i
        while j < len(ds) and ds[j]['a0'] > 0 and abs(ds[j]['a1'] - ds[j]['a0']) < 1e-9: j += 1
        rung = [(x['sx'], x['sy']) for x in ds[i - 1:j + 8]]
        kq.append({'nhat': d['buoc'] + 1, 'ten': d['ten'], 'khung_dung': j - i, 'ms': round((j - i) * 1000 / 60)})
        i = j
    else: i += 1
# rung lớn nhất + số nhịp có rung quanh mỗi lần trúng
rung = []
for k, d in enumerate(ds):
    if d['trung']:
        seg = ds[k:k + 14]
        mx = max(max(abs(x['sx']), abs(x['sy'])) for x in seg)
        n = sum(1 for x in seg if x['sx'] or x['sy'])
        rung.append({'nhat': d['buoc'] + 1, 'max_px': mx, 'nhip_rung': n, 'ms_rung': round(n * 1000 / 60)})
# số nhịp đồng hồ đòn CHẠY (không tính nhịp khựng) mỗi nhát = thời lượng logic (×1/60 giây)
chay = {}
for d in ds:
    if d['a0'] > 0 and d['a1'] < d['a0'] - 1e-9: chay[d['buoc'] + 1] = chay.get(d['buoc'] + 1, 0) + 1
out = {'nhip_dong_ho_don': chay, 'co': CO, 'kiem_nang': st, 'khung_dung': kq, 'rung': rung, 'loi': errs}
print(json.dumps(out, ensure_ascii=False))
