# Đặc tả: trạng thái trên thân quái · tile sàn và tường rừng

11/10/2026 · Tài liệu cho Đợt 7 (`dot-7-trang-thai-tren-than.md`) và Đợt 6 (`dot-6-tile-rung.md`). Đơn vị chính: **px game** (1 px game = 2 px ảnh ở nét gấp đôi). Màu theo `docs/vfx/BANG-MAU-LOI.md`. Ký hiệu: **[BẮT BUỘC]** = quy tắc kỹ thuật; **[THỬ]** = giá trị đề xuất, kiểm bằng ảnh rồi mới chốt. Chưa có ảnh nào được tạo hay kiểm trong tài liệu này — mọi con số đều phải qua checklist mục 7.

---

## 1. Bảng trạng thái quái

Thân quái cao H = 24–60 px. Mọi kích thước hạt tính theo H: hạt = `max(2, round(H/12))` px (24→2, 36→3, 60→5). Số hạt = `clamp(round(H/12), 2, 5)`.

| | Độc | Cháy | Đóng băng |
|---|---|---|---|
| **Màu nhuộm** | `#5aca02` | `#fe7d04` | `#9cfefa` |
| **Mức hoà** [THỬ] | 35% | 35%, dao động 30–40% chu kỳ 12 khung (nhịp lửa) | 45%, không dao động |
| **Vùng nhuộm** [BẮT BUỘC] | mọi pixel thân **trừ** viền `#14182e`, pixel mắt (các pixel trắng/sáng ≥ `#e0e0e0` trong vùng đầu) và vũ khí cầm tay | như Độc | như Độc, **cộng** lớp phủ trắng `#ffffff` 20% ở 1/3 trên thân (sương bám) |
| **Giữ nguyên** [BẮT BUỘC] | viền, mắt, răng/nanh sáng, vũ khí | viền, mắt, răng, vũ khí | viền, mắt |
| **Hạt** | bong bóng tròn `#c8f90b` viền `#277600`, cỡ hạt×hạt, lõi 1 px `#fbfed0` | lưỡi lửa 3 nấc: chân `#c9270c`, thân `#fe7d04`, ngọn `#ffc90e` + 1 px `#feec86`; rộng = hạt, cao = 2×hạt | mảnh băng góc cạnh `#9cfefa` viền `#217bc3`, điểm sáng 1 px `#ffffff`; cỡ hạt×(1,5×hạt) |
| **Số lượng** | 2–5 | 2–4 (chỉ ở nửa trên) | 3–5 (3 ở chân, 1–2 ở vai) |
| **Vị trí** | sinh ngẫu nhiên trong hình chữ nhật thân, nửa dưới | vai và lưng (hàng y = 25–45% H, x theo mép sau lưng) | chân: y = 85–100% H; vai: y = 30% H, bám sát viền ngoài |
| **Hoạt ảnh** | nổi lên 1 px / 4 khung, sống 24 khung rồi tan (co về 1 px), sinh so le | 3 khung lặp (thấp–cao–nghiêng), 6 khung/ảnh, biên độ ngang ±1 px | **đứng yên**; chỉ điểm sáng trắng nhấp 1 lần mỗi 40 khung |
| **Lớp vẽ** | hạt sau thân nếu x < tâm, trước thân nếu x ≥ tâm | luôn trước thân | chân: trước thân; vai: sau thân |
| **Chữ số sát thương theo thời gian** | giữ như cũ, màu `#5aca02` | `#fe7d04` | `#32b0e9` |

**Quy tắc chung [BẮT BUỘC]:** hạt không được vượt quá hộp thân + 2 px mọi phía (giữ silhouette); không đặt hạt lên vùng đầu phía trước mặt; không nhuộm vũ khí cầm tay; khi quái ở khung "trúng đòn" (chớp trắng) thì tắt nhuộm trong 2 khung để chớp vẫn đọc được.

**Kết hợp nhiều trạng thái** (xem mục 2): không cộng dồn nhuộm. Nhuộm chỉ **một** màu theo ưu tiên; các trạng thái còn lại chỉ hiện bằng **hạt**. Tối đa 6 hạt tổng cộng trên một quái, ưu tiên hạt của trạng thái mới nhất.

**Vỡ giáp** (quái mất khiên):
- *Tức thời* (0,4 s): dải `hu-pha-giap` đã có, nổ trên đầu + 3 mảnh khiên xám `#c9ccd2` viền `#14182e` 2×2 px rơi xuống đất theo parabol, sống 20 khung. Giữ như hiện nay.
- *Duy trì*: thay biểu tượng trên đầu bằng **vết nứt trên thân** [THỬ]: một đường zích zắc 1 px `#14182e` dài 40% H chạy chéo qua ngực, kèm 2 pixel `#c9ccd2` ở mép vết nứt; vẽ **trước thân**, không đổi khi quái cử động (bám theo hộp thân). Nếu thử thấy không đọc được ở H = 24 → giữ biểu tượng trên đầu **chỉ cho vỡ giáp** (ngoại lệ duy nhất), cỡ 12×12.
- Khiên còn nguyên: vệt cong vàng trước mặt (`shieldArc`) giữ nguyên.

**Tương phản trên nền rừng (quái độc)** [BẮT BUỘC]: nền rừng không được chứa màu nào trong dải Độc (`#5aca02`, `#c8f90b`, `#277600`) — xem bảng màu sàn mục 5. Ngoài ra hạt độc có lõi `#fbfed0` (trắng ngà) nên luôn nổi trên lục tối. [THỬ] nếu vẫn chìm: tăng mức hoà Độc lên 45% và thêm viền ngoài 1 px `#c8f90b` nhấp 1 lần/30 khung.

## 2. Quy tắc ưu tiên hiển thị

1. **Đóng băng** > **Cháy** > **Độc** cho **màu nhuộm** (băng là trạng thái khống chế nên phải thấy ngay; cháy sát thương cao hơn độc).
2. Hạt: luôn vẽ hạt của **mọi** trạng thái đang có, nhưng tổng ≤ 6: băng 3 + cháy 2 + độc 1 khi cả ba.
3. Trạng thái mới đè trạng thái cũ trong 6 khung đầu (nhuộm theo trạng thái mới), rồi quay về luật 1 — để người chơi thấy "vừa dính thêm".
4. Vỡ giáp độc lập với 1–3 (vết nứt luôn vẽ).
5. Khi quái chết: tắt nhuộm, hạt tan trong 6 khung; dải chết dùng ảnh/tan rã như hiện nay.
6. Cờ `G.TRANG_THAI_TREN_THAN = false` → mọi điều trên tắt, về cách cũ.

## 3. Quy trình tạo tile lặp (seamless)

**Đánh giá thật:** AI tạo ảnh (kể cả ChatGPT) **không bảo đảm** 4 mép khớp chỉ bằng prompt. Thường được: hoa văn mịn, ít chi tiết lớn. Thường hỏng: 1–3 px lệch ở mép, một chi tiết to bị cắt đôi, màu mép hơi sáng hơn tâm. Vì vậy **hậu kiểm bằng công cụ là bắt buộc**; prompt chỉ giúp giảm số lần làm lại.

Các bước:
1. **Yêu cầu vẽ mảng 3×3** (9 ô 64×64 game liền nhau, không kẻ lưới, tổng 192×192 game = 384×384 ảnh) với câu "the pattern repeats exactly every 1/3 of the width and height". Lấy **ô giữa**. Lý do: mép của ô giữa là phần giữa ảnh, AI vẽ liền mạch hơn mép ảnh.
2. **Công cụ Tách Phòng cắt ô giữa**, rồi tự **ghép thử 3×3** từ ô giữa và hiện phóng 3×. Đạt khi: không có đường sáng/tối liền chạy dọc hoặc ngang tại biên ô (đo: hiệu độ sáng trung bình giữa cột 63 và cột 0 của ô kề ≤ 8/255; tương tự hàng 63–hàng 0); không chi tiết nào bị cắt cụt ở biên.
3. Lệch nhỏ (≤ 2 px): công cụ sửa bằng **dịch vòng** (wrap-shift) tìm độ dịch (dx, dy) ∈ [−4, 4] cho hiệu biên nhỏ nhất, rồi dán lại. Lệch lớn hoặc chi tiết cắt cụt: **vẽ lại** với prompt thêm "no large object within 12 px of any edge".
4. Giảm màu theo bảng (Đợt 4) → kiểm số màu ≤ 12 cho một mảng sàn.
5. Xuất `gd-nen-rung-san0/1/2`, `-san-nhan` ở `net: 2`.
6. Kiểm cuối trong game: 5 phòng hạt giống 1–5, ảnh phóng 2×, nhìn 3 giây mỗi phòng — không nhận ra ô lặp.

Tiêu chí **không đạt** (làm lại): thấy "đường ray" sáng chạy suốt phòng; cùng một chi tiết to lặp cách đều 64 px; mảng điểm nhấn xuất hiện hai ô kề nhau.

## 4. Prompt tiếng Anh tạo tile sàn rừng (dùng cho mảng cơ bản; mảng điểm nhấn xem ghi chú)

```
Pixel art seamless ground texture for a 2D top-down-ish action game, Vietnamese old-forest floor.
Output: one square image 384x384 px, made of a 3x3 repetition of ONE 128x128 px tile. The pattern must repeat exactly every 128 px horizontally and vertically, so the center tile can be cut out and tiled infinitely with no visible seam. Opposite edges of the tile must match pixel-for-pixel.
Style: crisp pixel art on a 2x pixel grid (every drawn pixel is a 2x2 block), hard edges, no anti-aliasing, no gradients, no blur, no lighting hotspot, flat even brightness across the whole image.
Palette, use ONLY these colors: #3b6d2a (main grass-moss), #2a4d1f (dark moss), #1c3316 (deep shadow), #4a7a33 (slightly lighter moss, sparse), #5a4a30 (packed earth, small patches). Do not use bright green #5aca02, lime #c8f90b or dark green #277600 anywhere.
Content: low-contrast mossy ground with packed-earth patches, tiny pebbles (2-4 px), short grass tufts, occasional small roots. Detail is small and evenly spread; no object larger than 20 px; no object within 12 px of the tile edges; no leaves, flowers, text, grid lines, borders or frame.
Variation: this is tile number {1 of 3 / 2 of 3 / 3 of 3}; keep the same palette and density as the other tiles but with a different arrangement.
```
Ghi chú: 128 px ảnh = 64 px game ở nét gấp đôi. Mảng **điểm nhấn** dùng cùng prompt nhưng thay dòng Content bằng: "one medium feature (a mossy exposed root cluster OR a shallow puddle OR a flat stone) about 40 px wide placed near the center, surrounded by the same low-contrast moss as the base tiles; the feature must not touch the edges". Ba màu `#4a7a33`, `#5a4a30` là màu **phụ cho sàn**, không thêm vào bảng lõi; lý do: bảng lõi chỉ có 3 nấc lục tối, cần một nấc sáng hơn làm điểm và một nấc đất để sàn không đơn sắc.

## 5. Bảng thông số tile

| Mảng | Cỡ game (ảnh) | Lặp | Số màu tối đa | Mật độ chi tiết | Khác biệt giữa các mảng |
|---|---|---|---|---|---|
| `gd-nen-rung-san0/1/2` | 64×64 (128×128) | 4 mép | 6 (5 màu bảng + viền tuỳ chọn) | 8–14 chi tiết nhỏ, không chi tiết > 20 px game | san0: nhiều rêu, san1: nhiều đất, san2: nhiều sỏi; cùng độ sáng trung bình ±5/255 |
| `gd-nen-rung-san-nhan` | 64×64 | 4 mép | 8 | 1 chi tiết vừa ≤ 40 px ở giữa | rải ≤ 6% ô, không kề nhau |
| `gd-nen-rung-tuong-sau` | 64×49 | ngang | 10 | hàng thân cây/bụi, phần dưới tối dần | — |
| `gd-nen-rung-tuong-ben` | 14×64 | dọc | 8 | rễ/bụi dọc, vẽ bên trái, game lật | — |
| `gd-nen-rung-tuong-truoc` | 64×12 | ngang | 8 | cỏ cao che chân tường | — |
| `gd-nen-rung-ngoai` | 64×64 | 4 mép | 4 | rất tối `#0f1a0c`/`#14182e`, gần như trơn | — |
| `gd-nen-rung-mep` | 64×12 | ngang | 6 | cỏ cao lớp phủ trước, nền trong suốt | — |

**Màu sàn và tương phản [BẮT BUỘC]:** sàn dùng `#3b6d2a` 55% diện tích, `#2a4d1f` 25%, `#1c3316` 10%, `#4a7a33` 5%, `#5a4a30` 5%. Độ sáng trung bình của sàn ≈ 0,32 (thang 0–1); em bé (da `#eeac6d`, áo bão hoà) và hạt độc (`#c8f90b`, lõi `#fbfed0`) đều sáng > 0,6 nên nổi. Tuyệt đối không dùng 3 màu Độc trong sàn, tường.

**Rải ngẫu nhiên:** theo hạt giống phòng; mỗi ô chọn 1/3 mảng + lật ngang (chỉ lật ngang, không xoay — xoay làm bóng đổ sai hướng); không cho 3 ô liên tiếp cùng mảng cùng hướng.

## 6. Tường và góc nối

- **Tường sau** lặp ngang: mép trái–phải khớp; phần dưới cùng 4 px là dải tối `#1c3316` để gặp sàn không hở. Vẽ **sau** sàn, sàn đè lên 2 px dưới cùng.
- **Tường bên** lặp dọc: mép trên–dưới khớp; cột ngoài cùng (phía sàn) 2 px là `#1c3316`. Vẽ sau sàn, sàn đè 1 px.
- **Góc**: không cần tile góc riêng. Thứ tự lớp: nền ngoài → tường sau (kéo dài thêm 14 px mỗi bên ra sau tường bên) → tường bên (vẽ đè lên phần kéo dài) → sàn → cửa → lớp phủ mép/tường trước → vật thể → nhân vật. Vì tường bên đè lên tường sau ở góc, không bao giờ hở nền.
- **Chỗ cửa**: tường chừa lỗ đúng cỡ cửa A2 đã chốt; mép lỗ vẽ bằng 1 px `#14182e`.
- Kiểm: 3 cỡ cửa sổ (844×390, 1280×720, 1024×768) × 3 phòng, soi 4 góc phóng 4×: không pixel nền ngoài lọt vào trong, không đường nối sáng.

## 7. Checklist nghiệm thu

**Trạng thái trên thân**
- [ ] Ảnh 4 cột (thường/độc/cháy/băng) của một quái H≈30 và một quái H≈60, phóng 3×: viền và mắt không đổi màu (so pixel = 0 khác tại các pixel viền/mắt).
- [ ] Hạt nằm trong hộp thân +2 px; không hạt nào trước mặt.
- [ ] Hai trạng thái cùng lúc: nhuộm đúng ưu tiên, tổng hạt ≤ 6.
- [ ] Quái độc trên sàn rừng mới: độ chênh độ sáng thân so với nền ≥ 0,15.
- [ ] Trên đầu quái không còn biểu tượng trạng thái (trừ vỡ giáp nếu chọn ngoại lệ); biểu tượng tinh anh và thanh máu còn nguyên.
- [ ] FPS phòng 6 quái cùng dính độc: không giảm so với trước.
- [ ] Cờ tắt → 0 điểm ảnh khác bản cũ.

**Tile**
- [ ] Mỗi mảng: hiệu độ sáng biên trái–phải và trên–dưới ≤ 8/255; không chi tiết cắt cụt.
- [ ] Ghép 3×3 phóng 3×: không "đường ray".
- [ ] 5 phòng liên tiếp: không nhận ra ô lặp; không hai ô điểm nhấn kề nhau.
- [ ] 4 góc × 3 cỡ cửa sổ: không hở nền ngoài.
- [ ] Sàn không chứa màu Độc; số màu mỗi mảng ≤ bảng mục 5.
- [ ] Dung lượng 9 ảnh của vùng Rừng ghi vào báo cáo.
