#!/usr/bin/env python3
"""NẮM CHUÔI THẬT (15/10/2026, docs/review/ke-hoach-cai-thien/vk-khop-tay/bao-cao.md) — dùng bởi docs/anh-goc/zed/dung-zed-game.py.

Chủ game 15/10 23:10: "cầm kiếm tay nào thì nắm đấm phải nắm vào chuôi — giờ chỉ đặt lên thôi; thương thì tay phải cầm chuôi, tay trái
cầm thân; hiển thị ngón tay; phi tiêu cũng thế, và làm phi tiêu to hơn một chút".

Cách cũ (lop_tay): chỉ vẽ lại các điểm MÀU DA trong bán kính 26 quanh điểm cầm → mất viền đen + vạch ngón của nắm tay, cán vũ khí cắt
ngang nắm tay như dán lên. Cách mới, vẫn 3 lớp như game: TAY SAU (cả thân) → VŨ KHÍ → NGÓN TAY TRƯỚC (lớp này), với lớp ngón:
  1. tam_nam: tâm NẮM ĐẤM = dời dần (bán kính 28 → 14) về khối da nhỏ ở đầu tay, không bị cẳng tay / cổ tay kéo lệch.
     Chuôi vũ khí đặt đúng tâm này → cán đi XUYÊN qua giữa nắm tay, ló ra hai bên (chuôi/đốc một bên, lưỡi/cán một bên).
  2. mat_na_nam: mặt nạ = khối da nắm đấm (lấp lỗ — vạch ngón tối nằm trong) nới thêm NOI điểm ảnh nguồn để lấy cả VIỀN ĐEN,
     giới hạn trong bán kính R_NAM quanh tâm (không lấy cẳng tay).
  3. lop96: lớp ngón ở ô 96 = đúng các điểm ảnh của thân đã co (không lệch màu với thân), nơi mặt nạ co ≥ 0,5 (nét sắc, không mờ mép).
  4. ngon_anh: LỚP NGÓN RIÊNG (cấp theo từng vũ khí × cấp, lưu trong zed-vk.sprite.json 'ngon'): một nắm ngón pixel ôm ngang cán
     (cao = bề dày cán + 4: gờ đốt ngón sáng phía trên, đầu ngón cuộn tối phía dưới, 2 vạch kẽ ngón, viền nâu), game vẽ nó XOAY CÙNG
     vũ khí, đúng tâm nắm đấm, sau lớp nắm tay ở trên → ở mọi góc (kể cả nhắm 8 hướng) ngón luôn quấn quanh cán. Nắm tay trong ảnh gốc
     chỉ ~5 điểm ảnh ô 96, cán dày ~4 điểm ảnh nên tách ngón từ ảnh không đủ rõ (xem bao-cao.md).
Thương (hai tay): tay phải ở ĐUÔI cán (cam THUONG_CAM), tay trái ở thân cán; góc cán = đường nối tâm hai nắm tay ở MỌI khung
(tay trái thiếu trong neo.json thì máy tìm khối da gần đường cán — tim_tay2; sai thì sửa neo-nam-chinh-tay.json).
Phi tiêu: to ×PHI_TO (chỉ hình), kẹp một cánh ở ngón (cam PHI_CAM), thân phi tiêu ló ra khỏi nắm tay theo góc PHI_GOC.
"""
import json, math, os
import numpy as np
from scipy import ndimage

DAY = os.path.dirname(os.path.abspath(__file__))
CHINH_TAY = os.path.join(DAY, 'neo-nam-chinh-tay.json')

R_NAM = 24          # bán kính lấy nắm tay (điểm ảnh nguồn, ảnh ninja ~ 500 cao)
NOI = 4             # nới mặt nạ để lấy viền đen quanh nắm tay
THUONG_CAM = 0.11   # thương: tay phải ngay trên đốc đuôi (cũ 0,2 — giữa cán sau)
THUONG_DAI_CU = (1.3, 0.2)
# giữ mũi thương ở đúng chỗ cũ tính từ tay phải: dai × (1 − cam) không đổi → cán ngắn lại phần đuôi thừa
THUONG_DAI = round(THUONG_DAI_CU[0] * (1 - THUONG_DAI_CU[1]) / (1 - THUONG_CAM), 3)
PHI_TO = 1.3        # phi tiêu to hơn (cả cầm lẫn bay) — chỉ hình
PHI_CAM = 0.17      # kẹp ở cánh trái của phi tiêu (tỉ lệ bề ngang ảnh)
PHI_GOC = 55        # phi tiêu ló ra dưới-trước nắm tay (không đè lên bụng/đai)
# bán kính đầu của tam_nam / chinh_nam theo hàng (không có: 28). 03-chay-2tay: nắm tay phải ở hông sát cẳng tay trái → bán kính 28 kéo
# tâm sang cẳng tay trái (góc cán lệch tới +14°); 14 thì bám đúng nắm đấm (bao-cao-2.md).
R0_HANG = {'03-chay-2tay': 14}
LECH_TOI_DA = 25    # góc qua hai nắm tay lệch góc cũ quá ngần này → giữ góc cũ, in cảnh báo (soát tay)


def da(a):  # y hệt dung-zed-game.py
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r > 170) & (g > 110) & (b > 70) & (r - b > 50) & (a[..., 3] > 0)


def _luoi(a):
    return np.mgrid[:a.shape[0], :a.shape[1]]


def tam_nam(im, x, y, r0=28):
    """Tâm nắm đấm quanh (x, y): dời dần về trọng tâm điểm da với bán kính nhỏ dần."""
    a = np.array(im); m = da(a); yy, xx = _luoi(a)
    x, y = float(x), float(y)
    for r in [r0] + [r for r in (22, 18, 16, 14, 14, 14) if r <= r0]:
        v = m & ((xx - x) ** 2 + (yy - y) ** 2 < r * r)
        if v.sum() < 15:
            break
        x, y = float(xx[v].mean()), float(yy[v].mean())
    return x, y


def mat_na_nam(im, pts):
    """Mặt nạ (bool, cỡ ảnh nguồn) các nắm tay quanh từng tâm trong pts."""
    a = np.array(im); m = da(a); dac = a[..., 3] > 0; yy, xx = _luoi(a)
    mm = ndimage.binary_closing(m, iterations=2)
    lab, n = ndimage.label(mm)
    ra = np.zeros(m.shape, bool)
    for x, y in pts:
        d2 = (xx - x) ** 2 + (yy - y) ** 2
        gan = lab[(d2 < 10 * 10) & mm]
        if len(gan) == 0:
            khoi = m & (d2 < 12 * 12)
        else:
            khoi = (lab == np.bincount(gan).argmax()) & (d2 < R_NAM ** 2)
        khoi = ndimage.binary_fill_holes(khoi)
        khoi = ndimage.binary_dilation(khoi, iterations=NOI) & dac & (d2 < (R_NAM + NOI) ** 2)
        ra |= khoi
    return ra


def lop96(than96, mat_na, nw, nh, dx, dy, O=96):
    """Lớp ngón ở ô 96: điểm ảnh của thân đã co (than96) nơi mặt nạ co BOX ≥ 0,5."""
    from PIL import Image
    mk = Image.fromarray((mat_na * 255).astype(np.uint8)).resize((nw, nh), Image.BOX)
    o = Image.new('L', (O, O), 0); o.paste(mk, (dx, dy))
    t = np.array(than96).copy()
    t[..., 3] = np.where(np.array(o) >= 128, t[..., 3], 0)
    return t


MAU_NGON = {'vien': (64, 36, 26), 'toi': (150, 78, 48), 'vua': (206, 122, 76), 'sang': (240, 166, 108), 'gờ': (252, 196, 140)}


def ngon_anh(t):
    """Ảnh nắm ngón (RGBA, đơn vị = điểm ảnh ô 96) cho cán dày t điểm ảnh ô 96; trục cán theo chiều ngang, tâm ảnh = tâm cán."""
    from PIL import Image
    M = MAU_NGON
    mau = [M['sang'], M['toi'], M['sang'], M['vua']]   # 2 kẽ ngón
    H, W = int(t) + 4, len(mau) + 2
    a = np.zeros((H, W, 4), np.uint8)
    for y in range(H):
        for x in range(W):
            ey, ex = y in (0, H - 1), x in (0, W - 1)
            if ey and ex:
                continue
            if ey or ex:
                c = M['vien']
            else:
                c = mau[x - 1]
                if y == 1:
                    c = M['gờ'] if c != M['toi'] else M['vua']      # gờ đốt ngón
                elif y == H - 2:
                    c = M['toi'] if c == M['toi'] else M['vua']     # đầu ngón cuộn dưới cán
            a[y, x] = list(c) + [255]
    return Image.fromarray(a)


def tim_tay2(im, p, goc, dai_can):
    """Tay trái trên cán: khối da (nắm tay) gần đường cán xuất phát từ p theo góc goc, trong khoảng dai_can. None nếu không có."""
    a = np.array(im); m = ndimage.binary_closing(da(a), iterations=2)
    lab, n = ndimage.label(m)
    if n == 0:
        return None
    c, s = math.cos(math.radians(goc)), math.sin(math.radians(goc))
    tot = None
    for i in range(1, n + 1):
        k = lab == i
        sz = int(k.sum())
        if sz < 150 or sz > 2500:      # nhỏ quá: nhiễu; to quá: mặt / cả cẳng tay
            continue
        cy, cx = ndimage.center_of_mass(k)
        vx, vy = cx - p[0], cy - p[1]
        doc, ngang = vx * c + vy * s, abs(-vx * s + vy * c)
        if 30 < doc < dai_can and ngang < 30 and (tot is None or ngang < tot[0]):
            tot = (ngang, cx, cy)
    return (tot[1], tot[2]) if tot else None


def mat_na_mat(im):
    """Mặt nạ MẶT (khối da lớn nằm cao nhất, như do_dau ở dung-zed-game.py), nới 4 điểm ảnh. None nếu không thấy."""
    a = np.array(im)
    m = ndimage.binary_opening(da(a), iterations=2)
    lab, n = ndimage.label(m)
    if n == 0:
        return None
    sz = ndimage.sum(m, lab, range(1, n + 1)); cm = ndimage.center_of_mass(m, lab, range(1, n + 1))
    i = min((j for j in range(n) if sz[j] > 0.15 * sz.max()), key=lambda j: cm[j][0])
    return ndimage.binary_dilation(lab == i + 1, iterations=4)


def cat_mat(im, p, goc, dai):
    """Đoạn cán từ p theo góc goc dài dai có đi qua mặt không (luật cũ: vũ khí không che mặt)."""
    mm = mat_na_mat(im)
    if mm is None:
        return False
    c, s = math.cos(math.radians(goc)), math.sin(math.radians(goc))
    for t in np.arange(0, dai, 2.0):
        x, y = int(round(p[0] + c * t)), int(round(p[1] + s * t))
        if 0 <= y < mm.shape[0] and 0 <= x < mm.shape[1] and mm[y, x]:
            return True
    return False


def gan_mat(im, t, r=24):
    """Nắm tay t có nằm sát mặt không (trong r điểm ảnh nguồn — lớp ngón vẽ ở đó sẽ đè lên mặt)."""
    mm = mat_na_mat(im)
    if mm is None:
        return False
    yy, xx = np.nonzero(mm)
    return bool(len(xx)) and float(np.min((xx - t[0]) ** 2 + (yy - t[1]) ** 2)) < r * r


def doc_chinh_tay():
    try:
        return json.load(open(CHINH_TAY, encoding='utf-8')).get('hang', {})
    except FileNotFoundError:
        return {}


def chuan_bi(neo_all, khung_ninja, L_VK, bat_thuong=True, bat_phi=True):
    """neo_nam: bản sao neo.json cho biến thể nắm chuôi (toạ độ ảnh ninja). Mỗi khung thêm phần tử thứ 6 (dict):
    {'hai': 1} = góc tính lại qua hai tâm nắm ở từng bộ trang phục. khung_ninja: {thư mục: [ảnh khung]}. In bảng soát."""
    ct = doc_chinh_tay()
    ra, bao = {}, []
    for key, e in neo_all.items():
        thu = key.split('#')[0]
        ims = khung_ninja.get(thu)
        if ims is None:
            continue
        e2 = dict(e); kh = []
        loai = e['vk']
        if loai == 'vk-thuong' and bat_thuong and e.get('cam') == THUONG_DAI_CU[1]:
            e2['dai'], e2['cam'] = THUONG_DAI, THUONG_CAM
        if loai == 'vk-phi-tieu' and bat_phi:
            e2['dai'] = round(e['dai'] * PHI_TO, 4); e2['cam'] = PHI_CAM
        for i, k in enumerate(e['khung']):
            if not k:
                kh.append(k); continue
            k = list(k) + [0] * max(0, 4 - len(k))
            sua = ct.get(key, {}).get(str(i + 1)) or ct.get(thu, {}).get(str(i + 1)) or {}
            if 'tay' in sua:
                k[0], k[1] = sua['tay']
            if loai == 'vk-phi-tieu' and bat_phi:
                k[2] = sua.get('goc', PHI_GOC)
                kh.append(k[:4]); continue
            hai = loai in ('vk-thuong', 'vk-bua') and (loai != 'vk-thuong' or bat_thuong) and e2.get('cam') != 0.4
            if 'tay2' in sua:
                if sua['tay2'] is None:
                    k = k[:4]
                else:
                    k = k[:4] + [list(sua['tay2'])]
            elif hai and len(k) <= 4 and loai == 'vk-thuong':
                im = ims[i]
                p = tam_nam(im, k[0], k[1], R0_HANG.get(thu, 28))
                t2 = tim_tay2(im, p, k[2], e2['dai'] * L_VK * (1 - e2['cam']) * 0.75)
                if t2:
                    k = k[:4] + [[round(t2[0]), round(t2[1])]]
                    bao.append('%s khung %d: máy tìm thấy tay trái (%d, %d)' % (key, i + 1, t2[0], t2[1]))
            if 'goc' in sua:
                k[2] = sua['goc']
            elif hai and len(k) > 4:
                im = ims[i]
                r0_ = R0_HANG.get(thu, 28)
                p = tam_nam(im, k[0], k[1], r0_); t = tam_nam(im, *k[4], r0_)
                g = math.degrees(math.atan2(t[1] - p[1], t[0] - p[0]))
                d = ((g - k[2] + 540) % 360) - 180
                dai_c = e2['dai'] * L_VK * (1 - e2['cam'])
                if '#' in key and abs(d) <= LECH_TOI_DA and (cat_mat(im, p, g, dai_c) or gan_mat(im, t)):
                    # chỉ hàng cầm lúc đứng/đi/chạy (khoá có '#'); hàng đòn giữ đúng hướng đòn của ảnh.
                    # tay trái trong ảnh ở sát cằm (hàng chạy): cán qua hai tay cắt ngang mặt → cầm một tay phải, hạ góc tới khi cán
                    # không còn đi qua mặt (luật cũ "vũ khí không che mặt"), không vẽ lớp ngón ở tay trái
                    g1 = k[2]
                    while cat_mat(im, p, g1, dai_c) and g1 < k[2] + 40:
                        g1 += 2
                    bao.append('%s khung %d: MỘT TAY (tay trái sát mặt / qua hai tay = %.0f° thì cán cắt ngang MẶT) — góc %.0f° → %.0f°' % (key, i + 1, g, k[2], g1))
                    k = k[:4]; k[2] = g1
                elif abs(d) <= LECH_TOI_DA:
                    k = k[:5] + [{'hai': 1}]
                    if abs(d) > 3:
                        bao.append('%s khung %d: góc %.0f° → %.0f° (qua hai nắm tay)' % (key, i + 1, k[2], g))
                else:
                    bao.append('%s khung %d: GIỮ góc %.0f° (qua hai tay = %.0f°, lệch %.0f° — tay trái không ở trên cán)' % (key, i + 1, k[2], g, d))
                    k = k[:4]
            kh.append(k)
        e2['khung'] = kh
        ra[key] = e2
    return ra, bao


# ---------------- NẮM TAY ÔM CÁN TỪ ẢNH (16/10/2026, docs/review/ke-hoach-cai-thien/vk-khop-tay/bao-cao-2.md) ----------------
# Ảnh docs/anh-goc/zed/moi/20-nam-tay-om-can.png: nắm tay phải 4 góc, có lỗ tròn chỗ cán đi qua. Mỗi hình cắt thành 2 lớp ở ô 96:
#   SAU   = cả nắm tay (lỗ tô nâu tối) — game vẽ TRƯỚC vũ khí (lòng bàn tay sau cán)
#   TRƯỚC = phần ngón + ngón cái (từ mép lỗ phía cổ tay trở ra đầu ngón, bỏ lỗ) — game vẽ SAU vũ khí (ngón phủ lên cán)
# Góc mỗi hình đo trên ảnh (trục cổ tay → lỗ, quy ước game: 0 = sang phải, dương = chúc xuống), không theo nhãn của prompt.
ANH_NAM_TAY = os.path.join(os.path.dirname(DAY), 'moi', '20-nam-tay-om-can.png')
VIEN_NAM = (38, 22, 18)     # viền 1 điểm ảnh ô 96 quanh nắm tay (như viền đen ảnh gốc)
LO_NAM = (70, 34, 24)       # lòng lỗ (lớp sau) khi cán không phủ kín


def tach_nam_tay(path=ANH_NAM_TAY):
    """Các nắm tay trong ảnh (trái → phải): dict a (ảnh), hand (mặt nạ bàn tay, bỏ băng cổ tay + cẳng tay), hole, u (hướng cổ tay → nắm),
    rh (bán kính lỗ), h (tâm lỗ), goc (độ, quy ước game)."""
    import importlib.util
    from PIL import Image
    sp = importlib.util.spec_from_file_location('cat_diem_anh', os.path.join(os.path.dirname(DAY), 'cat-diem-anh.py'))
    cd = importlib.util.module_from_spec(sp); sp.loader.exec_module(cd)
    a = np.array(Image.open(path).convert('RGBA'))
    m, _ = cd.mat_na_bao_cao(a)
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=3))
    yy, xx = _luoi(a)
    r, g, b = (a[..., i].astype(int) for i in range(3))
    ra = []
    for j in range(1, n + 1):
        k = (lab == j) & m
        if k.sum() < 2000:
            continue
        kf = ndimage.binary_fill_holes(k); hole = kf & ~k
        hl, hn = ndimage.label(hole)
        if hn == 0:
            continue
        hole = hl == int(np.argmax(ndimage.sum(hole, hl, range(1, hn + 1)))) + 1
        hy, hx = ndimage.center_of_mass(hole); rh = math.sqrt(hole.sum() / math.pi)
        bang = k & (np.abs(r - g) < 25) & (np.abs(g - b) < 25) & (r > 40) & (r < 110)   # băng cổ tay xám đen
        wl, wn = ndimage.label(bang)
        bang = wl == int(np.argmax(ndimage.sum(bang, wl, range(1, wn + 1)))) + 1
        bang = ndimage.binary_fill_holes(ndimage.binary_closing(bang, iterations=4))
        wy, wx = ndimage.center_of_mass(bang)
        ys, xs = np.nonzero(kf)
        X = np.stack([xs - xs.mean(), ys - ys.mean()]); w, v = np.linalg.eigh(X @ X.T); u = v[:, 1]
        if u[0] * (hx - wx) + u[1] * (hy - wy) < 0:
            u = -u
        u2 = np.array([hx - wx, hy - wy]); u2 /= np.linalg.norm(u2); u = u + u2; u /= np.linalg.norm(u)  # trục hình + băng → lỗ
        t = (xx - hx) * u[0] + (yy - hy) * u[1]
        hand = kf & ~ndimage.binary_dilation(bang, iterations=3) & (t > np.median(t[bang]))
        hl2, _ = ndimage.label(hand)
        q = hl2[int(hy), min(a.shape[1] - 1, int(hx + rh + 3))]
        if q:
            hand = hl2 == q
        hand = ndimage.binary_fill_holes(hand | hole)
        ra.append(dict(a=a, hand=hand, hole=hole, u=u, rh=rh, h=(hx, hy), goc=round(math.degrees(math.atan2(u[1], u[0])), 1), x0=xs.min()))
    ra.sort(key=lambda d: d['x0'])
    return ra


def nam_tay_96(d, D):
    """(sau, truoc, (cx, cy)) — 2 ảnh RGBA ở ô 96, nắm tay đường kính D (kể cả viền 1 điểm ảnh); (cx, cy) = tâm lỗ trong ảnh.
    Co phần trong (D − 2) bằng BOX trên ảnh nhân alpha (không lệch màu), rồi viền 1 điểm ảnh — kiểu pixel art, không mờ mép."""
    from PIL import Image
    a, hand, hole = d['a'], d['hand'], d['hole']
    ys, xs = np.nonzero(hand)
    f = (D - 2) / (2 * math.sqrt(hand.sum() / math.pi))
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    W, H = max(1, round((x1 - x0) * f)) + 2, max(1, round((y1 - y0) * f)) + 2
    fx, fy = (W - 2) / (x1 - x0), (H - 2) / (y1 - y0)
    sm = lambda z: np.array(Image.fromarray(z.astype(np.float32), 'F').resize((W - 2, H - 2), Image.BOX))
    M = (hand & ~hole)[y0:y1, x0:x1].astype(float)
    al = sm(M)
    col = np.dstack([sm(a[y0:y1, x0:x1, i].astype(float) * M) for i in range(3)]) / np.maximum(al, 1e-6)[..., None]
    ok = np.zeros((H, W), bool); ok[1:-1, 1:-1] = sm(hand[y0:y1, x0:x1].astype(float)) >= 0.45
    img = np.zeros((H, W, 4), np.uint8); img[1:-1, 1:-1, :3] = np.clip(col, 0, 255); img[..., 3] = ok * 255
    cx, cy = (d['h'][0] - x0) * fx + 1, (d['h'][1] - y0) * fy + 1
    lo = np.zeros((H, W), bool); lo[1:-1, 1:-1] = (sm(hole[y0:y1, x0:x1].astype(float)) >= 0.4) & ok[1:-1, 1:-1]
    if not lo.any():
        lo[int(cy), int(cx)] = True
    du = ndimage.binary_dilation(ok)
    img[du & ~ok] = list(VIEN_NAM) + [255]
    img[lo] = list(LO_NAM) + [255]
    yy, xx = np.mgrid[:H, :W]
    t = (xx + 0.5 - cx) * d['u'][0] + (yy + 0.5 - cy) * d['u'][1]
    tr = img.copy(); tr[..., 3] = np.where(du & (t >= -d['rh'] * fx - 0.25) & ~lo, 255, 0)
    return Image.fromarray(img), Image.fromarray(tr), (round(cx, 2), round(cy, 2))
