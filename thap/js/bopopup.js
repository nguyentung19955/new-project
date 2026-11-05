// TURRET MERGE — BỎ CHÚ THÍCH / POPUP CHỮ TRONG TRẬN (kiểu DCDW). docs/demo-hop-tuong/tuvan/bopopup/DANH-SACH.md
//  Người dùng: "mấy cái chú thích, hoặc popup trong trận kiểu type difference bỏ đi".
//  · Thao tác sai chỉ báo bằng phản hồi KHÔNG CHỮ: ụ bật về ô cũ + lắc ngắn (ghepfx.js) + chớp E21 / ô gạch E19 (tvb.js);
//    Triệu hồi thiếu mana = nút lắc + số mana chớp 1 lần; bàn đầy = nút Triệu hồi mờ (không chữ BOARD FULL).
//  · GIỮ: số sát thương, số +/− (mana, ★, tim), băng cảnh báo trùm, HUD wave/đếm ngược, BOSS DOWN / SUDDEN DEATH,
//    tấm kết quả ghép, hướng dẫn lần đầu (chỉ khi HD.dang), nhãn hệ thống online (bạn rời / AI chơi thay / bạn quay lại).
//  · Cài đặt "BATTLE HINTS" (mặc định TẮT, localStorage tm_goiy_tran): bật lại toàn bộ chữ giải thích cho người mới.
//  Áp dụng mọi chế độ (SOLO / CO-OP / PVP / ONLINE / Test range) vì lọc ở FX.chu1 + TIENUI.bay + KG.veMeo (dùng chung).
//  Nạp SAU CÙNG (sau tvb.js / tvA.js / otoigian.js). Chỉ chữ/số + lớp CSS mờ/lắc — không vẽ hình mới (QUY-TAC-HINH.md).
'use strict';
const BP = {
  KEY: 'tm_goiy_tran',
  _on: null,
  on() { if (this._on === null) { try { this._on = localStorage.getItem(this.KEY) === '1'; } catch (e) { this._on = false; } } return this._on; },
  dat(v) { this._on = !!v; try { localStorage.setItem(this.KEY, v ? '1' : '0'); } catch (e) { } document.documentElement.classList.toggle('bp-goiy', this._on); this.nhan(); },
  hd() { return typeof HD !== 'undefined' && HD.dang; },        // hướng dẫn lần đầu đang chạy
  cho() { return this.on() || this.hd(); },                       // được hiện chữ giải thích?
  GIU: new Set(['BOSS DOWN!', 'SUDDEN DEATH']),                   // sự kiện lớn của trận (không phải chú thích)
  _he: false,                                                      // đang gọi từ nhãn hệ thống online (ONS.bao)
  // chữ nổi trên sân → giữ nguyên / rút về con số / bỏ
  loc(s) {
    if (this._he || this.cho()) return s;
    s = s == null ? '' : '' + s;
    if (this.GIU.has(s)) return s;
    if (/^[0-9][0-9.,kKmM]*$/.test(s)) return s;                  // số sát thương
    const m = s.match(/^([+−\-]\s?[0-9][0-9.,]*%?\s?[★♥]?)(\s|$)/); // '+12', '−1★', '+2★', '+5 BOUNTY' → '+5', '−2 LIFE' → '−2'
    if (m) return /LIFE/.test(s) ? m[1].trim() + '♥' : m[1].trim();
    if (/^[0-9]+→[0-9]+$/.test(s)) return s;                       // giá chỉ huy 40→80
    return null;
  },
  nhan() { document.querySelectorAll('[data-act="bp-goiy"]').forEach(e => { e.textContent = e.closest('#dung') ? 'Battle hints: ' + (this.on() ? 'on' : 'off') : 'BATTLE HINTS: ' + (this.on() ? 'ON' : 'OFF'); /* bảng Paused viết thường như Music/SFX */ e.classList.toggle('bp-bat', this.on()); }); },
  lan(el, c, ms) { if (!el) return; el.classList.remove(c); void el.offsetWidth; el.classList.add(c); setTimeout(() => el.classList.remove(c), ms); },
};

(() => {
  document.documentElement.classList.toggle('bp-goiy', BP.on());
  // 1) chữ nổi trên sân (canvas): FX.chu1 dùng chung cho mọi bàn / chế độ / Test range
  if (typeof FX !== 'undefined' && FX.chu1) {
    const g = FX.chu1;
    FX.chu1 = function (x, y, s, mau, co, kieu) { const s2 = BP.loc(s); if (s2 == null || s2 === '') return null; return g.call(this, x, y, s2, mau, co, kieu); };
  }
  // nhãn hệ thống online (PARTNER LEFT — AI PLAYING / PARTNER IS BACK): luôn giữ
  if (typeof ONS !== 'undefined' && ONS.bao) {
    const g = ONS.bao;
    ONS.bao = function () { BP._he = true; try { return g.apply(this, arguments); } finally { BP._he = false; } };
  }
  // 2) chữ bay DOM trên khay (TIENUI.bay): lý do từ chối (NEED n MORE, COOLDOWN, BOARD FULL…), RAGE 10s, FULL → +1★…
  if (typeof TIENUI !== 'undefined') {
    const g = TIENUI.bay;
    TIENUI.bay = function (chu, lop) { const s = BP.cho() ? chu : BP.loc(chu); if (s == null) return; return g.call(this, s, lop); };
    const gy = TIENUI.goiY; // mẹo 1 lần "POWER-UP … Tap a card · hold for info." → chỉ khi bật gợi ý
    TIENUI.goiY = function () { if (!BP.cho()) return; return gy.apply(this, arguments); };
  }
  // 3) mẹo ghép trên ô ("Random type, +1★", "Tap a glowing turret to merge") → chỉ khi bật gợi ý / hướng dẫn
  if (typeof KG !== 'undefined' && KG.veMeo) {
    const g = KG.veMeo;
    KG.veMeo = function () { if (!BP.cho()) { this._tip = null; return; } return g.apply(this, arguments); };
  }
  // 4) chữ giải thích trong HUD / dải xem nhanh (quy tắc 6: dải xem nhanh dùng chung mọi chế độ)
  if (typeof TEXT !== 'undefined' && TEXT.ui) {
    const u = TEXT.ui, goc = { wave1Hint: u.wave1Hint, stoned: u.stoned, readyTap: u.readyTap };
    const ngan = { wave1Hint: '', stoned: 'STONE', readyTap: 'READY' };
    for (const k of Object.keys(goc)) Object.defineProperty(u, k, { configurable: true, get: () => BP.cho() ? goc[k] : ngan[k] });
  }
  if (typeof TVB !== 'undefined' && TVB.CHU) {
    const c = TVB.CHU, d0 = c.dung, f0 = c.fullLy;
    Object.defineProperty(c, 'dung', { configurable: true, get: () => BP.cho() ? d0 : 'PAUSED' });
    Object.defineProperty(c, 'fullLy', { configurable: true, get: () => BP.cho() ? f0 : '' });
  }
  // 5) Triệu hồi thiếu mana (bàn còn chỗ): nút lắc (hud2.js) + số mana chớp 1 lần
  document.addEventListener('click', (e) => {
    const nt = e.target.closest && e.target.closest('#nut-trieu'); if (!nt) return;
    const B = G.ban[0]; if (!B || G.ketThuc || nt.classList.contains('tn-day')) return;
    if (B.mana < B.gia && typeof oTrong === 'function' && oTrong(B).length > 0) BP.lan($('#mana-hop') || $('#mana'), 'bp-chop', 420);
  }, true);
  // 6) công tắc "BATTLE HINTS": Cài đặt (sảnh) + bảng Tạm dừng
  const nut = () => '<button class="hm-nut2 nut bp-nut" data-act="bp-goiy"></button>';
  if (typeof HM !== 'undefined' && HM.moCai) {
    const g = HM.moCai;
    HM.moCai = function () { const r = g.apply(this, arguments); const h = document.querySelector('#hm-tam .hm-cai2'); if (h && !h.querySelector('[data-act="bp-goiy"]')) h.insertAdjacentHTML('beforeend', nut()); BP.nhan(); return r; };
  }
  const bd = document.querySelector('#dung .bang-nut');
  if (bd && !bd.querySelector('[data-act="bp-goiy"]')) { const q = bd.querySelector('[data-act="bo"]'); const t = document.createElement('div'); t.innerHTML = '<button class="nut bp-nut" data-act="bp-goiy"></button>'; bd.insertBefore(t.firstChild, q); }
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('[data-act="bp-goiy"]'); if (!el) return;
    e.stopImmediatePropagation(); BP.dat(!BP.on()); try { SND.nut(); } catch (er) { }
  }, true);
  BP.nhan();
})();
window.BP = BP;
