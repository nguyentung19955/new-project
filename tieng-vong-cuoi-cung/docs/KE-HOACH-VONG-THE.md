# Kế hoạch đổi nhân vật chính → Vọng Thể (30/10)

Nguồn: hỏi ChatGPT (chat "Đề xuất điều chỉnh nhân vật"), Claude tổng hợp. Nguyên tắc: **giữ ~80% thế giới/quái/màn cũ, thay nhân vật + animation + VFX chiến đấu + tương tác gắn với vũ khí cũ.** Tiếng vọng vừa là vũ khí vừa là chìa khoá khám phá.

## 1. Cốt truyện
- GIỮ: thế giới "cổ tích chuông tàn" (làng bị lãng quên, chuông im tiếng, rừng rễ, tàn tích).
- ĐỔI: Lam → **Vọng Thể**: sinh vật giáp tối, đầu là lõi năng lượng xanh có vòng sóng âm, sinh ra từ tiếng ngân cuối cùng của Đại Chuông.
- Đại Chuông ngừng ngân → âm thanh biến mất, sinh vật hoá quái. Vọng Thể đi thu mảnh cộng hưởng để đánh thức Đại Chuông.
- Không thoại; cảm xúc qua nhịp sáng của lõi. Ánh xanh nhân vật tương phản ánh hổ phách của chuông cổ.

## 2. Vùng
| Vùng | Quyết định | Ghi chú |
|---|---|---|
| Làng Chuông Câm | GIỮ | hub, NPC, nâng cấp |
| Rừng Rễ Vọng | GIỮ + ĐỔI | cửa rễ phản ứng âm thanh — **vùng demo đầu** |
| Tàn Tích Ngân Âm | GIỮ + ĐỔI | đền chuông đổ nát, bẫy cộng hưởng |
| Tháp Đại Chuông | MỚI | vùng cuối |

## 3. Quái (giữ cả, chỉnh cách tương tác với sóng âm)
- Phu Đèn Lạc: vung đèn cận chiến, phóng đốm lửa chậm.
- Bọ Vỏ Mộc: lao ngang, chống đòn phía trước, yếu khi bị hất lên (đòn 2).
- Dơi Rễ: bay vòng, bổ nhào, bị sóng âm đánh rơi.
- Nấm Thở: phun bào tử theo nhịp, bị ngắt đòn khi trúng sóng.
- Lính Gác Chuông Gỗ: khiên chuông chặn trước, lộ điểm yếu sau cú đập đất.
- Boss đầu: Người Gác Câm (hộ vệ gỗ + đồng cổ, chuông nứt trên lưng), 2 pha.

## 4. Cơ chế
- Chiến đấu: combo đấm sóng âm → đá gió hất → đập đất chấn động; đá trên không; lướt; bám tường.
- **Cộng Hưởng**: trúng đủ 3 đòn liên tiếp → choáng ngắn / phá giáp.
- Đập đất: sóng lan mặt đất, trúng nhiều quái, kích hoạt vật thể.
- Khám phá: **Dò Vọng** (xung âm làm hiện lối ẩn, vách nứt), Cửa Rễ (giữ, mở bằng nút cộng hưởng sau khi dọn quái), Chuông Cổ (đánh đúng nhịp mở lối), Vọng Ảnh (dấu vết quá khứ).
- Nâng cấp: Lõi Vọng, Giáp Vọng, Chấn Động, Dò Âm (demo chỉ cần 3 cái cơ bản).

## 5. HUD
Thanh HP + thanh Năng lượng Vọng, bản đồ nhỏ; giữ khung HUD cũ, đổi màu/biểu tượng theo lõi xanh.

## 6. Thứ tự làm (demo 15–20 phút, 1 vùng)
- **P0** nhân vật + combat: chốt sprite (đã có: đứng, chạy, nhảy, lướt, bám tường, 3 đòn, đá trên không, trúng đòn, chết), hitbox, hitstop, knockback, VFX, kiểm tra trên điện thoại.
- **P1** Rừng Rễ Vọng 6–8 phòng, dùng lại tileset/nền cũ, checkpoint, cửa rễ.
- **P2** quái: Bọ Vỏ Mộc + Dơi Rễ trước; Phu Đèn Lạc, Nấm Thở sau; boss Người Gác Câm 2 pha.
- **P3** Dò Vọng, 1 cửa rễ, 1 vách bí mật, 1 câu đố chuông, 1 nâng cấp sau boss.
- **P4** HUD, âm thanh, lưu, tối ưu điện thoại, cân độ khó.

Tài nguyên nhân vật: `art/cau-song-am/` (sprite sheet 80×80/ô, FX 240×240/ô), trang thử `game/thu-cau-song-am/`.
