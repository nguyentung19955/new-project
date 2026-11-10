// ASTRAL ARSENAL — QUYỀN ADMIN (người dùng chốt 10/11). Ghi chú + giới hạn: docs/demo-hop-tuong/tuvan/admin/ADMIN.md · kiểm tools/thap-kt-admin.js
//  · ADMIN.la(): true khi tài khoản Google đang đăng nhập có email đã xác minh (emailVerified) = EMAIL (so chữ thường).
//  · Admin: BỎ MỌI KHOÁ (chế độ, màn, cửa hàng, vòng quay, lò rèn, Ấn Vàng/Ấn Đỏ, Leo Tháp, Săn Trùm, Thử thách, Vô tận, thử thách tuần,
//    online, chỉ huy) + SỞ HỮU ẢO đủ 97 ụ: các chỗ kiểm khoá chỉ thêm `|| ADMIN.la()` — KHÔNG ghi đè dữ liệu thật (đăng xuất → như cũ),
//    cấp thẻ / bản sao / vàng / ngọc / vé giữ theo dữ liệu thật, không cộng tài nguyên.
//  · Cache khoá turret_admin = { uid } để mở ngoại tuyến vẫn nhận; xoá khi đăng xuất / đổi sang tài khoản khác / khách.
//  · ĐÂY LÀ KIỂM PHÍA MÁY KHÁCH (ai sửa JS cũng bật được) — quyền thật kiểm ở server: giai đoạn F.
//  Nạp sớm (trước data.js) để mọi file sau gọi ADMIN.la() được; nghe tài khoản qua NET.khiDoiTK khi net.js đã nạp.
'use strict';
const ADMIN = {
  EMAIL: 'ly230595@gmail.com',
  KEY: 'turret_admin',
  _v: null,
  la() {
    if (this._v === null) { try { const o = JSON.parse(localStorage.getItem(this.KEY) || 'null'); this._v = !!(o && o.uid); } catch (e) { this._v = false; } }
    return this._v;
  },
  // u = NET.user ({ uid, anon, email, ev }) — gọi mỗi lần đổi tài khoản
  xet(u) {
    if (!u) return;
    const ok = !!(!u.anon && u.ev === true && String(u.email || '').trim().toLowerCase() === this.EMAIL);
    try { if (ok) localStorage.setItem(this.KEY, JSON.stringify({ uid: u.uid })); else localStorage.removeItem(this.KEY); } catch (e) { }
    if (ok !== this.la()) { this._v = ok; this.apDung(); } else this.nhan();
  },
  // vẽ lại những gì phụ thuộc khoá (lưới bộ bài, nút tính năng, HOME, chấm đỏ)
  apDung() {
    const thu = (f) => { try { f(); } catch (e) { } };
    thu(() => { if (G.roster && G.roster.length) UI.veChon(); });
    thu(() => TTUI.capTn()); thu(() => TTUI.capLuoi()); thu(() => KTUI.capNhat()); thu(() => HM.ve());
    this.nhan();
  },
  // nhãn nhỏ "ADMIN" trên chip phi công (HOME) + bảng hồ sơ phi công
  nhan() {
    const la = this.la();
    for (const s of document.querySelectorAll('#tk-chip small, #tk-bang #tk-loai')) {
      let i = s.parentNode.querySelector(':scope > .adm-nhan');
      if (!la) { if (i) i.remove(); continue; }
      if (!i) { i = document.createElement('em'); i.className = 'adm-nhan'; i.textContent = 'ADMIN'; s.insertAdjacentElement('afterend', i); }
    }
  },
};
document.addEventListener('DOMContentLoaded', () => {
  if (ADMIN._noi || typeof NET === 'undefined') return; ADMIN._noi = 1; // DOMContentLoaded có thể phát 2 lần (thật + bộ nạp phát lại sau script cuối)
  if (typeof NET !== 'undefined' && NET.khiDoiTK) NET.khiDoiTK((u) => ADMIN.xet(u));
  if (typeof TK !== 'undefined') for (const f of ['veChip', 'veBang']) if (TK[f]) { const g = TK[f]; TK[f] = function () { const x = g.apply(this, arguments); ADMIN.nhan(); return x; }; }
  ADMIN.nhan();
});
