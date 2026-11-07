// TURRET MERGE — CHỈ HUY (Ma vương): máy trạng thái thuần luật (P0-09). Không vẽ gì; game.js/dungMV gọi CH.dung, UI đọc CH.trangThai.
// Chạy được trong node (tools/test-chihuy.js) bằng cách truyền env giả; trên trình duyệt env lấy từ biến toàn cục.
// LUẬT:
//  · Điều kiện dùng: trận chưa kết thúc · không tạm dừng · hết hồi chiêu · đủ mana · (REINFORCE) còn ô trống HOẶC còn ụ chưa 7★.
//    Không đạt → KHÔNG trừ mana, KHÔNG bắt đầu hồi chiêu, trả lý do ('ketthuc'|'dung'|'hoi'|'thieu'|'day').
//  · Dùng được → trừ mana, giá ×LUAT_MV.heSoGia (40 → 80 → 160), hồi chiêu = d.cd. Chạm liên tục: lần 2 bị 'hoi' (không trừ 2 lần).
//  · REINFORCE: sinh min(2, ô trống) ụ 1★ miễn phí (giá Triệu hồi KHÔNG tăng); mỗi ụ không có chỗ → +1★ cho ụ yếu nhất (sao thấp nhất,
//    bậc thấp nhất; bỏ ụ hoá đá / 7★), mỗi ụ chỉ nhận 1 lần.
//  · RAGE / HOLY SHIELD: đặt đồng hồ tác dụng = max(còn lại, hieuLuc) — dùng lại khi còn hiệu lực không cộng dồn, chỉ làm mới.
//  · Chuyển wave: dùng được; đồng hồ tác dụng DỪNG khi đang nghỉ giữa wave (G.cho > 0) và bàn không còn quái sống. Hồi chiêu vẫn chạy.
//  · Phạm vi CO-OP/PVP: chỉ bàn của người dùng (B). Khiên chặn chiêu trùm + phá của đối thủ trên bàn đó; tẩy băng/đá/lửa/ngắm khi dùng.
'use strict';
const CH = {
  env() {
    return { G, MAVUONG, LUAT, LUAT_MV, TIERS, oTrong, trieu: (B) => trieu(B, true), nangSao: (B, T) => nangSao(B, T, 1, 'REINFORCE'),
      donSach: (B, T) => { if (typeof VX !== 'undefined' && VX.donSach) VX.donSach(B, T); } };
  },
  // ụ yếu nhất để nâng khi bàn đầy
  yeuNhat(B, n, e) {
    const ds = B.t.filter(T => T && T.sao < e.LUAT.saoMax && !(T.st && (T.st.da || T.st.bang > 0))); // bỏ ụ đá + ụ BĂNG (rà cộng hưởng 07/11, người dùng chốt)
    ds.sort((a, b) => a.sao - b.sao || ((e.TIERS[a.bac] || {}).thuTu || 0) - ((e.TIERS[b.bac] || {}).thuTu || 0) || a.o - b.o);
    return ds.slice(0, n);
  },
  // kế hoạch REINFORCE: bao nhiêu ụ sinh mới, ụ nào được +1★
  keHoach(B, e) {
    const d = e.MAVUONG[B.mv.id];
    if (!d || !d.so) return null;
    const trong = e.oTrong(B).length, sinh = Math.min(d.so, trong);
    return { sinh, nang: this.yeuNhat(B, d.so - sinh, e) };
  },
  // trạng thái hiện tại của nút chỉ huy (UI + test)
  trangThai(B, e) {
    e = e || this.env();
    if (e.G.ketThuc) return 'ketthuc';
    if (e.G.dung) return 'dung';
    if (B.mv.cd > 0) return 'hoi';
    if (B.mana < B.mv.gia) return 'thieu';
    const k = this.keHoach(B, e);
    if (k && k.sinh === 0 && !k.nang.length) return 'day';
    return 'san';
  },
  giaSau(B, n, e) { e = e || this.env(); let g = B.mv.gia; for (let i = 0; i < n; i++) g *= e.LUAT_MV.heSoGia; return g; },
  dung(B, e) {
    e = e || this.env();
    const tt = this.trangThai(B, e);
    if (tt !== 'san') return { ok: false, ly: tt };
    const mv = B.mv, d = e.MAVUONG[mv.id];
    const k = this.keHoach(B, e);
    B.mana -= mv.gia; mv.gia *= e.LUAT_MV.heSoGia; mv.cd = d.cd;
    const r = { ok: true, id: mv.id, sinh: [], nang: [] };
    if (k) {
      for (let i = 0; i < k.sinh; i++) { const T = e.trieu(B); if (T) r.sinh.push(T); }
      for (const T of k.nang) if (e.nangSao(B, T)) r.nang.push(T);
    }
    if (d.khoa === 'cuong') B.cuong = Math.max(B.cuong || 0, d.hieuLuc);
    if (d.khoa === 'khien') {
      B.khien = Math.max(B.khien || 0, d.hieuLuc);
      for (const T of B.t) if (T) {
        if (T.st.bang > 0 || T.st.da || T.st.lua > 0) e.donSach(B, T);
        T.st.bang = 0; T.st.da = false; T.st.lua = 0; T.st.ngam = 0;
      }
    }
    return r;
  },
  // đồng hồ tác dụng + hồi chiêu, gọi mỗi bước logic (capNhatBan)
  dungDongHo(B, e) {
    if (!e.LUAT_MV.hetCho || !(e.G.cho > 0)) return false;
    return !e.G.quai.some(E => !E.chet && e.G.duong[E.p] && e.G.duong[E.p].ban === B.i);
  },
  tick(B, dt, e) {
    e = e || this.env();
    B.mv.cd = Math.max(0, B.mv.cd - dt);
    if (this.dungDongHo(B, e)) return;
    B.cuong = Math.max(0, (B.cuong || 0) - dt); B.khien = Math.max(0, (B.khien || 0) - dt);
  },
};
if (typeof module !== 'undefined') module.exports = CH;
