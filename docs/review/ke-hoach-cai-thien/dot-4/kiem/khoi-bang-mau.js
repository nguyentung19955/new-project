// ===================== BẢNG MÀU LINH KHÍ (Đợt 4 · Q6) =====================
// Khối này GIỐNG HỆT NHAU ở mọi trang tools/tach-* (trừ tach-ghep). Mã màu chép từ docs/review/ra-soat-my-thuat/bang-mau.json,
// giải thích ở docs/vfx/BANG-MAU-LOI.md. Đổi mã màu thì đổi cả 7 trang và 2 tệp đó. Chỉ dùng cho LÔ MỚI:
//   bmDoan + bmChen  thêm đoạn "BẢNG MÀU" vào prompt (chỉ các nhóm màu liên quan tới lô đang chọn);
//   bmGiam           tuỳ chọn "Giảm màu: Theo bảng màu Linh Khí". Mặc định "Tự do" = không làm gì, tệp xuất y hệt trước đây.
const BM = {
  vien: '#14182e',
  nhom: {
    da: 'da người: tối #a86a49, vừa #eeac6d, sáng #f9b788; mặt nạ, ngà #efe2d1',
    toc: 'tóc, khăn, lông tối: #220f18, #3b3234',
    go: 'gỗ: tối #32180d, vừa #58371e, sáng #79451d; rơm, mép gỗ nắng #c98c34',
    da_stone: 'đá: tối #29313b, vừa #333c47, sáng #4a5560',
    kim_loai: 'kim loại: thép tối #5c5b73, thép sáng #cecdda, vàng kim (đồng) #f4bf4d',
    vai: 'vải: đỏ #c43b37, đỏ sáng #f66c52; lục #506f2a, lục sáng #95a53a; tím #7763ac',
    co_cay: 'cỏ cây: đất rừng #3d402e, lá vừa #2f5f34, lá sáng #557521, ngọn lá nắng #d0cf64',
    nuoc: 'nước: sâu #2a40a5, vừa #3d69cd, ánh nước #cedaea',
    lua: 'lửa môi trường (đuốc, chậu than): than hồng #a03409, lửa #eb7e14',
    bong: 'bóng tối sâu nhất: #120d11',
    he_lua: 'hệ Lửa: nhạt #ffc90e, chính #fe7d04, đậm #c9270c, lõi sáng #feec86',
    he_doc: 'hệ Độc: nhạt #c8f90b, chính #5aca02, đậm #277600, lõi sáng #fbfed0',
    he_bang: 'hệ Băng: nhạt #9cfefa, chính #32b0e9, đậm #217bc3, lõi sáng #eefffc',
    quai: 'đòn và hiệu ứng của QUÁI dùng nấc đậm của hệ: Lửa #c9270c, Độc #277600, Băng #217bc3',
  },
};
const bmMa = (k, i) => (BM.nhom[k].match(/#[0-9a-f]{6}/g) || [])[i]; // mã màu thứ i (từ 0) của một nhóm
// Đoạn bảng màu cho prompt. nhom: tên các nhóm trong BM.nhom. tuy.vien: câu về viền thay cho câu mặc định; tuy.rieng: trang đã ghi mã màu riêng cho từng ô (đồ, giao diện) thì các mã đó được giữ; tuy.them: câu thêm.
function bmDoan(nhom, tuy) {
  tuy = tuy || {};
  const ds = nhom.map((k) => BM.nhom[k]).filter(Boolean).join(' | ');
  return `BẢNG MÀU (bắt buộc bám theo; chỉ để chọn màu, KHÔNG vẽ ô màu mẫu vào ảnh): ${ds}. Mỗi chất liệu trên một vật dùng tối đa 3 sắc lấy trong bảng này; `
    + (tuy.vien || `viền ngoài một nét ${BM.vien} (thay cho mã viền khác nếu ở trên có ghi)`)
    + (tuy.rieng ? '; mã màu đã ghi ở trên (của từng ô, của hệ) thì giữ nguyên, bảng này dùng cho các phần còn lại. '
      : '; mã màu ở trên của đúng các chất liệu này mà khác bảng thì theo bảng; màu nhấn riêng của một chi tiết đã tả ở trên thì giữ nguyên. ') + (tuy.them || '');
}
// Chèn đoạn bảng màu vào ngay trước câu "Nền trơn MỘT MÀU…" (câu chốt của mọi prompt); không thấy câu đó thì nối vào cuối.
// Prompt nào đã tự có đoạn "BẢNG MÀU (" (lô viết riêng bảng màu của mình) thì để nguyên, không chèn lần hai.
function bmChen(p, doan) { if (p.indexOf('BẢNG MÀU (') >= 0) return p; const i = p.lastIndexOf('Nền trơn MỘT MÀU'); return i < 0 ? p + ' ' + doan.trim() : p.slice(0, i) + doan + p.slice(i); }
// ----- Giảm màu theo bảng: 44 màu của bảng (đã gồm viền) + trắng + đen -----
const BM_HEX = [...new Set((JSON.stringify(BM).match(/#[0-9a-f]{6}/g) || []).concat('#ffffff', '#000000'))];
// Khoảng cách màu ΔE (Lab): xa bảng hơn BM_NGUONG thì giữ nguyên màu. Hai MẢNG MÀU LỚN (mỗi mảng từ BM_LON số điểm ảnh của hình trở lên) chỉ được
// dồn về cùng một màu bảng khi chúng gần như một màu (cách nhau dưới BM_GAN); màu lẻ ở mép (vệt pha giữa hai mảng) thì được gộp tự do.
const BM_NGUONG = 18, BM_GAN = 6, BM_LON = 0.03;
function bmLab(r, g, b) {
  const f = (v) => { v /= 255; return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92; }, R = f(r), G = f(g), B = f(b);
  const t = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  const x = t((0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047), y = t(0.2126 * R + 0.7152 * G + 0.0722 * B), z = t((0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
const BM_BANG = BM_HEX.map((h) => { const v = parseInt(h.slice(1), 16), c = [(v >> 16) & 255, (v >> 8) & 255, v & 255]; return { c, lab: bmLab(c[0], c[1], c[2]) }; });
const bmDE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
// Gọi NGAY SAU giamMau(px, …). px: RGBA; chỉ đổi R, G, B của điểm có alpha > 0, không đổi alpha, không thêm bớt điểm.
// Mỗi màu của hình được đưa về màu gần nhất trong bảng nếu đủ gần (ΔE ≤ BM_NGUONG); hai mảng màu lớn khác hẳn nhau không bị dồn về cùng một màu bảng (để hình không bệt).
// Trả về null khi đang ở "Tự do"; ngược lại { khop, tong, diem, tongDiem } = số màu (và số điểm ảnh) đã khớp bảng trên tổng.
function bmGiam(px) {
  const o = document.getElementById('kieuGiam');
  if (!o || o.value !== 'bang') return null;
  const dem = new Map();
  for (let i = 0; i < px.length; i += 4) if (px[i + 3]) { const k = (px[i] << 16) | (px[i + 1] << 8) | px[i + 2]; dem.set(k, (dem.get(k) || 0) + 1); }
  const ds = [...dem.keys()].map((k) => {
    const lab = bmLab((k >> 16) & 255, (k >> 8) & 255, k & 255);
    const ung = BM_BANG.map((b, j) => [bmDE(lab, b.lab), j]).filter((u) => u[0] <= BM_NGUONG).sort((a, b) => a[0] - b[0]);
    return { k, lab, ung };
  }).sort((a, b) => dem.get(b.k) - dem.get(a.k)); // mảng to chọn trước: màu chiếm nhiều diện tích nhất luôn được về đúng màu bảng
  const chu = new Map(), doi = new Map(); // chu: màu bảng -> các mảng màu lớn đã nhận nó
  let khop = 0, diem = 0, tongDiem = 0;
  for (const m of ds) tongDiem += dem.get(m.k);
  const dan = []; // các màu đã tự quyết (to trước): màu gần như trùng với một màu trong này (ΔE ≤ BM_GAN) thì đi theo nó, để một mảng không bị lốm đốm hai màu bảng
  for (const m of ds) {
    const n = dem.get(m.k), lon = n >= BM_LON * tongDiem;
    let theo = null, gan = BM_GAN;
    for (const d of dan) { const e = bmDE(d.lab, m.lab); if (e <= gan) { gan = e; theo = d; } }
    if (theo) { if (theo.j >= 0) { doi.set(m.k, BM_BANG[theo.j].c); khop++; diem += n; } continue; }
    let j = -1;
    for (const [, u] of m.ung) { if (lon && u !== 0 && (chu.get(u) || []).some((l) => bmDE(l, m.lab) > BM_GAN)) continue; j = u; break; } // u = 0 là mực viền: viền luôn một màu nên được gộp tự do
    if (j >= 0) { if (lon) chu.set(j, (chu.get(j) || []).concat([m.lab])); doi.set(m.k, BM_BANG[j].c); khop++; diem += n; }
    dan.push({ lab: m.lab, j });
  }
  for (let i = 0; i < px.length; i += 4) if (px[i + 3]) { const c = doi.get((px[i] << 16) | (px[i + 1] << 8) | px[i + 2]); if (c) { px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; } }
  return { khop, tong: ds.length, diem, tongDiem };
}
// Thêm một dòng vào danh sách "kết quả kiểm" của trang. ds: các kết quả bmGiam (một hình hoặc nhiều hình); them: phần tử thứ ba của dòng (trang nào dùng thì truyền 1).
function bmMuc(muc, ds, them) {
  ds = (ds || []).filter(Boolean); if (!ds.length) return;
  const t = ds.reduce((a, b) => ({ khop: a.khop + b.khop, tong: a.tong + b.tong, diem: a.diem + b.diem, tongDiem: a.tongDiem + b.tongDiem }));
  const d = [`Giảm màu theo bảng Linh Khí: ${t.khop}/${t.tong} màu đã khớp bảng (${t.tongDiem ? Math.round((100 * t.diem) / t.tongDiem) : 0}% số điểm ảnh); màu xa bảng được giữ nguyên để hình không bệt`, true];
  if (them) d.push(them); muc.push(d);
}
// ===================== HẾT KHỐI BẢNG MÀU =====================

