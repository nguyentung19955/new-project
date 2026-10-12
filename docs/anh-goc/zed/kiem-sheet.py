#!/usr/bin/env python3
"""KIỂM TẤM SPRITE AI (Linh Khí, hệ ghép lớp) — ra ĐẠT / LỖI, GIF từng hàng, ảnh tổng, số đo thật.

Dùng:
  python3 kiem-sheet.py <anh.png> --cot 8 --hang 3 [--ten dung,di,chay] [--giay 1.2,0.9,0.6]
                        [--loai than|lop|vu-khi|dan] [--chuan zed-canonical.png] [--theo do-dac.json] [--ra thu-muc]

Làm gì (theo docs/review/ke-hoach-cai-thien/zed-asset/LINH_KHI_MODULAR_SPRITE_SPEC.md mục 9):
  1. Tìm nền #00FF00, dò đường kẻ lưới (nếu có) để lấy ô; không có lưới thì dò khe trống giữa các hình.
  2. Mỗi ô: tách nền bằng LOANG TỪ MÉP ô (flood fill) + xoá điểm xanh thuần còn kẹt, khử viền xanh (despill).
  3. Kiểm: số hàng/cột, hình chạm mép ô, mảnh lạ / nghi có chữ, lệch cỡ người, lệch vị trí chân, lệch bảng màu so với canonical.
  4. Ra: ket-qua.txt (ĐẠT/LỖI từng mục), do-dac.json (số đo thật: ô, khung bao, chân, tỉ lệ), tong-quan.jpg,
     GIF từng hàng (giữ vị trí ngang trong ô, đúng tốc độ game), sheet-sach.png (--sach: nền trong, ô đều),
     sheet-game.png (khung 48×48 logic, net 2 = 96×96 điểm ảnh, chân tại goc [24,45]).
Chỉ đọc ảnh, không sửa ảnh gốc. Không tự coi ảnh là đạt chuẩn production: ĐẠT ở đây = qua kiểm tự động (VALIDATED cần thêm người xem).
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

# ---------- thông số game (đọc từ game/art/custom/em-be-*.sprite.json và sprite_custom.js) ----------
KHUNG, NET, GOC = 48, 2, (24, 45)      # khung logic 48×48, ảnh gấp 2, chân tại (24,45)
CAO_GAME = 31                           # chiều cao người Zed đứng (điểm ảnh logic) khi về cỡ game; Cu Tí cũ cao 29, Zed đầu to hơn chút

# Ngưỡng kiểm (giải thích ở SPEC mục 9)
LECH_CO = 0.08        # cỡ người lệch trung vị của hàng quá 8% → cảnh báo; quá 15% → lỗi
LECH_CHAN = 0.035     # đáy chân lệch đường đất của hàng quá 3,5% chiều cao ô → cảnh báo
SAT_MEP = 2           # hình cách mép ô ≤ 2 điểm ảnh = chạm mép
MAU_XA = 70           # khoảng cách màu tới bảng màu canonical (RGB, tổng tuyệt đối) coi là "lạ"
MAU_LA_TOI_DA = 0.22  # quá 22% điểm ảnh người có màu lạ → lỗi màu (chỉ với loai than)


def mat_nen(a, manh=True):
    """Điểm ảnh màu nền xanh. manh: xanh thuần chắc chắn là nền; yếu: viền pha xanh (chỉ xoá khi nối với nền)."""
    r, g, b = a[..., 0].astype(np.int16), a[..., 1].astype(np.int16), a[..., 2].astype(np.int16)
    m = np.maximum(r, b)
    if manh:
        return (g > 150) & (g - m > 80)
    return (g > 90) & (g - m > 35)


def do_luoi(a, nen):
    """Đường kẻ lưới: cột/hàng gần như không có nền (≥ 85% không phải nền), mảnh (≤ 4 điểm ảnh), cách mép > 1%."""
    H, W = nen.shape
    ra = {}
    for truc, n, frac in (('x', W, 1 - nen.mean(0)), ('y', H, 1 - nen.mean(1))):
        idx = [i for i in range(n) if frac[i] > 0.85]
        nhom, cur = [], []
        for i in idx:
            if cur and i != cur[-1] + 1:
                nhom.append(cur); cur = []
            cur.append(i)
        if cur:
            nhom.append(cur)
        ra[truc] = [(g[0], g[-1]) for g in nhom if len(g) <= 4]
    return ra


def chia_o(n_o, n_px, luoi, fg_proj):
    """Ranh giới n_o ô theo một trục. Ưu tiên đường lưới; không có thì khe trống gần chỗ chia đều nhất."""
    bien = [(0, 0)]
    trong = [l for l in luoi if l[0] > n_px * 0.01 and l[1] < n_px * 0.99]
    ghi = 'lưới'
    if len(trong) == n_o - 1:
        for l in trong:
            bien.append((l[0], l[1] + 1))
    else:
        ghi = 'chia đều' if not trong else 'lưới lệch số ô (%d đường, cần %d) → dò khe' % (len(trong), n_o - 1)
        for k in range(1, n_o):
            x0 = round(k * n_px / n_o)
            w = max(4, n_px // (n_o * 4))
            lo, hi = max(1, x0 - w), min(n_px - 1, x0 + w)
            seg = fg_proj[lo:hi]
            j = x0
            if len(seg):
                # khe trống = dải có ít hình nhất; chọn dải gần chỗ chia đều nhất, cắt ở GIỮA dải
                mn = seg.min()
                idx = np.nonzero(seg == mn)[0] + lo
                runs, cur = [], [idx[0]]
                for v in idx[1:]:
                    if v == cur[-1] + 1:
                        cur.append(v)
                    else:
                        runs.append(cur); cur = [v]
                runs.append(cur)
                best = min(runs, key=lambda rr: abs((rr[0] + rr[-1]) / 2 - x0))
                j = int(round((best[0] + best[-1]) / 2))
            if fg_proj[j] > 0:
                ghi += '; ranh %d có hình đè qua' % k
            bien.append((j, j + 1))
    bien.append((n_px, n_px))
    # đường viền lưới sát mép ảnh: ô đầu bắt đầu sau nó, ô cuối kết thúc trước nó
    dau = [l for l in luoi if l[0] <= 1]
    cuoi = [l for l in luoi if l[1] >= n_px - 2]
    if dau:
        bien[0] = (0, dau[0][1] + 1)
    if cuoi:
        bien[-1] = (cuoi[-1][0], n_px)
    o = []
    for k in range(n_o):
        s = bien[k][1]
        e = bien[k + 1][0]
        o.append((s, e))
    return o, ghi


def tach_o(a):
    """Tách nền một ô: loang từ mép qua vùng xanh (mạnh + viền pha xanh), xoá xanh thuần còn kẹt, khử viền xanh."""
    nen_manh = mat_nen(a, True)
    nen_yeu = mat_nen(a, False) | nen_manh
    nhan, n = ndimage.label(nen_yeu)
    mep = set(np.unique(np.concatenate([nhan[0], nhan[-1], nhan[:, 0], nhan[:, -1]]))) - {0}
    nen = np.isin(nhan, list(mep)) | nen_manh
    fg = ~nen
    out = np.zeros(a.shape[:2] + (4,), np.uint8)
    out[..., :3] = a
    out[..., 3] = np.where(fg, 255, 0)
    # khử viền xanh: điểm người sát nền mà G trội → hạ G về max(R,B)
    sat = fg & ndimage.binary_dilation(nen, iterations=2)
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    tro = sat & (g > np.maximum(r, b) + 12)
    out[..., 1] = np.where(tro, np.maximum(r, b), out[..., 1])
    return out, int(tro.sum()), int((nen_manh & ~np.isin(nhan, list(mep))).sum())


def manh(out, lo_dt):
    """Giữ mảng chính (và mảng to gần nó). Trả về ảnh đã bỏ mảnh lạc + danh sách mảnh nhỏ (nghi chữ / vụn)."""
    m = out[..., 3] > 0
    if not m.any():
        return out, [], None
    nhan, n = ndimage.label(m, structure=np.ones((3, 3)))
    co = ndimage.sum(m, nhan, range(1, n + 1))
    lon = int(np.argmax(co)) + 1
    gan = ndimage.binary_dilation(nhan == lon, iterations=lo_dt)
    giu = np.zeros_like(m)
    vun = []
    sl = ndimage.find_objects(nhan)
    for i in range(1, n + 1):
        cm = nhan == i
        if i == lon or co[i - 1] >= co[lon - 1] * 0.15 or (gan & cm).any():
            giu |= cm
        else:
            ys, xs = sl[i - 1]
            vun.append({'x': xs.start, 'y': ys.start, 'w': xs.stop - xs.start, 'h': ys.stop - ys.start, 'dt': int(co[i - 1])})
    o2 = out.copy()
    o2[..., 3] = np.where(giu, o2[..., 3], 0)
    return o2, vun, giu


def nghi_chu(vun):
    """≥ 3 mảnh nhỏ cùng cỡ xếp thành dòng ngang → nghi có chữ / số khung."""
    nho = [v for v in vun if 4 <= v['dt'] <= 900 and v['h'] <= 40]
    for v in nho:
        cung = [u for u in nho if abs((u['y'] + u['h'] / 2) - (v['y'] + v['h'] / 2)) <= 6 and 0.5 <= (u['h'] + 1) / (v['h'] + 1) <= 2]
        if len(cung) >= 3:
            return True
    return False


def bang_mau(px, k=24):
    """Bảng màu gọn của các điểm ảnh người (lượng tử hoá)."""
    if len(px) == 0:
        return np.zeros((0, 3))
    if len(px) > 60000:
        px = px[np.random.RandomState(1).choice(len(px), 60000, replace=False)]
    im = Image.fromarray(px.reshape(1, -1, 3).astype(np.uint8)).quantize(k, method=Image.Quantize.MEDIANCUT)
    p = np.array(im.getpalette()[:k * 3]).reshape(-1, 3)
    return p


def ti_le_mau_la(px, pal):
    if len(px) == 0 or len(pal) == 0:
        return 0.0
    if len(px) > 40000:
        px = px[np.random.RandomState(2).choice(len(px), 40000, replace=False)]
    d = np.abs(px[:, None, :].astype(int) - pal[None, :, :].astype(int)).sum(2).min(1)
    return float((d > MAU_XA).mean())


def doc_ten(s, n, mac):
    v = [t.strip() for t in s.split(',')] if s else []
    return [v[i] if i < len(v) and v[i] else mac(i) for i in range(n)]


def kiem(path, cot, hang, ten, giay, loai, chuan=None, theo=None):
    im = Image.open(path).convert('RGB')
    a = np.array(im)
    H, W = a.shape[:2]
    nen = mat_nen(a, True)
    luoi = do_luoi(a, nen)
    fg_all = ~mat_nen(a, False) & ~nen
    oc, ghi_x = chia_o(cot, W, luoi['x'], fg_all.sum(0))
    oh, ghi_y = chia_o(hang, H, luoi['y'], fg_all.sum(1))
    loi, canh = [], []
    # lớp đồ sửa từ chính ảnh thân (cùng cỡ ảnh, cùng số ô) → dùng đúng cách chia ô của thân để khung khớp nhau
    if theo and os.path.isfile(theo):
        t0 = json.load(open(theo, encoding='utf-8'))
        if t0.get('co_anh') == [W, H] and t0.get('cot') == cot and t0.get('hang') == hang:
            oc, oh = [tuple(x) for x in t0['chia_cot']], [tuple(x) for x in t0['chia_hang']]
            ghi_x = ghi_y = 'lưới'
            canh.append('Chia ô theo ảnh thân ' + os.path.basename(theo) + ' (cùng cỡ ảnh)')
        else:
            canh.append('Ảnh khác cỡ/số ô so với thân (%s): chia ô riêng — kiểm kỹ khớp khung trên trang ghép' % os.path.basename(theo))
    nen_le = float(nen.mean())
    if nen_le < 0.35:
        loi.append('Nền xanh #00FF00 chỉ chiếm %.0f%% ảnh — nền không phải xanh thuần, hoặc hình quá to' % (nen_le * 100))
    if luoi['x'] or luoi['y']:
        canh.append('Ảnh nguồn CÓ ĐƯỜNG KẺ LƯỚI (%d dọc, %d ngang) — đã dùng để chia ô và đã bỏ khi tách; ảnh mới nên KHÔNG kẻ lưới' % (len(luoi['x']), len(luoi['y'])))
    for g in (ghi_x, ghi_y):
        if 'hình đè' in g:
            loi.append('Ranh giới ô: ' + g)
        elif g not in ('lưới', 'chia đều'):
            canh.append('Ranh giới ô: ' + g)
    cw = [e - s for s, e in oc]
    ch = [e - s for s, e in oh]
    if max(cw) - min(cw) > max(3, 0.03 * np.mean(cw)) or max(ch) - min(ch) > max(3, 0.03 * np.mean(ch)):
        canh.append('Ô không đều: rộng %d–%d, cao %d–%d điểm ảnh (đã chuẩn hoá về ô đều khi xuất)' % (min(cw), max(cw), min(ch), max(ch)))

    khung = []   # [hàng][cột] -> dict
    cat = []     # ảnh từng ô sau tách
    for r, (y0, y1) in enumerate(oh):
        hk, hc = [], []
        for c, (x0, x1) in enumerate(oc):
            o = a[y0:y1, x0:x1]
            # bỏ 2 điểm ảnh sát ranh (dư nét lưới)
            out, despill, ket = tach_o(o)
            out, vun, giu = manh(out, max(3, min(o.shape[:2]) // 60))
            m = out[..., 3] > 0
            k = {'hang': r, 'cot': c, 'o': [x0, y0, x1 - x0, y1 - y0], 'trong': not m.any(), 'vun': len(vun),
                 'khu_vien_xanh': despill, 'xanh_ket_trong': ket}
            if m.any():
                ys, xs = np.nonzero(m)
                bx0, bx1, by0, by1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
                day = m[max(by0, by1 - max(2, (by1 - by0) // 16)):by1]
                dx = np.nonzero(day.any(0))[0]
                k.update({'bao': [bx0, by0, bx1 - bx0, by1 - by0], 'cao': by1 - by0, 'rong': bx1 - bx0, 'day': by1,
                          'chan_x': float((dx.min() + dx.max() + 1) / 2) if len(dx) else (bx0 + bx1) / 2,
                          'giua_x': float((bx0 + bx1) / 2),
                          # tâm thân: trọng tâm cột của dải 50–80% chiều cao người (hông, bụng) — dùng làm neo ngang (không bị khăn/tóc kéo lệch)
                          'than_x': float(np.nonzero(m[by0 + (by1 - by0) // 2: by0 + (by1 - by0) * 4 // 5])[1].mean()) if (by1 - by0) > 4 else float((bx0 + bx1) / 2)})
                cham = []
                hh, ww = m.shape
                if bx0 <= SAT_MEP: cham.append('trái')
                if bx1 >= ww - SAT_MEP: cham.append('phải')
                if by0 <= SAT_MEP: cham.append('trên')
                if by1 >= hh - SAT_MEP: cham.append('dưới')
                k['cham'] = cham
                k['nghi_chu'] = nghi_chu(vun)
            hk.append(k); hc.append(out)
        khung.append(hk); cat.append(hc)

    # ---------- kiểm từng hàng ----------
    so_khung_hang = []
    for r in range(hang):
        ds = [k for k in khung[r] if not k['trong']]
        so_khung_hang.append(len(ds))
        if not ds:
            loi.append('Hàng %d (%s): trống' % (r + 1, ten[r])); continue
        if len(ds) < cot and loai != 'dan':
            # ô trống ở cuối hàng có thể là cố ý (combo ít khung hơn số cột) → chỉ cảnh báo
            canh.append('Hàng %d (%s): %d/%d ô có hình (ô trống: %s)' % (r + 1, ten[r], len(ds), cot, ', '.join(str(k['cot'] + 1) for k in khung[r] if k['trong'])))
        for k in ds:
            if k['cham']:
                loi.append('Hàng %d ô %d: hình CHẠM MÉP ô (%s) — có thể bị cắt' % (r + 1, k['cot'] + 1, ', '.join(k['cham'])))
            if k['nghi_chu']:
                loi.append('Hàng %d ô %d: NGHI CÓ CHỮ / SỐ (nhiều mảnh nhỏ xếp hàng ngang)' % (r + 1, k['cot'] + 1))
            elif k['vun'] >= 4:
                canh.append('Hàng %d ô %d: %d mảnh vụn lạc (đã bỏ khi tách)' % (r + 1, k['cot'] + 1, k['vun']))
            if k['xanh_ket_trong'] > 40:
                canh.append('Hàng %d ô %d: %d điểm xanh thuần kẹt trong hình (đã xoá; xem lại kẽ tay/chân)' % (r + 1, k['cot'] + 1, k['xanh_ket_trong']))
        if loai == 'than':
            cao = np.array([k['cao'] for k in ds], float)
            med = float(np.median(cao))
            for k in ds:
                d = abs(k['cao'] - med) / med
                if d > 0.15:
                    loi.append('Hàng %d ô %d: cỡ người lệch %.0f%% so với cả hàng (cao %d, trung vị %.0f)' % (r + 1, k['cot'] + 1, d * 100, k['cao'], med))
                elif d > LECH_CO:
                    canh.append('Hàng %d ô %d: cỡ người lệch %.0f%%' % (r + 1, k['cot'] + 1, d * 100))
            chh = np.mean([k['o'][3] for k in ds])
            dat = float(np.percentile([k['day'] for k in ds], 90))
            for k in ds:
                if (dat - k['day']) / chh > LECH_CHAN and not ten[r].startswith(('chay', 'run', 'lon', 'ne', 'chet', 'die')):
                    canh.append('Hàng %d ô %d: chân cao hơn đường đất %d điểm ảnh (người "bay" / nhảy)' % (r + 1, k['cot'] + 1, round(dat - k['day'])))

    # ---------- so với canonical ----------
    so_sanh = None
    if chuan and loai == 'than':
        ca = np.array(Image.open(chuan).convert('RGB'))
        cn = mat_nen(ca, True)
        cl = do_luoi(ca, cn)
        cfg = ~mat_nen(ca, False) & ~cn
        coc, _ = chia_o(8, ca.shape[1], cl['x'], cfg.sum(0))
        coh, _ = chia_o(3, ca.shape[0], cl['y'], cfg.sum(1))
        px_c, cao_c = [], []
        for c, (x0, x1) in enumerate(coc):
            y0, y1 = coh[0]
            o, _, _ = tach_o(ca[y0:y1, x0:x1])
            o, _, _ = manh(o, 4)
            mm = o[..., 3] > 0
            px_c.append(o[..., :3][mm])
            ys = np.nonzero(mm)[0]
            cao_c.append((ys.max() - ys.min() + 1) / (y1 - y0))
        pal = bang_mau(np.concatenate(px_c))
        px = np.concatenate([cat[r][c][..., :3][cat[r][c][..., 3] > 0] for r in range(hang) for c in range(cot) if not khung[r][c]['trong']] or [np.zeros((0, 3))])
        la = ti_le_mau_la(px, pal)
        so_sanh = {'mau_la': round(la, 3), 'cao_tren_o_canonical': round(float(np.median(cao_c)), 3)}
        if la > MAU_LA_TOI_DA:
            loi.append('Bảng màu LỆCH canonical: %.0f%% điểm ảnh người có màu không có trong Zed gốc' % (la * 100))
        elif la > MAU_LA_TOI_DA / 2:
            canh.append('Bảng màu hơi lệch canonical: %.0f%% điểm ảnh màu lạ' % (la * 100))
        r0 = [k for k in khung[0] if not k['trong']]
        if r0 and ten[0].startswith(('dung', 'idle')):
            tl = float(np.median([k['cao'] / k['o'][3] for k in r0]))
            so_sanh['cao_tren_o'] = round(tl, 3)
            if abs(tl - so_sanh['cao_tren_o_canonical']) / so_sanh['cao_tren_o_canonical'] > 0.12:
                canh.append('Cỡ người so với ô khác canonical %.0f%% (canonical %.2f, ảnh này %.2f) — kiểm lại khi ghép' % (abs(tl / so_sanh['cao_tren_o_canonical'] - 1) * 100, so_sanh['cao_tren_o_canonical'], tl))

    # ---------- tỉ lệ về cỡ game + đường đất mỗi hàng ----------
    ti_le, nguon_tl = None, ''
    if theo and os.path.isfile(theo):
        t = json.load(open(theo, encoding='utf-8'))
        ti_le, nguon_tl = t.get('ti_le_game'), 'theo ' + os.path.basename(theo)
    if ti_le is None and loai == 'than':
        r0 = [k for k in khung[0] if not k['trong']]
        if r0:
            ti_le = CAO_GAME * NET / float(np.median([k['cao'] for k in r0]))
            nguon_tl = 'chiều cao trung vị hàng 1 → %d điểm ảnh logic' % CAO_GAME
    hang_dat = []
    for r in range(hang):
        ds = [k for k in khung[r] if not k['trong']]
        if loai == 'than' and ds:
            hang_dat.append(float(np.percentile([k['day'] for k in ds], 90)))
        elif theo and os.path.isfile(theo):
            t = json.load(open(theo, encoding='utf-8'))
            hd = t.get('dat_tren_o') or []
            hang_dat.append((hd[r] if r < len(hd) else (hd[-1] if hd else 0.9)) * (oh[r][1] - oh[r][0]))
        else:
            hang_dat.append(0.92 * (oh[r][1] - oh[r][0]))

    # neo ngang mỗi hàng = trung vị tâm thân (điểm ảnh trong ô); lớp đồ / vũ khí lấy theo thân gốc
    hang_x = []
    t_theo = json.load(open(theo, encoding='utf-8')) if theo and os.path.isfile(theo) else None
    for r in range(hang):
        ds = [k for k in khung[r] if not k['trong']]
        cwr = np.mean([k['o'][2] for k in khung[r]])
        if loai == 'than' and ds:
            hang_x.append(float(np.median([k['than_x'] for k in ds])))
        elif t_theo and t_theo.get('neo_x_tren_o'):
            hx = t_theo['neo_x_tren_o']
            hang_x.append((hx[r] if r < len(hx) else hx[-1]) * cwr)
        else:
            hang_x.append(cwr / 2)
    if loai == 'than' and hang > 1:
        lech = [hang_x[r] / np.mean([k['o'][2] for k in khung[r]]) for r in range(hang)]
        if max(lech) - min(lech) > 0.05:
            canh.append('Tâm thân lệch ngang giữa các hàng (%s phần bề ngang ô) — đã bù bằng neo riêng từng hàng khi xuất cỡ game' % ', '.join('%.2f' % v for v in lech))

    # ---------- kết luận ----------
    dat = not loi
    tt = 'ĐẠT kiểm tự động (chờ người xem → VALIDATED)' if dat else 'LỖI (giữ GENERATED, sửa hoặc gen lại)'
    return {
        'anh': os.path.basename(path), 'co_anh': [W, H], 'cot': cot, 'hang': hang, 'loai': loai, 'ten': ten, 'giay': giay,
        'luoi': luoi, 'chia_cot': oc, 'chia_hang': oh, 'so_khung_hang': so_khung_hang,
        'ti_le_game': ti_le, 'nguon_ti_le': nguon_tl, 'dat_hang_px': hang_dat,
        'dat_tren_o': [hang_dat[r] / (oh[r][1] - oh[r][0]) for r in range(hang)],
        'neo_x_px': hang_x, 'neo_x_tren_o': [hang_x[r] / np.mean([k['o'][2] for k in khung[r]]) for r in range(hang)],
        'so_sanh_canonical': so_sanh, 'loi': loi, 'canh_bao': canh, 'ket_luan': tt, 'dat': dat, 'khung': khung,
    }, cat


def xuat(kq, cat, ra, ghi_sach=False):
    os.makedirs(ra, exist_ok=True)
    cot, hang = kq['cot'], kq['hang']
    cw = max(e - s for s, e in kq['chia_cot'])
    ch = max(e - s for s, e in kq['chia_hang'])
    # sheet sạch: ô đều cw×ch, mỗi ô giữ nguyên vị trí trong ô, căn đáy ô
    sach = Image.new('RGBA', (cw * cot, ch * hang), (0, 0, 0, 0))
    tong = Image.new('RGBA', (cw * cot, ch * hang), (40, 44, 52, 255))
    for r in range(hang):
        for c in range(cot):
            o = Image.fromarray(cat[r][c])
            ox, oy = c * cw, r * ch + (ch - o.size[1])
            sach.alpha_composite(o, (ox, oy))
            tong.alpha_composite(o, (ox, oy))
    if ghi_sach:
        sach.save(os.path.join(ra, 'sheet-sach.png'))
    d = ImageDraw.Draw(tong)
    for r in range(hang):
        for c in range(cot):
            k = kq['khung'][r][c]
            ox, oy = c * cw, r * ch + (ch - k['o'][3])
            xau = k.get('cham') or k.get('nghi_chu')
            d.rectangle([c * cw, r * ch, (c + 1) * cw - 1, (r + 1) * ch - 1], outline=(220, 70, 70) if xau else (70, 180, 90), width=2)
            if not k['trong']:
                bx, by, bw, bh = k['bao']
                d.rectangle([ox + bx, oy + by, ox + bx + bw, oy + by + bh], outline=(255, 210, 90))
                fx, fy = ox + k['chan_x'], oy + k['day']
                d.line([fx - 8, fy, fx + 8, fy], fill=(90, 200, 255), width=2)
                d.line([fx, fy - 8, fx, fy + 2], fill=(90, 200, 255), width=2)
        yd = r * ch + (ch - kq['chia_hang'][r][1] + kq['chia_hang'][r][0]) + kq['dat_hang_px'][r]
        d.line([0, yd, cw * cot, yd], fill=(120, 130, 150), width=1)
    tong.convert('RGB').save(os.path.join(ra, 'tong-quan.jpg'), quality=88)

    # sheet cỡ game: mỗi ô 96×96 (48 logic × net 2), chân/đường đất hàng tại goc, giữ lệch ngang so với giữa ô
    s = kq['ti_le_game']
    if s:
        F = KHUNG * NET
        game = Image.new('RGBA', (F * cot, F * hang), (0, 0, 0, 0))
        tran = []
        for r in range(hang):
            for c in range(cot):
                k = kq['khung'][r][c]
                if k['trong']:
                    continue
                o = Image.fromarray(cat[r][c])
                ow, oh_ = o.size
                nho = o.resize((max(1, round(ow * s)), max(1, round(oh_ * s))), Image.BOX)
                # điểm (neo ngang của hàng = tâm thân đo được, đường đất hàng) → goc
                gx = kq['neo_x_px'][r] * s
                gy = kq['dat_hang_px'][r] * s
                px, py = round(GOC[0] * NET - gx), round(GOC[1] * NET - gy)
                tam = Image.new('RGBA', (F, F), (0, 0, 0, 0))
                tam.paste(nho, (px, py), nho)
                # điểm ảnh rơi ra ngoài ô 96×96 → tràn khung game
                bb = Image.fromarray(np.array(nho)[..., 3]).getbbox()
                if bb and (px + bb[0] < 0 or py + bb[1] < 0 or px + bb[2] > F or py + bb[3] > F):
                    tran.append('h%d ô %d' % (r + 1, c + 1))
                game.alpha_composite(tam, (c * F, r * F))
        game.save(os.path.join(ra, 'sheet-game.png'))
        kq['tran_khung_game'] = tran
        if tran and kq['loai'] == 'than':
            kq['canh_bao'].append('Về cỡ game (48×48, chân tại 24,45), %d khung TRÀN khung: %s — cần khung rộng hơn cho hàng này' % (len(tran), ', '.join(tran[:8])))

    # GIF từng hàng: nền xám như game, vạch đất cố định, cùng một tỉ lệ cho cả hàng, giữ vị trí ngang trong ô
    S = 256
    for r in range(hang):
        ds = [(Image.fromarray(cat[r][c]), kq['khung'][r][c]) for c in range(cot) if not kq['khung'][r][c]['trong']]
        if not ds:
            continue
        ohh = kq['chia_hang'][r][1] - kq['chia_hang'][r][0]
        sc = min(S * 0.85 / ohh, S * 0.95 / max(o.size[0] for o, _ in ds))
        dat = round(S * 0.9)
        anh = []
        for o, k in ds:
            nho = o.resize((max(1, round(o.size[0] * sc)), max(1, round(o.size[1] * sc))), Image.NEAREST)
            bg = Image.new('RGBA', (S, S), (40, 44, 52, 255))
            ImageDraw.Draw(bg).line([0, dat, S, dat], fill=(90, 96, 110))
            x = round(S / 2 - kq['neo_x_px'][r] * sc)
            y = round(dat - kq['dat_hang_px'][r] * sc)
            tam = Image.new('RGBA', (S, S), (0, 0, 0, 0))
            tam.paste(nho, (x, y), nho)
            bg.alpha_composite(tam)
            anh.append(bg.convert('RGB'))
        ms = max(20, round(kq['giay'][r] * 1000 / len(anh)))
        p = os.path.join(ra, '%d-%s.gif' % (r + 1, kq['ten'][r]))
        anh[0].save(p, save_all=True, append_images=anh[1:], duration=ms, loop=0)

    # số đo + kết quả
    with open(os.path.join(ra, 'do-dac.json'), 'w', encoding='utf-8') as f:
        json.dump(kq, f, ensure_ascii=False, indent=1, default=lambda v: v.tolist() if hasattr(v, 'tolist') else str(v))
    dong = ['KIỂM TẤM: %s  (%d×%d điểm ảnh, %d cột × %d hàng, loại: %s)' % (kq['anh'], kq['co_anh'][0], kq['co_anh'][1], kq['cot'], kq['hang'], kq['loai']),
            'KẾT LUẬN: ' + kq['ket_luan'], '']
    dong.append('LỖI (%d):' % len(kq['loi']))
    dong += ['  - ' + x for x in kq['loi']] or ['  (không)']
    dong.append('CẢNH BÁO (%d):' % len(kq['canh_bao']))
    dong += ['  - ' + x for x in kq['canh_bao']] or ['  (không)']
    dong.append('')
    dong.append('SỐ ĐO:')
    dong.append('  Ô cột (điểm ảnh): ' + ', '.join('%d–%d' % t for t in kq['chia_cot']))
    dong.append('  Ô hàng (điểm ảnh): ' + ', '.join('%d–%d' % t for t in kq['chia_hang']))
    for r in range(kq['hang']):
        ds = [k for k in kq['khung'][r] if not k['trong']]
        if not ds:
            continue
        dong.append('  Hàng %d %-8s: %d khung, %d ms/khung, cao người %d–%d (trung vị %d), rộng %d–%d, đường đất y=%.0f (%.1f%% chiều cao ô)' % (
            r + 1, kq['ten'][r], len(ds), round(kq['giay'][r] * 1000 / len(ds)), min(k['cao'] for k in ds), max(k['cao'] for k in ds),
            np.median([k['cao'] for k in ds]), min(k['rong'] for k in ds), max(k['rong'] for k in ds), kq['dat_hang_px'][r], kq['dat_tren_o'][r] * 100))
        dong.append('     neo ngang (tâm thân trung vị) x=%.0f trong ô (%.1f%% bề ngang); tâm thân từng khung lệch neo: %s' % (
            kq['neo_x_px'][r], kq['neo_x_tren_o'][r] * 100, ' '.join('%+d' % round(k['than_x'] - kq['neo_x_px'][r]) for k in ds)))
    if kq['ti_le_game']:
        dong.append('  Tỉ lệ về cỡ game: %.4f (%s) → khung 48×48 logic, net 2, chân tại (24,45)' % (kq['ti_le_game'], kq['nguon_ti_le']))
    if kq.get('so_sanh_canonical'):
        dong.append('  So canonical: ' + json.dumps(kq['so_sanh_canonical'], ensure_ascii=False))
    dong.append('')
    dong.append('TỆP RA: tong-quan.jpg (khung xanh = ổn, đỏ = lỗi; vàng = khung bao; xanh dương = chân), GIF từng hàng, sheet-game.png, do-dac.json (+ sheet-sach.png nếu chạy --sach)')
    dong.append('NHỚ: máy không thấy được tay cầm sai, vũ khí xuyên người, đồ trôi khỏi người, động tác giật → xem GIF theo checklist ở SPEC mục 9.3.')
    txt = '\n'.join(dong) + '\n'
    with open(os.path.join(ra, 'ket-qua.txt'), 'w', encoding='utf-8') as f:
        f.write(txt)
    return txt


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('anh')
    ap.add_argument('--cot', type=int, default=8)
    ap.add_argument('--hang', type=int, default=3)
    ap.add_argument('--ten', default='', help='tên hàng, cách nhau dấu phẩy (vd dung,di,chay)')
    ap.add_argument('--giay', default='', help='thời lượng một vòng mỗi hàng (giây), vd 1.2,0.9,0.6')
    ap.add_argument('--loai', default='than', choices=['than', 'lop', 'vu-khi', 'dan'])
    ap.add_argument('--chuan', default=None, help='ảnh canonical để so bảng màu và cỡ (chỉ loai than)')
    ap.add_argument('--theo', default=None, help='do-dac.json của thân gốc: lấy tỉ lệ game và đường đất (cho lớp đồ / vũ khí)')
    ap.add_argument('--ra', default=None)
    ap.add_argument('--sach', action='store_true', help='ghi thêm sheet-sach.png (nền trong, cỡ gốc, ô đều)')
    a = ap.parse_args()
    ten = doc_ten(a.ten, a.hang, lambda i: 'hang-%d' % (i + 1))
    gv = [float(x) for x in a.giay.split(',')] if a.giay else []
    giay = [gv[i] if i < len(gv) else (gv[-1] if gv else 0.8) for i in range(a.hang)]
    kq, cat = kiem(a.anh, a.cot, a.hang, ten, giay, a.loai, a.chuan, a.theo)
    ra = a.ra or os.path.splitext(a.anh)[0] + '-kiem'
    print(xuat(kq, cat, ra, a.sach))
    sys.exit(0 if kq['dat'] else 1)


if __name__ == '__main__':
    main()
