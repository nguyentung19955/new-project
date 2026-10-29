# Thử Lam PIXEL – 30/10/2026 – BẢN CLAUDE DỰNG, CHỜ DUYỆT HÌNH

Làm theo `docs/gameplay/PHAN-HOI-18-LAM-DON-GIAN-HOA.md` mục **"CHỐT PIXEL ART"**: pixel art THẬT kiểu bảng asset
(`art/huong-moi/lam-chibi/bang-asset-tham-khao.png`) – màu phẳng, viền tối, bóng 1–2 mức. **Trang thử riêng**: game hiện tại,
`thu-lam-moi-2`, `thu-lam-chibi` KHÔNG sửa.

> ⚠ Lúc đẩy lên, một phiên khác vừa đẩy **thiết kế Lam "kiểu 4"** (mũ có chuông ở chóp, đèn lồng sau lưng, bản 54 điểm –
> `art/huong-moi/lam-pixel/lam4-dung-54px.png`, PH18 cập nhật (4)). Bản Lam ở trang này dựng theo mẫu CŨ (`mau-pixel-lam-tu-bang.png`, 36 điểm,
> chuông ở ngực) như việc được giao. Phần dùng lại được bất kể thiết kế: khung 320×180 phóng số nguyên, bảng màu, cảnh, script chuyển ảnh gen,
> cách khoá đầu (một bản vẽ đầu dán mọi khung). Nếu chốt kiểu 4: thay bản vẽ `DAU` trong `dung_lam.py` bằng đầu kiểu 4 (hoặc chạy
> `chuyen_pixel.py` trên ảnh kiểu 4) rồi dựng lại.

**Chơi thử (iPhone xoay ngang):**
https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-lam-pixel/index.html

Điều khiển như `thu-lam-moi-2`: kéo cần trái để chạy · nút **Nhảy** · nút **Chém** (bàn phím: ← → · Z/Space · X).
Nút góc trên phải: **▣ Hộp** (hiện hộp va chạm xanh / hộp chém đỏ / nộm vàng) · **Chậm ×4** · **Phóng: nguyên ×N / lấp đầy** (để so).
Cờ link: `?hitbox=1` · `?cham=4` · `?lien=1` (phóng lấp đầy, KHÔNG nguyên – chỉ để so).

## 1. Xem gì trước (thư mục `xem-thu/`)

| File | Nội dung |
|---|---|
| **`chay-chem-60fps.mp4`** | xem đầu tiên – chạy → chém nộm (3 lần trúng) → lên 2 bậc đá → nhảy xuống → qua miếu chuông, đúng 60 bước/giây |
| `chay-chem.gif` / `chay-chem-cham4.gif` | như trên, GIF toàn tốc (≈30 hình/s) và chậm 4 lần (mọi bước) |
| `chup-960x540.png` | ảnh chụp đúng cỡ chơi lúc chém trúng (cung chém hiện) – 960×540 = logic game |
| `chup-1920x1080.png` | cùng ảnh ×6 = đúng như iPhone ngang thấy (mỗi điểm ảnh = 6×6 điểm màn) |
| `iphone-ngang-844x390.png` | chụp trang giả lập iPhone 844×390 @3x (có nút cảm ứng) |
| `lam-sheet-x8.png` | 15 khung Lam phóng ×8 có lưới điểm ảnh |
| `so-do.md` / `so-do.json` | bảng số từng khung (xem mục 4) |

## 2. Lưới pixel + phóng số nguyên (việc 1)

- 1 điểm ảnh sprite = **3 px logic**; cảnh vẽ vào khung **320×180 điểm** (logic 960×540 giữ nguyên cho vật lý).
- Mọi thứ vẽ nearest-neighbor (`imageSmoothingEnabled=false`), toạ độ vẽ **làm tròn theo điểm** (camera tròn điểm trước, Lam/nộm tròn điểm
  sau) → không rung nửa điểm, không nhoè.
- **iPhone (BK ≈ 2,17 → 1 điểm = 6,5 px màn) KHÔNG đều** nếu phóng thẳng: đo trong Chromium giả lập 844×390 @3x, chế độ `?lien=1`
  cho các đoạn dài 6 và 7 px lẫn nhau. Vì vậy trang **vẽ cảnh ra canvas 320×180 rồi phóng số nguyên** ×N = floor(màn/320×180):
  iPhone ngang → **×6** (bộ đệm 1920×1080, hiện 640×360 CSS; viền đen mỏng ~25 px hai bên). Đo lại: mọi đoạn màu dài bội số của 6 → đều.
  Màn máy tính 1920×1080 → ×6 vừa khít; 1366×768 → ×4.

## 3. Bảng màu + script + dựng (việc 2–5)

| Thứ | Chỗ | Ghi chú |
|---|---|---|
| Bảng màu 32 màu | `art/huong-moi/lam-pixel/palette.json` | xanh trầm mũ (4), mặt đen, hổ phách (3, dùng cả cho đèn), kem khăn (2), đồng chuông (3), bạc nĩa (3), gỗ (3), cỏ/rêu (4), đá (4), nền xa xanh trầm (4), mực viền |
| Thư viện lưới | `art/huong-moi/lam-pixel/code/pixel.py` | ảnh = mảng chỉ số màu; dán ASCII, đường Bresenham, viền ngoài 1 điểm |
| **Lam** | `code/dung_lam.py` → `sprite/lam-pixel.png` (1 px = 1 điểm) + `.json` | 15 khung + 2 ô cung chém |
| Cảnh | `code/dung_canh.py` → `canh/` | đất mép cỏ/rêu, bậc đá 2 tầng, đá, rễ rủ, cây, 2 cột đèn lồng + quầng chập chờn, miếu chuông, nền xa 2 lớp (núi+trăng mờ / rừng tán tròn + sương dither), hình nộm 3 hình, `man.json` (lưới va chạm ô 16 điểm = 48 px logic) |
| Chuyển ảnh gen | `code/chuyen_pixel.py` | xem mục 5 |
| Quay + số đo | `game/thu-lam-pixel/cong-cu/quay.py` | chạy kịch bản phím cố định trong Chromium, xuất mọi file ở mục 1 |

**Lam ≈ 36 điểm cao (108 px logic)**, nhìn ngang quay phải, dựng theo `mau-pixel-lam-tu-bang.png` + `gen-dung-1.png`: mũ trùm xanh trầm chóp
ngả ra sau, miệng mũ viền sáng, mặt đen, MỘT mắt hổ phách 2×3, khăn kem đè mép mũ + đuôi khăn sau lưng, chuông đồng nhỏ ở ngực, ủng nâu,
nĩa hai nhánh bạc (Âm Đao) có chắn đồng.

| Động tác | Khung | Cách dựng |
|---|---|---|
| Đứng thở | dung0, dung1 (đổi mỗi 40 bước) | thân + tay hạ 1 điểm, **đầu đứng yên** |
| Chạy | chay0–5 (phát theo quãng đường, 132 px logic / vòng như clip v4) | chạm – nhún – **bay (hai ủng rời đất)** × 2 chân; thân nghiêng 1 điểm; gấu áo lệch luân phiên + một nếp đổi; đuôi khăn rủ/ngang/bay; **đầu chỉ nhún 0–1 điểm** |
| Chém 1 | A1 (atkT 1–3) · A2 (4–6) · **S (7–11)** · R1 (12–16) · R2 (17–23) | A1/A2 lấy đà: thân ngả sau 1 điểm, nĩa giơ ra SAU lưng (vẽ dưới thân, không che mặt) · S: thân lao 2 điểm, tay duỗi, nĩa ngang + **cung chém 3 màu (bạc sáng / kem / xanh mũ sáng)**, cung đầy atkT 7–9, cung tan 10–11 · R1 nĩa chúi xuống · R2 về thủ |
| Nhảy / rơi | nhay, roi | ủng co / gấu xoè, đuôi khăn bay |

**Gameplay giữ nguyên `thu-lam-moi-2`** (chép số, không chép hình): chạy 264 px/s (4,4/bước), gia tốc 6 / giảm 5 bước, nhảy mới
(cao 118, trọng lực 0,768, đỉnh 0,3, rơi tối đa 10,4 có gối mềm), coyote 6, đệm nhảy 8, collider 20×30, chém 1 su 7 · ac 8 · re 8,
hộp **[4, −97, 86, 48]** so với chân, bước tới 2,2 khi chém dưới đất, khựng 3 bước khi trúng. Cung chém nằm ĐÚNG trong hộp này
(ảnh kiểm khi bật ▣ Hộp). Trang này chỉ có chạy / nhảy / chém 1 (mọi lần bấm Chém = chém 1, kể cả trên không) – không lướt, tường, Vọng.

## 4. Bảng số (`xem-thu/so-do.md`) – điểm = 1 điểm ảnh = 3 px logic

| Nhóm | Đỉnh mũ dao động | Mắt y dao động | Mắt x dao động |
|---|---|---|---|
| Đứng | 0 | 0 | 0 |
| Chạy 6 hình | **1 điểm (3 px logic)** | 1 điểm | 0 |
| Chém 1 | 1 điểm | 1 điểm | 3 điểm (lấy đà lùi 1, đánh lao 2 – có chủ ý) |

- **Đầu lệch so bản vẽ gốc: 0/208 điểm ở cả 15 khung** (đầu là MỘT bản vẽ, chỉ dịch nguyên điểm). So với Lam gen trước: mắt dao động
  8,1 px logic khi chạy → nay 3 px logic.
- Số điểm khác nhau giữa 2 khung chạy liền nhau: 337, 343, 166, 337, 342, 181 (trên ~570 điểm của hình) – phần đổi là ủng, gấu, đuôi khăn,
  tay; khung 2→3 và 5→0 ít đổi nhất (chuyển chân sau pha bay).

## 5. Thay bằng ảnh gen pixel mới (lệnh 1 dòng)

Từ thư mục `tieng-vong-cuoi-cung/`:

```
python3 art/huong-moi/lam-pixel/code/chuyen_pixel.py art/huong-moi/nguon/<anh-gen>.png --neo-mat
```

Script: tách nền trắng (chỉ phần trắng nối mép ảnh) → **tự dò cỡ ô điểm ảnh giả** (chu kỳ biên màu; sai thì thêm `--o 4`, `--o 5`…) →
lấy màu trội từng ô → ép bảng 32 màu → viền ngoài tối 1 điểm (`--vien them|thay|khong`) → tách từng hình theo thành phần liên thông →
neo chân chung, căn ngang theo MẮT hổ phách (`--neo-mat`; bỏ cờ = theo giữa đế) → xuất vào `art/huong-moi/lam-pixel/tu-anh-gen/<tên>/`:
từng hình 1 px = 1 điểm, sheet ô đều, `-x8.png` để xem, `.json` (cỡ ô dò được, neo, vị trí mắt từng hình).
Đã chạy thử trên `mau-pixel-lam-tu-bang.png`: tự dò ra ô 3 px (ảnh mẫu đã bị co giãn nhoè) → `tu-anh-gen/mau-pixel-lam-tu-bang/`;
chỉnh tay `--o 4 --ten mau-o4` ra hình ~38 điểm gần cỡ Lam → `tu-anh-gen/mau-o4/`. Bóng xám dưới chân trong ảnh mẫu cũng bị giữ lại –
ảnh gen nên KHÔNG có bóng dưới chân.
**Ghép vào trang**: hiện trang đọc `sprite/lam-pixel.json` do `dung_lam.py` dựng. Khi có sheet gen đủ khung (đứng / chạy 6 / chém 5 / nhảy /
rơi) thì đổi tên khung trong JSON cho trùng (dung0…, chay0–5, chemA1…, nhay, roi) – hoặc nhờ Claude ghép; đầu nên vẫn dán từ một hình
chuẩn (khoá đầu) thay vì lấy từng ô gen.

Dựng lại sau khi sửa code: `python3 art/huong-moi/lam-pixel/code/dung_lam.py` · `python3 art/huong-moi/lam-pixel/code/dung_canh.py` ·
`python3 game/thu-lam-pixel/cong-cu/quay.py` (quay lại GIF/MP4/số đo).

## 6. Tự đánh giá (chưa phải duyệt)

- Nhận dạng Lam đọc rõ ở 36 điểm: mũ chóp, mắt hổ phách, khăn kem, chuông, nĩa. Hình nhỏ hơn Lam gen cũ (108 so với ~112–160 px logic).
- Chạy: đầu yên, chân + gấu đổi rõ, có pha bay; chưa có tay vung (nĩa cầm ngang trước) – có thể thêm 1 điểm vung nếu thấy cứng.
- Chém: lấy đà → đánh → hồi đọc rõ nhịp; cung đè lên mũ một chút vì hộp chém 1 bắt đầu ngang đỉnh mũ (−97 px logic).
- Cảnh tối huyền bí, đèn ấm; cỏ/đất còn sáng hơn nhân vật – nếu thấy lấn có thể hạ một mức màu.
- Ảnh/GIF/số đo lấy trong Chromium không GPU trên máy chủ; chưa thử trên iPhone thật.
