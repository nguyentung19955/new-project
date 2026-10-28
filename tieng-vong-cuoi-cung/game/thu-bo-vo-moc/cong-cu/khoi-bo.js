/* ======================= BỌ VỎ MỘC – khối thêm vào bản THỬ game/thu-bo-vo-moc/index.html =======================
   Quái thường mới (docs/gameplay/BO-QUAI-DE-XUAT.md): tiến chậm, húc ngắn; MAI cứng phía trước, BỤNG mềm phía sau.
   Vẽ từ 5 mảnh + JSON (art/huong-moi/quai-rig/bo-vo-moc/, QBR.napThem) – không sprite sheet.

   ĐỘNG TÁC bản 4 (chủ dự án chê "lật trang sách" / "bọ chết hoạt hình"; quy ước art/huong-moi/quai-rig/QUY-UOC-DONG-TAC-QUAI.md;
   chỉ hình, KHÔNG đổi luật / số): QUAY ĐẦU = hãm → lật gương TỨC THÌ ở bước 12 (+ bụi nhỏ ở chân) → mai nảy, bước tại chỗ, không co
   dẹt ngang; VỠ MAI / CHOÁNG = mai vỡ 3 mảng bật hé lệch lên trước, thân sụp sấp, chân run, lộ bụng; CHẾT = khựng, khuỵu, đổ sụp,
   mai tách 3 mảng trượt rơi, bụng xẹp, rồi TAN thành vụn vỏ cây + bụi bào tử xám ấm (1 s, bước 150 → 210 như cũ).
   HÌNH/VFX bản 3 (PHAN-HOI-4 mục 2–3, chỉ hình, không đổi luật): trúng bụng chớp ngắn + ấm chỉ ở bụng (giữ mảng tối / đường bao),
   tia trúng bụng nhỏ đặt ở bụng, thân co rõ hơn; đánh mai tia nhỏ sắc; chữ "Keng! Mai cứng" chỉ lần đầu (?huongdan=1: mỗi lần).

   LUẬT (số ở BO_SO, chỉnh được) – đã chỉnh theo PHẢN HỒI 3 (docs/gameplay/PHAN-HOI-3-KE-HOACH-V2-VA-BO-VO-MOC.md mục 3–4):
   - Đánh TRƯỚC MẶT (vào mai) → "Keng" + tia va chạm nhỏ trên mai, quái KHÔNG mất máu, chỉ trừ THẾ MAI (bản 5, thang ×10: đòn thường −10, nhát 3 −30, bóng × BONG_THE).
     Lam bị dội NHẸ: tổng 4 px trong 3 bước, KHÔNG khoá điều khiển, không đẩy vào hố, không xuyên vật.
   - Đánh TỪ SAU (vào bụng) → mất 10 máu (bóng 2), thân co lại.  Chém nảy (bổ xuống) tính theo CHỖ CHẠM:
     chạm phần bụng lộ phía sau = bụng, còn lại = mai (nảy lên được trên mai).
   - Thanh mai về 0 → VỠ MAI: mai vỡ bật hé lệch lên trước, thân SỤP SẤP (lộ mảng bụng mềm), choáng 120 bước (2 s) – lúc này đánh
     hướng nào cũng mất máu. (Trạng thái vẫn tên 'lat' / b.nam như cũ; bản 4 chỉ đổi HÌNH: không còn lật ngửa.)
     Nhát làm vỡ mai KHÔNG gây máu. PHẢN HỒI 5: mai vỡ MỘT lần, GIỮ VỠ sau khi đứng dậy tới chết (không "dậy lại → mai đầy",
    không tự hồi mai); hết choáng Bọ đứng dậy và tiếp tục đánh (báo trước + húc), mọi nhát vào nó (mọi hướng) đều mất máu.
   - CỘNG HƯỞNG (Lam + bóng ≤ 12 bước, công thức chung KE-HOACH-GAMEPLAY-V2 mục 6b): hai nhát xử lý như thường, rồi THÊM:
     mai vỡ ngay + máu thêm floor(CH_MAU × máu gốc nhát Lam) = 10, không bị mai chặn; khoá Cộng hưởng 45 bước. Bỏ luật riêng "mất 3 máu".
   - Các nhát trong CÙNG MỘT BƯỚC xét chặn theo trạng thái ĐẦU BƯỚC (mai còn / đã lật) → không phụ thuộc thứ tự duyệt.
     Thanh mai TÁCH RIÊNG khỏi Thế boss/tinh anh (PH1 mục 5) – đây chỉ là "vỏ cứng" của quái thường.
   - Lam ở trước mặt trong tầm → BÁO TRƯỚC 0,5 s (cúi đầu, rung mai, 2 tiếng gõ gỗ, CHÂN SAU CÀO ĐẤT + bụi, lóe cam đỏ, dấu "!")
     → LAO HÚC ngắn → hồi 0,67 s (lúc dễ vòng ra sau). Lam ở sau lưng lâu → quay đầu chậm (0,4 s).
   - Sát thương chạm: CHỈ cú húc chủ động. Chạm thân lúc đi / đứng / quay / hồi không mất máu.
   Không sửa demo.html: khối này được chèn vào bản thử bằng cong-cu/tao-tu-demo.py. */

/* ========== BẢN 5 (phản hồi 7 mục 3–4): DỮ LIỆU BỌ THEO THANG ×10 + CÔNG THỨC CHUNG (KE-HOACH-GAMEPLAY-V2 mục 6) ==========
   Một chỗ duy nhất cho số / luật Bọ để phiên P0-B nạp vào phòng D: LOAI_QUAI.bo (= BO_LOAI). Không khai báo lại CFG / LOAI_QUAI:
   - trang có khối P0-A (game/thu-p0a/cong-cu/khoi-p0a.js nạp TRƯỚC khối này) → dùng CFG chung của P0-A và gắn LOAI_QUAI.bo vào bảng chung;
   - trang thử riêng này (không có P0-A) → BO_CFG = bản sao đúng các hệ số chung (CH_MAU 1, CH_THE 0,5, BONG_MAU 0,25, BONG_THE 0,5,
     khoá Cộng hưởng 45, hitstop Cộng hưởng 8), LOAI_QUAI tạo mới chỉ có .bo.
   Bảng quy đổi (bản 4 → bản 5):  máu 4 → 40 · mai 4 nấc → Thế 40 · đòn thường [10 máu, 10 Thế] · nhát 3 [10, 30] (dao placeholder P0-A)
     bụng: −1 → −10 (vẫn 4 nhát) · mai: đòn thường −1 nấc → −10 Thế (vẫn 4 đòn) · nhát 3: −2 nấc → −30 Thế (nhanh hơn: nhát 3 + 1 đòn thường = vỡ)
     Cộng hưởng thêm floor(CH_MAU × máu gốc nhát Lam 10) = 10 (cũ: 1 trên 4 máu, cùng tỉ lệ) + vỡ mai ngay
     BÓNG (Vọng): máu floor(10 × 0,25) = 2 (bản 4: 1 = bằng Lam), Thế floor(10 × 0,5) = 5 (nhát 3: 15); vào mai còn nguyên → 0 máu, vẫn trừ Thế.
     Tối thiểu 1 máu chỉ khi máu gốc > 0 và không bị chặn (6b bước 5) → bóng KHÔNG còn mạnh bằng Lam.
   Thế Bọ = kiểu `mat` (mai chỉ che phía TRƯỚC) + phaMotLan (vỡ một lần, giữ vỡ tới chết – PH5). Khác quái gác `vo` một điểm đã chốt từ bản 2:
   đòn vào BỤNG (phía sau / chém nảy trúng phần bụng lộ) KHÔNG trừ Thế (truTheKhiTrungBung: false) – thanh mai chỉ mòn khi bị đánh vào mai. */
const BO_CFG = (typeof CFG !== 'undefined') ? CFG : {resWindow: (typeof P !== 'undefined' && P.resWindow) || 12, khoaCH: 45, hsCH: 8, CH_MAU: 1, CH_THE: 0.5,
  BONG_MAU: 0.25, BONG_THE: 0.5, hsKeng: 2, hsVo: 6, choangToiThieu: 45};
const THE_BO = {toiDa: 40, vo: false, mat: true, phaMotLan: true, hoiThe: false, truTheKhiTrungBung: false,
  vo_t: 30, choang: 120, hoiPhuc: 30, onDinh: 0, choHoi: 90, hoiMoi: 3, giamChoangLap: [1, 1, 1], cuaSoLap: 600, chThe: 'voNgay'};
// đòn Lam dùng khi trang KHÔNG có P0-A (PL_CS): dao placeholder P0-A, goc = [máu, Thế] thang ×10
const BO_DON_LAM = (typeof PL_CS !== 'undefined') ? PL_CS : {1: {goc: [10, 10]}, 2: {goc: [10, 10]}, 3: {goc: [10, 30]}, 4: {goc: [10, 10]}, 5: {goc: [10, 10]}, 6: {goc: [10, 10]}};
const BO_LOAI = {ten: 'Bọ Vỏ Mộc', mau: 40, the: THE_BO, nang: 'vua', than: [108, 62], anDon: [108, 62], vaiTro: 'mai-truoc-bung-sau',
  khongNgatSau: Infinity,   // PH7: CHƯA thêm chống ngắt sau mất mai (theo dõi). Như bản 4: mọi nhát gây máu (trừ lúc vỡ mai / sụp choáng) → khựng 'dau' 16 bước, kể cả đang báo trước / húc
  don: {huc: {id: 'huc', su: 30, ac: 24, re: 40, goc: [1, 0], hopHuc: 'nửa trước thân + đầu chìa 22 px', baoTruoc: 30,
    dauHinh: 'cúi đầu, rung mai, chân sau cào đất + bụi, lóe cam đỏ, dấu "!" (tắt bằng ?dauthan=0)', dauAm: '2 tiếng khép mai gõ gỗ (bước 12, 23)'}}};
if (typeof LOAI_QUAI === 'undefined') window.LOAI_QUAI = {};
LOAI_QUAI.bo = BO_LOAI;

const BO_SO = {
  W: 108, H: 62,          // hộp thân (px logic): đáy = mặt đất, giữa = điểm neo của rig
  mau: BO_LOAI.mau,       // 40 (thang ×10; bản 4: 4)
  mai: THE_BO.toiDa,      // Thế mai 40 (bản 4: 4 nấc). Đòn trừ goc[1] (thường 10, nhát 3 30; bóng × BONG_THE)
  nac: 4,                 // thanh mai VẼ 4 ô × 10 Thế (giữ hình bản 4)
  maiHoi: false,          // PH5: TẮT mai tự hồi (không có bộ đếm vô hình làm kín vỏ). Bật lại = cách cũ, chỉ để so
  maiHoiSau: 90,          // (khi maiHoi) không bị đánh vào mai 90 bước → bắt đầu hồi
  maiHoiMoi: 30,          // (khi maiHoi) rồi hồi 10 Thế mỗi 30 bước
  di: 0.6,                // px/bước (36 px/s) – khớp clip đi (chân không trượt)
  thay: 240, thayY: 90,   // thấy Lam phía TRƯỚC trong 240 px → báo trước húc
  bao: 30,                // báo trước 0,5 s
  huc: 24, hucV: 6.0,     // húc 24 bước × 6 px ≈ 144 px
  hoi: 40, hoiVaTuong: 60, cdHuc: 70,
  quay: 24, quaySau: 30,  // Lam ở sau lưng ≥ 30 bước (trong 300 px) → quay đầu 24 bước (lật hướng ở bước 12)
  keng: 14, dau: 16, lat: THE_BO.vo_t, choang: THE_BO.choang, day: THE_BO.hoiPhuc,   // 30 / 120 / 30 như bản 4
  doiLam: 4, doiMoi: 1.5, // Lam bị dội lùi khi chém vào mai: TỔNG 4 px (PH3: 3–5), tối đa 1,5 px/bước, không đụng pl.vx
  go: [12, 23]            // bước trong lúc báo trước có tiếng KHÉP MAI GÕ GỖ (khớp clip 'bao' ms 200 / 383)
};
const BO_BASE = '../../art/huong-moi/quai-rig/bo-vo-moc/';
const BO_Q = (() => { let q; try { q = new URLSearchParams(location.search); } catch (e) { q = new Map(); } return q; })();
const BO_THU = {xem: BO_Q.get('xem') === '1', mot: BO_Q.get('mot') === '1', batTu: BO_Q.get('battu') === '1', mau: BO_Q.get('mau') !== '0',
  ghi: BO_Q.get('ghi') === '1', vien: BO_Q.get('vien') !== '0',
  dauThan: BO_Q.get('dauthan') !== '0',   // ?dauthan=0: TẮT dấu "!" báo húc (so xem người mới có đọc được khép mai + cào chân không)
  huongDan: BO_Q.get('huongdan') === '1',   // ?huongdan=1 (PH4): chữ "Keng! Mai cứng" hiện mỗi lần mai chặn; mặc định chỉ LẦN ĐẦU
  // PH7: 3 chấm quay trên đầu lúc choáng CHỈ còn ở ?debug=… hoặc ?hitbox=1 (bản sạch: tư thế bất động + bụng lộ + một dấu nứt)
  chamQuay: BO_Q.has('debug') || BO_Q.get('hitbox') === '1'};

/* ---------- PHÒNG THỬ: phòng "Điểm lưu" (RD, 30 ô = đúng 1 màn) làm phẳng, chặn hai đầu ---------- */
RD.name = 'Phòng thử Bọ Vỏ Mộc';
fill(RD, 0, 0, RD.w - 1, 13, '.');                 // bỏ 2 bệ một chiều
fill(RD, 0, 0, 0, 13, 'S'); fill(RD, RD.w - 1, 0, RD.w - 1, 13, 'S');   // tường hai đầu (không sang phòng câu đố / boss)
BELLS[2].x = (RD.x0 + 3) * T + 16;                  // chuông lưu dời về đầu phòng (hồi sinh ở đây)

const BO = (() => {
  const D = 1000 / 60;
  const DS = [];
  let N = null, idxNut1 = -1, idxNut2 = -1;
  const SO = {nap: null};
  function mk(lx, face, minL, maxL) {
    return {kind: 'bo', sx: (RD.x0 + lx) * T, minX: (RD.x0 + minL) * T, maxX: (RD.x0 + maxL) * T, face0: face,
      x: 0, y: 0, w: BO_SO.W, h: BO_SO.H, px: 0, py: 0, face, vy: 0, kvx: 0, hp: BO_SO.mau, mai: BO_SO.mai, st: 'di', t: 0, at: 0, dist: 0,
      flash: 0, cd: 0, sau: 0, maiT: 0, swP: -1, swE: -1, lastP: -999, lastE: -999, fade: 1, dead: false, gone: false, H: null, info: '', hien: 0, nam: false,
      khoaCH: -1, tickT: -1, namDau: false, co: 0};
  }
  DS.push(mk(13, -1, 6, 17));
  if (!BO_THU.mot) DS.push(mk(23, -1, 18, 28));
  function datLai() {
    for (const b of DS) {
      b.x = b.sx - b.w / 2; b.y = FLOOR - b.h; b.px = b.x; b.py = b.y; b.face = b.face0; b.vy = 0; b.kvx = 0; b.hp = BO_SO.mau; b.mai = BO_SO.mai;
      b.st = BO_THU.xem ? 'xem' : 'di'; b.t = 0; b.at = 0; b.dist = 0; b.flash = 0; b.cd = 40; b.sau = 0; b.maiT = 0; b.swP = b.swE = -1;
      b.lastP = b.lastE = -999; b.fade = 1; b.dead = b.gone = false; b.H = null; b.hien = 0; b.nam = false; b.maiVo = false; b.voDau = false; b.khoaCH = -1; b.tickT = -1; b.co = 0;
    }
    DOI.con = 0; TIA.length = 0;
    if (BO_THU.xem) { DS[0].face = -1; if (DS[1]) DS[1].face = 1; }
    S.cp = BELLS[2]; BELLS[0].on = false; BELLS[2].on = true;
    placePlayer((RD.x0 + 3) * T + 6, FLOOR - pl.h); pl.drawT = 0; pl.face = 1;
  }
  function luuTruoc() { for (const b of DS) { b.px = b.x; b.py = b.y; } }

  /* ---------- NẠP: gói rig + đổi lớp "lóe vàng" thành CAM ĐỎ (màu báo nguy hiểm của hướng mới) ---------- */
  async function nap(tienDo) {
    const so = await QBR.napThem(BO_BASE, 'bo-vo-moc-rig.json', tienDo);
    N = QBR.json().nv.bo; idxNut1 = N.idx.nut1; idxNut2 = N.idx.nut2;
    const da = new Set();
    for (const n of Object.values(N.nut)) {
      const c = n.vang; if (!c || !c.getContext || da.has(c)) continue; da.add(c);
      const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.drawImage(n.img, 0, 0);
      g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.75; g.fillStyle = '#D8583A'; g.fillRect(0, 0, c.width, c.height);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    }
    /* PH4 mục 2: CHỚP KHI TRÚNG BỤNG – thay lớp "trắng" (bóng trắng đặc cả mảnh) bằng lớp chớp riêng của Bọ:
       mảnh BỤNG (cả bung_lo) chớp ẤM kem-mật mạnh; mai / đầu / chân chỉ hắt ấm rất nhẹ. Cả hai BỎ đường bao (mép 2 px ảnh)
       và mảng tối (độ sáng < 0,22) → giữ được khối tối + viền, vẫn thấy thân co. Tạo 1 lần lúc nạp, không xử lý pixel mỗi khung. */
    const chop = new Map();
    for (const [ten, n] of Object.entries(N.nut)) {
      if (!n.img || !n.trang) continue;
      const bung = ten === 'bung' || ten === 'bung_lo', key = n.img;
      if (chop.has(key) && !bung) { n.trang = chop.get(key); continue; }
      n.trang = lopChop(n.img, bung ? [246, 204, 150] : [236, 206, 166], bung ? 0.95 : 0.22); chop.set(key, n.trang);
    }
    SO.nap = so; return so;
  }
  function lopChop(img, rgb, manh) {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    let d; try { d = g.getImageData(0, 0, w, h); } catch (e) { g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgb(' + rgb + ')'; g.globalAlpha = manh; g.fillRect(0, 0, w, h); return c; }
    const A = d.data, o = new Uint8ClampedArray(A.length), R = 2;
    const dac = (x, y) => x >= 0 && y >= 0 && x < w && y < h && A[(y * w + x) * 4 + 3] > 140;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; if (A[i + 3] < 140) continue;
      if (!dac(x - R, y) || !dac(x + R, y) || !dac(x, y - R) || !dac(x, y + R)) continue;   // mép (đường bao) giữ nguyên
      const L = (0.299 * A[i] + 0.587 * A[i + 1] + 0.114 * A[i + 2]) / 255;
      const k = Math.max(0, Math.min(1, (L - 0.22) / 0.25));                                    // mảng tối giữ nguyên
      if (k <= 0) continue;
      o[i] = rgb[0]; o[i + 1] = rgb[1]; o[i + 2] = rgb[2]; o[i + 3] = Math.round(255 * manh * k);
    }
    d.data.set(o); g.putImageData(d, 0, 0); return c;
  }
  function chopBo(f) { return f > 0 ? Math.min(0.9, 0.2 + 0.25 * f) : 0; }   // 3 khung: 0,7 → 0,45 → 0,2 (cũ: 7 khung trắng 0,8/0,45)

  /* ---------- HOẠT HOẠ: trạng thái gameplay → clip (hoà từ tư thế đang hiện khi đổi clip, như QBR.capNhatQuai) ---------- */
  function smooth(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
  function tinh(H, frame, al, out) {
    const t = H.t - (1 - al) * H.r, P = H.tmp;
    QBR.mau('bo', H.clip, t, P);
    const w = H.bn > 0 ? smooth((frame - H.b0 + al) / (H.bn + 1)) : 1;
    if (w < 1) QBR.hoa(out, H.tu, P, w); else out.set(P);
    return out;
  }
  function dat(H, frame, clip, t, r, bn) {
    if (H.k !== clip) { if (H.k) tinh(H, frame - 1, 1, H.tu); else QBR.nghi('bo', H.tu); H.k = clip; H.b0 = frame; H.bn = bn; }
    H.clip = clip; H.t = t; H.r = r;
  }
  // ?xem=1: chuỗi clip (ms). 'quay' lật gương ở 200 ms như game; 'chet' 3600 ms = sụp + nằm im + tan vụn (bước 150 → 210 như game)
  const LAT_BUOC = Math.round(BO_SO.quay / 2);   // bước 12: lật gương tức thì
  const XEM = [['di', 2400], ['bao', 700], ['huc', 700], ['hoi', 900], ['quay', 700], ['keng', 600], ['dau', 600], ['vo_mai', 600], ['sup_choang', 2000], ['day', 700], ['dung', 1200], ['chet', 3600]];
  const CLIP_VO = new Set(['vo_mai', 'sup_choang', 'day', 'chet_sup']);   // clip tự vẽ mai vỡ (độ lệch riêng) – game không đè
  function anim(b, frame) {
    const H = b.H || (b.H = Object.assign(QBR.Hoat('bo'), {k: ''}));
    const t = b.t * D;
    switch (b.st) {
      case 'di': dat(H, frame, 'di', b.dist / (BO_SO.di * 60) * 1000, BO_SO.di / (BO_SO.di * 60) * 1000, 6); break;
      case 'bao': dat(H, frame, 'bao', t, D, 4); break;
      case 'huc': dat(H, frame, 'huc', t, D, 3); break;
      case 'hoi': dat(H, frame, 'hoi', t, D, 3); break;
      case 'quay': dat(H, frame, 'quay', t, b.t === LAT_BUOC ? 0 : D, 3); break;   // clip khoá mỗi bước; bước lật không nội suy với bước trước
      case 'keng': dat(H, frame, 'keng', t, D, 2); break;
      case 'dau': dat(H, frame, 'dau', t, D, 2); break;
      case 'lat': dat(H, frame, 'vo_mai', t, D, 2); break;
      case 'choang': dat(H, frame, 'sup_choang', t, D, 4); break;
      case 'day': dat(H, frame, 'day', t, D, 3); break;
      case 'chet': dat(H, frame, b.nam ? 'chet_sup' : 'chet', t, D, b.nam ? 4 : 2); break;
      case 'xem': { let tt = b.at * D, i = 0; const tong = XEM.reduce((s, x) => s + x[1], 0); tt %= tong; while (tt >= XEM[i][1]) { tt -= XEM[i][1]; i++; }
        const c = XEM[i][0], lb = Math.round(tt / D); b.xemT = lb;
        if (c === 'quay' && lb >= LAT_BUOC && !b.xemLat) { b.face *= -1; b.xemLat = true; } else if (c !== 'quay') b.xemLat = false;   // lật gương như game
        dat(H, frame, c, c === 'quay' ? lb * D : tt, c === 'quay' && lb === LAT_BUOC ? 0 : D, 4); b.xem = c; if (c === 'bao') b.xemBao = tt; break; }
      default: dat(H, frame, 'dung', b.at * D, D, 6);
    }
    H.info = b.st + ' t' + b.t + ' → ' + H.clip + ' ' + Math.round(H.t) + ' ms · máu ' + b.hp + '/' + BO_SO.mau + ' · mai ' + b.mai + '/' + BO_SO.mai;
  }

  /* ---------- CẬP NHẬT (mỗi bước logic, sau updateQuai) ---------- */
  const HUC = {x: 0, y: 0, w: 0, h: 0};
  /* Lam DỘI NHẸ khi chém mai (PH3): ngân sách 4 px, trả dần ≤ 1,5 px/bước bằng moveX (va vật thì dừng); không đặt pl.vx
     → không khoá điều khiển. Mép chân phía sau phải còn đất (không đẩy xuống hố); lúc nhảy / lướt / chết thì bỏ phần còn lại. */
  const DOI = {con: 0, huong: 0};
  function doiBuoc() {
    if (DOI.con <= 0) return;
    if (pl.dead || !pl.onGround || pl.dash > 0) { DOI.con = 0; return; }
    const d = Math.min(BO_SO.doiMoi, DOI.con), mep = DOI.huong < 0 ? pl.x - d : pl.x + pl.w + d;
    if (!solidPt(mep, pl.y + pl.h + 2)) { DOI.con = 0; return; }   // sau lưng là hố → không đẩy
    if (moveX(pl, DOI.huong * d, false)) { DOI.con = 0; return; }   // vướng vật → dừng
    DOI.con -= d;
  }
  /* TIA va chạm nhỏ NGAY TRÊN MAI khi bị chặn (vẽ bằng code, 6 bước) */
  const TIA = [];
  function diemMai(b, tx, ty, n) {   // điểm trên mặt mai gần chỗ chạm (toạ độ thế giới)
    const cx = b.x + b.w / 2, dat = b.y + b.h;
    if (n === 4) { const u = Math.max(-46, Math.min(30, tx - cx)); return [cx + u, dat - 72 + 0.012 * u * u]; }   // bổ xuống: đỉnh mai
    const y = Math.max(dat - 64, Math.min(dat - 30, ty)), k = (dat - 30 - y) / 34;                                  // ngang: mép trước mai
    return [cx + b.face * (44 - 16 * k), y];
  }
  function hopHuc(b) {   // vùng húc = nửa trước thân + đầu chìa ra 22 px
    HUC.w = b.w / 2 + 22; HUC.h = b.h - 8; HUC.y = b.y + 8; HUC.x = b.face < 0 ? b.x - 22 : b.x + b.w / 2; return HUC;
  }
  function goGo() { noise(0.05, 0.22, 'bandpass', 950); tone(260, 150, 0.08, 0.07, 'square'); }   // khép mai gõ gỗ (có dấu hình tương ứng)
  function choang() { bell(165, 1.2, 0.2); noise(0.25, 0.25, 'lowpass', 600); bell(990, 0.4, 0.06, 0.02, TINKP); }
  function doiTrangThai(b, st) { b.st = st; b.t = 0; }
  /* ---- VFX động tác bản 4 (chỉ hình). Màu: vỏ cây #39312E / #65503C / #A78046, bụi bào tử xám ấm – KHÔNG teal ---- */
  const VUN = ['#39312E', '#65503C', '#A78046', '#4A3E35'], BAO_TU = ['#8E857A', '#A39A8C', '#B8AE9F', '#7A7066'];
  function buiQuay(b) {   // bụi nhỏ ở chân lúc lật gương (che cú lật): 2 cụm thấp, sát đất, tắt nhanh
    const cx = b.x + b.w / 2, y = b.y + b.h;
    for (const k of [-34, 30]) for (let i = 0; i < 3; i++)
      part(cx + k + (Math.random() * 10 - 5), y - 1, (k < 0 ? -1 : 1) * (0.25 + Math.random() * 0.45), -0.15 - Math.random() * 0.3, 12 + (Math.random() * 6 | 0), BAO_TU[i % 4], 1.5, 0.02);
  }
  function vfxChet(b) {   // theo bước của trạng thái 'chet' (clip 1 s; tan vụn bước 150 → 210)
    const cx = b.x + b.w / 2, y = b.y + b.h, t = b.t;
    if (t === 18) { tone(150, 70, 0.25, 0.08, 'triangle'); noise(0.12, 0.12, 'bandpass', 700);   // mai nứt tách (gỗ khô, trầm)
      for (let i = 0; i < 6; i++) part(cx + (Math.random() * 60 - 30), y - 40 - Math.random() * 14, (Math.random() - 0.5) * 0.8, -0.3 - Math.random() * 0.4, 26 + (Math.random() * 10 | 0), VUN[i % 4], 2, 0.09); }
    if (t === 27 || t === 44) { const n = t === 27 ? 7 : 4;   // thân đổ chạm đất / mảng mai rơi chạm đất: bụi thấp, chậm
      if (t === 27) noise(0.22, 0.14, 'lowpass', 300);
      for (let i = 0; i < n; i++) part(cx + (Math.random() * 110 - 55), y - 2, (Math.random() - 0.5) * 0.7, -0.1 - Math.random() * 0.25, 30 + (Math.random() * 14 | 0), BAO_TU[i % 4], 2, 0.0); }
    if (t === 150) noise(0.6, 0.08, 'lowpass', 380);   // tan: tiếng xào xạc khô rất nhỏ
    if (t >= 150 && t < 206) {   // tan vụn: vụn vỏ rơi + bụi bào tử bay lên chậm, thưa dần
      const u = (t - 150) / 56, n = Math.random() < 1.6 * (1 - u) ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const px = cx + (Math.random() * 110 - 55), py = y - 4 - Math.random() * 40 * (1 - 0.6 * u);
        if (Math.random() < 0.5) part(px, py, (Math.random() - 0.5) * 0.4, 0.1, 18 + (Math.random() * 12 | 0), VUN[Math.random() * 4 | 0], 2, 0.06);
        else part(px, py, (Math.random() - 0.5) * 0.25, -0.12 - Math.random() * 0.18, 40 + (Math.random() * 20 | 0), BAO_TU[Math.random() * 4 | 0], 1.5, -0.002);
      }
    }
  }
  function capNhat1(b) {
    if (b.gone) return;
    if (b.flash > 0) b.flash--;
    b.vy = Math.min(b.vy + 0.6, 10); if (moveY(b, b.vy, false) !== 0) b.vy = 0;
    if (Math.abs(b.kvx) > 0.1) { if (moveX(b, b.kvx, false)) b.kvx = 0; b.kvx *= 0.78; }
    b.t++; b.at++;
    if (b.st === 'xem') { b.hien = 0; return; }
    const cx = b.x + b.w / 2, dx = (pl.x + pl.w / 2) - cx, dy = (pl.y + pl.h) - (b.y + b.h);
    const truoc = dx * b.face > 0, gan = Math.abs(dx) < BO_SO.thay && Math.abs(dy) < BO_SO.thayY;
    // mai hồi khi lâu không bị đánh vào mai (không hồi lúc đang choáng)
    if (BO_SO.maiHoi && !b.maiVo && b.st !== 'lat' && b.st !== 'choang' && b.st !== 'day' && b.st !== 'chet') {
      b.maiT++; if (b.mai < BO_SO.mai && b.maiT > BO_SO.maiHoiSau && (b.maiT - BO_SO.maiHoiSau) % BO_SO.maiHoiMoi === 0) b.mai = Math.min(BO_SO.mai, b.mai + 10);
    }
    if (b.hien > 0) b.hien--;
    switch (b.st) {
      case 'di': {
        if (b.cd > 0) b.cd--;
        const ax = b.face > 0 ? b.x + b.w + 2 : b.x - 2;
        const chan = moveX(b, b.face * BO_SO.di, false); if (!chan) b.dist += BO_SO.di;
        if (chan || !solidPt(ax, b.y + b.h + 4) || (b.face < 0 && b.x <= b.minX) || (b.face > 0 && b.x + b.w >= b.maxX)) { doiTrangThai(b, 'quay'); break; }
        if (!pl.dead && !S.won) {
          if (truoc && gan && b.cd <= 0) { doiTrangThai(b, 'bao'); sfx.warn(); break; }
          if (!truoc && Math.abs(dx) < 300 && Math.abs(dy) < BO_SO.thayY) { if (++b.sau >= BO_SO.quaySau) { b.sau = 0; doiTrangThai(b, 'quay'); } } else b.sau = 0;
        }
        break;
      }
      case 'bao':
        if (BO_SO.go.includes(b.t)) { goGo(); shake(0, 1, 0.5); }
        if (b.t >= 4 && b.t % 8 === 4) {   // chân sau CÀO ĐẤT: bụi + sỏi bắn ra sau (khớp nhịp cào trong clip 'bao')
          const rx = cx - b.face * 46, ry = b.y + b.h; dust(rx, ry, 3);
          for (let i = 0; i < 3; i++) part(rx, ry - 2, -b.face * (0.6 + Math.random() * 0.8), -0.6 - Math.random() * 0.7, 16, i ? '#65503C' : '#A78046', 1.5, 0.12);
        }
        if (b.t >= BO_SO.bao) { doiTrangThai(b, 'huc'); sfx.thud(); dust(cx - b.face * 40, b.y + b.h, 4); }
        break;
      case 'huc': {
        const ax = b.face > 0 ? b.x + b.w + 4 : b.x - 4;
        const vaTuong = !solidPt(ax, b.y + b.h + 4) || moveX(b, b.face * BO_SO.hucV, false);
        if (b.t % 6 === 0) dust(cx - b.face * 30, b.y + b.h, 3);
        if (vaTuong) { doiTrangThai(b, 'hoi'); b.t = -(BO_SO.hoiVaTuong - BO_SO.hoi); shake(b.face, 0, 2); sfx.thud(); break; }
        if (b.t >= BO_SO.huc) doiTrangThai(b, 'hoi');
        break;
      }
      case 'hoi':
        if (!truoc && Math.abs(dx) < 300) b.sau++;
        if (b.t >= BO_SO.hoi) { b.cd = BO_SO.cdHuc; if (b.sau >= 10) { b.sau = 0; doiTrangThai(b, 'quay'); } else doiTrangThai(b, 'di'); }
        break;
      case 'quay':
        if (b.t === Math.round(BO_SO.quay / 2)) { b.face *= -1; buiQuay(b); }   // lật gương TỨC THÌ (bản 4: + bụi nhỏ ở chân)
        if (b.t >= BO_SO.quay) { b.sau = 0; doiTrangThai(b, 'di'); b.cd = Math.max(b.cd, 20); }
        break;
      case 'keng': if (b.t >= BO_SO.keng) doiTrangThai(b, 'di'); break;
      case 'dau': if (b.t >= BO_SO.dau) { doiTrangThai(b, 'di'); b.cd = Math.max(b.cd, 24); } break;
      case 'lat': if (b.t >= BO_SO.lat) doiTrangThai(b, 'choang'); break;
      case 'choang': if (b.t >= BO_SO.choang) doiTrangThai(b, 'day'); break;
      case 'day': if (b.t >= BO_SO.day) { b.nam = false; b.maiT = 0; b.cd = 50; doiTrangThai(b, 'di'); } break;   // PH5: mai GIỮ VỠ (b.maiVo), đứng dậy đánh tiếp
      case 'chet': vfxChet(b); if (b.t > 150) b.fade = Math.max(0, 1 - (b.t - 150) / 60); if (b.t >= 210) { b.dead = true; b.gone = true; } break;
    }
    // sát thương chạm (PH3): CHỈ cú húc chủ động, dùng vùng húc (nửa trước + đầu chìa ra). Đi / đứng / quay / hồi: chạm thân không mất máu.
    if (!pl.dead && b.st === 'huc' && overlap(pl, hopHuc(b))) hurt(b.face);
    if (b.co > 0) b.co--;
  }
  function capNhat() {
    doiBuoc();
    for (let i = TIA.length - 1; i >= 0; i--) if (++TIA[i].t > 6) TIA.splice(i, 1);   // PH4: 9 → 6 bước
    for (const b of DS) { capNhat1(b); if (!b.gone) anim(b, S.frame); }
  }

  /* ---------- TRÚNG ĐÒN (gọi từ applyHits) ---------- */
  function trung1(b, hb, src, sw, face, n) {
    if (src === 'p') { if (b.swP === sw) return false; b.swP = sw; } else { if (b.swE === sw) return false; b.swE = sw; }
    // trạng thái ĐẦU BƯỚC: mọi nhát trúng trong cùng một bước xét chặn theo đây → kết quả không phụ thuộc thứ tự duyệt (PH3 mục 2)
    if (b.tickT !== S.frame) { b.tickT = S.frame; b.namDau = b.nam; b.voDau = b.maiVo; }
    let res = false;
    const moKhoa = S.frame >= b.khoaCH;
    // BẢN 5: số gốc của LẦN TRÚNG theo công thức chung (6b bước 2): Lam goc = [máu, Thế] của đòn n; bóng × BONG_MAU / BONG_THE
    const bong = src === 'e', goc = (BO_DON_LAM[n] || BO_DON_LAM[1]).goc;
    const mGoc = goc[0] * (bong ? BO_CFG.BONG_MAU : 1), tThe = Math.floor(goc[1] * (bong ? BO_CFG.BONG_THE : 1));
    let mauCoSo = 0;   // máu cơ sở Cộng hưởng = goc.máu nhát LAM (chưa chí mạng), ai trúng trước cũng dùng số này
    if (src === 'p') { if (moKhoa && S.frame - b.lastE <= BO_CFG.resWindow) res = true; b.lastP = S.frame; b.lastPMau = goc[0]; mauCoSo = goc[0]; }
    else { if (moKhoa && S.frame - b.lastP <= BO_CFG.resWindow) res = true; b.lastE = S.frame; mauCoSo = b.lastPMau || 0; }
    if (res) { b.lastP = b.lastE = -999; b.khoaCH = S.frame + BO_CFG.khoaCH; }
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const ix0 = Math.max(hb.x, b.x), ix1 = Math.min(hb.x + hb.w, b.x + b.w), iy0 = Math.max(hb.y, b.y), iy1 = Math.min(hb.y + hb.h, b.y + b.h);
    const tx = ix1 > ix0 ? (ix0 + ix1) / 2 : cx, ty = iy1 > iy0 ? (iy0 + iy1) / 2 : cy;
    const al = src === 'e' ? 0.6 : 1, a = ATK[n] || ATK[1];
    // bụng hay mai? Đang sụp choáng (đầu bước): bụng lộ hết. Đòn ngang: theo HƯỚNG đòn (đánh cùng chiều quái nhìn = từ sau lưng).
    // Chém nảy (4, bổ xuống): theo chỗ chạm – phần bụng lộ phía sau (x > bung_tu_x) là bụng.
    let bung;
    if (b.namDau || b.voDau) bung = true;   // PH5: mai đã vỡ (đầu bước) → không còn gì chặn, đánh hướng nào cũng vào thân
    else if (n === 4) bung = (tx - cx) * (-b.face) > N.bung_tu_x_logic;
    else bung = face === b.face;
    b.hien = 120;
    if (!bung) {
      // ---- MAI: keng, tia trên mai, dội nhẹ, KHÔNG mất máu, trừ thanh mai (nhát làm vỡ mai cũng không gây máu) ----
      // mai chặn máu (mat, phía trước, Thế đầu bước > 0 → 0 máu); trừ Thế = goc.Thế (bóng × BONG_THE). Nhát làm vỡ mai không gây máu
      if (!b.nam) b.mai = Math.max(0, b.mai - tThe);
      b.maiT = 0;
      const [mx, my] = diemMai(b, tx, ty, n);
      S.kengN++; sfx.keng(); hu('keng', mx, my, face < 0, {al: al * 0.7, k: 0.5});   // PH4: ảnh keng nhỏ lại (1 → 0,5)
      TIA.push({x: mx, y: my, f: -face, t: 0, al, nay: n === 4});
      S.hitstop = Math.max(S.hitstop, 3); shake(face, 0, 0.9);
      if (src === 'p' && n !== 4 && pl.onGround) { DOI.con = BO_SO.doiLam; DOI.huong = -face; }   // dội nhẹ, không đụng pl.vx
      if (!b.nam && b.mai <= 0) voMai(b, mx, my);
      else if (!b.nam) {
        // PH4: chữ chỉ LẦN ĐẦU (hoặc ?huongdan=1); sau đó chỉ âm + tia + dội nhẹ
        if (!res && (S.kengN <= 1 || BO_THU.huongDan)) popText(cx, b.y - 22, 'Keng! Mai cứng', '#F3E6C8');
        if (b.st === 'di' || b.st === 'hoi' || b.st === 'quay' || b.st === 'keng') { const f = b.face; doiTrangThai(b, 'keng'); b.face = f; }
      }
      if (res) congHuong(b, cx, cy, face, mauCoSo);
      return true;
    }
    // ---- BỤNG (hoặc đang sụp choáng / mai đã vỡ): mất 1 máu, thân CO lại, hiệu ứng "bụp" mềm – khác hẳn keng ----
    // PH4: chớp NGẮN (4 → hiện 3 khung), chỉ ấm mạnh ở bụng (lopChop); tia trúng NHỎ (0,85 → 0,38) đặt ở GIỮA BỤNG phía sau,
    // thấp hơn đầu và lệch khỏi lưỡi dao; vòng + hạt ấm, mềm, rơi chậm (đánh mai: tia sắc kem-trắng, ngắn)
    b.flash = 4; b.co = 10;
    let px = tx, py = ty;
    if (!b.namDau && !b.nam) { px = cx - b.face * b.w * 0.30; py = b.y + b.h * 0.58; }
    hu('trung_don', px, py, face < 0, {al: al * 0.85, k: 0.38});
    fx('ring', px, py, 6, '', 0, '#E2B47E');
    for (let i = 0; i < 5; i++) part(px, py, face * (0.3 + Math.random() * 0.7), -0.6 - Math.random() * 0.7, 20 + (Math.random() * 8 | 0), i % 2 ? '#E2B47E' : '#9C8468', 2, 0.10);
    noise(0.07, 0.2, 'lowpass', 520);   // "bụp" trầm (keng là tiếng kim cao)
    // 6b bước 5: làm tròn xuống, tối thiểu 1 CHỈ khi goc.máu > 0 (không bị chặn ở nhánh này) → Lam 10, bóng 2
    const m = goc[0] > 0 ? Math.max(1, Math.floor(mGoc)) : 0;
    if (m > 0) matMau(b, m, face, bong ? '#7FE0C8' : '#F2D69A');
    if (res) congHuong(b, cx, cy, face, mauCoSo);
    else if (!b.gone) { sfx.hit(); S.hitstop = Math.max(S.hitstop, src === 'e' ? Math.max(2, a.hs - 1) : a.hs); shake(a.sh[0] * face, a.sh[1], src === 'e' ? a.mag * 0.7 : a.mag); }
    return true;
  }
  function matMau(b, k, face, mau) {
    if (b.st === 'chet') return;
    b.hp -= k; popText(b.x + b.w / 2, b.y - 22, '−' + k, mau);
    if (b.hp <= 0) chet(b, face);
    else if (!b.nam && b.st !== 'lat') { const f = b.face; doiTrangThai(b, 'dau'); b.face = f; b.kvx = face * 3.2; }
  }
  /* CỘNG HƯỞNG theo công thức chung (V2 mục 6b): hai nhát đã xử lý như thường; THÊM: vỏ vỡ ngay + floor(CH_MAU × máu gốc nhát Lam),
     phần thêm không bị mai chặn. Không dùng resonance() của demo vì nó in "Cộng hưởng ×3". */
  function congHuong(b, x, y, face, mauCoSo) {
    if (!b.nam && !b.maiVo && b.st !== 'chet') voMai(b, x, y);   // PH5: mai đã vỡ thì không lật lại; chỉ cộng máu thêm
    S.resCount++; S.hitstop = Math.max(S.hitstop, BO_CFG.hsCH); lhRung(150); LH.chPulse = 40; sfx.res();
    hu('cong_huong', x, y, false, {k: S.resFirst ? 1 : 1.3});
    if (!S.resFirst) { S.resFirst = true; flash('#CEF0D6', 14); shake(0, -1, 4.5); banner('Cộng hưởng!'); } else { flash('#CEF0D6', 6); shake(0, -1, 3); }
    popText(x, y - 40, b.voDau ? 'Cộng hưởng' : 'Cộng hưởng: vỡ mai', '#CEF0D6');
    const them = Math.floor(BO_CFG.CH_MAU * mauCoSo);   // = 10 với dao placeholder
    if (them > 0) matMau(b, them, face, '#CEF0D6');
  }
  function voMai(b, x, y) {
    b.mai = 0; b.nam = true; b.maiVo = true; b.flash = 6; doiTrangThai(b, 'lat');
    choang(); S.hitstop = Math.max(S.hitstop, 6); shake(0, 1, 2.4);
    fx('ring', x, y, 18, '', 0, '#A78046'); burst(x, y, '#A78046', 10, 1.6); burst(x, y - 10, '#65503C', 8, 2);
    banner('Vỡ mai!');
  }
  function chet(b, face) {
    doiTrangThai(b, 'chet'); b.hp = 0; b.kvx = (face || 1) * 2.4; sfx.thud(); b.mai = 0;
    dropShards(b.x + b.w / 2, b.y + 30, 1);   // bản 4: bỏ shatter (vỡ tung) – xác sụp rồi tan vụn (vfxChet)
  }
  function trung(hb, src, sw, face, n) {
    let hit = false;
    for (const b of DS) { if (b.gone || b.st === 'chet' || b.st === 'xem' || !overlap(hb, b)) continue; if (trung1(b, hb, src, sw, face, n)) hit = true; }
    return hit;
  }
  function pogo(R) { for (const b of DS) if (!b.gone && b.st !== 'chet' && b.st !== 'xem' && overlap(R, b)) return true; return false; }

  /* ---------- VẼ ---------- */
  function veMot(b, al) {
    b.veX = undefined;
    if (b.gone || !b.H || !N) return;
    const xac = b.st === 'chet', mo = xac ? xacMo(b.t) : 1;   // PH7: xác mờ dần (1 → 0,7 ở bước 40 → 110), rồi tan như bản 4
    const x = lerp(b.px, b.x, al) + b.w / 2 - ox, y = lerp(b.py, b.y, al) + b.h - oy, lat = b.face > 0;
    if (x < -160 || x > W + 160) return;
    const t0 = performance.now();
    tinh(b.H, S.frame, ANIM_AL, b.H.cur);
    // lớp nứt mai theo thanh mai (mất 1–2 nấc: nứt nhẹ; ≥ 3: nứt nặng; vỡ / chết: nặng)
    const mat = (BO_SO.mai - b.mai) / BO_SO.mai * BO_SO.nac, P = b.H.cur;   // số "nấc" đã mất (Thế 10 = 1 nấc, như bản 4)
    P[idxNut1 * 8 + 7] = (mat >= 1 || b.nam) ? 1 : 0; P[idxNut2 * 8 + 7] = (mat >= 3 || b.nam) ? 1 : 0;
    // bản 4 + PH5: mai đã vỡ → vẽ 3 MẢNG mai lệch (giữ tới chết). Clip vỡ / choáng / dậy / chết-khi-sụp tự đặt độ lệch; clip thường: game đặt
    // LECH_DUNG (rig 'mai_vo_lech_dung'); clip 'chet' (đứng chết với mai đã vỡ): CỘNG độ lệch vào chuyển động trượt rơi của clip.
    const ck = b.H.k, voXem = b.st === 'xem' && (ck === 'chet' || CLIP_VO.has(ck));
    if ((b.maiVo || b.nam) && !CLIP_VO.has(ck) && !voXem) {
      P[N.idx.mai * 8 + 7] = 0; P[idxNut1 * 8 + 7] = 0; P[idxNut2 * 8 + 7] = 0;
      for (const [ten, l] of Object.entries(N.mai_vo_lech_dung)) { const o = N.idx[ten] * 8;
        if (ck === 'chet') { P[o] += l[0]; P[o + 1] += l[1]; P[o + 2] += l[2]; } else { P[o] = l[0]; P[o + 1] = l[1]; P[o + 2] = l[2]; }
        P[o + 7] = 1; }
    }
    ctx.globalAlpha = b.fade; if (b.st !== 'chet' && !(b.st === 'xem' && b.xem === 'chet' && b.xemT > 150)) bong(x, y - 1, 56, 0.32); ctx.globalAlpha = 1;
    let va = 0; const baoT = b.st === 'bao' ? b.t : (b.st === 'xem' && b.xem === 'bao' ? b.xemBao / D : -1);
    if (baoT >= 0) va = 0.10 + 0.26 * (0.5 + 0.5 * Math.sin(baoT * 0.9)) * Math.min(1, baoT / 8);   // lóe CAM ĐỎ lúc báo trước
    const tan = b.st === 'chet' ? (b.t - 150) / 60 : (b.st === 'xem' && b.xem === 'chet' ? (b.xemT - 150) / 60 : -1);
    if (tan > 0) { ctx.globalAlpha = mo; veTan(P, snap(x), snap(y), lat, Math.min(1, tan)); ctx.globalAlpha = 1; }
    else QBR.ve(ctx, 'bo', P, snap(x), snap(y), lat, {alpha: xac ? mo : b.fade, trang: chopBo(b.flash), vang: va});
    if (b.nam && b.st !== 'xem') veVetNut(b, x, y, lat);   // PH7: MỘT dấu nứt tĩnh trên mai lúc sụp choáng (thay 3 chấm quay)
    // dấu "!" + thanh mai / máu: KHÔNG vẽ ở đây – vẽ ở LỚP PHỦ sau mọi thân / xác (veLopPhu) để xác không che dấu báo của con khác
    b.veX = x; b.veY = y; b.veLat = lat; b.veBao = baoT;
    DO.qbT(performance.now() - t0);
  }
  function xacMo(t) { return 1 - 0.3 * Math.max(0, Math.min(1, (t - 40) / 70)); }
  function veLopPhu(b) {
    if (b.gone || !b.H || !N || b.veX === undefined) return;
    if (b.veBao >= 0 && BO_THU.dauThan) veDauThan(b.veX - (b.veLat ? -1 : 1) * 30, b.veY - 128, b.veBao);   // trên thanh mai / chấm máu (y − 92)
    if (b.st !== 'chet' && b.st !== 'xem') veThanh(b, b.veX, b.veY);
  }
  /* PH7 mục 3: MỘT vết nứt đứng yên trên mảng mai giữa lúc vỡ / sụp choáng (bản sạch – không chấm quay, không thanh nhấp nháy).
     Vạch răng cưa tối 2 px + mép sáng 1 px, hiện dần trong 6 bước đầu của 'lat', rồi đứng yên tới khi dậy. Toạ độ theo tư thế sụp
     (thân hạ ~12 px): mặt mảng giữa ở khoảng y − 53 (dưới đỉnh mai vài px). */
  const NUT_VACH = [[-7, -3], [-3, 1], [0, -2], [3, 2], [7, 0]];
  function veVetNut(b, x, y, lat) {
    const k = b.st === 'lat' ? Math.min(1, b.t / 6) : 1, s = lat ? -1 : 1, X = Math.round(x + s * 4), Y = Math.round(y - 53);
    ctx.save(); ctx.globalAlpha = 0.95 * k; ctx.lineJoin = 'miter'; ctx.lineCap = 'square';
    ctx.strokeStyle = '#0E0A09'; ctx.lineWidth = 2; ctx.beginPath();
    NUT_VACH.forEach(([u, v], i) => i ? ctx.lineTo(X + s * u, Y + v) : ctx.moveTo(X + s * u, Y + v)); ctx.stroke();
    ctx.strokeStyle = '#F2D69A'; ctx.globalAlpha = 0.7 * k; ctx.lineWidth = 1; ctx.beginPath();
    NUT_VACH.forEach(([u, v], i) => i ? ctx.lineTo(X + s * u, Y + v - 1.5) : ctx.moveTo(X + s * u, Y + v - 1.5)); ctx.stroke();
    ctx.restore();
  }
  /* TAN VỤN (bản 4): vẽ xác vào canvas phụ rồi khoét theo mặt nạ ô 3 px (ngẫu nhiên, phía trên tan trước) → vỡ thành vụn,
     12 mức tạo 1 lần; 40 % cuối mờ dần thêm. Không xử lý pixel mỗi khung. */
  const OW = 320, OH = 190, OD = 34, TAN_N = 12; let OC = null, OG = null, OK = 0; const MASK = [];
  function veTan(P, x, y, lat, u) {
    if (!OC || OK !== BK) {
      OC = document.createElement('canvas'); OC.width = Math.ceil(OW * BK); OC.height = Math.ceil(OH * BK); OG = OC.getContext('2d'); OK = BK;
      if (!MASK.length) { const bw = OW / 3 | 0, bh = OH / 3 | 0, v = new Float32Array(bw * bh);
        for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) v[j * bw + i] = 0.72 * Math.random() + 0.28 * (j / bh);
        for (let k = 1; k <= TAN_N; k++) { const c = document.createElement('canvas'); c.width = bw; c.height = bh; const g = c.getContext('2d'); g.fillStyle = '#000';
          for (let q = 0; q < v.length; q++) if (v[q] < k / TAN_N) g.fillRect(q % bw, q / bw | 0, 1, 1); MASK.push(c); } }
    }
    OG.setTransform(BK, 0, 0, BK, 0, 0); OG.globalCompositeOperation = 'source-over'; OG.clearRect(0, 0, OW, OH);
    QBR.ve(OG, 'bo', P, OW / 2, OH - OD, lat, {alpha: 1});
    const k = Math.min(TAN_N - 1, Math.floor(u * TAN_N));
    if (u > 0.04) { OG.globalCompositeOperation = 'destination-out'; OG.imageSmoothingEnabled = false; OG.drawImage(MASK[k], 0, 0, OW, OH); OG.globalCompositeOperation = 'source-over'; }
    const a = 1 - Math.max(0, (u - 0.6) / 0.4);
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(OC, x - OW / 2, y - (OH - OD), OW, OH); ctx.restore();
  }
  /* dấu "!" báo húc (PH3: rõ hơn): to gấp ~3 lần cũ (8×22 px), viền tối 2 px, bật lên lúc xuất hiện rồi nhấp theo 2 tiếng gõ mai.
     ?dauthan=0 tắt hẳn để so: chỉ còn cúi đầu + rung mai + chân cào + lóe cam đỏ + tiếng gõ. */
  function veDauThan(x, y, t) {
    const vao = Math.min(1, t / 5), bat = t < 8 ? -6 * Math.sin(Math.PI * t / 8) : 0, go = BO_SO.go.some(g => t >= g && t < g + 4) ? 2 : 0;
    const X = Math.round(x), Y = Math.round(y + bat + go);
    ctx.globalAlpha = vao;
    ctx.fillStyle = '#0C0F14'; ctx.fillRect(X - 6, Y - 2, 12, 18); ctx.fillRect(X - 6, Y + 17, 12, 10);
    ctx.fillStyle = '#E8653F'; ctx.fillRect(X - 4, Y, 8, 14); ctx.fillRect(X - 4, Y + 19, 8, 6);
    ctx.fillStyle = '#FFD7A8'; ctx.fillRect(X - 4, Y, 2, 9);   // mép sáng 2 px bên trái (không quầng)
    ctx.globalAlpha = 1;
  }
  /* tia va chạm trên mai (PH4: NHỎ, SẮC – khác hẳn bụp mềm ấm ở bụng): 4 vạch mảnh 1 px dài/ngắn xen kẽ, bay nhanh ra ngoài
     rồi tắt trong 6 bước, lõi 2 px chỉ 2 bước; màu kem trắng / đồng nhạt, không quầng, không teal */
  function veTia() {
    for (const k of TIA) {
      if (k.t > 6) continue;
      const u = k.t / 6, X = k.x - ox, Y = k.y - oy;
      ctx.globalAlpha = k.al * (1 - u * u); ctx.lineWidth = 1; ctx.lineCap = 'butt';
      for (let i = 0; i < 4; i++) {
        const g = (k.nay ? -Math.PI / 2 : (k.f > 0 ? 0 : Math.PI) - k.f * 0.35) + (i - 1.5) * 0.5;   // ngang: toả về phía người đánh, chếch lên
        const c = Math.cos(g), d = Math.sin(g), dai = i % 2 ? 5 : 8, L0 = 2 + 7 * Math.min(1, u * 2.5), L1 = L0 + dai * (1 - u);
        ctx.strokeStyle = i % 2 ? '#E9CF98' : '#FFF6E2';
        ctx.beginPath(); ctx.moveTo(X + c * L0, Y + d * L0); ctx.lineTo(X + c * L1, Y + d * L1); ctx.stroke();
      }
      if (k.t < 2) { ctx.fillStyle = '#FFF6E2'; ctx.fillRect(Math.round(X) - 1, Math.round(Y) - 1, 2, 2); }
    }
    ctx.globalAlpha = 1;
  }
  // thanh MAI (đồng cũ, 4 nấc) trên đầu: chỉ hiện khi đã bị đánh / đang mất nấc; vỡ → 3 chấm sáng quay (choáng) + thanh hồi
  function veThanh(b, x, y) {
    const top = y - 92;
    if (b.nam) {
      if (BO_THU.chamQuay) for (let i = 0; i < 3; i++) {   // PH7: chỉ ở ?debug / ?hitbox=1 const a = S.frame * 0.1 + i * 2.094, sx = Math.cos(a) * 26, sy = Math.sin(a) * 5;
        ctx.globalAlpha = 0.9; ctx.fillStyle = '#0C0F14'; ctx.fillRect(x + sx - 3, top + 30 + sy - 3, 6, 6); ctx.fillStyle = i % 2 ? '#F2D69A' : '#A78046'; ctx.fillRect(x + sx - 2, top + 30 + sy - 2, 4, 4); }
      ctx.globalAlpha = 1;
      if (b.st === 'choang') { const k = b.t / BO_SO.choang; ctx.fillStyle = 'rgba(12,15,20,.7)'; ctx.fillRect(x - 25, top + 6, 50, 5); ctx.fillStyle = '#65503C'; ctx.fillRect(x - 24, top + 7, 48 * k, 3); }
      if (BO_THU.mau) veMau(b, x, top + 14);
      return;
    }
    if (b.maiVo) {   // PH5: đứng dậy với mai đã vỡ – thanh mai rỗng có gạch chéo đồng, giữ tới chết
      const n = BO_SO.nac, w = 11, g = 2, x0 = x - (n * w + (n - 1) * g) / 2; ctx.globalAlpha = 0.85;
      ctx.fillStyle = 'rgba(12,15,20,.75)'; ctx.fillRect(x0 - 2, top - 2, n * w + (n - 1) * g + 4, 8);
      for (let i = 0; i < n; i++) { ctx.fillStyle = '#2a2622'; ctx.fillRect(x0 + i * (w + g), top, w, 4); ctx.fillStyle = '#A78046'; ctx.fillRect(x0 + i * (w + g) + 4, top, 2, 4); }
      ctx.globalAlpha = 1; if (BO_THU.mau) veMau(b, x, top + 8); return; }
    if (b.hien <= 0 && b.mai >= BO_SO.mai) return;
    const a = b.hien > 0 ? Math.min(1, b.hien / 20) : 0.55; ctx.globalAlpha = a;
    const n = BO_SO.nac, w = 11, g = 2, x0 = x - (n * w + (n - 1) * g) / 2, moi = BO_SO.mai / n;   // 4 ô × 10 Thế; ô dở vẽ một phần
    ctx.fillStyle = 'rgba(12,15,20,.75)'; ctx.fillRect(x0 - 2, top - 2, n * w + (n - 1) * g + 4, 8);
    for (let i = 0; i < n; i++) { const f = Math.max(0, Math.min(1, (b.mai - i * moi) / moi)), wf = Math.round(w * f);
      ctx.fillStyle = '#2a2622'; ctx.fillRect(x0 + i * (w + g), top, w, 4);
      if (wf > 0) { ctx.fillStyle = '#A78046'; ctx.fillRect(x0 + i * (w + g), top, wf, 4); ctx.fillStyle = '#F2D69A'; ctx.globalAlpha = a * 0.6; ctx.fillRect(x0 + i * (w + g), top, wf, 1); ctx.globalAlpha = a; } }
    if (BO_THU.mau) veMau(b, x, top + 8);
    ctx.globalAlpha = 1;
  }
  function veMau(b, x, y) {   // máu (chỉ bản thử, ?mau=0 tắt): chấm nhỏ đỏ trầm
    const n = 4, moi = BO_SO.mau / n, x0 = x - (n * 6 - 2) / 2; ctx.fillStyle = 'rgba(12,15,20,.7)'; ctx.fillRect(x0 - 2, y - 1, n * 6 + 2, 5);   // 4 chấm × 10 máu
    for (let i = 0; i < n; i++) { const f = Math.max(0, Math.min(1, (b.hp - i * moi) / moi)), wf = Math.round(4 * f);
      ctx.fillStyle = '#3a2a26'; ctx.fillRect(x0 + i * 6, y, 4, 3); if (wf > 0) { ctx.fillStyle = '#B4553E'; ctx.fillRect(x0 + i * 6, y, wf, 3); } }
  }
  /* PH7 mục 3 – thứ tự vẽ: XÁC (đang chết / tan) vẽ TRƯỚC, ở lớp sau quái sống (veXac được gọi trước drawQuai); con sống vẽ sau;
     dấu "!" + thanh của mọi con vẽ CUỐI → xác không bao giờ che dấu báo / thân của con khác. Bình máu rơi vẽ sau mọi quái (drawHazards). */
  function veXac(al) { for (const b of DS) if (b.st === 'chet') veMot(b, al); }
  function ve(al) { for (const b of DS) if (b.st !== 'chet') veMot(b, al); for (const b of DS) veLopPhu(b); veTia(); }
  function veHitbox(al) {
    for (const b of DS) { if (b.gone || !b.H) continue; const bx = lerp(b.px, b.x, al), by = lerp(b.py, b.y, al), d = bx - b.x;
      if (b.st === 'chet') { hbRect(bx, by, b.w, b.h, '#8a8a8a', 'dash'); hbChu('xác: không ăn đòn, không gây hại', bx - ox - 40, by - oy - 120, '#bbbbbb'); continue; }   // PH7
      hbRect(bx, by, b.w, b.h, b.nam || b.maiVo ? '#78e68c' : '#4fb4ff');
      if (!b.nam && !b.maiVo) { const bx0 = b.face < 0 ? bx + b.w / 2 + N.bung_tu_x_logic : bx; hbRect(bx0, by + 10, b.w / 2 - N.bung_tu_x_logic, b.h - 10, '#78e68c', 'dash'); }   // phần bụng lộ (chém nảy)
      if (b.st === 'bao' || b.st === 'huc') { hopHuc(b); hbRect(HUC.x + d, HUC.y, HUC.w, HUC.h, b.st === 'huc' ? '#ff4a4a' : '#ffa640', b.st === 'huc' ? 'fill' : 'dash'); }
      hbChu(b.H.info, bx - ox - 40, by - oy - 120, '#f6d0f6'); }
  }
  return {DS, SO, nap, datLai, luuTruoc, capNhat, trung, pogo, ve, veXac, veHitbox, LOAI: BO_LOAI, get N() { return N; }};
})();

/* ---------- hướng dẫn 1 dòng trong phòng thử ---------- */
HINT.bo = 'Mai cứng phía trước dội đòn – vòng ra sau đánh bụng, hoặc chém mai tới vỡ rồi đánh lúc nó sụp xuống';
const _boHint = hintNow;
hintNow = function () { return ROOMS[S.room] === RD ? 'bo' : _boHint(); };
/* ---------- bất tử khi quay thử (?battu=1) ---------- */
const _boHurt = hurt;
hurt = function (dir) { if (BO_THU.batTu && pl.hp <= 1) pl.hp = 2; _boHurt(dir); };

/* ======================= THỬ (không ghép vào demo.html): bot + API quay / chụp ======================= */
const BO_BOT = {on: false, kieu: '', t: 0, pha: '', nhay: 0, luot: 0, xong: false, daNe: false};
function boMucTieu() { let m = null, d = 1e9; for (const b of BO.DS) { if (b.gone || b.st === 'chet') continue; const k = Math.abs(b.x + b.w / 2 - pl.x - pl.w / 2); if (k < d) { d = k; m = b; } } return m; }
/* kiểu 'mai': đứng trước mặt chém mai tới vỡ (lùi xa khi nó báo trước húc), rồi chém lúc nó sụp choáng
   kiểu 'vong': chờ nó húc, LƯỚT xuyên qua ra sau lưng, chém bụng */
function boBotBuoc() {
  if (!BO_BOT.on) return;
  for (const k of KEYS) kb[k] = 0;
  BO_BOT.t++;
  const b = boMucTieu(); if (!b || pl.dead) { BO_BOT.xong = true; return; }
  const cx = b.x + b.w / 2, lx = pl.x + pl.w / 2, dx = cx - lx, ad = Math.abs(dx), ve = dx > 0 ? 'r' : 'l', xa = dx > 0 ? 'l' : 'r';
  const truoc = (lx - cx) * b.face > 0;       // Lam đang ở phía trước quái
  const danh = () => { if (pl.atkN === 0 && BO_BOT.t % 2 === 0) kb.a = 1; };
  if (b.nam && BO_BOT.kieu === 'mai' && b.hp <= 20) { if (ad < 170) kb[xa] = 1; return; }   // PH5 (video): để lại 2 máu, lùi chờ Bọ dậy
  if (b.nam) { if (ad > 70) kb[ve] = 1; else { pl.face = dx > 0 ? 1 : -1; danh(); } return; }
  if (BO_BOT.kieu === 'mai') {
    if (b.maiVo && b.st === 'hoi') BO_BOT.daNe = true;
    if (b.maiVo && !BO_BOT.daNe && !(b.st === 'bao' || b.st === 'huc')) { if (ad < 200) kb[xa] = 1; else if (ad > 230) kb[ve] = 1; return; }   // PH5 (video): chờ Bọ (mai vỡ) báo trước + húc lại một lần
    if (truoc && (b.st === 'bao' || b.st === 'huc')) { kb[xa] = 1; if (b.st === 'huc' && ad < 150 && pl.onGround) kb.j = 1; return; }   // lùi + nhảy tránh
    if (!truoc) { kb[ve] = 1; return; }
    if (ad > 96) kb[ve] = 1; else { pl.face = dx > 0 ? 1 : -1; danh(); }
    return;
  }
  // 'vong'
  if (!truoc) { if (ad > 92) kb[ve] = 1; else if (ad < 70) kb[xa] = 1; else { pl.face = dx > 0 ? 1 : -1; danh(); } return; }
  if (b.st === 'huc' && ad < 110 && pl.dash <= 0) { kb[ve] = 1; kb.s = 1; return; }   // lướt xuyên qua lúc nó lao tới (miễn sát thương khi lướt)
  if (b.st === 'bao' || b.st === 'huc') return;                                         // đứng chờ cú húc
  if (ad > 180) kb[ve] = 1; else if (ad < 150) kb[xa] = 1;
}
const _boStep = step;
step = function () { boBotBuoc(); _boStep(); };
if (BO_THU.ghi) loop = function () {};
window.TVTHU = {
  bo: BO, so: BO_SO, bot: BO_BOT, loai: BO_LOAI, cfg: BO_CFG,
  async batDau() { while (!(window.TVDEMO && TVDEMO.ready && loadEl.hidden)) await wait(50); audioInit(); startEl.hidden = true; S.paused = false; document.getElementById('warn').hidden = true; },
  anUI(v) { let st = document.getElementById('bo-an'); if (!st) { st = document.createElement('style'); st.id = 'bo-an'; document.head.appendChild(st); }
    st.textContent = v ? '#hint,#keys,#toast,.ui:not(.panel),button:not(#btn-start){visibility:hidden!important}' : ''; },
  khung(n) { for (let i = 0; i < (n || 1); i++) { savePrev(); step(); } render(1);
    return {f: S.frame, lam: [+(pl.x + pl.w / 2).toFixed(1), pl.hp], bo: BO.DS.map(b => [b.st, b.t, b.hp, b.mai, b.face, +(b.x + b.w / 2).toFixed(1), b.gone ? 1 : 0]), xong: BO_BOT.xong}; },
  batBot(kieu) { Object.assign(BO_BOT, {on: true, kieu, t: 0, xong: false, daNe: false}); },
  tatBot() { BO_BOT.on = false; for (const k of KEYS) kb[k] = 0; },
  datLam(x, f) { placePlayer(x - pl.w / 2, FLOOR - pl.h); pl.drawT = 0; pl.face = f || 1; },
  datBo(i, x, f, st) { const b = BO.DS[i]; b.x = x - b.w / 2; b.px = b.x; b.face = f; if (st) { b.st = st; b.t = 0; } b.H = null; },
  anBo(i) { BO.DS[i].gone = true; },
  phim(k, v) { kb[k] = v ? 1 : 0; },
  doVe(n) { DO.reset(); for (let i = 0; i < n; i++) { savePrev(); step(); render(1); } const a = DO.ds.slice().sort((p, q) => p - q);
    return {n: a.length, tb: +(DO.tong / DO.n).toFixed(3), p95: +a[Math.floor(a.length * 0.95)].toFixed(3), max: +DO.max.toFixed(3), quaiTb: +(DO.qb / DO.n).toFixed(3)}; },
  thongSo() { return {nap: BO.SO.nap, hm: (typeof HM !== 'undefined') ? HM.SO : null, bk: BK}; }
};
