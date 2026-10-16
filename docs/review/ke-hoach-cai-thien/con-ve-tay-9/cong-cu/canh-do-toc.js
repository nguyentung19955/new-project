() => {
  const out = {};
  const G0 = window.G;
  const ui = document.getElementById('ui'), wc = document.getElementById('world');
  const flush = () => { wc.getContext('2d').getImageData(0, 0, 1, 1); ui.getContext('2d').getImageData(0, 0, 1, 1); };
  for (const [ten, r, big] of [['bien-trum', 1, true], ['song-phong', 3, null], ['song-trum', 3, true]]) {
    G.testSave({ lvl: 30 });
    if (big === null) { T.vao = T.vao || ((rr) => { G.startStage(rr, 2, 0); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; }); T.vao(r); const S = G.getRun(); const id = S.map.rooms.findIndex((x) => x.type === 'fight'); G.gotoRoom(id); }
    else { const x = T.boss(r, big, { seed: 5, save: { lvl: 30 } }); x.S.fade = 0; }
    T.useBot(true);
    for (let k = 0; k < 5; k++) { T.frame(1); flush(); }
    const ts = [];
    for (let k = 0; k < (window.__N || 12); k++) { const t0 = performance.now(); T.frame(1); const t1 = performance.now(); flush(); ts.push([+(t1 - t0).toFixed(1), +(performance.now() - t1).toFixed(1)]); }
    T.useBot(false);
    const tb = (i) => +(ts.reduce((a, b) => a + b[i], 0) / ts.length).toFixed(1); out[ten] = { js_ms: tb(0), to_ms: tb(1), khung: ts.length };
  }
  return out;
}
