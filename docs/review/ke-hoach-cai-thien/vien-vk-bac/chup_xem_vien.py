import asyncio, base64, io, sys, json
from playwright.async_api import async_playwright
from PIL import Image
OUT = sys.argv[1]
URL = 'file:///home/claude/new-project/game/dist/linh-khi.html?cloud=0' + (sys.argv[2] if len(sys.argv) > 2 else '')
JS = r'''
async ([mode, tt]) => {
  const G = window.G, SC = G.spriteCustom;
  const LOAI = ['sword','spear','hammer','bow'], TEN = {sword:'Kiếm',spear:'Thương',hammer:'Búa',bow:'Phi tiêu'};
  const vk = (type, b, cap, mai) => ({ id: 900 + b, type, branch: cap ? 'fire' : null, marks: { fire: [0, 60, 400, 900][cap], poison: 0, ice: 0 }, sharpen: mai || 0, ep: { b, d: [], may: {} }, rarity: 0 });
  const S = 5; // 1 điểm ảnh game = 5 điểm ảnh ảnh soát
  const cell = 64, W = 70 + 7 * cell, H = mode === 'gif' ? 40 + 2 * cell : 30 + 4 * cell + 30 + 2 * 40;
  const cv = document.createElement('canvas'); cv.width = W * S; cv.height = H * S;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  c.fillStyle = '#1b1f27'; c.fillRect(0, 0, cv.width, cv.height);
  c.setTransform(S, 0, 0, S, 0, 0);
  const ui = (s, x, y, col, sz) => { c.save(); c.setTransform(1,0,0,1,0,0); c.font = 'bold ' + (sz || 30) + 'px sans-serif'; c.fillStyle = col || '#ddd'; c.fillText(s, x * S, y * S); c.restore(); };
  const M = G.EP_DO;
  const t0 = tt == null ? 0.3 : tt;
  G.time = t0;
  if (mode === 'gif') {
    // ánh mài lướt: hàng 1 = Zed cầm kiếm (bậc Trắng) mài +0 +3 +6 +9 +12; hàng 2 = ô vũ khí
    const MAI = [0, 2, 3, 6, 9, 12, 15];
    MAI.forEach((m, i) => ui('+' + m, 70 + i * cell + 4, 12, '#fff', 34));
    MAI.forEach((m, i) => { G.art.hero(c, { x: 70 + i * cell + 26, y: 20 + cell - 8, face: 1, key: 'smith', t: t0, move: false, atk: -1, dodge: -1, weapon: vk('sword', 0, 2, m), noShadow: true }); });
    const ux = G.ux; G.ux = c;
    try { MAI.forEach((m, i) => { const w = vk('spear', 4, 2, m), x = 70 + i * cell + 10, y = 20 + cell + 8, s = 40; G.oBacVk(x, y, s, w); G.art.weaponIcon(c, w, x + s / 2, y + s / 2, s - 10); }); } finally { G.ux = ux; }
    ui('Zed + Kiếm', 2, 50, '#bbb', 26); ui('Ô (Thương, Vàng)', 2, 20 + cell + 30, '#bbb', 22);
    return cv.toDataURL('image/png');
  }
  for (let b = 0; b < 7; b++) ui(M.ten[b], 70 + b * cell + 4, 12, M.mau[b], 34);
  LOAI.forEach((L, r) => {
    ui(TEN[L], 2, 20 + r * cell + 40, '#bbb', 30);
    for (let b = 0; b < 7; b++) {
      const cap = Math.min(3, Math.floor(b / 2)); // cấp hình theo cột cho dễ nhìn: Trắng/Lam=Trắng, Lục/Tím=Mầm, Vàng/Đỏ=Thành hình, Rực lửa=Thức tỉnh
      G.art.hero(c, { x: 70 + b * cell + 26, y: 20 + r * cell + cell - 8, face: 1, key: 'smith', t: t0, move: false, atk: -1, dodge: -1, weapon: vk(L, b, cap, 0), noShadow: true });
    }
  });
  // ô vũ khí 7 bậc (2 hàng: kiếm, phi tiêu)
  const ux = G.ux; G.ux = c;
  try {
    ['sword', 'bow'].forEach((L, r) => {
      ui('Ô ' + TEN[L], 2, 30 + 4 * cell + r * 40 + 26, '#bbb', 26);
      for (let b = 0; b < 7; b++) { const w = vk(L, b, 2, 0), x = 70 + b * cell + 10, y = 30 + 4 * cell + r * 40, s = 36; G.oBacVk(x, y, s, w); G.art.weaponIcon(c, w, x + s / 2, y + s / 2, s - 10); }
    });
  } finally { G.ux = ux; }
  return cv.toDataURL('image/png');
}
'''
async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch()
        pg = await br.new_page(viewport={'width': 960, 'height': 540})
        logs = []
        pg.on('console', lambda m: logs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: logs.append('PAGEERR ' + str(e)))
        await pg.goto(URL)
        await pg.wait_for_function("() => { const z = window.G && G.spriteCustom && G.spriteCustom.zed; if (!z) return false; for (const k of ['zed-moi','zed-vk']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (!q || !q.ready) return false; } return true; }", timeout=60000)
        await pg.wait_for_timeout(500)
        info = await pg.evaluate("() => ({ vien: G.VIEN_VK, co: !!G.vienVk, loi: G.zedMoi && G.zedMoi.loi })")
        print('info', info)
        if OUT.endswith('.gif'):
            frames = []
            for i in range(0, 50):
                d = await pg.evaluate(JS, ['gif', i * 0.05])
                frames.append(Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB'))
            frames = [f.resize((f.width // 2, f.height // 2), Image.NEAREST) for f in frames]
            frames[0].save(OUT, save_all=True, append_images=frames[1:], duration=50, loop=0, optimize=True)
        else:
            d = await pg.evaluate(JS, ['png', None])
            Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).save(OUT, optimize=True)
        # đo: thời gian vẽ thêm mỗi lần (vũ khí trên tay) có / không viền
        bench = await pg.evaluate(r'''() => { const c = document.createElement('canvas').getContext('2d'); c.canvas.width = 200; c.canvas.height = 200; c.setTransform(2,0,0,2,0,0);
          const vk = (b, m) => ({ id: 1, type: 'sword', branch: 'fire', marks: { fire: 900, poison: 0, ice: 0 }, sharpen: m, ep: { b, d: [], may: {} } });
          const run = (w) => { const N = 3000, a = performance.now(); for (let i = 0; i < N; i++) { G.time = i * 0.016; G.art.hero(c, { x: 50, y: 80, face: 1, key: 'smith', t: G.time, move: false, atk: -1, dodge: -1, weapon: w, noShadow: true }); } return (performance.now() - a) / N * 1000; };
          run(vk(0,0)); run(vk(6,12)); run(vk(3,0)); run(vk(1,0)); const r = { trang: run(vk(0, 0)), lam: run(vk(1, 0)), tim: run(vk(3, 0)), rucLua_mai12: run(vk(6, 12)) }; G.VIEN_VK = false; r.tat_trang = run(vk(0,0)); r.tat_rucLua = run(vk(6, 12)); G.VIEN_VK = true; r.matNa = G.vienVk.soMatNa(); return r; }''')
        print('bench_us_per_draw', json.dumps(bench))
        print('errors', logs[:10])
        await br.close()
asyncio.run(main())
