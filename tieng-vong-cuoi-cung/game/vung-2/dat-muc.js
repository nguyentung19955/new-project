/* dat-muc.js – LOGIC địa hình Vùng 2 "Rotting Roots" (không vẽ gì – hình do ảnh ChatGPT, yêu cầu docs/yeu-cau-anh/vung/008–016, 032–033).
 * Luật đúng theo kế hoạch ChatGPT docs/vung-2/ke-hoach-chatgpt.txt mục 3 (Gỗ Mục) và mục 6 (Root Anchor). Mọi thời gian tính bằng KHUNG 60 Hz.
 *  Ô lưới: R = Gỗ Mục thường · Q = Gỗ Mục nhanh · P = Gỗ Mục xung · L = chốt rễ · C = cổng rễ đan (xem DINH-DANG-PHONG-VUNG-2.md)
 *  Trạng thái ô mục: CHAC (SOLID) → CANH_BAO (WARNING) → ROI (FALLING) → MAT (GONE) → MOC (REFORMING) → CHAC
 * Dùng:  const dm = DatMuc.tao(phong, {troGiup:false});
 *        mỗi khung: dm.buoc({chan:[[c,r],…] (ô mà CHÂN đang đứng lên mặt trên), hop:{x,y,w,h} (hộp người chơi, px logic)});
 *        va chạm: dm.dac(c, r) → true/false (thay cho kiểm '#' của engine với các ô R/Q/P/L/C)
 *        Neo Rễ: dm.datNeo({x, y, huong}) → {ok, ly_do, neo}; dm.neo (đang hoạt động) ; dm.hoiChieu (khung còn lại)
 *        sự kiện (cho âm thanh / hiệu ứng): dm.suKien = [{loai:'nut'|'cot_ket'|'bui'|'roi'|'moc'|'xung_bao_tu'|'neo_dat'|'neo_het'|…, c, r}]
 */
(function (goc) {
  'use strict';
  const LUAT = {
    R: {canh_bao: 120, roi: 12, roi_con_va_cham: 4, mat: 180, moc: 18, nut: [0, 40, 80], cot_ket: [0, 80], bui: 105},
    Q: {canh_bao: 72, roi: 12, roi_con_va_cham: 4, mat: 210, moc: 18, nut: [0, 24, 48], cot_ket: [0, 36], bui: 60},
    P: {canh_bao: 120, roi: 12, roi_con_va_cham: 4, mat: 180, moc: 18, nut: [0, 40, 80], cot_ket: [0, 80], bui: 105}
  };
  const XUNG = {chu_ky: 240, ngu: 150, xung: 30, hoi: 60, nhay_truoc: 30, tang_toc: 30};
  const NEO = {thoi_gian: 180, hoi_chieu: 360, tam_px: 144, toi_da_o: 4};
  const HOAN_MOC_TOI_DA = 180;   // (ghi chú) mốc hoãn ChatGPT – sau mốc này ô vẫn mở cho tới khi người chơi ra khỏi
  const T = 48;

  function tao(phong, tuy) {
    tuy = tuy || {};
    const L = phong.luoi.map(r => r.split(''));
    const R = L.length, C = L[0].length;
    const o = new Map();       // "c,r" -> ô mục
    const cum = [];            // cụm mục liền nhau cùng hàng cùng loại (chung đồng hồ chạm đầu tiên)
    for (let r = 0; r < R; r++) {
      let c = 0;
      while (c < C) {
        const ch = L[r][c];
        if (LUAT[ch]) {
          const k = {loai: ch, o: [], tt: 'CHAC', t: 0, dongBang: false, xungDaTang: false};
          while (c < C && L[r][c] === ch) {
            const x = {c, r, cum: k};
            k.o.push(x); o.set(c + ',' + r, x); c++;
          }
          cum.push(k);
        } else c++;
      }
    }
    const luat = loai => {
      const l = Object.assign({}, LUAT[loai]);
      if (tuy.troGiup) l.canh_bao = loai === 'Q' ? 108 : 180;   // trợ giúp: cảnh báo dài hơn (ChatGPT mục 6)
      return l;
    };
    const chot = new Map();    // chốt rễ L: "c,r" -> {mo: số khung còn giữ mở}
    const cong = new Map();    // cổng C: "c,r" -> {id, mo}
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (L[r][c] === 'L') chot.set(c + ',' + r, {c, r, mo: 0});
    }
    for (const g of (phong.cong || [])) for (const [c, r] of g.o) cong.set(c + ',' + r, {id: g.id, mo: false, mo_tu: g.mo_tu});
    const nutNeo = (phong.neo || []).map(n => Object.assign({}, n));

    const dm = {
      khung: 0, neo: null, hoiChieu: 0, suKien: [], cum, nutNeo,
      dac(c, r) {
        const k = c + ',' + r;
        const x = o.get(k);
        if (x) {
          const s = x.cum;
          if (s.tt === 'MAT' || s.tt === 'MOC') return false;
          if (s.tt === 'ROI') return s.t < luat(s.loai).roi_con_va_cham;
          return true;
        }
        if (chot.has(k)) return chot.get(k).mo <= 0;
        if (cong.has(k)) return !cong.get(k).mo;
        return null;            // không phải ô của mô-đun này
      },
      trangThai(c, r) {         // cho phần vẽ (khi có ảnh): {tt, buoc_nut 0..3, nap (xung), dongBang}
        const x = o.get(c + ',' + r);
        if (!x) return null;
        const s = x.cum, l = luat(s.loai);
        let nut = 0;
        if (s.tt === 'CANH_BAO') nut = l.nut.filter(f => s.t >= f).length;   // 1..3 vết nứt
        return {tt: s.tt, loai: s.loai, buoc_nut: Math.min(3, nut), dongBang: s.dongBang, nap: s.loai === 'P' && dm.phaXung() !== 'NGU'};
      },
      phaXung() {
        const t = dm.khung % XUNG.chu_ky;
        if (t < XUNG.ngu - XUNG.nhay_truoc) return 'NGU';
        if (t < XUNG.ngu) return 'NHAY';          // 30 khung chớp hổ phách báo trước
        if (t < XUNG.ngu + XUNG.xung) return 'XUNG';
        return 'HOI';
      },
      buoc(vao) {
        dm.suKien.length = 0;
        dm.khung++;
        const chan = (vao && vao.chan) || [];
        // 1) chạm chân lên mặt trên → bắt đầu cảnh báo cả cụm (rời chân không đặt lại đồng hồ)
        for (const [c, r] of chan) {
          const x = o.get(c + ',' + r);
          if (x && x.cum.tt === 'CHAC') batDau(x.cum);
        }
        // 2) xung bào tử: mỗi chu kỳ tăng tốc 30 khung cho cụm P đã kích hoạt (1 lần / chu kỳ)
        const pha = dm.phaXung();
        if (pha === 'XUNG' && dm.khung % XUNG.chu_ky === XUNG.ngu) {
          for (const s of cum) if (s.loai === 'P') {
            dm.suKien.push({loai: 'xung_bao_tu', c: s.o[0].c, r: s.o[0].r});
            if (s.tt === 'CANH_BAO' && !s.dongBang && !s.xungDaTang) { s.t += XUNG.tang_toc; s.xungDaTang = true; }
          }
        }
        if (pha === 'HOI') for (const s of cum) s.xungDaTang = false;
        // 3) Neo Rễ
        if (dm.neo) {
          dm.neo.con--;
          if (dm.neo.con <= 0) {
            for (const s of dm.neo.cum) s.dongBang = false;
            for (const k of dm.neo.chot) k.mo = 0;
            dm.suKien.push({loai: 'neo_het', c: dm.neo.nut.cot, r: dm.neo.nut.hang});
            dm.neo = null;
          } else for (const k of dm.neo.chot) k.mo = dm.neo.con;
        }
        if (dm.hoiChieu > 0) dm.hoiChieu--;
        // 4) tiến trạng thái từng cụm
        for (const s of cum) tien(s, vao && vao.hop);
      },
      datNeo(nguoi) {
        if (dm.neo) return {ok: false, ly_do: 'dang_co_neo'};
        if (dm.hoiChieu > 0) return {ok: false, ly_do: 'hoi_chieu'};
        const nut = chonNut(nguoi);
        if (!nut) return {ok: false, ly_do: 'khong_co_nut'};      // nút xám, KHÔNG tốn hồi chiêu
        const cumNeo = [], chotNeo = [];
        for (const [c, r] of nut.cum) {
          const x = o.get(c + ',' + r);
          if (x && !cumNeo.includes(x.cum)) cumNeo.push(x.cum);
          const k = chot.get(c + ',' + r);
          if (k) chotNeo.push(k);
        }
        // chỉ đóng băng cụm đang CẢNH BÁO (không cứu được ô đang rơi / đã mất); cụm còn CHẮC thì giữ chắc suốt thời gian neo
        for (const s of cumNeo) if (s.tt === 'CANH_BAO' || s.tt === 'CHAC') s.dongBang = true;
        for (const k of chotNeo) k.mo = NEO.thoi_gian;
        dm.neo = {nut, con: NEO.thoi_gian, cum: cumNeo, chot: chotNeo};
        dm.hoiChieu = NEO.hoi_chieu;
        dm.suKien.push({loai: 'neo_dat', c: nut.cot, r: nut.hang});
        return {ok: true, neo: dm.neo};
      },
      coNutGan(nguoi) { return !!chonNut(nguoi); },     // để làm xám nút kỹ năng
      moCong(id, phia) {
        let mo = false;
        for (const g of cong.values()) if (g.id === id && (!phia || g.mo_tu === phia)) { g.mo = true; mo = true; }
        return mo;
      },
      congDaMo(id) { for (const g of cong.values()) if (g.id === id) return g.mo; return false; },
      datLai(congDaMo) {         // hồi sinh ở Chuông Lưu / vào lại phòng: đặt lại mục; cổng lối tắt đã mở thì giữ mở
        for (const s of cum) { s.tt = 'CHAC'; s.t = 0; s.dongBang = false; s.xungDaTang = false; }
        for (const k of chot.values()) k.mo = 0;
        dm.neo = null; dm.hoiChieu = 0;
        for (const g of cong.values()) g.mo = !!(congDaMo && congDaMo.includes(g.id));
      }
    };

    function batDau(s) {
      s.tt = 'CANH_BAO'; s.t = 0; s.vuaVao = true;   // khung chạm = khung cảnh báo 0
      for (const x of s.o) dm.suKien.push({loai: 'nut', buoc: 1, c: x.c, r: x.r});
    }
    function chongNguoi(s, hop) {
      if (!hop) return false;
      for (const x of s.o) {
        const ox = x.c * T, oy = x.r * T;
        if (hop.x < ox + T && hop.x + hop.w > ox && hop.y < oy + T && hop.y + hop.h > oy) return true;
      }
      return false;
    }
    function tien(s, hop) {
      const l = luat(s.loai);
      const ev = (loai, them) => { for (const x of s.o) dm.suKien.push(Object.assign({loai, c: x.c, r: x.r}, them || {})); };
      switch (s.tt) {
        case 'CHAC': return;
        case 'CANH_BAO':
          if (s.vuaVao) { s.vuaVao = false; return; }
          if (s.dongBang) return;                              // Neo Rễ giữ nguyên số khung còn lại
          s.t++;
          if (l.nut.includes(s.t)) ev('nut', {buoc: l.nut.indexOf(s.t) + 1});
          if (l.cot_ket.includes(s.t)) ev('cot_ket');
          if (s.t === l.bui) ev('bui');
          if (s.t >= l.canh_bao) { s.tt = 'ROI'; s.t = 0; ev('roi'); }
          return;
        case 'ROI':
          s.t++;
          if (s.t >= l.roi) { s.tt = 'MAT'; s.t = 0; }
          return;
        case 'MAT':
          s.t++;
          if (s.t >= l.mat) { s.tt = 'MOC'; s.t = 0; s.hoan = 0; ev('moc'); }
          return;
        case 'MOC':
          if (s.t + 2 >= l.moc && chongNguoi(s, hop)) {      // người đứng trong chỗ mọc: hoãn (tối đa 180 khung), sau đó chờ người ra hẳn
            s.hoan = (s.hoan || 0) + 1;   // quá HOAN_MOC_TOI_DA: vẫn không va chạm, chờ người ra hẳn rồi mới chắc lại
            return;
          }
          s.t++;
          if (s.t >= l.moc - 1) { s.tt = 'CHAC'; s.t = 0; s.hoan = 0; }   // va chạm trở lại ở khung mọc CUỐI
          return;
      }
    }
    function thayDuoc(x0, y0, x1, y1) {     // đường ngắm: không xuyên ô '#'
      const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 8);
      for (let i = 1; i < n; i++) {
        const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
        const c = Math.floor(x / T), r = Math.floor(y / T);
        if (r >= 0 && r < R && c >= 0 && c < C && L[r][c] === '#') return false;
      }
      return true;
    }
    function chonNut(nguoi) {
      let tot = null, best = 1e9;
      for (const n of nutNeo) {
        const nx = n.cot * T + T / 2, ny = n.hang * T + T / 2;
        const dx = nx - nguoi.x, dy = ny - nguoi.y, d = Math.hypot(dx, dy);
        if (d > NEO.tam_px) continue;
        if (nguoi.huong && Math.sign(dx) !== 0 && Math.sign(dx) !== Math.sign(nguoi.huong) && Math.abs(dx) > T / 2) continue;   // phải ở phía đang nhìn
        if (!thayDuoc(nguoi.x, nguoi.y, nx, ny)) continue;
        if (d < best) { best = d; tot = n; }
      }
      return tot;
    }
    return dm;
  }

  const DatMuc = {tao, LUAT, XUNG, NEO};
  if (typeof module !== 'undefined' && module.exports) module.exports = DatMuc;
  else goc.DatMuc = DatMuc;
})(typeof window !== 'undefined' ? window : globalThis);
