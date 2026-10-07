'use strict';

// ============================================================
//  CHƠI NHÓM "CÙNG GIỮ THÀNH" (v141)
//  2 người chơi cùng lúc: chung bản đồ, chung mạng thành, chung đợt quái.
//  - Mỗi người sở hữu một nửa số ô (chia theo dọc dòng sông, từng cặp 2 ô xen kẽ) và có ví vàng riêng.
//    Vàng do trận sinh ra (hạ quái, xong đợt, núi, sính lễ) CHIA ĐÔI; vàng từ thao tác (bán đồ, gọi sớm) về người làm.
//  - Đồng bộ LOCKSTEP bằng lệnh: chỉ gửi thao tác người chơi, mô phỏng chạy bước cố định (30 bước / giây)
//    giống hệt trên 2 máy (bộ sinh số có seed chung — SIM / srand trong data.js).
//    Người "điều phối" (authority, mặc định chủ phòng) xếp mọi lệnh vào số bước thực thi = bước hiện tại + độ trễ,
//    gửi theo lô (cmds) kèm "hứa" (upto): máy kia chỉ được chạy tới bước < upto.
//  - Kiểm tra lệch: định kỳ băm trạng thái; lệch thì điều phối gửi ảnh chụp trạng thái (snap) — cả hai nạp lại cùng một ảnh.
//  - Truyền tin: Firestore rooms/{mã} (+ cmds, reqs, snap). Lớp truyền tin thay được (kiểm thử: tests/coop/).
// ============================================================

const COOP_CFG = {
  tps: 30,          // bước mô phỏng mỗi giây (tốc độ x1)
  delay: 0.8,       // độ trễ thực thi lệnh (giây thật)
  hb: 0.6,          // nhịp gửi lô khi không có lệnh (giây thật)
  hashEvery: 60,    // băm trạng thái mỗi 60 bước
  pingEvery: 4,     // máy theo gửi tín hiệu còn sống
  dropAfter: 15,    // điều phối coi đồng đội mất kết nối sau 15 giây im lặng
  authLost: 8,      // máy theo coi điều phối mất sau 8 giây không có lô
  timeScale: 1,     // (kiểm thử) chạy nhanh hơn thời gian thật
  maxCatch: 240,    // số bước đuổi kịp tối đa mỗi khung hình
};
const COOP_DT = 1 / COOP_CFG.tps;
const COOP_PENDING = { pending: true };
const COOP_KEY = 'nuicao.coop';

// tham số lệnh: h = tướng (gửi số ô), s = ô, u = uid đồ, v = giá trị, * = áp cho cả đội của người ra lệnh
const COOP_CMDS = {
  summonOffer: [], rerollOffer: [], pickOffer: ['v'], summonRandom: [],
  placeHero: ['s', 'v'], merge: ['s', 's'], fuse: ['s', 's'], moveHero: ['s', 's'], sellHero: ['s'],
  levelUp: ['h'], trainHero: ['h'], unlockSkill: ['h', 'v'], upgradeSkill: ['h', 'v'], spendStat: ['h'],
  evolve: ['h'], ascend: ['h', 'v'], equip: ['h', 'u', 'v'], unequip: ['h', 'v'], autoEquip: ['h'],
  autoEquipAll: ['*'], autoUpgradeGear: ['*'], autoMerge: ['*'],
  enhance: ['u'], promote: ['u'], temper: ['u'], reroll: ['u'], toggleLock: ['u'], scrap: ['u'],
  scrapMany: ['v'], sortBag: [], buyChest: ['v'], rerollShop: [], buyShop: ['v'], quickCraft: ['v'], buy: ['v'], craft: ['v'],
  soilMountain: [], harvestHerbs: [], raiseSpot: ['s'], callEarly: [],
};
const COOP_SPECIAL = new Set(['start', 'speed', 'gift', 'reward', 'leave', 'back', 'resync']);

// trạng thái riêng của trận co-op (nằm trong game.co, lưu cùng ảnh chụp)
class CoopState {
  constructor() {
    this.pl = [];          // [{ gold, offer, deck, owned, summonN }] theo người 0 / 1
    this.own = [];         // own[ô] = 0 | 1
    this.alone = -1;       // ≥ 0: người này đang điều khiển cả hai nửa (đồng đội rời trận)
    this.odd = 0;          // ai nhận đồng lẻ khi chia vàng lần tới
    this.started = false;  // đã bấm bắt đầu đợt 1
    this.speed = 1;
    this.reward = null;    // sính lễ boss đang chờ chọn { id, options, taken }
    this.meta = null;      // { runes: [..], legacy: [..] } ấn phù / thần khí của từng người
    this.names = [];
    this.actor = 0;        // (cục bộ) người đang ra lệnh / người chơi máy này
    this.inCmd = false;    // (cục bộ) đang thực thi lệnh
  }
  canAct(p, slot) { return this.alone === p || this.own[slot] === p; }
  split(n) {
    if (this.alone >= 0) { this.pl[this.alone].gold += n; return; }
    const a = n - Math.floor(n / 2), b = n - a;
    this.pl[this.odd].gold += a;
    this.pl[1 - this.odd].gold += b;
    if (a !== b) this.odd = 1 - this.odd;
  }
}
const CO_KEYS = ['gold', 'offer', 'deck', 'owned', 'summonN'];
function coopBind(game) {
  for (const k of CO_KEYS) {
    Object.defineProperty(game, k, {
      configurable: true, enumerable: false,
      get() { const c = this.co; return c.pl[c.actor < 0 ? 0 : c.actor][k]; },
      set(v) { const c = this.co; c.pl[c.actor < 0 ? 0 : c.actor][k] = v; },
    });
  }
}
function coopUnbind(game) {
  if (!game.co) return;
  const vals = {};
  for (const k of CO_KEYS) vals[k] = game[k];
  for (const k of CO_KEYS) { delete game[k]; game[k] = vals[k]; }
  game.co = null;
}

// ---------- ảnh chụp trạng thái: đồ thị đối tượng (giữ tham chiếu chung / vòng), bỏ hàm, dữ liệu tĩnh ghi bằng tên
let COOP_STATIC = null;
function coopStatic() {
  if (COOP_STATIC) return COOP_STATIC;
  const toKey = new Map(), toObj = {};
  const tables = { E: typeof ENEMIES !== 'undefined' && ENEMIES, H: typeof HEROES !== 'undefined' && HEROES, I: typeof ITEMS !== 'undefined' && ITEMS,
    S: typeof SETS !== 'undefined' && SETS, L: typeof LEVELS !== 'undefined' && LEVELS, F: typeof FUSION !== 'undefined' && FUSION,
    R: typeof RARITY !== 'undefined' && RARITY, M: typeof MAPS !== 'undefined' && MAPS };
  for (const t in tables) {
    const T = tables[t];
    if (!T) continue;
    for (const k of Object.keys(T)) {
      if (!T[k] || typeof T[k] !== 'object') continue;
      const key = t + ':' + k;
      if (!toKey.has(T[k])) { toKey.set(T[k], key); toObj[key] = T[k]; }
      if (t === 'H' && Array.isArray(T[k].skills)) T[k].skills.forEach((sk, i) => { const kk = `HS:${k}:${i}`; toKey.set(sk, kk); toObj[kk] = sk; });
    }
  }
  COOP_STATIC = { toKey, toObj };
  return COOP_STATIC;
}
const COOP_SKIP = new Set(['notify', 'known', 'events', 'lv', 'auraBosses', 'co', 'running', 'started', 'speed', 'runId']);
function coopEncode(root) {
  const { toKey } = coopStatic();
  const nodes = [], ids = new Map();
  const enc = (v) => {
    if (v === null || v === undefined) return v === null ? null : undefined;
    const t = typeof v;
    if (t === 'number') return Number.isFinite(v) ? v : { $n: String(v) };
    if (t === 'string' || t === 'boolean') return v;
    if (t === 'function') return undefined;
    if (toKey.has(v)) return { $s: toKey.get(v) };
    if (ids.has(v)) return { $r: ids.get(v) };
    if (v instanceof Set) return { $S: [...v].map(enc) };
    if (v instanceof Map) return { $M: [...v].map(([a, b]) => [enc(a), enc(b)]) };
    const id = nodes.length;
    ids.set(v, id);
    nodes.push(null);
    let out;
    if (Array.isArray(v)) out = v.map((x) => { const e = enc(x); return e === undefined ? null : e; });
    else {
      out = {};
      for (const k of Object.keys(v)) {
        if (k[0] === '_') continue;          // trạng thái vẽ (h._anim, f._vfx…)
        const e = enc(v[k]);
        if (e !== undefined) out[k] = e;
      }
    }
    nodes[id] = out;
    return { $r: id };
  };
  const r = enc(root);
  return { r, nodes };
}
function coopDecode(pack) {
  const { toObj } = coopStatic();
  const objs = pack.nodes.map((n) => (Array.isArray(n) ? [] : {}));
  const dec = (v) => {
    if (v === null || typeof v !== 'object') return v;
    if (v.$r !== undefined) return objs[v.$r];
    if (v.$s !== undefined) return toObj[v.$s];
    if (v.$n !== undefined) return Number(v.$n);
    if (v.$S) return new Set(v.$S.map(dec));
    if (v.$M) return new Map(v.$M.map(([a, b]) => [dec(a), dec(b)]));
    return v;
  };
  pack.nodes.forEach((n, i) => {
    const o = objs[i];
    if (Array.isArray(n)) n.forEach((x, k) => { o[k] = dec(x); });
    else for (const k of Object.keys(n)) o[k] = dec(n[k]);
  });
  return dec(pack.r);
}

// ---------- băm trạng thái (FNV-1a) — máu quái, vàng, mạng, tướng, bộ sinh số
function coopHashStr(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
function coopStateLine(game, tick) {
  const c = game.co, f = (x, d = 3) => (Number.isFinite(x) ? x.toFixed(d) : String(x));
  const parts = [tick, SIM.seed, nextId, game.lives, game.wave, game.time.toFixed(4), c.pl.map((p) => f(p.gold, 2)).join('/'), c.alone];
  for (const e of game.enemies) parts.push(`e${e.id}:${e.type}:${f(e.hp)}:${f(e.dist, 2)}`);
  game.heroes.forEach((h, i) => { if (h) parts.push(`h${i}:${h.type}:${h.level}:${h.tier || 0}:${f(h.hp, 2)}:${f(h.mana, 1)}:${h.dead ? 1 : 0}`); });
  parts.push('inv' + game.inventory.map((it) => it.uid).join(','));
  return parts.join('|');
}

// ============================================================
//  LỚP TRUYỀN TIN FIRESTORE
// ============================================================
class CoopFireNet {
  constructor() {
    this.db = CLOUD.db; this.uid = CLOUD.user.uid;
    this.FV = firebase.firestore.FieldValue; this.TS = firebase.firestore.Timestamp;
  }
  ref(code) { return this.db.collection('rooms').doc(code); }
  exp(ms) { return this.TS.fromMillis(ms); }
  out(d) { if (!d) return null; const o = { ...d }; if (o.expiresAt && o.expiresAt.toMillis) o.exp = o.expiresAt.toMillis(); delete o.expiresAt; return o; }
  async createRoom(code, data) {
    const d = { ...data, expiresAt: this.exp(data.exp) }; delete d.exp;
    await this.ref(code).set(d);       // mã trùng phòng người khác → luật chặn (không phải thành viên)
  }
  async joinRoom(code, m) {
    await this.ref(code).update({ members: this.FV.arrayUnion(this.uid), ['names.' + this.uid]: m.name, ['meta.' + this.uid]: m.meta });
  }
  async leaveRoom(code, isHost) {
    if (isHost) await this.ref(code).delete();
    else await this.ref(code).update({ members: this.FV.arrayRemove(this.uid) });
  }
  async getRoom(code) { const s = await this.ref(code).get(); return s.exists ? this.out(s.data()) : null; }
  async updateRoom(code, patch) { await this.ref(code).update(patch); }
  watchRoom(code, cb) { return this.ref(code).onSnapshot((s) => cb(s.exists ? this.out(s.data()) : null), (e) => cb(null, e)); }
  async claimAuth(code, expect, epoch) {
    const ref = this.ref(code);
    return this.db.runTransaction(async (tx) => {
      const s = await tx.get(ref);
      if (!s.exists || s.data().auth !== expect) return false;
      tx.update(ref, { auth: this.uid, epoch, away: expect });
      return true;
    });
  }
  async putBatch(code, b) {
    await this.ref(code).collection('cmds').doc(String(b.seq).padStart(9, '0'))
      .set({ seq: b.seq, by: this.uid, d: JSON.stringify(b), expiresAt: this.exp(Date.now() + 12 * 3600e3) });
  }
  async maxSeq(code) {
    const q = await this.ref(code).collection('cmds').orderBy('seq', 'desc').limit(1).get();
    return q.empty ? 0 : q.docs[0].data().seq;
  }
  watchBatches(code, after, cb) {
    return this.ref(code).collection('cmds').where('seq', '>', after).orderBy('seq').onSnapshot((s) => {
      cb(s.docChanges().filter((ch) => ch.type === 'added').map((ch) => JSON.parse(ch.doc.data().d)));
    }, (e) => console.warn('coop cmds', e));
  }
  async putReq(code, o) {
    await this.ref(code).collection('reqs').add({ by: this.uid, d: JSON.stringify(o), expiresAt: this.exp(Date.now() + 12 * 3600e3) });
  }
  watchReqs(code, cb) {
    let first = true;
    return this.ref(code).collection('reqs').onSnapshot((s) => {
      const ch = s.docChanges();
      if (first) { first = false; return; }      // bỏ yêu cầu cũ
      for (const c of ch) if (c.type === 'added' && c.doc.data().by !== this.uid) cb(JSON.parse(c.doc.data().d), c.doc.data().by);
    }, (e) => console.warn('coop reqs', e));
  }
  async putSnap(code, o) {
    await this.ref(code).collection('snap').doc('last').set({ by: this.uid, tick: o.tick, d: o.d, expiresAt: this.exp(Date.now() + 12 * 3600e3) });
  }
  watchSnap(code, cb) {
    return this.ref(code).collection('snap').doc('last').onSnapshot((s) => { if (s.exists) cb({ tick: s.data().tick, d: s.data().d }); }, (e) => console.warn('coop snap', e));
  }
}

// ============================================================
//  BỘ ĐIỀU KHIỂN CO-OP
// ============================================================
const COOP = {
  on: false,            // đang trong trận co-op
  net: null, netFactory: null,
  game: null, ui: null,
  code: '', room: null, unsub: [],
  role: '', me: 0, uid: '', partnerUid: '',
  tick: 0, acc: 0, bound: 0, floor: 0, seq: 0, lastSeq: 0, epoch: 0,
  pending: new Map(), cbs: new Map(), cid: 0, outbox: [], done: [], buf: new Map(),
  hashes: new Map(), authHashes: new Map(), lastHash: null, sentHashTick: -1, resyncAt: 0,
  partnerLive: true, waitSnap: false, snap: null, stats: { ok: 0, bad: 0, resync: 0 },
  t: { flush: 0, req: 0, batch: 0, ping: 0, desync: 0, join: 0 },

  now() { return performance.now() / 1000; },
  available() { return !!(this.netFactory || (typeof CLOUD !== 'undefined' && CLOUD.ready && CLOUD.user && CLOUD.db)); },
  getNet() {
    if (this.net) return this.net;
    if (this.netFactory) this.net = this.netFactory();
    else if (this.available()) this.net = new CoopFireNet();
    return this.net;
  },
  isAuth() { return this.role === 'auth'; },
  delayTicks() {
    const c = this.game && this.game.co;
    if (c && c.alone >= 0) return 1;
    return Math.max(2, Math.ceil(COOP_CFG.delay * COOP_CFG.tps * ((c && c.speed) || 1) * COOP_CFG.timeScale));
  },

  // ---------- PHÒNG CHỜ
  newCode() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)];
    return s;
  },
  async createRoom(member) {
    const net = this.getNet();
    if (!net) throw new Error('Cần đăng nhập để chơi nhóm');
    for (let k = 0; k < 5; k++) {
      const code = this.newCode();
      const data = { host: net.uid, members: [net.uid], names: { [net.uid]: member.name }, meta: { [net.uid]: member.meta },
        level: 0, state: 'lobby', auth: net.uid, epoch: 0, away: null, exp: Date.now() + 12 * 3600e3 };
      try { await net.createRoom(code, data); this.remember(code); return code; } catch (e) { /* mã trùng: thử mã khác */ }
    }
    throw new Error('Không tạo được phòng, thử lại');
  },
  async joinRoom(code, member) {
    const net = this.getNet();
    if (!net) throw new Error('Cần đăng nhập để chơi nhóm');
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 6) throw new Error('Mã phòng gồm 6 ký tự');
    let r = null;
    try { r = await net.getRoom(code); } catch (e) { /* chưa là thành viên: chưa đọc được */ }
    if (r && r.members.includes(net.uid)) { this.remember(code); return code; }
    try { await net.joinRoom(code, member); } catch (e) { throw new Error('Không vào được: sai mã, phòng đủ người hoặc đã bắt đầu'); }
    this.remember(code);
    return code;
  },
  async leaveRoom(code, isHost) { const net = this.getNet(); this.forget(); if (net && code) await net.leaveRoom(code, isHost).catch(() => {}); },
  watchLobby(code, cb) { const net = this.getNet(); return net.watchRoom(code, cb); },
  remember(code) { try { localStorage.setItem(COOP_KEY, JSON.stringify({ code, at: Date.now() })); } catch (e) { /* bỏ qua */ } },
  forget() { try { localStorage.removeItem(COOP_KEY); } catch (e) { /* bỏ qua */ } },
  saved() {
    try { const o = JSON.parse(localStorage.getItem(COOP_KEY) || 'null'); return o && Date.now() - o.at < 12 * 3600e3 ? o.code : null; } catch (e) { return null; }
  },
  // chủ phòng: chia ô theo dọc dòng sông (từng cặp 2 ô, xen kẽ) — tính 1 lần rồi gửi cho cả hai máy
  owners(level) {
    setMap(LEVELS[level].map || 'song1');
    const idx = CONFIG.slots.map((_, i) => i)
      .sort((a, b) => PATH.distOf(CONFIG.slots[a][0], CONFIG.slots[a][1]) - PATH.distOf(CONFIG.slots[b][0], CONFIG.slots[b][1]) || a - b);
    const own = [];
    idx.forEach((s, k) => { own[s] = Math.floor(k / 2) % 2; });
    return own;
  },
  async startRoom(code, level) {
    const net = this.getNet();
    await net.updateRoom(code, { state: 'play', level, seed: (Math.random() * 4294967296) >>> 0, own: this.owners(level) });
  },

  // ---------- VÀO TRẬN (cả hai máy, từ cùng dữ liệu phòng)
  begin(game, ui, room) {
    const net = this.getNet();
    this.stop();
    this.game = game; this.ui = ui; this.room = room; this.code = room.code;
    this.uid = net.uid;
    this.me = room.members.indexOf(net.uid);
    this.partnerUid = room.members[1 - this.me];
    this.role = room.auth === net.uid ? 'auth' : 'follow';
    this.epoch = room.epoch || 0;
    const players = room.members.map((u) => (room.meta && room.meta[u]) || {});
    SIM.coop = true; SIM.seed = room.seed | 0; SIM.tmpId = 0;
    nextId = 1;
    coopUnbind(game);
    SIM.active = true;
    try {
      game.hard = false;
      game.reset(room.level);
      game.endless = false;
      const co = new CoopState();
      co.own = room.own.slice();
      co.names = room.members.map((u) => (room.names && room.names[u]) || 'Người chơi');
      co.meta = { runes: players.map((p) => p.runes || {}), legacy: players.map((p) => p.legacy || {}) };
      co.pl = players.map((p) => ({ gold: CONFIG.startGold, offer: null,
        deck: validDeck(p.deck) ? [...p.deck] : suggestDeck(room.level, p.owned || []), owned: new Set(p.owned || []), summonN: 0 }));
      game.co = co;
      coopBind(game);
    } finally { SIM.active = false; }
    this.afterState();
    game.started = true; game.running = false; game.speed = 1; game.runId = Date.now();
    this.on = true;
    this.tick = 0; this.acc = 0; this.bound = 0; this.floor = 0; this.seq = 0; this.lastSeq = 0;
    this.pending.clear(); this.cbs.clear(); this.outbox = []; this.done = []; this.buf.clear();
    this.hashes.clear(); this.authHashes.clear(); this.lastHash = null; this.sentHashTick = -1; this.resyncAt = 0;
    this.partnerLive = true; this.waitSnap = false; this.snap = null; this.stats = { ok: 0, bad: 0, resync: 0 };
    const now = this.now();
    for (const k in this.t) this.t[k] = now;
    this.listen();
    if (this.isAuth()) this.flush();
  },
  // vào lại phòng đang chơi (tải lại trang / bị coi là mất kết nối): chờ ảnh chụp từ điều phối
  async rejoin(game, ui, code) {
    const net = this.getNet();
    const room = await net.getRoom(code);
    if (!room || room.state !== 'play' || !room.members.includes(net.uid)) throw new Error('Phòng đã kết thúc hoặc không còn');
    this.stop();
    this.game = game; this.ui = ui; this.room = room; this.code = code;
    this.uid = net.uid; this.me = room.members.indexOf(net.uid); this.partnerUid = room.members[1 - this.me];
    this.epoch = room.epoch || 0;
    this.becomeFollowerWaiting(await net.maxSeq(code));
  },
  becomeFollowerWaiting(fromSeq) {
    this.stopListeners();
    this.on = true; this.role = 'follow';
    SIM.coop = true;
    this.tick = 0; this.acc = 0; this.bound = 0; this.lastSeq = fromSeq; this.seq = fromSeq;
    this.pending.clear(); this.outbox = []; this.done = []; this.buf.clear();
    this.hashes.clear(); this.authHashes.clear();
    this.waitSnap = true; this.snap = null;
    const now = this.now();
    for (const k in this.t) this.t[k] = now;
    this.t.join = now - 99;
    this.listen();
  },
  listen() {
    const net = this.net, code = this.code;
    this.unsub.push(net.watchRoom(code, (r) => this.onRoom(r)));
    this.unsub.push(net.watchSnap(code, (s) => this.onSnap(s)));
    if (this.isAuth()) this.unsub.push(net.watchReqs(code, (o, by) => this.onReq(o, by)));
    else this.unsub.push(net.watchBatches(code, this.lastSeq, (list) => this.onBatches(list)));
  },
  stopListeners() { for (const u of this.unsub) try { u(); } catch (e) { /* bỏ qua */ } this.unsub = []; },
  stop() {
    this.stopListeners();
    this.on = false; this.role = '';
    this.waitSnap = false;
  },
  // hết trận / thoát: trả game về chế độ chơi đơn
  end(quit) {
    if (!this.on && !(this.game && this.game.co)) return;
    const net = this.net, code = this.code, wasAuth = this.isAuth(), partner = this.partnerUid;
    if (net && code) {
      if (quit && wasAuth) net.updateRoom(code, { auth: partner, epoch: this.epoch + 1, away: this.uid }).catch(() => {});
      else if (quit) net.putReq(code, { t: 'bye', ep: this.epoch }).catch(() => {});
      else if (wasAuth) { if (this.partnerLive) this.flush(); net.updateRoom(code, { state: 'end' }).catch(() => {}); }
    }
    this.stop();
    this.forget();
    SIM.coop = false; SIM.active = false; SIM.runes = null; SIM.legacy = null; SIM.owner = null;
    if (this.game) coopUnbind(this.game);
  },
  afterState() {
    const g = this.game, co = g.co;
    co.actor = this.me; co.inCmd = false;
    SIM.owner = (h) => { const c = g.co; return c && h && c.own[h.slot] ? 1 : 0; };
    SIM.runes = co.meta.runes.map((m) => buildRuneMap(m));
    SIM.legacy = co.meta.legacy.slice();
    g.speed = co.speed;
    g.running = co.started && !g.over && !g.won;
  },

  // ---------- ẢNH CHỤP (đồng bộ lại / vào lại phòng)
  serialize() {
    const g = this.game, fields = {};
    for (const k of Object.keys(g)) if (!COOP_SKIP.has(k)) fields[k] = g[k];
    const co = {};
    for (const k of Object.keys(g.co)) if (k !== 'actor' && k !== 'inCmd') co[k] = g.co[k];
    return JSON.stringify({ v: 2, tick: this.tick, seed: SIM.seed, nextId, level: g.level, pack: coopEncode({ fields, co }) });
  },
  restoreFrom(str) {
    const o = JSON.parse(str), g = this.game;
    const W = coopDecode(o.pack);
    SIM.active = true;
    try {
      setMap(LEVELS[o.level].map || 'song1');
      if (!g.co) { g.co = new CoopState(); coopBind(g); }
      for (const k of Object.keys(g)) if (!COOP_SKIP.has(k)) delete g[k];
      Object.assign(g, W.fields);
      g.lv = LEVELS[g.level];
      g.events = [];
      g.auraBosses = [];
      const co = new CoopState();
      Object.assign(co, W.co);
      g.co = co;
      nextId = o.nextId; SIM.seed = o.seed;
    } finally { SIM.active = false; }
    this.afterState();
    g.started = true;
  },

  // ---------- LỆNH
  // gọi từ giao diện: kiểm tra quyền rồi gửi; kết quả trả qua then(r) khi lệnh thực thi (sau độ trễ)
  issue(name, args = [], then) {
    const g = this.game;
    const spec = COOP_CMDS[name];
    if (!spec && !COOP_SPECIAL.has(name)) throw new Error('Lệnh co-op lạ: ' + name);
    const a = spec ? args.map((v, i) => (spec[i] === 'h' ? (v ? v.slot : -1) : v)) : args;
    if (spec) {
      const err = this.checkArgs(this.me, spec, a);
      if (err) { if (then) then(err); return err; }
    }
    if (this.waitSnap) { if (then) then('Đang đồng bộ, đợi chút'); return 'Đang đồng bộ, đợi chút'; }
    const c = { p: this.me, n: name, a: JSON.parse(JSON.stringify(a)), cid: ++this.cid };
    if (then) this.cbs.set(c.cid, then);
    if (this.isAuth()) this.schedule(c);
    else this.req({ t: 'cmd', c }).catch(() => this.ui && this.ui.toast('Mất mạng: lệnh chưa gửi được', '#E25A3A'));
    return COOP_PENDING;
  },
  checkArgs(p, spec, a) {
    const g = this.game, co = g.co;
    for (let i = 0; i < spec.length; i++) {
      const k = spec[i], v = a[i];
      if (k === 's' || k === 'h') {
        if (!Number.isInteger(v) || v < 0 || v >= CONFIG.slots.length) return 'Ô không hợp lệ';
        if (!co.canAct(p, v)) return 'Đây là ô của đồng đội';
        if (k === 'h' && !g.heroes[v]) return 'Không còn tướng ở ô này';
      } else if (k === 'u') {
        const f = g.findItem(v);
        if (f && f.hero && !co.canAct(p, f.hero.slot)) return 'Món này đang ở tướng của đồng đội';
      }
    }
    return null;
  },
  // điều phối: xếp lệnh vào bước thực thi
  schedule(c) {
    c.k = Math.max(this.tick + this.delayTicks(), c.n === 'resync' ? this.floor + 1 : this.floor);
    this.floor = c.k;
    this.addPending(c);
    if (this.partnerLive) this.outbox.push(c);
  },
  addPending(c) {
    let l = this.pending.get(c.k);
    if (!l) this.pending.set(c.k, (l = []));
    l.push(c);
  },
  exec(c) {
    const g = this.game, co = g.co;
    co.actor = c.p; co.inCmd = true;
    let r;
    try { r = this.run(c); } catch (e) { console.error('coop exec', c, e); r = 'Lỗi lệnh'; }
    co.actor = this.me; co.inCmd = false;
    this.done.push([c, r]);
  },
  run(c) {
    const g = this.game, co = g.co;
    switch (c.n) {
      case 'start': if (!co.started) { co.started = true; g.startWave(); } return true;
      case 'speed': co.speed = [1, 2, 3].includes(c.a[0]) ? c.a[0] : 1; return true;
      case 'gift': {
        const v = Math.floor(c.a[0]);
        if (!(v > 0)) return 'Số vàng không hợp lệ';
        if (co.alone >= 0) return 'Đồng đội đã rời trận';
        if (co.pl[c.p].gold < v) return `Cần ${v} vàng`;
        co.pl[c.p].gold -= v; co.pl[1 - c.p].gold += v;
        return true;
      }
      case 'reward': {
        const R = co.reward;
        if (!R || R.id !== c.a[1]) return 'Sính lễ đã hết hạn';
        if (R.taken >= 0) return 'Đồng đội đã chọn sính lễ';
        const o = R.options[c.a[0]];
        if (!o) return 'Không có lựa chọn này';
        R.taken = c.p;
        co.inCmd = false;          // vàng sính lễ chia đôi
        g.claimReward(o);
        return true;
      }
      case 'leave': {
        const w = c.a[0], k = 1 - w;
        if (co.alone >= 0) return true;
        co.alone = k;
        co.pl[k].gold += co.pl[w].gold; co.pl[w].gold = 0;
        return true;
      }
      case 'back': {
        if (co.alone < 0) return true;
        const k = co.alone, w = 1 - k, half = Math.floor(co.pl[k].gold / 2);
        co.alone = -1;
        co.pl[k].gold -= half; co.pl[w].gold += half;
        return true;
      }
    }
    const spec = COOP_CMDS[c.n];
    if (!spec) return 'Lệnh lạ';
    const err = this.checkArgs(c.p, spec, c.a);
    if (err) return err;
    if (spec[0] === '*') return this.masked(c.p, () => g[c.n]());
    const args = spec.map((k, i) => (k === 'h' ? g.heroes[c.a[i]] : c.a[i]));
    return g[c.n](...args);
  },
  // lệnh "cả đội": chỉ nhìn thấy tướng trên ô của người ra lệnh
  masked(p, fn) {
    const g = this.game, co = g.co;
    if (co.alone === p) return fn();
    const full = g.heroes, view = full.map((h, i) => (co.own[i] === p ? h : null));
    g.heroes = view;
    try { return fn(); } finally {
      for (let i = 0; i < full.length; i++) if (co.own[i] === p) full[i] = view[i];
      g.heroes = full;
    }
  },

  // ---------- VÒNG LẶP (gọi mỗi khung hình từ main.js thay cho game.update)
  frame(realDt) {
    if (!this.on) return;
    const now = this.now();
    this.netTick(now);
    if (this.waitSnap) { this.tryJoin(); if (this.waitSnap) return; }
    const g = this.game, co = g.co;
    const rate = COOP_CFG.tps * (co.speed || 1) * COOP_CFG.timeScale;
    this.acc = Math.min(this.acc + Math.max(0, realDt) * rate, rate * 0.5 + 1);
    let n = Math.floor(this.acc);
    if (!this.isAuth()) {
      const behind = this.bound - this.tick, D = this.delayTicks();
      if (behind > 2 * D) n = Math.max(n, Math.min(behind - D, COOP_CFG.maxCatch));
    }
    let ran = 0;
    while (ran < n && this.canStep()) { if (!this.step()) break; ran++; }
    this.acc = ran < n ? Math.min(this.acc - ran, 1) : this.acc - ran;
    this.flushDone();
    g.running = co.started && !g.over && !g.won;
    g.speed = co.speed;
  },
  canStep() {
    const g = this.game;
    if (g.over || (g.won && !g.endless)) return false;
    return this.isAuth() || this.tick < this.bound;
  },
  step() {
    const g = this.game;
    const list = this.pending.get(this.tick);
    if (list && list.length && list[0].n === 'resync' && !list[0].done) {
      if (!this.doResync(list[0])) return false;
      list[0].done = true;
    }
    SIM.active = true;
    try {
      if (list) { for (const c of list) if (c.n !== 'resync') this.exec(c); this.pending.delete(this.tick); }
      if (g.co.started) g.update(COOP_DT); else g.updateIdle(COOP_DT);
    } finally { SIM.active = false; }
    this.tick++;
    if (this.tick % COOP_CFG.hashEvery === 0) this.recordHash();
    return true;
  },
  hash() { return coopHashStr(coopStateLine(this.game, this.tick)); },
  recordHash() {
    const h = this.hash();
    this.hashes.set(this.tick, h);
    if (this.hashes.size > 80) this.hashes.delete(this.hashes.keys().next().value);
    if (this.isAuth()) this.lastHash = [this.tick, h];
    else this.compare(this.tick);
  },
  compare(tick) {
    const a = this.authHashes.get(tick), b = this.hashes.get(tick);
    if (!a || !b) return;
    this.authHashes.delete(tick);
    if (a === b) { this.stats.ok++; return; }
    if (tick <= this.resyncAt) return;
    this.stats.bad++;
    this.requestResync('lệch ở bước ' + tick);
  },
  requestResync(why) {
    const now = this.now();
    if (now - this.t.desync < 3) return;
    this.t.desync = now;
    console.warn('coop desync:', why);
    if (this.ui) this.ui.coopNote('Lệch dữ liệu — đang đồng bộ lại…');
    this.req({ t: 'desync', tick: this.tick }).catch(() => {});
  },
  doResync(c) {
    if (this.isAuth()) {
      const d = this.serialize();
      this.restoreFrom(d);       // điều phối cũng nạp lại chính ảnh này để hai máy giống hệt nhau
      this.net.putSnap(this.code, { tick: this.tick, d }).catch((e) => console.warn('coop snap', e));
    } else {
      if (!this.snap || this.snap.tick !== this.tick) return false;
      this.restoreFrom(this.snap.d);
    }
    this.resyncAt = this.tick;
    this.stats.resync++;
    this.authHashes.clear();
    return true;
  },
  // người vào lại: ảnh chụp đúng bước của lệnh resync đang chờ thì nạp và vào trận
  tryJoin() {
    const s = this.snap;
    if (!s) return;
    const list = this.pending.get(s.tick);
    if (!list || !list.length || list[0].n !== 'resync') return;
    this.restoreFrom(s.d);
    this.tick = s.tick;
    list[0].done = true;
    for (const k of [...this.pending.keys()]) if (k < s.tick) this.pending.delete(k);
    this.resyncAt = s.tick;
    this.waitSnap = false;
    this.stats.resync++;
    if (this.ui) this.ui.coopEnter(true);
  },
  flushDone() {
    const list = this.done;
    if (!list.length) return;
    this.done = [];
    for (const [c, r] of list) {
      const mine = c.p === this.me && this.cbs.has(c.cid);
      if (mine) { const f = this.cbs.get(c.cid); this.cbs.delete(c.cid); try { f(r); } catch (e) { console.error(e); } }
      if (this.ui) this.ui.coopExec(c, r, c.p === this.me);
    }
  },

  // ---------- MẠNG
  // yêu cầu gửi người điều phối, kèm "nhiệm kỳ" (epoch): yêu cầu cũ từ trước khi đổi người điều phối bị bỏ qua
  req(o) { return this.net.putReq(this.code, { ...o, ep: this.epoch }); },
  netTick(now) {
    if (this.isAuth()) {
      if (this.partnerLive && (this.outbox.length || now - this.t.flush > COOP_CFG.hb)) this.flush();
      if (this.partnerLive && now - this.t.req > COOP_CFG.dropAfter) this.partnerGone('Đồng đội mất kết nối');
    } else {
      if (now - this.t.ping > COOP_CFG.pingEvery) { this.t.ping = now; this.req({ t: 'ping', tick: this.tick }).catch(() => {}); }
      if (this.waitSnap && now - this.t.join > 3) { this.t.join = now; this.req({ t: 'join' }).catch(() => {}); }
      if (now - this.t.batch > COOP_CFG.authLost && !this.claiming) this.claim();
    }
  },
  flush() {
    const now = this.now();
    this.t.flush = now;
    const P = Math.max(this.floor, this.tick + this.delayTicks());
    this.floor = P;
    const b = { seq: this.seq + 1, upto: P, cmds: this.outbox, ep: this.epoch };
    if (this.lastHash && this.lastHash[0] > this.sentHashTick) { b.hash = this.lastHash; this.sentHashTick = this.lastHash[0]; }
    this.outbox = [];
    this.seq = b.seq;
    this.net.putBatch(this.code, b).catch((e) => this.batchFailed(e));
  },
  async batchFailed(e) {
    console.warn('coop batch', e);
    try {
      const r = await this.net.getRoom(this.code);
      if (r && (r.epoch || 0) > this.epoch) this.epoch = r.epoch;
      if (r && r.auth === this.uid) { this.seq = Math.max(this.seq, await this.net.maxSeq(this.code)); return; }
    } catch (x) { /* mạng lỗi: thử lại ở lô sau */ return; }
    this.demote();
  },
  onReq(o, by) {
    if (!this.on || !this.isAuth() || by !== this.partnerUid || (o.ep || 0) < this.epoch) return;
    const now = this.now();
    this.t.req = now;
    const p = 1 - this.me;
    if (o.t === 'join') {
      if (now - this.t.join < 2) return;
      this.t.join = now;
      this.partnerLive = true;
      this.schedule({ p: this.me, n: 'resync', a: [], cid: 0 });
      this.schedule({ p: this.me, n: 'back', a: [p], cid: 0 });
      this.net.updateRoom(this.code, { away: null }).catch(() => {});
      if (this.ui) this.ui.coopNote(`${this.game.co.names[p]} đã vào lại trận`);
      return;
    }
    if (!this.partnerLive) return;              // đang coi là đã rời: chờ "join"
    if (o.t === 'cmd' && o.c && (COOP_CMDS[o.c.n] || ['speed', 'gift', 'reward', 'start'].includes(o.c.n))) {
      this.schedule({ p, n: o.c.n, a: o.c.a, cid: o.c.cid });
    } else if (o.t === 'desync') {
      if ([...this.pending.values()].some((l) => l.some((c) => c.n === 'resync' && !c.done))) return;   // đã hẹn đồng bộ
      this.schedule({ p: this.me, n: 'resync', a: [], cid: 0 });
    } else if (o.t === 'bye') this.partnerGone('Đồng đội đã rời trận');
  },
  partnerGone(msg) {
    if (!this.partnerLive) return;
    this.partnerLive = false;
    this.outbox = [];
    this.schedule({ p: this.me, n: 'leave', a: [1 - this.me], cid: 0 });
    this.net.updateRoom(this.code, { away: this.partnerUid }).catch(() => {});
    if (this.ui) this.ui.coopNote(`${msg} — bạn điều khiển cả hai nửa`);
  },
  onBatches(list) {
    if (!this.on || this.isAuth()) return;
    for (const b of list) this.buf.set(b.seq, b);
    while (this.buf.has(this.lastSeq + 1)) {
      const b = this.buf.get(this.lastSeq + 1);
      this.buf.delete(b.seq);
      this.lastSeq = b.seq;
      this.t.batch = this.now();
      if (b.ep > this.epoch) this.epoch = b.ep;
      let late = false;
      for (const c of b.cmds) { if (!this.waitSnap && c.k < this.tick) late = true; this.addPending(c); }
      this.bound = Math.max(this.bound, b.upto);
      if (b.hash) { this.authHashes.set(b.hash[0], b.hash[1]); if (!this.waitSnap) this.compare(b.hash[0]); }
      if (late) this.requestResync('lệnh tới muộn');
    }
    for (const k of [...this.buf.keys()]) if (k <= this.lastSeq) this.buf.delete(k);
  },
  onSnap(s) {
    if (!s || !this.on) return;
    if (!this.snap || s.tick >= this.snap.tick) this.snap = s;
  },
  onRoom(r) {
    if (!this.on || !r) return;
    this.room = { ...r, code: this.code };
    if ((r.epoch || 0) > this.epoch) this.epoch = r.epoch;
    if (this.isAuth() && r.auth && r.auth !== this.uid) return this.demote();
    if (!this.isAuth() && r.auth === this.uid && !this.waitSnap) return this.promote(false);
    if (!this.isAuth() && r.away === this.uid && !this.waitSnap) {
      if (this.ui) this.ui.coopNote('Mất kết nối quá lâu — đang vào lại trận…');
      this.net.maxSeq(this.code).then((s) => this.becomeFollowerWaiting(s)).catch(() => {});
    }
  },
  // máy theo không nhận được lô quá lâu: giành quyền điều phối (Firestore transaction)
  async claim() {
    if (this.waitSnap) return;
    this.claiming = true;
    try {
      const ok = await this.net.claimAuth(this.code, this.partnerUid, this.epoch + 1);
      if (ok) { this.epoch++; this.promote(true); }
      else this.t.batch = this.now();
    } catch (e) { this.t.batch = this.now(); } finally { this.claiming = false; }
  },
  promote(lost) {
    this.stopListeners();
    this.role = 'auth';
    this.seq = this.lastSeq;
    this.floor = Math.max(this.bound, this.tick + 1);
    this.partnerLive = true;
    this.t.req = this.now();
    this.listen();
    this.partnerGone(lost ? 'Chủ phòng mất kết nối' : 'Đồng đội đã rời trận');
  },
  demote() {
    if (!this.isAuth()) return;
    if (this.ui) this.ui.coopNote('Mất quyền điều phối — đang đồng bộ lại…');
    this.net.maxSeq(this.code).then((s) => this.becomeFollowerWaiting(s)).catch(() => this.becomeFollowerWaiting(this.seq));
  },
};
