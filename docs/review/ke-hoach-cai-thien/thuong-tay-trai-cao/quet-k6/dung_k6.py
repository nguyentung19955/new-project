#!/usr/bin/env python3
"""LẦN 2 (17/10/2026): THAY KHUNG 6 (thu thế) HÀNG THƯƠNG QUÉT bằng ảnh chủ game gen theo prompt "Khung giữ bản cũ" (../bao-cao.md).

Ảnh nguồn: docs/anh-goc/zed/moi/14-thuong-quet-k6-moi.png (1 khung to, ƯU TIÊN). Dự phòng: 14-thuong-quet-k6-moi-hang.png (khung 6).
Chỉ HÌNH, chỉ khung 6, chỉ bộ ninja (zed-moi). Không sửa tấm zed-moi: ảnh khung mới nằm trong game/js/thuong_cao_data.js (mục "anh"
của thuong_quet khung 6), game dựng nó thay khung cũ khi bật thương cao (tắt ?thuongcao=0 → khung cũ, neo cũ y như trước).

Cách dựng (như các hàng mới 16/10 + độ nét do-net):
  1. Tách nền xanh bằng cat-diem-anh.py (mat_na_bao_cao), lấy hình lớn nhất.
  2. Cỡ: CAO ĐẦU (do_dau) bằng cao đầu khung 6 cũ đã co trong hàng quét hiện tại (s_cũ đo lại từ ô 96: 46×66 tại 26,25).
  3. Chỗ: BÀN CHÂN TRƯỚC (chan_truoc) đặt đúng chỗ bàn chân trước khung 6 cũ trong ô 96; đáy hình ở chân (y 90).
  4. Thu nhỏ NÉT (do-net/cong-cu/thu_net.py, không tô viền như dung_zed_net): ô 96 thường + ô 116 bản to ×1,2 dựng thẳng từ ảnh gốc;
     ô 96 kiểu cũ (BOX) cho ?netcu=1.
  5. Nắm tay: tâm hai nắm đấm đo bằng nam_chuoi.tam_nam (trên bản ảnh nguồn đã đưa về cỡ ảnh ninja cũ, NEAREST), lớp ngón tay trước
     (hang_tay của biến thể nắm chuôi) = nam_chuoi.mat_na_nam + lop96 như dung-zed-game.py.
     Neo = [tay phải (dưới, sau), góc = đường nối hai tâm, trước người, [tay trái (trên, xa ra trước)]] → cán đi thẳng qua hai nắm tay.
Ra: quet-k6/k6.json (neo + 3 ảnh), quet-k6/k6-*.png (xem). sua.py (thư mục cha) đọc k6.json khi ghi thuong_cao_data.js.
Chạy (từ gốc repo): python3 docs/review/ke-hoach-cai-thien/thuong-tay-trai-cao/quet-k6/dung_k6.py [--hang]  (--hang: dùng bản dự phòng)"""
import base64, importlib.util, io, json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

DAY = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(DAY, '../../../../..'))
MOI = os.path.join(ROOT, 'docs/anh-goc/zed/moi')
sys.path.insert(0, os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/do-net/cong-cu'))
sys.path.insert(0, os.path.join(ROOT, 'docs/anh-goc/zed/gan-vk'))
import thu_net  # noqa: E402
import nam_chuoi as NC  # noqa: E402
thu_net.VIEN = 999  # Cu Tí: không tô viền tối (như dung_zed_net.py)


def _mod(ten, p):
    s = importlib.util.spec_from_file_location(ten, p); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m


CD = _mod('cat_diem_anh', os.path.join(ROOT, 'docs/anh-goc/zed/cat-diem-anh.py'))
DZ = _mod('dung_zed_game', os.path.join(ROOT, 'docs/anh-goc/zed/dung-zed-game.py'))

O, O_TO, K_TO = 96, 116, 1.2
HANG = '--hang' in sys.argv
NGUON = os.path.join(MOI, '14-thuong-quet-k6-moi-hang.png' if HANG else '14-thuong-quet-k6-moi.png')
CU = os.path.join(MOI, '14-thuong-quet-gif/14-thuong-quet/khung-06.png')
CU_CHAN_X = 1985.5 - 1838   # bao-cao.json khung 6: chân − mép trái khung
CU_O = (46, 66, 26, 25)     # khung 6 cũ trong ô 96 (nw, nh, dx, dy): đo lại từ tấm (dựng BOX khớp đúng khung bao ô cũ)
SO_MAU = 64
# chỗ ước lượng hai nắm tay trên ảnh nguồn đã cắt (đo tâm thật bằng tam_nam): tay phải (dưới, sau), tay trái (trên, xa ra trước)
TAY = {False: ((715, 725), (875, 545)), True: None}


def tach(p, x0=0):
    a = np.array(Image.open(p).convert('RGB'))[:, x0:]
    m, info = CD.mat_na_bao_cao(a)
    lab, n = nd.label(nd.binary_dilation(m, iterations=6))
    k = int(np.argmax(nd.sum(m, lab, range(1, n + 1)))) + 1
    m &= lab == k
    rgba = np.dstack([a, (m * 255).astype(np.uint8)]); rgba[~m] = 0
    im = Image.fromarray(rgba)
    return im.crop(im.getbbox()), info


def b64(a):
    return 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(a)).decode()


def main():
    src, info = tach(NGUON, 1820 if HANG else 0)
    cu = Image.open(CU).convert('RGBA')
    dau_cu, dau_moi = DZ.do_dau(cu), DZ.do_dau(src)
    sx_cu, sy_cu = CU_O[0] / cu.width, CU_O[1] / cu.height
    s_cu = (sx_cu + sy_cu) / 2
    s = s_cu * dau_cu[0] / dau_moi[0]           # cao đầu mới (sau co) = cao đầu khung 6 cũ (sau co)
    nw, nh = round(src.width * s), round(src.height * s)
    sx, sy = nw / src.width, nh / src.height
    x_truoc = CU_O[2] + DZ.chan_truoc(cu) * sx_cu   # bàn chân trước khung 6 cũ trong ô 96
    dx = round(x_truoc - DZ.chan_truoc(src) * sx)
    dy = round(DZ.CHAN[1] - src.height * sy)
    print('nguồn %s %s, tách nền %s' % (os.path.basename(NGUON), src.size, info))
    print('cao đầu cũ %.0f / mới %.0f → co %.5f (cũ %.5f); ô 96: %d×%d tại (%d,%d); chân trước %.2f' % (dau_cu[0], dau_moi[0], s, s_cu, nw, nh, dx, dy, x_truoc))

    # bản đo: ảnh nguồn đưa về cỡ ảnh ninja cũ (NEAREST giữ màu thật) để dùng đúng bán kính của nam_chuoi
    f = dau_cu[0] / dau_moi[0]
    do = src.resize((round(src.width * f), round(src.height * f)), Image.NEAREST)
    goc = TAY[HANG] or ((715, 725), (875, 545))
    p = NC.tam_nam(do, goc[0][0] * f, goc[0][1] * f)
    t = NC.tam_nam(do, goc[1][0] * f, goc[1][1] * f)
    kx, ky = nw / do.width, nh / do.height
    P = (dx + p[0] * kx, dy + p[1] * ky); T2 = (dx + t[0] * kx, dy + t[1] * ky)
    g = round(math.degrees(math.atan2(T2[1] - P[1], T2[0] - P[0])), 1)
    neo = [round(P[0], 2), round(P[1], 2), g, 0, [round(T2[0], 2), round(T2[1], 2)]]
    print('neo mới', neo, ' (khoảng hai tay %.1f điểm game)' % (math.hypot(T2[0] - P[0], T2[1] - P[1]) / 2))
    mk = NC.mat_na_nam(do, [p, t])

    def o_than(W, H, X, Y, OO, kieu):
        if kieu == 'box':
            m = np.array(src.resize((W, H), Image.BOX))
        else:
            m = thu_net.thu(np.asarray(src), W, H)
        o = np.zeros((OO, OO, 4), np.uint8)
        xa, ya, xb, yb = max(0, X), max(0, Y), min(OO, X + W), min(OO, Y + H)
        sub = m[ya - Y:yb - Y, xa - X:xb - X]; d = sub[..., 3] > 0
        o[ya:yb, xa:xb][d] = sub[d]
        return o

    def o_tay(than, W, H, X, Y, OO):
        mm = Image.fromarray((mk * 255).astype(np.uint8)).resize((W, H), Image.BOX)
        L = Image.new('L', (OO, OO), 0); L.paste(mm, (X, Y))
        r = than.copy(); r[np.array(L) < 128] = 0
        return r

    ra = {}
    for ten, OO, k, kieu in (('tam', O, 1.0, 'net'), ('to', O_TO, K_TO, 'net'), ('cu', O, 1.0, 'box')):
        W, H, X, Y = (nw, nh, dx, dy) if k == 1.0 else (round(nw * k), round(nh * k), round(dx * k), round(dy * k))
        than = o_than(W, H, X, Y, OO, kieu)
        tay = o_tay(than, W, H, X, Y, OO)
        hai = np.concatenate([than, tay], 1)       # 2 ô ngang: thân | nắm tay thân (hang_tay)
        if kieu == 'net':
            hai = thu_net.giam_mau(hai, SO_MAU)
        else:
            hai[..., 3] = np.where(hai[..., 3] > 0, hai[..., 3], 0)
        ra[ten] = hai
        Image.fromarray(hai).save(os.path.join(DAY, 'k6-%s.png' % ten))
    def png_thuong(a):
        b = io.BytesIO(); Image.fromarray(a).save(b, 'PNG', optimize=True)
        return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
    data = {'nguon': os.path.relpath(NGUON, ROOT), 'neo': neo, 'o': [nw, nh, dx, dy],
            'anh': {'tam': b64(ra['tam']), 'to': b64(ra['to']), 'cu': png_thuong(ra['cu']), 'o_to': O_TO, 'k': K_TO}}
    json.dump(data, open(os.path.join(DAY, 'k6.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print('ghi k6.json: %.1f KB' % (os.path.getsize(os.path.join(DAY, 'k6.json')) / 1024))
    return data


if __name__ == '__main__':
    main()


def ghi_bang():
    """Chỉ chèn / thay mục thuong_quet khung 6 trong game/js/thuong_cao_data.js (các hàng khác GIỮ NGUYÊN từng số: chạy lại sua.py
    sẽ đo lại "cot" trên tấm đã dựng nét, ngoài phạm vi lần này) + so-do.json."""
    sys.path.insert(0, os.path.dirname(DAY))
    import sua as SU
    p = os.path.join(ROOT, 'game/js/thuong_cao_data.js')
    s = open(p, encoding='utf-8').read()
    dau, giua = s.split('G.THUONG_CAO_DATA = ', 1)
    B = json.loads(giua.rsplit(';', 1)[0])
    T, V, SUA = SU.tai()
    k, i = 'thuong_quet', 5
    n = SU.neo_dung(T, SUA, k, i)
    A = json.load(open(os.path.join(DAY, 'k6.json'), encoding='utf-8'))
    B['bo']['zed-moi'][k] = {'so': T['dong_tac'][k]['so'], 'khung': {str(i): {'cu': [n[0], n[1], n[2]], 'neo': A['neo'], 'anh': A['anh']}}}
    if 'anh (Lần 2' not in B['ghi_chu']:
        B['ghi_chu'] += ('; anh (Lần 2, quét khung 6) = ảnh khung thay hẳn: tam = 2 ô 96 (thân | nắm tay thân), to = 2 ô o_to bản to ×k, '
                         'cu = bản BOX cho ?netcu=1')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(dau + 'G.THUONG_CAO_DATA = ' + json.dumps(B, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('ghi %s (%.1f KB)' % (os.path.relpath(p, ROOT), os.path.getsize(p) / 1024))
    ps = os.path.join(os.path.dirname(DAY), 'so-do.json')
    bang = json.load(open(ps, encoding='utf-8'))
    for r in bang:
        if r['hang'] == k and r['khung'] == i + 1:
            r.update(goc_moi=A['neo'][2], tay2_moi=A['neo'][4], ly_do='thay ảnh gen lại (Lần 2, %s)' % A['nguon'])
    json.dump(bang, open(ps, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__' and '--ghi' in sys.argv:
    ghi_bang()
