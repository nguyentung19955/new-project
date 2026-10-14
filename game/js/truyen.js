// Cốt truyện tối thiểu, bỏ qua được. Nạp sau js/village.js và js/stage.js (bọc thêm update/draw của làng và ải, không sửa luật chơi).
//
//   Mở đầu        4 khung (≈ 20 giây, mỗi khung tự sang sau 5 giây, chạm để sang nhanh, nút "Bỏ qua"): linh khí làng cạn, ba yêu tinh
//                 thức dậy, ba em bé bị bắt, Cụ Đồ trao vũ khí sống cho Zed, bạn thân của ba em, lên đường cứu bạn. Chỉ chiếu MỘT lần lúc mới vào làng lần đầu
//                 (G.save.truyen.mo); người chơi cũ đã qua ải 1 thì không chiếu. Xem lại: Anh Mõ > "Âm thanh · Pin · Truyện" > "Xem lại truyện".
//   Trùm          trùm vùng và trùm nhỏ nói một câu khi ra mắt, một câu khi gục (bong bóng lời trên đầu, KHÔNG dừng trận).
//   Kết vùng      hạ trùm vùng lần đầu: về làng thì chiếu 2–3 câu (em bé được cứu, người làng nói). Hạ Hồ Tinh: thêm đoạn kết + mời Độ khó 2.
//   Người làng    mỗi người có một câu mới sau mỗi trùm vùng (3 mốc), nói một lần khi mở bảng của người đó.
// Bản lưu: G.save.truyen = { mo: 1 đã xem mở đầu, v: số đoạn kết vùng đã xem (0..3), n: { người: mốc đã nghe } }. Trường MỚI, tuỳ chọn:
// bản lưu cũ chưa có thì dựng theo tiến độ đang có (không chiếu lại những gì đã qua).
// Tắt: ?truyen=0 hoặc G.TRUYEN = false. Bot kiểm thử (G.botInput) không bao giờ gặp khung truyện.
(function () {
  'use strict';
  const G = window.G, ui = G.ui, T = G.theme, VS = G.villageScene, A = G.art;
  let tatQS = false;
  try { tatQS = /[?&]truyen=0(&|$)/.test(location.search || ''); } catch (e) { tatQS = false; }
  const TR = (G.truyen = { dang: null });
  TR.bat = () => !tatQS && G.TRUYEN !== false && !G.botInput;

  // ---------- lời thoại ----------
  const MO_DAU = [
    { nen: 'cayda', loi: 'Làng ven sông sống nhờ linh khí của cây đa nghìn tuổi. Một sáng, lá đa úa vàng, linh khí cạn dần.' },
    { nen: 'yeu', loi: 'Ba yêu tinh thức dậy: Mộc Tinh, cây cổ thụ ở Rừng già; Ngư Tinh, mực khổng lồ cầm rìu san hô ở Hang biển; Hồ Tinh, cáo chín đuôi đeo mặt nạ ở Lâu đài cổ.' },
    { nen: 'emBe', loi: 'Cu Tèo, Cái Bống, Cu Lì, ba bạn thân của Zed, đi tìm linh khí cho làng rồi bị yêu tinh bắt mất.' },
    { nen: 'cuti', ai: 'do', loi: 'Zed ơi, ba bạn đang chờ cháu. Cầm lấy vũ khí sống này: nó lớn lên theo cháu. Đi cứu bạn đi, Chú Lái Đò chờ ở bến!' },
  ];
  const VUNG = [
    [
      { ai: 'hunter', loi: 'Zed ơi! Rễ cây quấn tớ cả tuần, may mà cậu tới!' },
      { ai: 'do', loi: 'Rừng già thở lại rồi, cây đa đã nhú chồi. Nhưng gió biển lạnh lắm: Cái Bống còn kẹt ở Hang biển.' },
      { loi: 'Cu Tèo đã về làng, ngồi chơi ở sân đình. Cu Tèo dạy Zed đánh hiểm và bắn chưởng xa: xem ở Ông Từ.' },
    ],
    [
      { ai: 'healer', loi: 'Nước dưới hang lạnh buốt... Cảm ơn Zed đã lặn xuống tìm tớ!' },
      { ai: 'lai', loi: 'Biển êm rồi, đò lại chạy. Bên kia sông, Lâu đài cổ đỏ rực lửa: Cu Lì ở trong đó.' },
      { loi: 'Cái Bống đã về làng, ngồi chơi ở sân đình. Cái Bống dạy Zed giữ hiệu ứng lâu và chưởng hồi máu: xem ở Ông Từ.' },
    ],
    [
      { ai: 'wrestler', loi: 'Con cáo chín đuôi bắt tớ canh lửa cả tháng! Về nhà thôi, đói lắm rồi!' },
      { ai: 'do', loi: 'Ba yêu tinh đã ngủ lại. Linh khí về làng, cây đa xanh lá như xưa.' },
      { loi: 'Cu Lì đã về làng. Cu Lì dạy Zed gồng chịu đòn và chưởng to: xem ở Ông Từ.' },
    ],
  ];
  const KET = [
    { nen: 'hoi', loi: 'Tối ấy cả làng mở hội dưới gốc đa, mừng ba bạn trở về. Ai cũng cảm ơn Zed đã cứu bạn. Hết truyện... mà chưa hết đâu!' },
    { nen: 'hoi', ai: 'lai', loi: 'Đêm xuống, yêu tinh có thể thức dậy mạnh hơn. Muốn thử sức thì gặp chú, chạm "Độ khó 2" nhé!' },
  ];
  // Trùm: [câu ra mắt, câu khi gục]. Trùm nhỏ theo vùng.
  const TRUM = {
    moc: ['Ta là cây cổ thụ thành tinh, nấm độc mọc đầy thân. Linh khí của làng đã chảy vào rễ ta!', 'Lá rụng về cội... Rừng ơi, xanh lại đi...'],
    ngu: ['Tám xúc tu, một rìu san hô! Đứa bé con dám lội xuống hang của Ngư Tinh sao?', 'Sóng lặng rồi... Ta về đáy biển ngủ tiếp...'],
    ho: ['Chín đuôi lửa, một mặt nạ. Ngươi tưởng thắng được ta ư?', 'Lửa ở đuôi tắt rồi... Mặt nạ của ta nứt mất rồi...'],
    mini0: ['Nấm mọc sau mưa, ăn vào là ngủ quên! Hự hự!', 'Bào tử bay hết rồi... xẹp...'],
    mini1: ['Càng ta kẹp vỡ cả đá ngầm! Lùi lại!', 'Ối, gãy càng! Bò ngang chạy thôi!'],
    mini2: ['Gừừ! Lửa trong lâu đài này là của ta!', 'Gừ... lửa tàn rồi...'],
  };
  // Người làng: câu mới sau khi hạ Mộc Tinh, Ngư Tinh, Hồ Tinh
  const LANG = {
    lai: ['Rừng già yên rồi. Đò sang Hang biển được rồi đấy cháu.', 'Biển êm thật rồi! Chú chèo một mạch sang Lâu đài cổ.', 'Ba vùng yên ả. Muốn thử Độ khó 2 thì bảo chú.'],
    ren: ['Gỗ linh Rừng già đây rồi! Mang về ông rèn cho.', 'Vảy cá thần cứng thật, tôi lưỡi vào là bén lắm.', 'Lửa Lâu đài cổ thổi lò mới hừng làm sao!'],
    xen: ['Rừng xanh lại, nấm tươi về chợ, bà vui ghê.', 'Thuyền cá về bến rồi, chợ đông hẳn lên.', 'Cả làng mừng! Bà bán rẻ cho cháu... à mà thôi, giá cũ.'],
    may: ['Cu Tèo về rồi, để cô may cho nó cái áo mới.', 'Cái Bống lạnh run, cô đang dệt cho cái khăn.', 'Cu Lì đòi áo đỏ như lửa. Cô may ngay!'],
    do: ['Mộc Tinh là cây cổ thụ mọc đầy nấm độc. Cháu hạ được nó, Rừng già thở lại rồi.', 'Ngư Tinh là con mực khổng lồ cầm rìu san hô. Cháu hạ được nó, giỏi lắm!', 'Cáo lửa chín đuôi đeo mặt nạ cũng gục rồi. Chuyện Zed cứu bạn, lão ghi vào sách.'],
    tu: ['Cu Tèo chạy nhảy suốt sân đình. Ồn mà vui.', 'Cái Bống về, sân đình có tiếng hát rồi.', 'Đủ bốn bé rồi. Đình làng ấm hẳn lên.'],
    mo: ['Cốc cốc! Làng nước ơi, Zed hạ được Mộc Tinh rồi!', 'Cốc cốc! Biển êm, đò chạy, làng nước nghe chưa!', 'Cốc cốc cốc! Ba yêu tinh ngủ cả rồi! Mở hội thôi!'],
  };
  // ZED: nhân vật chính là Zed. Ba bạn vẫn bị bắt, vẫn được cứu, nhưng về làng thì DẠY Zed (lời Zed đã ghi thẳng vào các bảng trên;
  // bản Cu Tí / "đổi em bé" của cờ ?zed=0 đã xoá khi dọn code 13/10).
  TR.LOI = { MO_DAU, VUNG, KET, TRUM, LANG };
  // Bản tiếng Anh của mọi câu ở đây và ở bảng Cài đặt mới: tools/ngon-ngu/tu-dien/truyen-am-thanh.json (gộp vào js/ngon_ngu_en.js bằng tools/ngon-ngu/gop.py).


  // ---------- tiến độ trong bản lưu ----------
  const daHa = (sv, r) => !!(sv && sv.stars && sv.stars[r + '-4']);
  function soVung(sv) { let n = 0; while (n < 3 && daHa(sv, n)) n++; return n; }
  function st() {
    const sv = G.save;
    if (!sv) return null;
    let t = sv.truyen;
    if (!t || typeof t !== 'object' || Array.isArray(t)) t = sv.truyen = { mo: sv.stars && Object.keys(sv.stars).length ? 1 : 0, v: soVung(sv), n: {} };
    if (!t.n || typeof t.n !== 'object' || Array.isArray(t.n)) t.n = {};
    t.v = G.clamp(t.v | 0, 0, 3); t.mo = t.mo ? 1 : 0;
    return t;
  }
  TR.st = st;
  const luu = () => { try { G.persist(); } catch (e) { /* bỏ qua */ } };

  // ---------- trình chiếu (che hết cảnh bên dưới, chạm để sang khung, Bỏ qua) ----------
  TR.choi = function (ds, o) {
    if (!ds || !ds.length) return;
    TR.dang = { ds, i: 0, t: 0, o: o || {} };
    G.click = null; if (G.stalePointers) G.stalePointers();
  };
  function het() {
    const d = TR.dang; TR.dang = null;
    G.click = null; if (G.stalePointers) G.stalePointers();
    if (d && d.o.xong) { try { d.o.xong(); } catch (e) { /* bỏ qua */ } }
  }
  TR.het = het;
  function tiep() { const d = TR.dang; if (!d) return; d.i++; d.t = 0; if (d.i >= d.ds.length) het(); }
  TR.tiep = tiep;
  TR.update = function (dt) {
    const d = TR.dang;
    if (!d) return;
    d.t += dt;
    try { if (VS && G.scene === G.Village) VS.update(dt, true); } catch (e) { /* bỏ qua */ }
    const kp = G.keyP;
    if (kp.Escape) { kp.Escape = false; het(); return; }
    if ((kp.Enter || kp.Space || kp.KeyJ) && d.t > 0.25) { tiep(); return; }
    const f = d.ds[d.i];
    if (d.t > (f.giay || 5)) tiep();
  };
  const SKIP = [384, 6, 90, 32]; // nút Bỏ qua: cao 32 (khoảng 46 điểm trên iPhone cầm ngang)
  TR.SKIP = SKIP;
  TR.draw = function () {
    const d = TR.dang;
    if (!d) return;
    G.syncTaps = [];
    const f = d.ds[d.i], c = G.wx;
    try { veNen(f, d.t); } catch (e) { G.wxDat(c, 0, 0); c.fillStyle = '#120d10'; c.fillRect(0, 0, 480, 270); }
    G.wxDat(c, 0, 0);
    if (d.t < 0.35) { c.globalAlpha = 1 - d.t / 0.35; c.fillStyle = '#000'; c.fillRect(0, 0, 480, 270); c.globalAlpha = 1; }
    // khung chữ dưới đáy
    const size = 9, w = 448, x = 16, ten = f.ai ? tenAi(f.ai) : null;
    const lines = ui.wrap(f.loi, w - 14, size, true), h = Math.max(24, lines.length * (size + 3) + 15);
    const y = 260 - h;
    const ga = G.ux.globalAlpha; G.ux.globalAlpha = ga * Math.min(1, d.t / 0.3 + 0.2);
    T.dialog(x, y, w, ten, f.loi, { size, tail: f.ai ? 54 : -1 });
    G.ux.globalAlpha = ga;
    ui.text('Chạm để tiếp ›', 462, y - 5, { size: 7.5, align: 'right', color: '#f6dc92' });
    // chấm tiến độ
    const n = d.ds.length;
    for (let i = 0; i < n; i++) ui.rect(240 - n * 6 + i * 12 + 2, 14, 8, 3, i === d.i ? '#f6dc92' : 'rgba(246,220,146,0.35)');
    if (f.tieuDe) ui.text(f.tieuDe, 240, 34, { size: 10, bold: true, align: 'center', color: '#f6dc92' });
    if (T.sbtn(SKIP[0], SKIP[1], SKIP[2], SKIP[3], 'Bỏ qua ✕', { size: 8.5 })) { het(); return; }
    if (G.click) { const ok = d.t > 0.3; G.click = null; if (ok) tiep(); }
  };
  function tenAi(k) {
    if (VS && VS.NPCS && VS.NPCS[k]) return VS.NPCS[k].ten;
    if (G.HEROES[k]) return G.HEROES[k].name;
    return null;
  }

  // ---------- hình nền các khung ----------
  const VK = { // vũ khí cầm trong tay các em bé lúc vẽ (chỉ để vẽ)
    smith: { type: 'sword', family: 0, rarity: 3, marks: { fire: 300, poison: 0, ice: 0 }, branch: 'fire', sharpen: 0 },
    hunter: { type: 'bow', family: 0, rarity: 0, marks: { fire: 0, poison: 0, ice: 0 }, branch: null, sharpen: 0 },
    healer: { type: 'spear', family: 0, rarity: 0, marks: { fire: 0, poison: 0, ice: 0 }, branch: null, sharpen: 0 },
    wrestler: { type: 'hammer', family: 0, rarity: 0, marks: { fire: 0, poison: 0, ice: 0 }, branch: null, sharpen: 0 },
  };
  function emBe(c, key, x, y, s, face, vk) {
    G.wxDat(c, x, y, s);
    try { A.hero(c, { x: 0, y: 0, face: face || 1, key, move: false, t: G.time, atk: -1, dodge: -1, weapon: vk === false ? null : VK[key] }); } catch (e) { /* hình chưa sẵn thì bỏ */ }
    G.wxDat(c, 0, 0);
  }
  function lang(cam, dim) {
    const S = VS.state, cam0 = S.cam;
    S.cam = cam == null ? cam0 : cam;
    try { VS.drawWorld({ dim: dim, hideHero: true }); } finally { S.cam = cam0; }
  }
  function nguoi(c, k, x, y, s) {
    if (VS.NPCS[k]) { VS.putNpc(c, k, x, y, Math.floor(G.time * 2) % 3, { look: 1, noShadow: false }, s); G.wxDat(c, 0, 0); }
    else if (G.HEROES[k]) emBe(c, k, x, y, s, 1);
  }
  function la(c, t, mau) { // lá rơi
    for (let i = 0; i < 16; i++) {
      const sp = 14 + (i % 5) * 4, yy = ((t * sp + i * 37) % 200) + 20, xx = (i * 61 + Math.sin(t * 1.3 + i) * 14 + t * 6) % 480;
      c.fillStyle = mau[i % mau.length]; c.fillRect(Math.round(xx), Math.round(yy), 3, 2); c.fillRect(Math.round(xx) + 1, Math.round(yy) + 2, 1, 1);
    }
  }
  function veNen(f, t) {
    const c = G.wx, k = f.nen || 'lang';
    if (k === 'cayda') {
      lang(240, 0.2);
      G.wxDat(c, 0, 0);
      // màu úa: cảnh nhạt màu ngả vàng nâu (linh khí cạn)
      c.globalCompositeOperation = 'color'; c.globalAlpha = 0.7; c.fillStyle = '#9a7a40'; c.fillRect(0, 0, 480, 270);
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      la(c, t, ['#d8b04a', '#b88a2a', '#e8c86a']);
    } else if (k === 'yeu') {
      const gr = c.createLinearGradient(0, 0, 0, 270); gr.addColorStop(0, '#0b0912'); gr.addColorStop(0.7, '#22142a'); gr.addColorStop(1, '#120a10');
      G.wxDat(c, 0, 0); c.fillStyle = gr; c.fillRect(0, 0, 480, 270);
      const M = G.MOB_ART || { boss: {} }, ds = [['moc', 88, '#5aa04a'], ['ngu', 240, '#4a90c0'], ['ho', 392, '#e0603a']];
      ds.forEach((q, i) => {
        const x = q[1], y = 186, rr = G.REGIONS[i];
        const gl = c.createRadialGradient(x, y - 40, 4, x, y - 40, 70); gl.addColorStop(0, q[2] + '66'); gl.addColorStop(1, q[2] + '00');
        c.fillStyle = gl; c.fillRect(x - 80, y - 120, 160, 150);
        c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.ellipse(x, y, 34, 6, 0, 0, 7); c.fill();
        const art = M.boss && M.boss[rr.boss];
        if (art && G.monsterArt) {
          const s = 0.62 + 0.02 * Math.sin(t * 2 + i);
          G.wxDat(c, x, y, s);
          try { G.monsterArt.draw(c, art, 0, 0, { anim: 'idle', t: G.time + i, face: i === 0 ? 1 : -1, dir: i === 0 ? 0 : Math.PI, phase: 1 }); } catch (e) { /* bỏ */ }
          G.wxDat(c, 0, 0);
        }
      });
      ds.forEach((q, i) => ui.text(G.REGIONS[i].bossName, q[1], 60, { size: 10, bold: true, align: 'center', color: q[2] }));
    } else if (k === 'emBe') {
      G.wxDat(c, 0, 0);
      const ds = [['hunter', '#1e3a24', '#3a6a3a'], ['healer', '#12283c', '#2e5a7a'], ['wrestler', '#3a160e', '#7a3020']];
      ds.forEach((q, i) => {
        const x0 = i * 160;
        const gr = c.createLinearGradient(0, 0, 0, 270); gr.addColorStop(0, q[1]); gr.addColorStop(1, q[2]);
        c.fillStyle = gr; c.fillRect(x0, 0, 160, 270);
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x0 + 159, 0, 1, 270);
        emBe(c, q[0], x0 + 80, 168 + Math.round(Math.sin(t * 3 + i) * 1), 2.4, i === 2 ? -1 : 1, false);
        // song sắt / rễ cây / băng nhốt em bé
        const col = ['#5a3a20', '#a8d8f0', '#3a2a2a'][i];
        for (let j = 0; j < 6; j++) { c.fillStyle = col; c.fillRect(x0 + 40 + j * 16, 76, 3, 102); }
        c.fillRect(x0 + 34, 72, 92, 5); c.fillRect(x0 + 34, 176, 92, 5);
        ui.text(G.HEROES[q[0]].name, x0 + 80, 52, { size: 10, bold: true, align: 'center', color: '#f6dc92' });
        ui.text(G.REGIONS[i].name, x0 + 80, 64, { size: 7.5, align: 'center', color: '#e8dcc0' });
      });
    } else if (k === 'cuti') {
      lang(240, 0.25); // Cụ Đồ ngồi gốc đa bên trái (người trong cảnh), Cu Tí cầm vũ khí sống sáng rực ở giữa
      G.wxDat(c, 0, 0);
      const gl = c.createRadialGradient(250, 150, 4, 250, 150, 80); gl.addColorStop(0, 'rgba(255,190,90,' + (0.35 + 0.1 * Math.sin(t * 3)) + ')'); gl.addColorStop(1, 'rgba(255,190,90,0)');
      c.fillStyle = gl; c.fillRect(160, 60, 180, 180);
      emBe(c, 'smith', 250, 190, 2.5, -1);
    } else if (k === 'hoi') {
      lang(240, 0.3);
      G.wxDat(c, 0, 0);
      c.globalCompositeOperation = 'multiply'; c.fillStyle = '#9890c8'; c.fillRect(0, 0, 480, 270); c.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 9; i++) { // đèn lồng
        const x = 40 + i * 50, y = 40 + (i % 2) * 8 + Math.sin(t * 2 + i) * 1.5;
        c.fillStyle = 'rgba(255,170,80,0.25)'; c.beginPath(); c.arc(x, y, 10, 0, 7); c.fill();
        c.fillStyle = i % 3 ? '#e04a2a' : '#f0b030'; c.fillRect(x - 4, y - 5, 8, 10); c.fillStyle = '#ffd27a'; c.fillRect(x - 2, y - 3, 4, 6);
      }
      ['smith', 'hunter', 'healer', 'wrestler'].forEach((h, i) => emBe(c, h, 190 + i * 46, 190, 2, -1)); // ngồi quanh Cụ Đồ ở gốc đa
    } else {
      lang(240, 0.45); // nhìn về phía cây đa, khuất sân đình (không thấy em bé đang được kể là bị bắt)
    }
    if (f.ai && k === 'lang') { // người đang nói đứng to bên trái
      G.wxDat(c, 0, 0);
      const gl = c.createRadialGradient(70, 150, 4, 70, 150, 70); gl.addColorStop(0, 'rgba(255,230,170,0.22)'); gl.addColorStop(1, 'rgba(255,230,170,0)');
      c.fillStyle = gl; c.fillRect(0, 70, 150, 140);
      nguoi(c, f.ai, 70, 196, 3);
    }
    G.wxDat(c, 0, 0);
  }

  // ---------- khi nào chiếu ----------
  function moDau() { return MO_DAU.map((f, i) => Object.assign({ tieuDe: ['Linh khí cạn', 'Ba yêu tinh', 'Bị bắt', 'Lên đường'][i] }, f)); }
  function doanVung(r) {
    const ds = VUNG[r].map((f) => Object.assign({ nen: 'lang', giay: 5 }, f));
    return r === 2 ? ds.concat(KET.map((f) => Object.assign({ giay: 6 }, f))) : ds;
  }
  // Ở làng (bảng chính, không có hộp mời liên kết): chưa xem mở đầu thì chiếu; vừa hạ trùm vùng mới thì chiếu đoạn kết vùng đó.
  // Chỉ chiếu khi NGƯỜI CHƠI tự đi vào làng: từ màn chào (mở đầu) hoặc từ ải về (kết vùng). Bài kiểm tra nhảy thẳng vào làng
  // bằng G.setScene(G.Village) thì không gặp khung truyện (TR.cho chỉ được bật bên trong update/draw của màn chào và của ải).
  TR.cho = { mo: false, vung: false };
  function kiemTra() {
    if (!TR.bat() || TR.dang || (!TR.cho.mo && !TR.cho.vung)) return;
    const api = G.villageApi, V = api && api.V;
    if (!V || V.tab !== 'hub' || V.moi) return;
    const t = st(), sv = G.save, cho = TR.cho;
    TR.cho = { mo: false, vung: false };
    if (!t) return;
    if (!t.mo) {
      t.mo = 1; luu();
      if (cho.mo && !Object.keys(sv.stars || {}).length) { TR.choi(moDau(), { ten: 'mo' }); return; }
    }
    const n = soVung(sv);
    if (cho.vung && t.v < n) { const r = t.v; t.v = r + 1; luu(); TR.choi(doanVung(r), { ten: 'vung' + r }); }
  }
  TR.kiemTra = kiemTra;
  // Anh Mõ: xem lại mở đầu và các đoạn kết vùng đã qua
  TR.xemLai = function () {
    const t = st();
    let ds = moDau();
    for (let r = 0; r < Math.min(3, t ? t.v : 0); r++) ds = ds.concat(doanVung(r));
    TR.choi(ds, { ten: 'xemlai' });
  };
  // Người làng: câu mới theo mốc (số trùm vùng đã hạ), nói một lần khi mở bảng của người đó
  TR.loiMoi = function (k) {
    if (tatQS || G.TRUYEN === false) return null;
    const t = st(), m = soVung(G.save);
    if (!t || !m || !LANG[k]) return null;
    if ((t.n[k] | 0) >= m) return null;
    t.n[k] = m; luu();
    return LANG[k][m - 1];
  };

  // ---------- bọc cảnh làng ----------
  let tu = null; // đang chạy update/draw của cảnh nào (để biết lần đổi sang làng là do người chơi bấm)
  const boc = (sc, ten) => {
    if (!sc) return;
    for (const f of ['update', 'draw']) { const f0 = sc[f]; sc[f] = function () { const cu = tu; tu = ten; try { return f0.apply(this, arguments); } finally { tu = cu; } }; }
  };
  boc(G.Title, 'chao'); boc(G.StageScene, 'ai');
  const setScene0 = G.setScene;
  G.setScene = function (s) {
    const r = setScene0.apply(this, arguments);
    if (s === G.Village) { if (tu === 'chao') TR.cho.mo = true; else if (tu === 'ai') TR.cho.vung = true; }
    return r;
  };
  if (G.Village) {
    const u0 = G.Village.update, d0 = G.Village.draw;
    G.Village.update = function (dt) {
      if (TR.dang) { TR.update(dt); return; }
      try { kiemTra(); } catch (e) { /* bỏ qua */ }
      if (TR.dang) return;
      return u0.call(this, dt);
    };
    G.Village.draw = function () {
      if (TR.dang) { TR.draw(); return; }
      return d0.call(this);
    };
  }
  // mở bảng người làng: nói câu mới (nếu có), lâu hơn câu thường cho kịp đọc
  if (VS && VS.onTalk && G.villageApi) {
    const t0 = VS.onTalk;
    VS.onTalk = function (k) {
      t0(k);
      try { const l = TR.loiMoi(k); if (l) { G.villageApi.say(l); G.villageApi.V.msgT = 5; } } catch (e) { /* bỏ qua */ }
    };
  }

  // ---------- trùm nói (bong bóng lời, không dừng trận) ----------
  let bong = null, bongB = null, daGuc = false;
  function khoaTrum(b, S) { return b.kind === 'mini' ? 'mini' + G.clamp(S.r | 0, 0, 2) : b.kind; }
  function trumNhip(dt) {
    const S = G.getRun && G.getRun();
    if (!S || !S.W || !TR.bat() || G.noRender) { if (!S) { bong = null; bongB = null; } return; }
    const W = S.W, b = W.boss;
    if (b && b !== bongB) {
      bongB = b; daGuc = false;
      const L = TRUM[khoaTrum(b, S)];
      bong = L && !b.dead ? { b, s: L[0], t: 4.2, ten: b.name } : null;
    }
    if (b && !daGuc && (b.dead || b.dying != null || b.hp <= 0)) {
      daGuc = true;
      const L = TRUM[khoaTrum(b, S)];
      if (L) bong = { b, s: L[1], t: 3.4, ten: b.name, x: b.x, y: b.y };
    }
    if (bong && S.mode === 'play' && !S.trans) bong.t -= dt;
    if (bong && (bong.t <= 0 || bong.b !== W.boss)) bong = null;
  }
  function trumVe() {
    const S = G.getRun && G.getRun();
    if (!bong || !S || !S.W || S.mode !== 'play' || S.trans) return;
    const W = S.W, b = bong.b, cam = Math.round(W.cam || 0);
    const bx = (bong.x != null ? bong.x : b.x) - cam, by = bong.y != null ? bong.y : b.y;
    const hh = (b.drawH || b.h || 60) * (b.scale || 1), top = by - hh;
    const size = 8, w = 176, lines = ui.wrap(bong.s, w - 14, size, true), h = Math.max(24, lines.length * (size + 3) + 15);
    let x = G.clamp(bx - w / 2, 4, 476 - w), y = top - h - 6, tail = G.clamp(bx - x - 4, 10, w - 20);
    if (y < 58) { // trùm cao quá: đặt lời bên cạnh đầu trùm, đuôi chỉ về phía trùm
      y = G.clamp(top + 4, 58, 150);
      if (bx > 240) { x = G.clamp(bx - w - 24, 4, 476 - w); tail = w - 20; } else { x = G.clamp(bx + 24, 4, 476 - w); tail = 10; }
    }
    const a = Math.min(1, (4.2 - bong.t) / 0.2 + 0.1, bong.t / 0.35), ga = G.ux.globalAlpha;
    G.ux.globalAlpha = ga * G.clamp(a, 0, 1);
    T.dialog(x, y, w, bong.ten, bong.s, { size, tail });
    G.ux.globalAlpha = ga;
  }
  TR.bongTrum = () => bong; // cho kiểm thử
  if (G.StageScene) {
    const u0 = G.StageScene.update, d0 = G.StageScene.draw;
    G.StageScene.update = function (dt) { const r = u0.call(this, dt); try { trumNhip(dt); } catch (e) { /* bỏ qua */ } return r; };
    G.StageScene.draw = function () { const r = d0.call(this); try { trumVe(); } catch (e) { /* bỏ qua */ } return r; };
  }
})();
