'use strict';
/* chu.js – HỆ FONT CHUNG cho chữ VẼ TRÊN CANVAS (đi cùng game/giao-dien/chu.css). Phương án A – docs/khoi-dau/font-chatgpt.txt.
   CHU.PIXEL (Handjet)  : HUD số, bia chỉ đường, thông báo, gợi ý, nút, tên người nói.
   CHU.STORY (Spectral) : hội thoại, tên vùng / tên phòng / tên trùm (tiêu đề kể chuyện).
   CHU.UTIL  (IBM Plex) : chữ nhỏ thông tin (trạng thái, ghi chú).
   CHU.cho()  : chờ phông tải xong (tối đa 2,5 s) TRƯỚC khi đo/vẽ chữ canvas – không có mạng thì dùng phông dự phòng.
   CHU.vien(ctx, s, x, y, mau, bong) : vẽ chữ với bóng S1 (viền cứng 1 px 4 phía, không làm đậm giả, không quầng sáng). */
(() => {
  const CHU = window.CHU = {
    PIXEL:"Handjet,'Arial Narrow',sans-serif",
    STORY:"Spectral,Georgia,serif",
    UTIL:"'IBM Plex Sans',Arial,sans-serif",
    BONE:'#F5E8D0', GOLD:'#E8BB68', MUTED:'#C5A477', PARCH:'#E8D6BA', ASH:'#AFA3AE', DANGER:'#F0AA83',
    f(w, px, ho){ return w + ' ' + Math.round(px) + 'px ' + (ho || CHU.PIXEL); },
    san:false,
    cho(ms){
      if (!document.fonts || !document.fonts.load) return Promise.resolve(false);
      const nap = Promise.all(['750 21px Handjet', '700 21px Handjet', '650 18px Handjet', '500 17px Spectral', '700 27px Spectral', '600 14px "IBM Plex Sans"', '500 15px "IBM Plex Sans"']
        .map(f => document.fonts.load(f).catch(() => null))).then(() => document.fonts.ready).then(() => { CHU.san = true; return true; });
      return Promise.race([nap, new Promise(r => setTimeout(() => r(false), ms || 2500))]);
    },
    // S1: 0 1px, 1px 0, -1px 0, 0 -1px (đơn vị = px của canvas; d = độ dày theo tỉ lệ canvas)
    vien(g, s, x, y, mau, bong, d, maxW){   // maxW (tuỳ chọn): bề rộng tối đa như fillText – chữ dài tự ép hẹp, không tràn khung
      d = d || 1; const c = g.fillStyle, t = (xx, yy) => maxW ? g.fillText(s, xx, yy, maxW) : g.fillText(s, xx, yy);
      g.fillStyle = bong || '#160D19';
      t(x, y + d); t(x + d, y); t(x - d, y); t(x, y - d);
      g.fillStyle = mau || c; t(x, y);
    }
  };
  CHU.cho();
})();
