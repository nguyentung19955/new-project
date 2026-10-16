// CÀY NÂNG CẤP (G.upg): liệt kê mọi đường nâng cấp em bé đang có thể đi, tính mỗi đường thêm bao nhiêu Sức mạnh (G.power),
// tốn gì, còn thiếu gì và nên chơi lại ải nào để kiếm cho đủ.
//   - Bảng thua (js/stage.js) dùng G.upgradeTips để gợi ý 2-3 việc nên cày, bấm vào thì đi thẳng tới người làng tương ứng.
//   - Bot kiểm tra cân bằng (tests/cay.py, tests/campaign.py) dùng G.upg.auto để nâng cấp như người chơi: làm việc rẻ mà hiệu quả trước.
// Sức mạnh chỉ đến từ cày: cấp hero, mài, nâng cấp vũ khí bằng linh khí, nâng lò, cây kỹ năng, cây chưởng (đợt 2: bỏ nâng bậc, trang phục cũ).
// Thua KHÔNG làm bé mạnh thêm (đã bỏ "Quyết tâm").
(function () {
  const G = window.G;
  const U = (G.upg = {});
  // Quy mọi thứ ra vàng để so "rẻ" hay "đắt".
  U.VAL = { gold: 1, ore: 12, stones: 120, mat: 20, shard: 150, xp: 0.35, lk: 4, nlr: 12 }; // nlr: nguyên liệu rèn (Luyện, js/luyen.js)
  U.costVal = function (c) {
    if (!c) return 0;
    let v = (c.gold || 0) * U.VAL.gold + (c.ore || 0) * U.VAL.ore + (c.stones || 0) * U.VAL.stones + (c.xp || 0) * U.VAL.xp + (c.lk || 0) * U.VAL.lk + (c.nlr || 0) * U.VAL.nlr;
    for (let i = 0; i < 4; i++) v += ((c.mat && c.mat[i]) || 0) * U.VAL.mat + ((c.shard && c.shard[i]) || 0) * U.VAL.shard;
    return v;
  };
  // Phần còn thiếu của giá c so với bản lưu sv (null nếu đủ).
  U.missing = function (sv, c) {
    if (!c) return null;
    const m = { gold: Math.max(0, (c.gold || 0) - sv.gold), ore: Math.max(0, (c.ore || 0) - sv.ore), stones: Math.max(0, (c.stones || 0) - sv.stones), mat: [0, 0, 0], shard: [0, 0, 0, 0] };
    // Luyện (js/luyen.js): giá có thêm nguyên liệu rèn (nlr) và linh khí (lk); mảnh trùm tới vùng 4
    m.nlr = Math.max(0, (c.nlr || 0) - (sv.nlr | 0));
    m.lk = Math.max(0, (c.lk || 0) - (G.vkMoi ? G.vkMoi.lk(sv) : sv.linhKhi || 0));
    let any = m.gold || m.ore || m.stones || m.nlr || m.lk;
    for (let i = 0; i < 4; i++) {
      m.mat[i] = i < 3 ? Math.max(0, ((c.mat && c.mat[i]) || 0) - sv.mats[i]) : 0;
      m.shard[i] = Math.max(0, ((c.shard && c.shard[i]) || 0) - (sv.shards[i] || 0));
      if (m.mat[i] || m.shard[i]) any = true;
    }
    m.mat.length = 3;
    return any ? m : null;
  };
  // ---------- đổi vàng lấy nguyên liệu vùng đã qua (phiên cân bằng, mục 3; số liệu G.DOI_NL ở data.js) ----------
  // Vùng r "đã qua" khi đã hạ trùm vùng đó. Mỗi lần đổi: G.DOI_NL.gia vàng → 1 nguyên liệu vùng r, tốn 1 lượt trong kho sv.doiNL.
  U.doiGia = () => (G.DOI_NL ? G.DOI_NL.gia : 150);
  U.daQua = (sv, r) => !!(sv && sv.stars && sv.stars[r + '-4']);
  // '' là đổi được; không thì lý do (chữ hiện lên nút)
  U.doiDuoc = function (sv, r) {
    if (!G.DOI_NL) return 'Chưa mở';
    if (!U.daQua(sv, r)) return G.t('Hạ {0} để mở', G.REGIONS[r].bossName);
    if (!((sv.doiNL | 0) > 0)) return 'Hết lượt đổi';
    if (sv.gold < U.doiGia()) return 'Thiếu vàng';
    return '';
  };
  U.doi = function (sv, r, n) {
    n = n || 1;
    let k = 0;
    for (; k < n && U.doiDuoc(sv, r) === ''; k++) { sv.gold -= U.doiGia(); sv.mats[r]++; sv.doiNL = (sv.doiNL | 0) - 1; }
    return k;
  };
  // ---------- Bà Hàng Xén bán quặng (14/10, bước 1 làm chắc mục 4; số liệu G.BAN_QUANG ở data.js) ----------
  const ngayNay = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  // Số quặng còn mua được hôm nay. Chuẩn hoá sv.banQuang (bản lưu cũ không có thì tạo; hỏng thì làm lại). Sang ngày mới (lớn hơn ngày lớn
  // nhất đã thấy) thì đặt lại; ngày lùi (chỉnh giờ máy) thì giữ nguyên số đã mua.
  U.bqCon = function (sv) {
    const D = G.BAN_QUANG;
    if (!D || !sv) return 0;
    let o = sv.banQuang;
    if (!o || typeof o !== 'object' || Array.isArray(o)) o = sv.banQuang = { cuoi: '', n: 0 };
    if (typeof o.cuoi !== 'string') o.cuoi = '';
    o.n = Math.max(0, Math.min(D.moiNgay, Math.floor(+o.n || 0)));
    const h = ngayNay();
    if (h > o.cuoi) { o.cuoi = h; o.n = 0; }
    return Math.max(0, D.moiNgay - o.n);
  };
  U.bqGia = () => (G.BAN_QUANG ? G.BAN_QUANG.gia : 40);
  // '' là mua được; không thì lý do (chữ hiện lên nút)
  U.bqDuoc = function (sv) {
    if (!G.BAN_QUANG || G.BAN_QUANG_BAT === false) return 'Chưa mở';
    if (U.bqCon(sv) <= 0) return 'Hết hàng hôm nay';
    if (sv.gold < U.bqGia()) return 'Thiếu vàng';
    return '';
  };
  U.bqMua = function (sv, n) {
    n = n || 1;
    let k = 0;
    for (; k < n && U.bqDuoc(sv) === ''; k++) { sv.gold -= U.bqGia(); if (G.luyen && G.luyen.bat()) sv.nlr = (sv.nlr | 0) + 1; else sv.ore = (sv.ore | 0) + 1; sv.banQuang.n++; } // Luyện: bán nguyên liệu rèn
    return k;
  };

  // Vùng đã qua đang ít nguyên liệu nhất (cho Thương nhân trong ải); null nếu chưa qua vùng nào.
  U.doiVung = function (sv) {
    let best = null;
    for (let r = 0; r < 3; r++) if (U.daQua(sv, r) && (best == null || sv.mats[r] < sv.mats[best])) best = r;
    return best;
  };
  // Phần thiếu m chỉ còn là nguyên liệu vùng đã qua mà đổi được ngay bằng vàng (đủ vàng, đủ lượt)? Trả về số món mỗi vùng, hoặc null.
  U.doiDu = function (sv, m, giaThem) {
    if (!m || !G.DOI_NL || m.ore || m.stones || m.gold || m.nlr || m.lk) return null;
    let n = 0;
    if (m.shard[3]) return null;
    for (let i = 0; i < 3; i++) { if (m.shard[i]) return null; if (m.mat[i]) { if (!U.daQua(sv, i)) return null; n += m.mat[i]; } }
    if (!n || n > (sv.doiNL | 0) || sv.gold < n * U.doiGia() + (giaThem || 0)) return null;
    return m.mat.slice();
  };

  // Tên ải để chơi lại: ải thường cao nhất đã qua (trong vùng r nếu có).
  const stName = (r, i) => (i === 4 ? G.t('trùm {0}', G.REGIONS[r].bossName) : G.tv(G.REGIONS[r].name) + ' ' + (i + 1));
  U.grindStage = function (sv, r) {
    let best = null;
    for (let rr = 0; rr < G.REGIONS.length; rr++) { // vùng 4: tính cả ải Sông sâu
      if (r != null && rr !== r) continue;
      for (let i = 0; i < 4; i++) if (sv.stars[rr + '-' + i]) best = [rr, i];
    }
    // ưu tiên ải thường (dễ thắng, nhanh); chưa qua ải thường nào của vùng thì mới chỉ ải trùm
    if (!best) for (let rr = 0; rr < G.REGIONS.length; rr++) if ((r == null || rr === r) && sv.stars[rr + '-4']) best = [rr, 4];
    return best;
  };
  // Ải nên chơi lại để kiếm phần thiếu m (mảnh trùm: đánh lại trùm; nguyên liệu: ải cao nhất đã qua của vùng đó; còn lại: ải cao nhất đã qua).
  U.where = function (sv, m) {
    if (m) {
      const nS = Math.min(m.shard.length, G.REGIONS.length);
      for (let i = 0; i < m.shard.length; i++) if (m.shard[i] && (i >= nS || !sv.stars[i + '-4'])) return null; // cần mảnh của trùm chưa hạ: chưa cày được
      for (let i = 0; i < nS; i++) if (m.shard[i]) return [i, 4];
      for (let i = 0; i < 3; i++) if (m.mat[i]) return U.grindStage(sv, i);
    }
    return U.grindStage(sv);
  };
  // Câu "còn thiếu ..." kèm chỗ nên cày.
  U.missText = function (sv, m) {
    const a = [];
    let where = null;
    for (let i = 0; i < Math.min(m.shard.length, G.REGIONS.length); i++) {
      if (m.shard[i]) { a.push(G.t('{0} mảnh {1}', m.shard[i], G.REGIONS[i].bossName)); where = where || G.t(sv.stars[i + '-4'] ? 'đánh lại trùm {0}' : 'hạ trùm {0}', G.REGIONS[i].bossName); }
    }
    for (let i = 0; i < 3; i++) {
      if (!m.mat[i]) continue;
      a.push(m.mat[i] + ' ' + G.tv(G.REGIONS[i].mat.toLowerCase()));
      const g = U.grindStage(sv, i);
      // vùng đã qua: còn cách đổi vàng ở Bà Hàng Xén (mục 3)
      const doi = U.daQua(sv, i) && (sv.doiNL | 0) > 0 ? ' ' + G.t('hoặc đổi vàng ở Bà Hàng Xén') : '';
      where = where || (g ? G.t('chơi lại {0}', stName(g[0], g[1])) + doi : G.t('vào vùng {0}', G.REGIONS[i].name));
    }
    if (m.gold) a.push(G.t('{0} vàng', m.gold));
    if (m.ore) a.push(G.t('{0} quặng', m.ore));
    if (m.nlr) a.push(G.t('{0} nguyên liệu rèn', m.nlr));
    if (m.lk) { a.push(G.t('{0} linh khí', m.lk)); where = where || G.t('hạ tinh anh, trùm'); }
    if (m.stones) { a.push(G.t('{0} đá tôi', m.stones)); where = where || G.t('đá tôi rơi từ rương, sao thứ ba lần đầu'); }
    if (!where && (m.gold || m.ore || m.nlr)) { const g = U.grindStage(sv); if (g) where = G.t('chơi lại {0}', stName(g[0], g[1])); }
    return G.t('thiếu {0}', a.join(', ')) + (where ? ' — ' + where : '');
  };

  // ---------- các đường nâng cấp ----------
  const wById = (sv, id) => sv.weapons.find((w) => w.id === id) || null;
  const wNameOf = (w) => G.wName(w).replace(/ \+\d+$/, '');
  const pts = (hs) => Math.floor(hs.lvl / 3) - (hs.sk.atk + hs.sk.def + hs.sk.elem);
  // Hệ chọn khi nâng vũ khí Trắng lên Mầm (chỉ dùng khi tính thử / bot tự nâng; người chơi tự chọn ở Ông Thợ Rèn).
  // Mặc định: hệ của vùng đầu như trước. Bot cân bằng (tests/bot_nang.js, đợt 5) thay hàm này để chọn hệ hợp vùng đang đánh.
  U.heMam = function (sv, w) { void sv; void w; return G.REGIONS[0].el || 'fire'; };
  // Danh sách thô: { kind, key, title, cost, apply(sv) (null nếu không làm ngay được), go: {who, ...}, need (thiếu kinh nghiệm, linh khí) }
  U.list = function (sv) {
    sv = sv || G.save;
    const out = [], hs = sv.heroes[sv.hero];
    // cây kỹ năng
    if (pts(hs) > 0) {
      for (const b of G.SKEYS) if (hs.sk[b] < 5) out.push({ kind: 'skill', key: 'skill', br: b, title: G.t('Còn {0} điểm kỹ năng chưa học (nhánh {1})', pts(hs), G.SKILLS[b].name), cost: {}, apply: (s) => { s.heroes[s.hero].sk[b]++; }, go: { who: 'do' } });
    }
    // cây chưởng (js/chuong.js): điểm chưởng chưa học
    if (G.chuong) {
      const cp = G.chuong.pts(hs, sv.hero);
      // Đợt 5 (bot đo cân bằng): cây đã học đủ mọi nút (cấp > tổng bậc của cây) thì điểm thừa không học được nữa — không gợi ý,
      // nếu không G.upg.auto cứ "học" mãi mà không làm việc nào khác (bot kẹt mài / nâng từ cấp ~29).
      const coHoc = cp.left > 0 && G.CHUONG.trees[hs.ch.cay] && G.CHUONG.trees[hs.ch.cay].nodes.some((nd) => !G.chuong.why(hs, nd.id, sv.hero));
      if (coHoc) out.push({ kind: 'chuong', key: 'chuong', title: G.t('Còn {0} điểm chưởng chưa học ({1})', cp.left, G.CHUONG.trees[hs.ch.cay].name), cost: {}, apply: (s) => { const h = s.heroes[s.hero]; G.chuong.autoLearn(h, s.hero); }, go: { who: 'do', tab: 'chuong' } });
    }
    // 16/10 Luyện (js/luyen.js): một đường duy nhất — Luyện từng vũ khí đang mang (thay mài, nâng hệ bằng linh khí, lò, ép đồ)
    const LY = G.luyen && G.luyen.bat();
    if (LY) for (const id of sv.carry) {
      const w = wById(sv, id), Lz = G.luyen;
      if (!w) continue;
      const lv = Lz.cap(w), cost = Lz.giaUpg(lv + 1);
      if (!cost || lv + 1 > Lz.tran(sv)) continue;
      const el = w.branch || U.heMam(sv, w);
      out.push({ kind: 'luyen', key: 'ly' + id, title: G.t('Luyện {0} lên {1}', wNameOf(w), lv + 1), cost, apply: (s) => { Lz.nang(s, wById(s, id), el, true); }, go: { who: 'ren', ftab: 'luyen', sel: id } });
    }
    // vũ khí đang mang: mài, nâng cấp bằng linh khí, nâng lò
    const cap = G.FORGE_CAP[sv.forge];
    let needForge = false;
    for (const id of LY ? [] : sv.carry) {
      const w = wById(sv, id);
      if (!w) continue;
      const nm = wNameOf(w);
      if (w.sharpen < Math.min(cap, G.MAX_SHARPEN)) {
        out.push({ kind: 'sharpen', key: 'sh' + id, title: G.t('Mài {0} lên +{1}', nm, w.sharpen + 1), cost: G.sharpenFull(w.sharpen), apply: (s) => { wById(s, id).sharpen++; }, go: { who: 'ren', ftab: 'sharpen', sel: id } });
      } else if (w.sharpen < G.MAX_SHARPEN) needForge = true;
      // cấp vũ khí nâng bằng linh khí ở Ông Thợ Rèn (thẻ Linh khí, js/vk_moi.js); không còn nâng bậc / lên Vàng
      const VM = G.vkMoi, st = G.wStage(w), c = VM ? VM.gia(st) : null;
      if (c != null) {
        const el = w.branch || U.heMam(sv, w), ten = G.t('Nâng {0} lên {1}', nm, G.STAGE_NAMES[st + 1]), go = { who: 'ren', ftab: 'vk', sel: id };
        if (VM.lk(sv) >= c) out.push({ kind: 'vklk', key: 'vl' + id, title: ten, cost: {}, apply: (s) => { VM.nang(s, wById(s, id), el); }, go });
        else out.push({ kind: 'evolve', key: 'ev' + id, title: ten, cost: {}, need: { lk: Math.ceil(c - VM.lk(sv)), el }, sim: (s) => { VM.nang(s, wById(s, id), el, true); }, apply: null, go });
      }
    }
    const up = G.FORGE_UP[sv.forge];
    if (up && needForge && !LY) {
      const main = sv.carry.map((id) => wById(sv, id)).filter(Boolean).sort((a, b) => b.sharpen - a.sharpen)[0];
      out.push({ kind: 'forge', key: 'forge', title: G.t('Nâng lò lên cấp {0} (mài tới +{1})', sv.forge + 1, G.FORGE_CAP[sv.forge + 1]), cost: up,
        apply: (s) => { s.forge++; }, sim: (s) => { s.forge++; if (main) wById(s, main.id).sharpen++; }, extra: main ? G.sharpenFull(main.sharpen) : null, go: { who: 'ren', ftab: 'up' } });
    }
    // cấp hero: không mua được, phải chơi
    if (hs.lvl < G.MAX_LEVEL) {
      const g = U.grindStage(sv);
      out.push({ kind: 'level', key: 'lvl', title: G.t('Lên cấp {0}', hs.lvl + 1), cost: {}, need: { xp: Math.max(1, Math.ceil(G.xpNeed(hs.lvl) - hs.xp)) },
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
    const c = { gold: (a.gold || 0) + (b.gold || 0), ore: (a.ore || 0) + (b.ore || 0), stones: (a.stones || 0) + (b.stones || 0), nlr: (a.nlr || 0) + (b.nlr || 0), lk: (a.lk || 0) + (b.lk || 0), mat: [0, 0, 0], shard: [0, 0, 0, 0] };
    for (let i = 0; i < 4; i++) { c.mat[i] = ((a.mat && a.mat[i]) || 0) + ((b.mat && b.mat[i]) || 0); c.shard[i] = ((a.shard && a.shard[i]) || 0) + ((b.shard && b.shard[i]) || 0); }
    return c;
  }
  function pay(sv, c) {
    sv.gold -= c.gold || 0; sv.ore -= c.ore || 0; sv.stones -= c.stones || 0;
    if (c.nlr) sv.nlr = (sv.nlr | 0) - c.nlr; // Luyện
    if (c.lk) sv.linhKhi = Math.round(((G.vkMoi ? G.vkMoi.lk(sv) : sv.linhKhi || 0) - c.lk) * 10) / 10;
    for (let i = 0; i < 3; i++) sv.mats[i] -= (c.mat && c.mat[i]) || 0;
    for (let i = 0; i < sv.shards.length; i++) sv.shards[i] -= (c.shard && c.shard[i]) || 0;
  }
  // Làm một đường nâng cấp trên bản lưu thật.
  U.doIt = function (sv, o) {
    if (!o.apply || U.missing(sv, o.cost)) return false;
    pay(sv, o.cost);
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
      if (!list.length) {
        // Không việc nào làm ngay được: thử đổi vàng lấy nguyên liệu vùng đã qua cho việc đáng nhất chỉ còn thiếu nguyên liệu (mục 3)
        const cv = all.filter((q) => q.apply && q.gain > 0 && q.miss && U.doiDu(sv, q.miss, q.cost.gold || 0)).sort((a, b) => b.gain / (5 + b.val) - a.gain / (5 + a.val))[0];
        if (!cv || o.noDoi) break;
        const need = U.doiDu(sv, cv.miss, cv.cost.gold || 0);
        for (let i = 0; i < 3; i++) if (need[i]) U.doi(sv, i, need[i]);
        done.push(G.t('Đổi vàng lấy nguyên liệu cho: {0}', cv.title));
        continue;
      }
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
    const list = U.rate(sv, U.list(sv).filter((q) => q.kind !== 'skill' && q.kind !== 'chuong')).filter((q) => !q.ok && q.gain > 0 && q.where);
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
    // tư vấn 16/10 (js/mo_dan.js): thẻ / người chưa tới mốc mở thì cũng không gợi ý
    const MD = G.moDan;
    if (MD) list = list.filter((q) => !(q.kind === 'skill' && !MD.co('kyNang')) && !(q.kind === 'chuong' && !MD.co('chuong'))
      && !(q.go && q.go.who && !MD.nguoi(q.go.who)) && !(q.go && q.go.ftab && !MD.ftab(q.go.ftab)));
    for (const q of list) {
      const grp = { skill: 'skill', chuong: 'chuong' }[q.kind] || q.key;
      if (seen[grp]) continue;
      seen[grp] = true;
      let sub;
      if (q.kind === 'level') { const g = q.go.stage; sub = G.t('còn thiếu {0} kinh nghiệm', q.need.xp) + (g ? ' — ' + G.t('chơi lại {0}', stName(g[0], g[1])) : ''); }
      else if (q.kind === 'evolve') sub = G.t('còn thiếu {0} linh khí — hạ tinh anh, trùm, kết liễu quái đang dính hệ', q.need.lk);
      else if (q.miss) sub = U.missText(sv, q.miss);
      else sub = q.kind === 'skill' ? 'học ngay ở Cụ Đồ' : q.kind === 'chuong' ? 'học ngay ở Cụ Đồ, thẻ Cây chưởng' : G.t('đủ đồ rồi — tới {0} làm ngay', WHO_NAME[q.go.who]);
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
  U.gainText = (v, short) => (v ? G.t(short ? '{0} SM' : '{0} Sức mạnh', v > 0 ? '+' + v : '−' + -v) : '');
  const WHO_NAME = { ren: 'Ông Thợ Rèn', may: 'Cô Thợ May', xen: 'Bà Hàng Xén', do: 'Cụ Đồ', lai: 'Chú Lái Đò' };
  U.WHO_NAME = WHO_NAME;
})();
