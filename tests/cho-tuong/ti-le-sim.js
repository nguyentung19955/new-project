// Mô phỏng tỉ lệ chợ tướng (v180): đổi chợ N lần ở các tình huống, đo tỉ lệ ra tướng ghép được.
// Dùng chung cho test (ti-le.test.js) và in số liệu: node tests/cho-tuong/ti-le-sim.js
// Chỉ dùng API chung của mọi phiên bản chợ (rerollMarket / market.types / spawnHero) để so được trước / sau.
const { open, enter } = require('./helpers');

const DECK = ['nguphu', 'thansuong', 'lactuong', 'lucsi', 'xathu', 'thaymo'];
// [loại, sao] trên sân
const CASES = {
  'dau-tran': { name: 'Đầu trận (1 tướng ★ trên sân)', board: [['lactuong', 1]] },
  'giua-tran': { name: 'Giữa trận (7 tướng: 5 loại, sao lẫn lộn)', board: [['lactuong', 2], ['lactuong', 1], ['lucsi', 1], ['xathu', 2], ['thaymo', 1], ['thansuong', 1], ['lucsi', 1]] },
  'thieu-hop-the': { name: 'Thiếu 1 nguyên liệu hợp thể (Ngư Phủ ★★, chưa có Thần Sương → Cá Ông)', board: [['nguphu', 2], ['lactuong', 2], ['lucsi', 1], ['xathu', 1], ['thaymo', 2]], need: 'thansuong' },
};

async function simulate(page, key, n = 1000) {
  const c = CASES[key];
  return page.evaluate(([c, n, DECK]) => {
    game.running = false;
    game.deck = [...DECK];
    game.owned = null;
    for (let s = 0; s < game.heroes.length; s++) game.heroes[s] = null;
    c.board.forEach(([t, tier]) => game.spawnHero(game.freeSlots()[0], t, { tier, spent: 60 }));
    game.freshMarket();
    const onBoard = new Set(c.board.map(([t]) => t));
    const star1 = new Set(c.board.filter(([, tier]) => tier === 1).map(([t]) => t));
    let twin = 0, board = 0, need = 0, dry = 0, maxDry = 0, needDry = 0, maxNeedDry = 0, cards = 0, boardCards = 0;
    for (let i = 0; i < n; i++) {
      game.gold = 1e6;
      if (game.market) game.market.rr = 0;
      game.rerollMarket();
      const T = game.market.types;
      const hitB = T.some((t) => onBoard.has(t));
      if (T.some((t) => star1.has(t))) twin++;
      if (hitB) board++;
      cards += T.length; boardCards += T.filter((t) => onBoard.has(t)).length;
      dry = hitB ? 0 : dry + 1; maxDry = Math.max(maxDry, dry);
      if (c.need) {
        const h = T.includes(c.need);
        if (h) need++;
        needDry = h ? 0 : needDry + 1; maxNeedDry = Math.max(maxNeedDry, needDry);
      }
    }
    const pct = (x) => Math.round(x / n * 1000) / 10;
    return { twin: pct(twin), board: pct(board), boardCards: Math.round(boardCards / cards * 1000) / 10, maxDry,
      need: c.need ? pct(need) : null, maxNeedDry: c.need ? maxNeedDry : null };
  }, [c, n, DECK]);
}

async function runAll(n = 1000) {
  const { browser, page, errors } = await open(844, 390);
  await enter(page, 0);
  const out = {};
  for (const k of Object.keys(CASES)) out[k] = await simulate(page, k, n);
  await browser.close();
  return { out, errors };
}

module.exports = { CASES, simulate, runAll };

if (require.main === module) {
  runAll(+process.argv[2] || 1000).then(({ out }) => {
    for (const k in out) {
      const r = out[k];
      console.log(`${CASES[k].name}: ≥1 thẻ ghép ngay (trùng ★) ${r.twin}% · ≥1 thẻ tướng đang có ${r.board}% · thẻ là tướng đang có ${r.boardCards}% · chuỗi trượt dài nhất ${r.maxDry}`
        + (r.need != null ? ` · ra nguyên liệu thiếu ${r.need}% (trượt liền dài nhất ${r.maxNeedDry})` : ''));
    }
  }).catch((e) => { console.error(e); process.exit(1); });
}
