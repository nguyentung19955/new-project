#!/usr/bin/env python3
"""SOÁT LUẬT CÔNG BẰNG CỦA TRÙM (tư vấn 2, việc 1) — đo trên LUẬT THẬT chạy trong Node (game/tests/node_trang.js), không chơi thử,
không vẽ. Mỗi con (trùm vùng, trùm nhỏ, tinh anh của 4 vùng) đứng trong phòng trùm trống, Cu Tí đứng yên một chỗ (không nhận sát thương,
không đánh). Đặt máu vào đúng pha, chờ chuyển pha xong rồi ghi GIAY giây (nhiều hạt ngẫu nhiên). Mỗi vùng đỏ của con đó: lúc hiện,
báo trước (t0 + wait), hệ số sát thương so với sát thương gốc của con lúc đó (≥ 1,2 = đòn NẶNG), có phủ chỗ Cu Tí đứng lúc hiện không
(= nhắm thẳng), tên chiêu. Rút ra theo từng chiêu:
  - bao_nang: báo trước ngắn nhất của đòn nặng · bao: ngắn nhất của mọi vùng
  - nghi_hut: sau một đòn nặng nổ (giả sử Cu Tí né được — cờ G.congBang.thuHut), bao lâu mới có vùng đỏ / loạt đạn MỚI hiện ra
    (tường nước chạy: khoảng giữa hai bức tường đi qua cùng một chỗ)
  - lien: khoảng ngắn nhất giữa lúc một đòn nhắm thẳng nổ và lúc vùng báo của đòn nhắm thẳng KẾ hiện (âm = hiện trước cả lúc đòn trước nổ)
  - chieu/phut: số chiêu (trùm) / chiêu riêng (tinh anh) mỗi phút — so pha 1 để thấy nhịp nổi giận
  - phu: phần sàn lớn nhất bị vùng đỏ sắp nổ (còn < 0,35 s) phủ cùng lúc (lưới 32 × 12 điểm; tường nước có khe không tính)
Chạy:  python3 docs/review/ke-hoach-cai-thien/tu-van-2/do_cong_bang.py [moi|cu] [giây mỗi pha, mặc định 90] [--json=tệp]
  cu = cờ ?trumcongbang=0 (LK_Q) — luật trước phiên này.
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'game', 'tests'))

JS = r"""
([r, loai, art, ph, giay, seed]) => {
  G.testSave({ hero: 'smith', melee: 'sword', lvl: 20 });
  G.rnd = G.srand(seed);
  G.startStage(r, loai === 'boss' ? 4 : 1, 0, { kind: 'A', seed: 3 });
  const S = G.getRun();
  G.gotoRoom(S.map.boss);
  const W = G.getWorld(), P = S.P;
  W.waves = []; W.spawns = []; W.ents = []; W.projs = []; W.zones = []; W.banner = null;
  let b = W.boss;
  if (loai === 'elite') { W.boss = null; b = G.spawnEnemy('elite', W.geo.cx + 40, W.geo.cy - 4, { art }); b.inside = true; b.spawnT = 0; }
  const h0 = G.hurtPlayer, bi0 = G.botInput;
  G.hurtPlayer = () => false;
  G.botInput = () => ({ mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, skill: false, swapP: false, potionP: false, pauseP: false, mapP: false });
  if (G.congBang) G.congBang.thuHut = true; // đo "nghỉ sau đòn lớn HỤT": coi như mọi đòn nặng đều hụt
  const cx = W.geo.cx, cy = W.geo.cy;
  const viTri = [[-70, 6], [-40, -20], [-110, 18], [30, 24]];
  let vt = 0;
  const ghim = () => { const q = viTri[vt % viTri.length], g = t * 1.5; P.x = G.clamp(cx + q[0] + Math.cos(g) * 40, W.x0 + 4, W.x1 - 4); P.y = G.clamp(cy + q[1] + Math.sin(g) * 28, W.y0 + 2, W.y1 - 2); P.inv = 0; P.hp = P.maxhp; P.dead = false; };
  const ev = { z: [], dan: [], cast: 0, ten: b.name || art, phase: 0, x0: W.x0, x1: W.x1, y0: W.y0, y1: W.y1 };
  let t = 0, soChieu0 = 0;
  try {
    b.invuln = 0; b.intro = 0; b.busy = 0;
    if (loai === 'elite') { if (ph > 0) b.hp = b.maxhp * 0.3; }
    else b.hp = b.maxhp * (ph === 0 ? 0.99 : ph === 1 ? (loai === 'boss' ? 0.6 : 0.45) : 0.3);
    for (let i = 0; i < 900; i++) { ghim(); G.sim(1); if (loai === 'elite' || (b.phase === ph && !(b.invuln > 0) && !(b.busy > 0) && i > 5)) break; }
    W.zones = []; W.projs = [];
    if (b.seq) b.seq.length = 0;
    const seen = new Set(), seenP = new Set();
    soChieu0 = b.cbSoChieu || 0;
    const N = Math.round(giay * 60);
    // lưới phủ sàn
    const GX = 32, GY = 12, pts = [];
    for (let i = 0; i < GX; i++) for (let j = 0; j < GY; j++) pts.push({ x: W.x0 + (W.x1 - W.x0) * (i + 0.5) / GX, y: W.y0 + (W.y1 - W.y0) * (j + 0.5) / GY });
    ev.phu = 0; ev.phuTen = '';
    let cuoi = -1;
    for (let i = 0; i < N; i++) {
      t = i / 60;
      if (i % 600 === 0) vt++;
      ghim();
      if (b.hp < b.maxhp * 0.05) b.hp = b.maxhp * (loai === 'elite' ? (ph > 0 ? 0.3 : 0.99) : ph === 0 ? 0.99 : ph === 1 ? (loai === 'boss' ? 0.6 : 0.45) : 0.3);
      G.sim(1);
      if (b.dead) break;
      const base = b.dmg || 1;
      for (const z of W.zones) {
        if (seen.has(z)) continue; seen.add(z);
        if (z.team === 'player' || z.team === 'fx' || z.ct || z.kn) continue;
        if (z.src && z.src !== b) continue;
        if (z.pool || z.knBao || z.ctBao) continue; // vũng ở lại / vùng chỉ để báo
        if (z.wall) { ev.z.push({ t, bao: +(z.wait || 0).toFixed(3), k: +((z.dmg || 0) / base).toFixed(2), nham: false, ten: z.skill || b.skillName || '', wall: 1 }); continue; }
        if (!(z.t0 > 0) || !z.dmg) continue;
        ev.z.push({ t, bao: +((z.t0 || 0) + (z.wait || 0)).toFixed(3), k: +((z.dmg || 0) / base).toFixed(2), nham: !!G.inZone(z, P), ten: z.skill || b.skillName || '', sh: z.shape });
      }
      let moi = 0;
      for (const o of W.projs) { if (seenP.has(o)) continue; seenP.add(o); if (o.team === 'enemy') moi++; }
      if (moi) ev.dan.push({ t, n: moi, ten: b.skillName || '' });
      // phủ sàn: vùng sắp nổ (còn < 0,35 s)
      const sap = W.zones.filter((z) => z.team !== 'player' && z.team !== 'fx' && !z.ct && !z.kn && !z.wall && !z.pool && z.dmg && z.t > 0 && z.t < 0.35 && !(z.wait > 0));
      if (sap.length) {
        // lưới theo sàn HIỆN TẠI (Siết sân của Thuồng Luồng thu hẹp sàn)
        for (let i = 0, k = 0; i < GX; i++) for (let j = 0; j < GY; j++, k++) { pts[k].x = W.x0 + (W.x1 - W.x0) * (i + 0.5) / GX; pts[k].y = W.y0 + (W.y1 - W.y0) * (j + 0.5) / GY; }
        let n = 0;
        for (const q of pts) if (sap.some((z) => G.inZone(z, q))) n++;
        const f = n / pts.length;
        if (f > ev.phu) { ev.phu = +f.toFixed(3); ev.phuTen = sap.map((z) => z.skill || '').filter((x, k, a) => a.indexOf(x) === k).join('+'); }
      }
    }
  } finally { G.hurtPlayer = h0; G.botInput = bi0; if (G.congBang) G.congBang.thuHut = false; }
  ev.phase = b.phase | 0; ev.soChieu = (b.cbSoChieu || 0) - soChieu0; ev.giay = t;
  return ev;
}
"""

DS = [
    ('boss', 0, None, 'Mộc Tinh'), ('boss', 1, None, 'Ngư Tinh'), ('boss', 2, None, 'Hồ Tinh'), ('boss', 3, None, 'Thuồng Luồng'),
    ('mini', 0, None, 'Nấm Chúa'), ('mini', 1, None, 'Cua Đá'), ('mini', 2, None, 'Hổ Lửa'), ('mini', 3, None, 'Cá Trê Râu Roi'),
    ('elite', 0, 'heoNanh', 'Heo Nanh'), ('elite', 0, 'namPhongChua', 'Nấm Phồng Chúa'), ('elite', 1, 'cuaTuong', 'Cua Tướng'),
    ('elite', 1, 'caNocChua', 'Cá Nóc Chúa'), ('elite', 2, 'tuongMa', 'Tướng Ma'), ('elite', 2, 'huChua', 'Hũ Chúa'),
    ('elite', 3, 'raiCaChua', 'Rái Cá Thủ Lĩnh'), ('elite', 3, 'cocChua', 'Cóc Tía Chúa'),
]
NANG = 1.2
# Chiêu có hình cố định, KHÔNG nhắm vào chỗ Cu Tí (đường chéo qua góc, tường có khe, vòng quanh thân trùm, dải mép, bánh xe quay từ hướng
# đầu): vùng có thể phủ chỗ Cu Tí đứng (Cu Tí đứng giữa sân) nhưng không đuổi theo — không xét luật "hai đòn nhắm thẳng liền nhau".
KHONG_NHAM = {'Hồ ly phân thân', 'Tường tinh thể', 'Siết sân', 'Quật đuôi', 'Sóng thần', 'Rừng gai', 'Vòng thân', 'Quất râu xoay', 'Dậm lá sen', 'Dòng nước đổi chiều', 'Xoáy nước', 'Xoáy hút'}


def tom(ev, ten_con):
    """Gộp số liệu theo chiêu."""
    zs = sorted(ev['z'], key=lambda z: z['t'])
    # nhóm: vùng hiện cùng khung + cùng tên = một đòn
    don = []
    for z in zs:
        no = z['t'] + z['bao']
        z = dict(z, ten=z['ten'] or ten_con, nham=z['nham'] and z['bao'] <= 1.6)  # vùng chờ lâu (> 1,6 s: bẫy, nấm con, vòm) không tính là đòn nhắm thẳng
        if don and abs(don[-1]['t'] - z['t']) < 1e-6 and don[-1]['ten'] == z['ten']:
            d = don[-1]; d['no'] = max(d['no'], no)
            if z['k'] >= NANG - 1e-6: d['noNang'] = max(d.get('noNang', 0), no)
            d['k'] = max(d['k'], z['k']); d['nham'] = d['nham'] or z['nham']; d['bao'] = min(d['bao'], z['bao'])
        else:
            don.append({'t': z['t'], 'no': no, 'k': z['k'], 'nham': z['nham'], 'ten': z['ten'] or ten_con, 'bao': z['bao'], 'noNang': no if z['k'] >= NANG - 1e-6 else 0, 'wall': z.get('wall', 0)})
    moc = sorted([d['t'] for d in don] + [s['t'] for s in ev['dan']])
    out = {}
    def c(ten):
        return out.setdefault(ten, {'so': 0, 'bao': 9, 'bao_nang': 9, 'nghi_hut': 9, 'lien': 9, 'nang': 0, 'nham': 0})
    for d in don:
        q = c(d['ten']); q['so'] += 1
        q['bao'] = min(q['bao'], d['bao'])
        if d['nham']: q['nham'] += 1
        if d['k'] >= NANG - 1e-6:
            q['nang'] += 1
            q['bao_nang'] = min(q['bao_nang'], d['bao'])
            nn = d['noNang'] or d['no']  # lúc đòn NẶNG của nhóm nổ (mảnh nhẹ nổ sau không tính)
            if d['wall']:
                # tường nước chạy (cùng tốc): tường sau đi qua chỗ Cu Tí sau tường trước đúng bằng khoảng cách hai lúc bắt đầu chạy
                tw = [e['no'] for e in don if e['wall'] and e['ten'] == d['ten'] and nn + 1e-6 < e['no'] < nn + 3]
                if tw and min(tw) - nn < q['nghi_hut']: q['nghi_hut'] = min(tw) - nn; q['vdNghi'] = f"tường {nn:.2f}→{min(tw):.2f}"
                continue
            sau = [m for m in moc if m > nn - 1e-6]
            if sau and sau[0] - nn < q['nghi_hut']: q['nghi_hut'] = sau[0] - nn; q['vdNghi'] = f"{nn:.2f}→{sau[0]:.2f}"
    # nhắm thẳng liền nhau: theo thứ tự hiện
    nh = [d for d in don if d['nham']]
    for a, b2 in zip(nh, nh[1:]):
        if a['ten'] in KHONG_NHAM or b2['ten'] in KHONG_NHAM:
            continue
        g = b2['t'] - a['no']
        q = c(b2['ten'])
        if g < q['lien']: q['lien'] = g; q['vdLien'] = f"{a['ten']} {a['t']:.2f}/nổ {a['no']:.2f} → {b2['t']:.2f}"
    for s in ev['dan']:
        c(s['ten'] or ten_con)['dan'] = c(s['ten'] or ten_con).get('dan', 0) + 1
    return out


def main():
    var = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('-') else 'moi'
    giay = float(sys.argv[2]) if len(sys.argv) > 2 and not sys.argv[2].startswith('-') else 90
    jout = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--json=')), None)
    if var == 'cu':
        os.environ['LK_Q'] = 'trumcongbang=0'
    import cd_lib
    errs = []
    pg = cd_lib.NodePage(errs)
    kq = []
    chi = next((x.split('=', 1)[1] for x in sys.argv if x.startswith('--chi=')), None)  # --chi=Tên con:pha → in thô các vùng (soát)
    for (loai, r, art, ten) in DS:
        if chi and chi.split(':')[0] != ten:
            continue
        phs = [0, 1, 2] if loai == 'boss' else [0, 1]
        for ph in phs:
            seg = giay / 3 * (3 if loai == 'elite' else 1)  # tinh anh ra chiêu riêng ~6 giây một lần: đo dài hơn cho đủ số
            evs = [pg.evaluate(JS, [r, loai, art, ph, seg, 7 + 13 * s + ph]) for s in range(3)]
            gop = {'z': [], 'dan': [], 'phu': 0, 'phuTen': ''}
            so = sum(e.get('soChieu', 0) for e in evs); tg = sum(e.get('giay', 0) for e in evs)
            off = 0
            for e in evs:
                gop['z'] += [dict(z, t=z['t'] + off) for z in e['z']]
                gop['dan'] += [dict(d, t=d['t'] + off) for d in e['dan']]
                if e['phu'] > gop['phu']: gop['phu'], gop['phuTen'] = e['phu'], e['phuTen']
                off += seg + 5
            if chi and len(chi.split(':')) > 1 and int(chi.split(':')[1]) != ph + 1:
                continue
            if chi:
                for z in sorted(gop['z'] + [dict(d, dan=1) for d in gop['dan']], key=lambda q: q['t'])[:400]:
                    print(f"  t={z['t']:7.2f} {'ĐẠN x' + str(z['n']) if z.get('dan') else ''} bao={z.get('bao', 0):.2f} nổ={z['t'] + z.get('bao', 0):7.2f} k={z.get('k', 0)} nhắm={int(z.get('nham', 0))} {z.get('sh', '')} {z['ten']}")
            kq.append({'con': ten, 'loai': loai, 'pha': ph + 1, 'phaThat': evs[0]['phase'] + 1, 'chieu': tom(gop, ten), 'phu': gop['phu'], 'phuTen': gop['phuTen'], 'chieuPhut': round(so / max(1, tg) * 60, 1)})
            print(f"{ten} pha {ph + 1}: {kq[-1]['chieuPhut']} chiêu/phút · phủ tối đa {gop['phu'] * 100:.0f}% ({gop['phuTen']})", flush=True)
            for k, q in kq[-1]['chieu'].items():
                f = lambda v: '—' if v >= 9 else f'{v:.2f}'
                print(f"   {k[:28]:28} đòn {q['so']:3} nặng {q['nang']:3} nhắm {q['nham']:3} · báo nặng {f(q['bao_nang'])} · báo {f(q['bao'])} · nghỉ sau nặng {f(q['nghi_hut'])} [{q.get('vdNghi', '')}] · nhắm liền {f(q['lien'])} [{q.get('vdLien', '')}]", flush=True)
    if jout:
        json.dump(kq, open(jout, 'w'), ensure_ascii=False, indent=1)
    if errs:
        print('LỖI', errs[:3])
    pg.close()


main()
