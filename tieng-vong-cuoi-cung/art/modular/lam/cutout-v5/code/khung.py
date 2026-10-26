"""Khung xương (rig) Lam v4 – NGUỒN DUY NHẤT cho cha–con, điểm gắn, góc nghỉ, slot vẽ.

xuat.py ghi các giá trị này (cộng P/D/kích thước đo từ mảnh) ra lam-v4.json;
rap4.py chỉ đọc JSON. Không chỗ nào khác được hardcode lại các số này.

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
        # v2 đặt TÂM ảnh tại (wx, wy); nếu mảnh có P riêng (chuông treo ở P) thì gắn tại P, cùng vị trí thế giới
        P = list(dims[n]['P']) if dims[n]['P'] is not None else [w / 2.0, h / 2.0]
        R[n] = dict(anh=n, cha='than', gan=[wx - w / 2.0 + P[0] - tx, wy - h / 2.0 + P[1] - ty], P=P, goc_nghi=0.0)
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
# v4 (REVIEW-V3 P0-1, chủ dự án chốt): NÂNG pivot hông gần 65 → 45 (hệ y xuống: y nhỏ hơn = cao hơn) trên ảnh than.
# Hông xa GIỮ (32,65): đưa cả hai lên 45 thì chân xa phải với ~100 px > 85 px tổng xương.
# Đây là điểm gắn 2D phục vụ phối cảnh hình vẽ, không buộc hai hông cùng cao độ. Góc nghỉ giải lại bằng IK khi xuất.
ATTACH_V4 = dict(ATTACH_V3, **{'dui-gan': [81, 45]})
# hướng gập IK (+1/−1 theo quy ước góc): khuỷu gần xuống dưới, gối gập ra trước
IK_SIDES = {'tay-gan': ('gang-gan', 1), 'tay-xa': ('gang-xa', -1),
            'chan-gan': ('ung-gan', -1), 'chan-xa': ('ung-xa', -1)}
# v4 (REVIEW-V3 P0-2): hai mảnh KHÔNG thấy trên ảnh 02 → visible=false ở rig nhìn ngang hiện tại.
# PNG nguồn giữ nguyên; vị trí cục bộ = vị trí v2 chuyển đổi (KHÔNG dịch giấu như v3).
# v3 dịch giấu (dx, dy) = capelet-truoc (−15, −25), vat-truoc (0, −25) – bỏ ở v4, ghi CHANGELOG-V4.
# visible chỉ ảnh hưởng VẼ chính mảnh (ma trận vẫn tính, con vẫn vẽ); bật lại bằng pose['hien'][ten] = True.
VISIBLE_FALSE = ['vat-truoc', 'capelet-truoc']
# thứ tự phụ khi trùng slot (tie-break): chuỗi chi đùi 0 < cẳng 1 < ủng 2 (ủng đè cẳng chân, kể cả khi
# cả hai đổi sang slot 115). Mảnh khác 0; khoá cuối cùng là tên mảnh → sắp xếp ổn định, không phụ thuộc thứ tự object.
def thu_tu_phu(n):
    for names in CHAIN.values():
        if n in names:
            return names.index(n)
    return 0

# IK hai đoạn (khoá chân). gap = dấu hướng gập trong quy ước góc (gối ra trước), CỐ ĐỊNH (không đổi nhánh).
# tam_toi_da: tỉ lệ tầm với tối đa (1 = duỗi thẳng; không kéo xương). mix: 1 = theo IK hoàn toàn.
IK_CHAINS = [
    dict(ten='chan-gan', xuong=['dui-gan', 'cang-chan-gan', 'ung-gan'], gap=-1, mix=1.0, tam_toi_da=1.0,
         dich='diem_de', ghi_chu='đích = điểm đế ung-gan (thế giới); cổ chân suy từ hướng ủng'),
    dict(ten='chan-xa', xuong=['dui-xa', 'cang-chan-xa', 'ung-xa'], gap=-1, mix=1.0, tam_toi_da=1.0,
         dich='diem_de', ghi_chu='chân xa gần duỗi thẳng ở dáng nghỉ: ngoài tầm → hạ root (báo số), không kéo xương'),
]
# giới hạn góc DELTA so với goc_nghi (độ) đã thử trong kiem-thu/ (không phải giới hạn giải phẫu tuyệt đối).
GIOI_HAN_GOC = {'than': [-8, 8], 'mu': [-10, 10], 'chop-mu': [-10, 10]}
GIOI_HAN_GOC_THE_GIOI = {   # góc thế giới đã thử (độ, quy ước y xuống): dải dùng an toàn cho bài chạy
    'khuyu': 'cẳng tay so tay trên 0..120 (gập một phía)', 'goi': 'cẳng chân so đùi 0..120',
}

# ---------- chuyển động phụ (pose delta của nguồn × hệ số, cộng vào mảnh) ----------
# Đầu: khi thân nghiêng (lean), đầu bù ngược 30 % để giữ nhìn thẳng – chuyển động phụ riêng của đầu
# (pose vẫn cộng delta 'mu' riêng nếu cần). Kiểm tra: kiem-thu/06-lean.png.
PHU = [{'manh': 'mu', 'theo': 'than', 'he_so': -0.3, 'gioi_han': [-6, 6], 'kieu': 'bu_goc_tinh',
        'ghi_chu': 'bù góc TĨNH theo delta thân cùng khung hình; KHÔNG phải độ trễ/quán tính vật lý'}]
# ---------- slot vẽ đổi theo tư thế ----------
# Chân gần: khi đùi đưa ra trước (góc cục bộ đùi so với thân < 30°, tức nâng gối), cẳng + ủng gần vẽ
# NGAY TRÊN thân (dưới vạt sau/đai) để không biến mất sau vạt áo; đùi vẫn nằm dưới thân.
# Ngưỡng 30° chọn theo số điểm ảnh đổi khi chuyển slot (thu4.py slot): ≤ 6 px ở 30° (gối 60°/90°),
# 16–31 px ở 35–40°, 200+ px nếu chuyển cả đùi. Xem kiem-thu/11-slot-chan-gan.png.
_TS = 10 * (ORDER_V3.index('than') + 1)
SLOT_THEO_TU_THE = [{'manh': ['cang-chan-gan', 'ung-gan'], 'slot': _TS + 5,
                     'khi': {'bien': 'goc:dui-gan', 'nho_hon': 30,
                             # v4: bù theo gập gối – khi gối gập > 60°, ngưỡng đùi lùi xuống 0,85°/°; đổi lớp chỉ xảy ra
                             # ở vùng hai thứ tự vẽ gần như trùng ảnh (kiem-thu/10-*). v3: chỉ 'goc:dui-gan' < 30.
                             'bu': [{'bien': 'gap:cang-chan-gan', 'tu': 60, 'he_so': 0.85}]},
                     'ghi_chu': 'đổi khi goc(dui-gan) + 0,85·max(0, |goc(cang-chan-gan)| − 60) < 30; '
                                'hai mảnh cùng slot 115, thứ tự phụ thu_tu_phu cẳng 1 < ủng 2'}]
