"""Ảnh duyệt TRƯỚC/SAU cho quái chi tiết hơn: mỗi con một hàng, trái là bản cũ, phải là bản mới;
mỗi bên có hình cỡ thật (như trong game) và hình phóng 3 lần, thêm vài khung cử động (thở, báo đòn, ra đòn) ở cỡ thật.
Chạy: python3 tests/quai_truoc_sau.py THƯ_MỤC_GAME_CŨ ẢNH_RA id1,id2,...
THƯ_MỤC_GAME_CŨ: bản game trước khi sửa (vd. một git worktree của nhánh gốc)."""
import base64, io, os, sys
from PIL import Image, ImageDraw, ImageFont
from quai_lib import sync_playwright, ROOT

K = 3
KHUNG = [('idle', 0), ('idle', .5), ('tele', .45), ('atk', .12), ('hit', .5)]
JS = r"""([id, k, khung]) => {
  const MA = G.monsterArt, q = MA.list.find((z) => z.id === id), bg = q.vung === 'rung' ? '#3d3a26' : q.vung === 'bien' ? '#3b4250' : '#4a4442';
  const cw = Math.max(q.w, 30) + 24, ch = Math.max(q.h, 30) + 18;
  const cv = document.createElement('canvas'); cv.width = cw * (k + khung.length); cv.height = ch * k; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height);
  c.save(); c.scale(k, k); MA.draw(c, id, cw / 2, ch - 8, { anim: 'idle', t: 0, face: -1, bao: false }); c.restore();
  khung.forEach((f, i) => { MA.draw(c, id, cw * k + cw * i + cw / 2, ch * k / 2 + ch / 2 - 8, { anim: f[0], t: f[1] * MA.dur(id, f[0]), face: -1, bao: false }); });
  return [cv.toDataURL('image/png'), q.ten];
}"""


def ve(root, ids, pw):
    b = pw.chromium.launch(); pg = b.new_page()
    pg.goto('file://' + root + '/index.html'); pg.wait_for_function('window.G && G.monsterArt && G.monsterArt.list.length')
    out = {}
    for id in ids:
        u, ten = pg.evaluate(JS, [id, K, KHUNG])
        out[id] = (Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB'), ten)
    b.close()
    return out


if __name__ == '__main__':
    goc, ra, ids = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
    with sync_playwright() as pw:
        A = ve(goc, ids, pw); B = ve(ROOT, ids, pw)
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
    except Exception: font = ImageFont.load_default()
    rows = []
    for id in ids:
        a, ten = A[id]; bb, _ = B[id]
        w = a.width + bb.width + 30; h = max(a.height, bb.height) + 24
        im = Image.new('RGB', (w, h), (18, 14, 22)); d = ImageDraw.Draw(im)
        d.text((6, 3), ten + '   (trái: TRƯỚC  |  phải: SAU;  mỗi bên: phóng 3 lần + 5 khung cỡ thật: thở, thở, báo đòn, ra đòn, trúng đòn)', fill=(255, 220, 140), font=font)
        im.paste(a, (0, 24)); im.paste(bb, (a.width + 30, 24))
        d.rectangle([a.width + 12, 30, a.width + 16, h - 6], fill=(255, 210, 63))
        rows.append(im)
    W = max(r.width for r in rows); H = sum(r.height for r in rows)
    out = Image.new('RGB', (W, H), (18, 14, 22)); y = 0
    for r in rows: out.paste(r, (0, y)); y += r.height
    out.save(ra, optimize=True); print('đã lưu', ra, out.size)
