() => {
  T.save = (o) => G.testSave(Object.assign({ lvl: 30, gold: 99999, melee: 'sword', branch: 'fire', marksMoi: G.MARKS[1] + 30 }, o || {}));
  T.save(); G.setScene(G.Village); T.chay('lang', 120, 2);
  const VA = G.villageApi; VA.goHub(); VA.open('tu'); VA.V.tab = 'so'; T.chay('so', 10, 2); VA.goHub();
  for (const [r, s] of [[1, 4], [0, 3], [2, 5]]) { T.save(); const x = T.boss(r, true, { seed: s, save: { lvl: 30 } }); x.S.fade = 0; T.useBot(true); T.chay('trum' + r, 260, 2, null, () => T.song(0.5)); T.useBot(false); }
  for (const r of [1, 3]) { T.save(); G.rnd = G.srand(30 + r); G.startStage(r, 2, 0); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; S.P.weapons[0].ep = { b: 4 }; T.useBot(true); T.chay('phong' + r, 120, 2, null, () => T.song(0.5)); T.useBot(false); }
}
