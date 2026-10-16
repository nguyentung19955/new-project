"""Dựng bộ ảnh vũ khí "có gân" game/art/custom/zed-vk-gan.sprite.json (16/10/2026, luyen-vu-khi/bao-cao-3.md mục 5).

Vào: docs/anh-goc/zed/moi/vk-<loại>-gan.png — 3 khung trái → phải = Trắng / Mầm / Thành hình, nền #00FF00.
Gốc so: khung đã cắt mà dung-zed-game.py dùng dựng zed-vk (moi/<thư mục>-gif/<thư mục>/khung-0N.png).
Cách làm từng khung:
  1. tách nền xanh, tách 3 khung theo cột trống;
  2. CĂN với khung gốc cùng cấp: tìm tỉ lệ (một tỉ lệ cho cả 2 chiều) + dời x, y sao cho hình (mặt nạ) chồng khít nhất
     (IoU = phần chung / phần hợp); in IoU, lệch đầu chuôi (điểm nắm) và lệch mũi theo điểm ảnh gốc;
  3. IoU ≥ 0,95 thì DÙNG: đặt ảnh gân đã căn lên khung gốc (chỗ gân thiếu lấy điểm ảnh gốc) → co về ĐÚNG rộng × cao ô zed-vk
     (Image.BOX như dung-zed-game.py) → độ trong (đường viền) lấy y nguyên ô zed-vk: hình trong game khớp 100%, chỉ màu đổi.
     IoU < 0,95: KHÔNG dùng (ô = null, game hiện ảnh thường như cũ) — ảnh vẽ lệch hình gốc.
Ra: game/art/custom/zed-vk-gan.sprite.json (vk[loại] = [ô Trắng, ô Mầm, ô Thành hình, null], cùng thứ tự ô với zed-vk)
    + ảnh soát trong thư mục này (luoi-so-goc-gan-x3.png, can-<loại>.png) + so-lieu.json.
Chạy: python3 docs/review/ke-hoach-cai-thien/gan-vk/dung_zed_vk_gan.py   rồi   cd game && python3 build.py (+ --hai-tep)."""
import base64, io, json, os, sys
import numpy as np
from PIL import Image
from scipy.signal import fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
MOI = os.path.join(REPO, 'docs', 'anh-goc', 'zed', 'moi')
VK_TEP = os.path.join(REPO, 'game', 'art', 'custom', 'zed-vk.sprite.json')
RA = os.path.join(REPO, 'game', 'art', 'custom', 'zed-vk-gan.sprite.json')
# loại trong game → (ảnh gân, thư mục khung gốc của zed-vk: y như VK trong dung-zed-game.py)
LOAI = [('kiem', 'vk-kiem-gan', 'vk-kiem-moi'), ('thuong', 'vk-thuong-gan', 'vk-thuong'),
        ('bua', 'vk-bua-gan', 'vk-bua'), ('phitieu', 'vk-phi-tieu-gan', 'vk-phi-tieu')]
CAP = ['Trắng', 'Mầm', 'Thành hình']
NGUONG = 0.95


def tach_nen(im):
    a = np.array(im.convert('RGBA')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    xanh = (g > 150) & (g - np.maximum(r, b) > 70)
    a[..., 3] = np.where(xanh, 0, a[..., 3])
    # khử ám xanh ở mép: g không vượt max(r, b) quá nhiều
    am = (a[..., 3] > 0) & (g > np.maximum(r, b) + 30) & (np.maximum(r, b) < 120)
    a[..., 1] = np.where(am, np.maximum(r, b) + 30, g)
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')


def tach_ba(im):
    al = np.array(im)[..., 3] > 40
    cot = al.sum(axis=0) > 0
    doan, x = [], 0
    while x < len(cot):
        if cot[x]:
            x0 = x
            while x < len(cot) and cot[x]:
                x += 1
            doan.append([x0, x])
        x += 1
    doan = [d for d in doan if d[1] - d[0] > 3]
    while len(doan) > 3:
        khe = [doan[i + 1][0] - doan[i][1] for i in range(len(doan) - 1)]
        i = int(np.argmin(khe))
        doan[i] = [doan[i][0], doan[i + 1][1]]
        del doan[i + 1]
    assert len(doan) == 3, doan
    ra = []
    for x0, x1 in doan:
        c = im.crop((x0, 0, x1, im.height))
        ra.append(c.crop(c.getbbox()))
    return ra


def mat_na(im, nguong=100):
    return (np.array(im)[..., 3] > nguong).astype(np.float32)


def iou_tot_nhat(O, G):
    """O, G: mặt nạ 0/1. Trả (iou, dy, dx): đặt G tại (dx, dy) trên lưới O."""
    inter = fftconvolve(O, G[::-1, ::-1], mode='full')
    # chỉ số (i, j) ứng với dời dy = i - (G.h - 1), dx = j - (G.w - 1)
    hop = O.sum() + G.sum() - inter
    iou = inter / np.maximum(hop, 1)
    i, j = np.unravel_index(int(np.argmax(iou)), iou.shape)
    return float(iou[i, j]), i - (G.shape[0] - 1), j - (G.shape[1] - 1)


def can(goc, gan):
    """Căn ảnh gân (đã cắt sát) với khung gốc (đã cắt sát). Trả dict tỉ lệ, dời, iou + ảnh gân đã căn cỡ khung gốc."""
    Ob = mat_na(goc)
    k0 = goc.width / gan.width if goc.width >= goc.height else goc.height / gan.height
    k = k0
    # 1) cùng tỉ lệ 2 chiều: thô (co 1/4, bước 1%, ±15%)
    o4 = mat_na(goc.resize((max(1, round(goc.width / 4)), max(1, round(goc.height / 4))), Image.BOX))
    tot = None
    for kk in k * np.arange(0.85, 1.15 + 1e-9, 0.01):
        g = gan.resize((max(1, round(gan.width * kk / 4)), max(1, round(gan.height * kk / 4))), Image.BOX)
        v = iou_tot_nhat(o4, mat_na(g))[0]
        if tot is None or v > tot['iou']:
            tot = {'kx': float(kk), 'ky': float(kk), 'iou': v}
    # 2) chỉnh riêng rộng / cao (ảnh vẽ lại dày mỏng khác chút): co 1/2 bước 1% ±8%, rồi cỡ thật bước 0,25% ±1%
    for nho, pv, b in ((2, 0.08, 0.01), (1, 0.01, 0.0025)):
        o = mat_na(goc.resize((max(1, round(goc.width / nho)), max(1, round(goc.height / nho))), Image.BOX)) if nho > 1 else Ob
        kx0, ky0, tot = tot['kx'], tot['ky'], None
        for kx in kx0 * np.arange(1 - pv, 1 + pv + 1e-9, b):
            for ky in ky0 * np.arange(1 - pv, 1 + pv + 1e-9, b):
                g = gan.resize((max(1, round(gan.width * kx / nho)), max(1, round(gan.height * ky / nho))), Image.BOX)
                v = iou_tot_nhat(o, mat_na(g))[0]
                if tot is None or v > tot['iou']:
                    tot = {'kx': float(kx), 'ky': float(ky), 'iou': v}
    tot['k'] = (tot['kx'] + tot['ky']) / 2
    g = gan.resize((round(gan.width * tot['kx']), round(gan.height * tot['ky'])), Image.LANCZOS)
    v, dy, dx = iou_tot_nhat(Ob, mat_na(g))
    tot.update(iou=v, dx=int(dx), dy=int(dy))
    dat = Image.new('RGBA', goc.size, (0, 0, 0, 0))
    dat.alpha_composite(g, (max(0, dx), max(0, dy)), (max(0, -dx), max(0, -dy)))
    tot['anh'] = dat
    return tot


def dau_mut(m):
    """Đầu chuôi = (cột trái nhất, y giữa cán ở 3% bề rộng tính từ trái); mũi = cột phải nhất."""
    cols = np.nonzero(m.any(axis=0))[0]
    x0, x1 = int(cols[0]), int(cols[-1])
    xc = min(x1, x0 + max(1, int(0.03 * (x1 - x0))))
    ys = np.nonzero(m[:, xc])[0]
    return (x0, float(ys.mean())), (x1, 0.0)


def nen_tam(T):
    """Nén tấm như phiên dung lượng 16/10 (dung-luong-16-10/cong-cu/nen.py): bản không mất + bản 256 màu nếu sai số đạt ngưỡng; lấy bản nhỏ nhất."""
    sys.path.insert(0, os.path.join(HERE, '..', 'dung-luong-16-10', 'cong-cu'))
    import nen as N
    a = np.array(T); a[a[..., 3] == 0] = 0
    ung, _ = N.khong_mat(a)
    try:
        p = N.bang_256(a); tb, s99, da = N.sai_so(a, N.rgba(p))
        if tb <= N.SAI_TB and s99 <= N.SAI_99 and da <= N.SAI_ALPHA:
            ung.append(p); print('  tấm 256 màu: sai số TB %.2f, P99 %.0f, alpha %d → nhận' % (tb, s99, da))
        else:
            print('  tấm 256 màu: sai số TB %.2f, P99 %.0f, alpha %d → giữ không mất' % (tb, s99, da))
    except Exception as e:  # noqa: BLE001
        print('  bỏ qua 256 màu:', e)
    return min(ung, key=len)


def main():
    V = json.load(open(VK_TEP, encoding='utf-8'))
    tam_vk = Image.open(io.BytesIO(base64.b64decode(V['tam'].split(',', 1)[1]))).convert('RGBA')
    so_lieu, o_ra = {}, []
    for loai, ten_gan, thu in LOAI:
        ba = tach_ba(tach_nen(Image.open(os.path.join(MOI, ten_gan + '.png'))))
        for cap in range(3):
            goc_full = Image.open(os.path.join(MOI, thu + '-gif', thu, 'khung-%02d.png' % (cap + 1))).convert('RGBA')
            goc = goc_full.crop(goc_full.getbbox())
            t = can(goc, ba[cap])
            mo, mg = mat_na(goc) > 0, mat_na(t['anh']) > 0
            (c0, c1), (m0, m1) = dau_mut(mo), dau_mut(mg)
            lech_nam = float(np.hypot(c0[0] - m0[0], c0[1] - m0[1]))
            lech_mui = float(np.hypot(c1[0] - m1[0], c1[1] - m1[1]))
            dung = t['iou'] >= NGUONG
            r = V['vk'][loai][cap]
            # ghép: hình = đúng mặt nạ gốc; màu gân, chỗ gân thiếu lấy gốc
            A = np.array(t['anh']).astype(np.float32); B = np.array(goc).astype(np.float32)
            ag = A[..., 3:4] / 255.0
            mau = A[..., :3] * ag + B[..., :3] * (1 - ag)
            ghep = np.dstack([mau, B[..., 3]]).clip(0, 255).astype(np.uint8)
            ghep = Image.fromarray(ghep, 'RGBA')
            o_goc = tam_vk.crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))  # ô zed-vk đang dùng trong game
            o = ghep.resize((r[2], r[3]), Image.BOX)
            o = np.array(o); o[..., 3] = np.array(o_goc)[..., 3]  # độ trong (đường viền) lấy ĐÚNG ô zed-vk → hình khớp 100% ảnh trong game
            o[o[..., 3] == 0] = 0
            o = Image.fromarray(o, 'RGBA')
            so_lieu['%s-%d' % (loai, cap)] = {'cap': CAP[cap], 'ti_le_co': [round(t['kx'], 4), round(t['ky'], 4)], 'iou': round(t['iou'], 4),
                                              'lech_nam_px_goc': round(lech_nam, 1), 'lech_mui_px_goc': round(lech_mui, 1),
                                              'lech_nam_px_o': round(lech_nam * r[2] / goc.width, 2),
                                              'lech_mui_px_o': round(lech_mui * r[2] / goc.width, 2),
                                              'dung': dung, 'o': [r[2], r[3]]}
            print('%-7s %-10s co ×%.3f (rộng/cao %.3f)  IoU %.3f  lệch nắm %.1f / mũi %.1f điểm ảnh gốc (%.2f / %.2f điểm ảnh ô)  %s' % (
                loai, CAP[cap], t['k'], t['kx'] / t['ky'], t['iou'], lech_nam, lech_mui, lech_nam * r[2] / goc.width, lech_mui * r[2] / goc.width,
                'DÙNG' if dung else 'BỎ (< 95%)'))
            o_ra.append((loai, cap, o if dung else None, o_goc, goc, t['anh'], ghep, t['iou']))
    # tấm: mỗi loại một hàng, ô cùng cỡ ô zed-vk
    meta, vi, y, W = {}, [], 0, 0
    for loai, _, _ in LOAI:
        x, hmax, ds = 0, 0, [None, None, None, None]
        for (l, cap, o, *_r) in o_ra:
            if l != loai or o is None:
                continue
            vi.append((o, x, y)); ds[cap] = [x, y, o.width, o.height]; x += o.width + 2; hmax = max(hmax, o.height)
        meta[loai] = ds; W = max(W, x); y += hmax + 2 if hmax else 0
    T = Image.new('RGBA', (max(1, W), max(1, y)), (0, 0, 0, 0))
    for o, x, yy in vi:
        T.alpha_composite(o, (x, yy))
    png = nen_tam(T)
    tep = {'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-vk-gan', 'ten': 'Vũ khí Cu Tí có gân tiến độ (Trắng/Mầm/Thành hình)',
           'phien_ban': 1, 'tam': 'data:image/png;base64,' + base64.b64encode(png).decode(), 'vk': meta,
           'ghi_chu': 'vk[loại][cấp] = [x, y, rộng, cao] hoặc null; cùng thứ tự và cùng cỡ ô với zed-vk (js/vien_vk.js G.vkGanAnh). '
                      'Dựng: docs/review/ke-hoach-cai-thien/gan-vk/dung_zed_vk_gan.py'}
    json.dump(tep, open(RA, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('Đã ghi', os.path.relpath(RA, REPO), '(%d ô, %d KB)' % (len(vi), os.path.getsize(RA) // 1024))
    json.dump(so_lieu, open(os.path.join(HERE, 'so-lieu.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    anh_soat(o_ra)
    return 0


def nen(w, h, o=6):
    """nền ô bàn cờ để thấy rìa trong suốt"""
    a = np.zeros((h, w, 4), np.uint8); a[..., 3] = 255
    yy, xx = np.mgrid[:h, :w]
    c = ((yy // o + xx // o) % 2).astype(bool)
    a[..., :3] = np.where(c[..., None], (52, 56, 50), (40, 44, 38))
    return Image.fromarray(a, 'RGBA')


def anh_soat(o_ra):
    from PIL import ImageDraw
    Z = 3
    # 1) lưới ô game: mỗi hàng = loại × cấp: gốc | gân, phóng ×3
    cw = max(r[3].width for r in o_ra) * Z + 12
    chs = [max(r[3].height * Z, 48) + 10 for r in o_ra]
    L = Image.new('RGBA', (cw * 2 + 150, sum(chs) + 24), (28, 30, 26, 255))
    d = ImageDraw.Draw(L)
    d.text((150, 4), 'GOC (zed-vk)', fill=(230, 230, 230, 255)); d.text((150 + cw, 4), 'GAN (zed-vk-gan)', fill=(255, 233, 168, 255))
    for i, (loai, cap, o, og, goc, anh, ghep, iou) in enumerate(o_ra):
        yy = 24 + sum(chs[:i])
        d.text((6, yy + 4), '%s %s' % (loai, ['Trang', 'Mam', 'Thanh hinh'][cap]), fill=(230, 230, 230, 255))
        d.text((6, yy + 18), 'IoU %.1f%%' % (iou * 100), fill=(160, 220, 160, 255) if o is not None else (240, 120, 120, 255))
        if o is None:
            d.text((6, yy + 32), 'BO - dung anh goc', fill=(240, 120, 120, 255))
        for j, im in enumerate((og, o)):
            if im is None:
                continue
            x = 150 + j * cw
            big = im.resize((im.width * Z, im.height * Z), Image.NEAREST)
            bg = nen(big.width, big.height); bg.alpha_composite(big); L.alpha_composite(bg, (x, yy))
    L.convert('RGB').save(os.path.join(HERE, 'luoi-so-goc-gan-x3.png'), optimize=True)
    # 2) ảnh căn ở cỡ nguồn (co 1/2): gốc | gân đã căn | chồng (đỏ = chỉ gốc, lam = chỉ gân)
    for loai, _, _ in LOAI:
        hang = [r for r in o_ra if r[0] == loai]
        S = 0.5
        ws = [round(r[4].width * S) for r in hang]; hs = [round(r[4].height * S) for r in hang]
        C = Image.new('RGBA', (max(ws) * 3 + 40, sum(hs) + 20 * len(hang)), (28, 30, 26, 255))
        yy = 0
        for (l, cap, o, og, goc, anh, ghep, iou), w, h in zip(hang, ws, hs):
            mo = mat_na(goc) > 0; mg = mat_na(anh) > 0
            ch_ = np.zeros(mo.shape + (4,), np.uint8); ch_[..., 3] = 255
            ch_[mo & mg] = (200, 200, 200, 255); ch_[mo & ~mg] = (230, 60, 60, 255); ch_[~mo & mg] = (70, 120, 240, 255)
            ch_[~mo & ~mg] = (28, 30, 26, 255)
            for j, im in enumerate((goc, anh, Image.fromarray(ch_, 'RGBA'))):
                C.alpha_composite(im.resize((w, h), Image.BOX), (j * (max(ws) + 20), yy))
            ImageDraw.Draw(C).text((4, yy + h + 4), '%s IoU %.1f%%' % (['Trang', 'Mam', 'Thanh hinh'][cap], iou * 100), fill=(255, 255, 255, 255))
            yy += h + 20
        C.convert('RGB').save(os.path.join(HERE, 'can-%s.png' % loai), optimize=True)


if __name__ == '__main__':
    sys.exit(main())
