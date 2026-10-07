// Test tools/ghep-luoi.py: ảnh rời giả (nền trong suốt / nền phẳng, cỡ khác nhau) → ghép lưới → cat-sheet.py cắt lại đúng số khung.
// Không đụng assets/ hay js/render.js thật. Chạy: node tests/ghep-luoi/ghep-luoi.test.js
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ghep-'));
const RENDER = path.join(TMP, 'render.js');
fs.copyFileSync(path.join(ROOT, 'js/render.js'), RENDER);
const env = { ...process.env, CAT_SHEET_PACKS: path.join(TMP, 'packs'), CAT_SHEET_RENDER: RENDER };
const py = (args) => execFileSync('python3', args, { cwd: ROOT, env }).toString();
let fail = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };

// khung rời giả: người que, ảnh i cỡ khác nhau, nền xen kẽ trong suốt / xanh lá phẳng / hồng tím
const MAKE = `
import sys
from PIL import Image, ImageDraw
d0, n = sys.argv[1], int(sys.argv[2])
for i in range(n):
    s = 300 + 40 * (i % 3)
    bg = [(0, 0, 0, 0), (40, 200, 90, 255), (255, 0, 255, 255)][i % 3]
    im = Image.new('RGBA', (s, s + 60), bg); d = ImageDraw.Draw(im)
    col = ((37 * i + 40) % 200 + 20, (91 * i + 60) % 150 + 20, (53 * i + 90) % 140, 255)
    cx, top, base = s // 2 + (i % 4) * 6, 40 + (i % 3) * 8, s + 20
    d.ellipse((cx - 40, top, cx + 40, top + 80), fill=col, outline=(42, 22, 8, 255), width=4)
    d.rectangle((cx - 35, top + 80, cx + 35, base - 80), fill=col, outline=(42, 22, 8, 255), width=4)
    d.rectangle((cx - 30, base - 80, cx - 8, base), fill=(42, 22, 8, 255)); d.rectangle((cx + 8, base - 80, cx + 30, base), fill=(42, 22, 8, 255))
    d.rectangle((cx + 35, top + 100 + i * 3, cx + 110, top + 115 + i * 3), fill=(200, 160, 40, 255))
    im.save(f'{d0}/khung-{i + 1:02d}.png')
`;
const KIEU = { hero12: [12, 768, 576, { idle: 3, attack: 4, cast: 3, hurt: 1 }], enemy6: [6, 576, 384, { walk: 4, attack: 2 }], boss9: [9, 768, 768, { walk: 4, attack: 3, rage: 2 }] };
for (const [kieu, [n, W, H, frames]] of Object.entries(KIEU)) {
  console.log(kieu + ':');
  const dir = path.join(TMP, kieu); fs.mkdirSync(dir);
  py(['-c', MAKE, dir, String(n)]);
  const out = path.join(TMP, kieu + '.png');
  py(['tools/ghep-luoi.py', kieu, out, dir]);
  const info = JSON.parse(py(['-c', `
import json, sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB'); W, H = im.size
print(json.dumps({'size': [W, H], 'corners': [im.getpixel(p) for p in ((0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1))]}))`, out]));
  ok(info.size[0] === W && info.size[1] === H, `tấm ghép ${info.size.join('×')} (cần ${W}×${H})`);
  ok(info.corners.every((c) => c[0] === 255 && c[1] === 0 && c[2] === 255), 'nền góc ảnh là #FF00FF phẳng');
  py(['tools/cat-sheet.py', out, 'gia' + kieu, kieu]);
  const files = fs.readdirSync(path.join(TMP, 'packs', 'gia' + kieu)).filter((f) => /_\d+\.png$|^(hurt|head)\.png$/.test(f));
  ok(files.length === n, `cat-sheet cắt lại ra ${files.length} khung (cần ${n})`);
  const PF = JSON.parse(fs.readFileSync(RENDER, 'utf8').match(/^const PACK_FRAMES = (\{.*\});/m)[1]);
  ok(JSON.stringify(PF['gia' + kieu]) === JSON.stringify(frames), 'PACK_FRAMES = ' + JSON.stringify(PF['gia' + kieu]));
}
// sai số ảnh → báo lỗi, không ghi file
let err = '';
try { execFileSync('python3', ['tools/ghep-luoi.py', 'enemy6', path.join(TMP, 'x.png'), ...fs.readdirSync(path.join(TMP, 'boss9')).map((f) => path.join(TMP, 'boss9', f))], { cwd: ROOT, stdio: 'pipe' }); } catch (e) { err = e.stderr.toString(); }
ok(/cần đúng 6 ảnh/.test(err) && !fs.existsSync(path.join(TMP, 'x.png')), 'sai số ảnh → báo "cần đúng 6 ảnh"');
fs.rmSync(TMP, { recursive: true, force: true });
console.log(fail ? `\n${fail} lỗi` : '\nTất cả đều đạt');
process.exit(fail ? 1 : 0);
