"""Xuất bộ Lam cutout v3: python3 xuat.py
→ ../manh/*.png (RGBA tô mask), ../manh/sheet-xam.png, ../manh/sheet-to-mask.png, ../lam-v3.json"""
import os, json, copy
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import khuon3 as K, khung, meta, do_mau, rap3

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
MANH = os.path.join(ROOT, 'manh')
CANVAS, DAT_Y = (520, 520), 468


def build_assets(cfg=None, t_out=None, t_in=None):
    pc = K.build(cfg)
    names = K.PIECES
    dims = meta.dims_of(pc, names)
    imgs = {n + '.png': pc[n].rgba('mau', far=n.endswith('-xa'), t_out=t_out, t_in=t_in) for n in names}
    return pc, dims, imgs


def rig_v3(pc, dims, imgs, verbose=False):
    """Trả (R, bao_cao, root). Giá trị nghỉ tính lại từ ảnh mẫu mỗi lần xuất (do_mau.suy_dang_nghi)."""
    R0 = khung.rig_tu_v2(dims)                          # bước 1: v2 → cục bộ (vị trí giữ nguyên)
    R, rep, root = do_mau.suy_dang_nghi(pc, dims, R0, khung.ATTACH_V3, khung.IK_SIDES)
    for n, (dx, dy, a) in khung.AN_KHI_NGHI.items():   # mảnh ẩn ở dáng nghỉ
        R[n]['gan'] = [R0[n]['gan'][0] + dx, R0[n]['gan'][1] + dy]; R[n]['goc_nghi'] = a
        R[n]['ghi_chu'] = 'không thấy trên ảnh 02 – đặt bị che lúc nghỉ (CHANGELOG)'
    for i, n in enumerate(khung.ORDER_V3):
        R[n]['slot'] = 10 * (i + 1)
    R['chop-mu']['ghi_chu'] = 'vẽ dưới mũ chính; phần nối quạt ẩn dưới mũ là vùng bù khi lắc'
    return R, rep, root


def extra_meta(pc):
    nap = pc['_nap']
    return dict(vien=K.T_LINE, xa_toi=K.FAR, palette=K.PAL,
                khop=dict(ghi_chu='Khớp lồng: cha có nắp tròn bán kính R tại D (có viền); con có nắp ẩn R − vien tại P, '
                                  'viền con tính trên hình kéo dài nên không kẻ vành ống.',
                          ban_kinh=nap),
                phu=khung.PHU, slot_theo_tu_the=khung.SLOT_THEO_TU_THE)


def write_json(R, dims, root, pc, path):
    M = meta.meta_json(R, dims, root=root, canvas=CANVAS, dat_y=DAT_Y, extra=extra_meta(pc))
    json.dump(M, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return M


SHEET_ROWS = [['mu', 'mat', 'chop-mu', 'than', 'capelet-sau', 'capelet-truoc'],
              ['vat-sau', 'vat-truoc', 'dai', 'bao-dao', 'chuong', 'dao'],
              ['tay-tren-gan', 'cang-tay-gan', 'gang-gan', 'tay-tren-xa', 'cang-tay-xa', 'gang-xa'],
              ['dui-gan', 'cang-chan-gan', 'ung-gan', 'dui-xa', 'cang-chan-xa', 'ung-xa']]


def sheet(pc, mode):
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
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
    R, rep, root = rig_v3(pc, dims, imgs)
    write_json(R, dims, root, pc, os.path.join(ROOT, 'lam-v3.json'))
    os.makedirs(os.path.join(ROOT, 'kiem-thu'), exist_ok=True)
    json.dump(rep, open(os.path.join(ROOT, 'kiem-thu', '01-do-mau-ketqua.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print('xuất xong:', len(imgs), 'mảnh; lam-v3.json')


if __name__ == '__main__':
    main()
