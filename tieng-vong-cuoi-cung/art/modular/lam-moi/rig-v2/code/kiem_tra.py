"""Kiểm tra tự động rig-v2. In OK/LỖI từng mục, mã thoát 1 nếu có lỗi.
Cần chạy sau chu_ky.py, phan_tich.py, duyet.py, chay.py (hoặc chay_het.py)."""
import os
import sys
import json
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from chung import RIG, NGUON, TU_THE, CHAY, SO_LIEU, load_json
from rig import render

loi = []


def ok(cond, msg):
    print(('  OK  ' if cond else '  LỖI ') + msg)
    if not cond:
        loi.append(msg)


def main():
    loi.clear()
    for f in ('2-nhin-ngang.png', '3-bang-manh.png', '1-mau-chuan-nhin-cheo.png', 'rig-v1/lam-moi.json',
              'rig-v1/rig_v1.py'):
        ok(os.path.isfile(os.path.join(NGUON, f)), f'nguồn chép kèm: nguon/{f}')
    d = load_json()
    for k in ('quy_uoc', 'manh', 'rig', 'tu_the', 'chu_ky', 'tu_the_nghi', 'lam_toi_thu'):
        ok(k in d, f'JSON có khoá {k}')
    rig = d['rig']
    nut = rig['nut']
    for n in nut:
        seen, c = set(), n
        while c is not None and c not in seen:
            seen.add(c)
            c = nut[c]['cha']
        ok(c is None, f'nút {n}: lần ngược tới gốc không vòng')
    co_anh = sorted(n for n, v in nut.items() if 'anh' in v)
    ok(sorted(rig['thu_tu_ve']) == co_anh, f'thứ tự vẽ chứa đúng mọi nút có ảnh ({len(co_anh)} mảnh)')
    ok(rig['thu_tu_ve'].index('mu-gay') < rig['thu_tu_ve'].index('chop-mu') < rig['thu_tu_ve'].index('mu'),
       'lớp gáy mũ vẽ sau chóp, chóp vẽ sau mũ')
    for n in co_anh:
        p = os.path.join(RIG, nut[n]['anh'])
        if not os.path.isfile(p):
            ok(False, f'{p} tồn tại')
            continue
        im = Image.open(p)
        a = np.array(im).astype(int)
        semi = (a[..., 3] > 10) & (a[..., 3] < 245)
        bright = semi & (a[..., :3].min(-1) > 200)
        if n.startswith('mat'):
            bright = semi & (a[..., 2] > 200)
        ok(im.mode == 'RGBA' and list(im.size) == d['manh'][n]['co'], f'{n}.png RGBA, cỡ khớp JSON {im.size}')
        ok(bright.sum() <= 3, f'{n}: điểm viền trắng bán trong suốt = {int(bright.sum())} (≤ 3)')

    # hai ủng cùng cỡ + cùng định nghĩa neo
    al = {n: np.array(Image.open(os.path.join(RIG, nut[n]['anh'])))[..., 3] > 128 for n in ('ung-gan', 'ung-xa')}
    s = {n: np.sqrt(a.sum()) for n, a in al.items()}
    r = abs(s['ung-gan'] / s['ung-xa'] - 1)
    ok(r < 0.01, f'hai ủng cùng cỡ: lệch căn diện tích {r * 100:.2f} % (< 1 %)')
    bb = {n: nut[n]['bong_rong_cao_px'] for n in al}
    ok(abs(bb['ung-gan'][0] - bb['ung-xa'][0]) <= 3 and abs(bb['ung-gan'][1] - bb['ung-xa'][1]) <= 3,
       f'hai ủng rộng×cao {bb["ung-gan"]} vs {bb["ung-xa"]} (lệch ≤ 3 px ảnh ngang)')
    for n, a in al.items():
        ys, xs = np.nonzero(a)
        px, py = nut[n]['pivot']
        ok(abs(px - (xs.min() + xs.max() + 1) / 2) < 0.6 and abs(py - (ys.max() + 1)) < 0.6,
           f'{n}: neo = giữa đế, mép dưới bóng')
        ok(nut[n]['goc_nghi'] == 0, f'{n}: góc nghỉ 0 = đế phẳng')

    sl = json.load(open(SO_LIEU, encoding='utf-8'))
    ck = d['chu_ky']
    # chịu lực
    for n, v in sl['ung_chiu_luc'].items():
        ok(v['lech_vx_lon_nhat_phan_tram'] < 1.0,
           f'{n} chịu lực: vận tốc ngang điểm chạm lệch tốc độ đất tối đa {v["lech_vx_lon_nhat_phan_tram"]} % (< 1 %)')
        ok(abs(v['truot_tich_luy_px_logic']) < 0.1, f'{n}: trượt tích luỹ cả pha chịu lực {v["truot_tich_luy_px_logic"]} px logic')
        ok(v['khe_ho_lon_nhat_khi_chiu_luc_px_logic'] < 0.05, f'{n}: khi chịu lực điểm thấp nhất đúng mặt đất')
        ok(v['vy_diem_cham_lon_nhat'] < 5, f'{n}: vận tốc dọc điểm chạm ≤ {v["vy_diem_cham_lon_nhat"]} px logic/s (< 5)')
    for k_, v in sl['vao_roi_dat'].items():
        ok(v['nhay_van_toc'] < 1.0, f'{k_}: nhảy vận tốc pivot {v["nhay_van_toc"]} px logic/s (< 1, không giật)')
    vn = sl['vong_noi']
    ok(vn['nhay_vi_tri_lon_nhat_px_anh_ngang'] < 0.01 and vn['nhay_goc_lon_nhat_do'] < 0.01,
       'vòng nối cuối→đầu: vị trí/góc liên tục')
    ok(vn['nhay_van_toc_lon_nhat_px_logic_s'] < 1.0, f'vòng nối: nhảy vận tốc {vn["nhay_van_toc_lon_nhat_px_logic_s"]} px logic/s')
    ok(vn['gia_toc_roi_rac_tai_khung_0_px_logic'] <= vn['gia_toc_roi_rac_lon_nhat_ca_chu_ky_px_logic'] * 0.75,
       'vòng nối: gia tốc rời rạc ở khung 0 không nổi bật so với cả chu kỳ')
    for k_, v in sl['vuot_bien_noi_suy_px_hoac_do'].items():
        ok(v == 0, f'kênh {k_}: không vượt biên')
    # bay
    kb = sl['khe_ho_khi_bay_px_logic']['theo_khung_[gan,xa]']
    f_bay = str(int(round(d['pha_tu_the']['bay'] * ck['so_khung'])))
    gan, xa = kb[f_bay]
    ok(min(gan, xa) >= 1.5, f'tư thế bay: cả hai ủng rời đất ở 112 px (khe {gan} / {xa} px logic ≥ 1,5)')
    ok(0.5 <= abs(gan - xa) <= 5, f'tư thế bay: chênh cao nhẹ {abs(gan - xa):.2f} px logic')
    ub = d['tu_the']['bay']['_ung']
    ok(ub['ung-gan']['x'] < -50 and ub['ung-xa']['x'] > 50, 'tư thế bay: ủng gần thu sau, ủng xa đưa trước')
    # biên độ giữ v1
    b = sl['bien_do']
    ok(2.5 <= b['than_nhun_thap_nhat_px_logic'] <= 3.5, f'nhún thấp nhất {b["than_nhun_thap_nhat_px_logic"]} px logic (~3)')
    ok(b['tay_dao_vung_do'] == [-14.0, 14.0], f'tay dao vung {b["tay_dao_vung_do"]}°')
    ok(-10 <= b['chop_mu_do'][0] and b['chop_mu_do'][1] <= 10, f'chóp lắc {b["chop_mu_do"]}° trong ±10°')
    # tay sau
    ts = sl['tay_sau_thay_phan_tram_112px']
    ok(ts['nho_nhat'] >= 50, f'tay sau còn thấy ≥ 50 % ở mọi khung (nhỏ nhất {ts["nho_nhat"]} %)')
    ok(sl['dao_chong_ung_px_anh_ngang']['lon_nhat'] == 0, 'tay dao không chồng lên ủng ở mọi khung')
    # nửa sau = chỉ đổi pha
    n = ck['so_khung']
    h = n // 2
    lech = ck['lech_sau_ung']
    dmax = 0.0
    for i in range(h):
        a, c = ck['khung'][i]['_ung'], ck['khung'][i + h]['_ung']
        for t1, t2 in (('ung-gan', 'ung-xa'), ('ung-xa', 'ung-gan')):
            dmax = max(dmax, abs((a[t1]['x'] - lech[t1]) - (c[t2]['x'] - lech[t2])), abs(a[t1]['nhac'] - c[t2]['nhac']),
                       abs(a[t1]['goc'] - c[t2]['goc']))
        dmax = max(dmax, abs(ck['khung'][i]['vai-truoc']['goc'] + ck['khung'][i + h]['vai-truoc']['goc']))
    ok(dmax < 0.6, f'nửa sau chu kỳ = đổi pha (ủng gần ↔ quỹ đạo ủng xa, tay dao đổi dấu); lệch lớn nhất {dmax:.3f} '
                   '(chênh nhỏ do hai ảnh ủng hơi khác hình)')
    ok(all(set(p.keys()) - {'_pha', '_thoi_gian_s', '_ung'} <= set(nut) and
           all('anh' not in v and 'hien' not in v for k_, v in p.items() if not k_.startswith('_'))
           for p in ck['khung']), 'không khung nào tráo ảnh/ẩn-hiện mảnh (tay dao luôn là tay dao, gần/xa giữ nguyên)')
    # chóp: khe hở mũ ↔ chóp
    base = None
    for g in (0, -6, 7):
        im = render(rig, {'chop-mu': {'goc': g}}, (150, 20, 800, 600), 1.0, only=['mu', 'mu-gay', 'chop-mu'])
        a = np.array(im)[..., 3] > 128
        holes = nd.binary_fill_holes(a) & ~a
        c = nd.binary_closing(a, structure=np.ones((21, 21))) & ~a
        c[:30] = c[-30:] = 0
        c[:, :30] = c[:, -30:] = 0
        if base is None:
            base = int(c.sum())
        ok(holes.sum() <= 10, f'chóp {g:+d}°: lỗ thủng giữa mũ và chóp {int(holes.sum())} px ảnh ngang (≤ 10 ≈ 0,1 px² logic)')
        ok(int(c.sum()) - base < 120, f'chóp {g:+d}°: khe hẹp mới mở giữa chóp và gáy {int(c.sum()) - base} px (< 120)')
    nh = sl.get('nghi_so_voi_anh_ngang', {})
    ok(nh.get('iou_v2', 0) > nh.get('iou_v1', 1), f'dáng nghỉ khớp ảnh ngang hơn v1: IoU {nh.get("iou_v1")} → {nh.get("iou_v2")}')
    if nh:
        ok(nh['vung_mu_px_lech_v2'][0] < 0.1 * nh['vung_mu_px_lech_v1'][0], 'vùng mũ: px lệch còn < 10 % của v1')
    for n_, v in sl.get('tu_the_112', {}).items():
        ok(abs(v['cao_px'] - 112) <= 6, f'{n_}: cao ở 112 px = {v["cao_px"]}')
    # file xuất
    for f in ('chay-112px.gif', 'chay-112px-x4.gif', 'chay-lon.gif', 'chay-toi10-112px-x4.gif', 'chay-contact-sheet.png',
              'bieu-do-van-toc-ung.png', 'bieu-do-vong-noi.png', 'van-toc-ung.csv'):
        ok(os.path.isfile(os.path.join(CHAY, f)), f'chay/{f}')
    g = Image.open(os.path.join(CHAY, 'chay-112px.gif'))
    from khung import khung_co_dinh
    ok(g.n_frames == n, f'GIF 112 px có {g.n_frames} khung')
    ok(g.info.get('duration') == round(ck['ms_moi_khung']), f'GIF {g.info.get("duration")} ms/khung')
    co = list(g.size)
    t = Image.open(os.path.join(TU_THE, 'tu-the-bay-112px.png'))
    ok(co == list(t.size), f'GIF 112 px và ảnh tư thế cùng canvas {co}')
    for f in ('01-bang-duyet.png', '02-so-sanh-v1-v2.png', '03-sua-gay-mu.png', '06-thu-toi-10.png'):
        ok(os.path.isfile(os.path.join(TU_THE, f)), f'tu-the/{f}')
    print('\nKẾT QUẢ:', 'ĐẠT' if not loi else f'{len(loi)} lỗi')
    return 1 if loi else 0


if __name__ == '__main__':
    sys.exit(main())
