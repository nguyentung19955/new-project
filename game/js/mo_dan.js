// MỞ HỆ THỐNG DẦN THEO MỐC (tư vấn 16/10, QUYET-DINH-TU-VAN-16-10.md mục 1). Cờ tắt: ?modan=0 (G.MO_DAN_BAT = false) → y như cũ.
// Người mới chỉ thấy: Kiếm, Đánh, Né, Bình máu (trong ải); ở làng: Chú Lái Đò, Cụ Đồ (thẻ Hướng dẫn), Ông Từ (thẻ Cu Tí), Anh Mõ (Cài đặt).
// Mỗi mốc là một ải (độ khó thường) đã qua lần đầu; mở một mốc thì về làng có MỘT dòng báo ngắn.
//   ai1   qua Rừng già 1  : nút Đặc biệt + Chưởng trong ải, Cụ Đồ thẻ Cây kỹ năng (nội tại) + Cây chưởng, Thợ Rèn thẻ Mài (nâng cấp đơn giản), Bà Hàng Xén
//   ai2   qua Rừng già 2  : đổi vũ khí trong ải (chạm ô vũ khí / giữ mở vòng chọn 4 món: Kiếm, Thương, Búa, Phi tiêu)
//   ai3   qua Rừng già 3  : Thợ Rèn thẻ Linh khí (nâng vũ khí, chọn hệ Lửa / Độc / Băng)
//   trum1 hạ Mộc Tinh     : rèn nâng cao (Ép đồ, Nâng lò), Cô Thợ May (trang phục vùng)
//   vung2 qua Hang biển 1 : Sổ yêu quái, Việc hôm nay, Thành tựu, Ải ngày, Bảng vàng
// Độ khó 2 giữ mốc cũ (đủ 15 sao); các mốc cũ trong code (Cô Thợ May sau Rừng già 2, Việc hôm nay sau Rừng già 2, Cây chưởng sau ải
// đầu, Thành tựu sau Rừng già 1, Ải ngày sau Mộc Tinh) vẫn chạy, mốc mới chỉ đặt thêm điều kiện cho NGƯỜI MỚI.
// Bản lưu: trường save.moDan = { cu: 1 } (bản lưu cũ đã có tiến độ → mọi mốc coi như mở, không báo) hoặc { bao: { ai1: 1, … } }
// (người mới; bao = mốc đã báo ở làng). Chỉ ghi thêm, không xoá gì; tắt cờ thì trường này bị bỏ qua.
(function () {
  const G = window.G;
  if (G.MO_DAN_BAT === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]modan=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.MO_DAN_BAT = !tat;
  }
  const obj = (v) => !!(v && typeof v === 'object' && !Array.isArray(v));
  // Mốc: ai = ải (r-i) phải có sao ở độ khó thường; bao = dòng báo ở làng (ngắn, một dòng)
  const MOC = {
    ai1: { ai: '0-0', ten: 'Qua Rừng già 1', bao: 'Mở mới: nút Đặc biệt và Chưởng, Cụ Đồ dạy kỹ năng, Lò rèn mài vũ khí.' },
    ai2: { ai: '0-1', ten: 'Qua Rừng già 2', bao: 'Mở mới: đổi vũ khí trong ải. Chạm ô vũ khí, giữ để chọn 1 trong 4 món.' },
    ai3: { ai: '0-2', ten: 'Qua Rừng già 3', bao: 'Mở mới: Lò rèn thẻ Linh khí, nâng vũ khí và chọn hệ Lửa, Độc, Băng.' },
    trum1: { ai: '0-4', ten: 'Hạ Mộc Tinh', bao: 'Mở mới: Ép đồ, Nâng lò, và Cô Thợ May về làng may trang phục.' },
    vung2: { ai: '1-0', ten: 'Qua Hang biển 1', bao: 'Mở mới: Sổ yêu quái, Việc hôm nay, Thành tựu, Ải ngày, Bảng vàng.' },
  };
  const THU_TU = ['ai1', 'ai2', 'ai3', 'trum1', 'vung2'];
  // Chức năng → mốc. Chức năng không có trong bảng thì luôn mở.
  const CN = {
    dacBiet: 'ai1', chuong: 'ai1', kyNang: 'ai1', ren: 'ai1', hangXen: 'ai1',
    doiVk: 'ai2',
    linhKhi: 'ai3',
    epDo: 'trum1', nangLo: 'trum1', thoMay: 'trum1',
    so: 'vung2', thanhTuu: 'vung2', viecNgay: 'vung2', aiNgay: 'vung2', bangVang: 'vung2',
  };
  // Câu người làng nói khi chạm mặt người chưa ra mặt (dải lối tắt)
  const CHUA = {
    ren: 'Ông Thợ Rèn đang nhóm lò. Qua ải Rừng già 1 rồi ghé ông mài vũ khí.',
    xen: 'Bà Hàng Xén chưa dọn hàng. Qua ải Rừng già 1 rồi bà ra chợ.',
    may: 'Cô Thợ May đi chợ xa. Hạ Mộc Tinh rồi cô về may đồ cho bé.',
  };
  const NPC_CN = { ren: 'ren', xen: 'hangXen', may: 'thoMay' };
  const MD = (G.moDan = { MOC, THU_TU, CN });
  MD.bat = () => G.MO_DAN_BAT !== false;
  MD.cu = (sv) => { sv = sv || G.save; return !!(sv && obj(sv.moDan) && sv.moDan.cu); };
  MD.dat = (k, sv) => { sv = sv || G.save; const m = MOC[k]; return !m || !!(sv && obj(sv.stars) && sv.stars[m.ai] > 0); };
  // Chức năng f đã mở chưa (cờ tắt / bản lưu cũ / chưa có bản lưu: mở)
  MD.co = function (f, sv) {
    if (!MD.bat()) return true;
    sv = sv || G.save;
    if (!sv || MD.cu(sv)) return true;
    const k = CN[f];
    return !k || MD.dat(k, sv);
  };
  // Người làng k đã ra mặt chưa (chỉ phần mốc mới; mốc cũ của Cô Thợ May vẫn ở js/village_scene.js)
  MD.nguoi = (k, sv) => !NPC_CN[k] || MD.co(NPC_CN[k], sv);
  // Cờ tắt (hay mốc mới đã qua mà mốc cũ chưa): câu cũ của Cô Thợ May (V53, mở sau Rừng già 2)
  MD.loiChuaMo = (k) => G.tv(!MD.bat() || !CHUA[k] || MD.nguoi(k) ? 'Cô Thợ May đi chợ xa. Qua ải Rừng già 2 rồi cô về may đồ cho bé.' : CHUA[k]);
  // Thẻ bảng làng → chức năng
  const THE = { skill: 'kyNang', chuong: 'chuong', rank: 'bangVang', so: 'so', thanhTuu: 'thanhTuu', viecNgay: 'viecNgay', outfit: 'thoMay', gear: 'hangXen', forge: 'ren' };
  MD.the = (tab, sv) => !THE[tab] || MD.co(THE[tab], sv);
  // Thẻ của lò rèn
  const FTAB = { sharpen: 'ren', vk: 'linhKhi', ep: 'epDo', up: 'nangLo' };
  MD.ftab = (t, sv) => !FTAB[t] || MD.co(FTAB[t], sv);

  // ---------- dòng báo ở làng ----------
  // Gọi khi vào làng: mốc vừa đạt mà chưa báo → trả câu báo (nhiều mốc cùng lúc thì báo mốc cao nhất), đánh dấu đã báo.
  MD.baoMoi = function (sv) {
    sv = sv || G.save;
    if (!MD.bat() || !sv || MD.cu(sv)) return null;
    if (!obj(sv.moDan)) sv.moDan = { bao: {} };
    if (!obj(sv.moDan.bao)) sv.moDan.bao = {};
    const B = sv.moDan.bao;
    let s = null;
    for (const k of THU_TU) if (!B[k] && MD.dat(k, sv)) { B[k] = 1; s = MOC[k].bao; }
    return s ? G.tv(s) : null;
  };
  MD.baoLang = function () {
    try {
      const s = MD.baoMoi();
      if (!s) return;
      if (G.villageScene && G.villageScene.say) G.villageScene.say(s, 5);
      if (G.persist) G.persist();
      if (G.sfx) G.sfx('evolve', 1.2);
    } catch (e) { /* báo lỗi: bỏ qua, không chặn vào làng */ }
  };

  // ---------- bản lưu ----------
  // Đặt trường moDan TRƯỚC phần "thiếu gì thì bù" của G.fixSave (nếu đặt trong G.newSave thì bản cũ sẽ bị chép trường của bản mới).
  function ganTruoc(s) {
    if (!obj(s) || obj(s.moDan)) return;
    const n = (v) => (obj(v) ? Object.keys(v).length : 0);
    const cu = n(s.stars) > 0 || n(s.stars2) > 0 || (typeof s.wins === 'number' && s.wins > 0);
    s.moDan = cu ? { cu: 1 } : { bao: {} };
  }
  function sua(s) {
    if (!obj(s)) return;
    if (!obj(s.moDan)) { s.moDan = { bao: {} }; return; }
    if (s.moDan.cu) s.moDan.cu = 1; else delete s.moDan.cu;
    if (!obj(s.moDan.bao)) s.moDan.bao = {};
    for (const k in s.moDan.bao) if (!MOC[k]) delete s.moDan.bao[k]; else s.moDan.bao[k] = 1;
  }
  if (G.fixSave && !G.fixSave.moDanBoc) {
    const goc = G.fixSave;
    G.fixSave = function (s) {
      try { ganTruoc(s); } catch (e) { /* bỏ qua */ }
      const r = goc.apply(this, arguments);
      try { sua(r); } catch (e) { /* bỏ qua */ }
      return r;
    };
    G.fixSave.moDanBoc = true;
  }
  if (G.newSave && !G.newSave.moDanBoc) {
    const goc = G.newSave;
    G.newSave = function () { const s = goc.apply(this, arguments); if (obj(s) && !obj(s.moDan)) s.moDan = { bao: {} }; return s; };
    G.newSave.moDanBoc = true;
  }

  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Mở mới: nút Đặc biệt và Chưởng, Cụ Đồ dạy kỹ năng, Lò rèn mài vũ khí.': 'New: Special and Palm buttons, the Old Scholar teaches skills, the forge sharpens weapons.',
    'Mở mới: đổi vũ khí trong ải. Chạm ô vũ khí, giữ để chọn 1 trong 4 món.': 'New: swap weapons in stages. Tap the weapon slot, hold to pick 1 of 4.',
    'Mở mới: Lò rèn thẻ Linh khí, nâng vũ khí và chọn hệ Lửa, Độc, Băng.': 'New: the forge Spirit tab, upgrade weapons and pick Fire, Poison or Ice.',
    'Mở mới: Ép đồ, Nâng lò, và Cô Thợ May về làng may trang phục.': 'New: Refining, Forge upgrades, and the Tailor is back to make outfits.',
    'Mở mới: Sổ yêu quái, Việc hôm nay, Thành tựu, Ải ngày, Bảng vàng.': "New: Monster Book, Today's jobs, Achievements, Daily trials, Hall of Fame.",
    'Ông Thợ Rèn đang nhóm lò. Qua ải Rừng già 1 rồi ghé ông mài vũ khí.': 'The Smith is lighting the forge. Clear Old Forest 1, then come sharpen your weapons.',
    'Bà Hàng Xén chưa dọn hàng. Qua ải Rừng già 1 rồi bà ra chợ.': 'The Grocer has not set up yet. Clear Old Forest 1 and she will open.',
    'Cô Thợ May đi chợ xa. Hạ Mộc Tinh rồi cô về may đồ cho bé.': 'The Tailor is away at the market. Defeat the Tree Spirit and she will come back.',
    'Âm thanh, điều khiển ›': 'Sound, controls ›', 'Âm thanh, pin, điều khiển': 'Sound, battery, controls',
    'Khoá mục tiêu: bật': 'Target lock: on', 'Khoá mục tiêu: tắt': 'Target lock: off', 'Tự ngắm': 'Auto-aim',
    'Khoá mục tiêu: nhắm mãi một con tới khi nó gục hay chạy khỏi tầm đánh.': 'Target lock: keep aiming at one monster until it falls or leaves your reach.',
    'Tự ngắm: ưu tiên quái theo hướng cần gạt, không có thì quái gần nhất.': 'Auto-aim: prefers monsters in the stick direction, otherwise the nearest one.',
  });
})();
