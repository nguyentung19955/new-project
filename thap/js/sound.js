// TURRET MERGE — âm thanh tổng hợp nhẹ bằng WebAudio (không cần file), có giới hạn tần suất
'use strict';
const SND = (() => {
  let ac = null, tat = false, master = null;
  const lan = {}, nhieu = {};
  function mo() { if (ac || tat) return; try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.28; master.connect(ac.destination); } catch (e) { tat = true; } }
  function han(k, ms) { const n = performance.now(); if (lan[k] && n - lan[k] < ms) return false; lan[k] = n; return true; }
  function tone(f0, f1, dur, kieu, vol, tre) {
    if (!ac || tat) return;
    const t = ac.currentTime + (tre || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = kieu || 'square'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function on(dur, vol, loc) {
    if (!ac || tat) return;
    // bộ đệm tiếng ồn dựng 1 lần cho mỗi độ dài (trước đây tạo lại mỗi phát bắn → tốn CPU luồng chính)
    const t = ac.currentTime, kd = Math.round(dur * 100);
    let b = nhieu[kd];
    if (!b) {
      const n = Math.floor(ac.sampleRate * kd / 100); b = nhieu[kd] = ac.createBuffer(1, n, ac.sampleRate); const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    }
    const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = loc || 900; s.buffer = b; g.gain.value = vol || 0.3;
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  return {
    mo, batTat() { tat = !tat; if (master) master.gain.value = tat ? 0 : 0.28; return !tat; },
    phao() { if (han('phao', 90)) { on(0.18, 0.35, 700); tone(160, 50, 0.15, 'sine', 0.3); } },
    lien() { if (han('lien', 70)) on(0.05, 0.12, 2400); },
    bang() { if (han('bang', 120)) tone(1400, 700, 0.1, 'triangle', 0.08); },
    doc() { if (han('doc', 120)) on(0.12, 0.08, 1200); },
    tia() { if (han('tia', 120)) { on(0.1, 0.3, 3000); tone(900, 200, 0.12, 'sawtooth', 0.08); } },
    set() { if (han('set', 90)) { on(0.12, 0.18, 5000); tone(220, 900, 0.08, 'sawtooth', 0.06); } },
    laser() { if (han('laser', 200)) tone(620, 640, 0.2, 'sawtooth', 0.03); },
    nap() { if (han('nap', 150)) tone(300, 1200, 0.3, 'sine', 0.08); },
    rail() { if (han('rail', 120)) { on(0.25, 0.3, 4000); tone(1800, 120, 0.25, 'sawtooth', 0.12); } },
    sam() { on(0.6, 0.5, 600); tone(90, 30, 0.6, 'sawtooth', 0.3); },
    hoden() { tone(200, 40, 1.2, 'sine', 0.25); },
    no(m) { if (han('no', 60)) { on(0.3 + (m || 0.3) * 0.3, 0.3 + (m || 0.3) * 0.3, 500); } },
    dat() { if (han('dat', 50)) tone(220, 90, 0.09, 'sine', 0.25); },
    ghep() { tone(500, 1200, 0.12, 'triangle', 0.2); tone(800, 1600, 0.15, 'triangle', 0.15, 0.08); },
    nang() { tone(400, 800, 0.1, 'square', 0.1); tone(600, 1200, 0.12, 'square', 0.1, 0.09); tone(900, 1800, 0.15, 'square', 0.1, 0.18); },
    mana() { if (han('mana', 200)) tone(1200, 1800, 0.1, 'sine', 0.08); },
    mv() { tone(200, 900, 0.4, 'sawtooth', 0.15); on(0.4, 0.2, 2000); },
    bao() { tone(880, 440, 0.25, 'square', 0.12); tone(880, 440, 0.25, 'square', 0.12, 0.3); },
    lot() { tone(200, 60, 0.4, 'square', 0.25); },
    nut() { if (han('nut', 40)) tone(700, 900, 0.05, 'square', 0.06); },
  };
})();
