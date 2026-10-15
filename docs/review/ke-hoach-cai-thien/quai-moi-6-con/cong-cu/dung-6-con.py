"""Dựng lại 6 tấm sprite quái Rừng già còn lại (namPhong, namPhongChua, hoaBaoTu, socNo, nhimDoc, ongVo) từ khung đã cắt (6 động tác).
python3 dung-6-con.py [--ghi]     không --ghi: chỉ ghi vào cong-cu/ra/ để xem.
DÙNG LẠI công cụ phiên quai-moi-4-con (../../quai-moi-4-con/cong-cu/): anh_quai.py (đọc khung, đo thân, SIFT) và các hàm của
dung-quai-moi.py (thu: LANCZOS + alpha 0/255, luu_png: 32 màu, ti_le_hang: chuẩn cỡ SIFT + diện tích, cùng cách làm).
Khác phiên trước (YEU-CAU.md cùng thư mục cha):
- Đo thân bỏ mảnh rời nhỏ (bụi lăn của Nhím, hạt dẻ cạnh Sóc chết, mảnh văng): chỉ giữ mảng >= 20% mảng lớn nhất (DO_LON).
- Hoa Bào Tử: đứng một chỗ (rễ) → tâm đo ở 15% dưới cùng (ụ đất), không phải 35%.
- Ong Vò (bay, bầy 3 con): căn theo TÂM BẦY (trọng tâm mọi điểm ảnh); độ cao bay giữ như tấm cũ (tâm bầy cách điểm neo đúng như tấm cũ).
- Nấm Phồng / Nấm Phồng Chúa: hàng nảy / nhảy (NHAY) lấy lại độ cao từ khung_bao trong bao-cao.json của lần cắt: đường đất của hàng =
  đáy thân thấp nhất trong hàng (toạ độ tấm gốc); mỗi khung đặt đúng chỗ của nó so với đường đất đó (nhân hệ số chuẩn cỡ) → thân bay lên thật.
- Sóc Nổ hàng đánh khung 5 còn hạt dẻ bay (mảng rời phía trên): xoá (hạt dẻ là đạn code vẽ).
"""
import sys, os, json, io, base64, glob, importlib.util
DAY_CC = os.path.dirname(os.path.abspath(__file__))
CC4 = os.path.abspath(os.path.join(DAY_CC, '../../quai-moi-4-con/cong-cu'))
sys.path.insert(0, CC4)
from anh_quai import *          # noqa: F401,F403  (NGUON, CUSTOM, BUOC, doc_khung, do_than, dac_trung, ti_le, doc_tam, khung_tam)
_sp = importlib.util.spec_from_file_location('dung_quai_moi', os.path.join(CC4, 'dung-quai-moi.py'))
DQ = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(DQ)   # chỉ nạp hàm (phần dựng 4 con nằm dưới if __name__ == '__main__')
from scipy import ndimage

GHI = '--ghi' in sys.argv
RA = os.path.join(DAY_CC, 'ra'); os.makedirs(RA, exist_ok=True)
N = 2
MA6 = ['namPhong', 'namPhongChua', 'hoaBaoTu', 'socNo', 'nhimDoc', 'ongVo']
IDLE_GIAY, HIT_GIAY, DIE_TOI = 1.2, 0.35, 0.9
BUOC_THAN = 0.5   # một vòng đi (6 khung) = 0,5 chiều rộng thân → giay = quãng / tốc độ (chân không trượt), như phiên trước
# Cấu hình từng con. toc: tốc độ đi của vai (js/data.js G.ROLES). tele: báo trước của kỹ năng (js/ky_nang_quai.js SO / chieu_trum.js; game trải
# hàng báo đòn đúng theo thời gian báo trước thật). atk / die: thời lượng cử động trong game (js/monster_art.js — MA.dur, game kéo hàng theo số này).
# khung: bảng phát hàng đánh (cột bắt đầu từ 0, G.KHUNG_TRUNG). lap_tu: hàng đánh chạy hết một lượt rồi LẶP từ cột này (Nhím lăn).
CFG = {
    'namPhong':     dict(toc=48, nhay=['move'], tele=1.0, atk=0.9, die=1.1, khung=[4, 5]),         # phồng 1,0 s (vòng đỏ) rồi nổ: khung nổ đúng lúc nổ
    'namPhongChua': dict(toc=40, nhay=['move', 'atk'], tele=0.7, atk=0.7, die=1.4, khung=[1, 2, 3, 4, 5]),  # tinh anh: đòn nổ báo 0,7; Nhảy dập chieu1
    'hoaBaoTu':     dict(move_giay=0.9, day_tam=0.15, tele=0.7, atk=0.6, die=1.4, khung=[2, 3, 4, 5]),  # phun 3 hạt: khung phun đúng lúc bắn
    'socNo':        dict(toc=34, tele=0.5, atk=0.75, die=1.2, khung=[3, 4, 5], xoa_roi={'atk': [4]}),  # ném: khung vung tay đúng lúc hạt dẻ bay
    'nhimDoc':      dict(toc=26, tele=2.2, atk=0.6, die=1.1, lap_tu=2),                            # cuộn 1,4 + báo 0,8; lăn lặp khung 3–6
    'ongVo':        dict(bay=True, idle_giay=0.6, move_giay=0.4, tele=0.5, atk=0.6, die=1.1, khung=[2, 3, 4, 5], mo_tu=4),  # bổ 3 lần
}
DO_LON = 0.2


def mat_na(a, bay=False):
    """điểm ảnh dùng để ĐO (alpha > 128), bỏ mảng rời nhỏ (< 20% mảng lớn nhất). Bầy ong: giữ hết."""
    m = a[..., 3] > 128
    if bay or m.sum() < 200: return m
    l, n = ndimage.label(m, structure=np.ones((3, 3)))
    if n <= 1: return m
    s = ndimage.sum(m, l, range(1, n + 1))
    giu = [i + 1 for i, v in enumerate(s) if v >= DO_LON * s.max()]
    return np.isin(l, giu)


def lon_nhat(a):
    m = a[..., 3] > 128
    l, n = ndimage.label(m, structure=np.ones((3, 3)))
    if n <= 1: return m
    s = ndimage.sum(m, l, range(1, n + 1))
    return l == (int(np.argmax(s)) + 1)


def do(a, c):
    """đo một khung: day (đường đất), cx (tâm thân trên sàn), cao, rong, (cy: tâm bầy cho con bay)"""
    if c.get('bay'):
        m = a[..., 3] > 128
        if m.sum() < 200: m = a[..., 3] > 0.5 * a[..., 3].max()   # khung đang mờ dần (Ong chết khung 5, 6)
        ys, xs = np.nonzero(m)
        dem = m.sum(1); hang = np.nonzero(dem >= 3)[0]
        cot = np.nonzero(m.sum(0) >= 2)[0]
        return dict(day=int(hang[-1]) + 1, cx=float(xs.mean()), cy=float(ys.mean()), cao=int(hang[-1] - hang[0] + 1), rong=int(cot[-1] - cot[0] + 1))
    b = a.copy(); b[..., 3] = np.where(mat_na(a), a[..., 3], 0)
    m = do_than(b)
    f = c.get('day_tam')
    if f:   # hoa: tâm ở f dưới cùng (ụ đất)
        t = b[..., 3] > 128; y1 = m['day'] - 1; h = m['cao']
        band = t.copy(); band[: int(y1 - f * h)] = False; band[y1 + 1:] = False
        xs = np.nonzero(band)[1]
        if len(xs): m['cx'] = float(xs.mean())
    return m


def xoa_manh_roi(a):
    """xoá mảng rời không dính thân (hạt dẻ bay ở khung ném của Sóc): giữ mảng (alpha > 0) chứa thân lớn nhất"""
    l, n = ndimage.label(a[..., 3] > 0, structure=np.ones((3, 3)))
    k = l[lon_nhat(a)]; k = int(np.bincount(k[k > 0]).argmax())
    o = a.copy(); o[(l != k) & (l > 0)] = 0
    return o


def mau_deu(sh, so, them=16, chi_dem=False):
    """bảng màu hai lớp: (1) cắt trung vị (so - them) màu trên mọi điểm ảnh như cách cũ; (2) điểm ảnh còn lệch màu xa (> 40) — mây nổ
    tím xanh chỉ có ở 2 khung, cách cũ gộp hết thành xanh nhạt — lấy thêm `them` màu riêng. Gán màu gần nhất rồi đưa vào luu_png của phiên trước."""
    op = sh[..., 3] > 0; px = np.ascontiguousarray(sh[op][:, :3])
    def cat(p, n):
        q = Image.fromarray(p.reshape(1, -1, 3)).quantize(colors=n, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        return np.array(q.getpalette()[:3 * n]).reshape(-1, 3)
    def gan(p, pal):
        d = ((p[:, None, :].astype(np.int32) - pal[None, :, :]) ** 2).sum(2)
        return d.argmin(1), np.sqrt(d.min(1))
    p1 = cat(px, so - them); _, e = gan(px, p1)
    if chi_dem: return int((e > 40).sum())
    xa = px[e > 40]
    pal = np.vstack([p1, cat(np.ascontiguousarray(xa), them)]) if len(xa) >= them else p1
    i, _ = gan(px, pal)
    sh[op, :3] = pal[i]
    return int((e > 40).sum())


def bao_cao_cat(ma, b):
    d = glob.glob(os.path.join(NGUON, '%s-%s-cat' % (ma, b)))[0]
    return json.load(open(os.path.join(d, 'bao-cao.json'), encoding='utf-8'))['hang'][0]['khung']


def tam_tam(sh, R, FW, FH, so, c):
    """đo lại tâm trên tấm đã dựng (điểm ảnh game) — cùng cách đo như lúc dựng"""
    L = []
    for i in range(so):
        k = sh[R * FH * N:(R + 1) * FH * N, i * FW * N:(i + 1) * FW * N]
        if (k[..., 3] > 0).sum() < 30: L.append(None); continue
        m = do(k, c); L.append(m['cx'] / N)
    return L


so_do = {}
for MA_ in MA6:
    c = CFG[MA_]
    cu_p = os.path.join(CUSTOM, MA_ + '.sprite.json'); cu_ten = MA_ + '-cu'
    cu_d = json.load(open(cu_p, encoding='utf-8')); byte_cu = os.path.getsize(cu_p)
    if cu_d.get('net', 1) != 1 or 'can_tam' in cu_d:   # đã dựng mới rồi → đọc tấm cũ ở tệp -cu
        cu_d = json.load(open(os.path.join(CUSTOM, cu_ten + '.sprite.json'), encoding='utf-8')); byte_cu = os.path.getsize(os.path.join(CUSTOM, cu_ten + '.sprite.json'))
    ca = np.array(Image.open(io.BytesIO(base64.b64decode(cu_d['tam'].split(',', 1)[1]))).convert('RGBA'))
    mcu = [do(khung_tam(cu_d, ca, 'idle', i), c) for i in range(cu_d['dong_tac']['idle']['so'])]
    H_cu = float(np.median([m['cao'] for m in mcu])); W_cu = float(np.median([m['rong'] for m in mcu]))
    # con bay: tâm bầy cách điểm neo bao nhiêu (điểm game) trên tấm cũ → giữ độ cao bay
    LECH_BAY = (float(np.median([m['cy'] for m in mcu])) - cu_d['goc'][1]) if c.get('bay') else 0.0

    idle, _ = doc_khung(MA_, '1-dung'); fi = [dac_trung(a) for a in idle]
    A0 = float(np.median([(a[..., 3] > 128).sum() for a in idle]))
    mi = [do(a, c) for a in idle]; H0 = float(np.median([m['cao'] for m in mi])); W0 = float(np.median([m['rong'] for m in mi]))
    K = H_cu / H0   # điểm ảnh game / điểm ảnh ảnh cắt (ở hàng idle)
    hang, info, thua, nhay_ghi = {}, {}, {}, {}
    for ten, b, so in BUOC:
        ks, fs = doc_khung(MA_, b); assert len(ks) == so, (MA_, b, len(ks))
        for j in (c.get('xoa_roi') or {}).get(ten, []): ks[j] = xoa_manh_roi(ks[j])
        ms = [do(a, c) for a in ks]
        for j, (a, m) in enumerate(zip(ks, ms)):   # khung chỉ còn bụi tan / mây nổ lác đác: đáy = mép dưới ảnh cắt, tâm = giữa ảnh
            if not c.get('bay') and mat_na(a).sum() < 0.15 * A0: ms[j] = dict(m, day=a.shape[0], cx=a.shape[1] / 2, thua=True)
        # độ nảy / nhảy thật của nấm: đáy thân (mảng lớn nhất) trên tấm gốc; đường đất = đáy thấp nhất của hàng
        if ten in c.get('nhay', []):
            kb = [k['khung_bao'] for k in bao_cao_cat(MA_, b)]
            day_goc = []
            for a, k in zip(ks, kb):
                ys = np.nonzero(lon_nhat(a).sum(1) >= 3)[0]
                day_goc.append(k[1] + int(ys[-1]) + 1)
            dat = max(day_goc)
            for j in range(so): ms[j] = dict(ms[j], day=dat - kb[j][1])   # neo y (toạ độ ảnh cắt) = đường đất của hàng
            nhay_ghi[ten] = [int(dat - d) for d in day_goc]   # độ cao (điểm ảnh tấm gốc) từng khung
        s, cach, rieng = (1.0, {}, [1.0] * so) if ten == 'idle' else DQ.ti_le_hang(ten, fi, ks, A0)
        hang[ten] = []
        for a, m, k in zip(ks, ms, rieng):
            z = N * K / (s * k)
            if c.get('bay'): y = m['cy'] * z - LECH_BAY * N   # tâm bầy đặt cao hơn điểm neo đúng như tấm cũ
            else: y = m['day'] * z
            hang[ten].append((DQ.thu(a, z), m['cx'] * z, y))
        thua[ten] = [bool(m.get('thua')) for m in ms]
        if ten in nhay_ghi: nhay_ghi[ten] = [round(v * N * K / (s * k) / N, 1) for v, k in zip(nhay_ghi[ten], rieng)]   # → điểm game
        info[ten] = dict(he_so=round(s, 4), **cach, tung_khung=rieng,
                         cao=round(float(np.median([m['cao'] / k for m, k in zip(ms, rieng)])) / s / H0, 3), rong=round(float(np.median([m['rong'] / k for m, k in zip(ms, rieng)])) / s / W0, 3))
    trai = max(x for v in hang.values() for a, x, y in v); phai = max(a.shape[1] - x for v in hang.values() for a, x, y in v)
    tren = max(y for v in hang.values() for a, x, y in v); duoi = max(a.shape[0] - y for v in hang.values() for a, x, y in v)
    GX = int(np.ceil(trai / N)) + 1; FW = GX + int(np.ceil(phai / N)) + 1
    GY = int(np.ceil(tren / N)) + 1; FH = GY + max(1, int(np.ceil(duoi / N))) + 1
    sh = np.zeros((len(BUOC) * FH * N, 6 * FW * N, 4), np.uint8)
    for R, (ten, b, so) in enumerate(BUOC):
        for C, (a, x, y) in enumerate(hang[ten]):
            X = int(round(GX * N - x)); Y = int(round(GY * N - y))
            o = sh[R * FH * N:(R + 1) * FH * N, C * FW * N:(C + 1) * FW * N]
            assert X >= 0 and Y >= 0 and X + a.shape[1] <= FW * N and Y + a.shape[0] <= FH * N, ('tràn ô', MA_, ten, C)
            sub = o[Y:Y + a.shape[0], X:X + a.shape[1]]; sub[:] = np.where(a[..., 3:4] > 0, a, sub)
    # Bảng màu: 32 màu như phiên trước. Con nào sau 32 màu còn > 4000 điểm ảnh lệch màu xa (> 40) thì thêm 16 màu riêng cho phần lệch
    # (mau_deu): Nấm Phồng (mây nổ tím chỉ có ở 2 khung — cách cũ gộp thành xanh nhạt), Hoa Bào Tử, Nhím Độc (gai tím / vàng lục nhiều sắc).
    lech = mau_deu(sh, 48, chi_dem=True)
    DQ.SO_MAU = 48 if lech > 4000 else 32
    if DQ.SO_MAU == 48: mau_deu(sh, 48)
    print('    điểm ảnh lệch màu xa với 32 màu:', lech, '→', DQ.SO_MAU, 'màu')
    png, nm = DQ.luu_png(sh)
    W_game = W0 * K
    if c.get('move_giay'): move_giay = c['move_giay']
    else: move_giay = round(min(1.0, max(0.35, BUOC_THAN * W_game / c['toc'])), 2)
    dong = {
        'idle': {'hang': 0, 'so': 6, 'giay': c.get('idle_giay', IDLE_GIAY), 'lap': True},
        'move': {'hang': 1, 'so': 6, 'giay': move_giay, 'lap': True},
        'tele': {'hang': 2, 'so': 6, 'giay': c['tele']},
        'atk': {'hang': 3, 'so': 6, 'giay': c['atk']},
        'hit': {'hang': 4, 'so': 4, 'giay': HIT_GIAY},
        'die': {'hang': 5, 'so': 6, 'giay': c['die'], 'mo': round(c['mo_tu'] / 6 if c.get('mo_tu') else DIE_TOI / c['die'], 2)},
    }
    if c.get('khung'): dong['atk']['khung'] = c['khung']
    if c.get('lap_tu') is not None: dong['atk']['lap_tu'] = c['lap_tu']
    ct = {}
    for R, (ten, b, so) in enumerate(BUOC):
        L = tam_tam(sh, R, FW, FH, so, c)
        ct[ten] = [int(round(GX - v)) if v is not None and not thua[ten][i] else 0 for i, v in enumerate(L)]
    t = {'loai': 'linh-khi-sprite', 'doi_tuong': 'quai', 'ma': MA_, 'ten': cu_d['ten'], 'vung': cu_d['vung'],
         'tam': 'data:image/png;base64,' + base64.b64encode(png).decode(), 'net': N, 'khung_rong': FW, 'khung_cao': FH, 'goc': [GX, GY],
         'can_tam': ct, 'rong': cu_d['rong'], 'cao': cu_d['cao'], 'dong_tac': dong}
    Image.fromarray(sh).save(os.path.join(RA, MA_ + '.png'))
    ra = os.path.join(CUSTOM, MA_ + '.sprite.json') if GHI else os.path.join(RA, MA_ + '.sprite.json')
    if GHI:
        cu = dict(cu_d); cu['ma'] = cu_ten; cu['cu_cua'] = MA_
        cu['ten'] = cu_d['ten'] if cu_d['ten'].endswith('(tấm cũ)') else cu_d['ten'] + ' (tấm cũ)'
        json.dump(cu, open(os.path.join(CUSTOM, cu_ten + '.sprite.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    so_do[MA_] = {'cao_dung_cu': H_cu, 'rong_dung_cu': W_cu, 'cao_dung_moi': round(H0 * K, 1), 'rong_dung_moi': round(W_game, 1), 'K': round(K, 5),
                  'o_cu': [cu_d['khung_rong'], cu_d['khung_cao']], 'o': [FW, FH], 'goc': [GX, GY], 'tam': list(sh.shape[1::-1]), 'mau': nm,
                  'byte_png': len(png), 'byte_tep': os.path.getsize(ra), 'byte_tep_cu': byte_cu,
                  'lech_bay': round(LECH_BAY, 1), 'nhay': nhay_ghi, 'hang': info, 'dong_tac': dong, 'can_tam': ct}
    print(MA_, json.dumps({k: v for k, v in so_do[MA_].items() if k not in ('hang', 'dong_tac', 'can_tam')}, ensure_ascii=False))
    for k, v in info.items(): print('   ', k, v)
    print('    can_tam', ct)
json.dump(so_do, open(os.path.join(RA, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
