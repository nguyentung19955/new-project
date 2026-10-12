# Sửa hàng chạy: Cu Tèo (hunter), Cu Lì (wrestler) 7 -> 8 khung [0..6, 3]; Cái Bống (healer) hạ bước A (khung 0-3) 1 điểm ảnh nét.
import json, base64, io
import numpy as np
from PIL import Image
R = '/home/claude/new-project/game/art/custom/'
def doc(k):
    d = json.load(open(R + f'em-be-{k}.sprite.json'))
    B = np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'))
    return d, B
def ghi(k, d, B):
    im = Image.fromarray(B, 'RGBA'); bio = io.BytesIO(); im.save(bio, 'PNG', optimize=True)
    d['tam'] = 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode()
    json.dump(d, open(R + f'em-be-{k}.sprite.json', 'w'), separators=(',', ':'), ensure_ascii=False)
    print(k, d['dong_tac']['move'], len(bio.getvalue()))
S = 96
for k in ['hunter', 'wrestler']:
    d, B = doc(k); m = d['dong_tac']['move']; assert m['so'] == 7
    y = m['hang'] * S
    B[y:y + S, 7 * S:8 * S] = B[y:y + S, 3 * S:4 * S]
    m['so'] = 8; m['giay'] = 0.6  # giữ nhịp: 2 bước × 0,3 s như trước, mỗi bước 4 khung
    ghi(k, d, B)
d, B = doc('healer'); m = d['dong_tac']['move']; y = m['hang'] * S
for i in range(4):
    c = B[y:y + S, i * S:(i + 1) * S].copy(); assert not c[-1, :, 3].any()
    B[y:y + S, i * S:(i + 1) * S] = 0; B[y + 1:y + S, i * S:(i + 1) * S] = c[:-1]
ghi('healer', d, B)
