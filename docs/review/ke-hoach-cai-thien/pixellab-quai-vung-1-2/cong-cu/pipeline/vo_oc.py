# hu-vo-oc (Ốc rút vỏ) dựng từ khung động tác "rút vào ấm" của chính nhân vật PixelLab Teapot Hermit (phát ngược: trốn kín → ló ra)
import json, glob, io, base64, sys
import numpy as np
from PIL import Image
sys.path.insert(0, '/tmp/claude-0/pl')
from hu_cu import tai
d, im = tai('hu-vo-oc'); fw, fh, so = d['khung_rong'], d['khung_cao'], d['so']; N = 2; W, H = fw * N, fh * N
gx, gy = d['goc'][0] * N, d['goc'][1] * N
fs = [Image.open(f).convert('RGBA') for f in sorted(glob.glob('anim/oc/tele-s1/[0-9][0-9].png'))]
idle = Image.open('anim/oc/idle-s1/00.png').convert('RGBA')
a = np.array(idle)[..., 3] > 0; ys, xs = np.where(a); by = ys.max(); fx = int(round((xs.min() + xs.max() + 1) / 2))
thu = [fs[i] for i in [5, 4, 3, 2, 1, 0]]
# khung lớn hơn tấm cũ cho vừa cái ấm (thân Teapot Hermit to hơn ốc cũ); điểm neo vẫn là giữa chân như cũ → vẽ đúng chỗ
W, H = fs[0].width + fs[0].width % 2, fs[0].height + fs[0].height % 2
gx, gy = int(fx - fx % 2), int((by + 1) - (by + 1) % 2)
fw, fh = W // N, H // N
tam = Image.new('RGBA', (W * so, H), (0, 0, 0, 0))
for i, f in enumerate(thu):
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.paste(f, (gx - fx, gy - (by + 1)), f); tam.paste(c, (i * W, 0))
b = io.BytesIO(); tam.save(b, 'PNG', optimize=True)
t = {k: v for k, v in d.items() if k not in ('tam', 'tam_n3', 'tam_n4', 'o_n3', 'o_n4', 'net_cao', 'net_cao_cua', 'ma', 'ten', 'net', 'vung')}
t.update({'khung_rong': fw, 'khung_cao': fh, 'goc': [gx // N, gy // N], 'ma': 'hu-pl-vo-oc', 'ten': 'PixelLab · ' + d['ten'] + ' (khung "rút vào ấm" của Teapot Hermit, phát ngược)', 'net': N, 'vung': 'bien', 'thay_cho': 'hu-vo-oc',
          'tam': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()})
if '--ghi' in sys.argv:
    json.dump(t, open('/home/claude/new-project/game/art/custom/hu-pl-vo-oc.sprite.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    tam.save('/home/claude/new-project/docs/anh-goc/pixellab-quai-vung-1-2/hieu-ung/hu-pl-vo-oc.png')
tam.save('vfxso/hu-vo-oc.png'); print(tam.size, fx, by, 'cat?', [f.getbbox() for f in thu][:2])
