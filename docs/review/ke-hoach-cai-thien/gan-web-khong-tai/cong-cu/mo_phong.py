"""Mô phỏng hai điểm yếu của hàng chờ ảnh rời (bản web) trên Chromium headless:
  A) 'decode-treo': img.decode() của một số ảnh KHÔNG BAO GIỜ trả lời (giả lập Safari treo) → lượt tải không được trừ, hàng chờ kẹt;
     hỏi G.vkGanAnh → zed-vk-gan có được tải không?
  B) 'hong-3-lan': zed-vk-gan.* bị chặn (lỗi mạng) đúng 3 lượt đầu → vào hongDs; sau đó mạng tốt lại; game hỏi gân (roiCan) → có tải lại không?
Dùng: python3 mo_phong.py <port> <A|B> [n ảnh treo]
"""
import os
GAME = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game'))  # <gốc repo>/game

import json, re, sys, time
from playwright.sync_api import sync_playwright

port = int(sys.argv[1]); che = sys.argv[2]; N_TREO = int(sys.argv[3]) if len(sys.argv) > 3 else 24

TREO = r"""(() => {
  const N = %d; let n = 0; const goc = Image.prototype.decode;
  window.__treo = [];
  Image.prototype.decode = function () {
    const src = String(this.src || '');
    if (n < N && /\/anh\//.test(src) && !/zed-vk/.test(src)) { n++; window.__treo.push(src.split('/anh/')[1]); return new Promise(() => {}); }
    return goc.apply(this, arguments);
  };
})()"""

TT = r"""(() => {
  const SC = G.spriteCustom, z = SC.zed['zed-vk-gan'], it = SC.roi.ds.get('zed-vk-gan');
  return { ready: !!(z && z.ready), can: it && it.can, dangTai: it && it.dangTai, lan: it && it.lan, u: it && it.u, ve: it && it.ve,
    hang: SC.roi.hang(), dang: SC.roi.dang(), xong: SC.roi.xong(), loi: SC.roi.loi(), treo: (window.__treo || []).length, scene: G.scene === G.Title ? 'Title' : G.scene === G.Village ? 'Village' : '?' };
})()"""

HOI = r"""(() => {
  const sv = G.testSave({ melee: 'sword', luyen: 1 });
  const w = sv.weapons.find((x) => x.type === 'sword'); G.luyen.dongBo(w);
  for (let lv = 1; lv < 4; lv++) G.luyen.nang(sv, w, 'fire', true);
  const SC = G.spriteCustom, V = SC.zed['zed-vk'];
  const cap = G.luyen.hinhThai(G.luyen.cap(w)), r = V.tep.vk.kiem[cap];
  G.setScene(G.Village);
  return { ganLuat: G.vkGan(w, cap), ganAnh: !!G.vkGanAnh('kiem', cap, r), heAnh: !!G.vkHeAnh('kiem', cap, 'fire', r) };
})()"""

reqs = []
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 844, 'height': 390}); pg = ctx.new_page()
    t0 = time.time()
    chan = {'n': 0}
    if che == 'B':
        def route(r):
            if chan['n'] < 4: chan['n'] += 1; reqs.append(('CHAN', round(time.time() - t0, 1), r.request.url.split('/anh/')[1])); r.abort(); return
            r.continue_()
        pg.route(re.compile(r'/anh/zed-vk-gan\.'), route)
    pg.on('request', lambda r: reqs.append(('REQ', round(time.time() - t0, 1), r.url.split('/anh/')[1])) if 'zed-vk-gan' in r.url or 'zed-vk-he' in r.url else None)
    if che == 'A': pg.add_init_script(TREO % N_TREO)
    pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0' % port)
    pg.wait_for_function('window.G && G.scene', timeout=60000)
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.wait_for_timeout(2500)
    print('t=2.5s', json.dumps(pg.evaluate(TT)))
    if che == 'B':
        pg.wait_for_timeout(16000)  # đủ 3 lượt: ngay, +3 s, +10 s
        print('t=18.5s (sau 3 lượt hỏng)', json.dumps(pg.evaluate(TT)))
    print('hỏi gân:', pg.evaluate(HOI))
    for i in range(6):
        pg.wait_for_timeout(5000)
        print('t+%ds' % ((i + 1) * 5), json.dumps(pg.evaluate(TT)))
    print('hỏi gân cuối:', pg.evaluate(HOI))
    b.close()
print('request zed-vk-gan/he:', reqs)
