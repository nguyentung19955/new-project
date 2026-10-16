"""Đo SẢI CHÂN một vòng hàng chạy trên tấm game/art/custom/zed-moi.sprite.json (ô 96×96, chân ở y 90, neo ngang theo tâm đầu).
    python3 do-sai.py [hàng ...]      (mặc định: chay chay~16 chay2tay)
Cách đo (cùng ý với cu-ti-to-muot mục (d)): mỗi khung lấy các đoạn bàn chân chạm đất (điểm ảnh đặc ở 3 hàng đáy y 87–89, cách nhau
> 2 điểm ảnh là bàn khác). Hai khung liền nhau có bàn chân chạm đất chồng nhau (cùng một bàn đang trụ) → bàn trụ lùi bao nhiêu
(mép trước, mép sau, lấy trung vị). Sải một vòng (điểm game, cỡ cũ) = trung bình độ lùi mỗi khung lúc trụ × số khung / 2.
In thêm từng cặp khung để soát."""
import base64, io, json, os, sys
import numpy as np
from PIL import Image
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
t = json.load(open(os.path.join(DAY, 'game/art/custom/zed-moi.sprite.json'), encoding='utf-8'))
tam = np.array(Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',', 1)[1]))).convert('RGBA'))
ds = sys.argv[1:] or ['chay', 'chay~16', 'chay2tay']


def chan(f):
    m = f[86:91, :, 3] > 100
    cols = np.nonzero(m.any(0))[0]
    doan, s = [], None
    for i, x in enumerate(cols):
        if s is None: s = x
        if i + 1 == len(cols) or cols[i + 1] > x + 2: doan.append((int(s), int(x))); s = None
    return doan


ra = {}
for ten in ds:
    d = t['dong_tac'].get(ten)
    if not d: print(ten, 'không có'); continue
    fr = [tam[d['hang'] * 96:(d['hang'] + 1) * 96, i * 96:(i + 1) * 96] for i in range(d['so'])]
    C = [chan(f) for f in fr]; lui = []; cap = []
    for i in range(d['so']):
        a, b = C[i], C[(i + 1) % d['so']]
        for s0 in a:
            for s1 in b:
                if s1[0] <= s0[1] and s0[0] <= s1[1]:  # chồng nhau: cùng bàn trụ
                    dx = float(np.median([s0[0] - s1[0], s0[1] - s1[1]]))
                    if dx >= 0: lui.append(dx); cap.append((i + 1, (i + 1) % d['so'] + 1, s0, s1, dx))
    sai = float(np.mean(lui)) * d['so'] / 2 if lui else None
    ra[ten] = {'so': d['so'], 'cap_tru': len(lui), 'lui_tb_o96': round(float(np.mean(lui)), 2) if lui else None, 'sai_game': round(sai, 1) if sai else None}
    print(ten, ra[ten])
    for c in cap: print('   khung %d→%d  %s → %s  lùi %.1f' % c)
json.dump(ra, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'do-sai.json'), 'w'), ensure_ascii=False, indent=1)
