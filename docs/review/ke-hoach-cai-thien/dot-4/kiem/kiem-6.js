// Kiểm 3: 6 trang còn lại. Cùng một tấm ảnh thử → bản trước đợt 4 (8802), bản mới "Tự do", bản mới "Theo bảng". So TỆP XUẤT (chuỗi JSON có ảnh PNG) và từng điểm ảnh.
const { chromium } = require('playwright'); const fs = require('fs');
const LO = ['tach-lang', 'tach-giao-dien', 'tach-do'], TAM = ['tach-quai', 'tach-anh-hung', 'tach-hieu-ung'];
(async () => {
  const b = await chromium.launch(); const bang = [];
  for (const ten of (process.argv[2] ? [process.argv[2]] : [...LO, ...TAM])) {
    const kq = {};
    for (const [ban, cong, kieu] of [['goc', 8802, null], ['tu-do', 8801, 'tu-do'], ['bang', 8801, 'bang']]) {
      const p = await b.newPage(); const loi = []; p.on('pageerror', (e) => loi.push(e.message));
      await p.goto(`http://localhost:${cong}/tools/${ten}/index.html`); await p.waitForTimeout(800);
      await p.setInputFiles('#chonAnh', `thu/kiem-${ten}.png`);
      await p.waitForFunction((lo) => (lo ? KQ.filter(Boolean).length > 0 : !!KQ), LO.includes(ten), { timeout: 30000 });
      await p.waitForTimeout(600);
      if (kieu) { await p.selectOption('#kieuGiam', kieu); await p.waitForTimeout(900); }
      kq[ban] = await p.evaluate((lo) => {
        const kiem = [...document.querySelectorAll('#dsKiem li')].map((l) => l.textContent), the = document.getElementById('theKq').textContent;
        if (lo) return { kiem, the, tep: KQ.map((K, i) => (K ? JSON.stringify(phanTep(i, false, false)) : null)), px: KQ.map((K) => (K ? Array.from(K.out.px) : null)) };
        const t = taoTep(); return { kiem, the, tep: [JSON.stringify(t)], px: [Array.from(KQ.tam)] };
      }, LO.includes(ten));
      kq[ban].loi = loi; await p.close();
    }
    const g = kq.goc, t = kq['tu-do'], m = kq.bang;
    const tepGiong = JSON.stringify(g.tep) === JSON.stringify(t.tep), pxGiong = JSON.stringify(g.px) === JSON.stringify(t.px);
    let hinhBong = 0, doi = 0; g.px.forEach((a, i) => { if (!a) return; const c = m.px[i]; for (let j = 0; j < a.length; j += 4) { if (a[j + 3] !== c[j + 3]) hinhBong++; else if (a[j + 3] && (a[j] !== c[j] || a[j + 1] !== c[j + 1] || a[j + 2] !== c[j + 2])) doi++; } });
    const d = { trang: ten, so_tep: g.tep.filter(Boolean).length, tu_do_tep_giong_goc: tepGiong, tu_do_diem_anh_giong_goc: pxGiong, kiem_tu_do_giong_goc: JSON.stringify(g.kiem) === JSON.stringify(t.kiem) && g.the === t.the,
      theo_bang_dong_kiem: m.kiem.find((x) => x.indexOf('Giảm màu theo bảng') === 0) || null, theo_bang_diem_doi_mau: doi, theo_bang_diem_lech_do_trong: hinhBong, the: [g.the, t.the, m.the], loi: [g.loi, t.loi, m.loi] };
    bang.push(d); console.log(JSON.stringify(d));
  }
  await b.close(); fs.writeFileSync('ra/kiem-' + (process.argv[2] || '6-trang') + '.json', JSON.stringify(bang, null, 1));
})();
