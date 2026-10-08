# Ghép ảnh so TRƯỚC (bản trên nhánh chính, git show) | SAU (assets/pixel hiện tại), phóng to nearest — claude/ve-lai-pixel.
# python3 tools/pixel/ve-lai/truoc-sau.py <ra.png> <tỉ lệ> <nhóm/mã> [<nhóm/mã> …]
import sys, io, json, subprocess
from PIL import Image, ImageDraw
REF = 'origin/claude/mobile-tower-defense-game-k5oxzo'
out, sc, codes = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
def load(code, old):
    p = f'assets/pixel/{code}'
    if old:
        b = subprocess.run(['git', 'show', f'{REF}:{p}.png'], capture_output=True).stdout
        j = json.loads(subprocess.run(['git', 'show', f'{REF}:{p}.json'], capture_output=True).stdout or b'{}')
        if not b: return None
        im = Image.open(io.BytesIO(b))
    else:
        im = Image.open(p + '.png'); j = json.load(open(p + '.json'))
    im = im.convert('RGBA')
    if j.get('w'): im = im.crop((0, 0, j['w'], j['h']))
    return im
rows = []
for c in codes:
    a, b = load(c, True), load(c, False)
    rows.append((c, a, b))
W = max(max((a.width if a else 0), b.width) for _, a, b in rows) * sc
H = max(b.height for _, a, b in rows) * sc
S = Image.new('RGBA', (W * 2 + 30, (H + 22) * len(rows) + 4), (52, 50, 58, 255)); d = ImageDraw.Draw(S)
for i, (c, a, b) in enumerate(rows):
    y = i * (H + 22) + 18
    d.text((10, y - 15), c + '   TRUOC | SAU', fill=(255, 255, 255, 255))
    if a: S.alpha_composite(a.resize((a.width * sc, a.height * sc), Image.NEAREST), (10, y))
    S.alpha_composite(b.resize((b.width * sc, b.height * sc), Image.NEAREST), (W + 20, y))
S.save(out)
