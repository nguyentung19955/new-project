# Ghi "can_tam" vào 9 tệp trùm vùng: độ dời ngang (điểm ảnh game) từng khung để tâm thân trên sàn trùng điểm neo goc[0].
# Hàng lặp (idle, move): căn từng khung. Hàng một lần (tele, atk, hit, die): bỏ độ lệch cả hàng (trung vị) + một nửa độ nhảy từng khung.
# Chạy lại an toàn (thay mục cũ). Chỉ đổi đúng mục "can_tam", ảnh giữ nguyên từng byte.
import json, re, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from anh_trum import doc, tam_than, CUSTOM, TRUM

for m in TRUM:
    d, im = doc(m); ax = d['goc'][0]; C = tam_than(d, im); ct = {}
    for k, v in C.items():
        cs = [c for c in v if c is not None]; med = sorted(cs)[len(cs) // 2]
        tg = [(c if k in ('idle', 'move') else med + (c - med) * 0.5) if c is not None else med for c in v]
        ct[k] = [max(-24, min(24, int(round(ax - x)))) for x in tg]
    p = os.path.join(CUSTOM, m + '.sprite.json'); s = open(p, encoding='utf-8').read()
    s = re.sub(r',"can_tam":\{[^{}]*\}', '', s)
    g = '"goc":[%d,%d]' % tuple(d['goc'])
    assert s.count(g) == 1, m
    s = s.replace(g, g + ',"can_tam":' + json.dumps(ct, separators=(',', ':')))
    json.loads(s)
    open(p, 'w', encoding='utf-8').write(s)
    print(m, ct)
