# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt các tấm ChatGPT thay "hình vẽ bằng code" (docs/demo-hop-tuong/HINH-VE-CODE-AUDIT.md).
Nguồn: docs/demo-hop-tuong/thap-art/raw_s1..s7*.png (nền magenta) → thap/assets/*.png, thap/assets/glyph/*.png
Ô được tìm bằng khối liền (connected components), mỗi khối gán vào ô lưới theo trọng tâm → chịu được ảnh lệch lưới.
Chạy: python3 tools/thap-cat-ui.py   (in bảng kích thước + kiểm tra vòng tròn; ghi tờ tổng hợp cut_contact.png)
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
DICH = os.path.join(GOC, 'thap/assets')
os.makedirs(os.path.join(DICH, 'glyph'), exist_ok=True)

# tach_nen: chép từ tools/thap-cat-hinh.py (file đó chạy cả quy trình khi import)
_src = open(os.path.join(GOC, 'tools/thap-cat-hinh.py'), encoding='utf-8').read().split('\n')
exec('\n'.join(_src[17:58]))  # def tach_nen(im, mau)

BAO = []      # (tên, kích thước, ghi chú) để in bảng
DA_CAT = []   # đường dẫn đã ghi (tờ tổng hợp)


def mo(ten):
    return Image.open(os.path.join(NGUON, ten)).convert('RGB')


def nhom_o(alpha, cols, rows, gian=6, nho=40, khung=None):
    """Gán các khối liền vào ô lưới theo trọng tâm. Trả {(r,c): bbox}."""
    H, W = alpha.shape
    m = alpha > 0.35
    md = nd.binary_dilation(m, iterations=gian)
    lab, n = nd.label(md)
    o = {}
    for i, sl in enumerate(nd.find_objects(lab)):
        if sl is None:
            continue
        thuc = m[sl] & (lab[sl] == i + 1)
        dt = int(thuc.sum())
        if dt < nho:
            continue
        ys, xs = np.nonzero(thuc)
        cy, cx = ys.mean() + sl[0].start, xs.mean() + sl[1].start
        if khung:
            r = next(k for k, (a, b) in enumerate(khung[0]) if a <= cy < b) if any(a <= cy < b for a, b in khung[0]) else None
            c = next(k for k, (a, b) in enumerate(khung[1]) if a <= cx < b) if any(a <= cx < b for a, b in khung[1]) else None
            if r is None or c is None:
                continue
        else:
            r, c = min(rows - 1, int(cy / (H / rows))), min(cols - 1, int(cx / (W / cols)))
        bb = (xs.min() + sl[1].start, ys.min() + sl[0].start, xs.max() + sl[1].start + 1, ys.max() + sl[0].start + 1)
        if (r, c) in o:
            a = o[(r, c)]
            bb = (min(a[0], bb[0]), min(a[1], bb[1]), max(a[2], bb[2]), max(a[3], bb[3]))
        o[(r, c)] = bb
    return o


def vua(im, w, h, le=0):
    """Thu nhỏ giữ tỉ lệ cho vừa w×h (có lề), đặt giữa khung trong suốt w×h."""
    iw, ih = im.size
    s = min((w - 2 * le) / iw, (h - 2 * le) / ih)
    im2 = im.resize((max(1, round(iw * s)), max(1, round(ih * s))), Image.LANCZOS)
    o = Image.new('RGBA', (w, h))
    o.alpha_composite(im2, ((w - im2.size[0]) // 2, (h - im2.size[1]) // 2))
    return o


def theo_cao(im, h):
    iw, ih = im.size
    return im.resize((max(1, round(iw * h / ih)), h), Image.LANCZOS)


def tron(im, co, ten):
    """Hình tròn: canh tâm theo khối lõi (alpha>200) để vòng tròn ở đúng giữa, rồi ra ô vuông co×co."""
    a = np.asarray(im)[..., 3]
    m = a > 200
    lab, n = nd.label(m)
    if n:
        sz = nd.sum(m, lab, range(1, n + 1))
        k = np.argmax(sz) + 1
        ys, xs = np.nonzero(lab == k)
        cx, cy = (xs.min() + xs.max() + 1) / 2, (ys.min() + ys.max() + 1) / 2
        bw, bh = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        ya, xa = np.nonzero(a > 100)
        if bw < 0.6 * (xa.max() - xa.min()):  # vòng đứt đoạn (khối lớn nhất chỉ là 1 cung) → dùng toàn bộ phần đặc
            cx, cy = (xa.min() + xa.max() + 1) / 2, (ya.min() + ya.max() + 1) / 2
            bw, bh = xa.max() - xa.min() + 1, ya.max() - ya.min() + 1
    else:
        cx, cy, bw, bh = im.size[0] / 2, im.size[1] / 2, *im.size
    ys, xs = np.nonzero(a > 8)
    R = max(cx - xs.min(), xs.max() + 1 - cx, cy - ys.min(), ys.max() + 1 - cy)
    R = int(np.ceil(R)) + 2
    big = Image.new('RGBA', (im.size[0] + 2 * R, im.size[1] + 2 * R))
    big.alpha_composite(im, (R, R))
    c = big.crop((int(round(cx)), int(round(cy)), int(round(cx)) + 2 * R, int(round(cy)) + 2 * R))
    lech = abs(int(bw) - int(bh))
    BAO.append((ten, f'{co}x{co}', f'tron: bbox loi {bw}x{bh} lech {lech}px ' + ('OK' if lech <= 2 else 'KHONG TRON (giu, canh tam theo loi)')))
    return c.resize((co, co), Image.LANCZOS)


def luu(im, ten, ghi=''):
    p = os.path.join(DICH, ten)
    im.save(p, optimize=True)
    DA_CAT.append(p)
    if ghi is not None and not any(b[0] == ten for b in BAO):
        BAO.append((ten, f'{im.size[0]}x{im.size[1]}', ghi))


def tach_sang(im):
    """Hình phát sáng (quầng mờ hoà vào nền): alpha = độ lệch khỏi magenta, rồi khử trộn màu nền
    (c = (c_anh - (1-a)·magenta)/a) → quầng giữ đúng màu vàng/xanh thay vì ám hồng."""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    al = np.clip((np.maximum.reduce([g, 255 - r, 255 - b]) - 18) / (255 - 18), 0, 1)
    M = np.array([255, 0, 255], np.float32)
    rgb = (a - (1 - al[..., None]) * M) / np.maximum(al[..., None], 0.05)
    out = np.dstack([np.clip(rgb, 0, 255), al * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def cat_mau(ten_raw, cols, rows, ten_o, gian=6, khung=None, sang=()):
    """Tấm ảnh màu nền magenta → {tên: ảnh RGBA đã xén theo alpha}. `sang`: các ô phát sáng → tach_sang."""
    im = mo(ten_raw)
    rgba = tach_nen(im, 'tim')
    rgbs = tach_sang(im) if sang else None
    al = np.asarray(rgba)[..., 3] / 255.0
    o = nhom_o(al, cols, rows, gian=gian, khung=khung)
    ra = {}
    for (r, c), bb in sorted(o.items()):
        k = r * cols + c
        if k >= len(ten_o) or not ten_o[k]:
            continue
        x0, y0, x1, y1 = bb
        nguon = rgbs if ten_o[k] in sang else rgba
        if ten_o[k] in sang:  # quầng sáng rộng hơn khối lõi: nới khung
            x0, y0, x1, y1 = x0 - 14, y0 - 14, x1 + 14, y1 + 14
            nguon = nguon.crop((max(0, x0), max(0, y0), x1, y1)); ra[ten_o[k]] = nguon.crop(nguon.getbbox()); continue
        ra[ten_o[k]] = nguon.crop((max(0, x0 - 2), max(0, y0 - 2), x1 + 2, y1 + 2))
    thieu = [t for t in ten_o if t and t not in ra]
    if thieu:
        print('!! THIẾU ô trong', ten_raw, thieu)
    return ra


def cat_glyph(ten_raw, cols, rows, ids, co=128, le=6):
    """Bóng trắng trên magenta → PNG trắng + alpha (alpha = độ xanh lá: magenta G≈0, trắng G≈255)."""
    a = np.asarray(mo(ten_raw)).astype(np.float32)
    g = a[..., 1]
    nen = np.percentile(g, 30)
    al = np.clip((g - nen - 20) / (235 - nen - 20), 0, 1)
    o = nhom_o(al, cols, rows, gian=10)
    for (r, c), bb in sorted(o.items()):
        k = r * cols + c
        if k >= len(ids) or not ids[k]:
            continue
        x0, y0, x1, y1 = bb
        sub = al[y0:y1, x0:x1]
        out = np.dstack([np.full(sub.shape, 255.0)] * 3 + [sub * 255]).astype(np.uint8)
        img = Image.fromarray(out, 'RGBA')
        img = vua(img, co, co, le)
        luu(img, 'glyph/' + ids[k] + '.png', None)
    thieu = [i for k, i in enumerate(ids) if i and not any(r * cols + c == k for (r, c) in o)]
    if thieu:
        print('!! THIẾU glyph', ten_raw, thieu)
    BAO.append((ten_raw, f'{sum(1 for i in ids if i)} glyph {co}x{co}', 'trang + alpha'))


# ---------------- S1: tấm HUD (ảnh thật 4 cột × 2 hàng, thứ tự 1..8 như prompt) ----------------
S1 = ['hud_trieu_san', 'hud_trieu_tat', 'hud_mana', 'hud_wave', 'hud_tim_khung', 'hud_trum_khung', 'hud_ten_ban', 'loi_mau_khung']
CAO1 = {'hud_trieu_san': 144, 'hud_trieu_tat': 144, 'hud_mana': 124, 'hud_wave': 80, 'hud_tim_khung': 56, 'hud_trum_khung': 40, 'hud_ten_ban': 40, 'loi_mau_khung': 48}
r = cat_mau('raw_s1.png', 4, 2, S1)
for t, im in r.items():
    luu(theo_cao(im, CAO1[t]), t + '.png', 'tam 9-slice (border-image), giu ti le' if t.startswith('hud') else 've canvas')

# ---------------- S2: huy hiệu & icon 6×4 ----------------
S2 = ['ic_toc', 'ic_dmg', 'ic_crit', 'ic_cham', 'ic_chet', 'ic_mana',
      'ic_khien', 'ic_taylo', 'ic_sao', 'ic_bom', 'ic_truyna', 'ic_dung',
      'sao_hex', 'sao_hex7', 'ngoc_trang', 'ngoc_xanh', 'ngoc_tim', 'ngoc_vang',
      'ngoc_do', 'den_tim_bat', 'den_tim_tat', 'phim', 'phim_nhan', 'led_xanh']
CO2 = {'sao_hex': 96, 'sao_hex7': 96, 'den_tim_bat': 40, 'den_tim_tat': 40, 'phim': 120, 'phim_nhan': 120, 'led_xanh': 16}
r = cat_mau('raw_s2.png', 6, 4, S2)
for t, im in r.items():
    c = CO2.get(t, 32 if t.startswith('ngoc') else 64)
    if t in ('den_tim_bat', 'den_tim_tat', 'led_xanh'):
        luu(tron(im, c, t + '.png'), t + '.png')
    else:
        luu(vua(im, c, c, 1), t + '.png')

# ---------------- S3: 85 glyph ----------------
S3A = ['canon', 'xucxac', 'lien', 'phun', 'sungluc', 'bang', 'doc', 'mana', 'tia', 'set', 'maychem', 'phagiap',
       'bua', 'nam', 'bomhen', 'nhanmana', 'kiembang', 'mimic', 'chimang', 'dichchuyen', 'radar', 'drone', 'tron', 'nangluong']
S3B = ['laser', 'lanhgia', 'mortar', 'khuech', 'vungdoc', 'loa', 'hutmana', 'min', 'cuongno', 'baotuyet', 'nhanban', 'lienket',
       'kepha', 'taylo', 'khien', 'hopbi', 'nangsao', 'tuthan', 'xaotron', 'epxung', 'no5', 'bao', 'anhsang', 'aten']
S3C = ['dongbo', 'railgun', 'vughep', 'sinhdoi', 'hasao', 'saochep', 'ngoisao', 'soi', 'tienhoa', 'cauvong', 'wallgen', 'orbital',
       'blackhole', 'overlord', 'lophanung', 'haoquang', 'nayda', 'combo', 'khoathoigian', 'hydra', 'cuuvi', 'pandora', 'luoicheo', 'ngaithoigian']
S3D = ['nemesis', 'docton', 'thaukinh', 'nhieusong', 'santhuong', 'nhatthuc', 'loren', 'guongcong', 'marionette', 'chuato',
       'leviathan', 'khoisinh', 'ronglua', None, None]
cat_glyph('raw_s3a.png', 6, 4, S3A)
cat_glyph('raw_s3b.png', 6, 4, S3B)
cat_glyph('raw_s3c.png', 6, 4, S3C)
cat_glyph('raw_s3d.png', 5, 3, S3D)

# ---------------- S4: đồ vật hiệu ứng 4×4 ----------------
S4 = ['fx_vong_trieu', 'fx_vong_lv', 'vong_xich', 'hu_hoden', 'hu_khoa', 'hu_luoicua', 'hu_manhguong', 'hu_trangkhuyet',
      'hu_vongbang', 'hu_min', 'pandora_dia', 'duong_mui', 'hat_tuyet', 'loi_hu1', 'loi_hu2', None]
CO4 = {'fx_vong_trieu': 256, 'fx_vong_lv': 128, 'vong_xich': 128, 'hu_hoden': 256, 'hu_khoa': 128, 'hu_luoicua': 64, 'hu_manhguong': 48,
       'hu_trangkhuyet': 256, 'hu_vongbang': 192, 'hu_min': 48, 'pandora_dia': 128, 'duong_mui': 32, 'hat_tuyet': 24}
TRON4 = {'fx_vong_trieu', 'fx_vong_lv', 'vong_xich', 'hu_hoden', 'hu_luoicua', 'hu_vongbang', 'hu_min', 'pandora_dia'}
r = cat_mau('raw_s4.png', 4, 4, S4, gian=8, sang={'fx_vong_trieu', 'fx_vong_lv', 'hu_trangkhuyet', 'duong_mui', 'hat_tuyet', 'hu_khoa', 'hu_manhguong'})
loi = Image.open(os.path.join(DICH, 'loi.png')).convert('RGBA')
for t, im in r.items():
    if t in ('loi_hu1', 'loi_hu2'):
        # cùng khung với loi.png: xén sát rồi đặt như loi.png (khớp bề ngang khối lõi)
        bb0 = loi.getbbox(); lw = bb0[2] - bb0[0]
        im = im.crop(im.getbbox())
        s = lw / im.size[0]
        im = im.resize((round(im.size[0] * s), round(im.size[1] * s)), Image.LANCZOS)
        o = Image.new('RGBA', loi.size)
        o.alpha_composite(im, (bb0[0], max(0, bb0[3] - im.size[1])))
        luu(o, t + '.png', 'cung khung voi loi.png')
    elif t in TRON4:
        luu(tron(im, CO4[t], t + '.png'), t + '.png')
    elif t == 'duong_mui':
        luu(vua(im, 48, 32, 0), t + '.png', 'mui ten ngang 48x32')
    else:
        c = CO4[t]
        luu(vua(im, c, c, 1), t + '.png')

# ---------------- S5: 4 dải ----------------
im5 = mo('raw_s5.png')
W5, H5 = im5.size
rgba5 = tach_nen(im5, 'tim')
a5 = np.asarray(rgba5)[..., 3] > 90
# hàng: dải ngang tìm bằng hồ sơ alpha theo y
hang = a5.mean(axis=1) > 0.2
lab, n = nd.label(hang)
dai = [s[0] for s in nd.find_objects(lab) if s[0].stop - s[0].start > 40]
print('S5 dải:', [(d.start, d.stop) for d in dai])
TEN5 = ['bang_wave_nen', 'bang_trum_nen', 'bang_cutin_nen', 'hu_cauvong']
for k, d in enumerate(dai[:4]):
    sub = rgba5.crop((0, d.start, W5, d.stop))
    arr = np.asarray(sub).copy()
    # bỏ phần "đuôi mờ" tím ở 2 đầu: cột có màu tím sẫm (đuôi phai) → xén theo khung kim loại (viền đen dày)
    rgb = arr[..., :3].astype(int)
    tim_sam = (rgb[..., 0] > 70) & (rgb[..., 2] > 90) & (rgb[..., 1] < 70) & (rgb[..., 2] - rgb[..., 1] > 50)
    cot_tim = tim_sam.mean(axis=0)
    cot_co = (arr[..., 3] > 90).mean(axis=0)
    ok = (cot_co > 0.25) & (cot_tim < 0.12)
    xs = np.nonzero(ok)[0]
    x0, x1 = xs.min(), xs.max() + 1
    if TEN5[k] == 'hu_cauvong':
        # dải cầu vồng: lấy phần giữa (bỏ ray thép trên/dưới cũng giữ — đúng là "đường"), làm khít khi lặp: trộn chéo 2 đầu
        x0, x1 = x0 + 30, x1 - 30
        s = Image.fromarray(arr[:, x0:x1], 'RGBA')
        s = s.crop((0, 0, s.size[0], s.size[1]))
        bb = s.getbbox(); s = s.crop((0, bb[1], s.size[0], bb[3]))
        s = s.resize((1024, 128), Image.LANCZOS)
        A = np.asarray(s).astype(np.float32)
        L = 96  # vùng trộn
        dau, cuoi = A[:, :L].copy(), A[:, -L:].copy()
        w = np.linspace(0, 1, L)[None, :, None]
        A[:, :L] = cuoi * (1 - w) + dau * w
        A = A[:, :-L]
        s = Image.fromarray(np.clip(A, 0, 255).astype(np.uint8), 'RGBA').resize((512, 64), Image.LANCZOS)
        luu(s, 'hu_cauvong.png', 'lap ngang (tron cheo 2 dau)')
    else:
        s = Image.fromarray(arr[:, x0:x1], 'RGBA')
        s = s.crop(s.getbbox())
        luu(s.resize((860, 140), Image.LANCZOS), TEN5[k] + '.png', 'nen bang (background 100% 100%)')

# ---------------- S6: menu & bảng 3×2 ----------------
S6 = ['khung_bang', 'o_trong', 'the_vien', 'ic_coop', 'ic_solo', 'ic_pvp']
r = cat_mau('raw_s6.png', 3, 2, S6)
for t, im in r.items():
    if t == 'khung_bang':
        luu(theo_cao(im, 240), t + '.png', '9-slice')
    elif t == 'o_trong':
        luu(vua(im, 150, 190, 0), t + '.png')
    elif t == 'the_vien':
        luu(vua(im, 136, 190, 0), t + '.png', 'cua so trong suot')
    else:
        luu(vua(im, 96, 96, 1), t + '.png', 'icon 48 css px @2x')

# ---------------- S7 ----------------
lg = tach_nen(mo('raw_s7a.png'), 'tim')
lg = lg.crop(lg.getbbox())
luu(theo_cao(lg, 288) if lg.size[0] * 288 / lg.size[1] <= 760 else lg.resize((720, round(lg.size[1] * 720 / lg.size[0])), Image.LANCZOS), 'logo.png', 'hien thi ~360 css px @2x')
if os.path.exists(os.path.join(NGUON, 'raw_s7b.png')):
    b = Image.open(os.path.join(NGUON, 'raw_s7b.png')).convert('RGB')
    w, h = b.size
    s = 900 / max(w, h) if max(w, h) > 900 else 1  # 600×900: đủ nét cho màn 430 css @2x, nhẹ bộ nhớ
    b = b.resize((round(w * s), round(h * s)), Image.LANCZOS)
    b.save(os.path.join(DICH, 'nen_menu.jpg'), quality=82, optimize=True); DA_CAT.append(os.path.join(DICH, 'nen_menu.jpg'))
    BAO.append(('nen_menu.jpg', f'{b.size[0]}x{b.size[1]}', 'JPEG (nen kin)'))
if os.path.exists(os.path.join(NGUON, 'raw_s7c.png')):
    # ảnh thật: tấm console nằm ở dải dưới, phần trên là nền magenta → khoá màu, xén sát, rộng 860 (430 css @2x).
    # Dùng bằng border-image (9 mảnh) nên chiều cao giãn được mà không méo góc / ống.
    c = tach_nen(mo('raw_s7c.png'), 'tim')
    c = c.crop(c.getbbox())
    c = c.resize((860, round(c.size[1] * 860 / c.size[0])), Image.LANCZOS)
    luu(c, 'nen_hud_duoi.png', '9-slice cho #duoi')
# ---------------- bảng + tờ tổng hợp ----------------
for t, k, g in BAO:
    print(f'  {t:28s} {k:18s} {g}')
tong = 0
for p in DA_CAT:
    w, h = Image.open(p).size
    tong += w * h * 4
print(f'Tong {len(DA_CAT)} file, giai nen RGBA ~ {tong / 1048576:.2f} MB, tren dia {sum(os.path.getsize(p) for p in DA_CAT) / 1024:.0f} KB')

O = 150
cols = 10
ds = sorted(DA_CAT)
rows = (len(ds) + cols - 1) // cols
cs = Image.new('RGB', (cols * O, rows * (O + 16)), (40, 40, 48))
dr = ImageDraw.Draw(cs)
for i, p in enumerate(ds):
    im = Image.open(p).convert('RGBA')
    x, y = (i % cols) * O, (i // cols) * (O + 16)
    # ô bàn cờ để thấy alpha
    for yy in range(0, O, 10):
        for xx in range(0, O, 10):
            if (xx // 10 + yy // 10) % 2:
                dr.rectangle([x + xx, y + yy, x + xx + 9, y + yy + 9], fill=(58, 58, 68))
    if '/glyph/' in p:  # glyph trắng: tô màu khoá để dễ nhìn
        a = np.asarray(im).copy(); a[..., 0] = 255; a[..., 1] = 196; a[..., 2] = 60; im = Image.fromarray(a, 'RGBA')
    im.thumbnail((O - 8, O - 8), Image.LANCZOS)
    cs.paste(im, (x + (O - im.size[0]) // 2, y + (O - im.size[1]) // 2), im)
    dr.text((x + 3, y + O + 2), os.path.relpath(p, DICH)[:24], fill=(220, 220, 220))
out = os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/audit/cut_contact.png')
cs.save(out, optimize=True)
print('->', out)
