// Gom các file web của game vào một thư mục để đóng gói / đăng lên mạng.
//   node tools/build-web.js            → www/       (Capacitor đóng gói thành app, không kèm service worker)
//   node tools/build-web.js --hosting  → dist-web/  (Firebase Hosting, kèm sw.js để chơi không cần mạng)
const fs = require('fs'), path = require('path');
const hosting = process.argv.includes('--hosting');
const root = path.join(__dirname, '..'), out = path.join(root, hosting ? 'dist-web' : 'www');
const files = ['index.html', 'den-anh-hung.html', 'css', 'js', 'assets', 'icons', 'manifest.webmanifest'];
if (hosting) files.push('sw.js');
fs.rmSync(out, { recursive: true, force: true });
for (const f of files) {
  fs.cpSync(path.join(root, f), path.join(out, f), { recursive: true });
}
console.log(path.basename(out) + '/ sẵn sàng');
