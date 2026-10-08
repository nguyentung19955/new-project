#!/usr/bin/env python3
"""Đóng gói game thành hai tệp trong dist/ (chỉ dùng thư viện chuẩn của Python 3).

  dist/linh-khi.html  Một trang HTML đầy đủ, mọi mã JS nằm sẵn bên trong. Mở tệp là chơi.
  dist/artifact.html  Một MẢNH trang để dán vào dịch vụ lưu trữ tự bọc khung
                      <!doctype html><html><head>…</head><body> bên ngoài. Tệp này không có
                      doctype, <html>, <head>, <body>; thứ tự: <title>, <link> phông chữ,
                      <style>, phần thân, rồi một thẻ <script> duy nhất.

Cách dùng:  python3 build.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, 'dist')
FONT_HOST = 'https://fonts.googleapis.com/'


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
    for src in srcs:
        if src.startswith(('http:', 'https:', '//')) or 'tests/' in src or 'bot' in os.path.basename(src):
            sys.exit('Không được đóng gói tệp này: ' + src)
        code = read(src)
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
            if not u.startswith(FONT_HOST):
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
