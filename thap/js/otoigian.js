// TURRET MERGE — Ô TƯỚNG TỐI GIẢN kiểu DCDW (o-toigian) — người dùng: "biểu tượng bên DCDW tối giản thế này, làm tối giản mà vẫn giữ phong cách game".
//  MỘT ô dùng chung cho mọi chỗ hiện biểu tượng tướng nhỏ: lưới kho/bộ sưu tập (#chon-luoi .c), 5 ô bộ bài (#chon-bo .o-bo),
//  ô chỉ huy thứ 6 (.o-mv), khay trận SOLO/CO-OP/PVP/ONLINE (#bo-the .the + #the-mv), dải vào trận (.vt-mini), dải đối thủ/đồng đội (.dp-the).
//  Ô = chân dung phủ kín cửa sổ vuông (mặt theo mốc PO_NEO — js/chandung.js, biến --po-*) + viền mảnh bo góc theo độ hiếm
//  (assets/o_vien_<bậc>.png — ảnh ChatGPT raw_p10_khung_toigian, tools/thap-cat-otoigian.py) + hàng ngọc độ hiếm nhỏ ở đáy (ngoc_<bậc>.png).
//  KHÔNG tên trên lưới (tên ở bảng chi tiết / nhấn giữ), không cánh/sừng/lửa/vương miện của khung Pass 9 (khung lớn chỉ còn ở trang chi tiết/chỉ huy).
//  Chỉ huy = cùng ô, viền vàng + chip vương miện nhỏ (o_mien.png cắt từ the_khung_mv). Mọi hình là PNG; code chỉ đặt vị trí + chữ số.
//  Lớp trên DOM có sẵn (MutationObserver) → giữ nguyên kéo-thả (dkkeo.js), chạm → chi tiết, nhớ vị trí cuộn, bộ đếm (demkn.js).
'use strict';
const OT = {
  BAC: ['trang', 'xanh', 'tim', 'vang', 'do'],
  bac(id) { return (G.rosterMap && G.rosterMap[id] && G.rosterMap[id].bac) || 'trang'; },
  vien(bac) { return (typeof anhUrl === 'function' ? anhUrl('o_vien_' + bac) : 'assets/' + 'o_vien_' + bac + '.png'); },
  // gắn viền + ngọc vào 1 phần tử (idempotent; đổi bậc khi ô đổi tướng)
  gan(el, bac, ngoc) {
    if (!el) return;
    el.classList.add('ot');
    let v = el.querySelector(':scope > img.ov');
    if (!v) { v = document.createElement('img'); v.className = 'ov'; v.alt = ''; v.draggable = false; el.appendChild(v); }
    const src = this.vien(bac); if (v.getAttribute('src') !== src) v.setAttribute('src', src);
    el.dataset.otb = bac;
    let p = el.querySelector(':scope > .ot-p');
    if (ngoc) {
      const n = this.BAC.indexOf(bac) + 1;
      if (!p || p.dataset.b !== bac) {
        if (!p) { p = document.createElement('span'); p.className = 'ot-p'; el.appendChild(p); }
        p.dataset.b = bac; p.innerHTML = ('<img src="assets/ngoc_' + bac + '.png" alt="" draggable="false">').repeat(n);
      }
    } else if (p) p.remove();
  },
  // hàng ô nhỏ (bộ mẫu, kết quả, sảnh): 5 ụ + chỉ huy — HTML; quet() gắn viền
  mini(id) { return '<i class="ot-mini" data-id="' + id + '"><img class="po" src="' + portraitOf(id) + '" alt="' + ((G.rosterMap[id] || {}).ten || '') + '" draggable="false"></i>'; },
  miniMV(mv) { const d = MAVUONG[mv]; return d ? '<i class="ot-mini ot-mv" data-mv="' + mv + '"><img class="po" ' + (typeof srcTai === 'function' && !(G.ban && G.ban.length) ? srcTai() : 'src') + '="' + (typeof anhUrl === 'function' ? anhUrl(d.anh) : 'assets/' + d.anh + '.png') + '" alt="' + d.ten + '" draggable="false"></i>' : ''; },
  hang(deck, mv) { return '<span class="ot-hang">' + deck.map(id => this.mini(id)).join('') + (mv ? this.miniMV(mv) : '') + '</span>'; },
  mien(el) {
    if (!el || el.querySelector(':scope > img.ot-mien')) return;
    const m = document.createElement('img'); m.className = 'ot-mien'; m.src = 'assets/o_mien.png'; m.alt = ''; m.draggable = false; el.appendChild(m);
  },
  quet(goc) {
    const r = goc || document;
    r.querySelectorAll('#chon-luoi .c[data-id]').forEach(c => this.gan(c, this.bac(c.dataset.id), true));
    r.querySelectorAll('#chon-bo .o-bo').forEach(o => {
      if (o.dataset.id) this.gan(o, this.bac(o.dataset.id), true);
      else { o.classList.remove('ot'); o.querySelectorAll(':scope > img.ov, :scope > .ot-p').forEach(x => x.remove()); }
    });
    r.querySelectorAll('#chon-bo .o-mv').forEach(o => { this.gan(o, 'vang', false); this.mien(o); });
    r.querySelectorAll('#bo-the .the[data-id]').forEach(t => this.gan(t, this.bac(t.dataset.id), false));
    const mv = document.getElementById('the-mv'); if (mv && mv.querySelector('.mv-anh')) { this.gan(mv, 'vang', false); this.mien(mv); }
    r.querySelectorAll('.vt-mini').forEach(m => { const po = m.querySelector('img.po'), id = po && MAT.id(po); const b = /^af_/.test(id || '') ? 'vang' : this.bac(id); this.gan(m, b, false); if (/^af_/.test(id || '')) this.mien(m); });
    r.querySelectorAll('.ot-mini[data-id]').forEach(m => this.gan(m, this.bac(m.dataset.id), false));
    r.querySelectorAll('.ot-mini.ot-mv').forEach(m => { this.gan(m, 'vang', false); this.mien(m); });
    const tt = document.querySelector('#tt .tt-the'), ta = tt && tt.querySelector('.tt-anh');
    if (ta && ta.getAttribute('src')) { const id = MAT.id(ta); if (id) { this.gan(tt, /^af_/.test(id) ? 'vang' : this.bac(id), false); } }
    r.querySelectorAll('.dp-the[data-id]').forEach(d => this.gan(d, this.bac(d.dataset.id), false));
  },
  // cỡ chữ/khe theo px THẬT: #wrap là khung logic 430 phóng theo màn → --ot-k = 430 / bề rộng thật
  co() {
    const w = document.getElementById('wrap'); if (!w) return;
    const s = w.getBoundingClientRect().width / (w.offsetWidth || 430) || 1;
    document.documentElement.style.setProperty('--ot-k', (1 / s).toFixed(4));
    document.documentElement.classList.toggle('ot-hep', innerWidth <= 360);
  },
};
(() => {
  let hen = 0;
  const lam = () => { hen = 0; OT.quet(); };
  const bat = () => {
    OT.co(); OT.quet();
    new MutationObserver(ms => {
      for (const m of ms) {
        const t = m.target;
        // chỉ khi có PHẦN TỬ mới (không phải chữ số LV/đếm đổi mỗi khung, không phải chính viền/ngọc của ô)
        if (m.type === 'childList' && ![...m.addedNodes].some(n => n.nodeType === 1 && !(n.classList.contains('ov') || n.classList.contains('ot-p') || n.classList.contains('ot-mien')))) continue;
        if (m.type === 'attributes') continue;
        if (t.nodeType === 1 && (t.closest('#chon-luoi,#chon-bo,#bo-the,#the-mv,.vt-mini,#dp-dai,#vaotran,#tt,.ot-hang,#ketqua,#hm-tam,#onl-sanh') || t.querySelector && t.querySelector('.vt-mini,.dp-the'))) { if (!hen) hen = requestAnimationFrame(lam); return; }
      }
      if (ms.some(m => m.type === 'attributes' && m.target.classList && m.target.classList.contains('tt-anh')) && !hen) hen = requestAnimationFrame(lam);
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bat); else bat();
  addEventListener('resize', () => OT.co());
})();
// ── ô chân dung nhỏ của BẢNG XEM (phiên thứ 3): xem nhanh bộ bài (.hm-xem-po) + bảng chạm trận (#tt .tt-the) = cùng ô tối giản
(() => {
  const ganXem = (el, id) => { if (el && id && G.rosterMap && G.rosterMap[id]) OT.gan(el, OT.bac(id), false); };
  const boc = (o, k, lay) => { if (!o || typeof o[k] !== 'function') return; const g = o[k]; o[k] = function () { const r = g.apply(this, arguments); try { lay.apply(this, arguments); } catch (e) { } return r; }; };
  const lam = () => {
    if (typeof HM !== 'undefined') boc(HM, 'moXem', (id) => ganXem(document.querySelector('#hm-tam .hm-xem-po'), id));
    if (typeof UI !== 'undefined') boc(UI, 'moTT', (id) => ganXem(document.querySelector('#tt .tt-the'), id));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lam); else lam();
})();
