"""Bước 3–4 – cổng (3 trạng thái) và đồ nhỏ (công tắc lên/ấn, bình máu, mảnh chuông) từ nguon-v2/cong.png, do-nho.png.

Cổng: ảnh gen có [cổng đóng] [cột trái + cánh mở] [1 cột]. Cánh mở của gen bị xoay RA PHÍA NGƯỜI XEM (đầu cánh to hơn,
song chắn và tay nắm khác bản đóng) → không khớp. Theo tư vấn: dựng trạng thái mở TỪ CHÍNH CÁNH ĐÓNG bằng code:
  • 'chi-tru' = bản đóng bỏ cánh (cắt ở mép trong 2 cột; bản lề/chốt sắt nửa gắn trên cột vẫn giữ);
  • 'mo'      = chi-tru + cánh đóng xoay vào trong quanh bản lề trái (bóp ngang còn 30 %, đầu xa thấp đi 6 %, tối hơn),
                vẽ cánh SAU cột;
  • cả 3 cùng khung ảnh, cùng điểm neo (giữa đáy) → đổi trạng thái không nhảy.
Đồ nhỏ: tách nền trắng + khử viền trắng, thu về cỡ hiển thị chuyên gia gợi ý, thêm 1 px (2x) viền đen ngoài cho nét
ngang Lam sau khi thu nhỏ. 2 trạng thái công tắc dùng CÙNG hệ số và cùng neo đáy-giữa của đế."""
import numpy as np
import scipy.ndimage as nd
from PIL import Image

from chung import DOVAT, NGUON, doi_co, khu_vien_trang, luu_json, luu_png, nen_trang

VIEN = np.array([16, 13, 12.0])


def tach_ca_anh(ten):
    a = np.asarray(Image.open(f'{NGUON}/{ten}').convert('RGB')).astype(np.float64)
    bg = nen_trang(a)
    fg = ~bg
    lab, n = nd.label(fg)
    if n > 1:
        sz = nd.sum(fg, lab, range(1, n + 1))
        fg &= ~np.isin(lab, np.nonzero(sz < 60)[0] + 1)
    return khu_vien_trang(a, fg)


def gon(rgba):
    ys, xs = np.nonzero(rgba[..., 3] > 0)
    return rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1], (xs.min(), ys.min())


def vien_ngoai(rgba, px=1):
    """Thêm viền đen ngoài px điểm ảnh (sau khi thu nhỏ)."""
    a = rgba.astype(np.float64)
    pad = px + 1
    a = np.pad(a, ((pad, pad), (pad, pad), (0, 0)))
    al = a[..., 3] / 255
    lan = nd.grey_dilation(al, footprint=np.ones((2 * px + 1, 2 * px + 1), bool))
    lan = np.maximum(lan, al)
    out = np.zeros_like(a)
    out[..., :3] = a[..., :3] * al[..., None] + VIEN * (1 - al[..., None])
    out[..., 3] = lan * 255
    out[out[..., 3] == 0] = 0
    return np.round(out).astype(np.uint8)


# ------------------------------------------------------------------ cổng
def cong():
    A = tach_ca_anh('cong.png')
    dong = A[:, :960].copy()
    dong, (ox, oy) = gon(dong)
    H, W = dong.shape[:2]
    # ranh giới cột ↔ cánh (px gen, đo trên ảnh): cột trái kết thúc x=190, cột phải bắt đầu x=742;
    # đế đá trái rộng tới x=207, đế phải từ x=722, cả hai từ y≈612 trở xuống.
    xl, xr, xdl, xdr, yde = 190 - ox, 742 - ox, 207 - ox, 722 - ox, 612 - oy
    yy, xx = np.mgrid[0:H, 0:W]
    cot = (xx < xl) | (xx >= xr) | ((yy >= yde) & ((xx < xdl) | (xx >= xdr)))
    tru = dong.copy()
    tru[~cot] = 0
    # khép viền ở mép cắt của 2 cột (phần thân cột phía trên đế): 5 px gen đen
    for x0, x1 in ((xl - 5, xl), (xr, xr + 5)):
        vung = tru[:yde, x0:x1]
        m = vung[..., 3] > 0
        vung[m, :3] = VIEN
        vung[m, 3] = 255
    # cánh (từ bản đóng): giữa 2 cột, bỏ phần đế
    canh = dong.copy()
    canh[cot] = 0
    canh_g, (cx0, cy0) = gon(canh)
    ch, cw = canh_g.shape[:2]
    # xoay vào trong quanh bản lề trái: bóp ngang 30 %, đầu xa thấp 6 % (phối cảnh), tối dần về đầu xa
    w2 = int(round(cw * 0.30))
    moi = np.zeros((ch, w2, 4))
    src = canh_g.astype(np.float64)
    for x in range(w2):
        t = (x + 0.5) / w2
        sx = min(cw - 1, int(t * cw))
        s = 1 - 0.06 * t
        h2 = int(round(ch * s))
        col = np.asarray(Image.fromarray(src[:, sx:sx + 1].astype(np.uint8)).resize((1, h2), Image.LANCZOS)).astype(np.float64)
        y0 = ch - h2                       # đáy cánh giữ trên mặt đất
        moi[y0:, x] = col[:, 0]
        moi[y0:, x, :3] *= 0.78 - 0.12 * t
    moi = np.round(moi).astype(np.uint8)
    # khép viền 2 mép dọc của cánh mở
    for xs in (slice(0, 3), slice(w2 - 4, w2)):
        v = moi[:, xs]
        m = v[..., 3] > 0
        v[m, :3] = VIEN
        v[m, 3] = 255
    mo = np.zeros_like(dong)
    mo[cy0:cy0 + ch, xl - 4:xl - 4 + w2] = moi
    a = tru[..., 3:4] / 255.0
    mo = (tru.astype(np.float64) * a + mo.astype(np.float64) * (1 - a))
    mo[..., 3] = np.maximum(tru[..., 3], mo[..., 3])
    mo = np.round(mo).astype(np.uint8)
    # thu về cao 256 px (2x) = 128 logic, như collider cổng cũ (147,5 × 128 logic)
    s = 256 / H
    W2 = int(round(W * s))
    if W2 % 2:
        W2 += 1
    ket = {}
    for ten, im in (('cong-dong', dong), ('cong-mo', mo), ('cong-chi-tru', tru)):
        o = doi_co(im, W2, 256)
        luu_png(o, f'{DOVAT}/{ten}.png')
        ket[ten] = o
    meta = {'co_anh': [W2, 256], 'co_logic': [W2 / 2, 128], 'neo': 'giữa đáy (x = rộng/2, y = 256)',
            'he_so_nguon_sang_2x': round(s, 4),
            'cot_trai_logic': [0, round((xl) * s / 2, 1)], 'cot_phai_logic': [round(xr * s / 2, 1), W2 / 2],
            'ghi_chu': 'cả 3 trạng thái cùng khung; collider khi đóng = khoảng giữa 2 cột; mở/chỉ trụ = chỉ 2 cột.'}
    return ket, meta


# ------------------------------------------------------------------ đồ nhỏ
DO_NHO = {
    # tên: (hộp px gen, cỡ đích 2x theo 'rong' hoặc 'cao')
    'cong-tac-len': ((56, 344, 477, 657), ('rong', 72)),     # rộng 36 logic
    'cong-tac-an': ((505, 426, 924, 660), ('rong', 72)),
    'binh-mau': ((969, 383, 1190, 663), ('cao', 48)),        # cao 24 logic
    'manh-chuong': ((1263, 355, 1479, 675), ('cao', 56)),    # cao 28 logic
}


def do_nho():
    A = tach_ca_anh('do-nho.png')
    ket, meta = {}, {}
    s_ct = None
    for ten, (box, (truc, co)) in DO_NHO.items():
        x0, y0, x1, y1 = box
        sub, _ = gon(A[y0:y1, x0:x1])
        h, w = sub.shape[:2]
        if ten.startswith('cong-tac'):
            if s_ct is None:
                s_ct = (co - 2) / w             # trừ 2 px cho viền ngoài thêm
            s = s_ct
        else:
            s = (co - 2) / (h if truc == 'cao' else w)
        o = doi_co(sub, max(1, round(w * s)), max(1, round(h * s)))
        o = vien_ngoai(o, 1)
        o, _ = gon(o)
        ket[ten] = o
        meta[ten] = {'co_anh': [int(o.shape[1]), int(o.shape[0])], 'co_logic': [o.shape[1] / 2, o.shape[0] / 2],
                     'he_so_nguon_sang_2x': round(s, 4), 'neo': 'giữa đáy'}
    # 2 trạng thái công tắc: cùng khung (rộng = max, cao = max), neo giữa đáy → đổi trạng thái không nhảy đế
    a, b = ket['cong-tac-len'], ket['cong-tac-an']
    Wm, Hm = max(a.shape[1], b.shape[1]), max(a.shape[0], b.shape[0])
    for ten in ('cong-tac-len', 'cong-tac-an'):
        o = ket[ten]
        c = np.zeros((Hm, Wm, 4), np.uint8)
        x = (Wm - o.shape[1]) // 2
        c[Hm - o.shape[0]:, x:x + o.shape[1]] = o
        ket[ten] = c
        meta[ten]['co_anh'] = [Wm, Hm]
        meta[ten]['co_logic'] = [Wm / 2, Hm / 2]
    for ten, o in ket.items():
        luu_png(o, f'{DOVAT}/{ten}.png')
    return ket, meta


def chay():
    kc, mc = cong()
    kd, md = do_nho()
    luu_json({
        'ten': 'Đồ vật Làng Chuông: cổng 3 trạng thái + đồ nhỏ',
        'quy_uoc': {'boi_so': 2, 've': 'vẽ ở ½ cỡ ảnh, neo giữa đáy trên mặt sàn',
                    'vien': 'đồ nhỏ đã thêm 1 px (2x) viền đen ngoài sau khi thu nhỏ'},
        'cong': mc,
        'do_nho': md,
    }, f'{DOVAT}/do-vat.json')
    print('đồ vật:', {k: v.shape[1::-1] for k, v in {**kc, **kd}.items()})
    return {**kc, **kd}


if __name__ == '__main__':
    chay()
