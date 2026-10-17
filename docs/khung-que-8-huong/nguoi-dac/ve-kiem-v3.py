# Khung người đặc KIẾM v3 (17/10): kiếm 1 / 2 / 3 có chuyển động CẢ NGƯỜI (lấy đà, lao người, vặn hông, theo đà, thu về).
# Dùng hàm ve() của ve-tu-the.py. Chân SAU (xanh dương) ghim cố định: dx tự tính để gót chân sau không trượt.
# Xuất: kiem-<n>-v3-e.png (1 hàng) + kiem-<n>-v3-que.gif (xem thử, đúng mốc thời gian game) cùng thư mục.
import os, math, json
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(D, 've-tu-the.py')).read().split('G=[30,10]')[0]
# Ô rộng hơn bản gốc (156 thay 96, lề trái 40): người lao tới / kiếm chĩa ra sau không bị cắt mép.
for a, b in (("CW,CH=96*S,112*S", "CW,CH=156*S,112*S"), ("Image.new('RGB',(120*S,114*S)", "Image.new('RGB',(180*S,114*S)"),
             ("sc=lambda p:((p[0]+12)*S", "sc=lambda p:((p[0]+40)*S"), ("(120*S,106*S+12)", "(180*S,106*S+12)"),
             ("cell.crop((12*S,0,108*S,112*S))", "cell.crop((12*S,0,168*S,112*S))")):
    assert a in _src, a; _src = _src.replace(a, b)
exec(_src)
G = [30, 10]; B = [-25, 5]
GUARD = dict(lean=6, lp=G, lt=B, ap=(30, 105), at=(-15, 70), blade=45)

def chan(f, dx=0):
    """Tính hông/chân như ve(): trả (hông, bàn chân trước, bàn chân sau)."""
    h0 = (48 + dx, 0); lR = leg(h0, *f['lp']); lL = leg(h0, *f['lt'])
    hy = 88 - max(lR[1][1], lL[1][1], lR[2][1], lL[2][1]); hip = (h0[0], hy)
    lR = leg(hip, *f['lp']); lL = leg(hip, *f['lt'])
    return hip, lR, lL

def tinh(f):
    hip, lR, lL = chan(f, f.get('dx', 0)); lean = f.get('lean', 8)
    chest = V(hip, 180 - lean, 24); head = V(chest, 180 - lean, 11)
    sh = (chest[0], chest[1] + 1); el = V(sh, f['ap'][0], 14); wr = V(el, f['ap'][1], 13)
    b = math.radians(f['blade']); tip = (wr[0] + 28 * math.cos(b), wr[1] - 28 * math.sin(b))
    return dict(hip=hip, head=head, wr=wr, tip=tip, chanSau=lL[1][0], chanTruoc=lR[1][0])

X_SAU = tinh(GUARD)['chanSau']; X_TRUOC = tinh(GUARD)['chanTruoc']; DAU0 = tinh(GUARD)['head'][1]

def ghim(fs):
    """dx để cổ chân sau đứng đúng chỗ lúc thủ thế (chân sau cố định)."""
    out = []
    for f in fs:
        f = dict(f); f['dx'] = X_SAU - tinh(f)['chanSau']; out.append(f)
    return out

HIP0 = (48, 50.5); A_TRUOC = (64.8, 86.6); A_SAU = (29.5, 86.0)   # hông + cổ chân lúc thủ thế (đo bằng chan(GUARD))
def ik(h, a):
    """Góc đùi + độ gập gối để cổ chân tới đúng điểm a (gối luôn gập về phía trước)."""
    dx, dy = a[0] - h[0], a[1] - h[1]; d = min(math.hypot(dx, dy), 39.6)
    phi = math.degrees(math.atan2(dx, dy)); al = math.degrees(math.acos(d / 40))
    return (round(phi + al, 1), round(2 * al, 1))

def F(hx, ha, ff, lean, ap, at, blade, hit=0):
    """hx: hông dịch tới (+) / lùi (−); ha: hông hạ thấp (+, nhún) / nhổm cao (−); ff: bàn chân trước nhích tới (≤ 7 ≈ 1 bàn chân).
    Chân sau luôn đứng đúng chỗ thủ thế."""
    h = (HIP0[0] + hx, HIP0[1] + ha)
    return dict(lean=lean, lp=ik(h, (A_TRUOC[0] + ff, A_TRUOC[1])), lt=ik(h, A_SAU), ap=ap, at=at, blade=blade, hit=hit)

# blade: 0 = mũi chỉ ra trước, dương = chĩa LÊN (quy ước của ve()). lean > 0 = thân đổ tới.
#        hx   ha  ff  lean  tay phải (vai, khuỷu)  tay trái      kiếm
K1 = [F(-6,  5,  0,  -8, (-150, -168), (20, 85),   145),          # 1 lấy đà: lùi trọng tâm ra sau, gập gối, kiếm ra sau đầu
      F(-3,  0,  0,  -5, (-178, 172),  (-5, 70),   100),          # 2 giơ cao: nhổm người, kiếm thẳng trên đầu (đầu cao nhất)
      F( 5,  3,  5,  12, (150, 125),   (-30, 45),   55),          # 3 bước chân trước lên ~¾ bàn, lao người tới
      F( 9,  7,  6,  22, (95, 85),     (-60, 20),  -15, hit=1),   # 4 ★ CHẠM: tay vươn hết, hông vặn, thân đổ tới, xéo xuống
      F(10,  9,  6,  26, (45, 35),     (-55, 25),  -30),          # 5 theo đà: kiếm thấp phía trước (không xuyên đất)
      F( 9,  8,  6,  23, (50, 40),     (-45, 30),  -22),          # 6 giữ dư chấn
      F( 1,  1,  0,   8, (30, 100),    (-15, 70),   45)]          # 7 thu về thế đứng
K2 = [F(-5,  7,  0,  14, (-40, -62),   (25, 85),  -150),          # 1 lấy đà: ngồi thấp, kiếm thấp sau lưng
      F( 4,  6,  3,  18, (15, 30),     (-20, 55),  -15),          # 2 bước lao tới, kiếm quét sát đất ra trước
      F( 3,  2,  3,   6, (118, 128),   (-45, 30),   50, hit=1),   # 3 ★ CHẠM: hất lên trước mặt, người bật lên
      F( 2,  1,  3,  -8, (168, -176),  (-40, 40),  115),          # 4 theo đà: kiếm vút qua đầu, nhón người (đầu cao nhất)
      F( 2,  2,  3,  -4, (164, 178),   (-35, 45),  108),          # 5 giữ dư chấn
      F( 1,  1,  0,   8, (30, 100),    (-15, 70),   45)]          # 6 thu về thế đứng
K3 = [F(-8,  9,  0, -10, (-85, -105),  (45, 95),   172),          # 1 lấy đà SÂU: ngồi thấp, vặn thân ra sau, kiếm chĩa ra sau
      F(-6,  7,  0,   0, (-125, -155), (40, 85),   155),          # 2 nén: kiếm lên vai sau
      F( 6,  5,  6,  18, (130, 100),   (-20, 60),   35),          # 3 lao người: bước ~1 bàn chân, kiếm vung ra trước
      F(11,  9,  7,  28, (90, 90),     (-65, 30),    0, hit=1),   # 4 ★ CHẠM: lao xa nhất, tay vươn thẳng ngang vai
      F(12, 10,  7,  30, (58, 42),     (-60, 30),  -22),          # 5 theo đà: kiếm chúc xuống trước (không xuyên đất)
      F(11,  9,  7,  26, (60, 46),     (-55, 35),  -15),          # 6 giữ thế kết
      F( 1,  1,  0,   8, (30, 100),    (-15, 70),   45)]          # 7 thu về thế đứng
# Mốc thời gian đề xuất (u, 0..1) để khung ★ rơi đúng lúc chạm cũ u = 0,45 (không đổi thời lượng đòn).
MOC = {1: [0, 0.1, 0.25, 0.45, 0.6, 0.74, 0.88], 2: [0, 0.22, 0.45, 0.62, 0.78, 0.9], 3: [0, 0.12, 0.3, 0.45, 0.6, 0.75, 0.88]}
TG = {1: 0.30, 2: 0.30, 3: 0.46}  # giây, như game

if __name__ == '__main__':
    so = {}
    for n, K in ((1, K1), (2, K2), (3, K3)):
        K = ghim(K); png = os.path.join(D, f'kiem-{n}-v3-e.png'); ve(K, png)
        rows = []
        for i, f in enumerate(K):
            t = tinh(f)
            rows.append(dict(khung=i + 1, sao=bool(f['hit']), chanTruoc=round(t['chanTruoc'] - X_TRUOC, 1),
                             dauCao=round(DAU0 - t['head'][1], 1), muiKiemTrenDat=round(88 - t['tip'][1], 1)))
        so[n] = rows
        # GIF xem thử: thủ thế → các khung theo mốc → thủ thế (mỗi khung giữ đúng thời gian), chậm ×3 để dễ nhìn
        im = Image.open(png); CW, Gp = 156 * S, 40; N = len(K)
        cells = [im.crop((i * (CW + Gp), 0, i * (CW + Gp) + CW, im.height)).resize((CW // 2, im.height // 2)) for i in range(N)]
        g0 = os.path.join(D, '_guard.png'); ve([GUARD], g0); gc = Image.open(g0).resize((CW // 2, im.height // 2)); os.remove(g0)
        m = MOC[n] + [1.0]; frs = [gc]; dur = [400]
        for i in range(N):
            c = cells[i].copy(); dr = ImageDraw.Draw(c)
            dr.text((6, 6), f'kiem {n} v3  khung {i+1}' + (' *CHAM*' if K[i]['hit'] else ''), fill=(0, 0, 0))
            frs.append(c); dur.append(max(40, int((m[i + 1] - m[i]) * TG[n] * 1000 * 3)))
        frs.append(gc); dur.append(400)
        frs[0].save(os.path.join(D, f'kiem-{n}-v3-que.gif'), save_all=True, append_images=frs[1:], duration=dur, loop=0)
    json.dump(dict(so_do=so, moc=MOC, ghi_chu='chanTruoc: lệch bàn chân trước so với thủ thế (đơn vị khung que, 1 bàn chân ≈ 7); dauCao: đầu cao hơn (+) / thấp hơn (−) thủ thế; muiKiemTrenDat: mũi kiếm (dài 28) cao hơn vạch đất, phải > 0'),
              open(os.path.join(D, 'kiem-v3-so-do.json'), 'w'), ensure_ascii=False, indent=1)
    for n in so:
        for r in so[n]: print(n, r)
