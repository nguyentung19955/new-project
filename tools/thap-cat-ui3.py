# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt ảnh GIAO DIỆN NGOÀI TRẬN ANIME "Royal Twilight" (B3, 09/11) từ các tấm ChatGPT có sẵn:
  raw_ui2_icon_home.png  → ua_ic_{nv,shop,sk,vq,deck,bst,trum,cai}.png  (8 icon HOME, lưới 4×2)
  raw_ui2_icon_taisan.png→ ua_ts_{mana,vang,ngoc,do,sk,xp}.png           (6 icon tài nguyên)
  raw_ui2_nut.png        → ua_nut_chinh (cam đào, bỏ ngọc giữa trên/dưới → 9 lát), ua_mien (vương miện ngọc trên nút PLAY),
                            ua_nut_phu (chàm viền cyan, bỏ ngọc giữa → 9 lát), ua_nut_tron (nút tròn), ua_pill_bat / ua_pill_tat
  raw_ui2_hud.png        → ua_tam (tấm chàm vát góc, 9 lát cho bảng/hàng), ua_o (ô vuông vát góc cho ô hàng/ô thưởng)
  raw_ui2_ban.png        → ua_nen.jpg (nền màn ngoài trận: trời lâu đài trên + vòng phép/hoa dưới, giữa tối #10162F)
  p7_ic_{lui,dong,loc,tim,tin,xong}.png (cũ) → chỉ lấy NÉT cyan (bỏ khung thép) đặt lên ua_nut_tron → ua_ic_{lui,dong,loc,tim,tin,xong}
Khoá magenta (tach_nen của thap-cat-hinh.py) → xén → thu Lanczos nhân-trước-alpha về ~3× cỡ CSS lớn nhất.
Chạy: python3 tools/thap-cat-ui3.py   (ghi thap/assets/ua_*.png|jpg + tờ xem docs/demo-hop-tuong/tuvan/huong-anime/cat_ui3.jpg)
"""
import os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
DICH = os.path.join(GOC, 'thap/assets')
XEM = os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/huong-anime')
_src = open(os.path.join(GOC, 'tools/thap-cat-hinh.py'), encoding='utf-8').read().split('\n')
exec('\n'.join(_src[17:58]))  # def tach_nen(im, mau)
DA = []


def raw(ten):
    return Image.open(os.path.join(NGUON, ten)).convert('RGB')


def xen(im, nguong=8):
    a = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(a > nguong)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def thu(im, w, h=None):
    """Lanczos nhân-trước-alpha; không phóng to quá ảnh gốc."""
    if h is None:
        if w > im.size[0]:
            w = im.size[0]
        h = max(1, round(im.size[1] * w / im.size[0]))
    a = np.asarray(im.convert('RGBA')).astype(np.float32) / 255
    p = np.dstack([a[..., :3] * a[..., 3:4], a[..., 3:4]])
    ch = [Image.fromarray(p[..., i], 'F').resize((w, h), Image.LANCZOS) for i in range(4)]
    q = np.dstack([np.asarray(c) for c in ch])
    al = np.clip(q[..., 3:4], 0, 1)
    rgb = np.where(al > 1e-4, q[..., :3] / np.maximum(al, 1e-4), 0)
    return Image.fromarray((np.dstack([np.clip(rgb, 0, 1), al]) * 255 + 0.5).astype(np.uint8), 'RGBA')


def luu(im, ten, ghi=''):
    p = os.path.join(DICH, ten)
    if ten.endswith('.jpg'):
        im.convert('RGB').save(p, quality=84, optimize=True, progressive=True)
    else:
        im.save(p, optimize=True)
    DA.append((ten, im))
    print('%-20s %4dx%-4d %6.0f KB  %s' % (ten, im.size[0], im.size[1], os.path.getsize(p) / 1024, ghi))


def cat(I, hop, le=6):
    x0, y0, x1, y1 = hop
    return xen(tach_nen(I.crop((max(0, x0 - le), max(0, y0 - le), x1 + le, y1 + le)), 'tim'))


def xoa_ngoc(arr, x0, x1, y0, y1, xm=None):
    """xoá ngọc trang trí giữa cạnh: mỗi hàng y0..y1 nội suy tuyến tính giữa cột x0-1 và cột x1 (không lộ vệt cột chép)."""
    t = np.linspace(0, 1, x1 - x0)[None, :, None]
    l = arr[y0:y1, x0 - 1:x0].astype(np.float32)
    r = arr[y0:y1, x1:x1 + 1].astype(np.float32)
    arr[y0:y1, x0:x1] = (l * (1 - t) + r * t + 0.5).astype(arr.dtype)


# ---------------- 1. icon HOME (4×2) ----------------
I = raw('raw_ui2_icon_home.png')
HOP = [(36, 56, 399, 427), (489, 20, 852, 407), (927, 20, 1293, 412), (1367, 20, 1739, 414),
       (27, 488, 407, 838), (478, 484, 843, 856), (916, 478, 1303, 844), (1377, 489, 1728, 841)]
for ten, hop in zip(['nv', 'shop', 'sk', 'vq', 'deck', 'bst', 'trum', 'cai'], HOP):
    im = cat(I, hop)
    # vuông, giữa: đặt vào khung vuông theo cạnh dài
    s = max(im.size)
    v = Image.new('RGBA', (s, s), (0, 0, 0, 0)); v.alpha_composite(im, ((s - im.size[0]) // 2, (s - im.size[1]) // 2))
    luu(thu(v, 168, 168), 'ua_ic_' + ten + '.png', 'icon HOME ≤56 css')

# ---------------- 2. icon tài nguyên (6×1) ----------------
T = raw('raw_ui2_icon_taisan.png')
HOP = [(26, 170, 357, 529), (372, 182, 706, 519), (714, 178, 1072, 502), (1074, 145, 1400, 545), (1430, 173, 1772, 523), (1780, 190, 2160, 520)]
for ten, hop in zip(['mana', 'vang', 'ngoc', 'do', 'sk', 'xp'], HOP):
    im = cat(T, hop)
    if ten == 'do':  # túi magenta kín trong vòng vàng quanh tinh thể (tach_nen chỉ xoá túi lớn) → xoá theo màu
        a = np.asarray(im).copy(); r, g, b = [a[..., i].astype(int) for i in range(3)]
        m = (r > 150) & (b > 150) & (g < 110) & (np.abs(r - b) < 90)
        a[..., 3] = np.where(nd.binary_dilation(m, iterations=1), 0, a[..., 3]); im = Image.fromarray(a, 'RGBA')
    s = max(im.size)
    v = Image.new('RGBA', (s, s), (0, 0, 0, 0)); v.alpha_composite(im, ((s - im.size[0]) // 2, (s - im.size[1]) // 2))
    luu(thu(v, 144, 144), 'ua_ts_' + ten + '.png', 'icon tài nguyên ≤48 css')

# ---------------- 3. nút ----------------
N = raw('raw_ui2_nut.png')
Na = np.asarray(N).copy()
# nút chính cam: thân y 138..452; ngọc giữa trên (x 455..800, y 70..195) + dưới (x 565..690, y 395..470)
vuong = Na.copy()
xoa_ngoc(Na, 440, 815, 60, 200, 420)
xoa_ngoc(Na, 555, 700, 385, 475, 520)
# nút phụ chàm: ngọc giữa trên (x 588..668, y 510..578) + dưới (x 585..668, y 735..808)
xoa_ngoc(Na, 575, 680, 505, 585, 540)
xoa_ngoc(Na, 575, 680, 728, 815, 540)
# pill: ngọc giữa trên (bật x 545..605 / tắt x 985..1048, y 905..965)
xoa_ngoc(Na, 538, 612, 900, 972, 520)
xoa_ngoc(Na, 978, 1055, 900, 972, 960)
N2 = Image.fromarray(Na)
luu(thu(cat(N2, (17, 120, 1237, 486)), 600), 'ua_nut_chinh.png', 'nút chính cam đào 9 lát')
# vương miện ngọc của nút chính (đặt riêng trên nút PLAY)
mien = cat(N, (450, 66, 805, 140), 0)
luu(thu(mien, 180), 'ua_mien.png', 'vương miện trên PLAY ~60 css')
luu(thu(cat(N2, (54, 498, 1199, 823)), 600), 'ua_nut_phu.png', 'nút phụ chàm viền cyan 9 lát')
luu(thu(cat(N, (25, 848, 340, 1182)), 150), 'ua_nut_tron.png', 'nút tròn ≤48 css')
luu(thu(cat(N2, (354, 895, 793, 1120)), 300), 'ua_pill_bat.png', 'pill bật (cyan) 9 lát')
luu(thu(cat(N2, (794, 895, 1233, 1120)), 300), 'ua_pill_tat.png', 'pill tắt (chàm) 9 lát')

# ---------------- 4. tấm / ô (từ tấm HUD) ----------------
H = raw('raw_ui2_hud.png')
luu(thu(cat(H, (628, 638, 1165, 812)), 540), 'ua_tam.png', 'tấm chàm vát góc 9 lát')
luu(thu(cat(H, (652, 886, 860, 1080)), 210), 'ua_o.png', 'ô vuông vát góc 9 lát')

# ---------------- 5. icon nhỏ: nét cyan của icon thép cũ đặt lên nút tròn mới ----------------
tron = Image.open(os.path.join(DICH, 'ua_nut_tron.png')).convert('RGBA')
for ten in ['lui', 'dong', 'loc', 'tim', 'tin', 'xong']:
    cu = Image.open(os.path.join(DICH, 'p7_ic_' + ten + '.png')).convert('RGBA')
    a = np.asarray(cu).astype(np.float32)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    # nét cyan/trắng sáng: B,G cao hơn R rõ (khung thép xám / vàng đồng bị loại)
    k = np.clip(((np.minimum(g, b) - r) - 30) / 60, 0, 1) * np.clip((b - 120) / 60, 0, 1)
    k = nd.binary_opening(k > 0.2, iterations=1) * k
    # giữ thành phần lớn ở giữa (bỏ chấm cyan rời trên khung)
    lab, n = nd.label(k > 0.2)
    if n:
        sz = nd.sum(k > 0.2, lab, range(1, n + 1))
        lon = max(sz)
        giu = np.isin(lab, [i + 1 for i, v in enumerate(sz) if v > lon * 0.12])
        k = k * nd.binary_dilation(giu, iterations=2)
    net = np.dstack([r, g, b, al * k]).astype(np.uint8)
    net = xen(Image.fromarray(net, 'RGBA'), 20)
    out = tron.copy()
    s = int(out.size[0] * 0.5)
    sc = s / max(net.size)
    net = thu(net, max(1, round(net.size[0] * sc)), max(1, round(net.size[1] * sc)))
    out.alpha_composite(net, ((out.size[0] - net.size[0]) // 2, (out.size[1] - net.size[1]) // 2))
    luu(out, 'ua_ic_' + ten + '.png', 'nút tròn + nét cũ')

# ---------------- 6. nền ngoài trận ----------------
B = raw('raw_ui2_ban.png')
Bn = np.asarray(B).astype(np.float32)
NEN = np.array([16, 22, 47], np.float32)
NW, NH = 860, 1720
nen = np.ones((NH, NW, 3), np.float32) * NEN


def ghep_doc(dich, anh, y0, nhat_tren, nhat_duoi):
    h = anh.shape[0]
    t = np.ones(h, np.float32)
    if nhat_tren:
        t[:nhat_tren] = np.linspace(0, 1, nhat_tren) ** 1.4
    if nhat_duoi:
        t[h - nhat_duoi:] = np.minimum(t[h - nhat_duoi:], np.linspace(1, 0, nhat_duoi) ** 1.4)
    y1 = min(dich.shape[0], y0 + h)
    t = t[:y1 - y0, None, None]
    dich[y0:y1] = dich[y0:y1] * (1 - t) + anh[:y1 - y0] * t


# trời + lâu đài (hàng 0..335, cột 150..874) phóng phủ 860 rộng — tối đi để chữ/nhân vật nổi
troi = Image.fromarray(Bn[0:335, 150:874].astype(np.uint8)).resize((NW, round(335 * NW / 724)), Image.LANCZOS)
troi = np.asarray(troi).astype(np.float32) * 0.62
ghep_doc(nen, troi, 0, 0, 150)
# vòng phép + hoa (hàng 1205..1536)
duoi = Image.fromarray(Bn[1205:1536, 0:1024].astype(np.uint8)).resize((NW, round(331 * NW / 1024)), Image.LANCZOS)
duoi = np.asarray(duoi).astype(np.float32) * 0.55
ghep_doc(nen, duoi, NH - duoi.shape[0], 120, 0)
luu(Image.fromarray(np.clip(nen, 0, 255).astype(np.uint8)), 'ua_nen.jpg', 'nền ngoài trận 2× (cover 430×860)')


# ---------------- 7. ảnh ChatGPT đợt 2 (raw_ui3_*, 09/11) ----------------
def co(ten):
    return os.path.exists(os.path.join(NGUON, ten))


def vuong(im):
    s = max(im.size)
    v = Image.new('RGBA', (s, s), (0, 0, 0, 0)); v.alpha_composite(im, ((s - im.size[0]) // 2, (s - im.size[1]) // 2))
    return v


if co('raw_ui3_vongquay.png'):
    V = raw('raw_ui3_vongquay.png')
    luu(thu(vuong(cat(V, (146, 49, 746, 655))), 600, 600), 'ua_vq_banh.png', 'đĩa vòng quay 8 ô (CSS ~200)')
    luu(thu(cat(V, (846, 0, 1492, 714), 0), 640), 'ua_vq_khung.png', 'khung vòng + chân đế')
    luu(thu(cat(V, (1699, 185, 1935, 509)), 120), 'ua_vq_mui.png', 'mũi chỉ xuống')
if co('raw_ui3_icon_nho.png'):
    I3 = raw('raw_ui3_icon_nho.png')
    for ten, hop in zip(['khoa', 'cong', 'tick'], [(91, 33, 642, 688), (806, 84, 1362, 636), (1513, 124, 2116, 627)]):
        luu(thu(vuong(cat(I3, hop)), 120, 120), 'ua_ic_' + ten + '.png', 'icon nhỏ ≤40 css')
if co('raw_ui3_ruong.png'):
    R3 = raw('raw_ui3_ruong.png')
    HOP = [(51, 89, 487, 444), (543, 72, 987, 452), (1031, 28, 1509, 453), (46, 530, 478, 991), (535, 513, 980, 991), (1052, 470, 1502, 995)]
    for i, (ten, hop) in enumerate(zip(['thuong', 'vang', 'than', 'thuong_mo', 'vang_mo', 'than_mo'], HOP)):
        # cùng khung vuông 480 (đáy rương thẳng hàng): đặt sát đáy, giữa ngang
        im = cat(R3, hop); v = Image.new('RGBA', (480, 480), (0, 0, 0, 0))
        sc = min(1, 470 / max(im.size)); im = thu(im, round(im.size[0] * sc), round(im.size[1] * sc))
        v.alpha_composite(im, ((480 - im.size[0]) // 2, 480 - im.size[1] - 5))
        luu(thu(v, 360, 360), 'ua_ru_' + ten + '.png', 'rương anime (CSS ≤120)')
if co('raw_ui3_banner.png'):
    Bn3 = raw('raw_ui3_banner.png')
    luu(thu(cat(Bn3, (46, 0, 2126, 350), 0), 1200), 'ua_bn_shop.png', 'băng DAILY SPECIALS')
    luu(thu(cat(Bn3, (46, 390, 2126, 724), 0), 1200), 'ua_bn_sk.png', 'khung băng sự kiện (ô chân dung trái)')
if co('raw_ui3_tam.png'):
    luu(thu(cat(raw('raw_ui3_tam.png'), (38, 26, 1498, 952)), 720), 'ua_tam2.png', 'tấm hộp thoại lớn 9 lát')
if co('raw_ui3_nen_home.png'):
    Nh = Image.open(os.path.join(NGUON, 'raw_ui3_nen_home.png')).convert('RGB')
    luu(Nh.resize((860, round(Nh.size[1] * 860 / Nh.size[0])), Image.LANCZOS), 'ua_nen.jpg', 'nền ngoài trận ChatGPT (thay bản ghép)')
    # màn tải (index.html #tai, taitai.css) dùng nen_menu.jpg 1024×1536: thay bằng cùng nền anime (cover). Ảnh mờ 32×48 nội tuyến trong index.html dựng lại tay khi đổi.
    sc = max(1024 / Nh.size[0], 1536 / Nh.size[1]); m = Nh.resize((round(Nh.size[0] * sc), round(Nh.size[1] * sc)), Image.LANCZOS)
    x0, y0 = (m.size[0] - 1024) // 2, (m.size[1] - 1536) // 2
    luu(m.crop((x0, y0, x0 + 1024, y0 + 1536)), 'nen_menu.jpg', 'nền màn tải anime')

# ---------------- tờ xem ----------------
if __name__ == '__main__':
    cw = 200
    rows = (len(DA) + 5) // 6
    sh = Image.new('RGB', (6 * cw, rows * (cw + 20)), (40, 40, 60))
    d = ImageDraw.Draw(sh)
    for i, (ten, im) in enumerate(DA):
        t = im.copy(); t.thumbnail((cw - 10, cw - 10))
        x, y = (i % 6) * cw, (i // 6) * (cw + 20)
        sh.paste(t, (x + 5, y + 5), t if t.mode == 'RGBA' else None)
        d.text((x + 5, y + cw), ten, fill='white')
    sh.save(os.path.join(XEM, 'cat_ui3.jpg'), quality=82)
