#!/usr/bin/env python3
"""Ghép demo.html thành MỘT file tự chứa để đăng artifact / chơi offline, nhúng vào TV.NHUNG:
  - lam    : Lam mới, clip CHẠY NHANH rig-v4 (mặc định) = JSON + PNG CÙNG lấy từ art/modular/lam-moi/rig-v4/sprite/
  - lam_v3 : clip cũ rig-v3 (dùng khi mở ?clip=v3) = JSON + PNG từ art/modular/lam-moi/rig-v3/sprite/
           Cả hai nhúng PNG NGUYÊN BẢN (không nén lại, không đổi cỡ) – kiểm ảnh đúng 2142×970 = co_sheet trong JSON và đúng
           phien_ban_clip, sai thì dừng; + dáng nghỉ anim/lam-nghi-v4-2x.png (v4, không chóp) / lam-nghi-2x.png (v3), cùng ô/neo, PNG nguyên bản.
  - qbr    : QUÁI + BOSS vẽ từ mảnh = runtime/quai-boss/quai-boss-rig.json + 14 PNG mảnh (PNG nguyên bản, data URI; kiểm cỡ = co_anh
             trong JSON). QBR.nap(…, TV.NHUNG.qbr) đọc thẳng data URI. KHÔNG nhúng sheet boss 2x (không dùng).
           runtime/quai-boss-runtime.js được chèn INLINE thay cho thẻ <script src="runtime/quai-boss-runtime.js">.
  - lc     : LÀNG CHUÔNG (art/the-gioi-moi/lang-chuong/): nen/nen.json + lang-xa/giua/gan/tien-canh.png, gach/gach-atlas.* + rong-re.png,
             do-vat/do-vat.json + 7 PNG (cổng 3 trạng thái, công tắc lên/ấn, bình máu, mảnh chuông). Kiểm cỡ ảnh = cỡ trong JSON.
             4 ảnh nền nhúng WebP q92 (giữ bản build < 15 MB); atlas gạch + đồ vật PNG nguyên bản.
  - giu    : điểm lưu + đèn lồng (anim/lang-chuong-giu.*, tách từ the-gioi.png) – PNG nguyên bản.
  (anim/the-gioi.* KHÔNG còn nhúng: demo.html không dùng nữa.)
  - lam_hd : hoạt ảnh HÀNH ĐỘNG Lam (art/modular/lam-moi/hanh-dong/sprite/lam-hanh-dong-2x.*) – PNG nguyên bản, kiểm co_sheet
  - hu     : hiệu ứng ảnh gen (art/hieu-ung/sprite/<ten>-2x.*) – PNG nguyên bản; thiếu ảnh nào thì bỏ qua (game vẽ khung TẠM)
  - tt     : TRANG TRÍ ĐỊA HÌNH v3 (art/the-gioi-moi/cong-lang-v3/): cong-lang-v3.json + CHỈ các atlas PNG mà 3 file dữ liệu màn
             (runtime/trang-tri/*.js) đang dùng (họ "-kho" không nhúng; kiểm cỡ = co_anh trong JSON). TT.nap(…, TV.NHUNG.tt) đọc thẳng
             data URI. runtime/trang-tri-dia-hinh.js + runtime/trang-tri/{cong-lang,san-chuong,phong-boss}.js chèn INLINE thay <script src>.
Nếu file build > 15 MB thì báo (không còn ảnh nào nén WebP).
Chạy: python3 build-demo.py  →  ra demo.build.html cạnh file này (không commit file build)."""
import base64, io, json, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'demo.html'), encoding='utf-8').read()
ANIM = os.path.join(HERE, 'anim')
LAM_DIRS = {'v4': os.path.normpath(os.path.join(HERE, '..', 'art', 'modular', 'lam-moi', 'rig-v4', 'sprite')),
            'v3': os.path.normpath(os.path.join(HERE, '..', 'art', 'modular', 'lam-moi', 'rig-v3', 'sprite'))}
LAM_CO = (2142, 970)
LC = os.path.normpath(os.path.join(HERE, '..', 'art', 'the-gioi-moi', 'lang-chuong'))
LC_NEN = ['lang-xa.png', 'lang-giua.png', 'lang-gan.png', 'lang-tien-canh.png']
LC_DV = ['cong-dong', 'cong-mo', 'cong-chi-tru', 'cong-tac-len', 'cong-tac-an', 'binh-mau', 'manh-chuong']
QBR_DIR = os.path.join(HERE, 'runtime', 'quai-boss')
QBR_JS = os.path.join(HERE, 'runtime', 'quai-boss-runtime.js')
QBR_TAG = '<script src="runtime/quai-boss-runtime.js"></script>'
HD_DIR = os.path.normpath(os.path.join(HERE, '..', 'art', 'modular', 'lam-moi', 'hanh-dong', 'sprite'))
HU_DIR = os.path.normpath(os.path.join(HERE, '..', 'art', 'hieu-ung', 'sprite'))
HU_TEN = ['vet-chem', 'trung-don', 'bui', 'dash', 'truot-tuong', 'lam-bi-danh', 'vong', 'cong-huong', 'keng']
TT_DIR = os.path.normpath(os.path.join(HERE, '..', 'art', 'the-gioi-moi', 'cong-lang-v3'))
TT_JS = ['runtime/trang-tri-dia-hinh.js', 'runtime/trang-tri/cong-lang.js', 'runtime/trang-tri/san-chuong.js', 'runtime/trang-tri/phong-boss.js']


def trang_tri():
    """JSON atlas + các atlas mà dữ liệu 3 màn dùng. Tên ô dùng = mọi 'o:' trong runtime/trang-tri/*.js (họ 'x*' → mọi ô bắt đầu
    bằng 'x'), + bộ mép đất khi có giai:'mep', + ván treo / dây khi có giai:'van-day', + tiền cảnh khi có tien_canh."""
    import re
    meta = json.load(open(os.path.join(TT_DIR, 'cong-lang-v3.json'), encoding='utf-8'))
    js = ''.join(open(os.path.join(HERE, t), encoding='utf-8').read() for t in TT_JS[1:])
    ten = set()
    for o in re.findall(r"\bo:\s*'([^']+)'", js):
        if o.endswith('*'):
            ten.update(k for k in meta['o'] if k.startswith(o[:-1]))
        else:
            ten.add(o)
    if "giai: 'mep'" in js:
        ten.update('mep-%d-%s' % (b, v) for b in (1, 2) for v in ('trai', 'giua', 'phai'))
    if "giai: 'van-day'" in js:
        ten.update(k for k in meta['o'] if k.startswith('be-van-day') or k == 'day-treo')
    if 'tien_canh: [{' in js:
        ten.update(('tien-canh-trai', 'tien-canh-phai'))
    thieu = [t for t in ten if t not in meta['o']]
    if thieu:
        raise SystemExit('LỖI: dữ liệu trang trí dùng ô không có trong atlas: %s' % thieu)
    tep = sorted({meta['o'][t]['anh'] for t in ten})
    anh = {}
    for t in tep:
        co = next(a for a in meta['anh'].values() if a['tep'] == t)
        p = os.path.join(TT_DIR, t); kiem_co(p, co['co_anh']); anh[t] = png_uri(p)
    return {'json': meta, 'anh': anh}


def nhung_tt(src):
    for rel in TT_JS:
        tag = '<script src="%s"></script>' % rel
        assert src.count(tag) == 1, 'demo.html phải nạp %s đúng 1 lần' % rel
        js = open(os.path.join(HERE, rel), encoding='utf-8').read()
        assert '</script' not in js
        src = src.replace(tag, '<script>/* %s (nhúng) */\n%s\n</script>' % (rel, js))
    return src


def hanh_dong():
    meta = json.load(open(os.path.join(HD_DIR, 'lam-hanh-dong-2x.json'), encoding='utf-8'))
    p = os.path.join(HD_DIR, meta['anh'])
    if list(Image.open(p).size) != meta['co_sheet']:
        raise SystemExit('LỖI: %s không đúng co_sheet %s' % (p, meta['co_sheet']))
    return {'json': meta, 'anh': png_uri(p)}


def hieu_ung():
    out = {}
    for t in HU_TEN:
        j = os.path.join(HU_DIR, t + '-2x.json')
        if not os.path.isfile(j):
            print('thiếu hiệu ứng', t, '→ game vẽ khung TẠM'); continue
        meta = json.load(open(j, encoding='utf-8'))
        out[t] = {'json': meta, 'anh': png_uri(os.path.join(HU_DIR, meta['anh']))}
    return out


def quai_boss():
    meta = json.load(open(os.path.join(QBR_DIR, 'quai-boss-rig.json'), encoding='utf-8'))
    anh = {}
    for nv in meta['nv'].values():
        for nd in nv['nut'].values():
            if not nd.get('anh'):
                continue
            p = os.path.join(QBR_DIR, nd['anh'])
            if list(Image.open(p).size) != list(nd['co_anh']):
                raise SystemExit('LỖI: %s không đúng co_anh %s' % (p, nd['co_anh']))
            anh[nd['anh']] = png_uri(p)
    if len(anh) != 14:
        raise SystemExit('LỖI: gói quái+boss phải có 14 mảnh PNG, thấy %d' % len(anh))
    return {'json': meta, 'anh': anh}


def webp(path, q):
    b = io.BytesIO()
    Image.open(path).convert('RGBA').save(b, 'WEBP', quality=q, method=6, alpha_quality=100)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()


def png_uri(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()


def kiem_co(p, co):
    if co and list(Image.open(p).size) != list(co):
        raise SystemExit('LỖI: %s cỡ %s ≠ %s trong JSON' % (p, Image.open(p).size, co))


def lang_chuong(_q=None):
    nen = json.load(open(os.path.join(LC, 'nen', 'nen.json'), encoding='utf-8'))
    gm = json.load(open(os.path.join(LC, 'gach', 'gach-atlas.json'), encoding='utf-8'))
    dv = json.load(open(os.path.join(LC, 'do-vat', 'do-vat.json'), encoding='utf-8'))
    an = {}
    for t in LC_NEN:
        p = os.path.join(LC, 'nen', t); kiem_co(p, nen['lop'][t]['co_anh']); an[t] = webp(p, 92)   # nền: WebP q92 (lớp đã làm tối + giảm chi tiết), giữ file build < 15 MB
    da = {}
    for t in LC_DV:
        p = os.path.join(LC, 'do-vat', t + '.png'); kiem_co(p, (dv['do_nho'].get(t) or dv['cong'])['co_anh']); da[t] = png_uri(p)
    tt = {}
    for v in gm.get('trang_tri', {}).values():          # mảng rễ trang trí (v2)
        p = os.path.join(LC, 'gach', v['anh']); kiem_co(p, v['co_anh']); tt[v['anh']] = png_uri(p)
    return {'nen': {'json': nen, 'anh': an}, 'gach': {'json': gm, 'anh': png_uri(os.path.join(LC, 'gach', gm['anh'])), 'tt': tt},
            'dv': {'json': dv, 'anh': da}}


def lam(clip):
    LAM_DIR = LAM_DIRS[clip]
    meta = json.load(open(os.path.join(LAM_DIR, 'lam-chay-2x.json'), encoding='utf-8'))
    if meta.get('phien_ban_clip', 'v3') != clip:
        raise SystemExit('LỖI: %s không phải clip %s' % (LAM_DIR, clip))
    p = os.path.join(LAM_DIR, meta['anh'])
    co = Image.open(p).size
    if co != LAM_CO or tuple(meta['co_sheet']) != co:
        raise SystemExit('LỖI: %s cỡ %s – phải đúng %s và trùng co_sheet %s trong JSON (PNG + JSON cùng từ rig-%s/sprite/)'
                         % (p, co, LAM_CO, meta['co_sheet'], clip))
    pn = os.path.join(ANIM, 'lam-nghi-v4-2x.png' if clip == 'v4' else 'lam-nghi-2x.png')   # v4: không chóp (27/10)
    if Image.open(pn).size != tuple(meta['co_khung']):
        raise SystemExit('LỖI: %s phải cùng cỡ ô %s – chạy lại tools/lam-dang-nghi.py' % (pn, meta['co_khung']))
    return {'json': meta, 'anh': png_uri(p), 'nghi': png_uri(pn)}


def khoi(q_sheet, L):
    nh = {'lam': L['v4'], 'lam_v3': L['v3'], 'lam_hd': hanh_dong(), 'hu': hieu_ung(), 'qbr': quai_boss()}
    nh['lc'] = lang_chuong(q_sheet)
    nh['tt'] = trang_tri(); TT_SO.extend(nh['tt']['anh'])
    gj = json.load(open(os.path.join(ANIM, 'lang-chuong-giu.json'), encoding='utf-8'))
    nh['giu'] = {'json': gj, 'anh': png_uri(os.path.join(ANIM, gj['image']))}
    js = json.dumps(nh, ensure_ascii=False, separators=(',', ':'))
    return '<script>/* tài nguyên nhúng sẵn */\nwindow.TV=window.TV||{};TV.NHUNG=' + js.replace('</', '<\\/') + ';\n</script>\n'


tag = "<script>\n'use strict';"
assert src.count(tag) == 1
assert src.count(QBR_TAG) == 1, 'demo.html phải nạp runtime/quai-boss-runtime.js đúng 1 lần'
rt = open(QBR_JS, encoding='utf-8').read()
assert '</script' not in rt
src = src.replace(QBR_TAG, '<script>/* runtime/quai-boss-runtime.js (nhúng) */\n' + rt + '\n</script>')
src = nhung_tt(src)
assert '<script src=' not in src, 'demo.html chỉ được nạp runtime quái+boss và trang trí bằng <script src> (đã nhúng ở trên)'
L = {c: lam(c) for c in ('v4', 'v3')}
TT_SO = []
out = src.replace(tag, khoi(None, L) + tag)
mb = len(out.encode('utf-8')) / 1024 / 1024
if mb > 15:
    print('CẢNH BÁO: bản build %.1f MB > 15 MB' % mb)
dst = os.path.join(HERE, 'demo.build.html')
open(dst, 'w', encoding='utf-8').write(out)
print('Đã ghi', dst, '%.2f MB' % mb, '· Lam v4 + v3 PNG nguyên bản %dx%d · 14 mảnh quái+boss PNG · Làng Chuông nền WebP q92 + gạch/đồ vật PNG · trang trí địa hình %d atlas PNG (mở ?clip=v3 để xem clip cũ)' % (LAM_CO + (len(TT_SO),)))
