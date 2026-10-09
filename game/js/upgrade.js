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
  // Tên ải để chơi lại: ải cao nhất đã qua (trong vùng r nếu có).
  const stName = (r, i) => (i === 4 ? 'trùm ' + G.REGIONS[r].bossName : G.REGIONS[r].name + ' ' + (i + 1));
  U.grindStage = function (sv, r) {
    let best = null;
    for (let rr = 0; rr < 3; rr++) {
      if (r != null && rr !== r) continue;
      for (let i = 0; i < 5; i++) if (sv.stars[rr + '-' + i]) best = [rr, i];
    }
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
    const list = U.rate(sv, U.list(sv).filter((q) => q.kind !== 'carry' && q.kind !== 'skill')).filter((q) => !q.ok && q.gain > 0 && q.where);
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
    try { list = U.rate(sv, U.list(sv)).filter((q) => q.gain > 0 || q.kind === 'skill'); } catch (e) { list = []; }
    // Đường nào gần làm được mà tăng nhiều thì xếp trước; làm ngay được thì ưu tiên hẳn.
    // điểm kỹ năng chưa học luôn nhắc trước; việc cần mảnh của trùm chưa hạ (chưa cày được) xếp sau cùng
    const score = (q) => q.kind === 'skill' ? 1e9 + q.gain : (q.gain / (25 + q.val * 0.15 + q.missVal)) * (q.ok ? 4 : 1) * (q.miss && !q.where ? 0.05 : 1);
    list.sort((a, b) => score(b) - score(a));
    const tips = [], seen = {};
    for (const q of list) {
      const grp = { skill: 'skill', carry: 'carry', wear: 'wear', buy: 'new', craft: 'new' }[q.kind] || q.key;
      if (seen[grp]) continue;
      seen[grp] = true;
      let sub;
      if (q.kind === 'level') { const g = q.go.stage; sub = 'còn thiếu ' + q.need.xp + ' kinh nghiệm' + (g ? ' — chơi lại ' + stName(g[0], g[1]) : ''); }
      else if (q.kind === 'evolve') sub = 'còn thiếu ' + q.need.lk + ' linh khí ' + G.EL[q.need.el].name + ' — kết liễu quái đang dính ' + G.EL[q.need.el].name;
      else if (q.miss) sub = U.missText(sv, q.miss);
      else sub = q.kind === 'skill' ? 'học ngay ở Cụ Đồ' : q.kind === 'carry' ? 'đổi ngay ở Bà Hàng Xén' : q.kind === 'wear' ? 'mặc ngay ở Cô Thợ May' : 'đủ đồ rồi — tới ' + WHO_NAME[q.go.who] + ' làm ngay';
      tips.push({ text: q.title, sub, gain: Math.round(q.gain), ok: q.ok, go: q.go, kind: q.kind });
      if (tips.length >= (n || 3)) break;
    }
    return { power: G.power(), rec, tips };
  };
  const WHO_NAME = { ren: 'Ông Thợ Rèn', may: 'Cô Thợ May', xen: 'Bà Hàng Xén', do: 'Cụ Đồ', lai: 'Chú Lái Đò' };
  U.WHO_NAME = WHO_NAME;
})();
