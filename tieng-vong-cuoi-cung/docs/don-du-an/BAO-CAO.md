# Dọn dự án – 02/11/2026

Yêu cầu: "Bỏ bớt thứ không dùng không cần thiết khỏi dự án".
Game nay chỉ chạy qua link web https://tieng-vong-cuoi-cun.web.app/ (GitHub Actions tự kiểm thử và triển khai).

## Cách làm
1. Chạy toàn bộ phép thử và một vòng chơi tự động (Playwright): Vùng 1 P01–P12, trùm, bản đồ, nhật ký, Lattice/Charm,
   lớp sức mạnh, phòng demo, Làng Chuông, tranh mở đầu. Ghi lại **mọi file** trình duyệt tải (1 182 file).
2. Lần theo mọi đường dẫn trong mã, JSON và công cụ dựng phòng (`tools/vung-1/ve-phong.py` vẫn đọc ảnh mảnh ở `tools/phong-demo/` nên giữ).
3. Chỉ xoá thứ **không trang nào tải, không công cụ nào đọc**, và **cũ hơn 24 giờ**. Không chắc thì giữ.

## Dung lượng (phần dự án, không tính lịch sử git)
| | Trước | Sau |
|---|---|---|
| Số file | 2 026 | 1 920 |
| Dung lượng | 176,9 MB | 140,0 MB (giảm ~37 MB) |

Lịch sử git (thư mục `.git`, ~1,9 GB) không đổi: xoá file chỉ làm nhẹ bản tải về/đang làm, không làm nhỏ lịch sử.

## Đã xoá: 106 file
| Nhóm | Số file | Gồm |
|---|---|---|
| Ảnh cũ | 53 | ảnh nguồn giao diện + hiệu ứng thời Lam (`art/giao-dien/nguon`, `art/hieu-ung/nguon` + script tách cũ), Kiếm Khách "vòng 1" bản thử PixelLab, 8 sọ + 2 đoạn dây cũ của phòng demo (phòng demo đã dùng ảnh cảnh ghép sẵn), 3 ảnh iPhone thời Lam |
| Ảnh chụp kiểm thử / tạm | 26 | ảnh chụp duyệt cũ trong `art/kiem-khach-thiet-ke/review` (giữ 7 ảnh mới nhất), ảnh xem trước phòng/báo đòn của công cụ màn (từ nay tự bỏ qua, không đưa vào repo), 1 ảnh chụp phòng demo |
| Mã cũ | 5 | đo animation thời Lam, 3 script chụp ảnh luồng C/D/E, xem nhanh ảnh nướng |
| Tài liệu cũ | 22 | thiết kế đã bỏ: Lam/chibi/demo.html cũ, Chuông Hunter (kế hoạch nâng cấp, sửa animation cũ), đặc tả Thợ Săn Chuông 24×24, liềm 3D + prompt liềm, 10 phản hồi ChatGPT về Lam (`docs/gameplay/PHAN-HOI-11…19, 21`), `.gitignore` của demo cũ |

Sửa thêm: `README.md` viết lại theo cấu trúc hiện tại (bản cũ chỉ tới file không còn tồn tại); `game/thu-mat-na/GHI-CHU.md` ghi mục "liềm" là đã bỏ.

## Giữ lại có chủ đích
- Mọi ảnh gốc ChatGPT `*nguon-chatgpt.png` của ảnh đang dùng; `art/kiem-khach-thiet-ke/master-v1*`, `thiet-ke-goc.png`.
- Ảnh mảnh + ảnh gốc `raw_*` trong `tools/phong-demo/` (công cụ nướng ảnh phòng Vùng 1 còn đọc).
- Mọi file thêm trong 24 giờ qua (780 file), `tools/vung-1/xem`, `docs/yeu-cau-anh`, sổ tay, bảng đối chiếu tiếng Anh, các báo cáo, Firebase, workflow.

## Chưa chắc (giữ lại, bạn quyết sau)
- `art/kiem-khach-thiet-ke/tu-the-*`, `don-x-tu-the/`, `vfx-combo/`, `kiem-31x9.png` – tư thế/hiệu ứng ChatGPT vẽ làm mẫu cho hoạt hình hiện tại; game không tải nhưng có thể cần khi vẽ lại.
- `docs/gdd.md` – thiết kế game đầu tiên (thời Lam/cô bé giữ chuông), phần ý tưởng "Tiếng Vọng" vẫn còn giá trị.
- `docs/KE-HOACH-VONG-THE.md` – kế hoạch đổi nhân vật sang Vọng Thể (30/10), không rõ còn theo không.
- `docs/gameplay/` còn lại: kế hoạch gameplay/4 vũ khí, phản hồi 1–10 (Âm Đao, Bọ, P0), 20, gói `PH20-goi-chatgpt-pixellab/` (có mã demo nhỏ của ChatGPT), 4 ảnh sơ đồ.
- Tư vấn ChatGPT về nhân vật cũ: `samurai-review-chatgpt*.txt`, `hollow-hero-chatgpt.txt`, `danh-gia-demo-kiem-khach-chatgpt.txt`.
- `tools/phong-demo/kiemtra_duongdi.py`, `thu_duongdi_playwright.js`, `BAO-CAO-DUONG-DI.md` – kiểm đường đi phòng demo cũ (phòng demo vẫn còn).
- `tools/vung-1/thu-e.js`, `game/vung-1/cong-cu-man/kiem-tra-d.js` – phép thử luồng E/D cũ, không nằm trong bộ thử chính.
- `game/vung-1/BAO-CAO-A…J.md`, `KIEM-TRA-A.md` – báo cáo từng đợt làm Vùng 1.

## Kiểm thử sau khi xoá
Chạy cùng một bộ trước và sau khi xoá – **kết quả giống hệt**, không phép thử nào đổi:
- Vùng 1: kiem-thu-f 66/66, g 4/4, h 4/4, kiem-tra-vung1 đi đủ P01 → P12 (thiếu hình: không), dây xuyên sàn, công cụ màn `kiem-tra.py`, phép thử luồng A 54/54.
- Sức mạnh: lớp trang bị 33/33, đo neo + kiểm ảnh 6 lớp. Firebase: lõi lưu mây 36/36, trình duyệt 24/24, đăng nhập 28/28.
- Cốt truyện / Làng Chuông 26/26 + 4/4, lưu chung; Hệ thống 45/45 + 24/24; Ẩn 43/43 + 27/27 + 8/8.
- Vòng chơi tự động: **0 lỗi JS, 0 yêu cầu hỏng mới**. Các yêu cầu "không thấy file" còn lại đều có từ trước và là cố ý:
  khung lớp sức mạnh chưa vẽ (game tự ẩn lớp), ảnh đòn `don5` chưa vẽ (game dò xem đã có chưa), ảnh phòng thử T1–T3 (chỉ dùng khi thiếu phòng thật).

## Khôi phục
Mọi thứ đã xoá **vẫn lấy lại được** từ lịch sử git, ví dụ:
`git checkout 676456cf -- tieng-vong-cuoi-cung/<đường-dẫn-file>` (676456cf là bản ngay trước khi dọn).
