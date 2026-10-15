# Tách 6 tấm gục pha 2/3 (nền trong suốt, 8 khung ngang) thành hàng "die" trong tệp <trùm>-p2 / -p3.
# - Cắt: đường cắt dọc hẹp nhất (đường nối từng hàng, lệch ≤ 1 cột/hàng) trong dải ±W/14 quanh mốc W*k/8, chi phí = điểm có alpha ≥ 48
#   → khung chạm nhau không lọt mẩu sang khung bên.
# - Cỡ: hệ số = trung bình (căn bậc hai tỉ lệ diện tích, tỉ lệ chiều cao) của khối thân liền lớn nhất (alpha ≥ 128):
#   trung bình các khung idle của tấm pha / khung 1 tấm gục. Đo thân (khối liền lớn nhất), không tính đốm, hào quang rời.
# - Thu nhỏ trên alpha nhân sẵn (LANCZOS), alpha cắt sắc 128, màu đưa về đúng bảng màu sẵn có của tấm (không hoà sắc).
# - Đặt: đáy điểm đặc của mỗi khung trùng đường đất goc[1]; tâm thân trên sàn (35% dưới) trùng goc[0]; rồi tính can_tam như can-tam.py.
# Chạy lại an toàn: nếu tấm đã có hàng die thì bỏ hàng đó trước (giữ nguyên các hàng khác).
import base64, io, json, sys
from chung import *

def duong_cat(A, c, W):
    lo, hi = int(c - W / 14), int(c + W / 14)
    cost = (A[:, lo:hi] >= NGUONG_CAT).astype(np.float64) * 10 + (A[:, lo:hi] / 255.0)
    H, Wb = cost.shape; acc = cost.copy(); back = np.zeros((H, Wb), np.int8)
    for y in range(1, H):
        p = acc[y - 1]; l = np.r_[np.inf, p[:-1]]; r = np.r_[p[1:], np.inf]
        st = np.vstack([l, p, r]); k = st.argmin(0); acc[y] += st[k, np.arange(Wb)]; back[y] = k - 1
    # ưu tiên đường gần mốc khi bằng nhau
    x = int(np.argmin(acc[-1] + np.abs(np.arange(Wb) + lo - c) * 1e-6)); path = np.zeros(H, int)
    for y in range(H - 1, -1, -1):
        path[y] = x + lo; x += int(back[y, x]) if y > 0 else 0
    dac = int(sum((A[y, path[y]] >= NGUONG) for y in range(H)))
    return path, dac

def tach(im):
    A = np.array(im)[:, :, 3]; H, W = A.shape
    cuts = [duong_cat(A, W * k / 8, W) for k in range(1, 8)]
    xx = np.arange(W)[None, :]
    frames = []
    for i in range(8):
        L = cuts[i - 1][0][:, None] if i > 0 else np.full((H, 1), -1)
        R = cuts[i][0][:, None] if i < 7 else np.full((H, 1), W)
        m = (xx > L) & (xx <= R) if i > 0 else (xx <= R)
        if i == 7: m = xx > L
        arr = np.array(im).copy(); arr[~m] = 0
        frames.append(arr)
    return frames, [c[1] for c in cuts]

def do_than(alpha):
    m = than_lon(alpha >= NGUONG); x0, y0, x1, y1 = hop(m); return m.sum(), y1 - y0

def lam(ma, f):
    d, sh = doc(ma); n = d['net']; fw, fh = d['khung_rong'], d['khung_cao']; ax, ay = d['goc']
    p = os.path.join(CUSTOM, ma + '.sprite.json'); raw = json.load(open(p, encoding='utf-8'))
    pim = Image.open(io.BytesIO(base64.b64decode(raw['tam'].split(',', 1)[1])))
    assert pim.mode == 'P'
    dt = raw['dong_tac']
    if 'die' in dt:  # chạy lại: bỏ hàng die cũ
        h = dt.pop('die')['hang']; raw.get('can_tam', {}).pop('die', None)
        pim = pim.crop((0, 0, pim.size[0], h * fh * n))
    hang = max(v['hang'] for v in dt.values()) + 1
    a = np.array(sh)[:, :, 3]
    ar, hh = [], []
    for i in range(dt['idle']['so']):
        s, h = do_than(a[0:fh * n, i * fw * n:(i + 1) * fw * n]); ar.append(s); hh.append(h)
    im = Image.open(os.path.join(NGUON, f + '-chet.png')).convert('RGBA')
    frames, dac = tach(im)
    s0, h0 = do_than(frames[0][:, :, 3])
    k = ((np.mean(ar) / s0) ** 0.5 + np.mean(hh) / h0) / 2
    tt = {'ma': ma, 'he_so': round(float(k), 3), 'dac_tren_duong_cat': dac, 'tran': []}
    rowW = max(pim.size[0], 8 * fw * n)
    row = Image.new('RGBA', (8 * fw * n, fh * n), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        al = fr[:, :, 3]; ys, xs = np.nonzero(al >= NGUONG)
        x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        pad = 4; c = Image.fromarray(fr).crop((max(0, x0 - pad), max(0, y0 - pad), x1 + pad, y1 + pad))
        nw, nh = max(1, round(c.size[0] * k)), max(1, round(c.size[1] * k))
        c = c.convert('RGBa').resize((nw, nh), Image.LANCZOS).convert('RGBA')
        q = np.array(c); q[:, :, 3] = np.where(q[:, :, 3] >= NGUONG, 255, 0); q[q[:, :, 3] == 0] = 0
        al2 = q[:, :, 3] > 0; ys, xs = np.nonzero(al2)
        yb = ys.max() + 1
        cx = tam_san(al2)
        ox = int(round(ax * n - cx)); oy = int(ay * n - yb)
        if nw <= fw * n: ox = min(max(ox, 0), fw * n - nw)  # khung rộng hơn chỗ trống một bên: dịch vào trong ô, không cắt mất hình
        cell = np.zeros((fh * n, fw * n, 4), np.uint8)
        X0, Y0 = max(0, ox), max(0, oy); X1, Y1 = min(fw * n, ox + nw), min(fh * n, oy + nh)
        bi = q[Y0 - oy:Y1 - oy, X0 - ox:X1 - ox]
        mat = int(al2.sum() - (bi[:, :, 3] > 0).sum())
        if mat: tt['tran'].append((i, mat))
        cell[Y0:Y1, X0:X1] = bi
        row.paste(Image.fromarray(cell), (i * fw * n, 0))
    # màu về bảng màu sẵn có của tấm
    pal = pim.getpalette(); ti = pim.info.get('transparency')
    tidx = ti if isinstance(ti, int) else (list(ti).index(0) if ti else 0)
    ref = Image.new('P', (1, 1)); ref.putpalette(pal)
    rgb = Image.new('RGB', row.size, tuple(pal[3 * tidx:3 * tidx + 3]))
    rgb.paste(row.convert('RGB'), (0, 0))
    qi = rgb.quantize(palette=ref, dither=Image.Dither.NONE)
    qa = np.array(qi); ra = np.array(row)
    # chỉ số trong suốt chỉ dùng cho điểm trong suốt: điểm đặc rơi vào chỉ số đó → chọn màu gần nhất khác
    P = np.array(pal[:768]).reshape(-1, 3)[:len(pim.getpalette()) // 3].astype(int)
    solid = ra[:, :, 3] > 0
    bad = solid & (qa == tidx)
    if bad.any():
        P2 = P.copy(); P2[tidx] = 10 ** 6
        cols = ra[bad][:, :3].astype(int); qa[bad] = np.argmin(((cols[:, None, :] - P2[None]) ** 2).sum(2), 1)
    qa[~solid] = tidx
    err = np.abs(P[qa[solid]] - ra[solid][:, :3].astype(int)).mean()
    tt['sai_mau_tb'] = round(float(err), 1)
    out = Image.new('P', (rowW, (hang + 1) * fh * n), tidx); out.putpalette(pal)
    out.paste(pim, (0, 0))
    rp = Image.fromarray(qa.astype(np.uint8), 'P'); rp.putpalette(pal)
    out.paste(rp, (0, hang * fh * n))
    buf = io.BytesIO(); out.save(buf, 'PNG', optimize=True, transparency=tidx)
    raw['tam'] = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    dt['die'] = {'hang': hang, 'so': 8, 'giay': 1.2, 'mo': 0.6}
    # can_tam như can-tam.py (hàng một lần: bỏ trung vị lệch + một nửa độ nhảy)
    d2 = dict(raw); im2 = Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')
    C = tam_than(d2, im2)['die']; cs = [c for c in C if c is not None]; med = sorted(cs)[len(cs) // 2]
    tg = [med + (c - med) * 0.5 if c is not None else med for c in C]
    raw.setdefault('can_tam', {})['die'] = [max(-24, min(24, int(round(ax - x)))) for x in tg]
    tt['can_tam'] = raw['can_tam']['die']; tt['co'] = out.size; tt['kb'] = len(buf.getvalue()) // 1024
    open(p, 'w', encoding='utf-8').write(json.dumps(raw, ensure_ascii=False, separators=(',', ':')))
    return tt

if __name__ == '__main__':
    for ma, f in VIEC:
        print(lam(ma, f))
