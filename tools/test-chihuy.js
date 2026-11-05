// Kiểm thử máy trạng thái CHỈ HUY (thap/js/chihuy.js) — chạy: node tools/test-chihuy.js
'use strict';
const assert = require('assert');
const CH = require('../thap/js/chihuy.js');
const MAVUONG = {
  hero:   { gia: 30, cd: 15, so: 2, duPhong: 'nangYeu', pham: 'ban' },
  dahlia: { gia: 40, cd: 25, hieuLuc: 10, khoa: 'cuong', pham: 'ban' },
  eve:    { gia: 40, cd: 25, hieuLuc: 8, khoa: 'khien', pham: 'ban' },
};
const TIERS = { trang: { thuTu: 0 }, xanh: { thuTu: 1 }, tim: { thuTu: 2 } };
function moi(id, opt = {}) {
  const G = { ketThuc: null, dung: false, cho: 0, quai: [], duong: [{ ban: 0 }, { ban: 1 }] };
  const ban = (i) => ({ i, mana: 100, gia: 10, t: Array(15).fill(null), cuong: 0, khien: 0, mv: { id, gia: MAVUONG[id].gia, cd: 0 } });
  const B = ban(0), B2 = ban(1);
  const U = (o, sao, bac = 'trang', st = {}) => ({ o, sao, bac, st: Object.assign({ bang: 0, da: false, lua: 0, ngam: 0 }, st) });
  const e = { G, MAVUONG, TIERS, LUAT: { saoMax: 7 }, LUAT_MV: { heSoGia: 2, hetCho: true },
    oTrong: (X) => X.t.map((T, i) => T ? -1 : i).filter(i => i >= 0),
    trieu: (X) => { const o = X.t.findIndex(T => !T); if (o < 0) return null; return (X.t[o] = U(o, 1)); },
    nangSao: (X, T) => { if (T.sao >= 7) return false; T.sao++; return true; },
    donSach: () => { e.sach = (e.sach || 0) + 1; } };
  G.ban = [B, B2];
  return { G, B, B2, e, U };
}
let n = 0; const t = (ten, f) => { f(); n++; console.log('ok  ' + ten); };

t('RAGE: giá 40 → 80 → 160, hồi chiêu chặn lần 2', () => {
  const { B, e } = moi('dahlia'); B.mana = 1000;
  assert.equal(CH.trangThai(B, e), 'san');
  assert.ok(CH.dung(B, e).ok); assert.equal(B.mv.gia, 80); assert.equal(B.mana, 960); assert.equal(B.cuong, 10);
  assert.deepEqual(CH.dung(B, e), { ok: false, ly: 'hoi' }); assert.equal(B.mana, 960);
  CH.tick(B, 25, e); assert.ok(CH.dung(B, e).ok); assert.equal(B.mv.gia, 160); assert.equal(B.mana, 880);
  CH.tick(B, 25, e); assert.ok(CH.dung(B, e).ok); assert.equal(B.mv.gia, 320); assert.equal(B.mana, 720);
  assert.equal(CH.giaSau(B, 1, e), 640);
});
t('thiếu mana: không trừ, không hồi chiêu, giá giữ nguyên', () => {
  const { B, e } = moi('dahlia'); B.mana = 39;
  assert.equal(CH.trangThai(B, e), 'thieu');
  assert.deepEqual(CH.dung(B, e), { ok: false, ly: 'thieu' });
  assert.equal(B.mana, 39); assert.equal(B.mv.cd, 0); assert.equal(B.mv.gia, 40); assert.equal(B.cuong, 0);
});
t('chạm liên tục 10 lần: chỉ 1 lần trừ mana', () => {
  const { B, e } = moi('eve'); B.mana = 500;
  let ok = 0; for (let i = 0; i < 10; i++) if (CH.dung(B, e).ok) ok++;
  assert.equal(ok, 1); assert.equal(B.mana, 460); assert.equal(B.mv.gia, 80);
});
t('REINFORCE bàn trống: 2 ụ 1★, giá Triệu hồi không đổi', () => {
  const { B, e } = moi('hero');
  const r = CH.dung(B, e); assert.ok(r.ok); assert.equal(r.sinh.length, 2); assert.equal(r.nang.length, 0);
  assert.equal(B.gia, 10); assert.equal(B.mana, 70);
});
t('REINFORCE còn 1 ô: 1 ụ mới + 1 ụ yếu nhất +1★', () => {
  const { B, e, U } = moi('hero');
  for (let i = 0; i < 14; i++) B.t[i] = U(i, 3, 'tim'); B.t[5] = U(5, 2, 'xanh'); B.t[9] = U(9, 2, 'trang');
  const r = CH.dung(B, e); assert.equal(r.sinh.length, 1); assert.equal(r.nang.length, 1);
  assert.equal(r.nang[0].o, 9); assert.equal(B.t[9].sao, 3);
});
t('REINFORCE bàn đầy: nâng 2 ụ yếu nhất (bỏ ụ hoá đá, 7★)', () => {
  const { B, e, U } = moi('hero');
  for (let i = 0; i < 15; i++) B.t[i] = U(i, 7);
  B.t[2] = U(2, 1, 'trang', { da: true }); B.t[3] = U(3, 4); B.t[4] = U(4, 2);
  const r = CH.dung(B, e); assert.ok(r.ok); assert.equal(r.sinh.length, 0);
  assert.deepEqual(r.nang.map(T => T.o), [4, 3]); assert.equal(B.t[2].sao, 1);
});
t('REINFORCE bàn đầy toàn 7★: không dùng được, không trừ mana', () => {
  const { B, e, U } = moi('hero');
  for (let i = 0; i < 15; i++) B.t[i] = U(i, 7);
  assert.equal(CH.trangThai(B, e), 'day'); assert.deepEqual(CH.dung(B, e), { ok: false, ly: 'day' }); assert.equal(B.mana, 100); assert.equal(B.mv.cd, 0);
});
t('HOLY SHIELD: 8 s + tẩy băng/đá/lửa/ngắm', () => {
  const { B, e, U } = moi('eve'); B.t[0] = U(0, 1, 'trang', { bang: 3 }); B.t[1] = U(1, 1, 'trang', { da: true, ngam: 1 });
  assert.ok(CH.dung(B, e).ok); assert.equal(B.khien, 8);
  assert.equal(B.t[0].st.bang, 0); assert.equal(B.t[1].st.da, false); assert.equal(B.t[1].st.ngam, 0); assert.equal(e.sach, 2);
  CH.tick(B, 3, e); assert.equal(B.khien, 5);
});
t('chuyển wave: dùng được; đồng hồ dừng khi bàn hết quái, chạy khi còn quái; hồi chiêu vẫn chạy', () => {
  const { G, B, e } = moi('dahlia'); G.cho = 1.2;
  assert.ok(CH.dung(B, e).ok);
  CH.tick(B, 1, e); assert.equal(B.cuong, 10); assert.equal(B.mv.cd, 24);
  G.quai.push({ p: 0, chet: false }); CH.tick(B, 1, e); assert.equal(B.cuong, 9);
  G.quai[0].p = 1; CH.tick(B, 1, e); assert.equal(B.cuong, 9); // quái ở bàn khác không tính
  G.cho = 0; CH.tick(B, 1, e); assert.equal(B.cuong, 8);
});
t('tạm dừng / kết thúc: không dùng được', () => {
  const { G, B, e } = moi('dahlia');
  G.dung = true; assert.deepEqual(CH.dung(B, e), { ok: false, ly: 'dung' }); G.dung = false;
  G.ketThuc = { thang: false }; assert.deepEqual(CH.dung(B, e), { ok: false, ly: 'ketthuc' }); assert.equal(B.mana, 100);
});
t('CO-OP: RAGE/khiên chỉ bàn người dùng, đồng đội không đổi', () => {
  const { B, B2, e } = moi('dahlia'); assert.ok(CH.dung(B, e).ok);
  assert.equal(B.cuong, 10); assert.equal(B2.cuong, 0); assert.equal(B2.mana, 100); assert.equal(B2.mv.gia, 40);
});
t('dùng lại khi còn hiệu lực: làm mới, không cộng dồn', () => {
  const { B, e } = moi('dahlia'); B.mana = 1000; CH.dung(B, e); CH.tick(B, 25, e); B.cuong = 4; CH.dung(B, e); assert.equal(B.cuong, 10);
});
console.log(n + ' kiểm thử chỉ huy: ĐẠT');
