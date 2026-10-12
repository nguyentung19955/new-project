"""Tờ chọn góc kiếm: mỗi khung ảnh AI của hàng atk_sword (và khung đứng 0, chạy 0) phóng ×8, chấm đỏ = nắm tay (SC.diemKhung),
vòng xanh = vùng mặt (SC.matKhung), vạch đậm = góc đã chọn (G.kiemMuot.VUNG: đỏ lấy đà, xanh lá chém, vàng theo đà), quạt vạch mỗi 15° (số = góc, 0 = trước mặt, âm = chĩa lên) dài bằng lưỡi kiếm gỗ đang vẽ.
Chạy: python3 quat_goc.py <url> <ảnh ra>"""
import base64, sys
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
JS = r"""() => {
  const SC = G.spriteCustom, KEYS = ['smith','hunter','wrestler','healer'], K = 8, CW = 56, CH = 64;
  const ds = [['idle', 0], ['move', 0], ['atk_sword', 0], ['atk_sword', 1], ['atk_sword', 2], ['atk_sword', 3], ['atk_sword', 4], ['atk_sword', 5]];
  const cv = document.createElement('canvas'); cv.width = CW * K * ds.length; cv.height = CH * K * KEYS.length; const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false; const out = {};
  KEYS.forEach((k, r) => {
    const o = { key: k, weapon: { type: 'sword', family: 0, rarity: 0 }, outfit: {} };
    const sp = SC.cuaEmBe(k, o); out[k] = [];
    ds.forEach(([ten, i], j) => {
      const X = j * CW * K, Y = r * CH * K, ox = X + 28 * K, oy = Y + 52 * K;
      c.fillStyle = (j + r) % 2 ? '#5b7a62' : '#4f6e57'; c.fillRect(X, Y, CW * K, CH * K);
      c.save(); c.translate(ox, oy); c.scale(K, K); SC.veKhung(c, sp, ten, i, 1, {}); c.restore();
      const da = SC.diemKhung(sp, k, ten, i, SC.khopEmBe(sp, ten, i)), P = da && da.diem.tay_truoc, m = SC.matKhung(sp, ten, i);
      out[k].push({ ten, i, P, m });
      if (m) { c.strokeStyle = '#39d0ff'; c.lineWidth = 2; c.beginPath(); c.arc(ox + m.x * K, oy + m.y * K, m.r * K, 0, 7); c.stroke(); }
      if (P) {
        for (let a = -180; a < 180; a += 15) {
          const ra = a * Math.PI / 180, L = 22;
          c.strokeStyle = a === 0 ? 'rgba(255,255,0,.8)' : a % 45 === 0 ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.22)'; c.lineWidth = a % 45 === 0 ? 2 : 1;
          c.beginPath(); c.moveTo(ox + P[0] * K, oy + P[1] * K); c.lineTo(ox + (P[0] + Math.cos(ra) * L) * K, oy + (P[1] + Math.sin(ra) * L) * K); c.stroke();
          if (a % 45 === 0) { c.fillStyle = '#fff'; c.font = '13px sans-serif'; c.fillText(String(a), ox + (P[0] + Math.cos(ra) * (L + 2)) * K - 10, oy + (P[1] + Math.sin(ra) * (L + 2)) * K + 4); }
        }
        const V = G.kiemMuot && G.kiemMuot.VUNG[k], n = ten === 'atk_sword' ? i : -1; // góc đã chọn (G.KIEM_MUOT): đỏ = lấy đà, xanh lá = chém, vàng = theo đà
        if (V && n >= 0) { const v = V[n >> 1], ds = n % 2 ? [[v[1], '#30ff60'], [v[2], '#ffd000']] : [[v[0], '#ff3030']];
          for (const [a, col] of ds) { const ra = a * Math.PI / 180; c.strokeStyle = col; c.lineWidth = 5; c.beginPath(); c.moveTo(ox + P[0] * K, oy + P[1] * K); c.lineTo(ox + (P[0] + Math.cos(ra) * 26) * K, oy + (P[1] + Math.sin(ra) * 26) * K); c.stroke(); } }
        c.fillStyle = '#ff2050'; c.fillRect(ox + P[0] * K - 4, oy + P[1] * K - 4, 8, 8);
      }
      c.fillStyle = '#fff'; c.font = 'bold 18px sans-serif'; c.fillText(k + ' ' + ten + ':' + i, X + 6, Y + 20);
    });
  });
  out.png = cv.toDataURL(); return out;
}"""
with sync_playwright() as p:
    b = p.chromium.launch(); g = b.new_page()
    g.goto(URL)
    g.wait_for_function("window.G && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; })", timeout=240000)
    g.wait_for_timeout(1000)
    r = g.evaluate(JS)
    b.close()
open(OUT, 'wb').write(base64.b64decode(r.pop('png').split(',')[1]))
for k, v in r.items():
    print(k, [(q['ten'][:4] + str(q['i']), q['P'], q['m'] and {kk: round(vv, 1) for kk, vv in q['m'].items()}) for q in v])
