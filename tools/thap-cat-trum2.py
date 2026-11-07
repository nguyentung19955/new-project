# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt ảnh TRÙM + QUÁI "không tay chân" (người dùng duyệt 07/11, docs/demo-hop-tuong/tuvan/{trum-moi,quai-moi}/KET-QUA.md).
Nguồn (lưới 4×2 = 8 khung trái→phải, trên→dưới, nền magenta):
  docs/demo-hop-tuong/thap-art/raw_trum2_<id>_di.png (đi) · raw_trum2_<id>_chieu[_v2].png (tung chiêu) · raw_quai2_<id>.png (quái đi)
Ra thap/assets/:
  trum_<id>_8.png / quai_<id>_8.png  — dải đi 8 khung (dùng cho MỌI hướng: vật thể không tay chân, quaianim.js HUONG_CHUNG)
  trum_<id>_atk_16.png               — dải TUNG CHIÊU 8 khung, ô = ô dải đi × ATK_K (hiệu ứng tràn ra ngoài thân), cùng tỉ lệ & tâm thân
  trum_<id>_portrait.png             — chân dung (khung đi 1) · trum_<id>.png / quai_<id>.png — dải 4 khung dự phòng (cũ)
Tách nền: LOANG từ viền ô (không khoá magenta toàn cục → trùm hồng/tím không thủng), túi nền kín (đúng màu nền) cũng bỏ;
  alpha mềm + khử ánh hồng chỉ trong vùng loang; bỏ đốm lẻ nhỏ; thu Lanczos nhân-trước-alpha.
Cỡ: K8 (quaianim.js) tính sao cho cạnh lớn thân hiển thị = MUC (đơn vị game) → in ra để dán vào quaianim.js.
Chạy: python3 tools/thap-cat-trum2.py [id ...] [--chi-atk]"""
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
ASS = os.path.join(GOC, 'thap/assets')
TRUM = ['mad_crown', 'freezer', 'janus', 'joker_king', 'nightmare', 'octopus', 'hive', 'jammer', 'prism', 'twin_core', 'patcher', 'leech']
QUAI = {'bo': 40, 'bay': 40, 'bay_bang': 42, 'khong_lo': 60, 'tach': 46, 'que_tach': 54}  # QUAI[id].co (data.js)
# cạnh lớn thân hiển thị mong muốn (đơn vị game) = cỡ cũ đo trên dải _8 cũ × ~1.05 (trùm: 80 cho cả 12, cũ 70–83)
MUC = {'bo': 25, 'bay': 29, 'bay_bang': 34, 'khong_lo': 66, 'tach': 36, 'que_tach': 55}
MUC_TRUM, CO_TRUM = 80, 86
CHAN_VIEN = [False]
CHAN_ID = {'mad_crown'}
KHU_TIM = {'freezer'}  # ảnh không mắt 07/11: khói băng pha nền tím trong vòng (túi kín) → bỏ điểm tím/hồng (thân băng không có tím)
KHU_TIM_ON = [False]  # ảnh không mắt 07/11: thân hồng, viền trái có khe → loang lọt
CHI_ATK = '--chi-atk' in sys.argv  # chỉ ghi lại dải chiêu trum_<id>_atk_16.png (không đụng dải đi / chân dung / dải 4 khung)
ATK_K = 1.5  # ô dải chiêu / ô dải đi (quaianim.js ATK_K)
DAI4 = {'quai': 192, 'trum': 260}  # trùm: nongskill làm nóng ở 86 px × 3  # dải 4 khung dự phòng


def nen_mau(a):
    v = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]).reshape(-1, 3)
    return np.median(v, axis=0)


def tach_nen(cell, bg):
    """cell: float RGB HxWx3 → RGBA float (0..255) — loang từ viền."""
    r, g, b = cell[..., 0], cell[..., 1], cell[..., 2]
    m = np.minimum(r, b) - g                     # độ "magenta"
    mn, mx = np.minimum(r, b), np.maximum(r, b)
    # tầng 1: ĐÚNG sắc magenta ở mọi độ sáng (nền, bóng đổ tối) — slime tím (B > R, G ~20) / trùm hồng không lọt
    thuan = (mn > 60) & (g < bg[1] + 0.04 * mn + 4) & (np.abs(r - b - (bg[0] - bg[2]) * mn / 250) < 0.05 * mx + 4)
    tq = thuan
    if CHAN_VIEN[0]:  # thân hồng sát màu nền: viền đen (giãn 2 px) chặn loang lọt qua khe viền vào thân
        tq = thuan & ~ndimage.binary_dilation(np.maximum(np.maximum(r, g), b) < 90, iterations=2)
    lab, n = ndimage.label(tq)
    vien = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])).tolist())
    # túi nền kín (giữa vòng, lỗ): đúng màu nền, đủ lớn → cũng là nền
    sat = (np.sqrt(((cell - bg) ** 2).sum(-1)) < (12 if CHAN_VIEN[0] else 36)) & thuan  # thân hồng: túi nền phải đúng màu nền
    lab2, n2 = ndimage.label(sat)
    if n2 and CHAN_VIEN[0] != 2:  # 2 = dải đi thân hồng: không có lỗ thật, mảng hồng trong thân không phải túi nền
        sz = ndimage.sum(sat, lab2, range(1, n2 + 1))
        for k2 in 1 + np.nonzero(sz >= 40)[0]: vien |= set(np.unique(lab[lab2 == k2]).tolist())
    vien.discard(0)
    R = np.isin(lab, list(vien))
    if CHAN_VIEN[0]: R = thuan & ndimage.binary_dilation(R, iterations=3)  # lấy lại dải nền sát viền
    # tầng 2: sương/khói SÁNG trong mờ pha nền (trắng/xanh băng mờ trên magenta) nối với nền → tách trộn theo kênh G
    mo = (((g >= bg[1] + 30) & (b > 200) & (r > 140)) | ((g >= bg[1] + 2) & (b > 150) & (r > 232))) & (g < mn - 30) & ~R  # + quầng vàng/cam mờ (R vẫn ~255)
    lab3, n3 = ndimage.label(mo | R)
    T2 = np.isin(lab3, np.unique(lab3[R])) & mo
    # dải 1 px quanh vùng nền cũng xét alpha mềm (mép khử răng cưa)
    vung = ndimage.binary_dilation(R, iterations=1)
    k = np.clip(1 - (m - 60) / 80, 0, 1)
    alpha = np.where(vung, k, 1.0)
    alpha[R & (m > 140)] = 0
    du = np.clip(m, 0, None) * (alpha < 1) * vung
    out = np.dstack([r - du * 0.6, g, b - du * 0.6, alpha * 255])
    a2 = np.clip((g - bg[1]) / (210 - bg[1]), 0.05, 1)
    for i in range(3):
        out[..., i] = np.where(T2, (cell[..., i] - (1 - a2) * bg[i]) / a2, out[..., i])
    out[..., 3] = np.where(T2, a2 * 255, out[..., 3])
    return np.clip(out, 0, 255)


def bo_dom(a, nho):
    """bỏ đốm alpha lẻ nhỏ hơn nho px."""
    m = a[..., 3] > 20
    lab, n = ndimage.label(m, structure=np.ones((3, 3)))
    if not n: return a
    sz = ndimage.sum(m, lab, range(1, n + 1))
    xoa = np.isin(lab, 1 + np.nonzero(sz < nho)[0])
    a[xoa] = 0
    return a


def o_luoi(path):
    im = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    H, W = im.shape[:2]; w, h = W / 4, H / 2
    cells = [im[int(rr * h):int((rr + 1) * h), int(c * w):int((c + 1) * w)] for rr in range(2) for c in range(4)]
    bg = np.median([nen_mau(c) for c in cells], axis=0)
    out = []
    for c in cells:
        a = tach_nen(c, bg)
        if KHU_TIM_ON[0]:
            a[..., 3] = np.where(np.minimum(c[..., 0], c[..., 2]) - c[..., 1] > 70, 0, a[..., 3])
        out.append(bo_dom(a, max(30, int(c.shape[0] * c.shape[1] * 0.0004))))
    return out


def bbox(a, th=128):
    ys, xs = np.nonzero(a[..., 3] > th)
    return (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1) if len(xs) else None


def loi(a):
    """tâm + diện tích lõi thân (ăn mòn bỏ hiệu ứng mảnh)."""
    m = a[..., 3] > 128
    m2 = ndimage.binary_erosion(m, iterations=max(2, a.shape[0] // 30))
    if m2.sum() > m.sum() * 0.15: m = m2
    lab, n = ndimage.label(m)
    if not n: return None
    sz = ndimage.sum(m, lab, range(1, n + 1)); core = lab == (int(np.argmax(sz)) + 1)
    ys, xs = np.nonzero(core)
    return xs.mean(), ys.mean(), core.sum()


def khop(dis, a, th=128):
    """khớp ô chiêu a vào ô đi (khung đi khớp nhất trong dis): trả (sc, ox, oy, iou) — ô chiêu phóng sc rồi dời (ox,oy) thì trùng ô đi."""
    from scipy.signal import fftconvolve
    def mn(x, s):
        im = Image.fromarray((x[..., 3] > th).astype(np.uint8) * 255)
        return np.asarray(im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.BILINEAR), np.float32) / 255
    def thu(mw, st, sc):
        ms = mn(a, st * sc)
        c = fftconvolve(mw, ms[::-1, ::-1], mode='full'); iy, ix = np.unravel_index(int(np.argmax(c)), c.shape)
        return (float(sc), (ix - (ms.shape[1] - 1)) / st, (iy - (ms.shape[0] - 1)) / st, float(c[iy, ix] / (mw.sum() + ms.sum() - c[iy, ix])))
    best = None
    for w in dis:
        mw = mn(w, 0.25)  # dò thô trên ảnh 1/4
        o = max((thu(mw, 0.25, sc) for sc in np.arange(0.70, 1.41, 0.02)), key=lambda r: r[3])
        mw = mn(w, 1.0)   # tinh chỉnh cỡ thật quanh tỉ lệ thô
        o = max((thu(mw, 1.0, sc) for sc in np.arange(o[0] - 0.02, o[0] + 0.021, 0.005)), key=lambda r: r[3])
        if best is None or o[3] > best[3]: best = o
    return best


def dat(a, cx, cy, s, ra, sc=1.0):
    """cắt ô vuông cạnh s (nguồn) tâm (cx,cy) → ra×ra px, Lanczos nhân-trước-alpha; sc: phóng nguồn trước."""
    im = Image.fromarray(a.astype(np.uint8), 'RGBA').convert('RGBa')
    if abs(sc - 1) > 1e-3:
        im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS); cx *= sc; cy *= sc
    x0, y0 = cx - s / 2, cy - s / 2
    # crop có đệm trong suốt rồi thu: tránh lọc lem ra ngoài
    pad = Image.new('RGBa', (int(np.ceil(s)) + 4, int(np.ceil(s)) + 4), (0, 0, 0, 0))
    ix, iy = int(np.floor(x0)), int(np.floor(y0))
    pad.paste(im, (-ix + 2, -iy + 2))
    fx, fy = x0 - ix + 2, y0 - iy + 2
    q = pad.resize((ra, ra), Image.LANCZOS, box=(fx, fy, fx + s, fy + s))
    return q.convert('RGBA')


def bo_le_vien(im, trung_tinh=False):
    """bỏ mảnh nhỏ lọt từ ô lưới bên cạnh của ảnh raw: chạm mép ô; khung trung tính (1, 8 — không có hiệu ứng) thì
    bỏ cả mảnh nhỏ nằm xa thân > 12% ô (vd chấm đen trên đầu khung 8 janus)."""
    a = np.array(im); m = a[..., 3] > 8
    lab, n = ndimage.label(m, structure=np.ones((3, 3)))
    if not n: return im
    vien = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])).tolist()) - {0}
    sz = ndimage.sum(m, lab, range(1, n + 1))
    if trung_tinh:
        kc = ndimage.distance_transform_edt(lab != (int(np.argmax(sz)) + 1))
        for k in range(1, n + 1):
            if sz[k - 1] < m.size * 0.01 and kc[lab == k].min() > m.shape[0] * 0.12: vien.add(k)
    for k in vien:
        if sz[k - 1] < m.size * 0.01: a[lab == k] = 0
    return Image.fromarray(a, 'RGBA')


def dai(fr):
    o = fr[0].width; im = Image.new('RGBA', (o * len(fr), o), (0, 0, 0, 0))
    for i, f in enumerate(fr): im.paste(f, (i * o, 0))
    return im


def lam(id, trum):
    pre = 'trum_' if trum else 'quai_'
    CHAN_VIEN[0] = 2 if id in CHAN_ID else 0
    KHU_TIM_ON[0] = id in KHU_TIM
    di = o_luoi(os.path.join(ART, ('raw_trum2_%s_di.png' if trum else 'raw_quai2_%s.png') % id))
    bbs = [bbox(a) for a in di]
    x0 = min(b[0] for b in bbs); y0 = min(b[1] for b in bbs); x1 = max(b[2] for b in bbs); y1 = max(b[3] for b in bbs)
    S = max(x1 - x0, y1 - y0) * 1.06; cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    frac = float(np.median([max(b[2] - b[0], b[3] - b[1]) for b in bbs])) / S
    co = CO_TRUM if trum else QUAI[id]; muc = MUC_TRUM if trum else MUC[id]
    k8 = round(muc / (frac * co), 3)
    F = int(min(round(3.0 * co * k8 * 1.33), S))  # 3× cỡ hiển thị LỚN NHẤT (R.s ≤ 1; nổ lúc chết phóng ×1.32 — đo thap-kt-min3x), không vượt độ nét raw
    F -= F % 2
    fr = [dat(a, cx, cy, S, F) for a in di]
    if not CHI_ATK: dai(fr).save(os.path.join(ASS, pre + id + '_8.png'), optimize=True)
    # dải 4 khung dự phòng (cũ): khung 0,2,4 đi + khung 3 = chiêu (trùm) / 6 (quái)
    o4 = DAI4['trum' if trum else 'quai']
    ds4 = [di[0], di[2], di[4]]
    ra = {'id': id, 'F': F, 'K8': k8, 'frac': round(frac, 3), 'S_raw': round(S)}
    if trum:
        cp = os.path.join(ART, 'raw_trum2_%s_chieu_v2.png' % id)
        if not os.path.exists(cp): cp = os.path.join(ART, 'raw_trum2_%s_chieu.png' % id)
        if CHAN_VIEN[0]: CHAN_VIEN[0] = 1  # dải chiêu: còn túi nền thật giữa vòng xoáy
        ch = o_luoi(cp)
        # khớp thân (08/11 sửa lệch): khung chiêu 8 (trung tính) ↔ khung đi trung tính (1 hoặc 8) bằng KHỚP MẶT NẠ alpha
        #  (dò tỉ lệ + tịnh tiến cho IoU lớn nhất). Cách cũ (tâm lõi ăn mòn + diện tích) lệch tới 15% ô ở janus/prism/jammer/patcher
        #  → thân "nhảy" sang trái/lên khi chuyển dải đi ↔ dải chiêu.
        sc, ox, oy, iou = khop([di[0], di[7]], ch[7])
        FA = int(round(F * ATK_K / 1.33 * 1.08)); FA -= FA % 2  # dải chiêu không có nổ ×1.32 (chỉ lõi nứt ×1.08)
        # tâm ô đi (cx,cy) ↔ điểm (cx-ox, cy-oy) của ô chiêu ĐÃ phóng sc; dat() nhận toạ độ nguồn CHƯA phóng (tự nhân sc) → chia sc
        #  (cách cũ truyền toạ độ đã phóng → bị nhân sc hai lần: lỗi lệch chính)
        fa = [bo_le_vien(dat(a, (cx - ox) / sc, (cy - oy) / sc, S * ATK_K, FA, sc), i in (0, 7)) for i, a in enumerate(ch)]
        dai(fa).save(os.path.join(ASS, 'trum_%s_atk_16.png' % id), optimize=True)
        ra.update(atk_sc=round(sc, 3), FA=FA, iou=round(iou, 3))
        ds4.append(ch[3])
        # chân dung: khung đi 1, cắt sát, vuông, không phóng quá raw
        a = di[0]; b = bbox(a, 8); c = max(b[2] - b[0], b[3] - b[1]) * 1.04
        P = int(min(600, c))
        if not CHI_ATK: dat(a, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, c, P).save(os.path.join(ASS, 'trum_%s_portrait.png' % id), optimize=True)
        ra['portrait'] = P
    else:
        ds4.append(di[6])
    if not CHI_ATK and (not trum or id in TRUM[:6]):  # trùm mới không có dải 4 khung cũ (đừng tạo file thừa)
        dai([dat(a, cx, cy, S, o4) for a in ds4]).save(os.path.join(ASS, pre + id + '.png'), optimize=True)
    print(json.dumps(ra, ensure_ascii=False))
    return ra


if __name__ == '__main__':
    ids = [a for a in sys.argv[1:] if not a.startswith('--')] or TRUM + list(QUAI)
    kq = [lam(i, i in TRUM) for i in ids]
    print('K8 = {' + ', '.join("%s: %s" % (r['id'], r['K8']) for r in kq) + '}')
