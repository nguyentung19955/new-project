# Báo cáo phiên Cốt truyện + Điểm khởi đầu (cottruyen)

## Lần chạy 2 (02/11/2026, theo lịch, trên máy chủ đám mây – không có Chrome)
Kế hoạch ChatGPT đã có (`docs/cot-truyen/ke-hoach-chatgpt.txt`, phiên chính hỏi hộ) → lần này **làm theo đúng kế hoạch đó**, không tự nghĩ thêm truyện.
Lời thoại, tên cảnh, phụ đề mở đầu, điều kiện mở vùng đều chép nguyên văn từ kế hoạch ChatGPT. Tên vùng/nhân vật theo `docs/tieng-anh/BANG-DOI-CHIEU.md`.

### Đã làm
- **Làng Chuông chơi được ngay khi có ảnh** – `game/lang-chuong/` (index.html + lang.js + bố cục lang.json):
  5 màn ngang nối liền, Kiếm Khách (đúng sheet đã chốt) đi trái/phải; lại gần nhân vật phụ → "Talk"; lại gần The Rootbound Bell → "Ring the bell"
  → chuông chạy hoạt cảnh kích hoạt (ảnh ChatGPT 003) → menu chọn vùng → hiệu ứng dịch chuyển (ảnh 004) → sang Vùng 1.
  Từ vùng về làng: hiện cạnh chuông kèm hiệu ứng dịch chuyển chạy ngược. Điện thoại: kéo nửa trái để đi, vuốt dọc để chọn, nút Talk/OK/Skip.
- **Mở đầu "The First Silence"** – `game/cot-truyen/canh.js` (máy chiếu cảnh dùng chung) + `canh/mo-dau.json` (7 tranh, 33 s, Skip, xem lại ở chuông).
- **Hội thoại làng** – `game/cot-truyen/hoi-thoai/`: Vesper, Tock, Morrow, Kaelith, mỗi người 2 đoạn (lần đầu / sau khi hạ trùm Vùng 1).
  Vesper có lựa chọn "I will listen. / Not yet." (đặt cờ truyện). Lựa chọn "View wares" của Tock **để tắt** vì chưa có cửa hàng bản đồ.
- **Điều kiện mở 8 vùng** theo kế hoạch ChatGPT – `game/cot-truyen/tram-dich-chuyen.json` (vd: hạ Hollow Bell Mother → mở Abandoned Bronzeworks). Vùng chưa dựng thì luôn khoá.
- **Vùng 1 ↔ Làng**: `game/cot-truyen/moc-vung-1.js` (1 dòng script trong vung-1/index.html): bảng Rest Bell có thêm nút **"Return to Bell Village"** – chỉ hiện khi làng đã thật sự mở (đủ ảnh). Chưa có làng → Vùng 1 y hệt cũ.
- Hộp thoại: lựa chọn đặt được cờ riêng; khi không có chân dung thì chữ không đè lên hoạ tiết khung.
- **Yêu cầu ảnh mới (CHỜ) cho phiên gen ảnh**: 006 cảnh làng 5 nền + 5 tiền cảnh · 007 nhân vật phụ đứng trong cảnh · 008 chân dung Kaelith · 009 khung menu teleport · 010 bảy tranh mở đầu · 011 chuông neo cho vùng mới.

### Luật hình được giữ thế nào
Không vẽ gì bằng code. Thiếu ảnh nền làng → trang làng **chỉ báo chữ** "not open yet" (như hiện tại). Thiếu dáng đứng/chân dung của ai → riêng người đó ẩn.
Thiếu tranh mở đầu → bỏ qua mở đầu. Thiếu khung menu (009) → menu dùng khung hộp thoại ChatGPT đã có.

### Kiểm thử (đều đạt)
- `node tools/cot-truyen/kiem-thu-luu-chung.js` – 48/48 (thêm: lựa chọn đặt cờ, hội thoại thật ≤ 90 ký tự + đủ ảnh chân dung, mở đầu 7 tranh/33 s/Skip, điều kiện mở vùng).
- `node tools/cot-truyen/kiem-tra-lang.js <thư-mục-ngoài-repo>` (Playwright) – 25/25: thiếu ảnh → làng tắt; với **ảnh giả một màu chỉ dùng trong phép thử** (sinh ngoài repo,
  không vào game): mở đầu → Skip → nói chuyện Vesper + chọn → rung chuông → menu → dịch chuyển → sang Vùng 1; về từ Vùng 1 → thoại "sau Vùng 1"; menu khung riêng; nút về làng ở Rest Bell.
  Đã tự xem ảnh chụp (khung hộp thoại + chân dung Vesper, chuông kích hoạt, hiệu ứng dịch chuyển, nút ở Rest Bell).
- `node tools/cot-truyen/kiem-tra-trinh-duyet.js` – 4/4.
- Vùng 1 sau khi móc: kiem-thu-f 66/66, kiem-thu-g hỏng 0, kiem-thu-h hỏng 0, kiem-tra-vung1 đi đủ P01→P12, thiếu hình: không.
  (Dòng "ERR_TUNNEL_CONNECTION_FAILED" là do máy chủ đám mây không tải được tài nguyên ngoài – có y hệt khi bỏ thay đổi của phiên này.)

### Chưa xong / lần sau
1. Chờ phiên gen ảnh làm 006–011. Có ảnh là làng tự bật, không cần sửa code; nếu mặt đất trong ảnh nền không ở y = 468 thì sửa `mat_dat` trong `game/lang-chuong/lang.json`.
2. Kể chuyện trong Vùng 1 (Sprint C của kế hoạch ChatGPT): 2 bia đá, ký ức sau trùm "She was not guarding the path. She was guarding a song." – cần sửa phòng Vùng 1, để lần sau.
   Mảnh Ký Ức: phiên "an" đã ghi vào lưu chung (`LuuChung.nhatKyUc`), dùng chung với cốt truyện.
3. Cửa hàng bản đồ của Tock (lựa chọn "View wares"), 4 cuộc đua Kaelith, Hồi II–III, 3 kết: chờ các vùng mới.
4. Chưa ghi `docs/yeu-cau-anh/cottruyen/HET.md` vì còn yêu cầu ảnh đang chờ và còn việc cần thêm ảnh (Sprint C).

---
## Lần chạy 1 (02/11/2026) – tóm tắt
Không có Chrome nên chưa hỏi được ChatGPT; làm phần kỹ thuật: `game/luu-chung.js` (lưu chung giữa các vùng: hồi truyện, cờ, vùng đã mở, kho chung, Mảnh Ký Ức),
móc Vùng 1 ghi "đã vào" + "hạ trùm", `game/cot-truyen/hop-thoai.js` (hộp thoại dùng chung, thiếu ảnh tự tắt), `tram.js` (trạm teleport đọc `game/the-gioi.json`).
