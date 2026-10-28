/* ======================= PHÒNG B HƯỚNG MỚI – khối của trang thử game/thu-phong-b/index.html =======================
   Tư vấn 3 (art/huong-moi/TU-VAN-CHUYEN-GIA-3-MOI-TRUONG-PHONG-A-F.md), "THỨ TỰ THỰC HIỆN" bước đầu: chỉ PHÒNG B (Sân hai chuông).
   Code địa hình / nền / HUD nằm ở module riêng: game/runtime/dia-hinh-huong-moi.js (DHM), game/runtime/giao-dien-huong-moi.js (GDHM).
   Khối này chỉ: số đặt cho phòng B (PB_SO), móc vẽ (bọc hàm cũ, không sửa thân hàm), vào thẳng phòng B, API quay / chụp / đo (TVPB).
   Màu đồ cũ: khối HM của game/thu-huong-moi (chèn ngay trước khối này) – gạch cũ, ván, đá, đèn, điểm lưu đã chỉnh màu.

   Bước 2 (28/10): bộ đất MỚI (ảnh gen chủ dự án: bo-dat-3x3, canh-day-re, van-mot-chieu) cho CẢ A–C, điểm lưu + hình nộm mới ở A.
   Bước 3 (29/10, phản hồi 8): dựng tiếp D (2 Bọ Vỏ Mộc – khối Bọ chép CHỈ ĐỌC từ thu-bo-vo-moc), E (sân tinh anh trống, 30 ô),
   F (lò rèn 16 ô: chuông lưu + đe rèn 2 trạng thái) bằng cùng bộ đất / nền; cửa sổ tháp phòng B nén sáng; gợi ý ngắn theo tình huống.

   Cờ URL:  ?moi=0  tắt bộ mới (nền, đất, đèn, HUD, nút, điểm lưu, hình nộm) – vẫn giữ màu HM   ?hm=0 tắt màu HM   ?hud=0 HUD + nút cũ
            ?nen=0 nền cũ   ?dat=0 đất cũ   ?bo=cu đất bước 1 (thân mới + mép cũ chỉnh màu)   ?dv=0 điểm lưu + hình nộm cũ
            ?vao=a  vào phòng A như thu-p0a   ?vao=c|d|e|f vào đầu phòng C / D / E / F (mặc định vào thẳng phòng B)
            ?goiy=cu  dòng hướng dẫn dài cũ (so)   ?thapB=cu  tháp phòng B chưa nén sáng (so)
            + mọi cờ của thu-p0a (?ghi=1 ?battu=1 ?hitbox=1 ?debug=input …) và của Bọ (?dauthan=0 ?huongdan=1 ?mot=1) */

/* ---------- SỐ ĐẶT PHÒNG A / B / C (chỉnh ở đây rồi chạy lại cong-cu/tao-tu-p0a.py) ---------- */
// Bước 2 (28/10): bộ đất mới (ảnh gen chủ dự án) cho CẢ A–C; nền giữa / đèn / trang trí theo từng phòng. A ấm, an toàn; B–C sàn thoáng.
const THAP_GIAM = (() => { try { return new URLSearchParams(location.search).get('thapB') === 'cu' ? null : {nguong: 92, k: 0.3, bh: 0.45}; } catch (e) { return null; } })();
const PB_SO = {
  json: '../../art/huong-moi/dia-hinh/dia-hinh.json',
  cot: () => [[PA.x0, PF.x0 + PF.w - 1]],                       // cột vẽ bằng bộ mới: phòng A → F (đá 'S' trong các cột này cũng vẽ bằng đất mới)
  // nền giữa: dùng THƯA; x = mép trái mảnh trên màn khi camera ở giữa phòng (logic). Hai cây đặt sát mép màn, ngoài vùng tuần tra
  // của 2 Chuông Gỗ (cột 4–13 và 19–28 → màn 64–456 và 544–904 khi camera giữa phòng); tháp giữa đứng sau ván một chiều (cột 15–18).
  // bước 3 (phản hồi 8 mục 3): cửa sổ sáng + ban công của tháp ngay sau giữa sân hút mắt → NÉN VÙNG SÁNG của mảnh tháp (chỉ phòng B;
  // A giữ cửa sổ vàng vì A cần ấm). ?thapB=cu: bản cũ để so.
  nen: {sanY: FLOOR, catDuoi: 22, giua: [{m: 'cay-trai', x: -104}, {m: 'thap', x: 380, giam: THAP_GIAM, al: THAP_GIAM ? 0.88 : 1}, {m: 'cay-phai', x: 820}]},
  den: [{x: (PB.x0 + 1) * T + 20, y: 156, ph: 0.4}, {x: (PB.x0 + 32) * T + 8, y: 148, ph: 2.1}],   // y = đáy đèn; xa đầu quái (đầu ≥ y 300)
  denCao: 34,                                                    // cao đèn (tư vấn: 24–40)
  denMau: 'den-tron-sang',
  trangTri: () => [{o: 'nam-0', x: (PB.x0 + 1) * T + 2, y: FLOOR, lun: 2}, {o: 'nam-1', x: (PB.x0 + 31) * T + 14, y: FLOOR, lun: 2}]   // 2 nấm nhỏ ở 2 mép phòng (sau nhân vật)
};
// A (Khởi đầu, 24 cột < màn 960 → camera dính mép trái phòng): ẤM, AN TOÀN – tháp có cửa sổ vàng sau khoảng trống giữa hình nộm và cuối phòng,
// 3 đèn sáng hơn, quầng ấm rất nhẹ sau điểm lưu; 2 nấm cạnh điểm lưu. Điểm lưu mới (cột 2) + hình nộm mới (cột 10): xem móc vẽ bên dưới.
const PA_SO = {
  nen: {sanY: FLOOR, catDuoi: 22, giua: [{m: 'cay-trai', x: -150}, {m: 'thap', x: 470}]},
  den: [{x: (PA.x0 + 6) * T + 4, y: 150, ph: 1.1, sang: 0.32, r: 58}, {x: (PA.x0 + 15) * T + 20, y: 136, ph: 2.7, sang: 0.3, r: 54},
        {x: (PA.x0 + 21) * T + 6, y: 160, ph: 0.2, sang: 0.28, r: 52}],
  am: {x: 140, y: 380, r: 430, al: 0.14},                        // quầng ấm nền (toạ độ màn khi camera ở mép trái phòng A)
  trangTri: () => [{o: 'nam-1', x: (PA.x0 + 5) * T + 4, y: FLOOR, lun: 2}, {o: 'nam-0', x: (PA.x0 + 16) * T + 10, y: FLOOR, lun: 2}]
};
// C (Hành lang gác, trần đá hàng 0–5): THOÁNG – 1 cây nền ở mép trái (ngọn khuất sau trần), 1 đèn treo từ trần, không trang trí sàn
const PC_SO = {
  nen: {sanY: FLOOR, catDuoi: 22, giua: [{m: 'cay-trai', x: -90}]},
  den: [{x: (PC.x0 + 9) * T + 16, y: 262, ph: 0.9, tran: 6 * T}],
  trangTri: () => []
};
/* ---------- BƯỚC 3: D / E / F (sơ đồ v2: D 30 ô, E 30 ô, F 16 ô; không trần; B–E sàn thoáng, F ấm + an toàn như A) ---------- */
// D (Bọ Vỏ Mộc): 2 Bọ tuần tra cột 6–17 và 18–28, ván cột 9–12 hàng 9. Nền giữa thưa ở 2 MÉP (giữa phòng chỉ còn nền xa tối),
// thân cây nền giảm tương phản (al) để Bọ màu trầm không chìm (phản hồi 8: giảm tương phản nền trước, không tăng viền quái).
const NEN_D_GOC = (() => { try { return new URLSearchParams(location.search).get('nenD') === 'goc'; } catch (e) { return false; } })();   // ?nenD=goc: nền D chưa giảm (so)
const NEN_D_AL = NEN_D_GOC ? 1 : 0.8;
const PD_SO = {
  // MÀN TẦM ĐÁNH: dải màu nền tối phẳng phủ lên NỀN XA ở tầm Bọ (y 250 → 470, đậm nhất 330–440) → các vòm teal / thân cây nền bớt tương phản,
  // Bọ (trầm nhưng sáng hơn nền) tách ra. Chỉ ở lớp nền (sau địa hình, sau mọi nhân vật). Không đổi viền / màu Bọ.
  man: NEN_D_GOC ? null : {y0: 250, y1: 470, a: 0.42, mau: '15,21,24'},
  nen: {sanY: FLOOR, catDuoi: 22, giua: [{m: 'cay-trai', x: -150, al: NEN_D_AL}, {m: 'cay-phai', x: 860, al: NEN_D_AL}]},
  den: [{x: (PD.x0 + 2) * T + 10, y: 150, ph: 1.7}],
  trangTri: () => [{o: 'nam-1', x: (PD.x0 + 1) * T + 8, y: FLOOR, lun: 2}]
};
// E (sân tinh anh – CHƯA có tinh anh): trống, đúng 30 ô; tháp tối (nén sáng như B) lệch về cuối sân, 2 đèn cao sát 2 mép
const PE_SO = {
  nen: {sanY: FLOOR, catDuoi: 22, giua: [{m: 'cay-phai', x: -170, lat: true}, {m: 'thap', x: 660, giam: {nguong: 80, k: 0.25, bh: 0.4}, al: 0.9}]},
  den: [{x: (PE.x0 + 1) * T + 16, y: 140, ph: 0.6}, {x: (PE.x0 + 20) * T + 16, y: 152, ph: 2.4}],
  trangTri: () => []
};
// F (Lò rèn, 16 ô ở cuối thế giới → camera dính mép phải, thấy thêm 14 ô cuối E): ẤM, AN TOÀN như A – tháp cửa sổ vàng sau đe,
// 3 đèn sáng, quầng ấm nền, chuông lưu cột 2, đe rèn cột 6–8 (sau Lam), 2 nấm
const PF_SO = {
  nen: {sanY: FLOOR, catDuoi: 22, giua: [{m: 'thap', x: 610}, {m: 'cay-trai', x: 830, lat: true}]},
  den: [{x: (PF.x0 + 1) * T + 4, y: 150, ph: 0.3, sang: 0.32, r: 58}, {x: (PF.x0 + 7) * T + 20, y: 132, ph: 1.9, sang: 0.3, r: 54},
        {x: (PF.x0 + 13) * T + 6, y: 156, ph: 2.8, sang: 0.3, r: 54}],
  am: {x: 300, y: 380, r: 420, al: 0.15, phai: true},          // quầng ấm nền (x: toạ độ so với mép TRÁI phòng F)
  de: {cot: 7, lun: 2, gan: 80},                                 // đe rèn: tâm ở giữa cột 7; nóng dần khi Lam đứng cách ≤ 80 px
  trangTri: () => [{o: 'nam-0', x: (PF.x0 + 4) * T + 6, y: FLOOR, lun: 2}, {o: 'nam-1', x: (PF.x0 + 12) * T + 4, y: FLOOR, lun: 2}]
};
const PHONG_SO = [[PA, PA_SO], [PB, PB_SO], [PC, PC_SO], [PD, PD_SO], [PE, PE_SO], [PF, PF_SO]];
const DEN_ABC = PHONG_SO.flatMap(([r, so]) => so.den);
// nền giữa 3 phòng: mỗi mảnh mang trục giữa phòng của nó (rc) + trọng số theo phần màn phòng đó chiếm (đổi phòng → hoà dần, không nhảy)
const NEN_ABC = {sanY: FLOOR, catDuoi: 22, giua: []};
for (const [r, so] of PHONG_SO) for (const p of so.nen.giua) NEN_ABC.giua.push(Object.assign({}, p, {phong: r, rc: r.x0 * T + r.w * T / 2 - W / 2, w: 0}));
// bước 3: phần màn chia cho min(1, rộng phòng / màn) → phòng F (16 ô) đứng yên thì nền F đủ 1; nền E mờ dần về 0 trong 256 px cuối
// trước chỗ camera dừng ở F (camera ở F vẫn thấy 14 ô cuối E nhưng nền là của F)
function nenTrongSo(ox) {
  const cF = (PF.x0 + PF.w) * T - W, kE = Math.max(0, Math.min(1, (cF - ox) / 256));
  for (const p of NEN_ABC.giua) { const r = p.phong, a = Math.max(0, Math.min(ox + W, (r.x0 + r.w) * T) - Math.max(ox, r.x0 * T)) / Math.min(W, r.w * T);
    p.w = Math.max(0, Math.min(1, (a - 0.25) / 0.5)) * (r === PE ? kE : 1); }
}

const PBK = (() => {
  let q; try { q = new URLSearchParams(location.search); } catch (e) { q = new Map(); }
  const moi = q.get('moi') !== '0';
  return {q, moi, nen: moi && q.get('nen') !== '0', dat: moi && q.get('dat') !== '0', hud: moi && q.get('hud') !== '0', vaoA: q.get('vao') === 'a' || q.get('vao') === 'lang',
    vaoX: q.get('vao'), dv: moi && q.get('dv') !== '0', boCu: q.get('bo') === 'cu',
    loi: '', so: {}};
})();

/* ---------- nạp + dựng (gọi trong boot, sau HM.chuanBi) ---------- */
PBK.chuanBi = async function () {
  if (!PBK.moi) return;
  const t0 = performance.now();
  try { await DHM.nap(PB_SO.json); } catch (e) { PBK.loi = String(e && e.message || e); PBK.nen = PBK.dat = false; warn('Không nạp được địa hình hướng mới: ' + PBK.loi); }
  if (DHM.bat) {
    DHM.dung(PBK.optThat());
    for (const p of NEN_ABC.giua) if (p.giam) await DHM.taoGiam(p.m, p.giam);   // bước 3: mảnh nền nén sáng (tháp B, E) → ảnh
    if (lhOn() && LHT.O[PB_SO.denMau]) DHM.taoDen(LHT.O[PB_SO.denMau], PB_SO.denCao);
  }
  if (PBK.hud) GDHM.ap();
  PBK.so.ms_chuan_bi = Math.round(performance.now() - t0);
};
PBK.optThat = () => ({T, ROWS, rows: GCH.rows, WW, cot: PB_SO.cot(), tile, cuIdx: (tx, ty) => GCH.map[ty * WW + tx], cuK: GCH.k, cuTen: GCH.o, cuImg: GCH.cv,
  trangTri: PHONG_SO.flatMap(([r, so]) => so.trangTri()), boCu: PBK.boCu});

/* ---------- móc vẽ (bọc hàm cũ) ---------- */
const _pbNen = drawNen;
const laABC = r => PHONG_SO.some(([p]) => p === r);   // bước 3: A → F
const trongSoPhong = (r, ox) => { const a = Math.max(0, Math.min(ox + W, (r.x0 + r.w) * T) - Math.max(ox, r.x0 * T)) / W; return Math.max(0, Math.min(1, (a - 0.25) / 0.5)); };
drawNen = function () {
  const r = ROOMS[roomAt(ox + W / 2)];
  if (PBK.nen && laABC(r)) { nenTrongSo(ox);
    if (DHM.veNen(ctx, ox, oy, BK, W, H, ox, S.rc, NEN_ABC)) {
      for (const [ph, so] of PHONG_SO) { const a = so.am; if (!a) continue;   // A, F: quầng ấm rất nhẹ (lớp nền, sau địa hình / nhân vật)
        const wa = ph === PF ? Math.min(1, trongSoPhong(ph, ox) * 2) : trongSoPhong(ph, ox); if (wa <= 0) continue;
        const x = a.x + (ph.x0 * T - ox), g = ctx.createRadialGradient(x, a.y - oy, 0, x, a.y - oy, a.r);
        g.addColorStop(0, 'rgba(255,196,120,' + (a.al * wa).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,170,90,0)');
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - a.r, a.y - oy - a.r, a.r * 2, a.r * 2); ctx.restore(); }
      for (const [ph, so] of PHONG_SO) { const m = so.man; if (!m) continue; const wm = trongSoPhong(ph, ox); if (wm <= 0) continue;   // D: màn tầm đánh
        const y0 = m.y0 - oy, y1 = m.y1 - oy, g = ctx.createLinearGradient(0, y0, 0, y1), c = 'rgba(' + m.mau + ',';
        g.addColorStop(0, c + '0)'); g.addColorStop(0.36, c + (m.a * wm).toFixed(3) + ')'); g.addColorStop(0.86, c + (m.a * wm).toFixed(3) + ')'); g.addColorStop(1, c + '0)');
        ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0); }
      DHM.veDen(ctx, ox, oy, DEN_ABC, S.frame);   // đèn + quầng nhỏ ở lớp nền (sau địa hình, sau mọi nhân vật / đòn)
      return;
    }
  }
  _pbNen();
};
const _pbGach = drawGach;
drawGach = function () {
  if (!PBK.dat || !DHM.bat) return _pbGach();
  const M = GCH.map, cv = GCH.cv, K = BK; if (!M) return;
  TT.ve('sau', ox, oy);
  const tx0 = Math.max(0, Math.floor(ox / T)), tx1 = Math.min(WW - 1, Math.floor((ox + W) / T)), ty0 = Math.max(0, Math.floor(oy / T)), ty1 = Math.min(GCH.rows - 1, Math.floor((oy + H) / T));
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  for (let ty = ty0; ty <= ty1; ty++) { const y0 = Math.round((ty * T - oy) * K) / K, y1 = Math.round(((ty + 1) * T - oy) * K) / K;
    for (let tx = tx0; tx <= tx1; tx++) { if (DHM.coCot(tx)) continue; const v = M[ty * WW + tx]; if (v < 0) continue; const qq = GCH.k[v];
      const x0 = Math.round((tx * T - ox) * K) / K, x1 = Math.round(((tx + 1) * T - ox) * K) / K;
      ctx.drawImage(cv, qq[0], qq[1], 64, 64, x0, y0, x1 - x0, y1 - y0); } }
  DHM.veDat(ctx, ox, oy, K, W, H, cv);   // phòng B: thân + mặt trên + đầu + mép cũ chỉnh màu + ván / đá cũ
  veDe();                                // bước 3: đe rèn phòng F – sau địa hình, trước chuông lưu / quái / Lam (sau Lam khi đứng cạnh)
  TT.ve('than', ox, oy); drawRe(); TT.ve('mat', ox, oy);
};
const _pbTien = drawTienCanh;
drawTienCanh = function () { if (PBK.nen && DHM.bat && laABC(ROOMS[roomAt(ox + W / 2)])) return; _pbTien(); };   // A–C: CHƯA thêm lớp gần (tư vấn mục 3) → bỏ rễ treo tiền cảnh cũ
const _pbHud = veHUD;
veHUD = function () {
  if (!PBK.hud) return _pbHud();
  let vong = 'san', day = 1;
  if (rec) { vong = 'ghi'; day = 1 - rec.n / P.echoFrames; } else if (echo && !echo.done) { vong = 'phat'; day = echo.i / echo.n; } else if (echo && echo.done) { vong = 'giu'; day = 1; }
  GDHM.veHUD(ctx, {hp: pl.hp, maxHp: P.maxHp, vong, day, ch: S.resCount, chPulse: LH.chPulse / 40, frame: S.frame});
};
// "Nói chuyện": ẩn ngay khi rời vùng NPC (80 px), hộp thoại đang mở cũng đóng khi rời vùng đó (cũ: 150 px)
const _pbTh = thBuoc;
thBuoc = function () {
  _pbTh(); if (!PBK.hud) return;
  if (TH.on && TH.n && Math.abs(pl.x + pl.w / 2 - TH.n.x) > 80) thDong();
  if (!TH.gan && !noiBtn.hidden) { noiBtn.hidden = true; TH.nutHien = false; }
};
/* ---------- ĐIỂM LƯU MỚI (phòng A): vòm rễ sau Lam + chuông rời lắc khi lưu; đã lưu = dấu ngà trên chuông + quầng ấm nhỏ.
   Vùng kích hoạt / hồi máu GIỮ NGUYÊN (logic cũ: |Lam − b.x| < 40). ?dv=0: điểm lưu + hình nộm cũ. ---------- */
const dvMoi = () => PBK.dv && DHM.coDoVat();
const _pbSave = drawSaveBell;
drawSaveBell = function (b) {
  if (!dvMoi() || !DHM.coCot(Math.floor(b.x / T))) return _pbSave(b);
  const X = b.x - ox, Y = b.y - oy + 1; if (X < -90 || X > W + 90) return;
  const rot = b.ring > 0 ? Math.sin(b.ring * 0.32) * 0.3 * b.ring / 70 : Math.sin(S.frame * 0.025 + b.x) * 0.02;
  if (b.on) { const pz = 0.8 + 0.2 * Math.sin(S.frame * 0.05) + (b.ring > 0 ? b.ring / 70 * 0.5 : 0);   // quầng ấm nhỏ sau vòm (không quầng teal)
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(X, Y - 52, 4, X, Y - 52, 70);
    g.addColorStop(0, 'rgba(255,214,140,' + (0.2 * pz).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,190,100,0)'); ctx.fillStyle = g; ctx.fillRect(X - 72, Y - 124, 144, 144); ctx.restore(); }
  DHM.veDiemLuu(ctx, X, Y, b.on, rot);
};
/* ---------- HÌNH NỘM MỚI (phòng A): cùng lớp quái (sau Lam, trước nền), neo giữa đáy hộp va chạm 72×108 (KHÔNG đổi), cao 108, rộng 56.
   Giữ hành vi cũ: lắc + sáng khi trúng (q.flash), bảng số trên đầu (y như P0.veNom), thanh Thế (P0.veQuai). ---------- */
const _pbQ = drawQuai;
drawQuai = function (q, al) {
  if (!q.nom || !dvMoi()) return _pbQ(q, al);
  const x = q.x + q.w / 2 - ox, y = q.y + q.h - oy; if (x < -120 || x > W + 120) { P0.veQuai(q, al); return; }
  const lac = q.flash > 0 ? Math.sin(q.flash * 1.7) * 3 : 0;
  ctx.save(); bong(x, y - 1, 30, 0.3); DHM.veNomMoi(ctx, x, y + 1, lac, q.flash > 0 ? Math.min(1, q.flash / 6) * 0.7 : 0);
  ctx.font = 'bold 11px ui-monospace,Menlo,monospace'; ctx.textAlign = 'center';
  const dong = ['HÌNH NỘM  máu ' + q.hp + '/' + q.max];
  if (q.nomS && q.nomS.length) dong.push('vừa rồi: ' + q.nomS.join(' + ') + ' = ' + q.nomTong);
  if (pl.D && pl.D.treBam !== undefined && pl.D.src === 'p') dong.push('chạm → hộp: ' + pl.D.treBam + ' tick' + (pl.D.treBam > ATK[pl.D.loai].su ? ' (gồm lúc chờ)' : ''));
  dong.forEach((t, i) => { const w = ctx.measureText(t).width; ctx.fillStyle = 'rgba(12,15,20,.7)'; ctx.fillRect(x - w / 2 - 3, y - 190 + i * 13, w + 6, 13); ctx.fillStyle = '#F3E6C8'; ctx.fillText(t, x, y - 180 + i * 13); });
  ctx.textAlign = 'left'; ctx.restore();
  P0.veQuai(q, al);
};
/* ---------- BƯỚC 3: ĐE RÈN phòng F (đồ tương tác; P0-C mới gắn nâng cấp) – vẽ sau địa hình, trước chuông / quái / Lam.
   2 trạng thái hoà dần: nguội ↔ đang rèn (than đỏ + quầng lò nhỏ) khi Lam đứng cạnh (≤ PF_SO.de.gan px). Không đổi luật / collider. ---------- */
const DE = {x: 0, nong: 0};
function veDe() {
  if (!PBK.dv || !DHM.coDeRen()) return;
  const X = DE.x - ox, Y = FLOOR - oy + PF_SO.de.lun; if (X < -80 || X > W + 80) return;
  ctx.save(); bong(X, Y - PF_SO.de.lun - 1, 46, 0.34); DHM.veDeRen(ctx, X, Y, DE.nong, S.frame); ctx.restore();
}
// chỉ để đo độ nổi của Bọ trên nền (chup-va-quay.py bo-nen): PBK.anBo = true → vẽ lại cùng khung KHÔNG có Bọ
{ const v = BO.ve, x = BO.veXac; BO.ve = al => { if (!PBK.anBo) v(al); }; BO.veXac = al => { if (!PBK.anBo) x(al); }; }
/* ---------- BƯỚC 3: camera phòng F (16 ô < màn, ở cuối thế giới) dính MÉP PHẢI – hàm kẹp gốc với phòng hẹp hơn màn nhảy qua lại.
   Sau mỗi bước game: nếu đang ở F thì thay đích camera bằng mép phải F (cùng nhịp trôi 0,1 như gốc). Không đổi luật đi / va chạm. ---------- */
const camF = () => (PF.x0 + PF.w) * T - W;
const _pbStep = step;
step = function () {
  const f0 = S.frame, c0 = S.camx;
  _pbStep();
  if (S.frame === f0) return;   // dừng / khựng: gốc không chạy phần camera
  if (ROOMS[S.room] === PF) { const tx = camF(); S.camx = c0 + (tx - c0) * 0.1; if (Math.abs(tx - S.camx) < 0.02) S.camx = tx; }
  const gan = Math.abs(pl.x + pl.w / 2 - DE.x) <= PF_SO.de.gan && !pl.dead;
  DE.nong = Math.max(0, Math.min(1, DE.nong + (gan ? 0.045 : -0.02)));
};
const _pbPlace = placePlayer;
placePlayer = function (x, y) { _pbPlace(x, y); if (ROOMS[S.room] === PF) S.camx = S.pcx = camF(); };

/* ---------- BƯỚC 3 (phản hồi 8 mục 3): GỢI Ý NGẮN THEO TÌNH HUỐNG thay dòng hướng dẫn dài đầu màn.
   Vào phòng: chỉ tên phòng 2,5 s. Tình huống (mỗi câu ≤ ~30 ký tự): hiện khi xảy ra, tắt khi hết (tối thiểu 1 s, tối đa 3,3 s);
   cùng một câu không lặp lại trong 15 s. Hết tình huống → không còn chữ trên màn. ?goiy=cu: dòng cũ. ---------- */
const GY = {cu: PBK.q.get('goiy') === 'cu', TEN: 150, HIEN: 200, NGHI: 900, phong: -1, tPhong: 0, key: '', t: 0, lan: {}};
Object.assign(HINT, {
  g_nom: '{B} {A} vào hình nộm để xem số',
  g_luu: 'Chạm chuông: lưu + hồi máu',
  g_da: 'Lóe vàng = sắp đập · {S} né',
  g_vo: 'Vỏ cứng · nhát 3 làm nứt mạnh',
  g_mai: 'Mai cứng phía trước · vòng ra sau',
  g_sup: 'Mai vỡ · đánh lúc nó sụp',
  g_de: 'Đe rèn · nâng cấp ở bản P0-C'
});
function tinhHuong(r) {
  const x = pl.x + pl.w / 2, gan = (o, d) => Math.abs(o - x) <= d;
  for (const b of BELLS) if (!b.on && gan(b.x, 110) && Math.abs(b.y - (pl.y + pl.h)) < 40) return 'g_luu';
  if (r === PA) { const q = Q[6]; return q && !(q.nomS && q.nomS.length) && gan(q.x + q.w / 2, 220) ? 'g_nom' : ''; }
  if (r === PB) { for (const q of [Q[3], Q[4]]) if (!qDown(q) && q.st === 'wind' && gan(q.x + q.w / 2, 320)) return 'g_da'; return ''; }
  if (r === PC) { const q = Q[5]; return !qDown(q) && q.st !== 'sleep' && gan(q.x + q.w / 2, 300) ? 'g_vo' : ''; }
  if (r === PD && typeof BO !== 'undefined') {
    for (const b of BO.DS) { if (b.gone || b.st === 'chet') continue; const c = b.x + b.w / 2; if (!gan(c, 300)) continue;
      if (b.nam || b.st === 'choang' || b.st === 'lat') return 'g_sup';
      if (!b.maiVo && Math.sign(x - c) === b.face) return 'g_mai'; }
    return '';
  }
  if (r === PF) return gan(DE.x, PF_SO.de.gan + 20) ? 'g_de' : '';
  return '';
}
const _pbHintNow = hintNow;
hintNow = function () {
  if (GY.cu) return _pbHintNow();
  const r = ROOMS[S.room]; if (S.won) return 'none';
  if (r.i !== GY.phong) { GY.phong = r.i; GY.tPhong = S.frame; GY.key = ''; }
  const k = tinhHuong(r);
  if (GY.key) { const tt = S.frame - GY.t; if (tt >= GY.HIEN || (k !== GY.key && tt >= 60)) GY.key = ''; }
  if (!GY.key && k && S.frame - (GY.lan[k] === undefined ? -1e9 : GY.lan[k]) > GY.NGHI) { GY.key = k; GY.t = S.frame; GY.lan[k] = S.frame; }
  if (GY.key) return GY.key;
  return S.frame - GY.tPhong < GY.TEN ? '_ten' : 'none';
};
// hiển thị: '_ten' = chỉ tên phòng; câu tình huống KHÔNG kèm tên phòng (cũ: "TÊN PHÒNG" + câu dài)
const _pbSetHint = setHint;
setHint = function (key) {
  if (GY.cu) return _pbSetHint(key);
  const r = ROOMS[S.room], k = r.i + ':' + key; if (k === S.hintKey) return; S.hintKey = k;
  const touch = !!touchMode, want = {};
  if (key === '_ten') hintEl.innerHTML = '<b>' + r.name.toUpperCase() + '</b>' + (r === PE ? 'chưa có tinh anh' : '');
  else { const h = HINT[key] || '', txt = Array.isArray(h) ? h[touch ? 0 : 1] : h;
    hintEl.innerHTML = txt.replace(/\{(.)\}/g, (m, c) => { if (c === 'B') return touch ? 'Bấm' : 'Nhấn'; const q = CHIP[c]; if (!q) return m; if (touch) want[q[3]] = 1;
      return '<span class="k' + q[2] + '">' + (touch ? q[0] : q[1]) + '</span>'; }); }
  ['b-j', 'b-a', 'b-s', 'b-v', 'dpad'].forEach(id => document.getElementById(id).classList.toggle('pulse', !!want[id]));
};

// vào thẳng phòng B (mốc hồi sinh ẩn ở đầu phòng B – không vẽ chuông lưu mới)
const _pbNG = newGame;
newGame = function () {
  _pbNG(); DE.x = (PF.x0 + PF_SO.de.cot) * T + 16; DE.nong = 0; GY.phong = -1; GY.key = ''; GY.lan = {};
  if (PBK.vaoA) return;
  const VP = {c: PC, d: PD, e: PE, f: PF}[PBK.vaoX];
  if (VP) { placePlayer((VP.x0 + 2) * T + 6, FLOOR - pl.h); pl.face = 1; pl.drawT = 0; S.cp = {x: (VP.x0 + 2) * T + 16, y: FLOOR, on: true, ring: 0, cd: 0}; return; }
  placePlayer((PB.x0 + 3) * T + 6, FLOOR - pl.h); pl.face = 1; pl.drawT = P0_SO.ghi ? 0 : RUT_T;
  S.cp = {x: (PB.x0 + 3) * T + 16, y: FLOOR, on: true, ring: 0, cd: 0};
};
(document.getElementById('start-p0') || {}).textContent += ' · Trang thử PHÒNG B hướng mới – bước 3: A → F (D: 2 Bọ Vỏ Mộc, E: sân tinh anh trống, F: lò rèn), bộ đất mới, gợi ý ngắn theo tình huống. ?moi=0: tắt bộ mới.';

/* ======================= THỬ: API chụp / quay / đo (chỉ dùng với ?ghi=1) ======================= */
window.TVPB = {
  PBK, PB_SO, DHM,
  /* trạng thái gọn cho bot quay video */
  tt() { const f = q => ({x: +(q.x + q.w / 2).toFixed(1), st: q.st, t: q.t, dead: qDown(q), face: q.face});
    return {f: S.frame, x: +(pl.x + pl.w / 2).toFixed(1), face: pl.face, atkN: pl.atkN, hp: pl.hp, g: pl.onGround, q3: f(Q[3]), q4: f(Q[4]), camx: S.camx, room: S.room}; },
  doVe(n) { DO.reset(); for (let i = 0; i < n; i++) { savePrev(); step(); render(1); } const a = DO.ds.slice().sort((p, q) => p - q);
    return {n: a.length, tb: +(DO.tong / DO.n).toFixed(3), p50: +a[a.length >> 1].toFixed(3), p95: +a[Math.floor(a.length * 0.95)].toFixed(3), max: +DO.max.toFixed(3)}; },
  /* bước 3: trạng thái Bọ + đe (bot video D → F) */
  ttD() { return {f: S.frame, x: +(pl.x + pl.w / 2).toFixed(1), face: pl.face, hp: pl.hp, g: pl.onGround, room: S.room, pd: PD.i, pe: PE.i, pf: PF.i,
    de: DE.x, nong: +DE.nong.toFixed(2), camx: +S.camx.toFixed(1), goiy: hintEl.textContent,
    bo: BO.DS.map(b => ({x: +(b.x + b.w / 2).toFixed(1), st: b.st, t: b.t, hp: b.hp, mai: b.mai, face: b.face, nam: !!b.nam, vo: !!b.maiVo, chet: b.st === 'chet' || b.gone}))}; },
  /* bước 3: đặt camera thẳng (quay cuộn chậm A → F, không cần Lam đi): trục nền (rc) theo phòng ở giữa màn, như game */
  datCam(x) { S.camx = S.pcx = x; const r = ROOMS[roomAt(x + W / 2)], rc = r.x0 * T + r.w * T / 2 - W / 2; S.rc = S.prc = rc; render(1); return {room: r.name}; },
  camF, gioi: () => ({a0: PA.x0 * T, f1: (PF.x0 + PF.w) * T, cF: camF(), W, H, phong: PHONG_SO.map(([r]) => [r.name, r.x0 * T, (r.x0 + r.w) * T]), CW: 256, CH: 128}),
  /* bước 3: SOI RANH mảng đất nướng 256×128 khi camera ở (cx, cy) với tỉ lệ K: vẽ CHỈ lớp đất (DHM.veDat, đúng hàm game) 2 lần trên nền đen
     và nền trắng → điểm nào khác nhau = chưa phủ kín (alpha < 1). Đếm các điểm như vậy NẰM TRONG ô đặc có 8 ô kề cũng đặc (phải kín 100 %).
     Trả về số điểm hở + vài vị trí + ảnh vùng quanh 1 giao điểm ranh mảng (phóng 4×; cat = y của ranh ngang, true = gần sàn) để xem bằng mắt. */
  soiRanh(cx, cy, K, cat) {
    const w = Math.round(W * K), h = Math.round(H * K), mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const ve = mau => { const c = mk(), g = c.getContext('2d'); g.fillStyle = mau; g.fillRect(0, 0, w, h); g.setTransform(K, 0, 0, K, 0, 0);
      const ox2 = Math.round(cx * K) / K, oy2 = Math.round(cy * K) / K; DHM.veDat(g, ox2, oy2, K, W, H, GCH.cv); return [c, g.getImageData(0, 0, w, h).data, ox2, oy2]; };
    const [c0, d0, ox2, oy2] = ve('#000'), [, d1] = ve('#fff');
    const dac = (tx, ty) => { const c = tile(tx, ty); return c === '#' || c === 'S' || c === 'W'; };
    let ho = 0, ds = [], ranh = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const wx = ox2 + (x + 0.5) / K, wy = oy2 + (y + 0.5) / K, tx = Math.floor(wx / T), ty = Math.floor(wy / T);
      if (!DHM.coCot(tx) || ty < 0 || ty >= ROWS) continue;
      let trong = true; for (let a = -1; a <= 1 && trong; a++) for (let b = -1; b <= 1; b++) if (!dac(tx + a, ty + b)) { trong = false; break; }
      if (!trong) continue;
      const i = (y * w + x) * 4, dd = Math.abs(d0[i] - d1[i]) + Math.abs(d0[i + 1] - d1[i + 1]) + Math.abs(d0[i + 2] - d1[i + 2]);
      if (dd > 6) { ho++; if (ds.length < 12) ds.push([Math.round(wx), Math.round(wy), dd]);
        if (Math.abs(wx - Math.round(wx / 256) * 256) < 1.5 || Math.abs(wy - Math.round(wy / 128) * 128) < 1.5) ranh++; }
    }
    let url = null;
    if (cat) {   // ảnh phóng quanh giao điểm ranh mảng gần giữa màn
      const gx = Math.round((ox2 + W / 2) / 256) * 256, gy = cat === true ? Math.round((oy2 + H * 0.85) / 128) * 128 : cat, sx = (gx - ox2) * K, sy = (gy - oy2) * K, R = 24 * K;
      const z = document.createElement('canvas'); z.width = z.height = 4 * 2 * R; const g = z.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(c0, sx - R, sy - R, 2 * R, 2 * R, 0, 0, z.width, z.height);
      g.strokeStyle = 'rgba(255,0,255,.55)'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(z.width / 2, 0); g.lineTo(z.width / 2, z.height); g.moveTo(0, z.height / 2); g.lineTo(z.width, z.height / 2); g.stroke();
      url = z.toDataURL('image/png');
    }
    return {cx, cy, K, ox: ox2, oy: oy2, ho, ranh, ds, url};
  },
  so() { return {pbk: PBK.so, dhm: DHM.SO, hm: typeof HM !== 'undefined' ? HM.SO : null, vien: DHM.SO.vien_mau, loi: PBK.loi}; },
  /* ẢNH KIỂM LIỀN MÉP: dựng lưới giả bằng chính DHM.dung + DHM.veDat (cùng code với game), vẽ ra canvas riêng → data URL.
     kieu: 'hang-dai' | 'mang-4x4' | 'goc-lom' | 'be-don' | 'hanh-lang-tran';  k: phóng (1 = logic, 2 = cỡ ảnh 2x); vien: vẽ nét collider (đỏ = mặt trên, cam = cạnh) */
  kiemMep(kieu, k, vien) {
    const LUOI = {
      'hang-dai': ['........................................', '........................................', '........................................',
        '########################################', '########################################', '########################################', '########################################'],
      'mang-4x4': ['............', '............', '....####....', '....####....', '....####....', '....####....', '............', '............'],
      'goc-lom': ['##..........###', '##..........###', '##..........###', '##.......######', '##.......######', '###############', '###############', '###############', '###############'],
      'be-don': ['..............', '..............', '.######.......', '..............', '.......######.', '.......######.', '..............', '..#.....====..', '..............'],
      // hành lang trần kiểu phòng C: trần 4 hàng, cột treo 3 ô (trên cổng), tường phải, sàn; ván một chiều giữa hành lang
      'hanh-lang-tran': ['########################', '########################', '########################', '########################',
        '...............#.......#', '...............#.......#', '...............#.......#', '.......====............#', '.......................#', '.......................#',
        '########################', '########################']
    }[kieu];
    if (!LUOI) return null;
    const R = LUOI.length, C = LUOI[0].length, KK = k || 2, cvT = document.createElement('canvas'); cvT.width = C * T * KK; cvT.height = R * T * KK;
    const g = cvT.getContext('2d'); g.setTransform(KK, 0, 0, KK, 0, 0);
    g.fillStyle = '#5f7680'; g.fillRect(0, 0, C * T, R * T);   // nền xám xanh sáng: lộ mọi chỗ hở / viền sáng
    const tileG = (tx, ty) => (tx < 0 || tx >= C || ty >= R) ? (ty >= R ? LUOI[R - 1][Math.max(0, Math.min(C - 1, tx))] : '.') : (ty < 0 ? '#' : LUOI[ty][tx]);
    DHM.dung({T, ROWS: R, rows: R, WW: C, cot: [[0, C - 1]], tile: tileG, cuIdx: () => -1, cuK: GCH.k, cuTen: GCH.o, cuImg: GCH.cv, trangTri: []});
    DHM.veDat(g, 0, 0, KK, C * T, R * T, GCH.cv);
    if (vien) { g.lineWidth = 1 / KK * 1.5;
      for (let ty = 0; ty < R; ty++) for (let tx = 0; tx < C; tx++) {
        if (LUOI[ty][tx] === '=') { g.strokeStyle = '#ff3b3b'; g.setLineDash([3, 2]); g.beginPath(); g.moveTo(tx * T, ty * T); g.lineTo((tx + 1) * T, ty * T); g.stroke(); g.setLineDash([]); continue; }
        if (LUOI[ty][tx] !== '#') continue;
        const o = (a, b) => tileG(a, b) !== '#';
        if (o(tx, ty - 1) && ty > 0) { g.strokeStyle = '#ff3b3b'; g.beginPath(); g.moveTo(tx * T, ty * T); g.lineTo((tx + 1) * T, ty * T); g.stroke(); }
        g.strokeStyle = '#ffb02e';
        if (o(tx - 1, ty)) { g.beginPath(); g.moveTo(tx * T, ty * T); g.lineTo(tx * T, (ty + 1) * T); g.stroke(); }
        if (o(tx + 1, ty)) { g.beginPath(); g.moveTo((tx + 1) * T, ty * T); g.lineTo((tx + 1) * T, (ty + 1) * T); g.stroke(); }
        if (ty + 1 < R && o(tx, ty + 1)) { g.beginPath(); g.moveTo(tx * T, (ty + 1) * T); g.lineTo((tx + 1) * T, (ty + 1) * T); g.stroke(); } } }
    DHM.dung(PBK.optThat());   // dựng lại lưới thật
    return cvT.toDataURL('image/png');
  }
};
