#!/usr/bin/env python3
"""PH15 bước 1 mục 3 – ĐO LẠI CỠ NGƯỜI LÚC BÁM MÓC so với dáng đứng / nhảy, CÙNG THANG (px logic, Lam chốt cao 112), KHÔNG tính móc / tay giơ.

    python3 art/huong-moi/lam-tu-the-2/code/do_moc_ph15.py [thư mục sheet móc CŨ để so]

Đo tự động trên sheet đang dùng (sprite/*-2x):
    chuông  – căn(diện tích) mảng đồng ấm lớn nhất dưới mắt (chuông cổ áo; vật cứng → không đổi cỡ theo dáng)
    mắt     – căn(diện tích mắt) từ so_do của sheet
Đo TAY (lưới 5 px logic, ảnh 3×, ghi trong SO_TAY): rộng khe mặt, mắt → dây thắt cổ, cao / rộng chuông.
Ra: kiem/ph15-so-moc.json + kiem/ph15-so-moc.png (đứng I1 · móc WM2 TRƯỚC · móc WM2 SAU · rơi F2 – căn theo mắt, cùng thang 2x; vạch vàng = mắt, đỏ = đất).
Kết luận số: sheet móc vẽ người to ĐỀU ~1,23 lần (chuông, khe mặt, găng cùng to) → bang-thu3.json "k_nhan": 0,81 cho cả sheet (dung_thu3.py)."""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__)); GOC = os.path.normpath(os.path.join(HERE, '..')); SP = os.path.join(GOC, 'sprite')
SO_TAY = {'_cach': 'đo tay trên ảnh 3× có lưới 5 px logic, dáng đứng I1 và móc WM2 TRƯỚC sửa (k cũ), cùng thang 2x, căn mắt',
          'khe_mat_rong': [17.5, 21.7], 'mat_den_day_that': [12.5, 17.8], 'chuong_cao': [14.2, 18.3], 'chuong_rong': [10.8, 14.2], 'mat_cao': [6.7, 7.5]}


def chuong(path):
    m = json.load(open(path, encoding='utf-8')); d = os.path.dirname(path); sh = np.asarray(Image.open(os.path.join(d, m['anh'])).convert('RGBA')).astype(int)
    ax, ay = m['diem_neo']['x'], m['diem_neo']['y']; b = m['ty_le']['px_nguon_moi_px_logic']; ra = {}
    for f, s in zip(m['frames'], m['so_do']):
        a = sh[f['y']:f['y'] + f['h'], f['x']:f['x'] + f['w']]
        if not s['mat_logic']: continue
        ex, ey = ax + b * s['mat_logic'][0], ay + b * s['mat_logic'][1]
        r, g, bb, al = [a[..., i] for i in range(4)]
        warm = (al > 180) & (r > g) & (g > bb) & (r - bb > 45) & (r > 70)
        H, W = warm.shape; yy, xx = np.mgrid[0:H, 0:W]
        lab, k = ndi.label(warm & (yy > ey) & (yy < ey + b * 40) & (abs(xx - ex) < b * 30))
        if not k: continue
        sz = ndi.sum(np.ones_like(lab), lab, range(1, k + 1))
        ra[f['nhan']] = {'chuong_can_dien_tich': round(float(np.sqrt(sz.max())) / b, 2), 'mat_can_dien_tich': round(float(np.sqrt(s['mat_dien_tich_logic'])), 2) if s.get('mat_dien_tich_logic') else None}
    return ra, m


def tv(d, k, nh): v = [d[n][k] for n in nh if n in d and d[n][k]]; return float(np.median(v)) if v else None


def main():
    cu = sys.argv[1] if len(sys.argv) > 1 else None
    dung, _ = chuong(os.path.join(SP, 'lam-moi3-dung-2x.json')); nhay, _ = chuong(os.path.join(SP, 'lam-moi3-nhay-2x.json'))
    moc, mm = chuong(os.path.join(SP, 'lam-moi5-tuong_moc-2x.json'))
    WM = ['WM1', 'WM2', 'WM3', 'WM4']
    out = {'ghi_chu': __doc__.split('\n\n')[0], 'k_nhan_dang_dung': mm.get('k_nhan'), 'so_tay_truoc_sua': SO_TAY,
           'tu_dong_sau_sua': {'dung': dung, 'nhay': nhay, 'moc': moc},
           'ty_so_sau_sua': {'chuong_moc_tren_dung': round(tv(moc, 'chuong_can_dien_tich', WM) / tv(dung, 'chuong_can_dien_tich', ['I1', 'I2', 'I3']), 3),
                             'chuong_moc_tren_nhay': round(tv(moc, 'chuong_can_dien_tich', WM) / tv(nhay, 'chuong_can_dien_tich', ['J1', 'J2', 'J3', 'F1', 'F2']), 3),
                             'mat_moc_tren_dung': round(tv(moc, 'mat_can_dien_tich', WM) / tv(dung, 'mat_can_dien_tich', ['I1', 'I2', 'I3']), 3)}}
    if cu:
        mc, mo = chuong(os.path.join(cu, 'lam-moi5-tuong_moc-2x.json')); out['tu_dong_truoc_sua'] = {'moc': mc}
        out['ty_so_truoc_sua'] = {'chuong_moc_tren_dung': round(tv(mc, 'chuong_can_dien_tich', WM) / tv(dung, 'chuong_can_dien_tich', ['I1', 'I2', 'I3']), 3),
                                  'chuong_moc_tren_nhay': round(tv(mc, 'chuong_can_dien_tich', WM) / tv(nhay, 'chuong_can_dien_tich', ['J1', 'J2', 'J3', 'F1', 'F2']), 3),
                                  'mat_moc_tren_dung': round(tv(mc, 'mat_can_dien_tich', WM) / tv(dung, 'mat_can_dien_tich', ['I1', 'I2', 'I3']), 3),
                                  'so_tay_moc_tren_dung': {k: round(v[1] / v[0], 3) for k, v in SO_TAY.items() if not k.startswith('_')}}
        # ảnh so
        def fr(path, nh):
            m = json.load(open(path, encoding='utf-8')); d = os.path.dirname(path); sh = Image.open(os.path.join(d, m['anh'])).convert('RGBA')
            i = m['tu_the'].index(nh); f = m['frames'][i]; s = m['so_do'][i]
            return sh.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])), m['diem_neo']['x'], m['diem_neo']['y'], s
        cols = [('đứng I1', fr(os.path.join(SP, 'lam-moi3-dung-2x.json'), 'I1')), ('móc WM2 TRƯỚC', fr(os.path.join(cu, 'lam-moi5-tuong_moc-2x.json'), 'WM2')),
                ('móc WM2 SAU (×0,81)', fr(os.path.join(SP, 'lam-moi5-tuong_moc-2x.json'), 'WM2')), ('rơi F2', fr(os.path.join(SP, 'lam-moi3-nhay-2x.json'), 'F2'))]
        W, H, G = 300, 380, 330
        o = Image.new('RGB', (len(cols) * W, H), (128, 128, 128)); d = ImageDraw.Draw(o)
        try: ft = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
        except Exception: ft = ImageFont.load_default()
        for k, (t, (im, ax, ay, s)) in enumerate(cols):
            x = k * W + W // 2; o.paste(im, (int(x - ax), int(G - ay)), im); d.text((k * W + 8, H - 26), t, font=ft, fill=(255, 240, 200))
        d.line([(0, G), (o.width, G)], fill=(200, 60, 60)); d.line([(0, G - 145), (o.width, G - 145)], fill=(240, 200, 60))
        o.save(os.path.join(GOC, 'kiem', 'ph15-so-moc.png'))
    json.dump(out, open(os.path.join(GOC, 'kiem', 'ph15-so-moc.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({k: out[k] for k in out if k.startswith('ty_so')}, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
