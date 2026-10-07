'use strict';
// Bộ khung kiểm thử chơi nhóm: mở game (file://) trong Chromium của Playwright, chặn Firebase,
// thay Firestore bằng một "máy chủ" trung gian chạy trong Node (RelayServer) để 2 trang nói chuyện với nhau.
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node-tools/node_modules/playwright'); }

const ROOT = path.resolve(__dirname, '..', '..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch() {
  const opts = { args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] };
  if (process.env.CHROMIUM) opts.executablePath = process.env.CHROMIUM;
  try { return await playwright.chromium.launch(opts); } catch (e) {
    opts.executablePath = '/opt/pw-browsers/chromium';
    return playwright.chromium.launch(opts);
  }
}

// ---------- máy chủ trung gian (thay Firestore) — cùng ngữ nghĩa với CoopFireNet trong js/coop.js
class RelayServer {
  constructor() { this.rooms = {}; this.subs = new Map(); this.offline = new Set(); this.latency = 15; this.pages = new Map(); this.n = 0; }
  // mất mạng / có mạng lại (như Firestore: có mạng lại thì các bộ nghe nhận trạng thái mới nhất)
  setOffline(uid) { this.offline.add(uid); }
  setOnline(uid) {
    this.offline.delete(uid);
    for (const sub of this.subs.values()) {
      if (sub.uid !== uid) continue;
      const r = this.rooms[sub.code];
      if (sub.kind === 'room') this.push(sub, r ? r.data : null);
      if (sub.kind === 'snap' && r && r.snap) this.push(sub, r.snap);
      if (sub.kind === 'cmds' && r) { const list = [...r.cmds.values()].filter((b) => b.seq > sub.after).sort((x, y) => x.seq - y.seq); if (list.length) this.push(sub, list); }
    }
  }
  room(code) { const r = this.rooms[code]; if (!r) throw new Error('no-room'); return r; }
  member(r, uid) { if (!r.data.members.includes(uid)) throw new Error('permission-denied'); }
  push(sub, payload) {
    if (this.offline.has(sub.uid)) return;
    const page = this.pages.get(sub.uid);
    if (!page) return;
    const s = JSON.stringify(payload);
    setTimeout(() => { if (!this.offline.has(sub.uid) && this.subs.has(sub.id)) page.evaluate(([id, p]) => window.__relayPush && window.__relayPush(id, p), [sub.id, s]).catch(() => {}); }, this.latency);
  }
  notify(code, kind, payload, filter) {
    for (const sub of this.subs.values()) if (sub.code === code && sub.kind === kind && (!filter || filter(sub))) this.push(sub, payload(sub));
  }
  apply(data, patch) {
    for (const k of Object.keys(patch)) {
      const ks = k.split('.');
      let o = data;
      for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]] = o[ks[i]] || {};
      o[ks[ks.length - 1]] = patch[k];
    }
  }
  call(uid, m, a) {
    if (this.offline.has(uid)) throw new Error('unavailable (offline)');
    const [code] = a;
    switch (m) {
      case 'createRoom': {
        if (this.rooms[code]) throw new Error('permission-denied');
        this.rooms[code] = { data: JSON.parse(JSON.stringify(a[1])), cmds: new Map(), snap: null };
        return null;
      }
      case 'joinRoom': {
        const r = this.room(code), d = r.data;
        if (d.members.includes(uid)) return null;
        if (d.members.length !== 1 || d.state !== 'lobby') throw new Error('permission-denied');
        d.members.push(uid); d.names[uid] = a[1].name; d.meta[uid] = a[1].meta;
        this.notify(code, 'room', () => d);
        return null;
      }
      case 'leaveRoom': {
        const r = this.rooms[code]; if (!r) return null;
        if (a[1]) { delete this.rooms[code]; this.notify(code, 'room', () => null); }
        else { r.data.members = r.data.members.filter((u) => u !== uid); this.notify(code, 'room', () => r.data); }
        return null;
      }
      case 'getRoom': { const r = this.rooms[code]; if (!r) return null; this.member(r, uid); return r.data; }
      case 'updateRoom': { const r = this.room(code); this.member(r, uid); this.apply(r.data, a[1]); this.notify(code, 'room', () => r.data); return null; }
      case 'claimAuth': {
        const r = this.room(code); this.member(r, uid);
        if (r.data.auth !== a[1]) return false;
        Object.assign(r.data, { auth: uid, epoch: a[2], away: a[1] });
        this.notify(code, 'room', () => r.data);
        return true;
      }
      case 'putBatch': {
        const r = this.room(code), b = a[1];
        if (r.data.auth !== uid) throw new Error('permission-denied (not auth)');
        if (r.cmds.has(b.seq)) throw new Error('permission-denied (exists)');
        r.cmds.set(b.seq, b);
        this.notify(code, 'cmds', () => [b], (s) => b.seq > s.after);
        return null;
      }
      case 'maxSeq': { const r = this.room(code); return r.cmds.size ? Math.max(...r.cmds.keys()) : 0; }
      case 'putReq': { this.room(code); this.notify(code, 'reqs', () => ({ o: a[1], by: uid }), (s) => s.uid !== uid); return null; }
      case 'putSnap': { const r = this.room(code); if (r.data.auth !== uid) throw new Error('permission-denied'); r.snap = a[1]; this.notify(code, 'snap', () => r.snap); return null; }
      case 'sub': {
        const [, id, kind, after] = a;
        const r = this.rooms[code];
        const sub = { id, kind, code, uid, after };
        this.subs.set(id, sub);
        if (kind === 'room') this.push(sub, r ? r.data : null);
        if (kind === 'cmds' && r) { const list = [...r.cmds.values()].filter((b) => b.seq > after).sort((x, y) => x.seq - y.seq); if (list.length) this.push(sub, list); }
        if (kind === 'snap' && r && r.snap) this.push(sub, r.snap);
        return null;
      }
      case 'unsub': this.subs.delete(a[0]); return null;
    }
    throw new Error('unknown ' + m);
  }
}

// lớp truyền tin phía trang (cùng giao diện với CoopFireNet)
const PAGE_NET = `
class RelayNet {
  constructor(uid) { this.uid = uid; this.cbs = {}; this.n = 0; window.__relayPush = (id, p) => { const f = this.cbs[id]; if (f) f(JSON.parse(p)); }; }
  async call(m, ...a) { const r = JSON.parse(await window.__relay(this.uid, m, JSON.stringify(a))); if (r.err) throw new Error(r.err); return r.v; }
  sub(kind, code, after, cb) { const id = this.uid + ':' + (++this.n); this.cbs[id] = cb; this.call('sub', code, id, kind, after).catch(() => {}); return () => { delete this.cbs[id]; this.call('unsub', id).catch(() => {}); }; }
  createRoom(code, data) { return this.call('createRoom', code, data); }
  joinRoom(code, m) { return this.call('joinRoom', code, m); }
  leaveRoom(code, host) { return this.call('leaveRoom', code, host); }
  getRoom(code) { return this.call('getRoom', code); }
  updateRoom(code, patch) { return this.call('updateRoom', code, patch); }
  watchRoom(code, cb) { return this.sub('room', code, 0, cb); }
  claimAuth(code, expect, epoch) { return this.call('claimAuth', code, expect, epoch); }
  putBatch(code, b) { return this.call('putBatch', code, b); }
  maxSeq(code) { return this.call('maxSeq', code); }
  watchBatches(code, after, cb) { return this.sub('cmds', code, after, cb); }
  putReq(code, o) { return this.call('putReq', code, o); }
  watchReqs(code, cb) { return this.sub('reqs', code, 0, (x) => cb(x.o, x.by)); }
  putSnap(code, o) { return this.call('putSnap', code, o); }
  watchSnap(code, cb) { return this.sub('snap', code, 0, cb); }
}
window.RelayNet = RelayNet;`;

// mở một trang game; relay: RelayServer dùng chung, uid: tài khoản giả của trang
async function openGame(browser, { relay, uid, errors, save } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 932, height: 430 } });
  const page = await ctx.newPage();
  const errs = errors || [];
  page.on('pageerror', (e) => errs.push(`[${uid || 'solo'}] ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(`[${uid || 'solo'}] console: ${m.text()}`); });
  await page.route(/firebase-config\.js/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '// chặn Firebase khi kiểm thử' }));
  await page.route(/gstatic\.com|googleapis\.com/, (r) => r.abort());
  if (save) await page.addInitScript((s) => { if (!localStorage.getItem('nuicao.v1')) localStorage.setItem('nuicao.v1', s); }, JSON.stringify(save));
  if (relay) {
    relay.pages.set(uid, page);
    await page.exposeFunction('__relay', (u, m, a) => {
      try { return JSON.stringify({ v: relay.call(u, m, JSON.parse(a)) }); } catch (e) { return JSON.stringify({ err: e.message }); }
    });
  }
  // lớp truyền tin giả nạp lại sau mỗi lần tải trang (kiểm thử "vào lại phòng")
  if (relay) await page.addInitScript(([src, u]) => { eval(src); document.addEventListener('DOMContentLoaded', () => { COOP.netFactory = () => new window.RelayNet(u); }); }, [PAGE_NET, uid]);
  await page.goto(URL);
  await page.waitForFunction(() => typeof COOP !== 'undefined' && typeof ui !== 'undefined' && ui && ui.game);
  return page;
}

function check(cond, msg) {
  if (!cond) { const e = new Error('THẤT BẠI: ' + msg); e.check = true; throw e; }
  console.log('  ✓ ' + msg);
}

module.exports = { launch, openGame, RelayServer, sleep, check, ROOT };
