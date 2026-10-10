// CÀY NÂNG CẤP (G.upg): liệt kê mọi đường nâng cấp em bé đang có thể đi, tính mỗi đường thêm bao nhiêu Sức mạnh (G.power),
// tốn gì, còn thiếu gì và nên chơi lại ải nào để kiếm cho đủ.
//   - Bảng thua (js/stage.js) dùng G.upgradeTips để gợi ý 2-3 việc nên cày, bấm vào thì đi thẳng tới người làng tương ứng.
//   - Bot kiểm tra cân bằng (tests/cay.py, tests/campaign.py) dùng G.upg.auto để nâng cấp như người chơi: làm việc rẻ mà hiệu quả trước.
// Sức mạnh chỉ đến từ cày: cấp hero, mài, nâng bậc, tiến hóa theo linh khí, nâng lò, cây kỹ năng, trang phục (may, nâng bậc, cánh).
// Thua KHÔNG làm bé mạnh thêm (đã bỏ "Quyết tâm").
(function () {
  const G = window.G;
  const U = (G.upg = {});
  // Quy mọi thứ ra vàng để so "rẻ" hay "đắt".
  U.VAL = { gold: 1, ore: 12, stones: 120, mat: 20, shard: 150, xp: 0.35, lk: 4 };
  U.costVal = function (c) {
    if (!c) return 0;
    let v = (c.gold || 0) * U.VAL.gold + (c.ore || 0) * U.VAL.ore + (c.stones || 0) * U.VAL.stones + (c.xp || 0) * U.VAL.xp + (c.lk || 0) * U.VAL.lk;
    for (let i = 0; i < 3; i++) v += ((c.mat && c.mat[i]) || 0) * U.VAL.mat + ((c.shard && c.shard[i]) || 0) * U.VAL.shard;
    return v;
  };
  // Phần còn thiếu của giá c so với bản lưu sv (null nếu đủ).
  U.missing = function (sv, c) {
    if (!c) return null;
    const m = { gold: Math.max(0, (c.gold || 0) - sv.gold), ore: Math.max(0, (c.ore || 0) - sv.ore), stones: Math.max(0, (c.stones || 0) - sv.stones), mat: [0, 0, 0], shard: [0, 0, 0] };
    let any = m.gold || m.ore || m.stones;
    for (let i = 0; i < 3; i++) {
      m.mat[i] = Math.max(0, ((c.mat && c.mat[i]) || 0) - sv.mats[i]);
      m.shard[i] = Math.max(0, ((c.shard && c.shard[i]) || 0) - sv.shards[i]);
      if (m.mat[i] || m.shard[i]) any = true;
    }
    return any ? m : null;
  };
  // Tên ải để chơi lại: ải thường cao nhất đã qua (trong vùng r nếu có).
  const stName = (r, i) => (i === 4 ? 'trùm ' + G.REGIONS[r].bossName : G.REGIONS[r].name + ' ' + (i + 1));
  U.grindStage = function (sv, r) {
    let best = null;
    for (let rr = 0; rr < 3; rr++) {
      if (r != null && rr !== r) continue;
      for (let i = 0; i < 4; i++) if (sv.stars[rr + '-' + i]) best = [rr, i];
    }
    // ưu tiên ải thường (dễ thắng, nhanh); chưa qua ải thường nào của vùng thì mới chỉ ải trùm
    if (!best) for (let rr = 0; rr < 3; rr++) if ((r == null || rr === r) && sv.stars[rr + '-4']) best = [rr, 4];
    return best;
  };
  // Ải nên chơi lại để kiếm phần thiếu m (mảnh trùm: đánh lại trùm; nguyên liệu: ải cao nhất đã qua của vùng đó; còn lại: ải cao nhất đã qua).
  U.where = function (sv, m) {
    if (m) {
      for (let i = 0; i < 3; i++) if (m.shard[i] && !sv.stars[i + '-4']) return null; // cần mảnh của trùm chưa hạ: chưa cày được
      for (let i = 0; i < 3; i++) if (m.shard[i]) return [i, 4];
      for (let i = 0; i < 3; i++) if (m.mat[i]) return U.grindStage(sv, i);
    }
    return U.grindStage(sv);
  };
  // Câu "còn thiếu ..." kèm chỗ nên cày.
  U.missText = function (sv, m) {
    const a = [];
    let where = null;
    for (let i = 0; i < 3; i++) {
      if (m.shard[i]) { a.push(m.shard[i] + ' mảnh ' + G.REGIONS[i].bossName); where = where || (sv.stars[i + '-4'] ? 'đánh lại trùm ' + G.REGIONS[i].bossName : 'hạ trùm ' + G.REGIONS[i].bossName); }
    }
    for (let i = 0; i < 3; i++) {
      if (!m.mat[i]) continue;
      a.push(m.mat[i] + ' ' + G.REGIONS[i].mat.toLowerCase());
      const g = U.grindStage(sv, i);
      where = where || (g ? 'chơi lại ' + stName(g[0], g[1]) : 'vào vùng ' + G.REGIONS[i].name);
    }
    if (m.gold) a.push(m.gold + ' vàng');
    if (m.ore) a.push(m.ore + ' quặng');
    if (m.stones) { a.push(m.stones + ' đá tôi'); where = where || 'đá tôi rơi từ rương, sao thứ ba lần đầu'; }
    if (!where && (m.gold || m.ore)) { const g = U.grindStage(sv); if (g) where = 'chơi lại ' + stName(g[0], g[1]); }
    return 'thiếu ' + a.join(', ') + (where ? ' — ' + where : '');
  };

  // ---------- các đường nâng cấp ----------
  const wById = (sv, id) => sv.weapons.find((w) => w.id === id) || null;
  const wNameOf = (w) => G.wName(w).replace(/ \+\d+$/, '');
  const pts = (hs) => Math.floor(hs.lvl / 3) - (hs.sk.atk + hs.sk.def + hs.sk.elem);
  function setRar(w, to, gold) {
    w.rarity = to; if (w.tier != null) w.tier = to;
    if (to === 3) w.gold = gold;
    if (G.fitAffixes) G.fitAffixes(w);
  }
  // Danh sách thô: { kind, key, title, cost, apply(sv) (null nếu không làm ngay được), go: {who, ...}, need (thiếu kinh nghiệm, linh khí) }
  U.list = function (sv) {
    sv = sv || G.save;
    const out = [], hs = sv.heroes[sv.hero], O = G.outfit;
    // cây kỹ năng
    if (pts(hs) > 0) {
      for (const b of G.SKEYS) if (hs.sk[b] < 5) out.push({ kind: 'skill', key: 'skill', br: b, title: 'Còn ' + pts(hs) + ' điểm kỹ năng chưa học (nhánh ' + G.SKILLS[b].name + ')', cost: {}, apply: (s) => { s.heroes[s.hero].sk[b]++; }, go: { who: 'do' } });
    }
    // cây chưởng (js/chuong.js): điểm chưởng chưa học
    if (G.chuong) {
      const cp = G.chuong.pts(hs, sv.hero);
      if (cp.left > 0) out.push({ kind: 'chuong', key: 'chuong', title: 'Còn ' + cp.left + ' điểm chưởng chưa học (' + G.CHUONG.trees[hs.ch.cay].name + ')', cost: {}, apply: (s) => { const h = s.heroes[s.hero]; G.chuong.autoLearn(h, s.hero); }, go: { who: 'do', tab: 'chuong' } });
    }
    // vũ khí đang mang: mài, nâng bậc, lên Vàng, nâng lò
    const cap = G.FORGE_CAP[sv.forge];
    let needForge = false;
    for (const id of sv.carry) {
      const w = wById(sv, id);
      if (!w) continue;
      const nm = wNameOf(w), r = G.wRar(w);
      if (w.sharpen < Math.min(cap, G.MAX_SHARPEN)) {
        out.push({ kind: 'sharpen', key: 'sh' + id, title: 'Mài ' + nm + ' lên +' + (w.sharpen + 1), cost: G.sharpenFull(w.sharpen), apply: (s) => { wById(s, id).sharpen++; }, go: { who: 'ren', ftab: 'sharpen', sel: id } });
      } else if (w.sharpen < G.MAX_SHARPEN) needForge = true;
      if (r < 2) out.push({ kind: 'tier', key: 'ti' + id, title: 'Nâng ' + nm + ' lên ' + G.RARITY[r + 1].name, cost: G.TIER_UP[r + 1], apply: (s) => setRar(wById(s, id), r + 1, 0), go: { who: 'ren', ftab: 'tier', sel: id } });
      else {
        // lên Vàng (hoặc Vàng mạnh hơn): mảnh trùm vùng cao nhất đã hạ, nếu chưa hạ trùm nào thì mảnh Mộc Tinh
        let k = 0;
        for (let q = 0; q < 3; q++) if (sv.stars[q + '-4']) k = q;
        if (r < 3 || k > (w.gold | 0)) out.push({ kind: 'gold', key: 'go' + id, title: 'Nâng ' + nm + ' lên Vàng ' + G.REGIONS[k].bossName, cost: G.goldCost(k), apply: (s) => setRar(wById(s, id), 3, k), go: { who: 'ren', ftab: 'tier', sel: id } });
      }
      // tiến hóa theo linh khí (dấu ấn): không mua được, phải chơi
      const st = G.wStage(w), maxSt = G.RARITY[r].maxStage;
      if (st < maxSt) {
        let el = w.branch;
        if (!el) { el = G.ELS[0]; for (const e of G.ELS) if ((w.marks[e] || 0) > (w.marks[el] || 0)) el = e; }
        const need = Math.ceil(G.MARKS[st] - (w.marks[el] || 0));
        if (need > 0) out.push({ kind: 'evolve', key: 'ev' + id, title: 'Tiến hóa ' + nm + ' lên ' + G.STAGE_NAMES[st + 1], cost: {}, need: { lk: need, el },
          sim: (s) => { const x = wById(s, id); x.marks[el] = G.MARKS[st]; if (!x.branch) x.branch = el; }, apply: null, go: { weapon: id } });
      }
    }
    const up = G.FORGE_UP[sv.forge];
    if (up && needForge) {
      const main = sv.carry.map((id) => wById(sv, id)).filter(Boolean).sort((a, b) => b.sharpen - a.sharpen)[0];
      out.push({ kind: 'forge', key: 'forge', title: 'Nâng lò lên cấp ' + (sv.forge + 1) + ' (mài tới +' + G.FORGE_CAP[sv.forge + 1] + ')', cost: up,
        apply: (s) => { s.forge++; }, sim: (s) => { s.forge++; if (main) wById(s, main.id).sharpen++; }, extra: main ? G.sharpenFull(main.sharpen) : null, go: { who: 'ren', ftab: 'up' } });
    }
    // mang vũ khí tốt hơn trong rương
    // (chỉ xét vài món mạnh nhất trong rương cho nhanh)
    const wq = (w) => G.wRarMult(w) * G.STAGE_MULT[G.wStage(w)] * (1 + 0.08 * w.sharpen) * G.WTYPES[w.type].dmg / (G.WTYPES[w.type].cd || 0.4);
    const stash = sv.weapons.filter((w) => !sv.carry.includes(w.id)).sort((a, b) => wq(b) - wq(a)).slice(0, 3);
    for (const w of stash) for (let slot = 0; slot < Math.max(1, sv.carry.length); slot++) {
      out.push({ kind: 'carry', key: 'ca' + w.id + '-' + slot, title: 'Mang ' + G.wName(w), cost: {}, apply: (s) => { s.carry[slot] = w.id; }, go: { who: 'xen' } });
    }
    // trang phục
    if (O && sv.outfit) {
      O.sync(sv);
      for (const slot of O.SLOTS) {
        const it = O.worn(sv, slot);
        if (it) {
          const id = it.id;
          if (slot === 'wing') { const c = O.wingCost(it); if (c) out.push({ kind: 'wing', key: 'wi' + id, title: 'Mở cấp ' + (it.lv + 1) + ' cho ' + O.ITEMS[it.k].name, cost: c, apply: (s) => { s.outfit.items.find((x) => x.id === id).lv++; }, go: { who: 'may', otab: 'wing', sel: id } }); }
          const c = O.upCost(it);
          if (c) out.push({ kind: 'oup', key: 'ou' + id, title: 'Nâng ' + O.ITEMS[it.k].name + ' lên ' + G.RARITY[it.r + 1].name, cost: c, apply: (s) => { s.outfit.items.find((x) => x.id === id).r++; }, go: { who: 'may', otab: 'wear', sel: id, oslot: slot } });
        }
        const qk = (x) => x.r * 10 + (x.lv || 0) * 5 + Object.values(O.stats(x)).reduce((a, b) => a + (b < 1 ? b * 100 : b), 0) / 10;
        const cands = sv.outfit.items.filter((x) => O.ITEMS[x.k].slot === slot && !(it && x.id === it.id)).sort((a, b) => qk(b) - qk(a)).slice(0, 2);
        for (const x of cands) {
          const id = x.id;
          out.push({ kind: 'wear', key: 'we' + id, title: 'Mặc ' + O.name(x), cost: {}, apply: (s) => { O.wear(s, s.outfit.items.find((q) => q.id === id)); }, go: { who: 'may', otab: 'wear', sel: id, oslot: slot } });
        }
      }
      if (!O.full(sv)) {
        const list = O.craftList();
        for (const k of list) {
          if (O.has(sv, k)) continue;
          out.push({ kind: 'craft', key: 'cr' + k, title: 'May ' + O.ITEMS[k].name, cost: O.craftCost(k), apply: (s) => { const it = O.craft(s, k); if (it) O.wear(s, it); }, go: { who: 'may', otab: 'craft', sel: k, page: Math.floor(list.indexOf(k) / 4) } });
        }
        for (const k of O.shopList()) {
          if (O.has(sv, k)) continue;
          out.push({ kind: 'buy', key: 'bu' + k, title: 'Mua ' + O.ITEMS[k].name, cost: { gold: O.ITEMS[k].price }, apply: (s) => { const it = O.buy(s, k); if (it) O.wear(s, it); }, go: { who: 'xen', gtab: 'outfit' } });
        }
      }
    }
    // cấp hero: không mua được, phải chơi
    if (hs.lvl < G.MAX_LEVEL) {
      const g = U.grindStage(sv);
      out.push({ kind: 'level', key: 'lvl', title: 'Lên cấp ' + (hs.lvl + 1), cost: {}, need: { xp: Math.max(1, Math.ceil(G.xpNeed(hs.lvl) - hs.xp)) },
        sim: (s) => { s.heroes[s.hero].lvl++; }, apply: null, go: { who: 'lai', stage: g } });
    }
    return out;
  };
  // Sức mạnh sau khi làm fn trên một bản sao của sv (bản lưu thật không đổi).
  U.powerWith = function (sv, fn) {
    const keep = G.save, c = JSON.parse(JSON.stringify(sv));
    G.save = c;
    try { if (fn) fn(c); return G.power(); } catch (e) { return 0; } finally { G.save = keep; }
  };
  // Tính thêm cho mỗi đường: gain (Sức mạnh tăng), ok (làm ngay được), miss (phần thiếu), val (độ đắt quy ra vàng).
  U.rate = function (sv, list) {
    sv = sv || G.save;
    const base = U.powerWith(sv);
    for (const o of list || U.list(sv)) {
      o.gain = U.powerWith(sv, o.sim || o.apply) - base;
      const full = o.extra ? addCost(o.cost, o.extra) : o.cost;
      o.miss = U.missing(sv, o.cost);
      o.ok = !!o.apply && !o.miss;
      o.val = U.costVal(full) + (o.need ? U.costVal(o.need) : 0);
      o.missVal = (o.miss ? U.costVal(o.miss) : 0) + (o.need ? U.costVal(o.need) : 0);
      o.base = base;
      o.where = o.miss || o.need ? U.where(sv, o.miss) : null;
    }
    return list;
  };
  function addCost(a, b) {
    const c = { gold: (a.gold || 0) + (b.gold || 0), ore: (a.ore || 0) + (b.ore || 0), stones: (a.stones || 0) + (b.stones || 0), mat: [0, 0, 0], shard: [0, 0, 0] };
    for (let i = 0; i < 3; i++) { c.mat[i] = ((a.mat && a.mat[i]) || 0) + ((b.mat && b.mat[i]) || 0); c.shard[i] = ((a.shard && a.shard[i]) || 0) + ((b.shard && b.shard[i]) || 0); }
    return c;
  }
  function pay(sv, c) {
    sv.gold -= c.gold || 0; sv.ore -= c.ore || 0; sv.stones -= c.stones || 0;
    for (let i = 0; i < 3; i++) { sv.mats[i] -= (c.mat && c.mat[i]) || 0; sv.shards[i] -= (c.shard && c.shard[i]) || 0; }
  }
  // Làm một đường nâng cấp trên bản lưu thật.
  U.doIt = function (sv, o) {
    const O = G.outfit;
    if (!o.apply || U.missing(sv, o.cost)) return false;
    if (o.kind !== 'craft' && o.kind !== 'buy') pay(sv, o.cost); // may và mua: js/outfit.js tự trừ
    o.apply(sv);
    return true;
  };
  // Nâng cấp tự động như người chơi chăm chỉ: lặp lại "làm việc đáng nhất trong những việc làm ngay được" (Sức mạnh tăng / độ đắt),
  // tới khi hết việc. Đổi đồ, mang vũ khí, học kỹ năng không tốn gì nên làm trước. Trả về danh sách việc đã làm.
  U.auto = function (sv, o) {
    sv = sv || G.save;
    o = o || {};
    const done = [];
    for (let n = 0; n < (o.max || 80); n++) {
      const all = U.rate(sv, U.list(sv).filter((q) => !(o.skip && o.skip.includes(q.kind))));
      // Điểm kỹ năng luôn học hết (nút như hồi máu mỗi phòng, lăn né hồi nhanh không làm tăng con số Sức mạnh nhưng giúp sống sót):
      // nhánh tăng sức mạnh nhiều nhất trước, bằng nhau thì nhánh đang ít điểm nhất (Thủ trước).
      const chq = all.find((q) => q.kind === 'chuong'); // điểm chưởng không tốn gì: học hết trước
      if (chq) { U.doIt(sv, chq); done.push(chq.title); continue; }
      const sk = all.filter((q) => q.kind === 'skill');
      if (sk.length) {
        const hs = sv.heroes[sv.hero], ord = ['def', 'atk', 'elem'];
        sk.sort((a, b) => b.gain - a.gain || hs.sk[a.br] - hs.sk[b.br] || ord.indexOf(a.br) - ord.indexOf(b.br));
        U.doIt(sv, sk[0]); done.push(sk[0].title); continue;
      }
      const list = all.filter((q) => q.ok && q.gain > 0);
      if (!list.length) break;
      list.sort((a, b) => b.gain / (5 + b.val) - a.gain / (5 + a.val));
      const best = list[0];
      if (!U.doIt(sv, best)) break;
      done.push(best.title);
    }
    return done;
  };

  // Nên chơi lại ải nào để cày: chỗ kiếm phần thiếu của việc đáng làm nhất còn thiếu đồ (như gợi ý ở bảng thua). null: ải mới nhất đã qua.
  U.grindTarget = function (sv) {
    sv = sv || G.save;
    const list = U.rate(sv, U.list(sv).filter((q) => q.kind !== 'carry' && q.kind !== 'skill' && q.kind !== 'chuong')).filter((q) => !q.ok && q.gain > 0 && q.where);
    if (!list.length) return null;
    list.sort((a, b) => b.gain / (25 + b.val * 0.15 + b.missVal) - a.gain / (25 + a.val * 0.15 + a.missVal));
    return list[0].where;
  };

  // ---------- gợi ý ở bảng thua ----------
  // Trả về { power, rec, tips: [{ text, sub, gain, ok, go }] } (tối đa n gợi ý, mặc định 3).
  G.upgradeTips = function (r, i, diff, n) {
    const sv = G.save;
    if (!sv || !sv.heroes) return null;
    const rec = G.stageRec(r, i, diff);
    let list = [];
    try { list = U.rate(sv, U.list(sv)).filter((q) => q.gain > 0 || q.kind === 'skill' || q.kind === 'chuong'); } catch (e) { list = []; }
    // Đường nào gần làm được mà tăng nhiều thì xếp trước; làm ngay được thì ưu tiên hẳn.
    // điểm kỹ năng chưa học luôn nhắc trước; việc cần mảnh của trùm chưa hạ (chưa cày được) xếp sau cùng
    const score = (q) => q.kind === 'skill' ? 1e9 + q.gain : q.kind === 'chuong' ? 1e8 + q.gain : (q.gain / (25 + q.val * 0.15 + q.missVal)) * (q.ok ? 4 : 1) * (q.miss && !q.where ? 0.05 : 1);
    list.sort((a, b) => score(b) - score(a));
    const tips = [], seen = {};
    // V53: người làng / thẻ chưa mở với người mới thì không gợi ý tới đó (bot cân bằng vẫn dùng U.list đầy đủ)
    const nStar = Object.keys(sv.stars || {}).length, mayOpen = !!(sv.stars && sv.stars['0-1']) || nStar >= 2;
    list = list.filter((q) => !(q.kind === 'chuong' && nStar < 1) && !(q.go && q.go.who === 'may' && !mayOpen));
    for (const q of list) {
      const grp = { skill: 'skill', chuong: 'chuong', carry: 'carry', wear: 'wear', buy: 'new', craft: 'new' }[q.kind] || q.key;
      if (seen[grp]) continue;
      seen[grp] = true;
      let sub;
      if (q.kind === 'level') { const g = q.go.stage; sub = 'còn thiếu ' + q.need.xp + ' kinh nghiệm' + (g ? ' — chơi lại ' + stName(g[0], g[1]) : ''); }
      else if (q.kind === 'evolve') sub = 'còn thiếu ' + q.need.lk + ' linh khí ' + G.EL[q.need.el].name + ' — kết liễu quái đang dính ' + G.EL[q.need.el].name;
      else if (q.miss) sub = U.missText(sv, q.miss);
      else sub = q.kind === 'skill' ? 'học ngay ở Cụ Đồ' : q.kind === 'chuong' ? 'học ngay ở Cụ Đồ, thẻ Cây chưởng' : q.kind === 'carry' ? 'đổi ngay ở Bà Hàng Xén' : q.kind === 'wear' ? 'mặc ngay ở Cô Thợ May' : 'đủ đồ rồi — tới ' + WHO_NAME[q.go.who] + ' làm ngay';
      tips.push({ text: q.title, sub, gain: Math.round(q.gain), ok: q.ok, go: q.go, kind: q.kind });
      if (tips.length >= (n || 3)) break;
    }
    return { power: G.power(), rec, tips };
  };
  // ---------- V21/V26: "+X Sức mạnh" cạnh nút nâng cấp, so món mới với món đang mang ----------
  // Sức mạnh tăng thêm (làm tròn) nếu làm fn trên bản sao của bản lưu (bản lưu thật không đổi). Nhớ kết quả theo key trong 1 giây
  // để không tính lại mỗi khung hình; key nên chứa trạng thái liên quan (ví dụ cấp mài) để đổi xong là tính lại ngay.
  const GC = new Map();
  U.gainOf = function (key, fn, sv) {
    sv = sv || G.save;
    const now = G.time || 0, hit = GC.get(key);
    if (hit && hit.sv === sv && now - hit.t < 1 && now >= hit.t) return hit.v;
    let v = 0;
    try { v = Math.round(U.powerWith(sv, fn) - U.powerWith(sv)); } catch (e) { v = 0; }
    if (!isFinite(v)) v = 0;
    if (GC.size > 120) GC.clear();
    GC.set(key, { v, t: now, sv });
    return v;
  };
  // Mang món w thay ô slot thì Sức mạnh đổi bao nhiêu (âm: kém hơn món đang mang ở ô đó).
  U.swapGain = function (w, slot, sv) {
    sv = sv || G.save;
    if (!w || !sv.carry || slot >= sv.carry.length || sv.carry.includes(w.id)) return 0;
    const cur = sv.carry[slot];
    return U.gainOf('sw' + w.id + '-' + slot + '-' + cur + '-' + (w.sharpen | 0) + '-' + G.wRar(w), (s) => { s.carry[slot] = w.id; }, sv);
  };
  // Chữ "+12 Sức mạnh" (hoặc "−5 Sức mạnh"); 0 thì trả chuỗi rỗng.
  U.gainText = (v, short) => (v > 0 ? '+' + v : v < 0 ? '−' + -v : '') + (v ? (short ? ' SM' : ' Sức mạnh') : '');
  // ---------- D6 (Q7): nút Công 4 đổi thành Khai huyệt — hoàn điểm một lần ----------
  // Bản lưu cũ có em bé đã học Công 4 ("+8% sát thương" lần hai) thì lùi nhánh Công về 3 nút; điểm của nút 4 (và nút 5 nếu đã học,
  // vì nhánh phải học theo thứ tự) trở thành điểm chưa dùng để học lại tuỳ ý. Chỉ làm MỘT lần cho cả bản lưu (cờ sv.khaiHuyet = 1).
  // sv.khaiHoan = số điểm vừa hoàn (để làng báo một câu rồi xoá; chưa có chỗ báo thì không sao, "Còn N điểm" vẫn hiện).
  // combat.js G.buildPlayer gọi hàm này; bản lưu chỉ thật sự ghi lại ở lần G.persist() kế tiếp (chưa ghi thì lần mở sau làm lại, kết quả như nhau).
  U.khaiHuyetFix = function (sv) {
    if (!sv || typeof sv !== 'object' || !sv.heroes || sv.khaiHuyet) return 0;
    let n = 0;
    for (const k in sv.heroes) {
      const h = sv.heroes[k];
      if (h && h.sk && typeof h.sk.atk === 'number' && h.sk.atk >= 4) { n += h.sk.atk - 3; h.sk.atk = 3; }
    }
    sv.khaiHuyet = 1;
    if (n > 0) sv.khaiHoan = (sv.khaiHoan | 0) + n;
    return n;
  };

  // ---------- V18 bước 2 (Q11): Thợ Rèn truyền linh khí vượt 300 sang vũ khí khác cùng loại ----------
  // Món nguồn giữ đúng 300 dấu ấn của hệ nó (vẫn Thức tỉnh); phần vượt chuyển nguyên sang món đích (không hao, không tốn gì).
  // Món đích: cùng loại vũ khí (kiếm sang kiếm...), khác món, chưa khoá hệ hoặc đã khoá đúng hệ đó.
  // Dùng ở lò rèn (giao diện ở js/village.js — chưa làm, xem docs/review/gd3/gd3-c.md):
  //   G.upg.lkInfo(sv, w)            -> { el, du, dich: [vũ khí đích] }  (du = 0 thì không có gì để truyền)
  //   G.upg.lkTruyen(sv, fromId, toId) -> { ok, n, el, msg }  (đổi bản lưu; người gọi tự G.persist())
  const LK_GIU = () => G.MARKS[G.MARKS.length - 1]; // 300
  U.lkEl = function (w) {
    if (!w || !w.marks) return null;
    if (w.branch) return w.branch;
    let el = null;
    for (const e of G.ELS) if ((w.marks[e] || 0) > 0 && (!el || w.marks[e] > w.marks[el])) el = e;
    return el;
  };
  U.lkInfo = function (sv, w) {
    sv = sv || G.save;
    const el = U.lkEl(w), du = el ? Math.max(0, Math.floor((w.marks[el] || 0) - LK_GIU())) : 0;
    const dich = !el ? [] : (sv.weapons || []).filter((x) => x && x.id !== w.id && x.type === w.type && (!x.branch || x.branch === el));
    return { el, du, dich };
  };
  U.lkTruyen = function (sv, fromId, toId) {
    sv = sv || G.save;
    const a = wById(sv, fromId), b = wById(sv, toId);
    if (!a || !b || a.id === b.id) return { ok: false, n: 0, msg: 'Chưa chọn đúng hai món.' };
    if (a.type !== b.type) return { ok: false, n: 0, msg: 'Chỉ truyền được sang vũ khí cùng loại.' };
    const I = U.lkInfo(sv, a), el = I.el;
    if (!el || I.du <= 0) return { ok: false, n: 0, msg: 'Món này chưa vượt ' + LK_GIU() + ' linh khí.' };
    if (b.branch && b.branch !== el) return { ok: false, n: 0, msg: 'Món kia đã theo hệ ' + G.EL[b.branch].name + '.' };
    const n = I.du;
    a.marks[el] -= n;
    b.marks = b.marks || { fire: 0, poison: 0, ice: 0 };
    b.marks[el] = (b.marks[el] || 0) + n;
    if (!b.branch && b.marks[el] >= G.MARKS[0]) b.branch = el; // như G.addMarks: đủ 30 thì khoá nhánh hệ
    return { ok: true, n, el, msg: 'Đã truyền ' + n + ' linh khí ' + G.EL[el].name + ' sang ' + G.wName(b) + '.' };
  };

  const WHO_NAME = { ren: 'Ông Thợ Rèn', may: 'Cô Thợ May', xen: 'Bà Hàng Xén', do: 'Cụ Đồ', lai: 'Chú Lái Đò' };
  U.WHO_NAME = WHO_NAME;
})();
