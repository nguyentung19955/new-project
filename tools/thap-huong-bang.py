#!/usr/bin/env python3
"""Bảng kiểm kê HƯỚNG NHÌN mọi quái / tinh anh / trùm → docs/demo-hop-tuong/tuvan/huong3/BANG.md + bang.png (tờ ảnh).
Chạy lại sau mỗi lần ráp ảnh mới:  python3 tools/thap-huong-bang.py"""
import os, re, json
from PIL import Image, ImageDraw
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); A = os.path.join(R, 'thap/assets')
OUT = os.path.join(R, 'docs/demo-hop-tuong/tuvan/huong3'); os.makedirs(OUT, exist_ok=True)
trum = open(os.path.join(R, 'thap/js/trum.js'), encoding='utf-8').read()
muon = dict(re.findall(r"^  (\w+): +\{.*anhTam: '(\w+)'", trum, re.M))
LOAI = [('bo', 'quai', 'thường'), ('bay', 'quai', 'thường (bay)'), ('bay_bang', 'quai', 'thường (bay)'), ('tach', 'quai', 'thường (tách → nho)'),
        ('khong_lo', 'quai', 'TINH ANH'), ('que_tach', 'quai', 'TINH ANH'),
        *[(t, 'trum', 'trùm cũ') for t in ['mad_crown', 'freezer', 'janus', 'joker_king', 'nightmare', 'octopus']],
        *[(t, 'trum', 'trùm mới') for t in ['hive', 'jammer', 'prism', 'twin_core', 'patcher', 'leech']]]
co = lambda f: os.path.exists(os.path.join(A, f))
can = {x['name'] for x in json.load(open(os.path.join(OUT, 'CAN-VE.json')))} if os.path.exists(os.path.join(OUT, 'CAN-VE.json')) else set()
dong = ['# Hướng nhìn quái / tinh anh / trùm — kiểm kê', '', '✅ có ảnh · ⏳ đã có prompt chờ gen (CAN-VE.json hoặc đơn q_p6) · ↔ dùng dải trước + nghiêng (tạm) · ⇋ trái = lật dải phải', '',
        '| id | loại | trước (đi xuống) | ngang (phải) | trái | sau (đi lên) | đánh (tung chiêu, nhìn bàn) |', '|---|---|---|---|---|---|---|']
hang = []
for id, l, nhom in LOAI:
    g = f'{l}_{id}'
    tr = co(g + '_8.png'); m = muon.get(id) if not tr else None
    cho = lambda v: f'raw_p12_{id}_{v}.png' in can or (nhom == 'trùm mới')
    o = lambda f, v: '✅' if co(f) else ('⏳' if cho(v) else '—')
    side, back, left = g + '_side_8.png', g + '_back_8.png', g + '_left_8.png'
    danh = '✅ dải 16' if co(g + '_atk_16.png') else '✅ nhìn bàn (dải trước) + hiệu ứng rời fx_trum' if co(f'fx_trum_{id}.png') else ('✅ khung 3 (dải 4 cũ)' if l == 'trum' and co(g + '.png') else ('⏳ (q_p6 fx)' if nhom == 'trùm mới' else 'không có chiêu'))
    dong.append(f"| {id} | {nhom} | {'✅' if tr else '⏳ mượn ' + str(m)} | {o(side, 'side') if co(side) else o(side, 'side') + ' ↔'} | {'✅' if co(left) else ('⇋' if co(side) else '↔')} | {o(back, 'back') if co(back) else o(back, 'back') + ' ↔'} | {danh} |")
    hang.append((f'{id} ({nhom})', [g + '_8.png' if tr else f'trum_{m}_8.png', side, back, g + '_atk_16.png']))
dong += ['', 'Tờ ảnh: `bang.png` (cột: trước · ngang · sau · đánh; ô trống = chưa có). Dải khung khi đi thật mỗi chế độ: `tong_solo.jpg`, `tong_coop.jpg`, `tong_pvp.jpg`; số liệu: `ketqua.json` (tools/thap-kt-huong.js).',
         '', 'Logic (thap/js/quaianim.js, mọi chế độ): ngang → dải ngang (trái: dải trái thật nếu có, không thì lật); lên → dải sau; xuống → dải trước;',
         'trùm: nhìn màn hình 0,9 s lúc vào + lúc báo chiêu (dải đánh 16 khung nếu có, không thì khung 3 dải 4 cũ); xong quay lại hướng làn. Chưa có ảnh hướng → dải trước nghiêng ≤ 8° (tạm).']
open(os.path.join(OUT, 'BANG.md'), 'w', encoding='utf-8').write('\n'.join(dong) + '\n')
c = Image.new('RGB', (220 + 4 * 104, len(hang) * 104 + 30), (30, 30, 36)); d = ImageDraw.Draw(c)
for k, t in enumerate(['front', 'side', 'back', 'atk']): d.text((220 + k * 104 + 30, 8), t, fill='white')
for r, (t, fs) in enumerate(hang):
    y = 30 + r * 104; d.text((6, y + 45), t, fill='white')
    for k, f in enumerate(fs):
        p = os.path.join(A, f)
        if not os.path.exists(p): d.text((220 + k * 104 + 40, y + 45), '—', fill=(200, 80, 80)); continue
        im = Image.open(p).convert('RGBA'); H = im.height; n = round(im.width / H)
        fr = im.crop((0 if k < 3 else 8 * H, 0, H if k < 3 else 9 * H, H)).resize((100, 100))
        c.paste(fr, (220 + k * 104, y), fr)
c.save(os.path.join(OUT, 'bang.png')); print('\n'.join(dong))
