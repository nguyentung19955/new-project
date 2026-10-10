"""AUDIT kiến trúc - bản lưu (phiên au-kien-truc-tiep-can): G.fixSave có "xoá trắng" cả bản lưu khi chỉ MỘT trường bị hỏng không?
  cd game && python3 tests/au_luu_hong.py
Cách làm: dựng một bản lưu có tiến trình (vàng, sao, cấp, vũ khí, trang phục), rồi lần lượt thay từng trường (tới độ sâu 3)
bằng giá trị sai kiểu (null, chuỗi, số, mảng, đối tượng rỗng) và chạy G.fixSave. Nếu kết quả mất hết tiến trình
(vàng 0 và không còn sao) thì ghi lại: đó là chỗ một lỗi nhỏ làm mất cả bản lưu (vì fixSave bọc tất cả trong try/catch
và trả về bản lưu MỚI; làng gọi G.persist() ngay khi vào nên bản mới ghi đè bản cũ trong máy).
Ghi JSON: docs/review/anh/au_luu_hong.json. KHÔNG sửa game."""
import os, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh', 'au_luu_hong.json')

JS = r"""() => {
  G.testSave({ hero: 'smith', lvl: 15, tier: 2, sharpen: 3 });
  const sv = G.save; sv.gold = 1234; sv.stars = { '0-0': 3, '0-1': 2 }; sv.ore = 9;
  if (G.outfit) { try { const it = G.outfit.give ? G.outfit.give(sv, 'mu_sung', 1) : null; } catch (e) {} }
  const base = JSON.stringify(sv);
  const bad = [null, 'x', 7, [], {}, true];
  const paths = [];
  const walk = (o, p, d) => { if (d > 3 || !o || typeof o !== 'object') return; for (const k of Object.keys(o)) { paths.push(p.concat(k)); walk(o[k], p.concat(k), d + 1); } };
  walk(JSON.parse(base), [], 1);
  const lost = [], threw = [];
  for (const p of paths) for (const b of bad) {
    const s = JSON.parse(base);
    let o = s; for (let i = 0; i < p.length - 1; i++) o = o[p[i]];
    o[p[p.length - 1]] = b;
    let r;
    try { r = G.fixSave(s); } catch (e) { threw.push(p.join('.') + ' = ' + JSON.stringify(b) + ': ' + e.message); continue; }
    if (r.gold === 0 && !Object.keys(r.stars || {}).length && p.join('.') !== 'v') lost.push(p.join('.') + ' = ' + JSON.stringify(b));
    // bản lưu sau khi sửa có chạy được không: dựng nhân vật
    try { const keep = G.save; G.save = r; G.buildPlayer(); G.save = keep; } catch (e) { threw.push('buildPlayer sau khi sửa ' + p.join('.') + ' = ' + JSON.stringify(b) + ': ' + e.message); }
  }
  // đường thoát chung: một hàm sửa con ném lỗi -> cả bản lưu thành mới?
  const o0 = G.outfit && G.outfit.fix; let wiped = null;
  if (o0) { G.outfit.fix = () => { throw new Error('giả lỗi'); }; const r = G.fixSave(JSON.parse(base)); wiped = r.gold === 0 && !Object.keys(r.stars).length; G.outfit.fix = o0; }
  return { truong_thu: paths.length, lan_thu: paths.length * bad.length, mat_het: lost, nem_loi: threw.slice(0, 30), so_nem_loi: threw.length, gia_loi_outfit_fix_xoa_trang: wiped };
}"""


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        r = pg.evaluate(JS)
        b.close()
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(r, f, ensure_ascii=False, indent=1)
    print('thử', r['lan_thu'], 'lần trên', r['truong_thu'], 'trường')
    print('MẤT HẾT tiến trình khi hỏng:', len(r['mat_het']))
    for x in r['mat_het'][:30]:
        print('  ', x)
    print('ném lỗi:', r['so_nem_loi']); [print('  ', x) for x in r['nem_loi'][:10]]
    print('giả lỗi trong outfit.fix -> xoá trắng cả bản lưu:', r['gia_loi_outfit_fix_xoa_trang'])


if __name__ == '__main__':
    main()
