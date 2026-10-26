# Ghi chú rig-v4 – clip chạy nhanh của Lam (26/10/2026) – BẢN CHỜ DUYỆT, CHƯA HOÀN THIỆN

Viết cho người không rành kỹ thuật. Xem trước: `chay/chay-112px.gif` (đúng cỡ trong game), `chay/chay-lon.gif`,
`tu-the/01-bang-duyet.png`, rồi video so sánh trong game `../../../../game/kiem-thu-chay-nhanh/chay-v3-canh-v4-60fps.mp4`.
Đây là **bản để chủ dự án xem chuyển động** – chưa gọi là hoàn thiện. **Chưa thử trên iPhone/Safari.**

## 1. Yêu cầu và đã làm (`../YEU-CAU-CHAY-NHANH-C.md`, mục 1)
- Chu kỳ **0,50 s**, **2 bước chân/chu kỳ**, quãng đường **132 px logic/chu kỳ** ở **264 px logic/s** (= tốc độ chạy game,
  `runSpeed 4.4 × 60`). JSON sheet: `toc_do_chuan.quang_duong_moi_chu_ky_px_logic = 132`, `phien_ban_clip = "v4"`.
- rig-v3 + clip v3 **giữ nguyên** (không sửa file nào), game mở lại được bằng `?clip=v3`.
- **Không nhân toạ độ ủng của v3.** Bảng mốc ủng đặt lại từ quãng đường + tỉ lệ chạm đất mới; vị trí ngang lúc chịu lực vẫn
  tính bằng tích phân lăn không trượt (điểm chạm đi đúng tốc độ đất), pha bay đặt mốc tay:

| | rig-v3 (0,64 s, 83,66 px) | **rig-v4 (0,50 s, 132 px)** | Ý nghĩa |
|---|---|---|---|
| Tỉ lệ chạm đất mỗi chân | 0,375 | **0,3125** | chạy nhanh chạm đất ngắn hơn |
| Lúc cả hai chân rời đất | 25 % chu kỳ | **37,5 %** | **pha bay dài hơn** |
| Ủng chịu lực: chạm → rời (giữa đế, px ảnh ngang) | +149 → −139 (30 px logic) | **+195 → −181 (39 px logic)** | sải chân chịu lực dài hơn ~31 % |
| Chân sau đạp ra xa nhất (pha bay) | −170 | **−240** | chân sau đạp ra xa hơn |
| Chân trước vươn xa nhất | +172 | **+240** | chân trước vươn xa |
| Gót đá lên cao nhất (khe với đất) | 95 | **122** | thu chân cao hơn khi kéo về |
| Góc ủng lúc đạp (gót nhấc) / lúc vươn (mũi hếch) | +42° / −20° | **+50° / −24°** | đạp dứt khoát hơn |
| Thân nghiêng tới | 5…8° | **8…11°** (+3°) | nghiêng tới hơn chút |
| Tay dao vung | ±14° | **±16°** | vung thêm chút theo sải (lựa chọn của tôi – muốn giữ ±14° thì đổi 1 số) |
| Số khung/chu kỳ | 32 (20 ms ở tốc độ chuẩn) | **30** (16,67 ms) | xem mục 2 |

- **Giữ nguyên**: mảnh, thiết kế, Lam 112 px (dáng nghỉ 224 px nguồn ở sheet 2x), cỡ ủng, tay sau đi vòng sau lưng, tối 10 %
  tay sau + ủng xa, **biên độ nhún thân + lắc mũ/chóp/chuông = bảng V3** (`BANG['V4'] = BANG['V3']`, kiem_tra kiểm).

## 2. Vì sao 30 khung (không phải 32)
Game chọn khung `floor(pha × số khung)` mỗi bước logic 60 Hz. Ở 264 px/s mỗi bước đi 4,4 px. Với 30 khung, **một khung =
132/30 = 4,4 px = đúng một bước logic** → ở tốc độ tối đa mỗi bước hiện đúng khung kế tiếp, chân chịu lực đứng yên trên đất
(đo trong game: trượt lớn nhất **0,04 px logic**/bước). Với 32 khung (4,125 px/khung) chân sẽ "rít" ~0,3 px/bước rồi giật về
4 px mỗi ~15 bước. Sheet vẫn 8×4 ô, 2 ô cuối trống → **cùng cỡ 2142×970, cùng ô 266×241, cùng neo (123, 234), cùng hộp thế giới**
với v3, nên game dùng chung dáng nghỉ TẠM (`game/anim/lam-nghi-2x.png`; đã kiểm: render dáng nghỉ từ rig-v4 trùng từng điểm ảnh).

## 3. Số đo (`so-lieu.json`, `code/kiem_tra.py`: ĐẠT mọi mục)
| | v3 | **v4** |
|---|---|---|
| Trượt chân chịu lực trong rig (Σ\|v_chạm − v_đất\|·dt, mỗi ủng/chu kỳ) | 0,0002 px logic | **0,0006 px logic** |
| Lệch vận tốc điểm chạm lớn nhất | 0,15 px/s (0,11 %) | 0,49 px/s (0,18 %) |
| Vòng nối khung cuối → khung 0 (nhảy vận tốc) | 0,14 px/s | 0,24 px/s |
| Khe hở nhỏ nhất của ủng khi bay | 0,96 px logic | 0,60 px logic |
| Chiều cao 4 tư thế ở 112 px | 113 / 111 / 112 / 110 | 113 / 110 / 112 / 110 |
| Nhún thân cao–thấp | 3,14 px logic | 3,11 (30 khung) – cùng bảng |
| Đầu lắc riêng so với thân (biên độ) | 0,92 px logic | 1,05 px logic |
| Gia tốc dọc đỉnh mũ lớn nhất | 1140 px/s² | **2090 px/s²** |
| Chóp mũ lắc | −3…+3,5° | −3…+3,5° (khung lấy mẫu −2,98…+3,47°) |
| Bậc chân chóp (sheet 2x) | ≤ 0,42 px | ≤ 0,42 px |

Đọc: biên độ đầu/chóp giữ đúng v3, nhưng cùng biên độ diễn ra trong **0,25 s/bước thay vì 0,32 s** nên đầu nảy **nhanh hơn**
(gia tốc gần gấp đôi v3, vẫn dưới v2 4084). Đầu lắc riêng tăng nhẹ 0,92 → 1,05 px vì mốc nhún dời theo pha chịu lực ngắn hơn.
Theo yêu cầu không đổi thêm độ lắc đầu/chóp ở lượt này – nếu thấy đầu "giật" thì đó là việc cần quyết ở lượt sau.

## 4. Cái chưa đẹp / cần biết
- Ở 112 px, ủng xa và ủng gần **chồng nhau thoáng qua** ở giữa pha chịu lực (như v3); lúc bay hai ủng tách rõ hơn v3.
- Khung bay (12) chân trước còn cách đất 3 px logic, chân sau 7,4 px – trông "lướt" hơn v3; game dùng khung này TẠM cho
  nhảy/rơi/lướt (chưa có clip nhảy).
- Tay dao ±16° là thay đổi nhỏ tôi tự thêm cho hợp sải dài – không thuộc "thiết kế"; muốn giữ ±14° như v3: `BIEN_DO_TAY_TRUOC`.
- Thân không có squash/stretch, không có cú "đạp" bật người lên rõ (thân nhún vẫn chỉ 3,1 px như v3).
- GIF 20 ms/khung là giới hạn của GIF (10 ms bị trình duyệt kéo thành 100 ms) → `chay-*.gif` vẽ lại 25 khung để đúng 0,50 s;
  `sprite/kiem-sheet-ghep*.gif` (30 khung × 20 ms) chậm hơn thật 1,2×. Xem nhịp thật ở video 60 fps của game.
- Sheet 2x giải nén ~8,3 MB RGBA (như v3) – **chưa đo bộ nhớ/tốc độ vẽ trên iPhone**.
