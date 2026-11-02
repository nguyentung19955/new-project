# Tạo file yêu cầu + ảnh tham chiếu muot-2. Chạy: python3 tools/muot-2/tao-yeu-cau.py tools/muot-2/ds-quai.py (CẨN THẬN: ghi đè trạng thái file md)
# Tạo yêu cầu ảnh muot-2: md + ảnh tham chiếu
import os, json, sys
from PIL import Image, ImageDraw
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUT = R + '/docs/yeu-cau-anh/muot-2'
os.makedirs(OUT, exist_ok=True)
QJ = json.load(open(R + '/game/thu-mat-na/quai.json'))['loai']
MAG = (255, 0, 255, 255)
S = 3

def frames(d):
    return sorted(f for f in os.listdir(R + '/' + d) if f.startswith('f') and f.endswith('.png'))

def window(d, pad=10):
    bb = None; W = H = 0
    for f in frames(d):
        im = Image.open(R + '/' + d + '/' + f); W, H = im.size
        b = im.getbbox()
        if b: bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    return (max(0, bb[0]-pad), max(0, bb[1]-pad), min(W, bb[2]+pad), min(H, bb[3]+pad)), (W, H)

def dashed(dr, x0, y0, x1, y1, col=(30, 30, 30, 255), seg=8):
    for x in range(x0, x1, seg*2):
        dr.line([(x, y0), (min(x+seg, x1), y0)], fill=col, width=2); dr.line([(x, y1), (min(x+seg, x1), y1)], fill=col, width=2)
    for y in range(y0, y1, seg*2):
        dr.line([(x0, y), (x0, min(y+seg, y1))], fill=col, width=2); dr.line([(x1, y), (x1, min(y+seg, y1))], fill=col, width=2)

def ref(it):
    d = it['dir']; win = it['win']
    x0, y0, x1, y1 = win; w, h = (x1-x0)*S, (y1-y0)*S
    G = 12
    cells = it['cells']
    img = Image.new('RGBA', (len(cells)*(w+G)+G, h+2*G), MAG)
    dr = ImageDraw.Draw(img)
    ax, ay = it['chan']
    for i, c in enumerate(cells):
        X = G + i*(w+G); Y = G
        if c is None:
            dashed(dr, X, Y, X+w-1, Y+h-1)
            px, py = X+(ax-x0)*S, Y+(ay-y0)*S   # dấu + tại neo chân
            dr.line([(px-6, py), (px+6, py)], fill=(30, 30, 30, 255), width=2); dr.line([(px, py-6), (px, py+6)], fill=(30, 30, 30, 255), width=2)
        else:
            src, k = c if isinstance(c, tuple) else (d, c)
            im = Image.open(R + '/' + src + '/f%02d.png' % k).convert('RGBA').crop(win).resize((w, h), Image.NEAREST)
            img.alpha_composite(im, (X, Y))
    img.convert('RGB').save(OUT + '/%s-%s-thamchieu.png' % (it['so'], it['ten']))
    return img.size

def md(it, size):
    x0, y0, x1, y1 = it['win']; W, H = it['o']
    cellsdesc = []
    for c in it['cells']:
        if c is None: cellsdesc.append('[Ô TRỐNG]')
        else:
            src, k = c if isinstance(c, tuple) else (it['dir'], c)
            cellsdesc.append(('F%d' % k) if src == it['dir'] else ('%s/f%02d' % (src.split('/')[-1], k)))
    L = []
    L.append('# %s – %s (%s)' % (it['so'], it['tieu_de'], it['uu_tien']))
    L.append('- **Trạng thái:** CHỜ')
    L.append('- **Clip:** `%s` – thư mục art gốc `%s/` (%d khung `fNN.png`, ô %d×%d, quay %s, neo chân %s)' % (it['clip'], it['dir'], len(frames(it['dir'])), W, H, it['huong'], list(it['chan'])))
    L.append('- **Việc cần vẽ:** ' + it['viec'])
    L.append('- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** ' + it['dang'])
    if it.get('chi_tiet'):
        for s in it['chi_tiet']: L.append('  - ' + s)
    L.append('- **Ảnh tham chiếu:** `%s-%s-thamchieu.png` (%d×%d) = ghép ngang %s, cắt cửa sổ (x0=%d, y0=%d, rộng %d, cao %d) của ô %d×%d rồi phóng ×%d nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.' % (it['so'], it['ten'], size[0], size[1], ' | '.join(cellsdesc), x0, y0, x1-x0, y1-y0, W, H, S))
    L.append('- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**')
    L.append('  ```')
    L.append('  ' + it['prompt'] + ' Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.')
    L.append('  ```')
    L.append('- **Lưu ảnh ra:** ' + ', '.join('`art/muot-2/%s/%s`' % (it['ten'], f) for f in it['ra']) + ' – mỗi tệp PNG RGBA đúng **%d×%d** (cỡ ô gốc), nền trong suốt, chân ở **%s** như khung gốc, quay %s. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷%d, nearest) theo cửa sổ rộng %d × cao %d, dán vào ô %d×%d trong suốt tại (%d,%d). Lưu kèm ảnh nguồn `art/muot-2/%s/nguon-chatgpt.png`.' % (W, H, list(it['chan']), it['huong'], S, x1-x0, y1-y0, W, H, x0, y0, it['ten']))
    L.append('- **Thứ tự mới của clip sau khi lắp:** ' + it['thu_tu'])
    L.append('- **ms mới cho cả clip:** ' + it['ms'])
    if it.get('su_kien'): L.append('- **Sự kiện dời chỉ số (phiên lắp tự làm):** ' + it['su_kien'])
    L.append('- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.')
    L.append('- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.')
    open(OUT + '/%s-%s.md' % (it['so'], it['ten']), 'w').write('\n'.join(L) + '\n')

def item(**k):
    if k.get('loai') == 'q':
        q = k.pop('q'); st = k.pop('st')
        k['dir'] = 'art/quai-moi/%s/%s' % (q, st); k['chan'] = tuple(QJ[q]['chan']); k['huong'] = 'TRÁI'
        k['win'] = (0, 0) + Image.open(R + '/' + k['dir'] + '/f00.png').size; k['o'] = k['win'][2:]
        k['clip'] = k.get('clip', 'quai.json → loai.%s.hinh.%s' % (q, st))
    else:
        k['chan'] = (128, 172); k['huong'] = 'PHẢI'; k['win'], k['o'] = window(k['dir'])
        k['clip'] = k.get('clip', 'nhan-vat.json → %s' % k.pop('vitri'))
    k['cells'] = [tuple(c) if isinstance(c, list) else c for c in k['cells']]
    size = ref(k); md(k, size); print(k['so'], k['ten'], size)

exec(open(sys.argv[1]).read())
