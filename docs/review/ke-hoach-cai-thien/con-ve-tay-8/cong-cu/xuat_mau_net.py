"""Xuất ảnh có sẵn trong game/art/custom ra PNG làm MẪU NÉT gửi kèm khi gen (nền #00FF00, phóng theo điểm game ×4 = ảnh net 2 ×2).
    python3 xuat_mau_net.py"""
import json, base64, io, os, shutil
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(os.path.dirname(HERE), 'mau')
ART = os.path.abspath(os.path.join(HERE, '../../../../../game/art/custom'))
GOC = os.path.abspath(os.path.join(HERE, '../../../../anh-goc/quai-moi'))
MA = ['hu-va-cham', 'hu-doc-toe', 'hu-moi-truong-rung-domdom', 'hu-moi-truong-rung-la', 'hu-vong-song', 'gd-cot-nang-rung', 'gd-khung-mau', 'gd-khung-trum',
      'gd-khung-bang', 'gd-nut-thuong', 'gd-o-con', 'gd-vat-suoi-mau', 'gd-vat-ban-tho', 'gd-tt-bien-vung-nuoc', 'gd-tt-lau-tham-vuong', 'gd-cua-rung-tren', 'gd-nen-bien-san0',
      'gd-nen-bien-tuong-sau', 'gd-cham-than', 'hu-hat-linh-khi', 'heoCon', 'caCon', 'boHung', 'hoaBaoTu']
for ma in MA:
    d = json.load(open(os.path.join(ART, ma + '.sprite.json')))
    s = d.get('tam') or d.get('anh')
    im = Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')
    k = 2 if (d.get('net') or 1) == 2 else 4
    bg = Image.new('RGBA', im.size, (0, 255, 0, 255)); bg.alpha_composite(im)
    bg = bg.convert('RGB').resize((im.width * k, im.height * k), Image.NEAREST)
    bg.save(os.path.join(OUT, 'net-%s.png' % ma), optimize=True)
    print(ma, im.size, '×', k)
for ma in []:  # ảnh mẫu thiết kế đã có sẵn ở docs/anh-goc/quai-moi/<mã>-mau-moi.png: gửi thẳng từ đó, không chép
    p = os.path.join(GOC, ma + '-mau-moi.png')
    if os.path.exists(p): shutil.copy(p, os.path.join(OUT, 'net-%s-mau-moi.png' % ma)); print('chép', p)
