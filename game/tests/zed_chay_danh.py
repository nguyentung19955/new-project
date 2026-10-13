"""KIỂM THỬ CHẠY + ĐÁNH của Zed (13/10/2026, docs/review/ke-hoach-cai-thien/zed-chay-danh/YEU-CAU.md mục D).
  python3 game/build.py && python3 game/tests/zed_chay_danh.py [--cu]
Chạy headless (Chromium sẵn ở /opt/pw-browsers), mô phỏng từng khung 1/60 giây bằng G.botInput (tests/au_lib.js), 7 tình huống:
  1 đứng chém liên tục · 2 chạy phải chém liên tục · 3 chạy trái chém phải · 4 chạy chéo combo 3 nhát · 5 đổi hướng cần giữa nhát ·
  6 chạy + giữ Đánh rồi Né · 7 thả Đánh vẫn giữ cần.
Mỗi khung ghi: vận tốc (vx, vy điểm ảnh/giây), P.face, hướng đòn (P.aimX/aimY), combo (P.comboI), tên đòn, tiến độ đòn u,
khung thân dưới (hàng chạy #i) / thân trên (hàng đòn #i) do js/zed_moi.js chọn. Xuất: kq-<n>.json, dai-<n>.png (dải ảnh vẽ bằng
đúng hàm vẽ của game), chay-danh-<n>.gif vào docs/review/ke-hoach-cai-thien/zed-chay-danh/kiem-thu/, tóm tắt kq.json.
--muot: so độ mượt vũ khí khi chạy chém, bản cũ ?zedmoi=0 (G.KIEM_MUOT) với bản mới: góc vũ khí mỗi khung (G.tinhLinh.tip, đúng
        hình đang vẽ), độ lệch góc giữa hai khung liền nhau; GIF đặt cạnh nhau muot-cu-moi.gif, số đo muot.json.
--cu: chạy với ?chaydanh=0 (cách cũ) để so sánh (ghi vào kiem-thu-cu/)."""
import base64, io, json, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(ROOT)
CU = '--cu' in sys.argv
RA = os.path.join(REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'zed-chay-danh', 'kiem-thu-cu' if CU else 'kiem-thu')

JS = r"""
([n, cu]) => {
  const melee = 'sword';
  const { W, P } = AU.room({ melee, lvl: 10 });
  AU.want(P, 'sword');
  P.dodgeCd = 0; P.inv = 1e9; P.hp = P.maxhp = 1e9;
  const D = G.spriteCustom.zed['zed-moi'].tep;
  const cx = W.geo.cx, cy = W.geo.cy;
  const dum = AU.dummy(cx, cy, { hp: 1e9 });
  const hold = (x, y) => { dum.x = x; dum.y = y; dum.cd = 1e9; dum.hp = 1e9; dum.dead = false; };
  // đặt chỗ đứng: chạy dọc phòng nên bắt đầu ở mép
  const S = { 1: [cx, cy], 2: [W.x0 + 20, cy], 3: [W.x1 - 20, cy], 4: [W.x0 + 20, W.y0 + 10], 5: [cx - 30, cy], 6: [W.x0 + 20, cy], 7: [W.x0 + 20, cy] }[n];
  P.x = S[0]; P.y = S[1];
  const N = { 1: 110, 2: 110, 3: 110, 4: 90, 5: 80, 6: 80, 7: 90 }[n];
  const log = [], anh = [];
  const cv = document.createElement('canvas'); cv.width = 96 * 3; cv.height = 72 * 3;
  const q = cv.getContext('2d');
  let px = P.x, py = P.y;
  for (let i = 0; i < N; i++) {
    const I = AU.inp;
    I.mx = 0; I.my = 0; I.atk = false;
    // ---- kịch bản từng tình huống ----
    if (n === 1) { I.atk = true; hold(P.x + 34, P.y); }
    if (n === 2) { I.mx = 1; I.atk = true; hold(P.x + 34, P.y); }
    if (n === 3) { I.mx = -1; I.atk = true; hold(P.x + 34, P.y); }
    if (n === 4) { I.mx = 0.7071; I.my = 0.7071; I.atk = i < 60; hold(P.x + 30, P.y + 18); }
    if (n === 5) { I.mx = i < 20 ? 1 : i < 40 ? -1 : 1; I.my = i >= 40 && i < 60 ? 1 : 0; I.atk = true; hold(P.x + 34, P.y); }
    if (n === 6) { I.mx = 1; I.atk = true; if (i === 30) I.dodgeP = true; hold(P.x + 34, P.y); }
    if (n === 7) { I.mx = 1; I.atk = i < 40; hold(P.x + 34, P.y); }
    if (i === 0 || (I.atk && !log.length)) I.atkP = true;
    if (n === 4 && i === 0) I.atkP = true;
    AU.run(1);
    const o = G.heroArgs(P), s = G.zedMoi.chon(o, D);
    const vx = (P.x - px) * 60, vy = (P.y - py) * 60; px = P.x; py = P.y;
    log.push({
      i, t: +(i / 60).toFixed(3), vx: +vx.toFixed(1), vy: +vy.toFixed(1), v: +Math.hypot(vx, vy / 0.75).toFixed(1), moving: P.moving,
      face: P.face, aim: P.aimX != null ? [+P.aimX.toFixed(2), +P.aimY.toFixed(2)] : null, combo: P.comboI, don: P.mv ? P.mv.name : '',
      u: o.atk >= 0 ? +o.atk.toFixed(2) : -1, dodge: P.dodgeT > 0, dash: P.dashT > 0, chayT: +(P.chayT || 0).toFixed(3),
      tren: s.ten + '#' + s.i, duoi: s.eo ? 'chay#' + s.eo.i : (s.theo ? s.ten + '#' + s.i : (s.ten === 'chay' ? 'chay#' + s.i : s.ten + '#' + s.i)),
      ghep: !!s.eo, chanNguoc: !!(s.eo && G.zedMoi.eoTinh(G.spriteCustom.zed['zed-moi'], s, o) && G.zedMoi.eoTinh(G.spriteCustom.zed['zed-moi'], s, o).rel < 0),
      in: [I.mx, I.my, I.atk ? 1 : 0],
    });
    if (i % 2 === 0) {
      q.setTransform(1, 0, 0, 1, 0, 0); q.fillStyle = '#3a3c48'; q.fillRect(0, 0, cv.width, cv.height);
      q.imageSmoothingEnabled = false;
      q.setTransform(3, 0, 0, 3, 0, 0);
      const ox = 48 - Math.round(P.x), oy = 58 - Math.round(P.y);
      q.translate(ox, oy);
      q.fillStyle = '#2d2f3a'; for (let k = -6; k < 6; k++) q.fillRect(Math.floor((P.x - 60) / 16) * 16 + k * 16 + 8 * (k & 1), P.y + 1, 8, 1);
      G.art.hero(q, o);
      q.setTransform(1, 0, 0, 1, 0, 0); q.fillStyle = '#fff'; q.font = '11px monospace';
      q.fillText((i / 60).toFixed(2) + 's ' + (s.eo ? 'GHEP ' : '') + s.ten + '#' + s.i + (s.eo ? '/chay#' + s.eo.i : ''), 4, 12);
      q.fillText('v=' + Math.round(Math.hypot(vx, vy / 0.75)) + ' face=' + P.face + ' c=' + P.comboI, 4, 24);
      anh.push(cv.toDataURL('image/png'));
    }
  }
  return { log, anh, speed: P.speed, loi: G.zedMoi.loi.slice() };
}
"""

TEN = {1: 'Đứng chém liên tục', 2: 'Chạy phải chém liên tục', 3: 'Chạy trái chém phải', 4: 'Chạy chéo combo 3 nhát',
       5: 'Đổi hướng cần trong lúc chém', 6: 'Chạy + giữ Đánh rồi Né', 7: 'Thả Đánh vẫn giữ cần'}


def nhat(log):
    """Tách các nhát (đoạn u >= 0 liên tục cùng tên/combo)."""
    out, cur = [], None
    for r in log:
        if r['u'] >= 0 and not r['dodge']:
            key = (r['don'], r['combo'])
            if cur is None or key != cur['key'] or r['u'] < cur['rows'][-1]['u']:
                cur = {'key': key, 'rows': []}
                out.append(cur)
            cur['rows'].append(r)
        else:
            cur = None
    return out


def danh_gia(n, R):
    log, sp = R['log'], R['speed']
    ok, ghi = True, []

    def kiem(dk, s):
        nonlocal ok
        ghi.append(('ĐẠT ' if dk else 'KHÔNG ĐẠT ') + s)
        ok = ok and dk
    ns = nhat(log)
    combos = [x['key'][1] for x in ns]
    # hướng đòn và mặt không đổi trong mỗi nhát
    doi = [x for x in ns if len({tuple(r['aim'] or []) for r in x['rows']}) > 1 or len({r['face'] for r in x['rows']}) > 1]
    if n == 1:
        kiem(all(abs(r['v']) < 1e-6 for r in log), 'đứng yên: vận tốc 0 suốt')
        kiem(combos[:6] == [0, 1, 2, 0, 1, 2], 'combo 1→2→3→1… liên tục: %s' % combos[:8])
        gap = [r['i'] for r in log[5:] if r['u'] < 0]
        kiem(len(gap) <= 1, 'không rơi về Đứng giữa combo (khung không đánh sau khung 5: %s)' % gap[:10])
    if n in (2, 3, 4, 5, 6, 7):
        mv = [r for r in log if r['in'][0] or r['in'][1]]
        dung = [r['i'] for r in mv[1:] if not r['moving'] and not r['dodge'] and not r['dash']]  # đang lộn / lướt (Nhát lướt) cũng là đang di chuyển
        kiem(not dung, 'giữ cần thì luôn di chuyển (khung đứng khựng: %s)' % dung[:10])
        ct = [r['chayT'] for r in log]
        kiem(all(b >= a for a, b in zip(ct, ct[1:])), 'nhịp chạy P.chayT không reset khi ra đòn')
    if n in (2, 3, 4):
        thuong = [r['v'] / sp for x in ns for r in x['rows'][1:] if not x['key'][0] in ('Nhát kết',)]
        nang = [r['v'] / sp for x in ns for r in x['rows'][1:] if x['key'][0] in ('Nhát kết',)]
        kiem(min(thuong) >= 0.85 - 1e-6, 'chém thường giữ ≥ 85%% tốc độ (thấp nhất %.0f%%)' % (100 * min(thuong)))
        if nang:
            kiem(min(nang) >= 0.6 - 1e-6, 'nhát kết (đòn nặng) giảm nhẹ ≥ 60%% (thấp nhất %.0f%%)' % (100 * min(nang)))
        kiem(not doi, 'hướng chém + mặt chốt trong từng nhát')
        gh = [r for x in ns for r in x['rows'] if r['tren'].startswith(('kiem_1', 'kiem_2'))]
        kiem(all(r['ghep'] for r in gh), 'kiếm 1/2 khi chạy vẽ ghép eo (chân hàng chạy, thân trên hàng đòn): %d/%d khung' % (sum(r['ghep'] for r in gh), len(gh)))
        duoi = [r['duoi'] for r in log if r['ghep']]
        kiem(len(set(duoi)) >= 6, 'chân vẫn chạy qua nhiều khung chạy khi chém (%d khung chạy khác nhau)' % len(set(duoi)))
    if n == 3:
        at = [r for x in ns for r in x['rows']]
        kiem(all(r['vx'] < 0 for r in at[1:]), 'vẫn chạy sang trái khi chém (vx < 0)')
        kiem(all(r['face'] == 1 and r['aim'][0] > 0 for r in at), 'chém sang phải (P.face = 1, aimX > 0)')
        kiem(all(r['chanNguoc'] for r in at if r['ghep']), 'chân quay theo hướng chạy (trái), thân trên theo hướng chém (phải)')
    if n == 4:
        kiem(combos[:3] == [0, 1, 2], 'combo 3 nhát khi chạy chéo: %s' % combos[:4])
        kiem(all(r['vx'] > 0 and r['vy'] > 0 for r in log[1:]), 'đi chéo suốt (vx > 0, vy > 0)')
    if n == 5:
        kiem(not doi, 'đổi hướng cần giữa nhát: hướng chém + mặt KHÔNG đổi trong nhát (%d nhát đổi)' % len(doi))
        sau = [r for r in log if r['i'] in (21, 22, 41, 42)]
        kiem(all((r['vx'] < 0) == (r['in'][0] < 0) for r in sau), 'hướng chạy theo cần ngay khung đổi')
    if n == 6:
        d0 = next(r['i'] for r in log if r['dodge'])
        kiem(d0 <= 31, 'Né ra ngay khung bấm (khung %d, bấm ở 30) — ngắt đòn đang chém' % d0)
        d1 = max(r['i'] for r in log if r['dodge'])
        sau = log[d1 + 1]
        kiem(sau['moving'] and sau['v'] > 0.8 * sp, 'hết Né còn giữ cần: chạy ngay khung kế (v=%.0f)' % sau['v'])
        kiem(any(r['u'] >= 0 for r in log[d1 + 1:]), 'còn giữ Đánh: đánh tiếp sau Né')
    if n == 7:
        het = max(r['i'] for r in log if r['u'] >= 0)
        sau = log[het + 1:het + 10]
        kiem(all(r['moving'] and r['v'] >= 0.99 * sp for r in sau), 'thả Đánh: hết nhát chạy lại đủ tốc ngay, không khựng')
        kiem(all(r['tren'].startswith('chay') for r in sau), 'hết nhát về hàng chạy (không về Đứng)')
    return ok, ghi


JS_MUOT = r"""
() => {
  const { W, P } = AU.room({ melee: 'sword', lvl: 10 });
  AU.want(P, 'sword');
  P.inv = 1e9; P.hp = P.maxhp = 1e9;
  P.x = W.x0 + 20; P.y = W.geo.cy;
  const dum = AU.dummy(P.x + 34, P.y, { hp: 1e9 });
  const cv = document.createElement('canvas'); cv.width = 96 * 3; cv.height = 72 * 3;
  const q = cv.getContext('2d');
  const out = [], anh = [];
  for (let i = 0; i < 100; i++) {
    AU.inp.mx = 1; AU.inp.atk = true; if (i === 0) AU.inp.atkP = true;
    dum.x = P.x + 34; dum.y = P.y; dum.cd = 1e9; dum.hp = 1e9;
    AU.run(1);
    const o = G.heroArgs(P);
    q.setTransform(1, 0, 0, 1, 0, 0); q.fillStyle = '#3a3c48'; q.fillRect(0, 0, cv.width, cv.height); q.imageSmoothingEnabled = false;
    q.setTransform(3, 0, 0, 3, 0, 0); q.translate(48 - Math.round(P.x), 58 - Math.round(P.y));
    G.art.hero(q, o);
    const t = G.tinhLinh.tip(o);
    const ang = t ? Math.atan2(t.dy, t.dx * (o.face < 0 ? -1 : 1)) * 180 / Math.PI : null;
    out.push({ i, atk: o.atk, face: o.face, ang: ang == null ? null : +ang.toFixed(1), g: t ? [+t.gx.toFixed(1) - Math.round(P.x), +t.gy.toFixed(1) - Math.round(P.y)] : null, combo: P.comboI });
    if (i % 2 === 0) anh.push(cv.toDataURL('image/png'));
  }
  return { out, anh };
}
"""


def muot():
    import statistics
    ra = os.path.join(REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'zed-chay-danh', 'kiem-thu')
    os.makedirs(ra, exist_ok=True)
    kq, gif = {}, {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for ten, q in (('cu', '?cloud=0&zedmoi=0'), ('moi', '?cloud=0')):
            pg = b.new_page(viewport={'width': 844, 'height': 390})
            pg.goto('file://' + ROOT + '/dist/linh-khi.html' + q)
            pg.wait_for_function('window.G && G.scene', timeout=60000)
            for f in ['bot.js', 'setup.js', 'au_lib.js']:
                pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
            pg.evaluate("() => { const SC = G.spriteCustom; if (SC.canAnh) ['zed-moi', 'zed-vk', 'em-be-smith', 'em-be-smith-don'].forEach((m) => SC.canAnh(m)); }")
            pg.wait_for_timeout(4000)
            R = pg.evaluate(JS_MUOT)
            rows = R['out']
            d = []
            for a, c in zip(rows, rows[1:]):
                if a['atk'] >= 0 and c['atk'] >= 0 and a['ang'] is not None and c['ang'] is not None and a['face'] == c['face']:
                    d.append(abs(((c['ang'] - a['ang']) + 180) % 360 - 180))
            co = sum(1 for r in rows if r['atk'] >= 0 and r['ang'] is not None)
            dd = sorted(d)
            kq[ten] = {'khung_danh_co_vk': co, 'khung_danh': sum(1 for r in rows if r['atk'] >= 0), 'lech_max': round(max(d), 1) if d else None,
                       'lech_tb': round(statistics.mean(d), 1) if d else None, 'lech_p95': round(dd[int(0.95 * (len(dd) - 1))], 1) if d else None,
                       'so_cap': len(d), 'log': rows}
            gif[ten] = [Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB') for u in R['anh']]
            pg.close()
        b.close()
    fr = []
    for a, c in zip(gif['cu'], gif['moi']):
        im = Image.new('RGB', (a.width * 2, a.height)); im.paste(a, (0, 0)); im.paste(c, (a.width, 0)); fr.append(im)
    fr[0].save(os.path.join(ra, 'muot-cu-moi.gif'), save_all=True, append_images=fr[1:], duration=33, loop=0)
    json.dump(kq, open(os.path.join(ra, 'muot.json'), 'w'), ensure_ascii=False, indent=0)
    for k, v in kq.items():
        print(k, {a: b for a, b in v.items() if a != 'log'})


def main():
    if '--muot' in sys.argv:
        return muot()
    os.makedirs(RA, exist_ok=True)
    tong = {}
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/dist/linh-khi.html' + ('?chaydanh=0&cloud=0' if CU else '?cloud=0'))
        pg.wait_for_function('window.G && G.scene', timeout=60000)
        for f in ['bot.js', 'setup.js', 'au_lib.js']:
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        pg.evaluate("() => { const SC = G.spriteCustom; SC.canAnh && (SC.canAnh('zed-moi'), SC.canAnh('zed-vk')); }")
        pg.wait_for_function("() => G.spriteCustom.zed && G.spriteCustom.zed['zed-moi'].ready && G.spriteCustom.zed['zed-vk'].ready", timeout=60000)
        for n in range(1, 8):
            R = pg.evaluate(JS, [n, CU])
            ok, ghi = danh_gia(n, R)
            fr = [Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB') for u in R['anh']]
            fr[0].save(os.path.join(RA, 'chay-danh-%d.gif' % n), save_all=True, append_images=fr[1:], duration=33, loop=0)
            k = fr[::3][:16]
            dai = Image.new('RGB', (k[0].width * 8, k[0].height * ((len(k) + 7) // 8)))
            for j, im in enumerate(k):
                dai.paste(im, ((j % 8) * im.width, (j // 8) * im.height))
            dai.save(os.path.join(RA, 'dai-%d.png' % n), optimize=True)
            json.dump({'ten': TEN[n], 'dat': ok, 'ghi': ghi, 'speed': R['speed'], 'log': R['log']}, open(os.path.join(RA, 'kq-%d.json' % n), 'w'), ensure_ascii=False, indent=0)
            tong[n] = {'ten': TEN[n], 'dat': ok, 'ghi': ghi, 'loi_ve': R['loi']}
            print('== %d. %s: %s' % (n, TEN[n], 'ĐẠT' if ok else 'KHÔNG ĐẠT'))
            for g in ghi:
                print('   ', g)
        b.close()
    tong['loi_trang'] = errs
    json.dump(tong, open(os.path.join(RA, 'kq.json'), 'w'), ensure_ascii=False, indent=1)
    print('Lỗi trang:', errs[:5])
    print('Kết quả:', sum(1 for n in range(1, 8) if tong[n]['dat']), '/ 7 đạt')


if __name__ == '__main__':
    main()
