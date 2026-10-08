# Kiểm tra weapon_art.js: nạp sau các script của game, vẽ đủ 400 hình nhân 4 bậc,
# tìm hình trùng điểm ảnh, tên trùng, đo cỡ, đếm hình thật sự khác nhau.
#   python3 kiem_tra.py
import asyncio, json, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))

JS = r'''
(() => {
  const WA = G.weaponArt, out = { errors: [], types: {} };
  const cv = document.createElement('canvas'); cv.width = cv.height = 200; const c = cv.getContext('2d');
  const shot = (o, ang, pull) => { c.clearRect(0, 0, 200, 200); WA.draw(c, o, 100, 100, ang, pull || 0); return c.getImageData(0, 0, 200, 200).data; };
  const hash = (d) => { let h = 2166136261; for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 16777619); } return h >>> 0; };
  const sil = (d) => { let h = 2166136261; for (let i = 3; i < d.length; i += 4) { h ^= d[i] > 0 ? 1 : 0; h = Math.imul(h, 16777619); } return h >>> 0; };
  const cols = [[null, 0]]; for (const b of WA.BRANCHES) for (let s = 1; s <= 3; s++) cols.push([b, s]);
  let drawn = 0;
  for (const type of WA.TYPES) {
    const T = { families: WA.FAMILIES[type].length, names: {}, dupNames: [], dupPixels: [], dupSil: [], sizes: [], rarSame: [], rarSil: [], moodSame: [] };
    const seen = {}, seenS = {};
    for (let f = 0; f < T.families; f++) for (const [b, s] of cols) {
      const base = { type, family: f, branch: b, stage: s, mood: 'calm', t: 1 };
      const nm = WA.name(base); if (T.names[nm]) T.dupNames.push(nm); T.names[nm] = 1;
      const hs = [], ss = [];
      for (let r = 0; r < 4; r++) {
        const o = Object.assign({}, base, { rarity: r });
        try {
          const d = shot(o, WA.REST[type]); hs.push(hash(d)); ss.push(sil(d)); drawn++;
          for (const a of [-135, -45, 0, 30, 90, 180]) { shot(o, a, 0.6); }
          for (const m of ['idle', 'attack', 'hurt', 'sleep']) shot(Object.assign({}, o, { mood: m, t: 0.37 }), WA.REST[type], 1);
          WA.icon(c, o, 100, 100, 24); WA.size(o);
        } catch (e) { out.errors.push(nm + ' bậc ' + r + ': ' + e.message); }
      }
      const id = nm;
      if (seen[hs[0]]) T.dupPixels.push([seen[hs[0]], id]); else seen[hs[0]] = id;
      if (seenS[ss[0]]) T.dupSil.push([seenS[ss[0]], id]); else seenS[ss[0]] = id;
      if (new Set(hs).size < 4) T.rarSame.push(id);
      const sz = WA.size(Object.assign({}, base, { rarity: 0 }));
      T.sizes.push({ f, b, s, len: sz.len, w: sz.w, h: sz.h });
      // bốn trạng thái mặt phải khác nhau
      const mh = ['calm', 'attack', 'hurt', 'sleep'].map((m) => hash(shot(Object.assign({}, base, { mood: m, rarity: 0 }), WA.REST[type])));
      if (new Set(mh).size < 4) T.moodSame.push(id);
    }
    T.count = Object.keys(T.names).length;
    T.uniquePixels = Object.keys(seen).length; T.uniqueSil = Object.keys(seenS).length;
    delete T.names;
    out.types[type] = T;
  }
  out.drawn = drawn;
  return out;
})()
'''

async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch()
        pg = await br.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        # dùng đúng trang index.html của game, nhét các script vào trong trang, rồi nạp weapon_art.js sau cùng
        import re
        html = open(os.path.join(GAME, 'index.html'), encoding='utf-8').read()
        html = re.sub(r'<script src="js/([\w.]+)"></script>', lambda m: '<script>%s</script>' % open(os.path.join(GAME, 'js', m.group(1)), encoding='utf-8').read().replace('</script>', '<\\/script>'), html)
        html = html.replace('</body>', '<script>%s</script></body>' % open(os.path.join(GAME, 'js', 'weapon_art.js'), encoding='utf-8').read())
        if 'weaponArt' not in html:
            html += '<script>%s</script>' % open(os.path.join(GAME, 'js', 'weapon_art.js'), encoding='utf-8').read()
        await pg.set_content(html)
        await pg.wait_for_timeout(200)
        await pg.wait_for_timeout(500)
        res = await pg.evaluate(JS)
        await br.close()
    ok = True
    print('Lỗi trang khi nạp cùng game:', errs or 'không')
    print('Số lần vẽ hình đứng nghỉ (400 hình x 4 bậc):', res['drawn'])
    if res['errors']:
        ok = False; print('LỖI KHI VẼ:', res['errors'][:10])
    for t, T in res['types'].items():
        base = [z for z in T['sizes'] if z['s'] == 0]
        st3 = [z for z in T['sizes'] if z['s'] == 3]
        key = 'len'
        if not base:
            continue
        lo = min(z[key] for z in base); hi = max(z[key] for z in base)
        ratios = []
        for z in st3:
            b0 = next(y for y in base if y['f'] == z['f']); ratios.append(z[key] / b0[key])
        print('--- %s: %d dòng, %d tên' % (t, T['families'], T['count']))
        print('   hình khác nhau từng điểm ảnh: %d; hình bóng khác nhau: %d' % (T['uniquePixels'], T['uniqueSil']))
        print('   dài thân hình gốc: %d đến %d; Thức tỉnh to hơn gốc: %.0f%% đến %.0f%%' % (lo, hi, (min(ratios) - 1) * 100, (max(ratios) - 1) * 100))
        if '-v' in sys.argv:
            print('   dài từng dòng (gốc):', [z[key] for z in base])
            for br in ('fire','poison','ice'):
                print('   Thức tỉnh', br, [next(z[key] for z in st3 if z['f']==y['f'] and z['b']==br) for y in base])
        for k, label in (('dupNames', 'TÊN TRÙNG'), ('dupPixels', 'HÌNH TRÙNG ĐIỂM ẢNH'), ('rarSame', 'BẬC KHÔNG ĐỔI HÌNH'), ('moodSame', 'MẶT KHÔNG ĐỔI THEO TRẠNG THÁI')):
            if T[k]:
                ok = False; print('   %s:' % label, T[k][:8])
        if T['dupSil']:
            print('   cùng hình bóng (chỉ khác bên trong):', T['dupSil'][:12])
    print('KẾT QUẢ:', 'ĐẠT' if ok and not errs else 'CHƯA ĐẠT')
    sys.exit(0 if ok and not errs else 1)

asyncio.run(main())
