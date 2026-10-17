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

Cảnh truyện (15/10, canh-truyen) — ảnh game/art/truyen/<tên>.webp|jpg|png (dựng bằng tools/anh-truyen/dung.py), TẢI LƯỜI:
  - bản một tệp (linh-khi.html, artifact.html): nhúng bản WebP dạng data: (chỉ giải mã khi mở truyện; thiếu WebP thì JPEG)
  - bản ảnh rời: chép sang dist/anh/truyen-<tên>.<mã>.webp|jpg, KHÔNG vào gói tải đầu; js/truyen.js chỉ tải khi mở truyện
  - G.TRUYEN_ANH = { '<tên>': { webp, jpg } } khai trong trang; js/truyen.js tra bảng này (không có ảnh thì vẽ nền code như cũ)

Bìa màn hình chính (15/10, bia-moi) — ảnh game/art/bia/<tên>.webp|jpg + <tên>.mo.jpg (dựng bằng tools/anh-truyen/dung.py), TẢI SỚM:
  - G.BIA_ANH = { '<tên>': { webp, jpg } } khai trong trang (js/bia.js chọn 1 trong 2 bìa mỗi lần mở; ?bia=1|2 ép)
  - bản ảnh rời: chép sang dist/anh/bia-<tên>.<mã>.webp|jpg và gắn đường dẫn vào thẻ #lk-tai (data-bia) → màn tải HTML bắt đầu tải
    đúng MỘT bìa ngay khi trang đang về (không thêm thẻ script, không chặn màn tải). Tính vào tải đầu.
  - bản một tệp: nhúng WebP dạng data: (như ảnh truyện)
  - mọi bản: data-bia mang thêm bản 32×18 rất nhỏ (<tên>.mo.jpg, data:) làm nền mờ của màn tải HTML

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
# Tệp "Thêm vào màn hình chính" nằm cạnh trang trên spiritblade.web.app (game/web/): trang đóng gói được trỏ tới (đường tương đối).
PWA_HREF = ('manifest.webmanifest', 'apple-touch-icon.png')


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
    bia = bia_anh()
    markup = gan_bia(markup, bia, None)  # nền mờ màn tải (bản rất nhỏ); trang nhẹ gắn thêm đường dẫn ảnh (anh_roi)
    if not srcs:
        sys.exit('index.html không nạp tệp JS nào')
    parts = []
    # Phiên bản = giờ đóng gói (giờ Việt Nam), hiện ở góc màn đăng nhập để biết bản mới đã lên web chưa.
    import datetime
    ver = 'lk-' + (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=7)).strftime('%Y.%m.%d-%H%M')
    parts.append('// ===== phiên bản đóng gói =====\n(window.G = window.G || {}).VERSION = ' + json.dumps(ver) + ';\n')
    custom = custom_sprites()
    truyen = truyen_anh()
    # Đợt 2: bỏ ghép lớp Zed (js/ghep_lop.js, game/art/lop, cờ ?ghep=1) — Zed vẽ bằng bộ ảnh zed-* (js/zed_moi.js).

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

    # PWA bỏ thanh URL (15/10): trước đây trang đóng gói chỉ giữ <meta>, <title> và link phông chữ → MẤT <link rel="manifest"> và
    # <link rel="apple-touch-icon"> của index.html: trang thật trên spiritblade.web.app không có manifest, Android "Thêm vào màn hình chính" chỉ tạo
    # lối tắt mở tab Chrome (có thanh URL). Nay giữ đúng 2 thẻ đó (đường tương đối, tệp ở game/web/ được chép cạnh trang khi đăng).
    # artifact.html (mảnh trang) không có; bản game thử của Xưởng Sprite bỏ đi (build_tool).
    pwa = ''.join(m + '\n' for m in re.findall(r'<link rel="(?:manifest|apple-touch-icon)" href="[^"]+">', html))
    if 'rel="manifest"' not in pwa:
        sys.exit('index.html thiếu <link rel="manifest" href="..."> (Thêm vào màn hình chính)')

    def trang(js):
        return ('<!doctype html>\n<html lang="' + lang + '">\n<head>\n' + '\n'.join(metas) + '\n' + pwa + title + '\n' + link + '\n'
                + style + '\n</head>\n<body>\n' + markup + '\n<script>\n' + js + '</script>\n</body>\n</html>\n')

    # 15/10 soát mượt: tấm trước khi thay hàng (<mã>-muotcu, cờ ?anhmuotcu=1) chỉ có ở bản hai tệp (web) — bản một tệp giữ dưới trần 30 MB.
    js = gom([t for t in custom if not t.get('muot_cua') and not t.get('net_cua')], khai_truyen_mot(truyen) + khai_bia_mot(bia))  # 17/10 do-net: tấm Cu Tí cũ (<mã>-netcu) cũng chỉ ở bản hai tệp
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
    if truyen:
        print('Ảnh truyện nhúng trong bản một tệp (tải lười: chỉ giải mã khi mở truyện): %d ảnh, %d KB' % (len(truyen), sum(len(nhung_truyen(v)[1]) for v in truyen.values()) // 1024))
    if bia:
        print('Bìa màn hình chính nhúng trong bản một tệp: %d ảnh, %d KB' % (len(bia), sum(len(nhung_truyen(v)[1]) for v in bia.values()) // 1024))
    hai_tep(custom, gom, trang, frag, truyen, bia)
    build_tool(full)


# ---------- Cảnh truyện (15/10): ảnh tải lười ----------
TRUYEN_DIR = os.path.join(ROOT, 'art', 'truyen')
TRUYEN_DUOI = ('webp', 'jpg', 'png')


def truyen_anh():
    """{ tên: { 'webp': đường dẫn, 'jpg': …, 'png': … } } từ game/art/truyen/ (mỗi tên một ảnh, có bản nào lấy bản đó)."""
    out = {}
    if not os.path.isdir(TRUYEN_DIR):
        return out
    for n in sorted(os.listdir(TRUYEN_DIR)):
        m = re.match(r'^([a-z0-9-]{1,40})\.(webp|jpg|png)$', n)
        if m:
            out.setdefault(m.group(1), {})[m.group(2)] = os.path.join(TRUYEN_DIR, n)
    return out


def nhung_truyen(v):
    """(loại, data URI) để nhúng vào bản một tệp: WebP nếu có (nhẹ nhất), không thì JPEG, rồi PNG."""
    for d, mime in (('webp', 'image/webp'), ('jpg', 'image/jpeg'), ('png', 'image/png')):
        if d in v:
            with open(v[d], 'rb') as f:
                return d, 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode('ascii'))
    return None, ''


def khai_truyen(bang):
    return ('// ===== ảnh cảnh truyện (15/10): js/truyen.js chỉ tải khi mở truyện =====\n'
            '(window.G = window.G || {}).TRUYEN_ANH = ' + json.dumps(bang, separators=(',', ':')) + ';\n')


def khai_truyen_mot(truyen):
    bang = {}
    for ten, v in truyen.items():
        d, uri = nhung_truyen(v)
        if d:
            bang[ten] = {'webp' if d == 'webp' else 'jpg': uri}
    return khai_truyen(bang)


def chep_truyen(truyen, thu):
    """Bản ảnh rời: chép ảnh truyện sang dist/anh/truyen-<tên>.<mã nội dung>.<đuôi>. Trả (bảng đường dẫn, byte WebP-hoặc-JPG, byte JPG)."""
    bang, tai, jpg = {}, 0, 0
    for ten, v in truyen.items():
        e = {}
        for d in TRUYEN_DUOI:
            if d not in v:
                continue
            with open(v[d], 'rb') as f:
                b = f.read()
            tf = 'truyen-%s.%s.%s' % (ten, hashlib.sha256(b).hexdigest()[:10], d)
            with open(os.path.join(thu, tf), 'wb') as f:
                f.write(b)
            e['webp' if d == 'webp' else 'jpg' if 'jpg' not in e else 'png'] = THU_MUC_ANH + '/' + tf
            if d == 'webp' or ('webp' not in v and d == 'jpg'):
                tai += len(b)
            if d == 'jpg':
                jpg += len(b)
        bang[ten] = e
    return bang, tai, jpg


# ---------- Bìa màn hình chính (15/10, bia-moi): ảnh tải sớm ----------
BIA_DIR = os.path.join(ROOT, 'art', 'bia')
BIA_TEN = ('bia-1-cay-da', 'bia-2-dong-song')  # thứ tự = ?bia=1 / ?bia=2, trùng js/bia.js và tools/anh-truyen/dung.py


def bia_anh():
    """{ tên: { 'webp': …, 'jpg': …, 'mo': … } } theo thứ tự BIA_TEN, chỉ bìa có WebP hoặc JPEG."""
    out = {}
    for ten in BIA_TEN:
        v = {}
        for d, f in (('webp', ten + '.webp'), ('jpg', ten + '.jpg'), ('mo', ten + '.mo.jpg')):
            p = os.path.join(BIA_DIR, f)
            if os.path.isfile(p):
                v[d] = p
        if 'webp' in v or 'jpg' in v:
            out[ten] = v
    return out


def khai_bia(bang):
    return ('// ===== bìa màn hình chính (bia-moi 15/10): js/bia.js chọn một bìa =====\n'
            '(window.G = window.G || {}).BIA_ANH = ' + json.dumps(bang, separators=(',', ':')) + ';\n')


def khai_bia_mot(bia):
    bang = {}
    for ten, v in bia.items():
        d, uri = nhung_truyen({k: v[k] for k in ('webp', 'jpg') if k in v})
        if d:
            bang[ten] = {'webp' if d == 'webp' else 'jpg': uri}
    return khai_bia(bang)


def gan_bia(html, bia, duong):
    """Gắn data-bia vào thẻ <div id="lk-tai"> (màn tải HTML): "webp1|jpg1|mờ1|webp2|jpg2|mờ2" (bìa 1 rồi bìa 2).
    duong: { tên: { webp, jpg } } đường dẫn ảnh rời (trang nhẹ) hoặc None (chỉ nền mờ: bản một tệp, artifact.html).
    Thẻ onanimationstart của #lk-tai (index.html) đọc chuỗi này. Không có bìa nào: bỏ data-bia."""
    if html.count('<div id="lk-tai"') != 1:
        sys.exit('index.html phải có đúng một <div id="lk-tai"> (màn tải)')
    html = re.sub(r'(<div id="lk-tai")\s+data-bia="[^"]*"', r'\1', html)
    if not bia:
        return html
    o = []
    for ten in BIA_TEN:
        v, d = bia.get(ten, {}), (duong or {}).get(ten, {})
        mo = ''
        if 'mo' in v:
            with open(v['mo'], 'rb') as f:
                mo = 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode('ascii')
        o += [d.get('webp', ''), d.get('jpg', ''), mo]
    gt = '|'.join(o)
    if '"' in gt or '<' in gt:
        sys.exit('data-bia có ký tự không hợp lệ')
    return html.replace('<div id="lk-tai"', '<div id="lk-tai" data-bia="' + gt + '"', 1)


def chep_bia(bia, thu):
    """Bản ảnh rời: chép bìa sang dist/anh/bia-<tên>.<mã>.webp|jpg (tên có mã nội dung, sw.js lưu đệm lâu như ảnh rời khác).
    Trả (bảng đường dẫn, byte một bìa người chơi tải — bìa nặng nhất, WebP nếu có —, byte JPEG một bìa)."""
    bang, tai, jpg = {}, 0, 0
    for ten, v in bia.items():
        e = {}
        for d in ('webp', 'jpg'):
            if d not in v:
                continue
            with open(v[d], 'rb') as f:
                b = f.read()
            tf = '%s.%s.%s' % (ten, hashlib.sha256(b).hexdigest()[:10], d)
            with open(os.path.join(thu, tf), 'wb') as f:
                f.write(b)
            e[d] = THU_MUC_ANH + '/' + tf
            if d == 'webp' or 'webp' not in v:
                tai = max(tai, len(b))
            if d == 'jpg':
                jpg = max(jpg, len(b))
        bang[ten] = e
    return bang, tai, jpg


# ---------- Đợt 10 (Q5): chế độ 2 tệp, ảnh tải sau ----------
TEN_NHE = 'linh-khi-nhe.html'
TEN_ANH = 'linh-khi-anh.%s.json'
# Trần dung lượng theo quyết định Q5: gói một tệp 15 MB; tách ảnh tải sau thì cả gói 20 MB. Tệp đầu (2 tệp) nên dưới 5 MB để tới màn chào nhanh.
# 11/10/2026 (chủ dự án duyệt): trần gói hai tệp nâng lên 25 MB, rồi 26 MB (21:43) vì phần ảnh tải sau không làm chậm màn chào; tệp đầu vẫn dưới 5 MB.
# 12/10 (tải nhanh): bản một tệp chỉ còn cho trang công cụ / GitHub Pages (nay 25 MB) → trần 30 MB, chỉ cảnh báo. Web chạy bản ảnh rời (trần ở anh_roi).
TRAN_MOT_TEP, TRAN_HAI_TEP, NEN_DUOI = 30 * 1024 * 1024, 26 * 1024 * 1024, 5 * 1024 * 1024
TRUM_VUNG = ('mocTinh', 'nguTinh', 'hoTinh', 'thuongLuong')  # thuongLuong: vùng 4 Sông sâu (bước 3; chưa có ảnh ở phiên 1)
# Hiệu ứng cơ bản (đòn đánh thường nào cũng dùng): vệt chém / đâm, mũi tên của bé, trúng đòn, chí mạng, vỡ giáp, quái chết.
HU_CO_BAN = re.compile(r'^hu-(chem|dam|trung|dan-ten|chi-mang|pha-giap|quai-chet|bong-chan|hat-no)(-|$)')  # 16/10 vẽ tay 6: bóng chân, hạt nổ (rất nhỏ, có ở mọi trận)


# 14/10 (vũ khí cũ còn sót, mục 7): gd-lang-nen thôi tải sau — làng không còn vẽ nền code lúc chờ ảnh nên nền phải về cùng ảnh lõi.
HINH_LON_SAU = {'gd-ban-do-vung', 'gd-khung-ban-do'}


def bat_buoc(t):
    """Hình phải nằm sẵn trong trang (màn chào, làng, ải 1 cần ngay). LUẬT ĐƠN GIẢN, mọi thứ không khớp đều là ẢNH TẢI SAU:
      1. bộ Zed mới (zed-moi, zed-vk; bộ Rừng/Biển/Lâu đài tải sau)   2. em bé NPC (em-be-hunter, em-be-healer, em-be-wrestler)
      3. người làng (nl-*)                             4. ảnh giao diện, làng, phòng (gd-*)
      5. vật phẩm (vp-*): rất nhỏ                      6. hiệu ứng cơ bản (HU_CO_BAN)
    Tải sau: mọi quái và trùm, hiệu ứng theo hệ / của quái / bảng kết quả, và mọi loại mới chưa có luật.
    Đợt 2 (YEU-CAU-2-DON-CU): đã xoá ảnh vũ khí cũ (vk-*), trang phục cũ (tp-*), hồ sơ ghép (ghep-*) và em bé cũ (smith, thân theo bộ, tệp đòn -don)."""
    ma, d = t['ma'], t.get('doi_tuong')
    if ma in HINH_LON_SAU:  # 11/10 (chủ dự án duyệt): hình lớn không cần ở màn chào → tải sau; game vẽ code cho tới khi ảnh về
        return False
    if d == 'zed' and ma in ('zed-rung', 'zed-bien', 'zed-lau', 'zed-vk-he', 'zed-vk-gan'):  # zed-vk-gan (16/10, gân tiến độ Luyện): tải sau, chưa về thì ảnh thường; zed-vk-he (16/10, ảnh vũ khí theo hệ): tải sau, chưa về thì ảnh cấp nhuộm như cũ; trang phục Zed bộ Rừng / Biển / Lâu đài (mở sau trùm vùng 1 / 2 / 3): tải sau; chưa về thì js/zed_moi.js vẽ bộ ninja
        return False
    if d in ('nguoi-lang', 'giao-dien', 'vat-pham', 'zed', 'em-be'):  # zed: bộ Zed mới (zed-moi, zed-vk) cần ngay ở làng; em-be: 3 NPC
        return True
    if d == 'hieu-ung':
        return bool(HU_CO_BAN.match(ma))
    return False


def thu_tu_sau(t):
    """Thứ tự trong tệp tải sau (game nhận từng hình ngay khi dòng của nó về tới): thứ người mới chơi gặp trước thì đứng trước.
    0 quái Rừng già (nhỏ trước: quái thường rồi tinh anh, trùm nhỏ) · 1 hiệu ứng còn lại · 3 trùm Rừng già ·
    4 Hang biển · 5 Lâu đài cổ · 6 mọi thứ khác. Cùng bậc: tệp nhỏ trước."""
    ma, d = t['ma'], t.get('doi_tuong')
    co = len(str(t.get('tam') or t.get('anh') or ''))
    quai = d not in ('hieu-ung', 'giao-dien', 'nguoi-lang', 'em-be', 'zed') and d not in DO_LOAI
    trum = quai and ma.split('-')[0] in TRUM_VUNG
    vung = t.get('vung') if quai else None
    if vung == 'rung':
        bac = 3 if trum else 0
    elif d == 'hieu-ung':
        bac = 1
    else:
        bac = {'bien': 4, 'laudai': 5, 'song': 6}.get(vung, 6)  # song: vùng 4 (bước 3)
    return (bac, co, ma)


def hai_tep(custom, gom, trang, frag, truyen=None, bia=None):
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
        return anh_roi(custom, gom, trang, frag, truyen or {}, bia or {})
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
            '(window.G = window.G || {}).ANH_SAU = ' + json.dumps({'tep': ten, 'so': len(sau), 'byte': len(data), 'trum': trum}) + ';\n'
            + khai_truyen({}) + khai_bia({}))  # cách Đợt 10 không có thư mục anh/: truyện vẽ nền code như cũ, màn chào vẽ cảnh làng
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
# 14/10 (bước 1 làm chắc, mục 1): thước đo chính đổi thành "NGƯỜI CHƠI TẢI" = cộng theo từng ảnh bản thực sự được phát
# (WebP khi có, PNG khi không) + trang chính nén. Trần 20 MB (Q5 ~20 MB). Trước đây trần 26 MB tính TỔNG PNG + WebP trên máy chủ (chặn oan:
# mỗi người chỉ tải một trong hai bản). Tổng máy chủ nay chỉ để thông tin, cảnh báo khi quá 60 MB.
TRAN_NGUOI_TAI = 20 * 1024 * 1024
CANH_BAO_MAY_CHU = 60 * 1024 * 1024
TRAN_ANH_ROI = TRAN_NGUOI_TAI  # tên cũ (công cụ / bài kiểm khác có thể đọc)
WEBP_METHOD = int(os.environ.get('LK_WEBP_METHOD', '6'))
VUNG_SO = {'rung': 0, 'bien': 1, 'laudai': 2, 'song': 3}  # song: vùng 4 Sông sâu (bước 3, js/data.js G.VUNG4)


# 14/10 (bước 1, mục 1): TẢI THEO VÙNG. Ảnh chỉ dùng ở MỘT vùng (quái, trùm + dáng pha, sàn/tường gd-nen-*, cửa gd-cua-*, vật trang trí gd-tt-*
# của Rừng già / Hang biển / Lâu đài cổ) không tải ở màn chào; js/sprite_custom.js tải khi người chơi chọn vùng (thẻ ải hiện "Đang tải…")
# và tải trước vùng kế tiếp khi rảnh. Ảnh lõi (Zed, giao diện, làng, hiệu ứng chung) tải như cũ. Cờ tắt trong game: ?taivung=0.
VUNG_TEN_GD = {'rung': 0, 'bien': 1, 'lau': 2, 'song': 3}


def vung_rieng(t):
    """Số vùng (0 Rừng, 1 Biển, 2 Lâu đài) nếu ảnh chỉ dùng ở vùng đó, -1 nếu là ảnh lõi / dùng chung."""
    ma, d = t.get('ma', ''), t.get('doi_tuong')
    if d == 'giao-dien':
        m = re.match(r'^gd-(?:nen|cua|tt)-(rung|bien|lau|song)-', ma)
        return VUNG_TEN_GD[m.group(1)] if m else -1
    if d == 'hieu-ung':  # 15/10 (hieu-ung-ky-nang): hiệu ứng chỉ của quái / trùm một vùng ghi "vung" trong tệp → tải theo vùng như quái đó
        return VUNG_SO.get(t.get('vung'), -1)
    quai = d not in ('hieu-ung', 'giao-dien', 'nguoi-lang', 'em-be', 'zed') and d not in DO_LOAI
    return VUNG_SO.get(t.get('vung'), -1) if quai else -1


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


def anh_roi(custom, gom, trang, frag, truyen=None, bia=None):
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
    cu_n = cu_tot = cu_png = 0  # tấm cũ (mục muot_cua) nằm trên máy chủ nhưng game chỉ tải khi bật cờ → không tính vào người chơi tải (15/10 don-tep B: bỏ tấm cu_cua / ?quaicu=1)
    bang = {}  # nhóm → [số ảnh, byte người chơi tải (WebP khi có), byte PNG]
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
        if t.get('muot_cua') or t.get('net_cua'):  # 17/10 do-net: tấm Cu Tí cũ <mã>-netcu (?netcu=1) cũng vậy. 15/10 soát mượt: tấm trước khi thay hàng (<mã>-muotcu) chỉ tải khi ?anhmuotcu=1
            cu_n += 1
            cu_tot += tot
            cu_png += len(png)
            vr = vung_rieng(custom[i])  # như quái thường của vùng đó (khi bật cờ thì tải theo vùng như tấm cũ trước đây)
            t['_u'] = [2, tot, vr, 0, 1 if vr >= 0 else 0]
            continue
        tong_tot += tot
        # _u: [bậc ưu tiên tĩnh, số byte tải, vùng (0 rừng, 1 biển, 2 lâu đài, -1 không theo vùng), trùm/dáng pha]
        # bậc 0: cần cho màn chào / làng (luật bat_buoc ở trên) · 1: hiệu ứng… · 2: quái thường · 3: trùm và dáng pha
        quai = t.get('doi_tuong') not in ('hieu-ung', 'giao-dien', 'nguoi-lang', 'em-be', 'zed') and t.get('doi_tuong') not in DO_LOAI
        trum = quai and t['ma'].split('-')[0] in TRUM_VUNG
        bac = 0 if bat_buoc(custom[i]) else 3 if trum else 2 if quai else 1
        vr = vung_rieng(custom[i])
        if vr >= 0 and bac == 0:
            bac = 2  # ảnh riêng một vùng không còn tải ở màn chào (tải khi chọn vùng)
        # _u[4] (14/10): 1 = ảnh riêng của vùng _u[2] (chỉ tải khi chọn vùng đó / tải trước vùng kế tiếp)
        t['_u'] = [bac, tot, vr if vr >= 0 else (VUNG_SO.get(t.get('vung'), -1) if quai else -1), 1 if trum else 0, 1 if vr >= 0 else 0]
        nhom = 'vung%d' % vr if vr >= 0 else 'loi'
        bang.setdefault(nhom, [0, 0, 0])
        bang[nhom][0] += 1
        bang[nhom][1] += tot
        bang[nhom][2] += len(png)
    # 17/10 do-net: bản to ×1,2 của tấm Cu Tí ("tam_to", js/zed_moi.js tải khi vẽ Cu Tí trong trận lần đầu) → ảnh rời riêng, đường dẫn thay chuỗi base64
    for t in ds:
        if isinstance(t.get('tam_to'), str) and t['tam_to'].startswith('data:image/png;base64,'):
            png = base64.b64decode(t['tam_to'].split(',', 1)[1])
            ten = '%s-to.%s' % (t['ma'], hashlib.sha256(png).hexdigest()[:10])
            with open(os.path.join(thu, ten + '.png'), 'wb') as f:
                f.write(png)
            t['tam_to'] = THU_MUC_ANH + '/' + ten + '.png'
            if not t.get('net_cua'):
                tong_tot += len(png); tong_png += len(png)  # người chơi tải (khi vào trận lần đầu), không tính vào "lõi" tải trước
    khai = ('// ===== ảnh rời (tải nhanh 12/10): ảnh nằm ở thư mục anh/ cạnh trang, js/sprite_custom.js tải theo ưu tiên =====\n'
            '(window.G = window.G || {}).ANH_ROI = ' + json.dumps({'so': len(vt), 'webp': so_webp}) + ';\n')
    bang_tr, tr_tai, tr_jpg = chep_truyen(truyen or {}, thu)
    khai += khai_truyen(bang_tr)
    bang_bia, bia_tai, bia_jpg = chep_bia(bia or {}, thu)
    khai += khai_bia(bang_bia)
    js = gom(ds, khai, "['customSpriteData'] = ")
    if '.customSpriteData = ' in js:
        sys.exit('Trang nhẹ còn chuỗi ".customSpriteData = ": công cụ sẽ đọc nhầm trang thiếu ảnh')
    # 17/10 thuong-tay-trai-cao Lần 2: ảnh khung thay trong mã (G.THUONG_CAO_DATA ... "anh") → ảnh rời, đường dẫn thay chuỗi base64
    # (game tải bằng new Image() như tam_to, nên đường dẫn tương đối dùng được y như data URL)
    def _ra_roi(m):
        nonlocal tong_tot, tong_png
        png = base64.b64decode(m.group(1))
        ten = 'ma-rieng.%s' % hashlib.sha256(png).hexdigest()[:10]
        with open(os.path.join(thu, ten + '.png'), 'wb') as f:
            f.write(png)
        tong_tot += len(png); tong_png += len(png)
        return '"' + THU_MUC_ANH + '/' + ten + '.png"'
    js = re.sub(r'"data:image/png;base64,([A-Za-z0-9+/=]+)"', _ra_roi, js)
    if re.search(r'data:image/png;base64,[A-Za-z0-9+/]{64}', js):
        sys.exit('Trang chính chế độ ảnh rời còn ảnh base64')
    nhe = gan_bia(trang(js), bia or {}, bang_bia)  # màn tải HTML bắt đầu tải bìa ngay khi trang đang về
    check(nhe, frag, js)
    write(os.path.join(DIST, TEN_NHE), nhe)
    import gzip
    n1 = len(nhe.encode('utf-8'))
    z1 = len(gzip.compress(nhe.encode('utf-8'), 6))
    may_chu = tong_png + tong_webp
    print('Ảnh rời: dist/%s (%d KB, nén %d KB, %d hình chỉ có thông số) + dist/%s/ (%d ảnh: PNG %.2f MB, %d bản WebP %.2f MB)'
          % (TEN_NHE, n1 // 1024, z1 // 1024, len(ds), THU_MUC_ANH, len(vt), tong_png / 1048576, so_webp, tong_webp / 1048576))
    # Bảng dung lượng theo nhóm tải (mục 1, bước 1): lõi tải trước, từng vùng tải khi chọn vùng.
    ten_nhom = {'loi': 'Lõi (màn chào, làng, Zed, giao diện, hiệu ứng chung)', 'vung0': 'Vùng Rừng già', 'vung1': 'Vùng Hang biển', 'vung2': 'Vùng Lâu đài cổ', 'vung3': 'Vùng Sông sâu'}
    print('Dung lượng theo nhóm tải (người chơi tải = WebP khi có, còn lại PNG | chỉ PNG):')
    for k in ('loi', 'vung0', 'vung1', 'vung2', 'vung3'):
        if k in bang:
            b = bang[k]
            print('  %-55s %3d ảnh  %6.2f MB | %6.2f MB' % (ten_nhom[k], b[0], b[1] / 1048576, b[2] / 1048576))
    nguoi = z1 + tong_tot + bia_tai  # bia-moi: một bìa màn hình chính
    if cu_n:
        print('  (không tính) %d tấm cũ chỉ tải khi mở ?anhmuotcu=1: %.2f MB' % (cu_n, cu_tot / 1048576))
    print('NGƯỜI CHƠI TẢI (thước đo chính): trang %.2f MB nén + ảnh %.2f MB + bìa %.2f MB = %.2f MB / trần %.0f MB%s; trình duyệt không có WebP: %.2f MB'
          % (z1 / 1048576, tong_tot / 1048576, bia_tai / 1048576, nguoi / 1048576, TRAN_NGUOI_TAI / 1048576, '  ← VƯỢT TRẦN' if nguoi > TRAN_NGUOI_TAI else '',
             (z1 + tong_png - cu_png + bia_jpg) / 1048576))  # 15/10 soát mượt: không tính tấm cũ (chỉ tải khi bật cờ)
    print('Ảnh truyện (tải lười, chỉ khi mở truyện, KHÔNG tính vào tải đầu): %d ảnh, %.2f MB (JPEG dự phòng %.2f MB) → xem hết truyện: %.2f MB'
          % (len(bang_tr), tr_tai / 1048576, tr_jpg / 1048576, (nguoi + tr_tai) / 1048576))
    loi = bang.get('loi', [0, 0, 0])
    if bang_bia:
        print('Bìa màn hình chính (tải SỚM, 1 trong %d bìa, tính vào tải đầu): %d KB WebP (JPEG dự phòng %d KB)' % (len(bang_bia), bia_tai // 1024, bia_jpg // 1024))
    print('Tải trước khi vào vùng đầu: lõi %.2f MB + trang %.2f MB + bìa %.2f MB = %.2f MB' % (loi[1] / 1048576, z1 / 1048576, bia_tai / 1048576, (loi[1] + z1 + bia_tai) / 1048576))
    print('Trần: trang chính nén %.2f / %.2f MB%s; tổng ảnh trên máy chủ (PNG + WebP, chỉ để biết) %.2f MB%s'
          % (z1 / 1048576, TRAN_TRANG_NEN / 1048576, '  ← TRANG CHÍNH QUÁ NẶNG' if z1 > TRAN_TRANG_NEN else '',
             may_chu / 1048576, '  ← CẢNH BÁO: máy chủ quá %.0f MB' % (CANH_BAO_MAY_CHU / 1048576) if may_chu > CANH_BAO_MAY_CHU else ''))


# ---------- Xưởng Sprite ----------
CUSTOM = os.path.join(ROOT, 'art', 'custom')
TOOL = os.path.join(os.path.dirname(ROOT), 'tools', 'xuong-sprite')
# Mã game mà công cụ cần để vẽ hình gốc (quái, em bé, nền phòng) và vẽ hình tự làm giống hệt trong game.
TOOL_GAME_JS = ['js/ngon_ngu.js', 'js/data.js', 'js/art.js', 'js/weapon_art.js', 'js/hero_tinhlinh.js', 'js/env_art.js', 'js/monster_art.js', 'js/room_art.js', 'js/village_scene.js', 'js/sprite_custom.js', 'js/mapgen.js', 'js/minimap.js', 'js/btn_art.js']  # mapgen + minimap + btn_art: trang Tách Giao Diện vẽ thử bản đồ và nút bằng đúng code game; env_art: trang Tách Phòng vẽ thử đồ vật trong phòng
TOOL_JS = ['xu-ly-anh.js', 'khung.js', 'tu-doan.js', 'do.js', 'giao-dien.js']
RUNTIME_KEYS = ('loai', 'phien_ban', 'ma', 'ten', 'doi_tuong', 'vung', 'thay_cho', 'tam', 'khung_rong', 'khung_cao', 'goc', 'rong', 'cao', 'bong', 'dong_tac',
                'anh', 'vu_khi', 'trang_phuc', 'vat_pham', 'dung_yen', 'nhun', 'nhun_buoc', 'neo', 'khoac_do', 'cu',
                'net', 'nhan_vat', 'diem', 'diem_theo', 'cap', 'can_tam', 'muot_cua', 'muot', 'bo_va', 'vung_mat', 'net_cua', 'net_moi')  # net_cua, net_moi (17/10 do-net): tấm cũ trước khi dựng lại cho nét (?netcu=1) / tấm mới. vung_mat (15/10 sua-lang-npc): ô mặt người làng ghi tay cho dải lối tắt. can_tam (14/10 trum-chet-pha3): độ dời ngang từng khung để tâm thân trùm trùng điểm neo. net: ảnh gấp net lần (thiếu là game đọc thành 1 → hình to gấp đôi, khung bị cắt)
HU_KEYS = ('loai', 'phien_ban', 'ma', 'ten', 'doi_tuong', 'tam', 'khung_rong', 'khung_cao', 'goc', 'so', 'giay', 'lap', 'xoay', 'co', 'tron', 'net', 'vung', 'ban_kinh', 'det')  # ban_kinh, det (vẽ tay 6–7): vòng sóng hu-vong-song; hiệu ứng ảnh AI (js/fx_anh.js); vung (15/10): tải theo vùng (vung_rieng)
GD_KEYS = ('loai', 'phien_ban', 'ma', 'ten', 'doi_tuong', 'anh', 'net', 'vien', 'lap_canh')  # lap_canh (14/10): cạnh + lòng 9 mảnh lặp thay vì kéo giãn. Ảnh giao diện gd-<tên> (bản đồ, nút; js/sprite_custom.js → SC.gd, js/minimap.js)
DO_LOAI = ('vat-pham',)  # đồ: một ảnh đứng yên (đợt 2: bỏ vu-khi, trang-phuc)
DA_BO = {'vu-khi': 'ảnh vũ khí cũ (vk-*)', 'trang-phuc': 'ảnh trang phục cũ (tp-*)', 'ghep': 'hồ sơ ghép trang bị (ghep-*)'}  # đợt 2: game không đọc nữa
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
        if t.get('doi_tuong') in DA_BO:
            sys.exit('art/custom/%s: đã bỏ ở đợt 2 — %s (nhân vật chơi chỉ còn Zed, xem docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-2-DON-CU.md)' % (name, DA_BO[t['doi_tuong']]))
        if t.get('doi_tuong') == 'giao-dien':
            # ảnh giao diện (tools/tach-giao-dien): một ảnh tĩnh, mã gd-<tên>; "vien" (tuỳ chọn) là 4 số cắt 9 mảnh
            if not re.match(r'^gd-[a-z0-9_-]+$', ma) or not re.match(r'^data:image/png;base64,[A-Za-z0-9+/=]+$', str(t.get('anh', ''))):
                sys.exit('art/custom/%s: ảnh giao diện phải có mã gd-<tên> (chữ thường, số, gạch) và một ảnh PNG' % name)
            v = t.get('vien')
            if v is not None and not (isinstance(v, list) and len(v) == 4 and all(isinstance(x, (int, float)) and not isinstance(x, bool) and 0 <= x <= 400 for x in v)):
                sys.exit('art/custom/%s: "vien" phải là 4 số [trên, phải, dưới, trái]' % name)
            out.append({k: t[k] for k in GD_KEYS if k in t})
            continue
        if t.get('doi_tuong') == 'zed':
            # bộ Zed mới 13/10 (docs/anh-goc/zed/dung-zed-game.py): zed-moi (thân + nắm tay + neo vũ khí), zed-vk (vũ khí 4 loại × 4 cấp)
            if not re.match(r'^zed-[a-z0-9-]{1,30}$', ma) or not re.match(r'^data:image/png;base64,[A-Za-z0-9+/=]+$', str(t.get('tam', ''))):
                sys.exit('art/custom/%s: tệp Zed phải có mã zed-<tên> và một tấm PNG' % name)
            out.append({k: v for k, v in t.items() if k not in ('cong_cu', 'ghi_chu')})
            continue
        if t.get('doi_tuong') in DO_LOAI:
            if not re.match(r'^data:image/png;base64,[A-Za-z0-9+/=]+$', str(t.get('anh', ''))):
                sys.exit('art/custom/%s thiếu ảnh PNG của món đồ' % name)
            if not isinstance(t.get('vat_pham'), (dict, str)):
                sys.exit('art/custom/%s thiếu thông số món đồ' % name)
            out.append({k: t[k] for k in RUNTIME_KEYS if k in t and k not in ('tam', 'dong_tac')})
            continue
        if not re.match(r'^data:image/png;base64,[A-Za-z0-9+/=]+$', str(t.get('tam', ''))):
            sys.exit('art/custom/%s thiếu tấm sprite PNG' % name)
        if not isinstance(t.get('dong_tac'), dict) or 'idle' not in t['dong_tac']:
            sys.exit('art/custom/%s thiếu động tác đứng thở' % name)
        # Em bé: đợt 2 chỉ còn 3 NPC (bạn đồng hành) em-be-hunter, em-be-healer, em-be-wrestler; nhân vật chơi là Zed (zed-*).
        if t.get('doi_tuong') == 'em-be' and not re.match(r'^em-be-(hunter|healer|wrestler)$', ma):
            sys.exit('art/custom/%s: đã bỏ ở đợt 2 — em bé chỉ còn em-be-hunter, em-be-healer, em-be-wrestler' % name)
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
    thu = re.sub(r'<link rel="(manifest|apple-touch-icon)"[^>]*>\n', '', thu)  # bản thử mở trong khung của công cụ: không phải ứng dụng
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
    if 'rel="manifest"' in frag or 'rel="manifest"' not in full:
        errs.append('manifest: phải có ở linh-khi.html / trang nhẹ, không có ở artifact.html')
    if frag.count('<script') != 1 or full.count('<script') != 1:
        errs.append('phải có đúng một thẻ script')
    for name, text in (('linh-khi.html', full), ('artifact.html', frag)):
        for m in re.finditer(r'''(?:src|href)\s*=\s*["']([^"']+)["']''', text):
            if not m.group(1).startswith(FONT_HOST) and m.group(1) not in PWA_HREF:
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
