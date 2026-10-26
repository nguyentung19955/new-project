"""Bốn tư thế chạy nguyên người v5 (để chủ dự án DUYỆT):  python3 tu_the.py
→ ghi khoá "tu_the" vào ../lam-v5.json; ảnh duyệt do duyet.py vẽ.

Dáng do NGƯỜI THIẾT KẾ đặt bằng góc (không dùng IK quyết định dáng):
- Mỗi chi ghi bằng GÓC THẾ GIỚI (độ, 0° = sang phải, 90° = thẳng xuống, dương = chiều kim đồng hồ):
    chân: (đùi, gập gối, ủng)   – cẳng chân = đùi + gập gối (gối gập ra sau)
    tay : (tay trên, gập khuỷu, cổ tay) – cẳng tay = tay trên − gập khuỷu; găng = cẳng tay + cổ tay
- Hai chân dùng CÙNG MỘT bảng bước chạy 8 pha (BUOC_CHAN), chân xa lệch nửa chu kỳ (4 pha).
  KHÔNG có DX_SHIFT / LIFT_SCALE riêng cho chân xa (khác v4). Ảnh chứng minh: tu-the/04-phoi-canh-chan-xa.png.
- Tay cầm dao (tay gần) và tay không (tay xa) mỗi tay một bảng 8 pha, lệch nửa chu kỳ, đối pha với chân cùng phía.
- Chiều cao thân: tư thế có chân chạm đất thì hạ/nâng root sao cho điểm thấp nhất của đế ủng chân trụ chạm
  đúng mặt đất (y = 468) – chỉ dịch dọc, không đổi góc nào. Tư thế bay: đế thấp nhất cách đất BAY_CAO px.
- Góc gập khuỷu/gối là bội 15° để dùng đúng attachment đã dựng (attachment.py).
"""
import os, json, math
import numpy as np
import rap5

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
DAT = 468.0
ROOT_X = 220.0
BAY_CAO = 12.0

# ---- bảng bước chạy CHUNG cho hai chân: pha 0 = chân đó chạm đất ----
# (đùi, gập gối, ủng)  – góc thế giới
BUOC_CHAN = [
    (62, 15, 80),     # 0 chạm đất: chân vươn trước, gối gần thẳng, gót chạm (mũi hơi hếch)
    (66, 75, 90),     # 1 chịu lực: gối nhún, cổ chân dưới hông, đế phẳng
    (96, 30, 110),    # 2 đạp: chân duỗi ra sau, đẩy bằng mũi ủng
    (118, 60, 126),   # 3 bay: cẳng chân hất ra sau-lên
    (90, 120, 148),   # 4 (chân kia chạm đất): gót kéo lên sau mông
    (34, 135, 92),    # 5 (chân kia chịu lực): chân lướt qua dưới thân, gối dẫn ra trước
    (28, 90, 98),     # 6 (chân kia đạp): nâng gối cao nhất
    (36, 30, 82),     # 7 (bay): cẳng chân duỗi ra trước, chuẩn bị chạm đất
]
# ---- tay: pha 0 = tay đó ở sau nhất (trùng lúc chân CÙNG phía chạm đất) ----
# (tay trên, gập khuỷu, cổ tay)
TAY_DAO = [            # tay gần cầm dao: biên độ vừa, nắm tay luôn ở trước ngực, lưỡi dao chỉ ra trước-lên
    (100, 105, -15), (92, 105, -14), (76, 90, -10), (56, 75, -6),
    (40, 60, -4), (50, 60, -6), (70, 90, -10), (90, 105, -14)]
TAY_KHONG = [          # tay xa (không cầm gì): vung rộng hơn, phần lớn khuất sau thân
    (140, 45, -5), (130, 45, -5), (106, 60, -8), (76, 75, -10),
    (56, 90, -10), (66, 75, -10), (96, 60, -8), (126, 45, -6)]
# ---- thân theo tư thế: (nghiêng thân, chóp mũ) ----
THAN = {'cham-dat': (6.0, -2.0), 'chiu-luc': (8.0, 4.0), 'dap': (10.0, 1.0), 'bay': (8.0, -3.0)}
TU_THE = ['cham-dat', 'chiu-luc', 'dap', 'bay']
TEN = {'cham-dat': 'chạm đất', 'chiu-luc': 'chịu lực', 'dap': 'đạp', 'bay': 'bay'}
CHAN_TRU = {'cham-dat': 'chan-gan', 'chiu-luc': 'chan-gan', 'dap': 'chan-gan', 'bay': None}

CHAIN = {'tay-gan': ['tay-tren-gan', 'cang-tay-gan', 'gang-gan'], 'tay-xa': ['tay-tren-xa', 'cang-tay-xa', 'gang-xa'],
         'chan-gan': ['dui-gan', 'cang-chan-gan', 'ung-gan'], 'chan-xa': ['dui-xa', 'cang-chan-xa', 'ung-xa']}


def thong_so(ten):
    """Thông số thiết kế của một tư thế (pha k = vị trí trong TU_THE)."""
    k = TU_THE.index(ten)
    lean, chop = THAN[ten]
    return dict(ten=ten, lean=lean, chop=chop,
                chan={'chan-gan': BUOC_CHAN[k], 'chan-xa': BUOC_CHAN[(k + 4) % 8]},
                tay=goc_tay(ten), chan_tru=CHAN_TRU[ten])


def goc_tay(ten):
    """Chân gần chạm đất (pha 0) ↔ tay gần ở sau nhất (pha 0 bảng tay), tay xa ở trước nhất (pha 4)."""
    k = TU_THE.index(ten)
    return {'tay-gan': TAY_DAO[k], 'tay-xa': TAY_KHONG[(k + 4) % 8]}


def pose_tu(rig, ts, dy=0.0):
    """Thông số → pose của rig (delta góc cục bộ) + attachment."""
    inst = rig.inst
    g = {'than': ts['lean'], 'chop-mu': ts['chop']}
    att = {}
    than_w = inst['than']['goc_nghi'] + ts['lean']
    for chi, (a, gap, c) in ts['chan'].items():
        w = [a, a + gap, c]; prev = than_w
        for n, wi in zip(CHAIN[chi], w):
            g[n] = (wi - prev) - inst[n]['goc_nghi']; prev = wi
        att[chi] = gap
    for chi, (a, gap, c) in ts['tay'].items():
        w = [a, a - gap, a - gap + c]; prev = than_w
        for n, wi in zip(CHAIN[chi], w):
            g[n] = (wi - prev) - inst[n]['goc_nghi']; prev = wi
        att[chi] = gap
    return {'goc': g, 'goc_toa_do': [ROOT_X, rig.meta['goc']['vi_tri_nghi'][1] + dy], 'attachment': att}


def de_thap_nhat(rig, pose, chi):
    """y thấp nhất (lớn nhất) của đế ủng chi (gót / giữa / mũi) trong thế giới."""
    M, _ = rig.matrices(pose)
    b = CHAIN[chi][2]
    pts = list(rig.inst[b]['diem_de'].values())
    return max(rap5.app(M[b], q)[1] for q in pts)


def dung(rig, ten):
    ts = thong_so(ten)
    p = pose_tu(rig, ts, 0.0)
    if ts['chan_tru']:
        dy = DAT - de_thap_nhat(rig, p, ts['chan_tru'])
    else:
        dy = DAT - BAY_CAO - max(de_thap_nhat(rig, p, c) for c in ('chan-gan', 'chan-xa'))
    p = pose_tu(rig, ts, dy)
    ts['root_dy'] = round(float(dy), 2)
    return p, ts


def slot_goc(rig):
    """Slot gốc (tắt luật đổi slot chân gần của v4 – chân gần giờ là một attachment liền)."""
    return lambda ang: {n: rig.inst[n]['slot'] for n in rig.inst}


def tat_ca(rig=None):
    rig = rig or rap5.load_default()
    return rig, {t: dung(rig, t) for t in TU_THE}


def main():
    rig, P = tat_ca()
    meta = json.load(open(os.path.join(ROOT, 'lam-v5.json'), encoding='utf-8'))
    blk = dict(ghi_chu='4 tư thế chạy để duyệt (v5). goc = delta cục bộ cộng vào goc_nghi (như mọi pose); '
                       'attachment = góc gập dùng cho từng chi; thiet_ke = góc thế giới người thiết kế đặt.',
               quy_uoc_thiet_ke='chân (đùi, gập gối, ủng); tay (tay trên, gập khuỷu, cổ tay); góc thế giới; '
                                'cẳng chân = đùi + gập; cẳng tay = tay trên − gập; găng = cẳng tay + cổ tay',
               bang_buoc_chan=BUOC_CHAN, bang_tay_dao=TAY_DAO, bang_tay_khong=TAY_KHONG,
               lech_pha_chan_xa=4, dx_shift_chan_xa=0, lift_scale_chan_xa=1.0, ds={})
    for t, (p, ts) in P.items():
        blk['ds'][t] = dict(ten=TEN[t], goc={k: round(v, 3) for k, v in p['goc'].items()},
                            goc_toa_do=[round(x, 2) for x in p['goc_toa_do']], attachment=p['attachment'],
                            thiet_ke=dict(nghieng_than=ts['lean'], chop_mu=ts['chop'], chan=ts['chan'], tay=ts['tay'],
                                          chan_tru=ts['chan_tru'], root_dy=ts['root_dy']))
    meta['tu_the'] = blk
    meta['slot_theo_tu_the_ghi_chu_v5'] = ('Khi chân gần dùng attachment, KHÔNG áp luật đổi slot cẳng/ủng gần (v4) – '
                                           'ủng giữ slot gốc ngay trên chân.')
    json.dump(meta, open(os.path.join(ROOT, 'lam-v5.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for t, (p, ts) in P.items():
        print(t, 'root_dy', ts['root_dy'], 'chan', ts['chan'], 'tay', ts['tay'])


if __name__ == '__main__':
    main()
