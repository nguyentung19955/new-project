// BƯỚC 2 — PHIÊN B: VIỆC HÔM NAY (việc làng hằng ngày, Anh Mõ) — docs/ke-hoach/buoc-2/KE-HOACH.md mục 1.2, mục 2 (nv), mục 4 "Phiên B"
//   - Mỗi ngày 3 việc (1 Dễ, 1 Vừa, 1 Khó, khác nhóm) chọn từ 22 mẫu G.VIEC_NGAY.mau (js/data.js, khối cuối tệp) hợp với tiến độ của bé,
//     theo hạt giống ngày + nv.hat (tải lại trang / đổi máy qua lưu mây vẫn ra đúng 3 việc đó). Mẫu thiếu ở một mức thì lấy mẫu mức thấp hơn,
//     thưởng vẫn theo ô. Không ra lại đúng mẫu hôm qua nếu còn mẫu khác.
//   - Đổi việc: 1 lần mỗi ngày (miễn phí) cho một việc chưa xong. Mọi thưởng phải bấm "Nhận". Rương ngày khi xong 3/3; dải tuần T2 → CN:
//     ngày xong 3/3 thì đóng dấu trống đồng, đủ G.VIEC_NGAY.tuanCan ngày → rương tuần.
//   - Hết ngày mà quên nhận (việc xong, rương ngày, rương tuần khi sang tuần mới) thì TỰ CỘNG vào hôm sau, báo "Hôm qua bé quên nhận: +…".
//   - Ngày theo giờ máy (G.ngay của js/su_kien.js, trùng ải ngày, đổi lúc 0 giờ). Ngày lùi giờ máy: giữ nguyên việc cũ, không ra việc mới.
//   - Tiến độ nghe sự kiện của js/su_kien.js (không sửa combat.js); bỏ ải hướng dẫn. Thua ải vẫn giữ số đã làm.
//   - Giao diện: thẻ "Việc hôm nay" ở Anh Mõ (G.villageApi.PANELS.viecNgay), chấm đỏ khi có thưởng chờ nhận; dòng báo trong ải khi xong việc;
//     1 dòng "Việc hôm nay: 2/3" ở bảng kết quả; nút "Việc hôm nay" ở bảng Tạm dừng (chỉ xem, js/stage.js gọi G.viecNgay.coNut / xemTrongAi).
//   - Mở sau khi qua ải Rừng già 2 (G.VIEC_NGAY.moSau). Cờ quay lui ?viecngay=0 (G.VIEC_NGAY_BAT = false): ẩn hết, không đếm, không thưởng;
//     dữ liệu nv trong bản lưu giữ nguyên. ?sukien=0 cũng tắt (không có sự kiện).
//   - Ảnh (Phiên D cắt từ docs/anh-goc/buoc-2/B7..B10): gd-the-viec / gd-the-viec-xong, gd-icon-viec-0..11 (thứ tự tấm B8), gd-ruong-ngay /
//     gd-ruong-ngay-mo, gd-o-tuan / gd-o-tuan-dau. Chưa có tệp thì vẽ code tạm (dưới đây).
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.VIEC_NGAY) return;
  const CF = G.VIEC_NGAY, ui = G.ui;
  const VN = (G.viecNgay = {});
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';
  const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'], THU_TUAN = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const MUC = ['Dễ', 'Vừa', 'Khó'];
  const MAU = {};
  for (const t of CF.mau) MAU[t.m] = t;
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Cổng làng: việc hôm nay': "Village Gate: today's jobs", 'Việc hôm nay': "Today's jobs",
    'Dễ': 'Easy', 'Vừa': 'Normal', 'Khó': 'Hard', 'CN': 'Sun', 'T2': 'Mon', 'T3': 'Tue', 'T4': 'Wed', 'T5': 'Thu', 'T6': 'Fri', 'T7': 'Sat',
    'Hạ {0} quái': 'Defeat {0} monsters', 'Hạ {0} tinh anh': 'Defeat {0} elites', 'Hạ {0} con {1}': 'Defeat {0} {1}',
    'Tìm ra điểm yếu của {0} quái mới trong sổ': 'Find the weakness of {0} new monster in the book',
    'Qua {0} ải bất kỳ': 'Clear {0} stages', 'Qua {0} ải không dùng bình máu': 'Clear {0} stage without potions', 'Qua {0} ải đạt 3 sao': 'Clear {0} stage with 3 stars',
    'Hạ {0} trùm bằng hệ khắc chế (sao thứ ba)': 'Beat {0} boss with its weakness (third star)', 'Về thăm {1}: qua {0} ải ở đó': 'Visit {1}: clear {0} stage there',
    'Qua {0} ải độ khó 2': 'Clear {0} stage on difficulty 2', 'Thắng {0} lượt Ải ngày': 'Win {0} daily trial',
    'Kết liễu {0} quái bằng đòn {1}': 'Finish {0} monsters with {1} hits', 'Hạ {0} quái đang dính cháy, độc hoặc chậm': 'Defeat {0} burning, poisoned or chilled monsters',
    'Gây {0} lần phản ứng hệ (Nổ lan, Lây độc, Băng vỡ)': 'Cause {0} element reactions (Spread, Contagion, Shatter)', 'Hạ {0} quái bằng {1}': 'Defeat {0} monsters with the {1}',
    'Đổi vũ khí giữa trận {0} lần': 'Swap weapons in battle {0} times', 'Dùng đòn Đặc biệt {0} lần': 'Use Special {0} times', 'Bắn Chưởng {0} lần': 'Fire Palm blasts {0} times',
    'Lộn né {0} lần': 'Dodge roll {0} times', 'Mở {0} rương báu': 'Open {0} treasure chests', 'Thắng {0} phòng thử thách': 'Win {0} challenge room',
    'Nâng cấp {0} lần ở làng (mài, ép đồ, học điểm…)': 'Upgrade {0} time in the village (sharpen, tier, skills…)',
    '{0} · {1}': '{0} · {1}', '{0}/{1}': '{0}/{1}', '{0} vàng': '{0} gold', '{0} quặng': '{0} ore', '{0} đá': '{0} stones', '{0} linh khí': '{0} spirit', '{0} bùa': '{0} ward',
    'Ngày mới sau {0}': 'New day in {0}', 'Đổi việc: còn {0} lần': 'Swaps left: {0}', 'Đổi việc: hết lượt': 'No swaps left',
    'Nhận': 'Claim', 'Đã nhận': 'Claimed', 'Đổi': 'Swap', 'Chắc chưa?': 'Sure?', 'Xong!': 'Done!',
    'Rương ngày': 'Daily chest', 'Xong 3 việc: {0}': 'All 3 jobs: {0}', 'Mở rương': 'Open chest', 'Đã mở hôm nay': 'Opened today', 'Còn {0} việc': '{0} jobs left',
    'Tuần này: {0}/{1} ngày': 'This week: {0}/{1} days', 'Mở rương tuần': 'Open weekly chest', 'Đã mở rương tuần': 'Weekly chest opened', 'Rương tuần: {0}': 'Weekly: {0}',
    'Việc hôm nay: {0}/{1}': "Today's jobs: {0}/{1}", 'Xong việc: {0}!': 'Job done: {0}!', 'Hôm qua bé quên nhận: +{0}': 'You forgot to claim yesterday: +{0}',
    'Về làng gặp Anh Mõ để nhận thưởng.': 'Back in the village, see the Town Crier to claim.', '‹ Trở lại': '‹ Back',
    'Rương ngày: {0}': 'Daily chest: {0}', 'Rương ngày: đã mở': 'Daily chest: opened', 'Thưởng: {0}': 'Reward: {0}',
    'Bấm "Đổi" lần nữa là đổi việc này (mất phần đã làm).': 'Tap "Swap" again to swap this job (progress is lost).',
    'Cốc cốc! Việc làng hôm nay đây. Xong việc nào thì bấm Nhận nhé.': "Knock knock! Here are today's village jobs. Finish one, then tap Claim.",
    'Xong việc rồi! Bấm Nhận đi cháu.': 'Job done! Tap Claim, kiddo.', 'Đủ 3 việc rồi, mở rương ngày đi!': 'All 3 jobs done, open the daily chest!',
    'Hôm nay xong hết việc rồi, giỏi quá! Mai lại có việc mới.': "All of today's jobs are done, great! New jobs tomorrow.",
    'Đủ ngày rồi, mở rương tuần đi!': 'Enough days, open the weekly chest!', 'Đã đổi việc.': 'Job swapped.', 'Không còn việc nào khác để đổi.': 'No other job to swap to.',
  });
  VN.bat = () => G.VIEC_NGAY_BAT !== false && !!(G.suKien && G.suKien.bat && G.suKien.bat() && G.ngay);
  VN.mo = (sv) => { sv = sv || G.save; return VN.bat() && !!(sv && obj(sv.stars) && sv.stars[CF.moSau]); };
  // Mức thưởng theo trùm vùng cao nhất đã hạ (mọi độ khó): 0 chưa hạ Mộc Tinh, 1 đã hạ Mộc Tinh, 2 đã hạ Ngư Tinh
  const daHa = (sv, r) => !!((sv.stars && sv.stars[r + '-4']) || (sv.stars2 && sv.stars2[r + '-4']));
  VN.mucThuong = (sv) => { sv = sv || G.save; return daHa(sv, 1) ? 2 : daHa(sv, 0) ? 1 : 0; };
  // phần nv của bản lưu (js/su_kien.js đã dựng khung qua G.fixSave). Bản game mới hơn (v > 1): không đụng.
  function nvCua(sv) {
    if (!obj(sv)) return null;
    if (!obj(sv.nv) && G.suKien && G.suKien.suaBanLuu) G.suKien.suaBanLuu(sv);
    const o = sv.nv;
    if (!obj(o) || (typeof o.v === 'number' && o.v > 1) || !Array.isArray(o.ds) || !obj(o.tuan)) return null;
    if (!Array.isArray(o.tuan.ngay)) o.tuan.ngay = [];
    return o;
  }

  // ---------- điều kiện mở từng mẫu (trả về null = chưa mở; còn lại là tham số x của việc, true = không cần tham số) ----------
  const VUNG_MA = { rung: 0, bien: 1, laudai: 2 };
  const vungMo = (sv, r) => r === 0 || daHa(sv, r - 1);
  const dsQuai = () => (G.monsterArt && G.monsterArt.list) || [];
  const soCo = () => !!(G.SO_YQ || G.soYeuQuai); // Sổ yêu quái (Phiên A) có trong bản này: trang sổ được ghi
  const soQ = (sv) => (obj(sv.so) && obj(sv.so.q) ? sv.so.q : {});
  const vks = (sv) => (Array.isArray(sv.weapons) ? sv.weapons.filter((w) => w && G.WTYPES && G.WTYPES[w.type]) : []);
  const capVk = (w) => { try { return G.wStage ? G.wStage(w) : 0; } catch (e) { return 0; } };
  const ngaySo = (k) => { const a = String(k).split('-').map(Number); return Math.floor(Date.UTC(a[0], a[1] - 1, a[2]) / 864e5); };
  const chon = (ds, rng) => ds[Math.min(ds.length - 1, Math.floor(rng() * ds.length))];
  function demK(sv) { const q = soQ(sv); let n = 0; for (const m in q) if (q[m] && q[m].k) n++; return n; }
  const DK = {
    haLoai(sv, rng) {
      const q = soQ(sv), da = Object.keys(q).filter((m) => q[m] && q[m].h > 0);
      if (da.length < 3) return null;
      const thuong = dsQuai().filter((it) => it.loai === 'thuong' && q[it.id] && q[it.id].h > 0).map((it) => it.id);
      return thuong.length ? chon(thuong, rng) : null;
    },
    timDiemYeu(sv) {
      if (!soCo()) return null;
      const q = soQ(sv);
      return dsQuai().some((it) => VUNG_MA[it.vung] != null && vungMo(sv, VUNG_MA[it.vung]) && !(q[it.id] && q[it.id].k)) ? true : null;
    },
    veVung(sv) {
      const mo = [0, 1, 2].filter((r) => G.REGIONS && G.REGIONS[r] && vungMo(sv, r));
      if (mo.length < 2) return null;
      const cu = mo.slice(0, -1); // vùng cũ (bỏ vùng mới nhất đang đánh)
      const sao = (r) => { let n = 0; for (let i = 0; i < 5; i++) n += num(sv.stars[r + '-' + i], 0); return n; };
      return cu.reduce((a, r) => (sao(r) < sao(a) ? r : a), cu[0]);
    },
    kho2: (sv) => (Object.keys(sv.stars || {}).length >= 15 ? true : null),
    aiNgay(sv) { const A = G.aiNgay; try { return A && A.bat() && A.mo(sv) && A.coLuot(sv) ? true : null; } catch (e) { return null; } },
    heKet(sv, rng, key) {
      const ds = (G.ELS || []).filter((el) => vks(sv).some((w) => w.branch === el && capVk(w) >= 1));
      return ds.length ? ds[ngaySo(key) % ds.length] : null; // xoay theo ngày
    },
    dinhHe: (sv) => (vks(sv).some((w) => capVk(w) >= 1) ? true : null),
    phanUng: (sv) => (vks(sv).some((w) => capVk(w) >= 3) ? true : null),
    vuKhi(sv, rng) {
      const mang = Array.isArray(sv.carry) ? sv.carry.map((id) => (G.weaponById ? G.weaponById(id) : null)).filter((w) => w && G.WTYPES[w.type]) : [];
      const loai = [...new Set((mang.length ? mang : vks(sv)).map((w) => w.type))];
      if (!loai.length) return null;
      const dung = obj(sv.nv && sv.nv.vk) ? sv.nv.vk : {}, it = Math.min(...loai.map((k) => num(dung[k], 0)));
      return chon(loai.filter((k) => num(dung[k], 0) === it), rng); // vũ khí bé ít dùng nhất (số quái đã hạ bằng nó, đếm từ bản này)
    },
    chuong: (sv) => (G.chuong && Object.keys(sv.stars || {}).length >= 1 ? true : null),
    thuThach: (sv) => (sv.nv && sv.nv.gapTT ? true : null),
  };
  const dieuKien = (t, sv, key) => {
    const f = DK[t.m];
    if (!f) return true;
    try { const x = f(sv, G.ngay.ngauNhien(G.ngay.bam(key + ':' + sv.nv.hat + ':' + t.m)), key); return x == null ? null : x; } catch (e) { return null; }
  };

  // ---------- chọn 3 việc ----------
  // bo: mã mẫu không được chọn; nhomBo: nhóm đã có; tranh: mã hôm qua (tránh nếu còn mẫu khác)
  function chonMau(mo, rng, o, bo, nhomBo, tranh) {
    for (const boNhom of [true, false]) {
      for (let L = o; L >= 0; L--) {
        let ds = mo.filter((q) => q.t.muc === L && !bo.has(q.t.m) && (!boNhom || !nhomBo.has(q.t.nhom)));
        const moi = ds.filter((q) => !tranh.has(q.t.m));
        if (moi.length) ds = moi;
        if (ds.length) return chon(ds, rng);
      }
    }
    return null;
  }
  function viecMoi(q, o, sv) {
    const v = { m: q.t.m, x: q.x === true ? null : q.x, can: Math.max(1, q.t.can | 0), d: 0, nhan: 0, o };
    if (q.t.m === 'timDiemYeu') v.b = demK(sv); // đếm trang "tìm ra điểm yếu" mới từ lúc nhận việc
    return v;
  }
  VN.taoViec = function (sv, key) {
    const o = sv.nv, mo = [];
    for (const t of CF.mau) { const x = dieuKien(t, sv, key); if (x != null) mo.push({ t, x }); }
    const tranh = new Set(String(o.hom || '').split(',').filter(Boolean));
    // chọn ô Khó trước (ít mẫu nhất), rồi Vừa, rồi Dễ; xếp lại Dễ → Khó. Chọn tham lam có thể kẹt (Khó lấy mất nhóm mà Vừa cần để tránh
    // việc hôm qua) → thử thêm vài lần với hạt giống phụ, lấy bộ đầu tiên ít trùng hôm qua nhất (vẫn có định: cùng ngày + cùng hạt ra cùng bộ).
    let tot = null, it = 1e9;
    for (let lan = 0; lan < 8 && it > 0; lan++) {
      const rng = G.ngay.ngauNhien(G.ngay.bam(key + ':' + o.hat + (lan ? ':' + lan : '')));
      const bo = new Set(), nhomBo = new Set(), ds = [];
      for (let i = Math.min(CF.soViec, 3) - 1; i >= 0; i--) {
        const q = chonMau(mo, rng, i, bo, nhomBo, tranh);
        if (!q) continue;
        bo.add(q.t.m); nhomBo.add(q.t.nhom);
        ds.unshift({ q, i });
      }
      const trung = ds.filter((v) => tranh.has(v.q.t.m)).length;
      if (trung < it || (trung === it && ds.length > tot.length)) { tot = ds; it = trung; }
    }
    return (tot || []).map((v) => viecMoi(v.q, v.i, sv));
  };

  // ---------- thưởng ----------
  const themDa = (sv, n) => { if (!(n > 0)) return; if (G.epDo && G.epDo.themDa) G.epDo.themDa(sv, n); else sv.daBac = Math.max(0, num(sv.daBac, 0)) + n; };
  const themBua = (sv, n) => { if (!(n > 0)) return; if (G.epDo && G.epDo.themBua) G.epDo.themBua(sv, n); else sv.buaBac = Math.max(0, num(sv.buaBac, 0)) + n; };
  const themLk = (sv, n) => { if (!(n > 0)) return; if (G.vkMoi && G.vkMoi.themLk) G.vkMoi.themLk(sv, n); else sv.linhKhi = Math.max(0, num(sv.linhKhi, 0)) + n; };
  function phat(sv, t) { // t: { v vàng, q quặng, da, lk, bua }
    if (t.v) sv.gold = num(sv.gold, 0) + t.v;
    if (t.q) sv.ore = num(sv.ore, 0) + t.q;
    themDa(sv, t.da | 0); themLk(sv, t.lk | 0); themBua(sv, t.bua | 0);
  }
  const cong = (a, t) => { for (const k of ['v', 'q', 'da', 'lk', 'bua']) if (t[k]) a[k] = (a[k] | 0) + t[k]; return a; };
  VN.chuThuong = function (t) {
    const a = [];
    if (t.v) a.push(G.t('{0} vàng', t.v));
    if (t.q) a.push(G.t('{0} quặng', t.q));
    if (t.bua) a.push(G.t('{0} bùa', t.bua));
    if (t.da) a.push(G.t('{0} đá', t.da));
    if (t.lk) a.push(G.t('{0} linh khí', t.lk));
    return a.join(', ');
  };
  const thuongViec = (v, sv) => CF.thuong[G.clamp(v.o | 0, 0, 2)][VN.mucThuong(sv)];
  const xongViec = (v) => v.d >= v.can;
  const soXong = (o) => o.ds.filter(xongViec).length;
  const xongHet = (o) => o.ds.length > 0 && o.ds.every(xongViec);

  // ---------- sang ngày ----------
  // Gọi trước mọi lần đọc / đếm. Chỉ tiến khi ngày máy > ngày lớn nhất đã thấy (nv.cuoi); ngày lùi thì giữ nguyên.
  VN.capNhat = function (sv) {
    sv = sv || G.save;
    const o = nvCua(sv);
    if (!o || !VN.mo(sv)) return o;
    const h = G.ngay.homNay().key;
    if (!G.ngay.sau(h, o.cuoi)) { if (!o.tuan.ma) o.tuan.ma = G.ngay.dauTuan(o.cuoi); danhDau(o); return o; }
    const quen = {}, muc = VN.mucThuong(sv);
    if (o.cuoi) { // hôm trước (hoặc lần chơi trước) quên nhận: tự cộng
      for (const v of o.ds) if (xongViec(v) && !v.nhan) { cong(quen, thuongViec(v, sv)); v.nhan = 1; }
      if (xongHet(o) && !o.ruong) { cong(quen, CF.ruongNgay[muc]); o.ruong = 1; o.demRuong = (o.demRuong | 0) + 1; }
    }
    const tu = G.ngay.dauTuan(h);
    if (o.tuan.ma !== tu) {
      if (o.tuan.ma && o.tuan.ngay.length >= CF.tuanCan && !o.tuanNhan) cong(quen, CF.ruongTuan[muc]);
      o.tuan = { ma: tu, ngay: [] }; o.tuanNhan = 0;
    }
    if (Object.keys(quen).length) { phat(sv, quen); o.quen = quen; } else delete o.quen;
    o.hom = o.ds.map((v) => v.m).join(',');
    o.cuoi = h; o.doi = 0; o.ruong = 0;
    o.ds = VN.taoViec(sv, h);
    return o;
  };
  // ngày xong 3/3: đóng dấu ô của ngày đó trong dải tuần (ngày của bộ việc = nv.cuoi)
  function danhDau(o) {
    if (!xongHet(o) || !o.cuoi) return;
    if (o.tuan.ma !== G.ngay.dauTuan(o.cuoi)) return;
    const t = G.ngay.thuTuan(o.cuoi);
    if (o.tuan.ngay.indexOf(t) < 0) { o.tuan.ngay.push(t); o.tuan.ngay.sort((a, b) => a - b); }
  }

  // ---------- tên việc ----------
  function tenX(v) {
    if (v.x == null) return '';
    if (v.m === 'haLoai') { const so = G.SO_YQ && (Array.isArray(G.SO_YQ) ? G.SO_YQ.find((q) => q && (q.ma === v.x || q.id === v.x)) : G.SO_YQ[v.x]); const it = dsQuai().find((q) => q.id === v.x); return (so && (so.ten || so.name)) || (it && it.ten) || String(v.x); }
    if (v.m === 'veVung') return (G.REGIONS[v.x] || {}).name || '';
    if (v.m === 'heKet') return (G.EL[v.x] || {}).name || '';
    if (v.m === 'vuKhi') return (G.WTYPES[v.x] || {}).name || '';
    return String(v.x);
  }
  VN.chu = (v) => { const t = MAU[v.m]; return t ? G.t(t.chu, v.can, tenX(v)) : String(v.m); };

  // ---------- đếm tiến độ ----------
  const tutCua = (d) => !!(d && (d.tut || (d.S && d.S.tut)));
  function tien(f, S) {
    const sv = G.save;
    if (!VN.mo(sv)) return;
    const o = VN.capNhat(sv);
    if (!o || !o.ds.length) return;
    const moi = [];
    for (const v of o.ds) {
      if (v.nhan || xongViec(v)) continue;
      let n = 0;
      try { n = f(v, sv) | 0; } catch (e) { n = 0; }
      if (n > 0) { v.d = Math.min(v.can, v.d + n); if (xongViec(v)) moi.push(v); }
    }
    danhDau(o);
    if (moi.length) baoXong(moi, S);
  }
  const poll = (v, sv) => (v.m === 'timDiemYeu' ? demK(sv) - num(v.b, 0) - v.d : 0);
  function baoXong(ds, S) {
    const s = G.t('Xong việc: {0}!', VN.chu(ds[ds.length - 1]));
    try {
      if (S && S.W && G.scene === G.StageScene) { if (!(S.W.banner && S.W.banner.urgent)) S.W.banner = { s, col: '#ffd23f', t: 3 }; }
      else if (G.scene === G.Village) { const VA = G.villageApi; if (VA && VA.V && VA.V.tab !== 'hub' && VA.say) VA.say(s); else if (G.villageScene && G.villageScene.say) G.villageScene.say(s); }
    } catch (e) { /* chỉ là dòng báo */ }
  }
  VN.nghe = []; // hàm gỡ (cho kiểm thử)
  const on = (ten, fn) => { if (G.suKien && G.suKien.on) VN.nghe.push(G.suKien.on(ten, (d) => { if (!VN.bat() || tutCua(d)) return; fn(d); })); };
  on('haQuai', (d) => {
    const sv = G.save;
    if (VN.mo(sv) && d.wType && !d.ch) { const o = nvCua(sv); if (o) { if (!obj(o.vk)) o.vk = {}; o.vk[d.wType] = num(o.vk[d.wType], 0) + 1; } }
    const he = d.he || {}, dinh = !!(he.fire || he.poison || he.ice);
    tien((v, s) => {
      switch (v.m) {
        case 'haQuai': return 1;
        case 'haTinhAnh': return d.tinhAnh ? 1 : 0;
        case 'haLoai': return d.ma === v.x ? 1 : 0;
        case 'heKet': return !d.ch && d.el === v.x ? 1 : 0;
        case 'dinhHe': return dinh ? 1 : 0;
        case 'vuKhi': return !d.ch && d.wType === v.x ? 1 : 0;
        default: return poll(v, s);
      }
    }, d.S);
  });
  on('hetAi', (d) => {
    const w = !!d.win, an = !!d.aiNgay;
    tien((v, s) => {
      if (!w) return poll(v, s);
      switch (v.m) {
        case 'quaAi': return 1;
        case 'khongBinh': return d.khongBinh ? 1 : 0;
        case 'baSao': return !an && d.stars >= 3 ? 1 : 0;
        case 'trumKhac': return !an && d.khacChe ? 1 : 0;
        case 'veVung': return !an && d.r === v.x ? 1 : 0;
        case 'kho2': return !an && d.diff >= 1 ? 1 : 0;
        case 'aiNgay': return an && d.tinhLuot ? 1 : 0;
        default: return poll(v, s);
      }
    }, d.S);
    // 1 dòng ở bảng kết quả
    const sv = G.save, o = VN.mo(sv) ? nvCua(sv) : null;
    if (o && o.ds.length && d.R && Array.isArray(d.R.lines)) d.R.lines.push(G.t('Việc hôm nay: {0}/{1}', soXong(o), o.ds.length));
  });
  const dem1 = (ma) => (d) => tien((v) => (v.m === ma ? 1 : 0), d.S);
  on('phanUng', dem1('phanUng'));
  on('doiVk', dem1('doiVk'));
  on('dacBiet', dem1('dacBiet'));
  on('chuong', dem1('chuong'));
  on('lonNe', dem1('ne'));
  on('moRuong', dem1('ruong'));
  on('thuThach', dem1('thuThach'));
  on('nangCap', dem1('nangCap'));
  on('vaoPhong', (d) => { if (d.loai !== 'challenge') return; const o = nvCua(G.save); if (o && !o.gapTT) o.gapTT = 1; }); // "đã gặp phòng thử thách"

  // ---------- bấm nhận / đổi ----------
  VN.nhan = function (i, sv) {
    sv = sv || G.save;
    const o = VN.capNhat(sv), v = o && o.ds[i];
    if (!v || v.nhan || !xongViec(v)) return null;
    const t = thuongViec(v, sv);
    phat(sv, t); v.nhan = 1;
    return t;
  };
  VN.coRuong = (o) => !!(o && xongHet(o) && !o.ruong);
  VN.moRuong = function (sv) {
    sv = sv || G.save;
    const o = VN.capNhat(sv);
    if (!VN.coRuong(o)) return null;
    const t = CF.ruongNgay[VN.mucThuong(sv)];
    phat(sv, t); o.ruong = 1; o.demRuong = (o.demRuong | 0) + 1;
    return t;
  };
  VN.coTuan = (o) => !!(o && o.tuan.ngay.length >= CF.tuanCan && !o.tuanNhan);
  VN.moTuan = function (sv) {
    sv = sv || G.save;
    const o = VN.capNhat(sv);
    if (!VN.coTuan(o)) return null;
    const t = CF.ruongTuan[VN.mucThuong(sv)];
    phat(sv, t); o.tuanNhan = 1;
    return t;
  };
  VN.duocDoi = (o, i) => !!(o && (o.doi | 0) < CF.doiMoiNgay && o.ds[i] && !xongViec(o.ds[i]) && !o.ds[i].nhan);
  VN.doi = function (i, sv) {
    sv = sv || G.save;
    const o = VN.capNhat(sv);
    if (!VN.duocDoi(o, i)) return false;
    const key = o.cuoi, mo = [];
    for (const t of CF.mau) { const x = dieuKien(t, sv, key); if (x != null) mo.push({ t, x }); }
    const bo = new Set(o.ds.map((v) => v.m)), nhomBo = new Set(o.ds.filter((v, j) => j !== i).map((v) => (MAU[v.m] || {}).nhom));
    const rng = G.ngay.ngauNhien(G.ngay.bam(key + ':' + o.hat + ':doi:' + i));
    const q = chonMau(mo, rng, G.clamp(o.ds[i].o | 0, 0, 2), bo, nhomBo, new Set());
    if (!q) return false;
    o.ds[i] = viecMoi(q, o.ds[i].o | 0, sv);
    o.doi = (o.doi | 0) + 1;
    return true;
  };
  // trạng thái gọn (kiểm thử, Phiên C đọc demRuong thẳng từ sv.nv)
  VN.choNhan = function (sv) {
    sv = sv || G.save;
    if (!VN.mo(sv)) return false;
    const o = VN.capNhat(sv);
    return !!(o && (o.ds.some((v) => xongViec(v) && !v.nhan) || VN.coRuong(o) || VN.coTuan(o) || obj(o.quen)));
  };

  // ---------- vẽ code tạm (chưa có ảnh B7..B10) ----------
  // Phiên D: ảnh docs/anh-goc/buoc-2 (cat_buoc_2.py) — gd-the-viec(-xong), gd-icon-viec-*, gd-ruong-ngay(-mo), gd-o-tuan(-dau), hu-nhan-thuong.
  // ?khunganh=0 (G.KHUNG_ANH = false): bỏ ảnh, vẽ code như trước Phiên D.
  const gd = (ma) => { const s = G.spriteCustom; return G.KHUNG_ANH !== false && s && s.gdSan ? s.gdSan(ma) : null; };
  const veGd = (ma, x, y, w, h) => { const g = gd(ma); return !!(g && G.spriteCustom.veGd(G.ux, g, x, y, w, h)); };
  const FXB = { ds: [] }; // hiệu ứng ảnh hu-nhan-thuong khi bấm Nhận / mở rương (không có ảnh thì thôi, như trước)
  function phatHu(x, y, co) { const FA = G.fxAnh; if (G.KHUNG_ANH !== false && G.HU_MO !== false && FA && FA.co && FA.co('hu-nhan-thuong')) FXB.ds.push({ x, y, co: co || 0.7, t0: G.time || 0 }); }
  function veHu() {
    const FA = G.fxAnh;
    FXB.ds = FXB.ds.filter((f) => {
      const gy = FA && FA.giay ? FA.giay('hu-nhan-thuong') || 0.8 : 0, t = (G.time || 0) - f.t0;
      if (!FA || t < 0 || t >= gy) return false;
      FA.ve(G.ux, 'hu-nhan-thuong', f.x, f.y, t, 0, f.co, false, t > gy * 0.75 ? Math.max(0, 1 - (t - gy * 0.75) / (gy * 0.25)) : 1);
      return true;
    });
  }
  // chữ trên thẻ ảnh (giấy sáng): mực tối thay cho chữ sáng của ô vẽ code
  const MUC_THE = { TXT: '#3a2414', SOFT: '#6a4a2a', GOOD: '#2f6b1a' };
  const MAU_ICON = ['#c8463a', '#9a48d4', '#3a9a6a', '#e0b04a', '#c86a6a', '#5ab0d0', '#ff8a3a', '#7ad0c0', '#6a8ae0', '#d0902a', '#8a9aa8', '#50c8e8'];
  function veIcon(i, x, y, s) {
    if (veGd('gd-icon-viec-' + i, x, y, s, s)) return;
    const c = G.ux, cx = x + s / 2, cy = y + s / 2;
    c.fillStyle = '#14182e'; c.beginPath(); c.arc(cx, cy, s / 2, 0, 7); c.fill();
    c.fillStyle = '#b07a32'; c.beginPath(); c.arc(cx, cy, s / 2 - 1, 0, 7); c.fill();
    c.fillStyle = MAU_ICON[i] || '#888'; c.beginPath(); c.arc(cx, cy, s / 2 - 3, 0, 7); c.fill();
    c.fillStyle = '#fff3da'; // dấu nhỏ theo loại: chấm / vạch, chỉ để phân biệt khi chưa có ảnh
    if (i === 0 || i === 1) { c.fillRect(cx - 4, cy - 1, 8, 2); c.fillRect(cx - 1, cy - 4, 2, 8); }
    else if (i === 2 || i === 11) { c.fillRect(cx - 4, cy + 2, 8, 2); c.fillRect(cx - 4, cy - 4, 2, 6); c.fillRect(cx + 2, cy - 4, 2, 6); }
    else if (i === 3) { c.beginPath(); c.arc(cx, cy, 2.5, 0, 7); c.fill(); }
    else if (i === 9) { c.fillRect(cx - 4, cy - 2, 8, 5); c.fillStyle = '#6a3a1a'; c.fillRect(cx - 4, cy, 8, 1); }
    else { c.beginPath(); c.arc(cx, cy, 1.6, 0, 7); c.fill(); c.fillRect(cx - 4, cy - 0.5, 8, 1); }
  }
  function veRuong(x, y, w, h, mo) {
    if (veGd(mo ? 'gd-ruong-ngay-mo' : 'gd-ruong-ngay', x, y, w, h)) return;
    const c = G.ux, t = G.time || 0;
    if (mo) { c.fillStyle = 'rgba(255,220,120,' + (0.25 + 0.1 * Math.sin(t * 4)) + ')'; c.beginPath(); c.arc(x + w / 2, y + h / 2, w / 2 + 2, 0, 7); c.fill(); }
    ui.rect(x + 2, y + h * 0.42, w - 4, h * 0.58 - 1, '#8a2a1a', '#14182e');
    if (mo) { ui.rect(x + 2, y + 1, w - 4, h * 0.3, '#a8341f', '#14182e'); c.fillStyle = '#ffd24a'; c.fillRect(x + 6, y + h * 0.42 - 2, w - 12, 3); }
    else ui.rect(x + 2, y + h * 0.18, w - 4, h * 0.3, '#a8341f', '#14182e');
    c.fillStyle = '#d8a040'; c.fillRect(x + w / 2 - 2, y + h * 0.18, 4, h * 0.82 - 1); c.fillRect(x + 2, y + h * 0.62, w - 4, 2);
  }
  function veOTuan(x, y, s, dau, homNay) {
    if (!veGd(dau ? 'gd-o-tuan-dau' : 'gd-o-tuan', x, y, s, s)) {
      ui.rect(x, y, s, s, '#2a1c14', '#8a6a3a');
      if (dau) {
        const c = G.ux, cx = x + s / 2, cy = y + s / 2;
        c.fillStyle = '#b8321e'; c.beginPath(); c.arc(cx, cy, s / 2 - 2.5, 0, 7); c.fill();
        c.fillStyle = '#ffd23f';
        for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; c.fillRect(Math.round(cx + Math.cos(a) * 4) - 0.5, Math.round(cy + Math.sin(a) * 4) - 0.5, 1.5, 1.5); }
        c.beginPath(); c.arc(cx, cy, 1.8, 0, 7); c.fill();
      }
    }
    if (homNay) { const c = G.ux; c.strokeStyle = GOLD; c.lineWidth = 1; c.strokeRect(x - 0.5, y - 0.5, s + 1, s + 1); }
  }
  const dongHo = (s) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((v) => String(v).padStart(2, '0')).join(':');
  // chữ trong một vùng của khung (x, y, w, h): T.chuTrongKhung, vùng chỉ định bằng vung
  const chu = (s, x, y, w, h, o) => G.theme.chuTrongKhung(s, x, y, w, h, Object.assign({ vien: [1, 1, 1, 1], dem: 1, align: 'left', size: 8, min: 6.5, bold: true, color: TXT }, o || {}));

  // ---------- thẻ "Việc hôm nay" ở Anh Mõ ----------
  let hoiDoi = -1, hoiDoiT = 0;
  const CX = 160, CW = 304;
  function veThe(v, i, x, y, w, h, o) {
    const T = G.theme, xong = xongViec(v), sv = G.save, t = MAU[v.m] || { icon: 0 };
    const ma = xong ? 'gd-the-viec-xong' : 'gd-the-viec', g = gd(ma), anh = !!(g && G.spriteCustom.veGd(G.ux, g, x, y, w, h));
    if (!anh) T.inset(x, y, w, h, xong && !v.nhan);
    // Ảnh thẻ: nắp đồng hai đầu (vien trái / phải của ảnh). Thẻ "xong" có dấu đỏ ✓ ở đầu phải: nút Nhận che dấu, nhận xong thì dấu hiện ra
    // (thay cho chữ "Đã nhận" ở cột nút) → chữ, thanh, nút đặt trong lòng giấy, không đè nắp / dấu. Chữ mực tối trên giấy sáng.
    const M = anh ? MUC_THE : { TXT, SOFT, GOOD };
    let ix, lx, bx, tw, barW = 104, nhanO = null;
    if (!anh) { ix = x + 5; lx = x + 31; bx = x + w - 62; tw = w - 31 - 66; }
    else {
      const vl = g.vien ? g.vien[3] : 18, vr = g.vien ? g.vien[1] : 18, g0 = gd('gd-the-viec'), vr0 = g0 && g0.vien ? g0.vien[1] : 20;
      ix = x + vl - 3; lx = ix + 24; bx = x + w - vr0 - 56; barW = 84;
      tw = (v.nhan ? x + w - vr - 2 : bx - 2) - lx;
      if (v.nhan) nhanO = [lx + barW + 4, y + 18, x + w - vr - 2 - (lx + barW + 4), 13];
    }
    veIcon(t.icon | 0, ix, y + 6, 22);
    chu(VN.chu(v), x, y, w, h, { vung: [lx, y + (anh ? 4 : 2), tw, anh ? 14 : 15], size: 8, color: v.nhan ? M.SOFT : M.TXT });
    T.bar(lx, y + 19, barW, 'xp', v.can ? v.d / v.can : 0, G.t('{0}/{1}', v.d, v.can), { h: 10, col: xong ? '#5ab04a' : '#c89a3a', marks: 4 });
    if (nhanO) chu('Đã nhận', x, y, w, h, { vung: nhanO, size: 7.5, color: M.GOOD });
    else chu(G.t('{0} · {1}', G.tv(MUC[G.clamp(v.o | 0, 0, 2)]), VN.chuThuong(thuongViec(v, sv))), x, y, w, h, { vung: [lx + barW + 4, y + 18, (anh ? bx - 2 : lx + tw) - (lx + barW + 4), 13], size: 6.5, bold: false, color: M.SOFT });
    if (v.nhan) { if (!anh) chu('Đã nhận', x, y, w, h, { vung: [bx, y + 8, 56, 18], align: 'center', size: 7.5, color: M.GOOD }); }
    else if (xong) {
      if (T.btn(bx, y + 6, 56, 22, 'Nhận', { primary: true, size: 8.5 })) {
        const q = VN.nhan(i, sv);
        if (q) { G.persist(); G.sfx('pick'); G.villageApi.say('+' + VN.chuThuong(q)); phatHu(bx + 28, y + 30, 0.6); }
      }
    } else if (VN.duocDoi(o, i)) {
      const hoi = hoiDoi === i && G.time - hoiDoiT < 4;
      if (T.sbtn(bx + 4, y + 8, 48, 18, hoi ? 'Chắc chưa?' : 'Đổi', { size: 7, pad: 2, danger: hoi })) {
        if (!hoi) { hoiDoi = i; hoiDoiT = G.time; G.villageApi.say('Bấm "Đổi" lần nữa là đổi việc này (mất phần đã làm).'); G.sfx('ui'); }
        else { hoiDoi = -1; if (VN.doi(i, sv)) { G.persist(); G.sfx('ui'); G.villageApi.say('Đã đổi việc.'); } else G.villageApi.say('Không còn việc nào khác để đổi.'); }
      }
    }
  }
  function panel() {
    const VA = G.villageApi, T = G.theme, sv = G.save;
    VA.khungThe('mo', 'Cổng làng: việc hôm nay');
    const o = VN.capNhat(sv);
    if (!o || !o.ds.length) return 'Cốc cốc! Việc làng hôm nay đây. Xong việc nào thì bấm Nhận nhé.';
    if (obj(o.quen)) { // tự cộng thưởng hôm qua quên nhận: báo một lần (Anh Mõ nói), rồi xoá
      VA.V.msg = G.t('Hôm qua bé quên nhận: +{0}', VN.chuThuong(o.quen)); VA.V.msgT = 7;
      delete o.quen; G.persist();
    }
    // dòng đầu: thứ · ngày | đổi việc | ngày mới sau
    const h = G.ngay.homNay();
    chu(G.t('{0} · {1}', G.tv(THU[h.thu]), h.d.getDate() + '/' + (h.d.getMonth() + 1)), CX, 66, 96, 14, { size: 8, color: GOLD });
    chu((o.doi | 0) < CF.doiMoiNgay ? G.t('Đổi việc: còn {0} lần', CF.doiMoiNgay - (o.doi | 0)) : 'Đổi việc: hết lượt', CX + 96, 66, 104, 14, { size: 6.5, bold: false, align: 'center', color: SOFT });
    chu(G.t('Ngày mới sau {0}', dongHo(G.ngay.conLaiGiay())), CX + 200, 66, CW - 200, 14, { size: 7, bold: false, align: 'right', color: SOFT });
    o.ds.forEach((v, i) => veThe(v, i, CX, 82 + i * 36, CW, 34, o));
    // rương ngày
    const muc = VN.mucThuong(sv), rx = CX, ry = 192;
    T.inset(rx, ry, 148, 68, VN.coRuong(o));
    veRuong(rx + 6, ry + 5, 32, 28, !!o.ruong);
    chu('Rương ngày', rx, ry, 148, 68, { vung: [rx + 42, ry + 2, 102, 13], size: 8, color: GOLD });
    chu(G.t('Xong 3 việc: {0}', VN.chuThuong(CF.ruongNgay[muc])), rx, ry, 148, 68, { vung: [rx + 42, ry + 15, 102, 22], dong: 2, size: 6.5, bold: false, color: SOFT });
    const nx = soXong(o);
    if (T.btn(rx + 6, ry + 40, 136, 24, o.ruong ? 'Đã mở hôm nay' : VN.coRuong(o) ? 'Mở rương' : G.t('Còn {0} việc', o.ds.length - nx), { size: 8, primary: VN.coRuong(o), disabled: !VN.coRuong(o) })) {
      const q = VN.moRuong(sv);
      if (q) { G.persist(); G.sfx('evolve'); VA.say('+' + VN.chuThuong(q)); phatHu(rx + 22, ry + 34, 0.8); }
    }
    // dải tuần
    const tx = CX + 152, tw = CW - 152;
    T.inset(tx, ry, tw, 68, VN.coTuan(o));
    chu(G.t('Tuần này: {0}/{1} ngày', Math.min(o.tuan.ngay.length, 7), CF.tuanCan), tx, ry, tw, 68, { vung: [tx + 4, ry + 2, tw - 8, 13], size: 7.5, color: GOLD, align: 'center' });
    const hn = G.ngay.thuTuan(h.key), x0 = tx + Math.round((tw - 138) / 2);
    for (let k = 0; k < 7; k++) {
      const ox = x0 + k * 20;
      veOTuan(ox, ry + 16, 18, o.tuan.ngay.indexOf(k) >= 0, k === hn);
      chu(THU_TUAN[k], ox - 1, ry + 34, 20, 9, { align: 'center', size: 6.5, bold: k === hn, color: k === hn ? GOLD : SOFT, vien: [0, 0, 0, 0], dem: 0 });
    }
    const rt = CF.ruongTuan[muc];
    if (T.btn(tx + 4, ry + 44, tw - 8, 20, o.tuanNhan ? 'Đã mở rương tuần' : VN.coTuan(o) ? 'Mở rương tuần' : G.t('Rương tuần: {0}', VN.chuThuong(rt)), { size: 7, primary: VN.coTuan(o), disabled: !VN.coTuan(o) })) {
      const q = VN.moTuan(sv);
      if (q) { G.persist(); G.sfx('evolve'); VA.say('+' + VN.chuThuong(q)); phatHu(tx + tw / 2, ry + 62, 0.8); }
    }
    veHu();
    if (o.ds.some((v) => xongViec(v) && !v.nhan)) return 'Xong việc rồi! Bấm Nhận đi cháu.';
    if (VN.coRuong(o)) return 'Đủ 3 việc rồi, mở rương ngày đi!';
    if (VN.coTuan(o)) return 'Đủ ngày rồi, mở rương tuần đi!';
    if (o.ruong) return 'Hôm nay xong hết việc rồi, giỏi quá! Mai lại có việc mới.';
    return 'Cốc cốc! Việc làng hôm nay đây. Xong việc nào thì bấm Nhận nhé.';
  }
  panel.mo = (sv) => VN.mo(sv);
  panel.cham = (sv) => VN.choNhan(sv);
  if (G.villageApi && G.villageApi.PANELS && VN.bat()) G.villageApi.PANELS.viecNgay = panel; // ?viecngay=0: giữ hàm rỗng của Phiên 0 → thẻ ẩn

  // ---------- trong ải: nút "Việc hôm nay" ở bảng Tạm dừng (chỉ xem) ----------
  let xemS = null;
  const run = () => (G.getRun ? G.getRun() : null);
  VN.coNut = () => { const sv = G.save; if (!VN.mo(sv)) return false; const o = VN.capNhat(sv); return !!(o && o.ds.length); };
  VN.xemTrongAi = () => { xemS = run(); };
  VN.dangXem = () => !!xemS && xemS === run();
  function veXem() {
    const sv = G.save, o = VN.capNhat(sv), T = G.theme;
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.45)');
    ui.panel(96, 30, 288, 232, 'Việc hôm nay'); // che hết bảng Tạm dừng (48..258)
    if (o) o.ds.forEach((v, i) => {
      const y = 54 + i * 42, xong = xongViec(v), t = MAU[v.m] || { icon: 0 };
      veIcon(t.icon | 0, 106, y + 4, 20);
      chu(VN.chu(v), 96, 30, 288, 232, { vung: [130, y, 244, 14], size: 8, color: v.nhan ? SOFT : TXT });
      T.bar(130, y + 17, 150, 'xp', v.can ? v.d / v.can : 0, G.t('{0}/{1}', v.d, v.can), { h: 10, col: xong ? '#5ab04a' : '#c89a3a', marks: 4 });
      chu(v.nhan ? 'Đã nhận' : xong ? 'Xong!' : MUC[G.clamp(v.o | 0, 0, 2)], 96, 30, 288, 232, { vung: [286, y + 15, 88, 14], size: 7.5, color: xong ? GOOD : SOFT });
    });
    if (o) chu(o.ruong ? 'Rương ngày: đã mở' : G.t('Rương ngày: {0}', G.t('{0}/{1}', soXong(o), o.ds.length)), 96, 30, 288, 232, { vung: [106, 182, 268, 13], size: 7.5, color: GOLD });
    chu('Về làng gặp Anh Mõ để nhận thưởng.', 96, 30, 288, 232, { vung: [106, 198, 268, 13], size: 7, bold: false, color: SOFT });
    if (ui.btn(170, 226, 140, 26, '‹ Trở lại')) xemS = null;
  }
  const SS = G.StageScene;
  if (SS && SS.draw && !SS.draw.viecNgayBoc) {
    const gD = SS.draw;
    SS.draw = function () {
      const S = run();
      if (!xemS || xemS !== S || !S || S.mode !== 'paused') { xemS = null; return gD.apply(this, arguments); }
      const c = G.click; G.click = null; // bảng Tạm dừng phía dưới không nhận chạm
      let r;
      try { r = gD.apply(this, arguments); } finally { G.click = c; }
      veXem();
      return r;
    };
    SS.draw.viecNgayBoc = true;
  }
  if (SS && SS.update && !SS.update.viecNgayBoc) {
    const gU = SS.update;
    SS.update = function () {
      if (xemS && xemS === run() && G.keyP && (G.keyP.Escape || G.keyP.KeyP)) { G.keyP.Escape = false; G.keyP.KeyP = false; xemS = null; } // Esc: đóng bảng xem, về Tạm dừng
      return gU.apply(this, arguments);
    };
    SS.update.viecNgayBoc = true;
  }
})();
