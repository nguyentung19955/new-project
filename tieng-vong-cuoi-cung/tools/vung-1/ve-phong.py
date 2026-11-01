# -*- coding: utf-8 -*-
"""Nướng sẵn ảnh cảnh cho từng phòng Vùng 1 (theo phong cách phòng demo đã duyệt – tools/phong-demo/tokien.py).

Chạy:  python3 tools/vung-1/ve-phong.py            (mọi phòng)
       python3 tools/vung-1/ve-phong.py P03 P06    (vài phòng)

Đọc  game/vung-1/phong/P*.json  →  ghi  art/vung-1/<ID>-canh.png   (đá + dây leo + sàn mỏng + đồ trang trí, 16 điểm/ô)
                                        art/vung-1/<ID>-truoc.png  (tiền cảnh: bóng rễ gần như đen)
                                        art/vung-1/<ID>-manh.png   (mảnh ghép tường nứt N / tường giả G)
                                        art/vung-1/<ID>-canh.json  (đèn đã đặt, vị trí mảnh ghép)
Nguyên tắc (người dùng yêu cầu):
  - đá tô liền theo điểm ảnh, chìm dần vào bóng tối, mép méo tự nhiên – KHÔNG khối vuông, KHÔNG viền thẳng;
  - mép nhìn thấy luôn trùm RA NGOÀI ô va chạm (không bao giờ khoét vào ô '#') – bám tường không "bám vào không khí";
  - mặt sàn giữ phẳng đúng chỗ chân đứng; không có mảnh đá lơ lửng; đồ treo/đặt chỉ đặt ở chỗ có mép đá thật.
Không sửa tools/phong-demo/* – chỉ đọc ảnh ở đó.
"""
import json, os, sys, glob, hashlib, random
import numpy as np
from PIL import Image
from scipy import ndimage

GOC = os.path.dirname(os.path.abspath(__file__))
DU_AN = os.path.normpath(os.path.join(GOC, '../..'))
DEMO = os.path.join(DU_AN, 'tools/phong-demo/')
PHONG = os.path.join(DU_AN, 'game/vung-1/phong/')
OUT = os.path.join(DU_AN, 'art/vung-1/')
T = 16          # điểm ảnh cảnh / ô (ô logic 48 px = 16 điểm × 3)
PAD = 4         # đệm đá quanh phòng (ô) để mép phòng cũng méo tự nhiên
TRAN_MEP = 7    # mép đá được trùm ra ngoài ô va chạm tối đa bao nhiêu điểm

_cache = {}
def ld(n):
    if n not in _cache: _cache[n] = Image.open(os.path.join(DEMO, n + '.png')).convert('RGBA')
    return _cache[n]
def dim(im, k):
    a = np.array(im).astype(float); a[..., :3] *= k; return Image.fromarray(a.clip(0, 255).astype(np.uint8))

FILL = np.array(ld('t_fill')).astype(float)
TOP = np.array(ld('t_top')); CEIL = np.array(ld('t_ceil'))


def ve_da(solid0, seed):
    """Tô đá liền theo điểm ảnh từ mặt nạ ô đặc (H×W bool). Trả (ảnh RGBA numpy, mặt nạ đá thật)."""
    H, W = solid0.shape
    rng = np.random.default_rng(seed)
    def nhieu(sig):
        z = ndimage.gaussian_filter(rng.random((H, W)), sig); return (z - z.mean()) / (z.std() + 1e-6)
    n5, n16, n14, n9 = nhieu(5), nhieu(16), nhieu(14), nhieu(9)
    field = ndimage.gaussian_filter(solid0.astype(float), 6) + n5 * 0.16 + n16 * 0.3 + n9 * 0.22
    mask = field + 0.3 > 0.5     # hơi lệch ra ngoài → mép uốn lượn quanh ô va chạm, không thành vạch thẳng
    # mặt sàn giữ phẳng (chân đứng đúng chỗ), trừ gần góc
    sanTren = solid0 & ~np.roll(solid0, 1, 0)
    dai = np.zeros_like(solid0)
    for k in range(-5, 7): dai |= np.roll(sanTren, k, 0)
    ganGoc = ndimage.binary_dilation(solid0 & ~(np.roll(solid0, 1, 1) & np.roll(solid0, -1, 1)), iterations=10)
    giu = dai & ~ganGoc
    mask = np.where(giu, solid0, mask)
    mask = np.where(solid0 & (ndimage.distance_transform_edt(solid0) > 12), True, mask)
    gioi_han = np.clip(4.2 + 2.2 * nhieu(7), 1.6, TRAN_MEP)    # giới hạn trùm cũng lượn (không thành đường song song thẳng)
    mask = np.where(~solid0 & (ndimage.distance_transform_edt(~solid0) > gioi_han), False, mask)
    mask |= solid0     # KHÔNG BAO GIỜ khoét vào ô va chạm
    mask |= ~solid0 & (ndimage.distance_transform_edt(~solid0) <= np.clip(1.6 + 1.6 * nhieu(6), 0, 3.5)) & ~giu   # gợn tối thiểu: không đoạn mép nào thẳng tắp
    # bỏ đảo đá vụn (không chạm ô đặc) + lấp lỗ nhỏ
    l, n = ndimage.label(mask)
    if n:
        s = ndimage.sum(np.ones_like(l), l, range(1, n + 1)); co = ndimage.maximum(solid0, l, range(1, n + 1))
        mask &= ~np.isin(l, [i + 1 for i in range(n) if s[i] < 600 and not co[i]])
    l, n = ndimage.label(~mask)
    if n:
        s = ndimage.sum(np.ones_like(l), l, range(1, n + 1)); mask |= np.isin(l, np.nonzero(s < 120)[0] + 1)
    d = ndimage.distance_transform_edt(mask)
    toi = np.clip(1 - d / 120.0, 0.0, 1.0) ** 1.2
    toi = toi * (0.85 + 0.15 * n14)
    k = (0.10 + 0.70 * toi) * 0.95
    YY, XX = np.mgrid[0:H, 0:W]
    a = np.zeros((H, W, 4), np.uint8)
    a[..., :3] = np.clip(FILL[YY % 64, XX % 64, :3] * k[..., None], 0, 255).astype(np.uint8)
    a[..., 3] = np.where(mask, 255, 0)
    sang = mask & ~ndimage.binary_erosion(mask, iterations=7)
    a[sang, :3] = np.clip(a[sang, :3].astype(float) * 1.35 + 6, 0, 255).astype(np.uint8)
    vien = mask & ~ndimage.binary_erosion(mask, iterations=2)
    a[vien, :3] = (a[vien, :3] * .55).astype(np.uint8)
    e2 = ndimage.binary_erosion(mask, iterations=2); ria = e2 & ~ndimage.binary_erosion(mask, iterations=4)
    a[ria, :3] = np.clip(a[ria, :3].astype(float) * 0.5 + np.array([92, 58, 50]) * 0.9, 0, 255).astype(np.uint8)
    # cỏ rễ trên mặt sàn + rủ dưới trần, đặt theo mép THẬT
    tren = mask & ~np.roll(mask, 1, 0); tren[0] = False
    duoi = ~mask & np.roll(mask, 1, 0); duoi[0] = False
    for y, x in zip(*np.nonzero(tren)):
        seg = TOP[30:64, x % 64]
        for j in range(seg.shape[0]):
            yy = y - 2 + j
            if 0 <= yy < H and seg[j, 3] > 0 and (mask[yy, x] or j < 6): a[yy, x] = seg[j]
    for y, x in zip(*np.nonzero(duoi)):
        seg = CEIL[0:36, x % 64]
        for j in range(36):
            yy = y - 18 + j
            if 0 <= yy < H and seg[j, 3] > 0:
                c = seg[j].astype(float); c[:3] *= .8; a[yy, x] = c.astype(np.uint8)
    # bỏ vụn rời (không dính đá)
    lab, nl = ndimage.label(a[..., 3] > 0)
    if nl:
        sz = ndimage.sum(np.ones_like(lab), lab, range(1, nl + 1))
        a[np.isin(lab, np.nonzero(sz < 60)[0] + 1), 3] = 0
    return a, mask


def ve_phong(pid):
    P = json.load(open(PHONG + pid + '.json', encoding='utf-8'))
    L = [list(r) for r in P['luoi']]
    C, R = max(len(r) for r in L), len(L)
    for r in L: r += ['.'] * (C - len(r))
    seed = int(hashlib.md5(pid.encode()).hexdigest()[:8], 16)
    rnd = random.Random(seed)
    C2, R2 = C + 2 * PAD, R + 2 * PAD
    g = [['#'] * C2 for _ in range(R2)]
    for r in range(R):
        for c in range(C): g[r + PAD][c + PAD] = L[r][c]
    # cửa: khoét thông ra mép đệm
    for cua in P.get('cua', []):
        n = cua.get('cao', 3)
        o = [(cua['cot'] + i, cua['hang']) if cua['huong'] in ('tren', 'duoi') else (cua['cot'], cua['hang'] + i) for i in range(n)]
        for c, r in o:
            c, r = c + PAD, r + PAD
            if cua['huong'] == 'trai':
                for cc in range(0, c + 1): g[r][cc] = '.'
            elif cua['huong'] == 'phai':
                for cc in range(c, C2): g[r][cc] = '.'
            elif cua['huong'] == 'tren':
                for rr in range(0, r + 1): g[rr][c] = g[rr][c] if g[rr][c] == 'H' else '.'
            else:
                for rr in range(r, R2): g[rr][c] = g[rr][c] if g[rr][c] == 'H' else '.'
    ch = lambda c, r: g[r][c] if 0 <= c < C2 and 0 <= r < R2 else '#'
    dac = lambda c, r: ch(c, r) == '#'
    # mấu đá nhỏ đứng riêng (≤ 6 ô, cao ≤ 2 hàng) → vẽ bằng bệ rễ (như phòng demo), không tô thành cục đá vuông
    od = np.array([[dac(c, r) for c in range(C2)] for r in range(R2)])
    lab, nl = ndimage.label(od)
    MAU = set()
    for i, sl in enumerate(ndimage.find_objects(lab)):
        cells = list(zip(*np.nonzero(lab[sl] == i + 1)))
        if len(cells) <= 6 and sl[0].stop - sl[0].start <= 2:
            for rr, cc in cells: MAU.add((rr + sl[0].start, cc + sl[1].start))
    W, H = C2 * T, R2 * T
    def mat_na(chu):   # ô đặc → mặt nạ điểm ảnh
        m = np.array([[(ch(c, r) in chu) and (r, c) not in MAU for c in range(C2)] for r in range(R2)])
        return np.kron(m, np.ones((T, T), bool))
    co_NG = any(ch(c, r) in 'NG' for r in range(R2) for c in range(C2))
    A_day, M_day = ve_da(mat_na('#NG'), seed)                 # trạng thái đủ (N, G là đá)
    if co_NG: A_lo, M_lo = ve_da(mat_na('#'), seed)            # trạng thái lộ hốc (N vỡ / G mờ)
    else: A_lo, M_lo = A_day, M_day
    # vùng khác nhau giữa 2 trạng thái → mảnh ghép theo nhóm N / G
    nhom = []
    if co_NG:
        khac = np.any(A_day != A_lo, axis=2)
        for loai in 'NG':
            m = np.array([[ch(c, r) == loai for c in range(C2)] for r in range(R2)])
            lb, nn = ndimage.label(m)
            for i in range(1, nn + 1):
                cells = [(int(c) - PAD, int(r) - PAD) for r, c in zip(*np.nonzero(lb == i))]
                vung = ndimage.binary_dilation(np.kron(lb == i, np.ones((T, T), bool)), iterations=40) & khac
                vung |= np.kron(lb == i, np.ones((T, T), bool))
                ys, xs = np.nonzero(vung)
                x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
                nhom.append({'loai': loai, 'o': cells, 'hop': [int(x0), int(y0), int(x1 - x0), int(y1 - y0)]})
    cam = np.zeros((R2, C2), bool)        # ô không đặt đồ (mảnh ghép, cửa)
    for nh in nhom:
        x, y, w, h = nh['hop']; cam[y // T:(y + h) // T + 1, x // T:(x + w) // T + 1] = True
    for cua in P.get('cua', []):
        n = cua.get('cao', 3)
        if cua['huong'] in ('tren', 'duoi'): cam[max(0, cua['hang'] + PAD - 3):cua['hang'] + PAD + 4, cua['cot'] + PAD - 1:cua['cot'] + PAD + n + 1] = True
        else: cam[cua['hang'] + PAD - 1:cua['hang'] + PAD + n + 1, max(0, cua['cot'] + PAD - 2):cua['cot'] + PAD + 3] = True
    if P.get('chuong_luu'):
        cl = P['chuong_luu']; cam[cl['hang'] + PAD - 4:cl['hang'] + PAD + 1, cl['cot'] + PAD - 3:cl['cot'] + PAD + 4] = True
    mask = M_day & M_lo   # đồ đặt/treo phải bám vào đá có ở CẢ 2 trạng thái

    lop_canh = [Image.fromarray(A_day), Image.fromarray(A_lo)]
    truoc = Image.new('RGBA', (W, H))
    def dan(im, xy):
        for L_ in lop_canh: L_.alpha_composite(im, (int(xy[0]), int(xy[1])))

    # ---- sàn mỏng '=' + mấu đá nhỏ: bệ rễ ghép từ plat_4 (đầu / giữa lặp / đuôi)
    p4 = ld('plat_4')
    def be_re(x0, w, ytop, k=.9):
        dau, giua, duoi = p4.crop((0, 0, 22, p4.height)), p4.crop((22, 0, 130, p4.height)), p4.crop((130, 0, p4.width, p4.height))
        im = Image.new('RGBA', (w + 8, p4.height))
        im.alpha_composite(dau, (0, 0)); x = 22
        while x < w + 8 - 24:
            gw = min(giua.width, w + 8 - 24 - x); im.alpha_composite(giua.crop((0, 0, gw, giua.height)), (x, 0)); x += gw
        im.alpha_composite(duoi, (w + 8 - duoi.width, 0))
        dan(dim(im, k), (x0 - 4, ytop - 3))
    for r in range(R2):
        c = 0
        while c < C2:
            if ch(c, r) == '=' or (r, c) in MAU:
                c0 = c
                while c < C2 and (ch(c, r) == '=' or (r, c) in MAU): c += 1
                be_re(c0 * T, (c - c0) * T, r * T, .95 if ch(c0, r) == '=' else .85)
                if any((r, cc) in MAU for cc in range(c0, c)) and (r + 1, c0) in MAU:   # mấu cao 2 hàng: thêm bệ thứ 2 tối hơn
                    be_re(c0 * T, (c - c0) * T, (r + 1) * T, .6)
            else: c += 1

    # ---- dây leo 'H': mỗi đoạn dọc liền – bám trần thật ở trên
    vt, vm1, vm2, vb = [ld(n) for n in ('v_top', 'v_mid1', 'v_mid2', 'v_bot')]
    def mat_tran(x, y):
        x = max(0, min(W - 1, x)); y = max(1, min(H - 1, y))
        while y > 1 and not mask[y - 1, x]: y -= 1
        while y < H - 1 and mask[y, x]: y += 1
        return y
    def mat_san(x, y):
        x = max(0, min(W - 1, x)); y = max(0, min(H - 1, y))
        while y < H - 1 and not mask[y, x]: y += 1
        while y > 0 and mask[y - 1, x]: y -= 1
        return y
    for c in range(C2):
        r = 0
        while r < R2:
            if ch(c, r) != 'H': r += 1; continue
            r0 = r
            while r < R2 and ch(c, r) == 'H': r += 1
            r1 = r - 1
            x = c * T + 8
            # kéo lên tới trần thật (dây không treo giữa không trung)
            rr = r0 - 1
            while rr >= 0 and not dac(c, rr) and ch(c, rr) != '=': rr -= 1
            y0 = mat_tran(x, (rr + 1) * T) if rr >= 0 else 0
            y1 = (r1 + 1) * T if r1 + 1 < R2 and not (dac(c, r1 + 1)) else mat_san(x, (r1 + 1) * T - 2)
            if r1 + 1 < R2 and dac(c, r1 + 1): y1 = mat_san(x, r1 * T + 8)
            dan(dim(vt, .85), (x - vt.width // 2, y0 - 14))
            y = y0 - 14 + vt.height - 6; k = 0
            while y < y1 - vb.height + 6:
                dan(dim(vm1 if k % 2 == 0 else vm2, .85), (x - vm1.width // 2, y)); y += vm1.height - 1; k += 1
            dan(dim(vb, .85), (x - vb.width // 2, min(y, y1 - vb.height + 8)))

    # ---- đồ đặt / treo: kiểm tra bám mép đá thật, không đè dây leo, cửa, mảnh ghép
    da_dung = []
    def o_cua(x0, y0, w, h):
        return [(r, c) for r in range(max(0, y0 // T), min(R2, (y0 + h) // T + 1)) for c in range(max(0, x0 // T), min(C2, (x0 + w) // T + 1))]
    def trong_sach(x0, y0, w, h, cach=0, ep=False):
        for r, c in o_cua(x0, y0, w, h):
            if ch(c, r) in 'H=' or (r, c) in MAU: return False
            if cam[r, c] and not ep: return False
        if ep: return True
        for (a, b, cw, chh) in da_dung:
            if x0 < a + cw + cach and a < x0 + w + cach and y0 < b + chh and b < y0 + h: return False
        return True
    def dat(n, x, ysan_goi_y, k=.8, s=1.0, ep=False):
        p = dim(ld(n), k)
        if s != 1: p = p.resize((round(p.width * s), round(p.height * s)), Image.NEAREST)
        ys = mat_san(x, ysan_goi_y)
        x0, y0 = x - p.width // 2, ys - p.height + 2
        if x0 < 0 or x0 + p.width > W or y0 < 0: return False
        cot = mask[ys, x0 + 2:x0 + p.width - 2]
        if cot.mean() < .9 or mask[y0:ys - 3, x0 + 3:x0 + p.width - 3].mean() > .06: return False
        if not trong_sach(x0, y0, p.width, p.height, 6, ep): return False
        dan(p, (x0, y0)); da_dung.append((x0, y0, p.width, p.height)); return True
    def treo(n, x, ytran_goi_y, k=.7, lop=None, s=1.0, ep=False):
        p = dim(ld(n), k)
        if s != 1: p = p.resize((round(p.width * s), round(p.height * s)), Image.NEAREST)
        yt = mat_tran(x, ytran_goi_y)
        x0, y0 = x - p.width // 2, yt - 4
        if x0 < 0 or x0 + p.width > W or y0 + p.height > H: return False
        w2 = max(4, p.width // 3)                     # phần móc (giữa ảnh) phải chạm đá
        if mask[yt - 1, x - w2 // 2:x + w2 // 2].mean() < .95: return False
        if mask[yt + 3:y0 + p.height, x0 + 2:x0 + p.width - 2].mean() > .05: return False
        if lop is None and not trong_sach(x0, y0, p.width, p.height, 4, ep): return False
        if lop is None: dan(p, (x0, y0)); da_dung.append((x0, y0, p.width, p.height))
        else: lop.alpha_composite(p, (x0, y0))
        return True

    # đèn của phòng: treo đèn lồng nếu có trần gần, không thì đèn thờ trên sàn gần
    den_ra = []
    for d in P.get('den', []):
        c, r = d['cot'] + PAD, d['hang'] + PAD; x = c * T + 8
        rr = r
        while rr > 0 and not dac(c, rr - 1) and r - rr < 4: rr -= 1
        ok = False
        if rr > 0 and dac(c, rr - 1):
            for dx in (0, -6, 6, -12, 12, -20, 20, -28, 28):
                if treo('h_long_den', x + dx, rr * T, .95, ep=True): den_ra.append([x + dx - PAD * T, mat_tran(x + dx, rr * T) - 4 + 52 - PAD * T]); ok = True; break
        if not ok:
            rr = r
            while rr < R2 - 1 and not dac(c, rr + 1) and rr - r < 5: rr += 1
            for dx in (0, -8, 8, -16, 16):
                if dat('p_den_tho', x + dx, (rr + 1) * T - 4, 1.0, ep=True): den_ra.append([x + dx - PAD * T, mat_san(x + dx, (rr + 1) * T - 4) - 42 - PAD * T]); ok = True; break
        if not ok: den_ra.append([x - PAD * T, r * T + 8 - PAD * T])

    # Chuông Lưu: KHÔNG vẽ vào ảnh phòng nữa – game vẽ hình ChatGPT (art/vung-1/dao-cu/chuong-luu-tat/sang.png)
    # đè lên lúc chơi (luồng E). Vùng quanh chuông vẫn được giữ trống (mảng `cam` ở trên) để đồ trang trí không đè.
    # trang trí theo ID của luồng B
    BAN = {'dau_lau': ['sk_3', 'sk_4', 'sk_6'], 'hai_cot': ['sk_1'], 'xac_nguoi_ngoi': ['sk_1'], 'lo_duc_chuong': ['p_manh_chuong', 'p_chuong_nghieng'],
           'gian_treo_chuong': ['p_gia_gay'], 'be_da_chuong': ['p_bia'], 'vo_bo_khong_lo': ['p_manh_chuong'], 'chuong_vo_lon': ['p_chuong_nghieng'],
           'cong_re': ['gate_mo']}
    for t in P.get('trang_tri', []):
        loai = t.get('loai'); c, r = t['cot'] + PAD, t['hang'] + PAD; x = c * T + 8
        if loai in BAN:
            ten = rnd.choice(BAN[loai]); s = 1.0
            if ten == 'gate_mo':
                p = dim(Image.open(os.path.join(DU_AN, 'art/phong-demo/gate_mo.png')).convert('RGBA'), .55)
                p = p.resize((p.width * 5 // 8, p.height * 5 // 8), Image.NEAREST)
                ys = mat_san(x, (r + 1) * T - 4); dan(p, (x - p.width // 2, ys - p.height + 3)); da_dung.append((x - p.width // 2, ys - p.height, p.width, p.height)); continue
            if loai == 'chuong_vo_lon': s = 1.25
            for dx in (0, -10, 10, -20, 20, -30, 30):
                if dat(ten, x + dx, (r + 1) * T - 4, .78, s, ep=loai in ('xac_nguoi_ngoi', 'hai_cot')): break
            if loai == 'lo_duc_chuong': dat('p_chuong_up', x + 40, (r + 1) * T - 4, .6)
            if loai == 'gian_treo_chuong':
                for dx in (0, 16, -16, 32):
                    if treo('h_vai_chuong', x + dx, r * T, .75): break
        elif loai in ('to_moi', 'mieng_ken_da', 'ong_chuong_cam'):
            ds = {'to_moi': ['h_re_bo', 'h_re_bo'], 'mieng_ken_da': ['h_re_mat_na', 'h_vai_dai', 'h_re_bo'], 'ong_chuong_cam': ['h_vai_chuong', 'h_xich', 'h_vai_chuong', 'h_xich', 'h_vai_chuong']}[loai]
            for i, n in enumerate(ds): treo(n, x + (i - len(ds) // 2) * 40, (r + 1) * T, .7)

    # rải đồ trang trí / hài cốt trên sàn
    SAN = ['sk_3', 'sk_4', 'sk_6', 'sk_7', 'sk_5', 'sk_2', 'p_mat_na', 'p_bia', 'p_chuong_nho', 'sk_1', 'p_gia_gay', 'p_chuong_up', 'sk_3', 'p_manh_chuong']
    cands = [(c, r) for r in range(1, R2) for c in range(C2) if dac(c, r) and not dac(c, r - 1) and r - 3 >= 0 and not any(dac(c, r - k) for k in (2, 3))]
    rnd.shuffle(cands); j = 0
    dich = max(3, len(cands) // 14)
    for c, r in cands[:dich * 3]:
        if rnd.random() < .45: continue
        n = SAN[j % len(SAN)]
        if dat(n, c * T + 8, r * T - 2, .55 + rnd.random() * .25): j += 1
    # treo từ trần
    HANGS = ['h_vai_dai', 'h_re_bo', 'h_xich', 'h_day_leo', 'h_vai_chuong', 'h_re_mat_na', 'h_re_bo', 'h_day_leo']
    cands = [(c, r) for c in range(C2) for r in range(R2 - 3) if dac(c, r) and not dac(c, r + 1) and not dac(c, r + 2) and not dac(c, r + 3) and not dac(c, r + 4)]
    rnd.shuffle(cands); j = 0; used = []
    for c, r in cands:
        if any(abs(c - uc) < 4 and abs(r - ur) < 4 for uc, ur in used) or rnd.random() < .5: continue
        if treo(HANGS[j % len(HANGS)], c * T + 8, (r + 1) * T, .55 + rnd.random() * .2): used.append((c, r)); j += 1
    for c, r in rnd.sample(used, min(5, len(used))): treo('h_day_leo', c * T + 24, (r + 1) * T, .18, truoc, 1.4)

    # ---- cắt đệm, ghi file
    box = (PAD * T, PAD * T, PAD * T + C * T, PAD * T + R * T)
    canh_day, canh_lo = lop_canh[0], lop_canh[1]
    canh = canh_day.copy()
    manh = []
    for nh in nhom:   # G: nền là trạng thái lộ hốc, mảnh = đá đủ (vẽ mờ dần khi nhân vật vào)
        x, y, w, h = nh['hop']
        if nh['loai'] == 'G': canh.paste(canh_lo.crop((x, y, x + w, y + h)), (x, y))
        manh.append((nh, (canh_day if nh['loai'] == 'G' else canh_lo).crop((x, y, x + w, y + h))))
    # vết nứt trên tường nứt (khắc thẳng vào ảnh đủ để nhìn ra được – kiểu mạch đá vỡ, có viền ấm)
    rn = random.Random(seed + 5)
    for nh in nhom:
        if nh['loai'] != 'N': continue
        xs = [c for c, r in nh['o']]; ys = [r for c, r in nh['o']]
        cx = (min(xs) + max(xs) + 1) * T // 2 + PAD * T; y_tren, y_duoi = (min(ys) + PAD) * T + 3, (max(ys) + 1 + PAD) * T - 3
        a = np.array(canh)
        x = cx; pts = []
        for y in range(y_tren, y_duoi):
            if rn.random() < .35: x += rn.choice((-1, 1))
            x = max(cx - 6, min(cx + 6, x)); pts.append((x, y))
            if rn.random() < .06:   # nhánh nứt
                bx, by, dx = x, y, rn.choice((-1, 1))
                for _ in range(rn.randint(3, 7)): bx += dx; by += rn.choice((0, 1)); pts.append((bx, by))
        for x_, y_ in pts:
            a[y_, x_, :3] = (14, 8, 9); a[y_, x_ + 1, :3] = (14, 8, 9)
            a[y_, x_ + 2, :3] = np.clip(a[y_, x_ + 2, :3].astype(int) + (60, 40, 30), 0, 255)
        canh = Image.fromarray(a)
    # mảnh ghép ra 1 ảnh (xếp dọc)
    meta_manh = []
    if manh:
        mw = max(m.width for _, m in manh); mh = sum(m.height for _, m in manh)
        atlas = Image.new('RGBA', (mw, mh)); yy = 0
        for nh, m in manh:
            atlas.paste(m, (0, yy)); x, y, w, h = nh['hop']
            meta_manh.append({'loai': nh['loai'], 'o': [[c, r] for c, r in nh['o']], 'x': x - PAD * T, 'y': y - PAD * T, 'w': w, 'h': h, 'ay': yy}); yy += m.height
        atlas.save(OUT + pid + '-manh.png')
    elif os.path.exists(OUT + pid + '-manh.png'): os.remove(OUT + pid + '-manh.png')
    canh.crop(box).save(OUT + pid + '-canh.png', optimize=True)
    truoc.crop(box).save(OUT + pid + '-truoc.png', optimize=True)
    # ảnh 'đủ' gốc (cho đoạn tường nứt vỡ dở) = chính canh; meta
    json.dump({'id': pid, 'o_diem': T, 'cot': C, 'hang': R, 'den': den_ra, 'manh': meta_manh}, open(OUT + pid + '-canh.json', 'w', encoding='utf-8'), ensure_ascii=False)
    print(pid, C, 'x', R, '· mảnh', len(meta_manh), '· đèn', len(den_ra), '· đồ', len(da_dung))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    ds = sys.argv[1:] or [os.path.basename(f)[:-5] for f in sorted(glob.glob(PHONG + 'P*.json'))]
    for pid in ds: ve_phong(pid)
