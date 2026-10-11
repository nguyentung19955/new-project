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
  return { G, C, ctx };
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
      G.LANG = 'en'; // máy này đang dùng tiếng Anh; bản trên mây không có trường lang
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
        assert(G.save.lang === 'en', 'Ngôn ngữ vẫn giữ theo máy khi dùng bản trên mây');
        assert(G.save.owner === 'u' && G.save.savedAt > 0, 'Dùng bản trên mây: bản lưu ghi đúng chủ và giờ lưu');
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
  // ===== Đợt 1 (Q4): chơi ngay bằng tài khoản khách, liên kết Google sau =====
  // Dựng một người chơi KHÁCH đã có tiến trình, và Firebase giả vừa đủ cho C.google().
  function guestGame(link) {
    const { G, C, ctx } = makeGame();
    const sets = [];
    G.fixSave = (x) => x; G.StageScene = { stage: true }; G.scene = null;
    G.save = { stars: { '0-0': 3 }, stars2: {}, heroes: { smith: { unlocked: true, lvl: 2 } }, weapons: [{}, {}], gold: 77, owner: 'khach1', savedAt: 4000, sound: true };
    const user = { uid: 'khach1', isAnonymous: true, linkWithPopup: () => link(user) };
    C.user = user;
    C.auth = { currentUser: user, signInWithCredential: () => Promise.resolve() };
    ctx.firebase = { auth: { GoogleAuthProvider: function () {} } };
    C.db = { collection() { return { doc(id) { return { get: () => Promise.resolve({ exists: false }), set: (p) => { sets.push({ id, p }); return Promise.resolve(); } }; } }; } };
    return { G, C, ctx, sets, user };
  }
  // (1) Liên kết thành công: vẫn đúng tài khoản đó (cùng uid), tiến trình giữ nguyên và được đẩy lên mây của chính nó.
  {
    const { G, C, sets } = guestGame((u) => { u.isAnonymous = false; u.email = 'a@gmail.com'; return Promise.resolve({ user: u }); });
    const before = JSON.stringify(G.save);
    const r = await C.google();
    clearTimeout(C._timer);
    assert(r === 'linked', 'Q4: khách liên kết Google thành công phải trả về linked (được ' + r + ')');
    assert(JSON.stringify(G.save) === before, 'Q4: liên kết thành công không được đổi bản lưu trên máy');
    assert(sets.length === 1 && sets[0].id === 'khach1' && JSON.parse(sets[0].p.save).gold === 77 && JSON.parse(sets[0].p.save).stars['0-0'] === 3,
      'Q4: sau khi liên kết, tiến trình của khách phải được lưu lên mây dưới đúng tài khoản đó');
    assert(!C.isGuest(), 'Q4: sau khi liên kết không còn là khách');
    console.log('PASS — Q4: khách liên kết Google thành công, tiến trình giữ nguyên');
  }
  // (3) Liên kết thất bại: báo lỗi tiếng Việt, KHÔNG ghi gì lên mây, bản lưu trên máy không đổi, vẫn là khách.
  {
    const fails = [
      ['auth/popup-closed-by-user', 'Đã đóng cửa sổ đăng nhập'],
      ['auth/popup-blocked', 'Trình duyệt chặn cửa sổ đăng nhập'],
      ['auth/network-request-failed', 'Mất mạng, thử lại sau'],
      ['auth/credential-already-in-use', 'Tài khoản Google này đã được dùng cho một tiến trình khác'], // không kèm credential: không chuyển tài khoản được
    ];
    for (const [code, viet] of fails) {
      const { G, C, sets } = guestGame(() => Promise.reject(Object.assign(new Error('Firebase: Error (' + code + ').'), { code })));
      const before = JSON.stringify(G.save);
      let err = null;
      try { await C.google(); } catch (e) { err = e; }
      clearTimeout(C._timer);
      assert(err && err.message.indexOf(viet) === 0, 'Q4: lỗi ' + code + ' phải báo bằng tiếng Việt (được: ' + (err && err.message) + ')');
      assert(JSON.stringify(G.save) === before, 'Q4: liên kết thất bại (' + code + ') không được đổi bản lưu trên máy');
      assert(sets.length === 0, 'Q4: liên kết thất bại (' + code + ') không được ghi gì lên mây');
      assert(C.isGuest() && C.user.uid === 'khach1', 'Q4: liên kết thất bại (' + code + ') thì vẫn là tài khoản khách cũ');
    }
    // Tài khoản Google đã có dữ liệu nhưng chuyển sang nó cũng hỏng (mất mạng giữa chừng): vẫn không mất gì.
    {
      const { G, C, sets } = guestGame(() => Promise.reject({ code: 'auth/credential-already-in-use', credential: { c: 1 } }));
      C.auth.signInWithCredential = () => Promise.reject({ code: 'auth/network-request-failed' });
      const before = JSON.stringify(G.save);
      let err = null;
      try { await C.google(); } catch (e) { err = e; }
      assert(err && /Mất mạng/.test(err.message) && JSON.stringify(G.save) === before && sets.length === 0, 'Q4: chuyển tài khoản hỏng giữa chừng không được đổi bản lưu hay ghi lên mây');
    }
    console.log('PASS — Q4: liên kết Google thất bại không xoá, không ghi đè tiến trình');
  }
  // (2) Người đã có tiến trình Google mở máy mới: máy mới chỉ có bản trắng của khách → phải dùng bản trên mây, không ghi đè mây.
  {
    const { G, C } = makeGame();
    G.fixSave = (x) => x; G.StageScene = { stage: true }; G.scene = null;
    const stars = {}; for (let i = 0; i < 5; i++) stars['0-' + i] = 3;
    const cloudSave = { stars, stars2: {}, heroes: { smith: { unlocked: true, lvl: 9 } }, weapons: [{}, {}, {}], gold: 4321, owner: 'google-cu', savedAt: 1000, sound: true };
    G.save = { stars: {}, stars2: {}, heroes: { smith: { unlocked: true, lvl: 1 } }, weapons: [{}, {}], gold: 0, owner: 'khach-may-moi', savedAt: 9000, sound: true }; // bản trắng, giờ lưu MỚI hơn mây
    let asked = 0; const sets = [];
    G.cloudUI = { conflict() { asked++; return Promise.resolve('local'); } };
    C.user = { uid: 'google-cu', isAnonymous: false };
    C.db = { collection() { return { doc() { return {
      get: () => Promise.resolve({ exists: true, data: () => ({ save: JSON.stringify(cloudSave), updatedAt: 1000 }) }),
      set: (p) => { sets.push(p); return Promise.resolve(); },
    }; } }; } };
    await C.pull();
    clearTimeout(C._timer);
    assert(G.save.gold === 4321 && G.save.stars['0-4'] === 3, 'Q4: máy mới đăng nhập Google đã có tiến trình phải dùng tiến trình trên mây');
    assert(sets.length === 0 && asked === 0, 'Q4: máy mới không được ghi đè bản trên mây bằng bản trắng (ghi ' + sets.length + ', hỏi ' + asked + ')');
    assert(G.save.owner === 'google-cu', 'Q4: bản lưu trên máy ghi đúng chủ là tài khoản Google');
    console.log('PASS — Q4: tài khoản Google đã có tiến trình, mở máy mới → dùng tiến trình trên mây, không tạo bản mới');
  }
})().catch((err) => { console.error('FAIL —', err.message); process.exit(1); });
