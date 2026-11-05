// Đồ dùng chung cho các bài kiểm bản lưu (luu_an_toan.test.js, luu_may.test.js): mở game trong Node (tests/node_trang.js, ?cloud=0),
// gửi mã chạy trong trang. Mã trả Promise thì gọi goiCho(): chạy, cất kết quả vào globalThis.__kq, lượt sau mới đọc (Firestore giả chỉ dùng microtask).
'use strict';
const path = require('path'), { spawn } = require('child_process');
const TRANG = path.join(__dirname, 'node_trang.js');

function moTrang(q) {
  const env = Object.assign({}, process.env);
  if (q) env.LK_Q = q; else delete env.LK_Q;
  const p = spawn(process.execPath, [TRANG], { env, stdio: ['pipe', 'pipe', 'pipe'] });
  let buf = '', loi = '';
  const cho = [];
  p.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); const f = cho.shift(); if (f) f(l); }
  });
  p.stderr.on('data', (d) => { loi += d; });
  const goi = (code, arg) => new Promise((res, rej) => {
    cho.push((l) => { const o = JSON.parse(l); if (o.ok) res(o.v); else rej(new Error(o.loi)); });
    p.stdin.write(JSON.stringify({ code: typeof code === 'function' ? '(' + code.toString() + ')' : code, arg }) + '\n');
  });
  // hàm async: chạy rồi đọc kết quả ở lượt sau (đủ cho các Promise chỉ dùng microtask)
  const goiCho = async (code, arg) => {
    // gửi hàm thật: gói lại thành một biểu thức
    await goi('((a) => { const f = ' + (typeof code === 'function' ? '(' + code.toString() + ')' : code) + '; globalThis.__kq = { xong: false }; Promise.resolve().then(() => f(a)).then((v) => { globalThis.__kq = { xong: true, v }; }, (e) => { globalThis.__kq = { xong: true, loi: String((e && e.stack) || e) }; }); return 1; })', arg);
    for (let i = 0; i < 50; i++) {
      const k = await goi('globalThis.__kq');
      if (k && k.xong) { if (k.loi) throw new Error(k.loi); return k.v; }
      await new Promise((r) => setTimeout(r, 5));
    }
    throw new Error('hết giờ chờ kết quả');
  };
  return { goi, goiCho, dong: () => p.kill(), loi: () => loi };
}

let soDat = 0;
function dat(ok, m) { if (!ok) throw new Error('SAI: ' + m); soDat++; console.log('  ✓ ' + m); }
const dem = () => soDat;
module.exports = { moTrang, dat, dem };
