#!/usr/bin/env python3
# TURRET MERGE — dựng thap/js/ngonngu-vi.js từ docs/demo-hop-tuong/tuvan/ngonngu/vi.json (mẫu EN → VI; # = số, @ = tên ụ, {n} = số thứ n)
# Sửa bản dịch: sửa vi.json rồi chạy lại: python3 tools/thap-vi-dung.py
import json, os
R = os.path.join(os.path.dirname(__file__), '..')
d = json.load(open(os.path.join(R, 'docs/demo-hop-tuong/tuvan/ngonngu/vi.json'), encoding='utf-8'))
giu = sorted(k for k, v in d.items() if k == v)
mau = {k: v for k, v in sorted(d.items()) if k != v}
out = ("// TURRET MERGE — TỪ ĐIỂN TIẾNG VIỆT — TỆP SINH TỰ ĐỘNG, đừng sửa tay.\n"
       "// Nguồn: docs/demo-hop-tuong/tuvan/ngonngu/vi.json → python3 tools/thap-vi-dung.py. Dùng bởi js/ngonngu.js (Cài đặt → LANGUAGE).\n"
       "'use strict';\n"
       "const VI_GIU = " + json.dumps(giu, ensure_ascii=False) + ";\n"
       "const VI_DICH = {};\n"
       "const VI_MAU = {\n" + "".join(json.dumps(k, ensure_ascii=False) + ": " + json.dumps(v, ensure_ascii=False) + ",\n" for k, v in mau.items()) + "};\n")
open(os.path.join(R, 'thap/js/ngonngu-vi.js'), 'w', encoding='utf-8').write(out)
print('VI_MAU', len(mau), 'VI_GIU', len(giu), 'bytes', len(out.encode()))
