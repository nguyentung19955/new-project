/* ======================= BỌ VỎ MỘC – khối thêm vào bản THỬ game/thu-bo-vo-moc/index.html =======================
   Quái thường mới (docs/gameplay/BO-QUAI-DE-XUAT.md): tiến chậm, húc ngắn; MAI cứng phía trước, BỤNG mềm phía sau.
   Vẽ từ 5 mảnh + JSON (art/huong-moi/quai-rig/bo-vo-moc/, QBR.napThem) – không sprite sheet.

   LUẬT (số ở BO_SO, chỉnh được) – đã chỉnh theo PHẢN HỒI 3 (docs/gameplay/PHAN-HOI-3-KE-HOACH-V2-VA-BO-VO-MOC.md mục 3–4):
   - Đánh TRƯỚC MẶT (vào mai) → "Keng" + tia va chạm nhỏ trên mai, quái KHÔNG mất máu, chỉ trừ THANH MAI (đòn thường −1, nhát 3 −2).
     Lam bị dội NHẸ: tổng 4 px trong 3 bước, KHÔNG khoá điều khiển, không đẩy vào hố, không xuyên vật.
   - Đánh TỪ SAU (vào bụng) → mất 1 máu, thân co lại.  Chém nảy (bổ xuống) tính theo CHỖ CHẠM:
     chạm phần bụng lộ phía sau = bụng, còn lại = mai (nảy lên được trên mai).
   - Thanh mai về 0 → VỠ MAI: lật ngửa (lộ mảng bụng mềm), choáng 120 bước (2 s) – lúc này đánh hướng nào cũng mất máu.
     Nhát làm vỡ mai KHÔNG gây máu. Dậy lại thì mai đầy. Không bị đánh 1,5 s → mai hồi dần.
   - CỘNG HƯỞNG (Lam + bóng ≤ 12 bước, công thức chung KE-HOACH-GAMEPLAY-V2 mục 6b): hai nhát xử lý như thường, rồi THÊM:
     mai vỡ ngay + máu thêm floor(CH_MAU × máu gốc nhát Lam) = 1, không bị mai chặn; khoá Cộng hưởng 45 bước. Bỏ luật riêng "mất 3 máu".
   - Các nhát trong CÙNG MỘT BƯỚC xét chặn theo trạng thái ĐẦU BƯỚC (mai còn / đã lật) → không phụ thuộc thứ tự duyệt.
     Thanh mai TÁCH RIÊNG khỏi Thế boss/tinh anh (PH1 mục 5) – đây chỉ là "vỏ cứng" của quái thường.
   - Lam ở trước mặt trong tầm → BÁO TRƯỚC 0,5 s (cúi đầu, rung mai, 2 tiếng gõ gỗ, CHÂN SAU CÀO ĐẤT + bụi, lóe cam đỏ, dấu "!")
     → LAO HÚC ngắn → hồi 0,67 s (lúc dễ vòng ra sau). Lam ở sau lưng lâu → quay đầu chậm (0,4 s).
   - Sát thương chạm: CHỈ cú húc chủ động. Chạm thân lúc đi / đứng / quay / hồi không mất máu.
   Không sửa demo.html: khối này được chèn vào bản thử bằng cong-cu/tao-tu-demo.py. */

const BO_SO = {
  W: 108, H: 62,          // hộp thân (px logic): đáy = mặt đất, giữa = điểm neo của rig
  mau: 4,                 // máu (nhát Lam = 1; Cộng hưởng thêm floor(chMau × mauGoc))
  mai: 4,                 // thanh mai
  maiNhat3: 2,            // nhát 3 (đòn nặng) trừ 2 nấc mai
  maiHoiSau: 90,          // không bị đánh vào mai 90 bước → bắt đầu hồi
  maiHoiMoi: 30,          // rồi hồi 1 nấc mỗi 30 bước
  di: 0.6,                // px/bước (36 px/s) – khớp clip đi (chân không trượt)
  thay: 240, thayY: 90,   // thấy Lam phía TRƯỚC trong 240 px → báo trước húc
  bao: 30,                // báo trước 0,5 s
  huc: 24, hucV: 6.0,     // húc 24 bước × 6 px ≈ 144 px
  hoi: 40, hoiVaTuong: 60, cdHuc: 70,
  quay: 24, quaySau: 30,  // Lam ở sau lưng ≥ 30 bước (trong 300 px) → quay đầu 24 bước (lật hướng ở bước 12)
  keng: 14, dau: 16, lat: 30, choang: 120, day: 30,   // PH3: choáng 3 s → 2 s (120 bước)
  doiLam: 4, doiMoi: 1.5, // Lam bị dội lùi khi chém vào mai: TỔNG 4 px (PH3: 3–5), tối đa 1,5 px/bước, không đụng pl.vx
  mauGoc: 1, chMau: 1,    // máu gốc nhát Lam / hệ số CH_MAU (CFG mục 6a) → Cộng hưởng thêm floor(1 × 1) = 1 máu
  khoaCH: 45,             // khoá Cộng hưởng trên cùng con 45 bước (6b)
  go: [12, 23]            // bước trong lúc báo trước có tiếng KHÉP MAI GÕ GỖ (khớp clip 'bao' ms 200 / 383)
};
const BO_BASE = '../../art/huong-moi/quai-rig/bo-vo-moc/';
const BO_Q = (() => { let q; try { q = new URLSearchParams(location.search); } catch (e) { q = new Map(); } return q; })();
const BO_THU = {xem: BO_Q.get('xem') === '1', mot: BO_Q.get('mot') === '1', batTu: BO_Q.get('battu') === '1', mau: BO_Q.get('mau') !== '0',
  ghi: BO_Q.get('ghi') === '1', vien: BO_Q.get('vien') !== '0',
  dauThan: BO_Q.get('dauthan') !== '0'};   // ?dauthan=0: TẮT dấu "!" báo húc (so xem người mới có đọc được khép mai + cào chân không)

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
      b.lastP = b.lastE = -999; b.fade = 1; b.dead = b.gone = false; b.H = null; b.hien = 0; b.nam = false; b.khoaCH = -1; b.tickT = -1; b.co = 0;
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
    SO.nap = so; return so;
  }

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
  const XEM = [['di', 2400], ['bao', 700], ['huc', 700], ['hoi', 900], ['quay', 600], ['keng', 600], ['dau', 600], ['lat', 700], ['lat_giu', 1800], ['day', 700], ['dung', 1200], ['chet', 1700]];
  function anim(b, frame) {
    const H = b.H || (b.H = Object.assign(QBR.Hoat('bo'), {k: ''}));
    const t = b.t * D;
    switch (b.st) {
      case 'di': dat(H, frame, 'di', b.dist / (BO_SO.di * 60) * 1000, BO_SO.di / (BO_SO.di * 60) * 1000, 6); break;
      case 'bao': dat(H, frame, 'bao', t, D, 4); break;
      case 'huc': dat(H, frame, 'huc', t, D, 3); break;
      case 'hoi': dat(H, frame, 'hoi', t, D, 3); break;
      case 'quay': dat(H, frame, 'quay', t, D, 3); break;
      case 'keng': dat(H, frame, 'keng', t, D, 2); break;
      case 'dau': dat(H, frame, 'dau', t, D, 2); break;
      case 'lat': dat(H, frame, 'lat', t, D, 2); break;
      case 'choang': dat(H, frame, 'lat_giu', t, D, 4); break;
      case 'day': dat(H, frame, 'day', t, D, 3); break;
      case 'chet': dat(H, frame, b.nam ? 'chet_lat' : 'chet', t, D, b.nam ? 4 : 2); break;
      case 'xem': { let tt = b.at * D, i = 0; const tong = XEM.reduce((s, x) => s + x[1], 0); tt %= tong; while (tt >= XEM[i][1]) { tt -= XEM[i][1]; i++; }
        const c = XEM[i][0]; dat(H, frame, c, tt, D, 4); b.xem = c; if (c === 'bao') b.xemBao = tt; break; }
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
  /* TIA va chạm nhỏ NGAY TRÊN MAI khi bị chặn (vẽ bằng code, 9 bước) */
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
    if (b.st !== 'lat' && b.st !== 'choang' && b.st !== 'day' && b.st !== 'chet') {
      b.maiT++; if (b.mai < BO_SO.mai && b.maiT > BO_SO.maiHoiSau && (b.maiT - BO_SO.maiHoiSau) % BO_SO.maiHoiMoi === 0) b.mai++;
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
        if (b.t === Math.round(BO_SO.quay / 2)) b.face *= -1;
        if (b.t >= BO_SO.quay) { b.sau = 0; doiTrangThai(b, 'di'); b.cd = Math.max(b.cd, 20); }
        break;
      case 'keng': if (b.t >= BO_SO.keng) doiTrangThai(b, 'di'); break;
      case 'dau': if (b.t >= BO_SO.dau) { doiTrangThai(b, 'di'); b.cd = Math.max(b.cd, 24); } break;
      case 'lat': if (b.t >= BO_SO.lat) doiTrangThai(b, 'choang'); break;
      case 'choang': if (b.t >= BO_SO.choang) doiTrangThai(b, 'day'); break;
      case 'day': if (b.t >= BO_SO.day) { b.nam = false; b.mai = BO_SO.mai; b.maiT = 0; b.cd = 50; doiTrangThai(b, 'di'); } break;
      case 'chet': if (b.t > 150) b.fade = Math.max(0, 1 - (b.t - 150) / 60); if (b.t >= 210) { b.dead = true; b.gone = true; } break;
    }
    // sát thương chạm (PH3): CHỈ cú húc chủ động, dùng vùng húc (nửa trước + đầu chìa ra). Đi / đứng / quay / hồi: chạm thân không mất máu.
    if (!pl.dead && b.st === 'huc' && overlap(pl, hopHuc(b))) hurt(b.face);
    if (b.co > 0) b.co--;
  }
  function capNhat() {
    doiBuoc();
    for (let i = TIA.length - 1; i >= 0; i--) if (++TIA[i].t > 9) TIA.splice(i, 1);
    for (const b of DS) { capNhat1(b); if (!b.gone) anim(b, S.frame); }
  }

  /* ---------- TRÚNG ĐÒN (gọi từ applyHits) ---------- */
  function trung1(b, hb, src, sw, face, n) {
    if (src === 'p') { if (b.swP === sw) return false; b.swP = sw; } else { if (b.swE === sw) return false; b.swE = sw; }
    // trạng thái ĐẦU BƯỚC: mọi nhát trúng trong cùng một bước xét chặn theo đây → kết quả không phụ thuộc thứ tự duyệt (PH3 mục 2)
    if (b.tickT !== S.frame) { b.tickT = S.frame; b.namDau = b.nam; }
    let res = false;
    const moKhoa = S.frame >= b.khoaCH;
    if (src === 'p') { if (moKhoa && S.frame - b.lastE <= P.resWindow) res = true; b.lastP = S.frame; } else { if (moKhoa && S.frame - b.lastP <= P.resWindow) res = true; b.lastE = S.frame; }
    if (res) { b.lastP = b.lastE = -999; b.khoaCH = S.frame + BO_SO.khoaCH; }
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const ix0 = Math.max(hb.x, b.x), ix1 = Math.min(hb.x + hb.w, b.x + b.w), iy0 = Math.max(hb.y, b.y), iy1 = Math.min(hb.y + hb.h, b.y + b.h);
    const tx = ix1 > ix0 ? (ix0 + ix1) / 2 : cx, ty = iy1 > iy0 ? (iy0 + iy1) / 2 : cy;
    const al = src === 'e' ? 0.6 : 1, a = ATK[n] || ATK[1];
    // bụng hay mai? Nằm ngửa (đầu bước): bụng lộ hết. Đòn ngang: theo HƯỚNG đòn (đánh cùng chiều quái nhìn = từ sau lưng).
    // Chém nảy (4, bổ xuống): theo chỗ chạm – phần bụng lộ phía sau (x > bung_tu_x) là bụng.
    let bung;
    if (b.namDau) bung = true;
    else if (n === 4) bung = (tx - cx) * (-b.face) > N.bung_tu_x_logic;
    else bung = face === b.face;
    b.hien = 120;
    if (!bung) {
      // ---- MAI: keng, tia trên mai, dội nhẹ, KHÔNG mất máu, trừ thanh mai (nhát làm vỡ mai cũng không gây máu) ----
      if (!b.nam) b.mai = Math.max(0, b.mai - (n === 3 ? BO_SO.maiNhat3 : 1));
      b.maiT = 0;
      const [mx, my] = diemMai(b, tx, ty, n);
      S.kengN++; sfx.keng(); hu('keng', mx, my, face < 0, {al: al * 0.8});
      TIA.push({x: mx, y: my, f: -face, t: 0, al, nay: n === 4});
      S.hitstop = Math.max(S.hitstop, 3); shake(face, 0, 0.9);
      if (src === 'p' && n !== 4 && pl.onGround) { DOI.con = BO_SO.doiLam; DOI.huong = -face; }   // dội nhẹ, không đụng pl.vx
      if (!b.nam && b.mai <= 0) voMai(b, mx, my);
      else if (!b.nam) {
        if (!res && (S.kengN <= 2 || S.kengN % 4 === 0)) popText(cx, b.y - 22, S.kengN <= 1 ? 'Keng! Mai cứng' : 'Keng!', '#F3E6C8');
        if (b.st === 'di' || b.st === 'hoi' || b.st === 'quay' || b.st === 'keng') { const f = b.face; doiTrangThai(b, 'keng'); b.face = f; }
      }
      if (res) congHuong(b, cx, cy, face);
      return true;
    }
    // ---- BỤNG (hoặc đang nằm ngửa): mất 1 máu, thân CO lại, hiệu ứng "bụp" mềm – khác hẳn keng ----
    b.flash = 8; b.co = 10;
    hu('trung_don', tx, ty, face < 0, {al});
    fx('ring', tx, ty, 10, '', 0, '#C9BBA4');
    for (let i = 0; i < 7; i++) part(tx, ty, face * (0.4 + Math.random() * 1.1), -1.1 - Math.random() * 1.0, 18 + (Math.random() * 8 | 0), i % 2 ? '#C9BBA4' : '#8F8170', 2, 0.16);
    noise(0.07, 0.2, 'lowpass', 520);   // "bụp" trầm (keng là tiếng kim cao)
    matMau(b, 1, face, '#F2D69A');
    if (res) congHuong(b, cx, cy, face);
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
  function congHuong(b, x, y, face) {
    if (!b.nam && b.st !== 'chet') voMai(b, x, y);
    S.resCount++; S.hitstop = Math.max(S.hitstop, 8); lhRung(150); LH.chPulse = 40; sfx.res();
    hu('cong_huong', x, y, false, {k: S.resFirst ? 1 : 1.3});
    if (!S.resFirst) { S.resFirst = true; flash('#CEF0D6', 14); shake(0, -1, 4.5); banner('Cộng hưởng!'); } else { flash('#CEF0D6', 6); shake(0, -1, 3); }
    popText(x, y - 40, 'Cộng hưởng: vỡ mai', '#CEF0D6');
    const them = Math.floor(BO_SO.chMau * BO_SO.mauGoc);
    if (them > 0) matMau(b, them, face, '#CEF0D6');
  }
  function voMai(b, x, y) {
    b.mai = 0; b.nam = true; b.flash = 6; doiTrangThai(b, 'lat');
    choang(); S.hitstop = Math.max(S.hitstop, 6); shake(0, 1, 2.4);
    fx('ring', x, y, 18, '', 0, '#A78046'); burst(x, y, '#A78046', 10, 1.6); burst(x, y - 10, '#65503C', 8, 2);
    banner('Vỡ mai!');
  }
  function chet(b, face) {
    doiTrangThai(b, 'chet'); b.hp = 0; b.kvx = (face || 1) * 2.4; sfx.thud(); b.mai = 0;
    shatter(b.x + b.w / 2, b.y + 30, '#39312E', '#A78046'); dropShards(b.x + b.w / 2, b.y + 30, 1);
  }
  function trung(hb, src, sw, face, n) {
    let hit = false;
    for (const b of DS) { if (b.gone || b.st === 'chet' || b.st === 'xem' || !overlap(hb, b)) continue; if (trung1(b, hb, src, sw, face, n)) hit = true; }
    return hit;
  }
  function pogo(R) { for (const b of DS) if (!b.gone && b.st !== 'chet' && b.st !== 'xem' && overlap(R, b)) return true; return false; }

  /* ---------- VẼ ---------- */
  function veMot(b, al) {
    if (b.gone || !b.H || !N) return;
    const x = lerp(b.px, b.x, al) + b.w / 2 - ox, y = lerp(b.py, b.y, al) + b.h - oy, lat = b.face > 0;
    if (x < -160 || x > W + 160) return;
    const t0 = performance.now();
    tinh(b.H, S.frame, ANIM_AL, b.H.cur);
    // lớp nứt mai theo thanh mai (mất 1–2 nấc: nứt nhẹ; ≥ 3: nứt nặng; vỡ / chết: nặng)
    const mat = BO_SO.mai - b.mai, P = b.H.cur;
    P[idxNut1 * 8 + 7] = (mat >= 1 || b.nam) ? 1 : 0; P[idxNut2 * 8 + 7] = (mat >= 3 || b.nam) ? 1 : 0;
    ctx.globalAlpha = b.fade; if (b.st !== 'chet') bong(x, y - 1, 56, 0.32); ctx.globalAlpha = 1;
    let va = 0; const baoT = b.st === 'bao' ? b.t : (b.st === 'xem' && b.xem === 'bao' ? b.xemBao / D : -1);
    if (baoT >= 0) va = 0.10 + 0.26 * (0.5 + 0.5 * Math.sin(baoT * 0.9)) * Math.min(1, baoT / 8);   // lóe CAM ĐỎ lúc báo trước
    QBR.ve(ctx, 'bo', P, snap(x), snap(y), lat, {alpha: b.fade, trang: nhay(b.flash), vang: va});
    if (baoT >= 0 && BO_THU.dauThan) veDauThan(x - (lat ? -1 : 1) * 30, y - 128, baoT);   // trên thanh mai / chấm máu (y − 92), không bị che
    if (b.st !== 'chet' && b.st !== 'xem') veThanh(b, x, y);
    DO.qbT(performance.now() - t0);
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
  /* tia va chạm trên mai: 5 tia ngắn toả về phía người đánh + lõi sáng 3 bước; màu kem/đồng, không quầng */
  function veTia() {
    for (const k of TIA) {
      const u = k.t / 9, X = k.x - ox, Y = k.y - oy, L0 = 3 + 9 * Math.min(1, u * 2.2), L1 = L0 + 6 * (1 - u);
      ctx.globalAlpha = k.al * (1 - u * u); ctx.lineWidth = 2; ctx.lineCap = 'square';
      for (let i = 0; i < 5; i++) {
        const g = (k.nay ? -Math.PI / 2 : (k.f > 0 ? 0 : Math.PI) - k.f * 0.35) + (i - 2) * 0.42;   // ngang: toả về phía người đánh, chếch lên
        const c = Math.cos(g), d = Math.sin(g);
        ctx.strokeStyle = i % 2 ? '#F2D69A' : '#FFF4DC';
        ctx.beginPath(); ctx.moveTo(X + c * L0, Y + d * L0); ctx.lineTo(X + c * L1, Y + d * L1); ctx.stroke();
      }
      if (k.t < 3) { ctx.fillStyle = '#FFF4DC'; ctx.fillRect(Math.round(X) - 2, Math.round(Y) - 2, 4, 4); }
    }
    ctx.globalAlpha = 1;
  }
  // thanh MAI (đồng cũ, 4 nấc) trên đầu: chỉ hiện khi đã bị đánh / đang mất nấc; vỡ → 3 chấm sáng quay (choáng) + thanh hồi
  function veThanh(b, x, y) {
    const top = y - 92;
    if (b.nam) {
      for (let i = 0; i < 3; i++) { const a = S.frame * 0.1 + i * 2.094, sx = Math.cos(a) * 26, sy = Math.sin(a) * 5;
        ctx.globalAlpha = 0.9; ctx.fillStyle = '#0C0F14'; ctx.fillRect(x + sx - 3, top + 30 + sy - 3, 6, 6); ctx.fillStyle = i % 2 ? '#F2D69A' : '#A78046'; ctx.fillRect(x + sx - 2, top + 30 + sy - 2, 4, 4); }
      ctx.globalAlpha = 1;
      if (b.st === 'choang') { const k = b.t / BO_SO.choang; ctx.fillStyle = 'rgba(12,15,20,.7)'; ctx.fillRect(x - 25, top + 6, 50, 5); ctx.fillStyle = '#65503C'; ctx.fillRect(x - 24, top + 7, 48 * k, 3); }
      if (BO_THU.mau) veMau(b, x, top + 14);
      return;
    }
    if (b.hien <= 0 && b.mai >= BO_SO.mai) return;
    const a = b.hien > 0 ? Math.min(1, b.hien / 20) : 0.55; ctx.globalAlpha = a;
    const n = BO_SO.mai, w = 11, g = 2, x0 = x - (n * w + (n - 1) * g) / 2;
    ctx.fillStyle = 'rgba(12,15,20,.75)'; ctx.fillRect(x0 - 2, top - 2, n * w + (n - 1) * g + 4, 8);
    for (let i = 0; i < n; i++) { ctx.fillStyle = i < b.mai ? '#A78046' : '#2a2622'; ctx.fillRect(x0 + i * (w + g), top, w, 4); if (i < b.mai) { ctx.fillStyle = '#F2D69A'; ctx.globalAlpha = a * 0.6; ctx.fillRect(x0 + i * (w + g), top, w, 1); ctx.globalAlpha = a; } }
    if (BO_THU.mau) veMau(b, x, top + 8);
    ctx.globalAlpha = 1;
  }
  function veMau(b, x, y) {   // máu (chỉ bản thử, ?mau=0 tắt): chấm nhỏ đỏ trầm
    const n = BO_SO.mau, x0 = x - (n * 6 - 2) / 2; ctx.fillStyle = 'rgba(12,15,20,.7)'; ctx.fillRect(x0 - 2, y - 1, n * 6 + 2, 5);
    for (let i = 0; i < n; i++) { ctx.fillStyle = i < b.hp ? '#B4553E' : '#3a2a26'; ctx.fillRect(x0 + i * 6, y, 4, 3); }
  }
  function ve(al) { for (const b of DS) veMot(b, al); veTia(); }
  function veHitbox(al) {
    for (const b of DS) { if (b.gone || !b.H) continue; const bx = lerp(b.px, b.x, al), by = lerp(b.py, b.y, al), d = bx - b.x;
      hbRect(bx, by, b.w, b.h, b.nam ? '#78e68c' : '#4fb4ff');
      if (!b.nam) { const bx0 = b.face < 0 ? bx + b.w / 2 + N.bung_tu_x_logic : bx; hbRect(bx0, by + 10, b.w / 2 - N.bung_tu_x_logic, b.h - 10, '#78e68c', 'dash'); }   // phần bụng lộ (chém nảy)
      if (b.st === 'bao' || b.st === 'huc') { hopHuc(b); hbRect(HUC.x + d, HUC.y, HUC.w, HUC.h, b.st === 'huc' ? '#ff4a4a' : '#ffa640', b.st === 'huc' ? 'fill' : 'dash'); }
      hbChu(b.H.info, bx - ox - 40, by - oy - 120, '#f6d0f6'); }
  }
  return {DS, SO, nap, datLai, luuTruoc, capNhat, trung, pogo, ve, veHitbox, get N() { return N; }};
})();

/* ---------- hướng dẫn 1 dòng trong phòng thử ---------- */
HINT.bo = 'Mai cứng phía trước dội đòn – vòng ra sau đánh bụng, hoặc chém mai tới vỡ rồi đánh lúc nó lật ngửa';
const _boHint = hintNow;
hintNow = function () { return ROOMS[S.room] === RD ? 'bo' : _boHint(); };
/* ---------- bất tử khi quay thử (?battu=1) ---------- */
const _boHurt = hurt;
hurt = function (dir) { if (BO_THU.batTu && pl.hp <= 1) pl.hp = 2; _boHurt(dir); };

/* ======================= THỬ (không ghép vào demo.html): bot + API quay / chụp ======================= */
const BO_BOT = {on: false, kieu: '', t: 0, pha: '', nhay: 0, luot: 0, xong: false};
function boMucTieu() { let m = null, d = 1e9; for (const b of BO.DS) { if (b.gone || b.st === 'chet') continue; const k = Math.abs(b.x + b.w / 2 - pl.x - pl.w / 2); if (k < d) { d = k; m = b; } } return m; }
/* kiểu 'mai': đứng trước mặt chém mai tới vỡ (lùi xa khi nó báo trước húc), rồi chém lúc nằm ngửa
   kiểu 'vong': chờ nó húc, LƯỚT xuyên qua ra sau lưng, chém bụng */
function boBotBuoc() {
  if (!BO_BOT.on) return;
  for (const k of KEYS) kb[k] = 0;
  BO_BOT.t++;
  const b = boMucTieu(); if (!b || pl.dead) { BO_BOT.xong = true; return; }
  const cx = b.x + b.w / 2, lx = pl.x + pl.w / 2, dx = cx - lx, ad = Math.abs(dx), ve = dx > 0 ? 'r' : 'l', xa = dx > 0 ? 'l' : 'r';
  const truoc = (lx - cx) * b.face > 0;       // Lam đang ở phía trước quái
  const danh = () => { if (pl.atkN === 0 && BO_BOT.t % 2 === 0) kb.a = 1; };
  if (b.nam) { if (ad > 70) kb[ve] = 1; else { pl.face = dx > 0 ? 1 : -1; danh(); } return; }
  if (BO_BOT.kieu === 'mai') {
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
  bo: BO, so: BO_SO, bot: BO_BOT,
  async batDau() { while (!(window.TVDEMO && TVDEMO.ready && loadEl.hidden)) await wait(50); audioInit(); startEl.hidden = true; S.paused = false; document.getElementById('warn').hidden = true; },
  anUI(v) { let st = document.getElementById('bo-an'); if (!st) { st = document.createElement('style'); st.id = 'bo-an'; document.head.appendChild(st); }
    st.textContent = v ? '#hint,#keys,#toast,.ui:not(.panel),button:not(#btn-start){visibility:hidden!important}' : ''; },
  khung(n) { for (let i = 0; i < (n || 1); i++) { savePrev(); step(); } render(1);
    return {f: S.frame, lam: [+(pl.x + pl.w / 2).toFixed(1), pl.hp], bo: BO.DS.map(b => [b.st, b.t, b.hp, b.mai, b.face, +(b.x + b.w / 2).toFixed(1), b.gone ? 1 : 0]), xong: BO_BOT.xong}; },
  batBot(kieu) { Object.assign(BO_BOT, {on: true, kieu, t: 0, xong: false}); },
  tatBot() { BO_BOT.on = false; for (const k of KEYS) kb[k] = 0; },
  datLam(x, f) { placePlayer(x - pl.w / 2, FLOOR - pl.h); pl.drawT = 0; pl.face = f || 1; },
  datBo(i, x, f, st) { const b = BO.DS[i]; b.x = x - b.w / 2; b.px = b.x; b.face = f; if (st) { b.st = st; b.t = 0; } b.H = null; },
  anBo(i) { BO.DS[i].gone = true; },
  phim(k, v) { kb[k] = v ? 1 : 0; },
  doVe(n) { DO.reset(); for (let i = 0; i < n; i++) { savePrev(); step(); render(1); } const a = DO.ds.slice().sort((p, q) => p - q);
    return {n: a.length, tb: +(DO.tong / DO.n).toFixed(3), p95: +a[Math.floor(a.length * 0.95)].toFixed(3), max: +DO.max.toFixed(3), quaiTb: +(DO.qb / DO.n).toFixed(3)}; },
  thongSo() { return {nap: BO.SO.nap, hm: (typeof HM !== 'undefined') ? HM.SO : null, bk: BK}; }
};
