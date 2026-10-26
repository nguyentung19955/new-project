"""Xuất bộ Lam cutout v5 (mảnh giữ nguyên v4): python3 xuat.py
→ ../manh/*.png (RGBA tô mask), ../manh/sheet-xam.png, ../manh/sheet-to-mask.png, ../lam-v5.json"""
import os, json, copy
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import khuon4 as K, khung, meta, do_mau, rap4
from chung import font

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
MANH = os.path.join(ROOT, 'manh')
CANVAS, DAT_Y = (520, 520), 468


def diem_de(p):
    """Điểm tiếp xúc đế ủng (px trong ảnh ủng): giữa / gót / mũi trên mép dưới alpha.
    Lấy hàng thấp nhất có alpha rồi đo bề rộng 3 hàng dưới cùng (đế phẳng)."""
    ys, xs = np.nonzero(p.mask)
    yb = int(ys.max())
    rows = p.mask[yb - 2:yb + 1].any(0)
    xi = np.nonzero(rows)[0]
    x0, x1 = float(xi.min()), float(xi.max() + 1)
    y = float(yb + 1)              # mép dưới của hàng thấp nhất
    return dict(giua=[round((x0 + x1) / 2, 2), y], got=[x0, y], mui=[x1, y])


def build_assets(cfg=None, t_out=None, t_in=None):
    pc = K.build(cfg)
    for n in ('ung-gan', 'ung-xa'):
        pc[n].extra['diem_de'] = diem_de(pc[n])
    names = K.PIECES
    dims = meta.dims_of(pc, names)
    imgs = {n + '.png': pc[n].rgba('mau', far=n.endswith('-xa'), t_out=t_out, t_in=t_in) for n in names}
    return pc, dims, imgs


def rig_v4(pc, dims, imgs, attach=None, verbose=False):
    """Trả (R, bao_cao, root). Góc nghỉ GIẢI LẠI từ ảnh mẫu mỗi lần xuất (do_mau.suy_dang_nghi) với điểm gắn v4."""
    R0 = khung.rig_tu_v2(dims)                          # bước 1: v2 → cục bộ (vị trí giữ nguyên)
    R, rep, root = do_mau.suy_dang_nghi(pc, dims, R0, attach or khung.ATTACH_V4, khung.IK_SIDES)
    for n in khung.VISIBLE_FALSE:                       # v4: tắt rõ, giữ vị trí cục bộ v2 (không dịch giấu)
        R[n]['gan'] = list(R0[n]['gan']); R[n]['goc_nghi'] = R0[n]['goc_nghi']
        R[n]['visible'] = False
        R[n]['ghi_chu'] = 'không thấy trên ảnh 02 – visible=false ở rig nhìn ngang; PNG giữ để bật theo pose có chủ đích'
    for i, n in enumerate(khung.ORDER_V3):
        R[n]['slot'] = 10 * (i + 1)
        R[n]['thu_tu_phu'] = khung.thu_tu_phu(n)
    R['chop-mu']['ghi_chu'] = 'vẽ dưới mũ chính; phần nối quạt ẩn dưới mũ là vùng bù khi lắc'
    return R, rep, root


def extra_meta(pc, dims):
    nap = pc['_nap']
    ik = []
    for c in khung.IK_CHAINS:
        c = dict(c); b = c['xuong'][2]
        c['diem_de'] = dims[b]['diem_de']['giua']
        c['diem_de_got_mui'] = [dims[b]['diem_de']['got'], dims[b]['diem_de']['mui']]
        ik.append(c)
    return dict(vien=K.T_LINE, xa_toi=K.FAR, palette=K.PAL,
                khop=dict(ghi_chu='Khớp lồng: cha có nắp tròn bán kính R tại D (có viền); con có nắp ẩn R − vien tại P, '
                                  'viền con tính trên hình kéo dài nên không kẻ vành ống. Khuỷu v4: đoạn chuyển tiếp Z px '
                                  'thế giới (bề rộng + nêm bóng nội suy), xem CHANGELOG-V4.',
                          ban_kinh=nap, khuyu=_json_safe(pc.get('_khuyu', {}))),
                phu=khung.PHU, slot_theo_tu_the=khung.SLOT_THEO_TU_THE, ik=ik,
                khoa_chan=dict(pha='chỉ khoá ở pha chịu lực (chạm đất → đạp); pha bay không khoá',
                               dich='điểm đế thế giới diem_de + hướng ủng thế giới → cổ chân = đích IK',
                               ngoai_tam='hạ root theo Rig.ha_goc_can_thiet (báo px), hoặc giảm lean; không kéo xương'),
                gioi_han_goc=dict(delta=khung.GIOI_HAN_GOC, the_gioi=khung.GIOI_HAN_GOC_THE_GIOI))


def _json_safe(o):
    if isinstance(o, dict):
        return {k: _json_safe(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [_json_safe(v) for v in o]
    if isinstance(o, (np.floating, float)):
        return round(float(o), 4)
    if isinstance(o, np.integer):
        return int(o)
    return o


def write_json(R, dims, root, pc, path):
    M = meta.meta_json(R, dims, root=root, canvas=CANVAS, dat_y=DAT_Y, extra=extra_meta(pc, dims))
    json.dump(M, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return M


SHEET_ROWS = [['mu', 'mat', 'chop-mu', 'than', 'capelet-sau', 'capelet-truoc'],
              ['vat-sau', 'vat-truoc', 'dai', 'bao-dao', 'chuong', 'dao'],
              ['tay-tren-gan', 'cang-tay-gan', 'gang-gan', 'tay-tren-xa', 'cang-tay-xa', 'gang-xa'],
              ['dui-gan', 'cang-chan-gan', 'ung-gan', 'dui-xa', 'cang-chan-xa', 'ung-xa']]


def sheet(pc, mode):
    F = font(12)
    W, H = 1536, 1060
    t = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(t)
    RH = [340, 230, 240, 250]; y = 0
    for row, rh in zip(SHEET_ROWS, RH):
        widths = [380, 110, 230, 260, 280, 276] if row[0] == 'mu' else [256] * 6
        x = 0
        for n, cw in zip(row, widths):
            p = pc[n]; im = p.rgba(mode, far=n.endswith('-xa') and mode == 'mau')
            ox, oy = x + (cw - im.width) // 2, y + 16 + (rh - 16 - im.height) // 2
            t.paste(im, (ox, oy), im)
            for q, col in ((p.P, (230, 0, 0)), (p.D, (0, 170, 0))):
                if q is not None:
                    d.ellipse([ox + q[0] - 3, oy + q[1] - 3, ox + q[0] + 3, oy + q[1] + 3], outline=col, width=2)
            lab = n + ('' if p.bone() is None else '  xương %.1f' % p.bone())
            d.text((x + 4, y + 2), lab, fill=(0, 0, 0), font=F)
            x += cw
        y += rh
    d.text((4, H - 16), 'Chấm đỏ = P (khớp gần), chấm xanh = D (khớp xa). Đơn vị px thế giới (Lam cao ~470). '
           'Viền %d px; phía xa tối %d %%.' % (K.T_LINE, round((1 - K.FAR) * 100)), fill=(0, 0, 0), font=F)
    return t


def main():
    os.makedirs(MANH, exist_ok=True)
    pc, dims, imgs = build_assets()
    for f, im in imgs.items():
        im.save(os.path.join(MANH, f))
    # bản xám từng mảnh (để tô tay nếu cần)
    os.makedirs(os.path.join(MANH, 'xam'), exist_ok=True)
    for n in K.PIECES:
        pc[n].rgba('xam').save(os.path.join(MANH, 'xam', n + '.png'))
    sheet(pc, 'xam').save(os.path.join(MANH, 'sheet-xam.png'))
    sheet(pc, 'mau').save(os.path.join(MANH, 'sheet-to-mask.png'))
    R, rep, root = rig_v4(pc, dims, imgs)
    write_json(R, dims, root, pc, os.path.join(ROOT, 'lam-v5.json'))
    os.makedirs(os.path.join(ROOT, 'kiem-thu'), exist_ok=True)
    json.dump(rep, open(os.path.join(ROOT, 'kiem-thu', '01-do-mau-ketqua.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print('xuất xong:', len(imgs), 'mảnh; lam-v5.json')


if __name__ == '__main__':
    main()
