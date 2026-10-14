"""Bản đồ chọn ải: docs/anh-goc/nen-phong/ban-do-chon-ai.png (1672×941) -> gd-ban-do-vung (480×270, net 1; game dán vào tranh 480×270).
python3 dung-ban-do.py [--ghi] [--soat=xem-ban-do-2.png]  — và ảnh soát ../xem-ban-do.png (bản đồ + 15 ô ải đặt thử bằng thẻ ảnh mới, đường nét đứt, chữ, ô UI chồng lên).
Toạ độ (VS.MAP trong js/village_scene.js) lấy từ MAP bên dưới — sửa ở đây rồi chép sang game."""
import sys, os, io, json, base64
import numpy as np
from PIL import Image, ImageDraw, ImageFont
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
MAP = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ban-do-toa-do.json'), encoding='utf-8'))
im = Image.open(os.path.join(DAY, 'docs/anh-goc/nen-phong/ban-do-chon-ai.png')).convert('RGB').resize((480, 270), Image.LANCZOS)
q = im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': 'gd-ban-do-vung', 'ten': 'Tranh bản đồ vùng', 'doi_tuong': 'giao-dien',
     'anh': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()}
ra = os.path.join(DAY, 'game/art/custom/gd-ban-do-vung.sprite.json') if GHI else os.path.join(RA, 'gd-ban-do-vung.sprite.json')
json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('gd-ban-do-vung byte', os.path.getsize(ra))
# ---- ảnh soát (phóng 3) ----
S = 3
bg = Image.open(io.BytesIO(buf.getvalue())).convert('RGBA').resize((480 * S, 270 * S), Image.NEAREST)
dr = ImageDraw.Draw(bg)
def gd(ma):
    d = json.load(open(os.path.join(DAY, 'game/art/custom', ma + '.sprite.json'), encoding='utf-8'))
    a = Image.open(io.BytesIO(base64.b64decode(d['anh'].split(',')[1]))).convert('RGBA'); n = d.get('net', 1)
    return a.resize((a.width * S // n, a.height * S // n), Image.NEAREST), a.width / n, a.height / n
NEO = {'gd-the-ai': [0.514, 0.4], 'gd-the-trum': [0.578, 0.679]}
def dash(a, b, col):
    n = int(np.ceil(np.hypot(b[0] - a[0], b[1] - a[1]) / 4))
    for j in range(1, n):
        if j % 2: x = a[0] + (b[0] - a[0]) * j / n; y = a[1] + (b[1] - a[1]) * j / n; dr.rectangle([x * S, y * S, (x + 2) * S - 1, (y + 2) * S - 1], fill=col)
ink = (122, 74, 48, 255); faint = (184, 168, 128, 255)
N = MAP['nodes']
for r in range(3):
    dash(MAP['from'][r], N[r][0], ink)
    if r == 2: dash(N[1][4], N[2][0], ink)
    for i in range(4): dash(N[r][i], N[r][i + 1], ink)
for d in MAP['soonDash']: dash(N[d[0]][d[1]], d[2], faint)
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 8 * S)
except Exception: F = None
def chu(s, x, y, size=8, col=(74, 54, 38)):
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(size * S)) if F else None
    w = dr.textlength(s, font=f); dr.text((x * S - w / 2, y * S - size * S), s, font=f, fill=col + (255,), stroke_width=2, stroke_fill=(240, 230, 200, 255))
for r in range(3):
    for i in range(5):
        boss = i == 4; ma = 'gd-the-trum' if boss else 'gd-the-ai'
        st = '-khoa' if (r, i) in [(2, 3), (2, 4)] else '-chon' if (r, i) == (1, 2) else ''
        a, w, h = gd(ma + st); x, y = N[r][i]; nx, ny = NEO[ma]
        bg.alpha_composite(a, (int(round((x - nx * w) * S)), int(round((y - ny * h) * S))))
        if not st.endswith('khoa'): chu(str(i + 1), x, y + 3, 8, (40, 24, 16))
        chu('⚔12' if i % 2 else '★★☆', x, y + (1 - ny) * h + 5, 6.5, (255, 210, 63) if i % 2 == 0 else (155, 224, 122))
REG = ['Rừng già', 'Hang biển', 'Lâu đài cổ']; BOSS = ['Mộc Tinh', 'Ngư Tinh', 'Hỏa Tinh']
for r in range(3):
    q_ = MAP['names'][r]; chu(REG[r], q_[0], q_[1], 10, tuple(int(q_[2][k:k + 2], 16) for k in (1, 3, 5)))
    b = N[r][4]; o = MAP['bossLab'][r]; chu(BOSS[r], b[0] + o[0], b[1] + o[1], 6.5)
for s_ in MAP['soon']:
    chu(s_[0], s_[1], s_[2], 8, (138, 122, 88)); px, py = s_[3] or s_[1], s_[4] or s_[2] + 12
    dr.rectangle([(px - 16) * S, (py - 7) * S, (px + 16) * S, (py + 3) * S], fill=(74, 54, 38, 220))
chu('Làng', *MAP['lang'], 8)
# lớp giao diện chồng lên: bảng thông tin, nút Về làng / Ải ngày, nút độ khó (chỉ khi qua hết 15 ải), bong bóng Chú Lái Đò, Chú Lái Đò
for (x0, y0, w, h, ten) in [(248, 206, 226, 60, 'bảng ải'), (404, 7, 68, 18, 'Về làng'), (404, 30, 68, 18, 'Ải ngày'), (MAP["doKho"][0], MAP["doKho"][1], 142, 19, "độ khó (sau 15 ải)")]:
    dr.rectangle([x0 * S, y0 * S, (x0 + w) * S, (y0 + h) * S], outline=(255, 255, 255, 255), width=2); dr.text((x0 * S + 4, y0 * S + 2), ten, fill=(255, 255, 255, 255))
bx, by = MAP['loiLai']; dr.rectangle([(bx - 38) * S, (by - 24) * S, (bx + 38) * S, by * S], outline=(255, 233, 168, 255), width=2)
d = json.load(open(os.path.join(DAY, 'game/art/custom/nl-lai.sprite.json'), encoding='utf-8'))
a = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'); n = d['net']; fw, fh = d['khung_rong'] * n, d['khung_cao'] * n
k = a.crop((0, 0, fw, fh)); k = k.resize((fw * 2 * S // n, fh * 2 * S // n), Image.NEAREST)
bg.alpha_composite(k, (int((32 - d['goc'][0] * 2) * S), int((264 - d['goc'][1] * 2) * S)))
SOAT = next((x.split('=', 1)[1] for x in sys.argv if x.startswith('--soat=')), 'xem-ban-do.png')  # 14/10 sửa nhỏ: --soat=xem-ban-do-2.png
bg.convert('RGB').save(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', SOAT))
