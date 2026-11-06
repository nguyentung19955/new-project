# VFX P0 — Số thật & đọc được (REVIEW-VFX-93 IX P0/P1/P2, X 'PHASE P0', II.C, II.H, II.I)

Code: `thap/js/thatso.js` (nạp cuối) + sửa nhỏ ở data.js, hotro.js, skills*.js, support.js, unitpage.js, skilldemo.js, quaianim.js, fxu.js, meta.js, text.js.
Kiểm: `tools/thap-kt-vfx-p0.js` (trong `thap-kt-hoiquy.js`, CHI=vfx). Ảnh: `tools/thap-chup-vfx-p0.js` → thư mục này.

## Đã sửa (đối chiếu code trước khi sửa)
| Mục review | Sự thật trong code | Sửa |
|---|---|---|
| Time Bomb / Scrap Forge / Genesis Core / Holy Halo / Evolver: CARD LV '+damage' | dmg = 0, +% sát thương vô tác dụng | KY_NANG_CAP mới: Weaken 10→13.5%, Per stack 4→5.5%, Raise time 100→92%, Barrier 3→3.5 s, Fuse time 100→88% — nối vào đúng công thức chơi; hàng CARD LV hiện dòng kỹ năng, không còn '+damage' |
| Armor Breaker, Crit Antenna, Reaper, Radar 7★ vượt trần | trần nhóm HOTRO.CAP × bậc | số hiển thị = HOTRO.hd (số thật khi là nguồn duy nhất); Radar 7★ OVERDRIVE ghi phần thật (+7% ở 7★) |
| (thêm, tự tìm) Cryo, Rainbow, Star Breaker, Focus Lens (SUP), Mirror Gate (ghi 35% thay vì 52%), Sanctum (ghi 35% thay vì 52%), Chiller (38% thay vì 35%), Reaper mô tả 15% thay vì 19.5% | | cùng 1 hàm HOTRO.hd |
| Pandora 7★, Hero Foundry 7★, Jammer 7★ | hiệu ứng ghép đọc sao ĐẦU VÀO; 7★ không ghép được | 7★: 'cannot merge again — merge skill off'; Pandora theo sao kết quả (5+5→6 quay 2, 6+6→7 mở 2 phép 1 lần); mốc 7★ chữ đổi, APEX ×1.3 chung vẫn áp |
| Scrap Forge 'VĨNH VIỄN' | buff nằm trên Forge | 'while the Forge stays on the board' (EN + VI roster) |
| Mana Core 3★/7★ | 6 s / 5 s | SUP chữ đọc SKILLS.mana.ky |
| Mine Layer, Marionette | nhịp chia tốc bắn | mô tả = nhịp thật (đã gồm buff + mốc) · Hydra/Orbital đã đúng |
| Laser 7★ +crit | tia crit:false | mốc 7★: '+30% damage (the beam never crits)' |
| Cryo / Holy Halo (+ Chrono Throne) tự phát | aiNen tự gọi chuDong | mô tả ghi điều kiện tự phát; huy hiệu PNG 'tự phát' (vfxp0_tudong) góc trên-trái ô 0.9 s — chạm tay không bật |
| Hive Queen 5★ QUICK BROOD; Leviathan/Wyrm/Genesis mốc 5★ | tăng đều theo sao; dạng đổi ở 4★ | chữ mốc ghi 'mỗi ★' / 'From 4★ (tên dạng)' |
| Jammer tên 'Clamp' | | roster = Jammer |
| Blood Circuit 'ANY' | không nhận Blood Circuit | 'any other turret (not another Blood Circuit)' |
| Scrambler chỉ ghi PVP | Solo/Co-op ghép cặp ụ lẻ | thêm vào TEXT |
| Mirror Gate / Scrap Forge vai | code ht / db | roster vai sửa |
| Resonance 'đạn vọng' | chỉ hình | 'visual only, no extra damage' |
| Frost quái to | | '(bosses 0.6s; big enemies shorter)' |
| Hex Saboteur Doom Hex 7★ | sao đầu vào ≤ 6 | 'hex off at 7★ (best = two 6★)' |
| Sanctum 5★ | trận đã đúng 8 ô (HOTRO.oDich) — trang ụ vẽ 4 + gọi là 'ô chéo' | trang ụ: 1–4★ 4 ô, 5★ 8 ô; test range đặt ụ đúng ô |
| FX hitbox | | vũng Toxic Pool rộng = r+8 (vùng trúng); đĩa Black Hole = bán kính hút; nón Wyrm đo từ tâm ụ (rút đoạn nòng). Wall Projector: vòng nổ = r+2, đã khớp. Cryo: vòng bão băng = r×1.6, đã khớp |
| II.C/II.I trạng thái | mỗi trạng thái đã có 1 ảnh riêng (tờ ST) | tối đa 2 dấu/quái, ưu tiên đóng băng > choáng > cháy > độc > dấu yếu > chậm |
| II.H vòng/huy hiệu 15 ô | sao trên-phải, đếm ở đáy, bản sao/tự phát trên-trái | không chồng |

## Đã có (bỏ qua)
Vòng skill xanh theo chiều kim đồng hồ · Evolver đếm ngược + 7★ xịt + mất sao đếm lại · màn kết quả · tải 1 lần · Evolver 'mất sao' (đã chốt: đếm lại từ đầu).
