#!/usr/bin/env python3
"""ĐẤT BỔ SUNG 28/10 (ảnh gen chủ dự án theo góp ý chuyên gia PH8): góc lõm, 2 biến thể mặt sàn, bệ rễ mỏng → atlas 2x riêng.

Dùng ĐÚNG công cụ của code/tao-bo-moi.py (tách nền trắng, ép mép, đoạn khớp, mờ cạnh, kéo màu) – phần hàm của file đó được nạp
nguyên văn (không chép lại, không sửa). dat-moi.png + khoá "bo_moi" GIỮ NGUYÊN; ra thêm:
  dat-bo-sung.png      atlas: 4 góc lõm 64×64 logic · mặt trên giữa D (mắt gỗ) + E (rễ ngang) · bệ rễ mỏng (đầu trái / 3 đoạn giữa / đầu phải)
  dia-hinh.json        khoá "bo_sung" (khung, cỡ logic) – các khoá khác giữ nguyên
  xem-thu/bs-*.png     ảnh kiểm: tách nền, góc lõm (cửa sổ + nét collider), biến thể nối với mặt trên gốc (cả 2 phía), bệ rễ ghép

Nguồn (art/huong-moi/nguon/dia-hinh/, nền trắng):
  goc-lom.png           4 góc lõm (ĐỌC THEO HÌNH: trên-trái có tường bên PHẢI → khuôn goc-lom-san-phai; trên-phải → goc-lom-san-trai;
                        dưới-trái tường bên phải → goc-lom-tran-phai; dưới-phải → goc-lom-tran-trai – tên khuôn: phía có TƯỜNG)
  mat-san-bien-the.png  trên = mắt gỗ lớn, dưới = rễ ngang
  be-re-mong.png        bệ rễ mỏng ít rêu: đầu trái / giữa / đầu phải

TỈ LỆ: góc lõm vẽ cùng tỉ lệ bo-dat-3x3 (S = 0,48 logic / px gen: cuộn rễ cùng cỡ) → KHÔNG nén cả mảnh 440 px vào 64 logic (rễ sẽ nhỏ 3 lần),
mà cắt CỬA SỔ 64×64 logic quanh điểm góc (đúng khuôn goc-lom-*: điểm góc ở giữa, khấc ½). Biến thể sàn và bệ mỏng gen ở tỉ lệ lớn hơn
(dải sáng mặt trên dày 55 px so với 40 px của bo-dat; thân bệ dày 90 px) → S2 = 0,36 cho cả hai (vân rễ cùng cỡ với bộ gốc).
LUẬT như bộ gốc: nhô ≤ 3 logic (mặt trên, mặt tường), ≤ 4 logic (đáy trần); bệ mỏng: thân kín đúng 32 logic collider, chỉ ĐẦU RỄ được
thõng xuống ≤ 22 logic (như giá đỡ ván một chiều), rêu chỉ ở 2 đầu. Không ngẫu nhiên (seed cố định).

Chạy: python3 -B art/huong-moi/dia-hinh/code/tao-dat-bo-sung.py   (Pillow, numpy, scipy; ~15 s)"""
import json, os, sys

_GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tao-bo-moi.py')
_src = open(_GOC, encoding='utf-8').read()
_MOC = '# ------------------------------------------------------------ 1. tách nền'
if _src.count(_MOC) != 1: sys.exit('LỖI – tao-bo-moi.py đã đổi: không thấy mốc "%s"' % _MOC)
_g = {'__file__': _GOC, '__name__': 'tao_bo_moi_ham'}
exec(compile(_src[:_src.index(_MOC)], _GOC, 'exec'), _g)          # hàm + hằng số của bộ gốc (S, NHO, NHO_D, DOAN, J, PAD …)
globals().update({k: v for k, v in _g.items() if not k.startswith('__')})

from PIL import ImageDraw
S2 = 0.36                    # logic / px gen: biến thể sàn + bệ mỏng
GOC_L = 64                   # cửa sổ góc lõm (logic)
VIEN_GL = 8                  # mép cửa sổ góc lõm mờ dần (logic) – phủ lên mảnh kề
BE_DAU, BE_DOAN, BE_DUOI = 64, 128, 22   # bệ: đầu (logic, không kể nhô), đoạn giữa, đầu rễ thõng tối đa dưới collider
BE_MO = 24                   # phía trong đầu bệ mờ dần (logic)

B = json.load(open(os.path.join(DH, 'dia-hinh.json'), encoding='utf-8'))['bo_moi']
HS2 = round(B['mat_cao_logic'] * 2)

# ------------------------------------------------------------ 1. tách nền
print('tách nền…')
GL = tach_nen(os.path.join(NG, 'goc-lom.png'))
MS = tach_nen(os.path.join(NG, 'mat-san-bien-the.png'))
BR = tach_nen(os.path.join(NG, 'be-re-mong.png'))
BD = tach_nen(os.path.join(NG, 'bo-dat-3x3.png'))
def bo_trang(a):
    """tach_nen giữ điểm sáng KHÔNG nối với nền (đúng cho vải hình nộm) – ở đây là nền trắng bị kẹp giữa các giọt rêu / đầu rễ → bỏ"""
    mn = a[..., :3].min(2); mx = a[..., :3].max(2); tr = ((mn > 200) & (mx - mn < 30)) | ((mn > 150) & (mx - mn < 22))
    tr = ndimage.binary_dilation(tr, iterations=1) | ((a[..., 3] < 235) & (mn > 120) & (mx - mn < 40))   # + quầng sáng mờ quanh giọt / đầu rễ
    a = a.copy(); a[..., 3][tr] = 0; return a
GL, BR = bo_trang(GL), bo_trang(BR)
for ten, a in (('goc-lom', GL), ('mat-san-bien-the', MS), ('be-re-mong', BR)):
    im = Image.fromarray(ban_co(a).astype(np.uint8)); im.thumbnail((1200, 1200)); im.save(os.path.join(XT, 'bs-tach-nen-%s.png' % ten), optimize=True)

# màu trung bình thân (giống tao-bo-moi.py mục 2) – để kéo màu các mảnh mới về cùng tông
SQ = [BD[384:714, 562:892], BD[384:714, 645:975][:, ::-1], BD[384:714, 167:497], BD[384:714, 1042:1372]]
TB_MAU = np.mean([doi_co(a, 400, 400)[..., :3].reshape(-1, 3).mean(0) for a in SQ], axis=0)
def keo_mau(a, k=0.6):
    al = a[..., 3] > 200
    if al.sum() < 50: return a
    m = a[..., :3][al].mean(0); f = 1 + (TB_MAU / np.maximum(m, 1) - 1) * k
    a = a.copy(); a[..., :3] = np.clip(a[..., :3] * f, 0, 255); return a


# ------------------------------------------------------------ 2. GÓC LÕM: cửa sổ 64×64 logic quanh điểm góc, cùng tỉ lệ S với bộ gốc
print('góc lõm…')
# (mảnh ảnh, x mặt tường, y collider sàn / đáy trần (gen), tường bên phải?, sàn?) – mặt tường đo được thẳng tuyệt đối (x 484 / 1051 mọi hàng)
GOC_DS = {
    'goc-lom-san-phai':  dict(x=484, y=262, tuong_phai=True,  san=True),    # ảnh: trên trái
    'goc-lom-san-trai':  dict(x=1051, y=262, tuong_phai=False, san=True),   # ảnh: trên phải
    'goc-lom-tran-phai': dict(x=484, y=728, tuong_phai=True,  san=False),   # ảnh: dưới trái
    'goc-lom-tran-trai': dict(x=1051, y=728, tuong_phai=False, san=False),  # ảnh: dưới phải
}
R_GEN = GOC_L / 2 / S                                # nửa cửa sổ (px gen) ≈ 66,7
M_GEN = 110                                          # vùng làm việc rộng hơn (ép mép cần ngữ cảnh)
GOC = {}
for ten, d in GOC_DS.items():
    x, y = d['x'], d['y']
    a = GL[y - M_GEN:y + M_GEN, x - M_GEN:x + M_GEN].copy()
    if not d['san']: a = a[::-1]                     # trần → lật dọc: xử lý như sàn, lật lại sau
    if not d['tuong_phai']: a = a[:, ::-1]           # tường trái → lật ngang
    c = M_GEN                                        # điểm góc trong a: (c, c); tường ở cột ≥ c, sàn ở hàng ≥ c, khoảng trống trên-trái
    nho = (NHO if d['san'] else NHO_D) / S
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
    # giọt rêu / cục rời xa 2 mặt (> 10 logic) bỏ TRƯỚC khi ép: ép coi điểm đặc đầu tiên là mép → giọt rời làm thủng thân tường
    a[..., 3][(yy < c - 10 / S) & (xx < c - 10 / S)] = 0
    # mặt tường (hàng phía trên sàn, trừ 30 px sát sàn có rêu): ép về x = c, nhô ≤ 3
    tr = a[:c - 30].copy(); a[:c - 30] = ep(tr, 'trai', c, NHO / S)
    # mặt sàn / đáy trần (cột phía khoảng trống): ép về y = c (k như bộ gốc: sàn 0,3, đáy 0,35)
    s = a[:, :c].copy(); e_ = ep(s, 'tren', c, nho, k=0.3 if d['san'] else 0.35)
    # dưới mặt (thân): trộn dần về bản CHƯA ép trong 20 px sát tường → không lệch vân ở chỗ giáp cột tường (ép dời vân ≤ 12 px)
    w_ = np.clip((np.arange(c, dtype=np.float32) - (c - 20)) / 20, 0, 1)[None, :, None]
    duoi = np.arange(a.shape[0])[:, None, None] >= c + nho + 4
    a[:, :c] = np.where(duoi, e_ * (1 - w_) + s * w_, e_)
    # khoảng trống trên-trái: chỉ giữ dải nhô sát 2 mặt (rêu / mép) – ngoài đó trong suốt hẳn
    ngoai = (yy < c - nho - 1) & (xx < c - NHO / S - 1)
    a[..., 3][ngoai] = 0
    if not d['tuong_phai']: a = a[:, ::-1]
    if not d['san']: a = a[::-1]
    w = a[int(round(M_GEN - R_GEN)):int(round(M_GEN + R_GEN)), int(round(M_GEN - R_GEN)):int(round(M_GEN + R_GEN))]
    o = doi_co(w, GOC_L * 2, GOC_L * 2)
    o = keo_mau(o, 0.35)
    # mép cửa sổ mờ dần VIEN_GL logic (phủ lên mặt trên / cạnh đứng / thân đã vẽ) – mép nhiễu nhẹ để không thành khung vuông
    n = nhieu(GOC_L * 2, GOC_L * 2, 6, 300 + len(GOC)) * 3
    yy, xx = np.mgrid[0:GOC_L * 2, 0:GOC_L * 2].astype(np.float32)
    de = np.minimum.reduce([xx, yy, GOC_L * 2 - 1 - xx, GOC_L * 2 - 1 - yy]) + n
    k = np.clip(de / (VIEN_GL * 2), 0, 1); k = k * k * (3 - 2 * k)
    o[..., 3] *= k
    GOC[ten] = o
# ảnh kiểm: 4 góc phóng 3× trên bàn cờ + nét collider (đỏ)
kq = []
for ten in ('goc-lom-san-trai', 'goc-lom-san-phai', 'goc-lom-tran-trai', 'goc-lom-tran-phai'):
    im = Image.fromarray(ban_co(GOC[ten], 8).astype(np.uint8)).resize((384, 384), Image.NEAREST)
    dr = ImageDraw.Draw(im); m = 192; d = GOC_DS[ten]
    if d['san']: dr.line([(0 if d['tuong_phai'] else m, m), (m if d['tuong_phai'] else 384, m)], fill=(255, 40, 40), width=2); dr.line([(m, 0), (m, m)], fill=(255, 160, 40), width=2)
    else: dr.line([(0 if d['tuong_phai'] else m, m), (m if d['tuong_phai'] else 384, m)], fill=(255, 160, 40), width=2); dr.line([(m, m), (m, 384)], fill=(255, 160, 40), width=2)
    kq.append(im)
g = Image.new('RGB', (384 * 4 + 30, 384), (30, 30, 30))
for i, im in enumerate(kq): g.paste(im, (i * 394, 0))
g.save(os.path.join(XT, 'bs-goc-lom.png'), optimize=True)


# ------------------------------------------------------------ 3. BIẾN THỂ MẶT TRÊN GIỮA (D mắt gỗ, E rễ ngang) – khớp như đoạn A/B/C gốc
print('biến thể mặt trên…')
# khớp chung = nội dung quanh tâm dải mặt trên giữa gốc (đúng như tao-bo-moi.py mục 3)
COL_T = 92.0; Y0T = int(COL_T - NHO / S) - 1; Y1T = 326; B2 = 2 * S
TM = ep(BD[Y0T - 10:Y1T, 556:981].copy(), 'tren', COL_T - (Y0T - 10), NHO / S)[10:]
TM2 = doi_co(TM, round(TM.shape[1] * B2), HS2); jc = TM2.shape[1] // 2; J2 = J * 2; W2 = DOAN * 2
# dải biến thể: đường mặt (viền đen) đo ở giữa ảnh, collider = ngay dưới viền như bộ gốc (COL_T = viền + 2)
AT = np.asarray(Image.open(os.path.join(DH, 'dat-moi.png')).convert('RGBA')).astype(np.float32)
def khung(k): x, y, w, h = B['khung'][k]; return AT[y:y + h, x:x + w]
# màu chỗ khớp của đoạn gốc trong atlas (đã kéo màu) so với khớp chung TM2 (chưa kéo) → hệ số f_ref; biến thể dùng khớp TM2·f_ref và thân
# biến thể kéo về đúng màu trung bình đoạn gốc → chỗ nối không lệch màu (đo: chênh ở chỗ nối ≈ đoạn gốc nối nhau)
def tb(a): m = a[..., 3] > 200; return a[..., :3][m].mean(0)
F_REF = np.mean([tb(khung('mat-giua-' + k)[:, :40]) / tb(TM2[:, jc:jc + 40]) for k in 'abc'], axis=0)
TB_GOC = np.mean([tb(khung('mat-giua-' + k)) for k in 'abc'], axis=0)
TM2R = TM2.copy(); TM2R[..., :3] = np.clip(TM2R[..., :3] * F_REF, 0, 255)
def bien_the(y_tren, x_tam, seed):
    p = MS[y_tren - 40:y_tren + 340, 78:1105].copy()
    L = duong(p[:, 100:-100], 'tren', 50) + 2
    p = ep(p, 'tren', L, NHO / S2)
    # dưới dải sáng mặt trên (60 px gen) nén dọc 0,75 → mắt gỗ / rễ ngang (sâu ~ 250 px dưới mặt) lên khỏi vùng mờ đáy dải
    yk = int(round(L + 60)); duoi = p[yk:]
    p = np.vstack([p[:yk], doi_co(duoi, duoi.shape[1], round(duoi.shape[0] * 0.75))])
    y0 = int(round(L - NHO / S2)); h_gen = HS2 / (2 * S2)
    seg = DOAN / S2; x0 = x_tam - 78 - seg / 2
    s = doi_co(p[y0:int(round(y0 + h_gen)), int(round(x0)):int(round(x0 + seg))], W2, HS2)
    s[..., :3] = np.clip(s[..., :3] * (TB_GOC / tb(s)), 0, 255)
    s = doan_khop(s, TM2R, jc, seed, J2)
    return mo_canh(s, 'duoi', 24 * 2, 51), L + y_tren - 40
MAT_D, LD = bien_the(128, 600, 401)      # mắt gỗ: tâm cuộn x ≈ 600
MAT_E, LE = bien_the(720, 470, 411)      # rễ ngang: đoạn có 2 rễ ngang chéo nhau
# ảnh kiểm nối: gốc A | D | gốc B | E | gốc C | D (2 phía của mỗi biến thể đều chạm đoạn gốc) – lấy đoạn gốc từ dat-moi.png
hang = [khung('mat-giua-a'), MAT_D, khung('mat-giua-b'), MAT_E, khung('mat-giua-c'), MAT_D, khung('mat-giua-a')]
NOI = np.hstack(hang)
luu(ban_co(NOI), os.path.join(XT, 'bs-mat-bien-the-noi.png'), 'RGB')
# số đo liền mép: chênh màu trung bình giữa 2 cột kề nhau TẠI chỗ nối so với trong đoạn (phần đặc, 60 hàng trên)
def chenh(a, x): m = (a[6:120, x - 1, 3] > 200) & (a[6:120, x, 3] > 200); return float(np.abs(a[6:120, x - 1, :3] - a[6:120, x, :3]).sum(1)[m].mean())
noi_x = np.cumsum([h.shape[1] for h in hang])[:-1]
SO_NOI = {'cho_noi': [round(chenh(NOI, int(x)), 1) for x in noi_x],
          'trong_doan_tb': round(float(np.mean([chenh(NOI, int(x)) for x in range(40, NOI.shape[1] - 40, 7) if min(abs(x - noi_x)) > 20])), 1)}


# ------------------------------------------------------------ 4. BỆ RỄ MỎNG: đầu trái / 3 đoạn giữa / đầu phải
print('bệ rễ mỏng…')
YT_BE = 329.0                                         # viền mặt trên (gen)
def be_chuan(x0, x1):
    p = BR[290:500, x0:x1].copy(); L = duong(p[:, 40:-40], 'tren', 50) + 1
    p = ep(p, 'tren', L, NHO / S2)
    return p, L
CAO_BE = NHO + 32 + BE_DUOI                           # cao dải (logic)
def cat_be(p, L):
    """hàng 0 = collider − nhô; thân KÍN đúng 32 logic; đầu rễ dưới collider thu về ≤ BE_DUOI (ép đáy, giữ nét)"""
    y0 = int(round(L - NHO / S2)); q = p[y0:].copy()
    Lb = (NHO + 32) / S2                              # đáy collider trong q (gen)
    q = ep(q, 'duoi', Lb, BE_DUOI / S2, k=1.0, D=40)  # lõm (khe giữa đầu rễ) kéo xuống tới đáy collider; đầu rễ giữ ≤ BE_DUOI
    return q[:int(round(CAO_BE / S2)) + 2]
BL_, LL = be_chuan(30, 640); BM_, LM = be_chuan(630, 1250); BR_, LR = be_chuan(1250, 1860)
BL_ = cat_be(BL_, LL); BM_ = cat_be(BM_, LM); BR_ = cat_be(BR_, LR)
H2 = CAO_BE * 2
def be2(a, x0, x1): return doi_co(a[:, int(round(x0)):int(round(x1))], round((x1 - x0) * S2 * 2), H2)
# mép đứng 2 đầu: ép về đường mép (nhô ≤ 3) trên phần thân (bỏ phần đầu rễ)
hb = int(round((NHO + 32) / S2))
EL = duong(BL_[:hb], 'trai', 30); ER = duong(BR_[:hb], 'phai', 30)
BL_[:hb] = ep(BL_[:hb], 'trai', EL, NHO / S2); BR_[:hb] = ep(BR_[:hb], 'phai', ER, NHO / S2)
def lap_lo(q):
    """lỗ trong thân (khe giữa rễ thông ra nền trắng) trong vùng collider → lấp bằng màu kề (mờ tiền nhân alpha);
    mỗi hàng chỉ lấp GIỮA điểm đặc đầu tiên và cuối cùng (không lấn ra ngoài 2 đầu bệ)"""
    y0 = int(NHO / S2) + 2; vung = q[y0:hb]
    al = vung[..., 3:4] / 255; pm = vung[..., :3] * al
    bl = np.dstack([ndimage.gaussian_filter(pm[..., c], 5) for c in range(3)]); ba = ndimage.gaussian_filter(al[..., 0], 5)[..., None]
    lap = bl / np.maximum(ba, 1e-3)
    dac = vung[..., 3] > 128; trong = np.zeros_like(dac)
    for r in range(dac.shape[0]):
        xs = np.flatnonzero(dac[r])
        if len(xs): trong[r, xs[0]:xs[-1] + 1] = True
    m = trong[..., None]
    vung[..., :3] = np.where(m, vung[..., :3] * al + lap * (1 - al), vung[..., :3]); vung[..., 3] = np.where(trong, 255, vung[..., 3])
    return q
BL_, BM_, BR_ = lap_lo(BL_), lap_lo(BM_), lap_lo(BR_)
BMF = be2(BM_, 0, BM_.shape[1]); jb = BMF.shape[1] // 2; segb = BE_DOAN / S2
BE = {
    'be-giua-a': doan_khop(be2(BM_, 30, 30 + segb), BMF, jb, 501, J2),
    'be-giua-b': doan_khop(be2(BM_, BM_.shape[1] - 30 - segb, BM_.shape[1] - 30), BMF, jb, 511, J2),
    'be-giua-c': doan_khop(be2(BL_, BL_.shape[1] - 10 - segb, BL_.shape[1] - 10), BMF, jb, 521, J2),
}
dw = (BE_DAU + NHO) / S2
BE['be-dau-trai'] = mo_canh(be2(BL_, EL - NHO / S2, EL - NHO / S2 + dw), 'trong-trai', BE_MO * 2, 531)
BE['be-dau-phai'] = mo_canh(be2(BR_, ER + NHO / S2 - dw, ER + NHO / S2), 'trong-phai', BE_MO * 2, 532)
for k in BE: BE[k][..., :3] = keo_mau(BE[k], 0.3)[..., :3]
# đầu rễ dưới collider: khớp đoạn (trộn mask) để lại "bóng ma" nửa trong suốt ở chỗ một bên có rễ, bên kia không → cắt ngưỡng alpha (rễ đặc giữ nguyên)
for k in BE:
    d = BE[k][(NHO + 32) * 2:, :, 3]; BE[k][(NHO + 32) * 2:, :, 3] = np.clip((d - 110) / 90, 0, 1) ** 0.8 * 255
    lab, _ = ndimage.label(BE[k][..., 3] > 10); giu = np.unique(lab[:(NHO + 32) * 2]); giu = giu[giu > 0]
    BE[k][..., 3][(lab > 0) & ~np.isin(lab, giu)] = 0   # mảnh rễ rời (không dính thân) → bỏ
# ảnh kiểm: bệ 3 ô (2 đầu chồng nhau), bệ 6 ô (đầu + giữa + đầu), dải giữa a|b|c|a
def ghep_be(n):
    w = n * 64 + NHO * 4; o = np.zeros((H2, w, 4), np.float32)
    def phu(a, x, c0, c1):
        a = a[:, max(0, c0 - x):c1 - x]; x = max(x, c0)
        if a.shape[1] <= 0: return
        al = a[..., 3:4] / 255; dst = o[:, x:x + a.shape[1]]
        dst[..., :3] = a[..., :3] * al + dst[..., :3] * (1 - al); dst[..., 3:4] = a[..., 3:4] + dst[..., 3:4] * (1 - al)
    ds = ['be-giua-a', 'be-giua-b', 'be-giua-c']
    for i, gx in enumerate(range(0, w, W2)): phu(BE[ds[i % 3]], NHO * 2 + gx, NHO * 2, w - NHO * 2)
    phu(BE['be-dau-trai'], 0, 0, w); phu(BE['be-dau-phai'], w - BE['be-dau-phai'].shape[1], 0, w)
    return o
anh = [ghep_be(1), ghep_be(3), ghep_be(6), np.hstack([BE['be-giua-a'], BE['be-giua-b'], BE['be-giua-c'], BE['be-giua-a']])]
WW_ = max(a.shape[1] for a in anh); kiem = np.zeros((sum(a.shape[0] + 20 for a in anh), WW_, 4), np.float32); y = 0
for a in anh: kiem[y:y + a.shape[0], :a.shape[1]] = a; y += a.shape[0] + 20
kiem = ban_co(kiem, 8)
for i in range(len(anh)):   # nét collider (đỏ: mặt trên; cam: đáy) của 3 bệ ghép
    y0 = sum(a.shape[0] + 20 for a in anh[:i])
    if i < 3: w = anh[i].shape[1]; kiem[y0 + NHO * 2, NHO * 2:w - NHO * 2] = (255, 40, 40); kiem[y0 + (NHO + 32) * 2, NHO * 2:w - NHO * 2] = (255, 160, 40)
luu(kiem, os.path.join(XT, 'bs-be-re-mong.png'), 'RGB')


# ------------------------------------------------------------ 5. ATLAS dat-bo-sung.png
print('atlas…')
def keo(a): return np.pad(a, ((PAD, PAD), (PAD, PAD), (0, 0)), mode='edge')
ds = [(k, keo(v)) for k, v in GOC.items()] + [('mat-giua-d', keo(MAT_D)), ('mat-giua-e', keo(MAT_E))] + [(k, keo(v)) for k, v in BE.items()]
WA = 1024; x = y = hh = 0; pos = {}
for ten, a in ds:
    h, w = a.shape[:2]
    if x + w > WA: x = 0; y += hh + 2; hh = 0
    pos[ten] = (x, y); x += w + 2; hh = max(hh, h)
HA = y + hh
ATB = np.zeros((HA, WA, 4), np.float32); KH = {}
for ten, a in ds:
    px, py = pos[ten]; h, w = a.shape[:2]; ATB[py:py + h, px:px + w] = a; KH[ten] = [px + PAD, py + PAD, w - 2 * PAD, h - 2 * PAD]
luu(ATB, os.path.join(DH, 'dat-bo-sung.png'))

J_PATH = os.path.join(DH, 'dia-hinh.json')
JD = json.load(open(J_PATH, encoding='utf-8'))
JD['bo_sung'] = {
    'ghi_chu': 'Đất bổ sung 28/10 (góc lõm, biến thể mặt sàn, bệ rễ mỏng) – sinh bởi code/tao-dat-bo-sung.py. Ảnh 2x; "khung" = [x, y, rộng, cao] '
               'trong dat-bo-sung.png. Góc lõm: cửa sổ 64×64 logic, ĐIỂM GÓC Ở GIỮA (32, 32), mép mờ 8 logic; tên theo phía có TƯỜNG (khuôn goc-lom-*). '
               'mat-giua-d/e: cùng cỡ, cùng đường mặt, cùng khớp 2 đầu với mat-giua-a/b/c của bo_moi. Bệ: hàng NHO*2 = mặt collider, hàng (NHO+32)*2 = '
               'đáy collider (thân kín), đầu rễ ≤ be_duoi_logic dưới đó; đầu trái: cột 0 = mép ô − nhô; phía trong đầu mờ be_mo_logic.',
    'tep': 'dat-bo-sung.png', 'co_anh': [WA, HA], 'khung': KH, 'ti_le_gen_goc': S, 'ti_le_gen_bien_the': S2,
    'goc_logic': GOC_L, 'goc_vien_logic': VIEN_GL, 'mat_bien_the': ['giua-d', 'giua-e'],
    'be_cao_logic': CAO_BE, 'be_dau_logic': BE_DAU, 'be_doan_logic': BE_DOAN, 'be_duoi_logic': BE_DUOI, 'be_mo_logic': BE_MO,
    'be_doan': ['giua-a', 'giua-b', 'giua-c'], 'kiem_noi_mat': SO_NOI,
}
json.dump(JD, open(J_PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('dat-bo-sung.png %d×%d · liền mép mặt trên (chênh màu ở chỗ nối / trong đoạn):' % (WA, HA), SO_NOI)
