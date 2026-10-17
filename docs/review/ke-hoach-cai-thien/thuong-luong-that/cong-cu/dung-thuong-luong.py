"""Thuồng Luồng THẬT (rắn sông 3 pha, ảnh chủ game gen): khung đã cắt (cat-thuong-luong.py) -> 3 tệp sprite game
game/art/custom/thuongLuong.sprite.json, thuongLuong-p2.sprite.json, thuongLuong-p3.sprite.json.
python3 dung-thuong-luong.py [--ghi]     (không --ghi: chỉ in số đo, ghi tạm vào thư mục ra/ cạnh tệp này — không commit)

Hàng game (tên động tác của js/sprite_custom.js) ← hàng ảnh gốc:
  pha 1 Độc   idle ← 1-dung (CHƯA CÓ: tạm = hàng bơi 2-di, phát chậm)     move ← 2-di (bơi)
              tele ← 3-bao-don + 2 khung đầu 4-danh (CHƯA CÓ: tạm = p2-2-bao-don + khung 1 p2-3-danh ĐỔI MÀU về Độc, tl_mau.DoiMauLop)
              atk  ← 4-danh từ khung 3 (CHƯA CÓ: tạm = p2-3-danh từ khung 2, đổi màu Độc)
              hit  ← 5-trung-don     die ← 6-lan (lặn xuống nước: game dùng cho Lặn đổi chỗ / Lặn – trồi đớp, và gục khi ?tl3c=0)
  pha 2 Băng  idle ← p2-1-dung   tele ← p2-2-bao-don + khung 1 p2-3-danh   atk ← p2-3-danh từ khung 2 (luồng băng)   hit ← p2-4-trung-don
              die ← 6-lan đổi màu Băng
  pha 3 Lửa   idle ← p3-1-dung   tele ← p3-2-bao-don + khung 1–2 p3-3-danh  atk ← p3-3-danh từ khung 3 (đầu đập xuống)  hit ← p3-4-trung-don
              die ← 6-lan đổi màu Lửa
Khi có docs/anh-goc/trum-moi/thuong-luong/gop-p1-a.png: chạy cat-thuong-luong.py rồi tệp này (--ghi) → pha 1 tự dùng ảnh thật (hết hàng tạm).

Nhịp đòn: chiêu trùm (js/sprite_custom.js SC.chonTrum) phát tele tới đúng mốc ra đòn, rồi hàng atk → hàng atk bắt đầu ĐÚNG khung chạm / phun
(như Ngư Tinh: dung-ngu-tinh.py), các khung lấy đà nối vào cuối tele. Thời lượng / mốc chiêu vẫn lấy của Ngư Tinh (js/thuong_luong.js: game giữ
b.art = 'nguTinh' cho luật; chỉ lúc VẼ mới dùng ảnh này) → báo trước, vùng trúng, thời lượng đòn không đổi.
Cỡ: K điểm game / điểm ảnh gốc, MỖI TẤM GỘP một hệ số (gop-p1-a gen to hơn) đo ở hàng đứng (bơi) của tấm → rắn đứng cao ~111 điểm game từ
đỉnh vây tới mặt nước, bằng Ngư Tinh nhuộm cũ; mọi hàng trong một tấm cùng hệ số. Điểm neo (b.x, b.y) = chân cổ rắn (giữa dải bụng nhạt ở thân dưới) trên mặt nước; mỗi hàng MỘT độ dời
(theo ô lưới = 1/6 bề ngang tấm gộp) → động tác trong hàng giữ đúng như ảnh vẽ, các hàng / các pha cùng một vạch nước.
Thu nhỏ: do-net/cong-cu/thu_net.py (mỗi điểm lấy một màu có thật, nét viền tối giữ), nét ×2, mỗi pha 192 màu (255 màu: +0,11 MB tải — trần 20 MB đang sát), PNG bảng màu.
Nét cao (tam_n3 / tam_n4): KHÔNG dựng — ảnh gốc chỉ có ~2,1 điểm ảnh / điểm game (nét 3 / 4 phải phóng to ảnh gốc, không thêm chi tiết).
"""
import sys, os, json, glob, io, base64, importlib.util
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DAY = os.path.abspath(os.path.join(HERE, '../../../../..'))
sys.path.insert(0, HERE)
import tl_mau  # noqa: E402
sp = importlib.util.spec_from_file_location('thu_net', os.path.join(DAY, 'docs/review/ke-hoach-cai-thien/do-net/cong-cu/thu_net.py'))
TN = importlib.util.module_from_spec(sp); sp.loader.exec_module(TN)

GOC = os.path.join(DAY, 'docs/anh-goc/trum-moi/thuong-luong')
GHI = '--ghi' in sys.argv
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)
N = 2
TAM_CUA = lambda h: 'gop-p1-a' if h in ('1-dung', '3-bao-don', '4-danh') else 'gop-p1-b' if h in ('2-di', '5-trung-don', '6-lan') else 'gop-' + h[:2]
O_TAM = {t: Image.open(os.path.join(GOC, t + '.png')).size[0] / 6.0 for t in ('gop-p1-a', 'gop-p1-b', 'gop-p2', 'gop-p3') if os.path.isfile(os.path.join(GOC, t + '.png'))}  # ô lưới (bề ngang tấm / 6)
DUNG_TAM = {'gop-p1-a': '1-dung', 'gop-p1-b': '2-di', 'gop-p2': 'p2-1-dung', 'gop-p3': 'p3-1-dung'}  # hàng đứng (hoặc bơi) làm chuẩn cỡ của từng tấm
NUOC = 10          # mặt nước: cao hơn đáy khung (bọt nước) bao nhiêu điểm ảnh gốc
CAO_DUNG = 111     # điểm game: đỉnh vây → mặt nước ở hàng đứng (Ngư Tinh nhuộm cũ cao 111)
CHAM = {1: 3, 2: 1, 3: 2}   # số khung đầu của hàng đánh gốc là lấy đà (nối vào cuối tele): pha 1 cắn ở khung 4 (đầu đập xuống nước), pha 2 phun từ khung 2, pha 3 đập ở khung 3
LAN_PHA_SAU = os.environ.get('TL_LAN_PHA_SAU') == '1'   # hàng lặn đổi màu cho pha 2, 3: TẮT (đỡ ~0,1 MB tải; pha 2, 3 lặn vẽ gợn nước như cũ)
SO_MAU = int(os.environ.get("TL_SO_MAU", "192"))


def co(h):
    return os.path.isfile(os.path.join(GOC, h + '-cat', 'bao-cao.json'))


def doc(h):
    """khung của hàng gốc: [(RGBA, khung_bao trên tấm gộp, cột j)]"""
    d = os.path.join(GOC, h + '-cat')
    bc = json.load(open(os.path.join(d, 'bao-cao.json'), encoding='utf-8'))
    fs = sorted(glob.glob(os.path.join(d, h, 'khung-*.png')))
    ks = bc['hang'][0]['khung']; assert len(fs) == len(ks), h
    out = []
    for j, (f, k) in enumerate(zip(fs, ks)):
        out.append((np.array(Image.open(f).convert('RGBA')), k['khung_bao'], j))
    return out


def co_bung(a):
    """x (trong khung) giữa dải bụng nhạt ở thân dưới (55–85 % chiều cao), None nếu không thấy (khung đã lặn)"""
    H = a.shape[0]; op = a[..., 3] > 0
    r, g, b = (a[..., i].astype(int) for i in range(3))
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    nhat = op & (mx > 150) & (mx - mn < 70)
    nhat[: int(0.55 * H)] = False; nhat[int(0.85 * H):] = False
    xs = np.nonzero(nhat)[1]
    return float(np.median(xs)) if len(xs) > 60 else None


# ---------- nguồn từng hàng ----------
p1_that = co('1-dung') and co('3-bao-don') and co('4-danh')
H = {h: doc(h) for h in ['2-di', '5-trung-don', '6-lan', 'p2-1-dung', 'p2-2-bao-don', 'p2-3-danh', 'p2-4-trung-don',
                         'p3-1-dung', 'p3-2-bao-don', 'p3-3-danh', 'p3-4-trung-don'] + (['1-dung', '3-bao-don', '4-danh'] if p1_that else [])}
anh = lambda h: [a for a, _, _ in H[h]]
doi21 = tl_mau.DoiMauLop(anh('p2-1-dung'), anh('2-di'), 2, 1)
doi12 = tl_mau.DoiMauLop(anh('2-di'), anh('p2-1-dung'), 1, 2)
doi13 = tl_mau.DoiMauLop(anh('2-di'), anh('p3-1-dung'), 1, 3)


def hang(h, tu=0, den=None, doi=None):
    return [(doi.doi(a) if doi else a, kb, j, h) for a, kb, j in H[h][tu:den]]


TAM = 'tạm (chờ gop-p1-a.png)'
if p1_that:
    P1 = [('idle', hang('1-dung'), 1.4, True, None), ('move', hang('1-dung'), 0.8, True, 'dùng chung hàng đứng (đỡ dung lượng tải; hàng bơi 2-di chưa dùng)'),
          ('tele', hang('3-bao-don') + hang('4-danh', 0, CHAM[1]), 0.7, False, None), ('atk', hang('4-danh', CHAM[1]), 0.6, False, None),
          ('hit', hang('5-trung-don'), 0.3, False, None), ('die', hang('6-lan'), 1.2, False, None)]
else:
    P1 = [('idle', hang('2-di'), 1.6, True, TAM + ': hàng bơi phát chậm'), ('move', hang('2-di'), 0.8, True, None),
          ('tele', hang('p2-2-bao-don', doi=doi21) + hang('p2-3-danh', 0, CHAM[2], doi=doi21), 0.7, False, TAM + ': báo đòn pha 2 đổi màu Độc'),
          ('atk', hang('p2-3-danh', CHAM[2], doi=doi21), 0.6, False, TAM + ': đánh pha 2 đổi màu Độc'),
          ('hit', hang('5-trung-don'), 0.3, False, None), ('die', hang('6-lan'), 1.2, False, None)]
P2 = [('idle', hang('p2-1-dung'), 1.4, True, None), ('tele', hang('p2-2-bao-don') + hang('p2-3-danh', 0, CHAM[2]), 0.7, False, None),
      ('atk', hang('p2-3-danh', CHAM[2]), 0.6, False, None), ('hit', hang('p2-4-trung-don'), 0.3, False, None)] + (
      [('die', hang('6-lan', doi=doi12), 1.2, False, 'hàng lặn pha 1 đổi màu Băng')] if LAN_PHA_SAU else [])
P3 = [('idle', hang('p3-1-dung'), 1.4, True, None), ('tele', hang('p3-2-bao-don') + hang('p3-3-danh', 0, CHAM[3]), 0.7, False, None),
      ('atk', hang('p3-3-danh', CHAM[3]), 0.6, False, None), ('hit', hang('p3-4-trung-don'), 0.3, False, None)] + (
      [('die', hang('6-lan', doi=doi13), 1.2, False, 'hàng lặn pha 1 đổi màu Lửa')] if LAN_PHA_SAU else [])
TEP = {1: ('thuongLuong', 'Thuồng Luồng', P1), 2: ('thuongLuong-p2', 'Thuồng Luồng · pha 2 (Băng)', P2), 3: ('thuongLuong-p3', 'Thuồng Luồng · pha 3 (Lửa)', P3)}

# ---------- neo mỗi hàng gốc: một độ dời trong ô lưới (giữa dải bụng), đáy = trung vị đáy khung - NUOC ----------
NEO = {}
for h, ks in H.items():
    O = O_TAM[TAM_CUA(h)]
    bx = [kb[0] + x - j * O for a, kb, j in ks for x in [co_bung(a)] if x is not None]
    NEO[h] = (float(np.median(bx)), float(np.median([kb[3] for a, kb, j in ks])) - NUOC)
print('neo (x trong ô, mặt nước y trên tấm):', {h: (round(v[0], 1), round(v[1], 1)) for h, v in NEO.items()})

# cỡ: MỖI TẤM một hệ số (gop-p1-a gen cỡ khác: tấm 2172 điểm ảnh, ba tấm kia 1536) — đỉnh vây → mặt nước ở hàng đứng (bơi) của tấm = CAO_DUNG
KT = {}
for t, h in DUNG_TAM.items():
    if h in H:
        cao = [NEO[h][1] - kb[1] for a, kb, j in H[h]]
        KT[t] = CAO_DUNG / float(np.median(cao))
        print('%s: cao đứng (điểm ảnh gốc) trung vị %.1f -> K = %.4f điểm game / điểm gốc' % (t, np.median(cao), KT[t]))
K = KT['gop-p2']


def dat(a, kb, j, h):
    """ảnh thu + chỗ đặt (điểm nét N) so với điểm neo"""
    z = N * KT[TAM_CUA(h)]
    W_, H_ = max(1, round(a.shape[1] * z)), max(1, round(a.shape[0] * z))
    t = TN.thu(a, W_, H_)
    nx, ny = NEO[h]
    ax = (j * O_TAM[TAM_CUA(h)] + nx - kb[0]) * z      # điểm neo cách mép trái ảnh thu
    ay = (ny - kb[1]) * z              # điểm neo cách mép trên ảnh thu
    return t, ax, ay


hang_thu = {}
for pha, (ma, ten, ds) in TEP.items():
    for dt, v, giay, lap, gc in ds:
        hang_thu[(pha, dt)] = [dat(a, kb, j, h) for a, kb, j, h in v]

trai = max(ax for v in hang_thu.values() for t, ax, ay in v)
phai = max(t.shape[1] - ax for v in hang_thu.values() for t, ax, ay in v)
tren = max(ay for v in hang_thu.values() for t, ax, ay in v)
duoi = max(t.shape[0] - ay for v in hang_thu.values() for t, ax, ay in v)
GX = int(np.ceil(trai / N)) + 1; FW = GX + int(np.ceil(phai / N)) + 1
GY = int(np.ceil(tren / N)) + 1; FH = GY + int(np.ceil(duoi / N)) + 1
print('ô khung %d x %d điểm game, gốc [%d, %d]' % (FW, FH, GX, GY))


def tran_trong(sh, pha):
    """mảnh trống đồng trên trán ở khung đứng đầu (điểm game so với điểm neo, ảnh quay PHẢI) — để js vẽ quầng điểm yếu đúng chỗ"""
    a = sh[:FH * N, :FW * N]
    r, g, b = (a[..., i].astype(int) for i in range(3))
    m = (a[..., 3] > 0) & (r > 120) & (r > b + 50) & (g > 60) & (g < r)
    m[int(GY * N * 0.6):] = False
    ys, xs = np.nonzero(m)
    if len(xs) < 10: return None
    return [round(float(np.median(xs)) / N - GX, 1), round(float(np.median(ys)) / N - GY, 1)]


so_do = {'o': [FW, FH], 'goc': [GX, GY], 'K': {t: round(v, 4) for t, v in KT.items()}, 'neo': NEO, 'p1_that': p1_that, 'tep': {}}
for pha, (ma, ten, ds) in TEP.items():
    cot = max(len(hang_thu[(pha, dt)]) for dt, *_ in ds)
    rows = [d for d in ds if not (pha == 1 and d[0] == ('move' if p1_that else 'idle'))]   # pha 1: đi trỏ chung hàng đứng (tạm: đứng trỏ hàng bơi) — không tốn thêm hàng
    sh = np.zeros((len(rows) * FH * N, cot * FW * N, 4), np.uint8)
    dong, ghi_chu = {}, {}
    for R, (dt, v, giay, lap, gc) in enumerate(rows):
        for C, (t, ax, ay) in enumerate(hang_thu[(pha, dt)]):
            X = int(round(GX * N - ax)); Y = int(round(GY * N - ay))
            o = sh[R * FH * N:(R + 1) * FH * N, C * FW * N:(C + 1) * FW * N]
            assert X >= 0 and Y >= 0 and X + t.shape[1] <= FW * N and Y + t.shape[0] <= FH * N, ('tràn ô', ma, dt, C)
            o[Y:Y + t.shape[0], X:X + t.shape[1]] = np.where(t[..., 3:4] > 0, t, o[Y:Y + t.shape[0], X:X + t.shape[1]])
        dong[dt] = {'hang': R, 'so': len(v), 'giay': giay}
        if lap: dong[dt]['lap'] = True
        if dt == 'die': dong[dt]['mo'] = 0.85
        if gc: ghi_chu[dt] = gc
    for dt, v, giay, lap, gc in ds:
        if dt not in dong:  # pha 1: đi = hàng đứng nhanh hơn (tạm: đứng = hàng bơi chậm hơn)
            dong[dt] = dict(dong['idle' if dt == 'move' else 'move'], giay=giay, lap=True); ghi_chu[dt] = gc
    sh = TN.giam_mau(sh, SO_MAU)
    png = TN.png_bang_mau(sh)
    tt = tran_trong(sh, pha)
    t = {'loai': 'linh-khi-sprite', 'doi_tuong': 'quai', 'ma': ma, 'ten': ten, 'vung': 'song',
         'tam': 'data:image/png;base64,' + base64.b64encode(png).decode(), 'net': N,
         'khung_rong': FW, 'khung_cao': FH, 'goc': [GX, GY], 'rong': 152, 'cao': 105, 'dong_tac': dong,
         'chi_hai_tep': True,
         'ghi_chu': 'thuong-luong-that 17/10: dựng bằng docs/review/ke-hoach-cai-thien/thuong-luong-that/cong-cu/dung-thuong-luong.py từ docs/anh-goc/trum-moi/thuong-luong/gop-*.png. '
                    + ('; '.join('%s: %s' % kv for kv in ghi_chu.items()) or 'đủ ảnh thật.') + (' Trống trên trán (điểm game so với neo, ảnh quay phải): %s.' % tt if tt else '')}
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    so_do['tep'][ma] = {'tam': list(sh.shape[1::-1]), 'mau': int(len(np.unique(sh.reshape(-1, 4), axis=0))), 'byte_png': len(png),
                        'byte_json': os.path.getsize(ra), 'dong_tac': dong, 'tran': tt, 'tam_thoi': ghi_chu}
    print(ma, json.dumps(so_do['tep'][ma], ensure_ascii=False))
json.dump(so_do, open(os.path.join(RA, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
