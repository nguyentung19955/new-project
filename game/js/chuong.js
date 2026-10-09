// CHƯỞNG: nút kỹ năng riêng của em bé nay là nút Chưởng. Bắn một luồng chưởng linh khí (tốn mana), tự ngắm quái gần nhất theo
// tám hướng như mọi đòn khác (dùng lại cách ngắm G.moves.aimM của tám hướng).
//   - Ba cây chưởng: Hỏa chưởng (cầu lửa nổ lan), Độc chưởng (luồng độc để lại mây độc), Băng chưởng (mũi băng xuyên quái, làm chậm).
//     Mỗi lúc chỉ dùng MỘT cây. Đổi cây ở làng (Cụ Đồ, Hành trang): miễn phí, trả lại hết điểm đã học để học cây mới.
//   - Điểm chưởng: mỗi cấp nhân vật +1 điểm (cấp 1 có 1 điểm), tách riêng với điểm kỹ năng. Bản lưu cũ tự có đủ điểm theo cấp.
//   - Kỹ năng cũ của từng em bé thành nét riêng nhỏ của chưởng (G.CHUONG.hero).
//   - Chưởng KHÔNG cho dấu ấn linh khí cho vũ khí và KHÔNG kết hợp hệ với vũ khí (không Nổ khói, Sốc nhiệt, không kích đặc trưng
//     Thức tỉnh của vũ khí): hiệu ứng do chưởng gây được đánh dấu riêng (e.st.ch[hệ]) trong G.applyStatus (js/combat.js).
// Lưu trong bản lưu: sv.heroes[k].ch = { cay: 'hoa' | 'doc' | 'bang', n: { mã nút: bậc } } (mỗi em bé một cây riêng).
// Mọi sát thương là hệ số nhân với "sức chưởng" D = đòn mạnh nhất trong hai vũ khí đang mang, quy về thang của kiếm (như G.power),
// nên chưởng mạnh lên cùng cấp, bậc, mài vũ khí và điểm Công, nhưng không phụ thuộc loại vũ khí đang cầm.
(function () {
  const G = window.G;
  const CH = (G.chuong = {});
  function FX(n, a, b, c, d, e) {
    if (G.noRender) return;
    const f = G.fx && G.fx[n];
    if (f) f(a, b, c, d, e);
  }
  const ZK = () => G.ZK || 0.85;

  // ---------- số liệu ----------
  // r(id): bậc đang có của nút id. Mỗi cây 6 nút, 28 điểm để đầy. need: số điểm đã dồn vào cây này mới mở được nút.
  G.CHUONG = {
    cost: 30, cd: 1.0,                 // mana mỗi phát, thời gian hồi (giây)
    frac: 0.8, min: 130, max: 205,     // tầm bay: frac lần bề ngang sàn, kẹp trong [min, max]
    tap: 0.16, charge: 0.8,            // Hỏa chưởng có nút Tích lực: giữ quá tap giây là bắt đầu tích, đầy sau charge giây
    maxZones: 5,                       // số vệt lửa, mây độc của chưởng cùng lúc trên sân
    power: 0.004,                      // Sức mạnh: mỗi điểm chưởng đã học thêm 0,4% phần đòn
    order: ['hoa', 'doc', 'bang'],
    defTree: { smith: 'hoa', hunter: 'bang', healer: 'doc', wrestler: 'hoa' },
    // Nét riêng của từng em bé (thay cho kỹ năng cũ)
    hero: {
      smith: { was: 'Nung', note: 'Chưởng đẩy lùi quái mạnh (lực tay thợ rèn)', push: 16 },
      hunter: { was: 'Đặt bẫy', note: 'Chưởng bay xa hơn 30% và nhanh hơn 25%', range: 1.3, speed: 1.25 },
      healer: { was: 'Bình thuốc', note: 'Chưởng trúng quái thì hồi 1,5% máu (tối đa 3 lần mỗi phát)', heal: 0.015, healMax: 3 },
      wrestler: { was: 'Gồng', note: 'Chưởng tầm gần (60%) mà to (rộng gấp rưỡi) và mạnh hơn 15%', range: 0.6, size: 1.5, area: 1.3, dmg: 1.15 },
    },
    trees: {
      hoa: {
        name: 'Hỏa chưởng', el: 'fire', short: 'Cầu lửa nổ lan khi trúng, gây cháy',
        speed: 250, hit: 1.4, blast: 0.6, blastR: 18, half: 6,
        nodes: [
          { id: 'luc', name: 'Hỏa lực', max: 5, need: 0, desc: (r) => 'Sát thương chưởng +' + 10 * r + '%', d1: 'Mỗi bậc: sát thương +10%' },
          { id: 'no', name: 'Nổ to', max: 5, need: 0, desc: (r) => 'Vùng nổ rộng thêm ' + 4 * r + ', nổ mạnh +' + 8 * r + '%', d1: 'Mỗi bậc: vùng nổ rộng hơn, nổ mạnh +8%' },
          { id: 'vet', name: 'Vệt cháy', max: 5, need: 5, desc: (r) => 'Cầu lửa để lại vệt cháy trên sàn ' + (1 + 0.3 * r).toFixed(1).replace('.', ',') + ' giây', d1: 'Cầu lửa để lại vệt cháy đốt quái đi qua; mỗi bậc cháy lâu, mạnh hơn' },
          { id: 'dai', name: 'Lửa dai', max: 5, need: 5, desc: (r) => 'Cháy lâu hơn ' + 20 * r + '%, đốt mạnh hơn ' + 10 * r + '%', d1: 'Mỗi bậc: cháy lâu hơn 20%, đốt mạnh hơn 10%' },
          { id: 'tich', name: 'Tích lực', max: 5, need: 10, desc: (r) => 'Giữ nút Chưởng để tích, thả ra cầu lửa lớn x' + (1.8 + 0.2 * r).toFixed(1).replace('.', ','), d1: 'Giữ nút Chưởng rồi thả: cầu lửa lớn, nổ rộng; mỗi bậc mạnh hơn' },
          { id: 'tan', name: 'Mưa tàn lửa', max: 3, need: 18, desc: (r) => 'Nổ xong văng ' + (1 + r) + ' tàn lửa vào quái gần', d1: 'Nổ xong văng tàn lửa trúng quái quanh đó; mỗi bậc thêm 1 tàn' },
        ],
      },
      doc: {
        name: 'Độc chưởng', el: 'poison', short: 'Luồng độc, để lại đám mây độc',
        speed: 230, hit: 1.0, stacks: 2, cloudR: 20, cloudLife: 2.5, cloudEvery: 0.5, cloudSrc: 0.6, cloudDmg: 0.12, half: 6,
        nodes: [
          { id: 'luc', name: 'Độc lực', max: 5, need: 0, desc: (r) => 'Sát thương chưởng +' + 10 * r + '%', d1: 'Mỗi bậc: sát thương +10%' },
          { id: 'may', name: 'Mây dày', max: 5, need: 0, desc: (r) => 'Mây độc rộng thêm ' + 3 * r + ', lâu thêm ' + (0.4 * r).toFixed(1).replace('.', ',') + ' giây', d1: 'Mỗi bậc: mây độc to hơn, lâu hơn' },
          { id: 'lay', name: 'Lây độc', max: 5, need: 5, desc: (r) => 'Quái dính độc chưởng chết: lây ' + (1 + Math.floor(r / 2)) + ' tầng độc sang quái gần', d1: 'Quái dính độc chưởng mà chết thì độc lây sang quái gần' },
          { id: 'mon', name: 'Ăn mòn', max: 5, need: 5, desc: (r) => 'Quái dính độc chưởng mất ' + 6 * r + '% giáp, nhận thêm ' + 4 * r + '% sát thương', d1: 'Quái dính độc chưởng bị giảm giáp, nhận thêm sát thương' },
          { id: 'tach', name: 'Tam xà', max: 5, need: 10, desc: (r) => 'Chưởng tách 3 luồng, hai luồng bên x' + (0.35 + 0.07 * r).toFixed(2).replace('.', ','), d1: 'Chưởng tách thành 3 luồng toả ra; mỗi bậc luồng bên mạnh hơn' },
          { id: 'hut', name: 'Vạn độc', max: 3, need: 18, desc: (r) => 'Mây độc hút quái vào giữa, độc mây mạnh +' + 25 * r + '%', d1: 'Mây độc hút quái vào giữa và mạnh hơn' },
        ],
      },
      bang: {
        name: 'Băng chưởng', el: 'ice', short: 'Mũi băng xuyên nhiều quái, làm chậm',
        speed: 320, hit: 1.2, pierce: 2, fall: 0.85, stacks: 2, half: 5, range: 1.12,
        nodes: [
          { id: 'luc', name: 'Hàn lực', max: 5, need: 0, desc: (r) => 'Sát thương chưởng +' + 10 * r + '%', d1: 'Mỗi bậc: sát thương +10%' },
          { id: 'xa', name: 'Tầm xa', max: 5, need: 0, desc: (r) => 'Bay xa hơn ' + 12 * r + '%, nhanh hơn ' + 8 * r + '%', d1: 'Mỗi bậc: bay xa hơn 12%, nhanh hơn 8%' },
          { id: 'xuyen', name: 'Xuyên băng', max: 5, need: 5, desc: (r) => 'Xuyên thêm ' + r + ' quái (tổng ' + (3 + r) + ')', d1: 'Mỗi bậc: xuyên thêm 1 quái' },
          { id: 'dong', name: 'Đóng băng', max: 5, need: 5, desc: (r) => 'Mỗi lần trúng ' + (2 + Math.ceil(r / 2)) + ' tầng Băng, đóng băng lâu hơn ' + 10 * r + '%', d1: 'Trúng nhiều lần là đóng băng: thêm tầng Băng mỗi lần trúng' },
          { id: 'vo', name: 'Băng vỡ', max: 5, need: 10, desc: (r) => 'Quái đóng băng chết thì vỡ, bắn ' + (2 + Math.ceil(r * 0.8)) + ' mảnh băng', d1: 'Quái đang đóng băng mà chết thì vỡ vụn, bắn mảnh băng làm chậm' },
          { id: 'phong', name: 'Băng phong', max: 3, need: 18, desc: (r) => 'Mũi băng to hơn, cuối đường nổ vòng băng rộng ' + (16 + 6 * r), d1: 'Mũi băng to hơn, cuối đường bay nổ một vòng băng' },
        ],
      },
    },
  };
  const C = G.CHUONG;
  CH.LAYOUT = [[0, 1], [2, 3], [4], [5]]; // hàng nút trên bảng cây: hai nút gốc, hai nhánh, nút lớn, nút đỉnh
  CH.fullPts = (k) => C.trees[k].nodes.reduce((a, n) => a + n.max, 0);

  // ---------- điểm và cây (bản lưu) ----------
  function state(hs, key) {
    if (!hs.ch || typeof hs.ch !== 'object' || Array.isArray(hs.ch)) hs.ch = { cay: null, n: {} };
    if (!C.trees[hs.ch.cay]) hs.ch.cay = C.defTree[key] || 'hoa';
    if (!hs.ch.n || typeof hs.ch.n !== 'object' || Array.isArray(hs.ch.n)) hs.ch.n = {};
    return hs.ch;
  }
  CH.state = state;
  // Sửa phần chưởng của bản lưu (gọi trong G.fixSave): nút lạ bỏ đi, bậc kẹp trong [0, max], tổng quá số điểm theo cấp thì trả lại hết.
  CH.fix = function (hs, key) {
    const s = state(hs, key), T = C.trees[s.cay], n = {};
    let sum = 0;
    for (const nd of T.nodes) {
      const v = Math.floor(Number(s.n[nd.id]) || 0);
      if (v > 0) { n[nd.id] = Math.min(nd.max, v); sum += n[nd.id]; }
    }
    s.n = sum > hs.lvl ? {} : n;
    // nút đã học mà chưa đủ điểm dồn để mở (bản lưu bị sửa tay): trả lại hết cho chắc
    for (const nd of T.nodes) if (s.n[nd.id] && spentIn(s, nd.id) < nd.need) { s.n = {}; break; }
    return s;
  };
  const spentAll = (s) => { let a = 0; for (const k in s.n) a += s.n[k] | 0; return a; };
  // điểm đã dồn vào cây, không tính nút id (để xét điều kiện mở nút đó)
  function spentIn(s, id) { let a = 0; for (const k in s.n) if (k !== id) a += s.n[k] | 0; return a; }
  CH.pts = function (hs, key) {
    const s = state(hs, key), spent = spentAll(s);
    return { total: hs.lvl, spent, left: Math.max(0, hs.lvl - spent) };
  };
  CH.rank = (hs, id, key) => (state(hs, key).n[id] | 0);
  CH.node = (cay, id) => C.trees[cay].nodes.find((n) => n.id === id);
  // Vì sao chưa học được nút id ('' là học được)
  CH.why = function (hs, id, key) {
    const s = state(hs, key), nd = CH.node(s.cay, id);
    if (!nd) return 'Không có nút này';
    if ((s.n[id] | 0) >= nd.max) return 'Đã đủ bậc';
    if (spentAll(s) < nd.need) return 'Cần dồn ' + nd.need + ' điểm vào cây';
    if (CH.pts(hs, key).left <= 0) return 'Hết điểm chưởng (lên cấp để có thêm)';
    return '';
  };
  CH.learn = function (hs, id, key) {
    if (CH.why(hs, id, key)) return false;
    const s = state(hs, key);
    s.n[id] = (s.n[id] | 0) + 1;
    return true;
  };
  // Đổi cây (chỉ ở làng): miễn phí, trả lại hết điểm đã học
  CH.use = function (hs, cay, key) {
    if (!C.trees[cay]) return false;
    const s = state(hs, key);
    if (s.cay === cay) return false;
    s.cay = cay; s.n = {};
    return true;
  };
  CH.heroKey = (P) => (P && P.key) || (G.save && G.save.hero) || 'smith';

  // ---------- chỉ số chưởng của em bé (từ cây đang dùng và nét riêng) ----------
  CH.stats = function (key, hs) {
    const s = state(hs, key), T = C.trees[s.cay], r = (id) => s.n[id] | 0, Hh = C.hero[key] || {};
    const o = {
      cay: s.cay, el: T.el, name: T.name, cost: C.cost, cd: C.cd,
      dmg: (1 + 0.1 * r('luc')) * (Hh.dmg || 1), speed: T.speed * (Hh.speed || 1), rangeK: (T.range || 1) * (Hh.range || 1),
      half: T.half * (Hh.size || 1), area: Hh.area || 1, push: Hh.push || 4, heal: Hh.heal || 0, healMax: Hh.healMax || 0,
      hit: T.hit,
    };
    if (s.cay === 'hoa') {
      Object.assign(o, {
        blast: T.blast * (1 + 0.08 * r('no')), blastR: (T.blastR + 4 * r('no')) * o.area,
        trail: r('vet'), trailLife: 1 + 0.3 * r('vet'), trailSrc: 0.25 + 0.05 * r('vet'),
        burnDur: 1 + 0.2 * r('dai'), burnDmg: 1 + 0.1 * r('dai'),
        charge: r('tich'), chargeMult: 1.8 + 0.2 * r('tich'), embers: r('tan') ? 1 + r('tan') : 0,
      });
    } else if (s.cay === 'doc') {
      Object.assign(o, {
        stacks: T.stacks, cloudR: (T.cloudR + 3 * r('may')) * o.area, cloudLife: T.cloudLife + 0.4 * r('may'), cloudEvery: T.cloudEvery,
        cloudSrc: T.cloudSrc, cloudDmg: T.cloudDmg * (1 + 0.25 * r('hut')),
        spread: r('lay') ? 1 + Math.floor(r('lay') / 2) : 0, spreadR: 26 + 4 * r('lay'), corrode: r('mon'),
        split: r('tach'), side: 0.35 + 0.07 * r('tach'), pull: r('hut') ? 6 + 6 * r('hut') : 0,
      });
    } else {
      Object.assign(o, {
        pierce: T.pierce + r('xuyen'), fall: T.fall, stacks: T.stacks + (r('dong') ? Math.ceil(r('dong') / 2) : 0), freezeK: 1 + 0.1 * r('dong'),
        shards: r('vo') ? 2 + Math.ceil(r('vo') * 0.8) : 0, shard: 0.3 + 0.04 * r('vo'),
        burst: r('phong') ? 16 + 6 * r('phong') : 0,
      });
      o.rangeK *= 1 + 0.12 * r('xa'); o.speed *= 1 + 0.08 * r('xa'); o.half += 1.5 * r('phong');
    }
    if (key === 'smith') o.cost = C.cost; // (Thợ Rèn: nét riêng là đẩy lùi, giá như mọi bé)
    return o;
  };
  // Sức chưởng D: đòn mạnh nhất trong các vũ khí đang mang, quy về thang kiếm (giống phần đòn của G.power)
  CH.base = function (P) {
    let best = 0;
    for (const w of P.weapons || []) best = Math.max(best, (G.pDamage(P, w) / G.WTYPES[w.type].dmg) * 10);
    return best || 10 * (1 + G.LVL_DMG * ((P.lvl || 1) - 1)) * (P.dmgMult || 1);
  };
  CH.cost = (P) => (P && P.ch ? P.ch.cost : C.cost);
  // Gọi trong G.buildPlayer: gắn chỉ số chưởng lên người chơi
  CH.attach = function (P, sv) {
    const hs = sv.heroes[P.key];
    P.ch = CH.stats(P.key, hs);
    P.chHold = false; P.chT = 0;
    return P.ch;
  };
  // Phần chưởng trong Sức mạnh: hệ số nhân thêm vào phần đòn
  CH.powerMult = function (sv, key) {
    const hs = sv.heroes[key || sv.hero];
    return 1 + C.power * CH.pts(hs, key || sv.hero).spent;
  };

  // ---------- gây sát thương và hiệu ứng (đánh dấu là của chưởng) ----------
  // G.chSrc bật trong lúc chưởng gây hiệu ứng: G.applyStatus ghi hiệu ứng đó là của chưởng (không kết hợp hệ với vũ khí).
  function withCh(fn) { const was = G.chSrc; G.chSrc = true; try { fn(); } finally { G.chSrc = was; } }
  function chDamage(e, amt, el, stacks, src, q) {
    if (e.dead || e.hidden || e.ghost) return 0;
    const W = G.getWorld(), P = W.P, ch = (q && q.ch) || P.ch;
    let d = 0;
    withCh(() => {
      d = G.damage(e, amt, { el, src: 'ch', ch: true, ranged: true });
      if (!e.dead && stacks > 0) {
        G.applyStatus(e, el, src, stacks);
        if (el === 'fire' && e.st.fire > 0 && ch.burnDur > 1) { e.st.fire = Math.max(e.st.fire, 3 * P.statusDur * ch.burnDur); }
        if (el === 'poison' && ch.corrode) e.st.chCorr = ch.corrode;
        if (el === 'ice' && e.st.frozen > 0 && ch.freezeK > 1 && !e.chFrz) { e.chFrz = true; e.st.frozen *= ch.freezeK; }
        if (!(e.st.frozen > 0)) e.chFrz = false;
      }
    });
    return d;
  }
  CH.damage = chDamage;
  function around(x, y, r, fn, skip) {
    for (const e of G.targets()) if (e !== skip && Math.hypot(e.x - x, (e.y - y) / ZK()) < r + e.r) fn(e);
  }
  // Trúng trực tiếp (không phải nổ lan, không phải vũng): nét riêng của em bé (đẩy lùi, hồi máu)
  function direct(e, q) {
    const W = G.getWorld(), P = W.P, ch = q.ch;
    if (!e.dead && !e.isBoss && ch.push) { e.x += q.ux * ch.push; e.y += q.uy * ch.push * ZK(); e.x = G.clamp(e.x, W.x0, W.x1); e.y = G.clamp(e.y, W.y0, W.y1); }
    if (ch.heal && (q.heals | 0) < ch.healMax) { q.heals = (q.heals | 0) + 1; P.hp = Math.min(P.maxhp, P.hp + P.maxhp * ch.heal); FX('chHeal', P); }
  }
  function zone(W, o) {
    const L = W.chZones || (W.chZones = []);
    const live = L.filter((z) => !z.dead);
    if (live.length >= C.maxZones) live[0].dead = true;
    const z = Object.assign({ tick: 0.05, t: 0 }, o);
    z.x = G.clamp(z.x, W.x0, W.x1); z.y = G.clamp(z.y, W.y0, W.y1); z.life0 = z.life;
    L.push(z);
    return z;
  }

  // ---------- bắn ----------
  CH.can = (P) => !!P.ch && P.mana >= P.ch.cost && P.skillCd <= 0;
  // Bắn một phát chưởng. c: độ tích lực 0..1 (chỉ Hỏa chưởng có nút Tích lực).
  CH.fire = function (P, c) {
    const W = G.getWorld(), ch = P.ch;
    if (!ch || !W) return null;
    c = c || 0;
    P.mana -= ch.cost;
    P.castT = 0.3;
    P.skillCd = ch.cd * (P.cdMul || 1);
    const range = G.clamp((W.x1 - W.x0) * C.frac, C.min, C.max) * ch.rangeK;
    const M = G.moves, A = M ? M.aimM(P, range + 10) : { ux: P.face, uy: 0 };
    const D = CH.base(P) * ch.dmg;
    const big = c > 0 && ch.charge ? c : 0;
    const mk = (ux, uy, mult, main) => {
      const q0 = M ? M.along(P.x, P.y, ux, uy, 8) : [P.x + ux * 8, P.y];
      const q = {
        kind: ch.cay, el: ch.el, x: q0[0], y: q0[1], x0: q0[0], y0: q0[1], px: P.x, py: P.y, fresh: true, ux, uy,
        left: range * (big ? 1.1 : 1), v: ch.speed * (big ? 0.85 : 1), half: ch.half * (big ? 1 + 0.5 * big : 1),
        D, mult, seen: [], walked: 0, ch, big, main: !!main, pierce: ch.pierce || 0, t: 0,
      };
      (W.chs || (W.chs = [])).push(q);
      return q;
    };
    if (ch.cay === 'doc' && ch.split) {
      const a = Math.atan2(A.uy, A.ux);
      mk(A.ux, A.uy, 1, true);
      for (const s of [-0.34, 0.34]) mk(Math.cos(a + s), Math.sin(a + s), ch.side, false);
    } else mk(A.ux, A.uy, big ? 1 + (ch.chargeMult - 1) * big : 1, true);
    G.sfx('boom', ch.cay === 'bang' ? 2.2 : ch.cay === 'doc' ? 1.4 : 1.7);
    FX('chCast', P, ch.cay, A, big);
    return W.chs[W.chs.length - 1];
  };
  // Mỗi khung, trong G.updatePlayer: bấm thì bắn; có nút Tích lực thì giữ để tích, thả ra mới bắn.
  // pressed: vừa bấm (inp.skillP) và được phép (không bận né, không vừa tung Đặc biệt). held: nút đang được giữ.
  CH.input = function (P, pressed, held, dt) {
    const ch = P.ch;
    if (!ch) return false;
    if (P.chHold) {
      if (P.dodgeT > 0 || P.dead) { P.chHold = false; P.chT = 0; return false; }
      if (held) { P.chT += dt; return true; }
      const c = P.chT < C.tap ? 0 : Math.min(1, (P.chT - C.tap) / C.charge);
      P.chHold = false; P.chT = 0;
      if (P.mana >= ch.cost) CH.fire(P, c);
      return true;
    }
    if (!pressed || !CH.can(P)) return false;
    if (ch.charge) { P.chHold = true; P.chT = 0; if (!held) { P.chHold = false; CH.fire(P, 0); } return true; }
    CH.fire(P, 0);
    return true;
  };
  // độ tích lực hiện tại (0..1) cho nút và hình
  CH.chargeOf = (P) => (P && P.chHold ? G.clamp((P.chT - C.tap) / C.charge, 0, 1) : 0);

  // ---------- chưởng bay ----------
  function hoaBoom(W, q, x, y, first) {
    const ch = q.ch, k = q.big ? 1 + 0.5 * q.big : 1, R = ch.blastR * k, D = q.D * q.mult;
    if (first) { chDamage(first, D * ch.hit, 'fire', 1, D * ch.burnDmg, q); direct(first, q); }
    around(x, y, R, (e) => chDamage(e, D * ch.blast, 'fire', 1, D * ch.burnDmg, q), first);
    if (ch.embers) {
      // tàn lửa văng tới quái gần (không phải con vừa trúng), không đủ quái thì văng ra xung quanh
      const near = G.targets().filter((e) => e !== first && Math.hypot(e.x - x, (e.y - y) / ZK()) < 80).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
      for (let i = 0; i < ch.embers; i++) {
        const t = near[i % Math.max(1, near.length)];
        let ux, uy;
        if (t) { ux = t.x - x; uy = (t.y - y) / ZK(); } else { const a = (i / ch.embers) * Math.PI * 2 + 0.4; ux = Math.cos(a); uy = Math.sin(a); }
        const l = Math.hypot(ux, uy) || 1;
        (W.chs || (W.chs = [])).push({ kind: 'tan', el: 'fire', x, y, x0: x, y0: y, ux: ux / l, uy: uy / l, left: 80, v: 200, half: 4, D, mult: 0.3, seen: first ? [first] : [], walked: 0, ch, t: 0 });
      }
    }
    W.shake = Math.max(W.shake, q.big ? 0.22 : 0.1);
    G.sfx('boom', q.big ? 1.2 : 1.6);
    FX('chBoom', 'hoa', x, y, R, q);
  }
  function docSplash(W, q, x, y, first) {
    const ch = q.ch, D = q.D * q.mult;
    if (first) { chDamage(first, D * ch.hit, 'poison', ch.stacks, D, q); direct(first, q); }
    const small = !q.main;
    zone(W, { kind: 'may', el: 'poison', x, y, r: ch.cloudR * (small ? 0.75 : 1), life: ch.cloudLife * (small ? 0.6 : 1), every: ch.cloudEvery, src: q.D * ch.cloudSrc, dmg: q.D * ch.cloudDmg, pull: ch.pull });
    G.sfx('poison', 0.8);
    FX('chBoom', 'doc', x, y, ch.cloudR, q);
  }
  function bangBurst(W, q, x, y) {
    const ch = q.ch;
    if (!ch.burst) return;
    around(x, y, ch.burst, (e) => { if (!q.seen.includes(e)) chDamage(e, q.D * 0.3, 'ice', 1, q.D, q); });
    FX('chBoom', 'bang', x, y, ch.burst, q);
  }
  // Một phát chưởng bay đoạn (ax, ay) -> (q.x, q.y): danh sách quái chưa trúng nằm trên đường, theo thứ tự gần trước
  function sweep(q, ax, ay) {
    const M = G.moves, out = [];
    for (const e of G.targets()) {
      if (q.seen.includes(e)) continue;
      const a = M.onStrip(e, ax, ay, q.x, q.y, q.ux, q.uy, q.half);
      if (a > -1e8) out.push([a, e]);
    }
    out.sort((a, b) => a[0] - b[0]);
    return out.map((a) => a[1]);
  }
  function step(W, q, dt) {
    const M = G.moves;
    q.t += dt;
    const ax = q.fresh ? q.px : q.x, ay = q.fresh ? q.py : q.y;
    if (q.fresh) q.fresh = false;
    const d = Math.min(q.left, q.v * dt), lim = M.wallLen(q.x, q.y, q.ux, q.uy, d);
    q.x += q.ux * lim; q.y += q.uy * lim * ZK(); q.left -= d; q.walked += lim;
    const wall = lim < d - 0.01;
    const got = sweep(q, ax, ay);
    // chậu than, nấm, đá băng trên đường bay: kích nổ (như đạn của vũ khí), không chặn chưởng
    for (const pr of W.props) if (pr.env && !pr.used && M.onStrip({ x: pr.x, y: pr.y, r: 4, hr: 4 }, ax, ay, q.x, q.y, q.ux, q.uy, q.half) > -1e8) G.triggerProp(pr);
    if (q.kind === 'hoa') {
      // vệt cháy dọc đường bay: cứ 16 điểm ảnh một mảng lửa nhỏ
      if (q.ch.trail && q.main) {
        q.trailD = (q.trailD || 0) + lim;
        while (q.trailD >= 16) {
          q.trailD -= 16;
          const back = q.trailD;
          zone(W, { kind: 'vet', el: 'fire', x: q.x - q.ux * back, y: q.y - q.uy * back * ZK(), r: 10 * q.ch.area, life: q.ch.trailLife, every: 0.5, src: q.D * q.ch.trailSrc * q.ch.burnDmg, dmg: q.D * 0.08 });
        }
      }
      if (got.length) { const e = got[0]; q.seen.push(e); hoaBoom(W, q, e.x, e.y, e); q.done = true; return; }
      if (wall || q.left <= 0) { hoaBoom(W, q, q.x, q.y, null); q.done = true; }
    } else if (q.kind === 'doc') {
      if (got.length) { const e = got[0]; q.seen.push(e); docSplash(W, q, e.x, e.y, e); q.done = true; return; }
      if (wall || q.left <= 0) { docSplash(W, q, q.x, q.y, null); q.done = true; }
    } else if (q.kind === 'bang') {
      for (const e of got) {
        q.seen.push(e);
        chDamage(e, q.D * q.mult * q.ch.hit, 'ice', q.ch.stacks, q.D * q.mult, q);
        direct(e, q);
        FX('chHit', 'bang', e, q);
        q.mult *= q.ch.fall;
        if (q.pierce <= 0) { q.left = 0; q.stop = e; break; }
        q.pierce--;
      }
      if (wall || q.left <= 0) { bangBurst(W, q, q.x, q.y); q.done = true; FX('chEnd', q, wall); }
    } else if (q.kind === 'tan' || q.kind === 'manh') {
      // tàn lửa (Mưa tàn lửa) và mảnh băng (Băng vỡ): trúng con đầu tiên rồi tắt
      if (got.length) {
        const e = got[0];
        chDamage(e, q.D * q.mult, q.el, 1, q.D * (q.ch.burnDmg || 1), q);
        FX('chHit', q.kind, e, q);
        q.done = true; return;
      }
      if (wall || q.left <= 0) q.done = true;
    }
  }
  function tickZones(W, dt) {
    const L = W.chZones;
    if (!L || !L.length) return;
    for (const z of L) {
      if (z.dead) continue;
      z.t += dt; z.life -= dt; z.tick -= dt;
      if (z.pull) {
        // Vạn độc: mây hút quái (không phải trùm) về giữa
        for (const e of G.targets()) {
          if (e.isBoss) continue;
          const dx = z.x - e.x, dy = (z.y - e.y) / ZK(), d = Math.hypot(dx, dy);
          if (d > 2 && d < z.r + e.r) { const m = Math.min(d, z.pull * dt); e.x += (dx / d) * m; e.y += (dy / d) * m * ZK(); }
        }
      }
      if (z.tick <= 0) {
        z.tick = z.every;
        around(z.x, z.y, z.r, (e) => chDamage(e, z.dmg, z.el, 1, z.src, null));
      }
      if (z.life <= 0) z.dead = true;
    }
    W.chZones = L.filter((z) => !z.dead);
  }
  // Gọi mỗi khung từ G.updateWorld (js/combat.js)
  CH.update = function (W, dt) {
    const L = W.chs;
    if (L && L.length) {
      for (const q of L.slice()) if (!q.done) step(W, q, dt);
      W.chs = W.chs.filter((q) => !q.done);
    }
    tickZones(W, dt);
  };
  // Quái chết (G.kill): Lây độc của Độc chưởng, Băng vỡ của Băng chưởng
  CH.onKill = function (e) {
    const W = G.getWorld(), P = W && W.P, ch = P && P.ch;
    if (!ch || e.illusion || !e.st || !e.st.ch) return;
    if (ch.cay === 'doc' && ch.spread && e.st.poisonN > 0 && e.st.ch.poison) {
      const n = Math.min(e.st.poisonN, ch.spread), src = e.st.poisonDmg / 0.06, got = [];
      around(e.x, e.y, ch.spreadR, (t) => got.push(t), e);
      withCh(() => { for (const t of got) { G.applyStatus(t, 'poison', src, n); if (ch.corrode) t.st.chCorr = ch.corrode; } });
      if (got.length) FX('chSpread', e, got);
    }
    if (ch.cay === 'bang' && ch.shards && e.st.frozen > 0 && e.st.ch.ice) {
      const D = CH.base(P) * ch.dmg;
      for (let i = 0; i < ch.shards; i++) {
        const a = (i / ch.shards) * Math.PI * 2 + 0.3;
        (W.chs || (W.chs = [])).push({ kind: 'manh', el: 'ice', x: e.x, y: e.y, x0: e.x, y0: e.y, ux: Math.cos(a), uy: Math.sin(a), left: 60, v: 230, half: 4, D, mult: ch.shard, seen: [e], walked: 0, ch, t: 0 });
      }
      FX('chShatter', e);
    }
  };

  // ---------- chữ hướng dẫn ----------
  CH.tip = 'Nút Chưởng (nút tròn trên cùng): bắn chưởng linh khí theo hệ của cây chưởng đang dùng, tự ngắm quái gần nhất. Tốn ' + C.cost + ' mana.';
})();
