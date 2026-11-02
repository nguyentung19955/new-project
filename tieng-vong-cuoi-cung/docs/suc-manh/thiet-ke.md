# Sức mạnh hiện lên người Kiếm Khách – Thiết kế (BẢN NHÁP, chờ ChatGPT duyệt)

> ⚠ Lần chạy 02/11 không có Chrome nên **chưa hỏi được ChatGPT**. Đây là bản nháp để dựng khung kỹ thuật. Câu hỏi soạn sẵn: `cau-hoi-chatgpt.md`; phiên gen ảnh cặp sẽ hỏi và lưu nguyên văn vào `tu-van-chatgpt.txt` (yêu cầu 001). Mọi tầng, lớp, chỉ số dưới đây **sửa theo tư vấn ChatGPT**. Hiện mọi lớp **TẮT** – nhân vật y hệt bản cũ.

## 1. Nghiên cứu nhanh (game tham khảo)
| Game | Cách cho thấy mạnh lên | Bài học |
|---|---|---|
| Terraria | Giáp vẽ thành lớp riêng, khớp từng khung thân (paper-doll) | Lớp phủ từng khung chính xác nhất, nhưng tốn khung |
| Dead Cells | Trang phục = bản phối màu/biến thể cả thân | Đổi cả thân → mất nhận diện, không hợp luật "giữ 100%" |
| Blasphemous | Hình nhân vật gần như không đổi; sức mạnh hiện ở hiệu ứng đòn | Vệt kiếm/hiệu ứng là kênh rẻ (dự án đã có 3 cấp vệt kiếm) |
| Hollow Knight | Bùa không hiện lên người; nâng kiếm không đổi hình | Người chơi vẫn chấp nhận, nhưng thiếu "khoe" |
| Diễn đàn gamedev (paper doll 2D) | Lớp phủ theo khung hoặc gắn theo điểm neo từng khung | Hai kiểu kỹ thuật → hệ thống hỗ trợ cả hai |

Kết luận nháp: chỉ THÊM chi tiết nhỏ, cùng bảng màu, ở chỗ dễ thấy (mặt nạ – điểm nhận diện chính; ngực; sau lưng), không đổi silhouette gốc.

## 2. Tầng tiến hoá (nháp)
| Cấp | Tên | Lớp hiện | Điều kiện (nháp) |
|---|---|---|---|
| 0 | Tro Lặng | (gốc) | – |
| 1 | Tiếng Nứt | `mat-na-nut-1` | hạ trùm Vùng 1 |
| 2 | Vang Âm | `mat-na-nut-2` + `an-giap` | trùm Vùng 1 + 3 tinh anh |
| 3 | Cộng Hưởng | `mat-na-nut-3` + `khan-ngan` | hạ 2 trùm vùng |

Trang bị gắn riêng: `chuong-hong` (chuông nhỏ đeo hông, kiểu neo) – gắn theo Âm Phù qua `theo_am_phu`.
Chỉ số: **để phiên "do" lo** (`MocHeThong.ht.chiSo()`), tránh cộng 2 lần. `chi_so` trong trang-bi.json chỉ là gợi ý, `ap_chi_so: false`.

## 3. Kỹ thuật (đã làm)
- `game/thu-mat-na/lop-trang-bi.js` + dữ liệu `game/thu-mat-na/trang-bi.json`.
- Ảnh lớp: `art/kiem-khach-lop/<id>/<thư mục clip gốc>/fNN.png` – 256×256, chân [128,172], quay phải, **đúng số khung clip gốc**, chỉ chứa phần THÊM (nền trong suốt). Clip thiếu ảnh → lớp ẩn ở clip đó.
- Kiểu `khung` (lớp phủ từng khung) và kiểu `neo` (1 ảnh nhỏ `neo00.png` + điểm neo `[x,y]` cho từng khung trong `neo.<clip>`).
- `z: "sau"` vẽ trước thân (sau lưng), `"truoc"` vẽ sau thân. Cùng `khe` → lớp sau thay lớp trước (vd 3 mức nứt mặt nạ).
- Lật, loé trắng khi trúng đòn, mờ khi chết: dùng chung `SpriteMN.ve` nên khớp thân tuyệt đối.
- **Bật một lớp**: ảnh XONG → kiểm `python3 tools/suc-manh/kiem-anh-lop.py <id>` → ghi `"co_anh": true` cho lớp đó trong trang-bi.json. Chưa ghi thì không tải gì cả (0 yêu cầu mạng).
- Thử: `game/phong-demo/index.html?trangbi=mat-na-nut-1` hoặc `?sucmanh=2` (chỉ có tác dụng với lớp đã bật).
- Cầu nối phiên "do": `"tu_dong_cap": true` → cấp = `MocHeThong.ht.capSucManh()`; `"theo_am_phu": {"<mẫu>": "<id lớp>"}` → Âm Phù đang cắm hiện lớp. Mặc định tắt.

## 4. Chi phí vẽ (nháp – chờ ChatGPT tối giản)
Clip ưu tiên: dung 4 · chay 8 · nhay 4 · don1 8 · don2 8 · don4 9 = **41 khung/lớp**; thêm roi 1 · tiepdat 3 · luot 6 · trungdon 6 = 57.
Ý tưởng giảm công (hỏi ChatGPT): ChatGPT vẽ chi tiết 1 lần trên khung đứng phóng to → công cụ dời chi tiết theo vị trí mặt nạ/ngực từng khung (dò bằng so khớp ảnh) → ChatGPT/PixelLab sửa các khung xoay mạnh. Lớp kiểu neo (chuông) chỉ cần 1 ảnh + bảng điểm neo.
