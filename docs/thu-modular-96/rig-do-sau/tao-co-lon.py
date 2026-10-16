#!/usr/bin/env python3
"""Chế độ "Độ phân giải cao": dựng nhân vật + giáp Gen ở ô 192 (×2) và 384 (×4) từ ẢNH THẬT.

Chạy (tao-rig.py tự gọi):  python3 docs/thu-modular-96/rig-do-sau/tao-co-lon.py

CHỈ ĐỌC: ../data.json, ../khop-nguon.json, ../sheets/ (lớp 96), ../tach_lop.py (luật tách lớp gốc),
         docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-01..12.png (ảnh nguồn hàng chạy),
         giap-gen/goc-*.png (bản cắt gốc giáp gen, do tao-giap-gen.py cắt từ ../anh-gen/giap-roi-4-manh.png)
Ghi (chỉ trong rig-do-sau/):
  co-lon/than-<cỡ>/<lớp>.png     sheet 12 khung từng lớp thân ở cỡ 192 / 384
  co-lon/khop-co-lon.json        TỆP CHỈNH KHỚP riêng: độ lệch (dx,dy) cộng vào data.json × hệ số cho từng cỡ
  co-lon/giap-<cỡ>/*.png         giáp Gen thu về cỡ đó + chụp khớp vẽ lại cho cỡ đó
  co-lon/nhan-<cỡ>/*.png         ảnh nhãn back/front (hạ từ nhãn trên ảnh GỐC)
  co-lon/pass-<cỡ>/*-{back,front,trong}.png   lượt vẽ
  nhan/goc/*.png                 nhãn back/front vẽ trên ảnh giáp GỐC (nguồn của mọi cỡ)
  nhan/gen/<mảnh>.png (cỡ 96)    cũng hạ từ nhãn gốc; trạng thái "tu-goc" trong nhan/nhan.json (tao-mask.py giữ nguyên)
  co-lon/co-lon.json             mục lục cho tao-rig.py

1) Thân: cùng cách co/đặt như game — ảnh nguồn co BOX về (k·nw, k·nh) (nw, nh = cỡ ở ô 96, tỉ lệ 0,2255),
   đặt tại (k·dx, k·dy) như data.json.source.placement. Lớp tách: TÁCH LẠI trên ảnh lớn bằng chính luật
   tach_lop.tach() (đo khoảng cách tới xương trên ảnh nguồn), hạ về cỡ đích theo trọng alpha; rồi chia nhỏ
   theo mặt nạ lớp 96 phóng lên (áo/đai, chân/ống quần): điểm ảnh lớn lấy lớp 96 tại ô của nó nếu cùng nhóm,
   khác nhóm thì lấy lớp 96 gần nhất thuộc đúng nhóm (≤ 3 ô 96). Ghép mọi lớp lại = đúng ảnh lớn (kiểm từng điểm ảnh).
2) Khớp: data.json × k, đối chiếu khớp đánh tay trên ảnh nguồn (khop-nguon.json) đổi sang cỡ k.
   Độ lệch ghi vào co-lon/khop-co-lon.json (không sửa data.json).
3) Giáp: thu từ ảnh GỐC về đúng tỉ lệ từng cỡ (độ dài xương trung bình × k), bảng 8 màu lấy từ ảnh (gen.json),
   chọn màu theo ô (viền tối ≥ 50% → viền; đồng ≥ ngưỡng → đồng), ép viền tối ở mép, giữ đinh tán (k ≥ 4),
   không làm mượt (mỗi điểm ảnh là 1 màu bảng, alpha 0/255).
"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

RIG = os.path.dirname(os.path.abspath(__file__))
BO = os.path.dirname(RIG)
sys.path.insert(0, BO)
import tach_lop as T   # noqa: E402  (chỉ dùng hàm, không sửa)

OUT = os.path.join(RIG, 'co-lon')
CO = {192: 2, 384: 4}
N = 12
D = json.load(open(os.path.join(BO, 'data.json')))
KN = json.load(open(os.path.join(BO, 'khop-nguon.json')))['khung']
GEN = json.load(open(os.path.join(RIG, 'giap-gen', 'gen.json')))
PAL = [tuple(int(p['rgb'][i:i + 2], 16) for i in (1, 3, 5)) for p in GEN['palette']]
CENT = np.array(PAL, float)
ROLE = [p['role'] for p in GEN['palette']]
VIEN = ROLE.index('viền')
DONG = [i for i, r in enumerate(ROLE) if r == 'đồng']
THEP = [i for i, r in enumerate(ROLE) if r == 'thép/tối']
DO, XANH = (255, 0, 0), (0, 0, 255)
MANH = ['giap-vai', 'giap-cang-tay', 'giap-ong-chan', 'giap-nguc']
ANCHOR_FRAC = {'giap-vai': (0.15, 0.85), 'giap-cang-tay': (0.12, 0.88), 'giap-ong-chan': (0.12, 0.88), 'giap-nguc': (0.08, 0.92)}
LOP = [L for L in D['layerOrder'] if D['layerKinds'].get(L) != 'giap']
OUTFIT = D['outfits']['goc']['sheets']
# lớp 96 → nhóm của luật tach_lop (đếm trên khung 1 và 6: 100% điểm ảnh khớp nhóm này)
NHOM = {'rearLeg': 'rearLeg', 'rearPants': 'rearLeg', 'rearArm': 'rearArm', 'body': 'body', 'torsoOutfit': 'body',
        'pants': 'pants', 'belt': 'torsoOutfit', 'frontLeg': 'frontLeg', 'frontPants': 'frontLeg', 'frontArm': 'frontArm',
        'head': 'head', 'hair': 'hair'}
KHOP_NGUON = {'shoulderFront': 'vaiT', 'elbowFront': 'khuyuT', 'wristFront': 'coTayT', 'handFront': 'banTayT',
              'shoulderBack': 'vaiS', 'elbowBack': 'khuyuS', 'wristBack': 'coTayS', 'handBack': 'banTayS',
              'hipFront': 'hongT', 'kneeFront': 'goiT', 'ankleFront': 'coChanT', 'toeFront': 'muiChanT',
              'hipBack': 'hongS', 'kneeBack': 'goiS', 'ankleBack': 'coChanS', 'toeBack': 'muiChanS'}


def luu(arr, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(arr.astype(np.uint8), 'RGBA').save(path, optimize=True)


# ============================== 1. THÂN ==============================
def own96(i):
    """Lớp trên cùng thấy được ở từng điểm ảnh ô 96 (theo layerOrder, đồ gốc)."""
    own = np.full((96, 96), -1, int)
    for li, L in enumerate(LOP):
        a = np.array(Image.open(os.path.join(BO, D['sheets'].get(L) or OUTFIT[L])))[:, i * 96:(i + 1) * 96, 3]
        own[a > 0] = li
    return own


def than(k, cache):
    W = 96 * k
    sheets = {L: np.zeros((W, W * N, 4), np.uint8) for L in LOP}
    st = []
    nhom_ten = sorted(set(NHOM.values()))
    lop_nhom = np.array([nhom_ten.index(NHOM[L]) for L in LOP])
    for i in range(N):
        a, nh, phu = cache[i]
        H0, W0 = nh.shape
        nw, nhh = max(1, round(W0 * T.SK)), max(1, round(H0 * T.SK))
        tw, th = k * nw, k * nhh
        dx, dy = T.DAT[i][0] * k, T.DAT[i][1] * k
        im = np.array(Image.fromarray(a).resize((tw, th), Image.BOX))
        big = np.zeros((W, W, 4), np.uint8)
        assert dy + th <= W and dx + tw <= W, (i, k)
        big[dy:dy + th, dx:dx + tw] = im
        # nhóm (luật tach_lop) trên ảnh lớn: trọng alpha
        al = a[..., 3].astype(np.float32)
        wts = []
        for g in nhom_ten:
            m = ((nh == T.NH[g]) * al).astype(np.float32)
            r = np.array(Image.fromarray(m, 'F').resize((tw, th), Image.BOX))
            z = np.zeros((W, W), np.float32); z[dy:dy + th, dx:dx + tw] = r
            wts.append(z)
        wts = np.stack(wts)
        nhom = np.where(wts.max(0) > 0, wts.argmax(0), -1)
        op = big[..., 3] > 0
        o96 = own96(i)
        up = np.kron(o96, np.ones((k, k), int))
        up_nhom = np.where(up >= 0, lop_nhom[np.maximum(up, 0)], -1)
        lab = np.full((W, W), -1, int)
        lab[op & (up_nhom == nhom) & (up >= 0)] = up[op & (up_nhom == nhom) & (up >= 0)]
        doi = 0
        for gi in range(len(nhom_ten)):
            can = op & (lab < 0) & (nhom == gi)
            if not can.any():
                continue
            M = (up_nhom == gi)
            if not M.any():
                continue
            d, (iy, ix) = ndimage.distance_transform_edt(~M, return_indices=True)
            ok = can & (d <= 3 * k)
            lab[ok] = up[iy[ok], ix[ok]]
            doi += int(ok.sum())
        # còn lại (ngoài hình bóng 96 hoặc không có nhóm): lớp 96 gần nhất bất kỳ
        con = op & (lab < 0)
        if con.any():
            d, (iy, ix) = ndimage.distance_transform_edt(up < 0, return_indices=True)
            lab[con] = up[iy[con], ix[con]]
        for li, L in enumerate(LOP):
            m = lab == li
            sheets[L][:, i * W:(i + 1) * W][m] = big[m]
        # kiểm: ghép lại phải đúng ảnh lớn
        ghep = np.zeros_like(big)
        for L in LOP:
            s = sheets[L][:, i * W:(i + 1) * W]
            ghep[s[..., 3] > 0] = s[s[..., 3] > 0]
        lech = int((ghep != big).any(2).sum())
        st.append({'khung': i + 1, 'diemAnh': int(op.sum()), 'theoLop96CungNhom': int((op & (up_nhom == nhom) & (up >= 0)).sum()),
                   'doiTheoNhom': doi, 'ganNhat': int(con.sum()), 'ghepLech': lech})
        if lech:
            raise SystemExit('khung %d cỡ %d: ghép lớp lệch %d điểm ảnh' % (i + 1, W, lech))
    paths = {}
    for L in LOP:
        p = 'co-lon/than-%d/%s.png' % (W, L)
        luu(sheets[L], os.path.join(RIG, p))
        paths[L] = p
    return paths, st


# ============================== 2. KHỚP ==============================
def khop(k, cache):
    out, all_d = [], []
    for i in range(N):
        a, nh, phu = cache[i]
        H0, W0 = nh.shape
        sx, sy = max(1, round(W0 * T.SK)) / W0, max(1, round(H0 * T.SK)) / H0
        dx, dy = T.DAT[i]
        src = lambda p: [k * (dx + (p[0] + 0.5) * sx), k * (dy + (p[1] + 0.5) * sy)]   # liên tục, tâm điểm ảnh nguồn
        J = D['frames'][i]['joints']
        nguon = {j: src(KN[i][n]) for j, n in KHOP_NGUON.items()}
        nguon['neck'] = src(phu['co']); nguon['chin'] = src(phu['cam']); nguon['hipCenter'] = src(phu['hong'])
        d = {j: [round(nguon[j][0] - k * J[j][0], 3), round(nguon[j][1] - k * J[j][1], 3)] for j in nguon if j in J}
        all_d += list(d.values())
        out.append(d)
    arr = np.array(all_d)
    med = np.median(arr, 0)
    # khớp không có trên ảnh nguồn (head, headTop, beltTop, waist): dời theo độ lệch trung vị
    for i in range(N):
        for j in D['frames'][i]['joints']:
            out[i].setdefault(j, [round(float(med[0]), 3), round(float(med[1]), 3)])
    du = np.hypot(arr[:, 0] - med[0], arr[:, 1] - med[1])
    return out, {'trungVi': [round(float(v), 3) for v in med], 'trungViTheo96': [round(float(v) / k, 3) for v in med],
                 'lechConLaiSauTrungVi': {'tb': round(float(du.mean()), 3), 'max': round(float(du.max()), 3)},
                 'lechTuyetDoi': {'tb': round(float(np.hypot(arr[:, 0], arr[:, 1]).mean()), 3),
                                  'max': round(float(np.hypot(arr[:, 0], arr[:, 1]).max()), 3)}}


# ============================== 3. GIÁP ==============================
def to_idx(im):
    a = np.asarray(im).astype(float)
    d = ((a[..., :3][..., None, :] - CENT[None, None]) ** 2).sum(3)
    return np.where(a[..., 3] > 0, d.argmin(2), -1)


def dinh_tan(idx):
    """Đinh tán = mảng đồng nhỏ, tròn, nằm giữa thép (ảnh gốc). Trả list (cy, cx, bán kính)."""
    br = np.isin(idx, DONG)
    lab, n = ndimage.label(br)
    out = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        m = lab[sl] == i
        A, (h, w) = int(m.sum()), m.shape
        if not (15 <= A <= 400 and max(h, w) <= 2.2 * min(h, w) and A >= 0.45 * h * w):
            continue
        full = lab == i
        ring = ndimage.binary_dilation(full, iterations=3) & ~full
        rv = idx[ring]
        if rv.size and np.isin(rv, THEP).mean() >= 0.6:
            cy, cx = ndimage.center_of_mass(full)
            out.append((cy, cx, math.sqrt(A / math.pi)))
    return out


def thu_nho(idx, W, H, k):
    h, w = idx.shape
    out = -np.ones((H, W), int)
    eo = np.zeros((H, W))
    bmin = 0.45 if k <= 1 else 0.35          # cỡ lớn: hạ ngưỡng đồng để đai/viền đồng mảnh không bị thép lấn
    for ty in range(H):
        for tx in range(W):
            y0, x0 = int(ty * h / H), int(tx * w / W)
            blk = idx[y0:max(y0 + 1, int((ty + 1) * h / H)), x0:max(x0 + 1, int((tx + 1) * w / W))]
            v = blk[blk >= 0]
            if v.size < 0.40 * blk.size:
                continue
            fo = (v == VIEN).mean(); eo[ty, tx] = fo
            inner = v[v != VIEN]
            if fo >= 0.5 or inner.size == 0:
                out[ty, tx] = VIEN; continue
            fb = np.isin(inner, DONG).mean()
            pool = DONG if fb >= bmin else THEP
            mean = CENT[inner[np.isin(inner, pool)]].mean(0)
            out[ty, tx] = int(min(pool, key=lambda i: ((CENT[i] - mean) ** 2).sum()))
    op = out >= 0
    st = {'epVien': 0, 'boLe': 0, 'dinhTan': 0}
    for ty in range(H):
        for tx in range(W):
            if not op[ty, tx]:
                continue
            bien = any(not (0 <= ty + dy < H and 0 <= tx + dx < W) or not op[ty + dy, tx + dx] for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if bien and out[ty, tx] != VIEN and eo[ty, tx] >= 0.12:
                out[ty, tx] = VIEN; st['epVien'] += 1
    # bỏ điểm lẻ không chạm điểm nào
    o2 = out.copy()
    for ty in range(H):
        for tx in range(W):
            if out[ty, tx] >= 0 and not any(0 <= ty + dy < H and 0 <= tx + dx < W and out[ty + dy, tx + dx] >= 0
                                            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                o2[ty, tx] = -1; st['boLe'] += 1
    # giữ đinh tán ở cỡ ≥ ×4: đinh rộng ~1 điểm ảnh đích -> đặt 1 điểm đồng sáng đúng tâm nếu đang là thép
    if k >= 4:
        sang = sorted(DONG, key=lambda i: CENT[i].sum())[1]          # đồng tông giữa
        for cy, cx, r in dinh_tan(idx):
            ty, tx = int(cy * H / h), int(cx * W / w)
            if 0 <= ty < H and 0 <= tx < W and o2[ty, tx] in THEP:
                o2[ty, tx] = sang; st['dinhTan'] += 1
    return o2, st


def anh_idx(o):
    H, W = o.shape
    a = np.zeros((H, W, 4), np.uint8)
    for i, c in enumerate(PAL):
        a[o == i] = c + (255,)
    return a


def nhan_goc(ten, idx):
    """Nhãn back/front trên ảnh GỐC (cùng luật R4 nhưng làm ở độ phân giải gốc):
    - xương tay/chân: dải dưới cùng mỗi cột, dày = 1 điểm ảnh của ô 96 (cao ảnh gốc / cao ảnh 96) = back; còn lại front.
    - giáp ngực: cổ áo sau = 30% cột đầu cổ × nửa dưới (phía lưng) = back; còn lại front."""
    h, w = idx.shape
    op = idx >= 0
    lab = np.zeros((h, w), np.uint8)       # 0 trống, 1 back, 2 front
    lab[op] = 2
    if ten == 'giap-nguc':
        yy, xx = np.mgrid[0:h, 0:w]
        lab[op & (xx < round(w * 0.30)) & (yy >= h / 2)] = 1
        luat = 'cổ áo sau: 30% cột đầu cổ × nửa dưới (phía lưng) = back; còn lại front'
    else:
        H96 = GEN['pieces'][ten]['size'][1]
        day = h / H96
        for x in range(w):
            ys = np.nonzero(op[:, x])[0]
            if ys.size:
                lab[:, x][op[:, x] & (np.arange(h) > ys.max() - day)] = 1
        luat = 'dải dưới cùng mỗi cột dày %.1f điểm ảnh gốc (= 1 điểm ảnh ô 96) = back; còn lại front' % day
    return lab, luat


def ha_nhan(lab, o):
    """Nhãn gốc → nhãn ảnh cỡ đích (mỗi điểm ảnh có hình: back nếu ≥ 35% điểm gốc có hình trong ô là back)."""
    h, w = lab.shape
    H, W = o.shape
    out = np.zeros((H, W, 4), np.uint8)
    for ty in range(H):
        for tx in range(W):
            if o[ty, tx] < 0:
                continue
            y0, x0 = int(ty * h / H), int(tx * w / W)
            blk = lab[y0:max(y0 + 1, int((ty + 1) * h / H)), x0:max(x0 + 1, int((tx + 1) * w / W))]
            v = blk[blk > 0]
            back = v.size and (v == 1).mean() >= 0.35
            out[ty, tx] = (DO if back else XANH) + (255,)
    return out


def ve_chup(D_, loai, k):
    """Chụp khớp vẽ lại ở cỡ đích: đĩa tròn, viền tối, vành đồng, vòm đổ bóng 3 tông (ánh sáng trên-trái), không chấm lẻ."""
    br = sorted(DONG, key=lambda i: CENT[i].sum()); st = sorted(THEP, key=lambda i: CENT[i].sum())
    vom = [st[-3], st[-2], st[-1]] if loai == 'khuyu' else [br[0], br[1], br[2]]
    vanh = br[1] if loai == 'khuyu' else br[0]
    ot = max(1, k // 2)                     # viền: 1 điểm ảnh ở 192, 2 ở 384
    rt = max(1, round(k * 0.5)) if loai == 'khuyu' else 0
    a = np.zeros((D_, D_, 4), np.uint8)
    c = D_ / 2; R = D_ / 2
    L = np.array([-0.55, -0.65, 0.52]); L /= np.linalg.norm(L)
    for y in range(D_):
        for x in range(D_):
            dx, dy = x + 0.5 - c, y + 0.5 - c
            d = math.hypot(dx, dy)
            if d > R - 0.15:
                continue
            if d > R - ot:
                a[y, x] = PAL[VIEN] + (255,); continue
            if d > R - ot - rt:
                a[y, x] = PAL[vanh] + (255,); continue
            r_in = R - ot - rt
            nx, ny = dx / r_in, dy / r_in
            nz = math.sqrt(max(0.0, 1 - nx * nx - ny * ny))
            s = nx * L[0] + ny * L[1] + nz * L[2]
            t = 0 if s < 0.35 else (1 if s < 0.75 else 2)
            a[y, x] = PAL[vom[t]] + (255,)
    return a


CAP_D = {'nho': {'chup-vai': 5, 'chup-khuyu': 4, 'chup-goi': 4}, 'gon': {'chup-vai': 5, 'chup-khuyu': 5, 'chup-goi': 5},
         'to': {'chup-vai': 7, 'chup-khuyu': 7, 'chup-goi': 7}}


def tach_luot(rgba, nhan, stem):
    """Tách ảnh theo nhãn ra 3 lượt; kiểm ghép lại = ảnh gốc. Trả số điểm ảnh mỗi lượt."""
    dem = {}
    ghep = np.zeros_like(rgba)
    for v, col in (('back', DO), ('front', XANH), ('trong', (0, 255, 0))):
        m = (nhan[..., 3] > 0) & (nhan[..., 0] == col[0]) & (nhan[..., 1] == col[1]) & (nhan[..., 2] == col[2]) & (rgba[..., 3] > 0)
        o = np.zeros_like(rgba); o[m] = rgba[m]
        luu(o, stem + '-%s.png' % v)
        dem[v] = int(m.sum()); ghep[m] = rgba[m]
    if (ghep != np.where(rgba[..., 3:] > 0, rgba, 0)).any():
        raise SystemExit('ghép lượt lệch ảnh gốc: ' + stem)
    if (rgba[..., 3] > 0).sum() != sum(dem.values()):
        raise SystemExit('có điểm ảnh chưa có nhãn: ' + stem)
    return dem


def giap(k, goc):
    W96 = 96 * k
    d_img, d_nhan, d_pass = ('co-lon/%s-%d' % (s, W96) for s in ('giap', 'nhan', 'pass'))
    meta, images = {}, {}
    for ten in MANH:
        idx, lab = goc[ten]['idx'], goc[ten]['lab']
        p = GEN['pieces'][ten]
        f0, f1 = ANCHOR_FRAC[ten]
        Wd = max(4, round(k * p['avgBoneLen96'] / (f1 - f0)))
        Hd = max(3, round(Wd * idx.shape[0] / idx.shape[1]))
        o, st = thu_nho(idx, Wd, Hd, k)
        rgba = anh_idx(o)
        luu(rgba, os.path.join(RIG, d_img, ten + '.png'))
        nh = ha_nhan(lab, o)
        luu(nh, os.path.join(RIG, d_nhan, ten + '.png'))
        dem = tach_luot(rgba, nh, os.path.join(RIG, d_pass, ten))
        meta[ten] = {'size': [Wd, Hd], 'anchorStart': [round(f0 * Wd, 2), round(Hd / 2, 2)], 'anchorEnd': [round(f1 * Wd, 2), round(Hd / 2, 2)],
                     'thicknessScale': 1.0, 'mau': len(set(o[o >= 0].tolist())), 'diemAnh': int((o >= 0).sum()), 'don': st, 'luot': dem}
        images[ten] = '%s/%s.png' % (d_img, ten)
        for v in ('back', 'front', 'trong'):
            images['%s-%s' % (ten, v)] = '%s/%s-%s.png' % (d_pass, ten, v)
    for co, bo in CAP_D.items():
        for ten, d96 in bo.items():
            s = '%s-%s' % (ten, co)
            rgba = ve_chup(d96 * k, ten.split('-')[1], k)
            luu(rgba, os.path.join(RIG, d_img, s + '.png'))
            nh = np.zeros_like(rgba); nh[rgba[..., 3] > 0] = XANH + (255,)
            luu(nh, os.path.join(RIG, d_nhan, s + '.png'))
            dem = tach_luot(rgba, nh, os.path.join(RIG, d_pass, s))
            meta[s] = {'size': [d96 * k, d96 * k], 'luot': dem}
            images[s] = '%s/%s.png' % (d_img, s)
            for v in ('back', 'front', 'trong'):
                images['%s-%s' % (s, v)] = '%s/%s-%s.png' % (d_pass, s, v)
    return meta, images


def nhan_96(goc):
    """Nhãn cỡ 96 của bộ Gen cũng hạ từ nhãn gốc (ghi nhan/gen/<mảnh>.png, trạng thái 'tu-goc')."""
    so_p = os.path.join(RIG, 'nhan', 'nhan.json')
    so = json.load(open(so_p, encoding='utf-8')) if os.path.exists(so_p) else {}
    out = {}
    for ten in MANH:
        key = 'gen/' + ten
        if so.get(key, {}).get('trangThai') == 'da-duyet':
            continue
        art = to_idx(Image.open(os.path.join(RIG, 'giap-gen', ten + '.png')).convert('RGBA'))
        nh = ha_nhan(goc[ten]['lab'], art)
        luu(nh, os.path.join(RIG, 'nhan', 'gen', ten + '.png'))
        so[key] = dict(so.get(key, {}), trangThai='tu-goc', luat='hạ từ nhãn ảnh gốc nhan/goc/%s.png (%s)' % (ten, goc[ten]['luat']))
        out[ten] = {'back': int((nh[..., 0] == 255).sum()), 'front': int((nh[..., 2] == 255).sum())}
    json.dump(so, open(so_p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    goc = {}
    for ten in MANH:
        im = Image.open(os.path.join(RIG, 'giap-gen', 'goc-%s.png' % ten)).convert('RGBA')
        idx = to_idx(im)
        lab, luat = nhan_goc(ten, idx)
        img = np.zeros(idx.shape + (4,), np.uint8)
        img[lab == 1] = DO + (255,); img[lab == 2] = XANH + (255,)
        luu(img, os.path.join(RIG, 'nhan', 'goc', ten + '.png'))
        goc[ten] = {'idx': idx, 'lab': lab, 'luat': luat, 'size': list(im.size), 'dinhTan': len(dinh_tan(idx)),
                    'back': int((lab == 1).sum()), 'front': int((lab == 2).sum())}
    n96 = nhan_96(goc)
    cache = [T.tach(i, KN[i]) for i in range(N)]
    for i in range(N):
        cache[i] = (cache[i][0], cache[i][1], cache[i][2])
    muc = {'about': 'Chế độ Độ phân giải cao (tao-co-lon.py). Toạ độ khớp cỡ k = data.json × k + khop-co-lon.json[k].',
           'nhanGoc': {t: {kk: v for kk, v in g.items() if kk in ('luat', 'size', 'dinhTan', 'back', 'front')} for t, g in goc.items()},
           'nhan96TuGoc': n96, 'co': {}}
    khop_file = {'about': 'TỆP CHỈNH KHỚP cho cỡ lớn. Khớp cỡ k = data.json × k + lech[k][khung][khớp]. '
                          'Lệch = khớp đánh tay trên ảnh nguồn (khop-nguon.json, tâm điểm ảnh) đổi sang cỡ k trừ data.json × k. '
                          'Khớp không đánh tay (head, headTop, beltTop, waist) dời theo trung vị.', 'lech': {}, 'thongKe': {}}
    for W96, k in CO.items():
        paths, st = than(k, cache)
        lech, tk = khop(k, cache)
        khop_file['lech'][str(W96)] = lech
        khop_file['thongKe'][str(W96)] = tk
        meta, images = giap(k, goc)
        muc['co'][str(W96)] = {'k': k, 'W': W96, 'than': paths, 'thanThongKe': st, 'giap': meta, 'images': images}
        print('cỡ %d: thân %d lớp (theo lớp 96 cùng nhóm %d%%, đổi theo nhóm %d, gần nhất %d) | khớp lệch trung vị %s (= %s ô 96), còn lại tb %.2f max %.2f'
              % (W96, len(paths), round(100 * sum(s['theoLop96CungNhom'] for s in st) / sum(s['diemAnh'] for s in st)),
                 sum(s['doiTheoNhom'] for s in st), sum(s['ganNhat'] for s in st), tk['trungVi'], tk['trungViTheo96'],
                 tk['lechConLaiSauTrungVi']['tb'], tk['lechConLaiSauTrungVi']['max']))
        for t in MANH:
            m = meta[t]
            print('   %-14s %3d×%-3d màu %d điểm %4d | ép viền %d, bỏ lẻ %d, đinh tán %d | back %d front %d'
                  % (t, *m['size'], m['mau'], m['diemAnh'], m['don']['epVien'], m['don']['boLe'], m['don']['dinhTan'], m['luot']['back'], m['luot']['front']))
    json.dump(khop_file, open(os.path.join(OUT, 'khop-co-lon.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(muc, open(os.path.join(OUT, 'co-lon.json'), 'w'), ensure_ascii=False, indent=1)
    print('nhãn gốc:', {t: (g['back'], g['front'], g['dinhTan']) for t, g in goc.items()}, '| nhãn 96 hạ từ gốc:', n96)


if __name__ == '__main__':
    main()
