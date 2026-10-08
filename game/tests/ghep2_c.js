// Mục C của tests/ghep2.py: lối đánh trong phòng hẹp. Tệp này là một hàm chạy trong trang (T2 do ghep2.py dựng sẵn).
() => {
  const { ok, near, room, step, sec, dummy, lost } = T2;
  let P, W, w;
  const go = (o) => { w = room(o); P = T2.P; W = T2.W; return w; };
  const base = () => G.pDamage(P, w);
  const inRoom = () => P.x >= W.x0 - 0.01 && P.x <= W.x1 + 0.01 && P.y >= W.y0 - 0.01 && P.y <= W.y1 + 0.01;
  const waitDash = () => { let n = 0; while (P.dashT > 0 && n++ < 120) step(1); return n; };

  // ---------- đường lao của kiếm và giáo (đòn Đặc biệt) ----------
  for (const [type, small, big] of [['sword', 84, 92], ['spear', 101, 112]]) {
    go({ melee: type }); P.x = W.x0 + 4; let x0 = P.x;
    step(1, { specialP: true }); waitDash();
    ok('C: ' + (type === 'sword' ? 'kiếm' : 'giáo') + ' lao trong phòng thường dài khoảng ' + small + ' điểm ảnh (0,' + (type === 'sword' ? 44 : 53) + ' bề ngang phòng)', near(P.x - x0, small, 4), (P.x - x0).toFixed(1));
    go({ melee: type, big: true }); P.x = W.x0 + 4; x0 = P.x;
    step(1, { specialP: true }); waitDash();
    ok('C: ' + (type === 'sword' ? 'kiếm' : 'giáo') + ' lao trong phòng trùm dài khoảng ' + big + ' điểm ảnh', near(P.x - x0, big, 4), (P.x - x0).toFixed(1));
    // lao vào tường: dừng ở tường, điều khiển lại được ngay
    for (const side of [1, -1]) {
      go({ melee: type }); P.x = side > 0 ? W.x1 - 20 : W.x0 + 20; P.face = side; x0 = P.x;
      step(1, { specialP: true });
      let frames = 0; while (P.dashT > 0 && frames++ < 60) step(1);
      const atWall = side > 0 ? near(P.x, W.x1, 0.01) : near(P.x, W.x0, 0.01);
      ok('C: ' + type + ' lao vào tường ' + (side > 0 ? 'phải' : 'trái') + ' thì dừng đúng mép sàn, không xuyên tường', atWall && inRoom(), P.x.toFixed(1));
      ok('C: ' + type + ' chạm tường thì đòn lao kết thúc ngay (không chạy tại chỗ)', frames <= 5, frames + ' khung');
      const xw = P.x; sec(0.25, { mx: -side });
      ok('C: ' + type + ' vừa lao vào tường xong là đi lại được ngay', Math.abs(P.x - xw) > 8, Math.abs(P.x - xw).toFixed(1));
    }
    // lao qua quái đứng sát tường vẫn trúng
    go({ melee: type }); P.x = W.x1 - 30; P.face = 1; const e = dummy(W.x1 - 8, P.y);
    step(1, { specialP: true }); waitDash();
    ok('C: ' + type + ' lao vào quái đứng sát tường vẫn trúng', lost(e) > 0);
  }
  // lao ngay tại cửa (cửa trái, phải, đang mở): không tự sang phòng, không kẹt, đẩy cần vào cửa thì mới sang
  {
    go({ melee: 'spear', kind: 'B', seed: 5 });
    const S = T2.S;
    W.cleared = true; S.cleared[S.idx] = true; G.gotoRoom(S.idx); W = T2.W = G.getWorld(); P = T2.P;
    const side = W.doors.find((d) => d.open && (d.dir === 'left' || d.dir === 'right'));
    if (side) {
      const v = G.mapgen.DIRS[side.dir], q = G.roomArt.doorPos(W.geo, side.dir), id0 = S.idx;
      P.x = q.x - v[0] * 40; P.y = q.y; P.face = v[0]; P.mana = P.maxmana;
      sec(0.5);
      step(1, { specialP: true }); waitDash(); sec(0.3);
      ok('C: lao thẳng vào cửa đang mở thì dừng ở ngưỡng cửa, không tự sang phòng kề', S.idx === id0 && !S.trans && near(P.x, q.x, 0.5), S.idx + ' x=' + P.x.toFixed(1));
      const xw = P.x; sec(0.25, { mx: -v[0] });
      ok('C: lao vào cửa xong không bị kẹt, lùi ra được', Math.abs(P.x - xw) > 8);
      sec(0.6, { mx: v[0] }); sec(0.6);
      ok('C: sau đó đẩy cần vào cửa thì sang phòng kề như thường', S.idx === side.to, S.idx);
    } else ok('C: bản đồ thử có cửa bên để thử lao', false);
  }
  // giáo xốc tới và kiếm lướt sát tường
  go({ melee: 'spear' }); P.x = W.x1 - 12; P.face = 1;
  sec(0.16 + 0.5 + 0.05, { atk: true }); P.face = 1; step(1); waitDash();
  ok('C: giáo giữ rồi thả sát tường thì dừng ở mép sàn', inRoom() && near(P.x, W.x1, 0.01), P.x.toFixed(1));
  go({ melee: 'sword' }); P.x = W.x0 + 10;
  sec(0.1, { mx: -1 }); step(1, { dodgeP: true, mx: -1 }); let n = 0; while (P.dodgeT > 0 && n++ < 40) step(1, { mx: -1 });
  step(1, { atk: true, atkP: true }); waitDash();
  ok('C: kiếm lướt chém sau khi né sát tường vẫn nằm trong sàn', inRoom(), P.x.toFixed(1));

  // ---------- tên ----------
  const arrowMax = (hold) => {
    let mx = 0, my0 = 1e9, my1 = -1e9;
    if (hold) { sec(hold, { atk: true }); step(1); } else { step(2, { atk: true, atkP: true }); step(1); }
    for (let k = 0; k < 120; k++) { step(1); for (const o of W.projs) if (o.team === 'player') { mx = Math.max(mx, o.x); my0 = Math.min(my0, o.y); my1 = Math.max(my1, o.y); } }
    return mx;
  };
  go({ bow: true, big: true }); P.x = W.x0 + 2; let ax = P.x;
  let far = arrowMax() - ax;
  ok('C: tên thường bay khoảng 180 điểm ảnh (đo trong phòng trùm rộng 282)', far > 168 && far < 196, far.toFixed(0));
  go({ bow: true, big: true }); P.x = W.x0 + 2; ax = P.x;
  far = arrowMax(0.16 + 0.75 + 0.1) - ax;
  ok('C: tên mạnh đầy đà bay khoảng 250 điểm ảnh, chưa tới tường đối diện của phòng trùm', far > 236 && far < 268, far.toFixed(0));
  go({ bow: true }); P.x = W.x0 + 2;
  far = arrowMax(0.16 + 0.75 + 0.1);
  ok('C: trong phòng thường, tên mạnh tan ở tường, không bay ra lề', far <= W.geo.fx1 + 8 && W.projs.length === 0, far.toFixed(0));
  // tên mạnh đầy đà xuyên cả hàng; đà thấp chỉ xuyên thêm 1
  go({ bow: true }); P.x = W.x0 + 4; P.y = W.geo.cy;
  let row = [0, 1, 2, 3, 4, 5].map((i) => dummy(P.x + 40 + i * 22, P.y));
  sec(0.16 + 0.75 + 0.1, { atk: true }); step(1); sec(1);
  ok('C: tên mạnh đầy đà xuyên thêm 4 quái (trúng 5 con trong hàng 6)', row.filter((e) => lost(e) > 0).length === 5, row.map((e) => (lost(e) > 0 ? 1 : 0)).join(''));
  // ngắm chéo: giới hạn góc
  go({ bow: true }); P.x = W.x0 + 30; P.y = W.geo.cy;
  let e1 = dummy(P.x + 60, P.y + 36);
  step(2, { atk: true, atkP: true }); sec(0.9);
  ok('C: tên ngắm chéo trúng quái lệch dọc 36 ở cách ngang 60 (phòng vuông, quái tới từ trên dưới)', lost(e1) > 0);
  go({ bow: true }); P.x = W.x0 + 30; P.y = W.geo.cy;
  e1 = dummy(P.x + 30, P.y + 80);
  step(2, { atk: true, atkP: true }); sec(0.9);
  ok('C: (sửa góp ý 1) quái lệch dọc xa (80, gần như thẳng phía dưới) thì tên vẫn tự bẻ góc tới và trúng', lost(e1) > 0);
  // mưa tên không có mục tiêu: rơi trong sàn
  go({ bow: true }); P.x = W.x1 - 10; P.face = 1;
  step(1, { specialP: true }); step(2);
  const rain = W.zones.find((z) => z.rain);
  ok('C: mưa tên bắn về phía tường thì vẫn rơi trong sàn', rain && rain.x <= W.x1 - 19 && rain.x >= W.x0 + 19, rain && rain.x);

  // ---------- búa ----------
  const slam = (bigRoom, lv2) => {
    go({ melee: 'hammer', big: bigRoom }); P.x = W.x0 + 10; P.y = W.geo.cy;
    sec(0.16 + (lv2 ? 1.15 : 0.6), { atk: true }); step(1);
    let x0 = null, xm = 0, m = 0;
    while (m++ < 200) { step(1); for (const z of W.mvWaves || []) { if (x0 == null) x0 = z.x - z.dir * z.v / 60; xm = Math.max(xm, z.x); } if (x0 != null && !(W.mvWaves || []).length) break; }
    return x0 == null ? -1 : xm - x0;
  };
  let L = slam(false, true);
  ok('C: sóng búa nấc 2 trong phòng thường chạy khoảng 85 điểm ảnh (0,45 bề ngang phòng)', L > 78 && L < 92, L.toFixed(0));
  L = slam(true, true);
  ok('C: sóng búa nấc 2 trong phòng trùm chạy đủ 96 điểm ảnh', L > 90 && L < 102, L.toFixed(0));
  L = slam(false, false);
  ok('C: sóng búa nấc 1 chạy khoảng 60 điểm ảnh', L > 54 && L < 67, L.toFixed(0));
  go({ melee: 'hammer' }); P.x = W.x1 - 6; P.face = 1;
  sec(0.16 + 1.15, { atk: true }); P.face = 1; step(1);
  let out = false; for (let k = 0; k < 90; k++) { step(1); for (const z of W.mvWaves || []) if (z.x > W.x1 + 4) out = true; }
  ok('C: nện đất sát tường thì sóng tan ở tường, không chạy ra ngoài', !out && !(W.mvWaves || []).length);
  // vùng tròn của đòn người chơi khớp hình vẽ trên sàn (độ dẹt G.ZK)
  go({ melee: 'spear' }); P.x = W.geo.cx; P.y = W.geo.cy;
  const R = G.MOVES.spear.chain[3].r;
  const inY = dummy(P.x, P.y + R * G.ZK + 3), outY = dummy(P.x, P.y - (R * G.ZK + 6 + 9));
  for (let k = 0; k < 4; k++) { step(2, { atk: true, atkP: true }); step(1); let m = 0; while (P.atkT > 0 && m++ < 200) step(1); }
  ok('C: quét vòng của giáo tròn theo góc nhìn từ trên (trúng quái ở mép dọc của vòng, ngoài vòng thì không)', lost(inY) > 0 && lost(outY) === 0, (lost(inY) / base()).toFixed(2) + '/' + (lost(outY) / base()).toFixed(2));
  // vũng hệ và mảnh độc không ra ngoài sàn
  go({ bow: true, branch: 'poison', marks: 300 }); P.x = W.x1 - 60; P.y = W.y1 - 6; P.face = 1;
  e1 = dummy(W.x1 - 20, P.y);
  let bad = 0;
  step(2, { atk: true, atkP: true });
  for (let k = 0; k < 90; k++) { step(1); for (const q of W.mvShards || []) if (q.y > W.y1 + 12 || q.x > W.x1 + 12) bad++; }
  ok('C: mảnh tên độc tan khi ra khỏi sàn', bad === 0, bad);
  return T2.out.splice(0);
}
