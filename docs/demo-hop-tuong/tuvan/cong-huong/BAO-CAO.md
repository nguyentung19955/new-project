# Báo cáo rà lỗi CỘNG HƯỞNG LUẬT (07/11/2026)

Vì sao: người dùng nhiều lần gặp lỗi "2 luật gặp nhau, 1 luật âm thầm thắng" (Vua Ghép VÀNG lên Vua Ghép chỉ +1★; Hộp Bí Ẩn "Does not shoot" vẫn chọc). Lần này máy kiểm có hệ thống: `node tools/thap-kt-cong-huong-luat.js` (**339 cặp**, ~25 s, nằm trong `tools/thap-kt-hoiquy.js`). Kiểm kê nguồn × đích: [KIEM-KE.md](KIEM-KE.md). Ý kiến ChatGPT: [CHATGPT.md](CHATGPT.md) (40 ca → 26 cặp test nhóm 8). Câu hỏi mở: [CAN-HOI.md](CAN-HOI.md).

## Lỗi tìm thấy (4) — đã sửa cả 4
| Cặp | Mong đợi (thẻ / luật) | Thực tế trước | Sửa? |
|---|---|---|---|
| RAGE × bom **Drone** khi ghép | thẻ RAGE "+100% damage to the whole board" → ×2 | ×1 (bom tính bằng `hsU`, bỏ qua RAGE) | **Đã sửa** `skills2.js` SKILLS.drone.ghep |
| RAGE × nổ **Blood Circuit** (hiến khác sao) | ×2 | ×1 | **Đã sửa** `skills7.js` ghepDB.lam |
| **Fusion Archive** × Teleporter / Copycat / Overclock / Scrap Forge | "every merge you make +1"; luật dự án (Star Breaker, conghuong2): 4 kỹ năng này KHÔNG phải ghép | +1 mỗi lần — **Teleporter đổi chỗ qua lại 20 lần = +20 điểm, nuôi Archive vô hạn không tốn gì** | **Đã sửa** `vangmoi1.js` (đếm ghepN chỉ khi ghép thật; cũng sửa "Archive mới nhận 50%") |
| **Holy Shield (Eve)** × Signal Jammer PVP | thẻ Eve "blocks … rival merge effects" | chặn phần nhiễu ụ nhưng **+mana lần triệu hồi kế** vẫn trúng | **Đã sửa** `skills4.js` (khiên toàn bàn chặn luôn phần giá) |

## Bảng theo nhóm (kết quả sau sửa: đạt hết)
| Nhóm | Cặp | Mong đợi | Thực tế | Sửa? |
|---|---|---|---|---|
| 1 · 7 ghép đặc biệt (Merge King, Teleporter, Copycat, Overclock, Scrap Forge, Blood Circuit, Pháo La Bàn) × nguồn {thường, vàng, đá, băng, bản sao} × đích {thường, đá, băng, cháy, bản sao, MK vàng, Sói thức tỉnh, 7★} × **mọi 93 ụ đích** | 232 | nguồn khoá → không; đích khoá → chỉ MK/Teleporter/Copycat; MK cùng thân +1★ (vàng +2★, trần 7) giữ mọi trạng thái; MK+MK giữ vàng; Teleporter giữ đá/băng/sao; Copycat: bản sao không khoá, giữ vàng/thức tỉnh; Overclock chỉ ụ bắn; Forge ≤3★; Blood ra sao cao hơn; đá+đá ghép được | đúng | — |
| 2 · 21 kỹ năng khi ghép × {thường, Mimic 2 chiều, đá+đá, MK/Teleporter/Copycat kéo lên} × SOLO/PVP/CO-OP | 21 | thường/Mimic 1 lần; đá+đá / ghép đặc biệt 0 lần; bàn nhất quán | đúng (Forge+Mimic: Forge ăn → CAN-HOI #1) | — |
| 3 · RAGE × đòn đầu của mọi 93 ụ (3 hạt RNG) + 8 kỹ năng khi ghép | 9 | ×2 | đúng | — |
| 3b · RAGE × sát thương tính sẵn lúc ghép | 2 | ×2 | **×1** | **đã sửa** (Drone, Blood Circuit) |
| 4 · bản sao Copycat × đòn đầu mọi ụ | 1 | ×% sao chép (70%) | đúng | — |
| 5 · bộ đếm: Archive × 7 kiểu ghép, Teleporter qua lại, giữ max khi cùng loại (Forge/Hộp/Evolver/Nine-Tail/Ember), Evolver × −1★ / MK +1★ | 15 | xem cột trên | Archive +1 với 4 kỹ năng không phải ghép | **đã sửa** |
| 6 · 6 chiêu trùm cũ × Holy Shield / khiên 1 lần / Mirror Gate sẵn; Mirror × Janus 3 ụ (chặn đúng 1); Nightmare × 1★; Mad Crown/Joker × đá/băng; Halo | 25 | chặn đúng lớp, tiêu đúng 1 lớp | đúng | — |
| 7 · PVP Holy Shield / khiên 1 lần × Clamp, Scrambler, Hex, Signal Jammer | 8 | bàn đối thủ + giá không đổi | Signal Jammer +mana lọt Holy Shield | **đã sửa** |
| 8 · ca từ ChatGPT (#2,4,5/13,8,11,12,14,24,26,29,30,31,32,38,39) | 26 | xem CHATGPT.md | đúng | — |

## Không sửa (mơ hồ) → CAN-HOI.md
10 câu A/B: Mimic vs Forge; Archive có tính MK/Blood không; khiên ụ × Signal Jammer giá; Blood Circuit khác sao khi VAMP<2; Eve tẩy câm/tê/kẹp; Mirror phản qua khiên đối thủ; Octopus đốt ụ băng; REINFORCE bỏ ụ băng; kỹ năng khi ghép của bản sao −%; ụ băng vẫn ghi buff.

## Kiểm chạy
`thap-kt-cong-huong-luat.js` 339/339 · `thap-kt-khong-ban.js` 25/25 · `thap-kt-vang-sua.js` XANH · `thap-kt-vang-moi.js` đạt · `thap-kt-conghuong2.js` XANH.
