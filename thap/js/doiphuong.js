// TURRET MERGE — DẢI BỘ BÀI PHE BÊN KIA (CO-OP: đồng đội · PVP: đối thủ):
//  5 thẻ nhỏ (chân dung phi công + huy hiệu nhận diện + màu khoá) + chỉ huy, đặt ngay trên bàn phía trên.
//  Chạm thẻ → bảng thông tin gọn (có nút Details › mở trang chi tiết). Khay nền = ảnh ChatGPT (ui_khay_doi) nếu có.
'use strict';
const DP = {
  el: null,
  dung() {
    if (this.el) return this.el;
    const el = document.createElement('div'); el.id = 'dp-dai'; el.hidden = true;
    // chèn ngay sau #top → CSS "#top[hidden] ~ #dp-dai" tự ẩn khi rời trận
    const top = $('#top'); top.parentNode.insertBefore(el, top.nextSibling);
    el.addEventListener('pointerdown', (e) => e.stopPropagation());
    el.addEventListener('click', (e) => {
      const c = e.target.closest('[data-dp]'); if (!c) return;
      e.stopPropagation(); try { SND.nut(); } catch (er) { }
      if (c.dataset.dp === 'mv') UI.moTTMV(c.dataset.id); else UI.moTT(c.dataset.id, null, true);
    });
    this.el = el; return el;
  },
  ve() {
    const el = this.dung(), B = G.ban[1];
    if (!B || G.ban.length < 2 || (G.che !== 'coop' && G.che !== 'pvp')) { el.hidden = true; return; }
    const pvp = G.che === 'pvp';
    el.classList.toggle('pvp', pvp);
    let h = '<span class="dp-nhan">' + (pvp ? (TEXT.ui.rival || 'Rival') : (TEXT.ui.ally || 'Ally')) + '</span>';
    B.deck.forEach((id, i) => {
      const k = (typeof ND !== 'undefined' && ND.mau(B, id)) || ND.KEY[i % 5];
      const ten = (G.rosterMap[id] && G.rosterMap[id].ten) || id;
      h += '<button class="dp-the" data-dp="u" data-id="' + id + '" style="--k:' + k + '" aria-label="' + ten + '"><img class="po" src="' + thumbOf(id) + '" alt=""></button>';
    });
    const d = MAVUONG[B.mv.id];
    h += '<button class="dp-the dp-mv" data-dp="mv" data-id="' + B.mv.id + '" style="--k:' + d.mau + '" aria-label="' + d.ten + '"><img class="po" src="' + (typeof anhUrl === 'function' ? anhUrl(d.anh) : 'assets/' + d.anh + '.png') + '" alt="" onerror="this.onerror=null;this.src=\'' + mvIcURL(B.mv.id) + '\'"></button>';
    el.innerHTML = h;
    // vị trí: trên bàn phía trên, chừa cổng đường bên trái và bảng tên bàn bên phải
    el.style.top = Math.round(B.y - (typeof KHUNG !== 'undefined' && KHUNG.bat['co-khay'] ? 46 : 37)) + 'px';
    el.hidden = false;
  },
};
(() => {
  if (typeof UI === 'undefined') return;
  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () { const r = vaoGoc.apply(this, arguments); try { DP.ve(); } catch (e) { console.error('DP', e); } return r; };
  // glyph PNG tải xong sau → vẽ lại dải
  if (typeof GLYPH !== 'undefined' && GLYPH.khiTai) GLYPH.khiTai(() => { if (DP.el && !DP.el.hidden) { clearTimeout(DP._t); DP._t = setTimeout(() => DP.ve(), 200); } });
})();
window.DP = DP;
