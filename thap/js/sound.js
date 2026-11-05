// TURRET MERGE — BỘ ÂM THANH CYBER / ROBOT / HIỆN ĐẠI, tổng hợp 100% bằng Web Audio (không file mẫu, không bản quyền).
// Kỹ thuật: FM/AM, ring-mod, ồn lọc, bit-crush (WaveShaper bậc thang), cộng hưởng kim loại, servo, glitch, sub-bass,
// sidechain (nhạc "thở" theo trống kick + né khi có tiếng nổ lớn), stereo, đường bao ngắn (luôn có ramp → không lách tách).
// Trộn: bus SFX + bus NHẠC → limiter (DynamicsCompressor) → loa. Mỗi âm có giới hạn tần suất + số giọng đồng thời,
// có trần giọng toàn cục; mọi node tự ngắt kết nối khi âm kết thúc (onended) → không rò node.
// Nhạc nền: bộ tuần tự synthwave/electro (bass, arp, trống, pad) 3 mức cường độ: 0 menu · 1 trận · 2 wave TRÙM.
// Bật/tắt NHẠC và SFX riêng, lưu localStorage. Mở khoá âm thanh trên điện thoại ở lần chạm đầu.
'use strict';
const SND = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  const docLS = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v === '1'; } catch (e) { return d; } };
  const ghiLS = (k, v) => { try { localStorage.setItem(k, v ? '1' : '0'); } catch (e) { } };
  let ac = null, bus = null, offline = false, lech = 0; // lech: dời thời điểm (chỉ dùng khi xuất demo)
  let batSfx = docLS('turret_sfx', true), batNhac = docLS('turret_nhac', true);
  const VOL = { master: 0.92, sfx: 0.6, nhac: 0.3 };
  const TK = { node: 0, giong: 0, tao: 0, bo: 0, nodeMax: 0, giongMax: 0 }; // thống kê (kiểm thử)
  const R = Math.random;
  const vr = (x, p) => x * (1 + (R() * 2 - 1) * p);   // biến thiên cao độ / âm lượng
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // ---------- bus của một context (thật hoặc Offline để xuất file demo) ----------
  function taoBus(c, day) {
    const B = { c };
    B.out = c.createGain(); B.out.gain.value = VOL.master; B.out.connect(c.destination);
    B.lim = c.createDynamicsCompressor();
    B.lim.threshold.value = -9; B.lim.knee.value = 4; B.lim.ratio.value = 14; B.lim.attack.value = 0.002; B.lim.release.value = 0.16;
    B.lim.connect(B.out);
    B.sfx = c.createGain(); B.sfx.gain.value = (day || batSfx) ? VOL.sfx : 0; B.sfx.connect(B.lim);
    B.nhac = c.createGain(); B.nhac.gain.value = (day || batNhac) ? VOL.nhac : 0;
    B.duck = c.createGain(); B.nhac.connect(B.duck); B.duck.connect(B.lim);
    // bit-crush dùng chung: WaveShaper bậc thang (≈4 bit) → hạt "số" thô
    B.crush = c.createWaveShaper(); const n = 1024, cv = new Float32Array(n), buc = 7;
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; cv[i] = Math.round(x * buc) / buc; }
    B.crush.curve = cv; const cg = c.createGain(); cg.gain.value = 0.7; B.crush.connect(cg); cg.connect(B.sfx);
    B.dly = taoDelay(c, B.sfx, 0.19, 0.29, 0.34);           // vang ping-pong cho SFX
    B.noise = c.createBuffer(1, c.sampleRate, c.sampleRate); // 1 s ồn trắng dùng chung
    const d = B.noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1;
    B.pan = !!c.createStereoPanner;
    // nhạc: bơm sidechain (pad/arp/bass) + bộ lọc pad có LFO + vang riêng
    B.mPump = c.createGain(); B.mPump.connect(B.nhac);
    B.padF = c.createBiquadFilter(); B.padF.type = 'lowpass'; B.padF.frequency.value = 900; B.padF.Q.value = 2; B.padF.connect(B.mPump);
    B.padL = B.pan ? c.createStereoPanner() : c.createGain(); B.padR = B.pan ? c.createStereoPanner() : c.createGain();
    if (B.pan) { B.padL.pan.value = -0.55; B.padR.pan.value = 0.55; }
    B.padL.connect(B.padF); B.padR.connect(B.padF);
    B.mDly = taoDelay(c, B.nhac, 0.32, 0.4, 0.3);
    return B;
  }
  function taoDelay(c, dich, tL, tR, fb) {
    const vao = c.createGain(), L = c.createDelay(1), Rr = c.createDelay(1), g = c.createGain(), lp = c.createBiquadFilter(), m = c.createChannelMerger(2), wet = c.createGain();
    L.delayTime.value = tL; Rr.delayTime.value = tR; g.gain.value = fb; lp.type = 'lowpass'; lp.frequency.value = 3200; wet.gain.value = 0.55;
    vao.connect(L); L.connect(Rr); Rr.connect(lp); lp.connect(g); g.connect(L);
    L.connect(m, 0, 0); Rr.connect(m, 0, 1); m.connect(wet); wet.connect(dich);
    return vao;
  }

  // ---------- GIỌNG (voice): giới hạn tần suất + số giọng, tự dọn node ----------
  // [khoảng cách tối thiểu ms, số giọng đồng thời tối đa]
  const LIM = {
    nut: [35, 2], trieu: [70, 2], dat: [45, 3], ghep: [60, 3], nang: [80, 2], thucTinh: [400, 1],
    phao: [85, 3], lien: [52, 3], tia: [80, 3], rail: [140, 2], set: [85, 3], bang: [100, 3], doc: [110, 2], nap: [110, 2],
    no: [65, 4], mana: [180, 2], hoTro: [120, 1], sam: [300, 1], hoden: [500, 1], mv: [300, 1],
    trung: [90, 2], crit: [85, 2], chet: [45, 3], chetTrum: [500, 1], canhBao: [1200, 1], bao: [400, 2], chieuTrum: [300, 2],
    lot: [250, 1], wave: [800, 1], ketThuc: [1500, 1], _: [40, 3],
  };
  // hệ số âm lượng từng âm (cân bằng theo đo đỉnh khi xuất demo)
  const VO = { nut: 6, trieu: 4.5, dat: 0.9, nang: 3, thucTinh: 1.1, phao: 1.6, lien: 2.2, tia: 0.65, rail: 0.65, set: 1.5, bang: 4.5, doc: 2.5, nap: 4,
    no: 1.1, mana: 5, hoTro: 3.2, mv: 0.7, trung: 6.5, crit: 5.5, chet: 3, chetTrum: 2.4, canhBao: 1.35, bao: 1.8, chieuTrum: 2, lot: 0.4, ketThuc: 1.1 };
  const lan = {}, dang = {};
  function V(k, pri) {
    if (!bus) return null;
    if (!offline) {
      if (!batSfx || ac.state !== 'running') return null;
      const L = LIM[k] || LIM._, n = performance.now();
      if (lan[k] && n - lan[k] < L[0]) return null;
      if ((dang[k] || 0) >= L[1] || TK.giong >= 40 || (TK.giong >= 26 && (pri || 1) < 2)) { TK.bo++; return null; }
      lan[k] = n;
    }
    return moV(k, bus.sfx, true, 0.32);
  }
  function moV(k, dich, dem, panRong) {
    const c = bus.c, v = { c, k, t: c.currentTime + 0.005 + lech, ds: [], src: [], het: 0, xong: false, dem: dem && !offline };
    v.out = nd(v, c.createGain()); v.out.gain.value = VO[k] || 1;
    if (panRong && bus.pan) { const p = nd(v, c.createStereoPanner()); p.pan.value = (R() * 2 - 1) * panRong; v.out.connect(p); p.connect(dich); }
    else v.out.connect(dich);
    if (v.dem) { dang[k] = (dang[k] || 0) + 1; TK.giong++; if (TK.giong > TK.giongMax) TK.giongMax = TK.giong; }
    return v;
  }
  function nd(v, x) { v.ds.push(x); if (!offline) { TK.node++; TK.tao++; if (TK.node > TK.nodeMax) TK.nodeMax = TK.node; } return x; }
  function fin(v) {
    if (!v.src.length) { don(v); return; }
    let s = v.src[0]; for (const x of v.src) if (x._het > s._het) s = x;
    s.onended = () => don(v);
    if (!offline) setTimeout(() => don(v), Math.max(0, v.het - v.c.currentTime) * 1000 + 3000); // dự phòng
  }
  function don(v) {
    if (v.xong) return; v.xong = true;
    for (const x of v.ds) { try { x.disconnect(); } catch (e) { } }
    if (!offline) TK.node -= v.ds.length;
    if (v.dem) { dang[v.k]--; TK.giong--; }
    v.ds = v.src = null;
  }

  // ---------- khối dựng âm ----------
  const ch = (...a) => { for (let i = 0; i < a.length - 1; i++) a[i].connect(a[i + 1]); return a[a.length - 1]; };
  function gn(v, x) { const g = nd(v, v.c.createGain()); g.gain.value = x == null ? 0 : x; return g; }
  function loc(v, type, f, q) { const b = nd(v, v.c.createBiquadFilter()); b.type = type; b.frequency.value = f; if (q != null) b.Q.value = q; return b; }
  function osc(v, type, f, t0, t1) {
    const o = nd(v, v.c.createOscillator()); o.type = type; o.frequency.setValueAtTime(f, t0);
    o.start(t0); o.stop(t1); o._het = t1; v.src.push(o); if (t1 > v.het) v.het = t1; return o;
  }
  function on(v, t0, t1) {
    const s = nd(v, v.c.createBufferSource()); s.buffer = bus.noise; s.loop = true;
    s.start(t0, R() * 0.9); s.stop(t1); s._het = t1; v.src.push(s); if (t1 > v.het) v.het = t1; return s;
  }
  // đường bao: 0 → đỉnh (attack a) → tắt dần mũ tới t+a+d  (không lách tách)
  function env(p, t, a, dinh, d) {
    p.setValueAtTime(0, t); p.linearRampToValueAtTime(dinh, t + a);
    p.exponentialRampToValueAtTime(0.0001, t + a + d); p.setValueAtTime(0, t + a + d + 0.005);
  }
  // 1 nốt dao động: lướt cao độ f0→f1, đường bao, nối vào dich
  function tone(v, type, f0, f1, t, d, dinh, dich, a) {
    a = a || 0.003;
    const o = osc(v, type, f0, t, t + a + d + 0.03), g = gn(v);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + a + d);
    env(g.gain, t, a, dinh, d); ch(o, g, dich || v.out); return o;
  }
  // 1 cụm ồn qua bộ lọc (tần số lọc có thể quét f→f1)
  function burst(v, t, d, dinh, ftype, f, q, dich, f1, a) {
    a = a || 0.002;
    const s = on(v, t, t + a + d + 0.03), b = loc(v, ftype, f, q), g = gn(v);
    if (f1) { b.frequency.setValueAtTime(f, t); b.frequency.exponentialRampToValueAtTime(f1, t + a + d); }
    env(g.gain, t, a, dinh, d); ch(s, b, g, dich || v.out); return b;
  }
  function gui(v, x) { const g = gn(v, x); v.out.connect(g); g.connect(bus.dly); }
  function vaoCrush(v, x) { const g = gn(v, x); v.out.connect(g); g.connect(bus.crush); }
  // ring-mod: tín hiệu nhân với sóng sin tần số f (âm kim loại / robot)
  function ring(v, f, t0, t1) { const g = gn(v, 0), m = osc(v, 'sine', f, t0, t1); m.connect(g.gain); return g; }
  // né nhạc dưới tiếng lớn (sidechain kiểu ducking)
  function duck(sau, dai) {
    if (!bus) return;
    const p = bus.duck.gain, t = bus.c.currentTime;
    if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); }
    p.linearRampToValueAtTime(Math.max(0.12, 1 - sau), t + 0.025); p.linearRampToValueAtTime(1, t + 0.025 + dai);
  }

  // ---------- GIỌNG ROBOT (tổng hợp formant, kiểu vocoder) ----------
  // seg: [thời lượng, F1, F2, F3, âm lượng, ồn]  — nguồn răng cưa đơn điệu + quãng tám dưới, 3 bộ lọc dải formant
  function noiRobot(v, t, segs, f0, vol) {
    const tong = segs.reduce((s, x) => s + x[0], 0), t1 = t + tong + 0.08;
    const src = osc(v, 'sawtooth', f0, t, t1); src.frequency.linearRampToValueAtTime(f0 * 0.9, t + tong);
    const sub = osc(v, 'square', f0 / 2, t, t1); sub.frequency.linearRampToValueAtTime(f0 * 0.45, t + tong);
    const mix = gn(v, 1), sg = gn(v, 0.4); src.connect(mix); ch(sub, sg, mix);
    const ns = on(v, t, t1), nf = loc(v, 'highpass', 2800), ng = gn(v, 0); ch(ns, nf, ng);
    const amp = gn(v, 0), F = [];
    [[9, 3.2], [12, 2.6], [14, 1.6]].forEach(([q, k], i) => { const b = loc(v, 'bandpass', segs[0][1 + i], q), g = gn(v, k); ch(mix, b, g, amp); F.push(b); });
    ng.connect(amp);
    const rm = ring(v, 52, t, t1); amp.connect(rm); // ring-mod nhẹ → chất "máy"
    const kho = gn(v, 0.55), uot = gn(v, 0.6); amp.connect(kho); rm.connect(uot); kho.connect(v.out); uot.connect(v.out);
    amp.gain.setValueAtTime(0, t); ng.gain.setValueAtTime(0, t); F.forEach((b, i) => b.frequency.setValueAtTime(segs[0][1 + i], t));
    let tt = t;
    for (const [d, f1, f2, f3, a, nn] of segs) {
      const r = Math.min(0.035, d * 0.5);
      [f1, f2, f3].forEach((f, i) => F[i].frequency.linearRampToValueAtTime(f, tt + r));
      amp.gain.linearRampToValueAtTime(a * vol, tt + r); ng.gain.linearRampToValueAtTime((nn || 0) * vol * 0.5, tt + r);
      tt += d;
    }
    amp.gain.linearRampToValueAtTime(0, tt + 0.05); ng.gain.linearRampToValueAtTime(0, tt + 0.03);
  }
  const TU = {
    wave: [[0.06, 300, 620, 2200, 0.45, 0], [0.09, 620, 1700, 2600, 1, 0], [0.1, 420, 2200, 2800, 0.95, 0], [0.09, 260, 1400, 2400, 0.4, 0.5]],
    warning: [[0.05, 300, 620, 2200, 0.45, 0], [0.12, 650, 1000, 2500, 1, 0], [0.07, 460, 1250, 1650, 0.8, 0], [0.06, 280, 1700, 2600, 0.45, 0],
      [0.08, 400, 1950, 2550, 0.95, 0], [0.1, 280, 2300, 2750, 0.5, 0]],
  };

  // ---------- LASER: 1 tia âm duy trì dùng chung (nhiều ụ laser không chồng tiếng) ----------
  let LZ = null;
  function taoLaser(t) {
    const v = moV('laser', bus.sfx, !offline, 0), c = v.c, mo = 30;
    const a = osc(v, 'sawtooth', 220, t, t + mo), b = osc(v, 'sawtooth', 221.7, t, t + mo), s = osc(v, 'square', 440, t, t + mo), hi = osc(v, 'sine', 1760, t, t + mo);
    [[a, 220], [b, 221.7], [s, 440], [hi, 1760]].forEach(([o, f]) => o.frequency.setTargetAtTime(f * 1.14, t + 0.01, 1.6)); // giữ lâu → cao dần = "mạnh dần"
    const f = loc(v, 'lowpass', 1300, 7), lfo = osc(v, 'sine', 7, t, t + mo), lg = gn(v, 420); ch(lfo, lg, f.frequency);
    const sg = gn(v, 0.5), hg = gn(v, 0.2); ch(s, sg, f); a.connect(f); b.connect(f);
    const g = gn(v, 0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.06); ch(f, g, v.out); ch(hi, hg, g);
    return { v, g, hg };
  }
  function tatLaser(L, t) { L.g.gain.cancelScheduledValues(t); L.g.gain.setTargetAtTime(0, t, 0.07); for (const o of L.v.src) { o.stop(t + 0.45); o._het = t + 0.45; } L.v.het = t + 0.45; fin(L.v); }
  let lzTimer = 0;
  function laser() {
    if (!bus || offline || !batSfx || ac.state !== 'running') return;
    const n = performance.now();
    if (!LZ) { LZ = taoLaser(ac.currentTime + 0.005); LZ.bd = n; }
    LZ.cuoi = n;
    if (n - LZ.bd > 25000) { tatLaser(LZ, ac.currentTime); LZ = null; return; } // an toàn: tối đa 25 s/tia
    if (!lzTimer) lzTimer = setInterval(() => {
      if (LZ && performance.now() - LZ.cuoi > 170) { tatLaser(LZ, ac.currentTime); LZ = null; }
      if (!LZ) { clearInterval(lzTimer); lzTimer = 0; }
    }, 60);
  }

  // =====================================================================================================
  //  BẢNG ÂM SFX
  // =====================================================================================================
  const S = {
    // UI: chạm gọn, sạch
    nut() { const v = V('nut', 2); if (!v) return; const t = v.t;
      tone(v, 'sine', vr(1900, 0.03), 1250, t, 0.05, 0.16); tone(v, 'square', vr(3800, 0.03), 0, t, 0.012, 0.035);
      burst(v, t, 0.008, 0.05, 'highpass', 6000, 0.7); fin(v); },
    // TRIỆU HỒI: vật chất hoá số — quét lên + lấp lánh (tiếng khoá servo phát lúc ụ đáp xuống: dat)
    trieu() { const v = V('trieu', 2); if (!v) return; const t = v.t;
      const bp = loc(v, 'bandpass', 300, 6); bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(3800, t + 0.22); bp.connect(v.out);
      tone(v, 'sawtooth', 180, 900, t, 0.22, 0.3, bp, 0.02); tone(v, 'square', 360, 1800, t, 0.22, 0.08, bp, 0.02);
      burst(v, t, 0.2, 0.08, 'highpass', 3000, 0.8, null, 9000, 0.12);
      tone(v, 'sine', 1760, 1760, t + 0.17, 0.12, 0.06); tone(v, 'sine', 2637, 2637, t + 0.21, 0.1, 0.04);
      vaoCrush(v, 0.25); gui(v, 0.25); fin(v); },
    // khoá servo: whir ngắn + "cạch" + ping kim loại
    dat() { const v = V('dat', 1); if (!v) return; const t = v.t;
      const lp = loc(v, 'lowpass', 900); lp.connect(v.out);
      tone(v, 'square', vr(95, 0.08), 150, t, 0.06, 0.12, lp, 0.01);
      const t2 = t + 0.055;
      tone(v, 'sine', vr(130, 0.06), 48, t2, 0.08, 0.5); burst(v, t2, 0.025, 0.3, 'bandpass', vr(2200, 0.1), 2);
      const rm = ring(v, 1170, t2, t2 + 0.12); rm.connect(v.out); tone(v, 'triangle', vr(2350, 0.05), 0, t2, 0.06, 0.12, rm); fin(v); },
    // GHÉP: 2 tông hội tụ → hợp âm stab sáng + khoá cơ khí (sao càng cao càng lên giọng)
    ghep(sao, xa) { const v = V('ghep', 2); if (!v) return; const t = v.t, k = xa ? 0.45 : 1;
      const r = 220 * Math.pow(2, [0, 0, 2, 3, 5, 7, 8, 10, 12][Math.min(8, sao || 2)] / 12);
      tone(v, 'triangle', r * 0.75, r * 2, t, 0.11, 0.12 * k, null, 0.01); tone(v, 'triangle', r * 3, r * 2, t, 0.11, 0.1 * k, null, 0.01);
      const t2 = t + 0.11, f = loc(v, 'lowpass', 6000, 3); f.frequency.setValueAtTime(6500, t2); f.frequency.exponentialRampToValueAtTime(800, t2 + 0.32); f.connect(v.out);
      for (const m of [1, 1.5, 2, 2.245, 2.52]) tone(v, 'sawtooth', vr(r * 2 * m, 0.003), 0, t2, 0.36, 0.055 * k, f);
      burst(v, t2, 0.02, 0.3 * k, 'highpass', 3000, 0.8); tone(v, 'sine', 170, 55, t2, 0.09, 0.45 * k); tone(v, 'square', 1250, 0, t2 + 0.01, 0.03, 0.03 * k);
      if ((sao || 0) >= 4) [1, 1.5, 2, 3].forEach((m, i) => tone(v, 'sine', r * 4 * m, 0, t2 + 0.06 + i * 0.045, 0.12, 0.04 * k));
      gui(v, 0.28); if (!xa) duck(0.3, 0.35); fin(v); },
    // NÂNG CẤP (skill-up): arpeggio đi lên + vút năng lượng
    nang(lv) { const v = V('nang', 2); if (!v) return; const t = v.t, r = 330 * Math.pow(2, ((lv || 2) - 2) * 2 / 12);
      const f = loc(v, 'lowpass', 3800, 2); f.connect(v.out);
      [0, 3, 7, 12, 15].forEach((s, i) => tone(v, 'square', r * Math.pow(2, s / 12), 0, t + i * 0.045, 0.09, 0.06, f));
      burst(v, t, 0.28, 0.16, 'bandpass', 600, 3, null, 6000, 0.12);
      tone(v, 'sawtooth', r * 4, r * 4.05, t + 0.22, 0.2, 0.04, f); gui(v, 0.3); fin(v); },
    // THỨC TỈNH: như nâng cấp nhưng nặng hơn — sub bùm + arp răng cưa + hợp âm ring-mod
    thucTinh() { const v = V('thucTinh', 2); if (!v) return; const t = v.t;
      tone(v, 'sine', 75, 30, t, 0.6, 0.7);
      const f = loc(v, 'lowpass', 900, 4); f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(7000, t + 0.4); f.connect(v.out);
      [0, 3, 7, 10, 12, 15, 19].forEach((s, i) => tone(v, 'sawtooth', 220 * Math.pow(2, s / 12), 0, t + i * 0.05, 0.12, 0.06, f));
      burst(v, t, 0.5, 0.2, 'bandpass', 400, 2, null, 7000, 0.35);
      const t2 = t + 0.38, rm = ring(v, 37, t2, t2 + 0.7); rm.connect(v.out);
      for (const m of [1, 1.2, 1.5, 2]) tone(v, 'sawtooth', 440 * m, 0, t2, 0.6, 0.06, rm, 0.01);
      tone(v, 'sine', 110, 40, t2, 0.35, 0.5); gui(v, 0.35); duck(0.6, 0.8); fin(v); },

    // ---------- VŨ KHÍ ----------
    // PHÁO: sub thump đấm + giật cơ khí (clank + servo trả nòng)
    phao() { const v = V('phao', 1); if (!v) return; const t = v.t, p = vr(1, 0.06);
      tone(v, 'sine', 125 * p, 38, t, 0.24, 0.8);
      const lp = loc(v, 'lowpass', 500); lp.connect(v.out); tone(v, 'square', 72 * p, 40, t, 0.06, 0.22, lp);
      burst(v, t, 0.12, 0.45, 'lowpass', 1900, 0.7, null, 400);
      burst(v, t + 0.045, 0.05, 0.22, 'bandpass', vr(3200, 0.1), 9); tone(v, 'triangle', vr(1900, 0.08), 1700, t + 0.045, 0.06, 0.05);
      const lp2 = loc(v, 'lowpass', 900); lp2.connect(v.out); tone(v, 'square', 180, 270, t + 0.09, 0.09, 0.05, lp2, 0.01);
      duck(0.15, 0.15); fin(v); },
    // LIÊN THANH: tick số gọn, cao độ lệch nhẹ mỗi phát
    lien() { const v = V('lien', 0); if (!v) return; const t = v.t, f = vr(1500, 0.14);
      tone(v, 'square', f, f * 0.7, t, 0.02, 0.07); burst(v, t, 0.012, 0.1, 'highpass', 5000, 0.7);
      tone(v, 'sine', vr(190, 0.1), 90, t, 0.03, 0.12); vaoCrush(v, 0.35); fin(v); },
    // BẮN TỈA / SÚNG ĐẠN NẶNG: rít nạp ngắn → tiếng "chát" sắc
    tia() { const v = V('tia', 1); if (!v) return; const t = v.t;
      tone(v, 'sine', 2400, 5200, t, 0.05, 0.035, null, 0.04);
      const t2 = t + 0.05; burst(v, t2, 0.06, 0.45, 'highpass', 1800, 0.7);
      tone(v, 'sawtooth', vr(2600, 0.06), 180, t2, 0.08, 0.1); tone(v, 'sine', 140, 50, t2, 0.08, 0.4);
      gui(v, 0.15); fin(v); },
    // RAILGUN: tích điện rít dài (FM) → nổ chát + tia zap
    rail() { const v = V('rail', 2); if (!v) return; const t = v.t;
      const w = tone(v, 'sine', 500, 4200, t, 0.03, 0.07, null, 0.2); const m = osc(v, 'sine', 30, t, t + 0.3), mg = gn(v, 60); ch(m, mg, w.frequency);
      const t2 = t + 0.22; burst(v, t2, 0.09, 0.55, 'highpass', 1500, 0.7);
      const lp = loc(v, 'lowpass', 6000); lp.connect(v.out); tone(v, 'sawtooth', 3400, 90, t2, 0.28, 0.14, lp);
      tone(v, 'sine', 110, 40, t2, 0.18, 0.5); vaoCrush(v, 0.2); gui(v, 0.3); duck(0.25, 0.3); fin(v); },
    // TESLA: hồ quang lách tách (ồn dải + AM sóng vuông) + rè điện
    set() { const v = V('set', 1); if (!v) return; const t = v.t, d = 0.12 + R() * 0.05;
      const ns = on(v, t, t + d + 0.03), bp = loc(v, 'bandpass', vr(3200, 0.3), 1.5), am = gn(v, 0), lfo = osc(v, 'square', vr(65, 0.3), t, t + d + 0.03), g = gn(v);
      lfo.connect(am.gain); env(g.gain, t, 0.003, 0.35, d); ch(ns, bp, am, g, v.out);
      for (let i = 0; i < 3; i++) burst(v, t + R() * d, 0.008, 0.3, 'highpass', 6000, 0.7);
      tone(v, 'sawtooth', vr(110, 0.1), vr(90, 0.1), t, d, 0.08, bus.crush); fin(v); },
    // BĂNG: chuông pha lê (bội âm không hoà âm, bội cao tắt nhanh)
    bang() { const v = V('bang', 1); if (!v) return; const t = v.t, f = vr(1600, 0.12);
      [[1, 0.1, 0.35], [2.76, 0.06, 0.22], [5.4, 0.035, 0.12], [8.9, 0.02, 0.07]].forEach(([m, a, d]) => tone(v, 'sine', f * m, 0, t, d, a, null, 0.002));
      burst(v, t, 0.03, 0.05, 'highpass', 8000, 0.7); gui(v, 0.35); fin(v); },
    // ĐỘC: bong bóng lọc (blip cao độ đi lên) + ồn "wah"
    doc() { const v = V('doc', 1); if (!v) return; const t = v.t;
      const lp = loc(v, 'lowpass', 2200); lp.connect(v.out);
      [0, 0.035, 0.07, 0.11].forEach(o => tone(v, 'sine', vr(320, 0.3), vr(950, 0.2), t + o + R() * 0.015, 0.035, 0.1, lp));
      burst(v, t, 0.15, 0.12, 'bandpass', 700, 4, null, 1400); fin(v); },
    // PHÓNG (cối / tên lửa / drone): xì phóng + thump + servo
    nap() { const v = V('nap', 1); if (!v) return; const t = v.t;
      burst(v, t, 0.28, 0.28, 'bandpass', 700, 1.5, null, 3500, 0.03); tone(v, 'sine', 110, 55, t, 0.1, 0.3);
      const lp = loc(v, 'lowpass', 1400); lp.connect(v.out); tone(v, 'square', 300, 900, t, 0.15, 0.03, lp, 0.01); fin(v); },
    // NỔ: sub thump + thân ồn + hạt số crush; nổ lớn thêm rền + mảnh kim loại
    no(m) { m = m == null ? 0.4 : m; const v = V('no', m > 0.8 ? 2 : 1); if (!v) return; const t = v.t, d = 0.22 + m * 0.45;
      tone(v, 'sine', vr(95 + m * 30, 0.05), 32, t, d * 0.8, 0.55 + m * 0.35);
      burst(v, t, d, 0.45 + m * 0.4, 'lowpass', 2600 + m * 1500, 0.7, null, 300);
      burst(v, t, d * 0.6, 0.16 + m * 0.15, 'bandpass', 1400, 0.8, bus.crush, 500);
      if (m > 0.8) { tone(v, 'sine', 48, 26, t + 0.05, d * 1.5, 0.5, null, 0.05); for (let i = 0; i < 4; i++) tone(v, 'triangle', vr(2300, 0.3), 0, t + 0.06 + i * 0.06 + R() * 0.03, 0.08, 0.05); }
      duck(0.2 + m * 0.45, 0.25 + m * 0.45); fin(v); },
    // MANA: blip toàn ảnh nhẹ
    mana() { const v = V('mana', 1); if (!v) return; const t = v.t;
      tone(v, 'sine', 1320, 1760, t, 0.09, 0.09); tone(v, 'triangle', 1980, 2640, t + 0.03, 0.07, 0.04); gui(v, 0.3); fin(v); },
    // CHẠM Ụ HỖ TRỢ: blip hologram mềm (rung FM nhẹ)
    hoTro() { const v = V('hoTro', 1); if (!v) return; const t = v.t;
      const a = tone(v, 'sine', 1046, 0, t, 0.14, 0.08, null, 0.01), m = osc(v, 'sine', 18, t, t + 0.2), mg = gn(v, 25); ch(m, mg, a.frequency);
      tone(v, 'sine', 1568, 0, t + 0.05, 0.14, 0.06, null, 0.01); burst(v, t, 0.02, 0.03, 'highpass', 7000, 0.7); gui(v, 0.35); fin(v); },
    // OVERLORD: siêu sấm — hồ quang dài + bùm sub
    sam() { const v = V('sam', 2); if (!v) return; const t = v.t;
      const ns = on(v, t, t + 0.55), bp = loc(v, 'bandpass', 2500, 1.2), am = gn(v, 0), lfo = osc(v, 'square', 45, t, t + 0.55), g = gn(v);
      lfo.connect(am.gain); env(g.gain, t, 0.01, 0.4, 0.5); ch(ns, bp, am, g, v.out);
      tone(v, 'sine', 72, 28, t, 0.9, 0.8); burst(v, t, 0.9, 0.55, 'lowpass', 1800, 0.7, null, 200);
      for (let i = 0; i < 8; i++) burst(v, t + R() * 0.5, 0.01, 0.3, 'highpass', 5000, 0.7);
      vaoCrush(v, 0.25); duck(0.7, 0.8); fin(v); },
    // HỐ ĐEN: drone FM rơi sâu + ồn hút phồng lên
    hoden() { const v = V('hoden', 2); if (!v) return; const t = v.t, d = 1.25;
      const c = tone(v, 'sine', 180, 38, t, d, 0.45, null, 0.2), m = osc(v, 'sine', 254, t, t + d + 0.3), mg = gn(v, 50);
      m.frequency.exponentialRampToValueAtTime(54, t + d); mg.gain.setValueAtTime(50, t); mg.gain.linearRampToValueAtTime(400, t + d); ch(m, mg, c.frequency);
      burst(v, t, 0.5, 0.25, 'lowpass', 400, 2, null, 1500, 0.7); duck(0.5, 1.2); fin(v); },
    // KỸ NĂNG MA VƯƠNG: hợp âm lướt lên + vút → va chạm
    mv() { const v = V('mv', 2); if (!v) return; const t = v.t;
      const f = loc(v, 'lowpass', 600, 3); f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(5000, t + 0.36); f.connect(v.out);
      for (const m of [1, 1.5, 2]) tone(v, 'sawtooth', 110 * m, 440 * m, t, 0.36, 0.07, f, 0.2);
      burst(v, t, 0.4, 0.2, 'bandpass', 400, 2, null, 6000, 0.3);
      const t2 = t + 0.38; tone(v, 'sine', 90, 35, t2, 0.4, 0.7); burst(v, t2, 0.3, 0.35, 'lowpass', 2500, 0.7, null, 300);
      const f2 = loc(v, 'lowpass', 5000, 2); f2.frequency.setValueAtTime(5000, t2); f2.frequency.exponentialRampToValueAtTime(700, t2 + 0.4); f2.connect(v.out);
      for (const m of [1, 1.26, 1.5, 2]) tone(v, 'sawtooth', 440 * m, 0, t2, 0.4, 0.05, f2);
      gui(v, 0.3); duck(0.6, 0.7); fin(v); },

    // ---------- TRÚNG ĐÒN / QUÁI ----------
    trung() { const v = V('trung', 0); if (!v) return; const t = v.t;
      tone(v, 'triangle', vr(2800, 0.15), 2400, t, 0.018, 0.035); burst(v, t, 0.012, 0.04, 'highpass', 4000, 0.7); fin(v); },
    // CHÍ MẠNG: ping kim loại sáng hơn, lên giọng
    crit() { const v = V('crit', 1); if (!v) return; const t = v.t, f = vr(3400, 0.05);
      tone(v, 'sine', f, f * 1.25, t, 0.1, 0.07); tone(v, 'sine', f * 1.48, f * 1.7, t, 0.07, 0.04); tone(v, 'square', f * 0.5, 0, t, 0.03, 0.025);
      burst(v, t, 0.02, 0.06, 'highpass', 6000, 0.7); gui(v, 0.2); fin(v); },
    // QUÁI CHẾT: pop/glitch số (bậc cao độ ngẫu nhiên qua crush)
    chet(trum) { if (trum) return S.chetTrum(); const v = V('chet', 0); if (!v) return; const t = v.t;
      for (let i = 0; i < 3; i++) tone(v, 'square', 400 + R() * 1200, 0, t + i * 0.018, 0.016, 0.07, bus.crush, 0.001);
      burst(v, t, 0.03, 0.18, 'bandpass', 1500, 1); tone(v, 'sine', 300, 80, t, 0.06, 0.18); fin(v); },
    chetTrum() { const v = V('chetTrum', 2); if (!v) return; const t = v.t;
      const f = loc(v, 'lowpass', 3000); f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(200, t + 0.9); f.connect(v.out);
      tone(v, 'sawtooth', 900, 35, t, 0.9, 0.2, f); tone(v, 'square', 450, 18, t, 0.9, 0.08, f);
      for (let i = 0; i < 10; i++) tone(v, 'square', (1600 - i * 130) * vr(1, 0.3), 0, t + i * 0.03, 0.025, 0.08, bus.crush, 0.001);
      duck(0.6, 1); fin(v); },

    // ---------- TRÙM ----------
    // cảnh báo trùm xuất hiện: còi robot 2 tông + giọng formant "WARNING"
    canhBao() { const v = V('canhBao', 2); if (!v) return; const t = v.t;
      const o = osc(v, 'square', 880, t, t + 0.62), lp = loc(v, 'lowpass', 3000), g = gn(v), am = gn(v, 0.6), tr = osc(v, 'sine', 30, t, t + 0.62), tg = gn(v, 0.4);
      for (let i = 0; i < 4; i++) { o.frequency.setValueAtTime(i % 2 ? 622 : 880, t + i * 0.14); }
      ch(tr, tg, am.gain); env(g.gain, t, 0.01, 0.1, 0.56); ch(o, lp, am, g, v.out);
      tone(v, 'sine', 55, 45, t, 0.6, 0.25);
      noiRobot(v, t + 0.62, TU.warning, 82, 0.5); vaoCrush(v, 0.15); gui(v, 0.25); duck(0.5, 1.4); fin(v); },
    // trùm báo trước chiêu: bíp bíp đi lên + tích năng lượng
    bao() { const v = V('bao', 2); if (!v) return; const t = v.t;
      [1200, 1400, 1600].forEach((f, i) => tone(v, 'square', f, 0, t + i * 0.12, 0.07, 0.035));
      const bp = loc(v, 'bandpass', 200, 5); bp.frequency.setValueAtTime(200, t); bp.frequency.exponentialRampToValueAtTime(1400, t + 0.9); bp.connect(v.out);
      tone(v, 'sawtooth', 200, 1400, t, 0.15, 0.25, bp, 0.8); fin(v); },
    // trùm tung chiêu: va chạm nặng + màu riêng từng trùm
    chieuTrum(id) { const v = V('chieuTrum', 2); if (!v) return; const t = v.t;
      tone(v, 'sine', 100, 35, t, 0.35, 0.6); burst(v, t, 0.25, 0.35, 'lowpass', 2200, 0.7, null, 300); burst(v, t, 0.12, 0.12, 'bandpass', 1300, 1, bus.crush);
      if (id === 'mad_crown') for (let i = 0; i < 6; i++) tone(v, 'square', 300 + R() * 1500, 0, t + i * 0.03, 0.025, 0.07, bus.crush, 0.001);
      else if (id === 'freezer') [[1, 0.1, 0.6], [2.76, 0.06, 0.35], [5.4, 0.03, 0.2]].forEach(([m, a, d]) => tone(v, 'sine', 900 * m, 0, t, d, a));
      else if (id === 'janus') { burst(v, t, 0.4, 0.4, 'bandpass', 300, 1); tone(v, 'sine', 55, 30, t, 0.5, 0.5); }
      else if (id === 'joker_king') { const o = tone(v, 'sine', 300, 0, t, 0.3, 0.12, null, 0.01); o.frequency.linearRampToValueAtTime(900, t + 0.12); o.frequency.linearRampToValueAtTime(300, t + 0.3); }
      else if (id === 'nightmare') tone(v, 'sawtooth', 1800, 60, t, 0.35, 0.12);
      else if (id === 'octopus') burst(v, t, 0.5, 0.3, 'bandpass', 900, 0.8, null, 400, 0.05);
      gui(v, 0.2); duck(0.4, 0.5); fin(v); },
    // LỌT QUÁI / MẤT MẠNG: rè lỗi trầm 2 nhịp
    lot() { const v = V('lot', 2); if (!v) return; const t = v.t;
      const lp = loc(v, 'lowpass', 1100), g = gn(v); ch(lp, g, v.out);
      osc(v, 'square', 98, t, t + 0.45).connect(lp); osc(v, 'square', 103.5, t, t + 0.45).connect(lp);
      const p = g.gain; p.setValueAtTime(0, t); p.linearRampToValueAtTime(0.25, t + 0.01); p.setValueAtTime(0.25, t + 0.14); p.linearRampToValueAtTime(0, t + 0.16);
      p.linearRampToValueAtTime(0.25, t + 0.21); p.setValueAtTime(0.25, t + 0.37); p.linearRampToValueAtTime(0, t + 0.4);
      tone(v, 'sine', 55, 50, t, 0.4, 0.3); vaoCrush(v, 0.35); duck(0.5, 0.5); fin(v); },
    // BẮT ĐẦU WAVE: riser → stab hợp âm + kick + giọng robot "WAVE"
    wave(n, trum) { const v = V('wave', 2); if (!v) return; const t = v.t, t2 = t + 0.35;
      burst(v, t, 0.05, 0.13, 'bandpass', 500, 1.5, null, 6000, 0.3);
      const f = loc(v, 'lowpass', 5000, 3); f.frequency.setValueAtTime(5000, t2); f.frequency.exponentialRampToValueAtTime(700, t2 + 0.4); f.connect(v.out);
      const hop = trum ? [0.5, 0.595, 0.707, 0.944, 1] : [1, 1.189, 1.498, 1.888, 2.245];
      for (const m of hop) tone(v, 'sawtooth', vr(220 * m, 0.003), 0, t2, 0.4, 0.05, f);
      tone(v, 'sine', 130, 40, t2, 0.25, 0.6); if (trum) tone(v, 'sine', 55, 30, t2, 0.7, 0.5);
      noiRobot(v, t2 + 0.07, TU.wave, trum ? 72 : 100, 0.55); gui(v, 0.3); duck(0.5, 0.9); fin(v); },
    // KẾT THÚC: thắng = arp trưởng đi lên + hợp âm ngân; thua = "tape-stop" tụt giọng + rè
    ketThuc(thang) { const v = V('ketThuc', 2); if (!v) return; const t = v.t;
      if (thang) {
        const f = loc(v, 'lowpass', 4000, 2); f.connect(v.out);
        [1, 1.26, 1.5, 2, 2.52, 3].forEach((m, i) => tone(v, 'square', 220 * m, 0, t + i * 0.08, 0.25, 0.05, f));
        const t2 = t + 0.5, f2 = loc(v, 'lowpass', 600, 3); f2.frequency.setValueAtTime(600, t2); f2.frequency.exponentialRampToValueAtTime(5000, t2 + 0.6); f2.connect(v.out);
        for (const m of [1, 1.26, 1.5, 2]) { tone(v, 'sawtooth', 440 * m * 0.997, 0, t2, 1.2, 0.04, f2, 0.08); tone(v, 'sawtooth', 440 * m * 1.003, 0, t2, 1.2, 0.04, f2, 0.08); }
        tone(v, 'sine', 3520, 0, t2 + 0.1, 0.6, 0.03); tone(v, 'sine', 110, 40, t2, 0.4, 0.5);
      } else {
        v.out.gain.value *= 2.6;
        const f = loc(v, 'lowpass', 3000, 2); f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(150, t + 1.1); f.connect(v.out);
        for (const m of [1, 1.189, 1.5]) tone(v, 'sawtooth', 220 * m, 55 * m, t, 1.1, 0.07, f, 0.01);
        for (let i = 0; i < 5; i++) tone(v, 'square', 200 + R() * 600, 0, t + 0.9 + i * 0.03, 0.025, 0.06, bus.crush, 0.001);
        const lp = loc(v, 'lowpass', 700); lp.connect(v.out); tone(v, 'square', 55, 50, t + 1.05, 0.5, 0.15, lp, 0.01);
      }
      gui(v, 0.4); duck(0.85, 2.2); fin(v); },
    // ---- ỤNG MỚI (skills3.js) ----
    // tích-tắc đồng hồ (Chrono Lock khoá / Chrono Throne)
    tich() { const v = V('tich', 1); if (!v) return; const t = v.t;
      burst(v, t, 0.012, 0.22, 'bandpass', 3200, 6); tone(v, 'sine', 2400, 0, t, 0.02, 0.06);
      burst(v, t + 0.16, 0.012, 0.16, 'bandpass', 2300, 6); tone(v, 'sine', 1800, 0, t + 0.16, 0.02, 0.05); gui(v, 0.2); fin(v); },
    // kính thời gian vỡ: chùm leng keng cao + ồn vỡ
    kinhVo() { const v = V('kinhVo', 1); if (!v) return; const t = v.t;
      burst(v, t, 0.12, 0.3, 'highpass', 4000, 0.8, null, 9000);
      for (let i = 0; i < 5; i++) tone(v, 'sine', vr(2600 + i * 700, 0.08), 0, t + i * 0.018, 0.12, 0.05);
      tone(v, 'sine', 160, 50, t, 0.12, 0.35); gui(v, 0.3); fin(v); },
    // đạn nảy: "ping" cao dần theo số lần nảy
    nay(k) { const v = V('nay', 0); if (!v) return; const t = v.t, f = 900 * Math.pow(2, Math.min(8, k || 0) * 2 / 12);
      tone(v, 'triangle', f, f * 1.6, t, 0.07, 0.11); tone(v, 'sine', f * 2, 0, t, 0.05, 0.04); fin(v); },
    // COMBO ×N: "ting" tăng cao độ theo combo
    combo(n) { const v = V('combo', 2); if (!v) return; const t = v.t, r = 523 * Math.pow(2, Math.min(24, n || 1) / 12 * 0.5);
      [0, 4, 7].forEach((s, i) => tone(v, 'square', r * Math.pow(2, s / 12), 0, t + i * 0.035, 0.09, 0.06));
      tone(v, 'sine', r * 4, 0, t + 0.1, 0.25, 0.05); gui(v, 0.35); fin(v); },
    // máy quay thưởng (Pandora): tick-tick nhanh rồi chậm
    quay() { const v = V('quay', 2); if (!v) return; const t = v.t;
      let tt = t; for (let i = 0; i < 12; i++) { burst(v, tt, 0.01, 0.14, 'bandpass', 2600 - i * 60, 5); tone(v, 'square', 1300 - i * 30, 0, tt, 0.012, 0.03); tt += 0.035 + i * i * 0.0012; }
      fin(v); },
    // tua băng ngược (REWIND): quét cao độ giảm + rè + chuông lớn
    tua() { const v = V('tua', 2); if (!v) return; const t = v.t;
      const f = loc(v, 'bandpass', 3000, 2); f.frequency.setValueAtTime(3500, t); f.frequency.exponentialRampToValueAtTime(400, t + 0.6); f.connect(v.out);
      tone(v, 'sawtooth', 1400, 180, t, 0.6, 0.12, f); burst(v, t, 0.6, 0.12, 'bandpass', 2500, 1, null, 300);
      vaoCrush(v, 0.3);
      const t2 = t + 0.62; for (const m of [1, 2.76, 5.4]) tone(v, 'sine', 220 * m, 0, t2, 1.1 / m, 0.18 / m);
      tone(v, 'sine', 70, 35, t2, 0.4, 0.5); gui(v, 0.4); duck(0.6, 1); fin(v); },
    // đuôi cáo / cầu lửa hồ ly: "vụt" + chuông đền
    hoLy() { const v = V('hoLy', 2); if (!v) return; const t = v.t;
      burst(v, t, 0.25, 0.2, 'bandpass', 600, 2, null, 4000);
      for (const m of [1, 1.5, 2.01]) tone(v, 'sine', 660 * m, 0, t + 0.12, 0.9, 0.07 / m); gui(v, 0.4); fin(v); },
    // ---- GROW-UP / WAKE-UP (growfx.js): biến hình + đòn đánh riêng từng dạng ----
    // nạp biến hình (0–220 ms): quét cao dần + rít ồn
    gNap() { const v = V('gNap', 2); if (!v) return; const t = v.t;
      tone(v, 'sine', 260, 1300, t, 0.22, 0.12); tone(v, 'triangle', 520, 2600, t + 0.02, 0.2, 0.04); burst(v, t, 0.22, 0.08, 'bandpass', 800, 3, null, 5000); fin(v); },
    // khoá dạng mới (220 ms): cú "thịch" nặng + chuông ánh kim (lon = thức tỉnh dạng 3)
    gKhoa(lon) { const v = V('gKhoa', 2); if (!v) return; const t = v.t;
      tone(v, 'sine', 150, 40, t, 0.22, 0.5); burst(v, t, 0.09, 0.3, 'lowpass', 900, 1);
      const cs = lon ? [1, 1.26, 1.5, 2] : [1, 1.5]; cs.forEach((m, i) => tone(v, 'sine', 880 * m, 0, t + 0.03 + i * 0.03, lon ? 0.7 : 0.35, 0.06));
      if (lon) { vaoCrush(v, 0.15); duck(0.4, 0.5); } gui(v, 0.35); fin(v); },
    // vuốt cào: 1 = 1 nhát · 2 = 2 nhát chéo · 3 = 2 nhát chí mạng + tiếng kim loại
    gVuot(n) { const v = V('gVuot', 1); if (!v) return; const t = v.t, k = n || 1;
      for (let i = 0; i < Math.min(2, k); i++) burst(v, t + i * 0.06, 0.07, 0.22, 'bandpass', 2400 + 800 * k, 2, null, 900);
      if (k >= 3) { tone(v, 'square', 2600, 1800, t, 0.05, 0.04); tone(v, 'sine', 3800, 0, t + 0.06, 0.12, 0.05); } fin(v); },
    gArc() { const v = V('gArc', 0); if (!v) return; const t = v.t; burst(v, t, 0.05, 0.16, 'highpass', 3000, 1); tone(v, 'sawtooth', 1800, 400, t, 0.05, 0.04); fin(v); },
    // cột sét từ trời (Overlord dạng 3): sấm trầm + rè
    gCot() { const v = V('gCot', 2); if (!v) return; const t = v.t;
      burst(v, t, 0.5, 0.4, 'lowpass', 1600, 1, null, 120); tone(v, 'sine', 90, 30, t, 0.5, 0.6); burst(v, t, 0.18, 0.2, 'highpass', 5000, 1); vaoCrush(v, 0.25); duck(0.6, 0.6); fin(v); },
    // giáo trời (Vệ Tinh bắn phá): "bíp" ngắm + rít rơi + nổ đục
    gTam() { const v = V('gTam', 0); if (!v) return; const t = v.t; tone(v, 'square', 1760, 0, t, 0.04, 0.03); tone(v, 'square', 1760, 0, t + 0.07, 0.04, 0.03); fin(v); },
    gLance() { const v = V('gLance', 1); if (!v) return; const t = v.t;
      tone(v, 'sawtooth', 2400, 300, t, 0.14, 0.05); burst(v, t + 0.12, 0.16, 0.3, 'lowpass', 700, 1); tone(v, 'sine', 120, 45, t + 0.12, 0.16, 0.3); fin(v); },
    // sao: 1 lấp lánh · 2 đôi · 3 sao chổi (vụt + chuông)
    gSao(k) { const v = V('gSao', 1); if (!v) return; const t = v.t;
      if ((k || 1) >= 3) { burst(v, t, 0.2, 0.14, 'bandpass', 1200, 2, null, 6000); [1, 1.5, 2].forEach((m, i) => tone(v, 'sine', 1320 * m, 0, t + 0.05 + i * 0.04, 0.4, 0.05)); }
      else { tone(v, 'triangle', 2093, 2637, t, 0.06, 0.06); if (k === 2) tone(v, 'triangle', 2637, 3136, t + 0.05, 0.06, 0.05); } gui(v, 0.25); fin(v); },
    gXich() { const v = V('gXich', 1); if (!v) return; const t = v.t; for (let i = 0; i < 3; i++) { burst(v, t + i * 0.025, 0.02, 0.18, 'bandpass', 4200 - i * 500, 8); tone(v, 'sine', 2900 + i * 300, 0, t + i * 0.025, 0.05, 0.03); } fin(v); },
    gVang() { const v = V('gVang', 1); if (!v) return; const t = v.t; tone(v, 'sine', 1568, 0, t, 0.18, 0.08); tone(v, 'square', 784, 0, t, 0.06, 0.03); tone(v, 'sine', 2352, 0, t + 0.02, 0.2, 0.04); gui(v, 0.3); fin(v); },
    gKim() { const v = V('gKim', 1); if (!v) return; const t = v.t; burst(v, t, 0.012, 0.22, 'bandpass', 3400, 7); tone(v, 'triangle', 3000, 1200, t + 0.01, 0.08, 0.05); fin(v); },
    gEcho() { const v = V('gEcho', 1); if (!v) return; const t = v.t; tone(v, 'sine', 600, 1400, t, 0.18, 0.06); burst(v, t, 0.2, 0.06, 'bandpass', 2000, 4, null, 600); gui(v, 0.5); fin(v); },
    // lửa: 1 cam · 2 lam (gắt hơn) · 3 trắng (rít cao)
    gLua(m) { const v = V('gLua', 0); if (!v) return; const t = v.t, k = m || 1;
      burst(v, t, 0.16, 0.12, 'lowpass', 700 + 500 * k, 0.7); burst(v, t, 0.1, 0.05 * k, 'bandpass', 2500 + 1200 * k, 1.5); fin(v); },
    gBang() { const v = V('gBang', 1); if (!v) return; const t = v.t; for (let i = 0; i < 3; i++) tone(v, 'sine', vr(3200 + i * 600, 0.05), 0, t + i * 0.03, 0.08, 0.04); burst(v, t, 0.05, 0.08, 'highpass', 6000, 1); fin(v); },
    gThe() { const v = V('gThe', 0); if (!v) return; const t = v.t; burst(v, t, 0.03, 0.14, 'bandpass', 3000, 3); tone(v, 'square', 660, 990, t, 0.04, 0.03); fin(v); },
    gNung() { const v = V('gNung', 1); if (!v) return; const t = v.t; burst(v, t, 0.12, 0.2, 'lowpass', 900, 1); tone(v, 'sine', 220, 90, t, 0.12, 0.2); fin(v); },
    gHo() { const v = V('gHo', 0); if (!v) return; const t = v.t; burst(v, t, 0.14, 0.12, 'bandpass', 900, 2, null, 2600); tone(v, 'sine', 880, 0, t + 0.04, 0.15, 0.03); fin(v); },
    // ---- 4 ụ Đỏ đợt 3 (skills5.js) ----
    gOng() { const v = V('gOng', 0); if (!v) return; const t = v.t; tone(v, 'sawtooth', 190, 210, t, 0.25, 0.05); tone(v, 'square', 95, 105, t, 0.25, 0.02); burst(v, t, 0.2, 0.03, 'bandpass', 1500, 2); fin(v); },
    gSwarm() { const v = V('gSwarm', 2); if (!v) return; const t = v.t; for (let i = 0; i < 5; i++) tone(v, 'sawtooth', vr(180 + i * 40, 0.1), 700 + i * 90, t + i * 0.04, 0.4, 0.04); burst(v, t, 0.5, 0.1, 'bandpass', 1200, 2, null, 3500); gui(v, 0.3); fin(v); },
    gNuot() { const v = V('gNuot', 1); if (!v) return; const t = v.t; burst(v, t, 0.4, 0.16, 'lowpass', 1800, 2, null, 200); tone(v, 'sine', 300, 60, t + 0.3, 0.2, 0.4); fin(v); },
    gSongTho() { const v = V('gSongTho', 2); if (!v) return; const t = v.t; burst(v, t, 1.4, 0.3, 'lowpass', 600, 1, null, 2400); tone(v, 'sine', 70, 50, t, 1.2, 0.4); burst(v, t + 0.2, 1.1, 0.08, 'highpass', 4000, 1); duck(0.5, 1.4); fin(v); },
    gHop(lon) { const v = V('gHop', 2); if (!v) return; const t = v.t; const cs = lon ? [523, 659, 784, 1047] : [659, 988]; cs.forEach((f, i) => { tone(v, 'triangle', f, 0, t + i * 0.05, 0.8, 0.05); tone(v, 'sine', f * 2, 0, t + i * 0.05, 0.6, 0.02); }); gui(v, 0.5); fin(v); },
    gRong() { const v = V('gRong', 2); if (!v) return; const t = v.t; tone(v, 'sawtooth', 160, 60, t, 0.9, 0.18); burst(v, t, 0.9, 0.3, 'lowpass', 1400, 1, null, 300); vaoCrush(v, 0.3); duck(0.6, 1); fin(v); },
  };

  // =====================================================================================================
  //  NHẠC NỀN: synthwave / electro tuần tự (16 bước/ô nhịp, 4 ô vòng lặp)
  // =====================================================================================================
  const NH = { bpm: 112, buoc: 0, tiep: 0, muc: 0, mucMoi: 0, chay: false, timer: 0 };
  const PN = [{ r: 33, c: [57, 60, 64] }, { r: 29, c: [57, 60, 65] }, { r: 36, c: [55, 60, 64] }, { r: 31, c: [55, 59, 62] }]; // Am F C G
  const PB = [{ r: 33, c: [57, 60, 64] }, { r: 34, c: [58, 62, 65] }, { r: 33, c: [57, 60, 64] }, { r: 28, c: [56, 59, 64] }]; // Am Bb Am E (căng)
  const ARP = [0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5, 3, 4, 2, 1];
  const mv0 = (dich) => moV('m', dich || bus.nhac, false, 0);
  function buoc(i, t, muc) {
    const s = i & 15, bar = i >> 4, P = (muc >= 2 ? PB : PN)[bar & 3], sd = 60 / NH.bpm / 4;
    if (s === 0) pad(P, t, sd * 16, muc);
    if (muc >= 1 && s % 4 === 0) kick(t, muc);
    if (muc >= 1 && (s === 4 || s === 12)) clap(t, muc);
    if (muc >= 1 && s % 4 === 2) hat(t, 0.5, 0.06);
    if (muc >= 2 && s % 2 === 1) hat(t, s % 4 === 3 ? 0.3 : 0.2, 0.03);
    if (muc === 0) { if (s === 0) bass(hz(P.r + 12), t, sd * 14, 0, false); }
    else if (muc >= 2 || s % 2 === 0) bass(hz(P.r + (muc >= 2 ? (s & 1 ? 12 : 0) : ((s >> 1) & 1 ? 12 : 0))), t, sd * (muc >= 2 ? 0.9 : 1.7), muc, s % 4 === 0);
    if (muc > 0 || s % 2 === 0) { const ext = P.c.concat(P.c.map(x => x + 12)); arp(hz(ext[ARP[s]] + 12 + (muc >= 2 && bar & 1 ? 12 : 0)), t, muc); }
    if (muc >= 2 && s === 0) lead(hz(P.c[0] + 24), t, sd * 6);
  }
  function pad(P, t, d, muc) {
    bus.padF.frequency.setTargetAtTime([900, 1500, 2300][muc], t, 0.5);
    for (const m of P.c) for (const [k, dich] of [[0.996, bus.padL], [1.004, bus.padR]]) {
      const v = mv0(dich), o = osc(v, 'sawtooth', hz(m) * k, t, t + d + 0.3), g = gn(v);
      const p = g.gain; p.setValueAtTime(0, t); const pv = muc ? 0.03 : 0.045; p.linearRampToValueAtTime(pv, t + 0.35); p.setValueAtTime(pv, t + d - 0.25); p.linearRampToValueAtTime(0, t + d + 0.25);
      ch(o, g, v.out); fin(v);
    }
  }
  function kick(t, muc) {
    const v = mv0(); tone(v, 'sine', 150, 42, t, 0.28, muc >= 2 ? 1 : 0.85); burst(v, t, 0.01, 0.15, 'highpass', 3000, 0.7); fin(v);
    const p = bus.mPump.gain; p.setValueAtTime(0.35, t); p.linearRampToValueAtTime(1, t + 0.2); // sidechain "bơm"
  }
  function hat(t, vol, d) { const v = mv0(); burst(v, t, d, vol * 0.25, 'highpass', 7500, 0.7); fin(v); }
  function clap(t, muc) {
    const v = mv0(), k = muc >= 2 ? 0.8 : 0.5;
    for (let i = 0; i < 3; i++) burst(v, t + i * 0.011, 0.008, 0.25 * k, 'bandpass', 1600, 1.2);
    burst(v, t + 0.033, 0.13, 0.22 * k, 'bandpass', 1500, 1); tone(v, 'sine', 210, 150, t, 0.06, 0.12 * k); fin(v);
  }
  function bass(f, t, d, muc, nhan) {
    const v = mv0(bus.mPump), lp = loc(v, 'lowpass', 300, muc >= 2 ? 9 : 5);
    if (muc === 0) { tone(v, 'triangle', f, 0, t, d, 0.32, null, 0.4); fin(v); return; }
    const top = 400 + (nhan ? 700 : 350) + (muc >= 2 ? 900 : 0);
    lp.frequency.setValueAtTime(top, t); lp.frequency.exponentialRampToValueAtTime(180, t + d); lp.connect(v.out);
    tone(v, 'sawtooth', f, 0, t, d, 0.28, lp, 0.005); if (muc >= 2) tone(v, 'square', f * 0.5, 0, t, d, 0.12, lp, 0.005);
    fin(v);
  }
  function arp(f, t, muc) {
    const v = mv0(bus.mPump), lp = loc(v, 'lowpass', [1300, 2200, 3200][muc], 4); lp.connect(v.out);
    tone(v, muc >= 2 ? 'sawtooth' : 'square', f, 0, t, 0.16, [0.07, 0.04, 0.05][muc], lp);
    const s = gn(v, 0.45); v.out.connect(s); s.connect(bus.mDly); fin(v);
  }
  function lead(f, t, d) {
    const v = mv0(), o = tone(v, 'square', f, 0, t, d, 0.03, null, 0.02), m = osc(v, 'sine', 6, t, t + d + 0.1), mg = gn(v, f * 0.012); ch(m, mg, o.frequency);
    const s = gn(v, 0.6); v.out.connect(s); s.connect(bus.mDly); fin(v);
  }
  function lich() {
    if (!ac || ac.state !== 'running') return;
    const sd = 60 / NH.bpm / 4, now = ac.currentTime;
    if (NH.tiep < now - 0.05) NH.tiep = now + 0.06; // trễ (máy đứng/tab ẩn): bỏ nốt đã lỡ, không dồn
    while (NH.tiep < now + 0.32) {
      if ((NH.buoc & 15) === 0) NH.muc = NH.mucMoi; // đổi cường độ ở đầu ô nhịp
      buoc(NH.buoc, NH.tiep, NH.muc); NH.tiep += sd; NH.buoc++;
    }
  }
  function chayNhac() {
    if (NH.chay || !ac) return;
    NH.chay = true; NH.buoc = 0; NH.tiep = ac.currentTime + 0.1;
    NH.timer = setInterval(lich, 60); lich();
  }
  function dungNhac() { NH.chay = false; clearInterval(NH.timer); NH.timer = 0; }

  // ---------- mở khoá âm thanh (điện thoại) + tab ẩn ----------
  function mo() {
    if (!AC) return;
    if (!ac) {
      try { ac = new AC({ latencyHint: 'interactive' }); } catch (e) { try { ac = new AC(); } catch (e2) { return; } }
      bus = taoBus(ac);
      try { const b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(0); } catch (e) { } // iOS cũ
    }
    if (ac.state !== 'running' && !document.hidden) { try { ac.resume(); } catch (e) { } }
    if (batNhac) chayNhac();
  }
  ['pointerdown', 'touchend', 'mousedown', 'keydown'].forEach(e => document.addEventListener(e, mo, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => {
    if (!ac) return;
    try { if (document.hidden) ac.suspend(); else ac.resume(); } catch (e) { }
  });
  function nutNhan() {
    const T = (typeof TEXT !== 'undefined' && TEXT.ui) || {};
    document.querySelectorAll('[data-act="amthanh"]').forEach(e => { e.dataset.t = batSfx ? 'sfxOn' : 'sfxOff'; e.textContent = T[e.dataset.t] || (batSfx ? 'SFX: ON' : 'SFX: OFF'); });
    document.querySelectorAll('[data-act="nhac"]').forEach(e => { e.dataset.t = batNhac ? 'musicOn' : 'musicOff'; e.textContent = T[e.dataset.t] || (batNhac ? 'MUSIC: ON' : 'MUSIC: OFF'); });
  }
  nutNhan();
  function datGain(p, x) { if (!ac) return; const t = ac.currentTime; p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); p.linearRampToValueAtTime(x, t + 0.08); }

  // ---------- xuất file demo (OfflineAudioContext) ----------
  async function ghi(ten, args, dai, sr) {
    sr = sr || 22050;
    const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const oc = new OC(2, Math.ceil(dai * sr), sr), luu = bus, luuOff = offline;
    bus = taoBus(oc, true); offline = true;
    try {
      if (ten === 'nhac') { const sd = 60 / NH.bpm / 4, n = Math.floor((dai - 0.6) / sd); for (let i = 0; i < n; i++) buoc(i, 0.05 + i * sd, args[0]); }
      else if (ten === 'laser') { const L = taoLaser(0.01); tatLaser(L, dai - 0.5); }
      else if (ten === 'gatling3x') { for (let i = 0; i < Math.floor((dai - 0.3) / 0.052); i++) { lech = i * 0.052; S.lien(); } }
      else S[ten].apply(null, args || []);
    } finally { bus = luu; offline = luuOff; lech = 0; }
    return oc.startRendering();
  }

  const API = {
    mo, laser, ghi,
    // bật/tắt SFX (giữ tên cũ batTat) và NHẠC, lưu lại
    batTat() { batSfx = !batSfx; ghiLS('turret_sfx', batSfx); if (bus) datGain(bus.sfx.gain, batSfx ? VOL.sfx : 0); if (!batSfx && LZ) { tatLaser(LZ, ac.currentTime); LZ = null; } nutNhan(); return batSfx; },
    batTatNhac() { batNhac = !batNhac; ghiLS('turret_nhac', batNhac); if (bus) datGain(bus.nhac.gain, batNhac ? VOL.nhac : 0); if (batNhac) mo(); else setTimeout(() => { if (!batNhac) dungNhac(); }, 150); nutNhan(); return batNhac; },
    sfxBat: () => batSfx, nhacBat: () => batNhac, nutNhan,
    // cường độ nhạc: 0 menu · 1 trận · 2 trùm
    nhac(muc) { NH.mucMoi = Math.max(0, Math.min(2, muc | 0)); if (NH.chay && NH.muc > NH.mucMoi) NH.muc = NH.mucMoi; },
    thongKe: () => Object.assign({ ctx: ac ? ac.state : 'none', nhac: NH.chay, muc: NH.muc, laser: !!LZ }, TK),
    danhSach: Object.keys(S),
  };
  for (const k of Object.keys(S)) API[k] = S[k];
  return API;
})();
// móc âm thanh cho hiệu ứng triệu hồi/ghép/biến hình (hieuung.js) — dùng lại các giọng sẵn có, tắt chung bằng nút SFX
SND.lo = (bac) => SND.nang(2 + Math.min(3, bac || 0));       // lộ kết quả ghép (cao dần theo bậc)
SND.bien = () => SND.nap();                                   // nạp + khoá khi biến hình
SND.sao = () => SND.nang(5);                                  // đạt mốc sao SKILL UP / BINGO
SND.hu = () => SND.thucTinh();                                // tiếng hú Sói thức tỉnh
SND.xich = () => SND.hoTro();                                 // xích liên kết hình thành
