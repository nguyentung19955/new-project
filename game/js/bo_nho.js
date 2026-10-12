// BỘ NHỚ ĐỆM HÌNH DÙNG CHUNG (Phiên hiệu năng, V2): mọi bộ nhớ đệm canvas lớn của game (khung quái, khung em bé, tấm nhuộm màu,
// hình xoay của đồ, nút, đạn...) cùng chia MỘT ngân sách điểm ảnh, bỏ hình lâu không dùng nhất trước (LRU), thay cho các trần
// đếm số tấm riêng lẻ trước đây (đếm số tấm thì không biết tấm to hay nhỏ, nên bộ nhớ canvas tăng mãi: 72 Mpx sau 10 phút).
// - Ngân sách mặc định 24 Mpx (≈ 96 MB điểm ảnh). Hình bị bỏ sẽ tự dựng lại khi cần (cùng hàm vẽ, cùng kết quả), nên không đổi hình.
// - Nhóm 'quai': khung / tấm nhuộm của quái và trùm, xoá khi về làng (G.setScene) vì ải sau gặp quái khác.
// - Tắt: G.BO_NHO = false trước khi nạp game, hoặc mở với ?bonho=0 → mỗi bộ nhớ đệm quay về trần đếm số tấm như cũ (xoá sạch khi đầy).
// - Trang công cụ không nạp tệp này: các tệp vẽ tự dùng bản đơn giản (trần đếm như cũ), xem hàm taoNho ở đầu mỗi tệp.
// Nạp NGAY SAU js/engine.js, trước mọi tệp vẽ.
(function () {
  'use strict';
  const G = (typeof window !== 'undefined') ? (window.G = window.G || {}) : (globalThis.G = globalThis.G || {});
  if (G.BO_NHO === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]bonho=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.BO_NHO = !tat;
  }
  const BN = (G.boNho = { tran: 24e6, tong: 0, bo: 0, kho: [] });
  const MIN = 256; // mỗi mục tính tối thiểu chừng này điểm ảnh (mục không phải canvas vẫn tốn chỗ, và để trần đếm có tác dụng)
  const thuTu = new Map(); // mục → true, mục dùng lâu nhất ở đầu
  // Số điểm ảnh của một giá trị: canvas / ảnh, hoặc đối tượng có .cv (khung quái, khung em bé), hoặc mảng các thứ đó.
  function demPx(v, sau) {
    if (!v || typeof v !== 'object') return 0;
    if (typeof v.width === 'number' && typeof v.height === 'number' && (v.getContext || v.close)) return v.width * v.height;
    if (sau) return 0;
    let n = 0;
    if (v.cv) n += demPx(v.cv, true);
    if (v.c && v.c !== v.cv) n += demPx(v.c, true);
    if (Array.isArray(v)) for (const x of v) n += demPx(x, true);
    return n;
  }
  BN.demPx = demPx;
  function bo(e) { // bỏ một mục khỏi bộ nhớ
    thuTu.delete(e);
    if (e.k.m.get(e.key) === e) e.k.m.delete(e.key);
    BN.tong -= e.px; e.k.px -= e.px; BN.bo++;
  }
  function donDep(giu) {
    if (BN.tong <= BN.tran) return;
    for (const e of thuTu.keys()) {
      if (BN.tong <= BN.tran * 0.9) break; // bỏ tới 90% để không phải dọn ở mỗi lần thêm
      if (e === giu || e.t === G.time) continue; // không bỏ hình vừa dùng trong khung này
      bo(e);
    }
  }
  // ten: tên để đo (BN.kho); o.max: trần số tấm của cách cũ (dùng khi tắt); o.nhom: 'quai' để xoá khi về làng.
  BN.tao = function (ten, o) {
    o = o || {};
    const max = o.max || 2000, m = new Map();
    const k = { ten, m, px: 0, nhom: o.nhom || null, max };
    const C = {
      get(key) {
        const e = m.get(key);
        if (!e) return undefined;
        if (G.BO_NHO && e.t !== G.time) { e.t = G.time; thuTu.delete(e); thuTu.set(e, true); }
        return e.v;
      },
      has: (key) => m.has(key),
      // px: số điểm ảnh (bỏ trống thì tự đếm từ giá trị). Trả về v.
      set(key, v, px) {
        const cu = m.get(key);
        if (cu) bo(cu);
        if (!G.BO_NHO && m.size >= max) C.clear(); // cách cũ: đầy thì xoá sạch
        const n = Math.max(MIN, px == null ? demPx(v) : px), e = { key, v, px: n, k, t: G.time };
        m.set(key, e); BN.tong += n; k.px += n;
        if (G.BO_NHO) { thuTu.set(e, true); donDep(e); }
        return v;
      },
      // Mục đã có lớn thêm (ví dụ thêm bóng một màu vào khung quái): cộng thêm điểm ảnh.
      cong(key, px) { const e = m.get(key); if (!e || !(px > 0)) return; e.px += px; BN.tong += px; k.px += px; if (G.BO_NHO) donDep(e); },
      del(key) { const e = m.get(key); if (e) bo(e); },
      clear() { for (const e of Array.from(m.values())) bo(e); m.clear(); },
      get size() { return m.size; },
      keys: () => m.keys(),
    };
    k.C = C;
    BN.kho.push(k);
    return C;
  };
  // Xoá mọi bộ nhớ thuộc một nhóm (ví dụ 'quai' khi rời ải).
  BN.xoaNhom = function (nhom) { for (const k of BN.kho) if (k.nhom === nhom) k.C.clear(); };
  // Số đo (cho kiểm thử): tổng điểm ảnh, từng bộ nhớ.
  BN.do = () => ({ tong: BN.tong, tran: BN.tran, bo: BN.bo, kho: BN.kho.filter((k) => k.m.size).map((k) => [k.ten, k.m.size, k.px]).sort((a, b) => b[2] - a[2]) });
})();
