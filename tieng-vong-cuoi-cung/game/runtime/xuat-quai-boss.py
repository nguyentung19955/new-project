#!/usr/bin/env python3
"""Xuất GÓI RUNTIME quái + boss cho game (vẽ trực tiếp từ mảnh + JSON, KHÔNG dùng sprite sheet).

Nguồn: art/the-gioi-moi/quai-boss/ (quai.json, boss.json, manh/). Đích: game/runtime/quai-boss/
  - quai/*.png, boss/*.png : mảnh thu về đúng 2 px ảnh / 1 px logic (cùng mật độ với sheet Lam 2x), viền trong 2 px
  - quai-boss-rig.json     : rig (nút, điểm gắn, pivot, thứ tự vẽ) + tư thế tính sẵn từng khung của mọi clip,
                             dạng mảng gọn [dx, dy, goc, sx, sy, toi, mo, hien] theo thứ tự nút 'nut_ds'.
Nháy trắng nướng trong clip ('trang') BỊ BỎ ở đây: game tự quản lý nháy (q.flash / b.flash) bằng ảnh trắng cache sẵn.
Đơn vị toạ độ rig = px ảnh nguồn (như quai.json/boss.json); nhân ty_le ra px logic.
Chạy: python3 game/runtime/xuat-quai-boss.py   (cần pillow, numpy, scipy)"""
import json, os
import numpy as np
from PIL import Image
from scipy.spatial import ConvexHull

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, '..', '..', 'art', 'the-gioi-moi', 'quai-boss'))
DST = os.path.join(HERE, 'quai-boss')
PX_ANH_MOI_PX_LOGIC = 2.0
PAD = 2  # px ảnh

out = {'phien_ban': 1,
       'ghi_chu': 'Sinh bởi game/runtime/xuat-quai-boss.py từ art/the-gioi-moi/quai-boss/. Toạ độ rig = px ảnh nguồn; '
                  'ảnh mảnh ở 2 px/px logic. Tư thế khung: [dx,dy,goc,sx,sy,toi,mo,hien] theo nut_ds. '
                  'Đã bỏ kênh trang (nháy trắng) khỏi clip – game tự nháy.',
       'px_anh_moi_px_logic': PX_ANH_MOI_PX_LOGIC, 'nv': {}}
tong = {'anh': 0, 'byte_png': 0, 'byte_giai_ma': 0}
for nv in ('quai', 'boss'):
    d = json.load(open(os.path.join(SRC, nv + '.json'), encoding='utf-8'))
    ty = d['ty_le']['px_nguon_sang_px_logic']
    f = PX_ANH_MOI_PX_LOGIC * ty            # px ảnh runtime / px nguồn
    nut = d['rig']['nut']
    ds = list(nut.keys())
    os.makedirs(os.path.join(DST, nv), exist_ok=True)
    R = {}
    for n in ds:
        nd = nut[n]
        r = {'cha': nd['cha'], 'gan': [0.0, 0.0] if nd['cha'] is None else nd['diem_gan'], 'goc_nghi': nd.get('goc_nghi', 0.0)}
        if 'anh' in nd:
            im = Image.open(os.path.join(SRC, nd['anh'])).convert('RGBA')
            W0, H0 = im.size
            w, h = max(1, round(W0 * f)), max(1, round(H0 * f))
            sm = im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
            can = Image.new('RGBA', (w + 2 * PAD, h + 2 * PAD), (0, 0, 0, 0))
            can.paste(sm, (PAD, PAD))
            a = np.array(can)
            a[a[..., 3] == 0] = 0
            can = Image.fromarray(a, 'RGBA')
            ten = nv + '/' + os.path.basename(nd['anh'])
            p = os.path.join(DST, ten)
            can.save(p, optimize=True)
            # kích thước ảnh tính theo px nguồn (để drawImage co về đúng chỗ), pivot dịch theo viền
            kx, ky = W0 / w, H0 / h
            al = np.array(im)[..., 3] > 32
            ys, xs = np.nonzero(al)
            # bao lồi phần đặc (≤ 48 điểm) – để đo hộp bao CHẶT của mảnh khi xoay (kiểm hình khớp hitbox)
            pts = np.concatenate([np.stack([xs, ys], 1), np.stack([xs + 1, ys + 1], 1)]).astype(float)
            hull = pts[ConvexHull(pts).vertices]
            if len(hull) > 48: hull = hull[np.linspace(0, len(hull) - 1, 48).astype(int)]
            r.update({'anh': ten, 'co_anh': list(can.size),
                      'pivot': [nd['pivot'][0] + PAD * kx, nd['pivot'][1] + PAD * ky],
                      'co': [(w + 2 * PAD) * kx, (h + 2 * PAD) * ky],
                      'hop_dac': [float(xs.min()) + PAD * kx, float(ys.min()) + PAD * ky,
                                  float(xs.max() + 1) + PAD * kx, float(ys.max() + 1) + PAD * ky],
                      'vien': [[round(x + PAD * kx, 1), round(y + PAD * ky, 1)] for x, y in hull],
                      'hien': nd.get('hien', True)})
            tong['anh'] += 1
            tong['byte_png'] += os.path.getsize(p)
            tong['byte_giai_ma'] += can.size[0] * can.size[1] * 4
        R[n] = r
    clips = {}
    for cn, c in d['clip'].items():
        kh = []
        for k in c['khung']:
            tt = k['tu_the']
            row = []
            for n in ds:
                p = tt.get(n, {})
                dx, dy = p.get('dich', (0, 0))
                sx, sy = p.get('ty', (1, 1))
                hien = p.get('hien', R[n].get('hien', True))
                row.append([round(dx, 3), round(dy, 3), round(p.get('goc', 0.0), 4), round(sx, 4), round(sy, 4),
                            round(p.get('toi', 0.0), 4), round(p.get('mo', 1.0), 4), 1 if hien else 0])
            kh.append(row)
        clips[cn] = {'ten': c['ten'], 'ms': c['ms'], 'buoc_ms': c['buoc_ms'], 'lap': c['lap'],
                     'giu_khung_cuoi': c['giu_khung_cuoi'], 'pha': c['pha'], 'khung_cham': c['khung_cham'],
                     'cua_so_cham_ms': c['cua_so_cham_ms'], 'khung': kh}
    out['nv'][nv] = {'ten': d['ten'], 'ty_le': ty, 'cao_px_logic': d['ty_le']['cao_dang_nghi_px_logic'],
                     'nut_ds': ds, 'nut': R, 'thu_tu_ve': d['rig']['thu_tu_ve'], 'clip': clips,
                     'huong': 'quay trái; quay phải = lật ngang quanh điểm neo'}
out['tong'] = tong
p = os.path.join(DST, 'quai-boss-rig.json')
json.dump(out, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('ghi', p, os.path.getsize(p), 'byte;', tong)
