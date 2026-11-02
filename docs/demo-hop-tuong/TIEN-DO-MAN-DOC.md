# Tiến độ: chuyển NEON GRID sang MÀN DỌC 390×844 (02/11/2026)

Làm theo docs/demo-hop-tuong/tu-van-chatgpt-dac-ta-dcdw.txt mục 2, 3, 6. Giữ nguyên kỹ năng 8 tướng + 3 boss.

## Đã xong (7/7 mục)
1. Màn dọc 390×844 logic, scale = min(W/390, H/844), hộp đen, vùng an toàn, hitbox theo toạ độ logic. Bỏ màn che "xoay ngang". Màn chọn tướng 4×2, bảng tạm dừng / kết quả vừa màn dọc.
2. Hai bàn 5×3: người chơi dưới (111,390), AI MIRROR trên (111,105); mỗi bàn 1 làn dọc bên trái (AI 67,92→67,273; người chơi 67,374→67,562). Bàn AI là state thứ hai (GAME.moi(BO_AI, true, S)), bot triệu hồi mỗi 2–3s, ghép cặp đầu tiên, dư Energy thì nâng cấp; AI nhận cùng đợt với người chơi. Thua khi người chơi hết mạng, THẮNG (VICTORY) khi AI hết mạng trước.
3. Tầm bắn × 48/70 (CAU_HINH.TL_TAM), bán kính vùng hiệu ứng × 48/70 (CAU_HINH.TL). Tốc độ quái nhân (dài làn mới / 1272) để thời gian đi hết làn như bản cũ.
4. HUD: thanh trên (wave, boss/timer, 6 ô đội AI), dải giữa y300–353 (thông báo wave/boss), ACTION HUD (Energy, SUMMON có giá, 1x/2x, menu), CARD HUD (5 thẻ 55×108 có chân dung, LV, giá, tối khi thiếu Energy + thẻ LEADER khoá).
5. Tướng: sheet khung vuông, neo chân (64,110)/128, scale 0.41, bóng ellipse, nhãn sao cố định. Chỉ đổi khung: idle 8@9fps lặp, attack 12@14fps (đạn phát ở khung ~6 = 6/14 giây), hurt 4@12fps (khi trúng chiêu boss), summon 8@12fps. Không xoay, không uốn. Đã gỡ veUon và nhánh *_idle/_attack cũ.
6. Nạp ảnh demo/assets/v2/<tên đúng mục 4>; số khung = rộng / cao. Chưa có ảnh → ảnh cũ (assets/units, enemies, bosses) hoặc hình vẽ code.
7. Quái/boss/đạn/hiệu ứng theo làn dọc; số sát thương nổi (trôi 12→22px/0.5s, tối đa 3 số/quái, chí mạng màu hổ phách); rung màn ≤2px, không rung HUD.

## Ảnh v2 game đang chờ (thả vào demo/assets/v2/)
bg_arena_portrait, board_frame_top, board_frame_player, tile_normal, tile_active, tile_merge, lane_straight, lane_spawn, lane_exit,
hud_top_panel, hud_bottom_panel, summon_button_states, card_frame_states, leader_card_frame, star_badges, unit_shadow, portraits_8,
<tướng>_idle/_attack/_hurt/_summon cho scorch, frost, arc, lance, warp, broker, glitch, venom,
enemy_drone_sheet, enemy_skitter_sheet, enemy_bulwark_sheet, boss_01..03_sheet, vfx_fire/ice/chain/sniper/void/bounty/hack/poison, vfx_merge, vfx_summon.

## Cần người dùng quyết
- Tầm × 48/70 làm tướng ở 2 cột phải KHÔNG với tới làn trái (cột 5 cách làn ~265px, tầm lớn nhất LANCE ~247px). Muốn sửa: đổi 1 dòng TL_TAM trong demo/js/data.js (vd 1 = giữ tầm cũ).
- Nhãn sao đặt cao hơn đặc tả 5px (đỉnh ô − 3) vì đặt đúng đỉnh ô + 2 thì che mặt tướng.
- Bộ test cũ (tests/demo-hop-tuong) viết cho màn ngang 844×390 — cần viết lại khi người dùng cho chạy test.
