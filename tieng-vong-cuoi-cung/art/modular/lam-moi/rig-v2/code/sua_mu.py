"""Bước 1d (mới ở v2): sửa tay vùng gáy mũ / chóp mũ bằng code (KHÔNG gen ảnh).

Vấn đề rig-v1: mảnh mũ trên bảng có gáy hẹp và đỉnh thấp hơn 2-nhin-ngang.png → nét viền gáy mũ chạy cắt
ngang qua chóp, đường bao trên cùng thành "hai bướu"; đỉnh mũ thấp hơn ảnh ngang ~20 px.

Cách sửa (chỉ dùng điểm ảnh có sẵn của 2-nhin-ngang.png – ảnh chuẩn):
1. Chia vùng mũ+chóp bằng một ĐƯỜNG CẮT L đặt tay, chạy dọc nếp gấp đen có sẵn trên ảnh ngang
   (từ đỉnh nếp (522,186) xuống khe trắng dưới chóp (378,410)). Bên phải L = mũ, bên trái L = chóp.
2. Mũ: bên phải L lấy điểm ảnh của ảnh ngang thay cho mảnh bảng – phía trên y=560 lấy hết (gồm cả đường bao
   đỉnh/gáy cao hơn), từ 560 tới 720 chỉ lấy bên trong bóng mũ cũ và tránh quanh chuông (chuông vẽ đè lên);
   quanh mắt giữ lòng mặt đen của mảnh bảng (mắt là mảnh riêng, không nướng mắt vào mũ);
   hoà mềm ở mép trong → đường bao trên/gáy = đúng ảnh ngang, mất nét viền gáy cũ vắt qua chóp, không có đường
   nối cắt ngang viền cyan. (Đã thử giữ mặt + viền cyan của mảnh bảng: đường nối lộ "bóng ma" viền cyan lệch.)
   Bên trái L: mũ bị xoá (dốc mềm 6 px). Nét nếp gấp đen thuộc về CHÓP (đường cắt dời 14 px sang phải nét).
3. Chóp: bên trái L lấy điểm ảnh ảnh ngang (+ dải 30 px lấn sang phải L, nằm khuất sau mũ, để khi chóp lắc
   không hở) → đường bao chóp ở dáng nghỉ = đúng ảnh ngang.
Ảnh ngang được đặt vào hệ toạ độ từng mảnh bằng đúng ma trận dáng nghỉ của rig (1 lần nội suy bicubic).
Mảnh cũ (trước sửa) giữ lại ở ../manh/goc/<ten>-truoc-sua.png để so sánh."""
import os
import json
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from chung import MANH, SRC_NGANG, load_rgb, background, unmix_white
from rig import build_rig, world_mats, piece_matrix

# Đường cắt nằm ngay BÊN PHẢI nét nếp gấp đen (dời 14 px theo pháp tuyến) → nét đen thuộc về CHÓP: khi chóp lắc,
# nét đi theo chóp, không còn "treo" trên mũ; mép mũ dọc L là màu xanh trơn, chồng lên lớp gáy mũ xanh phía sau.
_L0 = ((522.0, 186.0), (378.0, 410.0))      # nếp gấp đen trên ảnh ngang: đỉnh nếp → khe trắng dưới chóp
_DL = 14.0
_n = np.array([_L0[1][1] - _L0[0][1], -(_L0[1][0] - _L0[0][0])])
_n = _n / np.linalg.norm(_n)                 # pháp tuyến hướng sang phải (phía mũ)
L_TREN = tuple(float(v) for v in np.array(_L0[0]) + _DL * _n)
L_DUOI = tuple(float(v) for v in np.array(_L0[1]) + _DL * _n)
Y_DAY = 560.0                # chỉ sửa phía trên y này (gáy/đỉnh), phần dưới mũ giữ mảnh bảng
Y_DAY2 = 720.0               # phần dưới mũ (tới y này): chỉ trong bóng mũ cũ, tránh chuông
MAT_FN = None                # (thử nghiệm) hàm (X, Y) → vùng GIỮ mảnh bảng; None = thay cả mặt/viền cyan bằng ảnh ngang
NO = 70                      # vùng xét = mũ ∪ chóp (dáng nghỉ) nới 70 px (đỉnh ảnh ngang cao hơn tới ~50 px)
HOA = 12.0                   # độ hoà mềm (sigma, px) ở mép trong vùng thay của mũ
MEM_L = 6.0                  # độ rộng dốc mềm ở mép mũ dọc L (px mỗi bên)
LAN_CHOP = 30                # dải chóp lấn sang phải L (khuất sau mũ)


def ben_phai_L(X, Y):
    (x1, y1), (x2, y2) = L_TREN, L_DUOI
    # dấu tích chéo: > 0 = bên phải (phía mũ) khi đi từ trên xuống dưới (y xuống)
    return (x2 - x1) * (Y - y1) - (y2 - y1) * (X - x1) < 0


def khoang_cach_L(X, Y):
    (x1, y1), (x2, y2) = L_TREN, L_DUOI
    n = np.array([y2 - y1, -(x2 - x1)])
    n = n / np.linalg.norm(n)
    return np.abs((X - x1) * n[0] + (Y - y1) * n[1])


def premul(a):
    a = a.astype(np.float32)
    al = a[..., 3:4] / 255.0
    return np.dstack([a[..., :3] * al, a[..., 3]])


def unpremul(p):
    A = np.clip(p[..., 3], 0, 255)
    rgb = np.where(A[..., None] > 0.5, p[..., :3] / np.maximum(A[..., None], 1e-6) * 255.0, 0)
    out = np.dstack([np.clip(rgb, 0, 255), A]).round().astype(np.uint8)
    out[A < 2] = 0
    return out


def warp(img_pm, F, size):
    """img_pm (premul, toạ độ nguồn) → khung đích size, với F = ma trận đích→nguồn (3×3)."""
    coeffs = (F[0, 0], F[0, 1], F[0, 2], F[1, 0], F[1, 1], F[1, 2])
    ch = [np.array(Image.fromarray(img_pm[..., c].astype(np.float32), 'F').transform(size, Image.AFFINE, coeffs,
                                                                                       resample=Image.BICUBIC))
          for c in range(img_pm.shape[2])]
    return np.dstack(ch)


def main():
    ch_path = os.path.join(MANH, 'goc', 'chuan-hoa.json')
    ch = json.load(open(ch_path, encoding='utf-8'))
    if ch.get('_sua_mu'):
        raise SystemExit('chuan-hoa.json đã sửa mũ – chạy lại chuan_hoa.py trước')
    rig, _ = build_rig(ch)
    mats = world_mats(rig, {})
    ref = load_rgb(SRC_NGANG)
    bg, _ = background(ref)
    ref_rgba = premul(unmix_white(ref, ~bg))
    H, W = bg.shape
    Y, X = np.mgrid[0:H, 0:W].astype(np.float64)
    phai = ben_phai_L(X, Y)

    # vùng mũ+chóp ở dáng nghỉ (thế giới)
    def alpha_the_gioi(n):
        img = premul(np.array(Image.open(os.path.join(MANH, n + '.png')).convert('RGBA')))
        Fw = piece_matrix(rig['nut'][n], mats[n])
        return warp(img[..., 3:4], np.linalg.inv(Fw), (W, H))[..., 0] / 255.0
    vung = nd.binary_dilation((alpha_the_gioi('mu') > 0.5) | (alpha_the_gioi('chop-mu') > 0.5), iterations=NO)
    tren = Y < Y_DAY
    # mũ: phía trên Y_DAY lấy hết; từ Y_DAY tới Y_DAY2 chỉ lấy bên trong bóng mũ cũ (co 4 px) và tránh quanh chuông
    # → không có đường nối nằm ngang cắt qua viền cyan của mặt (đường nối chỉ còn ở sát mép dưới mũ / dưới chuông)
    mu_cu = nd.binary_erosion(alpha_the_gioi('mu') > 0.5, iterations=4)
    chuong = nd.binary_dilation(alpha_the_gioi('chuong') > 0.3, iterations=10)
    # mắt: giữ lòng mặt đen của mảnh bảng (không có mắt) quanh mắt → mảnh mũ không chứa mắt "nướng sẵn"
    # (mắt là mảnh riêng mat-gan; sau này nháy mắt / đổi mắt không bị lộ mắt cũ)
    mat_vang = nd.binary_dilation(alpha_the_gioi('mat-gan') > 0.05, iterations=32)
    tren_mu = (tren | ((Y < Y_DAY2) & mu_cu & ~chuong)) & ~mat_vang
    mat = MAT_FN(X, Y) if MAT_FN else np.zeros_like(tren)
    vung_mu = vung & tren_mu & phai & ~mat
    vung_chop = vung & tren & (~phai | (khoang_cach_L(X, Y) < LAN_CHOP))
    # trọng số thay của mũ: 1 trong vùng, hoà mềm vào trong mảnh; mép theo L để cứng (nét nếp gấp)
    w_mu = nd.gaussian_filter(vung_mu.astype(np.float32), HOA)
    w_mu = np.clip((w_mu - 0.5) * 2 + 0.5, 0, 1)
    w_mu[~phai] = 0
    w_mu[vung & tren_mu & ~mat & (khoang_cach_L(X, Y) < 3 * HOA)] = 1.0     # quanh L: chỉ dùng điểm ảnh ảnh ngang
    w_chop = vung_chop.astype(np.float32)
    # mũ: phần bên trái L (gáy cũ vắt qua chóp) bị xoá – chỗ đó thuộc về chóp
    # (xoá có dốc mềm MEM_L px hai bên L: mép mũ hoà vào chóp, không thành vệt sáng/tối do khử răng cưa chồng nhau)
    dL = np.where(phai, 1, -1) * khoang_cach_L(X, Y)
    xoa_mu = (np.clip(0.5 - dL / (2 * MEM_L), 0, 1) * (vung & tren & ~mat)).astype(np.float32)

    bao_cao = {}
    for n, w, xoa in (('mu', w_mu, xoa_mu), ('chop-mu', w_chop, None)):
        p = os.path.join(MANH, n + '.png')
        goc_img = Image.open(p).convert('RGBA')
        goc_img.save(os.path.join(MANH, 'goc', n + '-truoc-sua.png'))
        old = premul(np.array(goc_img))
        Fw = piece_matrix(rig['nut'][n], mats[n])            # mảnh → thế giới
        # nới khung mảnh để chứa phần thêm vào (đỉnh/gáy cao hơn)
        ys, xs = np.nonzero(w > 0.01)          # (vùng xoá luôn nằm trong khung cũ)
        inv = np.linalg.inv(Fw)
        q = inv @ np.stack([xs, ys, np.ones_like(xs)]).astype(float)
        h0, w0 = old.shape[:2]
        pl = int(max(0, np.ceil(-q[0].min()) + 4))
        pt = int(max(0, np.ceil(-q[1].min()) + 4))
        pr = int(max(0, np.ceil(q[0].max() - w0) + 4))
        pb = int(max(0, np.ceil(q[1].max() - h0) + 4))
        Wn, Hn = w0 + pl + pr, h0 + pt + pb
        oldp = np.zeros((Hn, Wn, 4), np.float32)
        oldp[pt:pt + h0, pl:pl + w0] = old
        # ma trận khung mới → thế giới
        Fn = Fw @ np.array([[1, 0, -pl], [0, 1, -pt], [0, 0, 1.0]])
        refp = warp(ref_rgba, Fn, (Wn, Hn))
        wp = warp(w[..., None], Fn, (Wn, Hn))[..., 0]
        wp = np.clip(wp, 0, 1)[..., None]
        new = refp * wp + oldp * (1 - wp)
        if xoa is not None:
            # lớp "gáy mũ" vẽ SAU chóp: = mũ đã sửa nhưng KHÔNG xoá bên trái L (giữ gáy cũ + nét viền gáy cũ),
            # cắt theo bóng ảnh ngang → ở dáng nghỉ bị chóp che hết; khi chóp lắc, chỗ chóp rời đi lộ ra gáy mũ
            # có viền thay vì lộ nền trắng / nét nếp gấp treo lơ lửng.
            ngoai = warp((vung & tren & ~phai & ~mat).astype(np.float32)[..., None], Fn, (Wn, Hn))[..., 0]
            refa = refp[..., 3] / 255.0
            cat = (1 - np.clip(ngoai, 0, 1)) + np.clip(ngoai, 0, 1) * np.clip(refa, 0, 1)
            gay = new * cat[..., None]
            Image.fromarray(unpremul(gay), 'RGBA').save(os.path.join(MANH, 'mu-gay.png'))
            xp = np.clip(warp(xoa[..., None], Fn, (Wn, Hn))[..., 0], 0, 1)[..., None]
            new = new * (1 - xp)
        out = unpremul(new)
        Image.fromarray(out, 'RGBA').save(p)
        v = ch[n]
        v['tam_moi'] = [v['tam_moi'][0] + pl, v['tam_moi'][1] + pt]
        v['co_moi'] = [Wn, Hn]
        v['sua_tay'] = {'dem_trai_tren_phai_duoi': [pl, pt, pr, pb], 'px_thay_tu_anh_ngang': int((w > 0.5).sum())}
        bao_cao[n] = v['sua_tay']
        if n == 'mu':
            ch['mu-gay'] = dict(v, tu_manh_goc='mu', la_lop_gay=True)
    ch['_sua_mu'] = {'duong_cat_L': [L_TREN, L_DUOI], 'y_day': Y_DAY, 'y_day2': Y_DAY2, 'hoa_sigma': HOA,
                     'lan_chop': LAN_CHOP, 'ghi_chu': 'điểm ảnh lấy từ 2-nhin-ngang.png; không gen ảnh'}
    with open(ch_path, 'w', encoding='utf-8') as f:
        json.dump(ch, f, ensure_ascii=False, indent=1)
    print('sửa mũ/chóp:', bao_cao)


if __name__ == '__main__':
    main()
