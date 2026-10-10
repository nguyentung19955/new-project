# LINH KHÍ — Hướng dẫn phong cách hình ảnh (ART STYLE GUIDE)

> **Sự thật quan trọng:** game **không dùng file ảnh**. Toàn bộ nhân vật, quái, trùm, vũ khí, hiệu ứng và nền đều được **vẽ bằng code** (Canvas 2D, từng ô điểm ảnh). Tài liệu này mô tả phong cách mà code đang vẽ (**HIỆN TẠI**) và phong cách nên hướng tới (**ĐỀ XUẤT**). Phần đề xuất lấy từ `docs/review/THIET-KE-HINH-ANH-GPT.md`, là tài liệu mà 3 phiên Giai đoạn 5 (nhánh gd5-a, gd5-b, gd5-c) đang dùng để vẽ lại bằng code.
> Ảnh do AI tạo ra **chỉ là concept hoặc ảnh tham chiếu**. Muốn ảnh vào được game thì phải qua hậu kỳ pixel và một đường nạp ảnh; xem `INTEGRATION_AND_QA.md`.

Ký hiệu độ tin cậy trong tài liệu:
- ✅ = đã kiểm tra trong code hoặc đo trên ảnh chụp.
- 💡 = đề xuất, chưa có trong game.

---

## 1. Khung hình và mật độ điểm ảnh

| Mục | HIỆN TẠI | ĐỀ XUẤT |
|---|---|---|
| Lớp thế giới | ✅ 480×270 điểm ảnh (`game/index.html`, `G.W/G.H` ở `data.js:4-5`) | giữ nguyên |
| Tỉ lệ sprite / thế giới | ✅ 1:1. Một điểm ảnh sprite bằng một điểm ảnh thế giới, không thu phóng. Ngoại lệ: Hồ Tinh ở pha 3 được vẽ thu nhỏ còn 0.72 (`boss.js`) | giữ 1:1. Hồ Tinh pha 3 nên vẽ ở cỡ thật để tránh điểm ảnh bị nhảy |
| Làm mịn | ✅ `imageSmoothingEnabled=false`, CSS `image-rendering: pixelated` | giữ nguyên. Cấm hoàn toàn ảnh mờ hoặc có khử răng cưa |
| Phóng ra màn hình | ✅ hệ số **không nguyên** (`engine.js resize`, s = min(W/480, H/270)), nên điểm ảnh có thể to nhỏ không đều | 💡 cân nhắc phóng theo số nguyên (đây là việc của code, không thuộc phạm vi gói này) |
| Lớp giao diện | ✅ canvas riêng `#ui` theo độ phân giải màn hình (dpr tối đa 3). Chữ dùng font vector **Be Vietnam Pro**, không phải font pixel | giữ nguyên |
| Em bé | ✅ đứng yên: Thợ Rèn 19×31, Thợ Săn **22×33**, Thầy Lang 24×32, Đô Vật 20×29 (đo được). Đầu chiếm khoảng 2/5 chiều cao | giữ khung khoảng 22×33. Không đổi hitbox |
| Quái thường | ✅ lưới vẽ từ 29×24 (Nhím Biển) đến 63×28 (Chồn Bóng). Phần thân thật khoảng 20–45 px | giữ nguyên cỡ |
| Tinh anh / trùm nhỏ | ✅ tinh anh từ 64×44 đến 90×44; trùm nhỏ từ 97×64 đến 116×70 | giữ nguyên |
| Trùm vùng | ✅ Mộc Tinh 140×126, Ngư Tinh 150×102, Hồ Tinh 174×115 (pha 3 là 281×174 nhưng vẽ thu còn 0.72) | giữ nguyên cỡ ở pha 1 và 2 |

**Quy tắc vàng:** luôn đánh giá ảnh ở **cỡ thật (×1)** và ở **×2**. Không duyệt ảnh chỉ vì nó đẹp khi phóng ×8.

## 2. Bóng dáng (silhouette)

- **HIỆN TẠI ✅:** 4 em bé có chung một khung người. Cả bốn đều đội mũ trùm và đeo mặt nạ trắng, chỉ khác màu áo và món đồ đeo (H1). Quái có bóng dáng khá riêng, nhưng nhiều con lại kèm hiệu ứng ngay trong hình (vòng nổ, tia gai), nên khi đứng đông thì bóng dáng bị lẫn vào nhau.
- **ĐỀ XUẤT 💡:**
  - Phải nhận ra được trong vòng 0.5 giây ở cỡ thật. Cách thử: tô đen toàn bộ hình rồi xem còn phân biệt được không.
  - Mỗi nhân vật có **1 dấu hiệu chính** và tối đa 1–2 dấu hiệu phụ:
    - **Thợ Rèn:** dáng thấp, chắc, vai rộng, đầu hoặc mũ tròn, búa con lệch ra sau lưng.
    - **Thợ Săn:** cao và hẹp, mũ chóp vải, cung hoặc ống tên tạo một đường chéo.
    - **Thầy Lang:** đầu hoặc khăn tròn, áo mềm, túi thuốc hoặc bó lá sau lưng.
    - **Đô Vật:** thân bè ngang, chân dạng rộng, khăn buộc đầu và đai lưng. **Không** đội mũ trùm.
  - Tinh anh giữ đúng loài, chỉ thêm 1–2 dấu hiệu cấp bậc lớn (giáp, sừng, lõi, mắt).
  - Trùm:
    - **Mộc Tinh:** tán cây gom thành 3–5 khối, mặt là một khối riêng, rễ có 2–3 nhánh chính.
    - **Ngư Tinh:** dáng dài theo chiều ngang, vảy gom thành dải lớn.
    - **Hồ Tinh:** 9 đuôi tách hướng rõ, nhưng chỉ 2–3 đuôi sáng cùng lúc.

## 3. Viền

| | HIỆN TẠI ✅ | ĐỀ XUẤT 💡 |
|---|---|---|
| Em bé, vũ khí | Viền ngoài 1 px màu `#1b1118` (INK). Mỗi bộ phận cũng có viền 1 px riêng | Giữ viền 1 px. Không dùng viền sáng dày bao quanh cả hình |
| Quái, trùm | Viền 1 px `#14182e`, mép dưới `#0a0c1e` | giữ nguyên |
| Vũ khí theo bậc hiếm | Màu INK được đổi thành `#1f4fa8` (Xanh) / `#5a2499` (Tím) / `#a86a08` (Vàng) | giữ nguyên |
| Đạn của quái | Viền `#1a0a0c` + quầng đỏ `#ff2a1a` | giữ nguyên |
| Ánh viền | Em bé có ánh viền nhạt phía phải và phía trên (`vanhBe`, pha về `#fff6de` với k = 0.22 / 0.10) | giữ ở mức nhẹ |

## 4. Sáng tối

- **HIỆN TẠI ✅:** ánh sáng chiếu từ **trên-phải**. Mỗi chất liệu dùng 3 tông `[tối, giữa, sáng]`. Mỗi bộ phận được vát sẵn: mép trên sáng, mép dưới và mép trái tối. Bóng đổ do code vẽ riêng: em bé dùng 3 hàng `rgba(0,0,0,.3)`, quái dùng hình elip đen alpha .28.
- **ĐỀ XUẤT 💡:** tỉ lệ diện tích tối 55–65% / giữa 25–35% / sáng 5–15%. Không để chấm sáng li ti rải khắp thân. **Ảnh AI không được tự vẽ bóng đổ dưới chân**, vì code đã vẽ bóng rồi.

## 5. Bảng màu

### 5.1 Màu chung
- Mực viền: `#1b1118` (em bé, vũ khí), `#14182e` (quái).
- Da linh thể của em bé ✅: `#7f79a6 #b7b1d8 #e2def4`.
- Mặt nạ ✅: `#c9c0ae #f6f0e2 #ffffff`.
- Má ✅: `#f2b0a8`.

### 5.2 Màu theo hệ
Lấy từ `fx.js` PAL và `data.js` G.EL ✅:

| Hệ | hi | c2 | c | d |
|---|---|---|---|---|
| Lửa | `#fff3b0` | `#ffd23f` | `#ff7a2a` | `#a8320a` |
| Độc | `#e6ffc0` | `#c2f58a` | `#6fcf3a` | `#2f6b1a` |
| Băng | `#ffffff` | `#e9f9ff` | `#7fd4ff` | `#2b6ea3` |
| Thường | `#ffffff` | `#ffffff` | `#e4e0d4` | `#8a93a0` |
| Kẻ địch | `#ffffff` | `#ffd0c0` | `#ff5a40` | `#8a1c12` |

### 5.3 Màu em bé

| Em bé | HIỆN TẠI ✅ | ĐỀ XUẤT 💡 (THIET-KE-HINH-ANH-GPT §6) |
|---|---|---|
| Thợ Rèn | `#8c1c1f #d2362e #f47a62` | giữ nguyên, thêm kim loại `#e2b64e` |
| Thợ Săn | `#255a2c #479544 #8fd070` | `#315b3c #4f8951 #a7cf78`, dây cung `#d9c9a1` |
| Thầy Lang | `#27407f #4468c0 #86a8f0` | `#286b70 #43a39a #9ce5c7` (chuyển sang xanh ngọc), túi `#8a5a39` |
| Đô Vật | `#9a4a16 #dd7c2a #f8b25c` | `#7d382b #b85b40 #ed9a61`, đai `#d9a441` |

### 5.4 Màu ba vùng

| Vùng | HIỆN TẠI ✅ (data.js, room_art.js) | ĐỀ XUẤT 💡 (§10) |
|---|---|---|
| Rừng già (hệ độc) | trời `#16261c #1f3a28 #2c5234`, đất `#3d5a2a`, ánh `#e4f0a0` | sàn `#343e2a #414a31 #50563a`; vùng tối `#1b3021 #2d422b #4b3928`; điểm sáng `#b8dc70 #e4f0a0` |
| Hang biển (hệ băng) | trời `#0d1826 #132a40 #1c3f5c`, sàn `#1b222b…#4a5560`, pha lê `#58c8ea #d8f6ff #2a7fae` | sàn `#252f3b #354453 #465767`; vùng tối `#101d2b #1d3040 #2c4659`; điểm sáng `#6fbedb #b6edfa` |
| Lâu đài cổ (hệ lửa) | gạch `#4b3f3f`, sàn `#4f4745`, gỗ `#4a3020/#2e1c12/#6a4830`, sắt `#55555e/#8a8a96`, vàng `#c89a3a`, đuốc `#ffc878` | sàn `#45403d #514744 #60524b`; tường `#2b2528 #403234 #594342`; đuốc `#e5a75e #ffc878` |

### 5.5 Màu cấm: đỏ là màu của NGUY HIỂM
- Đỏ và cam đỏ tươi (`#ff2818` đến `#ff5a40`) chỉ dành cho vùng báo trước, đạn của quái và đòn của quái (`docs/vfx/BANG-MAU.md`).
  - Nền **không** được dùng màu này.
  - Đỏ trong lâu đài phải là đỏ trầm (`#4e2a32`, `#7a2a2a`, độ sáng ≤ 30).
- Ngoại lệ đang có trong code ✅ (chỉ ghi nhận, **không** mở rộng thêm):
  - thanh máu `#d0482f`;
  - thanh máu của quái `#e8483a`;
  - lông đuôi tên `#c8372d`;
  - một số quái có màu đỏ: Cua Lính `#ee5c3a`, Tiểu Yêu `#b0261a`, Dơi Than `#f0506e`.
- Ảnh AI cho em bé, vũ khí và nền **không được** có mảng đỏ tươi lớn. Thợ Rèn được dùng đỏ trầm của mình nhưng không được sáng hơn `#f47a62`.

## 6. Vật liệu

| Vật liệu | Màu đang dùng ✅ | Cách vẽ |
|---|---|---|
| Gỗ | `#7a4a22 #9a6430` (đạo cụ); `#4a3020 #2e1c12 #6a4830` (lâu đài) | Vân gỗ là 1–2 đường ngang, không vẽ từng sợi |
| Đá | `#8d8f96 #c8cad0`; gạch `#4b3f3f` | Khối lớn có mép sáng ở trên-phải, khe tối 1 px |
| Kim loại | sắt `#62626a #9a9aa4`, thép lưỡi `#e4e0d4`, vàng `#d8a838 #f0c83a` / `#c89a3a` | Một vệt sáng 1–2 px dọc lưỡi. Không tô nhiều dải ánh kim |
| Vải | 3 tông màu của từng em bé | Nếp vải là 1–2 đường tối, vạt áo có dáng rõ |
| Linh khí (năng lượng) | 3 màu hệ ở mục 5.2; viên linh khí là dấu cộng 3–5 px có lõi trắng | Lõi trắng nhỏ, quầng **ô cờ** (dither) theo các mức alpha .32 / .18 / .10. **Không** làm mờ (blur), **không** cộng sáng trong chiến đấu |

## 7. Phối nhân vật với nền

- Nhân vật phải sáng hơn sàn hoặc khác sắc độ rõ ràng.
- **HIỆN TẠI ✅:** ở Lâu đài cổ, quái và sàn chỉ chênh nhau 38–59 về độ sáng (H2). Sàn bị giảm bão hoà ×0.84–0.88 và góc phòng bị tối đi 0.15–0.17 (H7).
- **ĐỀ XUẤT 💡:**
  - Vùng quanh nhân vật và điểm nguy hiểm ít chi tiết hơn phần còn lại.
  - Màu nóng chỉ dùng cho đuốc, mắt quái, vũ khí và đòn đánh.
  - Giảm độ tối ở góc phòng, không tạo khung viền đen dày.
- Kiểm tra bằng cách đặt sprite lên ảnh `anh/canh/*_phong_trong_480x270.png` ở cỡ ×1.

## 8. Hiệu ứng và mức độ ưu tiên đọc

Thứ tự ưu tiên khi màn hình đông, từ quan trọng nhất:
1. vùng báo trước, đạn của quái;
2. em bé;
3. phản hồi trúng đòn;
4. quái;
5. hạt trang trí, vệt cũ, số sát thương do độc hoặc cháy.

Số liệu:
- **HIỆN TẠI ✅:** tối đa 400 hạt, 72 hình, 28 con số.
- **ĐỀ XUẤT 💡:** cảnh đánh thường khoảng 90–120 hạt đang hoạt động.

Thời lượng đề xuất 💡 (§9.2):

| Hiệu ứng | Màu / kích thước | Thời lượng |
|---|---|---|
| Vệt kiếm | `#e4e0d4`, rộng 2–3 px | 0.08–0.12 s |
| Trúng đòn thường | `#fff3df`, 3–5 tia | 0.06–0.09 s |
| Trúng đòn nặng | `#ffd23f`, 5–8 tia | — |
| Chí mạng | 7–10 tia, vòng 8–14 px | 0.10–0.16 s |
| Phá giáp | `#aab3bc`, 4–7 mảnh | — |

## 9. Nhất quán

- Một bộ (một em bé, một vùng quái, một loại vũ khí) phải được làm **trong cùng một phiên tạo ảnh**, cùng một prompt gốc và cùng một ảnh tham chiếu phong cách.
- Mọi sprite quay **phải** (em bé) hoặc **trái** (quái, trùm), đúng như code. Code tự lật hình, nên không cần vẽ hướng ngược lại.
- Đế chân của mọi khung phải nằm trên cùng một hàng điểm ảnh, tức đúng điểm gốc. Không để hình trôi lên xuống giữa các khung, trừ khi động tác vốn có nhún.

## 10. Lỗi cần tránh

- Ảnh mờ, có khử răng cưa, viền nhoè, hoặc điểm ảnh bán trong suốt ở mép.
- Viền trắng hoặc quầng sáng do công cụ tách nền để lại.
- Đổ bóng dưới chân, nền, sàn hay khung viền vẽ dính vào sprite.
- Chi tiết nhỏ hơn 2 px không đọc được ở ×1; hoa văn nhiễu.
- Dùng quá 16 màu cho một sprite thường, hoặc quá 32 màu cho một trùm.
- Mảng đỏ tươi trên nhân vật hoặc nền (đỏ là màu nguy hiểm).
- Đổi tỉ lệ đầu/thân, đổi hướng nhìn, đổi điểm cầm vũ khí.
- Vẽ hiệu ứng (lửa, vòng phép) dính vào thân sprite. Hiệu ứng là phần việc riêng của code.
- Có chữ, logo hoặc chữ ký trong ảnh.
