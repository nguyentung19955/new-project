// TURRET MERGE — VFX P0 · SỐ THẬT & ĐỌC ĐƯỢC (docs/demo-hop-tuong/tuvan/vfx/REVIEW-VFX-93.txt mục IX P0/P1/P2, X 'PHASE P0')
//  Nguồn sự thật DUY NHẤT cho chữ: mọi con số hiển thị lấy từ chính hàm chơi (SKILLS.*, HOTRO.hd/tran, knThe) — không chép số tay.
//  1. Hỗ trợ: số buff hiển thị = số THẬT sau kẹp trần nhóm (HOTRO.tran, khi ụ này là nguồn duy nhất) (không thêm chữ — bản Việt dịch theo mẫu).
//  2. Ụ chỉ có tác dụng KHI GHÉP: ở 7★ không ghép được nữa → nói rõ kỹ năng ghép tắt (không hứa số bất khả thi).
//  3. Mốc sao (MOC_RIENG) sửa cho khớp code: Holy Halo, Crit Antenna, Radar 7★, Reaper, Laser 7★, Pandora, Hive Queen/Leviathan/Genesis/Wyrm…
//  4. Mô tả nhịp THẬT (đã gồm tốc bắn & mốc sao): Mine Layer, Marionette · tự phát: Cryo Reactor / Holy Halo / Chrono Throne.
//  5. Skill TỰ PHÁT (không do chạm): huy hiệu PNG 'tự phát' bật trên ụ 0.9 s (khác cảm giác chạm) — online tất định: chỉ là hình.
//  Không đổi sát thương / hồi chiêu / chọn mục tiêu (chỉ chữ + hình). Kiểm: tools/thap-kt-vfx-p0.js (trong thap-kt-hoiquy.js).
'use strict';
(function () {
  if (typeof SKILLS === 'undefined' || typeof HOTRO === 'undefined') return;
  const pc = (v) => Math.round(v * 100);

  // ---------- 1. số buff hiển thị = số thật sau trần ----------
  // id → [nhóm trần (HOTRO.tran), hàm giá trị THÔ dùng trong hoTro]
  const TRAN_HT = {
    radar: ['toc', (T) => SKILLS.radar.them(T)], chimang: ['crit', (T) => SKILLS.chimang.them(T)], tron: ['toc', (T) => SKILLS.tron.them(T)],
    nangsao: ['toc', (T) => SKILLS.nangsao.them(T), (T) => SKILLS.nangsao.tran(T)], phagiap: ['lo', (T) => SKILLS.phagiap.k(T)], bua: ['cdmg', (T) => SKILLS.bua.cd(T)],
    hasao: ['dmg', (T) => SKILLS.hasao.k(T)], dongbo: ['dmg', (T) => SKILLS.dongbo.v(T)], cauvong: ['vet', (T) => SKILLS.cauvong.k(T)],
    lophanung: ['lanh', (T) => SKILLS.lophanung.k(T)], tuthan: ['chet', (T) => SKILLS.tuthan.tile(T)], thaukinh: ['cdmg', (T) => SKILLS.thaukinh.k(T)],
    thanhdia: ['dmg', (T) => SKILLS.thanhdia.k(T)], luoicheo: ['dmg', (T) => SKILLS.luoicheo.them(T), (T) => SKILLS.luoicheo.tranR(T)], taylo: ['dmg', (T) => 0.09 * HOTRO.k(T)],
    guongcong: ['khang', (T) => SKILLS.guongcong.khang(T)], lanhgia: ['cham', (T) => SKILLS.lanhgia.cham(T)],
  };
  // phần tử thứ 3 (tuỳ chọn): trần RIÊNG của ụ (Star Lift 50% × thẻ, Resonance Grid +10% khi cộng hưởng) thay cho HOTRO.tran
  const tranCua = (T, id) => { const e = TRAN_HT[id]; return e[2] ? e[2](T) : HOTRO.tran(T, e[0]); };
  // giá trị hiệu dụng (0..1) — dùng cho chữ và cho kiểm
  const hieu = (T, id) => { const e = TRAN_HT[id]; if (!e) return null; const v = e[1](T); return { v, h: Math.min(v, tranCua(T, id)), k: e[0] }; };
  window.THATSO = { TRAN_HT, hieu, tranCua };
  // thay số thô đầu tiên ('52%' / '56.4%') bằng số hiệu dụng
  //  ghi = true (mô tả: thanh soi, Turret File): thêm ' (cap · LV raises it)' — trần nới theo cấp thẻ (KIEM.md 'Đã quyết' #2); nhãn SUP trên bàn: chỉ số (QUY-TAC 7)
  const GHI_TRAN = ' (cap · LV raises it)';
  function thay(s, v, h, ghi) {
    if (!(v > h + 1e-9) || typeof s !== 'string') return s;
    if (ghi) s = s.replace(' (crit-buff cap)', '').replace(' (damage cap)', '');
    const a = [pc(v) + '%', (v * 100).toFixed(1) + '%'];
    for (const t of a) { const i = s.indexOf(t); if (i >= 0) return s.slice(0, i) + (t.indexOf('.') > 0 ? (h * 100).toFixed(1) : pc(h)) + '%' + (ghi ? GHI_TRAN : '') + s.slice(i + t.length); }
    if (ghi && s.indexOf(GHI_TRAN) < 0) for (const t of [(h * 100).toFixed(1) + '%', pc(h) + '%']) { const i = s.indexOf(t); if (i >= 0) return s.slice(0, i + t.length) + GHI_TRAN + s.slice(i + t.length); } // mô tả đã tự kẹp (HOTRO.hd/tran): chỉ thêm ghi chú trần
    return s;
  }
  for (const id in TRAN_HT) {
    const sk = SKILLS[id]; if (!sk) continue;
    if (sk.mo) { const mo = sk.mo; sk.mo = function (T) { const s = mo.apply(this, arguments); try { const r = hieu(T, id); return r ? thay(s, r.v, r.h, true) : s; } catch (e) { return s; } }; }
    if (typeof SUP !== 'undefined' && SUP[id] && SUP[id].chu) { const chu = SUP[id].chu; SUP[id].chu = function (T) { const s = chu.apply(this, arguments); try { const r = hieu(T, id); return r ? thay(s, r.v, r.h) : s; } catch (e) { return s; } }; }
  }
  // Radar 7★ OVERDRIVE: +25% nằm TRONG trần tốc bắn → hiện phần thật được cộng
  if (SKILLS.radar) {
    const mo = SKILLS.radar.mo;
    SKILLS.radar.odThat = (T) => Math.max(0, Math.min(SKILLS.radar.them(T) + 0.25, HOTRO.tran(T, 'toc') + 0.15) - HOTRO.hd(T, 'toc', SKILLS.radar.them(T))); // OVERDRIVE: trần tốc +15% trong 2 s (hotro.js capOD)
    // thay CẢ cụm 'OVERDRIVE every 8s: +25% for 2s (up to the …)' của skills.js (trước: chỉ thay đầu cụm → 2 câu chồng nhau '+7% … : +25% …')
    SKILLS.radar.mo = function (T) { const s = mo.apply(this, arguments); return ms(T, 7) ? s.replace(/OVERDRIVE every 8s(: \+\d+% for 2s( \([^)]*\))?)?/, 'OVERDRIVE every 8s: +' + pc(SKILLS.radar.odThat(T)) + '% for 2s') : s; };
  }
  // Amplifier: trần riêng của cộng dồn đã ghi ngay trong câu kỹ năng (skills2.js 'total up to +X%, its own cap') — 07/11

  // ---------- 2. ụ chỉ tác dụng khi GHÉP: 7★ không ghép tiếp ----------
  const GHEP7 = ['nhanmana', 'drone', 'loa', 'nhanban', 'kepha', 'xaotron', 'sinhdoi', 'pandora', 'nhieusong', 'xuonganh', 'nguyenrua'];
  const CHU7 = 'Max 7★: it cannot merge again, so its merge skill no longer fires (it keeps shooting)';
  for (const id of GHEP7) {
    const sk = SKILLS[id]; if (!sk || !sk.mo) continue;
    const mo = sk.mo; sk.mo = function (T) { return T && T.sao >= LUAT.saoMax ? (sk.dmg ? CHU7 : CHU7.replace(' (it keeps shooting)', '')) : mo.apply(this, arguments); };
  }
  window.THATSO.GHEP7 = GHEP7;
  // Pandora: hiệu ứng theo SAO KẾT QUẢ của lần ghép (5★+5★ → 6★ quay 2 lấy tốt; 6★+6★ → 7★ mở 2 phép, 1 lần)
  if (SKILLS.pandora) {
    const mo = SKILLS.pandora.mo;
    SKILLS.pandora.mo = function (T) {
      if (T && T.sao >= LUAT.saoMax) return mo.apply(this, arguments);
      const goc = 'On merge: opens the vault — 1 of 6 (mana rain · freeze all · +1★ gift · 5 bombs · 5 shields · frenzy)';
      return goc + (T.sao >= 6 ? ' · merging two 6★ makes 7★: this opening fires 2 effects' : T.sao >= 5 ? ' · merging two 5★ makes 6★: rolls twice, keeps the better' : '');
    };
  }

  // ---------- 3. mốc sao khớp code ----------
  if (typeof MOC_RIENG !== 'undefined') {
    // chỉ SỬA mốc riêng đã có (thêm mốc riêng mới sẽ tắt mốc chung của ụ đó = đổi cân bằng) — mốc chung chỉ đổi CHỮ qua mocCua (DOI)
    const DOI = {};
    const M = (id, n, ten, mo) => { if (!SKILLS[id]) return; if (MOC_RIENG[id] && MOC_RIENG[id][n]) MOC_RIENG[id][n] = [ten, mo]; else (DOI[id] = DOI[id] || {})[n] = [ten, mo]; };
    M('haoquang', 3, 'STEADY HALO', 'Barrier +0.5s');
    M('haoquang', 7, 'BLESSING', 'Barrier +1s more + 30% speed');
    M('chimang', 3, 'SHARP EYE', 'More crit chance (curve ×1.45)');
    M('chimang', 5, 'DEADLY EYE', 'More crit chance (curve ×1.9) + 10% crit damage');
    M('chimang', 7, 'CERTAIN STRIKE', 'More crit chance (curve ×2.35) + every 6s a sure crit');
    M('radar', 7, 'OVERDRIVE', 'Aura ×2.35 + every 8s a 2s fire-rate burst (cap +15% during it)');
    M('tuthan', 5, 'DEEP REAP', 'Threshold 40% HP + more kill chance (curve ×1.9)');
    M('phagiap', 5, 'DOUBLE EXPOSE', 'Exposes 3 enemies + more bonus (curve ×1.9)');
    M('cauvong', 5, 'DOUBLE ARC', '2 trails + more bonus (curve ×1.9)');
    M('lophanung', 5, 'DEEP COLD', 'Bosses in the aura cast 25% slower; FREEZE lasts 4s (bosses 0.8s)');
    M('laser', 7, 'APEX', '+30% damage (the beam never crits)');
    M('pandora', 5, 'LUCKY SPIN', 'A merge that makes 6★ rolls twice, keeps the better');
    M('pandora', 7, 'OPEN VAULT', 'Merging two 6★ into 7★ fires 2 effects once (7★ cannot merge again)');
    M('nguyenrua', 7, 'DOOM HEX', '7★ cannot merge again: hex off (best hex = merging two 6★: +25%)');
    M('leviathan', 5, 'DEEP MAW', 'From 4★ (DEEP ONE form): devours big enemies (×3 stacks)');
    M('khoisinh', 5, 'BLOOM', 'From 4★ (BLOSSOM form): neighbours +15% damage');
    M('ronglua', 5, 'ARMORED DRAGON', 'New form: BLUE flame +30% vs big enemies and bosses, heart jet +200%');
    for (const id of GHEP7) if (SKILLS[id] && id !== 'pandora' && !(MOC_RIENG[id] && MOC_RIENG[id][7])) M(id, 7, 'APEX', '+30% damage, +10% crit on its shots · 7★ cannot merge again: merge skill off');
    if (typeof mocCua === 'function') {
      const mc = mocCua;
      mocCua = function (id) { const r = mc.apply(this, arguments), d = DOI[id]; if (d) for (const m of r) if (d[m.n] && !m.rieng) { m.ten = d[m.n][0]; m.mo = d[m.n][1]; } return r; };
    }
    window.THATSO.DOI = DOI;
  }

  // ---------- 4. nhịp thật / tự phát ----------
  const noi = (id, f) => { const sk = SKILLS[id]; if (!sk || !sk.mo) return; const mo = sk.mo; sk.mo = function (T) { const s = mo.apply(this, arguments); try { return f(T, s); } catch (e) { return s; } }; };
  noi('min', (T, s) => s.replace('every ' + (SKILLS.min.ky(T) / nhip3(T)).toFixed(1) + ' s', 'every ' + (SKILLS.min.ky(T) / nhip3(T) / nhipU(T)).toFixed(1) + 's (with fire-rate buffs)'));
  noi('marionette', (T, s) => s.replace('Every ' + SKILLS.marionette.ky(T) + 's', 'Every ' + +(SKILLS.marionette.ky(T) / Math.max(0.1, 1 + T.buf.toc)).toFixed(1) + 's'));
  noi('haoquang', (T, s) => s + ' · fires BY ITSELF when full and in danger (boss skill, a turret locked, or last heart)');
  noi('lophanung', (T, s) => s.replace('FREEZE nearby', 'FREEZE in ' + Math.round(SKILLS.lophanung.r(T) * 1.6) + ' px') + ' · fires BY ITSELF after 6s full if 5+ enemies are near or a boss is on your path');
  noi('ngaithoigian', (T, s) => T.sao >= 3 ? s + ' · fires BY ITSELF after 5s full if a boss or an enemy near the end is on your path' : s);
  noi('bang', (T, s) => s.replace('(bosses 0.6s)', '(bosses 0.6s; big enemies shorter)'));
  if (typeof ATK !== 'undefined' && ATK.luoicheo) ATK.luoicheo[2] = 'RESONANCE look: every 3rd shot of each diagonal turret shows a teal echo bolt (visual only, no extra damage)';

  // ---------- 5. skill TỰ PHÁT: huy hiệu PNG trên ụ ----------
  // Cryo / Holy Halo / Chrono Throne (chữ ghi điều kiện) + 4 ụ đỏ nạp chung napChuDong (skills5.js: để đầy quá 6 s thì tự dùng khi đáng — mốc 3★ ghi 'auto-fires if left full')
  const TU = ['lophanung', 'haoquang', 'ngaithoigian', 'chuato', 'leviathan', 'ronglua']; // Lõi Khởi Sinh: GENESIS tốn 30 mana → không tự phát (08/11)
  window.THATSO.TU = TU;
  for (const id of TU) {
    const sk = SKILLS[id]; if (!sk || !sk.capNhat || !sk.chuDong) continue;
    const cn = sk.capNhat, cd = sk.chuDong;
    sk.capNhat = function (G, B, T) { T._tuPhat = 1; try { return cn.apply(this, arguments); } finally { T._tuPhat = 0; } };
    sk.chuDong = function (G, B, T) { const tu = T._tuPhat, r = cd.apply(this, arguments); if (r && tu) { T.tuPhatG = G.t; T.tuPhatN = (T.tuPhatN || 0) + 1; } return r; };
  }
  // vẽ trong lớp huy hiệu (nhandien.js — sau đạn/hiệu ứng): góc TRÊN-TRÁI ô (huy hiệu sao ở trên-phải, tấm đếm ở đáy → không chồng)
  //  ảnh ChatGPT vfxp0_tudong (CAN-VE-p0.json, vòng mũi tên + tia sét); chưa nạp xong → ic_phat (nút phát PNG có sẵn). Nảy 0 → 1.2 → 1 trong 0.18 s, mờ 0.3 s cuối.
  const ANH_TU = () => (REN.img('vfxp0_tudong') ? 'vfxp0_tudong' : 'ic_phat'); // ảnh ChatGPT raw_vfxp0_tudong (CAN-VE-p0) — nạp sẵn lúc vào game
  if (typeof ND !== 'undefined' && ND.veHuyHieu) {
    const veHH = ND.veHuyHieu;
    ND.veHuyHieu = function (ctx, h) {
      veHH.apply(this, arguments);
      const T = h.T; if (!T || T.tuPhatG == null || h.hs <= 0.5) return;
      const u = (G.t - T.tuPhatG) / 0.9; if (u < 0 || u >= 1) return;
      const im = REN.img(ANH_TU()); if (!im) return;
      const p = Math.min(1, u / 0.2), s = p < 0.6 ? 1.2 * p / 0.6 : 1.2 - 0.2 * (p - 0.6) / 0.4, al = h.al * (u > 0.67 ? (1 - u) / 0.33 : 1);
      REN.anhGiua(ctx, im, h.gx, h.gy, h.d * 1.15 * s, 0, al);
      ctx.globalAlpha = 1;
    };
  }
  // ---------- 6. thanh soi ụ / bảng thông tin ụ hỗ trợ (buff.js hoTroTT): số 'hiện tại' = số THẬT sau trần (trước: số thô, vd Crit Antenna 7★ +30% trong khi trần 22%) ----------
  //  + nhãn đúng thứ được buff (Sanctum: sát thương, Mirror Gate: kháng khống chế, Cryo: hào quang làm chậm — trước: 'Shield' / 'Shots slow')
  const NHAN_HT = { thanhdia: 'Damage', guongcong: 'Control resist', lophanung: 'Aura slow' };
  const TRAN_TT = (T, id) => id === 'khuech' ? HOTRO.tran(T, 'amp') : (TRAN_HT[id] && id !== 'lophanung') ? tranCua(T, id) : Infinity; // Cryo: số ở đây là % làm chậm hào quang (trần làm chậm riêng, đã kẹp trong SKILLS.lophanung.cham)
  if (typeof hoTroTT === 'function') {
    const tt0 = hoTroTT;
    hoTroTT = function (T) {
      const h = tt0.apply(this, arguments); if (!h || !T) return h;
      try {
        const id = T.id, k = h.k, v = SUP_GIA[id](T), tran = TRAN_TT(T, id), ten = NHAN_HT[id] || BUFF[k].ten, pcs = (x) => (id === 'tuthan' ? (x * 100).toFixed(1) : Math.round(x * 100)) + '%';
        const hien = Math.min(v, tran);
        h.dong = ten + ' +' + pcs(hien) + ' (current)';
        if (v > tran + 1e-9) h.tach += ' · cap ' + pcs(tran) + ' (LV raises it)';
        h.that = hien; // cho kiểm
      } catch (e) { }
      return h;
    };
    window.THATSO.NHAN_HT = NHAN_HT;
  }

  // hàng CARD LV (trang ụ): ụ hỗ trợ có trần → 'cap 22% → 22.3%' (cấp thẻ nới trần — KIEM.md 'Đã quyết' #2); thẻ MAX: 'cap 26%'
  window.THATSO.capThe = (id, t) => {
    const e = id === 'khuech' ? ['amp'] : TRAN_HT[id], r = G.rosterMap && G.rosterMap[id]; if (!e || !r || id === 'lophanung' || !t) return '';
    const f = (k) => id === 'nangsao' ? 0.5 * (1 + HOTRO.capLvK(r.bac, k)) : HOTRO.tranGoc(r.bac, HOTRO.capLvK(r.bac, k), e[0]), v = (x) => +(x * 100).toFixed(1) + '%'; // Star Lift: trần riêng 50%
    if (!(f(t.k) < 1)) return ''; // 07/11: không trần (chỉ còn giới hạn tự nhiên: chậm 90%) — không hiện 'cap'
    return 'cap ' + v(f(t.k)) + (t.max ? '' : ' → ' + v(f(t.k + 1)));
  };

  // ---------- 7. POWER-UP trong trận (B.lv +1…MAX) cho 10 ụ KHÔNG gây sát thương — KIEM.md mục IX 'Đã quyết' #1 (kiểu DCDW) ----------
  //  mỗi bước nâng CHÍNH con số kỹ năng (KY_NANG_CAP[id].pu, data.js knThe) — Reaper Pillar: +6% độ mạnh + nới trần giết ngay +0.5%/bước (HOTRO.puChet).
  //  Chữ: Turret File (chuPU) + bảng thông tin / thanh soi trong trận (puDong) — số lấy từ chính hàm chơi.
  const PU_KN = ['bang', 'doc', 'bomhen', 'khien', 'hopbi', 'tuthan', 'tienhoa', 'haoquang', 'loren', 'khoisinh'];
  window.THATSO.PU_KN = PU_KN;
  window.THATSO.PU_KHONG = []; // (cũ) không còn ụ nào power-up vô tác dụng
  const knV = (e, v) => (v < 0 ? '−' : '+') + (e.dv === 's' ? +Math.abs(v).toFixed(2) : +Math.abs(v).toFixed(2)) + (e.dv || '');
  // 'Freeze +0.15s' / 'Recharge −0.5s' / 'kill-chance cap +0.5%' cho n bước
  window.THATSO.puBuoc = (id, n) => {
    if (id === 'tuthan') return 'kill chance +' + +(HOTRO.PU_CHET * 100 * n).toFixed(1) + '%';
    const e = KY_NANG_CAP[id]; return e && e.pu ? e.ten + ' ' + knV(e, e.pu * n) : '';
  };
  window.THATSO.chuPU = (id) => PU_KN.includes(id)
    ? 'Values at your card level, before power-ups and buffs. Each in-battle power-up: ' + THATSO.puBuoc(id, 1) + (id === 'tuthan' ? ' and +6% strength' : '') + ' (+1 → MAX, no damage). Tap a row to test it.'
    : (SKILLS[id] && !SKILLS[id].dmg) ? 'Values at your card level, before power-ups and buffs. In-battle power-ups make its skill stronger (+1 → MAX), not damage. Tap a row to test it.'
    : null;
  // dòng trong bảng thông tin trận (chỉ khi đã nâng): 'power-up +2: Freeze +0.3s'
  window.THATSO.puDong = (B, id) => { const n = PU_KN.includes(id) && id !== 'tuthan' ? knPU(B, id) : 0; return n > 0 ? 'power-up +' + n + ': ' + THATSO.puBuoc(id, n) : ''; };

  if (typeof REN !== 'undefined' && REN.CO_DINH) for (const t of ['vfxp0_tudong', 'ic_phat']) { REN.CO_DINH.add(t); try { REN.img(t); } catch (e) { } } // giữ + giải mã sẵn (không giải mã giữa trận)
})();
