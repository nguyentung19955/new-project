#!/usr/bin/env python3
"""Đo khớp cho rig (16/10, phiên "Rig: sửa lệch vai + hở khớp + nhiều động tác").

Việc làm (chỉ ghi vào rig/, chỉ ĐỌC ảnh nguồn, sprite game, ../data.json, ../khop-nguon.json):
  1. rig/khop-chinh/chay.json — tệp chỉnh khớp hàng chạy, rig đọc ĐÈ lên ../data.json (không sửa data.json):
       a) dời mọi khớp +0,5 điểm ảnh (x và y): data.json đổi toạ độ nguồn → ô 96 bằng công thức tâm-điểm-ảnh-là-số-nguyên
          (tach_lop.doi_diem trừ 0,5), còn rig/trang dùng quy ước "x,5 = tâm điểm ảnh" (toạ độ cạnh) → mọi khớp lệch
          lên-trái 0,5đ;
       b) đánh lại tay trên ẢNH NGUỒN cao (03-chay-v4/khung-XX.png) các khớp tay TRƯỚC đặt sai: vai đặt ngoài bắp tay
          (trên thân hoặc ngoài hình), khuỷu/cổ tay khung 8, 11, 12.
  2. rig/dong-tac/<ten>/ cho dung, di, kiem_1 (lấy từ game/art/custom/zed-moi.sprite.json):
       sheet.png  — hàng thân của động tác, cắt ĐÚNG từ tấm game (ô 96, chân 48,90) = y như game vẽ thân;
       khop.json  — {"action","frameCount","fps","frames":[{"frame","joints"}],"source","hidden"}; khớp đánh tay trên ảnh nguồn
                    cao (khop-nguon.json cùng thư mục) rồi đổi sang ô 96 bằng đúng phép co/dời mà dung-zed-game.py đã dùng;
       soat.png   — que xương chồng lên sprite: ảnh nguồn cao (trái) và ô 96 phóng ×4 (phải), từng khung.
Kiểm: dựng lại hàng từ ảnh nguồn bằng phép co/dời tính được phải TRÙNG kênh alpha của tấm game (lệch → dừng mã 1).
Chạy:  python3 docs/thu-modular-96/rig/do-khop.py
"""
import base64, importlib.util, io, json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

RIG = os.path.dirname(os.path.abspath(__file__))
BO = os.path.dirname(RIG)
REPO = os.path.abspath(os.path.join(BO, '..', '..'))
MOI = os.path.join(REPO, 'docs', 'anh-goc', 'zed', 'moi')
GAME = os.path.join(REPO, 'game', 'art', 'custom', 'zed-moi.sprite.json')
O = 96
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14) if os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf') else None

spec = importlib.util.spec_from_file_location('dzg', os.path.join(REPO, 'docs', 'anh-goc', 'zed', 'dung-zed-game.py'))
G = importlib.util.module_from_spec(spec)
spec.loader.exec_module(G)          # chỉ nạp hàm, không chạy main()

TEN_NGUON = {'vaiT': 'shoulderFront', 'khuyuT': 'elbowFront', 'coTayT': 'wristFront', 'banTayT': 'handFront',
             'vaiS': 'shoulderBack', 'khuyuS': 'elbowBack', 'coTayS': 'wristBack', 'banTayS': 'handBack',
             'hongT': 'hipFront', 'goiT': 'kneeFront', 'coChanT': 'ankleFront', 'muiChanT': 'toeFront',
             'hongS': 'hipBack', 'goiS': 'kneeBack', 'coChanS': 'ankleBack', 'muiChanS': 'toeBack'}

loi = []
tam_game = json.load(open(GAME))
TAM = Image.open(io.BytesIO(base64.b64decode(tam_game['tam'].split(',')[1]))).convert('RGBA')


# ---------- phép co/dời từng khung (y hệt dung_than trong dung-zed-game.py) ----------
dung_fr = G.doc_dong('01-dung')
S = G.CAO_96 / float(np.median([f['bb'][3] - f['bb'][1] for f in dung_fr]))
DAU_DUNG = G.co_dau_hang(dung_fr)


def dat_hang(khoa, thu):
    """[(sx, sy, dx, dy)] từng khung + ảnh 96 dựng lại; kiểm trùng alpha với tấm game."""
    fr = G.doc_dong(thu)
    d = G.co_dau_hang(fr)
    sk = S * math.sqrt(DAU_DUNG[0] / d[0] * DAU_DUNG[1] / d[1])
    hang = tam_game['dong_tac'][khoa]['hang']
    out = []
    for i, f in enumerate(fr):
        im = f['im']
        nw, nh = max(1, round(im.width * sk)), max(1, round(im.height * sk))
        sx, sy = nw / im.width, nh / im.height
        dx = round(G.DAU_X - f['dau_x'] * sx) if khoa in G.NEO_DAU else round(G.CHAN[0] - f['chan'][0] * sx)
        dy = round(G.CHAN[1] - f['chan'][1] * sy)
        nho = im.resize((nw, nh), Image.BOX)
        bb = nho.getbbox()
        dx += max(0, -(dx + bb[0])) - max(0, dx + bb[2] - O)
        dy += max(0, -(dy + bb[1])) - max(0, dy + bb[3] - O)
        o = Image.new('RGBA', (O, O), (0, 0, 0, 0)); o.paste(nho, (dx, dy), nho)
        g = TAM.crop((i * O, hang * O, (i + 1) * O, (hang + 1) * O))
        lech = int(((np.array(o)[..., 3] > 0) != (np.array(g)[..., 3] > 0)).sum())
        if lech:
            loi.append('%s khung %d: dựng lại lệch %d điểm ảnh alpha so với tấm game' % (khoa, i + 1, lech))
        out.append(dict(sx=sx, sy=sy, dx=dx, dy=dy, im=im, o96=g))
    return out, sk


def doi(t, p, tam_diem=False):
    """toạ độ nguồn → ô 96, quy ước rig (toạ độ cạnh, x,5 = tâm điểm ảnh). tam_diem=True: p là chỉ số điểm ảnh nguồn."""
    c = 0.5 if tam_diem else 0.0
    return [round(t['dx'] + (p[0] + c) * t['sx'], 2), round(t['dy'] + (p[1] + c) * t['sy'], 2)]


# ---------- vẽ ảnh soát que chồng sprite ----------
CHAINS = [(['neck', 'hipCenter'], (0, 160, 0)), (['shoulderFront', 'elbowFront', 'wristFront', 'handFront'], (0, 229, 255)),
          (['shoulderBack', 'elbowBack', 'wristBack', 'handBack'], (255, 79, 216)),
          (['hipFront', 'kneeFront', 'ankleFront', 'toeFront'], (0, 90, 255)), (['hipBack', 'kneeBack', 'ankleBack', 'toeBack'], (255, 140, 0))]


def que(img, J, k, off=(0, 0), hidden=()):
    d = ImageDraw.Draw(img)
    for ch, col in CHAINS:
        P = [((J[n][0] - off[0]) * k, (J[n][1] - off[1]) * k) for n in ch if n in J]
        if len(P) > 1:
            d.line(P, fill=col, width=2)
        for n in ch:
            if n not in J:
                continue
            q = ((J[n][0] - off[0]) * k, (J[n][1] - off[1]) * k)
            r = 4
            if n in hidden:
                d.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], outline=col, width=2)
            else:
                d.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], fill=col, outline=(0, 0, 0))


def soat(path, ten, khung, nguon_khop, khop96, hidden):
    """mỗi khung 1 hàng: ảnh nguồn cao (cao 384) + ô 96 ×4 cắt quanh người, que xương chồng lên."""
    Z = 4
    rows = []
    for i, t in enumerate(khung):
        hs = set(hidden.get(str(i + 1), []))   # khoá hidden = số khung đếm từ 1
        im = t['im']
        k = 384 / im.height
        a = Image.new('RGBA', im.size, (201, 209, 216, 255)); a.alpha_composite(im)
        a = a.resize((round(im.width * k), 384), Image.NEAREST)
        que(a, nguon_khop[i], k, hidden=hs)
        b = Image.new('RGBA', (O, O), (201, 209, 216, 255)); b.alpha_composite(t['o96'])
        b = b.crop((8, 0, 88, O)).resize((80 * Z, O * Z), Image.NEAREST)
        que(b, khop96[i], Z, off=(8, 0), hidden=hs)
        r = Image.new('RGBA', (a.width + b.width + 16, 384 + 22), (40, 40, 40, 255))
        r.alpha_composite(a, (0, 22)); r.alpha_composite(b.crop((0, 0, b.width, 384)) if b.height > 384 else b, (a.width + 16, 22))
        ImageDraw.Draw(r).text((4, 3), '%s khung %d   trái: ảnh nguồn cao · phải: ô 96 ×4 (vòng rỗng = khớp bị che)' % (ten, i + 1),
                               fill=(255, 255, 255), font=FONT)
        rows.append(r)
    W = max(r.width for r in rows)
    out = Image.new('RGB', (W, sum(r.height for r in rows)), (40, 40, 40))
    y = 0
    for r in rows:
        out.paste(r, (0, y)); y += r.height
    out.save(path, optimize=True)


# ---------- 1. Tệp chỉnh hàng chạy ----------
CHINH_CHAY = {   # khung (1..12) -> {tên nguồn: [x, y] điểm ảnh ảnh nguồn}, lý do
    1: ({'vaiT': [80, 135]}, 'vai đặt ở mép thân, ngoài đầu trên bắp tay ~5đ nguồn'),
    2: ({'vaiT': [72, 137]}, 'vai đặt trên thân, cách đỉnh bắp tay trần ~13đ nguồn'),
    3: ({'vaiT': [60, 140]}, 'vai hơi cao'),
    4: ({'vaiT': [66, 140]}, 'vai lệch phải khỏi bắp tay'),
    5: ({'vaiT': [78, 136]}, 'vai ở mép đầu bắp tay'),
    6: ({'vaiT': [97, 139]}, 'vai ở mép trái bắp tay, đúng ra giữa đỉnh bắp tay'),
    7: ({'vaiT': [76, 142]}, 'vai đặt NGOÀI hình người (nền), cao hơn bắp tay ~7đ nguồn'),
    8: ({'vaiT': [70, 137], 'khuyuT': [55, 153]}, 'vai lệch phải khỏi bắp tay ~10đ nguồn'),
    9: ({'vaiT': [58, 142]}, 'vai hơi cao'),
    10: ({'vaiT': [70, 144]}, 'vai ở mép ngoài hình người'),
    11: ({'vaiT': [82, 138], 'coTayT': [72, 183], 'banTayT': [74, 190]}, 'vai hơi cao; cổ tay đặt trên cẳng tay, nắm tay thật thấp hơn ~9đ nguồn'),
    12: ({'vaiT': [98, 137], 'khuyuT': [77, 150], 'coTayT': [76, 169], 'banTayT': [79, 177]},
         'vai đặt giữa bắp tay (đúng ra đầu phải bắp tay); khuỷu/cổ tay đặt ngoài cẳng tay, cổ tay nằm ở nền'),
}


def chinh_chay():
    D = json.load(open(os.path.join(BO, 'data.json')))
    kn = json.load(open(os.path.join(BO, 'khop-nguon.json')))['khung']
    khung, sk = dat_hang('chay', '03-chay-v4')
    frames, src96, nguon_khop = [], [], []
    for i, f in enumerate(D['frames']):
        J = {n: [round(v[0] + 0.5, 2), round(v[1] + 0.5, 2)] for n, v in f['joints'].items()}
        sua, ly_do = CHINH_CHAY.get(i + 1, ({}, ''))
        doi_ = {}
        for tn, p in sua.items():
            n = TEN_NGUON[tn]
            doi_[n] = {'truoc': J[n], 'nguon_truoc': kn[i][tn], 'nguon_moi': p}
            J[n] = doi(khung[i], p, tam_diem=True)
            doi_[n]['sau'] = J[n]
        frames.append({'frame': f.get('frame', i), 'joints': J, 'sua': doi_, 'lyDo': ly_do})
        nk = {TEN_NGUON[a]: [v[0] + .5, v[1] + .5] for a, v in kn[i].items() if a in TEN_NGUON}
        for tn, p in sua.items():
            nk[TEN_NGUON[tn]] = [p[0] + .5, p[1] + .5]
        nk['neck'] = [(J['neck'][0] - khung[i]['dx']) / khung[i]['sx'], (J['neck'][1] - khung[i]['dy']) / khung[i]['sy']]
        nk['hipCenter'] = [(J['hipCenter'][0] - khung[i]['dx']) / khung[i]['sx'], (J['hipCenter'][1] - khung[i]['dy']) / khung[i]['sy']]
        nguon_khop.append(nk); src96.append(J)
    os.makedirs(os.path.join(RIG, 'khop-chinh'), exist_ok=True)
    out = {
        'about': 'Tệp chỉnh khớp hàng chạy cho rig. Rig đọc ../data.json rồi: (1) cộng offsetFix vào MỌI khớp, (2) thay các khớp '
                 'trong frames[].joints bằng giá trị ở đây. KHÔNG sửa ../data.json (phiên khác dùng). Tạo bằng rig/do-khop.py.',
        'offsetFix': [0.5, 0.5],
        'offsetFixWhy': 'data.json đổi toạ độ nguồn → ô 96 bằng dx + (p+0,5)·s − 0,5 (tâm điểm ảnh = số nguyên) nhưng ghi '
                        'quy ước "x,5 = tâm điểm ảnh"; rig/canvas dùng toạ độ cạnh nên cần +0,5 để khớp nằm đúng trên sprite.',
        'source': 'docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-XX.png (đánh tay lại, toạ độ chỉ số điểm ảnh nguồn)',
        'scale': [[round(t['sx'], 5), round(t['sy'], 5), t['dx'], t['dy']] for t in khung],
        'frames': frames,
    }
    json.dump(out, open(os.path.join(RIG, 'khop-chinh', 'chay.json'), 'w'), ensure_ascii=False, indent=1)
    soat(os.path.join(RIG, 'khop-chinh', 'soat-chay.png'), 'chay (đã chỉnh)', khung, nguon_khop, src96, {})
    n = sum(len(f['sua']) for f in frames)
    print('khop-chinh/chay.json: %d khớp đánh lại + dời 0,5đ toàn bộ' % n)


# ---------- 2. Động tác mới (khớp đánh tay trên ảnh nguồn cao) ----------
DONG = [('dung', '01-dung', 'Đứng'), ('di', '02-di', 'Đi'), ('kiem_1', '08-kiem-1-tp', 'Chém kiếm 1')]


def dong_tac(khoa, thu, ten):
    d = os.path.join(RIG, 'dong-tac', khoa)
    kn = json.load(open(os.path.join(d, 'khop-nguon.json'), encoding='utf-8'))
    khung, sk = dat_hang(khoa, thu)
    dt = tam_game['dong_tac'][khoa]
    N = dt['so']
    if len(kn['khung']) != N:
        loi.append('%s: khop-nguon có %d khung, game có %d' % (khoa, len(kn['khung']), N))
        return
    sheet = Image.new('RGBA', (O * N, O), (0, 0, 0, 0))
    frames, nguon_khop = [], []
    for i in range(N):
        sheet.alpha_composite(khung[i]['o96'], (i * O, 0))
        J0 = dict(kn['khung'][i])
        if 'hipCenter' not in J0:
            J0['hipCenter'] = [(J0['hipFront'][0] + J0['hipBack'][0]) / 2, (J0['hipFront'][1] + J0['hipBack'][1]) / 2]
        J = {n: doi(khung[i], p) for n, p in J0.items()}
        J['waist'] = [round((J['neck'][0] + J['hipCenter'][0]) / 2, 2), round(J['neck'][1] + (J['hipCenter'][1] - J['neck'][1]) * 0.6, 2)]
        frames.append({'frame': i, 'joints': J})
        nguon_khop.append(J0)
    hidden = {str(k): v for k, v in kn.get('hidden', {}).items()}
    sheet.save(os.path.join(d, 'sheet.png'))
    out = {'action': khoa, 'name': ten, 'frameCount': N, 'fps': round(N / dt['giay'], 2), 'loop': dt['lap'],
           'frames': frames,
           'source': {'gameSheet': 'game/art/custom/zed-moi.sprite.json, dong_tac.%s (hàng %d), cắt nguyên hàng thân ô 96' % (khoa, dt['hang']),
                      'jointsBy': 'đánh tay trên ảnh nguồn cao (khop-nguon.json), đổi sang ô 96 bằng phép co/dời của dung-zed-game.py',
                      'scale': [[round(t['sx'], 5), round(t['sy'], 5), t['dx'], t['dy']] for t in khung],
                      'note': kn.get('ghi_chu', '')},
           'hidden': hidden,
           'coordinateConvention': 'canh',
           'coordinateSystem': 'toạ độ CẠNH ô 96 (x,5 = tâm điểm ảnh, không trừ 0,5 như tach_lop.doi_diem), gốc trên-trái, chân (48,90)',
           'hiddenBase': 1}
    bc = json.load(open(os.path.join(MOI, thu + '-gif', 'bao-cao.json'), encoding='utf-8'))
    out['source']['highResFrames'] = 'docs/anh-goc/zed/moi/%s-gif/%s/khung-XX.png' % (thu, bc['hang'][0]['ten'])
    json.dump(out, open(os.path.join(d, 'khop.json'), 'w'), ensure_ascii=False, indent=1)
    soat(os.path.join(d, 'soat.png'), khoa, khung, nguon_khop, [f['joints'] for f in frames], hidden)
    print('dong-tac/%s: %d khung, s=%.4f, fps %.1f, khớp che: %s' % (khoa, N, sk, out['fps'], hidden or 'không'))


chinh_chay()
for k, t, n in DONG:
    dong_tac(k, t, n)
if loi:
    print('LỖI:', *loi, sep='\n  ')
    sys.exit(1)
print('xong đo khớp')
