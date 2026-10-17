"""LỬA BÁM THÂN — ảnh TRƯỚC (?luarong=0) | SAU (mặc định) trên Cua Đá, Mộc Tinh và vài quái thân bè / quái nhỏ (giữ lửa cũ), ×2.
Dùng công cụ đo dính quái (hieu-ung-dinh-quai/cong-cu: dq_common.open_game, dq_lib.js DQ.anhTT). Bot headless, không chơi thử.
Chạy (từ gốc repo, sau build):  python3 docs/review/ke-hoach-cai-thien/gan-anh-17-10-toi/cong-cu/lua_truoc_sau.py"""
import sys, os, io, base64
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(GOC, 'docs/review/ke-hoach-cai-thien/hieu-ung-dinh-quai/cong-cu'))
from dq_common import *  # noqa
from PIL import Image, ImageDraw, ImageFont
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
RA = os.path.join(GOC, 'docs/review/ke-hoach-cai-thien/gan-anh-17-10-toi/lua-truoc-sau.png')
CA = [('Cua Đá (trùm nhỏ)', 'cuaDa'), ('Mộc Tinh (trùm vùng)', 'moc'), ('Bọ Hung', 'boHung'), ('Cua', 'cua'), ('Heo Nanh (tinh anh)', 'heoNanh'),
      ('Heo Rừng Con', 'heoCon'), ('Ong Vò Vẽ (nhỏ — giữ lửa cũ)', 'ongVo'), ('Hoa Bào Tử (cao — giữ lửa cũ)', 'hoaBaoTu')]


def img(u): return Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB') if u else None


def chay(extra):
    out = []
    with sync_playwright() as pw:
        b, pg, errs = open_game(pw, extra)
        for ten, i in CA:
            q = "DQ.roster().find(x => x.id === '%s')" % i
            out.append(img(pg.evaluate("() => { const q = %s; return q ? DQ.anhTT(q, 'chay', -1, false) : null; }" % q)))
        print(extra or 'mặc định', 'lỗi JS', len(errs), flush=True)
        b.close()
    return out


A = chay('&luarong=0'); B = chay('')
W = max(x.width for x in A + B if x)
rows = []
for (ten, _i), a, b in zip(CA, A, B):
    h = max(a.height if a else 0, b.height if b else 0) + 24
    r = Image.new('RGB', (2 * W + 18, h), (18, 18, 22)); d = ImageDraw.Draw(r)
    d.text((6, 3), ten + '  —  TRƯỚC (trái, ?luarong=0) | SAU (phải)', fill=(255, 230, 120), font=FONT)
    if a: r.paste(a, (6, 22))
    if b: r.paste(b, (W + 12, 22))
    rows.append(r)
o = Image.new('RGB', (2 * W + 18, sum(r.height for r in rows)), (18, 18, 22)); y = 0
for r in rows: o.paste(r, (0, y)); y += r.height
o = o.resize((o.width, o.height), Image.NEAREST)
o.save(RA, optimize=True)
print('ghi', RA, o.size)
