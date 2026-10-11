# Dựng anh/so-sanh.png: 2 vật thể thử (rương, bàn thờ; "Tự do" và "Theo bảng") đặt cạnh quái boHung và em bé em-be-smith, phóng 4× theo điểm ảnh game.
# Chỉ ĐỌC ảnh trong game/art/custom, không ghi gì vào đó. Chạy: python3 ve_so_sanh.py <repo> <thư mục kết quả kiem-phong.js> <ảnh ra>
import json, sys, base64, io
from PIL import Image, ImageDraw, ImageFont
REPO, RA, OUT = sys.argv[1:4]
F = lambda s, b=False: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans' + ('-Bold' if b else '') + '.ttf', s)
def khung(ma):
    d = json.load(open(f'{REPO}/game/art/custom/{ma}.sprite.json', encoding='utf-8')); n = d.get('net', 1)
    im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA')
    f = im.crop((0, 0, d['khung_rong'] * n, d['khung_cao'] * n)); return f.crop(f.getbbox()), n
def to(im, net, k): s = k // net; return im.resize((im.width * s, im.height * s), Image.NEAREST)
bo, nb = khung('boHung'); be, ne = khung('em-be-smith')
vat = {k: Image.open(f'{RA}/gd-vat-{m}-{c}.png').convert('RGBA') for k, m, c in (('r0', 'ruong', 'tu-do'), ('r1', 'ruong', 'bang'), ('b0', 'ban-tho', 'tu-do'), ('b1', 'ban-tho', 'bang'))}
SAN = (74, 73, 54, 255); W = 1240
im = Image.new('RGBA', (W, 900), (26, 22, 30, 255)); d = ImageDraw.Draw(im)
d.text((24, 16), 'Đợt 4 · Lô thử bảng màu: 2 vật thể mới đặt cạnh quái và em bé', font=F(26, True), fill=(246, 220, 146))
d.text((24, 52), 'Phóng 4 lần so với trong game. Nền là màu sàn Rừng già. Đây là ảnh để duyệt, không phải ảnh đưa vào game.', font=F(16), fill=(200, 196, 186))
# --- hàng 1: cỡ thật trong game ×4 ---
y0, h1 = 90, 220; d.rectangle([20, y0, W - 20, y0 + h1], fill=SAN)
ds = [(to(bo, nb, 4), 'Quái Bọ Hung\n(đang có trong game)'), (to(be, ne, 4), 'Em bé Thợ Rèn\n(đang có trong game)'), (to(vat['r0'], 2, 4), 'Rương · Tự do\n(cách cũ)'), (to(vat['r1'], 2, 4), 'Rương · Theo bảng\n(cách mới)'), (to(vat['b0'], 2, 4), 'Bàn thờ · Tự do\n(cách cũ)'), (to(vat['b1'], 2, 4), 'Bàn thờ · Theo bảng\n(cách mới)')]
o = (W - 40) // len(ds)
for i, (a, t) in enumerate(ds):
    cx = 20 + i * o + o // 2; im.alpha_composite(a, (cx - a.width // 2, y0 + h1 - 30 - a.height))
    d.multiline_text((cx, y0 + h1 + 8), t, font=F(15), fill=(230, 226, 214), anchor='ma', align='center')
# --- hàng 2: soi gần 2 vật thể (×8) ---
y1 = y0 + h1 + 70; d.text((24, y1), 'Soi gần (phóng 8 lần): bên trái mỗi cặp là "Tự do", bên phải là "Theo bảng màu Linh Khí"', font=F(18, True), fill=(246, 220, 146))
y1 += 36; h2 = 430; d.rectangle([20, y1, W - 20, y1 + h2], fill=SAN)
ds = [(to(vat['r0'], 2, 8), 'Rương · Tự do'), (to(vat['r1'], 2, 8), 'Rương · Theo bảng'), (to(vat['b0'], 2, 8), 'Bàn thờ · Tự do'), (to(vat['b1'], 2, 8), 'Bàn thờ · Theo bảng')]
o = (W - 40) // 4
for i, (a, t) in enumerate(ds):
    cx = 20 + i * o + o // 2; im.alpha_composite(a, (cx - a.width // 2, y1 + h2 - 40 - a.height))
    d.text((cx, y1 + h2 - 30), t, font=F(15, True), fill=(240, 236, 220), anchor='ma')
d.text((24, y1 + h2 + 14), 'Viền của vật thể "Theo bảng" là #14182e, cùng màu viền với quái và em bé. Hai vật thể do Claude tự vẽ bằng màu trong bảng, rồi làm mờ và lệch màu nhẹ để giả ảnh ChatGPT.', font=F(13), fill=(190, 186, 176))
im.convert('RGB').save(OUT); print('xong', im.size)
# ---- số đo "giữ chi tiết": cạnh rõ (hai điểm kề nhau lệch sáng ≥ 12/255) ở bản Tự do còn là cạnh ở bản Theo bảng không ----
def L(p): return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]
kq = {}
for k in ('r', 'b'):
    a, b = vat[k + '0'], vat[k + '1']; pa, pb = a.load(), b.load(); ro = con = 0
    for y in range(a.height):
        for x in range(a.width):
            for dx, dy in ((1, 0), (0, 1)):
                if x + dx >= a.width or y + dy >= a.height: continue
                p, q = pa[x, y], pa[x + dx, y + dy]
                if not (p[3] and q[3]) or abs(L(p) - L(q)) < 12: continue
                ro += 1; con += pb[x, y][:3] != pb[x + dx, y + dy][:3]
    kq['ruong' if k == 'r' else 'ban-tho'] = {'canh_ro_ban_tu_do': ro, 'con_la_canh_ban_theo_bang': con, 'ti_le': round(100 * con / ro, 1)}
json.dump(kq, open(RA + '/giu-chi-tiet.json', 'w'), indent=1); print(kq)
