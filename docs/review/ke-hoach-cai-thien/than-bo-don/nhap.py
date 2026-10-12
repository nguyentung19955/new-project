"""Nhập ảnh gốc ChatGPT của THÂN BỘ (bộ trang phục rung / bien / lau) vào game.

Chạy (từ bất kỳ thư mục nào):
    python3 nhap.py <key> <bo>                 # tấm đòn: em-be-<key>-<bo>-don.png -> game/art/custom/em-be-<key>-<bo>-don.sprite.json
    python3 nhap.py healer <bo> --than         # tấm THÂN BỘ MỚI 8×7 (Cái Bống): em-be-healer-<bo>.png -> em-be-healer-<bo>.sprite.json
  key: smith (Cu Tí), hunter (Cu Tèo), wrestler (Cu Lì), healer (Cái Bống); bo: rung (Rừng Già), bien (Hang Biển), lau (Lâu Đài).
  Tuỳ chọn:
    --anh <tệp.png>    ảnh gốc ở chỗ khác (mặc định: tìm docs/anh-goc/*/than-bo/<tên>.png, bản mới nhất)
    --xoa-cung         xoá nét cung / tên ChatGPT vẽ sẵn ở hàng bắn cung (nét mảnh ngoài thân), game tự vẽ cung
    --hang kiem,giao,cung,bua,chuong   thứ tự hàng THẬT trong ảnh nếu ChatGPT đổi chỗ (mặc định kiem,cung,giao,bua,chuong)
    --xoa-cau          xoá quả cầu lửa / tia sáng ChatGPT vẽ sẵn ở nắm tay hàng chưởng (game tự vẽ hiệu ứng chưởng)
    --tim              đổi da hồng/đào -> tím hoa cà (nếu thân bộ của Cu Lì có da tím)
    --thu              chỉ nhập ra thư mục tam/ cạnh script (không ghi vào game), để xem trước
    --vung y0,y1[,x0,x1]  chỉ cắt lưới trong vùng này của ảnh gốc (điểm ảnh gốc), bỏ dải hình tham chiếu / dải thừa ngoài lưới
    --tu-do            lưới kẻ KHÔNG đều: lấy mọi vạch hàng tìm được trong vùng làm biên hàng, và mỗi hàng tự dò vạch cột của
                       riêng hàng đó (ô rộng hẹp khác nhau); cắt các ô đầu hàng theo số khung

Ảnh gốc: lưới đều 8 cột (tấm đòn: 5 hàng kiếm, cung, giáo, búa, chưởng, mỗi hàng 6 khung; tấm thân: 7 hàng đứng, chạy, lấy đà,
đánh, trúng đòn, ngã, lộn theo số khung của tệp thân hiện có), kẻ lưới mảnh tối, nền xanh lá #00FF00.
Cách làm (giống phiên nhập hàng chém 12/10, tay-kiem-mat/kiem/nhap-chem/cat_chem.py):
  1. tìm vạch kẻ thật (hàng / cột có nhiều điểm tối), cắt từng ô theo vạch, mỗi ô dò lại vạch riêng (lưới vẽ tay có thể lệch);
  2. xoá nền: chỉ điểm XANH LÁ RỰC nối với mép ô (xanh rêu, lá cây, quần lá của bộ Rừng giữ nguyên), viền lem xanh sát nền -> nền;
  3. co cả tấm một tỉ lệ để khung đứng cao bằng khung đứng của thân bộ (không nhảy cỡ khi đổi trạng thái), chân trên đường đáy
     (điểm chân [24, 45], ảnh nét ×2 -> đáy 90), mỗi hàng dời ngang một lần để đầu khung đầu hàng trùng đầu khung đứng của thân;
  4. viền tối một nét, màu đưa về bảng màu của thân bộ (cùng tông, tệp không nặng thêm);
  5. thời lượng mỗi hàng như em-be-<key>-don (đòn thân gốc).
In ra: số điểm ảnh từng khung (cho SC.TAY_KIEM) và điểm nắm tay đề xuất của hàng kiếm (lấy theo bảng của thân gốc rồi bám vào nắm
tay gần nhất); ảnh kiểm tra tam/<mã>-xem.png (phóng ×4) và tam/<mã>-tay.png (lưới toạ độ hàng kiếm + vòng đỏ ở điểm tay).
Sau khi nhập: chép dòng TAY_KIEM in ra vào game/js/sprite_custom.js (SC.TAY_KIEM, khoá '<key>-<bo>'), rồi python3 game/build.py.
"""
import sys, os, re, json, base64, io, glob, colorsys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

GOC = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..'))
CUSTOM = os.path.join(GOC, 'game', 'art', 'custom')
V = np.array([20, 24, 46], np.uint8)  # màu viền chuẩn của các tệp em bé
TEN = {'smith': 'Cu Tí (Thợ Rèn)', 'hunter': 'Cu Tèo (Thợ Săn)', 'wrestler': 'Cu Lì (Đô Vật)', 'healer': 'Cái Bống (Thầy Thuốc)'}
BO = {'rung': 'Bộ Rừng Già', 'bien': 'Bộ Hang Biển', 'lau': 'Bộ Lâu Đài'}
HANG_DON = ['atk_sword', 'atk_bow', 'atk_spear', 'atk_hammer', 'cast']
HANG_THAN = ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'ne']


def doc(f):
    d = json.load(open(f))
    return d, np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'))


def nhom(v, gap=3):
    out = []
    for x in v:
        if out and x - out[-1][1] <= gap: out[-1][1] = x
        else: out.append([x, x])
    return out


def bien(vach, n, dai):
    """Từ các vạch tối tìm được -> n+1 biên (thêm mép ảnh nếu thiếu vạch ngoài cùng); kiểm các ô gần đều nhau."""
    c = [(a + b) / 2 for a, b in vach]
    o = dai / n
    b = [0.0] + [x for x in c if o * 0.5 < x < dai - o * 0.5] + [float(dai)]
    # bỏ vạch giả (nét tối trong hình) không nằm gần bội số của ô
    b = [x for x in b if min(abs(x - k * o) for k in range(n + 1)) < o * 0.2]
    if len(b) != n + 1:
        sys.exit('không tìm đúng lưới: %d biên (cần %d): %s' % (len(b), n + 1, [round(x) for x in b]))
    return b


def bien_tu_do(vach, n, dai, ten):
    """Lưới không đều: mọi vạch tìm được (thêm mép nếu thiếu), bỏ vạch sát nhau / sát mép; cần ít nhất n+1 biên."""
    c = [(a + b) / 2 for a, b in vach]
    b = [0.0]
    for x in c + [float(dai)]:
        if x - b[-1] > 40: b.append(x)
        else: b[-1] = max(b[-1], x) if b[-1] > 0 else b[-1]
    if b[-1] < dai - 40: b.append(float(dai))
    if len(b) < n + 1: sys.exit('lưới tự do: %s chỉ thấy %d biên (cần %d): %s' % (ten, len(b), n + 1, [round(x) for x in b]))
    return b


def cat_o(A, n_cot, n_hang, hang_so, tu_do=False):
    """Cắt ô theo vạch kẻ thật. Trả về list theo hàng: [{rgb, a, bb}...] (toạ độ trong ô)."""
    r, g, b = A[..., 0], A[..., 1], A[..., 2]
    dark = (r < 80) & (g < 80) & (b < 80)
    H, W = dark.shape
    if tu_do:
        hb = bien_tu_do(nhom(np.where(dark.mean(1) > 0.4)[0]), n_hang, H, 'hàng')
        if len(hb) != n_hang + 1: sys.exit('lưới tự do: %d hàng, cần %d — chỉnh --vung' % (len(hb) - 1, n_hang))
    else:
        hb = bien(nhom(np.where(dark.mean(1) > 0.4)[0]), n_hang, H)
        vb = bien(nhom(np.where(dark.mean(0) > 0.4)[0]), n_cot, W)
    rows = []
    for h in range(n_hang):
        cells = []
        if tu_do:  # vạch cột riêng của hàng này (giữa hàng, bỏ 6 điểm sát vạch hàng)
            band = dark[int(hb[h]) + 6:int(hb[h + 1]) - 6]
            vb = bien_tu_do(nhom(np.where(band.mean(0) > 0.6)[0]), hang_so[h], W, 'cột hàng %d' % (h + 1))
            print('  hàng %d: y %d-%d, biên cột %s' % (h + 1, hb[h], hb[h + 1], [round(x) for x in vb]))
        for i in range(hang_so[h]):
            xa, xb, ya, yb = int(vb[i]) , int(vb[i + 1]), int(hb[h]), int(hb[h + 1])
            # dò lại mép tối (vạch) của chính ô này, bỏ đi
            sub = dark[ya:yb, xa:xb]
            while ya < yb - 10 and sub[0].mean() > 0.3: ya += 1; sub = dark[ya:yb, xa:xb]
            while yb > ya + 10 and dark[yb - 1, xa:xb].mean() > 0.3: yb -= 1
            while xa < xb - 10 and dark[ya:yb, xa].mean() > 0.3: xa += 1
            while xb > xa + 10 and dark[ya:yb, xb - 1].mean() > 0.3: xb -= 1
            ya += 2; yb -= 2; xa += 2; xb -= 2
            c = A[ya:yb, xa:xb].copy()
            cr, cg, cb = c[..., 0], c[..., 1], c[..., 2]
            # nền: xanh lá RỰC (#00FF00 qua nén ảnh) nối với mép ô; xanh rêu / lá của bộ có đỏ, lam đáng kể nên không bị ăn
            ung = (cg > 150) & (cg - np.maximum(cr, cb) > 90)
            lab, _ = ndimage.label(ung)
            mep = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
            bg = np.isin(lab, mep[mep > 0])
            for _ in range(2):  # viền lem xanh sát nền
                nb = ndimage.binary_dilation(bg)
                bg |= nb & ~bg & (cg > 2 * np.maximum(cr, cb) + 15) & (cg > 90)
            al = ~bg
            lab, n = ndimage.label(al)
            if n == 0: sys.exit('ô trống: hàng %d khung %d' % (h + 1, i + 1))
            sz = ndimage.sum(al, lab, range(1, n + 1))
            keep = np.isin(lab, [j + 1 for j, s in enumerate(sz) if s >= 0.02 * sz.max()])
            keep = ndimage.binary_fill_holes(keep)
            # lỗ kín trong hình là xanh rực (khe giữa tay và thân) -> nền
            lo = keep & ung
            lab2, n2 = ndimage.label(lo)
            if n2:
                s2 = ndimage.sum(lo, lab2, range(1, n2 + 1))
                keep &= ~np.isin(lab2, [j + 1 for j, s in enumerate(s2) if s >= 6])
            gx = keep & (cg > 2 * np.maximum(cr, cb) + 15) & (cg > 40) & ndimage.binary_dilation(~keep, iterations=2)
            c[gx] = V  # lem xanh nền ở mép hình -> viền tối
            ys, xs = np.where(keep)
            cells.append(dict(rgb=c, a=keep, bb=(int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1), o=(xa, ya)))
        rows.append(cells)
    return rows


def xoa_net_manh(cell, r=6):
    """Bỏ phần mảnh (nét cung, dây cung, mũi tên) mọc ra ngoài thân: mở hình (erode rồi dilate) giữ thân, phần mảnh nối tiếp bị cắt."""
    a = cell['a']
    k = np.zeros((2 * r + 1, 2 * r + 1), bool); yy, xx = np.mgrid[-r:r + 1, -r:r + 1]; k[xx * xx + yy * yy <= r * r] = True
    than = ndimage.binary_dilation(ndimage.binary_erosion(a, k), k, iterations=1)
    than = ndimage.binary_dilation(than, iterations=2) & a  # giữ lại viền / ngón tay sát thân
    lab, n = ndimage.label(than)
    if n:
        sz = ndimage.sum(than, lab, range(1, n + 1)); than = lab == (int(np.argmax(sz)) + 1)
    bo = int(a.sum() - than.sum())
    cell['a'] = than
    ys, xs = np.where(than)
    cell['bb'] = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    return bo


def xoa_cau(cell):
    """Quả cầu lửa vẽ sẵn ngay nắm tay (hàng chưởng): lõi vàng / trắng nóng ở nửa trước hình -> màu da (nắm tay còn nguyên hình),
    quầng cam sáng tách khỏi thân -> nền. Trả về số điểm ảnh gốc đã đổi."""
    c = cell['rgb']; r, g, b = c[..., 0], c[..., 1], c[..., 2]
    x0, y0, x1, y1 = cell['bb']
    nong = cell['a'] & (r > 245) & (g > 195)
    lab, n = ndimage.label(ndimage.binary_dilation(nong, iterations=1) & cell['a'])
    doi = np.zeros_like(nong)
    for j in range(1, n + 1):
        m = lab == j
        yy, xx = np.where(m)
        if m.sum() >= 12 and xx.mean() > x0 + 0.8 * (x1 - x0) and yy.mean() > y0 + 0.45 * (y1 - y0): doi |= m  # trước mặt, dưới đầu
    if not doi.any(): return 0
    # quầng: điểm cam rực (lam rất thấp) sát lõi
    quang = cell['a'] & ndimage.binary_dilation(doi, iterations=4) & (r > 225) & (b < 60) & ~doi
    c[doi | quang] = (236, 168, 118)
    return int((doi | quang).sum())


def co(c, s):
    x0, y0, x1, y1 = c['bb']
    rgba = np.dstack([c['rgb'][y0:y1, x0:x1].astype(np.uint8), (c['a'][y0:y1, x0:x1] * 255).astype(np.uint8)])
    nw, nh = max(1, round((x1 - x0) * s)), max(1, round((y1 - y0) * s))
    pm = rgba.astype(float); pm[..., :3] *= pm[..., 3:4] / 255
    sm = np.array(Image.fromarray(pm.round().astype(np.uint8), 'RGBA').resize((nw, nh), Image.BOX)).astype(float)
    a = sm[..., 3]; o = np.zeros((nh, nw, 4), np.uint8); m = a >= 128
    o[m, :3] = np.clip(sm[m, :3] * 255 / np.maximum(a[m, None], 1), 0, 255); o[m, 3] = 255
    return o


def dau_x(a):
    """Tâm ngang của 25 hàng điểm ảnh trên cùng (vùng đầu) của một ô 96×96."""
    ys = np.where(a.any(1))[0]
    return np.where(a[ys[0]:ys[0] + 25])[1].mean()


def main():
    ar = sys.argv[1:]
    if len(ar) < 2 or ar[0] not in TEN or ar[1] not in BO: sys.exit(__doc__)
    key, bo = ar[0], ar[1]
    than = '--than' in ar
    ma = 'em-be-%s-%s' % (key, bo) + ('' if than else '-don')
    if '--anh' in ar: src = ar[ar.index('--anh') + 1]
    else:
        ds = sorted(glob.glob(os.path.join(GOC, 'docs', 'anh-goc', '*', 'than-bo', ma + '.png')))
        if not ds: sys.exit('không thấy ảnh gốc docs/anh-goc/*/than-bo/%s.png' % ma)
        src = ds[-1]
    print('ảnh gốc', os.path.relpath(src, GOC))
    f_than = os.path.join(CUSTOM, 'em-be-%s-%s.sprite.json' % (key, bo))
    f_goc = os.path.join(CUSTOM, 'em-be-%s.sprite.json' % key)
    f_don = os.path.join(CUSTOM, 'em-be-%s-don.sprite.json' % key)
    dT, T = doc(f_than)
    if than:  # tấm thân mới: số khung, thời lượng theo tệp thân bộ hiện có; cỡ theo thân gốc
        dRef, R = doc(f_goc)
        dt = {k: dict(dT['dong_tac'][k]) for k in HANG_THAN if k in dT['dong_tac']}
        thu_tu = sorted(dt, key=lambda k: dt[k]['hang'])
    else:
        dRef, R = dT, T
        dD, _ = doc(f_don)
        thu_tu = HANG_DON
        if '--hang' in ar:
            VN = {'kiem': 'atk_sword', 'cung': 'atk_bow', 'giao': 'atk_spear', 'bua': 'atk_hammer', 'chuong': 'cast'}
            thu_tu = [VN[x] for x in ar[ar.index('--hang') + 1].split(',')]
            if sorted(thu_tu) != sorted(HANG_DON): sys.exit('--hang phải có đủ 5 hàng kiem,cung,giao,bua,chuong')
        # trong tệp game luôn theo thứ tự chuẩn (hàng 0 kiếm ... hàng 4 chưởng), dù ảnh gốc đổi chỗ
        dt = {k: {'hang': HANG_DON.index(k), 'so': 6, 'giay': dD['dong_tac'][k]['giay']} for k in HANG_DON}
    ia = R[0:96, 0:96, 3] > 127
    iy = np.where(ia.any(1))[0]; idle_h = int(iy[-1] - iy[0] + 1); tx = dau_x(ia)
    A = np.array(Image.open(src).convert('RGB')).astype(int)
    if '--vung' in ar:
        v = [int(x) for x in ar[ar.index('--vung') + 1].split(',')]
        A = A[v[0]:v[1], (v[2] if len(v) > 2 else 0):(v[3] if len(v) > 3 else A.shape[1])]
        print('vùng lưới', v, '->', A.shape[1], '×', A.shape[0])
    rows = cat_o(A, 8, len(thu_tu), [dt[k]['so'] for k in thu_tu], '--tu-do' in ar)
    if '--xoa-cung' in ar and 'atk_bow' in thu_tu:
        print('xoá nét cung vẽ sẵn (điểm ảnh gốc bỏ đi):', [xoa_net_manh(c) for c in rows[thu_tu.index('atk_bow')]])
    if '--xoa-cau' in ar and 'cast' in thu_tu:
        print('xoá cầu lửa vẽ sẵn (điểm ảnh gốc bỏ đi):', [xoa_cau(c) for c in rows[thu_tu.index('cast')]])
    # tỉ lệ: khung đứng (khung đầu các hàng đứng) cao bằng khung đứng của thân
    if than: h0 = [rows[0][0]['bb'][3] - rows[0][0]['bb'][1]]
    else: h0 = [rows[thu_tu.index(k)][0]['bb'][3] - rows[thu_tu.index(k)][0]['bb'][1] for k in ('atk_sword', 'atk_bow', 'atk_spear', 'cast')]
    s = (idle_h - 2) / float(np.median(h0))  # -2: viền tối một nét thêm ở trên và dưới sau khi co
    print('cao khung đứng thân', idle_h, '| cao gốc khung đầu hàng', h0, '| tỉ lệ', round(s, 4))
    so_max = max(dt[k]['so'] for k in thu_tu)
    S = np.zeros((96 * len(thu_tu), 96 * max(8, so_max), 4), np.uint8)
    d_than = None
    for h0_, k in enumerate(thu_tu):
        cells = rows[h0_]; h = dt[k]['hang']
        G = int(np.median([c['bb'][3] for c in cells]))  # đáy chung (bàn chân) của hàng
        d0 = None
        for j, c in enumerate(cells):
            o = co(c, s); nh, nw = o.shape[:2]
            x0, y0 = c['bb'][0], c['bb'][1]
            oy = 90 + round((y0 - G) * s)
            oy = max(1, min(oy, 95 - nh))
            mm = o[..., 3] > 0
            if d0 is None:
                if than and d_than is not None: d0 = d_than  # tấm thân: một phép dời cho cả tấm (theo hàng đứng)
                else:
                    tmp = np.zeros((96, 96), bool); yy, xx = np.where(mm); tmp[np.clip(yy + oy, 0, 95), np.clip(xx, 0, 95)] = True
                    d0 = tx - (x0 * s + dau_x(tmp)); d_than = d0
            ox = int(round(d0 + x0 * s)); ox = max(1, min(95 - nw, ox))
            S[h * 96 + oy:h * 96 + oy + nh, j * 96 + ox:j * 96 + ox + nw][mm] = o[mm]
    a = S[..., 3] > 0
    edge = np.zeros_like(a)
    for h in range(len(thu_tu)):
        for j in range(S.shape[1] // 96):
            sub = a[h * 96:(h + 1) * 96, j * 96:(j + 1) * 96]
            edge[h * 96:(h + 1) * 96, j * 96:(j + 1) * 96] = ndimage.binary_dilation(sub) & ~sub
    S[edge, :3] = V; S[edge, 3] = 255
    m = S[..., 3] > 0
    if '--tim' in ar:
        px = S[m][:, :3].astype(float) / 255
        for t, (r_, g_, b_) in enumerate(px):
            hh, sa, v = colorsys.rgb_to_hsv(r_, g_, b_)
            if (hh * 360 >= 340 or hh * 360 <= 40) and sa > 0.12 and v > 0.45: px[t] = colorsys.hsv_to_rgb(258 / 360, min(1, sa * 0.95), v * 0.93)
        S[m, :3] = (px * 255).round().astype(np.uint8)
    # bảng màu của thân bộ (tấm thân mới: bảng của chính ảnh, gom về tối đa 96 màu)
    if than:
        q = Image.fromarray(S[..., :3]).quantize(96, method=Image.MEDIANCUT)
        S[..., :3] = np.array(q.convert('RGB'))
    else:
        pal = np.unique(T.reshape(-1, 4), axis=0); pal = pal[pal[:, 3] > 0][:, :3].astype(int)
        cs = S[m][:, :3].astype(int); out = np.empty_like(cs)
        for st in range(0, len(cs), 20000):
            b_ = cs[st:st + 20000]; out[st:st + 20000] = pal[((b_[:, None, :] - pal[None]) ** 2).sum(-1).argmin(1)]
        S[m, :3] = out.astype(np.uint8)
        print('bảng màu thân bộ', len(pal), 'màu')
    S[~m] = 0
    bio = io.BytesIO(); Image.fromarray(S, 'RGBA').save(bio, 'PNG', optimize=True)
    if than:
        tep = dict(dT); tep.pop('cu', None)  # thân vẽ mới: bỏ dấu "cu" (thân bộ cũ đang tạm tắt) để game dùng lại
        tep['tam'] = 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode()
    else:
        tep = {'loai': 'linh-khi-sprite', 'doi_tuong': 'em-be', 'ma': ma, 'ten': '%s · %s · Đòn theo vũ khí' % (TEN[key], BO[bo]),
               'tam': 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode(), 'net': 2, 'khung_rong': 48, 'khung_cao': 48,
               'goc': [24, 45], 'rong': dT.get('rong', 16), 'cao': dT.get('cao', 29), 'dong_tac': dt}
    thu = '--thu' in ar
    tam = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tam'); os.makedirs(tam, exist_ok=True)
    fout = os.path.join(tam if thu else CUSTOM, ma + '.sprite.json')
    json.dump(tep, open(fout, 'w'), separators=(',', ':'), ensure_ascii=False)
    print('ghi', os.path.relpath(fout, GOC), len(bio.getvalue()), 'byte ảnh')
    # số đo cho game
    for k in sorted(thu_tu, key=lambda k: dt[k]['hang']):
        h = dt[k]['hang']
        so = [int((S[h * 96 + 1:(h + 1) * 96:2, j * 96 + 1:(j + 1) * 96:2, 3] > 127).sum()) for j in range(dt[k]['so'])]
        hh = [int(np.ptp(np.where(S[h * 96:(h + 1) * 96, j * 96:(j + 1) * 96, 3].any(1))[0]) + 1) for j in range(dt[k]['so'])]
        print('  %-10s cao %s  số điểm ảnh %s' % (k, hh, so))
    Image.fromarray(S).resize((S.shape[1] * 2, S.shape[0] * 2), Image.NEAREST).save(os.path.join(tam, ma + '-xem.png'))
    if not than:
        tay = de_xuat_tay(key, S)
        so = [int((S[1:96:2, j * 96 + 1:(j + 1) * 96:2, 3] > 127).sum()) for j in range(6)]
        print("TAY_KIEM: '%s-%s': { so: %s, tay: %s }," % (key, bo, json.dumps(so, separators=(', ', ':')), json.dumps(tay, separators=(', ', ':'))))
        ve_tay(S, tay, os.path.join(tam, ma + '-tay.png'))


def de_xuat_tay(key, S):
    """Nắm tay hàng kiếm (tự đo, để người nhập kiểm lại trên ảnh -tay.png): điểm da xa nhất về phía trước mặt trong vùng tay
    (dưới đầu, trên bàn chân), lấy tâm của chùm da quanh điểm đó, lùi vào giữa nắm tay 1 điểm ảnh. Khung giơ tay qua đầu thì
    máy này không bắt được: sửa tay trong dòng TAY_KIEM in ra."""
    out = []
    for j in range(6):
        g = S[1:96:2, j * 96 + 1:(j + 1) * 96:2]
        al = g[..., 3] > 127
        ys = np.where(al.any(1))[0]; top, H = ys[0], ys[-1] - ys[0] + 1
        da = np.zeros(al.shape, bool)
        for y, x in zip(*np.where(al)):
            hh, sa, v = colorsys.rgb_to_hsv(*(g[y, x, :3] / 255.0))
            da[y, x] = (hh * 360 <= 45 or hh * 360 >= 340) and sa > 0.2 and v > 0.5
        vung = da.copy(); vung[:int(top + 0.62 * H)] = False; vung[45 - 3:] = False
        if not vung.any(): out.append([6, -10]); continue
        yy, xx = np.where(vung); k = int(np.argmax(xx * 10 - abs(yy - 35)))
        X, Y = xx[k], yy[k]
        q = [(x, y) for y, x in zip(yy, xx) if abs(x - X) <= 2 and abs(y - Y) <= 2]
        cx = np.mean([p[0] for p in q]) + 0.5 - 0.5; cy = np.mean([p[1] for p in q]) + 0.5
        out.append([round((cx - 24) * 2) / 2, round((cy - 45) * 2) / 2])
    return out


def ve_tay(S, tay, f):
    Z = 12; X0, X1, Y0, Y1 = 8, 44, 6, 48; W = (X1 - X0) * Z
    out = Image.new('RGB', (W * 6, (Y1 - Y0) * Z), (90, 120, 95)); dr = ImageDraw.Draw(out)
    for i in range(6):
        g = S[1:96:2, i * 96 + 1:(i + 1) * 96:2]
        for y in range(Y0, Y1):
            for x in range(X0, X1):
                c = tuple(int(v) for v in g[y, x, :3]) if g[y, x, 3] > 127 else ((100, 130, 105) if (x + y) % 2 else (92, 122, 97))
                dr.rectangle([i * W + (x - X0) * Z, (y - Y0) * Z, i * W + (x - X0 + 1) * Z - 1, (y - Y0 + 1) * Z - 1], fill=c)
        for x in range(X0, X1 + 1, 4):
            dr.line([i * W + (x - X0) * Z, 0, i * W + (x - X0) * Z, (Y1 - Y0) * Z], fill=(255, 255, 0) if x == 24 else (40, 40, 40))
        for y in range(Y0 + 3, Y1 + 1, 4):
            dr.line([i * W, (y - Y0) * Z, i * W + W, (y - Y0) * Z], fill=(255, 255, 0) if y == 45 else (40, 40, 40))
        dr.line([i * W, 0, i * W, out.height], fill=(0, 0, 0), width=3)
        tx, ty = tay[i]; cx, cy = i * W + (24 + tx - X0) * Z, (45 + ty - Y0) * Z
        dr.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], outline=(255, 0, 80), width=3)
        dr.text((i * W + 4, 4), str(i + 1), fill=(255, 255, 255))
    out.save(f)


if __name__ == '__main__':
    main()
