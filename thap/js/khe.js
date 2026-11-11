// ASTRAL ARSENAL — KHE RƯƠNG kiểu DCDW (túi thắng giữ tối đa 4, mở mất thời gian) — người dùng cho làm tiếp 12/11 00:58. Thiết kế: tuvan/che-do-dcdw/THIET-KE.md §9.
//  · CHỈ Rương Trận của TÚI THẮNG (thắng PVP / PUSH + trúng xác suất tất định — chedo-dd.js CUP.roi) đi vào khe. Rương từ mốc / nhiệm vụ / SHOP / CO-OP: mở ngay như cũ.
//  · 4 khe. Đầy → không rơi thêm ("CHEST SLOTS FULL"). Mỗi lúc mở 1 rương: rương đầu hàng tự bắt đầu đếm; KHEC.phut phút sau chạm để mở.
//    Mở ngay bằng ngọc: ⌈phút còn lại / KHEC.phutNgoc⌉ ngọc (ít nhất 1).
//  · Thẻ trong rương sinh LÚC MỞ bằng chính bộ sinh Rương Trận của thebai.js (theo wave + bộ bài đã ghi lúc rơi) → không đổi tỉ lệ / số bản.
//  · Đồng hồ = giờ máy (Date.now) — chỉ là kinh tế ngoài trận, KHÔNG ảnh hưởng gameplay trận; không Math.random trong file này.
//  · Lưu: khoá mới turret_kt.khe { o: [ { w, d, at } | null × 4 ] } (at = lúc bắt đầu đếm, 0 = đang chờ tới lượt).
'use strict';

const KHEC = { so: 4, phut: 15, phutNgoc: 3 };
const KHE = {
  st() {
    const s = KT.doc(); let k = s.khe;
    if (!k || typeof k !== 'object' || !Array.isArray(k.o)) k = s.khe = { o: [] };
    while (k.o.length < KHEC.so) k.o.push(null); k.o.length = KHEC.so;
    return k;
  },
  dem() { return this.st().o.filter(Boolean).length; },
  // rương đang đếm (at > 0, chưa xong); không có thì cho rương chờ đầu hàng bắt đầu (rương xong chưa mở không chặn rương sau)
  chay(luu) {
    const o = this.st().o; let c = o.find(x => x && x.at > 0 && !this.san(x));
    if (!c) { c = o.find(x => x && !(x.at > 0)); if (c) { c.at = Date.now(); if (luu !== false) KT.luu(); } }
    return c || null;
  },
  conMs(x) { return x && x.at > 0 ? Math.max(0, x.at + KHEC.phut * 60000 - Date.now()) : KHEC.phut * 60000; },
  san(x) { return !!(x && x.at > 0 && this.conMs(x) <= 0); },
  gia(x) { return Math.max(1, Math.ceil(this.conMs(x) / 60000 / KHEC.phutNgoc)); },
  // thêm 1 Rương Trận vào khe trống đầu tiên → chỉ số khe, hoặc −1 nếu đầy
  them(x) {
    const o = this.st().o, i = o.findIndex(y => !y); if (i < 0) return -1;
    o[i] = { w: Math.max(1, x.w | 0), d: (x.d || []).slice(0, 5), at: 0 }; this.chay(false); KT.luu();
    return i;
  },
  // mở khe i (đã xong, hoặc trả ngọc) → danh sách thẻ, hoặc null
  mo(i, ngoc) {
    const o = this.st().o, x = o[i]; if (!x) return null;
    if (typeof G !== 'undefined' && G.debug && (G.debug.mana || G.debug.auto || G.debug.wave)) return null; // trận thử: bộ sinh thẻ không chạy → giữ rương, không trừ ngọc
    if (!this.san(x)) { if (!ngoc || !KT.tra({ ngoc: this.gia(x) })) return null; } // chưa xong: chỉ mở khi trả ngọc
    const m = { che: 'khe', deck: x.d, trum: 0, lot: {} };
    const r = THEBAI.thuong({ wave: x.w, thang: false }, m); if (!r) return null;
    if (r.vang) KT.cong('vang', -r.vang, 'battle'); // vàng trận đã phát lúc thắng — chỉ lấy THẺ của rương
    o[i] = null; this.chay(false); KT.luu();
    return r.the;
  },
};

const KHEUI = {
  gio(ms) { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },
  dung() {
    const d = document.querySelector('#chon .hm-duoi'); if (!d || document.getElementById('khe')) return;
    const e = document.createElement('div'); e.id = 'khe'; e.className = 'khe'; d.insertBefore(e, d.firstChild);
  },
  ve() {
    const e = document.getElementById('khe'); if (!e) return;
    KHE.chay();
    const o = KHE.st().o, a = (typeof KTUI !== 'undefined' && typeof KTA !== 'undefined') ? KTUI.a(KTA.ru.tran) : 'assets/shop_ru_thuong.webp?v=ab85ea6a';
    const k = o.map(x => !x ? 'x' : KHE.san(x) ? 's' : x.at > 0 ? 'd' + Math.ceil(KHE.conMs(x) / 1000) : 'c').join('|');
    if (e._k === k) return; e._k = k;
    e.innerHTML = o.map((x, i) => {
      if (!x) return '<span class="khe-o trong"><small>EMPTY</small></span>';
      const san = KHE.san(x), dem = x.at > 0;
      return '<button class="khe-o' + (san ? ' san' : dem ? ' dem' : '') + '" data-act="khe-mo" data-i="' + i + '" aria-label="Battle chest slot ' + (i + 1) + '"><img src="' + a + '" alt="" draggable="false"><b>' + (san ? 'OPEN' : dem ? this.gio(KHE.conMs(x)) : 'NEXT') + '</b></button>';
    }).join('');
  },
  // chạm khe: xong → mở; đang đếm / chờ → hỏi mở ngay bằng ngọc
  bam(i) {
    const x = KHE.st().o[i]; if (!x) return;
    if (KHE.san(x)) return this.mo(i, false);
    const g = KHE.gia(x);
    TTUI.phu('<b class="kt-phu-t">BATTLE CHEST</b><p class="kt-chu">' + (x.at > 0 ? 'Opens in ' + this.gio(KHE.conMs(x)) + '.' : 'Waiting: one chest unlocks at a time (' + KHEC.phut + ' min each).') + ' Open now for ' + g + ' gems?</p>' +
      '<div class="cd-nut"><button class="hm-nut2" data-act="tt-dong"><b>LATER</b></button><button class="hm-nut2 vang" data-act="khe-ngoc" data-i="' + i + '"' + (KT.ngoc >= g ? '' : ' disabled') + '><b>OPEN · ' + g + ' GEMS</b></button></div>', 'cd-p khe-p');
  },
  mo(i, ngoc) {
    const the = KHE.mo(i, ngoc); try { TTUI.dong(); } catch (e) { }
    this.ve(); try { KTUI.capNhat(); } catch (e) { }
    if (!the) return;
    const tran = { k: 'tran', ten: 'BATTLE CHEST', the: the.map(x => ({ id: x.id, n: x.n, bac: x.bac || THEBAI.bac(x.id), moi: x.moi })).sort((a, b) => TIERS[a.bac].thuTu - TIERS[b.bac].thuTu) };
    KTUI.nhan({ vang: 0, ngoc: 0, the: [], ru: [tran] }, '', { phu: (h, c) => SHUI.phuKq(h, c), dong: 'sh-dong' });
  },
};

(function () {
  if (typeof KT === 'undefined' || typeof THEBAI === 'undefined' || typeof HM === 'undefined' || typeof TTUI === 'undefined') return;
  if (typeof UP_XEM !== 'undefined' && UP_XEM) return;
  try { KHE.st(); } catch (e) { console.error('KHE', e); }
  const vh = HM.veHome;
  HM.veHome = function () { const r = vh.apply(this, arguments); try { KHEUI.dung(); KHEUI.ve(); } catch (e) { console.error('KHE', e); } return r; };
  setInterval(() => { try { const c = document.getElementById('chon'); if (c && !c.hidden && !(G.ban && G.ban.length)) KHEUI.ve(); } catch (e) { } }, 1000); // đồng hồ ngoài trận (giờ máy)
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act="khe-mo"], [data-act="khe-ngoc"]'); if (!b || b.disabled) return;
    e.stopPropagation(); try { SND.nut(); } catch (er) { }
    if (b.dataset.act === 'khe-mo') KHEUI.bam(+b.dataset.i); else KHEUI.mo(+b.dataset.i, true);
  }, true);
  if (typeof VI_MAU !== 'undefined') Object.assign(VI_MAU, {
    'EMPTY': 'TRỐNG', 'NEXT': 'CHỜ', 'BATTLE CHEST': 'RƯƠNG TRẬN', 'Opens in #:#.': 'Mở sau #:#.', 'Waiting: one chest unlocks at a time (# min each).': 'Đang chờ: mỗi lúc chỉ mở 1 rương (# phút mỗi rương).',
    'Open now for # gems?': 'Mở ngay với # ngọc?', 'Opens in #:#. Open now for # gems?': 'Mở sau #:#. Mở ngay với # ngọc?', 'Waiting: one chest unlocks at a time (# min each). Open now for # gems?': 'Đang chờ: mỗi lúc chỉ mở 1 rương (# phút mỗi rương). Mở ngay với # ngọc?',
    'OPEN · # GEMS': 'MỞ · # NGỌC', 'LATER': 'ĐỂ SAU', 'CHEST SLOTS FULL': 'KHE RƯƠNG ĐÃ ĐẦY', 'BATTLE CHEST → SLOT #/# · OPENS IN # MIN': 'RƯƠNG TRẬN → KHE #/# · MỞ SAU # PHÚT',
  });
})();
