"""Quét em bé: 4 em bé × thân (gốc, rừng, biển, lầu) × 4 vũ khí × mọi trạng thái (đứng, chạy, đánh, chạy+đánh, giữ lấy đà, chưởng, chiêu,
lộn, trúng, chết), mặc đủ đồ. Đo bằng hiệu ảnh (vẽ có/không từng lớp):
  - mat_vk: điểm ảnh vũ khí đè lên vùng mặt (đĩa mặt tự đo SC.matKhung); mat_do: đồ (mũ, lưng, bùa, cánh) đè mặt
  - vk_xa: vũ khí không chạm thân (khoảng cách nhỏ nhất từ điểm ảnh vũ khí tới thân > 2) = vũ khí lơ lửng
  - do_xa: từng món đồ không chạm thân; mu_dx/dy: chỗ mũ so với đỉnh đầu, để thấy nhảy giữa khung liền nhau
  - than: đáy chân, tâm x, đỉnh (để thấy nhảy vị trí khi đổi trạng thái)
Chạy: python3 quet_em_be.py <thư mục ra> [js đặt cờ]"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
OUT = sys.argv[1]; CO = sys.argv[2] if len(sys.argv) > 2 else ''
os.makedirs(OUT, exist_ok=True)
JS = r"""
([key, bo, wt, face, gear, S, chup]) => {
  const A = window.AUD, SC = G.spriteCustom, poses = A.tuThe(wt);
  const W = 64, H = 64, mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c.getContext('2d', { willReadFrequently: true }); };
  const cF = mk(), cB = mk(), cW = mk(), cG = mk();
  const alpha = (c) => { const d = c.getImageData(0, 0, W, H).data, a = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) a[i] = d[i * 4 + 3] > 40 ? 1 : 0; return [a, d]; };
  const diff = (d1, d2) => { const m = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) { const j = i * 4; if (Math.abs(d1[j] - d2[j]) + Math.abs(d1[j + 1] - d2[j + 1]) + Math.abs(d1[j + 2] - d2[j + 2]) + Math.abs(d1[j + 3] - d2[j + 3]) > 60) m[i] = 1; } return m; };
  const ofFull = A.outfit(bo, gear), ofBody = A.outfit(bo, {});
  const sheet = chup ? document.createElement('canvas') : null;
  if (sheet) { sheet.width = poses.length * W * S; sheet.height = H * S; }
  const sc = sheet ? sheet.getContext('2d') : null; if (sc) { sc.imageSmoothingEnabled = false; }
  const out = [];
  poses.forEach((p, j) => {
    const oF = A.oCua(key, ofFull, wt, face, p), oB = A.oCua(key, ofBody, null, face, p), oW = A.oCua(key, ofBody, wt, face, p), oG = A.oCua(key, ofFull, null, face, p);
    const e = A.ve(cF, oF) || A.ve(cB, oB) || A.ve(cW, oW) || A.ve(cG, oG);
    const r = { tt: p[0] };
    if (e) { r.loi = e; out.push(r); return; }
    const [aB, dB] = alpha(cB), [, dW] = alpha(cW), [, dG] = alpha(cG), [aF] = alpha(cF);
    const mW = diff(dW, dB), mG = diff(dG, dB);
    // thân
    let x0 = W, x1 = -1, y0 = H, y1 = -1, sx = 0, n = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (aB[y * W + x]) { n++; sx += x; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    r.than = n ? { day: y1 + 1 - 54, dinh: y0 - 54, tx: +(sx / n - 32).toFixed(1), n } : null;
    // mặt
    let mat = null;
    try { const sp = SC.cuaEmBe(key, oB); if (sp) { const s = SC.chonEmBe(sp, oB); r.hang = s.ten + ':' + s.i; mat = SC.matKhung(sp, s.ten, s.i); } } catch (er) { r.loiMat = String(er); }
    if (mat) {
      const mx = 32 + face * mat.x + (face < 0 ? 1 : 0), my = 54 + mat.y, R = Math.max(2, mat.r);
      let fw = 0, fg = 0, ft = 0;
      for (let y = Math.floor(my - R); y <= my + R; y++) for (let x = Math.floor(mx - R); x <= mx + R; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H || (x - mx) ** 2 + (y - my) ** 2 > R * R) continue;
        const i = y * W + x; if (!aB[i]) continue; ft++; if (mW[i]) fw++; if (mG[i]) fg++;
      }
      r.mat = { x: +(mx - 32).toFixed(1), y: +(my - 54).toFixed(1), r: +R.toFixed(1), tong: ft, vk: fw, do: fg };
    }
    // vũ khí lơ lửng: khoảng cách nhỏ nhất (Chebyshev) từ điểm ảnh vũ khí tới thân
    const kc = (m) => { let best = 99, cnt = 0; for (let i = 0; i < W * H; i++) if (m[i]) { cnt++; const x = i % W, y = (i / W) | 0; for (let d = 0; d < best && d < 8; d++) { let hit = false; for (let yy = y - d; yy <= y + d && !hit; yy++) for (let xx = x - d; xx <= x + d; xx++) { if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; if (aB[yy * W + xx] && !m[yy * W + xx]) { hit = true; break; } } if (hit) { best = d; break; } } if (best === 0) break; } return cnt ? best : null; };
    r.vk_kc = wt ? kc(mW) : null; r.vk_n = mW.reduce((a, b) => a + b, 0);
    r.do_kc = kc(mG); r.do_n = mG.reduce((a, b) => a + b, 0);
    out.push(r);
    if (sc) { sc.fillStyle = (j % 2) ? '#4a6b3c' : '#55744a'; sc.fillRect(j * W * S, 0, W * S, H * S); sc.drawImage(cF.canvas, j * W * S, 0, W * S, H * S); }
  });
  return { out, png: sheet ? sheet.toDataURL('image/png') : null, nhan: poses.map(p => p[0]) };
}
"""
GEAR = {'hat': 'non_la', 'back': 'ho_lo', 'hand': 'bua_hut', 'wing': {'kind': 'lua', 'level': 3}}
GEAR2 = {'hat': 'khan_xep', 'back': 'ong_ten', 'hand': 'bua_tham', 'mask': 'ho', 'wing': {'kind': 'chuon', 'level': 1}}
def main():
    from PIL import Image
    kq = {}
    with sync_playwright() as p:
        b, pg, errs = mo(p)
        pg.add_script_tag(path=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tu_the.js'))
        if CO: pg.evaluate(CO)
        for key in ['smith', 'hunter', 'healer', 'wrestler']:
            rows = []
            for bo in [None, 'rung', 'bien', 'lau']:
                for wt in ['sword', 'bow', 'spear', 'hammer']:
                    for face in ([1, -1] if bo is None else [1]):
                        for gi, gear in enumerate([GEAR, GEAR2] if bo is None and face == 1 else [GEAR]):
                            chup = (bo is None and gi == 0) or (bo is not None and wt in ('sword', 'hammer'))
                            r = pg.evaluate(JS, [key, bo, wt, face, gear, 2, chup])
                            kq['%s|%s|%s|%d|%d' % (key, bo or 'goc', wt, face, gi)] = r['out']
                            if r['png']:
                                im = Image.open(io.BytesIO(base64.b64decode(r['png'].split(',')[1]))).convert('RGB')
                                rows.append(('%s %s %s %s' % (bo or 'gốc', wt, 'phải' if face > 0 else 'trái', 'đồ1' if gi == 0 else 'đồ2'), im, r['nhan']))
            # ghép tấm theo em bé
            Wm = max(im.width for _, im, _ in rows); Hs = sum(im.height + 14 for _, im, _ in rows)
            C = Image.new('RGB', (Wm, Hs), (30, 36, 44)); from PIL import ImageDraw; dr = ImageDraw.Draw(C); y = 0
            for t, im, nh in rows:
                dr.text((2, y + 1), t, fill=(255, 255, 255))
                for j, n in enumerate(nh): dr.text((j * 128 + 30, y + 1), n, fill=(200, 220, 255))
                C.paste(im, (0, y + 14)); y += im.height + 14
            C.save(os.path.join(OUT, 'bang-%s.png' % key), optimize=True)
            print(key, 'xong', len(rows), 'hàng')
        print('pageerror:', errs)
        b.close()
    json.dump(kq, open(os.path.join(OUT, 'do.json'), 'w'), ensure_ascii=False)
main()
