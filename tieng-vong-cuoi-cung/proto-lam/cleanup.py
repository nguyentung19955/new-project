#!/usr/bin/env python3
"""PHẦN B – thử bước PIXEL-ART CLEANUP theo bộ phận + theo thời gian cho Run F0, F1 (chỉ 2 khung xuất ra).
Cách làm: KHÔNG sửa proto.html. Dùng dữ liệu THÔ 64×64 trước hậu kỳ (ci = chỉ số màu sau toon + gộp 2×2, id = bộ phận, dep = độ sâu)
mà danh-gia-chup.py đã bọc lam.hauKy lấy ra (out/danh-gia/raw/run-F-raw.npz), rồi làm lại toàn bộ hậu kỳ bằng Python:
  1. dọn pixel lẻ theo ID (pixel ID lạc không dính nhóm mình → nhận nhóm/màu lân cận; đốm 1 px không dính gì → bỏ; trừ bộ phận bảo vệ)
  2. ramp màu RIÊNG từng bộ phận (bảng tra tông → màu, chỉ 12 màu): mũ tối (#1A212B/#212835), áo choàng sáng hơn mũ 1 bậc, tay/găng xám sáng (#2C3546/#4A5A6E),
     quần gần sáng hơn quần xa, ủng gần #212835 / ủng xa #1A212B, đai tối, thân xanh giữ nguyên
  3. viền trong BẮT BUỘC giữa 2 nhóm kề nhau khi màu trùng hoặc cùng họ xám chênh ≤ 1 bậc; viền đặt lên pixel xa camera hơn,
     nhưng không đặt lên bộ phận mỏng ≤ 2 px (đổi sang bên kia) và không bao giờ lên bộ phận bảo vệ
  4. giữ pixel tối thiểu: 2 mắt (vị trí lấy từ khung pipeline), chắn kiếm ≥ 1 px vàng, trâm 1–2 px sáng, vạch ủng ≥ 2 px (vị trí từ ID 512 nếu ở 64 bị mất),
     dây chuông liền từ chuông tới mũ (nối Bresenham nếu đứt), viền xanh ở mép mũ quanh khoang mặt + mép trên (như mẫu)
  5. dọn đốm màu lẻ trong cùng nhóm (3/4 lân cận cùng nhóm cùng màu)
  6. ổn định THỜI GIAN: xử lý cả 8 khung, với pixel có (id, màu) chỉ tồn tại 1 khung mà 2 khung kề giống nhau VÀ là đốm ≤ 3 px → lấy giá trị 2 khung kề (đa số 3 khung)
  7. viền ngoài 1 px #0C0F14
Xuất: out/danh-gia/run-0-moi.png, run-1-moi.png (64×64), so-sanh-cu-moi-x4.png, so-sanh-cu-moi-x8.png (cũ trên / mới dưới / mẫu gốc thu 64 bên phải),
      trong-game-x1.png (480×270, không phóng), trong-game-x4.png, cleanup-so-lieu.json
Không ghi đè out/run/*, không đụng game/*, art/sprite/*, tools/*.
Chạy: python3 proto-lam/danh-gia-chup.py (nếu chưa có raw/) rồi python3 proto-lam/cleanup.py
"""
import importlib.util, json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
DG = os.path.join(HERE, 'out', 'danh-gia'); RAW = os.path.join(DG, 'raw')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
PAL_TEN = ['vien', 'ao0', 'ao1', 'ao2', 'xam', 'x0', 'x1', 'x2', 'v0', 'v1', 'v2', 'sang']
PAL = ['#0C0F14', '#1A212B', '#212835', '#2C3546', '#4A5A6E', '#21413A', '#32804F', '#83CC93', '#9C6B30', '#E1B85A', '#F3E6C8', '#CEF0D6']
PAL_RGB = np.array([[int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)] for h in PAL], np.uint8)
P = {t: i for i, t in enumerate(PAL_TEN)}
NEN = (42, 36, 51, 255)
N = 64
# ID (proto.html)
MAT, MU, VIENMU, THAN, AO, TAYG, TAYX, CHANG, CHANX, LUOI, CHUOI, CHUONG, DAY, THATLUNG, VACHG, VACHX, TRAM, UNGG, UNGX = range(1, 20)
NHOM = {MAT: 'dau', MU: 'dau', VIENMU: 'dau', THAN: 'than', THATLUNG: 'than', TRAM: 'than', AO: 'ao', TAYG: 'tayG', TAYX: 'tayX', CHANG: 'chanG', VACHG: 'chanG', UNGG: 'chanG',
        CHANX: 'chanX', VACHX: 'chanX', UNGX: 'chanX', LUOI: 'kiem', CHUOI: 'kiem', CHUONG: 'chuong', DAY: 'chuong'}
BAOVE = {LUOI, CHUOI, CHUONG, DAY, VACHG, VACHX, TRAM, MAT}
# họ màu: tông = vị trí trong họ
HO = {'xam': [P['vien'], P['ao0'], P['ao1'], P['ao2'], P['xam']], 'xanh': [P['x0'], P['x1'], P['x2']], 'vang': [P['v0'], P['v1'], P['v2']], 'sang': [P['sang']]}
HO_CUA = {}
for h, l in HO.items():
    for t, c in enumerate(l): HO_CUA[c] = (h, t)
# bảng tra ramp riêng từng bộ phận: họ xám 5 tông (vien, ao0, ao1, ao2, xam) → màu mới; họ khác giữ nguyên trừ khi ghi
RAMP = {
    MU: ['vien', 'ao0', 'ao0', 'ao1', 'ao1'],           # mũ tối, 2 tông (mẫu: #1A212B thân mũ, #212835 nếp)
    VIENMU: ['vien', 'ao0', 'ao0', 'ao1', 'ao1'],
    MAT: ['vien', 'vien', 'vien', 'vien', 'vien'],
    AO: ['vien', 'ao1', 'ao1', 'ao2', 'ao2'],           # áo choàng sáng hơn mũ 1 bậc → tách mũ/áo
    THAN: None,                                         # xanh giữ nguyên
    THATLUNG: ['vien', 'vien', 'ao0', 'ao0', 'ao0'],    # đai tối trên nền xanh
    TAYG: ['ao0', 'ao1', 'ao2', 'ao2', 'xam'],          # tay xa: xám trung
    TAYX: ['ao1', 'ao2', 'xam', 'xam', 'xam'],          # tay gần: găng/ống tay xám sáng #4A5A6E như mẫu
    CHANG: ['ao0', 'ao0', 'ao1', 'ao1', 'ao2'],         # quần xa
    CHANX: ['ao1', 'ao2', 'ao2', 'xam', 'xam'],         # quần gần sáng hơn
    UNGG: ['vien', 'ao0', 'ao0', 'ao0', 'ao1'],         # ủng xa tối
    UNGX: ['ao0', 'ao1', 'ao1', 'ao1', 'ao2'],          # ủng gần
}
RAMP_XANH = {AO: ['x0', 'x1', 'x1'], THAN: ['x0', 'x1', 'x1'], VACHG: ['x1', 'x1', 'x1'], VACHX: ['x1', 'x1', 'x1']}
N4 = ((0, 1), (0, -1), (1, 0), (-1, 0))


def chu(c):
    try: return ImageFont.truetype(FONT, c)
    except Exception: return ImageFont.load_default()


def pal_idx(rgb):
    d = ((rgb[..., None, :].astype(int) - PAL_RGB[None, None].astype(int)) ** 2).sum(-1)
    return d.argmin(-1)


def nap(i):
    r = np.load(os.path.join(RAW, 'run-%d-raw.npz' % i))
    ci, idm, dep = r['ci'].astype(int)[:, ::-1].copy(), r['id'].astype(int)[:, ::-1].copy(), r['dep'][:, ::-1].copy()   # lật ngang như khung xuất
    cuoi = np.array(Image.open(os.path.join(RAW, 'run-%d-cuoi.png' % i)).convert('RGBA'))
    idCuoi = np.load(os.path.join(RAW, 'run-%d-id.npy' % i)).astype(int)
    id512 = np.array(Image.open(os.path.join(RAW, 'run-%d-512id.png' % i)).convert('RGBA'))[..., 0].astype(int)
    return ci, idm, dep, cuoi, id512, idCuoi


def nhom(idm):
    g = np.full(idm.shape, -1)
    ten = sorted(set(NHOM.values()))
    for i, n in NHOM.items(): g[idm == i] = ten.index(n)
    return g


def lang_gieng(a, dy, dx, fill):
    o = np.full(a.shape, fill, dtype=a.dtype)
    H, W = a.shape
    ys, yd = (slice(dy, H), slice(0, H - dy)) if dy >= 0 else (slice(0, H + dy), slice(-dy, H))
    xs, xd = (slice(dx, W), slice(0, W - dx)) if dx >= 0 else (slice(0, W + dx), slice(-dx, W))
    o[yd, xd] = a[ys, xs]
    return o


def be_day(idm):
    """bề dày nhóm tại mỗi pixel = min(chiều dài chạy ngang, dọc) của cùng nhóm"""
    g = nhom(idm); out = np.zeros(idm.shape, int)
    for y in range(N):
        x = 0
        while x < N:
            if g[y, x] < 0: x += 1; continue
            x2 = x
            while x2 < N and g[y, x2] == g[y, x]: x2 += 1
            out[y, x:x2] = x2 - x; x = x2
    for x in range(N):
        y = 0
        while y < N:
            if g[y, x] < 0: y += 1; continue
            y2 = y
            while y2 < N and g[y2, x] == g[y, x]: y2 += 1
            out[y:y2, x] = np.minimum(out[y:y2, x], y2 - y); y = y2
    return out


# ---------------------------------------------------------------- các bước
def b1_don_id(ci, idm, dep, so):
    """pixel ID lạc: không có lân cận 4 cùng nhóm → nhận nhóm + màu của lân cận 4 đa số (trừ bảo vệ); đốm không dính gì → bỏ"""
    g = nhom(idm); doi = 0; bo = 0
    for y in range(N):
        for x in range(N):
            if idm[y, x] == 0 or idm[y, x] in BAOVE: continue
            lk = [(y + dy, x + dx) for dy, dx in N4 if 0 <= y + dy < N and 0 <= x + dx < N and idm[y + dy, x + dx] > 0]
            if any(g[p] == g[y, x] for p in lk): continue
            if not lk:
                c8 = sum(1 for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy or dx) and 0 <= y + dy < N and 0 <= x + dx < N and idm[y + dy, x + dx] > 0)
                if c8 <= 1: idm[y, x] = 0; ci[y, x] = -1; bo += 1
                continue
            # lân cận đa số (không lấy bộ phận bảo vệ làm nguồn nếu còn lựa chọn khác)
            lk2 = [p for p in lk if idm[p] not in BAOVE] or lk
            ids = [idm[p] for p in lk2]; best = max(set(ids), key=ids.count)
            src = next(p for p in lk2 if idm[p] == best)
            idm[y, x] = best; ci[y, x] = ci[src]; dep[y, x] = dep[src]; doi += 1
    so['b1_idLacDoi'] = doi; so['b1_domBo'] = bo


def b2_ramp(ci, idm, so):
    doi = 0
    for y in range(N):
        for x in range(N):
            i = idm[y, x]
            if i == 0 or ci[y, x] < 0: continue
            ho, t = HO_CUA.get(ci[y, x], (None, 0))
            moi = None
            if ho == 'xam' and RAMP.get(i): moi = P[RAMP[i][t]]
            elif ho == 'xanh' and i in RAMP_XANH: moi = P[RAMP_XANH[i][t]]
            if moi is not None and moi != ci[y, x]: ci[y, x] = moi; doi += 1
    so['b2_pxDoiMau'] = doi


def b3_vien_trong(ci, idm, dep, so):
    g = nhom(idm); day = be_day(idm); mark = np.zeros((N, N), bool); dem = {}
    for y in range(N):
        for x in range(N):
            if idm[y, x] == 0: continue
            for dy, dx in ((0, 1), (1, 0)):
                y2, x2 = y + dy, x + dx
                if y2 >= N or x2 >= N or idm[y2, x2] == 0 or g[y2, x2] == g[y, x]: continue
                a, b = ci[y, x], ci[y2, x2]
                ha, ta = HO_CUA.get(a, (None, 0)); hb, tb = HO_CUA.get(b, (None, 0))
                can = (a == b) or (ha == 'xam' and hb == 'xam' and abs(ta - tb) <= 1)
                # mũ ↔ áo choàng, chân gần ↔ chân xa, tay ↔ thân: luôn cần ranh giới
                cap = {NHOM[idm[y, x]], NHOM[idm[y2, x2]]}
                if cap in ({'dau', 'ao'}, {'chanG', 'chanX'}, {'tayX', 'than'}, {'tayG', 'than'}, {'ao', 'chanG'}, {'ao', 'chanX'}): can = True
                if not can: continue
                p1, p2 = (y, x), (y2, x2)
                xa, gan = (p1, p2) if dep[p1] > dep[p2] else (p2, p1)
                # gấu áo thân ↔ chân: viền lên gấu áo (chân giữ màu)
                if {NHOM[idm[p1]], NHOM[idm[p2]]} in ({'than', 'chanG'}, {'than', 'chanX'}): xa, gan = (p1, p2) if NHOM[idm[p1]] == 'than' else (p2, p1)
                if idm[xa] in BAOVE or (day[xa] <= 2 and day[gan] > 2): xa, gan = gan, xa
                if idm[xa] in BAOVE or ci[xa] == P['vien']: continue
                # không đặt viền lên pixel kề pixel đã là #0C0F14 của chính bộ phận bên kia (viền sẽ chìm) – đổi bên nếu được
                if ci[gan] == P['vien'] and idm[gan] not in BAOVE: continue
                mark[xa] = True; k = ' ↔ '.join(sorted(cap)); dem[k] = dem.get(k, 0) + 1
    ci[mark] = P['vien']
    so['b3_pxVienTrong'] = int(mark.sum()); so['b3_theoCap'] = dem
    return mark


def b4_chi_tiet(ci, idm, dep, cuoi, id512, idCuoi, so):
    ghi = {}
    # mắt: lấy đúng 2 vị trí pipeline đã chấm (id mắt + màu #F3E6C8), vẽ lại
    mat = np.where((idCuoi == MAT) & (cuoi[..., 0] == 0xF3) & (cuoi[..., 1] == 0xE6) & (cuoi[..., 2] == 0xC8))
    for y, x in zip(*mat): ci[y, x] = P['v2']; idm[y, x] = MAT
    ghi['mat'] = len(mat[0])
    # viền xanh mũ: mép trên/trái ngoài (như pipeline) + pixel mũ kề khoang mặt (mép mũ quanh mặt như mẫu), không đè mắt
    vx = 0
    for y in range(N):
        for x in range(N):
            if idm[y, x] not in (MU, VIENMU): continue
            ngoai = (x > 0 and idm[y, x - 1] == 0) or (y > 0 and idm[y - 1, x] == 0)
            # mép mũ quanh mặt chỉ ở phía TRÊN và phía TRƯỚC khoang mặt (mẫu), không vòng xuống dưới cằm
            keMat = any(0 <= y + dy < N and 0 <= x + dx < N and idm[y + dy, x + dx] == MAT and ci[y + dy, x + dx] == P['vien'] for dy, dx in ((1, 0), (0, -1)))
            if ngoai or keMat: ci[y, x] = P['x1']; vx += 1
    ghi['vienXanhMu'] = vx
    # chắn kiếm: giữ pixel chuôi vàng của pipeline (đã có bước chống nhấp nháy), bảo đảm ≥ 1 px v1
    ch = np.where(idCuoi == CHUOI)
    chuoi = [(y, x) for y, x in zip(*ch) if idm[y, x] not in (CHUONG, DAY, MAT)]
    for y, x in chuoi: ci[y, x] = P['v1']; idm[y, x] = CHUOI
    ghi['chuoi'] = len(chuoi)
    # trâm: 1–2 px sáng: giữ tối đa 2 px gần tâm (mẫu: trâm nhỏ), nếu 0 px mà ID 512 có → đặt 1 px tại tâm
    tr = np.where(idm == TRAM)
    if len(tr[0]) > 2:
        cy, cx = tr[0].mean(), tr[1].mean(); d = (tr[0] - cy) ** 2 + (tr[1] - cx) ** 2; giu = set(np.argsort(d)[:2])
        for k, (y, x) in enumerate(zip(*tr)):
            if k not in giu: idm[y, x] = THAN; ci[y, x] = P['x1']
    elif len(tr[0]) == 0:
        m = id512 == TRAM
        if m.sum() > 8:
            ys, xs = np.where(m); y, x = int(ys.mean() // 8), int(xs.mean() // 8)
            if idm[y, x] in (THAN, THATLUNG, AO): idm[y, x] = TRAM; ci[y, x] = P['sang']
    for y, x in zip(*np.where(idm == TRAM)): ci[y, x] = P['sang']
    ghi['tram'] = int((idm == TRAM).sum())
    # vạch ủng: mỗi ủng ≥ 2 px x1; nếu thiếu, thêm từ ô 64 mà ID 512 có vạch ≥ 25 % và ô đó thuộc cùng chân
    for vach, ung, chan in ((VACHG, UNGG, CHANG), (VACHX, UNGX, CHANX)):
        n0 = int((idm == vach).sum()); them = 0
        if n0 < 2:
            cov = (id512 == vach).reshape(N, 8, N, 8).mean(axis=(1, 3))
            for y, x in zip(*np.where(cov >= 0.25)):
                if idm[y, x] in (ung, chan) and (idm == vach).sum() < 3: idm[y, x] = vach; them += 1
        for y, x in zip(*np.where(idm == vach)): ci[y, x] = P['x1']
        ghi['vach_%s' % NHOM[vach]] = {'co': n0, 'them': them}
    # dây chuông liền: nếu thành phần chuông+dây không chạm mũ (8 lân cận) → nối Bresenham v1 từ đỉnh dây tới pixel mũ gần nhất
    cd = np.isin(idm, [CHUONG, DAY]); lab, nl = ndimage.label(cd, structure=np.ones((3, 3)))
    mu = np.isin(idm, [MU, VIENMU]); muD = ndimage.binary_dilation(mu, structure=np.ones((3, 3)))
    noi = 0
    if nl and not (cd & muD).any():
        ys, xs = np.where(idm == DAY)
        if len(ys) == 0: ys, xs = np.where(idm == CHUONG)
        k = np.argmin(ys); y0, x0 = ys[k], xs[k]
        my, mx = np.where(mu); d = (my - y0) ** 2 + (mx - x0) ** 2; j = np.argmin(d); y1, x1 = my[j], mx[j]
        n = max(abs(y1 - y0), abs(x1 - x0))
        for s in range(1, n):
            y, x = round(y0 + (y1 - y0) * s / n), round(x0 + (x1 - x0) * s / n)
            if idm[y, x] == 0: idm[y, x] = DAY; ci[y, x] = P['v1']; noi += 1
    ghi['dayNoiThem'] = noi
    so['b4'] = ghi


def b5_dom_mau(ci, idm, so):
    g = nhom(idm); ci2 = ci.copy(); doi = 0
    for y in range(1, N - 1):
        for x in range(1, N - 1):
            if idm[y, x] == 0 or idm[y, x] in BAOVE: continue
            lk = [(y + dy, x + dx) for dy, dx in N4]
            cung = [p for p in lk if g[p] == g[y, x]]
            if len(cung) < 3: continue
            mau = [ci[p] for p in cung]
            if len(set(mau)) == 1 and mau[0] != ci[y, x] and mau[0] != P['vien']:
                ci2[y, x] = mau[0]; doi += 1
    ci[:] = ci2; so['b5_domMauDoi'] = doi


def b6_thoi_gian(frames, so):
    """frames: list (ci, idm) 8 khung đã xử lý 1–5. Pixel có (id, ci) chỉ tồn tại 1 khung, 2 khung kề giống nhau, là đốm ≤ 3 px → lấy giá trị khung kề"""
    key = [f[1] * 100 + (f[0] + 1) for f in frames]
    doi = [0] * 8; moi = []
    for i in range(8):
        cur, prv, nxt = key[i], key[(i - 1) % 8], key[(i + 1) % 8]
        le = (cur != prv) & (cur != nxt) & (prv == nxt)
        lab, nl = ndimage.label(le, structure=np.ones((3, 3)))
        ci, idm = frames[i][0].copy(), frames[i][1].copy()
        if nl:
            kich = np.bincount(lab.ravel())[1:]
            dom = np.isin(lab, 1 + np.where(kich <= 3)[0])
            # không đụng bộ phận bảo vệ ở khung này hoặc khung kề (chuông, kiếm dao động thật)
            bv = np.isin(idm, list(BAOVE)) | np.isin(frames[(i - 1) % 8][1], list(BAOVE))
            dom &= ~bv
            pc, pi = frames[(i - 1) % 8]
            ci[dom] = pc[dom]; idm[dom] = pi[dom]; doi[i] = int(dom.sum())
        moi.append((ci, idm))
    so['b6_pxOnDinhTheoKhung'] = doi
    return moi


def b7_xuat(ci, idm):
    px = np.zeros((N, N, 4), np.uint8)
    co = idm > 0
    px[co, :3] = PAL_RGB[np.clip(ci[co], 0, 11)]; px[co, 3] = 255
    nb = np.zeros((N, N), bool)
    for dy, dx in N4: nb |= lang_gieng(co, dy, dx, False)
    v = nb & ~co; px[v] = (12, 15, 20, 255)
    return px


# ---------------------------------------------------------------- ghép ảnh
def to_x(a, s):
    im = Image.fromarray(a, 'RGBA') if isinstance(a, np.ndarray) else a
    return im.resize((im.width * s, im.height * s), Image.NEAREST)


def so_sanh(cu, moi, goc, S, duong):
    f = chu(12); W = 3 * (N * S + 12) + 12; H = 2 * (N * S + 26) + 12
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out)
    for r, (hang, nhan) in enumerate(((cu, 'CŨ (pipeline hiện tại)'), (moi, 'MỚI (cleanup.py)'))):
        y = 12 + r * (N * S + 26)
        for c, a in enumerate(hang + [goc]):
            x = 12 + c * (N * S + 12)
            out.alpha_composite(to_x(a, S), (x, y + 14)); dr.rectangle([x, y + 14, x + N * S - 1, y + 14 + N * S - 1], outline=(70, 80, 95, 255))
            dr.text((x, y), ['F0 ' + nhan, 'F1 ' + nhan, 'Mẫu gốc thu về 64 (tham chiếu, chưa dọn)'][c], font=f, fill=(230, 230, 230, 255))
    out.save(duong)


def trong_game(cu, moi):
    spec = importlib.util.spec_from_file_location('build', os.path.join(HERE, 'build.py')); b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
    nen = b.ghep_nen().convert('RGBA'); DAT = 241
    xs = [60, 130, 230, 300]
    for k, a in enumerate(cu + moi): nen.alpha_composite(Image.fromarray(a, 'RGBA'), (xs[k] - 32, DAT - 63))
    x1 = nen.copy(); x1.save(os.path.join(DG, 'trong-game-x1.png'))
    big = nen.resize((480 * 4, 270 * 4), Image.NEAREST); d = ImageDraw.Draw(big); f = chu(22)
    for k, x in enumerate(xs): d.text((x * 4 - 40, DAT * 4 + 12), ['F0 cũ', 'F1 cũ', 'F0 mới', 'F1 mới'][k], font=f, fill=(243, 230, 200, 255), stroke_width=3, stroke_fill=(12, 15, 20, 255))
    d.text((12, 12), 'trong-game-x4.png · nền Làng Chuông 480×270 phóng ×4 · trái: pipeline hiện tại · phải: sau cleanup.py', font=f, fill=(230, 235, 240, 255), stroke_width=3, stroke_fill=(12, 15, 20, 255))
    big.save(os.path.join(DG, 'trong-game-x4.png'))


if __name__ == '__main__':
    so = {'khung': {}}
    xuly = []; cu = []
    for i in range(8):
        ci, idm, dep, cuoi, id512, idCuoi = nap(i); s = {}
        b1_don_id(ci, idm, dep, s); b2_ramp(ci, idm, s); b3_vien_trong(ci, idm, dep, s); b4_chi_tiet(ci, idm, dep, cuoi, id512, idCuoi, s); b5_dom_mau(ci, idm, s)
        xuly.append((ci, idm)); cu.append(cuoi); so['khung'][i] = s
    moi = b6_thoi_gian(xuly, so)
    out = [b7_xuat(*moi[i]) for i in range(8)]
    for i in (0, 1): Image.fromarray(out[i], 'RGBA').save(os.path.join(DG, 'run-%d-moi.png' % i))
    goc = np.array(Image.open(os.path.join(DG, 'goc-64.png')).convert('RGBA'))
    so_sanh([cu[0], cu[1]], [out[0], out[1]], goc, 4, os.path.join(DG, 'so-sanh-cu-moi-x4.png'))
    so_sanh([cu[0], cu[1]], [out[0], out[1]], goc, 8, os.path.join(DG, 'so-sanh-cu-moi-x8.png'))
    trong_game([cu[0], cu[1]], [out[0], out[1]])
    # kiểm: màu, alpha, nhấp nháy F0↔F1
    tat = set()
    for i in (0, 1): tat |= set(map(tuple, out[i].reshape(-1, 4)))
    so['mau'] = sorted('#%02X%02X%02X' % c[:3] for c in tat if c[3]); so['mauNgoaiBang'] = [m for m in so['mau'] if m not in PAL]; so['alpha'] = sorted(set(c[3] for c in tat))
    k = lambda a: (a[..., 0].astype(int) << 16) | (a[..., 1].astype(int) << 8) | a[..., 2].astype(int) | (a[..., 3].astype(int) << 24)
    def le(a, b, c):
        m = (k(b) != k(a)) & (k(b) != k(c)) & (k(a) == k(c)); lab, nl = ndimage.label(m, structure=np.ones((3, 3)))
        kich = np.bincount(lab.ravel())[1:] if nl else np.array([], int)
        return int(m.sum()), int(kich[kich <= 3].sum())
    so['F0_chi1Khung_cu'] = le(cu[7], cu[0], cu[1]); so['F1_chi1Khung_cu'] = le(cu[0], cu[1], cu[2])
    so['F0_chi1Khung_moi'] = le(out[7], out[0], out[1]); so['F1_chi1Khung_moi'] = le(out[0], out[1], out[2])
    so['F0F1_khac_cu'] = int((k(cu[0]) != k(cu[1])).sum()); so['F0F1_khac_moi'] = int((k(out[0]) != k(out[1])).sum())
    # màu theo nhóm sau cleanup F0
    mn = {}
    ci, idm = moi[0]
    for g in sorted(set(NHOM.values())):
        m = np.isin(idm, [i for i, gg in NHOM.items() if gg == g])
        if m.any():
            cnt = np.bincount(ci[m], minlength=12); mn[g] = {PAL[j]: int(cnt[j]) for j in np.argsort(-cnt) if cnt[j]}
    so['mauTheoNhomF0Moi'] = mn
    json.dump(so, open(os.path.join(DG, 'cleanup-so-lieu.json'), 'w'), indent=1, ensure_ascii=False, default=int)
    print(json.dumps({kk: v for kk, v in so.items() if kk not in ('khung', 'mauTheoNhomF0Moi')}, ensure_ascii=False, default=int))
    print(json.dumps(so['khung'][0], ensure_ascii=False)); print(json.dumps(mn, ensure_ascii=False))
