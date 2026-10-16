() => { window.__EX = 1;
  T.save = (o) => G.testSave(Object.assign({ lvl: 30, gold: 99999, melee: 'sword', branch: 'fire', marksMoi: G.MARKS[1] + 30 }, o || {}));
  T.save();
  const { W, P, b } = T.boss(1, true, { seed: 4, save: { lvl: 30 } });
  T.useBot(true);
  T.chay('ngu', 200, 2, null, () => T.song(0.5));
  return { boss: b && b.kind };
}
