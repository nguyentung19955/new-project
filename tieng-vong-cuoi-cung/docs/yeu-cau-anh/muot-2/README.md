> **02/11 – NGƯỜI DÙNG YÊU CẦU XOÁ HẾT QUÁI CŨ** (Phu Đèn Lạc `phu`, Bọ Vỏ Mộc `bo`, Dơi Rễ `doi`, Nấm Thở `nam`, Chuông Kén Nứt `chuong`): đã xoá ảnh `art/quai-moi/{phu,bo,doi,nam,chuong}`, mục trong `quai.json`, yêu cầu 007–012, 022, 025 và mục lắp tương ứng. Game chỉ còn 5 quái mới: `cau`, `vai`, `tang`, `ken`, `tan`. KHÔNG tạo lại yêu cầu cho quái cũ.

# Yêu cầu ảnh – MƯỢT MỨC 2 (thêm khung chuyển tiếp)
Nguồn: `docs/duyet-anim-02-11/tu-van-chatgpt.md` (ChatGPT duyệt 17 nhóm). Người dùng đã đồng ý làm mức 2 (02/11).

**Phân công:** phiên MƯỢT-2 (không có Chrome) ghi yêu cầu + ảnh tham chiếu → **phiên chính** (có ChatGPT) vẽ → lưu `art/muot-2/<tên>/moi-NN.png` (hoặc `thay-NN.png`) → đổi Trạng thái thành `XONG` + push → phiên MƯỢT-2 lắp vào game, kiểm, push.

**Cách vẽ (phiên chính):** mỗi yêu cầu 1 cuộc trò chuyện ChatGPT MỚI; gửi ảnh `NNN-<tên>-thamchieu.png` + prompt trong file. Ảnh tham chiếu = các khung có sẵn và ô viền đứt (khung cần vẽ), phóng ×3 nearest, nền #FF00FF; dấu "+" trong ô trống = neo chân. Tách nền magenta, thu ÷3 nearest về cỡ cửa sổ ghi trong file, dán vào ô gốc trong suốt đúng toạ độ.

**Luật cứng:** giữ nguyên 100% thiết kế Kiếm Khách và quái (màu, cỡ, chi tiết, khung gốc). Chỉ CHÈN khung mới hoặc THAY khung lỗi. Không vẽ bằng code, không nội suy pixel.

**Trạng thái:** CHỜ → ĐANG LÀM (phiên chính) → XONG (phiên chính) → ĐÃ LẮP (phiên MƯỢT-2). Ảnh không khớp → VẼ LẠI (kèm lý do).

| Số | Việc | Ưu tiên | Trạng thái |
|---|---|---|---|
| 001 | Kiếm Khách – đòn 4 (nhát kết): 2 khung giữa F4→F5→F6 | P0 | ĐÃ LẮP |
| 002 | Kiếm Khách – đập đất: 1 khung chuyển giữa F3–F4 | P0 | ĐÃ LẮP |
| 003 | Kiếm Khách – chém xoay trên không: 1 khung xoay giữa F2–F3 | P0 | ĐÃ LẮP |
| 004 | Kiếm Khách – chết: sửa F3 + 1 khung khuỵu giữa F3–F4 | P0 | ĐÃ LẮP |
| 005 | Kiếm Khách – lướt: 2 khung đứng dậy giữa F4–F5 | P0 | ĐÃ LẮP |
| 006 | Kiếm Khách – tiếp đất: 1 khung đứng dậy giữa F1–F2 | P0 | ĐÃ LẮP |
| 013 | Khuyết Cẩu – đánh: VẼ LẠI F3 và F7 | P0 | ĐÃ LẮP |
| 014 | Vọng Tàn – di: VẼ LẠI F0 (khung chuyển trọng lượng sai) | P0 | ĐÃ LẮP |
| 015 | Vọng Tàn – đánh: 1 khung chuông giữa đường F4–F5 | P0 | ĐÃ LẮP |
| 016 | Hồn Vải – chết: 1 khung giữa F6–F7 | P0 | ĐÃ LẮP |
| 017 | Kèn Câm – đánh: 1 khung nâng kèn giữa F5–F6 | P0 | ĐÃ LẮP |
| 018 | Màn Tang – chết: 2 khung đang rơi giữa F3–F4 | P0 | ĐÃ LẮP |
| 019 | Màn Tang – vồ: 1 khung lao nửa đường giữa F6–F7 | P0 | ĐÃ LẮP |
| 020 | Kiếm Khách – chém xoay: khung xoay thứ 2 giữa F3–F4 | P1 | ĐÃ LẮP |
| 021 | Kiếm Khách – trúng đòn: VẼ LẠI F2 và F4 | P1 | ĐÃ LẮP |
| 023 | Khuyết Cẩu – chết: 1 khung gục giữa F5–F6 | P1 | ĐÃ LẮP |
| 024 | Kèn Câm – chết: 1 khung khuỵu gối giữa F5–F6 | P1 | ĐÃ LẮP |

(007–012, 022, 025 đã bị xoá cùng 5 quái cũ theo yêu cầu người dùng.) Báo cáo: docs/muot-2/BAO-CAO.md

Thứ tự vẽ: 001→019 (P0) rồi 020→025 (P1). File HET.md = không còn yêu cầu mới.

## Ghi chú cho phiên chính (phiên MƯỢT-2 rút ra khi lắp, 02/11)
- Phiên lắp tự đưa màu về đúng bảng màu gốc của nhân vật/quái, nên ảnh **nhòe/tô mịn** sau khi ép bảng màu sẽ thành **lấm tấm hạt** → bị trả "VẼ LẠI". Nguyên nhân hay gặp: thu nhỏ ảnh ChatGPT bằng nội suy hoặc sai bội số điểm ảnh.
- Cách tránh: (1) prompt luôn thêm "same 1-pixel near-black outline, flat crisp pixel shading, no blur, no noise"; (2) đo cỡ "điểm ảnh thật" của ảnh ChatGPT (thường 3–4 px/điểm) rồi thu bằng NEAREST đúng bội số đó; (3) so cạnh khung gốc trên nền tối trước khi ghi XONG.
- Kiếm Khách (001–006) đạt tốt; quái nhỏ (76–112 px) dễ nhòe nhất.
