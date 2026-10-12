#!/usr/bin/env python3
"""Đóng gói game thành hai tệp trong dist/ (chỉ dùng thư viện chuẩn của Python 3).

  dist/linh-khi.html  Một trang HTML đầy đủ, mọi mã JS nằm sẵn bên trong. Mở tệp là chơi.
  dist/artifact.html  Một MẢNH trang để dán vào dịch vụ lưu trữ tự bọc khung
                      <!doctype html><html><head>…</head><body> bên ngoài. Tệp này không có
                      doctype, <html>, <head>, <body>; thứ tự: <title>, <link> phông chữ,
                      <style>, phần thân, rồi một thẻ <script> duy nhất.

Thêm (Xưởng Sprite, tools/xuong-sprite):
  - Mọi tệp game/art/custom/*.sprite.json được nhúng vào bản đóng gói (hình tự vẽ của quái, em bé, người làng, đồ; js/sprite_custom.js đọc).
  - dist/xuong-sprite.html      công cụ tự vẽ sprite, một tệp tự chứa (đăng lên spiritblade.web.app/xuong-sprite.html)
  - dist/xuong-sprite-thu.html  bản game thử mà công cụ mở bên trong để xem quái mới đánh nhau thật
  - tools/xuong-sprite/index.html và thu.html: cùng công cụ để mở ngay trong thư mục repo

Đợt 10 (Q5) — chế độ 2 TỆP, ảnh tải sau (thêm, không đổi các tệp ở trên):
  python3 build.py --hai-tep   (hoặc biến môi trường LK_HAI_TEP=1) ghi THÊM hai tệp:
  - dist/linh-khi-nhe.html           cùng game, chỉ nhúng phần ảnh BẮT BUỘC cho màn chào / làng / ải 1 (hàm bat_buoc bên dưới)
  - dist/linh-khi-anh.<mã>.json      phần ảnh còn lại, js/sprite_custom.js tải sau khi màn chào đã vẽ (tên có mã nội dung để lưu đệm lâu).
                                     Thiếu hoặc lỗi tệp này: game vẫn chạy, phần ảnh thiếu vẽ bằng code như khi chưa có ảnh AI.
  Workflow đăng web dùng cặp tệp này. Không có cờ (hoặc có --mot-tep): xuất đúng như cũ, dist/linh-khi.html vẫn là MỘT tệp đủ ảnh, mở là chơi
  (các bài kiểm mở tệp trên máy, bản thử Xưởng Sprite và artifact.html luôn dùng bản một tệp).
  Số đo và lý do: docs/review/ke-hoach-cai-thien/dot-10/bao-cao.md

Tải nhanh (12/10) — trong chế độ 2 tệp, mặc định ẢNH RỜI (hàm anh_roi bên dưới):
  - dist/linh-khi-nhe.html   mã game + thông số hình, KHÔNG còn byte ảnh (≈0,5 MB nén)
  - dist/anh/*.png, *.webp    mỗi ảnh một tệp rời (WebP lossless khi nhỏ hơn; PNG luôn có để dự phòng), game tải theo ưu tiên
  Cờ quay lui: LK_ANH_ROI=0 (hoặc --anh-json) → cặp tệp Đợt 10 như trên; LK_WEBP=0 → chỉ PNG.
  Số đo: docs/review/ke-hoach-cai-thien/tai-nhanh/bao-cao.md

Cách dùng:  python3 build.py [--hai-tep | --mot-tep] [--anh-json]
"""
import base64
import glob
import hashlib
import io
import json
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, 'dist')
FONT_HOST = 'https://fonts.googleapis.com/'
# Thư viện Firebase (lưu mây, js/cloud.js) được tải lúc chạy, chỉ khi trang chạy trên web thật (không phải tệp trên máy,
# không trong khung xem trước). Đây là địa chỉ ngoài duy nhất được phép nằm trong mã JS ngoài phông chữ.
FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/'


def read(path):
    with open(os.path.join(ROOT, path), encoding='utf-8') as f:
        return f.read()


def one(pattern, text, what):
    m = re.search(pattern, text, re.S | re.I)
    if not m:
        sys.exit('Không tìm thấy ' + what + ' trong index.html')
    return m


def main():
    html = read('index.html')
    title = one(r'<title>.*?</title>', html, 'thẻ title').group(0)
    link = one(r'<link\b[^>]*rel="stylesheet"[^>]*>', html, 'thẻ link phông chữ').group(0)
    style = one(r'<style>.*?</style>', html, 'thẻ style').group(0)
    body = one(r'<body[^>]*>(.*?)</body>', html, 'phần thân').group(1)
    lang = one(r'<html[^>]*lang="([^"]+)"', html, 'ngôn ngữ trang').group(1)
    metas = re.findall(r'<meta\b[^>]*>', html, re.I)

    # Lấy danh sách tệp JS theo đúng thứ tự trong index.html rồi bỏ các thẻ script khỏi phần thân.
    srcs = re.findall(r'<script\s+src="([^"]+)"\s*>\s*</script>', body)
    markup = re.sub(r'<script\b.*?</script>\s*', '', body, flags=re.S).strip()
    if not srcs:
        sys.exit('index.html không nạp tệp JS nào')
    parts = []
    # Phiên bản = giờ đóng gói (giờ Việt Nam), hiện ở góc màn đăng nhập để biết bản mới đã lên web chưa.
    import datetime
    ver = 'lk-' + (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=7)).strftime('%Y.%m.%d-%H%M')
    parts.append('// ===== phiên bản đóng gói =====\n(window.G = window.G || {}).VERSION = ' + json.dumps(ver) + ';\n')
    custom = custom_sprites()

    def gom(nhung, dau='', gan='.customSpriteData = '):
        """Gom mọi tệp JS thành một thẻ script; nhung: các hình nhúng thẳng vào trang; dau: mã chèn ngay trước js/sprite_custom.js;
        gan: cách viết phép gán dữ liệu nhúng (trang nhẹ của chế độ 2 tệp viết khác đi, xem hai_tep)."""
        ps = list(parts)
        for src in srcs:
            if src.startswith(('http:', 'https:', '//')) or 'tests/' in src or 'bot' in os.path.basename(src):
                sys.exit('Không được đóng gói tệp này: ' + src)
            code = read(src)
            if src == 'js/sprite_custom.js' and nhung:
                data = json.dumps(nhung, ensure_ascii=False, separators=(',', ':'))
                ps.append('// ===== art/custom (hình tự vẽ, Xưởng Sprite) =====\n(window.G = window.G || {})' + gan + data + ';\n')
            if src == 'js/sprite_custom.js' and dau:
                ps.append(dau)
            ps.append('// ===== ' + src + ' =====\n' + code.rstrip() + '\n')
        # Không để chuỗi nào trong JS đóng thẻ script sớm.
        return safe_js('\n'.join(ps))

    def trang(js):
        return ('<!doctype html>\n<html lang="' + lang + '">\n<head>\n' + '\n'.join(metas) + '\n' + title + '\n' + link + '\n'
                + style + '\n</head>\n<body>\n' + markup + '\n<script>\n' + js + '</script>\n</body>\n</html>\n')

    js = gom(custom)
    script = '<script>\n' + js + '</script>'
    full = trang(js)
    frag = title + '\n' + link + '\n' + style + '\n' + markup + '\n' + script + '\n'

    check(full, frag, js)
    os.makedirs(DIST, exist_ok=True)
    for name, text in (('linh-khi.html', full), ('artifact.html', frag)):
        with open(os.path.join(DIST, name), 'w', encoding='utf-8', newline='\n') as f:
            f.write(text)
        print('Đã ghi dist/%s (%d KB, %d tệp JS)' % (name, len(text.encode('utf-8')) // 1024, len(srcs)))
    if custom:
        print('Đã nhúng %d hình tự vẽ: %s' % (len(custom), ', '.join(t['ma'] for t in custom)))
    hai_tep(custom, gom, trang, frag)
    build_tool(full)


# ---------- Đợt 10 (Q5): chế độ 2 tệp, ảnh tải sau ----------
TEN_NHE = 'linh-khi-nhe.html'
TEN_ANH = 'linh-khi-anh.%s.json'
# Trần dung lượng theo quyết định Q5: gói một tệp 15 MB; tách ảnh tải sau thì cả gói 20 MB. Tệp đầu (2 tệp) nên dưới 5 MB để tới màn chào nhanh.
# 11/10/2026 (chủ dự án duyệt): trần gói hai tệp nâng lên 25 MB, rồi 26 MB (21:43) vì phần ảnh tải sau không làm chậm màn chào; tệp đầu vẫn dưới 5 MB.
# 12/10 (tải nhanh): bản một tệp chỉ còn cho trang công cụ / GitHub Pages (nay 25 MB) → trần 30 MB, chỉ cảnh báo. Web chạy bản ảnh rời (trần ở anh_roi).
TRAN_MOT_TEP, TRAN_HAI_TEP, NEN_DUOI = 30 * 1024 * 1024, 26 * 1024 * 1024, 5 * 1024 * 1024
TRUM_VUNG = ('mocTinh', 'nguTinh', 'hoTinh')
# Hiệu ứng cơ bản (đòn đánh thường nào cũng dùng): vệt chém / đâm, mũi tên của bé, trúng đòn, chí mạng, vỡ giáp, quái chết.
HU_CO_BAN = re.compile(r'^hu-(chem|dam|trung|dan-ten|chi-mang|pha-giap|quai-chet)(-|$)')


HINH_LON_SAU = {'gd-lang-nen', 'gd-ban-do-vung', 'gd-khung-ban-do'}


def bat_buoc(t):
    """Hình phải nằm sẵn trong trang (màn chào, làng, ải 1 cần ngay). LUẬT ĐƠN GIẢN, mọi thứ không khớp đều là ẢNH TẢI SAU:
      1. hồ sơ ghép (ghep-*: chỉ số liệu)             2. em bé 4 thân gốc (không phải thân theo bộ trang phục, không phải tệp đòn theo vũ khí -don)
      3. người làng (nl-*)                             4. ảnh giao diện, làng, phòng (gd-*)
      5. vật phẩm (vp-*) và trang phục rời (tp-*): rất nhỏ, có ngay để em bé trong làng không đổi hình giữa chừng
      6. vũ khí khởi đầu: Kiếm Rèn (vk-sword-0*) và Cung Tre (vk-bow-3*), kể cả bản theo hệ (màn chào vẽ kiếm lửa)
      7. hiệu ứng cơ bản (HU_CO_BAN)
    Tải sau: mọi quái và trùm, thân theo bộ trang phục, vũ khí còn lại, hiệu ứng theo hệ / của quái / bảng kết quả, và mọi loại mới chưa có luật."""
    ma, d = t['ma'], t.get('doi_tuong')
    if ma in HINH_LON_SAU:  # 11/10 (chủ dự án duyệt): hình lớn không cần ở màn chào → tải sau; game vẽ code cho tới khi ảnh về
        return False
    if d in ('ghep', 'nguoi-lang', 'giao-dien', 'vat-pham', 'trang-phuc'):
        return True
    if d == 'em-be':  # tệp đòn theo vũ khí (-don) tải sau: game ghép vào thân khi về tới, chưa về thì đánh bằng hàng atk như cũ
        return not re.search(r'-(rung|bien|lau|don)$', ma)
    if d == 'vu-khi':
        return bool(re.match(r'^vk-(sword-0|bow-3)(-|$)', ma))
    if d == 'hieu-ung':
        return bool(HU_CO_BAN.match(ma))
    return False


def thu_tu_sau(t):
    """Thứ tự trong tệp tải sau (game nhận từng hình ngay khi dòng của nó về tới): thứ người mới chơi gặp trước thì đứng trước.
    0 quái Rừng già (nhỏ trước: quái thường rồi tinh anh, trùm nhỏ) · 1 hiệu ứng còn lại · 2 vũ khí còn lại · 3 trùm Rừng già ·
    4 Hang biển · 5 Lâu đài cổ · 6 mọi thứ khác. Cùng bậc: tệp nhỏ trước."""
    ma, d = t['ma'], t.get('doi_tuong')
    co = len(str(t.get('tam') or t.get('anh') or ''))
    quai = d not in ('hieu-ung', 'ghep', 'giao-dien', 'nguoi-lang', 'em-be') and d not in DO_LOAI
    trum = quai and ma.split('-')[0] in TRUM_VUNG
    vung = t.get('vung') if quai else None
    if vung == 'rung':
        bac = 3 if trum else 0
    elif d == 'hieu-ung':
        bac = 1
    elif d == 'vu-khi':
        bac = 2
    else:
        bac = {'bien': 4, 'laudai': 5}.get(vung, 6)
    return (bac, co, ma)


def hai_tep(custom, gom, trang, frag):
    """Ghi thêm cặp tệp của chế độ 2 tệp (khi có cờ), hoặc dọn cặp tệp cũ (khi xuất như cũ). Luôn in dung lượng so với trần Q5."""
    bat = ('--hai-tep' in sys.argv[1:] or os.environ.get('LK_HAI_TEP') == '1') and '--mot-tep' not in sys.argv[1:]
    mot = os.path.getsize(os.path.join(DIST, 'linh-khi.html'))
    print('Dung lượng một tệp: %.2f MB / trần %.0f MB (bản một tệp nay chỉ dùng cho trang công cụ; web chạy bản hai tệp)%s'
          % (mot / 1048576, TRAN_MOT_TEP / 1048576, '  ← VƯỢT TRẦN' if mot > TRAN_MOT_TEP else ''))
    for p in glob.glob(os.path.join(DIST, TEN_ANH % '*')) + [os.path.join(DIST, TEN_NHE)]:
        if os.path.isfile(p):
            os.remove(p)  # tên tệp ảnh đổi theo nội dung: không để bản cũ nằm lại
    if os.path.isdir(os.path.join(DIST, THU_MUC_ANH)):
        shutil.rmtree(os.path.join(DIST, THU_MUC_ANH))  # ảnh rời của lần đóng gói trước
    if not bat or not custom:
        return
    if anh_roi_bat():
        return anh_roi(custom, gom, trang, frag)
    truoc = [t for t in custom if bat_buoc(t)]
    sau = sorted((t for t in custom if not bat_buoc(t)), key=thu_tu_sau)
    if not sau:
        return
    # Tệp ảnh tải sau: một mảng JSON hợp lệ, MỖI HÌNH MỘT DÒNG, để game đọc dần từng dòng khi tệp đang về (js/sprite_custom.js).
    dong = [json.dumps(t, ensure_ascii=False, separators=(',', ':')).encode('utf-8') for t in sau]
    data = b'[\n' + b',\n'.join(dong) + b'\n]\n'
    ten = TEN_ANH % hashlib.sha256(data).hexdigest()[:12]
    # Phiên kiểm 3 pha trùm: vị trí byte [đầu, cuối) của dòng ảnh trùm vùng (pha 1 và dáng pha -p2 / -p3) trong tệp ảnh tải sau.
    # js/sprite_custom.js (SC.uuTienTrum) tải RIÊNG mấy dòng này (yêu cầu Range) khi người chơi vào một ải của vùng mà ảnh trùm chưa về.
    trum, vt = {}, 2
    for t, d in zip(sau, dong):
        if t.get('ma', '').split('-')[0] in TRUM_VUNG and t.get('doi_tuong') not in ('hieu-ung',):
            trum[t['ma']] = [vt, vt + len(d)]
        vt += len(d) + 2
    khai = ('// ===== ảnh tải sau (Đợt 10): tệp nằm cạnh trang, js/sprite_custom.js tải sau khi màn chào đã vẽ =====\n'
            '(window.G = window.G || {}).ANH_SAU = ' + json.dumps({'tep': ten, 'so': len(sau), 'byte': len(data), 'trum': trum}) + ';\n')
    # Trang nhẹ CỐ Ý không chứa chuỗi ".customSpriteData = ": các trang công cụ (tools/tach-quai, tach-ghep, tach-do) tìm đúng chuỗi đó trong
    # index.html để lấy MỌI hình đang có trong game. Trang nhẹ chỉ có một phần hình, nên để công cụ bỏ qua nó và đọc bản một tệp đủ ảnh
    # (linh-khi.html, workflow đăng kèm) như trước. Với game hai cách viết là một.
    js = gom(truoc, khai, "['customSpriteData'] = ")
    if '.customSpriteData = ' in js:
        sys.exit('Trang nhẹ còn chuỗi ".customSpriteData = ": công cụ sẽ đọc nhầm trang thiếu ảnh')
    nhe = trang(js)
    check(nhe, frag, js)
    with open(os.path.join(DIST, ten), 'wb') as f:
        f.write(data)
    write(os.path.join(DIST, TEN_NHE), nhe)
    n1, n2 = len(nhe.encode('utf-8')), len(data)
    print('Chế độ 2 tệp: dist/%s (%d KB, %d hình bắt buộc) + dist/%s (%d KB, %d hình tải sau)' % (TEN_NHE, n1 // 1024, len(truoc), ten, n2 // 1024, len(sau)))
    print('Dung lượng hai tệp: %.2f MB / trần 26 MB (Q5, nâng 11/10), còn %.2f MB%s; tệp đầu %.2f MB (nên dưới 5 MB)%s'
          % ((n1 + n2) / 1048576, (TRAN_HAI_TEP - n1 - n2) / 1048576, '  ← VƯỢT TRẦN' if n1 + n2 > TRAN_HAI_TEP else '', n1 / 1048576, '  ← TỆP ĐẦU QUÁ NẶNG, xem lại luật bat_buoc' if n1 > NEN_DUOI else ''))


# ---------- Tải nhanh (12/10): ẢNH RỜI, WebP, tải theo nhu cầu ----------
# Bật mặc định trong chế độ 2 tệp. Thay cho tệp linh-khi-anh.<mã>.json (ảnh base64 trong JSON), mỗi ảnh thành MỘT tệp rời:
#   dist/anh/<mã hình>.<mã nội dung>.png    luôn có (gói PNG dự phòng, đúng từng byte ảnh gốc trong .sprite.json)
#   dist/anh/<mã hình>.<mã nội dung>.webp   WebP lossless (Pillow lossless, method=6, exact) khi nhỏ hơn PNG; điểm ảnh y hệt (đã so lúc mã hoá)
# Trang chính dist/linh-khi-nhe.html chỉ còn mã game + thông số các hình (không còn byte ảnh nào). js/sprite_custom.js tải ảnh theo
# thứ tự ưu tiên (màn chào/làng trước, vùng đang chơi, rồi hiệu ứng / vũ khí, vùng khác, trùm và dáng pha sau cùng hoặc khi vào ải 4–5),
# hình nào game cần vẽ mà chưa có thì tải ngay; chưa về thì vẽ bằng code như cũ. Trình duyệt không đọc được WebP: tải bản .png.
# Tên tệp có mã nội dung → lưu đệm lâu (firebase.json trong workflow: /anh/** immutable; sw.js lưu một lần).
# CỜ TẮT (quay về cách cũ, không cần sửa code game):
#   LK_ANH_ROI=0 (hoặc --anh-json)  → chế độ 2 tệp như Đợt 10 (trang nhẹ + linh-khi-anh.<mã>.json)
#   LK_WEBP=0                       → ảnh rời chỉ có PNG (không mã hoá WebP)
#   trong game: ?webp=0 buộc tải PNG
# Mã hoá WebP method=6 chậm (~2,5 phút cho 600 ảnh trên 2 lõi): kết quả nhớ ở game/.dem-webp/ (hoặc LK_DEM_WEBP), theo mã PNG gốc.
THU_MUC_ANH = 'anh'
TRAN_TRANG_NEN = 1.5 * 1024 * 1024  # trang chính sau gzip (mục tiêu tải nhanh)
TRAN_ANH_ROI = 26 * 1024 * 1024  # tổng ảnh rời PNG + WebP trên máy chủ (người chơi chỉ tải một trong hai)
WEBP_METHOD = int(os.environ.get('LK_WEBP_METHOD', '6'))
VUNG_SO = {'rung': 0, 'bien': 1, 'laudai': 2}


def anh_roi_bat():
    return os.environ.get('LK_ANH_ROI', '1') != '0' and '--anh-json' not in sys.argv[1:]


def ma_webp(png):
    """PNG (byte) → WebP lossless (byte), hoặc None nếu điểm ảnh giải mã lại không y hệt (không bao giờ dùng ảnh lệch)."""
    from PIL import Image
    im = Image.open(io.BytesIO(png)).convert('RGBA')
    b = io.BytesIO()
    im.save(b, 'WEBP', lossless=True, method=WEBP_METHOD, quality=100, exact=True)
    w = b.getvalue()
    if Image.open(io.BytesIO(w)).convert('RGBA').tobytes() != im.tobytes():
        return None
    return w


def webp_nhieu(ds):
    """ds: danh sách PNG (byte). Trả về danh sách WebP (byte hoặc None). Có bộ nhớ đệm trên đĩa theo mã PNG."""
    if os.environ.get('LK_WEBP') == '0':
        return [None] * len(ds)
    try:
        import PIL  # noqa: F401
    except ImportError:
        print('CẢNH BÁO: thiếu Pillow (pip install pillow), ảnh rời chỉ có PNG')
        return [None] * len(ds)
    dem = os.environ.get('LK_DEM_WEBP') or os.path.join(ROOT, '.dem-webp')
    os.makedirs(dem, exist_ok=True)
    khoa = [hashlib.sha256(p).hexdigest() + '-m%d' % WEBP_METHOD for p in ds]
    out, thieu = [None] * len(ds), []
    for i, k in enumerate(khoa):
        f = os.path.join(dem, k + '.webp')
        if os.path.isfile(f):
            with open(f, 'rb') as fh:
                out[i] = fh.read() or None  # tệp rỗng = đã thử, WebP không dùng được
        else:
            thieu.append(i)
    if thieu:
        print('Mã hoá WebP lossless %d ảnh (method=%d, nhớ ở %s)…' % (len(thieu), WEBP_METHOD, os.path.relpath(dem, os.path.dirname(ROOT))))
        from concurrent.futures import ProcessPoolExecutor
        with ProcessPoolExecutor() as ex:
            kq = list(ex.map(ma_webp, [ds[i] for i in thieu], chunksize=2))
        for i, w in zip(thieu, kq):
            with open(os.path.join(dem, khoa[i] + '.webp'), 'wb') as fh:
                fh.write(w or b'')
            out[i] = w
    return out


def anh_roi(custom, gom, trang, frag):
    """Ghi dist/linh-khi-nhe.html (mã + thông số hình) và dist/anh/* (ảnh rời PNG + WebP)."""
    thu = os.path.join(DIST, THU_MUC_ANH)
    os.makedirs(thu, exist_ok=True)
    vt, pngs = [], []
    for i, t in enumerate(custom):
        k = 'tam' if isinstance(t.get('tam'), str) else 'anh' if isinstance(t.get('anh'), str) else None
        if k and t[k].startswith('data:image/png;base64,'):
            vt.append((i, k))
            pngs.append(base64.b64decode(t[k].split(',', 1)[1]))
    webps = webp_nhieu(pngs)
    ds = [dict(t) for t in custom]
    tong_png = tong_webp = tong_tot = so_webp = 0
    for (i, k), png, w in zip(vt, pngs, webps):
        t = ds[i]
        ten = '%s.%s' % (t['ma'], hashlib.sha256(png).hexdigest()[:10])
        with open(os.path.join(thu, ten + '.png'), 'wb') as f:
            f.write(png)
        t[k] = THU_MUC_ANH + '/' + ten + '.png'
        tot = len(png)
        tong_png += len(png)
        if w and len(w) < len(png):
            tw = '%s.%s' % (t['ma'], hashlib.sha256(w).hexdigest()[:10])
            with open(os.path.join(thu, tw + '.webp'), 'wb') as f:
                f.write(w)
            t['webp'] = THU_MUC_ANH + '/' + tw + '.webp'
            tot = len(w)
            tong_webp += len(w)
            so_webp += 1
        tong_tot += tot
        # _u: [bậc ưu tiên tĩnh, số byte tải, vùng (0 rừng, 1 biển, 2 lâu đài, -1 không theo vùng), trùm/dáng pha]
        # bậc 0: cần cho màn chào / làng (luật bat_buoc ở trên) · 1: hiệu ứng, vũ khí, thân em bé theo bộ… · 2: quái thường · 3: trùm và dáng pha
        quai = t.get('doi_tuong') not in ('hieu-ung', 'ghep', 'giao-dien', 'nguoi-lang', 'em-be') and t.get('doi_tuong') not in DO_LOAI
        trum = quai and t['ma'].split('-')[0] in TRUM_VUNG
        bac = 0 if bat_buoc(custom[i]) else 3 if trum else 2 if quai else 1
        t['_u'] = [bac, tot, VUNG_SO.get(t.get('vung'), -1) if quai else -1, 1 if trum else 0]
    khai = ('// ===== ảnh rời (tải nhanh 12/10): ảnh nằm ở thư mục anh/ cạnh trang, js/sprite_custom.js tải theo ưu tiên =====\n'
            '(window.G = window.G || {}).ANH_ROI = ' + json.dumps({'so': len(vt), 'webp': so_webp}) + ';\n')
    js = gom(ds, khai, "['customSpriteData'] = ")
    if '.customSpriteData = ' in js:
        sys.exit('Trang nhẹ còn chuỗi ".customSpriteData = ": công cụ sẽ đọc nhầm trang thiếu ảnh')
    if re.search(r'data:image/png;base64,[A-Za-z0-9+/]{64}', js):
        sys.exit('Trang chính chế độ ảnh rời còn ảnh base64')
    nhe = trang(js)
    check(nhe, frag, js)
    write(os.path.join(DIST, TEN_NHE), nhe)
    import gzip
    n1 = len(nhe.encode('utf-8'))
    z1 = len(gzip.compress(nhe.encode('utf-8'), 6))
    may_chu = tong_png + tong_webp
    print('Ảnh rời: dist/%s (%d KB, nén %d KB, %d hình chỉ có thông số) + dist/%s/ (%d ảnh: PNG %.2f MB, %d bản WebP %.2f MB)'
          % (TEN_NHE, n1 // 1024, z1 // 1024, len(ds), THU_MUC_ANH, len(vt), tong_png / 1048576, so_webp, tong_webp / 1048576))
    print('Người chơi tải: trang %.2f MB nén + ảnh %.2f MB (WebP khi có, còn lại PNG); trình duyệt không có WebP: ảnh %.2f MB PNG'
          % (z1 / 1048576, tong_tot / 1048576, tong_png / 1048576))
    print('Trần: trang chính nén %.2f / %.2f MB%s; ảnh trên máy chủ %.2f / %.0f MB%s'
          % (z1 / 1048576, TRAN_TRANG_NEN / 1048576, '  ← TRANG CHÍNH QUÁ NẶNG' if z1 > TRAN_TRANG_NEN else '',
             may_chu / 1048576, TRAN_ANH_ROI / 1048576, '  ← VƯỢT TRẦN' if may_chu > TRAN_ANH_ROI else ''))


# ---------- Xưởng Sprite ----------
CUSTOM = os.path.join(ROOT, 'art', 'custom')
TOOL = os.path.join(os.path.dirname(ROOT), 'tools', 'xuong-sprite')
# Mã game mà công cụ cần để vẽ hình gốc (quái, em bé, nền phòng) và vẽ hình tự làm giống hệt trong game.
TOOL_GAME_JS = ['js/ngon_ngu.js', 'js/data.js', 'js/art.js', 'js/weapon_art.js', 'js/hero_art.js', 'js/hero_tinhlinh.js', 'js/env_art.js', 'js/monster_art.js', 'js/room_art.js', 'js/outfit.js', 'js/village_scene.js', 'js/sprite_custom.js', 'js/mapgen.js', 'js/minimap.js', 'js/btn_art.js']  # mapgen + minimap + btn_art: trang Tách Giao Diện vẽ thử bản đồ và nút bằng đúng code game; env_art: trang Tách Phòng vẽ thử đồ vật trong phòng
TOOL_JS = ['xu-ly-anh.js', 'khung.js', 'tu-doan.js', 'do.js', 'giao-dien.js']
RUNTIME_KEYS = ('loai', 'phien_ban', 'ma', 'ten', 'doi_tuong', 'vung', 'thay_cho', 'tam', 'khung_rong', 'khung_cao', 'goc', 'rong', 'cao', 'bong', 'dong_tac',
                'anh', 'vu_khi', 'trang_phuc', 'vat_pham', 'dung_yen', 'nhun', 'nhun_buoc', 'neo', 'khoac_do', 'cu',
                'net', 'nhan_vat', 'diem', 'diem_theo', 'cap')  # net: ảnh gấp net lần (thiếu là game đọc thành 1 → hình to gấp đôi, khung bị cắt)
HU_KEYS = ('loai', 'phien_ban', 'ma', 'ten', 'doi_tuong', 'tam', 'khung_rong', 'khung_cao', 'goc', 'so', 'giay', 'lap', 'xoay', 'co', 'tron', 'net')  # hiệu ứng ảnh AI (js/fx_anh.js)
GHEP_KEYS = ('loai', 'phien_ban', 'ma', 'ten', 'doi_tuong', 'nhan_vat', 'diem', 'diem_theo', 'diem_theo_than', 'cap')  # tệp ghep-<key> (js/sprite_custom.js)
GD_KEYS = ('loai', 'phien_ban', 'ma', 'ten', 'doi_tuong', 'anh', 'net', 'vien')  # ảnh giao diện gd-<tên> (bản đồ, nút; js/sprite_custom.js → SC.gd, js/minimap.js)
DO_LOAI = ('vu-khi', 'trang-phuc', 'vat-pham')  # đồ: một ảnh đứng yên, game tự xoay và đặt theo người
SHIM = '''window.G = window.G || {};
(function (G) {
  G.rnd = Math.random; G.rr = (a, b) => a + G.rnd() * (b - a); G.ri = (a, b) => Math.floor(G.rr(a, b + 1)); G.pick = (a) => a[Math.floor(G.rnd() * a.length)];
  G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v); G.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y); G.time = 0; G.W = 480; G.H = 270;
  G.srand = function (seed) { let s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  G.ui = G.ui || {}; // lớp vẽ giao diện rỗng: js/minimap.js giữ đúng đối tượng này, trang Tách Giao Diện gắn hàm vẽ vào để xem thử bản đồ
})(window.G);
'''


def custom_sprites():
    """Đọc game/art/custom/*.sprite.json, chỉ giữ phần game cần (bỏ phần cong_cu dùng để sửa tiếp)."""
    out = []
    if not os.path.isdir(CUSTOM):
        return out
    for name in sorted(os.listdir(CUSTOM)):
        if not name.endswith('.sprite.json'):
            continue
        try:
            with open(os.path.join(CUSTOM, name), encoding='utf-8') as f:
                t = json.load(f)
        except Exception as e:
            sys.exit('Tệp hình tự vẽ hỏng: art/custom/%s (%s)' % (name, e))
        ma = t.get('ma')
        if t.get('loai') != 'linh-khi-sprite' or not isinstance(ma, str) or not re.match(r'^[A-Za-z0-9_-]{1,40}$', ma):
            sys.exit('art/custom/%s không phải tệp của Xưởng Sprite (thiếu loai hoặc mã)' % name)
        if t.get('doi_tuong') == 'hieu-ung':
            if not ma.startswith('hu-') or not re.match(r'^data:image/png;base64,[A-Za-z0-9+/=]+$', str(t.get('tam', ''))):
                sys.exit('art/custom/%s: hiệu ứng phải có mã hu-<tên> và dải khung PNG' % name)
            out.append({k: t[k] for k in HU_KEYS if k in t})
            continue
        if t.get('doi_tuong') == 'ghep':
            # hồ sơ ghép trang bị của một nhân vật (docs/review/ghep-trang-bi/DINH-DANG-GHEP.md): chỉ số liệu, không có ảnh
            if not re.match(r'^ghep-(smith|hunter|healer|wrestler)$', ma):
                sys.exit('art/custom/%s: tệp ghép phải có mã ghep-smith, ghep-hunter, ghep-healer hoặc ghep-wrestler' % name)
            out.append({k: t[k] for k in GHEP_KEYS if k in t})
            continue
        if t.get('doi_tuong') == 'giao-dien':
            # ảnh giao diện (tools/tach-giao-dien): một ảnh tĩnh, mã gd-<tên>; "vien" (tuỳ chọn) là 4 số cắt 9 mảnh
            if not re.match(r'^gd-[a-z0-9_-]+$', ma) or not re.match(r'^data:image/png;base64,[A-Za-z0-9+/=]+$', str(t.get('anh', ''))):
                sys.exit('art/custom/%s: ảnh giao diện phải có mã gd-<tên> (chữ thường, số, gạch) và một ảnh PNG' % name)
            v = t.get('vien')
            if v is not None and not (isinstance(v, list) and len(v) == 4 and all(isinstance(x, (int, float)) and not isinstance(x, bool) and 0 <= x <= 400 for x in v)):
                sys.exit('art/custom/%s: "vien" phải là 4 số [trên, phải, dưới, trái]' % name)
            out.append({k: t[k] for k in GD_KEYS if k in t})
            continue
        if t.get('doi_tuong') in DO_LOAI:
            if not re.match(r'^data:image/png;base64,[A-Za-z0-9+/=]+$', str(t.get('anh', ''))):
                sys.exit('art/custom/%s thiếu ảnh PNG của món đồ' % name)
            if not isinstance(t.get({'vu-khi': 'vu_khi', 'trang-phuc': 'trang_phuc', 'vat-pham': 'vat_pham'}[t['doi_tuong']]), (dict, str)):
                sys.exit('art/custom/%s thiếu thông số món đồ' % name)
            out.append({k: t[k] for k in RUNTIME_KEYS if k in t and k not in ('tam', 'dong_tac')})
            continue
        if not re.match(r'^data:image/png;base64,[A-Za-z0-9+/=]+$', str(t.get('tam', ''))):
            sys.exit('art/custom/%s thiếu tấm sprite PNG' % name)
        # Phiên 3: tệp ĐÒN THEO VŨ KHÍ em-be-<nhân vật>[-<bộ>]-don chỉ có các hàng atk_sword, atk_bow, atk_spear, atk_hammer, cast (không có idle);
        # js/sprite_custom.js ghép nó xuống dưới tấm thân cùng mã gốc khi nạp.
        if t.get('doi_tuong') == 'em-be' and ma.endswith('-don'):
            if not re.match(r'^em-be-(smith|hunter|healer|wrestler)(-(rung|bien|lau))?-don$', ma):
                sys.exit('art/custom/%s: mã tệp đòn phải là em-be-<smith|hunter|healer|wrestler>[-rung|-bien|-lau]-don' % name)
            if not isinstance(t.get('dong_tac'), dict) or not any(k in t['dong_tac'] for k in ('atk_sword', 'atk_bow', 'atk_spear', 'atk_hammer', 'cast')):
                sys.exit('art/custom/%s: tệp đòn thiếu hàng (atk_sword, atk_bow, atk_spear, atk_hammer, cast)' % name)
            out.append({k: t[k] for k in RUNTIME_KEYS if k in t})
            continue
        if not isinstance(t.get('dong_tac'), dict) or 'idle' not in t['dong_tac']:
            sys.exit('art/custom/%s thiếu động tác đứng thở' % name)
        # Em bé: em-be (cả bốn), em-be-<nhân vật> (thân thường) hoặc em-be-<nhân vật>-<bộ> (thân vẽ liền BỘ TRANG PHỤC: rung, bien, lau).
        if t.get('doi_tuong') == 'em-be' and not re.match(r'^em-be(-(smith|hunter|healer|wrestler)(-(rung|bien|lau))?)?$', ma):
            sys.exit('art/custom/%s: mã em bé phải là em-be, em-be-<smith|hunter|healer|wrestler> hoặc thêm đuôi bộ -rung, -bien, -lau' % name)
        out.append({k: t[k] for k in RUNTIME_KEYS if k in t})
    return out


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


def safe_js(js):
    """Không để chuỗi nào trong JS đóng thẻ script sớm."""
    return re.sub(r'</(script)', r'<\\/\1', js, flags=re.I).replace('<!--', '<\\!--')


def build_tool(game_full):
    """Công cụ Xưởng Sprite (một tệp tự chứa) và bản game thử."""
    src = os.path.join(TOOL, 'nguon')
    if not os.path.isdir(src):
        return

    def rd(n):
        with open(os.path.join(src, n), encoding='utf-8') as f:
            return f.read()
    page = rd('cong-cu.html')
    # js/ngon_ngu.js đi trước để mã game gọi được G.t; công cụ luôn dùng tiếng Việt (không kèm từ điển).
    game = ''.join('// ===== game/' + n + ' =====\n' + read(n).rstrip() + '\n' + ("window.G.LANG = 'vi';\n" if n == 'js/ngon_ngu.js' else '') for n in TOOL_GAME_JS)
    tool = ''.join('// ===== ' + n + ' =====\n' + rd(n).rstrip() + '\n' for n in TOOL_JS)
    for thu, dest in (('thu.html', os.path.join(TOOL, 'index.html')), ('xuong-sprite-thu.html', os.path.join(DIST, 'xuong-sprite.html'))):
        js = ('// Xưởng Sprite (tools/xuong-sprite). TỆP ĐƯỢC TẠO BỞI game/build.py, đừng sửa tay: sửa ở tools/xuong-sprite/nguon/.\n'
              + SHIM + 'window.XS_THU_URL = ' + json.dumps(thu) + ';\n' + game + tool)
        html = page.replace('</body>', '<script>\n' + safe_js(js) + '</script>\n</body>')
        check_tool(html, dest)
        write(dest, html)
        print('Đã ghi %s (%d KB)' % (os.path.relpath(dest, os.path.dirname(ROOT)), len(html.encode('utf-8')) // 1024))
    # Bản game thử đóng gói: game đầy đủ + mã nhận tệp từ công cụ (chỉ trang này có, bản chơi chính không có).
    thu = game_full.replace('</script>\n</body>', '\n// ===== tools/xuong-sprite/nguon/thu.js =====\n' + safe_js(rd('thu.js')) + '</script>\n</body>')
    thu = thu.replace('<title>Linh Khí</title>', '<title>Linh Khí · bản thử Xưởng Sprite</title>')
    if 'nguon/thu.js' not in thu:
        sys.exit('Không gắn được thu.js vào bản game thử')
    write(os.path.join(DIST, 'xuong-sprite-thu.html'), thu)
    print('Đã ghi dist/xuong-sprite-thu.html (%d KB)' % (len(thu.encode('utf-8')) // 1024))
    # Bản game thử để mở ngay trong repo: nạp thẳng mã game ở game/js.
    html = read('index.html')
    html = re.sub(r'<script src="(js/[^"]+)"></script>', lambda m: '<script src="../../game/' + m.group(1) + '"></script>', html)
    html = re.sub(r'<link rel="(manifest|apple-touch-icon)"[^>]*>\n', '', html)
    html = html.replace('</body>', '<script src="nguon/thu.js"></script>\n</body>')
    html = html.replace('<title>Linh Khí</title>', '<title>Linh Khí · bản thử Xưởng Sprite</title>')
    write(os.path.join(TOOL, 'thu.html'), '<!-- TỆP ĐƯỢC TẠO BỞI game/build.py: bản game thử của Xưởng Sprite, nạp mã game trong repo. -->\n' + html)


def check_tool(html, name):
    errs = []
    for m in re.finditer(r'<(?:script|link|img|iframe)\b[^>]*\b(?:src|href)\s*=\s*["\']([^"\']+)["\']', html, re.I):
        if not m.group(1).startswith(FONT_HOST):
            errs.append('trỏ ra ngoài: ' + m.group(1))
    for u in re.findall(r'https?://[^\s"\'<>)]+', html):
        if not u.startswith((FONT_HOST, FIREBASE_SDK)):
            errs.append('địa chỉ ngoài không được phép: ' + u)
    if re.search(r'(?<![\w.$])(alert|confirm|prompt)\s*\(', html):
        errs.append('gọi alert/confirm/prompt')
    if errs:
        sys.exit('Đóng gói Xưởng Sprite thất bại (' + name + '):\n- ' + '\n- '.join(sorted(set(errs))))


def check(full, frag, js):
    """Dừng ngay nếu bản đóng gói vi phạm một quy tắc của nơi lưu trữ."""
    errs = []
    if re.search(r'<!doctype|<html[\s>]|</html>|<head[\s>]|</head>|<body[\s>]|</body>', frag, re.I):
        errs.append('artifact.html còn chứa doctype hoặc thẻ html/head/body')
    order = [frag.find('<title>'), frag.find('<link'), frag.find('<style>'), frag.find('<div'), frag.find('<script>')]
    if order[0] != 0 or -1 in order or order != sorted(order):
        errs.append('artifact.html sai thứ tự: phải là title, link, style, phần thân, script')
    if frag.count('<script') != 1 or full.count('<script') != 1:
        errs.append('phải có đúng một thẻ script')
    for name, text in (('linh-khi.html', full), ('artifact.html', frag)):
        for m in re.finditer(r'''(?:src|href)\s*=\s*["']([^"']+)["']''', text):
            if not m.group(1).startswith(FONT_HOST):
                errs.append(name + ' còn trỏ ra ngoài: ' + m.group(1))
        for u in re.findall(r'''https?://[^\s"'<>)]+''', text):
            if not u.startswith((FONT_HOST, FIREBASE_SDK)):
                errs.append(name + ' có địa chỉ ngoài không được phép: ' + u)
    css = re.search(r'<style>(.*?)</style>', frag, re.S).group(1)
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    if re.search(r'\d(vh|dvh|svh|lvh)\b', css):
        errs.append('CSS dùng đơn vị vh; phải dùng height: 100%')
    if not re.search(r'html\s*,\s*body\s*\{[^}]*height:\s*100%', css):
        errs.append('CSS thiếu height: 100% cho html và body')
    if not re.search(r'#shell\s*\{[^}]*padding-inline:\s*16px', css):
        errs.append('#shell thiếu lề hai bên 16px')
    if 'color-scheme: dark' not in css:
        errs.append('thiếu color-scheme: dark')
    if re.search(r'(?<![\w.$])(alert|confirm|prompt)\s*\(', js):
        errs.append('JS gọi alert/confirm/prompt, nơi lưu trữ không hỗ trợ')
    if re.search(r'G\.botInput\s*=|G\.botRun\s*=', js):
        errs.append('bot chơi thử lọt vào bản đóng gói')
    if errs:
        sys.exit('Đóng gói thất bại:\n- ' + '\n- '.join(errs))


if __name__ == '__main__':
    main()
