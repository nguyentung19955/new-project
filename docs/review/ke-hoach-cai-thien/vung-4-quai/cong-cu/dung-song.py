"""Dựng tấm sprite 8 quái thường vùng 4 Sông sâu (raiCa, diaTrau, baBa, cocTia, ranNuoc, echPhinh, maDa, traiGai) từ khung đã cắt (6 động tác).
CHỖ CHỜ ẢNH (bước 3 phiên 2A): hôm nay chưa có ảnh — game dùng hình tạm (ảnh con mượn nhuộm màu, game/js/monster_art.js MA.hinhTam).
Khi chủ game gen xong nhóm C (docs/ke-hoach/buoc-3/KE-HOACH.md mục 4) và cắt khung vào docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/<hàng>/khung-NN.png
(cùng cách các vùng cũ: 6/6/6/6/4/6 khung — 1-dung, 2-di, 3-bao-don, 4-danh, 5-trung-don, 6-chet), chạy:
  python3 dung-song.py            # dựng con nào đủ ảnh, ghi vào cong-cu/ra/ để xem (không đụng game)
  python3 dung-song.py --ghi      # ghi game/art/custom/<mã>.sprite.json → game tự dùng ảnh thật, hết nhuộm (không phải sửa mã)
  python3 dung-song.py --chi maDa # chỉ một / vài con (phẩy)
  python3 dung-song.py --thu      # THỬ CÔNG CỤ: lấy khung của con mượn làm nguồn, chỉ ghi vào ra/ (không bao giờ ghi vào game)
Chép từ ../../quai-moi-lau/cong-cu/dung-lau.py, dùng lại công cụ quai-moi-4-con (anh_quai.py, dung-quai-moi.py) và quai-moi-6-con (dung-6-con.py) — không sửa các tệp đó.
Khác dung-lau.py: con MỚI, không có tấm cũ → cỡ trong game lấy theo chiều cao thân đứng của CON MƯỢN (hình tạm đang chạy trong game, cùng hộp va chạm
rong / cao), hoặc 'cao' trong CFG nếu muốn to / nhỏ hơn; không ghi tệp -cu. Tên, vùng 'song' ghi thẳng.
Sau khi --ghi: chạy node game/tests/quai_song.test.js, python3 game/build.py --hai-tep (ảnh 'vung': 'song' vào nhóm tải "Vùng Sông sâu").
Nếu dáng con mới khác hẳn con mượn (bộ phận, chiều cao) thì nên đổi def trong js/monster_art.js (khối "song") cho khớp cỡ thanh máu.
"""
import sys, os, json, io, base64, importlib.util
DAY_CC = os.path.dirname(os.path.abspath(__file__))
CC4 = os.path.abspath(os.path.join(DAY_CC, '../../quai-moi-4-con/cong-cu'))
CC6 = os.path.abspath(os.path.join(DAY_CC, '../../quai-moi-6-con/cong-cu'))
sys.path.insert(0, CC4)
from anh_quai import *          # noqa: F401,F403  (NGUON, CUSTOM, BUOC, doc_khung, dac_trung, khung_tam, np, Image)


def nap(ten, tep):
    sp = importlib.util.spec_from_file_location(ten, tep); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


DQ = nap('dung_quai_moi', os.path.join(CC4, 'dung-quai-moi.py'))   # thu, luu_png (SO_MAU), ti_le_hang
D6 = nap('dung_6_con', os.path.join(CC6, 'dung-6-con.py'))         # mat_na, do, xoa_manh_roi, mau_deu, tam_tam
do, mat_na, xoa_manh_roi, mau_deu, tam_tam = D6.do, D6.mat_na, D6.xoa_manh_roi, D6.mau_deu, D6.tam_tam

GHI = '--ghi' in sys.argv
THU = '--thu' in sys.argv
if GHI and THU: sys.exit('--thu chỉ để thử công cụ: không dùng cùng --ghi')
CHI = None
if '--chi' in sys.argv: CHI = sys.argv[sys.argv.index('--chi') + 1].split(',')
RA = os.path.join(DAY_CC, 'ra'); os.makedirs(RA, exist_ok=True)
N = 2
MA8 = ['raiCa', 'diaTrau', 'baBa', 'cocTia', 'ranNuoc', 'echPhinh', 'maDa', 'traiGai']
IDLE_GIAY, HIT_GIAY, DIE_TOI = 1.2, 0.35, 0.9
BUOC_THAN = 0.5
# muon: con mượn đang làm hình tạm (cỡ, hộp va chạm). toc: tốc độ đi của vai (js/data.js G.ROLES). tele: báo trước thật của kỹ năng
# (js/ky_nang_quai.js SO — game trải hàng báo đòn đúng thời gian báo trước). atk / hit / die: thời lượng cử động của def (js/monster_art.js MA.dur,
# def mượn). khung: cột hàng đánh được phát (từ 0). bay: con bay / bơi (căn theo tâm thân). Số dưới là đề xuất — xem ảnh rồi chỉnh.
CFG = {
    'raiCa':    dict(ten='Rái Cá Cầm Sào',  muon='heoCon',   toc=44, tele=0.6,  atk=0.6,  die=1.2, khung=[3, 4, 5]),      # chống sào nhảy → đập sào khi đáp (hàng đánh = khung 2–6 hàng nhảy; game phát lúc ĐÁP → mở bằng cú đập, quai-song-moi/bao-cao.md)
    'diaTrau':  dict(ten='Bầy Đỉa Trâu',    muon='caCon',    toc=60, tele=0.5,  atk=0.6,  die=1.1, khung=[1, 2, 3, 4, 5], cao=28),   # cao 28: bầy 3 con bè ngang, cỡ con mượn (35) thì rộng 56 > hộp 36 → ô 58×43 như ảnh gốc 116×86                       # nhổm lên → lao bám (hàng đánh lặp lúc lao)
    'baBa':     dict(ten='Ba Ba Mai Đồng',  muon='boHung',   toc=26 * 0.6, tele=0.6, atk=0.6, die=1.2, khung=[2, 3, 4, 5]),  # rụt cổ → phóng cổ đớp
    'cocTia':   dict(ten='Cóc Tía Phun Bọt', muon='hoaBaoTu', toc=38, tele=0.7,  atk=0.6,  die=1.4, khung=[1, 2, 3, 4, 5], cao=37),   # cao 37: thân rộng ≈ hộp va chạm 53 của con mượn  # phồng má → phun 3 bọt
    'ranNuoc':  dict(ten='Rắn Nước Sọc',    muon='chonBong', toc=78, tele=0.45, atk=0.55, die=1.2, khung=[2, 3, 4, 5]),  # lặn (báo đòn = trườn xuống nước) → trồi đớp
    'echPhinh': dict(ten='Ếch Phình Hơi',   muon='caNoc',    toc=48, tele=1.0,  atk=0.55, die=1.1, giu_co=['tele']),      # phình to dần có chủ ý (không chuẩn cỡ từng khung)
    'maDa':     dict(ten='Ma Da Tóc Rong',  muon='tieuYeu',  toc=34, tele=0.5,  atk=0.75, die=1.2, khung=[2, 3, 4, 5]),  # vung tay ném bầu nước
    'traiGai':  dict(ten='Trai Sông Gai',   muon='oc',       toc=26, tele=2.2,  atk=0.55, die=1.2, khung=[2, 3, 4, 5]),  # há vỏ 1,4 + báo 0,8 → bắn ngọc
}
for k in ('echPhinh',): CFG[k]['bay'] = True   # con mượn là con bơi (Cá Nóc): bỏ nếu ảnh mới vẽ đứng trên đất. Đỉa Trâu: ảnh mới (quai-song-moi) bò trên đất → bỏ 'bay'


def du_anh(ma):
    thieu = []
    for ten, b, so in BUOC:
        import glob
        d = glob.glob(os.path.join(NGUON, '%s-%s-cat' % (ma, b)))
        n = len(glob.glob(os.path.join(d[0], '*', 'khung-*.png'))) if d else 0
        if n != so: thieu.append('%s-%s-cat (%d/%d khung)' % (ma, b, n, so))
    return thieu


def dam(a):
    mx = int(a[..., 3].max())
    if 0 < mx < 230: a = a.copy(); a[..., 3] = np.clip(a[..., 3].astype(np.float32) * (255.0 / mx), 0, 255).astype(np.uint8)
    return a


def dung(MA_):
    c = CFG[MA_]; nguon = c['muon'] if THU else MA_
    thieu = du_anh(nguon)
    if thieu:
        print(MA_, 'CHƯA CÓ ẢNH — cần', NGUON + '/' + ', '.join(thieu)); return None
    mp = os.path.join(CUSTOM, c['muon'] + '.sprite.json'); md = json.load(open(mp, encoding='utf-8'))
    ma_ = np.array(Image.open(io.BytesIO(base64.b64decode(md['tam'].split(',', 1)[1]))).convert('RGBA'))
    mcu = [do(khung_tam(md, ma_, 'idle', i), c) for i in range(md['dong_tac']['idle']['so'])]
    nm_ = md.get('net', 1)   # tấm con mượn đã dựng mới (net 2): đo trên điểm ảnh tấm → chia net ra điểm game
    H_cu = c.get('cao') or float(np.median([m['cao'] for m in mcu])) / nm_   # cỡ thân đứng trong game (điểm game) = con mượn, hoặc CFG 'cao'
    LECH_BAY = (float(np.median([m['cy'] for m in mcu])) / nm_ - md['goc'][1]) if c.get('bay') else 0.0

    idle, _ = doc_khung(nguon, '1-dung'); fi = [dac_trung(a) for a in idle]
    A0 = float(np.median([(a[..., 3] > 128).sum() for a in idle]))
    mi = [do(a, c) for a in idle]; H0 = float(np.median([m['cao'] for m in mi])); W0 = float(np.median([m['rong'] for m in mi]))
    K = H_cu / H0
    hang, info, thua = {}, {}, {}
    for ten, b, so in BUOC:
        ks, fs = doc_khung(nguon, b); assert len(ks) == so, (MA_, b, len(ks))
        ks = [dam(a) for a in ks]
        for j in (c.get('xoa_roi') or {}).get(ten, []): ks[j] = xoa_manh_roi(ks[j])
        ms = [do(a, c) for a in ks]
        for j, (a, m) in enumerate(zip(ks, ms)):
            if not c.get('bay') and mat_na(a).sum() < 0.15 * A0: ms[j] = dict(m, day=a.shape[0], cx=a.shape[1] / 2, thua=True)
        if ten == 'idle':
            s = 1.0; _, cach, rieng = DQ.ti_le_hang(ten, fi, ks, A0); cach = dict(chinh_rieng_idle=True)
        elif ten in c.get('giu_co', []):
            s, cach, _ = DQ.ti_le_hang(ten, fi, ks[:1], A0); rieng = [1.0] * so; cach = dict(cach, giu_co=True)
        else: s, cach, rieng = DQ.ti_le_hang(ten, fi, ks, A0)
        hang[ten] = []
        for a, m, k in zip(ks, ms, rieng):
            z = N * K / (s * k)
            y = m['cy'] * z - LECH_BAY * N if c.get('bay') else m['day'] * z
            if c.get('bay') and ten == 'die' and c.get('roi'):
                w = c['roi'][len(hang[ten])]; y = w * y + (1 - w) * m['day'] * z
            hang[ten].append((DQ.thu(a, z), m['cx'] * z, y))
        thua[ten] = [bool(m.get('thua')) for m in ms]
        info[ten] = dict(he_so=round(s, 4), **cach, tung_khung=rieng)
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
    lech = mau_deu(sh, 48, chi_dem=True)
    DQ.SO_MAU = 48 if lech > 4000 else 32
    if DQ.SO_MAU == 48: mau_deu(sh, 48)
    png, nm = DQ.luu_png(sh)
    W_game = W0 * K
    move_giay = round(min(1.0, max(0.35, BUOC_THAN * W_game / c['toc'])), 2)
    dong = {
        'idle': {'hang': 0, 'so': 6, 'giay': IDLE_GIAY, 'lap': True},
        'move': {'hang': 1, 'so': 6, 'giay': move_giay, 'lap': True},
        'tele': {'hang': 2, 'so': 6, 'giay': c['tele']},
        'atk': {'hang': 3, 'so': 6, 'giay': c['atk']},
        'hit': {'hang': 4, 'so': 4, 'giay': c.get('hit', HIT_GIAY)},
        'die': {'hang': 5, 'so': 6, 'giay': c['die'], 'mo': round(c['mo_tu'] / 6 if c.get('mo_tu') else DIE_TOI / c['die'], 2)},
    }
    if c.get('khung'): dong['atk']['khung'] = c['khung']
    ct = {}
    for R, (ten, b, so) in enumerate(BUOC):
        L = tam_tam(sh, R, FW, FH, so, c)
        ct[ten] = [int(round(GX - v)) if v is not None and not thua[ten][i] else 0 for i, v in enumerate(L)]
    t = {'loai': 'linh-khi-sprite', 'doi_tuong': 'quai', 'ma': MA_, 'ten': c['ten'], 'vung': 'song',
         'tam': 'data:image/png;base64,' + base64.b64encode(png).decode(), 'net': N, 'khung_rong': FW, 'khung_cao': FH, 'goc': [GX, GY],
         'can_tam': ct, 'rong': md['rong'], 'cao': md['cao'], 'dong_tac': dong}
    Image.fromarray(sh).save(os.path.join(RA, MA_ + ('-thu' if THU else '') + '.png'))
    ra = os.path.join(CUSTOM, MA_ + '.sprite.json') if GHI else os.path.join(RA, MA_ + ('-thu' if THU else '') + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    r = {'nguon': nguon, 'cao_dung_muon': round(H_cu, 1), 'cao_dung_moi': round(H0 * K, 1), 'rong_dung_moi': round(W_game, 1), 'K': round(K, 5),
         'o': [FW, FH], 'goc': [GX, GY], 'tam': list(sh.shape[1::-1]), 'mau': nm, 'byte_tep': os.path.getsize(ra), 'ghi': ra}
    print(MA_, json.dumps(r, ensure_ascii=False))
    return r


if __name__ == '__main__':
    p_so = os.path.join(RA, 'so-do.json')
    so_do = json.load(open(p_so, encoding='utf-8')) if os.path.exists(p_so) else {}
    for MA_ in MA8:
        if CHI and MA_ not in CHI: continue
        r = dung(MA_)
        if r: so_do[MA_ + ('-thu' if THU else '')] = r
    json.dump(so_do, open(p_so, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
