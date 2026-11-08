// TURRET MERGE — THẺ CHỈ HUY TRONG TRẬN: trạng thái nhìn thấy được (SOLO/CO-OP/PVP; chỉ #the-mv của bàn mình).
//  · thiếu mana / bàn đầy: chân dung tối nhẹ (CSS ≤ 35 %) + huy hiệu PNG (vòng đỏ h2_vong_do + ngọc mana h2_ngoc)
//  · sẵn sàng: quầng PNG khung_chon nhịp (css/chihuy-the.css)
//  · tác dụng (RAGE 10 s / HOLY SHIELD 8 s): vòng PNG góc trên-trái, mức còn lại = mặt nạ quạt (--p) + số giây
//  · hồi chiêu: vòng PNG góc trên-phải (rãnh h2_vong_xam + h2_vong_xanh — vòng xanh lá chung — cắt quạt, đầy dần tới lúc sẵn sàng) + số giây
//  · giá tăng ×2 mỗi lần dùng: số to trong ô giá + nhãn "×2/×4…" (giá hiện tại ÷ giá gốc)
// Chỉ ảnh PNG ChatGPT + chữ/số (QUY-TAC-HINH.md). Luật đọc từ CH.trangThai (chihuy.js) — không đổi luật.
'use strict';
const CHT = {
  VONG_TAC: { cuong: 'h2_vong_do', khien: 'fx_vong_mong' },   // vòng tác dụng theo khoá kỹ năng
  a(n) { return (typeof anhUrl === 'function' ? anhUrl(n) : 'assets/' + n + '.png'); },
  dung(te) {
    if (te.querySelector('.cht-glow')) return;
    te.insertAdjacentHTML('afterbegin', '<span class="cht-glow"></span>');
    te.insertAdjacentHTML('beforeend',
      '<span class="cht-khoa" hidden><img class="v" src="' + this.a('h2_vong_do') + '" alt=""><img class="g" src="' + this.a('h2_ngoc') + '" alt=""></span>' +
      '<span class="cht-vong cd" hidden><img src="' + this.a('h2_vong_xam') + '" alt=""><img class="f" src="' + this.a('h2_vong_xanh') + '" alt=""><b></b></span>' +
      '<span class="cht-vong tac" hidden><img src="' + this.a('h2_vong_xam') + '" alt=""><img class="f" src="' + this.a('h2_vong_do') + '" alt=""><b></b></span>');
    const fu = te.querySelector('.tn-full'); if (fu) fu.textContent = 'BOARD FULL';
    const g = te.querySelector('.mv-gia'); if (g && !g.querySelector('.cht-x')) g.insertAdjacentHTML('beforeend', '<i class="cht-x" hidden></i>');
  },
  vaoTran() {
    const B = G.ban[0], te = $('#the-mv'); if (!B || !B.mv || !te) return;
    this.dung(te);
    const d = MAVUONG[B.mv.id], f = te.querySelector('.cht-vong.tac .f'), v = this.VONG_TAC[d.khoa] || 'h2_vong_do';
    f.src = this.a(v); f.classList.toggle('mong', v === 'fx_vong_mong');
    const ten = te.querySelector('.mv-ten'); if (ten) { ten.style.fontSize = ''; if (typeof fitText === 'function') fitText(ten, 9, 6.5); }
    this._k = '';
    this.capNhat();
  },
  dat(el, k, v) { if (el['_' + k] !== v) { el['_' + k] = v; if (k === 'text') el.textContent = v; else if (k === 'hidden') el.hidden = v; else el.style.setProperty(k, v); } },
  capNhat() {
    const B = G.ban[0], te = $('#the-mv'); if (!B || !B.mv || !te || !te.querySelector('.cht-glow')) return;
    const d = MAVUONG[B.mv.id], tt = CH.trangThai(B);
    if (tt !== this._k) { this._k = tt; for (const s of ['san', 'thieu', 'hoi', 'day']) te.classList.toggle('cht-' + s, tt === s); }
    // huy hiệu thiếu mana
    this.dat(te.querySelector('.cht-khoa'), 'hidden', tt !== 'thieu');
    // hồi chiêu
    const vc = te.querySelector('.cht-vong.cd'), cd = B.mv.cd > 0;
    this.dat(vc, 'hidden', !cd);
    if (cd) { this.dat(vc.querySelector('.f'), '--p', (1 - B.mv.cd / d.cd).toFixed(3)); this.dat(vc.querySelector('b'), 'text', Math.ceil(B.mv.cd) + 's'); }
    // tác dụng RAGE / HOLY SHIELD
    const con = d.khoa === 'cuong' ? (B.cuong || 0) : d.khoa === 'khien' ? (B.khien || 0) : (typeof CHM !== 'undefined' && CHM.KHOA[d.khoa] ? CHM.con(B, d.khoa) : 0), vt = te.querySelector('.cht-vong.tac');
    this.dat(vt, 'hidden', !(con > 0));
    if (con > 0) { this.dat(vt.querySelector('.f'), '--p', Math.min(1, con / d.hieuLuc).toFixed(3)); this.dat(vt.querySelector('b'), 'text', Math.ceil(con) + 's'); }
    // giá: cỡ chữ theo số chữ số + nhãn bội số ×2/×4…
    const gia = B.mv.gia, n = String(gia).length, x = te.querySelector('.cht-x');
    const boi = Math.round(gia / d.gia), L = n + (boi >= 2 ? String(boi).length * 0.6 : 0); // tính cả nhãn ×N (×16 làm tràn tấm 2 px)
    this.dat(te, '--cht-gs', (L <= 3.6 ? 15 : L <= 4.6 ? 13 : 11) + 'px');
    if (x) { this.dat(x, 'hidden', !(boi >= 2)); if (boi >= 2) this.dat(x, 'text', '×' + boi); }
  },
};
(() => {
  if (typeof UI === 'undefined') return;
  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () { const r = vaoGoc.apply(this, arguments); try { CHT.vaoTran(); } catch (e) { console.error('CHT', e); } return r; };
  const capGoc = UI.capNhat;
  UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { CHT.capNhat(); } catch (e) { console.error('CHT', e); } return r; };
})();
