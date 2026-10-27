"""Bước 3 – tính mọi clip (clip_nam.py, clip_doi.py, clip_menam.py) → ghi vào <nv>.json: mốc từng kênh + tư thế
tính sẵn từng khung + khung bao (để xem thử). KHÔNG vẽ sprite sheet: chủ dự án đã chốt vẽ trực tiếp từ mảnh + JSON
(gói runtime: game/runtime/xuat-quai-moi.py)."""
import sys
import math
from chung import rig_json, load_json, save_json
import rig as R
from dong_tac import NgCanh, tinh_clip, khung_cham, lam_tron
import clip_nam
import clip_doi
import clip_menam

MOD = {'nam': clip_nam, 'doi': clip_doi, 'menam': clip_menam}
THU_TU_CLIP = {'nam': ['dung', 'di', 'dam', 'trung', 'chet'],
               'doi': ['bay', 'lao', 'trung', 'chet-roi', 'chet-vo'],
               'menam': ['dung', 'quet', 'dap', 'phun', 'trung', 'chet']}
TEN_CLIP = {'dung': 'đứng', 'di': 'đi tuần', 'dam': 'đấm', 'trung': 'trúng đòn', 'chet': 'chết', 'bay': 'bay',
            'lao': 'lao xuống', 'chet-roi': 'chết – rơi', 'chet-vo': 'chết – chạm đất, chuông vỡ',
            'quet': 'vuốt quét ngang', 'dap': 'đập vuốt xuống', 'phun': 'phun bào tử'}


def tinh_tat_ca(nv):
    C = NgCanh(nv)
    clips = MOD[nv].tao(C)
    res = {}
    for ten in THU_TU_CLIP[nv]:
        cl = clips[ten]
        ts, frames, kenh = tinh_clip(C, cl)
        res[ten] = (cl, ts, frames, kenh)
    return C, res


def khung_bao(C, res, le_logic=3.0):
    xs0, ys0, xs1, ys1 = [], [], [], []
    for ten, (cl, ts, frames, _) in res.items():
        for p in frames:
            b = R.bbox_world(C.rig, p)
            xs0.append(b[0]); ys0.append(b[1]); xs1.append(b[2]); ys1.append(b[3])
    le = le_logic / C.k
    return [min(xs0) - le, min(ys0) - le, max(xs1) + le, max(max(ys1), C.ground) + le]


def main(ds=('nam', 'doi', 'menam')):
    for nv in ds:
        C, res = tinh_tat_ca(nv)
        doc = load_json(rig_json(nv))
        doc['clip'] = {}
        box = khung_bao(C, res)
        doc['khung_bao_moi_clip_px_nguon'] = [round(v, 2) for v in box]
        doc['hitbox_than_gameplay'] = MOD[nv].HITBOX_THAN
        for ten, (cl, ts, frames, kenh) in res.items():
            hit = khung_cham(cl, ts)
            c = doc['clip'][ten] = {
                'ten': TEN_CLIP[ten], 'ms': round(cl['ms'], 3), 'buoc_ms': round(cl['buoc_ms'], 4),
                'so_khung': len(ts), 'lap': cl['lap'], 'giu_khung_cuoi': bool(cl.get('giu_cuoi')),
                'pha': [[p[0], round(p[1], 2), round(p[2], 2)] for p in cl.get('pha', [])],
                'khung_cham': hit, 'cua_so_cham_ms': [round(v, 2) for v in cl['cham']] if cl.get('cham') else None,
                'hop_don': cl.get('hop_don'),
                'ghi_chu': cl.get('ghi_chu', ''),
                'kenh_moc': {f'{n}.{p}': k.mo_ta() for (n, p), k in kenh.items()},
                'khung': [{'t_ms': round(t, 3), 'tu_the': lam_tron(p)} for t, p in zip(ts, frames)]}
            for key in ('toc_do_dat_px_logic_moi_s', 'chiu_luc', 'su_kien'):
                if key in cl:
                    c[key] = cl[key]
        save_json(doc, rig_json(nv))
        print(nv, {t: len(v[1]) for t, v in res.items()}, 'khung bao', [round(v) for v in box])


if __name__ == '__main__':
    main(sys.argv[1:] or ('nam', 'doi', 'menam'))
