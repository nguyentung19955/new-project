# Đối chiếu DCDW ↔ NEON GRID (hệ thống TRONG TRẬN)

Ngày 02/11/2026. Nguồn: `tu-van-chatgpt-phan-tich-dcdw.txt` (mục I A1–F16, II 01–13, 24, 29) và `tu-van-chatgpt-tuong-skill-phan-cap.txt` (mục II: Child thật).
Nguyên tắc: DCDW là gốc. Chỉ xét hệ thống trong trận (không làm meta: shop, clan, pass, arena...).

Ký hiệu: **CÓ** = đã có trước phiên này · **THIẾU → ĐÃ LÀM** / **SAI → ĐÃ SỬA** = phiên này làm · **HOÃN** = chưa làm, có lý do.

## I. Kiểm tra A–F

| Mục | DCDW | Trước phiên này | Kết quả |
|---|---|---|---|
| A1 Bàn | Khung dọc, 2 bàn 5×3, bàn đối phương trên, mình dưới | Có 2 bàn 5×3 nhưng nhỏ (ô 46px, ~64% bề ngang), màn thấp có dải đen 2 bên | **SAI → ĐÃ SỬA**: lấp đầy bề ngang, ô 56×54, bàn 302px (~77%), chiều cao co giãn |
| A2 Tướng + sao | Chibi nhỏ nhưng rõ, dấu sao (pip) trên đầu | Tướng cao 32px, sao trong hộp tối | **SAI → ĐÃ SỬA**: tướng cao ~39px, pip ngôi 1–7 trên đầu, vòng chân màu bậc |
| A3 Màu ô | Không đủ chứng cứ là hệ | Ô trung tính | **CÓ** (giữ, không gán ý nghĩa) |
| A4 Làn quái | Làn bên trái mỗi bàn, thanh máu nhỏ, số sát thương | Có | **CÓ**; thanh máu to theo cỡ mới (24×3, trùm 56×5) |
| A5 Biểu tượng mép phải | Archfiend / kỹ năng | Ô "LEADER LOCKED" | **THIẾU → ĐÃ LÀM**: thẻ Archfiend thật (ô thứ 6) |
| B6 HUD trên | Wave, chỉ báo | Có WAVE, BOSS IN, HOSTILES, CORE (co-op), icon đội bên kia | **CÓ**; ô thứ 6 của đội AI giờ là Archfiend |
| B7 Mana + thẻ | Mana, giá summon tăng, 5 thẻ LV/giá/MAX, thẻ Archfiend | 5 thẻ LV/giá/MAX có; thiếu Archfiend | **THIẾU → ĐÃ LÀM** thẻ Archfiend (giá, vòng hồi chiêu) |
| B8 Bảng 7 chân dung | Chưa xác định (có thể là emote) | Không có | **HOÃN** (chưa rõ cơ chế) |
| C9 Triệu hồi | Ngẫu nhiên đều trong 5 Child, ô trống ngẫu nhiên, giá tăng; mana từ giết quái + thưởng wave | Có đúng | **CÓ** (bậc không ảnh hưởng tỉ lệ) |
| C10 Ghép | 2 cùng loại cùng sao → sao+1, loại ngẫu nhiên trong bộ | Có | **CÓ**; thêm ngoại lệ VÀNG (WARP GATE, kiểu Brownie) |
| C11 Nâng cấp | Mana nâng cả LOẠI Child trong trận | Có | **CÓ** |
| C12 Archfiend | Kỹ năng chủ động, mana và/hoặc hồi chiêu, giá lần sau tăng | Không có | **THIẾU → ĐÃ LÀM**: OVERCLOCK, FIREWALL; chọn ở màn chọn tướng; bot AI/đồng đội dùng |
| C13 PvP / co-op | PvP Archfiend 3 mạng; co-op đường chung 70 wave, trùm định kỳ | PvP 3 mạng; co-op 70 wave (phiên co-op) | **CÓ** |
| D14 Bộ đội hình | 5 Child + 1 Archfiend, độ hiếm | 5 tướng, không độ hiếm, không Archfiend | **THIẾU → ĐÃ LÀM**: 5 bậc màu + chọn 1 Archfiend |
| E15 Loại tướng | damage, slow, buff, debuff, nhiều mục tiêu, tạo mana | Có nhưng skill viết cứng theo id | **SAI → ĐÃ SỬA**: skill thành "loại hành vi" dùng lại được (data-driven) |
| F16 Quái / trùm | Quái mạnh dần; trùm có thể biến đổi/debuff Child | Có 3 quái thường + 3 trùm có chiêu lên tướng | **CÓ**; quái thường giữ là "bọ" đơn giản, chỉ trùm có kỹ năng |

## II. Hệ thống cần có

| Mục | DCDW | Trước | Kết quả |
|---|---|---|---|
| 01 Vòng lặp trận | spawn → tự đánh → mana → summon/upgrade/merge → sống sót | Có | **CÓ** |
| 02 15 ô, đầy phải ghép | Bàn đầy chặn summon | Có ("GRID FULL") | **CÓ** |
| 03 RNG triệu hồi | Không chọn đơn vị/ô | Có | **CÓ** |
| 04 Merge rank | cùng loại + cùng sao, tối đa 7 | Có | **CÓ** |
| 05 Nâng cấp battle | theo loại, tạm thời | Có (LV1–6, MAX) | **CÓ** |
| 06 Lớp tướng | tấn công / hỗ trợ / khống chế / đặc biệt | Có ngầm | **CÓ**, giờ thể hiện bằng **bậc**: TRẮNG/LAM/TÍM đòn hệ, VÀNG cơ chế lạ, ĐỎ mạnh nhất |
| 07 Chọn mục tiêu | mỗi Child một kiểu (đi đầu, ngẫu nhiên, máu cao...) | Có nhưng viết cứng | **SAI → ĐÃ SỬA**: trường `muc` trong dữ liệu (dau, dongQuai, mauCao, mauThap, mauDay, chuaHieu, ngauNhien) |
| 08 Kỹ năng tướng | Syrinx tạo mana, Brownie ghép nâng sao đồng minh, Daron/Moa biến hình, Shamash sao chép... | Không có skill kiểu "khác hẳn" | **THIẾU → ĐÃ LÀM**: BROKER = tạo mana (Syrinx), WARP = WARP GATE (Brownie), LANCE (ĐỎ) = DEADLINE |
| 09 Archfiend | 1 ô riêng, chủ động, hồi chiêu | Thiếu | **THIẾU → ĐÃ LÀM** |
| 10 Buff/debuff | slow, shield, cleanse, tăng tốc đánh... | Có slow/độc/hack/cháy; không cleanse/buff đội | **THIẾU → ĐÃ LÀM**: cleanse + khiên (FIREWALL), tăng tốc đánh (OVERCLOCK); biểu tượng trạng thái nhỏ cạnh thanh máu |
| 11 PvP | 2 bàn, 3 HP | Có | **CÓ** |
| 12 Co-op | đường chung, wave dài | Có (phiên co-op) | **CÓ** |
| 13 Boss wave | trùm xen giữa, biến đổi Child | Có trùm mỗi 10 wave, chiêu lên tướng | **CÓ**; FIREWALL (Archfiend) là cách chống |
| 24 UI feedback | số sát thương, mana, giá, LV/MAX, pip sao, thanh máu | Có, nhưng sao trong hộp, đạn nhiều vệt sáng | **SAI → ĐÃ SỬA**: pip sao, đạn gọn (ảnh proj, không trail), skill VÀNG/ĐỎ chỉ chớp vòng + tên 0.6s |
| 29 Kết quả trận | thắng/thua + thống kê | Có (co-op có sát thương từng tướng) | **CÓ** |

## III. Lỗi người dùng báo (đã sửa)

1. Tràn bề ngang: scale = rộng màn / 390, chiều cao logic co giãn; bàn trên neo trên, bàn dưới + thẻ neo dưới, khoảng giữa co giãn; màn quá thấp mới giảm scale; tôn trọng safe-area.
2. Tướng + bàn to như DCDW: ô 56×54, tướng ~39px, bàn ~77% bề ngang, quái/trùm to tương ứng (×58/48).
3. Đạn gọn: `proj_<id>.png` khung 1–2, dài 12px, xoay theo hướng bay, không trail/hạt; tia LANCE dừng ở mục tiêu.
4. Sao 1–7: pip ngôi trên đầu; vòng chân màu bậc đậm dần theo sao; scale 1.00–1.06.
5. Skill tiết chế: biểu tượng trạng thái nhỏ cạnh thanh máu; skill VÀNG/ĐỎ chớp vòng ngắn + chữ tên 0.6s.

## IV. Hoãn / ngoài phạm vi
- Bảng emote / ping đồng đội (B8, chưa rõ cơ chế).
- Meta ngoài trận (shop, clan, pass, arena, mastery, level thẻ).
- ~~Tinh anh (elite)~~ → ĐÃ LÀM (phiên sau): 4 bọ thường + 4 tinh anh, xem TIEN-DO-V3.md mục "Bố cục DCDW...".

## V. Cập nhật phiên "bố cục DCDW" (02/11/2026)
- A1/A2: bàn to kiểu DCDW (không còn khoảng trống giữa 2 bàn, ô cao 58–78 theo màn), tướng cao ~80% ô, ảnh tĩnh ổn định, đạn ra từ đầu nòng.
- D14/06: 5 bậc thể hiện bằng đế màu đặc dưới chân + viền 1px; 8 tướng xếp lại TRẮNG ×4, LAM ×1, TÍM ×1, VÀNG ×2 (người dùng chốt).
- 08: VÀNG có kỹ năng chủ động CHỌN Ô (BROKER TRADE/SWAP/TAKE PROFIT, GLITCH COPY BUFFER/PACKET SWAP/REROLL) — quyết định vị trí + thời điểm.
- F16: 4 bọ + 4 tinh anh có cơ chế đọc được bằng mắt; 3 trùm chỉnh 2 chiêu theo bản thiết kế mục VII.
