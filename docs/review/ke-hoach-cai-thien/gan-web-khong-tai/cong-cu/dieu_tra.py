"""Điều tra: bản web (linh-khi-nhe.html, ảnh rời) có tải tấm zed-vk-gan / zed-vk-he không?
Dùng: python3 dieu_tra.py <port> <ua: iphone|mac> <query: ''|'&taivung=0'> <che_do: lang|ai> [giây chờ]
"""
import os
GAME = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game'))  # <gốc repo>/game

import json, os, sys, time
from playwright.sync_api import sync_playwright

HERE = GAME
port = int(sys.argv[1]); ua = sys.argv[2]; q = sys.argv[3] if len(sys.argv) > 3 else ''; che = sys.argv[4] if len(sys.argv) > 4 else 'lang'
CHO = int(sys.argv[5]) if len(sys.argv) > 5 else 40
MBPS = float(sys.argv[6]) if len(sys.argv) > 6 else 0
UA_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

TRANG_THAI = r"""(() => {
  const SC = G.spriteCustom, o = {};
  for (const m of ['zed-vk', 'zed-moi', 'zed-vk-gan', 'zed-vk-he']) {
    const z = SC.zed && SC.zed[m];
    o[m] = z ? { co: true, ready: !!z.ready, img: !!z.img, imgW: z.img ? (z.img.naturalWidth || z.img.width) : 0, kv: !!z.kv } : { co: false };
    const it = SC.roi && SC.roi.ds && SC.roi.ds.get(m);
    o[m].roi = it ? { can: it.can, dangTai: it.dangTai, lan: it.lan, u: it.u, khoa: it.khoa, bac: it.bac, vung: it.vung, ve: it.ve, png: it.png, webp: it.webp, co: it.co } : null;
  }
  o.roi = SC.roi ? { webp: SC.roi.webp, hang: SC.roi.hang(), dang: SC.roi.dang(), xong: SC.roi.xong(), loi: SC.roi.loi(), tong: SC.roi.ds.size } : null;
  o.scene = G.scene === G.Title ? 'Title' : G.scene === G.Village ? 'Village' : G.scene === G.Stage ? 'Stage' : G.scene === G.ChoVung ? 'ChoVung' : String(G.scene && G.scene.name);
  o.loiSC = (SC.loi || []).slice(-10);
  o.TAI_VUNG = G.TAI_VUNG; o.VK_GAN = G.VK_GAN; o.KIEM_VUONG = G.KIEM_VUONG; o.ANH_ROI = G.ANH_ROI;
  return o;
})()"""

LEN_LV4 = r"""(() => {
  const sv = G.testSave({ melee: 'sword', luyen: 1 });
  const w = sv.weapons.find((x) => x.type === 'sword'); G.luyen.dongBo(w);
  for (let lv = 1; lv < 4; lv++) { const k = G.luyen.nang(sv, w, 'fire', true); if (!k) throw new Error('nang that bai o ' + lv); }
  const b = sv.weapons.find((x) => x.type === 'bow'); G.luyen.dongBo(b);
  for (let lv = 1; lv < 9; lv++) { const k = G.luyen.nang(sv, b, 'fire', true); if (!k) throw new Error('nang bow that bai o ' + lv); }
  G.luyen.dongBo(w); G.luyen.dongBo(b);
  return { kiem: G.luyen.cap(w), phitieu: G.luyen.cap(b), branch: w.branch, st: G.wStage(w), stB: G.wStage(b) };
})()"""

HOI_GAN = r"""(() => {
  const SC = G.spriteCustom, V = SC.zed['zed-vk'];
  if (!V || !V.ready) return { V: false };
  const sv = G.save, w = sv.weapons.find((x) => x.type === 'sword'), b = sv.weapons.find((x) => x.type === 'bow');
  const kv = SC.kiemVuong && SC.kiemVuong();
  const VK = kv ? (V.tep.vk.kiem_vuong || V.tep.vk.kiem) : V.tep.vk.kiem;
  const cap = G.luyen.hinhThai(G.luyen.cap(w)), r = V.tep.vk.kiem[cap];
  const capB = G.luyen.hinhThai(G.luyen.cap(b)), rB = V.tep.vk.phitieu[capB];
  return { kv: !!kv, capKiem: cap, ganLuat: G.vkGan(w, cap), ganAnh: !!G.vkGanAnh('kiem', cap, r), heAnh: !!G.vkHeAnh('kiem', cap, 'fire', r),
    capPT: capB, ganLuatPT: G.vkGan(b, capB), ganAnhPT: !!G.vkGanAnh('phitieu', capB, rB), heAnhPT: !!G.vkHeAnh('phitieu', capB, 'fire', rB) };
})()"""


def main():
    reqs, cons, errs = [], [], []
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 844, 'height': 390}, user_agent=UA_IPHONE if ua == 'iphone' else None, device_scale_factor=2 if ua == 'iphone' else 1)
        pg = ctx.new_page()
        if MBPS:
            cdp = ctx.new_cdp_session(pg); cdp.send('Network.enable'); cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 120, 'downloadThroughput': MBPS * 1024 * 1024 / 8, 'uploadThroughput': 1024 * 1024 / 8})
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: cons.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') or 'zed-vk' in m.text else None)
        def on_req(r):
            u = r.url
            if '/anh/' in u: reqs.append({'t': round(time.time() - t0, 2), 'url': u.split('/anh/')[1], 'st': None})
        def on_res(r):
            u = r.url
            if '/anh/' in u:
                for x in reqs:
                    if x['url'] == u.split('/anh/')[1] and x['st'] is None: x['st'] = r.status; break
        pg.on('request', on_req); pg.on('response', on_res)
        t0 = time.time()
        pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (port, q))
        pg.wait_for_function('window.G && G.scene', timeout=60000)
        pg.add_script_tag(path=os.path.join(HERE, 'tests', 'setup.js'))
        pg.wait_for_timeout(3000)
        print('--- sau 3 s:', json.dumps(pg.evaluate(TRANG_THAI), ensure_ascii=False))
        print('--- lên cấp:', pg.evaluate(LEN_LV4))
        if che == 'ai':
            pg.evaluate("G.startStage(0, 1, 0)")
        else:
            pg.evaluate("G.setScene(G.Village)")
        print('--- hỏi gân ngay:', pg.evaluate(HOI_GAN))
        for i in range(CHO // 5):
            pg.wait_for_timeout(5000)
            st = pg.evaluate(TRANG_THAI)
            print('--- t=%ds scene=%s roi=%s gan=%s he=%s' % ((i + 1) * 5, st['scene'], json.dumps(st['roi']), json.dumps(st['zed-vk-gan'], ensure_ascii=False), json.dumps(st['zed-vk-he'], ensure_ascii=False)))
        print('--- hỏi gân cuối:', pg.evaluate(HOI_GAN))
        st = pg.evaluate(TRANG_THAI)
        print('--- trạng thái cuối:', json.dumps(st, ensure_ascii=False))
        b.close()
    gan = [r for r in reqs if 'zed-vk-gan' in r['url'] or 'zed-vk-he' in r['url']]
    print('--- request tới zed-vk-gan/he: %d' % len(gan), json.dumps(gan))
    print('--- tổng request anh/: %d' % len(reqs), 'đầu 10:', json.dumps([r['url'] for r in reqs[:10]]))
    print('--- 10 request cuối:', json.dumps([r['url'] for r in reqs[-10:]]))
    print('--- lỗi JS: %d' % len(errs)); [print('  ', e[:300]) for e in errs[:20]]
    print('--- console: %d' % len(cons)); [print('  ', c[:300]) for c in cons[:30]]


main()
