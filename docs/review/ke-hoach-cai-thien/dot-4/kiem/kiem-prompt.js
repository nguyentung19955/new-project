// Kiểm 1: mở 7 trang (bản mới cổng 8801, bản trước đợt 4 cổng 8802), gom lỗi console và prompt của MỌI lô.
const { chromium } = require('playwright'); const fs = require('fs');
const TRANG = { 'tach-phong': 'chonLo', 'tach-lang': 'chonLo', 'tach-giao-dien': 'chonLo', 'tach-do': 'chonLo', 'tach-quai': 'chonQuai', 'tach-anh-hung': 'chonNV', 'tach-hieu-ung': 'chonHu' };
(async () => {
  const b = await chromium.launch(); const kq = {};
  for (const [ten, sel] of Object.entries(TRANG)) {
    kq[ten] = {};
    for (const [ban, cong] of [['moi', 8801], ['goc', 8802]]) {
      const p = await b.newPage(); const loi = [];
      p.on('console', (m) => { if (m.type() === 'error') loi.push(m.text()); }); p.on('pageerror', (e) => loi.push('PAGEERROR ' + e.message));
      await p.goto(`http://localhost:${cong}/tools/${ten}/index.html`); await p.waitForTimeout(1500);
      const pr = await p.evaluate(async (sel) => {
        const s = document.getElementById(sel), out = {};
        for (const o of [...s.options]) {
          s.value = o.value; s.dispatchEvent(new Event('change')); await new Promise((r) => setTimeout(r, 30));
          const he = document.getElementById('chonHe'), bo = document.getElementById('oBanMau');
          if (he && bo && !bo.hidden) { for (const h of [...he.options]) { he.value = h.value; he.dispatchEvent(new Event('change')); await new Promise((r) => setTimeout(r, 30)); out[o.textContent + ' / ' + h.textContent] = document.getElementById('oPrompt').value; } }
          else out[o.textContent] = document.getElementById('oPrompt').value;
        }
        return out;
      }, sel);
      kq[ten][ban] = { loi, pr, macDinh: ban === 'moi' ? await p.evaluate(() => document.getElementById('kieuGiam').value) : null };
      await p.close();
    }
  }
  await b.close();
  fs.writeFileSync('prompt.json', JSON.stringify(kq, null, 1));
  let tong = 0, co = 0, khong = 0, lech = 0;
  for (const ten in kq) {
    const M = kq[ten].moi, G = kq[ten].goc; let c = 0, k = 0, l = 0;
    for (const lo in M.pr) {
      tong++; const m = M.pr[lo], g = G.pr[lo], i = m.indexOf('BẢNG MÀU (bắt buộc bám theo');
      if (m === g && i >= 0) { c++; continue; } // lô đã tự có đoạn bảng màu từ trước (phiên khác viết): giữ nguyên, không chèn lần hai
      if (i < 0) { k++; if (m !== g) l++; continue; }
      c++; const j = m.indexOf('Nền trơn MỘT MÀU', i); if (m.slice(0, i) + m.slice(j) !== g) l++;
    }
    co += c; khong += k; lech += l;
    console.log(ten, '| lô:', Object.keys(M.pr).length, '| có đoạn bảng màu:', c, '| không có:', k, '| phần còn lại KHÁC bản gốc:', l, '| lỗi console mới:', JSON.stringify(M.loi), '| gốc:', JSON.stringify(G.loi), '| mặc định:', M.macDinh);
  }
  console.log('TỔNG', tong, 'có', co, 'không', khong, 'lệch', lech);
})();
