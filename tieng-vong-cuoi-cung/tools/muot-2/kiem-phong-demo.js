// Mượt mức 2: nạp phòng demo + Vùng 1, báo lỗi JS và ảnh nhân vật/quái bị thiếu (404; ảnh lớp sức mạnh thiếu là bình thường – lớp tự ẩn), kiểm số khung đã nạp khớp JSON.
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node tools/muot-2/kiem-phong-demo.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let hong = 0;
  for (const url of ['http://localhost:8765/game/phong-demo/index.html', 'http://localhost:8765/game/vung-1/index.html?tu=1&moi=1']){
    const pg = await b.newPage(); const loi = [], thieu = [];
    pg.on('pageerror', e => loi.push(String(e)));
    pg.on('response', r => { if (r.status() >= 400 && /art\/(kiem-khach|quai-moi)\//.test(r.url())) thieu.push(r.url()); });
    await pg.goto(url); await pg.waitForTimeout(5000);
    const nv = JSON.parse(await (await pg.request.get('http://localhost:8765/game/thu-mat-na/nhan-vat.json')).text());
    const qj = JSON.parse(await (await pg.request.get('http://localhost:8765/game/thu-mat-na/quai.json')).text());
    // kiểm mỗi clip: ms mảng dài đúng so_hinh, và ảnh fNN tồn tại đủ
    const sai = [];
    const kiem = async (goc, def, ten) => {
      if (Array.isArray(def.ms) && def.ms.length !== def.so_hinh) sai.push(ten + ': ms ' + def.ms.length + ' ≠ so_hinh ' + def.so_hinh);
      for (let i = 0; i < def.so_hinh; i++){ const p = goc + def.thu_muc + '/' + (def.tien_to || 'f') + String(i).padStart(2, '0') + '.png'; const r = await pg.request.get('http://localhost:8765/' + p); if (!r.ok()) sai.push(ten + ': thiếu ' + p); }
      for (const k of ['trung']) if (def[k]) for (const x of def[k]) if (x >= def.so_hinh) sai.push(ten + ': ' + k + ' ' + x + ' ngoài khung');
    };
    if (url.includes('phong-demo')){
      for (const [t, d] of Object.entries(nv.clip)) await kiem('art/kiem-khach/', d, 'nv.' + t);
      for (const c of nv.cap) for (const [t, d] of Object.entries(c.clip)) await kiem('art/kiem-khach/', d, c.ten + '.' + t);
      for (const [l, L] of Object.entries(qj.loai)){
        for (const [t, d] of Object.entries(L.hinh)) await kiem('art/quai-moi/', d, l + '.' + t);
        const n = L.hinh.danh.so_hinh;
        for (const x of L.khung_trung || []) if (x >= n) sai.push(l + ': khung_trung ' + x + ' ngoài khung');
        if (L.chieu){ for (const k of ['khung_ban', 'chan_dong']) if (L.chieu[k] != null && L.chieu[k] >= n) sai.push(l + ': ' + k + ' ngoài khung'); }
        if (L.fx_danh && L.fx_danh.ms && L.fx_danh.ms.length !== L.fx_danh.so_hinh) sai.push(l + ': fx ms sai độ dài');
      }
    }
    console.log(url.split('/game/')[1], '| lỗi JS:', loi.length ? loi : 'không', '| ảnh thiếu:', thieu.length ? thieu : 'không', '| sai số liệu:', sai.length ? sai : 'không');
    hong += loi.length + thieu.length + sai.length; await pg.close();
  }
  await b.close(); console.log(hong ? 'CÓ ' + hong + ' LỖI' : 'TẤT CẢ ĐẠT'); process.exit(hong ? 1 : 0);
})();
