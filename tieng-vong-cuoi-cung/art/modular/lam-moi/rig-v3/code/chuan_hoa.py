"""Bước 1c: chuẩn hoá cỡ mảnh về cỡ ảnh nhìn ngang (theo ../manh/goc/khop.json) → ../manh/<ten>.png.
- Chỉ PHÓNG (không xoay): góc đo được là góc của dáng nghỉ, ghi vào JSON chứ không nướng vào ảnh.
- Đặt tên theo vai trò trong rig: ủng chỗ trước → ung-gan, ủng chỗ sau → ung-xa (xem GHI-CHU.md).
- Mắt: mat-gan = mắt thấy trên ảnh ngang (phóng không đều: ngang ×sx, dọc ×sy);
  mat-xa = bản hẹp hơn (×0,70 ngang, ×0,94 dọc) và tối hơn 20 % – dành cho góc quay 3/4 sau này,
  ở 4 tư thế nhìn ngang thì ẨN (ảnh nhìn ngang chỉ thấy 1 mắt).
- MỚI ở v2 – hai ủng cùng cỡ: rig-v1 phóng ủng gần ×0,934, ủng xa ×0,971 (đo riêng từng chỗ trên ảnh ngang).
  v2 lấy cỡ chung = trung bình cỡ đã đo (căn bậc hai diện tích), rồi phóng ĐỀU mỗi ủng sao cho diện tích bóng
  bằng nhau → hai ủng to bằng nhau (lệch bề ngang/cao ≤ 1 %), không bóp méo hình vẽ bảng mảnh.
  Điểm neo hai ủng định nghĩa giống hệt nhau trong rig.py (giữa đế, gót/mũi ở 22 %/78 % bề dài đế)."""
import os
import json
import numpy as np
from PIL import Image
from chung import MANH

TEN_MOI = {'mu': 'mu', 'chop-mu': 'chop-mu', 'than': 'than', 'tay-truoc': 'tay-truoc-dao',
           'tay-sau': 'tay-sau', 'chuong': 'chuong'}
MAT_XA = {'ngang': 0.70, 'doc': 0.94, 'sang': 0.80}


def resize_rgba(im, w, h):
    """Phóng có nhân alpha trước (premultiplied) để mép không bị quầng màu lạ."""
    a = np.array(im).astype(np.float64)
    al = a[..., 3:4] / 255.0
    pm = np.dstack([a[..., :3] * al, a[..., 3:4]])
    chans = [np.array(Image.fromarray(pm[..., c].astype(np.float32), 'F').resize((w, h), Image.LANCZOS))
             for c in range(4)]
    o = np.dstack(chans)
    A = np.clip(o[..., 3], 0, 255)
    rgb = np.where(A[..., None] > 0.5, o[..., :3] / np.maximum(A[..., None], 1e-6) * 255.0, 0)
    out = np.dstack([np.clip(rgb, 0, 255), A]).round().astype(np.uint8)
    out[A < 2] = 0
    return Image.fromarray(out, 'RGBA')


def he_so_ung_chung(K, gan):
    """hệ số mới cho 2 ủng: diện tích bóng bằng nhau, = trung bình (căn bậc hai diện tích) của cỡ đã đo."""
    can = {}
    for g in (gan['cho_truoc'], gan['cho_sau']):
        a = np.array(Image.open(os.path.join(MANH, 'goc', g + '.png')))[..., 3] > 128
        can[g] = float(np.sqrt(a.sum()))
    muc_tieu = np.mean([can[g] * K[g]['he_so'] for g in can])
    return {g: round(float(muc_tieu / can[g]), 4) for g in can}, round(float(muc_tieu), 2)


def main():
    K = json.load(open(os.path.join(MANH, 'goc', 'khop.json'), encoding='utf-8'))
    gan = K['_gan_ung']
    ten = dict(TEN_MOI)
    ten[gan['cho_truoc']] = 'ung-gan'
    ten[gan['cho_sau']] = 'ung-xa'
    hs_ung, can_dt = he_so_ung_chung(K, gan)
    out = {}
    for goc, moi in ten.items():
        v = K[goc]
        im = Image.open(os.path.join(MANH, 'goc', goc + '.png')).convert('RGBA')
        s = hs_ung.get(goc, v['he_so'])
        w, h = round(im.width * s), round(im.height * s)
        resize_rgba(im, w, h).save(os.path.join(MANH, moi + '.png'))
        out[moi] = {'tu_manh_goc': goc, 'co_goc': list(im.size), 'he_so': s, 'co_moi': [w, h],
                    'tam_tren_anh_ngang': v['tam'], 'goc_nghi': v['goc'],
                    'tam_moi': [im.width * s / 2, im.height * s / 2]}
        if goc in hs_ung:
            out[moi]['he_so_do_tren_anh_ngang_v1'] = v['he_so']
            out[moi]['can_dien_tich_chung_px'] = can_dt
    v = K['mat']
    im = Image.open(os.path.join(MANH, 'goc', 'mat.png')).convert('RGBA')
    sx, sy = v['he_so_ngang'], v['he_so_doc']
    w, h = round(im.width * sx), round(im.height * sy)
    resize_rgba(im, w, h).save(os.path.join(MANH, 'mat-gan.png'))
    out['mat-gan'] = {'tu_manh_goc': 'mat', 'co_goc': list(im.size), 'he_so_ngang': sx, 'he_so_doc': sy,
                      'co_moi': [w, h], 'tam_tren_anh_ngang': v['tam'], 'goc_nghi': 0.0,
                      'tam_moi': [im.width * sx / 2, im.height * sy / 2]}
    w2, h2 = round(w * MAT_XA['ngang']), round(h * MAT_XA['doc'])
    far = np.array(resize_rgba(im, w2, h2)).astype(float)
    far[..., :3] *= MAT_XA['sang']
    Image.fromarray(far.round().astype(np.uint8), 'RGBA').save(os.path.join(MANH, 'mat-xa.png'))
    out['mat-xa'] = {'tu_manh_goc': 'mat', 'tu_mat_gan': MAT_XA, 'co_moi': [w2, h2], 'tam_moi': [w2 / 2, h2 / 2]}
    with open(os.path.join(MANH, 'goc', 'chuan-hoa.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    for k, v in out.items():
        print(f"{k:14s} {v.get('co_goc', '')} → {v['co_moi']}  hệ số {v.get('he_so', v.get('he_so_doc', ''))}")


if __name__ == '__main__':
    main()
