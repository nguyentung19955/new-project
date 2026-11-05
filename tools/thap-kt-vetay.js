#!/usr/bin/env node
// thap-kt-vetay.js — kiểm tra "vẽ tay" (QUY-TAC-HINH.md quy tắc 1 & 3).
// Quét thap/js và thap/css tìm lệnh vẽ bị cấm; dòng nào có chú thích
//   // vetay-ok: text|png|mask|debug|hit|nen  (JS)   — nen = 1 màu nền đặc toàn màn (như CSS background-color)   hoặc   /* vetay-ok: ... */ (CSS)
// thì được bỏ qua. Còn sót → exit 1.
// Dùng:  node tools/thap-kt-vetay.js [file|thư-mục ...] [--list] [--summary]
//        (mặc định quét thap/js và thap/css; truyền file để chỉ quét file của mình)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
let targets = args.filter(a => !a.startsWith('--'));
if (!targets.length) targets = ['thap/js', 'thap/css'];

const JS_RULES = [
  [/\.arc\s*\(/, 'arc'], [/\.arcTo\s*\(/, 'arcTo'], [/\.ellipse\s*\(/, 'ellipse'],
  [/\.(fill|stroke)Rect\s*\(/, 'fill/strokeRect'], [/\.rect\s*\(/, 'rect'], [/\.roundRect\s*\(/, 'roundRect'],
  [/\.(moveTo|lineTo|quadraticCurveTo|bezierCurveTo)\s*\(/, 'path'],
  [/\.fill\s*\(/, 'fill'], [/\.stroke\s*\(/, 'stroke'],
  [/create(Linear|Radial|Conic)Gradient/, 'gradient'], [/createPattern/, 'pattern'],
  [/setLineDash/, 'setLineDash'], [/shadowBlur\s*=/, 'shadowBlur'], [/new\s+Path2D/, 'Path2D'],
  [/putImageData/, 'putImageData'],
  [/(linear|radial|conic)-gradient/, 'css-gradient-in-js'], [/box-?[sS]hadow/, 'box-shadow-in-js'],
  [/fillText\s*\(\s*['"`][★☆✓✔✗✘✕♥❤⚔🛡⭐●○◆◇▲▼■□]/u, 'glyph-icon'],
];
const CSS_RULES = [
  [/(linear|radial|conic)-gradient/, 'gradient'], [/box-shadow\s*:(?!\s*none)/, 'box-shadow'],
  [/(^|[^-])border(-(top|bottom|left|right))?\s*:\s*(?!none|0\b|0px)[^;]*\b(solid|dashed|dotted|double)\b/, 'border'],
  [/clip-path\s*:\s*(polygon|circle|ellipse)/, 'clip-path-shape'],
  [/filter\s*:[^;]*drop-shadow/, 'drop-shadow'], [/text-shadow\s*:(?!\s*none)/, null], // text-shadow on real text is allowed
];
// border dùng làm khung ẢNH (border-image PNG, viền trong suốt) không phải vẽ tay
const BORDER_ANH = /border-image|solid transparent/;
const OK = /vetay-ok\s*:\s*(text|png|mask|debug|hit|nen)/;

function walk(p, out) {
  const abs = path.resolve(ROOT, p);
  if (!fs.existsSync(abs)) { console.error('không có: ' + p); return out; }
  const st = fs.statSync(abs);
  if (st.isDirectory()) for (const f of fs.readdirSync(abs)) walk(path.join(p, f), out);
  else if (/\.(js|css)$/.test(abs) && !/\.min\.js$/.test(abs)) out.push(abs);
  return out;
}
const files = targets.reduce((o, t) => walk(t, o), []);
const hits = []; const byFile = {};
for (const f of files) {
  const css = f.endsWith('.css');
  const rules = css ? CSS_RULES : JS_RULES;
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((ln, i) => {
    if (OK.test(ln)) return;
    const t = ln.trim();
    if (!css && (t.startsWith('//') || t.startsWith('*'))) return;
    if (css && (t.startsWith('/*') || t.startsWith('*'))) return;
    for (const [re, name] of rules) {
      if (!name) continue;
      if (css && name === 'border' && BORDER_ANH.test(ln)) continue;
      if (re.test(ln)) {
        const rel = path.relative(ROOT, f);
        hits.push(rel + ':' + (i + 1) + '  [' + name + ']  ' + t.slice(0, 110));
        byFile[rel] = (byFile[rel] || 0) + 1;
        break;
      }
    }
  });
}
if (flags.has('--summary') || !flags.has('--list')) {
  Object.keys(byFile).sort((a, b) => byFile[b] - byFile[a]).forEach(k => console.log(String(byFile[k]).padStart(5) + '  ' + k));
}
if (flags.has('--list')) hits.forEach(h => console.log(h));
console.log((hits.length ? 'FAIL' : 'OK') + ' — ' + hits.length + ' dòng vẽ tay chưa có "vetay-ok" trong ' + files.length + ' file');
process.exit(hits.length ? 1 : 0);
