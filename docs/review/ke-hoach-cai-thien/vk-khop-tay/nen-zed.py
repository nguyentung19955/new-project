#!/usr/bin/env python3
"""Nén lại ảnh các tấm Zed (zed-moi/rung/bien/lau/vk) sau khi dựng lại bằng dung-zed-game.py — cùng cách nén của
docs/review/ke-hoach-cai-thien/npc-ban-do-bao-truoc/cong-cu/nen-anh.py (bảng 256 màu), chỉ đụng 5 tấm Zed. Chạy: python3 nen-zed.py --ghi"""
import glob, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../..'))
NEN = os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/npc-ban-do-bao-truoc/cong-cu/nen-anh.py')
src = open(NEN, encoding='utf-8').read()
src = src.replace("glob.glob(os.path.join(DAY, 'game/art/custom/*.sprite.json'))",
                  "[os.path.join(DAY, 'game/art/custom/%s.sprite.json' % m) for m in ('zed-moi', 'zed-rung', 'zed-bien', 'zed-lau', 'zed-vk')]")
src = src.replace("RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra')", "RA = os.path.join(%r, 'ra-nen')" % os.path.dirname(os.path.abspath(__file__)))
assert 'zed-moi' in src
g = {'__file__': NEN, '__name__': '__main__'}
exec(compile(src, NEN, 'exec'), g)
