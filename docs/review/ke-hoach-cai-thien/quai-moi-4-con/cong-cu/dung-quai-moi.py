"""Dựng lại 4 tấm sprite quái Rừng già (heoCon, heoNanh, chonBong, boHung) từ khung đã cắt (6 động tác).
python3 dung-quai-moi.py [--ghi]     không --ghi: chỉ ghi vào cong-cu/ra/ để xem.
Cách làm (docs/review/ke-hoach-cai-thien/quai-moi-4-con/YEU-CAU.md):
- Chuẩn cỡ theo thân: mỗi hàng MỘT hệ số so với hàng đứng thở (idle), đo bằng khớp đặc trưng SIFT (biến đổi đồng dạng RANSAC,
  trung vị mọi cặp khung hàng đó × khung idle); hàng nào khớp kém thì theo chiều rộng thân trung vị. Hàng trúng đòn khung 1 (chồm lên)
  và hàng gục giữ dáng thật (cùng hệ số của hàng, không ép cao).
- Cỡ trong game: chiều cao thân đứng (trung vị hàng idle) = đúng chiều cao thân đứng của tấm cũ (đo trên tấm cũ). Ảnh gấp net = 2 lần
  (như trùm nhỏ), thu nhỏ LANCZOS trên màu nhân alpha, alpha cắt 0/255 (viền sắc), rồi lượng tử SO_MAU màu không hoà sắc.
- Căn chân / căn tâm: mọi khung đặt đáy thân lên cùng đường đất (goc[1]) và tâm thân trên sàn (trung bình x của 35% dưới thân,
  cùng cách đo của game / can_tam) trùng điểm neo goc[0]. can_tam ghi độ lệch còn lại đo lại trên tấm đã dựng.
- Thời gian: xem NHIP bên dưới (khớp js/ky_nang_quai.js, js/mobs.js, js/monster_art.js).
Tấm cũ: chuyển sang <mã>-cu.sprite.json (mục "cu_cua": <mã>) — game chỉ nạp khi mở với ?quaicu=1 (js/sprite_custom.js).
"""
import sys, os, json, io, base64, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from anh_quai import *

GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
N = 2
SO_MAU = int(os.environ.get('SO_MAU', '32'))   # như các tấm quái thường (32 màu)
# Tốc độ đi của vai (js/data.js G.ROLES): heoCon lính xông 44, boHung khiên 26, chonBong nhanh nhẹn 78, heoNanh tinh anh 40.
TOC = {'heoCon': 44, 'heoNanh': 40, 'chonBong': 78, 'boHung': 26}
# Nhịp (giây). tele: báo trước của kỹ năng (game trải hàng tele đúng theo thời gian báo trước thật, mobs.js A.enemy);
# atk / hit / die: thời lượng cử động trong game (monster_art.js MA.dur, game kéo hàng theo đúng số này).
NHIP = {
    'heoCon':   dict(tele=0.6,  atk=0.6,  die=1.1),   # Húc thẳng: bao 0,6; cú lao bắt đầu đúng lúc ra đòn
    'heoNanh':  dict(tele=0.45, atk=0.65, die=1.4),   # tinh anh: húc ba lần (báo 0,45; mỗi lần hàng atk ×1,4); đòn thường báo 0,6
    'chonBong': dict(tele=0.45, atk=0.55, die=1.1),   # Lẩn bóng: mờ 0,35 (hàng tele), hiện ra báo 0,45 (hàng tele ×1,5), cào = hàng atk
    'boHung':   dict(tele=0.6,  atk=0.55, die=1.1),   # Lăn cầu đất: bao 0,6; cục đất lăn ra đúng lúc ra đòn
}
IDLE_GIAY, HIT_GIAY, DIE_TOI = 1.2, 0.35, 0.9    # gục ~0,9 giây rồi mờ
BUOC_THAN = 0.5   # một vòng đi (6 khung) = 0,5 chiều rộng thân → giay = quãng / tốc độ (chân không trượt)


def thu(a, z):
    """thu nhỏ RGBA hệ số z: LANCZOS trên màu nhân alpha, alpha cắt 128 → 0/255.
    Khung ảnh gốc đang mờ dần (alpha lớn nhất < 230, Bọ Hung gục khung 5, 6): đưa alpha về đủ đậm trước — game tự làm mờ hàng gục (mục "mo")."""
    mx = int(a[..., 3].max())
    if 0 < mx < 230: a = a.copy(); a[..., 3] = np.clip(a[..., 3].astype(np.float32) * (255.0 / mx), 0, 255).astype(np.uint8)
    H, W = a.shape[:2]; tw, th = max(1, round(W * z)), max(1, round(H * z))
    al = a[..., 3:4].astype(np.float32) / 255
    pre = np.concatenate([a[..., :3] * al, al * 255], 2).astype(np.float32)
    ch = [np.array(Image.fromarray(pre[..., k], 'F').resize((tw, th), Image.LANCZOS)) for k in range(4)]
    A = np.clip(ch[3], 0, 255); ok = A >= 128
    o = np.zeros((th, tw, 4), np.uint8)
    for k in range(3): o[..., k] = np.clip(np.where(A > 1, ch[k] / np.maximum(A, 1e-3) * 255, 0), 0, 255)
    o[..., 3] = ok * 255
    return o


def luu_png(sh):
    op = sh[..., 3] > 0; px = sh[op][:, :3]
    q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=SO_MAU, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:3 * SO_MAU]).reshape(-1, 3); sh[op, :3] = pal[np.array(q).ravel()]; sh[~op] = 0
    mau = sorted(set(map(tuple, sh.reshape(-1, 4).tolist())))
    flat = sh.reshape(-1, 4).astype(np.int64); key = ((flat[:, 0] * 256 + flat[:, 1]) * 256 + flat[:, 2]) * 256 + flat[:, 3]
    kmau = np.array([((c[0] * 256 + c[1]) * 256 + c[2]) * 256 + c[3] for c in mau], np.int64)
    ix = np.searchsorted(kmau, key).astype(np.uint8).reshape(sh.shape[:2])
    pim = Image.fromarray(ix, 'P'); pim.putpalette([v for c in mau for v in c[:3]])
    buf = io.BytesIO(); pim.save(buf, 'PNG', optimize=True, transparency=bytes(c[3] for c in mau))
    assert (np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')) == sh).all()
    return buf.getvalue(), len(mau) - 1


def sift_khung(fi, a):
    """(trung vị tỉ lệ SIFT so với các khung idle, số cặp tin được (>= 15 điểm trong))"""
    f = dac_trung(a); r = [ti_le(x, f) for x in fi]
    r8 = [s for s, k in r if s and k >= 8 and 0.4 < s < 2.5]; r15 = [s for s, k in r if s and k >= 15 and 0.4 < s < 2.5]
    return (float(np.median(r8)) if len(r8) >= 2 else None), len(r15), (float(np.median(r15)) if len(r15) >= 3 else None)


def ti_le_hang(ten, fi, ks, A0):
    """hệ số cỡ hàng so với idle = trung bình nhân của (1) SIFT: trung vị theo khung của trung vị các cặp khớp với 6 khung idle,
    (2) căn bậc hai tỉ lệ diện tích thân trung vị. Hàng trúng đòn đo khung 2–4 (khung 1 chồm lên), hàng gục đo khung 1–2 (còn đứng).
    Thêm hệ số từng khung: ảnh AI vẽ to nhỏ dần trong cùng hàng (ví dụ Heo Nanh báo đòn khung 1 to hơn khung 6 ~15%); khung nào khớp SIFT
    chắc (>= 3 cặp, mỗi cặp >= 15 điểm) mà lệch hệ số hàng quá 4% thì chỉnh khung đó về đúng cỡ (giới hạn 0,88..1,14)."""
    chon = list(range(1, len(ks))) if ten == 'hit' else [0, 1] if ten == 'die' else list(range(len(ks)))
    sk = [sift_khung(fi, a) for a in ks]
    ok = [sk[i][0] for i in chon if sk[i][0]]
    dt = float(np.sqrt(np.median([(ks[i][..., 3] > 128).sum() for i in chon]) / A0))
    sf = float(np.median(ok)) if ok else None
    s = float(np.sqrt(sf * dt)) if sf else dt
    rieng = []
    for i, (a8, n15, a15) in enumerate(sk):
        k = 1.0
        if sf and a15 and (ten != 'die' or i < 2) and abs(a15 / sf - 1) > 0.04: k = min(1.14, max(0.88, a15 / sf))
        rieng.append(round(k, 3))
    return s, dict(sift=round(sf, 4) if sf else None, dien_tich=round(dt, 4)), rieng


def tam_than_tam(sh, R, FW, FH, so):
    """tâm thân trên sàn từng khung trên tấm đã dựng (cách đo của game / trum-chet-pha3: alpha > 100, 35% dưới), điểm ảnh game"""
    L = []
    for i in range(so):
        s = sh[R * FH * N:(R + 1) * FH * N, i * FW * N:(i + 1) * FW * N, 3] > 100
        ys, xs = np.nonzero(s)
        if not len(xs): L.append(None); continue
        yb = ys.max(); h = yb - ys.min(); sel = ys >= yb - 0.35 * h
        L.append(xs[sel].mean() / N)
    return L


so_do = {}
for MA_ in MA:
    cu_p = os.path.join(CUSTOM, MA_ + '.sprite.json'); cu_ten = MA_ + '-cu'
    cu_d = json.load(open(cu_p, encoding='utf-8'))
    if cu_d.get('net', 1) != 1 or 'can_tam' in cu_d:   # đã dựng mới rồi → đọc tấm cũ ở tệp -cu
        cu_d = json.load(open(os.path.join(CUSTOM, cu_ten + '.sprite.json'), encoding='utf-8'))
    ca = np.array(Image.open(io.BytesIO(base64.b64decode(cu_d['tam'].split(',', 1)[1]))).convert('RGBA'))
    H_cu = float(np.median([do_than(khung_tam(cu_d, ca, 'idle', i))['cao'] for i in range(cu_d['dong_tac']['idle']['so'])]))
    W_cu = float(np.median([do_than(khung_tam(cu_d, ca, 'idle', i))['rong'] for i in range(cu_d['dong_tac']['idle']['so'])]))

    idle, _ = doc_khung(MA_, '1-dung'); fi = [dac_trung(a) for a in idle]
    A0 = float(np.median([(a[..., 3] > 128).sum() for a in idle]))
    mi = [do_than(a) for a in idle]; H0 = float(np.median([m['cao'] for m in mi])); W0 = float(np.median([m['rong'] for m in mi]))
    K = H_cu / H0   # điểm ảnh game / điểm ảnh ảnh cắt (ở hàng idle)
    hang, info, thua = {}, {}, {}
    for ten, b, so in BUOC:
        ks, fs = doc_khung(MA_, b); assert len(ks) == so, (MA_, b, len(ks))
        ms = [do_than(a) for a in ks]
        for j, (a, m) in enumerate(zip(ks, ms)):   # khung chỉ còn bụi tan (gục, khung cuối): đáy = mép dưới ảnh cắt, tâm = giữa ảnh
            if (a[..., 3] > 128).sum() < 0.15 * A0: ms[j] = dict(m, day=a.shape[0], cx=a.shape[1] / 2, thua=True)
        s, cach, rieng = (1.0, {}, [1.0] * so) if ten == 'idle' else ti_le_hang(ten, fi, ks, A0)
        hang[ten] = []
        for a, m, k in zip(ks, ms, rieng):
            z = N * K / (s * k)
            hang[ten].append((thu(a, z), m['cx'] * z, m['day'] * z))
        thua[ten] = [bool(m.get('thua')) for m in ms]
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
    png, nm = luu_png(sh)
    nh = NHIP[MA_]
    W_game = W0 * K
    move_giay = round(min(1.0, max(0.35, BUOC_THAN * W_game / TOC[MA_])), 2)
    dong = {
        'idle': {'hang': 0, 'so': 6, 'giay': IDLE_GIAY, 'lap': True},
        'move': {'hang': 1, 'so': 6, 'giay': move_giay, 'lap': True},
        'tele': {'hang': 2, 'so': 6, 'giay': nh['tele']},
        # khung 1 của hàng đánh là thế đứng (giống đứng thở): bỏ, để hàng đánh mở bằng cú bật / lao đúng lúc ra đòn (khung chạm sớm)
        'atk': {'hang': 3, 'so': 6, 'giay': nh['atk'], 'khung': [1, 2, 3, 4, 5]},
        'hit': {'hang': 4, 'so': 4, 'giay': HIT_GIAY},
        'die': {'hang': 5, 'so': 6, 'giay': nh['die'], 'mo': round(DIE_TOI / nh['die'], 2)},
    }
    # can_tam: đo lại trên tấm vừa dựng
    ct = {}
    for R, (ten, b, so) in enumerate(BUOC):
        L = tam_than_tam(sh, R, FW, FH, so)
        # khung chỉ còn bụi lác đác: tâm đo theo vài hạt bụi không có nghĩa (đã đặt giữa ảnh cắt lúc dựng) → 0
        ct[ten] = [int(round(GX - c)) if c is not None and not thua[ten][i] else 0 for i, c in enumerate(L)]
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
                  'o': [FW, FH], 'goc': [GX, GY], 'tam': list(sh.shape[1::-1]), 'mau': nm, 'byte_png': len(png), 'byte_tep': os.path.getsize(ra),
                  'hang': info, 'dong_tac': dong, 'can_tam': ct}
    print(MA_, json.dumps({k: v for k, v in so_do[MA_].items() if k not in ('hang', 'dong_tac', 'can_tam')}, ensure_ascii=False))
    for k, v in info.items(): print('   ', k, v)
    print('    can_tam', ct)
json.dump(so_do, open(os.path.join(RA, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
