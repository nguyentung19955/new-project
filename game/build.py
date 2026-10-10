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

Cách dùng:  python3 build.py
"""
import json
import os
import re
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
    custom = custom_sprites()
    rigs = chibi_rigs()
    for src in srcs:
        if src.startswith(('http:', 'https:', '//')) or 'tests/' in src or 'bot' in os.path.basename(src):
            sys.exit('Không được đóng gói tệp này: ' + src)
        code = read(src)
        if src == 'js/sprite_custom.js' and custom:
            data = json.dumps(custom, ensure_ascii=False, separators=(',', ':'))
            parts.append('// ===== art/custom (hình tự vẽ, Xưởng Sprite) =====\n(window.G = window.G || {}).customSpriteData = ' + data + ';\n')
        if src == 'js/chibi_rig.js' and rigs:
            data = json.dumps(rigs, ensure_ascii=False, separators=(',', ':'))
            parts.append('// ===== art/chibi (hình chibi khung xương) =====\n(window.G = window.G || {}).chibiRigData = ' + data + ';\n')
        parts.append('// ===== ' + src + ' =====\n' + code.rstrip() + '\n')
    js = '\n'.join(parts)
    # Không để chuỗi nào trong JS đóng thẻ script sớm.
    js = re.sub(r'</(script)', r'<\\/\1', js, flags=re.I).replace('<!--', '<\\!--')
    script = '<script>\n' + js + '</script>'

    full = ('<!doctype html>\n<html lang="' + lang + '">\n<head>\n' + '\n'.join(metas) + '\n' + title + '\n' + link + '\n'
            + style + '\n</head>\n<body>\n' + markup + '\n' + script + '\n</body>\n</html>\n')
    frag = title + '\n' + link + '\n' + style + '\n' + markup + '\n' + script + '\n'

    check(full, frag, js)
    os.makedirs(DIST, exist_ok=True)
    for name, text in (('linh-khi.html', full), ('artifact.html', frag)):
        with open(os.path.join(DIST, name), 'w', encoding='utf-8', newline='\n') as f:
            f.write(text)
        print('Đã ghi dist/%s (%d KB, %d tệp JS)' % (name, len(text.encode('utf-8')) // 1024, len(srcs)))
    if custom:
        print('Đã nhúng %d hình tự vẽ: %s' % (len(custom), ', '.join(t['ma'] for t in custom)))
    if rigs:
        print('Đã nhúng %d hình chibi khung xương: %s' % (len(rigs), ', '.join(t['ma'] for t in rigs)))
    build_tool(full)


# ---------- Xưởng Sprite ----------
CUSTOM = os.path.join(ROOT, 'art', 'custom')
TOOL = os.path.join(os.path.dirname(ROOT), 'tools', 'xuong-sprite')
# Mã game mà công cụ cần để vẽ hình gốc (quái, em bé, nền phòng) và vẽ hình tự làm giống hệt trong game.
TOOL_GAME_JS = ['js/data.js', 'js/art.js', 'js/weapon_art.js', 'js/hero_art.js', 'js/hero_tinhlinh.js', 'js/monster_art.js', 'js/room_art.js', 'js/outfit.js', 'js/village_scene.js', 'js/sprite_custom.js']
TOOL_JS = ['xu-ly-anh.js', 'khung.js', 'tu-doan.js', 'do.js', 'giao-dien.js']
RUNTIME_KEYS = ('loai', 'phien_ban', 'ma', 'ten', 'doi_tuong', 'vung', 'thay_cho', 'tam', 'khung_rong', 'khung_cao', 'goc', 'rong', 'cao', 'bong', 'dong_tac',
                'anh', 'vu_khi', 'trang_phuc', 'vat_pham', 'dung_yen', 'nhun')
DO_LOAI = ('vu-khi', 'trang-phuc', 'vat-pham')  # đồ: một ảnh đứng yên, game tự xoay và đặt theo người
SHIM = '''window.G = window.G || {};
(function (G) {
  G.rnd = Math.random; G.rr = (a, b) => a + G.rnd() * (b - a); G.ri = (a, b) => Math.floor(G.rr(a, b + 1)); G.pick = (a) => a[Math.floor(G.rnd() * a.length)];
  G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v); G.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y); G.time = 0; G.W = 480; G.H = 270;
  G.srand = function (seed) { let s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
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
        if t.get('doi_tuong') in DO_LOAI:
            if not re.match(r'^data:image/png;base64,[A-Za-z0-9+/=]+$', str(t.get('anh', ''))):
                sys.exit('art/custom/%s thiếu ảnh PNG của món đồ' % name)
            if not isinstance(t.get({'vu-khi': 'vu_khi', 'trang-phuc': 'trang_phuc', 'vat-pham': 'vat_pham'}[t['doi_tuong']]), (dict, str)):
                sys.exit('art/custom/%s thiếu thông số món đồ' % name)
            out.append({k: t[k] for k in RUNTIME_KEYS if k in t and k not in ('tam', 'dong_tac')})
            continue
        if not re.match(r'^data:image/png;base64,[A-Za-z0-9+/=]+$', str(t.get('tam', ''))):
            sys.exit('art/custom/%s thiếu tấm sprite PNG' % name)
        if not isinstance(t.get('dong_tac'), dict) or 'idle' not in t['dong_tac']:
            sys.exit('art/custom/%s thiếu động tác đứng thở' % name)
        out.append({k: t[k] for k in RUNTIME_KEYS if k in t})
    return out


# ---------- Hình chibi khung xương (game/art/chibi/*.rig.json, js/chibi_rig.js đọc) ----------
CHIBI = os.path.join(ROOT, 'art', 'chibi')
RIG_KEYS = ('loai', 'phien_ban', 'ma', 'ten', 'doi_tuong', 'thay_cho', 'khung', 'anh', 'cao', 'goc', 'manh', 'dong_tac')


def chibi_rigs():
    """Đọc game/art/chibi/*.rig.json, kiểm tra rồi giữ phần game cần."""
    out = []
    if not os.path.isdir(CHIBI):
        return out
    for name in sorted(os.listdir(CHIBI)):
        if not name.endswith('.rig.json'):
            continue
        try:
            with open(os.path.join(CHIBI, name), encoding='utf-8') as f:
                t = json.load(f)
        except Exception as e:
            sys.exit('Tệp chibi hỏng: art/chibi/%s (%s)' % (name, e))
        ma = t.get('ma')
        if t.get('loai') != 'linh-khi-rig':
            sys.exit('art/chibi/%s không phải tệp linh-khi-rig (thiếu loai)' % name)
        if not isinstance(ma, str) or not re.match(r'^[A-Za-z0-9_-]{1,40}$', ma):
            sys.exit('art/chibi/%s có mã sai (chỉ chữ, số, - _ ; tối đa 40 ký tự)' % name)
        if not re.match(r'^data:image/png;base64,[A-Za-z0-9+/=]+$', str(t.get('anh', ''))):
            sys.exit('art/chibi/%s thiếu ảnh PNG' % name)
        if not isinstance(t.get('manh'), list) or not t['manh']:
            sys.exit('art/chibi/%s thiếu danh sách mảnh' % name)
        out.append({k: t[k] for k in RIG_KEYS if k in t})
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
    game = ''.join('// ===== game/' + n + ' =====\n' + read(n).rstrip() + '\n' for n in TOOL_GAME_JS)
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


# ---------- Xưởng Rối (tools/xuong-roi): ráp nhân vật chibi khung xương, xuất tệp linh-khi-rig ----------
ROI = os.path.join(os.path.dirname(ROOT), 'tools', 'xuong-roi')


def ds_quai_roi():
    """Danh sách quái trong game (mã, tên, vùng) lấy từ js/monster_art.js, cho ô "thay cho quái nào"."""
    try:
        src = read('js/monster_art.js')
    except OSError:
        return []
    out = []
    for m in re.finditer(r"^def\('([A-Za-z0-9_]+)',\s*\{\s*ten:\s*'([^']+)',\s*vung:\s*'([^']+)'", src, re.M):
        out.append({'id': m.group(1), 'ten': m.group(2), 'vung': m.group(3)})
    return out


def build_xuong_roi():
    """dist/xuong-roi.html: một tệp tự chứa (giao diện + tools/xuong-roi/*.js + game/js/chibi_rig.js)."""
    page_path = os.path.join(ROI, 'index.html')
    if not os.path.isfile(page_path):
        return
    quai = ds_quai_roi()
    write(os.path.join(ROI, 'ds-quai.js'), '// TỆP ĐƯỢC TẠO BỞI game/build.py: danh sách quái trong game cho Xưởng Rối.\nwindow.XR_QUAI = '
          + json.dumps(quai, ensure_ascii=False, separators=(',', ':')) + ';\n')
    with open(page_path, encoding='utf-8') as f:
        page = f.read()
    parts = []
    for src in re.findall(r'<script src="([^"]+)"></script>', page):
        path = os.path.normpath(os.path.join(ROI, src))
        if src.endswith('chibi_rig.js') and not os.path.isfile(path):
            path = os.path.join(ROI, 'chibi_tam.js')  # bản tạm khi game chưa có bộ vẽ chibi
        if not os.path.isfile(path):
            sys.exit('Xưởng Rối thiếu tệp: ' + src)
        with open(path, encoding='utf-8') as f:
            parts.append('// ===== ' + os.path.relpath(path, os.path.dirname(ROOT)) + ' =====\n' + f.read().rstrip() + '\n')
    js = '// Xưởng Rối (tools/xuong-roi). TỆP ĐƯỢC TẠO BỞI game/build.py, đừng sửa tay.\n' + ''.join(parts)
    html = re.sub(r'<script src="[^"]+"></script>\s*', '', page)
    html = html.replace('</body>', '<script>\n' + safe_js(js) + '</script>\n</body>')
    dest = os.path.join(DIST, 'xuong-roi.html')
    check_tool(html, dest)
    write(dest, html)
    print('Đã ghi dist/xuong-roi.html (%d KB, %d quái)' % (len(html.encode('utf-8')) // 1024, len(quai)))


if __name__ == '__main__':
    main()
    build_xuong_roi()
