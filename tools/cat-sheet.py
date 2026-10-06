#!/usr/bin/env python3
"""Cắt ảnh ghép (sprite sheet) gen theo docs/PROMPT_GEMINI.md thành bộ ảnh game.

  python3 tools/cat-sheet.py <ảnh.png> <mã> [hero|enemy|boss]

- Tướng (3×2 ô, cỡ ảnh tuỳ ý): idle · wind · strike / cast · front · head → assets/packs/<mã>/
- Quái (3 ô): walk1 · walk2 · attack;  Boss (2×2): idle · attack · skill · rage
Nền hồng tím #FF00FF được xoá (kể cả viền ám hồng). Các dáng toàn thân cắt cùng chiều cao
và giữ nguyên đường chân để đổi dáng không bị nhảy; ảnh thu về cao tối đa 480 px (chân dung 240 px)
và nén thành PNG 256 màu (mỗi dáng chỉ vài chục KB).
"""
import os, sys
from PIL import Image

NAMES = {'hero': (3, 2, ['idle', 'wind', 'strike', 'cast', 'front', 'head']),
         'enemy': (3, 1, ['walk1', 'walk2', 'attack']),
         'boss': (2, 2, ['idle', 'attack', 'skill', 'rage']),
         'boss4': (2, 2, ['walk1', 'walk2', 'attack', 'rage'])}


def key_magenta(im):
    """Xoá nền hồng tím. Nền = điểm gần #FF00FF; chỉ dải 3 px sát nền mới được làm trong một phần
    và khử ám hồng (bên trong nhân vật giữ nguyên màu, kể cả áo tím)."""
    import numpy as np
    from PIL import ImageFilter
    a = np.asarray(im.convert('RGBA')).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = np.sqrt((255 - r) ** 2 + g ** 2 + (255 - b) ** 2)
    bg = d < 120
    mask = Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))
    edge = (np.asarray(mask) > 0) & ~bg
    m = np.minimum(r, b) - g                         # độ "hồng tím"
    alpha = a[..., 3].astype(np.float64)
    k = np.clip((m - 20) / 150.0, 0, 1)              # phần nền lẫn vào
    alpha = np.where(edge, alpha * (1 - k), alpha)
    alpha[bg] = 0
    ex = np.clip(m, 0, None)
    nr = np.where(edge, np.clip(r - ex, 0, 255), r)
    nb = np.where(edge, np.clip(b - ex, 0, 255), b)
    # viền quầng sáng còn ánh hồng: đổi về cam / vàng
    rim = edge & (nr > 150) & (nb > g + 8)
    nb = np.where(rim, g, nb)
    out = np.stack([nr, g, nb, alpha.round()], -1).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def wipe_labels(sheet, cols, rows):
    """Gemini hay ghi nhãn "[1] IDLE"… ở góc trên trái mỗi ô: tô chữ trắng ở đó về màu nền."""
    import numpy as np
    a = np.asarray(sheet.convert('RGB')).copy()
    H, W = a.shape[:2]
    cw, ch = W // cols, H // rows
    for rr in range(rows):
        for cc in range(cols):
            y0, x0 = rr * ch, cc * cw
            box = a[y0:y0 + int(ch * 0.1), x0:x0 + int(cw * 0.55)]
            sel = (box[..., 0] > 160) & (box[..., 2] > 160)     # chữ trắng + viền hồng của chữ
            box[sel] = (255, 0, 255)
    return Image.fromarray(a, 'RGB')


def drop_lines(im):
    """Xoá vạch kẻ chạy gần suốt bề ngang / dọc ô (vạch đáy, vạch ngăn ô Gemini vẽ thêm)."""
    import numpy as np
    a = np.asarray(im).copy()
    op = a[..., 3] > 20
    H, W = op.shape
    dark = (a[..., :3].astype(int).sum(-1) < 200) & op       # vạch kẻ là nét tối
    rows = (op.sum(1) > 0.85 * W) & (dark.sum(1) > 0.8 * W)
    cols = (op.sum(0) > 0.85 * H) & (dark.sum(0) > 0.8 * H)
    a[rows, :, 3] = 0
    a[:, cols, 3] = 0
    return Image.fromarray(a, 'RGBA')


def key_border(im):
    """Nền không phải hồng tím (ví dụ ô caro giả trong suốt): lấy các màu ở viền ảnh làm màu nền,
    loang từ mép vào và xoá mọi điểm gần màu nền liền với mép."""
    import numpy as np
    from collections import deque
    a = np.asarray(im.convert('RGB')).astype(np.int32)
    H, W = a.shape[:2]
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    q = (border // 16)
    keys, cnt = np.unique(q, axis=0, return_counts=True)
    order = np.argsort(-cnt); tot = cnt.sum(); acc = 0; pal = []
    for i in order:
        pal.append(keys[i] * 16 + 8); acc += cnt[i]
        if acc > 0.97 * tot or len(pal) >= 6: break
    pal = np.array(pal)
    dist = np.min(np.sqrt(((a[:, :, None, :] - pal[None, None]) ** 2).sum(-1)), axis=-1)
    like = dist < 34
    bg = np.zeros((H, W), bool)
    dq = deque([(y, x) for y in range(H) for x in (0, W - 1)] + [(y, x) for x in range(W) for y in (0, H - 1)])
    for y, x in dq: bg[y, x] = like[y, x]
    dq = deque([(y, x) for y, x in dq if bg[y, x]])
    while dq:
        y, x = dq.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < H and 0 <= nx < W and not bg[ny, nx] and like[ny, nx]:
                bg[ny, nx] = True; dq.append((ny, nx))
    out = np.dstack([a, np.where(bg, 0, 255)]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def drop_specks(im, min_px=40):
    """Xoá mảnh rời nhỏ (sót chữ nhãn, vạch ô, nhiễu) để khung cắt không bị kéo rộng."""
    import numpy as np
    from collections import deque
    a = np.asarray(im).copy()
    m = a[..., 3] > 20
    H, W = m.shape
    seen = np.zeros_like(m)
    for y in range(H):
        for x in range(W):
            if m[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True; comp = []
                while q:
                    cy, cx = q.popleft(); comp.append((cy, cx))
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
                if len(comp) < min_px:
                    for cy, cx in comp: a[cy, cx, 3] = 0
    a[..., 3][(a[..., 3] <= 20)] = 0
    return Image.fromarray(a, 'RGBA')


def cut_lines(sheet, n, size, axis):
    """Ranh giới ô: mặc định chia đều; nếu hình lấn qua ranh giới (ảnh không có vạch ngăn),
    dời đường cắt tới khe trống gần nhất (trong khoảng ±25% bề rộng ô)."""
    import numpy as np
    al = np.asarray(sheet)[..., 3] > 20
    prof = al.sum(axis=axis)                      # số điểm có hình trên mỗi cột (axis=0) / hàng (axis=1)
    step = size / n
    lines = [0]
    for i in range(1, n):
        c = int(round(i * step)); w = int(step * 0.25)
        full = al.shape[axis]                     # chiều dài một cột / hàng
        near = prof[max(0, c - 4):c + 5]
        if prof[c] == 0 or near.max() > 0.6 * full:   # khe trống sẵn, hoặc có vạch ngăn ô
            lines.append(c); continue
        zeros = [j for j in range(c - w, c + w + 1) if 0 <= j < len(prof) and prof[j] == 0]
        lines.append(min(zeros, key=lambda j: abs(j - c)) if zeros else c)
    lines.append(size)
    return lines


def save_light(im, path):
    """Lưu PNG nhẹ: bảng 256 màu có kênh trong suốt (ảnh nét phẳng gần như không đổi), nén tối đa."""
    q = im.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE)
    q.save(path, optimize=True)


def main():
    src, code = sys.argv[1], sys.argv[2]
    kind = sys.argv[3] if len(sys.argv) > 3 else 'hero'
    cols, rows, names = NAMES[kind]
    raw = Image.open(src).convert('RGB')
    r0, g0, b0 = raw.getpixel((raw.width // 2, 3))
    magenta = r0 > 180 and b0 > 180 and g0 < 90
    sheet = key_magenta(wipe_labels(raw, cols, rows)) if magenta else key_border(raw)
    # dấu ✦ của Gemini ở góc dưới phải ảnh
    import numpy as np
    sa = np.asarray(sheet).copy(); wm = max(40, raw.width // 24)
    sa[-wm:, -wm:, 3] = 0
    sheet = Image.fromarray(sa, 'RGBA')
    W, H = sheet.size
    cw, ch = W // cols, H // rows
    ins = 8   # bỏ vài px sát mép ô (Gemini hay vẽ vạch trắng ngăn ô)
    xs = cut_lines(sheet, cols, W, axis=0)
    ys = cut_lines(sheet, rows, H, axis=1)
    cells = [drop_specks(drop_lines(sheet.crop((xs[c] + ins, ys[r] + ins, xs[c + 1] - ins, ys[r + 1] - ins)))) for r in range(rows) for c in range(cols)]
    out = os.path.join(os.path.dirname(__file__), '..', 'assets', 'packs', code)
    os.makedirs(out, exist_ok=True)
    body = [i for i, n in enumerate(names) if n != 'head']
    boxes = {i: cells[i].getbbox() for i in range(len(cells))}
    # chung một khung dọc cho mọi dáng toàn thân: từ đỉnh cao nhất tới chân thấp nhất
    top = min(boxes[i][1] for i in body if boxes[i])
    bot = max(boxes[i][3] for i in body if boxes[i])
    for i, n in enumerate(names):
        bb = boxes[i]
        if not bb:
            print('ô trống:', n); continue
        if n == 'head':
            im = cells[i].crop(bb); hh = 240
        else:
            im = cells[i].crop((bb[0], top, bb[2], bot)); hh = 480
        hh = min(hh, im.height)          # không phóng to ảnh nhỏ
        k = hh / im.height
        im = im.resize((max(1, round(im.width * k)), hh), Image.LANCZOS)
        save_light(im, os.path.join(out, n + '.png'))
        print(n, im.size)
    if kind == 'hero':
        print(f"Thêm '{code}' vào HERO_PACK trong js/render.js để game dùng bộ ảnh này.")


if __name__ == '__main__':
    main()
