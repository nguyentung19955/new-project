#!/usr/bin/env python3
"""Rà soát em bé TRONG GAME (bản hai tệp như web): 4 em bé x 4 thân (gốc, rung, bien, lau) x mọi trạng thái x hướng trái/phải,
vẽ bằng chính G.art.hero, đo bằng số:
  - so trái/phải: hình quay trái lật lại phải trùng hình quay phải (đếm điểm ảnh lệch);
  - mỗi trạng thái: đáy chân, đỉnh đầu, tâm đầu của THÂN (vẽ trần, không đồ, không vũ khí) -> nhảy vị trí giữa khung liền nhau / giữa trạng thái;
  - đồ mặc (mũ, lưng, tay, cánh): vẽ có món trừ vẽ không món = điểm ảnh của món; đo vị trí món so với đầu từng khung (đồ trôi khỏi thân,
    giật), mũ đè mắt (mép dưới mũ dưới dòng mắt), món lơ lửng xa thân;
  - vũ khí: vẽ có vũ khí trừ không vũ khí = điểm ảnh vũ khí; khoảng cách từ vũ khí tới thân (rời tay), vũ khí đè mặt (vùng mắt).
Ra: <thư mục>/em-be-so.json (+ in bảng bất thường), ảnh tiếp xúc <thư mục>/em-be-<key>-<thân>.png.
Chạy: python3 em_be.py <url linh-khi-nhe.html?cloud=0> <thư mục ra> [JS đặt cờ trước]"""
import os, sys, json, base64, io
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8790/linh-khi-nhe.html?cloud=0'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'em-be-ra'
CO = sys.argv[3] if len(sys.argv) > 3 else ''
os.makedirs(OUT, exist_ok=True)
KEYS = os.environ.get('KEYS', 'smith,hunter,healer,wrestler').split(',')
BO = {'': None, 'rung': 'ao_vo_cay', 'bien': 'ao_vay', 'lau': 'ao_long'}
CW, CH, X0, Y0 = 112, 84, 56, 70


def trang_thai():
    """Danh sách (nhóm, nhãn, o-phần, p-phần). t = 0.31 trừ khi ghi."""
    L = []
    for i in range(6): L.append(('idle', 'đứng %d' % i, {'t': i / 6 + 0.02}, None))
    for i in range(8): L.append(('move', 'chạy %d' % i, {'move': True, 't': 0.3, 'tc': i * 0.65 / 8 + 0.01}, None))
    for i in range(8): L.append(('dodge', 'lộn %d' % i, {'dodge': i / 8 + 0.03}, None))
    for k in range(3):
        for u in (0.05, 0.3, 0.5, 0.8):
            L.append(('atk_sword', 'kiếm n%d u%.2f' % (k + 1, u), {'atk': u, 'wt': 'sword'}, {'comboI': k}))
    for wt in ('bow', 'spear', 'hammer'):
        for u in (0.05, 0.2, 0.35, 0.5, 0.65, 0.85):
            L.append(('atk_' + wt, '%s u%.2f' % (wt, u), {'atk': u, 'wt': wt}, {'comboI': 0}))
    for wt in ('sword', 'bow', 'spear', 'hammer'):
        for ch in (0.1, 0.6, 1.0):
            L.append(('hold_' + wt, 'giữ %s %.1f' % (wt, ch), {'wt': wt}, {'mv': {'holding': True, 'charge': ch, 'kind': 'thuong'}}))
    for wt in ('sword', 'spear'):
        for s in (0.33, 0.22, 0.12, 0.03):
            L.append(('spec_' + wt, 'chiêu %s %.2f' % (wt, s), {'wt': wt}, {'specT': s}))
    for s in (0.38, 0.28, 0.18, 0.06):
        L.append(('cast', 'chưởng %.2f' % s, {'wt': 'sword'}, {'castT': s}))
    for s in (0.19, 0.12, 0.05):
        L.append(('hurt', 'trúng %.2f' % s, {}, {'hurtT': s}))
    for s in (0.02, 0.1, 0.2, 0.3, 0.45, 0.58):
        L.append(('die', 'chết %.2f' % s, {}, {'dead': True, 'deadT': s}))
    L.append(('move_atk', 'chạy+chém', {'move': True, 'atk': 0.5, 'wt': 'sword', 'tc': 0.2}, {'comboI': 0}))
    return L


JS = r"""
async ([key, robe, states, extra, CW, CH, X0, Y0, mode]) => {
  // mode: 'than' (thân trần, không vũ khí), 'vk' (có vũ khí), 'do:<slot>:<look>' (thêm một món, không vũ khí), 'du' (đủ đồ + vũ khí)
  const cols = states.length, cv = document.createElement('canvas'); cv.width = CW * cols; cv.height = CH * 2;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const sm = document.createElement('canvas'); sm.width = CW; sm.height = CH; const s = sm.getContext('2d');
  const VK = (wt) => ({ type: wt || 'sword', family: 0, tier: 0, rarity: 0, stage: 0 });
  states.forEach((st, j) => {
    for (let f = 0; f < 2; f++) {
      const face = f ? -1 : 1;
      s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, CW, CH);
      const of = { hat: null, robe: robe, back: null, hand: null, mask: null, wing: null };
      if (mode.indexOf('do:') === 0) { const q = mode.split(':'); if (q[1] === 'wing') of.wing = { kind: q[2], level: +q[3] }; else of[q[1]] = q[2]; }
      if (mode === 'du') Object.assign(of, extra);
      if (G.outfit && G.outfit.fxThanBo) of.fx = Object.assign({ els: [] }, G.outfit.fxThanBo(of));
      if (of.fx) { of.fx.els = []; of.fx.aura = null; of.fx.glow = null; }
      const o0 = st[2], p0 = st[3];
      const vk = VK(o0.wt || 'sword'); // mọi chế độ cầm vũ khí (để thân chọn đúng hàng đòn); chế độ không phải 'vk'/'du' chỉ vẽ lớp thân + đồ (fr.cv), bỏ vũ khí
      const p = p0 ? Object.assign({ outfit: of, mv: null, comboI: 0 }, JSON.parse(JSON.stringify(p0))) : null;
      if (p && !p.mv) p.mv = null;
      const o = Object.assign({ x: X0, y: Y0, face, key, move: false, t: 0.31, atk: -1, dodge: -1, weapon: vk, helm: null, armor: null, outfit: of, noShadow: true, p: p }, o0);
      delete o.wt;
      try {
        if (mode === 'vk' || mode === 'du') G.art.hero(s, o);
        else { // cầm vũ khí (thân chọn đúng hàng đòn) nhưng không vẽ hình vũ khí
          const WA = G.weaponArt, d0 = WA.draw; WA.draw = () => {};
          try { G.art.hero(s, o); } finally { WA.draw = d0; }
        }
      } catch (e) { s.fillStyle = 'red'; s.fillRect(0, 0, 6, 6); console.error(e); }
      c.drawImage(sm, j * CW, f * CH);
    }
  });
  return cv.toDataURL('image/png');
}
"""

DIEM = r"""
(key) => { const SC = G.spriteCustom, r = {};
  for (const [d, n] of [['idle', 6], ['move', 8], ['atk', 6], ['hit', 4], ['die', 8], ['ne', 6]]) for (let i = 0; i < n; i++) { try { const q = SC.diemNhanVat(key, d, i); if (q) r[d + ':' + i] = q.diem; } catch (e) {} }
  return r; }
"""


def anh(d):
    return np.array(Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA'))


def tach(a, n):
    """a: tấm (CH*2, CW*n) -> list[(phải, trái-lật)] mảng alpha bool."""
    r = []
    for j in range(n):
        R = a[0:CH, j * CW:(j + 1) * CW]
        Lf = a[CH:2 * CH, j * CW:(j + 1) * CW]
        # hero dịch +1 khi quay trái rồi lật: lật lại quanh X0 + 0.5
        Lm = np.zeros_like(Lf)
        Lm[:, 1:] = Lf[:, ::-1][:, :-1]  # cột c của hình phải <-> cột 2*X0 - c của hình trái
        r.append((R, Lm, Lf))
    return r


def bb(m):
    ys, xs = np.nonzero(m)
    if not len(ys): return None
    return dict(x0=int(xs.min()) - X0, x1=int(xs.max()) + 1 - X0, y0=int(ys.min()) - Y0, y1=int(ys.max()) + 1 - Y0,
                cx=round(float(xs.mean()) - X0 + 0.5, 2), cy=round(float(ys.mean()) - Y0 + 0.5, 2), n=int(len(ys)))


def main():
    errs = []
    ST = trang_thai()
    ket = {}
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None)
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function("window.G && G.art && G.art.hero && G.spriteCustom && G.spriteCustom.ds && G.spriteCustom.ds['em-be-smith']", timeout=120000)
        # ép tải mọi thân + đồ (bản ảnh rời tải theo nhu cầu)
        pg.evaluate("() => { const SC = G.spriteCustom; for (const m in SC.ds) SC.canAnh(m); for (const m in SC.do) SC.canAnh(m); }")
        pg.wait_for_function("() => { const SC = G.spriteCustom; return Object.keys(SC.ds).filter(m => /^em-be/.test(m)).every(m => SC.ds[m].ready && (!/^em-be-(smith|hunter|healer|wrestler)$/.test(m) || SC.ds[m].donMa)) && Object.keys(SC.do).every(m => SC.do[m].ready !== false); }", timeout=180000)
        pg.wait_for_timeout(800)
        if CO:
            pg.evaluate(CO); pg.wait_for_timeout(200)
        looks = pg.evaluate("() => { const L = G.heroLooks, I = G.outfit.ITEMS, r = {}; for (const id in I) { const it = I[id]; if (['hat','back','hand','wing'].includes(it.slot)) (r[it.slot] = r[it.slot] || []).push(it.look); } return r; }")
        lab = [[s[0], s[1], s[2], s[3]] for s in ST]
        for key in KEYS:
            diem = pg.evaluate(DIEM, key)
            for bo, robe in BO.items():
                ten = key + ('-' + bo if bo else '')
                rec = {'diem': diem if not bo else None}
                A = {}
                for mode in ['than', 'vk']:
                    A[mode] = tach(anh(pg.evaluate(JS, [key, robe, lab, {}, CW, CH, X0, Y0, mode])), len(ST))
                # đồ: mỗi món lẻ (chỉ thân gốc: đủ mọi món; thân bộ: 1 món mỗi ô)
                do = {}
                for slot in ('hat', 'back', 'hand', 'wing'):
                    ls = sorted(set(looks.get(slot, [])))
                    if bo: ls = ls[:2]
                    for lk in ls:
                        lvs = (1, 2, 3) if slot == 'wing' else (0,)
                        for lv in lvs:
                            mode = 'do:%s:%s:%d' % (slot, lk, lv)
                            do[mode] = tach(anh(pg.evaluate(JS, [key, robe, lab, {}, CW, CH, X0, Y0, mode])), len(ST))
                # đo
                rows = []
                A0 = A['than'][0][0][:, :, 3] > 60
                ys0 = np.nonzero(A0)[0]; y00 = ys0.min(); h0 = Y0 - y00
                def doi(B, r0, r1):
                    best, bx, by = -1, 0, 0
                    for dy in range(-10, 11):
                        for dx in range(-10, 11):
                            Bs = np.zeros_like(B)
                            ys_, ye_ = max(0, -dy), min(CH, CH - dy); xs_, xe_ = max(0, -dx), min(CW, CW - dx)
                            Bs[ys_:ye_, xs_:xe_] = B[ys_ + dy:ye_ + dy, xs_ + dx:xe_ + dx]
                            sc = (A0[r0:r1] & Bs[r0:r1]).sum() / max(1, (A0[r0:r1] | Bs[r0:r1]).sum()) - 0.002 * (abs(dx) + abs(dy))
                            if sc > best: best, bx, by = sc, dx, dy
                    return [bx, by, round(float(best), 2)]
                for j, s in enumerate(ST):
                    th = A['than'][j]; vk = A['vk'][j]
                    mR = th[0][:, :, 3] > 60; mL = th[1][:, :, 3] > 60
                    vR = vk[0][:, :, 3] > 60; vL = vk[1][:, :, 3] > 60
                    r = {'nhom': s[0], 'nhan': s[1], 'than': bb(mR), 'lr_than': int((mR ^ mL).sum()), 'lr_vk': int((vR ^ vL).sum())}
                    wpx = vR & ~mR
                    r['vk'] = bb(wpx)
                    if s[0] not in ('die', 'dodge') and mR.any():
                        r['dau'] = doi(mR, int(y00) - 2, int(y00 + 0.44 * h0))
                        r['minh'] = doi(mR, int(y00 + 0.5 * h0), int(y00 + 0.85 * h0))
                    if wpx.any() and mR.any():
                        from scipy import ndimage
                        dt = ndimage.distance_transform_edt(~mR)
                        r['vk_cach'] = round(float(dt[wpx].min()), 1)
                        # vũ khí che trên thân: điểm ảnh thân mà màu khác đi khi có vũ khí (vũ khí vẽ trước thân)
                        diff = (np.abs(vk[0][:, :, :3].astype(int) - th[0][:, :, :3].astype(int)).sum(2) > 30) & mR
                        r['vk_de'] = int(diff.sum())
                        # vùng đầu: 40% trên của thân
                        tb = r['than']; hy = Y0 + tb['y0'] + int(0.42 * (tb['y1'] - tb['y0']))
                        r['vk_de_dau'] = int(diff[:hy].sum())
                    dd = {}
                    for mode, arr in do.items():
                        x = arr[j]; dR = x[0][:, :, 3] > 60; dL = x[1][:, :, 3] > 60
                        item = dR & ~mR
                        de = (np.abs(x[0][:, :, :3].astype(int) - th[0][:, :, :3].astype(int)).sum(2) > 30) & mR
                        q = bb(item | de)
                        if q:
                            q['lr'] = int((dR ^ dL).sum()); q['de'] = int(de.sum())
                            tb = r['than']
                            if tb:
                                hy = Y0 + tb['y0'] + int(0.42 * (tb['y1'] - tb['y0']))
                                q['de_dau'] = int(de[:hy].sum())
                        dd[mode] = q
                    r['do'] = dd
                    rows.append(r)
                rec['rows'] = rows
                ket[ten] = rec
                # ảnh tiếp xúc: hàng 1 thân trần phải, hàng 2 có vũ khí phải, hàng 3 vũ khí trái (đã lật lại), hàng 4 đủ đồ
                du = anh(pg.evaluate(JS, [key, robe, lab, {'hat': 'non_la', 'back': 'ho_lo', 'hand': 'bua_hut', 'wing': {'kind': 'chuon', 'level': 2}}, CW, CH, X0, Y0, 'du']))
                n = len(ST); Z = 2
                can = Image.new('RGBA', (n * CW, 4 * CH), (74, 107, 60, 255))
                for j in range(n):
                    for q, im in enumerate([A['than'][j][0], A['vk'][j][0], A['vk'][j][2], du[0:CH, j * CW:(j + 1) * CW]]):
                        t = Image.new('RGBA', (CW, CH), (74, 107, 60, 255) if (j + q) % 2 else (84, 117, 70, 255))
                        t.alpha_composite(Image.fromarray(im))
                        can.paste(t, (j * CW, q * CH))
                # cắt bớt lề cho nhẹ: mỗi ô giữ 64x56 quanh chân
                can = can.resize((can.width * Z, can.height * Z), Image.NEAREST)
                can.convert('RGB').save(os.path.join(OUT, 'em-be-%s.png' % ten), optimize=True)
                print(ten, 'xong', flush=True)
        b.close()
    json.dump({'states': [[s[0], s[1]] for s in ST], 'ket': ket, 'pageerror': errs}, open(os.path.join(OUT, 'em-be-so.json'), 'w'), ensure_ascii=False)
    print('pageerror:', errs[:5] if errs else 'không có')


if __name__ == '__main__':
    main()
