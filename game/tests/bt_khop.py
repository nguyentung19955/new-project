"""Rà soát toàn bộ — phần B (hiệu ứng chiến đấu): VÙNG BÁO TRƯỚC có khớp VÙNG SÁT THƯƠNG THẬT không, và chụp ảnh từng chiêu.
Chạy ở bản HAI TỆP như web (từ thư mục gốc repo, sau LK_HAI_TEP=1 python3 game/build.py --hai-tep):
    python3 game/tests/bt_khop.py <thư mục ảnh> [tiền tố] [đuôi địa chỉ thêm, vd "&btpx=0"]
Mỗi cảnh: dựng phòng trùm / trùm nhỏ / quái, ép một chiêu (G.bossDebug), chạy thật có vẽ tới giữa lúc báo trước, rồi:
  - đọc lại tấm điểm ảnh vùng báo vừa vẽ (G.baoTruoc._px, chỉ có ở kiểu điểm ảnh) và so TỪNG ĐIỂM ẢNH với G.inZone (hàm gây sát thương):
    thiếu = điểm trong vùng sát thương mà không tô; thừa = điểm tô mà không thuộc vùng (trừ viền tối 1 điểm ảnh sát mép);
  - đếm số điểm ảnh của vùng sát thương mà HÌNH KIỂU CŨ (vẽ mịn, không gồm dung sai) không phủ (cũ-thiếu) và ngược lại (cũ-thừa);
  - chụp ảnh màn iPhone ngang 844×390 tỉ lệ 3.
Máy chủ: bản sao docs/review/kiem-thu-12-10/srv.py (gzip, ETag như Firebase) có phục vụ thư mục con anh/ (ảnh rời WebP)."""
import os, sys, json, subprocess, time, socket
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(ROOT)
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/bt_khop'
PRE = sys.argv[2] if len(sys.argv) > 2 else 'sau'
EXTRA = sys.argv[3] if len(sys.argv) > 3 else ''
SRV = os.environ.get('LK_SRV', os.path.join(REPO, 'docs', 'review', 'kiem-thu-12-10', 'srv.py'))
os.makedirs(OUT, exist_ok=True)

# (tên ảnh, vùng, loại: boss / mini / mob, chiêu hoặc vai)
CASES = [(f'{ma}-{k}', r, 'boss', k) for r, ma in [(0, 'mocTinh'), (1, 'nguTinh'), (2, 'hoTinh')] for k in ['c1', 'c2', 'c3', 'c4', 'c5']]
CASES += [(f'tro{r}-{k}', r, 'mini', k) for r in [0, 1, 2] for k in ['atk', 'chieu1', 'chieu2']]
CASES += [(f'quai{r}-{role}', r, 'mob', role) for r in [0, 1, 2] for role in ['elite', 'bomber']]
# vũng của quái nằm lại trên sàn (ảnh hu-vung-quai-*): chụp lúc vũng đã hiện hẳn, kẻ thêm viền vàng = vùng gây sát thương thật (G.inZone)
CASES += [('vung-doc', 0, 'boss', 'c3:vung'), ('vung-bang', 1, 'boss', 'c3:vung'), ('vung-lua', 2, 'mini', 'chieu1:vung'), ('vung-lua-bom', 2, 'mob', 'bomber:vung')]

JS_CASE = r"""
([r, kind, sk0]) => {
  const [sk, mode] = sk0.split(':');
  const { S, W, P } = AU.room({ region: r, stage: kind === 'boss' ? 4 : kind === 'mini' ? 1 : 0, big: kind !== 'mob', keepBoss: kind !== 'mob', lvl: 30, tier: 2, seed: 11 });
  G.hurtPlayer = function () { return false; };
  let e;
  if (kind === 'mob') {
    P.x = W.geo.cx - 40; P.y = W.geo.cy;
    e = G.spawnEnemy(sk, P.x + 70, P.y - 6, {}); e.inside = true; if (sk === 'elite') e.skCd = 0.3; e.cd = 0.2;
  } else {
    e = W.boss; e.invuln = 0; e.busy = 0; e.intro = 0; e.cd = 0; e.layers = []; e.weak = [];
    P.x = e.x - 70; P.y = e.y + 24;
    G.bossDebug(sk);
  }
  const BT = G.baoTruoc;
  let f = 0, got = null;
  AU.run(kind === 'mob' ? 900 : 300, true, (i) => {
    f = i; P.inv = 0; P.hp = P.maxhp;
    G.ui.begin(); G.scene.draw(); // vẽ mỗi khung như game thật (vòng vẽ thật bị chặn khi đo): tuổi vùng báo, hiện ra dần đúng như chơi
    if (kind !== 'mob') { P.x = Math.max(W.x0 + 8, e.x - 70); P.y = e.y + 24; }
    const zs = W.zones.filter((z) => !z.quiet && z.team !== 'player' && z.team !== 'fx' && !z.pool && (z.t > 0 || (z.wall && z.wait > 0)));
    if (mode === 'vung') { if (W.zones.some((z) => z.pool && z.team !== 'player' && z.shape === 'circle' && z.fxA > 0.4 && !z.rain)) { got = i; return false; } return; }
    const ok = zs.filter((z) => z.t > 0 && z.t0 && 1 - z.t / z.t0 >= 0.45).length || zs.some((z) => z.wall && z.wait < 0.5);
    if (ok && !BT.ghosts.length && !BT.gone.length && i > 2) { got = i; return false; }
  });
  AU.run(1, true); G.ui.begin(); G.scene.draw(); // vẽ đúng khung đang xét (vòng vẽ thật bị chặn khi đo)
  const zs = W.zones.filter((z) => !z.quiet && z.team !== 'player' && z.team !== 'fx' && !z.pool && z.t > 0 && z.dmg);
  const out = { f, got, zones: zs.map((z) => z.shape + (z.r ? ' r' + z.r : '') + (z.r1 ? ' ' + z.r0 + '-' + z.r1 : '') + (z.len ? ' dài' + Math.round(z.len) + ' rộng' + z.w : '') + (z.span ? ' góc' + z.span : '')), walls: W.zones.filter((z) => z.wall).length,
    skill: e && e.skillName, px: !!BT._px && G.BT_PIXEL, inN: 0, miss: 0, extra: 0, oldMiss: 0, oldExtra: 0 };
  // hình kiểu cũ (vẽ mịn): đúng hình học vùng, không gồm dung sai của G.inShape
  const TAU = Math.PI * 2;
  const oldIn = (z, x, y) => {
    const dx = x - z.x, dy = y - z.y;
    if (z.shape === 'circle' || z.shape === 'rect') return G.inZone(z, { x, y });
    if (z.shape === 'line') { const c = Math.cos(z.ang), s = Math.sin(z.ang), al = dx * c + dy * s, ac = -dx * s + dy * c; return al >= 0 && al <= z.len && Math.abs(ac) <= z.w / 2; }
    if (z.shape === 'cone') { const d = Math.hypot(dx, dy); if (d > z.r) return false; let da = Math.atan2(dy, dx) - z.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); return Math.abs(da) <= z.span / 2; }
    if (z.shape === 'donut') { const K = G.ZK || 1, d = Math.hypot(dx, dy / K); if (d < z.r0 || d > z.r1) return false; if (z.gaps) { const a = Math.atan2(dy / K, dx); for (const g of z.gaps) { let da = a - g; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < z.gw) return false; } } return true; }
    return false;
  };
  const px = BT._px;
  if (zs.length) {
    // khung bao các vùng (toạ độ thế giới), trong phần đang thấy trên màn hình
    const cam = Math.round(W.cam);
    // chỉ những điểm chân em bé đứng tới được (sàn phòng W.x0..x1, W.y0..y1) và đang thấy trên màn hình
    const X0 = Math.max(cam, Math.floor(W.x0)), X1 = Math.min(cam + G.W, Math.ceil(W.x1) + 1), Y0 = Math.max(0, Math.floor(W.y0)), Y1 = Math.min(G.H, Math.ceil(W.y1) + 1);
    const inside = (x, y) => zs.some((z) => G.inZone(z, { x, y }));
    for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
      const cx = x + 0.5, cy = y + 0.5, a = inside(cx, cy), o = zs.some((z) => oldIn(z, cx, cy));
      if (a) out.inN++;
      if (a && !o) out.oldMiss++;
      if (o && !a) out.oldExtra++;
      if (out.px && px) {
        const i = x - px.X0, j = y - px.Y0;
        const al = i >= 0 && j >= 0 && i < px.W0 && j < px.H0 ? px.data[(j * px.W0 + i) * 4 + 3] : 0;
        if (a && al === 0) out.miss++;
        if (!a && al > 0 && !(inside(cx - 1, cy) || inside(cx + 1, cy) || inside(cx, cy - 1) || inside(cx, cy + 1))) out.extra++;
      }
    }
  }
  if (mode === 'vung') {
    // viền vàng = vùng gây sát thương thật của từng vũng (G.inZone), chỉ trong ảnh kiểm
    const vs = W.zones.filter((z) => z.pool && z.team !== 'player' && z.shape === 'circle' && !z.rain);
    window.__ovl(vs.map((z) => ({ x: z.x, y: z.y, r: z.r })));
    out.zones = vs.map((z) => 'vũng ' + (z.el || 'đỏ') + ' r' + z.r);
    out.anh = vs.map((z) => { const ma = { fire: 'hu-vung-quai-lua', poison: 'hu-vung-quai-doc', ice: 'hu-vung-quai-bang' }[z.el] || 'hu-vung-quai-do', a = G.fxAnh.get(ma), bb = a && G.fx.bbAnh ? G.fx.bbAnh(a) : null; return ma + (a ? '' : ' (chưa có ảnh)') + (bb ? ' phần hình cao/rộng ' + ((bb.y1 - bb.y0) / (bb.x1 - bb.x0)).toFixed(2) + ', lệch tâm dọc ' + (((bb.y0 + bb.y1) / 2 - a.ay) / ((bb.x1 - bb.x0) / 2)).toFixed(2) + ' bán kính' : ''); });
  }
  AU.live(false);
  return out;
}
"""


OVL = r'''
// Viền vàng kiểm tra (KHÔNG phải hình trong game): vẽ trên một tấm canvas HTML riêng phủ lên game, để vòng vẽ của game không xoá mất.
window.__ovl = function (list) {
  let cv = document.getElementById('__ovl');
  if (!cv) { cv = document.createElement('canvas'); cv.id = '__ovl'; cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:99999'; document.body.appendChild(cv); }
  const d = window.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
  if (!list || !list.length) return;
  const W = G.getWorld(), cam = Math.round(W.cam), k = (G.uiScale || 1) / (G.dpr || 1), rect = G.ux.canvas.getBoundingClientRect();
  c.setTransform(d, 0, 0, d, 0, 0); c.strokeStyle = '#ffff00'; c.lineWidth = 1;
  for (const z of list) { c.beginPath(); c.ellipse(rect.left + G.ox + (z.x - cam) * k, rect.top + G.oy + z.y * k, z.r * k, z.r * (G.ZK || 0.6) * k, 0, 0, Math.PI * 2); c.stroke(); }
};
'''


def port_free():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


def main():
    port = port_free()
    srv = subprocess.Popen([sys.executable, SRV, os.path.join(ROOT, 'dist'), str(port)], stderr=subprocess.DEVNULL)
    time.sleep(1)
    errs, res = [], {}
    try:
        with sync_playwright() as p:
            br = p.chromium.launch()
            ctx = br.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (port, EXTRA))
            pg.wait_for_function('window.G && G.scene && G.spriteCustom', timeout=120000)
            try: pg.wait_for_function("G.spriteCustom.sau.tt === 'xong'", timeout=180000)
            except Exception: print('ảnh tải sau chưa xong, chụp tiếp')
            pg.wait_for_timeout(800)
            for f in ['bot.js', 'setup.js', 'au_lib.js']: pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
            pg.add_script_tag(content=OVL)
            for name, r, kind, sk in CASES:
                try:
                    o = pg.evaluate(JS_CASE, [r, kind, sk])
                except Exception as e:
                    o = {'loi': str(e)[:200]}
                res[name] = o
                pg.wait_for_timeout(60)
                pg.screenshot(path=os.path.join(OUT, '%s-%s.png' % (PRE, name)))
                pg.evaluate('() => window.__ovl([])')
                if 'loi' in o: print('%-16s LỖI %s' % (name, o['loi'])); continue
                if o.get('anh'): print('   ảnh vũng:', '; '.join(sorted(set(o['anh']))))
                print('%-16s %-22s khung %4s vùng %-60s | điểm vùng %6d | thiếu %4d thừa %4d | cũ-thiếu %5d cũ-thừa %4d' % (
                    name, (o['skill'] or '')[:22], o['got'], '; '.join(o['zones'])[:60] + (' +tường' if o['walls'] else ''), o['inN'], o['miss'], o['extra'], o['oldMiss'], o['oldExtra']))
            br.close()
    finally:
        srv.terminate()
    with open(os.path.join(OUT, '%s-ket-qua.json' % PRE), 'w', encoding='utf-8') as f: json.dump(res, f, ensure_ascii=False, indent=1)
    print('pageerror:', errs or 0)


main()
