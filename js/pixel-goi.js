// ------------------------------------------------------------
//  GÓI PIXEL (claude/tool-pixel): nạp goi-pixel.zip xuất từ tools/ve-pixel.html (Cài đặt → Gói pixel).
//  Zip: goi-pixel.json + assets/pixel/<nhóm>/<mã>.png|.json[|-chan-dung.png] (+ tools/pixel/src/… — game bỏ qua).
//  Kiểm tra hợp lệ → lưu bền IndexedDB → mỗi lần mở game ghép vào PIXEL_MANIFEST + ASSET_DATA (ảnh blob:).
//  Chỉ có tác dụng khi bật pixel (pixelOn()); mã không có trong gói vẫn vẽ như cũ (pxEntry trả null → hình cũ).
// ------------------------------------------------------------
const PXGOI = {
  DB: 'ttv-pixel-goi', STORE: 'goi', KEY: 1,
  NHOM: ['tuong', 'quai', 'boss', 'nen', 'icon', 'do', 'an-phu', 'ky-nang', 'than-khi', 'giao-dien', 'canh', 'vfx'],
  MAX_ZIP: 30 * 1048576,
  goi: null,          // gói đang dùng { ten, luc, items: [{ key, entry, png, cd }] }
  goc: {},            // manifest gốc của mã bị gói ghi đè (để gỡ)
  urls: [],
  ready: null,        // Promise nạp từ IndexedDB lúc mở game

  // ---- zip (không nén / deflate)
  async readZip(buf) {
    const b = new Uint8Array(buf), v = new DataView(b.buffer, b.byteOffset, b.byteLength), out = new Map(), dec = new TextDecoder();
    let e = b.length - 22;
    while (e >= 0 && v.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw new Error('không phải file .zip');
    let p = v.getUint32(e + 16, true);
    const n = v.getUint16(e + 10, true);
    if (n > 5000) throw new Error('zip quá nhiều file');
    for (let i = 0; i < n; i++) {
      if (p + 46 > b.length || v.getUint32(p, true) !== 0x02014b50) throw new Error('zip hỏng');
      const meth = v.getUint16(p + 10, true), csz = v.getUint32(p + 20, true), usz = v.getUint32(p + 24, true);
      const nl = v.getUint16(p + 28, true), xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), lo = v.getUint32(p + 42, true);
      // zip có thư mục gốc bọc ngoài (nén lại bằng Windows) cũng nhận
      const name = dec.decode(b.subarray(p + 46, p + 46 + nl)).replace(/^[^/]+\/(?=assets\/pixel\/|goi-pixel\.json$)/, '');
      p += 46 + nl + xl + cl;
      if (name.endsWith('/') || !/^(goi-pixel\.json$|assets\/pixel\/)/.test(name)) continue;
      if (usz > 8 * 1048576) throw new Error(`file quá to trong zip: ${name}`);
      const ds = lo + 30 + v.getUint16(lo + 26, true) + v.getUint16(lo + 28, true);
      const data = b.subarray(ds, ds + csz);
      let raw;
      if (meth === 0) raw = data;
      else if (meth === 8) {
        if (typeof DecompressionStream === 'undefined') throw new Error('trình duyệt không giải nén được zip nén — dùng zip xuất thẳng từ tool');
        raw = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
      } else throw new Error(`kiểu nén ${meth} không hỗ trợ (${name})`);
      out.set(name, new Uint8Array(raw));
    }
    return out;
  },

  // ---- kiểm tra gói → { items, loi, canhBao }
  validate(files) {
    const loi = [], canhBao = [], items = [];
    const head = files.get('goi-pixel.json');
    if (!head) loi.push('thiếu goi-pixel.json (zip không phải gói pixel xuất từ tools/ve-pixel.html)');
    else {
      try { const h = JSON.parse(new TextDecoder().decode(head)); if (h.loai !== 'goi-pixel-ttv') loi.push('goi-pixel.json sai loại'); else if (!(h.phienBan >= 1)) loi.push('goi-pixel.json thiếu phiên bản'); }
      catch (e) { loi.push('goi-pixel.json hỏng'); }
    }
    const isInt = (x, lo, hi) => Number.isInteger(x) && x >= lo && x <= hi;
    for (const [name, data] of files) {
      const m = name.match(/^assets\/pixel\/([a-z-]+)\/([a-z0-9_-]+)\.json$/);
      if (!m) continue;
      const key = m[1] + '/' + m[2], bad = (t) => canhBao.push(`${key}: ${t} — bỏ qua`);
      if (!this.NHOM.includes(m[1])) { bad(`nhóm "${m[1]}" lạ`); continue; }
      let j;
      try { j = JSON.parse(new TextDecoder().decode(data)); } catch (e) { bad('JSON hỏng'); continue; }
      if (!isInt(j.w, 4, 320) || !isInt(j.h, 4, 320) || !isInt(j.n, 1, 64)) { bad('w / h / n sai'); continue; }
      const an = j.anims && typeof j.anims === 'object' ? Object.entries(j.anims) : [];
      if (!an.length || an.some(([k, a]) => !/^[a-z]+$/.test(k) || !a || !isInt(a.start, 0, j.n - 1) || !isInt(a.n, 1, j.n) || a.start + a.n > j.n || !(a.fps > 0 && a.fps <= 30))) { bad('động tác (anims) sai'); continue; }
      const png = files.get(name.replace(/\.json$/, '.png'));
      if (!png || png.length < 33 || png[0] !== 137 || png[1] !== 80 || png[2] !== 78 || png[3] !== 71) { bad('thiếu ảnh PNG'); continue; }
      const dv = new DataView(png.buffer, png.byteOffset, png.byteLength);
      if (dv.getUint32(16) !== j.w * j.n || dv.getUint32(20) !== j.h) { bad(`ảnh ${dv.getUint32(16)}×${dv.getUint32(20)} không khớp ${j.n} khung ${j.w}×${j.h}`); continue; }
      let cd = files.get(name.replace(/\.json$/, '-chan-dung.png')) || null;
      if (cd && (cd[0] !== 137 || cd[1] !== 80)) cd = null;
      const bb = Array.isArray(j.bbox) && j.bbox.length === 4 && j.bbox.every((x) => isInt(x, 0, 320)) ? j.bbox : [0, 0, j.w, j.h];
      const entry = { name: String(j.name || m[2]).slice(0, 80), w: j.w, h: j.h, ax: isInt(j.ax, 0, j.w - 1) ? j.ax : 0, ay: isInt(j.ay, 0, j.h - 1) ? j.ay : j.h - 1,
        bbox: bb, n: j.n, anims: Object.fromEntries(an.map(([k, a]) => [k, { start: a.start, n: a.n, fps: a.fps, loop: !!a.loop }])) };
      if (cd) entry.cd = 1;
      items.push({ key, entry, png, cd });
    }
    if (!loi.length && !items.length) loi.push('gói không có sprite hợp lệ nào');
    return { items, loi, canhBao };
  },

  // ---- IndexedDB
  db() {
    return new Promise((ok, fail) => {
      if (typeof indexedDB === 'undefined') return fail(new Error('trình duyệt không có IndexedDB'));
      const r = indexedDB.open(this.DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(this.STORE);
      r.onsuccess = () => ok(r.result);
      r.onerror = () => fail(r.error || new Error('không mở được IndexedDB'));
    });
  },
  async idb(mode, fn) {
    const db = await this.db();
    try {
      return await new Promise((ok, fail) => {
        const tx = db.transaction(this.STORE, mode), st = tx.objectStore(this.STORE);
        const r = fn(st);
        tx.oncomplete = () => ok(r && r.result);
        tx.onerror = tx.onabort = () => fail(tx.error || new Error('lỗi IndexedDB'));
      });
    } finally { db.close(); }
  },

  // ---- ghép / gỡ khỏi game
  apply(goi) {
    this.unapply();
    if (!goi || !goi.items) return;
    window.PIXEL_MANIFEST = window.PIXEL_MANIFEST || {};
    window.ASSET_DATA = window.ASSET_DATA || {};
    const M = window.PIXEL_MANIFEST;
    for (const it of goi.items) {
      if (!(it.key in this.goc)) this.goc[it.key] = M[it.key] || null;
      M[it.key] = { ...it.entry, key: it.key, goi: 1 };
      const u = URL.createObjectURL(new Blob([it.png], { type: 'image/png' }));
      this.urls.push(u);
      window.ASSET_DATA[`pixel/${it.key}.png`] = u;
      if (it.cd) { const c = URL.createObjectURL(new Blob([it.cd], { type: 'image/png' })); this.urls.push(c); window.ASSET_DATA[`pixel/${it.key}-chan-dung.png`] = c; }
    }
    this.goi = goi;
    this.refresh(goi.items.map((it) => it.key));
  },
  unapply() {
    if (!this.goi) return;
    const keys = this.goi.items.map((it) => it.key);
    for (const k of keys) {
      if (window.ASSET_DATA) { delete window.ASSET_DATA[`pixel/${k}.png`]; delete window.ASSET_DATA[`pixel/${k}-chan-dung.png`]; }
      if (this.goc[k]) window.PIXEL_MANIFEST[k] = this.goc[k]; else delete window.PIXEL_MANIFEST[k];
    }
    this.urls.forEach((u) => URL.revokeObjectURL(u));
    this.urls = []; this.goc = {}; this.goi = null;
    this.refresh(keys);
  },
  // xoá bộ nhớ đệm ảnh / khung của các mã để lần vẽ sau dùng ảnh mới
  refresh(keys) {
    for (const k of keys) {
      if (typeof assetMap !== 'undefined') { assetMap.delete(`pixel/${k}.png`); assetMap.delete(`pixel/${k}-chan-dung.png`); }
      if (typeof pxFrames !== 'undefined') for (const fk of [...pxFrames.keys()]) if (fk.startsWith(k + '|')) pxFrames.delete(fk);
      if (typeof pixelOn === 'function' && pixelOn() && window.PIXEL_MANIFEST[k] && typeof asset === 'function') asset(`pixel/${k}.png`, true);
    }
    if (typeof assetVersion !== 'undefined') assetVersion++;
  },

  // ---- thao tác người chơi
  async install(file) {
    if (!file) throw new Error('chưa chọn file');
    if (file.size > this.MAX_ZIP) throw new Error('file quá to (tối đa 30 MB)');
    const files = await this.readZip(await file.arrayBuffer());
    const r = this.validate(files);
    if (r.loi.length) throw new Error(r.loi[0]);
    const goi = { ten: String(file.name || 'goi-pixel.zip').slice(0, 80), luc: Date.now(), items: r.items };
    await this.idb('readwrite', (st) => st.put(goi, this.KEY));
    this.apply(goi);
    return { n: r.items.length, canhBao: r.canhBao };
  },
  async remove() {
    await this.idb('readwrite', (st) => st.delete(this.KEY));
    this.unapply();
  },
  async load() {
    try {
      const goi = await this.idb('readonly', (st) => st.get(this.KEY));
      if (goi && goi.items && goi.items.length) this.apply(goi);
    } catch (e) { /* không có IndexedDB (chế độ ẩn danh…) → chơi như thường */ }
  },
  // công tắc pixel lưu trên máy (đọc trong js/pixel.js lúc mở game)
  setPixel(on) { try { localStorage.setItem('ttv.pixel', on ? '1' : '0'); } catch (e) { /* chặn lưu */ } },   // pixel-mac-dinh: '0' = người chơi tự tắt
  status() {
    const g = this.goi, on = typeof pixelOn === 'function' && pixelOn();
    if (!g) return on ? 'Pixel đang bật (mặc định)' : 'Pixel đang tắt · dùng hình cũ';
    return `Gói «${g.ten}» · ${g.items.length} mã${on ? '' : ' · bật pixel để thấy'}`;
  },
};
PXGOI.ready = PXGOI.load();
