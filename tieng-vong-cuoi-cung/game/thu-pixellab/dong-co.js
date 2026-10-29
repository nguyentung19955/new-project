'use strict';
/* =====================================================================================================================
   dong-co.js – ENGINE COMBAT của trang thử PixelLab. KHÔNG vẽ gì, KHÔNG biết sprite.
   Luật CHÉP NGUYÊN từ game/thu-lam-moi-2 (index.html: P, ATK sau P0-A + Âm Đao, NHAY mới, updatePlayer, P0.chonDon hàng chờ 1 nhát,
   pogo + ROI "chém trên không không treo", hurt, Chuông Gỗ): nhịp 60 Hz cố định, tốc độ, hộp va chạm 20×30, vùng ăn đòn 40×120,
   hộp chém, su/ac/re (atkT), hitstop, pogo, lướt, bám vách (móc), nhảy vách, coyote, đệm nhảy 8 bước.
   Bỏ (trang này không cần): Tiếng Vọng / bóng, Cộng hưởng, Thế / vỏ, Dư Âm, chí mạng, rút dao đầu ải, ván một chiều, phòng.
   PHẦN MỚI kiểu Dead Cells nằm sau cờ DCO (?dc=0 tắt toàn bộ = đúng luật cũ; ?dc_<tên>=0/1 bật tắt từng phần) – xem GHI-CHU.md.
   Toạ độ: px LOGIC (khung 960×540). Ô bản đồ 48 px logic = 16 điểm cảnh pixel.
   ===================================================================================================================== */
const DC_Q = new URLSearchParams(location.search);

/* ---------- CỜ "DEAD CELLS" (mặc định bật; ?dc=0 tắt hết) ---------- */
const DCO = (() => {
  const tat = DC_Q.get('dc') === '0';
  const co = k => { const v = DC_Q.get('dc_' + k); return v === null ? !tat : v !== '0'; };
  return {
    bat: !tat,
    combo: co('combo'),      // đệm combo SAU khi đòn đã hết: bấm trong 10 bước → nối nhát kế (1→2→3) thay vì quay về nhát 1
    luot: co('luot'),        // lướt huỷ đòn CÓ KIỂM SOÁT: chỉ trong pha hồi (và lấy đà nếu dc_layda); bấm lúc ra đòn → giữ phím, lướt ngay khi hết pha ra đòn
    layda: co('layda'),      // cho lướt huỷ cả pha LẤY ĐÀ (tắt = chỉ pha hồi)
    day: co('day'),          // đẩy lùi nhẹ cả HÌNH NỘM (quái Chuông Gỗ vốn đã bị đẩy theo luật cũ)
    uutien: co('uutien')     // ưu tiên chết > bị đánh > lướt > chém > di chuyển: đang bị đẩy (hurtT > 8) không lướt được (luật cũ: lướt được)
  };
})();
const DC_SO = {comboHan: 10};

/* ---------- THAM SỐ – chép từ thu-lam-moi-2 (P gốc + NHAY "mới" 28/10) ---------- */
const P = { runSpeed:4.4, jumpHeight:118, gravity:0.768, wallJumpVx:5.4, wallStick:6, autoPogo:1,
  accelFrames:6, decelFrames:5, airControl:0.75, turnBoost:1.6, maxFall:10.4, fallGravMul:1.12 / 1.2,
  apexGravMul:0.3, apexThreshold:4, jumpCut:0.5, coyote:6, jumpBuffer:8, corner:8,
  wallSlideMax:1.6, wallJumpMul:0.92, wallJumpLock:9, wallSense:6, wallCoyote:8, wallBackMul:0.35,
  dashSpeed:11, dashFrames:8, dashIFrames:11, dashCooldown:18,
  pogoMul:1, lunge:2.2, pogoReach:56, pogoDown:0.35, pogoBuf:6, maxHp:5, hurtIFrames:60 };
const NHAY_K = 3, NHAY_GOI = P.maxFall - NHAY_K;
const tranRoi = v => v <= NHAY_GOI ? v : NHAY_GOI + NHAY_K * Math.tanh((v - NHAY_GOI) / NHAY_K);
const jumpVel = Math.sqrt(2 * P.gravity * P.jumpHeight);
// Đòn: su (lấy đà) · ac (ra đòn: hộp bật) · re (hồi) – bước 60 Hz. box [dx, dy, w, h] so với CHÂN, mặt phải. su 1–3 = P0-A (7/7/9), hộp = Âm Đao.
// 1–3 combo đất · 4 pogo (chém nảy) · 5 chém hất (lên) · 6 chém trên không. hs = hitstop khi trúng. goc = máu (thang ×10).
const ATK = {
  1: {su:7,  ac:8,  re:8,  hs:3, mag:1.5, sh:[1, 0],      box:[2, -80, 92, 80],    goc:10, ten:'chem1'},   // kiếm chéo ↘: vai → đất, tới mũi kiếm (+46 điểm)
  2: {su:7,  ac:8,  re:8,  hs:4, mag:1.8, sh:[0.6, -0.8], box:[-6, -104, 98, 80],  goc:10, ten:'chem2'},   // chéo LÊN ↗: hông → trên đầu
  3: {su:9,  ac:8,  re:16, hs:6, mag:2,   sh:[0, 1],      box:[4, -76, 94, 76],    goc:10, ten:'chem3'},   // BỔ xuống trước mặt: ngang đầu → đất
  4: {su:0,  ac:11, re:4,  hs:3, mag:1,   sh:[0, 1],      box:[-26, -24, 64, 82],  goc:10, ten:'pogo'},
  5: {su:11, ac:8,  re:8,  hs:3, mag:1.5, sh:[0, -1],     box:[-9, -140, 87, 60],  goc:10, ten:'chem-len'},
  6: {su:9,  ac:8,  re:4,  hs:3, mag:1.5, sh:[1, 0.4],    box:[-3, -107, 95, 48],  goc:10, ten:'chem-khong'}
};
const CHO_THEM = 6, NGUONG_HUONG = 0.7;   // P0-A: hàng chờ 1 nhát = hết đòn đang chạy + 6 bước; ngưỡng cần gạt lúc ra đòn ≈ 45°

/* ---------- BẢN ĐỒ (lưới từ canh/man.json + vách thêm của trang này) ---------- */
const BD = {T: 48, COT: 40, HANG: 12, L: []};
function tile(tx, ty){ if (tx < 0 || tx >= BD.COT) return '#'; if (ty < 0) return '.'; if (ty >= BD.HANG) return '#'; return BD.L[ty][tx]; }
function solidPt(x, y){ return tile(Math.floor(x / BD.T), Math.floor(y / BD.T)) === '#'; }
function collide(x, y, w, h){
  const T = BD.T, x0 = Math.floor(x / T), x1 = Math.floor((x + w - 0.001) / T), y0 = Math.floor(y / T), y1 = Math.floor((y + h - 0.001) / T);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (tile(tx, ty) === '#') return true;
  return false;
}
function moveX(o, dx, cornerUp){
  let rem = dx;
  while (rem !== 0){
    const s = Math.abs(rem) > 1 ? Math.sign(rem) : rem;
    if (!collide(o.x + s, o.y, o.w, o.h)){ o.x += s; rem -= s; continue; }
    if (cornerUp){ let ok = false; for (let k = 1; k <= P.corner; k++){ if (!collide(o.x + s, o.y - k, o.w, o.h)){ o.y -= k; o.x += s; rem -= s; ok = true; break; } } if (ok) continue; }
    return true;
  }
  return false;
}
function moveY(o, dy){
  let rem = dy;
  while (rem !== 0){
    const s = Math.abs(rem) > 1 ? Math.sign(rem) : rem;
    if (!collide(o.x, o.y + s, o.w, o.h)){ o.y += s; rem -= s; continue; }
    if (s < 0){ let ok = false; for (let k = 1; k <= P.corner && !ok; k++) for (const d of [k, -k]){ if (!collide(o.x + d, o.y + s, o.w, o.h)){ o.x += d; ok = true; break; } } if (ok) continue; }
    return s > 0 ? 1 : -1;
  }
  return 0;
}
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const approach = (v, t, d) => v < t ? Math.min(v + d, t) : Math.max(v - d, t);
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/* ---------- TRẠNG THÁI ---------- */
const S = {frame:0, hitstop:0, sht:0, shm:0, shx:0, shy:0, swing:0, nTrung:0, chet:0};
const pl = {x:0, y:0, w:20, h:30, vx:0, vy:0, face:1, onGround:false, coyote:0, jumpBuf:0, dashBuf:0, jumping:false,
  wallDir:0, wallLock:0, wallCoy:0, lastWall:0, wallStickT:0, wjBack:0, wjT:0, landT:0, airT:0, yTop:0,
  dash:0, dashDir:1, dashCd:0, airDash:false, airJump:false, iframes:0, hp:P.maxHp, hurtT:0, hurtK:-1, dead:false, deadT:0,
  atkN:0, atkT:0, atkSw:0, atkBounced:false, pogoBuf:0, pogoSafe:0, st:'idle', dxT:0, sx:0, sy:0,
  comboHan:0, comboTiep:0, luotCho:false};
const ROI = {autoDung:false, khungDung:false, khT:0, KH_BUOC:6, KH_VY:1.2};   // thu-lam-moi-2 29/10: pogo tự động 1 lần / lần rời đất + khựng chém trên không đầu
const CHO = {co:false, f:0, huong:'', han:0};                              // P0-A hàng chờ 1 nhát
const MT = [];   // mục tiêu: hình nộm + quái Chuông Gỗ
const SUKIEN = [];   // sự kiện của bước (trúng, nảy, bị đánh…) – trang đọc để vẽ tia / rung; xoá đầu mỗi bước

/* ---------- MỤC TIÊU ---------- */
const QHB = {dx:-90, dy:-81, w:66, h:37};   // hộp đập Chuông Gỗ (so với chân, quái nhìn TRÁI)
function taoNom(x, chanY){ return {loai:'nom', x:x - 15, y:chanY - 96, w:30, h:96, hx:x - 15, hp:999, lastSw:-1, flash:0, t:0, dir:1, kvx:0, n:0}; }
function taoQuai(x, chanY, minX, maxX){
  const q = {loai:'quai', x:x - 36, y:chanY - 108, w:72, h:108, sx:x - 36, sy:chanY - 108, minX, maxX, hp:40, max:40, face:-1, vy:0, kvx:0,
    st:'walk', t:0, cd:0, lastSw:-1, flash:0, dead:false, hoiT:0};
  return q;
}
function datLaiQuai(q){ q.x = q.sx; q.y = q.sy; q.hp = q.max; q.face = -1; q.vy = 0; q.kvx = 0; q.st = 'walk'; q.t = 0; q.cd = 60; q.dead = false; q.lastSw = -1; }
function hopQuai(q, out){ const fx = q.x + q.w / 2, fy = q.y + q.h; out.y = fy + QHB.dy; out.w = QHB.w; out.h = QHB.h; out.x = q.face < 0 ? fx + QHB.dx : fx - QHB.dx - QHB.w; return out; }

/* ---------- TẢI BẢN ĐỒ ---------- */
function napBanDo(man, them){
  BD.T = man.o_logic; BD.COT = man.cot; BD.HANG = man.hang; BD.L = man.luoi.map(r => r.split(''));
  for (const [c0, r0, c1, r1] of (them || [])) for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) BD.L[r][c] = '#';
}
function datLam(x, chanY){
  Object.assign(pl, {x:x - pl.w / 2, y:chanY - pl.h, vx:0, vy:0, face:1, dash:0, atkN:0, hurtT:0, iframes:0, dead:false, deadT:0, hp:P.maxHp,
    jumpBuf:0, dashBuf:0, pogoBuf:0, pogoSafe:0, airDash:false, airJump:false, wjT:0, landT:0, comboHan:0, luotCho:false, onGround:true});
  pl.sx = x; pl.sy = chanY; CHO.co = false;
}

/* ---------- PHA ĐÒN (đọc cho animation / VFX) ---------- */
// atkT = số bước đã chạy của đòn (1 ở bước đầu tiên vẽ ra). Lấy đà: atkT < su · Ra đòn (hộp bật): su ≤ atkT < su+ac · Hồi: còn lại.
function phaDon(n, t){
  const a = ATK[n]; if (!a) return null;
  if (t < a.su) return {pha:'layda', t, dai:a.su, tiLe:a.su ? t / a.su : 0};
  if (t < a.su + a.ac) return {pha:'rado', t:t - a.su, dai:a.ac, tiLe:(t - a.su) / a.ac};
  return {pha:'hoi', t:t - a.su - a.ac, dai:a.re, tiLe:Math.min(1, (t - a.su - a.ac) / a.re)};
}
const HB = {x:0, y:0, w:0, h:0}, PR = {x:0, y:0, w:0, h:0}, HU = {x:0, y:0, w:0, h:0}, QR = {x:0, y:0, w:0, h:0};
function atkBox(o, n, t, face, out){
  if (!n) return null; const a = ATK[n];
  if (t < a.su || t >= a.su + a.ac) return null;
  const b = a.box, fx = o.x + o.w / 2, fy = o.y + o.h;
  out.x = face > 0 ? fx + b[0] : fx - b[0] - b[2]; out.y = fy + b[1]; out.w = b[2]; out.h = b[3];
  return out;
}
function hurtBox(){ HU.x = pl.x + pl.w / 2 - 20; HU.y = pl.y + pl.h - 120; HU.w = 40; HU.h = 120; return HU; }
function pogoTarget(){
  if (ROI.autoDung) return false;
  PR.x = pl.x - 4; PR.y = pl.y + pl.h - 4; PR.w = pl.w + 8; PR.h = P.pogoReach + 4;
  for (const m of MT) if (!(m.loai === 'quai' && (m.dead || m.st === 'die')) && overlap(PR, m)) return true;
  return false;
}
function shake(x, y, m){ S.shx = x; S.shy = y; S.shm = Math.max(S.shm * (S.sht > 0 ? 1 : 0), m); S.sht = 8; }

/* ---------- RA ĐÒN ---------- */
function startAtk(n, dir){
  if (!pl.onGround && n === 4 && !IN.xuong()) ROI.autoDung = true;   // pogo TỰ ĐỘNG chỉ 1 lần mỗi lần rời đất
  if (dir && n !== 4) pl.face = dir;
  pl.atkN = n; pl.atkT = 0; pl.atkSw = ++S.swing; pl.atkBounced = false; pl.comboHan = 0;
  if (n < 4 && pl.onGround) pl.vx = pl.face * P.lunge * (n === 3 ? 1.4 : 1);
  SUKIEN.push({k:'ra-don', n});
}
function ranh(){ return (!pl.atkN || (pl.atkN === 4 && pl.atkBounced)) && pl.dash <= 0; }
function conLai(){ if (pl.atkN){ const a = ATK[pl.atkN]; return a.su + a.ac + a.re - pl.atkT; } if (pl.dash > 0) return pl.dash; return 0; }
function bamChem(){   // gọi khi vừa bấm Chém (trước hitstop – bấm lúc khựng vẫn được nhận)
  if (pl.dead || pl.hurtT > 8) return;
  CHO.co = true; CHO.f = S.frame; CHO.huong = IN.huong(); CHO.han = S.frame + conLai() + CHO_THEM;
}
function chonDon(dir){
  if (CHO.co && S.frame > CHO.han) CHO.co = false;
  const xuong = h => !pl.onGround && (h === 'd' || (P.autoPogo && pl.vy > -2 && pogoTarget()));
  if (CHO.co && pl.dash <= 0 && pl.hurtT <= 8){
    let n = 0;
    if (!pl.atkN || (pl.atkN === 4 && pl.atkBounced)){
      n = xuong(CHO.huong) ? 4 : (!pl.onGround ? 6 : (CHO.huong === 'u' ? 5 : 1));
      if (n === 1 && DCO.combo && pl.comboHan > 0) n = pl.comboTiep;    // MỚI: nối combo sau khi đòn trước đã hết
    } else if (pl.onGround && pl.atkN < 3){ const a = ATK[pl.atkN]; if (pl.atkT >= a.su + a.ac) n = pl.atkN + 1; }
    if (n){ CHO.co = false; startAtk(n, dir); pl.pogoBuf = (n === 6) ? P.pogoBuf : 0; }
  } else if (pl.pogoBuf > 0 && xuong(IN.huong()) && pl.dash <= 0 && pl.atkN !== 4){ startAtk(4, 0); pl.pogoBuf = 0; }
}

/* ---------- LƯỚT: có được huỷ đòn không (DC) ---------- */
// → 'co' (lướt ngay) · 'cho' (giữ phím tới khi được) · 'khong' (bỏ)
function choLuot(){
  if (DCO.uutien && pl.hurtT > 8) return 'khong';
  if (!DCO.luot || !pl.atkN || (pl.atkN === 4 && pl.atkBounced)) return 'co';   // luật cũ: lướt huỷ đòn mọi lúc
  const p = phaDon(pl.atkN, pl.atkT).pha;
  if (p === 'hoi' || (p === 'layda' && DCO.layda)) return 'co';
  return 'cho';   // pha ra đòn (hoặc lấy đà khi tắt dc_layda): đợi
}

/* ---------- LAM: một bước (chép updatePlayer của thu-lam-moi-2, bỏ phần không dùng) ---------- */
function capNhatLam(){
  pl.dxT = 0;
  if (pl.dead){
    pl.deadT++; pl.vx *= 0.9; pl.vy = Math.min(pl.vy + P.gravity, P.maxFall);
    moveX(pl, pl.vx, false); if (moveY(pl, pl.vy)) pl.vy = 0;
    if (pl.deadT >= 104){ datLam(pl.sx, pl.sy); pl.iframes = 60; SUKIEN.push({k:'hoi-sinh'}); }
    return;
  }
  const dir = (IN.r ? 1 : 0) - (IN.l ? 1 : 0);
  if (pl.wallLock > 0) pl.wallLock--; if (pl.dashCd > 0) pl.dashCd--; if (pl.iframes > 0) pl.iframes--; if (pl.pogoSafe > 0) pl.pogoSafe--;
  if (pl.hurtT > 0) pl.hurtT--; if (pl.wjT > 0) pl.wjT--; if (pl.landT > 0) pl.landT--; if (pl.comboHan > 0) pl.comboHan--;
  // Lướt
  pl.luotCho = false;
  if (pl.dashBuf > 0 && pl.dashCd <= 0 && pl.dash <= 0 && (pl.onGround || !pl.airDash)){
    const cl = choLuot();
    if (cl === 'cho') pl.luotCho = true;   // DC: đang ra đòn → giữ phím lướt, lướt ngay khi sang pha hồi
    else if (cl === 'co') {
      const huy = pl.atkN ? phaDon(pl.atkN, pl.atkT).pha : '';
      pl.dash = P.dashFrames; pl.dashDir = dir || pl.face; pl.face = pl.dashDir; pl.vy = 0;
      pl.iframes = Math.max(pl.iframes, P.dashIFrames); if (!pl.onGround) pl.airDash = true;
      pl.dashCd = P.dashFrames + P.dashCooldown; pl.atkN = 0; pl.dashBuf = 0; CHO.co = false; pl.jumping = false; pl.comboHan = 0;
      SUKIEN.push({k:'luot', huy});
    }
  }
  if (pl.dash > 0){
    if (pl.jumpBuf > 0 && (pl.onGround || pl.coyote > 0)){ pl.dash = 0; pl.vx = pl.dashDir * P.runSpeed * 1.15; }
    else {
      pl.dash--; pl.vx = pl.dashDir * P.dashSpeed; pl.vy = 0;
      const x0 = pl.x; if (moveX(pl, pl.vx, true)) pl.dash = 0; pl.dxT = pl.x - x0;
      if (pl.dash === 0) pl.vx = pl.dashDir * P.runSpeed;
      pl.st = 'dash'; ketDat(); return;
    }
  }
  // Ngang
  const atkGround = pl.atkN && pl.onGround;
  let target = atkGround ? 0 : dir * P.runSpeed;
  let acc = P.runSpeed / P.accelFrames, dec = P.runSpeed / P.decelFrames;
  if (!pl.onGround){ acc *= P.airControl; dec *= P.airControl * 0.6; }
  const backToWall = pl.wallLock > 0 && dir !== 0 && dir === pl.wjBack;
  if (pl.wallLock > 0 && !backToWall) acc *= 0.25;
  if (pl.hurtT > 8) target = pl.vx;
  if (backToWall) pl.vx = approach(pl.vx, target, acc * P.turnBoost * 1.5);
  else if (target !== 0){ const turning = pl.vx !== 0 && Math.sign(pl.vx) !== Math.sign(target); pl.vx = approach(pl.vx, target, turning ? acc * P.turnBoost : acc); }
  else if (pl.wallLock <= 0) pl.vx = approach(pl.vx, 0, atkGround ? dec * 0.5 : dec);
  if (dir && !pl.atkN && pl.wallLock <= 0 && pl.hurtT <= 8) pl.face = dir;
  // Dọc (nhảy mềm 28/10)
  let g = P.gravity;
  if (!pl.onGround){
    const a0 = Math.min(1, Math.abs(pl.vy) / P.apexThreshold), a = a0 * a0 * (3 - 2 * a0), top = IN.j ? P.apexGravMul : 0.8;
    g *= top + (1 - top) * a; if (pl.vy > 0) g *= 1 + (P.fallGravMul - 1) * a;
  }
  pl.vy = tranRoi(pl.vy + g);
  // Vách (móc)
  const ws = P.wallSense + 0.5;
  pl.wallDir = pl.onGround ? 0 : (collide(pl.x - ws, pl.y, pl.w, pl.h) ? -1 : (collide(pl.x + ws, pl.y, pl.w, pl.h) ? 1 : 0));
  if (pl.wallDir){ pl.wallCoy = P.wallCoyote; pl.lastWall = pl.wallDir; } else { if (pl.wallCoy > 0) pl.wallCoy--; pl.wallStickT = 0; }
  if (pl.onGround){ pl.wallCoy = 0; pl.wallStickT = 0; }
  let sliding = false;
  const touching = pl.wallDir && collide(pl.x + pl.wallDir, pl.y, pl.w, pl.h);
  if (pl.wallDir && pl.vy > 0 && !pl.atkN && dir !== -pl.wallDir && (touching || dir === pl.wallDir)){
    if (pl.wallStickT < P.wallStick){ pl.wallStickT++; pl.vy = 0; } else pl.vy = Math.min(pl.vy, P.wallSlideMax);
    sliding = true; pl.face = -pl.wallDir; pl.wjT = 0;
  }
  if (pl.jumpBuf > 0){
    if (pl.onGround || pl.coyote > 0){ pl.vy = -jumpVel; pl.jumping = true; pl.coyote = 0; pl.jumpBuf = 0; pl.onGround = false; SUKIEN.push({k:'nhay'}); }
    else if (pl.wallDir || pl.wallCoy > 0){
      const wd = pl.wallDir || pl.lastWall, back = (dir === wd);
      pl.vy = -jumpVel * P.wallJumpMul; pl.vx = -wd * P.wallJumpVx * (back ? P.wallBackMul : 1); pl.face = -wd; pl.wallLock = P.wallJumpLock;
      pl.wjBack = wd; pl.wallCoy = 0; pl.wallStickT = 0; pl.wjT = 16; pl.jumping = true; pl.jumpBuf = 0; pl.airDash = false;
      SUKIEN.push({k:'nhay-vach', wd});
    } else if (pl.airJump){ pl.airJump = false; pl.vy = -jumpVel; pl.jumping = true; pl.jumpBuf = 0; }
  }
  if (pl.jumping && !IN.j && pl.vy < 0){ pl.vy *= P.jumpCut; pl.jumping = false; }
  if (pl.vy >= 0) pl.jumping = false;
  const xTruoc = pl.x; if (moveX(pl, pl.vx, false)) pl.vx = 0; pl.dxT = pl.x - xTruoc;
  const vyWas = pl.vy, ry = moveY(pl, pl.vy);
  if (ry !== 0){ if (ry === 1 && vyWas > 5) pl.landT = 10; if (ry === -1) pl.jumping = false; pl.vy = 0; }
  ketDat();
  // Chém (P0-A hàng chờ 1 nhát; trên không + xuống = pogo; đất + lên = hất)
  const n0 = pl.atkN, t0 = pl.atkT;
  chonDon(dir);
  if (pl.pogoBuf > 0) pl.pogoBuf--;
  if (pl.atkN){ pl.atkT++; const a = ATK[pl.atkN];
    if (pl.atkN === 3 && pl.atkT === a.su){ S.hitstop = Math.max(S.hitstop, 3); shake(0, 1, 1.5); }   // Lam chibi: chém 3 khựng 3 bước (50 ms) + rung 1–2 px đúng hình bổ (hình 5), trúng hay trượt
    if (pl.atkT >= a.su + a.ac + a.re){
      if (pl.onGround && pl.atkN < 3){ pl.comboHan = DC_SO.comboHan; pl.comboTiep = pl.atkN + 1; }   // chỉ dùng khi DCO.combo
      pl.atkN = 0;
    } }
  pl.airT = pl.onGround ? 0 : pl.airT + 1;
  pl.st = sliding ? 'wall' : !pl.onGround ? (pl.vy < 0 ? 'jump' : 'fall') : Math.abs(pl.vx) > 0.6 ? 'run' : 'idle';
  // ROI: chém trên không không treo
  if (pl.onGround || pl.wjT === 16 || pl.st === 'wall'){ ROI.autoDung = false; ROI.khungDung = false; ROI.khT = 0; }
  if (pl.atkN === 6 && !pl.onGround && (n0 !== 6 || pl.atkT < t0) && !ROI.khungDung){ ROI.khungDung = true; ROI.khT = ROI.KH_BUOC; }
  if (ROI.khT > 0){ ROI.khT--; if (pl.atkN === 6 && pl.vy > ROI.KH_VY) pl.vy = ROI.KH_VY; }
}
function ketDat(){
  const was = pl.onGround;
  pl.onGround = collide(pl.x, pl.y + 1, pl.w, pl.h);
  if (pl.onGround){ pl.coyote = P.coyote; pl.airDash = false; pl.airJump = false; if (!was) SUKIEN.push({k:'cham-dat', cao:pl.y - pl.yTop}); }
  else if (pl.coyote > 0) pl.coyote--;
  if (pl.onGround) pl.yTop = pl.y; else pl.yTop = Math.min(pl.yTop, pl.y);
}

/* ---------- TRÚNG ĐÒN ---------- */
function pogoBounce(hb){
  pl.vy = -jumpVel * P.pogoMul; pl.jumping = false; pl.airDash = false; pl.airJump = true; pl.dashCd = 0;
  pl.atkBounced = true; pl.atkT = Math.max(pl.atkT, ATK[4].su + ATK[4].ac); pl.pogoSafe = 8; pl.pogoBuf = 0;
  ROI.khungDung = false; ROI.khT = 0;
  S.hitstop = Math.max(S.hitstop, 3); shake(0, 1, 1);
  SUKIEN.push({k:'nay', x:pl.x + pl.w / 2, y:Math.min(hb.y + hb.h - 12, pl.y + pl.h + 20)});
}
function trung(hb, n, face){   // mọi mục tiêu chồng hộp, MỖI mục tiêu 1 lần / nhát (atkSw)
  let co = false, hs = 0; const a = ATK[n];
  for (const m of MT){
    if (m.loai === 'quai' && (m.dead || m.st === 'die')) continue;
    if (m.lastSw === pl.atkSw || !overlap(hb, m)) continue;
    m.lastSw = pl.atkSw; co = true; hs = Math.max(hs, a.hs); m.flash = 8; S.nTrung++;
    const tx = (Math.max(hb.x, m.x) + Math.min(hb.x + hb.w, m.x + m.w)) / 2, ty = (Math.max(hb.y, m.y) + Math.min(hb.y + hb.h, m.y + m.h)) / 2;
    SUKIEN.push({k:'trung', x:tx, y:ty, n, face, m});
    if (m.loai === 'nom'){ m.t = 14; m.dir = face; m.n++; if (DCO.day && n !== 4) m.kvx = face * (n === 3 ? 4.2 : 2.6); }
    else {
      m.hp -= a.goc;
      const khongNgat = (m.st === 'wind' && m.t >= 18) || m.st === 'strike';
      if (m.hp <= 0){ m.st = 'die'; m.t = 0; m.kvx = face * 5; SUKIEN.push({k:'quai-chet', m}); }
      else if (!khongNgat){ m.kvx = face * (n === 3 ? 6 : 4.4); m.st = 'hit'; m.t = 0; }   // luật cũ Chuông Gỗ
    }
  }
  if (co){ S.hitstop = Math.max(S.hitstop, hs); shake(a.sh[0] * face, a.sh[1], a.mag); }
  return co;
}
function hurt(dir){
  if (pl.dead || pl.iframes > 0 || pl.pogoSafe > 0) return;
  pl.hp--; pl.iframes = P.hurtIFrames; pl.hurtT = 18; pl.vx = dir * 4.8; pl.vy = -6; pl.atkN = 0; pl.dash = 0; pl.jumping = false;
  CHO.co = false; pl.comboHan = 0; pl.dashBuf = 0;
  S.hitstop = 6; shake(dir || 0.01, -0.6, 2.6);
  pl.hurtK = (dir === 0 ? -1 : Math.sign(dir) * pl.face);
  if (pl.hp <= 0){ pl.dead = true; pl.deadT = 0; S.chet++; }
  SUKIEN.push({k:'bi-danh', chet:pl.dead});
}

/* ---------- MỤC TIÊU: một bước ---------- */
function capNhatMT(){
  for (const m of MT){
    if (m.flash > 0) m.flash--;
    if (m.loai === 'nom'){
      if (m.t > 0) m.t--;
      if (Math.abs(m.kvx) > 0.1){ m.x += m.kvx; m.kvx *= 0.75; }
      else { m.kvx = 0; m.x = approach(m.x, m.hx, 0.6); }   // nộm trôi về chỗ cũ
      continue;
    }
    const q = m;
    if (q.dead){ if (++q.hoiT >= 180) datLaiQuai(q); continue; }
    q.vy = Math.min(q.vy + 0.6, 10); if (moveY(q, q.vy) !== 0) q.vy = 0;
    if (Math.abs(q.kvx) > 0.1){ const ax = q.kvx > 0 ? q.x + q.w + 2 : q.x - 2; if (!solidPt(ax, q.y + q.h + 4) || moveX(q, q.kvx, false)) q.kvx = 0; q.kvx *= 0.78; }
    q.t++;
    const dx = (pl.x + pl.w / 2) - (q.x + q.w / 2), dy = (pl.y + pl.h) - (q.y + q.h);
    switch (q.st){
      case 'walk': {
        if (q.cd > 0) q.cd--;
        const ax = q.face > 0 ? q.x + q.w + 2 : q.x - 2, blocked = moveX(q, q.face * 0.9, false);
        if (blocked || !solidPt(ax, q.y + q.h + 4) || (q.face < 0 && q.x <= q.minX) || (q.face > 0 && q.x + q.w >= q.maxX)) q.face *= -1;
        if (!pl.dead && q.cd <= 0 && Math.abs(dx) < 170 && Math.abs(dy) < 80){ q.st = 'wind'; q.t = 0; q.face = dx > 0 ? 1 : -1; }
        break; }
      case 'wind': if (q.t >= 30){ q.st = 'strike'; q.t = 0; } break;
      case 'strike':
        if (q.t <= 5){ const ax = q.face > 0 ? q.x + q.w + 4 : q.x - 4; if (solidPt(ax, q.y + q.h + 4)) moveX(q, q.face * 3.6, false); }
        if (q.t === 5) shake(q.face, 1, 1.2);
        if (q.t >= 5 && q.t <= 10 && !pl.dead){ hopQuai(q, QR); if (overlap(hurtBox(), QR)) hurt(q.face); }
        if (q.t >= 16){ q.st = 'rec'; q.t = 0; }
        break;
      case 'rec': if (q.t >= 26){ q.st = 'walk'; q.t = 0; q.cd = 60; } break;
      case 'hit': if (q.t >= 16){ q.st = 'walk'; q.t = 0; q.cd = Math.max(q.cd, 20); } break;
      case 'die': if (q.t >= 90){ q.dead = true; q.hoiT = 0; } break;
    }
    if (q.st !== 'die' && !pl.dead && overlap(pl, q)) hurt(Math.sign(dx) || 1);
  }
}

/* ---------- ĐẦU VÀO (trang ghi vào IN mỗi bước) ---------- */
const IN = {l:false, r:false, u:false, d:false, j:false, a:false, s:false, bamJ:false, bamA:false, bamS:false, stickY:0, coCan:false,
  huong(){ if (this.uPhim || (this.coCan && this.stickY < -NGUONG_HUONG)) return 'u'; if (this.dPhim || (this.coCan && this.stickY > NGUONG_HUONG)) return 'd'; return ''; },
  xuong(){ return !!this.dPhim || (this.coCan && this.stickY > NGUONG_HUONG); }, uPhim:false, dPhim:false};

/* ---------- MỘT BƯỚC 60 Hz ---------- */
function buoc(){
  SUKIEN.length = 0;
  if (IN.bamJ) pl.jumpBuf = P.jumpBuffer;
  if (IN.bamA) bamChem();
  if (IN.bamS) pl.dashBuf = 4;
  if (S.sht > 0) S.sht--;
  if (S.hitstop > 0){ S.hitstop--; return false; }
  S.frame++;
  capNhatLam();
  let hb = pl.dead ? null : atkBox(pl, pl.atkN, pl.atkT, pl.face, HB);
  if (hb){ const n = pl.atkN, co = trung(hb, n, pl.face); if (n === 4 && !pl.atkBounced && co) pogoBounce(hb); }
  capNhatMT();
  if (pl.jumpBuf > 0) pl.jumpBuf--;
  if (pl.dashBuf > 0 && !pl.luotCho) pl.dashBuf--;   // DC: phím lướt bấm lúc ra đòn được giữ tới pha hồi
  return true;
}

/* ---------- TRẠNG THÁI CHO ANIMATION (ưu tiên: chết > bị đánh > lướt > chém > vách > trên không > tiếp đất > chạy > đứng) ---------- */
function trangThai(){
  if (pl.dead) return {ten:'chet', t:pl.deadT};
  if (pl.hurtT > 0) return {ten:'bi-danh', tiLe:1 - pl.hurtT / 18, t:18 - pl.hurtT};
  if (pl.dash > 0 || pl.st === 'dash') return {ten:'luot', tiLe:(P.dashFrames - pl.dash) / P.dashFrames, t:P.dashFrames - pl.dash};
  if (pl.atkN){ const p = phaDon(pl.atkN, pl.atkT); return {ten:ATK[pl.atkN].ten, n:pl.atkN, atkT:pl.atkT, pha:p.pha, phaT:p.t, phaDai:p.dai, tiLe:p.tiLe}; }
  if (pl.st === 'wall') return {ten:'tuong', bam:pl.wallStickT < P.wallStick};
  if (!pl.onGround){
    if (pl.wjT >= 11) return {ten:'nhay-vach', tiLe:(16 - pl.wjT) / 6};
    return pl.vy < 0 ? {ten:'nhay', tiLe:clamp(1 + pl.vy / jumpVel, 0, 1)} : {ten:'roi', tiLe:clamp(pl.vy / P.maxFall, 0, 1)};
  }
  if (Math.abs(pl.dxT) > 0.001 && Math.abs(pl.vx) > 0.6) return {ten:'chay'};
  if (pl.landT > 4) return {ten:'tiep-dat', tiLe:(10 - pl.landT) / 6};
  return {ten:'dung'};
}

window.DongCo = {P, ATK, DCO, DC_SO, BD, S, pl, MT, IN, SUKIEN, CHO, ROI, napBanDo, datLam, taoNom, taoQuai, buoc, atkBox, hurtBox, hopQuai,
  phaDon, trangThai, collide, tile, jumpVel};
