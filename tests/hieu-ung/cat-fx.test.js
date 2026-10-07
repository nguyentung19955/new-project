// Test tools/cat-fx.py (hat / dai / don) + docs/PROMPT-HIEU-UNG.txt phủ đủ mọi hiệu ứng game đang dùng ảnh.
// Ghi vào thư mục tạm (CAT_FX_OUT), không đụng assets/. Chạy: node tests/hieu-ung/cat-fx.test.js
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'catfx-'));
const env = { ...process.env, CAT_FX_OUT: TMP };
const py = (args) => execFileSync('python3', args, { cwd: ROOT, env }).toString();
let fail = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };

// ảnh giả: hat (4 ô nền đen, chấm trắng mềm), dai đen (6 khung lửa cam lớn dần), dai hồng tím (6 viên đá), don (hổ = elip cam trên nền hồng tím)
py(['-c', `
import sys
from PIL import Image, ImageDraw, ImageFilter
d = sys.argv[1]
im = Image.new('RGB', (1024, 256), (6, 6, 6)); g = ImageDraw.Draw(im)
for i in range(4): g.ellipse((i * 256 + 60, 60, i * 256 + 196, 196), fill=(255, 255, 255))
im.filter(ImageFilter.GaussianBlur(8)).save(d + '/hat.png')
im = Image.new('RGB', (1536, 256), (0, 0, 0)); g = ImageDraw.Draw(im)
for i in range(6): r = 20 + i * 15; g.ellipse((i * 256 + 128 - r, 128 - r, i * 256 + 128 + r, 128 + r), fill=(255, 140, 40))
im.save(d + '/dai-den.png')
im = Image.new('RGB', (1536, 256), (255, 0, 255)); g = ImageDraw.Draw(im)
for i in range(6): g.ellipse((i * 256 + 80, 80 + i * 10, i * 256 + 176, 176 + i * 10), fill=(130, 110, 80), outline=(42, 22, 8), width=4)
im.save(d + '/dai-hong.png')
im = Image.new('RGB', (512, 512), (255, 0, 255)); g = ImageDraw.Draw(im)
g.ellipse((100, 180, 420, 340), fill=(242, 162, 58), outline=(42, 22, 8), width=6)
im.save(d + '/don.png')
`, TMP]);
const info = (f) => JSON.parse(py(['-c', `
import json, sys
from PIL import Image
im = Image.open(sys.argv[1]); W, H = im.size; a = im.convert('RGBA')
print(json.dumps({'size': [W, H], 'mode': im.mode, 'corner': a.getpixel((1, 1)), 'mid': a.getpixel((H // 2, H // 2)), 'last': a.getpixel((W - H // 2, H // 2))}))`, f]));

console.log('hat (ảnh hạt trắng xám, nền đen):');
py(['tools/cat-fx.py', 'hat', path.join(TMP, 'hat.png'), 'a1', 'a2', 'a3', 'a4']);
const a1 = info(path.join(TMP, 'fx', 'a1.png'));
ok(['a1', 'a2', 'a3', 'a4'].every((n) => fs.existsSync(path.join(TMP, 'fx', n + '.png'))), 'ra đủ 4 file assets/fx/a1..a4.png');
ok(a1.mode === 'LA' && a1.size[0] === 256 && a1.size[1] === 256, `định dạng giống Kenney: LA 256×256 (${a1.mode} ${a1.size})`);
ok(a1.corner[3] === 0 && a1.mid[3] > 200, `nền đen → trong suốt (góc ${a1.corner[3]}), tâm đặc (${a1.mid[3]})`);

console.log('dai (dải khung):');
py(['tools/cat-fx.py', 'dai', path.join(TMP, 'dai-den.png'), 'fire-burst']);
const d1 = info(path.join(TMP, 'vfx', 'fire-burst.png'));
ok(d1.size[0] === 6 * 192 && d1.size[1] === 192, `nền đen: 6 khung vuông cao 192 (${d1.size})`);
ok(d1.corner[3] === 0 && d1.last[3] > 240 && d1.last[0] > 240 && d1.last[2] < 80, `nền đen → trong suốt, giữ màu cam (${d1.last})`);
py(['tools/cat-fx.py', 'dai', path.join(TMP, 'dai-hong.png'), 'rocks']);
const d2 = info(path.join(TMP, 'vfx', 'rocks.png'));
ok(d2.size[0] === 6 * 192 && d2.corner[3] === 0 && d2.mid[3] === 255, `nền hồng tím → trong suốt, đá đặc (${d2.size})`);

console.log('don (ảnh rời):');
py(['tools/cat-fx.py', 'don', path.join(TMP, 'don.png'), 'trieu-hoi_ho-ba-vi']);
const d3 = info(path.join(TMP, 'trieu-hoi_ho-ba-vi.png'));
ok(d3.size[0] > d3.size[1] && d3.size[1] < 200, `cắt sát vật (${d3.size})`);

console.log('PROMPT-HIEU-UNG.txt phủ đủ hiệu ứng game:');
const txt = fs.readFileSync(path.join(ROOT, 'docs/PROMPT-HIEU-UNG.txt'), 'utf8');
const vfxjs = fs.readFileSync(path.join(ROOT, 'js/vfx.js'), 'utf8');
const kenney = [...new Set([...vfxjs.matchAll(/'((?:circle|dirt|fire|flame|flare|light|magic|muzzle|scorch|scratch|slash|smoke|spark|star|trace|twirl)_\d+)'/g)].map((m) => m[1]))];
const missK = kenney.filter((n) => !txt.includes(n));
ok(kenney.length >= 32 && !missK.length, `${kenney.length} ảnh Kenney trong js/vfx.js đều có prompt${missK.length ? ' — thiếu ' + missK : ''}`);
const vf = fs.readFileSync(path.join(ROOT, 'js/render.js'), 'utf8').match(/const VFX_FILE = \{([\s\S]*?)\};/)[1];
const strips = [...new Set([...vf.matchAll(/: '([\w-]+)'/g)].map((m) => m[1]))];
const missV = strips.filter((n) => !txt.includes(`Tên file: ${n}.png`));
ok(strips.length >= 17 && !missV.length, `${strips.length} dải VFX_FILE (js/render.js) đều có prompt${missV.length ? ' — thiếu ' + missV : ''}`);
const main = fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8');
const singles = [...new Set([...main.matchAll(/'((?:trieu-hoi|hieu-ung)_[\w-]+)\.png'/g)].map((m) => m[1]))];
const missS = singles.filter((n) => !txt.includes(`Tên file: ${n}.png`));
ok(singles.length >= 6 && !missS.length, `${singles.length} ảnh triệu hồi / vật thể trong js/main.js đều có prompt${missS.length ? ' — thiếu ' + missS : ''}`);
const kinds = [...new Set(['fireball', ...[...main.match(/function drawProjectile[\s\S]*?\n\}/)[0].matchAll(/case '(\w+)'/g)].map((m) => m[1])])];
const missP = kinds.filter((k) => !txt.includes(`dan_${k}`));
ok(kinds.length >= 10 && !missP.length, `${kinds.length} loại đạn bay đều có prompt${missP.length ? ' — thiếu ' + missP : ''}`);

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fail ? `\n${fail} lỗi` : '\nTất cả đều đạt');
process.exit(fail ? 1 : 0);
