#!/usr/bin/env python3
"""BẬT KHỎI VÁCH bằng HÌNH CÓ SẴN (29/10 – người dùng chọn KHÔNG gen; ảnh thu6-bat-vach-LOI-khong-dung.png là bản gen hỏng, không dùng).

    python3 dung_bat_moc.py

Lấy ô cuối sheet móc tường (WM4, sprite/lam-moi5-tuong_moc-{2x,3x}) → 2 khung BM1 / BM2, cùng cỡ khung + cùng điểm neo + cùng hướng
(mẫu vách PHẢI, Lam nhìn vào vách; vách trái lật cả hình) → sprite/lam-moi5-bat_moc-{2x,3x}.png/.json + kiem/thu5-bat_moc-dai.png.
Móc RÚT VỀ TAY bằng code: tách lớp "nắm tay + móc" (phần không phải mũ, phía trên mép mũ, bên phải trục) rồi
    BM1 (tick nhảy):     lớp móc xoay ngả về sau 25°, dịch (−3, +7) px logic – đầu móc rời mép collider, KHÔNG còn cắm vách; vẽ TRƯỚC mũ
    BM2 (tick sau):      xoay 60°, thu 0,8, dịch (−7, +16) – móc gập về sau đầu; vẽ SAU thân (khuất dần sau mũ)
Game: BM1 ngay tick bấm nhảy tường, BM2 tick kế (wjT 16) → lật nhìn ra phòng, J1 (wjT 15–14) → J2 như thường. Không thêm thời gian chờ,
physics / impulse / collider không đổi. Chỉ dùng khi bám bằng móc (mặc định); ?tuong=lung|mat giữ J1 như trước.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__)); GOC = os.path.normpath(os.path.join(HERE, '..'))
SP = os.path.join(GOC, 'sprite'); KIEM = os.path.join(GOC, 'kiem')
BUOC = [('BM1', 25, 1.0, (-3, 7), 'truoc'), ('BM2', 60, 0.8, (-7, 16), 'sau')]   # nhãn, xoay (độ, ngả về sau), thu, dịch px logic, lớp


def tach_moc(fr, boi, ax, ay):
    """mặt nạ lớp nắm tay + móc trong khung WM4 (px khung) – vùng đo tay trên lưới logic (xem dưới); giữ thành phần liên thông chứa đầu móc."""
    a = fr[..., 3] > 40; r, g, b = [fr[..., i].astype(int) for i in range(3)]
    H, W = a.shape; yy, xx = np.mgrid[0:H, 0:W]
    lx, ly = (xx - ax) / boi, (yy - ay) / boi
    xanh = (b > r + 15) & a
    vien = (g >= r - 3) & (np.maximum(np.maximum(r, g), b) > 90) & a   # viền ngà-xám của mép mũ
    # đa giác đo trên lưới 1 px logic (WM4 3x): móc + nắm tay nằm trên y −98, bên phải x −19 (phần nắm tay sát mũ y ≥ −108: bên phải x −16,
    # vì dải viền mũ ở x −21…−17); không lấy điểm xanh (mũ) / viền ngà
    vung = a & (ly < -98) & (((ly < -108) & (lx > -19)) | (lx > -16)) & ~xanh & ~vien
    lab, n = ndi.label(vung)
    if not n: raise SystemExit('không tách được lớp móc')
    ys, xs = np.nonzero(vung); j = np.argmin(ys - 0.2 * xs)
    m = lab == lab[ys[j], xs[j]]
    lop = ndi.binary_dilation(m, iterations=1) & a
    # xoá ở hình gốc: thêm viền mờ (alpha thấp) quanh móc để không còn vệt mờ tại chỗ cũ
    xoa = lop | (ndi.binary_dilation(m, iterations=2 * boi) & (fr[..., 3] > 0) & (ly < -98) & ~xanh & ~vien & (fr[..., 3] < 200))
    return lop, xoa


def bien_doi(lop, tam, goc, thu, dich, boi):
    im = Image.fromarray(lop)
    # xoay quanh nắm tay; goc dương = đầu móc ngả về SAU (sang trái khi nhìn phải) = ngược chiều kim đồng hồ trên ảnh
    im = im.rotate(goc, resample=Image.BICUBIC, center=tam)
    if thu != 1.0:
        w, h = im.size; s = im.resize((round(w * thu), round(h * thu)), Image.LANCZOS)
        o = Image.new('RGBA', (w, h)); o.alpha_composite(s, (round(tam[0] - tam[0] * thu), round(tam[1] - tam[1] * thu))); im = o
    o = Image.new('RGBA', im.size); o.paste(im, (round(dich[0] * boi), round(dich[1] * boi)), im)   # paste nhận toạ độ âm
    return o


def dung(boi):
    m = json.load(open(os.path.join(SP, 'lam-moi5-tuong_moc-%dx.json' % boi), encoding='utf-8'))
    sh = np.asarray(Image.open(os.path.join(SP, m['anh'])).convert('RGBA'))
    f = [x for x in m['frames'] if x['nhan'] == 'WM4'][0]; so = [s for s in m['so_do'] if s['nhan'] == 'WM4'][0]
    fr = sh[f['y']:f['y'] + f['h'], f['x']:f['x'] + f['w']].copy(); ax, ay = m['diem_neo']['x'], m['diem_neo']['y']
    mk, xoa = tach_moc(fr, boi, ax, ay)
    lop = fr.copy(); lop[~mk] = 0
    goc_ = fr.copy(); goc_[xoa] = 0
    ys, xs = np.nonzero(mk)
    # nắm tay = phần thấp nhất của lớp (20 % dưới) → tâm xoay
    yc = ys.max() - 0.2 * (ys.max() - ys.min()); sel = ys >= yc; tam = (float(xs[sel].mean()), float(ys[sel].mean()))
    KH = []
    for nhan, goc, thu, dich, lopv in BUOC:
        l2 = bien_doi(lop, tam, goc, thu, dich, boi); base = Image.fromarray(goc_)
        o = Image.new('RGBA', base.size)
        if lopv == 'truoc': o.alpha_composite(base); o.alpha_composite(l2)
        else: o.alpha_composite(l2); o.alpha_composite(base)
        KH.append((nhan, o, l2))
    fw, fh = f['w'], f['h']; KHE = m['luoi']['khe_px']
    out = Image.new('RGBA', (2 * fw + KHE, fh)); frames = []; so_ra = []
    for i, (nhan, o, l2) in enumerate(KH):
        out.paste(o, (i * (fw + KHE), 0)); frames.append({'i': i, 'nhan': nhan, 'x': i * (fw + KHE), 'y': 0, 'w': fw, 'h': fh, 'tu': 'WM4'})
        a = np.asarray(l2)[..., 3] > 40; yy, xx = np.nonzero(a)
        s2 = dict(so); s2['o'] = i + 1; s2['nhan'] = nhan; s2.pop('dau_moc_logic', None)
        s2['dau_moc_rut_logic'] = [round((xx.max() + 1 - ax) / boi, 1), round((yy.min() - ay) / boi, 1)] if len(xx) else None
        so_ra.append(s2)
    arr = np.asarray(out).copy(); arr[arr[..., 3] == 0, :3] = 0
    anh = 'lam-moi5-bat_moc-%dx.png' % boi; Image.fromarray(arr).save(os.path.join(SP, anh), optimize=True)
    meta = dict(m); meta.update({'ten': 'Lam mới – bật khỏi vách bằng móc (BM1 / BM2, dựng từ WM4 bằng code), sprite sheet %dx' % boi,
        'vai': 'bat_moc', 'tu_the': ['BM1', 'BM2'], 'anh': anh, 'co_sheet': [out.width, out.height], 'luoi': {'cot': 2, 'hang': 1, 'khe_px': KHE},
        'frames': frames, 'so_do': so_ra, 'nguon_anh_gen': m['nguon_anh_gen'] + ' (ô WM4) – KHÔNG gen mới',
        'dung_bang': 'code/dung_bat_moc.py: tách lớp nắm tay + móc của WM4, xoay / thu / dịch (BM1 25° (−3,+7) trước mũ; BM2 60° ×0,8 (−7,+16) sau thân)',
        'huong': 'Như WM: mẫu VÁCH PHẢI, Lam nhìn vào vách; vách trái lật cả hình. Tick sau BM2 game lật nhìn ra phòng (J1).'})
    json.dump(meta, open(os.path.join(SP, 'lam-moi5-bat_moc-%dx.json' % boi), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return fr, KH, (ax, ay), so_ra


def main():
    r = {b: dung(b) for b in (2, 3)}
    fr, KH, (ax, ay), so = r[2]
    cols = [('WM4 (gốc)', Image.fromarray(fr))] + [(n, o) for n, o, _ in KH]
    W, H = fr.shape[1], fr.shape[0]; o = Image.new('RGB', (len(cols) * (W + 8) + 8, H + 30), (40, 44, 52)); d = ImageDraw.Draw(o)
    for i, (t, im) in enumerate(cols):
        g = Image.new('RGBA', (W, H), (128, 128, 128, 255)); g.alpha_composite(im); gd = ImageDraw.Draw(g)
        gd.line([(ax + 20, 0), (ax + 20, H)], fill=(220, 60, 60))   # mép collider phía vách (10 px logic × 2)
        gd.line([(ax, 0), (ax, H)], fill=(60, 160, 220))
        o.paste(g.convert('RGB'), (8 + i * (W + 8), 26)); d.text((10 + i * (W + 8), 6), t, fill=(230, 230, 230))
    o.save(os.path.join(KIEM, 'thu5-bat_moc-dai.png'))
    for s in so: print(s['nhan'], 'đầu móc sau khi rút (so với chân, px logic):', s['dau_moc_rut_logic'], '(mép collider phía vách = 10)')
    # danh sách game
    p = os.path.join(SP, 'thu3-danh-sach.json'); ds = json.load(open(p, encoding='utf-8'))
    ds['sheets'] = [x for x in ds['sheets'] if x['ten'] != 'lam-moi5-bat_moc'] + [{'ten': 'lam-moi5-bat_moc', 'bo': 5, 'vai': 'bat_moc', 'tu_the': ['BM1', 'BM2'], 'co_3x': True}]
    json.dump(ds, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
