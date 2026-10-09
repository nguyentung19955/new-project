"""Kiểm tra hệ trang phục (js/outfit.js) ngay trong trang thật: bản lưu cũ đọc được và quy đổi đủ món, bản lưu hỏng được sửa,
mặc và tháo, mua, may, nâng bậc, mở cấp cánh, rơi đồ từ quái và trùm, chỉ số và các tác dụng trong trận.
Chạy: python3 tests/trang_phuc.py   (thêm -v để in cả mục đạt; thoát mã 1 nếu có mục sai)"""
import sys, os
from playwright.sync_api import sync_playwright

JS = r"""
() => {
  const out = [], O = G.outfit;
  const ok = (name, cond, detail) => out.push([name, !!cond, detail === undefined ? '' : String(detail)]);
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const sec = (s) => G.sim(Math.round(s * 60));
  const inp = { mx: 0, my: 0 };
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  const press = (k) => { inp[k] = true; G.sim(1); delete inp[k]; };
  let S, W, P;
  // Phòng trống để thử tác dụng: không có đợt quái.
  function room(setup) {
    G.testSave({ hero: 'smith', lvl: 10 });
    if (setup) setup(G.save);
    G.startStage(1, 2, 0);
    S = G.getRun(); W = G.getWorld(); P = S.P;
    W.waves = []; W.props = []; P.inv = 0;
    sec(0.1);
  }
  function dummy(x, y) {
    const e = G.spawnEnemy('rusher', x, y || P.y, { hpMult: 1e6 });
    e.st.stun = 1e9; e.inside = true;
    return e;
  }
  function give(sv, k, r, lv) { const it = O.add(sv, k, r, { lv }); O.wear(sv, it); return it; }

  // ----- 1. bản lưu cũ: mũ, áo, bùa cũ quy đổi đủ, không mất món nào -----
  const old = G.newSave();
  delete old.outfit;
  old.owned = { helm: ['h_r1', 'h_moc', 'h_ngu'], armor: ['a_r2', 'a_ngu'], charm: ['c_mist', 'c_greed'] };
  old.helm = 'h_moc'; old.armor = 'a_ngu'; old.charm = 'c_mist';
  const s1 = G.fixSave(JSON.parse(JSON.stringify(old)));
  const ks = s1.outfit.items.map((x) => x.k).sort().join(',');
  ok('Bản lưu cũ: đủ 7 món sau quy đổi', s1.outfit.items.length === 7, ks);
  ok('Bản lưu cũ: Mũ sừng gỗ (cũ) thành Mũ sừng gỗ bậc Lam, đang đội', (() => { const it = O.worn(s1, 'hat'); return it && it.k === 'mu_sung' && it.r === 1; })());
  ok('Bản lưu cũ: Áo vảy đang mặc, bậc Lam', (() => { const it = O.worn(s1, 'robe'); return it && it.k === 'ao_vay' && it.r === 1; })());
  ok('Bản lưu cũ: Bùa sương thành ô Bùa', (() => { const it = O.worn(s1, 'hand'); return it && it.k === 'bua_suong'; })());
  ok('Bản lưu cũ: chỗ cũ được dọn, không quy đổi hai lần', !s1.helm && !s1.armor && !s1.charm && !s1.owned.helm.length && G.fixSave(JSON.parse(JSON.stringify(s1))).outfit.items.length === 7);
  ok('Bản lưu cũ: món quy đổi không bị báo là món mới', s1.outfit.items.every((x) => !x.n));
  // chỉ số món cũ được giữ nguyên: Áo vảy cũ máu +85, giảm 10%; Mũ vây cá cũ giảm 40% thời gian bị chậm
  const av = O.stats({ k: 'ao_vay', r: 1 }), mv = O.stats({ k: 'mu_vay_ca', r: 1 }), al = O.stats({ k: 'ao_long', r: 1 });
  ok('Chỉ số cũ giữ nguyên: Áo vảy máu 85, giảm 10%', av.hp === 85 && near(av.dr, 0.1, 0.001), JSON.stringify(av));
  ok('Chỉ số cũ giữ nguyên: Mũ vây cá giảm 40% thời gian bị chậm', near(mv.res_ice, 0.4, 0.001));
  ok('Chỉ số cũ giữ nguyên: Áo lông trắng máu 130, chạy nhanh 8%', al.hp === 130 && near(al.spd, 0.08, 0.001));
  // bản lưu cũ hơn nữa: không có cả trường owned
  const s0 = G.newSave(); delete s0.outfit; delete s0.owned; delete s0.helm;
  const s0b = G.fixSave(JSON.parse(JSON.stringify(s0)));
  ok('Bản lưu rất cũ (không có owned, outfit) vẫn đọc được', s0b.outfit && Array.isArray(s0b.outfit.items) && s0b.weapons.length >= 2);

  // ----- 2. bản lưu hỏng -----
  const bad = G.newSave();
  bad.outfit = { items: [{ id: 3, k: 'ao_vay', r: 9 }, { id: 3, k: 'mu_rom', r: 0 }, { id: 'x', k: 'mu_rom' }, { id: 5, k: 'khong_co' }, null, { id: 6, k: 'canh_la', r: 2, lv: 77 }],
    wear: { hat: 3, robe: 3, wing: 6, back: 99 }, next: -4, got: 'x' };
  const s2 = G.fixSave(JSON.parse(JSON.stringify(bad)));
  ok('Bản lưu hỏng: bỏ món lạ, trùng số, sai kiểu', s2.outfit.items.length === 2, s2.outfit.items.map((x) => x.k).join(','));
  ok('Bản lưu hỏng: bậc bị kẹp về Vàng, cấp cánh về 3', s2.outfit.items[0].r === 3 && s2.outfit.items[1].lv === 3);
  ok('Bản lưu hỏng: món mặc sai ô thì tháo ra', s2.outfit.wear.hat === null && s2.outfit.wear.robe === 3 && s2.outfit.wear.back === null && s2.outfit.wear.wing === 6);
  ok('Bản lưu hỏng: số đếm món mới hợp lệ', s2.outfit.next === 7 && s2.outfit.got >= 2);
  const s3 = G.fixSave(Object.assign(G.newSave(), { outfit: 'hỏng' }));
  ok('Bản lưu hỏng: trường outfit sai kiểu thì làm mới', s3.outfit && s3.outfit.items.length === 0);
  // lưu rồi nạp lại giữ đủ
  G.testSave({}); const sv = G.save;
  const a = give(sv, 'ao_vay', 2), w = give(sv, 'canh_bang', 3, 2);
  G.persist(); G.loadSave();
  ok('Lưu rồi nạp lại: giữ món đang mặc, bậc, cấp cánh', O.worn(G.save, 'robe').r === 2 && O.worn(G.save, 'wing').lv === 2 && O.worn(G.save, 'wing').r === 3);

  // ----- 3. mặc, tháo, hình -----
  G.testSave({});
  const h = O.add(G.save, 'mu_tai_cao', 3);
  ok('Món mới có dấu báo mới', h.n === 1 && O.newCount(G.save) === 1);
  O.wear(G.save, h);
  let lk = O.look(G.save);
  ok('Mặc mũ: hình đổi sang Mũ tai cáo, ánh viền màu Vàng, hạt lửa', lk.hat === 'mu_tai_cao' && lk.fx.glow === G.RARITY[3].col && lk.fx.els.includes('fire') && h.n === 0);
  O.unwear(G.save, 'hat'); lk = O.look(G.save);
  ok('Tháo mũ: em bé đội lại mũ khởi đầu (ô trống)', lk.hat === undefined && O.worn(G.save, 'hat') === null);
  const fr0 = G.tinhLinh.outfitOf('smith', { outfit: lk });
  ok('Ô trống thì hình dùng đồ khởi đầu của hero', fr0.hat === 'trum_sung');
  for (const k of ['mu_vay_ca', 'ao_vay', 'khan_bang']) give(G.save, k, 1);
  lk = O.look(G.save);
  ok('Đủ bộ 3 món: có vầng sáng quanh chân màu Băng', lk.fx.aura === 'ice');
  // mọi món đều vẽ được ở mọi bậc, mọi động tác (không lỗi, không rơi về hình cũ)
  let drawErr = null, n = 0;
  const cv = document.createElement('canvas'), c = cv.getContext('2d');
  for (const k in O.ITEMS) for (let r = 0; r < 4; r++) {
    const T = O.ITEMS[k], o = { rar: {}, fx: { glow: r >= 2 ? G.RARITY[r].col : null, els: T.el ? [T.el] : [], aura: T.el, top: r } };
    if (T.slot === 'wing') o.wing = { kind: T.look, level: 1 + (r % 3) }; else o[T.slot] = T.look;
    o.rar[T.slot] = r;
    for (const an of [{}, { move: true }, { dodge: 0.4 }]) {
      // gọi thẳng bộ dựng khung (G.art.hero tự lùi về hình cũ khi lỗi, nên phải gọi thẳng mới bắt được lỗi)
      const oo = Object.assign({ x: 40, y: 60, face: 1, key: G.HKEYS[n % 4], t: n * 0.13, atk: -1, dodge: -1, weapon: null, outfit: o }, an);
      try { G.tinhLinh.frame(oo); G.art.hero(c, oo); n++; } catch (e) { drawErr = e; }
    }
    try { O.drawIcon(c, { k, r, lv: 2 }, 20, 20, 24); } catch (e) { drawErr = e; }
  }
  ok('Vẽ mọi món ở 4 bậc, đứng, chạy, lộn: không lỗi (' + n + ' khung)', !drawErr && n > 300, drawErr);
  ok('Mỗi món có hình riêng trong G.heroLooks', Object.keys(O.ITEMS).every((k) => { const T = O.ITEMS[k], L = G.heroLooks; return (T.slot === 'wing' ? L.wings : L[T.slot + 's'])[T.look]; }));

  // ----- 4. mua, may, nâng bậc, mở cấp cánh -----
  G.testSave({}); let s = G.save;
  s.gold = 1000;
  const b1 = O.buy(s, 'mu_rom');
  ok('Mua ở Bà Hàng Xén: Mũ rơm bậc Thường, trừ 60 vàng', b1 && b1.r === 0 && s.gold === 940);
  ok('Không mua được món không bán', !O.buy(s, 'ao_vay'));
  s.mats = [0, 5, 0]; s.shards = [0, 0, 0];
  ok('Chưa đủ nguyên liệu thì không may được', !O.craft(s, 'ao_vay') && !O.canCraftNew(s));
  s.mats = [0, 20, 0]; s.shards = [0, 1, 0];
  ok('Đủ nguyên liệu thì có dấu báo may được', O.canCraftNew(s));
  const c1 = O.craft(s, 'ao_vay');
  ok('May Áo vảy: tốn 10 vảy cá, 1 mảnh Ngư Tinh, 350 vàng', c1 && s.mats[1] === 10 && s.shards[1] === 0 && s.gold === 940 - 350, JSON.stringify([s.mats, s.shards, s.gold]));
  s.gold = 5000; s.mats = [50, 50, 50]; s.stones = 5; s.shards = [9, 9, 9];
  const r0 = c1.r; O.upgrade(s, c1); O.upgrade(s, c1); O.upgrade(s, c1);
  ok('Nâng bậc 3 lần: Thường lên Vàng', r0 === 0 && c1.r === 3 && !O.upgrade(s, c1));
  ok('Nâng bậc tăng chỉ số', O.stats(c1).hp > O.stats({ k: 'ao_vay', r: 0 }).hp);
  const wg = O.craft(s, 'canh_chuon');
  ok('May Cánh chuồn chuồn: ra mầm cánh cấp 1', wg && wg.lv === 1);
  O.wingUp(s, wg); const lv2 = wg.lv; O.wingUp(s, wg);
  ok('Mở cấp cánh bằng mảnh trùm: 1 lên 2 lên 3', lv2 === 2 && wg.lv === 3 && !O.wingUp(s, wg));
  ok('Cánh cấp cao chỉ số lớn hơn', O.stats(wg).spd > O.stats({ k: 'canh_chuon', r: 0, lv: 1 }).spd);

  // ----- 5. rơi đồ -----
  G.testSave({}); s = G.save;
  const r0b = G.rnd;
  let seq = [0.0, 0.99];
  G.rnd = () => (seq.length ? seq.shift() : 0.5);
  const bd = O.roll(s, 2, 'boss');
  G.rnd = () => 0.9;
  const bd2 = O.roll(s, 1, 'boss');
  G.rnd = r0b;
  ok('Trùm vùng rơi món bộ của vùng đó, bậc Tím hoặc Vàng', bd && O.ITEMS[bd.k].set === 'lau' && bd.r >= 2 && bd2 && O.ITEMS[bd2.k].set === 'bien' && bd2.r >= 2, bd && bd.k + ' ' + bd.r + ' / ' + (bd2 && bd2.k));
  let rs = [];
  for (let i = 0; i < 300; i++) { const it = O.roll(s, 0, 'mob'); if (it) rs.push(it); if (O.full(s)) s.outfit.items.length = 0; }
  ok('Quái thường ở Rừng già chỉ rơi món Rừng già hoặc món không hệ', rs.every((x) => O.ITEMS[x.k].reg === 0 || !O.ITEMS[x.k].el));
  ok('Quái thường không rơi món Vàng', rs.every((x) => x.r < 3));
  // rơi thật trong trận: quái gục rồi ghi vào bản lưu
  room(); const n0 = G.save.outfit.items.length;
  G.rnd = () => 0.001;
  const e1 = dummy(P.x + 30); G.kill(e1, {});
  G.rnd = r0b;
  ok('Quái gục trong ải rơi trang phục vào kho, có dòng báo', G.save.outfit.items.length === n0 + 1 && S.got.some((g) => typeof g === 'string' && g.indexOf('trang phục') === 0));
  // kho đầy thì đổi thành vàng
  G.testSave({}); s = G.save; for (let i = 0; i < O.MAX_ITEMS; i++) O.add(s, 'mu_rom', 0);
  const g0 = s.gold; ok('Kho trang phục đầy thì món rơi đổi thành vàng', !O.roll(s, 0, 'elite') && s.gold > g0);

  // ----- 6. chỉ số trong trận -----
  room();
  const hp0 = P.maxhp, sp0 = P.speed, mn0 = P.maxmana;
  room((sv) => { give(sv, 'ao_long', 3); give(sv, 'trong_nho', 2); give(sv, 'bua_oc', 1); });
  ok('Áo lông Vàng: máu +187 (nhân thêm 10% của cây kỹ năng Thủ như áo bản cũ)', near(P.maxhp, hp0 + 187 * 1.1, 1), P.maxhp + ' / ' + hp0);
  ok('Trống đồng Tím: mana +18', P.maxmana === mn0 + 18, P.maxmana);
  ok('Áo lông: chạy nhanh hơn', P.speed > sp0 * 1.1, P.speed / sp0);
  ok('Bùa vỏ ốc: tầm nhặt đồ +15, hồi chiêu nhanh hơn', P.pickR === 15 && P.cdMul < 1);
  P.mana = 100; press('skillP'); ok('Hồi chiêu nhanh: kỹ năng hồi ngắn hơn 5 giây', P.skillCd < 4.9 && P.skillCd > 4, P.skillCd);

  // ----- 7. tác dụng đặc biệt -----
  // Mũ băng (Tím): quái đánh trúng bé bị chậm
  room((sv) => give(sv, 'mu_vay_ca', 2));
  let e = dummy(P.x + 20);
  G.hurtPlayer(5, null, e, true);
  ok('Mũ băng: quái đánh trúng bé bị chậm (thêm tầng Băng)', e.st.iceN > 0 || e.st.frozen > 0, e.st.iceN);
  // món Lam không có tác dụng đặc biệt
  room((sv) => give(sv, 'mu_vay_ca', 1));
  e = dummy(P.x + 20); G.hurtPlayer(5, null, e, true);
  ok('Mũ băng bậc Lam: chưa có tác dụng đặc biệt', !(e.st.iceN > 0));
  // Áo lửa (Tím): lộn để lại vệt cháy
  room((sv) => give(sv, 'giap_da', 2));
  inp.mx = 1; press('dodgeP'); sec(0.3); inp.mx = 0;
  let zs = W.zones.filter((z) => z.oz && z.el === 'fire');
  ok('Áo giáp đá Tím: lộn để lại vệt cháy (' + zs.length + ' vệt)', zs.length >= 2);
  e = dummy(zs[0].x, zs[0].y); sec(0.6);
  ok('Vệt cháy đốt quái đi qua', e.st.fire > 0);
  // Gùi độc (Vàng): rải vũng độc mỗi 3 giây khi còn quái
  room((sv) => give(sv, 'gui_tre', 3));
  dummy(P.x + 120); sec(3.2);
  ok('Gùi tre độc Vàng: rải vũng độc khi còn quái', W.zones.some((z) => z.oz && z.el === 'poison'));
  room((sv) => give(sv, 'gui_tre', 3)); sec(4.5);
  ok('Phòng không còn quái thì gùi không rải vũng', !W.zones.some((z) => z.oz));
  // Bùa đá lửa (Tím): quái gục gần bé nổ, làm quái bên cạnh cháy
  room((sv) => give(sv, 'bua_lua', 2));
  const a1 = dummy(P.x + 30), a2 = dummy(P.x + 42);
  G.kill(a1, {});
  ok('Bùa đá lửa: quái gục nổ, quái bên cạnh bị cháy', a2.st.fire > 0);
  // Cánh: cấp 2 lộn xa hơn và có khiên sau khi lộn
  room(); let x0 = P.x; inp.mx = 1; press('dodgeP'); sec(0.4); inp.mx = 0; const d0 = P.x - x0;
  room((sv) => give(sv, 'canh_la', 0, 2)); x0 = P.x; inp.mx = 1; press('dodgeP');
  let shieldSeen = false; for (let i = 0; i < 30; i++) { G.sim(1); if (P.oShieldT > 0) shieldSeen = true; } inp.mx = 0;
  const d1 = P.x - x0;
  ok('Cánh nhỏ (cấp 2): lộn xa hơn khoảng 20%', d1 > d0 * 1.12, d0.toFixed(1) + ' -> ' + d1.toFixed(1));
  ok('Cánh nhỏ: có khiên ngắn sau khi lộn', shieldSeen);
  room((sv) => give(sv, 'canh_la', 0, 2)); inp.mx = 1; press('dodgeP'); for (let i = 0; i < 40 && !(P.oShieldT > 0); i++) G.sim(1); inp.mx = 0;
  P.inv = 0; let hp1 = P.hp; const blocked = !G.hurtPlayer(20, null, null, false);
  ok('Khiên sau khi lộn chặn một đòn', blocked && P.hp === hp1 && !(P.oShieldT > 0));
  room((sv) => give(sv, 'canh_la', 0, 1)); inp.mx = 1; press('dodgeP'); sec(0.4); inp.mx = 0;
  ok('Mầm cánh (cấp 1): không có khiên', !(P.oShieldT > 0) && P.dodgeMul === 1);
  // Món không hệ bậc Tím: khiên đầu phòng
  room((sv) => give(sv, 'mu_rom', 2));
  ok('Mũ rơm Tím: vào phòng có khiên chặn 1 đòn', P.oShield === 1);
  hp1 = P.hp; G.hurtPlayer(20, null, null, false); P.inv = 0;
  ok('Khiên đầu phòng chặn đòn đầu, đòn sau trúng', P.hp === hp1 && P.oShield === 0 && G.hurtPlayer(20, null, null, false) && P.hp < hp1);
  // Đủ bộ 3 món Băng: sát thương Băng +10%
  room(); let t1 = dummy(P.x + 60); const base = G.damage(t1, 100, { el: 'ice' });
  room((sv) => { give(sv, 'mu_vay_ca', 0); give(sv, 'ao_vay', 0); give(sv, 'khan_bang', 0); });
  t1 = dummy(P.x + 60); const boosted = G.damage(t1, 100, { el: 'ice' }), other = G.damage(dummy(P.x + 80), 100, { el: 'fire' });
  ok('Đủ bộ 3 món Hang Biển: sát thương Băng +10%, hệ khác giữ nguyên', near(boosted / base, 1.1, 0.001) && near(other / base, 1, 0.3), (boosted / base).toFixed(3));
  ok('Đủ bộ: vẫn có hiệu ứng bộ 2 món của bản cũ (Ngư Tinh)', P.set === 'ngu');
  // Bùa tham (cũ): vẫn cần cấp 5, vẫn giảm 10% máu
  G.testSave({ lvl: 6 }); G.save.owned.charm = ['c_greed']; G.save.charm = 'c_greed';
  P = G.buildPlayer();
  ok('Bùa cũ ghi thẳng vào bản lưu sau khi nạp vẫn được chuyển và có tác dụng', P.charm === 'c_greed' && O.worn(G.save, 'hand').k === 'bua_tham');
  G.botInput = null;
  // ----- 8. làng: dấu chấm than, bảng Cô Thợ May vẽ được mọi thẻ, em bé mặc đúng đồ -----
  G.testSave({}); G.setScene(G.Village);
  const VS = G.villageScene, VA = G.villageApi;
  VS.checkNews(); const nw0 = !!VS.state.news.may;
  O.add(G.save, 'mu_rom', 0); VS.checkNews();
  ok('Có món mới: Cô Thợ May có dấu chấm than', !nw0 && VS.state.news.may);
  G.save.outfit.items.forEach((it) => { it.n = 0; }); VS.checkNews();
  ok('Xem hết món mới, chưa đủ nguyên liệu: hết dấu chấm than', !VS.state.news.may);
  G.save.mats = [30, 30, 30]; G.save.gold = 999; VS.checkNews();
  ok('Đủ nguyên liệu may món chưa có: có dấu chấm than', VS.state.news.may);
  O.wear(G.save, O.add(G.save, 'canh_lua', 3, { lv: 3 })); O.wear(G.save, O.add(G.save, 'ao_long', 2));
  VS.goNpc('may', true);
  let perr = null;
  for (const t of ['wear', 'craft', 'wing']) for (const pv of ['dung', 'chay', 'lon']) {
    VA.V.otab = t; VA.V.pv = pv; VA.V.sel = t === 'craft' ? 'ao_vay' : G.save.outfit.wear.wing;
    try { G.ui.begin(); G.scene.draw(); } catch (e) { perr = e; }
  }
  ok('Bảng Cô Thợ May vẽ được ba thẻ, ba kiểu mặc thử', VA.V.tab === 'outfit' && !perr, perr);
  VA.goHub();
  ok('Rời Cô Thợ May thì món mới thôi báo mới', O.newCount(G.save) === 0);
  P = G.buildPlayer();
  ok('Em bé trong trận mặc đúng đồ (cánh lửa cấp 3, áo lông)', P.outfit.wing.kind === 'lua' && P.outfit.wing.level === 3 && P.outfit.robe === 'ao_long');
  const hf = G.tinhLinh.frame(G.heroArgs(Object.assign(P, { weapons: P.weapons })));
  ok('Hình trong trận có lớp cánh và áo của trang phục', !!hf && G.tinhLinh.outfitOf('smith', { p: P }).robe === 'ao_long');
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
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
        pg.goto('file://' + os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/index.html')
        pg.wait_for_timeout(1500)
        pg.add_script_tag(path=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'setup.js'))
        res = pg.evaluate(JS)
        b.close()
    bad = 0
    for name, good, detail in res:
        if not good:
            bad += 1
        if not good or '-v' in sys.argv:
            print(('ĐẠT ' if good else 'SAI ') + name + (('  -> ' + detail) if detail else ''))
    print(f'{len(res) - bad}/{len(res)} mục trang phục đạt' + (', lỗi trang: ' + '; '.join(errs[:3]) if errs else ''))
    sys.exit(1 if bad or errs else 0)


main()
