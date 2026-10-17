// BỘ ZED MỚI (13/10/2026) — docs/review/ke-hoach-cai-thien/zed-tich-hop/YEU-CAU.md
// Vẽ Zed bằng bộ ảnh mới: thân (game/art/custom/zed-moi.sprite.json, mỗi động tác 1 hàng, khung 48×48 game, net 2, chân [24,45])
// + vũ khí 4 loại × 4 cấp (zed-vk.sprite.json) gắn theo NEO từng khung (điểm cầm + góc; dựng bằng docs/anh-goc/zed/dung-zed-game.py,
// cách ghép = docs/anh-goc/zed/gan-vk/ghep-thu-vk.py đã duyệt): vẽ người → vũ khí xoay quanh điểm cầm (vũ khí SAU người khi neo ghi sau=1)
// → vẽ lại nắm tay (hàng "hang_tay" của tấm) đè lên cán. Quay trái: lật cả người lẫn vũ khí. Hình vũ khí theo cấp G.wStage (Trắng..Thức tỉnh),
// nhuộm nhẹ màu hệ khi vũ khí đang mang hệ.
// Chỉ ĐỌC đồng hồ đòn (atkT, hitAt, castT, specT, dodgeT, hurtT, mv.kind…): nhịp đánh, thời lượng, combo trong moves.js / combat.js giữ nguyên.
// Khung ★ (tư thế chạm) của mỗi đòn rơi đúng lúc u = hitAt (bảng MOC dưới đây). Sửa hai lỗi chọn khung cũ: chưởng chia đúng castT 0,3
// (L3, trước chia 0,4), búa nện ★ ở 0,35 (L1, trước 0,45).
// Phi tiêu (thay cung): ném tay không; viên phi tiêu bay là ảnh vk-phi-tieu cấp hiện tại, xoay khi bay.
// Trang phục (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-rung, zed-bo-bien, zed-bo-lau): tấm thân chọn theo G.zedBo() — 'ninja' = zed-moi,
// 'rung' = zed-rung, 'bien' = zed-bien, 'lau' = zed-lau (cùng chuẩn, neo dùng lại của bộ ninja); thử nhanh: ?zedbo=rung, ?zedbo=bien, ?zedbo=lau.
// Luôn bật (đợt 2 bỏ cờ ?zedmoi=0 / ?zed=0). Ảnh chưa tải xong → lớp vẽ bên trong (G.art.hero) vẽ tạm cho tới khi có.
// CẦM VŨ KHÍ LÚC ĐỨNG / ĐI / CHẠY (13/10/2026, docs/review/ke-hoach-cai-thien/zed-cam-vk/YEU-CAU.md): hàng dung/di/chay vẽ vũ khí đang cầm
// trong TAY PHẢI (cùng tay lúc chém) theo hàng neo riêng dung_<loại>, di_<loại>, chay_<loại> của tấm thân (cùng ảnh thân, neo + nắm tay riêng;
// dựng bằng docs/anh-goc/zed/gan-vk/cam-vk.py + dung-zed-game.py). Lộn, trúng đòn, chết: không vũ khí. Tắt: ?camvk=0 (G.CAM_VK, js/data.js).
// ĐÒN QUAY THEO HƯỚNG NHẮM (13/10/2026, docs/review/ke-hoach-cai-thien/zed-8-huong/YEU-CAU.md): góc nhắm thật P.aimRel (độ, so với hướng
// mặt sau khi lật, dương = chúc xuống; js/moves.js setAim) chốt lúc ra đòn → đâm/ném: cộng vào góc vũ khí, xoay quanh nắm tay, kẹp ±75°,
// quá ±75° thì nghiêng thân trên quanh eo tối đa 12°; chém/quét/nện: nghiêng cả đường vung tối đa ±35°. Vào thế êm (làm mượt theo thời
// gian + nối góc như gocMuot). Ném phi tiêu / đấm tay không (không có neo vũ khí): cánh tay đang duỗi (bảng TAY) xoay quanh gốc tay cùng góc.
// Vệt/hiệu ứng: mũi vũ khí (doiTip) đã xoay theo; js/fx.js aimed() hỏi G.zedMoi.lechHinh. Tắt: ?huongvk=0.
// VIỀN VŨ KHÍ THEO BẬC ÉP ĐỒ + ÁNH THEO CẤP MÀI (15/10/2026, docs/review/ke-hoach-cai-thien/vien-vk-bac/YEU-CAU.md): veVk gọi G.vienVk.truoc/sau
// (js/vien_vk.js) quanh ảnh vũ khí, mọi hàng có vũ khí (đứng/đi/chạy/chém/phi tiêu đang cầm). 16/10: mặc định TẮT (bậc chỉ ở khung ô); bật lại ?vienvk=1.
// SỬA BÓP EO / VẶN NGƯỜI KHI CHẠY + CHÉM (13/10/2026, docs/review/ke-hoach-cai-thien/zed-eo-sua/YEU-CAU.md): chân luôn cùng hướng thân trên
// (hướng chém); chạy ngược hướng chém → chạy LÙI (hàng chạy phát ngược thứ tự khung, nhịp ×0,8). Đường ghép dời xuống giữa đùi (đai + hông +
// đùi trên của khung đòn), vùng nối 5 hàng nguồn: nửa hẹp hơn giãn ngang dần cho khớp mép nửa kia, nửa trên đè nửa dưới. Số đo từng khung cả
// 4 bộ: G.ZED_EO phiên bản 2 (docs/anh-goc/zed/cat-than.py). Chỉ đổi HÌNH. Tắt: ?eosua=0 (G.EO_SUA, js/data.js) → cách ghép cũ.
// NẮM CHUÔI THẬT (15/10/2026, docs/review/ke-hoach-cai-thien/vk-khop-tay/bao-cao.md): mỗi hàng có vũ khí có thêm biến thể dong_tac[k].nam
// (docs/anh-goc/zed/gan-vk/nam_chuoi.py + dung-zed-game.py): điểm cầm = tâm NẮM ĐẤM, chuôi vũ khí ở giữa bề dày cán; lớp nắm tay = cả nắm
// đấm có viền; rồi LỚP NGÓN (zed-vk 'ngon', xoay cùng vũ khí) ôm ngang cán ở tâm nắm tay (+ tay thứ hai nếu còn nằm trên cán) → thứ tự
// TAY SAU (thân) → VŨ KHÍ → NGÓN TAY TRƯỚC. Thương: tay phải ở đuôi cán, tay trái ở thân cán, góc cán qua hai nắm tay. Phi tiêu: to ×1,3
// (cầm + bay, CHỈ HÌNH — vùng trúng/sát thương không đổi), kẹp một cánh ở ngón. Tắt: ?namchuoi=0 (G.NAM_CHUOI), ?thuong2tay=0
// (G.THUONG_2TAY: hàng thương về như cũ), ?phitieuto=0 (G.PHI_TIEU_TO: phi tiêu cầm + bay về như cũ).
// NẮM TAY TỪ ẢNH + CHẠY HAI TAY (16/10/2026, docs/review/ke-hoach-cai-thien/vk-khop-tay/bao-cao-2.md): lớp ngón tự vẽ được thay bằng nắm tay
// cắt từ ảnh moi/20-nam-tay-om-can.png (zed-vk 'nam_tay', 4 góc): lớp SAU (lòng bàn tay, vẽ trước vũ khí) + lớp TRƯỚC (ngón + ngón cái,
// vẽ sau vũ khí), chọn góc gần góc vũ khí nhất, xoay phần lệch còn lại; thiếu ảnh thì về lớp ngón tự vẽ. Tắt: ?ngonanh=0 (G.NGON_ANH).
// Chạy cầm thương / búa dùng hàng chay2tay (ảnh moi/03-chay-2tay.png: hai nắm tay trước ngực, cả 12 khung cầm hai tay); kiếm / phi tiêu
// và các bộ trang phục chưa có ảnh giữ hàng chạy cũ. Tắt: ?chay2tay=0 (G.CHAY_2TAY).
// CU TÍ TO + MƯỢT (16/10/2026, docs/review/ke-hoach-cai-thien/cu-ti-to-muot/bao-cao.md) — CHỈ HÌNH, không đổi va chạm / vùng trúng / nhịp đòn:
//  - TO HƠN (?cotiTo=0 về cỡ cũ; ?cotiTo=1.25 thử cỡ khác, 1..1,5): trong trận (lần vẽ có o.p) cả người + vũ khí + nắm tay được dựng ở
//    cỡ cũ vào canvas phụ (nét ×2 như nền), rồi vẽ ra ×G.COTI_TO quanh CHÂN (chân không rời bóng). Canvas phụ đặt đúng lưới điểm ảnh thật nên
//    phép phóng 1,2 lặp đều mỗi 5 điểm ảnh (không nhoè, không rung khi đi). Bóng chân, mũi vũ khí cho vệt chém (doiTip) phóng theo. Hình ở
//    giao diện (chân dung, làng, truyện) giữ cỡ cũ. Hộp va chạm, vùng trúng, tầm đánh của Tí và cỡ quái KHÔNG đổi.
//  - MƯỢT (?muot2=0 tắt cả nhóm): (a) giữ khung cuối của đòn ~0,06 giây rồi mới về đứng; (b) mờ chuyển 0,1 giây khi vào đứng / bước
//    (khung cũ — chính ảnh vừa vẽ — mờ dần đè lên khung mới); (c) đứng thở luôn bắt đầu từ khung 1 sau mỗi động tác; (d) chân chạy / đi
//    theo QUÃNG ĐƯỜNG thật (sải chân đo trên ảnh × cỡ hiển thị) → hết trượt chân, chạy chậm khi vừa chạy vừa chém thì bước chậm theo;
//    (e) góc vũ khí nối êm 0,1 giây mỗi khi đổi hàng ảnh (vào chiêu đặc biệt, thả búa / thương đang giữ…), không bật 150–180°;
//    (f) đổi vũ khí: món mới hiện dần 0,12 giây.
//  VỪA ĐI / CHẠY VỪA RA ĐÒN — GHÉP Ở ĐAI (17/10/2026, docs/review/ke-hoach-cai-thien/chan-di-danh/bao-cao.md). Lỗi: "vừa đi vừa đâm
//    thương chân bị bóp méo". Gốc: cách ghép zed-eo-sua cắt GIỮA ĐÙI — nửa trên mang theo hông + đùi của thế tấn rộng (thương, phi tiêu…)
//    rồi KÉO GIÃN vùng nối cho khớp chân chạy hẹp (keoNoi ×1,8) → đùi bè thành hình nêm, chân lệch 30–48 %; lại khớp ngang theo "tâm hông"
//    vốn nhảy 42–54 theo bước chạy mới 16/10 → thân trên lắc. Cách mới (?chandon=0 về cách cũ): thân trên khung ĐÒN tới đáy đai, chân khung
//    ĐI (đi bộ) hoặc CHẠY từ đáy đai (bỏ tay / mảnh không nối với bàn chân), khớp TÂM ĐAI (cột nguyên, không nửa điểm ảnh), KHÔNG co giãn
//    hàng nào. Hàng cúi / khuỵu (kiếm 3, quét, xốc, búa, đặc biệt) vẫn vẽ nguyên khung đòn (chân đứng tại chỗ, người trượt theo hướng đi).
(function () {
  const G = window.G;
  const SC = G.spriteCustom;
  if (!SC) return;
  const QS = (() => { try { return (typeof location !== 'undefined' && location.search) || ''; } catch (e) { return ''; } })();
  if (G.COTI_TO === undefined) {
    const m = /[?&]coti[Tt]o=([0-9.]+)(&|$)/.exec(QS);
    let k = 1.2;
    if (m) { k = parseFloat(m[1]); if (!(k >= 1)) k = 1; if (k > 1.5) k = 1.5; }
    G.COTI_TO = k;
  }
  if (G.MUOT2 === undefined) G.MUOT2 = !/[?&]muot2=0(&|$)/.test(QS);
  const muot2 = () => G.MUOT2 !== false;
  // Cỡ hiển thị của một lần vẽ: o.to (ép), hoặc G.COTI_TO khi vẽ trong trận (có o.p), còn lại 1. G.cotiTo(): cỡ trong trận (js/fx_he.js đọc).
  const toCua = (o) => { const k = o && o.to != null ? +o.to : o && o.p ? +G.COTI_TO || 1 : 1; return k > 0 ? k : 1; };
  G.cotiTo = () => +G.COTI_TO || 1;
  // ĐỘ NÉT (17/10/2026, docs/review/ke-hoach-cai-thien/do-net/bao-cao.md) — CHỈ HÌNH, không đổi cỡ, neo, khung, vùng trúng:
  //  (1) tấm thân dựng lại từ ảnh gốc bằng cách lấy màu theo ô (không trung bình → hết nhoè, hết viền alpha lửng): tệp zed-*.sprite.json.
  //  (2) BẢN TO ×1,2 ("tam_to" + "to" trong tệp, dựng từ ẢNH GỐC ở đúng cỡ 1,2): trong trận Cu Tí được dựng vào canvas phụ ở nét 2,4
  //      (= 2 × 1,2) từ bản to rồi chép 1:1 ra canvas thế giới → không còn phép phóng 1,2 lúc vẽ (trước: lặp 1/6 hàng/cột điểm ảnh).
  //      Mỗi lần vẽ một ô 96 của tấm thường → vẽ đúng ô đó của bản to (veT). Bản to chưa tải xong / thiếu ô → như cũ.
  //  (3) vũ khí (ảnh lưu to hơn cỡ vẽ ~2 lần): thu sẵn về đúng cỡ vẽ bằng cách lấy màu có thật gần màu trung bình mỗi ô (nhoAnh), không để
  //      trình duyệt bỏ điểm ảnh lúc thu (lởm chởm, nhấp nháy khi xoay). Phi tiêu bay cũng vậy.
  //  ?netcu=1: về cách cũ (phóng 1,2 lúc vẽ, vũ khí thu lúc vẽ; bản hai tệp còn nạp tấm cũ <mã>-netcu).
  if (G.NET_CU === undefined) G.NET_CU = /[?&]netcu=1(&|$)/.test(QS);
  function anhTo(T) {
    const t = T && T.tep;
    if (G.NET_CU || !t || !t.to || typeof t.tam_to !== 'string' || typeof Image === 'undefined') return null;
    if (!T._to) {
      const img = new Image(), r = { img, ready: false };
      img.onload = () => { r.ready = true; };
      img.onerror = () => { r.hong = true; };
      img.src = t.tam_to; T._to = r;
    }
    return T._to.ready ? T._to.img : null;
  }
  // NÉT CAO (thử nghiệm 17/10, docs/review/ke-hoach-cai-thien/net-cao/bao-cao.md): bản ảnh cho canvas nét n = 3 / 4 — "tam_n<n>" (mảng
  // TRANG ảnh, mỗi trang "to_n<n>".trang ô) + "to_n<n>" (cùng cách xếp ô như "to", k = 1,2 × n / 2, ô o), dựng từ ẢNH GỐC bằng
  // net-cao/cong-cu/dung_net_cao.py. Chỉ tải khi canvas đang ở nét đó (?netcao=3|4). Trả mảng trang khi đã về hết, chưa thì null.
  function anhNet(T, n) {
    const t = T && T.tep, ds = t && t['tam_n' + n], kr = '_n' + n;
    if (G.NET_CU || !t || !t['to_n' + n] || !Array.isArray(ds) || !ds.length || typeof Image === 'undefined') return null;
    if (!T[kr]) {
      const r = { ds: [], con: ds.length, ready: false };
      ds.forEach((src, i) => { const img = new Image(); img.onload = () => { if (--r.con === 0) r.ready = true; }; img.onerror = () => { r.hong = true; }; img.src = src; r.ds[i] = img; });
      T[kr] = r;
    }
    return T[kr].ready && !T[kr].hong ? T[kr].ds : null;
  }
  // Vẽ một vùng (trong MỘT ô 96) của tấm thân T. Canvas phụ đang ở nét to (q.__to === T) thì lấy cùng vùng ở bản to.
  function veT(q, T, I, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (q.__toN > 2 && q.__to === T && I === T.img) { // nét cao: canvas phụ ở nét 1,2 × N → lấy ô ở bản "tam_n<N>" (thiếu ô: bản to như dưới)
      const m = T.tep['to_n' + q.__toN], ds = m ? anhNet(T, q.__toN) : null;
      if (ds) {
        const col = Math.floor(sx / 96 + 1e-6), row = Math.floor(sy / 96 + 1e-6), j = m.o_cua[row * m.cot_goc + col];
        if (j != null && j >= 0) {
          const per = m.trang || 1e9, p = Math.floor(j / per), jj = j % per, k = m.k;
          if (ds[p]) { q.drawImage(ds[p], (jj % m.cot) * m.o + (sx - col * 96) * k, Math.floor(jj / m.cot) * m.o + (sy - row * 96) * k, sw * k, sh * k, dx, dy, dw, dh); return; }
        }
      }
    }
    const to = q.__to === T && I === T.img ? T.tep.to : null, im = to ? anhTo(T) : null; // ảnh khác tấm thân (I ≠ T.img, vd. tấm thương cao): vẽ như cũ
    if (im) {
      const col = Math.floor(sx / 96 + 1e-6), row = Math.floor(sy / 96 + 1e-6), j = to.o_cua[row * to.cot_goc + col];
      if (j != null && j >= 0) {
        const k = to.k;
        q.drawImage(im, (j % to.cot) * to.o + (sx - col * 96) * k, Math.floor(j / to.cot) * to.o + (sy - row * 96) * k, sw * k, sh * k, dx, dy, dw, dh);
        return;
      }
    }
    const t2 = q.__to === T && I && I !== T.img ? I.__to : null; // canvas khung thay ảnh (thương quét k6) có bản to riêng
    if (t2) {
      const col = Math.floor(sx / 96 + 1e-6), row = Math.floor(sy / 96 + 1e-6);
      if (t2.co[col]) { q.drawImage(t2.img, col * t2.o + (sx - col * 96) * t2.k, row * t2.o + (sy - row * 96) * t2.k, sw * t2.k, sh * t2.k, dx, dy, dw, dh); return; }
    }
    q.drawImage(I, sx, sy, sw, sh, dx, dy, dw, dh);
  }
  const nhoAnh = (img, x, y, w, h, rho) => (SC.nhoAnh ? SC.nhoAnh(img, x, y, w, h, rho) : null); // js/sprite_custom.js
  // Vẽ ảnh a ({img,x,y,w,h}) vào hình chữ nhật đích (đơn vị hiện tại) — thu sẵn khi đang vẽ nhỏ hơn ảnh (vũ khí, phi tiêu).
  function veNho(c, a, dx, dy) {
    let rho = 0;
    try { const T = c.getTransform(); rho = Math.hypot(T.a, T.b); } catch (e) { rho = 0; }
    const b = nhoAnh(a.img, a.x, a.y, a.w, a.h, rho);
    if (b) c.drawImage(b, 0, 0, b.width, b.height, dx, dy, a.w, a.h);
    else c.drawImage(a.img, a.x, a.y, a.w, a.h, dx, dy, a.w, a.h);
  }
  let tVe = null; // tấm thân của lần vẽ đang chạy (veLop dùng để biết có bản to không)
  const laZed = (o) => !!o && (o.key === 'smith' || !o.key);
  const lay = (ma) => {
    const z = SC.zed && SC.zed[ma];
    if (!z) return null;
    if (!z.ready && SC.canAnh) SC.canAnh(ma);
    return z.ready && z.img ? z : null;
  };
  // Tấm thân theo trang phục đang mặc (js/data.js G.zedBo: 'ninja' → zed-moi, 'rung' → zed-rung, 'bien' → zed-bien, 'lau' → zed-lau).
  // Tấm bộ khác chưa tải xong (zed-rung, zed-bien, zed-lau là ảnh tải sau) thì vẽ tạm bằng bộ ninja. Vũ khí (zed-vk), nhịp, neo, cách ghép y như nhau ở mọi bộ.
  const layThan = () => {
    let ma = 'zed-moi';
    try { const b = G.zedBo ? G.zedBo() : 'ninja'; if (G.ZED_BO && G.ZED_BO[b]) ma = G.ZED_BO[b].tam; } catch (e) { ma = 'zed-moi'; }
    const z = (ma !== 'zed-moi' && lay(ma)) || lay('zed-moi');
    if (z) { z._ma = z === SC.zed['zed-moi'] ? 'zed-moi' : ma; hang16(z.tep, z._ma); }
    return z;
  };
  // HÀNG MỚI 16/10 (docs/review/ke-hoach-cai-thien/hang-moi-16-10/bao-cao.md): tấm có khoá "<hàng>~16" (chủ game gen lại: đứng thở 8 khung,
  // lộn 6, trúng đòn 4; hiện chỉ bộ ninja zed-moi) → dùng THAY hàng cũ cùng tên, cả hàng cầm vũ khí dung~16_<loại> → dung_<loại>.
  // Hàng đứng mới thở thật, nối vòng 8→1 êm → phát thẳng 1→8 (không đi-về QUA_LAI). Bộ trang phục chưa có ảnh mới giữ hàng cũ.
  // Kiếm 1/2 bản gen đầu đổi tay nên không dùng. ?hangcu=1: về hàng cũ.
  // KIẾM MỚI 16/10 (docs/review/ke-hoach-cai-thien/kiem-moi-16-10/bao-cao.md): kiem_1~16 (5 khung) và kiem_3~16 (6 khung) gen lại theo
  // khung người đặc, tay phải trống, kiếm gắn theo neo mới (mọi cấp kiếm). Chỉ HÌNH: thời lượng, lúc chạm, vùng trúng, sát thương giữ
  // nguyên. Kiếm 3 mới có đòn đâm ở khung 4 → mốc khung riêng MOC16 (khung 4 rơi đúng u 0,45 = lúc chạm cũ). Chạy + chém kiếm 1 mới
  // dùng điểm eo đo trên khung mới (G.ZED_EO.bo.moi['kiem_1~16'], docs/anh-goc/zed/eo-kiem-16-10.py). Kiếm 2 giữ hàng cũ.
  // ?kiemmoi=0: về kiếm 1 / kiếm 3 cũ (đứng / lộn / trúng đòn mới vẫn dùng).
  // BÚA NỆN MỚI 16/10 (docs/review/ke-hoach-cai-thien/bua-moi-16-10/bao-cao.md): bua_nen~16 (8 khung, cùng số khung + giây với bua_nen →
  // MOC_BUA_BT, ★ khung 3 ở 0,35 giữ nguyên) thay bua_nen; búa cầm HAI TAY (neo tay trái dưới + tay phải trên, nắm tay ôm cán ở cả hai
  // chỗ). ?buamoi=0: về búa nện cũ (các hàng mới khác vẫn dùng).
  const HANG_CU = /[?&]hangcu=1(&|$)/.test(QS);
  const KIEM_MOI = !/[?&]kiemmoi=0(&|$)/.test(QS);
  // KIẾM NẶNG 17/10 (docs/review/ke-hoach-cai-thien/kiem-nang/bao-cao.md): chủ game gen combo kiếm nặng 10 khung (lê kiếm → hất lên →
  // hai tay bổ xuống → kéo sau chém ngang), tay trống, kiếm gắn theo neo (cầm HAI TAY ở khung 3–10: cán qua hai nắm tay). Dựng bằng
  // docs/anh-goc/zed/dung-kiem-nang.py thành 3 hàng thêm vào cuối tấm zed-moi: kiem_1~kn (khung 1–4, ★ 4), kiem_2~kn (5–7, ★ 6),
  // kiem_3~kn (8–10, ★ 9) → dùng THAY kiem_1/2/3 (sau hàng ~16). Mốc khung MOC_KN: ★ đúng u 0,45 (lúc chạm cũ); thời lượng mỗi nhát,
  // vùng trúng, sát thương giữ nguyên (chỉ HÌNH). Vệt chém riêng 4 hàng ảnh (js/fx.js, hu-chem-kiem-nang-1..4). Bộ trang phục khác / ?netcu=1
  // (tấm không có hàng ~kn) giữ kiếm cũ. ?kiemnang=0: về hàng kiếm + vệt trước phiên này (y hệt).
  const KIEM_NANG = !/[?&]kiemnang=0(&|$)/.test(QS);
  G.KIEM_NANG = KIEM_NANG;
  const MOC_KN = {
    kiem_1: [0, 0.15, 0.3, 0.45], // khung 1–2 xách kiếm lê đất, 3 hai tay quét sát đất, ★ 4 hất lên ở 0,45 (0,135 s)
    kiem_2: [0, 0.45, 0.72], // khung 5 giơ cao (giữ tới 0,45), ★ 6 bổ xuống, 7 mũi kiếm sát đất
    kiem_3: [0, 0.45, 0.72], // khung 8 kéo ra sau (giữ tới 0,45 = 0,21 s), ★ 9 chém ngang, 10 theo đà qua vai
  };
  // ĐÒN KIẾM NẶNG 17/10 (tư vấn ChatGPT mục 3, docs/review/ke-hoach-cai-thien/tu-van-17-10-don-kiem/bao-cao.md) — CHỈ HÌNH, mỗi mục một cờ:
  //  KN_NHIP (?knnhip=0 tắt → mốc + đường góc kiếm nặng như trước): phân lại khung hình TRONG thời lượng cũ, ★ vẫn đúng u 0,45:
  //    nhát 1 (18 nhịp ở 60 hình/giây): lê kiếm 5 nhịp (khung 1–2 tới u 0,28; mũi kiếm sau lưng trên đất tới u 0,22), quét qua dưới chân
  //      ~3 nhịp, ★ hất lên;
  //    nhát 2: giơ kiếm lên nhanh hơn (nối vào thế 0,2 thay 0,33) rồi GIỮ thế giơ cao 3 nhịp ngay trước va chạm (u 0,2 → 0,34), bổ trong
  //      2 nhịp;
  //    nhát 3 (28 nhịp): ★ khung 9 hiện 3 nhịp (0,45 → 0,56), kiếm theo đà ~6 nhịp (tới u 0,68) rồi thu kiếm về vai (tới u 0,95).
  //  KN_MUOT (?knmuot=0 tắt): nhát 1 lúc kiếm quét từ sau lưng ra trước (mũi không thể xuyên đất) — trước đây mũi nhảy từ sau ra trước
  //    trong 1 nhịp; nay mũi TRƯỢT LIỀN trên mặt đất qua dưới chân (lưỡi ngắn lại theo phối cảnh như đang quét chéo trước bụng), tia lửa
  //    ảnh hu-chem-kiem-nang-1 bám theo mũi.
  //  KN_GHIM (?knghim=0 tắt): nhát 3 lúc đang chạy (moves.js cho đứng tấn, không ghép chân chạy) → 4 nhịp đầu thân "ghìm lại" có chủ ý:
  //    ngả ra sau + hạ thấp, người trượt tới nhẹ theo đà rồi dừng, bụi chân ảnh hu-lao-bui sau gót (js/fx.js).
  const KN_NHIP = !/[?&]knnhip=0(&|$)/.test(QS), KN_MUOT = !/[?&]knmuot=0(&|$)/.test(QS), KN_GHIM = !/[?&]knghim=0(&|$)/.test(QS);
  G.KN_NHIP = KN_NHIP; G.KN_MUOT = KN_MUOT; G.KN_GHIM = KN_GHIM;
  if (KN_NHIP) { MOC_KN.kiem_1 = [0, 0.14, 0.28, 0.45]; MOC_KN.kiem_3 = [0, 0.45, 0.56]; }
  // Nút đường góc kiếm nặng (KN_NHIP): [u, khung, cộng thêm độ]; góc khung = góc neo cộng dồn đúng chiều vung như cungKiem.
  const KN_NUT = {
    kiem_1: [[0, 0], [0.2, 1], [0.4, 2], [0.5, 3]],
    kiem_2: [[0, 0], [0.34, 0], [0.47, 1], [0.93, 2]],
    kiem_3: [[0, 0], [0.315, 0], [0.482, 1], [0.68, 2], [0.95, 2, 30]],
  };
  const VAO_KN = { kiem_2: 0.2 }; // nối vào thế đầu nhát (thay VAO 0,33)
  const KIEM16 = { 'kiem_1~16': 1, 'kiem_2~16': 1, 'kiem_3~16': 1 }; // kiem_2~16: phiên ve-tay-8-gop-giao-dien (5 khung, ★ khung 3, mốc cũ MOC.kiem_2)
  // CHẠY MỚI 16/10 (docs/review/ke-hoach-cai-thien/ve-tay-8-dot-1/bao-cao.md): chay~16 (12 khung gen theo khung người đặc, bộ ninja) thay
  // hàng chạy cũ, cả chay~16_<loại> (cầm kiếm / thương / búa / phi tiêu, neo tay từng khung). Nhịp chân theo quãng đường (cu-ti-to-muot (d))
  // dùng sải đo lại trên hàng mới (SAI.chay16). Chạy cầm thương / búa vẫn dùng hàng hai tay cũ chay2tay (hàng mới hai nắm tay đánh xa nhau,
  // cán không ôm được). Chạy + chém: điểm eo đo trên khung chạy mới (G.ZED_EO.bo.moi['chay~16']). Chỉ HÌNH. ?chaymoi=0: hàng chạy cũ.
  const CHAY_MOI = !/[?&]chaymoi=0(&|$)/.test(QS);
  const BUA_MOI = !/[?&]buamoi=0(&|$)/.test(QS);
  function hang16(D, ma) {
    if (!D || !D.dong_tac || D._hang16) return;
    D._hang16 = 1;
    const dt = D.dong_tac;
    Object.keys(dt).forEach((k) => { if (dt[k] && typeof dt[k] === 'object') { dt[k]._khoa = k; dt[k]._ma = ma || 'zed-moi'; } }); // cam-vk-chuan: khoá gốc + tấm
    if (HANG_CU) return;
    Object.keys(dt).forEach((k) => {
      if (k.indexOf('~16') < 0 || (KIEM16[k] && !KIEM_MOI) || (!CHAY_MOI && k.indexOf('chay~16') === 0) || (k === 'bua_nen~16' && !BUA_MOI)) return;
      const goc = k.replace('~16', ''), a = Object.assign({}, dt[k], { moi16: 1, eo16: k });
      if (a.cam_vk) a.cam_vk = a.cam_vk.replace('~16', '');
      if (MOC16[goc]) a.moc = MOC16[goc];
      dt[goc] = a;
    });
    if (!KIEM_NANG) return;
    Object.keys(dt).forEach((k) => { // KIẾM NẶNG 17/10: kiem_N~kn thay kiem_N (sau hàng ~16) — xem MOC_KN
      if (k.indexOf('~kn') < 0 || !dt[k] || typeof dt[k] !== 'object') return;
      const goc = k.replace('~kn', '');
      if (!MOC_KN[goc]) return;
      dt[goc] = Object.assign({}, dt[k], { moi16: 1, eo16: k, kn: 1, moc: MOC_KN[goc] });
    });
  }
  // Khoá điểm eo của hàng ten trong bảng eo B: hàng mới 16/10 có số đo riêng ("<hàng>~16") thì dùng, không thì số của hàng cũ.
  const eoTen = (T, B, ten) => { const a = T && T.tep && T.tep.dong_tac && T.tep.dong_tac[ten]; return a && a.eo16 && B[a.eo16] ? a.eo16 : ten; };
  // ---------- CHẠY + CHÉM: ghép ở thắt lưng (13/10/2026, docs/review/ke-hoach-cai-thien/zed-chay-danh/YEU-CAU.md mục C) ----------
  // Đang chạy mà ra đòn ở hàng thân trên thẳng (G.ZED_EO.hang): chân = khung CHẠY hiện tại (nhịp P.chayT không reset), thân trên + tay +
  // vũ khí + nắm tay = khung ĐÒN hiện tại, hai nửa khớp tại điểm eo từng khung (G.ZED_EO, js/zed_eo_data.js, dựng bằng
  // docs/anh-goc/zed/cat-than.py). Chân quay theo hướng chạy (o.mdx), thân trên theo hướng chém (o.face) → chạy trái chém phải được.
  // Hàng cúi/khuỵu (kiếm 3, búa, quét, đặc biệt) không ghép: vẽ toàn thân hàng đòn (combat chậm lại, js/moves.js CHAY_DANH_CFG).
  // Bật khi G.CHAY_DANH là 'than' (mặc định) hoặc 'eo' và G.CHAY_DANH_MOI (tắt bằng ?chaydanh=0 → cách cũ).
  const BO_MA = { 'zed-moi': 'moi', 'zed-rung': 'rung', 'zed-bien': 'bien', 'zed-lau': 'lau' };
  const eoBat = () => G.CHAY_DANH_MOI !== false && !!G.ZED_EO && (G.CHAY_DANH === 'than' || G.CHAY_DANH === 'eo');
  const coEo = (ten) => eoBat() && G.ZED_EO.hang.indexOf(ten) >= 0;
  // Sửa bóp eo / vặn người (zed-eo-sua): cần dữ liệu phiên bản 2 (mỗi khung [y, x, c, l, r]). Tắt ?eosua=0.
  const eoSua = () => G.EO_SUA !== false && !!G.ZED_EO && G.ZED_EO.phien_ban >= 2;
  const LUI_NHIP = 0.8; // chạy lùi: nhịp chân chậm lại
  // chan-di-danh 17/10: ghép ở đai (cần số đo đai [5] = tâm đai, js/zed_eo_data.js "dai": 1). Tắt: ?chandon=0.
  if (G.CHAN_DON === undefined) G.CHAN_DON = !/[?&]chandon=0(&|$)/.test(QS);
  const chanDon = () => G.CHAN_DON !== false && !!G.ZED_EO && !!G.ZED_EO.dai;
  // Chân có chạy ngược hướng mặt (hướng chém) không — cùng phép thử như eoTinh cũ.
  const nguocMat = (o) => { const f = o.face < 0 ? -1 : 1, md = o.mdx || 0; return Math.abs(md) > 0.2 && (md > 0 ? 1 : -1) !== f; };
  // Phép kéo vùng nối (y hệt keo_noi trong cat-than.py): { tren, l, r, L, R } — tren = nửa trên được kéo (nửa dưới nếu false); [l, r] mép
  // nửa được kéo, [L, R] mép đích, đều theo cột nguồn của khung CHẠY (nửa trên đã dời dx). null: không kéo (khớp sẵn / không đo được / quá xa).
  function keoNoi(eA, eR, dx) {
    const Z = G.ZED_EO;
    if (eA[3] < 0 || eR[3] < 0) return null;
    const lA = eA[3] + dx, rA = eA[4] + dx, lR = eR[3], rR = eR[4], wA = rA - lA + 1, wR = rR - lR + 1;
    if (wA === wR && lA === lR) return null;
    const tren = wA < wR, l = tren ? lA : lR, r = tren ? rA : rR, L = tren ? lR : lA, R = tren ? rR : rA;
    if ((R - L + 1) / (r - l + 1) > (Z.keo_toi_da || 1.8) || Math.max(Math.abs(L - l), Math.abs(R - r)) > (Z.doi_toi_da || 10)) return null;
    return { tren, l, r, L, R };
  }
  // Số liệu ghép một khung: eA, eR = điểm eo [y, x] (ô 96 nguồn) khung đòn / khung chạy; ox, oy = dời nửa trên (điểm ảnh game,
  // hệ toạ độ đã lật theo mặt); rel = -1 khi chân quay ngược mặt (chạy ngược hướng chém); kc = bù 1 điểm ảnh khi lật chân.
  function eoTinh(T, s, o) {
    const B = G.ZED_EO.bo[BO_MA[T._ma] || 'moi'] || G.ZED_EO.bo.moi;
    if (s.eo.dai) { // ghép ở đai: khớp tâm đai (cột nguyên) + đáy đai; không kéo giãn
      const eA = B[eoTen(T, B, s.ten)] && B[eoTen(T, B, s.ten)][s.i], tc = eoTen(T, B, s.eo.chan), eR = B[tc] && B[tc][s.eo.i];
      if (!eA || !eR || eA.length < 6 || eR.length < 6) return null;
      const dx = Math.round(eR[5] - eA[5]), yA = eA.length > 7 ? eA[7] : eA[0], yR = eR.length > 7 ? eR[7] : eR[0]; // [7]: đáy đai đo lại
      return { eA, eR, yA, yR, rel: 1, kc: 0, dai: true, ox: dx / 2, oy: (yR - yA) / 2, K: null };
    }
    const te = eoTen(T, B, s.ten), eA = B[te] && B[te][s.i], tc = eoTen(T, B, 'chay'), eR = B[tc] && B[tc][s.eo.i]; // chạy mới 16/10: eo đo trên khung chạy mới
    if (!eA || !eR) return null;
    // cách mới: chân không lật (luôn cùng hướng thân trên), ngang khớp tâm hông, dọc khớp đường cắt giữa đùi
    if (s.eo.moi && eA.length >= 5 && eR.length >= 5) {
      const dx = eR[1] - eA[1];
      return { eA, eR, rel: 1, kc: 0, moi: true, ox: dx / 2, oy: (eR[2] - eA[2]) / 2, K: keoNoi(eA, eR, dx) };
    }
    const f = o.face < 0 ? -1 : 1, md = o.mdx || 0;
    const rel = Math.abs(md) > 0.2 && (md > 0 ? 1 : -1) !== f ? -1 : 1;
    const kc = rel < 0 ? ((f > 0 ? 1 : 0) - (f < 0 ? 1 : 0)) * f : 0;
    const Lx = kc + rel * (eR[1] / 2 - 24);
    return { eA, eR, rel, kc, ox: Lx - (eA[1] / 2 - 24), oy: (eR[0] - eA[0]) / 2 };
  }
  const kep = (v, a, b) => (v < a ? a : v > b ? b : v);
  const VK_LOAI = { sword: 'kiem', spear: 'thuong', hammer: 'bua', bow: 'phitieu' };
  // Nắm chuôi (vk-khop-tay): dữ liệu vẽ của một hàng có vũ khí — biến thể mới (da.nam) hoặc cũ khi cờ tắt. Nhớ theo hàng (cờ không đổi giữa chừng).
  const BT = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function bienThe(da) {
    const b0 = bienThe0(da);
    return da.vk === 'kiem' && SC.kiemVuong && SC.kiemVuong() ? kiemVuongB(b0) : b0;
  }
  // KIẾM VUÔNG 17/10 (docs/review/ke-hoach-cai-thien/kiem-vuong/bao-cao.md; ghép ảnh: js/sprite_custom.js ghepKiemVuong): hàng cầm kiếm dùng
  // điểm cầm của ảnh kiếm mới (z.kv.cam, đo bằng docs/anh-goc/zed/dung-kiem-vuong.py): nắm tay cầm (neo) — cả lúc một tay lẫn hai tay
  // (neo[4] = tay thứ hai nằm SAU trên cán) — sát chắn tay như kiếm cũ, phần cán còn lại đi về phía chuôi. Neo, góc, tỉ lệ vk_tl giữ nguyên.
  const KV_B = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function kiemVuongB(b) {
    let r = KV_B && KV_B.get(b);
    if (!r) { r = Object.assign({}, b, { cam: SC.kiemVuong().cam, kv: 1 }); if (KV_B) KV_B.set(b, r); }
    return r;
  }
  function bienThe0(da) {
    let b = BT && BT.get(da);
    if (b) return b;
    const m = da.nam;
    if (m && G.NAM_CHUOI !== false && !(da.vk === 'thuong' && G.THUONG_2TAY === false) && !(da.vk === 'phitieu' && G.PHI_TIEU_TO === false)) {
      b = { neo: m.neo, ht: m.hang_tay, tl: m.vk_tl || da.vk_tl, cam: m.vk_cam || da.vk_cam, nam: true };
    } else b = { neo: da.neo, ht: da.hang_tay, tl: da.vk_tl, cam: da.vk_cam, nam: false };
    if (b.nam) b = camChuan(da, b);
    if (b.nam && da.vk === 'thuong') b = thuongCao(da, b);
    if (BT) BT.set(da, b);
    return b;
  }
  // CẦM VŨ KHÍ CHUẨN (16/10/2026, docs/review/ke-hoach-cai-thien/cam-vk-chuan/LUAT.md + bao-cao.md): bảng G.CAM_CHUAN_DATA (js/cam_chuan_data.js,
  // dựng bằng cam-vk-chuan/sua.py) thay neo từng khung (điểm cầm đúng tâm nắm tay, cán qua hai nắm tay, thêm tay thứ hai đang nằm trên cán,
  // phi tiêu theo hướng cẳng tay) và điểm cầm trên ảnh kiếm (chuôi khuất dưới nắm tay, đốc chắn ngay mép nắm tay rồi lưỡi). Chỉ thay khi
  // tấm còn đúng bản đã đo (neo gốc / điểm cầm gốc khớp) — tấm dựng lại thì tự về số của tấm. Chỉ HÌNH. Tắt: ?camchuan=0 (G.CAM_CHUAN).
  function camChuan(da, b) {
    const C = G.CAM_CHUAN !== false && G.CAM_CHUAN_DATA;
    if (!C) return b;
    try {
      let neo = b.neo, cam = b.cam;
      const R = C.bo && C.bo[da._ma || 'zed-moi'] && C.bo[da._ma || 'zed-moi'][da._khoa];
      if (R && neo && R.so === neo.length) {
        const g0 = neo.find((x) => x);
        if (g0 && Math.abs(g0[0] - R.goc[0]) < 0.02 && Math.abs(g0[1] - R.goc[1]) < 0.02 && g0[2] === R.goc[2]) {
          neo = neo.slice();
          Object.keys(R.neo).forEach((i) => { neo[+i] = R.neo[i]; });
        }
      }
      const vc = C.vk_cam && C.vk_cam[da.vk];
      if (vc && cam && cam.length === vc.cu.length && vc.cu.every((p, j) => cam[j] && Math.abs(cam[j][0] - p[0]) < 0.02 && Math.abs(cam[j][1] - p[1]) < 0.02)) cam = vc.moi;
      return neo === b.neo && cam === b.cam ? b : Object.assign({}, b, { neo, cam });
    } catch (e) { return b; }
  }
  // THƯƠNG: NÂNG TAY TRÁI (17/10/2026, docs/review/ke-hoach-cai-thien/thuong-tay-trai-cao/bao-cao.md): bảng G.THUONG_CAO_DATA
  // (js/thuong_cao_data.js, dựng bằng thuong-tay-trai-cao/sua.py). Khung cầm thương hai tay: tay thứ hai (neo[4]) dời lên 2–3 điểm game,
  // góc cán = đường nối tay phải (giữ nguyên) → tay trái mới. Khung thân dựng lại một lần trên canvas phụ từ tấm thân (anhCao): mỗi cột
  // cẳng tay + nắm tay trái dời lên theo bảng "cot" (đúng điểm ảnh sẵn có, nét / màu / viền giữ nguyên), hàng nắm tay thân dời theo.
  // Chỉ thay khi neo đang dùng khớp "cu" (tấm dựng lại → như cũ). Cần nắm tay từ ảnh (?ngonanh=0 thì thôi). Chỉ HÌNH. Tắt: ?thuongcao=0.
  function thuongCao(da, b) {
    const C = G.THUONG_CAO !== false && G.NGON_ANH !== false && typeof document !== 'undefined' && G.THUONG_CAO_DATA;
    if (!C) return b;
    try {
      const R = C.bo && C.bo[da._ma || 'zed-moi'] && C.bo[da._ma || 'zed-moi'][da._khoa];
      if (!R || !b.neo || R.so !== b.neo.length) return b;
      const neo = b.neo.slice(), k = {};
      let co = false;
      Object.keys(R.khung).forEach((i) => {
        const r = R.khung[i], n = neo[+i];
        if (n && Math.abs(n[0] - r.cu[0]) < 0.02 && Math.abs(n[1] - r.cu[1]) < 0.02 && Math.abs(n[2] - r.cu[2]) < 0.05) {
          if (r.anh && !anhThay(r.anh)) return; // khung thay ảnh mà không tải được ảnh: giữ khung + neo cũ
          neo[+i] = r.neo; k[+i] = r.anh ? { anh: r.anh } : r.cot; co = true;
        }
      });
      return co ? Object.assign({}, b, { neo, cao: { k, khoa: da._khoa, hang: da.hang } }) : b;
    } catch (e) { return b; }
  }
  // LẦN 2 (17/10, thuong-tay-trai-cao/bao-cao.md "Lần 2: khung 6 quét"): khung THAY HẲN bằng ảnh chủ game gen lại (mục "anh" của bảng,
  // dựng bằng thuong-tay-trai-cao/quet-k6/dung_k6.py): tam = 2 ô 96 (thân | nắm tay thân) thu nhỏ nét, to = cùng 2 ô bản to ×k (ô o_to)
  // dựng thẳng từ ảnh gốc, cu = bản BOX cho ?netcu=1. Ảnh data URL, tải một lần. null: không có Image (máy chủ) → giữ khung cũ.
  const ANH_TH = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function anhThay(a) {
    if (!ANH_TH || typeof Image === 'undefined' || !a || typeof a.tam !== 'string') return null;
    let r = ANH_TH.get(a);
    if (!r) {
      const tai = (src) => { const o = { img: new Image(), ok: false }; o.img.onload = () => { o.ok = true; }; o.img.onerror = () => { o.hong = true; }; o.img.src = src; return o; };
      r = { than: tai(G.NET_CU && a.cu ? a.cu : a.tam), to: !G.NET_CU && a.to ? tai(a.to) : null };
      ANH_TH.set(a, r);
    }
    return r;
  }
  try { // tải sẵn ngay khi nạp (ảnh nhỏ), để lần vẽ đầu đã có
    const D = G.THUONG_CAO !== false && G.THUONG_CAO_DATA && G.THUONG_CAO_DATA.bo;
    if (D) Object.keys(D).forEach((b) => Object.keys(D[b]).forEach((h) => Object.keys(D[b][h].khung || {}).forEach((i) => { const a = D[b][h].khung[i].anh; if (a) anhThay(a); })));
  } catch (e) { /* tải lúc vẽ */ }
  // Canvas khung đã nâng tay của một hàng (hàng 0: thân, hàng 1: nắm tay thân hang_tay), nhớ theo tấm ảnh + khoá hàng. null: chưa dựng được.
  const CAO = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function anhCao(T, B) {
    if (!CAO || !B.cao || typeof document === 'undefined') return null;
    let m = CAO.get(T.img);
    if (!m) CAO.set(T.img, (m = {}));
    const key = B.cao.khoa;
    if (m[key] !== undefined) return m[key];
    let cv = null, cho = false;
    try {
      const so = B.neo.length;
      cv = document.createElement('canvas'); cv.width = so * 96; cv.height = 192;
      const q = cv.getContext('2d');
      q.imageSmoothingEnabled = false;
      const lop = [B.cao.hang, B.ht];
      Object.keys(B.cao.k).forEach((i) => {
        const x0 = +i * 96, ct = B.cao.k[i];
        if (ct && ct.anh) { // khung thay ảnh: chép 2 ô (thân, nắm tay thân); bản to vào canvas riêng cv.__to (veT dùng khi vẽ nét to)
          const A = anhThay(ct.anh);
          if (!A || A.than.hong) return;
          if (!A.than.ok || (A.to && !A.to.ok && !A.to.hong)) { cho = true; return; }
          q.drawImage(A.than.img, 0, 0, 96, 96, x0, 0, 96, 96);
          if (B.ht != null) q.drawImage(A.than.img, 96, 0, 96, 96, x0, 96, 96, 96);
          if (A.to && A.to.ok) {
            const o = ct.anh.o_to || 116, k = ct.anh.k || 1.2;
            if (!cv.__to) { const c2 = document.createElement('canvas'); c2.width = so * o; c2.height = 2 * o; cv.__to = { img: c2, o, k, co: {} }; }
            const q2 = cv.__to.img.getContext('2d');
            q2.imageSmoothingEnabled = false;
            q2.drawImage(A.to.img, 0, 0, o, o, +i * o, 0, o, o);
            if (B.ht != null) q2.drawImage(A.to.img, o, 0, o, o, +i * o, o, o, o);
            cv.__to.co[+i] = true;
          }
          return;
        }
        lop.forEach((h, j) => {
          if (h == null) return;
          const y0 = j * 96;
          veT(q, T, T.img, x0, h * 96, 96, 96, x0, y0, 96, 96);
          for (let c = 0; c < ct.length; c += 4) q.clearRect(x0 + ct[c], y0 + ct[c + 1], 1, ct[c + 2] - ct[c + 1] + 1);
          for (let c = 0; c < ct.length; c += 4) { const x = ct[c], a = ct[c + 1], n = ct[c + 2] - a + 1; veT(q, T, T.img, x0 + x, h * 96 + a, 1, n, x0 + x, y0 + a - ct[c + 3], 1, n); }
        });
      });
    } catch (e) { cv = null; ghiLoi(e); }
    if (cho) return null; // ảnh thay khung chưa tải xong: chưa nhớ, lần vẽ sau dựng lại
    m[key] = cv;
    return cv;
  }
  // Khung thân / nắm tay đang vẽ có bản nâng tay không: { img, hang: 0, ht: 1 } hoặc null.
  function caoCua(T, s, v) {
    if (!v || s.theo || !v.B.cao || !v.B.cao.k[v.wa.i] || v.wa.i !== s.i) return null;
    const cv = anhCao(T, v.B);
    return cv ? { img: cv, hang: 0, ht: v.B.ht != null ? 1 : null } : null;
  }
  // Mốc tiến độ u bắt đầu từng khung. ★ = khung đứng ở mốc hitAt (đánh dấu trong chú thích).
  const MOC = {
    kiem_1: [0, 0.22, 0.45, 0.65, 0.82], // ★ khung 3 ở 0,45 (0,30 s)
    kiem_2: [0, 0.22, 0.45, 0.65, 0.82], // ★ khung 3 ở 0,45 (0,30 s)
    kiem_3: [0, 0.2, 0.45, 0.6, 0.75, 0.88], // ★ khung 3 ở 0,45 (0,46 s)
    thuong_1: [0, 0.22, 0.45, 0.55, 0.7, 0.85], // ★ khung 3 ở 0,45
    thuong_2: [0, 0.22, 0.45, 0.55, 0.7, 0.85],
    thuong_3: [0, 0.22, 0.45, 0.55, 0.7, 0.85],
    thuong_quet: [0, 0.22, 0.45, 0.55, 0.7, 0.85], // ★ khung 3 ở 0,45 (0,52 s)
    bua_nen: [0, 0.15, 0.35, 0.5, 0.62, 0.74, 0.85, 0.93], // ★ khung 3 ở 0,35 = hitAt búa (sửa L1)
    bua_nen_dat: [0, 0.2, 0.45, 0.6, 0.75, 0.88], // vào từ u 0,36 (khung 2 giáng xuống), ★ khung 3 ở 0,45
    phitieu: [0, 0.22, 0.45, 0.6, 0.75, 0.88], // ★ khung 3 ở 0,45 (đạn sinh lúc chạm), 0,38 / 0,45 s như cung
    phitieu_chum: [0, 0.45, 0.6, 0.72, 0.84, 0.94], // thả: vào từ u 0,45, phi tiêu bay ngay → khung ném (2) hiện ngay lúc thả
    chuong: [0, 0.12, 0.25, 0.4, 0.6, 0.8], // castT 0,3 (sửa L3), đạn sinh ngay khi bấm
    db_kiem: [0, 0.12, 0.25, 0.4, 0.6, 0.8], // specT 0,35, hiệu ứng sinh ngay khi bấm
    db_thuong: [0, 0.12, 0.25, 0.4, 0.6, 0.8],
    db_bua: [0, 0.12, 0.25, 0.4, 0.6, 0.8],
    db_phitieu: [0, 0.12, 0.25, 0.4, 0.6, 0.8],
    dam: [0, 0.22, 0.45, 0.65, 0.82], // ★ khung 3 ở 0,45 (0,30 s)
  };
  // Mốc riêng của hàng mới 16/10 (hang16 gắn vào dong_tac[hàng].moc). Kiếm 3 mới: khung 4 = đâm (★) → khung 4 ở 0,45 như ★ cũ;
  // khung 1–3 (vung ra sau → vung thấp → giơ lên) chia đều 0..0,45, khung 5–6 thu thế như khung 5–6 cũ (0,65 / 0,82 ≈ nhịp kiếm 1).
  const MOC16 = { kiem_3: [0, 0.15, 0.3, 0.45, 0.65, 0.82] };
  const DB = { sword: 'db_kiem', spear: 'db_thuong', hammer: 'db_bua', bow: 'db_phitieu' };
  const GIU = { spear: 'thuong_giu', hammer: 'bua_giu', bow: 'phitieu_ngam' };
  const DI_BO = 0.6; // đi chậm hơn 60% tốc độ chạy đầy (đẩy cần nhẹ, bị làm chậm) → hàng ĐI BỘ

  // bao-cao-B (16/10): búa báo trước rõ hơn — khung 2 (búa giơ cao quá đầu) giữ từ 0,05 tới đúng lúc nện 0,35 (~0,24 giây) thay vì chỉ
  // 0,16 giây; khung 1 (vào thế) rút còn 0,04 giây. Chỉ dời mốc khung ảnh có sẵn, thời lượng đòn và lúc chạm không đổi. Tắt: ?camgiac=0.
  const MOC_BUA_BT = [0, 0.05, 0.35, 0.5, 0.62, 0.74, 0.85, 0.93];
  const mocCua = (ten, a) => (a && a.moc) || (ten === 'bua_nen' && G.CAM_GIAC_VK !== false ? MOC_BUA_BT : MOC[ten]); // a.moc: hàng mới 16/10
  function khungMot(D, ten, u) {
    const a = D.dong_tac[ten], m = mocCua(ten, a);
    u = kep(u || 0, 0, 1);
    if (m && m.length === a.so) { let i = 0; while (i < a.so - 1 && u + 1e-6 >= m[i + 1]) i++; return i; }
    return Math.min(a.so - 1, Math.floor(u * a.so));
  }
  // 15/10: chủ dự án thấy dáng đứng / đi / chạy của em bé hơi nhanh → các hàng LẶP (dung*, di*, chay*) chạy chậm lại ×NHIP_LAP.
  // Đòn đánh, lộn, trúng đòn… KHÔNG đổi (khớp mốc ra đòn). Cờ ?chaynhanh=1 → nhịp cũ.
  const NHIP_LAP = (() => { try { if (/[?&]chaynhanh=1(&|$)/.test(location.search || '')) return 1; } catch (e) { /* bỏ qua */ } return G.ZED_NHIP_LAP || 1.25; })();
  const giayLap = (ten, a) => (a.giay || 1) * (/^(dung|di|chay)(_|$)/.test(ten) ? NHIP_LAP : 1);
  function khungLap(D, ten, t) { const a = D.dong_tac[ten]; return Math.floor(Math.max(0, t) / giayLap(ten, a) * a.so) % a.so; }
  function phanKhung(D, ten, t) { const a = D.dong_tac[ten], v = Math.max(0, t) / giayLap(ten, a) * a.so; return v - Math.floor(v); } // tiến độ trong khung lặp (0..1)
  // ---------- Soát mượt phiên 3 ----------
  // Mục 17 (?thocuti=0 tắt): hàng ĐỨNG THỞ có 4 khung cuối gần như trùng nhau, nối vòng 8→1 bị nhảy → phát đi đi về về 1-2-3-4-5-4-3-2
  // (cùng nhịp mỗi khung, cùng chu kỳ 8 bước). Tụ lực búa (bua_giu, 4 khung) nối vòng cũng nhảy → 1-2-3-4-3-2. i2: khung kế (góc vũ khí
  // cầm nội suy về đúng khung sẽ tới, không về khung i+1). Hàng cầm vũ khí lúc đứng (dung_<loại>) dùng cùng khung với hàng thân.
  const QUA_LAI = { dung: [0, 1, 2, 3, 4, 3, 2, 1], bua_giu: [0, 1, 2, 3, 2, 1] };
  function lapQuaLai(D, ten, t) {
    const q = G.THO_CUTI !== false && QUA_LAI[ten], a = D.dong_tac[ten];
    if (!q || !a || a.moi16 || a.so < 5 - (ten === 'bua_giu' ? 1 : 0)) return null; // moi16: hàng đứng mới 16/10 phát thẳng
    const v = Math.max(0, t) / (giayLap(ten, a) / a.so), k = Math.floor(v) % q.length;
    return { ten, i: q[k], i2: q[(k + 1) % q.length], fl: v - Math.floor(v) };
  }
  // Mục 20 (?nhipcuti=0 tắt): PHA BƯỚC chung 0..1 cho đi bộ và chạy (mỗi em bé một pha, nhớ theo P): đổi đi↔chạy giữ đúng chỗ trong
  // bước (không nhảy chân), vừa bắt đầu đi / chạy thì vào từ khung 1 (chân chạm đất), lướt kiếm cũng đi theo pha bước (nhanh gấp đôi)
  // thay cho đồng hồ P.t. Vùng đệm: đang đi bộ thì phải nhanh hơn 0,65 mới sang chạy, đang chạy thì chậm hơn 0,55 mới về đi bộ.
  // Chỉ lần vẽ của chính em bé (o.t = P.t) mới đẩy pha; bóng mờ (o.t cũ) vẽ theo cách cũ. Chỉ là hình: tốc độ thật không đổi.
  const BUOC = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  const BUOC_VAO = 0.65, BUOC_RA = 0.55;
  const buocCua = (o) => (G.NHIP_CUTI !== false && BUOC && o.p && (o.t == null || o.t === o.p.t) ? o.p : null);
  // cu-ti-to-muot (d): SẢI CHÂN một vòng hàng ảnh, điểm ảnh game ở cỡ cũ (đo trên tấm zed-moi: bàn chân trụ lùi 24,5 / 29,5 điểm ảnh nguồn
  // qua 4 khung chạm đất của hàng chạy / chạy hai tay → 12 khung = 36,8 / 44,3; đi bộ: hai lần dạng chân mỗi vòng ≈ 31). Pha bước tăng theo
  // quãng đường đã đi / (sải × cỡ hiển thị) → bàn chân trụ đứng yên trên nền. Đứng sát tường (đẩy cần mà không đi được): vẫn bước chậm
  // bằng 35% nhịp cũ. Lướt kiếm (nhan 2) giữ nhịp theo thời gian như cũ.
  // ve-tay-8-dot-1: hàng chạy mới (chay~16): bàn trụ lùi trung bình gần bằng hàng cũ (do-sai.py: 4,0 / 3,94 điểm ảnh ô 96 mỗi khung →
  // ~37); thử nhịp trên chính các khung (trượt ròng ít nhất ở 32–36 với mọi tốc độ chạy) → chọn 34. Đo trong game: báo cáo mục 1.
  const SAI = { chay: 36.8, chay16: 34, chay2tay: 44.3, di: 31 };
  function buoc(o, D, ten0, nhan, mot) { // ten0: ép hàng ('chay'), không thì chọn đi / chạy theo P.diTL có vùng đệm; nhan: hệ số nhịp; mot: chân hàng chạy một tay (ghép đai)
    const p = buocCua(o);
    if (!p) return null;
    const t = G.time || 0;
    let b = BUOC.get(p);
    if (!b) BUOC.set(p, (b = { ph: 0, t, chay: true, di: false }));
    const dt = b.di ? kep(t - b.t, 0, 0.1) : 0;
    if (!b.di) b.ph = 0; // vừa bắt đầu bước: khung 1
    let qd = 0; // quãng đường (điểm ảnh game, dọc quy về sàn ÷0,75) từ lần vẽ trước
    if (b.di && b.x != null && t > b.t) { qd = Math.hypot((o.x || 0) - b.x, ((o.y || 0) - b.y) / 0.75); if (!(qd < 30)) qd = 0; } // dời quá xa: dịch chuyển
    if (t > b.t || !b.di) { b.x = o.x || 0; b.y = o.y || 0; }
    b.di = true; b.t = t;
    const tl = p.diTL;
    if (tl == null) b.chay = true;
    else if (b.chay && tl < BUOC_RA) b.chay = false;
    else if (!b.chay && tl > BUOC_VAO) b.chay = true;
    const ten = ten0 || (b.chay || !D.dong_tac.di ? 'chay' : 'di'), a = D.dong_tac[ten];
    if (!a) return null;
    if (muot2() && (nhan || 1) <= 1) {
      const sai = (ten === 'chay' && !mot && chay2(o, D) ? SAI.chay2tay : ten === 'chay' && a.moi16 ? SAI.chay16 : SAI[ten] || SAI.chay) * toCua(o);
      b.ph = (b.ph + Math.max(qd / sai, (dt * 0.35) / giayLap(ten, a))) % 1;
    } else b.ph = (b.ph + (dt * (nhan || 1)) / giayLap(ten, a)) % 1;
    const v = b.ph * a.so, i = Math.floor(v) % a.so;
    return { ten, i, fl: v - Math.floor(v), i2: (i + 1) % a.so };
  }
  function nghiBuoc(o) { const p = buocCua(o), b = p && BUOC.get(p); if (b) { b.di = false; b.t = G.time || 0; } }

  // Chọn động tác + khung (cùng thứ tự ưu tiên như SC.chonEmBe ở js/sprite_custom.js). Trả { ten, i, theo? }: theo = động tác đánh mà
  // vũ khí đi theo khi thân đang ở hàng chạy (chạy mà đánh, G.CHAY_DANH).
  function chon(o, D) {
    const s = chon0(o, D);
    if (s && !s.buoc && !(s.ghep && o.move)) nghiBuoc(o); // mục 20: không bước → lần bước sau vào từ khung 1
    // chạy + chém: ghép eo (chân hàng chạy, thân trên hàng đòn) — chỉ hàng có điểm eo, chỉ khi đang chạy
    if (s && s.ghep && o.move && coEo(s.ten) && D.dong_tac.chay) {
      if (chanDon()) { // chan-di-danh: chân = hàng ĐI khi đi bộ, hàng CHẠY khi chạy (theo pha bước chung); ngược hướng chém → phát ngược
        // thương / búa đang chạy: chân hàng chạy hai tay (chay2tay, như lúc chạy không đánh) nếu có số đo đai → không đổi bộ chân khi ra đòn
        const Bo = G.ZED_EO.bo[BO_MA[layThan() && layThan()._ma] || 'moi'] || {}, hai = chay2(o, D) && !!Bo.chay2tay;
        const lui = nguocMat(o), B = buoc(o, D, null, lui ? LUI_NHIP : 1, !hai);
        let ten = B && D.dong_tac[B.ten] ? B.ten : 'chay';
        if (ten === 'chay' && hai) ten = 'chay2tay';
        const so = D.dong_tac[ten].so;
        const i0 = B ? B.i : khungLap(D, 'chay', s.tc * (lui ? LUI_NHIP : 1));
        return { ten: s.ten, i: s.i, u: s.u, eo: { i: lui ? so - 1 - i0 : i0, chan: ten, dai: 1, lui: lui ? 1 : 0 } };
      }
      if (eoSua()) { // chân cùng hướng thân trên; chạy ngược hướng chém → chạy lùi (phát ngược thứ tự khung, nhịp ×0,8)
        const so = D.dong_tac.chay.so, lui = nguocMat(o), B = buoc(o, D, 'chay', lui ? LUI_NHIP : 1); // mục 20: chân theo pha bước chung
        const i = B ? (lui ? so - 1 - B.i : B.i) : lui ? so - 1 - khungLap(D, 'chay', s.tc * LUI_NHIP) : khungLap(D, 'chay', s.tc);
        return { ten: s.ten, i: s.i, u: s.u, eo: { i, moi: 1, lui: lui ? 1 : 0 } };
      }
      const B = buoc(o, D, 'chay');
      return { ten: s.ten, i: s.i, u: s.u, eo: { i: B ? B.i : khungLap(D, 'chay', s.tc) } };
    }
    if (s && s.ghep) { const r = { ten: s.ten, i: s.i, u: s.u }; return s.theo ? Object.assign(r, { theo: s.theo }) : r; }
    if (s && s.ten === 'chay' && chay2(o, D)) return Object.assign({}, s, { ten: 'chay2tay' }); // chạy cầm thương / búa: hàng hai tay
    return s;
  }
  // Hàng chạy hai tay (bao-cao-2): có ảnh ở bộ đang mặc, đang cầm thương / búa, không tắt ?chay2tay=0 / ?camvk=0.
  function chay2(o, D) {
    const w = o.weapon, l = w && VK_LOAI[w.type];
    return G.CHAY_2TAY !== false && G.CAM_VK !== false && (l === 'thuong' || l === 'bua') && !!D.dong_tac.chay2tay && !!D.dong_tac['chay2tay_' + l];
  }
  // cu-ti-to-muot (a) + (c): trạng thái theo em bé (chỉ lần vẽ của chính em bé, o.t = P.t; mọi lần hỏi trong cùng G.time cho cùng kết quả).
  //  cuoi: khung cuối của động tác một lần (đòn, lộn, trúng đòn, chưởng, chiêu đặc biệt) vừa vẽ — về đứng thì giữ thêm GIU_CUOI giây;
  //  dung0: lúc bắt đầu đứng (đứng thở chạy từ khung 1 thay vì khung bất kỳ theo đồng hồ chung).
  const TT = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  const GIU_CUOI = 0.06;
  const ttCua = (o) => { const p = buocCua(o); if (!p || !TT || !muot2()) return null; let r = TT.get(p); if (!r) TT.set(p, (r = { cuoi: null, dung0: 0, dungT: null })); return r; };
  function chon0(o, D) {
    const s = chon1(o, D), r = s && ttCua(o);
    if (r && !s.giuCuoi && s.u != null && !D.dong_tac[s.ten].lap && s.ten !== 'chet') r.cuoi = { ten: s.ten, t: G.time || 0, f: o.face < 0 ? -1 : 1 };
    return s;
  }
  function chon1(o, D) {
    const p = o.p, t = (o.t != null ? o.t : G.time) || 0, tc = o.tc != null && isFinite(o.tc) ? o.tc : t;
    const mv = p && p.mv, wt = o.weapon && o.weapon.type;
    let goc = wt; // loại vũ khí thật (giáo đang bay thì o.weapon là 'fist' nhưng chiêu đặc biệt vẫn là của giáo)
    try { if (p && G.curW) { const w = G.curW(p); if (w && w.type) goc = w.type; } } catch (e) { goc = wt; }
    const mot = (ten, u) => ({ ten, i: khungMot(D, ten, u), u: kep(u || 0, 0, 1) });
    const lap = (ten, tt) => lapQuaLai(D, ten, tt) || ({ ten, i: khungLap(D, ten, tt), fl: phanKhung(D, ten, tt) });
    const buocB = (ten0, nhan) => { const B = buoc(o, D, ten0, nhan); if (B) B.buoc = 1; return B; }; // mục 20
    if (p && p.dead) return mot('chet', (p.deadT || 0) / 0.6);
    if (o.dodge >= 0) return mot('lon', o.dodge);
    if (p && p.dashT > 0) {
      if (mv && mv.kind === 'xoc') return mot('thuong_xoc', mv.dashDur > 0 ? 1 - p.dashT / mv.dashDur : 0.5);
      return buocB('chay', 2) || lap('chay', t * 2); // Nhát lướt kiếm sau lộn: hàng chạy nhanh gấp đôi (mục 20: theo pha bước, không theo P.t)
    }
    if (p && p.specT > 0 && DB[goc]) return mot(DB[goc], 1 - p.specT / 0.35);
    if (p && p.castT > 0) return Object.assign(mot('chuong', 1 - p.castT / 0.3), { ghep: 1, tc });
    if (mv && mv.holding && !(o.atk >= 0)) { const k = GIU[wt]; return k ? Object.assign(lap(k, t), { ghep: 1, tc }) : lap('dung', t); }
    if (o.atk >= 0) {
      const ci = p ? p.comboI | 0 : Math.floor(t / 1.6), u = o.atk;
      let r = null;
      if (!wt || wt === 'fist') r = mot('dam', u);
      else if (wt === 'sword') r = mot('kiem_' + (((ci % 3) + 3) % 3 + 1), u);
      else if (wt === 'spear') r = (mv && mv.kind === 'quet') || ci === 3 ? mot('thuong_quet', u) : mot('thuong_' + (kep(ci, 0, 2) + 1), u);
      else if (wt === 'hammer') r = mot(mv && mv.kind === 'nenDat' ? 'bua_nen_dat' : 'bua_nen', u);
      else if (wt === 'bow') r = mot(mv && mv.kind === 'banManh' ? 'phitieu_chum' : 'phitieu', u);
      if (r) {
        const cd = G.CHAY_DANH; // chạy mà đánh: thân giữ hàng chạy (chân bước), chỉ vũ khí vung theo neo của khung đòn đánh
        if (eoBat()) return Object.assign(r, { ghep: 1, tc }); // cách mới: ghép eo (hàng thẳng) hoặc toàn thân hàng đòn (hàng cúi)
        if (o.move && (cd === 'than' || (cd === 'lai' && !(u >= 0.2 && u < 0.65)))) { const B = buocB('chay'); return { ten: 'chay', i: B ? B.i : khungLap(D, 'chay', tc), theo: r, buoc: B ? 1 : 0 }; }
        return r;
      }
    }
    if ((p && p.hurtT > 0) || (!p && o.flash)) return mot('trung', p ? 1 - p.hurtT / 0.2 : 0.3);
    if (o.move) return buocB() || lap(p && p.diTL != null && p.diTL < DI_BO ? 'di' : 'chay', tc);
    const r = ttCua(o);
    if (r) {
      const c = r.cuoi, now = G.time || 0;
      // (a) vừa hết động tác một lần, đứng yên, cùng mặt: giữ khung cuối thêm GIU_CUOI giây (khung cuối = thế thu tay của chính ảnh đó)
      if (c && now - c.t <= GIU_CUOI && c.f === (o.face < 0 ? -1 : 1) && D.dong_tac[c.ten]) return Object.assign(mot(c.ten, 1), { giuCuoi: 1 });
      // (c) đứng thở từ khung 1
      if (r.dungT == null || now - r.dungT > 0.05) r.dung0 = now;
      r.dungT = now;
      return lap('dung', now - r.dung0);
    }
    return lap('dung', t);
  }

  // Cấp hình vũ khí (0 Trắng .. 3 Thức tỉnh = G.STAGE_NAMES) và hệ đang mang.
  function capVk(w) { let c = 0; try { c = G.wStage ? G.wStage(w) : w.stage || 0; } catch (e) { c = 0; } return kep(c | 0, 0, 3); }
  function heVk(w) {
    if (!w) return null;
    if (w.coat && G.EL && G.EL[w.coat]) return w.coat;
    return w.branch && capVk(w) > 0 && G.EL && G.EL[w.branch] ? w.branch : null;
  }
  // Ảnh một vũ khí (loại, cấp) — nhuộm nhẹ theo hệ (nhớ lại, mỗi tổ hợp vẽ một lần). Trả { img, x, y, w, h }.
  const NHUOM = new Map();
  function anhVk(V, loai, cap, he, w) {
    const r = V.tep.vk[loai][cap];
    // 16/10 gan-vk: vũ khí w đang ở cấp Luyện giữa hai mốc → ảnh "gân" cùng cỡ ô (zed-vk-gan, js/vien_vk.js G.vkGan; ?gan=0 tắt)
    const gan = w && G.vkGan && G.vkGanAnh && G.vkGan(w, cap) ? G.vkGanAnh(loai, cap, r) : null;
    const goc = gan || { img: V.img, x: r[0], y: r[1], w: r[2], h: r[3] };
    if (!he || typeof document === 'undefined') return goc;
    const anhHe = !gan && G.vkHeAnh && G.vkHeAnh(loai, cap, he, r); // 16/10: có ảnh vũ khí theo hệ (zed-vk-he, js/vien_vk.js) thì dùng, không nhuộm
    if (anhHe) return anhHe;
    const k = loai + cap + he + (gan ? 'g' : ''); // ảnh gân nhuộm hệ như ảnh thường
    let cv = NHUOM.get(k);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = r[2]; cv.height = r[3];
      const q = cv.getContext('2d'); q.imageSmoothingEnabled = false;
      q.drawImage(goc.img, goc.x, goc.y, r[2], r[3], 0, 0, r[2], r[3]);
      q.globalCompositeOperation = 'source-atop'; q.globalAlpha = 0.3; q.fillStyle = G.EL[he].col; q.fillRect(0, 0, r[2], r[3]);
      NHUOM.set(k, cv);
    }
    return { img: cv, x: 0, y: 0, w: r[2], h: r[3] };
  }
  // Vũ khí đặt ở khung này: { da (động tác của neo), n (neo), cap, loai } hoặc null.
  // Cầm vũ khí lúc đứng/đi/chạy: hàng neo <hàng thân>_<loại> (cùng khung với hàng thân). null: không có / tắt ?camvk=0.
  const CAM_HANG = { dung: 1, di: 1, chay: 1, chay2tay: 1 };
  function camCua(D, s, w) {
    if (G.CAM_VK === false || s.theo || !CAM_HANG[s.ten] || !w || w.type === 'fist' || !VK_LOAI[w.type]) return null;
    const ten = s.ten + '_' + VK_LOAI[w.type];
    return D.dong_tac[ten] ? { ten, i: s.i, fl: s.fl, i2: s.i2, cam: 1 } : null;
  }
  // ---------- ĐÒN QUAY THEO HƯỚNG NHẮM (zed-8-huong) ----------
  // HV_DAM: hàng đâm / ném (vũ khí xoay quanh nắm tay theo góc nhắm, kẹp ±KEP_DAM; quá thì nghiêng thân trên quanh eo, tối đa NGHIENG).
  // HV_CHEM: hàng chém / quét / nện (giữ đường vung theo ảnh, chỉ nghiêng cả đường vung tối đa ±KEP_CHEM).
  // Mưa Phi Tiêu (db_phitieu, rơi từ trời) và nện đất đặc biệt (db_bua, vòng quanh người) không theo hướng nên không xoay.
  const HV_DAM = { thuong_1: 1, thuong_2: 1, thuong_3: 1, thuong_xoc: 1, db_thuong: 1, phitieu: 1, phitieu_chum: 1, phitieu_ngam: 1, dam: 1 };
  const HV_CHEM = { kiem_1: 1, kiem_2: 1, kiem_3: 1, thuong_quet: 1, bua_nen: 1, bua_nen_dat: 1, db_kiem: 1 };
  const KEP_DAM = 75, KEP_CHEM = 35, NGHIENG = 12, HV_TAU = 0.05; // HV_TAU: hằng thời gian làm mượt (giây) — 95% sau ~0,15 s
  const hvBat = () => G.HUONG_VK !== false;
  const HV = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  const ss = (x) => { x = kep(x, 0, 1); return x * x * (3 - 2 * x); };
  // Góc nhắm (độ, so với mặt) → { g: cộng vào góc vũ khí, lean: nghiêng thân trên } theo loại đòn. rel ±90 (js/moves.js setAim kẹp sẵn).
  function lechTu(rel, loai, coEoKhung) {
    if (loai === 'chem') return { g: kep(rel, -KEP_CHEM, KEP_CHEM), lean: 0 };
    const g = kep(rel, -KEP_DAM, KEP_DAM), du = Math.abs(rel) - KEP_DAM;
    return { g, lean: coEoKhung && du > 0 ? Math.sign(rel) * Math.min(NGHIENG, du * 0.8) : 0 };
  }
  // Điểm eo [y, x] (ô 96 nguồn) của khung đòn ten/i ở bộ đang mặc (G.ZED_EO, js/zed_eo_data.js) — trục nghiêng thân trên. null: không có.
  function eoKhung(T, ten, i) {
    const Z = G.ZED_EO; if (!Z || !Z.bo) return null;
    const B = Z.bo[BO_MA[T && T._ma] || 'moi'] || Z.bo.moi, te = B ? eoTen(T, B, ten) : ten;
    return (B && B[te] && B[te][i]) || null;
  }
  // Hàng ném / đấm TAY KHÔNG (phitieu, phitieu_ngam, phitieu_chum, dam — không có neo vũ khí): cánh tay đang duỗi được cắt ra và xoay
  // quanh gốc tay theo cùng góc lệch như vũ khí đâm. Mỗi khung [trục x, trục y, x0, y0, x1, y1] (ô 96 nguồn) hoặc null (tay không duỗi →
  // chỉ nghiêng thân). Đo tự động từ ảnh (cột ngoài cùng của cánh tay, nới 2–3 điểm ảnh) bằng docs/anh-goc/zed/gan-vk/do-tay-nem.py.
  const TAY = {"moi":{"phitieu":[null,null,[62,53,62,48,83,58],null,null,null],"phitieu_ngam":[[58,57,58,52,79,62],[55,57,55,52,76,62],[55,56,55,51,76,61]],"phitieu_chum":[[58,52,58,46,79,59],[72,53,72,47,93,59],null,null,null,null],"dam":[null,null,[55,58,55,53,76,63],[55,58,55,53,76,63],null]},"rung":{"phitieu":[null,null,[62,55,62,50,83,60],null,null,null],"phitieu_ngam":[[59,56,59,51,80,61],[59,56,59,51,80,61],[58,56,58,51,79,61]],"phitieu_chum":[[58,51,58,45,79,58],[73,53,73,47,94,59],null,null,null,null],"dam":[null,null,[55,58,55,53,76,63],[55,58,55,53,76,63],null]},"bien":{"phitieu":[null,null,[63,53,63,48,84,58],null,null,null],"phitieu_ngam":[[58,56,58,51,79,61],[56,56,56,51,77,61],[55,56,55,51,76,61]],"phitieu_chum":[[57,53,57,47,78,59],[71,54,71,49,92,60],null,null,null,null],"dam":[null,null,[55,59,55,54,76,64],[55,59,55,54,76,64],null]},"lau":{"phitieu":[null,null,[64,53,64,48,85,58],null,null,null],"phitieu_ngam":[[59,54,59,50,80,59],[58,54,58,50,79,59],[57,54,57,50,78,59]],"phitieu_chum":[[58,51,58,45,79,58],[73,53,73,47,94,59],null,null,null,null],"dam":[null,null,[55,57,55,52,76,62],[55,57,55,52,76,62],null]}};
  const tayKhung = (T, ten, i) => { const B = TAY[BO_MA[T && T._ma] || 'moi'] || TAY.moi, r = B && B[ten]; return (r && r[i]) || null; };
  // Mục tiêu lệch cho khung vũ khí wa (chưa làm mượt). Góc nhắm CHỐT theo nhát (p.lastAtk): ai hỏi trước (vẽ hay fx đo vệt) cũng lấy
  // P.aimRel vừa đặt lúc ra đòn, cả nhát dùng đúng số đó. Phi tiêu ngắm (đang giữ): theo góc ngắm sống, làm mượt. Chiêu đặc biệt: P.aimRel
  // (js/moves.js M.cast đặt một lần lúc tung). Lean giảm dần ở 25% cuối nhát để về hàng đứng không giật.
  function huongCua(o, T, wa) {
    if (!hvBat() || wa.cam) return null;
    const loai = HV_DAM[wa.ten] ? 'dam' : HV_CHEM[wa.ten] ? 'chem' : null, p = o.p;
    if (!loai || !p || p.aimRel == null || !isFinite(p.aimRel) || !HV) return null;
    let h = HV.get(p); if (!h) HV.set(p, (h = { id: null, rel: 0, ng: 0, ngT: null, gv: 0, lv: 0, t: null }));
    const t = G.time || 0;
    let rel;
    if (wa.ten === 'phitieu_ngam') {
      if (h.ngT == null || t - h.ngT > 0.25) h.ng = 0; // vừa vào thế ngắm: đi từ thẳng trước mặt
      const dt = h.ngT == null ? 0 : Math.max(0, t - h.ngT);
      h.ng += (p.aimRel - h.ng) * (1 - Math.exp(-dt / 0.08)); h.ngT = t;
      rel = h.ng; h.id = null;
    } else if (/^db_/.test(wa.ten)) rel = p.aimRel;
    else {
      if (h.id !== p.lastAtk) { h.id = p.lastAtk; h.rel = p.aimRel; }
      rel = h.rel;
    }
    const L = lechTu(kep(rel, -90, 90), loai, !!eoKhung(T, wa.ten, wa.i));
    if (L.lean && wa.u != null) L.lean *= ss((1 - wa.u) / 0.25);
    L.h = h;
    return L;
  }
  // Làm mượt theo thời gian (chỉ ở lần VẼ thật, mỗi khung một lần): vào thế / đổi góc không giật; lần đo của fx (cùng G.time) không đổi trạng thái.
  function hvMuot(L) {
    const h = L.h, t = G.time || 0, dt = h.t == null ? 1 : t - h.t;
    if (!(dt >= 0) || dt > 0.25) { h.gv = L.g; h.lv = L.lean; }
    else if (dt > 0) { const k = 1 - Math.exp(-dt / HV_TAU); h.gv += (L.g - h.gv) * k; h.lv += (L.lean - h.lv) * k; }
    h.t = t;
    return { g: h.gv, lean: h.lv };
  }
  function hvNghi(o) { // lần vẽ không có đòn theo hướng: kéo trạng thái mượt về 0 (để nhát sau vào thế từ thẳng)
    const p = o.p, h = p && HV ? HV.get(p) : null;
    if (!h) return;
    const t = G.time || 0, dt = h.t == null ? 1 : t - h.t;
    if (!(dt >= 0) || dt > 0.25) { h.gv = 0; h.lv = 0; } else if (dt > 0) { const k = 1 - Math.exp(-dt / HV_TAU); h.gv -= h.gv * k; h.lv -= h.lv * k; }
    h.t = t;
  }
  // Ra lệch góc dùng cho js/fx.js aimed(): hình trên không của đòn (vệt chém code, vệt đâm, hu-quet-giao...) xoay đúng góc vũ khí đang vẽ
  // thay vì góc nhắm đầy đủ. d = info đòn của moves.js (type, move). null: không áp (cờ tắt, lướt chém...) → fx giữ góc thật.
  function lechHinh(P, d) {
    if (!hvBat() || !P || P.aimRel == null || !isFinite(P.aimRel) || !laZed({ key: P.key }) || !layThan()) return null;
    const mv = d && d.move;
    const loai = mv === 'dam' || mv === 'xoc' || mv === 'ban' || mv === 'banManh' ? 'dam' : mv === 'chem' || mv === 'quet' || mv === 'nen' || mv === 'nenDat' ? 'chem' : null;
    if (!loai) return null;
    const L = lechTu(kep(P.aimRel, -90, 90), loai, mv !== 'xoc'); // thương xốc (hàng thuong_xoc) không có điểm eo → không nghiêng thân
    return L.g + L.lean;
  }
  function vkCua(o, D, s, T, ve) {
    const w = o.weapon;
    if (!w || !w.type) return null;
    const wa = camCua(D, s, w) || s.theo || s, da = D.dong_tac[wa.ten];
    if (!da || !da.vk || !da.neo) return null;
    const B = bienThe(da), n = B.neo[wa.i];
    if (!n) return null; // khung null: không vũ khí (Phi Thương khung 3–6: giáo đã ném đi)
    if (w.type === 'fist' && !/^db_/.test(wa.ten)) return null; // tay không (giáo đang bay)
    if (w.type !== 'fist' && VK_LOAI[w.type] !== da.vk) return null;
    let H = huongCua(o, T, wa);
    if (H && ve) H = hvMuot(H);
    const g = H ? H.g : 0;
    let lean = H && !s.theo ? H.lean : 0; // chạy kiểu cũ (thân hàng chạy, s.theo): không nghiêng thân chạy
    let ang = gocMuot(o, da, wa, n, g, B.neo), mo = 1;
    if (muot2()) {
      if (!(da.kn && KN_KHONG_NOI[wa.ten])) ang = noiHang(o, wa.ten, ang, ve, da.kn ? NOI_CHIEU[wa.ten + '~kn'] : 0);
      const p = o.p, t = G.time || 0; // (f) vừa đổi vũ khí (P.swapAt, js/combat.js): món mới hiện dần
      if (p && p.swapAt != null && t - p.swapAt >= 0 && t - p.swapAt < DOI_MO) mo = 0.3 + 0.7 * ss((t - p.swapAt) / DOI_MO);
    }
    // KIẾM BỚT CỨNG (2) + (3): thân nghiêng / nhún / nhích theo tiến độ; mũi kiếm không xuống dưới đất. tk: dời cả người (wx) / thân trên (uy).
    let tk = null, co = 1;
    if (!s.theo && wa === s && kiemDeo(wa.ten) && wa.u != null) {
      const E = s.eo ? eoTinh(T, s, o) : null, e = E ? [E.eA[0] + 2 * E.oy, E.eA[1] + 2 * E.ox] : eoKhung(T, wa.ten, wa.i);
      const th = e ? thanKiem(wa.ten, wa.u, da, o.p) : null;
      if (th) { lean += th.lean; if (!E) tk = { wx: th.wx, uy: th.uy }; }
      const V = lay('zed-vk'), R = V && V.tep.vk[da.vk] && V.tep.vk[da.vk][capVk(w)], gc = B.cam && B.cam[capVk(w)];
      if (R && gc) {
        let gx = n[0] / 2 - 24 + (E ? E.ox : 0), gy = n[1] / 2 - 45 + (E ? E.oy : 0);
        if (e && lean) { const b = (lean * Math.PI) / 180, px = e[1] / 2 - 24, py = e[0] / 2 - 45, cx = gx - px, cy = gy - py; gy = py + cx * Math.sin(b) + cy * Math.cos(b); }
        if (tk) gy += tk.uy;
        const L = (R[2] - gc[0]) * B.tl, a2 = datGoc(kepDat, ang + lean, gy, L, B, capVk(w)), aTho = ang + lean;
        ang = a2 - lean;
        const dd = da.kn && DINH_DAT[wa.ten]; // kiếm nặng: khung lê kiếm / mũi sát đất → mũi CHẠM đất đúng độ dài lưỡi từng cấp
        if (dd && wa.u >= dd[0] && wa.u <= dd[1]) ang = datGoc(dinhDat, ang + lean, gy, L, B, capVk(w)) - lean;
        let q = KN_MUOT && da.kn && wa.ten === 'kiem_1' && wa.u > 0.17 && wa.u < 0.45 ? quetDat(aTho, gy, L) : null; // KN_MUOT
        if (q) { const h = goc2Vuong(B, capVk(w), q.a); if (h > 0) q = quetDat(aTho, gy + h, L) || q; } // kiếm vuông: góc đầu vuông thấp hơn trục
        if (q) { ang = q.a - lean; co = q.co; }
      }
    }
    return { da, n, wa, B, cap: capVk(w), he: heVk(w), ang, cam: !!wa.cam, lean, hv: !!H, w, mo, tk, co };
  }
  // KN_MUOT (đòn kiếm nặng 17/10): góc thô a (đã cộng nghiêng) mà mũi kiếm (dài L, điểm cầm gy) sẽ xuyên đất — lúc kiếm quét từ sau lưng ra
  // trước dưới chân — thì thay vì kẹp (mũi nhảy từ sau ra trước trong 1 nhịp) cho mũi TRƯỢT trên vạch đất theo tiến độ góc thô qua dải
  // xuyên đất: e 0 → 1 ứng với mũi ở sau → ngay dưới tay → trước; lưỡi vẽ ngắn lại (co ≤ 1, phối cảnh) cho mũi đúng chỗ. null: không áp.
  function quetDat(a, gy, L) {
    const k = (-0.5 - gy) / L;
    if (!(L > 0) || !(k > 0) || k >= 1) return null;
    const amin = (Math.asin(k) * 180) / Math.PI, y = ((a % 360) + 360) % 360;
    if (!(y > amin && y < 180 - amin)) return null;
    const e = (180 - amin - y) / (180 - 2 * amin), cx = L * Math.cos((amin * Math.PI) / 180) * (2 * e - 1), cy = k * L;
    return { a: (Math.atan2(cy, cx) * 180) / Math.PI, co: Math.hypot(cx, cy) / L };
  }
  // cu-ti-to-muot (e): đổi HÀNG ảnh có vũ khí (đứng → chiêu đặc biệt, búa giữ → nện đất, thương giữ → xốc / quét…) mà góc vừa vẽ lệch
  // quá 20° so với góc mới → trong NOI_HANG giây đầu góc đi dần (đường ngắn nhất, chậm–nhanh–chậm) từ góc vừa vẽ. Lần đo của fx (ve = false)
  // chỉ đọc. Nối sẵn có (vào thế đầu đòn VAO, về thế cầm RA) vẫn chạy như cũ; nối này chỉ phủ các chỗ hai nối kia không phủ.
  const NOI_HANG = 0.1, DOI_MO = 0.12;
  // Kiếm nặng nhát 3: nối từ cuối nhát 2 (kiếm chúc trước ~20°) sang thế kéo kiếm ra sau (180°): đường ngắn nhất đi VÒNG DƯỚI → lưỡi
  // cắm đất, bị chặn ở vạch đất rồi bật 70° trong một nhịp → ép vòng qua trên (lệch d dương).
  const NOI_CHIEU = { 'kiem_3~kn': 1 };
  // Nhát 1 kiếm nặng KHÔNG nối góc từ thế trước (như Địa chấn, NOI_BO): nhát chỉ 0,3 giây, ★ ở 0,135 giây; nối 0,1 giây từ thế đứng (mũi
  // chếch lên trước) sang lê kiếm sau lưng (~150°) thì vòng dưới cắm đất, vòng trên thì kiếm vung qua đầu và chỉ còn 1 nhịp lê kiếm. Không
  // nối: khung 1 hiện ngay thế xách kiếm lê đất sau lưng (~4 nhịp), rồi quét sát đất ra trước, hất lên.
  const KN_KHONG_NOI = { kiem_1: 1 };
  function noiHang(o, ten, a, ve, chieu) {
    const p = o.p, r = p && NHO ? NHO.get(p) : null;
    if (!r || r.ve == null) return a;
    const t = G.time || 0, f = o.face < 0 ? -1 : 1;
    if (ve && !NOI_BO[ten] && r.ten != null && r.ten !== ten && r.f === f && t - r.t < 0.15 && t > r.t) { let d = gocGan(a, r.ve) - a; if (chieu && d * chieu < 0) d += 360 * chieu; if (Math.abs(d) > 20) r.nh = { d, t0: t, ten }; }
    const q = r.nh;
    if (!q || q.ten !== ten || r.f !== f || !(t - q.t0 < NOI_HANG)) return a;
    // lệch ban đầu d (góc cũ − góc mới) giảm dần về 0: góc mới tự quay theo ảnh thì góc vẽ vẫn liền (không đổi phía ±180° giữa chừng)
    return a + q.d * (0.5 + 0.5 * Math.cos((Math.PI * (t - q.t0)) / NOI_HANG));
  }
  // Hàng KHÔNG nối: Địa chấn và thả búa nện đất — thân ảnh khung đầu đã ở thế búa giơ sau đầu, vũ khí khớp ngay thân rồi vung qua đầu
  // (QUA bên dưới); nối 0,1 giây ở đây sẽ kéo búa đi ngược chiều cú nện.
  const NOI_BO = { db_bua: 1, bua_nen_dat: 1 };
  // Nối góc g0 → a theo tiến độ e (0..1), đường ngắn nhất như cũ; nhưng nếu giữa chừng góc đích a (tự quay theo ảnh) đi qua phía đối diện g0
  // thì "đường ngắn nhất" đổi phía và góc vẽ bật 360°×(1−e) (thấy rõ ở quét thương: +144° trong 1 nhịp) → giữ phía cũ: mỗi nhịp mới chọn
  // nhánh (−1, 0, +1 vòng) cho góc gần góc nhịp trước nhất. Nhớ theo khoá k + mã lần nối id (đổi lần nối thì về nhánh 0).
  function noiLien(r, k, id, a, g0, e) {
    const t = G.time || 0;
    let s = r[k];
    if (!s || s.id !== id) r[k] = s = { id, br: 0, x: null, t: -1 };
    const tinh = (br) => { const a0 = gocGan(a, g0) + 360 * br; return a0 + (a - a0) * e; };
    let x = tinh(s.br);
    if (s.x != null && t > s.t) {
      let bd = Math.abs(gocGan(s.x, x) - s.x);
      for (const br of [s.br - 1, s.br + 1]) { const y = tinh(br), d = Math.abs(gocGan(s.x, y) - s.x); if (d + 1 < bd) { bd = d; x = y; s.br = br; } }
    }
    if (t > s.t) { s.x = x; s.t = t; }
    return x;
  }
  // Trục nghiêng thân trên (toạ độ vẽ đã lật, điểm ảnh game tính từ chân) hoặc null.
  function trucNghieng(T, s, v, E) {
    if (!v || !v.lean || Math.abs(v.lean) < 0.05 || v.wa !== s) return null;
    if (s.eo) return E ? [E.ox + E.eA[1] / 2 - 24, E.oy + E.eA[0] / 2 - 45] : null;
    const e = eoKhung(T, s.ten, s.i);
    return e ? [e[1] / 2 - 24, e[0] / 2 - 45] : null;
  }
  const nghiengGoc = (q, P, deg, fn) => nghieng(q, P, deg, fn);
  function nghieng(q, P, deg, fn) {
    q.save(); q.translate(P[0], P[1]); q.rotate((deg * Math.PI) / 180); q.translate(-P[0], -P[1]);
    try { fn(); } finally { q.restore(); }
  }
  // ---------- VŨ KHÍ MƯỢT (bổ sung YEU-CAU zed-chay-danh 13/10 12:00: "mượt bằng hoặc hơn bản Zed cũ / G.KIEM_MUOT") ----------
  // Điểm cầm luôn là nắm tay của khung thân đang vẽ (vũ khí luôn nằm trong tay), còn GÓC vũ khí nội suy liên tục:
  //  - giữa hai khung đòn: từ góc neo khung này tới góc neo khung sau theo tiến độ u trong khung (MOC), đường ngắn nhất, chậm dần
  //    → không nhảy cóc mỗi lần thân đổi khung;
  //  - vào thế: đầu nhát, góc đi tiếp từ góc vừa vẽ (cuối nhát trước) tới đường vung trong VAO đầu đòn (chậm–nhanh–chậm, như kiemMuot
  //    chạy chém 0,33), mặt không đổi thì mới nối.
  // Chỉ đổi HÌNH (góc vẽ + vệt chém); đòn, hitAt, vùng trúng không đổi. Tắt cùng ?chaydanh=0.
  const VAO = 0.33;
  const NHO = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  const gocGan = (a, b) => a + ((((b - a) % 360) + 540) % 360) - 180; // b quy về số gần a nhất
  // Cầm vũ khí lúc đứng/đi/chạy: góc nội suy êm giữa khung này và khung sau (vòng lặp) theo tiến độ trong khung; vừa hết đòn (góc vừa vẽ
  // là của hàng đòn, cùng mặt, < 0,2 s) thì trong RA giây đầu góc đi dần từ góc cuối đòn về thế cầm (đường ngắn nhất: không lật 360°).
  const RA = 0.18;
  function gocCam(o, da, wa, n, N) {
    const i = wa.i, n2 = N[wa.i2 != null ? wa.i2 % da.so : (i + 1) % da.so]; // i2: khung kế khi phát đi đi về về (mục 17) / pha bước (mục 20)
    let a = n[2];
    if (n2) { const fr = kep(wa.fl || 0, 0, 1), e = fr * fr * (3 - 2 * fr); a = n[2] + (gocGan(n[2], n2[2]) - n[2]) * e; }
    const p = o.p, r = p && NHO ? NHO.get(p) : null, f = o.face < 0 ? -1 : 1, t = G.time || 0;
    if (r) {
      if (!r.cam && r.ve != null && r.f === f && t - r.t < 0.2) { r.raA = r.ve; r.raT = t; }
      if (r.raT != null && t - r.raT < RA && r.f === f) {
        const k = (t - r.raT) / RA, e = 0.5 - 0.5 * Math.cos(Math.PI * k);
        if (muot2()) a = noiLien(r, 'lRa', r.raT, a, r.raA, e); // cu-ti-to-muot: không bật khi đường ngắn nhất đổi phía giữa chừng
        else { const a0 = gocGan(a, r.raA); a = a0 + (a - a0) * e; }
      }
    }
    return a;
  }
  // g: độ lệch theo hướng nhắm (zed-8-huong, đã làm mượt) cộng vào góc đích TRƯỚC khi nối vào thế → nối từ góc vừa vẽ tới góc đã xoay.
  function gocMuot(o, da, wa, n, g, N) { // N: mảng neo của biến thể đang vẽ (bienThe)
    if (wa.cam) return gocCam(o, da, wa, n, N);
    g = g || 0;
    // đâm/ném: góc cuối (ảnh + lệch) không quá ±90° so với mặt → mũi không bao giờ chĩa ra sau lưng (thương 2 ảnh đã chếch -35°)
    const kd = (x) => (g && HV_DAM[wa.ten] ? kep(x, -90, 90) : x);
    if (G.CHAY_DANH_MOI === false || wa.u == null || da.lap) return kd(n[2] + g);
    const m = (da && da.moc) || (muot2() ? mocCua(wa.ten) : MOC[wa.ten]), u = wa.u, i = wa.i; // muot2: cùng mốc với khung thân (búa báo trước dùng MOC_BUA_BT)
    let a = n[2];
    const ck = m && m.length === da.so && kiemDeo(wa.ten) ? cungKiem(m, N, da, u, wa.ten) : null; // kiếm bớt cứng (1): đường cong liền cả nhát
    if (ck) a = ck.a;
    else if (m && m.length === da.so && i + 1 < da.so && N[i + 1]) {
      const fr = phanGoc(da, m, i, u), e = fr * fr * (3 - 2 * fr);
      a = n[2] + (buocGoc(wa.ten, i, n[2], N[i + 1][2]) - n[2]) * e;
    }
    a = kd(a + g);
    const p = o.p, r = p && NHO ? NHO.get(p) : null, f = o.face < 0 ? -1 : 1;
    if (r && p.lastAtk != null) {
      if (r.id !== p.lastAtk) { r.id = p.lastAtk; r.dau = r.ve != null && r.f === f && (G.time || 0) - r.t < 0.2 ? r.ve : null; }
      const vao = (da.kn && KN_NHIP && VAO_KN[wa.ten]) || VAO;
      if (r.dau != null && u < vao && !(da.kn && KN_KHONG_NOI[wa.ten])) {
        const k = u / vao, e = 0.5 - 0.5 * Math.cos(Math.PI * k);
        if (muot2() && m && m.length === da.so && !(g && HV_DAM[wa.ten])) {
          // cu-ti-to-muot: đi trên đường vung LIỀN (cộng dồn góc khung này → khung sau, không quy về ±180°); góc đầu = góc vừa vẽ, quy về
          // phía gần góc đường vung ở CUỐI đoạn nối (u = VAO) → không đổi phía giữa chừng (quét thương trước bật +144° trong 1 nhịp).
          const aU = duongVung(m, N, da, u, wa.ten) + g, aV = duongVung(m, N, da, vao, wa.ten) + g, ch = da.kn ? NOI_CHIEU[wa.ten + '~kn'] : 0;
          let a0 = gocGan(aV, r.dau);
          if (ch && (a0 - aV) * ch < 0) a0 += 360 * ch; // kiếm nặng nhát 3: nối từ nhát trước VÒNG QUA TRÊN (không cắm đất), như noiHang
          a = a0 + (aU - a0) * e;
        } else { const a0 = gocGan(a, r.dau); a = a0 + (a - a0) * e; }
      }
    }
    return a;
  }
  // ---------- KIẾM BỚT CỨNG (17/10/2026, docs/review/ke-hoach-cai-thien/kiem-bot-cung/bao-cao.md) — CHỈ HÌNH ----------
  // Chủ game thấy kiếm 1/2/3 "còn cứng": chỉ tay vung, góc kiếm đi chậm–nhanh–chậm TRONG TỪNG KHUNG nên kiếm khựng lại ở mỗi khung (như
  // các tư thế chụp rời), thân đứng im, mũi kiếm xuyên đất. Ở đây (cờ G.KIEM_DEO, tắt ?kiemmuot=0):
  //  (1) góc kiếm = MỘT đường cong liền qua cả nhát (nội suy Hermite giữ đơn điệu qua các góc neo, cộng dồn đúng chiều vung như duongVung):
  //      đầu nhát chậm, nhanh nhất ngay trước khung ★, chậm dần lúc thu; không dừng ở mỗi khung. Mốc góc: giữa mỗi khung (45%), khung ngay
  //      trước ★ ở 70% (giữ thế giơ lâu hơn rồi bổ nhanh), khung ★ ở 12% đầu, khung cuối ở 75% (thu về chậm).
  //  (2) thân có lực: thân trên nghiêng quanh eo (ngả ra sau lúc lấy đà, đổ tới lúc ★), nhún xuống ≤ 1,5 điểm ảnh lúc lấy đà, cả người
  //      nhích tới ≤ 2,5 điểm ảnh lúc ★ rồi trả về (chỉ hình — vị trí, hộp va chạm, vùng trúng không đổi).
  //  (3) mũi kiếm không xuống dưới vạch đất: góc neo kiếm 1 khung 4 (60° → 35°), kiếm 3 khung 5–6 (120° / 110° → 40° / 32°), rồi kẹp theo
  //      độ dài lưỡi từng cấp và điểm cầm từng khung (kẹp về phía gần: mũi chúc trước thì nằm sát đất phía trước, chúc sau thì phía sau).
  // (Sửa 17/10: game CÓ dừng hình khi trúng theo vũ khí — js/fx.js khungVk, 45–110 ms; phiên này không đụng tới nó.) Thời lượng đòn,
  // mốc ★ (u 0,45), sát thương không đổi.
  if (G.KIEM_DEO === undefined) G.KIEM_DEO = !/[?&]kiemmuot=0(&|$)/.test(QS);
  const KIEM_HANG = { kiem_1: 1, kiem_2: 1, kiem_3: 1 };
  const kiemDeo = (ten) => G.KIEM_DEO !== false && G.CHAY_DANH_MOI !== false && !!KIEM_HANG[ten];
  const GOC_KIEM = { 'kiem_1~16': { 3: 35 }, 'kiem_3~16': { 4: 40, 5: 32 } }; // (3) góc neo mới (độ, dương = chúc xuống)
  // (2) thân theo tiến độ u: [u, giá trị]; lean = độ (dương = đổ tới), wx = điểm ảnh game tới trước, uy = thân trên hạ xuống (âm = nhổm)
  const THAN_KIEM = {
    kiem_1: { lean: [[0, 0], [0.15, -3], [0.33, -2], [0.47, 6], [0.7, 5], [0.9, 2], [1, 0]], wx: [[0, 0], [0.15, -0.5], [0.47, 1.5], [0.72, 1.5], [1, 0]], uy: [[0, 0], [0.15, 1], [0.33, 0], [0.5, 0.5], [0.75, 0.5], [1, 0]] },
    kiem_2: { lean: [[0, 0], [0.15, 3], [0.47, 4], [0.65, -3], [0.85, -1], [1, 0]], wx: [[0, 0], [0.15, -0.5], [0.47, 1], [0.7, 0.5], [1, 0]], uy: [[0, 0], [0.15, 1], [0.47, 0], [0.65, -0.5], [1, 0]] },
    kiem_3: { lean: [[0, 0], [0.12, -5], [0.3, -2], [0.47, 8], [0.65, 7], [0.88, 3], [1, 0]], wx: [[0, 0], [0.12, -1], [0.47, 2.5], [0.7, 2], [1, 0]], uy: [[0, 0], [0.12, 1.5], [0.3, 0.5], [0.47, 1], [0.7, 1], [1, 0]] },
  };
  // Kiếm nặng 17/10 (hàng kiem_N~kn): ảnh gen đã tự có dáng người (gập gối, đổ người) → nghiêng / nhích / nhún NHẸ hơn hàng cũ, đúng chiều
  // từng nhát: nhát 1 lê kiếm hơi khom rồi ngả ra sau khi hất lên; nhát 2 nhổm lên lúc giơ cao, đổ tới + hạ người khi bổ; nhát 3 xoay
  // người ra sau rồi đổ tới khi chém ngang. Mọi đường về 0 ở cuối nhát (nối nhát kế / về đứng không giật).
  const THAN_KN = {
    kiem_1: { lean: [[0, 0], [0.3, 2], [0.47, -3], [0.75, -2], [1, 0]], wx: [[0, 0], [0.3, 0.5], [0.47, 1.5], [0.8, 1], [1, 0]], uy: [[0, 0], [0.3, 1], [0.47, -0.5], [1, 0]] },
    kiem_2: { lean: [[0, 0], [0.3, -2], [0.47, 4], [0.75, 3], [1, 0]], wx: [[0, 0], [0.3, -0.5], [0.47, 2], [0.75, 2], [1, 0]], uy: [[0, 0], [0.3, -0.5], [0.47, 1.5], [0.75, 1], [1, 0]] },
    kiem_3: { lean: [[0, 0], [0.3, -2], [0.47, 4], [0.7, 3], [1, 0]], wx: [[0, 0], [0.3, -0.5], [0.47, 2], [0.7, 1.5], [1, 0]], uy: [[0, 0], [0.3, 0.5], [0.47, 0.5], [1, 0]] },
  };
  // Hermite đơn điệu (Fritsch–Carlson) qua các điểm (ts, as): đạo hàm hai đầu = 0 (vào chậm, ra chậm), giữa không đổi chiều → không vọt.
  function hermite(ts, as, x) {
    const n = ts.length;
    if (x <= ts[0]) return as[0];
    if (x >= ts[n - 1]) return as[n - 1];
    let k = 0; while (k < n - 2 && x > ts[k + 1]) k++;
    const d = (i) => (as[i + 1] - as[i]) / Math.max(1e-6, ts[i + 1] - ts[i]);
    const tan = (i) => {
      if (i <= 0 || i >= n - 1) return 0;
      const d0 = d(i - 1), d1 = d(i), h0 = ts[i] - ts[i - 1], h1 = ts[i + 1] - ts[i];
      if (d0 * d1 <= 0) return 0;
      const w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
      return (w1 + w2) / (w1 / d0 + w2 / d1);
    };
    const h = ts[k + 1] - ts[k], t = (x - ts[k]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * as[k] + (t3 - 2 * t2 + t) * h * tan(k) + (-2 * t3 + 3 * t2) * as[k + 1] + (t3 - t2) * h * tan(k + 1);
  }
  const theoU = (bang, u) => hermite(bang.map((r) => r[0]), bang.map((r) => r[1]), kep(u, 0, 1));
  // (1) Góc kiếm liền tại tiến độ uu. Trả { a }.
  function cungKiem(m, N, da, uu, ten) {
    const so = da.so, sua = GOC_KIEM[da._khoa] || GOC_KIEM[da.eo16] || null, h = m.indexOf(0.45);
    const ts = [], as = [];
    let acc = null;
    if (da.kn && KN_NHIP && KN_NUT[ten]) { // đòn kiếm nặng 17/10: nút riêng (KN_NUT)
      const goc = [];
      for (let j = 0; j < so; j++) { if (!N[j]) { goc.push(acc); continue; } const g = sua && sua[j] != null ? sua[j] : N[j][2]; acc = acc == null ? g : buocGoc(ten + '~kn', j - 1, acc, g); goc.push(acc); }
      for (const r of KN_NUT[ten]) { if (goc[r[1]] == null) continue; ts.push(r[0]); as.push(goc[r[1]] + (r[2] || 0)); }
      return ts.length ? { a: hermite(ts, as, uu) } : null;
    }
    for (let j = 0; j < so; j++) {
      if (!N[j]) continue;
      const g = sua && sua[j] != null ? sua[j] : N[j][2];
      acc = acc == null ? g : buocGoc(da.kn ? ten + '~kn' : ten, j - 1, acc, g); // kiếm nặng: chiều quay riêng (QUA)
      const L = (j + 1 < so ? m[j + 1] : 1) - m[j];
      // kiếm nặng: ★ ở khung 2 (nhát 2, 3: khung đầu là thế giơ cao / kéo ra sau) → GIỮ thế khung đầu tới 70% của nó rồi mới vung
      // (không thì kiếm rời thế ngay từ u 0, mất nhịp lấy đà).
      if (j === 0 && h === 1 && da.kn) { ts.push(0); as.push(acc); ts.push(m[1] * 0.7); as.push(acc); continue; }
      ts.push(j === 0 ? 0 : m[j] + L * (j === h ? 0.12 : j === h - 1 ? 0.7 : j === so - 1 ? 0.75 : 0.45)); as.push(acc);
    }
    if (!ts.length) return null;
    return { a: hermite(ts, as, uu) };
  }
  // (3) Kẹp góc a (đã cộng nghiêng) để mũi (cách điểm cầm L, điểm ảnh game) không thấp hơn vạch đất (y = 0 ở chân). gy: điểm cầm.
  function kepDat(a, gy, L) {
    const k = (-0.5 - gy) / L;
    if (!(L > 0) || k >= 1 || k <= 0) return a;
    const amin = (Math.asin(k) * 180) / Math.PI, y = ((a % 360) + 360) % 360;
    if (y <= amin || y >= 180 - amin) return a;
    return a + ((y < 90 ? amin : 180 - amin) - y);
  }
  // Kiếm nặng: lúc lê kiếm (nhát 1 khung 1–2, u ≤ 0,3) và mũi kiếm sát đất (nhát 2 khung 7, u ≥ 0,72) neo đặt cho lưỡi DÀI NHẤT vừa chạm
  // đất → lưỡi cấp thấp (ngắn hơn tới 7 điểm ảnh) lơ lửng trên đất. Ở đây: góc đang chúc xuống thì hạ / nâng cho mũi nằm đúng vạch đất
  // theo độ dài lưỡi cấp đang cầm (như kepDat nhưng hai phía). Kiếm đang chĩa lên (lúc nối từ thế đứng) thì để nguyên.
  const DINH_DAT = { kiem_1: [0, 0.3], kiem_2: [0.72, 1] };
  // KIẾM VUÔNG 17/10: đầu kiếm là cạnh vuông → góc thấp nhất của cạnh đầu (trên hoặc dưới trục cán, tuỳ chiều kiếm) mới là "mũi" chạm đất.
  // Chặn / đặt theo góc đó: dời góc pha φ = atan(lệch / L), độ dài √(L² + lệch²) (lệch = cạnh đầu so với trục điểm cầm, z.kv.mui).
  // Kiếm vuông: góc đầu vuông thấp nhất nằm dưới điểm cuối trục cán bao nhiêu (điểm ảnh game) ở góc a; 0 khi không phải kiếm vuông.
  function goc2Vuong(B, cap, a) {
    const K = B.kv && SC.kiemVuong && SC.kiemVuong(), m = K && K.mui && K.mui[cap], g = B.cam && B.cam[cap];
    if (!m || !g) return 0;
    const c = Math.cos((a * Math.PI) / 180);
    return Math.max(0, (m[1] - g[1]) * B.tl * c, -(g[1] - m[0]) * B.tl * c);
  }
  function datGoc(f, a, gy, L, B, cap) {
    const K = B.kv && SC.kiemVuong && SC.kiemVuong(), m = K && K.mui && K.mui[cap], g = B.cam && B.cam[cap];
    if (!m || !g) return f(a, gy, L);
    const r = (a * Math.PI) / 180, wb = (m[1] - g[1]) * B.tl, wt = -(g[1] - m[0]) * B.tl;
    if (f === kepDat) { // vùng góc cấm của cả cạnh đầu = hợp vùng cấm hai góc (mỗi góc như kepDat) → đẩy về mép gần nhất của vùng hợp
      let lo = 1e9, hi = -1e9;
      for (const w of [wb, wt]) {
        const Le = Math.hypot(L, w), k = (-0.5 - gy) / Le;
        if (!(Le > 0) || k >= 1 || k <= 0) continue;
        const ph = (Math.atan2(w, L) * 180) / Math.PI, amin = (Math.asin(k) * 180) / Math.PI;
        lo = Math.min(lo, amin - ph); hi = Math.max(hi, 180 - amin - ph);
      }
      if (!(hi > lo)) return a;
      const y = ((a % 360) + 360) % 360, y2 = y > hi + 90 ? y - 360 : y; // góc quy về quanh vùng cấm
      if (y2 <= lo || y2 >= hi) return a;
      return a + (y2 - lo < hi - y2 ? lo - y2 : hi - y2);
    }
    const w = L * Math.sin(r) + wb * Math.cos(r) >= L * Math.sin(r) + wt * Math.cos(r) ? wb : wt;
    const ph = (Math.atan2(w, L) * 180) / Math.PI;
    return f(a + ph, gy, Math.hypot(L, w)) - ph;
  }
  function dinhDat(a, gy, L) {
    const k = (-0.5 - gy) / L;
    if (!(L > 0) || k >= 1 || k <= 0) return a;
    const amin = (Math.asin(k) * 180) / Math.PI, y = ((a % 360) + 360) % 360;
    if (y <= 0 || y >= 180) return a;
    return a + ((y < 90 ? amin : 180 - amin) - y);
  }
  // (2) Thân: { lean, wx, uy } ở tiến độ u của hàng ten (null: không áp).
  function thanKiem(ten, u, da, p) {
    const B = (da && da.kn ? THAN_KN : THAN_KIEM)[ten];
    if (!B || !kiemDeo(ten) || u == null) return null;
    const r = { lean: theoU(B.lean, u), wx: theoU(B.wx, u), uy: theoU(B.uy, u) };
    if (da && da.kn && ten === 'kiem_3' && KN_GHIM && ghimCua(p)) { // KN_GHIM: ghìm lại sau khi chạy (cộng thêm, về 0 ở u 0,3)
      r.lean += theoU(GHIM.lean, u); r.wx += theoU(GHIM.wx, u); r.uy += theoU(GHIM.uy, u);
    }
    return r;
  }
  // KN_GHIM: nhát 3 kiếm nặng bắt đầu lúc ĐANG CHẠY (nhớ theo nhát, P.lastAtk) → 4 nhịp đầu (u ≤ 0,145 ≈ 4/28) ngả ra sau 6°, thân trên
  // hạ 1,5 điểm ảnh, người trượt tới 2 điểm ảnh theo đà rồi về chỗ (u 0,3). Chỉ hình; vị trí thật, vùng trúng không đổi.
  const GHIM = {
    lean: [[0, 0], [0.04, -6], [0.145, -4], [0.3, 0]],
    wx: [[0, 0], [0.07, 1.5], [0.145, 2], [0.3, 0]],
    uy: [[0, 0], [0.05, 1.5], [0.145, 1.5], [0.3, 0]],
  };
  const GHIM_NHO = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function ghimCua(p) {
    if (!p || !GHIM_NHO || p.lastAtk == null) return false;
    let r = GHIM_NHO.get(p);
    if (!r || r.id !== p.lastAtk) GHIM_NHO.set(p, (r = { id: p.lastAtk, chay: !!p.moving }));
    return r.chay;
  }
  // Góc đường vung liền tại tiến độ uu (mốc m của hàng, neo N): góc khung đầu, cộng dồn bước ngắn nhất sang từng khung kế, nội suy như gocMuot.
  function duongVung(m, N, da, uu, ten) {
    if (kiemDeo(ten)) { const ck = cungKiem(m, N, da, uu, ten); if (ck) return ck.a; }
    let acc = N[0] ? N[0][2] : 0, j = 0;
    while (j < da.so - 1 && uu + 1e-6 >= m[j + 1] && N[j + 1]) { acc = buocGoc(ten, j, acc, N[j + 1][2]); j++; }
    if (j + 1 < da.so && N[j + 1]) { const fr = phanGoc(da, m, j, uu), e2 = fr * fr * (3 - 2 * fr); acc += (buocGoc(ten, j, acc, N[j + 1][2]) - acc) * e2; }
    return acc;
  }
  // cu-ti-to-muot: chiều quay ÉP giữa khung j → j+1 (+1 = theo chiều kim đồng hồ trên màn = vòng QUA ĐẦU khi mặt phải). Đường ngắn nhất
  // của búa nện (170° → 40°), nện đất, Địa chấn (170° → 20° / 60°) đi VÒNG DƯỚI: đầu búa quét qua bụng / chân trước khi chạm đất → ép
  // vòng qua đầu như ảnh vẽ (giơ cao → nện xuống).
  // Kiếm nặng nhát 3 (kiem_3~kn): khung 8 kéo kiếm ra sau (180°) → ★ 9 chém ngang (0°): đường ngắn nhất chưa rõ chiều (≈ 180°); vòng DƯỚI
  // thì lưỡi cắm xuống đất (bị chặn ở vạch đất rồi bật qua) → ép vòng qua đầu (+1).
  const QUA = { bua_nen: { 1: 1 }, bua_nen_dat: { 0: 1 }, db_bua: { 0: 1 }, 'kiem_3~kn': { 0: 1 } };
  function buocGoc(ten, j, a, b) {
    let d = gocGan(a, b) - a;
    const sg = muot2() && QUA[ten] && QUA[ten][j];
    if (sg && d * sg < 0) d += 360 * sg;
    return a + d;
  }
  // Tiến độ nội suy góc trong khung i (0..1). muot2: khung DÀI (giữ thế, như búa giơ cao 0,24 giây) thì vũ khí đứng yên, chỉ quay
  // trong 0,09 giây cuối khung → giữ thế rõ rồi mới vung (trước: búa trôi dần xuống suốt lúc giữ). Khung ngắn: như cũ (cả khung).
  const QUAY_CUOI = 0.09;
  function phanGoc(da, m, i, u) {
    const L = Math.max(1e-6, m[i + 1] - m[i]), giay = (da.giay || 0.3) * L;
    if (muot2() && giay > QUAY_CUOI * 1.4) { const w = (QUAY_CUOI / giay) * L; return kep((u - (m[i + 1] - w)) / w, 0, 1); }
    return kep((u - m[i]) / L, 0, 1);
  }
  function ghiGoc(o, a, cam, ten) { // sau khi vẽ: nhớ góc vừa vẽ (nối vào thế nhát sau; cam = góc của hàng cầm đứng/đi/chạy; ten = hàng neo)
    const p = o.p; if (!p || !NHO) return;
    let r = NHO.get(p); if (!r) NHO.set(p, (r = { id: p.lastAtk, dau: null, ve: null, t: 0, f: 1 }));
    r.ve = a; r.t = G.time || 0; r.f = o.face < 0 ? -1 : 1; r.cam = !!cam; r.ten = ten;
  }
  function veVk(c, V, v) {
    if (v.nt) veNamTay(c, V, v, 'sau'); // nắm tay từ ảnh: lòng bàn tay nằm SAU cán
    const da = v.da, n = v.n, a = anhVk(V, da.vk, v.cap, v.he, v.w), g = v.B.cam[v.cap], F = v.B.tl;
    c.save();
    c.translate(n[0] / 2 - 24, n[1] / 2 - 45); // he_neo "nguon-96": chia 2 ra điểm ảnh game, trừ goc (24,45) → tính từ chân
    c.rotate(((v.ang != null ? v.ang : n[2]) * Math.PI) / 180); // góc độ: 0 mũi chỉ sang phải, dương chúc xuống (v.ang: góc đã nội suy, gocMuot)
    c.scale(F * (v.co > 0 && v.co < 1 ? v.co : 1), F); // v.co: lưỡi ngắn lại theo phối cảnh (KN_MUOT, quetDat)
    // 15/10 viền + hào quang theo bậc ép đồ, ánh lướt theo cấp mài (js/vien_vk.js; ?vienvk=0 tắt): vẽ cùng hệ toạ độ đã xoay/lật của ảnh
    const VV = G.vienVk, r0 = VV && VV.co(v.w) ? V.tep.vk[da.vk][v.cap] : null, kv = r0 ? 'zed-vk:' + da.vk + v.cap : null;
    if (r0) { try { VV.truoc(c, v.w, V.img, r0[0], r0[1], r0[2], r0[3], kv, -g[0], -g[1], 1 / F); } catch (e) { ghiLoi(e); } }
    if (v.mo != null && v.mo < 1) { const ga = c.globalAlpha; c.globalAlpha = ga * v.mo; veNho(c, a, -g[0], -g[1]); c.globalAlpha = ga; } // (f) đổi vũ khí: hiện dần
    else veNho(c, a, -g[0], -g[1]);
    if (r0) { try { VV.sau(c, v.w, V.img, r0[0], r0[1], r0[2], r0[3], kv, -g[0], -g[1], 1 / F); } catch (e) { ghiLoi(e); } }
    c.restore();
  }
  // LỚP NGÓN (nắm chuôi): nắm ngón pixel (zed-vk 'ngon', đơn vị ô 96 → vẽ ×0,5) xoay cùng vũ khí, ôm ngang cán ở điểm cầm; tay thứ hai
  // (neo[4], ô 96) chiếu lên trục cán nếu còn nằm trên cán (lệch ≤ 1,5 điểm ảnh game — nhắm lệch nhiều thì thôi). Vẽ SAU lớp nắm tay.
  // Vũ khí sau người (neo sau = 1) thì không vẽ (nắm tay có thể khuất sau đầu/thân).
  // NẮM TAY TỪ ẢNH (bao-cao-2): { D: cỡ theo loại vũ khí, i: góc ảnh gần nhất, d2: vị trí dọc cán của tay thứ hai | null, het: tay thứ hai lệch khỏi cán } hoặc null
  // (cờ ?ngonanh=0, thiếu ảnh, biến thể cũ, vũ khí sau người → lớp ngón tự vẽ / như cũ).
  function namTayCua(V, v) {
    const NT = V && V.tep.nam_tay, n = v.n;
    const D = NT && NT.co && String(NT.co[v.da.vk]);
    if (G.NGON_ANH === false || !D || !NT.goc || !NT.sau[D] || !NT.truoc[D] || !v.B.nam || n[3] || !V.tep.ngon || !V.tep.ngon[v.da.vk]) return null;
    const ang = v.ang != null ? v.ang : n[2];
    let i = 0, best = 1e9;
    for (let k = 0; k < NT.goc.length; k++) { const d = Math.abs(gocGan(ang, NT.goc[k]) - ang); if (d < best) { best = d; i = k; } }
    let d2 = null, het = false;
    const t2 = n[4];
    if (t2) {
      const r = (ang * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r), dx = (t2[0] - n[0]) / 2, dy = (t2[1] - n[1]) / 2;
      if (Math.abs(-dx * si + dy * co) <= 1.5) d2 = dx * co + dy * si; else het = true;
    }
    return { i, d2, het, D };
  }
  // Vẽ một lớp ('sau' | 'truoc') nắm tay từ ảnh ở tay cầm (+ tay thứ hai nếu còn trên cán): tâm lỗ đặt lên trục cán (lệch theo bề dày cán như
  // lớp ngón cũ), xoay phần góc còn lệch giữa vũ khí và ảnh đã chọn. Đơn vị ảnh ô 96 → vẽ ×0,5.
  function veNamTay(c, V, v, lop) {
    const NT = V.tep.nam_tay, r = NT[lop][v.nt.D][v.nt.i], n = v.n, ang = v.ang != null ? v.ang : n[2], lech = (V.tep.ngon[v.da.vk][v.cap] || [])[4] || 0;
    const gA = (gocGan(ang, NT.goc[v.nt.i]) * Math.PI) / 180; // trục cổ tay → nắm của ảnh: sau khi xoay theo cán, xoay ngược gA → còn lệch ang − góc ảnh
    c.save();
    c.translate(n[0] / 2 - 24, n[1] / 2 - 45);
    c.rotate((ang * Math.PI) / 180);
    const ve1 = (d) => { c.save(); c.translate(d, lech); c.rotate(-gA); c.drawImage(V.img, r[0], r[1], r[2], r[3], -r[4] / 2, -r[5] / 2, r[2] / 2, r[3] / 2); c.restore(); };
    ve1(0);
    if (v.nt.d2 != null) ve1(v.nt.d2);
    c.restore();
  }
  // Có vẽ hàng nắm tay cắt từ thân (hang_tay) không: nắm tay từ ảnh đã thay nó, trừ khi tay thứ hai lệch khỏi cán (nắm tay thân đè lên cán như cũ).
  const coHt = (v) => v.B.ht != null && (!v.nt || v.nt.het);
  function veNgon(c, V, v) {
    if (v.nt) { veNamTay(c, V, v, 'truoc'); return; } // nắm tay từ ảnh: ngón + ngón cái phủ lên cán
    const n = v.n, M = V.tep.ngon;
    if (!v.B.nam || n[3] || !M || !M[v.da.vk]) return;
    const r = M[v.da.vk][v.cap];
    if (!r) return;
    const ang = ((v.ang != null ? v.ang : n[2]) * Math.PI) / 180, co = Math.cos(ang), si = Math.sin(ang);
    c.save();
    c.translate(n[0] / 2 - 24, n[1] / 2 - 45);
    c.rotate(ang);
    const ve1 = (d) => c.drawImage(V.img, r[0], r[1], r[2], r[3], d - r[2] / 4, r[4] - r[3] / 4, r[2] / 2, r[3] / 2);
    ve1(0);
    const t2 = n[4];
    if (t2) {
      const dx = (t2[0] - n[0]) / 2, dy = (t2[1] - n[1]) / 2;
      if (Math.abs(-dx * si + dy * co) <= 1.5) ve1(dx * co + dy * si);
    }
    c.restore();
  }

  // Chân sạch (chan-di-danh): phần từ hàng y0 xuống của khung (hang, i), chỉ giữ các khối điểm ảnh NỐI VỚI BÀN CHÂN (bỏ bàn tay / ống tay
  // đung đưa dưới đai của khung đi / chạy — thân trên khung đòn đã có tay riêng). Nhớ theo tấm + khung. Lỗi đọc ảnh → null (vẽ thẳng).
  const CHAN_SACH = new Map();
  function chanSach(T, hang, i, y0) {
    if (typeof document === 'undefined') return null;
    const k = (T._ma || '') + '|' + hang + '|' + i + '|' + y0;
    if (CHAN_SACH.has(k)) return CHAN_SACH.get(k);
    let cv = null;
    try {
      const h = 96 - y0;
      cv = document.createElement('canvas'); cv.width = 96; cv.height = h;
      const q = cv.getContext('2d');
      veT(q, T, T.img, i * 96, hang * 96 + y0, 96, h, 0, 0, 96, h);
      const d = q.getImageData(0, 0, 96, h), px = d.data, lab = new Int32Array(96 * h), giu = new Uint8Array(96 * h + 1);
      let n = 0, goc = 0;
      const st = [];
      for (let p = 0; p < 96 * h; p++) if (px[p * 4 + 3] > 0) goc++;
      // bàn tay (màu da) ở 12 hàng đầu dưới đai: tay đung đưa sát hông của khung chạy — xoá cả viền 2 điểm ảnh quanh (băng cổ tay)
      // trước khi tìm khối nối bàn chân
      const H12 = Math.min(h, 12), da = new Uint8Array(96 * H12);
      for (let p = 0; p < 96 * H12; p++) {
        const r = px[p * 4], g = px[p * 4 + 1], b = px[p * 4 + 2];
        if (px[p * 4 + 3] > 0 && r > 140 && g >= 0.48 * r && g <= 0.74 * r && b >= 0.28 * r && b <= 0.56 * r) da[p] = 1; // da Cu Tí (không ăn đai vàng / giáp da / áo trắng của các bộ khác)
      }
      for (let p = 0; p < 96 * H12; p++) {
        const x = p % 96, y = (p / 96) | 0;
        let gan = 0;
        for (let dy = -2; dy <= 2 && !gan; dy++) for (let dx = Math.abs(dy) - 2; dx <= 2 - Math.abs(dy) && !gan; dx++) {
          const x2 = x + dx, y2 = y + dy;
          if (x2 >= 0 && x2 < 96 && y2 >= 0 && y2 < H12 && da[y2 * 96 + x2]) gan = 1;
        }
        if (gan) px[p * 4 + 3] = 0;
      }
      for (let p0 = 0; p0 < 96 * h; p0++) {
        if (lab[p0] || px[p0 * 4 + 3] === 0) continue;
        lab[p0] = ++n; st.push(p0);
        while (st.length) {
          const p = st.pop(), x = p % 96, y = (p / 96) | 0;
          const lan = (x2, y2) => { if (x2 < 0 || x2 > 95 || y2 < 0 || y2 >= h) return; const p2 = y2 * 96 + x2; if (!lab[p2] && px[p2 * 4 + 3] > 0) { lab[p2] = n; st.push(p2); } };
          lan(x - 1, y); lan(x + 1, y); lan(x, y - 1); lan(x, y + 1);
        }
      }
      const yd = 89 - y0; // hàng bàn chân (đáy chân ở hàng nguồn 89)
      for (let y = Math.max(0, yd - 3); y <= Math.min(h - 1, yd + 1); y++) for (let x = 0; x < 96; x++) { const l = lab[y * 96 + x]; if (l) giu[l] = 1; }
      let con = 0;
      for (let p = 0; p < 96 * h; p++) { if (lab[p] && !giu[lab[p]]) px[p * 4 + 3] = 0; if (px[p * 4 + 3] > 0) con++; }
      if (con < 0.6 * goc) return CHAN_SACH.set(k, null), null; // bỏ quá nhiều (bàn chân không chạm hàng đáy…): vẽ thẳng như ảnh
      q.putImageData(d, 0, 0);
    } catch (e) { cv = null; }
    CHAN_SACH.set(k, cv);
    return cv;
  }
  let tam = null; // canvas phụ khi phải nhuộm cả hình (trúng đòn, băng, độc)
  function ve(c, o) {
    const T = layThan();
    if (!T) return false;
    const D = T.tep, s = chon(o, D), a = D.dong_tac[s.ten];
    if (!a) return false;
    sVe = s; tVe = T;
    anhTo(T); // do-net: bắt đầu tải bản to ngay lần vẽ đầu (làng / chân dung) để vào trận là có
    if (G.NET > 2) anhNet(T, G.NET); // nét cao (?netcao=3|4): bản ảnh đúng nét canvas, chỉ tải khi bật
    const V = lay('zed-vk'), v = V ? vkCua(o, D, s, T, true) : null;
    // Hàng tay không (ném phi tiêu, đấm): không có vũ khí để xoay → xoay cánh tay duỗi (TAY) + nghiêng thân trên như đòn đâm.
    let Hb = null;
    if (!v && !s.theo && !s.cam && HV_DAM[s.ten]) { Hb = huongCua(o, T, s); if (Hb) Hb = hvMuot(Hb); }
    if (!(v && v.hv) && !Hb) hvNghi(o);
    if (v) { ghiGoc(o, v.ang, v.cam, v.wa.ten); v.nt = namTayCua(V, v); }
    const Cc = caoCua(T, s, v), TI = Cc ? Cc.img : T.img, AH = Cc ? Cc.hang : a.hang, HT = Cc ? Cc.ht : v && v.B.ht; // thương: tay trái nâng cao
    const E = s.eo ? eoTinh(T, s, o) : null;
    // Nghiêng thân trên quanh eo (đâm/ném nhắm gần thẳng lên/xuống, zed-8-huong): N = trục eo, null = không nghiêng (như cũ).
    const N = trucNghieng(T, s, v || (Hb ? { lean: Hb.lean, wa: s } : null), E), lean = v ? v.lean : Hb ? Hb.lean : 0;
    const tay = Hb && Math.abs(Hb.g) > 0.05 ? tayKhung(T, s.ten, s.i) : null, gTay = Hb ? Hb.g : 0;
    // Vẽ phần trên (hàng nguồn 0..h) của khung thân dời (ox, oy); có tay thì cánh tay duỗi được khoét ra và vẽ lại xoay quanh gốc tay.
    const veTren = (q, h, ox, oy) => {
      const ve0 = () => veT(q, T, TI, s.i * 96, AH * 96, 96, h, -24 + ox, -45 + oy, 48, h / 2);
      if (!tay) { ve0(); return; }
      const x0 = tay[2] / 2 - 24 + ox, y0 = tay[3] / 2 - 45 + oy, w = (tay[4] - tay[2]) / 2, hh = (tay[5] - tay[3]) / 2;
      q.save(); q.beginPath(); q.rect(-24 + ox, -45 + oy, 48, h / 2); q.rect(x0, y0, w, hh); q.clip('evenodd'); ve0(); q.restore();
      nghieng(q, [tay[0] / 2 - 24 + ox, tay[1] / 2 - 45 + oy], gTay, () => { q.beginPath(); q.rect(x0, y0, w, hh); q.clip(); ve0(); });
    };
    if (s.eo && E && E.dai) {
      // Ghép ở đai (chan-di-danh): chân = khung đi / chạy từ hàng đáy đai yR (đã bỏ tay đung đưa, mảnh không nối bàn chân), thân trên =
      // khung đòn hàng 0..yA (tới đáy đai) dời (ox, oy) cho đai trùng đai. Không co giãn hàng nào.
      const aC = D.dong_tac[s.eo.chan] || D.dong_tac.chay, yA = E.yA + 1, yR = E.yR;
      const lopDai = (q) => {
        const xoay = (fn) => (N ? nghieng(q, N, lean, fn) : fn());
        const vk = () => { q.save(); q.translate(E.ox, E.oy); veVk(q, V, v); q.restore(); };
        if (v && v.n[3]) xoay(vk);
        const L = chanSach(T, aC.hang, s.eo.i, yR);
        if (L) q.drawImage(L, 0, 0, 96, 96 - yR, -24, -45 + yR / 2, 48, (96 - yR) / 2);
        else veT(q, T, T.img, s.eo.i * 96, aC.hang * 96 + yR, 96, 96 - yR, -24, -45 + yR / 2, 48, (96 - yR) / 2);
        // đang nghiêng: lót dải đai (4 hàng nguồn ngay trên đáy đai, không xoay) để chỗ nối không hở
        if (N) veT(q, T, TI, s.i * 96, AH * 96 + yA - 4, 96, 4, -24 + E.ox, -45 + E.oy + (yA - 4) / 2, 48, 2);
        xoay(() => {
          veTren(q, yA, E.ox, E.oy);
          if (v && !v.n[3]) vk();
          if (v && v.B.ht != null) {
            if (coHt(v)) veT(q, T, TI, v.wa.i * 96, HT * 96, 96, yA, -24 + E.ox, -45 + E.oy, 48, yA / 2);
            q.save(); q.translate(E.ox, E.oy); veNgon(q, V, v); q.restore();
          }
        });
      };
      return veLop(c, o, lopDai);
    }
    if (s.eo && E && E.moi) {
      // Ghép giữa đùi (zed-eo-sua): nửa trên = khung đòn hàng 0..cA, nửa dưới = khung chạy từ hàng cR (lấn 1 hàng, bị nửa trên đè).
      const aC = D.dong_tac.chay, cA = E.eA[2], cR = E.eR[2], yA = cA + 1, yB = E.eA[0] + 1, K = E.K, S = G.ZED_EO.vung_noi || 5;
      const dx = E.eR[1] - E.eA[1];
      // một hàng nguồn sy (cột x0 = toạ độ cột khung chạy của cột 0), kéo theo K với mức t (0 = giữ nguyên, 1 = khớp hẳn mép đích)
      const hang = (q, sx, sy, x0, yD, t, im) => {
        im = im || T.img;
        if (!K || !(t > 0)) { veT(q, T, im, sx, sy, 96, 1, x0 / 2 - 24, yD, 48, 0.5); return; }
        const tl = K.l + t * (K.L - K.l), tr = K.r + t * (K.R - K.r), k = (tr - tl + 1) / (K.r - K.l + 1);
        veT(q, T, im, sx, sy, 96, 1, (tl + (x0 - K.l) * k) / 2 - 24, yD, 48 * k, 0.5);
      };
      const tKeo = (k) => (k >= 0 && k < S ? (S - k) / S : 0); // k = số hàng tính từ mép nối
      // đang nghiêng: chỉ phần từ đai trở lên xoay, dải hông + đùi trên (dưới đai) đứng yên như chân; không nghiêng: vẽ liền tới vùng kéo
      const yT = N ? Math.min(yB, yA) : K && K.tren ? Math.max(0, yA - S) : yA;
      const lopEo = (q) => {
        const xoay = (fn) => (N ? nghieng(q, N, lean, fn) : fn());
        const vk = () => { q.save(); q.translate(E.ox, E.oy); veVk(q, V, v); q.restore(); };
        if (v && v.n[3]) xoay(vk);
        // nửa dưới: chân khung chạy từ hàng cR (cùng hướng thân trên, không lật); vùng nối kéo nếu nửa dưới hẹp hơn
        const y0 = K && !K.tren ? cR + 1 + S : cR;
        if (K && !K.tren) for (let y = cR; y < y0 && y < 96; y++) hang(q, s.eo.i * 96, aC.hang * 96 + y, 0, -45 + y / 2, y === cR ? 1 : tKeo(y - cR - 1));
        if (y0 < 96) veT(q, T, T.img, s.eo.i * 96, aC.hang * 96 + y0, 96, 96 - y0, -24, -45 + y0 / 2, 48, (96 - y0) / 2);
        // đang nghiêng: lót dải đai (6 hàng nguồn ngay trên đai, không xoay) để chỗ nối không hở
        if (N) veT(q, T, TI, s.i * 96, AH * 96 + yB - 6, 96, 6, -24 + E.ox, -45 + E.oy + (yB - 6) / 2, 48, 3);
        // dải dưới (hàng yT..cA của khung đòn): không xoay; vùng nối kéo nếu nửa trên hẹp hơn
        for (let y = yT; y < yA; y++) hang(q, s.i * 96, AH * 96 + y, dx, -45 + E.oy + y / 2, K && K.tren ? tKeo(cA - y) : 0, TI);
        // nửa trên: đai + thân + tay khung đòn (hàng 0..yT−1), dời về khung chạy; xoay quanh eo khi nghiêng
        xoay(() => {
          veTren(q, yT, E.ox, E.oy);
          if (v && !v.n[3]) vk();
          if (v && v.B.ht != null) { // nắm tay đè lên cán, rồi lớp ngón (nắm chuôi)
            if (coHt(v)) veT(q, T, TI, v.wa.i * 96, HT * 96, 96, yA, -24 + E.ox, -45 + E.oy, 48, yA / 2);
            q.save(); q.translate(E.ox, E.oy); veNgon(q, V, v); q.restore();
          }
        });
      };
      return veLop(c, o, lopEo);
    }
    if (s.eo && E) {
      const aC = D.dong_tac.chay, yR = E.eR[0] + 1, yA = E.eA[0] + 1;
      const lopEo = (q) => {
        const xoay = (fn) => (N ? nghieng(q, N, lean, fn) : fn());
        const vk = () => { q.save(); q.translate(E.ox, E.oy); veVk(q, V, v); q.restore(); };
        if (v && v.n[3]) xoay(vk);
        // nửa dưới: chân khung chạy (từ dưới đai), lật theo hướng chạy
        q.save();
        if (E.rel < 0) { q.translate(E.kc, 0); q.scale(-1, 1); }
        veT(q, T, T.img, s.eo.i * 96, aC.hang * 96 + yR, 96, 96 - yR, -24, -45 + yR / 2, 48, (96 - yR) / 2);
        q.restore();
        // đang nghiêng: lót dải đai (6 hàng nguồn ngay trên eo, không xoay) để chỗ nối không hở
        if (N) veT(q, T, TI, s.i * 96, AH * 96 + yA - 6, 96, 6, -24 + E.ox, -45 + E.oy + (yA - 6) / 2, 48, 3);
        // nửa trên: đai + thân + tay khung đòn, dời về điểm eo của khung chạy
        xoay(() => {
          veTren(q, yA, E.ox, E.oy);
          if (v && !v.n[3]) vk();
          if (v && v.B.ht != null) { // nắm tay đè lên cán, rồi lớp ngón (nắm chuôi)
            if (coHt(v)) veT(q, T, TI, v.wa.i * 96, HT * 96, 96, yA, -24 + E.ox, -45 + E.oy, 48, yA / 2);
            q.save(); q.translate(E.ox, E.oy); veNgon(q, V, v); q.restore();
          }
        });
      };
      return veLop(c, o, lopEo);
    }
    const tk = v && v.tk; // kiếm bớt cứng (2): cả người nhích tới wx, thân trên hạ uy (chỉ hình)
    const lop0 = (q) => {
      if (N) { // nửa dưới đứng yên (lấn lên 6 hàng nguồn để chỗ nối không hở), nửa trên + vũ khí + nắm tay xoay quanh eo
        const e = eoKhung(T, s.ten, s.i), yC = e[0] + 1, yL = Math.max(0, yC - 6);
        const nghieng = (q2, P2, d2, fn) => { if (tk && tk.uy) { q2.save(); q2.translate(0, tk.uy); } try { nghiengGoc(q2, P2, d2, fn); } finally { if (tk && tk.uy) q2.restore(); } };
        if (v && v.n[3]) nghieng(q, N, lean, () => veVk(q, V, v));
        veT(q, T, TI, s.i * 96, AH * 96 + yL, 96, 96 - yL, -24, -45 + yL / 2, 48, (96 - yL) / 2);
        nghieng(q, N, lean, () => {
          veTren(q, yC, 0, 0);
          if (v && !v.n[3]) veVk(q, V, v);
          if (v && !s.theo && v.B.ht != null) { if (coHt(v)) veT(q, T, TI, v.wa.i * 96, HT * 96, 96, 96, -24, -45, 48, 48); veNgon(q, V, v); } // nắm tay + ngón đè lên cán
        });
        return;
      }
      if (v && v.n[3]) veVk(q, V, v);
      veTren(q, 96, 0, 0);
      if (v && !v.n[3]) veVk(q, V, v);
      if (v && !s.theo && v.B.ht != null) { if (coHt(v)) veT(q, T, TI, v.wa.i * 96, HT * 96, 96, 96, -24, -45, 48, 48); veNgon(q, V, v); } // nắm tay + ngón đè lên cán
    };
    const lop = tk && tk.wx ? (q) => { q.save(); q.translate(tk.wx, 0); try { lop0(q); } finally { q.restore(); } } : lop0;
    return veLop(c, o, lop);
  }
  // Vẽ bóng + lật theo mặt + nhuộm (trúng đòn, băng, độc) + hào quang Gồng quanh một hàm vẽ người lop(q) (toạ độ tính từ chân).
  // cu-ti-to-muot: phóng ×toCua(o) quanh chân qua canvas phụ (xem đầu tệp) + mờ chuyển (b).
  let sVe = null; // khung vừa chọn ở ve() (hàng ảnh, cho mờ chuyển)
  const MO = { t: -1, nhom: null, f: 1, t0: -1, anh: null, dang: false }; // mờ chuyển của lần vẽ chính (một em bé chính mỗi trận)
  const MO_GIAY = 0.1, MO_DAU = 0.5;
  // Nhóm hàng ảnh để biết lúc nào "đổi động tác": đứng / bước (đi, chạy) / ghép eo / từng động tác một lần.
  const nhomCua = (s) => (!s ? null : s.giuCuoi ? 'giu:' + s.ten : s.eo ? 'eo' : /^dung/.test(s.ten) ? 'dung' : /^(di|chay)/.test(s.ten) && !s.theo ? 'buoc' : s.ten);
  const laChinh = (o) => { const p = o.p; let W = null; try { W = G.getWorld ? G.getWorld() : null; } catch (e) { W = null; } return !!(p && W && W.P === p && !o.noShadow && (o.t == null || o.t === p.t)); };
  function veLop(c, o, lop) {
    const R = G.lamTron || Math.round; // soát mượt phiên 3 mục 1: cùng kiểu làm tròn với camera (nửa điểm ảnh; ?noisuy=0 như cũ)
    const x = R(o.x), y = R(o.y), f = o.face < 0 ? -1 : 1, t = (o.t != null ? o.t : G.time) || 0;
    const p = o.p, chet = !!(p && p.dead), K = toCua(o);
    c.save();
    if (o.alpha != null) c.globalAlpha = c.globalAlpha * o.alpha;
    c.imageSmoothingEnabled = false;
    if (!o.noShadow) {
      const sw = Math.round((chet ? 12 : 8) * K), sx = chet ? x - f * Math.round(6 * K) : x; // bóng chân to theo cỡ hiển thị
      if (G.bongAnh && G.bongAnh(c, sx, y, sw + 1)) { /* 16/10 vẽ tay 6: ảnh hu-bong-chan khi đang chặn hình code */ }
      else if (o.roundShadow && G.art && G.art.ellipse) G.art.ellipse(c, sx, y, sw + 1, Math.max(2, Math.round((sw + 1) * 0.45)), 'rgba(0,0,0,0.3)');
      else { c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(sx - sw + 2, y - 1, sw * 2 - 4, 1); c.fillRect(sx - sw, y, sw * 2, 1); c.fillRect(sx - sw + 2, y + 1, sw * 2 - 4, 1); }
    }
    c.translate(x + (f < 0 ? 1 : 0), y);
    c.scale(f, 1);
    const tint = SC.emBeTint ? SC.emBeTint(o) : null;
    // mờ chuyển (b): chỉ lần vẽ chính của em bé trong trận; mỗi G.time tính một lần
    const chinh = muot2() && typeof document !== 'undefined' && laChinh(o);
    let moA = 0;
    if (chinh) {
      const nhom = nhomCua(sVe), now = G.time || 0;
      if (MO.t !== now) {
        const vao = nhom === 'dung' || nhom === 'buoc'; // vào đứng / bước (giữ khung cuối thì chưa: cùng ảnh với khung đòn)
        if (MO.nhom && nhom !== MO.nhom && vao && MO.f === f && MO.anh && now - MO.t < 0.1 && !chet) { MO.t0 = now; MO.dang = true; }
        else if (MO.dang && (!vao || MO.f !== f || now - MO.t0 >= MO_GIAY)) MO.dang = false;
        MO.nhom = nhom; MO.f = f; MO.t = now;
      }
      if (MO.dang && now - MO.t0 < MO_GIAY) moA = MO_DAU * (1 - ss((now - MO.t0) / MO_GIAY));
    }
    if ((tint || K !== 1 || chinh) && typeof document !== 'undefined') {
      // vùng 160×160 điểm ảnh game quanh chân (vũ khí dài vẫn lọt), nét ×2; vẽ ra ×K quanh chân (đúng lưới điểm ảnh thật)
      // do-net: có bản to đúng cỡ K (tấm "to") → canvas phụ ở nét 2K, dựng từ bản to, chép ra 1:1 (không phóng lúc vẽ)
      // nét cao (G.NET 3 / 4, có bản "to_n<N>" đúng cỡ K và đã tải): canvas phụ ở nét N·K (toK = K·N/2) → chép 1:1 ra canvas thế giới nét N.
      // Không có / chưa tải: như nét 2 (canvas phụ nét 2K, khi chép ra bị phóng N/2 lần — đúng cỡ, kém nét).
      const T = tVe, NC = G.NET > 2 ? G.NET : 0, mc = NC && T && K !== 1 ? T.tep['to_n' + NC] : null, nc = mc && Math.abs(mc.k - (K * NC) / 2) < 1e-6 && anhNet(T, NC) ? NC : 0;
      const toK = nc ? (K * nc) / 2 : T && K !== 1 && T.tep.to && Math.abs(T.tep.to.k - K) < 1e-6 && anhTo(T) ? K : 1, Z = Math.round(320 * toK);
      tam = tam || document.createElement('canvas');
      if (tam.width !== Z) { tam.width = Z; tam.height = Z; }
      const q = tam.getContext('2d');
      q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1; q.clearRect(0, 0, Z, Z);
      q.imageSmoothingEnabled = false; q.setTransform(2 * toK, 0, 0, 2 * toK, 160 * toK, 220 * toK);
      q.__to = toK !== 1 ? T : null; q.__toN = nc;
      try { lop(q); } finally { q.__to = null; q.__toN = 0; }
      q.setTransform(1, 0, 0, 1, 0, 0);
      if (chinh && !MO.dang) { // nhớ ảnh khung này (chưa nhuộm) làm khung cũ cho lần mờ chuyển sau
        MO.anh = MO.anh || document.createElement('canvas');
        if (MO.anh.width !== Z) { MO.anh.width = Z; MO.anh.height = Z; }
        const m = MO.anh.getContext('2d'); m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, Z, Z); m.drawImage(tam, 0, 0);
      }
      if (moA > 0.01 && MO.anh && MO.anh.width === Z) { q.globalAlpha = moA; q.drawImage(MO.anh, 0, 0); q.globalAlpha = 1; } // khung cũ mờ dần đè lên khung mới
      if (tint) { q.globalCompositeOperation = 'source-atop'; q.globalAlpha = tint[1]; q.fillStyle = tint[0]; q.fillRect(0, 0, Z, Z); }
      q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1;
      c.drawImage(tam, -80 * K, -110 * K, 160 * K, 160 * K);
    } else lop(c);
    if (o.gong) { // hào quang lúc Gồng (như js/hero_tinhlinh.js)
      if (K !== 1) c.scale(K, K);
      for (let i = 0; i < 6; i++) {
        const ph = (t * 1.6 + i * 0.37) % 1, sx = Math.round(-10 + i * 4) + (i % 2), sy = Math.round(-4 - ph * 30);
        c.fillStyle = i % 2 ? '#fff3b0' : '#ffd27a';
        c.globalAlpha = (o.alpha != null ? o.alpha : 1) * (1 - ph) * 0.9;
        c.fillRect(sx, sy, 1, 4 + (i % 3));
      }
    }
    c.restore();
    return true;
  }

  // Mũi vũ khí cho vệt chém (js/fx.js đọc G.tinhLinh.tip): giữ nhịp / cửa sổ vệt của bản cũ, chỉ dời điểm cầm, hướng, độ dài theo neo mới.
  function doiTip(q, o) {
    const T = layThan(), V = lay('zed-vk');
    if (!T || !V) return;
    const D = T.tep, s = chon(o, D), v = vkCua(o, D, s, T, false);
    const f = o.face < 0 ? -1 : 1, X0 = (G.lamTron || Math.round)(o.x) + (f < 0 ? 1 : 0), Y0 = (G.lamTron || Math.round)(o.y);
    if (!v || v.cam) { // vũ khí cầm lúc đứng/đi/chạy (cả lướt sau lộn): giữ mũi của bản cũ cho vệt/hiệu ứng (cu-ti-to-muot: phóng ×K quanh chân)
      const K0 = toCua(o);
      if (K0 !== 1 && isFinite(q.gx) && isFinite(q.gy)) { q.gx = X0 + (q.gx - X0) * K0; q.gy = Y0 + (q.gy - Y0) * K0; if (isFinite(q.L)) q.L *= K0; }
      return;
    }
    const R = V.tep.vk[v.da.vk][v.cap], g = v.B.cam[v.cap];
    const E = s.eo ? eoTinh(T, s, o) : null, ox = E ? E.ox : 0, oy = E ? E.oy : 0; // chạy + chém: vũ khí dời theo nửa trên đã khớp eo
    let gx = v.n[0] / 2 - 24 + ox, gy = v.n[1] / 2 - 45 + oy, ang = v.ang != null ? v.ang : v.n[2];
    const N = trucNghieng(T, s, v, E); // nghiêng thân trên (zed-8-huong): nắm tay xoay quanh eo, hướng vũ khí cộng thêm góc nghiêng
    if (N) { const b = (v.lean * Math.PI) / 180, cx = gx - N[0], cy = gy - N[1]; gx = N[0] + cx * Math.cos(b) - cy * Math.sin(b); gy = N[1] + cx * Math.sin(b) + cy * Math.cos(b); ang += v.lean; }
    if (v.tk) { gx += v.tk.wx; gy += v.tk.uy; } // kiếm bớt cứng (2): vệt chém theo người nhích / nhún
    // kiếm vuông 17/10: mũi cho vệt chém = GIỮA cạnh đầu vuông (lệch khỏi trục điểm cầm một chút) → hướng + độ dài tới điểm đó
    const KV = v.B.kv && SC.kiemVuong && SC.kiemVuong(), mu = KV && KV.mui && KV.mui[v.cap];
    const L0 = (R[2] - g[0]) * v.B.tl, lw = mu ? ((mu[0] + mu[1]) / 2 - g[1]) * v.B.tl : 0;
    const r = (ang * Math.PI) / 180 + Math.atan2(lw, L0), K = toCua(o); // cu-ti-to-muot: Tí vẽ ×K quanh chân → nắm tay và độ dài lưỡi cũng ×K
    q.gx = X0 + f * gx * K; q.gy = Y0 + gy * K;
    q.dx = f * Math.cos(r); q.dy = Math.sin(r);
    q.L = Math.max(4, Math.hypot(L0, lw) * (v.co > 0 && v.co < 1 ? v.co : 1)) * K; // v.co: KN_MUOT
    q.front = !v.n[3];
  }

  // Phi tiêu bay (đạn 'arrow' của người chơi): ảnh vk-phi-tieu theo cấp vũ khí đã ném, xoay khi bay.
  function vePhiTieu(c, o) {
    const V = lay('zed-vk');
    if (!V || !V.tep.vk.phitieu) return false;
    const cap = o.w ? capVk(o.w) : 0, a = anhVk(V, 'phitieu', cap, o.he && o.he.el && G.EL && G.EL[o.he.el] ? o.he.el : null), r0 = V.tep.vk.phitieu[0];
    // cấp 1 rộng 8 điểm ảnh (ném chùm 11), cấp cao to dần theo ảnh; nắm chuôi 15/10: ×1,3 (CHỈ HÌNH, đạn/vùng trúng không đổi; ?phitieuto=0 tắt)
    const F = ((o.big ? 11 : 8) / Math.max(r0[2], r0[3])) * (G.PHI_TIEU_TO !== false && G.NAM_CHUOI !== false ? 1.3 : 1);
    const x = Math.round(o.x), y = Math.round(o.y - (o.z || 10));
    c.save();
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x - 3, Math.round(o.y), 6, 1);
    c.imageSmoothingEnabled = false;
    c.translate(x, y); c.rotate(((G.time || 0) * 18 + (o.x + o.y) * 0.05) % (Math.PI * 2)); c.scale(F, F);
    veNho(c, a, -a.w / 2, -a.h / 2);
    c.restore();
    return true;
  }

  // ---------- bọc G.art.hero, G.art.proj, G.tinhLinh.tip (ngoài cùng; lớp khác có thể bọc lại sau khi ảnh nạp nên kiểm mỗi khung) ----------
  // Soát mượt phiên 3 mục 22: khoá HÌNH của lần vẽ Cu Tí (js/fx.js viền bé chỉ dựng lại khi khoá đổi). null = không chắc (em bé khác, đang
  // nhuộm / trúng đòn / Gồng / ánh vũ khí chạy theo thời gian…) → nơi gọi dựng lại như cũ. Chỉ đọc, không đổi trạng thái vẽ.
  function khoaVe(o) {
    if (!o || !laZed(o) || o.gong || o.alpha != null && o.alpha !== 1 || o.flash) return null;
    const T = layThan(), p = o.p;
    if (!T || !p || p.dead || p.hurtT > 0) return null;
    const st = p.st || {};
    if (st.ice > 0 || st.poison > 0 || st.fire > 0) return null;
    const w = o.weapon, VV = G.vienVk;
    if (w && VV && VV.co && VV.co(w)) return null;
    const D = T.tep, s = chon(o, D), V = lay('zed-vk'), v = V ? vkCua(o, D, s, T, false) : null, h = HV && HV.get(p);
    return [T._ma, s.ten, s.i, s.eo ? s.eo.i + ':' + (s.eo.lui || 0) + ':' + (s.eo.moi || 0) + ':' + (s.eo.chan || '') : '', s.theo ? s.theo.ten + ':' + s.theo.i : '',
      v ? v.wa.ten + ':' + v.wa.i + ':' + v.cap + ':' + (v.he || '') + ':' + Math.round(v.ang / 2) + ':' + Math.round((v.lean || 0) * 2) + (v.tk ? ':' + Math.round(v.tk.wx * 2) + ',' + Math.round(v.tk.uy * 2) : '') : V ? '-' : '0',
      h ? Math.round(h.gv / 2) + ':' + Math.round(h.lv * 2) : '', o.face < 0 ? -1 : 1, w ? w.type + ':' + (w.coat || '') : '', o.dodge >= 0 ? 1 : 0, o.roundShadow ? 1 : 0].join('|');
  }
  // Kiếm nặng (js/fx.js vetKN): em bé P là Cu Tí đang cầm kiếm và tấm thân đang mặc có hàng kiếm nặng đã thay kiem_1 (hang16).
  function kiemNang(P) {
    if (!KIEM_NANG || !P || !laZed(P)) return false;
    try {
      const w = G.curW ? G.curW(P) : null;
      if (!w || w.type !== 'sword') return false;
      const T = layThan(), dt = T && T.tep && T.tep.dong_tac;
      return !!(dt && dt.kiem_1 && dt.kiem_1.kn);
    } catch (e) { return false; }
  }
  G.zedMoi = { chon, MOC, eoTinh, lechHinh, lechTu, khoaVe, kiemNang, loi: [] };
  let dangGoiCu = false;
  const ghiLoi = (e) => { if (G.zedMoi.loi.length < 5) G.zedMoi.loi.push(String((e && e.message) || e)); };
  function boc() {
    const A = G.art;
    if (A && typeof A.hero === 'function' && !A.hero._zedMoi) {
      const cu = A.hero;
      // 14/10 (vũ khí cũ còn sót, mục 8): Zed chưa vẽ được bằng ảnh zed-* (chờ tải) → KHÔNG vẽ em bé code kiểu cũ; bạn nhỏ chưa có ảnh em-be-*
      // cũng vậy (công cụ cần hình code thì gọi thẳng G.art.heroCode). 15/10 don-tep B: bỏ cờ ?vkcu=1.
      const coEmBe = (o) => { const SC = G.spriteCustom; return !!(SC && SC.cuaEmBe && SC.cuaEmBe(o && o.key, o)); };
      const moi = function (c, o) {
        if (!dangGoiCu && laZed(o)) { try { if (ve(c, o)) return; } catch (e) { ghiLoi(e); } return; }
        else if (!dangGoiCu && !coEmBe(o)) return;
        const truoc = dangGoiCu; dangGoiCu = true;
        try { return cu.call(this, c, o); } finally { dangGoiCu = truoc; }
      };
      moi._zedMoi = true;
      A.hero = moi;
    }
    if (A && typeof A.proj === 'function' && !A.proj._zedMoi) {
      const cu = A.proj;
      const moi = function (c, o) {
        // phi tiêu mang hệ có ảnh hu-dan-ten-<hệ> (phi tiêu bọc lửa/nhớt/băng, js/fx_dan.js vẽ) thì để lớp trong vẽ ảnh đó
        const heAnh = o && o.he && o.he.el && G.fxAnh && G.fxAnh.co('hu-dan-ten-' + o.he.el);
        if (o && o.team === 'player' && o.kind === 'arrow' && !G.noRender && !heAnh) { try { if (vePhiTieu(c, o)) return; } catch (e) { ghiLoi(e); } return; } // 14/10: zed-vk chưa về thì không vẽ mũi tên cũ
        return cu.apply(this, arguments);
      };
      moi._zedMoi = true; A.proj = moi;
    }
    const TL = G.tinhLinh;
    if (TL && typeof TL.tip === 'function' && !TL.tip._zedMoi) {
      const cu = TL.tip;
      const moi = function (o) {
        const q = cu.apply(this, arguments);
        if (q && laZed(o)) { try { doiTip(q, o); } catch (e) { ghiLoi(e); } }
        return q;
      };
      moi._zedMoi = true; TL.tip = moi;
    }
  }
  function giu() { try { boc(); } catch (e) { /* bỏ qua */ } if (typeof requestAnimationFrame === 'function') requestAnimationFrame(giu); }
  giu();
})();
