"""Đo cân bằng bằng bot với bản lưu cố định cho từng ải (không phụ thuộc vận may nhặt đồ như campaign.py).
Mỗi ải chạy n lần, in thời gian trung bình, tỉ lệ thắng, dấu ấn, số quái hạ, thời gian đánh trùm.
Bản lưu: tests/cay_luu.json (dựng lại: python3 tests/cay.py 3 --luu=tam.json rồi lấy một bản mỗi ải).
Chạy: python3 tests/balance.py [n mỗi ải, mặc định 3] [đường dẫn index.html khác để so với bản cũ] [danh sách ải 0..14, cách nhau bằng dấu phẩy]
       python3 tests/balance.py n - [ải] vukhi   chạy lại với từng loại vũ khí (kiếm, cung, giáo, búa) thay cho vũ khí của bản lưu
                                               (vukhi:spear,bow: chỉ chạy vài loại)
Ngưỡng (cân bằng phải cày): bản lưu vừa đủ sức mạnh khuyên dùng thì bot thắng từ 60% số lượt (thiết kế khoảng 75%);
khi chạy "vukhi" thì loại vũ khí nào cũng phải thắng từ 50% (không loại nào vô dụng).
Thời gian đánh trùm tính tới lúc trùm gục (sau đó bot còn đi nhặt đồ và vào cổng dịch chuyển). Thoát mã 1 nếu dưới ngưỡng."""
import sys, json
from playwright.sync_api import sync_playwright

# Cân bằng phải cày: mỗi bản lưu là bản lưu thật của bot tests/cay.py lúc vừa đủ "Sức mạnh khuyên dùng" của ải (đã cày xong),
# nên tỉ lệ thắng ở đây là tỉ lệ thắng của người chơi vừa đủ sức mạnh khuyên dùng.
# Mặc định dùng bản lưu thật trong tests/cay_luu.json (cấp, vũ khí, dòng phụ, bùa, đồ, điểm kỹ năng đúng như người chơi);
# thêm "codinh" để dùng bộ số dựng tay dưới đây (tests/setup.js G.testSave).
SAVES = [  # (cấp, bậc, mài, áo, mũ, vũ khí cận chiến, dấu ấn Lửa)
    (1, 0, 0, None, None, 'sword', 0), (3, 1, 1, None, 'h_r1', 'sword', 8), (4, 1, 2, None, 'h_r1', 'sword', 10), (5, 2, 2, None, 'h_r1', 'sword', 30), (8, 2, 5, 'a_r1', 'h_r1', 'sword', 40),
    (9, 3, 5, 'a_r1', 'h_moc', 'spear', 45), (11, 3, 6, 'a_r1', 'h_moc', 'spear', 60), (14, 3, 6, 'a_moc', 'h_moc', 'spear', 90), (17, 3, 7, 'a_moc', 'h_moc', 'spear', 130), (20, 3, 7, 'a_moc', 'h_moc', 'spear', 160),
    (22, 3, 7, 'a_ngu', 'h_ngu', 'spear', 190), (23, 3, 8, 'a_ngu', 'h_ngu', 'spear', 220), (25, 3, 10, 'a_ngu', 'h_ngu', 'spear', 260), (28, 3, 10, 'a_ngu', 'h_ngu', 'spear', 300), (30, 3, 10, 'a_ngu', 'h_ngu', 'spear', 330),
]
JS = r"""
([r, i, sv, wt]) => {
  if (typeof sv === 'string') {
    // bản lưu thật (tests/cay_luu.json): vũ khí cận chiến đang mang đổi sang loại wt khi chạy "vukhi"
    G.save = G.fixSave(JSON.parse(sv)); G.save.sound = false;
    if (wt && wt !== 'bow') G.weaponById(G.save.carry[0]).type = wt;
  } else G.testSave({ lvl: sv[0], tier: sv[1], sharpen: sv[2], armor: sv[3], helm: sv[4], melee: wt && wt !== 'bow' ? wt : sv[5], branch: sv[6] ? 'fire' : null, marks: sv[6] });
  G.botCfg.prefer = wt || null;
  G.startStage(r, i, 0);
  if (wt === 'bow') G.getRun().P.cur = 1;
  const S0 = G.getRun(), pw = S0.power, rec = S0.rec;
  const res = G.probeRun(900), S = G.getRun();
  const last = res.rooms && res.rooms.length ? res.rooms[res.rooms.length - 1] : ['?', 0];
  if (res.bossT != null) last[1] = res.bossT;
  let fight = 0; for (const x of res.rooms || []) if (x[0] !== 'boss') fight += x[1];
  return { pw, rec, win: !!res.win, t: res.t, boss: last[0] === 'boss' ? last[1] : null, fight, marks: res.marks || 0, kills: res.kills || 0, hp: res.hp, maxhp: res.maxhp, potions: res.potions, bad: res.bad, kind: S && S.map ? S.map.kind : '-', hurt: Object.values(res.hurt || {}).reduce((a, b) => a + b, 0) };
}
"""

REAL = json.load(open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), 'cay_luu.json')))

def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    url = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != '-' else 'file://' + __import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__))) + '/index.html'
    errs = []
    tot = {'t': 0, 'win': 0, 'n': 0, 'marks': 0, 'kills': 0, 'boss': 0, 'bn': 0, 'hurt': 0}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(url)
        pg.wait_for_timeout(1500)
        base = url.rsplit('/', 1)[0].replace('file://', '')
        pg.add_script_tag(path=base + '/tests/bot.js')
        pg.add_script_tag(path=base + '/tests/setup.js')
        only = [int(x) for x in sys.argv[3].split(',')] if len(sys.argv) > 3 and sys.argv[3] != '-' and not sys.argv[3].startswith('vukhi') else range(15)
        vk = [a for a in sys.argv if a.startswith('vukhi')]
        wts = (vk[0].split(':')[1].split(',') if ':' in vk[0] else ['sword', 'bow', 'spear', 'hammer']) if vk else [None]  # vukhi:spear,bow để chạy vài loại
        per = {}
        for wt in wts:
          if wt: print('== vũ khí:', wt)
          for k in only:
            r, i = divmod(k, 5)
            sv = list(SAVES[k]) if 'codinh' in sys.argv else REAL[k]
            rs = [pg.evaluate(JS, [r, i, sv, wt]) for _ in range(n)]
            wins = [x for x in rs if x['win']]
            src = wins or rs
            avg = lambda key: sum((x[key] or 0) for x in src) / len(src)
            print(f"{r+1}-{i+1}: sức mạnh {rs[0]['pw']}/{rs[0]['rec']} thắng {len(wins)}/{n} | {avg('t'):>4.0f}s (đánh quái {avg('fight'):>4.0f}s, trùm {avg('boss'):>3.0f}s) | dấu ấn {avg('marks'):>5.1f} | hạ {avg('kills'):>4.1f} quái | mất {avg('hurt'):>4.0f} máu trên {src[0]['maxhp']} | kiểu {''.join(x['kind'] for x in rs)}" + (' LỖI ' + str([x['bad'] for x in rs if x['bad']]) if any(x['bad'] for x in rs) else ''))
            sys.stdout.flush()
            tot['n'] += n; tot['win'] += len(wins)
            pw = per.setdefault(wt, {'n': 0, 'win': 0, 't': 0})
            pw['n'] += n; pw['win'] += len(wins)
            for x in wins:
                pw['t'] += x['t']
                tot['t'] += x['t']; tot['marks'] += x['marks']; tot['kills'] += x['kills']; tot['hurt'] += x['hurt'] / x['maxhp']
                if x['boss']: tot['boss'] += x['boss']; tot['bn'] += 1
        b.close()
    w = max(1, tot['win'])
    print(f"TỔNG: thắng {tot['win']}/{tot['n']} | một ải trung bình {tot['t']/w:.0f} giây ({tot['t']/w/60:.1f} phút) | trùm {tot['boss']/max(1,tot['bn']):.0f} giây | dấu ấn {tot['marks']/w:.1f} mỗi ải | hạ {tot['kills']/w:.1f} quái mỗi ải | mất {tot['hurt']/w*100:.0f}% máu mỗi ải")
    bad = 0
    if tot['win'] < 0.6 * tot['n']: print('SAI: bot thắng dưới 60% số lượt'); bad = 1
    if len(per) > 1:
        for wt, pw in per.items():
            print(f"  {wt}: thắng {pw['win']}/{pw['n']}, một ải trung bình {pw['t']/max(1,pw['win']):.0f} giây")
            if pw['win'] < 0.5 * pw['n']: print('SAI:', wt, 'thắng dưới 50% (vũ khí quá yếu)'); bad = 1
    if errs: print('LỖI TRANG:', errs[:3]); bad = 1
    sys.exit(bad)

main()
