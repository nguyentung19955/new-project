#!/usr/bin/env python3
"""TÍNH BẢNG SỬA CẦM VŨ KHÍ (cam-vk-chuan, 16/10/2026) theo docs/review/ke-hoach-cai-thien/cam-vk-chuan/LUAT.md.

Không sửa ảnh nhân vật, không đổi dáng tay: chỉ đổi ĐIỂM NEO (điểm cầm, góc, tay thứ hai) và ĐIỂM CẦM TRÊN ẢNH VŨ KHÍ.
Ra hai tệp (cùng nội dung):
  docs/anh-goc/zed/gan-vk/cam-chuan.json   — để công cụ dựng sau này đọc lại
  game/js/cam_chuan_data.js                 — G.CAM_CHUAN_DATA cho js/zed_moi.js (bienThe); ?camchuan=0 → không dùng

Cách sửa từng khung (bộ ninja zed-moi, hàng Cu Tí đang dùng; đo bằng do_cam.py):
  tam    điểm cầm dời về tâm nắm tay đo trên ảnh thân (hai nắm dính một cụm: dời cả cặp cho điểm giữa về tâm cụm).
  truc   thương / búa: góc cán = đường qua hai tâm nắm đo được (hướng gần góc cũ nhất). Lệch > GOC_TOI_DA so với góc ảnh thì chỉ xoay
         tới GOC_TOI_DA (trục qua tay phải, gần hướng tay trái nhất mà không đổi dáng đòn) và ghi khung vào danh sách gen lại.
  thieu2 thương / búa: ảnh thân có nắm tay thứ hai nằm trên cán mà neo thiếu → thêm tay thứ hai (game vẽ nắm tay ôm cán ở đó),
         góc qua hai tay như trên.
  phi    phi tiêu: góc = hướng cẳng tay đo được (thân phi tiêu đi thẳng ra khỏi tay theo cổ tay, mũi ra ngoài).
  luoi / ho  kiếm: điểm cầm trên ảnh kiếm từng cấp dời dọc chuôi sao cho đốc chắn bắt đầu ngay mép nắm tay (hở DICH_HO đơn vị ô 96)
         → chuôi khuất dưới nắm tay, đốc → lưỡi đi tiếp cùng trục. Áp cho mọi hàng kiếm, cả 4 bộ trang phục (ảnh kiếm dùng chung).
Chạy: python3 docs/review/ke-hoach-cai-thien/cam-vk-chuan/sua.py   (in bảng, ghi 2 tệp)."""
import json, math, os, sys
import numpy as np

DAY = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DAY)
import do_cam as DC  # noqa: E402

ROOT = DC.ROOT
GOC_TOI_DA = 25.0
DICH_HO = 0.5
RA_JSON = os.path.join(ROOT, 'docs/anh-goc/zed/gan-vk/cam-chuan.json')
RA_JS = os.path.join(ROOT, 'game/js/cam_chuan_data.js')
# Neo từng khung: chỉ bộ ninja (zed-moi, bộ mặc định, có đủ hàng mới 16/10). Bộ Rừng / Biển / Lâu đài: cẳng tay trần nối liền nắm tay,
# găng da / giáp đỏ cùng màu da → máy đo tâm nắm tay KHÔNG tin được (thử 16/10: dời sai 1–2 điểm game) → không sửa neo, chỉ sửa điểm cầm
# trên ảnh kiếm (vk_cam, dùng chung mọi bộ).
BO = ['zed-moi']


def gan(a, b):
    return a + (((b - a) % 360) + 540) % 360 - 180


def goc_hai_tay(p, t, g0):
    g = math.degrees(math.atan2(t[1] - p[1], t[0] - p[0]))
    a, b = gan(g0, g), gan(g0, g + 180)
    return a if abs(a - g0) <= abs(b - g0) else b   # cùng đường thẳng, chiều gần góc cũ (mũi / đầu búa không đổi phía)


def r2(v):
    return round(float(v), 2)


def sua_cam_kiem(T, V):
    """Điểm cầm mới trên ảnh kiếm từng cấp: [[x, y] × 4] và bảng số đo."""
    da0 = T['dong_tac']
    keys = [k for _, _, vk, k in DC.hang_dung(T) if vk == 'kiem' and k and 'vk' in da0[k]]
    cam_cu = da0[keys[0]]['nam'].get('vk_cam', da0[keys[0]]['vk_cam'])
    tl = da0[keys[0]]['vk_tl']
    moi, bang = [], []
    for cap in range(4):
        hs = []
        for k in keys:
            for i in range(da0[k]['so']):
                r = DC.do_khung(T, V, k, i, cap)
                if r and r.get('ho') is not None and not r['n'][3]:
                    hs.append(r['ho'])
        ho = float(np.median(hs))
        x = cam_cu[cap][0] + (ho - DICH_HO) / (2 * tl)
        xg, xs, t = DC.doc_chan(V, 'kiem', cap, cam_cu[cap])
        moi.append([r2(x), cam_cu[cap][1]])
        bang.append((cap, cam_cu[cap][0], x, ho, xg))
    return cam_cu, moi, bang


def sua_khung(T, V, k, i, n0, ke=None):
    """Neo mới cho khung i hàng k (hoặc None nếu không đổi) + ghi chú + cờ gen lại."""
    da = T['dong_tac'][k]
    r = DC.do_khung(T, V, k, i, 0)
    if not r or not r['loi']:
        return None, [], False
    n = list(n0)
    while len(n) < 4:
        n.append(0)
    t2 = list(n[4]) if len(n) > 4 and n[4] else None
    a = DC.than96(T, da['hang'], i)
    ghi, gen = [], False
    if 'tam' in r['loi'] and r.get('P'):
        if r.get('cum') and t2:
            mx, my = (n[0] + t2[0]) / 2, (n[1] + t2[1]) / 2
            dx, dy = r['P'][0] - mx, r['P'][1] - my
            n[0] += dx; n[1] += dy; t2 = [t2[0] + dx, t2[1] + dy]
        else:
            dx, dy = r['P'][0] - n[0], r['P'][1] - n[1]
            n[0] += dx; n[1] += dy
        ghi.append('dời điểm cầm %.1f, %.1f' % (dx, dy))
    P = (n[0], n[1])
    T2 = None
    if 'truc' in r['loi'] and t2:
        T2 = (r['T'][0], r['T'][1]) if r.get('T') else (t2[0], t2[1])
    if 'thieu2' in r['loi']:
        T2 = r['tay2_anh'][:2]
    if T2 is not None and r.get('cum') and 'thieu2' not in r['loi']:
        # hai nắm dính một cụm (cách nhau ~1,5 điểm game): đường qua hai tâm không đủ tin để xoay cán → giữ góc ảnh, đặt tay thứ hai lên
        # trục (chiếu vuông góc); hướng hai nắm lệch cán nhiều thì ghi gen lại
        g0 = n[2]; c, s_ = math.cos(math.radians(g0)), math.sin(math.radians(g0))
        dx, dy = t2[0] - n[0], t2[1] - n[1]; d = dx * c + dy * s_
        gh = goc_hai_tay(P, (t2[0], t2[1]), g0)
        t2 = [r2(n[0] + c * d), r2(n[1] + s_ * d)]
        ghi.append('tay thứ hai chiếu lên trục cán (lệch %.1f)' % abs(-dx * s_ + dy * c))
        if abs(gh - g0) > GOC_TOI_DA:
            gen = True; ghi.append('hai nắm tay nằm theo hướng %.0f°, cán %.0f° (GEN LẠI)' % (gh, g0))
        T2 = None
    if T2 is not None and 'thieu2' in r['loi'] and r['tay2_anh'][3] <= 2:
        # nắm tay thứ hai đã nằm sát trục (≤ 1 điểm game): giữ góc, chỉ thêm tay thứ hai (chiếu lên trục) → game vẽ nắm tay ôm cán ở đó
        g0 = n[2]; c, s_ = math.cos(math.radians(g0)), math.sin(math.radians(g0)); d = r['tay2_anh'][2]
        t2 = [r2(n[0] + c * d), r2(n[1] + s_ * d)]
        ghi.append('thêm tay thứ hai (%.1f, %.1f) trên trục' % tuple(t2))
        T2 = None
    if T2 is not None:
        g0 = n[2]
        g = goc_hai_tay(P, T2, g0)
        L = (V['vk'][da['vk']][0][2] - da['nam'].get('vk_cam', da['vk_cam'])[0][0]) * 2 * da['nam'].get('vk_tl', da['vk_tl'])
        if DC.cat_mat(a, P, g, L) and not DC.cat_mat(a, P, g0, L):
            ghi.append('qua hai tay %.0f° thì cán cắt ngang MẶT → giữ góc %.0f°, không thêm tay (GEN LẠI)' % (g, g0))
            gen = True
            T2 = None
    if T2 is not None:
        g0 = n[2]
        g = goc_hai_tay(P, T2, g0)
        d = g - g0
        # góc mới nằm giữa góc khung trước / sau (đường vung liền) thì xoay hết, không coi là đổi dáng đòn
        giua = ke is not None and min(ke) - 10 <= gan(sum(ke) / 2, g) <= max(ke) + 10
        if giua:
            g = gan(sum(ke) / 2, g)
        if abs(d) > GOC_TOI_DA and not giua:
            g = g0 + math.copysign(GOC_TOI_DA, d); gen = True
            ghi.append('góc qua hai tay %.0f° lệch %.0f° → chỉ xoay %+.0f° (GEN LẠI)' % (goc_hai_tay(P, T2, g0), d, g - g0))
        else:
            ghi.append('góc %.0f° → %.0f° (qua hai tay)' % (g0, g))
        n[2] = round(g, 1)
        if not gen or 'truc' in r['loi']:
            t2 = [r2(T2[0]), r2(T2[1])]
            if 'thieu2' in r['loi']:
                ghi.append('thêm tay thứ hai (%.1f, %.1f)' % tuple(T2))
    if any(x in r['loi'] for x in ('phi', 'phi_nguoc')) and r.get('cang') is not None:
        g = round(r['cang'] / 5) * 5
        ghi.append('phi tiêu %.0f° → %.0f° (theo cẳng tay)' % (n[2], g))
        n[2] = g
    out = [r2(n[0]), r2(n[1]), n[2], n[3]]
    if t2:
        out.append([r2(t2[0]), r2(t2[1])])
    if out[:4] == [r2(n0[0]), r2(n0[1]), n0[2], n0[3]] and (len(n0) > 4) == bool(t2) and (not t2 or list(n0[4]) == out[4]):
        return None, ghi, gen
    return out, ghi, gen


def phi_tieu_ca_hang(T, V, k):
    """Phi tiêu: mọi khung theo hướng cẳng tay (không chỉ khung lỗi) để cả hàng xoay đều, không giật giữa khung đúng / khung sửa."""
    da = T['dong_tac'][k]; ra = {}
    for i, n0 in enumerate(da['nam']['neo']):
        if not n0:
            continue
        a = DC.than96(T, da['hang'], i)
        P = DC.tam_da(a, n0[0], n0[1])
        h = DC.huong_cang_tay(a, P) if P else None
        if h is None:
            continue
        g = round(h / 5) * 5
        if abs(gan(n0[2], g) - n0[2]) >= 5:
            ra[i] = ([n0[0], n0[1], g, n0[3]] + ([n0[4]] if len(n0) > 4 else []), ['phi tiêu %.0f° → %.0f° (theo cẳng tay)' % (n0[2], g)])
    return ra


def ke_goc(T, k, vk, neo0, i):
    """Góc khung trước và sau (hàng đòn: khung đầu / cuối nối với thế đứng cầm cùng vũ khí; hàng lặp: vòng)."""
    da = T['dong_tac'][k]
    m = DC.khoa_game(T); dk = m.get('dung_' + vk)
    dg = T['dong_tac'][dk]['nam']['neo'][0][2] if dk else None
    so = len(neo0)
    if da.get('lap'):
        a, b = neo0[(i - 1) % so], neo0[(i + 1) % so]
        a, b = (a[2] if a else None), (b[2] if b else None)
    else:
        a = neo0[i - 1][2] if i > 0 and neo0[i - 1] else dg
        b = neo0[i + 1][2] if i + 1 < so and neo0[i + 1] else dg
    if a is None or b is None:
        return None
    b = gan(a, b)
    return (a, b)


def main():
    V = DC.VZ.tai('zed-vk')
    T = DC.VZ.tai('zed-moi')
    cam_cu, cam_moi, bang = sua_cam_kiem(T, V)
    print('Kiếm — điểm cầm trên ảnh kiếm (cột ảnh vũ khí):')
    for cap, x0, x1, ho, xg in bang:
        print('  cấp %d: x %.2f → %.2f (hở đốc trung vị %.1f → %.1f, đốc ở cột %d)' % (cap + 1, x0, x1, ho, DICH_HO, xg))
    data = {'phien': 1, 'ghi_chu': 'cam-vk-chuan 16/10: neo sửa theo LUAT.md (sua.py); khoá = khoá dong_tac gốc; goc = neo gốc để nhận ra tấm đã dựng lại',
            'vk_cam': {'kiem': {'cu': cam_cu, 'moi': cam_moi}}, 'bo': {}}
    gen_lai, nhat_ky = [], []
    for bo in BO:
        T = DC.VZ.tai(bo)
        B = data['bo'].setdefault(bo, {})
        for nhan, ten, vk, k in DC.hang_dung(T):
            if not k or 'vk' not in T['dong_tac'][k] or k in B:
                continue
            da = T['dong_tac'][k]
            neo0 = da['nam']['neo']
            sua = {}
            if vk == 'phitieu':
                for i, (nn, gh) in phi_tieu_ca_hang(T, V, k).items():
                    sua[i] = nn; nhat_ky.append((bo, nhan, vk, k, i, gh))
            for i, n0 in enumerate(neo0):
                if not n0 or i in sua:
                    continue
                ke = ke_goc(T, k, vk, neo0, i)
                nn, gh, gen = sua_khung(T, V, k, i, n0, ke)
                if nn:
                    sua[i] = nn; nhat_ky.append((bo, nhan, vk, k, i, gh))
                if gen:
                    gen_lai.append((bo, nhan, vk, k, i, gh))
            if sua:
                g0 = next(n for n in neo0 if n)
                B[k] = {'so': len(neo0), 'goc': [r2(g0[0]), r2(g0[1]), g0[2]], 'neo': {str(i): v for i, v in sorted(sua.items())}}
    for x in nhat_ky:
        print('  [%s] %s / %s (%s) khung %d: %s' % (x[0], x[1], x[2], x[3], x[4] + 1, '; '.join(x[5])))
    print('Khung cần gen lại:', [(x[0], x[3], x[4] + 1) for x in gen_lai])
    data['gen_lai'] = [{'bo': x[0], 'hang': x[3], 'khung': x[4] + 1, 'ghi': x[5]} for x in gen_lai]
    s = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    with open(RA_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    with open(RA_JS, 'w', encoding='utf-8') as f:
        f.write('// CẦM VŨ KHÍ CHUẨN (16/10/2026, docs/review/ke-hoach-cai-thien/cam-vk-chuan/LUAT.md + bao-cao.md) — TỆP DỰNG TỰ ĐỘNG bằng\n'
                '// docs/review/ke-hoach-cai-thien/cam-vk-chuan/sua.py, đừng sửa tay. js/zed_moi.js (bienThe) dùng thay neo / điểm cầm vũ khí của\n'
                '// biến thể nắm chuôi: điểm cầm đúng tâm nắm tay, cán qua hai nắm tay, phi tiêu theo cẳng tay, chuôi kiếm khuất dưới nắm tay rồi\n'
                '// đốc → lưỡi. Chỉ HÌNH. Tắt: ?camchuan=0 (G.CAM_CHUAN, js/data.js).\n')
        f.write('window.G = window.G || {};\nG.CAM_CHUAN_DATA = ' + s + ';\n')
    print('Ghi', os.path.relpath(RA_JSON, ROOT), os.path.relpath(RA_JS, ROOT), '(%d byte)' % len(s))
    return data


if __name__ == '__main__':
    main()
