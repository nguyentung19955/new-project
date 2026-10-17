#!/usr/bin/env python3
"""PHẦN A – chẩn đoán pipeline 3D → pixel 64 của Lam (đọc raw/ do danh-gia-chup.py tạo). Ghi vào proto-lam/out/danh-gia/:
  so-sanh-3d-vs-goc.png      mẫu gốc | render 3D 512 idle | render 3D 512 run F0, chú thích số chi tiết mất ngay từ mô hình
  so-sanh-ha-phan-giai.png   gốc→64 | 512→64 nearest | 512→64 đa số | render thẳng 64 | pipeline hiện tại (×8)
  flicker-map.png            8 khung: pixel chỉ tồn tại 1 khung (đỏ) / pixel đổi so khung trước (vàng)
  ma-bo-phan.png             run-0 ×8 | ID bộ phận tô màu riêng ×8 | cặp pixel kề khác bộ phận nhưng CÙNG màu (đỏ)
  so-lieu.json               số liệu cho DANH-GIA.md
Chạy: python3 proto-lam/danh-gia.py
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
DG = os.path.join(HERE, 'out', 'danh-gia'); RAW = os.path.join(DG, 'raw')
GOC = os.path.join(ROOT, 'art', 'nhan-vat', 'lam-48', 'nguyen-con-v2-mat-sang.png')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONTB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
PAL_TEN = ['vien', 'ao0', 'ao1', 'ao2', 'xam', 'x0', 'x1', 'x2', 'v0', 'v1', 'v2', 'sang']
PAL = ['#0C0F14', '#1A212B', '#212835', '#2C3546', '#4A5A6E', '#21413A', '#32804F', '#83CC93', '#9C6B30', '#E1B85A', '#F3E6C8', '#CEF0D6']
PAL_RGB = np.array([[int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)] for h in PAL])
NEN = (42, 36, 51, 255)
ID_TEN = {1: 'mắt/khoang mặt', 2: 'mũ', 3: 'viền mũ', 4: 'thân (áo xanh)', 5: 'áo choàng', 6: 'tay xa', 7: 'tay gần', 8: 'chân xa (quần)', 9: 'chân gần (quần)',
          10: 'lưỡi kiếm', 11: 'chuôi/chắn kiếm', 12: 'chuông', 13: 'dây chuông', 14: 'thắt lưng/đai', 15: 'vạch ủng xa', 16: 'vạch ủng gần', 17: 'trâm', 18: 'ủng xa', 19: 'ủng gần'}
NHOM = {1: 'dau', 2: 'dau', 3: 'dau', 4: 'than', 14: 'than', 17: 'than', 5: 'ao', 6: 'tayG', 7: 'tayX', 8: 'chanG', 15: 'chanG', 18: 'chanG', 9: 'chanX', 16: 'chanX', 19: 'chanX', 10: 'kiem', 11: 'kiem', 12: 'chuong', 13: 'chuong'}
# màu tô ID (chỉ để minh hoạ, không phải bảng game)
ID_MAU = {1: (255, 255, 255), 2: (90, 60, 160), 3: (150, 120, 220), 4: (40, 200, 90), 5: (0, 120, 200), 6: (255, 120, 0), 7: (255, 200, 0), 8: (200, 40, 40), 9: (255, 110, 150),
          10: (180, 255, 255), 11: (120, 200, 200), 12: (255, 230, 80), 13: (200, 170, 40), 14: (120, 255, 200), 15: (0, 255, 0), 16: (160, 255, 0), 17: (255, 255, 180), 18: (130, 0, 0), 19: (255, 60, 90)}


def chu(c, bold=False):
    try: return ImageFont.truetype(FONTB if bold else FONT, c)
    except Exception: return ImageFont.load_default()


def pal_idx(rgb):
    """ảnh RGB (H,W,3) → chỉ số màu gần nhất trong bảng"""
    d = ((rgb[..., None, :].astype(int) - PAL_RGB[None, None]) ** 2).sum(-1)
    return d.argmin(-1)


def nap_khung(i):
    cuoi = np.array(Image.open(os.path.join(RAW, 'run-%d-cuoi.png' % i)).convert('RGBA'))
    idm = np.load(os.path.join(RAW, 'run-%d-id.npy' % i))
    return cuoi, idm


def to_x(im, s):
    return im.resize((im.width * s, im.height * s), Image.NEAREST)


def goc_cat():
    """mẫu gốc: tách nền hồng → RGBA, cắt sát nhân vật"""
    g = np.array(Image.open(GOC).convert('RGB')).astype(int)
    nen = (g[..., 0] > 180) & (g[..., 2] > 180) & (g[..., 1] < 120)
    a = np.where(nen, 0, 255).astype(np.uint8)
    im = Image.fromarray(np.dstack([g.astype(np.uint8), a]), 'RGBA')
    return im.crop(im.getbbox())


def goc_ve_64(gc, cao_px=46, day=63, pivot_x=32):
    """mẫu gốc thu về ô 64: cao nhân vật = cao_px (bằng Lam 3D), đa số màu trong ô + khoá bảng màu (không làm mờ)"""
    s = cao_px / gc.height
    w = max(1, round(gc.width * s))
    big = np.array(gc)
    H, W = big.shape[:2]
    out = np.zeros((64, 64, 4), np.uint8)
    # gốc đứng: tâm ngang nhân vật ≈ giữa 2 chân (ước lượng 48% chiều rộng từ trái)
    x0 = pivot_x - int(round(w * 0.48)); y0 = day - cao_px + 1
    for yy in range(cao_px):
        for xx in range(w):
            ys, ye = int(yy / s), max(int(yy / s) + 1, int((yy + 1) / s)); xs, xe = int(xx / s), max(int(xx / s) + 1, int((xx + 1) / s))
            blk = big[ys:ye, xs:xe].reshape(-1, 4)
            op = blk[blk[:, 3] > 0]
            if len(op) * 2 < len(blk): continue
            ci = pal_idx(op[:, :3][None])[0]
            c = np.bincount(ci, minlength=12).argmax()
            X, Y = x0 + xx, y0 + yy
            if 0 <= X < 64 and 0 <= Y < 64: out[Y, X] = (*PAL_RGB[c], 255)
    return Image.fromarray(out, 'RGBA')


def vien_ngoai(a):
    """thêm viền ngoài 1 px #0C0F14 (lân cận 4) vào RGBA"""
    al = a[..., 3] > 0
    nb = np.zeros_like(al)
    nb[1:] |= al[:-1]; nb[:-1] |= al[1:]; nb[:, 1:] |= al[:, :-1]; nb[:, :-1] |= al[:, 1:]
    v = nb & ~al
    o = a.copy(); o[v] = (12, 15, 20, 255)
    return o


# ---------------------------------------------------------------- A1
def a1(so):
    gc = goc_cat()
    r_idle = Image.open(os.path.join(RAW, 'idle-0-512.png')).convert('RGBA')
    r_run = Image.open(os.path.join(RAW, 'run-0-512.png')).convert('RGBA')
    # đo tỉ lệ: cao nhân vật trong 512 và cao mũ (đỉnh → mép dưới mũ) xấp xỉ bằng ID
    id512 = np.array(Image.open(os.path.join(RAW, 'idle-0-512id.png')).convert('RGBA'))[..., 0]
    ys = np.where((id512 > 0).any(1))[0]; cao3d = ys.max() - ys.min() + 1
    mu = np.where(np.isin(id512, [1, 2, 3]).any(1))[0]; caoMu3d = mu.max() - mu.min() + 1
    g = np.array(gc); ga = g[..., 3] > 0
    caoGoc = gc.height
    # mũ gốc: hàng có pixel tối (xám) ở nửa trên tới khi gặp vai – ước lượng theo tỉ lệ đo tay trên mẫu: đỉnh mũ y≈0, mép dưới mũ ≈ 0,37 chiều cao
    so['tiLe'] = {'goc_mu_tren_cao': 0.37, 'render_mu_tren_cao': round(caoMu3d / cao3d, 3), 'ghiChu': 'mũ gốc đo tay trên mẫu (đỉnh → cằm mũ ≈ 0,37 chiều cao); render đo bằng mặt nạ ID mũ+mặt / toàn thân'}
    # chiều rộng/chiều cao
    xs = np.where((id512 > 0).any(0))[0]
    ch = np.where((id512 == 12).any(1))[0]; so['tiLe']['render_chuong_tren_cao'] = round((ch.max() - ch.min() + 1) / cao3d, 3) if len(ch) else 0
    so['tiLe']['goc_chuong_tren_cao'] = 0.14   # đo tay: chuông gốc cao ≈ hàng 400→560 / 1097
    so['tiLe']['goc_rong_tren_cao'] = round(gc.width / gc.height, 3); so['tiLe']['render_rong_tren_cao'] = round((xs.max() - xs.min() + 1) / cao3d, 3)

    H = 420; s = (H - 40) / caoGoc
    gocS = gc.resize((int(gc.width * s), int(gc.height * s)), Image.LANCZOS)
    # render 512: cắt nhân vật, scale cùng chiều cao
    def catScale(im):
        b = im.getbbox(); c = im.crop(b); ss = (H - 40) / c.height
        return c.resize((int(c.width * ss), int(c.height * ss)), Image.LANCZOS)
    rI, rR = catScale(r_idle), catScale(r_run)
    W = gocS.width + rI.width + rR.width + 80
    out = Image.new('RGBA', (W, H + 330), NEN); dr = ImageDraw.Draw(out)
    f12, f14, f16 = chu(12), chu(14), chu(16, True)
    x = 20; pos = []
    for im, nhan in ((gocS, 'MẪU GỐC nguyen-con-v2-mat-sang.png'), (rI, 'RENDER 3D 512 px – Idle F0 (toon, chưa hậu kỳ pixel)'), (rR, 'RENDER 3D 512 px – Run F0')):
        out.alpha_composite(im, (x, 30)); dr.text((x, 8), nhan, font=f14, fill=(230, 230, 230, 255)); pos.append((x, 30, im.width, im.height)); x += im.width + 20
    # chú thích: toạ độ tương đối trên mẫu gốc (đo tay từ ảnh 1254)
    CHU = [
        (1, (0.555, 0.30), 'Mắt: 2 vệt vàng nhạt rõ – render 512 KHÔNG có mắt (chỉ được chấm lại 2 px ở hậu kỳ)'),
        (2, (0.60, 0.30), 'Khoang mặt đen trong mũ + mép mũ xanh sáng: render chỉ có khối mũ xám, viền xanh tô thêm ở hậu kỳ'),
        (3, (0.43, 0.02), 'Chỏm mũ nhọn gập về sau, mũ có nếp góc cạnh: render mũ tròn như quả bóng'),
        (4, (0.19, 0.25), 'Khoen tròn + dây chuông: render chỉ là 1 sợi 1 px, không có khoen'),
        (5, (0.17, 0.38), 'Chuông to (≈ %d %% chiều cao) có vành, quả lắc, bóng tối: render chuông ≈ %d %%, không chi tiết' % (round(so['tiLe']['goc_chuong_tren_cao'] * 100), round(so['tiLe']['render_chuong_tren_cao'] * 100))),
        (6, (0.56, 0.44), 'Trâm tròn sáng + đai chéo tối trên ngực: render trâm ≈ 1 px, đai bị lẫn vào thân'),
        (7, (0.50, 0.62), 'Gấu áo thân xanh rách răng cưa, có bóng tối #21413A: render thân là khối xanh phẳng, gấu thẳng'),
        (8, (0.20, 0.62), 'Áo choàng quấn ra TRƯỚC và sang bên, lót xanh lộ rộng, mép xanh: render áo là tấm phẳng treo sau lưng'),
        (9, (0.36, 0.60), 'Găng/ống tay xám sáng #4A5A6E có cổ tay: render tay là ống tối cùng màu áo'),
        (10, (0.66, 0.60), 'Chắn kiếm vàng rõ + chuôi: render chỉ còn mẩu vàng nhỏ, không có chắn ngang'),
        (11, (0.45, 0.83), 'Ủng cao có vạch xanh + khoá, mũi ủng nhô: render ủng là bầu tối, vạch mỏng'),
        (12, (0.75, 0.14), 'Tỉ lệ: gốc mũ/đầu ≈ %.2f chiều cao, render ≈ %.2f; gốc rộng/cao ≈ %.2f, render ≈ %.2f' % (0.37, so['tiLe']['render_mu_tren_cao'], so['tiLe']['goc_rong_tren_cao'], so['tiLe']['render_rong_tren_cao'])),
    ]
    gx, gy, gw, gh = pos[0]
    for n, (rx, ry), _ in CHU:
        cx, cy = gx + rx * gw, gy + ry * gh
        dr.ellipse([cx - 11, cy - 11, cx + 11, cy + 11], fill=(230, 40, 40, 255), outline=(255, 255, 255, 255))
        dr.text((cx - 4 if n < 10 else cx - 8, cy - 8), str(n), font=f12, fill=(255, 255, 255, 255))
    y = H + 10
    dr.text((20, y), 'Chi tiết của mẫu gốc bị mất/biến dạng NGAY TỪ MÔ HÌNH 3D (số đỏ trên mẫu; nhìn sang 2 render cùng vị trí):', font=f16, fill=(255, 220, 120, 255)); y += 24
    for n, _, t in CHU:
        dr.text((28, y), '%2d. %s' % (n, t), font=f12, fill=(235, 235, 235, 255)); y += 17
    dr.text((28, y + 6), 'Ngoài ra: camera 3D xoay 22° về phía trước + nhìn xuống 12° nên thấy đỉnh vai/đỉnh mũ và một phần lưng; mẫu gốc là góc nhìn ngang (side view) thuần – silhouette khác hẳn.', font=f12, fill=(200, 200, 200, 255))
    out.save(os.path.join(DG, 'so-sanh-3d-vs-goc.png'))
    so['chiTietMatTuMoHinh'] = [t for _, _, t in CHU]


# ---------------------------------------------------------------- A2
def a2(so):
    gc = goc_cat()
    g64 = goc_ve_64(gc)
    r512 = np.array(Image.open(os.path.join(RAW, 'run-0-512.png')).convert('RGBA'))
    id512 = np.array(Image.open(os.path.join(RAW, 'run-0-512id.png')).convert('RGBA'))[..., 0]
    # 512 → 64 nearest (lấy mẫu tâm ô 8×8)
    near = r512[4::8, 4::8].copy()
    near[..., :3] = PAL_RGB[pal_idx(near[..., :3])]; near[..., 3] = np.where(near[..., 3] > 127, 255, 0)
    near[near[..., 3] == 0] = 0
    # 512 → 64 đa số (ID thắng → màu đa số của ID đó), không ưu tiên nét mảnh
    maj = np.zeros((64, 64, 4), np.uint8)
    ci512 = pal_idx(r512[..., :3])
    for y in range(64):
        for x in range(64):
            b = id512[y * 8:(y + 1) * 8, x * 8:(x + 1) * 8].ravel(); c = ci512[y * 8:(y + 1) * 8, x * 8:(x + 1) * 8].ravel()
            op = b > 0
            if op.sum() * 2 < 64: continue
            idw = np.bincount(b[op]).argmax(); cc = np.bincount(c[op & (b == idw)], minlength=12).argmax()
            maj[y, x] = (*PAL_RGB[cc], 255)
    thang = np.array(Image.open(os.path.join(RAW, 'run-0-64thang.png')).convert('RGBA'))
    thang2 = thang.copy(); thang2[..., :3] = PAL_RGB[pal_idx(thang[..., :3])]; thang2[..., 3] = np.where(thang[..., 3] > 127, 255, 0); thang2[thang2[..., 3] == 0] = 0
    cuoi, idm = nap_khung(0)
    cot = [(np.array(g64), 'Mẫu gốc thu về 64\n(đa số màu, khoá bảng)'), (vien_ngoai(near), '3D 512 → 64 nearest\n(+viền ngoài)'), (vien_ngoai(maj), '3D 512 → 64 đa số theo ID\n(+viền ngoài, không ưu tiên nét mảnh)'),
           (vien_ngoai(thang2), 'Render THẲNG 64 (1 mẫu/px)\n(+viền ngoài)'), (cuoi, 'Pipeline hiện tại\n(2×2 đa số + hậu kỳ)')]
    S = 8; W = len(cot) * (64 * S + 16) + 16; H = 64 * S + 70 + 16 * 22
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f12, f13 = chu(12), chu(13, True)
    for k, (a, nhan) in enumerate(cot):
        x = 16 + k * (64 * S + 16)
        out.alpha_composite(to_x(Image.fromarray(a, 'RGBA'), S), (x, 40))
        dr.rectangle([x, 40, x + 64 * S - 1, 40 + 64 * S - 1], outline=(70, 80, 95, 255))
        dr.multiline_text((x, 4), nhan, font=f12, fill=(230, 230, 230, 255))
    # bảng bộ phận: diện tích tương đương ở 64 (từ ID 512), bề dày lớn nhất (bán kính nội tiếp ×2 / 8), số ô 64 mà ID thắng đa số, số px trong khung cuối
    bang = []
    for i in sorted(ID_TEN):
        m = id512 == i
        if not m.any() and not (idm == i).any(): continue
        dt = ndimage.distance_transform_edt(m) if m.any() else np.zeros_like(m, float)
        day = round(2 * dt.max() / 8, 2) if m.any() else 0   # bề dày lớn nhất (px ở 64)
        # bề dày "điển hình": trung vị của 2·dt trên trục giữa (dt ≥ dt lân cận)
        area64 = round(m.sum() / 64, 1)
        # số ô mà ID thắng đa số
        blk = id512.reshape(64, 8, 64, 8).transpose(0, 2, 1, 3).reshape(64, 64, 64)
        win = 0
        for y in range(64):
            for x in range(64):
                b = blk[y, x]; b = b[b > 0]
                if len(b) * 2 >= 64 and np.bincount(b).argmax() == i: win += 1
        pxCuoi = int((idm == i).sum())
        bang.append({'id': i, 'ten': ID_TEN[i], 'dienTich64': area64, 'beDayMax': day, 'oThangDaSo': win, 'pxPipeline': pxCuoi,
                     'nhanXet': ('MẤT (0 ô thắng)' if win == 0 and m.any() else '') + (' mỏng < 1 px' if 0 < day < 1 else '') + (' chỉ còn nhờ "bảo vệ"/vẽ lại' if win == 0 and pxCuoi > 0 else '')})
    so['haPhanGiai'] = bang
    y = 40 + 64 * S + 10
    dr.text((16, y), 'Bộ phận (từ mặt nạ ID render 512 của Run F0): diện tích quy về 64 px² · bề dày lớn nhất (px ở 64) · số ô 64 mà bộ phận thắng đa số · số px trong khung pipeline', font=f13, fill=(255, 220, 120, 255)); y += 20
    for b in bang:
        dr.text((24, y), '%-18s  S≈%5.1f px²   dày max %4.2f px   thắng %3d ô   pipeline %3d px   %s' % (b['ten'], b['dienTich64'], b['beDayMax'], b['oThangDaSo'], b['pxPipeline'], b['nhanXet']), font=f12, fill=(235, 235, 235, 255) if not b['nhanXet'] else (255, 150, 150, 255)); y += 16
    out.save(os.path.join(DG, 'so-sanh-ha-phan-giai.png'))
    Image.fromarray(np.array(g64), 'RGBA').save(os.path.join(DG, 'goc-64.png'))


# ---------------------------------------------------------------- A3
def a3(so):
    fr = [nap_khung(i) for i in range(8)]
    S = 8; W = 4 * (64 * S + 12) + 12; H = 2 * (64 * S + 30) + 40 + 22 * 12
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f11, f12, f13 = chu(11), chu(12), chu(13, True)
    bang = []; tongLe = np.zeros(8, int); tongDom = np.zeros(8, int)
    key = lambda a: (a[..., 0].astype(int) << 16) | (a[..., 1].astype(int) << 8) | a[..., 2].astype(int) | (a[..., 3].astype(int) << 24)
    K = [key(c) for c, _ in fr]
    for i in range(8):
        cur, prv, nxt = K[i], K[(i - 1) % 8], K[(i + 1) % 8]
        doi = cur != prv
        le = (cur != prv) & (cur != nxt) & (prv == nxt)   # giá trị chỉ tồn tại đúng 1 khung, 2 khung kề giống nhau
        # pixel lẻ "đơn độc": đồng thời khác 4 lân cận cùng khung (đốm) → nhấp nháy thấy rõ nhất
        c = fr[i][0]; idm = fr[i][1]
        thongKe = {}
        for idv in np.unique(idm[le]):
            if idv == 0: continue
            thongKe[ID_TEN[int(idv)]] = int(((idm == idv) & le).sum())
        nen_le = int((le & (idm == 0)).sum())
        if nen_le: thongKe['viền ngoài/nền'] = nen_le
        # phân loại: đốm lẻ (thành phần liên thông 8 có ≤ 3 px) vs mép dịch (dải dài – cả bộ phận nhích 1 px rồi quay lại)
        lab, nlab = ndimage.label(le, structure=np.ones((3, 3)))
        kich = np.bincount(lab.ravel())[1:] if nlab else np.array([], int)
        dom = np.isin(lab, 1 + np.where(kich <= 3)[0]) if nlab else np.zeros_like(le)
        bang.append({'khung': i, 'pxDoiSoKhungTruoc': int(doi.sum()), 'pxChi1Khung': int(le.sum()), 'domLe': int(dom.sum()), 'soDom': int((kich <= 3).sum()), 'mepDich': int(le.sum() - dom.sum()), 'theoBoPhan': thongKe})
        tongLe[i] = le.sum(); tongDom[i] = dom.sum()
        # vẽ: khung mờ + vàng (đổi) + đỏ (lẻ)
        a = c.copy().astype(int); a[..., :3] = (a[..., :3] * 0.35 + np.array(NEN[:3]) * 0.65 * (a[..., 3:4] > 0)).astype(int)
        a[(c[..., 3] == 0)] = (0, 0, 0, 0)
        a = a.astype(np.uint8)
        a[doi & ~le] = (220, 170, 40, 255); a[le & ~dom] = (240, 50, 50, 255); a[dom] = (255, 255, 255, 255)
        x = 12 + (i % 4) * (64 * S + 12); y0 = 30 + (i // 4) * (64 * S + 30)
        out.alpha_composite(to_x(Image.fromarray(a, 'RGBA'), S), (x, y0))
        dr.rectangle([x, y0, x + 64 * S - 1, y0 + 64 * S - 1], outline=(70, 80, 95, 255))
        dr.text((x, y0 - 22), 'F%d  đổi so F%d: %d px · chỉ 1 khung: %d px (đốm lẻ %d, mép dịch %d)' % (i, (i - 1) % 8, doi.sum(), le.sum(), dom.sum(), le.sum() - dom.sum()), font=f12, fill=(230, 230, 230, 255))
    y = 30 + 2 * (64 * S + 30) - 14
    dr.text((12, y), 'Vàng = khác khung trước (chuyển động + nhiễu). ĐỎ = giá trị CHỈ có ở khung này, 2 khung kề giống nhau (mép bộ phận nhích 1 px rồi quay lại). TRẮNG = đốm lẻ ≤ 3 px chỉ sống 1 khung. Tổng đỏ+trắng 8 khung: %d px, trong đó đốm lẻ %d px.' % (tongLe.sum(), tongDom.sum()), font=f13, fill=(255, 220, 120, 255)); y += 20
    for b in bang:
        t = ', '.join('%s %d' % (k, v) for k, v in sorted(b['theoBoPhan'].items(), key=lambda kv: -kv[1]))
        dr.text((20, y), 'F%d: đổi %3d px · chỉ 1 khung %3d px (đốm lẻ %2d px/%2d đốm) → %s' % (b['khung'], b['pxDoiSoKhungTruoc'], b['pxChi1Khung'], b['domLe'], b['soDom'], t), font=f11, fill=(235, 235, 235, 255)); y += 15
    tong = {}
    for b in bang:
        for k, v in b['theoBoPhan'].items(): tong[k] = tong.get(k, 0) + v
    so['flicker'] = {'khung': bang, 'tongDomLe': int(tongDom.sum()), 'tongTheoBoPhan': dict(sorted(tong.items(), key=lambda kv: -kv[1])), 'tongLe': int(tongLe.sum()),
                     'tongPxCoHinhTrungBinh': int(np.mean([(c[..., 3] > 0).sum() for c, _ in fr]))}
    # vùng đầu/thân "nên tĩnh": đếm pixel đổi trong nhóm đầu + thân so khung trước
    dauThan = []
    for i in range(8):
        idm = fr[i][1]; m = np.isin(idm, [1, 2, 3, 4, 14, 17]); doi = (K[i] != K[(i - 1) % 8]) & m
        dauThan.append(int(doi.sum()))
    so['flicker']['pxDauThanDoiMoiKhung'] = dauThan
    # nhiễu lấy mẫu lại của MŨ: so mũ khung i với khung i+1 sau khi dịch nguyên pixel tốt nhất (dx, dy ∈ [−3, 3]) – sprite vẽ tay chỉ dịch cả đầu nên phần dư ≈ 0
    du = []
    for i in range(8):
        a = fr[i]; b = fr[(i + 1) % 8]
        ma = np.isin(a[1], [1, 2, 3]); mb = np.isin(b[1], [1, 2, 3])
        ka = np.where(ma, K[i], -1); kb = np.where(mb, K[(i + 1) % 8], -1)
        best = None
        for dy in range(-3, 4):
            for dx in range(-3, 4):
                sh = np.roll(np.roll(kb, dy, 0), dx, 1)
                d = int(((ka != sh) & (ma | np.roll(np.roll(mb, dy, 0), dx, 1))).sum())
                if best is None or d < best[0]: best = (d, dx, dy)
        du.append({'cap': 'F%d↔F%d' % (i, (i + 1) % 8), 'pxMu': int(ma.sum()), 'khacSauCanChinh': best[0], 'dich': [best[1], best[2]]})
    so['flicker']['muSauCanChinh'] = du
    out.save(os.path.join(DG, 'flicker-map.png'))


# ---------------------------------------------------------------- A4
def a4(so):
    cuoi, idm = nap_khung(0)
    S = 8
    idc = np.zeros((64, 64, 4), np.uint8)
    for i, m in ID_MAU.items(): idc[idm == i] = (*m, 255)
    # cặp kề (4 lân cận) khác NHÓM nhưng cùng màu → không có viền trong
    k = (cuoi[..., 0].astype(int) << 16) | (cuoi[..., 1].astype(int) << 8) | cuoi[..., 2]
    nh = np.zeros((64, 64), int); nh[:] = -1
    for i, g in NHOM.items(): nh[idm == i] = hash(g) % 1000
    bad = np.zeros((64, 64), bool); capNhom = {}
    for dy, dx in ((0, 1), (1, 0)):
        a = (slice(0, 64 - dy), slice(0, 64 - dx)); b = (slice(dy, 64), slice(dx, 64))
        m = (idm[a] > 0) & (idm[b] > 0) & (nh[a] != nh[b]) & (k[a] == k[b])
        bad[a] |= m; bad[b] |= m
        for y, x in zip(*np.where(m)):
            ga, gb = NHOM[int(idm[y, x])], NHOM[int(idm[y + dy, x + dx])]; key = ' ↔ '.join(sorted([ga, gb])) + ' (%s)' % PAL[int(pal_idx(cuoi[y, x, :3][None, None])[0, 0])]
            capNhom[key] = capNhom.get(key, 0) + 1
    # gần như cùng màu: cùng họ xám (#0C0F14 #1A212B #212835 #2C3546) chênh ≤ 1 bậc, khác nhóm
    ci = pal_idx(cuoi[..., :3]); xam = (ci <= 3) & (idm > 0)
    gan = np.zeros((64, 64), bool); capGan = {}
    for dy, dx in ((0, 1), (1, 0)):
        a = (slice(0, 64 - dy), slice(0, 64 - dx)); b = (slice(dy, 64), slice(dx, 64))
        m = xam[a] & xam[b] & (nh[a] != nh[b]) & (np.abs(ci[a] - ci[b]) <= 1) & (k[a] != k[b])
        gan[a] |= m; gan[b] |= m
        for y, x in zip(*np.where(m)):
            ga, gb = NHOM[int(idm[y, x])], NHOM[int(idm[y + dy, x + dx])]; key = ' ↔ '.join(sorted([ga, gb]))
            capGan[key] = capGan.get(key, 0) + 1
    # viền trong vô hình: pixel #0C0F14 kề (khác nhóm) pixel #0C0F14 → ranh giới chìm vào màu nền bộ phận
    vo = bad & (ci == 0)
    hl = cuoi.copy(); hl[gan] = (255, 150, 40, 255); hl[bad] = (255, 40, 40, 255)
    # thống kê màu theo nhóm
    mauNhom = {}
    for g in sorted(set(NHOM.values())):
        m = np.isin(idm, [i for i, gg in NHOM.items() if gg == g])
        if not m.any(): continue
        ci = pal_idx(cuoi[m][:, :3][None])[0]; cnt = np.bincount(ci, minlength=12)
        mauNhom[g] = {PAL[j]: int(cnt[j]) for j in np.argsort(-cnt) if cnt[j]}
    so['maBoPhan'] = {'capKeKhacNhomCungMau': dict(sorted(capNhom.items(), key=lambda kv: -kv[1])), 'soPxDinhCungMau': int(bad.sum()), 'soPxVienTrongVoHinh': int(vo.sum()),
                      'capKeXamChenh1Bac': dict(sorted(capGan.items(), key=lambda kv: -kv[1])), 'soPxXamChenh1Bac': int(gan.sum()), 'mauTheoNhom': mauNhom}
    W = 3 * (64 * S + 16) + 16; H = 64 * S + 60 + 20 * 16
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f11, f12, f13 = chu(11), chu(12), chu(13, True)
    for kx, (a, nhan) in enumerate(((cuoi, 'run-0 pipeline hiện tại ×8'), (idc, 'Mặt nạ ID bộ phận (mỗi bộ phận một màu minh hoạ)'), (hl, 'ĐỎ: kề khác nhóm CÙNG màu · CAM: kề khác nhóm, xám chênh ≤ 1 bậc'))):
        x = 16 + kx * (64 * S + 16)
        out.alpha_composite(to_x(Image.fromarray(a, 'RGBA'), S), (x, 30)); dr.rectangle([x, 30, x + 64 * S - 1, 30 + 64 * S - 1], outline=(70, 80, 95, 255))
        dr.text((x, 8), nhan, font=f12, fill=(230, 230, 230, 255))
    # chú giải ID
    x = 16 + (64 * S + 16); y = 30 + 64 * S + 6
    for j, (i, m) in enumerate(sorted(ID_MAU.items())):
        xx = x + (j % 3) * 170; yy = y + (j // 3) * 15
        dr.rectangle([xx, yy + 2, xx + 10, yy + 12], fill=(*m, 255)); dr.text((xx + 14, yy), '%d %s' % (i, ID_TEN[i]), font=f11, fill=(230, 230, 230, 255))
    y = 30 + 64 * S + 6; x = 16
    dr.text((x, y), 'Màu theo nhóm (run-0):', font=f13, fill=(255, 220, 120, 255)); y += 16
    for g, d in mauNhom.items():
        dr.text((x, y), '%-7s %s' % (g, ', '.join('%s×%d' % (c, n) for c, n in d.items())), font=f11, fill=(235, 235, 235, 255)); y += 14
    x = 16 + 2 * (64 * S + 16); y = 30 + 64 * S + 6
    dr.text((x, y), 'Cùng màu: %d px (trong đó %d px là viền trong #0C0F14 chìm vào bộ phận kề cũng #0C0F14) · xám chênh ≤ 1 bậc: %d px' % (bad.sum(), vo.sum(), gan.sum()), font=f11, fill=(255, 220, 120, 255)); y += 16
    for kk, v in list(so['maBoPhan']['capKeKhacNhomCungMau'].items())[:7]:
        dr.text((x, y), 'cùng màu  %s: %d cặp' % (kk, v), font=f11, fill=(255, 120, 120, 255)); y += 14
    for kk, v in list(so['maBoPhan']['capKeXamChenh1Bac'].items())[:9]:
        dr.text((x, y), 'chênh 1 bậc  %s: %d cặp' % (kk, v), font=f11, fill=(255, 190, 120, 255)); y += 14
    out.save(os.path.join(DG, 'ma-bo-phan.png'))


if __name__ == '__main__':
    so = {}
    a1(so); a2(so); a3(so); a4(so)
    json.dump(so, open(os.path.join(DG, 'so-lieu.json'), 'w'), indent=1, ensure_ascii=False)
    print(json.dumps(so['tiLe'], ensure_ascii=False))
    for b in so['haPhanGiai']: print(b)
    print('flicker tổng', so['flicker']['tongLe'], so['flicker']['tongTheoBoPhan']); print('đầu+thân đổi', so['flicker']['pxDauThanDoiMoiKhung'])
    print('dính cùng màu', so['maBoPhan']['soPxDinhCungMau'], so['maBoPhan']['capKeKhacNhomCungMau'])
