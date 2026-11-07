# Cần bạn quyết — cộng hưởng luật (07/11/2026) — **ĐÃ CHỐT 13:27–13:31**

Người dùng chọn: 1B · 2A · 3B · 4A · 5A · 6B · 7B · 8B · 9A · 10B. Test khoá đúng luật đã chốt: `tools/thap-kt-cong-huong-luat.js` nhóm 9 (+ nhóm 2, 7, 8 cập nhật); `tools/thap-kt-matran.js` cặp băng × Janus đổi GIỮ → CHẶN.

| # | Câu hỏi | Chốt | Đã làm |
|---|---|---|---|
| 1 | Mimic + Scrap Forge ≤3★ | **B**: ghép thường (Mimic thắng); Forge chỉ ăn ụ khác Mimic | `skills4.js` loren.ghepDB.hopLe bỏ Mimic |
| 2 | Archive tính MK / Blood Circuit / La Bàn là ghép? | **A** giữ (đã bỏ Teleporter/Copycat/Overclock/Forge) | — |
| 3 | Khiên ụ × Signal Jammer phần +mana triệu hồi | **B**: ụ bị nhắm chặn được nhiễu (khiên / Mirror / Holy Shield) → chặn luôn +mana | `skills4.js`: +mana áp lúc nhiễu trúng (HU.nhieu), bỏ nếu có chặn |
| 4 | Blood Circuit khác sao khi VAMP < 2 | **A** giữ (vẫn hiến, không nổ) | — |
| 5 | Eve tẩy câm / tê / kẹp | **A** giữ đúng chữ thẻ | — |
| 6 | Mirror Gate phản Kẹp qua khiên đối thủ | **B**: khiên ụ / Holy Shield bên kia chặn; không phản dây chuyền | `skills4.js`: gọi chặn gốc (`_chanKhienGoc`, bỏ qua Mirror bên kia); bỏ ụ khoá |
| 7 | Ụ khoá nhận trạng thái xấu mới? | **B**: ụ ĐÁ / BĂNG không nhận trạng thái xấu MỚI (cháy, kẹp, câm, tê, −tốc, hoá đá chồng băng); **HẠ SAO vẫn trúng** (Nightmare, Star Leech, Hex −1★, haSao) | `game.js` Octopus/Janus bỏ ụ khoá · `trum.js` Static Jammer bỏ ụ khoá · `skills2.js` Clamp PVP + Star Breaker −8% tốc bỏ ụ khoá · `skills7.js` Hex tê liệt bỏ ụ khoá · Mirror phản bỏ ụ khoá. Nightmare / Hex vẫn không CHỌN ô đá làm mục tiêu như cũ (luật "trùm không nhắm ô đá"); đã nhắm trúng thì vẫn −1★. |
| 8 | REINFORCE bỏ ụ băng | **B** | `chihuy.js` yeuNhat bỏ cả ụ băng |
| 9 | Kỹ năng khi ghép của bản sao −% | **A** giữ | — |
| 10 | Ô băng nhận buff hỗ trợ | **B**: ô băng không nhận (không icon buff giả) | `hotro.js` nhan + nhánh ụ không phải hỗ trợ |

Chữ thẻ: không đổi — Mimic "Merges with any same-star turret" nay đúng với Forge; các luật còn lại là luật nền, không có số/câu trên thẻ bị sai.
