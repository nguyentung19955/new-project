'use strict';

// ============================================================
//  TRANG PHỤC THEO SAO, THẦN TINH VÀ HOẠT ẢNH RIÊNG TỪNG TƯỚNG (v44)
//  Vẽ thẳng bằng canvas (hình tự vẽ), dùng chung hệ toạ độ đồ của withProc():
//  đầu tại (0,-34) bán kính 8 · vai y -26, x ±8 · thắt lưng y -12 · chân y 0.
//  ★1 áo gốc · ★2 + giáp vai đồng, đai lưng, băng trán đồng ·
//  ★3 + áo choàng viền hoa văn Đông Sơn, vương miện lông chim Lạc vàng, mặt trống đồng trước ngực.
//  Tướng Tím / Vàng giữ trang phục riêng; Thần tinh: TT1 vòng sáng sau đầu ·
//  TT2 + 2 viên ngọc bay quanh · TT3 + vầng trống đồng 12 cánh.
// ============================================================

// kiểu đứng (idle) và kiểu đánh (atk) của từng tướng
const HERO_STYLE = {
  lactuong:  { idle: 'guard', atk: 'bash' },     // khiên đẩy tới rồi bổ rìu
  lucsi:     { idle: 'heavy', atk: 'slam' },     // giơ cao đập xuống, đất nứt
  thosan:    { idle: 'crouch', atk: 'flurry' },  // hai nhát dao chéo liên tiếp
  xathu:     { idle: 'aim', atk: 'volley' },     // ngắm, giật nỏ
  thaymo:    { idle: 'sway', atk: 'twirl' },     // xoay gậy lửa
  thansuong: { idle: 'float', atk: 'thrust' },   // lơ lửng, đâm gậy băng
  giong:     { idle: 'heavy', atk: 'spin' },     // xoay gậy sắt một vòng
  llq:       { idle: 'float', atk: 'claw' },     // vuốt rồng
  kimquy:    { idle: 'heavy', atk: 'slam' },
  thachsanh: { idle: 'guard', atk: 'cleave' },   // bổ rìu thật mạnh
  caolo:     { idle: 'aim', atk: 'volley' },
  antiem:    { idle: 'sway', atk: 'toss' },      // ném dưa
  auco:      { idle: 'float', atk: 'float' },
  cdt:       { idle: 'float', atk: 'twirl' },
  tiendung:  { idle: 'dance', atk: 'float' },
  langlieu:  { idle: 'sway', atk: 'toss' },
  lachau:    { idle: 'guard', atk: 'bash' },
  thansan:   { idle: 'crouch', atk: 'flurry' },
  adv:       { idle: 'aim', atk: 'volley' },
  mau:       { idle: 'float', atk: 'float' },
  thoren:    { idle: 'heavy', atk: 'slam' },
  nguphu:    { idle: 'crouch', atk: 'thrust' },
  thogom:    { idle: 'sway', atk: 'toss' },
  thaylang:  { idle: 'sway', atk: 'twirl' },
  trongdong: { idle: 'heavy', atk: 'bash' },
  caong:     { idle: 'heavy', atk: 'slam' },
  ongtao:    { idle: 'guard', atk: 'flurry' },
  matroi:    { idle: 'float', atk: 'float' },
  mauthoai:  { idle: 'float', atk: 'twirl' },
  trutroi:   { idle: 'heavy', atk: 'slam' },
  ongho:     { idle: 'crouch', atk: 'flurry' },
  dotnuong:  { idle: 'crouch', atk: 'cleave' },
  denroi:    { idle: 'dance', atk: 'toss' },
  potaoapui: { idle: 'guard', atk: 'cleave' },
  baahoa:    { idle: 'float', atk: 'twirl' },
  kinhduong: { idle: 'heavy', atk: 'cleave' },
  viemde:    { idle: 'sway', atk: 'twirl' },
  chodo:     { idle: 'guard', atk: 'spin' },
  haisen:    { idle: 'dance', atk: 'toss' },
  lyngu:     { idle: 'crouch', atk: 'thrust' },
  truongchi: { idle: 'sway', atk: 'float' },
  halong:    { idle: 'float', atk: 'claw' },
  longnu:    { idle: 'float', atk: 'twirl' },
  dapde:     { idle: 'heavy', atk: 'slam' },
  chantrau:  { idle: 'aim', atk: 'volley' },
  ongdung:   { idle: 'heavy', atk: 'slam' },
  thocong:   { idle: 'sway', atk: 'twirl' },
  tanvien:   { idle: 'heavy', atk: 'spin' },
  maudia:    { idle: 'float', atk: 'float' },
};
const heroStyle = (type) => HERO_STYLE[type] || { idle: 'guard', atk: null };

// dáng đứng: dy (khung 200×230, âm = lên), rot (nghiêng thêm)
function idlePose(style, t, seed) {
  switch (style.idle) {
    case 'float': return { dy: -6 - Math.sin(t * 2 + seed) * 5, rot: Math.sin(t * 1.3 + seed) * 0.02 };
    case 'heavy': return { dy: Math.sin(t * 1.6 + seed) * 2.5, rot: 0 };
    case 'crouch': return { dy: 4 + Math.sin(t * 3.2 + seed) * 1.5, rot: 0.05 };
    case 'sway': return { dy: 0, rot: Math.sin(t * 1.8 + seed) * 0.045 };
    case 'dance': return { dy: -Math.abs(Math.sin(t * 2.4 + seed)) * 5, rot: Math.sin(t * 2.4 + seed) * 0.06 };
    case 'aim': return { dy: 0, rot: -0.02 + Math.sin(t * 1.1 + seed) * 0.01 };
    default: return { dy: Math.sin(t * 2.4 + seed) * 1.2, rot: 0 };
  }
}

// đòn đánh riêng: trả về null thì dùng đòn mặc định theo kiểu tấn công
function styledAttackPose(style, swing, castT) {
  if (castT > 0 || !(swing > 0) || !style.atk) return null;
  const P = { armF: 0, armB: 0, lunge: 0, lift: 0, recoil: 0, big: 1, lean: 0, sqx: 1, sqy: 1, phase: '', k: 0 };
  const u = 1 - swing;
  const ph = (a, b) => (u < a ? null : u < b ? (u - a) / (b - a) : null);
  switch (style.atk) {
    case 'slam': {             // giơ cao (0–0,4) → đập xuống (0,4–0,55) → nén đất, thu về
      // tay trước đang giơ cao (vũ khí / tảng đá trên đầu): lấy đà ngả ra sau một chút rồi đập tới trước
      if (u < 0.4) { const k = easeOut(u / 0.4); P.armF = -0.45 * k; P.lift = -10 * k; P.lean = -0.12 * k; P.sqy = 1 + 0.08 * k; P.sqx = 1 - 0.05 * k; P.phase = 'wind'; P.k = k; }
      else if (u < 0.55) { const k = (u - 0.4) / 0.15; P.armF = -0.45 + 1.95 * k; P.lift = -10 + 14 * k; P.lean = -0.12 + 0.24 * k; P.sqy = 1.08 - 0.2 * k; P.sqx = 0.95 + 0.17 * k; P.lunge = 8 * k; P.phase = 'strike'; P.k = k; }
      else { const k = easeInOut((u - 0.55) / 0.45); P.armF = 1.5 * (1 - k); P.lift = 4 * (1 - k); P.lean = 0.12 * (1 - k); P.sqy = 0.88 + 0.12 * k; P.sqx = 1.12 - 0.12 * k; P.lunge = 8 * (1 - k); P.phase = 'recover'; P.k = k; }
      return P;
    }
    case 'cleave': {           // như slam nhưng lao tới xa hơn
      const Q = styledAttackPose({ atk: 'slam' }, swing, 0);
      Q.lunge *= 2.4; return Q;
    }
    case 'bash': {             // khiên đẩy tới (tay sau) rồi rìu bổ (tay trước)
      if (u < 0.3) { const k = easeOut(u / 0.3); P.armB = -0.9 * k; P.lunge = 10 * k; P.lean = 0.06 * k; P.phase = 'wind'; P.k = k; }
      else if (u < 0.5) { const k = (u - 0.3) / 0.2; P.armB = -0.9 + 0.5 * k; P.armF = -1.2 + 2.6 * k; P.lunge = 10 + 10 * k; P.lean = 0.06 + 0.08 * k; P.sqx = 1 + 0.06 * k; P.phase = 'strike'; P.k = k; }
      else { const k = easeInOut((u - 0.5) / 0.5); P.armB = -0.4 * (1 - k); P.armF = 1.4 * (1 - k); P.lunge = 20 * (1 - k); P.lean = 0.14 * (1 - k); P.sqx = 1 + 0.06 * (1 - k); P.phase = 'recover'; P.k = k; }
      return P;
    }
    case 'flurry': {           // hai nhát chéo nhanh
      const k1 = ph(0.1, 0.32), k2 = ph(0.42, 0.62);
      if (u < 0.1) { const k = u / 0.1; P.armF = -1 * k; P.armB = 0.6 * k; P.lean = 0.08 * k; P.phase = 'wind'; P.k = k; }
      else if (k1 !== null) { P.armF = -1 + 2.4 * k1; P.lunge = 14 * k1; P.lean = 0.12; P.phase = 'strike'; P.k = k1; P.cut = 1; }
      else if (u < 0.42) { const k = (u - 0.32) / 0.1; P.armF = 1.4 - 0.4 * k; P.armB = 0.6 - 1.6 * k; P.lunge = 14; P.lean = 0.12; P.phase = 'wind'; P.k = k; }
      else if (k2 !== null) { P.armB = -1 + 2.2 * k2; P.armF = 1; P.lunge = 14 + 6 * k2; P.lean = 0.14; P.phase = 'strike'; P.k = k2; P.cut = 2; }
      else { const k = easeInOut((u - 0.62) / 0.38); P.armF = (1 - k); P.armB = 1.2 * (1 - k); P.lunge = 20 * (1 - k); P.lean = 0.14 * (1 - k); P.phase = 'recover'; P.k = k; }
      return P;
    }
    case 'spin': {             // xoay gậy trọn một vòng quanh người
      if (u < 0.2) { const k = easeOut(u / 0.2); P.armF = -0.8 * k; P.lean = -0.06 * k; P.phase = 'wind'; P.k = k; }
      else if (u < 0.6) { const k = (u - 0.2) / 0.4; P.armF = -0.8 + Math.PI * 2 * k; P.lean = 0.08 * Math.sin(k * Math.PI); P.lunge = 10 * Math.sin(k * Math.PI); P.sqx = 1 + 0.05 * Math.sin(k * Math.PI); P.phase = 'strike'; P.k = k; P.spin = 1; }
      else { const k = easeInOut((u - 0.6) / 0.4); P.armF = (Math.PI * 2 - 0.8) * (1 - k); P.phase = 'recover'; P.k = k; }
      return P;
    }
    case 'thrust': {           // đâm thẳng tới
      if (u < 0.3) { const k = easeOut(u / 0.3); P.armF = -0.3 * k; P.lunge = -6 * k; P.phase = 'wind'; P.k = k; }
      else if (u < 0.45) { const k = (u - 0.3) / 0.15; P.armF = -0.3 + 1.6 * k; P.lunge = -6 + 24 * k; P.lean = 0.1 * k; P.sqx = 1 + 0.08 * k; P.phase = 'strike'; P.k = k; P.stab = 1; }
      else { const k = easeInOut((u - 0.45) / 0.55); P.armF = 1.3 * (1 - k); P.lunge = 18 * (1 - k); P.lean = 0.1 * (1 - k); P.phase = 'recover'; P.k = k; }
      return P;
    }
    case 'claw': {             // vuốt rồng: vung tay sau, rồi tay trước
      const Q = styledAttackPose({ atk: 'flurry' }, swing, 0);
      Q.lunge *= 0.7; Q.claw = 1; return Q;
    }
    case 'twirl': {            // xoay gậy trên đầu rồi chỉ tới
      if (u < 0.45) { const k = u / 0.45; P.armF = -1.6 - Math.PI * 2 * easeInOut(k); P.lift = -6 * Math.sin(k * Math.PI); P.phase = 'wind'; P.k = k; P.twirl = 1; }
      else if (u < 0.6) { const k = (u - 0.45) / 0.15; P.armF = -1.6 + 2.4 * k; P.lean = 0.08 * k; P.phase = 'strike'; P.k = k; }
      else { const k = easeInOut((u - 0.6) / 0.4); P.armF = 0.8 * (1 - k); P.lean = 0.08 * (1 - k); P.phase = 'recover'; P.k = k; }
      return P;
    }
    case 'toss': {             // vung tay ném vòng cung
      if (u < 0.35) { const k = easeOut(u / 0.35); P.armF = -2.6 * k; P.lean = -0.08 * k; P.lift = -3 * k; P.phase = 'wind'; P.k = k; }
      else if (u < 0.5) { const k = (u - 0.35) / 0.15; P.armF = -2.6 + 3.6 * k; P.lean = -0.08 + 0.18 * k; P.lunge = 8 * k; P.phase = 'strike'; P.k = k; P.toss = 1; }
      else { const k = easeInOut((u - 0.5) / 0.5); P.armF = 1 * (1 - k); P.lean = 0.1 * (1 - k); P.lunge = 8 * (1 - k); P.phase = 'recover'; P.k = k; }
      return P;
    }
    case 'float': {            // bay lên, dang tay phóng phép
      if (u < 0.35) { const k = easeOut(u / 0.35); P.armF = -0.6 * k; P.armB = 0.5 * k; P.lift = -12 * k; P.sqy = 1 + 0.05 * k; P.phase = 'wind'; P.k = k; }
      else if (u < 0.5) { const k = (u - 0.35) / 0.15; P.armF = -0.6 + 1.4 * k; P.armB = 0.5 - 1 * k; P.lift = -12; P.phase = 'strike'; P.k = k; P.burst = 1; }
      else { const k = easeInOut((u - 0.5) / 0.5); P.armF = 0.8 * (1 - k); P.armB = -0.5 * (1 - k); P.lift = -12 * (1 - k); P.phase = 'recover'; P.k = k; }
      return P;
    }
    default: return null;      // 'volley': dùng đòn nỏ mặc định
  }
}

// hiệu ứng riêng của từng kiểu đòn (khung 200×230, đã lật theo hướng)
// ảnh hiệu ứng Kenney (assets/fx) nếu đã tải: vẽ quanh (cx, cy), cỡ r, xoay rot, dẹt sy
function fxImage(ctx, name, color, cx, cy, r, rot = 0, sy = 1, alpha = 1) {
  const im = typeof VFX !== 'undefined' && VFX.tex ? VFX.tex(name, color) : null;
  if (!im) return false;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(cx, cy); if (sy !== 1) ctx.scale(1, sy); ctx.rotate(rot);
  ctx.drawImage(im, -r, -r, r * 2, r * 2);
  ctx.restore();
  return true;
}
function drawStyleFx(ctx, P, look, t) {
  if (!P.phase || P.phase === 'wind') return;
  const col = look.weapon ? (look.weapon.set ? '#9EF2E0' : RAR_COLOR[look.weapon.rarity]) : look.attrColor;
  const fade = P.phase === 'strike' ? 1 : Math.max(0, 1 - P.k * 2.2);
  if (fade <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // lớp ảnh Kenney: vết chém / vuốt, xoáy, vòng sóng đất, vòng phép
  if (P.cut) fxImage(ctx, P.claw ? 'scratch_01' : 'slash_03', P.claw ? '#7FE0F0' : col, 160, 125, 70, P.cut === 1 ? 0.2 : 2.6, 1, 0.9 * fade);
  if (P.spin && P.phase === 'strike') fxImage(ctx, 'twirl_01', col, 100, 140, 120, P.k * Math.PI * 2, 0.6, 0.85);
  if (P.sqy < 0.95 || (P.phase === 'recover' && P.lift > 0)) fxImage(ctx, 'circle_03', '#E8C070', 150, 222, 40 + 80 * (P.phase === 'strike' ? P.k : 1), 0, 0.3, 0.8 * fade);
  if (P.burst) fxImage(ctx, 'magic_03', look.attrColor, 150, 100, 30 + 50 * P.k, t, 1, 1 - P.k);
  if (P.stab) fxImage(ctx, 'trace_05', col, 200, 120, 70, Math.PI / 2, 1, fade);
  if (P.sqy < 0.95 || (P.phase === 'recover' && P.lift > 0)) {
    // slam / cleave: sóng đất toả ra dưới chân phía trước
    const r = 30 + 70 * (P.phase === 'strike' ? P.k : 1);
    ctx.globalAlpha = 0.7 * fade;
    ctx.strokeStyle = '#E8C070'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(150, 222, r, r * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#FFF1C4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(150, 222, r * 0.7, r * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
    // đá văng
    ctx.fillStyle = '#B89A6A';
    for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.15 + i * 0.14); ctx.beginPath(); ctx.arc(150 + Math.cos(a) * r * 0.8, 222 + Math.sin(a) * r * 0.6, 4, 0, Math.PI * 2); ctx.fill(); }
  }
  if (P.cut) {
    // flurry / claw: hai vệt chéo
    ctx.globalAlpha = 0.9 * fade;
    for (const [i, w] of [[0, 14], [1, 4]]) {
      ctx.strokeStyle = i ? '#FFFFFF' : (P.claw ? '#7FE0F0' : col); ctx.lineWidth = w;
      for (let j = 0; j < (P.claw ? 3 : 1); j++) {
        const o = j * 12;
        ctx.beginPath();
        if (P.cut === 1) { ctx.moveTo(130 + o, 70); ctx.quadraticCurveTo(190 + o, 110, 160 + o, 180); }
        else { ctx.moveTo(190 - o, 80); ctx.quadraticCurveTo(130 - o, 120, 150 - o, 185); }
        ctx.stroke();
      }
    }
  }
  if (P.spin && P.phase === 'strike') {
    // spin: vòng tròn kín quanh người
    ctx.globalAlpha = 0.75;
    for (const [w, a] of [[24, 0.25], [8, 0.6], [3, 1]]) {
      ctx.strokeStyle = a === 1 ? '#FFFFFF' : col; ctx.lineWidth = w; ctx.globalAlpha = a * 0.8;
      ctx.beginPath(); ctx.ellipse(100, 140, 110, 60, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * P.k); ctx.stroke();
    }
  }
  if (P.stab) {
    // thrust: vệt đâm thẳng
    ctx.globalAlpha = fade;
    const g = ctx.createLinearGradient(120, 0, 260, 0);
    g.addColorStop(0, hexA(col, '00')); g.addColorStop(0.6, hexA(col, 'cc')); g.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(120, 112); ctx.lineTo(260, 120); ctx.lineTo(120, 128); ctx.closePath(); ctx.fill();
  }
  if (P.toss) {
    // toss: vệt vòng cung theo tay ném
    ctx.globalAlpha = 0.8 * fade;
    ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.arc(122, 124, 80, -2.4, -2.4 + 3.6 * P.k); ctx.stroke(); ctx.setLineDash([]);
  }
  if (P.burst) {
    // float: vòng phép bung ra quanh tay
    const r = 20 + 60 * P.k;
    ctx.globalAlpha = (1 - P.k) * 0.9;
    ctx.strokeStyle = look.attrColor; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(150, 100, r, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t; circle(ctx, 150 + Math.cos(a) * r, 100 + Math.sin(a) * r, 3, '#FFFFFF'); }
  }
  ctx.restore();
}
// xoay gậy (twirl): vệt tròn trên đầu lúc lấy đà
function drawTwirlFx(ctx, P, look) {
  if (!P.twirl) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  fxImage(ctx, 'twirl_02', look.attrColor, 122, 40, 70, P.k * Math.PI * 4, 0.35, 0.8 * Math.sin(P.k * Math.PI));
  ctx.globalAlpha = 0.6 * Math.sin(P.k * Math.PI);
  ctx.strokeStyle = look.attrColor; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.ellipse(122, 40, 70, 22, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// ---------- trang phục theo sao (tướng thường) ----------
const BRONZE = { main: '#B8853A', dark: '#6A4618', light: '#F2D27A' };
const GOLD = { main: '#E8B83A', dark: '#8A5A10', light: '#FFF1C4' };

// ★★★: áo choàng sau lưng, đung đưa, viền hoa văn răng cưa Đông Sơn
function drawCostumeBack(ctx, look, t, tier) {
  if (look.legend || tier < 3) return;
  const sw = Math.sin(t * 2.2) * 1.5;
  const c = look.attrColor;
  ctx.save();
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.moveTo(-8, -27); ctx.lineTo(8, -27);
  ctx.quadraticCurveTo(12, -14, 13 + sw, -3);
  ctx.lineTo(-13 + sw, -3);
  ctx.quadraticCurveTo(-12, -14, -8, -27);
  ctx.closePath(); ctx.fill(); outline(ctx, 0.6);
  // bóng tối phía trong
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.moveTo(-4, -26); ctx.lineTo(4, -26); ctx.lineTo(6 + sw, -4); ctx.lineTo(-6 + sw, -4); ctx.closePath(); ctx.fill();
  // viền răng cưa vàng
  ctx.strokeStyle = GOLD.light; ctx.lineWidth = 0.7;
  ctx.beginPath();
  for (let i = 0; i <= 13; i++) ctx.lineTo(-13 + sw + i * 2, -4 - (i % 2) * 1.4);
  ctx.stroke();
  ctx.restore();
}

// ★★ trở lên: giáp vai đồng + đai lưng; ★★★: viền vàng, mặt trống đồng trước ngực, chuỗi hạt
function drawCostumeBody(ctx, look, t, tier) {
  if (look.legend || tier < 2) return;
  const m = tier >= 3 ? GOLD : BRONZE;
  ctx.save();
  // đai lưng (không vẽ khi đã mặc giáp: giáp có đai riêng)
  if (!look.armor) {
    ctx.fillStyle = '#3E2A16'; ctx.fillRect(-9.2, -13, 18.4, 2.4);
    ctx.fillStyle = m.main; ctx.beginPath(); ctx.arc(0, -11.8, 1.9, 0, Math.PI * 2); ctx.fill(); outline(ctx, 0.4);
  }
  // giáp vai hai bên
  for (const sx of [-1, 1]) {
    ctx.fillStyle = m.main;
    ctx.beginPath(); ctx.ellipse(sx * 8.4, -25, 4.2, 2.6, sx * 0.3, Math.PI, 0); ctx.closePath(); ctx.fill(); outline(ctx, 0.5);
    ctx.strokeStyle = m.light; ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.ellipse(sx * 8.4, -25, 2.8, 1.5, sx * 0.3, Math.PI, 0); ctx.stroke();
  }
  if (tier >= 3 && !look.armor) {
    // mặt trống đồng nhỏ trước ngực + chuỗi hạt
    ctx.strokeStyle = GOLD.dark; ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(-6, -26); ctx.quadraticCurveTo(0, -20, 6, -26); ctx.stroke();
    for (let i = 0; i < 5; i++) circle(ctx, -4 + i * 2, -23.6 + Math.abs(i - 2) * -0.8 + 0.6, 0.55, i % 2 ? '#C8302A' : '#3EC08A');
    ctx.fillStyle = GOLD.main; ctx.beginPath(); ctx.arc(0, -19, 3, 0, Math.PI * 2); ctx.fill(); outline(ctx, 0.4);
    ctx.strokeStyle = GOLD.dark; ctx.lineWidth = 0.35;
    for (const r of [2, 1]) { ctx.beginPath(); ctx.arc(0, -19, r, 0, Math.PI * 2); ctx.stroke(); }
    // ngôi sao giữa mặt trống quay chậm
    ctx.save(); ctx.translate(0, -19); ctx.rotate(t * 0.8);
    ctx.fillStyle = GOLD.light;
    ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 0.4 : 1; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ★★: băng trán đồng + lông chim màu hệ · ★★★: vương miện vàng 3 lông chim Lạc
function drawCostumeHead(ctx, look, t, tier) {
  if (look.legend || tier < 2 || look.helmet) return;
  ctx.save();
  if (tier >= 3) {
    ctx.fillStyle = GOLD.main;
    ctx.beginPath(); ctx.moveTo(-8.6, -38.6); ctx.lineTo(8.6, -38.6); ctx.lineTo(8, -41.4); ctx.lineTo(-8, -41.4); ctx.closePath(); ctx.fill(); outline(ctx, 0.45);
    circle(ctx, 0, -40, 1.1, '#C8302A');
    for (let i = -1; i <= 1; i++) {
      ctx.save(); ctx.translate(i * 3.4, -41.4); ctx.rotate(i * 0.35 + Math.sin(t * 2 + i) * 0.05);
      ctx.fillStyle = i ? GOLD.light : look.attrColor;
      ctx.beginPath(); ctx.ellipse(0, -5.5, 1.5, 5.6, 0, 0, Math.PI * 2); ctx.fill(); outline(ctx, 0.35);
      ctx.restore();
    }
  } else {
    ctx.fillStyle = BRONZE.main;
    ctx.fillRect(-8.8, -39.8, 17.6, 2); outline(ctx, 0.4);
    circle(ctx, 0, -38.8, 0.9, look.attrColor);
    ctx.save(); ctx.translate(6.5, -40); ctx.rotate(0.6 + Math.sin(t * 2) * 0.06);
    ctx.fillStyle = look.attrColor;
    ctx.beginPath(); ctx.ellipse(0, -4, 1.2, 4.4, 0, 0, Math.PI * 2); ctx.fill(); outline(ctx, 0.3);
    ctx.restore();
  }
  ctx.restore();
}

// ---------- Thần tinh (tướng Tím / Vàng) ----------
const ASC_COLOR = { epic: '#C89CFF', legendary: '#FFD66B' };
// sau lưng: TT1 vòng sáng sau đầu · TT2 vòng có hạt · TT3 vầng trống đồng (drawSunHalo, vẽ ở drawHeroSprite)
function drawAscBack(ctx, look, asc, rarity, t) {
  if (!look.legend || asc < 1) return;
  const c = ASC_COLOR[rarity] || '#FFD66B';
  ctx.save();
  ctx.translate(0, -34);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 16);
  g.addColorStop(0, hexA(c, '00')); g.addColorStop(0.7, hexA(c, '55')); g.addColorStop(1, hexA(c, '00'));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = c; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.9;
  ctx.beginPath(); ctx.arc(0, 0, 12.5, 0, Math.PI * 2); ctx.stroke();
  if (asc >= 2) {
    ctx.rotate(t * 0.6);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; circle(ctx, Math.cos(a) * 12.5, Math.sin(a) * 12.5, 0.7, '#FFFFFF'); }
  }
  ctx.restore();
}
// phía trước: TT2+ hai viên ngọc bay vòng quanh người (khuất sau người nửa vòng sau)
function drawAscOrbit(ctx, look, asc, rarity, t, front) {
  if (!look.legend || asc < 2) return;
  const c = ASC_COLOR[rarity] || '#FFD66B';
  ctx.save();
  for (let i = 0; i < 2; i++) {
    const a = t * 1.6 + i * Math.PI;
    const z = Math.sin(a);                 // > 0: phía trước người
    if ((z > 0) !== front) continue;
    // quỹ đạo rộng, thấp ngang hông; viên ngọc nhỏ, phía sau người mờ hơn
    const x = Math.cos(a) * 17, y = -14 + Math.sin(a) * 3;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = front ? 1 : 0.5;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 3);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.45, c); g.addColorStop(1, hexA(c, '00'));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------- NGỰA SẮT của Thánh Gióng (v51): vẽ trong khung 200×230 (chân ngựa chạm đất y = 222),
// thân sắt, bờm và đuôi là lửa, phi nước kiệu; ra đòn thì phun lửa. Gióng ngồi cao hơn RIDE đơn vị.
const MOUNT_RIDE = 86;
const HORSE_K = [1.36, 1.3];      // ngựa to hơn khung người (người chibi đầu to)
function drawIronHorse(ctx, t, P, moving) {
  const g = Math.sin(t * (moving ? 9 : 3));                // nhịp phi
  ctx.save();
  ctx.translate(100, 222); ctx.scale(HORSE_K[0], HORSE_K[1]); ctx.translate(-100, -222);
  const leg = (hx, hy, a, back) => {
    ctx.save();
    ctx.translate(hx, hy); ctx.rotate(a);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2A2F36'; ctx.lineWidth = 15;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.lineTo(back ? -4 : 4, 58); ctx.stroke();
    ctx.strokeStyle = '#6E7A86'; ctx.lineWidth = 11;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.lineTo(back ? -4 : 4, 58); ctx.stroke();
    ctx.fillStyle = '#2A2F36'; ctx.fillRect((back ? -4 : 4) - 8, 56, 16, 6);
    ctx.restore();
  };
  ctx.save();
  // chân phía xa (tối hơn) rồi đuôi lửa
  ctx.globalAlpha = 0.75;
  leg(146, 160, -g * 0.35, false); leg(58, 160, g * 0.35, true);
  ctx.globalAlpha = 1;
  // đuôi lửa
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const w = Math.sin(t * 7 + i) * 6;
    ctx.fillStyle = ['#FF6A2A', '#FF9A3A', '#FFE08A'][i];
    ctx.beginPath(); ctx.moveTo(40, 138);
    ctx.quadraticCurveTo(14 + w, 128 - i * 4, 2 + w * 1.4, 150 + i * 6);
    ctx.quadraticCurveTo(22, 150, 40, 150); ctx.fill();
  }
  ctx.restore();
  // thân
  ctx.fillStyle = '#6E7A86'; ctx.strokeStyle = '#1A1E24'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(100, 148, 64, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // cổ + đầu
  ctx.beginPath();
  ctx.moveTo(142, 132); ctx.quadraticCurveTo(160, 96, 176, 82); ctx.lineTo(196, 96); ctx.quadraticCurveTo(200, 106, 190, 110);
  ctx.lineTo(176, 108); ctx.quadraticCurveTo(168, 130, 158, 152); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(176, 82); ctx.lineTo(172, 68); ctx.lineTo(182, 80); ctx.fill(); ctx.stroke();   // tai
  // tấm giáp sắt: đinh tán, đường nối, ánh kim
  ctx.strokeStyle = '#3E4650'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(60, 128); ctx.quadraticCurveTo(100, 118, 140, 128); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(70, 166); ctx.quadraticCurveTo(100, 176, 132, 166); ctx.stroke();
  ctx.fillStyle = '#A8B4C0';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(66 + i * 14, 140 + (i % 2) * 4, 2.2, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 0.35; ctx.fillStyle = '#E8F0F8';
  ctx.beginPath(); ctx.ellipse(92, 132, 40, 8, -0.05, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  // yên ngựa đỏ viền vàng
  ctx.fillStyle = '#B8301E'; ctx.strokeStyle = '#1A1E24'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(98, 122, 26, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#F2D27A'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(98, 122, 22, 6, 0, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
  // mắt lửa + mũi
  ctx.fillStyle = '#FF8A2E'; ctx.shadowColor = '#FF6A2A'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(184, 92, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#1A1E24'; ctx.beginPath(); ctx.arc(194, 104, 2, 0, Math.PI * 2); ctx.fill();
  // bờm lửa dọc cổ
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const bx = 146 + i * 6, by = 124 - i * 8, w = Math.sin(t * 9 + i) * 3;
    ctx.fillStyle = i % 2 ? '#FF9A3A' : '#FFD66B';
    ctx.beginPath(); ctx.moveTo(bx - 4, by + 4); ctx.quadraticCurveTo(bx - 12 + w, by - 8, bx - 6 + w, by - 18); ctx.quadraticCurveTo(bx, by - 6, bx + 4, by + 2); ctx.fill();
  }
  // phun lửa khi ra đòn
  if (P && (P.phase === 'strike' || (P.phase === 'recover' && P.k < 0.4))) {
    const k = P.phase === 'strike' ? P.k : 1 - P.k * 2.5;
    const L = 30 + 60 * k;
    const gr = ctx.createLinearGradient(198, 0, 198 + L, 0);
    gr.addColorStop(0, '#FFF1C4'); gr.addColorStop(0.4, '#FF9A3A'); gr.addColorStop(1, 'rgba(255,90,40,0)');
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.moveTo(196, 104); ctx.quadraticCurveTo(198 + L * 0.5, 90 - 10 * k, 198 + L, 96); ctx.quadraticCurveTo(198 + L * 0.5, 122 + 10 * k, 196, 108); ctx.fill();
  }
  ctx.restore();
  // chân phía gần
  leg(140, 162, g * 0.4, false); leg(62, 162, -g * 0.4, true);
  ctx.restore();
  ctx.restore();
}
// chân người cưỡi buông qua sườn ngựa (thay cho chân đứng)
function drawRiderLeg(ctx) {
  // hông người cưỡi ở y = 178 trong khung người (đã nâng MOUNT_RIDE) → chân buông chéo qua sườn ngựa
  const hy = 178 - MOUNT_RIDE;
  const path = () => { ctx.beginPath(); ctx.moveTo(96, hy); ctx.lineTo(114, hy + 32); ctx.lineTo(108, hy + 60); };
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1A1E24'; ctx.lineWidth = 15; path(); ctx.stroke();
  ctx.strokeStyle = '#5A6470'; ctx.lineWidth = 11; path(); ctx.stroke();
  ctx.fillStyle = '#2A2F36'; ctx.fillRect(100, hy + 58, 18, 7);
  ctx.restore();
}
