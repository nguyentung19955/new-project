# Ý kiến ChatGPT — rà ma trận tương tác (07/11/2026)

Hỏi qua Chrome của người dùng (chat "Merge TD QA Cases"). Đề bài gửi đi: bản tiếng Anh của [KIEM-KE.md](KIEM-KE.md) + yêu cầu "Find interaction/stacking/override bugs and missing rules… list concrete test cases and the expected rule for each". Dưới đây là câu trả lời (giữ nguyên ý, rút gọn mỗi ca còn 1 dòng). Cột **Xử lý** = cách session này dùng ca đó (xem [BAO-CAO.md](BAO-CAO.md) nhóm 8, [CAN-HOI.md](CAN-HOI.md)).

Ưu tiên: P0 = lợi dụng, kẹt, mất ụ, vượt luật lớn · P1 = cộng dồn / nhắm / đè sai · P2 = nhất quán.

## A. Thứ tự ghép đặc biệt
| # | Ca (Setup → Action → Expected) | Xử lý |
|---|---|---|
| 1 | P0 Mimic 3★ × Drone Bay 3★, kéo 2 chiều → ghép thường, kỹ năng Drone chạy đúng 1 lần | test nhóm 2 (đạt) |
| 2 | P0 2 Twin Maker ghép → Twin chạy 1 lần, quay 10% 1 lần | test nhóm 2 + 8 (đạt) |
| 3 | P0 MK → ô đá/băng → +1★ (vàng +2★), vẫn khoá, không quay ghép, không kỹ năng đích | test nhóm 1 (đạt) |
| 4 | P0 MK vàng → ụ 6★ = 7★ không 8★; MK → 7★ bị từ chối, không mất MK | test nhóm 1 + 8 (đạt) |
| 5 | P0 Teleporter ↔ đá/băng/câm: đá/băng đổi chỗ giữ trạng thái; ụ câm không tự kéo | test 1 (đá/băng) + test 8 (câm chặn cả 2 chiều, đạt) |
| 6 | P0 Copycat → đá: GPT đề xuất từ chối; game đã quyết "chép được, bản sao thường" (9d79bd2) | giữ luật đã quyết |
| 7 | P0 Copycat chép Scrambler/Pandora/Overclock: chỉ đổi loại, không chạy kỹ năng khi ghép | test nhóm 2 (đạt) |
| 8 | P0 Forge ăn Mimic/Combo/Archive: +lò mỗi lần, không COMBO, không điểm Archive | test 5 + 8 (đạt sau sửa Archive) |
| 9 | P0 Blood Circuit khác sao khi VAMP 0/1 → GPT: từ chối; game: vẫn hiến, chỉ không nổ | CAN-HOI #4 |
| 10 | P1 cùng loại ra cùng loại giữ bộ đếm LỚN NHẤT (không cộng), đồng hồ lấy cái đã chạy xa hơn | test nhóm 5 (đạt) |

## B. Khống chế, khoá, lớp phòng thủ
| # | Ca | Xử lý |
|---|---|---|
| 11 | P0 ụ hỗ trợ bị đá/băng → hào quang tắt ngay, mở khoá bật lại đúng 1 lần | test 8 (đạt) |
| 12 | P0 ụ khoá không nhận buff/khiên mới; sát thương không phải buff vẫn chạy | test 8: ụ băng vẫn được ghi buff nhưng không bắn → CAN-HOI #10 |
| 13 | P0 ụ CÂM (Static Jammer) không khởi động ghép thường/đặc biệt; từ chối không tốn gì | test 8 (đạt) |
| 14 | P0 thứ tự phòng thủ: Eve → Mirror kháng % → Mirror sạc → khiên 1 lần; mỗi đòn tiêu đúng 1 lớp | test 8 (đạt) |
| 15 | P0 chiêu nhiều mục tiêu: mỗi ụ tự xét phòng thủ | test nhóm 6 Mirror × Janus 3 ụ (đạt) |
| 16 | P1 Halo + Freezer + khiên: lọc còn 1 ụ trước, ụ đó nửa thời gian trừ khi khiên chặn, không chọn lại | test 6 Halo (đạt) |
| 17 | P0 Eve: tẩy đá/băng/cháy; GPT đề xuất tẩy cả Câm/Tê | CAN-HOI #5 |
| 18 | P1 Kẹp nhiều nguồn: lấy mạnh nhất + lâu nhất, không cộng độ lớn | đúng sẵn (st.kep = max thời gian, ×0.6 cố định) |
| 19 | P1 Mirror phản Kẹp → ụ đối thủ có khiên/Eve: bị chặn, không phản dây chuyền | CAN-HOI #6 (phản hiện bỏ qua khiên đối thủ) |
| 20 | P1 đồng hồ giữa wave: mọi thời gian chiến đấu cùng dừng | ghi KIEM-KE (chỉ đồng hồ chỉ huy dừng — đã quyết P0-09) |

## C. Bộ đếm, biến hình, tính lại
| # | Ca | Xử lý |
|---|---|---|
| 21 | P0 cờ bản sao qua chuỗi biến hình, mất khi ghép | thap-kt-matran (đạt) |
| 22 | P0 biến loại → mất bộ đếm riêng, biến lại không hồi | thap-kt-matran (đạt) |
| 23 | P0 Archive: GPT chỉ đếm ghép thường + Mimic; game đếm cả MK / Blood / La Bàn | CAN-HOI #2 (đã bỏ Teleporter/Copycat/Overclock/Forge) |
| 24 | P0 Combo + Mimic: COMBO +1 đúng 1 lần | test 8 (đạt) |
| 25 | P1 Choir / Chain / Railgun tính lại sau mỗi thay đổi bàn; đá không tính | conghuong2 (đạt) |
| 26 | P1 ngưỡng: trần bộ đếm bàn, mốc động tắt khi mất điều kiện | test 8 Star Cannon tụt sao (đạt) |
| 27 | P0 Evolver 7★ sắp nổ + Nightmare cùng khung → xịt; mất sao đếm lại từ đầu | test 5 (đạt) |
| 28 | P1 Hộp Bí Ẩn mở theo dải sao riêng, không cộng sao hiện tại | đúng sẵn (sàn = ★ hộp, đo bậc 06/11) |

## D. Báo chiêu trùm, chặn, nhắm
| # | Ca | Xử lý |
|---|---|---|
| 29 | P0 trùm nhắm ụ rồi ụ bị Teleporter dời: nhắm theo ỤỤ (uid), không theo ô | test 8 (đạt) |
| 30 | P0 Joker ép ghép: không ghép với ụ khoá, không còn bạn → hụt, không mất ụ | test 6 + 8 (đạt) |
| 31 | P0 Nightmare/Leech × 1★ × khiên: khiên chặn; Nightmare phá 1★; Leech chỉ lấy từ 2★ | test 6 + 8 (đạt) |
| 32 | P1 Static Jammer ưu tiên hỗ trợ còn hoạt động, không trùng, khiên chặn thì không chọn lại | test 8 (đạt) |
| 33 | P1 Prism Warden đếm LOẠI ụ gốc, không đếm đòn phụ | đúng sẵn (bỏ `o.phu`) |
| 34 | P1 Octopus cháy lên ụ đá/băng (trùm đã bỏ ô đá; còn ụ băng) | CAN-HOI #7 |

## E. Sát thương, miễn nhiễm
| # | Ca | Xử lý |
|---|---|---|
| 35 | P0 RAGE nhân đúng 1 lần mỗi đòn (đạn, bom, nổ, DoT chụp lúc gắn) | test nhóm 3 + 3b (đã sửa Drone / Blood Circuit) |
| 36 | P1 trần chậm 35%/15%, bay băng miễn chậm, không miễn khoá thời gian | đúng sẵn (HOTRO.khiTrung) |
| 37 | P0 giết ngay × quái to / trùm / tách: tách chạy đúng 1 lần | đúng sẵn |

## F. Bàn đầy, chỉ huy, chế độ
| # | Ca | Xử lý |
|---|---|---|
| 38 | P0 bàn đầy + Twin/Cloner/Pandora/REINFORCE cùng lúc: không đè ô, không hàng chờ ẩn | test 8 (đạt) |
| 39 | P0 REINFORCE bàn đầy: bỏ đá, băng, 7★; không có đích → không trừ mana | test 8 (đạt phần không trừ mana); bỏ ụ băng → CAN-HOI #8 |
| 40 | P0 tách chế độ: PVP không đánh bàn mình/đồng đội, không vượt Eve; CO-OP giúp; SOLO không phạt đối thủ | test nhóm 2 + 7 (đạt) |

## Luật còn thiếu GPT đề nghị chốt
Thứ tự hành động nguyên tử (kiểm → tiêu → biến/sao → tính lại → kỹ năng khi ghép → sinh thêm → chốt); phân loại sự kiện (ghép thường / đặc biệt / ép / biến tại chỗ / triệu hồi / +sao / đổi chỗ); thứ tự phòng thủ; kế thừa trạng thái; cộng hay nhân; xử lý cùng khung tất định; trùm nhắm uid hay ô; quyền theo chế độ.
