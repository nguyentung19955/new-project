# Đo mức khác nhau về hình bóng giữa các hình liền kề trong một dòng (gốc -> Mầm -> Thành hình -> Thức tỉnh).
# Số đo: phần trăm điểm ảnh lệch nhau trên tổng vùng phủ của hai hình. Càng thấp thì hai hình càng giống nhau về dáng.
#   python3 do_khac.py
import asyncio, os
from playwright.async_api import async_playwright
G = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'game', 'js', 'weapon_art.js'))
JS = r'''(() => {
  const WA = G.weaponArt, cv = document.createElement('canvas'); cv.width = cv.height = 200; const c = cv.getContext('2d');
  const mask = (o) => { c.clearRect(0, 0, 200, 200); WA.draw(c, Object.assign({ mood: 'calm', t: 1, rarity: 0 }, o), 100, 100, WA.REST[o.type], 0); const d = c.getImageData(0, 0, 200, 200).data, m = new Uint8Array(40000); for (let i = 0; i < 40000; i++) m[i] = d[i * 4 + 3] > 0 ? 1 : 0; return m; };
  const diff = (a, b) => { let x = 0, u = 0; for (let i = 0; i < 40000; i++) { if (a[i] || b[i]) u++; if (a[i] !== b[i]) x++; } return Math.round((x / u) * 100); };
  const out = {};
  for (const type of WA.TYPES) {
    const T = { s01: [], s12: [], s23: [], low: [] };
    for (let f = 0; f < 10; f++) {
      const base = mask({ type, family: f, branch: null, stage: 0 });
      for (const b of WA.BRANCHES) {
        const m = [base]; for (let s = 1; s <= 3; s++) m.push(mask({ type, family: f, branch: b, stage: s }));
        const d = [diff(m[0], m[1]), diff(m[1], m[2]), diff(m[2], m[3])];
        T.s01.push(d[0]); T.s12.push(d[1]); T.s23.push(d[2]);
        d.forEach((v, i) => { if (v < 12) T.low.push(WA.name({ type, family: f, branch: b, stage: i + 1 }) + ' (' + v + '%)'); });
      }
    }
    out[type] = T;
  }
  return out;
})()'''
async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(); pg = await br.new_page()
        await pg.set_content('<script>window.G={}</script><script>%s</script>' % open(G, encoding='utf-8').read())
        r = await pg.evaluate(JS); await br.close()
    av = lambda a: sum(a) / len(a)
    for t, T in r.items():
        print('%s: gốc->Mầm lệch %d%% (ít nhất %d%%); Mầm->Thành hình %d%% (ít nhất %d%%); Thành hình->Thức tỉnh %d%% (ít nhất %d%%)' % (t, av(T['s01']), min(T['s01']), av(T['s12']), min(T['s12']), av(T['s23']), min(T['s23'])))
        print('   hình có dáng lệch dưới 12%% so với hình liền trước: %d' % len(T['low']), T['low'][:40])
asyncio.run(main())
