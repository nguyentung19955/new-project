"""Sinh ảnh mẫu giả cho test tool cắt ảnh: python3 tao-anh-mau.py <thư mục vào> <thư mục ảnh chuẩn>
<vào>: ảnh như người dùng để trong "D:\\ảnh game" (tên lệch, lưới lệch, sai cỡ, thiếu khung…)
<chuẩn>: bản lưới đúng của cùng nội dung (để cắt bằng tools cũ làm kết quả mẫu)."""
import os, sys
from PIL import Image, ImageDraw, ImageFilter

vao, chuan = sys.argv[1], sys.argv[2]
os.makedirs(vao, exist_ok=True); os.makedirs(chuan, exist_ok=True)
MG, OUT = (255, 0, 255), (42, 22, 8)


def nguoi(g, x0, y0, cs, i, mau, dau=False):
    """Một 'nhân vật' trong ô cs×cs: thân + đầu + tay đổi theo khung i; chân chạm cùng đường đáy."""
    k = cs / 192
    if dau:
        g.ellipse((x0 + 50 * k, y0 + 40 * k, x0 + 140 * k, y0 + 130 * k), fill=(240, 190, 140), outline=OUT, width=4)
        g.rectangle((x0 + 70 * k, y0 + 120 * k, x0 + 120 * k, y0 + 160 * k), fill=mau, outline=OUT, width=4)
        return
    lift = (i % 4) * 4 * k
    g.rectangle((x0 + 70 * k, y0 + 70 * k - lift, x0 + 115 * k, y0 + 150 * k), fill=mau, outline=OUT, width=4)
    g.ellipse((x0 + 66 * k, y0 + 28 * k - lift, x0 + 118 * k, y0 + 78 * k - lift), fill=(240, 190, 140), outline=OUT, width=4)
    ax = x0 + (112 + (i * 7) % 28) * k
    g.line((x0 + 110 * k, y0 + 90 * k - lift, ax, y0 + (70 + (i * 11) % 40) * k), fill=OUT, width=int(8 * k))
    g.rectangle((x0 + 74 * k, y0 + 150 * k, x0 + 88 * k, y0 + 172 * k), fill=(90, 60, 30), outline=OUT, width=3)
    g.rectangle((x0 + 97 * k, y0 + 150 * k, x0 + 111 * k, y0 + 172 * k), fill=(90, 60, 30), outline=OUT, width=3)


def tam(cols, rows, cs, mau, head=None, bo=(), lap=None):
    im = Image.new('RGB', (cols * cs, rows * cs), MG); g = ImageDraw.Draw(im)
    for i in range(cols * rows):
        if i in bo: continue
        j = lap[1] if lap and i == lap[0] else i
        r, c = divmod(i, cols)
        nguoi(g, c * cs, r * cs, cs, j, tuple((v + 9 * j) % 200 + 20 for v in mau), dau=(i == head))
    return im


# 1. tướng chuẩn 768×576
h1 = tam(4, 3, 192, (60, 110, 40), head=3); h1.save(vao + '/thaymo.png'); h1.save(chuan + '/thaymo.png')
# 2. tướng AI trả về 1024×768 (đúng tỉ lệ, to hơn), tên tải trùng "(1)" chữ hoa
h2 = tam(4, 3, 256, (150, 70, 30), head=3); h2.save(vao + '/Dotnuong (1).PNG'); h2.save(chuan + '/dotnuong.png')
# 3. tướng lệch lề + sai cỡ: lưới đúng dán lệch vào nền 860×700, đuôi .png.png
h3 = tam(4, 3, 192, (40, 90, 150), head=3); h3.save(chuan + '/denroi.png')
c3 = Image.new('RGB', (860, 700), MG); c3.paste(h3, (57, 83)); c3.save(vao + '/denroi.png.png')
# 3b. ảnh gốc rất to (AI xuất 3072×2304, ~4 lần cỡ yêu cầu)
h4 = tam(4, 3, 768, (110, 60, 120), head=3); h4.save(vao + '/thoren.png'); h4.save(chuan + '/thoren.png')
# 4. quái 3×2, boss 3×3
e = tam(3, 2, 192, (120, 140, 30)); e.save(vao + '/tom.png'); e.save(chuan + '/tom.png')
b = tam(3, 3, 256, (150, 40, 40)); b.save(vao + '/Hổ Vương Triệu Đà.png'); b.save(chuan + '/trieuda.png')
# 5. tướng lỗi: ô 6 trống, khung 9 chép y hệt khung 10
x = tam(4, 3, 192, (90, 90, 90), head=3, bo=(5,), lap=(8, 9)); x.save(vao + '/xathu.png'); x.save(chuan + '/xathu.png')
# 6. dải hiệu ứng nền đen + nền hồng tím, tấm đạn 5 ô, icon kỹ năng 4 ô
d = Image.new('RGB', (1536, 256), (0, 0, 0)); g = ImageDraw.Draw(d)
for i in range(6): r = 20 + i * 15; g.ellipse((i * 256 + 128 - r, 128 - r, i * 256 + 128 + r, 128 + r), fill=(255, 140 - i * 10, 40))
d = d.filter(ImageFilter.GaussianBlur(3)); d.save(vao + '/trung-kim.png'); d.save(chuan + '/trung-kim.png')
d = Image.new('RGB', (1536, 256), MG); g = ImageDraw.Draw(d)
for i in range(6): g.ellipse((i * 256 + 80, 80 + i * 10, i * 256 + 176, 176 + i * 10), fill=(130, 110, 80), outline=OUT, width=4)
d.save(vao + '/no_tho.png'); d.save(chuan + '/no-tho.png')
d = Image.new('RGB', (1280, 256), MG); g = ImageDraw.Draw(d)
for i in range(5): g.ellipse((i * 256 + 70 + i * 6, 90, i * 256 + 190, 166 - i * 4), fill=(40 + i * 40, 160, 200 - i * 30), outline=OUT, width=5)
d.save(vao + '/dan-he.png'); d.save(chuan + '/dan-he.png')
d = Image.new('RGB', (512, 128), MG); g = ImageDraw.Draw(d)
for i in range(4): g.rounded_rectangle((i * 128 + 22, 22 + i * 3, i * 128 + 106, 106), 12, fill=(200, 120 - i * 20, 40 + i * 30), outline=OUT, width=5)
d.save(vao + '/icon-thaymo.png'); d.save(chuan + '/icon-thaymo.png')
# 7. ảnh không nhận ra tên
Image.new('RGB', (64, 64), MG).save(vao + '/anh-la.png')
# 8. thư mục kết quả cũ bên trong (phải bị bỏ qua)
os.makedirs(vao + '/da-cat/assets', exist_ok=True); h1.save(vao + '/da-cat/assets/thaymo.png')
