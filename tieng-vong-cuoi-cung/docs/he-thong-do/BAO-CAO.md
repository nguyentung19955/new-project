# Báo cáo phiên "Hệ thống đồ / animation mở khoá" – 02/11 (lần 1)

## Điều quan trọng nhất
Lần này phiên chạy trên mây theo lịch, **không nối được máy/Chrome của bạn → không hỏi được ChatGPT**. Theo luật "tư vấn ChatGPT 100%" và "chưa có ảnh thì chưa bật", mình chỉ dựng **khung kỹ thuật** và để **TẮT mặc định** – Vùng 1 chơi y hệt cũ.

## Đã làm
- **game/he-thong/**: điểm **Âm Điểm** khi hạ quái → lên cấp → **Nốt Ngân** → mở nút cây **Dây Ngân** (3 nhánh Lưỡi / Vọng / Thân, 8 nút); **Âm Phù** có 4 độ hiếm (Thường / Hiếm / Huyền Thoại / Vọng Cổ) + 1–3 dòng phụ ngẫu nhiên, cắm vào Dây Ngân 3 ô; lưu riêng, không đụng bản lưu Vùng 1.
- **Chơi thử**: mở `game/vung-1/index.html?hethong=1` → nghỉ ở Chuông Lưu có thêm nút "Dây Ngân" (nút to ≥ 58 px). Chạy được ngay (dùng hình đã có): rèn kiếm Sơ Âm → Vang Âm → Cộng Hưởng (sát thương 10 → 13 → 16), +15% Mảnh Âm, +20% Âm Điểm, +8 khung bất tử.
- **Tự tắt khi chưa có ảnh**: Nhát Thứ Năm, Vệt Ngân Sáng, Dáng đứng Thức Tỉnh (ghi "Chờ hình"); Âm Phù không rơi cho tới khi có biểu tượng + khung độ hiếm. Đã thử giả lập: khi có ảnh `art/kiem-khach/don5/`, combo tự thành 5 nhát (don1→don2→don4→don5).
- **Câu hỏi ChatGPT soạn sẵn**: docs/he-thong-do/cau-hoi-chatgpt.md (vòng lặp 3 tầng, cân bằng, mốc mở khoá, hình ảnh nhỏ thấy được, giao diện iPhone, game tham khảo). Bản nháp thiết kế: thiet-ke.md.
- **Yêu cầu cho phiên gen ảnh cặp** (docs/yeu-cau-anh/do/): 001 nhờ hỏi ChatGPT giúp bộ câu hỏi trên (lưu tu-van-chatgpt.txt), 002 biểu tượng 5 Âm Phù, 003 khung 4 độ hiếm, 004 animation Nhát Thứ Năm, 005 vệt kiếm Ngân Sáng, 006 dáng đứng mới.
- **Kiểm thử**: logic 22/22, Vùng 1 + hệ thống 11/11 (`tools/he-thong/`); phép thử cũ Vùng 1 vẫn đạt (f 66/66, g, h, kiem-tra-vung1 – không lỗi JS).

## Việc lần sau (cần Chrome)
1. Hỏi ChatGPT bằng cau-hoi-chatgpt.md → lưu tu-van-chatgpt.txt → sửa du-lieu.json + thiet-ke.md theo tư vấn.
2. Nhận ảnh 002–006 → bật rơi Âm Phù, túi đồ có biểu tượng, nhát 5, vệt kiếm, dáng đứng; khung giao diện do ChatGPT vẽ thay khung chữ.
3. Khi ChatGPT duyệt số liệu → đổi `bat_mac_dinh` thành true.
Chưa ghi HET.md vì sau tư vấn ChatGPT có thể còn yêu cầu ảnh mới.
