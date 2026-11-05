#!/usr/bin/env python3
"""TURRET MERGE — cắt lại ảnh UI bị phóng (đo: tools/thap-kt-net.js) từ tấm ChatGPT raw ở 3× cỡ hiển thị lớn nhất.
Dùng lam() của tools/thap-cat-3x.py (so mẫu ảnh cũ trong raw → cắt đúng vùng cũ ở độ phân giải cao hơn, alpha học từ ảnh cũ, Lanczos
nhân-trước-alpha, kiểm IoU/màu so với ảnh cũ; lệch thì giữ cũ). Ảnh viền 9 mảnh (border-image) → nhân số slice trong CSS cùng hệ số.
Chạy: python3 tools/thap-net-cat.py [tên ...]   (OUT=thư-mục để thử, mặc định ghi thẳng thap/assets + sửa CSS)
Ghi: tools/thap-net-cat.json {tên: {cu, moi, k, raw}} — chạy lại không phóng thêm (đã đủ thì bỏ qua).
"""
import os, sys, json, re, importlib.util
from PIL import Image
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('c3', os.path.join(GOC, 'tools', 'thap-cat-3x.py'))
C3 = importlib.util.module_from_spec(spec); spec.loader.exec_module(C3)
A = os.path.join(GOC, 'thap/assets'); OUT = os.environ.get('OUT', A); C3.OUT = OUT
J = os.path.join(GOC, 'tools/thap-net-cat.json')
S = lambda *n: ['raw_s%s.png' % x for x in n]
HUD2 = lambda *n: ['raw_hud2_%02d.png' % x for x in n]
# tên: (K = tỉ lệ đo ở 390/430×DPR3 (lớn nhất), [raw], kiểu, có border-image không)
MUC = {
    'h2_mv_huy': (3.2, HUD2(6), 'dac'),
    'h2_chip': (1.65, HUD2(3), 'dac'), 'h2_chip_tat': (1.65, HUD2(3), 'dac'), 'h2_tag': (3.3, HUD2(3), 'dac'),
    'h2_lcd': (2.8, HUD2(5), 'dac'), 'h2_khay_doi': (1.25, HUD2(8), 'dac'), 'h2_rail': (1.15, HUD2(4), 'dac'),
    'h2_tam': (1.5, HUD2(14), 'dac'), 'h2_tam_mong': (1.52, HUD2(14), 'dac'), 'h2_tam_xanh': (1.5, HUD2(14), 'dac'), 'h2_tam_do': (1.5, HUD2(14), 'dac'),
    'nut_lon_thep': (1.92, S(10), 'dac'), 'nut_lon_vang': (1.92, S(10), 'dac'), 'nut_lon_xanh': (1.92, S(10), 'dac'), 'khung_chon': (1.12, S(10), 'sang'), 'khung_tt': (1.12, S(10), 'dac'),
    'khung_bang': (1.38, S(6), 'dac'), 'nen_hud_duoi': (1.38, ['raw_s7c.png'], 'dac'),
    'bang_cutin_nen': (1.25, S(5), 'dac'), 'bang_trum_nen': (1.25, S(5), 'dac'), 'bang_wave_nen': (1.25, S(5), 'dac'),
    'hud_trum_khung': (2.4, S(1, 2, '3a', '3b', 5, 6), 'dac'),
    'ngoc_trang': (1.4, S(2), 'dac'), 'ngoc_xanh': (1.4, S(2), 'dac'), 'ngoc_tim': (1.4, S(2), 'dac'), 'ngoc_vang': (1.4, S(2), 'dac'), 'ngoc_do': (1.4, S(2), 'dac'),
    'ic_solo': (1.4, S(1, 2, 6, 9, 10, 11) + ['raw_ui.png'], 'dac'), 'ic_coop': (1.4, S(1, 2, 6, 9, 10, 11) + ['raw_ui.png'], 'dac'), 'ic_pvp': (1.4, S(1, 2, 3, '3a', '3b', '3c', '3d', 4, 5, 6, '7a', 8, 9, 10, 11) + ['raw_ui.png', 'raw_tv_E07.png', 'raw_tv_E08.png', 'raw_tv_E09.png', 'raw_tv_E12.png'] + ['raw_p7_a%d.png' % i for i in range(1, 8)], 'dac'),
    'ui_thuong': (1.3, ['raw_tiles.png'], 'dac'), 'mui_tiep': (1.25, ['raw_p4_ui_1.png'], 'dac'), 'logo': (1.18, ['raw_s7a.png'], 'dac'),
    'ic_lui': (1.15, S(11), 'dac'), 'ht_tim': (1.1, HUD2(1, 3, 4, 5, 9, 10, 11, 15) + ['raw_support_ui.png'], 'dac'),
    'tai_day': (1.6, HUD2(1, 3, 4, 5, 8, 11, 14, 15) + S(1, 5, 10) + ['raw_p7_a%d.png' % i for i in range(1, 8)], 'dac'),
    'tier_ring_trang': (1.9, ['raw_tier_r1.png', 'raw_tier_r2.png', 'raw_core_ring.png', 'raw_bac.png'], 'dac'),
    'de_chung': (1.35, ['raw_base_chung_1.png', 'raw_base_chung_2.png', 'raw_round_bases.png'], 'dac'),
    'chon_vong': (1.75, ['raw_sel_card.png'], 'sang'), 'chon_de_xanh': (1.42, ['raw_sel_card.png'], 'dac'),
    'h2_burst': (2.75, HUD2(12), 'sang'),
    # canvas trận (vẽ 3 mảnh theo tỉ lệ ảnh — không phụ thuộc cỡ điểm ảnh)
    'sao_chu': (2.8, ['raw_p4_ui_1.png'], 'dac'),
    'nhan_kn': (3.9, S(10), 'dac'), 'hud_ten_ban': (1.7, S(1), 'dac'), 'ui_gia': (2.3, S(8, 9), 'dac'),
}
for t in ['xanh', 'tim', 'vang', 'do']: MUC['tier_ring_' + t] = MUC['tier_ring_trang']


def css_slice(ten, k):
    """nhân số slice của border-image dùng ảnh ten (url(...ten.png) N N N fill / …) với k, mọi tệp css + js."""
    n = 0
    pat = re.compile(r'(url\((?:\.\./)?assets/' + re.escape(ten) + r'\.png\)\s+)([\d.\s]+?)(\s*(?:fill)?\s*/)')
    for d in ('css', 'js'):
        for f in os.listdir(os.path.join(GOC, 'thap', d)):
            p = os.path.join(GOC, 'thap', d, f)
            if not os.path.isfile(p): continue
            s = open(p, encoding='utf-8').read()
            def rep(m):
                nums = ' '.join(('%g' % round(float(x) * k, 1)) for x in m.group(2).split())
                return m.group(1) + nums + m.group(3)
            s2, c = pat.subn(rep, s)
            if c: open(p, 'w', encoding='utf-8').write(s2); n += c
    return n


if __name__ == '__main__':
    ds = sys.argv[1:] or list(MUC)
    DA = json.load(open(J)) if os.path.exists(J) else {}
    bao = []
    for t in ds:
        K, c, kieu = MUC[t]
        if os.environ.get('KREL'): K = float(os.environ['KREL'])  # hệ số so với ảnh HIỆN TẠI (vd. đo lại ở 430 px sau lần cắt ở 390)
        cu = Image.open(os.path.join(A, t + '.png')).size
        if t in DA and list(cu) == DA[t]['moi'] and not os.environ.get('FORCE'): print('  %-18s đã cắt (%dx%d)' % ((t,) + cu)); continue
        try: r = C3.lam(t, K, c, kieu, bao)
        except Exception as e: bao.append((t, 'LỖI', repr(e))); r = None
        print('  %-18s %-22s %s' % bao[-1], flush=True)
        if r is None: continue
        k = r.size[0] / cu[0]
        DA[t] = {'cu': list(cu), 'moi': list(r.size), 'k': round(k, 4), 'ghi': bao[-1][2]}
        if OUT == A:
            n = css_slice(t, k)
            if n: print('     → border-image slice ×%.3f ở %d chỗ' % (k, n))
            DA[t]['slice'] = n
    if OUT == A: json.dump(DA, open(J, 'w'), indent=1, ensure_ascii=False)
