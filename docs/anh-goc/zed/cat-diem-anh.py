#!/usr/bin/env python3
"""Cắt tấm sprite AI theo ĐIỂM ẢNH (không theo ô vuông), KIỂM số khung, rồi xuất khung + GIF xem thử.

Sửa lần 2 (theo docs/review/ke-hoach-cai-thien/zed-asset/ghep-sua/YEU-CAU-2.md):
- KHÔNG còn tự tách/gộp hình cho đủ số khung. Hàng thiếu/thừa khung, khung nằm sai ô, hình chạm mép ảnh
  → LỖI, dừng xuất chính thức (mã thoát 1), chỉ ghi báo cáo + ảnh debug.
- Chế độ PHỤC HỒI riêng (--che-do phuc-hoi): được tách hình dính / gộp mảnh để xem thử, nhưng MỌI khung
  bị đụng tới được ghi "suy-doan" kèm lý do trong báo cáo và tô viền đỏ trong ảnh debug; đầu ra ghi rõ PHUC-HOI.
- Cắt tay (--cat-tay tep.json) khi máy không đáng tin: { "1": [[x0,y0,x1,y1], ... đủ số cột], ... } (hàng đếm từ 1,
  toạ độ điểm ảnh trên tấm nguồn). Khung cắt tay ghi nguồn "cat-tay".
- Tách nền KHÔNG còn dùng binary_opening (phép này xoá mất nét mảnh 1–2 điểm ảnh: ~1 900 điểm ảnh trên tấm thân v2).
- Mảnh nhỏ bị bỏ được LIỆT KÊ (vị trí, số điểm ảnh) chứ không âm thầm bỏ.
- Phóng to GIF bằng NEAREST theo bội số nguyên (không LANCZOS → không nhoè viền pixel art).

Dùng:
  python3 cat-diem-anh.py <anh.png> --hang 3 --so 8 [--ten dung,di,chay] [--ms 150,112,75] [--ra thu-muc]
                          [--che-do chinh-thuc|phuc-hoi] [--cat-tay cat-tay.json]
Ra (thư mục --ra, mặc định <anh>-cat/):
  bao-cao.json   số khung, khung bao, chân, cỡ, cảnh báo, lỗi, mảnh bị bỏ (luôn ghi)
  debug.png      cả tấm, khung bao từng hình + số thứ tự (xanh = tự động, vàng = cắt tay, đỏ = suy đoán / lỗi) (luôn ghi)
  <hang>/khung-NN.png  từng khung nền trong suốt, cỡ gốc (CHỈ khi ĐẠT, hoặc ở chế độ phục hồi)
  N-<ten>.gif    GIF từng hàng căn chân (CHỈ khi ĐẠT, hoặc phục hồi → tên có -PHUC-HOI)
Mã thoát: 0 = ĐẠT, 1 = LỖI (không xuất chính thức), 2 = phục hồi (đã xuất bản thử có khung suy đoán).
"""
import argparse, os, json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd


class LoiSoKhung(Exception):
    """Tấm ảnh không tách được đúng số khung một cách đáng tin cậy."""


# ---------------------------------------------------------------- tách nền
def phan_loai_nen(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    xanh = (g > 120) & (g - np.maximum(r, b) > 60)
    hong = (r > 120) & (b > 120) & (np.minimum(r, b) - g > 60)
    nen_xanh = xanh.mean() > hong.mean()
    return (xanh if nen_xanh else hong), nen_xanh


def mat_na_bao_cao(a, manh_toi_thieu=4):
    """Mặt nạ hình (True = điểm ảnh nhân vật/đồ). Trả (mask, số liệu)."""
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    nen, nen_xanh = phan_loai_nen(a)
    m = ~nen
    # bỏ chấm nhiễu: chỉ thành phần liền < manh_toi_thieu điểm ảnh (KHÔNG dùng opening: opening xoá nét mảnh)
    lab, n = nd.label(m)
    so_cham = 0
    if n:
        dt = nd.sum(m, lab, range(1, n + 1))
        nho = np.where(dt < manh_toi_thieu)[0] + 1
        if len(nho):
            bo = np.isin(lab, nho)
            so_cham = int(bo.sum())
            m &= ~bo
    # khử viền: điểm ảnh sát nền mà còn ngả màu nền (pha trộn nền) thì bỏ
    vien = m & nd.binary_dilation(~m, iterations=1)
    nga = (g - np.maximum(r, b) > 25) if nen_xanh else (np.minimum(r, b) - g > 25)
    khu = vien & nga
    m = m & ~khu
    # điểm ảnh ngả xanh nằm TRONG hình (không sát nền) — không xoá, chỉ đếm để người xem biết
    nga_trong = m & nga & ~vien
    return m, {'nen': 'xanh' if nen_xanh else 'hong', 'cham_nhieu_bo': so_cham, 'vien_khu': int(khu.sum()),
               'nga_mau_nen_trong_hinh': int(nga_trong.sum())}


def mat_na(a):
    """Giữ tên cũ cho các script khác (ghep-thu.py)."""
    return mat_na_bao_cao(a)[0]


# ---------------------------------------------------------------- tìm hình
def tim_hinh_day_du(m, gian=6, nho=0.002):
    """Mỗi hình = các điểm ảnh liền nhau sau khi nới `gian` điểm ảnh (tóc/khăn rời vẫn dính người).
    Trả (hinh, manh_bo). hinh: (y0, y1, x0, x1, vung). manh_bo: mảnh quá nhỏ, KHÔNG âm thầm bỏ — được liệt kê."""
    H, W = m.shape
    lab, n = nd.label(nd.binary_dilation(m, iterations=gian))
    hinh, bo = [], []
    nguong = nho * H * W / 24
    for i, sl in enumerate(nd.find_objects(lab), 1):
        if sl is None:
            continue
        vung = (lab[sl] == i) & m[sl]
        if vung.sum() < nguong:
            bo.append({'khung_bao': [int(sl[1].start), int(sl[0].start), int(sl[1].stop), int(sl[0].stop)], 'diem_anh': int(vung.sum())})
            continue
        hinh.append((sl[0].start, sl[0].stop, sl[1].start, sl[1].stop, vung))
    return hinh, bo


def tim_hinh(m, gian=6, nho=0.002):
    return tim_hinh_day_du(m, gian, nho)[0]


def chia_hang(hinh, so_hang):
    """Gom hình thành hàng theo tâm dọc (k-means 1 chiều), trong hàng xếp trái → phải."""
    if not hinh:
        return []
    cy = np.array([(h[0] + h[1]) / 2 for h in hinh])
    if so_hang <= 1:
        nhom = [list(range(len(hinh)))]
    else:
        tam = np.quantile(cy, np.linspace(0.1, 0.9, so_hang))
        for _ in range(20):
            gan = np.argmin(np.abs(cy[:, None] - tam[None, :]), 1)
            tam = np.array([cy[gan == k].mean() if (gan == k).any() else tam[k] for k in range(so_hang)])
        thu_tu = np.argsort(tam)
        nhom = [[i for i in range(len(hinh)) if gan[i] == k] for k in thu_tu]
    return [sorted(g, key=lambda i: hinh[i][2]) for g in nhom]


# ---------------------------------------------------------------- phục hồi (CHỈ chế độ phuc-hoi)
def _gop(h, nho):
    y0, y1, x0, x1 = min(h[0], nho[0]), max(h[1], nho[1]), min(h[2], nho[2]), max(h[3], nho[3])
    v = np.zeros((y1 - y0, x1 - x0), bool)
    for a in (h, nho):
        v[a[0] - y0:a[1] - y0, a[2] - x0:a[3] - x0] |= a[4]
    return (y0, y1, x0, x1, v)


def phuc_hoi_hang(hinh, so):
    """Đoán lại số hình của MỘT hàng. Trả [(hinh, ly_do hoặc None)]. Mọi hình bị tách/gộp có lý do ≠ None."""
    ds = [(h, None) for h in sorted(hinh, key=lambda h: h[2])]
    while len(ds) > so:
        dt = [h[4].sum() for h, _ in ds]
        i = int(np.argmin(dt))
        nho, _ = ds.pop(i)
        cx = (nho[2] + nho[3]) / 2
        j = int(np.argmin([abs((h[2] + h[3]) / 2 - cx) for h, _ in ds]))
        ds[j] = (_gop(ds[j][0], nho), 'SUY ĐOÁN: đã gộp một mảnh %d điểm ảnh (x %d–%d) vào hình này' % (nho[4].sum(), nho[2], nho[3]))
    while len(ds) < so:
        i = int(np.argmax([h[3] - h[2] for h, _ in ds]))
        y0, y1, x0, x1, v = ds[i][0]
        cot = v.sum(0).astype(float)
        w = len(cot)
        a, b = int(w * 0.25), int(w * 0.75)
        cat = a + int(np.argmin(cot[a:b]))
        out = []
        for (xx0, xx1, vv) in ((x0, x0 + cat, v[:, :cat]), (x0 + cat, x1, v[:, cat:])):
            rows = np.where(vv.any(1))[0]
            out.append(((y0 + rows.min(), y0 + rows.max() + 1, xx0, xx1, vv[rows.min():rows.max() + 1]),
                        'SUY ĐOÁN: tách từ một hình rộng %d điểm ảnh ở cột ít điểm ảnh nhất x=%d (có thể cắt nhầm tóc/khăn/tay)' % (w, x0 + cat)))
        ds[i:i + 1] = out
    return ds


# ---------------------------------------------------------------- tách cả tấm (dùng chung cho ghep-thu.py)
def tach_sheet(duong_dan, so_hang=3, so_cot=8, ten=None, che_do='chinh-thuc', cat_tay=None):
    """Tách tấm → khung theo hàng. Không tự sửa số khung (trừ che_do='phuc-hoi', khi đó ghi rõ khung suy đoán).
    Trả dict báo cáo; mỗi khung có 'img' (RGBA cỡ gốc, nền trong suốt) và 'mask' (không ghi ra JSON)."""
    im = Image.open(duong_dan).convert('RGB')
    arr = np.array(im)
    H, W = arr.shape[:2]
    m, tk = mat_na_bao_cao(arr)
    hinh, manh_bo = tim_hinh_day_du(m)
    hangs = chia_hang(hinh, so_hang)
    ten = list(ten or [])
    bc = {'anh': duong_dan, 'co_anh': [W, H], 'che_do': che_do, 'so_hang_can': so_hang, 'so_cot_can': so_cot,
          'tach_nen': tk, 'manh_bo': manh_bo, 'loi': [], 'canh_bao': [], 'hang': []}
    for mb in manh_bo:
        if mb['diem_anh'] >= 40:
            bc['canh_bao'].append('Mảnh %d điểm ảnh ở %s bị bỏ (quá nhỏ để là một khung) — xem debug.png xem có phải chi tiết rời không' % (mb['diem_anh'], mb['khung_bao']))
    if len(hangs) != so_hang:
        bc['loi'].append('Tìm được %d hàng, cần %d' % (len(hangs), so_hang))
    cat_tay = cat_tay or {}
    o_rong = W / so_cot
    for r, g in enumerate(hangs):
        t = ten[r] if r < len(ten) else 'hang-%d' % (r + 1)
        ds = [(hinh[i], None, 'tu-dong') for i in g]
        if str(r + 1) in cat_tay:
            ds = []
            for (x0, y0, x1, y1) in cat_tay[str(r + 1)]:
                v = m[y0:y1, x0:x1]
                ys, xs = np.where(v)
                if not len(ys):
                    ds.append(((y0, y0 + 1, x0, x0 + 1, np.zeros((1, 1), bool)), 'cắt tay: ô trống', 'cat-tay'))
                    continue
                v = v[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
                ds.append(((y0 + ys.min(), y0 + ys.max() + 1, x0 + xs.min(), x0 + xs.max() + 1, v), None, 'cat-tay'))
        if len(ds) != so_cot:
            msg = 'Hàng %d (%s): tìm được %d hình, cần %d' % (r + 1, t, len(ds), so_cot)
            if che_do == 'phuc-hoi' and ds and ds[0][2] == 'tu-dong':
                bc['canh_bao'].append(msg + ' → PHỤC HỒI bằng suy đoán (xem các khung "suy-doan")')
                ds = [(h, ly, 'suy-doan' if ly else 'tu-dong') for h, ly in phuc_hoi_hang([d[0] for d in ds], so_cot)]
            else:
                bc['loi'].append(msg + ' — KHÔNG tự tách/gộp; sửa ảnh, dùng --cat-tay, hoặc chạy --che-do phuc-hoi để xem thử')
        hang = {'ten': t, 'so_khung': len(ds), 'khung': []}
        rong = [h[3] - h[2] for h, _, _ in ds]
        cao = [h[1] - h[0] for h, _, _ in ds]
        dt = [int(h[4].sum()) for h, _, _ in ds]
        mr, mc, md = (float(np.median(x)) if x else 0 for x in (rong, cao, dt))
        for k, (h, ly, nguon) in enumerate(ds):
            y0, y1, x0, x1, v = h
            ghi = [ly] if ly else []
            cot = int(((x0 + x1) / 2) // o_rong)
            if cot != k and nguon != 'cat-tay':
                (bc['loi'] if che_do != 'phuc-hoi' else bc['canh_bao']).append(
                    'Hàng %d khung %d nằm ở ô cột %d — sai thứ tự hoặc thiếu/thừa khung phía trước' % (r + 1, k + 1, cot + 1))
                ghi.append('nằm ở ô cột %d' % (cot + 1))
            if x0 <= 0 or y0 <= 0 or x1 >= W or y1 >= H:
                bc['loi'].append('Hàng %d khung %d chạm mép ảnh — có thể bị cắt mất chi tiết' % (r + 1, k + 1))
                ghi.append('chạm mép ảnh')
            if mr and (x1 - x0) > 1.5 * mr:
                bc['canh_bao'].append('Hàng %d khung %d rộng %d (trung vị %d) — có thể hai hình dính nhau' % (r + 1, k + 1, x1 - x0, mr))
                ghi.append('rộng bất thường')
            if md and v.sum() < 0.6 * md:
                bc['canh_bao'].append('Hàng %d khung %d chỉ %d điểm ảnh (trung vị %d) — có thể bị tách mất mảnh' % (r + 1, k + 1, v.sum(), md))
                ghi.append('ít điểm ảnh bất thường')
            if mc and abs((y1 - y0) - mc) > 0.15 * mc:
                bc['canh_bao'].append('Hàng %d khung %d cao %d (trung vị %d) — lệch cỡ >15%%' % (r + 1, k + 1, y1 - y0, mc))
                ghi.append('cao bất thường')
            # chân: tâm các điểm ảnh ở 12% dưới cùng
            day = v[int(v.shape[0] * 0.88):]
            xs = np.where(day.any(0))[0]
            chan_x = x0 + ((xs.min() + xs.max()) / 2 if len(xs) else v.shape[1] / 2)
            cut = np.dstack([arr[y0:y1, x0:x1], np.where(v, 255, 0).astype(np.uint8)])
            hang['khung'].append({'stt': k + 1, 'khung_bao': [int(x0), int(y0), int(x1), int(y1)], 'chan': [round(float(chan_x), 1), int(y1)],
                                  'rong': int(x1 - x0), 'cao': int(y1 - y0), 'diem_anh': int(v.sum()), 'nguon': nguon, 'ghi_chu': ghi,
                                  'img': Image.fromarray(cut, 'RGBA'), 'mask': v})
        bc['hang'].append(hang)
    bc['dat'] = not bc['loi']
    bc['suy_doan'] = [[r + 1, k['stt']] for r, h in enumerate(bc['hang']) for k in h['khung'] if k['nguon'] == 'suy-doan']
    return bc


def bao_cao_json(bc):
    """Bản báo cáo bỏ ảnh/mặt nạ để ghi JSON."""
    out = {k: v for k, v in bc.items() if k != 'hang'}
    out['hang'] = [{**{k: v for k, v in h.items() if k != 'khung'},
                    'khung': [{k: v for k, v in f.items() if k not in ('img', 'mask')} for f in h['khung']]} for h in bc['hang']]
    return out


def ve_debug(bc, path):
    im = Image.open(bc['anh']).convert('RGB')
    d = ImageDraw.Draw(im)
    for r, h in enumerate(bc['hang']):
        for f in h['khung']:
            mau = {'tu-dong': (0, 90, 255), 'cat-tay': (255, 210, 0), 'suy-doan': (255, 0, 0)}[f['nguon']]
            if f['ghi_chu'] and f['nguon'] != 'suy-doan':
                mau = (255, 120, 0)
            d.rectangle(f['khung_bao'], outline=mau, width=3)
            d.text((f['khung_bao'][0] + 4, f['khung_bao'][1] + 2), '%d.%d' % (r + 1, f['stt']), fill=(0, 0, 0))
    for mb in bc['manh_bo']:
        d.rectangle(mb['khung_bao'], outline=(255, 0, 255), width=2)
    im.save(path)


def gif_hang(h, path, ms, nen=(40, 44, 52)):
    """GIF căn chân, KHÔNG đổi cỡ (1 điểm ảnh nguồn = 1 điểm ảnh GIF) → không nhoè. Giữ vị trí ngang theo chân."""
    ks = h['khung']
    trai = max(f['chan'][0] - f['khung_bao'][0] for f in ks)
    phai = max(f['khung_bao'][2] - f['chan'][0] for f in ks)
    cao = max(f['cao'] for f in ks)
    Wc, Hc = int(trai + phai) + 16, cao + 16
    anh = []
    for f in ks:
        c = Image.new('RGBA', (Wc, Hc), nen + (255,))
        ImageDraw.Draw(c).line([0, Hc - 8, Wc, Hc - 8], fill=(90, 96, 110))
        x = round(8 + trai - (f['chan'][0] - f['khung_bao'][0]))
        c.alpha_composite(f['img'], (x, Hc - 8 - f['cao']))
        anh.append(c.convert('RGB'))
    anh[0].save(path, save_all=True, append_images=anh[1:], duration=ms, loop=0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('anh')
    ap.add_argument('--hang', type=int, default=1)
    ap.add_argument('--so', type=int, default=8, help='số khung mỗi hàng (bắt buộc đúng; không tự ép)')
    ap.add_argument('--ten', default='')
    ap.add_argument('--ms', default='90')
    ap.add_argument('--ra', default=None)
    ap.add_argument('--che-do', default='chinh-thuc', choices=['chinh-thuc', 'phuc-hoi'])
    ap.add_argument('--cat-tay', default=None, help='JSON cắt tay: {"1": [[x0,y0,x1,y1], ...]}')
    a = ap.parse_args()
    ten = [t for t in a.ten.split(',') if t]
    ms = [int(x) for x in a.ms.split(',')]
    ra = a.ra or os.path.splitext(a.anh)[0] + '-cat'
    os.makedirs(ra, exist_ok=True)
    cat_tay = json.load(open(a.cat_tay, encoding='utf-8')) if a.cat_tay else None
    bc = tach_sheet(a.anh, a.hang, a.so, ten, a.che_do, cat_tay)
    ve_debug(bc, os.path.join(ra, 'debug.png'))
    ph = a.che_do == 'phuc-hoi'
    if bc['dat'] or ph:
        for r, h in enumerate(bc['hang']):
            if not h['khung']:
                continue
            d = os.path.join(ra, h['ten'] + ('-PHUC-HOI' if ph else ''))
            os.makedirs(d, exist_ok=True)
            for cu in os.listdir(d):  # bỏ khung của lần chạy trước để không lẫn
                if cu.startswith('khung-') and cu.endswith('.png'):
                    os.remove(os.path.join(d, cu))
            for f in h['khung']:
                f['img'].save(os.path.join(d, 'khung-%02d%s.png' % (f['stt'], '-SUY-DOAN' if f['nguon'] == 'suy-doan' else '')))
            gif_hang(h, os.path.join(ra, '%d-%s%s.gif' % (r + 1, h['ten'], '-PHUC-HOI' if ph else '')), ms[r] if r < len(ms) else ms[-1])
    json.dump(bao_cao_json(bc), open(os.path.join(ra, 'bao-cao.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for r, h in enumerate(bc['hang']):
        print('Hàng %d %-6s: %d khung' % (r + 1, h['ten'], h['so_khung']))
    for x in bc['loi']:
        print('LỖI:', x)
    for x in bc['canh_bao']:
        print('CẢNH BÁO:', x)
    if bc['suy_doan']:
        print('KHUNG SUY ĐOÁN (hàng, khung):', bc['suy_doan'])
    if not bc['dat'] and not ph:
        print('→ KHÔNG xuất khung/GIF chính thức. Xem', os.path.join(ra, 'debug.png'), 'và bao-cao.json')
        raise SystemExit(1)
    if ph and (bc['loi'] or bc['suy_doan']):
        print('→ Đã xuất bản PHỤC HỒI (không phải chính thức).')
        raise SystemExit(2)
    print('→ ĐẠT. Đã ghi', ra)


if __name__ == '__main__':
    main()
