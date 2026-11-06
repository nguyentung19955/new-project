// sinh docs/demo-hop-tuong/tuvan/anim/ARCHETYPE.md từ thap/js/anim-meta.js (+ tên hiển thị trong thap/js/data.js nếu đọc được)
const fs = require('fs'), path = require('path');
global.window = global; require(path.join(__dirname, '..', 'thap', 'js', 'anim-meta.js'));
const data = fs.readFileSync(path.join(__dirname, '..', 'thap', 'js', 'text.js'), 'utf8'), ten = {};
for (const m of data.matchAll(/^\s+([a-z0-9]+):\s*\{\s*name:\s*'([^']+)'/gm)) ten[m[1]] = m[2];
const MO = {
  cannon: 'thụt nòng ease-out 55 ms → lò xo hồi ~220 ms (vượt nhẹ) · tụ lực 110 ms', nang: 'giật mạnh hơn (đến 8%), hồi chậm 250 ms · tụ lực 170 ms',
  revolver: 'giật + xoắn nòng ±0,07 rad luân phiên (ổ đạn xoay) · hồi 170 ms', gatling: 'quay nòng tăng/giảm theo phát bắn (τ 0,7 s), rung ngang theo pha quay, chớp nòng so le trái/phải',
  beam: 'không giật mạnh; tụ sáng 180 ms; tia nối socket→quái, alpha dao động rất nhẹ', chain: 'cuộn sáng tụ 150 ms; sét lan theo danh sách trúng THẬT, ~45 ms/mắt xích (tổng ≤ 160 ms)',
  ice: 'tụ lạnh 140 ms, giật nhẹ, hồi chậm 230 ms', poison: 'giật nhẹ, tụ 100 ms', support: 'không ngắm/giật: nạp (phồng 1,2% theo T.nap) → xung lò xo 6% → toả sáng tắt dần',
  drone: 'lơ lửng (nhún 0,9 px + phóng ±1,2% “độ sâu”), giật nhẹ', portal: '2 lớp ảnh đầu quay ngược chiều (0,7 / −1,25 rad/s) trên đầu', chrono: '2–3 dư ảnh theo góc đầu đã lưu (45 ms/mẫu), chỉ hiện khi đầu đang xoay',
  evolver: 'mở → khoá theo lớp: phồng ngang/dẹt dọc 4,5% lên 150 ms, lò xo về ~460 ms; neo ô giữ nguyên',
};
let s = '# Nhóm chuyển động (archetype) — 93 ụ\n\nSinh từ `thap/js/anim-meta.js` bằng `node tools/thap-anim-bang.js`. Mọi ụ đều có: thở lõi 1–3% + nhún nhỏ (lệch pha theo ụ), ngắm theo góc ngắn nhất (lò xo tới hạn của luật, vẽ nội suy), muzzle socket xoay theo đầu.\n\n| Nhóm | Số ụ | Chuyển động | Ụ |\n|---|---|---|---|\n';
const nh = {}; for (const [id, n] of Object.entries(ANIM_U)) (nh[n] = nh[n] || []).push(id);
for (const [n, N] of Object.entries(ANIM_NHOM)) s += `| ${N.ten} (\`${n}\`) | ${(nh[n] || []).length} | ${MO[n] || ''} | ${(nh[n] || []).map(id => (ten[id] || id) + ' `' + id + '`').join(', ')} |\n`;
s += `\nTổng: ${Object.keys(ANIM_U).length} ụ.\n\n## Tham số\n\n| Nhóm | kick | kMs | rMs | z | ant ms | thở s | glow | nhún px |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const [n, N] of Object.entries(ANIM_NHOM)) s += `| ${n} | ${N.kick} | ${N.kMs} | ${N.rMs} | ${N.z} | ${N.ant} | ${N.per} | ${N.glow} | ${N.bob} |\n`;
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'demo-hop-tuong', 'tuvan', 'anim', 'ARCHETYPE.md'), s);
console.log('ok', Object.keys(ANIM_U).length);
