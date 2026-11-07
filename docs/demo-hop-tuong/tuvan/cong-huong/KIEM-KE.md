# Kiểm kê nguồn hiệu ứng × đích (07/11/2026)

Mục đích: biết **mọi nguồn** tác động lên **mọi loại đích**, và khi 2 luật gặp nhau thì **luật nào thắng**. Test máy: `tools/thap-kt-cong-huong-luat.js` (bảng kết quả: [BAO-CAO.md](BAO-CAO.md)). Các ma trận cũ vẫn chạy: `thap-kt-matran.js` (trạng thái ụ × sự kiện, 558 cặp), `thap-kt-conghuong.js` (kỹ năng × đá/băng), `thap-kt-conghuong2.js` (đặc biệt × đặc biệt), `thap-kt-khong-ban.js`.

## 1. Loại đích
| Mã | Đích | Ghi chú |
|---|---|---|
| U | ụ của mình (Tấn công `tc` 44 · Hỗ trợ `ht` 19 · Đặc biệt `db` 30) | 93 ụ |
| UD | ụ đối thủ (PVP) / đồng đội (CO-OP) | |
| O | ô bàn (15 ô 5×3): ô anh hùng (Hero Foundry), ô trống | ô giữ trạng thái khi ụ đi |
| B | cả bàn: mana, giá triệu hồi, khiên toàn bàn (Holy Shield / Halo), RAGE, bộ đếm bàn (COMBO, VAMP, PRISM, ghepN) | |
| Q | quái thường / to (`to`) / bay (`bay`) / bay băng (`khangCham`) / tách | |
| T | trùm (6 cũ + 6 mới) | |
| D | đường đi: tường, mìn, vũng độc, vệt cầu vồng, drone, xung | |

## 2. Trạng thái và ai thắng
| Trạng thái | Nguồn | Chặn gì | Gỡ bằng | Luật khi gặp nhau (đang chạy) |
|---|---|---|---|---|
| ĐÁ `st.da` | trùm Janus | bắn, kỹ năng, nhận hỗ trợ, ghép (trừ đá+đá cùng sao) | Eve Holy Shield, Cleanser, Sanctum | đá+đá → khối ĐÁ +1★, không chạy kỹ năng khi ghép · Merge King / Teleporter / Copycat (`quaKhoa`) vẫn kéo LÊN được · REINFORCE bỏ qua đá · không tính bingo/chuỗi |
| BĂNG `st.bang` | trùm Freezer | như đá, không ghép thường | hết giờ, Eve, Cleanser, Sanctum | Halo: nửa thời gian · MK/Teleporter/Copycat kéo lên được |
| CHÁY `st.lua` | trùm Octopus | (giảm) | Eve, Cleanser, Sanctum | cùng thân giữ; biến hình/ghép mất |
| KẸP `st.kep` | Clamp PVP, Signal Jammer, Mirror phản | −40% tốc | Cleanser, Sanctum | lấy max thời gian |
| CÂM `st.cam` | trùm Static Jammer | bắn, ghép, hào quang | gỡ kẹp | hopLeGhep = false (kể cả ghép đặc biệt) |
| TÊ `hexT` | Hex Saboteur PVP (ụ 1★) | cập nhật ụ 2.5 s | — | vẫn kéo/ghép được (CAN-HOI cũ) |
| KHIÊN `khien` | Máy Khiên, Pandora, Sanctum | 1 chiêu trùm / 1 phá đối thủ | tiêu khi chặn | Mirror Gate kề kiểm trước (kháng %); biến tại chỗ giữ khiên |
| KHIÊN BÀN `B.khien` | Eve 8 s, Halo | mọi chiêu trùm + hiệu ứng ghép đối thủ | hết giờ | Halo: chiêu nhiều mục tiêu còn 1, Freezer nửa thời gian · **nay chặn cả +mana triệu hồi của Signal Jammer** |
| BẢN SAO `banSao` | Copycat | −% sát thương | — | biến tại chỗ giữ; ghép = ụ mới mất |
| VÀNG / THỨC TỈNH | Merge King / Werewolf (quay lúc sinh) | — | — | Copycat giữ dạng; MK+MK giữ vàng; vàng kéo lên MK → +2★ |
| Ô ANH HÙNG | Hero Foundry | +tốc ụ đứng trên | hết 12 s | tối đa 2 ô, ô còn khi ụ đi |

## 3. Nguồn hiệu ứng × đích
| Nguồn | U | UD | O/B | Q/T | Thắng/thua khi gặp |
|---|---|---|---|---|---|
| Ghép thường (2 cùng loại cùng sao / Mimic) | ra ụ ngẫu nhiên bộ bài +1★ | — | ghepN+1 | — | kỹ năng khi ghép của mỗi LOẠI chạy 1 lần; cùng loại ra cùng loại giữ bộ đếm max (Forge, Hộp, Evolver, Nine-Tail, Ember, Ép Xung) |
| Ghép đặc biệt `ghepDB` (Merge King, Teleporter, Copycat, Overclock, Scrap Forge, Blood Circuit, Pháo La Bàn) | xem bảng nhóm 1 BAO-CAO | — | Archive: chỉ MK/Blood/La Bàn tính là ghép | Blood Circuit nổ | ụ KÉO quyết định; Scrap Forge 2 chiều (ăn cả Mimic ≤3★); không chạy kỹ năng khi ghép của ụ đích |
| Kỹ năng khi ghép (Drone, Twin, Cloner, Mana Doubler, Horn, Clamp, Scrambler, Signal Jammer, Hex, Pandora, Orbital, Wall, Combo, Chrono, Ember, Archive, Foundry, Prism Thief) | buff/gọi ụ | PVP phá (qua khiên/Mirror) · CO-OP giúp | mana, giá, hồi chiêu | bom, khoá, chậm | đá+đá không chạy; RAGE ×2 áp lên sát thương tính lúc ghép (**Drone, Blood Circuit đã sửa**) |
| Hỗ trợ kề (`ht`) | buff 4 ô (vài ụ: chéo / hàng-cột / 8 ô) | — | — | chậm, giết ngay, choáng | không nhận khi đá/băng/câm; nhiều nguồn cộng (đã bỏ trần 07/11) |
| Chỉ huy Hero REINFORCE | 2 ụ 1★ / +1★ ụ yếu nhất | — | — | — | bỏ đá & 7★ |
| Chỉ huy RAGE | — | — | 10 s | ×2 MỌI sát thương (dmgU + bom Orbital/Pandora/Drone/Blood) | test nhóm 3 |
| Chỉ huy Eve HOLY SHIELD | tẩy đá/băng/cháy | — | khiên bàn 8 s | — | chặn chiêu trùm + hiệu ứng ghép đối thủ |
| Trùm cũ: Mad Crown (biến 3 ụ), Freezer (băng n ụ), Janus (đá), Joker (ép Mimic ghép), Nightmare (−1★, 1★ = phá), Octopus (cháy 3 ụ) | có | CO-OP Freezer chia 2 bàn | — | — | khiên bàn > khiên ụ (Mirror kháng % trước) > chiêu; khoá chặn biến/ép ghép |
| Trùm mới: Hive (drone), Static Jammer (câm 2 ụ, hỗ trợ trước), Prism (−90% tới khi đủ 3–4 loại ụ), Twin Core (tách), Patch Titan (hồi máu), Star Leech (lấy 1★, giết trả lại) | Jammer, Leech | — | — | — | Leech/Jammer đi qua khiên/Mirror như trùm cũ |
| Quái: bay băng (miễn chậm, không miễn khoá thời gian), to (miễn giết ngay dưới 7★ Reaper), tách | — | — | — | — | chậm: trần 35% thường / 15% trùm |
| Đường: tường (Wall), mìn, vũng độc, cầu vồng (PVP giảm sát thương đối thủ), drone, xung Archive | — | — | — | có | — |

## 4. Đã quyết sẵn (không đổi trong lần này)
Xem `tuong-tac/MA-TRAN.md` mục "Luật nền" 1–7 và "Cần bạn quyết" 1–7; `conghuong/BANG.md`; `conghuong2/BANG.md`.
