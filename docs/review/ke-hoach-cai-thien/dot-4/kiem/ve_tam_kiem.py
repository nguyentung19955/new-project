# Dựng tấm ảnh thử cho 6 trang còn lại (lưới theo lô đầu tiên của từng trang), dùng lại 2 hình mẫu rương + bàn thờ làm "hình trong ô".
import json, re, sys, random
from PIL import Image, ImageFilter
OUT = sys.argv[1]; P = json.load(open('prompt.json', encoding='utf-8'))
R, B = Image.open(OUT + '/mau-ruong-goc.png'), Image.open(OUT + '/mau-ban-tho-goc.png')
NEN = {'HỒNG TÍM': (255, 0, 255), 'XANH LÁ': (0, 255, 0), 'XANH DƯƠNG': (0, 0, 255)}
def tam(ten, cot, hang, so=None, W=1536, H=1024):
    pr = list(P[ten]['goc']['pr'].values())[0]
    nen = NEN[re.search(r'Nền trơn MỘT MÀU (HỒNG TÍM|XANH LÁ|XANH DƯƠNG)', pr).group(1)]
    if so == 'prompt': so = [int(x) for x in re.findall(r'hàng \d+ [^,]*?ĐÚNG (\d+) khung', pr)]; assert len(so) == hang, (ten, so)
    im = Image.new('RGBA', (W, H), nen + (255,)); cw, ch = W // cot, H // hang
    for r in range(hang):
        for c in range(cot):
            if so and c >= so[r]: continue
            s = (B if (r + c) % 2 else R)
            k = max(1, int(min(cw * 0.62 / s.width, ch * 0.66 / s.height)))
            to = s.resize((s.width * k, s.height * k), Image.NEAREST)
            im.alpha_composite(to, (c * cw + (cw - to.width) // 2, r * ch + ch - to.height - int(ch * 0.12)))
    im = im.convert('RGB').filter(ImageFilter.GaussianBlur(0.5)); random.seed(7); p = im.load()
    for y in range(H):
        for x in range(W):
            if p[x, y] == nen: continue
            r_, g, b = p[x, y]; n = random.randint(-4, 4)
            p[x, y] = (max(0, min(255, int(r_ * 1.05 + 5) + n)), max(0, min(255, int(g * 1.01 + 2) + n)), max(0, min(255, int(b * 0.93) + n)))
    im.save(f'{OUT}/kiem-{ten}.png'); print(ten, cot, hang, so, nen)
tam('tach-lang', 3, 2); tam('tach-giao-dien', 4, 3); tam('tach-do', 5, 2)
tam('tach-quai', 8, 6, 'prompt'); tam('tach-anh-hung', 8, 7, [6, 6, 4, 6, 4, 8, 6]); tam('tach-hieu-ung', 6, 1, W=1536, H=400)
