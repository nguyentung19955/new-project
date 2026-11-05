// TURRET MERGE — PHÔNG CHỮ: một chỗ duy nhất cho mọi chữ vẽ trên canvas (ctx.font). Khai báo @font-face ở css/fonts.css.
// "TM Display" = phông máy móc/sci-fi cho số và nhãn lớn · "TM UI" = phông chữ thường dễ đọc. Đổi phông: chỉ sửa css/fonts.css.
'use strict';

const FONT = {
  display: '"TM Display","TM UI",system-ui,sans-serif',
  ui: '"TM UI",system-ui,sans-serif',
  d(px, w) { return (w || 900) + ' ' + px + 'px ' + this.display; }, // FONT.d(12) → '900 12px "TM Display",…'
  u(px, w) { return (w || 700) + ' ' + px + 'px ' + this.ui; },
  // chờ phông về trước lần vẽ canvas đầu tiên (tối đa 3 giây, mạng chậm thì vẫn vào game)
  ready: (document.fonts && document.fonts.load
    ? Promise.race([
      Promise.all(['900 20px "TM Display"', '600 12px "TM UI"', '800 12px "TM UI"'].map(f => document.fonts.load(f))).then(() => document.fonts.ready),
      new Promise(r => setTimeout(r, 3000)),
    ]) : Promise.resolve()).catch(() => { }),
};
