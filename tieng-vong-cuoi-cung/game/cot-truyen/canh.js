'use strict';
/* canh.js – CHIẾU CẢNH (cutscene) bằng tranh tĩnh + phụ đề, dùng chung cho làng và các vùng. Phiên cottruyen.
   LUẬT HÌNH: tranh là ảnh ChatGPT vẽ; game chỉ in chữ + làm mờ dần (ánh sáng). Thiếu BẤT KỲ tranh nào → sanSang() = false, bat() không chiếu.
   Dữ liệu: game/cot-truyen/canh/<id>.json = {id, tranh:[{anh, giay, chu, tieu_de?}]}
   Dùng:  await CanhTruyen.nap('../cot-truyen/canh/', 'mo-dau', '../../');
          if (CanhTruyen.sanSang('mo-dau')) CanhTruyen.bat('mo-dau', xong);
          mỗi khung: CanhTruyen.capNhat(dt, {xac_nhan, bo_qua}); CanhTruyen.ve(ctx, W, H);  CanhTruyen.dangChieu()
   Phím: xác nhận = sang tranh kế; bỏ qua (Skip) = kết thúc ngay. Xem xong/bỏ qua đều ghi LuuChung.xemXong(id). */
(function(goc){
  const DS = {}, ANH = {}, MO = 0.6;   // giây làm mờ chuyển tranh
  let c = null;                         // {d, i, t, xong}
  function napAnh(url){
    if (ANH[url] !== undefined) return Promise.resolve(ANH[url]);
    if (typeof Image === 'undefined') return Promise.resolve(ANH[url] = null);
    return new Promise(r => { const im = new Image(); im.onload = () => r(ANH[url] = im); im.onerror = () => r(ANH[url] = null); im.src = url; });
  }
  const API = {
    async nap(thuMuc, id, gocArt){
      try {
        const r = await fetch(thuMuc + id + '.json', {cache:'no-store'}); if (!r.ok) return false;
        const d = await r.json(); d._goc = gocArt || '';
        await Promise.all(d.tranh.map(x => napAnh(d._goc + x.anh)));
        DS[d.id || id] = d; return API.sanSang(d.id || id);
      } catch (e){ return false; }
    },
    them(d, gocArt){ d._goc = gocArt || ''; DS[d.id] = d; return Promise.all(d.tranh.map(x => napAnh(d._goc + x.anh))); },
    sanSang(id){ const d = DS[id]; return !!d && d.tranh.length > 0 && d.tranh.every(x => ANH[d._goc + x.anh]); },
    thieuAnh(id){ const d = DS[id]; return d ? d.tranh.map(x => x.anh).filter(u => !ANH[d._goc + u]) : ['(not loaded ' + id + ')']; },
    bat(id, xong){ if (!API.sanSang(id)) return false; c = {d: DS[id], i: 0, t: 0, xong}; return true; },
    dangChieu: () => !!c,
    tranhHienTai: () => c ? c.i : -1,
    capNhat(dt, phim){
      if (!c) return; phim = phim || {};
      if (phim.bo_qua) return ketThuc();
      c.t += dt;
      const tr = c.d.tranh[c.i];
      if (c.t >= tr.giay || (phim.xac_nhan && c.t > 0.3)){
        if (c.i + 1 >= c.d.tranh.length) return ketThuc();
        c.i++; c.t = 0;
      }
    },
    ve(ctx, W, H){
      if (!c) return;
      const d = c.d, tr = d.tranh[c.i], im = ANH[d._goc + tr.anh];
      ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      const s = Math.min(W / im.width, H / im.height), w = im.width * s, h = im.height * s, x = (W - w) / 2, y = (H - h) / 2;
      const cuoi = c.i === d.tranh.length - 1;
      const a = Math.min(1, c.t / MO, cuoi ? 1 : Math.max(0, (tr.giay - c.t) / MO));   // mờ vào / mờ ra
      ctx.globalAlpha = a; ctx.imageSmoothingEnabled = false; ctx.drawImage(im, x, y, w, h);
      const fs = Math.max(14, Math.round(h * 0.042));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = Math.max(0, Math.min(1, (c.t - 0.4) / 0.6)) * a;
      ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
      if (tr.tieu_de){ ctx.fillStyle = '#E1B85A'; ctx.font = '700 ' + Math.round(fs * 2.2) + 'px "Cormorant Garamond",serif'; ctx.fillText(tr.tieu_de, W / 2, y + h * 0.42); }
      ctx.fillStyle = '#F3E6C8'; ctx.font = 'italic 500 ' + fs + 'px "Cormorant Garamond","Alegreya Sans",serif';
      ctx.fillText(tr.chu, W / 2, y + h * 0.9);
      ctx.restore();
    },
    _DS: DS
  };
  function ketThuc(){ const x = c; c = null; if (goc.LuuChung) goc.LuuChung.xemXong(x.d.id); if (x.xong) x.xong(); }
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else goc.CanhTruyen = API;
})(typeof window !== 'undefined' ? window : globalThis);
