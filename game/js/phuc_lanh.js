// PHÚC LÀNH GIỮA ẢI (16/10, tư vấn 4 — docs/review/ke-hoach-cai-thien/tu-van-4-phuc-lanh/bao-cao.md;
// quyết định chủ game: QUYET-DINH-TU-VAN-16-10.md mục 8; tư vấn: TU-VAN-CHATGPT-TOAN-BO-16-10.md mục 1, 6).
// Mỗi lượt ải thường: dọn xong phòng quái thứ 2 hoặc 3 (theo hạt giống của lượt; Ải 1 Rừng già luôn là phòng thứ 2) thì trận dừng,
// Cu Tí chọn 1 trong 3 thẻ phúc lành: 1 thẻ VŨ KHÍ (đổi cách đánh của món đang mang), 1 thẻ NÉ, 1 thẻ HỆ. Phúc lành nằm trên lượt ải
// (S.pl) nên tự hết khi lượt ải kết thúc — không ghi vào bản lưu (chỉ cờ "đã chọn lần đầu" G.save.tut.phucLanh cho dòng dạy người mới).
// Không sửa sinh bản đồ, không thêm loại phòng. Không thêm hình vẽ trong trận: hiệu ứng dùng lại đúng thứ có sẵn (vệt trăng của
// Trảm Nguyệt W.mvSp, phi tiêu W.projs, sóng chấn của búa W.mvWaves, vũng cháy / độc W.zones, hạt G.burst, hiệu ứng hệ G.applyStatus).
// Lớp giao diện: 3 thẻ (G.theme.card + biểu tượng có sẵn gd-nut-danh-<vũ khí> / gd-nut-ne / gd-he-<hệ>).
// Mọi móc BỌC TỪ BÊN NGOÀI hàm có sẵn (gọi hàm cũ trước); không sửa combat.js / moves.js.
// Cờ tắt: ?phuclanh=0 (G.PHUC_LANH_BAT = false) → không bọc gì, trận y như trước.
// Bot (tests/bot.js): G.botCfg.phucLanh = 'ngau' (mặc định, chọn ngẫu nhiên) | 0..2 (thẻ thứ mấy) | 'bo' (bỏ qua, đo đối chứng).
(function () {
  'use strict';
  const G = window.G;
  if (!G) return;
  if (G.PHUC_LANH_BAT == null) { let tat = false; try { tat = /[?&]phuclanh=0(&|$)/.test(String(location.search || '')); } catch (e) { tat = false; } G.PHUC_LANH_BAT = !tat; }
  const PL = (G.phucLanh = { bat: () => G.PHUC_LANH_BAT !== false });
  if (!PL.bat()) return;

  // ---------- số (cân bằng: tests/phuc_lanh.py — ải nhanh hơn ≤ 10%, trùm vùng không vọt) ----------
  const SO = (G.PHUC_LANH_SO = {
    cho: 0.9,                                   // giây sau khi dọn phòng mới mở bảng chọn (cho kịp thấy đồ rơi)
    guom: { mult: 0.7, tam: 105, v: 300, half: 9 },  // Gươm Hồ Gươm: vệt trăng nhỏ theo nhát kết kiếm (Trảm Nguyệt: 2,0 / 170)
    no: { mult: 0.7, tam: 85 },                // Nỏ thần: phi tiêu nảy sang con gần nhất trong 85 điểm ảnh
    tre: { keo: 0.75, toiDa: 30 },              // Gậy tre: nhát đâm thứ 3 và Quét vòng của thương kéo quái về (75% khoảng cách, tối đa 30 điểm ảnh)
    riu: { tre: 0.35, mult: 0.6, multNen: 0.6, tamNen: 60 }, // Rìu Thạch Sanh: dư chấn chạy ngược sau 0,35 giây (nện đất: 0,6 lần sóng gốc; nện thường: sóng 60 điểm ảnh, 0,6 lần nhát)
    trong: { giay: 3, choang: 0.35, nghi: 1.2 }, // Trống đồng: 3 giây sau đòn Đặc biệt, nhát thường làm choáng 0,35 giây (không lên trùm; mỗi con nghỉ 1,2 giây)
    ngua: { buoc: 14, r: 12, song: 1.6, src: 0.5, toiDa: 3 }, // Ngựa sắt: vệt lửa mỗi 14 điểm ảnh khi lướt né (tối đa 3 vũng / lần)
    nui: { r: 38, day: 26, choang: 0.35 },      // Sơn Tinh: cuối lần né đẩy bật quái trong 38 điểm ảnh, choáng 0,35 giây
    song: { cd: 0.3 },                          // Thủy Tinh: lần né thứ hai chỉ chờ 0,3 giây, rồi chờ hồi như thường cho cả cặp
    ca: { r: 18, mana: 4 },                     // Cá chép: đạn quái trong 18 điểm ảnh tan khi đang lướt né, +4 năng lượng mỗi viên
    ngan: { r: 16 },                            // Mẫu Thượng Ngàn: quái trong 16 điểm ảnh của đường lướt bị 1 tầng Băng
    than: { moi: 3 },                           // Than hồng: cứ đòn trúng thứ 3 thì gây Cháy
    hoa: { r: 30, mult: 0.5 },                  // Hỏa long: quái đang cháy chết thì nổ (30 điểm ảnh, 0,5 lần đòn) làm cháy quái gần
    noc: { r: 20, song: 2.4, src: 0.6, tang: 3 }, // Nọc Chằn tinh: đủ 3 tầng Độc thì toả vũng độc (mỗi con một lần)
    suong: { r: 34 },                           // Sương Mẫu Thoải: quái vừa đóng băng truyền 1 tầng Băng cho quái trong 34 điểm ảnh
  });

  // ---------- bộ phúc lành (chữ: tên + 1 câu; bản Anh ở tools/ngon-ngu/tu-dien/phuc-lanh.json) ----------
  // loai: 'vk' (vũ khí, vk: loại vũ khí; '*' mọi loại), 'ne', 'he' (el: hệ cần có; null = luôn dùng được)
  const DS = [
    { k: 'guom', loai: 'vk', vk: 'sword', ten: 'Gươm Hồ Gươm', cau: 'Nhát kết của kiếm phóng thêm một vệt trăng nhỏ bay xuyên quái.' },
    { k: 'no', loai: 'vk', vk: 'bow', ten: 'Nỏ thần Kim Quy', cau: 'Phi tiêu trúng quái thì nảy sang con gần nhất một lần.' },
    { k: 'tre', loai: 'vk', vk: 'spear', ten: 'Gậy tre Thánh Gióng', cau: 'Nhát đâm thứ 3 và Quét vòng của thương kéo quái về sát chân.' },
    { k: 'riu', loai: 'vk', vk: 'hammer', ten: 'Rìu Thạch Sanh', cau: 'Nện búa xong, một dư chấn chạy ngược ra sau lưng.' },
    { k: 'trong', loai: 'vk', vk: '*', ten: 'Trống đồng Đông Sơn', cau: 'Tung đòn Đặc biệt xong, 3 giây sau mọi nhát thường làm quái choáng.' },
    { k: 'ngua', loai: 'ne', ten: 'Ngựa sắt Thánh Gióng', cau: 'Lướt né để lại vệt lửa đốt quái trên đường đi.' },
    { k: 'nui', loai: 'ne', ten: 'Sơn Tinh dời núi', cau: 'Né xong thì đẩy bật quái quanh mình ra xa.' },
    { k: 'song', loai: 'ne', ten: 'Sóng Thủy Tinh', cau: 'Được né liền hai lần rồi mới phải chờ hồi.' },
    { k: 'ca', loai: 'ne', ten: 'Cá chép Ông Táo', cau: 'Lướt né xuyên đạn của quái làm đạn tan, hồi chút năng lượng.' },
    { k: 'ngan', loai: 'ne', ten: 'Áo lá Mẫu Thượng Ngàn', cau: 'Lướt né xuyên qua quái làm chúng chậm lại.' },
    { k: 'than', loai: 'he', el: null, hien: 'fire', ten: 'Than hồng Ông Táo', cau: 'Cứ đòn trúng thứ 3 lại gây Cháy, kể cả vũ khí chưa có hệ.' },
    { k: 'hoa', loai: 'he', el: 'fire', ten: 'Hỏa long Lạc Long Quân', cau: 'Quái đang cháy mà chết thì nổ, làm cháy quái đứng gần.' },
    { k: 'noc', loai: 'he', el: 'poison', ten: 'Nọc Chằn tinh', cau: 'Quái dính đủ 3 tầng Độc thì toả một vũng độc dưới chân.' },
    { k: 'suong', loai: 'he', el: 'ice', ten: 'Sương Mẫu Thoải', cau: 'Quái vừa bị đóng băng truyền hơi lạnh sang quái đứng cạnh.' },
  ];
  const THEO = {};
  for (const b of DS) THEO[b.k] = b;
  PL.DS = DS; PL.THEO = THEO;
  const TEN_LOAI = { vk: 'Vũ khí', ne: 'Né', he: 'Hệ' };
  const TEN_VK = { sword: 'Kiếm', bow: 'Phi tiêu', spear: 'Thương', hammer: 'Búa' };

  const run = () => (G.getRun ? G.getRun() : null);
  // lớp bọc giữ lại dấu của các lớp bọc trước (vd G.kill.suKienBoc của js/su_kien.js) để mã / bài kiểm khác vẫn nhận ra
  const giuCo = (moi, cu) => { for (const k of Object.keys(cu)) if (!(k in moi)) moi[k] = cu[k]; moi.phucLanhBoc = true; return moi; };
  const coPL = (k) => { const S = run(); return !!(S && S.pl && S.pl.k === k); };
  PL.dang = () => { const S = run(); return S && S.pl ? S.pl.k : null; };
  const ZK = () => G.ZK || 0.85;
  const kep = (v, a, b) => (v < a ? a : v > b ? b : v);
  const gdAnh = (ma) => { const s = G.spriteCustom; return s && s.gdSan ? s.gdSan(ma) : null; };

  // ---------- chọn 3 thẻ ----------
  function heCo(P) { // các hệ người chơi đang có trên vũ khí mang theo (từ Mầm)
    const o = {};
    for (const w of P.weapons || []) if (w && w.branch && G.wStage(w) > 0) o[w.branch] = true;
    return o;
  }
  function boc(rn, a) { return a.length ? a[Math.floor(rn() * a.length) % a.length] : null; }
  PL.moi = function (S) {
    // số ngẫu nhiên riêng theo hạt giống bản đồ: KHÔNG dùng G.rnd, để mở bảng chọn không làm đổi dãy ngẫu nhiên của trận (quái, rơi đồ)
    const P = S.P, loai = {}, rn = G.ngay && G.ngay.ngauNhien ? G.ngay.ngauNhien(((S.map.seed | 0) * 31 + S.r * 7 + S.i * 3 + 101) >>> 0) : G.rnd;
    for (const w of P.weapons || []) if (w) loai[w.type] = true;
    const he = heCo(P), dauTien = PL.dayNguoiMoi(S);
    const vk = DS.filter((b) => b.loai === 'vk' && (b.vk === '*' || loai[b.vk]));
    const ne = DS.filter((b) => b.loai === 'ne');
    const hh = DS.filter((b) => b.loai === 'he' && (!b.el || he[b.el]));
    if (dauTien) { // Ải 1 lần đầu: thẻ dễ hiểu nhất của mỗi loại (vũ khí cận chiến đang mang, vệt lửa khi né, Than hồng)
      const cc = (P.weapons || []).find((w) => w && w.type !== 'bow');
      return [(cc && DS.find((b) => b.vk === cc.type)) || boc(rn, vk), THEO.ngua, THEO.than].map((b) => b.k);
    }
    return [boc(rn, vk), boc(rn, ne), boc(rn, hh)].filter(Boolean).map((b) => b.k);
  };
  PL.dayNguoiMoi = (S) => S.r === 0 && S.i === 0 && !S.diff && !(G.save && G.save.tut && G.save.tut.phucLanh);

  // ---------- móc vào lượt ải ----------
  const SS = G.StageScene;
  if (!SS || !G.startStage) return;
  const goiVao = G.startStage;
  G.startStage = function (r, i, diff, o) {
    const kq = goiVao.apply(this, arguments);
    const S = run();
    if (S && !S.aiNgay) {
      // phòng quái thứ 2 hoặc 3 (theo hạt giống bản đồ, không dùng G.rnd để không đổi dãy ngẫu nhiên của trận); Ải 1 luôn là phòng thứ 2
      const sau = (r === 0 && i === 0) ? 2 : 2 + ((S.map.seed >>> 3) & 1);
      S.pl = { sau, k: null, opts: null, xong: false, cho: 0, dem: 0 };
    }
    return kq;
  };
  giuCo(G.startStage, goiVao);
  function phongQuaiDaDon(S) { let n = 0; for (const r of S.map.rooms) if ((r.type === 'fight' || r.type === 'elite') && S.cleared[r.id]) n++; return n; }

  const capNhat = SS.update;
  SS.update = function (dt) {
    const S = run();
    if (S && S.mode === 'phuclanh') { // trận đứng yên tới khi chọn (bảng vẽ ở draw); phím 1 / 2 / 3
      if (S.fade > 0) S.fade -= dt;
      const kp = G.keyP || {};
      for (let j = 0; j < 3; j++) if (kp['Digit' + (j + 1)] && S.pl.opts[j]) { chon(S, j); break; }
      return;
    }
    capNhat.apply(this, arguments);
    const S2 = run();
    if (!S2 || !S2.pl || S2.pl.xong || S2 !== S || S2.mode !== 'play' || S2.trans || !S2.W || !S2.W.cleared) return;
    if (S2.W.type !== 'fight' && S2.W.type !== 'elite') return;
    if (phongQuaiDaDon(S2) < S2.pl.sau) return;
    S2.pl.cho += dt;
    if (S2.pl.cho < SO.cho) return;
    S2.pl.opts = PL.moi(S2);
    S2.pl.xong = true;
    if (!S2.pl.opts.length) return;
    S2.mode = 'phuclanh'; S2.sel = null;
    G.sfx('gong', 0.7);
  };
  giuCo(SS.update, capNhat);

  function chon(S, j) {
    const k = S.pl.opts[j], b = THEO[k];
    if (!b) return;
    S.pl.k = k;
    S.pl.dem = 0;
    S.mode = 'play';
    const P = S.P;
    if (k === 'song') { P.plSac = 1; P.plHoi = 0; }
    if (G.save && G.save.tut && !G.save.tut.phucLanh) G.save.tut.phucLanh = 1;
    if (S.W) S.W.banner = { s: G.t('Phúc lành: {0}', G.tv(b.ten)), col: '#ffd23f', t: 3 };
    G.sfx('evolve', 0.9);
    if (G.suKien && G.suKien.phat) G.suKien.phat('phucLanh', { S, k });
  }
  PL.chon = function (j) { const S = run(); if (S && S.mode === 'phuclanh') chon(S, j); };

  // ---------- giao diện: 3 thẻ (lớp giao diện) ----------
  const CW = 112, CH = 126, CY = 72, GAP = 8;
  PL.theX = (j) => 240 - (CW * 3 + GAP * 2) / 2 + j * (CW + GAP);
  PL.theY = () => CY;
  PL.CW = CW; PL.CH = CH;
  function bieuTuong(b, S) {
    const rieng = gdAnh('gd-phuc-lanh-' + b.k); // ảnh riêng của phúc lành (prompt ở bao-cao.md) — chưa có thì dùng biểu tượng có sẵn bên dưới
    if (rieng) return rieng;
    if (b.loai === 'ne') return gdAnh('gd-nut-ne');
    if (b.loai === 'he') return gdAnh('gd-he-' + (b.el || b.hien || 'fire'));
    let t = b.vk;
    if (t === '*') { const w = S && S.P ? G.curW(S.P) : null; t = w ? w.type : 'sword'; }
    return gdAnh('gd-nut-danh-' + t);
  }
  function mauLoai(b) { return b.loai === 'vk' ? '#ffd27a' : b.loai === 'ne' ? '#8fd0ff' : (G.EL[b.el || b.hien] || {}).col || '#ff9a5a'; }
  function nhanLoai(b) {
    if (b.loai === 'vk') return G.t('{0} · {1}', G.tv(TEN_LOAI.vk), b.vk === '*' ? G.tv('mọi vũ khí') : G.tv(TEN_VK[b.vk]));
    if (b.loai === 'he') return G.t('{0} · {1}', G.tv(TEN_LOAI.he), G.EL[b.el || b.hien] ? G.EL[b.el || b.hien].name : '');
    return G.tv(TEN_LOAI.ne);
  }
  function veThe(b, x, y, S, sel) {
    const T = G.theme, ui = G.ui;
    if (T && T.card) T.card(x, y, CW, CH, { sel }); else { ui.rect(x, y, CW, CH, '#1b3a3b', '#c9a46a'); }
    const g = bieuTuong(b, S);
    if (g && G.spriteCustom && G.spriteCustom.veGd) G.spriteCustom.veGd(G.ux, g, x + CW / 2 - 15, y + 9, 30, 30);
    else ui.circle(x + CW / 2, y + 24, 12, mauLoai(b), '#00000080');
    const op = { vien: [0, 0, 0, 0], align: 'center' };
    if (T && T.chuTrongKhung) {
      T.chuTrongKhung(nhanLoai(b), x + 4, y + 42, CW - 8, 10, Object.assign({}, op, { size: 6.5, min: 6.5, dong: 1, bold: false, color: mauLoai(b) }));
      T.chuTrongKhung(b.ten, x + 5, y + 53, CW - 10, 22, Object.assign({}, op, { size: 9, min: 7.5, dong: 2, bold: true, color: '#f6dc92' }));
      T.chuTrongKhung(b.cau, x + 7, y + 77, CW - 14, CH - 84, Object.assign({}, op, { size: 7.5, min: 6.5, dong: 5, gian: 1.5, bold: false, color: '#f1e6c6' }));
    } else {
      ui.text(nhanLoai(b), x + CW / 2, y + 48, { size: 7, align: 'center', color: mauLoai(b) });
      ui.para(b.ten, x + 6, y + 60, CW - 12, { size: 9, bold: true, color: '#f6dc92' });
      ui.para(b.cau, x + 7, y + 84, CW - 14, { size: 7.5, color: '#f1e6c6' });
    }
  }
  function dangGiu(x, y, w, h) { // ngón đang đè lên thẻ (như nút của js/ui_theme.js): thẻ sáng lên
    const thu = (q) => !q.role && !q.stale && G.inRect(q, x, y, w, h);
    if (G.coTro) return !!G.coTro(thu);
    return !!G.pointers && [...G.pointers.values()].some(thu);
  }
  function bangChon(S) {
    const ui = G.ui, T = G.theme;
    if (T && T.dim) T.dim(0.62); else ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.6)');
    const x0 = PL.theX(0) - 10, w0 = CW * 3 + GAP * 2 + 20;
    ui.panel(x0, 30, w0, 180, 'Phúc lành: chọn một');
    const day = PL.dayNguoiMoi(S);
    const goi = day ? 'Phúc lành đổi cách đánh tới hết ải này. Chạm một thẻ để chọn.' : 'Chỉ có tác dụng tới hết ải này.';
    if (T && T.chuTrongKhung) T.chuTrongKhung(goi, x0 + 8, 55, w0 - 16, 13, { vien: [0, 0, 0, 0], align: 'center', size: 7.5, min: 6.5, dong: 1, bold: false, color: day ? '#ffd27a' : '#a9c2b4' });
    else ui.text(goi, 240, 63, { size: 7.5, align: 'center', color: '#a9c2b4' });
    S.pl.opts.forEach((k, j) => {
      const b = THEO[k], x = PL.theX(j), y = CY;
      const giu = dangGiu(x, y, CW, CH);
      veThe(b, x, y, S, !!giu);
      if (!G.noRender) ui.text(String(j + 1), x + CW - 9, y + 13, { size: 7, align: 'center', color: '#a9c2b4' }); // phím tắt 1 / 2 / 3
      if (G.click && G.inRect(G.click, x, y, CW, CH) && G.time - (S.modeT || 0) > 0.25) { G.click = null; chon(S, j); }
    });
  }
  // Bảng Tạm dừng: nhắc phúc lành đang có ở lề trái (bảng Tạm dừng nằm giữa, x 150–330)
  function nhacTamDung(S) {
    const b = THEO[S.pl.k], T = G.theme, ui = G.ui;
    if (!b) return;
    const x = 10, y = 60, w = 132, h = 76;
    if (T && T.card) T.card(x, y, w, h, {}); else ui.rect(x, y, w, h, '#1b3a3b', '#c9a46a');
    const g = bieuTuong(b, S);
    if (g && G.spriteCustom && G.spriteCustom.veGd) G.spriteCustom.veGd(G.ux, g, x + 6, y + 6, 20, 20);
    if (T && T.chuTrongKhung) {
      T.chuTrongKhung('Phúc lành của ải', x + 30, y + 5, w - 34, 10, { vien: [0, 0, 0, 0], align: 'left', size: 6.5, min: 6.5, dong: 1, bold: false, color: '#a9c2b4' });
      T.chuTrongKhung(b.ten, x + 30, y + 15, w - 34, 12, { vien: [0, 0, 0, 0], align: 'left', size: 7.5, min: 6.5, dong: 1, bold: true, color: '#f6dc92' });
      T.chuTrongKhung(b.cau, x + 6, y + 31, w - 12, h - 36, { vien: [0, 0, 0, 0], align: 'left', size: 7.5, min: 6.5, dong: 5, gian: 1.5, bold: false, color: '#f1e6c6' });
    }
  }
  const ve = SS.draw;
  SS.draw = function () {
    const r = ve.apply(this, arguments);
    const S = run();
    if (!S || !S.pl) return r;
    if (S.mode === 'phuclanh' && S.pl.opts) bangChon(S);
    else if (S.mode === 'paused' && S.pl.k) nhacTamDung(S);
    return r;
  };
  giuCo(SS.draw, ve);

  // ======================================================================
  // HIỆU ỨNG (chỉ chạy khi lượt ải đang có đúng phúc lành đó)
  // ======================================================================
  const MV = G.moves;
  const veHat = (x, y, col, n, sp) => { if (!G.noRender && G.burst) G.burst(x, y, col, n, sp); };
  function ganNhat(x, y, r, bo) {
    let best = null, bd = r;
    for (const e of G.targets()) {
      if (bo && bo.includes(e)) continue;
      const d = Math.hypot(e.x - x, (e.y - y) / ZK());
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  function quanh(x, y, r, fn, bo) { for (const e of G.targets()) if (e !== bo && Math.hypot(e.x - x, (e.y - y) / ZK()) < r + (e.r || 6)) fn(e); }
  function vung(W, x, y, r, life, el, src, every, them) { // cùng kiểu vũng "pool" của js/moves.js (vệt cháy, vũng độc) nên lớp vẽ có sẵn
    const mine = W.zones.filter((z) => z.he);
    const toiDa = (G.HE && G.HE.maxZones) || 6;
    if (mine.length >= toiDa) mine[0].dead = true;
    W.zones.push(Object.assign({ shape: 'circle', x: kep(x, W.x0, W.x1), y: kep(y, W.y0, W.y1), r, t: 0, pool: true, team: 'player', el, life, tick: 0.2, every, src, he: true, pl: true }, them || {}));
  }

  // --- đòn vũ khí: G.moves.hit (thời điểm đòn chạm) ---
  if (MV && MV.hit) {
    const goc = MV.hit;
    MV.hit = function (P) {
      const S = run(), k = S && S.pl ? S.pl.k : null;
      if (!k || !MV.state) return goc.apply(this, arguments);
      const mv = MV.state(P), o = mv && mv.cur, w = G.curW(P), W0 = G.getWorld(), n0 = W0 && W0.mvWaves ? W0.mvWaves.length : 0;
      const kq = goc.apply(this, arguments);
      if (!o || !w) return kq;
      const W = G.getWorld();
      try {
        if (k === 'guom' && w.type === 'sword' && o.kind === 'chem' && o.m && o.m.finish) guomPhong(W, P, w);
        else if (k === 'tre' && w.type === 'spear' && (o.kind === 'quet' || (o.kind === 'dam' && o.m && o.m.day))) treKeo(W, P, o);
        else if (k === 'riu' && w.type === 'hammer' && (o.kind === 'nen' || o.kind === 'nenDat') && W === W0) riuDuChan(W, P, o, n0);
      } catch (e) { console.error('Linh Khí: lỗi phúc lành (bỏ qua)', e); }
      return kq;
    };
    giuCo(MV.hit, goc);
  }
  function huongNham(P) { const ux = P.aimX != null ? P.aimX : P.face || 1, uy = P.aimX != null ? P.aimY || 0 : 0, l = Math.hypot(ux, uy) || 1; return [ux / l, uy / l]; }
  function guomPhong(W, P, w) {
    const [ux, uy] = huongNham(P), c = SO.guom, x = P.x + ux * 6, y = P.y + uy * 6 * ZK();
    (W.mvSp || (W.mvSp = [])).push({ kind: 'cres', x, y, x0: x, y0: y, ux, uy, left: c.tam, v: c.v, half: c.half, mult: c.mult, w, seen: [], he: null, walked: 0, pl: true });
  }
  function treKeo(W, P, o) {
    // Quét vòng: mọi quái trong vòng; nhát đâm thứ 3: quái trên đường đâm (phía trước, trong tầm). Bỏ cú đẩy ra, thay bằng kéo về sát chân.
    const c = SO.tre, quet = o.kind === 'quet', r = (o.reach || 44) + (quet ? 10 : 4), [ux, uy] = huongNham(P);
    for (const e of G.targets()) {
      const dx = P.x - e.x, dy = (P.y - e.y) / ZK(), d = Math.hypot(dx, dy);
      if (d > r + (e.r || 6) || d < 10) continue;
      if (!quet && (-dx * ux - dy * uy) / d < 0.6) continue;
      const q = Math.min(c.toiDa, (d - 10) * c.keo);
      e.kbVx = 0; e.kbVy = 0;
      if (G.kbDay && G.kbQuang) G.kbDay(e, dx, dy, G.kbQuang(q), true);
    }
  }
  function riuDuChan(W, P, o, n0) {
    // nện đất (giữ rồi thả) có sóng chấn: dư chấn là bản sao chạy ngược, 0,5 lần; nện thường (bấm): một sóng ngắn chạy ra sau lưng
    const c = SO.riu, ws = W.mvWaves || [], z = o.kind === 'nenDat' && ws.length > n0 ? ws[ws.length - 1] : null;
    const H = (G.MOVES.hammer && G.MOVES.hammer.charge) || {}, [ux, uy] = huongNham(P);
    const q = z ? { x: z.x, y: z.y, ux: -(z.ux != null ? z.ux : z.dir || 1), uy: -(z.uy || 0), left: z.left, v: z.v, depth: z.depth, mult: z.mult * c.mult, w: z.w }
      : { x: P.x, y: P.y, ux: -ux, uy: -uy, left: c.tamNen, v: H.waveV || 260, depth: H.waveDepth || 22, mult: ((o.m && o.m.mult) || 1) * c.multNen, w: G.curW(P) };
    (W.mvTimers || (W.mvTimers = [])).push({ t: c.tre, fn: () => {
      if (G.getWorld() !== W) return;
      (W.mvWaves || (W.mvWaves = [])).push({ x: q.x, y: q.y, ux: q.ux, uy: q.uy, dir: q.ux < 0 ? -1 : 1, left: q.left, v: q.v, depth: q.depth, mult: q.mult, stun: 0, w: q.w, seen: [], level: 1, he: null, pl: true });
      W.shake = Math.max(W.shake || 0, 0.1);
      G.sfx('boom', 2.1);
    } });
  }
  // --- đòn Đặc biệt: G.moves.special (gọi cho mọi vũ khí, sau khi combat.js đã tung đòn) ---
  if (MV && MV.special) {
    const goc = MV.special;
    MV.special = function (P) {
      const kq = goc.apply(this, arguments);
      if (coPL('trong')) { P.plTrong = G.time + SO.trong.giay; veHat(P.x, P.y - 8, '#ffd27a', 10, 50); }
      return kq;
    };
    giuCo(MV.special, goc);
  }
  // --- mỗi đòn trúng: G.moves.onHit (combat.js playerHit; o.w là vũ khí) ---
  if (MV && MV.onHit) {
    const goc = MV.onHit;
    MV.onHit = function (e, d, el, o) {
      const kq = goc.apply(this, arguments);
      const S = run(), k = S && S.pl ? S.pl.k : null;
      if (!k || !o || !o.w || e.dead) return kq;
      try {
        if (k === 'than') {
          S.pl.dem = (S.pl.dem || 0) + 1;
          if (S.pl.dem >= SO.than.moi) { S.pl.dem = 0; G.applyStatus(e, 'fire', d > 0 ? d : G.pDamage(S.P, o.w), 1); }
        } else if (k === 'trong' && S.P.plTrong > G.time && !e.isBoss && e.role !== 'mini' && e.st && !(e.plTrongT > G.time)) {
          // không choáng quái đang che kín đòn (vd Trai Sông Gai khép vỏ: choáng liên tục làm nó không bao giờ há vỏ → kẹt ải);
          // mỗi con chỉ bị Trống đồng làm choáng lại sau SO.trong.nghi giây (không khoá cứng)
          const giap = G.mobArmor ? G.mobArmor(e, { w: o.w, ranged: o.ranged }) : e.armor;
          if (!(giap >= 0.9)) { e.st.stun = Math.max(e.st.stun || 0, SO.trong.choang); e.plTrongT = G.time + SO.trong.nghi; }
        }
      } catch (er) { console.error('Linh Khí: lỗi phúc lành (bỏ qua)', er); }
      return kq;
    };
    giuCo(MV.onHit, goc);
  }
  // --- phi tiêu trúng quái: G.moves.arrowHit ---
  if (MV && MV.arrowHit) {
    const goc = MV.arrowHit;
    MV.arrowHit = function (o, e) {
      const kq = goc.apply(this, arguments);
      if (!coPL('no') || !o || o.kind !== 'arrow' || o.plNay || o.shard) return kq;
      o.plNay = true;
      const W = G.getWorld(), c = SO.no, t = ganNhat(e.x, e.y, c.tam, (o.seen || []).concat([e]));
      if (!t) return kq;
      const sp = Math.hypot(o.vx, o.vy) || 290, dx = t.x - e.x, dy = t.y - e.y, l = Math.hypot(dx, dy) || 1;
      W.projs.push({
        team: 'player', kind: 'arrow', x: e.x, y: e.y, px: e.x, py: e.y, fresh: true, z: o.z, vx: (dx / l) * sp, vy: (dy / l) * sp, t: l / sp + 0.15,
        w: o.w, mult: (o.mult || 1) * c.mult, pierce: 0, big: false, col: o.col, seen: [e], he: null, charged: 0, plNay: true,
      });
      return kq;
    };
    giuCo(MV.arrowHit, goc);
  }

  // --- né: bọc G.updatePlayer, nhận ra lúc bắt đầu / đang / hết lướt né ---
  if (G.updatePlayer) {
    const goc = G.updatePlayer;
    G.updatePlayer = function (P, inp, dt) {
      const S = run(), k = S && S.pl ? S.pl.k : null;
      if (!k || PL.LOAI_NE[k] !== true) return goc.apply(this, arguments);
      const d0 = P.dodgeT || 0;
      const kq = goc.apply(this, arguments);
      const W = G.getWorld();
      try {
        if (P.dodgeT > 0 && d0 <= 0) batDauNe(S, W, P, k);
        if (P.dodgeT > 0) dangNe(S, W, P, k);
        else if (d0 > 0) hetNe(S, W, P, k);
        if (k === 'song') hoiSac(P, dt);
      } catch (e) { console.error('Linh Khí: lỗi phúc lành (bỏ qua)', e); }
      return kq;
    };
    giuCo(G.updatePlayer, goc);
  }
  PL.LOAI_NE = { ngua: true, nui: true, song: true, ca: true, ngan: true };
  function batDauNe(S, W, P, k) {
    P.plNe = { x: P.x, y: P.y, n: 0, got: [] };
    if (k === 'song') {
      if (P.plSac > 0) { P.plSac = 0; P.plHoi = 1 * (P.dodgeCdMax || 1); P.dodgeCd = SO.song.cd; veHat(P.x, P.y, '#8fd0ff', 8, 50); }
    }
  }
  function hoiSac(P, dt) { if (P.plSac > 0) return; P.plHoi = (P.plHoi || 0) - dt; if (P.plHoi <= 0 && !(P.dodgeCd > 0)) P.plSac = 1; }
  function dangNe(S, W, P, k) {
    const q = P.plNe || (P.plNe = { x: P.x, y: P.y, n: 0, got: [] });
    if (k === 'ngua') {
      const c = SO.ngua;
      if (q.n < c.toiDa && Math.hypot(P.x - q.x, (P.y - q.y) / ZK()) >= (q.n ? c.buoc : 2)) {
        q.n++; q.x = P.x; q.y = P.y;
        vung(W, P.x, P.y + 2, c.r, c.song, 'fire', G.pDamage(P, G.curW(P)) * c.src, 0.5);
      }
    } else if (k === 'ca') {
      const c = SO.ca;
      for (const o of W.projs) {
        if (o.team === 'player' || !(o.t > 0)) continue;
        if (Math.hypot(o.x - P.x, (o.y - P.y) / ZK()) < c.r) { o.t = 0; P.mana = Math.min(P.maxmana, P.mana + c.mana); veHat(o.x, o.y, '#ffb040', 6, 40); }
      }
    } else if (k === 'ngan') {
      quanh(P.x, P.y, SO.ngan.r, (e) => { if (q.got.includes(e)) return; q.got.push(e); G.applyStatus(e, 'ice', G.pDamage(P, G.curW(P)), 1); });
    }
  }
  function hetNe(S, W, P, k) {
    if (k === 'nui') {
      const c = SO.nui;
      quanh(P.x, P.y, c.r, (e) => {
        if (G.kbDay && G.kbQuang) G.kbDay(e, e.x - P.x, (e.y - P.y) / ZK(), G.kbQuang(c.day), true);
        if (!e.isBoss && e.role !== 'mini' && e.st) e.st.stun = Math.max(e.st.stun || 0, c.choang);
      });
      veHat(P.x, P.y + 3, '#c9a46a', 12, 70);
      W.shake = Math.max(W.shake || 0, 0.08);
    }
    P.plNe = null;
  }

  // --- hệ: quái chết (Hỏa long) — bọc G.kill ---
  if (G.kill) {
    const goc = G.kill;
    let sau = 0;
    G.kill = function (e, o) {
      const chay = !!(e && !e.dead && e.st && e.st.fire > 0 && coPL('hoa'));
      const kq = goc.apply(this, arguments);
      if (chay && e.dead && !e.illusion && sau < 6) {
        sau++;
        try {
          const S = run(), P = S.P, w = G.curW(P), D = G.pDamage(P, w), c = SO.hoa;
          veHat(e.x, e.y, '#ff7a2a', 12, 70);
          quanh(e.x, e.y, c.r, (t) => { if (t.dead) return; G.applyStatus(t, 'fire', D, 1); G.damage(t, D * c.mult, { el: 'fire', src: 'hit', w }); }, e);
        } catch (er) { console.error('Linh Khí: lỗi phúc lành (bỏ qua)', er); } finally { sau--; }
      }
      return kq;
    };
    giuCo(G.kill, goc);
  }
  // --- hệ: gây hiệu ứng (Nọc Chằn tinh, Sương Mẫu Thoải) — bọc G.applyStatus ---
  if (G.applyStatus) {
    const goc = G.applyStatus;
    let sau = 0;
    G.applyStatus = function (t, el, src, stacks, ao) {
      const S = run(), k = S && S.pl ? S.pl.k : null;
      if ((k !== 'noc' && k !== 'suong') || !t || !t.st) return goc.apply(this, arguments);
      const bang0 = t.st.frozen > 0;
      const kq = goc.apply(this, arguments);
      if (t.dead || sau > 4) return kq;
      sau++;
      try {
        const W = G.getWorld(), P = S.P;
        if (k === 'noc' && el === 'poison' && t.st.poisonN >= SO.noc.tang && !t.plNoc) {
          t.plNoc = true;
          const c = SO.noc;
          vung(W, t.x, t.y + 2, c.r, c.song, 'poison', G.pDamage(P, G.curW(P)) * c.src, 1, { cloud: true });
        } else if (k === 'suong' && el === 'ice' && !bang0 && t.st.frozen > 0) {
          veHat(t.x, t.y, '#bfe8ff', 10, 60);
          quanh(t.x, t.y, SO.suong.r, (e) => { if (!e.dead) goc.call(this, e, 'ice', src, 1); }, t);
        }
      } catch (er) { console.error('Linh Khí: lỗi phúc lành (bỏ qua)', er); } finally { sau--; }
      return kq;
    };
    giuCo(G.applyStatus, goc);
  }
})();
