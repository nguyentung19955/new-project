/* Quay video 60 fps của trang thử (không cần GPU): mỗi hình = đúng 1 bước logic (window.TQ.buoc(1)), chụp canvas, đẩy thẳng vào ffmpeg.
   Chạy (từ thư mục tieng-vong-cuoi-cung/):  python3 -m http.server 8765 &   rồi   node game/thu-quai-huong-moi/cong-cu/quay-video.js
   Ra: game/thu-quai-huong-moi/xem-thu/4-quai-60fps.mp4 (H.264, -preset veryfast, 1280×720) + 2 ảnh màn hình cả 4 con. Cần playwright + ffmpeg. */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const OUT = path.join(__dirname, '..', 'xem-thu');
const URL = 'http://localhost:8765/game/thu-quai-huong-moi/index.html?tu=0';
const KICH = [  // [con, chế độ, số bước]
  ['phuden', 'dung', 90], ['phuden', 'di', 200],
  ['doire', 'dung', 90], ['doire', 'di', 200],
  ['namtho', 'dung', 90], ['namtho', 'di', 200],
  ['gaccam', 'dung', 90], ['gaccam', 'di', 200],
  ['ca4', 'dung', 90], ['ca4', 'di', 260],
];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => console.log('lỗi trang:', e.message));
  await p.goto(URL);
  await p.waitForFunction(() => window.TQ && (window.TQ.san_sang || window.TQ.loi), null, { timeout: 30000 });
  const loi = await p.evaluate(() => window.TQ.loi); if (loi) throw new Error(loi);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, '4-quai-60fps.mp4')],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  let n = 0;
  for (const [con, che, so] of KICH) {
    await p.evaluate(([c, h]) => window.TQ.chon(c, h), [con, che]);
    for (let i = 0; i < so; i++) {
      await p.evaluate(() => window.TQ.buoc(1));
      const anh = await p.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(anh)) await new Promise(r => ff.stdin.once('drain', r));
      n++;
      if (con === 'ca4' && i === Math.floor(so * 0.6)) await p.screenshot({ path: path.join(OUT, `man-hinh-ca4-${che}.jpg`), type: 'jpeg', quality: 90 });
    }
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('xong', n, 'hình =', (n / 60).toFixed(1), 's');
  await b.close();
})();
