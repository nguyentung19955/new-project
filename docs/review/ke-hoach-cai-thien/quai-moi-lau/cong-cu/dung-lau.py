"""Dựng lại 10 tấm sprite quái Lâu đài cổ (linhMa, doiThan, tuongDa, denLong, meoDen, huLua, tieuYeu, nhimThan, tuongMa, huChua) từ khung đã cắt (6 động tác).
python3 dung-lau.py [--ghi] [--chi <mã>[,<mã>...]]     không --ghi: chỉ ghi vào cong-cu/ra/ để xem.  --chi tuongMa: chỉ dựng lại một con.
Chép từ ../../quai-moi-bien/cong-cu/dung-bien.py (cùng cách làm), DÙNG LẠI công cụ phiên quai-moi-4-con (../../quai-moi-4-con/cong-cu/: anh_quai.py,
dung-quai-moi.py — thu / luu_png / ti_le_hang) và quai-moi-6-con (../../quai-moi-6-con/cong-cu/dung-6-con.py — mat_na / do / xoa_manh_roi / mau_deu / tam_tam).
Khác phiên Hang biển (../YEU-CAU.md):
- Con bay (doiThan: bầy 3 con, denLong): căn theo TÂM THÂN (Dơi: tâm bầy), độ cao bay giữ như tấm cũ — riêng hàng chết RƠI XUỐNG ĐẤT: mục 'roi'
  (mỗi khung một hệ số 1 = độ cao bay, 0 = đáy thân trên đường đất, giữa = nội suy điểm neo) — ảnh chết vẽ dơi / đèn đã nằm trên đất từ khung 4 (Dơi) / khung 3 (Đèn).
- Khung chết mờ dần (Lính Ma, Mèo Đen khung 5–6, Đèn Lồng khung 6 — bản mờ của khung trước): đưa alpha về đủ đậm NGAY KHI ĐỌC (như thu() đã làm)
  để đo đúng như khung gốc; game tự làm mờ theo mục "mo" của hàng chết.
- xoa_roi: mảnh rời lạc trong khung cắt (Lính Ma đánh khung 2, 6: chùm chổi thừa; Tướng Ma đánh khung 3, 6 và chết khung 2: mẩu đao bị cắt ở mép) — xoá.
- Hũ Lửa: hàng đánh = lăn tròn (cột 2–4 lặp suốt lúc lăn: lap_tu 1, lap_den 3, cử động 'lan'), lúc vỡ phát khung 5–6 (khung [4, 5]).
"""
import sys, os, json, io, base64, importlib.util
DAY_CC = os.path.dirname(os.path.abspath(__file__))
CC4 = os.path.abspath(os.path.join(DAY_CC, '../../quai-moi-4-con/cong-cu'))
CC6 = os.path.abspath(os.path.join(DAY_CC, '../../quai-moi-6-con/cong-cu'))
sys.path.insert(0, CC4)
from anh_quai import *          # noqa: F401,F403  (NGUON, CUSTOM, BUOC, doc_khung, do_than, dac_trung, ti_le, doc_tam, khung_tam)


def nap(ten, tep):
    sp = importlib.util.spec_from_file_location(ten, tep); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


DQ = nap('dung_quai_moi', os.path.join(CC4, 'dung-quai-moi.py'))   # thu, luu_png (SO_MAU), ti_le_hang
D6 = nap('dung_6_con', os.path.join(CC6, 'dung-6-con.py'))         # mat_na, do, xoa_manh_roi, mau_deu, tam_tam (phần dựng 6 con dưới __main__)
do, mat_na, xoa_manh_roi, mau_deu, tam_tam = D6.do, D6.mat_na, D6.xoa_manh_roi, D6.mau_deu, D6.tam_tam

GHI = '--ghi' in sys.argv
CHI = None
if '--chi' in sys.argv: CHI = sys.argv[sys.argv.index('--chi') + 1].split(',')
RA = os.path.join(DAY_CC, 'ra'); os.makedirs(RA, exist_ok=True)
N = 2
MA10 = ['linhMa', 'doiThan', 'tuongDa', 'denLong', 'meoDen', 'huLua', 'tieuYeu', 'nhimThan', 'tuongMa', 'huChua']
IDLE_GIAY, HIT_GIAY, DIE_TOI = 1.2, 0.35, 0.9
BUOC_THAN = 0.5   # một vòng đi (6 khung) = 0,5 chiều rộng thân → giay = quãng / tốc độ (chân không trượt), như phiên trước
# toc: tốc độ đi của vai (js/data.js G.ROLES theo G.MOB_ART). tele: báo trước của kỹ năng (js/ky_nang_quai.js SO; game trải hàng báo đòn đúng
# theo thời gian báo trước thật). atk / hit / die: thời lượng cử động trong game (js/monster_art.js MA.dur — game kéo hàng theo số này).
# khung: bảng phát hàng đánh (cột từ 0). lap_tu / lap_den: hàng đánh hết một lượt thì lặp các cột này. mo_tu: hàng chết mờ từ cột này.
CFG = {
    'linhMa':   dict(toc=44, tele=0.6, atk=0.55, die=1.3, khung=[2, 3, 4, 5], mo_tu=4, xoa_roi={'atk': [1, 5]}),  # hiện sau lưng → chém: chổi bổ xuống / quét đúng lúc vùng chém nổ
    'doiThan':  dict(bay=True, toc=60, tele=0.55, atk=0.6, die=1.1, roi=[1, 1, 0.6, 0, 0, 0], deu_co=['tele']),   # bầy 3 con; bổ nhào chữ V (lao 0,22 s) cả hàng đánh
    'tuongDa':  dict(toc=26 * 0.6, tele=0.7, atk=0.6, die=1.2, khung=[3, 4, 5]),              # đi khiên chậm (×0,6); đập đất: khung nứt đất + bụi đúng lúc sóng nổ
    'denLong':  dict(bay=True, toc=38, tele=0.7, atk=0.55, die=1.2, khung=[3, 4, 5], mo_tu=5, roi=[1, 0.5, 0, 0, 0, 0]),  # lửa ma (code vẽ): chớp ở miệng đúng lúc bắn
    'meoDen':   dict(toc=78, tele=0.45, atk=0.5, die=1.2, khung=[3, 4, 5], mo_tu=4),           # cào: khung vuốt đúng lúc vùng cào nổ (bóng ảo dùng lại tấm này)
    'huLua':    dict(toc=48, tele=0.85, atk=1.0, die=1.1, khung=[4, 5], lap_tu=1, lap_den=3),  # cuộn tròn 0,85 → lăn (cột 2–4 lặp) → vỡ
    'tieuYeu':  dict(toc=34, tele=0.5, atk=0.75, die=1.2, khung=[2, 3, 4, 5]),                 # ném 3 lá bùa (code vẽ): khung vung tay đúng lúc ném
    'nhimThan': dict(toc=26, tele=2.2, atk=0.6, die=1.1, khung=[2, 3, 4, 5]),                  # dựng gai 1,4 + báo 0,8 → gai lửa trồi (code vẽ): khung tia lửa dưới chân
    'tuongMa':  dict(toc=40, tele=0.6, atk=0.6, die=1.5, khung=[3, 4, 5], xoa_roi={'atk': [2, 5], 'die': [1]}),  # tinh anh: chém thường — khung vệt đao đúng lúc ra đòn
    'huChua':   dict(toc=40, tele=0.7, atk=0.75, die=1.4, khung=[3, 4, 5]),                    # tinh anh: đổ dầu — khung rót dầu đúng lúc vệt dầu (code) hiện
}

def dam(a):
    """khung ảnh gốc đang mờ dần (alpha lớn nhất < 230): đưa alpha về đủ đậm (cùng cách thu() của phiên quai-moi-4-con) — để đo đúng như khung gốc"""
    mx = int(a[..., 3].max())
    if 0 < mx < 230: a = a.copy(); a[..., 3] = np.clip(a[..., 3].astype(np.float32) * (255.0 / mx), 0, 255).astype(np.uint8)
    return a


def dung(MA_):
    c = CFG[MA_]
    cu_p = os.path.join(CUSTOM, MA_ + '.sprite.json'); cu_ten = MA_ + '-cu'
    cu_d = json.load(open(cu_p, encoding='utf-8')); byte_cu = os.path.getsize(cu_p)
    if cu_d.get('net', 1) != 1 or 'can_tam' in cu_d:   # đã dựng mới rồi → đọc tấm cũ ở tệp -cu
        cu_p = os.path.join(CUSTOM, cu_ten + '.sprite.json'); cu_d = json.load(open(cu_p, encoding='utf-8')); byte_cu = os.path.getsize(cu_p)
    ca = np.array(Image.open(io.BytesIO(base64.b64decode(cu_d['tam'].split(',', 1)[1]))).convert('RGBA'))
    mcu = [do(khung_tam(cu_d, ca, 'idle', i), c) for i in range(cu_d['dong_tac']['idle']['so'])]
    H_cu = float(np.median([m['cao'] for m in mcu])); W_cu = float(np.median([m['rong'] for m in mcu]))
    LECH_BAY = (float(np.median([m['cy'] for m in mcu])) - cu_d['goc'][1]) if c.get('bay') else 0.0   # con bơi: tâm thân so với điểm neo (tấm cũ)

    idle, _ = doc_khung(MA_, '1-dung'); fi = [dac_trung(a) for a in idle]
    A0 = float(np.median([(a[..., 3] > 128).sum() for a in idle]))
    mi = [do(a, c) for a in idle]; H0 = float(np.median([m['cao'] for m in mi])); W0 = float(np.median([m['rong'] for m in mi]))
    K = H_cu / H0
    hang, info, thua = {}, {}, {}
    for ten, b, so in BUOC:
        if ten == 'hit' and c.get('hit_ghep'):   # Ốc: chưa có ảnh trúng đòn — ghép khung 1–2 báo đòn (rút vỏ) + khung 1–2 đứng thở (đã chuẩn cỡ)
            hang['hit'] = hang['tele'][:2] + hang['idle'][:2]; thua['hit'] = thua['tele'][:2] + thua['idle'][:2]
            info['hit'] = dict(ghep='tele[0:2] + idle[0:2]', he_so=[info['tele']['he_so']] * 2 + [1.0] * 2)
            continue
        ks, fs = doc_khung(MA_, b); assert len(ks) == so, (MA_, b, len(ks))
        ks = [dam(a) for a in ks]
        for j in (c.get('xoa_roi') or {}).get(ten, []): ks[j] = xoa_manh_roi(ks[j])
        ms = [do(a, c) for a in ks]
        for j, (a, m) in enumerate(zip(ks, ms)):   # khung chỉ còn bụi / bọt lác đác: đáy = mép dưới ảnh cắt, tâm = giữa ảnh
            if not c.get('bay') and mat_na(a).sum() < 0.15 * A0: ms[j] = dict(m, day=a.shape[0], cx=a.shape[1] / 2, thua=True)
        if ten == 'idle':   # hàng gốc (hệ số 1); khung nào AI vẽ to / nhỏ hẳn so với các khung đứng khác (Cá Nóc Chúa khung 3–4 to hơn ~15%)
            s = 1.0; _, cach, rieng = DQ.ti_le_hang(ten, fi, ks, A0)   # thì chỉnh riêng khung đó (cùng luật > 4%, 0,88..1,14)
            cach = dict(chinh_rieng_idle=True)
        elif ten in c.get('giu_co', []):   # phồng to dần có chủ ý: hệ số đo ở khung 1, không chỉnh riêng
            s, cach, _ = DQ.ti_le_hang(ten, fi, ks[:1], A0); rieng = [1.0] * so; cach = dict(cach, giu_co=True)
        else: s, cach, rieng = DQ.ti_le_hang(ten, fi, ks, A0)
        if ten in c.get('deu_co', []):   # Dơi Than báo đòn: AI vẽ bầy dơi nhỏ ở khung 1–2 rồi to dần (~1,3 lần) — đưa từng khung về cùng cỡ
            dtk = [float((a[..., 3] > 128).sum()) for a in ks]; md = float(np.median(dtk))   # theo diện tích (SIFT khớp kém giữa các khung bầy)
            rieng = [round(min(1.33, max(0.75, float(np.sqrt(v / md)))), 3) for v in dtk]; cach = dict(cach, deu_co=True)
        hang[ten] = []
        for a, m, k in zip(ks, ms, rieng):
            z = N * K / (s * k)
            y = m['cy'] * z - LECH_BAY * N if c.get('bay') else m['day'] * z
            if c.get('bay') and ten == 'die' and c.get('roi'):   # hàng chết của con bay: rơi xuống đất (1 = độ cao bay, 0 = đáy thân trên đường đất)
                w = c['roi'][len(hang[ten])]; y = w * y + (1 - w) * m['day'] * z
            hang[ten].append((DQ.thu(a, z), m['cx'] * z, y))
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
    lech = mau_deu(sh, 48, chi_dem=True)   # như phiên quai-moi-6-con: còn > 4000 điểm ảnh lệch màu xa với 32 màu thì 48 màu (32 + 16 riêng)
    DQ.SO_MAU = 48 if lech > 4000 else 32
    if DQ.SO_MAU == 48: mau_deu(sh, 48)
    png, nm = DQ.luu_png(sh)
    W_game = W0 * K
    move_giay = c['move_giay'] if c.get('move_giay') else round(min(1.0, max(0.35, BUOC_THAN * W_game / c['toc'])), 2)
    dong = {
        'idle': {'hang': 0, 'so': 6, 'giay': c.get('idle_giay', IDLE_GIAY), 'lap': True},
        'move': {'hang': 1, 'so': 6, 'giay': move_giay, 'lap': True},
        'tele': {'hang': 2, 'so': 6, 'giay': c['tele']},
        'atk': {'hang': 3, 'so': 6, 'giay': c['atk']},
        'hit': {'hang': 4, 'so': 4, 'giay': c.get('hit', HIT_GIAY)},
        'die': {'hang': 5, 'so': 6, 'giay': c['die'], 'mo': round(c['mo_tu'] / 6 if c.get('mo_tu') else DIE_TOI / c['die'], 2)},
    }
    if c.get('khung'): dong['atk']['khung'] = c['khung']
    if c.get('lap_tu') is not None: dong['atk']['lap_tu'] = c['lap_tu']
    if c.get('lap_den') is not None: dong['atk']['lap_den'] = c['lap_den']
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
    r = {'cao_dung_cu': H_cu, 'rong_dung_cu': W_cu, 'cao_dung_moi': round(H0 * K, 1), 'rong_dung_moi': round(W_game, 1), 'K': round(K, 5),
         'o_cu': [cu_d['khung_rong'], cu_d['khung_cao']], 'o': [FW, FH], 'goc': [GX, GY], 'tam': list(sh.shape[1::-1]), 'mau': nm, 'lech_mau': lech,
         'byte_png': len(png), 'byte_tep': os.path.getsize(ra), 'byte_tep_cu': byte_cu, 'lech_bay': round(LECH_BAY, 1),
         'hang': info, 'dong_tac': dong, 'can_tam': ct}
    print(MA_, json.dumps({k: v for k, v in r.items() if k not in ('hang', 'dong_tac', 'can_tam')}, ensure_ascii=False))
    for k, v in info.items(): print('   ', k, v)
    print('    can_tam', ct)
    return r


if __name__ == '__main__':
    p_so = os.path.join(RA, 'so-do.json')
    so_do = json.load(open(p_so, encoding='utf-8')) if os.path.exists(p_so) else {}
    for MA_ in MA10:
        if CHI and MA_ not in CHI: continue
        so_do[MA_] = dung(MA_)
    json.dump(so_do, open(p_so, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
