#!/usr/bin/env python3
"""Thu sprite sheet ChatGPT (jump / fall / combo) về khung pixel cỡ Lam cao 64, ô 80×80 (hoặc rộng hơn), pivot [W/2, H−1].
Dùng lại các bước của tools/chatgpt-sheet-to-px.py (thu đa số khối / nearest, khoá 12 màu, 3+2 quy tắc dọn, ổn định thời gian)
– file đó KHÔNG đổi – và thêm những gì sheet Run không cần:

  * tách sheet nhiều HÀNG (combo 3 hàng × 6 khung): thành phần liên thông → chia hàng theo tâm y → sắp cột theo x; --hang-chon lấy 1 hàng.
  * dò mắt mới: 2 cụm kem/vàng nhạt (#F3E6C8-ish) có vành tối quanh (mặt), cỡ theo chiều cao khung; 1 mắt → suy mắt kia theo
    vector mắt trung vị của sheet; 0 mắt → MAT_TAY (toạ độ ghi tay, lặp lại được) hoặc đỉnh mũ + khoảng cách trung vị.
  * tỉ lệ thu: ChatGPT vẽ đầu to/nhỏ khác nhau giữa các sheet nên có 3 cách: "dau" (mắt→đỉnh mũ = 19,5 px như Run 64),
    "cao" (khung chuẩn cao 64) và "hoa" (trung bình nhân hai cách – mặc định). Số liệu cả ba cách ghi trong kiem-tra.json.
  * căn: cột mắt CỐ ĐỊNH (mặc định 48 = Run 64) để không trượt ngang khi đổi animation; khung chống đất (--chong-dat) → đáy
    THÂN (bỏ lưỡi kiếm) = hàng H−1; khung bay → hàng mắt = --hang-mat-bay (mặc định = hàng mắt khung chống đất cuối, hoặc 35).
    KHÔNG dịch cả sprite lên để giả quỹ đạo; KHÔNG scale nhỏ cho vừa ô.
  * xử lý trong ô vuông nội bộ 112 rồi CẮT về W×H (--o-rong W, --o H); pixel rơi ngoài ô (mũi kiếm) đếm và ghi rõ từng khung;
    --xuat-rong N xuất thêm bản ô N×H (vd 96×80) không cắt ngang vào thư mục con rongN/.

Chạy:  python3 tools/chatgpt-anim-to-px.py --sheet art/nhan-vat/lam-chatgpt/jump-sheet-v3.png --so-khung 4 --ra art/nhan-vat/lam-chatgpt/jump64
         --ten jump --fps 10 --chong-dat 0,1 --khung-cao-chuan 1 [--hang 1 --hang-chon 0] [--ty-le-cach hoa] [--o 80 --o-rong 80]
         [--loop] [--hit-frames 2,3] [--xuat-rong 96] [--do-cao 0,-8,-18,-26] [--khong-anh]
Xuất: ten-0..N.png, ten-x4.png (số khung + ms), ten.gif (×4; GIF luôn lặp để xem, kể cả non-loop), so-sanh-goc-x4.png,
      chong-silhouette.png, trong-game-x1.png (480×270, chân đặt ở y = 241 + do-cao[i]) + -x4, lat-check.png, kiem-tra.json.
"""
import argparse, importlib.util, json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
spec = importlib.util.spec_from_file_location('t', os.path.join(HERE, 'chatgpt-sheet-to-px.py')); t = importlib.util.module_from_spec(spec); spec.loader.exec_module(t)
PAL, PAL_RGB, VIEN = t.PAL, t.PAL_RGB, t.VIEN
NEN = (42, 36, 51, 255); FONT = t.FONT
NI = 112                      # ô vuông nội bộ
MAT_DINH_MU = 19.5            # mắt → đỉnh mũ ở Run 64 (94–97 px nguồn × 0,2058)
CAO_CHUAN = 64

# MAT_TAY: {tên sheet (basename): {chỉ số khung toàn sheet (hàng × số khung + cột): (x, y) tâm 2 mắt, toạ độ TUYỆT ĐỐI trên sheet}}
# – chỉ dùng khi dò tự động không ra (mặt bị che). Cách ước lượng: đỉnh mũ + khoảng mắt→đỉnh trung vị của sheet; x = mép trước mũ − 22 px (đo ở khung kề).
MAT_TAY = {'combo-sheet-v1.png': {9: (1073, 435)}}   # đòn 2 F3: cánh tay cầm kiếm che kín mặt


def chu(c):
    try: return ImageFont.truetype(FONT, c)
    except Exception: return ImageFont.load_default()


# ---------------------------------------------------------------- tách khung nhiều hàng
def tach_luoi(a, so_khung, hang, so):
    dac = t.mat_na_dac(a, so); lab, n = ndimage.label(dac); sz = np.bincount(lab.ravel()); sz[0] = 0
    lon = [i for i in range(1, n + 1) if sz[i] >= 0.02 * sz.max()]
    tong = so_khung * hang
    if len(lon) < tong: sys.exit('chỉ thấy %d mảnh lớn, cần %d' % (len(lon), tong))
    if len(lon) > tong:                       # mảnh dư: gộp vào mảnh lớn gần tâm nhất
        chinh = sorted(lon, key=lambda i: -sz[i])[:tong]; tam = {i: np.array(ndimage.center_of_mass(lab == i)) for i in chinh}
        for i in lon:
            if i in chinh: continue
            c = np.array(ndimage.center_of_mass(lab == i)); k = min(chinh, key=lambda j: np.linalg.norm(tam[j] - c)); lab[lab == i] = k
        lon = chinh
    cy = {i: ndimage.center_of_mass(lab == i)[0] for i in lon}
    thu_tu = sorted(lon, key=lambda i: cy[i])
    hangs = [thu_tu[r * so_khung:(r + 1) * so_khung] for r in range(hang)]
    khung = []
    for r, hs in enumerate(hangs):
        hs.sort(key=lambda i: np.where(lab == i)[1].min())
        for i in hs:
            m = lab == i; ys, xs = np.where(m)
            khung.append({'hang': r, 'idx': len(khung), 'mask': m, 'bbox': (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))})
    so['tachKhung'] = 'thành phần liên thông: %d mảnh lớn → %d hàng × %d cột (chia hàng theo tâm y, cột theo mép trái)' % (len(lon), hang, so_khung)
    return khung


# ---------------------------------------------------------------- dò mắt
def cum_sang(a, k, long=False):
    x0, y0, x1, y1 = k['bbox']; H = y1 - y0 + 1
    rgb = a[..., :3].astype(int); R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    if long: cand = (R > 170) & (G > 150) & (B > 90) & (R >= G - 10) & ((R - B) >= 10) & ((R - B) <= 130) & k['mask']
    else: cand = (R > 185) & (G > 165) & (B > 110) & (R >= G - 5) & ((R - B) >= 15) & ((R - B) <= 110) & k['mask']
    lab, n = ndimage.label(cand); sz = np.bincount(lab.ravel()); sz[0] = 0
    toi = (rgb.max(-1) < 70) & k['mask']
    f = (H / 311.0) ** 2; amin, amax = (f * 12, f * 220) if long else (f * 30, f * 150)
    out = []
    for i in range(1, n + 1):
        if sz[i] < amin or sz[i] > amax: continue
        m = lab == i; ys, xs = np.where(m)
        ring = ndimage.binary_dilation(m, iterations=max(2, int(H / 100))) & ~m
        dark = float(toi[ring].mean()) if ring.any() else 0
        if dark < (0.4 if long else 0.55): continue
        out.append((float(xs.mean()), float(ys.mean()), int(sz[i]), dark))
    return out


def ghep_mat(blobs, H):
    best = None; szMax = max([p[2] + q[2] for p in blobs for q in blobs if p is not q] or [1])
    for i in range(len(blobs)):
        for j in range(i + 1, len(blobs)):
            p, q = blobs[i], blobs[j]; dx = abs(p[0] - q[0]); dy = abs(p[1] - q[1]); d = (dx * dx + dy * dy) ** .5
            if d < H * 0.03 or d > H * 0.12 or dy > dx * 1.2: continue
            # điểm: vành tối (mặt gần đen) + cỡ cụm (mắt là 2 cụm kem lớn nhất trong mặt) + cân cỡ − khoảng cách
            sc = (p[3] + q[3]) + 0.5 * (p[2] + q[2]) / szMax + 0.5 * min(p[2], q[2]) / max(p[2], q[2]) - d / H
            if best is None or sc > best[0]: best = (sc, p, q)
    return sorted([(best[1][0], best[1][1]), (best[2][0], best[2][1])]) if best else None


def do_mat(a, khung, ten_sheet, so):
    """→ mỗi khung: {'mat': [(x,y),(x,y)] hoặc [], 'tamMat': (x,y), 'cachMat': '...'}"""
    kq = []
    for k in khung:
        H = k['bbox'][3] - k['bbox'][1] + 1; b = cum_sang(a, k); m = ghep_mat(b, H)
        if m is None: b = cum_sang(a, k, long=True); m = ghep_mat(b, H)
        kq.append({'mat': m or [], 'cum': b, 'cachMat': '2 cụm' if m else None})
    # loại cặp "mắt" giả: khoảng mắt→đỉnh mũ ngắn hơn 0,75 trung vị sheet (mắt thật nằm dưới đỉnh mũ một khoảng cố định)
    dinh = [mat_dinh_mu(k, ((r['mat'][0][0] + r['mat'][1][0]) / 2, (r['mat'][0][1] + r['mat'][1][1]) / 2), k['bbox'][3] - k['bbox'][1] + 1) if r['mat'] else None for k, r in zip(khung, kq)]
    medD = float(np.median([d for d in dinh if d is not None])) if any(d is not None for d in dinh) else None
    for r, d in zip(kq, dinh):
        if d is not None and medD and d < 0.75 * medD: r['mat'] = []; r['cachMat'] = None; r['loaiCap'] = 'cặp dò được quá gần đỉnh mũ (%.0f < 0,75×%.0f) → bỏ' % (d, medD)
    co2 = [r['mat'] for r in kq if r['mat']]
    vec = np.median([[m[1][0] - m[0][0], m[1][1] - m[0][1]] for m in co2], axis=0) if co2 else np.array([14.0, 4.0])
    for i, (k, r) in enumerate(zip(khung, kq)):
        x0, y0, x1, y1 = k['bbox']; H = y1 - y0 + 1
        if r['mat']: r['tamMat'] = ((r['mat'][0][0] + r['mat'][1][0]) / 2, (r['mat'][0][1] + r['mat'][1][1]) / 2); continue
        tay = MAT_TAY.get(ten_sheet, {}).get(k.get('idx', i))
        if tay: r['tamMat'] = (float(tay[0]), float(tay[1])); r['cachMat'] = 'MAT_TAY'; continue
        if r['cum'] and not r.get('loaiCap'):   # 1 mắt: thử 2 phía theo vector trung vị, chọn phía có vành tối (mặt) nhiều hơn
            rgb = a[..., :3].astype(int); toi = (rgb.max(-1) < 70) & k['mask']
            def dark_at(x, y):
                r0 = max(2, int(H * 0.02)); ys, xs = int(y), int(x)
                v = toi[max(0, ys - 3 * r0):ys + 3 * r0, max(0, xs - 3 * r0):xs + 3 * r0]; return float(v.mean()) if v.size else 0
            cands = []
            for c in r['cum']:
                for sgn in (1, -1):
                    ox, oy = c[0] + sgn * vec[0], c[1] + sgn * vec[1]
                    cands.append((dark_at(ox, oy) + c[3], ((c[0] + ox) / 2, (c[1] + oy) / 2)))
            cands.sort(reverse=True); r['tamMat'] = cands[0][1]; r['cachMat'] = '1 cụm + vector trung vị'; continue
        # 0 mắt: đỉnh mũ (hàng trên cùng của mask) + khoảng cách mắt→đỉnh trung vị; x = trung vị tỉ lệ (mắtX − x0)/rộng
        dts = [kq[j]['tamMat'][1] - khung[j]['bbox'][1] for j in range(len(khung)) if j < i and 'tamMat' in kq[j]]
        d = np.median(dts) if dts else H * 0.3; rx = np.median([(kq[j]['tamMat'][0] - khung[j]['bbox'][0]) / (khung[j]['bbox'][2] - khung[j]['bbox'][0] + 1) for j in range(len(khung)) if j < i and 'tamMat' in kq[j]] or [0.6])
        r['tamMat'] = (x0 + rx * (x1 - x0 + 1), y0 + d); r['cachMat'] = 'ƯỚC LƯỢNG (không thấy mắt)'
    so['vecMat'] = [round(float(vec[0]), 1), round(float(vec[1]), 1)]
    return kq


def mat_dinh_mu(k, tam, H):
    """khoảng cách tâm mắt → hàng trên cùng của mask trong dải cột [mắt − 0,25H, mắt + 0,08H] (đỉnh mũ)"""
    x0, y0, x1, y1 = k['bbox']; ex, ey = tam
    c0 = int(max(x0, ex - 0.25 * H)); c1 = int(min(x1, ex + 0.08 * H)); col = k['mask'][:, c0:c1 + 1]
    tops = [np.where(col[:, j])[0].min() for j in range(col.shape[1]) if col[:, j].any()]
    return float(ey - min(tops))


# ---------------------------------------------------------------- xuất ảnh (W×H)
def to_x(im, s): return im.resize((im.width * s, im.height * s), Image.NEAREST)


def day_khung(frames, S, nhan):
    W, H = frames[0].size; out = Image.new('RGBA', (len(frames) * (W * S + 4) + 4, H * S + 28), NEN); dr = ImageDraw.Draw(out); f = chu(12)
    for i, im in enumerate(frames):
        x = 4 + i * (W * S + 4); out.alpha_composite(to_x(im, S), (x, 4)); dr.rectangle([x, 4, x + W * S - 1, 4 + H * S - 1], outline=(60, 70, 85, 255))
        dr.text((x + 3, H * S + 7), nhan[i], font=f, fill=(138, 150, 166, 255))
    return out


def gif(frames, duong, S, ms):
    ims = []
    for im in frames:
        bg = Image.new('RGBA', im.size, NEN); bg.alpha_composite(im); ims.append(to_x(bg, S).convert('P', palette=Image.ADAPTIVE, colors=32))
    ims[0].save(duong, save_all=True, append_images=ims[1:], duration=ms, loop=0, disposal=2)


def so_sanh_goc(goc, cuoi, S, nhan_goc, nhan_cuoi):
    W, H = cuoi[0].size; out = Image.new('RGBA', (len(goc) * (W * S + 6) + 6, 2 * (H * S + 22) + 24), NEN); dr = ImageDraw.Draw(out); f = chu(12)
    dr.text((6, 4), 'Hàng trên: ' + nhan_goc + ' · Hàng dưới: ' + nhan_cuoi, font=f, fill=(230, 230, 230, 255))
    for r, hang in enumerate((goc, cuoi)):
        y = 24 + r * (H * S + 22)
        for c, im in enumerate(hang):
            x = 6 + c * (W * S + 6); out.alpha_composite(to_x(im, S), (x, y + 16)); dr.rectangle([x, y + 16, x + W * S - 1, y + 16 + H * S - 1], outline=(70, 80, 95, 255))
            dr.text((x, y + 1), 'F%d %s' % (c, 'gốc' if r == 0 else 'sau dọn'), font=f, fill=(230, 230, 230, 255))
    return out


def chong_silhouette(frames, pivot, S=6):
    W, H = frames[0].size; W1 = W * S + 16; out = Image.new('RGBA', (W1 * 2, H * S + 60), NEN); dr = ImageDraw.Draw(out)
    MAU = [(83, 204, 147), (131, 170, 230), (225, 184, 90), (230, 120, 120), (40, 140, 90), (70, 110, 200), (200, 140, 40), (200, 70, 90)]
    for i, im in enumerate(frames):
        a = im.getchannel('A').point(lambda v: 255 if v > 0 else 0)
        mo = Image.new('RGBA', (W, H), (236, 240, 244, 255)); mo.putalpha(a.point(lambda v: 40 if v else 0)); out.alpha_composite(to_x(mo, S), (8, 8))
        ero = a.filter(ImageFilter.MinFilter(3)); bm = Image.fromarray(((np.array(a) > 0) & (np.array(ero) == 0)).astype(np.uint8) * 255, 'L')
        c = Image.new('RGBA', (W, H), MAU[i % 8] + (255,)); c.putalpha(bm); out.alpha_composite(to_x(c, S), (W1 + 8, 8))
    for ox in (8, W1 + 8):
        px, py = ox + (pivot[0] + 0.5) * S, 8 + (pivot[1] + 0.5) * S
        dr.line([px - 10, py, px + 10, py], fill=(255, 60, 60, 255), width=2); dr.line([px, py - 10, px, py + 10], fill=(255, 60, 60, 255), width=2)
    f = chu(12)
    dr.text((8, H * S + 14), 'Trái: %d khung chồng mờ ×%d. Phải: đường biên từng khung một màu' % (len(frames), S), font=f, fill=(230, 235, 240, 255))
    dr.text((8, H * S + 32), 'F0 xanh lá, F1 xanh dương, F2 vàng, F3 đỏ, F4–F7 đậm hơn cùng thứ tự · chữ thập đỏ = pivot [%d,%d]' % tuple(pivot), font=f, fill=(230, 235, 240, 255))
    return out


def lat_check(frames, pivot, S=4):
    W, H = frames[0].size; px, py = pivot; pl = [W - 1 - px, py]; cw = W * S + 8; out = Image.new('RGBA', (len(frames) * cw * 2 + 8, H * S + 62), NEN); dr = ImageDraw.Draw(out); f = chu(11); kq = []
    for i, im in enumerate(frames):
        lat = im.transpose(Image.FLIP_LEFT_RIGHT)
        for k, (img, piv, ten) in enumerate(((im, pivot, 'thuận'), (lat, pl, 'lật'))):
            ox = 4 + (i * 2 + k) * cw; X, Y = ox + (px + 0.5) * S, 20 + (py + 0.5) * S
            dx, dy = int(round(X - (piv[0] + 0.5) * S)), int(round(Y - (piv[1] + 0.5) * S))
            out.alpha_composite(to_x(img, S), (dx, dy)); dr.rectangle([dx, dy, dx + W * S - 1, dy + H * S - 1], outline=(60, 70, 85, 255))
            dr.line([X - 7, Y, X + 7, Y], fill=(255, 70, 70, 255), width=2); dr.line([X, Y - 7, X, Y + 7], fill=(255, 70, 70, 255), width=2)
            dr.text((ox + 2, 22 + H * S), 'F%d %s' % (i, ten), font=f, fill=(138, 150, 166, 255))
        b1 = im.getbbox(); b2 = lat.getbbox()
        t1 = {'trai': b1[0] - px, 'phai': b1[2] - 1 - px, 'day': b1[3] - 1 - py}; t2 = {'trai': b2[0] - pl[0], 'phai': b2[2] - 1 - pl[0], 'day': b2[3] - 1 - py}
        lech = {'trai': t1['trai'] + t2['phai'], 'phai': t1['phai'] + t2['trai'], 'day': t1['day'] - t2['day']}
        a1 = np.array(im)[..., 3] > 0; a2 = np.array(lat)[..., 3] > 0; sai = int((a1 != a2[:, ::-1]).sum())
        kq.append({'khung': i, 'thuan': t1, 'lat': t2, 'lech': lech, 'saiPixel': sai, 'dung': lech == {'trai': 0, 'phai': 0, 'day': 0} and sai == 0})
    dr.text((8, out.height - 14), 'pivot thuận [%d,%d] · pivotLat [%d,%d] · chữ thập = điểm chân chung' % (px, py, pl[0], pl[1]), font=f, fill=(138, 150, 166, 255))
    return out, kq


def trong_game(frames, pivot, ten, do_cao, nhan=''):
    sp = importlib.util.spec_from_file_location('build', os.path.join(ROOT, 'proto-lam', 'build.py')); b = importlib.util.module_from_spec(sp); sp.loader.exec_module(b)
    nen = b.ghep_nen().convert('RGBA'); DAT = 241
    try:
        atlas = json.load(open(os.path.join(ROOT, 'art', 'sprite', 'atlas.json'))); q = atlas['quaiChuong']
        qs = Image.open(os.path.join(ROOT, 'art', 'sprite', 'quai-chuong.png')).convert('RGBA')
        f0 = q['anims']['idle']['frames'][0]; quai = qs.crop((f0['x'], f0['y'], f0['x'] + q['w'], f0['y'] + q['h'])); qp = q['pivot']
    except Exception: quai = None; qp = None
    n = len(frames); W = frames[0].width
    rongMax = max(im.getbbox()[2] - im.getbbox()[0] for im in frames)
    xTrai = 4 + rongMax // 2; xPhai = (457 - qp['x'] if quai is not None else 480) - 4 - rongMax // 2
    buoc = min(64, (xPhai - xTrai) // max(1, n - 1)) if n > 1 else 0; xs = [xTrai + i * buoc for i in range(n)]
    for i, im in enumerate(frames): nen.alpha_composite(im, (xs[i] - pivot[0], DAT + do_cao[i] - pivot[1]))
    if quai is not None: nen.alpha_composite(quai, (457 - qp['x'], DAT - qp['y']))
    x1 = nen.copy(); big = nen.resize((480 * 4, 270 * 4), Image.NEAREST); d = ImageDraw.Draw(big); f = chu(22); f16 = chu(16)
    for i, x in enumerate(xs):
        X, Y = x * 4 + 2, (DAT + do_cao[i]) * 4 + 2
        d.line([X - 8, Y, X + 8, Y], fill=(255, 70, 70, 255), width=2); d.line([X, Y - 8, X, Y + 8], fill=(255, 70, 70, 255), width=2)
        d.text((x * 4 - 16, DAT * 4 + 12), 'F%d %s' % (i, ('(%+d)' % do_cao[i]) if do_cao[i] else ''), font=f16, fill=(243, 230, 200, 255), stroke_width=3, stroke_fill=(12, 15, 20, 255))
    d.text((12, 12), 'trong-game-x4.png · nền Làng Chuông 480×270 ×4 · Lam %s (ChatGPT → cao %d, ô %d×%d, pivot [%d,%d]) chân/pivot tại y = 241 + độ cao giả định (chữ thập đỏ) %s' % (ten, CAO_CHUAN, W, frames[0].height, pivot[0], pivot[1], nhan), font=f, fill=(230, 235, 240, 255), stroke_width=3, stroke_fill=(12, 15, 20, 255))
    return x1, big, {'xChan': xs, 'buoc': buoc, 'rongMax': int(rongMax), 'chomNhau': bool(rongMax > buoc), 'doCao': do_cao}


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sheet', required=True); ap.add_argument('--so-khung', type=int, required=True); ap.add_argument('--ra', required=True)
    ap.add_argument('--hang', type=int, default=1, help='số hàng trên sheet'); ap.add_argument('--hang-chon', type=int, default=0, help='lấy hàng nào (0-based)')
    ap.add_argument('--ten', default='jump'); ap.add_argument('--fps', type=int, default=10); ap.add_argument('--loop', action='store_true'); ap.add_argument('--hit-frames', default='')
    ap.add_argument('--cao', type=int, default=64); ap.add_argument('--o', type=int, default=80, help='chiều cao ô'); ap.add_argument('--o-rong', type=int, default=None, help='chiều rộng ô (mặc định = --o)')
    ap.add_argument('--cot-mat', type=int, default=48, help='cột tâm 2 mắt trong ô rộng 80 (Run 64 = 48); ô rộng khác dịch theo tâm')
    ap.add_argument('--chong-dat', default='', help='chỉ số khung chống đất, vd 0,1 (rỗng = tất cả bay; "tat-ca" = tất cả)')
    ap.add_argument('--hang-mat-bay', type=int, default=None, help='hàng mắt cho khung bay (mặc định: hàng mắt khung chống đất cuối, hoặc 35)')
    ap.add_argument('--khung-cao-chuan', default='', help='khung dùng cho tỉ lệ "cao" (cao = 64), vd 1; rỗng = trung vị khung chống đất')
    ap.add_argument('--ty-le-cach', default='hoa', choices=['dau', 'cao', 'hoa']); ap.add_argument('--ty-le', type=float, default=None, help='ép tỉ lệ thu')
    ap.add_argument('--phuong-phap', default='auto', choices=['auto', 'da-so', 'nearest'])
    ap.add_argument('--xuat-rong', type=int, default=None, help='xuất thêm bản ô rộng N (không cắt ngang) vào thư mục con rongN/')
    ap.add_argument('--do-cao', default='', help='độ cao giả định từng khung cho trong-game, vd 0,-8,-18,-26')
    ap.add_argument('--khong-anh', action='store_true')
    o = ap.parse_args()
    global CAO_CHUAN
    CAO_CHUAN = o.cao; H = o.o; W = o.o_rong or o.o; PIV = [W // 2, H - 1]
    t.N = NI; t.PIVOT = [NI // 2, NI - 1]; t.CAO = o.cao
    os.makedirs(o.ra, exist_ok=True)
    ten_sheet = os.path.basename(o.sheet)
    so = {'nguon': o.sheet, 'hangChon': o.hang_chon, 'soKhung': o.so_khung, 'cao': o.cao, 'o': [W, H], 'pivot': PIV, 'fps': o.fps, 'loop': o.loop, 'khung': {}}
    a = np.array(Image.open(o.sheet).convert('RGBA')); so['kichThuocSheet'] = [int(a.shape[1]), int(a.shape[0])]
    # 1. tách
    tatca = tach_luoi(a, o.so_khung, o.hang, so)
    khung = [k for k in tatca if k['hang'] == o.hang_chon]; n = len(khung)
    matAll = do_mat(a, khung, ten_sheet, so)
    caoNguon = [k['bbox'][3] - k['bbox'][1] + 1 for k in khung]
    chongDat = list(range(n)) if o.chong_dat == 'tat-ca' else ([int(x) for x in o.chong_dat.split(',') if x != ''])
    # 2. tỉ lệ – sheet nhiều hàng (combo): đo trên TOÀN sheet để 3 đòn cùng một tỉ lệ
    dinh = [mat_dinh_mu(k, m['tamMat'], caoNguon[i]) for i, (k, m) in enumerate(zip(khung, matAll))]
    if o.hang > 1:
        matTat = do_mat(a, tatca, ten_sheet, {}); caoTat = [k['bbox'][3] - k['bbox'][1] + 1 for k in tatca]
        dinhTat = [mat_dinh_mu(k, m['tamMat'], caoTat[i]) for i, (k, m) in enumerate(zip(tatca, matTat))]
    else: dinhTat, caoTat = dinh, caoNguon
    med = float(np.median(dinhTat)); ok = [d for d in dinhTat if 0.85 * med <= d <= 1.15 * med]; medOk = float(np.median(ok))
    sDau = MAT_DINH_MU / medOk
    kc = [int(x) for x in o.khung_cao_chuan.split(',') if x != ''] or chongDat
    if o.hang > 1 and not o.khung_cao_chuan: sCao = o.cao / float(np.median(caoTat)); kc = 'trung vị %d khung toàn sheet' % len(caoTat)
    else: sCao = (o.cao / float(np.median([caoNguon[i] for i in kc]))) if kc else None
    if o.ty_le: s = o.ty_le; cach = 'ép --ty-le'
    elif o.ty_le_cach == 'dau' or sCao is None: s = sDau; cach = 'dau' + ('' if sCao is not None else ' (không có khung chống đất để đo cao)')
    elif o.ty_le_cach == 'cao': s = sCao; cach = 'cao'
    else: s = (sDau * sCao) ** 0.5; cach = 'hoa'
    so['tyLe'] = {'s': round(s, 5), 'cach': cach, 'sDau': round(sDau, 5), 'sCao': round(sCao, 5) if sCao else None, 'matDinhMuNguon': [round(d, 1) for d in dinh], 'matDinhMuDungDeDo': round(medOk, 1), 'doTrenToanSheet': o.hang > 1, 'matDinhMuToanSheet': [round(d, 1) for d in dinhTat] if o.hang > 1 else None, 'caoNguonToanSheet': caoTat if o.hang > 1 else None,
                  'matDinhMuRa': round(medOk * s, 1), 'khungCaoChuan': kc, 'caoNguon': caoNguon, 'caoRaTheoKhung': [round(c * s, 1) for c in caoNguon],
                  'giaiThich': 'dau: mắt→đỉnh mũ = %.1f px như Run 64; cao: khung chuẩn cao %d; hoa: trung bình nhân' % (MAT_DINH_MU, o.cao)}
    for i, k in enumerate(khung):
        so['khung'][i] = {'bboxNguon': list(k['bbox']), 'caoNguon': caoNguon[i], 'rongNguon': k['bbox'][2] - k['bbox'][0] + 1, 'matNguon': [[round(x, 1), round(y, 1)] for x, y in matAll[i]['mat']],
                          'tamMatNguon': [round(matAll[i]['tamMat'][0], 1), round(matAll[i]['tamMat'][1], 1)], 'cachMat': matAll[i]['cachMat'], 'matDinhMuNguon': round(dinh[i], 1)}
    # 3. thu nhỏ 2 cách, chấm điểm (như script Run)
    thu = {c: [t.thu_khung(a, k, s, c) for k in khung] for c in ('da-so', 'nearest')}
    matThu = []
    for k, m in zip(khung, matAll):
        x0, y0 = k['bbox'][:2]; matThu.append([(int((mx - x0) * s), int((my - y0) * s)) for mx, my in m['mat']])
    tamThu = [((m['tamMat'][0] - k['bbox'][0]) * s, (m['tamMat'][1] - k['bbox'][1]) * s) for k, m in zip(khung, matAll)]
    def dat_vao_o(ci, co):
        h, w = ci.shape; CI = np.full((NI, NI), -1, np.int32); CO = np.zeros((NI, NI), bool); CI[:h, :w] = ci; CO[:h, :w] = co; return CI, CO
    diem = {}
    for c in ('da-so', 'nearest'):
        diem[c] = []
        for i in range(n):
            CI, CO = dat_vao_o(*thu[c][i]); CI2, CO2 = t.don(CI, CO, {}); diem[c].append(t.diem_doc(CI2, CO2, matThu[i]))
        diem[c + 'Tong'] = int(sum(d['diem'] for d in diem[c]))
    chon = o.phuong_phap if o.phuong_phap != 'auto' else ('nearest' if diem['nearestTong'] < diem['da-soTong'] else 'da-so')
    so['thuNho'] = {'diem': diem, 'chon': chon}
    # 4. mắt + dọn
    frames = []; gocNearest = []
    for i, k in enumerate(khung):
        ci, co = thu[chon][i]; ci = ci.copy(); co = co.copy(); matDat = 0
        for (mx, my) in matThu[i]:
            if 0 <= my < ci.shape[0] and 0 <= mx < ci.shape[1] and not (co[my, mx] and ci[my, mx] in (9, 10)): co[my, mx] = True; ci[my, mx] = 10; matDat += 1
        so['khung'][i]['matDatLai'] = matDat
        CI, CO = dat_vao_o(ci, co); CI, CO = t.don(CI, CO, so['khung'][i]); frames.append((CI, CO)); gocNearest.append(dat_vao_o(*thu['nearest'][i]))
    # 5. căn: cột mắt cố định; chống đất → đáy thân = H−1; bay → hàng mắt
    EXo = o.cot_mat + (W - 80) // 2                      # cột mắt trong ô W (48 ở ô 80, 56 ở ô 96)
    EX = EXo + (NI - W) // 2; dyO = NI - H               # sang hệ nội bộ
    def day_than(CI, CO):
        luoi = ndimage.binary_dilation(CO & (CI == 11), iterations=2); than = CO & ~luoi
        return int(np.where(than)[0].max()) if than.any() else int(np.where(CO)[0].max())
    dxs = [EX - int(round(tamThu[i][0])) for i in range(n)]
    dayT = [day_than(*frames[i]) for i in range(n)]
    hangMatCD = [int(round(tamThu[i][1])) + (NI - 1 - dayT[i]) for i in chongDat]
    ER = (o.hang_mat_bay + dyO) if o.hang_mat_bay is not None else (hangMatCD[-1] if hangMatCD else 35 + dyO)
    dat = []; nhun = []
    for i, (CI, CO) in enumerate(frames):
        dx = dxs[i]; dy = (NI - 1 - dayT[i]) if i in chongDat else (ER - int(round(tamThu[i][1])))
        hangMat = int(round(tamThu[i][1])) + dy; nhun.append(hangMat - ER)
        CI2 = np.full((NI, NI), -1, np.int32); CO2 = np.zeros((NI, NI), bool); ys, xs = np.where(CO); roi = 0
        for y, x in zip(ys, xs):
            Y, X = y + dy, x + dx
            if 0 <= Y < NI and 0 <= X < NI: CI2[Y, X] = CI[y, x]; CO2[Y, X] = True
            else: roi += 1
        so['khung'][i].update({'dich': [dx, dy], 'chongDat': i in chongDat, 'hangMat': hangMat - dyO, 'cotMat': EXo, 'nhunDauSoChuan': hangMat - ER, 'pixelRoiNgoaiNoiBo112': roi})
        dat.append((CI2, CO2))
        g = gocNearest[i]; CIg = np.full((NI, NI), -1, np.int32); COg = np.zeros((NI, NI), bool); ys, xs = np.where(g[1])
        for y, x in zip(ys, xs):
            Y, X = y + dy, x + dx
            if 0 <= Y < NI and 0 <= X < NI: CIg[Y, X] = g[0][y, x]; COg[Y, X] = True
        gocNearest[i] = (CIg, COg)
    so['can'] = {'cotMat': EXo, 'hangMatBay': ER - dyO, 'khungChongDat': chongDat, 'quyTac': 'ngang: tâm 2 mắt → cột %d; dọc: khung chống đất đáy THÂN (bỏ lưỡi kiếm) = %d, khung bay giữ hàng mắt = %d' % (EXo, H - 1, ER - dyO)}
    # 6. ổn định thời gian + viền lại
    dat = t.on_dinh(dat, ER, nhun, so)
    cuoi = [t.don(CI, CO, {}) for CI, CO in dat]
    # 7. cắt về W×H (và bản rộng nếu yêu cầu)
    def cat(ci, co, Wc):
        x0 = (NI - Wc) // 2; y0 = NI - H; im = t.rgba(ci, co).crop((x0, y0, x0 + Wc, y0 + H))
        mat = co.copy(); mat[y0:y0 + H, x0:x0 + Wc] = False
        ys, xs = np.where(mat)
        return im, {'soPixelMat': int(mat.sum()), 'trai': int((xs < x0).sum()), 'phai': int((xs >= x0 + Wc).sum()), 'tren': int((ys < y0).sum()), 'duoi': int((ys >= y0 + H).sum()),
                    'bboxNoiBoSoVoiO': [int(np.where(co)[1].min()) - x0, int(np.where(co)[0].min()) - y0, int(np.where(co)[1].max()) - x0, int(np.where(co)[0].max()) - y0]}
    ims = []; cat_kq = []
    for ci, co in cuoi:
        im, kq = cat(ci, co, W); ims.append(im); cat_kq.append(kq)
    imsGoc = [cat(ci, co, W)[0] for ci, co in gocNearest]
    ten = o.ten; ms = int(round(1000.0 / o.fps))
    for i, im in enumerate(ims): im.save(os.path.join(o.ra, '%s-%d.png' % (ten, i)))
    for i in range(n):
        CI, CO = cuoi[i]; x0 = (NI - W) // 2; y0 = NI - H; sub = CO[y0:y0 + H, x0:x0 + W]; subI = CI[y0:y0 + H, x0:x0 + W]
        ys, xs = np.where(sub); mau = np.bincount(subI[sub], minlength=12)
        luoi = ndimage.binary_dilation(sub & (subI == 11), iterations=2); than = sub & ~luoi
        so['khung'][i].update({'bbox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())], 'cao': int(ys.max() - ys.min() + 1), 'rong': int(xs.max() - xs.min() + 1),
                               'hangDay': int(ys.max()), 'hangDayThan': int(np.where(than)[0].max()) if than.any() else int(ys.max()), 'chanCaoHonPivot': (H - 1) - (int(np.where(than)[0].max()) if than.any() else int(ys.max())),
                               'soPixel': int(sub.sum()), 'soMau': int((mau > 0).sum()), 'mau': {PAL[k]: int(mau[k]) for k in range(12) if mau[k]},
                               'luoiKiemPx': int(mau[11]), 'vangChuongChanPx': int(mau[9] + mau[8]), 'domLeCuoi': t.diem_doc(subI, sub, [])['dom12px'] if False else None,
                               'matO': [[int(x), int(y)] for y in range(H) for x in range(W) if sub[y, x] and subI[y, x] in (9, 10) and abs(y - so['khung'][i]['hangMat']) <= 2 and abs(x - EXo) <= 6],
                               'roiNgoaiO': cat_kq[i]})
        if cat_kq[i]['soPixelMat']:
            bb = cat_kq[i]['bboxNoiBoSoVoiO']; so['khung'][i]['roiNgoaiO']['ghiChu'] = 'bbox đầy đủ x %d→%d, y %d→%d so với ô %d×%d' % (bb[0], bb[2], bb[1], bb[3], W, H)
    so['tongMau'] = sorted({PAL[k] for im in ims for k in np.unique(t.pal_idx(np.array(im)[..., :3])[np.array(im)[..., 3] > 0])})
    so['pixelRoiNgoaiO'] = {i: cat_kq[i]['soPixelMat'] for i in range(n)}
    so['saiKhacKhungKe'] = [int(((cuoi[i][0] != cuoi[i + 1][0]) | (cuoi[i][1] != cuoi[i + 1][1])).sum()) for i in range(n - 1)]
    if o.loop and n > 1: so['saiKhacKhungKe'].append(int(((cuoi[-1][0] != cuoi[0][0]) | (cuoi[-1][1] != cuoi[0][1])).sum()))
    # quỹ đạo mũi kiếm (pixel #CEF0D6 xa tâm mắt nhất) – để xem cung chém
    so['muiKiem'] = []
    for i, im in enumerate(ims):
        ar = np.array(im); idx = t.pal_idx(ar[..., :3]); m = (ar[..., 3] > 0) & (idx == 11); ys, xs = np.where(m)
        if len(xs):
            d = (xs - EXo) ** 2 + (ys - so['khung'][i]['hangMat']) ** 2; j = int(d.argmax()); so['muiKiem'].append([int(xs[j]), int(ys[j])])
        else: so['muiKiem'].append(None)
    if not o.khong_anh:
        nhan = ['F%d · %d ms' % (i, i * ms) for i in range(n)]
        day_khung(ims, 4, nhan).save(os.path.join(o.ra, '%s-x4.png' % ten)); day_khung(ims, 8, nhan).save(os.path.join(o.ra, '%s-x8.png' % ten))
        gif(ims, os.path.join(o.ra, '%s.gif' % ten), 4, ms)
        so_sanh_goc(imsGoc, ims, 4, 'ChatGPT thu nearest + khoá 12 màu (chưa dọn)', 'sau dọn (%s)' % chon).save(os.path.join(o.ra, 'so-sanh-goc-x4.png'))
        chong_silhouette(ims, PIV).save(os.path.join(o.ra, 'chong-silhouette.png'))
        doCao = [int(x) for x in o.do_cao.split(',') if x != ''] or [0] * n
        x1, x4, tg = trong_game(ims, PIV, ten, doCao); x1.save(os.path.join(o.ra, 'trong-game-x1.png')); x4.save(os.path.join(o.ra, 'trong-game-x4.png')); so['trongGame'] = tg
        latIm, latKq = lat_check(ims, PIV); latIm.save(os.path.join(o.ra, 'lat-check.png')); so['lat'] = latKq
    if o.xuat_rong:
        Wr = o.xuat_rong; d2 = os.path.join(o.ra, 'rong%d' % Wr); os.makedirs(d2, exist_ok=True); imsR = []; roiR = {}
        for i, (ci, co) in enumerate(cuoi):
            im, kq = cat(ci, co, Wr); im.save(os.path.join(d2, '%s-%d.png' % (ten, i))); imsR.append(im); roiR[i] = kq['soPixelMat']
        if not o.khong_anh: day_khung(imsR, 4, nhan).save(os.path.join(d2, '%s-x4.png' % ten)); gif(imsR, os.path.join(d2, '%s.gif' % ten), 4, ms)
        so['xuatRong'] = {'o': [Wr, H], 'pivot': [Wr // 2, H - 1], 'cotMat': EXo + (Wr - W) // 2, 'thuMuc': d2, 'pixelRoiNgoaiO': roiR}
    so['gif'] = 'GIF luôn loop=0 (lặp) để xem; animation %s trong game' % ('loop' if o.loop else 'NON-LOOP giữ khung cuối')
    if o.hit_frames: so['hitFrames'] = [int(x) for x in o.hit_frames.split(',')]
    with open(os.path.join(o.ra, 'kiem-tra.json'), 'w') as f: json.dump(so, f, indent=1, ensure_ascii=False)
    print(json.dumps({'ten': ten, 's': so['tyLe'], 'chon': chon, 'diem': {k: v for k, v in diem.items() if k.endswith('Tong')}, 'can': so['can'],
                      'hangMat': [so['khung'][i]['hangMat'] for i in range(n)], 'hangDayThan': [so['khung'][i]['hangDayThan'] for i in range(n)], 'hangDay': [so['khung'][i]['hangDay'] for i in range(n)],
                      'bbox': [so['khung'][i]['bbox'] for i in range(n)], 'roiNgoai': so['pixelRoiNgoaiO'], 'cachMat': [so['khung'][i]['cachMat'] for i in range(n)], 'muiKiem': so['muiKiem']}, ensure_ascii=False))


if __name__ == '__main__': main()
