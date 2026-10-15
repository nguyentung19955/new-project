// Bìa game ở màn hình chính (bia-moi 15/10): ảnh bìa thay cảnh làng làm tối + Cu Tí đứng góc.
//   - Mỗi lần mở game chọn ngẫu nhiên 1 trong 2 bìa; ?bia=1 / ?bia=2 ép một bìa (15/10 don-tep B: bỏ cờ ?biacu=1).
//   - Ảnh: game/art/bia/<tên>.webp|jpg 960×540 (dựng bằng tools/anh-truyen/dung.py từ docs/anh-goc/bia). build.py khai G.BIA_ANH
//     (bản ảnh rời: đường dẫn anh/bia-<tên>.<mã>.webp|jpg; bản một tệp: data:). Chạy thẳng game/index.html qua http: art/bia/.
//   - TẢI SỚM, KHÔNG CHẶN: trang nhẹ (build.py) gắn đường dẫn ảnh vào #lk-tai (data-bia) → thẻ onanimationstart của màn tải HTML
//     bắt đầu tải ngay khi trang còn đang về (window.LK_BIA = { n, img }). Không có thì tệp này tải lúc mã game vừa chạy.
//     Ảnh chưa về: village.js vẽ cảnh làng như cũ (không Cu Tí), ảnh về thì hiện dần 0,8 giây. Ảnh hỏng cả WebP lẫn JPEG: giữ cảnh làng.
//   - Hiệu ứng nhẹ: Ken Burns rất chậm (chu kỳ ~50 giây), đom đóm quanh cây đa, ánh nước lấp lánh. Không có gì nhấp nháy mạnh.
(function () {
  const G = window.G;
  const TEN = ['bia-1-cay-da', 'bia-2-dong-song'];
  const B = { TEN, n: 0, ten: '', img: null, ok: false, hong: false, tOk: 0, tDau: 0 };
  G.bia = B;
  const bayGio = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()) / 1000;
  function chon() {
    let q = '';
    try { q = String(location.search || ''); } catch (e) { /* bỏ qua */ }
    const L = window.LK_BIA;
    if (L && (L.n === 1 || L.n === 2)) return L.n; // màn tải HTML đã chọn (và đã bắt đầu tải) → dùng đúng bìa đó
    const m = /[?&]bia=([12])(&|$)/.exec(q);
    if (m) return +m[1];
    return Math.random() < 0.5 ? 1 : 2;
  }
  B.n = chon();
  B.ten = B.n ? TEN[B.n - 1] : '';
  if (!window.LK_BIA) { // mã game chạy trước khi thẻ màn tải kịp chọn: giữ đúng một lựa chọn (thẻ thấy LK_BIA thì thôi, không tải bìa thứ hai)
    window.LK_BIA = { n: B.n };
    try {
      const el = document.getElementById('lk-tai'), d = el ? String(el.getAttribute('data-bia') || '').split('|') : [];
      const o = B.n && d.length > 5 ? d[B.n * 3 - 1] : '';
      if (o && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(o)) el.style.backgroundImage = 'linear-gradient(rgba(18,13,16,.6),rgba(18,13,16,.6)),url(' + o + ')';
    } catch (e) { /* bỏ qua */ }
  }
  function nguon(ten) {
    const A = G.BIA_ANH;
    if (A && typeof A === 'object') return A[ten] || null; // bản đóng gói: chỉ ảnh có thật
    try { if (location.protocol === 'file:') return null; } catch (e) { return null; } // mở tệp trên máy (các bài kiểm): cảnh làng như cũ
    return { webp: 'art/bia/' + ten + '.webp', jpg: 'art/bia/' + ten + '.jpg' };
  }
  function xong(im) { if (im && im.naturalWidth > 0) { B.img = im; B.ok = true; B.tOk = bayGio(); } else B.hong = true; }
  function tai() {
    if (!B.n || typeof Image === 'undefined') return;
    const L = window.LK_BIA;
    if (L && L.n === B.n && L.img) { // ảnh màn tải HTML đang tải (WebP, lỗi thì nó tự đổi sang JPEG)
      const im = L.img;
      if (im.complete && im.naturalWidth > 0) { xong(im); B.tOk = 0; return; }
      im.addEventListener('load', () => xong(im));
      im.addEventListener('error', () => setTimeout(() => { if (L.het) B.hong = true; }, 0)); // thẻ màn tải tự thử JPEG; hết cách thì L.het
      return;
    }
    const n = nguon(B.ten), ds = n ? [n.webp, n.jpg].filter((u) => typeof u === 'string' && u) : [];
    if (!ds.length) { B.hong = true; return; }
    let i = 0;
    const thu = () => {
      if (i >= ds.length) { B.hong = true; return; }
      const im = new Image();
      try { im.decoding = 'async'; } catch (e) { /* bỏ qua */ }
      im.onload = () => { if (im.naturalWidth > 0) xong(im); else { i++; thu(); } };
      im.onerror = () => { i++; thu(); };
      im.src = ds[i];
    };
    thu();
  }
  try { tai(); } catch (e) { B.hong = true; }

  // Độ hiện của ảnh: 0 (chưa có) → 1. Ảnh về trước khung hình đầu của màn chào thì hiện luôn, về sau thì hiện dần 0,8 giây.
  B.hien = function () {
    const now = bayGio();
    if (!B.tDau) B.tDau = now; // lần vẽ đầu của màn chào
    if (!B.ok) return 0;
    if (B.tOk <= B.tDau) return 1;
    const p = G.clamp((now - B.tOk) / 0.8, 0, 1);
    return p * p * (3 - 2 * p);
  };

  // Đom đóm / ánh nước: vị trí cố định theo hạt giống (không đổi giữa các khung), toạ độ trong ảnh 480×270.
  function hat(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const HIEU = [null, { // bìa 1: cây đa + trống bên trái, sông phía dưới
    dom: { n: 12, x: [4, 230], y: [20, 175] },
    nuoc: { n: 18, y: [192, 266] },
  }, { // bìa 2: ba vùng + dòng sông giữa
    dom: { n: 7, x: [4, 160], y: [10, 120] },
    nuoc: { n: 20, y: [152, 232] },
  }];
  const HAT = HIEU.map((h, k) => {
    if (!h) return null;
    const r = hat(97 + k * 31);
    const dom = [], nuoc = [];
    for (let i = 0; i < h.dom.n; i++) dom.push({ x: h.dom.x[0] + r() * (h.dom.x[1] - h.dom.x[0]), y: h.dom.y[0] + r() * (h.dom.y[1] - h.dom.y[0]), p: r() * 6.28, v: 0.25 + r() * 0.35, b: 4 + r() * 6 });
    for (let i = 0; i < h.nuoc.n; i++) nuoc.push({ x: 8 + r() * 464, y: h.nuoc.y[0] + r() * (h.nuoc.y[1] - h.nuoc.y[0]), p: r() * 6.28, v: 0.5 + r() * 0.9, w: 2 + Math.round(r() * 3) });
    return { dom, nuoc };
  });
  // màu ánh nước theo phía: trái vàng ấm, giữa xanh lam, phải đỏ (đúng màu phản chiếu trong cả hai bìa)
  function mauNuoc(x) { return x < 170 ? '255,226,150' : x < 320 ? '170,220,255' : '255,160,130'; }

  // Vẽ ảnh lên canvas thế giới (G.wx), toạ độ game 480×270. a: độ hiện (0..1), t: giây.
  B.ve = function (c, a, t) {
    if (!B.ok || a <= 0) return;
    const im = B.img;
    // Ken Burns rất chậm: phóng 1,03 ↔ 1,07 (chu kỳ 50 giây), trôi ngang nhẹ (chu kỳ 73 giây); luôn phủ kín khung
    const z = 0.5 - 0.5 * Math.cos((t * 2 * Math.PI) / 50), s = 1.03 + 0.04 * z;
    const w = 480 * s, h = 270 * s, mx = (w - 480) / 2, my = (h - 270) / 2;
    const x = -mx + mx * 0.7 * Math.sin((t * 2 * Math.PI) / 73), y = -my + my * 0.5 * Math.sin((t * 2 * Math.PI) / 61);
    G.wxDat(c, 0, 0);
    const ga = c.globalAlpha, sm = c.imageSmoothingEnabled;
    c.globalAlpha = ga * a;
    c.imageSmoothingEnabled = true;
    try { c.imageSmoothingQuality = 'high'; } catch (e) { /* bỏ qua */ }
    c.drawImage(im, x, y, w, h);
    c.imageSmoothingEnabled = sm;
    // hiệu ứng trong toạ độ ảnh (đi theo Ken Burns)
    const H = HAT[B.n];
    if (H) {
      G.wxDat(c, x, y, s);
      for (const d of H.nuoc) { // ánh nước: vệt sáng ngắn hiện lên rồi tắt dần, mỗi vệt một nhịp
        const k = Math.sin(t * d.v + d.p);
        if (k <= 0.55) continue;
        c.fillStyle = 'rgba(' + mauNuoc(d.x) + ',' + ((k - 0.55) * 1.4).toFixed(3) + ')';
        c.fillRect(d.x, d.y, d.w, 0.6);
      }
      for (const d of H.dom) { // đom đóm: trôi chậm theo vòng nhỏ, sáng mờ theo nhịp
        const px = d.x + Math.sin(t * d.v + d.p) * d.b, py = d.y + Math.sin(t * d.v * 0.7 + d.p * 1.3) * d.b * 0.6;
        const k = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.7 + d.p * 3));
        c.fillStyle = 'rgba(255,224,130,' + (0.18 * k).toFixed(3) + ')';
        c.fillRect(px - 1.5, py - 1.5, 3, 3);
        c.fillStyle = 'rgba(255,246,190,' + (0.85 * k).toFixed(3) + ')';
        c.fillRect(px - 0.5, py - 0.5, 1, 1);
      }
    }
    c.globalAlpha = ga;
    G.wxDat(c, 0, 0);
  };

  // Lớp tối cho chữ và nút trên canvas giao diện (G.ux): vùng trời phía trên giữa cho logo, dải tối mờ dưới cho nút.
  // Phủ cả phần lề ngoài khung 16:9 (màn 4:3 / máy dọc) để không thấy mép. Dải dưới bắt đầu từ y 166: không phủ trống đồng ở bìa 1 (y ≈ 123–167).
  B.veMan = function (u) {
    const mx = G.mx || 0, my = G.my || 0;
    u.save();
    // logo: elip tối dịu giữa trên
    u.translate(240, 58); u.scale(1, 0.4);
    let g = u.createRadialGradient(0, 0, 10, 0, 0, 150);
    g.addColorStop(0, 'rgba(8,6,10,0.55)'); g.addColorStop(0.6, 'rgba(8,6,10,0.32)'); g.addColorStop(1, 'rgba(8,6,10,0)');
    u.fillStyle = g; u.fillRect(-160, -160, 320, 320);
    u.restore();
    // câu giới thiệu: dải tối dẹt ngang (đầu câu nằm trên tán đa sáng ở bìa 1)
    u.save(); u.translate(240, 93); u.scale(1, 0.09);
    g = u.createRadialGradient(0, 0, 10, 0, 0, 180);
    g.addColorStop(0, 'rgba(8,6,10,0.5)'); g.addColorStop(0.7, 'rgba(8,6,10,0.38)'); g.addColorStop(1, 'rgba(8,6,10,0)');
    u.fillStyle = g; u.fillRect(-190, -190, 380, 380);
    u.restore();
    g = u.createLinearGradient(0, -my, 0, 40);
    g.addColorStop(0, 'rgba(8,6,10,0.45)'); g.addColorStop(1, 'rgba(8,6,10,0)');
    u.fillStyle = g; u.fillRect(-mx - 2, -my - 2, 484 + mx * 2, 42 + my + 2);
    g = u.createLinearGradient(0, 166, 0, 270);
    g.addColorStop(0, 'rgba(8,6,10,0)'); g.addColorStop(0.2, 'rgba(8,6,10,0.5)'); g.addColorStop(0.45, 'rgba(8,6,10,0.66)'); g.addColorStop(1, 'rgba(8,6,10,0.8)');
    u.fillStyle = g; u.fillRect(-mx - 2, 166, 484 + mx * 2, 104);
    if (my > 0) { u.fillStyle = 'rgba(8,6,10,0.8)'; u.fillRect(-mx - 2, 270, 484 + mx * 2, my + 2); }
  };
})();
