// Các bảng nhập chữ của phần mây (khung HTML nổi trên game, màu trống đồng): hòm thư góp ý, "Góp ý nhận được" (chỉ quản trị),
// hỏi chọn bản lưu khi hai bản lệch nhau, đổi tên trên bảng vàng. Game vẽ bằng canvas nên chỗ cần gõ chữ dùng khung HTML này.
// Khung nằm trong #shell nên xoay cùng game khi cầm dọc (khoá ngang); chạm, phím trong khung không lọt xuống game.
(function () {
  const G = window.G, C = G.cloud;
  const FB_KEY = 'linhkhi.feedback';
  const KINDS = [['bug', 'Lỗi'], ['idea', 'Ý tưởng'], ['balance', 'Cân bằng'], ['other', 'Khác']];
  const KIND_NAME = { bug: 'Lỗi', idea: 'Ý tưởng', balance: 'Cân bằng', other: 'Khác' };
  const KIND_COL = { bug: '#c8452f', idea: '#3f8f7f', balance: '#a8752f', other: '#5a6a8a' };
  const ST = [['new', 'Mới'], ['seen', 'Đã xem'], ['done', 'Đã xử lý']];
  const LIMIT_GAP = 60000, LIMIT_DAY = 10, QUEUE_MAX = 5, SHOT_MAX = 200000; // ảnh ≤ 200000 ký tự ≈ JPEG 150KB

  const CSS = `
#lk-ov{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(6,14,14,.72);font-family:"Be Vietnam Pro",system-ui,sans-serif;color:#f1e6c6;-webkit-user-select:text;user-select:text;touch-action:manipulation}
#lk-ov *{box-sizing:border-box}
.lk-box{position:relative;width:min(560px,calc(100% - 16px));max-height:calc(100% - 12px);display:flex;flex-direction:column;background:#12292a;border:2px solid #a8752f;border-radius:6px;box-shadow:0 0 0 2px #1a120a,0 6px 24px rgba(0,0,0,.6);overflow:hidden}
.lk-box.wide{width:min(760px,calc(100% - 12px))}
.lk-head{display:flex;align-items:center;gap:8px;padding:6px 10px;background:linear-gradient(#1f4f4a,#17363a);border-bottom:2px solid #d9a441;font-weight:700;color:#f6dc92;font-size:15px}
.lk-head .lk-x{margin-left:auto}
.lk-body{padding:8px 10px;overflow:auto;touch-action:pan-y;-webkit-overflow-scrolling:touch;font-size:13px;line-height:1.4}
.lk-foot{display:flex;gap:8px;justify-content:flex-end;padding:6px 10px;border-top:1px solid #5a3d1a;background:#0f2223}
.lk-btn{font:700 13px "Be Vietnam Pro",system-ui,sans-serif;color:#fff0c4;background:#1f4f4a;border:2px solid #a8752f;border-radius:4px;padding:6px 12px;min-height:34px;cursor:pointer}
.lk-btn:active{background:#3f8f7f}
.lk-btn.p{background:#8a2f22;border-color:#d9a441}.lk-btn.d{background:#5a1f1a}
.lk-btn.s{padding:3px 8px;min-height:28px;font-size:12px}
.lk-btn.on{background:#2f6a60;border-color:#f6dc92;color:#f6dc92}
.lk-btn:disabled{opacity:.5}
.lk-chips{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 6px}
.lk-ov textarea,.lk-ov input[type=text]{width:100%;font:14px "Be Vietnam Pro",system-ui,sans-serif;color:#fff0c4;background:#0d1716;border:1px solid #a8752f;border-radius:4px;padding:6px;-webkit-user-select:text;user-select:text}
#lk-ov textarea{min-height:84px;resize:vertical}
.lk-row{display:flex;align-items:center;gap:8px;margin:4px 0}
.lk-sub{color:#a9c2b4;font-size:12px}
.lk-err{color:#ff9a5a;font-size:12px;min-height:16px}
.lk-shot{display:flex;align-items:center;gap:8px}
.lk-shot img{height:54px;border:1px solid #a8752f;border-radius:3px}
.lk-thanks{text-align:center;padding:14px 10px}
.lk-thanks b{display:block;font-size:17px;color:#f6dc92;margin-bottom:6px}
.lk-item{border:1px solid #5a3d1a;border-left:4px solid #a8752f;border-radius:4px;background:#17363a;padding:6px 8px;margin:6px 0}
.lk-item .k{display:inline-block;font-weight:700;color:#fff;border-radius:3px;padding:0 6px;margin-right:6px;font-size:12px}
.lk-item .t{white-space:pre-wrap;word-break:break-word;margin:4px 0}
.lk-item .m{color:#a9c2b4;font-size:11.5px;word-break:break-word}
.lk-item .n{color:#f6dc92;font-size:12px;margin-top:3px;white-space:pre-wrap;word-break:break-word}
.lk-item img{max-height:70px;max-width:130px;border:1px solid #a8752f;border-radius:3px;cursor:zoom-in;margin-top:4px}
.lk-big{position:absolute;inset:0;z-index:2;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;cursor:zoom-out}
.lk-big img{max-width:96%;max-height:96%}
.lk-cards{display:flex;gap:8px;flex-wrap:wrap}
.lk-card{flex:1 1 180px;border:1px solid #a8752f;border-radius:4px;background:#17363a;padding:6px 8px}
.lk-card b{color:#f6dc92}
`;

  // ---------- đồ dùng ----------
  function el(tag, cls, text, attrs) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function btn(label, cls, act, fn) { const b = el('button', 'lk-btn ' + (cls || ''), label, { type: 'button', 'data-act': act }); if (fn) b.onclick = fn; return b; }
  let root = null, onClose = null;
  function css() { if (!document.getElementById('lk-css')) { const s = el('style', null, CSS, { id: 'lk-css' }); document.head.appendChild(s); } }
  // mở khung: chặn mọi chạm, phím, cuộn khỏi lọt xuống game
  function open(box, closeFn) {
    close(true);
    css();
    root = el('div', 'lk-ov', null, { id: 'lk-ov' });
    const stop = (e) => e.stopPropagation();
    for (const t of ['pointerdown', 'pointerup', 'pointermove', 'touchstart', 'touchmove', 'touchend', 'keyup', 'contextmenu', 'selectstart', 'dragstart', 'gesturestart', 'wheel', 'dblclick']) root.addEventListener(t, stop);
    root.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') close(); });
    root.appendChild(box);
    (document.getElementById('shell') || document.body).appendChild(root);
    onClose = closeFn || null;
    if (G.dropPointers) G.dropPointers();
    G.overlayOpen = true;
    return root;
  }
  function close(quiet) {
    if (!root) return;
    root.remove(); root = null; G.overlayOpen = false;
    if (G.dropPointers) G.dropPointers();
    if (G.keys) for (const k in G.keys) G.keys[k] = false;
    const f = onClose; onClose = null;
    if (f && !quiet) f();
  }
  function frame(title, wide) {
    const box = el('div', 'lk-box' + (wide ? ' wide' : ''));
    const head = el('div', 'lk-head');
    head.appendChild(el('span', null, title));
    const x = btn('✕', 's lk-x', 'close', () => close()); x.setAttribute('aria-label', 'Đóng'); head.appendChild(x);
    const body = el('div', 'lk-body'), foot = el('div', 'lk-foot');
    box.append(head, body, foot);
    return { box, body, foot };
  }
  const vnTime = (t) => { try { return new Date(t).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false }); } catch (e) { return new Date(t).toLocaleString(); } };

  // ---------- thông tin kỹ thuật gửi kèm ----------
  function where() {
    try {
      const R = G.getRun && G.getRun();
      if (G.scene === G.StageScene && R) {
        const reg = G.REGIONS[R.r];
        const room = R.rooms ? R.rooms[R.idx] : '';
        return ('Ải ' + reg.name + ' ' + (R.i + 1) + (R.diff ? ' (khó)' : '') + ' · phòng ' + (R.idx + 1) + (room ? ' ' + room : '') + ' · ' + R.mode).slice(0, 120);
      }
      if (G.scene === G.Village) { const V = G.villageApi && G.villageApi.V; return ('Làng · ' + (V ? V.tab + (V.who ? ' (' + V.who + ')' : '') : '')).slice(0, 120); }
      if (G.scene === G.Title) return 'Màn chào';
    } catch (e) { /* bỏ qua */ }
    return 'Khác';
  }
  function scr() { return (innerWidth + 'x' + innerHeight + '@' + (window.devicePixelRatio || 1).toFixed(1) + (G.rot ? ' xoay' : '')).slice(0, 40); }
  function ua() {
    const u = navigator.userAgent || '';
    const os = /Android [\d.]+/.exec(u) || /(iPhone|iPad).*?OS [\d_]+/.exec(u) || /Windows NT [\d.]+/.exec(u) || /Mac OS X [\d_]+/.exec(u) || /CrOS|Linux/.exec(u);
    const br = /EdgA?\/[\d]+/.exec(u) || /OPR\/[\d]+/.exec(u) || /SamsungBrowser\/[\d]+/.exec(u) || /Firefox\/[\d]+/.exec(u) || /CriOS\/[\d]+/.exec(u) || /Chrome\/[\d]+/.exec(u) || /Version\/[\d.]+.*Safari/.exec(u) || /Safari/.exec(u);
    const dev = /; ([^;)]+) Build\//.exec(u);
    return [os ? os[0].replace(/_/g, '.') : 'Không rõ máy', dev ? dev[1] : '', br ? br[0].replace(/Version\/([\d.]+).*Safari/, 'Safari $1') : ''].filter(Boolean).join(' · ').slice(0, 160);
  }
  // ảnh chụp trận: chỉ lấy khung cảnh (canvas world), phóng 2 lần, nén JPEG cho dưới 150KB
  function capture() {
    try {
      const w = document.getElementById('world');
      if (!w) return '';
      for (const [cw, ch] of [[960, 540], [640, 360]]) {
        const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
        const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(w, 0, 0, cw, ch);
        for (let q = 0.72; q > 0.2; q -= 0.16) { const s = cv.toDataURL('image/jpeg', q); if (s.indexOf('data:image/jpeg') === 0 && s.length <= SHOT_MAX) return s; }
      }
    } catch (e) { /* bỏ qua */ }
    return '';
  }

  // ---------- giới hạn tần suất và hàng đợi (localStorage) ----------
  function store() { try { const s = JSON.parse(localStorage.getItem(FB_KEY) || '{}'); return s && typeof s === 'object' ? s : {}; } catch (e) { return {}; } }
  function saveStore(s) { try { localStorage.setItem(FB_KEY, JSON.stringify(s)); } catch (e) { /* bỏ qua */ } }
  function limitMsg() {
    const s = store(), now = Date.now(), day = new Date().toDateString();
    if (s.day === day && (s.n || 0) >= LIMIT_DAY) return 'Hôm nay đã gửi ' + LIMIT_DAY + ' góp ý rồi, mai gửi tiếp nhé.';
    if (s.last && now - s.last < LIMIT_GAP) return 'Vừa gửi xong, đợi ' + Math.ceil((LIMIT_GAP - (now - s.last)) / 1000) + ' giây nữa nhé.';
    return '';
  }
  function count() { const s = store(), day = new Date().toDateString(); if (s.day !== day) { s.day = day; s.n = 0; } s.n = (s.n || 0) + 1; s.last = Date.now(); saveStore(s); }
  function enqueue(f) { const s = store(); s.queue = (s.queue || []).concat([f]).slice(-QUEUE_MAX); saveStore(s); }
  let flushing = false;
  async function flush() {
    if (flushing || !C.online()) return 0;
    const s = store(), q = s.queue || [];
    if (!q.length) return 0;
    flushing = true;
    let sent = 0;
    const left = [];
    for (const f of q) { try { await C.sendFeedback(f); sent++; } catch (e) { left.push(f); } }
    const s2 = store(); s2.queue = left; saveStore(s2);
    flushing = false;
    if (sent) toast('Đã gửi ' + sent + ' góp ý đang chờ. Cảm ơn bạn!');
    return sent;
  }
  C.flushFeedback = flush;
  addEventListener('online', () => setTimeout(flush, 500));
  function toast(s) { try { if (G.scene === G.Village && G.villageScene && G.villageScene.say) G.villageScene.say(s); else if (G.villageApi) G.villageApi.say(s); } catch (e) { /* bỏ qua */ } G.cloudToast = { s, t: Date.now() }; }

  // ---------- HÒM THƯ GÓP Ý ----------
  // o.shot: true = có ảnh trận để đính kèm (mở từ bảng tạm dừng / màn kết quả)
  function feedback(o) {
    o = o || {};
    const shot = o.shot ? capture() : '';
    const info = { where: where(), scr: scr(), ua: ua() };
    const F = frame('✉ Góp ý');
    F.box.id = 'lk-fb';
    let kind = 'bug';
    const chips = el('div', 'lk-chips');
    const paint = () => chips.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.k === kind));
    for (const [k, n] of KINDS) { const b = btn(n, 's', 'fb-kind', () => { kind = k; paint(); }); b.dataset.k = k; chips.appendChild(b); }
    paint();
    const ta = el('textarea', null, null, { id: 'lk-fb-text', maxlength: '1000', placeholder: 'Bạn gặp lỗi gì, muốn thêm gì, chỗ nào quá khó hay quá dễ… (10 đến 1000 ký tự)' });
    const cnt = el('span', 'lk-sub', '0/1000', { id: 'lk-fb-count' });
    ta.oninput = () => { if (ta.value.length > 1000) ta.value = ta.value.slice(0, 1000); cnt.textContent = ta.value.length + '/1000'; };
    const contact = el('input', null, null, { id: 'lk-fb-contact', type: 'text', maxlength: '120', placeholder: 'Liên hệ nếu muốn được trả lời (không bắt buộc): Zalo, email…' });
    F.body.append(el('div', 'lk-sub', 'Loại góp ý'), chips, ta, el('div', 'lk-row', null));
    F.body.lastChild.append(cnt);
    F.body.append(contact);
    let attach = null;
    if (shot) {
      const row = el('label', 'lk-row lk-shot');
      attach = el('input', null, null, { type: 'checkbox', id: 'lk-fb-shot' }); attach.checked = true;
      const img = el('img', null, null, { src: shot, alt: 'Ảnh chụp trận' });
      row.append(attach, el('span', null, 'Đính kèm ảnh chụp trận'), img);
      F.body.append(row);
    }
    F.body.append(el('div', 'lk-sub', 'Gửi kèm: phiên bản ' + G.VERSION + ', chỗ đang mở (' + info.where + '), cỡ màn hình, loại máy và trình duyệt. Không gửi email hay tên của bạn.'));
    const note = el('div', 'lk-sub', C.online() ? '' : 'Đang ngoại tuyến: góp ý sẽ được lưu trên máy và tự gửi khi có mạng.', { id: 'lk-fb-note' });
    const err = el('div', 'lk-err', '', { id: 'lk-fb-err' });
    F.body.append(note, err);
    const send = btn('Gửi góp ý', 'p', 'fb-send', async () => {
      const text = ta.value.trim();
      if (text.length < 10) { err.textContent = 'Viết ít nhất 10 ký tự nhé.'; return; }
      const lim = limitMsg();
      if (lim) { err.textContent = lim; return; }
      err.textContent = ''; send.disabled = true;
      const f = { kind, text: text.slice(0, 1000), contact: contact.value.trim().slice(0, 120), shot: attach && attach.checked ? shot : '',
        ver: String(G.VERSION).slice(0, 20), where: info.where, scr: info.scr, ua: info.ua, at: Date.now() };
      let ok = false;
      if (C.online()) { try { await C.sendFeedback(f); ok = true; } catch (e) { ok = false; } }
      if (!ok) enqueue(f);
      count();
      thanks(F, ok);
    });
    F.foot.append(btn('Huỷ', '', 'fb-close', () => close()), send);
    open(F.box, o.onClose);
    flush();
    setTimeout(() => { try { ta.focus(); } catch (e) { /* bỏ qua */ } }, 50);
  }
  function thanks(F, ok) {
    F.body.textContent = ''; F.foot.textContent = '';
    const t = el('div', 'lk-thanks', null, { id: 'lk-fb-thanks' });
    t.append(el('b', null, 'Cảm ơn góp ý của bạn!'),
      el('div', null, ok ? 'Góp ý đã được gửi.' : 'Đang không có mạng: góp ý đã được lưu trên máy và sẽ tự gửi khi có mạng.'),
      el('div', 'lk-sub', 'Chúng tôi sẽ đọc từng góp ý để làm Linh Khí hay hơn.'));
    F.body.append(t);
    F.foot.append(btn('Đóng', 'p', 'fb-close', () => close()));
  }

  // ---------- GÓP Ý NHẬN ĐƯỢC (chỉ quản trị) ----------
  function inbox() {
    if (!C.isAdmin()) return;
    const F = frame('📥 Góp ý nhận được', true);
    F.box.id = 'lk-inbox';
    const S = { items: [], cursor: null, more: true, kind: 'all', st: 'all', busy: false };
    const filt = el('div', 'lk-chips');
    const list = el('div', null, null, { id: 'lk-in-list' });
    const msg = el('div', 'lk-sub', 'Đang tải…', { id: 'lk-in-msg' });
    const more = btn('Tải thêm', '', 'in-more', () => load());
    function chipRow() {
      filt.textContent = '';
      for (const [k, n] of [['all', 'Mọi loại']].concat(KINDS)) { const b = btn(n, 's' + (S.kind === k ? ' on' : ''), 'in-kind', () => { S.kind = k; chipRow(); render(); }); b.dataset.k = k; filt.appendChild(b); }
      filt.appendChild(el('span', 'lk-sub', ' · '));
      for (const [k, n] of [['all', 'Mọi trạng thái']].concat(ST)) { const b = btn(n, 's' + (S.st === k ? ' on' : ''), 'in-st', () => { S.st = k; chipRow(); render(); }); b.dataset.s = k; filt.appendChild(b); }
    }
    function bigView(src) {
      const b = el('div', 'lk-big', null, { id: 'lk-big' }); b.appendChild(el('img', null, null, { src, alt: 'Ảnh chụp to' }));
      b.onclick = () => b.remove(); F.box.appendChild(b);
    }
    function item(x) {
      const st = x.status || 'new';
      const d = el('div', 'lk-item'); d.dataset.id = x.id; d.style.borderLeftColor = KIND_COL[x.kind] || '#a8752f';
      const top = el('div');
      const k = el('span', 'k', KIND_NAME[x.kind] || x.kind); k.style.background = KIND_COL[x.kind] || '#555';
      top.append(k, el('span', 'lk-sub', vnTime(x.at || 0) + ' · ' + (ST.find((s) => s[0] === st) || ST[0])[1]));
      d.append(top, el('div', 't', x.text || ''));
      if (x.contact) d.append(el('div', 'm', 'Liên hệ: ' + x.contact));
      d.append(el('div', 'm', [x.ver, x.where, x.scr, x.ua, x.guest ? 'khách' : 'đã đăng nhập Google', 'uid ' + String(x.uid || '').slice(0, 8)].filter(Boolean).join(' · ')));
      if (x.shot && /^data:image\/jpeg;base64,/.test(x.shot)) { const im = el('img', null, null, { src: x.shot, alt: 'Ảnh chụp trận', 'data-act': 'in-shot' }); im.onclick = () => bigView(x.shot); d.append(im); }
      if (x.note) d.append(el('div', 'n', 'Ghi chú: ' + x.note));
      const row = el('div', 'lk-chips');
      for (const [s, n] of ST) {
        const b = btn(n, 's' + (st === s ? ' on' : ''), 'in-set', async () => {
          try { await C.setFeedbackStatus(x.id, s); x.status = s; render(); C.countNew(); } catch (e) { msg.textContent = e.message; }
        });
        b.dataset.s = s; row.append(b);
      }
      row.append(btn('✎ Ghi chú', 's', 'in-note', () => {
        const ta = el('textarea', null, x.note || '', { maxlength: '300' }); ta.style.minHeight = '50px';
        const save = btn('Lưu ghi chú', 's p', 'in-note-save', async () => {
          try { await C.setFeedbackStatus(x.id, x.status || 'seen', ta.value.slice(0, 300)); x.status = x.status || 'seen'; x.note = ta.value.slice(0, 300); render(); } catch (e) { msg.textContent = e.message; }
        });
        row.replaceWith(ta); ta.after(save);
      }));
      row.append(btn('🗑 Xoá', 's d', 'in-del', () => {
        const ask = el('div', 'lk-row');
        ask.append(el('span', 'lk-err', 'Xoá hẳn góp ý này? Không lấy lại được.'),
          btn('Xoá', 's d', 'in-del-yes', async () => { try { await C.deleteFeedback(x.id); S.items = S.items.filter((y) => y !== x); render(); C.countNew(); } catch (e) { msg.textContent = e.message; } }),
          btn('Thôi', 's', 'in-del-no', () => render()));
        row.replaceWith(ask);
      }));
      d.append(row);
      return d;
    }
    function render() {
      list.textContent = '';
      const shown = S.items.filter((x) => (S.kind === 'all' || x.kind === S.kind) && (S.st === 'all' || (x.status || 'new') === S.st));
      for (const x of shown) list.append(item(x));
      if (!S.busy) msg.textContent = S.items.length ? 'Đã tải ' + S.items.length + ' góp ý' + (shown.length < S.items.length ? ', đang hiện ' + shown.length + ' theo bộ lọc' : '') + (S.more ? '. Bấm Tải thêm để xem cũ hơn.' : '. Hết rồi.') : 'Chưa có góp ý nào.';
      more.disabled = !S.more || S.busy;
    }
    async function load() {
      if (S.busy || !S.more) return;
      S.busy = true; msg.textContent = 'Đang tải…'; more.disabled = true;
      try { const r = await C.listFeedback({ limit: 20, after: S.cursor }); S.items = S.items.concat(r.items); S.cursor = r.cursor; S.more = r.more; S.busy = false; render(); }
      catch (e) { S.busy = false; msg.textContent = e.message; more.disabled = false; }
    }
    chipRow();
    F.body.append(filt, msg, list);
    F.foot.append(more, btn('Đóng', 'p', 'in-close', () => close()));
    open(F.box);
    load();
  }

  // ---------- hai bản lưu lệch nhau: hỏi giữ bản nào ----------
  function conflict(local, cloud, at) {
    return new Promise((done) => {
      const F = frame('Chọn bản lưu');
      F.box.id = 'lk-conflict';
      const card = (title, s, sub) => { const c = el('div', 'lk-card'); c.append(el('b', null, title), el('div', 'lk-sub', sub), el('div', null, s.stars + ' sao · xa nhất ' + s.farText), el('div', null, 'Cấp cao nhất ' + s.lvl + ' · ' + s.weapons + ' vũ khí · ' + s.gold + ' vàng')); return c; };
      const cards = el('div', 'lk-cards');
      cards.append(card('Trên máy này', local, 'đi xa hơn'), card('Trên mây', cloud, 'lưu lúc ' + vnTime(at)));
      F.body.append(el('div', null, 'Bản lưu trên mây mới hơn, nhưng bản trên máy này có nhiều tiến độ hơn. Bạn muốn giữ bản nào? Bản không chọn sẽ bị thay.'), cards);
      let picked = false;
      const pick = (v) => { picked = true; close(true); done(v); };
      F.foot.append(btn('Dùng bản trên mây', '', 'cf-cloud', () => pick('cloud')), btn('Giữ bản trên máy này', 'p', 'cf-local', () => pick('local')));
      open(F.box, () => { if (!picked) done('local'); }); // đóng khung = giữ bản nhiều tiến độ hơn
    });
  }

  // ---------- đổi tên trên bảng vàng ----------
  function rename(cur, clean) {
    return new Promise((done) => {
      const F = frame('Đổi tên trên bảng vàng');
      F.box.id = 'lk-rename';
      const inp = el('input', null, null, { id: 'lk-name', type: 'text', maxlength: '16', value: cur || '' });
      const err = el('div', 'lk-err', '', { id: 'lk-name-err' });
      F.body.append(el('div', 'lk-sub', 'Từ 2 đến 16 ký tự: chữ, số, dấu cách, gạch dưới, gạch ngang.'), inp, err);
      let res = null;
      const ok = btn('Lưu tên', 'p', 'name-ok', () => {
        const v = clean(inp.value);
        if (!v) { err.textContent = 'Tên cần 2 đến 16 ký tự, chỉ gồm chữ, số, dấu cách, _ hoặc -.'; return; }
        res = v; close();
      });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok.click(); });
      F.foot.append(btn('Huỷ', '', 'name-cancel', () => close()), ok);
      open(F.box, () => done(res));
      setTimeout(() => { try { inp.focus(); inp.select(); } catch (e) { /* bỏ qua */ } }, 50);
    });
  }

  G.cloudUI = { feedback, inbox, conflict, rename, close, isOpen: () => !!root, capture, where, ua, scr, flush, store, KINDS };
})();
