#!/usr/bin/env python3
"""Chuyển tấm quái ChatGPT CŨ thành <mã>-plcu (mục "quai_cu_cua": "<mã>") — cùng cách của phiên vùng 1–2 (js/sprite_custom.js, game/build.py):
tấm cũ chỉ nạp khi ?quaipl=0, không tính vào "web tải đầu"; tấm PixelLab mới mang thẳng mã cũ (dung-quai-34.py, mục "quai_moi").
Chỉ đổi "ma" + thêm "quai_cu_cua", mọi thứ khác (ảnh, hàng, neo) giữ nguyên. Chạy kiem_anh.py sau khi chuyển.
  python3 doi-cu.py <mã cũ> ..."""
import json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..'))
C = os.path.join(ROOT, 'game', 'art', 'custom')
for ma in sys.argv[1:]:
    p = os.path.join(C, ma + '.sprite.json'); q = os.path.join(C, ma + '-plcu.sprite.json')
    if os.path.exists(q): print(ma, 'đã có -plcu'); continue
    t = json.load(open(p, encoding='utf-8'))
    assert not t.get('quai_moi'), ma + ' đã là tấm mới'
    out = {}
    for k, v in t.items():
        out[k] = ma + '-plcu' if k == 'ma' else v
        if k == 'ma': out['quai_cu_cua'] = ma
    json.dump(out, open(q, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    os.remove(p)
    print(ma, '→', ma + '-plcu')
