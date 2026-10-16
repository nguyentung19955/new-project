#!/usr/bin/env python3
"""NẠP ĐỒ GEN THẬT (ảnh chủ game gen, cùng cỡ tấm gốc 2172×724 nền #00FF00) thành bộ đồ / bộ giáp thay được.

Chạy (ở thư mục gốc repo), rồi dựng lại:
    python3 docs/thu-modular-96/nap-do-gen-that.py
    python3 docs/thu-modular-96/tao-bo.py

Đọc (chỉ đọc):
    anh-gen/cu-ti-do-xanh-chay-12.png  Cu Tí đồ võ xanh, 12 khung      → bộ đồ "gen-xanh" (áo + đai + quần)
    anh-gen/cu-ti-giap-chay-12.png     Cu Tí đồ đen + giáp ngực/vai     → bộ giáp "gen-tach" (tách bằng so khác với Cu Tí gốc)
    anh-gen/giap-chay-12-a.png / -b.png giáp rời                        → bộ giáp "gen-mot-anh" (1 ảnh + neo, chỉ dời)
    docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-XX.png        khung nguồn của hàng chạy (để căn)
    data.json, sheets/do-goc/*.png, hàng chạy trong game                (vùng đồ gốc, khớp, neo)

Cách căn mỗi khung (ảnh gen KHÔNG trùng vị trí/cỡ hình với tấm gốc dù cùng cỡ tấm, nên không cắt thẳng theo khung_bao được):
    tách nền xanh → lấy 12 hình theo thứ tự trái→phải → dò tỉ lệ + dời (không xoay) sao cho hình bóng khớp nhất với
    khung nguồn cùng số (IoU) → quy về ô 96 đúng cách game co/đặt khung đó (tach_lop.quy_doi: co BOX theo SK, đặt DAT)
    → nhích ±3 điểm ảnh cho khớp hình bóng game nhất. Ghi lại IoU từng khung để biết khung nào lệch dáng.
Ghi:
    anh-gen-96/<tên>.png             hình gen đã kéo về ô 96 (1152×96), để soát
    do-gen/xanh/<lớp>.png, ten.txt   bộ đồ gen (tao-bo.py tự nhận)
    giap-gen/<bộ>/<lớp>.png, ten.txt bộ giáp gen (tao-bo.py tự nhận)
    nap-gen-that.json                số liệu: IoU, điểm phải lấp, khung lệch dáng
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.signal import fftconvolve

DAY = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DAY)
import tach_lop as T
import trang_phuc as TP

O, N = 96, T.SO_KHUNG
GEN = os.path.join(DAY, 'anh-gen')
NGUONG_LECH = 0.83          # IoU hình bóng (sau khi về ô 96) dưới mức này = lệch dáng rõ


def tach_nen_xanh(a):
    rgb = a[:, :, :3].astype(int); r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    nen = (a[:, :, 3] < 128) | ((g > 140) & (g > r * 1.35 + 20) & (g > b * 1.35 + 20))
    out = a.copy(); out[:, :, 3] = np.where(nen, 0, 255)
    gmax = np.maximum(r, b) + 10
    out[:, :, 1] = np.where(~nen & (g > gmax), gmax, g).clip(0, 255)
    return out


def hinh_trong_tam(path, so=N):
    """Tách nền, trả list (RGBA đã cắt sát hình, (x0, y0) trên tấm) theo thứ tự trái → phải."""
    a = tach_nen_xanh(np.array(Image.open(path).convert('RGBA')))
    m = a[:, :, 3] > 0
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=6))
    sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    lon = np.argsort(sz)[::-1][:so] + 1
    out = []
    for k in lon:
        ys, xs = np.nonzero((lab == k) & m)
        x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        f = a[y0:y1, x0:x1].copy(); f[lab[y0:y1, x0:x1] != k] = 0
        out.append((x0, f, (int(x0), int(y0))))
    out.sort(key=lambda t: t[0])
    return [(f, p) for _, f, p in out]


def dang_ky(fig, src_m):
    """Dò tỉ lệ + dời (không xoay): nguồn ≈ s·gen + t. Trả (iou, sx, sy, tx, ty)."""
    H, W = src_m.shape
    gm = fig[:, :, 3] > 0
    s0 = H / gm.shape[0]
    P = 40
    big = np.zeros((H + 2 * P, W + 2 * P)); big[P:P + H, P:P + W] = src_m
    best = None
    for s in np.arange(s0 * 0.88, s0 * 1.12, s0 * 0.005):
        w, h = max(1, round(gm.shape[1] * s)), max(1, round(gm.shape[0] * s))
        m = np.array(Image.fromarray((gm * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)) > 127
        c = fftconvolve(big, m[::-1, ::-1].astype(float), mode='valid')
        iy, ix = np.unravel_index(np.argmax(c), c.shape)
        inter = c[iy, ix]; iou = inter / (m.sum() + src_m.sum() - inter)
        if best is None or iou > best[0]: best = (float(iou), w / gm.shape[1], h / gm.shape[0], int(ix - P), int(iy - P))
    return best


def keo_ve_96(fig, i, dk):
    """Đưa hình gen về ô 96 của khung i đúng như game co/đặt khung nguồn (co BOX có trọng alpha, alpha ≥ 50% → đặc)."""
    _, sx, sy, tx, ty = dk
    H, W = T.nguon(i).shape[:2]
    SKx, SKy, dx, dy = T.quy_doi(i, H, W)
    fx, fy = SKx * sx, SKy * sy
    ox, oy = dx + SKx * tx, dy + SKy * ty
    P = 300
    pad = np.zeros((fig.shape[0] + 2 * P, fig.shape[1] + 2 * P, 4), np.uint8); pad[P:-P, P:-P] = fig
    box = ((0 - ox) / fx + P, (0 - oy) / fy + P, (O - ox) / fx + P, (O - oy) / fy + P)
    r = np.array(Image.fromarray(pad, 'RGBA').convert('RGBa').resize((O, O), Image.BOX, box=box).convert('RGBA'))
    al = np.array(Image.fromarray(pad[:, :, 3]).resize((O, O), Image.BOX, box=box))
    out = np.zeros((O, O, 4), np.uint8); m = al >= 128
    out[m, :3] = r[m, :3]; out[m, 3] = 255
    return out


def nhich(k, ga, r=3):
    best = None
    for ddy in range(-r, r + 1):
        for ddx in range(-r, r + 1):
            kk = np.roll(np.roll(k, ddy, 0), ddx, 1); m = kk[:, :, 3] > 0
            iou = (m & ga).sum() / max(1, (m | ga).sum())
            if best is None or iou > best[0] + 1e-9: best = (float(iou), ddx, ddy, kk)
    return best


def ve_96(path, game):
    hinh = hinh_trong_tam(path)
    if len(hinh) != N: raise SystemExit('LỖI: %s có %d hình, cần %d' % (path, len(hinh), N))
    hang = np.zeros((O, O * N, 4), np.uint8); so = []
    for i, (fig, vt) in enumerate(hinh):
        dk = dang_ky(fig, T.nguon(i)[:, :, 3] > 40)
        ga = game[:, i * O:(i + 1) * O, 3] > 0
        iou96, ddx, ddy, k = nhich(keo_ve_96(fig, i, dk), ga)
        k[PIVOT_Y:] = 0                             # không cho lấn xuống dưới mặt đất
        hang[:, i * O:(i + 1) * O] = k
        so.append({'khung': i, 'viTriTrenTam': vt, 'tiLe': round(dk[1], 3), 'iouNguon': round(dk[0], 3),
                   'iou96': round(iou96, 3), 'nhich': [ddx, ddy], 'lechDang': iou96 < NGUONG_LECH})
    return hang, so


PIVOT_Y = 90


def hsv(a):
    h, s, v = T._hsv(a)
    return h, s, v


def kc_chuoi(pts):
    return TP.kc_chuoi(pts)


# ---------------------------------------------------------------- ĐỒ XANH
def tach_do_xanh(G, data, goc):
    """G: hàng gen đã về ô 96. Trả (dict lớp → sheet, số liệu từng khung)."""
    nen = {l: np.array(Image.open(os.path.join(DAY, data['sheets'][l])).convert('RGBA')) for l in TP.NEN}
    ra = {l: np.zeros((O, O * N, 4), np.uint8) for l in TP.DO}
    so = []
    for i in range(N):
        sl = slice(i * O, (i + 1) * O)
        g = G[:, sl]; k = data['frames'][i]['joints']
        h, s, v = hsv(g); op = g[:, :, 3] > 0
        yy = np.mgrid[0:O, 0:O][0]
        Mg = {l: goc[l][:, sl, 3] > 0 for l in TP.DO}
        M_ao = Mg['torsoOutfit'] | Mg['belt']
        M_quan = Mg['rearPants'] | Mg['pants'] | Mg['frontPants']
        M = M_ao | M_quan
        gan = ndimage.binary_dilation(M, iterations=2)
        duoi_co = yy > k['neck'][1] + 0.5
        # lớp màu của ảnh gen
        xanh = op & (h >= 185) & (h <= 255) & (s > 0.18)
        # áo xanh nhạt và quần xanh đậm trùng sắc ở chỗ tối → chia theo mép trên đai: trên = áo, dưới = quần (trừ điểm rất sáng)
        tren_dai = yy <= k['beltTop'][1] + 1
        ao_c = op & ((xanh & (tren_dai | (v > 0.66))) | ((s < 0.22) & (v > 0.72))) & duoi_co
        quan_c = op & xanh & ~ao_c & (v > 0.12)
        d_dai = ndimage.distance_transform_edt(~Mg['belt'])
        dai_c = op & (((h < 45) | (h > 340)) & (s > 0.3) & (v > 0.16) & (v < 0.62)) & (d_dai <= 3) & duoi_co & ~quan_c & ~ao_c
        toi = op & (v <= 0.2)
        lop_c = {'ao': ao_c, 'dai': dai_c, 'quan': quan_c}
        # vùng mỗi ô: vùng đồ gốc của ô (để không lộ thân trần / đồ cũ) ∪ điểm gen đúng màu của ô sát thân
        vung = {'ao': (Mg['torsoOutfit'] | ((ao_c) & gan)) & ~((dai_c) & ~Mg['torsoOutfit']),
                'dai': Mg['belt'] | (dai_c & gan),
                'quan': M_quan | (quan_c & gan)}
        vung['ao'] &= ~(vung['dai'] & ~Mg['torsoOutfit'])
        anh = {}
        lap = {}
        for o, m in vung.items():
            nguon_mau = lop_c[o] | (toi & m)          # nét viền tối trong vùng đồ gốc lấy luôn
            im = np.zeros((O, O, 4), np.uint8)
            dung = m & nguon_mau
            im[dung] = g[dung]
            thieu = m & ~nguon_mau
            if lop_c[o].any():
                _, (iy, ix) = ndimage.distance_transform_edt(~lop_c[o], return_indices=True)
                im[thieu] = g[iy[thieu], ix[thieu]]
            im[thieu, 3] = 255
            lap[o] = int(thieu.sum())
            anh[o] = im
        # chia về lớp
        ra['torsoOutfit'][:, sl] = anh['ao']
        ra['belt'][:, sl] = anh['dai']
        d = np.stack([ndimage.distance_transform_edt(~Mg[l]) if Mg[l].any() else np.full((O, O), 1e9) for l in TP.SLOT['quan']])
        am = np.argmin(d, 0)
        mq = anh['quan'][:, :, 3] > 0
        for j, l in enumerate(TP.SLOT['quan']):
            m = mq & (am == j)
            ra[l][:, sl][m] = anh['quan'][m]
        # điểm lấp còn NHÌN THẤY sau khi ghép (lấp nằm dưới lớp khác thì không tính)
        lay = {l: nen[l][:, sl] for l in TP.NEN}
        lay.update({l: ra[l][:, sl] for l in TP.DO})
        g_all, top = TP.ghep(lay)
        lap_m = np.zeros((O, O), bool)
        for l in TP.DO:
            a = ra[l][:, sl]
            lap_m |= (top == TP.IDX[l]) & ((g[:, :, 3] == 0) | (np.abs(a[:, :, :3].astype(int) - g[:, :, :3].astype(int)).sum(2) > 0))
        do_thay = int(np.isin(top, [TP.IDX[l] for l in TP.DO]).sum())
        so.append({'khung': i, 'diemPhaiLap': lap, 'lapConThay': int(lap_m.sum()), 'diemDoNhinThay': do_thay,
                   'tyLeLapThay': round(int(lap_m.sum()) / max(1, do_thay), 3)})
    return ra, so


# ---------------------------------------------------------------- GIÁP (tách từ Cu Tí mặc giáp)
def tach_giap(G, data, game, goc):
    ra = {l: np.zeros((O, O * N, 4), np.uint8) for l in ('backShoulderArmor', 'chestArmor', 'frontShoulderArmor', 'frontShoulderArmorTop')}
    so = []
    for i in range(N):
        sl = slice(i * O, (i + 1) * O)
        g = G[:, sl]; gk = game[:, sl]; k = data['frames'][i]['joints']
        h, s, v = hsv(g); op = g[:, :, 3] > 0
        _, da, do = T.mau(g)
        yy, xx = np.mgrid[0:O, 0:O]
        # vùng có thể có giáp: thân trên (cổ → mép trên đai) + quanh hai vai
        d_than = kc_chuoi([k['neck'], k['waist'], k['hipCenter']])
        vung = (d_than <= 7.5) & (yy >= k['neck'][1] - 1) & (yy <= k['beltTop'][1] + 1)
        d_vT = kc_chuoi([k['shoulderFront'], [k['shoulderFront'][0] * 0.7 + k['elbowFront'][0] * 0.3, k['shoulderFront'][1] * 0.7 + k['elbowFront'][1] * 0.3]])
        d_vS = kc_chuoi([k['shoulderBack'], [k['shoulderBack'][0] * 0.7 + k['elbowBack'][0] * 0.3, k['shoulderBack'][1] * 0.7 + k['elbowBack'][1] * 0.3]])
        vung |= (d_vT <= 4.5) | (d_vS <= 4.5)
        # khác biệt với Cu Tí gốc cùng khung (màu giáp đồng/thép sáng hơn áo đen) + màu không phải da / đỏ đai / đen
        khac = np.abs(g[:, :, :3].astype(int) - gk[:, :, :3].astype(int)).sum(2) > 60
        _, da_goc, _ = T.mau(gk)
        dai_do = (s > 0.75) & (yy >= k['beltTop'][1] - 1)                     # đỏ đai
        # đồng/thép: không đen; màu giống da chỉ bị loại khi Cu Tí gốc cũng là da ở đó (cổ, tay) — giáp đồng sáng trùng sắc da
        mau_giap = op & (v > 0.2) & ~(da & da_goc) & ~dai_do
        m = vung & mau_giap & (khac | (v > 0.24))
        m = ndimage.binary_opening(m, structure=np.ones((2, 2))) | (m & ndimage.binary_dilation(ndimage.binary_opening(m, structure=np.ones((2, 2)))))
        lab, n = ndimage.label(m)
        if n:
            sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
            m = np.isin(lab, [j + 1 for j in range(n) if sz[j] >= 4])
        m = ndimage.binary_fill_holes(m) & op
        # nét viền tối sát giáp (1 điểm ngoài) để giáp có viền
        vien = ndimage.binary_dilation(m) & ~m & op & (v <= 0.2) & vung
        m_all = m | vien
        im = np.zeros((O, O, 4), np.uint8); im[m_all] = g[m_all]
        # chia lớp: gần vai trước / vai sau / thân
        d = np.stack([d_than + 1.5, d_vT, d_vS])
        am = np.argmin(d, 0)
        nguc = m_all & (am == 0); vt = m_all & (am == 1); vs = m_all & (am == 2)
        ra['chestArmor'][:, sl][nguc] = im[nguc]
        ra['backShoulderArmor'][:, sl][vs] = im[vs]
        pad = np.zeros((O, O, 4), np.uint8); pad[vt] = im[vt]
        own = {'frontArm': goc_frontarm(gk, data, i)}
        a_, b_ = TP.tach_vai_truoc(pad, own, k)
        ra['frontShoulderArmor'][:, sl] = a_
        ra['frontShoulderArmorTop'][:, sl] = b_
        so.append({'khung': i, 'diemGiap': int(m_all.sum()), 'nguc': int(nguc.sum()), 'vaiTruoc': int(vt.sum()), 'vaiSau': int(vs.sum())})
    return ra, so


_FA = {}


def goc_frontarm(gk, data, i):
    if 'a' not in _FA:
        _FA['a'] = np.array(Image.open(os.path.join(DAY, data['sheets']['frontArm'])))[:, :, 3] > 0
    return _FA['a'][:, i * O:(i + 1) * O]


# ---------------------------------------------------------------- GIÁP 1 ẢNH + NEO
def chon_mot_anh():
    """Chọn khung giáp rời nghiêng phải hợp nhất: ở bản b, khung 0–4 & 6–10 là 3/4 sang phải (khung 5, 11 nhìn thẳng).
    Chọn khung có bề ngang/chiều cao gần với thân Cu Tí chạy nhất và vai trước rõ (b, khung 1)."""
    hinh = hinh_trong_tam(os.path.join(GEN, 'giap-chay-12-b.png'))
    return hinh[1][0], 'giap-chay-12-b.png khung 1'


def thu_nho_net(a, w, h):
    pre = Image.fromarray(a, 'RGBA').convert('RGBa').resize((w, h), Image.BOX).convert('RGBA')
    al = np.array(Image.fromarray(a[:, :, 3]).resize((w, h), Image.BOX))
    r = np.array(pre); out = np.zeros((h, w, 4), np.uint8); m = al >= 128
    out[m, :3] = r[m, :3]; out[m, 3] = 255
    return out


def giap_mot_anh(data, giap_tach):
    fig, ten = chon_mot_anh()
    # cỡ: bằng khung bao trung bình của giáp tách (ngực + vai trước) — tức cỡ thân Cu Tí trong game
    ws, hs, tam = [], [], []
    for i in range(N):
        sl = slice(i * O, (i + 1) * O)
        m = np.zeros((O, O), bool)
        for l in ('chestArmor', 'frontShoulderArmor', 'frontShoulderArmorTop'): m |= giap_tach[l][:, sl, 3] > 0
        ys, xs = np.nonzero(m)
        ws.append(xs.max() - xs.min() + 1); hs.append(ys.max() - ys.min() + 1); tam.append(((xs.min() + xs.max() + 1) / 2, (ys.min() + ys.max() + 1) / 2))
    H = int(round(np.median(hs)))
    W = max(1, int(round(fig.shape[1] * H / fig.shape[0])))
    nho = thu_nho_net(fig, W, H)
    # neo: chestArmor của data.json. Độ lệch tâm ảnh ↔ neo đo ở khung 0 (khớp tâm giáp tách khung 0), rồi giữ nguyên.
    a0 = data['frames'][0]['anchors']['chestArmor']
    lech = (tam[0][0] - a0[0], tam[0][1] - a0[1])
    ra = {'chestArmor': np.zeros((O, O * N, 4), np.uint8)}
    vt = []
    for i in range(N):
        a = data['frames'][i]['anchors']['chestArmor']
        x0 = int(round(a[0] + lech[0] - W / 2)); y0 = int(round(a[1] + lech[1] - H / 2))
        o = np.zeros((O, O, 4), np.uint8)
        ys0, xs0 = max(0, y0), max(0, x0)
        o[ys0:min(O, y0 + H), xs0:min(O, x0 + W)] = nho[ys0 - y0:min(O, y0 + H) - y0, xs0 - x0:min(O, x0 + W) - x0]
        ra['chestArmor'][:, i * O:(i + 1) * O] = o
        vt.append([x0, y0])
    return ra, {'anhChon': ten, 'co': [W, H], 'lechTamSoVoiNeo': [round(lech[0], 1), round(lech[1], 1)], 'gocTrenTraiTungKhung': vt}, nho


def luu(a, p):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    Image.fromarray(a).save(p, optimize=True)


def main():
    data = json.load(open(os.path.join(DAY, 'data.json'), encoding='utf-8'))
    game = T.hang_game()
    goc = {l: np.array(Image.open(os.path.join(DAY, data['outfits']['goc']['sheets'][l])).convert('RGBA')) for l in TP.DO}
    bao = {}
    G = {}
    for ten in ('cu-ti-do-xanh-chay-12', 'cu-ti-giap-chay-12'):
        G[ten], bao[ten] = ve_96(os.path.join(GEN, ten + '.png'), game)
        luu(G[ten], os.path.join(DAY, 'anh-gen-96', ten + '.png'))
    # đồ xanh
    do, so_do = tach_do_xanh(G['cu-ti-do-xanh-chay-12'], data, goc)
    d = os.path.join(DAY, 'do-gen', 'xanh')
    for l, a in do.items(): luu(a, os.path.join(d, l + '.png'))
    open(os.path.join(d, 'ten.txt'), 'w', encoding='utf-8').write('Đồ xanh (gen)')
    # giáp tách
    gp, so_gp = tach_giap(G['cu-ti-giap-chay-12'], data, game, goc)
    d = os.path.join(DAY, 'giap-gen', 'tach')
    for l, a in gp.items(): luu(a, os.path.join(d, l + '.png'))
    open(os.path.join(d, 'ten.txt'), 'w', encoding='utf-8').write('Giáp (gen, tách từ cu-ti-giap)')
    # giáp 1 ảnh + neo
    m1, so_m1, nho = giap_mot_anh(data, gp)
    d = os.path.join(DAY, 'giap-gen', 'mot-anh')
    for l, a in m1.items(): luu(a, os.path.join(d, l + '.png'))
    luu(nho, os.path.join(d, 'anh-goc-da-co.png'))
    open(os.path.join(d, 'ten.txt'), 'w', encoding='utf-8').write('Giáp 1 ảnh + neo')
    kq = {'khopHinh': bao, 'doXanh': so_do, 'giapTach': so_gp, 'giapMotAnh': so_m1, 'nguongLechDang': NGUONG_LECH}
    json.dump(kq, open(os.path.join(DAY, 'nap-gen-that.json'), 'w'), ensure_ascii=False, indent=1)
    for ten, s in bao.items():
        print('%s: IoU hình bóng ô 96 = %s; lệch dáng: %s' % (ten, ' '.join('%.2f' % x['iou96'] for x in s), [x['khung'] for x in s if x['lechDang']]))
    print('đồ xanh: điểm lấp còn nhìn thấy / điểm đồ nhìn thấy =', ['%d/%d' % (x['lapConThay'], x['diemDoNhinThay']) for x in so_do])
    print('giáp tách: điểm giáp từng khung =', [x['diemGiap'] for x in so_gp])
    print('giáp 1 ảnh:', so_m1['anhChon'], 'cỡ', so_m1['co'])
    print('Chạy tiếp: python3 docs/thu-modular-96/tao-bo.py')


if __name__ == '__main__':
    main()
