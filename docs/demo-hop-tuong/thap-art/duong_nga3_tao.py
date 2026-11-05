# TURRET MERGE — tạo ô NGÃ BA (duong_nga3.png) cho CO-OP bằng cách ghép lại texture đường có sẵn.
# Nguồn: thap/assets/duong_thang.png (160x352, đường thẳng dọc: ray trái 0..35 | tấm sàn 35..125 | rãnh+ray phải 125..160)
# Kết quả 160x160: ray TRÁI liền suốt chiều cao (làn trên + làn dưới nối liền), cạnh TRÊN / DƯỚI / PHẢI mở
# → làn từ cổng trên & cổng dưới đổ vào, nhập thành hành lang chung đi sang phải về lõi.
# Chạy: python3 docs/demo-hop-tuong/thap-art/duong_nga3_tao.py
import os
from PIL import Image, ImageFilter

GOC = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(GOC, '..', '..', '..'))
th = Image.open(os.path.join(REPO, 'thap/assets/duong_thang.png')).convert('RGBA')

Y0 = 70  # hàng nguồn 70..230: rãnh nối 2 tấm sàn nằm gần giữa ô
src = th.crop((0, Y0, 160, Y0 + 160))

out = Image.new('RGBA', (160, 160), (0, 0, 0, 0))
# 1) ray trái + rãnh trái giữ nguyên (cột 0..35)
out.paste(src.crop((0, 0, 35, 160)), (0, 0))
# 2) tấm sàn nguồn 35..124 (đủ bu-lông 2 mép) kéo giãn ngang ra 35..160 → bỏ rãnh + ray phải, sàn mở ra cạnh phải, không mối nối
san = src.crop((35, 0, 124, 160)).resize((125, 160), Image.LANCZOS)
out.paste(san, (35, 0))
# 3) mép phải: sàn phải đặc hoàn toàn (alpha 255) để nối khít với hành lang
px = out.load()
for y in range(160):
    for x in range(35, 160):
        r, g, b, a = px[x, y]; px[x, y] = (r, g, b, 255)

# 4) góc lõm: khối ray bu-lông ở góc trên-phải & dưới-phải → ray phải của làn trên/dưới nối liền ray hành lang
khoi = th.crop((134, 100, 160, 126))
out.alpha_composite(khoi, (134, 0)); out.alpha_composite(khoi.transpose(Image.FLIP_TOP_BOTTOM), (134, 134))
out.save(os.path.join(REPO, 'thap/assets/duong_nga3.png'))
out.save(os.path.join(GOC, 'duong_nga3.png'))
# ảnh xem thử: ô ngã ba + làn trên/dưới + hành lang phải
prev = Image.new('RGBA', (160 + 352, 160 + 2 * 200), (40, 42, 46, 255))
lan = th.crop((0, 0, 160, 200))
prev.alpha_composite(lan, (0, 0)); prev.alpha_composite(th.crop((0, 152, 160, 352)), (0, 360))
prev.alpha_composite(out, (0, 200))
prev.alpha_composite(th.rotate(90, expand=True).crop((0, 0, 352, 160)), (160, 200))
prev.save(os.path.join(GOC, 'duong_nga3_xemthu.png'))
print('ok')
