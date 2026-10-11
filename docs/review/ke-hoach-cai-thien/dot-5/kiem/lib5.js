// Thêm cho Đợt 5 (chỉ chạy trong trang thử): dựng bản lưu thử cho một em bé + một loại vũ khí, vẽ một ô theo hàng / khung / kiểu chém.
(() => {
  const SC = G.spriteCustom, O = G.outfit, TL = G.tinhLinh;
  K.dung = function (key, vk, mac) {
    G.testSave({ hero: key, lvl: 12, tier: 2, melee: vk === 'bow' ? 'sword' : vk });
    const mu = mac && !Array.isArray(mac) ? mac.hat : null; // { hat: 'trum_sung' }: đội thẳng một mũ theo tên hình (mũ khởi đầu không phải món đồ)
    if (mac && mac.length) K.wear(mac);
    const sv = G.save, look = mu ? Object.assign({}, O.look(sv), { hat: mu }) : O.look(sv), w0 = sv.weapons.find((w) => w.id === sv.carry[vk === 'bow' ? 1 : 0]);
    const weapon = vk ? Object.assign({}, w0, { coat: null }) : null;
    const sp = SC.cuaEmBe(key, { key, outfit: look });
    return { key, look, weapon, sp };
  };
  K.TRAN = { rar: {}, fx: { glow: null, els: [], aura: null }, hat: null, robe: null, back: null, hand: null, wing: null };
  // tuy: { combo, charge, u (0..1 trong khung), tran (bỏ đồ), aim }
  K.o5 = function (D, ten, i, tuy) {
    tuy = tuy || {};
    const sp = D.sp, n = sp.dt[ten].so, o = K.args(ten, i, n, sp, tuy.tran ? K.TRAN : D.look, tuy.khongVk ? null : D.weapon, D.key);
    const uu = (i + (tuy.u == null ? 0.5 : tuy.u)) / n;
    if (ten === 'atk') { o.atk = uu; o.p.comboI = tuy.combo | 0; }
    if (ten === 'tele') o.p.mv = { holding: true, charge: tuy.charge == null ? 1 : tuy.charge };
    if (tuy.aim != null) o.p.aimRel = tuy.aim;
    o.__khung = { ten, i, u: uu };
    return o;
  };
  K.ve5 = function (D, ten, i, tuy, cfg) { return K.png(K.cell(K.o5(D, ten, i, tuy), cfg.W, cfg.H, cfg.FX, cfg.FY, cfg.Z, null)); };
  // Ghi lại lần vẽ vũ khí gần nhất (chỗ đặt điểm cầm, góc, độ căng dây) để đo vũ khí có nằm trong tay hay không.
  const WA = G.weaponArt, ve0 = WA.draw;
  K.vk = null;
  WA.draw = function (c, wo, x, y, ang, pull) { K.vk = { x, y, ang, pull: pull || 0 }; return ve0.apply(this, arguments); };
  const HOLD = { sword: -5, spear: -10, hammer: -5 };
  // Độ lệch (điểm ảnh game) giữa chỗ tay nắm của vũ khí đang vẽ và điểm tay_truoc của thân AI ở khung đó. kieu: 'nam' | 'cam' | 'day'
  K.lechTay = function (D, vk, ten, i, tuy) {
    const o = K.o5(D, ten, i, Object.assign({ tran: 1 }, tuy));
    K.vk = null; K.cell(o, 64, 56, 28, 48, 1, null);
    const w = K.vk; if (!w) return null;
    const kh = SC.khopEmBe(D.sp, ten, i), da = SC.diemAI(D.key, ten, i, kh), ng = K.diemNgoai && K.diemNgoai[D.key] && K.diemNgoai[D.key][ten + ':' + i];
    const P = (da && da.diem.tay_truoc) || (ng && ng.tay_truoc); // bản cũ chưa có tệp ghép: lấy điểm tay đã đo (tệp diem-soi.json)
    if (!P) return null;
    const kieu = vk === 'bow' ? (ten === 'tele' ? 'day' : 'cam') : 'nam', L = kieu === 'cam' ? 0 : vk === 'bow' ? -9 - 8 * w.pull : HOLD[vk], r = w.ang * Math.PI / 180;
    return Math.hypot(w.x + L * Math.cos(r) - P[0], w.y + L * Math.sin(r) - P[1]);
  };
  return true;
})()
