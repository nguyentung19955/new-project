"""Kiểm tra lối đánh riêng của từng vũ khí (js/moves.js) và luật riêng của ba hệ, ngay trong trang thật.
Từ đợt ghép 1, luật hệ chia theo cấp: Mầm chưa có luật, Thành hình mở đặc trưng 1, Thức tỉnh mở đặc trưng 2 (xem thêm tests/ghep.py).
Chạy: python3 tests/moves.py [-v]   (thoát mã 1 nếu có mục sai)"""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""
() => {
  const out = [];
  const ok = (name, cond, detail) => out.push([name, !!cond, detail === undefined ? '' : String(detail)]);
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  let W, P, S, w, inp = {};
  const hold0 = G.botInput;
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  // chạy n khung với nút đang đặt trong inp; các nút "vừa bấm" chỉ có hiệu lực một khung
  const run = (n, i) => { if (i) inp = i; for (let k = 0; k < n; k++) { G.sim(1); for (const q of ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP']) delete inp[q]; } };
  const sec = (s, i) => run(Math.round(s * 60), i);
  const wait = (cond, i) => { let n = 0; while (cond()) { run(1, i); if (++n > 600) throw new Error('chờ quá lâu: ' + cond); } };
  const tap = () => { run(2, { atk: true }); run(1, {}); };
  function room(type, o) {
    G.testSave(Object.assign({ hero: 'smith', melee: type === 'bow' ? 'sword' : type, tier: 1 }, o || {}));
    G.HEROES.smith.fav = [];
    G.startStage(0, 2, 0);
    S = G.getRun(); W = G.getWorld(); P = S.P;
    W.waves = []; W.props = []; W.banner = null;
    if (type === 'bow') P.cur = 1;
    w = G.curW(P);
    inp = {}; run(6);
    P.x = 200; P.y = 190; P.face = 1; P.inv = 0; P.mana = P.maxmana;
    return W;
  }
  function dummy(x, y, role, hp) {
    const e = G.spawnEnemy(role || 'rusher', x, y == null ? 190 : y, { hpMult: hp || 1e6 });
    e.st.stun = 1e9; e.inside = true;
    return e;
  }
  const lost = (e) => e.maxhp - e.hp;
  const base = () => G.pDamage(P, w);
  try {
    // ================= KIẾM =================
    room('sword'); let e = dummy(224), far = dummy(244, 190);
    const names = [], steps = [], dm = [];
    for (let k = 0; k < 3; k++) {
      const h0 = e.hp; run(1, { atk: true });
      names.push(P.mv.name); steps.push(P.mv.step);
      wait(() => P.atkT > 0, { atk: false });
      dm.push((h0 - e.hp) / base());
    }
    ok('Kiếm: bấm 3 lần ra chém ngang, chém ngược, nhát kết', names.join() === 'Chém ngang,Chém ngược,Nhát kết' && steps.join() === '0,1,2', names.join());
    ok('Kiếm: sát thương ba nhát là 0,9 / 0,95 / 1,7 lần', near(dm[0], 0.9, 0.01) && near(dm[1], 0.95, 0.01) && near(dm[2], 1.7, 0.01), dm.map((x) => x.toFixed(2)).join('/'));
    ok('Kiếm: nhát kết với xa hơn (trúng quái đứng xa 44 điểm ảnh), hai nhát đầu thì không', near(lost(far) / base(), 1.7, 0.01), (lost(far) / base()).toFixed(2));
    ok('Kiếm: nhát kết đẩy lùi quái 10 điểm ảnh', near(e.x, 234, 0.5), e.x);
    ok('Kiếm: đòn tính vào thống kê cận chiến của trùm', S.stats.melee > 0 && S.stats.ranged === 0, S.stats.melee);
    room('sword'); e = dummy(224);
    tap(); wait(() => P.atkT > 0, {});
    sec(0.6, {}); run(1, { atk: true });
    ok('Kiếm: ngừng bấm quá lâu thì chuỗi về đầu', P.mv.step === 0 && P.mv.name === 'Chém ngang', P.mv.name);
    room('sword'); e = dummy(224);
    sec(0.5, { atk: true });
    ok('Kiếm: giữ nút thì chuỗi tự nối tiếp', P.mv.step === 1 && P.mv.chain === 2, P.mv.step);
    room('sword'); e = dummy(250);
    P.x = 180; run(1, { dodgeP: true, mx: 1 });
    wait(() => P.dodgeT > 0, { mx: 1 });
    const x0 = P.x, hg = e.hp;
    run(2, { atk: true });
    const kind = P.mv.kind;
    wait(() => P.dashT > 0 || P.atkT > 0, {});
    ok('Kiếm: đánh ngay sau khi Né ra nhát lướt', kind === 'luot', kind);
    ok('Kiếm: nhát lướt trượt tới khoảng 30 điểm ảnh và gây 1,4 lần', near(P.x - x0, 30, 4) && near((hg - e.hp) / base(), 1.4, 0.01), (P.x - x0).toFixed(1) + ' / ' + ((hg - e.hp) / base()).toFixed(2));
    sec(0.15, { atk: true });
    ok('Kiếm: sau nhát lướt là nhát thứ hai của chuỗi', P.mv.step === 1, P.mv.step);
    room('sword'); e = dummy(224);
    run(1, { dodgeP: true, mx: -1 }); wait(() => P.dodgeT > 0, {});
    sec(0.5, {}); run(1, { atk: true });
    ok('Kiếm: né xong để lâu thì chỉ là nhát thường', P.mv.kind === 'chem', P.mv.kind);
    ok('Kiếm: có dòng chỉ dẫn khi vào ải', !!G.MOVE_TIPS.sword && P.mv.tips.sword === true);

    // ================= CUNG =================
    room('bow'); e = dummy(300);
    tap(); sec(0.8, {});
    ok('Cung: bấm nhanh bắn một mũi tên thường', near(lost(e) / base(), 1, 0.01), (lost(e) / base()).toFixed(2));
    ok('Cung: đòn tính vào thống kê đánh xa của trùm', S.stats.ranged > 0 && S.stats.melee === 0, S.stats.ranged);
    room('bow'); const a = dummy(280), b = dummy(310), c3 = dummy(340);
    sec(0.1, { atk: true });
    ok('Cung: giữ dưới 0,16 giây thì chưa giương', !P.mv.holding);
    sec(0.3, { atk: true });
    ok('Cung: giữ nút thì giương cung, có tỉ lệ lấy đà', P.mv.holding && P.mv.charge > 0.2 && P.mv.charge < 1, P.mv.charge.toFixed(2));
    const xa = P.x; sec(0.3, { atk: true, mx: -1 });
    const slowV = (xa - P.x) / 0.3;
    ok('Cung: đang giương thì đi chậm lại', near(slowV, P.speed * 0.55, 3), slowV.toFixed(1) + ' so với ' + P.speed.toFixed(1));
    sec(0.4, { atk: true });
    ok('Cung: giương đủ lâu thì đầy', P.mv.charge === 1 && P.mv.level === 1, P.mv.charge);
    P.face = 1; run(1, {});
    const pr = W.projs.find((o) => o.team === 'player');
    ok('Cung: thả ra bắn tên mạnh gấp 3, xuyên thêm 2 quái (sửa góp ý 3: trước là 4)', pr && pr.big && near(pr.mult, 3, 0.01) && pr.pierce === 2 && P.mv.kind === 'banManh', pr ? pr.mult + '/' + pr.pierce : 'không có tên');
    sec(0.6, {});
    ok('Cung: tên mạnh xuyên qua cả ba quái đứng thẳng hàng, mỗi con sau nhận 0,6 lần con trước', lost(a) > 0 && lost(b) > 0 && lost(c3) > 0 && near(lost(a) / base(), 3, 0.01) && near(lost(c3) / base(), 3 * 0.6 * 0.6, 0.01), [a, b, c3].map((q) => (lost(q) / base()).toFixed(1)).join('/'));
    room('bow'); e = dummy(300);
    sec(0.3, { atk: true }); run(1, {}); sec(0.5, {});
    ok('Cung: giương chưa tới thì thả ra chỉ là tên thường', near(lost(e) / base(), 1, 0.01), (lost(e) / base()).toFixed(2));
    room('bow'); e = dummy(300);
    sec(0.16 + 0.75 + 0.8 + 0.1, { atk: true });
    ok('Cung: giữ mãi thì tên tự bay sau khi đầy 0,8 giây', W.projs.some((o) => o.big) || lost(e) > 0);
    room('bow'); e = dummy(300);
    sec(0.5, { atk: true }); run(2, { atk: true, dodgeP: true });
    ok('Cung: lăn né thì bỏ phần đà đang lấy', !P.mv.holding && P.mv.charge === 0 && W.projs.length === 0);
    room('bow'); e = dummy(300);
    let t0 = G.time; tap(); wait(() => P.cdT > 0, {}); const still = G.time - t0;
    t0 = G.time; run(2, { atk: true, mx: -1 }); run(1, { mx: -1 }); wait(() => P.cdT > 0, { mx: -1 }); const moving = G.time - t0;
    ok('Cung: đứng yên bắn nhanh hơn vừa chạy vừa bắn', still < moving - 0.05, still.toFixed(2) + ' so với ' + moving.toFixed(2));
    room('bow'); P.x = W.x0 + 2; const ax0 = P.x; let amax = 0;
    tap(); for (let k = 0; k < 80; k++) { run(1, {}); for (const o of W.projs) if (o.team === 'player') amax = Math.max(amax, o.x - ax0); }
    ok('Cung: tên thường bay tối đa khoảng 180 điểm ảnh (vừa một phòng vuông)', amax > 168 && amax < 196 && W.projs.length === 0, amax.toFixed(0));
    room('bow'); P.x = W.x1 - 40; amax = 0;
    tap(); for (let k = 0; k < 80; k++) { run(1, {}); for (const o of W.projs) if (o.team === 'player') amax = Math.max(amax, o.x); }
    ok('Cung: tên chạm tường thì mất, không bay ra lề màn hình', amax <= W.geo.fx1 + 8 && W.projs.length === 0, amax.toFixed(0));
    room('bow'); const p1 = dummy(240), p2 = dummy(262), p3 = dummy(284);
    tap(); sec(0.9, {});
    ok('Cung: tên thường xuyên thêm 1 quái, con sau nhận 0,35 lần (sửa góp ý 3: trước 0,75); con thứ ba không trúng', near(lost(p1) / base(), 1, 0.01) && near(lost(p2) / base(), 0.35, 0.01) && lost(p3) === 0, [p1, p2, p3].map((q) => (lost(q) / base()).toFixed(2)).join('/'));
    room('bow'); const q1 = dummy(250, 190 + 30);
    tap(); sec(0.9, {});
    ok('Cung: tên ngắm chéo được, trúng quái đứng lệch dọc 30 điểm ảnh ở cách 50', near(lost(q1) / base(), 1, 0.01), (lost(q1) / base()).toFixed(2));

    // ================= GIÁO =================
    room('spear'); e = dummy(256); const side = dummy(200, 172), back = dummy(176);
    const sn = [], sd = [];
    for (let k = 0; k < 4; k++) {
      const h0 = e.hp; tap(); sn.push(P.mv.name + P.mv.step);
      wait(() => P.atkT > 0, {});
      sd.push((h0 - e.hp) / base());
    }
    ok('Giáo: bấm liên tiếp ra ba nhát đâm rồi quét vòng', sn.join() === 'Đâm0,Đâm1,Đâm2,Quét vòng3', sn.join());
    ok('Giáo: đâm xa (trúng quái cách 56 điểm ảnh) 0,95 lần (sửa góp ý 3: trước 0,85); quét vòng không với tới quái đó', near(sd[0], 0.95, 0.01) && near(sd[2], 0.95, 0.01) && sd[3] === 0, sd.map((x) => x.toFixed(2)).join('/'));
    ok('Giáo: đâm hẹp, không trúng quái đứng lệch 18 điểm ảnh theo chiều sâu; quét vòng thì trúng (1,6 lần)', near(lost(side) / base(), 1.6, 0.01), (lost(side) / base()).toFixed(2));
    ok('Giáo: quét vòng trúng cả quái sau lưng và hất nó ra', near(lost(back) / base(), 1.6, 0.01) && near(back.x, 168, 0.5), (lost(back) / base()).toFixed(2) + ' x=' + back.x);
    room('spear'); const l1 = dummy(225), l2 = dummy(245);
    sec(0.16 + 0.5 + 0.05, { atk: true });
    ok('Giáo: giữ nút thì thu giáo lấy đà đầy sau 0,5 giây', P.mv.holding && P.mv.charge === 1, P.mv.charge);
    const sx = P.x; run(1, {});
    ok('Giáo: thả ra là lao tới', P.mv.kind === 'xoc' && P.dashT > 0, P.mv.kind);
    wait(() => P.dashT > 0, {});
    ok('Giáo: lao một đoạn ngắn 58 điểm ảnh, xuyên qua cả hai quái, mỗi con 2,2 lần', near(P.x - sx, 58, 3) && near(lost(l1) / base(), 2.2, 0.01) && near(lost(l2) / base(), 2.2, 0.01), (P.x - sx).toFixed(1) + ' ' + (lost(l1) / base()).toFixed(2) + '/' + (lost(l2) / base()).toFixed(2));
    ok('Giáo: lao tới không tính là lăn né trong thống kê của trùm', S.stats.dodges === 0 && S.stats.melee > 0);
    room('spear'); P.x = W.x1 - 20; sec(0.8, { atk: true }); P.face = 1; run(1, {}); wait(() => P.dashT > 0, {});
    ok('Giáo: lao sát mép phòng thì dừng ở mép, không ra ngoài', P.x <= W.x1 + 0.01, P.x);

    // ================= BÚA =================
    room('hammer'); e = dummy(226);
    tap(); wait(() => P.atkT > 0, {});
    ok('Búa: nhát thường 1 lần sát thương và làm quái khựng', near(lost(e) / base(), 1, 0.01) && P.mv.cur.kind === 'nen', (lost(e) / base()).toFixed(2));
    const e2 = G.spawnEnemy('rusher', 226, 190, { hpMult: 1e6 }); e2.inside = true;
    sec(0.3, {}); tap(); wait(() => P.atkT > 0.3, {});
    ok('Búa: quái trúng nhát thường bị khựng 0,4 giây', e2.st.stun > 0.2 && e2.st.stun <= 0.4, e2.st.stun);
    room('hammer'); e = dummy(230); const fw = dummy(300);
    sec(0.16 + 0.3, { atk: true });
    ok('Búa: giữ nút thì lấy đà, chưa tới nấc 1', P.mv.holding && P.mv.level === 0, P.mv.level);
    const hx = P.x; sec(0.3, { atk: true, mx: -1 });
    ok('Búa: đang lấy đà thì đi chậm lại và đã lên nấc 1', near((hx - P.x) / 0.3, P.speed * 0.45, 3) && P.mv.level === 1, ((hx - P.x) / 0.3).toFixed(1) + ' nấc ' + P.mv.level);
    P.x = 200; P.face = 1; run(1, {}); sec(0.9, {});
    ok('Búa: thả ở nấc 1 thì nện đất 1,0 lần (cộng sóng 0,4), không choáng', near(lost(e) / base(), 1.0 + 0.4, 0.01), (lost(e) / base()).toFixed(2));
    ok('Búa: nấc 1 có sóng chấn động chạy 60 điểm ảnh, không tới quái ở xa', lost(fw) === 0);
    room('hammer'); e = dummy(230); const fw2 = dummy(300), off2 = dummy(300, 224); e.st.stun = 0; fw2.st.stun = 0; e.speed = 0; fw2.speed = 0; e.cd = 1e9; fw2.cd = 1e9;
    sec(0.16 + 1.1 + 0.05, { atk: true });
    ok('Búa: giữ đủ lâu thì lên nấc 2', P.mv.level === 2 && P.mv.charge === 1, P.mv.level);
    P.x = 200; P.face = 1; e.x = 230; fw2.x = 300; run(1, {}); sec(0.12, {});
    ok('Búa: nấc 2 nện 1,25 lần và làm choáng 0,7 giây', lost(e) / base() >= 1.25 - 0.01 && e.st.stun > 0.5, (lost(e) / base()).toFixed(2) + ' choáng ' + e.st.stun.toFixed(2));
    sec(0.6, {});
    ok('Búa: sóng chấn động nấc 2 chạy tới quái cách 100 điểm ảnh, gây 0,5 lần và làm choáng', near(lost(fw2) / base(), 0.5, 0.01), (lost(fw2) / base()).toFixed(2));
    ok('Búa: sóng chỉ rộng theo chiều sâu vừa phải, không trúng quái lệch 34 điểm ảnh', lost(off2) === 0);
    ok('Búa: nện đất tính vào thống kê cận chiến', S.stats.melee > 0 && S.stats.ranged === 0);
    room('hammer'); e = dummy(226);
    sec(3.5, { atk: true });
    ok('Búa: giữ mãi thì đòn tự tung ra rồi lấy đà lại', lost(e) / base() >= 1.6 && P.mv.holding, (lost(e) / base()).toFixed(2));
    // ================= HỆ LỬA =================
    const el3 = (el, marks) => ({ branch: el, marks: marks == null ? 300 : marks });
    const combo3 = () => { for (let k = 0; k < 3; k++) { run(1, { atk: true, atkP: true }); wait(() => !P.hitDone, {}); if (k < 2) wait(() => P.atkT > 0, {}); } };
    room('sword', el3('fire')); e = dummy(224); let side2 = dummy(250), mk = dummy(250, 196); far = dummy(330);
    G.applyStatus(mk, 'fire', 1); mk.hp = 1;
    const fire0 = S.stats.el.fire, m0 = w.marks.fire;
    combo3();
    let zs = W.zones.filter((z) => z.he && z.el === 'fire');
    ok('Lửa: nhát kết của kiếm để lại một vệt cháy trên đất', zs.length === 1 && near(zs[0].x, 200 + 24, 1) && zs[0].life > 2.0, zs.length + ' vệt');
    // side2 dính 0,3 của vụ nổ ở nhát kết, cộng 0,5 của Nổ lan vì con quái đang cháy (mk) chết ngay bên cạnh; có thể lẫn một nhịp cháy 0,1
    ok('Lửa: nhát kết nổ ra 0,3 lần lên quái ngoài tầm kiếm; quái đang cháy chết bên cạnh thì Nổ lan thêm 0,5 lần (Thức tỉnh)', lost(side2) / base() > 0.79 && lost(side2) / base() < 0.92, (lost(side2) / base()).toFixed(3));
    ok('Lửa: Nổ lan làm quái đứng gần bốc cháy', side2.st.fire > 0, side2.st.fire);
    ok('Lửa: quái ở xa không dính nổ', lost(far) === 0);
    ok('Lửa: sát thương nổ tính vào thống kê hệ Lửa của trùm', S.stats.el.fire - fire0 > base() * 0.3, (S.stats.el.fire - fire0).toFixed(1));
    ok('Lửa: quái đang cháy chết vì vụ nổ vẫn cho dấu ấn Lửa', mk.dead && near(w.marks.fire - m0, 1.2, 0.01), w.marks.fire - m0);
    const walker = dummy(zs[0].x, zs[0].y); sec(0.7, {});
    ok('Lửa: quái đi vào vệt cháy thì bị đốt', walker.st.fire > 0 && lost(walker) > 0, walker.st.fire);
    sec(3.2, {});
    ok('Lửa: vệt cháy tắt sau vài giây', W.zones.filter((z) => z.he).length === 0);
    room('sword', el3('fire', 30)); e = dummy(224); side2 = dummy(250);
    G.rnd = () => 0.999; combo3(); G.rnd = Math.random;
    ok('Lửa: ở mốc Mầm chưa có luật hệ, nhát kết không nổ và không để lại vệt cháy', lost(side2) === 0 && W.zones.filter((z) => z.he).length === 0, (lost(side2) / base()).toFixed(3));
    room('sword'); e = dummy(224); combo3();
    ok('Chưa có hệ: nhát kết không để lại gì trên đất', W.zones.filter((z) => z.he).length === 0);
    room('bow', el3('fire')); e = dummy(300); side2 = dummy(312, 198);
    G.rnd = () => 0.999; // không cho đòn gây hiệu ứng lan (để đo riêng vụ nổ)
    tap(); wait(() => lost(e) === 0, {});
    G.rnd = Math.random;
    ok('Lửa: tên lửa nổ khi trúng, quái đứng cạnh dính 0,13 lần', lost(side2) / base() >= 0.13 - 0.01 && lost(side2) / base() < 0.5, (lost(side2) / base()).toFixed(3));
    ok('Lửa: vụ nổ của tên tính là đánh xa', S.stats.ranged > 0 && S.stats.melee === 0);
    room('hammer', el3('fire')); e = dummy(226);
    for (let k = 0; k < 5; k++) { sec(0.16 + 1.15, { atk: true }); run(1, {}); sec(0.5, {}); }
    ok('Lửa: số vệt cháy trên sân có trần (6)', W.zones.filter((z) => z.he).length <= 6 && W.zones.filter((z) => z.he).length >= 3, W.zones.filter((z) => z.he).length);
    room('spear', el3('fire')); P.mana = P.maxmana; run(1, { specialP: true }); sec(0.3, {});
    ok('Lửa: đòn đặc biệt Lao tới để lại một đường lửa', W.zones.filter((z) => z.he && z.el === 'fire').length >= 3, W.zones.filter((z) => z.he).length);

    // ================= HỆ ĐỘC =================
    room('sword', el3('poison')); e = dummy(224);
    combo3();
    zs = W.zones.filter((z) => z.he && z.el === 'poison' && z.cloud);
    ok('Độc: nhát kết của kiếm để lại một màn khói độc', zs.length === 1 && zs[0].life > 3, zs.length);
    const inCloud = dummy(zs[0].x + 6, zs[0].y); sec(2.3, {});
    ok('Độc: quái đứng trong màn khói mỗi giây thêm 1 tầng Độc', inCloud.st.poisonN >= 2 && inCloud.st.poisonN <= 3, inCloud.st.poisonN);
    sec(2.5, {});
    ok('Độc: màn khói tan sau vài giây', W.zones.filter((z) => z.he).length === 0);
    room('sword', el3('poison')); let dy1 = dummy(300), nb = dummy(332), nb2 = dummy(300, 168), farP = dummy(380); 
    for (let k = 0; k < 4; k++) G.applyStatus(dy1, 'poison', 100);
    const pm0 = w.marks.poison, ps0 = S.stats.el.poison;
    dy1.hp = 1; sec(0.6, {});
    ok('Độc: quái chết vì độc thì lây 2 tầng sang quái gần (Thức tỉnh)', dy1.dead && nb.st.poisonN === 2 && nb2.st.poisonN === 2 && farP.st.poisonN === 0, nb.st.poisonN + '/' + nb2.st.poisonN + '/' + farP.st.poisonN);
    ok('Độc: quái chết vì độc vẫn cho dấu ấn Độc', near(w.marks.poison - pm0, 1.2, 0.01), w.marks.poison - pm0);
    sec(1.2, {});
    ok('Độc: độc lây gây sát thương và được tính vào thống kê hệ Độc', lost(nb) > 0 && S.stats.el.poison > ps0, lost(nb).toFixed(1));
    room('sword', el3('poison', 30)); dy1 = dummy(300); nb = dummy(320);
    for (let k = 0; k < 4; k++) G.applyStatus(dy1, 'poison', 100);
    dy1.hp = 1; sec(0.6, {});
    ok('Độc: ở mốc Mầm chưa có luật hệ, độc không lây', dy1.dead && nb.st.poisonN === 0, nb.st.poisonN);
    room('sword'); dy1 = dummy(300); nb = dummy(320);
    for (let k = 0; k < 4; k++) G.applyStatus(dy1, 'poison', 100);
    dy1.hp = 1; sec(0.6, {});
    ok('Độc: vũ khí chưa có hệ Độc thì độc không lây', dy1.dead && nb.st.poisonN === 0, nb.st.poisonN);
    room('bow', el3('poison')); e = dummy(280); const behind = dummy(322, 206), behind2 = dummy(322, 174); // đứng lệch hẳn khỏi đường tên, chỉ mảnh độc bay chéo mới tới
    G.rnd = () => 0.999;
    tap(); wait(() => lost(e) === 0, {});
    const nsh = (W.mvShards || []).length; sec(0.4, {});
    G.rnd = Math.random;
    ok('Độc: tên độc thường trúng quái thì tách ra 1 mảnh', nsh === 1, nsh);
    ok('Độc: mảnh tên trúng quái đứng chéo phía sau, gây 0,13 lần', near((lost(behind) + lost(behind2)) / base(), 0.13, 0.01), (lost(behind) / base()).toFixed(2) + '/' + (lost(behind2) / base()).toFixed(2));
    P.x = 200; P.face = 1; sec(1.0, { atk: true }); run(1, {}); G.rnd = () => 0.999; wait(() => !(W.mvShards && W.mvShards.length), {}); const nsh2 = W.mvShards.length; G.rnd = Math.random;
    ok('Độc: tên mạnh đầy đà tách ra 2 mảnh và để lại màn khói', nsh2 === 2 && W.zones.some((z) => z.he && z.cloud), nsh2);
    ok('Độc: mảnh tên tính là đánh xa', S.stats.ranged > base() && S.stats.melee === 0);

    // ================= HỆ BĂNG =================
    room('sword', el3('ice')); e = dummy(224); let inLine = dummy(266), offLine = dummy(266, 214);
    combo3();
    ok('Băng: nhát kết mọc gai băng theo hướng đánh, trúng quái ngoài tầm kiếm 0,55 lần và thêm 1 tầng Băng', near(lost(inLine) / base(), 0.55, 0.01) && inLine.st.iceN === 1, (lost(inLine) / base()).toFixed(2) + ' tầng ' + inLine.st.iceN);
    ok('Băng: gai băng có bề rộng vừa phải, không trúng quái lệch 24 điểm ảnh theo chiều sâu', lost(offLine) === 0);
    ok('Băng: gai băng tính vào thống kê hệ Băng và cận chiến', S.stats.el.ice > 0 && S.stats.melee > 0 && S.stats.ranged === 0);
    room('sword', el3('ice', 30)); e = dummy(224); inLine = dummy(258);
    G.rnd = () => 0.999; combo3(); G.rnd = Math.random;
    ok('Băng: ở mốc Mầm chưa có luật hệ, nhát kết không mọc gai băng', lost(inLine) === 0 && inLine.st.iceN === 0, (lost(inLine) / base()).toFixed(3) + ' tầng ' + inLine.st.iceN);
    room('sword', el3('ice')); e = dummy(224); let nbI = dummy(248, 200), mkI = dummy(246, 180);
    for (let k = 0; k < 5; k++) G.applyStatus(e, 'ice', 1);
    G.applyStatus(mkI, 'ice', 1); mkI.hp = 1;
    const im0 = w.marks.ice;
    ok('Băng: quái đã bị đóng băng', e.st.frozen > 0);
    run(1, { atk: true, atkP: true }); wait(() => !P.hitDone, {});
    ok('Băng: quái đóng băng bị đánh thì vỡ, mảnh văng trúng quái gần 0,9 lần và làm nó chậm', near(lost(nbI) / base(), 0.9, 0.01) && nbI.st.iceN === 1, (lost(nbI) / base()).toFixed(2) + ' tầng ' + nbI.st.iceN);
    ok('Băng: con bị vỡ băng ăn thêm 0,7 lần', near(lost(e) / base(), 0.9 + 0.7, 0.01), (lost(e) / base()).toFixed(2));
    ok('Băng: mảnh băng kết liễu quái đang dính Băng thì vẫn cho dấu ấn Băng', mkI.dead && near(w.marks.ice - im0, 1.2, 0.01), w.marks.ice - im0);
    wait(() => P.atkT > 0, {}); const nb1 = lost(nbI);
    run(1, { atk: true, atkP: true }); wait(() => !P.hitDone, {});
    ok('Băng: mỗi lần đóng băng chỉ vỡ một lần', lost(nbI) === nb1 && e.st.frozen > 0, lost(nbI) - nb1);
    room('sword'); e = dummy(224); nbI = dummy(248, 200);
    for (let k = 0; k < 5; k++) G.applyStatus(e, 'ice', 1);
    run(1, { atk: true, atkP: true }); wait(() => !P.hitDone, {});
    ok('Băng: vũ khí không mang hệ Băng thì không làm vỡ băng', lost(nbI) === 0);
    room('bow', el3('ice')); const i1 = dummy(240), i2 = dummy(265), i3 = dummy(290), i4 = dummy(315);
    tap(); sec(0.9, {});
    ok('Băng: tên băng thường xuyên thêm 1 quái nữa so với tên thường (trúng 3 con, con thứ tư thì không)', lost(i1) > 0 && lost(i2) > 0 && lost(i3) > 0 && lost(i4) === 0, [i1, i2, i3, i4].map((q) => (lost(q) / base()).toFixed(1)).join('/'));

    // ================= CHUNG =================
    room('sword'); run(1, { swapP: true }); sec(0.1, {});
    ok('Đổi vũ khí lần đầu thì hiện dòng chỉ dẫn của vũ khí đó', W.banner && W.banner.s === G.MOVE_TIPS.bow, W.banner && W.banner.s);
    for (const k of G.WKEYS) ok('Có dòng chỉ dẫn cho ' + G.WTYPES[k].name, typeof G.MOVE_TIPS[k] === 'string' && G.MOVE_TIPS[k].length > 10);
    room('hammer'); sec(0.4, { atk: true });
    ok('Trạng thái đòn đánh được xuất trên người chơi cho lớp vẽ', ['name', 'kind', 'step', 'chain', 'charge', 'level', 'prog', 'holding'].every((k) => k in P.mv) && P.mv.holding === true && P.mv.charge > 0 && P.mv.charge < 1, JSON.stringify(P.mv.name));
  } catch (err) { ok('không ném lỗi', false, String(err && err.stack || err)); }
  G.botInput = hold0;
  G.setScene(G.Village);
  return out;
}
"""

def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        res = pg.evaluate(JS)
        b.close()
    bad = 0
    for name, good, detail in res:
        if not good:
            bad += 1
        if not good or '-v' in sys.argv:
            print(('ĐẠT ' if good else 'SAI ') + name + (('  -> ' + detail) if detail else ''))
    print(f'{len(res) - bad}/{len(res)} mục đạt' + (', lỗi trang: ' + '; '.join(errs[:3]) if errs else ''))
    sys.exit(1 if bad or errs else 0)

main()
