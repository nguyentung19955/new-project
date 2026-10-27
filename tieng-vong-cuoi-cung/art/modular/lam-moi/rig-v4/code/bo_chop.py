"""Bước sau chu_ky (27/10/2026): BỎ HẲN CHÓP MŨ của Lam (chủ dự án: "cắt hẳn chóp mũ trong giao diện").

1. Tắt mảnh 'chop-mu' trong rig (hien = False) → mọi đầu ra (clip chạy, sheet hành động, dáng nghỉ, bóng Tiếng Vọng)
   không còn chóp. Mảnh chop-mu.png vẫn giữ trong manh/ (bật lại: đổi hien = True, mu → manh/mu.png).
2. Không có chóp thì gáy mũ lộ ra: ở đỉnh-sau mũ có một KHẤC (góc trên-trái của mảnh mũ – chỗ đường cắt L ngày trước
   giáp chóp – nhô cao hơn đường bao lớp gáy mũ và KHÔNG có viền đen). Sửa bằng code, không gen ảnh:
   - chỉ trong vùng đỉnh-sau (y < Y_VUNG, x < X_VUNG của ảnh mảnh mũ), ghép mũ đè lên gáy mũ (cùng biến đổi nên ghép
     tĩnh được), lấp khấc bằng phép đóng hình thái (đĩa bán kính R_DONG), rồi kẻ lại VIỀN ĐEN dày DAY_VIEN px (đo trên
     viền có sẵn của mảnh: 15–19 px) dọc đường bao mới; điểm mới lấp lấy màu điểm đặc gần nhất.
   - ngoài vùng đó mảnh mũ giữ nguyên từng điểm ảnh. Lớp gáy mũ (vẽ sau thân) giữ nguyên.
   → manh/mu-khong-chop.png (cùng cỡ + pivot với mu.png), rig: mu.anh = manh/mu-khong-chop.png;
   lớp gáy mũ cắt theo đường bao mới ở đỉnh → manh/mu-gay-khong-chop.png.
Chạy: python3 -B bo_chop.py  (chay_het.py gọi sau chu_ky)."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from chung import MANH, RIG, load_json, save_json

Y_VUNG = 300          # px ảnh mảnh mũ: chỉ sửa phía trên (đỉnh/gáy – xa thân, xa viền cyan)
X_VUNG = 470          # và bên trái (viền cyan bắt đầu ~x 490)
R_DONG = 70
R_MO = 30            # phép mở trước: gọt mấu nhô nhỏ ở đỉnh
DAY_VIEN = 15.0
DEN = np.array([6.0, 6.0, 10.0])
TEN_MOI = 'mu-khong-chop.png'
TEN_GAY = 'mu-gay-khong-chop.png'


def dia(r):
    y, x = np.mgrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def lam_manh():
    mu = np.array(Image.open(os.path.join(MANH, 'mu.png')).convert('RGBA')).astype(np.float64)
    gay = np.array(Image.open(os.path.join(MANH, 'mu-gay.png')).convert('RGBA')).astype(np.float64)
    # ghép mũ đè gáy (alpha thẳng)
    am, ag = mu[..., 3:] / 255, gay[..., 3:] / 255
    ao = am + ag * (1 - am)
    rgb = np.where(ao > 0, (mu[..., :3] * am + gay[..., :3] * ag * (1 - am)) / np.maximum(ao, 1e-6), 0)
    H, W = ao.shape[:2]
    ao = ao[..., 0]
    S = ao > 0.5
    pad = R_DONG + 2
    Sp = np.pad(S, pad)
    So = nd.binary_opening(Sp, structure=dia(R_MO))
    S2 = nd.binary_closing(So, structure=dia(R_DONG))[pad:-pad, pad:-pad]
    yy, xx = np.mgrid[0:H, 0:W]
    # vùng sửa, mép mềm 12 px để nối liền phần giữ nguyên
    w = np.clip((Y_VUNG - yy) / 12.0, 0, 1) * np.clip((X_VUNG - xx) / 12.0, 0, 1)
    vung = w > 0
    S2 = np.where(vung, S2, S)
    # khoảng cách có dấu tới đường bao mới (dương = bên trong)
    sd = nd.distance_transform_edt(S2) - nd.distance_transform_edt(~S2)
    a_moi = np.clip(sd + 0.5, 0, 1)
    # màu cho điểm mới lấp: điểm đặc gần nhất
    _, (iy, ix) = nd.distance_transform_edt(~(ao > 0.9), return_indices=True)
    base = np.where((ao > 0.9)[..., None], rgb, rgb[iy, ix])
    k = np.clip(DAY_VIEN + 0.5 - sd, 0, 1)[..., None]          # 1 = trong dải viền
    sua_rgb = base * (1 - k) + DEN * k
    doi = nd.binary_dilation(S2 ^ S, iterations=3)
    sua_a = np.where(doi, a_moi, ao)
    # trộn vào mảnh mũ gốc theo trọng số vùng
    wv = w[..., None]
    out_rgb = mu[..., :3] * (1 - wv) + sua_rgb * wv
    out_a = mu[..., 3] / 255 * (1 - w) + sua_a * w
    # chỗ mũ gốc trong suốt ngoài vùng: giữ trong suốt (gáy vẫn do lớp mu-gay vẽ)
    out = np.dstack([out_rgb, out_a * 255]).round().clip(0, 255).astype(np.uint8)
    out[out[..., 3] == 0] = 0
    Image.fromarray(out, 'RGBA').save(os.path.join(MANH, TEN_MOI), optimize=True)
    # lớp gáy mũ: cắt phần nhô ra ngoài đường bao mới trong vùng sửa (gáy có mấu viền riêng ở đỉnh)
    g = gay.copy()
    g[..., 3] = g[..., 3] * ((1 - w) + w * np.minimum(a_moi, 1))
    g = g.round().clip(0, 255).astype(np.uint8)
    g[g[..., 3] == 0] = 0
    Image.fromarray(g, 'RGBA').save(os.path.join(MANH, TEN_GAY), optimize=True)
    lap = int((S2 & ~S & vung).sum())
    got = int((S & ~S2 & vung).sum())
    print('bo_chop: lấp khấc', lap, 'px, gọt', got, 'px, viền đen', DAY_VIEN, 'px →', TEN_MOI)
    return lap


def sua_rig(doc):
    nut = doc['rig']['nut']
    nut['chop-mu']['hien'] = False
    nut['chop-mu']['ghi_chu'] = 'TẮT 27/10/2026 – chủ dự án bỏ hẳn chóp mũ (bo_chop.py)'
    nut['mu']['anh'] = 'manh/' + TEN_MOI
    nut['mu-gay']['anh'] = 'manh/' + TEN_GAY
    nut['mu-gay']['ghi_chu'] = 'lớp gáy mũ (vẽ sau thân); không chóp nên luôn lộ – đỉnh đã cắt theo đường bao mới (bo_chop.py)'
    nut['mu']['ghi_chu'] = 'mũ không chóp: đỉnh-sau đã lấp khấc + kẻ lại viền đen (bo_chop.py); bản có chóp = manh/mu.png'
    doc['bo_chop'] = {'ngay': '2026-10-27', 'chop_mu_hien': False, 'manh_mu': 'manh/' + TEN_MOI, 'manh_mu_gay': 'manh/' + TEN_GAY,
                      'ly_do': 'chủ dự án: "Ý tôi là cắt hẳn chóp mũ trong giao diện"'}
    return doc


def main():
    lam_manh()
    doc = sua_rig(load_json())
    save_json(doc)
    print('bo_chop: rig đã tắt chop-mu, mu →', TEN_MOI)


if __name__ == '__main__':
    main()
