#!/usr/bin/env python3
"""ĐO "ĐỨNG MÉP CÓ AN TOÀN KHÔNG" (Node, không trình duyệt) — Cua Đá cũ (?cuade=1) / mới, và rà các trùm khác.
  python3 do_cho_dung.py cua   [số phút mỗi ô, mặc định 8]  → bảng mép / giữa + xem-cua-da.json (cho ve_xem.py)
  python3 do_cho_dung.py ra-soat [số phút]                 → Nấm Chúa, Hổ Lửa, Mộc / Ngư / Hồ Tinh: mép / giữa
Kiểu bot 'bot' (mo_phong.js): em bé về chỗ đứng, vùng đỏ đè lên thì bot cân bằng (tests/bot.js) tự né, hết nguy quay lại; máu không giảm
(hồi đầy mỗi khung) để đo trọn mỗi phút; trùm ghim ở một pha. Số: % máu tối đa mất mỗi phút, TB các ô của mép đó (lưới 8 × 6).
"""
import json, os, sys
from concurrent.futures import ProcessPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import mo_phong as M  # noqa: E402

CU = 'G.CUA_MOI = false'


def mot(args):
    k, pha, pre, lap = args
    return M.chay(k, 'bot', pha, 60, pre, 'luoi', lap)


def cua(lap):
    viec = [(k, pha, pre, lap) for pre in (CU, '') for k in (5, 6, 7) for pha in (0, 1)]
    with ProcessPoolExecutor(6) as ex:
        kq = list(ex.map(mot, viec))
    out = {'luoi': M.LUOI, 'lap': lap}
    for ten, pre in (('cu', CU), ('moi', '')):
        ds = [r for (k, pha, p, _), r in zip(viec, kq) if p == pre]
        tb = [round(sum(r[i]['phut'] for r in ds) / len(ds), 1) for i in range(48)]
        chieu = {}
        for r in ds:
            for i, a in enumerate(r):
                vung = 'trên' if i < 8 else 'dưới' if i >= 40 else 'trái' if i % 8 == 0 else 'phải' if i % 8 == 7 else 'giữa' if (2 <= i % 8 <= 5 and 2 <= i // 8 <= 3) else None
                if not vung: continue
                for n, q in a['ra'].items():
                    c = chieu.setdefault(vung, {}).setdefault(n, [0, 0, 0]); c[1] += q
                for n, q in a['trung'].items():
                    c = chieu.setdefault(vung, {}).setdefault(n, [0, 0, 0]); c[0] += q[1]; c[2] += q[0]
        out[ten] = {'tb': tb, 'tom': M.tom([{'phut': v} for v in tb]), 'chieu': chieu,
                    'tung': {f"{k}-p{pha}": M.tom(r) for (k, pha, p, _), r in zip(viec, kq) if p == pre}}
        print(f"== Cua Đá {ten} (TB ải 2-1, 2-2, 2-3 × pha 1, 2; {lap} phút mỗi ô)")
        for y in range(6):
            print('  ' + ' '.join(f"{tb[y*8+x]:6.1f}" for x in range(8)))
        print('  TB:', ' · '.join(f"{a} {b}" for a, b in out[ten]['tom'].items()))
        for kk, v in out[ten]['tung'].items():
            print(f"   ải {kk}:", ' · '.join(f"{a} {b}" for a, b in v.items()))
        for vung, d in chieu.items():
            print(f"   {vung}: " + ', '.join(f"{n} trúng {c[0]}/{c[1]} lần ra" for n, c in d.items()))
    json.dump(out, open(os.path.join(HERE, 'xem-cua-da.json'), 'w'), ensure_ascii=False)


def ra_soat(lap):
    TRUM = [(0, 'Nấm Chúa (1-1)', (0, 1)), (10, 'Hổ Lửa (3-1)', (0, 1)), (4, 'Mộc Tinh (1-5)', (0, 1, 2)), (9, 'Ngư Tinh (2-5)', (0, 1, 2)), (14, 'Hồ Tinh (3-5)', (0, 1, 2))]
    viec = [(k, pha, '', lap) for k, _, ph in TRUM for pha in ph]
    with ProcessPoolExecutor(6) as ex:
        kq = list(ex.map(mot, viec))
    for k, ten, ph in TRUM:
        for (k2, pha, _, _), r in zip(viec, kq):
            if k2 != k: continue
            t = M.tom(r)
            moc = min(t['trên'], t['dưới'], t['trái'], t['phải'])
            print(f"{ten} pha {pha + 1}: " + ' · '.join(f"{a} {b}" for a, b in t.items()) + (f"  ← mép thấp nhất = {moc / max(0.1, t['giữa']):.2f} × giữa" ))


if __name__ == '__main__':
    lap = int(sys.argv[2]) if len(sys.argv) > 2 else 8
    (cua if sys.argv[1] == 'cua' else ra_soat)(lap)
