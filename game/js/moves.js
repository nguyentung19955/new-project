// Lối đánh riêng của từng vũ khí: chuỗi kiếm, giương cung, loạt đâm của giáo, lấy đà của búa;
// và đặc trưng hệ mở theo cấp tiến hóa (G.HE).
// combat.js gọi sang đây qua G.moves. Mọi đòn vẫn đi qua playerHit và G.damage của combat.js,
// nên dấu ấn tiến hóa và thống kê cho trùm (hệ, đánh xa hay gần, số lần né) được ghi như cũ.
(function () {
  const G = window.G;
  const M = (G.moves = {});
  function FX(n, a, b, c, d, e) {
    if (G.noRender) return;
    const f = G.fx && G.fx[n];
    if (f) f(a, b, c, d, e);
  }

  // ---------- con số cân bằng của các lối đánh ----------
  // dur: thời gian một nhát (giây). mult: hệ số sát thương so với chỉ số vũ khí. reach, depth, len: điểm ảnh.
  G.MOVES = {
    tap: 0.16,  // giữ nút lâu hơn ngần này thì tính là "giữ", ngắn hơn là "bấm"
    hold: 0.8,  // lấy đà đầy rồi mà vẫn giữ quá ngần này giây thì đòn tự tung ra
    buffer: 0.25, // bấm sớm khi đòn trước chưa xong thì được nhớ trong ngần này giây
    // Tám hướng và chiêu riêng: mỗi loại vũ khí một đòn Đặc biệt riêng, đều theo hướng nhắm (tự ngắm quái gần nhất).
    // Tầm tính bằng frac lần bề ngang chỗ đứng được của phòng, kẹp trong [min, max] (phòng thường 190, phòng trùm 282).
    // Đo khoảng cách trên sàn: chiều dọc trên màn hình ngắn hơn thật (G.ZK), nên mọi vùng trúng tính trên sàn rồi mới vẽ.
    special: {
      // Trảm Nguyệt: phóng vệt chém hình trăng lưỡi liềm bay thẳng, xuyên mọi quái trên đường (mỗi con sau nhận fall lần con trước); bé lùi nửa bước.
      sword: { name: 'Trảm Nguyệt', frac: 0.66, min: 110, max: 170, speed: 330, half: 13, mult: 2.0, fall: 0.7, back: 9 },
      // Phi Thương: phóng cây giáo bay thẳng xuyên một hàng quái; con cuối cùng bị ghim (choáng), giáo cắm lại stick giây
      // rồi tự bay về tay, trúng lần nữa trên đường về. Giáo chưa về thì nút Đánh của cây giáo này là cú đấm tay (punch).
      spear: { name: 'Phi Thương', frac: 0.62, min: 110, max: 165, speed: 380, half: 9, mult: 1.6, pin: 1.0, stick: 0.6, backV: 420, backMult: 0.9, catchR: 12 },
      // Địa Chấn: nện xuống, vòng chấn nhỏ quanh người, rồi vệt nứt chạy theo hướng nhắm (báo trước warn giây), quái trên vệt bị hất tung choáng.
      hammer: { name: 'Địa Chấn', frac: 0.5, min: 90, max: 140, warn: 0.12, speed: 700, half: 15, mult: 2.1, stun: 0.9, ringR: 28, ringMult: 1.0, ringStun: 0.3, lift: 0.45 },
    },
    punch: { name: 'Đấm', dur: 0.3, mult: 0.45, reach: 18, depth: 14 }, // nút Đánh của giáo khi giáo đang bay (Phi Thương)
    sword: {
      gap: 0.45, // ngừng bấm quá lâu thì chuỗi về đầu
      chain: [
        // Sửa góp ý 3: kiếm nhanh nhất, tầm ngắn nhất, mỗi nhát nhẹ nhất trong ba vũ khí cận chiến; sức mỗi nhát 0,9/0,95/1,7 -> 1/1,05/1,8.
        // (Đã thử giữ sức cũ mà ra tay nhanh hơn, 0,27 giây: bot cầm kiếm lại thua ở vùng 3 vì cứ đứng chém liên tục, ít né.)
        { name: 'Chém ngang', dur: 0.3, mult: 1, reach: 32, depth: 20 },
        { name: 'Chém ngược', dur: 0.3, mult: 1.05, reach: 34, depth: 20 },
        { name: 'Nhát kết', dur: 0.46, mult: 1.8, reach: 40, depth: 30, push: 10, heavy: true, finish: 1 },
      ],
      glide: { name: 'Nhát lướt', win: 0.35, len: 30, t: 0.12, mult: 1.4 }, // đánh ngay sau khi Né
    },
    bow: {
      // Ghép đợt 2 (phòng vuông, sàn rộng 190, phòng trùm 282): tầm tên ngắn lại vừa một phòng; tên ngắm chéo được (aim).
      // Sửa góp ý 1: tên bay theo góc bất kỳ tới quái gần nhất. lead: đón đầu bấy nhiêu lần quãng quái chạy được trong lúc tên bay.
      // nock, nockX: tên sinh ra cách chân bé bấy nhiêu điểm ảnh theo hướng bắn (chỗ dây cung); z0: độ cao lúc rời dây cung,
      // hạ dần về zFly. hitX, hitY: vùng trúng rộng hơn thân quái bấy nhiêu điểm ảnh theo ngang và theo chiều sâu.
      lead: 0.85, nock: 8, nockX: 3, z0: 16, zFly: 11, hitX: 5, hitY: 8,
      rain: { mult: 0.34 }, // mưa tên (đòn Đặc biệt): mỗi đợt mưa (0,15 giây một đợt, chừng 6 đợt) gây bấy nhiêu lần lên mỗi quái trong vùng
      // Sửa góp ý 3: cung bắn nhanh hơn chút (0,4 -> 0,38 giây khi đứng yên), mỗi phát mạnh hơn (G.WTYPES.bow.dmg 9 -> 11) nhưng
      // đánh cụm yếu đi: tên thường xuyên qua thì con sau 0,75 -> 0,35 lần; tên mạnh xuyên tối đa 2 quái (trước 4), mỗi con sau
      // nhận 0,6 lần con trước; mưa tên mỗi đợt 0,5 -> 0,28.
      shot: { name: 'Bắn', still: 0.38, move: 0.45, mult: 1, speed: 290, range: 180, pierce: 1, pierceMult: 0.35 }, // tên thường xuyên thêm 1 quái, con sau chỉ nhận 0,35 lần
      charge: { name: 'Tên mạnh', time: 0.75, min: 0.3, slow: 0.55, mult0: 1.2, mult1: 3.0, speed: 340, range: 250, recover: 0.5, pierce: [1, 1, 2], pierceMult: 0.6 }, // pierce: số quái xuyên thêm khi đà thấp, trên 60%, đầy; pierceMult: con sau nhận bấy nhiêu lần con trước
    },
    spear: {
      gap: 0.45,
      chain: [
        // Ghép: giáo sống dài gần 60 điểm ảnh nên tầm đâm nới từ 54-56 lên 60-62, vòng quét từ 40 lên 44 cho khớp hình.
        // Sửa góp ý 3: giáo ở giữa kiếm và búa: ra tay chậm hơn kiếm (0,34/0,3/0,3 -> 0,38/0,34/0,34; quét 0,5 -> 0,52)
        // nên mỗi nhát mạnh hơn kiếm (đâm 0,85 -> 1,1; quét 1,5 -> 1,85).
        { name: 'Đâm', dur: 0.38, mult: 1.1, reach: 60, depth: 12 },
        { name: 'Đâm', dur: 0.34, mult: 1.1, reach: 60, depth: 12 },
        { name: 'Đâm', dur: 0.34, mult: 1.1, reach: 62, depth: 12 },
        { name: 'Quét vòng', dur: 0.52, mult: 1.85, r: 44, push: 8, heavy: true, sweep: true, finish: 1 },
      ],
      // giữ rồi thả: lao một đoạn ngắn xuyên qua quái (đòn Đặc biệt "Lao tới" thì dài hơn và làm choáng)
      charge: { name: 'Xốc tới', time: 0.5, min: 0.3, slow: 0.6, len0: 30, len1: 58, t: 0.16, mult0: 1.0, mult1: 2.2, depth: 12 },
    },
    hammer: {
      swing: { name: 'Nện', dur: 0.8, mult: 1, reach: 32, depth: 26 },
      // giữ để lấy đà 2 nấc; chưa tới nấc 1 mà thả thì chỉ là nhát thường
      charge: {
        name: 'Lấy đà', lv1: 0.5, time: 1.1, min: 0.45, slow: 0.45, recover: 0.7, ahead: 22, waveV: 200, waveDepth: 26, waveFrac: 0.45, // sóng chạy xa nhất 0,45 bề ngang phòng (phòng thường 85, phòng trùm đủ 96) và tan khi chạm tường
        slam: [null,
          // Ghép đợt 2: trong phòng vuông quái luôn đứng dồn, nện đất trúng cả đám (vùng nện nay tròn hơn), nên giảm 1,1 -> 1,0; 1,6 -> 1,25; sóng 0,6 -> 0,5.
          { name: 'Nện đất', mult: 1.0, r: 30, stun: 0, wave: { mult: 0.4, len: 60, stun: 0 } },
          { name: 'Nện đất mạnh', mult: 1.25, r: 38, stun: 0.7, wave: { mult: 0.5, len: 96, stun: 0.5 } }],
      },
    },
  };
  // ĐẶC TRƯNG HỆ THEO CẤP (mọi sát thương là hệ số nhân với chỉ số vũ khí):
  //   Mầm (lv 1):        chưa có luật hệ nào ở đây. Chỉ có tỉ lệ gây cháy, độc, chậm của G.PROC và vệt chém nhuốm màu hệ.
  //   Thành hình (lv 2): mở đặc trưng 1, thứ để lại trên sân: Lửa vệt cháy, Độc vũng độc, Băng gai băng làm chậm.
  //   Thức tỉnh (lv 3):  mở đặc trưng 2, phản ứng dây chuyền: Lửa quái đang cháy chết thì nổ lan, Độc quái đang trúng độc chết
  //                      thì lây sang con bên cạnh, Băng quái đóng băng bị đánh thì vỡ văng mảnh.
  // Đặc trưng không mạnh dần theo cấp: mở là có đủ. Vũ khí đang được phủ hệ (bùa, Nung) tính như Mầm.
  // Ghép đợt 2 (cân lại trong phòng vuông, vùng tròn nay rộng hơn theo G.ZK): vũng độc 0,8 -> 0,68; gai băng 0,4 -> 0,55; băng vỡ 0,7 và 0,5 -> 0,9 và 0,7.
  G.HE = {
    f1: 2, f2: 3, // mốc mở đặc trưng 1 và đặc trưng 2
    maxZones: 6,  // số vệt cháy, vũng độc cùng lúc trên sân
    fire: {
      // đặc trưng 1: nhát kết, đòn thả, đòn đặc biệt nổ ra rồi để lại vệt cháy đốt quái đi qua; tên lửa nổ khi trúng
      blast: 0.3, blastR: 28, trailR: 18, trailLife: 2.4, trailSrc: 0.5, trailEvery: 0.5, arrow: 0.13, arrowR: 20,
      // đặc trưng 2: quái đang cháy mà chết thì nổ, gây sát thương và làm cháy quái đứng gần (con bị cháy chết lại nổ tiếp)
      boom: 0.5, boomR: 34,
    },
    poison: {
      // đặc trưng 1: vũng độc, quái đứng trong mỗi giây thêm 1 tầng Độc; tên độc tách mảnh khi trúng
      cloudR: 25, cloudLife: 3.2, cloudSrc: 0.68, cloudEvery: 1, shards: 1, shard: 0.13, shardRange: 50, shardV: 210,
      // đặc trưng 2: quái đang trúng độc mà chết thì lây 2 tầng Độc sang quái đứng gần
      spreadR: 34, spread: 2,
    },
    ice: {
      // đặc trưng 1: gai băng mọc theo hướng đánh, gây sát thương và thêm tầng Băng (làm chậm); tên băng xuyên thêm 1 quái
      spikes: 0.55, spikeLen: 52, spikeDepth: 22, stacks: 1, pierce: 1,
      // đặc trưng 2: quái đang đóng băng bị đánh thì lớp băng vỡ, mảnh văng trúng quái quanh đó (mỗi lần đóng băng vỡ một lần)
      shatter: 0.9, shatterSelf: 0.7, shatterR: 36,
    },
  };
  // Một dòng chỉ dẫn cho mỗi vũ khí, hiện khi vào ải và lần đầu đổi sang vũ khí đó.
  G.MOVE_TIPS = {
    sword: 'Kiếm: bấm Đánh ra chuỗi 3 nhát, Né xong đánh ngay để lướt chém. Đặc biệt: Trảm Nguyệt phóng vệt chém xuyên quái.',
    bow: 'Cung: bấm để bắn nhanh, giữ rồi thả bắn tên mạnh. Đặc biệt: Mưa Tên rơi vào cụm quái gần nhất.',
    spear: 'Giáo: bấm để đâm rồi quét, giữ rồi thả để xốc tới. Đặc biệt: Phi Thương ném giáo ghim quái, giáo tự bay về.',
    hammer: 'Búa: giữ Đánh lấy đà, thả ra nện đất. Đặc biệt: Địa Chấn nện ra vệt nứt hất tung quái.',
  };
  const C = G.MOVES, HE = G.HE;

  // ---------- trạng thái đòn đánh trên người chơi (P.mv) ----------
  // Lớp vẽ nào cũng đọc được: name (tên đòn), step (nhịp trong chuỗi), chain (đã đánh mấy nhịp),
  // charge (tỉ lệ lấy đà 0..1), level (nấc lấy đà), prog (tiến độ đòn 0..1), holding (đang giữ để lấy đà).
  function st(P) {
    if (!P.mv) {
      P.mv = {
        name: '', kind: '', step: 0, chain: 0, charge: 0, level: 0, prog: 0, holding: false,
        holdT: 0, wasHeld: false, relP: false, buf: 0, pressBuf: 0, chargeT: 0, fullT: 0,
        afterDodge: 0, wasDodge: false, wid: null, cur: null, lastT: -9, gap: 0.45, dashDur: 0, tips: {}, tipWait: null,
      };
    }
    return P.mv;
  }
  M.state = st;
  function cancel(mv) { mv.holding = false; mv.charge = 0; mv.level = 0; mv.chargeT = 0; mv.fullT = 0; }
  const reachOf = (w, r) => r * (G.wHas(w, 'reach') ? 1.15 : 1);
  // Mức hiệu ứng hệ của vũ khí: null nếu đòn đang không mang hệ. lv 1..3 theo mốc Mầm, Thành hình, Thức tỉnh.
  function heOf(P, w) {
    const el = G.activeEl(P, w);
    if (!el) return null;
    return { el, lv: w.branch === el ? Math.max(1, G.wStage(w)) : 1 };
  }
  M.heOf = heOf;
  const has1 = (h) => !!h && h.lv >= HE.f1; // đã mở đặc trưng 1 (Thành hình)
  const has2 = (h) => !!h && h.lv >= HE.f2; // đã mở đặc trưng 2 (Thức tỉnh)

  // V79 (O4): mỗi loại vũ khí chỉ nhắc một lần trong cả trò chơi (ghi vào bản lưu G.save.tut.mv), không lặp lại đầu mọi ải.
  function tipSeen() {
    const sv = G.save;
    if (!sv) return null;
    if (!sv.tut || typeof sv.tut !== 'object') sv.tut = {};
    if (!sv.tut.mv || typeof sv.tut.mv !== 'object') sv.tut.mv = {};
    return sv.tut.mv;
  }
  function tip(P, mv, w, W) {
    if (mv.tips[w.type] || !G.MOVE_TIPS[w.type]) return;
    const seen = tipSeen();
    if (seen && seen[w.type]) { mv.tips[w.type] = true; if (mv.tipWait === w.type) mv.tipWait = null; return; } // đã xem ở ải trước
    if (W.banner && !W.banner.tip) { mv.tipWait = w.type; return; } // đang có thông báo khác: chờ nó tắt
    mv.tips[w.type] = true; mv.tipWait = null;
    if (seen) seen[w.type] = 1;
    W.banner = { s: G.MOVE_TIPS[w.type], col: '#ffd27a', t: 5, tip: true };
  }

  // Gọi mỗi khung cho người chơi, kể cả lúc đang lăn né hay lướt: theo dõi nút Đánh được bấm, giữ, thả.
  M.input = function (P, inp, dt) {
    const mv = st(P), w = G.curW(P), W = G.getWorld();
    const held = !!(inp.atk || inp.atkP);
    // hướng đang kéo cần điều khiển (dùng để nhắm khi không có quái trong tầm)
    const sl = Math.hypot(inp.mx || 0, inp.my || 0);
    if (sl > 0.12) { P.stickX = inp.mx / sl; P.stickY = inp.my / sl; } else { P.stickX = null; P.stickY = null; }
    mv.relP = !held && mv.wasHeld;
    if (held && !mv.wasHeld) { mv.holdT = 0; mv.pressBuf = C.buffer; }
    if (held) mv.holdT += dt;
    if (mv.relP && !mv.holding) mv.buf = C.buffer;
    mv.wasHeld = held;
    // V7: đang lộn thì bộ nhớ nút Đánh không trôi (bấm Đánh ngay đầu cú lộn vẫn ra đòn khi lộn xong, ví dụ Nhát lướt)
    const rolling = P.dodgeT > 0;
    if (mv.buf > 0 && !mv.relP && !rolling) mv.buf -= dt;
    if (mv.pressBuf > 0 && !held && !rolling) mv.pressBuf -= dt;
    if (mv.afterDodge > 0) mv.afterDodge -= dt;
    if (P.dodgeT > 0) mv.wasDodge = true;
    else if (mv.wasDodge) { mv.wasDodge = false; mv.afterDodge = C.sword.glide.win; }
    if (P.dashOpt && !(P.dashT > 0)) P.dashOpt = null;
    if (!w) return;
    if (mv.wid !== w.id) { if (mv.wid != null) P.hitDone = true; mv.wid = w.id; cancel(mv); mv.chain = 0; mv.buf = 0; mv.cur = null; tip(P, mv, w, W); } // đổi vũ khí giữa chừng: bỏ nhát đang vung dở
    else if (mv.tipWait && !W.banner) tip(P, mv, w, W);
    // lăn né, lướt, tung đòn đặc biệt hay kỹ năng thì bỏ phần đà đang lấy
    if (mv.holding && (P.dodgeT > 0 || P.dashT > 0 || P.specT > 0 || P.castT > 0 || P.dead)) cancel(mv);
    if (mv.chain > 0 && !(P.atkT > 0) && G.time - mv.lastT > mv.gap) mv.chain = 0;
    const busy = P.atkT > 0 || P.dashT > 0;
    mv.prog = P.atkT > 0 ? 1 - P.atkT / P.atkDur : P.dashT > 0 && mv.dashDur > 0 ? G.clamp(1 - P.dashT / mv.dashDur, 0, 1) : 0;
    if (!busy && !mv.holding) { mv.name = ''; mv.kind = ''; }
  };
  // Đi chậm lại trong lúc lấy đà
  M.speed = function (P) {
    const mv = P.mv;
    if (!mv || !mv.holding) return 1;
    const cfg = C[G.curW(P).type];
    return cfg && cfg.charge ? cfg.charge.slow : 1;
  };

  // ---------- TÁM HƯỚNG ----------
  // Mọi đòn của người chơi ra theo một hướng nhắm (P.aimX, P.aimY: vector dài 1, đo trên sàn, tức chiều dọc đã chia G.ZK):
  // quái gần nhất trong tầm của đòn, không có thì hướng đang kéo cần, không thì hướng đi cuối, cuối cùng mới là hướng mặt.
  // Hình em bé chỉ lật trái phải (P.face); vũ khí, vệt chém, vùng trúng xoay theo góc thật (P.aimRel, P.aimUx, P.aimUy trên màn hình).
  const ZK = () => G.ZK || 0.85;
  // V6: đang đẩy cần thì tự ngắm chỉ bỏ qua quái ở HẲN phía sau lưng (lệch quá ~100 độ so với hướng cần), để không lao ngược;
  // quái ở trước mặt hoặc hai bên vẫn được ngắm như cũ. Không đẩy cần thì như cũ: quái gần nhất mọi hướng.
  // (Hotfix 10/10: nón ±60 độ quá hẹp — giáo đâm theo hướng cần thay vì vào quái lệch bên.)
  const CONE = -0.17; // cos 100 độ
  function inCone(P, e) {
    if (G.AIM_CONE == null || P.stickX == null) return true; // chủ dự án 10/10: điện thoại khó nhắm → luôn tự ngắm vào quái gần nhất mọi hướng (đặt G.AIM_CONE = số cos để bật lại nón)
    const dx = e.x - P.x, dy = (e.y - P.y) / ZK(), d = Math.hypot(dx, dy);
    if (d < 1e-6) return false;
    return (dx * P.stickX + dy * P.stickY) / d >= G.AIM_CONE;
  }
  M.inCone = inCone;
  function aimM(P, range) {
    const k = ZK();
    let best = null, bd = 1e9;
    for (const e of G.targets()) {
      if (!inCone(P, e)) continue;
      const d = Math.hypot(e.x - P.x, (e.y - P.y) / k) - e.r;
      if (d < range && d < bd) { bd = d; best = e; }
    }
    let ux, uy;
    if (best && Math.hypot(best.x - P.x, best.y - P.y) > 1) { ux = best.x - P.x; uy = (best.y - P.y) / k; }
    else if (P.stickX != null) { ux = P.stickX; uy = P.stickY; }
    else if (P.ldx != null) { ux = P.ldx; uy = P.ldy; }
    else { ux = P.face; uy = 0; }
    const d = Math.hypot(ux, uy) || 1;
    ux /= d; uy /= d;
    setAimM(P, ux, uy);
    return { ux, uy, e: best };
  }
  function setAimM(P, ux, uy) {
    P.aimX = ux; P.aimY = uy;
    const sy = uy * ZK(), sl = Math.hypot(ux, sy) || 1;
    setAim(P, ux / sl, sy / sl);
  }
  M.aimM = aimM;
  function aim(P, reach) { return aimM(P, reach + 34); }
  // Quái e có nằm trong hình chữ nhật xoay: gốc (o.x, o.y), chạy theo (ux, uy) dài reach, lùi sau gốc back, rộng depth.
  // Nằm ngang thì đúng bằng hộp cũ (lệch dọc tối đa depth/2 + e.hr trên màn hình).
  function inBox(o, e, ux, uy, reach, depth, back) {
    const k = ZK(), dx = e.x - o.x, dy = (e.y - o.y) / k;
    const a = dx * ux + dy * uy, b = Math.abs(dy * ux - dx * uy);
    const half = Math.abs(ux) * (depth / 2 + e.hr) / k + Math.abs(uy) * (depth / 2 + e.r);
    return a > -(back == null ? 8 + e.r * 0.5 : back + e.r) && a < reach + e.r && b <= half;
  }
  M.inBox = inBox;
  // Đồ vật trên sàn (chậu than, nấm, đá băng) nằm trong hình chữ nhật xoay thì kích nổ
  function propsBox(o, ux, uy, reach, depth) {
    const W = G.getWorld();
    for (const pr of W.props) if (pr.env && !pr.used && inBox(o, { x: pr.x, y: pr.y, r: 4, hr: 4 }, ux, uy, reach + 4, depth + 6, 4)) G.triggerProp(pr);
  }
  // Điểm cách gốc s điểm ảnh trên sàn theo hướng (ux, uy), đổi ra chỗ trên màn hình
  const along = (x, y, ux, uy, s) => [x + ux * s, y + uy * s * ZK()];
  M.along = along;
  // Quãng xa nhất đi được từ (x, y) theo hướng (ux, uy) trước khi chạm tường (trên sàn)
  function wallLen(x, y, ux, uy, max) {
    const W = G.getWorld(), k = ZK(), x1 = W.px1 != null ? W.px1 : W.x1;
    let L = max;
    if (ux > 1e-4) L = Math.min(L, (x1 - x) / ux); else if (ux < -1e-4) L = Math.min(L, (W.x0 - x) / ux);
    if (uy > 1e-4) L = Math.min(L, (W.y1 - y) / k / uy); else if (uy < -1e-4) L = Math.min(L, (W.y0 - y) / k / uy);
    return Math.max(0, L);
  }
  M.wallLen = wallLen;
  // Quái e có nằm trên dải quét từ (ax,ay) tới (bx,by) không (đo trên sàn): dọc dải nới thêm thân quái + 4 ở hai đầu,
  // ngang dải không quá half (cộng thân quái theo hướng). Trả về vị trí dọc dải (để xếp thứ tự trúng), không trúng thì -1.
  function onStrip(e, ax, ay, bx, by, ux, uy, half) {
    const k = ZK(), L = Math.hypot(bx - ax, (by - ay) / k), px = e.x - ax, py = (e.y - ay) / k;
    const a = px * ux + py * uy, b = Math.abs(py * ux - px * uy);
    return a >= -e.r - 4 && a <= L + e.r + 4 && b <= padOf(e, ux, uy, half) ? a : -1e9;
  }
  M.onStrip = onStrip;
  // Bề rộng (nửa) của một dải đi qua quái e theo hướng (ux, uy): nằm ngang thì tính chiều cao thân (đã đổi ra sàn), dọc thì bề ngang thân.
  const padOf = (e, ux, uy, half) => half + Math.abs(ux) * e.hr / ZK() + Math.abs(uy) * e.r;
  M.padOf = padOf;
  // Bắt đầu một nhát: phase > 0 là vào thẳng giữa động tác (dùng khi thả đòn đã lấy đà sẵn).
  function begin(P, w, o, dur, phase) {
    const mv = P.mv;
    P.atkDur = dur; P.atkT = dur * (1 - (phase || 0)); P.cdT = P.atkT; P.hitDone = false; P.lastAtk = G.time;
    P.comboI = o.pose || 0;
    mv.name = o.name; mv.kind = o.kind; mv.step = o.step || 0; mv.cur = o; mv.lastT = G.time + P.atkT;
    G.sfx('swing', w.type === 'hammer' ? 0.6 : 1);
  }
  function gain(P, w, n) {
    if (n <= 0) return;
    P.mana = Math.min(P.maxmana, P.mana + P.manaHit + (G.wHas(w, 'mana') ? 1 : 0));
    G.sfx('hit');
  }
  // Đánh mọi quái trong hộp trước mặt. Trả về danh sách quái trúng đòn.
  // Hộp trúng xoay theo hướng nhắm (không còn lọc "phía trước" theo P.face)
  function boxHit(P, reach, depth, mult, o) {
    const ux = P.aimX != null ? P.aimX : P.face, uy = P.aimX != null ? P.aimY : 0, out = [];
    o = Object.assign({ dir: ux < 0 ? -1 : 1 }, o);
    for (const e of G.targets()) if (inBox(P, e, ux, uy, reach, depth)) { G.cb.playerHit(e, mult, o); out.push(e); }
    propsBox(P, ux, uy, reach, depth);
    return out;
  }
  // Đẩy lùi theo hướng nhắm
  function push(P, list, d) {
    const ux = P.aimX != null ? P.aimX : P.face, uy = P.aimX != null ? P.aimY : 0;
    for (const e of list) if (!e.dead && !e.isBoss) { e.x += ux * d; e.y += uy * d * ZK(); }
  }
  const aimOf = (P) => (P.aimX != null ? [P.aimX, P.aimY] : [P.face, 0]);
  // Bắt đầu một cú lướt theo hướng nhắm: len điểm ảnh trên sàn trong t giây (combat.js đi theo P.dashVx, P.dashVy, dừng ở tường)
  function dashGo(P, len, t) {
    const [ux, uy] = aimOf(P);
    P.dashT = t; P.dashVx = (len / t) * ux; P.dashVy = (len / t) * uy * ZK(); P.dashV = P.dashVx;
    P.dashUx = ux; P.dashUy = uy;
    P.dashNe = false; // mặc định đòn lao không huỷ bằng Né được (Nhát lướt bật lại sau)
  }
  function swingFx(P, w, o, extra) {
    if (G.noRender) return;
    const h = heOf(P, w);
    const info = Object.assign({ type: w.type, move: o.kind, name: o.name, step: o.step || 0, combo: o.pose || 0, reach: o.reach || 0, depth: o.depth || 0, el: h ? h.el : null, lv: h ? h.lv : 0, stage: G.wStage(w), aim: true }, extra || {});
    if (G.fx && G.fx.mvSwing) FX('mvSwing', P, info); else FX('swing', P, info);
  }

  // ---------- kiếm ----------
  function swordChain(P, w) {
    const mv = P.mv, i = mv.chain % 3, m = C.sword.chain[i];
    aim(P, reachOf(w, m.reach));
    begin(P, w, { kind: 'chem', name: m.name, step: i, pose: i, m, reach: reachOf(w, m.reach), depth: m.depth }, m.dur);
    mv.chain = i + 1; mv.gap = C.sword.gap;
  }
  function swordGlide(P, w) {
    const mv = P.mv, g = C.sword.glide;
    mv.afterDodge = 0;
    aimM(P, g.len + 30);
    dashGo(P, g.len, g.t); P.dashHit = []; P.dashMult = g.mult; P.dashStun = 0; P.dashOpt = { stun: 0 };
    P.dashNe = true; // V33: Nhát lướt huỷ được bằng Né (combat.js, đoạn lướt)
    P.inv = Math.max(P.inv, g.t); // V33: đang lướt thì không dính đòn, như Xốc tới
    P.atkT = g.t; P.atkDur = g.t; P.cdT = g.t + 0.08; P.hitDone = true; P.lastAtk = G.time; P.comboI = 0;
    mv.name = g.name; mv.kind = 'luot'; mv.step = 0; mv.cur = null; mv.dashDur = g.t;
    mv.chain = 1; mv.gap = C.sword.gap; mv.lastT = G.time + g.t; // nhát lướt thay cho nhát đầu của chuỗi
    G.sfx('swing', 1.3);
    swingFx(P, w, { kind: 'luot', name: g.name, reach: g.len + 14, depth: 24 });
  }

  // ---------- cung ----------
  // Sửa góp ý 1: mọi phát bắn của cung tự ngắm vào quái gần nhất theo góc bất kỳ (lên, xuống, chéo, sau lưng), đón đầu nhẹ
  // quái đang chạy. Trước đây tên luôn bay với vận tốc ngang đầy đủ và chỉ chếch dọc tối đa 0,7 lần, quái ở thẳng trên/dưới
  // bị bỏ qua (chỉ tìm quái lệch dọc dưới 60) nên tên bay ngang qua mặt quái.
  // Vận tốc quái đo từ chỗ đứng các khung trước (M.update), để đón đầu.
  function track(dt) {
    if (!(dt > 0)) return;
    const k = Math.min(1, dt * 20);
    for (const e of G.targets()) {
      if (e.lx != null) {
        const vx = G.clamp((e.x - e.lx) / dt, -220, 220), vy = G.clamp((e.y - e.ly) / dt, -220, 220);
        e.avx = (e.avx || 0) + (vx - (e.avx || 0)) * k; e.avy = (e.avy || 0) + (vy - (e.avy || 0)) * k;
      }
      e.lx = e.x; e.ly = e.y;
    }
  }
  // Quái gần nhất trong tầm, theo khoảng cách thật trên sàn (không phân biệt trước mặt hay sau lưng, trên hay dưới).
  function bowTarget(P, range) {
    let best = null, bd = 1e9;
    for (const e of G.targets()) {
      if (!inCone(P, e)) continue; // V6: đang đẩy cần thì chỉ ngắm quái phía hướng cần
      const d = Math.hypot(e.x - P.x, e.y - P.y) - e.r;
      if (d < range && d < bd) { bd = d; best = e; }
    }
    return best;
  }
  // Chỗ sẽ ngắm vào quái e với tên bay tốc độ speed: đón đầu theo vận tốc quái (C.bow.lead lần quãng quái chạy được).
  function leadPoint(P, e, speed) {
    let tx = e.x, ty = e.y;
    for (let i = 0; i < 2; i++) {
      const t = Math.min(0.8, Math.hypot(tx - P.x, ty - P.y) / speed);
      tx = e.x + (e.avx || 0) * t * C.bow.lead; ty = e.y + (e.avy || 0) * t * C.bow.lead;
    }
    return [tx, ty];
  }
  // Hướng bắn (ux, uy dài 1). Không có quái thì theo hướng đang đi, đứng yên thì theo hướng mặt. Quay mặt theo hướng bắn
  // và ghi P.aimRel (độ, 0 là thẳng trước mặt, âm là chếch lên) cho lớp vẽ xoay cung, tay và mũi tên cùng một hướng.
  function bowAim(P, range, speed) {
    const e = bowTarget(P, range);
    let ux, uy;
    if (e) {
      const q = leadPoint(P, e, speed), dx = q[0] - P.x, dy = q[1] - P.y, d = Math.hypot(dx, dy);
      if (d < 1) { ux = P.face; uy = 0; } else { ux = dx / d; uy = dy / d; }
    } else if (P.moving && P.ldx != null) { ux = P.ldx; uy = P.ldy; }
    else { ux = P.face; uy = 0; }
    setAim(P, ux, uy);
    return { e, ux, uy };
  }
  function setAim(P, ux, uy) {
    if (Math.abs(ux) > 0.12) P.face = ux > 0 ? 1 : -1;
    P.aimRel = G.clamp((Math.atan2(uy, ux * P.face) * 180) / Math.PI, -90, 90);
    P.aimUx = ux; P.aimUy = uy;
  }
  M.bowAim = bowAim;
  // Tâm của đòn dạng vùng (mưa tên, bẫy): quái gần nhất trong tầm, dời về giữa cụm quái quanh nó. Không có quái: null.
  M.bowSpot = function (P, range, r, lead) {
    const e = bowTarget(P, range);
    if (!e) return null;
    const lt = lead || 0.3;
    let sx = 0, sy = 0, n = 0;
    for (const t of G.targets()) {
      if (Math.hypot(t.x - e.x, t.y - e.y) <= r * 0.9) { sx += t.x + (t.avx || 0) * lt; sy += t.y + (t.avy || 0) * lt; n++; }
    }
    let x = sx / n, y = sy / n;
    // vẫn phải phủ chắc con gần nhất
    const ex = e.x + (e.avx || 0) * lt, ey = e.y + (e.avy || 0) * lt, d = Math.hypot(x - ex, y - ey), lim = r * 0.5;
    if (d > lim) { x = ex + ((x - ex) / d) * lim; y = ey + ((y - ey) / d) * lim; }
    setAim(P, x - P.x || P.face, y - P.y);
    return { x, y, e };
  };
  function shoot(P, w, o) {
    const W = G.getWorld(), h = heOf(P, w);
    const col = h ? G.EL[h.el].col : '#f1ead9';
    const A = bowAim(P, o.range + 10, o.speed), B = C.bow;
    // tên sinh ra ở dây cung (chỗ cung đang chĩa theo hướng bắn) nhưng đoạn kiểm tra trúng đầu tiên bắt đầu từ giữa người,
    // nên quái đứng sát hay chồng lên người vẫn trúng, không có vùng chết ở cự ly gần.
    W.projs.push({
      team: 'player', kind: 'arrow', x: P.x + P.face * B.nockX + A.ux * B.nock, y: P.y + A.uy * B.nock, px: P.x, py: P.y, fresh: true, z: B.z0,
      vx: A.ux * o.speed, vy: A.uy * o.speed, t: o.range / o.speed, w, mult: o.mult,
      pierce: (o.pierce || 0) + (has1(h) && h.el === 'ice' ? HE.ice.pierce : 0), big: !!o.big, col, seen: [], he: h, charged: o.charged || 0, pierceMult: o.pierceMult,
    });
  }
  function bowTap(P, w) {
    const s = C.bow.shot;
    bowAim(P, s.range + 10, s.speed);
    // đứng yên thì giương nhanh hơn một chút so với vừa chạy vừa bắn
    begin(P, w, { kind: 'ban', name: s.name, pose: 0, arrow: { mult: s.mult, speed: s.speed, range: s.range, pierce: s.pierce || 0, pierceMult: s.pierceMult } }, P.moving ? s.move : s.still);
  }
  function bowRelease(P, w, c) {
    const ch = C.bow.charge, full = c >= 1;
    const o = { kind: 'banManh', name: ch.name, pose: 2, charge: c };
    begin(P, w, o, ch.recover, 0.45); // dây cung đã căng sẵn: buông tên ngay
    P.hitDone = true;
    shoot(P, w, { mult: ch.mult0 + (ch.mult1 - ch.mult0) * c, speed: ch.speed, range: ch.range * (0.7 + 0.3 * c), pierce: full ? ch.pierce[2] : c > 0.6 ? ch.pierce[1] : ch.pierce[0], pierceMult: ch.pierceMult, big: true, charged: c });
    swingFx(P, w, o, { charge: c });
  }

  // ---------- giáo ----------
  function spearTap(P, w) {
    const mv = P.mv, i = mv.chain % 4, m = C.spear.chain[i];
    aim(P, reachOf(w, m.reach || m.r));
    if (m.sweep) begin(P, w, { kind: 'quet', name: m.name, step: i, pose: 3, m, reach: reachOf(w, m.r) }, m.dur);
    else begin(P, w, { kind: 'dam', name: m.name, step: i, pose: i, m, reach: reachOf(w, m.reach), depth: m.depth }, m.dur);
    mv.chain = i + 1; mv.gap = C.spear.gap;
  }
  function spearLunge(P, w, c) {
    const mv = P.mv, ch = C.spear.charge;
    aimM(P, ch.len1 + 20);
    const len = ch.len0 + (ch.len1 - ch.len0) * c;
    dashGo(P, len, ch.t); P.dashHit = []; P.dashMult = ch.mult0 + (ch.mult1 - ch.mult0) * c; P.dashStun = 0;
    P.dashOpt = { stun: 0, heavy: c >= 1 };
    P.inv = Math.max(P.inv, ch.t); // đang xuyên qua quái thì không dính đòn
    P.atkT = ch.t; P.atkDur = ch.t; P.cdT = ch.t + 0.2; P.hitDone = true; P.lastAtk = G.time; P.comboI = 2;
    mv.name = ch.name; mv.kind = 'xoc'; mv.step = 0; mv.cur = null; mv.dashDur = ch.t; mv.chain = 0; mv.lastT = G.time + ch.t;
    G.sfx('swing', 1.4);
    swingFx(P, w, { kind: 'xoc', name: ch.name, reach: len, depth: ch.depth }, { charge: c });
    if (c >= 0.5) finish(P, w, { x: P.x, y: P.y, ux: P.aimX, uy: P.aimY, power: 0.5 + 0.5 * c, line: Math.max(12, wallLen(P.x, P.y, P.aimX, P.aimY, len)) });
  }
  // Giáo đang bay (Phi Thương): nút Đánh của chính cây giáo này là cú đấm tay yếu
  function punch(P, w) {
    const m = C.punch;
    aim(P, m.reach);
    begin(P, w, { kind: 'dam', name: m.name, pose: 0, m, reach: m.reach, depth: m.depth, fist: true }, m.dur);
  }

  // ---------- búa ----------
  function hammerTap(P, w) {
    const m = C.hammer.swing;
    aim(P, reachOf(w, m.reach));
    begin(P, w, { kind: 'nen', name: m.name, pose: 0, m, reach: reachOf(w, m.reach), depth: m.depth }, m.dur);
  }
  function hammerRelease(P, w, c, lv) {
    const ch = C.hammer.charge, sl = ch.slam[lv];
    if (!sl) { hammerTap(P, w); return; }
    aim(P, 40);
    begin(P, w, { kind: 'nenDat', name: sl.name, pose: 2, level: lv, sl }, ch.recover, 0.36); // búa đã giơ sẵn: nện xuống ngay
  }
  function circleHit(x, y, r, fn) {
    let n = 0;
    for (const e of G.targets()) if (Math.hypot(e.x - x, (e.y - y) / ZK()) < r + e.r) { fn(e); n++; }
    return n;
  }
  function hammerSlam(P, w, o) {
    const W = G.getWorld(), ch = C.hammer.charge, sl = o.sl, [ux, uy] = aimOf(P);
    const r = reachOf(w, sl.r), q = along(P.x, P.y, ux, uy, Math.min(ch.ahead, wallLen(P.x, P.y, ux, uy, ch.ahead))), cx = q[0], cy = q[1];
    const n = circleHit(cx, cy, r, (e) => G.cb.playerHit(e, sl.mult, { w, stun: sl.stun, heavy: true, dir: e.x >= P.x ? 1 : -1 }));
    G.cb.hitProps(cx - r, cx + r, cy, r * G.ZK);
    // sóng chấn động chạy trên mặt đất theo hướng đánh (tám hướng), tan khi chạm tường
    const left = Math.min(sl.wave.len, (W.x1 - W.x0) * ch.waveFrac, wallLen(cx, cy, ux, uy, 999));
    (W.mvWaves || (W.mvWaves = [])).push({ x: cx, y: cy, ux, uy, dir: ux < 0 ? -1 : 1, left, v: ch.waveV, depth: ch.waveDepth, mult: sl.wave.mult, stun: sl.wave.stun, w, seen: [], level: o.level, he: heOf(P, w) });
    W.shake = Math.max(W.shake, o.level >= 2 ? 0.3 : 0.16);
    G.sfx('boom', o.level >= 2 ? 1.5 : 1.9);
    swingFx(P, w, o, { level: o.level, x: cx, y: cy, r });
    finish(P, w, { x: cx, y: cy, ux, uy, power: o.level >= 2 ? 1.3 : 0.8 });
    gain(P, w, n);
  }

  // ---------- nút Đánh ----------
  const TAPS = { bow: bowTap, spear: spearTap, hammer: hammerTap };
  const RELEASES = { bow: bowRelease, spear: spearLunge, hammer: hammerRelease };
  function levelOf(ch, t) {
    if (ch.lv1 != null) return t >= ch.time ? 2 : t >= ch.lv1 ? 1 : 0;
    return t >= ch.time ? 1 : 0;
  }
  function release(P, w, cfg) {
    const mv = P.mv, c = mv.charge, lv = mv.level;
    cancel(mv);
    if (c < cfg.charge.min) { TAPS[w.type](P, w); return; }
    RELEASES[w.type](P, w, c, lv);
  }
  // Gọi khi người chơi đang rảnh tay (không né, không lướt, không vừa bấm đòn đặc biệt hay kỹ năng).
  M.act = function (P, inp, dt) {
    const mv = st(P), w = G.curW(P), cfg = C[w.type];
    const held = mv.wasHeld, can = P.cdT <= 0;
    if (!cfg) { // vũ khí chưa có lối đánh riêng: đánh kiểu cũ
      if (held && can) { mv.cur = null; G.cb.startAttack(P); }
      return;
    }
    if (w.type === 'spear' && P.spearOut === w.id) { // giáo đang bay (Phi Thương): bấm hay giữ đều ra cú đấm tay
      if (mv.holding) cancel(mv);
      if ((held || mv.pressBuf > 0) && can) { mv.pressBuf = 0; mv.buf = 0; punch(P, w); }
      return;
    }
    if (!cfg.charge) { // kiếm: bấm hoặc giữ đều ra chuỗi
      if ((held || mv.pressBuf > 0) && can) {
        mv.pressBuf = 0;
        if (mv.afterDodge > 0 && cfg.glide) swordGlide(P, w); else swordChain(P, w);
      }
      return;
    }
    const ch = cfg.charge;
    if (mv.holding) {
      if (!held) { release(P, w, cfg); return; }
      if (w.type === 'bow') bowAim(P, ch.range + 10, ch.speed); // đang giương: cung xoay theo quái gần nhất
      const lv0 = mv.level;
      mv.chargeT += dt;
      mv.charge = Math.min(1, mv.chargeT / ch.time);
      mv.level = levelOf(ch, mv.chargeT);
      if (mv.level > lv0) { G.sfx('pick', 0.9 + 0.3 * mv.level); FX('mvCharge', P, mv.level); }
      if (mv.charge >= 1) { mv.fullT += dt; if (mv.fullT >= C.hold) release(P, w, cfg); }
      return;
    }
    if (held && mv.holdT >= C.tap && can) {
      mv.holding = true; mv.chargeT = 0; mv.charge = 0; mv.level = 0; mv.fullT = 0; mv.buf = 0;
      mv.name = ch.name; mv.kind = 'layDa';
    } else if (mv.buf > 0 && can) {
      mv.buf = 0;
      TAPS[w.type](P, w);
    }
  };

  // Thời điểm đòn chạm (gần giữa động tác): gây sát thương theo đòn đang ra.
  M.hit = function (P) {
    const mv = st(P), o = mv.cur, w = G.curW(P);
    if (!o) { G.cb.doHit(P); return; }
    P.hitDone = true;
    if (o.kind === 'chem') {
      const m = o.m;
      const list = boxHit(P, o.reach, o.depth, m.mult, { w, heavy: !!m.heavy });
      if (m.push) push(P, list, m.push);
      swingFx(P, w, o);
      if (m.finish) { const [ux, uy] = aimOf(P), q = along(P.x, P.y, ux, uy, Math.min(o.reach * 0.6, wallLen(P.x, P.y, ux, uy, 99))); finish(P, w, { x: q[0], y: q[1], ux, uy, power: 1 }); }
      gain(P, w, list.length);
    } else if (o.kind === 'ban') {
      shoot(P, w, o.arrow);
    } else if (o.kind === 'dam' || o.kind === 'nen') {
      const list = boxHit(P, o.reach, o.depth, o.m.mult, { w });
      if (o.fist) { if (!G.noRender) FX('punch', P); gain(P, w, list.length); return; }
      swingFx(P, w, o);
      if (o.kind === 'nen') G.getWorld().shake = Math.max(G.getWorld().shake, 0.08);
      gain(P, w, list.length);
    } else if (o.kind === 'quet') {
      // Quét vòng: lưỡi giáo quét ba phần tư vòng quanh người, mở đầu theo hướng nhắm; chỉ chừa một khe ngay sau lưng
      // (lệch quá 140 độ so với hướng nhắm), hất nhẹ quái ra ngoài.
      const m = o.m, list = [], [ux, uy] = aimOf(P), k = ZK();
      for (const e of G.targets()) {
        const dx = e.x - P.x, dy = (e.y - P.y) / k, d = Math.hypot(dx, dy);
        if (d < o.reach + e.r && (d < 8 || (dx * ux + dy * uy) / d > -0.77)) { G.cb.playerHit(e, m.mult, { w, heavy: true, dir: e.x >= P.x ? 1 : -1 }); list.push(e); }
      }
      G.cb.hitProps(P.x - o.reach, P.x + o.reach, P.y, o.reach * G.ZK);
      for (const e of list) if (!e.dead && !e.isBoss) { const dx = e.x - P.x, dy = e.y - P.y, d = Math.hypot(dx, dy) || 1; e.x += (dx / d) * m.push; e.y += (dy / d) * m.push * k; }
      swingFx(P, w, o);
      { const q = along(P.x, P.y, ux, uy, 10); finish(P, w, { x: q[0], y: q[1], ux, uy, power: 1, round: true }); }
      gain(P, w, list.length);
    } else if (o.kind === 'nenDat') {
      hammerSlam(P, w, o);
    }
  };

  // ---------- luật riêng của từng hệ ----------
  // Sát thương phụ của hệ: vẫn qua G.damage nên được tính vào thống kê hệ và đánh xa/gần của trùm, và kết liễu vẫn cho dấu ấn.
  function heDamage(e, amt, el, w, ranged) {
    if (!e.dead) G.damage(e, amt, { el, src: 'hit', ranged: !!ranged, w });
  }
  function around(x, y, r, fn, skip) {
    for (const e of G.targets()) if (e !== skip && Math.hypot(e.x - x, (e.y - y) / G.ZK) < r + e.r) fn(e);
  }
  // Vũng nằm lại trên đất (vệt cháy, màn khói độc): dùng đúng loại vũng "pool" sẵn có của combat.js.
  function heZone(W, x, y, r, life, el, src, every, extra) {
    const mine = W.zones.filter((z) => z.he);
    if (mine.length >= HE.maxZones) mine[0].dead = true;
    const z = Object.assign({ shape: 'circle', x: G.clamp(x, W.x0, W.x1), y: G.clamp(y, W.y0, W.y1), r, t: 0, pool: true, team: 'player', el, life, tick: 0.2, every, src, he: true }, extra || {});
    W.zones.push(z);
    return z;
  }
  // ĐẶC TRƯNG 1 (từ Thành hình): nhát kết chuỗi, đòn giữ rồi thả và đòn đặc biệt để lại thứ của hệ trên sân.
  // o: { x, y, ux, uy (hướng trên sàn, dài 1; bản cũ chỉ có dir ±1), power, line (độ dài đường lao), round (toả quanh người), ranged }
  // Vệt cháy, vũng độc, gai băng nằm đúng theo hướng đòn (tám hướng). info.pts: các điểm [x, y] dọc đường cho lớp vẽ.
  function finish(P, w, o) {
    const h = heOf(P, w);
    if (!has1(h)) return; // Mầm chưa có luật hệ
    const W = G.getWorld(), D = G.pDamage(P, w), k = o.power || 1;
    let ux = o.ux, uy = o.uy;
    if (ux == null) { ux = o.dir || 1; uy = 0; }
    const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
    const sy = uy * ZK(), sl = Math.hypot(ux, sy) || 1;
    const info = { x: o.x, y: o.y, dir: ux < 0 ? -1 : 1, ux, uy, sx: ux / sl, sy: sy / sl, power: o.power || 1, line: o.line || 0, round: !!o.round, r: 0, pts: [] };
    const at = (s) => { const q = along(o.x, o.y, ux, uy, s); q[0] = G.clamp(q[0], W.x0, W.x1); q[1] = G.clamp(q[1], W.y0, W.y1); return q; };
    if (h.el === 'fire') {
      // nổ nhỏ lan ra, rồi để lại vệt cháy trên đất
      const F = HE.fire, r = F.blastR, tr = F.trailR, life = F.trailLife;
      info.r = r;
      if (o.line) {
        const n = Math.max(2, Math.round(o.line / 24));
        for (let i = 0; i < n; i++) {
          const q = at(((i + 0.5) * o.line) / n);
          around(q[0], q[1], tr, (e) => { if (!info.hit || !info.hit.includes(e)) { (info.hit || (info.hit = [])).push(e); heDamage(e, D * F.blast * k, 'fire', w, o.ranged); } });
          heZone(W, q[0], q[1], tr - 2, life, 'fire', D * F.trailSrc, F.trailEvery);
          info.pts.push(q);
        }
      } else {
        around(o.x, o.y, r, (e) => heDamage(e, D * F.blast * k, 'fire', w, o.ranged));
        heZone(W, o.x, o.y, tr, life, 'fire', D * F.trailSrc, F.trailEvery);
      }
    }
    else if (h.el === 'poison') {
      // để lại vũng độc bốc khói; đường lao thì rải hai vũng
      const Q = HE.poison, r = Q.cloudR, life = Q.cloudLife * Math.min(1.2, 0.7 + 0.3 * (o.power || 1));
      info.r = r;
      if (o.line) {
        for (const u of [0.35, 0.85]) { const q = at(o.line * u); heZone(W, q[0], q[1], r - 3, life, 'poison', D * Q.cloudSrc, Q.cloudEvery, { cloud: true }); info.pts.push(q); }
      } else heZone(W, o.x, o.y, r, life, 'poison', D * Q.cloudSrc, Q.cloudEvery, { cloud: true });
    }
    else {
      // gai băng mọc từ đất theo hướng đánh: làm chậm, đủ tầng thì đóng băng
      const I = HE.ice, L = o.line || I.spikeLen * Math.min(1.25, 0.8 + 0.2 * (o.power || 1)), n = I.stacks, got = [];
      info.r = L;
      if (o.round) around(o.x, o.y, L * 0.75, (e) => got.push(e));
      else for (const e of G.targets()) if (inBox(o, e, ux, uy, L, I.spikeDepth, 6)) got.push(e);
      for (const e of got) { heDamage(e, D * I.spikes * k, 'ice', w, o.ranged); G.applyStatus(e, 'ice', D, n); }
    }
    FX('heFinish', h.el, h.lv, info);
  }
  M.finish = finish;

  // ĐẶC TRƯNG 2 của Băng (từ Thức tỉnh): quái đang đóng băng bị đánh thì lớp băng vỡ.
  M.onHit = function (e, d, el, o) {
    if (!(e.st.frozen > 0)) { e.mvShat = false; return; }
    if (e.st.ch && e.st.ch.ice) return; // đóng băng do chưởng: không kết hợp với đặc trưng của vũ khí (js/chuong.js)
    if (el !== 'ice' || e.mvShat || !o.w) return;
    const W = G.getWorld(), P = W.P, h = heOf(P, o.w);
    if (!has2(h) || h.el !== 'ice') return;
    // con bị đóng băng ăn thêm sát thương, mảnh băng văng trúng quái quanh đó và làm chúng chậm lại
    e.mvShat = true;
    const I = HE.ice, D = G.pDamage(P, o.w);
    FX('heShatter', e, I.shatterR);
    heDamage(e, D * I.shatterSelf, 'ice', o.w, o.ranged);
    around(e.x, e.y, I.shatterR, (t) => { heDamage(t, D * I.shatter, 'ice', o.w, o.ranged); G.applyStatus(t, 'ice', D, 1); }, e);
  };
  // ĐẶC TRƯNG 2 của Lửa và Độc (từ Thức tỉnh): phản ứng dây chuyền khi quái chết.
  M.onKill = function (e, o, w) {
    const W = G.getWorld(), P = W.P;
    if (!w || e.illusion) return;
    const h = heOf(P, w);
    if (!has2(h)) return;
    const chs = e.st.ch || {}; // hiệu ứng do chưởng gây không kích đặc trưng Thức tỉnh của vũ khí (js/chuong.js)
    if (h.el === 'fire' && e.st.fire > 0 && !chs.fire) {
      // Nổ lan: quái đang cháy chết thì nổ, đốt và làm cháy quái đứng gần. Con nào chết vì vụ nổ khi đang cháy sẽ nổ tiếp.
      const F = HE.fire, D = G.pDamage(P, w), got = [];
      around(e.x, e.y, F.boomR, (t) => { got.push(t); }, e);
      FX('heBoom', e, F.boomR, got.length);
      for (const t of got) { if (t.dead) continue; G.applyStatus(t, 'fire', D, 1); heDamage(t, D * F.boom, 'fire', w, false); }
    }
    if (h.el === 'poison' && e.st.poisonN > 0 && !chs.poison) {
      // Lây độc: chết khi đang trúng độc thì độc lây sang quái đứng gần
      const n = Math.min(e.st.poisonN, HE.poison.spread), src = e.st.poisonDmg / 0.06, got = [];
      around(e.x, e.y, HE.poison.spreadR, (t) => { got.push(t); }, e);
      for (const t of got) G.applyStatus(t, 'poison', src, n);
      if (got.length) FX('heSpread', e, got);
    }
  };
  // Tên của người chơi vừa trúng một con quái (thuộc đặc trưng 1: từ Thành hình mới có)
  M.arrowHit = function (o, e) {
    const h = o.he;
    if (!has1(h) || o.shard) return;
    const W = G.getWorld(), P = W.P, D = G.pDamage(P, o.w);
    if (h.el === 'fire') {
      // tên lửa nổ khi trúng; tên mạnh đầy đà thì nổ to và để lại vệt cháy
      const F = HE.fire, c = o.charged || 0, r = F.arrowR + (c >= 1 ? 8 : 0);
      around(e.x, e.y, r, (t) => heDamage(t, D * F.arrow * (1 + c), 'fire', o.w, true), e);
      if (c >= 1 && !o.heTrail) { o.heTrail = true; heZone(W, e.x, e.y, F.trailR, F.trailLife, 'fire', D * F.trailSrc, F.trailEvery); }
      FX('heArrow', 'fire', h.lv, { x: e.x, y: e.y, r, big: c >= 1, dir: o.vx < 0 ? -1 : 1 });
    } else if (h.el === 'poison') {
      // tên độc tách thành mảnh khi trúng con quái đầu tiên
      if (o.split) return;
      o.split = true;
      const Q = HE.poison, c = o.charged || 0, n = Q.shards + (c >= 1 ? 1 : 0), dir = o.vx < 0 ? -1 : 1;
      for (let i = 0; i < n; i++) {
        // mảnh độc bay chéo ra sau lưng con quái vừa trúng; chỉ gây sát thương Độc, không tính là một đòn đánh mới
        const a = n === 1 ? ((W.mvFlip = !W.mvFlip) ? 0.42 : -0.42) : n === 3 ? (i - 1) * 0.5 : (i ? 0.42 : -0.42);
        (W.mvShards || (W.mvShards = [])).push({ x: e.x + dir * 4, y: e.y, vx: dir * Q.shardV * Math.cos(a), vy: Q.shardV * Math.sin(a) * 0.7, left: Q.shardRange, w: o.w, dmg: D * Q.shard * (1 + 0.6 * c), skip: e, he: h });
      }
      if (c >= 1) heZone(W, e.x, e.y, Q.cloudR, Q.cloudLife * 0.7, 'poison', D * Q.cloudSrc, Q.cloudEvery, { cloud: true });
      FX('heArrow', 'poison', h.lv, { x: e.x, y: e.y, r: 16, big: c >= 1, dir });
    } else {
      // tên băng xuyên qua (số quái xuyên thêm đã cộng lúc bắn); tên mạnh đầy đà chắc chắn làm chậm
      const c = o.charged || 0;
      if (c >= 1) G.applyStatus(e, 'ice', D, 1);
      FX('heArrow', 'ice', h.lv, { x: e.x, y: e.y, r: 12, big: c >= 1, dir: o.vx < 0 ? -1 : 1 });
    }
  };
  // Phần riêng theo hệ của đòn đặc biệt (gọi sau khi combat.js đã tung đòn)
  // ---------- ĐÒN ĐẶC BIỆT RIÊNG CỦA TỪNG LOẠI VŨ KHÍ (tám hướng) ----------
  // Tầm của chiêu theo bề ngang phòng
  const spanOf = (c) => { const W = G.getWorld(); return G.clamp((W.x1 - W.x0) * c.frac, c.min, c.max); };
  M.spanOf = spanOf;
  // Giáo của Phi Thương còn đang bay thì chưa ném lại được
  M.canSpecial = (P, w) => !(w.type === 'spear' && P.spearOut === w.id);
  // Gọi từ combat.js khi tung đòn Đặc biệt bằng kiếm, giáo, búa (mana đã trừ)
  M.cast = function (P, w) {
    const W = G.getWorld(), S0 = C.special[w.type];
    if (!S0) return;
    const A = aimM(P, spanOf(S0) + 10), h = heOf(P, w);
    const list = W.mvSp || (W.mvSp = []);
    const ux = A.ux, uy = A.uy, D = G.pDamage(P, w);
    if (w.type === 'sword') {
      // Trảm Nguyệt: vệt trăng lưỡi liềm bay ra từ trước mặt; bé lùi nửa bước
      const q = along(P.x, P.y, ux, uy, 6);
      list.push({ kind: 'cres', x: q[0], y: q[1], x0: q[0], y0: q[1], ux, uy, left: spanOf(S0), v: S0.speed, half: S0.half, mult: S0.mult, w, seen: [], he: h, walked: 0 });
      P.slideT = 0.12; P.slideVx = -ux * S0.back / 0.12; P.slideVy = -uy * S0.back * ZK() / 0.12;
      W.shake = Math.max(W.shake, 0.12);
      G.sfx('swing', 1.5);
    } else if (w.type === 'spear') {
      // Phi Thương: giáo rời tay bay thẳng
      const q = along(P.x, P.y, ux, uy, 8), R = spanOf(S0), E = along(q[0], q[1], ux, uy, wallLen(q[0], q[1], ux, uy, R));
      // con cuối của hàng quái trên đường bay: giáo dừng lại ghim nó
      let tgt = null, ta = -1;
      for (const e of G.targets()) { const a = onStrip(e, q[0], q[1], E[0], E[1], ux, uy, S0.half); if (a > ta) { ta = a; tgt = e; } }
      P.spearOut = w.id;
      list.push({ target: tgt, kind: 'spear', phase: 'out', x: q[0], y: q[1], x0: q[0], y0: q[1], ux, uy, left: spanOf(S0), v: S0.speed, half: S0.half, mult: S0.mult, w, seen: [], back: [], he: h, last: null, t: 0, wid: w.id });
      G.sfx('swing', 1.6);
    } else {
      // Địa Chấn: vòng chấn nhỏ quanh người ngay lúc nện, rồi vệt nứt chạy theo hướng nhắm
      const nRing = circleHit(P.x, P.y, S0.ringR, (e) => G.cb.playerHit(e, S0.ringMult, { w, stun: S0.ringStun, heavy: true, dir: e.x >= P.x ? 1 : -1 }));
      if (nRing > 0) G.sfx('hit', 0.8); // V10: vòng chấn trúng quái thì có tiếng trúng
      G.cb.hitProps(P.x - S0.ringR, P.x + S0.ringR, P.y, S0.ringR * ZK());
      const q = along(P.x, P.y, ux, uy, 8), L = wallLen(q[0], q[1], ux, uy, spanOf(S0));
      list.push({ kind: 'crack', x: q[0], y: q[1], x0: q[0], y0: q[1], ux, uy, len: L, at: 0, warn: S0.warn, t: 0, v: S0.speed, half: S0.half, mult: S0.mult, stun: S0.stun, w, seen: [], he: h });
      W.shake = Math.max(W.shake, 0.3);
    }
    FX('spCast', P, w.type, list[list.length - 1], h ? h.el : null);
  };
  // Phần riêng theo hệ của Mưa Tên (kiếm, giáo, búa để lại dấu hệ dọc đường chiêu bay, xem M.update)
  M.special = function (P, w) {
    const mv = st(P), W = G.getWorld();
    cancel(mv); mv.chain = 0;
    if (w.type !== 'bow' || !has1(heOf(P, w))) return;
    // mưa tên: điểm nhấn của hệ rơi xuống khi trận mưa sắp dứt
    const z = W.zones[W.zones.length - 1];
    if (z && z.rain) (W.mvTimers || (W.mvTimers = [])).push({ t: 0.8, fn: () => finish(P, w, { x: z.x, y: z.y, dir: P.face, power: 0.8, ranged: true, round: true }) });
  };
  // Một chiêu đang bay (vệt trăng, cây giáo) quét qua đoạn (ax,ay)-(q.x,q.y): đánh mỗi quái một lần
  function sweepSeg(q, ax, ay, seen, mult, o, noHit) {
    const out = [];
    for (const e of G.targets()) {
      if (seen.includes(e)) continue;
      const a = onStrip(e, ax, ay, q.x, q.y, q.ux, q.uy, q.half);
      if (a > -1e8) { seen.push(e); out.push([a, e]); }
    }
    out.sort((a, b) => a[0] - b[0]);
    if (!noHit) for (const [, e] of out) G.cb.playerHit(e, mult, Object.assign({ w: q.w, dir: q.ux < 0 ? -1 : 1 }, o || {}));
    return out.map((a) => a[1]);
  }
  // Đòn Đặc biệt không hồi mana khi trúng (như đòn lao cũ), để không tung liên tiếp được.
  // V10: trả về số quái trúng trong khung này (M.update phát tiếng "trúng" một lần mỗi khung).
  function stepSpecials(W, dt) {
    const list = W.mvSp;
    if (!list || !list.length) return 0;
    const P = W.P, k = ZK();
    let nHit = 0;
    for (const q of list) {
      q.t = (q.t || 0) + dt;
      if (q.kind === 'cres') {
        const ax = q.x, ay = q.y, d = Math.min(q.left, q.v * dt), lim = wallLen(ax, ay, q.ux, q.uy, d);
        q.x += q.ux * lim; q.y += q.uy * lim * k; q.left -= d; q.walked += lim;
        const got = [];
        for (const e of sweepSeg(q, ax, ay, q.seen, 0, null, true)) { G.cb.playerHit(e, q.mult, { w: q.w, heavy: true, dir: q.ux < 0 ? -1 : 1 }); q.mult *= C.special.sword.fall; got.push(e); }
        nHit += got.length;
        propsBox({ x: ax, y: ay }, q.ux, q.uy, lim, q.half * 2);
        if (lim < d - 0.01) q.left = 0; // chạm tường
        if (q.left <= 0) {
          q.done = true;
          if (has1(q.he)) finish(P, q.w, { x: q.x0, y: q.y0, ux: q.ux, uy: q.uy, power: 1.2, line: Math.max(20, q.walked) });
          FX('spEnd', q);
        }
      } else if (q.kind === 'spear') {
        const S0 = C.special.spear;
        if (q.phase === 'out') {
          const ax = q.x, ay = q.y, d = Math.min(q.left, q.v * dt), lim = wallLen(ax, ay, q.ux, q.uy, d);
          q.x += q.ux * lim; q.y += q.uy * lim * k; q.left -= d;
          const got = sweepSeg(q, ax, ay, q.seen, q.mult, { heavy: true });
          nHit += got.length;
          if (got.length) q.last = got[got.length - 1];
          propsBox({ x: ax, y: ay }, q.ux, q.uy, lim, q.half * 2);
          const hitT = q.target && got.includes(q.target);
          if (hitT) { q.x = q.target.x; q.y = q.target.y; }
          if (hitT || lim < d - 0.01 || q.left <= 0) {
            // dừng: ghim con cuối cùng trúng (nếu còn đứng gần), không có thì con đứng sát chỗ giáo cắm (thường là sát tường)
            let pin = q.last && !q.last.dead && Math.hypot(q.last.x - q.x, (q.last.y - q.y) / k) < 30 ? q.last : null;
            if (!pin) for (const e of G.targets()) if (Math.hypot(e.x - q.x, (e.y - q.y) / k) < e.r + 10) { pin = e; break; }
            q.phase = 'stick'; q.stick = S0.stick; q.pin = pin;
            if (pin) {
              pin.st.stun = Math.max(pin.st.stun, pin.isBoss ? S0.pin * 0.4 : S0.pin);
              q.px = q.x - pin.x; q.py = q.y - pin.y;
              if (!q.seen.includes(pin)) { q.seen.push(pin); G.cb.playerHit(pin, q.mult, { w: q.w, heavy: true, dir: q.ux < 0 ? -1 : 1 }); nHit++; }
            }
            q.he && has1(q.he) && finish(P, q.w, { x: q.x0, y: q.y0, ux: q.ux, uy: q.uy, power: 1, line: Math.max(20, Math.hypot(q.x - q.x0, (q.y - q.y0) / k)) });
            FX('spPin', q);
          }
        } else if (q.phase === 'stick') {
          if (q.pin && !q.pin.dead) { q.x = q.pin.x + q.px; q.y = q.pin.y + q.py; }
          q.stick -= dt;
          if (q.stick <= 0) { q.phase = 'back'; FX('spBack', q); }
        } else {
          // bay vòng về tay: đuổi theo bé, trúng lần nữa trên đường về
          const tx = P.x, ty = P.y, dx = tx - q.x, dy = (ty - q.y) / k, dist = Math.hypot(dx, dy);
          if (dist <= S0.catchR + S0.backV * dt) {
            q.done = true;
            if (P.spearOut === q.wid) P.spearOut = null;
            FX('spCatch', P, q);
            G.sfx('pick', 1.2);
            continue;
          }
          const bx = dx / dist, by = dy / dist, ax = q.x, ay = q.y, m = S0.backV * dt;
          q.x += bx * m; q.y += by * m * k; q.bx = bx; q.by = by;
          const tmp = { x: q.x, y: q.y, ux: bx, uy: by, half: q.half, w: q.w };
          const got = sweepSeg(tmp, ax, ay, q.back, S0.backMult);
          nHit += got.length;
          }
      } else if (q.kind === 'crack') {
        // vết nứt chạy trước (báo trước), rồi đất trồi lên đuổi theo: quái trên vệt bị hất tung, choáng
        if (q.t < q.warn) continue;
        const a0 = q.at, a1 = Math.min(q.len, q.at + q.v * dt);
        q.at = a1;
        const A = along(q.x0, q.y0, q.ux, q.uy, a0), B = along(q.x0, q.y0, q.ux, q.uy, a1);
        const seg = { x: B[0], y: B[1], ux: q.ux, uy: q.uy, half: q.half, w: q.w };
        const got = sweepSeg(seg, A[0], A[1], q.seen, q.mult, { stun: q.stun, heavy: true });
        nHit += got.length;
        for (const e of got) if (!e.dead && !e.isBoss) e.mvLift = C.special.hammer.lift;
        propsBox({ x: A[0], y: A[1] }, q.ux, q.uy, a1 - a0, q.half * 2);
        if (q.at >= q.len) {
          q.done = true;
          if (has1(q.he)) finish(P, q.w, { x: q.x0, y: q.y0, ux: q.ux, uy: q.uy, power: 1.3, line: Math.max(20, q.len) });
          FX('spEnd', q);
        }
      }
    }
    W.mvSp = list.filter((q) => !q.done);
    return nHit;
  }
  M.stepSpecials = stepSpecials;
  M.update = function (W, dt) {
    track(dt);
    const ts = W.mvTimers;
    if (ts && ts.length) {
      for (const q of ts) { q.t -= dt; if (q.t <= 0 && !W.over) q.fn(); }
      W.mvTimers = ts.filter((q) => q.t > 0);
    }
    const sh = W.mvShards;
    if (sh && sh.length) {
      for (const q of sh) {
        q.x += q.vx * dt; q.y += q.vy * dt; q.left -= Math.hypot(q.vx, q.vy) * dt;
        for (const e of G.targets()) {
          if (e !== q.skip && Math.abs(e.x - q.x) < e.r + 3 && Math.abs(e.y - q.y) < e.hr + 6) { heDamage(e, q.dmg, 'poison', q.w, true); FX('heArrow', 'poison', 1, { x: e.x, y: e.y, r: 8, big: false, dir: q.vx < 0 ? -1 : 1, small: true }); q.left = 0; break; }
        }
        if (q.x < W.x0 - 10 || q.x > W.x1 + 10 || q.y < W.y0 - 10 || q.y > W.y1 + 10) q.left = 0;
      }
      W.mvShards = sh.filter((q) => q.left > 0);
    }
    let nHit = stepSpecials(W, dt);
    // quái bị Địa Chấn hất tung: chỉ là độ cao lúc vẽ
    for (const e of G.targets()) if (e.mvLift > 0) e.mvLift = Math.max(0, e.mvLift - dt);
    const ws = W.mvWaves;
    if (!ws || !ws.length) { if (nHit > 0) G.sfx('hit', 0.85); return; } // V10: một tiếng "trúng" mỗi khung
    for (const z of ws) {
      const x0 = z.x, y0 = z.y, ux = z.ux != null ? z.ux : z.dir, uy = z.uy || 0, d = Math.min(z.left, z.v * dt);
      z.x += ux * d; z.y += uy * d * ZK(); z.left -= d;
      const seg = { x: z.x, y: z.y, ux, uy, half: z.depth / 2 + 2, w: z.w };
      for (const e of G.targets()) {
        if (z.seen.includes(e)) continue;
        if (onStrip(e, x0, y0, z.x, z.y, ux, uy, seg.half) > -1e8) {
          z.seen.push(e);
          G.cb.playerHit(e, z.mult, { w: z.w, stun: z.stun, dir: z.dir });
          nHit++;
        }
      }
      propsBox({ x: x0, y: y0 }, ux, uy, d, z.depth);
      if (has1(z.he) && z.level >= 2) {
        // sóng nấc 2 của búa mang hệ: cứ 30 điểm ảnh để lại một dấu của hệ trên đường đi
        z.heD = (z.heD || 0) + d;
        if (z.heD >= 30) { z.heD = 0; finish(W.P, z.w, { x: z.x, y: z.y, ux, uy, power: 0.5 }); }
      }
    }
    W.mvWaves = ws.filter((z) => z.left > 0.01);
    if (nHit > 0) G.sfx('hit', 0.85); // V10: chiêu bay, vệt nứt, sóng búa trúng quái: một tiếng "trúng" mỗi khung
  };
})();
