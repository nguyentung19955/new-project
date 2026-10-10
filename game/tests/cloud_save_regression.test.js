// Kiểm thử hồi quy không cần trình duyệt cho race condition và tự thử lại khi lưu mây lỗi.
// Chạy: node tests/cloud_save_regression.test.js
const fs = require('fs');
const vm = require('vm');

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
  vm.runInNewContext(fs.readFileSync('js/cloud.js', 'utf8'), ctx, { filename: 'js/cloud.js' });
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
})().catch((err) => { console.error('FAIL —', err.message); process.exit(1); });
