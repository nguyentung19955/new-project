#!/usr/bin/env python3
"""Ảnh soát tĩnh xem-noi-gian.png: DÒNG THỜI GIAN chuỗi chiêu của mỗi trùm ở pha 1 / 2 / 3 (trùm nhỏ: pha 1 / 2), kèm một hàng "cũ"
(?giancu=1) để so — thấy nhịp nhanh dần, đòn dày dần, nghỉ ngắn dần, nối chiêu.

Không mở trình duyệt, không vẽ game, không chơi: luật game chạy trong Node (game/tests/node_trang.js, cùng mô hình tính số của bot cân bằng).
Trùm đứng trong phòng trùm trống, em bé đứng yên một chỗ (không nhận sát thương, không đánh). Đặt máu trùm vào đúng pha, chờ cảnh chuyển pha
xong rồi ghi 12 giây: lúc ra chiêu (tên chiêu), lúc mỗi vùng đỏ hiện (vạch báo trước) và nổ, loạt đạn, lúc trùm bận / mệt / nghỉ, chiêu nối.

  python3 docs/review/ke-hoach-cai-thien/noi-gian-manh/ve_xem.py

Ghi chú hình: thanh xanh = trùm đang ra chiêu (bận) · tím = mệt sau chiêu lớn (cửa phản công) · xám nhạt = nghỉ ·
vạch vàng = vùng đỏ đang báo trước, chấm đỏ = lúc nổ · tam giác cam = loạt đạn bay ra · chữ đỏ "nối" = chiêu nối liền chiêu trước.
Cột bên phải: số chiêu / 12 giây, số lần nổ + loạt đạn, báo trước ngắn nhất, tổng thời gian nghỉ + mệt.
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
GAME = os.path.join(ROOT, 'game')
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

OUT = os.path.join(HERE, 'xem-noi-gian.png')
GIAY = 12.0

JS = r"""
([r, big, ph, cu, giay, seed]) => {
  G.NOI_GIAN_BAT = !cu;
  G.testSave({ hero: 'smith', melee: 'sword', lvl: 20 });
  G.rnd = G.srand(seed);
  G.startStage(r, big ? 4 : 1, 0, { kind: 'A', seed: 3 });
  const S = G.getRun();
  G.gotoRoom(S.map.boss);
  const W = G.getWorld(), P = S.P, b = W.boss;
  W.waves = []; W.spawns = []; W.ents = []; W.projs = []; W.zones = []; W.banner = null;
  const h0 = G.hurtPlayer, s0 = G.sfx, bi0 = G.botInput;
  G.hurtPlayer = () => false;
  G.botInput = () => ({ mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, skill: false, swapP: false, potionP: false, pauseP: false, mapP: false });
  const ev = { cast: [], zone: [], shot: [], busy: [], tired: [], name: b.name, maxhp: b.maxhp };
  let t = 0, rec = false;
  G.sfx = function (n, p) { if (rec && n === 'warn') ev.cast.push({ t, ten: b.skillName || '?', noi: false }); return s0.call(this, n, p); };
  const ghim = () => { P.x = W.geo.cx - 70; P.y = W.geo.cy + 6; P.inv = 0; P.hp = P.maxhp; };
  try {
    b.invuln = 0; b.intro = 0; b.busy = 0;
    // vào đúng pha: đặt máu, chờ cảnh chuyển pha (trùm vùng) xong
    b.hp = b.maxhp * (ph === 0 ? 0.99 : ph === 1 ? (big ? 0.6 : 0.45) : 0.3);
    for (let i = 0; i < 900; i++) { ghim(); G.sim(1); if (b.phase === ph && !(b.invuln > 0) && !(b.busy > 0) && i > 5) break; }
    W.zones = []; W.projs = []; b.seq.length = 0; b.cd = 0.25; b.ngConLai = 0;
    const seen = new Set(), seenP = new Set();
    rec = true;
    const N = Math.round(giay * 60);
    let bz = null, tz = null;
    for (let i = 0; i < N; i++) {
      t = i / 60;
      const noiTruoc = b.ngConLai > 0;
      const nc = ev.cast.length;
      ghim(); G.sim(1);
      if (ev.cast.length > nc && noiTruoc) ev.cast[ev.cast.length - 1].noi = true;
      for (const z of W.zones) {
        if (seen.has(z)) continue; seen.add(z);
        if (z.team === 'player' || z.team === 'fx' || z.ct) continue;
        if (z.wall) { ev.zone.push({ t, bao: z.wait || 0, wall: 1 }); continue; }
        if (z.pool || !(z.t0 > 0) || z.ctBao) continue; // vũng ở lại / vùng chỉ để báo
        ev.zone.push({ t, bao: z.t0, sh: z.shape });
      }
      let moi = 0;
      for (const o of W.projs) { if (seenP.has(o)) continue; seenP.add(o); if (o.team === 'enemy') moi++; }
      if (moi) ev.shot.push({ t, n: moi });
      const ban = b.busy > 0 && !(b.tired > 0), met = b.tired > 0;
      if (ban && !bz) bz = { a: t }; if (!ban && bz) { bz.b = t; ev.busy.push(bz); bz = null; }
      if (met && !tz) tz = { a: t }; if (!met && tz) { tz.b = t; ev.tired.push(tz); tz = null; }
    }
    if (bz) { bz.b = giay; ev.busy.push(bz); } if (tz) { tz.b = giay; ev.tired.push(tz); }
  } finally { G.hurtPlayer = h0; G.sfx = s0; G.botInput = bi0; G.NOI_GIAN_BAT = true; }
  ev.phase = b.phase;
  return ev;
}
"""

# (vùng, trùm vùng?, tên hiển thị)
TRUM = [(0, True, 'Mộc Tinh'), (1, True, 'Ngư Tinh'), (2, True, 'Hồ Tinh'), (0, False, 'Nấm Chúa'), (1, False, 'Cua Đá'), (2, False, 'Hổ Lửa')]
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONTB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f8, f9, f10b, f15b = ImageFont.truetype(FONT, 8), ImageFont.truetype(FONT, 9), ImageFont.truetype(FONTB, 10), ImageFont.truetype(FONTB, 15)


def ghi():
    errs = []
    pg = cd_lib.NodePage(errs)
    hang = []
    for (r, big, ten) in TRUM:
        phs = [0, 1, 2] if big else [0, 1]
        for ph in phs:
            hang.append((ten, big, ph, False, pg.evaluate(JS, [r, big, ph, False, GIAY, 11 + ph])))
        hang.append((ten, big, phs[-1], True, pg.evaluate(JS, [r, big, phs[-1], True, GIAY, 11 + phs[-1]])))
    pg.close() if hasattr(pg, 'close') else None
    return hang


def ve(hang):
    L, X0, PX, RH = 10, 196, 92, 40   # lề, đầu trục thời gian, điểm ảnh mỗi giây, cao một hàng
    X1 = X0 + int(GIAY * PX)
    WD = X1 + 250
    top = 84
    H = top + len(hang) * RH + 20 + (len(TRUM) - 1) * 6
    im = Image.new('RGB', (WD, H), (24, 22, 30))
    d = ImageDraw.Draw(im, 'RGBA')
    d.text((L, 8), 'Nổi giận mạnh — dòng thời gian 12 giây mỗi pha (luật thật, chạy Node, em bé đứng yên)', font=f15b, fill=(255, 220, 160))
    d.text((L, 30), 'xanh = đang ra chiêu · tím = mệt (cửa phản công) · nền xám = nghỉ · vạch vàng = vùng đỏ báo trước, chấm đỏ = nổ · ▲ cam = loạt đạn · "nối" = chiêu nối liền',
           font=f9, fill=(220, 220, 220))
    d.text((L, 44), 'Hàng "cũ" = cùng pha cuối với cờ ?giancu=1 (trước phiên này). Cột phải: chiêu / 12 giây · nổ + loạt đạn · báo trước ngắn nhất · nghỉ + mệt.',
           font=f9, fill=(200, 200, 200))
    for s in range(int(GIAY) + 1):
        x = X0 + s * PX
        d.line([(x, top - 8), (x, H - 14)], fill=(70, 70, 84), width=1)
        d.text((x - 3, top - 20), f'{s}s', font=f8, fill=(170, 170, 180))
    y = top
    truoc = None
    for (ten, big, ph, cu, ev) in hang:
        if truoc is not None and truoc != ten:
            y += 6
            d.line([(L, y - 3), (WD - L, y - 3)], fill=(110, 100, 130), width=1)
        truoc = ten
        nhan = ['pha 1', 'pha 2 nổi giận', 'pha 3 hóa cuồng'][ph] if big else ['pha 1', 'pha 2 nổi giận'][ph]
        if cu:
            nhan = (['pha 1', 'pha 2', 'pha 3'][ph] if big else 'máu ≤ 50%') + ' — CŨ'
        d.rectangle([X0, y + 2, X1, y + RH - 4], fill=(48, 46, 58) if not cu else (40, 38, 44))
        d.text((L, y + 6), ten, font=f10b, fill=(255, 200, 140) if not cu else (170, 160, 150))
        d.text((L, y + 20), nhan, font=f9, fill=(255, 120, 100) if (ph > 0 and not cu) else (190, 190, 190))
        X = lambda t: X0 + t * PX
        for s in ev['busy']:
            d.rectangle([X(s['a']), y + 4, X(s['b']), y + 14], fill=(70, 130, 230, 220))
        for s in ev['tired']:
            d.rectangle([X(s['a']), y + 4, X(s['b']), y + 14], fill=(160, 80, 200, 230))
        for c in ev['cast']:
            x = X(c['t'])
            d.line([(x, y + 2), (x, y + RH - 4)], fill=(255, 255, 255, 160), width=1)
            if x < X1 - 30: d.text((x + 2, y + 15), c['ten'][:max(3, min(16, int((X1 - x) / 5.5)))], font=f8, fill=(235, 235, 235))
            if c['noi']:
                d.text((x + 2, y + 25), 'nối', font=f8, fill=(255, 90, 70))
        k = 0
        for z in ev['zone']:
            a, b2 = X(z['t']), X(z['t'] + z['bao'])
            cat = b2 > X1
            if cat: b2 = X1  # nổ sau 12 giây: cắt ở mép trục, không chấm nổ
            yy = y + 26 + (k % 3) * 3
            k += 1
            d.line([(a, yy), (b2, yy)], fill=(255, 210, 60, 210), width=2)
            if not cat: d.ellipse([b2 - 2, yy - 2, b2 + 2, yy + 2], fill=(255, 50, 30))
        for s in ev['shot']:
            x = X(s['t'])
            d.polygon([(x, y + RH - 6), (x - 3, y + RH - 1), (x + 3, y + RH - 1)], fill=(255, 150, 40))
        nZ = len(ev['zone']) + len(ev['shot'])
        baoMin = min([z['bao'] for z in ev['zone'] if z['bao'] > 0] or [0])
        ban = sum(s['b'] - s['a'] for s in ev['busy'])
        met = sum(s['b'] - s['a'] for s in ev['tired'])
        nghi = GIAY - ban - met
        d.text((X1 + 10, y + 4), f"{len(ev['cast'])} chiêu · {nZ} đòn", font=f10b, fill=(255, 230, 200) if not cu else (180, 170, 160))
        d.text((X1 + 10, y + 18), f"báo trước ngắn nhất {baoMin:.2f} s".replace('.', ','), font=f9, fill=(220, 220, 220))
        d.text((X1 + 10, y + 29), f"nghỉ {nghi:.1f} s · mệt {met:.1f} s".replace('.', ','), font=f9, fill=(200, 200, 200))
        y += RH
    im.save(OUT)
    return OUT


if __name__ == '__main__':
    h = ghi()
    json.dump([[a, b, c, d, e] for (a, b, c, d, e) in h], open(os.path.join(HERE, 'xem-noi-gian.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print(ve(h))
    for (ten, big, ph, cu, ev) in h:
        print(ten, 'pha', ph + 1, 'CŨ' if cu else '', '|', len(ev['cast']), 'chiêu', sum(1 for c in ev['cast'] if c['noi']), 'nối |',
              len(ev['zone']), 'vùng', len(ev['shot']), 'loạt đạn | báo trước ngắn nhất', round(min([z['bao'] for z in ev['zone'] if z['bao'] > 0] or [0]), 2))
