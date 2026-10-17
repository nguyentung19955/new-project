#!/usr/bin/env python3
"""Thu sprite sheet do ChatGPT sinh (nhân vật cao ≈ 290 px, nền trong suốt hoặc đen) về khung pixel ô O×O, bảng 12 màu, pivot [O/2, O−1].
Bản tổng quát của tools/chatgpt-sheet-to-64.py (file đó giữ nguyên, cỡ 46/ô 64): mọi bước giống hệt, chỉ thêm tham số cỡ.

Chạy:  python3 tools/chatgpt-sheet-to-px.py --sheet art/nhan-vat/lam-chatgpt/run-sheet-v1.png --so-khung 8 --ra art/nhan-vat/lam-chatgpt/run64
        [--cao 64] [--o 80] [--ten run] [--fps 12] [--phuong-phap auto|da-so|nearest] [--sheet-game game/anim/lam-chatgpt-80]
        [--so-voi art/nhan-vat/lam-chatgpt/run] [--khong-chromium]
  --cao  chiều cao nhân vật (px) = 64 mặc định (4 ô gạch 16 px)      --o  cỡ ô sprite = 80 mặc định → pivot [40,79]
  --so-voi  thư mục bản cũ (run-0..7.png ô 64, cao 46) → xuất so-sanh-46-64-x4.png (cũ | mới phóng cùng ×4, cùng hàng chân)

Các bước (mỗi bước ghi số liệu vào kiem-tra.json):
  1. Tách khung: mặt nạ đặc = alpha ≥ 128. Nếu sheet KHÔNG có alpha (nền đen đặc) thì mặt nạ = KHÔNG thuộc vùng tối liền với mép ngoài
     (flood fill 4 lân cận từ 4 mép trên pixel gần đen, không dùng ngưỡng màu toàn ảnh vì viền nhân vật cũng #0C0F14).
     Khung = thành phần liên thông lớn (lớn hơn 2 % thành phần lớn nhất), sắp theo mép trái; thiếu khung → chia cột đều.
  2. Thu nhỏ CÙNG tỉ lệ s = cao / trung vị chiều cao 8 khung. Hai cách: "da-so" (mỗi ô 64 lấy màu bảng xuất hiện nhiều nhất trong
     khối nguồn, ô đặc khi ≥ 50 % khối đặc) và "nearest" (lấy pixel tâm khối). Khoá 12 màu bằng màu gần nhất (RGB), alpha 0/255.
     auto: chấm điểm cả hai (đốm lẻ, lỗ, số mảnh rời, mắt còn/mất) và chọn điểm thấp hơn.
  3. Giữ chi tiết nhỏ theo toạ độ đo từ nguồn: 2 mắt (2 cụm vàng nhỏ ở vùng mặt) → đặt lại đúng ô nếu bị thu mất.
  4. Dọn: lỗ trong 1–2 px lấp màu lân cận; đốm 1–2 px của màu tối/trung (không phải mắt/kiếm/chuông/vạch ủng) nằm lọt trong một màu
     khác → hoà vào; đốm đen lẻ trong lòng (≥ 3 lân cận màu khác) → màu lân cận đa số; mấu 1 px ở silhouette → bỏ; viền ngoài 1 px #0C0F14 liền.
  5. Căn: ngang theo tâm 2 mắt (cùng một cột cho mọi khung); dọc: khung chống đất → hàng thấp nhất = 63, khung bay (chân cao hơn
     ≥ 3 px so với trung vị) → giữ hàng mắt như khung chống đất. Nhún đầu giữa các khung ghi vào kiem-tra.json ("nhunDau").
  6. Ổn định thời gian vùng đầu/thân (hàng ≤ hàng mắt + DT, DT = 13·cao/46 – ở cỡ 46 là 13, cỡ 64 là 18; so trong hệ toạ độ đã khử nhún): đốm ≤ 3 px chỉ có ở 1 khung mà 2 khung kề
     giống nhau → lấy giá trị khung kề.
  7. Xuất: run-0..7.png, run-x4/x8.png, run.gif, so-sanh-goc-x4.png, so-sanh-46-64-x4.png (nếu --so-voi), chong-silhouette.png,
     trong-game-x1/x4.png, lat-check.png, kiem-tra.json, sheet game (8 cột × 5 hàng ô O) + .anim.json, anim2d-check.png (nạp sheet vào
     game/xem-thu/anim2d.html bằng Chromium headless; trang chỉ đọc ../anim/lam.anim.json (ô 64) nên script CHUYỂN HƯỚNG yêu cầu đó
     sang .anim.json vừa xuất – không sửa trang).
Danh sách SỬA TAY (toạ độ cố định, lặp lại được) đặt ở SUA_TAY bên dưới – mặc định rỗng.
"""
import argparse, base64, http.server, importlib.util, json, os, socketserver, sys, threading, warnings
warnings.filterwarnings('ignore', category=DeprecationWarning)
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.join(ROOT, 'game')
N = 80                        # cỡ ô (đặt lại theo --o trong main; mọi hàm đọc biến toàn cục này)
PIVOT = [40, 79]              # = [N//2, N-1]
CAO = 64                      # chiều cao nhân vật (đặt lại theo --cao)
PAL =['#0C0F14', '#1A212B', '#212835', '#2C3546', '#4A5A6E', '#21413A', '#32804F', '#83CC93', '#9C6B30', '#E1B85A', '#F3E6C8', '#CEF0D6']
PAL_RGB = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h in PAL], np.int32)
VIEN = 0                      # #0C0F14
BAO_VE = {7, 9, 10, 11}       # màu sáng: #83CC93 (vạch ủng/viền mũ), #E1B85A (chuông/chắn kiếm), #F3E6C8 (mắt/chỏm), #CEF0D6 (lưỡi kiếm) – không xoá đốm
NEN = (42, 36, 51, 255)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
N4 = ((0, 1), (0, -1), (1, 0), (-1, 0))
S8 = np.ones((3, 3), bool)

# SỬA TAY: {khung: [(y, x, chỉ số màu trong PAL hoặc None = trong suốt), ...]} – áp sau bước dọn, trước ổn định thời gian
SUA_TAY = {}


def chu(c):
    try: return ImageFont.truetype(FONT, c)
    except Exception: return ImageFont.load_default()


def pal_idx(rgb):
    """rgb (…,3) int → chỉ số màu bảng gần nhất (Euclid RGB)"""
    d = ((rgb[..., None, :].astype(np.int64) - PAL_RGB[None]) ** 2).sum(-1)
    return d.argmin(-1)


# ---------------------------------------------------------------- 1. tách khung
def mat_na_dac(a, so):
    al = a[..., 3]
    if (al == 255).mean() > 0.98 or (al == al[0, 0]).all():     # không có alpha thật → nền đen đặc, flood fill từ mép
        toi = a[..., :3].max(-1) < 24
        lab, n = ndimage.label(toi)
        mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        nen = np.isin(lab, list(mep))
        so['tachNen'] = 'flood fill vùng tối (max RGB < 24) liền với 4 mép'
        return ~nen
    so['tachNen'] = 'alpha ≥ 128 (sheet có alpha thật; viền mềm alpha < 128 bị bỏ)'
    return al >= 128


def tach_khung(a, so_khung, so):
    dac = mat_na_dac(a, so)
    lab, n = ndimage.label(dac)
    sz = np.bincount(lab.ravel()); sz[0] = 0
    lon = [i for i in range(1, n + 1) if sz[i] >= 0.02 * sz.max()]
    khung = []
    if len(lon) >= so_khung:
        lon.sort(key=lambda i: np.where(lab == i)[1].min())
        if len(lon) > so_khung:      # dư mảnh: gộp mảnh nhỏ vào mảnh lớn gần nhất theo x
            chinh = sorted(lon, key=lambda i: -sz[i])[:so_khung]; chinh.sort(key=lambda i: np.where(lab == i)[1].min())
            tam = [np.where(lab == i)[1].mean() for i in chinh]
            for i in lon:
                if i in chinh: continue
                cx = np.where(lab == i)[1].mean(); k = int(np.argmin([abs(cx - t) for t in tam])); lab[lab == i] = chinh[k]
            lon = chinh
        for i in lon:
            m = lab == i; ys, xs = np.where(m)
            khung.append({'mask': m, 'bbox': (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))})
        so['tachKhung'] = 'thành phần liên thông (%d mảnh lớn)' % len(lon)
    else:                             # chia cột đều
        W = a.shape[1]; p = W / so_khung
        for k in range(so_khung):
            m = np.zeros_like(dac); x0, x1 = int(k * p), int((k + 1) * p); m[:, x0:x1] = dac[:, x0:x1]
            ys, xs = np.where(m)
            khung.append({'mask': m, 'bbox': (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))})
        so['tachKhung'] = 'chia cột đều (chỉ thấy %d mảnh lớn)' % len(lon)
    return khung


def tim_mat(a, k):
    """2 cụm vàng nhỏ ở vùng mặt (hàng 20–45 % chiều cao, nửa phải bbox) → [(x, y) tuyệt đối] hoặc []"""
    x0, y0, x1, y1 = k['bbox']; h = y1 - y0 + 1; w = x1 - x0 + 1
    rgb = a[..., :3].astype(int)
    vang = (rgb[..., 0] > 170) & (rgb[..., 1] > 140) & (rgb[..., 2] < 160) & (rgb[..., 0] > rgb[..., 2] + 60) & k['mask']
    vung = np.zeros_like(vang); vung[y0 + int(h * 0.2):y0 + int(h * 0.45), x0 + int(w * 0.4):x1 + 1] = True
    lab, n = ndimage.label(vang & vung); sz = np.bincount(lab.ravel()); sz[0] = 0
    cum = []
    for i in range(1, n + 1):
        if sz[i] < 8 or sz[i] > 400: continue
        ys, xs = np.where(lab == i); cum.append((int(sz[i]), float(xs.mean()), float(ys.mean())))
    cum.sort(reverse=True)
    mat = [(c[1], c[2]) for c in cum[:2]]
    return sorted(mat)


# ---------------------------------------------------------------- 2. thu nhỏ
def thu_khung(a, k, s, cach):
    """trả về (ci, co): ci chỉ số màu (H×W), co mặt nạ đặc; kích thước = bbox × s (làm tròn)"""
    x0, y0, x1, y1 = k['bbox']
    sub = a[y0:y1 + 1, x0:x1 + 1]; m = k['mask'][y0:y1 + 1, x0:x1 + 1]
    H, W = m.shape; h, w = max(1, int(round(H * s))), max(1, int(round(W * s)))
    idx = pal_idx(sub[..., :3])
    ci = np.full((h, w), -1, np.int32); co = np.zeros((h, w), bool)
    for yy in range(h):
        ys, ye = int(yy / s), max(int(yy / s) + 1, int((yy + 1) / s))
        for xx in range(w):
            xs, xe = int(xx / s), max(int(xx / s) + 1, int((xx + 1) / s))
            bm = m[ys:ye, xs:xe]
            if cach == 'nearest':
                cy, cx = min(H - 1, int((yy + 0.5) / s)), min(W - 1, int((xx + 0.5) / s))
                if m[cy, cx]: co[yy, xx] = True; ci[yy, xx] = idx[cy, cx]
            else:
                if bm.sum() * 2 < bm.size: continue
                bi = idx[ys:ye, xs:xe][bm]
                co[yy, xx] = True; ci[yy, xx] = np.bincount(bi, minlength=12).argmax()
    return ci, co


# ---------------------------------------------------------------- 4. dọn
def lang_gieng(m, dy, dx):
    o = np.zeros_like(m)
    H, W = m.shape
    ys, ye = max(0, dy), min(H, H + dy); xs, xe = max(0, dx), min(W, W + dx)
    o[ys:ye, xs:xe] = m[ys - dy:ye - dy, xs - dx:xe - dx]
    return o


def don(ci, co, so):
    ci = ci.copy(); co = co.copy()
    # a) lỗ trong ≤ 2 px (vùng trong suốt không liền mép) → lấp màu lân cận đa số
    lab, n = ndimage.label(~co); mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    sz = np.bincount(lab.ravel()); d = 0
    for i in range(1, n + 1):
        if i in mep or sz[i] > 2: continue
        for y, x in zip(*np.where(lab == i)):
            lk = [ci[y + dy, x + dx] for dy, dx in N4 if 0 <= y + dy < N and 0 <= x + dx < N and co[y + dy, x + dx] and ci[y + dy, x + dx] != VIEN]
            if not lk: lk = [ci[y + dy, x + dx] for dy, dx in N4 if 0 <= y + dy < N and 0 <= x + dx < N and co[y + dy, x + dx]]
            co[y, x] = True; ci[y, x] = max(set(lk), key=lk.count); d += 1
    so['loLap'] = d
    # b) đốm 1–2 px màu tối/trung lọt trong đúng 1 màu khác (lân cận 8) → hoà vào màu đó
    d = 0
    for mau in range(12):
        if mau in BAO_VE: continue
        lab, n = ndimage.label(co & (ci == mau), structure=S8); sz = np.bincount(lab.ravel())
        for i in range(1, n + 1):
            if sz[i] > 2: continue
            pts = list(zip(*np.where(lab == i))); xung = set()
            for y, x in pts:
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        yy, xx = y + dy, x + dx
                        if 0 <= yy < N and 0 <= xx < N and (yy, xx) not in pts:
                            xung.add(int(ci[yy, xx]) if co[yy, xx] else -1)
            if len(xung) == 1 and -1 not in xung:
                for y, x in pts: ci[y, x] = xung.pop() if False else list(xung)[0]
                d += 1
    so['domHoa'] = d
    # c) đốm đen lẻ trong lòng: #0C0F14 có ≥ 3 lân cận 4 đặc màu khác → màu lân cận đa số (2 lượt)
    d = 0
    for _ in range(2):
        b = ci.copy()
        for y in range(N):
            for x in range(N):
                if not co[y, x] or ci[y, x] != VIEN: continue
                lk = [ci[y + dy, x + dx] for dy, dx in N4 if 0 <= y + dy < N and 0 <= x + dx < N and co[y + dy, x + dx] and ci[y + dy, x + dx] != VIEN]
                if len(lk) >= 3: b[y, x] = max(set(lk), key=lk.count); d += 1
        ci = b
    so['domDenBo'] = d
    # d) mấu 1 px ở silhouette: ≤ 1 lân cận 4 đặc → bỏ
    nb = sum(lang_gieng(co, dy, dx).astype(int) for dy, dx in N4)
    mau = co & (nb <= 1); so['mauBo'] = int(mau.sum()); co &= ~mau
    # e) viền ngoài 1 px liền: pixel đặc kề trong suốt (lân cận 4) → #0C0F14
    rong = ~co; ke = np.zeros_like(co)
    for dy, dx in N4: ke |= lang_gieng(rong, dy, dx)
    ke[0] |= True; ke[-1] |= True; ke[:, 0] |= True; ke[:, -1] |= True
    v = co & ke; so['vienNgoaiDoi'] = int((v & (ci != VIEN)).sum()); ci[v] = VIEN
    ci[~co] = -1
    return ci, co


def dau_than():
    """số hàng dưới hàng mắt vẫn tính là đầu/thân (13 ở cỡ 46, tỉ lệ theo --cao)"""
    return int(round(13 * CAO / 46.0))


def diem_doc(ci, co, mat):
    """điểm 'khó đọc' của 1 khung (thấp = tốt): mảnh rời, lỗ, đốm 1–2 px, mắt mất"""
    lab, n = ndimage.label(co); manh = n - 1
    lab, n = ndimage.label(~co); mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}; lo = n - len(mep)
    dom = 0
    for mau in range(12):
        lab, n = ndimage.label(co & (ci == mau), structure=S8); sz = np.bincount(lab.ravel())
        dom += int(((sz[1:] <= 2)).sum())
    matMat = sum(1 for x, y in mat if not (0 <= y < N and 0 <= x < N and co[y, x] and ci[y, x] in (9, 10)))
    return {'manhRoi': int(manh), 'lo': int(lo), 'dom12px': int(dom), 'matMat': int(matMat), 'diem': int(manh * 5 + lo * 2 + dom + matMat * 10)}


# ---------------------------------------------------------------- 6. ổn định thời gian
def on_dinh(frames, hangMat, nhun, so):
    """frames: list (ci, co) đã căn trong ô N. So trong hệ đã khử nhún (dịch khung lên nhun[i]); vùng đầu/thân = hàng ≤ hangMat + dau_than()"""
    n = len(frames); key = []
    for i, (ci, co) in enumerate(frames):
        k = np.full((N, N), -2, np.int32); k[co] = ci[co]
        key.append(np.roll(k, -nhun[i], axis=0) if nhun[i] else k)
    doi = [0] * n; out = []
    for i in range(n):
        cur, prv, nxt = key[i], key[(i - 1) % n], key[(i + 1) % n]
        le = (cur != prv) & (cur != nxt) & (prv == nxt)
        le[hangMat + dau_than() + 1:] = False
        lab, nl = ndimage.label(le, structure=S8); sz = np.bincount(lab.ravel())
        dom = np.isin(lab, 1 + np.where(sz[1:] <= 3)[0]) if nl else np.zeros((N, N), bool)
        k = cur.copy(); k[dom] = prv[dom]; doi[i] = int(dom.sum())
        if nhun[i]: k = np.roll(k, nhun[i], axis=0)
        co = k > -2; ci = np.where(co, k, -1); out.append((ci, co))
    so['onDinhThoiGianPx'] = doi
    return out


# ---------------------------------------------------------------- xuất ảnh
def rgba(ci, co):
    px = np.zeros((N, N, 4), np.uint8); px[co, :3] = PAL_RGB[np.clip(ci[co], 0, 11)]; px[co, 3] = 255
    return Image.fromarray(px, 'RGBA')


def to_x(im, s): return im.resize((im.width * s, im.height * s), Image.NEAREST)


def day_khung(frames, S, nhan):
    W = len(frames) * (N * S + 4) + 4; H = N * S + 28
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f = chu(12)
    for i, im in enumerate(frames):
        x = 4 + i * (N * S + 4); out.alpha_composite(to_x(im, S), (x, 4))
        dr.rectangle([x, 4, x + N * S - 1, 4 + N * S - 1], outline=(60, 70, 85, 255)); dr.text((x + 3, N * S + 7), nhan[i], font=f, fill=(138, 150, 166, 255))
    return out


def gif(frames, duong, S, ms):
    ims = []
    for im in frames:
        bg = Image.new('RGBA', (N, N), NEN); bg.alpha_composite(im)
        ims.append(to_x(bg, S).convert('P', palette=Image.ADAPTIVE, colors=32))
    ims[0].save(duong, save_all=True, append_images=ims[1:], duration=ms, loop=0, disposal=2)


def so_sanh_goc(goc, cuoi, S, nhan_goc, nhan_cuoi):
    W = len(goc) * (N * S + 6) + 6; H = 2 * (N * S + 22) + 24
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f = chu(12)
    dr.text((6, 4), 'Hàng trên: ' + nhan_goc + ' · Hàng dưới: ' + nhan_cuoi, font=f, fill=(230, 230, 230, 255))
    for r, (hang, nhan) in enumerate(((goc, 'gốc'), (cuoi, 'sau dọn'))):
        y = 24 + r * (N * S + 22)
        for c, im in enumerate(hang):
            x = 6 + c * (N * S + 6); out.alpha_composite(to_x(im, S), (x, y + 16)); dr.rectangle([x, y + 16, x + N * S - 1, y + 16 + N * S - 1], outline=(70, 80, 95, 255))
            dr.text((x, y + 1), ('F%d ' % c) + nhan, font=f, fill=(230, 230, 230, 255))
    return out


def chong_silhouette(frames, S=6):
    from PIL import ImageFilter
    W1 = N * S + 16; out = Image.new('RGBA', (W1 * 2, N * S + 60), NEN); dr = ImageDraw.Draw(out)
    MAU = [(83, 204, 147), (131, 170, 230), (225, 184, 90), (230, 120, 120), (40, 140, 90), (70, 110, 200), (200, 140, 40), (200, 70, 90)]
    for i, im in enumerate(frames):
        a = im.getchannel('A').point(lambda v: 255 if v > 0 else 0)
        mo = Image.new('RGBA', (N, N), (236, 240, 244, 255)); mo.putalpha(a.point(lambda v: 40 if v else 0)); out.alpha_composite(to_x(mo, S), (8, 8))
        ero = a.filter(ImageFilter.MinFilter(3)); bm = Image.fromarray(((np.array(a) > 0) & (np.array(ero) == 0)).astype(np.uint8) * 255, 'L')
        c = Image.new('RGBA', (N, N), MAU[i % 8] + (255,)); c.putalpha(bm); out.alpha_composite(to_x(c, S), (W1 + 8, 8))
    for ox in (8, W1 + 8):
        px, py = ox + (PIVOT[0] + 0.5) * S, 8 + (PIVOT[1] + 0.5) * S
        dr.line([px - 10, py, px + 10, py], fill=(255, 60, 60, 255), width=2); dr.line([px, py - 10, px, py + 10], fill=(255, 60, 60, 255), width=2)
    f = chu(12)
    dr.text((8, N * S + 14), 'Trái: %d khung chồng mờ ×%d (càng sáng = càng nhiều khung có pixel). Phải: đường biên từng khung một màu' % (len(frames), S), font=f, fill=(230, 235, 240, 255))
    dr.text((8, N * S + 32), 'F0 xanh lá, F1 xanh dương, F2 vàng, F3 đỏ, F4–F7 cùng thứ tự màu đậm hơn · chữ thập đỏ = pivot [%d,%d]' % tuple(PIVOT), font=f, fill=(230, 235, 240, 255))
    return out


def so_sanh_cu_moi(cu, moi, S, nhan_cu, nhan_moi):
    """hàng trên: bản cũ (ô nhỏ hơn) phóng ×S; hàng dưới: bản mới phóng ×S – cùng tỉ lệ, chân cùng hàng đáy ô → thấy chi tiết thêm"""
    Nc = cu[0].width; Nm = moi[0].width
    cw = max(Nc, Nm) * S + 6; W = len(moi) * cw + 6; H = (Nc + Nm) * S + 70
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f = chu(12)
    dr.text((6, 4), 'Hàng trên: ' + nhan_cu + ' · Hàng dưới: ' + nhan_moi + ' · cùng phóng ×%d, pivot chân cùng cột' % S, font=f, fill=(230, 230, 230, 255))
    y1 = 24; y2 = y1 + Nc * S + 22
    for c in range(len(moi)):
        x = 6 + c * cw
        if c < len(cu):
            ox = x + (Nm - Nc) * S // 2
            out.alpha_composite(to_x(cu[c], S), (ox, y1 + 16)); dr.rectangle([ox, y1 + 16, ox + Nc * S - 1, y1 + 16 + Nc * S - 1], outline=(70, 80, 95, 255))
        dr.text((x, y1 + 1), 'F%d ô %d' % (c, Nc), font=f, fill=(230, 230, 230, 255))
        out.alpha_composite(to_x(moi[c], S), (x, y2 + 16)); dr.rectangle([x, y2 + 16, x + Nm * S - 1, y2 + 16 + Nm * S - 1], outline=(70, 80, 95, 255))
        dr.text((x, y2 + 1), 'F%d ô %d' % (c, Nm), font=f, fill=(230, 230, 230, 255))
    return out


def lat_check(frames, S=4):
    fw = N; px, py = PIVOT; pl = [fw - 1 - px, py]; cw = N * S + 8; W = len(frames) * cw * 2 + 8; H = N * S + 62
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f = chu(11); kq = []
    for i, im in enumerate(frames):
        lat = im.transpose(Image.FLIP_LEFT_RIGHT)
        for k, (img, piv, ten) in enumerate(((im, PIVOT, 'thuận'), (lat, pl, 'lật'))):
            ox = 4 + (i * 2 + k) * cw; X, Y = ox + (px + 0.5) * S, 20 + (py + 0.5) * S
            dx, dy = int(round(X - (piv[0] + 0.5) * S)), int(round(Y - (piv[1] + 0.5) * S))
            out.alpha_composite(to_x(img, S), (dx, dy)); dr.rectangle([dx, dy, dx + N * S - 1, dy + N * S - 1], outline=(60, 70, 85, 255))
            dr.line([X - 7, Y, X + 7, Y], fill=(255, 70, 70, 255), width=2); dr.line([X, Y - 7, X, Y + 7], fill=(255, 70, 70, 255), width=2)
            dr.text((ox + 2, 22 + N * S), 'F%d %s' % (i, ten), font=f, fill=(138, 150, 166, 255))
        b1 = im.getbbox(); b2 = lat.getbbox()
        t1 = {'trai': b1[0] - px, 'phai': b1[2] - 1 - px, 'day': b1[3] - 1 - py}; t2 = {'trai': b2[0] - pl[0], 'phai': b2[2] - 1 - pl[0], 'day': b2[3] - 1 - py}
        lech = {'trai': t1['trai'] + t2['phai'], 'phai': t1['phai'] + t2['trai'], 'day': t1['day'] - t2['day']}
        a1 = np.array(im)[..., 3] > 0; a2 = np.array(lat)[..., 3] > 0; sai = 0
        for x in range(N):
            xl = 2 * px - x - (px - pl[0])
            if 0 <= xl < N: sai += int((a1[:, x] != a2[:, xl]).sum())
            else: sai += int(a1[:, x].sum())
        kq.append({'khung': i, 'thuan': t1, 'lat': t2, 'lech': lech, 'saiPixel': sai, 'dung': lech == {'trai': 0, 'phai': 0, 'day': 0} and sai == 0})
    dr.text((8, H - 14), 'pivot thuận [%d,%d] · pivotLat [%d,%d] · chữ thập = điểm chân chung · số liệu trong kiem-tra.json ("lat")' % (px, py, pl[0], pl[1]), font=f, fill=(138, 150, 166, 255))
    return out, kq


def trong_game(frames, ten, nhan=''):
    spec = importlib.util.spec_from_file_location('build', os.path.join(ROOT, 'proto-lam', 'build.py')); b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
    nen = b.ghep_nen().convert('RGBA'); DAT = 241
    try:
        atlas = json.load(open(os.path.join(ROOT, 'art', 'sprite', 'atlas.json'))); q = atlas['quaiChuong']
        qs = Image.open(os.path.join(ROOT, 'art', 'sprite', 'quai-chuong.png')).convert('RGBA')
        f0 = q['anims']['idle']['frames'][0]; quai = qs.crop((f0['x'], f0['y'], f0['x'] + q['w'], f0['y'] + q['h'])); qp = q['pivot']
    except Exception: quai = None
    # 8 khung rải đều từ mép trái tới sát quái (quái ở x=457, pivot qp): bước = (chỗ trống) / 7, tối đa 54; nếu khung rộng hơn bước thì các khung chờm nhau ở mép (chấp nhận, ghi chú)
    rongMax = max(im.getbbox()[2] - im.getbbox()[0] for im in frames)
    xTrai = 4 + rongMax // 2; xPhai = (457 - qp['x'] if quai is not None else 480) - 4 - rongMax // 2
    buoc = min(54, (xPhai - xTrai) // max(1, len(frames) - 1)); xs = [xTrai + i * buoc for i in range(len(frames))]
    for i, im in enumerate(frames): nen.alpha_composite(im, (xs[i] - PIVOT[0], DAT - PIVOT[1]))
    if quai is not None: nen.alpha_composite(quai, (457 - qp['x'], DAT - qp['y']))
    x1 = nen.copy()
    big = nen.resize((480 * 4, 270 * 4), Image.NEAREST); d = ImageDraw.Draw(big); f = chu(22); f16 = chu(16)
    for i, x in enumerate(xs): d.text((x * 4 - 12, DAT * 4 + 12), 'F%d' % i, font=f16, fill=(243, 230, 200, 255), stroke_width=3, stroke_fill=(12, 15, 20, 255))
    d.text((12, 12), 'trong-game-x4.png · nền Làng Chuông 480×270 phóng ×4 · Lam %s (ChatGPT → cao %d, ô %d, pivot [%d,%d]) chân đặt tại y=241 %s' % (ten, CAO, N, PIVOT[0], PIVOT[1], nhan), font=f, fill=(230, 235, 240, 255), stroke_width=3, stroke_fill=(12, 15, 20, 255))
    return x1, big, {'xChan': xs, 'buoc': buoc, 'rongMax': int(rongMax), 'chomNhau': bool(rongMax > buoc), 'quai': None if quai is None else {'x': 457, 'w': quai.width, 'h': quai.height}}


def anim2d_check(sheet_png, ten, duong_anh, json_path=None):
    """mở game/xem-thu/anim2d.html qua http cục bộ (không sửa trang), nạp sheet bằng ô URL, chọn animation, Phát 20 vòng, Kiểm lật, chụp.
    Trang luôn fetch ../anim/lam.anim.json (ô 64) và dùng JSON đó cho mọi PNG nạp sau; với ô ≠ 64 phải CHUYỂN HƯỚNG yêu cầu đó
    (page.route) sang json_path vừa xuất – chỉ trong trình duyệt headless, file trang không đổi."""
    from playwright.sync_api import sync_playwright
    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k): super().__init__(*a, directory=GAME, **k)
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(('127.0.0.1', 0), H); port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    rel = os.path.relpath(sheet_png, GAME).replace(os.sep, '/')
    args = ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl']
    try:
        with sync_playwright() as pw:
            kw = {'args': args}
            if os.path.isfile('/opt/pw-browsers/chromium'): kw['executable_path'] = '/opt/pw-browsers/chromium'
            br = pw.chromium.launch(**kw)
            try:
                page = br.new_page(viewport={'width': 760, 'height': 1200}); loi = []; chuyenHuong = []
                page.on('pageerror', lambda e: loi.append(str(e)))
                if json_path:
                    jrel = os.path.relpath(json_path, GAME).replace(os.sep, '/')
                    def _route(route):
                        chuyenHuong.append(route.request.url)
                        route.continue_(url='http://127.0.0.1:%d/%s' % (port, jrel))
                    page.route('**/anim/lam.anim.json', _route)
                page.goto('http://127.0.0.1:%d/xem-thu/anim2d.html' % port); page.wait_for_timeout(600)
                page.fill('#uPng', 'http://127.0.0.1:%d/%s' % (port, rel)); page.click('#bUrl')
                page.wait_for_function("document.getElementById('nguon').textContent.indexOf('PNG') === 0", timeout=10000)
                page.click('#rAnim button[data-ten="%s"]' % ten); page.wait_for_timeout(700)
                page.click('#z6' if N * 6 <= 400 else '#z3'); page.wait_for_timeout(300)   # canvas trang rộng cố định 400 px: ô 80 ×6 = 480 bị cắt → dùng ×3
                page.click('#bVong'); page.wait_for_timeout(400); kqVong = page.inner_text('#kqKiem')
                page.click('#bKiemLat'); page.wait_for_timeout(300); kqLat = page.inner_text('#kqKiem')
                info = page.evaluate("() => ({ten: document.getElementById('iTen').textContent, fps: document.getElementById('iFps').textContent, loop: document.getElementById('iLoop').textContent, nguon: document.getElementById('nguon').textContent, msg: document.getElementById('msg').textContent})")
                page.screenshot(path=duong_anh, full_page=True)
                return {'trang': info, 'phat20Vong': kqVong, 'kiemLat': kqLat, 'loiJS': loi,
                        'chuyenHuongJson': ('%d yêu cầu ../anim/lam.anim.json → %s (chỉ trong headless, trang không đổi)' % (len(chuyenHuong), os.path.relpath(json_path, ROOT))) if json_path else 'không'}
            finally: br.close()
    finally: srv.shutdown(); srv.server_close()


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sheet', required=True); ap.add_argument('--so-khung', type=int, default=8); ap.add_argument('--ra', required=True)
    ap.add_argument('--cao', type=int, default=64, help='chiều cao nhân vật (px), mặc định 64'); ap.add_argument('--o', type=int, default=80, help='cỡ ô sprite, mặc định 80 → pivot [o/2, o-1]')
    ap.add_argument('--ten', default='run'); ap.add_argument('--fps', type=int, default=12)
    ap.add_argument('--phuong-phap', default='auto', choices=['auto', 'da-so', 'nearest'])
    ap.add_argument('--sheet-game', default=None, help='đường dẫn không đuôi, vd game/anim/lam-chatgpt-80 → .png + .anim.json')
    ap.add_argument('--so-voi', default=None, help='thư mục bản cũ (ten-0..N.png) để xuất so-sanh-46-64-x4.png')
    ap.add_argument('--khong-chromium', action='store_true')
    o = ap.parse_args()
    global N, PIVOT, CAO
    N = o.o; PIVOT = [N // 2, N - 1]; CAO = o.cao
    if o.cao > N - 4: sys.exit('--cao %d quá sát ô %d (cần chừa ≥ 4 px cho khung chân duỗi)' % (o.cao, N))
    os.makedirs(o.ra, exist_ok=True); so = {'nguon': o.sheet, 'soKhung': o.so_khung, 'cao': o.cao, 'o': N, 'pivot': PIVOT, 'fps': o.fps, 'khung': {}}
    a = np.array(Image.open(o.sheet).convert('RGBA'))
    so['kichThuocSheet'] = [int(a.shape[1]), int(a.shape[0])]
    # 1. tách
    khung = tach_khung(a, o.so_khung, so)
    caoNguon = [k['bbox'][3] - k['bbox'][1] + 1 for k in khung]
    s = o.cao / float(np.median(caoNguon)); so['tyLe'] = {'s': round(s, 5), 'caoNguon': caoNguon, 'trungVi': float(np.median(caoNguon)), 'caoRaTheoKhung': [round(c * s, 1) for c in caoNguon]}
    for i, k in enumerate(khung):
        k['mat'] = tim_mat(a, k)
        so['khung'][i] = {'bboxNguon': list(k['bbox']), 'caoNguon': caoNguon[i], 'rongNguon': k['bbox'][2] - k['bbox'][0] + 1, 'matNguon': [[round(x, 1), round(y, 1)] for x, y in k['mat']]}
    # 2. thu nhỏ 2 cách, chấm điểm
    thu = {}
    for cach in ('da-so', 'nearest'):
        thu[cach] = []
        for i, k in enumerate(khung):
            ci, co = thu_khung(a, k, s, cach)
            thu[cach].append((ci, co))
    # mắt trong hệ khung thu (toạ độ tương đối bbox × s)
    matThu = []
    for k in khung:
        x0, y0 = k['bbox'][:2]
        matThu.append([(int((mx - x0) * s), int((my - y0) * s)) for mx, my in k['mat']])

    def dat_vao_o(ci, co):
        h, w = ci.shape; CI = np.full((N, N), -1, np.int32); CO = np.zeros((N, N), bool)
        CI[:h, :w] = ci; CO[:h, :w] = co; return CI, CO
    diem = {}
    for cach in ('da-so', 'nearest'):
        diem[cach] = []
        for i in range(len(khung)):
            CI, CO = dat_vao_o(*thu[cach][i]); CI2, CO2 = don(CI, CO, {})
            diem[cach].append(diem_doc(CI2, CO2, matThu[i]))
        diem[cach + 'Tong'] = int(sum(d['diem'] for d in diem[cach]))
    chon = o.phuong_phap if o.phuong_phap != 'auto' else ('nearest' if diem['nearestTong'] < diem['da-soTong'] else 'da-so')
    so['thuNho'] = {'diem': diem, 'chon': chon, 'quyTac': 'auto: điểm = mảnh rời×5 + lỗ×2 + đốm 1–2 px + mắt mất×10, sau dọn; thấp hơn thắng, hoà → da-so'}
    # 3–4. mắt + dọn trên phương án chọn (và bản "gốc nearest chưa dọn" để so sánh)
    frames = []; gocNearest = []
    for i, k in enumerate(khung):
        ci, co = thu[chon][i]; s_i = so['khung'][i]
        ci = ci.copy(); co = co.copy(); matDat = 0
        for (mx, my) in matThu[i]:
            if 0 <= my < ci.shape[0] and 0 <= mx < ci.shape[1]:
                # màu mắt = màu bảng đa số của cụm mắt nguồn (thường #E1B85A hoặc #F3E6C8)
                if not (co[my, mx] and ci[my, mx] in (9, 10)):
                    co[my, mx] = True; ci[my, mx] = 9; matDat += 1
        s_i['matDatLai'] = matDat
        CI, CO = dat_vao_o(ci, co); CI, CO = don(CI, CO, s_i)
        for (y, x, c) in SUA_TAY.get(i, []):
            if c is None: CO[y, x] = False; CI[y, x] = -1
            else: CO[y, x] = True; CI[y, x] = c
        s_i['suaTay'] = len(SUA_TAY.get(i, []))
        frames.append((CI, CO))
        gn = dat_vao_o(*thu['nearest'][i]); gocNearest.append(gn)
    # 5. căn: ngang theo tâm mắt, dọc theo chân/mắt
    matO = [((mt[0][0] + mt[-1][0]) / 2.0, (mt[0][1] + mt[-1][1]) / 2.0) if mt else None for mt in matThu]
    if any(m is None for m in matO):     # thiếu mắt → dùng tâm 6 hàng đỉnh mũ
        for i, (CI, CO) in enumerate(frames):
            if matO[i] is None:
                ys, xs = np.where(CO); t = ys.min(); cx = xs[ys <= t + 5].mean(); matO[i] = (cx, t + int(round(14 * CAO / 46.0)))
    day = [int(np.where(CO)[0].max()) for CI, CO in frames]
    trai = [int(np.where(CO)[1].min()) for CI, CO in frames]; phai = [int(np.where(CO)[1].max()) for CI, CO in frames]
    # cột mắt chung: sao cho gộp bbox mọi khung cân quanh cột 32
    lT = min(trai[i] - matO[i][0] for i in range(len(frames))); lP = max(phai[i] - matO[i][0] for i in range(len(frames)))
    EX = int(round(PIVOT[0] - (lT + lP) / 2.0))
    dayTV = float(np.median(day)); dayMat = [day[i] - matO[i][1] for i in range(len(frames))]   # khoảng mắt→chân từng khung
    nguongBay = 2.5 * CAO / 46.0                                   # cỡ 46: 2,5 px; cỡ 64: 3,5 px (cùng tỉ lệ thân)
    chongDat = [dayMat[i] >= np.median(dayMat) - nguongBay for i in range(len(frames))]
    ER = int(round(np.median([PIVOT[1] - dayMat[i] for i in range(len(frames)) if chongDat[i]])))     # hàng mắt chuẩn khi chân ở 63
    dat = []; nhun = []
    for i, (CI, CO) in enumerate(frames):
        dx = EX - int(round(matO[i][0]))
        if chongDat[i]: dy = PIVOT[1] - day[i]
        else: dy = ER - int(round(matO[i][1]))
        hangMat = int(round(matO[i][1])) + dy; nhun.append(hangMat - ER)
        CI2 = np.full((N, N), -1, np.int32); CO2 = np.zeros((N, N), bool)
        ys, xs = np.where(CO)
        for y, x in zip(ys, xs):
            Y, X = y + dy, x + dx
            if 0 <= Y < N and 0 <= X < N: CI2[Y, X] = CI[y, x]; CO2[Y, X] = True
        s_i = so['khung'][i]; s_i.update({'dich': [dx, dy], 'chongDat': bool(chongDat[i]), 'hangMat': hangMat, 'nhunDau': hangMat - ER, 'pixelRoiNgoaiO': int(len(ys) - CO2.sum())})
        dat.append((CI2, CO2))
        gn = gocNearest[i]; CIg = np.full((N, N), -1, np.int32); COg = np.zeros((N, N), bool)
        ys, xs = np.where(gn[1])
        for y, x in zip(ys, xs):
            Y, X = y + dy, x + dx
            if 0 <= Y < N and 0 <= X < N: CIg[Y, X] = gn[0][y, x]; COg[Y, X] = True
        gocNearest[i] = (CIg, COg)
    so['can'] = {'cotMat': EX, 'hangMatChuan': ER, 'vungDauThan': 'hàng ≤ %d' % (ER + dau_than()), 'nguongBayPx': round(nguongBay, 2), 'quyTac': 'ngang: tâm 2 mắt → cột %d; dọc: khung chống đất hàng đáy = %d, khung bay (mắt→chân ngắn hơn trung vị ≥ %.1f px) giữ hàng mắt = %d' % (EX, PIVOT[1], nguongBay, ER)}
    # 6. ổn định thời gian
    dat = on_dinh(dat, ER, nhun, so)
    # viền ngoài lại lần cuối (ổn định có thể đổi pixel biên)
    cuoi = []
    for i, (CI, CO) in enumerate(dat):
        CI, CO = don(CI, CO, {}); cuoi.append((CI, CO))
    ims = [rgba(*f) for f in cuoi]; imsGoc = [rgba(*g) for g in gocNearest]
    # 7. xuất
    ten = o.ten; ms = int(round(1000.0 / o.fps))
    for i, im in enumerate(ims): im.save(os.path.join(o.ra, '%s-%d.png' % (ten, i)))
    nhan = ['F%d · %d ms' % (i, i * ms) for i in range(len(ims))]
    day_khung(ims, 4, nhan).save(os.path.join(o.ra, '%s-x4.png' % ten)); day_khung(ims, 8, nhan).save(os.path.join(o.ra, '%s-x8.png' % ten))
    gif(ims, os.path.join(o.ra, '%s.gif' % ten), 4, ms)
    so_sanh_goc(imsGoc, ims, 4, 'ChatGPT thu nearest + khoá 12 màu (chưa dọn)', 'sau dọn (%s)' % chon).save(os.path.join(o.ra, 'so-sanh-goc-x4.png'))
    chong_silhouette(ims).save(os.path.join(o.ra, 'chong-silhouette.png'))
    x1, x4, tg = trong_game(ims, ten); x1.save(os.path.join(o.ra, 'trong-game-x1.png')); x4.save(os.path.join(o.ra, 'trong-game-x4.png')); so['trongGame'] = tg
    latIm, latKq = lat_check(ims); latIm.save(os.path.join(o.ra, 'lat-check.png')); so['lat'] = latKq
    if o.so_voi:
        cu = []
        for i in range(len(ims)):
            p = os.path.join(o.so_voi, '%s-%d.png' % (ten, i))
            if os.path.isfile(p): cu.append(Image.open(p).convert('RGBA'))
        if cu:
            so_sanh_cu_moi(cu, ims, 4, 'bản cũ ô %d (%s)' % (cu[0].width, o.so_voi), 'bản mới cao %d ô %d' % (CAO, N)).save(os.path.join(o.ra, 'so-sanh-46-64-x4.png'))
            so['soVoi'] = {'thuMuc': o.so_voi, 'oCu': cu[0].width, 'soKhungCu': len(cu)}
    # số liệu từng khung
    for i, (CI, CO) in enumerate(cuoi):
        s_i = so['khung'][i]; ys, xs = np.where(CO)
        mau = np.bincount(CI[CO], minlength=12)
        s_i.update({'bbox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())], 'cao': int(ys.max() - ys.min() + 1), 'rong': int(xs.max() - xs.min() + 1),
                    'hangDay': int(ys.max()), 'soPixel': int(CO.sum()), 'soMau': int((mau > 0).sum()), 'mau': {PAL[k]: int(mau[k]) for k in range(12) if mau[k]},
                    'alphaChi0_255': True, 'hangDayUng': int(ys.max()),
                    'matCuoi': [[int(x), int(y)] for y in range(N) for x in range(N) if CO[y, x] and CI[y, x] in (9, 10) and abs(y - s_i['hangMat']) <= 2 and abs(x - EX) <= 5],
                    'luoiKiemPx': int(mau[11]), 'chuongVangPx': int(mau[9] + mau[8]), 'vachUngXanhPx': int(mau[7]),
                    'domLeCuoi': diem_doc(CI, CO, [])['dom12px']})
    n = len(cuoi)
    so['saiKhacKhungKe'] = [int(((cuoi[i][0] != cuoi[(i + 1) % n][0]) | (cuoi[i][1] != cuoi[(i + 1) % n][1])).sum()) for i in range(n)]
    def khac(i, j, y0, y1):
        a, b = cuoi[i], cuoi[j]; m = np.zeros((N, N), bool); m[y0:y1] = True
        return int((((a[0] != b[0]) | (a[1] != b[1])) & m).sum())
    yC = ER + dau_than() + 1
    so['saiKhacKhungKeVung'] = {'dauThan(hang<%d)' % yC: [khac(i, (i + 1) % n, 0, yC) for i in range(n)], 'chan(hang>=%d)' % yC: [khac(i, (i + 1) % n, yC, N) for i in range(n)]}
    so['saiKhacChanMoiCap'] = [[khac(i, j, yC, N) for j in range(n)] for i in range(n)]
    so['chanGiongNhat'] = sorted([(khac(i, j, yC, N), i, j) for i in range(n) for j in range(i + 1, n)])[:6]
    so['tongMau'] = sorted({PAL[k] for CI, CO in cuoi for k in np.unique(CI[CO])})
    so['soMauTong'] = len(so['tongMau']); so['mauNgoaiBang'] = []
    # sheet game
    if o.sheet_game:
        cot = max(8, n); hang = 5                                # cùng bố cục lam.anim.json: 8 cột × 5 hàng (idle/run/jump/fall/attack), ô N
        sh = Image.new('RGBA', (cot * N, hang * N), (0, 0, 0, 0))
        sh.alpha_composite(ims[0], (0, 0))                     # hàng 0 idle: TẠM dùng run-0 (1 khung)
        for i, im in enumerate(ims): sh.alpha_composite(im, (i * N, N))
        sh.save(o.sheet_game + '.png')
        js = {'version': 1, 'image': os.path.basename(o.sheet_game) + '.png', 'frameWidth': N, 'frameHeight': N, 'pivot': PIVOT,
              'animations': {'idle': {'row': 0, 'frames': 1, 'fps': 8, 'loop': True}, ten: {'row': 1, 'frames': n, 'fps': o.fps, 'loop': True}}}
        with open(o.sheet_game + '.anim.json', 'w') as f: json.dump(js, f, indent=2, ensure_ascii=False); f.write('\n')
        so['sheetGame'] = {'png': o.sheet_game + '.png', 'json': o.sheet_game + '.anim.json', 'kichThuoc': [cot * N, hang * N], 'idle': 'TẠM: 1 khung = run-0 (chưa có khung đứng ChatGPT)'}
        if not o.khong_chromium:
            try: so['anim2d'] = anim2d_check(o.sheet_game + '.png', ten, os.path.join(o.ra, 'anim2d-check.png'), json_path=o.sheet_game + '.anim.json' if N != 64 else None)
            except Exception as e: so['anim2d'] = {'loi': str(e)}
    with open(os.path.join(o.ra, 'kiem-tra.json'), 'w') as f: json.dump(so, f, indent=1, ensure_ascii=False)
    print(json.dumps({'cao': CAO, 'o': N, 'pivot': PIVOT, 'chon': chon, 'diem': {k: v for k, v in diem.items() if k.endswith('Tong')}, 'can': so['can'], 'hangDay': [so['khung'][i]['hangDay'] for i in range(n)],
                      'nhun': nhun, 'saiKhacKe': so['saiKhacKhungKe'], 'onDinh': so.get('onDinhThoiGianPx'), 'soMau': so['soMauTong']}, ensure_ascii=False))


if __name__ == '__main__': main()
