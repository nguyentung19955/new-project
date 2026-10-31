'use strict';
/* =====================================================================================================================
   dong-co-mn.js – ENGINE trang thử Mặt Nạ Trắng: vật lý + đòn + AI quái. KHÔNG vẽ.
   Vật lý (va chạm ô, nhảy mềm, coyote, đệm nhảy, bám vách, nhảy vách, lướt) CHÉP từ game/thu-pixellab/dong-co.js.
   Mới: nhảy đôi, lượn (giữ Nhảy khi rơi), đập đất (↓ + Chém trên không), hồi máu (tốn Tiếng Vọng), combo 3 đòn + chém trên không
   lấy THỜI GIAN TỪNG HÌNH + KHUNG TRÚNG + HỘP ĐÁNH từ nhan-vat.json (đổi theo Cấp). Quái lấy hết số liệu từ quai.json.
   Toạ độ: px LOGIC (khung 960×540). 1 điểm ảnh sprite = TL px logic (ti_le, mặc định 2). Ô = 48 px logic.
   ===================================================================================================================== */
const DongCoMN = (() => {
  const P = {runSpeed:4.2, jumpHeight:118, gravity:0.768, accelFrames:6, decelFrames:5, airControl:0.8, turnBoost:1.6, maxFall:10.4,
    fallGravMul:0.93, apexGravMul:0.3, apexThreshold:4, jumpCut:0.5, coyote:6, jumpBuffer:8, corner:8,
    wallSlideMax:1.5, wallJumpVx:5.4, wallJumpMul:0.92, wallJumpLock:9, wallSense:6, wallCoyote:8, wallBackMul:0.35, wallStick:6,
    dashSpeed:10, dashFrames:12, dashIFrames:14, dashCooldown:22,
    djMul:0.88, glideFall:2.6, glideMax:60, poundSpeed:13,
    maxHp:6, hurtIFrames:70, hurtT:22, vongMax:9, vongHoi:3, comboHan:14, choThem:8};
  const jumpVel = Math.sqrt(2 * P.gravity * P.jumpHeight);
  let TL = 2, CO = 1;   // CO = hệ số cỡ riêng của nhân vật chính (nhan-vat.json "co")

  /* ---------- BẢN ĐỒ ---------- */
  const BD = {T:48, COT:80, HANG:12, L:[]};
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
  function napBanDo(luoi, them){
    BD.L = luoi.map(r => r.split('')); BD.HANG = BD.L.length; BD.COT = BD.L[0].length;
    for (const [c0, r0, c1, r1] of (them || [])) for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) BD.L[r][c] = '#';
  }

  /* ---------- TRẠNG THÁI ---------- */
  const S = {frame:0, hitstop:0, sht:0, shm:0, shx:0, shy:0, swing:0, nTrung:0, chet:0};
  const pl = {x:0, y:0, w:28, h:96, vx:0, vy:0, face:1, onGround:false, coyote:0, jumpBuf:0, dashBuf:0, jumping:false,
    wallDir:0, wallLock:0, wallCoy:0, lastWall:0, wallStickT:0, wjBack:0, landT:0, yTop:0, dxT:0,
    dash:0, dashDir:1, dashCd:0, airDash:false, djCo:false, djT:-1, luon:false, sliding:false,
    iframes:0, hp:P.maxHp, hurtT:0, dead:false, deadT:0, vong:0,
    atk:'', atkT:0, atkSw:0, comboHan:0, comboTiep:'', laoTat:false, pound:null, hoi:-1, hoiXong:false, sx:0, sy:0};
  const CHO = {co:false, han:0};
  const NV = {clip:{}, capClip:{}, cap:null};   // trang gán: clip của nhân vật + clip theo cấp đang chọn
  const QUAI = [];
  const SUKIEN = [];
  const IN = {l:false, r:false, j:false, a:false, s:false, h:false, bamJ:false, bamA:false, bamS:false, bamH:false, dPhim:false, stickY:0, coCan:false,
    xuong(){ return !!this.dPhim || (this.coCan && this.stickY > 0.7); },
    len(){ return !!this.uPhim || (this.coCan && this.stickY < -0.7); }};
  const clipNV = ten => NV.capClip[ten] || NV.clip[ten];
  const khung = (C, t) => SpriteMN.khungTheoBuoc(C, t);
  function shake(x, y, m){ S.shx = x; S.shy = y; S.shm = Math.max(S.shm * (S.sht > 0 ? 1 : 0), m); S.sht = 8; }

  function datNV(x, chanY){
    Object.assign(pl, {x:x - pl.w / 2, y:chanY - pl.h, vx:0, vy:0, face:1, dash:0, atk:'', pound:null, hoi:-1, hurtT:0, iframes:0, dead:false, deadT:0,
      hp:P.maxHp, jumpBuf:0, dashBuf:0, airDash:false, djCo:false, djT:-1, landT:0, comboHan:0, onGround:true, wallLock:0});
    pl.sx = x; pl.sy = chanY; CHO.co = false;
  }

  /* ---------- ĐÒN NHÂN VẬT ---------- */
  function batDauDon(ten, idx){
    pl.comboIdx = idx ?? 0;
    pl.atk = ten; pl.atkT = 0; pl.atkSw = ++S.swing; pl.comboHan = 0; CHO.co = false;
    if (pl.onGround){ pl.vx = 0; pl.laoTat = collide(pl.x + pl.face * 2, pl.y, pl.w, pl.h); }
    SUKIEN.push({k:'ra-don', ten});
  }
  // Chuỗi combo mặt đất (nhan-vat.json: chuoi). Hướng giữ khi bấm đổi nhát: lên = chéo lên, xuống = chéo xuống
  function chuoi(){ return (NV.chuoi && NV.chuoi.length) ? NV.chuoi : ['don1', 'don2', 'don3']; }
  const coClip = ten => !!(NV.capClip[ten] || NV.clip[ten]);
  function viTri(ten){ return ten === pl.atk ? (pl.comboIdx ?? 0) : chuoi().indexOf(ten); }
  function bienThe(goc){
    const bt = NV.bien_the || {};
    if (IN.len() && bt.len && coClip(bt.len)) return bt.len;
    if (IN.xuong() && bt.xuong && coClip(bt.xuong)) return bt.xuong;
    return goc;
  }
  function donTiep(ten){
    const c = chuoi(), i = viTri(ten);
    if (i < 0 || i >= c.length - 1) return '';
    return i + 1 === c.length - 1 ? c[i + 1] : bienThe(c[i + 1]);   // nhát kết không đổi theo hướng
  }
  function khungCuoiTrung(C){ const t = C.def.trung || []; return t.length ? Math.max(...t) : -1; }
  function chonDon(dir){
    if (CHO.co && S.frame > CHO.han) CHO.co = false;
    if (!CHO.co || pl.dash > 0 || pl.hurtT > 8 || pl.pound || pl.hoi >= 0) return;
    if (!pl.atk){
      if (dir) pl.face = dir;
      if (!pl.onGround && IN.xuong()){ pl.pound = {pha:'lay', t:0}; pl.vx = 0; pl.vy = 0; CHO.co = false; SUKIEN.push({k:'ra-don', ten:'dapdat'}); return; }
      if (!pl.onGround){ batDauDon('chemkhong', -1); return; }
      if (pl.comboHan > 0 && pl.comboTiep) batDauDon(pl.comboTiep, pl.comboTiepIdx); else batDauDon(bienThe(chuoi()[0]), 0);
    } else if (pl.onGround && donTiep(pl.atk)){
      const C = clipNV(pl.atk);
      if (khung(C, pl.atkT) > khungCuoiTrung(C)){ if (dir) pl.face = dir; const i = (pl.comboIdx ?? 0) + 1; batDauDon(donTiep(pl.atk), i); }
    }
  }
  function choLuot(){
    if (pl.hurtT > 8 || pl.pound || pl.hoi >= 0) return false;
    if (!pl.atk) return true;
    const C = clipNV(pl.atk); return khung(C, pl.atkT) > khungCuoiTrung(C);   // chỉ huỷ đòn SAU các khung trúng
  }
  // hộp đánh hiện tại của nhân vật (null = không có)
  const HB = {x:0, y:0, w:0, h:0};
  function hopTuDef(hop, fx, fy, face, out){
    const [dx, dy, w, h] = hop, T = TL * CO;
    out.x = face > 0 ? fx + dx * T : fx - (dx + w) * T; out.y = fy + dy * T; out.w = w * T; out.h = h * T; return out;
  }
  function hopNV(){
    if (pl.dead) return null;
    const fx = pl.x + pl.w / 2, fy = pl.y + pl.h;
    if (pl.pound && pl.pound.pha === 'cham'){
      const C = clipNV('dapdat'), k = khung(C, pl.pound.t);
      if ((C.def.trung || []).includes(k) && C.def.hop) return hopTuDef(C.def.hop, fx, fy, pl.face, HB);
      return null;
    }
    if (!pl.atk) return null;
    const C = clipNV(pl.atk), k = khung(C, pl.atkT);
    if (!(C.def.trung || []).includes(k) || !C.def.hop) return null;
    return hopTuDef(C.def.hop, fx, fy, pl.face, HB);
  }
  function satThuongNV(){
    if (pl.pound) return clipNV('dapdat').def.sat_thuong || 14;
    const C = clipNV(pl.atk); return Math.round(((NV.cap && NV.cap.sat_thuong) || 10) * (C.def.nhan || 1));
  }
  const HU = {x:0, y:0, w:0, h:0};
  function hurtBox(){ HU.x = pl.x + pl.w / 2 - 18; HU.y = pl.y + pl.h - 104; HU.w = 36; HU.h = 104; return HU; }

  function hurt(dir, dmg){
    if (pl.dead || pl.iframes > 0) return;
    pl.hp -= dmg || 1; pl.iframes = P.hurtIFrames; pl.nhay = P.hurtIFrames; pl.hurtT = P.hurtT; pl.vx = dir * 3.2; pl.vy = -3; pl.jumping = false;
    pl.atk = ''; pl.pound = null; pl.hoi = -1; pl.dash = 0; CHO.co = false; pl.comboHan = 0; pl.dashBuf = 0; pl.djT = -1;
    S.hitstop = 6; shake(dir || 0.01, -0.6, 2.6);
    if (pl.hp <= 0){ pl.hp = 0; pl.dead = true; pl.deadT = 0; S.chet++; }
    SUKIEN.push({k:'bi-danh', chet:pl.dead});
  }

  /* ---------- NHÂN VẬT: một bước ---------- */
  function capNhatNV(){
    pl.dxT = 0; pl.luon = false;
    if (pl.dead){
      pl.deadT++; pl.vx *= 0.9; pl.vy = Math.min(pl.vy + P.gravity, P.maxFall);
      moveX(pl, pl.vx, false); if (moveY(pl, pl.vy)) pl.vy = 0;
      if (pl.deadT >= clipNV('chet').tong + 50){ datNV(pl.sx, pl.sy); pl.iframes = 60; pl.nhay = 60; SUKIEN.push({k:'hoi-sinh'}); }
      return;
    }
    const dir = (IN.r ? 1 : 0) - (IN.l ? 1 : 0);
    if (pl.wallLock > 0) pl.wallLock--; if (pl.dashCd > 0) pl.dashCd--; if (pl.iframes > 0) pl.iframes--; if (pl.nhay > 0) pl.nhay--;
    if (pl.hurtT > 0) pl.hurtT--; if (pl.landT > 0) pl.landT--; if (pl.comboHan > 0) pl.comboHan--;
    if (pl.djT >= 0){ pl.djT++; if (pl.djT >= clipNV('nhaydoi').tong) pl.djT = -1; }

    // Hồi máu: đứng yên trên đất, tốn P.vongHoi Tiếng Vọng, +1 máu ở khung_hoi; bị đánh thì mất
    if (pl.hoi >= 0){
      pl.hoi++; const C = clipNV('hoimau');
      if (!pl.hoiXong && khung(C, pl.hoi) >= (C.def.khung_hoi ?? 5)){ pl.hoiXong = true; pl.hp = Math.min(P.maxHp, pl.hp + 1); SUKIEN.push({k:'hoi-mau'}); }
      if (pl.hoi >= C.tong) pl.hoi = -1;
      pl.vx = approach(pl.vx, 0, 1); pl.vy = Math.min(pl.vy + P.gravity, P.maxFall); if (moveY(pl, pl.vy)) pl.vy = 0; ketDat();
      return;
    }
    if (IN.bamH){
      if (pl.onGround && !pl.atk && !pl.pound && pl.dash <= 0 && pl.hurtT <= 0 && pl.vong >= P.vongHoi && pl.hp < P.maxHp){
        pl.hoi = 0; pl.hoiXong = false; pl.vong -= P.vongHoi; pl.vx = 0; SUKIEN.push({k:'bat-dau-hoi'}); return;
      }
      SUKIEN.push({k:'khong-hoi', ly:pl.hp >= P.maxHp ? 'đầy máu' : pl.vong < P.vongHoi ? 'thiếu Tiếng Vọng' : 'phải đứng trên đất'});
    }

    // Lướt
    if (pl.dashBuf > 0 && pl.dashCd <= 0 && pl.dash <= 0 && (pl.onGround || !pl.airDash) && choLuot()){
      pl.dash = P.dashFrames; pl.dashDir = dir || pl.face; pl.face = pl.dashDir; pl.vy = 0;
      pl.iframes = Math.max(pl.iframes, P.dashIFrames); if (!pl.onGround) pl.airDash = true;
      pl.dashCd = P.dashFrames + P.dashCooldown; pl.atk = ''; pl.dashBuf = 0; CHO.co = false; pl.jumping = false; pl.comboHan = 0; pl.djT = -1;
      SUKIEN.push({k:'luot'});
    }
    if (pl.dash > 0){
      if (pl.jumpBuf > 0 && (pl.onGround || pl.coyote > 0)){ pl.dash = 0; pl.vx = pl.dashDir * P.runSpeed * 1.15; }
      else {
        pl.dash--; pl.vx = pl.dashDir * P.dashSpeed; pl.vy = 0;
        const x0 = pl.x; if (moveX(pl, pl.vx, true)) pl.dash = 0; pl.dxT = pl.x - x0;
        if (pl.dash === 0) pl.vx = pl.dashDir * P.runSpeed;
        ketDat(); return;
      }
    }

    // Đập đất: lấy đà (lơ lửng) → lao thẳng xuống (giữ khung_lao) → chạm đất: các khung còn lại, hộp đánh ở khung trúng
    if (pl.pound){
      const C = clipNV('dapdat'), kl = C.def.khung_lao ?? 3, pd = pl.pound;
      if (pd.pha === 'lay'){ pd.t++; pl.vx = 0; pl.vy = 0; if (khung(C, pd.t) >= kl) pd.pha = 'lao'; }
      else if (pd.pha === 'lao'){
        pl.vy = P.poundSpeed; const r = moveY(pl, pl.vy);
        if (r === 1){ pd.pha = 'cham'; pd.t = C.buoc.slice(0, kl + 1).reduce((a, b) => a + b, 0); pl.vy = 0; pl.atkSw = ++S.swing;
          S.hitstop = Math.max(S.hitstop, 3); shake(0, 1, 3); SUKIEN.push({k:'dap-dat', x:pl.x + pl.w / 2, y:pl.y + pl.h}); }
      } else { pd.t++; pl.vx = 0; if (pd.t >= C.tong) pl.pound = null; pl.vy = Math.min(pl.vy + P.gravity, P.maxFall); if (moveY(pl, pl.vy)) pl.vy = 0; }
      ketDat(); return;
    }

    // Ngang
    const atkGround = pl.atk && pl.onGround;
    let target = atkGround ? 0 : dir * P.runSpeed;
    let acc = P.runSpeed / P.accelFrames, dec = P.runSpeed / P.decelFrames;
    if (!pl.onGround){ acc *= P.airControl; dec *= P.airControl * 0.6; }
    const backToWall = pl.wallLock > 0 && dir !== 0 && dir === pl.wjBack;
    if (pl.wallLock > 0 && !backToWall) acc *= 0.25;
    if (pl.hurtT > 10) target = pl.vx;
    if (backToWall) pl.vx = approach(pl.vx, target, acc * P.turnBoost * 1.5);
    else if (target !== 0){ const turning = pl.vx !== 0 && Math.sign(pl.vx) !== Math.sign(target); pl.vx = approach(pl.vx, target, turning ? acc * P.turnBoost : acc); }
    else if (pl.wallLock <= 0) pl.vx = approach(pl.vx, 0, atkGround ? dec * 0.5 : dec);
    if (dir && !pl.atk && pl.wallLock <= 0 && pl.hurtT <= 10) pl.face = dir;

    // Dọc (nhảy mềm như thu-pixellab)
    let g = P.gravity;
    if (!pl.onGround){
      const a0 = Math.min(1, Math.abs(pl.vy) / P.apexThreshold), a = a0 * a0 * (3 - 2 * a0), top = IN.j ? P.apexGravMul : 0.8;
      g *= top + (1 - top) * a; if (pl.vy > 0) g *= 1 + (P.fallGravMul - 1) * a;
    }
    pl.vy = Math.min(pl.vy + g, P.maxFall);

    // Vách
    const ws = P.wallSense + 0.5;
    pl.wallDir = pl.onGround ? 0 : (collide(pl.x - ws, pl.y, pl.w, pl.h) ? -1 : (collide(pl.x + ws, pl.y, pl.w, pl.h) ? 1 : 0));
    if (pl.wallDir){ pl.wallCoy = P.wallCoyote; pl.lastWall = pl.wallDir; } else { if (pl.wallCoy > 0) pl.wallCoy--; pl.wallStickT = 0; }
    if (pl.onGround){ pl.wallCoy = 0; pl.wallStickT = 0; }
    let sliding = false;
    const touching = pl.wallDir && collide(pl.x + pl.wallDir, pl.y, pl.w, pl.h);
    if (pl.wallDir && pl.vy > 0 && !pl.atk && dir !== -pl.wallDir && (touching || dir === pl.wallDir)){
      if (pl.wallStickT < P.wallStick){ pl.wallStickT++; pl.vy = 0; } else pl.vy = Math.min(pl.vy, P.wallSlideMax);
      sliding = true; pl.face = -pl.wallDir; pl.djCo = true; pl.airDash = false; pl.djT = -1;
    }
    // Nhảy: đất / coyote → nhảy · vách → nhảy vách · trên không còn lượt → nhảy đôi
    if (pl.jumpBuf > 0 && pl.hurtT <= 10){
      if ((pl.onGround || pl.coyote > 0) && pl.atk){ pl.atk = ''; CHO.co = false; pl.comboHan = 0; }   // nhảy huỷ đòn đang chém -> hiện dáng nhảy
      if (pl.onGround || pl.coyote > 0){ pl.vy = -jumpVel; pl.jumping = true; pl.coyote = 0; pl.jumpBuf = 0; pl.onGround = false; pl.djCo = true; SUKIEN.push({k:'nhay'}); }
      else if (pl.wallDir || pl.wallCoy > 0){
        const wd = pl.wallDir || pl.lastWall, back = (dir === wd);
        pl.vy = -jumpVel * P.wallJumpMul; pl.vx = -wd * P.wallJumpVx * (back ? P.wallBackMul : 1); pl.face = -wd; pl.wallLock = P.wallJumpLock;
        pl.wjBack = wd; pl.wallCoy = 0; pl.wallStickT = 0; pl.jumping = true; pl.jumpBuf = 0; pl.airDash = false; pl.djCo = true;
        sliding = false; SUKIEN.push({k:'nhay-vach', wd});
      } else if (pl.djCo){
        if (pl.atk){ pl.atk = ''; CHO.co = false; pl.comboHan = 0; }   // nhảy đôi cũng huỷ chém trên không
        pl.djCo = false; pl.vy = -jumpVel * P.djMul; pl.jumping = true; pl.jumpBuf = 0; pl.djT = 0; SUKIEN.push({k:'nhay-doi'});
      }
    }
    if (pl.jumping && !IN.j && pl.vy < 0){ pl.vy *= P.jumpCut; pl.jumping = false; }
    if (pl.vy >= 0) pl.jumping = false;
    // Lượn: giữ Nhảy khi đang rơi
    if (pl.onGround || sliding) pl.luonT = 0;
    if (P.coLuon && !pl.onGround && !sliding && pl.vy > 0 && IN.j && !pl.atk && pl.hurtT <= 0 && (pl.luonT || 0) < P.glideMax){ pl.vy = Math.min(pl.vy, P.glideFall); pl.luon = true; pl.luonT = (pl.luonT || 0) + 1; }

    const xTruoc = pl.x; if (moveX(pl, pl.vx, false)) pl.vx = 0; pl.dxT = pl.x - xTruoc;
    const vyWas = pl.vy, ry = moveY(pl, pl.vy);
    if (ry !== 0){ if (ry === 1 && vyWas > 5) pl.landT = 10; if (ry === -1) pl.jumping = false; pl.vy = 0; }
    const daTrenKhong = !pl.onGround;
    ketDat();
    if (daTrenKhong && pl.onGround && pl.atk === 'chemkhong') pl.atk = '';   // chạm đất: thôi chém trên không

    // Đòn
    chonDon(dir);
    if (pl.atk){
      pl.atkT++; const C = clipNV(pl.atk);
      const lao = C.def.lao;
      if (lao && pl.onGround && !pl.laoTat){
        const k = khung(C, pl.atkT);
        if (k >= lao[0] && k <= lao[1]){
          const b = C.buoc.slice(lao[0], lao[1] + 1).reduce((a, v) => a + v, 0) || 1;
          const x0 = pl.x; if (moveX(pl, pl.face * lao[2] * TL / b, false)) pl.laoTat = true; pl.dxT += pl.x - x0;
        }
      }
      if (pl.atk === chuoi()[chuoi().length - 1] && Math.abs(pl.atkT - C.buoc.slice(0, (C.def.trung || [4])[0]).reduce((a, v) => a + v, 0)) < 0.5) shake(0, 1, 1.5);
      if (pl.atkT >= C.tong){
        if (pl.onGround && donTiep(pl.atk)){ pl.comboHan = P.comboHan; pl.comboTiep = donTiep(pl.atk); pl.comboTiepIdx = (pl.comboIdx ?? 0) + 1; }
        pl.atk = '';
      }
    }
    pl.sliding = sliding;
  }
  function ketDat(){
    const was = pl.onGround;
    pl.onGround = collide(pl.x, pl.y + 1, pl.w, pl.h);
    if (pl.onGround){ pl.coyote = P.coyote; pl.airDash = false; pl.djCo = false; pl.djT = -1; if (!was) SUKIEN.push({k:'cham-dat', cao:pl.y - pl.yTop}); }
    else if (pl.coyote > 0) pl.coyote--;
    if (pl.onGround) pl.yTop = pl.y; else pl.yTop = Math.min(pl.yTop, pl.y);
  }

  /* ---------- QUÁI (số liệu từ quai.json; d._clip do trang gán sau khi nạp) ---------- */
  function taoQuai(def, dat, datY){
    const T = BD.T, w = def.than[0] * TL, h = def.than[1] * TL, fx = dat.cot * T + T / 2;
    const fy = def.bay ? datY - (dat.cao ?? 120) : datY;
    const q = {def, dat, w, h, hx:fx, hy:fy, minX:(dat.tu ?? dat.cot - 3) * T, maxX:((dat.den ?? dat.cot + 3) + 1) * T, x:0, y:0};
    datLaiQuai(q); return q;
  }
  function datLaiQuai(q){
    Object.assign(q, {x:q.hx - q.w / 2, y:q.hy - q.h, hp:q.def.mau || 30, face:-1, vy:0, kvx:0, st:'tuan_tra', t:0, cd:30, flash:0,
      dead:false, hoiT:0, lastSw:-1, daDanh:false, nghi:0, alpha:1, dangDi:false, anim:{ten:'dung', t:0}, baoTruoc:false, kDanh:0});
  }
  const QR = {x:0, y:0, w:0, h:0};
  function hopQuai(q, out){   // hop_danh vẽ cho hướng TRÁI (như ảnh); quay phải thì lật
    const d = q.def; if (!d.hop_danh) return null;
    const [dx, dy, w, h] = d.hop_danh, fx = q.x + q.w / 2, fy = q.y + q.h;
    out.x = q.face < 0 ? fx + dx * TL : fx - (dx + w) * TL; out.y = fy + dy * TL; out.w = w * TL; out.h = h * TL; return out;
  }
  // thời gian clip đánh có giữ khung báo trước: te = thời gian "hình" từ thời gian thực t
  function tDanh(q){
    const d = q.def, C = d._clip.danh, b = d.khung_bao_truoc || 0, hold = (d.bao_truoc_them_ms || 0) * 0.06;
    if (!b || !hold) return q.t;
    const tA = C.buoc.slice(0, b).reduce((a, v) => a + v, 0) - 0.01;   // cuối khung báo trước cuối cùng
    return q.t < tA ? q.t : q.t < tA + hold ? tA : q.t - hold;
  }
  function quaiTrung(q, dmg, face){
    const d = q.def;
    q.hp -= dmg; q.flash = 6; q.lastSw = pl.atkSw;
    if (q.hp <= 0){ q.st = 'chet'; q.t = 0; q.kvx = face * 3; SUKIEN.push({k:'quai-chet', q}); return; }
    if (d.sieu_giap && q.st === 'danh'){ q.kvx = face * 0.6; return; }   // tinh anh: đang ra đòn không bị ngắt
    q.st = 'trung'; q.t = 0; q.kvx = face * (d.day_lui ?? 3); q.daDanh = false; q.anim.ten = '';   // phát lại clip trúng từ đầu
  }
  function capNhatQuai(){
    for (const q of QUAI){
      const d = q.def, C = d._clip || {};
      if (q.dead){ if (++q.hoiT >= (d.hoi_sinh_ms ?? 4000) * 0.06) datLaiQuai(q); continue; }
      if (q.flash > 0) q.flash--; if (q.cd > 0) q.cd--;
      q.t++;
      const fxq = q.x + q.w / 2, fyq = q.y + q.h, hx = pl.x + pl.w / 2, hy = pl.y + pl.h, dx = hx - fxq, dy = hy - fyq;
      const tam = d.tam_phat_hien || 300;
      const thay = !pl.dead && Math.abs(dx) < tam && Math.abs(dy) < (d.bay ? 300 : 150);
      const giu = !pl.dead && Math.abs(dx) < tam * 1.4 && Math.abs(dy) < (d.bay ? 360 : 200);
      // trọng lực / đẩy lùi
      if (!d.bay){ q.vy = Math.min(q.vy + 0.6, 10); if (moveY(q, q.vy) !== 0) q.vy = 0; }
      if (Math.abs(q.kvx) > 0.1){
        if (d.bay) q.x += q.kvx;
        else { const ax = q.kvx > 0 ? q.x + q.w + 2 : q.x - 2; if (!solidPt(ax, q.y + q.h + 4) || moveX(q, q.kvx, false)) q.kvx = 0; }
        q.kvx *= 0.8;
      } else q.kvx = 0;
      q.baoTruoc = false; q.dangDi = false;
      const diToi = (vx) => {   // đi ngang có chặn: biên tuần tra (+1 ô khi đuổi), mép vực, tường
        if (!vx) return false;
        const f = Math.sign(vx), ax = f > 0 ? q.x + q.w + 2 : q.x - 2;
        if ((f < 0 && q.x <= q.minX - (q.st === 'duoi' ? BD.T : 0)) || (f > 0 && q.x + q.w >= q.maxX + (q.st === 'duoi' ? BD.T : 0))) return true;
        if (d.bay){ q.x += vx; q.dangDi = true; return false; }
        if (!solidPt(ax, q.y + q.h + 4)) return true;
        const bi = moveX(q, vx, false); q.dangDi = !bi; return bi;
      };
      const bayVe = (ty, sp) => { if (d.bay) q.y = approach(q.y + q.h, ty, sp) - q.h; };
      switch (q.st){
        case 'tuan_tra': {
          if (q.nghi > 0){ q.nghi--; }
          else if (diToi(q.face * (d.toc_do ?? 0.8))){ q.face *= -1; q.nghi = 50 + (q.hx % 40); }
          bayVe(q.hy + Math.sin(S.frame / 28 + q.hx) * 8, 1);
          if (thay){ q.st = 'duoi'; q.t = 0; }
          break; }
        case 'duoi': {
          if (!giu){ q.st = 'tuan_tra'; q.t = 0; break; }
          if (Math.abs(dx) > 6) q.face = dx > 0 ? 1 : -1;
          const tamDanh = d.tam_danh || 100;
          const doCao = d.bay ? Math.abs(dy - (d.bay_cao ?? 40)) < 40 : Math.abs(dy) < 90;
          if (q.cd <= 0 && Math.abs(dx) <= tamDanh && doCao){ q.st = 'danh'; q.t = 0; q.daDanh = false; break; }
          if (Math.abs(dx) > tamDanh * 0.75) diToi(q.face * (d.toc_do_duoi ?? 1.5));
          bayVe(hy - (d.bay_cao ?? 40), (d.toc_do_duoi ?? 1.5) * 0.8);
          break; }
        case 'danh': {
          const Cd = C.danh, te = tDanh(q), k = khung(Cd, te);
          q.kDanh = k; q.baoTruoc = k < (d.khung_bao_truoc || 0);
          if (d.lao && k >= d.lao[0] && k <= d.lao[1]){
            const b = Cd.buoc.slice(d.lao[0], d.lao[1] + 1).reduce((a, v) => a + v, 0) || 1; diToi(q.face * d.lao[2] * TL / b);
          }
          if ((d.khung_trung || []).includes(k) && !pl.dead){
            const hb = hopQuai(q, QR);
            if (hb && !q.daDanh && overlap(hurtBox(), hb)){ q.daDanh = true; hurt(q.face, d.sat_thuong || 1); }
          }
          if (te >= Cd.tong){ q.st = 'hoi'; q.t = 0; q.cd = (d.hoi_chieu_ms ?? 1200) * 0.06; }
          break; }
        case 'hoi': if (q.t >= 24){ q.st = thay ? 'duoi' : 'tuan_tra'; q.t = 0; } break;
        case 'trung': if (q.t >= Math.max(15, C.trung ? C.trung.tong : 20)){ q.st = 'duoi'; q.t = 0; q.cd = Math.max(q.cd, 20); } break;
        case 'chet': {
          const tong = C.chet ? C.chet.tong : 60;
          q.alpha = q.t <= tong ? 1 : Math.max(0, 1 - (q.t - tong) / 30);   // hết hình cuối → mờ dần 0,5 s
          if (q.t >= tong + 30){ q.dead = true; q.hoiT = 0; }
          break; }
      }
      // hình cho trang vẽ
      const A = q.anim;
      const ten = q.st === 'danh' ? 'danh' : q.st === 'trung' ? 'trung' : q.st === 'chet' ? 'chet' : q.dangDi ? 'di' : 'dung';
      if (A.ten !== ten){ A.ten = ten; A.t = 0; } else A.t++;
      A.k = ten === 'danh' ? q.kDanh : null;
    }
  }
  function trungQuai(){   // hộp đánh nhân vật → quái
    const hb = hopNV(); if (!hb) return;
    let co = false;
    for (const q of QUAI){
      if (q.dead || q.st === 'chet' || q.lastSw === pl.atkSw || !overlap(hb, q)) continue;
      const face = (q.x + q.w / 2) >= (pl.x + pl.w / 2) ? 1 : -1;
      quaiTrung(q, satThuongNV(), face); co = true; S.nTrung++;
      const dayK = (clipNV(pl.pound ? 'dapdat' : pl.atk).def || {}).day; if (dayK && q.kvx) q.kvx *= dayK;   // đẩy lùi mạnh hơn ở đòn nặng
      pl.vong = Math.min(P.vongMax, pl.vong + 1);
      const tx = (Math.max(hb.x, q.x) + Math.min(hb.x + hb.w, q.x + q.w)) / 2, ty = (Math.max(hb.y, q.y) + Math.min(hb.y + hb.h, q.y + q.h)) / 2;
      SUKIEN.push({k:'trung', x:tx, y:ty, q});
    }
    if (co){
      // cảm giác "nặng": dừng hình + rung theo từng đòn (dung_hinh, rung trong nhan-vat.json)
      const Cd = clipNV(pl.pound ? 'dapdat' : pl.atk).def || {};
      S.hitstop = Math.max(S.hitstop, Cd.dung_hinh ?? (pl.atk === 'don3' || pl.pound ? 4 : 2));
      shake(pl.face, 0.3, Cd.rung ?? (pl.atk === 'don3' ? 2 : 1));
    }
  }

  /* ---------- MỘT BƯỚC 60 Hz ---------- */
  function buoc(){
    SUKIEN.length = 0;
    if (IN.bamJ) pl.jumpBuf = P.jumpBuffer;
    if (IN.bamA && !pl.dead && pl.hurtT <= 8){ CHO.co = true; CHO.han = S.frame + P.choThem + (pl.atk ? Math.ceil(clipNV(pl.atk).tong - pl.atkT) : 0); }
    if (IN.bamS) pl.dashBuf = 4;
    if (S.sht > 0) S.sht--;
    if (S.hitstop > 0){ S.hitstop--; return false; }
    S.frame++;
    capNhatNV();
    trungQuai();
    capNhatQuai();
    if (pl.jumpBuf > 0) pl.jumpBuf--;
    if (pl.dashBuf > 0) pl.dashBuf--;
    return true;
  }

  /* ---------- TRẠNG THÁI CHO HOẠT ẢNH (ưu tiên: chết > trúng đòn > lướt > đập đất > đòn > hồi máu > bám vách > trên không > tiếp đất > trôi > đứng) ---------- */
  function trangThai(){
    if (pl.dead) return {ten:'chet', t:pl.deadT};
    if (pl.hurtT > 0) return {ten:'trungdon', tiLe:1 - pl.hurtT / P.hurtT};
    if (pl.dash > 0) return {ten:'luot', tiLe:(P.dashFrames - pl.dash) / P.dashFrames};
    if (pl.pound){ const C = clipNV('dapdat'); return pl.pound.pha === 'lao' ? {ten:'dapdat', k:C.def.khung_lao ?? 3} : {ten:'dapdat', t:pl.pound.t}; }
    if (pl.atk) return {ten:pl.atk, t:pl.atkT};
    if (pl.hoi >= 0) return {ten:'hoimau', t:pl.hoi};
    if (pl.sliding) return {ten:'bamtuong'};
    if (!pl.onGround){
      if (pl.djT >= 0) return {ten:'nhaydoi', t:pl.djT};
      if (pl.luon) return {ten:'luon'};
      return pl.vy < 0 ? {ten:'nhay', tiLe:clamp(1 + pl.vy / jumpVel, 0, 1)} : {ten:'roi'};
    }
    if (pl.landT > 0) return {ten:'tiepdat', tiLe:(10 - pl.landT) / 10};
    if (Math.abs(pl.dxT) > 0.001 && Math.abs(pl.vx) > 0.6) return {ten:'troi'};
    return {ten:'dung'};
  }

  return {P, BD, S, pl, IN, NV, QUAI, SUKIEN, CHO, napBanDo, datNV, taoQuai, buoc, hopNV, hopQuai, hurtBox, trangThai, collide, tile,
    datTL(v){ TL = v; }, get TL(){ return TL; }, datCo(v){ CO = v || 1; }, get CO(){ return CO; }};
})();
