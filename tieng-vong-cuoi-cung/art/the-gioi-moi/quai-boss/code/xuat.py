"""Bước 3–4 – tính mọi clip (clip_quai.py, clip_boss.py) → ghi vào quai.json / boss.json (mốc + tư thế từng khung),
rồi vẽ sprite sheet RGBA 2× cho từng clip + JSON từng clip vào sprite/.

Quy tắc sheet (giống sheet chạy của Lam rig-v3):
- MỌI clip của một nhân vật dùng CÙNG một khung (canvas) và CÙNG điểm neo đất; không cắt sát từng khung.
- 2 px ảnh = 1 px logic. Không nền, không chữ, không đường đất. PNG RGBA alpha thẳng; điểm trong suốt RGB = 0.
- Khung xếp lưới trái→phải, trên→dưới, khe 2 px. Mỗi trang ≤ 4096×4096 px (giới hạn an toàn cho iPhone/Safari);
  clip dài hơn thì chia nhiều trang (ten-clip-2x.png, ten-clip-2x-p2.png …) – JSON ghi trang của từng khung.
- Vẽ siêu lấy mẫu (≥ 0,8 px nguồn / px vẽ) rồi lấy trung bình khối trong không gian nhân-trước-alpha."""
import os
import sys
import math
import numpy as np
from PIL import Image
from chung import RIG_JSON, SPRITE, SHEET_X, load_json, save_json
import rig as R
from dong_tac import NgCanh, tinh_clip, khung_cham, lam_tron
import clip_quai
import clip_boss

MOD = {'quai': clip_quai, 'boss': clip_boss}
LE_LOGIC = 3.0                     # lề quanh hộp bao mọi khung (px logic)
KHE = 2
MAX_TRANG = 4096
THU_TU_CLIP = {'quai': ['dung', 'di', 'dam', 'trung', 'chet'], 'boss': ['dung', 'dap', 'quet', 'trung', 'chet']}
TEN_CLIP = {'dung': 'đứng', 'di': 'đi tuần', 'dam': 'đấm', 'trung': 'trúng đòn', 'chet': 'chết',
            'dap': 'đập xuống', 'quet': 'quét ngang'}


def tinh_tat_ca(nv):
    C = NgCanh(nv)
    clips = MOD[nv].tao(C)
    res = {}
    for ten in THU_TU_CLIP[nv]:
        cl = clips[ten]
        ts, frames, kenh = tinh_clip(C, cl)
        res[ten] = (cl, ts, frames, kenh)
    return C, res


def canvas(C, res):
    xs0, ys0, xs1, ys1 = [], [], [], []
    for ten, (cl, ts, frames, _) in res.items():
        for p in frames:
            b = R.bbox_world(C.rig, p)
            xs0.append(b[0]); ys0.append(b[1]); xs1.append(b[2]); ys1.append(b[3])
    s = C.k * SHEET_X                              # px nguồn → px sheet
    gx, gy = C.root
    le = LE_LOGIC * SHEET_X
    ax = int(math.ceil((gx - min(xs0)) * s + le))
    ay = int(math.ceil((gy - min(ys0)) * s + le))
    w = ax + int(math.ceil((max(xs1) - gx) * s + le))
    h = ay + int(math.ceil(max(0.0, (max(ys1) - gy)) * s + le))
    box = (gx - ax / s, gy - ay / s, gx + (w - ax) / s, gy + (h - ay) / s)
    return {'w': w, 'h': h, 'ax': ax, 'ay': ay, 'box': box, 's': s}


def xep_trang(n, w, h):
    cot = max(1, (MAX_TRANG + KHE) // (w + KHE))
    hang_max = max(1, (MAX_TRANG + KHE) // (h + KHE))
    cot = min(cot, n)
    moi_trang = cot * hang_max
    trang = []
    for p0 in range(0, n, moi_trang):
        m = min(moi_trang, n - p0)
        hang = (m + cot - 1) // cot
        trang.append({'khung': list(range(p0, p0 + m)), 'cot': min(cot, m), 'hang': hang})
    return trang


def main(nhanh=False):
    os.makedirs(SPRITE, exist_ok=True)
    for nv in ('quai', 'boss'):
        C, res = tinh_tat_ca(nv)
        K = canvas(C, res)
        ss = max(1, int(math.ceil(0.8 / K['s'])))
        doc = load_json(RIG_JSON[nv])
        doc['clip'] = {}
        doc['sprite'] = {'khung_px': [K['w'], K['h']], 'neo_px': [K['ax'], K['ay']],
                         'hop_the_gioi_px_nguon': [round(v, 3) for v in K['box']],
                         'ghi_chu': 'mọi clip cùng canvas & điểm neo; xem sprite/<nv>-<clip>-2x.json'}
        for ten, (cl, ts, frames, kenh) in res.items():
            hit = khung_cham(cl, ts)
            doc['clip'][ten] = {
                'ten': TEN_CLIP[ten], 'ms': round(cl['ms'], 3), 'buoc_ms': round(cl['buoc_ms'], 4),
                'so_khung': len(ts), 'lap': cl['lap'], 'giu_khung_cuoi': bool(cl.get('giu_cuoi')),
                'pha': [[p[0], round(p[1], 2), round(p[2], 2)] for p in cl.get('pha', [])],
                'khung_cham': hit, 'cua_so_cham_ms': [round(v, 2) for v in cl['cham']] if cl.get('cham') else None,
                'ghi_chu': cl.get('ghi_chu', ''),
                'kenh_moc': {f'{n}.{p}': k.mo_ta() for (n, p), k in kenh.items()},
                'khung': [{'t_ms': round(t, 3), 'tu_the': lam_tron(p)} for t, p in zip(ts, frames)]}
            for key in ('toc_do_dat_px_logic_moi_s', 'chiu_luc'):
                if key in cl:
                    doc['clip'][ten][key] = cl[key]
        save_json(doc, RIG_JSON[nv])
        print(nv, 'canvas', K['w'], '×', K['h'], 'neo', K['ax'], K['ay'], 'ss', ss)
        if nhanh:
            continue
        for ten, (cl, ts, frames, kenh) in res.items():
            imgs = [R.render(C.rig, p, K['box'], K['s'], ss=ss) for p in frames]
            for im in imgs:
                assert im.size == (K['w'], K['h']), im.size
            trang = xep_trang(len(imgs), K['w'], K['h'])
            fr_json, trang_json = [], []
            hit = khung_cham(cl, ts)
            for pi, tr in enumerate(trang):
                fn = f'{nv}-{ten}-2x' + ('' if pi == 0 else f'-p{pi + 1}') + '.png'
                W = tr['cot'] * (K['w'] + KHE) - KHE
                H = tr['hang'] * (K['h'] + KHE) - KHE
                sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
                for j, i in enumerate(tr['khung']):
                    x = (j % tr['cot']) * (K['w'] + KHE)
                    y = (j // tr['cot']) * (K['h'] + KHE)
                    sheet.paste(imgs[i], (x, y))
                    t = ts[i]
                    dur = (ts[i + 1] - t) if i + 1 < len(ts) else (cl['ms'] - t if cl['ms'] > t else cl['buoc_ms'])
                    fr_json.append({'i': i, 'trang': pi, 'x': x, 'y': y, 'w': K['w'], 'h': K['h'],
                                    'ms': round(dur, 3), 't_ms': round(t, 3), 'cham': i in hit,
                                    'pha': next((p[0] for p in cl.get('pha', []) if p[1] - 1e-6 <= t < p[2] - 1e-6),
                                                cl.get('pha', [['', 0, 0]])[-1][0])})
                a = np.array(sheet)
                a[a[..., 3] == 0] = 0
                Image.fromarray(a, 'RGBA').save(os.path.join(SPRITE, fn), optimize=True)
                trang_json.append({'anh': fn, 'co': [W, H], 'cot': tr['cot'], 'hang': tr['hang']})
            meta = {
                'ten': f'{doc["ten"]} – {TEN_CLIP[ten]}, sprite sheet 2x',
                'nhan_vat': nv, 'clip': ten,
                'trang': trang_json,
                'dinh_dang': 'PNG RGBA, alpha thẳng (không nhân trước); điểm trong suốt RGB = 0',
                'luoi': {'khe_px': KHE, 'thu_tu': 'trái→phải, trên→dưới', 'toi_da_moi_trang_px': MAX_TRANG},
                'co_khung': [K['w'], K['h']],
                'diem_neo': {'x': K['ax'], 'y': K['ay'],
                             'y_nghia': 'toạ độ trong MỖI khung (tính từ góc trái-trên ô): x = giữa hai chân / trục '
                                        'chuông (cố định), y = mặt đất (ranh giới điểm ảnh: hàng ay−1 là hàng thấp '
                                        'nhất có thể chạm đất). Mọi khung, mọi clip của nhân vật cùng một điểm neo; '
                                        'không crop riêng khung.'},
                'ty_le': {'px_sheet_moi_px_logic': SHEET_X, 've_trong_game': 'vẽ ở ½ cỡ sheet',
                          'cao_dang_nghi_px_logic': doc['ty_le']['cao_dang_nghi_px_logic'],
                          'cao_dang_nghi_px_sheet': round(doc['ty_le']['cao_dang_nghi_px_logic'] * SHEET_X, 1),
                          'he_so_px_nguon_sang_px_sheet': round(K['s'], 6),
                          'ghi_chu': 'một scale cố định cho mọi khung/clip'},
                'huong': 'quay mặt sang TRÁI (như ảnh nguồn). Quay phải: lật ngang quanh điểm neo x '
                         '(ctx.scale(-1,1) tại chân); hộp đòn cũng lật.',
                'lap': cl['lap'], 'giu_khung_cuoi': bool(cl.get('giu_cuoi')),
                'tong_ms': round(cl['ms'], 3), 'buoc_ms': round(cl['buoc_ms'], 4),
                'tick_60hz_moi_khung': round(cl['buoc_ms'] / (1000 / 60), 3),
                'pha': [[p[0], round(p[1], 2), round(p[2], 2)] for p in cl.get('pha', [])],
                'khung_cham': hit,
                'cua_so_cham_ms': [round(v, 2) for v in cl['cham']] if cl.get('cham') else None,
                'hop_don_gameplay': cl.get('hop_don'),
                'hitbox_than_gameplay': MOD[nv].HITBOX_THAN,
                'hitbox_ghi_chu': 'hitbox/va chạm lấy từ gameplay (game/demo.html), KHÔNG lấy theo hình. Đơn vị px '
                                  'logic so với điểm neo, nhìn trái.',
                'ghi_chu': cl.get('ghi_chu', ''),
                'frames': fr_json,
            }
            for key in ('toc_do_dat_px_logic_moi_s', 'chiu_luc'):
                if key in cl:
                    meta[key] = cl[key]
            save_json(meta, os.path.join(SPRITE, f'{nv}-{ten}-2x.json'))
            print(f'  {ten}: {len(imgs)} khung, {len(trang)} trang', [t['co'] for t in trang_json])


if __name__ == '__main__':
    main(nhanh='--nhanh' in sys.argv)
