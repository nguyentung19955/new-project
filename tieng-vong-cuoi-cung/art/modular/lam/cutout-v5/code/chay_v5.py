"""Chạy toàn bộ v5 theo đúng thứ tự:  python3 chay_v5.py   (~30 s)
xuat.py (mảnh v4 + lam-v5.json gốc) → attachment.py → tu_the.py → duyet.py (ảnh tu-the/) → kiem_json.py"""
import subprocess, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
for f in ('xuat.py', 'attachment.py', 'tu_the.py', 'duyet.py', 'kiem_json.py'):
    print('==>', f, flush=True)
    r = subprocess.run([sys.executable, os.path.join(HERE, f)], cwd=HERE)
    if r.returncode:
        sys.exit(r.returncode)
