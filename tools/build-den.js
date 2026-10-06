// Sinh dữ liệu 40 tướng mới (có bộ ảnh vẽ tay) cho trang Đền Anh Hùng: node tools/build-den.js
// Ghi vào khối <script id="den-new"> trong den-anh-hung.html.
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');
const ctx = { console, window: {}, document: { createElement: () => ({ getContext: () => ({}) }) }, Image: function () {}, localStorage: { getItem() {}, setItem() {} }, navigator: {} };
vm.createContext(ctx);
for (const f of ['art', 'data']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8').replace(/^(const|let) /gm, 'var '), ctx);
const { HEROES, FUSION } = ctx;
const file = path.join(ROOT, 'den-anh-hung.html');
let html = fs.readFileSync(file, 'utf8');
const have = new Set([...html.replace(/<script id="den-new">[\s\S]*?<\/script>/, '').matchAll(/id:'(\w+)'/g)].map((m) => m[1]));
const EL = { kim: ['Hành Kim', '#D9DDE0', 'spark'], moc: ['Hành Mộc', '#5FB84A', 'leaf'], thuy: ['Hành Thủy', '#5A9AE0', 'drop'], hoa: ['Hành Hỏa', '#E0452C', 'ember'], tho: ['Hành Thổ', '#C99A3C', 'rock'] };
const RAR = { legendary: 'Huyền thoại', epic: 'Sử thi' };
const recipeOf = (t) => (FUSION || []).filter((f) => f.to === t).map((f) => `${HEROES[f.a].name} + ${HEROES[f.b].name}`).join(' / ');
const list = Object.keys(HEROES).filter((t) => !have.has(t) && fs.existsSync(path.join(ROOT, 'assets/packs', t, 'idle.png'))).map((t) => {
  const d = HEROES[t], e = EL[d.el] || EL.kim, ranged = d.attack !== 'melee';
  return { id: t, name: d.name, attr: e[0], rar: RAR[d.legend] || 'Thường', pack: 1, ranged: ranged ? 1 : 0, el: e[2], col: e[1],
    sig: d.trait ? [d.trait.name, d.trait.desc] : [d.title || '', ''], recipe: recipeOf(t),
    skills: d.skills.map((s, i) => ({ k: 'QWER'[i], n: s.name, t: i === 3 ? 'Tối thượng' : s.active ? 'Chủ động' : 'Nội tại', d: s.info(5), c: e[1] })) };
});
const block = `<script id="den-new">window.DEN_NEW=${JSON.stringify(list)};</script>`;
html = html.includes('<script id="den-new">') ? html.replace(/<script id="den-new">[\s\S]*?<\/script>/, () => block) : html.replace('<script src="https://cdnjs', () => block + '\n<script src="https://cdnjs');
fs.writeFileSync(file, html);
console.log('tướng mới', list.length, list.filter((x) => x.recipe).length, 'có công thức');
