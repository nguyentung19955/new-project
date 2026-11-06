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
    nangsao: ['toc', (T) => SKILLS.nangsao.them(T)], phagiap: ['lo', (T) => SKILLS.phagiap.k(T)], bua: ['cdmg', (T) => SKILLS.bua.cd(T)],
    hasao: ['dmg', (T) => SKILLS.hasao.k(T)], dongbo: ['dmg', (T) => SKILLS.dongbo.v(T)], cauvong: ['vet', (T) => SKILLS.cauvong.k(T)],
    lophanung: ['lanh', (T) => SKILLS.lophanung.k(T)], tuthan: ['chet', (T) => SKILLS.tuthan.tile(T)], thaukinh: ['cdmg', (T) => SKILLS.thaukinh.k(T)],
    thanhdia: ['dmg', (T) => SKILLS.thanhdia.k(T)], luoicheo: ['dmg', (T) => SKILLS.luoicheo.them(T)], taylo: ['dmg', (T) => 0.09 * HOTRO.k(T)],
    guongcong: ['khang', (T) => SKILLS.guongcong.khang(T)], lanhgia: ['cham', (T) => SKILLS.lanhgia.cham(T)],
  };
  // giá trị hiệu dụng (0..1) — dùng cho chữ và cho kiểm
  const hieu = (T, id) => { const e = TRAN_HT[id]; if (!e) return null; const v = e[1](T); return { v, h: HOTRO.hd(T, e[0], v), k: e[0] }; };
  window.THATSO = { TRAN_HT, hieu };
  // thay số thô đầu tiên ('52%' / '56.4%') bằng số hiệu dụng
  function thay(s, v, h) {
    if (!(v > h + 1e-9) || typeof s !== 'string') return s;
    const a = [pc(v) + '%', (v * 100).toFixed(1) + '%'];
    for (const t of a) { const i = s.indexOf(t); if (i >= 0) return s.slice(0, i) + (t.indexOf('.') > 0 ? (h * 100).toFixed(1) : pc(h)) + '%' + s.slice(i + t.length); }
    return s;
  }
  for (const id in TRAN_HT) {
    const sk = SKILLS[id]; if (!sk) continue;
    if (sk.mo) { const mo = sk.mo; sk.mo = function (T) { const s = mo.apply(this, arguments); try { const r = hieu(T, id); return r ? thay(s, r.v, r.h) : s; } catch (e) { return s; } }; }
    if (typeof SUP !== 'undefined' && SUP[id] && SUP[id].chu) { const chu = SUP[id].chu; SUP[id].chu = function (T) { const s = chu.apply(this, arguments); try { const r = hieu(T, id); return r ? thay(s, r.v, r.h) : s; } catch (e) { return s; } }; }
  }
  // Radar 7★ OVERDRIVE: +25% nằm TRONG trần tốc bắn → hiện phần thật được cộng
  if (SKILLS.radar) {
    const mo = SKILLS.radar.mo;
    SKILLS.radar.odThat = (T) => Math.max(0, HOTRO.hd(T, 'toc', SKILLS.radar.them(T) + 0.25) - HOTRO.hd(T, 'toc', SKILLS.radar.them(T)));
    SKILLS.radar.mo = function (T) { const s = mo.apply(this, arguments); return ms(T, 7) ? s.replace('OVERDRIVE every 8s', 'OVERDRIVE every 8s: +' + pc(SKILLS.radar.odThat(T)) + '% for 2s (fire-rate cap ' + pc(HOTRO.tran(T, 'toc')) + '%)') : s; };
  }
  // Amplifier: tổng cộng dồn chung trần sát thương
  if (SKILLS.khuech) { const mo = SKILLS.khuech.mo; SKILLS.khuech.mo = function (T) { return mo.apply(this, arguments) + ' · all stacks together max +' + pc(HOTRO.tran(T, 'amp')) + '%'; }; }

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
    M('chimang', 5, 'DEADLY EYE', 'Crit chance reaches the 22% cap + 10% crit damage');
    M('chimang', 7, 'CERTAIN STRIKE', 'Every 6s a sure crit (crit chance stays at the cap)');
    M('radar', 7, 'OVERDRIVE', 'Aura ×2.35 + every 8s a 2s fire-rate burst (inside the fire-rate cap)');
    M('tuthan', 5, 'DEEP REAP', 'Threshold 40% HP (kill chance is already at its cap)');
    M('phagiap', 5, 'DOUBLE EXPOSE', 'Exposes 3 enemies (bonus is already at the 35% cap)');
    M('cauvong', 5, 'DOUBLE ARC', '2 trails (bonus reaches the 52% cap)');
    M('lophanung', 5, 'DEEP COLD', 'Bosses in the aura cast 25% slower; FREEZE lasts 4s (bosses 0.8s)');
    M('laser', 7, 'APEX', '+30% damage (the beam never crits)');
    M('pandora', 5, 'LUCKY SPIN', 'A merge that makes 6★ rolls twice, keeps the better');
    M('pandora', 7, 'OPEN VAULT', 'Merging two 6★ into 7★ fires 2 effects once (7★ cannot merge again)');
    M('nguyenrua', 7, 'DOOM HEX', '7★ cannot merge again: hex off (best hex = merging two 6★: +25%)');
    M('chuato', 5, 'QUICK BROOD', 'Every ★ adds a drone and hatches faster; from 4★ drones perch (+10% fire rate to neighbours)');
    M('leviathan', 5, 'DEEP MAW', 'From 4★ (DEEP ONE form): devours big enemies (×3 stacks)');
    M('khoisinh', 5, 'BLOOM', 'From 4★ (BLOSSOM form): neighbours +15% damage');
    M('ronglua', 5, 'BLUE FLAME', 'From 4★ (BLUE WYRM form): +30% vs big enemies and bosses');
    for (const id of GHEP7) if (SKILLS[id] && id !== 'pandora' && !(MOC_RIENG[id] && MOC_RIENG[id][7])) M(id, 7, 'APEX', '+30% damage, +10% crit on its shots · 7★ cannot merge again: merge skill off');
    if (typeof mocCua === 'function') {
      const mc = mocCua;
      mocCua = function (id) { const r = mc.apply(this, arguments), d = DOI[id]; if (d) for (const m of r) if (d[m.n] && !m.rieng) { m.ten = d[m.n][0]; m.mo = d[m.n][1]; } return r; };
    }
    window.THATSO.DOI = DOI;
  }

  // ---------- 4. nhịp thật / tự phát ----------
  const noi = (id, f) => { const sk = SKILLS[id]; if (!sk || !sk.mo) return; const mo = sk.mo; sk.mo = function (T) { const s = mo.apply(this, arguments); try { return f(T, s); } catch (e) { return s; } }; };
  noi('min', (T, s) => s.replace('every ' + SKILLS.min.ky(T).toFixed(1) + ' s', 'every ' + (SKILLS.min.ky(T) / nhipU(T)).toFixed(1) + 's (with fire-rate buffs)'));
  noi('marionette', (T, s) => s.replace('Every ' + SKILLS.marionette.ky(T) + 's', 'Every ' + +(SKILLS.marionette.ky(T) / Math.max(0.1, 1 + T.buf.toc)).toFixed(1) + 's'));
  noi('haoquang', (T, s) => s + ' · fires BY ITSELF when full and in danger (boss skill, a turret locked, or last heart)');
  noi('lophanung', (T, s) => s.replace('FREEZE nearby', 'FREEZE in ' + Math.round(SKILLS.lophanung.r(T) * 1.6) + ' px') + ' · fires BY ITSELF after 6s full if 5+ enemies are near or a boss is on your path');
  noi('ngaithoigian', (T, s) => T.sao >= 3 ? s + ' · fires BY ITSELF after 5s full if a boss or an enemy near the end is on your path' : s);
  noi('bang', (T, s) => s.replace('(bosses 0.6s)', '(bosses 0.6s; big enemies shorter)'));
  if (typeof ATK !== 'undefined' && ATK.luoicheo) ATK.luoicheo[2] = 'RESONANCE look: every 3rd shot of each diagonal turret shows a teal echo bolt (visual only, no extra damage)';

  // ---------- 5. skill TỰ PHÁT: huy hiệu PNG trên ụ ----------
  const TU = ['lophanung', 'haoquang', 'ngaithoigian'];
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
  if (typeof REN !== 'undefined' && REN.CO_DINH) for (const t of ['vfxp0_tudong', 'ic_phat']) { REN.CO_DINH.add(t); try { REN.img(t); } catch (e) { } } // giữ + giải mã sẵn (không giải mã giữa trận)
})();
