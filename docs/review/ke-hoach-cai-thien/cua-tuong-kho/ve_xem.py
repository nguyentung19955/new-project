#!/usr/bin/env python3
"""Ảnh soát tĩnh xem-cua-da.png (không trình duyệt, không vẽ game): 
  Hàng trên — BẢN ĐỒ NHIỆT "máu mất theo chỗ đứng" của Cua Đá cũ (?cuade=1) và mới: sàn phòng trùm chia lưới 8 × 6, mỗi ô là % máu tối đa
  mất mỗi phút khi em bé giữ chỗ đó (bot cân bằng tự né rồi quay về; TB ải 2-1, 2-2, 2-3 × pha 1, 2). Số liệu: xem-cua-da.json (do_cho_dung.py cua).
  Hàng dưới — SƠ ĐỒ CHIÊU, vẽ đúng các vùng trùm tạo ra trong Node (ép trùm ra chiêu bằng G.bossDebug): Tường tinh thể cũ / mới, Đập càng mới,
  Kẹp càng mới. Chấm trắng = em bé, chấm nâu = Cua Đá.
  python3 ve_xem.py
"""
import json, math, os, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

F = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f11, f13, f15, f20 = (ImageFont.truetype(F, s) for s in (11, 13, 15, 20))
b15, b20 = ImageFont.truetype(FB, 15), ImageFont.truetype(FB, 20)
NEN, CHU, MO = (24, 26, 38), (235, 235, 240), (150, 155, 175)

JS = r"""
(o) => {
  G.CUA_MOI = !o.cu;
  G.save = G.fixSave(JSON.parse(o.sv)); G.save.sound = false;
  G.startStage(1, 1, 0);
  const S = G.getRun(); G.gotoRoom(S.map.boss);
  const W = G.getWorld(), b = W.boss, P = S.P;
  G.botInput = () => ({ mx: 0, my: 0 });
  for (let f = 0; f < 200; f++) { G.sim(1); P.hp = P.maxhp; }
  if (o.pha) { b.hp = b.maxhp * 0.4; G.sim(2); }
  const X = W.x0 + o.pt[0] * (W.x1 - W.x0), Y = W.y0 + o.pt[1] * (W.y1 - W.y0);
  P.x = X; P.y = Y; b.x = W.x0 + o.bpt[0] * (W.x1 - W.x0); b.y = W.y0 + o.bpt[1] * (W.y1 - W.y0);
  W.zones = W.zones.filter((z) => z.src !== b); b.seq = []; b.busy = 0; b.st.stun = 0; b.lunge = null; b.luotCd = 99;
  const z0 = new Set(W.zones), log = [], bx = b.x, by = b.y, t0 = G.time;
  G.bossDebug(o.k); b.cd = 0;
  for (let f = 0; f < 60 * o.giay; f++) {
    G.sim(1); P.hp = P.maxhp; P.x = X; P.y = Y; P.inv = 9; b.x = bx; b.y = by; if (f > 5) b.cd = 99;
    for (const z of W.zones) if (!z0.has(z)) { z0.add(z); if (z.src === b || (z.ct && z.ct.chan)) log.push({ sh: z.shape, x: z.x, y: z.y, r: z.r, r0: z.r0, r1: z.r1, ang: z.ang, len: z.len, w: z.w, span: z.span, t0: z.t0, at: G.time - t0, skill: z.skill, chan: z.ct && z.ct.chan ? z.ct.chan.map((t) => [t.x, t.y0, t.y1]) : null }); }
  }
  try { S.quit = true; G.finishStage(false); } catch (e) { /* bỏ qua */ }
  return { log, X, Y, bx, by, x0: W.x0, x1: W.x1, y0: W.y0, y1: W.y1, ZK: G.ZK };
}
"""


def mau(v, vmax=160):
    u = max(0.0, min(1.0, v / vmax))
    stops = [(0, (40, 70, 140)), (0.35, (60, 160, 120)), (0.65, (235, 200, 60)), (1, (220, 60, 50))]
    for (a, ca), (b, cb) in zip(stops, stops[1:]):
        if u <= b:
            k = (u - a) / (b - a)
            return tuple(int(ca[i] + (cb[i] - ca[i]) * k) for i in range(3))
    return stops[-1][1]


def nhiet(d, ox, oy, tb, tom, ten):
    cw, ch = 64, 46
    d.text((ox, oy - 30), ten, font=b20, fill=CHU)
    for y in range(6):
        for x in range(8):
            v = tb[y * 8 + x]
            d.rectangle([ox + x * cw, oy + y * ch, ox + (x + 1) * cw - 2, oy + (y + 1) * ch - 2], fill=mau(v))
            s = f"{v:.0f}"
            w = d.textlength(s, font=f15)
            d.text((ox + x * cw + (cw - w) / 2 - 1, oy + y * ch + 13), s, font=f15, fill=(15, 15, 20))
    d.text((ox, oy + 6 * ch + 6), '   '.join(f"{k} {v:.0f}" for k, v in tom.items()), font=f15, fill=CHU)


def san(d, ox, oy, r, k=1.15):
    X = lambda x: ox + (x - r['x0']) * k
    Y = lambda y: oy + (y - r['y0']) * k
    d.rectangle([X(r['x0']), Y(r['y0']), X(r['x1']), Y(r['y1'])], fill=(46, 52, 70), outline=(110, 115, 140))
    return X, Y, k


def ve_vung(d, X, Y, k, r, z, col, rong=1):
    ZK = r['ZK']
    if z['sh'] == 'circle':
        d.ellipse([X(z['x'] - z['r']), Y(z['y'] - z['r'] * ZK), X(z['x'] + z['r']), Y(z['y'] + z['r'] * ZK)], outline=col, width=2)
    elif z['sh'] == 'donut':
        for rr in (z['r0'], z['r1']):
            d.ellipse([X(z['x'] - rr), Y(z['y'] - rr * ZK), X(z['x'] + rr), Y(z['y'] + rr * ZK)], outline=col, width=1)
    elif z['sh'] == 'line':
        c, s, h = math.cos(z['ang']), math.sin(z['ang']), z['w'] / 2
        p = [(z['x'] - s * h, z['y'] + c * h), (z['x'] + s * h, z['y'] - c * h), (z['x'] + c * z['len'] + s * h, z['y'] + s * z['len'] - c * h), (z['x'] + c * z['len'] - s * h, z['y'] + s * z['len'] + c * h)]
        d.polygon([(X(a), Y(b)) for a, b in p], outline=col, fill=col + (60,) if len(col) == 3 else col)
    elif z['sh'] == 'cone':
        pts = [(X(z['x']), Y(z['y']))]
        for i in range(17):
            a = z['ang'] - z['span'] / 2 + z['span'] * i / 16
            pts.append((X(z['x'] + math.cos(a) * z['r']), Y(z['y'] + math.sin(a) * z['r'])))
        d.polygon(pts, outline=col, fill=col + (60,))


def cham(d, X, Y, x, y, col, r=5):
    d.ellipse([X(x) - r, Y(y) - r, X(x) + r, Y(y) + r], fill=col, outline=(0, 0, 0))


def main():
    pg = cd_lib.NodePage([])
    sv = json.load(open(os.path.join(GAME, 'tests', 'cay_luu.json')))[6]
    q = lambda **o: pg.evaluate(JS, dict({'sv': sv, 'pha': 0, 'cu': 0, 'giay': 6}, **o))
    tuongCu = q(cu=1, k='chieu2', pt=(0.5, 0.0), bpt=(0.75, 0.45))
    tuongMoi = q(k='chieu2', pt=(0.62, 0.05), bpt=(0.3, 0.5))
    dap = q(k='chieu1', pha=1, pt=(0.92, 0.02), bpt=(0.55, 0.45), giay=1.6)
    dapGan = q(k='chieu1', pt=(0.1, 0.45), bpt=(0.25, 0.55), giay=1.4)
    kepGan = q(k='atk', pt=(0.2, 0.75), bpt=(0.33, 0.62), giay=1.2)
    kepXa = q(k='atk', pt=(0.92, 0.12), bpt=(0.7, 0.3), giay=1.2)
    pg.close()
    J = json.load(open(os.path.join(HERE, 'xem-cua-da.json')))

    img = Image.new('RGB', (1380, 860), NEN)
    d = ImageDraw.Draw(img, 'RGBA')
    d.text((20, 12), 'Cua Đá — đứng sát mép còn an toàn không? (mô phỏng Node, không trình duyệt)', font=b20, fill=CHU)
    d.text((20, 40), f"Ô = % máu tối đa mất mỗi phút khi em bé giữ chỗ đó (bot cân bằng tự né rồi quay về; TB 2-1, 2-2, 2-3 × pha 1, 2; {J['lap']} phút mỗi ô). Hàng TB: trung bình từng mép và 4 × 2 ô giữa.", font=f13, fill=MO)
    nhiet(d, 30, 100, J['cu']['tb'], J['cu']['tom'], 'CŨ (?cuade=1): mép trên / dưới gần như không mất máu')
    nhiet(d, 720, 100, J['moi']['tb'], J['moi']['tom'], 'MỚI: không còn mép an toàn (mép ≥ giữa)')
    # thang màu
    for i in range(200):
        d.line([(600 + i, 412), (600 + i, 420)], fill=mau(i * 0.8))
    d.text((585, 409), '0', font=f11, fill=MO); d.text((805, 409), '160+ %/phút', font=f11, fill=MO)

    oy = 480
    pans = [('Tường tinh thể CŨ (giữa phòng)', tuongCu, 'tuong'), ('Tường tinh thể MỚI (nhốt em bé)', tuongMoi, 'tuong'),
            ('Đập càng MỚI (pha 2)', dap, 'dap'), ('Kẹp càng MỚI', kepXa, 'kep')]
    for i, (ten, r, kieu) in enumerate(pans):
        ox = 20 + i * 340
        d0 = d
        d0.text((ox, oy - 24), ten, font=b15, fill=CHU)
        lop = Image.new('RGBA', img.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(lop, 'RGBA')
        X, Y, k = san(d, ox, oy, r)
        hop = (int(X(r['x0'])), int(Y(r['y0'])), int(X(r['x1'])) + 1, int(Y(r['y1'])) + 1)
        def dan():  # dán lớp vẽ, cắt theo khung sàn (vùng tràn ra ngoài phòng không vẽ)
            m = lop.crop(hop); img.paste(m, hop[:2], m)
        if kieu == 'tuong':
            loat = sorted({round(z['at'], 1) for z in r['log'] if z['sh'] == 'line' and z['skill'] == 'Tường tinh thể' and abs(math.sin(z['ang'])) < 0.01})
            for z in r['log']:
                if z['sh'] == 'line' and z['skill'] == 'Tường tinh thể' and abs(math.sin(z['ang'])) < 0.01:
                    j = loat.index(round(z['at'], 1))
                    ve_vung(d, X, Y, k, r, z, [(255, 150, 60), (190, 110, 255), (255, 90, 90)][j % 3])
            for z in r['log']:
                if z['chan']:
                    for (x, y0, y1) in z['chan']:
                        d.line([(X(x), Y(max(y0, r['y0']))), (X(x), Y(min(y1, r['y1'])))], fill=(170, 235, 255), width=5)
            cham(d, X, Y, r['X'], r['Y'], (255, 255, 255)); cham(d, X, Y, r['bx'], r['by'], (150, 100, 60), 7); dan(); d = d0
            d.text((ox, oy + 222), 'cam = mảnh loạt 1, tím = loạt 2 (so le)', font=f11, fill=MO)
            if 'CŨ' in ten:
                d.text((ox, oy + 236), 'sát mép trên / dưới: không mảnh nào tới', font=f11, fill=(255, 210, 120))
            else:
                d.text((ox, oy + 236), 'vạch xanh = tường, chỗ hở = khe thoát', font=f11, fill=MO)
            continue
        elif kieu == 'dap':
            for z in r['log']:
                col = (255, 90, 90) if z['sh'] in ('circle', 'donut') and (z.get('r') or 0) != 18 else (255, 200, 80) if z['sh'] == 'circle' else (255, 140, 60)
                ve_vung(d, X, Y, k, r, z, col)
            cham(d, X, Y, r['X'], r['Y'], (255, 255, 255)); cham(d, X, Y, r['bx'], r['by'], (150, 100, 60), 7); dan(); d = d0
            d.text((ox, oy + 222), 'đỏ = vòng đập + vành; cam = vết nứt tới mép', font=f11, fill=MO)
            d.text((ox, oy + 236), 'vàng = đá rơi dọc chân tường (bé xa, sát mép)', font=f11, fill=MO)
            continue
        else:
            for rr, col in ((kepXa, (255, 120, 80)), (kepGan, (120, 200, 255))):
                X2, Y2 = X, Y
                for z in rr['log']:
                    if z['sh'] == 'cone':
                        ve_vung(d, X2, Y2, k, rr, z, col)
                cham(d, X2, Y2, rr['X'], rr['Y'], (255, 255, 255)); cham(d, X2, Y2, rr['bx'], rr['by'], (150, 100, 60), 7)
            dan(); d = d0
            d.text((ox, oy + 222), 'xanh = bé gần: quạt 58 như cũ; cam = bé xa:', font=f11, fill=MO)
            d.text((ox, oy + 236), 'càng vươn tới 96 (quạt hẹp), lao theo lúc kẹp', font=f11, fill=MO)
    d.text((20, 760), 'Di chuyển mới: cua đi ngang × 1,8 (cũ × 1), dọc × 1,1 (cũ × 0,8), dừng gần hơn (cách 52, cũ 56); em bé xa hơn 96 thì lướt ngang 84 điểm (nghỉ 2,4 giây).', font=f13, fill=CHU)
    d.text((20, 780), 'Báo trước: Kẹp càng ≥ 0,58 giây, vòng đập ≥ 0,62, vết nứt ≥ 1,1, đá rơi ≥ 0,9, tường ≥ 0,69, mảnh loạt 1: 1,0, loạt sau: 0,6 (kiem_cong_bang.py).', font=f13, fill=CHU)
    d.text((20, 800), 'Lối né: tường chừa đúng 1 khe ≥ 24; mỗi loạt mảnh chừa dải trống ≥ 16 → bước sang hàng vừa nổ (hoặc lộn); đá rơi chỉ phủ ≤ 22 điểm từ mép.', font=f13, fill=CHU)
    d.text((20, 820), 'Cờ ?cuade=1 → Cua Đá y hệt cũ (đã so từng số với bản trước phiên bằng mô phỏng cùng hạt ngẫu nhiên).', font=f13, fill=CHU)
    img.save(os.path.join(HERE, 'xem-cua-da.png'))
    print('đã ghi xem-cua-da.png')


main()
