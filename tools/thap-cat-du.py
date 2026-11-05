#!/usr/bin/env python3
"""TURRET MERGE — CẮT LẠI ĐỦ HÌNH đầu ụ bị lưỡi cắt ô lưới xén mất (sừng/cánh/đuôi phẳng) hoặc dính mảnh hình bên cạnh.

Vì sao: tấm ChatGPT xếp hình sát nhau / chìa ra ngoài ô → script cũ cắt theo ô cố định → mép phẳng + mảnh lạ.
Cách làm (không vẽ gì mới):
  1. Tìm lại vị trí + tỉ lệ ảnh cũ trong tấm raw (so mẫu nhiều tỉ lệ — hàm tim() của tools/thap-cat-3x.py).
  2. Khoá nền magenta ở độ phân giải raw, tách THÀNH PHẦN LIÊN THÔNG: thành phần có ≥ 50 % diện tích nằm trong vùng cũ = của hình này
     (gộp mọi phần rời của cùng hình: bong bóng, lửa, sao); thành phần chủ yếu nằm ngoài = hình bên cạnh → bỏ.
  3. Giữ NGUYÊN tâm + tỉ lệ (điểm xoay đầu súng không đổi); khung ảnh nới đều quanh tâm nếu hình đủ to hơn khung cũ (+ lề trong suốt),
     hệ số nới e ghi ra JSON để chỉnh STAGE_K_CHO ×e, STAGE_TIP_CHO ÷e (cỡ hiển thị không đổi).
  4. Alpha theo độ lệch khỏi magenta (đường cong học từ ảnh cũ), phần trong đặc = 255, tách trộn màu nền (hết viền hồng),
     loang màu ra mép, thu Lanczos nhân-trước-alpha. Cỡ điểm ảnh ≥ cỡ cũ (cũ đã ≥ 3× cỡ hiển thị lớn nhất — QUY-TAC-HINH mục 5).
  5. Kiểm: phần không bị cắt phải khớp ảnh cũ (IoU ≥ 0.9, tương quan màu ≥ 0.95), không thì giữ ảnh cũ.
Chạy: python3 tools/thap-cat-du.py kiem <tên...>   (chỉ báo: cắt / mảnh lạ)
      python3 tools/thap-cat-du.py cat  <tên...>   (cắt lại, ghi thap/assets + docs/demo-hop-tuong/tuvan/growcut/cat-du.json)
"""
import os, sys, json, importlib.util
import numpy as np
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('c3', os.path.join(GOC, 'tools', 'thap-cat-3x.py'))
C3 = importlib.util.module_from_spec(spec); spec.loader.exec_module(C3)
A = os.path.join(GOC, 'thap/assets')
OUTJ = os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/growcut/cat-du.json')

G1 = ['raw_grow_stages.png']; G2 = ['raw_grow_stages2.png']
H = ['raw_new_h1.png', 'raw_new_h2.png', 'raw_new_h3.png', 'raw_new_h4.png']
FS = ['raw_fs%d.png' % i for i in range(1, 10)] + ['raw_fix8_heads.png', 'raw_redo_heads_a.png', 'raw_redo_heads_b.png'] + H


def nguon(ten):
    if os.environ.get('RAW'): return os.environ['RAW'].split(',')  # biết sẵn tấm raw → nhanh
    id_ = ten.split('_nong')[0]
    if '_nong_s' in ten:
        if id_ in ('overlord', 'hopbi', 'tienhoa', 'lophanung'): return G1
        if id_ in ('soi', 'orbital', 'cuongno', 'ngoisao', 'lienket', 'dongbo'): return G2
        return H
    return FS


PAD = 320


def raw_dem(ten):
    """tấm raw đệm thêm PAD px màu nền mỗi phía (khung ảnh cũ có thể chìa ra ngoài mép tấm raw → so mẫu vẫn khớp)."""
    k = 'dem:' + ten
    if k not in C3._raw:
        R = C3.raw(ten)
        if R is None: return None
        Rp = np.empty((R.shape[0] + 2 * PAD, R.shape[1] + 2 * PAD, 3), np.float32); Rp[:] = C3.NEN[ten]; Rp[PAD:-PAD, PAD:-PAD] = R
        C3._raw[k] = Rp; C3.NEN[k] = C3.NEN[ten]
    return C3._raw[k]


def tim(T, cands):
    for c in cands: raw_dem(c)
    m = C3.tim(T, ['dem:' + c for c in cands])
    if m is not None and m[4] >= 0.85: return (m[0][4:], m[1] - PAD, m[2] - PAD, m[3], m[4])
    # ảnh cũ bị xén nhiều 1 phía → so mẫu bằng 60 % phía còn lại của hình
    h, w = T.shape[:2]; ys, xs = np.nonzero(T[..., 3] > 60)
    by0, by1, bx0, bx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    bh, bw = by1 - by0, bx1 - bx0
    for r0, r1, c0, c1 in ((by0 + int(.4 * bh), by1, bx0, bx1), (by0, by1 - int(.4 * bh), bx0, bx1),
                           (by0, by1, bx0 + int(.4 * bw), bx1), (by0, by1, bx0, bx1 - int(.4 * bw))):
        r0, r1, c0, c1 = max(0, r0 - 6), min(h, r1 + 6), max(0, c0 - 6), min(w, c1 + 6)
        mc = C3.tim(np.ascontiguousarray(T[r0:r1, c0:c1]), ['dem:' + c for c in cands])
        if mc is not None and (m is None or mc[4] > m[4]):
            m = (mc[0], mc[1] - c0 / mc[3], mc[2] - r0 / mc[3], mc[3], mc[4])
    if m is None: return None
    return (m[0][4:], m[1] - PAD, m[2] - PAD, m[3], m[4])


def tach(M, rect, acu, M_sub):
    """thành phần M gồm 2+ hình dính nhau: bào mòn dần tới khi tách thành ≥ 2 mảnh lớn, chia điểm theo mảnh gần nhất,
    giữ mảnh trùng phần đặc của ảnh cũ nhiều nhất."""
    ys, xs = np.nonzero(M); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    m = M[y0:y1, x0:x1]; d = nd.distance_transform_edt(m)
    for t in range(2, int(d.max())):
        lb, k = nd.label(d > t)
        if k < 2: continue
        sz = np.bincount(lb.ravel())[1:]
        big = [j + 1 for j, v in enumerate(sz) if v >= 0.15 * sz.max()]
        if len(big) >= 2: break
    else:
        return M
    mk = np.isin(lb, big)
    _, (iy, ix) = nd.distance_transform_edt(~mk, return_indices=True)
    gan = lb[iy, ix] * m
    # mảnh nào trùng phần đặc ảnh cũ nhiều nhất
    cX0, cY0, cX1, cY1 = rect
    G = np.zeros(M.shape, np.int32); G[y0:y1, x0:x1] = gan
    gs = G[cY0:cY1, cX0:cX1][acu]
    best = np.bincount(gs[gs > 0], minlength=max(big) + 1).argmax()
    return G == best


def phan_tich(T, m):
    """→ dict: own (mặt nạ raw các thành phần của hình), cat_px (phần hình ngoài vùng cũ, px raw), manh (số mảnh lạ có trong ảnh cũ)"""
    rten, x, y, s, v = m
    R = C3.raw(rten); nen = C3.NEN[rten]
    h, w = T.shape[:2]
    D = C3.do_lech(R, nen)
    fg = D > 60
    lab, n = nd.label(fg)
    x0, y0, x1, y1 = x, y, x + w / s, y + h / s
    X0, Y0, X1, Y1 = int(np.floor(x0)), int(np.floor(y0)), int(np.ceil(x1)), int(np.ceil(y1))
    cX0, cY0 = max(0, X0), max(0, Y0); cX1, cY1 = min(R.shape[1], X1), min(R.shape[0], Y1)
    tong = np.bincount(lab.ravel(), minlength=n + 1)
    sub = lab[cY0:cY1, cX0:cX1]
    trong = np.bincount(sub.ravel(), minlength=n + 1)
    # alpha ảnh cũ chiếu lên vùng raw (để biết mảnh nào có mặt trong ảnh cũ)
    ys, xs = np.mgrid[cY0:cY1, cX0:cX1]
    ox = np.clip(((xs + 0.5 - x0) * s).astype(int), 0, w - 1); oy = np.clip(((ys + 0.5 - y0) * s).astype(int), 0, h - 1)
    acu = T[..., 3][oy, ox] > 60
    co_mat = np.bincount(sub[acu].ravel(), minlength=n + 1)
    # cỡ hình trong ảnh cũ (px raw) — để nhận ra 2 hình DÍNH NHAU trong tấm raw (1 thành phần to gấp rưỡi)
    yo, xo = np.nonzero(T[..., 3] > 60)
    cw, chh = (xo.max() - xo.min() + 1) / s, (yo.max() - yo.min() + 1) / s
    sl = nd.find_objects(lab)
    them = np.zeros_like(fg)
    own_ids, manh = [], []
    for i in range(1, n + 1):
        if trong[i] == 0: continue
        fr = trong[i] / tong[i]
        bw, bh = sl[i - 1][1].stop - sl[i - 1][1].start, sl[i - 1][0].stop - sl[i - 1][0].start
        if co_mat[i] > 0.25 * acu.sum() and (bw > 1.5 * cw or bh > 1.5 * chh):
            them |= tach(lab == i, (cX0, cY0, cX1, cY1), acu, sub == i); continue
        if fr >= 0.5 and tong[i] >= 20: own_ids.append(i)
        elif co_mat[i] >= 6: manh.append(i)
    # mảnh nhỏ KHÔNG có trong ảnh cũ và nằm xa thân chính (vụn đá/sao của hình bên cạnh rơi vào vùng) → bỏ
    if len(own_ids) > 1:
        chinh = max(own_ids, key=lambda i: tong[i]); dk = 2 * np.sqrt(tong[chinh] / np.pi)
        kc = nd.distance_transform_edt(lab != chinh)
        own_ids = [i for i in own_ids if i == chinh or co_mat[i] > 0 or kc[lab == i].min() < 0.08 * dk]
    own = np.isin(lab, own_ids) | them
    # phần hình CÓ trong vùng cũ nhưng ảnh cũ bị xén mất (alpha cũ ≈ 0)
    lo = nd.binary_erosion(own, iterations=2)[cY0:cY1, cX0:cX1]
    mat_cu = (T[..., 3][oy, ox] < 30) & lo
    ngoai = own.copy(); ngoai[cY0:cY1, cX0:cX1] = False
    oy_, ox_ = np.nonzero(own)
    ra = 0.0
    if len(oy_):
        ra = max(x0 - ox_.min(), oy_.min() - y0 if False else y0 - oy_.min(), ox_.max() + 1 - x1, oy_.max() + 1 - y1, 0)
    return dict(own=own, D=D, R=R, nen=nen, cat_px=int(ngoai.sum()), mat_px=int(mat_cu.sum()), ra=float(ra), manh=len(manh),
                manh_px=int(sum(co_mat[i] for i in manh)), rect=(x0, y0, x1, y1), ext=(ox_.min(), oy_.min(), ox_.max() + 1, oy_.max() + 1) if len(oy_) else None)


def cat(T, m, P):
    rten, x, y, s, v = m
    h, w = T.shape[:2]
    R, D, own, nen = P['R'], P['D'], P['own'], P['nen']
    ex0, ey0, ex1, ey1 = P['ext']
    # tâm ảnh cũ (trong raw) — giữ nguyên
    cx, cy = x + w / (2 * s), y + h / (2 * s)
    lề = max(4.0, 0.03 * w)
    nx = max(w / 2, (cx - ex0) * s + lề, (ex1 - cx) * s + lề)
    ny = max(h / 2, (cy - ey0) * s + lề, (ey1 - cy) * s + lề)
    if w == h: nx = ny = max(nx, ny)
    W2, H2 = int(np.ceil(nx * 2)), int(np.ceil(ny * 2))
    if (W2 - w) % 2: W2 += 1
    if (H2 - h) % 2: H2 += 1
    e = W2 / w
    # vùng raw cho khung mới
    bx0, by0 = cx - W2 / (2 * s), cy - H2 / (2 * s)
    bx1, by1 = cx + W2 / (2 * s), cy + H2 / (2 * s)
    Pd = int(np.ceil(max(0, -bx0, -by0, bx1 - R.shape[1], by1 - R.shape[0]))) + 8
    Rp = np.empty((R.shape[0] + 2 * Pd, R.shape[1] + 2 * Pd, 3), np.float32); Rp[:] = nen; Rp[Pd:-Pd, Pd:-Pd] = R
    Dp = np.zeros(Rp.shape[:2], np.float32); Dp[Pd:-Pd, Pd:-Pd] = D
    Op = np.zeros(Rp.shape[:2], bool); Op[Pd:-Pd, Pd:-Pd] = own
    # alpha ở độ phân giải raw: đường cong học từ ảnh cũ
    rgb_o, Dn = C3.lay(raw_dem(rten), x + PAD, y + PAD, s, w, h, 1.0, nen)
    f = C3.hoc_alpha(Dn, T[..., 3])
    a = f(Dp)
    dac = nd.binary_fill_holes(Op)
    trong = nd.binary_erosion(dac, iterations=2)
    vung = nd.binary_dilation(Op, iterations=3)
    a = np.where(trong, 255.0, np.where(vung, a, 0.0))
    al = a[..., None] / 255.0
    fg = np.clip((Rp - (1 - al) * nen) / np.maximum(al, 0.04), 0, 255)
    fg = C3.loang(fg, a)
    img = np.dstack([fg, a])
    im = Image.fromarray(np.clip(img, 0, 255).round().astype(np.uint8), 'RGBA').convert('RGBa')
    box = (bx0 + Pd, by0 + Pd, bx1 + Pd, by1 + Pd)
    out = np.asarray(im.resize((W2, H2), Image.LANCZOS, box=box).convert('RGBA')).astype(np.float32)
    # giữ NGUYÊN điểm đặc của ảnh cũ (màu đã chỉnh trước đây) — chỉ thêm phần bị xén / bỏ mảnh lạ
    ox, oy = (W2 - w) // 2, (H2 - h) // 2
    cu_d = (T[..., 3] >= 250) & (out[oy:oy + h, ox:ox + w, 3] >= 250)
    reg = out[oy:oy + h, ox:ox + w]; reg[cu_d] = T[cu_d]
    # viền mịn σ≈0.5 px
    A2 = out[..., 3]; mem = nd.gaussian_filter(A2, 0.5)
    vien = ~nd.binary_erosion(A2 >= 250, iterations=1) & nd.binary_dilation(A2 > 0, iterations=1)
    A2 = np.where(vien, mem, A2); A2[A2 < 3] = 0; out[..., 3] = A2
    # kiểm: vùng khung cũ của ảnh mới so với ảnh cũ (bỏ dải 3 px sát mép khung cũ — chỗ lưỡi cắt)
    ox, oy = (W2 - w) // 2, (H2 - h) // 2
    cu = out[oy:oy + h, ox:ox + w]
    k = np.zeros((h, w), bool); k[3:-3, 3:-3] = True
    m1, m0 = (cu[..., 3] > 64) & k, (T[..., 3] > 160) & k
    iou = (m1 & m0).sum() / max(1, m0.sum())  # phần đặc của ảnh cũ phải còn đủ trong ảnh mới
    kk = k & (T[..., 3] > 160) & (cu[..., 3] > 160)
    pm = lambda q: (q[..., :3])[kk]
    cc = float(np.corrcoef(pm(cu).ravel(), pm(T).ravel())[0, 1])
    return out, e, float(iou), cc


def main():
    mode = sys.argv[1]; ds = sys.argv[2:]
    kq = json.load(open(OUTJ)) if os.path.exists(OUTJ) else {}
    for ten in ds:
        p = os.path.join(A, ten + '.png')
        T = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
        m = tim(T, nguon(ten))
        if m is None or m[4] < 0.8:
            print(ten, 'KHONG TIM THAY', m and round(m[4], 3)); continue
        P = phan_tich(T, m)
        info = dict(raw=m[0], diem=round(m[4], 3), s=round(m[3], 4), cat_px=P['cat_px'], mat_px=P['mat_px'], ra_px=round(P['ra'] * m[3], 1), manh=P['manh'], manh_px=P['manh_px'])
        loi = (P['cat_px'] > 40 and P['ra'] * m[3] > 1.5) or P['manh_px'] > 30 or P['mat_px'] * m[3] ** 2 > 40
        info['loi'] = bool(loi)
        if mode == 'cat' and (loi or os.environ.get('EP')):
            out, e, iou, cc = cat(T, m, P)
            info.update(e=round(e, 4), iou=round(iou, 3), cc=round(cc, 3), size=[out.shape[1], out.shape[0]], cu=[T.shape[1], T.shape[0]])
            if iou >= 0.9 and cc >= 0.95:
                Image.fromarray(np.clip(out, 0, 255).round().astype(np.uint8), 'RGBA').save(p, optimize=True)
                info['ghi'] = True
            else: info['ghi'] = False
            kq[ten] = info
        print(ten, json.dumps(info), flush=True)
    if mode == 'cat':
        json.dump(kq, open(OUTJ, 'w'), indent=1, ensure_ascii=False)


if __name__ == '__main__': main()
