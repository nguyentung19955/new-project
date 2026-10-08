// Vẽ hero bằng tấm sprite do tools/sprite/gen_sprite.py tạo ra (ghi đè G.art.hero).
// Hero nào có game/assets/hero/<tên>/sheet.png và sheet.json thì vẽ bằng sprite; hero chưa có thì vẽ như cũ.
// Nạp file này SAU hero_art.js. Vũ khí không nằm trong sprite: mỗi khung cho biết điểm bàn tay, góc và lớp,
// rồi vũ khí đang cầm được vẽ vào đó bằng A.weapon (hoặc G.weaponArt.draw nếu có).
//
// Ba cách đưa sprite vào, thử theo thứ tự:
//   1. Đã nhúng sẵn: G.heroSheets[tên] = { json, png } (file sheet.js làm việc này, dùng cho bản một file).
//   2. Tải sheet.json và sheet.png từ thư mục assets/hero/<tên>/ (khi chạy qua máy chủ web).
//   3. Tải sheet.js bằng thẻ script (khi mở thẳng index.html từ ổ đĩa, trình duyệt không cho tải json).
// Thử nghiệm: G.heroSpriteMap = { smith: 'thu-nguoi' } để hero smith dùng sprite trong thư mục thu-nguoi.
(function () {
  'use strict';
  const G = window.G, A = G && G.art;
  if (!A || !A.hero) return;
  const prev = A.hero; // cách vẽ cũ, dùng khi hero chưa có sprite hoặc có lỗi
  const SHEETS = {};   // khoá hero -> { state: 'loading' | 'ready' | 'none', json, img, tint }
  G.heroSheets = G.heroSheets || {};
  G.heroSpriteMap = G.heroSpriteMap || {};
  const base = () => G.heroSpriteBase || 'assets/hero/';
  const TYPES = { sword: 1, hammer: 1, spear: 1, bow: 1 };
  const TINT = { F: ['#ffffff', 0.6], I: ['#9fd8ff', 0.45], P: ['#7fd957', 0.4] };

  function fromData(S, json, src) {
    const img = new Image();
    img.onload = () => { S.json = json; S.img = img; S.tint = {}; S.state = json && json.dong_tac && json.dong_tac.idle ? 'ready' : 'none'; };
    img.onerror = () => { S.state = 'none'; };
    img.src = src;
  }
  function load(key) {
    const S = (SHEETS[key] = { state: 'loading' });
    const name = G.heroSpriteMap[key] || key;
    const emb = G.heroSheets[name];
    if (emb) { fromData(S, emb.json, emb.png); return S; }
    if (G.heroSpriteFetch === false) { S.state = 'none'; return S; }
    const dir = base() + name + '/';
    const viaScript = () => {
      const el = document.createElement('script');
      el.src = dir + 'sheet.js';
      el.onload = () => { const e = G.heroSheets[name]; if (e) fromData(S, e.json, e.png); else S.state = 'none'; };
      el.onerror = () => { S.state = 'none'; };
      document.head.appendChild(el);
    };
    if (location.protocol === 'file:' || !window.fetch) viaScript();
    else fetch(dir + 'sheet.json').then((r) => (r.ok ? r.json() : Promise.reject())).then((j) => fromData(S, j, dir + 'sheet.png')).catch(viaScript);
    return S;
  }

  // ---------- chọn động tác và khung hình ----------
  // Theo tiến độ 0..1 (đòn đánh, né): khung dài hơn chiếm phần thời gian nhiều hơn.
  function byProg(a, u) {
    const fr = a.khung;
    let total = 0;
    for (const f of fr) total += f.ms;
    let t = Math.max(0, Math.min(0.9999, u)) * total;
    for (let i = 0; i < fr.length; i++) { t -= fr[i].ms; if (t < 0) return i; }
    return fr.length - 1;
  }
  // Theo thời gian trôi (giây): lặp lại nếu động tác lặp, không thì dừng ở khung cuối.
  function byTime(a, sec) {
    const fr = a.khung;
    let total = 0;
    for (const f of fr) total += f.ms;
    let t = sec * 1000;
    if (a.lap) t %= total; else if (t >= total) return fr.length - 1;
    for (let i = 0; i < fr.length; i++) { t -= fr[i].ms; if (t < 0) return i; }
    return fr.length - 1;
  }
  function atkAnim(D, wt, combo) {
    return D['atk_' + wt + '_' + (combo + 1)] || D['atk_' + wt] || D['atk_' + wt + '_1'] || D.atk_sword_1 || D.idle;
  }
  function pick(D, o, wt) {
    const p = o.p, t = (o.t != null ? o.t : G.time) || 0;
    let a;
    if (p && p.dead && (a = D.die)) return [a, byTime(a, p.deadT || 0)];
    if (o.dodge >= 0 && (a = D.dodge)) return [a, byProg(a, o.dodge)];
    if (p && p.dashT > 0) { a = atkAnim(D, wt, 2); return [a, a.khung_trung != null ? a.khung_trung : byProg(a, 0.5)]; }
    if (p && p.specT > 0) { a = atkAnim(D, wt, 2); return [a, byProg(a, 1 - p.specT / 0.35)]; }
    if (p && p.castT > 0 && (a = D.cast)) return [a, byProg(a, 1 - p.castT / 0.4)];
    if (o.atk >= 0) {
      const combo = p ? Math.max(0, p.comboI | 0) % 3 : Math.floor(t / 1.6) % 3;
      a = atkAnim(D, wt, combo);
      return [a, byProg(a, o.atk)];
    }
    if (((p && p.hurtT > 0) || (!p && o.flash)) && (a = D.hurt)) return [a, byProg(a, p ? 1 - p.hurtT / 0.2 : 0)];
    if (o.move && (a = D.run)) return [a, byTime(a, t)];
    return [D.idle, byTime(D.idle, t)];
  }

  // Bản nhuộm màu của cả tấm sprite (chớp trắng khi trúng đòn, xanh khi dính băng, lục khi dính độc).
  function tinted(S, k) {
    if (!k) return S.img;
    let cv = S.tint[k];
    if (!cv) {
      cv = S.tint[k] = document.createElement('canvas');
      cv.width = S.img.width; cv.height = S.img.height;
      const x = cv.getContext('2d');
      x.drawImage(S.img, 0, 0);
      x.globalCompositeOperation = 'source-atop';
      x.globalAlpha = TINT[k][1];
      x.fillStyle = TINT[k][0];
      x.fillRect(0, 0, cv.width, cv.height);
    }
    return cv;
  }

  function draw(c, o, S) {
    const J = S.json, D = J.dong_tac;
    const look = o.weapon ? A.weaponLook(o.weapon) : null;
    const wt = look && TYPES[look.type] ? look.type : 'none';
    const sel = pick(D, o, wt === 'none' ? 'sword' : wt);
    const an = sel[0], fr = an.khung[sel[1]];
    const p = o.p, st = p && p.st;
    const flash = !!(o.flash || (p && p.hurtT > 0));
    const src = tinted(S, flash ? 'F' : st && st.ice > 0 ? 'I' : st && st.poison > 0 ? 'P' : '');
    const x = Math.round(o.x), y = Math.round(o.y), f = o.face < 0 ? -1 : 1;
    const sh = J.bong || 9;
    c.save();
    if (o.alpha != null) c.globalAlpha = c.globalAlpha * o.alpha;
    c.imageSmoothingEnabled = false;
    if (p && p.dead && sel[1] >= an.khung.length - 2) A.ellipse(c, x - f * Math.round(J.cao * 0.4), y, Math.round(J.cao * 0.45), 2, 'rgba(0,0,0,0.3)');
    else A.ellipse(c, x, y, sh, 2, 'rgba(0,0,0,0.3)');
    c.translate(x + (f < 0 ? 1 : 0), y);
    c.scale(f, 1);
    try {
      const hx = fr.tay[0] - fr.chan[0], hy = fr.tay[1] - fr.chan[1];
      const ang = fr.goc + (an.nghi && J.goc_nghi ? J.goc_nghi[wt] || 0 : 0);
      const weapon = () => {
        if (wt === 'none' || fr.an) return;
        const WA = G.weaponArt;
        if (WA && typeof WA.draw === 'function') {
          // Quy ước gọi (tạm đặt, sửa ở đây nếu G.weaponArt khác): draw(c, vũ khí, x tay, y tay, góc độ, { pull, look, layer, face }).
          // Trả về false nghĩa là không vẽ được, khi đó dùng A.weapon.
          try { if (WA.draw(c, o.weapon, hx, hy, ang, { pull: fr.keo, look, layer: fr.lop, face: f }) !== false) return; } catch (e) { /* dùng A.weapon */ }
        }
        A.weapon(c, look, hx, hy, ang, fr.keo);
      };
      if (fr.lop === 'sau') weapon();
      c.drawImage(src, fr.o[0], fr.o[1], fr.o[2], fr.o[3], -fr.chan[0], -fr.chan[1], fr.o[2], fr.o[3]);
      if (fr.lop !== 'sau') weapon();
      if (o.gong) {
        // hào quang lúc Gồng: vệt sáng bốc lên quanh người (giống hero_art.js)
        const t = (o.t != null ? o.t : G.time) || 0, hw = sh + 3;
        for (let i = 0; i < 6; i++) {
          const ph = (t * 1.6 + i * 0.37) % 1, sx = Math.round(-hw + (i * 2 * hw) / 5) + (i % 2), sy = Math.round(-4 - ph * 38);
          c.fillStyle = i % 2 ? '#fff3b0' : '#ffd27a';
          c.globalAlpha = (o.alpha != null ? o.alpha : 1) * (1 - ph) * 0.9;
          c.fillRect(sx, sy, 1, 4 + (i % 3));
        }
      }
    } finally { c.restore(); }
  }

  let warned = false;
  A.hero = function (c, o) {
    const S = SHEETS[o.key] || load(o.key);
    if (S.state !== 'ready') return prev.call(A, c, o);
    try { draw(c, o, S); } catch (e) {
      S.state = 'none';
      if (!warned) { warned = true; if (window.console) console.warn('hero_sprite: lỗi, dùng lại hình cũ', e); }
      return prev.call(A, c, o);
    }
  };

  // Cho công cụ kiểm tra và phiên điều phối.
  G.heroSprite = {
    sheets: SHEETS,
    has: (key) => !!(SHEETS[key] && SHEETS[key].state === 'ready'),
    state: (key) => (SHEETS[key] ? SHEETS[key].state : 'chưa thử'),
    reload: (key) => { delete SHEETS[key]; return load(key); },
    old: prev,
  };
})();
