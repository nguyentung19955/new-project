// TURRET MERGE — khởi động phần ONLINE (nạp SAU CÙNG trong index.html): bọc hàm luật chơi cho CO-OP online, gắn nút bấm,
// hiện chip tài khoản + nút ONLINE ở menu. Lỗi bất kỳ ở đây không được làm hỏng chơi offline.
'use strict';
(function () {
  const chay = () => {
    try { ONS.boc(); } catch (e) { console.error('[online] boc', e); }
    // bắt sự kiện bấm SỚM (pha capture) — nút của tài khoản / phòng / trận online
    window.addEventListener('click', (e) => {
      try {
        const el = e.target.closest && e.target.closest('[data-act]'); if (!el) return;
        const a = el.dataset.act;
        if (a.startsWith('tk-')) { if (TK.bam(a, el)) e.stopImmediatePropagation(); return; }
        if (a.startsWith('onl-')) { if (ONL.bam(a, el)) e.stopImmediatePropagation(); return; }
        if (a.startsWith('chat-')) { if (typeof CHAT !== 'undefined' && CHAT.bam(a, el)) e.stopImmediatePropagation(); return; }
        ONS.bamTruoc(e);
      } catch (er) { console.error('[online] bấm', er); }
    }, true);
    try { TK.init(); } catch (e) { console.error('[online] TK', e); }
    try { ONL.init(); } catch (e) { console.error('[online] ONL', e); }
    try { if (typeof CHAT !== 'undefined') CHAT.init(); } catch (e) { console.error('[online] CHAT', e); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chay, { once: true }); else chay();
})();
