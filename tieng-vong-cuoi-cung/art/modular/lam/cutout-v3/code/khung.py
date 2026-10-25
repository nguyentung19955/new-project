"""Khung xương (rig) Lam v3 – NGUỒN DUY NHẤT cho cha–con, điểm gắn, góc nghỉ, slot vẽ.

xuat.py ghi các giá trị này (cộng P/D/kích thước đo từ mảnh) ra lam-v3.json;
rap3.py chỉ đọc JSON. Không chỗ nào khác được hardcode lại các số này.

Hai bước (theo PROMPT-CLAUDE mục 1–2):
1) rig_tu_v2(): chuyển rap2.lam() của v2 sang offset cục bộ + góc tương đối, KHÔNG đổi vị trí
   nghỉ (kiểm chứng bằng kiem_chuyen_doi.py: sai khác 0 px so với rest2 của v2).
2) SUA_NGHI: các chỉnh dáng nghỉ theo ảnh 02 (đo bằng do_mau.py), ghi số trước/sau + lý do.
"""
import math

# ---------- số liệu v2 (chép nguyên từ review-v2/lam-cutout/code/rap2.py để đối chiếu) ----------
V2 = dict(
    than_pos=(236, 335), than_P=(57, 56),
    at={'capelet-sau': (165, 285), 'bao-dao': (160, 352), 'vat-sau': (175, 372), 'vat-truoc': (250, 372),
        'dai': (236, 338), 'capelet-truoc': (250, 282), 'chuong': (245, 290)},
    head_pos=(205, 245), head_P=(205, 250),
    eye1=dict(tl=(244 - 11, 198 - 21), k=0.92), eye2=dict(tl=(283 - 12, 193 - 23), k=1.0),
    vai=dict(gan=(85, 36), xa=(29, 36)), hong=dict(gan=(81, 65), xa=(32, 65)),
    dao=dict(gan=(38, 34), rot=-12),
    REST=dict(armA=[85, 30, 10], armB=[120, 150, 180], legA=[80, 85, 90], legB=[100, 95, 90]),
    order=['capelet-sau', 'tay-tren-xa', 'cang-tay-xa', 'gang-xa', 'dui-xa', 'cang-chan-xa', 'ung-xa',
           'dui-gan', 'cang-chan-gan', 'ung-gan', 'than', 'bao-dao', 'vat-sau', 'vat-truoc', 'dai', 'mu',
           'chop-mu', 'mat-1', 'mat-2', 'tay-tren-gan', 'cang-tay-gan', 'dao', 'gang-gan',
           'capelet-truoc', 'chuong'],
)

CHAIN = {'tay-gan': ['tay-tren-gan', 'cang-tay-gan', 'gang-gan'],
         'tay-xa': ['tay-tren-xa', 'cang-tay-xa', 'gang-xa'],
         'chan-gan': ['dui-gan', 'cang-chan-gan', 'ung-gan'],
         'chan-xa': ['dui-xa', 'cang-chan-xa', 'ung-xa']}
CHAIN_V2 = {'tay-gan': 'armA', 'tay-xa': 'armB', 'chan-gan': 'legA', 'chan-xa': 'legB'}


def rig_tu_v2(dims):
    """dims[ten] = dict(w, h, P, huong, chop_goc=(x0,y0) cho chop-mu).
    Trả về dict ten → {anh, cha, gan, P, goc_nghi, ti_le, slot} tái tạo đúng rest v2."""
    tx = V2['than_pos'][0] - V2['than_P'][0]; ty = V2['than_pos'][1] - V2['than_P'][1]
    R = {}
    R['than'] = dict(anh='than', cha=None, gan=None, P=list(V2['than_P']), goc_nghi=0.0)
    for n, (wx, wy) in V2['at'].items():
        w, h = dims[n]['w'], dims[n]['h']
        P = [w / 2.0, h / 2.0]
        R[n] = dict(anh=n, cha='than', gan=[wx - tx, wy - ty], P=P, goc_nghi=0.0)
    R['mu'] = dict(anh='mu', cha='than', gan=[V2['head_pos'][0] - tx, V2['head_pos'][1] - ty],
                   P=list(V2['head_P']), goc_nghi=0.0)
    g = dims['chop-mu']['chop_goc']; Pt = dims['chop-mu']['P']
    R['chop-mu'] = dict(anh='chop-mu', cha='mu', gan=[g[0] + Pt[0], g[1] + Pt[1]], P=list(Pt), goc_nghi=0.0)
    Pe = dims['mat']['P']
    for i, e in ((1, V2['eye1']), (2, V2['eye2'])):
        R['mat-%d' % i] = dict(anh='mat', cha='mu', gan=[e['tl'][0] + e['k'] * Pe[0], e['tl'][1] + e['k'] * Pe[1]],
                               P=list(Pe), goc_nghi=0.0, ti_le=e['k'])
    for ch, names in CHAIN.items():
        side = 'gan' if ch.endswith('gan') else 'xa'
        root = V2['vai'][side] if ch.startswith('tay') else V2['hong'][side]
        a = V2['REST'][CHAIN_V2[ch]]
        prev = 0.0
        for i, n in enumerate(names):
            if i == 0:
                R[n] = dict(anh=n, cha='than', gan=list(root), goc_nghi=float(a[0]))
            else:
                R[n] = dict(anh=n, cha=names[i - 1], gan=None, goc_nghi=float(a[i] - a[i - 1]))  # gan = D của cha
            R[n]['P'] = list(dims[n]['P'])
    R['dao'] = dict(anh='dao', cha='gang-gan', gan=list(V2['dao']['gan']), P=list(dims['dao']['P']),
                    goc_nghi=float(V2['dao']['rot']))
    for i, n in enumerate(V2['order']):
        R[n]['slot'] = 10 * (i + 1)
    return R


# ---------- v3: thứ tự lớp (xa → gần) ----------
# Lý do từng thay đổi so với v2 ghi trong CHANGELOG (đối chiếu crop ảnh 02 trong kiem-thu/01-*).
ORDER_V3 = ['tay-tren-xa', 'cang-tay-xa', 'gang-xa',
            'dui-xa', 'cang-chan-xa', 'ung-xa',
            'vat-truoc',                       # ảnh 02: mặt trước áo là màu xanh thân → vạt trước nằm sau thân
            'dui-gan', 'cang-chan-gan', 'ung-gan',
            'than', 'vat-sau', 'dai', 'bao-dao',   # ảnh 02: bao dao đè lên vạt và đầu đai
            'capelet-truoc',                   # ảnh 02: không thấy vạt capelet trước ở ngực → nằm dưới mũ/chuông
            'tay-tren-gan', 'cang-tay-gan', 'dao', 'gang-gan',
            'capelet-sau',                     # ảnh 02: capelet đè vai/ tay xa và đỉnh bao dao
            'chop-mu', 'mu', 'mat-1', 'mat-2',  # chóp nằm DƯỚI mũ chính (vùng bù ẩn dưới mũ)
            'chuong']

# ---------- v3: điểm gắn chi trên thân (px trong ảnh than) ----------
# Chỉ đổi khi có bằng chứng (kiem-thu/01-do-mau.json, mục "chon_diem_gan"):
#  - vai xa: v2 (29,36) → v3 (10,36). Lý do: với xương 45,8+44,9=90,7, khoảng cách vai v2 → cổ tay găng xa
#    (dò trên ảnh 02) = 109,8 px > 90,7 → không với tới; điểm vùng tay xa 0,568 → 0,627. Giữ y=36 để hai vai
#    cùng độ cao (đối xứng cho chu kỳ chạy). Vai gần giữ (85,36): phương án tốt nhất chỉ hơn 0,02.
#  - hông: giữ v2 (81,65)/(32,65): phương án tốt nhất đối xứng chỉ hơn 0,012 → chưa đủ căn cứ dịch.
ATTACH_V3 = {'tay-tren-gan': [85, 36], 'tay-tren-xa': [10, 36], 'dui-gan': [81, 65], 'dui-xa': [32, 65]}
# hướng gập IK (+1/−1 theo quy ước góc): khuỷu gần xuống dưới, gối gập ra trước
IK_SIDES = {'tay-gan': ('gang-gan', 1), 'tay-xa': ('gang-xa', -1),
            'chan-gan': ('ung-gan', -1), 'chan-xa': ('ung-xa', -1)}
# mảnh không thấy trên ảnh 02: dịch (dx, dy) so với vị trí cục bộ v2 + góc, để bị che hoàn toàn lúc nghỉ
# (kết quả an_khi_nghi() trong do_mau.py: diện tích còn thấy = 0 px; vị trí v2 còn thấy 949 / 266 px)
AN_KHI_NGHI = {'capelet-truoc': (-15, -25, 0.0), 'vat-truoc': (0, -25, 0.0)}

# ---------- chuyển động phụ (pose delta của nguồn × hệ số, cộng vào mảnh) ----------
PHU = []
# ---------- slot vẽ đổi theo tư thế ----------
SLOT_THEO_TU_THE = []
