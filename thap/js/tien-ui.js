// TURRET MERGE — HUD TIỀN TỆ + CHỈ HUY (P0-06 / P0-09). Chỉ chữ/số + ảnh PNG có sẵn (QUY-TAC-HINH.md).
//  · Ngọc mana (TIEN.mana.glyph) CHUNG cho hộp mana, Triệu hồi, Chỉ huy; thẻ Nâng cấp dùng icon riêng (CHI.nang.icon = mũi tên xanh).
//  · Gợi ý 1 lần (lưu localStorage) giải thích số xanh dưới thẻ = POWER-UP trả bằng MANA.
//  · Trạng thái thiếu: giá đỏ; bàn đầy: "FULL"; hồi chiêu: số giây trên chân dung; chạm khi không dùng được → lắc + lý do.
//  · Giá chỉ huy đổi trực tiếp (nảy số + "40→80" bay lên); thanh RAGE 10 s trên nút; khiên 8 s ở lõi (ic_khien + giây).
'use strict';
const TIENUI = {
  LY: { thieu: 'NOT ENOUGH MANA', hoi: 'COOLDOWN', day: 'BOARD FULL · ALL 7★', dung: 'PAUSED', ketthuc: '' },
  _gia: -1, _tt: '',
  lan(el, c, ms) { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); setTimeout(() => el.classList.remove(c), ms); },
  img(n) { return (typeof anhUrl === 'function' ? anhUrl(n) : 'assets/' + n + '.png'); },
  vaoTran() {
    const B = G.ban[0]; if (!B) return;
    const mg = this.img(TIEN.mana.glyph);
    for (const q of ['#mana-hop img', '#nut-trieu .tr-gia img', '#the-mv .mv-gia img']) { const e = $(q); if (e) e.src = mg; }
    document.querySelectorAll('#bo-the .the .gia img').forEach(e => { e.src = this.img(CHI.nang.icon); e.classList.add('tn-nang'); });
    const te = $('#the-mv');
    if (!te.querySelector('.tn-thanh')) {
      te.insertAdjacentHTML('beforeend', '<span class="tn-thanh" hidden><i></i><b></b></span><b class="tn-cd" hidden></b><b class="tn-full" hidden>FULL</b>');
    }
    const nt = $('#nut-trieu'); if (!nt.querySelector('.tn-full')) nt.querySelector('.tr-chu').insertAdjacentHTML('beforeend', '<span class="tn-full" hidden>FULL</span>');
    if (!$('#tn-khien')) $('#wrap').insertAdjacentHTML('beforeend', '<div id="tn-khien" hidden><img src="' + this.img('ic_khien') + '" alt=""><b></b></div><div id="tn-goi" hidden></div>');
    $('#tn-khien').hidden = true;
    this._gia = B.mv.gia; this._tt = '';
    this.goiY();
  },
  // vị trí lõi của bàn 0 (đầu mút đường đi)
  loi(B) { const p = G.duong.find(d => d.ban === B.i); return p ? p.pts[p.pts.length - 1] : null; },
  capNhat() {
    const B = G.ban[0]; if (!B || !B.mv) return;
    const te = $('#the-mv'), d = MAVUONG[B.mv.id];
    const tt = CH.trangThai(B);
    if (tt !== this._tt) { this._tt = tt; for (const k of ['hoi', 'thieu', 'day']) te.classList.toggle('tn-' + k, tt === k); }
    const cd = te.querySelector('.tn-cd'), s = tt === 'hoi' ? Math.ceil(B.mv.cd) + 's' : '';
    if (cd._v !== s) { cd._v = s; cd.textContent = s; cd.hidden = !s; }
    const fu = te.querySelector('.tn-full'); if (fu.hidden !== (tt !== 'day')) fu.hidden = tt !== 'day';
    // giá chỉ huy đổi (×2 sau khi dùng, hoặc giảm do kỹ năng ụ) → nảy số
    if (B.mv.gia !== this._gia) { const g = te.querySelector('.mv-gia'); TIENUI.lan(g, 'tn-nay', 380); this._gia = B.mv.gia; }
    // thanh tác dụng RAGE (10 s) — mức đầy = cắt ảnh
    const th = te.querySelector('.tn-thanh'), con = d.khoa === 'cuong' ? B.cuong : 0;
    if (th.hidden !== !(con > 0)) th.hidden = !(con > 0);
    if (con > 0) {
      const w = Math.round(con / d.hieuLuc * 100) + '%', sx = Math.ceil(con) + 's';
      const f = th.querySelector('i'), b = th.querySelector('b');
      if (f._w !== w) { f._w = w; f.style.width = w; }
      if (b._v !== sx) { b._v = sx; b.textContent = 'RAGE ' + sx; }
    }
    // Triệu hồi: bàn đầy
    const nt = $('#nut-trieu'), day = oTrong(B).length === 0, nf = nt.querySelector('.tn-full');
    if (nf && nf.hidden !== !day) { nf.hidden = !day; nt.classList.toggle('tn-day', day); }
    // khiên bàn (HOLY SHIELD 8 s, hoặc khiên toàn bàn từ ụ) → icon + giây ở lõi
    const k = $('#tn-khien'), co = B.khien > 0;
    if (k.hidden !== !co) { k.hidden = !co; if (co) { const e = this.loi(B); if (e) { k.style.left = Math.round(e[0]) + 'px'; k.style.top = Math.round(e[1]) + 'px'; } } }
    if (co) { const sk = Math.ceil(B.khien) + 's', b = k.querySelector('b'); if (b._v !== sk) { b._v = sk; b.textContent = sk; } }
  },
  // dùng xong: "40→80" bay lên trên nút (giá mới thấy ngay)
  daDung(B, r) {
    const d = MAVUONG[B.mv.id], cu = B.mv.gia / LUAT_MV.heSoGia;
    this.bay(cu + '→' + B.mv.gia, 'tn-bay');
    if (d.khoa === 'cuong') this.bay('RAGE ' + d.hieuLuc + 's', 'tn-bay tn-cam');
    if (r.nang && r.nang.length && !r.sinh.length) this.bay('FULL → +1★ ×' + r.nang.length, 'tn-bay tn-vang');
    else if (r.nang && r.nang.length) this.bay(r.sinh.length + ' NEW · +1★ ×' + r.nang.length, 'tn-bay tn-vang');
  },
  // chữ bay: ngay trên mép trên khay HUD dưới, canh phải theo nút chỉ huy (không đè phím tốc độ/tạm dừng)
  bay(chu, lop) {
    const w = $('#wrap'), wr = w.getBoundingClientRect(), k = wr.width / w.offsetWidth;
    const te = $('#the-mv').getBoundingClientRect(), du = $('#duoi').getBoundingClientRect();
    const e = document.createElement('b'); e.className = lop; e.textContent = chu;
    const hang2 = w.querySelectorAll('.tn-bay').length; // xếp chồng lên nhau, không đè
    e.style.top = Math.round((du.top - wr.top) / k - 22 - hang2 * 17) + 'px';
    e.style.left = Math.round((te.right - wr.left) / k) + 'px';
    w.appendChild(e); setTimeout(() => e.remove(), 1300);
  },
  // chạm khi không dùng được → lắc + lý do (không trừ gì)
  tuChoi(el, ly) {
    this.lan(el, 'h2-lac', 110);
    const t = this.LY[ly]; if (!t) return;
    if (ly === 'thieu') { const B = G.ban[0]; this.bay('NEED ' + Math.ceil(B.mv.gia - B.mana) + ' MORE', 'tn-bay tn-do'); }
    else this.bay(t, 'tn-bay tn-do');
  },
  // gợi ý 1 lần: số xanh dưới thẻ = POWER-UP (trả bằng MANA)
  goiY() {
    let da = false; try { da = localStorage.getItem('tm_goiy_nang') === '1'; } catch (e) { }
    if (da || (G.debug && G.debug.mode && !/[?&]goiy=1/.test(location.search))) return; // vào thẳng trận (kiểm thử) không hiện, trừ ?goiy=1
    const g = $('#tn-goi');
    g.innerHTML = '<img src="' + this.img(CHI.nang.icon) + '" alt=""><span><b>' + CHI.nang.ten + '</b> ' + CHI.nang.mo + ' Tap a card · hold for info.</span>';
    const du = $('#duoi'); // ngay trên khay HUD dưới (không che nút Triệu hồi)
    g.style.top = ''; g.style.bottom = Math.round($('#wrap').offsetHeight - du.offsetTop + 6) + 'px';
    g.hidden = false;
    const tat = () => { g.hidden = true; try { localStorage.setItem('tm_goiy_nang', '1'); } catch (e) { } document.removeEventListener('pointerdown', tat, true); };
    setTimeout(() => document.addEventListener('pointerdown', tat, true), 300);
    setTimeout(tat, 7000);
  },
};

(() => {
  if (typeof UI === 'undefined') return;
  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () { const r = vaoGoc.apply(this, arguments); try { TIENUI.vaoTran(); } catch (e) { console.error('TIENUI', e); } return r; };
  const capGoc = UI.capNhat;
  UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { TIENUI.capNhat(); } catch (e) { console.error('TIENUI', e); } return r; };
  // nút chỉ huy: đọc trạng thái TRƯỚC khi ui.js xử lý chạm (listener trên chính nút chạy trước listener ở document)
  const te = $('#the-mv');
  if (te) te.addEventListener('click', () => { const B = G.ban[0]; if (!B || UI._boQuaMV) return; const tt = CH.trangThai(B); if (tt !== 'san') TIENUI.tuChoi(te, tt); });
  // bảng thông tin chỉ huy: giá hiện tại + 2 mức kế tiếp
  const ttGoc = UI.moTTMV;
  UI.moTTMV = function (id) {
    const r = ttGoc.apply(this, arguments);
    const d = MAVUONG[id], B = G.ban[0] && !$('#top').hidden ? G.ban[0] : null; if (!d) return r;
    const g = B ? B.mv.gia : d.gia, cd = B ? B.mv.cd : 0, h = LUAT_MV.heSoGia;
    const them = d.so ? ' · board full → +1★ to weakest' : d.hieuLuc ? ' · lasts ' + d.hieuLuc + 's (own board only)' : '';
    $('#tt .tt-so').innerHTML = '<div class="d-so">Cost ' + g + ' → ' + g * h + ' → ' + g * h * h + ' mana · cooldown ' + d.cd + 's' + (cd > 0 ? ' · ready in ' + Math.ceil(cd) + 's' : '') + them + '</div>';
    return r;
  };
})();
