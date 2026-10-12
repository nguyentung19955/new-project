"""Kiểm BẢNG NẮM TAY cung/giáo/búa (SC.TAY_DON) của thân bộ trên bản HAI TỆP (như web): so bản trước (LK_URL_TRUOC, ví dụ bản
6f71aa9 dựng ở worktree khác, cổng 8791) với bản sau (LK_URL, cổng 8790). Mỗi bên phục vụ game/dist bằng srv2.py.
Vẽ em bé <key> mặc đủ bộ <bộ> (+ mũ, lưng, bùa, cánh), 4 vũ khí × các trạng thái. Đo: hàng đang dùng, vũ khí đè đĩa mặt, đáy/đỉnh thân (nhảy cỡ), vũ khí rời thân, nguồn điểm nắm tay kiếm.
Chạy: python3 kiem.py <key> <bộ> <thư mục ra>"""
import sys, os, json, io, base64
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'full-audit', 'A-nhan-vat', 'kiem')))
import lib
from lib import *
URL_SAU = lib.URL; URL_TRUOC = os.environ.get('LK_URL_TRUOC', 'http://localhost:8791/linh-khi-nhe.html?cloud=0')
from PIL import Image, ImageDraw
KEY, BO, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(OUT, exist_ok=True)
BOJ = None if BO == 'goc' else BO  # 'goc': thân gốc (để so)
Q = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'full-audit', 'A-nhan-vat', 'kiem', 'quet_em_be.py')).read()
JS = Q.split('JS = r"""', 1)[1].split('"""', 1)[0]
JS = JS.replace("poses = A.tuThe(wt);", "poses = A.tuThe(wt).filter(p => CHON.test(p[0]));").replace(
    "([key, bo, wt, face, gear, S, chup]) => {", "([key, bo, wt, face, gear, S, chup, chon]) => { const CHON = new RegExp(chon);").replace(
    "const e = A.ve(cF, oF)", "oB._wt = wt; oG._wt = wt; const e = A.ve(cF, oF)")
# Thân không vũ khí (để lấy hiệu ảnh vũ khí / đồ) phải đứng CÙNG khung với thân cầm vũ khí: hàng đòn chọn theo o.weapon.type,
# nên ô không vũ khí mượn loại vũ khí qua o._wt (chỉ trong bài kiểm, không đổi game).
BOC = """() => { const SC = G.spriteCustom; if (SC._bocWt) return; SC._bocWt = 1; const c0 = SC.chonEmBe;
  SC.chonEmBe = (sp, o) => (o && !o.weapon && o._wt ? c0(sp, Object.assign({}, o, { weapon: { type: o._wt } })) : c0(sp, o)); }"""
CHON = r'^(đứng 0$|chạy [04]$|chém|đánh|chạy\+đánh|giữ|chưởng|trúng 0.18)'
GEAR = {'hat': 'non_la', 'back': 'ho_lo', 'hand': 'bua_hut', 'wing': {'kind': 'lua', 'level': 3}}
TAY = """(k) => { const SC = G.spriteCustom, A = window.AUD; const o = A.oCua(k, A.outfit(%s, {}), 'sword', 1, A.tuThe('sword')[0]);
  const sp = SC.cuaEmBe(k, o); const r = { ma: sp.ma, don: sp.donMa || null, hang: Object.keys(sp.dt) };
  if (sp.dt.atk_sword) r.tay = [0,1,2,3,4,5].map(i => { const d = SC.diemKhung(sp, k, 'atk_sword', i, null); return d && [d.nguon.tay_truoc, d.diem.tay_truoc]; });
  return r; }""" % json.dumps(BOJ)
def chay(url):
    lib.URL = url; kq, anh = {}, {}
    with sync_playwright() as p:
        b, pg, errs = lib.mo(p)
        pg.add_script_tag(path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'full-audit', 'A-nhan-vat', 'kiem', 'tu_the.js'))
        pg.evaluate(BOC); kq['tay'] = pg.evaluate(TAY, KEY)
        for wt in ['sword', 'bow', 'spear', 'hammer']:
            r = pg.evaluate(JS, [KEY, BOJ, wt, 1, GEAR, 4, True, CHON])
            kq[wt] = r['out']; anh[wt] = (Image.open(io.BytesIO(base64.b64decode(r['png'].split(',')[1]))).convert('RGB'), r['nhan'])
        kq['pageerror'] = errs
        b.close()
    return kq, anh
def tam(anh, ten):
    rows = [(wt, im, nh) for wt, (im, nh) in anh.items()]
    Wm = max(im.width for _, im, _ in rows); C = Image.new('RGB', (Wm, sum(im.height + 18 for _, im, _ in rows)), (30, 36, 44)); dr = ImageDraw.Draw(C); y = 0
    for wt, im, nh in rows:
        dr.text((4, y + 3), wt, fill=(255, 255, 0))
        for j, n in enumerate(nh): dr.text((j * 256 + 60, y + 3), n, fill=(200, 220, 255))
        C.paste(im, (0, y + 18)); y += im.height + 18
    C.save(os.path.join(OUT, ten), optimize=True)
    small = C.resize((C.width // 4, C.height // 4), Image.NEAREST)  # cỡ thật trong game (×1)
    small.save(os.path.join(OUT, ten.replace('.png', '-x1.png')))
sau, aSau = chay(URL_SAU)
truoc, aTruoc = chay(URL_TRUOC)
tam(aSau, 'sau-%s-%s.png' % (KEY, BO)); tam(aTruoc, 'truoc-%s-%s.png' % (KEY, BO))
json.dump({'sau': sau, 'truoc': truoc}, open(os.path.join(OUT, 'do-%s-%s.json' % (KEY, BO)), 'w'), ensure_ascii=False, indent=0)
print('tay kiếm (sau):', json.dumps(sau['tay'], ensure_ascii=False))
for ten, kq in (('TRƯỚC', truoc), ('SAU', sau)):
    print('==', ten, 'pageerror', kq['pageerror'])
    for wt in ['sword', 'bow', 'spear', 'hammer']:
        hang = sorted({r.get('hang', '?').split(':')[0] for r in kq[wt]})
        mat = [(r['tt'], r['mat']['vk'], r['mat']['tong']) for r in kq[wt] if r.get('mat') and r['mat']['tong'] and r['mat']['vk'] / r['mat']['tong'] > 0.25]
        day = sorted({r['than']['day'] for r in kq[wt] if r.get('than')}); dinh = [r['than']['dinh'] for r in kq[wt] if r.get('than')]
        xa = [r['tt'] for r in kq[wt] if r.get('vk_kc') is not None and r['vk_kc'] > 2]
        loi = [r for r in kq[wt] if r.get('loi')]
        print(' %-6s hàng %s | che mặt >25%%: %s | đáy %s đỉnh %s..%s | vk rời thân: %s | lỗi %d' % (wt, hang, mat or 'không', day, min(dinh), max(dinh), xa or 'không', len(loi)))
