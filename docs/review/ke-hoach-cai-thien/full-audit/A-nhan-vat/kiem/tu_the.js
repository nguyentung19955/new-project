// Danh sách tư thế (đủ trạng thái) và hàm vẽ một ô em bé. Dùng trong page.evaluate (chuỗi được nạp bằng add_script_tag).
window.AUD = (function () {
  const VK = (t) => (t ? { type: t, family: { sword: 3, bow: 2, spear: 1, hammer: 3 }[t], tier: 2, rarity: 2, stage: 0, el: null } : null);
  function tuThe(wt) {
    const L = [];
    const P = (o) => Object.assign({ dead: false, hurtT: 0, dashT: 0, specT: 0, castT: 0, mv: null, comboI: 0, st: {} }, o || {});
    for (const t of [0, 0.35, 0.7]) L.push(['đứng ' + t, { t, p: P() }]);
    for (let i = 0; i < 8; i++) L.push(['chạy ' + i, { move: true, t: 0.3, tc: i * 0.65 / 8 + 0.01, p: P() }]);
    if (wt === 'sword') { for (const cb of [0, 1, 2]) for (const u of [0.2, 0.6]) L.push(['chém ' + cb + '/' + u, { atk: u, p: P({ comboI: cb }) }]); }
    else for (const u of [0.05, 0.2, 0.35, 0.5, 0.65, 0.85]) L.push(['đánh ' + u, { atk: u, p: P() }]);
    L.push(['chạy+đánh', { move: true, atk: 0.45, tc: 0.2, p: P() }]);
    for (const ch of [0.1, 0.6, 1]) L.push(['giữ ' + ch, { p: P({ mv: { holding: true, charge: ch } }) }]);
    for (const k of [0.3, 0.1]) L.push(['chưởng ' + k, { p: P({ castT: k }) }]);
    for (const k of [0.3, 0.15, 0.02]) L.push(['chiêu ' + k, { p: P({ specT: k }) }]);
    for (const u of [0.05, 0.25, 0.45, 0.65, 0.85]) L.push(['lộn ' + u, { dodge: u, p: P() }]);
    for (const k of [0.18, 0.08]) L.push(['trúng ' + k, { p: P({ hurtT: k }) }]);
    for (const k of [0.05, 0.2, 0.4, 0.7]) L.push(['chết ' + k, { p: P({ dead: true, deadT: k }) }]);
    return L;
  }
  // of: outfit (tên hình); trả o để vẽ
  function oCua(key, of, wt, face, pose) {
    const p = Object.assign({}, pose[1].p, { outfit: of });
    const o = Object.assign({ x: 32, y: 54, face, key, move: false, t: 0.3, atk: -1, dodge: -1, weapon: VK(wt), helm: null, armor: null, outfit: of, roundShadow: true, noShadow: true }, pose[1], { p });
    return o;
  }
  function outfit(bo, gear) {
    const O = G.outfit, of = Object.assign({}, gear || {});
    if (bo) of.robe = { rung: 'ao_vo_cay', bien: 'ao_vay', lau: 'ao_long' }[bo];
    of.fx = Object.assign({ els: [] }, O && O.fxThanBo ? O.fxThanBo(of) : {});
    return of;
  }
  function ve(c, o) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 64, 64); try { G.art.hero(c, o); } catch (e) { return String(e); } return null; }
  return { tuThe, oCua, outfit, ve, VK };
})();
