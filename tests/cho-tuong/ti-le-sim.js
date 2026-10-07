// Mô phỏng tỉ lệ chợ tướng (v180, chợ ra mọi tướng Thường, đội 6 tướng là đội ưu tiên): đổi chợ N lần ở các tình huống, đo tỉ lệ ra tướng ghép được.
// Dùng chung cho test (ti-le.test.js) và in số liệu: node tests/cho-tuong/ti-le-sim.js
// Chỉ dùng API chung của mọi phiên bản chợ (rerollMarket / market.types / spawnHero) để so được trước / sau.
// claude/bo-chon-doi: bỏ đội ưu tiên — DECK chỉ còn dùng để đếm "thẻ ngoài 6 tướng cũ" (so với trước); owned = đủ 20 tướng Thường
// + tướng Tím của tình huống (owned: null = sở hữu MỌI tướng Tím / Vàng — đo độ loãng khi nhiều công thức cùng gần xong).
const { open, enter } = require('./helpers');

const DECK = ['nguphu', 'thansuong', 'lactuong', 'lucsi', 'xathu', 'thaymo'];
// [loại, sao] trên sân
const GIUA = [['lactuong', 2], ['lactuong', 1], ['lucsi', 1], ['xathu', 2], ['thaymo', 1], ['thansuong', 1], ['lucsi', 1]];
const CASES = {
  'dau-tran': { name: 'Đầu trận (1 tướng ★ trên sân)', board: [['lactuong', 1]], owned: [] },
  'giua-tran': { name: 'Giữa trận (7 tướng: 5 loại, sao lẫn lộn)', board: GIUA, owned: [] },
  'thieu-hop-the': { name: 'Thiếu 1 nguyên liệu hợp thể (Ngư Phủ ★★, chưa có Thần Sương → Cá Ông)', board: [['nguphu', 2], ['lactuong', 2], ['lucsi', 1], ['xathu', 1], ['thaymo', 2]], need: 'thansuong', owned: ['caong'] },
  'giua-tran-moi-tim': { name: 'Giữa trận, sở hữu MỌI tướng Tím / Vàng', board: GIUA, owned: null },
};

// seed: Math.random cố định (mulberry32) trong lúc mô phỏng → kết quả lặp lại được, test không chập chờn; null = ngẫu nhiên thật
async function simulate(page, key, n = 1000, seed = 12345) {
  const c = CASES[key];
  return page.evaluate(([c, n, DECK, seed]) => {
    const rnd0 = Math.random;
    if (seed != null) { let a = seed >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    try {
    game.running = false;
    game.deck = [...DECK];      // bản trước claude/bo-chon-doi: đội ưu tiên; bản sau: bỏ qua
    game.owned = c.owned ? new Set([...BASIC_HEROES, ...c.owned]) : null;
    for (let s = 0; s < game.heroes.length; s++) game.heroes[s] = null;
    c.board.forEach(([t, tier]) => game.spawnHero(game.freeSlots()[0], t, { tier, spent: 60 }));
    game.freshMarket();
    const onBoard = new Set(c.board.map(([t]) => t));
    const star1 = new Set(c.board.filter(([, tier]) => tier === 1).map(([t]) => t));
    let twin = 0, board = 0, need = 0, dry = 0, maxDry = 0, needDry = 0, maxNeedDry = 0, cards = 0, boardCards = 0, outDeck = 0; const kinds = new Set();
    for (let i = 0; i < n; i++) {
      game.gold = 1e6;
      if (game.market) game.market.rr = 0;
      game.rerollMarket();
      const T = game.market.types;
      const hitB = T.some((t) => onBoard.has(t));
      if (T.some((t) => star1.has(t))) twin++;
      if (hitB) board++;
      cards += T.length; boardCards += T.filter((t) => onBoard.has(t)).length; outDeck += T.filter((t) => !DECK.includes(t)).length; T.forEach((t) => kinds.add(t));
      dry = hitB ? 0 : dry + 1; maxDry = Math.max(maxDry, dry);
      if (c.need) {
        const h = T.includes(c.need);
        if (h) need++;
        needDry = h ? 0 : needDry + 1; maxNeedDry = Math.max(maxNeedDry, needDry);
      }
    }
    const pct = (x) => Math.round(x / n * 1000) / 10;
    return { twin: pct(twin), board: pct(board), boardCards: Math.round(boardCards / cards * 1000) / 10, maxDry, outDeck: Math.round(outDeck / cards * 1000) / 10, kinds: kinds.size,
      need: c.need ? pct(need) : null, maxNeedDry: c.need ? maxNeedDry : null };
    } finally { Math.random = rnd0; }
  }, [c, n, DECK, seed]);
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
      console.log(`${CASES[k].name}: ≥1 thẻ ghép ngay (trùng ★) ${r.twin}% · ≥1 thẻ tướng đang có ${r.board}% · thẻ là tướng đang có ${r.boardCards}% · chuỗi trượt dài nhất ${r.maxDry} · thẻ ngoài đội ${r.outDeck}% · ${r.kinds} loại`
        + (r.need != null ? ` · ra nguyên liệu thiếu ${r.need}% (trượt liền dài nhất ${r.maxNeedDry})` : ''));
    }
  }).catch((e) => { console.error(e); process.exit(1); });
}
