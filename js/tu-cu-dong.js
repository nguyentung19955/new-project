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
  p = { c, ar: c.width / c.height, fx, tint: new Map(), geo: { sx, sy, sw, sh, iw, ih, q: c.width / sw } };
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
    P.dy -= 0.08 * j; P.hop = -0.08 * j; P.sy *= 1 + 0.05 * (j - 0.4);
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

// ============================================================
//  RIG 3 LỚP (vung tay vũ khí, CHÂN ĐỨNG YÊN): ảnh đơn tách thành
//    chân (dưới đường hông — không bao giờ biến dạng) · thân trên (uốn / ngả / nhún quanh HÔNG)
//    · tay cầm vũ khí (xoay quanh điểm vai, vẽ trên thân). Rig chỉnh tay: js/rigs.js (tools/rig-tay.html);
//    không có thì tự đoán từ ảnh; đoán không ra tay thì vẫn tách chân / thân (tay đi theo thân).
// ============================================================
const cdOp = (A, W, x, y) => A[(y * W + x) * 4 + 3] > 40;
// tự đoán: đường hông, vùng tay cầm vũ khí (phần nhô xa thân nhất ở nửa trên, nối thân ở một chỗ hẹp), vai, đầu vũ khí
function cdAutoRig(A, W, H, fxPx) {
  // hông: đi từ bàn chân lên, hết đoạn thấy 2 ống chân tách nhau (đáy háng) thì hông cao hơn một chút
  const xl = Math.max(0, Math.round(fxPx - 0.3 * H)), xr = Math.min(W - 1, Math.round(fxPx + 0.3 * H));
  let seen = 0, crotch = -1;
  for (let y = Math.round(H * 0.97); y > H * 0.42; y--) {
    let runs = 0, len = 0;
    for (let x = xl; x <= xr + 1; x++) {
      if (x <= xr && cdOp(A, W, x, y)) len++;
      else { if (len >= 2) runs++; len = 0; }
    }
    if (runs >= 2) seen++;
    else if (runs === 1 && seen >= H * 0.06) { crotch = y; break; }
  }
  const hip = Math.round(Math.min(H * 0.8, Math.max(H * 0.5, crotch > 0 ? crotch - H * 0.04 : H * 0.66)));
  const out = { hip };
  // thân ở eo: đoạn có hình chứa (hoặc gần nhất) tâm chân
  const yw = Math.max(0, hip - Math.round(H * 0.06));
  let L = -1, R = -1, best = 1e9;
  for (let x = 0; x < W;) {
    if (!cdOp(A, W, x, yw)) { x++; continue; }
    let e = x; while (e + 1 < W && cdOp(A, W, e + 1, yw)) e++;
    const dd = fxPx < x ? x - fxPx : fxPx > e ? fxPx - e : 0;
    if (dd < best) { best = dd; L = x; R = e; }
    x = e + 1;
  }
  if (L < 0) return out;
  const m = Math.round(H * 0.05), core = Math.round(H * 0.28);
  if (R - L > 2 * core) { L = Math.max(L, Math.round(fxPx - core)); R = Math.min(R, Math.round(fxPx + core)); }
  const nOp = (() => { let n = 0; for (let i = 3; i < A.length; i += 4) if (A[i] > 40) n++; return n; })();
  let pick = null;
  for (const side of [1, -1]) {
    const bx = side > 0 ? R + m : L - m;            // cột ranh giới thân / tay
    if (bx <= 0 || bx >= W - 1) continue;
    const lab = new Int32Array(W * H), inSide = (x) => (side > 0 ? x > bx : x < bx);
    let id = 0;
    for (let y0 = 0; y0 < hip; y0++) for (let x0 = 0; x0 < W; x0++) {
      if (!inSide(x0) || lab[y0 * W + x0] || !cdOp(A, W, x0, y0)) continue;
      id++;
      const st = [y0 * W + x0]; lab[st[0]] = id;
      const c = { id, n: 0, att: [], far: 0 };
      while (st.length) {
        const i = st.pop(), x = i % W, y = (i - x) / W;
        c.n++; c.far = Math.max(c.far, Math.abs(x - bx));
        if (x === bx + side && cdOp(A, W, bx, y)) c.att.push(y);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= hip || !inSide(nx)) continue;
          const j = ny * W + nx;
          if (!lab[j] && cdOp(A, W, nx, ny)) { lab[j] = id; st.push(j); }
        }
      }
      // tay: nối thân ở nửa trên (không phải đầu / mũ), đủ lớn, chìa đủ xa
      if (c.att.length < 2) continue;
      const aTop = Math.min(...c.att), aBot = Math.max(...c.att);
      if (aBot < H * 0.3 || aTop > hip - H * 0.04) continue;
      if (c.n < nOp * 0.012 || c.n > nOp * 0.45 || c.far < H * 0.07) continue;
      const score = c.n * (side > 0 ? 1.25 : 1);
      if (!pick || score > pick.score) pick = { score, side, bx, lab, id, aTop, aBot };
    }
  }
  if (!pick) return out;
  const mask = new Uint8Array(W * H);
  for (let i = 0; i < mask.length; i++) if (pick.lab[i] === pick.id) mask[i] = 1;
  const pv = [pick.bx, Math.round(pick.aTop + Math.min(pick.aBot - pick.aTop, H * 0.06) * 0.5)];
  out.mask = mask; out.pivot = pv; out.side = pick.side; out.tip = cdFarthest(mask, W, H, pv);
  return out;
}
// đầu vũ khí: điểm xa vai nhất; nếu phía trên vai có điểm gần xa bằng thì lấy điểm đó (đầu búa / đầu gậy, không phải cán chống đất)
function cdFarthest(mask, W, H, pv) {
  let b = 0, tip = pv, bu = 0, tu = null;
  for (let i = 0; i < mask.length; i++) if (mask[i]) {
    const x = i % W, y = (i - x) / W, d = (x - pv[0]) ** 2 + (y - pv[1]) ** 2;
    if (d > b) { b = d; tip = [x, y]; }
    if (y < pv[1] && d > bu) { bu = d; tu = [x, y]; }
  }
  return tu && bu >= b * 0.36 ? tu : tip;
}
// dựng rig từ ảnh đã cắt (p = cdPrepare) + rig chỉnh tay (toạ độ 0..1 theo ẢNH GỐC: hip, pivot, tip, poly, noArm)
function cdBuildRig(p, man) {
  const c = p.c, W = c.width, H = c.height, g = p.geo;
  const src = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, W, H), A = src.data;
  const auto = cdAutoRig(A, W, H, p.fx * W);
  const cx = (n) => (n * g.iw - g.sx) * g.q, cy = (n) => (n * g.ih - g.sy) * g.q;
  const P2 = (v) => v && [cx(v[0]), cy(v[1])];
  const hip = Math.round(man && man.hip != null ? Math.min(H - 2, Math.max(4, cy(man.hip))) : auto.hip);
  let mask = null, pivot = null, tip = null;
  if (man && man.poly && man.poly.length > 2) {
    const t = document.createElement('canvas'); t.width = W; t.height = H;
    const x = t.getContext('2d', { willReadFrequently: true });
    x.beginPath(); man.poly.forEach((v, i) => (i ? x.lineTo(cx(v[0]), cy(v[1])) : x.moveTo(cx(v[0]), cy(v[1])))); x.closePath(); x.fill();
    const d = x.getImageData(0, 0, W, H).data;
    mask = new Uint8Array(W * H);
    for (let i = 0; i < mask.length; i++) if (d[i * 4 + 3] > 127 && A[i * 4 + 3] > 40) mask[i] = 1;
  } else if (!(man && man.noArm)) mask = auto.mask || null;
  if (mask) {
    pivot = P2(man && man.pivot) || auto.pivot;
    if (!pivot) { let sx = 0, sy = 0, n = 0, my = H; for (let i = 0; i < mask.length; i++) if (mask[i]) { const x = i % W, y = (i - x) / W; if (y < my) my = y; } for (let i = 0; i < mask.length; i++) if (mask[i]) { const x = i % W, y = (i - x) / W; if (y < my + 4) { sx += x; sy += y; n++; } } pivot = [sx / n, sy / n]; }
    tip = P2(man && man.tip) || cdFarthest(mask, W, H, pivot);
  }
  const f = Math.max(2, Math.round(H * 0.025));     // dải chuyển tiếp mềm dưới hông
  const rc2 = (H * 0.045) ** 2;                     // giữ "mũ vai" trên thân cho khỏi hở khớp
  const lay = (h0, h1) => new ImageData(W, Math.max(1, h1 - h0));
  const legs = lay(0, H), up = lay(0, Math.min(H, hip + f));
  let ax0 = W, ay0 = H, ax1 = -1, ay1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, j = i * 4, a = A[j + 3];
    if (!a) continue;
    const arm = mask && mask[i];
    if (arm) { if (x < ax0) ax0 = x; if (x > ax1) ax1 = x; if (y < ay0) ay0 = y; if (y > ay1) ay1 = y; }
    const cap = arm && (x - pivot[0]) ** 2 + (y - pivot[1]) ** 2 < rc2;
    if (y >= hip && !arm) { legs.data.set(A.subarray(j, j + 4), j); }
    if (y < hip + f && (!arm || cap)) {
      up.data.set(A.subarray(j, j + 4), j);
      if (y >= hip) up.data[j + 3] = a * (1 - (y - hip + 1) / (f + 1));
    }
  }
  const toC = (im) => { const k = document.createElement('canvas'); k.width = im.width; k.height = im.height; k.getContext('2d').putImageData(im, 0, 0); k.naturalWidth = k.width; k.naturalHeight = k.height; return k; };
  const R = { W, H, hip, f, legs: toC(legs), upper: toC(up), arm: null, pivot, tip, side: 1, len: 0, auto: !(man && (man.poly || man.pivot)) };
  if (mask && ax1 >= ax0) {
    const am = new ImageData(ax1 - ax0 + 1, ay1 - ay0 + 1);
    for (let y = ay0; y <= ay1; y++) for (let x = ax0; x <= ax1; x++) { const i = y * W + x; if (mask[i]) am.data.set(A.subarray(i * 4, i * 4 + 4), ((y - ay0) * am.width + (x - ax0)) * 4); }
    R.arm = toC(am); R.ax0 = ax0; R.ay0 = ay0;
    R.side = tip[0] >= pivot[0] ? 1 : -1; R.len = Math.max(4, Math.hypot(tip[0] - pivot[0], tip[1] - pivot[1]));
  }
  return R;
}
function cdRig(p, type) {
  if (CD.noRig) return null;
  const m = p.rigs || (p.rigs = new Map());
  if (m.has(type)) return m.get(type);
  let R = null;
  try { R = cdBuildRig(p, (typeof RIGS !== 'undefined' && RIGS[type]) || null); } catch (e) { R = null; }   // ảnh khác nguồn (file://) → không đọc được điểm ảnh
  m.set(type, R);
  return R;
}

// tay theo loại vũ khí: a = góc xoay (rad, + = chém xuống với tay chìa phải), d = dịch theo trục tay (phần chiều dài tay)
function cdArm(kind, swing, castT, hurt, t, seed) {
  let a = Math.sin(t * 1.7 + seed) * 0.035, d = 0;
  if (swing > 0) {
    const u = 1 - swing;
    const ph = u < 0.3 ? 0 : u < 0.46 ? 1 : 2, k = ph === 0 ? cdOut(u / 0.3) : ph === 1 ? cdOut((u - 0.3) / 0.16) : cdInOut((u - 0.46) / 0.54);
    const curve = (w, s) => (ph === 0 ? w * k : ph === 1 ? w + (s - w) * k : s * (1 - k));   // lấy đà w → ra đòn s → về 0
    if (kind === 'slash') a += curve(-1.25, 0.9);
    else if (kind === 'chop') a += curve(-1.5, 1.05);
    else if (kind === 'orb') a += curve(-0.95, 0.25);
    else if (kind === 'thrust') { a += curve(-0.12, 0.02); d += curve(-0.16, 0.26); }
    else if (kind === 'punch') { a += curve(-0.18, 0); d += curve(-0.12, 0.3); }
    else { a += curve(-0.05, 0.02); d += curve(-0.07, 0.03); }   // cung / nỏ: kéo lùi rồi bật
  }
  if (castT > 0) a += (kind === 'orb' ? -1.1 : -0.85) * cdInOut(Math.min(1, castT / 0.3));
  if (hurt > 0) { const k = Math.min(1, hurt / 0.2); a += 0.18 * k; d -= 0.04 * k; }
  return { a, d };
}
// điểm (x, y) của thân trên sau khi uốn (bend) + nhún (sy) quanh hông
function cdUpMap(R, x, y, bend, sy) {
  const up = (R.hip - y) / R.hip;
  if (up <= 0) return [x, y];
  return [x + bend * R.hip * up * up, R.hip - (R.hip - y) * sy];
}
function cdArmTip(R, st, kind, bend, sy) {
  const A = cdArm(kind, st.swing || 0, st.castT || 0, st.hurt || 0, st.t, st.seed);
  const pv = cdUpMap(R, R.pivot[0], R.pivot[1], bend, sy), up = Math.max(0, (R.hip - R.pivot[1]) / R.hip);
  const ang = A.a * R.side + 2 * bend * up;
  const vx = R.tip[0] - R.pivot[0], vy = R.tip[1] - R.pivot[1], k = 1 + A.d;
  const c = Math.cos(ang), s = Math.sin(ang);
  return { pv, ang, d: A.d, tip: [pv[0] + (vx * k) * c - (vy * k) * s, pv[1] + (vx * k) * s + (vy * k) * c] };
}
const cdRigBend = (P) => (P.bend + P.dx + P.rot * 0.9) * 0.6;
const cdTintC = (c, color) => { const m = c.__tint || (c.__tint = new Map()); let t = m.get(color); if (!t) { t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d'); x.drawImage(c, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = color; x.fillRect(0, 0, t.width, t.height); t.naturalWidth = t.width; t.naturalHeight = t.height; m.set(color, t); } return t; };
// vẽ thân trên theo lát ngang: lát dưới hông giữ nguyên, càng lên cao càng lệch (cong mềm, không gãy ở hông)
function cdDrawUpper(ctx, R, img, bend, sy) {
  const hip = R.hip, w = img.width;
  if (img.height > hip) ctx.drawImage(img, 0, hip, w, img.height - hip, 0, hip, w, img.height - hip);
  const tr = ctx.getTransform(), scr = Math.hypot(tr.c, tr.d) * hip;
  const lv = typeof GFX_LEVEL === 'function' ? GFX_LEVEL() : 0;
  const n = Math.abs(bend) < 0.002 ? 1 : lv >= 2 || scr < 30 ? 3 : Math.max(4, Math.min(12, Math.round(scr / (lv === 1 ? 16 : 9))));
  for (let i = 0; i < n; i++) {
    const y0 = hip * i / n, y1 = hip * (i + 1) / n, um = 1 - (y0 + y1) / 2 / hip;
    const dx = n === 1 ? 0 : bend * hip * um * um;
    const Y0 = hip - (hip - y0) * sy, Y1 = hip - (hip - y1) * sy;
    ctx.drawImage(img, 0, y0, w, y1 - y0 + (i < n - 1 ? 0.7 : 0), dx, Y0, w, Y1 - Y0 + (i < n - 1 ? 0.7 * sy : 0));
  }
}
// một khung của nhân vật có rig (toạ độ = điểm ảnh của ảnh cắt; gốc = góc trên trái). st: như cdPose; o: { kind, col, glow:[màu, mờ, độ đậm],
//   flash, flashC, noArm, noFx, gfxBlur(k) }
function cdRigFrame(ctx, R, P, st, o) {
  const bend = cdRigBend(P), sy = P.sy;
  const base = ctx.globalAlpha;
  const T = R.arm ? cdArmTip(R, st, o.kind, bend, sy) : null;
  const glow = o.glow && typeof drawGlowOnly === 'function' ? o.glow : null;
  const armDraw = (img) => {
    if (!R.arm || o.noArm) return;
    ctx.save(); ctx.translate(T.pv[0], T.pv[1]); ctx.rotate(T.ang);
    const ux = (R.tip[0] - R.pivot[0]) / R.len, uy = (R.tip[1] - R.pivot[1]) / R.len;
    ctx.translate(ux * T.d * R.len, uy * T.d * R.len);
    if (img === 'glow') drawGlowOnly(ctx, R.arm, R.ax0 - R.pivot[0], R.ay0 - R.pivot[1], R.arm.width, R.arm.height, glow[0], glow[1], glow[2]);
    else ctx.drawImage(img, R.ax0 - R.pivot[0], R.ay0 - R.pivot[1]);
    ctx.restore();
  };
  if (glow) {
    drawGlowOnly(ctx, R.legs, 0, 0, R.W, R.H, glow[0], glow[1], glow[2]);
    drawGlowOnly(ctx, R.upper, cdRigBend(P) * R.hip * 0.3, 0, R.W, R.upper.height, glow[0], glow[1], glow[2]);
    armDraw('glow');
  }
  ctx.drawImage(R.legs, 0, 0);
  cdDrawUpper(ctx, R, R.upper, bend, sy);
  if (R.arm && !o.noArm) armDraw(R.arm);
  if (P.flash > 0) {
    const fc = o.flashC || P.flashC;
    ctx.globalAlpha = base * P.flash;
    ctx.drawImage(cdTintC(R.legs, fc), 0, 0);
    cdDrawUpper(ctx, R, cdTintC(R.upper, fc), bend, sy);
    if (R.arm && !o.noArm) armDraw(cdTintC(R.arm, fc));
    ctx.globalAlpha = base;
  }
  if (!o.noFx && R.arm && !o.noArm) cdRigFx(ctx, R, P, st, o, bend, sy, T);
  return T;
}
// vệt theo ĐẦU VŨ KHÍ (lấy vị trí đầu vũ khí ở các thời điểm trước → dải mờ dần), tia lửa, mũi tên / quả cầu ở đầu vũ khí
function cdRigFx(ctx, R, P, st, o, bend, sy, T) {
  const kind = o.kind, col = o.col || '#FFF1C4', Hc = R.H;
  if (!P.phase || P.phase === 'cast') return;
  const strike = P.phase === 'strike', rec = P.phase === 'recover';
  ctx.save();
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if ((kind === 'slash' || kind === 'chop' || kind === 'thrust' || kind === 'punch') && (strike || (rec && P.k < 0.35))) {
    const fade = strike ? 1 : 1 - P.k / 0.35, pts = [];
    for (let j = 0; j <= 9; j++) {
      const sw = Math.min(1, st.swing + j * 0.022);
      const Pj = cdPose({ ...st, swing: sw });
      pts.push(cdArmTip(R, { ...st, swing: sw }, kind, cdRigBend(Pj), Pj.sy).tip);
    }
    for (let pass = 0; pass < 2; pass++) for (let j = 1; j < pts.length; j++) {
      const age = j / pts.length;
      ctx.globalAlpha = fade * (1 - age) * (pass ? 0.95 : 0.4);
      ctx.strokeStyle = pass ? '#FFFFFF' : col;
      ctx.lineWidth = Hc * (pass ? 0.022 : 0.06) * (1 - age * 0.7);
      ctx.beginPath(); ctx.moveTo(pts[j - 1][0], pts[j - 1][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke();
    }
    if (strike && P.k > 0.6 || rec && P.k < 0.2) {   // tia lửa ở đầu vũ khí lúc trúng
      const q = strike ? (P.k - 0.6) / 0.4 * 0.4 : 0.4 + P.k / 0.2 * 0.6, [sx, sy2] = T.tip;
      ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#FFF1A8'; ctx.lineWidth = Hc * 0.012;
      for (let i = 0; i < 7; i++) { const a = st.seed + i * 0.9, r0 = q * 0.1 * Hc, r1 = r0 + 0.05 * Hc * (1 - q); ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * r0, sy2 + Math.sin(a) * r0); ctx.lineTo(sx + Math.cos(a) * r1, sy2 + Math.sin(a) * r1); ctx.stroke(); }
      if (typeof fxImage === 'function') fxImage(ctx, 'spark_01', col, sx, sy2, 0.14 * Hc, st.seed, 1, (1 - q) * 0.8);
    }
  } else if (kind === 'shot') {
    const [hx, hy] = T.tip, dirx = Math.cos(T.ang) * R.side, diry = Math.sin(T.ang) * R.side;
    if (P.phase === 'wind') { ctx.globalAlpha = 0.5 * P.k; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(hx, hy, 0.03 * Hc * (1 + P.k), 0, Math.PI * 2); ctx.fill(); }
    else if (strike || (rec && P.k < 0.4)) {
      const d = (strike ? P.k : 1 + P.k * 2) * 0.6 * Hc, fade = strike ? 1 : 1 - P.k / 0.4;
      const ex = hx + dirx * d, ey = hy + diry * d * 0.3;
      ctx.globalAlpha = fade; ctx.strokeStyle = col; ctx.lineWidth = Hc * 0.018;
      ctx.beginPath(); ctx.moveTo(ex - dirx * 0.25 * Hc, ey); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#F6EFD8';
      ctx.beginPath(); ctx.moveTo(ex + dirx * 0.05 * Hc, ey); ctx.lineTo(ex - dirx * 0.01 * Hc, ey - 0.025 * Hc); ctx.lineTo(ex - dirx * 0.01 * Hc, ey + 0.025 * Hc); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      if (strike) { ctx.globalAlpha = 1 - P.k; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(hx, hy, 0.05 * Hc, 0, Math.PI * 2); ctx.fill(); }
    }
  } else if (kind === 'orb') {
    const [ox, oy] = T.tip, fade = strike ? 1 : rec ? Math.max(0, 1 - P.k * 2.2) : 0.95;
    const r = P.phase === 'wind' ? (0.05 + 0.07 * P.k) * Hc : strike ? (0.12 + 0.1 * P.k) * Hc : 0.12 * Hc * fade;
    if (r > 0.5) {
      ctx.globalAlpha = strike ? 1 - P.k * 0.6 : fade;
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
      g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.35, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
      if (strike) { ctx.strokeStyle = col; ctx.lineWidth = Hc * 0.022; ctx.globalAlpha = 1 - P.k; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + R.side * 0.7 * Hc * P.k, oy + 0.25 * Hc * P.k); ctx.stroke(); }
    }
  }
  ctx.restore();
}

// viền sáng theo bậc (như packGlow của bộ vẽ tay) → [màu, độ mờ, độ đậm] hoặc null
function cdTierGlow(h, look, def, t, tier, asc) {
  const L = def.legend, pulse = Math.sin(t * 3) * 0.12;
  if (L && typeof AURA_C !== 'undefined') return [AURA_C[L], 10 + asc * 4 + (L === 'legendary' ? 4 : 0), 0.85 + pulse];
  if (tier >= 2) return [look.attrColor, 5 + tier * 2, 0.55 + pulse];
  if (typeof hasLegendGear === 'function' && hasLegendGear(h)) return ['#FFB01E', 14, 0.6 + pulse];
  return null;
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
  const R = cdRig(p, h.type);
  const H = CD_HERO_H;
  let lift = 0;
  if (o.summon > 0) lift = -60 * (o.summon / 0.5) * (o.summon / 0.5);
  if (o.bounce > 0) lift -= (4 * DK / s) * Math.sin(Math.PI * (1 - o.bounce / 0.3));
  ctx.save();
  ctx.globalAlpha *= (o.alpha ?? 1) * P.alpha;
  ctx.translate(x, y);
  if (!o.noShadow) {
    // bóng co lại khi nhún lên / nhảy
    const up = Math.min(1, Math.max(0, -((R ? P.hop || 0 : P.dy) * H + lift) / 40));
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(R ? 0 : P.dx * H * s * dir * 0.5, 0, 13 * DK * (s / 0.28) * (1 - 0.3 * up), 4 * DK * (s / 0.28) * (1 - 0.3 * up), 0, 0, Math.PI * 2);
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
  if (R) {
    // rig 3 lớp: chân đứng yên tuyệt đối, chỉ thân trên ngả / nhún quanh hông, tay cầm vũ khí vung quanh vai
    ctx.save();
    if (dying) cdApply(ctx, P, H); else ctx.translate(0, (P.hop || 0) * H);
    const k = H / R.H;
    ctx.scale(k, k); ctx.translate(-p.fx * R.W, -R.H);
    const st = { t, seed, swing: dying ? 0 : o.swing || 0, castT: dying ? 0 : o.castT || 0, castUlt: !!o.castUlt, hurt: o.hurt || 0, melee: def.attack === 'melee' };
    const PP = dying ? { ...P, bend: 0, dx: 0, rot: 0, sy: 1, phase: '' } : P;
    const tg = P.glow > 0 ? [o.castColor || look.attrColor || '#FFE08A', 12 * P.glow * (o.castUlt ? 1.4 : 1), 0.85 * P.glow] : !dying && cdTierGlow(h, look, def, t, tierShown, ascShown);
    cdRigFrame(ctx, R, PP, st, { kind, col: look.attrColor, glow: tg ? [tg[0], tg[1] / k, tg[2]] : null,
      flashC: o.hurt > 0 ? (Math.floor(t * 30) % 2 ? '#FFFFFF' : '#FF5A4A') : null, noArm: CD.noArm, noFx: CD.noFx || dying });
    ctx.restore();
    if (!dying) drawPackFront(ctx, h, def, t, H, ascShown);
    ctx.restore();
    if (o.bog) drawBogWater(ctx, x, y, s, t);
    return { top: y - (H + 12 - lift) * s * Math.max(1, P.sy), s };
  }
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
