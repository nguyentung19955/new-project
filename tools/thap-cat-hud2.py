# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt tấm ChatGPT cho HUD v2 (docs/demo-hop-tuong/thap-art/TU-VAN-HUD.txt, mục 01–15)
+ S10 / S11 (HINH-VE-CODE-AUDIT.md mục 5).
Nguồn: docs/demo-hop-tuong/thap-art/raw_hud2_XX.png (XX = số mục backlog, không có _02), raw_s10.png, raw_s11.png
Đích:  thap/assets/h2_*.png (+ s10/s11 theo tên trong bảng mục 5) · tờ tổng hợp docs/demo-hop-tuong/tuvan/hudv2/cut_contact.png
Cách cắt: khoá magenta (tach_nen) hoặc khoá phát sáng (tach_sang) → giữ các khối liền có TRỌNG TÂM trong hộp (toạ độ ảnh gốc)
→ xén theo alpha → thu về cỡ dùng ×2 (DPR 2). Hình tròn: canh tâm + kiểm tra tròn (tron()).
Chạy: python3 tools/thap-cat-hud2.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
DICH = os.path.join(GOC, 'thap/assets')
TONG = os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/hudv2')
os.makedirs(TONG, exist_ok=True)

_src = open(os.path.join(GOC, 'tools/thap-cat-hinh.py'), encoding='utf-8').read().split('\n')
exec('\n'.join(_src[17:58]))  # def tach_nen(im, mau)
_ui = open(os.path.join(GOC, 'tools/thap-cat-ui.py'), encoding='utf-8').read()
exec(_ui[_ui.index('def tron('):_ui.index('def luu(')])       # tron(im, co, ten) — cần BAO
exec(_ui[_ui.index('def tach_sang('):_ui.index('def cat_mau(')])  # tach_sang(im)

BAO, DA = [], []


def tron2(im, c, ten):
    """Như tron() nhưng trước đó kéo lại cho khối lõi VUÔNG (ảnh gen hơi bầu dục) → vòng tròn tuyệt đối."""
    a = np.asarray(im)[..., 3] > 200
    lab, n = nd.label(a)
    if n:
        k = np.argmax(nd.sum(a, lab, range(1, n + 1))) + 1
        ys, xs = np.nonzero(lab == k)
        bw, bh = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        if abs(bw - bh) > 1:
            im = im.resize((im.size[0], max(1, round(im.size[1] * bw / bh))), Image.LANCZOS)
    return tron(im, c, ten)
_cache = {}


def tam(ten, sang=False):
    k = (ten, sang)
    if k not in _cache:
        im = Image.open(os.path.join(NGUON, ten)).convert('RGB')
        rg = tach_sang(im) if sang else tach_nen(im, 'tim')
        al = np.asarray(rg)[..., 3] > 70
        lab, n = nd.label(nd.binary_dilation(al, iterations=3))
        cm = nd.center_of_mass(al, lab, range(1, n + 1)) if n else []
        _cache[k] = (rg, lab, cm)
    return _cache[k]


def cat(ten, hop, sang=False):
    """Khối liền có trọng tâm trong hộp (x0,y0,x1,y1, toạ độ ảnh gốc) → RGBA đã xén."""
    rg, lab, cm = tam(ten, sang)
    x0, y0, x1, y1 = hop
    ids = [i + 1 for i, (cy, cx) in enumerate(cm) if x0 <= cx < x1 and y0 <= cy < y1]
    m = np.isin(lab, ids)
    a = np.asarray(rg).copy()
    a[..., 3] = (a[..., 3] * m).astype(np.uint8)
    im = Image.fromarray(a, 'RGBA')
    return im.crop(im.getbbox())


def co(im, w=None, h=None):
    iw, ih = im.size
    if w and h:
        return im.resize((w, h), Image.LANCZOS)
    if w:
        return im.resize((w, max(1, round(ih * w / iw))), Image.LANCZOS)
    return im.resize((max(1, round(iw * h / ih)), h), Image.LANCZOS)


def luu(im, ten, ghi=''):
    p = os.path.join(DICH, ten)
    im.save(p, optimize=True)
    DA.append((ten, im))
    if not any(b[0] == ten for b in BAO):
        BAO.append((ten, '%dx%d' % im.size, ghi))


def cung_khung(ims):
    """Nhiều trạng thái của cùng 1 nút → cùng khung (canh giữa theo bbox) để đổi ảnh không nhảy."""
    W = max(i.size[0] for i in ims); H = max(i.size[1] for i in ims)
    ra = []
    for i in ims:
        o = Image.new('RGBA', (W, H)); o.alpha_composite(i, ((W - i.size[0]) // 2, (H - i.size[1]) // 2)); ra.append(o)
    return ra


def nang_luong(im, nguong=40):
    """Chỉ giữ phần NĂNG LƯỢNG (xanh/vàng sáng) của khung VFX — bỏ đế thép xám (r≈g≈b, tối)."""
    a = np.asarray(im).astype(np.float32)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    mx, mn = np.maximum.reduce([r, g, b]), np.minimum.reduce([r, g, b])
    sat = mx - mn
    k = np.clip((sat - nguong) / 90, 0, 1) * np.clip((mx - 120) / 80, 0, 1)
    trang = np.clip((mn - 200) / 40, 0, 1)  # lõi trắng chói
    k = np.maximum(k, trang)
    a[..., 3] = al * k
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


# ---------- 01 nút SUMMON 4 trạng thái (chờ · sẵn sàng · nhấn · tắt) — 92×83 css → ×2 ----------
R = 'raw_hud2_01.png'
nut = [cat(R, (x, 0, x + 540, 724), sang=False) for x in (0, 545, 1088, 1630)]
for ten, im in zip(('cho', 'san', 'an', 'tat'), cung_khung(nut)):
    luu(co(im, w=192), 'h2_trieu_%s.png' % ten, 'nút Summon (#01)')

# ---------- 03 tấm dữ liệu thẻ ----------
R = 'raw_hud2_03.png'
lv = cat(R, (200, 20, 1020, 380))
luu(co(lv, h=30), 'h2_tag.png', 'tấm LV / ×N (#03), 3 mảnh')
chong = cat(R, (1120, 40, 1960, 380))
luu(co(chong.crop((60, 40, 300, 280)), w=28), 'h2_ic_chong.png', 'icon chồng (×N) cắt từ tấm đếm (#03)')
luu(co(cat(R, (190, 380, 1030, 724)), h=40), 'h2_chip.png', 'ô giá nâng cấp (#03)')
luu(co(cat(R, (1130, 380, 1990, 724)), h=40), 'h2_chip_tat.png', 'ô giá — chưa đủ mana (#03)')

# ---------- 04 thanh trạng thái trên ----------
luu(co(cat('raw_hud2_04.png', (0, 100, 2172, 600)), w=600), 'h2_rail.png', 'thanh WAVE · BOSS · tim (#04)')

# ---------- 05 ngọc mana + màn LCD ----------
R = 'raw_hud2_05.png'
luu(co(cat(R, (40, 90, 530, 620)), w=56), 'h2_ngoc.png', 'ngọc mana duy nhất (#05)')
luu(co(cat(R, (520, 60, 2140, 660)), h=116), 'h2_lcd.png', 'màn LCD mana (#05)')

# ---------- 06 huy chương chỉ huy + 3 vòng nạp (chỉ dùng vòng) ----------
R = 'raw_hud2_06.png'
luu(co(cat(R, (0, 0, 686, 724)), w=160), 'h2_mv_huy.png', 'huy chương chỉ huy (#06, chưa dùng: giữ khung chỉ huy)')
for ten, x in (('tim', 688), ('do', 1183), ('xam', 1686)):
    luu(tron2(cat(R, (x, 90, x + 490, 620)), 96, 'h2_vong_%s.png' % ten), 'h2_vong_%s.png' % ten, 'vòng nạp chỉ huy (#06)')

# ---------- 07 huy hiệu sao trên bàn ----------
R = 'raw_hud2_07.png'
luu(co(cat(R, (20, 20, 330, 345)), w=64), 'h2_sao.png', 'huy hiệu cấp sao (#07), số vẽ chữ')
_ss = np.asarray(cat(R, (880, 330, 1300, 724))).astype(np.float32)
_h = (_ss[..., 0] > 150) & (_ss[..., 2] > _ss[..., 1])  # quầng vàng ám hồng (trộn magenta) → kéo về vàng
_ss[..., 2] = np.where(_h, _ss[..., 1] * 0.25, _ss[..., 2]); _ss[..., 1] = np.where(_h, np.maximum(_ss[..., 1], _ss[..., 0] * 0.72), _ss[..., 1])
luu(co(Image.fromarray(_ss.astype(np.uint8), 'RGBA'), w=76), 'h2_sao_sang.png', 'huy hiệu sao — đang chọn (#07)')

# ---------- 08 giá đồng đội ----------
R = 'raw_hud2_08.png'
luu(co(cat(R, (30, 60, 2150, 560)), w=420), 'h2_khay_doi.png', 'giá dải đồng đội 5 ô + ô chỉ huy (#08)')
luu(tron2(cat(R, (60, 550, 220, 700)), 24, 'h2_den_doi.png'), 'h2_den_doi.png', 'đèn trạng thái đồng đội (#08)')

# ---------- 09 icon vai trò ----------
R = 'raw_hud2_09.png'
for ten, (a, b) in zip(('tc', 'phu', 'ht', 'kc', 'db'), ((0, 440), (440, 869), (869, 1298), (1298, 1721), (1721, 2172))):
    luu(tron2(cat(R, (a, 100, b, 620)), 40, 'h2_vai_%s.png' % ten), 'h2_vai_%s.png' % ten, 'icon vai trò (#09)')

# ---------- 10 phím tốc độ / tạm dừng ----------
R = 'raw_hud2_10.png'
dung = cung_khung([cat(R, (x, 0, x + 390, 362)) for x in (260, 720, 1180)])
toc = cung_khung([cat(R, (x, 362, x + 390, 724)) for x in (260, 720, 1180)])
for ten, a, b in zip(('cho', 'an', 'tat'), dung, toc):
    luu(co(a, w=112), 'h2_phim_dung_%s.png' % ten, 'phím tạm dừng (#10)')
    luu(co(b, w=112), 'h2_phim_toc_%s.png' % ten, 'phím tốc độ (#10)')

# ---------- 11 lõi / tim ----------
R = 'raw_hud2_11.png'
luu(co(cat(R, (20, 150, 380, 560)), w=40), 'h2_ic_tim.png', 'icon sự sống (#11)')
for ten, (a, b) in zip(('0', '1', '2'), ((380, 790), (790, 1180), (1180, 1590))):
    luu(co(cat(R, (a, 100, b, 600)), w=256), 'h2_loi_%s.png' % ten, 'lõi pha lê nguyên/mẻ/nguy (#11)')
luu(co(cat(R, (1590, 180, 1935, 540), sang=True), w=160), 'h2_loi_chop.png', 'chớp đỏ khi lõi trúng đòn (#11)')
luu(co(cat(R, (1935, 200, 2172, 520)), w=40), 'h2_canh_bao.png', 'mũi tên cảnh báo hổ phách (#11)')

# ---------- 12 phản hồi đủ mana / nâng cấp ----------
R = 'raw_hud2_12.png'
luu(co(cat(R, (140, 180, 500, 520)), w=48), 'h2_glint.png', 'góc sáng xanh "đủ mana" (#12)')
luu(co(cat(R, (800, 200, 1320, 480)), w=96), 'h2_burst.png', 'tia vàng nâng cấp (#12)')

# ---------- 13 VFX: hàng 2 = cổng triệu hồi ở ô, hàng 3 = tia nối ghép (chỉ giữ phần năng lượng) ----------
R = 'raw_hud2_13.png'
def day(y0, y1, xs, w, ten, kieu, giu_vung=None):
    """kieu 'lanh': chỉ giữ năng lượng xanh lơ/trắng (bỏ đế thép + tai hổ phách) · 'nong': chỉ giữ chớp vàng-trắng chói."""
    kh = []
    goc = Image.open(os.path.join(NGUON, R)).convert('RGB')
    for x in xs:
        f = goc.crop((x, y0, x + 290, y1))
        k = np.asarray(tach_nen(f, 'tim')).astype(np.float32)
        r, g, b, al = k[..., 0], k[..., 1], k[..., 2], k[..., 3]
        if kieu == 'lanh':
            m = np.clip((b - r - 50) / 60, 0, 1) * np.clip((b - 120) / 60, 0, 1)
        else:
            m = np.clip((np.minimum(r, g) - 185) / 40, 0, 1) * np.clip((r - b + 40) / 60, 0, 1)
        trang = np.clip((np.minimum.reduce([r, g, b]) - 215) / 30, 0, 1)  # lõi trắng — chỉ khi sát vùng năng lượng màu
        m = np.maximum(m, trang * nd.binary_dilation(m > 0.5, iterations=5))
        if giu_vung:
            v = np.zeros_like(m); x0, yy0, x1, yy1 = giu_vung; v[yy0:yy1, x0:x1] = 1; m = m * v
        k[..., 3] = al * m
        kh.append(Image.fromarray(k.astype(np.uint8), 'RGBA'))
    cw, chh = kh[0].size
    s = w / cw
    cw2, ch2 = round(cw * s), round(chh * s)
    o = Image.new('RGBA', (cw2 * len(kh), ch2))
    for i, e in enumerate(kh):
        o.alpha_composite(e.resize((cw2, ch2), Image.LANCZOS), (i * cw2, 0))
    luu(o, ten, 'dải %d khung %dx%d' % (len(kh), cw2, ch2))
day(320, 600, (12, 308, 600, 890, 1180, 1470), 120, 'h2_vfx_cong.png', 'lanh')
day(600, 860, (890, 1180), 120, 'h2_vfx_ghep.png', 'nong', giu_vung=(98, 0, 192, 260))

# ---------- 14 tấm chữ 9 mảnh ----------
R = 'raw_hud2_14.png'
luu(co(cat(R, (0, 40, 1180, 450)), h=80), 'h2_tam_do.png', 'tấm cảnh báo trùm (#14)')
luu(co(cat(R, (1180, 80, 2172, 440)), h=72), 'h2_tam_xanh.png', 'tấm nhãn đồng đội (#14)')
luu(co(cat(R, (80, 440, 1100, 724)), h=56), 'h2_tam.png', 'tấm số / chú thích (#14)')
luu(co(cat(R, (1100, 460, 2172, 724)), h=40), 'h2_tam_mong.png', 'tấm mỏng (#14)')

# ---------- 15 bộ viền ----------
R = 'raw_hud2_15.png'
luu(co(cat(R, (869, 330, 2090, 440)), h=16), 'h2_thanh.png', 'thanh thép phân cách (#15)')
luu(co(cat(R, (869, 60, 2090, 290)), h=40), 'h2_dam.png', 'dầm thép (#15, chưa dùng)')
luu(co(cat(R, (1340, 480, 1520, 670)), w=32), 'h2_bulong.png', 'bu-lông (#15)')

# ---------- S10 ----------
R = 'raw_s10.png'
luu(co(cat(R, (0, 40, 515, 320)), h=96), 'nut_lon_vang.png', 'nút lớn vàng (S10-1)')
luu(co(cat(R, (515, 40, 1020, 320)), h=96), 'nut_lon_thep.png', 'nút lớn thép (S10-2)')
luu(co(cat(R, (1020, 40, 1536, 320)), h=96), 'nut_lon_xanh.png', 'nút lớn xanh (S10-3)')
luu(co(cat(R, (100, 350, 420, 670)), w=96), 'nut_nho.png', 'phím vuông nhỏ (S10-4)')
luu(co(cat(R, (480, 340, 940, 670), sang=True), h=96), 'khung_chon.png', 'khung chọn xanh (S10-5)')
luu(co(cat(R, (980, 330, 1530, 670)), h=144), 'khung_tt.png', 'khung bảng thông tin (S10-6)')
luu(co(cat(R, (40, 720, 480, 950)), h=48), 'nhan_kn.png', 'nhãn viên thuốc (S10-7)')
luu(tron2(cat(R, (560, 670, 910, 1000)), 64, 'nut_cong.png'), 'nut_cong.png', 'nút + (S10-8)')
luu(co(cat(R, (1060, 650, 1410, 1010)), w=192), 'ic_thua.png', 'khiên vỡ THUA (S10-9)')

# ---------- S11 ----------
R = 'raw_s11.png'
luu(co(cat(R, (0, 100, 585, 400)), h=56), 'loi_thanh_khung.png', 'khung thanh 3 khúc (S11-1)')
luu(co(cat(R, (585, 140, 1020, 360)), h=28), 'loi_khuc_day.png', 'khúc đầy (S11-2)')
luu(co(cat(R, (1020, 140, 1480, 360)), h=28), 'loi_khuc_rong.png', 'khúc rỗng (S11-3)')
luu(co(cat(R, (1480, 100, 1774, 400)), w=36), 'seg_tat.png', 'đèn tắt (S11-4)')
luu(co(cat(R, (100, 490, 420, 790)), w=36), 'seg_sang.png', 'đèn sáng (S11-5)')
luu(co(cat(R, (520, 490, 830, 790)), w=36), 'seg_trum.png', 'đèn sọ (S11-6)')
luu(tron2(cat(R, (900, 450, 1290, 820)), 96, 'ic_phat.png'), 'ic_phat.png', 'nút phát (S11-7)')
luu(tron2(cat(R, (1320, 450, 1720, 820)), 96, 'ic_lui.png'), 'ic_lui.png', 'nút lùi (S11-8)')

# ---------- tờ tổng hợp ----------
o_w, o_h, cot = 230, 150, 6
hang = (len(DA) + cot - 1) // cot
T = Image.new('RGB', (cot * o_w, hang * o_h), (40, 42, 46))
d = ImageDraw.Draw(T)
for i, (ten, im) in enumerate(DA):
    x, y = (i % cot) * o_w, (i // cot) * o_h
    for yy in range(y, y + o_h - 22, 12):  # nền ô cờ để thấy alpha
        for xx in range(x, x + o_w, 12):
            if ((xx - x) // 12 + (yy - y) // 12) % 2: d.rectangle((xx, yy, xx + 11, yy + 11), fill=(58, 60, 66))
    s = min((o_w - 10) / im.size[0], (o_h - 30) / im.size[1], 2)
    t = im.resize((max(1, int(im.size[0] * s)), max(1, int(im.size[1] * s))), Image.LANCZOS)
    T.paste(t, (x + (o_w - t.size[0]) // 2, y + 4 + (o_h - 30 - t.size[1]) // 2), t)
    d.text((x + 4, y + o_h - 20), '%s %dx%d' % (ten, *im.size), fill=(230, 230, 230))
T.save(os.path.join(TONG, 'cut_contact.png'))
for b in BAO:
    print('%-24s %-10s %s' % b)
print(len(DA), 'ảnh')
