#!/usr/bin/env python3
"""Tạo ẢNH NHÃN (mask) cho từng ảnh giáp rồi TÁCH ra các lượt vẽ back / front / trong.

Chạy lại được bất cứ lúc nào từ ảnh giáp gốc (tao-rig.py gọi tự động):
    python3 docs/thu-modular-96/rig-do-sau/tao-mask.py

Đầu vào (CHỈ ĐỌC, không bao giờ bị ghi đè ở bước này):
    giap/<ảnh>.png       ảnh gốc bộ Máy vẽ   (tao-rig.py vẽ từ mã ký tự)
    giap-gen/<ảnh>.png   ảnh gốc bộ Gen      (tao-giap-gen.py cắt từ ../anh-gen/giap-roi-4-manh.png)

Ảnh nhãn  nhan/<bộ>/<ảnh>.png  — CÙNG KÍCH THƯỚC, CÙNG HỆ TOẠ ĐỘ với ảnh gốc:
    đỏ    (255,0,0)   = back   : phần giáp bị cơ thể che (vẽ TRƯỚC lớp thân che nó)
    xanh  (0,0,255)   = front  : phần giáp vẽ đè lên cơ thể
    lục   (0,255,0)   = trong  : mép trong — lớp vẽ chọn THEO KHUNG bằng quy tắc trong rig.json
                                 (không có quy tắc thì theo mặc định ghi trong rig.json)
    trong suốt         = không có điểm ảnh giáp
Mỗi điểm ảnh có hình của ảnh gốc phải mang đúng 1 nhãn.

Sổ nhãn  nhan/nhan.json  ghi trạng thái từng ảnh nhãn:
    "tu-dong-can-duyet" : do script sinh theo luật bên dưới — CẦN NGƯỜI DUYỆT; chạy lại sẽ sinh lại.
    "da-duyet"          : người làm asset đã sửa/duyệt tay — script KHÔNG ghi đè nữa, chỉ dùng để tách.
Muốn sửa tay: mở nhan/<bộ>/<ảnh>.png bằng trình vẽ pixel, tô lại 3 màu trên, đổi trạng thái thành
"da-duyet" trong nhan/nhan.json rồi chạy lại tao-rig.py.

Đầu ra  pass/<bộ>/<ảnh>-back.png, -front.png, -trong.png — cùng kích thước, cùng neo với ảnh gốc
(chỉ là ảnh gốc giữ lại các điểm ảnh của 1 nhãn, phần còn lại trong suốt).

Luật sinh nhãn tự động (đánh giá lại tach-pass-giap.py của bản ChatGPT):
  * ChatGPT cắt ĐÔI ảnh xương theo bề dày (nửa trên = back, nửa dưới = front). Bỏ: nửa trên ảnh xương
    là mặt giáp, không phải phần bị thân che — làm vậy nửa mặt giáp chui xuống dưới tay/chân.
  * ChatGPT cắt đôi CHỤP KHỚP trên/dưới. Bỏ: chụp khớp đặt đè lên khớp, cả chụp là front.
  * ChatGPT để 30% đầu cổ của giáp ngực là back (cổ áo sau). GIỮ ý này nhưng chỉ lấy nửa phía lưng
    (hàng dưới của ảnh = phía lưng khi xương cổ→hông chĩa xuống), nửa phía ngực vẫn front.
  * ChatGPT nới ảnh (pad 2 điểm ảnh) và ghi đè ảnh gốc. Bỏ: ảnh gốc giữ nguyên; phần chồng qua khớp
    do renderer kéo dài mép lúc vẽ (overlapStart/overlapEnd trong rig.json).
  * Mảnh xương tay/chân: viền dưới cùng của mỗi cột (hàng dưới = phía lưng/mép trong của chi khi xương
    chĩa xuống) = đỏ back; còn lại = front.  -> tự sinh, cần người duyệt.
  * Lục "trong" không được luật tự động dùng; để người làm asset tô thêm khi cần 1 dải đổi lớp riêng.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

RIG = Path(__file__).resolve().parent
NHAN = RIG / 'nhan'
PASS = RIG / 'pass'
SO = NHAN / 'nhan.json'

DO, XANH, LUC = (255, 0, 0), (0, 0, 255), (0, 255, 0)
TEN_NHAN = {DO: 'back', XANH: 'front', LUC: 'trong'}
VUNG = ['back', 'front', 'trong']

BO = {
    'may': RIG / 'giap',
    'gen': RIG / 'giap-gen',
}
XUONG = ['giap-vai', 'giap-cang-tay', 'giap-ong-chan']


def loai(ten):
    goc = ten.replace('-x2', '')
    if goc.startswith('chup-'):
        return 'chup'
    if goc == 'giap-nguc':
        return 'nguc'
    if goc in XUONG:
        return 'xuong'
    return None


def sinh_nhan(im, kieu, x2):
    """Luật tự động. Trả về (ảnh nhãn, mô tả luật)."""
    w, h = im.size
    a = im.getchannel('A').load()
    lab = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    p = lab.load()
    day = 2 if x2 else 1
    if kieu == 'chup':
        for y in range(h):
            for x in range(w):
                if a[x, y]:
                    p[x, y] = XANH + (255,)
        return lab, 'cả chụp khớp = front (đè lên khớp)'
    if kieu == 'nguc':
        cut_x = max(1, round(w * 0.30))
        for y in range(h):
            for x in range(w):
                if a[x, y]:
                    p[x, y] = (DO if (x < cut_x and y >= h / 2) else XANH) + (255,)
        return lab, 'cổ áo sau: 30% cột đầu cổ × nửa dưới (phía lưng) = back; còn lại front'
    # xương tay/chân
    for x in range(w):
        ys = [y for y in range(h) if a[x, y]]
        for y in ys:
            p[x, y] = XANH + (255,)
        for y in ys[-day:]:
            p[x, y] = DO + (255,)
    return lab, 'viền dưới cùng mỗi cột (%d điểm ảnh) = back (mép trong); còn lại front' % day


def doc_nhan(lab, im):
    """Kiểm ảnh nhãn so với ảnh gốc; trả về (map nhãn, lỗi, cảnh báo)."""
    loi, canh = [], []
    if lab.size != im.size:
        return None, ['nhãn %s khác cỡ ảnh gốc %s' % (lab.size, im.size)], []
    w, h = im.size
    a, L = im.getchannel('A').load(), lab.convert('RGBA').load()
    m = {}
    thieu = la = thua = 0
    for y in range(h):
        for x in range(w):
            r, g, b, al = L[x, y]
            ten = TEN_NHAN.get((r, g, b)) if al >= 128 else None
            if al >= 128 and ten is None:
                la += 1
            if a[x, y]:
                if ten is None:
                    thieu += 1
                else:
                    m[(x, y)] = ten
            elif ten is not None:
                thua += 1
    if thieu:
        loi.append('%d điểm ảnh có hình nhưng chưa có nhãn' % thieu)
    if la:
        loi.append('%d điểm ảnh nhãn sai màu (chỉ dùng đỏ/xanh dương/lục thuần)' % la)
    if thua:
        canh.append('%d điểm ảnh nhãn nằm ngoài hình (bỏ qua)' % thua)
    return m, loi, canh


def tach(im, m, out_stem):
    w, h = im.size
    src = im.load()
    dem = {}
    for v in VUNG:
        o = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        p = o.load()
        n = 0
        for (x, y), ten in m.items():
            if ten == v:
                p[x, y] = src[x, y]
                n += 1
        o.save(out_stem.parent / ('%s-%s.png' % (out_stem.name, v)))
        dem[v] = n
    # kiểm: ghép lại phải đúng ảnh gốc
    ghep = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    for v in VUNG:
        ghep.alpha_composite(Image.open(out_stem.parent / ('%s-%s.png' % (out_stem.name, v))))
    g, o = np.asarray(ghep).copy(), np.asarray(im).copy()
    o[o[..., 3] == 0] = 0
    dung = bool((g == o).all())
    return dem, dung


def main():
    so = json.loads(SO.read_text(encoding='utf-8')) if SO.exists() else {}
    tong_loi = []
    ket = {}
    for bo, thu in BO.items():
        (NHAN / bo).mkdir(parents=True, exist_ok=True)
        (PASS / bo).mkdir(parents=True, exist_ok=True)
        for f in sorted(thu.glob('*.png')):
            ten = f.stem
            kieu = loai(ten)
            if kieu is None:          # goc-*.png (bản cắt độ phân giải cao) không dùng trong rig
                continue
            im = Image.open(f).convert('RGBA')
            key = '%s/%s' % (bo, ten)
            nf = NHAN / bo / (ten + '.png')
            tt = so.get(key, {}).get('trangThai')
            if tt == 'da-duyet' and nf.exists():
                lab, luat = Image.open(nf), so[key].get('luat', 'người duyệt')
            else:
                lab, luat = sinh_nhan(im, kieu, ten.endswith('-x2'))
                lab.save(nf)
                tt = 'tu-dong-can-duyet'
            m, loi, canh = doc_nhan(lab, im)
            if loi:
                tong_loi += ['%s: %s' % (key, s) for s in loi]
                continue
            dem, dung = tach(im, m, PASS / bo / ten)
            if not dung:
                tong_loi.append('%s: ghép back+front+trong KHÔNG ra đúng ảnh gốc' % key)
            so[key] = {'trangThai': tt, 'luat': luat, 'anhGoc': f.relative_to(RIG).as_posix(),
                       'nhan': nf.relative_to(RIG).as_posix(), 'co': list(im.size), 'diemAnh': dem}
            ket[key] = dem
            for s in canh:
                print('  cảnh báo %s: %s' % (key, s))
    SO.write_text(json.dumps(so, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    can = sum(1 for v in so.values() if v['trangThai'] != 'da-duyet')
    print('tao-mask: %d ảnh nhãn (%d tự sinh cần duyệt), tách ra %d lượt back/front/trong' % (len(ket), can, 3 * len(ket)))
    if tong_loi:
        print('LỖI:', *tong_loi, sep='\n  ')
        sys.exit(1)


if __name__ == '__main__':
    main()
