"""Tự kiểm gói bàn giao: mọi đường dẫn ảnh/tệp nhắc tới đều tồn tại; dòng code trích dẫn trong manifest có thật.
Chạy: python3 docs/LINH_KHI_AI_ART_HANDOFF/cong_cu/tu_kiem.py"""
import glob, json, os, re
PKG = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); REPO = os.path.dirname(os.path.dirname(PKG))
bad, ok = [], 0
M = json.load(open(os.path.join(PKG, 'GAME_ASSET_MANIFEST.json')))
for a in M['assets']:
    for r in a['reference_images'] or []:
        if os.path.exists(os.path.join(PKG, r)): ok += 1
        else: bad.append(('ảnh manifest', a['asset_id'], r))
    for s in ([a['source_file']] if isinstance(a['source_file'], str) else a['source_file']):
        m = re.match(r'(game/js/\S+?\.js)(?::(\d+))?', s)
        if not m: continue
        p = os.path.join(REPO, m[1])
        if not os.path.exists(p): bad.append(('tệp code', a['asset_id'], m[1])); continue
        if m[2] and int(m[2]) > len(open(p, encoding='utf-8').read().split('\n')): bad.append(('dòng code', a['asset_id'], s))
        ok += 1
for md in glob.glob(os.path.join(PKG, '*.md')):
    txt = open(md, encoding='utf-8').read()
    for p in set(re.findall(r'`(anh/[^`*<>{} ]+\.(?:png|json))`', txt)):
        if os.path.exists(os.path.join(PKG, p)): ok += 1
        else: bad.append(('ảnh trong md', os.path.basename(md), p))
    for p in set(re.findall(r'`((?:game|docs|tools|godot)/[^`*<>{} ]+?)`', txt)):
        q = p.split(':')[0].split(' ')[0]
        if os.path.exists(os.path.join(REPO, q)): ok += 1
        else: bad.append(('đường dẫn repo', os.path.basename(md), p))
print('đúng:', ok, '| sai:', len(bad))
for b in bad: print('  SAI', b)
