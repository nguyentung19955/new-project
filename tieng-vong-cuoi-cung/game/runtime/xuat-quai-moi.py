#!/usr/bin/env python3
"""Xuất GÓI RUNTIME cho 3 nhân vật mới (vẽ trực tiếp từ mảnh + JSON, KHÔNG sprite sheet) – cùng định dạng với
quai-boss-rig.json (xuat-quai-boss.py), để quai-boss-runtime.js nhận thêm loại bằng QBR.napThem().

Nguồn: art/re-muc/quai-boss/ (nam.json, menam.json, manh/) + art/nhan-vat/doi-chuong/ (doi.json, manh/).
Đích: game/runtime/quai-boss/
  - nam/*.png, doi/*.png, menam/*.png : mảnh thu về 2 px ảnh / 1 px logic, viền trong 2 px
  - quai-moi-rig.json                  : rig + tư thế tính sẵn từng khung [dx,dy,goc,sx,sy,toi,mo,hien] theo nut_ds
Mảnh dùng chung ảnh (bào tử ×6/×8) chỉ ghi + nạp 1 lần. Không có kênh nháy trắng: game tự nháy (ảnh trắng cache sẵn).
Chạy: python3 game/runtime/xuat-quai-moi.py   (cần pillow, numpy, scipy)"""
import json, os
import numpy as np
from PIL import Image
from scipy.spatial import ConvexHull

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.normpath(os.path.join(HERE, '..', '..', 'art'))
NGUON = {'nam': os.path.join(ART, 're-muc', 'quai-boss'), 'menam': os.path.join(ART, 're-muc', 'quai-boss'),
         'doi': os.path.join(ART, 'nhan-vat', 'doi-chuong')}
DST = os.path.join(HERE, 'quai-boss')
PX = 2.0
PAD = 2

out = {'phien_ban': 1,
       'ghi_chu': 'Sinh bởi game/runtime/xuat-quai-moi.py từ art/re-muc/quai-boss/ + art/nhan-vat/doi-chuong/. Cùng định '
                  'dạng quai-boss-rig.json. Toạ độ rig = px ảnh nguồn (đã lật, nhân vật quay trái); ảnh mảnh 2 px/px logic. '
                  'Tư thế khung: [dx,dy,goc,sx,sy,toi,mo,hien] theo nut_ds. Không có kênh nháy trắng.',
       'px_anh_moi_px_logic': PX, 'nv': {}}
tong = {'anh': 0, 'byte_png': 0, 'byte_giai_ma': 0}
for nv in ('nam', 'doi', 'menam'):
    SRC = NGUON[nv]
    d = json.load(open(os.path.join(SRC, nv + '.json'), encoding='utf-8'))
    ty = d['ty_le']['px_nguon_sang_px_logic']
    f = PX * ty
    nut = d['rig']['nut']
    ds = list(nut.keys())
    os.makedirs(os.path.join(DST, nv), exist_ok=True)
    R, da_ghi = {}, {}
    for n in ds:
        nd = nut[n]
        r = {'cha': nd['cha'], 'gan': [0.0, 0.0] if nd['cha'] is None else nd['diem_gan'], 'goc_nghi': nd.get('goc_nghi', 0.0)}
        if 'anh' in nd:
            ten = nv + '/' + os.path.basename(nd['anh'])
            im = Image.open(os.path.join(SRC, nd['anh'])).convert('RGBA')
            W0, H0 = im.size
            w, h = max(1, round(W0 * f)), max(1, round(H0 * f))
            if ten not in da_ghi:
                sm = im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
                can = Image.new('RGBA', (w + 2 * PAD, h + 2 * PAD), (0, 0, 0, 0))
                can.paste(sm, (PAD, PAD))
                a = np.array(can); a[a[..., 3] == 0] = 0
                can = Image.fromarray(a, 'RGBA')
                p = os.path.join(DST, ten)
                can.save(p, optimize=True)
                al = np.array(im)[..., 3] > 32
                ys, xs = np.nonzero(al)
                pts = np.concatenate([np.stack([xs, ys], 1), np.stack([xs + 1, ys + 1], 1)]).astype(float)
                hull = pts[ConvexHull(pts).vertices]
                if len(hull) > 48: hull = hull[np.linspace(0, len(hull) - 1, 48).astype(int)]
                da_ghi[ten] = (can.size, hull, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
                tong['anh'] += 1; tong['byte_png'] += os.path.getsize(p); tong['byte_giai_ma'] += can.size[0] * can.size[1] * 4
            size, hull, hb = da_ghi[ten]
            kx, ky = W0 / w, H0 / h
            r.update({'anh': ten, 'co_anh': list(size),
                      'pivot': [nd['pivot'][0] + PAD * kx, nd['pivot'][1] + PAD * ky],
                      'co': [(w + 2 * PAD) * kx, (h + 2 * PAD) * ky],
                      'hop_dac': [float(hb[0]) + PAD * kx, float(hb[1]) + PAD * ky, float(hb[2]) + PAD * kx, float(hb[3]) + PAD * ky],
                      'vien': [[round(x + PAD * kx, 1), round(y + PAD * ky, 1)] for x, y in hull],
                      'hien': nd.get('hien', True)})
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
                     'cua_so_cham_ms': c['cua_so_cham_ms'], 'hop_don': c.get('hop_don'), 'su_kien': c.get('su_kien'),
                     'khung': kh}
    out['nv'][nv] = {'ten': d['ten'], 'ty_le': ty, 'cao_px_logic': d['ty_le']['cao_dang_nghi_px_logic'],
                     'hitbox_than_de_xuat': d.get('hitbox_than_gameplay'),
                     'nut_ds': ds, 'nut': R, 'thu_tu_ve': d['rig']['thu_tu_ve'], 'clip': clips,
                     'huong': 'quay trái; quay phải = lật ngang quanh điểm neo'}
out['tong'] = tong
p = os.path.join(DST, 'quai-moi-rig.json')
json.dump(out, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('ghi', p, os.path.getsize(p), 'byte;', tong)
