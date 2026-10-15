"""Soát mượt (docs/review/ke-hoach-cai-thien/soat-muot/bao-cao.md mục 3, P1-P4, P6): thay MỘT hàng trong tấm sprite đang dùng
bằng khung đã cắt từ ảnh gen mới (docs/anh-goc/soat-muot/<tệp>-cat/<hàng>/khung-NN.png, cắt bằng docs/anh-goc/zed/cat-diem-anh.py).

python3 thay-hang.py [--ghi] [--chi caNocChua,nhim,...]
  không --ghi: chỉ ghi tấm thử vào cong-cu/ra/ để xem.

Giữ nguyên mọi hàng khác (từng điểm ảnh, bảng màu cũ), cỡ khung game (khung_rong / khung_cao), điểm neo (goc), hướng nhìn (phải).
- Cỡ: một hệ số cho cả hàng mới = tỉ lệ thân giữa các khung "tham chiếu" của hàng mới và khung tham chiếu cùng dáng trên tấm cũ
  (trung bình nhân của: khớp SIFT và căn bậc hai diện tích thân). Ví dụ Cá Nóc Chúa: khung đánh 1 (phồng hết cỡ) ↔ khung báo đòn 6.
- Dọc: quái đi đất đặt đáy thân từng khung lên đường đất của tấm cũ (trung vị đáy hàng đứng). Con bơi (Cá Nóc Chúa): cả hàng giữ đúng
  vị trí dọc như trên ảnh gen, khung tham chiếu trùng tâm khung tham chiếu cũ.
- Ngang: tâm thân trên sàn từng khung đặt vào điểm neo (như các lần dựng trước); "can_tam" của hàng đo lại.
- Màu: điểm ảnh mới gán màu gần nhất trong bảng màu cũ; điểm lệch xa (> 40) thêm tối đa 16 màu riêng.
- Tấm cũ chép nguyên sang <mã>-muotcu.sprite.json (mục "muot_cua": <mã>): game chỉ nạp khi mở ?anhmuotcu=1.
- Tấm mới ghi "bo_va": các vá tạm của Phiên 1 không còn cần (xi_vao, xi_ve, khung_trang) — game bỏ vá đó cho tấm này.
"""
import sys, os, json, io, base64, glob, importlib.util
import numpy as np
from PIL import Image

DAY_CC = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(DAY_CC, '../../../..'))
CC4 = os.path.join(REPO, 'docs/review/ke-hoach-cai-thien/quai-moi-4-con/cong-cu')
CC6 = os.path.join(REPO, 'docs/review/ke-hoach-cai-thien/quai-moi-6-con/cong-cu')
sys.path.insert(0, CC4)
from anh_quai import dac_trung, ti_le, CUSTOM   # noqa: E402


def nap(ten, tep):
    sp = importlib.util.spec_from_file_location(ten, tep); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


DQ = nap('dung_quai_moi', os.path.join(CC4, 'dung-quai-moi.py'))   # thu (LANCZOS + alpha 0/255)
D6 = nap('dung_6_con', os.path.join(CC6, 'dung-6-con.py'))         # do, mat_na

GHI = '--ghi' in sys.argv
CHI = sys.argv[sys.argv.index('--chi') + 1].split(',') if '--chi' in sys.argv else None
RA = os.path.join(DAY_CC, 'ra'); os.makedirs(RA, exist_ok=True)
GOC = os.path.dirname(DAY_CC)

# ma: (tệp ảnh gen, hàng, khung mới làm tham chiếu, (hàng cũ, khung cũ) tham chiếu, cấu hình)
VIEC = {
    'caNocChua': ('P1-caNocChua-4-danh-6k', 'atk', [0], ('tele', [5]),
                  dict(bay=True, dong={'lap_tu': 3, 'lap_den': 4}, bo_va=['xi_vao'])),
    'nhim': ('P2-nhim-4-danh-6k', 'atk', [4, 5], ('idle', None),
             dict(dong={'khung': [0, 1, 2, 3], 'lap_tu': 2, 'lap_den': 3, 've': [4, 5]}, bo_va=['xi_ve'])),
    # Nhím Gai Độc: khung 1 ảnh gen vẫn là dáng đứng (sau hàng báo đòn đã cuộn tròn) → bảng phát bỏ khung 1, vào thẳng khung cuộn 2.
    'nhimDoc': ('P2-nhimDoc-4-danh-6k', 'atk', [0, 4, 5], ('idle', None),
                dict(dong={'khung': [1, 2, 3], 'lap_tu': 2, 'lap_den': 3, 've': [4, 5]}, bo_va=['xi_vao'])),
    # Nhím Than (ảnh về sau, aac63d22): như Nhím Gai Độc; hàng đánh cũ không lặp (gai lửa trồi từ đất do code vẽ) — thêm lặp khung lăn 3–4.
    # Báo đòn của Nhím Than kết thúc ở dáng ĐỨNG (khác Nhím Gai Độc) = khung 1 ảnh gen → giữ khung 1 trong bảng phát.
    'nhimThan': ('P2-nhimThan-4-danh-6k', 'atk', [0, 4, 5], ('idle', None),
                 dict(dong={'khung': [0, 1, 2, 3], 'lap_tu': 2, 'lap_den': 3, 've': [4, 5]}, bo_va=['xi_vao'])),
    'heoNanh': ('P3-heoNanh-5-trung-don-4k', 'hit', [2, 3], ('idle', None), dict()),
    'hoLua-p2': ('P4-hoLua-p2-4-trung-don-4k', 'hit', [2, 3], ('idle', None), dict(bo_va=['khung_trang'])),
    'namChua-p2': ('P4-namChua-p2-4-trung-don-4k', 'hit', [2, 3], ('idle', None), dict(bo_va=['khung_trang'])),
    'hoTinh': ('P6-hoTinh-p1-4-danh-6k', 'atk', [4, 5], ('idle', None), dict()),
}


def giai(d):
    im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1])))
    return im, np.array(im.convert('RGBA'))


def o_khung(d, sh, ten, i):
    N = d.get('net', 1); FW, FH = d['khung_rong'] * N, d['khung_cao'] * N; R = d['dong_tac'][ten]['hang']
    return sh[R * FH:(R + 1) * FH, i * FW:(i + 1) * FW]


def dien_tich(a): return float(D6.mat_na(a).sum())


def gan_mau(sh_moi, vung, pal):
    """điểm ảnh trong vùng (mask) gán màu gần nhất của bảng pal (n×3); lệch > 40 thì thêm tối đa 16 màu."""
    px = sh_moi[vung][:, :3].astype(np.int32)
    def gan(p, P):
        best = np.zeros(len(p), np.int64); dmin = np.full(len(p), 1e18)
        for s in range(0, len(P), 64):
            d = ((p[:, None, :] - P[None, s:s + 64, :].astype(np.int32)) ** 2).sum(2)
            k = d.argmin(1); v = d[np.arange(len(p)), k]; t = v < dmin; best[t] = k[t] + s; dmin[t] = v[t]
        return best, np.sqrt(dmin)
    i, e = gan(px, pal); them = 0
    xa = px[e > 40]
    if len(xa) >= 16 and len(pal) < 240:
        n = min(16, 255 - len(pal) - 1)
        q = Image.fromarray(np.ascontiguousarray(xa.astype(np.uint8)).reshape(1, -1, 3)).quantize(colors=n, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        P2 = np.array(q.getpalette()[:3 * n]).reshape(-1, 3)
        pal = np.vstack([pal, P2]); them = n
        i, e = gan(px, pal)
    sh_moi[vung, :3] = pal[i]
    return pal, them, int((e > 40).sum())


def luu(sh):
    op = sh[..., 3] > 0; sh[~op] = 0
    flat = sh.reshape(-1, 4).astype(np.int64); key = ((flat[:, 0] * 256 + flat[:, 1]) * 256 + flat[:, 2]) * 256 + flat[:, 3]
    u, ix = np.unique(key, return_inverse=True)
    assert len(u) <= 256, len(u)
    mau = [((k >> 24) & 255, (k >> 16) & 255, (k >> 8) & 255, k & 255) for k in u.tolist()]
    pim = Image.fromarray(ix.astype(np.uint8).reshape(sh.shape[:2]), 'P'); pim.putpalette([v for c in mau for v in c[:3]])
    buf = io.BytesIO(); pim.save(buf, 'PNG', optimize=True, transparency=bytes(c[3] for c in mau))
    assert (np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')) == sh).all()
    return buf.getvalue(), len(mau)


def lam(ma):
    tep, ten, ref_moi, (ref_hang, ref_cot), c = VIEC[ma]
    p = os.path.join(CUSTOM, ma + '.sprite.json'); p_cu = os.path.join(CUSTOM, ma + '-muotcu.sprite.json')
    d = json.load(open(p_cu if os.path.exists(p_cu) else p, encoding='utf-8'))   # chạy lại: luôn dựng từ tấm cũ
    if d.get('muot_cua'): d = dict(d); d['ma'] = d.pop('muot_cua'); d['ten'] = d['ten'].replace(' (hàng cũ, ?anhmuotcu=1)', '')
    goc_d = json.loads(json.dumps(d))
    N = d.get('net', 1); FW, FH = d['khung_rong'] * N, d['khung_cao'] * N; GX, GY = d['goc'][0] * N, d['goc'][1] * N
    im, sh = giai(d); sh = sh.copy()
    pal = np.array(im.getpalette()[:3 * 256]).reshape(-1, 3)
    if im.mode == 'P':
        dung = sorted(set(np.array(im).ravel().tolist())); pal = pal[dung]
    so_cu = d['dong_tac'][ten]['so']; R = d['dong_tac'][ten]['hang']
    ks = [np.array(Image.open(f).convert('RGBA')) for f in sorted(glob.glob(os.path.join(GOC, tep + '-cat', '*', 'khung-*.png')))]
    bc = json.load(open(os.path.join(GOC, tep + '-cat', 'bao-cao.json'), encoding='utf-8'))['hang'][0]['khung']
    so = len(ks)
    # ---- cỡ
    rc = ref_cot if ref_cot is not None else list(range(d['dong_tac'][ref_hang]['so']))
    cu_ref = [o_khung(d, sh, ref_hang, i) for i in rc]
    A_cu = float(np.median([dien_tich(a) for a in cu_ref])); A_moi = float(np.median([dien_tich(ks[i]) for i in ref_moi]))
    s_dt = np.sqrt(A_cu / A_moi)
    fc = [dac_trung(a) for a in cu_ref]; ss = []
    for i in ref_moi:
        fm = dac_trung(ks[i])
        for f in fc:
            r, k = ti_le(fm, f)
            if r and k >= 8 and 0.05 < r < 2: ss.append(r)
    s_sift = float(np.median(ss)) if len(ss) >= 2 else None
    z = float(np.sqrt(s_dt * s_sift)) if s_sift else s_dt
    # ---- đặt khung
    m_cu = [D6.do(a, c) for a in cu_ref]
    hang = np.zeros((FH, sh.shape[1], 4), np.uint8); tran = []
    if c.get('bay'):
        y_moi = [bc[i]['khung_bao'][1] for i in range(so)]   # mép trên khung trên ảnh gen
        m0 = D6.do(ks[ref_moi[0]], c); cy_cu = float(np.median([m['cy'] for m in m_cu]))
        y_goc0 = (y_moi[ref_moi[0]] + m0['cy'])          # tâm khung tham chiếu, toạ độ ảnh gen
    else:
        day_cu = float(np.median([m['day'] for m in m_cu]))
    for j, a in enumerate(ks):
        b = DQ.thu(a, z); m = D6.do(b, c)
        X = int(round(GX - m['cx']))
        Y = int(round(cy_cu + (y_moi[j] - y_goc0) * z)) if c.get('bay') else int(round(day_cu - m['day']))
        o = hang[:, j * FW:(j + 1) * FW]
        x0, y0 = max(0, X), max(0, Y); x1, y1 = min(FW, X + b.shape[1]), min(FH, Y + b.shape[0])
        sub = b[y0 - Y:y1 - Y, x0 - X:x1 - X]
        mat = int((b[..., 3] > 0).sum() - (sub[..., 3] > 0).sum())
        if mat: tran.append((j + 1, mat))
        o[y0:y1, x0:x1] = np.where(sub[..., 3:4] > 0, sub, o[y0:y1, x0:x1])
    vung = hang[..., 3] > 0
    pal2, them, xa = gan_mau(hang, vung, pal)
    sh[R * FH:(R + 1) * FH] = hang
    png, nm = luu(sh)
    # ---- tệp
    t = json.loads(json.dumps(goc_d)); t['tam'] = 'data:image/png;base64,' + base64.b64encode(png).decode()
    dt = t['dong_tac'][ten]; dt['so'] = so
    for k in ('khung', 'lap_tu', 'lap_den', 've'):
        if k in c.get('dong', {}): dt[k] = c['dong'][k]
    if 'can_tam' in t:
        L = []
        for j in range(so):
            k = hang[:, j * FW:(j + 1) * FW]
            L.append(int(round((GX - D6.do(k, c)['cx']) / N)) if (k[..., 3] > 0).sum() >= 30 else 0)
        t['can_tam'][ten] = L
    if c.get('bo_va'): t['bo_va'] = c['bo_va']
    t['muot'] = 'soat-muot ' + tep
    cu = json.loads(json.dumps(goc_d)); cu['muot_cua'] = ma; cu['ma'] = ma + '-muotcu'; cu['ten'] = goc_d['ten'] + ' (hàng cũ, ?anhmuotcu=1)'
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    if GHI:
        if not os.path.exists(p_cu):
            json.dump(cu, open(p_cu, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        json.dump(t, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    else:
        json.dump(t, open(os.path.join(RA, ma + '.sprite.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    r = dict(hang=ten, so_cu=so_cu, so=so, z=round(z, 4), z_dien_tich=round(float(s_dt), 4), z_sift=round(s_sift, 4) if s_sift else None,
             cap_sift=len(ss), o=[d['khung_rong'], d['khung_cao']], goc=d['goc'], tran_o=tran, mau=nm, them_mau=them, lech_mau_xa=xa,
             byte_cu=len(base64.b64decode(goc_d['tam'].split(',', 1)[1])), byte_moi=len(png), dong_tac=dt, can_tam=t.get('can_tam', {}).get(ten))
    print(ma, json.dumps(r, ensure_ascii=False))
    return r


if __name__ == '__main__':
    kq = {}
    for ma in VIEC:
        if CHI and ma not in CHI: continue
        kq[ma] = lam(ma)
    p = os.path.join(DAY_CC, 'so-do.json')
    cu = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}
    cu.update(kq); json.dump(cu, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
