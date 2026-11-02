'use strict';
/* hop-thoai.js – HỆ THỐNG HỘP THOẠI DÙNG CHUNG (làng + mọi vùng gọi được). Phiên cottruyen.
   LUẬT HÌNH: khung hộp thoại và chân dung CHỈ là ảnh do ChatGPT vẽ (docs/yeu-cau-anh/cottruyen/).
   Chưa có đủ ảnh → HopThoai.sanSang(id) = false và HopThoai.bat() KHÔNG mở gì (tính năng tắt), không vẽ tạm bằng code.
   Chữ được in bằng font (không phải hình vẽ).

   Dữ liệu một đoạn thoại (game/cot-truyen/hoi-thoai/<id>.json):
   { "id": "...", "khung": "art/cot-truyen/hop-thoai/khung.png",
     "nguoi": { "ba_ngan": {"ten": "Vesper", "chan_dung": "art/cot-truyen/chan-dung/ba-ngan-noi.png"} },
     "dong": [ {"ai": "ba_ngan", "chu": "…", "dat_co": "ten_co"?, "chon": [{"chu": "…", "toi": 5}]?, "toi": 3?, "het": true?} ] }
   - "toi": nhảy tới chỉ số dòng; "het": kết thúc; "chon": lựa chọn (bấm lên/xuống + xác nhận), mỗi lựa chọn {chu, toi?, dat_co?, gt?};
     lựa chọn không có "toi" = kết thúc; hàm xong(gt) nhận gt (hoặc chỉ số) của lựa chọn cuối.

   Dùng trong vòng lặp game:
     await HopThoai.nap('../cot-truyen/hoi-thoai/', 'mo-dau-ba-ngan', '../../');
     if (HopThoai.sanSang('mo-dau-ba-ngan')) HopThoai.bat('mo-dau-ba-ngan', () => {...});
     mỗi khung: HopThoai.capNhat(dt, {xac_nhan, len, xuong});  HopThoai.ve(ctx, W, H);
     HopThoai.dangMo() → true thì game nên dừng điều khiển nhân vật. */
(function(goc){
  const DS = {}, ANH = {}, TOC_CHU = 40;   // ký tự / giây (gõ dần)
  let mo = null;                            // {d, i, n, t, chon, xong}
  // Bố cục khung.png (ChatGPT vẽ 02/11), tính theo tỉ lệ ảnh [x, y, rộng, cao]: ô chân dung trái + vùng chữ phải
  const O_KHUNG = {chan_dung:[0.037, 0.155, 0.152, 0.645], chu:[0.228, 0.12, 0.74, 0.74]};

  function napAnh(url){
    if (ANH[url] !== undefined) return Promise.resolve(ANH[url]);
    if (typeof Image === 'undefined') return Promise.resolve(ANH[url] = null);
    return new Promise(r => { const im = new Image(); im.onload = () => r(ANH[url] = im); im.onerror = () => r(ANH[url] = null); im.src = url; });
  }
  const dsAnh = d => [d.khung].concat(Object.values(d.nguoi || {}).map(n => n.chan_dung)).filter(Boolean);

  const HT = {
    /* nạp một đoạn thoại + ảnh của nó. thuMuc: thư mục json; gocArt: tiền tố tới thư mục gốc dự án (chứa art/) */
    async nap(thuMuc, id, gocArt){
      try {
        const r = await fetch(thuMuc + id + '.json', {cache:'no-store'}); if (!r.ok) return false;
        const d = await r.json(); d._goc = gocArt || '';
        await Promise.all(dsAnh(d).map(u => napAnh(d._goc + u)));
        DS[d.id || id] = d; return true;
      } catch (e){ return false; }
    },
    them(d, gocArt){ d._goc = gocArt || ''; DS[d.id] = d; return Promise.all(dsAnh(d).map(u => napAnh(d._goc + u))); },
    /* đủ ảnh (khung + mọi chân dung) mới coi là sẵn sàng */
    sanSang(id){ const d = DS[id]; return !!d && !!d.khung && dsAnh(d).every(u => ANH[d._goc + u]); },
    thieuAnh(id){ const d = DS[id]; return d ? dsAnh(d).filter(u => !ANH[d._goc + u]) : ['(not loaded ' + id + ')']; },
    bat(id, xong){
      if (!HT.sanSang(id)) return false;           // chưa có ảnh → tắt
      mo = {d: DS[id], i: 0, n: 0, t: 0, chon: 0, xong}; return true;
    },
    dangMo: () => !!mo,
    dongHienTai: () => mo ? mo.d.dong[mo.i] : null,
    capNhat(dt, phim){
      if (!mo) return;
      const dg = mo.d.dong[mo.i], cu = dg.chu.length;
      mo.t += dt; mo.n = Math.min(cu, Math.floor(mo.t * TOC_CHU));
      phim = phim || {};
      if (dg.chon && mo.n >= cu){
        if (phim.len) mo.chon = (mo.chon + dg.chon.length - 1) % dg.chon.length;
        if (phim.xuong) mo.chon = (mo.chon + 1) % dg.chon.length;
      }
      if (!phim.xac_nhan) return;
      if (mo.n < cu){ mo.n = cu; mo.t = cu / TOC_CHU; return; }   // bấm lần đầu: hiện hết chữ
      if (dg.dat_co && goc.LuuChung) goc.LuuChung.datCo(dg.dat_co);
      const ch = dg.chon ? dg.chon[mo.chon] : null;   // lựa chọn: có thể đặt cờ riêng; không ghi 'toi' = kết thúc
      if (ch && ch.dat_co && goc.LuuChung) goc.LuuChung.datCo(ch.dat_co);
      if (ch) mo.daChon = ch.gt !== undefined ? ch.gt : mo.chon;
      let toi = dg.het ? -1 : (ch ? (ch.toi !== undefined ? ch.toi : -1) : (dg.toi !== undefined ? dg.toi : mo.i + 1));
      if (toi < 0 || toi >= mo.d.dong.length){
        const x = mo; mo = null;
        if (goc.LuuChung) goc.LuuChung.xemXong(x.d.id);
        if (x.xong) x.xong(x.daChon); return;
      }
      mo.i = toi; mo.n = 0; mo.t = 0; mo.chon = 0;
    },
    /* vẽ: chỉ ảnh ChatGPT + chữ. Bố cục: khung đáy màn hình rộng 90%, chân dung bên trái trong khung. */
    ve(ctx, W, H){
      if (!mo) return;
      const d = mo.d, dg = d.dong[mo.i], nv = (d.nguoi || {})[dg.ai] || {}, kh = ANH[d._goc + d.khung];
      const w = Math.round(W * 0.9), h = Math.round(w * kh.height / kh.width), x = (W - w) >> 1, y = H - h - Math.round(H * 0.03);
      const O = d.o_khung || O_KHUNG, r = q => [x + q[0] * w, y + q[1] * h, q[2] * w, q[3] * h];
      ctx.save(); ctx.imageSmoothingEnabled = true;
      ctx.drawImage(kh, x, y, w, h);
      const cd = nv.chan_dung && ANH[d._goc + nv.chan_dung];
      let [tx, ty, tw] = r(O.chu);
      if (cd){   // chân dung: dải nv.so_khung ô vuông (0 = yên, 1.. = nói, đổi ~160 ms khi chữ đang chạy)
        const n = nv.so_khung || 1, cw = cd.width / n, dangNoi = mo.n < dg.chu.length;
        const k = n > 1 && dangNoi ? 1 + (Math.floor(mo.t / 0.16) % (n - 1)) : 0;
        const [px, py, pw, ph] = r(O.chan_dung), s = Math.min(pw / cw, ph / cd.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(cd, k * cw, 0, cw, cd.height, Math.round(px + (pw - cw * s) / 2), Math.round(py + ph - cd.height * s), Math.round(cw * s), Math.round(cd.height * s));
      }   // không chân dung (vd menu chuông): ô chân dung của khung để trống, chữ vẫn ở vùng chữ (không đè hoạ tiết khung)
      const fs = Math.max(13, Math.round(H * 0.036)), PH = '"Alegreya Sans",system-ui,sans-serif';
      ctx.textBaseline = 'top'; ctx.fillStyle = '#E1B85A'; ctx.font = '700 ' + Math.round(fs * 1.15) + 'px "Cormorant Garamond",' + PH;
      if (nv.ten) ctx.fillText(nv.ten, tx, ty);
      ctx.fillStyle = '#F3E6C8'; ctx.font = '500 ' + fs + 'px ' + PH;
      let dongY = ty + fs * 1.6;
      for (const ln of boDong(ctx, dg.chu.slice(0, mo.n), tw)){ ctx.fillText(ln, tx, dongY); dongY += fs * 1.3; }
      if (dg.chon && mo.n >= dg.chu.length){
        dg.chon.forEach((c, k) => { ctx.fillStyle = k === mo.chon ? '#ffe08a' : '#c9b48a'; ctx.fillText((k === mo.chon ? '› ' : '  ') + c.chu, tx, dongY); dongY += fs * 1.3; });
      }
      ctx.restore();
    },
    _DS: DS
  };
  function boDong(ctx, s, maxW){
    const ra = []; let cur = '';
    for (const tu of s.split(' ')){ const thu = cur ? cur + ' ' + tu : tu; if (ctx.measureText(thu).width > maxW && cur){ ra.push(cur); cur = tu; } else cur = thu; }
    if (cur) ra.push(cur); return ra;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = HT; else goc.HopThoai = HT;
})(typeof window !== 'undefined' ? window : globalThis);
