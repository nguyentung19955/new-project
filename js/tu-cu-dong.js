// ------------------------------------------------------------
//  TỰ CỬ ĐỘNG (claude/tu-cu-dong): mỗi tướng / quái / boss chỉ cần MỘT ảnh tĩnh
//  (docs/PROMPT-DUNG-XUONG.txt: toàn thân, 3/4 quay phải, A-pose, nền trong suốt, tên <mã>.png)
//  → game tự cử động bằng biến đổi CẢ ẢNH (dịch, co giãn, nghiêng, uốn lát ngang) — không cắt bộ phận
//  nên không bao giờ gãy vũ khí / lộ lỗ. Bộ nhiều khung đã có (packs/<mã>/wind · strike · walk2 · attack…)
//  vẫn ưu tiên như cũ. Ép dùng ảnh đơn để thử: ?solo=1 hoặc CD.force = true (tools/xem-cu-dong.html).
// ------------------------------------------------------------
const CD = { force: false, stats: { hero: 0, enemy: 0 } };
try { if (/[?&]solo=1\b/.test(location.search)) CD.force = true; } catch (e) { /* không có location */ }

// loại vũ khí theo docs/PROMPT-DUNG-XUONG.txt (dòng "Loại vũ khí") — chọn vệt chém / đạn / quả cầu
const CD_WEAPON = {
  lactuong: 'riu', lucsi: 'tay-khong', xathu: 'cung', thosan: 'kiem', thaymo: 'gay-phep', thansuong: 'tay-khong', giaodong: 'giao',
  chuongdong: 'gay-phep', tre: 'giao', ongthoi: 'no', dapde: 'giao', chantrau: 'no', chodo: 'giao', haisen: 'gay-phep', dotnuong: 'kiem',
  denroi: 'gay-phep', thoren: 'riu', nguphu: 'giao', thogom: 'tay-khong', thaylang: 'gay-phep', thachsanh: 'riu', caolo: 'no',
  antiem: 'tay-khong', cdt: 'gay-phep', tiendung: 'gay-phep', langlieu: 'gay-phep', nghedong: 'tay-khong', mychau: 'tay-khong',
  sodua: 'tay-khong', ongdung: 'giao', thocong: 'gay-phep', lyngu: 'giao', truongchi: 'gay-phep', potaoapui: 'kiem', baahoa: 'tay-khong',
  trongdong: 'gay-phep', caong: 'tay-khong', ongtao: 'gay-phep', lachau: 'giao', thansan: 'giao', giong: 'giao', llq: 'kiem',
  kimquy: 'tay-khong', auco: 'gay-phep', kylan: 'tay-khong', thienloi: 'riu', cuoi: 'riu', melua: 'gay-phep', tanvien: 'gay-phep',
  maudia: 'gay-phep', halong: 'tay-khong', longnu: 'tay-khong', kinhduong: 'kiem', viemde: 'gay-phep', matroi: 'gay-phep',
  mauthoai: 'gay-phep', trutroi: 'giao', ongho: 'tay-khong', adv: 'no', mau: 'gay-phep',
  // quái / boss
  camap: 'tay-khong', cao: 'tay-khong', cua: 'tay-khong', kybinh: 'giao', voichien: 'tay-khong', tom: 'giao', casau: 'tay-khong',
  rua: 'tay-khong', phuthuy: 'gay-phep', chimbao: 'tay-khong', echme: 'tay-khong', nongnoc: 'tay-khong', giaolong: 'tay-khong',
  yeutinh: 'riu', ran: 'tay-khong', doi: 'tay-khong', thachtinh: 'tay-khong', dacon: 'tay-khong', linhan: 'giao', cungan: 'cung',
  muc: 'tay-khong', anvuong: 'giao', chantinh: 'riu', haba: 'giao', ngutinh: 'tay-khong', thuongluong: 'tay-khong', thuytinh: 'giao',
  trieuda: 'kiem', daibang: 'tay-khong', hotinh: 'gay-phep',
};
const CD_KIND = { kiem: 'slash', riu: 'chop', giao: 'thrust', cung: 'shot', no: 'shot', 'gay-phep': 'orb', 'tay-khong': 'punch' };
function cdWeapon(type, attack) {
  const w = CD_WEAPON[type];
  if (w) return CD_KIND[w];
  return attack === 'arrow' ? 'shot' : attack === 'melee' ? 'slash' : attack ? 'orb' : 'punch';
}

// ---- chọn ảnh đơn
const cdMultiCache = new Map();
function cdHasMulti(type, enemy) {
  let m = cdMultiCache.get(type);
  if (m !== undefined) return m;
  const P = (n) => hasAsset(`packs/${type}/${n}.png`);
  m = !!((typeof PACK_FRAMES !== 'undefined' && PACK_FRAMES[type]) || (typeof FRAME_ANIMS !== 'undefined' && FRAME_ANIMS[type])
    || (enemy ? P('walk2') || P('attack') : P('wind') || P('strike') || P('cast')));
  cdMultiCache.set(type, m);
  return m;
}
// ảnh đơn của một mã (null = dùng đường vẽ cũ: bộ nhiều khung / ảnh cũ / vector)
function cdSoloImg(type, enemy) {
  if (!CD.force && cdHasMulti(type, enemy)) return null;
  const list = [`${type}.png`, `packs/${type}/idle.png`];
  if (enemy) list.push(`packs/${type}/walk1.png`);
  for (const p of list) if (hasAsset(p)) return asset(p, true);   // đang tải → null (vẽ đường cũ trong lúc chờ)
  return null;
}

// ---- đo ảnh một lần: khung bao phần có hình, hàng chân (hàng không trong suốt cuối), tâm chân
// → cắt sát khung bao vào canvas riêng (≤ 256 px cao) để mọi phép biến đổi lấy chân làm gốc.
const cdPrep = new WeakMap();
let cdScan = null;
function cdPrepare(img) {
  let p = cdPrep.get(img);
  if (p) return p;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  if (!iw || !ih) return null;
  const S = 128, k = S / Math.max(iw, ih), W = Math.max(4, Math.round(iw * k)), H = Math.max(4, Math.round(ih * k));
  let x0 = 0, y0 = 0, x1 = W, y1 = H, fk = 0.5;
  try {
    if (!cdScan) { cdScan = document.createElement('canvas'); cdScan.width = cdScan.height = S; }
    const g = cdScan.getContext('2d', { willReadFrequently: true });
    g.clearRect(0, 0, S, S); g.drawImage(img, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data;
    const rowN = new Array(H).fill(0);
    x0 = W; y0 = H; x1 = 0; y1 = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 40) {
      rowN[y]++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (x1 < x0) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
    // hàng chân: hàng cuối có ≥ 2 điểm (bỏ hạt lẻ), tâm chân = trung vị cột ở 8% đáy hình
    while (y1 > y0 && rowN[y1] < 2) y1--;
    const band = Math.max(1, Math.round((y1 - y0 + 1) * 0.08)), col = new Array(W).fill(0);
    let n = 0;
    for (let y = y1 - band + 1; y <= y1; y++) for (let x = x0; x <= x1; x++) if (d[(y * W + x) * 4 + 3] > 40) { col[x]++; n++; }
    if (n > 2) { let acc = 0, m = x0; for (; m <= x1; m++) { acc += col[m]; if (acc >= n / 2) break; } fk = (m + 0.5 - x0) / (x1 - x0 + 1); }
    x1++; y1++;
  } catch (e) { x0 = 0; y0 = 0; x1 = W; y1 = H; }
  // cắt (lề 1 điểm của ảnh quét) sang ảnh gốc, thu về ≤ 256 px cao
  const sx = Math.max(0, (x0 - 1) / k), sy = Math.max(0, (y0 - 1) / k);
  const sw = Math.min(iw, (x1 + 1) / k) - sx, sh = Math.min(ih, y1 / k + 0.5) - sy;
  const q = Math.min(1, 256 / sh);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(sw * q)); c.height = Math.max(1, Math.round(sh * q));
  const x = c.getContext('2d');
  x.imageSmoothingQuality = 'high';
  x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  c.naturalWidth = c.width; c.naturalHeight = c.height;
  const fx = Math.min(0.85, Math.max(0.15, (fk * (x1 - x0) / k + (x0 / k - sx)) / sw));
  c.__fk = fx;   // footK() của render.js đọc giá trị này
  p = { c, ar: c.width / c.height, fx, tint: new Map() };
  cdPrep.set(img, p);
  return p;
}
// bản tô một màu (chớp trắng trúng đòn / ám đỏ nổi giận) — tạo một lần mỗi màu
function cdTint(p, color) {
  let c = p.tint.get(color);
  if (c) return c;
  c = document.createElement('canvas'); c.width = p.c.width; c.height = p.c.height;
  const x = c.getContext('2d');
  x.drawImage(p.c, 0, 0);
  x.globalCompositeOperation = 'source-atop'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  c.naturalWidth = c.width; c.naturalHeight = c.height;
  p.tint.set(color, c);
  return c;
}

// ---- easing
const cdOut = (k) => 1 - Math.pow(1 - k, 3);
const cdInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const cdBack = (k) => { const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };   // vượt nhẹ rồi về
const cdSeed = (id, type) => { let s = (id || 0) * 2.399; for (let i = 0; i < type.length; i++) s += type.charCodeAt(i) * 0.137; return s % (Math.PI * 2); };

// tư thế thủ tục (gốc = tâm chân; đơn vị = chiều cao hình): trả về dịch / co giãn / uốn / nghiêng
//   st: { t, seed, swing (1→0), castT, castUlt, hurt (0.2→0), fall (0.6→0), win, walk, enraged, kind, melee }
function cdPose(st) {
  const P = { dx: 0, dy: 0, sx: 1, sy: 1, bend: 0, rot: 0, alpha: 1, flash: 0, flashC: '#FFFFFF', glow: 0, shake: 0, phase: '', k: 0 };
  const t = st.t, sd = st.seed;
  // đứng thở: co giãn dọc quanh chân + nhún rất nhẹ, uốn đung đưa (lệch pha theo seed)
  const b = Math.sin(t * 2.6 + sd);
  P.sy = 1 + 0.018 * b; P.sx = 1 - 0.01 * b;
  P.bend = Math.sin(t * 1.35 + sd * 1.3) * 0.018;
  if (st.walk) {
    // đi: nhún bước (|sin|) + lắc nghiêng theo nhịp chân
    const ph = t * st.walk + sd, step = Math.abs(Math.sin(ph));
    P.dy -= 0.05 * step; P.sy += 0.035 * (step - 0.5); P.sx -= 0.02 * (step - 0.5);
    P.rot += Math.sin(ph) * 0.05; P.bend += Math.cos(ph) * 0.02;
    P.step = step;
  }
  const big = st.melee ? 1 : 0.45;
  if (st.swing > 0) {
    const u = 1 - st.swing;
    if (u < 0.3) {                // lấy đà: ngả về sau, nén xuống
      const k = cdOut(u / 0.3);
      P.dx -= 0.05 * k * big; P.bend -= 0.13 * k; P.sx *= 1 - 0.04 * k; P.sy *= 1 + 0.05 * k; P.rot -= 0.04 * k;
      P.phase = 'wind'; P.k = k;
    } else if (u < 0.46) {        // lao tới + uốn phần trên theo hướng đánh, giãn ngang
      const k = cdOut((u - 0.3) / 0.16);
      P.dx += (-0.05 + 0.11 * k) * big; P.bend += -0.13 + (0.13 + 0.24 * big) * k; P.sx *= 1 + 0.08 * k * big; P.sy *= 1 - 0.06 * k * big;
      P.rot += (-0.04 + 0.1 * k) * big;
      if (!st.melee) P.dx -= 0.05 * k;   // đánh xa: giật lùi khi bắn
      P.phase = 'strike'; P.k = k;
    } else {                      // bật về (vượt nhẹ rồi đứng yên)
      const k = cdBack((u - 0.46) / 0.54);
      const r = 1 - k;
      P.dx += (0.06 * big - (st.melee ? 0 : 0.05)) * r; P.bend += 0.24 * big * r; P.sx *= 1 + 0.08 * big * r; P.sy *= 1 - 0.06 * big * r; P.rot += 0.06 * big * r;
      P.phase = 'recover'; P.k = Math.min(1, Math.max(0, (u - 0.46) / 0.54));
    }
  }
  if (st.castT > 0) {             // tung chiêu: nhún lên, phóng to nhẹ, phát sáng viền
    const k = cdInOut(Math.min(1, st.castT / 0.3));
    P.dy -= 0.07 * k; P.sx *= 1 + (st.castUlt ? 0.12 : 0.06) * k; P.sy *= 1 + (st.castUlt ? 0.14 : 0.08) * k; P.bend -= 0.05 * k;
    P.glow = k; if (!P.phase) { P.phase = 'cast'; P.k = k; }
  }
  if (st.hurt > 0) {              // trúng đòn: chớp + giật lùi + rung
    const k = Math.min(1, st.hurt / 0.2);
    P.dx -= 0.04 * k; P.rot -= 0.06 * k; P.shake = 0.012 * k; P.flash = 0.6 * k; P.flashC = '#FFFFFF';
    P.sx *= 1 + 0.04 * k; P.sy *= 1 - 0.04 * k;
  }
  if (st.enraged) {               // boss nổi giận: phồng to, rung, ám đỏ
    const pul = 0.5 + 0.5 * Math.sin(t * 7 + sd);
    P.sx *= 1.1 + 0.03 * pul; P.sy *= 1.1 + 0.03 * pul; P.shake = Math.max(P.shake, 0.008);
    if (!P.flash) { P.flash = 0.22 + 0.16 * pul; P.flashC = '#FF2A1A'; }
  }
  if (st.win && !(st.swing > 0) && !(st.castT > 0)) {   // ăn mừng: nhảy nhót
    const j = Math.abs(Math.sin(t * 5 + sd));
    P.dy -= 0.08 * j; P.sy *= 1 + 0.05 * (j - 0.4);
  }
  if (st.fall !== undefined) {    // chết: ngã nghiêng + chìm + mờ dần
    const q = cdInOut(Math.min(1, Math.max(0, 1 - st.fall / 0.6)));
    P.rot -= 1.25 * q; P.dy += 0.05 * q; P.alpha = 1 - 0.85 * q; P.bend *= 1 - q;
    P.phase = ''; P.glow = 0;
  }
  if (P.shake) { P.dx += Math.sin(t * 91 + sd) * P.shake; P.dy += Math.cos(t * 73 + sd) * P.shake * 0.6; }
  return P;
}

// vẽ ảnh đã cắt với gốc ở chân: uốn (lát ngang) cho tướng, nghiêng (1 lần vẽ) cho quái
function cdDrawBody(ctx, p, img, H, P, slices) {
  const w = H * p.ar;
  if (slices) drawBent(ctx, img, -w * p.fx, -H, w, H, P.bend, 0);
  else {
    ctx.save(); ctx.transform(1, 0, -P.bend * 0.9, 1, 0, 0);
    ctx.drawImage(img, -w * p.fx, -H, w, H);
    ctx.restore();
  }
}
function cdApply(ctx, P, H) {
  ctx.translate(P.dx * H, P.dy * H);
  if (P.rot) ctx.rotate(P.rot);
  ctx.scale(P.sx, P.sy);
}

// ---- hiệu ứng che đậy chuyển động (gốc = chân, hướng phải, H = chiều cao hình)
function cdFx(ctx, kind, P, H, col, t, seed, fr) {
  fr = fr || 0.35 * H;   // khoảng từ chân tới mép trước của hình
  if (!P.phase || P.phase === 'cast') return;
  const strike = P.phase === 'strike', rec = P.phase === 'recover';
  const fade = strike ? 1 : rec ? Math.max(0, 1 - P.k * 2.2) : 0;
  const tex = typeof fxImage === 'function';
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (kind === 'slash' || kind === 'chop') {
    // vệt chém cung tròn (rìu: cung to, chém bổ xuống)
    if (fade > 0) {
      const cx = 0.06 * H, cy = -0.52 * H, R = (kind === 'chop' ? 0.46 : 0.4) * H;
      const a0 = kind === 'chop' ? -2.2 : -1.9, span = kind === 'chop' ? 2.9 : 2.5;
      const a1 = strike ? a0 + span * P.k : a0 + span;
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = fade * [0.95, 0.5, 0.2][i];
        ctx.strokeStyle = i === 0 ? '#FFFFFF' : col;
        ctx.lineWidth = H * [0.022, 0.06, 0.11][i];
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy, R, Math.max(a0, a1 - 1.7), a1); ctx.stroke();
      }
      if (tex && strike) fxImage(ctx, 'slash_01', col, cx + R * 0.55, cy + R * 0.1, R * 0.9, -0.3, 1, fade * 0.7);
    }
  } else if (kind === 'thrust') {
    // giáo: vệt đâm thẳng tới trước
    if (fade > 0) {
      const y = -0.5 * H, x0 = fr * 0.5, len = (strike ? P.k : 1) * 0.75 * H;
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = fade * [0.95, 0.45, 0.18][i];
        ctx.strokeStyle = i === 0 ? '#FFFFFF' : col; ctx.lineWidth = H * [0.018, 0.05, 0.1][i]; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x0 + len * 0.2, y + 0.02 * H); ctx.lineTo(x0 + len, y); ctx.stroke();
      }
    }
  } else if (kind === 'punch') {
    // tay không: vệt đấm + vòng va chạm
    if (fade > 0) {
      const y = -0.45 * H, x = fr * 0.9 + (strike ? P.k : 1) * 0.16 * H;
      ctx.globalAlpha = fade * 0.8; ctx.strokeStyle = col; ctx.lineWidth = H * 0.025; ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x - 0.28 * H, y + i * 0.06 * H); ctx.lineTo(x - 0.06 * H, y + i * 0.04 * H); ctx.stroke(); }
      ctx.globalAlpha = fade * 0.9; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = H * 0.02;
      ctx.beginPath(); ctx.arc(x, y, (0.05 + 0.1 * (strike ? P.k : 1)) * H, 0, Math.PI * 2); ctx.stroke();
    }
  } else if (kind === 'shot') {
    // cung / nỏ: tên bay ra từ tay + chớp đầu nỏ
    const hx = Math.min(fr * 0.85, 0.45 * H), hy = -0.52 * H;
    if (P.phase === 'wind') {
      ctx.globalAlpha = 0.5 * P.k; ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(hx, hy, 0.03 * H * (1 + P.k), 0, Math.PI * 2); ctx.fill();
    } else if (fade > 0) {
      const d = (strike ? P.k : 1 + P.k) * 0.7 * H;
      ctx.globalAlpha = fade;
      const g = ctx.createLinearGradient(hx + d - 0.3 * H, hy, hx + d, hy);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, col);
      ctx.strokeStyle = g; ctx.lineWidth = H * 0.02;
      ctx.beginPath(); ctx.moveTo(hx + d - 0.3 * H, hy); ctx.lineTo(hx + d, hy); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#F6EFD8';
      ctx.beginPath(); ctx.moveTo(hx + d + 0.05 * H, hy); ctx.lineTo(hx + d - 0.01 * H, hy - 0.025 * H); ctx.lineTo(hx + d - 0.01 * H, hy + 0.025 * H); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      if (strike) {
        ctx.globalAlpha = 1 - P.k;
        if (!(tex && fxImage(ctx, 'muzzle_02', col, hx + 0.05 * H, hy, 0.12 * H, Math.PI / 2, 1, 1))) {
          ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(hx, hy, 0.06 * H, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  } else {
    // gậy phép: quả cầu tụ ở đầu gậy (màu hệ) rồi phóng tia tới trước
    const ox = Math.min(fr * 0.8, 0.4 * H), oy = -0.85 * H;
    const r = P.phase === 'wind' ? (0.05 + 0.08 * P.k) * H : strike ? (0.13 + 0.12 * P.k) * H : 0.13 * H * fade;
    if (r > 0.5) {
      ctx.globalAlpha = strike ? 1 - P.k * 0.6 : P.phase === 'wind' ? 0.95 : fade;
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
      g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.35, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
      if (tex && P.phase === 'wind') fxImage(ctx, 'magic_02', col, ox, oy, r * 1.4, t * 3 + seed, 1, 0.6);
      if (strike) {
        ctx.strokeStyle = col; ctx.lineWidth = H * 0.025; ctx.globalAlpha = 1 - P.k;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + 0.8 * H * P.k, oy + 0.3 * H * P.k); ctx.stroke();
      }
    }
  }
  // tia lửa trúng đòn (cận chiến, cuối pha lao tới)
  if ((kind === 'slash' || kind === 'chop' || kind === 'thrust' || kind === 'punch') && (strike && P.k > 0.6 || rec && P.k < 0.25)) {
    const q = strike ? (P.k - 0.6) / 0.4 * 0.4 : 0.4 + P.k / 0.25 * 0.6;
    const sx = fr + 0.12 * H, sy = -0.45 * H;
    ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#FFF1A8'; ctx.lineWidth = H * 0.012; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const a = seed + i * 0.9, r0 = q * 0.12 * H, r1 = r0 + 0.06 * H * (1 - q);
      ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); ctx.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); ctx.stroke();
    }
    if (tex) fxImage(ctx, 'spark_01', col, sx, sy, 0.16 * H, seed, 1, (1 - q) * 0.8);
  }
  ctx.restore();
}
// bụi chân khi đi: 2 cụm khói nhỏ sau gót, theo nhịp bước (không cần trạng thái)
function cdDust(ctx, H, t, rate, seed) {
  const dot = typeof softDot === 'function' ? softDot([200, 180, 140]) : null;
  if (!dot) return;
  ctx.save();
  for (let i = 0; i < 2; i++) {
    const p = ((t * rate / Math.PI + seed + i * 0.5) % 1 + 1) % 1;
    const r = (0.05 + 0.09 * p) * H;
    ctx.globalAlpha = (1 - p) * 0.45;
    ctx.drawImage(dot, -0.12 * H - p * 0.22 * H - r, -0.02 * H - p * 0.06 * H - r, r * 2, r * 2);
  }
  ctx.restore();
}

// ---- TƯỚNG (gọi từ drawHeroSprite khi có ảnh đơn)
const CD_HERO_H = 228;   // chiều cao hình trong khung 200×230 (như bộ ảnh vẽ tay)
function cdDrawHero(ctx, h, x, y, o, s, look, def, img, tierShown, ascShown) {
  const p = cdPrepare(img);
  if (!p) return null;
  CD.stats.hero++;
  const t = o.t || 0, dir = o.dir || 1, seed = cdSeed(h.id, h.type);
  const kind = cdWeapon(h.type, def.attack);
  const P = cdPose({ t, seed, swing: o.swing || 0, castT: o.castT || 0, castUlt: !!o.castUlt, hurt: o.hurt || 0, fall: o.fall, win: o.win,
    melee: def.attack === 'melee' });
  if (o.noIdle) { P.sy = 1; P.sx = 1; }
  const H = CD_HERO_H;
  let lift = 0;
  if (o.summon > 0) lift = -60 * (o.summon / 0.5) * (o.summon / 0.5);
  if (o.bounce > 0) lift -= (4 * DK / s) * Math.sin(Math.PI * (1 - o.bounce / 0.3));
  ctx.save();
  ctx.globalAlpha *= (o.alpha ?? 1) * P.alpha;
  ctx.translate(x, y);
  if (!o.noShadow) {
    // bóng co lại khi nhún lên / nhảy
    const up = Math.min(1, Math.max(0, -(P.dy * H + lift) / 40));
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(P.dx * H * s * dir * 0.5, 0, 13 * DK * (s / 0.28) * (1 - 0.3 * up), 4 * DK * (s / 0.28) * (1 - 0.3 * up), 0, 0, Math.PI * 2);
    ctx.fill();
    if (look.accAura) drawAccAura(ctx, look.accAura, s, t, true);
  }
  ctx.scale(dir * s, s);
  ctx.translate(0, lift + (o.bog ? 10 : 0));
  // hào quang sau lưng như bộ ảnh vẽ tay (khung 200×230)
  const dying = o.fall !== undefined;   // đang ngã: tắt hào quang (khói hào quang tự đặt globalAlpha, không mờ theo thân)
  ctx.save(); ctx.translate(-100, -222);
  if (!dying) drawPackBack(ctx, h, look, def, t, tierShown, ascShown);
  if (look.wings) withProc(ctx, () => drawWings(ctx, look, t, o.wingT));
  if (look.setFx) withProc(ctx, () => drawSetBack(ctx, look.setFx, t, o.wingT));
  ctx.restore();
  ctx.save();
  cdApply(ctx, P, H);
  const w = H * p.ar, base = ctx.globalAlpha;
  if (P.glow > 0) drawGlowOnly(ctx, p.c, -w * p.fx, -H, w, H, o.castColor || look.attrColor || '#FFE08A', 12 * P.glow * (o.castUlt ? 1.4 : 1), 0.85 * P.glow);
  else if (!dying) packGlow(ctx, p.c, w, H, h, look, def, t, tierShown, ascShown);
  // bóng mờ lùi sau thân khi lao tới (cận chiến)
  if (P.phase === 'strike' && def.attack === 'melee') {
    ctx.save(); ctx.globalAlpha = base * 0.16 * (1 - P.k); ctx.translate(-0.08 * H, 0);
    cdDrawBody(ctx, p, p.c, H, P, true); ctx.restore();
  }
  cdDrawBody(ctx, p, p.c, H, P, true);
  if (P.flash > 0) {
    ctx.globalAlpha = base * P.flash;
    cdDrawBody(ctx, p, cdTint(p, o.hurt > 0 ? (Math.floor(t * 30) % 2 ? '#FFFFFF' : '#FF5A4A') : P.flashC), H, P, true);
    ctx.globalAlpha = base;
  }
  ctx.restore();
  if (!dying) drawPackFront(ctx, h, def, t, H, ascShown);
  if (!dying) cdFx(ctx, kind, P, H, look.attrColor || '#FFF1C4', t, seed, (1 - p.fx) * H * p.ar);
  ctx.restore();
  if (o.bog) drawBogWater(ctx, x, y, s, t);
  return { top: y - (H + 12 - lift) * s * Math.max(1, P.sy), s };
}

// ---- QUÁI / BOSS (gọi từ drawEnemy; ctx đã dịch tới chân, lật theo hướng, rung khi trúng đòn)
function cdEnemySize(e, box, p) {
  const hgt = box.w * Math.min(1.7, Math.max(0.6, 1 / p.ar)) * (e.def.boss ? 1.05 : 1);
  return { H: hgt, W: hgt * p.ar };
}
function cdDrawEnemy(ctx, e, t, box, img, o) {
  const p = cdPrepare(img);
  if (!p) return false;
  CD.stats.enemy++;
  const d = e.def, seed = cdSeed(e.id, e.type);
  const { H } = cdEnemySize(e, box, p);
  const moving = !o.icon && !(e.stunT > 0) && !(e.atkT > 0);
  const atkDur = d.slam ? 0.45 : 0.4;
  const P = cdPose({ t, seed, swing: e.atkT > 0 ? Math.min(1, e.atkT / atkDur) : 0, hurt: e.hitT > 0 ? e.hitT / 0.12 * 0.2 : 0,
    enraged: !!e.enraged, walk: moving && !d.flying ? (e.enraged ? 13 : 9) : 0, melee: !d.ranged });
  if (o.icon) { P.sx = 1; P.sy = 1; P.bend = 0; P.dy = 0; P.rot = 0; }
  if (d.flying && !o.icon) { P.sy *= 1 + Math.sin(t * 16 + seed) * 0.06; }
  const fly = d.flying ? H * 0.5 : 0;
  if (P.step !== undefined && !o.icon && (typeof GFX_LEVEL !== 'function' || GFX_LEVEL() < 2)) cdDust(ctx, H, t, e.enraged ? 13 : 9, seed);
  // ảnh thu nhỏ theo cỡ trên màn (đỡ co ảnh lớn mỗi khung khi đông quái)
  const tr = ctx.getTransform();
  const dev = Math.hypot(tr.a, tr.b) * H * p.ar;
  const body = o.icon ? p.c : fitSprite(p.c, dev);
  const pp = body === p.c ? p : { c: body, ar: p.ar, fx: p.fx };
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.translate(0, fly);
  cdApply(ctx, P, H);
  const fxc = d.fx && typeof ENEMY_FX !== 'undefined' && ENEMY_FX[d.fx];
  const w = H * p.ar;
  if (fxc) { drawEnemyFxBack(ctx, d.fx, fxc, w, H, t, e.id || 0, false); drawGlowOnly(ctx, body, -w * p.fx, -H, w, H, fxc.glow, fxc.blur, 0.9); }
  if (e.enraged) drawGlowOnly(ctx, body, -w * p.fx, -H, w, H, '#FF2D2D', 14, 0.85);
  if (fxc && d.fx === 'ghost') ctx.globalAlpha *= 0.72 + Math.sin(t * 3 + (e.id || 0)) * 0.12;
  const base = ctx.globalAlpha;
  cdDrawBody(ctx, pp, body, H, P, false);
  if (P.flash > 0) {
    ctx.globalAlpha = base * Math.min(1, P.flash * (e.hitT > 0 ? 1.3 : 1));
    cdDrawBody(ctx, pp, cdTint(p, e.hitT > 0 ? '#FFFFFF' : P.flashC), H, P, false);
    ctx.globalAlpha = base;
  }
  ctx.restore();
  if (!o.icon && P.phase) {
    const el = e.el && typeof ELEMENTS !== 'undefined' && ELEMENTS[e.el];
    ctx.save(); ctx.translate(0, fly);
    cdFx(ctx, cdWeapon(e.type, d.ranged ? 'arrow' : 'melee'), P, H, (el && el.color) || '#FFB04A', t, seed, (1 - p.fx) * H * p.ar);
    ctx.restore();
  }
  return true;
}

// trang thử: index.html?xem-cu-dong (tools/xem-cu-dong.html) — ép ảnh đơn, nạp js/xem-cu-dong.js sau khi game tải xong
try {
  if (/[?&]xem-cu-dong\b/.test(location.search)) {
    CD.force = true;
    addEventListener('load', () => { const sc = document.createElement('script'); sc.src = 'js/xem-cu-dong.js?v=' + Date.now(); document.body.appendChild(sc); });
  }
} catch (e) { /* không có location */ }
