"""Bước 1 làm chắc, mục 7: dựng lại 4 dải ảnh báo trước 8 khung (docs/anh-goc/bao-truoc) → game/art/custom/gd-bt-{tron,vanh,quat,dai}.sprite.json
(thay bản 14/10 sáng của docs/review/ke-hoach-cai-thien/npc-ban-do-bao-truoc/cong-cu/dung-bao-truoc.py; git giữ bản cũ).
python3 dung-bt-dong.py [--ghi]   (không --ghi: chỉ ghi vào cong-cu/ra/ để xem)

Khác bản cũ:
- CẮT THEO HÌNH, không theo ô vuông chia đều: đo tâm / đỉnh / bán kính THẬT của từng khung (do_hinh_bt.py) — bản cũ coi tâm khung i ở
  (i + 0,5) × 271,5 nên vành khuyên lệch tới 13,7 điểm ảnh gốc (≈ 7 điểm trên ảnh ra), quạt lệch đỉnh tới 11,5.
  Mỗi điểm ảnh thuộc khung có tâm gần nhất (không lấn khung bên), trong giới hạn hình (tròn / vành: bán kính; quạt: hình quạt; dải: dòng).
- CĂN TÂM TỪNG KHUNG (cách của trum-chet-pha3: dời khung cho tâm hình trùng điểm neo): tròn, vành: tâm vòng → giữa ô, viền ngoài → đúng R
  (co giãn từng khung để vòng không phình theo quầng sáng: khung 1–8 cùng một mép vùng); quạt: đỉnh → điểm neo, trục → ngang giữa ô,
  mép cung → R; dải: tâm dòng → giữa ô, hai đầu thân → x0, x1. Khung 8 (chớp nổ: gai, tia) dùng tâm + tỉ lệ của khung 7 (gai làm lệch phép đo).
- Hoa văn hai bên trái / phải của tròn, vành chạm khung bên cạnh: thay bằng hoa văn trên / dưới xoay 90° (như bản cũ, vòng đối xứng 4 phía).
- Tách nền xanh: tach_xanh.unmix (như bản cũ). Ra PNG bảng 128 màu.
In ra cuối: hình học HA cho js/bao_truoc.js."""
import sys, os, io, json, base64
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from do_hinh_bt import doc, vong, BUOC, DAY  # noqa: E402

GHI = '--ghi' in sys.argv
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)
SS = 4  # siêu lấy mẫu khi dời / co (rồi gộp BOX) cho mép mịn


def bien_doi(a, w, h, M):
    """a: RGBA (H, W, 4) uint8. M: ma trận 2x3 từ toạ độ ẢNH RA (điểm ảnh) sang toạ độ ảnh gốc. Trả về RGBA (h, w, 4)."""
    al = a[..., 3:4].astype(np.float32) / 255
    pre = np.concatenate([a[..., :3].astype(np.float32) * al, a[..., 3:4].astype(np.float32)], 2)
    k = 1.0 / SS
    # toạ độ ảnh ra siêu lấy mẫu (u, v) → ảnh ra (u·k, v·k) → gốc
    A = (M[0][0] * k, M[0][1] * k, M[0][2], M[1][0] * k, M[1][1] * k, M[1][2])
    ch = []
    for c in range(4):
        im = Image.fromarray(pre[..., c], 'F').transform((w * SS, h * SS), Image.AFFINE, A, resample=Image.BILINEAR)
        ch.append(np.array(im.resize((w, h), Image.BOX)))
    o = np.zeros((h, w, 4), np.float32)
    Al = ch[3]
    for c in range(3):
        o[..., c] = np.where(Al > 0.5, ch[c] / np.maximum(Al, 1e-3) * 255, 0)
    o[..., 3] = Al
    return np.clip(o.round(), 0, 255).astype(np.uint8)


def luu(sh, ma, ten, so_mau=128):
    im = Image.fromarray(sh, 'RGBA')
    q = im.quantize(colors=so_mau, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
    back = np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA'))
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': ten, 'doi_tuong': 'giao-dien',
         'anh': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), 'net': 1}
    Image.fromarray(back).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(ma, sh.shape[1::-1], 'byte', os.path.getsize(ra))


hinh = {}
do = {}
# ---------- tròn, vành ----------
for ten, ma, CY, la_vanh in [('tron.png', 'gd-bt-tron', 349.5, False), ('vanh-khuyen.png', 'gd-bt-vanh', 340, True)]:
    a = doc(ten); H, W = a.shape[:2]
    T = [vong(a, (i + 0.5) * BUOC, CY, nguong=0.85) for i in range(8)]
    # khung 8 (chớp nổ): gai làm lệch phép đo bán kính → dùng bán kính khung 7; tâm đo được vẫn dùng (đo ở hai phía trên / dưới, gai đều)
    T[7] = (T[7][0], T[7][1], T[6][2])
    RO, LIMK = 64, 1.42  # R ra (điểm ảnh tấm), giới hạn giữ = LIMK × R (khung 8: 1,6 × R)
    S = int(round(2 * LIMK * 1.02 * RO)) // 2 * 2
    yy, xx = np.mgrid[0:H, 0:W]
    D = np.stack([np.hypot(xx - t[0], yy - t[1]) for t in T])  # khoảng cách tới tâm từng khung
    gan = D.argmin(0)
    out, r0s = [], []
    for i, (cx, cy, R) in enumerate(T):
        d = D[i]
        keep = (gan == i) & (d <= R * (1.6 if i == 7 else LIMK))
        b = a.copy(); b[~keep] = 0
        if i < 7:
            dx, dy = xx - cx, yy - cy
            vung = (np.abs(dx) > 0.9 * R) & (np.abs(dy) < 0.26 * R) & (d <= R * LIMK)
            sx = np.clip(np.round(cx - dy[vung]).astype(int), 0, W - 1); sy = np.clip(np.round(cy + dx[vung]).astype(int), 0, H - 1)
            b[vung] = a[sy, sx]
        if la_vanh and i < 7:  # bán kính trong (mép trong vành, alpha > 0,85 dò từ trong ra) → r0
            al = a[..., 3] / 255
            rs = []
            for t in np.linspace(0, 2 * np.pi, 120, endpoint=False):
                if abs(np.sin(t)) < 0.55: continue
                for r in np.arange(20, R, 0.5):
                    x, y = int(cx + r * np.cos(t)), int(cy + r * np.sin(t))
                    if al[y, x] > 0.85: rs.append(r / R); break
            r0s.append(float(np.median(rs)))
        s = R / RO  # điểm ảnh gốc mỗi điểm ảnh ra
        M = ((s, 0, cx - s * S / 2), (0, s, cy - s * S / 2))
        out.append(bien_doi(b, S, S, M))
    sh = np.concatenate(out, 1)
    luu(sh, ma, 'Vòng báo trước · ' + ('vành khuyên' if la_vanh else 'tròn') + ' (8 khung, căn tâm từng khung)')
    hinh[ma] = {'o': [S, S], 'R': RO}
    if la_vanh: hinh[ma]['r0'] = round(float(np.median(r0s)) * RO, 2)
    do[ma] = [[round(float(t[0] - (i + 0.5) * BUOC), 1), round(float(t[1] - CY), 1), round(float(t[2]), 1)] for i, t in enumerate(T)]

# ---------- quạt ----------
a = doc('hinh-quat.png'); H, W = a.shape[:2]; al = a[..., 3] / 255
yy, xx = np.mgrid[0:H, 0:W]
dinh = []
for i in range(8):
    ax0 = i * BUOC + 14
    m = (xx > ax0 - 10) & (xx < ax0 + 250) & (al > 0.85)
    ay = float((al * m * yy).sum() / (al * m).sum())
    band = (np.abs(yy - ay) < 3) & (al > 0.5) & (xx > ax0 - 14) & (xx < ax0 + 60)
    apx = float(xx[band].min())
    band2 = (np.abs(yy - ay) < 4) & (al > 0.85) & (xx > apx + 150) & (xx < apx + 300)
    R = float(xx[band2].max() - apx)
    dinh.append([apx, ay, R])
dinh[7] = [dinh[7][0], dinh[6][1], dinh[6][2]]  # khung 8: tia nổ làm lệch trục / mép → trục, bán kính của khung 7
RO, NUA, LO, MO = 64, 44, 0.06, 1.18  # R ra; nửa góc (độ); lề trái (× R); giữ tới MO × R
SW = int(round((LO + MO) * RO)) + 2
SH = int(round(2 * MO * np.sin(np.radians(64)) * RO)) // 2 * 2 + 2
# chủ của từng điểm ảnh: nằm trong hình quạt j sát đỉnh (< 0,35 R) thì thuộc j; còn lại thuộc quạt trái nhất chứa nó (cung quạt trước
# vươn sang đỉnh quạt sau, đỉnh quạt sau không lấn ngược lại)
chu = np.full(al.shape, -1, int)
for j in range(7, -1, -1):
    apx, ay, R = dinh[j]
    d = np.hypot(xx - apx, yy - ay); an = np.degrees(np.arctan2(yy - ay, xx - apx))
    trong = (d <= R * MO) & ((np.abs(an) <= 64) | (d < 12)) & (xx >= apx - 14)
    chu[trong] = j
for j in range(8):
    apx, ay, R = dinh[j]
    d = np.hypot(xx - apx, yy - ay); an = np.degrees(np.arctan2(yy - ay, xx - apx))
    chu[(d < 0.35 * R) & ((np.abs(an) <= 64) | (d < 12)) & (xx >= apx - 14)] = j
out = []
for i, (apx, ay, R) in enumerate(dinh):
    d = np.hypot(xx - apx, yy - ay)
    keep = (chu == i) & ((xx >= apx - 3) | (d < 12)) & (d <= R * (MO if i == 7 else 1.1))  # bỏ vụn phía sau đỉnh và vụn quạt kề ngoài cung
    b = a.copy(); b[~keep] = 0
    s = R / RO
    oxp, oyp = LO * RO + 1, SH / 2  # điểm neo (đỉnh) trên ô ra
    M = ((s, 0, apx - s * oxp), (0, s, ay - s * oyp))
    out.append(bien_doi(b, SW, SH, M))
sh = np.concatenate(out, 1)
luu(sh, 'gd-bt-quat', 'Vòng báo trước · hình quạt (8 khung, căn đỉnh từng khung)')
hinh['gd-bt-quat'] = {'o': [SW, SH], 'dinh': [round(LO * RO + 1, 2), SH / 2], 'R': RO, 'nua': NUA}
do['gd-bt-quat'] = [[round(p[0] - (i * BUOC + 14), 1), round(p[1] - 342, 1), round(p[2], 1)] for i, p in enumerate(dinh)]

# ---------- dải thẳng (8 dòng xếp dọc) ----------
a = doc('dai-thang-doc.png'); H, W = a.shape[:2]; al = a[..., 3] / 255
TAM = [108.5, 273, 446, 616.5, 788, 963.5, 1137.5, 1305.5]
dong = []
for i, c in enumerate(TAM):
    cot = al[:, 200:820].mean(1)  # độ phủ trung bình theo dòng ở giữa thân (bỏ hai đầu nhọn)
    ys = np.arange(int(c) - 70, int(c) + 70)
    v = cot[ys]
    on = ys[v > 0.6]
    top, bot = float(on.min()), float(on.max())
    row = al[int(round((top + bot) / 2))]
    xs = np.where(row > 0.5)[0]
    dong.append([(top + bot) / 2, float(xs.min()), float(xs.max()), (bot - top) / 2])
dong[7] = [dong[7][0], dong[6][1], dong[6][2], dong[6][3]]  # khung 8: tia nổ hai đầu → hai đầu thân của khung 7
LEN_O = 160
x0s, x1s = np.median([d[1] for d in dong[:7]]), np.median([d[2] for d in dong[:7]])
k = LEN_O / (x1s - x0s)
SW, SH = int(round(W * k)), int(round(170 * k)) // 2 * 2
out = []
for i, (cy, x0, x1, nua) in enumerate(dong):
    y0 = int(round(cy)) - 85
    b = a.copy()
    msk = np.zeros(al.shape, bool); msk[max(0, y0):y0 + 170] = True
    b[~msk] = 0
    s = (x1 - x0) / LEN_O  # gốc / ra theo chiều dài; chiều dày cùng tỉ lệ
    M = ((s, 0, x0 - s * (x0s * k)), (0, s, cy - s * SH / 2))
    out.append(bien_doi(b, SW, SH, M))
sh = np.concatenate(out, 1)
luu(sh, 'gd-bt-dai', 'Vòng báo trước · dải thẳng (8 khung, căn tâm từng dòng)')
nua_med = float(np.median([d[3] for d in dong[:7]]))
hinh['gd-bt-dai'] = {'o': [SW, SH], 'x0': round(x0s * k, 2), 'x1': round(x0s * k + LEN_O, 2), 'nua': round(nua_med * k, 2)}
do['gd-bt-dai'] = [[round(d[0] - TAM[i], 1), round(d[1], 1), round(d[2], 1), round(d[3], 1)] for i, d in enumerate(dong)]

print('HA =', json.dumps(hinh))
json.dump({'HA': hinh, 'do': do}, open(os.path.join(RA, 'hinh-bt-dong.json'), 'w'), indent=1, ensure_ascii=False)
