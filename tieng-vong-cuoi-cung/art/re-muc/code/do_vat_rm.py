"""Bước 3 – đồ vật RỄ MỤC từ nguon/re-muc-do-vat.png (nền trắng, 1536×1024): tách nền (flood từ mép + khử viền trắng,
chung.tach_vung của Làng Chuông), thu về cùng một tỷ lệ K = 0,42 (ảnh 2x) → cỡ hợp Lam 112 logic:
  nam-nho ≈ 53 logic, nam-lon ≈ 72, goc-re ≈ 76, ken ≈ 97 (treo từ trần, neo GIỮA ĐỈNH), chuong-vo ≈ 73, bao-tu ≈ 73,
  giot-1/2/3 (3 cỡ giọt, neo giữa đỉnh), vung (vũng + cột nước bắn) và vung-yen (vũng lặng – cắt bỏ cột nước), bong-1..3 (bong bóng
  bào tử bay – tách khỏi ảnh bào tử nổ).
Mọi đồ vật neo GIỮA ĐÁY (trừ kén / giọt: giữa đỉnh). Làm dịu 0,95 sáng / 0,92 màu (nấm sáng, giọt, bong bóng giữ nguyên – là nguồn sáng).
Xuất: do-vat/<tên>.png + do-vat.json (co_anh, co_logic, neo, trạng thái / khung lặp)."""
import os

import numpy as np
import scipy.ndimage as nd

from chung_rm import DOVAT, doc_nguon, tach_vung, doi_co, luu_png, luu_json, toi_bot_mau

K = 0.42
# hộp trên ảnh gen (x0, y0, x1, y1), neo, có làm dịu không
HOP = {
    'nam-nho':   ((40, 224, 348, 475), 'day', False),
    'nam-lon':   ((394, 140, 768, 482), 'day', False),
    'goc-re':    ((801, 123, 1204, 487), 'day', True),
    'ken':       ((1252, 39, 1446, 500), 'dinh', True),
    'chuong-vo': ((36, 602, 412, 950), 'day', True),
    'bao-tu-kin': ((766, 600, 1084, 950), 'day', True),
    'bao-tu-no':  ((1117, 604, 1500, 952), 'day', True),
    'giot-1':    ((560, 580, 612, 672), 'dinh', False),
    'giot-2':    ((565, 700, 610, 760), 'dinh', False),
    'giot-3':    ((566, 765, 612, 850), 'dinh', False),
    'vung':      ((455, 840, 745, 952), 'day', False),
}


def cat(a, ten):
    box, neo, diu = HOP[ten]
    rgba, (x0, y0) = tach_vung(a, box, pad=4)
    ys, xs = np.nonzero(rgba[..., 3] > 0)
    rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return rgba, neo, diu


def thu(rgba, k=K):
    h, w = rgba.shape[:2]
    return doi_co(rgba, max(1, round(w * k)), max(1, round(h * k)))


def tach_bong(rgba):
    """Bào tử nổ: thành phần liên thông chính = vỏ; các cụm rời (bong bóng bay) tách thành bong-1..3 (to → nhỏ)."""
    m = rgba[..., 3] > 0
    lab, n = nd.label(nd.binary_dilation(m, iterations=2))
    sz = nd.sum(m, lab, range(1, n + 1))
    chinh = int(np.argmax(sz)) + 1
    vo = rgba.copy()
    vo[lab != chinh] = 0
    bong = []
    for i in np.argsort(-sz):
        if i + 1 == chinh or sz[i] < 150:
            continue
        p = rgba.copy()
        p[lab != i + 1] = 0
        ys, xs = np.nonzero(p[..., 3] > 0)
        bong.append(p[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    ys, xs = np.nonzero(vo[..., 3] > 0)
    return vo[ys.min():ys.max() + 1, xs.min():xs.max() + 1], bong[:3]


def vung_yen(v):
    """Vũng lặng: bỏ cột nước bắn (phần cao hơn mặt vũng). Mặt vũng = hàng có bề rộng đặc tăng vọt (mép trên của vành)."""
    m = v[..., 3] > 0
    rong = m.sum(1)
    h = len(rong)
    # hàng mặt vũng: hàng đầu tiên (từ trên) có bề rộng ≥ 45 % bề rộng lớn nhất
    y_mat = int(np.argmax(rong >= 0.45 * rong.max()))
    o = v.copy()
    o[:y_mat] = 0
    # làm mềm mép cắt 3 px
    for i in range(3):
        if y_mat + i < h:
            o[y_mat + i, :, 3] = (o[y_mat + i, :, 3] * (i + 1) / 4).astype(np.uint8)
    return o


def chay():
    a = doc_nguon('re-muc-do-vat.png')
    os.makedirs(DOVAT, exist_ok=True)
    meta = {}
    ra = {}
    for ten in HOP:
        rgba, neo, diu = cat(a, ten)
        if ten == 'bao-tu-no':
            vo, bong = tach_bong(rgba)
            ra['bao-tu-no'] = (thu(vo), neo, diu)
            for i, b in enumerate(bong, 1):
                ra[f'bong-{i}'] = (thu(b), 'giua', False)
            continue
        if ten == 'vung':
            ra['vung'] = (thu(rgba), 'day', False)
            ra['vung-yen'] = (thu(vung_yen(rgba)), 'day', False)
            continue
        ra[ten] = (thu(rgba), neo, diu)
    for ten, (im, neo, diu) in ra.items():
        if diu:
            im = toi_bot_mau(im, 0.95, 0.92)
        luu_png(im, f'{DOVAT}/{ten}.png')
        h, w = im.shape[:2]
        meta[ten] = {'co_anh': [int(w), int(h)], 'co_logic': [w / 2, h / 2], 'neo': neo,
                     'neo_px': [w / 2, 0 if neo == 'dinh' else (h / 2 if neo == 'giua' else h)]}
    meta['nam-nho']['ghi_chu'] = 'cụm nấm sáng nhỏ – đặt trên sàn; là nguồn sáng, không làm dịu'
    meta['nam-lon']['ghi_chu'] = 'cụm nấm sáng lớn – đặt trên sàn'
    meta['goc-re']['ghi_chu'] = 'gốc rễ mục – đặt trên sàn (cũng dùng làm chân rễ góc ở trang-tri)'
    meta['ken']['ghi_chu'] = 'kén treo – neo GIỮA ĐỈNH, dán vào mặt dưới trần'
    meta['chuong-vo']['ghi_chu'] = 'chuông vỡ mốc – đặt trên sàn'
    meta['bao-tu-kin']['ghi_chu'] = 'bào tử trạng thái KÍN'
    meta['bao-tu-no']['ghi_chu'] = 'bào tử trạng thái NỔ (vỏ mở, không gồm bong bóng); cùng neo đáy với bản kín'
    for i in (1, 2, 3):
        if f'bong-{i}' in meta:
            meta[f'bong-{i}']['ghi_chu'] = 'bong bóng bào tử (bay lên khi nổ, mờ dần) – neo giữa'
    meta['giot-1']['ghi_chu'] = 'giọt nước to (khung rơi); giot-2 nhỏ, giot-3 vừa – lặp: 2 → 3 → 1 rơi xuống vũng'
    meta['vung']['ghi_chu'] = 'vũng + cột nước bắn (khung chạm)'
    meta['vung-yen']['ghi_chu'] = 'vũng lặng (khung chờ)'
    luu_json({
        'ten': 'Đồ vật Rễ Mục (nguon/re-muc-do-vat.png), ảnh 2x, tỷ lệ chung 0,42',
        'quy_uoc': {'boi_so': 2, 've': 'vẽ ở ½ cỡ ảnh tại neo (day = giữa đáy trên mặt sàn; dinh = giữa đỉnh dưới trần; giua = tâm)',
                    'hieu_ung_lap': {'giot': 'rơi từ trần: giot-2 (0–10 bước) → giot-3 (10–20) → giot-1 rơi tới vũng (tốc độ ~6 px/bước) → vung 10 bước → vung-yen; chu kỳ ~150 bước',
                                     'bao-tu': 'kín; Lam tới gần (< 70 px) → nổ: đổi sang bao-tu-no + 3 bong bóng bay lên mờ dần; ~180 bước sau kín lại'}},
        'do_vat': meta,
    }, f'{DOVAT}/do-vat.json')
    print('đồ vật:', {k: v['co_logic'] for k, v in meta.items()})


if __name__ == '__main__':
    chay()
