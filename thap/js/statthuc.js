// TURRET MERGE — CHỈ SỐ THỰC TRONG TRẬN: chạm ụ → sát thương ĐÃ CỘNG mọi hiệu ứng (đúng số trúng quái)
//  · statThuc(T): hàm thuần — đọc trạng thái sau khung hình, KHÔNG đổi gì. Dùng CHÍNH dmgU / tocU / critU của game.js
//    và hệ số chí mạng như trung() (2 + buf.cdmg) → số hiển thị không bao giờ lệch số đánh thật.
//  · Bảng thông tin (#tt) trong trận: khối "live" ở đầu (sát thương to, gốc gạch, +X% xanh · tốc bắn · chí mạng · DPS ·
//    nguồn buff), dải chạm (#nd-dai) thêm số sát thương; làm mới 4 lần/giây khi đang mở.
'use strict';

// ---------- hàm thuần ----------
function statThuc(T) {
  const sk = SKILLS[T.id] || {}, B = G.ban[T.ban], ten = (X) => (G.rosterMap[X.id] ? G.rosterMap[X.id].ten : X.id);
  const lv = (B && B.lv[T.id]) || 1;
  // gốc: sao + cấp, chưa buff (đúng phần đầu của dmgU / tocU)
  const goc = (sk.dmg || 0) * TIERS[T.bac].hs * (1 + 0.85 * (T.sao - 1)) * hsLv(B, T.id);
  const tocGoc = (sk.toc || 1) * (sk.tocSao ? 1 + sk.tocSao * (T.sao - 1) : 1);
  const dmg = sk.dmg ? dmgU(T) : 0, toc = sk.dmg ? tocU(T) : 0;
  const luon = !!(sk.luonCrit && sk.luonCrit(T));
  const crit = luon ? 1 : critU(T), cMul = 2 + ((T.buf && T.buf.cdmg) || 0);
  const frozen = T.st.bang > 0 || T.st.da;
  const dps = frozen ? 0 : dmg * toc * (1 + crit * (cMul - 1));
  // nguồn: [{k, ic, txt, v}] — v: số cộng (phần trăm) hoặc hệ số nhân
  const ds = [], huong = (S) => {
    const dc = (S.o % 5) - (T.o % 5), dh = ((S.o / 5) | 0) - ((T.o / 5) | 0);
    return (dh < 0 ? 'up' : dh > 0 ? 'down' : '') + (dh && dc ? '-' : '') + (dc < 0 ? 'left' : dc > 0 ? 'right' : '');
  };
  const pc = (v) => (v >= 0 ? '+' : '−') + Math.round(Math.abs(v) * 100) + '%';
  const tong = { dmg: 0, toc: 0, crit: 0, cdmg: 0 };
  for (const s of T.nguon || []) if (s.v > 0.0005 && tong[s.k] !== undefined) {
    tong[s.k] += s.v;
    ds.push({ k: s.k, ic: s.k === 'cdmg' ? 'crit' : s.k, txt: pc(s.v) + (s.k === 'cdmg' ? ' crit dmg' : s.k === 'toc' ? ' rate' : s.k === 'crit' ? ' crit' : '') + ' from ' + ten(s.T) + ' (' + huong(s.T) + ')' });
  }
  // phần tự có (kỹ năng riêng, dạng grow-up, Bingo, chuỗi, mốc 3★…) = tổng buf − phần ụ khác cho
  const g = typeof laGrow === 'function' && laGrow(T.id) && GROW[T.id] ? GROW[T.id] : null;
  const tuTen = g ? g.ten[Math.max(0, g.gd(T).s - 1)] : ten(T) + ' skill';
  let tuToc = T.buf.toc - tong.toc;
  if (T.tocT > 0) { tuToc -= T.tocV; ds.push({ k: 'toc', ic: 'tam', txt: pc(T.tocV) + ' rate · speed boost ' + Math.ceil(T.tocT) + 's' }); }
  if (typeof mocChung === 'function' && mocChung(T, 3) && loaiMoc(T.id) !== 'ht') { tuToc -= 0.2; ds.push({ k: 'toc', ic: 'toc', txt: '+20% rate · 3★ milestone' }); }
  if (T.epxung > 0) ds.push({ k: 'toc', ic: 'toc', txt: pc(T.epxung) + ' rate · Overclock' });
  const tuDmg = T.buf.dmg - tong.dmg, tuCrit = T.buf.crit - tong.crit;
  if (Math.abs(tuDmg) > 0.0005) ds.push({ k: 'dmg', ic: 'dmg', txt: pc(tuDmg) + ' · ' + tuTen });
  if (Math.abs(tuToc) > 0.0005) ds.push({ k: 'toc', ic: 'toc', txt: pc(tuToc) + ' rate · ' + tuTen });
  if (Math.abs(tuCrit) > 0.0005) ds.push({ k: 'crit', ic: 'crit', txt: pc(tuCrit) + ' crit · ' + tuTen });
  // hệ số nhân (đúng thứ tự trong dmgU)
  if (T.aurora > 0) ds.push({ k: 'dmg', ic: 'dmg', txt: '×1.5 · Mimic merge ' + Math.ceil(T.aurora) + 's' });
  if (T.banSao) ds.push({ k: 'dmg', ic: 'dmg', xau: true, txt: '×0.5 · copy (−50%)' });
  if (B && B.cuong > 0) ds.push({ k: 'dmg', ic: 'dmg', txt: '×2 · Rage ' + Math.ceil(B.cuong) + 's' });
  const moc = typeof heSoMocDmg === 'function' ? heSoMocDmg(T) : 1;
  if (moc !== 1) ds.push({ k: 'dmg', ic: 'dmg', txt: '×' + +moc.toFixed(3) + ' · star milestone' });
  if (typeof themMocCrit === 'function' && themMocCrit(T)) ds.push({ k: 'crit', ic: 'crit', txt: '+10% crit · 7★ milestone' });
  if (sk.crit) ds.push({ k: 'crit', ic: 'crit', txt: pc(sk.crit) + ' crit · ' + tuTen });
  if (luon) ds.push({ k: 'crit', ic: 'crit', txt: 'always crits now' });
  // bất lợi
  if (T.st.kep > 0) ds.push({ k: 'toc', ic: 'toc', xau: true, txt: '×0.6 rate · clamped ' + Math.ceil(T.st.kep) + 's' });
  if (T.st.bang > 0) ds.push({ k: 'toc', ic: 'cham', xau: true, txt: 'frozen ' + Math.ceil(T.st.bang) + 's · not firing' });
  if (T.st.da) ds.push({ k: 'toc', ic: 'khien', xau: true, txt: 'stoned · not firing' });
  if (T.st.lua > 0) ds.push({ k: 'dmg', ic: 'dmg', xau: true, txt: 'burning ' + Math.ceil(T.st.lua) + 's · loses a star' });
  return { dmg, goc, delta: goc > 0 ? dmg / goc - 1 : 0, toc, tocGoc, crit, cMul, dps, frozen, nguon: ds, coDmg: !!sk.dmg };
}

// ---------- hiển thị ----------
const ST = {
  so(v) { return v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1e4 ? (v / 1e3).toFixed(1) + 'k' : v >= 100 ? Math.round(v) + '' : v >= 10 ? v.toFixed(1) : v.toFixed(2); },
  esc(v) { return String(v).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); },
  html(T) {
    const sk = SKILLS[T.id] || {};
    if (sk.vai === 'ht' && typeof hoTroTT === 'function') { // ụ hỗ trợ: cho gì, cho bao nhiêu ụ
      const h = hoTroTT(T); if (!h) return '';
      const B = G.ban[T.ban], nhan = oHoTro(B, T).filter(N => N && N !== T && !N.st.da).map(N => G.rosterMap[N.id].ten);
      return '<div class="st-ht"><img src="' + REN.kyHieuURL(h.k) + '" alt=""><b style="color:' + BUFF[h.k].mau + '">' + this.esc(h.dong.replace(' (current)', '')) + '</b>' +
        '<small>' + (nhan.length ? 'giving to ' + this.esc(nhan.join(', ')) : 'no turret next to it') + '</small></div>';
    }
    const s = statThuc(T); if (!s.coDmg) return '';
    const d = Math.round(s.delta * 100);
    let h = '<div class="st-hang"><div class="st-dmg"><small>Damage</small><b>' + this.so(s.dmg) + '</b>' +
      (Math.abs(d) >= 1 ? '<s>' + this.so(s.goc) + '</s><em class="' + (d < 0 ? 'xau' : '') + '">' + (d > 0 ? '+' : '−') + Math.abs(d) + '%</em>' : '') + '</div>' +
      '<div class="st-o"><small>Rate</small><b>' + (s.frozen ? '0' : s.toc.toFixed(2)) + '</b><i>/s</i></div>' +
      '<div class="st-o"><small>Crit</small><b>' + Math.round(s.crit * 100) + '%</b><i>×' + +s.cMul.toFixed(2) + '</i></div>' +
      '<div class="st-o"><small>DPS</small><b>' + this.so(s.dps) + '</b></div></div>';
    if (s.nguon.length) h += '<div class="st-ng">' + s.nguon.map(n => '<span class="' + (n.xau ? 'xau' : '') + '"><img src="' + REN.kyHieuURL(n.ic) + '" alt="">' + this.esc(n.txt) + '</span>').join('') + '</div>';
    return h;
  },
  tran() { return G.ban.length && !$('#top').hidden; },
  ve() {
    const X = UI.xemU, tt = $('#tt'); if (!X || !X.T || tt.hidden || !this.tran()) return;
    const T = X.T, B = G.ban[T.ban]; if (!B || B.t[T.o] !== T) return;
    let el = tt.querySelector('.st-live');
    if (!el) { el = document.createElement('div'); el.className = 'st-live'; tt.querySelector('.tt-so').prepend(el); }
    const h = this.html(T); if (el._h !== h) { el.innerHTML = h; el._h = h; }
    const dai = $('#nd-dai'); if (dai && !dai.hidden) { // dải chạm: số sát thương
      let c = dai.querySelector('.st-c');
      if (!c) { c = document.createElement('span'); c.className = 'st-c'; dai.append(c); }
      c.textContent = (SKILLS[T.id] || {}).dmg ? this.so(dmgU(T)) + ' dmg' : ''; c.hidden = !c.textContent;
    }
  },
};
(() => {
  const moTTGoc = UI.moTT;
  UI.moTT = function (id, T) {
    const r = moTTGoc.apply(this, arguments);
    if (T && ST.tran()) { ST.ve(); this.ttHet = Math.max(this.ttHet, performance.now() + 5000); } // đủ lâu để đọc số
    return r;
  };
  setInterval(() => { try { ST.ve(); } catch (e) { /* không chặn trận */ } }, 250); // ~4 Hz khi bảng đang mở
})();
