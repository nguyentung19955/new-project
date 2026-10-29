#!/usr/bin/env python3
"""NHẬP SPRITE PIXELLAB → art/huong-moi/lam-pixel/pixellab/<ten>.png + mục "<ten>" trong lam-pixellab.json.

Đầu vào (chọn MỘT):
  • thư mục PNG từng khung (PixelLab "tải từng frame"): thu-muc/ chứa a-0.png, a-1.png… (sắp theo SỐ trong tên)
  • một sheet PNG (PixelLab "export sheet"): --o 96x96 (cỡ ô) [--so-hinh N] [--cot C]  (một hàng hoặc nhiều hàng, đọc trái→phải, trên→dưới)
  • một danh sách file PNG: nhap_pixellab.py chay a.png b.png c.png

Script làm:
  1. Đọc mọi khung (cùng cỡ ô). Ô trống (không có điểm nào) bị bỏ, có báo.
  2. CẮT NỀN THỪA BẰNG MỘT KHUNG CHUNG cho mọi hình (hợp các khung bao, thêm --le điểm) → mọi hình dịch CÙNG một lượng,
     KHÔNG căn từng hình theo khung bao riêng → nhân vật không rung, chân giữ chung một neo.
  3. Neo chân (pivot): y = hàng dưới cùng có điểm trong MỌI hình + 1 (đường đất), x = giữa ô gốc PixelLab (PixelLab đặt nhân vật
     giữa canvas) – đổi bằng --neo-x chan (giữa hai ủng, trung vị các hình chạm đất) hoặc --neo X,Y (số điểm trong ô GỐC).
  4. Dò MẮT (tuỳ chọn, mặc định bật, --khong-mat để tắt): chỉ những điểm SÁNG nằm LỌT trong vùng mặt đen ở nửa trên hình
     (không phải mọi màu xanh – lưỡi nĩa/kim loại bạc giữ nguyên). Ghi toạ độ từng hình + bảng đổi màu → trang game tô hổ phách.
  5. Ghi sheet một hàng pixellab/<ten>.png (1 điểm = 1 điểm, PNG gốc, không co giãn) và cập nhật lam-pixellab.json
     (giữ nguyên các clip khác, bảng trạng thái và hình tạm).

Ví dụ (chạy từ thư mục tieng-vong-cuoi-cung/):
  python3 art/huong-moi/lam-pixel/code/nhap_pixellab.py chay art/huong-moi/lam-pixel/pixellab/chay-*.png --quang 132
  python3 art/huong-moi/lam-pixel/code/nhap_pixellab.py chem1 ~/Downloads/slash1/ --ms 60 --manh 2,3
  python3 art/huong-moi/lam-pixel/code/nhap_pixellab.py dung ~/Downloads/idle.png --o 64x64 --fps 6 --lap
Tuỳ chọn thời gian (chỉ cho clip KHÔNG gắn đòn – đứng, chết…; đòn đánh luôn chia theo pha của game):
  --ms 100 hoặc --ms 80,80,120,…  · --fps 10 · --lap / --khong-lap · --quang 132 (phát theo quãng đường px logic/vòng – chạy)
  --manh 2,3 = khung "mạnh" (pha ra đòn) · --pha 0-1:2-3:4-5 = lấy đà : ra đòn : hồi (chỉ số khung) – thiếu thì suy từ --manh
  --ti-le 2 = px logic mỗi điểm sprite (Lam 54 điểm × 2 = 108 px logic) · --doc = chỉ in kết quả, không ghi file
"""
import argparse, glob, json, os, re, statistics, sys
from PIL import Image

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
THU_MUC = os.path.join(GOC, 'pixellab')
JSON = os.path.join(THU_MUC, 'lam-pixellab.json')

# hổ phách (bảng màu palette.json): sáng → tối
HO_PHACH = ['#ffe08a', '#f2a33a', '#a85b1f', '#7b4c22']

MAC_DINH = {
    'phien_ban': 1,
    'ghi_chu': 'Do code/nhap_pixellab.py ghi + sửa tay được. Đường dẫn ảnh tính từ thư mục file này. ti_le = px logic / điểm sprite. '
               'chan = điểm chân [x, y] trong ô (mặt phải; quay trái game tự lật quanh chan). Xem game/thu-pixellab/GHI-CHU.md.',
    'ti_le_mac_dinh': 2,
    'clip': {},
    'trang_thai': {},
}


def so_trong_ten(p):
    s = re.findall(r'\d+', os.path.basename(p))
    return (int(s[-1]) if s else 0, p)


def doc_khung(a):
    """→ danh sách ảnh RGBA cùng cỡ."""
    if a.sheet:
        im = Image.open(a.sheet).convert('RGBA')
        if not a.o:
            sys.exit('Sheet cần --o RỘNGxCAO (cỡ một ô), vd --o 96x96')
        w, h = a.o
        cot = a.cot or im.width // w
        hang = im.height // h
        ds = [im.crop((c * w, r * h, c * w + w, r * h + h)) for r in range(hang) for c in range(cot)]
        if a.so_hinh:
            ds = ds[:a.so_hinh]
        return ds
    files = []
    for x in a.nguon:
        if os.path.isdir(x):
            files += [os.path.join(x, f) for f in os.listdir(x) if f.lower().endswith('.png')]
        else:
            files += glob.glob(x) or [x]
    files = [f for f in sorted(set(files), key=so_trong_ten) if not os.path.basename(f).startswith('.')]
    if len(files) == 1 and not a.so_hinh and not a.o:
        sys.exit('Chỉ có 1 file: nếu là sheet thì thêm --o RỘNGxCAO (vd --o 96x96)')
    if len(files) == 1:
        a.sheet = files[0]
        return doc_khung(a)
    ds = [Image.open(f).convert('RGBA') for f in files]
    co = {d.size for d in ds}
    if len(co) != 1:
        sys.exit('Các khung khác cỡ: %s – PixelLab xuất mọi khung cùng cỡ; kiểm lại thư mục' % co)
    print('Đọc %d file:' % len(files), ', '.join(os.path.basename(f) for f in files))
    return ds


def do_mat(im):
    """Điểm mắt: sáng + lạnh, lọt trong vùng mặt đen (≥ 18/48 điểm quanh 7×7 là đen), ở 40 % trên của hình; lấy cụm lớn nhất + viền sáng sát cụm."""
    W, H = im.size
    px = im.load()
    bb = im.getbbox()
    if not bb:
        return []
    den = lambda x, y: 0 <= x < W and 0 <= y < H and px[x, y][3] > 0 and sum(px[x, y][:3]) < 45
    gioi_y = bb[1] + (bb[3] - bb[1]) * 0.40
    ung = set()
    for y in range(bb[1], int(gioi_y) + 1):
        for x in range(bb[0], bb[2]):
            p = px[x, y]
            if p[3] == 0 or sum(p[:3]) < 45:
                continue
            if (p[0] + p[1] + p[2]) / 3 < 110 or p[2] < p[0]:   # mắt cần đổi = sáng + lạnh (xanh/trắng); viền mũ ochre, mắt đã hổ phách → bỏ qua
                continue
            n = sum(den(x + dx, y + dy) for dx in range(-3, 4) for dy in range(-3, 4))
            if n >= 18:
                ung.add((x, y))
    if not ung:
        return []
    # cụm lớn nhất (8 hướng)
    cum, da = [], set()
    for d in ung:
        if d in da:
            continue
        st, c = [d], []
        da.add(d)
        while st:
            x, y = st.pop()
            c.append((x, y))
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    q = (x + dx, y + dy)
                    if q in ung and q not in da:
                        da.add(q)
                        st.append(q)
        cum.append(c)
    c = max(cum, key=len)
    # thêm điểm không đen sát cụm (ánh mắt mờ) nhưng vẫn trong vùng mặt
    them = set(c)
    for x, y in c:
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                q = (x + dx, y + dy)
                if q in them or not (0 <= q[0] < W and 0 <= q[1] < H):
                    continue
                p = px[q]
                if p[3] and sum(p[:3]) >= 45 and p[2] >= p[0] and sum(den(q[0] + i, q[1] + j) for i in (-1, 0, 1) for j in (-1, 0, 1)) >= 3:
                    them.add(q)
    return sorted(them)


def hex_(p):
    return '#%02x%02x%02x' % p[:3]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('ten', help='tên clip (= tên động tác: chay, dung, chem1, chem2, chem3, chem-len, chem-khong, pogo, luot, nhay, roi, tiep-dat, tuong, nhay-tuong, bi-danh, chet, vong)')
    ap.add_argument('nguon', nargs='*', help='thư mục PNG từng khung / các file PNG / một sheet')
    ap.add_argument('--sheet')
    ap.add_argument('--o', type=lambda s: tuple(int(v) for v in s.lower().split('x')))
    ap.add_argument('--so-hinh', type=int)
    ap.add_argument('--cot', type=int)
    ap.add_argument('--le', type=int, default=1, help='điểm trống chừa quanh khung chung (mặc định 1)')
    ap.add_argument('--neo-x', default='tam', help="tam (giữa ô gốc) | chan (giữa ủng) | số")
    ap.add_argument('--neo', help='X,Y điểm chân trong ô GỐC (ghi đè mọi cách tự tính)')
    ap.add_argument('--ms')
    ap.add_argument('--fps', type=float)
    ap.add_argument('--lap', dest='lap', action='store_true', default=None)
    ap.add_argument('--khong-lap', dest='lap', action='store_false')
    ap.add_argument('--quang', type=float, help='phát theo quãng đường: px logic mỗi vòng clip (chạy: 132)')
    ap.add_argument('--manh', help='chỉ số khung mạnh (pha ra đòn), vd 2,3')
    ap.add_argument('--pha', help='lấy đà:ra đòn:hồi, vd 0-1:2-3:4-5')
    ap.add_argument('--ti-le', type=float)
    ap.add_argument('--khong-mat', action='store_true')
    ap.add_argument('--doc', action='store_true', help='chỉ in, không ghi')
    a = ap.parse_args()
    if not a.nguon and not a.sheet:
        ap.error('thiếu nguồn PNG')

    ds = doc_khung(a)
    giu = [i for i, d in enumerate(ds) if d.getbbox()]
    if len(giu) < len(ds):
        print('Bỏ %d ô trống' % (len(ds) - len(giu)))
    ds = [ds[i] for i in giu]
    if not ds:
        sys.exit('Không có hình nào')
    W, H = ds[0].size
    bbs = [d.getbbox() for d in ds]
    x0 = max(0, min(b[0] for b in bbs) - a.le)
    y0 = max(0, min(b[1] for b in bbs) - a.le)
    x1 = min(W, max(b[2] for b in bbs) + a.le)
    y1 = min(H, max(b[3] for b in bbs))           # đáy: đúng đường đất (không chừa lề dưới)
    day = max(b[3] for b in bbs)                    # hàng dưới cùng có điểm + 1 = đường đất (ô gốc)
    if a.neo:
        nx, ny = (float(v) for v in a.neo.split(','))
    else:
        ny = day
        if a.neo_x == 'tam':
            nx = W / 2
        elif a.neo_x == 'chan':
            xs = []
            for d, b in zip(ds, bbs):
                if b[3] < day - 1:
                    continue                        # hình đang bay: bỏ
                al = d.split()[3]
                c = [x for y in range(day - 6, day) for x in range(W) if al.getpixel((x, y))]
                if c:
                    xs.append((min(c) + max(c)) / 2)
            nx = statistics.median(xs) if xs else W / 2
        else:
            nx = float(a.neo_x)
    cw, ch = x1 - x0, y1 - y0
    chan = [round(nx - x0, 1), round(ny - y0, 1)]

    sheet = Image.new('RGBA', (cw * len(ds), ch), (0, 0, 0, 0))
    mat_diem, doi = [], {}
    for i, d in enumerate(ds):
        o = d.crop((x0, y0, x1, y1))
        sheet.paste(o, (i * cw, 0))
        if not a.khong_mat:
            m = do_mat(o)
            mat_diem.append([[x, y] for x, y in m])
            px = o.load()
            for x, y in m:
                doi.setdefault(hex_(px[x, y]), None)
    if doi:   # gán hổ phách theo độ sáng: sáng nhất → vàng nhạt
        mau = sorted(doi, key=lambda h: -sum(int(h[i:i + 2], 16) for i in (1, 3, 5)))
        for h in mau:
            s = sum(int(h[i:i + 2], 16) for i in (1, 3, 5)) / 3
            doi[h] = HO_PHACH[0] if s >= 205 else HO_PHACH[1] if s >= 165 else HO_PHACH[2] if s >= 110 else HO_PHACH[3]

    clip = {'anh': a.ten + '.png', 'xep': 'hang', 'o': [cw, ch], 'so_hinh': len(ds), 'chan': chan}
    if a.ti_le:
        clip['ti_le'] = a.ti_le
    if a.quang:
        clip['phat'] = 'quang_duong'
        clip['quang'] = a.quang
    if a.ms:
        v = [int(x) for x in a.ms.split(',')]
        clip['ms'] = v if len(v) > 1 else v[0]
    elif a.fps:
        clip['fps'] = a.fps
    if a.lap is not None:
        clip['lap'] = a.lap
    if a.manh:
        clip['manh'] = [int(x) for x in a.manh.split(',')]
    if a.pha:
        p = []
        for doan in a.pha.split(':'):
            if not doan:
                p.append([])
                continue
            u, _, v = doan.partition('-')
            p.append(list(range(int(u), int(v or u) + 1)))
        clip['pha'] = {'layda': p[0], 'rado': p[1] if len(p) > 1 else [], 'hoi': p[2] if len(p) > 2 else []}
    if mat_diem and any(mat_diem):
        clip['mat'] = {'diem': mat_diem, 'doi': doi}
    clip['nguon_goc'] = {'o_goc': [W, H], 'cat_tu': [x0, y0], 'neo_goc': [nx, ny]}

    print('Clip "%s": %d hình, ô gốc %dx%d → cắt chung %dx%d (từ %d,%d), chân %s' % (a.ten, len(ds), W, H, cw, ch, x0, y0, chan))
    if 'mat' in clip:
        print('  mắt: %s điểm/hình, đổi màu %s' % ([len(m) for m in mat_diem], doi))
    else:
        print('  không dò thấy mắt (hoặc --khong-mat)')
    if a.doc:
        print(json.dumps(clip, ensure_ascii=False))
        return
    os.makedirs(THU_MUC, exist_ok=True)
    sheet.save(os.path.join(THU_MUC, a.ten + '.png'))
    J = json.load(open(JSON, encoding='utf-8')) if os.path.exists(JSON) else json.loads(json.dumps(MAC_DINH))
    J.setdefault('clip', {})[a.ten] = clip
    with open(JSON, 'w', encoding='utf-8') as f:
        f.write(ghi_json(J))
    print('Đã ghi pixellab/%s.png + lam-pixellab.json' % a.ten)


def ghi_json(J):
    """JSON dễ đọc: mỗi clip một khối, mảng số ngắn nằm trên một dòng."""
    s = json.dumps(J, ensure_ascii=False, indent=1)
    s = re.sub(r'\[\s+([-\d.,\s]+?)\s+\]', lambda m: '[' + re.sub(r'\s+', ' ', m.group(1)).replace(' ,', ',') + ']', s)
    s = re.sub(r'\[\s+("[^"\n]*"(?:,\s+"[^"\n]*")*)\s+\]', lambda m: '[' + re.sub(r',\s+', ', ', m.group(1)) + ']', s)
    s = re.sub(r'\[\s+(\[[-\d., ]+\](?:,\s+\[[-\d., ]+\])*)\s+\]', lambda m: '[' + re.sub(r',\s+\[', ', [', m.group(1)) + ']', s)
    return s + '\n'


if __name__ == '__main__':
    main()
