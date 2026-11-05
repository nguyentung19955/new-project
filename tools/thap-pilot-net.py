#!/usr/bin/env python3
# TURRET MERGE — chân dung phi công RÕ NÉT, KHÔNG MỜ ĐỈNH TÓC (thay tools/thap-pilot-fit.py — bản cũ "kéo dài nền + làm mờ" 32 px phía trên
# đầu → đỉnh tóc mờ mờ, và chỉ 256 px → nhoè trên iPhone DPR3).
# Cách làm: tìm lại ô GỐC của từng phi công trong tấm ChatGPT raw (docs/demo-hop-tuong/thap-art/raw_*.png) bằng so mẫu với ảnh v2/v3 cũ,
# cắt hình VUÔNG ở ĐỘ PHÂN GIẢI GỐC của raw (không phóng), sát mép trên ô (ô cao → lấy cả tóc/mũ mà bản v2 đã cắt mất),
# ảnh đặc 100 % (RGB, không alpha) → thap/assets/pilot_<id>.png; tính lại FACE_BOX (% cạnh ảnh) cho thap/js/khung.js.
# Ảnh vẽ lại của điều phối: docs/demo-hop-tuong/thap-art/raw_pilot_<id>_v3.png (nếu có) → dùng thẳng (cắt vuông phía trên, thu ≤ 3× cỡ CSS lớn nhất).
# Chạy: python3 tools/thap-pilot-net.py   (ghi tools/thap-pilot-nguon.json = vị trí trong raw; lần sau dùng lại, không so mẫu lại)
import os, re, json, glob, sys
import numpy as np, cv2
from PIL import Image
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + '/'
ART = R + 'docs/demo-hop-tuong/thap-art/'
OUT = R + 'thap/assets/'
NG = R + 'tools/thap-pilot-nguon.json'
MAXS = 990  # 3 × 330 px (hero trang ụ) — không bao giờ vượt raw
OV = {'phun': 20, 'cuuvi': 20, 'pandora': 20}  # bản cũ dựng từ v3 với p=20 (xem thap-pilot-fit.py)
ids = re.findall(r"'(\w+)'", open(R + 'thap/js/text.js').read().split('const PILOTS = new Set([')[1].split('])')[0])
kh = open(R + 'thap/js/khung.js').read()
FB = {k: [float(x) for x in v.split(',')] for k, v in re.findall(r"(\w+):\[([\d.,]+)\]", kh.split('const FACE_BOX = {')[1].split('};')[0])}

def mau(i):
    f = ART + f'redo/pilot_{i}_v3.png'
    return (f, 'v3') if i in OV and os.path.exists(f) else (ART + f'redo/pilot_{i}_v2.png', 'v2')

_raw = {}
def raw(s):
    if s not in _raw: _raw[s] = cv2.imread(ART + s)
    return _raw[s]

def tim(i):
    """vị trí ảnh mẫu (v2/v3, 256 px) trong các tấm raw: (tấm, X, Y, S) — điểm u của mẫu ↔ (X + u·S/256, Y + v·S/256)."""
    f, _ = mau(i); t0 = cv2.imread(f)
    best = (-1, None)
    sheets = sorted(os.path.basename(s) for s in glob.glob(ART + 'raw_fp*.png') + glob.glob(ART + 'raw_redo_pilots.png') + glob.glob(ART + 'raw_new_p*.png'))
    for s in sheets:  # thô: mẫu 48 px
        im = raw(s)
        for c in range(240, 900, 14):
            k = 48 / c; sm = cv2.resize(im, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
            t = cv2.resize(t0, (48, 48), interpolation=cv2.INTER_AREA)[6:42, 6:42]
            if min(sm.shape[:2]) < 36: continue
            r = cv2.matchTemplate(sm, t, cv2.TM_CCOEFF_NORMED); _, v, _, l = cv2.minMaxLoc(r)
            if v > best[0]: best = (v, (s, c, (l[0] - 6) / k, (l[1] - 6) / k))
    v, (s, c, x, y) = best
    im = raw(s); b2 = (-1, None)
    for cc in range(c - 16, c + 17):  # tinh: mẫu ở cỡ thật / 2, cửa sổ quanh vị trí thô
        k = 0.5; t = cv2.resize(t0, (round(cc * k), round(cc * k)), interpolation=cv2.INTER_AREA)[4:-4, 4:-4]
        x0, y0 = max(0, int(x - 30)), max(0, int(y - 30)); x1, y1 = min(im.shape[1], int(x + cc + 30)), min(im.shape[0], int(y + cc + 30))
        w = cv2.resize(im[y0:y1, x0:x1], None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
        if w.shape[0] < t.shape[0] or w.shape[1] < t.shape[1]: continue
        r = cv2.matchTemplate(w, t, cv2.TM_CCOEFF_NORMED); _, vv, _, l = cv2.minMaxLoc(r)
        if vv > b2[0]: b2 = (vv, (x0 + (l[0] - 4) / k, y0 + (l[1] - 4) / k, cc * 256 / round(cc * k) * k))
    vv, (X, Y, S) = b2
    return {'raw': s, 'X': round(X, 1), 'Y': round(Y, 1), 'S': round(S, 1), 'khop': round(vv, 3)}

def _seg(prof, minlen=120):
    runs, s0 = [], None
    for i, v in enumerate(prof):
        if not v and s0 is None: s0 = i
        if v and s0 is not None:
            if i - s0 >= minlen: runs.append((s0, i))
            s0 = None
    if s0 is not None and len(prof) - s0 >= minlen: runs.append((s0, len(prof)))
    return runs

def o(im, X, Y, S):
    """ô chứa mẫu: tấm chia bằng rãnh nền (cột/hàng gần như một màu) → ô có tâm mẫu."""
    a = im.astype(np.float32); H, W = a.shape[:2]; cx, cy = X + S / 2, Y + S / 2
    cols = _seg(a.std(axis=(0, 2)) < 16) or [(0, W)]; rows = _seg(a.std(axis=(1, 2)) < 16) or [(0, H)]
    l, r = min(cols, key=lambda c: 0 if c[0] <= cx < c[1] else min(abs(c[0] - cx), abs(c[1] - cx)))
    t, d = min(rows, key=lambda c: 0 if c[0] <= cy < c[1] else min(abs(c[0] - cy), abs(c[1] - cy)))
    return l, t, r, d

def main():
    NGUON = json.load(open(NG)) if os.path.exists(NG) else {}
    moi = {}
    for i in ids:
        v3 = ART + f'raw_pilot_{i}_v3.png'
        if os.path.exists(v3):  # ảnh vẽ lại riêng của điều phối
            im = cv2.imread(v3); H, W = im.shape[:2]; s = int(min(H, W) * 0.8); x0 = (W - s) // 2  # bán thân: bỏ 20 % dưới (chân/bụng), giữ sát mép trên (đủ tóc)
            cr = im[0:s, x0:x0 + s]
            if s > MAXS: cr = cv2.resize(cr, (MAXS, MAXS), interpolation=cv2.INTER_LANCZOS4)
            cv2.imwrite(OUT + f'pilot_{i}.png', cr, [cv2.IMWRITE_PNG_COMPRESSION, 9]); moi[i] = None; print(i, 'v3 riêng', cr.shape[:2]); continue
        if i not in NGUON or os.environ.get('TIMLAI'): NGUON[i] = tim(i); json.dump(NGUON, open(NG, 'w'), indent=0)
        n = NGUON[i]; im = raw(n['raw']); X, Y, S = n['X'], n['Y'], n['S']
        if 'luoi' in n:  # lưới đều không rãnh: ô = đúng 1/c × 1/r tấm
            c, rr, gx, gy = n['luoi']; cw, ch = im.shape[1] / c, im.shape[0] / rr
            l, t, r, d = gx * cw, gy * ch, (gx + 1) * cw, (gy + 1) * ch
        else: l, t, r, d = o(im, X, Y, S)
        m = round(0.022 * (r - l)) + 3 if 'luoi' not in n else round(0.012 * (r - l)) + 3  # bỏ viền khung ô / bo góc
        l, t, r, d = l + m, t + m, r - m, d - m
        s = int(min(r - l, d - t))
        cx = X + S / 2; x0 = int(round(min(max(l, cx - s / 2), r - s))); y0 = int(round(t))
        cr = im[y0:y0 + s, x0:x0 + s]
        if s > MAXS: cr = cv2.resize(cr, (MAXS, MAXS), interpolation=cv2.INTER_LANCZOS4)
        cv2.imwrite(OUT + f'pilot_{i}.png', cr, [cv2.IMWRITE_PNG_COMPRESSION, 9])
        # FACE_BOX: % ảnh cũ (đã "fit": trim 4 + chừa p trên / p/4 hai bên, cắt p/2 dưới) → điểm mẫu → điểm raw → % ảnh mới
        if i in FB:
            p = OV.get(i, 32); sx = p // 4; Wf = 256 + 2 * sx
            fx, fy, fh = FB[i][:3]
            def ve(fx_, fy_):
                ux = (fx_ / 100 * 256 * Wf / 256 - sx) * 248 / 256 + 4; uy = (fy_ / 100 * 256 * Wf / 256 - p) * 248 / 256 + 4
                return X + ux * S / 256, Y + uy * S / 256
            gx, gy = ve(fx, fy); hh = fh / 100 * 256 * Wf / 256 * 248 / 256 * S / 256
            moi[i] = [round((gx - x0) / s * 100, 1), round((gy - y0) / s * 100, 1), round(hh / s * 100, 1)]
        print('%-13s %-20s khớp %.3f  mẫu %dpx → ô %dx%d → %d px (mép trên %+d px so với mẫu)' % (i, n['raw'], n['khop'], S, r - l, d - t, cr.shape[0], Y - y0))
    json.dump(NGUON, open(NG, 'w'), indent=0)
    # ghi FACE_BOX mới (giữ af_*) — CHỈ khi chuyển từ ảnh 'fit' cũ (FB=1); chạy lại trên ảnh đã cắt mới sẽ lệch → mặc định không ghi
    if not os.environ.get('FB'): return
    old = kh.split('const FACE_BOX = {')[1].split('};')[0]
    parts = []
    for k, v in FB.items():
        if k in moi and moi[k]: parts.append('%s:[%s]' % (k, ','.join(('%g' % x) for x in moi[k])))
        elif k in moi: parts.append('%s:[%s]' % (k, ','.join(('%g' % x) for x in v[:3])))  # v3 riêng: chú thích lại bằng tay
        else: parts.append('%s:[%s]' % (k, ','.join(('%g' % x) for x in v)))
    open(R + 'thap/js/khung.js', 'w').write(kh.replace('const FACE_BOX = {' + old + '};', 'const FACE_BOX = {' + ','.join(parts) + '};'))

if __name__ == '__main__': main()
