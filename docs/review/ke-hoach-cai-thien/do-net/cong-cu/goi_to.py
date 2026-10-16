"""Gói lại bản to ×1,2 của tấm Cu Tí: bỏ các ô thuộc hàng nắm tay KIỂU CŨ (hang_tay của hàng đã có biến thể "nam" — game chỉ dùng khi tắt
?namchuoi / ?thuong2tay / ?phitieuto; khi đó veT tự vẽ ô đó từ tấm thường như trước). Giảm dung lượng bản một tệp.
python3 goi_to.py"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import thu_net
CUS = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..', 'game', 'art', 'custom'))
for ma in ('zed-moi', 'zed-rung', 'zed-bien', 'zed-lau'):
    p = os.path.join(CUS, ma + '.sprite.json'); d = json.load(open(p, encoding='utf-8'))
    to = d['to']; O, C, CG = to['o'], to['cot'], to['cot_goc']
    bo = {da['hang_tay'] for da in d['dong_tac'].values() if isinstance(da, dict) and 'nam' in da and 'hang_tay' in da}
    im = np.array(Image.open(io.BytesIO(base64.b64decode(d['tam_to'].split(',', 1)[1]))).convert('RGBA'))
    giu = [(i, j) for i, j in enumerate(to['o_cua']) if j >= 0 and (i // CG) not in bo]
    hang = (len(giu) + C - 1) // C
    big = np.zeros((hang * O, C * O, 4), np.uint8); bang = [-1] * len(to['o_cua'])
    for n, (i, j) in enumerate(giu):
        big[(n // C) * O:(n // C + 1) * O, (n % C) * O:(n % C + 1) * O] = im[(j // C) * O:(j // C + 1) * O, (j % C) * O:(j % C + 1) * O]
        bang[i] = n
    cu = len(d['tam_to']); o_cu = sum(1 for x in to['o_cua'] if x >= 0)
    d['tam_to'] = 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(big)).decode(); to['o_cua'] = bang
    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(ma, 'bỏ %d hàng nắm tay cũ; ô %d → %d; %d → %d KB' % (len(bo), o_cu, len(giu), cu * 3 // 4 // 1024, len(d['tam_to']) * 3 // 4 // 1024))
