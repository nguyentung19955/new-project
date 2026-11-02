#!/usr/bin/env python3
"""Đổi dòng Trạng thái của docs/yeu-cau-anh/muot-2/NNN-<tên>.md.  python3 tools/muot-2/danh-dau.py <tên> "<trạng thái mới>" """
import sys, glob, os, re
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
f = glob.glob(R + '/docs/yeu-cau-anh/muot-2/[0-9][0-9][0-9]-%s.md' % sys.argv[1])[0]
s = open(f).read(); s = re.sub(r'^- \*\*Trạng thái:\*\* .*$', '- **Trạng thái:** ' + sys.argv[2], s, count=1, flags=re.M)
open(f, 'w').write(s); print(f)
