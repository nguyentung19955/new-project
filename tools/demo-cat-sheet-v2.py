# Sprite sheet v2 (đặc tả DCDW): khung 128x128, chân tại (64,110). Dùng chung tỉ lệ cho mọi động tác của 1 tướng (lưu scale.json).
import sys, json, os, numpy as np
from PIL import Image
sys.path.insert(0, '/root/tools'); from sheet import frames, chan_x
F, FY = 128, 110
def ghep(frs, scale, out, float_y=None):
    sh = Image.new('RGBA', (F * len(frs), F), (0, 0, 0, 0))
    for i, fr in enumerate(frs):
        fr2 = fr.resize((max(1, round(fr.width * scale)), max(1, round(fr.height * scale))), Image.LANCZOS)
        x = int(round(F / 2 - chan_x(fr) * scale)) if float_y is None else int(round(F / 2 - fr2.width / 2))
        y = int(round(FY - fr2.height)) if float_y is None else int(round(float_y - fr2.height / 2))
        cl, ct = max(0, -x), max(0, -y)
        fr3 = fr2.crop((cl, ct, min(fr2.width, F - x), min(fr2.height, F - y)))
        tile = Image.new('RGBA', (F, F), (0, 0, 0, 0)); tile.alpha_composite(fr3, (max(0, x), max(0, y)))
        sh.alpha_composite(tile, (i * F, 0))
    sh.save(out, optimize=True)
if __name__ == '__main__':
    # sheet2.py id anim raw n outdir [targetH] [float]
    hid, anim, raw, n, od = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), sys.argv[5]
    tH = float(sys.argv[6]) if len(sys.argv) > 6 else 96
    flo = len(sys.argv) > 7 and sys.argv[7] == 'float'
    sj = od + '/scale.json'; S = json.load(open(sj)) if os.path.exists(sj) else {}
    frs = frames(raw, n)
    med = float(np.median([f.height for f in frs]))
    if anim == 'idle' or hid not in S: S[hid] = {'s_per_h': tH, 'idle_med': med}
    scale = S[hid]['s_per_h'] / S[hid]['idle_med'] if anim != 'idle' else tH / med
    if anim == 'idle': S[hid]['idle_med'] = med
    json.dump(S, open(sj, 'w'), indent=1)
    ghep(frs, scale, f'{od}/{hid}_{anim}.png', 58 if flo else None)
    print(hid, anim, len(frs), [f.size for f in frs][:3], round(scale, 3))
