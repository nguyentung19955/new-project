'use strict';
/* hop-thoai.js – HỆ THỐNG HỘP THOẠI DÙNG CHUNG (làng + mọi vùng gọi được). Phiên cottruyen.
   LUẬT HÌNH: khung hộp thoại và chân dung CHỈ là ảnh do ChatGPT vẽ (docs/yeu-cau-anh/cottruyen/).
   Chưa có đủ ảnh → HopThoai.sanSang(id) = false và HopThoai.bat() KHÔNG mở gì (tính năng tắt), không vẽ tạm bằng code.
   Chữ được in bằng font (không phải hình vẽ).

   Dữ liệu một đoạn thoại (game/cot-truyen/hoi-thoai/<id>.json):
   { "id": "...", "khung": "art/cot-truyen/hop-thoai/khung.png",
     "nguoi": { "ba_ngan": {"ten": "Bà Ngân", "chan_dung": "art/cot-truyen/chan-dung/ba-ngan-noi.png"} },
     "dong": [ {"ai": "ba_ngan", "chu": "…", "dat_co": "ten_co"?, "chon": [{"chu": "…", "toi": 5}]?, "toi": 3?, "het": true?} ] }
   - "toi": nhảy tới chỉ số dòng; "het": kết thúc; "chon": lựa chọn (bấm lên/xuống + xác nhận).

   Dùng trong vòng lặp game:
     await HopThoai.nap('../cot-truyen/hoi-thoai/', 'mo-dau-ba-ngan', '../../');
     if (HopThoai.sanSang('mo-dau-ba-ngan')) HopThoai.bat('mo-dau-ba-ngan', () => {...});
     mỗi khung: HopThoai.capNhat(dt, {xac_nhan, len, xuong});  HopThoai.ve(ctx, W, H);
     HopThoai.dangMo() → true thì game nên dừng điều khiển nhân vật. */
(function(goc){
  const DS = {}, ANH = {}, TOC_CHU = 40;   // ký tự / giây (gõ dần)
  let mo = null;                            // {d, i, n, t, chon, xong}

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
    thieuAnh(id){ const d = DS[id]; return d ? dsAnh(d).filter(u => !ANH[d._goc + u]) : ['(chưa nạp ' + id + ')']; },
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
      let toi = dg.het ? -1 : (dg.chon ? dg.chon[mo.chon].toi : (dg.toi !== undefined ? dg.toi : mo.i + 1));
      if (toi < 0 || toi >= mo.d.dong.length){
        const x = mo; mo = null;
        if (goc.LuuChung) goc.LuuChung.xemXong(x.d.id);
        if (x.xong) x.xong(); return;
      }
      mo.i = toi; mo.n = 0; mo.t = 0; mo.chon = 0;
    },
    /* vẽ: chỉ ảnh ChatGPT + chữ. Bố cục: khung đáy màn hình rộng 90%, chân dung bên trái trong khung. */
    ve(ctx, W, H){
      if (!mo) return;
      const d = mo.d, dg = d.dong[mo.i], nv = (d.nguoi || {})[dg.ai] || {}, kh = ANH[d._goc + d.khung];
      const w = Math.round(W * 0.9), h = Math.round(w * kh.height / kh.width), x = (W - w) >> 1, y = H - h - Math.round(H * 0.03);
      ctx.save(); ctx.imageSmoothingEnabled = false;
      ctx.drawImage(kh, x, y, w, h);
      const cd = nv.chan_dung && ANH[d._goc + nv.chan_dung];
      const pad = Math.round(h * 0.14); let tx = x + pad * 1.6;
      if (cd){ const ch = h - pad * 2, cw = Math.round(ch * cd.width / cd.height); ctx.drawImage(cd, x + pad, y + pad, cw, ch); tx = x + pad * 2 + cw; }
      const fs = Math.max(12, Math.round(H * 0.035));
      ctx.textBaseline = 'top'; ctx.fillStyle = '#E1B85A'; ctx.font = 'bold ' + fs + 'px serif';
      if (nv.ten) ctx.fillText(nv.ten, tx, y + pad);
      ctx.fillStyle = '#F3E6C8'; ctx.font = fs + 'px serif';
      const maxW = x + w - pad * 1.6 - tx; let dongY = y + pad + fs * 1.5;
      for (const ln of boDong(ctx, dg.chu.slice(0, mo.n), maxW)){ ctx.fillText(ln, tx, dongY); dongY += fs * 1.3; }
      if (dg.chon && mo.n >= dg.chu.length){
        dg.chon.forEach((c, k) => { ctx.fillStyle = k === mo.chon ? '#CEF0D6' : '#83CC93'; ctx.fillText((k === mo.chon ? '› ' : '  ') + c.chu, tx, dongY); dongY += fs * 1.3; });
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
