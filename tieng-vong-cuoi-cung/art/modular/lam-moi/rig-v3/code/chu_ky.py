"""Bước 2–3 (v3; cấu trúc giữ nguyên v2): rig + CHU KỲ CHẠY do người đặt mốc (không IK) → ../lam-moi-v3.json.
v3 chỉ đổi bảng nhún thân + chuyển động phụ (BANG), bật tối 10 % (chung.LAM_TOI).

Thời gian: 1 chu kỳ = 2 bước = CHU_KY_S giây (mốc 0,64 s), φ ∈ [0, 1). Ủng gần ở pha φ, ủng xa ở φ + 0,5:
cùng MỘT bộ mốc, nửa sau chu kỳ CHỈ là đổi pha (không tráo ảnh/nút tay dao ↔ tay trống, không tráo gần/xa).
Tay: góc vung = hàm cos của φ (tay dao ±14°, tay sau ngược pha) → nửa sau tự đổi chiều.
Thân/mũ/chóp/chuông: chu kỳ 0,5 (mỗi bước nhún một lần).

Ủng chịu lực (pha 0 … DUTY): khe hở = 0 (điểm thấp nhất đúng mặt đất). Đế ủng cong nên khi nghiêng ủng LĂN
(điểm chạm đi từ gót ra mũi); vị trí ngang được TÍCH PHÂN sao cho điểm vật chất đang chạm đất đi đúng vận tốc
đất trôi −V_DAT (không trượt, không khựng). Pha bay: mốc đặt tay, nội suy Hermite không vượt (noi_suy.py); hai
mốc biên (chạm/rời đất) lấy đúng vị trí + vận tốc của pha chịu lực → liên tục vị trí và vận tốc (C¹).
Khe hở tiếp tuyến 0 lúc chạm/rời đất → vào/ra đất êm."""
import os
import json
import numpy as np
from chung import MANH, JSON_PATH, CAO_LOGIC, HE_SO_THIET_BI, LAM_TOI, save_json
from rig import build_rig, dat_goc_xuong_dat, dat_ung, tiep_dat, R, render, world_points
from noi_suy import Kenh

CHU_KY_S = 0.64           # giây / chu kỳ (2 bước)
SO_KHUNG = 32             # khung / chu kỳ → 20 ms / khung (GIF)
TEN_TU_THE = ['cham-dat', 'chiu-luc', 'dap', 'bay']
NHAN = {'cham-dat': 'Chạm đất', 'chiu-luc': 'Chịu lực', 'dap': 'Đạp', 'bay': 'Bay', 'nghi': 'Nghỉ'}
PHA_TU_THE = {'cham-dat': 0.0, 'chiu-luc': 6 / 32, 'dap': 10 / 32, 'bay': 14 / 32}   # pha của ủng gần

# ---------------------------------------------------------------- ỦNG (pha của chính ủng đó)
SAI = 150.0               # sải: giữa đế chạm đất ở +150, rời đất ở −150 (so với gốc) – giữ như v1
DUTY = 0.375              # phần chu kỳ ủng chạm đất (12/32 khung)
V_DAT = 2 * SAI / DUTY    # = 800 px ảnh ngang / chu kỳ: tốc độ đất trôi
LECH_SAU = {'ung-gan': +15.0, 'ung-xa': -15.0}
# x giữa đế (px, + = trước). Pha chịu lực: tính bằng tích phân lăn (lan_chiu_luc), neo x = 0 ở giữa pha (6/32).
# Pha bay (pha, x, tiếp tuyến|None): sau khi rời đất ủng còn lùi tiếp ~20 px rồi mới đưa lên trước (đúng quán
# tính), trước khi chạm đất vươn quá ~20 px rồi lùi về chạm đất với đúng vận tốc đất.
PHA_NEO_X = 6 / 32
UNG_X_BAY = [(0.44, -170, 0.0), (0.70, +40, None), (0.92, +172, 0.0)]
# khe hở điểm thấp nhất ↔ đất (px, + = lên). Chịu lực: 0. Chạm/rời đất: tiếp tuyến 0 (vào/ra đất êm).
UNG_NHAC = [(0.0, 0, 0.0), (DUTY, 0, 0.0), (0.4375, 55, None), (0.5, 80, None), (0.625, 95, None),
            (0.75, 80, None), (0.875, 45, None), (0.9375, 24, None)]
# góc (độ): − = mũi hếch (xoay quanh gót), + = gót nhấc (xoay quanh mũi). Giữa pha chịu lực: đế phẳng.
UNG_GOC = [(0.0, -14), (0.09, 0, 0.0), (0.22, 0, 0.0), (0.3125, +18), (DUTY, +34), (0.4375, +42), (0.5, +34),
           (0.625, +8), (0.75, -12), (0.875, -20), (0.9375, -18)]

# ---------------------------------------------------------------- THÂN / MŨ / CHÓP / CHUÔNG (chu kỳ 0,5; pha của bước)
# mốc ở 0 (chạm đất), 6/32 (chịu lực – thấp nhất), 10/32 (đạp), 14/32 (giữa pha bay – cao nhất)
P4 = [0.0, 6 / 32, 10 / 32, 14 / 32]
# Bảng nhún thân + chuyển động phụ (đầu/mũ, chóp, chuông). v3 chỉ đổi các bảng này (xem GHI-CHU mục 1):
#   V2  = rig-v2 đã duyệt (nhún tổng cao–thấp 60 px ảnh ngang ≈ 6,3 px logic)
#   THU = bước 1 theo yêu cầu: THAN_DY giảm một nửa, GIỮ NGUYÊN chuyển động phụ → đo đầu có nảy quá mạnh không
#   V3  = bản chốt (THAN_DY như THU; chuyển động phụ chỉnh theo số đo, xem phan_tich.py → so-lieu.json → nay_dau)
BANG = {
    'V2': {'THAN_DY': [-16, +30, -4, -30], 'MU_DY': [-4, -10, +2, +8], 'MU_GOC': [-2.0, +2.5, +0.5, -2.5],
           'CHOP': [+2, +7, +2, -6], 'CHUONG': [-3, +6, +2, -5]},
    'THU': {'THAN_DY': [-8, +15, -2, -15], 'MU_DY': [-4, -10, +2, +8], 'MU_GOC': [-2.0, +2.5, +0.5, -2.5],
            'CHOP': [+2, +7, +2, -6], 'CHUONG': [-3, +6, +2, -5]},
    'V3': {'THAN_DY': [-8, +15, -2, -15], 'MU_DY': [-2, -5, +1, +4], 'MU_GOC': [-1.0, +1.25, +0.25, -1.25],
           'CHOP': [+1, +3.5, +1, -3], 'CHUONG': [-1.5, +3, +1, -2.5]},
}
BANG_CHON = 'V3'
THAN_DY = BANG[BANG_CHON]['THAN_DY']   # + = xuống. v3: thấp nhất +15, cao nhất −15 → tổng 30 px ảnh ngang ≈ 3,1 px logic
THAN_GOC = [5, 7, 8, 6]             # nghiêng (+ = chúi trước) – giữ v2
MU_DY = BANG[BANG_CHON]['MU_DY']     # mũ trễ theo thân
MU_GOC = BANG[BANG_CHON]['MU_GOC']
CHOP = BANG[BANG_CHON]['CHOP']       # chóp mũ đung đưa trễ
CHUONG = BANG[BANG_CHON]['CHUONG']

# ---------------------------------------------------------------- TAY
BIEN_DO_TAY_TRUOC = 14.0            # tay dao ±14° quanh vai ẩn (giữ như v1)
GIU_HUONG_DAO = 0.8                 # cổ tay xoay ngược 80 % góc vung → dao gần nằm ngang
# Tay sau: v1 xoay ±20° quanh vai ẩn → khi ra trước lẩn hẳn sau thân. v2: ĐỔI ĐƯỜNG ĐI – nắm tay chạy trên
# một vòng elip dẹt ở PHÍA SAU lưng (ra trước tối đa tới ngay mép sau thân, về sau xa hơn và cao hơn), nên
# luôn còn ló khỏi bóng thân. Vẫn đúng nhịp: ngược pha tay dao (tay dao về sau ↔ tay sau ra trước).
TAY_SAU_X = (-55.0, 95.0)           # dx = a + b·cos(2πφ): +40 (ra trước nhất, φ=0) … −150 (về sau nhất, φ=0,5)
TAY_SAU_Y = (-5.0, 25.0, 12.0)      # dy = a + b·cos + c·sin: ra trước thấp hơn, về sau cao hơn, đi vòng không trùng lối
TAY_SAU_GOC = (5.0, -11.0)          # góc găng = a + b·cos: ra trước −6°, về sau +16°


def _k4(vals, ten):
    return Kenh(list(zip(P4, vals)), 0.5, ten)


class KenhUngX:
    """x giữa đế của một ủng: pha chịu lực = mảng tích phân lăn không trượt; pha bay = Hermite qua mốc."""
    def __init__(self, ten, phis, xs):
        self.ten = ten
        self.phis, self.xs = phis, xs
        dphi = phis[1] - phis[0]
        m0 = (xs[1] - xs[0]) / dphi
        mD = (xs[-1] - xs[-2]) / dphi
        self.bay = Kenh([(0.0, xs[0], m0), (DUTY, xs[-1], mD)] + UNG_X_BAY, 1.0, 'ung_x_bay_' + ten)

    def __call__(self, phi):
        phi = np.asarray(phi, float) % 1.0
        return np.where(phi <= DUTY, np.interp(phi, self.phis, self.xs), self.bay(phi))

    def dao_ham(self, phi):
        phi = np.asarray(phi, float) % 1.0
        g = np.gradient(self.xs, self.phis)
        return np.where(phi <= DUTY, np.interp(phi, self.phis, g), self.bay.dao_ham(phi))

    def kiem_vuot(self):
        k = self.bay
        worst = 0.0
        for i in range(len(k.t)):
            if k.t[i] < DUTY - 1e-9:
                continue                                   # đoạn chịu lực dùng mảng lăn, không dùng Hermite
            j = (i + 1) % len(k.t)
            h = (k.t[j] - k.t[i]) % 1.0 or 1.0
            vs = k(k.t[i] + np.linspace(0, h, 400))
            lo, hi = min(k.v[i], k.v[j]), max(k.v[i], k.v[j])
            worst = max(worst, float(vs.max() - hi), float(lo - vs.min()))
        return max(worst - 1e-6, 0.0)

    def mo_ta(self):
        d = self.bay.mo_ta()
        d['chiu_luc'] = ('pha 0…%.4f: tích phân lăn không trượt (điểm chạm đi đúng −V_DAT), x=0 tại pha %.4f; '
                         'mốc 0 và %.4f lấy đúng vị trí/vận tốc cuối pha chịu lực' % (DUTY, PHA_NEO_X, DUTY))
        return d


KENH = {
    'ung_nhac': Kenh(UNG_NHAC, 1.0, 'ung_nhac'),
    'ung_goc': Kenh(UNG_GOC, 1.0, 'ung_goc'),
    'than_goc': _k4(THAN_GOC, 'than_goc'),
}


def dat_bang(ten):
    """Đổi bảng nhún/chuyển động phụ đang dùng ('V2', 'THU', 'V3') – để đo/so sánh trước ↔ sau trong cùng rig.
    Kênh ủng/tay không phụ thuộc bảng này."""
    b = BANG[ten]
    KENH['than_dy'] = _k4(b['THAN_DY'], 'than_dy')
    KENH['mu_dy'] = _k4(b['MU_DY'], 'mu_dy')
    KENH['mu_goc'] = _k4(b['MU_GOC'], 'mu_goc')
    KENH['chop'] = _k4(b['CHOP'], 'chop')
    KENH['chuong'] = _k4(b['CHUONG'], 'chuong')
    return ten


dat_bang(BANG_CHON)


def la_chiu_luc(pha):
    return (pha % 1.0) <= DUTY + 1e-9


def lan_chiu_luc(rig, ten, n=3000):
    """x pivot trong pha chịu lực sao cho điểm vật chất đang chạm đất có vận tốc ngang đúng −V_DAT.
    Bước nhỏ φ1→φ2: x2 = x1 − V·Δφ − Δ(R(θ)·c)_x, c = điểm chạm (giữa bước)."""
    k = KENH['ung_goc']
    phis = np.linspace(0.0, DUTY, n + 1)
    th = k(phis)
    xs = np.zeros_like(phis)
    i0 = int(round(PHA_NEO_X / DUTY * n))
    for i in range(i0 + 1, n + 1):
        _, c = tiep_dat(rig, ten, 0.5 * (th[i - 1] + th[i]))
        d = (R(th[i]) @ c)[0] - (R(th[i - 1]) @ c)[0]
        xs[i] = xs[i - 1] - V_DAT * (phis[i] - phis[i - 1]) - d
    for i in range(i0 - 1, -1, -1):
        _, c = tiep_dat(rig, ten, 0.5 * (th[i] + th[i + 1]))
        d = (R(th[i + 1]) @ c)[0] - (R(th[i]) @ c)[0]
        xs[i] = xs[i + 1] + V_DAT * (phis[i + 1] - phis[i]) + d
    return phis, xs


def chuan_bi_ung(rig):
    for ten in ('ung-gan', 'ung-xa'):
        KENH['ung_x_' + ten] = KenhUngX(ten, *lan_chiu_luc(rig, ten))


def ung_tai(rig, ten, pha):
    x = float(KENH['ung_x_' + ten](pha)) + LECH_SAU[ten]
    nhac = float(KENH['ung_nhac'](pha))
    goc = float(KENH['ung_goc'](pha))
    return dat_ung(rig, ten, x, nhac, goc), (x, nhac, goc)


def tay_sau(phi):
    c, s = np.cos(2 * np.pi * phi), np.sin(2 * np.pi * phi)
    dx = TAY_SAU_X[0] + TAY_SAU_X[1] * c
    dy = TAY_SAU_Y[0] + TAY_SAU_Y[1] * c + TAY_SAU_Y[2] * s
    g = TAY_SAU_GOC[0] + TAY_SAU_GOC[1] * c
    return dx, dy, g


def make_pose(rig, phi):
    """Tư thế tại pha φ (của ủng gần)."""
    pb = phi % 0.5
    tilt = float(KENH['than_goc'](pb))
    a_truoc = BIEN_DO_TAY_TRUOC * np.cos(2 * np.pi * phi)
    dx, dy, g = tay_sau(phi)
    pose = {
        'than': {'dich': [0.0, float(KENH['than_dy'](pb))], 'goc': tilt},
        'mu': {'dich': [0.0, float(KENH['mu_dy'](pb))], 'goc': float(KENH['mu_goc'](pb))},
        'chop-mu': {'goc': float(KENH['chop'](pb))},
        'chuong': {'goc': float(KENH['chuong'](pb))},
        'vai-truoc': {'goc': float(a_truoc)},
        'tay-truoc-dao': {'goc': float(-GIU_HUONG_DAO * a_truoc - tilt * 0.5)},
        'vai-sau': {'dich': [float(dx), float(dy)]},
        'tay-sau': {'goc': float(g)},
    }
    tt = {}
    for ten, pha in (('ung-gan', phi), ('ung-xa', phi + 0.5)):
        d, xyg = ung_tai(rig, ten, pha)
        pose[ten] = d
        tt[ten] = {'pha': round(pha % 1.0, 5), 'x': xyg[0], 'nhac': xyg[1], 'goc': xyg[2],
                   'chiu_luc': la_chiu_luc(pha)}
    return pose, tt


def lam_tron(pose, nd=3):
    out = {}
    for n, d in pose.items():
        out[n] = {k: ([round(float(x), nd) for x in v] if isinstance(v, list) else
                      (round(float(v), nd) if isinstance(v, float) else v)) for k, v in d.items()}
    return out


def main():
    ch = json.load(open(os.path.join(MANH, 'goc', 'chuan-hoa.json'), encoding='utf-8'))
    khop = json.load(open(os.path.join(MANH, 'goc', 'khop.json'), encoding='utf-8'))
    tach = json.load(open(os.path.join(MANH, 'goc', 'tach.json'), encoding='utf-8'))
    rig, nghi = build_rig(ch)
    # mặt đất = điểm thấp nhất thật của dáng nghỉ (khớp ảnh ngang); gốc đặt đúng trên mặt đất
    im = render(rig, nghi, (0, 0, 1400, 1400), 1.0)
    ys = np.nonzero((np.array(im)[..., 3] > 128).any(1))[0]
    dat_goc_xuong_dat(rig, float(ys.max() + 1))
    chuan_bi_ung(rig)

    poses = {}
    for n in TEN_TU_THE:
        p, tt = make_pose(rig, PHA_TU_THE[n])
        poses[n] = lam_tron(p)
        poses[n]['_ung'] = tt
    khung = []
    for k in range(SO_KHUNG):
        phi = k / SO_KHUNG
        p, tt = make_pose(rig, phi)
        q = lam_tron(p)
        q['_pha'] = phi
        q['_thoi_gian_s'] = round(phi * CHU_KY_S, 4)
        q['_ung'] = tt
        khung.append(q)
    vuot = {k: round(v.kiem_vuot(), 6) for k, v in KENH.items()}

    manh = {}
    for n, v in ch.items():
        if n.startswith('_'):
            continue
        manh[n] = {'anh': f'manh/{n}.png', 'co': v['co_moi'], 'tu_manh_bang': v['tu_manh_goc']}
        for k in ('he_so', 'he_so_ngang', 'he_so_doc', 'co_goc', 'he_so_do_tren_anh_ngang_v1', 'sua_tay',
                  'la_lop_gay'):
            if k in v:
                manh[n][k] = v[k]
        kk = khop.get(v['tu_manh_goc'])
        if kk:
            manh[n]['khop_anh_ngang'] = {k: kk[k] for k in kk if k not in ('ghi_chu',)}
    manh['mat-xa']['ghi_chu'] = 'bản hẹp/tối của mắt gần, ẩn ở nhìn ngang'
    doc = {
        'ten': 'Lam – rig tay chân rời v3',
        'phien_ban': '3.0.0',
        'quy_uoc': {
            'don_vi': 'px của 2-nhin-ngang.png (1254×1254)',
            'truc': 'gốc trái-trên, x sang phải, y xuống',
            'goc': 'độ; dương = thuận chiều kim đồng hồ trên màn hình; Lam quay mặt sang phải (+x)',
            'bien_doi': 'W = W_cha · T(diem_gan + dich) · R(goc_nghi + goc); ảnh mảnh vẽ với pivot trùng gốc nút',
            'pivot': 'toạ độ px trong ảnh mảnh (manh/<ten>.png) đã chuẩn hoá cỡ',
            'thu_tu_ve': 'phần tử đầu vẽ trước (nằm sau cùng)',
            'goc_co_dinh': 'gốc (root) KHÔNG di chuyển; nhún/bay = dịch thân. Đất trôi sang trái với van_toc_dat',
            'cao_logic_px': CAO_LOGIC, 'he_so_thiet_bi': HE_SO_THIET_BI,
            'khung': 'chu_ky.khung[k] đã tính sẵn mọi dich/goc (kể cả xoay ủng quanh gót/mũi và bắt đất) → game '
                     'chỉ cần áp công thức bien_doi; muốn nội suy mượt hơn 32 khung thì tính lại từ chu_ky.kenh',
        },
        'manh': manh,
        'rig': rig,
        'lam_toi': dict(LAM_TOI, ghi_chu='BẬT MẶC ĐỊNH (v3): nhân màu RGB ×(1 − tỉ lệ) = ×0,90, alpha giữ nguyên. Đã '
                                         'nướng sẵn vào sprite/lam-chay-2x.png. Vẽ rig trực tiếp trên Canvas: '
                                         'ctx.filter = "brightness(0.9)" cho 2 mảnh này (hoặc ảnh mảnh đã tối sẵn)'),
        'bang_nhun': {'dang_dung': BANG_CHON, 'cac_bang': BANG,
                      'ghi_chu': 'V2 = rig-v2; THU = THAN_DY giảm nửa, giữ chuyển động phụ; V3 = bản chốt'},
        'tu_the_nghi': nghi,
        'tu_the': poses,
        'pha_tu_the': PHA_TU_THE,
        'chu_ky': {
            'thoi_gian_s': CHU_KY_S, 'so_khung': SO_KHUNG, 'ms_moi_khung': round(1000 * CHU_KY_S / SO_KHUNG, 2),
            'pha_ung_xa': '= pha ủng gần + 0,5 (cùng bộ mốc)',
            'nua_sau': 'chỉ đổi pha: ủng gần dùng pha φ, ủng xa φ+0,5; tay dao góc 14·cos(2πφ), tay sau ngược pha. '
                       'KHÔNG tráo ảnh/nút tay dao ↔ tay trống, KHÔNG tráo vai trò gần/xa.',
            'ty_le_cham_dat': DUTY, 'sai_px': SAI, 'lech_sau_ung': LECH_SAU,
            'van_toc_dat_px_moi_chu_ky': V_DAT,
            'van_toc_dat_px_moi_s': round(V_DAT / CHU_KY_S, 2),
            'noi_suy': 'Hermite bậc 3 tuần hoàn; tiếp tuyến tự động Fritsch–Butland (không vượt), vài tiếp tuyến '
                       'đặt tay (vận tốc ngang = −van_toc_dat lúc chạm/rời đất; vận tốc dọc = 0)',
            'kenh': {k: v.mo_ta() for k, v in KENH.items()},
            'tay_truoc': {'bien_do': BIEN_DO_TAY_TRUOC, 'cong_thuc': 'vai-truoc.goc = 14·cos(2πφ); '
                          'tay-truoc-dao.goc = −0,8·vai − 0,5·nghiêng thân'},
            'tay_sau': {'x': TAY_SAU_X, 'y': TAY_SAU_Y, 'goc': TAY_SAU_GOC,
                        'cong_thuc': 'vai-sau.dich = (a+b·cos, a+b·cos+c·sin)(2πφ); tay-sau.goc = a+b·cos'},
            'ung': 'x (pivot giữa đế), nhac (khe hở điểm thấp nhất ↔ đất), goc – xem rig.dat_ung. Chịu lực: '
                   'nhac = 0, x tích phân lăn không trượt',
            'do_vuot_kenh_px': vuot,
            'khung': khung,
        },
        'nguon': {'bang_manh': 'nguon/3-bang-manh.png', 'nhin_ngang': 'nguon/2-nhin-ngang.png',
                  'tach': tach['bang_manh']},
    }
    save_json(doc, JSON_PATH)
    print('vượt biên các kênh:', vuot)
    for n in TEN_TU_THE:
        wp = world_points(rig, poses[n])
        print(n, 'thân', wp['than'], {k: (round(v['x']), round(v['nhac']), round(v['goc'])) for k, v in poses[n]['_ung'].items()})


if __name__ == '__main__':
    main()
