# Báo cáo phiên Cốt truyện + Điểm khởi đầu (cottruyen) – 02/11/2026

## Vướng chính
Lần chạy này chạy trên máy chủ đám mây theo lịch, **không có Claude in Chrome** → không mở được ChatGPT/PixelLab.
Theo luật "tham khảo ChatGPT 100% khi lên kế hoạch", phiên **chưa** viết cốt truyện, hội thoại, bố cục làng hay điều kiện mở vùng.
Câu hỏi lên kế hoạch đã soạn sẵn ở `docs/cot-truyen/cau-hoi-chatgpt.md` – lần chạy có Chrome chỉ việc dán vào ChatGPT.
Vì chưa xong việc nên **chưa ghi** `docs/yeu-cau-anh/cottruyen/HET.md`.

## Đã làm (phần kỹ thuật, không cần hình)
- `game/luu-chung.js` – **lưu chung** giữa các vùng (khoá `tvcc-chung`): hồi truyện, cờ cốt truyện, đoạn đã xem, vùng đã mở/đã vào, điểm quay về, kho chung, Mảnh Ký Ức. Bản lưu hỏng / bị chặn localStorage vẫn chạy. Vùng 1 luôn mở.
- **Móc vào Vùng 1** (3 dòng, chỉ thêm, có điều kiện `if (window.LuuChung)`): nạp script; khi bắt đầu chơi ghi "đã vào Vùng 1"; khi hạ trùm ghi cờ `ha_trum:vung-1` (dùng để mở vùng sau).
- `game/cot-truyen/hop-thoai.js` – **hộp thoại dùng chung** (chữ gõ dần, chân dung, lựa chọn, đặt cờ truyện). Chỉ vẽ ảnh ChatGPT + chữ; **thiếu ảnh khung/chân dung thì tự tắt**.
- `game/cot-truyen/tram-dich-chuyen.json` + `tram.js` – **trạm teleport**: 8 vùng theo gdd, gộp với `game/the-gioi.json` khi phiên Vùng mới tạo; hiện chỉ Vùng 1 (Rễ Mục) đi được, vùng khác khoá (điều kiện chờ ChatGPT).
- `game/lang-chuong/index.html` – trang Làng Chuông: chưa có ảnh cảnh làng nên **chỉ báo chữ "chưa mở"**, không dựng màn bằng code.
- Yêu cầu ảnh cho phiên gen ảnh (chắc chắn cần dù kế hoạch thế nào): `001-khung-hop-thoai.md`, `002-chan-dung-ba-ngan.md` (CHỜ).
- Lưu ý: `art/lang-hoan-thien/` có NPC/chân dung kiểu chibi cũ (Bà Ngân, Thợ Rèn, bóng trùm chuông) – khác phong cách hiện tại, không dùng; để ChatGPT quyết có tham khảo hay không.

## Kiểm thử
- `node tools/cot-truyen/kiem-thu-luu-chung.js` – 22/22 đạt (lưu chung, điều kiện mở, trạm, luồng hộp thoại).
- `node tools/cot-truyen/kiem-tra-trinh-duyet.js` (Playwright) – 4/4: Vùng 1 ghi lưu chung, Làng tắt khi thiếu ảnh, chỉ Vùng 1 đi được, không lỗi JS.
- Vùng 1 sau khi móc: kiem-thu-f 66/66, kiem-thu-g hỏng 0, kiem-thu-h hỏng 0, kiem-tra-vung1 đi đủ P01→P12, không lỗi JS.

## Việc lần sau (cần Chrome)
1. Gửi `cau-hoi-chatgpt.md`, lưu `docs/cot-truyen/ke-hoach-chatgpt.txt`.
2. Viết hội thoại/cutscene vào `game/cot-truyen/hoi-thoai/`, điều kiện mở vùng vào `tram-dich-chuyen.json`.
3. Ghi yêu cầu ảnh: cảnh làng, nhân vật phụ (đứng/nói), cổng teleport + hiệu ứng, ảnh cutscene.
4. Có ảnh rồi mới dựng màn làng, nút "Về Làng" ở Chuông Lưu Vùng 1, rồi ghi HET.md.
