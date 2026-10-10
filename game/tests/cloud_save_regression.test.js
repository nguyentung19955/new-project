// Kiểm thử hồi quy không cần trình duyệt cho race condition và tự thử lại khi lưu mây lỗi.
// Chạy (trong game/ hoặc ở gốc repo đều được): node tests/cloud_save_regression.test.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const CLOUD_JS = path.join(__dirname, '..', 'js', 'cloud.js');

function makeGame() {
  const G = {
    VERSION: 'test', REGIONS: [], HKEYS: [],
    save: { stars: {}, stars2: {}, heroes: {}, weapons: [], gold: 1, owner: 'u', savedAt: 1, sound: true },
    persist() {}, loadSave() {},
  };
  const ctx = {
    G, window: null,
    location: { search: '', protocol: 'https:', origin: 'https://example.test' },
    navigator: { onLine: true },
    document: { createElement() { return {}; }, head: { appendChild() {} } },
    addEventListener() {}, setTimeout, clearTimeout, Promise, Date, JSON, Math,
    String, Array, Object, Error, isFinite, console,
  };
  ctx.window = ctx; ctx.top = ctx; ctx.self = ctx;
  vm.runInNewContext(fs.readFileSync(CLOUD_JS, 'utf8'), ctx, { filename: 'js/cloud.js' });
  const C = G.cloud;
  C.ready = true; C.enabled = true; C.user = { uid: 'u' }; C.why = '';
  return { G, C };
}

function fakeDb(C, set) {
  C.db = { collection() { return { doc() { return { set }; } }; } };
}
function assert(ok, message) { if (!ok) throw new Error(message); }

(async () => {
  // Một save đang chờ; người chơi tạo thay đổi mới trước khi save cũ hoàn tất.
  {
    const { G, C } = makeGame();
    let finishOld;
    let calls = 0;
    fakeDb(C, () => {
      calls++;
      return calls === 1 ? new Promise((resolve) => { finishOld = resolve; }) : Promise.resolve();
    });
    const oldWrite = C.push(true);
    G.save.gold = 2;
    G.persist();
    finishOld();
    await oldWrite;
    assert(C.dirty, 'Thay đổi mới bị đánh dấu nhầm là đã đồng bộ');
    clearTimeout(C._timer); C._timer = null;
    await C.push(true);
    assert(!C.dirty, 'Bản lưu mới nhất không được đánh dấu đồng bộ sau khi ghi thành công');
    assert(calls === 2, 'Cần có lần ghi thứ hai cho thay đổi mới');
    clearTimeout(C._timer);
    console.log('PASS — không mất cờ dirty khi save mới xuất hiện trong lúc đang ghi');
  }

  // Lần ghi đầu thất bại; retry được lên lịch mà không cần thay đổi save hay event online.
  {
    const { C } = makeGame();
    let calls = 0;
    fakeDb(C, () => ++calls === 1 ? Promise.reject(new Error('temporary')) : Promise.resolve());
    await C.push(true);
    assert(C.dirty, 'Sau lỗi ghi phải giữ dirty');
    assert(C._timer, 'Sau lỗi ghi phải có lịch tự thử lại');
    clearTimeout(C._timer); C._timer = null;
    await C.push(true);
    assert(!C.dirty && calls === 2, 'Lần ghi lại phải thành công và xoá dirty');
    clearTimeout(C._timer);
    console.log('PASS — tự thử lại sau lỗi ghi tạm thời');
  }

  // V2: bản trên máy MỚI HƠN theo giờ nhưng ÍT tiến độ hơn bản trên mây → phải hỏi, không được ghi đè mây ngay.
  {
    const stars = {}; for (const r of [0, 1]) for (let i = 0; i < 5; i++) stars[r + '-' + i] = 3; // 30 sao
    const rich = { stars, stars2: {}, heroes: {}, weapons: [], gold: 5000, owner: 'u', savedAt: 1000, sound: true };
    for (const answer of ['cloud', 'local']) {
      const { G, C } = makeGame();
      G.fixSave = (x) => x; G.StageScene = { stage: true }; G.scene = null;
      G.save = { stars: { '0-0': 1 }, stars2: {}, heroes: {}, weapons: [], gold: 12, owner: 'u', savedAt: 5000, sound: false };
      let asked = 0; const sets = [];
      G.cloudUI = { conflict() { asked++; return Promise.resolve(answer); } };
      C.db = { collection() { return { doc() { return {
        get: () => Promise.resolve({ exists: true, data: () => ({ save: JSON.stringify(rich), updatedAt: 1000 }) }),
        set: (p) => { sets.push(p); return Promise.resolve(); },
      }; } }; } };
      await C.pull();
      clearTimeout(C._timer);
      assert(asked === 1, 'V2: máy mới hơn nhưng mây nhiều tiến độ hơn rõ rệt → phải hỏi chọn bản');
      if (answer === 'cloud') {
        assert(G.save.gold === 5000 && sets.length === 0, 'V2: chọn bản trên mây → dùng bản mây, không ghi đè mây (vàng ' + G.save.gold + ', số lần ghi ' + sets.length + ')');
        assert(G.save.sound === false, 'V2: âm thanh vẫn giữ theo máy');
      } else {
        assert(G.save.gold === 12 && sets.length === 1 && JSON.parse(sets[0].save).gold === 12, 'V2: chọn giữ bản trên máy → đẩy bản máy lên (vàng ' + G.save.gold + ', ghi ' + sets.length + ')');
      }
    }
    // Chênh lệch nhỏ (dưới 8 điểm tiến độ): giữ hành vi cũ — máy mới hơn thì giữ máy và đẩy lên, không hỏi.
    {
      const { G, C } = makeGame();
      G.fixSave = (x) => x; G.StageScene = { stage: true }; G.scene = null;
      G.save = { stars: {}, stars2: {}, heroes: {}, weapons: [], gold: 9, owner: 'u', savedAt: 9000, sound: true };
      let asked = 0; const sets = [];
      G.cloudUI = { conflict() { asked++; return Promise.resolve('cloud'); } };
      C.db = { collection() { return { doc() { return {
        get: () => Promise.resolve({ exists: true, data: () => ({ save: JSON.stringify({ stars: {}, stars2: {}, heroes: {}, weapons: [{}, {}], gold: 1 }), updatedAt: 2000 }) }),
        set: (p) => { sets.push(p); return Promise.resolve(); },
      }; } }; } };
      await C.pull();
      clearTimeout(C._timer);
      assert(asked === 0 && G.save.gold === 9 && sets.length === 1, 'V2: chênh ít → giữ máy, đẩy lên, không hỏi');
    }
    console.log('PASS — V2: bản máy mới hơn nhưng ít tiến độ hơn không ghi đè mây mà hỏi lại');
  }
})().catch((err) => { console.error('FAIL —', err.message); process.exit(1); });
