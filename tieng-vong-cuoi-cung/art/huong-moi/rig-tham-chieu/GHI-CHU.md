# Rig tham chiếu dựng bằng CODE → ChatGPT vẽ Lam theo rig (thử: CHẠY 12 hình) – 29/10/2026

Viết cho người không rành kỹ thuật. Đây là **lượt thử cách mới** trong `docs/KINH-NGHIEM-GEN-CHUYEN-DONG-BANG-RIG.md`, áp cho MỘT động tác:
Lam chạy 12 hình (mục tiêu PH15 mục 1–2: 12 hình, nhún thân 3–4 px, 132 px/vòng, 264 px/s).
**Không sửa trang game nào**, chưa ghép vào game – chỉ có ảnh rig, GIF xem trước, prompt.

## 1. Bạn làm gì tiếp theo

1. Mở `PROMPT-CHAY-12.md` → **Prompt A**: đính kèm 3 ảnh đúng thứ tự (rig `rig-chay-12.png`, Lam chốt, Âm Đao), dán khối tiếng Anh.
2. Nếu kết quả to/nhỏ khác nhau hoặc lệch tư thế → **Prompt B** (ghi số ô cần sửa).
3. Lưu ảnh ChatGPT vào `art/huong-moi/nguon/lam-tu-the/thu12-chay-12o-rig.png` (nền trắng, 2 hàng × 6) và nhắn Claude – Claude dựng sheet + so với rig (mục 5).

## 2. Xem gì

| File | Nội dung |
|---|---|
| **`rig-chay-12.png`** | ảnh đính kèm ChatGPT: 12 ô bằng nhau, 2 hàng × 6, nền trắng, số nhỏ ở góc ô |
| `rig-chay-12-1hang.png` | cùng 12 ô một hàng (dự phòng) |
| **`xem/rig-chay-toc-do.gif`** | rig chạy tại chỗ ĐÚNG tốc độ game (0,5 s/vòng); vạch xám dưới đất trôi lùi 11 px/hình → bàn chân trụ phải đứng yên so với vạch |
| `xem/rig-chay-cham4.gif` | như trên, chậm 4 lần, có tên từng hình |
| **`xem/rig-chong-lam-chot.png`** | rig hình 3 / hình 1 chồng lên Lam chốt CÙNG tỉ lệ (vạch vàng = mắt chốt 72,6; vạch xám = cổ, đỉnh 112) |
| **`xem/so-nhip-sheet8-rig12.gif`** (+ `-cham4`) | trái: sheet chạy 8 hình đang dùng; phải: rig 12; dưới: biểu đồ độ cao mắt theo thời gian (đỏ = sheet 8, ngọc = rig 12) + lúc đổi chân |
| `rig-chay-12.json` | toạ độ mọi khớp từng hình (px logic) để Claude kiểm ảnh gen sau |

## 3. Số đo (tự kiểm trong script)

| | Sheet 8 đang dùng | Rig 12 |
|---|---|---|
| Số hình / vòng | 8 (62,5 ms/hình, 16,5 px/hình) | **12** (41,7 ms/hình, **11 px/hình**) |
| Nhún (độ cao mắt cao nhất − thấp nhất) | 8,1 px | **3,5 px** (chậu cũng 3,5) |
| Chân trụ trượt | trượt trong lúc giữ hình (16,5 px) | **0**: gót/bàn/mũi khoá đúng điểm đất hình 1–4 (gót 14,5 · mũi 23,0) |
| Độ dài xương | – | không đổi qua 12 hình (script kiểm, không lỗi) |

GIF chỉ nhận bội 10 ms → thời gian từng hình 40/50 ms rải đều, tổng 1 vòng đúng 500 ms.

## 4. Quy ước rig (giống file kinh nghiệm)

- Nhìn ngang, mặt hướng **PHẢI**; phía trước = bên phải ảnh. Mũi tam giác nhỏ trên đầu chỉ hướng mặt.
- Tay/chân **GẦN** máy quay = bên **TRÁI** cơ thể = **CAM**, vẽ **trước** thân. Tay/chân **XA** = bên phải = **XANH DƯƠNG**, vẽ **sau** thân.
- Đầu + thân = xanh ngọc. Viền **xám nhạt** = khối mũ + áo choàng (lấy đường bao từ ảnh Lam chốt, ngả theo thân, tà sau kéo về sau và lắc nhẹ; gấu cách đất ~4,5 px → chỉ lộ mũi ủng). Đường xám đậm = mặt đất.
- Khớp: chậu, hông, gối, cổ chân, bàn chân (mũi); ngực, cổ, vai, khuỷu, cổ tay. Âm Đao = đường xám từ nắm tay gần, dài 30 px.
- Tỉ lệ Lam (đơn vị = px logic, Lam cao 112): chậu cao 31, đùi 16,5, cẳng chân 15,5, thân 21 + cổ 4,5, cánh tay 12, cẳng tay 11;
  mũ chiếm ~ nửa trên (cổ ở ~56). Ô ảnh: 3 px / đơn vị, 330 × 390 px; chậu ở x = 135, đất ở y = 366 trong mỗi ô.

**12 hình** (chân gần chạm ở 1–4, chân xa ở 7–10; 5–6 và 11–12 bay):
1 tiếp đất gần → 2 hạ → 3 giữa → 4 đẩy → 5 bay → 6 chuyển → 7 tiếp đất xa → 8 hạ → 9 giữa → 10 đẩy → 11 bay → 12 chuyển (không lặp hình 1).
Thân nghiêng trước ~10° (± 0,8°). Chậu thấp nhất sau tiếp đất (hình 2–3, 8–9), cao nhất lúc bay (5–6, 11–12). Tay xa vung ngược pha chân xa
(±38°, khuỷu gập 64–92°); tay gần cầm dao thấp trước hông, chỉ xê dịch ±1,3 px, lưỡi gần ngang (−7° ± 1,5°).
Quỹ đạo cổ chân lúc vung = spline tuần hoàn (scipy CubicSpline) qua 4 điểm chân trụ + 4 điểm neo vung; gối tính bằng IK 2 xương.

## 5. Kế hoạch khi có ảnh ChatGPT

1. Dựng sheet bằng code có sẵn (cùng luật mũ chốt, một tỉ lệ cho cả ảnh):
   ```
   python3 art/huong-moi/lam-tu-the-2/code/dung_thu3.py them chay12 thu12-chay-12o-rig.png 6 2 R1,R2,R3,R4,R5,R6,R7,R8,R9,R10,R11,R12 o ung chay
   ```
   - Lưới **6 cột × 2 hàng** (nếu ChatGPT trả 1 hàng: `12 1`). Chia ô đều theo lưới.
   - Neo y dùng `ung` (đáy ủng = đất). ⚠ Kiểu neo `chay` hiện viết cứng cho 8 hình (ô bay = 4, 8); với 12 hình ô bay là 5, 6, 11, 12 – nếu cần giữ độ
     nhấc lúc bay phải sửa một dòng trong `dung_thu3.py` (lượt sau, khi có ảnh). Không sửa trong lượt này.
2. Trong game: 12 ô chia đều quãng đường **132 px/vòng = 11 px mỗi ô** (pha × 12 thay pha × 8) – chỉ đổi hình, tốc độ 264 px/s giữ nguyên.
3. Claude kiểm từng ô so với `rig-chay-12.json`: độ cao mắt (mục tiêu dao động 3–4 px), cỡ mũ so chốt, mũi ủng trụ có đứng yên không,
   chân gần/xa có đúng thứ tự che. Ô lệch → Prompt B chỉ cho các ô đó.
4. Nếu cách này ổn: làm tiếp chém 1 (6 hình) cùng quy trình.

## 6. Chạy lại

```
pip install pillow numpy scipy
python3 art/huong-moi/rig-tham-chieu/code/rig_chay.py     # chạy từ thư mục tieng-vong-cuoi-cung/
```
Muốn chỉnh: số ở đầu `code/rig_chay.py` (độ dài xương, `NHUN` = nửa biên độ nhún, `NGHIENG`, điểm neo vung chân trong `quy_dao_chan`).
Script in ra nhún chậu/mắt và vị trí chân trụ; báo ⚠ nếu chân phải duỗi quá dài.
