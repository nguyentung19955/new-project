"""AUDIT nội dung (phiên au-kien-truc-tiep-can): đếm nội dung thật đang có trong game và rà chữ tiếng Việt hiển thị.
  cd game && python3 tests/au_noi_dung.py
1. Mở game (không vẽ gì thêm), đọc G.* để đếm: vùng, ải, vai quái, quái, trùm, vũ khí và dòng, trang phục, kỹ năng, chưởng,
   người làng, trang hướng dẫn, lời nguyền, bùa.
2. Đọc mọi chuỗi có dấu tiếng Việt trong js/*.js (không đọc chú thích //) và tìm:
   - cùng một từ viết hai kiểu đặt dấu (hoá/hóa, khoá/khóa, hoả/hỏa ...)
   - từ tiếng Anh lẫn trong chữ hiển thị (Hero, mana ...)
   - tên gọi lệch nhau giữa các chỗ (ví dụ số phòng một ải)
Ghi JSON: docs/review/anh/au_noi_dung.json. KHÔNG sửa game."""
import os, re, json, glob, collections
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh', 'au_noi_dung.json')

DUMP = r"""() => {
  const MA = G.monsterArt, WA = G.weaponArt, O = G.outfit, C = G.CHUONG;
  const mobs = (MA && MA.list || []).map(m => ({ id: m.id, ten: m.ten, vung: m.vung, loai: m.loai, anims: m.anims.length }));
  const fam = {}; for (const t of G.WKEYS) { fam[t] = []; for (let f = 0; f < G.FAMILIES; f++) { try { fam[t].push(WA.familyName(t, f)); } catch (e) { fam[t].push('?'); } } }
  const items = O ? Object.values(O.ITEMS).map(i => ({ id: i.id, slot: i.slot, name: i.name, set: i.set, src: i.src })) : [];
  const trees = C ? Object.keys(C.trees).map(k => ({ k, name: C.trees[k].name, nodes: C.trees[k].nodes.map(n => n.name + ' (' + n.max + ')') })) : [];
  return {
    regions: G.REGIONS.map(r => ({ name: r.name, el: r.el, mini: r.mini, boss: r.bossName, mat: r.mat })),
    stages: 15, roles: Object.keys(G.ROLES).map(k => k + ':' + G.ROLES[k].name), mobs, families: fam,
    rarity: G.RARITY.map(r => r.name), stageNames: G.STAGE_NAMES, items,
    skills: G.SKEYS.map(k => ({ k, name: G.SKILLS[k].name, nodes: G.SKILLS[k].nodes })), trees,
    heroes: G.HKEYS.map(k => G.HEROES[k].name), npcs: G.villageScene.ORDER.map(k => G.villageScene.NPCS[k].ten + ' / ' + G.villageScene.NPCS[k].ngan),
    curses: G.CURSES.map(c => c.name), charms: Object.values(G.GEAR.charm).map(c => c.name), affix: Object.values(G.AFFIX), power: Object.values(G.POWER).map(p => p.name),
    elite_traits: Object.values(G.ELITE_TRAITS).map(t => t.name), hints: G.HINTS.length, move_tips: Object.keys(G.MOVE_TIPS || {}).length,
  };
}"""

VN = re.compile(r"[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]", re.I)
LIT = re.compile(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|`((?:[^`\\]|\\.)*)`")


def strings():
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'js', '*.js'))):
        for i, line in enumerate(open(f, encoding='utf-8'), 1):
            code = line.split('//')[0] if not ("'//" in line or '"//' in line or 'http' in line) else line
            for m in LIT.finditer(code):
                s = next(g for g in m.groups() if g is not None)
                if VN.search(s):
                    out.append((os.path.basename(f), i, s))
    return out


def check(strs):
    words = collections.Counter(); where = collections.defaultdict(list)
    for f, i, s in strs:
        for w in re.findall(r"[^\W\d_]+", s):
            words[w.lower()] += 1; where[w.lower()].append(f + ':' + str(i))
    dau = []
    for a, b in [('hoá', 'hóa'), ('khoá', 'khóa'), ('xoá', 'xóa'), ('hoả', 'hỏa'), ('tuỳ', 'tùy'), ('thuỷ', 'thủy'), ('hoà', 'hòa'), ('khoẻ', 'khỏe'), ('toả', 'tỏa'), ('hoạ', 'họa')]:
        if words[a] and words[b]:
            dau.append({'kieu_cu': a, 'so_cu': words[a], 'cho_cu': where[a][:6], 'kieu_moi': b, 'so_moi': words[b], 'cho_moi': where[b][:6]})
        elif words[a] or words[b]:
            dau.append({'chi_mot_kieu': a if words[a] else b, 'so': words[a] or words[b]})
    eng = {}
    for f, i, s in strs:
        for w in re.findall(r"[A-Za-z]+", s):
            if w.lower() in ('hero', 'mana', 'boss', 'combo', 'level', 'skill', 'loot'):
                eng.setdefault(w, []).append(f + ':' + str(i))
    # mọi chuỗi chứa chữ hero (kể cả không dấu) ở bảng người làng
    return {'dat_dau': dau, 'tieng_anh': {k: {'so': len(v), 'cho': v[:8]} for k, v in eng.items()}}


def main():
    strs = strings()
    res = {'so_chuoi_co_dau': len(strs), 'kiem_tra_chu': check(strs)}
    # Số phòng: bản đồ Chú Lái Đò ghi (i < 2 ? 7 : 8), bản đồ nhỏ ghi '/8', mapgen luôn sinh 8 phòng
    v = open(os.path.join(ROOT, 'js', 'village.js'), encoding='utf-8').read()
    mm = open(os.path.join(ROOT, 'js', 'minimap.js'), encoding='utf-8').read()
    res['so_phong'] = {'village_ghi': re.findall(r"\(i < 2 \? 7 : 8\) \+ ' phòng", v), 'minimap_ghi': re.findall(r"'Phòng ' \+ n \+ '/8'", mm)}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        res['noi_dung'] = pg.evaluate(DUMP)
        # số phòng thật của 15 ải (dựng bản đồ, không vào chơi)
        res['so_phong']['that'] = pg.evaluate("(() => { const out = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) { G.startStage(r, i, 0); out.push(G.getRun().map.rooms.length); } return out; })()")
        b.close()
    nd = res['noi_dung']
    res['dem'] = {
        'vung': len(nd['regions']), 'ai': nd['stages'], 'vai_quai': len(nd['roles']), 'quai_va_trum_co_hinh': len(nd['mobs']),
        'theo_loai': dict(collections.Counter(m['loai'] for m in nd['mobs'])),
        'vu_khi_dong': sum(len(v) for v in nd['families'].values()), 'trang_phuc': len(nd['items']),
        'trang_phuc_theo_o': dict(collections.Counter(i['slot'] for i in nd['items'])),
        'nut_ky_nang': sum(len(s['nodes']) for s in nd['skills']), 'cay_chuong': len(nd['trees']),
        'nut_chuong': sum(len(t['nodes']) for t in nd['trees']), 'nguoi_lang': len(nd['npcs']), 'loi_nguyen': len(nd['curses']),
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    print(json.dumps(res['dem'], ensure_ascii=False))
    print('so phong:', res['so_phong'])
    print(json.dumps(res['kiem_tra_chu'], ensure_ascii=False)[:1500])


if __name__ == '__main__':
    main()
