// Gom các file web của game vào www/ để Capacitor đóng gói thành app.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
for (const f of ['index.html', 'den-anh-hung.html', 'css', 'js', 'assets', 'icons', 'manifest.webmanifest']) {
  fs.cpSync(path.join(root, f), path.join(out, f), { recursive: true });
}
console.log('www/ sẵn sàng');
