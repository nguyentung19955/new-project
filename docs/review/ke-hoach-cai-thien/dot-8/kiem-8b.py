"""Kiểm Đợt 8b (bỏ ô dấu Linh Khí trên đầu quái → viền hệ quanh thanh máu nhỏ). Dùng lại khung của kiem.py, không chạy bộ test dài.
Chạy từ thư mục gốc repo:  python3 docs/review/ke-hoach-cai-thien/dot-8/kiem-8b.py <THƯ_MỤC_GAME_TRƯỚC>
(THƯ_MỤC_GAME_TRƯỚC: thư mục game/ của bản ngay trước 8b, ví dụ một git worktree.)
Làm 3 việc: (1) chụp 844×390 phòng có 3 quái mang dấu 3 hệ, trước/sau → anh/8b-truoc-sau.png; (2) cờ G.DAU_LINH_KHI_VIEN = false ở bản mới
so với bản trước: đếm điểm ảnh khác (cảnh 3 hệ + 4 cảnh của Đợt 8); (3) bot chơi ải 1, so nhật ký sát thương với bản trước. Ghi ket-qua-8b.json."""
import hashlib, io, json, os, sys
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
TRUOC = sys.argv[1]
sys.argv = sys.argv[:1] + ['8b']
import kiem as K

VIEN = [None]  # None: để mặc định của bản game; True / False: ép cờ G.DAU_LINH_KHI_VIEN
_mo = K.mo
def mo(pw, root, man='dt844', co=None):
    b, pg, errs = _mo(pw, root, man, co)
    if VIEN[0] is not None: pg.evaluate('(v) => { G.DAU_LINH_KHI_VIEN = v; }', VIEN[0])
    return b, pg, errs
K.mo = mo

# Phòng thường, quái đứng yên (choáng): 3 quái mang dấu Lửa / Độc / Băng, 1 quái vừa trúng đòn không mang dấu, 1 quái còn nguyên, 1 quái giáp mang dấu Băng.
K.CANH['ba-he'] = r"""() => { T.dau(); _gieo(41); const { S, W, P } = T.room(0, 2, { seed: 7, save: { branch: 'fire', marks: 30 } }); T.useBot(false);
    W.waves = []; W.spawns = []; W.ents.length = 0; const g = W.geo; P.x = g.cx; P.y = g.cy + 44; P.inv = 1e9;
    const q = (vai, dx, dy, he, mau) => { const e = G.spawnEnemy(vai, g.cx + dx, g.cy + dy, { hpMult: 50 }); e.inside = true; e.st.stun = 1e9; e.hp = e.maxhp * mau; e.vx = e.vy = 0;
      if (he === 'fire') { e.st.fire = 1e6; e.st.last = 'fire'; } if (he === 'poison') { e.st.poisonN = 2; e.st.poisonT = 1e6; e.st.last = 'poison'; } if (he === 'ice') { e.st.iceN = 2; e.st.iceT = 1e6; e.st.last = 'ice'; } return e; };
    q('rusher', -96, -24, 'fire', 0.7); q('rusher', -32, -24, 'poison', 0.45); q('rusher', 32, -24, 'ice', 0.85); q('rusher', 96, -24, null, 0.6); q('swarm', -110, 26, null, 1); q('shield', 110, 26, 'ice', 0.5);
    for (let f = 0; f < 40; f++) { T.frame(1); P.hp = P.maxhp; for (const e of W.ents) e.st.stun = 1e9; }
    T.ve(); const cam = Math.round(W.cam || 0);
    return { quai: W.ents.map((e) => ({ vai: e.role, x: Math.round(e.x - cam), y: Math.round(e.y), dau: G.lk.markEl(e) })), oDau: G.lk.badgeList.length, co: G.DAU_LINH_KHI_VIEN }; }"""


def khac(a, c):
    return sum(1 for v in ImageChops.difference(a, c).convert('L').getdata() if v)


def main():
    kq = {}
    with sync_playwright() as pw:
        # (1) trước / sau
        VIEN[0] = None
        a, ra, ea, _ = K.chup(pw, TRUOC, 'dt844', 'ba-he')
        c, rc, ec, _ = K.chup(pw, K.GAME, 'dt844', 'ba-he')
        kq['ba_he'] = {'truoc': ra, 'sau': rc, 'loi_js': ea + ec, 'diem_anh_khac_truoc_sau': khac(a, c)}
        # đếm điểm ảnh đúng 3 màu viền trong ảnh sau (bản trước phải là 0)
        mau = {'lua': (0xfe, 0x7d, 0x04), 'doc': (0x5a, 0xca, 0x02), 'bang': (0x32, 0xb0, 0xe9)}
        kq['ba_he']['diem_mau_vien'] = {t: {k: sum(1 for p in im.getdata() if p == v) for k, v in mau.items()} for t, im in (('truoc', a), ('sau', c))}
        # ghép ảnh: trên = toàn màn hình trước | sau; dưới = phóng to 3 lần vùng quái
        hop = ImageChops.difference(a, c).getbbox() or (0, 0, 844, 390)
        x0, y0, x1, y1 = max(0, hop[0] - 30), max(0, hop[1] - 24), min(844, hop[2] + 30), min(390, hop[3] + 70)
        z = 3 if (x1 - x0) * 3 <= 844 * 2 + 8 else 2
        za, zc = [im.crop((x0, y0, x1, y1)).resize(((x1 - x0) * z, (y1 - y0) * z), Image.NEAREST) for im in (a, c)]
        W = max(844 * 2 + 8, za.width); out = Image.new('RGB', (W, 20 + 390 + 20 + za.height * 2 + 8), (18, 18, 18)); d = ImageDraw.Draw(out)
        d.text((6, 4), 'TRUOC (o dau 9x9 tren dau quai)', fill=(255, 255, 255)); d.text((858, 4), 'SAU (vien mau he quanh thanh mau)', fill=(255, 255, 255))
        out.paste(a, (0, 20)); out.paste(c, (852, 20)); d.text((6, 414), 'Phong to x%d: tren = TRUOC, duoi = SAU  (quai tu trai sang: Lua, Doc, Bang, khong dau)' % z, fill=(255, 255, 255))
        out.paste(za, ((W - za.width) // 2, 430)); out.paste(zc, ((W - zc.width) // 2, 438 + za.height))
        out.save(os.path.join(K.ANH, '8b-truoc-sau.png'), optimize=True)
        # (2) cờ tắt = bản trước
        kq['co_tat_diem_anh_khac'] = {}
        for ten in ['ba-he', 'dong', 'tinh-anh', 'trum', 'huong-dan']:
            VIEN[0] = None; a, _, ea, _ = K.chup(pw, TRUOC, 'dt844', ten)
            VIEN[0] = False; c, _, ec, _ = K.chup(pw, K.GAME, 'dt844', ten)
            kq['co_tat_diem_anh_khac'][ten] = khac(a, c); print(ten, 'cờ tắt, điểm ảnh khác:', kq['co_tat_diem_anh_khac'][ten], ea, ec)
    # (3) bot ải 1
    VIEN[0] = None
    K.ARGS = [TRUOC]; ta, nka = K.bot()
    K.ARGS = []; tc, nkc = K.bot()
    kq['bot_ai1'] = {'truoc': ta, 'sau': tc, 'nhat_ky_trung': nka == nkc}
    json.dump(kq, open(os.path.join(K.DAY, 'ket-qua-8b.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps(kq, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    try: main()
    finally:
        for m in K.MAY: m.terminate()
