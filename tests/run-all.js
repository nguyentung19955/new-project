'use strict';
// Chạy mọi test song song. Cách dùng:
//   node tests/run-all.js                 → đủ bộ (tests/*/*.test.js + tests/coop/run-all.js), 4 luồng
//   node tests/run-all.js hop-the cho-tuong → chỉ test có đường dẫn chứa một trong các từ đó
//   node tests/run-all.js --j 6           → 6 luồng (hoặc --j=6); --j 1 = chạy lần lượt
//   node tests/run-all.js --list          → in danh sách test sẽ chạy rồi thoát
//   node tests/run-all.js -v              → in toàn bộ đầu ra của mọi test (mặc định chỉ in test lỗi)
// Test tự bỏ qua (thiếu môi trường) thì in một dòng bắt đầu bằng "SKIP" rồi thoát mã 0 → bảng ghi BỎ QUA, không tính lỗi.
// Thời gian lần chạy trước lưu ở tests/.thoi-gian.json (không commit) để xếp test lâu chạy trước, rút ngắn tổng thời gian.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const DIR = __dirname;
const ROOT = path.resolve(DIR, '..');
const TIMES = path.join(DIR, '.thoi-gian.json');
const argv = process.argv.slice(2);
let J = 4, verbose = false, list = false, timeoutS = 900;
const filters = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--j' || a === '-j') J = +argv[++i];
  else if (/^--?j=?\d+$/.test(a)) J = +a.replace(/\D/g, '');
  else if (a === '-v' || a === '--verbose') verbose = true;
  else if (a === '--list') list = true;
  else if (a === '--timeout') timeoutS = +argv[++i];
  else filters.push(a);
}
if (!(J >= 1)) J = 4;

const all = [];
for (const d of fs.readdirSync(DIR).sort()) {
  const p = path.join(DIR, d);
  if (!fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p).sort()) if (f.endsWith('.test.js')) all.push(`${d}/${f}`);
  if (d === 'coop' && fs.existsSync(path.join(p, 'run-all.js'))) all.push('coop/run-all.js');
}
const tests = filters.length ? all.filter((t) => filters.some((f) => t.includes(f))) : all;
if (!tests.length) { console.error(`Không có test nào khớp: ${filters.join(' ')}`); process.exit(2); }
if (list) { tests.forEach((t) => console.log(t)); process.exit(0); }

let prev = {};
try { prev = JSON.parse(fs.readFileSync(TIMES, 'utf8')); } catch (e) { /* lần đầu */ }
// test lâu chạy trước (chưa biết thời gian → coi như lâu)
const queue = tests.slice().sort((a, b) => (prev[b] ?? 1e9) - (prev[a] ?? 1e9));

const results = [];
const t0 = Date.now();
const fmt = (ms) => (ms / 1000).toFixed(1) + ' giây';

function run(t) {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(process.execPath, [path.join(DIR, t)], { cwd: ROOT, env: { ...process.env, CHAY_SONG_SONG: '1' } });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    const timer = setTimeout(() => { out += `\n[run-all] quá ${timeoutS} giây → dừng`; child.kill('SIGKILL'); }, timeoutS * 1000);
    child.on('close', (code, sig) => {
      clearTimeout(timer);
      const ms = Date.now() - start;
      const skip = code === 0 && /^SKIP\b/m.test(out);
      const status = code === 0 ? (skip ? 'BỎ QUA' : 'ĐẠT') : 'LỖI';
      const r = { t, status, ms, code: code ?? sig, out, why: skip ? (out.match(/^SKIP\b:?\s*(.*)$/m)[1] || '') : '' };
      results.push(r);
      console.log(`${status.padEnd(6)} ${t} (${fmt(ms)})${r.why ? ' — ' + r.why : ''}`);
      if (status === 'LỖI' || verbose) console.log(out.replace(/^/gm, '    │ ') + '\n');
      resolve();
    });
  });
}

(async () => {
  console.log(`Chạy ${queue.length} test, ${J} luồng song song…`);
  const workers = Array.from({ length: Math.min(J, queue.length) }, async () => { while (queue.length) await run(queue.shift()); });
  await Promise.all(workers);
  const total = Date.now() - t0;
  // lưu thời gian (gộp với lần trước, chỉ cập nhật test vừa chạy và không bỏ qua)
  for (const r of results) if (r.status !== 'BỎ QUA') prev[r.t] = r.ms;
  try { fs.writeFileSync(TIMES, JSON.stringify(prev, null, 1)); } catch (e) { /* không ghi được thì thôi */ }

  results.sort((a, b) => b.ms - a.ms);
  const w = Math.max(...results.map((r) => r.t.length));
  console.log('\n' + 'Test'.padEnd(w) + '  Kết quả  Thời gian');
  console.log('-'.repeat(w + 22));
  for (const r of results) console.log(`${r.t.padEnd(w)}  ${r.status.padEnd(7)}  ${fmt(r.ms).padStart(10)}${r.why ? '  (' + r.why + ')' : ''}`);
  const sum = results.reduce((s, r) => s + r.ms, 0);
  const n = (s) => results.filter((r) => r.status === s).length;
  console.log('-'.repeat(w + 22));
  console.log(`Tổng: ${fmt(total)} (cộng dồn ${fmt(sum)}, ${J} luồng) · đạt ${n('ĐẠT')} · lỗi ${n('LỖI')} · bỏ qua ${n('BỎ QUA')}`);
  if (n('LỖI')) console.log('Test lỗi: ' + results.filter((r) => r.status === 'LỖI').map((r) => r.t).join(', '));
  process.exit(n('LỖI') ? 1 : 0);
})();
