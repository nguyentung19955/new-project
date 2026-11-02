// DEMO "Thủ thành ghép tướng" — khung cố định, vòng lặp, điều khiển (chạm/kéo), các màn
'use strict';
(function () {
  const C = CAU_HINH, G = GAME, R = RENDER;
  const $ = (s) => document.querySelector(s);
  const wrap = $('#wrap'), cv = $('#cv'), ctx = cv.getContext('2d');
  let S = null, A = null, tocDo = 1, dung = false, tua = 1, keo = null, chon = [], boCu = null, thang = false;
  // giao diện kỹ năng chủ động (VÀNG): menu = ô đang mở hàng nút kỹ năng; chon = { i, k, ten, ds } đang chọn ô cho kỹ năng k
  const UI = { menu: null, chon: null };
  const KY_LUC = 'neon-grid.best', KY_CHE = 'neon-grid.mode';
  // chế độ chơi: 'coop' (mặc định, đồng đội AI, 70 wave) hoặc 'pvp' (AI MIRROR như cũ); nhớ lựa chọn cuối
  let che = 'coop';
  try { const v = localStorage.getItem(KY_CHE); if (v === 'pvp' || v === 'coop') che = v; } catch (e) { /* không đọc được */ }
  let cheTran = che;   // chế độ của trận đang chơi

  // ---- KHUNG: luôn LẤP ĐẦY CHIỀU RỘNG (scale = rộng/390), chiều cao logic co giãn (H = cao/scale), trừ vùng an toàn (tai thỏ / thanh home) ----
  // bàn trên neo trên, bàn người chơi + thẻ + SUMMON neo dưới, khoảng giữa co giãn (GAME.boCuc). Màn quá thấp (H < H_MIN): khoảng giữa đã thu hết
  // → mới giảm scale (hai bên có dải nền mỏng). Màn quá cao (H > H_MAX): giữ H_MAX, căn giữa dọc.
  const doSafe = document.createElement('div'); doSafe.id = 'do-safe'; document.body.appendChild(doSafe);
  let FR = { x0: 0, y0: 0, s: 1 }, K = 1;
  const toFrame = (x, y) => [(x - FR.x0) / FR.s, (y - FR.y0) / FR.s];
  const fromFrame = (x, y) => [FR.x0 + x * FR.s, FR.y0 + y * FR.s];
  function resize() {
    const vv = window.visualViewport;
    const vw = innerWidth, vh = innerHeight;
    const cs = getComputedStyle(doSafe);
    const st = parseFloat(cs.paddingTop) || 0, sr = parseFloat(cs.paddingRight) || 0, sb = parseFloat(cs.paddingBottom) || 0, sl = parseFloat(cs.paddingLeft) || 0;
    const aw = Math.max(100, vw - sl - sr), ah = Math.max(100, vh - st - sb);
    let s = aw / C.W, Hl = ah / s;
    if (Hl < C.H_MIN) { s = ah / C.H_MIN; Hl = C.H_MIN; }
    Hl = Math.round(Math.min(C.H_MAX, Hl));
    if (Hl !== C.H) G.boCuc(Hl);
    const x0 = sl + (aw - C.W * s) / 2, y0 = st + (ah - Hl * s) / 2;
    wrap.style.left = x0 + 'px'; wrap.style.top = y0 + 'px';
    wrap.style.width = C.W + 'px'; wrap.style.height = Hl + 'px';
    wrap.style.transform = `scale(${s})`;
    cv.style.height = Hl + 'px';
    $('#duoi').style.top = C.DUOI_Y + 'px';
    $('#nut-co').style.top = (C.THANH_Y + C.THANH_H / 2 - 18) + 'px';   // cờ đầu hàng: giữa thanh giữa
    FR = { x0, y0, s };
    K = Math.min(4, (window.devicePixelRatio || 1) * s);
    cv.width = Math.round(C.W * K); cv.height = Math.round(Hl * K);
    if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
    if (vv && Math.abs((vv.scale || 1) - 1) > 0.02) return;
  }
  let rt = [];
  const reflow = () => { resize(); rt.forEach(clearTimeout); rt = [120, 400].map((ms) => setTimeout(resize, ms)); };
  addEventListener('resize', reflow); addEventListener('orientationchange', reflow);
  if (window.visualViewport) visualViewport.addEventListener('resize', reflow);
  addEventListener('scroll', () => { if (scrollX || scrollY) scrollTo(0, 0); }, { passive: true });
  // chặn phóng to / cuộn như game chính
  for (const t of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(t, (e) => e.preventDefault(), { passive: false });
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1 || !e.target.closest('.cuon')) e.preventDefault(); }, { passive: false });
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => { const n = Date.now(); if (n - lastTouch < 320) e.preventDefault(); lastTouch = n; }, { passive: false });
  document.addEventListener('dblclick', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  resize();

  // ---- ảnh nhỏ (chân dung) cho thẻ ----
  const veChanDung = R.veChanDung;
  const mauHanh = (el, h) => { el.style.setProperty('--h', h.mau); el.style.setProperty('--hg', h.mau + '55'); };
  // màu theo BẬC tướng (khung thẻ, viền chân dung, tên) — 5 bậc TRẮNG/LAM/TÍM/VÀNG/ĐỎ
  const mauBac = (el, id) => { const b = BAC[TUONG[id].bac] || BAC.trang; mauHanh(el, b); el.dataset.bac = TUONG[id].bac; };

  // ---- màn chọn bộ ----
  function dungChon() {
    const l = $('#chon-luoi'); l.innerHTML = '';
    for (const id of TUONG_IDS) {
      const t = TUONG[id], h = HANH[t.hanh], bc = BAC[t.bac] || BAC.trang;
      const b = document.createElement('button');
      b.className = 'ct'; b.dataset.id = id;
      mauBac(b, id);
      const dmg = Math.min(1, t.dmg / 20), toc = Math.min(1, (1 / t.cd) / 1.25);
      b.innerHTML = `<div class="ct-khung"><div class="ct-trong">
          <canvas class="ct-anh"></canvas>
          <div class="ct-dau"><span class="ct-he"><i></i>${bc.ten}</span></div>
          <span class="ct-so"><b></b></span>
          <div class="ct-than">
            <div class="ct-ten">${t.ten}</div>
            <div class="ct-chuc">${t.chuc}</div>
            <div class="ct-cs"><span>DMG</span><i><u style="width:${Math.round(dmg * 100)}%"></u></i></div>
            <div class="ct-cs"><span>RATE</span><i><u style="width:${Math.round(toc * 100)}%"></u></i></div>
            <div class="ct-k"><span class="chip">${t.kieu.toUpperCase()}</span></div>
            <div class="ct-mo">${t.mo}</div>
          </div>
        </div></div>`;
      R.veThe(b.querySelector('canvas'), id, 88, 132);
      b.onclick = () => { const k = chon.indexOf(id); if (k >= 0) chon.splice(k, 1); else if (chon.length < 5) chon.push(id); capChon(); };
      l.appendChild(b);
    }
    capChon();
  }
  const MEO = {
    coop: 'Summon random heroes · drag a hero onto the <b>same hero of the same rank</b> to merge. Hostiles walk the top lane, then <b>your</b> lane below — hold out with your <b>ALLY</b> for <b>70 waves</b>.',
    pvp: 'Summon random heroes · drag a hero onto the <b>same hero of the same rank</b> to merge into a higher rank. Outlast the <b>AI MIRROR</b> board above.',
  };
  // ---- Archfiend (ô thứ 6): chọn 1 trong ARCHFIEND, nhớ lựa chọn cuối ----
  const KY_AF = 'neon-grid.af';
  let afChon = AF_IDS[0];
  try { const v = localStorage.getItem(KY_AF); if (ARCHFIEND[v]) afChon = v; } catch (e) { /* không đọc được */ }
  function dungAF() {
    const l = $('#chon-af'); l.innerHTML = '';
    for (const id of AF_IDS) {
      const a = ARCHFIEND[id], b = document.createElement('button');
      b.className = 'afc'; b.dataset.act = 'afchon'; b.dataset.af = id; b.style.setProperty('--h', a.mau);
      b.innerHTML = `<canvas></canvas><span><b>${a.ten}</b><em>${a.mo}</em></span>`;
      R.veAF(b.querySelector('canvas'), id, 30);
      l.appendChild(b);
    }
  }
  // ---- SKIN BÀN (kiểu DCDW: mỗi người chơi một skin bàn riêng): chọn 1 trong SKIN, nhớ lựa chọn cuối; bàn trên lấy ngẫu nhiên skin khác ----
  const KY_SKIN = 'neon-grid.skin';
  let skinChon = 'da';
  try { const v = localStorage.getItem(KY_SKIN); if (SKIN[v]) skinChon = v; } catch (e) { /* không đọc được */ }
  G.datSkin(skinChon, SKIN_IDS.find((k) => k !== skinChon));
  function dungSkin() {
    const l = $('#chon-skin'); l.innerHTML = '';
    for (const k of SKIN_IDS) {
      const b = document.createElement('button');
      b.className = 'skc'; b.dataset.act = 'skin'; b.dataset.skin = k;
      b.innerHTML = `<img src="assets/v3/skin_${k}.png" alt=""><b>${SKIN[k].ten}</b>`;
      l.appendChild(b);
    }
  }
  function capChe() {
    document.querySelectorAll('.afc').forEach((b) => b.classList.toggle('bat', b.dataset.af === afChon));
    document.querySelectorAll('.che').forEach((b) => b.classList.toggle('bat', b.dataset.che === che));
    document.querySelectorAll('.skc').forEach((b) => b.classList.toggle('bat', b.dataset.skin === skinChon));
    $('#chon-meo').innerHTML = MEO[che];
  }
  function capChon() {
    capChe();
    document.querySelectorAll('.ct').forEach((b) => { const k = chon.indexOf(b.dataset.id); b.classList.toggle('chon', k >= 0); b.querySelector('.ct-so b').textContent = k >= 0 ? k + 1 : ''; });
    $('#chon-dem').textContent = chon.length + '/5';
    $('#nut-vao').disabled = chon.length !== 5;
  }

  // ---- trận ----
  function batDau(deck) {
    boCu = deck.slice(); cheTran = che;
    { const khac = SKIN_IDS.filter((k) => k !== skinChon); G.datSkin(skinChon, khac[Math.floor(Math.random() * khac.length)] || skinChon); $('#duoi').style.top = C.DUOI_Y + 'px'; $('#nut-co').style.top = (C.THANH_Y + C.THANH_H / 2 - 18) + 'px'; }
    if (cheTran === 'coop') ({ S, A } = G.moiCoop(deck, BO_AI, afChon, AF_AI));
    else { S = G.moi(deck, false, null, afChon); A = G.moi(BO_AI, true, S, AF_AI); }
    dung = false; keo = null; thang = false; UI.menu = null; UI.chon = null;
    $('#tb-mang').hidden = cheTran !== 'coop'; $('.tb-giua').classList.toggle('coop', cheTran === 'coop'); $('.tb-wave').classList.toggle('coop', cheTran === 'coop');
    $('#nut-co').hidden = cheTran === 'coop';   // PVP: cờ đầu hàng đỏ bên phải thanh giữa
    $('#chon').hidden = true; $('#ketqua').hidden = true; $('#dung').hidden = true;
    $('#top').hidden = false; $('#duoi').hidden = false;
    // 6 ô đội AI trên TOP HUD (5 tướng + leader)
    const ai = $('#tb-ai'); ai.innerHTML = '';
    for (const id of BO_AI) { const o = document.createElement('div'); o.className = 'ai-o'; mauBac(o, id); o.innerHTML = '<canvas></canvas>'; R.veChanDung(o.querySelector('canvas'), id, 22); ai.appendChild(o); }   // icon đội AI 22px (P1.3: 20–24)
    { const o = document.createElement('div'); o.className = 'ai-o ld'; o.style.setProperty('--h', ARCHFIEND[AF_AI].mau); o.title = ARCHFIEND[AF_AI].ten; o.innerHTML = '<canvas></canvas>'; R.veAF(o.querySelector('canvas'), AF_AI, 22); ai.appendChild(o); }   // ô 6: Archfiend của AI
    { const b = $('#the-af'), a = ARCHFIEND[afChon]; b.style.setProperty('--h', a.mau); b.querySelector('.af-ten').textContent = a.ten; b.title = a.mo; R.veAF(b.querySelector('canvas'), afChon, 66); }
    const bo = $('#bo-bac'); bo.innerHTML = '';
    deck.forEach((id, n) => {
      const t = TUONG[id], h = HANH[t.hanh];
      const b = document.createElement('button');
      b.className = 'the'; b.dataset.act = 'bac'; b.dataset.id = id; b.title = `${t.ten} — power up`;
      mauBac(b, id);
      b.style.left = (6 + n * 61) + 'px';
      b.innerHTML = `<canvas></canvas><span class="so-ban" hidden></span><span class="them" hidden></span><span class="bac"></span><span class="ten">${t.ten}</span><span class="gia"></span>`;
      R.veThe(b.querySelector('canvas'), id, 54, 62);
      bo.appendChild(b);
    });
    capNhat(true);
  }
  let cu = {};
  function capNhat(ep) {
    if (!S) return;
    const set = (k, v, f) => { if (ep || cu[k] !== v) { cu[k] = v; f(v); } };
    const coop = !!S.coop;
    set('dot', S.dot + '|' + coop, () => ($('#tb-dot').innerHTML = Math.max(1, S.dot) + (coop ? `<small>/${COOP.DOT_MAX}</small>` : '')));
    const bossDang = S.boss || (coop && A && A.boss);
    const den = Math.ceil(Math.max(1, S.dot + (S.dot % 10 === 0 && bossDang ? 0 : 0.0001)) / 10) * 10;
    const cuoi = coop && den >= COOP.DOT_MAX;   // co-op: trùm cuối ở wave 70
    set('boss', (bossDang ? 'dang' : den - S.dot) + '|' + cuoi, () => {
      const v = bossDang ? 'dang' : den - S.dot, e = $('#tb-boss'), ten = cuoi ? 'FINAL BOSS' : 'BOSS';
      e.textContent = v === 'dang' ? `⚠ ${ten} LIVE` : v <= 0 ? `${ten} THIS WAVE` : `${ten} IN ${v} WAVE${v > 1 ? 'S' : ''}`;
      e.classList.toggle('dang', v === 'dang'); e.classList.toggle('gan', v !== 'dang' && v <= 2);   // 2 wave cuối: đổi màu + nhịp chậm
    });
    set('quai', coop ? S.quai.length + A.quai.length + A.conSinh : S.quai.length + S.conSinh, (v) => ($('#tb-quai b').textContent = v));
    if (coop) set('mang', S.coop.mang, (v) => { const b = $('#tb-mang b'); b.textContent = `${v}/${S.coop.max}`; b.classList.toggle('thap', v <= 3); });
    const lk = Math.floor(S.lk);
    set('lk', lk, (v) => { $('#lk').textContent = v; $('#lk-hop b').classList.toggle('dai', v >= 10000); });
    const g = G.giaTrieu(S), full = !G.trong(S).length;
    set('trieu', g + '|' + (lk >= g) + full, () => { $('#gia-trieu').textContent = full ? 'GRID FULL' : g; $('#nut-trieu .tr-gia .ic-e').hidden = full; $('#nut-trieu').classList.toggle('thieu', lk < g || full); });
    document.querySelectorAll('.the').forEach((b) => {
      const id = b.dataset.id, bac = S.bac[id], gb = G.giaBac(S, id), mx = bac >= C.BAC_MAX;
      // số bản đang có trên bàn (góc trên trái) + "+N" = số cấp nâng được ngay với mana hiện có; MAX khi đã tối đa
      const soBan = S.o.reduce((n, v) => n + (v && v.id === id ? 1 : 0), 0);
      let nN = 0; for (let tong = 0; bac + nN < C.BAC_MAX && (tong += C.giaBac(bac + nN)) <= lk;) nN++;
      set('b' + id, bac + '|' + (lk >= gb) + '|' + soBan + '|' + nN, () => {
        b.querySelector('.bac').textContent = 'LV ' + (bac + 1);
        b.querySelector('.gia').innerHTML = mx ? 'MAX' : `<i class="ic-e"></i>${gb}`;
        const sb = b.querySelector('.so-ban'); sb.hidden = !soBan; sb.textContent = soBan;
        const th = b.querySelector('.them'); th.hidden = !mx && !nN; th.textContent = mx ? '+MAX' : '+' + nN; th.classList.toggle('max', mx);
        b.classList.toggle('thieu', !mx && lk < gb); b.classList.toggle('max', mx);
      });
    });
    if (S.af) {   // thẻ Archfiend: giá (tăng sau mỗi lần dùng) + vòng hồi chiêu
      const a = S.af, cfg = ARCHFIEND[a.id], ga = G.giaAF(S), p = a.cdT > 0 ? a.cdT / cfg.cd : 0;
      set('af', ga + '|' + (lk >= ga) + '|' + Math.ceil(a.cdT) + '|' + (a.T > 0) + '|' + Math.round(p * 60), () => {
        const b = $('#the-af');
        b.querySelector('.af-gia b').textContent = ga;
        b.querySelector('.af-cd').textContent = a.cdT > 0 ? Math.ceil(a.cdT) : '';
        b.style.setProperty('--p', p);
        b.classList.toggle('cho', a.cdT > 0); b.classList.toggle('thieu', lk < ga); b.classList.toggle('dang', a.T > 0);
      });
    }
  }
  function ketThuc() {
    if (S.coop) return ketThucCoop();
    $('#kq-sat').hidden = true;
    const dot = S.dot;
    const ten = $('#kq-ten'), bang = $('#ketqua .bang');
    ten.textContent = thang ? 'VICTORY' : 'CORE DESTROYED'; ten.dataset.t = ten.textContent;
    bang.classList.toggle('do', !thang); bang.classList.toggle('thang', thang);
    let kl = 0; try { kl = +localStorage.getItem(KY_LUC) || 0; if (dot > kl) localStorage.setItem(KY_LUC, dot); } catch (e) { /* không lưu được */ }
    $('#kq-dot').textContent = 'WAVE ' + dot;
    $('#kq-phu').textContent = `${thang ? 'AI MIRROR core destroyed first · ' : ''}${S.giet} hostiles destroyed · Best: wave ${Math.max(kl, dot)}${dot > kl && kl ? ' — NEW RECORD' : ''}`;
    $('#ketqua').hidden = false;
  }
  function ketThucCoop() {
    const co = S.coop, dot = co.thang ? COOP.DOT_MAX : S.dot, kt = KY_LUC + '.coop';
    thang = co.thang;
    const ten = $('#kq-ten'), bang = $('#ketqua .bang');
    ten.textContent = thang ? 'VICTORY' : 'CORE DESTROYED'; ten.dataset.t = ten.textContent;
    bang.classList.toggle('do', !thang); bang.classList.toggle('thang', thang);
    let kl = 0; try { kl = +localStorage.getItem(kt) || 0; if (dot > kl) localStorage.setItem(kt, dot); } catch (e) { /* không lưu được */ }
    $('#kq-dot').textContent = `WAVE ${dot}/${COOP.DOT_MAX}`;
    $('#kq-phu').textContent = `${thang ? `Cleared all ${COOP.DOT_MAX} waves · ` : ''}${S.giet + A.giet} hostiles destroyed · Best: wave ${Math.max(kl, dot)}${dot > kl && kl ? ' — NEW RECORD' : ''}`;
    // sát thương từng tướng của người chơi (theo loại tướng trong bộ) + tổng của đồng đội
    const tong = (tk) => Object.values(tk).reduce((a, b) => a + b, 0);
    const ds = S.deck.map((id) => [id, S.tk[id] || 0]).sort((a, b) => b[1] - a[1]), mx = Math.max(1, ds[0][1]);
    const so = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : Math.round(n) + '');
    const ks = $('#kq-sat');
    ks.innerHTML = '<div class="ks-ten">YOUR DAMAGE</div>' + ds.map(([id, n]) => `<div class="ks" style="--h:${HANH[TUONG[id].hanh].mau}"><span>${TUONG[id].ten}</span><i><u style="width:${Math.round(n / mx * 100)}%"></u></i><em>${so(n)}</em></div>`).join('')
      + `<div class="ks-ten" style="margin-top:4px">YOU ${so(tong(S.tk))} · ALLY ${so(tong(A.tk))}</div>`;
    ks.hidden = false;
    $('#ketqua').hidden = false;
  }
  function datDung(v) {
    dung = v; $('#dung').hidden = !v;
    if (v && S) $('#dung-bo').innerHTML = S.deck.map((id) => `${TUONG[id].ten} <b>LV ${S.bac[id] + 1}</b>`).join(' · ') + (S.af ? ` · <b>${ARCHFIEND[S.af.id].ten}</b>` : '');
  }

  // ---- nút ----
  wrap.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    const a = b.dataset.act;
    if (a === 'vao') batDau(chon);
    else if (a === 'che') { che = b.dataset.che === 'pvp' ? 'pvp' : 'coop'; try { localStorage.setItem(KY_CHE, che); } catch (er) { /* không lưu được */ } capChe(); }
    else if (a === 'ngaunhien') { chon = TUONG_IDS.slice().sort(() => Math.random() - 0.5).slice(0, 5); capChon(); }
    else if (a === 'trieu' && S && !dung && !S.het) { if (G.trieuHoi(S) < 0) R.baoThieu(G.trong(S).length ? 'Not enough mana.' : 'Board is full.'); capNhat(); }
    else if (a === 'skin') { skinChon = SKIN[b.dataset.skin] ? b.dataset.skin : 'da'; try { localStorage.setItem(KY_SKIN, skinChon); } catch (er) { /* không lưu được */ } G.datSkin(skinChon, SKIN_IDS.find((k) => k !== skinChon)); capChe(); }
    else if (a === 'afchon') { afChon = b.dataset.af; try { localStorage.setItem(KY_AF, afChon); } catch (er) { /* không lưu được */ } capChe(); }
    else if (a === 'af' && S && !dung && !S.het) { if (!G.dungAF(S) && S.af) R.baoThieu(S.af.cdT > 0 ? 'Archfiend is recharging.' : 'Not enough mana.'); capNhat(); }
    else if (a === 'bac' && S && !dung && !S.het) { if (G.lenBac(S, b.dataset.id)) { b.classList.remove('len'); void b.offsetWidth; b.classList.add('len'); } else if (S.bac[b.dataset.id] < C.BAC_MAX) R.baoThieu(); capNhat(); }
    else if (a === 'tocdo') { tocDo = tocDo >= 3 ? 1 : tocDo + 1; b.textContent = tocDo + 'x'; b.classList.toggle('bat', tocDo > 1); }   // 1x → 2x → 3x (3x để test nhanh)
    else if (a === 'dung' && S && !S.het) datDung(true);
    else if (a === 'tiep') datDung(false);
    else if (a === 'bo') { datDung(false); S.het = true; ketThuc(); }
    else if (a === 'choilai') batDau(boCu);
    else if (a === 'doibo') { S = null; A = null; $('#ketqua').hidden = true; $('#top').hidden = true; $('#duoi').hidden = true; $('#nut-co').hidden = true; $('#chon').hidden = false; chon = boCu.slice(); capChon(); }
  });

  // nút SUMMON: trạng thái nhấn (lún) — :active không chắc chạy trên mobile nên thêm lớp .ep
  const nutTrieu = $('#nut-trieu');
  nutTrieu.addEventListener('pointerdown', () => nutTrieu.classList.add('ep'));
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) nutTrieu.addEventListener(ev, () => nutTrieu.classList.remove('ep'));

  // ---- kéo tướng để gộp ----
  // hitbox ô theo toạ độ logic của bàn người chơi (ô 46×45, nới 1px vào khe)
  const oTai = (x, y) => { for (let i = 0; i < C.COT * C.HANG; i++) { const [ox, oy] = G.oXY(S, i); if (x >= ox - 1 && x < ox + C.O + 1 && y >= oy - 1.5 && y < oy + C.OH + 1.5) return i; } return -1; };
  const trongHop = (r, x, y) => x >= r.x - 2 && x < r.x + r.w + 2 && y >= r.y - 2 && y < r.y + r.h + 2;
  cv.addEventListener('pointerdown', (e) => {
    if (!S || S.het || dung) return;
    const [x, y] = toFrame(e.clientX, e.clientY), i = oTai(x, y);
    // 1) PACKET SWAP: chạm chân dung / REROLL
    for (const r of R.hopChonGop(S)) if (trongHop(r, x, y)) { G.chonKetQua(S, r.n); return; }
    // 2) hàng nút kỹ năng đang mở: chạm nút sẵn sàng → chế độ chọn ô
    if (UI.menu != null) {
      const r = R.hopChu(S, UI.menu).find((h) => trongHop(h, x, y)), i0 = UI.menu; UI.menu = null;
      if (r) { if (r.san) { const m = G.chuDong(S, i0).find((d) => d.cf.k === r.k); UI.chon = { i: i0, k: r.k, ten: r.ten, ds: G.oHopLe(S, i0, m.cf), uid: S.o[i0].uid }; } return; }
    }
    // 3) đang chọn ô: chạm ô hợp lệ → dùng kỹ năng; chạm chỗ khác → huỷ
    if (UI.chon) { const ch = UI.chon; UI.chon = null; if (i >= 0 && ch.ds.includes(i)) { G.dungChuDong(S, ch.i, ch.k, i); capNhat(); } return; }
    if (i < 0 || !S.o[i] || S.o[i].da) return;
    keo = { i, x, y, x0: x, y0: y, id: e.pointerId };
    try { cv.setPointerCapture(e.pointerId); } catch (er) { /* bỏ qua */ }
  });
  cv.addEventListener('pointermove', (e) => { if (!keo || e.pointerId !== keo.id) return; [keo.x, keo.y] = toFrame(e.clientX, e.clientY); });
  const tha = (e) => {
    if (!keo || e.pointerId !== keo.id) return;
    const [x, y] = toFrame(e.clientX, e.clientY), j = oTai(x, y);
    const cham = j === keo.i && Math.hypot(x - keo.x0, y - keo.y0) < 8;   // CHẠM (không kéo) tướng có kỹ năng chủ động → mở hàng nút
    if (cham && S && G.chuDong(S, j).length) UI.menu = j;
    else if (S && j >= 0 && S.o[keo.i] === S.o[keo.i]) G.tha(S, keo.i, j);
    keo = null; capNhat();
  };
  cv.addEventListener('pointerup', tha); cv.addEventListener('pointercancel', () => (keo = null));

  // ---- vòng lặp ----
  let last = performance.now(), dem = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    R.doFps(now - last);
    let dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (S && !S.het && !dung) {
      let t = dt * tocDo * tua;
      while (t > 0) {
        const b = Math.min(1 / 60, t); G.buoc(S, b); G.buoc(A, b); t -= b;
        if (S.coop) G.botCoop(A, b);   // co-op: đồng đội AI; không có thắng do AI chết — thua khi hết mạng chung, thắng khi qua wave 70
        else { G.botAI(A, b); if (A.het && !S.het) { thang = true; S.het = true; } }   // PVP: AI hết mạng trước → thắng
        if (S.het) break;
      }
      if (keo && !S.o[keo.i]) keo = null;   // tướng bị boss cuốn đi khi đang kéo
      if (UI.chon && (!S.o[UI.chon.i] || S.o[UI.chon.i].uid !== UI.chon.uid)) UI.chon = null;   // tướng đã bị ghép / dời
      if (UI.menu != null && !S.o[UI.menu]) UI.menu = null;
      if (S.het) ketThuc();
    }
    if (++dem % 3 === 0 || !S) capNhat();
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    R.ve(ctx, S, now / 1000, K, keo, A, UI);
  }
  dungAF(); dungSkin(); dungChon();
  requestAnimationFrame(loop);

  // móc cho test
  window.DEMO = {
    get S() { return S; }, get A() { return A; }, G, batDau, fromFrame, toFrame,
    oClient: (i) => { const [x, y] = G.oTam(S, i); return fromFrame(x, y); },
    tua: (n) => (tua = n), get dung() { return dung; }, get thang() { return thang; }, UI,
  };
})();
